package com.netposa.gis.server.dao;

public abstract class DAOFactory {

    public static final int JDBC = 1;

    public static final int POOL = 2;

    public abstract IPoolBaseDAO getBaseDao();

    public static DAOFactory getDAOFactory(int whichFactory) {
        switch (whichFactory) {
        case JDBC:
            return new JDBCDAOFactory();
        case POOL:
            return new POOLDAOFactory();
        default:
            return null;
        }
    }
}
