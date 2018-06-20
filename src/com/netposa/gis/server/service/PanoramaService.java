package com.netposa.gis.server.service;

import com.netposa.gis.server.bean.DataResult;
import com.netposa.gis.server.bean.QueryParameterCollection;
import com.netposa.gis.server.bean.TableKeyEnum;
import com.netposa.gis.server.dao.DAOFactory;
import com.netposa.gis.server.dao.IPoolBaseDAO;
import com.netposa.gis.server.exception.DataAccessException;
import com.netposa.gis.server.utils.DBManager;
import com.netposa.gis.server.utils.NetposaHelper;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.UUID;

/**
 * 全景service
 * @author wj
 *
 */
@Service("panoramaService")
public class PanoramaService extends BaseServiceImpl {
    private static final Log LOGGER = LogFactory.getLog(PanoramaService.class);
    
    // 全景虚拟目录
    private static String PANORAMA_IMG_PATH;
    
    static {
        PANORAMA_IMG_PATH = new StringBuilder(NPGIS_DATA_DIRECTORY).append("panorama").append(File.separator)
                .toString();
    }

    // id 查询配置信息
    public JSONObject getOutdoorConfigById(String pid) {
        JSONObject result = new JSONObject();
        
        if (pid.length() == 0) {
            return result;
        }
        
        String tableName = QueryParameterCollection.getInstance().getTableNameByKey(TableKeyEnum.PANOCONFIG);
        if (NetposaHelper.isEmpty(tableName)) {
            LOGGER.error("没有配置室外全景表");
            return result;
        }

        StringBuilder sql = new StringBuilder("SELECT panoid,type,name,x,y,northdir,heading AS yaw,roll,pitch FROM ")
            .append(tableName)
            .append(" WHERE panoid = ?");

        Object[] params = new Object[] { pid };

        DAOFactory poolDAOFactory = DAOFactory.getDAOFactory(DAOFactory.POOL);
        IPoolBaseDAO dao = (IPoolBaseDAO) poolDAOFactory.getBaseDao();

        try {
            JSONArray results = dao.preparedQuery(sql.toString(), params);
            if (!results.isEmpty()) {
                result = (JSONObject) results.get(0);
            }
        } catch (DataAccessException e) {
            LOGGER.error("查询室外全景配置信息异常：" + e);
        }
        
        return result;
    }

    // 位置查询最近配置信息
    public JSONObject getOutdoorConfigByPosition(String positionWKT) {
        JSONObject result = new JSONObject();
        
        if (positionWKT.length() == 0) {
            return result;
        }

        String tableName = QueryParameterCollection.getInstance().getTableNameByKey(TableKeyEnum.PANOCONFIG);
        if (NetposaHelper.isEmpty(tableName)) {
            LOGGER.error("没有配置室外全景表");
            return result;
        }

        int distance = 50;
        String sql = getConfigsByPositionSql(tableName, false);

        Object[] params = new Object[] { positionWKT, distance };

        DAOFactory poolDAOFactory = DAOFactory.getDAOFactory(DAOFactory.POOL);
        IPoolBaseDAO dao = (IPoolBaseDAO) poolDAOFactory.getBaseDao();

        try {
            JSONArray results = dao.preparedQuery(sql, params);
            if (!results.isEmpty()) {
                result = (JSONObject) results.get(0);
            }
        } catch (DataAccessException e) {
            LOGGER.error("查询室外全景配置信息异常：" + e);
        }

        return result;
    }

    // 位置查询范围内配置信息
    public JSONArray listOutdoorConfigByPosition(String positionWKT, String distanceStr) {
        JSONArray results = new JSONArray();
        
        if (positionWKT.length() == 0) {
            return results;
        }
        
        String tableName = QueryParameterCollection.getInstance().getTableNameByKey(TableKeyEnum.PANOCONFIG);
        if (NetposaHelper.isEmpty(tableName)) {
            LOGGER.error("没有配置室外全景表");
            return results;
        }

        String sql = getConfigsByPositionSql(tableName, true);

        Object[] params = new Object[] { positionWKT, Integer.parseInt(distanceStr) };

        DAOFactory poolDAOFactory = DAOFactory.getDAOFactory(DAOFactory.POOL);
        IPoolBaseDAO dao = (IPoolBaseDAO) poolDAOFactory.getBaseDao();

        try {
            results = dao.preparedQuery(sql, params);
        } catch (DataAccessException e) {
            LOGGER.error("查询室外全景配置信息异常：" + e);
        }

        return results;
    }

