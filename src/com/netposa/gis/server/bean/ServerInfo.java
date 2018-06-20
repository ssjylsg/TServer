package com.netposa.gis.server.bean;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import java.io.IOException;
import java.util.ArrayList;

public class ServerInfo {
	private static final Log logger = LogFactory.getLog(QueryParameterCollection.class);
	private Double currentVersion = 10.1;
	private String serviceDescription = "";
	private String mapName = "Layers";
	private String description = "";
	private String copyrightText = "";
	private boolean supportsDynamicLayers = false;
	private SpatialReference spatialReference = null;
	private boolean singleFusedMapCache = true;
	private TileInfo tileInfo = null;
	private Extent initialExtent = null;
	private Extent fullExtent = null;
	private Double minScale = 125000D;
	private Double maxScale = 4513.988705;
	private String units = "esriDecimalDegrees";
	private String supportedImageFormatTypes = "PNG32;PNG24;PNG;JPG;DIB;TIFF;EMF;PS;PDF;GIF;SVG;SVGZ;BMP";
	private String capabilities = "Map";
	private String supportedQueryFormats = "JSON; AMF";
	private int maxRecordCount = 1000;
	private int maxImageHeight = 2048;
	private int maxImageWidth = 2048;
	private String serviceName;

	public ServerInfo() {
		this.tileInfo = new TileInfo();
		this.fullExtent = new Extent();
	}

	/**
	 * @param currentVersion
	 *            the currentVersion to set
	 */
	public void setCurrentVersion(Double currentVersion) {
		this.currentVersion = currentVersion;
	}

	/**
	 * @return the currentVersion
	 */
	public Double getCurrentVersion() {
		return currentVersion;
	}

	/**
	 * @param serviceDescription
	 *            the serviceDescription to set
	 */
	public void setServiceDescription(String serviceDescription) {
		this.serviceDescription = serviceDescription;
	}

	/**
	 * @return the serviceDescription
	 */
	public String getServiceDescription() {
		return serviceDescription;
	}

	/**
	 * @param mapName
	 *            the mapName to set
	 */
	public void setMapName(String mapName) {
		this.mapName = mapName;
	}

	/**
	 * @return the mapName
	 */
	public String getMapName() {
		return mapName;
	}

	/**
	 * @param description
	 *            the description to set
	 */
	public void setDescription(String description) {
		this.description = description;
	}

	/**
	 * @return the description
	 */
	public String getDescription() {
		return description;
	}

	/**
	 * @param copyrightText
	 *            the copyrightText to set
	 */
	public void setCopyrightText(String copyrightText) {
		this.copyrightText = copyrightText;
	}

	/**
	 * @return the copyrightText
	 */
	public String getCopyrightText() {
		return copyrightText;
	}

	/**
	 * @param supportsDynamicLayers
	 *            the supportsDynamicLayers to set
	 */
	public void setSupportsDynamicLayers(boolean supportsDynamicLayers) {
		this.supportsDynamicLayers = supportsDynamicLayers;
	}

	/**
	 * @return the supportsDynamicLayers
	 */
	public boolean isSupportsDynamicLayers() {
		return supportsDynamicLayers;
	}

	/**
	 * @param spatialReference
	 *            the spatialReference to set
	 */
	public void setSpatialReference(SpatialReference spatialReference) {
		this.spatialReference = spatialReference;
	}

	/**
	 * @return the spatialReference
	 */
	public SpatialReference getSpatialReference() {
		return spatialReference;
	}

	private static Node getNodeByName(NodeList list, String name) {
		for (int i = 0; i < list.getLength(); i++) {
			if (list.item(i).getNodeName().equalsIgnoreCase(name)) {
				return list.item(i);
			}
		}
		return null;
	}

	private static Extent getMapExtent(Document confcdi) {
		Extent extent = new Extent();
		NodeList list = confcdi.getDocumentElement().getChildNodes();
		extent.setXmin(Double.parseDouble(getNodeByName(list, "XMin")
				.getTextContent()));
		extent.setYmin(Double.parseDouble(getNodeByName(list, "YMin")
				.getTextContent()));
		extent.setXmax(Double.parseDouble(getNodeByName(list, "XMax")
				.getTextContent()));
		extent.setYmax(Double.parseDouble(getNodeByName(list, "YMax")
				.getTextContent()));
		return extent;
	}

