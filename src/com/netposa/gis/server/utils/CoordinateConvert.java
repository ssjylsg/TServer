package com.netposa.gis.server.utils;

import com.netposa.gis.server.bean.LonLat;

public class CoordinateConvert {
	static double pi = 3.14159265358979324; // 圆周率
	static double ee = 0.00669342162296594323; // WGS 偏心率的平方
	static double xpi = 3.14159265358979324 * 3000.0 / 180.0;
	static double pole = 20037508.34;
	static double a = 6378245.0; // WGS 长轴半径
	
	private CoordinateConvert(){
		super();
	}

	/*
	 * 经纬度-> 墨卡托
	 */
	public static LonLat webMoctorJW2PM(double xdouble, double ydouble) {
		LonLat lonLat = new LonLat();

		double xRange = (xdouble < -85.05112) ? -85.05112 : xdouble;
		double yRange = (ydouble > 85.05112) ? 85.05112 : ydouble;

		lonLat.setLon((xRange / 180.0) * 20037508.34);

		double latdouble = (Math.PI / 180) * yRange;

		double tmpdouble = Math.PI / 4.0 + latdouble / 2.0;
		latdouble = 20037508.34 * Math.log(Math.tan(tmpdouble)) / Math.PI;
		lonLat.setLat(latdouble);
		return lonLat;
	}

	/*
	 * 墨卡托 -> 经纬度
	 */
	public static LonLat inverseMercator(double xdouble, double ydouble) {
		LonLat lonLat = new LonLat();
		double londouble = 180 * xdouble / pole;
		double latdouble = 180
				/ Math.PI
				* (2 * Math.atan(Math.exp((ydouble / pole) * Math.PI)) - Math.PI / 2);
		lonLat.setLon(londouble);
		lonLat.setLat(latdouble);
		return lonLat;
	}

	/*
	 * 经纬度->火星
	 */
	public static LonLat transform(double xdouble, double ydouble) {
		LonLat lonLat = new LonLat();
		if (outofChina(xdouble, ydouble)) {
			lonLat.setLon(xdouble);
			lonLat.setLat(ydouble);
			return lonLat;
		}
		double dLat = transformLat(xdouble - 105.0, ydouble - 35.0);
		double dLon = transformLon(xdouble - 105.0, ydouble - 35.0);
		double radLat = ydouble / 180.0 * pi;
		double magic = Math.sin(radLat);
		magic = 1 - ee * magic * magic;
		double sqrtMagic = Math.sqrt(magic);
		dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * pi);
		dLon = (dLon * 180.0) / (a / sqrtMagic * Math.cos(radLat) * pi);
		double mgLat = ydouble + dLat;
		double mgLon = xdouble + dLon;
		lonLat.setLon(mgLon);
		lonLat.setLat(mgLat);
		return lonLat;
	}


	/*
	 * 火星->百度
	 */
	public static LonLat encryptToBd(double xdouble, double ydouble) {
		LonLat lonLat = new LonLat();
		double z = Math.sqrt(xdouble * xdouble + ydouble * ydouble) + 0.00002 * Math.sin(ydouble * xpi);
		double theta = Math.atan2(ydouble, xdouble) + 0.000003 * Math.cos(xdouble * xpi);
		double bdLon = z * Math.cos(theta) + 0.0065;
		double bdLat = z * Math.sin(theta) + 0.006;
		lonLat.setLon(bdLon);
		lonLat.setLat(bdLat);
		return lonLat;
	}


	/*
	 * 火星->经纬度
	 */
	public static LonLat gcj2wgs(double xdouble, double ydouble) {
		LonLat lonLat = new LonLat();
		double lontitude = xdouble
				- (transform(xdouble, ydouble).getLon() - xdouble);
		double latitude = ydouble
				- (transform(xdouble, ydouble).getLat() - ydouble);
		lonLat.setLon(lontitude);
		lonLat.setLat(latitude);
		return lonLat;
	}

	/*
	 * 百度->火星
	 */
	public static LonLat bdToDecrypt(double xdouble, double ydouble) {
		LonLat lonLat = new LonLat();
		double x = xdouble - 0.0065;
		double y = ydouble - 0.006;
		double z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * xpi);
		double theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * xpi);
		double ggLon = z * Math.cos(theta);
		double ggLat = z * Math.sin(theta);
		lonLat.setLon(ggLon);
		lonLat.setLat(ggLat);
		return lonLat;
	}

	private static boolean outofChina(double xdouble, double ydouble) {
		if (xdouble < 72.004 || xdouble > 137.8347)
			return true;
		if (ydouble < 0.8293 || ydouble > 55.8271)
			return true;
		return false;
	};

	private static double transformLat(double xdouble, double ydouble) {
		double ret = -100.0 + 2.0 * xdouble + 3.0 * ydouble + 0.2 * ydouble
				* ydouble + 0.1 * xdouble * ydouble + 0.2
				* Math.sqrt(Math.abs(xdouble));
		ret += (20.0 * Math.sin(6.0 * xdouble * pi) + 20.0 * Math.sin(2.0
				* xdouble * pi)) * 2.0 / 3.0;
		ret += (20.0 * Math.sin(ydouble * pi) + 40.0 * Math.sin(ydouble / 3.0
				* pi)) * 2.0 / 3.0;
		ret += (160.0 * Math.sin(ydouble / 12.0 * pi) + 320 * Math.sin(ydouble
				* pi / 30.0)) * 2.0 / 3.0;
		return ret;
	};

	private static double transformLon(double xdouble, double ydouble) {
        double ret = 300.0 + xdouble + 2.0 * ydouble + 0.1 * xdouble * xdouble + 0.1 * xdouble * ydouble + 0.1 * Math.sqrt(Math.abs(xdouble));
        ret += (20.0 * Math.sin(6.0 * xdouble * pi) + 20.0 * Math.sin(2.0 * xdouble * pi)) * 2.0 / 3.0;
        ret += (20.0 * Math.sin(xdouble * pi) + 40.0 * Math.sin(xdouble / 3.0 * pi)) * 2.0 / 3.0;
        ret += (150.0 * Math.sin(xdouble / 12.0 * pi) + 300.0 * Math.sin(xdouble / 30.0 * pi)) * 2.0 / 3.0;
        return ret;
	}

}
