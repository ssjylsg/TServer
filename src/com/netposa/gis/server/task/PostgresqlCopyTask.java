package com.netposa.gis.server.task;

import com.netposa.gis.server.utils.PostgresqlCopyUtil;

import java.io.IOException;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.concurrent.Callable;

/**
 * 从文件把数据导入表的任务，实现了Callable接口，一个任务一个线程。
 * @author wj
 *
 */
public class PostgresqlCopyTask implements Callable<Long> {

	private Connection connection;
	private String pathname;
	private String sql;

	private InputStream inputStream;

	// 修改的记录数
	private long rowCount = 0;

	public PostgresqlCopyTask() {
		super();
	}

	public PostgresqlCopyTask(Connection connection, String pathname, String sql) {
		super();
		this.connection = connection;
		this.pathname = pathname;
		this.sql = sql;
	}

	public PostgresqlCopyTask(Connection connection, String sql,
			InputStream inputStream) {
		super();
		this.connection = connection;
		this.sql = sql;
		this.inputStream = inputStream;
	}

	/**
	 * 从数据流导入
	 */
	@Override
	public Long call() throws SQLException, IOException {

		rowCount = PostgresqlCopyUtil.copyFromInputStream(connection, sql, inputStream);

		return rowCount;
	}

	// getters and setters
	public Connection getConnection() {
		return connection;
	}

	public void setConnection(Connection connection) {
		this.connection = connection;
	}

	public String getPathname() {
		return pathname;
	}

	public void setPathname(String pathname) {
		this.pathname = pathname;
	}

	public String getSql() {
		return sql;
	}

	public void setSql(String sql) {
		this.sql = sql;
	}

	public InputStream getInputStream() {
		return inputStream;
	}

	public void setInputStream(InputStream inputStream) {
		this.inputStream = inputStream;
	}

}
