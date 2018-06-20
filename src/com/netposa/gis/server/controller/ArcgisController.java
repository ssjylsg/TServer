package com.netposa.gis.server.controller;

import com.netposa.gis.server.bean.CompactMap;
import com.netposa.gis.server.bean.Extent;
import com.netposa.gis.server.bean.LayerInfo;
import com.netposa.gis.server.bean.ServerInfo;
import com.netposa.gis.server.utils.HardWareUtils;
import com.netposa.gis.server.utils.NetposaHelper;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import net.sf.json.JSONSerializer;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.OutputStream;
import java.util.*;
 

/*
 * arcgis 服务相关
 */
@Controller
@RequestMapping("/arcgis")
public class ArcgisController extends BaseController {
	private static final Log logger = LogFactory.getLog(ArcgisController.class);
	
	// 服务器ip
	private Map<String,String> ipMap = new HashMap<>();

	@RequestMapping(value = "", method = RequestMethod.GET)
	public String index() {
		return "redirect:/map";
	}
	
	/**
	 * 获取所有ip
	 * @param request
	 * @return
	 */
	@RequestMapping("/getAllIP")
	@ResponseBody
	public String getAllIP(HttpServletRequest request,String webUrl) {
		return getAllIps(webUrl, ipMap);
	}

	/*
	 * 服务列表
	 */
	@RequestMapping(method = RequestMethod.GET, value = "/services")
	public String getServices(ModelMap modelMap, HttpServletRequest request) {
		List<CompactMap> list = NetposaHelper.getMapConfig(request
				.getServletContext().getRealPath("WEB-INF/classes/"));
		modelMap.addAttribute("message", list);
		modelMap.addAttribute("version", getVersion());
		return "services";
	}

	
	@RequestMapping("/config/{serviceName}/{ip}")
	public void downLoadConfig(@PathVariable String serviceName,@PathVariable String ip,
			HttpServletRequest request, HttpServletResponse response) {
		response.setHeader("Access-Control-Allow-Origin", "*");
		
		getServerIps(request, ipMap);
		
		String realIP = ipMap.get(ip);
		
		ServerInfo info = NetposaHelper
				.getArcgisMapConfig(serviceName, request);
		if (info == null) {
			return;
		}
		response.setContentType("application/octet-stream");
		response.setHeader("Content-Disposition",
				"attachment; filename=mapConfig.json");
		StringBuilder buffer = new StringBuilder();
		buffer.append("{\"mapOpts\":{\"minZoom\":0");
		buffer.append(",\"defaultZoom\":0");
		buffer.append(",\"maxZoom\":");
		buffer.append(info.getTileInfo().getLods().size() - 1);
		buffer.append(",\"centerPoint\":");
		buffer.append(info.getInitialExtent().getCenter());
		buffer.append(",\"restrictedExtent\":");
		buffer.append(info.getFullExtent().getExtent());
		buffer.append(",\"projection\":\"EPSG:");
		buffer.append(info.getSpatialReference().getWkid());
		buffer.append("\"}");

		String port = Integer.toString(request.getServerPort());

		String url = java.text.MessageFormat.format(
				"{0}://{1}{2}/TServer/arcgis/services/{3}/MapServer",
				request.getScheme(), realIP, "", serviceName);

		buffer.append(",\"vectorLayer\":[{\"layerName\":\"" + serviceName
				+ "\",\"layerType\":\"NPMapLib.Layers.ArcgisTileLayer\","
				+ "\"layerOpt\":{\"url\":\"" + url + "\",\"layerInfo\":");
		buffer.append(JSONSerializer.toJSON(info).toString());
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
	/*
	 * 服务详情页
	 */
	@RequestMapping(method = RequestMethod.GET, value = "services/{serviceName}/MapServer")
	public ModelAndView mapInfo(
			@PathVariable String serviceName,
			@RequestParam(value = "f", required = false, defaultValue = "") String f,
			HttpServletRequest request, HttpServletResponse response,
			String callback) throws IOException {
		
		response.setHeader("Access-Control-Allow-Origin", "*");
		response.setHeader("Access-Control-Allow-Headers", "X-Requested-With");
		
		ServerInfo info = NetposaHelper.getArcgisMapConfig(serviceName, request);
		
		boolean isCallBack = callback != null && callback.length() > 0;
		if (isCallBack || "json".equalsIgnoreCase(f)
				|| "pjson".equalsIgnoreCase(f)) {
			if (isCallBack) {
				response.getOutputStream().write(
						new String(callback + "(").getBytes());
			}
			NPJsonView.render(info, response);
			if (isCallBack) {
				response.getOutputStream().write(new String(");").getBytes());
			}
			return null;
		}
		if (info == null) {
			info = new ServerInfo();
		}
		String resolutions = "";
		for (LayerInfo layer : info.getTileInfo().getLods()) {
			resolutions += layer.getResolution() + ",";
		}
		ModelAndView modelMap = new ModelAndView("mapInfo");
		Extent extent = info.getFullExtent();
		modelMap.addObject("serviceName", serviceName);
		modelMap.addObject("center", extent.getCenter());
		modelMap.addObject("Spatial", info.getTileInfo().getSpatialReference()
				.getWkid());
		modelMap.addObject("Height", info.getTileInfo().getRows());
		modelMap.addObject("Width", info.getTileInfo().getCols());
		modelMap.addObject("Origin", info.getTileInfo().getOrigin().toString());
		modelMap.addObject("XMax", extent.getXmax());
		modelMap.addObject("XMin", extent.getXmin());
		modelMap.addObject("YMax", extent.getYmax());
		modelMap.addObject("YMin", extent.getYmin());
		int endIndex = resolutions.length() - 1;
		modelMap.addObject("resolutions",
				resolutions.subSequence(0, endIndex < 0 ? 0 : endIndex));

		String port = Integer.toString(request.getServerPort());
		
		// 获取ip并生成服务url
		JSONArray jsonArray = HardWareUtils.getAllIP();
		List<Object> urls = new ArrayList<>();
		for(int i = 0,ci = jsonArray.size();i<ci;i++){
			JSONObject item = (JSONObject) jsonArray.get(i);
			String ip = (String) item.get("value");
			
			// 缓存ip
			if(!ipMap.containsValue(ip)) {
                ipMap.put(item.get("label").toString(), ip+":"+port);
            }
			
			String url = java.text.MessageFormat.format(
					"{0}://{1}:{2}/TServer/arcgis/services/{3}/MapServer",
					request.getScheme(), ip, port, serviceName);
			
			JSONObject urlItem = new JSONObject();
			urlItem.put("url", url);
			urls.add(urlItem);
		}
		
		modelMap.addObject("Urls", urls);
		
		Locale locale = LocaleContextHolder.getLocale();
		modelMap.addObject("myLocale", locale);

		return modelMap;
	}

	/*
	 * 服务DEMO
	 */
	@RequestMapping(method = RequestMethod.GET, value = "services/{serviceName}/Map")
	public String mapDemo(ModelMap modelMap, @PathVariable String serviceName, HttpServletRequest request) {

		ServerInfo info = NetposaHelper.getArcgisMapConfig(serviceName, request);
		if (info == null) {
			info = new ServerInfo();
		}

		modelMap.addAttribute("serviceName", serviceName);
		ArrayList<Double> resolutions = new ArrayList<>();
		for (LayerInfo layer : info.getTileInfo().getLods()) {
			resolutions.add(layer.getResolution());
		}
		Extent extent = info.getFullExtent();
		modelMap.addAttribute("center", extent.getCenter());
		modelMap.addAttribute("Spatial", info.getTileInfo().getSpatialReference().getWkid());
		modelMap.addAttribute("Height", info.getTileInfo().getRows());
		modelMap.addAttribute("Width", info.getTileInfo().getCols());

		ArrayList<Double> exList = new ArrayList<>();
		exList.add(extent.getXmin());
		exList.add(extent.getYmin());
		exList.add(extent.getXmax());
		exList.add(extent.getYmax());

		modelMap.addAttribute("extent", exList);

		ArrayList<Double> origin = new ArrayList<>();
		origin.add(info.getTileInfo().getOrigin().getX());
		origin.add(info.getTileInfo().getOrigin().getY());
		modelMap.addAttribute("Origin", origin);

		modelMap.addAttribute("XMax", extent.getXmax());
		modelMap.addAttribute("XMin", extent.getXmin());
		modelMap.addAttribute("YMax", extent.getYmax());
		modelMap.addAttribute("YMin", extent.getYmin());
		modelMap.addAttribute("resolutions", resolutions);

		modelMap.addAttribute("url",
				java.text.MessageFormat.format("/TServer/arcgis/services/{0}/MapServer", serviceName));
		return "mapDemo";
	}

	/*
	 * 获取地图切片
	 */
	@ResponseBody
	@RequestMapping(method = RequestMethod.GET, value = "services/{serviceName}/MapServer/tile/{zoom}/{x}/{y}", produces = "image/png")
	// @Cacheable(value="myCache",key="#serviceName + '&' +  #x + '&' + #y + '&' + #zoom")
	public void mapServer(@PathVariable String serviceName,
			@PathVariable String zoom, @PathVariable String x,
			@PathVariable String y, OutputStream os,
			HttpServletRequest request, HttpServletResponse response) {
		response.addHeader("Content-type", "image/png");
		response.addHeader("Cache-Control", "max-age=60,must-revalidate");
		response.addHeader("ETag", new sun.misc.BASE64Encoder()
				.encode(java.text.MessageFormat.format("{0}_{1}_{2}_{3}",
						serviceName, zoom, x, y).getBytes()));

		CompactMap map = NetposaHelper.getMapConfigByMapName(serviceName);
		if (map == null) {
			response.setStatus(404);
			return;
		}

		String layerFileString = request.getServletContext().getRealPath(
				map.getMapUrl());
		
		byte[] result = NetposaHelper.getTile(serviceName, layerFileString, zoom, x, y);
		
		
		try {
			if (result != null && result.length > 0) {
				os.write(result);
			} else {
				response.setStatus(404);
				
			}
		} catch (IOException e) {
			logger.error(e);
			response.setStatus(500);
		}
	}


	
	@RequestMapping("arcgisdemo")
	public String arcgisDemo() {
		return "arcgisDemo";
	}
	@RequestMapping("arcMap")
	public String arcMap(){
		return "arcMap";
	}
}
