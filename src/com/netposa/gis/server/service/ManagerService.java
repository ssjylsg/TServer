package com.netposa.gis.server.service;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.netposa.gis.server.bean.CompactMap;
import com.netposa.gis.server.bean.ConfigBean;
import com.netposa.gis.server.bean.DataResult;
import com.netposa.gis.server.bean.QueryParameter;
import com.netposa.gis.server.dao.DAOFactory;
import com.netposa.gis.server.dao.IPoolBaseDAO;
import com.netposa.gis.server.exception.DataAccessException;
import com.netposa.gis.server.task.PostgresqlCopyTask;
import com.netposa.gis.server.utils.Base64Util;
import com.netposa.gis.server.utils.NetposaHelper;
import com.netposa.gis.server.utils.SpringUtil;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.sql.*;
import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

@Service("managerService")
public class ManagerService extends BaseServiceImpl {

	private static final Log LOGGER = LogFactory.getLog(ManagerService.class);

	// 导入操作结果信息
	private Map<String, Object> msgMap = new HashMap<>();

	// 查询表配置,加载 queryParameter.xml
	private List<QueryParameter> queryParameters = new ArrayList<>();

	/**
	 * 把数据流追加到表中
	 * 
	 * @param tableName
	 * @param file
	 * @return
	 * @throws IOException
	 * @throws SQLException
	 * @throws InterruptedException
	 * @throws ExecutionException
	 */
	public String dataAppend(String tableName, MultipartFile file)
			throws IOException, SQLException, InterruptedException,
			ExecutionException {
		String msg = "";
		String sucMsg = "";

		int beginIndex = tableName.lastIndexOf('_');
		int endIndex = tableName.length();
		String tableFlag = tableName.substring(beginIndex + 1, endIndex);

		try (Connection connection = this.getJDBCConnection();
				InputStream inputStream = file.getInputStream()) {
			Future<Long> future = this.doCopyFromInputStream(connection,
					tableName, inputStream);
			Object[] args = new Object[] { future.get().toString() };
			sucMsg = this.conversionTableName(tableFlag)
					+ " ("
					+ tableName
					+ ") "
					+ SpringUtil.getMessage("config.cgzjsj", args,
							this.getCustomLocale(""));
			;
		} catch (Exception e) {
			LOGGER.error(e);
			msg = e.getMessage();
		}

		JSONObject msgObj = new JSONObject();
		msgObj.put("msg", msg);
		msgObj.put("sucMsg", sucMsg);

		msgMap.put(tableName, msgObj);

		return msg;
	}

	/**
	 * 把数据流导入到表中
	 * 
	 * @param file
	 * @return 結果状态
	 * @throws IOException
	 * @throws SQLException
	 * @throws ExecutionException
	 * @throws InterruptedException
	 */
	public String dataStorage(MultipartFile file) throws IOException,
			SQLException, InterruptedException, ExecutionException {
		String msg = "";
		String sucMsg = "";
		String tableName = null;
		InputStream inputStream = null;
		Connection connection = null;

		Locale locale = this.getCustomLocale("");

		try {
			String fileName = file.getOriginalFilename();
			tableName = fileName.substring(0, fileName.lastIndexOf('.'));

			if (tableName == null || tableName.isEmpty()) {
				msg = SpringUtil.getMessage("config.bmcbnwk", locale);
			} else {

				if (hasTable(tableName)) {
					Object[] args = new Object[] { tableName };
					sucMsg = SpringUtil.getMessage("config.bycz", args, locale);
				} else {
					int beginIndex = tableName.lastIndexOf('_');
					int endIndex = tableName.length();

					// 获取表的标识
					String tableFlag = tableName.substring(beginIndex + 1,
							endIndex);

					// 创建数据表
					boolean createSuccess = createTable(tableFlag, tableName);

					if (createSuccess) {
						connection = this.getJDBCConnection();

						if (connection != null) {
							inputStream = file.getInputStream();
							Future<Long> future = this.doCopyFromInputStream(
									connection, tableName, inputStream);

							Object[] args = new Object[] { future.get()
									.toString() };
							sucMsg = this.conversionTableName(tableFlag)
									+ " ("
									+ tableName
									+ ") "
									+ SpringUtil.getMessage("config.cgdrtsj",
											args, locale);

							msg = SpringUtil.getMessage("config.pzsx", locale);

							// createQueryParameter(tableFlag, tableName);

							// 创建索引
							boolean createIndexSuccess = this.createIndex(
									tableFlag, tableName);
							if (!createIndexSuccess) {
								LOGGER.error("创建表 " + tableName + " 索引失败!");
							}
						} else {
							msg = SpringUtil.getMessage("config.hqsjkljsb",
									locale);
						}
					} else {
						Object[] args = new Object[] { tableName };
						msg = SpringUtil.getMessage("config.cjbsb", args,
								locale);
					}

				}
			}

		} finally {
			if (inputStream != null) {
				inputStream.close();
				inputStream = null;
			}

			if (connection != null) {
				connection.close();
			}
		}

		JSONObject msgObj = new JSONObject();
		msgObj.put("msg", msg);
		msgObj.put("sucMsg", sucMsg);

		msgMap.put(tableName, msgObj);
		return msg;
	}

