package com.netposa.gis.server.bean;

import com.vividsolutions.jts.geom.Coordinate;
import com.vividsolutions.jts.geom.LineString;
import com.vividsolutions.jts.geom.Point;
import com.vividsolutions.jts.geom.PrecisionModel;

import java.util.ArrayList;
import java.util.List;

public class NaLine {
	private ArrayList<Point> points;

	public NaLine() {
		this.points = new ArrayList<>();
	}

	public int getPointLength() {
		return this.points.size();
	}

	public void push(Point p) {
		this.points.add(p);
	}

	public List<Point> getPoints() {
		return this.points;
	}

	public boolean isStart(Coordinate p) {

		return (!this.points.isEmpty())
				&& Math.abs(this.points.get(0).getX() - p.x) < 0.000001
				&& Math.abs(this.points.get(0).getY() - p.y) < 0.000001;
	}

	public boolean isEnd(Coordinate p) {
		Point endPoint = this.points.get(this.getPointLength() - 1);

		return !this.points.isEmpty()
				&& Math.abs(endPoint.getX() - p.x) < 0.000001
				&& Math.abs(endPoint.getY() - p.y) < 0.000001;
	}

	private Coordinate[] getCoordinates(Boolean isreverse) {
		ArrayList<Coordinate> result = new ArrayList<>();
		if (isreverse) {
			for (int i = getPointLength() - 1; i >= 0; i--) {
				Coordinate coordinate = new Coordinate();
				coordinate.y = this.points.get(i).getY();
				coordinate.x = this.points.get(i).getX();
				result.add(coordinate);
			}
		} else {
			for (int i = 0; i < getPointLength(); i++) {
				Coordinate coordinate = new Coordinate();
				coordinate.y = this.points.get(i).getY();
				coordinate.x = this.points.get(i).getX();
				result.add(coordinate);
			}
		}
		Coordinate[] arrayCoordinates = new Coordinate[result.size()];
		result.toArray(arrayCoordinates);
		return arrayCoordinates;
	}

	@SuppressWarnings("deprecation")
	public LineString createLineString(Boolean isreverse) {
		PrecisionModel precisionModel = new PrecisionModel();
		return new LineString(
				(com.vividsolutions.jts.geom.Coordinate[]) getCoordinates(isreverse),
				precisionModel, 4326);

	}
}
