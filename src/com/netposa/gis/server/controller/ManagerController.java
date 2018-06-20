package com.netposa.gis.server.controller;

import com.netposa.gis.server.bean.ConfigBean;
import com.netposa.gis.server.bean.DataResult;
import com.netposa.gis.server.service.ManagerService;
import com.netposa.gis.server.utils.NetposaHelper;
import com.netposa.gis.server.utils.SpringUtil;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.File;
import java.io.IOException;
import java.sql.SQLException;
import java.util.Locale;
import java.util.concurrent.ExecutionException;

@Controller
@RequestMapping("/admin")
@SessionAttributes()
public class ManagerController {
	private static final Log LOGGER = LogFactory
			.getLog(ManagerController.class);
	private static final String USERNAME = "USERNAME";

	private ManagerService managerService;

	@Autowired
	public void setManagerService(ManagerService managerService) {
		this.managerService = managerService;
	}

	@RequestMapping()
	public String index(HttpSession httpSession) {
		if (httpSession.getAttribute(USERNAME) != null) {
			return "redirect:/admin/config";
		}
		return "admin/index";
	}

	@SuppressWarnings("deprecation")
	@RequestMapping(value = "/add", method = RequestMethod.POST)
	public void admin(String username, String password,
			HttpServletResponse response, HttpSession httpSession)
			throws IOException {
		if ("admin".equalsIgnoreCase(username)
				&& "netposa".equalsIgnoreCase(password)) {
			httpSession.putValue(USERNAME, username + password);
			response.sendRedirect("config");
			return;
		}
		response.sendRedirect("");
	}

	@RequestMapping("/config")
	public ModelAndView config(ModelAndView modelMap) {
		ConfigBean configBean = this.managerService.loadConfig();		
		Locale locale = LocaleContextHolder.getLocale();
		modelMap.addObject("myLocale", locale);
		modelMap.addObject("config", configBean);
		modelMap.setViewName("admin/config");
		return modelMap;
	}

	@ResponseBody
	@RequestMapping("/testDb")
	public DataResult testDb(String userName, String host, String password,
			String database, String port, String queryParameters) {
		DataResult result = new DataResult();
		if (NetposaHelper.isEmpty(userName) || NetposaHelper.isEmpty(host)
				|| NetposaHelper.isEmpty(password)
				|| NetposaHelper.isEmpty(database)
				|| NetposaHelper.isEmpty(port)) {
			result.setError(SpringUtil.getMessage("manager.csbwz",
					managerService.getCustomLocale("")));
			return result;
		}
		try {
			boolean testResult = this.managerService.testDbConnecton(userName,
					host, password, database, port, queryParameters);

			if (testResult) {
				result.setData(testResult);
			} else {
				result.setError("error");
			}
		} catch (Exception e) {
			result.setError(e.getMessage());
			LOGGER.error(e);
		}
		return result;
	}

	/**
	 * 获取所有mapTitle文件夹下的地图切片名称
	 * 
	 * @return
	 */
	@RequestMapping("/getMapTitles")
	@ResponseBody
	public String listMapTitle(HttpServletRequest request) {
		String path = new StringBuilder(request.getSession()
				.getServletContext().getRealPath("")).append(File.separator)
				.append("mapTitle").toString();
		return this.managerService.listMapTitle(path);
	}

	@RequestMapping(value = "/removeServiceConfig", method = RequestMethod.POST)
	@ResponseBody
	public DataResult removeServiceConfig(String name, String mapType) {
		return this.managerService.removeServiceConfig(name, mapType);
	}

	@RequestMapping(value = "/mapConfigAdd", method = RequestMethod.POST)
	@ResponseBody
	public DataResult addMapConfig(String name, String title, String titleUrl,
			String mapType, HttpServletRequest request) {

		String confPath = request.getSession().getServletContext()
				.getRealPath("")
				+ File.separator
				+ titleUrl
				+ File.separator
				+ "Layers"
				+ File.separator + "Conf.xml";
		return this.managerService.addMapConfig(name, title, titleUrl, mapType,
				confPath);
	}

