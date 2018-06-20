package com.netposa.gis.server.controller;

import com.netposa.gis.server.bean.DataResult;
import com.netposa.gis.server.bean.PageQuery;
import com.netposa.gis.server.bean.QueryParameterCollection;
import com.netposa.gis.server.bean.TableKeyEnum;
import com.netposa.gis.server.service.QueryService;
import com.netposa.gis.server.utils.NetposaHelper;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.geotools.filter.text.cql2.CQLException;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.SQLException;
import java.util.Locale;

@RequestMapping(value = "/query")
@Controller
public class QueryController {
	private static final Log LOGGER = LogFactory.getLog(QueryController.class);

	private QueryService service;

	@Autowired
	public void setQueryService(QueryService service) {
		this.service = service;
	}
	
	@RequestMapping("")
	public String index() {
		return "queryService";
	}
	
	/**
	 * 道路和多边形的交点
	 * @param wkt 多边形
	 * @return
	 */
    @ResponseBody
    @RequestMapping("/roadInterByGeo")
    public DataResult roadInterByGeo(String wkt) {
        return this.service.roadInterByGeo(wkt);
    }
	
	/**
	 * POI查询服务，根据名称查询符合关键字的兴趣点信息
	 * @param name 查询关键字
	 * @param layerName 查询表名称
	 * @param maxResultString 最大结果条数
	 * @param rowIndexString 起始条数
	 * @param type 主查询字段，默认name,可以指定其它字段
	 * @param queryPlan 查询计划：normal 普通、fts 全文检索，默认normal
	 * @param poiType POI 类型
	 * @param response
	 * @return
	 */
    @ResponseBody
    @RequestMapping("/poiname")
    public JSONObject poiByName(@RequestParam(value = "keyWord", required = true, defaultValue = "") String name,
            @RequestParam(value = "layerName", required = true, defaultValue = "menpaihao") String layerName,
            @RequestParam(value = "maxResult", required = true, defaultValue = "10") String maxResultString,
            @RequestParam(value = "rowIndex", required = true, defaultValue = "1") String rowIndexString,
            @RequestParam(value = "type", required = true, defaultValue = "name") String type,
            @RequestParam(value = "queryPlan", required = true, defaultValue = "normal") String queryPlan,
            @RequestParam(value = "poiType", required = true, defaultValue = "") String poiType,// 按照类型查询
            HttpServletResponse response) {
        JSONObject result = new JSONObject();
        response.setHeader("Access-Control-Allow-Origin", "*");

        String poiLayerName = QueryParameterCollection.getInstance().getTableNameByKey(TableKeyEnum.POI);
        if (NetposaHelper.isEmpty(poiLayerName)) {
            LOGGER.error("没有配置兴趣点表");
            return result;
        }

        int maxResult = Integer.parseInt(maxResultString);
        int rowIndex = Integer.parseInt(rowIndexString);

        try {
            result = service.queryPOIByName(poiLayerName, name, maxResult, rowIndex, type, poiType, queryPlan);
        } catch (CQLException | IOException | SQLException e) {
            response.setStatus(500);
            LOGGER.error(e);
        }
        return result;
    }

	/**
	 * 地址查詢poi
	 * @param keyWord 查询关键字
	 * @param maxResult 查询计划：normal 普通、fts 全文检索，默认normal
	 * @param response
	 * @return
	 */
    @ResponseBody
    @RequestMapping("/poiaddr")
    public JSONObject poiByAddr(@RequestParam(value = "keyWord", required = true, defaultValue = "") String keyWord,
            @RequestParam(value = "maxResult", required = true, defaultValue = "10") String maxResult,
            HttpServletResponse response) {
        response.setHeader("Access-Control-Allow-Origin", "*");

        JSONObject result = new JSONObject();

        String poiLayerName = QueryParameterCollection.getInstance().getTableNameByKey(TableKeyEnum.POI);
        if (NetposaHelper.isEmpty(poiLayerName)) {
            LOGGER.error("没有配置兴趣点表");
            return result;
        }
        return service.queryPOIByAddr(poiLayerName, keyWord, Integer.parseInt(maxResult));
    }

	/*
	 * POI查询服务，根据名称查询符合关键字的兴趣点信息
	 */
    @ResponseBody
    @RequestMapping("/poicoord")
    public JSONObject poiByCoord(@RequestParam(value = "coord", required = true, defaultValue = "") String coordString,
            @RequestParam(value = "layerName", required = true, defaultValue = "menpaihao") String layerName,
            HttpServletResponse response) {
        response.setHeader("Access-Control-Allow-Origin", "*");
        JSONObject result = new JSONObject();

        String poiLayerName = QueryParameterCollection.getInstance().getTableNameByKey(TableKeyEnum.POI);
        if (NetposaHelper.isEmpty(poiLayerName)) {
            LOGGER.error("没有配置兴趣点表");
            return result;
        }
        
        String roadCross = QueryParameterCollection.getInstance().getTableNameByKey(TableKeyEnum.ROADCROSS);
        if (NetposaHelper.isEmpty(roadCross)) {
            LOGGER.error("没有配置路口表");
            return result;
        }

        try {
            result = service.queryPOIByCoord(coordString, poiLayerName,roadCross);
        } catch (Exception e) {
            LOGGER.error(e);             
            response.setStatus(500);
        }
        return result;
    }

