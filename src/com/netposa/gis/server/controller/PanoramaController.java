package com.netposa.gis.server.controller;

import com.netposa.gis.server.bean.DataResult;
import com.netposa.gis.server.service.PanoramaService;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletResponse;
import java.util.Locale;
import java.util.UUID;

/**
 * 全景 Controller
 * 
 * @author wj
 * 
 */
@Controller
@RequestMapping(value = "/panorama")
public class PanoramaController {

	private PanoramaService panoramaService;

	@Autowired
	public void setPanoramaService(PanoramaService panoramaService) {
		this.panoramaService = panoramaService;
	}

	@RequestMapping(value = "/outdoorPanoUpload", method = RequestMethod.GET)
	public ModelAndView outdoorPanoUpload() {

		ModelAndView modelAndView = new ModelAndView("outdoorPanoUpload");

		Locale locale = LocaleContextHolder.getLocale();

		modelAndView.addObject("myLocale", locale);

		return modelAndView;
	}

	/**
	 * 编号查询室外配置信息
	 * 
	 * @param pid    编号
	 * @return
	 */
	@ResponseBody
	@RequestMapping("/getConfigById")
	public JSONObject getOutdoorConfigById(
			@RequestParam(value = "pid", required = true, defaultValue = "") String pid) {
		return panoramaService.getOutdoorConfigById(pid);
	}

	/**
	 * 点位查询离查询点位最近的室外配置信息
	 * 
	 * @param position  点位置 WKT
	 * @return
	 */
	@ResponseBody
	@RequestMapping("/getConfigByPosition")
	public JSONObject getOutdoorConfigByPosition(
			@RequestParam(value = "position", required = true, defaultValue = "") String position) {
		return panoramaService.getOutdoorConfigByPosition(position);
	}

	/**
	 * 点位查询室外配置信息
	 * 
	 * @param position 点位置 WKT
	 * @param distance  缓冲距离，单位米，默认100米
	 * @return
	 */
	@ResponseBody
	@RequestMapping("/getConfigsByPosition")
	public JSONArray listOutdoorConfigByPosition(
			@RequestParam(value = "position", required = true, defaultValue = "") String position,
			@RequestParam(value = "distance", required = true, defaultValue = "100") String distance) {
		return panoramaService.listOutdoorConfigByPosition(position, distance);
	}

	/**
	 * 几何对象查询室外配置信息
	 * 
	 * @param geo 几何对象
	 * @return
	 */
	@ResponseBody
	@RequestMapping("/getConfigsByGeo")
	public JSONArray listOutdoorConfigByGeo(
			@RequestParam(value = "geo", required = true, defaultValue = "") String geo) {
		return panoramaService.listOutdoorConfigByGeo(geo);
	}

	/**
	 * 获取室外全景所有信息
	 * 
	 * @return
	 */
	@ResponseBody
	@RequestMapping("/getAllConfigs")
	public JSONArray listOutdoorConfig() {
		return panoramaService.listOutdoorConfig();
	}

	/**
	 * 获取室内全景所有点位信息
	 * 
	 * @return
	 */
	@ResponseBody
	@RequestMapping("/getAllSnPoints")
	public JSONArray listIndoorPoint() {
		return panoramaService.listIndoorPoint();
	}

	/**
	 * id 查询室内全景点位数据
	 * 
	 * @param id
	 *            点位唯一编号
	 * @return
	 */
	@ResponseBody
	@RequestMapping("/getSnPointById")
	public JSONObject getIndorrPointById(
			@RequestParam(value = "id", required = true, defaultValue = "") String id,
			HttpServletResponse response) {
		return panoramaService.getIndorrPointById(id);
	}

	/**
	 * parentid 查询室内全景配置信息
	 * 
	 * @param parentid
	 * @return
	 */
	@ResponseBody
	@RequestMapping("/getSnConfigsByParentId")
	public JSONArray listIndoorConfigByParentId(
			@RequestParam(value = "parentid", required = true, defaultValue = "") String parentid,
			HttpServletResponse response) {
		return panoramaService.listIndoorConfigByParentId(parentid);
	}

