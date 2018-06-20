package com.netposa.gis.server.task;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.netposa.gis.server.bean.*;
import com.netposa.gis.server.exception.VectorTileException;
import com.netposa.gis.server.utils.VectorTileUtil;

import java.awt.*;
import java.awt.geom.AffineTransform;
import java.awt.geom.GeneralPath;
import java.awt.image.BufferedImage;
import java.util.concurrent.Callable;

public abstract class VectorTileTask implements Callable<BufferedImage> {
    
    static final String STROKE_KEY = "stroke";
    static final String FILL_KEY = "fill";
    
    Graphics2D g2d;

    // 自定义风格
    VectorTileStyle customStyle;
    
    // 文件读取
    VectorTileReader tileReader;
    
    // 相关参数
    VectorTileParam param;
    
    // 大于指定级别 的情况下 位移
    int offsetX = 0;
    int offsetY = 0;
    
    
    public VectorTileTask() {
        super();
        this.tileReader = new VectorTileReader();
    }
    
    BufferedImage createBufferedImage(int width, int height, int transparency) {
        /*
         * GraphicsEnvironment ge =
         * GraphicsEnvironment.getLocalGraphicsEnvironment();
         * GraphicsConfiguration gc =
         * ge.getDefaultScreenDevice().getDefaultConfiguration(); return
         * gc.createCompatibleImage(width, height, transparency);
         */
        // 以上代码会依赖图形环境，在没有外设的服务器上会出现问题。
        return new BufferedImage(width, height, transparency);
    }
    
    // 绘制 tile
    abstract void doDrawTile(JSONObject tileData, int width, int height) throws VectorTileException;
    
    // 获取 tile 数据
    JSONObject getTileData(boolean precision) throws VectorTileException {
        JSONObject tileData = new JSONObject();

        if (precision) {
            tileData = tileReader.readVectorTile(this.param.getServiceName(), this.param.getFileX(),
                    this.param.getFileY(), this.param.getFileL());
        } else {
            tileData = tileReader.readVectorTile(this.param.getServiceName(), this.param.getCustomX(),
                    this.param.getCustomY(), this.param.getCustomL());
        }
        
        return tileData;
    }
    
    // 设置风格样式
    abstract void styleGenerator();
    
    // 生成线
    GeneralPath lineGenerator(JSONArray points) {
        return this.pathGenerator(points);
    }

    // 生成多边形
    GeneralPath polygonGenerator(JSONArray points) {
        GeneralPath polygon = this.pathGenerator(points);
        polygon.closePath();
        return polygon;
    }
    
    // 构建 path
    abstract GeneralPath pathGenerator(JSONArray points);
    
    // 大于指定级别 的情况下计算位移
    void calculateOffset() {
        // 高德地图： 19级-->2,20级-->4,21级-->8,22级-->16
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

        this.offsetX = residueX * width / scale;
        this.offsetY = residueY * height / scale;
    }
    
    // tile背景色
    void drawBackground(int width, int height, String mapType) {
        if ("gaode".equals(mapType)) {
            this.g2d.setColor(VectorTileUtil.hexToAWTColor(
                    ((GaodeVectorTileStyle) this.customStyle).getLandFillColor(), this.customStyle.getBgAlpha()));
        } else {
            this.g2d.setColor(VectorTileUtil.hexToAWTColor(
                    ((BaiduVectorTileStyle) this.customStyle).getLandFillColor(), this.customStyle.getBgAlpha()));
        }

        this.g2d.fillRect(0, 0, width, height);
    }

    // 异常图片
    void drawErrorTile(int width, int height, String mapType) {
        this.drawBackground(width, height, mapType);

        AffineTransform oldTransform = this.g2d.getTransform();
        AffineTransform newTransform = new AffineTransform();
        newTransform.scale(1, 1);
        newTransform.rotate(Math.PI / 4, (double) width / 2 - 40, (double) height / 2 - 10);

        this.g2d.setTransform(newTransform);

        String text = "N E T P O S A";
        this.g2d.setColor(Color.GRAY);
        Font font = new Font("Serif", Font.ITALIC, 26);
        this.g2d.setFont(font);

        FontMetrics metrics = this.g2d.getFontMetrics(font);
        int hgt = metrics.getHeight();
        int adv = metrics.stringWidth(text);

        int offLeft = (width - adv - 2) / 2;
        int offTop = (height - hgt - 2) / 2;

        this.g2d.drawString(text, offLeft, offTop);

        this.g2d.setTransform(oldTransform);
    }
}
