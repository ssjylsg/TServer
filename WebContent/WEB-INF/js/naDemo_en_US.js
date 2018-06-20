var endImage = "/TServer/resources/img/map-marker-end.png";
var startImage = "/TServer/resources/img/map-marker-start.png";
var naUrl = "/TServer/gis/na";
var map;
var layer;
var startStop;
var endStop;
var startMarker;
var endMarker;
var drawTool;
var barriers = [];
var restrictField = "car";
var animationLine;
$(function() {
	//$("#mapSelect")
	init();

	$("input[name='algorithm']").click(function() {
		caculate();
	});
	$("#roadProcess").click(function() {
		if (animationLine) {
			animationLine.stop();
			animationLine.restart();
		}
	});
	$("#roadStart").click(function() {
		animationLine && animationLine.start();
	});
	$("#roadStop").click(function() {
		if (animationLine) {
			animationLine.stop();
		}
	});
	$("#caculateRoadNet").click(function() {
		var startPoint = $("#startPointTxt").val().split(",");
		var endPoint = $("#endPointTxt").val().split(",");
		if (startPoint.length == 2 && endPoint.length == 2) {
			if (startMarker == null || endMarker == null) {
				addStartPoint({
					lon : startPoint[0],
					lat : startPoint[1]
				});
				addEndPoint({
					lon : endPoint[0],
					lat : endPoint[1]
				});
			} else {
				startMarker.moveTo({
					lon : startPoint[0],
					lat : startPoint[1]
				});
				endMarker.moveTo({
					lon : endPoint[0],
					lat : endPoint[1]
				});
			}
		}
		caculate();
	});
});
function init(serverUrl) {
	npMap.createMap(("mapId"), {
		mapType : 'tiandiMap',
		url : serverUrl,
		callback : function(map) {
			layer = new NPMapLib.Layers.OverlayLayer("linshi");
			map.addLayer(layer);
			map.addControl(new NPMapLib.Controls.MousePositionControl());
			drawTool = new NPMapLib.Tools.DrawingTool(map.id);
			npMap.setMap(map);
			// map 右键菜单
			var menu = [];
			menu.push({
				'Start point' : function(p) {
					addStartPoint(p);
					$("#startPointTxt").val(p.lon + "," + p.lat);
					caculate();
				}
			});
			menu.push({
				'End point' : function(p) {
					addEndPoint(p);
					$("#endPointTxt").val(p.lon + "," + p.lat);
					caculate();
				}
			});
			map.addContextMenu(menu);
			window.map = map;
		}
	});

}
var service;
function clear() {
	animationLine && animationLine.stop();
	infoWindow && infoWindow.close();
	animationLine = null;
	layer.removeAllOverlays();
	$("#processMsg").html('');
}
function arraryContains(arry, point) {
	for ( var i = 0; i < arry.length; i++) {
		if (arry[i].point.lon.toFixed(9) == point.lon.toFixed(9)
				&& arry[i].point.lat.toFixed(9) == point.lat.toFixed(9)) {
			return arry[i];
		}
	}
	return null;
}
var infoWindow = null;
function caculate() {
	if (startMarker == null || endMarker == null) {
		return;
	}
	type = $('#routeSelect').val();
	var callback = function(result) {
		var features = result.features, messges = result.messages;

		layer.addOverlays(barriers);
		var color = result.params.algorithm == "Astar" ? "green" : "#CC00CC";
		var allPoints = result.points;
		layer.addOverlay(new NPMapLib.Geometry.Polyline(allPoints));

		var url = "/TServer/gis/buffer";
		var params = new NPMapLib.Services.bufferParams();
		params.projection = map.getProjection();
		params.distance = 5;
		params.units = "m";
		params.geometry = new NPMapLib.Geometry.Polyline(allPoints);
		var service = new NPMapLib.Services.BufferService(map,
				NPMapLib.MAPTYPE_NPGIS);
		var buffer = service.buffer(url, params, function(result) {
			var bufferResult = new NPMapLib.Geometry.Polygon(result.rings, {
				color : "blue", //颜色
				fillColor : "yellow", //填充颜色
				weight : 2, //宽度，以像素为单位
				opacity : 1, //透明度，取值范围0 - 1
				fillOpacity : 0.3
			//填充的透明度，取值范围0 - 1
			});
			layer.addOverlay(bufferResult);
			npMap.searchRoadCrossInBounds(bufferResult, layer, function(
					roadCorss) {
				animationLine = npMap.addAnimationLine(allPoints, layer);
				animationLine.events.register('preDraw', function(evt) {
					var processMsg = "";
					if (evt.index == 0) {
						processMsg = "Starting point:";
					} else if (evt.index != allPoints.length - 1) {
						processMsg = "through:";
					} else {
						processMsg = "Terminal point:";
					}
					npMap.getMap().panTo(evt.point);
					npMap.searchpoicoord(evt.point, function(result) {
						$("#processMsg").html(processMsg + result);
					});
					var corss = arraryContains(roadCorss, evt.point);
					if (corss) {
						if (infoWindow) {
							infoWindow.close();
						}
						infoWindow = new NPMapLib.Symbols.InfoWindow(evt.point,
								"", corss.clientData.name + " intersection");
						map.addOverlay(infoWindow);
						infoWindow.open();
					}
				});
				if (map.getZoom() < 7) {
					map.setZoom(7);
				}
				/* window
						.setTimeout(
								function() {
									$(
											"#roadProcess")
											.trigger(
													'click');
								}, 1000); */
			});
		});

		var innerHTMLContext = "<br><ol style='margin-left:8px'>";
		var featuresObj = {};
		var tempFeatures = [];
		innerHTMLContext += "";
		for ( var i = 0; i < messges.segments.length; i++) {
			innerHTMLContext += "<li><span routeId='" + messges.segments[i].id
					+ "''>" + '<span class ="main-roude-title">' + (i + 1)
					+ '.</span>' + messges.segments[i].strguide
					+ "</span></li>";
			featuresObj[messges.segments[i].id.toString()] = messges.segments[i].features;
		}
		var roadLength = messges.length > 1000 ? (messges.length / 1000.0)
				.toFixed(1)
				+ ' km' : messges.length + ' m';
				
		innerHTMLContext += "<li><strong>Total " + roadLength + "，About " + messges.time + " minutes away</strong></li>";
		
		innerHTMLContext += "</ol>";
		document.getElementById("routeMessge").innerHTML = innerHTMLContext;
		$("#routeMessge span")
				.click(
						function() {
							for ( var j = 0; j < tempFeatures.length; j++) {
								layer.removeOverlay(tempFeatures[j]);
							}
							for ( var i = 0; i < featuresObj[$(this).attr(
									"routeId")].length; i++) {
								featuresObj[$(this).attr("routeId")][i]
										.setColor("red");
								featuresObj[$(this).attr("routeId")][i]
										.setWeight(4);
								featuresObj[$(this).attr("routeId")][i]
										.setArrowStyle(NPMapLib.LINE_ARROW_TYPE_FORWORD);
								layer.addOverlay(featuresObj[$(this).attr(
										"routeId")][i]);
							}
							var length = featuresObj[$(this).attr("routeId")][0]
									.getPath().length;
							map
									.setCenter(featuresObj[$(this).attr(
											"routeId")][0].getPath()[length - 1]);
							tempFeatures = featuresObj[$(this).attr("routeId")];
						});
	};
	clear();
	var routeService = new NPMapLib.Services.RouteService(map, 7);
	var params = new NPMapLib.Services.routeParams();
	params.service = "na";
	params.request = "getroute";
	params.networkName = "shanghai_roadnet_supermap";
	params.startStop = startMarker.getPosition();
	params.endStop = endMarker.getPosition();
	params.trafficModel = restrictField;
	params.planRoadType = "2";
	params.geoBarriers = barriers;
	params.lang = npgisLocal;
	params.algorithm = $('input[type="radio"]:checked').val();
	if (service) {
		service.abort();
		service = null;
	}
	service = routeService.route(naUrl, params, callback);
}

