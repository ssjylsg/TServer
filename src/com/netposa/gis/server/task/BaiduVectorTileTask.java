package com.netposa.gis.server.task;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.netposa.gis.server.bean.BaiduVectorTileStyle;
import com.netposa.gis.server.bean.VectorTileParam;
import com.netposa.gis.server.bean.VectorTileStyleCache;
import com.netposa.gis.server.exception.VectorTileException;
import com.netposa.gis.server.utils.VectorTileUtil;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import java.awt.*;
import java.awt.geom.GeneralPath;
import java.awt.image.BufferedImage;
import java.util.regex.Pattern;

public class BaiduVectorTileTask extends VectorTileTask {
    private static final Log LOGGER = LogFactory.getLog(BaiduVectorTileTask.class);
            
    public BaiduVectorTileTask(VectorTileParam param) {
        super();
        this.param = param;
    }

    @Override
    public BufferedImage call() throws Exception {
        this.styleGenerator();

        // 用户自定义比例,默认 1
        double sx = this.customStyle.getSx();
        double sy = this.customStyle.getSy();

        int width = (int) (this.customStyle.getWidth() * sx);
        int height = (int) (this.customStyle.getHeight() * sy);

        // 是否大于指定级别(19)
        boolean precision = this.param.isPrecision();

        // 大于指定级别(19)的情况
        if (precision) {
            int scale = Integer.parseInt(this.param.getScale());

            sx = scale;
            sy = scale;

            // tile 大小
            // width = width / scale;
            // height = height / scale;

            this.calculateOffset();
        }

        BufferedImage image = this.createBufferedImage(width, height, Transparency.OPAQUE);

        try {
            this.g2d = image.createGraphics();
            this.g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            this.g2d.scale(sx, sy);

            JSONObject tileData = this.getTileData(precision);

            this.doDrawTile(tileData, width, height);

        } catch (VectorTileException e) {
            this.drawErrorTile(width, height, "baidu");
        } finally {
            if (this.g2d != null) {
                this.g2d.dispose();
            }
        }

        return image;
    }
    
    @Override
    void styleGenerator() {
        boolean personalise = this.param.isPersonalise();
        String mapStyleBody = this.param.getMapStyleBody();

        String key = VectorTileUtil.keyGenerator(this.param.getServiceName(), mapStyleBody, "default", "default");

        if (personalise && VectorTileStyleCache.containsKey(key)) {
            this.customStyle = (BaiduVectorTileStyle) VectorTileStyleCache.get(key);
        } else {
            try {
                this.customStyle = new BaiduVectorTileStyle(this.param.getCustomScale(), mapStyleBody);
            } catch (VectorTileException e) {
                LOGGER.error(e);
            }

            if (personalise) {
                VectorTileStyleCache.put(key, this.customStyle);
            }
        }
    }

    // 大于指定级别 (19)的情况下计算 位移，重写计算方法
    @Override
    void calculateOffset() {
        // 20级-->2,21级-->4,22级-->8
        int scale = Integer.parseInt(this.param.getScale());

        // offset
        int customX = Integer.parseInt(this.param.getCustomX());
        int customY = Integer.parseInt(this.param.getCustomY());

        int fileX = Integer.parseInt(this.param.getFileX());
        int fileY = Integer.parseInt(this.param.getFileY());

        // 用户自定 tile 大小
        int width = (int) (this.customStyle.getWidth() * this.customStyle.getSx());
        int height = (int) (this.customStyle.getHeight() * this.customStyle.getSy());

        // 余数
        int residueX = customX - fileX * scale;
        int residueY = customY - fileY * scale;

        // y 轴需要转换，因为 y 轴和 tms 规则相反
        int multipleY = 0;
        for (int i = 0; i < scale; i++) {
            if (residueY == scale - (i + 1)) {
                multipleY = i;
                break;
            }
        }
        //

        this.offsetX = residueX * width / scale;
        this.offsetY = multipleY * height / scale;
    }
    
