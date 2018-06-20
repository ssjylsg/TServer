package com.netposa.gis.server.bean;

import com.vividsolutions.jts.geom.Point;

import java.util.ArrayList;
import java.util.List;

public class Routes {
	private int count = 0;
	private List<SegmentInfo> segments = new ArrayList<>();
	private double length = 0.0;
	private double time = 0.0;
	private String startPoint = null;
	private String endPoint = null;
	public int getCount() {
		return count;
	}

	public void setCount(int count) {
		this.count = count;
	}

	public List<SegmentInfo> getSegments() {
		return segments;
	}

	public void setSegments(List<SegmentInfo> segments) {
		this.segments = segments;
	}

	public double getLength() {
		return length;
	}

	public void setLength(double value) {
		length = value;
	}

	public String getEndPoint() {
		return endPoint;
	}

	public void setEndPoint(String endPoint) {
		this.endPoint = endPoint;
	}

	public String getStartPoint() {
		return startPoint;
	}

	public void setStartPoint(String startPoint) {
		this.startPoint = startPoint;
	}

	public double getTime() {
		return time;
	}

	public void setTime(double value) {
		time = value;
	}
	
	public List<Point> toPoints() {
		List<Point> points = new ArrayList<>();

		if (!this.getSegments().isEmpty()) {
			List<SegmentInfo> segmentInfos = this.getSegments();
			for (SegmentInfo segmentInfo : segmentInfos) {

				List<Point> subPoints = segmentInfo.toPoints();

				points.addAll(subPoints);

				//segmentInfo.cleanLine();
			}
		}

		return points;
	}

}
