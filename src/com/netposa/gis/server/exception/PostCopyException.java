package com.netposa.gis.server.exception;

/**
 * postgreSQL copy 异常
 * @author wj
 *
 */
public class PostCopyException extends Exception {
    private static final long serialVersionUID = 1L;

    public PostCopyException() {
        super();
    }

    public PostCopyException(String message, Throwable cause, boolean enableSuppression, boolean writableStackTrace) {
        super(message, cause, enableSuppression, writableStackTrace);
    }

    public PostCopyException(String message, Throwable cause) {
        super(message, cause);
    }

    public PostCopyException(String message) {
        super(message);
    }

    public PostCopyException(Throwable cause) {
        super(cause);
    }
}
