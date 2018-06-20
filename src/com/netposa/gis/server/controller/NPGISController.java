package com.netposa.gis.server.controller;

import com.netposa.gis.server.bean.CompactMap;
import com.netposa.gis.server.bean.NPGISMap;
import com.netposa.gis.server.service.BaiduVectorTileService;
import com.netposa.gis.server.service.GaodeVectorTileService;
import com.netposa.gis.server.utils.HardWareUtils;
import com.netposa.gis.server.utils.NetposaHelper;
import net.sf.ehcache.Cache;
import net.sf.ehcache.CacheManager;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import net.sf.json.JSONSerializer;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.util.*;

@RequestMapping(value = "/NPGIS")
@Controller
public class NPGISController extends BaseController {
	private static final Log LOGGER = LogFactory.getLog(NPGISController.class);
	
	// 服务器ip
    private Map<String,String> ipMap = new HashMap<>();
	
    private BaiduVectorTileService baiduVectorTileService;
    private GaodeVectorTileService gaodeVectorTileService;

    @Autowired
    public void setBaiduVectorTileService(BaiduVectorTileService baiduVectorTileService) {
        this.baiduVectorTileService = baiduVectorTileService;
    }

    @Autowired
    public void setGaodeVectorTileService(GaodeVectorTileService gaodeVectorTileService) {
        this.gaodeVectorTileService = gaodeVectorTileService;
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
    
    
    
    @ResponseBody
	@RequestMapping(method = RequestMethod.GET, value = "services/{serviceName}/MapServer")
	public ModelAndView mapConfig(
			@PathVariable String serviceName,
			HttpServletRequest request,
			HttpServletResponse response,
			@RequestParam(value = "f", required = false, defaultValue = "") String f,
			String callback) throws IOException {
		response.setHeader("Access-Control-Allow-Origin", "*");
		response.setHeader("Access-Control-Allow-Headers", "X-Requested-With");
		NPGISMap map = NetposaHelper.getNpGISMapConfig(serviceName, request);
		ModelAndView modelMap = new ModelAndView("NPGISMap");
		if (map == null) {
			return modelMap;
		}
		boolean isCallBack = callback != null && callback.length() > 0;
		if (isCallBack || "json".equalsIgnoreCase(f)
				|| "pjson".equalsIgnoreCase(f)) {
			if (isCallBack) {
				response.getOutputStream().write(
						new String(callback + "(").getBytes());
			}
			NPJsonView.render(map, response);
			if (isCallBack) {
				response.getOutputStream().write(new String(");").getBytes());
			}
			return null;
		}

		modelMap.addObject("info", map);		 
		modelMap.addObject("serviceName", serviceName);
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
                    "{0}://{1}:{2}/TServer/NPGIS/services/{3}/MapServer",
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
	
	@RequestMapping(value = "/config/{serviceName}/{ip}")
    public void downLoadConfig(@PathVariable String serviceName, @PathVariable String ip,
            @RequestParam(value = "render", required = true, defaultValue = "") String render,
            HttpServletRequest request, HttpServletResponse response) {
		response.setHeader("Access-Control-Allow-Origin", "*");
		
		NPGISMap info = NetposaHelper
                .getNpGISMapConfig(serviceName, request);
        if (info == null) {
            return;
        }
        
        getServerIps(request, ipMap);
        
        String realIP = ipMap.get(ip);
		String port = String.valueOf(request.getServerPort());
		String scheme = request.getScheme();
		
		response.setContentType("application/octet-stream");
		response.setHeader("Content-Disposition",
				"attachment; filename=mapConfig.json");
		
		StringBuilder buffer = this.configGenerator(serviceName, info, realIP, port, scheme, render);
		
		try {
			ServletOutputStream out = response.getOutputStream();
			out.write(buffer.toString().getBytes());
			out.flush();
		} catch (IOException e) {
		    LOGGER.error(e);
		}
	}
	
	
	
	/*
	 * 获取地图DEMO
	 */
	@RequestMapping(method = RequestMethod.GET, value = "services/{serviceName}/Map")
	public String mapDemo(@PathVariable String serviceName,
			HttpServletRequest request, ModelMap modelMap) {
		NPGISMap map = NetposaHelper.getNpGISMapConfig(serviceName, request);
		if (map == null) {
			return "NPGISMapDemo";
		}	 
		modelMap.addAttribute("info", map);
		modelMap.addAttribute("serviceName", serviceName);
		Locale locale = LocaleContextHolder.getLocale();
        modelMap.addAttribute("myLocale", locale);
		return "NPGISMapDemo";
	}

	/*
	 * 获取地图切片
	 */
	@RequestMapping(method = RequestMethod.GET, value = "services/{serviceName}/MapServer/getTile")
	public void mapServer(@PathVariable String serviceName, String X, String Y,
			String L,String format, HttpServletResponse response, OutputStream os,
			HttpServletRequest request) {
		CompactMap configCompactMap = NetposaHelper
				.getMapConfigByMapName(serviceName);
		if (configCompactMap == null) {
			response.setStatus(404);
			return;
		}

		@SuppressWarnings("deprecation")
		byte[] bufferBytes = NetposaHelper.getTile(serviceName,
				request.getRealPath(configCompactMap.getMapUrl()), L, X, Y);
		if (bufferBytes == null || bufferBytes.length <= 0) {
			response.setStatus(404);
			return;
		}
		try {
			if(format != null && "jsonp".equalsIgnoreCase(format)){
				response.setContentType("text/json;charset=UTF-8");
				response.setCharacterEncoding("UTF-8");
			}else{
				response.addHeader("Content-type", "image/png");
				response.addHeader("Cache-Control", "max-age=300,must-revalidate");
				response.addHeader("ETag", new sun.misc.BASE64Encoder()
						.encode(java.text.MessageFormat.format("{0}_{1}_{2}_{3}",
								serviceName, L, X, Y).getBytes()));
			}
			
			os.write(bufferBytes);
		} catch (IOException e) {
		    LOGGER.error(e);
			response.setStatus(500);
		}
	}

	/*
	 * Map Services
	 */
	@RequestMapping(method = RequestMethod.GET, value = "/services")
	public String getServices() {
		return "redirect:/map/services";
	}
	
	// 个性地图编辑工具
	@RequestMapping(method = RequestMethod.GET, value = "services/{serviceName}/styleMapEdit")
    public ModelAndView styleMapEdit(@PathVariable String serviceName,
            @RequestParam(required = false, defaultValue = "baidu") String type, HttpServletRequest request) {
        ModelAndView modelMap = new ModelAndView(type + "StyleMapEditTools");
		
		NPGISMap map = NetposaHelper.getNpGISMapConfig(serviceName, request);
		
		Locale locale = LocaleContextHolder.getLocale();

		modelMap.addObject("info", map);
		modelMap.addObject("serviceName", serviceName);
		modelMap.addObject("myLocale", locale);
		modelMap.addObject("myMapType", type);
        
		return modelMap;
	}

	/*
	 * 风格化地图文案
	 * @param serviceName 服务名称
	 * @param x 切片 x 值
	 * @param y 切片 y 值 
	 * @param l 切片 等级
	 * @param fn 前端绘制标识
	 * @param response
	 * @return
	 */
	@ResponseBody
	@RequestMapping(method = RequestMethod.GET, produces = "application/json; charset=utf-8", value = "services/{serviceName}/MapServer/getVectorTileLabel")
	public String getBaiduVectorTileLabel(@PathVariable String serviceName, String x, String y, String l, String fn,
			HttpServletResponse response) {
		response.addHeader("Cache-Control", "max-age=2592000,must-revalidate");
		return baiduVectorTileService.getTileLabel(serviceName, x, y, l, fn);
	}

	
	/*
	 * 风格化地图
	 * @param serviceName 服务名称
	 * @param x 切片 x 值
	 * @param y 切片 y 值 
	 * @param l 切片 等级
	 * @param scale 切片大小比例，默认1，切片大小默认256*256
	 * @param imgCache 是否缓存绘制完成的 tile，默认 true，在个性地图编辑工具界面设置地图样式的情况下设置为 false
	 * @param custom 自定义风格
	 * @param request
	 * @param response
	 */
    @RequestMapping(method = RequestMethod.GET, value = "services/{serviceName}/MapServer/getVectorTile")
    public void getBaiduVectorTile(@PathVariable String serviceName, String x, String y, String l,
            @RequestParam(required = false, defaultValue = "1") String scale,
            @RequestParam(required = false, defaultValue = "true") String imgCache, String custom,
            HttpServletRequest request, HttpServletResponse response) {
        OutputStream stream = null;
        ByteArrayOutputStream byteos = null;
        byte[] bytes = null;

        try {
            response.addHeader("Content-type", "image/jpg");
            response.addHeader("Cache-Control", "max-age=2592000,must-revalidate");

            boolean personalise = Boolean.parseBoolean(imgCache);

            bytes = baiduVectorTileService.drawTile(serviceName, x, y, l, scale, personalise, custom);

            if (bytes != null) {
                stream = response.getOutputStream();
                stream.write(bytes);
                stream.flush();
                response.flushBuffer();
            }
        } catch (IOException e) {
            LOGGER.error(e);
        } finally {
            try {
                if (byteos != null) {
                    byteos.close();
                }
                if (stream != null) {
                    stream.close();
                }

            } catch (IOException e) {
                LOGGER.error(e);
            }
        }
    }
    
	/**
     * 百度矢量数据标注集合
     * @param serviceName 服务名称
     * @param t 行列号和等级集合，eg:13,6567,3258;13,6567,3259
     * @param response
     * @return
     */
    @ResponseBody
    @RequestMapping(method = RequestMethod.GET, produces = "application/json; charset=utf-8", value = "services/{serviceName}/MapServer/getBaiduMapLabel")
    public String getBaiduMapLabel(@PathVariable String serviceName, String t, HttpServletResponse response) {
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.addHeader("Cache-Control", "max-age=2592000,must-revalidate");
        return this.baiduVectorTileService.getBaiduMapLabel(serviceName, t).toJSONString();
    }
	
    /**
     * limg 数据集，客户端渲染方式标注数据接口
     * @param serviceName 服务名称
     * @param t 行列号和等级集合，eg:13,6567,3258;13,6567,3259
     * @param response
     * @return
     */
    @ResponseBody
    @RequestMapping(method = RequestMethod.GET, produces = "application/json; charset=utf-8", value = "services/{serviceName}/MapServer/getGaodeMapLabel")
    public String getGaodeMapLabel(@PathVariable String serviceName, String t, HttpServletResponse response) {
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.addHeader("Cache-Control", "max-age=2592000,must-revalidate");
        return this.gaodeVectorTileService.getGaodeMapLabels(serviceName, t).toJSONString();
    }

    /**
     * region_building_road 数据集，客户端渲染方式除标注外数据接口
     * @param serviceName 服务名称
     * @param t 行列号和等级集合，eg:13,6567,3258;13,6567,3259
     * @param response
     * @return
     */
    @ResponseBody
    @RequestMapping(method = RequestMethod.GET, produces = "application/json; charset=utf-8", value = "services/{serviceName}/MapServer/getGaodeMapRegion")
    public String getGaodeMapRegion(@PathVariable String serviceName, String t, HttpServletResponse response) {
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.addHeader("Cache-Control", "max-age=2592000,must-revalidate");
        return this.gaodeVectorTileService.getGaodeMapRegion(serviceName, t).toJSONString();
    }
	
    /**
     * 高德矢量切片,服务端渲染图片，不包括标注信息
     * @param serviceName 服务名称
     * @param X 行号
     * @param Y 列号
     * @param L 切片等级
     * @param scale 切片大小比例，默认1，切片大小默认256*256
     * @param imgCache 是否缓存绘制完成的 tile，默认 true，在个性地图编辑工具界面设置地图样式的情况下设置为 false
     * @param custom 自定义风格
     * @param request
     * @param response
     */
    @RequestMapping(method = RequestMethod.GET, value = "services/{serviceName}/MapServer/getGaodeVectorTile")
    public void getGaodeVectorTile(@PathVariable String serviceName, String X, String Y, String L,
            @RequestParam(required = false, defaultValue = "1") String scale,
            @RequestParam(required = false, defaultValue = "true") String imgCache, String custom,
            HttpServletRequest request, HttpServletResponse response) {
        OutputStream stream = null;
        ByteArrayOutputStream byteos = null;
        byte[] bytes = null;

        try {
            response.addHeader("Content-type", "image/jpg");
            response.addHeader("Cache-Control", "max-age=2592000,must-revalidate");

            boolean personalise = Boolean.parseBoolean(imgCache);

            bytes = gaodeVectorTileService.drawTile(serviceName, X, Y, L, scale, personalise, custom);

            if (bytes != null) {
                stream = response.getOutputStream();
                stream.write(bytes);
                stream.flush();
                response.flushBuffer();
            }
        } catch (IOException e) {
            LOGGER.error(e);
        } finally {
            try {
                if (byteos != null) {
                    byteos.close();
                }
                if (stream != null) {
                    stream.close();
                }

            } catch (IOException e) {
                LOGGER.error(e);
            }
        }
    }
    
    /**
     * 标注信息，配合服务端渲染图片使用，在客户端渲染标注
     * @param serviceName 服务名称
     * @param t 行列号和等级集合，eg:13,6567,3258;13,6567,3259
     * @param response
     * @return
     */
    @ResponseBody
    @RequestMapping(method = RequestMethod.GET, produces = "application/json; charset=utf-8", value = "services/{serviceName}/MapServer/getGaodeVectorTileLabel")
    public String getGaodeVectorTileLabels(@PathVariable String serviceName, String t, HttpServletResponse response) {
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.addHeader("Cache-Control", "max-age=2592000,must-revalidate");
        return this.gaodeVectorTileService.getGaodeMapLabels(serviceName, t).toJSONString();
    }
    
    /**
     * 获取高德矢量切片标注数据，一个切片
     * @param serviceName
     * @param x
     * @param y
     * @param l
     * @param response
     * @return
     */
    @ResponseBody
    @RequestMapping(method = RequestMethod.GET, produces = "application/json; charset=utf-8", value = "services/{serviceName}/MapServer/getGaodeVectorOneTileLabel")
    public String getGaodeVectorTileLabel(@PathVariable String serviceName, String x, String y, String l,
            HttpServletResponse response) {
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.addHeader("Cache-Control", "max-age=2592000,must-revalidate");
        return this.gaodeVectorTileService.getGaodeMapLabel(serviceName, x, y, l);
    }
    
    // 测试用，获取缓存大小
    @ResponseBody
    @RequestMapping("/getCacheMemorySize")
    public JSONObject getCacheMemorySize() {
        Cache vectorTileCache = CacheManager.getInstance().getCache("tileCache");
        @SuppressWarnings("deprecation")
        long inMemorySize = vectorTileCache.calculateInMemorySize();
        JSONObject result = new JSONObject();
        result.put("memorySize", inMemorySize / 1048576);

        return result;
    }
    
 // 生成导出的 mapConfig.json 内容
    private StringBuilder configGenerator(String serviceName, NPGISMap info, String ip, String port, String scheme, String render) {
        StringBuilder config = new StringBuilder();
        
        config.append(this.configMapOptsGenerator(info))
            .append(",")
            .append(this.configVectorLayerGenerator(serviceName, info, ip, port, scheme, render))
            .append(",")
            .append(" \"sattilateLayer\": []}");
        
        return config;
    }
    
    // mapConfig.json 中 mapOpts 生成
    private StringBuilder configMapOptsGenerator(NPGISMap info) {
        StringBuilder mapOpts = new StringBuilder();
        
        mapOpts.append("{\"mapOpts\":{\"minZoom\":" + info.getMinZoom());
        mapOpts.append(",\"defaultZoom\":");
        mapOpts.append(info.getMinZoom());
        mapOpts.append(",\"maxZoom\":");
        mapOpts.append(info.getMaxZoom());
        mapOpts.append(",\"centerPoint\":");
        mapOpts.append(info.getCenterPoint());
        mapOpts.append(",\"restrictedExtent\":");
        mapOpts.append(info.getRestrictedExtent());
        mapOpts.append(",\"projection\":\"EPSG:");
        mapOpts.append(info.getProjection());
        mapOpts.append("\"}");
        
        return mapOpts;
    }
    
    // mapConfig.json 中 vectorLayer 生成
    private StringBuilder configVectorLayerGenerator(String serviceName, NPGISMap info, String ip, String port, String scheme, String render) {
        StringBuilder vectorLayer = new StringBuilder();

        String url = java.text.MessageFormat.format("{0}://{1}{2}/TServer/NPGIS/services/{3}/MapServer", scheme, ip,
                "", serviceName);
        
        if("server".equals(render)) {
            vectorLayer.append(this.otherVectorLayerGenerator(serviceName, info, url));
        } else {
            vectorLayer.append(this.normalVectorLayerGenerator(serviceName, info, url));
        }
        
        return vectorLayer;
    }
    
    // 下载的切片地图、百度矢量地图和高德矢量地图客户端渲染的情况
    private StringBuilder normalVectorLayerGenerator(String serviceName, NPGISMap info,
            String url) {
        StringBuilder vectorLayer = new StringBuilder();
        
        String type = info.getType();
        String layerType = info.getLayerType();
        
        vectorLayer.append("\"vectorLayer\":[{\"layerName\":\"")
            .append(serviceName)
            .append("\",\"layerType\":\"")
            .append(this.layerTypeGenerator(type, layerType))
            .append(this.layerOptGenerator(type, layerType, url))
            .append("\"layerInfo\":")
            .append(JSONSerializer.toJSON(info).toString())
            .append("}}]");
        
        return vectorLayer;
    }
    
    // 高德矢量切片服务端渲染的情况
    private StringBuilder otherVectorLayerGenerator(String serviceName, NPGISMap info, String url) {
        StringBuilder vectorLayer = new StringBuilder();
        
        vectorLayer.append("\"vectorLayer\":[")
            // 第一项
            .append("{")
            .append(this.otherCommon(serviceName))
            .append(",")
            .append("\"layerOpt\": {")
            .append("\"url\":[\"").append(url).append("/getGaodeVectorTile\"],\"isBaseLayer\":true")
            .append("}")
            .append("},")
            // 第二项
            .append("{")
            .append(this.otherCommon(serviceName + "Label"))
            .append(",")
            .append(this.otherLayerOptGenerator(info, url))
            .append("}")
            
            .append("]");
        
        return vectorLayer;
    }
    
    private StringBuilder otherCommon(String serviceName) {
        StringBuilder common = new StringBuilder();
        
        common.append("\"layerName\":")
            .append("\"")
            .append(serviceName)
            .append("\"")
            .append(",")
            .append("\"layerType\": \"NPMapLib.Layers.GaoDeLayer\"");
        
        return common;
    }
    
    private StringBuilder otherLayerOptGenerator(NPGISMap info, String url) {
        StringBuilder layerOpt = new StringBuilder();
        
        layerOpt.append("\"layerOpt\":{")
            .append("\"labelUrl\":[")
            .append("\"").append(url).append("/getGaodeVectorTileLabel\"")
            .append("],")
            .append("\"isBaseLayer\": false,\"isVectorTile\": false,\"isVectorLayer\": true,")
            .append("\"layerInfo\":")
            .append(JSONSerializer.toJSON(info).toString())
            .append("}");
        
        return layerOpt;
    }
    
    private StringBuilder layerTypeGenerator(String type, String layerTypeParam) {
        StringBuilder layerType = new StringBuilder();

        if ("json".equalsIgnoreCase(type)) {
            // 风格化地图服务
            if ("gaodeVector".equals(layerTypeParam)) {
                layerType.append("NPMapLib.Layers.GaoDeLayer\",");
            } else {
                layerType.append("NPMapLib.Layers.BaiduTileLayer\",");
            }
        } else {
            layerType.append("NPMapLib.Layers.NPLayer\",");
        }

        return layerType;
    }
    
    private StringBuilder layerOptGenerator(String type, String layerType, String url) {
        StringBuilder layerOpt = new StringBuilder();
        if ("json".equalsIgnoreCase(type)) {
            // 风格化地图服务
            layerOpt.append("\"layerOpt\":{\"url\":");
            layerOpt.append("[");
            if ("gaodeVector".equals(layerType)) {
                layerOpt.append("\"").append(url).append("/getGaodeMapRegion\"");
            } else {
                layerOpt.append("\"").append(url).append("/getVectorTile?x=${x}&y=${y}&l=${z}\"");
            }

            layerOpt.append("],");
            layerOpt.append("\"labelUrl\":[");
            if ("gaodeVector".equals(layerType)) {
                layerOpt.append("\"").append(url).append("/getGaodeMapLabel\"");
            } else {
                layerOpt.append("\"").append(url).append("/getVectorTileLabel?x=${x}&y=${y}&l=${z}\"");
            }

            layerOpt.append("],");
            layerOpt.append("\"isBaseLayer\": true,\"isVectorTile\": true,");

            if ("gaodeVector".equals(layerType)) {
                layerOpt.append("\"isVectorLayer\": true,");
            }
        } else {
            layerOpt.append("\"layerOpt\":{\"url\":\"" + url + "\",");
        }
        
        return layerOpt;
    }
}