	public ConfigBean loadConfig() {
		ConfigBean configBean = new ConfigBean();
		try {
			configBean.initParmeter();

			queryParameters = configBean.getQueryParameters();

			for (int i = 0, ci = queryParameters.size(); i < ci; i++) {
				QueryParameter qParameter = queryParameters.get(i);

				String key = qParameter.getKey().toLowerCase();

				String msg = loadConfigMsg(qParameter);
				configBean.setMsg(key, msg);
			}
		} catch (IOException e) {
			LOGGER.error(e);
		}

		return configBean;
	}

	/**
	 * 数据库链接信息测试
	 * 
	 * @param userName
	 * @param host
	 * @param password
	 * @param database
	 * @param port
	 * @return
	 * @throws InstantiationException
	 * @throws IllegalAccessException
	 * @throws ClassNotFoundException
	 * @throws SQLException
	 */
	public Boolean testDbConnecton(String userName, String host,
			String password, String database, String port,
			String queryParameters) throws InstantiationException,
			IllegalAccessException, ClassNotFoundException, SQLException {

		String decode_password = Base64Util.decodeBase64(password, 3);

		String url = "jdbc:postgresql://" + host + ":" + port + "/" + database;
		Connection conn = null;
		Statement statement = null;
		ResultSet rSet = null;
		try {
			Class.forName("org.postgresql.Driver").newInstance();
			conn = DriverManager.getConnection(url, userName, decode_password);
			statement = conn.createStatement();
			rSet = statement
					.executeQuery("SELECT  count(1) FROM INFORMATION_SCHEMA.TABLES ");
			if (rSet.next()) {
				rSet.getInt(1);
			}

			// 更改数据库连接的情况下更新 queryParmeters.xml 内容为没有配置表的情况
			if (!"".equals(queryParameters)) {
				ConfigBean configBean = new ConfigBean();
				configBean.setDbUserName(userName);
				configBean.setDbUrl(host);
				configBean.setDbPassword(password);
				configBean.setDbport(port);
				configBean.setDbName(database);

				JSONArray jsonArray = JSONArray.parseArray(queryParameters);

				this.updateQueryParameters(jsonArray, configBean, "all");
			}

			return true;
		} catch (IOException e) {
			LOGGER.error(e);
			return false;
		} finally {
			if (conn != null) {
				conn.close();
			}

			if (statement != null) {
				statement.close();
				statement = null;
			}

			if (rSet != null) {
				rSet.close();
			}
		}
	}

	// 获取虚拟目录下模型目录
	public String listModelData() {
		JSONArray jsonArray = new JSONArray();

		File file = new File(new StringBuilder(NPGIS_DATA_DIRECTORY)
				.append("model").append(File.separator).toString());
		if (!file.exists()) {
			file.mkdir();
			file.setReadable(true);
			LOGGER.error(NPGIS_DATA_DIRECTORY);
		}
		File[] files = file.listFiles();
		int len = files.length;
		for (int i = 0; i < len; i++) {
			File subFile = files[i];

			String subFileName = subFile.getName();
			JSONObject item = new JSONObject();
			item.put("modelName", subFileName);
			jsonArray.add(item);
		}
		return jsonArray.toString();
	}

	// 获取切片
	public String listMapTitle(String path) {
		String result = "";
		JSONArray jsonArray = new JSONArray();

		File file = new File(path);
		File[] files = file.listFiles();
		int len = files.length;
		for (int i = 0; i < len; i++) {
			File subFile = files[i];
			if (subFile.isDirectory()) {
				String subFileName = subFile.getName();
				if (!"shanghaiBaseMap".equals(subFileName)) {
					JSONObject item = new JSONObject();
					item.put("mapName", subFileName);
					jsonArray.add(item);
				}
			}
		}
		if (!jsonArray.isEmpty()) {
			result = jsonArray.toString();
		}
		return result;
	}

	// 获取本地语言
	public Locale getCustomLocale(String lang) {
		Locale locale = null;

		if (lang.indexOf("_") != -1) {
			String[] langs = lang.split("_");
			locale = new Locale(langs[0], langs[1]);
		} else {
			locale = LocaleContextHolder.getLocale();
		}

		return locale;
	}

	public String listDbTable() {
		JSONObject result = new JSONObject();
		JSONObject selectObject = new JSONObject();

		for (int i = 0, ci = queryParameters.size(); i < ci; i++) {
			QueryParameter qParameter = queryParameters.get(i);

			String key = qParameter.getKey().toLowerCase();
			String tableName = qParameter.getTableName();

			if (tableName == null) {
				tableName = "";
			}

			if (!"city".equals(key) && !"bussiness".equals(key)) {
				selectObject.put(key, tableName);
			}
		}

		result.put("tables", this.listTableFromDb(selectObject));
		result.put("selectedValue", selectObject);

		return result.toJSONString();
	}

