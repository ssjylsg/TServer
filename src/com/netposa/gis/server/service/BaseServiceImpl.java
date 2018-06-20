package com.netposa.gis.server.service;

import com.netposa.gis.server.bean.QueryParameterCollection;
import com.netposa.gis.server.bean.TableKeyEnum;
import com.netposa.gis.server.dao.DAOFactory;
import com.netposa.gis.server.dao.IPoolBaseDAO;
import com.netposa.gis.server.exception.DataAccessException;
import com.netposa.gis.server.utils.DBManager;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.geotools.data.DataStore;
import org.geotools.data.DataStoreFinder;
import org.geotools.data.simple.SimpleFeatureSource;
import org.geotools.feature.FeatureIterator;
import org.geotools.graph.build.feature.FeatureGraphGenerator;
import org.geotools.graph.build.line.DirectedLineStringGraphGenerator;
import org.geotools.graph.structure.Graph;
import org.geotools.graph.structure.basic.BasicDirectedEdge;
import org.json.simple.JSONArray;
import org.opengis.feature.simple.SimpleFeature;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;
import java.sql.Connection;
import java.util.Locale;
import java.util.Map;

@Component
public class BaseServiceImpl implements IBaseService {

	private static final Log LOGGER = LogFactory.getLog(BaseServiceImpl.class);

	// npgisData 目录
	static String NPGIS_DATA_DIRECTORY;

	static DataStore pgDatastore = null;
	Boolean isMutileRoute = false;
	// 路网拓扑
	static Graph networkGraph = null;
	// 路网拓扑是否有向
	static boolean directedGraph = true;

	static {
		String classPath = Thread.currentThread().getContextClassLoader()
				.getResource("/").getPath();
		String rootPath = "";
		// windows
		LOGGER.info(classPath);
		if ("\\".equals(File.separator)) {
			int tomcatIndex = classPath.indexOf("/apache-tomcat");
			if (tomcatIndex != -1) {
				rootPath = classPath.substring(1, tomcatIndex);
			} else {
				classPath = classPath.substring(1,
						classPath.lastIndexOf("netposa"));
				rootPath = new File(classPath).getParent();
			}

			rootPath = rootPath.replace("/", "\\");
			LOGGER.info("LSG" + rootPath);
		}
		// linux
		if ("/".equals(File.separator)) {
			rootPath = classPath.substring(0,
					classPath.indexOf("/apache-tomcat"));
			rootPath = rootPath.replace("\\", "/");
		}

		StringBuilder npgisDataPath = new StringBuilder(rootPath)
				.append(File.separator).append("npgisData")
				.append(File.separator);

		NPGIS_DATA_DIRECTORY = npgisDataPath.toString();
		try {
			LOGGER.info(NPGIS_DATA_DIRECTORY);
			File dir = new File(NPGIS_DATA_DIRECTORY);
			if (!dir.exists()) {
				dir.mkdir();
				dir.setReadable(true, true);
				dir.setExecutable(true, false);
				dir.setWritable(true, false);
			}
		} catch (Exception e) {
			LOGGER.error(e);
		}

		LOGGER.info(NPGIS_DATA_DIRECTORY);
	}

	/**
	 * 创建org.geotools.data.DataStore 实例
	 */
	void createDataStore(String layer) {
		Map<String, Object> params = DBManager.getConnParams();
		try {
			if (pgDatastore != null) {
				closeDataStore();
			}

			pgDatastore = DataStoreFinder.getDataStore(params);
		} catch (IOException e) {
			LOGGER.error(e);
		}
	}

	/**
	 * 获取数据库连接
	 * 
	 * @return
	 */
	Connection getConnection() {
		return this.connectDataBase();
	}

	/**
	 * 获取数据库连接
	 * 
	 * @return
	 */
	Connection getJDBCConnection() {
		return DBManager.getJDBCConnection();
	}

	/**
	 * 重新读取数据库配置信息
	 */
	synchronized void reloadConnInfo(String type) {
		boolean isReLoad = DBManager.reloadConInfo();
		if (isReLoad && "all".equalsIgnoreCase(type)) {
			String layer = QueryParameterCollection.getInstance()
					.getTableNameByKey(TableKeyEnum.ROADNET);
			if (layer != null && !"".equals(layer)) {
				// 配置界面数据库连接信息提交时不创建DataStore
				// createDataStore(layer);
				createNetworkGraph(layer);
			} else {
				LOGGER.error("没有路网表配置，不能创建 DataStore!");
			}
		}
	}

	/**
	 * 从连接池获取数据库连接
	 * 
	 * @return
	 */
	Connection connectDataBase() {
		return DBManager.getConnecion();
	}

	/**
	 * 关闭数据库连接，归还到连接池
	 * 
	 * @param connection
	 */
	void closeConnection(Connection connection) {
		DBManager.closeConnection(connection);
	}

	@Override
	public void closeDataStore() {
		if (pgDatastore != null) {
			try {
				pgDatastore.dispose();
				pgDatastore = null;
			} catch (Exception e) {
				LOGGER.error(e);
			}
		}
	}

	// 读取指定类型名的地理特征
	@SuppressWarnings("all")
	public SimpleFeatureSource getFeatureSource(String layer) {
		SimpleFeatureSource simpleFeatureSource = null;
		try {
			if (pgDatastore == null) {
				createDataStore(layer);
			}
			simpleFeatureSource = pgDatastore.getFeatureSource(layer);
		} catch (IOException e) {
			LOGGER.error(e);
		}
		return simpleFeatureSource;
	}

	// 取得POSTGIS中所有的地理图层
	public String[] getAllLayers() {
		try {
			return pgDatastore.getTypeNames();

		} catch (IOException e) {
			LOGGER.error(e);
		}
		return new String[] {};
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

	// 路网拓扑 direction：1 正向 -1 反向 0双向
	private void createNetworkGraph(String layer) {
		isMutileRoute = false;
		directedGraph = true;

		FeatureIterator<SimpleFeature> iter = null;
		FeatureGraphGenerator graphGen = new FeatureGraphGenerator(
				new DirectedLineStringGraphGenerator());
		try {
			iter = this.getFeatureSource(layer).getFeatures().features();
			while (iter.hasNext()) {
				SimpleFeature feature = iter.next();
				BasicDirectedEdge edge = (BasicDirectedEdge) graphGen
						.add(feature);

				Object directionObj = feature.getAttribute("direction");

				if (directionObj == null && directedGraph) {
					directedGraph = false;
					LOGGER.error("路网数据为无向数据");
				}

				Object innodeObj = feature.getAttribute("innode");
				Object outnodeObj = feature.getAttribute("outnode");

				if (innodeObj != null && outnodeObj != null) {
					edge.getInNode().setID((Integer) innodeObj);
					edge.getOutNode().setID((Integer) outnodeObj);
				}
			}

			networkGraph = null;
			networkGraph = graphGen.getGraph();
		} catch (IOException e) {
			LOGGER.error(e);
		} finally {
			if (iter != null) {
				iter.close();
			}
		}
	}

	protected IPoolBaseDAO getDao() {
		return DAOFactory.getDAOFactory(2).getBaseDao();
	}

	protected JSONArray preparedQuery(String sql, Object... params)
			throws DataAccessException {
		return this.getDao().preparedQuery(sql, params);
	}

}
