package com.netposa.gis.server.service;

import com.netposa.gis.server.bean.*;
import com.netposa.gis.server.dao.DAOFactory;
import com.netposa.gis.server.dao.IBaseDAO;
import com.netposa.gis.server.dao.IPoolBaseDAO;
import com.netposa.gis.server.exception.DataAccessException;
import com.netposa.gis.server.utils.NetposaHelper;
import com.netposa.gis.server.utils.SpringUtil;
import com.vividsolutions.jts.geom.Coordinate;
import com.vividsolutions.jts.geom.Geometry;
import com.vividsolutions.jts.geom.GeometryFactory;
import com.vividsolutions.jts.geom.LineString;
import com.vividsolutions.jts.io.ParseException;
import com.vividsolutions.jts.io.WKTReader;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.geotools.feature.FeatureIterator;
import org.geotools.filter.text.cql2.CQLException;
import org.geotools.geometry.jts.JTSFactoryFinder;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.opengis.feature.simple.SimpleFeature;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.Charset;
import java.sql.SQLException;
import java.text.MessageFormat;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 查询service...
 * 
 * @author
 * 
 */
@Service("queryService")
public class QueryService extends BaseServiceImpl {
	private static final Log LOGGER = LogFactory.getLog(QueryService.class);
	private String splitWord = "|";
	private int maxResult = 20;
	private int rowIndex = 1;
	private int totalSize = 0;

	// 全文检索
	private static final String FULL_TEXT_SEEARCH = "fts";

	// 省级行政区划码验证正则表达式
	private static final String PRIVINCE_REG = "^[1-9][0-9]0{4}(0{3}){0,2}$";
	// 市级 行政区划码验证正则表达式
	private static final String CITY_REG = "^[1-9][0-9](0[1-9]|[1-9]0|[1-9][1-9])0{2}(0{3}){0,2}$";
	// 县级 行政区划码验证正则表达式 610102
	private static final String DISTRICT_REG = "^[1-9][0-9](0[1-9]|[1-9]0|[1-9][1-9]){2}(0{3}){0,2}$";
	// 街道办级 行政区划码验证正则表达式
	private static final String TOWN_REG = "^[1-9][0-9](0[1-9]|[1-9]0|[1-9][1-9]){2}[0-9]{2}[1-9]{1}(0{3}){0,1}$";

	// 香港区县
	private static final String DISTRICT_REG2 = "^8100[0-9]{2}$";
	// 直辖市
	private static final List<String> ZXS_CODE = new ArrayList<String>() {
		private static final long serialVersionUID = 1L;

		{
			add("110000");
			add("120000");
			add("310000");
			add("500000");
			add("810000");
			add("820000");
		}
	};

	/**
	 * 道路和多边形的交点
	 * 
	 * @param wkt
	 * @return
	 * @throws ParseException
	 */
	public DataResult roadInterByGeo(String wkt) {
		DataResult result = new DataResult();

		if (NetposaHelper.isEmpty(wkt)) {
			result.setError("参数 wkt 不能为空");
			return result;
		}

		String layerName = QueryParameterCollection.getInstance()
				.getTableNameByKey(TableKeyEnum.ROADNET);
		if (NetposaHelper.isEmpty(layerName)) {
			LOGGER.error("没有配置路网表");
			result.setError("没有配置路网表");
			return result;
		}

		JSONArray results = new JSONArray();
		LineString lineBoundary = createBoundary(wkt);

		FeatureIterator<SimpleFeature> iter = null;

		if (networkGraph == null) {
			reloadConnInfo("all");
		}

		try {
			iter = this.getFeatureSource(layerName).getFeatures().features();

			while (iter.hasNext()) {
				SimpleFeature feature = iter.next();
				if (feature.getProperty("geom") != null) {
					Geometry roadGeo = (Geometry) feature.getDefaultGeometry();
					if (lineBoundary.intersects(roadGeo)) {
						String roadName = feature.getProperty("name")
								.getValue().toString();
						// 相交点
						Geometry interPointsGeo = lineBoundary
								.intersection(roadGeo);
						results = interGeoToJson(roadName, interPointsGeo,
								results);
					}
				}
			}

		} catch (IOException e) {
			LOGGER.error(e);
			result.setError("查询路网 feature 出错!");
		} finally {
			if (iter != null) {
				iter.close();
			}
		}
		result.setData(results);

		return result;
	}

	/**
	 * 查询道路数据，使用 ST_Union 合并路网数据。eg:select
	 * name,quanpin,szm,ST_Multi(ST_Union(geom)) as geom INTO changzhou_road
	 * from changzhou_roadnet group by name,quanpin,szm;
	 * 
	 * @param roadName
	 * @param layerName
	 * @return
	 * @throws ParseException
	 * @throws SQLException
	 */
	@SuppressWarnings("unchecked")
	public JSONArray getRoadsByName(String roadName, String layerName)
			throws ParseException, SQLException {
		JSONArray array = new JSONArray();

		StringBuilder sql = new StringBuilder(
				"SELECT name,districtname,st_asewkt(GEOM) AS wkt ")
				.append(getPpd(roadName)).append(" FROM ").append(layerName)
				.append(" WHERE ").append(getWhereSql(roadName, "name"))
				.append(" ORDER BY rank DESC limit 10");

		DAOFactory poolDAOFactory = DAOFactory.getDAOFactory(DAOFactory.POOL);

		IPoolBaseDAO dao = (IPoolBaseDAO) poolDAOFactory.getBaseDao();

		try {

			List<JSONObject> list = (List<JSONObject>) dao.find(sql.toString());
			if (!list.isEmpty()) {

				for (int i = 0; i < list.size(); i++) {
					JSONObject obj = list.get(i);
					String nameString = (String) obj.get("name");
					String wellKnownText = (String) obj.get("wkt");
					String districtname = (String) obj.get("districtname");
					Geometry geo = NetposaHelper.fromWkt(wellKnownText);

					geo = lineToMulti(geo);

					JSONObject jobject = new JSONObject();

					jobject.put("name", nameString);
					jobject.put("districtname", districtname);
					jobject.put("feature", NetposaHelper.geomoterJson(geo));
					array.add(jobject);
				}
			}

		} catch (Exception e) {
			LOGGER.error(e);
		}

		return array;
	}

	/**
	 * 关键字查询 poi、道路和路口，取匹配度最高的数据， 查询关键字是中文时按照name字段查询，是英文时按照 quanpin 或者 szm 字段查询
	 * 
	 * @param keyWordString
	 *            查询关键字
	 * @param queryPlan
	 *            查询计划：normal 普通、fts 全文检索，默认normal
	 * @param maxResult
	 *            返回记录数，默认10
	 * 
	 * @return JSONArray 实例
	 */
	@SuppressWarnings("unchecked")
	public JSONArray getFOIByName(String keyWordString, String queryPlan,
			String maxResult) {
		JSONArray jsonArray = new JSONArray();

		String querySQL = this.getQueryFOIByNameForPageSQL(keyWordString,
				Integer.parseInt(maxResult), 1, queryPlan);

		if (querySQL.length() == 0) {
			return jsonArray;
		}

		DAOFactory poolDAOFactory = DAOFactory.getDAOFactory(DAOFactory.POOL);
		IPoolBaseDAO dao = (IPoolBaseDAO) poolDAOFactory.getBaseDao();

		List<JSONObject> list;
		try {
			list = (List<JSONObject>) dao.find(querySQL);
			for (JSONObject obj : list) {
				String type = (String) obj.get("type");
				if ("road".equals(type)) {
					obj.put("feature", obj.get("wkt"));
					obj.remove("wkt");
				}

				jsonArray.add(obj);
			}
		} catch (SQLException e) {
			LOGGER.error(e);
		}

		return jsonArray;
	}

