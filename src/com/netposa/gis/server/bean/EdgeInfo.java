package com.netposa.gis.server.bean;

import com.vividsolutions.jts.geom.Coordinate;
import org.geotools.graph.structure.Edge;

public class EdgeInfo {
	private Edge edge = null;
	private Coordinate vertailPoint = null;
	
	public Edge getEdge() {
		return edge;
	}
	public void setEdge(Edge edge) {
		this.edge = edge;
	}
	public Coordinate getVertailPoint() {
		return vertailPoint;
	}
	public void setVertailPoint(Coordinate vertailPoint) {
		this.vertailPoint = vertailPoint;
	}
	
	
}
