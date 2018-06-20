package com.netposa.gis.server.bean;

import com.netposa.gis.server.utils.Base64Util;
import com.netposa.gis.server.utils.NetposaHelper;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.dom4j.Document;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;
import org.dom4j.io.OutputFormat;
import org.dom4j.io.XMLWriter;

import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

public class ConfigBean {
    private static final Log LOGGER = LogFactory.getLog(ConfigBean.class);

    private static final String CONFIG_FILE = "config.properties";

    private String dbUrl;
    private String dbName;
    private String dbUserName;
    private String dbPassword;

    private String dbport;
    private List<QueryParameter> queryParameters;
    private ArrayList<CompactMap> mapConfigs;

    // 路网
    private String roadnetMsg;
    // 路口
    private String roadcrossMsg;
    // POI
    private String poiMsg;
    // 道路
    private String roadMsg;
    // 商圈
    private String bussinessreaMsg;
    // 室外全景
    private String panoconfigMsg;
    // 室内全景点位
    private String snpanopointMsg;
    // 室内全景配置
    private String snpanoconfigMsg;

    /**
     * @return the dbUrl
     */
    public String getDbUrl() {
        return dbUrl;
    }

    /**
     * @param dbUrl
     *            the dbUrl to set
     */
    public void setDbUrl(String dbUrl) {
        this.dbUrl = dbUrl;
    }

    /**
     * @return the dbName
     */
    public String getDbName() {
        return dbName;
    }

    /**
     * @param dbName
     *            the dbName to set
     */
    public void setDbName(String dbName) {
        this.dbName = dbName;
    }

    /**
     * @return the dbUserName
     */
    public String getDbUserName() {
        return dbUserName;
    }

    /**
     * @param dbUserName
     *            the dbUserName to set
     */
    public void setDbUserName(String dbUserName) {
        this.dbUserName = dbUserName;
    }

    /**
     * @return the dbPassword
     */
    public String getDbPassword() {
        return dbPassword;
    }

    /**
     * @param dbPassword
     *            the dbPassword to set
     */
    public void setDbPassword(String dbPassword) {
        this.dbPassword = dbPassword;
    }

    /**
     * @return the queryParameters
     */
    public List<QueryParameter> getQueryParameters() {
        return queryParameters;
    }

    /**
     * @param queryParameters
     *            the queryParameters to set
     */
    public void setQueryParameters(List<QueryParameter> queryParameters) {
        this.queryParameters = queryParameters;
    }

    public void initParmeter() throws IOException {
        this.queryParameters = QueryParameterCollection.getInstance().getParameters();
        setMapConfigs(NetposaHelper.getMapConfig());

        try (InputStream inputStream = ConfigBean.class.getClassLoader().getResourceAsStream(CONFIG_FILE)) {
            Properties p = new Properties();
            p.load(inputStream);
            this.dbUserName = p.getProperty("user").trim();
            this.dbPassword = Base64Util.encodeBase64(p.getProperty("password").trim(), 3);
            this.dbport = p.getProperty("port").trim();
            this.dbUrl = p.getProperty("url").trim();
            this.dbName = p.getProperty("database").trim();
        }
    }

    /**
     * @return the dbport
     */
    public String getDbport() {
        return dbport;
    }

    /**
     * @param dbport1
     *            the dbport to set
     */
    public void setDbport(String dbport1) {
        this.dbport = dbport1;
    }

    public void updateProperties() throws IOException {
        InputStream inputStream = null;
        OutputStream fos = null;
        try {
            inputStream = ConfigBean.class.getClassLoader().getResourceAsStream(CONFIG_FILE);

            if (inputStream != null) {
                Properties props = new Properties();
                props.load(inputStream);
                String profilepath = ConfigBean.class.getClassLoader().getResource("config.properties").getFile();
                fos = new FileOutputStream(profilepath);
                props.setProperty("user", dbUserName);
                props.setProperty("port", dbport);
                props.setProperty("url", dbUrl);
                props.setProperty("database", dbName);
                props.setProperty("password", Base64Util.decodeBase64(dbPassword, 3));
                props.store(fos, "");
            }
        } finally {
            if (inputStream != null) {
                inputStream.close();
            }
            if (fos != null) {
                fos.close();
            }
        }
    }

