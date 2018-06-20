package com.netposa.gis.server.utils;

import com.netposa.gis.server.bean.CompactMap;
import com.netposa.gis.server.bean.NPGISMap;
import com.netposa.gis.server.bean.ServerInfo;
import com.vividsolutions.jts.geom.Geometry;
import com.vividsolutions.jts.io.ParseException;
import com.vividsolutions.jts.io.WKTReader;
import net.sf.ehcache.Cache;
import net.sf.ehcache.CacheManager;
import net.sf.ehcache.Element;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import javax.servlet.http.HttpServletRequest;
import java.beans.XMLDecoder;
import java.beans.XMLEncoder;
import java.io.*;
import java.nio.MappedByteBuffer;
import java.nio.channels.FileChannel;
import java.nio.channels.FileChannel.MapMode;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Properties;

public class NetposaHelper {
    private static final Log LOGGER = LogFactory.getLog(NetposaHelper.class);
    
    // 选择的缓存策略，包括不使用缓存(no)、图片缓存(img)和内存缓存(memory)，默认不是用缓存。
    private static final String CACHE_POLICY_KEY = "policy";
    private static final String IMG_POLICY = "img";
    private static final String MEMORY_POLICY = "memory";

    // 获取缓存策略，策略包括三种：不使用缓存(no)、图片缓存(img)和内存缓存(memory)
    private static String cachePolicy = "no";
    // 图片缓存村存放目录
    private static String imgCacheBaseDir = "D:/notposa";

    // 获取 tileCache
    private static Cache tileCache = null;
    // 缓存图片类型
    private static final String IMG_TYPE = ".png";

    // 加载缓存配置
    // 获取tileCache
    static {
        try {
            Properties p4CacheProps = new Properties();

            p4CacheProps.load(NetposaHelper.class.getClassLoader().getResourceAsStream("policy4cache.properties"));
            cachePolicy = p4CacheProps.getProperty(CACHE_POLICY_KEY);

            if (IMG_POLICY.equalsIgnoreCase(cachePolicy)) {
                imgCacheBaseDir = getMapCacheDir();
            } else if (MEMORY_POLICY.equalsIgnoreCase(cachePolicy)) {
                tileCache = CacheManager.getInstance().getCache("tileCache");
            }
        } catch (IOException e) {
            LOGGER.error(e);
        }
    }
    
    private NetposaHelper(){
        super();
    }

    /**
     * 获取 tile,根据缓存策略分为三种情况： a:缓存策略为no时没有使用缓存，直接从紧凑文件解析
     * b:缓存策略为memory时从内存缓存中获取tile缓存，如果内存中没有tile的缓存则解析紧凑文件获取tile并把tile放进缓存中
     * c:缓存策略为img时从图片缓存中获取tile，如果没有图片缓存则解析紧凑文件获取tile并把tile生成图片进行缓存
     * 
     * @param serviceName
     *            服务名称
     * @param layerFileString
     *            地图切片存放位置，拷贝到工程mapTitle目录下的文件夹名称。e.g.:mapTitle/shanghaiBaseMap
     * @param zoom
     *            缩放等级
     * @param x
     *            行号
     * @param y
     *            列号
     * @return tile 字节数组
     */
    public static byte[] getTile(String serviceName, String layerFileString, String zoom, String x, String y) {
        byte[] result = null;

        if (MEMORY_POLICY.equalsIgnoreCase(cachePolicy)) {
            result = getTileFromMemoryCache(serviceName, layerFileString, zoom, x, y);
        } else if (IMG_POLICY.equalsIgnoreCase(cachePolicy)) {
            result = getTileFromImgCache(serviceName, layerFileString, zoom, x, y);
        } else {
            result = getTileFromFile(serviceName, layerFileString, zoom, x, y);
        }

        return result;
    }

    /**
     * 从内存中获取tile缓存信息，根据请求的服务名称缩放等级行号和列号构成的key获取tile
     * 
     * @param serviceName
     *            服务名称
     * @param layerFileString
     *            地图切片存放位置，拷贝到工程mapTitle目录下的文件夹名称。e.g.:mapTitle/shanghaiBaseMap
     * @param zoom
     *            缩放等级
     * @param x
     *            行号
     * @param y
     *            列号
     * @return tile 字节数组
     */
    private static byte[] getTileFromMemoryCache(String serviceName, String layerFileString, String zoom, String x,
            String y) {
        byte[] result = null;

        if (tileCache == null) {
            tileCache = CacheManager.getInstance().getCache("tileCache");
        }

        String lod = converLOD(zoom);
        String key = serviceName + lod + x + y;
        boolean keyInCache = tileCache.isKeyInCache(key);

        if (keyInCache) {
            Element element = tileCache.get(key);
            result = (byte[]) element.getObjectValue();
        } else {
            result = getTileFromFile(serviceName, layerFileString, zoom, x, y);

            if (result != null) {
                putToMemoryCache(key, result);
            }
        }

        return result;
    }

