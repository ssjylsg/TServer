package com.netposa.gis.server.authorization;

/**
 * 自定义异常，授权认证部分使用，针对NPGIS SERVER 界面访问
 * @author wj
 *
 */
public class AccessDeniedForViewException extends RuntimeException {

	private static final long serialVersionUID = -8624185183343526510L;

	public AccessDeniedForViewException() {
		super();
	}

	public AccessDeniedForViewException(String message) {
		super(message);
	}

	public AccessDeniedForViewException(Throwable cause) {
		super(cause);
	}

	public AccessDeniedForViewException(String message, Throwable cause) {
		super(message, cause);
	}

	public AccessDeniedForViewException(String message, Throwable cause,
			boolean enableSuppression, boolean writableStackTrace) {
		super(message, cause, enableSuppression, writableStackTrace);
	}

}