	/**
	 * 导入数据操作结果信息
	 * 
	 * @param fullName
	 *            表名称+.csv
	 * @return 成功或者失败的信息
	 */
	public JSONObject getCopyMsg(String fullName) {
		JSONObject msg = new JSONObject();

		int endIndex = fullName.lastIndexOf('.');
		if (endIndex != -1) {

			String tableName = fullName.substring(0, endIndex);

			if (msgMap.containsKey(tableName)) {
				msg = (JSONObject) msgMap.get(tableName);
				msgMap.remove(tableName);
			}
		}
		return msg;
	}

	/**
	 * 验证数据表是否配置
	 * 
	 * @param tableKey
	 *            ： roadNet 路网、RoadCross 路口、poi 兴趣点、road 道路、panoconfig
	 *            室外全景、snpanopoint 室内全景点位、snpanoconfig 室内全景配置
	 * @return
	 */
	public String verifyTableConfigured(String tableKey) {
		JSONObject result = new JSONObject();
		boolean configured = false;
		int size = this.queryParameters.size();

		for (int i = 0; i < size; i++) {
			QueryParameter qParameter = queryParameters.get(i);
			String key = qParameter.getKey().toLowerCase();

			if (key.equals(tableKey.toLowerCase())) {
				String tableName = qParameter.getTableName();
				if (!"".equals(tableName)) {
					configured = true;
					break;
				}
			}
		}
		result.put("configured", configured);

		return result.toString();
	}

	/**
	 * 更新 queryParmeters.xml
	 * 
	 * @param jsonArray
	 *            界面上选择的表名称
	 * @param type
	 *            区分是数据库连接信息测试提交还是整个配置界面提交。数据库测试提交 db、整个配置界面提交 all
	 * @return
	 * @throws IOException
	 */
	public String updateQueryParameters(JSONArray jsonArray,
			ConfigBean configBean, String type) throws IOException {
		if (jsonArray.size() > 0) {
			proSelectedTableName(jsonArray);
		}
		configBean.setQueryParameters(queryParameters);
		configBean.saveConfig();
		reloadConnInfo(type);

		// 自定义函数
		createFunction();

		return "";
	}

	public DataResult removeServiceConfig(String name, String mapType) {
		DataResult result = new DataResult();

		if ("model".equals(mapType)) {
			String tableName = name + "_model";
			try {
				if (!this.dropModelAttrTable(tableName)) {
					LOGGER.error("删除模型属性表 " + tableName + "失败!");
					Object[] args = new Object[] { tableName };
					result.setError(SpringUtil.getMessage("manager.scmxbsb",
							args, this.getCustomLocale("")));
					return result;
				}
			} catch (SQLException e) {
				LOGGER.error("删除模型属性表 " + tableName + "失败!" + e);
				Object[] args = new Object[] { tableName };
				result.setError(SpringUtil.getMessage("manager.scmxbsb", args,
						this.getCustomLocale("")));
				return result;
			}
		}

		CompactMap configMap = NetposaHelper.getMapConfigByMapName(name);
		if (configMap == null) {
			Object[] args = new Object[] { name };
			result.setError(SpringUtil.getMessage("manager.fwbcz", args,
					this.getCustomLocale("")));
			return result;
		}
		List<CompactMap> list = NetposaHelper.getMapConfig();
		list.remove(configMap);
		CompactMap.saveConfigs(list);
		return result;
	}

	public DataResult addMapConfig(String name, String title, String titleUrl,
			String mapType, String confPath) {
		return this.addServiceConfig(name, title, titleUrl, mapType, confPath,
				"map", "");
	}

	public DataResult addModelConfig(String name, String title,
			String titleUrl, String mapType, String table) {
		return this.addServiceConfig(name, title, titleUrl, mapType, "",
				"model", table);
	}