    // 几何查询配置信息
    public JSONArray listOutdoorConfigByGeo(String geoWKT) {
        JSONArray results = new JSONArray();
        
        if (geoWKT.length() == 0) {
            return results;
        }
        
        String tableName = QueryParameterCollection.getInstance().getTableNameByKey(TableKeyEnum.PANOCONFIG);
        if (NetposaHelper.isEmpty(tableName)) {
            LOGGER.error("没有配置室外全景表");
            return results;
        }

        String sql = getConfigsByGeoSql(tableName);

        Object[] params = new Object[] { geoWKT };

        DAOFactory poolDAOFactory = DAOFactory.getDAOFactory(DAOFactory.POOL);
        IPoolBaseDAO dao = (IPoolBaseDAO) poolDAOFactory.getBaseDao();

        try {
            results = dao.preparedQuery(sql, params);
        } catch (DataAccessException e) {
            LOGGER.error("查询室外全景配置信息异常：" + e);
        }

        return results;
    }

    // 查询所有室外全景信息
    public JSONArray listOutdoorConfig() {
        JSONArray results = new JSONArray();

        String tableName = QueryParameterCollection.getInstance().getTableNameByKey(TableKeyEnum.PANOCONFIG);
        if (NetposaHelper.isEmpty(tableName)) {
            LOGGER.error("没有配置室外全景表");
            return results;
        }

        StringBuilder sql = new StringBuilder("SELECT panoid,type,name,x,y,northdir,heading AS yaw,roll,pitch FROM ")
            .append(tableName);

        DAOFactory poolDAOFactory = DAOFactory.getDAOFactory(DAOFactory.POOL);
        IPoolBaseDAO dao = (IPoolBaseDAO) poolDAOFactory.getBaseDao();

        try {
            results = dao.preparedQuery(sql.toString(), new Object[] {});
        } catch (DataAccessException e) {
            LOGGER.error("查询室外全景配置信息异常：" + e);
        }

        return results;
    }
    
    // 查询所有室内全景点位信息
    public JSONArray listIndoorPoint() {
        JSONArray results = new JSONArray();

        String tableName = QueryParameterCollection.getInstance().getTableNameByKey(TableKeyEnum.SNPANOPOINT);
        if (NetposaHelper.isEmpty(tableName)) {
            LOGGER.error("没有配置室内全景点位表");
            return results;
        }

        StringBuilder sql = new StringBuilder("SELECT name,x,y,uuid FROM ").append(tableName);

        DAOFactory poolDAOFactory = DAOFactory.getDAOFactory(DAOFactory.POOL);
        IPoolBaseDAO dao = (IPoolBaseDAO) poolDAOFactory.getBaseDao();

        try {
            results = dao.preparedQuery(sql.toString(), new Object[] {});
        } catch (DataAccessException e) {
            LOGGER.error("查询室内全景点位信息异常：" + e);
        }

        return results;
    }

    // uuid 查询室内全景点位信息
    public JSONObject getIndorrPointById(String uuid) {
        JSONObject result = new JSONObject();
        
        if (uuid.length() == 0) {
            return result;
        }
        
        String tableName = QueryParameterCollection.getInstance().getTableNameByKey(TableKeyEnum.SNPANOPOINT);
        if (NetposaHelper.isEmpty(tableName)) {
            LOGGER.error("没有配置室内全景点位表");
            return result;
        }

        StringBuilder sql = new StringBuilder("SELECT name,x,y,uuid FROM ")
            .append(tableName)
            .append(" WHERE uuid = ?");
        
        Object[] params = new Object[] { uuid };

        DAOFactory poolDAOFactory = DAOFactory.getDAOFactory(DAOFactory.POOL);
        IPoolBaseDAO dao = (IPoolBaseDAO) poolDAOFactory.getBaseDao();

        try {
            JSONArray results = dao.preparedQuery(sql.toString(), params);
            if (!results.isEmpty()) {
                result = (JSONObject) results.get(0);
            }
        } catch (DataAccessException e) {
            LOGGER.error("查询室内全景点位信息异常：" + e);
        }

        return result;
    }

