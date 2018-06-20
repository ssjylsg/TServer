package com.netposa.gis.server.service;

import com.alibaba.fastjson.JSONObject;
import com.netposa.gis.server.bean.*;
import com.netposa.gis.server.utils.NetposaHelper;
import com.netposa.gis.server.utils.SpringUtil;
import com.vividsolutions.jts.geom.*;
import com.vividsolutions.jts.geom.GeometryFactory;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.geotools.geometry.jts.JTSFactoryFinder;
import org.geotools.graph.path.AStarShortestPathFinder;
import org.geotools.graph.path.Path;
import org.geotools.graph.structure.DirectedEdge;
import org.geotools.graph.structure.DirectedNode;
import org.geotools.graph.structure.Edge;
import org.geotools.graph.structure.Node;
import org.geotools.graph.traverse.standard.AStarIterator.AStarFunctions;
import org.geotools.graph.traverse.standard.AStarIterator.AStarNode;
import org.opengis.feature.simple.SimpleFeature;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Hashtable;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.Semaphore;

@Service("roadService")
public class RoadService extends BaseServiceImpl {

    private static final Log LOGGER = LogFactory.getLog(RoadService.class);
    private static GeometryFactory geometryFactory = JTSFactoryFinder.getGeometryFactory();
    // 全局缓存路网信息，主要用于PVD 固定卡口之间的路径规划
    final static Hashtable<String, MutilRoute> table = new Hashtable<String, MutilRoute>();

    private Point startPoint;
    private Point endPoint;
    
    public void setIsMutileRoute(Boolean isMutileRoute) {
        this.isMutileRoute = isMutileRoute;
    }

    /*
     * 
     * @param stops 停靠点，默认[]
     * 
     * @param geoBarriers 障碍点,默认[]
     * 
     * @param restrictField 通行方式：car 和 walk,默认car
     * 
     * @param planRoadType 计算类型：最短时间 1，最短距离 2，避开高速 3
     * 
     * @param weighterName 数据库权重字段，默认 length
     * 
     * @param lang 语言
     * 
     * @return
     * 
     * @throws Exception
     */
    public DriveBookInfo getRote(Geometry[] stops, Geometry[] geoBarriers, String restrictField, String planRoadType,
            String weighterName, String lang) {

        if (networkGraph == null) {
            reloadConnInfo("all");
        }

        // 起点或者终点没有
        if (stops.length != 2) {
            return this.getRouteTransform(null, null);
        }
        // 起点
        Point originPoint = stops[0].getCentroid();
        this.startPoint = originPoint;

        // 终点
        Point destinationPoint = stops[1].getCentroid();
        this.endPoint = destinationPoint;

        boolean isLevel = false;

        Locale locale = this.getCustomLocale(lang);

        return this.getShortDistancePath(originPoint, destinationPoint, geoBarriers, restrictField, weighterName,
                planRoadType, isLevel, locale);
    }

    /*
     * 多点路径规划结果缓存
     */
    public static int getCacheCount() {
        return table.size();
    }
    public static void clearTable(){
    	table.clear();
    }
    /*
     * 多点路径分析
     */
    @SuppressWarnings({ "deprecation" })
    public com.netposa.gis.server.bean.MutilRoute[] mutilRoute(String lonlats, Geometry[] geoBarriers,
            String graphName, final String restrictField, final String planRoadType, final String algorithmName,
            final String weighterName, double tolerance, String lang) throws Exception {
        if (networkGraph == null) {
            reloadConnInfo("all");
        }

        Locale locale = this.getCustomLocale(lang);

        String[] tempsStrings = lonlats.split(";");
        java.util.List<Double> listx = new ArrayList<Double>();
        java.util.List<Double> listy = new ArrayList<Double>();

        for (int i = 0; i < tempsStrings.length; i++) {
            String[] lonlat = tempsStrings[i].split(",");
            listx.add(Double.parseDouble(lonlat[0]));
            listy.add(Double.parseDouble(lonlat[1]));
        }
        Double[] arrayx = new Double[listx.size()];
        arrayx = listx.toArray(arrayx);

        Double[] arrayy = new Double[listy.size()];
        arrayy = listy.toArray(arrayy);
        java.util.Arrays.sort(arrayx);
        java.util.Arrays.sort(arrayy);

        final MutilRoute[] driveBookInfos = new MutilRoute[tempsStrings.length - 1];
        final Semaphore s = new Semaphore(0);

        for (int i = 0; i < tempsStrings.length; i++) {
            String[] temp0 = tempsStrings[i].split(",");
            if (i + 1 >= tempsStrings.length) {
                break;
            }
            final int index = i;
            String tempKey = tempsStrings[i] + "&" + tempsStrings[i + 1];
            if (table.containsKey(tempKey)) {
                driveBookInfos[index] = table.get(tempKey);
                s.release();
                continue;
            }
            tempKey = tempsStrings[i + 1] + "&" + tempsStrings[i];
            if (table.containsKey(tempKey)) {
                MutilRoute route = table.get(tempKey);
                driveBookInfos[index] = MutilRoute.reverse(route);
                s.release();
                continue;
            }
            if (tempsStrings[i + 1].equalsIgnoreCase(tempsStrings[i])) {
                driveBookInfos[index] = new MutilRoute(tempsStrings[i], tempsStrings[i + 1]);
                s.release();
                continue;
            }
            final String key = tempsStrings[i] + "&" + tempsStrings[i + 1];
            String[] temp1 = tempsStrings[i + 1].split(",");
            final Point originPoint = new Point(new Coordinate(Double.parseDouble(temp0[0]),
                    Double.parseDouble(temp0[1])), new PrecisionModel(), 0);

            final Point destinationPoint = new Point(new Coordinate(Double.parseDouble(temp1[0]),
                    Double.parseDouble(temp1[1])), new PrecisionModel(), 0);
            this.startPoint = originPoint;
            this.endPoint = destinationPoint;

            // 去掉了多线程处理,这里线程不安全
            /*
             * new Thread(new Runnable() {
             * 
             * @Override public void run() {
             */
            MutilRoute route = new MutilRoute(originPoint, destinationPoint);

            try {
                EdgeInfo startEdgeInfo = getNearestEdgeInfo(originPoint);

                if (startEdgeInfo.getEdge() == null) {
                    route.setExpend(new Routes());
                    // 设置长度
                    route.setLength(disBetweenTowPoints(originPoint, destinationPoint));

                    driveBookInfos[index] = route;
                    table.put(key, route);
                    // return;
                    break;
                }

                EdgeInfo endEdgeInfo = this.getNearestEdgeInfo(destinationPoint);
                if (endEdgeInfo.getEdge() == null) {
                    route.setExpend(new Routes());
                    // 设置长度
                    route.setLength(disBetweenTowPoints(originPoint, destinationPoint));
                    driveBookInfos[index] = route;
                    table.put(key, route);
                    // return;
                    break;
                }

                Node destination = endEdgeInfo.getEdge().getNodeA();
                Node source = startEdgeInfo.getEdge().getNodeA();

                Path path = this.getShortPath(source, destination, geoBarriers, restrictField, weighterName,
                        planRoadType);

                if (path == null) {
                    path = this.getShortPath(source, destination, geoBarriers, restrictField, weighterName,
                            planRoadType);
                    if (path != null) {

                    } else {
                        path = this.getShortPath(source, destination, geoBarriers, restrictField, weighterName,
                                planRoadType);
                    }
                }
                DriveBookInfo info = getTowPointPath(path, false, startEdgeInfo, endEdgeInfo, restrictField, locale);

                route.setExpend(info.getRoutes());
                info.clearRoutesPoint();
                // 设置长度
                double rLength = info.getRoutes().getLength();
                if (BigDecimal.valueOf(rLength).compareTo(BigDecimal.valueOf(0.0)) == 0) {
                    rLength = disBetweenTowPoints(originPoint, destinationPoint);
                }
                route.setLength(rLength);

                driveBookInfos[index] = route;
                if (path != null) {
                    table.put(key, route);
                }

            } catch (Exception e) {
                route.setExpend(new Routes());
                // 设置长度
                route.setLength(disBetweenTowPoints(originPoint, destinationPoint));
                driveBookInfos[index] = route;
                LOGGER.error(e);

            } finally {
                s.release();
            }
            /*
             * } }).start();
             */
        }
        s.acquire(tempsStrings.length - 1);

        return driveBookInfos;
    }

