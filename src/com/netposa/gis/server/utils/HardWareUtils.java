package com.netposa.gis.server.utils;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import java.net.Inet4Address;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.net.SocketException;
import java.util.Enumeration;

public class HardWareUtils {

    private static final Log LOGGER = LogFactory.getLog(HardWareUtils.class);

    private HardWareUtils() {
        super();
    }

    // 获取服务器所有ip
    public static JSONArray getAllIP() {
        JSONArray jsonArray = new JSONArray();

        Enumeration<NetworkInterface> enumeration;
        try {
            enumeration = NetworkInterface.getNetworkInterfaces();

            while (enumeration.hasMoreElements()) {
                NetworkInterface networkInterface = enumeration.nextElement();

                if (networkInterface.isUp()) {
                    Enumeration<InetAddress> addressEnumeration = networkInterface.getInetAddresses();

                    while (addressEnumeration.hasMoreElements()) {
                        JSONObject item = new JSONObject();

                        InetAddress iAdd = addressEnumeration.nextElement();
                        if (!iAdd.isLoopbackAddress() && iAdd instanceof Inet4Address) {
                            String ip = iAdd.getHostAddress();
                            item.put("value", ip);
                            item.put("label", MD5Util.md5(ip));
                            jsonArray.add(item);
                        }
                    }
                }

            }
        } catch (SocketException e) {
            LOGGER.error(e);
        }

        return jsonArray;
    }
}
