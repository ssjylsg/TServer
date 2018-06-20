package com.netposa.gis.server.bean;

import com.netposa.gis.server.exception.VectorTileException;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import java.lang.reflect.InvocationTargetException;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

public class GaodeVectorTileStyle extends VectorTileStyle {
    private static final Log LOGGER = LogFactory.getLog(GaodeVectorTileStyle.class);
    
    // 标注要素样式，服务端不处理该类要素
    private static final Set<String> EXCLUDE_SET = new HashSet<String>(Arrays.asList("guideboard",
            "roadLabel", "poi", "administrativeLabel", "regionLabel"));
    
    ///////// 地图背景
    // tile 背景色
    private String landFillColor = "#F5F3F0";
    private boolean landVisibility = true;
    private boolean landStyleChanged = false;
    
    // 绿地 
    private String greenFillColor = "#C8E49D";
    private boolean greenVisibility = true;
    private boolean greenStyleChanged = false;

    // 水面 
    private String waterFillColor = "#A3CCFF";
    private boolean waterVisibility = true;
    private boolean waterStyleChanged = false;
    
    // buildings
    private String buildingFillColor = "#CBCAC0";
    private boolean buildingVisibility = true;
    private boolean buildingStyleChanged = false;
    
    // 人造区域,edu 教育体育、public 公共设施、traffic 交通枢纽、scenicSpot 景区、culture 文化、health 医疗卫生、sports 运动场所、business 商业场所、parkingLot 停车场、subway 地铁设施
    private String manmadeFillColor = "#DADADA";
    //private String manmadeStrokeColor = "#FF0000";
    private boolean manmadeVisibility = true;
    private boolean manmadeStyleChanged = false;

    
    ///////// 道路
    // 高速
    private String highwayStrokeColor = "#FFA35C";
    private String highwayFillColor = "#F68025";
    private boolean highwayVisibility = true;
    private boolean highwayStyleChanged = false;
    
    // ringRoad
    private String ringRoadStrokeColor = "#E1AD04";
    private String ringRoadFillColor = "#F1CF5F";
    private boolean ringRoadVisibility = true;
    private boolean ringRoadStyleChanged = false;
    
    // 国道 
    private String nationalRoadStrokeColor = "#F8D291";
    private String nationalRoadFillColor = "#DFB265";
    private boolean nationalRoadVisibility = true;
    private boolean nationalRoadStyleChanged = false;
    
    // 省道 
    private String provincialRoadStrokeColor = "#F6E3A3";
    private String provincialRoadFillColor = "#F2C841";
    private boolean provincialRoadVisibility = true;
    private boolean provincialRoadStyleChanged = false;
    
    // 普通道路,包括 secondaryRoad(二级道路)、levelThreeRoad(三级道路)、levelFourRoad(四级道路)、other(其它道路)
    private String localRoadStrokeColor = "#FFFFFF";
    private String localRoadFillColor = "#DED8CD";
    private boolean localRoadVisibility = true;
    private boolean localRoadStyleChanged = false;

    // 铁路颜色,包括 railway(普通铁路)、高速铁路(highSpeedRailway)
    private String railwayStrokeColor = "#DED8CD";
    private String railwayFillColor = "#A6ABAE";
    private boolean railwayVisibility = true;
    private boolean railwayStyleChanged = false;

    // 地铁，包括 subway(地铁)、subwayBeingBuilt(规划线路)
    private String subwayStrokeColor = "#E47878";
    private String subwayFillColor = "#FFFFFF";
    private boolean subwayVisibility = true;
    private boolean subwayStyleChanged = false;
    
    // 其它路线,underPass(地下通道)、overPass(天桥)
    private String otherStrokeColor = "#FFFFFF";
    private String otherFillColor = "#DED8CD";
    private boolean otherVisibility = true;
    private boolean otherStyleChanged = false;
    
