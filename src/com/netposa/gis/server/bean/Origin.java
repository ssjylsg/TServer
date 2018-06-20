package com.netposa.gis.server.bean;

public class Origin {
	private double x = 0;
	private double y = 0;

	public Origin(double x, double y) {
		this.x = x;
		this.y = y;
	}

	public void setX(double x) {
		this.x = x;
	}

	public double getX() {
		return x;
	}

	public void setY(double y) {
		this.y = y;
	}

	public double getY() {
		return y;
	}
	
	@Override
	public String toString() {
		return java.text.MessageFormat.format("x={0},y={1}", this.x, this.y);
	}

}