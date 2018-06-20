package com.netposa.gis.server.bean;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;

public class QueryParameterCollection {
    private static final Log LOGGER = LogFactory.getLog(QueryParameterCollection.class);
	
    private static List<QueryParameter> queryParameters = new ArrayList<>();

    private QueryParameterCollection() {};
    
    static {
        QueryParameterCollection.readConfig();
    }
    
    private static class LazyHolder {
        private static final QueryParameterCollection INSTANCE = new QueryParameterCollection();
    }

    public List<QueryParameter> getParameters() {
        return queryParameters;
    }

	public static QueryParameterCollection getInstance() {
	    return LazyHolder.INSTANCE;
	}

	public QueryParameter getParmeterByKey(String key) {
		for (QueryParameter queryParameter : queryParameters) {
			if (queryParameter.getKey().equalsIgnoreCase(key)) {
				return queryParameter;
			}
		}
		LOGGER.error("获取key:" + key + "失败");
		return null;
	}

    public String getTableNameByKey(TableKeyEnum key) {
        for (QueryParameter queryParameter : queryParameters) {
            if (queryParameter.getKey().equalsIgnoreCase(key.key)) {
                return queryParameter.getTableName();
            }
        }
        return "";
    }

	private static void readConfig() {
		DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
		try {
			queryParameters.clear();
			URL url = QueryParameterCollection.class.getClassLoader()
					.getResource("queryParmeters.xml");
			DocumentBuilder db = dbf.newDocumentBuilder();
			Document doc = db.parse(url.getFile());

			NodeList dogList = doc.getElementsByTagName("QueryParameter");
			for (int i = 0; i < dogList.getLength(); i++) {
				Node lucenNode = dogList.item(i);
				queryParameters.add(getQueryParameter(lucenNode));
			}
		} catch (Exception e) {
		    LOGGER.error(e);
		}
	}
	
	private static QueryParameter getQueryParameter(Node lucenNode){
		QueryParameter index = new QueryParameter();
		for (Node node = lucenNode.getFirstChild(); node != null; node = node.getNextSibling()) {
			if (node.getNodeType() == Node.ELEMENT_NODE) {
				if (!node.hasChildNodes()) {
					continue;
				}
				String value = node.getFirstChild().getNodeValue();
				
				switch (node.getNodeName()) {
				case "key":
					index.setKey(value);
					break;
				case "name":
					index.setName(value);
					break;
				case "tableName":
					index.setTableName(value);
					break;
				case "seqName":
					index.setSeqName(value);
					break;
				default:
					break;
				}
			}
		}
		return index;
	}
}
