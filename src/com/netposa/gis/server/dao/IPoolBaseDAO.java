package com.netposa.gis.server.dao;

import com.netposa.gis.server.exception.DataAccessException;
import org.json.simple.JSONArray;

import java.sql.SQLException;

public interface IPoolBaseDAO extends IBaseDAO {

    public int insert(String sql) throws SQLException;

    public int update(String sql) throws SQLException;

    /**
     * 预处理插入数据
     */
    public int preparedInsert(String sql, Object... params) throws DataAccessException;
    
    /**
     * 预处理更新数据
     */ 
    public int preparedUpdate(String sql, Object... params) throws DataAccessException;

    /**
     * 预处理删除数据
     */
    public int preparedDelete(String sql, Object... params) throws DataAccessException;

    /**
     * 预处理查询
     */
    public JSONArray preparedQuery(String sql, Object... params) throws DataAccessException;
}
