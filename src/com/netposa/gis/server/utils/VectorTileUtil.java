package com.netposa.gis.server.utils;

import java.awt.*;
import java.io.File;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class VectorTileUtil {

	private static final String HEX_REG = "^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$";

	private static String CONTEXT_PATH;

	static {
		String classPath = Thread.currentThread().getContextClassLoader().getResource("/").getPath();
		String rootPath = "";
		// windows
		if ("\\".equals(File.separator)) {
			rootPath = classPath.substring(1, classPath.indexOf("/WEB-INF/classes"));
			rootPath = rootPath.replace("/", "\\");
		}
		// linux
		if ("/".equals(File.separator)) {
			rootPath = classPath.substring(0, classPath.indexOf("/WEB-INF/classes"));
			rootPath = rootPath.replace("\\", "/");
		}

		setConetxtPath(rootPath);
	}

	private static void setConetxtPath(String value) {
		CONTEXT_PATH = value;
	}
	
    public static String keyGeneratorForImg(String serviceName, String x, String y, String l, String scale, String style) {
        return keyGenerator("img", serviceName, x, y, l, scale, style);
    }

	// 唯一key
	public static String keyGenerator(String prefix, String serviceName, String x, String y, String l, String scale,
			String style) {
		StringBuilder keyStr = new StringBuilder(prefix).append(serviceName).append(l).append(x).append(y);
		if (style != null) {
			keyStr.append(style);
		}
		return Long.toString(MurmurHash.hash64(keyStr.toString()));
	}

	public static String keyGenerator(String serviceName, String x, String y, String l) {
		return Long
				.toString(MurmurHash.hash64(new StringBuilder(serviceName).append(l).append(x).append(y).toString()));
	}

	public static String getContextPath() {
		return CONTEXT_PATH;
	}

	// cap 转换 0 round, 1 butt, 2 square
	public static int getCapType(int type) {
		if (type == 0) {
			return BasicStroke.CAP_ROUND;
		} else if (type == 1) {
			return BasicStroke.CAP_BUTT;
		} else {
			return BasicStroke.CAP_SQUARE;
		}
	}

	public static Color rgbaStrToColor(String rgbaStr) {
		String[] rgba = rgbaStr.split(",");
		int r = Integer.parseInt(rgba[0]);
		int g = Integer.parseInt(rgba[1]);
		int b = Integer.parseInt(rgba[2]);
		int a = alphaConversion(Float.parseFloat(rgba[3]));
		return new Color(r, g, b, a);
	}

	// hex 转为 awt 颜色
	public static Color hexToAWTColor(String hex, float alpha) {
		int[] rgb = hex2Rgb(hex);
		int a = alphaConversion(alpha);
		return new Color(rgb[0], rgb[1], rgb[2], a);
	}

	// hex 转 rgb 数组
	private static int[] hex2Rgb(String hex) {
		String hexTemp = "#FF0000";
		if (isHex(hex)) {
			hexTemp = hex;
		}

		String c = hexTemp.replace("#", "");

		int r = Integer.parseInt((c.length() == 3 ? c.substring(0, 1) + c.substring(0, 1) : c.substring(0, 2)), 16);
		int g = Integer.parseInt((c.length() == 3 ? c.substring(1, 2) + c.substring(1, 2) : c.substring(2, 4)), 16);
		int b = Integer.parseInt((c.length() == 3 ? c.substring(2, 3) + c.substring(2, 3) : c.substring(4, 6)), 16);

		return new int[] { r, g, b };
	}

	// 判断 hex 格式
	private static boolean isHex(String hex) {
		Pattern pattern = Pattern.compile(HEX_REG);
		Matcher matcher = pattern.matcher(hex);
		return matcher.matches();
	}

	// alpha 格式转换，0-1 转为 0-255
	private static int alphaConversion(float alpha) {
		return (int) (alpha / 1 * 255);
	}
}