	/**
	 * 查询路口，支持中文、全拼和首字母匹配度检索
	 * 
	 * @param roadName
	 *            查询关键字
	 * @param layerName
	 *            表名称
	 * @return
	 * @throws SQLException
	 */
	@SuppressWarnings("unchecked")
	public JSONArray getRoadCrossByName(String roadName, String layerName)
			throws SQLException {
		JSONArray array = new JSONArray();
		if (roadName.length() == 0 || layerName.length() == 0) {
			return array;
		}

		StringBuilder sql = new StringBuilder();
		sql.append("SELECT DISTINCT x as lon,y as lat,name ");
		sql.append(getPpd(roadName));
		sql.append(" FROM ");
		sql.append(layerName);
		sql.append(" WHERE ");
		sql.append(getWhereSql(roadName, "name"));
		sql.append(" ORDER BY rank DESC LIMIT 500");

		DAOFactory poolDAOFactory = DAOFactory.getDAOFactory(DAOFactory.POOL);

		IPoolBaseDAO dao = (IPoolBaseDAO) poolDAOFactory.getBaseDao();

		try {
			List<JSONObject> list = (List<JSONObject>) dao.find(sql.toString());

			if (!list.isEmpty()) {
				for (int i = 0; i < list.size(); i++) {
					array.add(list.get(i));
				}
			}

		} catch (Exception e) {
			LOGGER.error(e);
		}

		return array;
	}

	/*
	 * 根据名称查询兴趣点信息。 layerName为指定查询 表名称 keyWordString 为查询关键字，支持中文，拼音检索 返回
	 */
	/**
	 * 查询兴趣点信息，支持中文、全拼和首字母匹配度检索
	 * 
	 * @param layerName
	 *            表名称
	 * @param keyWordString
	 *            关键字
	 * @param maxResult
	 *            最大结果条数
	 * @param rowIndex
	 *            起始条数
	 * @param columnName
	 *            主查询字段，默认name,可以指定其它字段 * @param poiType POI 类型
	 * @return
	 * @throws CQLException
	 * @throws IOException
	 * @throws SQLException
	 */
	@SuppressWarnings("unchecked")
	public JSONObject queryPOIByName(String layerName, String keyWordString,
			int maxResult, int rowIndex, String columnName, String poiType,
			String queryPlan) throws CQLException, IOException, SQLException {
		this.maxResult = maxResult;
		this.rowIndex = rowIndex;
		List<JSONObject> list = new ArrayList<>();
		JSONObject obj = new JSONObject();
		obj.put("pageIndex", rowIndex);
		obj.put("pageSize", this.maxResult);

		if (keyWordString.length() == 0 && poiType.length() == 0) {
			obj.put("features", list);
			return obj;
		}

		this.totalSize = 0;
		obj.put("totalCount", this.totalSize);
		obj.put("pageCount",
				this.totalSize % this.maxResult == 0 ? this.totalSize
						/ this.maxResult : this.totalSize / this.maxResult + 1);

		String sql = "select  gid,name,type,r_addr as address, districtName,ST_asgeojson(geom) as geometry "
				+ getPpd(keyWordString)
				+ " FROM "
				+ layerName
				+ " WHERE "
				+ getPOIWhereSql(keyWordString, columnName, poiType, queryPlan)
				+ " ORDER BY rank DESC "
				+ " limit "
				+ this.maxResult
				+ " offset " + (this.rowIndex - 1) * this.maxResult;

		DAOFactory poolDAOFactory = DAOFactory.getDAOFactory(DAOFactory.POOL);

		IPoolBaseDAO dao = (IPoolBaseDAO) poolDAOFactory.getBaseDao();
		try {
			list = (List<JSONObject>) dao.find(sql);
			obj.put("features", list);
		} catch (Exception e) {
			LOGGER.error(e);
		}

		return obj;
	}

	private JSONObject getNearRoadCross(String point, String roadCross,
			String extent) {
		StringBuilder sb = new StringBuilder();

		sb.append("SELECT ");
		sb.append("gid, ");
		sb.append("NAME, ");
		sb.append("''  AS address, ");
		sb.append("'' AS districtName, ");
		sb.append("ST_asgeojson (geom) AS geometry, ");
		sb.append("ST_DISTANCE ( ");
		sb.append("	geom, ");
		sb.append("	ST_GeomFromText ( ");
		sb.append("		'" + point + "' ");
		sb.append(")");
		sb.append(") AS distance ");
		sb.append("FROM ");
		sb.append("(");
		sb.append("	SELECT ");
		sb.append("		* ");
		sb.append("FROM ");
		sb.append(roadCross);
		sb.append(" WHERE ");
		sb.append("ST_INTERSECTS ( ");
		sb.append("geom, ");
		sb.append("ST_GeomFromText ( ");
		sb.append("'" + extent + "' ");
		sb.append(") ");
		sb.append(") ");
		sb.append(") AS newTable ");
		sb.append("ORDER BY ");
		sb.append("distance ASC ");
		sb.append("LIMIT 1 ");
		DAOFactory poolDAOFactory = DAOFactory.getDAOFactory(DAOFactory.POOL);
		String sqlString = sb.toString();
		IPoolBaseDAO dao = (IPoolBaseDAO) poolDAOFactory.getBaseDao();
		JSONObject obj = null;
		try {
			List<JSONObject> list = (List<JSONObject>) dao.find(sqlString);
			if (!list.isEmpty()) {
				obj = list.get(0);
			}
		} catch (Exception e) {
			LOGGER.error(e);
		}

		return obj;
	}

	public double GetJiaoDu(double lat1, double lng1, double lat2, double lng2) {
		double x1 = lng1;
		double y1 = lat1;
		double x2 = lng2;
		double y2 = lat2;
		double pi = Math.PI;
		double w1 = y1 / 180 * pi;
		double j1 = x1 / 180 * pi;
		double w2 = y2 / 180 * pi;
		double j2 = x2 / 180 * pi;
		double ret;
		if (j1 == j2) {
			if (w1 > w2)
				return 270; // 北半球的情况，南半球忽略
			else if (w1 < w2)
				return 90;
			else
				return -1;// 位置完全相同
		}
		ret = 4
				* Math.pow(Math.sin((w1 - w2) / 2), 2)
				- Math.pow(
						Math.sin((j1 - j2) / 2) * (Math.cos(w1) - Math.cos(w2)),
						2);
		ret = Math.sqrt(ret);
		double temp = (Math.sin(Math.abs(j1 - j2) / 2) * (Math.cos(w1) + Math
				.cos(w2)));
		ret = ret / temp;
		ret = Math.atan(ret) / pi * 180;
		if (j1 > j2) // 1为参考点坐标
		{
			if (w1 > w2)
				ret += 180;
			else
				ret = 180 - ret;
		} else if (w1 > w2)
			ret = 360 - ret;
		return ret;
	}

	public String GetDirection1(double lat1, double lng1, double lat2,
			double lng2) {
		double jiaodu = GetJiaoDu(lat1, lng1, lat2, lng2);
		Locale locale = LocaleContextHolder.getLocale();

		String east = SpringUtil.getMessage("na.east", locale); // 东
		String north = SpringUtil.getMessage("na.north", locale); // 北
		String west = SpringUtil.getMessage("na.west", locale); // 西
		String south = SpringUtil.getMessage("na.south", locale); // 南

		if ((jiaodu <= 10) || (jiaodu > 350)) {
			return east;
		}
		if ((jiaodu > 10) && (jiaodu <= 80)) {
			return east + north;
		}
		if ((jiaodu > 80) && (jiaodu <= 100)) {
			return north;
		}
		if ((jiaodu > 100) && (jiaodu <= 170)) {
			return west + north;
		}
		if ((jiaodu > 170) && (jiaodu <= 190)) {
			return west;
		}
		if ((jiaodu > 190) && (jiaodu <= 260)) {
			return west + south;
		}
		if ((jiaodu > 260) && (jiaodu <= 280)) {
			return south;
		}
		if ((jiaodu > 280) && (jiaodu <= 350)) {
			return east + south;
		}
		return "";
	}