    /**
     * 从图片获取tile缓存信息，根据请求的服务名称缩放等级行号和列号获取tile图片
     * 
     * @param serviceName
     *            服务名称
     * @param layerFileString
     *            地图切片存放位置，拷贝到工程mapTitle目录下的文件夹名称。e.g.:mapTitle/shanghaiBaseMap
     * @param zoom
     *            缩放等级
     * @param x
     *            行号
     * @param y
     *            列号
     * @return tile 字节数组
     */
    private static byte[] getTileFromImgCache(String serviceName, String layerFileString, String zoom, String x,
            String y) {
        byte[] result = null;
        try {
            String lod = converLOD(zoom);

            String imgCacheDir = imgCacheBaseDir + "/Cache/" + serviceName + "/" + lod + "/" + x + "/" + y + IMG_TYPE;

            boolean cacheExists = imgCacheExists(imgCacheDir);
            if (cacheExists) {
                result = toByteArray(imgCacheDir);
            } else {
                result = readTileFromFile(layerFileString, zoom, x, y);
                if (result != null) {
                    createImgTile(serviceName, zoom, x, y, result);
                }
            }

        } catch (IOException e) {
            LOGGER.error(e);
        }

        return result;
    }
    
    /**
     * 从紧凑文件获取tile
     * 
     * @param serviceName
     *            服务名称
     * @param layerFileString
     *            紧凑文件位置
     * @param zoom
     *            缩放等级
     * @param x
     *            行号
     * @param y
     *            列号
     * @return tile 字节数组
     */
    private static byte[] getTileFromFile(String serviceName, String layerFileString, String zoom, String x, String y) {
        byte[] result = null;

        try {
            result = readTileFromFile(layerFileString, zoom, x, y);
        } catch (IOException e) {
            LOGGER.error(e);
        }

        return result;
    }

    /**
     * 生成tile图片
     * 
     * @param data
     *            解析bundle file 获取图片流
     * @param imgURL
     *            生成图片的Dir
     * @return tile 生成图片成功返回true，失败返回false
     * @throws IOException 
     */
    private static boolean createImg(byte[] data, String imgURL) throws IOException {
        boolean isCreated = false;

        try (FileOutputStream fileOutputStream = new FileOutputStream(imgURL)) {

            fileOutputStream.write(data);
            fileOutputStream.flush();
            isCreated = true;
        }
        return isCreated;
    }

    /**
     * 生成 img Tile
     * 
     * @param serviceName
     *            地图服务名称
     * @param zoom
     *            缩放的等级
     * @param x
     *            行号
     * @param y
     *            列号
     * @return tile 生成成功返回true，失败返回false
     * @throws IOException 
     */
    private static boolean createImgTile(String serviceName, String zoom, String x, String y, byte[] data) throws IOException {
        boolean isSuc = false;
        
        String lod = converLOD(zoom);
        String url = imgCacheBaseDir + "/Cache"+ "/" + serviceName+ "/" + lod+ "/" + x;
        
        boolean isDirs = true;
        File file = new File(url);
        if(!file.exists()){
            isDirs = file.mkdirs();
        }
    
        if(isDirs){
            isSuc = createImg(data, url+ "/" + y + IMG_TYPE);
        }

        return isSuc;
    }


    /**
     * 检查img cache是否存在
     * 
     * @param imgDir
     *            地图切片存放位置，拷贝到工程mapTitle目录下的文件夹名称。e.g.:mapTitle/shanghaiBaseMap
     *            列号
     * @return cache 存在返回true，不存在返回false
     */
    private static boolean imgCacheExists(String imgDir) {
        boolean cacheExists = true;
        File tileFile = new File(imgDir);
        if (!tileFile.exists()) {
            cacheExists = false;
        }
        return cacheExists;
    }

    /**
     * tile 放入 tileCache
     * 
     * @param key
     *            键值
     * @param data
     *            tile byte[]
     */
    private static void putToMemoryCache(String key, byte[] data) {
        if (!tileCache.isKeyInCache(key)) {
            Element element = new Element(key, data);
            tileCache.put(element);
        }
    }

