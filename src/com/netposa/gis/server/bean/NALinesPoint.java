package com.netposa.gis.server.bean;

import com.vividsolutions.jts.geom.Coordinate;
import com.vividsolutions.jts.geom.MultiLineString;

public class NALinesPoint {
	
	private MultiLineString lines;
	private Coordinate startPoint;
	
	public NALinesPoint(MultiLineString lines, Coordinate startPoint) {
		this.lines = lines;
		this.startPoint = startPoint;
	}

	/**
	 * @return the lines
	 */
	public MultiLineString getLines() {
		return lines;
	}

	/**
	 * @param lines
	 *            the lines to set
	 */
	public void setLines(MultiLineString lines) {
		this.lines = lines;
	}

	/**
	 * @return the startPoint
	 */
	public Coordinate getStartPoint() {
		return startPoint;
	}

	/**
	 * @param startPoint
	 *            the startPoint to set
	 */
	public void setStartPoint(Coordinate startPoint) {
		this.startPoint = startPoint;
	}
}