	/**
	 * panoid 查询室内全景配置信息
	 * 
	 * @param panoid
	 *            唯一编号
	 * @return
	 */
	@ResponseBody
	@RequestMapping("/getSnConfigsByPanoId")
	public JSONArray listIndoorConfigByPanoId(
			@RequestParam(value = "panoid", required = true, defaultValue = "") String panoid,
			HttpServletResponse response) {
		return panoramaService.listIndoorConfigByPanoId(panoid);
	}

	/**
	 * 室外全景图片上传并插入配置信息到数据表
	 * 
	 * @param files
	 *            全景图片
	 * @param realName
	 *            场景名称
	 * @param x
	 *            场景位置经度
	 * @param y
	 *            场景位置纬度
	 * @param basemap
	 *            地图服务 mapConfig 请求地址,""的情况下使用默认的resources/js/mapConfig.json，
	 *            如果在界面选择了地图则请求netposa
	 *            /arcgis/config/shanghaiBaseMap接口获取相应的mapConfig.json。
	 *            目的是上传成功后在校正部分使用和上传界面相同的地图。
	 * @return
	 */
	@RequestMapping(value = "/outdoorUpload", method = RequestMethod.POST)
	public ModelAndView outdoorUpload(
			@RequestParam("files") MultipartFile[] files,
			@RequestParam(value = "realname", required = true, defaultValue = "") String realName,
			@RequestParam(value = "x", required = true, defaultValue = "") String x,
			@RequestParam(value = "y", required = true, defaultValue = "") String y,
			@RequestParam(value = "basemap", required = true, defaultValue = "") String basemap) {
		ModelAndView modelAndView = new ModelAndView("outdoorPano");

		String panoid = UUID.randomUUID().toString();

		DataResult result = panoramaService.saveOutdoorData(files, panoid,
				realName, x, y);

		Locale locale = LocaleContextHolder.getLocale();

		modelAndView.addObject("successful", result.getIsSucess());
		if(!result.getIsSucess()){
			modelAndView.addObject("error", result.getError());
		}
		modelAndView.addObject("panoid", panoid);
		modelAndView.addObject("myLocale", locale);
		modelAndView.addObject("basemap", basemap);

		return modelAndView;
	}

	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/outdoorUploadJSON", method = RequestMethod.POST)
	@ResponseBody
	public DataResult outdoorUploadJSON(
			@RequestParam("files") MultipartFile[] files,
			@RequestParam(value = "realname", required = true, defaultValue = "") String realName,
			@RequestParam(value = "x", required = true, defaultValue = "") String x,
			@RequestParam(value = "y", required = true, defaultValue = "") String y) {

		String panoid = UUID.randomUUID().toString();

		DataResult modelAndView = panoramaService.saveOutdoorData(files, panoid,
				realName, x, y);

		 
		JSONObject obj = new JSONObject();
		obj.put("panoid", panoid);
		obj.put("x", x);
		obj.put("y", y);
		obj.put("realname", realName);

		 
		modelAndView.setData(obj);
		return modelAndView;
	}

	/**
	 * 修改室外全景数据
	 * 
	 * @param panoid
	 *            室外全景唯一编号
	 * @param name
	 *            全景名称
	 * @param northdir
	 *            正北夹角
	 * @return
	 */
	@SuppressWarnings({ "all" })
	@ResponseBody
	@RequestMapping(value = "/updateOutdoorData", method = RequestMethod.POST)
	public JSONObject updateOutdoorData(
			@RequestParam(value = "panoid", required = true, defaultValue = "") String panoid,
			@RequestParam(value = "name", required = true, defaultValue = "") String name,
			@RequestParam(value = "northdir", required = true, defaultValue = "") String northdir) {
		JSONObject result = new JSONObject();

		result.put("successful",
				panoramaService.updateOutdoorData(panoid, name, northdir));

		return result;
	}

