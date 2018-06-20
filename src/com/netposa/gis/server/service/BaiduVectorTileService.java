package com.netposa.gis.server.service;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.netposa.gis.server.bean.VectorTileCache;
import com.netposa.gis.server.bean.VectorTileParam;
import com.netposa.gis.server.task.BaiduVectorTileLabelTask;
import com.netposa.gis.server.task.BaiduVectorTileTask;
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

@Service("baiduVectorTileService")
public class BaiduVectorTileService extends VectorTileService {
    private static final Log LOGGER = LogFactory.getLog(BaiduVectorTileService.class);
    
    private static final String EMPTY_TILELABEL = "{\"poi\":{\"onlyText\":[],\"iconText\":[],\"onlyIcon\":[]},\"road\":{\"biaopaiRoad\":[],\"roadText\":[]}}";
    private static final int MAX_LEVEL = 19;
    
    public BaiduVectorTileService() {
        super(MAX_LEVEL);
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

            BaiduVectorTileTask task = new BaiduVectorTileTask(param);

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
    
    /*
     * tile label
     */
    public String getTileLabel(String serviceName, String x, String y, String l, String fn) {
        String label = "";

        VectorTileParam param = this.getLabelParma(serviceName, x, y, l, fn);

        BaiduVectorTileLabelTask task = new BaiduVectorTileLabelTask(param);

        FutureTask<String> futureTask = new FutureTask<>(task);

        threadPoolTaskExecutor.submit(futureTask);

        try {
            label = futureTask.get();
        } catch (InterruptedException | ExecutionException e) {
            LOGGER.error(e);
        }

        if ("".equals(label)) {
            StringBuilder labelTemp = new StringBuilder(fn)
                .append("&&")
                .append(fn)
                .append("(")
                .append(EMPTY_TILELABEL)
                .append(")");
            label = labelTemp.toString();
        }

        return label;
    }
    
    /*
     * 批量请求标注数据
     * @param t 行列号和等级集合，eg:13,6567,3258;13,6567,3259
     */
    public JSONArray getBaiduMapLabel(String serviceName, String t) {
        JSONArray results = new JSONArray();
        VectorTileParam[] params = this.getParams(serviceName, t);
        for (int i = 0, ci = params.length; i < ci; i++) {
            VectorTileParam param = params[i];
            if (param != null) {
                String x = param.getCustomX();
                String y = param.getCustomY();
                String l = param.getCustomL();
                String labelTemp = this.getTileLabel(serviceName, x, y, l, "");

                StringBuilder key = new StringBuilder(l).append("_").append(x).append("_").append(y);
                JSONObject result = (JSONObject) JSONObject.parse(labelTemp.substring(3, labelTemp.length() - 1));
                result.put("key", key.toString());

                results.add(result);
            }
        }

        return results;
    }
    
    // 请求 label 参数
    private VectorTileParam getLabelParma(String serviceName, String customXs, String customYs, String customLs,
            String fn) {

        int customL = Integer.parseInt(customLs);

        if (customL > MAX_LEVEL) {
            PrecisionParma parma = this.parmaTrans(customXs, customYs, customL);

            return new VectorTileParam(serviceName, true, parma.getFileX(), parma.getFileY(),
                    String.valueOf(MAX_LEVEL), fn);
        } else {
            return new VectorTileParam(serviceName, customXs, customYs, customLs, fn);
        }
    }
}
