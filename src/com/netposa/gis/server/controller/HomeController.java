package com.netposa.gis.server.controller;

import com.netposa.gis.server.utils.NetposaHelper;
import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.methods.GetMethod;
import org.apache.commons.httpclient.params.HttpMethodParams;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.MalformedURLException;
import java.util.ArrayList;

@Controller
@RequestMapping("/home")
public class HomeController {
	private static final Log logger = LogFactory.getLog(HomeController.class);
	private String tiandiMapConfig = " {            \"mapOpts\": {"
			+ "                \"minZoom\": 11,"
			+ "                \"defaultZoom\": 11,"
			+ "                \"maxZoom\": 18,"
			+ "                \"centerPoint\": [@mapCenter],"
			+ "                \"projection\": \"EPSG:4326\""
			+ "            },"
			+ "            \"vectorLayer\": [{"
			+ "                \"layerName\": \"shanghaiBaseMap1\","
			+ "                \"layerType\": \"NPMapLib.Layers.TDMapLayer\","
			+ "                \"layerOpt\": {"
			+ "                    \"url\": [\"http://t4.tianditu.com/DataServer\", \"http://t4.tianditu.com/DataServer\", \"http://t4.tianditu.com/DataServer\"],"
			+ "                    \"mirrorUrls\": [\"http://t4.tianditu.com/DataServer\", \"http://t4.tianditu.com/DataServer\", \"http://t4.tianditu.com/DataServer\"],"
			+ "                    \"isBaseLayer\": true,"
			+ "                    \"mapType\": \"EMap\""
			+ "                }"
			+ "            }, {"
			+ "                \"layerName\": \"shanghaiBaseMap\","
			+ "                \"layerType\": \"NPMapLib.Layers.TDMapLayer\","
			+ "                \"layerOpt\": {"
			+ "                    \"url\": [\"http://t4.tianditu.com/DataServer\", \"http://t4.tianditu.com/DataServer\", \"http://t4.tianditu.com/DataServer\"],"
			+ "                    \"mirrorUrls\": [\"http://t4.tianditu.com/DataServer\", \"http://t4.tianditu.com/DataServer\", \"http://t4.tianditu.com/DataServer\"],"
			+ "                    \"isBaseLayer\": false,"
			+ "                    \"mapType\": \"ESatellite\""
			+ "                }" + "            }],            "
			+ " \"sattilateLayer\": []}";
	private String gaoDeMapConfig = " {"
			+ "\"mapOpts\": {"
			+ "  \"minZoom\": 11,"
			+ "  \"defaultZoom\": 11,"
			+ "  \"maxZoom\": 18,"
			+ "  \"projection\": \"EPSG:900913\","
			+ "  \"displayProjection\": \"EPSG:4326\""
			+ " },"
			+ " \"vectorLayer\": [{"
			+ "    \"layerName\": \"shanghaiBaseMap1\","
			+ "   \"layerType\": \"NPMapLib.Layers.GaoDeLayer\","
			+ "  \"layerOpt\": {"
			+ "      \"url\": [\"http://webrd01.is.autonavi.com/appmaptile??lang=zh_cn&size=1&scale=1&style=7\","
			+ "        \"http://webrd02.is.autonavi.com/appmaptile??lang=zh_cn&size=1&scale=1&style=7\","
			+ "         \"http://webrd03.is.autonavi.com/appmaptile??lang=zh_cn&size=1&scale=1&style=7\","
			+ "       \"http://webrd04.is.autonavi.com/appmaptile??lang=zh_cn&size=1&scale=1&style=7\""
			+ "   ]," + "  \"centerPoint\": [@mapCenter],"
			+ "   \"isBaseLayer\": true" + "   }" + " }],"
			+ " \"sattilateLayer\":[]" + "}";
	private String googleMapConfig = " {"
			+ "\"mapOpts\": {"
			+ "  \"minZoom\": 6,"
			+ "  \"defaultZoom\": 11,"
			+ "  \"maxZoom\": 18,"
			+ "  \"projection\": \"EPSG:900913\","
			+ "  \"displayProjection\": \"EPSG:4326\""
			+ " },"
			+ " \"vectorLayer\": [{"
			+ "    \"layerName\": \"shanghaiBaseMap1\","
			+ "   \"layerType\": \"NPMapLib.Layers.GoogleMapTileLayer\","
			+ "  \"layerOpt\": {"
			+ "      \"url\": [\"http://mt0.google.cn/vt?pb=!1m4!1m3!1i${z}!2i${x}!3i${y}!2m3!1e0!2sm!3i285000000!3m9!2szh-CN!3sCN!5e18!12m1!1e47!12m3!1e37!2m1!1ssmartmaps!4e0\","
			+ "        \"http://mt1.google.cn/vt?pb=!1m4!1m3!1i${z}!2i${x}!3i${y}!2m3!1e0!2sm!3i285000000!3m9!2szh-CN!3sCN!5e18!12m1!1e47!12m3!1e37!2m1!1ssmartmaps!4e0\""
			+ "   ]," + "  \"centerPoint\": [@mapCenter],"
			+ "   \"isBaseLayer\": true" + "   }" + " }],"
			+ " \"sattilateLayer\":[]" + "}";
	private String baiduDeMapConfig = "{"
			+ "\"mapOpts\": {"
			+ "\"minZoom\": 6,"
			+ "\"defaultZoom\": 11,"
			+ "\"maxZoom\": 18,"
			+ "\"centerPoint\": [@mapCenter],"
			+ "\"projection\": \"EPSG:900913\""
			+ "},"
			+ "\"vectorLayer\": [{"
			+ "\"layerName\": \"shanghaiBaseMap1\","
			+ "\"layerType\": \"NPMapLib.Layers.BaiduTileLayer\","
			+ "\"layerOpt\": {"
			+ "\"url\": [\"http://online1.map.bdimg.com/tile/?qt=tile&x=${x}&y=${y}&z=${z}&styles=pl&udt=20150605&scaler=1\", \"http://online2.map.bdimg.com/tile/?qt=tile&x=${x}&y=${y}&z=${z}&styles=pl&udt=20150605&scaler=1\", \"http://online3.map.bdimg.com/tile/?qt=tile&x=${x}&y=${y}&z=${z}&styles=pl&udt=20150605&scaler=1\"],"
			+ "\"isBaseLayer\": true," + "\"mapTyp\": \"EMap\"" + "}" + "}],"
			+ "\"sattilateLayer\": []" + "}";