    // parentid 查询室内配置信息
    public JSONArray listIndoorConfigByParentId(String parentId) {
        return this.listSnConfigByCondition("parentid", parentId);
    }

    // panoid 查询室内配置信息
    public JSONArray listIndoorConfigByPanoId(String panoId) {
        return this.listSnConfigByCondition("panoid", panoId);
    }
    
    // 保存上传的室外全景图片并给室外全景表中写入数据
    public DataResult saveOutdoorData(MultipartFile[] files, String panoid, String realnName, String x, String y) {
       // boolean result = false;
        DataResult result = new DataResult();
        if (files.length != 1) {
            LOGGER.error("只能上传一张图片");
            result.setError("只能上传一张图片");
            return result;
        }
        if (realnName.length() == 0) {
            LOGGER.error("参数 realnName 不能为空");
            result.setError("参数 realnName 不能为空");
            return result;
        }
        if (x.length() == 0) {
            LOGGER.error("参数 x 不能为空");
             result.setError("参数 x 不能为空");
            return result;
        }
        if (y.length() == 0) {
            LOGGER.error("参数 y 不能为空");
            result.setError("参数 y 不能为空");
            return result;
        }

        result = this.insertOutdoorData(panoid, realnName, x, y);        
        if (result.getIsSucess()) {
        	result = this.savePanoramaImg(files, panoid);
        }
        return result;
    }
    
    // 修改室外全景数据
    public boolean updateOutdoorData(String panoid, String name, String northdir) {
        boolean result = false;

        if (panoid.length() == 0) {
            LOGGER.error("参数 panoid 不能为空");
            return result;
        }
        if (name.length() == 0) {
            LOGGER.error("参数 name 不能为空");
            return result;
        }

        String tableName = QueryParameterCollection.getInstance().getTableNameByKey(TableKeyEnum.PANOCONFIG);
        if (NetposaHelper.isEmpty(tableName)) {
            LOGGER.error("没有配置室外全景表");
            return result;
        }

        StringBuilder sql = new StringBuilder("UPDATE ").append(tableName).append(
                " SET name=?,northdir=? WHERE panoid=?");

        DAOFactory poolDAOFactory = DAOFactory.getDAOFactory(DAOFactory.POOL);
        IPoolBaseDAO dao = (IPoolBaseDAO) poolDAOFactory.getBaseDao();
        Object[] params = { name, Double.valueOf(northdir), panoid };

        int rowCount = 0;
        try {
            rowCount = dao.preparedUpdate(sql.toString(), params);
        } catch (DataAccessException e) {
            LOGGER.error("更新室外全景配置信息异常：" + e);
        }
        if (rowCount == 1) {
            result = true;
        }

        return result;
    }
    
    // 删除室外全景数据
    public DataResult deleteOutdoorData(String panoid) {
        DataResult result = new DataResult();
        if (panoid.length() == 0) {
            result.setError("参数 panoid 不能为空");
            return result;
        }
        if (!this.deletePanoramaConfig(TableKeyEnum.PANOCONFIG, panoid)) {
            result.setError("删除室外全景数据失败");
            result.setErrorCode("500");
        }

        return result;
    }
    
    // 插入室内全景点位数据
    @SuppressWarnings({ "all" })
    public DataResult insertIndoorPointData(String name, String x, String y) {
        DataResult result = new DataResult();
        
        if (name.length() == 0) {
            result.setError("参数 name 不能为空");
            return result;
        }

        if (x.length() == 0) {
            result.setError("参数 x 不能为空");
            return result;
        }

        if (y.length() == 0) {
            result.setError("参数 y 不能为空");
            return result;
        }

        String tableName = QueryParameterCollection.getInstance().getTableNameByKey(TableKeyEnum.SNPANOPOINT);
        if (NetposaHelper.isEmpty(tableName)) {
            LOGGER.error("没有配置室内全景点位表");
            result.setError("没有配置室内全景点位表");
            result.setErrorCode("500");
            return result;
        }

        String uuid = UUID.randomUUID().toString();
        StringBuilder sql = new StringBuilder("INSERT INTO ").append(tableName).append("(name,x,y,uuid) ")
                .append("VALUES(?,?,?,?)");

        DAOFactory poolDAOFactory = DAOFactory.getDAOFactory(DAOFactory.POOL);
        IPoolBaseDAO dao = (IPoolBaseDAO) poolDAOFactory.getBaseDao();
        int rowCount = 0;

        try {
            Object[] params = { name, Double.valueOf(x), Double.valueOf(y), uuid };
            rowCount = dao.preparedInsert(sql.toString(), params);
        } catch (DataAccessException | NullPointerException e) {
            LOGGER.error("插入室内全景点位信息异常：" + e);
            result.setError("插入室内全景点位信息失败");
            result.setErrorCode("500");
        }
        if (rowCount == 1) {
            JSONObject obj = new JSONObject();
            obj.put("positionid", uuid);
            result.setData(obj);
        }

        return result;
    }
    
