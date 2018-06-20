package com.netposa.gis.server.bean;

import com.netposa.gis.server.utils.NetposaHelper;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;
import org.dom4j.io.OutputFormat;
import org.dom4j.io.XMLWriter;
import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class CompactMap {
	private static final Log logger = LogFactory.getLog(CompactMap.class);
	private String name;
	private String title;
	private String mapUrl;
	private String mapType;
	/*
	 1.切片服务:png 或没有此属性
	 2. 高德矢量服务:gaodejson
     3. 百度矢量服务 :json
     4. 模型服务:model
    */
	private String type;
	private String table;// 模型服务是否有属性表
	
	public static void saveConfigs(List<CompactMap> list){
		if (list != null && !list.isEmpty()) {
			try {
				org.dom4j.Document doc = DocumentHelper.createDocument();
				doc.setXMLEncoding("UTF-8");
				Element root = doc.addElement("maps");				
				for (CompactMap queryParameter : list) {
					Element q = root.addElement("map");
					q.addElement("title").addText(queryParameter.getTitle());
					q.addElement("name").addText(queryParameter.getName());
					q.addElement("mapType").addText(queryParameter.getMapType());
					q.addElement("mapUrl").addText(queryParameter.getMapUrl());
					String type = queryParameter.getType();
					if(type != null){
						q.addElement("type").addText(type);
					}
					String table = queryParameter.getTable();
					if(table != null) {
					    q.addElement("table").addText(table);
					}
				}

				OutputFormat format = OutputFormat.createPrettyPrint();
				format.setEncoding("UTF-8");

				String url = CompactMap.class.getClassLoader().getResource("map.xml").getFile();
				File file = new File(url);
				FileOutputStream fileOutputStream = new FileOutputStream(file);
				
				XMLWriter xmlWriter = new XMLWriter(fileOutputStream, format);
				xmlWriter.write(doc);
				xmlWriter.close();
				// 重新读取数据
				NetposaHelper.reReadMapConfig();
				
			} catch (IOException e) {
				logger.error(e);
			}
		}
	}
	
	/*
	 * 读取切片 Conf.xml, 从 type 判断是否为风格化地图
	 * 如果 type 值 json 表示该服务为风格化
	 */
	public static String getMapStyle(String xmlPath) {
		String style = "";
		DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
		try {
			DocumentBuilder db = dbf.newDocumentBuilder();
			Document doc = db.parse(xmlPath);
			NodeList mapList = doc.getElementsByTagName("map");

			Node mapNode = mapList.item(0);
			
			String layerType = "";
			for (Node node = mapNode.getFirstChild(); node != null; node = node.getNextSibling()) {
				if (node.getNodeType() == Node.ELEMENT_NODE) {

					if (!node.hasChildNodes()) {
						continue;
					}
					
					// 处理高德矢量地图代码，map.xml 中 设置 type 值为 gaodejson，百度矢量地图 type 为 json，普通地图没有 type 属性
                    if (node.getNodeName().equals("layerType")
                            && "gaodeVector".equals(node.getFirstChild().getNodeValue())) {
                        layerType = "gaodeVector";
                    }

                    if (node.getNodeName().equals("type")) {
                        if ("gaodeVector".equals(layerType)) {
                            style = "gaodejson";
                        } else {
                            style = node.getFirstChild().getNodeValue();
                        }

                        break;
                    }
					// 处理高德矢量地图代码 end

					/*if (node.getNodeName().equals("type")) {
						style = node.getFirstChild().getNodeValue();
						break;
					}*/
				}
			}

		} catch (Exception e) {
			logger.error(e);
		}

		return style;
	}
	
	/*
	 * 读取配置文件
	 */
	public static List<CompactMap> readXml(String xmlPath) {
		List<CompactMap> list = new ArrayList<>();
		DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
		try {
			DocumentBuilder db = dbf.newDocumentBuilder();
			Document doc = db.parse(xmlPath);

			NodeList dogList = doc.getElementsByTagName("map");
			for (int i = 0; i < dogList.getLength(); i++) {

				CompactMap compactMap = createCompactMap(dogList.item(i));

				list.add(compactMap);
			}
		} catch (Exception e) {
			logger.error(e);
		}
		return list;
	}

	private static CompactMap createCompactMap(Node lucenNode) {
		CompactMap compactMap = new CompactMap();
		for (Node node = lucenNode.getFirstChild(); node != null; node = node.getNextSibling()) {
			if (node.getNodeType() == Node.ELEMENT_NODE) {
				if (!node.hasChildNodes()) {
					continue;
				}
				String value = node.getFirstChild().getNodeValue();
				switch (node.getNodeName()) {
				case "name":
					compactMap.setName(value);
					break;
				case "title":
					compactMap.setTitle(value);
					break;
				case "mapType":
					compactMap.setMapType(value);
					break;
				case "mapUrl":
					compactMap.setMapUrl(value);
					break;
				case "type":
					compactMap.setType(value);
					break;
				case "table":
                    compactMap.setTable(value);
                    break;
				default:
					break;
				}
			}
		}
		return compactMap;
	}
	
	public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
    public String getTitle() {
        return title;
    }
    public void setTitle(String title) {
        this.title = title;
    }
    public String getMapUrl() {
        return mapUrl;
    }
    public void setMapUrl(String mapUrl) {
        this.mapUrl = mapUrl;
    }
    public String getType() {
        return type;
    }
    public void setType(String type) {
        this.type = type;
    }
	public String getMapType() {
		return mapType;
	}
	public void setMapType(String mapType) {
		this.mapType = mapType;
	}
    public String getTable() {
        return table;
    }
    public void setTable(String table) {
        this.table = table;
    }
}