	private DataResult addServiceConfig(String name, String title,
			String titleUrl, String mapType, String confPath,
			String serviceType, String table) {
		DataResult result = new DataResult();
		if (NetposaHelper.isEmpty(name)) {
			result.setError(SpringUtil.getMessage("manager.mcbnwk",
					this.getCustomLocale("")));
			return result;
		}
		if (NetposaHelper.getMapConfigByMapName(name) != null) {
			Object[] args = new Object[] { name };
			result.setError(SpringUtil.getMessage("manager.ycz", args,
					this.getCustomLocale("")));
			return result;
		}
		if (NetposaHelper.isEmpty(title)) {
			title = name;
		}

		if ("model".equals(serviceType)) {
			if (NetposaHelper.isEmpty(titleUrl)
					|| "model/".equalsIgnoreCase(titleUrl)) {
				result.setError(SpringUtil.getMessage("manager.mxdzbzq",
						this.getCustomLocale("")));
				return result;
			}

			if ("y".equals(table)) {
				// 创建表
				String tableName = name + "_model";
				try {
					if (hasTable(tableName)) {
						LOGGER.error("模型属性表 " + tableName + "以及存在!");
						Object[] args = new Object[] { tableName };
						result.setError(SpringUtil.getMessage(
								"manager.mxsxbyjcz", args,
								this.getCustomLocale("")));
						return result;
					}

					if (!this.createModelAttrTable(tableName)) {
						LOGGER.error("创建模型属性表 " + tableName + "失败!");
						Object[] args = new Object[] { tableName };
						result.setError(SpringUtil.getMessage(
								"manager.cjmxbsb", args,
								this.getCustomLocale("")));

						return result;
					}
				} catch (SQLException e) {
					LOGGER.error("创建模型属性表 " + tableName + "失败!" + e);
					Object[] args = new Object[] { tableName };
					result.setError(SpringUtil.getMessage("manager.cjmxbsb",
							args, this.getCustomLocale("")));
					return result;
				}
			}
		} else {
			if (NetposaHelper.isEmpty(titleUrl)
					|| "mapTitle/".equalsIgnoreCase(titleUrl)) {
				result.setError(SpringUtil.getMessage("manager.qpdzbzq",
						this.getCustomLocale("")));
				return result;
			}
		}

		if (NetposaHelper.isEmpty(mapType)) {
			result.setError(SpringUtil.getMessage("manager.dtlxbzq",
					this.getCustomLocale("")));
			return result;
		}
		CompactMap config = new CompactMap();
		config.setMapType(mapType);
		config.setName(name);
		config.setTitle(title);
		config.setMapUrl(titleUrl);

		if (!"model".equals(serviceType)) {
			config.setType(CompactMap.getMapStyle(confPath));// 区分是否为风格化
		} else {
			config.setType("model");
			if ("y".equals(table)) {
				config.setTable(table);
			}
		}

		List<CompactMap> list = NetposaHelper.getMapConfig();
		list.add(config);
		CompactMap.saveConfigs(list);
		return result;
	}

	/**
	 * 数据导入部分提示信息
	 * 
	 * @param qParameter
	 * @return
	 */
	private String loadConfigMsg(QueryParameter qParameter) {
		String key = qParameter.getKey().toLowerCase();
		String tableName = qParameter.getTableName();
		tableName = tableName == null ? "" : tableName;

		StringBuilder msg = new StringBuilder();

		Locale locale = this.getCustomLocale("");

		Object[] args = new Object[1];
		args[0] = this.conversionTableName(key);

		if (!"".equals(tableName)) {
			msg.append(SpringUtil.getMessage("config.ypzb", args, locale))
					.append(" (" + tableName + ")");
		} else {
			msg.append(SpringUtil.getMessage("config.myb", args, locale));
		}

		return msg.toString();
	}

	// 获取数据库中除指定表外的所有表
	private JSONArray listTableFromDb(JSONObject selectObject) {
		JSONArray tableArray = new JSONArray();
		String sql = "SELECT tablename FROM pg_tables ORDER BY tablename;";
		try (Connection connection = this.connectDataBase();
				Statement statement = connection.createStatement();
				ResultSet rs = statement.executeQuery(sql)) {
			while (rs.next()) {

				String tableName = (String) rs.getObject("tablename");

				if (!selectObject.containsValue(tableName)) {
					JSONObject obj = new JSONObject();
					obj.put("tablename", tableName);
					tableArray.add(obj);
				}
			}
		} catch (Exception e) {
			LOGGER.error(e);
		}

		return tableArray;
	}

	// 处理选择表名称的情况
	private void proSelectedTableName(JSONArray jsonArray) {
		for (int i = 0, ci = jsonArray.size(); i < ci; i++) {
			JSONObject object = (JSONObject) jsonArray.get(i);
			// 标识，区分是什么表
			String keyTemp = object.getString("key").toLowerCase().split("-")[1];
			// 选择的数据表名称
			String value = object.getString("value");

			// 构建queryParameter
			this.createQueryParameter(keyTemp, value);

			String msg = conversionTableName(keyTemp)
					+ " ("
					+ value
					+ ") "
					+ SpringUtil.getMessage("config.cgdrsj",
							this.getCustomLocale(""));
			msgMap.put(value, msg);
		}
	}

	private void createQueryParameter(String tableFlag, String tableName) {
		String lowerCaseTableFlag = tableFlag.toLowerCase();

		for (int i = 0, ci = this.queryParameters.size(); i < ci; i++) {
			QueryParameter queryParameter = queryParameters.get(i);
			String key = queryParameter.getKey().toLowerCase();

			if (lowerCaseTableFlag.equals(key)) {
				queryParameter.setTableName(tableName);

				if (tableName != null && tableName.length() != 0) {
					queryParameter.setSeqName(tableName + "_gid_seq");
				} else {
					queryParameter.setSeqName("");
				}
			}
		}
	}

	// 获取表的中文名称
	private String conversionTableName(final String tableFlag) {
		String key = "config.lw";
		String lowerCaseTableFlag = tableFlag.toLowerCase();
		if ("roadnet".equals(lowerCaseTableFlag)) {
			key = "config.lw";
		} else if ("poi".equals(lowerCaseTableFlag)) {
			key = "config.xqd";
		} else if ("roadcross".equals(lowerCaseTableFlag)) {
			key = "config.lk";
		} else if ("road".equals(lowerCaseTableFlag)) {
			key = "config.dl";
		} else if ("panoconfig".equals(lowerCaseTableFlag)) {
			key = "config.swqj";
		} else if ("snpanopoint".equals(lowerCaseTableFlag)) {
			key = "config.snqjdw";
		} else if ("snpanoconfig".equals(lowerCaseTableFlag)) {
			key = "config.snqjpz";
		} else if ("district".equals(lowerCaseTableFlag)) {
			key = "config.xzqh";
		} else if ("model".equals(lowerCaseTableFlag)) {
			key = "模型";
		}
		return SpringUtil.getMessage(key, this.getCustomLocale(""));
	}

