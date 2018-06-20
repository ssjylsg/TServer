package com.netposa.gis.server.task;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.netposa.gis.server.bean.GaodeVectorTileStyle;
import com.netposa.gis.server.bean.VectorTileParam;
import com.netposa.gis.server.bean.VectorTileStyleCache;
import com.netposa.gis.server.exception.VectorTileException;
import com.netposa.gis.server.utils.VectorTileUtil;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import java.awt.*;
import java.awt.geom.GeneralPath;
import java.awt.image.BufferedImage;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

public class GaodeVectorTileTask extends VectorTileTask {
    private static final Log LOGGER = LogFactory.getLog(GaodeVectorTileTask.class);
    
    /*
     * 要素类型转换，把包含的要素类型统一转换成 人造区域 (manmade) 类型
     * 待转换要素类型：edu 教育体育、public 公共设施、traffic 交通枢纽、scenicSpot 景区、culture 文化、health 医疗卫生、sports 运动场所、business 商业场所、parkingLot 停车场、subway 地铁设施
     */
    private static final Set<String> MANMADE_SET = new HashSet<String>(Arrays.asList("edu", "public", "traffic",
            "scenicSpot", "culture", "health", "sports", "business", "parkingLot"));//subway
    
    /*
     * 要素类型转换，把包含的要素类型统一转换成 普通道路 (localRoad) 类型
     * 待转换要素类型：secondaryRoad、levelThreeRoad、levelFourRoad、other
     */
    private static final Set<String> LOCALROAD_SET = new HashSet<String>(Arrays.asList("secondaryRoad",
            "levelThreeRoad", "levelFourRoad", "other", "roadsBeingBuilt"));
    
    // underPass(地下通道)、overPass(天桥) 转换为 other
    private static final Set<String> OTHER_SET = new HashSet<String>(Arrays.asList("underPass", "overPass"));
    
    
    // fill 是虚线的要素(原始类型)
    private static final Set<String> Fill_DASH_ELEMENTS = new HashSet<String>(Arrays.asList("railway",
            "subwayBeingBuilt", "highSpeedRailway", "underPass", "overPass"));
    
    // 获取样式 key
    private static final String STYLE_KEY = "style";
    // color
    private static final String COLOR_KEY = "color";

    public GaodeVectorTileTask(VectorTileParam param) {
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

        // 是否大于指定级别(18)
        boolean precision = this.param.isPrecision();

        // 大于指定级别(18)的情况
        if (precision) {
            int scale = Integer.parseInt(this.param.getScale());
            sx = scale;
            sy = scale;
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
            this.drawErrorTile(width, height, "gaode");
        } finally {
            if (this.g2d != null) {
                this.g2d.dispose();
            }
        }
        return image;
    }

    // 设置风格样式
    @Override
    void styleGenerator() {
        boolean personalise = this.param.isPersonalise();
        String mapStyleBody = this.param.getMapStyleBody();

        String key = VectorTileUtil.keyGenerator(this.param.getServiceName(), mapStyleBody, "gaode", "default");

        if (personalise && VectorTileStyleCache.containsKey(key)) {
            this.customStyle = (GaodeVectorTileStyle) VectorTileStyleCache.get(key);
        } else {
            try {
                this.customStyle = new GaodeVectorTileStyle(this.param.getCustomScale(), mapStyleBody);
            } catch (VectorTileException e) {
                LOGGER.error(e);
            }

            if (personalise) {
                VectorTileStyleCache.put(key, this.customStyle);
            }
        }
    }

    // 绘制切片
    @Override
    void doDrawTile(JSONObject tileData, int width, int height) throws VectorTileException {
        this.drawBackground(width, height, "gaode");

        JSONObject item = tileData.getJSONObject("region_building_road");

        // 绘制 region
        this.drawRegion(item.getJSONArray("region"));
        // 绘制 building
        this.drawBuilding(item.getJSONArray("building"));
        // 绘制 road
        this.drawRoad(item.getJSONArray("road"));
    }

    // 绘制 building
    private void drawBuilding(JSONArray buildingArr) {
        if (((GaodeVectorTileStyle) this.customStyle).isBuildingVisibility()) {
            this.drawPolygon(buildingArr, "buildings", "type", 2);
        }
    }
    
    // 绘制 region,面要素
    private void drawRegion(JSONArray regionArr) {
        this.drawPolygon(regionArr, "regions", "labels", 0);        
    }
    
