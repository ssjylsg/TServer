package com.netposa.gis.server.utils;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import sun.misc.BASE64Decoder;
import sun.misc.BASE64Encoder;

//Base64编码--解码
public class Base64Util {
	private static final Log logger = LogFactory.getLog(Base64Util.class);

	// N 次解码
	public static String decodeBase64(String mi, int times) {
		int num = (times <= 0) ? 1 : times;
		String mingwen = "";
		if (mi == null || "".equals(mi)) {

		} else {
			mingwen = mi;
			for (int i = 0; i < num; i++) {
				mingwen = decodeBase64(mingwen);
			}
		}
		return mingwen;
	}

	// 解码
	public static String decodeBase64(String mi) {
		String mingwen = "";
		if (mi == null || "".equals(mi)) {

		} else {
			BASE64Decoder decoder = new BASE64Decoder();
			try {
				byte[] by = decoder.decodeBuffer(mi);
				mingwen = new String(by);
			} catch (Exception e) {
				logger.error(e);
			}
		}
		return mingwen;
	}

	// N 次编码
	public static String encodeBase64(String mingwen, int times) {
		int num = (times <= 0) ? 1 : times;
		String code = "";
		if (mingwen == null || "".equals(mingwen)) {

		} else {
			code = mingwen;
			for (int i = 0; i < num; i++) {
				code = encodeBase64(code);
			}
		}
		return code;
	}

	// 编码
	public static String encodeBase64(String mingwen) {
		String code = "";
		if (mingwen == null || "".equals(mingwen)) {

		} else {
			BASE64Encoder encoder = new BASE64Encoder();
			try {
				code = encoder.encode(mingwen.getBytes());
			} catch (Exception e) {
				logger.error(e);
			}
		}
		return code;
	}
}