    /*
     * 
     * @param originPoint 起点
     * 
     * @param destinationPoint 终点
     * 
     * @param geoBarriers 障碍点
     * 
     * @param restrictField 通行方式：car 和 walk,默认car
     * 
     * @param weighterName 数据库权重字段，默认 length
     * 
     * @param planRoadType 计算类型：最短时间 1，最短距离 2，避开高速 3
     * 
     * @param isLevel 是否分级，默认false
     * 
     * @param locale 语言，默认zh_CN
     * 
     * @return
     * 
     * @throws ParseException
     */
    private DriveBookInfo getShortDistancePath(Point originPoint, Point destinationPoint, Geometry[] geoBarriers,
            String restrictField, String weighterName, String planRoadType, boolean isLevel, Locale locale) {
        EdgeInfo startEdgeInfo = getNearestEdgeInfo(originPoint,geoBarriers,restrictField,planRoadType);
        EdgeInfo endEdgeInfo = getNearestEdgeInfo(destinationPoint,geoBarriers,restrictField,planRoadType);
        
        if (startEdgeInfo.getEdge() == null) {
            return this.getRouteTransform(null, null);
        }
        
        if (endEdgeInfo.getEdge() == null) {
            return this.getRouteTransform(null, null);
        }
        
        Node source = ((DirectedEdge) startEdgeInfo.getEdge()).getInNode();
        Node destination = ((DirectedEdge) endEdgeInfo.getEdge()).getOutNode();

        Path path = this.getShortPath(source, destination, geoBarriers, restrictField, weighterName, planRoadType);

        return this.getTowPointPath(path, isLevel, startEdgeInfo, endEdgeInfo, restrictField, locale);
    }

    /*
     * 
     * @param source 起点
     * 
     * @param destination 终点
     * 
     * @param geoBarriers 障碍点
     * 
     * @param restrictField 通行方式：car 和 walk,默认car
     * 
     * @param weighterName 数据库权重字段，默认 length
     * 
     * @param planRoadType 计算类型：最短时间 1，最短距离 2，避开高速 3
     * 
     * @return
     */
    private Path getShortPath(Node source, Node destination, Geometry[] geoBarriers, String restrictField,
            String weighterName, String planRoadType) {
        return this.getPathByAstar(destination, source, geoBarriers, restrictField, weighterName, planRoadType);
    }

    /**
     * 
     * @param routeGeo
     * @param routes
     * @return
     */
    @SuppressWarnings("deprecation")
    private DriveBookInfo getRouteTransform(Geometry routeGeo, Routes routes) {
        routeGeo = routeGeo == null ? new com.vividsolutions.jts.geom.MultiLineString(new LineString[] {},
                new PrecisionModel(), 4326) : routeGeo;
        routes = routes == null ? new Routes() : routes;
        routes.setStartPoint(NetposaHelper.geomoterJson(this.startPoint));
        routes.setEndPoint(NetposaHelper.geomoterJson(this.endPoint));
        DriveBookInfo driveBookInfo = new DriveBookInfo(isMutileRoute);
        driveBookInfo.setRoutes(routes);
        return driveBookInfo;
    }
    // 获取点到拓扑中最近边的垂足及距离
    private EdgeInfo getNearestEdgeInfo(Point point,Geometry[] geoBarriers,
                                        String restrictField,String planRoadType) {
        EdgeInfo edgeInfo = new EdgeInfo();
    
        double dist = 0;
        Coordinate vertailCoordinate = null;
        DirectedEdge nearestEdge = null;
    
        for (Object o : networkGraph.getEdges()) {
            DirectedEdge directedEdge = (DirectedEdge) o;
            SimpleFeature feature = (SimpleFeature) directedEdge.getObject();
            int highspeed = (Integer) feature.getAttribute("highspeed");
            int restrict = (Integer)feature.getAttribute(restrictField);
            Geometry geom = (Geometry) feature.getDefaultGeometry();
            //  障碍点
            if(geoBarriers != null && geoBarriers.length != 0){
                for (int i = 0; i < geoBarriers.length; i++) {
                    if (geom.intersects(geoBarriers[i])) {
                         continue;
                    }
                }
            }
            if ("3".equals(planRoadType) && highspeed == 1) {
                continue;
            }
            if(restrict != 1){
                continue;
            }
            JSONObject vertailInfo = this.getVertailInfo(point, directedEdge);
            double distTemp = vertailInfo.getDoubleValue("dist");
            Coordinate vertailCoordinateTemp = (Coordinate) vertailInfo.get("vertail");
        
            if (vertailCoordinate == null || distTemp < dist) {
                dist = distTemp;
                vertailCoordinate = vertailCoordinateTemp;
                nearestEdge = directedEdge;
            }
        }
    
        edgeInfo.setVertailPoint(vertailCoordinate);
        edgeInfo.setEdge(nearestEdge);
    
        return edgeInfo;
    }
    // 获取点到拓扑中最近边的垂足及距离
    private EdgeInfo getNearestEdgeInfo(Point point) {
        EdgeInfo edgeInfo = new EdgeInfo();

        double dist = 0;
        Coordinate vertailCoordinate = null;
        DirectedEdge nearestEdge = null;

        for (Object o : networkGraph.getEdges()) {
            DirectedEdge directedEdge = (DirectedEdge) o;

            JSONObject vertailInfo = this.getVertailInfo(point, directedEdge);
            double distTemp = vertailInfo.getDoubleValue("dist");
            Coordinate vertailCoordinateTemp = (Coordinate) vertailInfo.get("vertail");

            if (vertailCoordinate == null || distTemp < dist) {
                dist = distTemp;
                vertailCoordinate = vertailCoordinateTemp;
                nearestEdge = directedEdge;
            }
        }

        edgeInfo.setVertailPoint(vertailCoordinate);
        edgeInfo.setEdge(nearestEdge);

        return edgeInfo;
    }
    
    // 获取点到边的垂足及距离
    private JSONObject getVertailInfo(Point point, DirectedEdge directedEdge) {
        JSONObject info = new JSONObject();

        double dist = 0;
        Coordinate vertailCoordinate = null;

        SimpleFeature feature = (SimpleFeature) directedEdge.getObject();
        Geometry geom = (Geometry) feature.getDefaultGeometry();
        Coordinate[] cs = geom.getCoordinates();

        for (int i = 0, length = cs.length; i < length - 1; i++) {
            Coordinate coordinateTemp = findShortPointInLine(point, cs[i].x, cs[i].y, cs[i + 1].x, cs[i + 1].y);
            double distTemp = calculateEuclideanDistance(point.getX(), point.getY(), coordinateTemp.x, coordinateTemp.y);

            if (vertailCoordinate == null || distTemp < dist) {
                dist = distTemp;
                vertailCoordinate = coordinateTemp;
            }
        }

        info.put("dist", dist);
        info.put("vertail", vertailCoordinate);

        return info;
    }