    // 插入室内全景配置数据
    @SuppressWarnings({ "all" })
    public DataResult insertIndoorConfigData(String parentid, String name, String floor, String isstart,
            String northdir, String heading, String roll, String pitch, String type) {
        DataResult result = new DataResult();
        
        if (parentid.length() == 0) {
            result.setError("参数 parentid 不能为空");
            return result;
        }

        if (name.length() == 0) {
            result.setError("参数 name 不能为空");
            return result;
        }

        String tableName = QueryParameterCollection.getInstance().getTableNameByKey(TableKeyEnum.SNPANOCONFIG);
        if (NetposaHelper.isEmpty(tableName)) {
            LOGGER.error("没有配置室内全景配置表");
            result.setError("没有配置室内全景配置表");
            result.setErrorCode("500");
            return result;
        }

        String panoid = UUID.randomUUID().toString();

        StringBuilder sql = new StringBuilder("INSERT INTO ").append(tableName)
                .append("(panoid,name,heading,northdir,roll,pitch,floor,isstart,type,parentid) ")
                .append("VALUES(?,?,?,?,?,?,?,?,?,?)");

        DAOFactory poolDAOFactory = DAOFactory.getDAOFactory(DAOFactory.POOL);
        IPoolBaseDAO dao = (IPoolBaseDAO) poolDAOFactory.getBaseDao();
        int rowCount = 0;

        try {
            Object[] params = { panoid, name, Double.valueOf(heading), Double.valueOf(northdir), Double.valueOf(roll),
                    Double.valueOf(pitch), Double.valueOf(floor), Double.valueOf(isstart), type, parentid };
            rowCount = dao.preparedInsert(sql.toString(), params);
        } catch (DataAccessException | NullPointerException e) {
            LOGGER.error("插入室内全景配置信息异常：" + e);
            result.setError("插入室内全景配置信息失败");
            result.setErrorCode("500");
        }
        if (rowCount == 1) {
            JSONObject obj = new JSONObject();
            obj.put("panoid", panoid);
            result.setData(obj);
        }

        return result;
    }
    
    // 室内全景图片上传
    public DataResult indoorImageUpload(MultipartFile[] files, String panoid) {
        DataResult result = new DataResult();

        if (panoid.length() == 0) {
            result.setError("参数 panoid 不能为空");
            return result;
        }
        if (files.length != 1) {
            result.setError("只能上传一张图片");
            return result;
        }
        MultipartFile file = files[0];
        if (file.getSize() == 0) {
            result.setError("没有上传图片");
            return result;
        }
        if (!"image/jpeg".equals(file.getContentType())) {
            result.setError("图片格式不正确");
            return result;
        }

        try {
            BufferedImage image = ImageIO.read(file.getInputStream());
            if (image != null) {
                int width = image.getWidth();
                int height = image.getHeight();
                double proportion = width / height;
                if (proportion != 2.0) {
                    result.setError("图片宽高比只能等于 2:1");
                    return result;
                }
            }
        } catch (IOException e) {
            LOGGER.error(e);
        }
        
        
        StringBuilder imgPath = new StringBuilder(PANORAMA_IMG_PATH).append(panoid).append(File.separator)
                .append(panoid).append(".jpg");
        File imgFile = new File(imgPath.toString());
        if (imgFile.isFile() && imgFile.exists()) {
            result.setError("同名图片已存在");
            return result;
        }
        DataResult  dataResult = this.savePanoramaImg(files, panoid);
        if (!dataResult.getIsSucess()) {
           // result.setError("室内全景图片上传失败");
            result.setErrorCode("500");
        }
        return result;
    }
    
