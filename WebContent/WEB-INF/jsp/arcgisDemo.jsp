<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>地图服务Demo</title>
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
	<div class="top" style="height: 60px;">
		<div style="margin-top: 5px">
			服务地址:<input type="text" id="serverUrl"
				value="http://192.168.60.242:6080/arcgis/rest/services/shanghaiBaseMap512/MapServer"
				style="width: 500px">&nbsp;<input type="button" value="加载地图"
				id="loadMap">&nbsp; <a href="javascript:openUrl()"
				target="_blank">导出地图配置信息</a>&nbsp;<span style="color: red">支持arcgis服务、TServer
				服务</span> <br />
			<div style="margin-top: 5px">
				通过点击地图获取点位坐标:<input type="text" id="mapCenter" style="width: 250px">
				<input type="button" value="获取当前地图中心点" id="getMapCenter">
			</div>
		</div>
	</div>
	<div class="map">
		<div id="mapId" style="height: 700px;"></div>
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
									return f.resolution
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
						$("#mapCenter").val(p.toString())
					})
					map.addEventListener("moveend", function(f) {
						$("#mapCenter").val(map.getCenter().toString());
					});
					window.map = map;
				},
				error : function() {
				alert("加载服务失败！");
				}
			});
		}
	}
</script>
</html>