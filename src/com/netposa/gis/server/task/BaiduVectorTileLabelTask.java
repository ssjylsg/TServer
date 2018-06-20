package com.netposa.gis.server.task;

import com.alibaba.fastjson.JSONObject;
import com.netposa.gis.server.bean.VectorTileParam;
import com.netposa.gis.server.bean.VectorTileReader;

import java.util.concurrent.Callable;


public class BaiduVectorTileLabelTask implements Callable<String> {

    private static final String DEFAULT_LABEL = "{\"poi\":{\"onlyText\":[],\"iconText\":[],\"onlyIcon\":[]},\"road\":{\"biaopaiRoad\":[],\"roadText\":[]}}";

    private VectorTileParam param;

    VectorTileReader tileReader = new VectorTileReader();

    public BaiduVectorTileLabelTask(VectorTileParam param) {
        super();

        this.param = param;
    }

    @Override
    public String call() throws Exception {
        String fn = this.param.getFn();
        String serviceName = this.param.getServiceName();
        // 是否大于数据文件的最大级别
        boolean precision = this.param.isPrecision();

        JSONObject obj = null;

        if (precision) {
            obj = tileReader.readVectorTile(serviceName, this.param.getFileX(), this.param.getFileY(),
                    this.param.getFileL());
        } else {
            obj = tileReader.readVectorTile(serviceName, this.param.getCustomX(), this.param.getCustomY(),
                    this.param.getCustomL());
        }

        StringBuilder labelData = new StringBuilder(fn).append("&&").append(fn).append("(");

        if (!obj.isEmpty()) {
            labelData.append(obj.get("label").toString());
        } else {
            labelData.append(DEFAULT_LABEL);
        }

        labelData.append(")");
        return labelData.toString();
    }

}