	/*
	 * 查询到点到最短的线段
	 */
    @ResponseBody
    @RequestMapping("/findpointline")
    public JSONObject findPointLine(@RequestParam(value = "coord", required = true, defaultValue = "") String coord,
            HttpServletResponse response) {
        response.setHeader("Access-Control-Allow-Origin", "*");
        JSONObject result = new JSONObject();

        String layerName = QueryParameterCollection.getInstance().getTableNameByKey(TableKeyEnum.POI);
        if (NetposaHelper.isEmpty(layerName)) {
            LOGGER.error("没有配置道路表");
            return result;
        }
        try {
            result = service.findPointLine(coord, layerName);
        } catch (Exception e) {
            response.setStatus(500);
            LOGGER.error(e);
        }
        return result;
    }

    @ResponseBody
    @RequestMapping("/getRoadsByName")
    public JSONArray getRoadsByName(
            @RequestParam(value = "roadName", required = true, defaultValue = "") String roadName,
            HttpServletResponse response) {
        JSONArray results = new JSONArray();
        response.setHeader("Access-Control-Allow-Origin", "*");

        String layerName = QueryParameterCollection.getInstance().getTableNameByKey(TableKeyEnum.ROAD);
        if (NetposaHelper.isEmpty(layerName)) {
            LOGGER.error("没有配置道路表");
            return results;
        }

        if (roadName.length() == 0) {
            return results;
        }

        try {
            results = service.getRoadsByName(roadName, layerName);
        } catch (Exception e) {
            response.setStatus(500);
            LOGGER.error(e);
        }
        return results;
    }

	@RequestMapping("/querydemo")
	public String queryDemo() {
		return "queryDemo";
	}

    @ResponseBody
    @RequestMapping("/getRoadCrossByName")
    public JSONArray getRoadCrossByName(
            @RequestParam(value = "roadName", required = true, defaultValue = "") String roadName,
            HttpServletResponse response) {
        response.setHeader("Access-Control-Allow-Origin", "*");
        JSONArray results = new JSONArray();

        String layerName = QueryParameterCollection.getInstance().getTableNameByKey(TableKeyEnum.ROADCROSS);
        if (NetposaHelper.isEmpty(layerName)) {
            LOGGER.error("没有配置路口表");
            return results;
        }
        
        try {
            results = service.getRoadCrossByName(roadName, layerName);
        } catch (Exception e) {
            response.setStatus(500);
            LOGGER.error(e);
        }
        return results;
    }

	/**
	 * 范围查询POI
	 * @param wkt 几何
	 * @param key 
	 * @param maxResult
	 * @param rowIndex
	 * @param type 主查询字段，默认name
	 * @param queryPlan 查询计划：normal 普通、fts 全文检索，默认normal
	 * @param poiType POI 类型
	 * @param response
	 * @return
	 */
    @RequestMapping("/searchInBounds")
    @ResponseBody
    public DataResult searchInBounds(String wkt, String key,
            @RequestParam(value = "maxResult", required = true, defaultValue = "10") String maxResult,
            @RequestParam(value = "rowIndex", required = true, defaultValue = "1") String rowIndex,
            @RequestParam(value = "type", required = true, defaultValue = "name") String type,
            @RequestParam(value = "queryPlan", required = true, defaultValue = "normal") String queryPlan,
            @RequestParam(value = "poiType", required = true, defaultValue = "") String poiType,// 按照类型查询
            HttpServletResponse response) {
        response.setHeader("Access-Control-Allow-Origin", "*");
        DataResult result = new DataResult();

        String layerName = QueryParameterCollection.getInstance().getTableNameByKey(TableKeyEnum.POI);
        if (NetposaHelper.isEmpty(layerName)) {
            LOGGER.error("没有配置兴趣点表");
            result.setError("没有配置兴趣点表");
            result.setIsSucess(false);
            return result;
        }

        if (NetposaHelper.isEmpty(wkt)) {
            return result;
        }

        try {
            PageQuery<JSONArray> page = new PageQuery<>();
            page.setMaxResult(Integer.parseInt(maxResult));
            page.setPageIndex(Integer.parseInt(rowIndex));

            this.service.searchInBounds(wkt, key, layerName, type, poiType, queryPlan, page);
            result.setData(page.getQueryResult());

        } catch (Exception e) {
            LOGGER.error(e);
            result.setError(e.getMessage());
        }
        return result;
    }

