package com.netposa.gis.server.service;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.netposa.gis.server.bean.VectorTileCache;
import com.netposa.gis.server.bean.VectorTileParam;
import com.netposa.gis.server.task.GaodeVectorTileLabelTask;
import com.netposa.gis.server.task.GaodeVectorTileTask;
import com.netposa.gis.server.utils.VectorTileUtil;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.FutureTask;

@Service("gaodeVectorService")
public class GaodeVectorTileService extends VectorTileService {
    private static final Log LOGGER = LogFactory.getLog(GaodeVectorTileService.class);

    private static final int MAX_LEVEL = 18;
    
    public GaodeVectorTileService() {
        super(MAX_LEVEL);
    }

    /**
     * 多个切片标注数据，limg 数据集,标注数据接口，客户端和服务端渲染都使用
     * @param serviceName 服务名称
     * @param t 行列号和等级集合，eg:13,6567,3258;13,6567,3259
     * @return
     */
    public JSONArray getGaodeMapLabels(String serviceName, String t) {
        return this.getGaodeMapElements(serviceName, t, "limg");
    }

    /**
     * region_building_road 数据集,客户端渲染方式除标注外数据接口
     * @param serviceName 服务名称
     * @param t 行列号和等级集合，eg:13,6567,3258;13,6567,3259
     * @return
     */
    public JSONArray getGaodeMapRegion(String serviceName, String t) {
        return this.getGaodeMapElements(serviceName, t, "region_building_road");
    }
    
    /**
     * 一个切片标注数据
     * @param serviceName 服务名称
     * @param x 行号
     * @param y 列号
     * @param l 等级
     * @return
     */
    public String getGaodeMapLabel(String serviceName, String x, String y, String l) {
        String label = "";
        VectorTileParam param = this.getLabelParma(serviceName, x, y, l);

        GaodeVectorTileLabelTask task = new GaodeVectorTileLabelTask(param);
        FutureTask<JSONObject> futureTask = new FutureTask<>(task);
        threadPoolTaskExecutor.submit(futureTask);

        try {
            label = futureTask.get().getJSONObject("limg").toJSONString();
        } catch (InterruptedException | ExecutionException e) {
            LOGGER.error(e);
        }
        
        return label;
    }

    
    @Override
    public byte[] drawTile(String serviceName, String x, String y, String l, String scale, boolean personalise,
            String mapStyleBody) throws IOException {
        byte[] bytes = null;

        String key = VectorTileUtil.keyGeneratorForImg(serviceName, x, y, l, scale, mapStyleBody);

        if (VectorTileCache.isKeyInCache(key) && personalise) {
            bytes = VectorTileCache.getFromCache(key);
        } else {
            VectorTileParam param = this.getTileParma(serviceName, x, y, l, scale, mapStyleBody, personalise);

            GaodeVectorTileTask task = new GaodeVectorTileTask(param);

            FutureTask<BufferedImage> futureTask = new FutureTask<>(task);

            threadPoolTaskExecutor.submit(futureTask);

            try {
                BufferedImage image = futureTask.get();

                if (image != null) {
                    ByteArrayOutputStream byteos = new ByteArrayOutputStream();
                    ImageIO.write(image, "jpg", byteos);
                    image.flush();
                    bytes = byteos.toByteArray();
                }
                if (personalise) {
                    VectorTileCache.putToCache(key, bytes);
                }
            } catch (InterruptedException | ExecutionException e) {
                LOGGER.error(e);
            }
        }

        return bytes;
    }

    // 获取高德矢量数据要素
    private JSONArray getGaodeMapElements(String serviceName, String t, String key) {
        JSONArray results = new JSONArray();

        VectorTileParam[] params = this.getParams(serviceName, t);

        for (int i = 0, ci = params.length; i < ci; i++) {
            VectorTileParam param = params[i];
            JSONObject tileObj = new JSONObject();

            if (param == null) {
                results.add(tileObj);
            } else {
                GaodeVectorTileLabelTask task = new GaodeVectorTileLabelTask(param);

                FutureTask<JSONObject> futureTask = new FutureTask<>(task);
                threadPoolTaskExecutor.submit(futureTask);

                try {
                    tileObj = futureTask.get();

                    if (!tileObj.isEmpty()) {
                        results.add(tileObj.getJSONObject(key));
                    }

                } catch (InterruptedException | ExecutionException e) {
                    LOGGER.error(e);
                }
            }
        }
        return results;
    }
    
    // 请求 label 参数
    private VectorTileParam getLabelParma(String serviceName, String customXs, String customYs, String customLs) {

        int customL = Integer.parseInt(customLs);

        if (customL > MAX_LEVEL) {
            PrecisionParma parma = this.parmaTrans(customXs, customYs, customL);

            return new VectorTileParam(serviceName, true, parma.getFileX(), parma.getFileY(),
                    String.valueOf(MAX_LEVEL), "");
        } else {
            return new VectorTileParam(serviceName, customXs, customYs, customLs, "");
        }
    }
}
