package com.netposa.gis.server.controller;

import com.netposa.gis.server.bean.DriveBookInfo;
import com.netposa.gis.server.bean.MutilRoute;
import com.netposa.gis.server.bean.QueryParameterCollection;
import com.netposa.gis.server.bean.TableKeyEnum;
import com.netposa.gis.server.service.RoadService;
import com.netposa.gis.server.utils.NetposaHelper;
import com.vividsolutions.jts.geom.Geometry;
import com.vividsolutions.jts.io.ParseException;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletResponse;
import java.util.Locale;

@Controller
@RequestMapping(value = "/gis")
public class GisController {
    private static final Log LOGGER = LogFactory.getLog(GisController.class);

    private RoadService roadService;

    @Autowired
    public void setRoadService(RoadService roadService) {
        this.roadService = roadService;
    }

    private Geometry bulidGeo(String str) throws ParseException {
        return this.getNPGisFactory().buildGeo(str);
    }

    private com.netposa.gis.server.bean.GeometryFactory getNPGisFactory() {
        return com.netposa.gis.server.bean.GeometryFactory.getInstance();
    }

    @ResponseBody
    @RequestMapping("")
    public String index() {
        return "欢迎进入gis 控制层";
    }

    /*
     * 缓冲区服务
     */
    @ResponseBody
    @RequestMapping(value = "buffer")
    public String buffer(@RequestParam(value = "distance", required = true, defaultValue = "0.01") double distance,
            @RequestParam(value = "geometry", required = true, defaultValue = "") String geom,
            @RequestParam(value = "srid", required = false, defaultValue = "0") Integer srid,
            @RequestParam(value = "format", required = false, defaultValue = "wkt") String format,
            String quadrantSegments, HttpServletResponse response) {
        try {
            response.setHeader("Access-Control-Allow-Origin", "*");

            if (geom == null || geom.trim().length() == 0 || "LINESTRING()".equalsIgnoreCase(geom)) {
                return "POLYGON EMPTY";
            }
            Geometry g1 = this.bulidGeo(geom.trim());
            g1.setSRID(srid);
            Geometry bg = null;

            if (NetposaHelper.isEmpty(quadrantSegments)) {
                bg = g1.buffer(distance);
            } else {
                bg = g1.buffer(distance, Integer.parseInt(quadrantSegments));
            }
            if ("wkt".equalsIgnoreCase(format)) {
                return bg.toString();
            } else {
                return NetposaHelper.geomoterJson(bg);
            }

        } catch (Exception e) {
            LOGGER.error(e);
            return "POLYGON EMPTY";
        }
    }

    @RequestMapping("bufferDemo")
    public String bufferServiceDemo() {
        return "bufferService";
    }

    @RequestMapping("/naDemo")
    public ModelAndView naDemo() {
        ModelAndView modelAndView = new ModelAndView("naDemo");

        Locale locale = LocaleContextHolder.getLocale();
        modelAndView.addObject("myLocale", locale);

        return modelAndView;
    }

    /*
     * 路网规划服务 Astar Dijkstra
     */
    @ResponseBody
    @RequestMapping("na")
    public DriveBookInfo roadProcess(
            /*@RequestParam(value = "algorithm", required = true, defaultValue = "Dijkstra") String algorithmName,*/
            @RequestParam(value = "weighter", required = true, defaultValue = "length") String weighterName,
            @RequestParam(value = "stops", required = true, defaultValue = "") String stopPoints,
            @RequestParam(value = "restrictField", required = true, defaultValue = "car") String restrictField,
            @RequestParam(value = "planroadtype", required = true, defaultValue = "1") String planRoadType,
            String geoms,
            @RequestParam(value = "lang", required = false, defaultValue = "zh_CN") String lang,
            /*@RequestParam(value = "graph", required = true, defaultValue = "shanghai_roadnet_supermap") String graphName,
            @RequestParam(value = "tolerance", required = true, defaultValue = "0") String tolerance,*/
            HttpServletResponse response) {

        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Pragma", "no-cache");
        response.setDateHeader("Expires", 0);
        response.addHeader("Cache-Control", "no-cache");
        response.addHeader("Cache-Control", "no-store");

        DriveBookInfo driveBookInfo = new DriveBookInfo();

        if (stopPoints.trim().length() == 0) {
            return driveBookInfo;
        }

        try {
            Geometry[] stops = this.getNPGisFactory().createPoints(stopPoints);
            Geometry[] geoBarriers = this.getNPGisFactory().readGeometries(geoms);
            roadService.setIsMutileRoute(false);
            driveBookInfo = roadService.getRote(stops, geoBarriers, restrictField, planRoadType, weighterName, lang);
        } catch (ParseException e) {
            LOGGER.error(e);
        }finally{
        	driveBookInfo.clearRoutesPoint();
        }
        return driveBookInfo;
    }