    @RequestMapping("/searchRoadCrossInBounds")
    @ResponseBody
    public DataResult searchRoadCrossInBounds(String wkt, String key,
            @RequestParam(value = "maxResult", required = true, defaultValue = "10") String maxResult,
            @RequestParam(value = "rowIndex", required = true, defaultValue = "1") String rowIndex,
            @RequestParam(value = "type", required = true, defaultValue = "name") String type,
            HttpServletResponse response) {
        response.setHeader("Access-Control-Allow-Origin", "*");
        DataResult result = new DataResult();

        String layerName = QueryParameterCollection.getInstance().getTableNameByKey(TableKeyEnum.ROADCROSS);
        if (layerName == null || layerName.length() == 0) {
            LOGGER.error("没有配置路口表");
            result.setError("没有配置路口表");
            result.setIsSucess(false);
            return result;
        }

        if (NetposaHelper.isEmpty(wkt)) {
            return result;
        }
        try {
            PageQuery<JSONArray> page = new PageQuery<>();
            page.setMaxResult(Integer.parseInt(maxResult));
            page.setPageIndex(Integer.parseInt(rowIndex));

            this.service.searchRoadCrossInBounds(wkt, key, layerName, type, page);
            result.setData(page.getQueryResult());

        } catch (Exception e) {
            LOGGER.error(e);
            result.setError(e.getMessage());
        }
        return result;
    }

	public DataResult updateRoadCross() {
		return new DataResult();
	}

	@ResponseBody
	@RequestMapping(value = "/addPoi", method = RequestMethod.POST)
	public DataResult createPoi(String name, String poiType, String address,
			@RequestParam(required = true, defaultValue = "0") double x,
			@RequestParam(required = true, defaultValue = "0") double y) {
		DataResult result = new DataResult();
		try {
			result.setData(this.service.createPoi(
					name,
					address,
					poiType,
					QueryParameterCollection.getInstance().getParmeterByKey(
							"poi"), x, y));
		} catch (Exception e) {
			LOGGER.error(e,e);
			result.setError(e.getMessage());
		}
		return result;
	}

	@ResponseBody
	@RequestMapping(value = "updataPoi", method = RequestMethod.POST)
	public DataResult updataPoi(String name, String poiType, String address,
			@RequestParam(required = true, defaultValue = "0") double x,
			@RequestParam(required = true, defaultValue = "0") double y,
			@RequestParam(required = true, defaultValue = "-1") Integer gid) {
		DataResult result = new DataResult();
		try {

			result.setData(this.service.updatePoi(
					name,
					address,
					poiType,
					QueryParameterCollection.getInstance().getParmeterByKey(
							"poi"), x, y, gid));
		} catch (Exception e) {
			LOGGER.error(e,e);
			result.setError(e.getMessage());
		}
		return result;
	}

	@ResponseBody
	@RequestMapping(value = "addRoadCross", method = RequestMethod.POST)
	public DataResult createRoadCross(String name,
			@RequestParam(required = true, defaultValue = "0") double x,
			@RequestParam(required = true, defaultValue = "0") double y) {
		DataResult result = new DataResult();
		try {

			result.setData(this.service.createRoadCross(
					name,
					QueryParameterCollection.getInstance().getParmeterByKey(
							"RoadCross"), x, y));
		} catch (Exception e) {
			LOGGER.error(e,e);
			result.setError(e.getMessage());
		}
		return result;
	}

	@ResponseBody
	@RequestMapping(value = "/updateRoadCross", method = RequestMethod.POST)
	public DataResult updataRoadCross(String name,
			@RequestParam(required = true, defaultValue = "0") double x,
			@RequestParam(required = true, defaultValue = "0") double y,
			@RequestParam(required = true, defaultValue = "-1") Integer gid) {
		DataResult result = new DataResult();
		try {

			result.setData(this.service.updateRoadCross(
					name,
					QueryParameterCollection.getInstance().getParmeterByKey(
							"RoadCross"), x, y, gid));
		} catch (Exception e) {
			LOGGER.error(e,e);
			result.setError(e.getMessage());
		}
		return result;
	}

	/*
	 * 根据城市编号查询摘要行政区和商圈查询
	 */
	
	@ResponseBody
	@RequestMapping(value = "shangquan/forward", method = RequestMethod.GET)
	public DataResult shangquan(
			@RequestParam(defaultValue = "1") String areacode,
			@RequestParam(defaultValue = "0") String business_flag) {
		DataResult result = new DataResult();
		try {
			result.setData(this.service.queryBussiness(areacode.trim(),
					business_flag.trim()));
		} catch (Exception e) {
			LOGGER.error(e,e);
			result.setError(e.getMessage());
		}
		return result;
	}
	
