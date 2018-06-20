package com.netposa.gis.server.dao;

import java.sql.SQLException;
import java.util.List;

public interface IBaseDAO {

    public List<?> find(String sql) throws SQLException;
}