    /*
     * 
     * @param path 路径规划结果
     * 
     * @param isLevel 是否分级，默认false
     * 
     * @param startEdgeInfo 起点最近的EdgeInfo 对象实例
     * 
     * @param endEdgeInfo 终点最近的EdgeInfo 对象实例
     * 
     * @param restrictField 通行方式：car 和 walk,默认car
     * 
     * @param locale 语言，默认zh_CN
     * 
     * @return
     */
    @SuppressWarnings("unchecked")
    private DriveBookInfo getTowPointPath(Path path, Boolean isLevel, EdgeInfo startEdgeInfo, EdgeInfo endEdgeInfo,
            String restrictField, Locale locale) {
        if (path == null) {
            return this.getRouteTransform(null, null);
        }
        
        Node startNode = path.getFirst();
        Node endNode = path.getLast();
        
        DirectedEdge startEdge = (DirectedEdge) startEdgeInfo.getEdge();
        Node startEdgeInNode = startEdge.getInNode();
        Node startEdgeOutNode = startEdge.getOutNode();
        
        DirectedEdge endEdge = (DirectedEdge) endEdgeInfo.getEdge();
        Node endEdgeInNode = endEdge.getInNode();
        Node endEdgeOutNode = endEdge.getOutNode();
        
        if (!isLevel) {
            // 裁剪路径中 startEdge
            if (startNode.equals(startEdgeInNode) && path.contains(startEdgeOutNode)) {
                path.remove(startEdgeInNode);
                Node firstNode = path.getFirst();
                while (!firstNode.equals(startEdgeOutNode)) {
                    path.remove(firstNode);
                    firstNode = path.getFirst();
                }
                startNode = startEdgeOutNode;
            }

            // 裁剪路径中 endEdge
            if (endNode.equals(endEdgeOutNode) && path.contains(endEdgeInNode)) {
                path.remove(endEdgeOutNode);
                Node lastNode = path.getLast();
                while (!lastNode.equals(endEdgeInNode)) {
                    path.remove(lastNode);
                    lastNode = path.getLast();
                }
                endNode = endEdgeInNode;
            }
        }

        java.util.List<Edge> edgeList = path.getEdges();

        Routes routes = this.getNavigateInfoByRoutes(startEdgeInfo, endEdgeInfo, startNode, endNode, edgeList,
                restrictField, locale);
        
        Point startPoint = geometryFactory.createPoint(startEdgeInfo.getVertailPoint());
        routes.setStartPoint(NetposaHelper.geomoterJson(startPoint));
        
        Point endPoint = geometryFactory.createPoint(endEdgeInfo.getVertailPoint());
        routes.setEndPoint(NetposaHelper.geomoterJson(endPoint));
        
        return this.getRouteTransform(null, routes);
    }

    /*
     * AStart 算法
     * 
     * @param startNode 起点
     * 
     * @param endNode 终点
     * 
     * @param geoBarriers 障碍点
     * 
     * @param restrictField 通行方式：car 和 walk,默认car
     * 
     * @param weighterName 数据库权重字段，默认 length
     * 
     * @param planRoadType 计算类型：最短时间 1，最短距离 2，避开高速 3
     * 
     * @return
     */
    private Path getPathByAstar(final Node startNode, Node endNode, final Geometry[] geoBarriers,
            final String restrictField, final String weighterName, final String planRoadType) {
        Path path = null;
        final int barrierCount = geoBarriers.length;

        AStarFunctions asfunc = new AStarFunctions(endNode) {
            @Override
            public double cost(AStarNode n1, AStarNode n2) {
                DirectedNode nd1 = (DirectedNode) n1.getNode();
                DirectedNode nd2 = (DirectedNode) n2.getNode();
                DirectedEdge directedEdge = (DirectedEdge) nd1.getEdge(nd2);
                if (directedEdge != null) {
                    SimpleFeature feature = (SimpleFeature) directedEdge.getObject();

                    Geometry geom = (Geometry) feature.getDefaultGeometry();
                    Double length = Double.parseDouble(feature.getAttribute(weighterName).toString());
                    
                    
                    int highspeed = (Integer) feature.getAttribute("highspeed");
                    int restrict = (Integer) feature.getAttribute(restrictField);
                    Double speed = (Double) feature.getAttribute("speed");
                    if (directedGraph) {
                        Integer direction = (Integer) feature.getAttribute("direction");
                        boolean t = directedEdge.getInNode().equals(nd1) && directedEdge.getOutNode().equals(nd2);

                        if (direction == -1 && !t) {
                            return Double.POSITIVE_INFINITY;
                        }

                        if (direction == 1 && t) {
                            return Double.POSITIVE_INFINITY;
                        }
                    }
                    

                    // 障碍点
                    for (int i = 0; i < barrierCount; i++) {
                        if (geom.intersects(geoBarriers[i])) {
                            return Double.POSITIVE_INFINITY;
                        }
                    }

                    // 避开高速
                    if ("3".equals(planRoadType) && highspeed == 1) {
                        return Double.POSITIVE_INFINITY;
                    }

                    // 通行方式：car 和 walk
                    if (restrict != 1) {
                        return Double.POSITIVE_INFINITY;
                    }
                    // 最短时间
                    if(planRoadType.equalsIgnoreCase("1")){
                        return length / speed;
                    }
                    return length;

                }
    
                Double length = ((Point) n1.getNode().getObject()).distance((Point) n2.getNode().getObject());
                
//                Double speed = (Double) feature.getAttribute("speed");
//                if(planRoadType.equalsIgnoreCase("1")){
//                    return length / speed;
//                }
                return length;
            }

            @Override
            public double h(Node n) {
                return ((Point) n.getObject()).distance((Point) this.getDest().getObject());
            }

        };

        AStarShortestPathFinder finder = new AStarShortestPathFinder(networkGraph, startNode, endNode, asfunc);
        finder.calculate();
        try {
            path = finder.getPath();
        } catch (Exception e) {
            LOGGER.error(e);
        }

        return path;
    }

    /*
     * 计算相同边上的指定线段，只对相同线段有效
     * 
     * @param startEdgeInfo
     * 
     * @param endEdgeInfo
     * 
     * @param startNode
     * 
     * @param endNode
     * 
     * @return
     */
    private Geometry getGeometryByNodeEndge(EdgeInfo startEdgeInfo, EdgeInfo endEdgeInfo, Node startNode, Node endNode) {
        Geometry route = null;
        if (startEdgeInfo.getEdge().getID() == endEdgeInfo.getEdge().getID()) {
            Coordinate[] startCoordinate = getCoordinates(startEdgeInfo.getEdge(), startEdgeInfo.getVertailPoint(),
                    startNode);
            Coordinate[] endCoordinate = getCoordinates(endEdgeInfo.getEdge(), endEdgeInfo.getVertailPoint(), startNode);
            ArrayList<Coordinate> tempCoordinates = new ArrayList<>();
            ArrayList<Coordinate> newCoordinates = new ArrayList<>();
            for (int j = 0; j < startCoordinate.length; j++) {
                for (int i = 0; i < endCoordinate.length; i++) {
                    if (startCoordinate[j].equals(endCoordinate[i])) {
                        tempCoordinates.add(startCoordinate[j]);
                    }
                }
            }
            for (int i = 0; i < startCoordinate.length; i++) {
                boolean isAdd = true;
                for (int j = 0; j < tempCoordinates.size(); j++) {
                    if (tempCoordinates.get(j).equals(startCoordinate[i])) {
                        isAdd = false;
                        break;
                    }
                }
                if (isAdd) {
                    newCoordinates.add(startCoordinate[i]);
                }
            }
            for (int i = endCoordinate.length - 1; i > -1; i--) {
                boolean isAdd = true;
                for (int j = 0; j < tempCoordinates.size(); j++) {
                    if (tempCoordinates.get(j).equals(endCoordinate[i])) {
                        isAdd = false;
                        break;
                    }
                }
                if (isAdd) {
                    newCoordinates.add(endCoordinate[i]);
                }
            }

            Coordinate[] coordinates = (Coordinate[]) newCoordinates.toArray(new Coordinate[0]);
            SimpleFeature feature1 = (SimpleFeature) startEdgeInfo.getEdge().getObject();
            Geometry geom1 = (Geometry) feature1.getDefaultGeometry();
            GeometryFactory geometryFactory = geom1.getFactory();
            LineString line = geometryFactory.createLineString(coordinates);
            LineString[] lines = { line };
            MultiLineString multiline = geometryFactory.createMultiLineString(lines);
            route = multiline;
            return route;
        } else {
            return null;
        }
    }