	@ResponseBody
	@RequestMapping(value = "shangquan/getBoundary", method = RequestMethod.GET)
	public DataResult getBoundary(
			@RequestParam(defaultValue = "1") String areacode) {
		DataResult result = new DataResult();
		try {
			result.setData(this.service.getBoundary(areacode));
		} catch (Exception e) {
			LOGGER.error(e,e);
			result.setError(e.getMessage());
		}
		return result;
	}
	/*
	 * 名称查询城市
	 */
	@ResponseBody
	@RequestMapping(value = "/getCityByName", method = RequestMethod.GET)
	public DataResult getCityByName(String areaName){
		DataResult result = new DataResult();
		try {
			result.setData(this.service.getCityName(areaName));
		} catch (Exception e) {
			LOGGER.error(e,e);
			result.setError(e.getMessage());
		}
		return result;
	}
	
	/**
	 * 关键字查询 poi、道路和路口，取匹配度最高的数据
	 * @param keyWordString 查询关键字 
	 * @param queryPlan 查询计划：normal 普通、fts 全文检索，默认normal
	 * @param maxResult 返回记录数，默认10
	 * @param response
	 * @return
	 */
	@ResponseBody
	@RequestMapping("/getFOIByName")
	public JSONArray getFOIByName(
			@RequestParam(value = "keyWordString", required = true, defaultValue = "") String keyWordString,
			@RequestParam(value = "queryPlan", required = true, defaultValue = "normal") String queryPlan,
			@RequestParam(value = "maxResult", required = true, defaultValue = "10") String maxResult,
			HttpServletResponse response) {
		response.setHeader("Access-Control-Allow-Origin", "*");
		JSONArray array = new JSONArray();

        try {
            if (!"".equals(keyWordString)) {
                array = this.service.getFOIByName(keyWordString, queryPlan, maxResult);
            }
        } catch (Exception e) {
            response.setStatus(500);
            LOGGER.error(e, e);
        }
		return array;
	}
	
	/**
	 * 关键字查询 poi、道路和路口,按照匹配度倒叙排列，支持分页
	 * @param keyWordString 查询关键字
	 * @param pageSize 页记录数
	 * @param page 页
	 * @param queryPlan 查询计划：normal 普通、fts 全文检索，默认normal
	 * @param response
	 * @return
	 */
	/*@ResponseBody
	@RequestMapping("/getFOIByNameForPage")
	public JSONObject getFOIByNameForPage(
			@RequestParam(value = "keyWordString", required = true, defaultValue = "") String keyWordString,
			@RequestParam(value = "pageSize", required = true, defaultValue = "10") String pageSize,
			@RequestParam(value = "page", required = true, defaultValue = "1") String page,
			@RequestParam(value = "queryPlan", required = true, defaultValue = "normal") String queryPlan,
			HttpServletResponse response) {
		response.setHeader("Access-Control-Allow-Origin", "*");

		return this.service.queryFOIByNameForPage(keyWordString, Integer.parseInt(pageSize), Integer.parseInt(page),
				queryPlan);
	}*/
	
	/**
	 * 行政区划码查询行政区划信息
	 * @param addvcd 行政区划码
	 * @param response
	 * @return
	 */
	@ResponseBody
	@RequestMapping("/getRegionalBound")
	public JSONObject getRegionalBound(
			@RequestParam(value = "addvcd", required = true, defaultValue = "") String addvcd,
			HttpServletResponse response) {
		response.setHeader("Access-Control-Allow-Origin", "*");

		return this.service.queryRegionalBound(addvcd);
	}
	
	@ResponseBody
    @RequestMapping(value = "/getRegionalBoundByName" )
    public JSONObject getRegionalBoundByName(
            @RequestParam(value = "name", required = true, defaultValue = "") String name,
            HttpServletResponse response) {
        response.setHeader("Access-Control-Allow-Origin", "*");
        return this.service.queryRegionalBoundByName(name);
    }
	
    @ResponseBody
    @RequestMapping("/getRegionTree")
    public JSONArray getRegionTree(@RequestParam(value = "addvcd", required = true, defaultValue = "") String addvcd,
            HttpServletResponse response) {
        response.setHeader("Access-Control-Allow-Origin", "*");

        return this.service.getRegionTree(addvcd);
    }
	
	@RequestMapping("/district")
	public ModelAndView district(ModelAndView modelMap) {
	    ModelAndView modelAndView = new ModelAndView("district");

        Locale locale = LocaleContextHolder.getLocale();

        modelAndView.addObject("myLocale", locale);

        return modelAndView;
	}
}
