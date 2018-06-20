package com.netposa.gis.server.dao.impl;

import com.netposa.gis.server.dao.IPoolBaseDAO;
import com.netposa.gis.server.exception.DataAccessException;
import com.netposa.gis.server.utils.DBManager;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class PoolBaseDAOImpl implements IPoolBaseDAO {

    private static final Log LOGGER = LogFactory.getLog(PoolBaseDAOImpl.class);
    
    protected Connection connection = null;
    protected PreparedStatement statement = null;
    protected ResultSet rs = null;

    /**
     * 查询
     */
    public List<JSONObject> find(String sql) throws SQLException {

        List<JSONObject> list = new ArrayList<>();
        try {
            connection = DBManager.getConnecion();
            if (connection != null) {
                statement = connection.prepareStatement(sql);
                rs = statement.executeQuery();
                list = rsToList();
            }
        } finally {
            if (rs != null) {
                rs.close();
                rs = null;
            }
            if (statement != null) {
                statement.close();
                statement = null;
            }
            if (connection != null) {
                this.closeConnection(connection);
                connection = null;
            }
        }

        return list;
    }
    
    /**
     * 更新数据
     */
    public int update(String sql) throws SQLException {
        return updateAndInsert(sql);
    }

    /**
     * 插入数据
     */
    public int insert(String sql) throws SQLException {
        return updateAndInsert(sql);
    }
    
    /**
     * 预处理插入数据
     */
    @Override
    public int preparedInsert(String sql, Object... params) throws DataAccessException {
        return this.preparedExecute(sql, params);
    }
    
    /**
     * 预处理更新数据
     */
    @Override
    public int preparedUpdate(String sql, Object... params) throws DataAccessException {
        return this.preparedExecute(sql, params);
    }
    
    /**
     * 预处理删除数据
     */
    @Override
    public int preparedDelete(String sql, Object... params) throws DataAccessException {
        return this.preparedExecute(sql, params);
    }
    
    /**
     * 预处理查询
     */
    @Override
    public JSONArray preparedQuery(String sql, Object... params) throws DataAccessException {
        JSONArray results = new JSONArray();

        try {
            connection = DBManager.getConnecion();
            if (connection != null) {
                statement = connection.prepareStatement(sql);

                if (params != null) {
                    for (int i = 0; i < params.length; i++) {
                        statement.setObject(i + 1, params[i]);
                    }
                }

                rs = statement.executeQuery();
                results = rsToJSONArray();
            }
        } catch (SQLException e) {
            LOGGER.error(e);
            throw new DataAccessException(e);
        } finally {
            if (rs != null) {
                try {
                    rs.close();
                } catch (SQLException e) {
                    LOGGER.error(e);
                    throw new DataAccessException(e);
                }
                rs = null;
            }
            if (statement != null) {
                try {
                    statement.close();
                } catch (SQLException e) {
                    LOGGER.error(e);
                    throw new DataAccessException(e);
                }
                statement = null;
            }
            if (connection != null) {
                this.closeConnection(connection);
                connection = null;
            }
        }

        return results;
    }

    @SuppressWarnings("unchecked")
    private List<JSONObject> rsToList() throws SQLException {
        List<JSONObject> list = new ArrayList<>();
        int colunmCount = rs.getMetaData().getColumnCount();

        while (rs.next()) {
            JSONObject jsonObject = new JSONObject();
            for (int i = 0; i < colunmCount; i++) {
                String key = rs.getMetaData().getColumnName(i + 1);
                Object value = rs.getObject(key);
                jsonObject.put(key, value);
            }

            list.add(jsonObject);
        }

        return list;
    }

    @SuppressWarnings("unchecked")
    private JSONArray rsToJSONArray() throws SQLException {
        JSONArray results = new JSONArray();
        int colunmCount = rs.getMetaData().getColumnCount();

        while (rs.next()) {
            JSONObject jsonObject = new JSONObject();
            for (int i = 0; i < colunmCount; i++) {
                String key = rs.getMetaData().getColumnName(i + 1);
                Object value = rs.getObject(key);
                jsonObject.put(key, value);
            }

            results.add(jsonObject);
        }
        return results;
    }

    /**
     * 关闭数据库连接，归还到连接池
     * 
     * @param connection
     */
    private void closeConnection(Connection connection) {
        DBManager.closeConnection(connection);
    }

    private int updateAndInsert(String sql) throws SQLException {
        int rowCount = 0;

        try {
            connection = DBManager.getConnecion();
            if (connection != null) {
                statement = connection.prepareStatement(sql);
                rowCount = statement.executeUpdate();
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
                this.closeConnection(connection);
            }
        }

        return rowCount;
    }
    
    // 预处理
    private int preparedExecute(String sql, Object... params) throws DataAccessException {
        int rowCount = 0;
        try (Connection connection = DBManager.getConnecion();
                PreparedStatement pstmt = connection.prepareStatement(sql)) {

            this.setParameters(pstmt, params);

            rowCount = pstmt.executeUpdate();

        } catch (SQLException e) {
            LOGGER.error(e);
            throw new DataAccessException(e);
        }
        return rowCount;
    }
    
    // 为预编译声明传入参数
    private void setParameters(PreparedStatement pstmt, Object... params) throws DataAccessException {
        try {
            for (int i = 0, ci = params.length; i < ci; i++) {
                pstmt.setObject(i + 1, params[i]);
            }
        } catch (SQLException e) {
            LOGGER.error(e);
            throw new DataAccessException(e);
        }
    }
}