	/**
	 * 把输入流导入到指定的表中,全景csv数据是带表头的，其它都不带表头
	 * 
	 * @param tableName
	 *            表明称
	 * @param inputStream
	 *            导入数据的输入流
	 * @return
	 */
	private Future<Long> doCopyFromInputStream(Connection connection,
			String tableName, InputStream inputStream) {
		// 创建一个使用单个 worker 线程的 Executor
		ExecutorService exec = Executors.newSingleThreadExecutor();

		StringBuilder sql = new StringBuilder("COPY ").append(tableName);

		if (tableName.lastIndexOf("panoconfig") != -1
				&& tableName.lastIndexOf("snpanoconfig") == -1) {
			sql.append("(panoid,x,y,heading,northdir,roll,pitch,type,name)")
					.append(" FROM STDIN WITH CSV HEADER;");
		} else if (tableName.lastIndexOf("snpanoconfig") != -1) {
			sql.append(
					"(panoid,name,heading,northdir,roll,pitch,floor,isstart,type,parentid)")
					.append(" FROM STDIN WITH CSV HEADER;");
		} else if (tableName.lastIndexOf("snpanopoint") != -1) {
			sql.append("(name,x,y,uuid)")
					.append(" FROM STDIN WITH CSV HEADER;");
		} else if (tableName.lastIndexOf("district") != -1) {
			sql.append("(name,code,geom,center)").append(
					" FROM STDIN WITH CSV;");
			// .append(" FROM STDIN WITH CSV HEADER;");
		} else if (tableName.lastIndexOf("model") != -1) {
			sql.append("(mid,smid,name,description,floor,x,y,h)").append(
					" FROM STDIN WITH CSV;");
		} else {
			if (tableName.lastIndexOf("roadnet") != -1) {
				sql.append("(gid,name,width,type,geom,length,car,walk,speed,highspeed,np_level,quanpin,szm,innode,outnode,direction)");
			}
			sql.append(" FROM STDIN DELIMITER ',' NULL AS 'NULL' CSV QUOTE AS '\"'");
		}

		PostgresqlCopyTask copyTask = new PostgresqlCopyTask(connection,
				sql.toString(), inputStream);
		Future<Long> future = exec.submit(copyTask);
		// 关闭线程池
		exec.shutdown();

		return future;
	}

	/**
	 * 根据导入文件名称创建表
	 * 
	 * @param tableFlag
	 *            区分是什么表
	 * @param tableName
	 *            表名称
	 * @return 是否创建成功，true 成功。false 失败
	 * @throws SQLException
	 */
	private boolean createTable(final String tableFlag, final String tableName)
			throws SQLException {
		boolean isSuccess = false;

		String sql = this.getSql(tableFlag, tableName);

		try (Connection connection = this.connectDataBase();
				Statement statement = connection.createStatement()) {
			statement.execute(sql);
			isSuccess = true;
		} catch (Exception e) {
			LOGGER.error(e);
		}

		return isSuccess;
	}

	/**
	 * 判断数据库中表是否存在 存在返回true 否则false
	 * 
	 * @param tableName
	 * @return
	 */
	private boolean hasTable(final String tableName) {
		boolean isSuccess = false;
		String sql = "SELECT count(*) AS count FROM pg_class WHERE relname = '"
				+ tableName + "'";
		try (Connection connection = this.connectDataBase();
				Statement statement = connection.createStatement();
				ResultSet rs = statement.executeQuery(sql)) {
			while (rs.next()) {
				if (rs.getInt("count") > 0) {
					isSuccess = true;
				}
			}
		} catch (Exception e) {
			LOGGER.error(e);
		}

		return isSuccess;
	}

	/**
	 * 创建表sql
	 * 
	 * @param tableFlag
	 *            区分表类型标识
	 * @param tableName
	 *            表名称
	 * @return 创建表 sql 语句
	 */
	private String getSql(final String tableFlag, final String tableName) {
		StringBuilder sqlBuilder = new StringBuilder();
		String lowerCaseTableFlag = tableFlag.toLowerCase();

		// 表存在先DROP
		// sqlBuilder.append("DROP TABLE IF EXISTS \"public\".\"" + tableName +
		// "\";");
		sqlBuilder.append(getCreateSql(lowerCaseTableFlag, tableName));

		return sqlBuilder.toString();
	}

