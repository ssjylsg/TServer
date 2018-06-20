package com.netposa.gis.server.controller;

import com.netposa.gis.server.bean.CompactMap;
import com.netposa.gis.server.bean.DataResult;
import com.netposa.gis.server.service.ManagerService;
import com.netposa.gis.server.utils.NetposaHelper;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

import java.util.List;

/**
 * Cesium 三维Controller
 */
@Controller
@RequestMapping("/Map3d")
public class CesiumController extends BaseController {
	private static final Log LOGGER = LogFactory.getLog(CesiumController.class);

	private ManagerService managerService;

	@Autowired
	public void setManagerService(ManagerService managerService) {
		this.managerService = managerService;
	}

	/**
	 * 根据smid 和 模型表名 搜索信息
	 * 
	 * @param smId
	 * @param table
	 * @return
	 */
	@RequestMapping("/getModelBySmid")
	@ResponseBody
	public DataResult getModelBySmid(String smId, String table) {

		DataResult result = new DataResult();

		if (NetposaHelper.isEmpty(smId) || NetposaHelper.isEmpty(table)) {
			return result;
		}
		if (table.indexOf("_model") == -1) {
			table += "_model";
		}
		try {
			result.setData(this.managerService.getModelBySmid(smId, table));
		} catch (Exception e) {
			result.setError(e.getMessage());
			LOGGER.error(e);
		}
		return result;
	}

	@RequestMapping("/getModelByMid")
	@ResponseBody
	public DataResult getModelByMid(String mId, String table) {

		DataResult result = new DataResult();

		if (NetposaHelper.isEmpty(mId) || NetposaHelper.isEmpty(table)) {
			return result;
		}
		if (table.indexOf("_model") == -1) {
			table += "_model";
		}
		try {
			result.setData(this.managerService.getModelByMid(mId, table));
		} catch (Exception e) {
			result.setError(e.getMessage());
			LOGGER.error(e);
		}
		return result;
	}

	/**
	 * 配置
	 * 
	 * @param serviceName
	 *            服务名称
	 * @param ip
	 *            机器IP
	 * @return
	 */
	@RequestMapping(method = RequestMethod.GET, value = "config/{serviceName}/{ip}")
	public ModelAndView Map3dConfig(@PathVariable String serviceName,
			@PathVariable String ip) {
		ModelAndView view = new ModelAndView("NPMap3dConfig");
		view.addObject("serviceName", serviceName + "_model");
		view.addObject("modelRequest", this.getRealIp(ip)
				+ "/netposa/Map3d/getModelBySmid?table=" + serviceName
				+ "_model" + "&smId=");
		return view;
	}

	/**
	 * 三维DEMO
	 * 
	 * @param
	 * @return
	 */
	@RequestMapping(method = RequestMethod.GET, value = "services")
	public ModelAndView allMap3dDemos() {
		ModelAndView view = new ModelAndView("allMap3d");
		List<CompactMap> list = NetposaHelper.getMapConfig();
		com.alibaba.fastjson.JSONArray jsonArray = new com.alibaba.fastjson.JSONArray();
		for (int i = 0; i < list.size(); i++) {
			if (list.get(i).getMapType().equals("model")) {
				jsonArray.add(list.get(i));
			}
		}
		view.addObject("models", jsonArray);
		return view;
	}

	@ResponseBody
	@RequestMapping(value = "findByName")
	public DataResult findByName(
			@RequestParam(value = "name", required = true, defaultValue = "") String name,
			String table) {
		DataResult result = new DataResult();
		try {
			if (NetposaHelper.isEmpty(name) || NetposaHelper.isEmpty(table)) {
				return result;
			}
			if (table.indexOf("_model") == -1) {
				table += "_model";
			}
			result.setData(this.managerService.getModelByName(name, table));
		} catch (Exception e) {
			result.setError(e.getMessage());
		}
		return result;
	}

	/**
	 * 三维DEMO
	 * 
	 * @param serviceName
	 * @return
	 */
	@RequestMapping(method = RequestMethod.GET, value = "services/{serviceName}/Map3d")
	public ModelAndView Map3dDemo(@PathVariable String serviceName) {
		ModelAndView view = new ModelAndView("Npgis3D");
		CompactMap map = NetposaHelper.getMapConfigByMapName(serviceName);
		if (map != null) {
			view.addObject("serviceName", serviceName);
			view.addObject("modelUrl", map.getMapUrl());
			String table = map.getTable();
			if (table != null && table.equals("y")) {
				view.addObject("modelRequest",
						"/netposa/Map3d/getModelBySmid?table=" + serviceName
								+ "_model" + "&smId=");
			}
		}
		return view;
	}

}
