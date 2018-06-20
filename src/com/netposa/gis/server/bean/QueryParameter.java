package com.netposa.gis.server.bean;

public class QueryParameter {
	private String key;
	private String tableName;
	private String name;
	private String seqName;
	public String getKey() {
		return key;
	}
	public void setKey(String value) {
		key = value;
	}
	/**
	 * @return the tableName
	 */
	public String getTableName() {
		return tableName;
	}
	/**
	 * @param tableName the tableName to set
	 */
	public void setTableName(String tableName) {
		this.tableName = tableName;
	}
	/**
	 * @return the name
	 */
	public String getName() {
		return name;
	}
	/**
	 * @param name the name to set
	 */
	public void setName(String name) {
		this.name = name;
	}
	/**
	 * @return the seqName
	 */
	public String getSeqName() {
		return seqName;
	}
	/**
	 * @param seqName the seqName to set
	 */
	public void setSeqName(String seqName) {
		this.seqName = seqName;
	}
	
}
