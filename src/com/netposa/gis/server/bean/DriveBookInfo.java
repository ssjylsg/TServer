package com.netposa.gis.server.bean;

import com.netposa.gis.server.utils.NetposaHelper;
import com.vividsolutions.jts.geom.*;

import java.util.List;

public class DriveBookInfo {
	private String routelatlon = "{\"type\":\"MultiLineString\",\"coordinates\":[]}";

	private Routes routes;
	private Boolean isMutileRoute = false;

	public DriveBookInfo() {
		super();
	}

	public DriveBookInfo(Boolean isMutileRoute) {
		this();
		this.isMutileRoute = isMutileRoute;
		this.routes = new Routes();
	}

	public DriveBookInfo(Point startPoint, Point endPoint) {
		this();
		this.routes.setStartPoint(NetposaHelper.geomoterJson(startPoint));
		this.routes.setEndPoint(NetposaHelper.geomoterJson(endPoint));
	}

	public String getRoutelatlon() {
		return routelatlon;
	}

	public Routes getRoutes() {
		return routes;
	}

	@SuppressWarnings("deprecation")
	private void generateRoutelatlon() {

		List<Point> points = routes.toPoints();

		Coordinate[] coordinates = new Coordinate[points.size()];
		for (int i = 0; i < points.size(); i++) {
			coordinates[i] = new Coordinate(points.get(i).getX(), points.get(i).getY());
		}

		LineString[] tempLineStrings = new LineString[] { new LineString(coordinates, new PrecisionModel(), 4326) };

		this.routelatlon = NetposaHelper.geomoterJson(new MultiLineString(coordinates.length == 0 ? new LineString[0]
				: tempLineStrings, new PrecisionModel(), 4326));
	}
	
	public void clearRoutesPoint() {
		List<SegmentInfo> segmentInfos = routes.getSegments();
		for (SegmentInfo segmentInfo : segmentInfos) {
			segmentInfo.cleanLine();
		}
	}

	public void setRoutes(Routes routes) {
		this.routes = routes;
		if (!this.isMutileRoute) {
			generateRoutelatlon();
		}
	}

}
