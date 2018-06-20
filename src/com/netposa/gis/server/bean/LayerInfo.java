package com.netposa.gis.server.bean;

public class LayerInfo {
	private int level;
	private double resolution;
	private double scale;

	public LayerInfo(int level, double resolution, double scale) {
		this.level = level;
		this.resolution = resolution;
		this.scale = scale;
	}

	public void setLevel(int level) {
		this.level = level;
	}

	public int getLevel() {
		return level;
	}

	public void setResolution(double resolution) {
		this.resolution = resolution;
	}

	public double getResolution() {
		return resolution;
	}

	public void setScale(double scale) {
		this.scale = scale;
	}

	public double getScale() {
		return scale;
	}

}