    @RequestMapping("getGeomRelatonship")
    @ResponseBody
    public String getGeomRelatonship(String wkt, String wkt1) {
        Geometry geometry;
        try {
            geometry = this.bulidGeo(wkt);
            Geometry geometry1 = this.bulidGeo(wkt1);
            if (geometry.within(geometry1)) {
                return "within";
            }
            if (geometry.equals(geometry1)) {
                return "equal";
            }
            if (geometry.contains(geometry1)) {
                return "contains";
            }
            if (geometry.intersects(geometry1)) {
                return "intersects";
            }
            if (geometry.touches(geometry1)) {
                return "touches";
            }
            if (geometry.crosses(geometry1)) {
                return "crosses";
            }
            if (geometry.overlaps(geometry1)) {
                return "overlaps";
            }
            if (geometry.covers(geometry1)) {
                return "covers";
            }
            if (geometry.coveredBy(geometry1)) {
                return "coveredBy";
            }

        } catch (ParseException e) {
            LOGGER.error(e);
        }
        return "";
    }

    /*
     * 路网规划服务
     */
    @ResponseBody
    @RequestMapping("routing")
    public MutilRoute[] mutilRoadProcess(
            @RequestParam(value = "algorithm", required = true, defaultValue = "Dijkstra") String algorithmName,
            @RequestParam(value = "weighter", required = true, defaultValue = "length") String weighterName,
            @RequestParam(value = "stops", required = true, defaultValue = "") String stopPoints,
            @RequestParam(value = "restrictField", required = true, defaultValue = "car") String restrictField,
            @RequestParam(value = "planroadtype", required = true, defaultValue = "1") String planRoadType,
            String geoms,
            @RequestParam(value = "lang", required = false, defaultValue = "zh_CN") String lang,
            @RequestParam(value = "graph", required = true, defaultValue = "shanghai_roadnet_supermap") String graphName,
            @RequestParam(value = "tolerance", required = true, defaultValue = "0") String tolerance,
            HttpServletResponse response) {
        response.setHeader("Access-Control-Allow-Origin", "*");

        String roadNetGraphName = QueryParameterCollection.getInstance().getTableNameByKey(TableKeyEnum.ROADNET);
        if (roadNetGraphName == null) {
            roadNetGraphName = graphName;
        }

        if (NetposaHelper.isEmpty(stopPoints)) {
            return new MutilRoute[0];
        }

        try {
            Geometry[] geoBarriers = this.getNPGisFactory().readGeometries(geoms);
            roadService.setIsMutileRoute(true);

            return roadService.mutilRoute(stopPoints, geoBarriers, roadNetGraphName, restrictField, planRoadType,
                    algorithmName, weighterName, Double.valueOf(tolerance), lang);
        } catch (Exception e) {
            LOGGER.error(e);
        }
        return new MutilRoute[0];
    }

    @RequestMapping("routedemo")
    public ModelAndView mutilRoadProcessDemo() {
        ModelAndView modelAndView = new ModelAndView("route/mutilPoints");

        Locale locale = LocaleContextHolder.getLocale();
        modelAndView.addObject("myLocale", locale);

        return modelAndView;
    }

    @ResponseBody
    @RequestMapping("routingCache")
    public String routeCacheCount() {
        return Integer.toString(RoadService.getCacheCount());
    }
}
