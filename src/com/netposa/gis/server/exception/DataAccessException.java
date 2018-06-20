package com.netposa.gis.server.exception;

/**
 * 数据库存取异常
 * 
 * @author wj
 * 
 */
@SuppressWarnings("serial")
public class DataAccessException extends Exception {
    public DataAccessException(Throwable cause) {
        super(cause);
    }
}
