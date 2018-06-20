<%@ page language="java" contentType="text/html; charset=utf-8"
	pageEncoding="utf-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<title>PGIS 地图配置</title>
<link rel="stylesheet" type="text/css"
	href="/TServer/resources/css/main.css" />
<style type="text/css">
.mainForm{
	margin:15px 5px 10px 5px;
}
label {
	display: inline-block;
	width: 100px;
}

.middletop {
	position: absolute;
	width: 40%;
}

.middletop div {
	margin-top: 5px;
}

.operation {
	margin-right: 500px;
	float: right;
}

.middle {
	margin-top:170px;
	position: absolute;
	min-height: 500px;
	width: 95%;
}
</style>
</head>
<body>
	<div class="mainForm">
	<span style="FONT-WEIGHT: bold;"> TServer Directory</span>
<div class='top'>
			<a href="/TServer/arcgis/">Home</a> > <a
				href="/TServer/map/services">services</a>>
				<a
				href="/TServer/wmts">wmts</a>
		</div>
		<div class="middletop">
			<div>
				<label>服务地址：</label> <input type="text" id="mapServer"
					style="width: 400px;"
					value="http://10.173.2.20/PGIS_S_TileMapServer/Maps/V">
			</div>
			<div>
				<label>最小层级：</label> <input type="text" id="minZoom"
					style="width: 250px;" value="13">
			</div>
			<div>
				<label>最大层级：</label> <input type="text" id="maxZoom"
					style="width: 250px;" value="20">
			</div>
			<div>
				<label>版本号：</label> <input type="text" id="version"
					style="width: 250px;" value="0.3">
					<label for="isDebug">是否DEBUG</label><input type="checkbox" id="isDebug">
			</div>
			<div>
				<label>地图中心点：</label> <input type="text" id="maxCenter"
					style="width: 250px;" value="108.72265,34.24023"> <input
					type="button" value="获取当前地图中心点" onclick="getCenter()">
			</div>
			<div style="text-align:center">
				<input type="button" value="加载地图" onclick="loadMap()"> <input
					type="button" value="导出当前配置" onclick="mapConfig()">
			</div>
		</div>
		<div class="operation">
			<h3>操作说明：</h3>
			<p>DEBUG 加载临时图片，非DEBUG 加载真实图片</p>
			<p>1.首先在用户给定的PGIS地址上找到地图DEMO</p>
			<p>2.找到EzMapApi.js文件，在文件中搜索：
			<br/>MapSrcURL为服务地址，如果有多个，请取矢量地图
			<br/>CenterPoint 为地图中心点，
			<br/>MapInitLevel 为最小层级，MapMaxLevel 为最大层级
			<br/>版本号，请查看地图请求URL中Version值，一般为0.3
			</p>
		</div>
		<div class="middle">
			<div id="mapId"
				style="width: 95%; height: 500px; min-height: 500px;"></div>
		</div>
	</div>
</body>
<script type="text/javascript" src="/TServer/resources/js/jquery.js"></script>
<script type="text/javascript" src="/TServer/resources/map/Init.js"></script>
<script type="text/javascript">
$(function(){
	$("#isDebug").click(function(){
		NPMapLib.IsDebug=$("#isDebug").prop("checked");
	});
});
	function getCenter() {
		if (window.map) {
			$("#maxCenter").val(window.map.getCenter().toString());
		}
	}
	function mapConfig() {
		var url = "/TServer/pgis/config?minZoom=" + $("#minZoom").val()
				+ "&maxZoom=" + $("#maxZoom").val() + "&centerPoint="
				+ $("#maxCenter").val() + "&mapUrl="
				+ encodeURI($("#mapServer").val()) + "&version"
				+ ($("#version").val() || "0.3");
		window.open(url);
	}
	function loadMap() {
		if($("#maxCenter").val().split(",").length != 2){
			alert("地图中心点不正确！");
			return;
		}
		NPMapLib.IsDebug=$("#isDebug").prop("checked");
		var mapConfig = {
			minZoom : parseInt($("#minZoom").val()),
			maxZoom : parseInt($("#maxZoom").val()),
			centerPoint : [ $("#maxCenter").val().split(",") ]
		};
		if (!mapConfig.minZoom || !mapConfig.maxZoom || !mapConfig.centerPoint) {
			alert("配置错误！");
			return;
		}
		var layerConfig = {
			serviceVersion : $("#version").val() || "0.3"
		};
		var url = $("#mapServer").val();
		if (!url) {
			alert("地图URL必须配置！");
			return;
		}
		if (window.map) {
			window.map.destroyMap();
			window.map = null;
		}

		var mapContainer = document.getElementById("mapId");
		map = new NPMapLib.Map(mapContainer, mapConfig);
		layerSLYX = new NPMapLib.Layers.EzMapTileLayer(url, "矢量影像地图",
				layerConfig);
		map.addLayers([ layerSLYX ]);
		map.addControl(new NPMapLib.Controls.NavigationControl());
		map.addControl(new NPMapLib.Controls.ScaleControl());
		map.addControl(new NPMapLib.Controls.OverviewControl());
		window.map = map;
	}
</script>
</html>