	/**
	 * 路网表、路口表和兴趣点表sql
	 * 
	 * @param tableName
	 *            表名称
	 * @return 创建表 sql 语句
	 */
	private String getCreateSql(String tableFlag, String tableName) {
		StringBuilder sqlBuilder = new StringBuilder();

		// 序列存在先DROP
		sqlBuilder.append("DROP SEQUENCE IF EXISTS public.").append(tableName)
				.append("_gid_seq CASCADE;");

		// 创建序列
		sqlBuilder
				.append("CREATE SEQUENCE public.")
				.append(tableName)
				.append("_gid_seq INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1;");

		sqlBuilder.append("ALTER SEQUENCE public.").append(tableName)
				.append("_gid_seq OWNER TO postgres;");

		// 索引存在先DROP
		// if (!"panoconfig".equals(tableFlag)) {
		if (tableFlag.indexOf("pano") == -1) {
			sqlBuilder.append("DROP INDEX CONCURRENTLY IF EXISTS ")
					.append(tableName).append("_geom_idx;");

			sqlBuilder.append("DROP INDEX CONCURRENTLY IF EXISTS ")
					.append(tableName).append("_name_gin_idx;");

			sqlBuilder.append("DROP INDEX CONCURRENTLY IF EXISTS ")
					.append(tableName).append("_szm_gin_idx;");

			sqlBuilder.append("DROP INDEX CONCURRENTLY IF EXISTS ")
					.append(tableName).append("_quanpin_gin_idx;");
		}

		switch (tableFlag) {
		case "roadnet":
			sqlBuilder.append(getRoadnetSql(tableName));
			break;
		case "poi":
			sqlBuilder.append("DROP INDEX CONCURRENTLY IF EXISTS ")
					.append(tableName).append("_type_gin_idx;")
					.append(getPoiSql(tableName));
			break;
		case "road":
			sqlBuilder.append(getRoadSql(tableName));
			break;
		case "panoconfig":
			sqlBuilder.append(getPanoconfigSql(tableName));
			break;
		case "snpanopoint":
			sqlBuilder.append(getSnpanopointSql(tableName));
			break;
		case "snpanoconfig":
			sqlBuilder.append(getSnpanoconfigSql(tableName));
			break;
		default:
			sqlBuilder.append(getRoadcross(tableName));
			break;
		}

		// 设置主键
		sqlBuilder.append("ALTER TABLE ONLY ").append(tableName)
				.append(" ADD CONSTRAINT ").append(tableName)
				.append("_pkey PRIMARY KEY (gid);");

		sqlBuilder.append("ALTER TABLE public. ").append(tableName)
				.append(" OWNER TO postgres;");

		return sqlBuilder.toString();
	}

	private boolean createIndex(final String tableFlag, String tableName) {

		boolean isSuccess = false;

		String sql = this.getIndexSql(tableFlag, tableName);

		try (Connection connection = this.connectDataBase();
				Statement statement = connection.createStatement()) {
			statement.execute(sql);
			isSuccess = true;
		} catch (Exception e) {
			LOGGER.error(e);
		}

		return isSuccess;
	}

	private String getIndexSql(final String tableFlag, String tableName) {
		StringBuilder sqlBuilder = new StringBuilder();
		String lowerCaseTableFlag = tableFlag.toLowerCase();

		if (lowerCaseTableFlag.indexOf("pano") == -1) {
			sqlBuilder.append("CREATE INDEX ").append(tableName)
					.append("_geom_idx").append(" ON ").append(tableName)
					.append(" USING gist(geom);");

			sqlBuilder.append("CREATE INDEX ").append(tableName)
					.append("_name_gin_idx").append(" ON ").append(tableName)
					.append(" USING gin(name gin_trgm_ops);");

			sqlBuilder.append("CREATE INDEX ").append(tableName)
					.append("_szm_idx").append(" ON ").append(tableName)
					.append(" USING gin(to_tsvector('english', szm));");

			sqlBuilder.append("CREATE INDEX ").append(tableName)
					.append("_quanpin_idx").append(" ON ").append(tableName)
					.append(" USING gin(to_tsvector('english', quanpin));");
		}

		if ("poi".equals(lowerCaseTableFlag)) {
			sqlBuilder.append("CREATE INDEX ").append(tableName)
					.append("_addr_gin_idx").append(" ON ").append(tableName)
					.append(" USING gin (r_addr gin_trgm_ops);");
		}

		return sqlBuilder.toString();
	}

	/*
	 * 路网表sql，创建表,
	 * 必须的16个字段：gid,name,width,type,geom,length,car,walk,speed,highspeed
	 * ,np_level,quanpin,szm,innode,outnode,direction
	 */
	private String getRoadnetSql(String tableName) {
		StringBuilder sqlBuilder = new StringBuilder("CREATE TABLE ")
				.append(tableName).append(" (gid int4 DEFAULT nextval('")
				.append(tableName).append("_gid_seq")
				.append("'::regclass) NOT NULL,").append("name varchar(255),")
				.append("width varchar(255),").append("type varchar(255),")
				.append("geom public.geometry,").append("length float8,")
				.append("car int4,").append("walk int4,")
				.append("speed float8,").append("highspeed int4,")
				.append("np_level int4,").append("quanpin varchar(254),")
				.append("szm varchar(254),").append("innode int4,")
				.append("outnode int4,").append("direction int4").append(")")
				.append("WITH (OIDS=FALSE);");

		return sqlBuilder.toString();
	}