    /**
     * 读取缓存图片，读取大数据效率高(每张图片不大体现不出来)
     * 
     * @param filename
     *            缓存图片dir
     * @return 缓存图片字节数组
     * @throws IOException
     */
    private static byte[] toByteArray(String filename) throws IOException {
        try (RandomAccessFile rf = new RandomAccessFile(filename, "r"); FileChannel fc = rf.getChannel()) {
            MappedByteBuffer byteBuffer = fc.map(MapMode.READ_ONLY, 0, fc.size()).load();
            byte[] result = new byte[(int) fc.size()];
            if (byteBuffer.remaining() > 0) {
                byteBuffer.get(result, 0, byteBuffer.remaining());
            }
            return result;
        }
    }
    
    /**
     * 地图图片缓存路径,默认和tomcat同级下的mapCache目录下
     * @return
     */
    private static String getMapCacheDir(){
        String path = NetposaHelper.class.getClassLoader().getResource("").getPath();
        int nIndex = path.indexOf("TServer");
        String tempPath = path.substring(0, nIndex);
        File file = new File(tempPath);
        file = new File(file.getParent());
        return file.getParent()+"/mapCache";
    }

    /**
     * 读取地图切片文件 serviceName 地图服务名称 layerFileString
     * 地图切片存放位置，拷贝到工程mapTitle目录下的文件夹名称。e.g.:mapTitle/shanghaiBaseMap zoom
     * 切片的级别，从0开始 x 切片的行号，从0开始 y 切片的列号，从0开始
     * @throws IOException 
     */
    @SuppressWarnings({ "all" })
    private static byte[] readTileFromFile(String layerFileString, String zoom, String x, String y)
            throws IOException {
        byte[] result = null;
        FileInputStream isBundlx = null;
        FileInputStream isBundle = null;
        try {
            File layerFile = new File(layerFileString);
            if (!layerFile.exists()) {
                return result;
            }
            String filePathString = layerFileString + "/Layers/_alllayers";
            int size = 128;
            int row = Integer.parseInt(x);
            
            int col = Integer.parseInt(y);

            String l = converLOD(zoom);

            int rGroup = size * (row / size);

            int cGroup = size * (col / size);

            /*String r = converRC("R", rGroup);
            String c = converRC("C", cGroup);*/
            String r = converRC(rGroup);
            String c = converRC(cGroup);
            
            String bundlesDir = filePathString;

            /*String bundleBase = bundlesDir + "/" + l + "/" + r + c;
            String bundlxFileName = bundleBase + ".bundlx";
            String bundleFileName = bundleBase + ".bundle";

            // 行列号是整个范围内的，在某个文件中需要先减去前面文件所占有的行列号（都是128的整数）这样就得到在文件中的真是行列号。
            int index = size * (col - cGroup) + (row - rGroup);

            java.io.File file = new java.io.File(bundlxFileName);

            if (!file.exists()) {
                bundlxFileName = bundleBase + ".npslx";
                file = new java.io.File(bundlxFileName);
                if (!file.exists()) {
                    return result;
                } else {
                    bundleFileName = bundleBase + ".npsle";
                }
            }*/
            
            //////////////////////////////////////////////////////
            
            // 行列号是整个范围内的，在某个文件中需要先减去前面文件所占有的行列号（都是128的整数）这样就得到在文件中的真是行列号。
            int index = size * (col - cGroup) + (row - rGroup);
            
            FileNameStruct fileNameStruct = createPathname(bundlesDir,l,r,c);
            
            String bundlxFileName = fileNameStruct.getBundlxFileName();
            String bundleFileName = fileNameStruct.getBundleFileName();
            File file = null;
            
            ////////////////////////////////////////////////////
            

            isBundlx = new FileInputStream(bundlxFileName);

            long skippedNum = (long) (16 + 5 * index);
            long countBytes = isBundlx.skip(skippedNum);

            byte[] buffer = new byte[5];
            isBundlx.read(buffer, 0, 5);

            long offset = (long) (buffer[0] & 0xff) + (long) (buffer[1] & 0xff) * 256 + (long) (buffer[2] & 0xff)
                    * 65536 + (long) (buffer[3] & 0xff) * 16777216 + (long) (buffer[4] & 0xff) * 4294967296L;
            file = new File(bundleFileName);
            if (!file.exists()) {
                return result;
            }
            isBundle = new FileInputStream(bundleFileName);
            countBytes = isBundle.skip(offset);
            byte[] lengthBytes = new byte[4];
            isBundle.read(lengthBytes, 0, 4);
            int length = (int) (lengthBytes[0] & 0xff) + (int) (lengthBytes[1] & 0xff) * 256
                    + (int) (lengthBytes[2] & 0xff) * 65536 + (int) (lengthBytes[3] & 0xff) * 16777216;
            result = new byte[length];
            isBundle.read(result, 0, length);

        } finally {
            if (isBundlx != null) {
                isBundlx.close();
            }
            if (isBundle != null) {
                isBundle.close();
            }
        }
        return result;
    }
    