    // 绘制 road
    private void drawRoad(JSONArray roadArr) {
        for (int i = 0, ci = roadArr.size(); i < ci; i++) {
            JSONObject roadItem = roadArr.getJSONObject(i);

            // 要素坐标信息
            JSONArray roads = roadItem.getJSONArray("roads");
            // 要素类型
            String featureType = this.getFeatureType(roadItem.getString("labels"));
            // 样式
            JSONArray styles = roadItem.getJSONArray(STYLE_KEY);

            JSONObject param = this.roadParamsGenerator(styles, featureType);
            boolean isFill = param.getBooleanValue("isFill");
            this.doRrawRoad(roads, param.getJSONObject(STROKE_KEY));
            if (isFill) {
                this.doRrawRoad(roads, param.getJSONObject(FILL_KEY));
            }
        }
    }
    
    /*
     * 绘制面要素
     * polygonArr 数据源
     * coordinatesKey 坐标信息key
     * featureTypeKey 要素类型key
     * styleIndex 填充颜色下标
     */
    private void drawPolygon(JSONArray polygonArr, String coordinatesKey, String featureTypeKey, int styleIndex) {
        for (int i = 0, ci = polygonArr.size(); i < ci; i++) {
            JSONObject polygonItem = polygonArr.getJSONObject(i);

            // 要素类型
            String featureType = this.getFeatureType(polygonItem.getString(featureTypeKey));
            // 转换后的类型
            String cFeatureType = this.featureTypeConversions(featureType);
            
            // 是否绘制要素
            if(!this.regionVisibility(cFeatureType)) {
                continue;
            }
            
            // 要素坐标信息
            JSONArray coordinates = polygonItem.getJSONArray(coordinatesKey);
            
            // 样式
            String style = polygonItem.getJSONArray(STYLE_KEY).getString(styleIndex);
            Color fillPaint = this.paintGenerator(style, cFeatureType, FILL_KEY);
            this.g2d.setPaint(fillPaint);
            
            this.drawPolygonSegment(coordinates);
        }
    }
    
    // 是否绘制 water、green、manmade 要素
    private boolean regionVisibility(String cFeatureType) {
        boolean visibility = true;
        GaodeVectorTileStyle style = (GaodeVectorTileStyle) this.customStyle;

        if ("water".equals(cFeatureType) && !style.isWaterVisibility()) {
            visibility = false;
        } else if ("green".equals(cFeatureType) && !style.isGreenVisibility()) {
            visibility = false;
        } else if ("manmade".equals(cFeatureType) && !style.isManmadeVisibility()) {
            visibility = false;
        }
        return visibility;
    }
    
    /*
     * 面要素画笔颜色
     * style 颜色信息，eg:rgba(217,216,206,0.8)
     * featureType 要素类型
     * cType 区分填充和边框，fill 填充、stroke 边框
     */
    private Color paintGenerator(String style, String featureType, String cType) {
        style = style.replace("rgba(", "").replace(")", "");
        Color color = VectorTileUtil.rgbaStrToColor(style);
        try {
            if (this.customStyle.isFeatureStyleChanged(featureType)) {
                color = VectorTileUtil.hexToAWTColor(this.customStyle.getFeatureColor(featureType, cType), 1);
            }
        } catch (VectorTileException e) {
            LOGGER.error(e);
        }

        return color;
    }
    
    // 绘制面
    private void drawPolygonSegment(JSONArray segments) {
        for (int i = 0, ci = segments.size(); i < ci; i++) {
            // 一个面要素点数组
            JSONArray points = segments.getJSONArray(i);
            GeneralPath polygonGeo = this.polygonGenerator(points);
            this.g2d.fill(polygonGeo);
        }
    }
    
    private void doRrawRoad(JSONArray segments, JSONObject item) {
        this.g2d.setStroke((Stroke) item.get(STROKE_KEY));
        this.g2d.setColor((Color) item.get(COLOR_KEY));
        this.drawRoadSegment(segments);
    }
    
    private void drawRoadSegment(JSONArray segments) {
        for (int i = 0, ci = segments.size(); i < ci; i++) {
            // 点数组
            JSONArray points = segments.getJSONArray(i);
            // 几何
            GeneralPath lineGeo = this.lineGenerator(points);
            this.g2d.draw(lineGeo);
        }
    }
    