    @Override
    void doDrawTile(JSONObject tileData, int width, int height) throws VectorTileException {
        this.drawBackground(width, height, "baidu");

        // 水系、陆地和建筑物
        JSONObject regionData = tileData.getJSONObject("region");
        // 道路
        JSONObject roadData = tileData.getJSONObject("road");

        // 包含了水系、陆地和建筑物
        this.drawRegion(regionData.getJSONObject("normalRegion"));
        // buildRegion 从18级开始有数据
        this.drawRegion(regionData.getJSONObject("buildRegion"));

        this.drawRoad(roadData.getJSONObject("underGroundRoad"), "");

        // 4K 道路，level 大于 16 级的道路
        this.drawRoad(roadData.getJSONObject("road4K"), "");
        this.drawRegion(roadData.getJSONObject("road4K"));

        // level 小于 17 级的普通道路
        // level 大于 16 级时 normalRoad 节点中 featureType 为 local 的数据认为是
        // highway，（也包含了其它要素如篮球场、足球场、普通道路中线等，这些要素设置样式时按照高速处理）
        if (Integer.parseInt(this.param.getCustomL()) > 16) {
            this.drawRoad(roadData.getJSONObject("normalRoad"), "4K");
        } else {
            this.drawRoad(roadData.getJSONObject("normalRoad"), "");
        }

        this.drawRoad(roadData.getJSONObject("crossoverBridge"), "");
        this.drawRoad(roadData.getJSONObject("ditieRoad"), "");

        this.drawRegion(regionData.getJSONObject("otherRegion"));
    }

    // 绘制 region 节点要素 和 4k道路
    private void drawRegion(JSONObject region) {
        JSONArray polygons = region.getJSONArray("polygons");

        int size = polygons.size();
        for (int i = 0; i < size; i++) {
            JSONObject polygon = polygons.getJSONObject(i);

            String featureType = polygon.getString("featureType");

            if ("water".equals(featureType) && ((BaiduVectorTileStyle) this.customStyle).isWaterVisibility()) {
                this.doDrawRegion(polygon, featureType);
            }

            // 小于18所有的面,包括绿地地和建筑物等
            //if ("land".equals(featureType) && ((BaiduVectorTileStyle) this.customStyle).isLandVisibility()) {
            if ("land".equals(featureType) && ((BaiduVectorTileStyle) this.customStyle).isGreenVisibility()) {
                //this.doDrawRegion(polygon, featureType);
                this.doDrawRegion(polygon, "green");
            }
            
            
            // 大于等于18级建筑物在buildRegion节点中
            //if ("building".equals(featureType) && ((BaiduVectorTileStyle) this.customStyle).isLandVisibility()) {
            if ("building".equals(featureType) && ((BaiduVectorTileStyle) this.customStyle).isGreenVisibility()) {
                //this.doDrawRegion(polygon, "land");
                this.doDrawRegion(polygon, "green");
            }

            // 地铁站和4k道路
            if ("local".equals(featureType)) {
                featureType = "localRoad";
            }
            if ("oRegion".equals(featureType) || "localRoad".equals(featureType) || "highway".equals(featureType)) {
                this.drawRoadRegion(polygon, featureType);
            }
        }
    }

    // 4k 和 地铁站
    private void drawRoadRegion(JSONObject polygon, String featureType) {

        // 地铁站
        if ("oRegion".equals(featureType)) {
            featureType = "subway";
        }
        if ("local".equals(featureType)) {
            featureType = "localRoad";
        }

        this.doDrawRegion(polygon, featureType);
    }

    // 绘制面状要素
    private void doDrawRegion(JSONObject polygon, String featureType) {
        JSONArray points = polygon.getJSONArray("points");
        JSONArray style = (JSONArray) polygon.getJSONArray("styles").get(0);

        GeneralPath polygonGeo = this.polygonGenerator(points);
        this.g2d.setPaint(this.getRegionPaint(style, featureType));
        this.g2d.fill(polygonGeo);
    }

    // 设置面状要素颜色
    private Color getRegionPaint(JSONArray orginStyle, String featureType) {
        return this.colorGenerator(orginStyle, featureType, FILL_KEY);
    }

