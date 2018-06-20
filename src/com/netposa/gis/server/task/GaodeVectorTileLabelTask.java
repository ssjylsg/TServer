package com.netposa.gis.server.task;

import com.alibaba.fastjson.JSONObject;
import com.netposa.gis.server.bean.VectorTileParam;
import com.netposa.gis.server.bean.VectorTileReader;
import com.netposa.gis.server.exception.VectorTileException;

import java.util.concurrent.Callable;

public class GaodeVectorTileLabelTask implements Callable<JSONObject> {

    private VectorTileParam param;

    private VectorTileReader tileReader;

    public GaodeVectorTileLabelTask(VectorTileParam param) {
        super();

        this.param = param;
        this.tileReader = new VectorTileReader();
    }

    @Override
    public JSONObject call() throws Exception {

        String serviceName = this.param.getServiceName();
        // 是否大于数据文件的最大级别
        boolean precision = this.param.isPrecision();

        if (precision) {
            return tileReader.readVectorTile(serviceName, this.param.getFileX(), this.param.getFileY(),
                    this.param.getFileL());
        } else {
            try {
                return tileReader.readVectorTile(serviceName, this.param.getCustomX(), this.param.getCustomY(),
                        this.param.getCustomL());
            } catch (VectorTileException e) {
                return new JSONObject();
            }
        }
    }

}
