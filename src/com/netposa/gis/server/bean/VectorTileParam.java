package com.netposa.gis.server.bean;

public class VectorTileParam {

    private boolean precision = false;// 是否大于19级

    // 服务名称
    private String serviceName;
    // 请求的行号
    private String customX;
    // 请求的列号
    private String customY;
    // 请求的等级
    private String customL;
    // 自定义比例
    private String customScale;
    // 自定义样式
    private String mapStyleBody;
    // 是否缓存
    private boolean personalise;
    // 获取lable时客户端标识
    private String fn;

    // 大于指定等级(19)情况下数据行列号及等级
    private String fileX;
    private String fileY;
    private String fileL;
    private String scale;
    private int poorLevel; // 访问等级和指定最大等级差

    public VectorTileParam(String serviceName, String customX, String customY, String customL, String fn) {
        super();
        this.serviceName = serviceName;
        this.customX = customX;
        this.customY = customY;
        this.customL = customL;
        this.fn = fn;
    }

    public VectorTileParam(String serviceName, boolean precision, String fileX, String fileY, String fileL, String fn) {
        super();
        this.serviceName = serviceName;
        this.precision = precision;
        this.fileX = fileX;
        this.fileY = fileY;
        this.fileL = fileL;
        this.fn = fn;
    }

    public VectorTileParam(String serviceName, String customX, String customY, String customL, String customScale,
            String mapStyleBody, boolean personalise) {
        super();
        this.serviceName = serviceName;
        this.customX = customX;
        this.customY = customY;
        this.customL = customL;
        this.customScale = customScale;
        this.mapStyleBody = mapStyleBody;
        this.personalise = personalise;
    }

    public VectorTileParam(String serviceName, String customX, String customY, String customL, String customScale,
            String mapStyleBody, boolean personalise, String fileX, String fileY, String fileL, String scale,
            int poorLevel) {
        super();
        this.serviceName = serviceName;
        this.customX = customX;
        this.customY = customY;
        this.customL = customL;
        this.customScale = customScale;
        this.mapStyleBody = mapStyleBody;
        this.personalise = personalise;
        this.fileX = fileX;
        this.fileY = fileY;
        this.fileL = fileL;
        this.scale = scale;
        this.poorLevel = poorLevel;
    }

    public VectorTileParam(String serviceName, boolean precision, String customX, String customY, String customL,
            String customScale, String mapStyleBody, boolean personalise, String fileX, String fileY, String fileL,
            String scale, int poorLevel) {
        super();
        this.serviceName = serviceName;
        this.precision = precision;
        this.customX = customX;
        this.customY = customY;
        this.customL = customL;
        this.customScale = customScale;
        this.mapStyleBody = mapStyleBody;
        this.personalise = personalise;
        this.fileX = fileX;
        this.fileY = fileY;
        this.fileL = fileL;
        this.scale = scale;
        this.poorLevel = poorLevel;
    }

    public String getServiceName() {
        return serviceName;
    }

    public void setServiceName(String serviceName) {
        this.serviceName = serviceName;
    }

    public boolean isPrecision() {
        return precision;
    }

    public void setPrecision(boolean precision) {
        this.precision = precision;
    }

    public String getCustomX() {
        return customX;
    }

    public void setCustomX(String customX) {
        this.customX = customX;
    }

    public String getCustomY() {
        return customY;
    }

    public void setCustomY(String customY) {
        this.customY = customY;
    }

    public String getCustomL() {
        return customL;
    }

    public void setCustomL(String customL) {
        this.customL = customL;
    }

    public String getCustomScale() {
        return customScale;
    }

    public void setCustomScale(String customScale) {
        this.customScale = customScale;
    }

    public String getFileX() {
        return fileX;
    }

    public void setFileX(String fileX) {
        this.fileX = fileX;
    }

    public String getFileY() {
        return fileY;
    }

    public void setFileY(String fileY) {
        this.fileY = fileY;
    }

    public String getFileL() {
        return fileL;
    }

    public void setFileL(String fileL) {
        this.fileL = fileL;
    }

    public String getScale() {
        return scale;
    }

    public void setScale(String scale) {
        this.scale = scale;
    }

    public int getPoorLevel() {
        return poorLevel;
    }

    public void setPoorLevel(int poorLevel) {
        this.poorLevel = poorLevel;
    }

    public String getMapStyleBody() {
        return mapStyleBody;
    }

    public void setMapStyleBody(String mapStyleBody) {
        this.mapStyleBody = mapStyleBody;
    }

    public boolean isPersonalise() {
        return personalise;
    }

    public void setPersonalise(boolean personalise) {
        this.personalise = personalise;
    }

    public String getFn() {
        return fn;
    }

    public void setFn(String fn) {
        this.fn = fn;
    }

}