    private JSONObject roadParamsGenerator(JSONArray styles, String featureType) {
        JSONObject param = new JSONObject();
        
        // 填充颜色
        String fillColorStr = styles.getString(1);
        // 边框颜色
        String strokeColorStr = styles.getString(4);
        // 填充宽度
        float fillWidth = this.roadFillWidthGenerator(styles.getIntValue(0));
        // 边框宽度
        float strokeWidth = this.roadStrokeWidthGenerator(fillWidth, styles.getString(3), featureType);
        // 虚线处理
        float[] dash = this.roadDashGenerator(styles, featureType);
        // cap
        int cap = this.roadCapGenerator(styles, featureType);
        // join 默认 JOIN_MITER
        int join = BasicStroke.JOIN_MITER;

        // 是否绘制填充
        boolean isFill = fillColorStr.length() == 0 ? false : true;
        
        // 转换后的类型
        String cFeatureType = this.featureTypeConversions(featureType);
        Color strokeColor = this.roadColorGenerator(strokeColorStr, cFeatureType, STROKE_KEY);
        Color fillColor = null;
        if (isFill) {
            fillColor = this.roadColorGenerator(fillColorStr, cFeatureType, FILL_KEY);
        }

        Stroke stroke = this.strokeGenerator(featureType, strokeWidth, cap, join, dash, STROKE_KEY);
        Stroke fillStroke = null;
        if (isFill) {
            fillStroke = this.strokeGenerator(featureType, fillWidth, cap, join, dash, FILL_KEY);
        }
        
        JSONObject strokeItem = new JSONObject();
        strokeItem.put(COLOR_KEY, strokeColor);
        strokeItem.put(STROKE_KEY, stroke);
        
        JSONObject fillItem = new JSONObject();
        fillItem.put(COLOR_KEY, fillColor);
        fillItem.put(STROKE_KEY, fillStroke);

        param.put("isFill", isFill);
        param.put(STROKE_KEY, strokeItem);
        param.put(FILL_KEY, fillItem);

        return param;
    }
    
    private Stroke strokeGenerator(String featureType, float width, int cap, int join, float[] dash, String cType) {
        Stroke stroke = null;
        float miterlimit = 10.0f;
        float dashPhase = 0.0f;

        if (STROKE_KEY.equals(cType)) {
            if (Fill_DASH_ELEMENTS.contains(featureType)) {
                stroke = new BasicStroke(width, cap, join, miterlimit, null, dashPhase);
            } else {
                stroke = new BasicStroke(width, cap, join, miterlimit, dash, dashPhase);
            }
        } else {
            if (Fill_DASH_ELEMENTS.contains(featureType)) {
                stroke = new BasicStroke(width, cap, join, miterlimit, dash, dashPhase);
            } else {
                stroke = new BasicStroke(width, cap, join, miterlimit, null, dashPhase);
            }
        }
        return stroke;
    }
    
    /*
     * 颜色生成
     * colorStr 颜色字符串，eg:ffffffff
     * featureType 道路类型
     * cType 区分填充和边框，fill 填充、stroke 边框
     */
    private Color roadColorGenerator(String colorStr, String featureType, String cType) {
        Color color = null;
        if(colorStr.length() == 0) {
            return color;
        }
        color = this.colorGenerator(colorStr, featureType, cType);
        return color;
    }
    
    // 道路填充宽度生成，大于18级后和18级宽度保持一致
    private float roadFillWidthGenerator(float originalFillWidth) {
        float fillWidth = originalFillWidth;
        if (this.param.isPrecision()) {
            fillWidth = originalFillWidth / Float.parseFloat(this.param.getScale());
        }
        return fillWidth;
    }

    // 道路边框宽度生成
    private float roadStrokeWidthGenerator(float fillWidth, String strokeWidthStr, String featureType) {
        float strokeWidthTemp = 0.0f;
        if (strokeWidthStr.length() != 0) {
            strokeWidthTemp = Float.parseFloat(strokeWidthStr);
        }

        float strokeWidth = fillWidth + strokeWidthTemp;
        if (strokeWidth == 0) {
            strokeWidth += fillWidth;
        }

        // 当级别大于指定的最大级别(18)时重新设置边框,underPass 除外
        if (this.param.isPrecision() && !"underPass".equals(featureType)) {
            float scale = Float.parseFloat(this.param.getScale());
            strokeWidth = (fillWidth * scale + 2) / scale;
        }

        return strokeWidth;
    }

