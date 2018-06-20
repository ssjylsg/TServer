package com.netposa.gis.server.controller;

import com.netposa.gis.server.bean.LonLat;
import com.netposa.gis.server.utils.CoordinateConvert;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import java.io.OutputStream;

/*
 * 坐标转换服务
 */
@Controller
@RequestMapping("/coordConvert")
public class CoordController {
	
	@RequestMapping(method = RequestMethod.GET, value = "index")
	public String coordConvert(){
		return "coordConvert";
	}
	
	/**
	 * 坐标转换，经纬度：1， 火星坐标：2， 百度坐标：3 ，墨卡托：4
	 * @param from
	 * @param to
	 * @param x
	 * @param y
	 * @param os
	 * @return
	 */
	@ResponseBody
	@RequestMapping(method = RequestMethod.GET, value = "")
	public LonLat coordConvert(String from, String to, String x, String y, OutputStream os) {
		LonLat lonLat = new LonLat();
		
		int fromInt = Integer.parseInt(from);
		int toInt = Integer.parseInt(to);
		if (fromInt < 1 || fromInt > 4 || toInt < 1 || toInt > 4) {
			lonLat.setError("please input right from and to ");
		} else {
			double xdouble = Double.parseDouble(x);
			double ydouble = Double.parseDouble(y);

			switch (from) {
			case "1":
				lonLat = fromJwd(to, xdouble, ydouble);
				break;
			case "2":
				lonLat = fromGcj(to, xdouble, ydouble);
				break;
			case "3":
				lonLat = fromBd(to, xdouble, ydouble);
				break;
			default:
				lonLat = fromMercator(to, xdouble, ydouble);
				break;
			}
		}

		return lonLat;
	}
	
	/**
	 * 经纬度转换到其它
	 * @param to
	 * @param xdouble
	 * @param ydouble
	 * @return
	 */
	private LonLat fromJwd(String to, double xdouble, double ydouble) {
		LonLat lonLat = new LonLat();
		switch (to) {
		case "1":
			// 经纬度->经纬度
			lonLat.setLon(xdouble);
			lonLat.setLat(ydouble);
			break;
		case "2":
			// 经纬度->火星
			lonLat = CoordinateConvert.transform(xdouble, ydouble);
			break;
		case "3":
			// 经纬度->百度（经纬度->火星，火星->百度）
			lonLat = jwdToBd(xdouble, ydouble);
			break;
		default:
			// 经纬度->墨卡托
			lonLat = CoordinateConvert.webMoctorJW2PM(xdouble, ydouble);
			break;
		}

		return lonLat;
	}
	
	/**
	 * 经纬度->百度（经纬度->火星，火星->百度）
	 * @param xdouble
	 * @param ydouble
	 * @return
	 */
	private LonLat jwdToBd(double xdouble, double ydouble) {
		LonLat lonLat = CoordinateConvert.transform(xdouble, ydouble);
		return CoordinateConvert.encryptToBd(lonLat.getLon(), lonLat.getLat());
	}
	
	/**
	 * 火星转换到其它
	 * @param to
	 * @param xdouble
	 * @param ydouble
	 * @return
	 */
	private LonLat fromGcj(String to, double xdouble, double ydouble) {
		LonLat lonLat = new LonLat();
		switch (to) {
		case "1":
			// 火星->经纬度
			lonLat = CoordinateConvert.gcj2wgs(xdouble, ydouble);
			break;
		case "2":
			// 火星->火星
			lonLat.setLon(xdouble);
			lonLat.setLat(ydouble);
			break;
		case "3":
			// 火星->百度
			lonLat = CoordinateConvert.encryptToBd(xdouble, ydouble);
			break;
		default:
			// 火星->墨卡托（火星->经纬度，经纬度->墨卡托）
			lonLat = fromGcjToMercator(xdouble, ydouble);
			break;
		}

		return lonLat;
	}
	
	/**
	 * 火星->墨卡托（火星->经纬度，经纬度->墨卡托）
	 * @param xdouble
	 * @param ydouble
	 * @return
	 */
	private LonLat fromGcjToMercator(double xdouble, double ydouble) {
		LonLat lonLat = CoordinateConvert.gcj2wgs(xdouble, ydouble);
		return CoordinateConvert.webMoctorJW2PM(lonLat.getLon(), lonLat.getLat());
	}
	