	/*
	 * 兴趣点sql，创建表,必须的11个字段：gid,name,x,y,r_addr,type,phone,districtname,geom,quanpin
	 * ,szm
	 */
	private String getPoiSql(String tableName) {
		StringBuilder sqlBuilder = new StringBuilder("CREATE TABLE ")
				.append(tableName).append(" (gid int4 DEFAULT nextval('")
				.append(tableName).append("_gid_seq")
				.append("'::regclass) NOT NULL,").append("name varchar(255),")
				.append("x varchar(255),").append("y varchar(255),")
				.append("r_addr varchar(255),").append("type varchar(255),")
				.append("phone varchar(255),")
				.append("districtname varchar(255),")
				.append("geom public.geometry,")
				.append("quanpin varchar(254),").append("szm varchar(254)")
				.append(")").append("WITH (OIDS=FALSE);");

		return sqlBuilder.toString();
	}

	/*
	 * 路口表sql，创建表,必须的9个字段：gid,first_name,second_nam,x,y,name,geom,quanpin,szm
	 */
	private String getRoadcross(String tableName) {
		StringBuilder sqlBuilder = new StringBuilder("CREATE TABLE ")
				.append(tableName).append(" (gid int4 DEFAULT nextval('")
				.append(tableName).append("_gid_seq")
				.append("'::regclass) NOT NULL,")
				.append("first_name varchar(255),")
				.append("second_nam varchar(255),").append("x varchar(255),")
				.append("y varchar(255),").append("name varchar(255),")
				.append("geom public.geometry,")
				.append("quanpin varchar(254),").append("szm varchar(254)")
				.append(")").append("WITH (OIDS=FALSE);");

		return sqlBuilder.toString();
	}

	/*
	 * 道路表sql，创建表, 必须的4个字段：gid,name,geom,quanpin,szm,district
	 */
	private String getRoadSql(String tableName) {
		StringBuilder sqlBuilder = new StringBuilder("CREATE TABLE ")
				.append(tableName).append(" (gid int4 DEFAULT nextval('")
				.append(tableName).append("_gid_seq")
				.append("'::regclass) NOT NULL,")
				.append("name varchar(255) NOT NULL,")
				.append("geom public.geometry,")
				.append("quanpin varchar(254),").append("szm varchar(254),")
				.append("districtname varchar(255)").append(")")
				.append("WITH (OIDS=FALSE);");

		return sqlBuilder.toString();
	}

	/*
	 * 室外全景配置表,字段：gid,panoid,type,name,x,y,position,northdir,heading,roll,pitch
	 */
	private String getPanoconfigSql(String tableName) {
		StringBuilder sqlBuilder = new StringBuilder("CREATE TABLE ")
				.append(tableName).append(" (gid int4 DEFAULT nextval('")
				.append(tableName).append("_gid_seq")
				.append("'::regclass) NOT NULL,")
				.append("panoid varchar(255) NOT NULL,")
				.append("type varchar(255),").append("name varchar(255),")
				.append("x NUMERIC,").append("y NUMERIC,")
				.append("northdir NUMERIC,").append("heading NUMERIC,")
				.append("roll NUMERIC,").append("pitch NUMERIC").append(")")
				.append("WITH (OIDS=FALSE);");

		return sqlBuilder.toString();
	}

	/*
	 * 室内全景点位表,字段：gid，name，x,y,uuid
	 */
	private String getSnpanopointSql(String tableName) {
		StringBuilder sqlBuilder = new StringBuilder("CREATE TABLE ")
				.append(tableName).append(" (gid int4 DEFAULT nextval('")
				.append(tableName).append("_gid_seq")
				.append("'::regclass) NOT NULL,").append("name varchar(255),")
				.append("x NUMERIC,").append("y NUMERIC,")
				.append("uuid varchar(36)").append(")")
				.append("WITH (OIDS=FALSE);");

		return sqlBuilder.toString();
	}

	/*
	 * 室内全景配置表,字段：gid，panoid,name,heading,northdir,roll,pitch,floor,isstart,type,
	 * parentid
	 */
	private String getSnpanoconfigSql(String tableName) {
		StringBuilder sqlBuilder = new StringBuilder("CREATE TABLE ")
				.append(tableName).append(" (gid int4 DEFAULT nextval('")
				.append(tableName).append("_gid_seq")
				.append("'::regclass) NOT NULL,").append("panoid varchar(36),")
				.append("name varchar(255),").append("heading NUMERIC,")
				.append("northdir NUMERIC,").append("roll NUMERIC,")
				.append("pitch NUMERIC,").append("floor NUMERIC,")
				.append("isstart NUMERIC,").append("type varchar(50),")
				.append("parentid varchar(36)").append(")")
				.append("WITH (OIDS=FALSE);");

		return sqlBuilder.toString();
	}

	// 创建模型属性表
	private boolean createModelAttrTable(final String tableName)
			throws SQLException {
		String sql = this.getCreateModelAttrTableSql(tableName);
		return this.modelAttrTableOpt(sql);
	}

