package com.netposa.gis.server.bean;

import com.vividsolutions.jts.geom.Point;
import org.apache.commons.lang.StringUtils;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class MutilRoute {
	private String start;
	private String end;
	private String expend;
	private double length;
	
	public String getLength() {
		return String.valueOf(length);
	}

	public void setLength(double length) {
		BigDecimal b = BigDecimal.valueOf(length);
		this.length = b.setScale(2, BigDecimal.ROUND_HALF_UP).doubleValue();
	}

	public MutilRoute(Point start, Point end) {
		this.setEnd(end);
		this.setStart(start);
	}

	public MutilRoute(String start, String end) {
		this.start = start;
		this.end = end;
		this.expend = this.start + ";" + this.end;
	}

	/**
	 * @return the start
	 */
	public String getStart() {
		return start;
	}

	/**
	 * @param start
	 *            the start to set
	 */
	public void setStart(Point start) {
		this.start = start.getX() + "," + start.getY();
	}

	public String getEnd() {
		return end;
	}

	public void setEnd(Point end) {
		this.end = end.getX() + "," + end.getY();
	}

	public String getExpend() {
		return expend;
	}
	
	public void setExpend(Routes routes) {

		List<Point> points = routes.toPoints();

		if (points.isEmpty()) {
			this.expend = this.start + ";" + this.end;
		} else {
			List<String> list = new ArrayList<>();
			for (int i = 0; i < points.size(); i++) {
				list.add(points.get(i).getX() + "," + points.get(i).getY());
			}
			this.expend = StringUtils.join(list.toArray(), ";");
		}
	}
	public void setExpendEx(String expend) {		 
		this.expend = expend;
	}

	/*
	 * 反转route
	 */
	public static MutilRoute reverse(MutilRoute route) {
		MutilRoute temp = new MutilRoute(route.getEnd(), route.getStart());
		temp.length = route.length;
		String[] expendString = route.getExpend().split(";");
		String[] newExpendStrings = new String[expendString.length];
		for (int i = 0; i < newExpendStrings.length; i++) {
			newExpendStrings[i] = expendString[expendString.length - 1 - i];
		}
		temp.expend = StringUtils.join(newExpendStrings, ";");
		return temp;
	}
}