	/**
	 * 百度转换到其它
	 * @param to
	 * @param xdouble
	 * @param ydouble
	 * @return
	 */
	private LonLat fromBd(String to, double xdouble, double ydouble) {
		LonLat lonLat = new LonLat();
		switch (to) {
		case "1":
			// 百度->经纬度（百度->火星，火星->经纬度）
			lonLat = fromBdToJwd(xdouble, ydouble);
			break;
		case "2":
			// 百度->火星
			lonLat = CoordinateConvert.bdToDecrypt(xdouble, ydouble);
			break;
		case "3":
			// 百度->百度
			lonLat.setLon(xdouble);
			lonLat.setLat(ydouble);
			break;
		default:
			// 百度->墨卡托（百度->火星，火星->经纬度，经纬度->墨卡托）
			lonLat = fromBdToMercator(xdouble, ydouble);
			break;
		}
		return lonLat;
	}
	
	/**
	 * 百度->经纬度（百度->火星，火星->经纬度）
	 * @param xdouble
	 * @param ydouble
	 * @return
	 */
	private LonLat fromBdToJwd(double xdouble, double ydouble) {
		LonLat lonLat = CoordinateConvert.bdToDecrypt(xdouble, ydouble);
		return CoordinateConvert.gcj2wgs(lonLat.getLon(), lonLat.getLat());
	}
	
	/**
	 * 百度->墨卡托（百度->火星，火星->经纬度，经纬度->墨卡托）
	 * @param xdouble
	 * @param ydouble
	 * @return
	 */
	private LonLat fromBdToMercator(double xdouble, double ydouble) {
		LonLat lonLat = CoordinateConvert.bdToDecrypt(xdouble, ydouble);
		lonLat = CoordinateConvert.gcj2wgs(lonLat.getLon(), lonLat.getLat());
		return CoordinateConvert.webMoctorJW2PM(lonLat.getLon(), lonLat.getLat());
	}
	
	/**
	 * 墨卡托转换到其它
	 * @param to
	 * @param xdouble
	 * @param ydouble
	 * @return
	 */
	private LonLat fromMercator(String to, double xdouble, double ydouble) {
		LonLat lonLat = new LonLat();
		switch (to) {
		case "1":
			// 墨卡托->经纬度
			lonLat = CoordinateConvert.inverseMercator(xdouble, ydouble);
			break;
		case "2":
			// 墨卡托->火星（墨卡托->经纬度，经纬度->火星）
			lonLat = fromMercatorToGcj(xdouble, ydouble);
			break;
		case "3":
			// 墨卡托->百度（墨卡托->经纬度，经纬度->火星，火星->百度）
			lonLat = fromMercatorToBd(xdouble, ydouble);
			break;
		default:
			// 墨卡托->墨卡托
			lonLat.setLon(xdouble);
			lonLat.setLat(ydouble);
			break;
		}

		return lonLat;
	}
	
	/**
	 * 墨卡托->火星（墨卡托->经纬度，经纬度->火星）
	 * @param xdouble
	 * @param ydouble
	 * @return
	 */
	private LonLat fromMercatorToGcj(double xdouble, double ydouble) {
		LonLat lonLat = CoordinateConvert.inverseMercator(xdouble, ydouble);
		return CoordinateConvert.transform(lonLat.getLon(), lonLat.getLat());
	}
	
	/**
	 * 墨卡托->百度（墨卡托->经纬度，经纬度->火星，火星->百度）
	 * @param xdouble
	 * @param ydouble
	 * @return
	 */
	private LonLat fromMercatorToBd(double xdouble, double ydouble) {
		LonLat lonLat = CoordinateConvert.inverseMercator(xdouble, ydouble);
		lonLat = CoordinateConvert.transform(lonLat.getLon(), lonLat.getLat());
		return CoordinateConvert.encryptToBd(lonLat.getLon(), lonLat.getLat());
	}
	
}
