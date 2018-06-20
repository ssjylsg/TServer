/**
 * 创建Map对象
 */

// 添加判断数组是否包含某元素的方法
Array.prototype.S=String.fromCharCode(2);  
Array.prototype.in_array=function(e)  
{  
var r=new RegExp(this.S+e+this.S);  
return (r.test(this.S+this.join(this.S)+this.S));  
};  


var npMap = {
	map : null,
	createMap : function(mapId, option) {
		var p = $("#"+mapId).parent();
		if($('#mapSelect',p).length == 0){
			
			var div = document.createElement('div');
			div.id = 'mapSelect';
			div.style.position = 'absolute';
			div.style.float = 'right';
			div.style.right = p[0].style.position === '' ? '30px': (p.width() - $('#mapId').width() + 30) +  'px';
			div.style.zIndex = 999;
			div.style.marginTop = '15px';
			div.style.top = p.offset().top;
			
			var s = document.createElement('select');
			
			$(s).append('<option value="/TServer/resources/js/mapConfig.json">高德地图</option>');
			$.getJSON('/TServer/map/maplist',function(services){
				var length = services.length;
				var nameArr = new Array(length);
				for(var i =0;i<length;i++){
					var serviceName = services[i].name;
					
					if(!nameArr.in_array(serviceName)) {
						nameArr[i] = serviceName;
						var o= document.createElement('option');
						// services[i].label 为服务器ip加密的key
						o.value = services[i].url+"/"+services[i].label;
						o.text = serviceName;
						o.map = services[i];
						$(s).append(o);
						
						nameArr[i] = serviceName;
					}
				}
				var tempOption = option || {};
				$(s).change(function(){
					if(map){
						map.destroyMap();
						startMarker = null;
						endMarker = null;
						map = null;
						mapChangedCallback = null;
					}
					
					tempOption.url = $(this).val();
					npMap.createMap(mapId,tempOption);
				});
				div.appendChild(s);
				p.append(div);				
			});
		}
		$.ajax({
					async : false,
					dataType : 'json',
					url : option.url || '/TServer/resources/js/mapConfig.json',
					type : 'get'
				})
				.then(
						function(res) {
							mapConfig = res;
							var map = window.map = new NPMapLib.Map(document
									.getElementById(mapId), mapConfig.mapOpts);

							/** ****基础图层***** */
							var baseLayer = [], vectorLayerItem, sattilateLayerItem, baseLayerItem, vectorBaseLayer = [], sattilateBaseLayer = [], layerType;
							for (var i = 0, len = mapConfig.vectorLayer.length; i < len; i++) {
								vectorLayerItem = mapConfig.vectorLayer[i];
								layerType = vectorLayerItem.layerType
										.split('.');
								baseLayerItem = new NPMapLib.Layers[layerType[layerType.length - 1]](
										vectorLayerItem.layerOpt.url,
										vectorLayerItem.layerName,
										vectorLayerItem.layerOpt);
								vectorBaseLayer.push(baseLayerItem);
								baseLayer.push(baseLayerItem);
							}
							map.addLayers(baseLayer);
							map.addControl(new NPMapLib.Controls.NavigationControl());
							map.addControl(new NPMapLib.Controls.OverviewControl());
							npMap.map = map;
							option.callback && option.callback(map);
							// 地图 change 回调 
							option.mapChangedHandler && option.mapChangedHandler(option.url || '');
						}, function() {

						});
	},
	setMap : function(map) {
		npMap.map = map;
	},
	getMap : function() {
		return npMap.map;
	},
	crateMark : function(pt, clientData, layer) {
		var size = new NPMapLib.Geometry.Size(32, 32);
		var icon = new NPMapLib.Symbols.Icon(
				"/TServer/resources/img/RedPin1LargeB.png", size);
		icon.setAnchor(new NPMapLib.Geometry.Size(-size.width / 2,
				-size.height / 2));
		marker = new NPMapLib.Symbols.Marker(pt);
		marker.setIcon(icon);
		marker.setTitle(clientData.name);
		marker.setData(clientData);
		if (layer) {
			layer.addOverlay(marker);
		} else {
			npMap.map.addOverlay(marker);
		}
		marker.addEventListener('click', function(f) {
			alert(f.getData().name);
		})
		return marker;
	},
	searchpoicoord : function(lonlat, callBack) {
		$.getJSON('/TServer/query/poicoord?coord=' + lonlat.lon + ","
				+ lonlat.lat, function(result) {
			if (result) {
				callBack(result.name || result.address);
			}
		});
	},
	searchRoadCrossInBounds : function(gemo, layer, callBack) {		 
//		var q = $.map(gemo.getPath(),function(value,index){return value.lon + " " + value.lat}).join(",");
//		q = "POLYGON((" + q + "))";
		var q = WKT.write(gemo,npMap.getMap());
		$.post('/TServer/query/searchRoadCrossInBounds?', {
			"wkt" : q,
			"key" : ''
		},
				function(result) {
					if (result.isSucess && result.data) {
						var list = [];
						for (var i = 0; i < result.data.length; i++) {
							var geometry = eval("(" + result.data[i].geometry
									+ ")").coordinates;
							list.push({
								point : new NPMapLib.Geometry.Point(
										geometry[0], geometry[1]),
								clientData : result.data[i]
							})
							npMap.crateMark(new NPMapLib.Geometry.Point(
									geometry[0], geometry[1]), result.data[i],
									layer);
						}
						if (callBack) {
							callBack(list);
						}
					}
				}, "json");
	},
	searchPoiInBounds : function(gemo, layer) {
		// var q = $.map(gemo.getPath(), function(p) {
		// return p.lon + " " + p.lat
		// }).join(",");
		var wkt = new OpenLayers.Format.WKT();
		var q = wkt.write(gemo._apiObj);
		$.post('/TServer/query/searchInBounds?', {
			"wkt" : q,
			"key" : ''
		},
				function(result) {
					if (result.isSucess && result.data) {
						for (var i = 0; i < result.data.length; i++) {
							var geometry = eval("(" + result.data[i].geometry
									+ ")").coordinates;
							npMap.crateMark(new NPMapLib.Geometry.Point(
									geometry[0], geometry[1]), result.data[i],
									layer);
						}
					}
				}, "json");
	},
	addAnimationLine : function(points, layer) {
		var markers = [];
		var host = "/TServer/resources/img/"
		for (var i = 0; i < points.length; i++) {
			var marker = new NPMapLib.Symbols.Marker(points[i]);
			var tempIcon;
			if (i == 0) {
				tempIcon = new NPMapLib.Symbols.Icon(host
						+ "map-marker-start.png", new NPMapLib.Geometry.Size(
						29, 29));
			} else if (i == points.length - 1) {
				tempIcon = new NPMapLib.Symbols.Icon(host
						+ "map-marker-end.png", new NPMapLib.Geometry.Size(29,
						29));
			} else {
				tempIcon = new NPMapLib.Symbols.Icon(host
						+ "map-marker-smallpink.png",
						new NPMapLib.Geometry.Size(12, 14));
			}
			marker.setIcon(tempIcon);
			markers.push(marker);
		}

		var offset = new NPMapLib.Geometry.Size(0, -12);
		var headerMarker = new NPMapLib.Symbols.Marker(points[0], {
			offset : offset
		});
		var icon = new NPMapLib.Symbols.Icon(host + "temptracker.png",
				new NPMapLib.Geometry.Size(29, 29));
		headerMarker.setIcon(icon);
		layer.addOverlay(headerMarker);

		animationLine = new NPMapLib.Symbols.AnimationLine(npMap.getMap().id,
				points, {
					headerMarker : headerMarker,
					color : 'red',
					opacity : 0.8,
					weight : 2
				});
		animationLine.setLayer(layer);
		animationLine.setSpeed(1);
		return animationLine;
	},
	addClickHandler:function(callBack) {
		map.addEventListener(NPMapLib.MAP_EVENT_CLICK, callBack);
	}

};