    private String getDirection(Coordinate[] startFirstCoors, Locale locale) {
        String key = "";
        double tan = (startFirstCoors[1].y - startFirstCoors[0].y) / (startFirstCoors[1].x - startFirstCoors[0].x);
        if ((startFirstCoors[1].y > startFirstCoors[0].y) && (startFirstCoors[1].x > startFirstCoors[0].x)) {
            if (Math.abs(tan) > 1)
                key = "na.north";
            else
                key = "na.east";
        } else if ((startFirstCoors[1].y > startFirstCoors[0].y) && (startFirstCoors[1].x < startFirstCoors[0].x)) {
            if (Math.abs(tan) > 1)
                key = "na.north";
            else
                key = "na.west";
        } else if ((startFirstCoors[1].y > startFirstCoors[0].y) && (startFirstCoors[1].x == startFirstCoors[0].x)) {
            key = "na.north";
        } else if ((startFirstCoors[1].y < startFirstCoors[0].y) && (startFirstCoors[1].x > startFirstCoors[0].x)) {
            if (Math.abs(tan) > 1)
                key = "na.south";
            else
                key = "na.east";
        } else if ((startFirstCoors[1].y < startFirstCoors[0].y) && (startFirstCoors[1].x < startFirstCoors[0].x)) {
            if (Math.abs(tan) > 1)
                key = "na.south";
            else
                key = "na.west";
        } else if ((startFirstCoors[1].y < startFirstCoors[0].y) && (startFirstCoors[1].x == startFirstCoors[0].x)) {
            key = "na.south";
        } else if ((startFirstCoors[1].y == startFirstCoors[0].y) && (startFirstCoors[1].x > startFirstCoors[0].x)) {
            key = "na.east";
        } else if ((startFirstCoors[1].y == startFirstCoors[0].y) && (startFirstCoors[1].x < startFirstCoors[0].x)) {
            key = "na.west";
        }
        return SpringUtil.getMessage(key, locale);
    }

    private String getTurn(Coordinate[] startLastCoors, Coordinate[] lineStartCoors, Locale locale) {
        String key = "";
        double angleX = getAngleByVector(startLastCoors[0].x, startLastCoors[0].y, startLastCoors[1].x,
                startLastCoors[1].y);
        double k = (startLastCoors[1].y - startLastCoors[0].y) / (startLastCoors[1].x - startLastCoors[0].x);
        double b = startLastCoors[0].y - k * startLastCoors[0].x;

        double angle2 = getAngleByVector(lineStartCoors[0].x, lineStartCoors[0].y, lineStartCoors[1].x,
                lineStartCoors[1].y);
        double angleLines = Math.abs(angleX - angle2);
        // 上条路的最后一条线段在朝北方向上即[0,π);
        if (angleX < Math.PI) {
            if (Math.abs(startLastCoors[1].x - startLastCoors[0].x) < 0.00001) {
                if (angleLines > Math.PI / 6) {
                    if (lineStartCoors[1].x - startLastCoors[1].x > 0) {
                        key = "na.youzhuan";
                    } else if (lineStartCoors[1].x - startLastCoors[1].x < 0) {
                        key = "na.zuozhuan";
                    }
                } else {
                    key = "na.zhizoui";
                }
            } else {
                if (Math.abs(k) < 0.1) {
                    if (angleLines > Math.PI / 6) {
                        if (lineStartCoors[1].y - startLastCoors[1].y > 0) {
                            key = "na.zuozhuan";
                        } else if (lineStartCoors[1].y - startLastCoors[1].y < 0) {
                            key = "na.youzhuan";
                        }
                    } else {
                        key = "na.zhizoui";
                    }
                } else if (k > 0.1) {
                    if (angleLines > Math.PI / 6) {
                        if (lineStartCoors[1].y - k * lineStartCoors[1].x - b < 0) {
                            key = "na.youzhuan";
                        } else if (lineStartCoors[1].y - k * lineStartCoors[1].x - b > 0) {
                            key = "na.zuozhuan";
                        }
                    } else {
                        key = "na.zhizoui";
                    }
                } else {
                    if (angleLines > Math.PI / 6) {
                        if (lineStartCoors[1].y - k * lineStartCoors[1].x - b > 0) {
                            key = "na.youzhuan";
                        } else if (lineStartCoors[1].y - k * lineStartCoors[1].x - b < 0) {
                            key = "na.zuozhuan";
                        }
                    } else {
                        key = "na.zhizoui";
                    }
                }
            }
        } else {
            if (Math.abs(startLastCoors[1].x - startLastCoors[0].x) < 0.00001) {
                if (angleLines > Math.PI / 6) {
                    if (lineStartCoors[1].x - startLastCoors[1].x > 0) {
                        key = "na.zuozhuan";
                    } else if (lineStartCoors[1].x - startLastCoors[1].x < 0) {
                        key = "na.youzhuan";
                    }
                } else {
                    key = "na.zhizoui";
                }
            } else {
                if (Math.abs(k) < 0.1) {
                    if (angleLines > Math.PI / 6) {
                        if (lineStartCoors[1].y - startLastCoors[1].y < 0) {
                            key = "na.zuozhuan";
                        } else if (lineStartCoors[1].y - startLastCoors[1].y > 0) {
                            key = "na.youzhuan";
                        }
                    } else {
                        key = "na.zhizoui";
                    }
                } else if (k > 0.1) {
                    if (angleLines > Math.PI / 6) {
                        if (lineStartCoors[1].y - k * lineStartCoors[1].x - b > 0) {
                            key = "na.youzhuan";
                        } else if (lineStartCoors[1].y - k * lineStartCoors[1].x - b < 0) {
                            key = "na.zuozhuan";
                        }
                    } else {
                        key = "na.zhizoui";
                    }
                } else {
                    if (angleLines > Math.PI / 6) {
                        if (lineStartCoors[1].y - k * lineStartCoors[1].x - b < 0) {
                            key = "na.youzhuan";
                        } else if (lineStartCoors[1].y - k * lineStartCoors[1].x - b > 0) {
                            key = "na.zuozhuan";
                        }
                    } else {
                        key = "na.zhizoui";
                    }
                }
            }

        }
        return SpringUtil.getMessage(key, locale);
    }

