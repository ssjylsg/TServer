package com.netposa.gis.server.bean;

public class DataResult {
	private Boolean isSucess;
	private Object data;
	private String error;
	private String errorCode;
	public DataResult(){
		this.error = "";
		this.errorCode ="";
		this.isSucess = true;
	}
	/**
	 * @return the error
	 */
	public String getError() {
		return error;
	}
	/**
	 * @param error the error to set
	 */
	public void setError(String error) {
		this.error = error;
		this.isSucess = false;
	}
	/**
	 * @return the data
	 */
	public Object getData() {
		return data;
	}
	/**
	 * @param data the data to set
	 */
	public void setData(Object data) {
		this.data = data;
	}
	/**
	 * @return the errorCode
	 */
	public String getErrorCode() {
		return errorCode;
	}
	/**
	 * @param errorCode the errorCode to set
	 */
	public void setErrorCode(String errorCode) {
		this.errorCode = errorCode;
	}
	/**
	 * @return the isSucess
	 */
	public Boolean getIsSucess() {
		this.isSucess = this.error == null || this.error.trim().length() == 0;
		return this.isSucess;
	}
    public void setIsSucess(Boolean isSucess) {
        this.isSucess = isSucess;
    }
}
