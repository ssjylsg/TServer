package com.netposa.gis.server.service;

import com.netposa.gis.server.bean.CompactMap;
import com.netposa.gis.server.bean.DataResult;
import com.netposa.gis.server.dao.DAOFactory;
import com.netposa.gis.server.dao.IPoolBaseDAO;
import com.netposa.gis.server.exception.DataAccessException;
import com.netposa.gis.server.utils.NetposaHelper;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.simple.JSONArray;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;

/**
 * 三维模型service
 * 
 * @author wj
 * 
 */
@Service("modelService")
public class ModelService extends BaseServiceImpl {
    private static final Log LOGGER = LogFactory.getLog(ModelService.class);

    // model文件虚拟目录
    private static String MODEL_VIRTUAL_PATH;

    static {
        MODEL_VIRTUAL_PATH = new StringBuilder(NPGIS_DATA_DIRECTORY).append("model").append(File.separator).toString();
    }

    /**
     * 获取服务配置信息
     * 
     * @param service
     *            服务名称
     * @return
     */
    public String getConfigByName(String service) {
        StringBuilder result = new StringBuilder();
        CompactMap config = NetposaHelper.getMapConfigByMapName(service);
        if (config == null) {
            LOGGER.error(service + "服务不存在!");
            return result.toString();
        }
        String type = config.getType();
        if (!"model".equals(type)) {
            LOGGER.error(service + "服务类型不正确!");
            return result.toString();
        }
        String[] urlTemps = config.getMapUrl().split("/");
        if (urlTemps.length != 2) {
            LOGGER.error(service + "文件路径不正确!");
            return result.toString();
        }

        String fileName = new StringBuilder(MODEL_VIRTUAL_PATH).append(urlTemps[1]).append(File.separator)
                .append("config").toString();
        File file = new File(fileName);
        if (!file.exists()) {
            LOGGER.error(service + " config 不存在!");
            return result.toString();
        }
        try (BufferedReader reader = new BufferedReader(new FileReader(file))) {
            String tempString = null;
            while ((tempString = reader.readLine()) != null) {
                result.append(tempString);
            }
        } catch (IOException e) {
            LOGGER.error(e);
        }
        return result.toString();
    }

    /**
     * 自定义条件查询指定服务 smid
     * 
     * @param service
     *            服务名称
     * @param condition
     *            自定义条件
     * @return
     */
    public DataResult listSmidByCondition(String service, String condition) {
        DataResult result = new DataResult();
        if (NetposaHelper.isEmpty(service)) {
            result.setError("服务名称不能为空");
            return result;
        }
        if (NetposaHelper.isEmpty(condition)) {
            result.setError("查询条件不能为空");
            return result;
        }

        StringBuilder sql = new StringBuilder("SELECT smid FROM ").append(service).append("_model WHERE ")
                .append(condition);

        Object[] params = new Object[] {};

        DAOFactory poolDAOFactory = DAOFactory.getDAOFactory(DAOFactory.POOL);
        IPoolBaseDAO dao = (IPoolBaseDAO) poolDAOFactory.getBaseDao();

        try {
            JSONArray resultArr = dao.preparedQuery(sql.toString(), params);
            result.setData(resultArr);
        } catch (DataAccessException e) {
            result.setError("查询 smid 异常");
            LOGGER.error("查询 smid 异常：" + e);
        }

        return result;
    }

    /**
     * 根据smid查询模型属性信息
     * 
     * @param service
     *            服务名称
     * @param smid
     * @return
     */
    public DataResult getModelInfoBySmid(String service, String smid) {
        DataResult result = new DataResult();
        if (NetposaHelper.isEmpty(service)) {
            result.setError("服务名称不能为空");
            return result;
        }
        if (NetposaHelper.isEmpty(smid)) {
            result.setError("模型编号不能为空");
            return result;
        }

        StringBuilder sql = new StringBuilder("SELECT mid,smid,name,description,floor FROM ").append(service).append(
                "_model WHERE smid=?");

        DAOFactory poolDAOFactory = DAOFactory.getDAOFactory(DAOFactory.POOL);
        IPoolBaseDAO dao = (IPoolBaseDAO) poolDAOFactory.getBaseDao();
        Object[] params = new Object[] { Integer.parseInt(smid) };
        try {
            JSONArray resultArr = dao.preparedQuery(sql.toString(), params);
            if (!resultArr.isEmpty()) {
                result.setData(resultArr.get(0));
            }

        } catch (DataAccessException e) {
            result.setError("查询模型属性信息异常");
            LOGGER.error("查询模型属性信息异常：" + e);
        }

        return result;
    }
}
