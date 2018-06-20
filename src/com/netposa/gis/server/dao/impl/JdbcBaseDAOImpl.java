package com.netposa.gis.server.dao.impl;

import com.netposa.gis.server.dao.IJdbcBaseDAO;
import com.netposa.gis.server.utils.DBManager;
import org.json.simple.JSONObject;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

public class JdbcBaseDAOImpl implements IJdbcBaseDAO {

	protected Connection connection = null;
	protected Statement statement = null;
	protected ResultSet rs = null;

	@SuppressWarnings("unchecked")
	public List<?> find(String sql) throws SQLException {

		List<JSONObject> list = new ArrayList<JSONObject>();
		try {
			connection = DBManager.getJDBCConnection();
			if (connection != null) {
				statement = connection.createStatement();
				rs = statement.executeQuery(sql);
				while (rs.next()) {
					JSONObject jsonObject = new JSONObject();
					jsonObject.put("gid", rs.getObject("gid"));
					jsonObject.put("name", rs.getObject("name"));
					jsonObject.put("address", rs.getObject("r_addr"));
					jsonObject.put("districtName", rs.getObject("districtName"));
					jsonObject.put("geometry", rs.getString("geom_txt"));
					jsonObject.put("rank", rs.getObject("rank"));
					list.add(jsonObject);
				}
			}
		} finally {
			if (rs != null) {
				rs.close();
			}
			if (statement != null) {
				statement.close();
				statement = null;
			}
			if (connection != null) {
				connection.close();
				connection = null;
			}
		}

		return list;
	}

}