function queryName(coord, domBind) {
	var addressUrl = "/TServer/query/poicoord";
	$.getJSON(addressUrl, {
		coord : coord
	},
			function(result) {
				$("#" + domBind).val(
						result.name + "_" + result.address + "_"
								+ result.districtName);
			});
}
function addStartPoint(lonlat) {
	startStop = new NPMapLib.Geometry.Point(lonlat.lon, lonlat.lat);
	if (!startMarker) {
		var size = new NPMapLib.Geometry.Size(32, 32);
		var icon = new NPMapLib.Symbols.Icon(startImage, size);
		//设置偏移量，这里取坐标点为图片中心点
		icon.setAnchor(new NPMapLib.Geometry.Size(-size.width / 2,
				-size.height / 2));
		startMarker = new NPMapLib.Symbols.Marker(startStop);
		startMarker.setIcon(icon);
		startMarker.setTitle('Drag to change the route');
		map.addOverlay(startMarker);
		startMarker.enableEditing();
		startMarker.addEventListener(NPMapLib.MARKER_EVENT_DRAG_END,
				function() {
					var p = startMarker.getPosition();
					var location = p.lon + "," + p.lat;
					queryName(location, "startName");
					$("#startPointTxt").val(location);
					window.caculate();
				});
	} else {
		startMarker.setPosition(startStop);
	}
	queryName(startStop.toString(), "startName");
	map.removeEventListener(NPMapLib.MAP_EVENT_CLICK);
}

