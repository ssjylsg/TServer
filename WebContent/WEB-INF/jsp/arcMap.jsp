<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%@taglib prefix="spring" uri="http://www.springframework.org/tags" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title><spring:message code="arcMap.bt" />Demo</title>
<style type="text/css">
.map {
	height: 100%;
	width: 100%;
}
</style>
<link rel="stylesheet" type="text/css"
	href="/TServer/resources/css/main.css" />
</head>
<body>
	<div class="mainform">
		<span style="FONT-WEIGHT: bold;"> TServer Directory</span>
		<div class="top">
			<a href="/TServer/map/">Home</a> > <a href="/TServer/map/services">services</a>
			> <a href="#">${serviceName}
				(MapServer)</a>
		</div>
		<b><spring:message code="arcMap.fwdi" />：</b><input type="text" id="serverUrl"
			value="http://192.168.60.242:6080/arcgis/rest/services/shanghaiBaseMap512/MapServer"
			style="width: 500px">&nbsp;<input type="button" value="<spring:message code="arcMap.jzdt" />"
			id="loadMap">&nbsp; <a href="javascript:openUrl()"
			target="_blank"><spring:message code="arcMap.dcpzxx" /></a>&nbsp;<span style="color: red"><spring:message code="arcMap.zc" /> ArcGIS <spring:message code="arcMap.fw" />、TServer <spring:message code="arcMap.fw" /></span>
			<div style="margin-top: 5px">
				<b><spring:message code="arcMap.zbhq" />：</b><input type="text" id="mapCenter" style="width: 250px">
				<input type="button" value ="<spring:message code="arcMap.dtzxd" />"  id="getMapCenter">
			</div>
		<div class="map">
			<div id="mapId" style="height: 650px;"></div>
		</div>
	</div>
</body>
<script type="text/javascript" src="/TServer/resources/js/jquery.js"></script>
<script type="text/javascript" src="/TServer/resources/map/Init.js"></script>
<script type="text/javascript">
	var map = "";
	$(function() {
		createMap();
		$("#loadMap").click(function() {
			createMap();
		});
		$("#getMapCenter").click(function() {
			if (map) {
				$("#mapCenter").val(map.getCenter().toString());
			}
		});
	});
	function openUrl() {
		window.open('/TServer/home/mapConfig?url=' + $("#serverUrl").val());
	}
	function createMap() {
		var url = $("#serverUrl").val();
		if (url) {
			$("#mapCenter").val("");
			$.ajax({
				type : "get",
				url : url + "?f=json",
				dataType : "jsonp",
				success : function(layerInfo) {
					if (window.map) {
						window.map.destroyMap();
						window.map = null;
					}
					var mapContainer = document.getElementById("mapId");
					if (layerInfo.layerType) {
						var map = new NPMapLib.Map(mapContainer, {
							minZoom : parseInt(layerInfo.minZoom),
							maxZoom : parseInt(layerInfo.maxZoom),
							restrictedExtent : layerInfo.restrictedExtent,
							projection : "EPSG:" + layerInfo.projection,
							centerPoint : layerInfo.centerPoint
						});
						var baseLayer = new NPMapLib.Layers.NPLayer(url,
								'serviceName', {
									isBaseLayer : true,
									layerInfo : layerInfo
								});
						map.addLayers([ baseLayer ]);
					} else {
						var resoutions = $.map(layerInfo.tileInfo.lods,
								function(f) {
									return f.resolution;
								});
						var extent = [ layerInfo.fullExtent.xmin,
								layerInfo.fullExtent.ymin,
								layerInfo.fullExtent.xmax,
								layerInfo.fullExtent.ymax ];
						var map = new NPMapLib.Map(mapContainer, {
							minZoom : 0,
							maxZoom : resoutions.length - 1,
							restrictedExtent : extent,
							projection : "EPSG:"
									+ layerInfo.tileInfo.spatialReference.wkid
						});
						var baseLayer = new NPMapLib.Layers.ArcgisTileLayer(
								url, 'serviceName', {
									isBaseLayer : true,
									layerInfo : layerInfo
								});
						map.addLayers([ baseLayer ]);
						map.zoomToExtent(new NPMapLib.Geometry.Extent(
								extent[0], extent[1], extent[2], extent[3]));
					}
					map.addControl(new NPMapLib.Controls.NavigationControl());
					map.addControl(new NPMapLib.Controls.ScaleControl());
					map.addControl(new NPMapLib.Controls.OverviewControl());
					map.addEventListener("click", function(p) {
						$("#mapCenter").val(p.toString());
					});
					map.addEventListener("moveend", function(f) {
						$("#mapCenter").val(map.getCenter().toString());
					});
					window.map = map;
				},
				error : function() {
					alert('获取json配置失败！');
				}
			});
		}
	}
</script>
</html>