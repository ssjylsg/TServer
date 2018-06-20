package com.netposa.gis.server.bean;

import com.vividsolutions.jts.geom.Coordinate;
import com.vividsolutions.jts.geom.Point;

public class LinePoint {
	/*
	 * 找到的线段
	 */
	private NaLine line;
	/*
	 * 重合点
	 */
	private Point point;
	/*
	 * 是否需要反转
	 */
	private Boolean isreverse;

	/**
	 * @return the line
	 */
	public NaLine getLine() {
		return line;
	}

	/**
	 * @param line
	 *            the line to set
	 */
	public void setLine(NaLine line) {
		this.line = line;
	}

	/**
	 * @return the point
	 */
	public Point getPoint() {
		return point;
	}

	public Coordinate getCoordinate() {
		Coordinate coordinate = new Coordinate();
		coordinate.x = this.point.getX();
		coordinate.y = this.point.getY();
		return coordinate;
	}

	/**
	 * @param point
	 *            the point to set
	 */
	public void setPoint(Point point) {
		this.point = point;
	}

	/**
	 * @return the isreverse
	 */
	public Boolean getIsreverse() {
		return isreverse;
	}

	/**
	 * @param isreverse
	 *            the isreverse to set
	 */
	public void setIsreverse(Boolean isreverse) {
		this.isreverse = isreverse;
	}
}