    private static FileNameStruct createPathname(String bundlesDir, String l, String r, String c) {
        String os = System.getProperty("os.name").toLowerCase();

        FileNameStruct fileNameStruct = new FileNameStruct();


        String arclx_suffix = ".bundlx";
        String arcle_suffix = ".bundle";

        String nplx_suffix = ".npslx";
        String nple_suffix = ".npsle";

        String bundlxFileName = bundlesDir + "/" + l + "/R" + r + "C" + c + arclx_suffix;// arcgis大写
        String bundleFileName = bundlesDir + "/" + l + "/R" + r + "C" + c + arcle_suffix;// arcgis大写
        
        File file = new File(bundlxFileName);

        if (os.indexOf("linux") >= 0) {
            if (!file.exists()) {
                bundlxFileName = bundlesDir + "/" + l + "/R" + r.toLowerCase() + "C" + c.toLowerCase() + arclx_suffix;// arcgis小写
                bundleFileName = bundlesDir + "/" + l + "/R" + r.toLowerCase() + "C" + c.toLowerCase() + arcle_suffix;// arcgis小写
                file = new File(bundlxFileName);
                if (!file.exists()) {
                    bundlxFileName = bundlesDir + "/" + l + "/R" + r + "C" + c + nplx_suffix;// np
                    // 大写
                    bundleFileName = bundlesDir + "/" + l + "/R" + r + "C" + c + nple_suffix;// np
                    // 大写
                }
            }
        }

        if (os.indexOf("windows") >= 0) {
            if (!file.exists()) {
                bundlxFileName = bundlesDir + "/" + l + "/R" + r + "C" + c + nplx_suffix;
                bundleFileName = bundlesDir + "/" + l + "/R" + r + "C" + c + nple_suffix;
            }
        }

        fileNameStruct.setBundlxFileName(bundlxFileName);
        fileNameStruct.setBundleFileName(bundleFileName);

        return fileNameStruct;
    }
    
    
    static class FileNameStruct {
        private String bundlxFileName = "";
        private String bundleFileName = "";

        public String getBundlxFileName() {
            return bundlxFileName;
        }

        public void setBundlxFileName(String bundlxFileName) {
            this.bundlxFileName = bundlxFileName;
        }

        public String getBundleFileName() {
            return bundleFileName;
        }

        public void setBundleFileName(String bundleFileName) {
            this.bundleFileName = bundleFileName;
        }
    }

    /**
     * 等级转换，e.g.:把级别 从 0 变成 L01,11 变成L11
     * 
     * @param zoom
     * @return
     */
    private static String converLOD(String zoom) {
        String l = "0" + zoom;
        int lLength = l.length();
        if (lLength > 2) {
            l = l.substring(lLength - 2);
        }
        l = "L" + l;
        
        return l;
    }

    /**
     * 行列好转为16进制 图如果很多，而一个bundle只能存储128*128个，所以可能有多个dundle文件，这样就需要对其按所在区域分类命名。
     * R0080C0180”
     * 以R+4位16进制数字+C+4位16进制数字组成。对于4个16进制计算规则。128*（row/128），然后转换成16进制即可。
     * 举例：1-128行的是R0000，129-256的是R0080。列的计算同理 分行列好，R 行，C 列
     * @param group
     *            区域，e.g.:已行为例 group = 128*（row/128）
     * @return
     */
    private static String converRC(int group) {
        String str = Integer.toHexString(group).toUpperCase();
        int strLength = str.length();
        if (strLength < 4) {
            for (int i = 0; i < 4 - strLength; i++) {
                str = "0" + str;
            }
        }
        return str;
    }

    private static ArrayList<CompactMap> mapConfig = null;

    public static List<CompactMap> getMapConfig() {
        if (mapConfig == null || mapConfig.isEmpty()) {
            getMapConfig("");
        }
        return mapConfig;
    }

    public static void reReadMapConfig() {
        mapConfig.clear();
        getMapConfig("");
    }