    public GaodeVectorTileStyle(String scale, String mapStyleBody) throws VectorTileException {
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

        if (!EXCLUDE_SET.contains(featureType) && featureType.split("_").length != 2) {
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

    }
    
    public String getLandFillColor() {
        return landFillColor;
    }

    public void setLandFillColor(String landFillColor) {
        this.landFillColor = landFillColor;
    }

    public boolean isLandVisibility() {
        return landVisibility;
    }

    public void setLandVisibility(boolean landVisibility) {
        this.landVisibility = landVisibility;
    }

    public String getWaterFillColor() {
        return waterFillColor;
    }

    public void setWaterFillColor(String waterFillColor) {
        this.waterFillColor = waterFillColor;
    }

    public boolean isWaterVisibility() {
        return waterVisibility;
    }

    public void setWaterVisibility(boolean waterVisibility) {
        this.waterVisibility = waterVisibility;
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

    public boolean isRailwayVisibility() {
        return railwayVisibility;
    }

    public void setRailwayVisibility(boolean railwayVisibility) {
        this.railwayVisibility = railwayVisibility;
    }

    public String getProvincialRoadStrokeColor() {
        return provincialRoadStrokeColor;
    }

    public void setProvincialRoadStrokeColor(String provincialRoadStrokeColor) {
        this.provincialRoadStrokeColor = provincialRoadStrokeColor;
    }

    public String getProvincialRoadFillColor() {
        return provincialRoadFillColor;
    }

    public void setProvincialRoadFillColor(String provincialRoadFillColor) {
        this.provincialRoadFillColor = provincialRoadFillColor;
    }

    public boolean isProvincialRoadVisibility() {
        return provincialRoadVisibility;
    }

    public void setProvincialRoadVisibility(boolean provincialRoadVisibility) {
        this.provincialRoadVisibility = provincialRoadVisibility;
    }

    public String getNationalRoadStrokeColor() {
        return nationalRoadStrokeColor;
    }

    public void setNationalRoadStrokeColor(String nationalRoadStrokeColor) {
        this.nationalRoadStrokeColor = nationalRoadStrokeColor;
    }

    public String getNationalRoadFillColor() {
        return nationalRoadFillColor;
    }

    public void setNationalRoadFillColor(String nationalRoadFillColor) {
        this.nationalRoadFillColor = nationalRoadFillColor;
    }

    public boolean isNationalRoadVisibility() {
        return nationalRoadVisibility;
    }

    public void setNationalRoadVisibility(boolean nationalRoadVisibility) {
        this.nationalRoadVisibility = nationalRoadVisibility;
    }
    
    public String getManmadeFillColor() {
        return manmadeFillColor;
    }

    public void setManmadeFillColor(String manmadeFillColor) {
        this.manmadeFillColor = manmadeFillColor;
    }

    public boolean isManmadeVisibility() {
        return manmadeVisibility;
    }

    public void setManmadeVisibility(boolean manmadeVisibility) {
        this.manmadeVisibility = manmadeVisibility;
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

    public boolean isHighwayVisibility() {
        return highwayVisibility;
    }

    public void setHighwayVisibility(boolean highwayVisibility) {
        this.highwayVisibility = highwayVisibility;
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

    public String getOtherStrokeColor() {
        return otherStrokeColor;
    }

    public void setOtherStrokeColor(String otherStrokeColor) {
        this.otherStrokeColor = otherStrokeColor;
    }

    public String getOtherFillColor() {
        return otherFillColor;
    }

    public void setOtherFillColor(String otherFillColor) {
        this.otherFillColor = otherFillColor;
    }

    public boolean isOtherVisibility() {
        return otherVisibility;
    }

    public void setOtherVisibility(boolean otherVisibility) {
        this.otherVisibility = otherVisibility;
    }

    public String getBuildingFillColor() {
        return buildingFillColor;
    }

    public void setBuildingFillColor(String buildingFillColor) {
        this.buildingFillColor = buildingFillColor;
    }

    public boolean isBuildingVisibility() {
        return buildingVisibility;
    }

    public void setBuildingVisibility(boolean buildingVisibility) {
        this.buildingVisibility = buildingVisibility;
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

    public String getRingRoadStrokeColor() {
        return ringRoadStrokeColor;
    }

    public void setRingRoadStrokeColor(String ringRoadStrokeColor) {
        this.ringRoadStrokeColor = ringRoadStrokeColor;
    }

    public String getRingRoadFillColor() {
        return ringRoadFillColor;
    }

    public void setRingRoadFillColor(String ringRoadFillColor) {
        this.ringRoadFillColor = ringRoadFillColor;
    }

    public boolean isRingRoadVisibility() {
        return ringRoadVisibility;
    }

    public void setRingRoadVisibility(boolean ringRoadVisibility) {
        this.ringRoadVisibility = ringRoadVisibility;
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

    public boolean isSubwayVisibility() {
        return subwayVisibility;
    }

    public void setSubwayVisibility(boolean subwayVisibility) {
        this.subwayVisibility = subwayVisibility;
    }

    public boolean isRailwayStyleChanged() {
        return railwayStyleChanged;
    }

    public void setRailwayStyleChanged(boolean railwayStyleChanged) {
        this.railwayStyleChanged = railwayStyleChanged;
    }

    public boolean isSubwayStyleChanged() {
        return subwayStyleChanged;
    }

    public void setSubwayStyleChanged(boolean subwayStyleChanged) {
        this.subwayStyleChanged = subwayStyleChanged;
    }

    public boolean isLandStyleChanged() {
        return landStyleChanged;
    }

    public void setLandStyleChanged(boolean landStyleChanged) {
        this.landStyleChanged = landStyleChanged;
    }

    public boolean isGreenStyleChanged() {
        return greenStyleChanged;
    }

    public void setGreenStyleChanged(boolean greenStyleChanged) {
        this.greenStyleChanged = greenStyleChanged;
    }

    public boolean isWaterStyleChanged() {
        return waterStyleChanged;
    }

    public void setWaterStyleChanged(boolean waterStyleChanged) {
        this.waterStyleChanged = waterStyleChanged;
    }

    public boolean isBuildingStyleChanged() {
        return buildingStyleChanged;
    }

    public void setBuildingStyleChanged(boolean buildingStyleChanged) {
        this.buildingStyleChanged = buildingStyleChanged;
    }

    public boolean isManmadeStyleChanged() {
        return manmadeStyleChanged;
    }

    public void setManmadeStyleChanged(boolean manmadeStyleChanged) {
        this.manmadeStyleChanged = manmadeStyleChanged;
    }

    public boolean isHighwayStyleChanged() {
        return highwayStyleChanged;
    }

    public void setHighwayStyleChanged(boolean highwayStyleChanged) {
        this.highwayStyleChanged = highwayStyleChanged;
    }

    public boolean isRingRoadStyleChanged() {
        return ringRoadStyleChanged;
    }

    public void setRingRoadStyleChanged(boolean ringRoadStyleChanged) {
        this.ringRoadStyleChanged = ringRoadStyleChanged;
    }

    public boolean isNationalRoadStyleChanged() {
        return nationalRoadStyleChanged;
    }

    public void setNationalRoadStyleChanged(boolean nationalRoadStyleChanged) {
        this.nationalRoadStyleChanged = nationalRoadStyleChanged;
    }

    public boolean isProvincialRoadStyleChanged() {
        return provincialRoadStyleChanged;
    }

    public void setProvincialRoadStyleChanged(boolean provincialRoadStyleChanged) {
        this.provincialRoadStyleChanged = provincialRoadStyleChanged;
    }

    public boolean isLocalRoadStyleChanged() {
        return localRoadStyleChanged;
    }

    public void setLocalRoadStyleChanged(boolean localRoadStyleChanged) {
        this.localRoadStyleChanged = localRoadStyleChanged;
    }

    public boolean isOtherStyleChanged() {
        return otherStyleChanged;
    }

    public void setOtherStyleChanged(boolean otherStyleChanged) {
        this.otherStyleChanged = otherStyleChanged;
    }
}