	private String getDirection(Coordinate[] startFirstCoors) {
		return GetDirection1(startFirstCoors[0].y, startFirstCoors[0].x,
				startFirstCoors[1].y, startFirstCoors[1].x);

	}

	/**
	 * 逆地址解析，坐标查询路口和兴趣点，优先返回路口信息
	 * 
	 * @param coordString
	 *            坐标
	 * @param layerName
	 *            兴趣点表
	 * @return
	 * @throws CQLException
	 * @throws IOException
	 * @throws SQLException
	 */
	@SuppressWarnings("unchecked")
	public JSONObject queryPOIByCoord(String coordString, String layerName,
			String roadCross) throws CQLException, IOException, SQLException {
		JSONObject obj = new JSONObject();

		if (coordString.length() == 0
				|| coordString.trim().split(",").length != 2) {
			obj.put("geometry", "{\"type\":\"Point\",\"coordinates\":[]}");
			obj.put("address", "");
			obj.put("name", "未知地点");
			return obj;
		}

		String newCoordStr = coordString.trim().replaceAll(",", " ");
		String xString = newCoordStr.split(" ")[0];
		String yString = newCoordStr.split(" ")[1];
		double r = 0.01;
		double x = Double.parseDouble(xString);
		double y = Double.parseDouble(yString);
		double minX = x - r;
		double minY = y - r;
		double maxX = x + r;
		double maxY = y + r;

		obj = this.getNearRoadCross("POINT(" + newCoordStr + ")", roadCross,
				java.text.MessageFormat.format(
						"POLYGON(({0} {1},{2} {3},{4} {5},{6} {7},{8} {9}))",
						minX, minY, maxX, minY, maxX, maxY, minX, maxY, minX,
						minY));

		if (obj != null) {

			com.alibaba.fastjson.JSONObject geometry = com.alibaba.fastjson.JSON
					.parseObject(obj.get("geometry").toString());
			com.alibaba.fastjson.JSONArray coordinates = geometry
					.getJSONArray("coordinates");
			String distance = new java.text.DecimalFormat("#.00")
					.format(Double.parseDouble(obj.get("distance").toString()) * 111118.97383794768);
			obj.put("distance", Double.parseDouble(distance));
			String address = this.getDirection(new Coordinate[] {
					new Coordinate(Double.parseDouble(xString), Double
							.parseDouble(yString)),
					new Coordinate(Double.parseDouble(coordinates.get(0)
							.toString()), Double.parseDouble(coordinates.get(1)
							.toString())) });
			obj.put("address", address);
			String name = obj.get("name").toString().replace('_', '与') + "交叉口向"
					+ (address.length() == 1 ? address : address + "方向")
					+ distance + "米";
			obj.put("name", name);
			return obj;
		}

		String numString = "ST_INTERSECTS(geom,ST_GeomFromText('"
				+ java.text.MessageFormat.format(
						"POLYGON(({0} {1},{2} {3},{4} {5},{6} {7},{8} {9}))",
						minX, minY, maxX, minY, maxX, maxY, minX, maxY, minX,
						minY) + "'))";
		String sqlString = "SELECT gid,name,r_addr as address,districtName,ST_asgeojson(geom) as geometry,ST_DISTANCE(geom,ST_GeomFromText('POINT("
				// + coordString.replaceAll(",", " ")
				+ newCoordStr
				+ ")')) as distance from (select * from "
				+ layerName
				+ " where "
				+ numString
				+ ") as newTable order by distance ASC limit 1";

		DAOFactory poolDAOFactory = DAOFactory.getDAOFactory(DAOFactory.POOL);

		IPoolBaseDAO dao = (IPoolBaseDAO) poolDAOFactory.getBaseDao();
		try {
			List<JSONObject> list = (List<JSONObject>) dao.find(sqlString);
			if (!list.isEmpty()) {
				obj = list.get(0);
				obj.put("distance",
						Double.parseDouble(obj.get("distance").toString()) * 111118.97383794768);
			}
		} catch (Exception e) {
			LOGGER.error(e);
		}

		return obj;
	}

	/**
	 * 地址查询 poi
	 * 
	 * @param layerName
	 * @param keyWordString
	 * @param maxResult
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public JSONObject queryPOIByAddr(String layerName, String keyWordString,
			int maxResult) {
		JSONObject result = new JSONObject();

		result.put("pageIndex", rowIndex);
		result.put("pageSize", maxResult);

		List<JSONObject> features = new ArrayList<>();

		if (keyWordString.length() == 0) {
			result.put("features", features);
			return result;
		}

		StringBuilder sql = new StringBuilder(
				"SELECT NAME,r_addr AS address,ST_asgeojson (geom) AS geometry,");
		sql.append(MessageFormat.format("similarity(r_addr,''{0}'')  AS RANK ",
				keyWordString));
		sql.append(" FROM ").append(layerName).append(" WHERE ");
		if (keyWordString.length() > 1) {
			sql.append(MessageFormat.format("r_addr LIKE ''%{0}%''",
					keyWordString));
		} else {
			sql.append(MessageFormat.format("r_addr LIKE ''{0}%''",
					keyWordString));
		}

		sql.append("ORDER BY RANK DESC ");
		sql.append("LIMIT ").append(maxResult).append(" OFFSET 0");

		DAOFactory poolDAOFactory = DAOFactory.getDAOFactory(DAOFactory.POOL);

		IPoolBaseDAO dao = (IPoolBaseDAO) poolDAOFactory.getBaseDao();

		try {
			features = (List<JSONObject>) dao.find(sql.toString());
			result.put("features", features);
		} catch (Exception e) {
			LOGGER.error(e);
		}

		return result;
	}

	/**
	 * 查找最近道路
	 * 
	 * @param coord
	 * @param layerName
	 * @return
	 * @throws SQLException
	 */
	@SuppressWarnings("unchecked")
	public JSONObject findPointLine(String coord, String layerName)
			throws SQLException {
		JSONObject obj = new JSONObject();
		if (coord.length() == 0 || coord.trim().split(",").length != 2) {
			obj.put("geometry", "{\"type\":\"Point\",\"coordinates\":[]}");
			obj.put("address", "");
			obj.put("name", "未知路段");
			return obj;
		}

		String coordStr = coord.trim().replaceAll(",", " ");
		String xString = coordStr.split(" ")[0];
		String yString = coordStr.split(" ")[1];
		double r = 0.01;
		double x = Double.parseDouble(xString);
		double y = Double.parseDouble(yString);
		double minX = x - r;
		double minY = y - r;
		double maxX = x + r;
		double maxY = y + r;
		String numString = "ST_INTERSECTS(geom,ST_GeomFromText('"
				+ java.text.MessageFormat.format(
						"POLYGON(({0} {1},{2} {3},{4} {5},{6} {7},{8} {9}))",
						minX, minY, maxX, minY, maxX, maxY, minX, maxY, minX,
						minY) + "'))";
		String sqlString = "SELECT *,ST_asgeojson(geom) as geometry,ST_DISTANCE(geom,ST_GeomFromText('POINT("
				+ coordStr.replaceAll(",", " ")
				+ ")')) as distance from (select * from "
				+ layerName
				+ " where "
				+ numString
				+ ") as newTable order by distance ASC limit 1";

		DAOFactory poolDAOFactory = DAOFactory.getDAOFactory(DAOFactory.POOL);

		IPoolBaseDAO dao = (IPoolBaseDAO) poolDAOFactory.getBaseDao();

		try {
			List<JSONObject> list = (List<JSONObject>) dao.find(sqlString);
			if (!list.isEmpty()) {
				obj = list.get(0);
			}
		} catch (Exception e) {
			LOGGER.error(e);
		}

		return obj;
	}

