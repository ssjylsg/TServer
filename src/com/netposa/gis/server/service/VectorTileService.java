package com.netposa.gis.server.service;

import com.netposa.gis.server.bean.VectorTileParam;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service("vectorTileService")
public abstract class VectorTileService extends BaseServiceImpl {
    
    @Autowired
    ThreadPoolTaskExecutor threadPoolTaskExecutor;
    
    private int highLevel;

    public VectorTileService(int highLevel) {
        super();
        this.highLevel = highLevel;
    }
    
    public ThreadPoolTaskExecutor getThreadPoolTaskExecutor() {
        return threadPoolTaskExecutor;
    }

    public void setThreadPoolTaskExecutor(ThreadPoolTaskExecutor threadPoolTaskExecutor) {
        this.threadPoolTaskExecutor = threadPoolTaskExecutor;
    }

    /**
     * 绘制 tile
     * 
     * @param serviceName 服务名称
     * @param x 行号
     * @param y 列号
     * @param l 等级
     * @param scale 比例，默认 1
     * @param personalise
     *            是否从缓存获取
     * @param mapStyleBody 自定义样式
     * @return
     * @throws IOException
     */
    public abstract byte[] drawTile(String serviceName, String x, String y, String l, String scale,
            boolean personalise, String mapStyleBody) throws IOException;

    // 请求 tile 参数
    VectorTileParam getTileParma(String serviceName, String customXs, String customYs, String customLs,
            String customScales, String mapStyleBody, boolean personalise) {

        int customL = Integer.parseInt(customLs);

        if (customL > this.highLevel) {
            PrecisionParma parma = this.parmaTrans(customXs, customYs, customL);

            return new VectorTileParam(serviceName, true, customXs, customYs, customLs, customScales, mapStyleBody,
                    personalise, parma.getFileX(), parma.getFileY(), String.valueOf(this.highLevel), parma.getScale(),
                    parma.getPoorLevel());
        } else {
            return new VectorTileParam(serviceName, customXs, customYs, customLs, customScales, mapStyleBody,
                    personalise);
        }
    }

    // level 大于指定级时把行列号和level转换为指定级的行列号和level,百度指定级别为19，高德为18
    PrecisionParma parmaTrans(String customXs, String customYs, int customL) {
        int customX = Integer.parseInt(customXs);
        int customY = Integer.parseInt(customYs);

        int poorLevel = customL - this.highLevel;
        // baidu 20级-->2,21级-->4,22级-->8
        // gaode 19级-->2,20级-->4,21级-->8,22级-->16
        int scale = (int) Math.pow(2, poorLevel);

        // 大于指定等级级情况下访问指定等级的数据文件的行列号
        int fileX = (int) Math.floor(customX / scale);
        int fileY = (int) Math.floor(customY / scale);

        return new PrecisionParma(String.valueOf(fileX), String.valueOf(fileY), poorLevel, String.valueOf(scale));
    }
    
    /*
     * 批量请求矢量切片标注数据参数解析
     * @param t 行列号和等级集合，eg:13,6567,3258;13,6567,3259
     */
    VectorTileParam[] getParams(String serviceName, String t) {
        if (t == null || t.length() == 0) {
            return new VectorTileParam[0];
        }

        String[] tilesParam = t.split(";");
        int tileCount = tilesParam.length;

        VectorTileParam[] params = new VectorTileParam[tileCount];

        for (int i = 0; i < tileCount; i++) {
            VectorTileParam param = null;

            String[] tileParam = tilesParam[i].split(",");
            if (tileParam.length == 3) {
                String l = tileParam[0];
                String x = tileParam[1];
                String y = tileParam[2];

                param = new VectorTileParam(serviceName, x, y, l, "");
            }

            params[i] = param;
        }
        return params;
    }

}

class PrecisionParma {
    private String fileX;
    private String fileY;
    private int poorLevel;
    private String scale;

    public PrecisionParma(String fileX, String fileY, int poorLevel, String scale) {
        super();
        this.fileX = fileX;
        this.fileY = fileY;
        this.poorLevel = poorLevel;
        this.scale = scale;
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

    public int getPoorLevel() {
        return poorLevel;
    }

    public void setPoorLevel(int poorLevel) {
        this.poorLevel = poorLevel;
    }

    public String getScale() {
        return scale;
    }

    public void setScale(String scale) {
        this.scale = scale;
    }
}