function drawStartPoint() {
	map.removeEventListener(NPMapLib.MAP_EVENT_CLICK);
	map.addEventListener(NPMapLib.MAP_EVENT_CLICK, addStartPoint);
}

function addEndPoint(lonlat) {
	endStop = new NPMapLib.Geometry.Point(lonlat.lon, lonlat.lat);
	if (!endMarker) {
		var size = new NPMapLib.Geometry.Size(32, 32);

		//图片
		var icon = new NPMapLib.Symbols.Icon(endImage, size);
		//设置偏移量，这里取坐标点为图片中心点
		icon.setAnchor(new NPMapLib.Geometry.Size(-size.width / 2,
				-size.height / 2));
		endMarker = new NPMapLib.Symbols.Marker(endStop);
		endMarker.setIcon(icon);
		endMarker.setTitle('Drag to change the route');
		map.addOverlay(endMarker);
		endMarker.enableEditing();
		endMarker.addEventListener(NPMapLib.MARKER_EVENT_DRAG_END, function() {
			var p = endMarker.getPosition();
			var location = p.lon + "," + p.lat;
			$("#endPointTxt").val(location);
			queryName(location, "endName");
			window.caculate();
		});
	} else {
		endMarker.setPosition(endStop);
	}
	map.removeEventListener(NPMapLib.MAP_EVENT_CLICK);
	queryName(endStop.toString(), "endName");
}

function drawEndPoint() {
	map.removeEventListener(NPMapLib.MAP_EVENT_CLICK);
	map.addEventListener(NPMapLib.MAP_EVENT_CLICK, addEndPoint);
}

function drawBarrier(mode) {
	drawTool.setMode(mode, function(bounds, geometry) {
		barriers.push(geometry);
		layer.addOverlay(geometry);
		window.caculate();
	});
}

function clearBarrier() {
	for ( var i = 0; i < barriers.length; i++) {
		layer.removeOverlay(barriers[i].id);
	}
	barriers = [];
	window.caculate();
}

function checkedTransport(transport) {
	restrictField = transport;
}