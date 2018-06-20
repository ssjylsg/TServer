package com.netposa.gis.server.bean;

import com.netposa.gis.server.exception.VectorTileException;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import java.lang.reflect.InvocationTargetException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class BaiduVectorTileStyle extends VectorTileStyle {
    private static final Log LOGGER = LogFactory.getLog(BaiduVectorTileStyle.class);
    
    private static final List<String> POLYLINE_LIST = new ArrayList<String>(Arrays.asList("localRoad", "highway",
            "railway", "subway"));
    private static final List<String> POLYGON_LIST = new ArrayList<String>(Arrays.asList("water", "land", "background",
            "green"));
    
    // tile 背景色
    private String landFillColor = "#F5F3F0";
    private boolean landVisibility = true;
    private boolean landStyleChanged = false;

    // 水面
    private String waterFillColor = "#A7C0E0";
    private boolean waterVisibility = true;
    private boolean waterStyleChanged = false;
    
    // 建筑物和绿地
    private String greenFillColor = "#F5F3F0";
    private boolean greenVisibility = true;
    private boolean greenStyleChanged = false;

    // 道路顔色，对应编辑界面上的普通道路
    private String localRoadStrokeColor = "#DAD7C9";
    private String localRoadFillColor = "#FFFFFF";
    private boolean localRoadVisibility = true;
    private boolean localRoadStyleChanged = false;

    // 高速路颜色,对应配置界面上的高速及国道
    private String highwayStrokeColor = "#B36B48";
    private String highwayFillColor = "#FFCD46";
    private boolean highwayVisibility = true;
    private boolean highwayStyleChanged = false;

    // 铁路颜色
    private String railwayStrokeColor = "#949391";
    private String railwayFillColor = "#f2f1ef";
    private boolean railwayVisibility = true;
    private boolean railwayStyleChanged = false;

    // 地铁颜色,包括规划线路
    private String subwayStrokeColor = "#FFFFFF";
    private String subwayFillColor = "#868686";
    private boolean subwayVisibility = true;
    private boolean subwayStyleChanged = false;

    public BaiduVectorTileStyle(String scale, String mapStyleBody) throws VectorTileException {
        if (!"1".equals(scale)) {
            double dScale = Double.parseDouble(scale);
            this.setSx(dScale);
            this.setSy(dScale);
        }

        if (mapStyleBody != null && mapStyleBody.length() != 0) {
            String[] styles = mapStyleBody.split(",");
            try {
                for (int i = 0, ci = styles.length; i < ci; i++) {
                    String style = styles[i];
                    this.parseStyles(style);
                }
            } catch (NoSuchMethodException | SecurityException | IllegalAccessException | IllegalArgumentException
                    | InvocationTargetException e) {
                LOGGER.error(e);
                throw new VectorTileException(e);
            }
        }
    }

    private void parseStyles(String style) throws NoSuchMethodException, SecurityException, IllegalAccessException,
            IllegalArgumentException, InvocationTargetException {
        String featureType = null;
        String styleElement = null;
        String styleValue = null;
        boolean visibility = true;

        String[] styleItems = style.split("\\|");

        for (int i = 0, ci = styleItems.length; i < ci; i++) {
            String styleItem = styleItems[i];
            String[] kvArr = styleItem.split(":");
            String key = kvArr[0];

            if ("t".equals(key)) {
                featureType = kvArr[1];
            } else if ("e".equals(key)) {
                styleElement = kvArr[1];
            } else if ("c".equals(key)) {
                styleValue = kvArr[1];
            } else {
                if ("off".equals(kvArr[1])) {
                    visibility = false;
                }
            }
        }

        if (featureType != null && (POLYLINE_LIST.contains(featureType) || POLYGON_LIST.contains(featureType))) {
            if (POLYLINE_LIST.contains(featureType)) {
                if (visibility) {
                    if ("all".equals(styleElement) || "g".equals(styleElement)) {
                        this.parseStyle(featureType, "Fill", styleValue);
                        this.parseStyle(featureType, "Stroke", styleValue);
                    } else {
                        if ("g.f".equals(styleElement)) {
                            this.parseStyle(featureType, "Fill", styleValue);
                        } else if ("g.s".equals(styleElement)) {
                            this.parseStyle(featureType, "Stroke", styleValue);
                        }
                    }
                } else {
                    StringBuilder methodName = new StringBuilder("set").append(this.captureName(featureType)).append(
                            "Visibility");
                    this.setFeatureVisibility(methodName.toString(), visibility);
                }
            }

            if (POLYGON_LIST.contains(featureType)) {
                StringBuilder methodName = new StringBuilder("set").append(this.captureName(featureType)).append(
                        "Visibility");
                if ("g.s".equals(styleElement)) {
                    // 面设置stroke不显示面
                    this.setFeatureVisibility(methodName.toString(), false);
                } else {
                    this.parseStyle(featureType, "Fill", styleValue);
                    if (!"background".equals(featureType)) {
                        this.setFeatureVisibility(methodName.toString(), visibility);
                    }

                }
            }
        }
    }

    public String getWaterFillColor() {
        return waterFillColor;
    }

    public void setWaterFillColor(String waterFillColor) {
        this.waterFillColor = waterFillColor;
    }

    public String getLandFillColor() {
        return landFillColor;
    }

    public void setLandFillColor(String landFillColor) {
        this.landFillColor = landFillColor;
    }
    
    public String getHighwayStrokeColor() {
        return highwayStrokeColor;
    }

    public void setHighwayStrokeColor(String highwayStrokeColor) {
        this.highwayStrokeColor = highwayStrokeColor;
    }

    public String getHighwayFillColor() {
        return highwayFillColor;
    }

    public void setHighwayFillColor(String highwayFillColor) {
        this.highwayFillColor = highwayFillColor;
    }

    public String getRailwayStrokeColor() {
        return railwayStrokeColor;
    }

    public void setRailwayStrokeColor(String railwayStrokeColor) {
        this.railwayStrokeColor = railwayStrokeColor;
    }

    public String getRailwayFillColor() {
        return railwayFillColor;
    }

    public void setRailwayFillColor(String railwayFillColor) {
        this.railwayFillColor = railwayFillColor;
    }

    public String getSubwayStrokeColor() {
        return subwayStrokeColor;
    }

    public void setSubwayStrokeColor(String subwayStrokeColor) {
        this.subwayStrokeColor = subwayStrokeColor;
    }

    public String getSubwayFillColor() {
        return subwayFillColor;
    }

    public void setSubwayFillColor(String subwayFillColor) {
        this.subwayFillColor = subwayFillColor;
    }

    public boolean isWaterVisibility() {
        return waterVisibility;
    }

    public void setWaterVisibility(boolean waterVisibility) {
        this.waterVisibility = waterVisibility;
    }

    public boolean isLandVisibility() {
        return landVisibility;
    }

    public void setLandVisibility(boolean landVisibility) {
        this.landVisibility = landVisibility;
    }

    public boolean isHighwayVisibility() {
        return highwayVisibility;
    }

    public void setHighwayVisibility(boolean highwayVisibility) {
        this.highwayVisibility = highwayVisibility;
    }

    public boolean isRailwayVisibility() {
        return railwayVisibility;
    }

    public void setRailwayVisibility(boolean railwayVisibility) {
        this.railwayVisibility = railwayVisibility;
    }

    public boolean isSubwayVisibility() {
        return subwayVisibility;
    }

    public void setSubwayVisibility(boolean subwayVisibility) {
        this.subwayVisibility = subwayVisibility;
    }

    public boolean isSubwayStyleChanged() {
        return subwayStyleChanged;
    }

    public void setSubwayStyleChanged(boolean subwayStyleChanged) {
        this.subwayStyleChanged = subwayStyleChanged;
    }

    public boolean isWaterStyleChanged() {
        return waterStyleChanged;
    }

    public void setWaterStyleChanged(boolean waterStyleChanged) {
        this.waterStyleChanged = waterStyleChanged;
    }

    public boolean isLandStyleChanged() {
        return landStyleChanged;
    }

    public void setLandStyleChanged(boolean landStyleChanged) {
        this.landStyleChanged = landStyleChanged;
    }
    
    public boolean isHighwayStyleChanged() {
        return highwayStyleChanged;
    }

    public void setHighwayStyleChanged(boolean highwayStyleChanged) {
        this.highwayStyleChanged = highwayStyleChanged;
    }

    public boolean isRailwayStyleChanged() {
        return railwayStyleChanged;
    }

    public void setRailwayStyleChanged(boolean railwayStyleChanged) {
        this.railwayStyleChanged = railwayStyleChanged;
    }

    public String getLocalRoadStrokeColor() {
        return localRoadStrokeColor;
    }

    public void setLocalRoadStrokeColor(String localRoadStrokeColor) {
        this.localRoadStrokeColor = localRoadStrokeColor;
    }

    public String getLocalRoadFillColor() {
        return localRoadFillColor;
    }

    public void setLocalRoadFillColor(String localRoadFillColor) {
        this.localRoadFillColor = localRoadFillColor;
    }

    public boolean isLocalRoadVisibility() {
        return localRoadVisibility;
    }

    public void setLocalRoadVisibility(boolean localRoadVisibility) {
        this.localRoadVisibility = localRoadVisibility;
    }

    public boolean isLocalRoadStyleChanged() {
        return localRoadStyleChanged;
    }

    public void setLocalRoadStyleChanged(boolean localRoadStyleChanged) {
        this.localRoadStyleChanged = localRoadStyleChanged;
    }

    public String getGreenFillColor() {
        return greenFillColor;
    }

    public void setGreenFillColor(String greenFillColor) {
        this.greenFillColor = greenFillColor;
    }

    public boolean isGreenVisibility() {
        return greenVisibility;
    }

    public void setGreenVisibility(boolean greenVisibility) {
        this.greenVisibility = greenVisibility;
    }

    public boolean isGreenStyleChanged() {
        return greenStyleChanged;
    }

    public void setGreenStyleChanged(boolean greenStyleChanged) {
        this.greenStyleChanged = greenStyleChanged;
    }
    
    
}
