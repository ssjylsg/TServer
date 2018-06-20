package com.netposa.gis.server.bean;

public class LonLat {
	private double lon =0.0 ;
	private double lat =0.0;
	private String error = "";
	public double getLon() {
		return lon;
	}
	public void setLon(double d) {
		this.lon = d;
	}
	public double getLat() {
		return lat;
	}
	public void setLat(double lat) {
		this.lat = lat;
	}
	public String getError() {
		return error;
	}
	public void setError(String error) {
		this.error = error;
	} 
}
