package com.netposa.gis.server.exception;

/**
 * 矢量切片异常
 * 
 * @author wj
 * 
 */
public class VectorTileException extends Exception {
    private static final long serialVersionUID = 1L;

    public VectorTileException() {
        super();
    }

    public VectorTileException(String message, Throwable cause, boolean enableSuppression, boolean writableStackTrace) {
        super(message, cause, enableSuppression, writableStackTrace);
    }

    public VectorTileException(String message, Throwable cause) {
        super(message, cause);
    }

    public VectorTileException(String message) {
        super(message);
    }

    public VectorTileException(Throwable cause) {
        super(cause);
    }

}