	/**
	 * POI 框选查询
	 * 
	 * @param geometry
	 *            几何wkt
	 * @param key
	 * @param table
	 *            表明称
	 * @param type
	 *            查询字段,默认name
	 * @param poiType
	 *            POI 类型
	 * @param page
	 * @throws SQLException
	 */
	public void searchInBounds(String geometry, String key, String table,
			String type, String poiType, String queryPlan,
			PageQuery<JSONArray> page) throws SQLException {

		String sqlString = java.text.MessageFormat
				.format("SELECT name,type,r_addr as address,districtName,ST_asgeojson(geom) as geometry FROM {0} WHERE ({1}) AND ST_INTERSECTS(geom,st_geogfromtext(&{2}&)) ",
						table, getPOIWhereSql(key, type, poiType, queryPlan),
						geometry).replace("&", "'")
				+ page.getlimitSql();

		JSONArray list = searchInBoundsResut(sqlString, "poi");

		page.setQueryResult(list);
	}

	/**
	 * 路口框选查询
	 * 
	 * @param geometry
	 * @param key
	 * @param table
	 * @param type
	 * @param page
	 * @throws SQLException
	 */
	public void searchRoadCrossInBounds(String geometry, String key,
			String table, String type, PageQuery<JSONArray> page)
			throws SQLException {
		String sqlString = java.text.MessageFormat
				.format("select distinct x as lon,y as lat,name,ST_asgeojson(geom) as geometry  FROM {0} WHERE ST_INTERSECTS(geom,st_geogfromtext(@{1}@)) AND {2}",
						table, geometry, getWhereSql(key, type)).replace("@",
						"'")
				+ page.getlimitSql();

		JSONArray list = searchInBoundsResut(sqlString, "roadcross");

		page.setQueryResult(list);

	}

	/**
	 * 创建路口数据
	 * 
	 * @param corssName
	 * @param queryparme
	 * @param x
	 * @param y
	 * @return
	 * @throws SQLException
	 */
	@SuppressWarnings("unchecked")
	public JSONObject createRoadCross(String corssName,
			QueryParameter queryparme, double x, double y) throws SQLException {

		JSONObject obj = new JSONObject();

		String sqlString = MessageFormat
				.format("INSERT INTO {0}(geom,name) values(st_geomfromtext(''POINT ZM ({1} {2} 0 0)''),''{3}'')",
						queryparme.getTableName(), x, y, corssName);

		DAOFactory poolDAOFactory = DAOFactory.getDAOFactory(DAOFactory.POOL);

		IPoolBaseDAO dao = (IPoolBaseDAO) poolDAOFactory.getBaseDao();

		try {
			int rowCount = dao.insert(sqlString);
			if (rowCount > 0) {
				String selectSQL = MessageFormat.format(
						"select currval(''{0}'')", queryparme.getSeqName());
				List<JSONObject> list = (List<JSONObject>) dao.find(selectSQL);
				int gid = 0;
				if (!list.isEmpty()) {
					gid = getGid(list);
				}
				sqlString = MessageFormat
						.format("SELECT *,ST_asgeojson(geom) as geom_txt FROM {0} WHERE GID  = {1} limit 1",
								queryparme.getTableName(),
								Integer.toString(gid));
				List<JSONObject> list2 = (List<JSONObject>) dao.find(sqlString);
				if (!list2.isEmpty()) {
					obj = list2.get(0);
				}
			}
		} catch (Exception e) {
			LOGGER.error(e);
		}

		return obj;

	}

	/*
	 * 修改路口数据
	 */
	@SuppressWarnings("unchecked")
	public JSONObject updateRoadCross(String corssName,
			QueryParameter queryparme, double x, double y, int gid)
			throws SQLException {
		JSONObject obj = new JSONObject();

		String layerName = queryparme.getTableName();
		String sqlString = MessageFormat
				.format("UPDATE {0} SET geom = st_geomfromtext(''POINT ({1} {2} 0 0)''),NAME = ''{3}''  WHERE GID = {4}",
						layerName, x, y, corssName, Integer.toString(gid));

		DAOFactory poolDAOFactory = DAOFactory.getDAOFactory(DAOFactory.POOL);

		IPoolBaseDAO dao = (IPoolBaseDAO) poolDAOFactory.getBaseDao();

		try {
			int rowCount = dao.update(sqlString);
			if (rowCount > 0) {
				String querySQL = MessageFormat
						.format("select *,ST_asgeojson(geom) as geom_txt from {0} WHERE GID  = {1} limit 1",
								layerName, Integer.toString(gid));
				List<JSONObject> list = (List<JSONObject>) dao.find(querySQL);

				if (!list.isEmpty()) {
					obj = list.get(0);
				}
			}
		} catch (Exception e) {
			LOGGER.error(e);
		}

		return obj;

	}

	/**
	 * 创建POI
	 * 
	 * @param poiName
	 * @param address
	 * @param poiType
	 * @param queryParameter
	 * @param x
	 * @param y
	 * @return
	 * @throws SQLException
	 */
	@SuppressWarnings("unchecked")
	public JSONObject createPoi(String poiName, String address, String poiType,
			QueryParameter queryParameter, double x, double y)
			throws SQLException {
		JSONObject obj = new JSONObject();

		String layerName = queryParameter.getTableName();
		String sqlString = MessageFormat
				.format("INSERT INTO {0}(geom,name,r_addr) values(st_geomfromtext(''POINT ZM ({1} {2} 0 0)''),''{3}'',''{4}'')",
						layerName, x, y, poiName, address);

		DAOFactory poolDAOFactory = DAOFactory.getDAOFactory(DAOFactory.POOL);

		IPoolBaseDAO dao = (IPoolBaseDAO) poolDAOFactory.getBaseDao();

		try {
			int rowCount = dao.insert(sqlString);
			if (rowCount > 0) {
				String selectSQL = MessageFormat.format(
						"select currval(''{0}'')", queryParameter.getSeqName());

				List<JSONObject> list = (List<JSONObject>) dao.find(selectSQL);
				int gid = 0;
				if (!list.isEmpty()) {
					gid = getGid(list);
				}
				sqlString = MessageFormat
						.format("SELECT *,ST_asgeojson(geom) as geom_txt FROM {0} WHERE GID  = {1} limit 1",
								layerName, Integer.toString(gid));
				List<JSONObject> list2 = (List<JSONObject>) dao.find(sqlString);
				if (!list2.isEmpty()) {
					obj = list2.get(0);
				}
			}
		} catch (Exception e) {
			LOGGER.error(e);
		}

		return obj;
	}

	/**
	 * 根据GID 更新POI
	 * 
	 * @param poiName
	 * @param address
	 * @param poiType
	 * @param queryParameter
	 * @param x
	 * @param y
	 * @param gid
	 * @return
	 * @throws SQLException
	 */
	@SuppressWarnings("unchecked")
	public JSONObject updatePoi(String poiName, String address, String poiType,
			QueryParameter queryParameter, double x, double y, int gid)
			throws SQLException {
		JSONObject obj = new JSONObject();

		String layerName = queryParameter.getTableName();
		String sqlString = MessageFormat
				.format("UPDATE {0} SET geom = st_geomfromtext(''POINT ({1} {2} 0 0)''),NAME = ''{3}'', R_ADDR = ''{4}'' WHERE GID = {5}",
						layerName, x, y, poiName, address,
						Integer.toString(gid));

		DAOFactory poolDAOFactory = DAOFactory.getDAOFactory(DAOFactory.POOL);

		IPoolBaseDAO dao = (IPoolBaseDAO) poolDAOFactory.getBaseDao();

		int rowCount;
		try {
			rowCount = dao.update(sqlString);

			if (rowCount > 0) {
				String querySQL = MessageFormat
						.format("select *,ST_asgeojson(geom) as geom_txt from {0} WHERE GID  = {1} limit 1",
								layerName, Integer.toString(gid));
				List<JSONObject> list = (List<JSONObject>) dao.find(querySQL);

				if (!list.isEmpty()) {
					obj = list.get(0);
				}
			}
		} catch (Exception e) {
			LOGGER.error(e);
		}
		return obj;
	}