    // 删除室内全景(删除点位表、配置表及图片)
    public DataResult deleteIndoorData(String positionid) {
        DataResult result = new DataResult();

        if (positionid.length() == 0) {
            result.setError("参数 positionid 不能为空");
            return result;
        }

        String pointTableName = QueryParameterCollection.getInstance().getTableNameByKey(TableKeyEnum.SNPANOPOINT);
        String configTableName = QueryParameterCollection.getInstance().getTableNameByKey(TableKeyEnum.SNPANOCONFIG);

        if (NetposaHelper.isEmpty(pointTableName)) {
            result.setError("没有配置室内全景点位表");
            return result;
        }

        StringBuilder pointSql = new StringBuilder("DELETE FROM ").append(pointTableName).append(" WHERE uuid=?");
        StringBuilder configSql = new StringBuilder();

        if (!NetposaHelper.isEmpty(configTableName)) {
            configSql.append("DELETE FROM ").append(configTableName).append(" WHERE parentid=?");
        } else {
            LOGGER.error("没有配置室内全景配置表");
        }

        // 查询配置表中parentid等于uuid的数据
        JSONArray configs = this.listSnConfigByCondition("parentid", positionid);
        boolean tableSuccessfully = this.deleteIndoorTableData(pointSql.toString(), configSql.toString(), positionid);
        boolean imageSuccessfully = false;
        if (tableSuccessfully) {
            imageSuccessfully = this.deleteIndoorImg(configs);
        }

        if (!(tableSuccessfully && imageSuccessfully)) {
            result.setError("删除室内全景信息失败");
        }

        return result;
    }
    
    // 删除室内配置表信息及对应的图片
    public DataResult deleteIndoorConfigData(String panoid) {
        DataResult result = new DataResult();
        if (panoid.length() == 0) {
            result.setError("参数 panoid 不能为空");
            return result;
        }
        if (!this.deletePanoramaConfig(TableKeyEnum.SNPANOCONFIG, panoid)) {
            result.setError("删除室内全景配置信息失败");
        }
        return result;
    }
    
    // 根据 parentid 删除室内全景图片
    private boolean deleteIndoorImg(JSONArray configs) {
        boolean result = true;

        for (int i = 0, ci = configs.size(); i < ci; i++) {
            JSONObject item = (JSONObject) configs.get(i);
            String panoid = (String) item.get("panoid");
            this.deletePanoramaImg(panoid);
        }

        return result;
    }
    
    // 根据室内全景点位表 uuid 删除点位表及关联的配置表信息
    private boolean deleteIndoorTableData(String pointSql, String configSql, String panoid) {
        boolean result = false;
        String logMsg = "删除室内全景信息异常：";

        Connection conn = DBManager.getConnecion();
        PreparedStatement pstmt = null;
        PreparedStatement pstmt2 = null;

        try {
            conn.setAutoCommit(false);
            pstmt = conn.prepareStatement(pointSql);
            pstmt.setObject(1, panoid);
            pstmt.executeUpdate();
            if (configSql.length() != 0) {
                pstmt2 = conn.prepareStatement(configSql);
                pstmt2.setObject(1, panoid);
                pstmt2.executeUpdate();
            }
            result = true;
        } catch (SQLException e) {
            LOGGER.error(logMsg + e);
            result = false;
            try {
                conn.rollback();
            } catch (SQLException e1) {
                LOGGER.error(logMsg + e1);
            }
        } finally {
            if (pstmt != null) {
                try {
                    pstmt.close();
                    pstmt = null;
                } catch (SQLException e) {
                    LOGGER.error(logMsg + e);
                }
            }
            if (pstmt2 != null) {
                try {
                    pstmt2.close();
                    pstmt2 = null;
                } catch (SQLException e) {
                    LOGGER.error(logMsg + e);
                }
            }
            try {
                conn.setAutoCommit(true);
            } catch (SQLException e) {
                LOGGER.error(logMsg + e);
            }
            DBManager.closeConnection(conn);
        }
        return result;
    }
    
