package com.netposa.gis.server.bean;

import com.alibaba.fastjson.JSONObject;
import com.netposa.gis.server.exception.VectorTileException;
import com.netposa.gis.server.utils.NetposaHelper;
import com.netposa.gis.server.utils.VectorTileUtil;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;

public class VectorTileReader {
    private static final Log LOGGER = LogFactory.getLog(VectorTileReader.class);
    
    private String bundlxFileName;
    private String bundleFileName;
    private int index;

    /*
     * 读取数据文件
     */
    @SuppressWarnings("all")
    public JSONObject readVectorTile(String serviceName, String x, String y, String zoom) throws VectorTileException {

        JSONObject tileData = new JSONObject();

        String key = VectorTileUtil.keyGenerator(serviceName, x, y, zoom);

        if (VectorTileCache.isKeyInCache(key)) {
            tileData = VectorTileCache.getFromCache(key);
        } else {
            try {
                tileData = this.readVectorTileFromFile(serviceName, x, y, zoom);
            } catch (IOException e) {
                LOGGER.error(e);
                throw new VectorTileException(e);
            }
            VectorTileCache.putToCache(key, tileData);
        }

        return tileData;
    }

    @SuppressWarnings("all")
    private JSONObject readVectorTileFromFile(String serviceName, String x, String y, String zoom) throws IOException {
        JSONObject tileData = new JSONObject();

        this.getTileJsonFile(serviceName, x, y, zoom);

        try (FileInputStream isBundlx = new FileInputStream(bundlxFileName)) {
            long skippedNum = (long) (16 + 5 * index);

            long countBytes = isBundlx.skip(skippedNum);

            byte[] buffer = new byte[5];
            isBundlx.read(buffer, 0, 5);

            long offset = (long) (buffer[0] & 0xff) + (long) (buffer[1] & 0xff) * 256 + (long) (buffer[2] & 0xff)
                    * 65536 + (long) (buffer[3] & 0xff) * 16777216 + (long) (buffer[4] & 0xff) * 4294967296L;

            try (FileInputStream isBundle = new FileInputStream(bundleFileName)) {
                countBytes = isBundle.skip(offset);
                byte[] lengthBytes = new byte[4];
                isBundle.read(lengthBytes, 0, 4);
                int length = (int) (lengthBytes[0] & 0xff) + (int) (lengthBytes[1] & 0xff) * 256
                        + (int) (lengthBytes[2] & 0xff) * 65536 + (int) (lengthBytes[3] & 0xff) * 16777216;
                byte[] result = new byte[length];
                isBundle.read(result, 0, length);
                String tileContent = new String(result, "UTF-8");

                if (tileContent != null && tileContent.length() != 0) {
                    //tileData = JSONObject.fromObject(tileContent);
                    tileData = JSONObject.parseObject(tileContent);
                }
            }
        }

        return tileData;
    }

    private void getTileJsonFile(String serviceName, String x, String y, String zoom) throws IOException {
        StringBuilder filePathBuilder = new StringBuilder(VectorTileUtil.getContextPath());

        CompactMap compactMap = NetposaHelper.getMapConfigByMapName(serviceName);

        filePathBuilder.append(File.separator).append(compactMap.getMapUrl()).append(File.separator).append("Layers")
                .append(File.separator).append("_alllayers");

        int size = 128;
        int row = Integer.parseInt(x);
        int col = Integer.parseInt(y);
        String l = this.converLOD(zoom);

        int rGroup = size * (row / size);
        int cGroup = size * (col / size);

        String r = this.converRC(rGroup);
        String c = this.converRC(cGroup);

        index = size * (col - cGroup) + (row - rGroup);

        String filePath = filePathBuilder.append(File.separator).append(l).append(File.separator).append("R").append(r)
                .append("C").append(c).toString();
        bundlxFileName = filePath + ".npslx";
        bundleFileName = filePath + ".npsle";
    }

    private String converRC(int group) {
        String str = Integer.toHexString(group).toUpperCase();
        while (str.length() < 4) {
            str = "0" + str;
        }
        return str;
    }

    private String converLOD(String zoom) {
        int izoom = Integer.parseInt(zoom);
        return String.format("L%02d", izoom);
    }
}