	/**
	 * 商圈和行政区搜索
	 * 
	 * @param areacode
	 * @param businessFlag
	 * @return
	 * @throws SQLException
	 */
	@SuppressWarnings("unchecked")
	public JSONArray queryBussiness(String areacode, String businessFlag)
			throws SQLException {
		JSONArray array = new JSONArray();

		String city = QueryParameterCollection.getInstance().getTableNameByKey(
				TableKeyEnum.CITY);
		String bussiness = QueryParameterCollection.getInstance()
				.getTableNameByKey(TableKeyEnum.BUSSINESS);
		if ("".equals(city) && "".equals(bussiness)) {
			return array;
		}

		String sql;
		if ("1".equalsIgnoreCase(businessFlag)) { // 商圈查询
			sql = MessageFormat
					.format("SELECT area_code,area_name,st_asgeojson(geom) as geom,x,y,description FROM {0} where city_code = ''{1}''",
							bussiness, areacode);
		} else {
			sql = MessageFormat
					.format("select area_code,area_name, x,y from {0} where parent_code = ''{1}''",
							city, areacode);
		}

		DAOFactory poolDAOFactory = DAOFactory.getDAOFactory(DAOFactory.POOL);

		IPoolBaseDAO dao = (IPoolBaseDAO) poolDAOFactory.getBaseDao();
		
		execute(sql, array, dao);
		
		return array;
	}

	@SuppressWarnings("unchecked")
	public JSONArray getBoundary(String areacode) {
		JSONArray array = new JSONArray();
		String city = QueryParameterCollection.getInstance().getTableNameByKey(
				TableKeyEnum.CITY);
		if ("".equals(city)) {
			return array;
		}

		String sql = MessageFormat
				.format("select area_code,area_name, x,y,st_asgeojson(geom) as geo  from {0}  where area_code = ''{1}''",
						city, areacode);

		DAOFactory poolDAOFactory = DAOFactory.getDAOFactory(DAOFactory.POOL);

		IPoolBaseDAO dao = (IPoolBaseDAO) poolDAOFactory.getBaseDao();
		
		execute(sql, array, dao);
		
		return array;
	}

	@SuppressWarnings("unchecked")
	public JSONArray getCityName(String areaName) {
		JSONArray array = new JSONArray();

		String city = QueryParameterCollection.getInstance().getTableNameByKey(
				TableKeyEnum.CITY);
		if ("".equals(city)) {
			return array;
		}

		String sql = MessageFormat
				.format("select area_code,area_name, x,y,st_asgeojson(geom) as geom  from  {0}  where area_name like ''%{1}%'' order by area_code",
						city, areaName);

		DAOFactory poolDAOFactory = DAOFactory.getDAOFactory(DAOFactory.POOL);

		IPoolBaseDAO dao = (IPoolBaseDAO) poolDAOFactory.getBaseDao();
		
		execute(sql, array, dao);
		
		return array;
	}

	@SuppressWarnings("unchecked")
	public JSONArray getRegionTree(String addvcd) {
		JSONArray results = new JSONArray();

		String sql = this.getgetRegionTreeSQL(addvcd);
		Object[] params = new Object[] {};

		DAOFactory poolDAOFactory = DAOFactory.getDAOFactory(DAOFactory.POOL);
		IPoolBaseDAO dao = (IPoolBaseDAO) poolDAOFactory.getBaseDao();

		try {
			JSONArray array = dao.preparedQuery(sql.toString(), params);

			int size = array.size();
			for (int i = 0; i < size; i++) {
				JSONObject item = (JSONObject) array.get(i);
				if ("".equals(addvcd) || verifyMatches(PRIVINCE_REG, addvcd)
						|| verifyMatches(CITY_REG, addvcd)
						|| verifyMatches(DISTRICT_REG, addvcd)) {
					String addvcdr = (String) item.get("addvcd");
					if (addvcdr.length() > 6) {
						addvcdr = addvcdr.substring(0, 6);
					}

					// 港澳台特别处理
					if (!"710000".endsWith(addvcdr)
							&& !"820000".endsWith(addvcdr)
							&& !"810002".endsWith(addvcdr)
							&& !"810006".endsWith(addvcdr)
							&& !"810014".endsWith(addvcdr)) {
						item.put("isParent", true);
					}
				}
				results.add(item);
			}

		} catch (DataAccessException e) {
			LOGGER.error(e);
		}

		return results;
	}

	/**
	 * 名称或者编码查询行政区划信息
	 * 
	 * @param name
	 *            名称或者编码
	 * @return
	 */
	public JSONObject queryRegionalBoundByName(String name) {
		JSONObject result = new JSONObject();

		if ("".equals(name)) {
			return result;
		}

		if (StringUtils.isNumeric(name)) {
			result = this.queryRegionalBound(name);
		} else {
			result = this.queryRegionalBoundByRealName(name);
		}
		return result;
	}

	// 行政区划名称查询行政区划信息
	@SuppressWarnings("unchecked")
	private JSONObject queryRegionalBoundByRealName(String name) {
		JSONObject result = new JSONObject();
		StringBuilder sql = new StringBuilder(
				"SELECT code FROM district WHERE name LIKE '%").append(name)
				.append("%' LIMIT 1");

		DAOFactory poolDAOFactory = DAOFactory.getDAOFactory(DAOFactory.POOL);
		IPoolBaseDAO dao = (IPoolBaseDAO) poolDAOFactory.getBaseDao();

		try {
			List<JSONObject> list = (List<JSONObject>) dao.find(sql.toString());

			if (list.size() != 0) {
				JSONObject item = list.get(0);
				String addvcd = (String) item.get("code");

				result = this.queryRegionalBound(addvcd);
			}

		} catch (SQLException e) {
			LOGGER.error(e);
		}

		return result;
	}

	/**
	 * 行政区划码查询行政区划名称区划码边界及下级区划名称区划码边界，如果查询条件addvcd是县级则没有下级信息
	 * 
	 * @param addvcd
	 *            行政区划码
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public JSONObject queryRegionalBound(String addvcd) {
		JSONObject result = new JSONObject();

		if ("".equals(addvcd) || addvcd.length() > 12 || addvcd.length() < 6) {
			return result;
		}

		String sql = this.getQueryRegionaSQL(addvcd);

		DAOFactory poolDAOFactory = DAOFactory.getDAOFactory(DAOFactory.POOL);
		IPoolBaseDAO dao = (IPoolBaseDAO) poolDAOFactory.getBaseDao();

		try {
			List<JSONObject> list = (List<JSONObject>) dao.find(sql);

			result = processRegionalBoundResults(list, addvcd);
		} catch (SQLException e) {
			LOGGER.error(e);
		}

		return result;
	}

	/**
	 * 道路和多边形的相交点转换为JSONArray
	 * 
	 * @param roadName
	 * @param interPointsGeo
	 * @return
	 */
	@SuppressWarnings("unchecked")
	private JSONArray interGeoToJson(String roadName, Geometry interPointsGeo,
			JSONArray results) {
		Coordinate[] interPoints = interPointsGeo.getCoordinates();

		for (Coordinate point : interPoints) {
			JSONObject result = new JSONObject();
			JSONObject geoJson = coordinateToGeojson(point);

			result.put("name", roadName);
			result.put("geometry", geoJson.toJSONString());
			if (!results.contains(result)) {
				results.add(result);
			}
		}

		return results;
	}