    // 删除全景配置表信息及全景图片
    private boolean deletePanoramaConfig(TableKeyEnum tableKey, String panoid) {
        boolean result = false;

        String tableName = QueryParameterCollection.getInstance().getTableNameByKey(tableKey);

        if (NetposaHelper.isEmpty(tableName)) {
            LOGGER.error("没有配置全景配置表");
            return result;
        }

        StringBuilder sql = new StringBuilder("DELETE FROM ").append(tableName).append(" WHERE panoid=?");

        DAOFactory poolDAOFactory = DAOFactory.getDAOFactory(DAOFactory.POOL);
        IPoolBaseDAO dao = (IPoolBaseDAO) poolDAOFactory.getBaseDao();
        Object[] params = { panoid };
        int rowCount = 0;
        try {
            rowCount = dao.preparedDelete(sql.toString(), params);
        } catch (DataAccessException e) {
            LOGGER.error("删除全景配置信息异常：" + e);
        }
        if (rowCount == 1) {
            result = true;

            this.deletePanoramaImg(panoid);
        }

        return result;
    }
    
    // 删除全景图片
    private void deletePanoramaImg(String panoid) {
        StringBuilder itemPath = new StringBuilder(PANORAMA_IMG_PATH).append(panoid).append(File.separator);
        boolean deleted = deleteDirectory(itemPath.toString());
        if (!deleted) {
            LOGGER.error("删除室外全景图片文件 " + panoid + "失败");
        }
    }
    
    // 删除目录（文件夹）以及目录下的文件
    private boolean deleteDirectory(String itemPath) {
        File dirFile = new File(itemPath.toString());

        if (!dirFile.exists() || !dirFile.isDirectory()) {
            return false;
        }

        boolean flag = true;
        File[] files = dirFile.listFiles();

        for (int i = 0, ci = files.length; i < ci; i++) {
            if (files[i].isFile()) {
                flag = this.deleteFile(files[i].getAbsolutePath());

                if (!flag) {
                    break;
                }
            } else {
                flag = deleteDirectory(files[i].getAbsolutePath());
                if (!flag) {
                    break;
                }
            }
        }

        if (!flag) {
            return false;
        }

        // 删除当前目录
        if (dirFile.delete()) {
            return true;
        } else {
            return false;
        }
    }
    
    // 删除文件
    private boolean deleteFile(String sPath) {
        boolean flag = false;
        File file = new File(sPath);

        if (file.isFile() && file.exists()) {
            file.delete();
            flag = true;
        }
        return flag;
    }
    
    // 保存全景图片
    private DataResult savePanoramaImg(MultipartFile[] files, String panoid) {
    	DataResult result = new DataResult();
        File panoramaPath = new File(PANORAMA_IMG_PATH);
        if (panoramaPath.isDirectory()) {

            StringBuilder itemPath = new StringBuilder(PANORAMA_IMG_PATH).append(panoid);

            if (this.createPanoItemDir(itemPath.toString())) {
                MultipartFile file = files[0];

                if (!file.isEmpty()) {
                    try {
                        file.transferTo(new File(itemPath.append(File.separator).append(panoid).append(".jpg").toString()));

                         
                    } catch (IllegalStateException | IOException e) {
                        LOGGER.error(e);
                        result.setError(e.getMessage());
                    }
                }
            }

        } else {
            LOGGER.error("全景虚拟目录不存在!");
            result.setError("全景虚拟目录不存在!");
        }

        return result;
    }
    
    // 数据库插入室外全景数据
    private DataResult insertOutdoorData(String panoid, String realnName, String x, String y) {
    	DataResult result = new DataResult();

        String tableName = QueryParameterCollection.getInstance().getTableNameByKey(TableKeyEnum.PANOCONFIG);

        if (NetposaHelper.isEmpty(tableName)) {
            LOGGER.error("没有配置室外全景表");
            result.setError("没有配置室外全景表");
            return result;
        }

        StringBuilder sql = new StringBuilder("INSERT INTO ").append(tableName)
                .append("(panoid,type,name,x,y,northdir,heading,roll,pitch) ").append("VALUES(?,?,?,?,?,?,?,?,?)");

        
        DAOFactory poolDAOFactory = DAOFactory.getDAOFactory(DAOFactory.POOL);
        IPoolBaseDAO dao = (IPoolBaseDAO) poolDAOFactory.getBaseDao();
        Object[] params = { panoid, "equirectangular", realnName, Double.valueOf(x), Double.valueOf(y), 180, 180, 0, 0 };

        int rowCount = 0;
        try {
            rowCount = dao.preparedInsert(sql.toString(), params);
        } catch (DataAccessException e) {
            LOGGER.error("插入室外全景配置信息异常：" + e);
            result.setError("插入室外全景配置信息异常：" + e);
        }
        if (rowCount != 1) {
        	result.setError("未知异常，期望根据结果为1，实际为：" + rowCount);
        }
        return result;
    }

