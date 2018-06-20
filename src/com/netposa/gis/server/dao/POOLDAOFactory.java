package com.netposa.gis.server.dao;

import com.netposa.gis.server.dao.impl.PoolBaseDAOImpl;

public class POOLDAOFactory extends DAOFactory {

	public IPoolBaseDAO getBaseDao() {
		return new PoolBaseDAOImpl();
	}
}