    /*
     * 计算向量与X轴正方向逆时针夹角（范围在0——2π）
     */
    private double getAngleByVector(double x1, double y1, double x2, double y2) {
        double pi = Math.PI;
        double length = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));// 向量长度；
        double cosx = (x2 - x1) / length;
        if (Math.abs(cosx) < 0.05)
            cosx = 0;
        if (Math.abs(cosx) > 0.95) {
            if (cosx > 0)
                cosx = 1;
            if (cosx < 0)
                cosx = -1;
        }
        double cosy = (y2 - y1) / length;
        if (Math.abs(cosy) < 0.05)
            cosy = 0;
        if (Math.abs(cosy) > 0.95) {
            if (cosy > 0)
                cosy = 1;
            if (cosy < 0)
                cosy = -1;
        }
        double angleX = Math.acos(cosx);
        double angleY = Math.acos(cosy);
        if (angleY > pi / 2) {
            angleX = 2 * pi - angleX;
        }
        return angleX;
    }

    /*
     * 边edge上，垂足vertailPoint到node的点串
     * 
     * @param edge
     * @param vertailPoint
     * @param node
     * @return
     */
    private Coordinate[] getCoordinates(Edge edge, Coordinate vertailPoint, Node node) {
        SimpleFeature startfeature = (SimpleFeature) edge.getObject();
        Geometry sgeom = (Geometry) startfeature.getDefaultGeometry();
        Coordinate[] coordinates = sgeom.getCoordinates();

        Point tempP = (Point) node.getObject();
        Coordinate[] tempCoordinates = new Coordinate[coordinates.length + 1];
        int count = 0;
        if (coordinates[0].x == tempP.getX() && coordinates[0].y == tempP.getY()) {
            for (int i = 0; i < coordinates.length - 1; i++) {
                tempCoordinates[i] = coordinates[i];
                count++;
                if ((Math.abs(coordinates[i].x - vertailPoint.x) < 0.000001)
                        && (Math.abs(coordinates[i].y - vertailPoint.y) < 0.000001)) {
                    break;
                }
                double d = (coordinates[i + 1].x - coordinates[i].x) / (coordinates[i + 1].y - coordinates[i].y)
                        - (vertailPoint.x - coordinates[i].x) / (vertailPoint.y - coordinates[i].y);
                if (Math.abs(d) < 0.0001) {
                    tempCoordinates[i + 1] = vertailPoint;
                    count++;
                    break;
                }
            }
        }
        if (coordinates[coordinates.length - 1].x == tempP.getX()
                && coordinates[coordinates.length - 1].y == tempP.getY()) {
            for (int i = coordinates.length - 1; i > 0; i--) {
                tempCoordinates[coordinates.length - 1 - i] = coordinates[i];
                count++;
                if ((Math.abs(coordinates[i].x - vertailPoint.x) < 0.000001)
                        && (Math.abs(coordinates[i].y - vertailPoint.y) < 0.000001)) {
                    tempCoordinates[coordinates.length - i] = vertailPoint;
                    count++;
                    break;
                }
                double d = (coordinates[i - 1].x - coordinates[i].x) / (coordinates[i - 1].y - coordinates[i].y)
                        - (vertailPoint.x - coordinates[i].x) / (vertailPoint.y - coordinates[i].y);
                if (Math.abs(d) < 0.0001) {
                    tempCoordinates[coordinates.length - i] = vertailPoint;
                    count++;
                    break;
                }
            }
        }
        // 2017-01-18 添加,解决结果长度为1的问题
        if (count == 1) {
            tempCoordinates[1] = vertailPoint;
            count++;
        }

        tempCoordinates = getReverseCoordinates(tempCoordinates, count);

        return tempCoordinates;
    }

    private Coordinate[] getReverseCoordinates(Coordinate[] coordinates, int count) {
        Coordinate[] coordinateTemp = new Coordinate[count];
        int k = 0;
        for (int i = count - 1; i > -1; i--) {
            coordinateTemp[k] = coordinates[i];
            k++;
        }
        return coordinateTemp;
    }

    /*
     * 查找指定点到指定线段上的最短距离点x1,y1,x2,y2代表线段的前后结点的x,y值
     */
    private Coordinate findShortPointInLine(Point p, double x1, double y1, double x2, double y2) {
        double px = p.getCoordinate().x;
        double py = p.getCoordinate().y;
        double a, b, c;
        a = calculateEuclideanDistance(x1, y1, x2, y2);// 线段的长度
        b = calculateEuclideanDistance(x1, y1, px, py);// (x1,y1)到点的距离
        c = calculateEuclideanDistance(x2, y2, px, py);// (x2,y2)到点的距离

        // if (a == b + c) {
        if (Double.valueOf(a).equals(Double.valueOf(b + c))) {
            return new Coordinate(px, py);
        }

        if (a <= 0.000001) {
            return new Coordinate(x1, y1);
        }
        if (c * c >= a * a + b * b) {
            return new Coordinate(x1, y1);
        }
        if (b * b >= a * a + c * c) {
            return new Coordinate(x2, y2);
        } else {
            // 2017-01-19 添加,解决计算结果为 NaN的问题
            // if (x1 == x2) {
            if (Double.valueOf(x1).equals(Double.valueOf(x2))) {
                return new Coordinate(x1, py);
            }

            double k = (y2 - y1) / (x2 - x1);
            double x = (px + (py - y1) * k + k * k * x1) / (k * k + 1);
            double y = k * x - k * x1 + y1;
            return new Coordinate(x, y);
        }
    }

    /*
     * 计算两点之间的距离（平面坐标）
     */
    private double calculateEuclideanDistance(double xOrig, double yOrig, double xDest, double yDest) {
        double distance = Math.sqrt((xDest - xOrig) * (xDest - xOrig) + (yDest - yOrig) * (yDest - yOrig));
        return distance;
    }
    
    private Routes getNavigateInfoByRoutes(EdgeInfo startEdgeInfo, EdgeInfo endEdgeInfo, Node startNode, Node endNode,
            List<Edge> edgeList, String restrictField, Locale locale) {

        Routes routes = new Routes();
        
        Edge startEdge = startEdgeInfo.getEdge();
        Coordinate startVertailPoint = startEdgeInfo.getVertailPoint();

        Edge endEdge = endEdgeInfo.getEdge();
        Coordinate endVertailPoint = endEdgeInfo.getVertailPoint();


        SimpleFeature startfeature = (SimpleFeature) startEdge.getObject();
        Coordinate[] startCoordinates = getCoordinates(startEdge, startVertailPoint,startNode);

        SimpleFeature endfeature = (SimpleFeature) endEdge.getObject();
        Coordinate[] endCoordinates = getCoordinates(endEdge, endVertailPoint, endNode);


        // wj 添加
        if (startCoordinates.length < 2) {
            return routes;
        }

        double roadLen = 0;
        MultiLineString route = null;
        SegmentInfo segment = null;
        double allLength = roadLen;// 总共长度
        double allTime = 0.0;// 总耗时
        StringBuffer messageString = new StringBuffer();// 导航信息
        int id = 0;
        String nextTurnAction = "straight";
        
        //// 起点到path部分处理
        if (startCoordinates.length > 1) {
            // 垂足到path起点的 lineString
            LineString startGeoLine = geometryFactory.createLineString(startCoordinates);
            
            // 垂足到path起点的距离
            roadLen = this.getLengthFromVertailPointToPath(startfeature, startGeoLine);

            LineString[] lines = { startGeoLine };
            route = geometryFactory.createMultiLineString(lines);
        }
        
        allLength += roadLen;
        double speed = this.getSpeedByRestrict(restrictField, startfeature);
        allTime = roadLen / speed / (50.0 / 3);// 将1km/t转换成(50/3)m/min

        Coordinate[] startFirstCoors = new Coordinate[2];// 起始线的第一条线段的坐标
        startFirstCoors[0] = startCoordinates[0];
        startFirstCoors[1] = startCoordinates[1];

        Coordinate[] startLastCoors = new Coordinate[2];// 起始线的最后一条线段的坐标
        startLastCoors[0] = startCoordinates[startCoordinates.length - 2];
        startLastCoors[1] = startCoordinates[startCoordinates.length - 1];
        
        // 导航信息
        String direction = getDirection(startFirstCoors, locale);
        String startRoadName = startfeature.getAttribute("name").toString();
        Object[] kaishiArgs = { startRoadName, direction };
        messageString.append(SpringUtil.getMessage("na.kaishi", kaishiArgs, locale));
        
        // 保存 前一条线段的 最后一个结点
        Coordinate lineLastPoint = startLastCoors[1];
        //// 起点到path部分处理结束
        
        
        
        Edge[] edges1 = new Edge[1];
        Edge[] edges = edgeList.toArray(edges1);
        
        for (int i = 0; i < edges.length; i++) {
            Edge edge = edges[i];
            if (edge == null)
                continue;
            if (edge.equals(startEdge) || edge.equals(endEdge))
                continue;
            SimpleFeature feature = (SimpleFeature) edge.getObject();

            String roadName = feature.getAttribute("name").toString();
            Coordinate[] coordinates = ((Geometry) feature.getDefaultGeometry()).getCoordinates();
            if (!(Math.abs(lineLastPoint.x - coordinates[0].x) == 0 && Math.abs(lineLastPoint.y - coordinates[0].y) == 0)) {
                coordinates = getReverseCoordinates(coordinates, coordinates.length);
            }
            Coordinate[] lineStartCoors = new Coordinate[2];// 边的第一条线段的两个节点坐标
            lineStartCoors[0] = coordinates[0];
            lineStartCoors[1] = coordinates[1];

            Coordinate[] lineEndCoors = new Coordinate[2];// 变的最后一条线段的两个节点坐标
            lineEndCoors[0] = coordinates[coordinates.length - 2];
            lineEndCoors[1] = coordinates[coordinates.length - 1];

            lineLastPoint = coordinates[coordinates.length - 1];// 将当前边的
                                                                // 最后一个结点保存下来

            double lineLen = Double.parseDouble(feature.getAttribute("length").toString());

            
            speed = this.getSpeedByRestrict(restrictField, feature);
            
            allLength += lineLen;
            allTime += lineLen / speed / (50.0 / 3);
            if (startRoadName.equals(roadName)) {
                roadLen = roadLen + lineLen;
                Geometry tempLineString = (Geometry) feature.getDefaultGeometry();

                // route = (MultiLineString) route.union(tempLineString);

                tempLineString = lineToMulti(tempLineString);
                Geometry tempGeo = route.union(tempLineString);
                tempGeo = lineToMulti(tempGeo);
                route = (MultiLineString) tempGeo;
            } else {
                int intLen = (int) roadLen;
                segment = new SegmentInfo();
                segment.setId(id);
                id++;
                startVertailPoint = segment.setRoteGeomtery(route, startVertailPoint);

                Object defaultGeometry = feature.getDefaultGeometry();
                if (defaultGeometry instanceof LineString) {
                    LineString[] lineString = new LineString[1];
                    lineString[0] = (LineString) defaultGeometry;
                    route = geometryFactory.createMultiLineString(lineString);
                } else {
                    route = (MultiLineString) defaultGeometry;
                }

                messageString.append(this.getTravelsNavInfo(intLen, locale));

                roadLen = lineLen;

                segment.setStrguide(messageString.toString());
     
                messageString.setLength(0);
                String turn = "";
                turn = getTurn(startLastCoors, lineStartCoors, locale);
                segment.setTurnAction(nextTurnAction);
                switch (turn) {
                case "左转":
                    nextTurnAction = "left";
                    break;
                case "右转":
                    nextTurnAction = "right";
                    break;
                case "直走":
                    nextTurnAction = "straight";
                    break;
                case "Turn left":
                    nextTurnAction = "left";
                    break;
                case "Turn right":
                    nextTurnAction = "right";
                    break;
                case "Go straight":
                    nextTurnAction = "straight";
                    break;
                default:
                    break;
                }

                messageString.append(this.getTurnNavInfo(turn, roadName, locale));
                
                routes.getSegments().add(segment);
            }
            startLastCoors = lineEndCoors;
            startRoadName = roadName;
        }

        segment = new SegmentInfo();
        segment.setId(id);
        id++;
        double len2 = 0;
        LineString endGeoLine = null;
        if (endCoordinates.length > 1) {
            endCoordinates = getReverseCoordinates(endCoordinates, endCoordinates.length);
            endGeoLine = geometryFactory.createLineString(endCoordinates);
            double endLength = ((Geometry) endfeature.getDefaultGeometry()).getLength();
            if (endfeature.getAttribute("length") != null) {
                endLength = Double.parseDouble(endfeature.getAttribute("length").toString());
            }
            len2 = endGeoLine.getLength() / ((Geometry) endfeature.getDefaultGeometry()).getLength() * endLength;
        } else {
            // 2016-11-21 添加，解决当路网数据不全时引起路径分析总长度为 0 的问题
            routes.setLength(allLength);
            return routes;
        }

        String endRoadName = endfeature.getAttribute("name").toString();
        
        speed = this.getSpeedByRestrict(restrictField, endfeature);
        
        allLength += len2;
        allTime += len2 / speed / (50.0 / 3);
        if (endRoadName.equals(startRoadName))// 如果路的名称相同
        {
            roadLen += len2;
            
            messageString.append(this.getTravelsNavInfo((int) roadLen, locale))
                .append(SpringUtil.getMessage("na.zhongzhi", locale));
            
            segment.setStrguide(messageString.toString());
            segment.setId(id);
            if (startEdge.getID() == endEdge.getID())// 在一条边上
            {
                route = (MultiLineString) getGeometryByNodeEndge(startEdgeInfo, endEdgeInfo, startNode, endNode);
            } else {
                LineString[] lineStrings = { endGeoLine };
                MultiLineString endMultiLineString = geometryFactory.createMultiLineString(lineStrings);

                Geometry tempGeo = route.union(endMultiLineString);
                tempGeo = lineToMulti(tempGeo);
                route = (MultiLineString) tempGeo;
            }

            startVertailPoint = segment.setRoteGeomtery(route, startVertailPoint);

            segment.setTurnAction(nextTurnAction);
            routes.getSegments().add(segment);
        } else {
            segment.setTurnAction(nextTurnAction);

            messageString.append(this.getTravelsNavInfo((int) roadLen, locale));

            segment.setStrguide(messageString.toString());
            startVertailPoint = segment.setRoteGeomtery(route, startVertailPoint);

            routes.getSegments().add(segment);
            roadLen = len2;
            Coordinate[] lastFirstCoors = new Coordinate[2];// 起始线的第一条线段的坐标
            lastFirstCoors[0] = endCoordinates[0];
            lastFirstCoors[1] = endCoordinates[1];
            
            messageString.setLength(0);
            
            segment = new SegmentInfo();
            String turn = "";
            turn = getTurn(startLastCoors, lastFirstCoors, locale);
            switch (turn) {
            case "左转":
                segment.setTurnAction("left");
                break;
            case "右转":
                segment.setTurnAction("right");
                break;
            case "直走":
                segment.setTurnAction("straight");
                break;
            case "Turn left":
                nextTurnAction = "left";
                break;
            case "Turn right":
                nextTurnAction = "right";
                break;
            case "Go straight":
                nextTurnAction = "straight";
            default:
                break;
            }
            
            messageString.append(this.getTurnNavInfo(turn, endRoadName, locale))
                .append(this.getTravelsNavInfo((int) len2, locale))
                .append(SpringUtil.getMessage("na.zhongzhi", locale));

            segment.setStrguide(messageString.toString());

            segment.setId(id);
            LineString[] lineStrings = { endGeoLine };
            MultiLineString endMultiLineString = geometryFactory.createMultiLineString(lineStrings);

            startVertailPoint = segment.setRoteGeomtery(endMultiLineString, startVertailPoint);

            routes.getSegments().add(segment);
        }

        if (allLength > 1000) {
            allLength = Math.round(allLength * 10) / 10.0;
        } else {
            allLength = Math.round(allLength);
        }
        routes.setLength(allLength);
        int time = (int) Math.ceil(allTime);
        routes.setTime(time);
        routes.setCount(routes.getSegments().size());

        return routes;
    }
    
    // 垂足到 path 起点的距离
    private double getLengthFromVertailPointToPath(SimpleFeature startfeature, LineString startGeoLine) {
        double len = 0d;
        // 起始边的长度
        double startGeoLength = ((Geometry) startfeature.getDefaultGeometry()).getLength();
        // 起始边数据库中的长度
        double startLength = Double.parseDouble(startfeature.getAttribute("length").toString());
        // 垂足到path起点的距离
        len = startGeoLine.getLength() / startGeoLength * startLength;

        return len;
    }
    
    // 根据 restrictField 获取速度
    private double getSpeedByRestrict(String restrictField, SimpleFeature feature) {
        // 默认 walk 速度
        double speed = 6;
        if (!"walk".equals(restrictField)) {
            speed = 20;
            if (feature.getAttribute("speed") != null) {
                speed = Double.parseDouble(feature.getAttribute("speed").toString());
            }
        }
        return speed;
    }
    
    // eg:左转进入大庆路
    private String getTurnNavInfo(String turn, String roadName, Locale locale) {
        Object[] trunObjs = {turn,roadName};
        return SpringUtil.getMessage("na.zhongjian", trunObjs, locale);
    }
    
    // eg:行驶1公里/行驶100米
    private String getTravelsNavInfo(int intLen, Locale locale) {
        Object[] travelsObjs = new Object[2];
        if (intLen >= 1000) {
            travelsObjs[0] = String.format("%.1f", intLen / 1000.0);
            travelsObjs[1] = SpringUtil.getMessage("na.km", locale);
        } else {
            travelsObjs[0] = intLen;
            travelsObjs[1] = SpringUtil.getMessage("na.m", locale);
        }
        return SpringUtil.getMessage("na.xingshi", travelsObjs, locale);
    }

    /**
     * Geometry LineString 转 MultiLineString
     * 
     * @param geo
     * @return
     */
    private Geometry lineToMulti(Geometry geo) {
        String geoType = geo.getGeometryType();
        if (!("MultiLineString".equals(geoType))) {
            LineString[] lineString = new LineString[1];
            lineString[0] = (LineString) geo;
            geo = geometryFactory.createMultiLineString(lineString);
        }
        return geo;
    }
    
    /*
     * 两点之间的距离
     * 
     * @param point1
     * @param point2
     * @return
     * @throws TransformException
     * @throws FactoryException
     * @throws MismatchedDimensionException
     */
    private double disBetweenTowPoints(Point point1, Point point2) {
        double x1 = this.xToMercator(point1.getX());
        double y1 = this.yToMercator(point1.getY());

        double x2 = this.xToMercator(point2.getX());
        double y2 = this.yToMercator(point2.getY());

        double length = Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2));

        return length;
    }

    /*
     * wgs 84 经度站墨卡托
     * 
     * @param x
     * @return
     */
    private double xToMercator(double x) {
        return (x / 180.0) * 20037508.34;
    }

    /*
     * wgs 84 纬度站墨卡托
     * 
     * @param x
     * @return
     */
    private double yToMercator(double y) {
        double ny = 0.0;
        if (y > 85.05112) {
            ny = 85.05112;
        }

        if (y < -85.05112) {
            ny = -85.05112;
        }

        double cy = (Math.PI / 180.0) * ny;
        double tmp = Math.PI / 4.0 + cy / 2.0;
        return 20037508.34 * Math.log(Math.tan(tmp)) / Math.PI;
    }
    
    
    // getNavigateInfoByRoutes 备份
    /*private Routes getNavigateInfoByRoutes(EdgeInfo startEdgeInfo, EdgeInfo endEdgeInfo, Node startNode, Node endNode,
            java.util.List<Edge> edgeList, String restrictField, Locale locale) {

        Routes routes = new Routes();

        SimpleFeature startfeature = (SimpleFeature) startEdgeInfo.getEdge().getObject();

        //GeometryFactory geometryFactory = ((Geometry) startfeature.getDefaultGeometry()).getFactory();

        Coordinate[] startCoordinates = getCoordinates(startEdgeInfo.getEdge(), startEdgeInfo.getVertailPoint(),
                startNode);
        // wj 添加
        if (startCoordinates.length < 2) {
            return routes;
        }

        Coordinate startPointCoordinate = startEdgeInfo.getVertailPoint();

        double len = 0;
        MultiLineString route = null;
        if (startCoordinates.length > 1) {

            // 垂足到path起点的 lineString
            LineString startGeoLine = geometryFactory.createLineString(startCoordinates);

            // 起始边的长度
            double startGeoLength = ((Geometry) startfeature.getDefaultGeometry()).getLength();
            len = startGeoLength;// 0D

            // 起始边数据库中的长度
            Object startLengthObj = startfeature.getAttribute("length");
            startLengthObj = startLengthObj == null ? "0" : startLengthObj;
            double startLength = Double.parseDouble(startLengthObj.toString());

            // 垂足到path起点的距离
            len = startGeoLine.getLength() / startGeoLength * startLength;

            LineString[] lines = { startGeoLine };
            route = geometryFactory.createMultiLineString(lines);
        }

        String startRoadName = "";
        if (startfeature.getAttribute("name") != null)
            startRoadName = startfeature.getAttribute("name").toString();
        double speed = 30;
        if (restrictField.equals("walk")) {
            speed = 6;
        } else {
            speed = 20;
            if (startfeature.getAttribute("speed") != null) {
                speed = Double.parseDouble(startfeature.getAttribute("speed").toString());
            }
        }

        Coordinate[] startFirstCoors = new Coordinate[2];// 起始线的第一条线段的坐标
        startFirstCoors[0] = startCoordinates[0];
        startFirstCoors[1] = startCoordinates[1];

        Coordinate[] startLastCoors = new Coordinate[2];// 起始线的最后一条线段的坐标
        startLastCoors[0] = startCoordinates[startCoordinates.length - 2];
        startLastCoors[1] = startCoordinates[startCoordinates.length - 1];

        SegmentInfo segment = null;
        double allLength = len;
        double allTime = 0.0;
        String messageString = "";
        String direction = getDirection(startFirstCoors, locale);

        // messageString = "从起点出发沿" + startRoadName + "向" + direction;

        Object[] kaishiArgs = new Object[2];
        kaishiArgs[0] = startRoadName;
        kaishiArgs[1] = direction;
        messageString = SpringUtil.getMessage("na.kaishi", kaishiArgs, locale);

        Edge[] edges1 = new Edge[1];

        Edge[] edges = edgeList.toArray(edges1);
        double roadLen = len;
        allTime = len / speed / (50.0 / 3);// 将1km/t转换成(50/3)m/min
        // 保存 前一条线段的 最后一个结点
        Coordinate lineLastPoint = new Coordinate();
        lineLastPoint = startLastCoors[1];
        int id = 0;
        String nextTurnAction = "straight";
        for (int i = 0; i < edges.length; i++) {
            Edge edge = edges[i];
            if (edge == null)
                continue;
            if (edge.equals(startEdgeInfo.getEdge()) || edge.equals(endEdgeInfo.getEdge()))
                continue;
            SimpleFeature feature = (SimpleFeature) edge.getObject();
            String roadName = "";
            if (feature.getAttribute("name") != null)
                roadName = feature.getAttribute("name").toString();
            Coordinate[] coordinates = ((Geometry) feature.getDefaultGeometry()).getCoordinates();
            if (!(Math.abs(lineLastPoint.x - coordinates[0].x) == 0 && Math.abs(lineLastPoint.y - coordinates[0].y) == 0)) {
                coordinates = getReverseCoordinates(coordinates, coordinates.length);
            }
            Coordinate[] lineStartCoors = new Coordinate[2];// 边的第一条线段的两个节点坐标
            lineStartCoors[0] = coordinates[0];
            lineStartCoors[1] = coordinates[1];

            Coordinate[] lineEndCoors = new Coordinate[2];// 变的最后一条线段的两个节点坐标
            lineEndCoors[0] = coordinates[coordinates.length - 2];
            lineEndCoors[1] = coordinates[coordinates.length - 1];

            lineLastPoint = coordinates[coordinates.length - 1];// 将当前边的
                                                                // 最后一个结点保存下来

            double lineLen = ((Geometry) feature.getDefaultGeometry()).getLength();

            if (feature.getAttribute("length") != null) {
                lineLen = Double.parseDouble(feature.getAttribute("length").toString());
            }
            if (restrictField.equals("walk"))
                speed = 6;
            else {
                speed = 20;
                if (feature.getAttribute("speed") != null) {
                    speed = Double.parseDouble(feature.getAttribute("speed").toString());
                }
            }
            allLength += lineLen;
            allTime += lineLen / speed / (50.0 / 3);
            if (startRoadName.equals(roadName)) {
                roadLen = roadLen + lineLen;
                Geometry tempLineString = (Geometry) feature.getDefaultGeometry();

                // route = (MultiLineString) route.union(tempLineString);

                tempLineString = lineToMulti(tempLineString);
                Geometry tempGeo = route.union(tempLineString);
                tempGeo = lineToMulti(tempGeo);
                route = (MultiLineString) tempGeo;
            } else {
                int intLen = (int) roadLen;
                segment = new SegmentInfo();
                segment.setId(id);
                id++;
                startPointCoordinate = segment.setRoteGeomtery(route, startPointCoordinate);

                Object defaultGeometry = feature.getDefaultGeometry();
                if (defaultGeometry instanceof LineString) {
                    LineString[] lineString = new LineString[1];
                    lineString[0] = (LineString) defaultGeometry;
                    route = geometryFactory.createMultiLineString(lineString);
                } else {
                    route = (MultiLineString) defaultGeometry;
                }

                Object[] xingshiArgs = new Object[2];
                if (intLen >= 1000) {
                    // messageString += "行驶" + (String.format("%.1f", intLen /
                    // 1000.0)) + "公里";
                    xingshiArgs[0] = String.format("%.1f", intLen / 1000.0);
                    xingshiArgs[1] = SpringUtil.getMessage("na.km", locale);
                } else {
                    // messageString += "行驶" + intLen + "米";
                    xingshiArgs[0] = intLen;
                    xingshiArgs[1] = SpringUtil.getMessage("na.m", locale);
                }

                messageString += SpringUtil.getMessage("na.xingshi", xingshiArgs, locale);

                roadLen = lineLen;
                segment.setStrguide(messageString);
                messageString = "";
                String turn = "";
                turn = getTurn(startLastCoors, lineStartCoors, locale);
                segment.setTurnAction(nextTurnAction);
                switch (turn) {
                case "左转":
                    nextTurnAction = "left";
                    break;
                case "右转":
                    nextTurnAction = "right";
                    break;
                case "直走":
                    nextTurnAction = "straight";
                    break;
                case "Turn left":
                    nextTurnAction = "left";
                    break;
                case "Turn right":
                    nextTurnAction = "right";
                    break;
                case "Go straight":
                    nextTurnAction = "straight";
                    break;
                default:
                    break;
                }

                // messageString = turn;
                Object[] zhongjianArgs = new Object[2];
                zhongjianArgs[0] = turn;

                if (!roadName.equals("")) {
                    // messageString += "进入" + roadName;
                    zhongjianArgs[1] = roadName;
                    messageString += SpringUtil.getMessage("na.zhongjian", zhongjianArgs, locale);
                }
                routes.getSegments().add(segment);
            }
            startLastCoors = lineEndCoors;
            startRoadName = roadName;
        }

        segment = new SegmentInfo();
        segment.setId(id);
        id++;
        SimpleFeature endfeature = (SimpleFeature) endEdgeInfo.getEdge().getObject();
        Coordinate[] endCoordinates = getCoordinates(endEdgeInfo.getEdge(), endEdgeInfo.getVertailPoint(), endNode);
        double len2 = 0;
        LineString endGeoLine = null;
        if (endCoordinates.length > 1) {
            endCoordinates = getReverseCoordinates(endCoordinates, endCoordinates.length);
            endGeoLine = geometryFactory.createLineString(endCoordinates);
            double endLength = ((Geometry) endfeature.getDefaultGeometry()).getLength();
            if (endfeature.getAttribute("length") != null) {
                endLength = Double.parseDouble(endfeature.getAttribute("length").toString());
            }
            len2 = endGeoLine.getLength() / ((Geometry) endfeature.getDefaultGeometry()).getLength() * endLength;
        } else {
            // 2016-11-21 添加，解决当路网数据不全时引起路径分析总长度为 0 的问题
            routes.setLength(allLength);
            return routes;
        }
        String endRoadName = "";
        if (endfeature.getAttribute("name") != null)
            endRoadName = endfeature.getAttribute("name").toString();
        if (restrictField.equals("walk"))
            speed = 6;
        else {
            speed = 20;
            if (endfeature.getAttribute("speed") != null) {
                speed = Double.parseDouble(endfeature.getAttribute("speed").toString());
            }
        }
        allLength += len2;
        allTime += len2 / speed / (50.0 / 3);
        if (endRoadName.equals(startRoadName))// 如果路的名称相同
        {
            roadLen += len2;
            int intLen = (int) roadLen;

            Object[] xingshiArgs2 = new Object[2];
            if (intLen > 1000) {
                // messageString += "行驶" + (String.format("%.1f", intLen /
                // 1000.0)) + "公里,到达终点";

                xingshiArgs2[0] = String.format("%.1f", intLen / 1000.0);
                xingshiArgs2[1] = SpringUtil.getMessage("na.km", locale);

            } else {
                // messageString += "行驶" + intLen + "米,到达终点";

                xingshiArgs2[0] = intLen;
                xingshiArgs2[1] = SpringUtil.getMessage("na.m", locale);
            }

            // messageString += SpringUtil.getMessage("na.xingshi2",
            // xingshiArgs2, locale);
            messageString += SpringUtil.getMessage("na.xingshi", xingshiArgs2, locale)
                    + SpringUtil.getMessage("na.zhongzhi", locale);

            segment.setStrguide(messageString);
            segment.setId(id);
            if (startEdgeInfo.getEdge().getID() == endEdgeInfo.getEdge().getID())// 在一条边上
            {
                route = (MultiLineString) getGeometryByNodeEndge(startEdgeInfo, endEdgeInfo, startNode, endNode);
            } else {
                LineString[] lineStrings = { endGeoLine };
                MultiLineString endMultiLineString = geometryFactory.createMultiLineString(lineStrings);

                Geometry tempGeo = route.union(endMultiLineString);
                tempGeo = lineToMulti(tempGeo);
                route = (MultiLineString) tempGeo;

                // route = (MultiLineString) route.union(endMultiLineString);
            }

            startPointCoordinate = segment.setRoteGeomtery(route, startPointCoordinate);

            segment.setTurnAction(nextTurnAction);
            routes.getSegments().add(segment);
        } else {
            segment.setTurnAction(nextTurnAction);
            int intLen = (int) roadLen;

            Object[] xingshiArgs3 = new Object[2];

            if (intLen > 1000) {
                // messageString += "行驶" + (String.format("%.1f", intLen /
                // 1000.0)) + "公里";
                xingshiArgs3[0] = String.format("%.1f", intLen / 1000.0);
                xingshiArgs3[1] = SpringUtil.getMessage("na.km", locale);
            } else {
                // messageString += "行驶" + intLen + "米";
                xingshiArgs3[0] = intLen;
                xingshiArgs3[1] = SpringUtil.getMessage("na.m", locale);
            }

            messageString += SpringUtil.getMessage("na.xingshi", xingshiArgs3, locale);

            segment.setStrguide(messageString);
            startPointCoordinate = segment.setRoteGeomtery(route, startPointCoordinate);

            routes.getSegments().add(segment);
            roadLen = len2;
            Coordinate[] lastFirstCoors = new Coordinate[2];// 起始线的第一条线段的坐标
            lastFirstCoors[0] = endCoordinates[0];
            lastFirstCoors[1] = endCoordinates[1];
            messageString = "";
            segment = new SegmentInfo();
            String turn = "";
            turn = getTurn(startLastCoors, lastFirstCoors, locale);
            switch (turn) {
            case "左转":
                segment.setTurnAction("left");
                break;
            case "右转":
                segment.setTurnAction("right");
                break;
            case "直走":
                segment.setTurnAction("straight");
                break;
            case "Turn left":
                nextTurnAction = "left";
                break;
            case "Turn right":
                nextTurnAction = "right";
                break;
            case "Go straight":
                nextTurnAction = "straight";
            default:
                break;
            }
            // messageString += turn;

            Object[] zhongjianArgs2 = new Object[2];
            zhongjianArgs2[0] = turn;

            if (!endRoadName.equals("")) {
                // messageString += "进入" + endRoadName;
                zhongjianArgs2[1] = endRoadName;
            }

            messageString += SpringUtil.getMessage("na.zhongjian", zhongjianArgs2, locale);

            Object[] xingshiArgs4 = new Object[2];

            intLen = (int) len2;
            if (intLen > 1000) {
                // messageString += "行驶" + (String.format("%.1f", intLen /
                // 1000.0)) + "公里,到达终点";
                xingshiArgs4[0] = String.format("%.1f", intLen / 1000.0);
                xingshiArgs4[1] = SpringUtil.getMessage("na.km", locale);
            } else {
                // messageString += "行驶" + intLen + "米,到达终点";
                xingshiArgs4[0] = intLen;
                xingshiArgs4[1] = SpringUtil.getMessage("na.m", locale);
            }
            // messageString += SpringUtil.getMessage("na.xingshi2",
            // xingshiArgs4, locale);
            messageString += SpringUtil.getMessage("na.xingshi", xingshiArgs4, locale)
                    + SpringUtil.getMessage("na.zhongzhi", locale);

            segment.setStrguide(messageString);
            segment.setId(id);
            LineString[] lineStrings = { endGeoLine };
            MultiLineString endMultiLineString = geometryFactory.createMultiLineString(lineStrings);

            startPointCoordinate = segment.setRoteGeomtery(endMultiLineString, startPointCoordinate);

            routes.getSegments().add(segment);
        }

        if (allLength > 1000) {
            allLength = Math.round(allLength * 10) / 10.0;
        } else {
            allLength = Math.round(allLength);
        }
        routes.setLength(allLength);
        int time = (int) Math.ceil(allTime);
        routes.setTime(time);
        routes.setCount(routes.getSegments().size());

        return routes;
    }*/
}