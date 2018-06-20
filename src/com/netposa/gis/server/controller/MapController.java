package com.netposa.gis.server.controller;

import com.netposa.gis.server.bean.CompactMap;
import com.netposa.gis.server.utils.HardWareUtils;
import com.netposa.gis.server.utils.NetposaHelper;
import net.sf.json.JSONObject;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.simple.JSONArray;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Properties;

@Controller
@RequestMapping("/map")
public class MapController {
	
	private static final Log LOGGER = LogFactory.getLog(MapController.class);
	
	@RequestMapping(value = "", method = RequestMethod.GET)
	public String index(ModelMap modelMap) {
		modelMap.addAttribute("message", "map/services");
		return "hello";
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

	private String getVersion() {
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

	@SuppressWarnings("unchecked")
	@ResponseBody
	@RequestMapping(method = RequestMethod.GET, value = "/maplist")
	public JSONArray getMapList(HttpServletRequest request) {
		List<CompactMap> list = NetposaHelper.getMapConfig(request
				.getServletContext().getRealPath("WEB-INF/classes/"));
		JSONArray array = new JSONArray();
		for (int i = 0; i < list.size(); i++) {
			CompactMap map = list.get(i);

			String port = Integer.toString(request.getServerPort());
			String url;
			// 获取ip并生成服务url
			net.sf.json.JSONArray jsonArray = HardWareUtils.getAllIP();
			for(int j = 0,cj = jsonArray.size();j<cj;j++){
				JSONObject object = new JSONObject();
				object.put("name", map.getTitle() + "_" + map.getName());
				
				JSONObject item = (JSONObject) jsonArray.get(j);
				String ip = (String) item.get("value");
				String label = (String) item.get("label");
				//NetposaHelper.getRemoteIp()
				if ("arcgis".equalsIgnoreCase(map.getMapType())) {
					url = java.text.MessageFormat.format(
							"{0}://{1}:{2}/TServer/arcgis/config/{3}",
							request.getScheme(), ip, port,
							map.getName());
					object.put("mapType", "arcgis");
				} else {
					url = java.text.MessageFormat.format(
							"{0}://{1}:{2}/TServer/NPGIS/config/{3}",
							request.getScheme(), ip, port,
							map.getName());
					object.put("mapType", "npgis");
				}
				object.put("url", url);
				object.put("label", label);
				array.add(object);
				
			}

		}
		return array;
	}
}
