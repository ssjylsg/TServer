package com.netposa.gis.server.authorization;

/**
 * 自定义异常，授权认证部分使用，针对NPGIS SERVER 接口
 * @author wj
 *
 */
public class AccessDeniedForJsonException extends RuntimeException {

	private static final long serialVersionUID = -8624185183343526510L;

	public AccessDeniedForJsonException() {
		super();
	}

	public AccessDeniedForJsonException(String message) {
		super(message);
	}

	public AccessDeniedForJsonException(Throwable cause) {
		super(cause);
	}

	public AccessDeniedForJsonException(String message, Throwable cause) {
		super(message, cause);
	}

	public AccessDeniedForJsonException(String message, Throwable cause,
			boolean enableSuppression, boolean writableStackTrace) {
		super(message, cause, enableSuppression, writableStackTrace);
	}

}