	public static ServerInfo readXmlConfig(String configXml, String confcdi) {
		ServerInfo info = new ServerInfo();
		try {

			DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
			DocumentBuilder db = dbf.newDocumentBuilder();
			Document document = db.parse(configXml);

			Element rootElement = document.getDocumentElement();
			 
			NodeList tileCacheInfo = rootElement
					.getElementsByTagName("TileCacheInfo");
			NodeList tileImageInfo = rootElement
					.getElementsByTagName("TileImageInfo");

			Node cacheTileFormat = getNodeByName(tileImageInfo.item(0)
					.getChildNodes(), "CacheTileFormat");

			NodeList wkid = tileCacheInfo.item(0).getChildNodes();

			Node spatialReference = getNodeByName(wkid, "SpatialReference");
			if (spatialReference != null) {
				Node wnode = getNodeByName(spatialReference.getChildNodes(),
						"WKID");
				info.setSpatialReference(new SpatialReference(Integer
						.parseInt(wnode.getTextContent()), Integer
						.parseInt(wnode.getTextContent())));
			}

			Extent extent = getMapExtent(db.parse(confcdi));
			extent.setSpatialReference(info.getSpatialReference());
			info.setFullExtent(extent);
			info.setInitialExtent(extent);

			Node tileCols = getNodeByName(wkid, "TileCols");
			Node tileRows = getNodeByName(wkid, "TileRows");
			Node dpi = getNodeByName(wkid, "DPI");

			TileInfo tileInfo = new TileInfo();

			tileInfo.setCols(Integer.parseInt(tileCols.getTextContent()));
			tileInfo.setRows(Integer.parseInt(tileRows.getTextContent()));
			tileInfo.setDpi(Integer.parseInt(dpi.getTextContent()));
			tileInfo.setFormat(cacheTileFormat.getTextContent());
			tileInfo.setCompressionQuality(Integer
					.parseInt(getNodeByName(
							tileImageInfo.item(0).getChildNodes(),
							"CompressionQuality").getTextContent()));

			tileInfo.setSpatialReference(info.getSpatialReference());

			Node tileOrigin = getNodeByName(wkid, "TileOrigin");
			tileInfo.setOrigin(new Origin(Double.parseDouble(getNodeByName(
					tileOrigin.getChildNodes(), "X").getTextContent()), Double
					.parseDouble(getNodeByName(tileOrigin.getChildNodes(), "Y")
							.getTextContent())));
			Node eNode = getNodeByName(wkid, "LODInfos");
			NodeList lodInfos = eNode.getChildNodes();
			ArrayList<LayerInfo> lays = new ArrayList<>();
			for (int i = 0; i < lodInfos.getLength(); i++) {
				NodeList layerInfosList = lodInfos.item(i).getChildNodes();
				if (layerInfosList.getLength() != 0) {
					int level = Integer.parseInt(getNodeByName(layerInfosList,
							"LevelID").getTextContent());
					Double resolution = Double.parseDouble(getNodeByName(
							layerInfosList, "Resolution").getTextContent());

					double scale = Double.parseDouble(getNodeByName(
							layerInfosList, "Scale").getTextContent());
					lays.add(new LayerInfo(level, resolution, scale));
				}
			}

			tileInfo.setLods(lays);
			info.setTileInfo(tileInfo);

		} catch (IOException | ParserConfigurationException | SAXException e) {
			logger.error(e);
		}
		return info;
	}

	public void setTileInfo(TileInfo tileInfo) {
		this.tileInfo = tileInfo;
	}

	public TileInfo getTileInfo() {
		return tileInfo;
	}

	public void setInitialExtent(Extent initialExtent) {
		this.initialExtent = initialExtent;
	}

	public Extent getInitialExtent() {
		return initialExtent;
	}

	public void setFullExtent(Extent fullExtent) {
		this.fullExtent = fullExtent;
	}

	public Extent getFullExtent() {
		return fullExtent;
	}

	public void setSingleFusedMapCache(boolean singleFusedMapCache) {
		this.singleFusedMapCache = singleFusedMapCache;
	}

	public boolean isSingleFusedMapCache() {
		return singleFusedMapCache;
	}

	public void setUnits(String units) {
		this.units = units;
	}

	public String getUnits() {
		return units;
	}

	public void setSupportedImageFormatTypes(String supportedImageFormatTypes) {
		this.supportedImageFormatTypes = supportedImageFormatTypes;
	}

	public String getSupportedImageFormatTypes() {
		return supportedImageFormatTypes;
	}

	public void setCapabilities(String capabilities) {
		this.capabilities = capabilities;
	}

	public String getCapabilities() {
		return capabilities;
	}

	public void setSupportedQueryFormats(String supportedQueryFormats) {
		this.supportedQueryFormats = supportedQueryFormats;
	}

	public String getSupportedQueryFormats() {
		return supportedQueryFormats;
	}

	public void setMaxRecordCount(int maxRecordCount) {
		this.maxRecordCount = maxRecordCount;
	}

	public int getMaxRecordCount() {
		return maxRecordCount;
	}

	public void setMaxImageHeight(int maxImageHeight) {
		this.maxImageHeight = maxImageHeight;
	}

	public int getMaxImageHeight() {
		return maxImageHeight;
	}

	public void setMaxImageWidth(int maxImageWidth) {
		this.maxImageWidth = maxImageWidth;
	}

	public int getMaxImageWidth() {
		return maxImageWidth;
	}

	public void setMaxScale(Double maxScale) {
		this.maxScale = maxScale;
	}

	public Double getMaxScale() {
		return maxScale;
	}

	public void setMinScale(Double minScale) {
		this.minScale = minScale;
	}

	public Double getMinScale() {
		return minScale;
	}

	public String getServiceName() {
		return serviceName;
	}

	public void setServiceName(String serviceName) {
		this.serviceName = serviceName;
	}
}