	@RequestMapping(value = "/addModelConfig", method = RequestMethod.POST)
	@ResponseBody
	public DataResult addModelConfig(String name, String title,
			String titleUrl, String mapType, String table) {
		return this.managerService.addModelConfig(name, title, titleUrl,
				mapType, table);
	}

	@RequestMapping(value = "/config", method = RequestMethod.POST)
	public String updateConfig(ConfigBean config, String queryParmeterData,
			String type, RedirectAttributes redirectAttributes) {
		String msg = SpringUtil.getMessage("manager.tjcg",
				this.managerService.getCustomLocale(""));
		if ("db".equalsIgnoreCase(type)) {
			msg = SpringUtil.getMessage("manager.sjktjcg",
					this.managerService.getCustomLocale(""));
		}
		try {
			com.alibaba.fastjson.JSONArray reqParam = com.alibaba.fastjson.JSONArray
					.parseArray(queryParmeterData);
			this.managerService.updateQueryParameters(reqParam, config, type);
		} catch (Exception e) {
			msg = SpringUtil.getMessage("manager.tjsb",
					this.managerService.getCustomLocale(""));
			if ("db".equalsIgnoreCase(type)) {
				msg = SpringUtil.getMessage("manager.sjktjsb",
						this.managerService.getCustomLocale(""));
			}
			LOGGER.error(e);
		}
		redirectAttributes.addFlashAttribute("subMessage", msg);
		return "redirect:config";
	}

	/**
	 * 获取所有的数据表名称
	 * 
	 * @return
	 */
	@RequestMapping("/getAllTables")
	@ResponseBody
	public String listTable() {
		return this.managerService.listDbTable();
	}

	/**
	 * 获取上传流执行copy导入数据
	 * 
	 * @return
	 */
	@RequestMapping("/dataStorage")
	public Object dataStorage(@RequestParam("files") MultipartFile[] files,
			HttpServletRequest request) {
		DataResult result = new DataResult();

		MultipartFile file = files[0];
		String msg = "";
		try {
			msg = this.managerService.dataStorage(file);
		} catch (IOException | SQLException | InterruptedException
				| ExecutionException e) {
			msg = e.getMessage();
			LOGGER.error(e);
		}
		result.setData(msg);

		return result;
	}

	/**
	 * 获取上传流执行copy导入数据，主要解决室外全景数据追加
	 * 
	 * @param files
	 *            追加数据的表
	 * @param request
	 * @return
	 */
	@RequestMapping(value = "/dataAppend")
	@ResponseBody
	public DataResult dataAppend(@RequestParam("files") MultipartFile[] files,
			HttpServletRequest request) {
		DataResult result = new DataResult();
		String msg = "";

		MultipartFile file = files[0];

		// 追加数据表名称
		String table = request.getParameter("table");

		try {
			msg = this.managerService.dataAppend(table, file);
		} catch (IOException | SQLException | InterruptedException
				| ExecutionException e) {
			msg = e.getMessage();
			LOGGER.error(e);
		}
		result.setData(msg);

		return result;
	}

	/**
	 * 导入数据状态
	 * 
	 * @param tableName
	 * @return
	 */
	@RequestMapping("/getCopyMsg")
	@ResponseBody
	public com.alibaba.fastjson.JSONObject getCopyMsg(String tableName) {
		return this.managerService.getCopyMsg(tableName);
	}

	/**
	 * 验证数据表是否配置
	 * 
	 * @param key
	 *            需要验证的数据表key，默认roadNet。roadNet 路网、RoadCross 路口、poi 兴趣点、road
	 *            道路、panoconfig 室外全景、snpanopoint 室内全景点位、snpanoconfig 室内全景配置
	 * @return
	 */
	@RequestMapping("/verifyTableConfigured")
	@ResponseBody
	public String verifyTableConfigured(
			@RequestParam(value = "key", required = true, defaultValue = "roadNet") String key) {
		return this.managerService.verifyTableConfigured(key);
	}

	// /// 模型服务

	@RequestMapping("/listModelData")
	@ResponseBody
	public String listModelData() {
		return this.managerService.listModelData();
	}	

}
