<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@taglib prefix="spring" uri="http://www.springframework.org/tags" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<title><spring:message code="TiandiOnLine.zxtdt" /></title>
<link rel="stylesheet" type="text/css"
	href="/TServer/resources/css/main.css" />
<script type="text/javascript" src="/TServer/resources/js/maps.js"></script>
<script type="text/javascript">
    var map;
    var zoom = 5;

    function onLoad() {
            var config = {
                    projection: "EPSG:4326"
                };
                //初始化地图对象 
            map = new TMap("mapDiv", config);
            //设置显示地图的中心点和级别 
            map.centerAndZoom(new TLngLat(114.10256, 30.84671), zoom);
            map.setZoomLevels([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]);
            map.enableHandleMouseScroll();
            var config = {
                type: "TMAP_NAVIGATION_CONTROL_LARGE", //缩放平移的显示类型 
                anchor: "TMAP_ANCHOR_TOP_LEFT", //缩放平移控件显示的位置 
                offset: [0, 0], //缩放平移控件的偏移值 
                showZoomInfo: true //是否显示级别提示信息，true表示显示，false表示隐藏。 
            };
            //创建缩放平移控件对象 
            control = new TNavigationControl(config);
            //添加缩放平移控件 
            map.addControl(control);
            map.addControl(new TScaleControl());
            map.centerAndZoom(new TLngLat(116.39322,39.91043),11); 

            TEvent.addListener(map, "click", function(p) {
                //将像素坐标转换成经纬度坐标 
                var lnglat = map.fromContainerPixelToLngLat(p);
                var lon = lnglat.getLng();
                var lat = lnglat.getLat();

                var p = transform(lon, lat); // 转火星坐标
                //将经纬度坐标转换成墨卡托坐标 
                var x = handle_x(p.lon);
                var y = handle_y(p.lat);
                document.getElementById("4326").value = (lon + "," + lat);
                document.getElementById("900913").value = (x + "," + y);
            });
        }
        //经度转墨卡托
    function handle_x(x) {
        return (x / 180.0) * 20037508.34;
    }

    //纬度度转墨卡托
    function handle_y(y) {
        if (y > 85.05112) {
            y = 85.05112;
        }
        if (y < -85.05112) {
            y = -85.05112;
        }

        y = (Math.PI / 180.0) * y;
        var tmp = Math.PI / 4.0 + y / 2.0;
        return 20037508.34 * Math.log(Math.tan(tmp)) / Math.PI;
    }
    var pi = 3.14159265358979324; // 圆周率
    var ee = 0.00669342162296594323; // WGS 偏心率的平方
    var x_pi = 3.14159265358979324 * 3000.0 / 180.0;
    var a = 6378245.0; // WGS 长轴半径
    function transform(lon, lat) {

        var localHashMap = {

        };
        var dLat = transformLat(lon - 105.0, lat - 35.0);
        var dLon = transformLon(lon - 105.0, lat - 35.0);
        var radLat = lat / 180.0 * pi;
        var magic = Math.sin(radLat);
        magic = 1 - ee * magic * magic;
        var sqrtMagic = Math.sqrt(magic);
        dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * pi);
        dLon = (dLon * 180.0) / (a / sqrtMagic * Math.cos(radLat) * pi);
        var mgLat = lat + dLat;
        var mgLon = lon + dLon;
        localHashMap.lon = mgLon;
        localHashMap.lat = mgLat;
        return localHashMap;
    }

    function outOfChina(lat, lon) {
        if (lon < 72.004 || lon > 137.8347)
            return true;
        if (lat < 0.8293 || lat > 55.8271)
            return true;
        return false;
    }

    function transformLat(x, y) {
        var ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
        ret += (20.0 * Math.sin(6.0 * x * pi) + 20.0 * Math.sin(2.0 * x * pi)) * 2.0 / 3.0;
        ret += (20.0 * Math.sin(y * pi) + 40.0 * Math.sin(y / 3.0 * pi)) * 2.0 / 3.0;
        ret += (160.0 * Math.sin(y / 12.0 * pi) + 320 * Math.sin(y * pi / 30.0)) * 2.0 / 3.0;
        return ret;
    }

    function transformLon(x, y) {
        var ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
        ret += (20.0 * Math.sin(6.0 * x * pi) + 20.0 * Math.sin(2.0 * x * pi)) * 2.0 / 3.0;
        ret += (20.0 * Math.sin(x * pi) + 40.0 * Math.sin(x / 3.0 * pi)) * 2.0 / 3.0;
        ret += (150.0 * Math.sin(x / 12.0 * pi) + 300.0 * Math.sin(x / 30.0 * pi)) * 2.0 / 3.0;
        return ret;
    }
    function openUrl(mapType){
    	var c = map.getCenter();
		window.open('/TServer/home/TiandiMapConfig?mapCenter=' + c.lng + ","+c.lat + "&mapType=" + mapType);
	}
    </script>
</head>

<body onLoad="onLoad()">
	<div class="mainform">
		<span style="FONT-WEIGHT: bold;"> TServerDirectory</span>
		<div class="top">
			<a href="/TServer/map/">Home</a> > <a
				href="/TServer/map/services">services</a> > <a
				href="/TServer/home/TiandiOnLine"><spring:message code="TiandiOnLine.zxtdt" /></a>
		</div>
		<div style="margin-left: 5px;">
			<div style="display: block; width: 98%; height: 20%;">
			<h3><spring:message code="TiandiOnLine.dc" /><spring:message code="TiandiOnLine.pzxx" />：</h3>
			<a href="javascript:openUrl('tiandi')">① <spring:message code="TiandiOnLine.tdt" /></a>&nbsp;
			<a href="javascript:openUrl('google')">② <spring:message code="TiandiOnLine.ggdt" /></a>&nbsp;
			<a href="javascript:openUrl('gaode')">③ <spring:message code="TiandiOnLine.gddt" /></a>&nbsp;
			<a href="javascript:openUrl('baidu')">④ <spring:message code="TiandiOnLine.bddt" /></a>&nbsp;
			<a href="javascript:openUrl('osm')">⑤ OpenStreetMap</a>
				<h3><spring:message code="TiandiOnLine.syff" />：</h3>
				<spring:message code="TiandiOnLine.sm" />！ <br /><spring:message code="TiandiOnLine.gdzb" />：
				<br /><spring:message code="TiandiOnLine.jwdzb" />(WGS84)&nbsp;: <input type='text' id='4326' value=""
					style="width: 300px" /> <span style='color: red'><spring:message code="TiandiOnLine.syytdt" />，ArcGIS(4326)，PGIS(4326)</span>
				<br /> <spring:message code="TiandiOnLine.mktzb" />(900913) : <input type='text' id='900913' value=""
					style="width: 300px" /> <span style='color: red'><spring:message code="TiandiOnLine.syygdtxdt" /></span>
			</div>
			<div id="mapDiv" style="position: absolute; width: 98%; height: 80%"></div>
		</div>
	</div>
</body>
</html>