	/**
	 * Coordinate 转 geoJson
	 * 
	 * @param point
	 * @return
	 */
	@SuppressWarnings("unchecked")
	private JSONObject coordinateToGeojson(Coordinate point) {
		JSONObject geoJson = new JSONObject();
		JSONArray corrdinates = new JSONArray();
		corrdinates.add(point.x);
		corrdinates.add(point.y);

		geoJson.put("type", "Point");
		geoJson.put("coordinates", corrdinates);

		return geoJson;
	}

	/**
	 * 道路和多边形的交点部分多边形边界，不是闭合的
	 * 
	 * @param geoWkt
	 * @return
	 */
	private LineString createBoundary(String geoWkt) {
		Coordinate[] coordinates = null;
		GeometryFactory geometryFactory = JTSFactoryFinder.getGeometryFactory();
		try {

			WKTReader reader = new WKTReader(geometryFactory);

			Geometry regionalGeo = reader.read(geoWkt);

			Geometry regionalBoundary = regionalGeo.getBoundary();// 闭合的边界

			coordinates = regionalBoundary.getCoordinates();

			Coordinate lastCoordinate = coordinates[coordinates.length - 1];
			double x = lastCoordinate.x + 0.0000000000001;
			double y = lastCoordinate.y + 0.0000000000001;

			Coordinate newLastCoordinate = new Coordinate(x, y);

			coordinates[coordinates.length - 1] = newLastCoordinate;
		} catch (ParseException e) {
			LOGGER.error(e);
		}

		return geometryFactory.createLineString(coordinates);
	}

	private String getPOIWhereSql(String keyWordString, String columnName,
			String poiType, String queryPlan) {

		StringBuilder sqlString = new StringBuilder("");

		if (NetposaHelper.isEmpty(keyWordString)
				&& NetposaHelper.isEmpty(poiType)) {
			return " 1=1 ";
		} else if (NetposaHelper.isEmpty(keyWordString)
				&& !NetposaHelper.isEmpty(poiType)) {
			sqlString.append(MessageFormat.format("type like ''%{0}%''",
					poiType));
		} else {
			if ("name".equalsIgnoreCase(columnName)) {

				splitWord = "|".equals(splitWord) ? "\\|" : splitWord;
				String[] words = keyWordString.split(splitWord);

				if (FULL_TEXT_SEEARCH.equalsIgnoreCase(queryPlan)) {
					sqlString.append(getFTSWhereSql(keyWordString, "name"));
				} else {
					sqlString.append(getWhereSql(keyWordString, "name"));
				}

				if (words.length == 1 && NetposaHelper.isEmpty(poiType)) {
					boolean isChinese = words[0].getBytes(Charset
							.defaultCharset()).length != words[0].length();
					if (isChinese) {
						sqlString.append(MessageFormat.format(
								" or (type like ''%{0}%'')", keyWordString));
					}
				}

			} else {
				sqlString.append(MessageFormat.format(" {0} = ''{1}''",
						columnName, keyWordString));
			}

			if (!NetposaHelper.isEmpty(poiType)) {
				sqlString.append(MessageFormat.format(
						" and (type like ''%{0}%'')", poiType));
			}
		}

		return sqlString.toString();
	}

	/**
	 * 框选查询POI和 roadcross 通用部分
	 * 
	 * @param sqlString
	 *            sql
	 * @param type
	 *            区分 POI 和 roadcross 查询
	 * @return 查询结果 JSONArray
	 */
	@SuppressWarnings("unchecked")
	private JSONArray searchInBoundsResut(String sqlString, String type) {
		JSONArray list = new JSONArray();

		DAOFactory poolDAOFactory = DAOFactory.getDAOFactory(DAOFactory.POOL);
		IBaseDAO dao = poolDAOFactory.getBaseDao();
		
		execute(sqlString, list, dao);
		
		return list;
	}
	
	private void execute(String sqlString, JSONArray list, IBaseDAO dao) {
		try {
			List<JSONObject> list2 = (List<JSONObject>) dao.find(sqlString);
			if (!list2.isEmpty()) {
				for (int i = 0; i < list2.size(); i++) {
					list.add(list2.get(i));
				}
			}
		} catch (Exception e) {
			LOGGER.error(e);
		}
	}
	
	/*
	 * 求匹配度，分为按照name(名称)和szm(拼音首字母),quanpin(全拼)两种情况。 1.szm(拼音首字母),quanpin(全拼) 查询
	 * 如果是一个关键字则取szm(拼音首字母),quanpin(全拼)匹配度最高的作为有效值。
	 * 如果是多个关键字首先取每个关键字szm(拼音首字母),quanpin(全拼)匹配度最高的作为有效值，并将各个关键字匹配度有效值求和。
	 * 2.name(名称) 查询 如果是一个关键字则取name(名称)匹配度。 如果是多个关键字则将各个关键字匹配度值求和。
	 */
	private String getPpd(String keyWordString) {
		StringBuilder sBuilder = new StringBuilder();

		sBuilder.append(",(");

		splitWord = "|".equals(splitWord) ? "\\|" : splitWord;
		String[] words = keyWordString.split(splitWord);
		int wordLength = words.length;
		for (int i = 0; i < wordLength; i++) {
			boolean isChinese = words[i].getBytes(Charset.defaultCharset()).length != words[i]
					.length();
			if (i == 0) {
				if (isChinese) {
					// sBuilder.append(MessageFormat.format("similarity(name,''{0}'')",
					// words[i]));
					sBuilder.append(MessageFormat
							.format("similarity(np_string_extract(name,array[''('',''（'']),''{0}'')",
									words[i]));
				} else {
					sBuilder.append(MessageFormat
							.format("GREATEST(similarity(szm,''{0}''), similarity(quanpin, ''{0}''))",
									words[i].toUpperCase()));
				}
			} else {
				if (isChinese) {
					// sBuilder.append(MessageFormat.format("+similarity(name,''{0}'')",
					// words[i]));
					sBuilder.append(MessageFormat
							.format("+similarity(np_string_extract(name,array[''('',''（'']),''{0}'')",
									words[i]));
				} else {
					sBuilder.append(MessageFormat
							.format("+GREATEST(similarity(szm,''{0}''), similarity(quanpin, ''{0}''))",
									words[i].toUpperCase()));
				}
			}
		}

		sBuilder.append(") AS rank ");

		return sBuilder.toString();
	}

	private String getWhereSql(String keyWordString, String columnName) {
		String sqlString;
		if (NetposaHelper.isEmpty(keyWordString)) {
			return " 1=1 ";
		}

		if ("name".equalsIgnoreCase(columnName)) {
			splitWord = "|".equals(splitWord) ? "\\|" : splitWord;
			String[] words = keyWordString.split(splitWord);
			sqlString = this.generateQueryString(words);
		} else {
			sqlString = MessageFormat.format(" {0} = ''{1}''", columnName,
					keyWordString);
		}
		return sqlString;
	}

	/**
	 * Geometry LineString 转 MultiLineString
	 * 
	 * @param geo
	 * @return
	 */
	private Geometry lineToMulti(Geometry geo) {
		Geometry result = geo;
		String geoType = geo.getGeometryType();
		if (!("MultiLineString".equals(geoType))) {
			GeometryFactory geometryFactory = JTSFactoryFinder
					.getGeometryFactory();
			LineString[] lineString = new LineString[1];
			lineString[0] = (LineString) geo;
			result = geometryFactory.createMultiLineString(lineString);
		}

		return result;
	}