	// 删除模型属性表
	private boolean dropModelAttrTable(final String tableName)
			throws SQLException {
		String sql = this.getDropModelAttrTableSql(tableName);
		return this.modelAttrTableOpt(sql);
	}

	private boolean modelAttrTableOpt(String sql) throws SQLException {
		boolean isSuccess = false;
		try (Connection connection = this.connectDataBase();
				Statement statement = connection.createStatement()) {
			statement.execute(sql);
			isSuccess = true;
		} catch (Exception e) {
			LOGGER.error(e);
		}

		return isSuccess;
	}

	/**
	 * 根据smid 和 模型表名 搜索信息
	 * 
	 * @param smId
	 * @param table
	 * @return
	 * @throws DataAccessException
	 */
	public org.json.simple.JSONArray getModelBySmid(String smId, String table)
			throws DataAccessException {
		return this.preparedQuery(
				new StringBuilder("SELECT * FROM ").append(table)
						.append(" WHERE smid = ?").toString(),
				new Object[] { Integer.parseInt(smId) });

	}

	public org.json.simple.JSONArray getModelByName(String name, String table)
			throws Exception {
		StringBuilder sql = new StringBuilder("SELECT * FROM ").append(table)
				.append(" WHERE name like ? Or description like ?");
		return this.preparedQuery(sql.toString(), new Object[] { "%" + name
				+ "%","%" + name
				+ "%" });
	}

	public org.json.simple.JSONArray getModelByMid(String mId, String table)
			throws Exception {
		StringBuilder sql = new StringBuilder("SELECT * FROM ").append(table)
				.append(" WHERE mid = ?");
		return this.preparedQuery(sql.toString(),
				new Object[] { (mId) });
	}

	// 创建模型属性信息表sql
	private String getCreateModelAttrTableSql(String tableName) {
		StringBuilder sqlBuilder = new StringBuilder();
		// 序列存在先DROP
		sqlBuilder.append("DROP SEQUENCE IF EXISTS public.").append(tableName)
				.append("_gid_seq CASCADE;");

		sqlBuilder.append("DROP TABLE IF EXISTS public.").append(tableName)
				.append(" CASCADE;");

		sqlBuilder
				.append("CREATE SEQUENCE public.")
				.append(tableName)
				.append("_gid_seq INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1;");

		sqlBuilder.append("CREATE TABLE ").append(tableName)
				.append(" (gid int4 DEFAULT nextval('").append(tableName)
				.append("_gid_seq").append("'::regclass) NOT NULL,")
				.append("mid varchar(50),").append("smid int4,")
				.append("name varchar(255),").append("description text,")
				.append("floor int4,").append("x float8,").append("y float8,")
				.append("h float8").append(")").append("WITH (OIDS=FALSE);");

		sqlBuilder.append("ALTER TABLE ONLY ").append(tableName)
				.append(" ADD CONSTRAINT ").append(tableName)
				.append("_pkey PRIMARY KEY (gid);");

		sqlBuilder.append("ALTER TABLE public. ").append(tableName)
				.append(" OWNER TO postgres;");

		return sqlBuilder.toString();
	}

	// drop 模型属性信息表sql
	private String getDropModelAttrTableSql(String tableName) {
		StringBuilder sqlBuilder = new StringBuilder();
		// 序列存在先DROP
		sqlBuilder.append("DROP SEQUENCE IF EXISTS public.").append(tableName)
				.append("_gid_seq CASCADE;");

		// drop table
		sqlBuilder.append("DROP TABLE IF EXISTS public.").append(tableName)
				.append(" CASCADE;");

		return sqlBuilder.toString();
	}

	// 创建自定义函数，字符串处理，取分隔符数组中最先出现的分隔符之前的部分
	private void createFunction() {
		DAOFactory poolDAOFactory = DAOFactory.getDAOFactory(DAOFactory.POOL);
		IPoolBaseDAO dao = (IPoolBaseDAO) poolDAOFactory.getBaseDao();

		StringBuilder sqlBuilder = new StringBuilder();

		sqlBuilder
				.append("CREATE OR REPLACE FUNCTION np_string_extract(str text,separators text[]) RETURNS text AS ")
				.append("$func$ ")
				.append("DECLARE")
				.append("    separator_index int:= 999;")
				.append("       separator_indexTemp int:= 0;")
				.append("       separator text;")
				.append("       res text := str;")
				.append("BEGIN")
				.append("       FOREACH separator IN ARRAY separators LOOP")
				.append("               separator_indexTemp = position(separator in str);")
				.append("               IF separator_indexTemp !=0 AND separator_indexTemp < separator_index THEN")
				.append("                       separator_index = separator_indexTemp;")
				.append("               END IF;")
				.append("       END LOOP;")
				.append("       IF separator_index != 0 AND separator_index != 999 THEN")
				.append("            res := left(str,separator_index - 1);")
				.append("       END IF;").append("    RETURN res;")
				.append("END").append("$func$ LANGUAGE plpgsql;");

		try {
			dao.insert(sqlBuilder.toString());
		} catch (SQLException e) {
			LOGGER.error(e);
		}
	}
}
