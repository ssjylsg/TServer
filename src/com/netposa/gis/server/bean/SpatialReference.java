package com.netposa.gis.server.bean;

public class SpatialReference {
	private int wkid;
	private int latestWkid;

	public SpatialReference() {
		super();
	}

	public SpatialReference(int wkid, int latestWkid) {
		this.wkid = wkid;
		this.latestWkid = latestWkid;
	}

	public void setWkid(int wkid) {
		this.wkid = wkid;
	}

	public int getWkid() {
		return wkid;
	}

	public void setLatestWkid(int latestWkid) {
		this.latestWkid = latestWkid;
	}

	public int getLatestWkid() {
		return latestWkid;
	}
}
