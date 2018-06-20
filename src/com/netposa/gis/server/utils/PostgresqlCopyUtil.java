package com.netposa.gis.server.utils;

import com.netposa.gis.server.exception.PostCopyException;
import org.postgresql.copy.CopyManager;
import org.postgresql.core.BaseConnection;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.sql.Connection;
import java.sql.SQLException;

/**
 * 实现使用 COPY 命令导入数据文本文件到 Postgressql
 * 
 * @author wj
 *
 */
public class PostgresqlCopyUtil {
	
	private PostgresqlCopyUtil() {
		super();
	}

	/**
	 * 从输入流导入
	 * 
	 * @param connection 数据库连接
	 * @param sql 导入sql
	 * @param from 输入流
	 * @return
	 * @throws SQLException
	 * @throws IOException
	 */
	public static long copyFromInputStream(Connection connection,
			final String sql, InputStream from) throws SQLException,
			IOException {
		long rowCount = 0; // 更新的条数
		try {
			CopyManager copyManager = new CopyManager((BaseConnection) connection);

			rowCount = copyManager.copyIn(sql, from);
		} finally {
			from.close();
			connection.close();
		}

		return rowCount;
	}

	/**
	 * 导入数据文本到库
	 * 
	 * @param connection 数据库连接
	 * @param pathname 文本路径
	 * @param sql 导入sql eg:"COPY " + tableName + " FROM STDIN"
	 * @return
	 * @throws CustomerException 
	 */
	public static long copyFromFile(Connection connection, final String pathname, final String sql)
			throws PostCopyException {

		long rowCount = 0; // 更新的条数

		PostCopyException ce = new PostCopyException();

		try (FileInputStream inputStream = new FileInputStream(pathname);
				InputStreamReader reader = new InputStreamReader(inputStream, "UTF-8")) {
			CopyManager copyManager = new CopyManager((BaseConnection) connection);
			rowCount = copyManager.copyIn(sql, reader);
		} catch (IOException | SQLException e) {
			ce.initCause(e);
			throw ce;
		} finally {
			try {
				connection.close();
			} catch (SQLException e) {
				ce.initCause(e);
			}
		}

		return rowCount;
	}
}