    public static List<CompactMap> getMapConfig(String basePath) {

        if (mapConfig == null || mapConfig.isEmpty()) {
            String pathString = "";
            if (basePath == null || basePath.length() == 0) {
                pathString = NetposaHelper.class.getClassLoader().getResource("map.xml").toString();
            } else {
                pathString = basePath + "/map.xml";
            }
            mapConfig = (ArrayList<CompactMap>) CompactMap.readXml(pathString);
        }
        return mapConfig;
    }

    public static List<CompactMap> getMapConfigByMapType(String mapType) {
        getMapConfig("");
        List<CompactMap> result = new ArrayList<>();
        for (CompactMap compactMap : mapConfig) {
            if (compactMap.getMapType().equalsIgnoreCase(mapType)) {
                result.add(compactMap);
            }
        }
        return result;
    }

    private static HashMap<String, ServerInfo> arcgisConfigHashMap = new HashMap<>();

    /*
     * 获取服务Model
     */
    private static ServerInfo getServerInfo(String serviceName, HttpServletRequest request) {
        CompactMap map = NetposaHelper.getMapConfigByMapName(serviceName);
        if (map == null) {
            return null;
        }
        String layerFileString = map.getMapUrl();
        String path = "";
        try {
            path = request.getServletContext().getRealPath(layerFileString);
        } catch (Exception e) {
            LOGGER.error(e);
            return null;
        }
        java.io.File layerFile = new java.io.File(path);
        if (!layerFile.exists()) {
            return null;
        }
        String filePathString = path + "/Layers/Conf.xml";
        String confCdi = path + "/Layers/conf.cdi";
        ServerInfo info = ServerInfo.readXmlConfig(filePathString, confCdi);
        info.setServiceName(serviceName);
        info.setDescription(serviceName);
        return info;
    }

    public static ServerInfo getArcgisMapConfig(String serviceName, HttpServletRequest request) {
        synchronized (arcgisConfigHashMap) {
            if (arcgisConfigHashMap.containsKey(serviceName)) {
                return arcgisConfigHashMap.get(serviceName);
            }
            ServerInfo maConfigMap = getServerInfo(serviceName, request);
            arcgisConfigHashMap.put(serviceName, maConfigMap);
            return maConfigMap;
        }
    }

    private static HashMap<String, NPGISMap> npgisConfigHashMap = new HashMap<>();

    public static NPGISMap getNpGISMapConfig(String serviceName, HttpServletRequest request) {
        synchronized (npgisConfigHashMap) {
            if (npgisConfigHashMap.containsKey(serviceName)) {
                return npgisConfigHashMap.get(serviceName);
            }
        }

        CompactMap configCompactMap = NetposaHelper.getMapConfigByMapName(serviceName);
        if (configCompactMap == null) {
            return null;
        }
        @SuppressWarnings("deprecation")
        String path = request.getRealPath(configCompactMap.getMapUrl() + "/Layers/Conf.xml");

        NPGISMap maConfigMap = NPGISMap.readXml(path);
        synchronized (npgisConfigHashMap) {
            npgisConfigHashMap.put(serviceName, maConfigMap);
        }
        return maConfigMap;
    }

    public static CompactMap getMapConfigByMapName(String mapName) {
        getMapConfig("");
        for (CompactMap compactMap : mapConfig) {
            if (compactMap.getName().equalsIgnoreCase(mapName)) {
                return compactMap;
            }
        }
        return null;
    }

    /*
     * 序列化Geometer 对象
     */
    public static String geomoterJson(Geometry geometry) {
        org.geotools.geojson.geom.GeometryJSON writer = new org.geotools.geojson.geom.GeometryJSON(16); //
        StringWriter stringWriter = new StringWriter();
        try {
            writer.write(geometry, stringWriter);
        } catch (IOException e) {
            LOGGER.error(e);
        }
        return stringWriter.toString();
    }

    public static Geometry fromWkt(String wellKnownText) throws ParseException {
        WKTReader reader = new WKTReader();
        return reader.read(wellKnownText);
    }

    /*
     * 序列化
     */
    public static void serializeSingleObject(OutputStream os, Object obj) {
        XMLEncoder xe = new XMLEncoder(os, "utf-8", true, 0);
        xe.writeObject(obj);
        xe.close();
    }

    /*
     * 反序列化
     */
    public static Object deserializeSingleObject(InputStream is) {
        XMLDecoder xd = new XMLDecoder(is);
        Object obj = xd.readObject();
        xd.close();
        return obj;
    }

    public static Boolean isEmpty(String value) {
        return value == null || value.trim().length() == 0;
    }

}
