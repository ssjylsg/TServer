package com.netposa.gis.server.controller;

import com.netposa.gis.server.utils.HardWareUtils;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;


public abstract class BaseController {
	private Map<String, String> ipMap = new HashMap<>();
	private static final Log LOGGER = LogFactory.getLog(BaseController.class);
	@RequestMapping(value = "", method = RequestMethod.GET)
	public String index() {
		return "redirect:/map";
	}

	@RequestMapping
	public ModelAndView errorPage(String errorMsg) {
		return new ModelAndView("error").addObject("errorMsg", errorMsg);
	}

	protected String getRealIp(String ip) {
		if (ipMap.isEmpty()) {
			JSONArray jsonArray = HardWareUtils.getAllIP();

			for (int i = 0, ci = jsonArray.size(); i < ci; i++) {
				JSONObject item = (JSONObject) jsonArray.get(i);
				String value = (String) item.get("value");

				// 缓存ip
				ipMap.put(item.get("label").toString(), value);
			}
		}

		return ipMap.get(ip);
	}

	/**
	 * 获取当前request
	 * 
	 * @return
	 */
	 
	private HttpServletRequest getRequest() {
		
		return ((ServletRequestAttributes) RequestContextHolder
				.getRequestAttributes()).getRequest();
	}
	protected String getAllIps(String webUrl, Map<String, String> ipMap) {
		String result = "";
		JSONArray jsonArray = new JSONArray();
		if(webUrl == null){
			webUrl = "";
		}
		if (!ipMap.isEmpty()) {
			boolean isContainsWebUrl = webUrl.indexOf("localhost") != -1;
			for (Map.Entry<String, String> entry : ipMap.entrySet()) {
				if(!isContainsWebUrl){
					isContainsWebUrl = entry.getValue().equalsIgnoreCase(webUrl);
				}
				
				JSONObject item = new JSONObject();
				item.put("label", entry.getKey());
				item.put("value", entry.getValue());
				jsonArray.add(item);
			}
			if(!isContainsWebUrl && webUrl != null && webUrl.length() != 0){
				JSONObject local = new JSONObject();
				local.put("label","webUrl");
				local.put("value",webUrl);
				jsonArray.add(local);
				ipMap.put("webUrl",webUrl);
			}
		}
		
		if (!jsonArray.isEmpty()) {
			result = jsonArray.toString();
		}
		return result;
	}
	
	 void getServerIps(HttpServletRequest request, Map<String, String> ipMap) {
		if (ipMap.isEmpty()) {
			JSONArray jsonArray = HardWareUtils.getAllIP();
			int port = request.getServerPort();
			for (int i = 0, ci = jsonArray.size(); i < ci; i++) {
				JSONObject item = (JSONObject) jsonArray.get(i);
				String value = (String) item.get("value") + ":"+port;
				
				// 缓存ip
				ipMap.put(item.get("label").toString(), value);
			}
		}
	}
	String getVersion() {
		Properties config = new Properties();
		InputStream in = ArcgisController.class.getClassLoader()
				.getResourceAsStream("config.properties");
		try {
			config.load(in);
			in.close();
		} catch (IOException e) {
			LOGGER.error(e);
		}
		return config.getProperty("version");
	}
}
