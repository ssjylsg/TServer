package com.netposa.gis.server.bean;

import com.netposa.gis.server.utils.NetposaHelper;
import com.vividsolutions.jts.geom.*;
import org.codehaus.jackson.annotate.JsonIgnoreProperties;

import java.util.ArrayList;
import java.util.List;

@JsonIgnoreProperties(value = { "lineString" })
public class SegmentInfo {
	private int id = 0;
	private String nextStreetName = "";
	private String routelatlon = "";
	private String strguide = "";
	private String turnlatlon = "";
	private String turnAction = "";
	private transient MultiLineString lineString;

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getNextStreetName() {
		return nextStreetName;
	}

	public void setNextStreetName(String nextStreetName) {
		this.nextStreetName = nextStreetName;
	}

	public String getRoutelatlon() {
		return routelatlon;
	}

	public Coordinate setRoteGeomtery(MultiLineString rote, Coordinate startPoint) {
		NALinesPoint lp = orderMultiLine(rote, startPoint);
		this.routelatlon = NetposaHelper.geomoterJson(lp.getLines());
		this.lineString = lp.getLines();
		return lp.getStartPoint();
	}

	public String getStrguide() {
		return strguide;
	}

	public void setStrguide(String strguide) {
		this.strguide = strguide;
	}

	public String getTurnlatlon() {
		return turnlatlon;
	}

	public void setTurnlatlon(String turnlatlon) {
		this.turnlatlon = turnlatlon;
	}

	public String getTurnAction() {
		return turnAction;
	}

	public void setTurnAction(String turnAction) {
		this.turnAction = turnAction;
	}

	private static LinePoint findeLine(ArrayList<NaLine> rote, Coordinate startPoint) {
		for (NaLine naLine : rote) {
			if (naLine.isStart(startPoint)) {
				LinePoint linePoint = new LinePoint();
				linePoint.setLine(naLine);
				linePoint.setPoint(naLine.getPoints().get(naLine.getPointLength() - 1));

				linePoint.setIsreverse(false);
				return linePoint;
			}

			if (naLine.isEnd(startPoint)) {
				LinePoint linePoint = new LinePoint();
				linePoint.setLine(naLine);
				linePoint.setPoint(naLine.getPoints().get(0));
				linePoint.setIsreverse(true);

				return linePoint;
			}
		}
		return null;
	}

	/*
	 * 根据起点点线段排序
	 */
	@SuppressWarnings("deprecation")
	public static NALinesPoint orderMultiLine(MultiLineString lines, Coordinate startPoint) {
		int num = lines.getNumGeometries();

		ArrayList<NaLine> rote = new ArrayList<>();

		for (int i = 0; i < num; i++) {
			LineString line = (LineString) lines.getGeometryN(i);
			NaLine naLine = new NaLine();
			for (int j = 0; j < line.getNumPoints(); j++) {
				Point point = line.getPointN(j);
				naLine.push(point);
			}
			rote.add(naLine);
		}

		ArrayList<LineString> lineStrings = new ArrayList<>();
		Coordinate lineCoordinate = startPoint;
		while (!rote.isEmpty()) {
			LinePoint lp = findeLine(rote, lineCoordinate);
			if (lp != null) {
				rote.remove(lp.getLine());
				lineCoordinate = lp.getCoordinate();
				lineStrings.add(lp.getLine().createLineString(lp.getIsreverse()));
			} else {
				break;
			}
		}
		LineString[] temp = new LineString[lineStrings.size()];

		MultiLineString resultLineString = new MultiLineString(lineStrings.toArray(temp), new PrecisionModel(), 4326);
		return new NALinesPoint(resultLineString, lineCoordinate);
	}

	public List<LineString> getLines() {
		List<LineString> lineStrings = new ArrayList<>();
		int num = lineString.getNumGeometries();
		for (int i = 0; i < num; i++) {
			lineStrings.add((LineString) this.lineString.getGeometryN(i));
		}
		return lineStrings;
	}

	/*
	 * 清除Geometry 对象 防止序列化时出现异常
	 */
	@SuppressWarnings("deprecation")
	public void cleanLine() {
		lineString = new MultiLineString(new LineString[0], new PrecisionModel(), 0);
	}
	
	public List<Point> toPoints() {
		List<LineString> lines = this.getLines();
		List<Point> points = new ArrayList<>();
		for (LineString lineString : lines) {
			int pointNum = lineString.getNumPoints();

			for (int i = 0; i < pointNum; i++) {
				Point point = lineString.getPointN(i);

				if (!points.contains(point)) {
					points.add(point);
				}

			}
		}

		return points;
	}
}