	/**
	 * 多关键字查询条件的生成
	 * 
	 * @param words
	 * @return
	 */
	private String generateQueryString(String[] words) {
		StringBuilder sBuilder = new StringBuilder();
		for (int i = 0; i < words.length; i++) {
			boolean isChinese = words[i].getBytes(Charset.defaultCharset()).length != words[i]
					.length();
			if (i == 0) {
				if (isChinese) {
					sBuilder.append(MessageFormat.format(
							"(name LIKE ''%{0}%'')", words[i]));
				} else {
					sBuilder.append(MessageFormat.format(
							"(szm LIKE ''%{0}%'' or quanpin LIKE ''%{0}%'')",
							words[i].toUpperCase()));
				}
			} else {
				if (isChinese) {
					sBuilder.append(MessageFormat.format(
							" AND (name LIKE ''%{0}%'')", words[i]));
				} else {
					sBuilder.append(MessageFormat
							.format("  AND (szm LIKE ''%{0}%'' or quanpin LIKE ''%{0}%'')",
									words[i].toUpperCase()));
				}
			}
		}
		return sBuilder.toString();
	}

	/**
	 * 获取gid
	 * 
	 * @param list
	 * @return
	 */
	@SuppressWarnings("unchecked")
	private int getGid(List<JSONObject> list) {
		int gid = 0;
		JSONObject jsonObject = list.get(0);
		Set<String> set = jsonObject.keySet();
		Iterator<String> it = set.iterator();
		while (it.hasNext()) {
			String key = it.next();
			gid = (int) jsonObject.get(key);
		}
		return gid;
	}

	private String getFTSWhereSql(String keyWordString, String columnName) {
		String sqlString;
		if (NetposaHelper.isEmpty(keyWordString)) {
			return " 1=1 ";
		}

		if ("name".equalsIgnoreCase(columnName)) {
			splitWord = "|".equals(splitWord) ? "\\|" : splitWord;
			String[] words = keyWordString.split(splitWord);
			sqlString = this.getFTSWhereSqll(words);
		} else {
			sqlString = MessageFormat.format(" {0} = ''{1}''", columnName,
					keyWordString);
		}
		return sqlString;
	}

	/**
	 * 提高兴趣要素查询效率使用
	 * 
	 * @param words
	 * @return
	 */
	private String getFTSWhereSqll(String[] words) {
		StringBuilder sBuilder = new StringBuilder();
		for (int i = 0; i < words.length; i++) {
			boolean isChinese = words[i].getBytes(Charset.defaultCharset()).length != words[i]
					.length();

			String word = words[i];
			if (word.length() > 1) {
				word += ":*";
			}

			if (i == 0) {
				if (isChinese) {
					sBuilder.append(MessageFormat.format(
							"(name LIKE ''{0}%'')", words[i]));
				} else {
					sBuilder.append(MessageFormat
							.format("to_tsvector(''english'',szm) @@ to_tsquery(''english'',''{0}'') OR to_tsvector(''english'',quanpin) @@ to_tsquery(''english'',''{0}'')",
									word));
				}

			} else {
				if (isChinese) {

					sBuilder.append(MessageFormat.format(
							" AND (name like ''{0}%'')", words[i]));
				} else {
					sBuilder.append(MessageFormat
							.format("  AND (to_tsvector(''english'',szm) @@ to_tsquery(''english'',''{0}'') OR to_tsvector(''english'',quanpin) @@ to_tsquery(''english'',''{0}''))",
									word));
				}
			}
		}
		return sBuilder.toString();
	}

	/**
	 * 查询道路、POI 路口数据，支持分页，一次查询三张表
	 * 
	 * @param keyWordString
	 * @param pageSize
	 * @param page
	 * @param queryPlan
	 * @return
	 */
	/*
	 * @SuppressWarnings("unchecked") public JSONObject
	 * queryFOIByNameForPage(String keyWordString, int pageSize, int page,
	 * String queryPlan) {
	 * 
	 * JSONObject result = new JSONObject(); JSONObject dataObj = new
	 * JSONObject(); JSONArray jsonArray = new JSONArray();
	 * 
	 * // 响应代码 int resCode = 200;
	 * 
	 * if ("".equals(keyWordString)) { result.put("code", resCode);
	 * result.put("data", dataObj); return result; }
	 * 
	 * 
	 * DAOFactory poolDAOFactory = DAOFactory.getDAOFactory(DAOFactory.POOL);
	 * IPoolBaseDAO dao = (IPoolBaseDAO) poolDAOFactory.getBaseDao();
	 * 
	 * String querySQL = this.getQueryFOIByNameForPageSQL(keyWordString,
	 * pageSize, page, queryPlan); String totalSQL =
	 * this.getTotalSQL(keyWordString, queryPlan);
	 * 
	 * try {
	 * 
	 * List<JSONObject> totalList = (List<JSONObject>) dao.find(totalSQL); int
	 * totalRow = (int) totalList.get(0).get("total");
	 * 
	 * int totalPage = (totalRow - 1) / pageSize + 1;
	 * 
	 * dataObj.put("total", totalRow); dataObj.put("pageSize", pageSize);
	 * dataObj.put("page", page); dataObj.put("totalPage", totalPage);
	 * 
	 * List<JSONObject> list = (List<JSONObject>) dao.find(querySQL);
	 * 
	 * for (JSONObject obj : list) { jsonArray.add(obj); }
	 * 
	 * dataObj.put("features", jsonArray);
	 * 
	 * } catch (SQLException e) { resCode = 500; logger.error(e); }
	 * 
	 * result.put("code", resCode); result.put("data", dataObj);
	 * 
	 * return result; }
	 */

	private String getQueryFOIByNameForPageSQL(String keyWordString,
			int pageSize, int page, String queryPlan) {
		StringBuilder sql = new StringBuilder();

		String temporarySQL = this.getFOITemporarySQL(keyWordString, queryPlan);

		if (temporarySQL.length() != 0) {
			String pageSQL = "LIMIT " + pageSize + " OFFSET " + (page - 1)
					* pageSize;

			sql.append("SELECT name,type,feature as wkt, address,rank FROM (");
			sql.append(temporarySQL);
			sql.append(") AS foitb ORDER BY rank DESC ");
			sql.append(pageSQL);
		}

		return sql.toString();
	}

	// 查询记录总数
	/*
	 * private String getTotalSQL(String keyWordString, String queryPlan) {
	 * StringBuilder sql = new StringBuilder();
	 * 
	 * String querySQL = this.getFOITemporarySQL(keyWordString,
	 * queryPlan).replaceAll("'", "''");
	 * 
	 * sql.append("SELECT count_estimate('"); sql.append(querySQL);
	 * sql.append(" ')AS total");
	 * 
	 * return sql.toString(); }
	 */

	private String getFOITemporarySQL(String keyWordString, String queryPlan) {
		String sql = "";
		StringBuilder sqlBuilder = new StringBuilder();

		String roadSql = this.getRoadForPageSQL(keyWordString, queryPlan);
		String poiSql = this.getPOIForPageSQL(keyWordString, queryPlan);
		String roadCrossSql = this.getRoadcrossForPageSQL(keyWordString,
				queryPlan);

		if (roadSql.length() != 0) {
			sqlBuilder.append(roadSql);
			sqlBuilder.append(" UNION ALL ");
		}

		if (poiSql.length() != 0) {
			sqlBuilder.append(poiSql);
			sqlBuilder.append(" UNION ALL ");
		}

		if (roadCrossSql.length() != 0) {
			sqlBuilder.append(roadCrossSql);
			sqlBuilder.append(" UNION ALL ");
		}

		sql = sqlBuilder.toString();
		if (sql.length() != 0) {
			sql = sql.substring(0, sql.lastIndexOf("UNION ALL"));
		}

		return sql;
	}

	//
	private String getRoadForPageSQL(String keyWordString, String queryPlan) {
		StringBuilder sql = new StringBuilder();

		String roadLayerName = QueryParameterCollection.getInstance()
				.getTableNameByKey(TableKeyEnum.ROAD);

		if (roadLayerName == null || roadLayerName.length() == 0) {
			LOGGER.error("没有配置道路表。");
		} else {
			sql.append("SELECT name,'road' AS type,ST_asgeojson (GEOM) AS feature,districtname AS address");
			sql.append(getPpd(keyWordString));
			sql.append(" FROM ").append(roadLayerName).append(" WHERE ");

			if (FULL_TEXT_SEEARCH.equalsIgnoreCase(queryPlan)) {
				sql.append(getFTSWhereSql(keyWordString, "name"));
			} else {
				sql.append(getWhereSql(keyWordString, "name"));
			}
		}
		return sql.toString();
	}