	private String osmMapConfig = "{"
			+ "\"mapOpts\": {"
			+ "\"minZoom\": 5,"
			+ "\"defaultZoom\": 11,"
			+ "\"maxZoom\": 19,"
			+ "\"centerPoint\": [@mapCenter],"
			+ "\"projection\": \"EPSG:900913\""
			+ "},"
			+ "\"vectorLayer\": [{"
			+ "\"layerName\": \"shanghaiBaseMap\","
			+ "\"layerType\": \"NPMapLib.Layers.OSMLayer\","
			+ "\"layerOpt\": {"
			+ "\"url\": [\"http://a.tile.openstreetmap.org/${z}/${x}/${y}.png\","
			+ "\"http://b.tile.openstreetmap.org/${z}/${x}/${y}.png\","
			+ "\"http://c.tile.openstreetmap.org/${z}/${x}/${y}.png\"" + "],"
			+ "\"isChina\": false" + "}" + "}]," + "\"sattilateLayer\": []"
			+ "}";

	/*@RequestMapping(value = "", method = RequestMethod.GET)
	public String anth(ModelMap modelMap, String message) {
		String key = HardWareUtils.getKey();
		modelMap.addAttribute("key", key);
		modelMap.addAttribute("message", message);
		return "noauth";
	}*/

	private void downNpgisConfig(HttpServletResponse response,
			JSONObject jsonObject, String url, String result) {
		response.setContentType("application/octet-stream");
		response.setHeader("Content-Disposition",
				"attachment; filename=mapConfig.json");
		StringBuilder buffer = new StringBuilder();
		buffer.append("{\"mapOpts\":{\"minZoom\":"
				+ jsonObject.getInt("minZoom"));
		buffer.append(",\"maxZoom\":");
		buffer.append(jsonObject.getInt("maxZoom"));
		buffer.append(",\"centerPoint\":");
		buffer.append(jsonObject.getJSONArray("centerPoint"));
		buffer.append(",\"restrictedExtent\":");
		buffer.append(jsonObject.getJSONArray("restrictedExtent"));
		buffer.append(",\"projection\":\"EPSG:");
		buffer.append(jsonObject.getString("projection"));
		buffer.append("\"}");

		String serviceName = "Npgis";

		buffer.append(",\"vectorLayer\":[{\"layerName\":\"" + serviceName
				+ "\",\"layerType\":\"NPMapLib.Layers.NPLayer\","
				+ "\"layerOpt\":{\"url\":\"" + url + "\",\"layerInfo\":");
		buffer.append(result);
		buffer.append("}}],");
		buffer.append(" \"sattilateLayer\": []}");
		try {
			ServletOutputStream out = response.getOutputStream();
			out.write(buffer.toString().getBytes());
			out.flush();
		} catch (IOException e) {
			logger.error(e);
		}
	}