    private void updateQueryParmeters() {
        if (queryParameters != null && !queryParameters.isEmpty()) {
            try {
                Document doc = DocumentHelper.createDocument();
                doc.setXMLEncoding("UTF-8");
                Element root = doc.addElement("QueryParameterCollection");

                for (QueryParameter queryParameter : queryParameters) {
                    Element q = root.addElement("QueryParameter");
                    q.addElement("key").addText(queryParameter.getKey());
                    q.addElement("name").addText(queryParameter.getName());
                    String tableName = queryParameter.getTableName();
                    tableName = tableName == null ? "" : tableName;
                    q.addElement("tableName").addText(tableName);
                    String seqName = queryParameter.getSeqName();
                    seqName = seqName == null ? "" : seqName;
                    q.addElement("seqName").addText(seqName);
                }

                // 得到美化xml格式输出
                OutputFormat format = OutputFormat.createPrettyPrint();
                format.setEncoding("UTF-8");
                // FileWriter不会处理编码，所以即使你使用format.setEncoding("utf-8");他仍然不会使用utf-8编码，而只是把文件头指定为utf-8
                // 是什么编码完全取决于操作系统
                FileOutputStream fos = new FileOutputStream(ConfigBean.class.getClassLoader()
                        .getResource("queryParmeters.xml").getFile());

                XMLWriter xmlWriter = new XMLWriter(fos, format);
                xmlWriter.write(doc);
                xmlWriter.close();
            } catch (IOException e) {
                LOGGER.error(e);
            }
        }
    }

    /*
     * 保存配置
     */
    public void saveConfig() throws IOException {
        updateProperties();
        updateQueryParmeters();
    }

    /**
     * @param list
     *            the mapConfigs to set
     */
    public void setMapConfigs(List<CompactMap> list) {
        this.mapConfigs = (ArrayList<CompactMap>) list;
    }

    public List<CompactMap> getMapConfigs() {
        return this.mapConfigs;
    }

    public String getBussinessreaMsg() {
        return bussinessreaMsg;
    }

    public void setBussinessreaMsg(String bussinessreaMsg) {
        this.bussinessreaMsg = bussinessreaMsg;
    }

    public String getRoadnetMsg() {
        return roadnetMsg;
    }

    public void setRoadnetMsg(String roadnetMsg) {
        this.roadnetMsg = roadnetMsg;
    }

    public String getRoadcrossMsg() {
        return roadcrossMsg;
    }

    public void setRoadcrossMsg(String roadcrossMsg) {
        this.roadcrossMsg = roadcrossMsg;
    }

    public String getPoiMsg() {
        return poiMsg;
    }

    public void setPoiMsg(String poiMsg) {
        this.poiMsg = poiMsg;
    }

    public String getRoadMsg() {
        return roadMsg;
    }

    public void setRoadMsg(String roadMsg) {
        this.roadMsg = roadMsg;
    }

    public String getPanoconfigMsg() {
        return panoconfigMsg;
    }

    public void setPanoconfigMsg(String panoconfigMsg) {
        this.panoconfigMsg = panoconfigMsg;
    }

    public String getSnpanopointMsg() {
        return snpanopointMsg;
    }

    public void setSnpanopointMsg(String snpanopointMsg) {
        this.snpanopointMsg = snpanopointMsg;
    }

    public String getSnpanoconfigMsg() {
        return snpanoconfigMsg;
    }

    public void setSnpanoconfigMsg(String snpanoconfigMsg) {
        this.snpanoconfigMsg = snpanoconfigMsg;
    }

    public void setMsg(String type, String msg) {
        switch (type) {
        case "roadnet":
            setRoadnetMsg(msg);
            break;
        case "poi":
            setPoiMsg(msg);
            break;
        case "roadcross":
            setRoadcrossMsg(msg);
            break;
        case "road":
            setRoadMsg(msg);
            break;
        case "panoconfig":
            setPanoconfigMsg(msg);
            break;
        case "snpanopoint":
            setSnpanopointMsg(msg);
            break;
        case "snpanoconfig":
            setSnpanoconfigMsg(msg);
            break;
        default:
            // setRoadMsg(msg);
            break;
        }
    }
}