	private String getPOIForPageSQL(String keyWordString, String queryPlan) {
		StringBuilder sql = new StringBuilder();

		String poiLayerName = QueryParameterCollection.getInstance()
				.getTableNameByKey(TableKeyEnum.POI);

		if (poiLayerName == null || poiLayerName.length() == 0) {
			LOGGER.error("没有配置兴趣点表。");
		} else {
			sql.append("SELECT name,'poi' AS type,ST_asgeojson (GEOM) AS feature,r_addr AS address");
			sql.append(getPpd(keyWordString));
			sql.append(" FROM ").append(poiLayerName).append(" WHERE ");
			if (FULL_TEXT_SEEARCH.equalsIgnoreCase(queryPlan)) {
				sql.append(getFTSWhereSql(keyWordString, "name"));
			} else {
				sql.append(getWhereSql(keyWordString, "name"));
			}
		}

		return sql.toString();
	}

	private String getRoadcrossForPageSQL(String keyWordString, String queryPlan) {
		StringBuilder sql = new StringBuilder();

		String roadcrossLayerName = QueryParameterCollection.getInstance()
				.getTableNameByKey(TableKeyEnum.ROADCROSS);

		if (roadcrossLayerName == null || roadcrossLayerName.length() == 0) {
			LOGGER.error("没有配置路口表。");
		} else {
			sql.append("SELECT name,'roadcross' AS type,ST_asgeojson (GEOM) AS feature,'' AS address");
			sql.append(getPpd(keyWordString));
			sql.append(" FROM ").append(roadcrossLayerName).append(" WHERE ");
			if (FULL_TEXT_SEEARCH.equalsIgnoreCase(queryPlan)) {
				sql.append(getFTSWhereSql(keyWordString, "name"));
			} else {
				sql.append(getWhereSql(keyWordString, "name"));
			}
		}

		return sql.toString();
	}

	private String getgetRegionTreeSQL(String addvcd) {
		StringBuilder sql = new StringBuilder(
				"SELECT DISTINCT code as addvcd,name || ' (' || code || ')' as name FROM district WHERE ");

		if ("".equals(addvcd)) {
			sql.append("code ~ '^[1-8][0-7]0{4}$'");
		} else {
			if (verifyMatches(PRIVINCE_REG, addvcd)) {
				if (ZXS_CODE.contains(addvcd.substring(0, 6))) {
					sql.append("code ~ '^").append(addvcd.substring(0, 2))
							.append("[0-9]{4}$'");
				} else {
					sql.append("code ~ '^").append(addvcd.substring(0, 2))
							.append("[0-9]{2}0{2}$'");
				}
			} else if (verifyMatches(CITY_REG, addvcd)) {
				sql.append("code ~ '^").append(addvcd.substring(0, 4))
						.append("[0-9]{2}$'");
			} else if (verifyMatches(DISTRICT_REG, addvcd)) {
				// sql.append("code ~ '^").append(addvcd.substring(0,
				// 6)).append("[0-9]{2}[1-9]{1}(0{3}){0,1}$'");
				sql.append("code ~ '^").append(addvcd.substring(0, 6))
						.append("[0-9]{3}(0{3}){0,1}$'");
			} else if (verifyMatches(TOWN_REG, addvcd)) {
				sql.append("code ~ '^").append(addvcd.substring(0, 9))
						.append("[0-9]{2}[1-9]{1}$'");
			}

			sql.append(" AND code != '").append(addvcd).append("'");
		}

		sql.append(" ORDER BY addvcd");

		return sql.toString();
	}

	// 行政区划码查询行政区划 sql
	private String getQueryRegionaSQL(String addvcd) {
		StringBuilder sql = new StringBuilder(
				"SELECT code,name,ST_asgeojson(center) as center,ST_asgeojson (GEOM) AS geometry FROM district WHERE ");

		if (verifyMatches(PRIVINCE_REG, addvcd)) {
			// 省编码查询省及下级市
			if (ZXS_CODE.contains(addvcd.substring(0, 6))) { // 直辖市
				sql.append("code ~ '^").append(addvcd.substring(0, 2))
						.append("[0-9]{4}$'");
			} else {
				sql.append("code ~ '^").append(addvcd.substring(0, 2))
						.append("[0-9]{2}0{2}$'");
			}
		} else if (verifyMatches(CITY_REG, addvcd)) {
			// 市编码查询市及下级县
			sql.append("code ~ '^").append(addvcd.substring(0, 4))
					.append("[0-9]{2}$'");
		} else if (verifyMatches(DISTRICT_REG, addvcd)) {
			// 县编码查询市及下级街道办
			// sql.append("code ~ '^").append(addvcd.substring(0,
			// 6)).append("[0-9]{2}[1-9]{1}(0{3}){0,1}$'").append(" OR code='").append(addvcd).append("'");
			sql.append("code ~ '^").append(addvcd.substring(0, 6))
					.append("[0-9]{3}(0{3}){0,1}$'").append(" OR code='")
					.append(addvcd).append("'");
		} else if (verifyMatches(TOWN_REG, addvcd)) {
			// 街道办编码查询下级社区居委会
			sql.append("code ~ '^").append(addvcd.substring(0, 9))
					.append("[0-9]{2}[1-9]{1}$'").append(" OR code='")
					.append(addvcd).append("'");
		} else {
			sql.append("code ~ '^").append(addvcd).append("$'");
		}

		return sql.toString();
	}

	// 根据行政区划码判断行政区划级别
	private String verifyAddvcd(String addvcd) {
		String result = "";

		if (verifyMatches(PRIVINCE_REG, addvcd)) {
			if (ZXS_CODE.contains(addvcd)) {
				result = "city";
			} else {
				result = "privince";
			}
		} else if (verifyMatches(CITY_REG, addvcd)) {
			result = "city";
		} else if (verifyMatches(DISTRICT_REG, addvcd)) {
			result = "district";
		} else if (verifyMatches(DISTRICT_REG2, addvcd)) {
			result = "district";
		} else if (verifyMatches(TOWN_REG, addvcd)) {
			result = "town";
		} else {
			result = "village";
		}

		return result;
	}

	@SuppressWarnings("unchecked")
	private JSONObject processRegionalBoundResults(List<JSONObject> list,
			String addvcd) {
		JSONObject result = new JSONObject();
		JSONArray jsonArray = new JSONArray();

		for (JSONObject obj : list) {

			String addvcdr = (String) obj.get("code");
			String addvnm = (String) obj.get("name");
			String center = (String) obj.get("center");

			String level = this.verifyAddvcd(addvcdr);
			net.sf.json.JSONObject geometry = net.sf.json.JSONObject
					.fromObject(obj.get("geometry"));

			if (addvcdr.equals(addvcd)) {
				result.put("code", addvcdr);
				result.put("name", addvnm);
				result.put("center", center);
				result.put("geometry", geometry);
				result.put("level", level);
			} else {
				JSONObject subObject = new JSONObject();
				subObject.put("code", addvcdr);
				subObject.put("name", addvnm);
				subObject.put("center", center);
				subObject.put("geometry", geometry);
				subObject.put("level", level);

				jsonArray.add(subObject);
			}
		}
		if (!jsonArray.isEmpty()) {
			result.put("districts", jsonArray);
		}

		return result;
	}

	// 字符串是否匹配正则表达式
	private boolean verifyMatches(String reg, String addvcd) {
		Pattern pattern = Pattern.compile(reg);
		Matcher matcher = pattern.matcher(addvcd);
		return matcher.matches();
	}
}