	private void downLoadArcgisConfig(HttpServletResponse response,
			JSONObject jsonObject, String url, String result) {
		try {
			JSONObject tileInfo = (JSONObject) jsonObject.get("tileInfo");
			JSONArray lods = (JSONArray) tileInfo.get("lods");

			JSONObject initialExtent = (JSONObject) jsonObject
					.get("initialExtent");
			Double xmin = initialExtent.getDouble("xmin");
			Double ymin = initialExtent.getDouble("ymin");
			Double xmax = initialExtent.getDouble("xmax");
			Double ymax = initialExtent.getDouble("ymax");

			ArrayList<Double> center = new ArrayList<>();
			center.add((xmin + xmax) / 2.0);
			center.add((ymin + ymax) / 2.0);
			JSONObject fullExtent = (JSONObject) jsonObject.get("fullExtent");
			ArrayList<Double> restrictedExtent = new ArrayList<>();
			restrictedExtent.add(fullExtent.getDouble("xmin"));
			restrictedExtent.add(fullExtent.getDouble("ymin"));
			restrictedExtent.add(fullExtent.getDouble("xmax"));
			restrictedExtent.add(fullExtent.getDouble("ymax"));
			JSONObject spatialReference = (JSONObject) jsonObject
					.get("spatialReference");
			int wkid = spatialReference.getInt("wkid");

			response.setContentType("application/octet-stream");
			response.setHeader("Content-Disposition",
					"attachment; filename=mapConfig.json");
			response.setCharacterEncoding("UTF-8");

			StringBuilder buffer = new StringBuilder();
			buffer.append("{\"mapOpts\":{\"minZoom\":0");
			buffer.append(",\"maxZoom\":");
			buffer.append(lods.length() - 1);
			buffer.append(",\"centerPoint\":");
			buffer.append(center);
			buffer.append(",\"restrictedExtent\":");
			buffer.append(restrictedExtent);
			buffer.append(",\"projection\":\"EPSG:");
			buffer.append(wkid);
			buffer.append("\"}");

			buffer.append(",\"vectorLayer\":[{\"layerName\":\"arcgisBaseLayer"
					+ "\",\"layerType\":\"NPMapLib.Layers.ArcgisTileLayer\","
					+ "\"layerOpt\":{\"url\":\"" + url + "\",\"layerInfo\":");
			buffer.append(result);
			buffer.append("}}],");
			buffer.append(" \"sattilateLayer\": []}");

			
			ServletOutputStream out = response.getOutputStream();
			out.write(buffer.toString().getBytes("utf-8"));
			out.flush();
			

		} catch (IOException e) {
			logger.error(e);
		}
	}

	@RequestMapping(value = "mapConfig", method = RequestMethod.GET)
	public void mapConfig(String url, HttpServletResponse response)
			throws MalformedURLException {
		if (url == null || url.trim().length() == 0) {
			return;
		}
		String result = "";
		Boolean isNpgis = url.indexOf("netposa/NPGIS") > -1;
		HttpClient client = new HttpClient();
		GetMethod method = new GetMethod(url + "?f=json");
		try {
			method.getParams().setParameter(
					HttpMethodParams.HTTP_CONTENT_CHARSET, "utf-8");

			client.executeMethod(method);
			result = method.getResponseBodyAsString();
			method.releaseConnection();

			if (result.length() > 0) {
				JSONObject jsonObject = new JSONObject(result);
				if (isNpgis) {
					downNpgisConfig(response, jsonObject, url, result);
				} else {
					downLoadArcgisConfig(response, jsonObject, url, result);
				}
			}

		} catch (Exception e) {
			logger.error(e);
		}

	}

	/*
	 * 在线天地图
	 */
	@RequestMapping("TiandiOnLine")
	public String tiandiOnLine() {
		return "TiandiOnLine";
	}

	/*
	 * 在线天地图配置
	 */
	@RequestMapping("TiandiMapConfig")
	public void tiandiMapConfig(String mapCenter, String mapType,
			HttpServletResponse response) {
		if (mapCenter == null || mapCenter.trim().length() == 0) {
			return;
		}
		if (mapCenter.split(",").length != 2) {
			return;
		}
		try {
			String configPlate = "";
			switch (mapType) {
			case "tiandi":
				configPlate = this.tiandiMapConfig;
				break;
			case "google":
				configPlate = this.googleMapConfig;
				break;
			case "gaode":
				configPlate = this.gaoDeMapConfig;
				break;
			case "baidu":
				configPlate = this.baiduDeMapConfig;
				break;
			case "osm":
				configPlate = this.osmMapConfig;
				break;
			default:
				break;
			}
			if (NetposaHelper.isEmpty(configPlate)) {
				return;
			}
			response.setContentType("application/octet-stream");
			response.setHeader("Content-Disposition",
					"attachment; filename=mapConfig.json");
			response.setCharacterEncoding("UTF-8");
			String configString = configPlate.replaceAll("@mapCenter",
					mapCenter);
			ServletOutputStream out = response.getOutputStream();
			out.write(configString.getBytes("utf-8"));
			out.flush();
		} catch (IOException e) {
			logger.error(e);
		}

	}
}
