package com.netposa.gis.server.bean;

import com.vividsolutions.jts.geom.Coordinate;
import com.vividsolutions.jts.geom.Geometry;
import com.vividsolutions.jts.geom.Point;
import com.vividsolutions.jts.geom.PrecisionModel;
import com.vividsolutions.jts.io.ParseException;
import com.vividsolutions.jts.io.WKTReader;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

public class GeometryFactory {
	
	private static final Log logger = LogFactory.getLog(GeometryFactory.class);
	private WKTReader reader;

	private static GeometryFactory instance = null;

	public static synchronized GeometryFactory getInstance() {
		if (instance == null) {
			instance = new GeometryFactory();
		}
		return instance;
	}

	public void getReader() {
		reader = new WKTReader();
	}

	@SuppressWarnings("deprecation")
	public Geometry[] createPoints(String wkts) {
		if (wkts == null || wkts.trim().length() == 0) {
			return new Geometry[] { null };
		}
		String[] temps = wkts.split("\\|");
		Geometry[] resultGeometries = new Geometry[temps.length];
		for (int i = 0; i < temps.length; i++) {
			int startIndex = temps[i].indexOf('(');
			String[] xy = temps[i].substring(startIndex + 1).replace(")", " ")
					.trim().split(" ");
			resultGeometries[i] = new Point(new Coordinate(
					Double.parseDouble(xy[0]), Double.parseDouble(xy[1])),
					new PrecisionModel(), 4326);
		}
		return resultGeometries;
	}

	public Geometry[] readGeometries(String wkts) throws ParseException {
		if (wkts == null || wkts.trim().length() == 0) {
		    return new Geometry[] {};
		}
		String[] temps = wkts.split("\\|");
		Geometry[] resultGeometries = new Geometry[temps.length];
		for (int i = 0; i < temps.length; i++) {
			resultGeometries[i] = this.buildGeo(temps[i]);
		}
		return resultGeometries;
	}

	public Geometry buildGeo(String str) throws ParseException {
		try {
			if (reader == null) {
				reader = new WKTReader();
			}
			return reader.read(str);
		} catch (ParseException e) {
			logger.error(e);
			throw e;
		}
	}
}
