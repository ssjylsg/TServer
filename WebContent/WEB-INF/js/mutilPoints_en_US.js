Array.prototype.remove = function(value) {

	for ( var i = 0, n = 0; i < this.length; i++) {
		if (this[i] != value) {
			this[n++] = this[i];
		}
	}
	this.length -= 1;
};
var endImage = "/TServer/resources/img/map-marker-end.png";
var startImage = "/TServer/resources/img/map-marker-start.png";
var middleImage = "/TServer/resources/img/marker_hole.png";
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
var index = 1;
var roadPoints = {
	start : null,
	end : null,
	middle : []
};
function remove() {
	index = 1;
	map.removeOverlays(roadPoints.middle);
	roadPoints.middle = [];
	layer.removeAllOverlays();
	$('table tbody tr[data="middel"]').remove();
	$(".roads ul").html('');
}
$(function() {
	$(".foot input[type='checkbox']").click(function() {
		var checkbox = $(".roads ul li input[type='checkbox']");
		var selected = this.checked;
		$.each(checkbox, function(index, value) {
			value.checked = selected;
			selected ? value.data.show() : value.data.hide();
		});
		checkbox.attr('checked', selected);
	});
	$("#remove").click(remove);
	$("#caculate").click(caculate);
	npMap.createMap(("mapId"), {
		mapType : 'tiandiMap',
		callback : function(map) {
			map.setCenter({
				lon : 121.44468355826,
				lat : 31.207964693634
			});
			layer = new NPMapLib.Layers.OverlayLayer("routing");
			map.addLayer(layer);
			map.addControl(new NPMapLib.Controls.MousePositionControl());
			drawTool = new NPMapLib.Tools.DrawingTool(map.id);
			npMap.setMap(map);
			var menu = [];
			menu.push({
				'Starting point' : function(p) {
					addStartPoint(p);
					roadPoints.start = p;
					caculate();
				}
			});
			menu.push({
				'Add a waypoint' : function(p) {
					addMiddle(p);
					caculate();
				}
			});
			menu.push({
				'Terminal point' : function(p) {
					addEndPoint(p);
					roadPoints.end = p;
					caculate();
				}
			});
			map.addContextMenu(menu);
			window.map = map;
		}
	});
});
var service = null;
function caculate() {
	if (roadPoints.start && roadPoints.end) {
		var postData = {};
		postData.stops = roadPoints.start.lon + "," + roadPoints.start.lat
				+ ";";
		$.each(roadPoints.middle, function(index, value) {
			value = value.getPosition();
			postData.stops += (value.lon + "," + value.lat + ";");
		});
		postData.stops += roadPoints.end.lon + "," + roadPoints.end.lat;
		postData.lang = npgisLocal;
		if (service) {
			service.abort();
		}
		service = $.post('/TServer/gis/routing', postData, function(msg) {
			if (msg) {
				layer.removeAllOverlays();
				$(".roads ul").html('');
				for ( var i = 0; i < msg.length; i++) {
					var temp = msg[i].expend.split(';');
					var list = [];
					for ( var j = 0; j < temp.length; j++) {
						var p = temp[j].split(',');
						list.push(new NPMapLib.Geometry.Point(p[0], p[1]));
					}
					var line = new NPMapLib.Geometry.Polyline(list);
					layer.addOverlay(line);
					line.addEventListener('click', function(f) {
						f.setColor(getColor());
						f.refresh();
					});
					var li = document.createElement('li');

					var ahref = document.createElement('input');
					ahref.type = 'checkbox';
					ahref.checked = true;
					ahref.data = line;
					$(ahref).click(function() {
						this.checked ? this.data.show() : this.data.hide();
					});
					$(li).append(ahref).append("No." + (i + 1) + " route");
					$(".roads ul").append(li);
				}
			}
			service = null;
		}, 'json');
	}
}
function getColor() {
	var a = "0123456789abcdef";
	var b = 0;
	var str = "#";
	for ( var i = 0; i < 6; i++) {
		b = Math.floor(Math.random() * 16);
		str += a[b];
	}
	return str;
}
function addStartPoint(lonlat) {
	startStop = new NPMapLib.Geometry.Point(lonlat.lon, lonlat.lat);
	if (!startMarker) {
		var size = new NPMapLib.Geometry.Size(32, 32);
		var icon = new NPMapLib.Symbols.Icon(startImage, size);
		// 设置偏移量，这里取坐标点为图片中心点
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
					roadPoints.start = p;
					addTableRow(startMarker, 'start');
					window.caculate();
				});
	} else {
		startMarker.setPosition(startStop);
	}
	addTableRow(startMarker, 'start');
	map.removeEventListener(NPMapLib.MAP_EVENT_CLICK);
}

