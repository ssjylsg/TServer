package com.netposa.gis.server.bean;

import java.util.ArrayList;
import java.util.List;

public class Extent {
	private double xmin = 0;
	private double ymin = 0;
	private double xmax = 0;
	private double ymax = 0;
	private SpatialReference spatialReference = null;

	public Extent() {
		this.spatialReference = new SpatialReference();
	}

	public void setXmin(double xmin) {
		this.xmin = xmin;
	}

	public double getXmin() {
		return xmin;
	}

	public void setYmin(double ymin) {
		this.ymin = ymin;
	}

	public double getYmin() {
		return ymin;
	}

	public void setXmax(double xmax) {
		this.xmax = xmax;
	}

	public double getXmax() {
		return xmax;
	}

	public void setYmax(double ymax) {
		this.ymax = ymax;
	}

	public double getYmax() {
		return ymax;
	}

	public void setSpatialReference(SpatialReference spatialReference) {
		this.spatialReference = spatialReference;
	}

	public SpatialReference getSpatialReference() {
		return spatialReference;
	}

	public List<Double> getExtent() {
		List<Double> list = new ArrayList<>();
		list.add(this.xmin);
		list.add(this.ymin);
		list.add(this.xmax);
		list.add(this.ymax);
		return list;
	}

	public List<Double> getCenter() {
		List<Double> list = new ArrayList<>();
		list.add((this.xmax + this.xmin) / 2.0);
		list.add((this.ymax + this.ymin) / 2.0);
		return list;
	}

}
