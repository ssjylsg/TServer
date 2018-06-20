package com.netposa.gis.server.bean;

import com.netposa.gis.server.exception.VectorTileException;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

public abstract class VectorTileStyle {
    private static final Log LOGGER = LogFactory.getLog(VectorTileStyle.class);

    // tile 宽度
    private int width = 256;
    // tile 高度
    private int height = 256;

    // tile 背景透明度
    private float bgAlpha = 1;

    // tile 比例，默认1，用户可自定义
    private double sx = 1;
    private double sy = 1;
    
    /*
     * featureType 要素类型 styleElement 区分fill 或者 stroke styleValue 颜色值
     */
    void parseStyle(String featureType, String styleElement, String styleValue) throws NoSuchMethodException,
            SecurityException, IllegalAccessException, IllegalArgumentException, InvocationTargetException {
        if (styleValue != null) {
            this.setFeatureStyle(featureType, styleElement, styleValue);
        }
    }
    
    private void setFeatureStyle(String featureType, String styleElement, String styleValue)
            throws NoSuchMethodException, SecurityException, IllegalAccessException, IllegalArgumentException,
            InvocationTargetException {
        Class<?> clazz = this.getClass();

        StringBuilder colorMethodName = new StringBuilder("set").append(this.captureName(featureType))
                .append(styleElement).append("Color");

        StringBuilder changedMethodName = new StringBuilder("set").append(this.captureName(featureType)).append(
                "StyleChanged");

        Method colorMethod = null;
        Method changedMethod = null;
        try {
            colorMethod = clazz.getDeclaredMethod(colorMethodName.toString(), String.class);
            colorMethod.invoke(this, styleValue);

            changedMethod = clazz.getDeclaredMethod(changedMethodName.toString(), boolean.class);
            changedMethod.invoke(this, true);
        } catch (Exception e) {

        }
    }
    
    void setFeatureVisibility(String methodName, boolean visibility) throws NoSuchMethodException, SecurityException,
            IllegalAccessException, IllegalArgumentException, InvocationTargetException {
        Class<?> clazz = this.getClass();
        Method method = clazz.getDeclaredMethod(methodName, boolean.class);
        method.invoke(this, visibility);
    }
    
    // 获取要素颜色是否改变状态， featureType 要素类型
    public boolean isFeatureStyleChanged(String featureType) throws VectorTileException {
        boolean changed = false;
        Class<?> clazz = this.getClass();
        StringBuilder changedMethodName = new StringBuilder("is").append(this.captureName(featureType)).append(
                "StyleChanged");
        Method changedMethod = null;
        try {
            changedMethod = clazz.getDeclaredMethod(changedMethodName.toString());

            changed = (boolean) changedMethod.invoke(this);
        } catch (NoSuchMethodException | SecurityException | IllegalAccessException | IllegalArgumentException
                | InvocationTargetException e) {
            LOGGER.error(e);
            StringBuilder message = new StringBuilder("获取 ").append(featureType).append("要素").append("颜色是否改变状态出错!");
            throw new VectorTileException(message.toString(), e.getCause());
        }
        return changed;
    }

    // 获取要素颜色， featureType 要素类型 cType: fill 填充，stroke 边框
    public String getFeatureColor(String featureType, String cType) throws VectorTileException {
        String color = "#FF0000";
        StringBuilder methodName = new StringBuilder(30);
        methodName.append("get").append(this.captureName(featureType)).append(this.captureName(cType)).append("Color");
        try {
            color = this.getFeatureColorFeflect(methodName.toString());
        } catch (NoSuchMethodException | SecurityException | IllegalAccessException | IllegalArgumentException
                | InvocationTargetException e) {
            LOGGER.error(e);
            StringBuilder message = new StringBuilder("获取 ").append(featureType).append(" 要素 ").append(cType)
                    .append("颜色出错!");
            throw new VectorTileException(message.toString(), e.getCause());
        }
        return color;
    }

    private String getFeatureColorFeflect(String methodName) throws NoSuchMethodException, SecurityException,
            IllegalAccessException, IllegalArgumentException, InvocationTargetException {
        Class<?> clazz = this.getClass();

        Method method = clazz.getDeclaredMethod(methodName);

        return (String) method.invoke(this);
    }

    // 字符串首字母大写转换
    String captureName(String name) {
        char[] cs = name.toCharArray();
        cs[0] -= 32;
        return String.valueOf(cs);
    }

    public int getWidth() {
        return width;
    }

    public void setWidth(int width) {
        this.width = width;
    }

    public int getHeight() {
        return height;
    }

    public void setHeight(int height) {
        this.height = height;
    }

    public float getBgAlpha() {
        return bgAlpha;
    }

    public void setBgAlpha(float bgAlpha) {
        this.bgAlpha = bgAlpha;
    }

    public double getSx() {
        return sx;
    }

    public void setSx(double sx) {
        this.sx = sx;
    }

    public double getSy() {
        return sy;
    }

    public void setSy(double sy) {
        this.sy = sy;
    }

}
