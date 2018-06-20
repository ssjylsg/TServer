package com.netposa.gis.server.controller;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Locale;

@Controller
@RequestMapping("pgis")
public class PGISController {

	private static final Log logger = LogFactory.getLog(PGISController.class);
	
	private String pgisMapConfig = " {            \"mapOpts\": {"
			+ "                \"minZoom\": @minZoom,"
			+ ""
			+ "                \"maxZoom\": @maxZoom,"
			+ "                \"centerPoint\": [@mapCenter],"
			+ "                \"restrictedExtent\": [@restrictedExtent],"
			+ "                \"projection\": \"EPSG:4326\""
			+ "            },"
			+ "            \"vectorLayer\": [{"
			+ "                \"layerName\": \"shanghaiBaseMap1\","
			+ "                \"layerType\": \"NPMapLib.Layers.EzMapTileLayer\","
			+ "                \"layerOpt\": {"
			+ "                    \"url\": \"@url\","
			+ "                    \"isBaseLayer\": true,"
			+ "                    \"serviceVersion\": \"@serviceVersion\""
			+ "                }"
			+ "            }],           "
			+" \"sattilateLayer\": []}";
	
	@RequestMapping()
    public ModelAndView index() {
        ModelAndView modelAndView = new ModelAndView("pgisIndex");

        Locale locale = LocaleContextHolder.getLocale();

        modelAndView.addObject("myLocale", locale);

        return modelAndView;
    }

	@RequestMapping("config")
	public void config(HttpServletResponse response, String minZoom,
			String maxZoom, String centerPoint, String mapUrl,
			@RequestParam(defaultValue = "0.3") String version,String restrictedExtent) {
		if (centerPoint == null || centerPoint.trim().length() == 0) {
			return;
		}
		if (centerPoint.split(",").length != 2) {
			return;
		}
		if(restrictedExtent == null || restrictedExtent.split(",").length != 4){
			return;
		}
		try {
			response.setContentType("application/octet-stream");
			response.setHeader("Content-Disposition",
					"attachment; filename=mapConfig.json");
			response.setCharacterEncoding("UTF-8");
			String configString = pgisMapConfig
					.replaceAll("@mapCenter", centerPoint)
					.replaceAll("@minZoom", minZoom)
					.replaceAll("@maxZoom", maxZoom).replaceAll("@url", mapUrl)
					.replaceAll("@serviceVersion", version)
					.replaceAll("@restrictedExtent", restrictedExtent);
			ServletOutputStream out = response.getOutputStream();
			out.write(configString.getBytes("utf-8"));
			out.flush();
		} catch (IOException e) {
			logger.error(e);
		}

	}
}
