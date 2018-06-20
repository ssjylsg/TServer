package com.netposa.gis.server.bean;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.util.ArrayList;
import java.util.List;

public class NPGISMap   {
	private static final Log logger = LogFactory.getLog(NPGISMap.class);
	private int minZoom;
	private int maxZoom;
	private int defaultZoom;
	private String type;
	private String zoomLevelSequence = "2";
	private List<Double> centerPoint = null;
	private List<Double> restrictedExtent = null;
	private List<Double> fullExtent = null;
	private String projection = "4326";
	private String layerType = "tiandi";

	public int getMinZoom() {
		return minZoom;
	}

	public void setMinZoom(int minZoom) {
		this.minZoom = minZoom;
		if (this.defaultZoom != minZoom) {
			this.defaultZoom = minZoom;
		}
	}

	public int getMaxZoom() {
		return maxZoom;
	}

	public void setMaxZoom(int maxZoom) {
		this.maxZoom = maxZoom;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public String getZoomLevelSequence() {
		return zoomLevelSequence;
	}

	public void setZoomLevelSequence(String zoomLevelSequence) {
		this.zoomLevelSequence = zoomLevelSequence;
	}

	public List<Double> getCenterPoint() {
		return centerPoint;
	}

	public void setCenterPoint(List<Double> centerPoint) {
		this.centerPoint = centerPoint;
	}

	public List<Double> getRestrictedExtent() {
		return restrictedExtent;
	}

	public void setRestrictedExtent(List<Double> restrictedExtent) {
		this.restrictedExtent = restrictedExtent;
	}

	public List<Double> getFullExtent() {
		return fullExtent;
	}

	public void setFullExtent(List<Double> fullExtent) {
		this.fullExtent = fullExtent;
	}

	public void setLayerType(String layerType) {
		this.layerType = layerType;
	}

	public String getLayerType() {
		return this.layerType;
	}

	/*
	 * ��ȡ�����ļ�
	 */
	public static NPGISMap readXml(String xmlPath) {
		NPGISMap npGISMap = new NPGISMap();
		DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
		try {
			DocumentBuilder db = dbf.newDocumentBuilder();
			Document doc = db.parse(xmlPath);

			NodeList dogList = doc.getElementsByTagName("map");
			for (int i = 0; i < dogList.getLength(); i++) {
				npGISMap = createNPGISMap(dogList.item(i));
			}
		} catch (Exception e) {
			logger.error(e);
		}
		return npGISMap;
	}
	
	private static NPGISMap createNPGISMap(Node lucenNode) {
		NPGISMap npGISMap = new NPGISMap();

		for (Node node = lucenNode.getFirstChild(); node != null; node = node.getNextSibling()) {
			if (node.getNodeType() == Node.ELEMENT_NODE) {
				if (!node.hasChildNodes()) {
					continue;
				}
				String value = node.getFirstChild().getNodeValue();
				switch (node.getNodeName()) {
				case "minZoom":
					npGISMap.setMinZoom(Integer.parseInt(value));
					break;
				case "maxZoom":
					npGISMap.setMaxZoom(Integer.parseInt(value));
					break;
				case "restrictedExtent":
					npGISMap.setRestrictedExtent(builderEestrictedExtent(value));
					break;
				case "fullExtent":
					npGISMap.setFullExtent(builderFullExtent(value));
					break;
				case "centerPoint":
					npGISMap.setCenterPoint(builderCenterPoints(value));
					break;
				case "projection":
					npGISMap.setProjection(value);
					break;
				case "type":
					npGISMap.setType(value);
					break;
				case "zoomLevelSequence":
					npGISMap.setZoomLevelSequence(value);
					break;
				case "layerType":
					npGISMap.setLayerType(value);
					break;
				case "defaultZoom":
					npGISMap.setDefaultZoom(Integer.parseInt(value));
					break;
				default:
					break;
				}
			}
		}

		return npGISMap;
	}

	public String getProjection() {
		return projection;
	}

	public void setProjection(String projection) {
		this.projection = projection;
	}

	public int getDefaultZoom() {
		return defaultZoom;
	}

	public void setDefaultZoom(int defaultZoom) {
		this.defaultZoom = defaultZoom;
	}
	
	private static List<Double> builderEestrictedExtent(String value) {
		List<Double> restrictedExtent = new ArrayList<>();
		restrictedExtent.add(Double.parseDouble(value.split(",")[0]));
		restrictedExtent.add(Double.parseDouble(value.split(",")[1]));
		restrictedExtent.add(Double.parseDouble(value.split(",")[2]));
		restrictedExtent.add(Double.parseDouble(value.split(",")[3]));

		return restrictedExtent;
	}

	private static List<Double> builderFullExtent(String value) {
		List<Double> fullExtent = new ArrayList<>();
		fullExtent.add(Double.parseDouble(value.split(",")[0]));
		fullExtent.add(Double.parseDouble(value.split(",")[1]));
		fullExtent.add(Double.parseDouble(value.split(",")[2]));
		fullExtent.add(Double.parseDouble(value.split(",")[3]));

		return fullExtent;
	}
	
	private static List<Double> builderCenterPoints(String value) {
		List<Double> centerPoints = new ArrayList<>();
		centerPoints.add(Double.parseDouble(value.split(",")[0]));
		centerPoints.add(Double.parseDouble(value.split(",")[1]));

		return centerPoints;
	}

}