function addTableRow(marker, type) {
	npMap
			.searchpoicoord(
					marker.getPosition(),
					function(name) {
						var p = '<span>' + name
								+ '</sapn><input type="hidden" value="'
								+ marker.getPosition().toString() + '"/>';
						if (type === 'start') {
							if ($('table tbody tr[data="start"]').length > 0) {
								$('table tbody tr[data="start"]').eq(0).find(
										'td').eq(1).html(p);
							} else {
								$('table tbody').append(
										'<tr data="start"><td>Starting point</td><td>' + p
												+ '</td><<td></td>/tr>');
							}
						} else if (type === 'end') {
							if ($('table tbody tr[data="end"]').length > 0) {
								$('table tbody tr[data="end"]').eq(0)
										.find('td').eq(1).html(p);
							} else {
								$('table tbody').append(
										'<tr data="end"><td>Terminal point</td><td>' + p
												+ '</td><<td></td>/tr>');
							}
						} else {
							var title = marker.getTitle();
							var tr = document.createElement('tr');
							tr.data = "middel";
							tr.setAttribute('data', 'middel');
							tr.index = title;
							var td0 = document.createElement('td');
							$(td0).html('Waypoint');
							var td1 = document.createElement('td');
							$(td1).html(p);
							var td2 = document.createElement('td');
							td2.mark = marker;
							marker.setData(td1);
							$(td2)
									.html(
											'<a href="javascript:void" onclick="deleteMark(this)">Delete</a>');
							$(tr).append(td0).append(td1).append(td2);
							if (parseInt(title) === 1) {
								$('table tbody tr[data="start"]').after(tr);
							} else {
								$('table tbody tr[data="middel"]').last()
										.after(tr);
							}
						}
						$('td span').unbind('click').click(function() {
							var value = $(this).find('input').val();
							if (value) {
								var temp = value.split(',');
								map.setCenter({
									lon : temp[0],
									lat : temp[1]
								});
							}
						});
					});
}
function deleteMark(obj) {
	index = index - 1;
	roadPoints.middle.remove($(obj).parent()[0].mark);
	map.removeOverlay($(obj).parent()[0].mark);
	$(obj).parent().parent().remove();
	$.each(roadPoints.middle, function(index, value) {
		value.getLabel().setContent((index + 1) + '');
		value.refresh();
	});
	caculate();
}
function drawStartPoint() {
	map.removeEventListener(NPMapLib.MAP_EVENT_CLICK);
	map.addEventListener(NPMapLib.MAP_EVENT_CLICK, addStartPoint);
}
function addMiddle(lonlat) {
	var point = new NPMapLib.Geometry.Point(lonlat.lon, lonlat.lat);
	var size = new NPMapLib.Geometry.Size(25, 40);

	// 图片
	var icon = new NPMapLib.Symbols.Icon(middleImage, size);
	// 设置偏移量，这里取坐标点为图片中心点
	icon
			.setAnchor(new NPMapLib.Geometry.Size(-size.width / 2,
					-size.height / 2));
	var middle = new NPMapLib.Symbols.Marker(point);
	var title = (index++) + "";
	var label = new NPMapLib.Symbols.Label(title, {
		offset : new NPMapLib.Geometry.Size(0, 3)
	});
	middle.setIcon(icon);
	middle.setLabel(label);
	middle.setTitle(title);
	map.addOverlay(middle);
	roadPoints.middle.push(middle);
	addTableRow(middle);

	middle.enableEditing();
	middle.addEventListener(NPMapLib.MARKER_EVENT_DRAG_END, function(marker) {
		npMap.searchpoicoord(marker.getPosition(), function(name) {
			var p = '<span>' + name + '</sapn><input type="hidden" value="'
					+ marker.getPosition().toString() + '"/>';
			$(marker.getData()).html(p);
		});
		window.caculate();
	});
}
function addEndPoint(lonlat) {
	endStop = new NPMapLib.Geometry.Point(lonlat.lon, lonlat.lat);
	if (!endMarker) {
		var size = new NPMapLib.Geometry.Size(32, 32);
		// 图片
		var icon = new NPMapLib.Symbols.Icon(endImage, size);
		// 设置偏移量，这里取坐标点为图片中心点
		icon.setAnchor(new NPMapLib.Geometry.Size(-size.width / 2,
				-size.height / 2));
		endMarker = new NPMapLib.Symbols.Marker(endStop);
		endMarker.setIcon(icon);
		endMarker.setTitle('Drag to change the route');
		map.addOverlay(endMarker);
		endMarker.enableEditing();
		endMarker.addEventListener(NPMapLib.MARKER_EVENT_DRAG_END, function() {
			var p = endMarker.getPosition();
			roadPoints.end = p;
			var location = p.lon + "," + p.lat;
			addTableRow(endMarker, 'end');
			window.caculate();
		});
	} else {
		endMarker.setPosition(endStop);
	}
	addTableRow(endMarker, 'end');
	map.removeEventListener(NPMapLib.MAP_EVENT_CLICK);
}