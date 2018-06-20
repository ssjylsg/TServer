package com.netposa.gis.server.bean;

import java.util.ArrayList;
import java.util.List;

public class TileInfo {
	private int rows = 256;
	private int cols = 256;
	private int dpi = 96;
	private String format = "PNG8";
	private int compressionQuality = 0;
	private Origin origin = null;
	private SpatialReference spatialReference = null;
	private List<LayerInfo> lods;
	public TileInfo(){
		this.lods = new ArrayList<>();
		this.spatialReference = new SpatialReference();
		this.origin = new Origin(0, 0);
	}
	public void setRows(int rows) {
		this.rows = rows;
	}

	public int getRows() {
		return rows;
	}

	public void setCols(int cols) {
		this.cols = cols;
	}

	public int getCols() {
		return cols;
	}

	public void setDpi(int dpi) {
		this.dpi = dpi;
	}

	public int getDpi() {
		return dpi;
	}

	public void setFormat(String format) {
		this.format = format;
	}

	public String getFormat() {
		return format;
	}

	public void setCompressionQuality(int compressionQuality) {
		this.compressionQuality = compressionQuality;
	}

	public int getCompressionQuality() {
		return compressionQuality;
	}

	public void setOrigin(Origin origin) {
		this.origin = origin;
	}

	public Origin getOrigin() {
		return origin;
	}

	public void setSpatialReference(SpatialReference spatialReference) {
		this.spatialReference = spatialReference;
	}

	public SpatialReference getSpatialReference() {
		return spatialReference;
	}

	public void setLods(List<LayerInfo> lays) {
		this.lods = lays;
	}

	public List<LayerInfo> getLods() {
		return lods;
	}

}