    // 创建全景图片目录
    private boolean createPanoItemDir(String itemPath) {
        boolean result = false;
        File itemFile = new File(itemPath);
        if (!itemFile.isDirectory()) {
            result = itemFile.mkdir();
        }

        return result;
    }

    private JSONArray listSnConfigByCondition(String queryField, String queryText) {
        JSONArray results = new JSONArray();
        
        if (queryText.length() == 0) {
            return results;
        }
        
        String tableName = QueryParameterCollection.getInstance().getTableNameByKey(TableKeyEnum.SNPANOCONFIG);
        if (NetposaHelper.isEmpty(tableName)) {
            LOGGER.error("没有配置室内全景配置表");
            return results;
        }

        StringBuilder sql = new StringBuilder("SELECT panoid,name,heading AS yaw,northdir,roll,pitch,floor,isstart,type,parentid FROM ")
            .append(tableName)
            .append(" WHERE ")
            .append(queryField)
            .append(" = ?");

        Object[] params = new Object[] { queryText };

        DAOFactory poolDAOFactory = DAOFactory.getDAOFactory(DAOFactory.POOL);
        IPoolBaseDAO dao = (IPoolBaseDAO) poolDAOFactory.getBaseDao();

        try {
            results = dao.preparedQuery(sql.toString(), params);
        } catch (DataAccessException e) {
            LOGGER.error("查询室内全景配置信息异常：" + e);
        }

        return results;
    }

    private String getConfigsByGeoSql(String tableName) {
        StringBuilder sql = new StringBuilder("SELECT panoid,type,name,x,y,northdir,heading AS yaw,roll,pitch FROM ")
            .append(tableName)
            .append(" WHERE ")
            .append("ST_Intersects (")
            .append(xyToGeometry())
            .append(",")
            .append(wktToGeometry())
            .append(")");

        return sql.toString();
    }

    private String getConfigsByPositionSql(String tableName, boolean multi) {
        StringBuilder sql = new StringBuilder("SELECT * FROM (")
            .append("SELECT panoid,type,name,x,y,northdir,heading AS yaw,roll,pitch,")
            .append("ST_Distance (")
            .append(xyToGeometry())
            .append(",")
            .append(wktToGeometry())
            .append(") AS distance ")
            .append("FROM ")
            .append(tableName)
            .append(" ORDER BY ")
                /*
                 * .append(wktToGeometry(xyToWKT())) .append("<-> ")
                 * .append(wktToGeometry(positionWKT))
                 */
            .append("distance ")
            .append(queryMultiple(multi))
            .append(") T ")
            .append("WHERE ")
            .append("distance <= ?");

        return sql.toString();
    }

    private String queryMultiple(boolean multi) {
        if (multi) {
            return "LIMIT 100";
        }
        return "LIMIT 1";
    }

    private String xyToWKT() {
        StringBuilder str = new StringBuilder("POINT('")
            .append(" || ")
            .append("x")
            .append(" || ' ' || ")
            .append("y")
            .append(" || ")
            .append("')");
        
        return str.toString();
    }

    private String wktToGeometry() {
        StringBuilder sql = new StringBuilder("ST_Transform (")
            .append("ST_GeomFromText (?,")
            .append("4326),")
            .append("2163)");
        
        return sql.toString();
    }

    private String xyToGeometry() {
        StringBuilder sql = new StringBuilder("ST_Transform (")
            .append("ST_GeomFromText (")
            .append("'")
            .append(xyToWKT())
            .append("',")
            .append("4326),")
            .append("2163)");

        return sql.toString();
    }
}