    // 绘制 road 节点要素
    private void drawRoad(JSONObject road, String type) {
        JSONArray lines = road.getJSONArray("lines");

        int size = lines.size();

        for (int i = 0; i < size; i++) {
        	 
            JSONObject line = lines.getJSONObject(i);
            String featureType = line.getString("featureType");

            if (!"arrow".equals(featureType)) {
                if ("subway_plan".equals(featureType)) {
                    // 规划地铁
                    featureType = "subway";
                }

                // level 大于 16 级时 normalRoad 节点中 featureType 为 local 的数据认为是
                // highway
                if ("local".equals(featureType)) {
                    featureType = "localRoad";
                }
                if ("4K".equals(type) && "localRoad".equals(featureType)) {
                    featureType = "highway";
                }

                try{
                	this.doDrawRoad(line, featureType);
                }catch(Exception ex){
                	System.out.println(ex);
                }
            } else {
                // 道路上的行驶方向箭头
                // this.doDrawArrow(line);
            }
        }
    }

    // 绘制 road 节点要素
    private void doDrawRoad(JSONObject line, String featureType) {
        JSONArray points = line.getJSONArray("points");
        JSONArray styles = line.getJSONArray("styles");

        JSONArray strokeStyle = styles.getJSONArray(0);

        GeneralPath roadGeo = this.lineGenerator(points);
        String biaopai = strokeStyle.getString(1);
        
        if(biaopai.equalsIgnoreCase("biaopai_gaosu1") || biaopai.equalsIgnoreCase("biaopai_gaosu2") || biaopai.equalsIgnoreCase("biaopai_gaosu3")){
        
        	return;
        }
        this.setRoadStyle(strokeStyle, featureType, STROKE_KEY);
        this.g2d.draw(roadGeo);

        if (styles.size() == 2) {
            JSONArray fillStyle = styles.getJSONArray(1);
            this.setRoadStyle(fillStyle, featureType, FILL_KEY);
            this.g2d.draw(roadGeo);
        }
    }
    public static boolean isInteger(String str) {  
        Pattern pattern = Pattern.compile("^[-\\+]?[\\d]*$");  
        return pattern.matcher(str).matches();  
  }
    // 设置 road 节点样式
    private void setRoadStyle(JSONArray orginStyle, String featureType, String cType) {
        Color color = this.getRoadColor(orginStyle, featureType, cType);

        float miterlimit = 10.0f;
        float[] dashArray = null;
        float dashPhase = 0.0f;

        String dashStr = orginStyle.getString(3);
        if (dashStr != null && dashStr.length() != 0 && FILL_KEY.equals(cType)) {
            String[] dashStrArray = dashStr.split(",");
            int size = dashStrArray.length;
            dashArray = new float[size];
            for (int i = 0; i < size; i++) {
                dashArray[i] = Float.parseFloat(dashStrArray[i]);
            }
        }
        if(!isInteger(orginStyle.getString(5))){
        	return;
        }
        int cap = VectorTileUtil.getCapType(orginStyle.getIntValue(5));

        float width = orginStyle.getIntValue(2);

        // 当级别大于指定的最大级别(19)时重新设置边框
        if (this.param.isPrecision() && ("highway".equals(featureType) || "localRoad".equals(featureType))) {
            float scale = Float.parseFloat(this.param.getScale());
            width = width / scale;
        }

        /*
         * if (this.param.isPrecision() && "fill".equals(cType)) { if
         * ("local".equals(featureType) || "highway".equals(featureType)) {
         * float scale = Float.parseFloat(this.param.getScale());
         * 
         * width += (scale * 2 - 2) / scale; } }
         */

        int join = orginStyle.getIntValue(4);

        Stroke stroke = new BasicStroke(width, cap, join, miterlimit, dashArray, dashPhase);

        this.g2d.setStroke(stroke);
        this.g2d.setColor(color);
    }

    // road 节点颜色
    private Color getRoadColor(JSONArray orginStyle, String featureType, String cType) {
        return this.colorGenerator(orginStyle, featureType, cType);
    }
    
