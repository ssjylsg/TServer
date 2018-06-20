package com.netposa.gis.server.bean;

public class PageQuery<K> {
	private int pageIndex;
	private int maxResult;
	private K queryResult;
	private int totalRecord;

	/**
	 * @return the rowIndex
	 */
	public int getPageIndex() {
		return pageIndex;
	}

	/**
	 * @param pageIndex
	 *            the pageIndex to set
	 */
	public void setPageIndex(int pageIndex) {
		this.pageIndex = pageIndex;
	}

	/**
	 * @return the maxResult
	 */
	public int getMaxResult() {
		return maxResult;
	}

	/**
	 * @param maxResult
	 *            the maxResult to set
	 */
	public void setMaxResult(int maxResult) {
		if (maxResult > 500) {
			this.maxResult = 500;
		}else{
			this.maxResult = maxResult;
		}
	}

	/**
	 * @return the queryResult
	 */
	public K getQueryResult() {
		return queryResult;
	}

	/**
	 * @param queryResult
	 *            the queryResult to set
	 */
	public void setQueryResult(K queryResult) {
		this.queryResult = queryResult;
	}

	/**
	 * @return the totalRecord
	 */
	public int getTotalRecord() {
		return totalRecord;
	}

	/**
	 * @param totalRecord the totalRecord to set
	 */
	public void setTotalRecord(int totalRecord) {
		this.totalRecord = totalRecord;
	}
	
	public String getlimitSql(){
		return java.text.MessageFormat.format(" limit {0} offset {1}", this.maxResult,this.maxResult * (this.pageIndex - 1));
	}

}
