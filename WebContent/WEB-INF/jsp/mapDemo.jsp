<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%@taglib prefix="spring" uri="http://www.springframework.org/tags" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
<title>${serviceName}</title> 
<style>
.map-id { 
	width: 100%;
	height: 95%;
	min-height:700px;
}
</style>
</head>
<body>	 
<spring:message code="mapDemo.dtzxd" />:<input type="text" id="mapCenter" style="width:250px;"> 
	<div class="map-id" id="mapId"></div> 
</body>
<script type="text/javascript"
	src="/TServer/resources/js/jquery.js"></script>
<script type="text/javascript"
	src="/TServer/resources/map/Init.js"></script>
<script type="text/javascript">	
	var url = '${url}';
	$.getJSON(url+"?f=json",function(layerInfo){
		var mapContainer = document.getElementById("mapId");		
		var resoutions = ${resolutions};
		var tilePixels = ${Height};
		var origin = ${Origin};
		var center = ${center};
		var extent = ${extent};
		
		var map = new NPMapLib.Map(mapContainer, {
			minZoom : 0,
			defaultZoom : 0,
			projection: "EPSG:" + layerInfo.tileInfo.spatialReference.wkid,
			maxZoom : resoutions.length -1//,
			//restrictedExtent:extent 限制区域
		}); 
		var baseLayer = new NPMapLib.Layers.ArcgisTileLayer(url, '${serviceName}',{
				isBaseLayer:true,
				layerInfo:layerInfo
			}
		);
		map.addLayers([ baseLayer ]);
		map.addControl(new NPMapLib.Controls.NavigationControl());
		map.addControl(new NPMapLib.Controls.ScaleControl());
		map.addControl(new NPMapLib.Controls.OverviewControl());
		map.zoomToExtent(new NPMapLib.Geometry.Extent(extent[0],extent[1],extent[2],extent[3]));
		window.map = map;
		map.addEventListener("moveend",function(f){
			$("#mapCenter").val(map.getCenter().toString());
		});		
	})
</script>
</html>