package com.netposa.gis.server.bean;

/**
 * 配置数据表key的枚举
 * @author wj
 *
 */
public enum TableKeyEnum {
    ROAD("road"),// 道路
    ROADNET("roadNet"),// 路网
    ROADCROSS("RoadCross"),// 路口
    POI("poi"),// 兴趣点
    PANOCONFIG("panoconfig"),// 室外全景
    SNPANOPOINT("snpanopoint"),// 室内全景点位
    SNPANOCONFIG("snpanoconfig"),// 室内全景配置
    CITY("City"),
    BUSSINESS("BUssiness");
    
    public String key;

    TableKeyEnum(String key) {
        this.key = key;
    }
}
