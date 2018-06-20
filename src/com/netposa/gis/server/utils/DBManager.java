package com.netposa.gis.server.utils;

import com.alibaba.druid.pool.DruidDataSource;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.stereotype.Component;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

/**
 * 数据库连接管理
 * 
 * @author wj
 *
 */
@Component
public class DBManager {

	private static final Log LOGGER = LogFactory.getLog(DBManager.class);

	private static DruidDataSource ds = null;

	// 密码
	private static String password;
	// 用户名
	private static String user;
	// 端口
	private static String port;
	// 数据库服务器ip
	private static String host;
	// 数据库名称
	private static String database;

	static {
		boolean isLoad = loadConInfo();
		if (isLoad) {
			createDataSource();
		} else {
		    LOGGER.error("加载 config.properties 失败!");
		}
	}
	
	private DBManager(){
		super();
	}

	/**
	 * 获取JDBC连接
	 * 
	 * @return
	 */
	public static Connection getJDBCConnection() {
		Connection conn = null;
		String connectionUrl = "jdbc:postgresql://" + host + ":" + port + "/" + database;
		try {
			Class.forName("org.postgresql.Driver").newInstance();
			conn = DriverManager.getConnection(connectionUrl, user, password);
		} catch (InstantiationException | IllegalAccessException | ClassNotFoundException | SQLException e) {
		    LOGGER.error(e);
		}
		return conn;
	}

	/**
	 * 从连接池获取连接
	 * 
	 * @return
	 */
	public static final Connection getConnecion() {
		Connection connection = null;
		try {
			if (ds == null) {
				createDataSource();
			}

			connection = ds.getConnection();			
		} catch (SQLException e) {
		    LOGGER.error(e);
		}

		return connection;
	}

	/**
	 * 关闭从连接池获取的连接
	 * 
	 * @param connection
	 */
	public static final void closeConnection(Connection connection) {
		try {
			if (connection != null && !connection.isClosed()) {
				connection.close();
			}
		} catch (SQLException e) {
		    LOGGER.error(e);
		}
	}

	/**
	 * 重新加载数据库连接信息，并重新建立连接池
	 */
	public static boolean reloadConInfo() {
		boolean isSucc = true;
		try {
			boolean isLoad = loadConInfo();
			if (isLoad) {
				createDataSource();
			}
		} catch (Exception e) {
			isSucc = false;
			LOGGER.error(e);
		}
		return isSucc;
	}

	/**
	 * 创建连接池,Druid 连接池
	 */
	private static void createDataSource() {
		try {
			if (ds != null) {
				shutdownDataSource();
			}
			String url = "jdbc:postgresql://" + host + ":" + port + "/" + database;
			ds = new DruidDataSource();
			ds.setDriverClassName("org.postgresql.Driver");
			ds.setUrl(url);
			ds.setUsername(user);
			ds.setPassword(password);
			ds.setMaxActive(50);//最大， 建议设置为系统注册人数的十分之一到二十分之一之间,例如系统的注册人数为1000，那么设置成50-100靠近100的数字，例如85或90。
			ds.setInitialSize(10);// 初始化
			ds.setMinIdle(10);// 最小
			ds.setMaxWait(60000);// 配置获取连接等待超时的时间
			ds.setTimeBetweenEvictionRunsMillis(60000);// 配置间隔多久才进行一次检测，检测需要关闭的空闲连接，单位是毫秒
			ds.setMinEvictableIdleTimeMillis(300000); // 配置一个连接在池中最小生存的时间，单位是毫秒
			ds.setTestWhileIdle(true);
			ds.setTestOnBorrow(false);
			ds.setTestOnReturn(false);
			ds.setAccessToUnderlyingConnectionAllowed(true);
			ds.setValidationQuery("SELECT VERSION()");
		} catch (SQLException e) {
		    LOGGER.error(e);
		}
	}

	/**
	 * 关闭連接池
	 * 
	 * @throws SQLException
	 */
	private static void shutdownDataSource() throws SQLException {
		if (ds != null) {
			ds.close();
		}
	}

	/**
	 * 加载数据库连接配置信息
	 */
	private static boolean loadConInfo() {

		boolean isLoad = true;

		String pathString = Thread.currentThread().getContextClassLoader().getResource("").getPath()
				+ "config.properties";
		InputStream inputStream = null;
		try {
			inputStream = new FileInputStream(pathString);
		} catch (FileNotFoundException e2) {
			isLoad = false;
			LOGGER.error(e2);
		}
		if (inputStream != null) {
			Properties p = new Properties();
			try {
				p.load(inputStream);
				user = p.getProperty("user").trim();
				password = p.getProperty("password").trim();
				port = p.getProperty("port").trim();
				host = p.getProperty("url").trim();
				database = p.getProperty("database").trim();
			} catch (IOException e1) {
				isLoad = false;
				LOGGER.error(e1);
			} finally {
				try {
					inputStream.close();
				} catch (IOException e) {
					isLoad = false;
					LOGGER.error(e);
				}
			}
		}
		return isLoad;
	}

	/**
	 * 获取数据库连接信息
	 * 
	 * @return
	 */
	public static Map<String, Object> getConnParams() {
		Map<String, Object> params = new HashMap<>();

		params.put("dbtype", "postgis");
		params.put("host", host);
		params.put("port", new Integer(port));
		params.put("database", database);
		params.put("schema", "public");
		params.put("user", user);
		params.put("passwd", password);

		return params;
	}
}
