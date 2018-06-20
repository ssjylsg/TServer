<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%@taglib prefix="spring" uri="http://www.springframework.org/tags" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">

	<script type="text/javascript" src="/TServer/resources/js/jquery.js"></script>
	<script type="text/javascript" src="/TServer/resources/map/Init.js"></script>

<title>${serviceName}</title> 
<style>
#mapId {
    min-height: 700px;
    left: 0;
    top: 20px;
    right: 0;
    bottom: 0;
    position: absolute;
}
</style>
</head>
<body>	 
<spring:message code="mapDemo.dtzxd" />:<input type="text" id="mapCenter" style="width:250px;">
	<div id="mapId"></div> 
</body>
	
<script type="text/javascript">
    // 语言
    var npgisLocal = "${myLocale}";
    
	var url = '/TServer/NPGIS/services/${serviceName}/MapServer';
	var mapContainer = document.getElementById('mapId');
	var map;
	
	$(function() {
		requestLayerInfo();
	});
	
	// 渲染方式选择
	function renderSelect() {
		var bodyElement = $("#mapId").parent();
		var divElement = document.createElement('div');
		divElement.id = 'mapSelect';
		divElement.style.position = 'absolute';
		divElement.style.float = 'right';
		divElement.style.right = bodyElement[0].style.position === '' ? '30px': (bodyElement.width() - $('#mapId').width() + 30) +  'px';
		divElement.style.zIndex = 999;
		divElement.style.marginTop = '15px';
		divElement.style.top = bodyElement.offset().top;
        
        var selectElement = document.createElement('select');
        if('zh_CN' === npgisLocal) {
        	$(selectElement).append('<option value="server">服务端渲染</option>');
            $(selectElement).append('<option value="client">客户端渲染</option>');
        } else if('en_US' === npgisLocal) {
        	$(selectElement).append('<option value="server">Server rendering</option>');
            $(selectElement).append('<option value="client">Browser rendering</option>');
        }
        
        
        divElement.appendChild(selectElement);
        
        bodyElement.append(divElement);
        
        
        $(selectElement).change(function() {
			createMap($(this).val());
		});
	}

	// 请求图层信息
	function requestLayerInfo() {
		$.getJSON(url + "?f=json", function(layerInfo) {
			createMap('server');

			var layerType = "${info.layerType}";

			// 高德矢量添加渲染方式选择
			if (layerType === 'gaodeVector') {
				renderSelect();
			}
		});
	}

	function createMap(render) {
		if (map) {
			map.destroyMap();
			map = null;
		}

		var center = ${info.centerPoint};
		var extent = ${info.fullExtent};
		var restrictedExtent = ${info.restrictedExtent};
		var minZoom = ${info.minZoom};
		var maxZoom = parseInt("${info.maxZoom}");
		var projection = "EPSG:" + "${info.projection}";
		var type = "${info.type}";
		var layerType = "${info.layerType}";
		var zoomLevelSequence = "${info.zoomLevelSequence}";
		var defaultZoom = "${info.defaultZoom}";

		var layerInfo = {
			"centerPoint" : center,
			"defaultZoom" : defaultZoom,
			"fullExtent" : extent,
			"layerType" : layerType,
			"maxZoom" : maxZoom,
			"minZoom" : minZoom,
			"projection" : projection,
			"restrictedExtent" : restrictedExtent,
			"type" : type,
			"zoomLevelSequence" : zoomLevelSequence
		};

		map = new NPMapLib.Map(mapContainer, {
			minZoom : minZoom,
			defaultZoom : minZoom,
			maxZoom : maxZoom,
			projection : projection,
			restrictedExtent : restrictedExtent
		});

		var layers;
		var baseLayer;
		var labelLayer;

		if ('json' === type) {
			if ('gaodeVector' === layerType) {
				// 矢量切片
				if ('client' === render) {
					// 客户端渲染  
					var opt = {
						labelUrl : [ url + '/getGaodeMapLabel' ],
						"isBaseLayer" : true,
						"isVectorTile" : false,
						"isVectorLayer" : true,
						"layerInfo" : layerInfo,
						"numZoomLevels" : 23
					};
					baseLayer = new NPMapLib.Layers.GaoDeLayer([ url
							+ '/getGaodeMapRegion' ], '${serviceName}', opt);
					layers = new Array(baseLayer);
				} else {
					// 服务端渲染
					baseLayer = new NPMapLib.Layers.GaoDeLayer([ url
							+ "/getGaodeVectorTile" ], '${serviceName}', {
						"isBaseLayer" : true,
						"numZoomLevels" : 23,
						"imgCache" : false
					});

					labelLayer = new NPMapLib.Layers.GaoDeLayer(
							undefined,
							'${serviceName}'+'label',
							{
								"labelUrl" : [ url + "/getGaodeVectorTileLabel" ],
								"isBaseLayer" : false,
								"isVectorTile" : false,
								"isVectorLayer" : true,
								"layerInfo" : layerInfo
							});

					layers = new Array(baseLayer, labelLayer);
				}
			} else {
				// 百度矢量切片
				baseLayer = new NPMapLib.Layers.BaiduTileLayer(
						url + "/getVectorTile?x=\${x}&y=\${y}&l=\${z}&scale=1&custom=&imgCache=false",
						'${serviceName}',
						{
							"url" : [ url
									+ "/getVectorTile?x=\${x}&y=\${y}&l=\${z}&scale=1&custom=&imgCache=false" ],
							"labelUrl" : [ url
									+ "/getVectorTileLabel?x=\${x}&y=\${y}&l=\${z}" ],
							"isBaseLayer" : true,
							"isVectorTile" : true
						});
				layers = new Array(baseLayer);
			}

		} else {
			baseLayer = new NPMapLib.Layers.NPLayer(url, '${serviceName}', {
				isBaseLayer : true,
				layerInfo : layerInfo
			});

			layers = new Array(baseLayer);
		}

		map.addLayers(layers);
		map.addControl(new NPMapLib.Controls.NavigationControl());
		map.addControl(new NPMapLib.Controls.ScaleControl());
		map.addEventListener("moveend", function(f) {
			$("#mapCenter").val(map.getCenter().toString());
		});
	}
</script>
</html>