    // 生成颜色
    private Color colorGenerator(JSONArray orginStyle, String featureType, String cType) {
        Color color = VectorTileUtil.rgbaStrToColor(orginStyle.getString(1));

        try {
            if (this.customStyle.isFeatureStyleChanged(featureType)) {
                color = VectorTileUtil.hexToAWTColor(this.customStyle.getFeatureColor(featureType, cType), 1);
            }
        } catch (VectorTileException e) {
            return Color.RED;
        }

        return color;
    }

    @Override
    GeneralPath pathGenerator(JSONArray points) {
        int initialCapacity = points.size();

        GeneralPath path = new GeneralPath(GeneralPath.WIND_NON_ZERO, initialCapacity);

        for (int i = 0; i < initialCapacity; i++) {
            JSONArray point = points.getJSONArray(i);

            // 大于指定的最大等级时(19)要设置偏移
            int x = point.getIntValue(0) - this.offsetX;
            int y = point.getIntValue(1) - this.offsetY;
            if (i == 0) {
                path.moveTo(x, y);
                continue;
            }
            path.lineTo(x, y);
        }

        return path;
    }

    // 道路行驶方向箭头
    /*
     * private void doDrawArrow(JSONObject line) throws NoSuchMethodException,
     * SecurityException, IllegalAccessException, IllegalArgumentException,
     * InvocationTargetException { JSONArray points =
     * line.getJSONArray("points"); GeneralPath roadGeo =
     * this.lineGenerator(points);
     * 
     * JSONArray strokeStyle = this.getArrowStyle();
     * 
     * this.setRoadStyle(strokeStyle, "arrow", "stroke");
     * 
     * this.g2d.draw(roadGeo);
     * 
     * JSONArray arrowPts = this.calcArrowPts(points);
     * 
     * JSONArray n = arrowPts.getJSONArray(0); JSONArray s =
     * arrowPts.getJSONArray(1);
     * 
     * JSONArray polygonArray = new JSONArray(); polygonArray.add(0, n);
     * polygonArray.add(1, s); polygonArray.add(2, points.getJSONArray(1));
     * 
     * GeneralPath polygonGeo = this.polygonGenerator(polygonArray);
     * 
     * this.g2d.setPaint(this.getRegionPaint(strokeStyle, "water"));
     * this.g2d.fill(polygonGeo); }
     * 
     * private JSONArray getArrowStyle() { JSONArray strokeStyle = new
     * JSONArray();
     * 
     * strokeStyle.add(0, ""); strokeStyle.add(1, "0,0,0,0.3");
     * strokeStyle.add(2, 1.5); strokeStyle.add(3, ""); strokeStyle.add(4,
     * BasicStroke.JOIN_MITER); strokeStyle.add(5, 1);
     * 
     * return strokeStyle; }
     * 
     * private JSONArray calcArrowPts(JSONArray oPoints) { JSONArray points =
     * new JSONArray();
     * 
     * JSONArray sPoint = oPoints.getJSONArray(0); JSONArray ePoint =
     * oPoints.getJSONArray(1);
     * 
     * // double i = 3.5 * Math.pow(1.5, 8); double i = 0.5 * Math.pow(1.5, 8);
     * 
     * double r = 0.3;
     * 
     * double n = ePoint.getIntValue(1) - sPoint.getIntValue(1); double s =
     * ePoint.getIntValue(0) - sPoint.getIntValue(0);
     * 
     * double o = 1.8 * Math.sqrt(s * s + n * n);
     * 
     * double l = ePoint.getIntValue(0) + s / o * i; double h =
     * ePoint.getIntValue(1) + n / o * i;
     * 
     * double d = Math.atan2(n, s) + Math.PI;
     * 
     * JSONArray f = new JSONArray(); JSONArray v = new JSONArray();
     * 
     * f.add(0, l + i * Math.cos(d - r)); f.add(1, h + i * Math.sin(d - r));
     * 
     * v.add(0, l + i * Math.cos(d + r)); v.add(1, h + i * Math.sin(d + r));
     * 
     * points.add(0, f); points.add(1, v);
     * 
     * return points; }
     */

}