    // BasicStroke cap 生成
    private int roadCapGenerator(JSONArray orginStyle, String featureType) {
        int cap = BasicStroke.CAP_BUTT;

        int capIndex = 2;
        if(Fill_DASH_ELEMENTS.contains(featureType)) {
            capIndex = 5;
        }
        String capStr = orginStyle.getString(capIndex);

        if (capStr.indexOf("_") != -1) {
            String[] values = capStr.split("_");
            String capStrTemp = values[1];
            if (capStrTemp.contains("butt")) {
                cap = BasicStroke.CAP_BUTT;
            }
            if (capStrTemp.contains("round")) {
                cap = BasicStroke.CAP_ROUND;
            }
        }
        return cap;
    }

    // BasicStroke dash 生成，大于18级的情况下保持和18级比例一致
    private float[] roadDashGenerator(JSONArray orginStyle, String featureType) {
        float[] dashArray = null;
        int dashIndex = 5;
        if(Fill_DASH_ELEMENTS.contains(featureType)) {
            dashIndex = 2;
        }
        String dashStr = orginStyle.getString(dashIndex);

        if (dashStr != null && dashStr.length() != 0 && dashStr.indexOf(",") != -1) {
            String[] dashStrArray = this.dashExtract(dashStr).split(",");
            int size = dashStrArray.length;
            dashArray = new float[size];
            for (int i = 0; i < size; i++) {
                try{
                    float dashValue = Float.parseFloat(dashStrArray[i]);
                    if(this.param.isPrecision()) {
                        dashValue = dashValue / Float.parseFloat(this.param.getScale());
                    }
                    dashArray[i] = dashValue;
                }catch(Exception e) {
                    e.printStackTrace();
                }
            }
        }
        return dashArray;
    }

    private String dashExtract(String str) {
        int beginIndex = str.indexOf("(");
        int endIndex = str.indexOf(")");
        return str.substring(beginIndex + 1, endIndex);
    }

    // road 颜色
    private Color colorGenerator(String colorStr, String featureType, String cType) {
        Color color = VectorTileUtil.hexToAWTColor("#" + colorStr.substring(2, colorStr.length()), 1);
        // 自定义样式获取
        try {
            if (this.customStyle.isFeatureStyleChanged(featureType)) {
                color = VectorTileUtil.hexToAWTColor(this.customStyle.getFeatureColor(featureType, cType), 1);
            }
        } catch (VectorTileException e) {
            LOGGER.error(e);
        }

        return color;
    }

    /*
     * 要素类型  eg:regions:parkingLot 停车场，返回 parkingLot
     */
    private String getFeatureType(String value) {
        if (value.indexOf(":") != -1) {
            value = value.split(":")[1];
        }
        return value;
    }
    
    // 要素类型转换
    private String featureTypeConversions(String originFeatureType) {
        String featureType = originFeatureType;

        if (MANMADE_SET.contains(originFeatureType)) {
            featureType = "manmade";// 人造区域
        } else if (LOCALROAD_SET.contains(originFeatureType)) {
            featureType = "localRoad";// 普通道路
        } else if (OTHER_SET.contains(originFeatureType)) {
            featureType = "other";
        } else if (originFeatureType.toLowerCase().indexOf("railway") != -1) {
            featureType = "railway";// highSpeedRailway(高速铁路)、 railway(普通铁路) 转换为
                                    // railway
        } else if (originFeatureType.toLowerCase().indexOf("subway") != -1) {
            featureType = "subway";// subway(地铁)、subwayBeingBuilt(规划地铁) 转换为
                                   // subway
        } else if ("highWay".equals(originFeatureType)) {
            featureType = "highway";
        }

        return featureType;
    }

    @Override
    GeneralPath pathGenerator(JSONArray points) {
        int initialCapacity = points.size();
        GeneralPath path = new GeneralPath(GeneralPath.WIND_NON_ZERO, initialCapacity);

        for (int i = 0; i < initialCapacity - 1; i++) {
            // 大于指定的最大等级时(18)要设置偏移
            int x = points.getInteger(i) - this.offsetX;
            int y = points.getInteger(++i) - this.offsetY;

            if (i == 1) {
                path.moveTo(x, y);
                continue;
            }
            path.lineTo(x, y);
        }
        return path;
    }
}