	/**
	 * 删除室外全景数据
	 * 
	 * @param panoid
	 *            室外全景唯一编号
	 * @return
	 */
	@ResponseBody
	@RequestMapping(value = "/deleteOutdoorData")
	public DataResult deleteOutdoorData(
			@RequestParam(value = "panoid", required = true, defaultValue = "") String panoid) {
		return this.panoramaService.deleteOutdoorData(panoid);
	}

	/**
	 * 新增室内全景点位信息
	 * 
	 * @param name
	 *            场景名称
	 * @param x
	 *            经度
	 * @param y
	 *            纬度
	 * @return
	 */
	@ResponseBody
	@RequestMapping("/insertIndoorPointData")
	public DataResult insertIndoorPointData(
			@RequestParam(value = "name", required = true, defaultValue = "") String name,
			@RequestParam(value = "x", required = true, defaultValue = "") String x,
			@RequestParam(value = "y", required = true, defaultValue = "") String y) {
		return panoramaService.insertIndoorPointData(name, x, y);
	}

	/**
	 * 新增室内全景配置信息
	 * 
	 * @param parentid
	 *            点位表信息唯一编号
	 * @param name
	 *            场景名称
	 * @param floor
	 *            楼层
	 * @param isstart
	 * @param northdir
	 * @param heading
	 * @param roll
	 * @param pitch
	 * @param type
	 * @return
	 */
	@ResponseBody
	@RequestMapping("/insertIndoorConfigData")
	public DataResult insertIndoorConfigData(
			@RequestParam(value = "parentid", required = true, defaultValue = "") String parentid,
			@RequestParam(value = "name", required = true, defaultValue = "") String name,
			@RequestParam(value = "floor", required = true, defaultValue = "1") String floor,
			@RequestParam(value = "isstart", required = true, defaultValue = "1") String isstart,
			@RequestParam(value = "northdir", required = true, defaultValue = "0") String northdir,
			@RequestParam(value = "heading", required = true, defaultValue = "90") String heading,
			@RequestParam(value = "roll", required = true, defaultValue = "0") String roll,
			@RequestParam(value = "pitch", required = true, defaultValue = "0") String pitch,
			@RequestParam(value = "type", required = true, defaultValue = "panorama") String type) {
		return panoramaService.insertIndoorConfigData(parentid, name, floor,
				isstart, northdir, heading, roll, pitch, type);
	}

	/**
	 * 上传室内全景图片
	 * 
	 * @param files
	 *            上传图片的MultipartFile对象实例
	 * @param panoid
	 *            全景编号
	 * @return
	 */
	@ResponseBody
	@RequestMapping(value = "/indoorImageUpload", method = RequestMethod.POST)
	public DataResult indoorImageUpload(
			@RequestParam("files") MultipartFile[] files,
			@RequestParam(value = "panoid", required = true, defaultValue = "") String panoid) {
		return this.panoramaService.indoorImageUpload(files, panoid);
	}

	/**
	 * 删除室内全景数据(删除点位表、配置表及图片)
	 * 
	 * @param positionid
	 *            室内全景点位唯一编号
	 * @return
	 */
	@ResponseBody
	@RequestMapping(value = "/deleteIndoorData")
	public DataResult deleteIndoorData(
			@RequestParam(value = "positionid", required = true, defaultValue = "") String positionid) {
		return this.panoramaService.deleteIndoorData(positionid);
	}

	/**
	 * 删除室内全景配置数据(删除配置表及图片)
	 * 
	 * @param panoid
	 *            全景编号
	 * @return
	 */
	@ResponseBody
	@RequestMapping(value = "/deleteIndoorConfigData")
	public DataResult deleteIndoorConfigData(
			@RequestParam(value = "panoid", required = true, defaultValue = "") String panoid) {
		return this.panoramaService.deleteIndoorConfigData(panoid);
	}
}
