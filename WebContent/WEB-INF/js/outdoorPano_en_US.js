if ('true' !== uploadSuccessful) {
	$().toastmessage('showErrorToast', 'Upload failed !');
}

var map;
var panoramaViewer;
var pMarker;
var specialCharacterPattern = /^[a-z\d\u4E00-\u9FA5]+$/i;

// 二三维联动
var linkage = true;

$(function() {
	init();
	initMap();
	searchPanorama();

	// 提交事件
	$('#param-submit').bind('click', submitHandler);
	
	// 重新校正
	//$('#param-correction').bind('click', correctionHandler);
});

function init() {
	// 设置窗体高度
	var docHeight = $(document).height();
	var docWidth = $(document).width();
	$('#container').height(docHeight);
	$('#param-panel').height(docHeight);
	$('#mapId').height(docWidth * 0.2);

	$('#slider-range').slider({
		range : "min",
		value : 0,
		min : 0,
		max : 360,
		slide : function(event, ui) {
				var slideValue = ui.value;
				$('#pano-northdir').val(slideValue);
				var tempHeading = window.heading;
				if(typeof(window.heading)=="undefined"){
					tempHeading = 0;
				}
				pMarker.rotate(slideValue+tempHeading);
		}
	});
}

// 初始化二维地图
function initMap() {
	if (basemap === '') {
		basemap = '/TServer/resources/js/mapConfig.json';
	}
	
	$.ajax({
		async : false,
		dataType : 'json',
		url : basemap,
		type : 'get'
	}).then(function(res) {
		addMapFromConfig(res);

	}, function() {
		alert('Loading map error!');
	});

}

// 解析 mapConfig.json 内容加载地图
function addMapFromConfig(res) {
	var mapConfig = res;
	map = new NPMapLib.Map(document.getElementById('mapId'), mapConfig.mapOpts);
	var baseLayer = [], vectorLayerItem, sattilateLayerItem, baseLayerItem, vectorBaseLayer = [], sattilateBaseLayer = [], layerType;
	for ( var i = 0, len = mapConfig.vectorLayer.length; i < len; i++) {
		vectorLayerItem = mapConfig.vectorLayer[i];
		layerType = vectorLayerItem.layerType.split('.');
		baseLayerItem = new NPMapLib.Layers[layerType[layerType.length - 1]](
				vectorLayerItem.layerOpt.url, vectorLayerItem.layerName,
				vectorLayerItem.layerOpt);
		vectorBaseLayer.push(baseLayerItem);
		baseLayer.push(baseLayerItem);
	}
	map.addLayers(baseLayer);
	map.addControl(new NPMapLib.Controls.NorthControl());
}

// 查询全景数据
function searchPanorama() {
	var url = '/TServer/panorama/getConfigById';
	var data = {
		'pid' : panoid
	};

	$.post(url, data, panoramaResultHandler);
}

// 全景配置结果处理
function panoramaResultHandler(result) {

	var panoData = new Array(1);
	result.yaw = result.heading||0;
	panoData[0] = result;

	// 场景名称
	$('#pano-name').val(result.name);
    $('#slider-range').slider("value",180);
	showPanoramaScene(panoData);

	showPanoramaPosition(result);
}

// 显示全景位置
function showPanoramaPosition(result) {
	var size = new NPMapLib.Geometry.Size(96, 96);
	var icon = new NPMapLib.Symbols.Icon('/TServer/resources/img/pano.png',
			size);
	icon.setAnchor(new NPMapLib.Geometry.Size(-48, -48));
	var pPoint = new NPMapLib.Geometry.Point(result.x, result.y);

	pMarker = new NPMapLib.Symbols.Marker(pPoint);
	pMarker.setIcon(icon);

	map.addOverlay(pMarker);

	$('#pano-northdir').val(result.northdir);
	// 视角初始角度
	pMarker.rotate(result.yaw+result.northdir);

	map.centerAndZoom(pPoint, 16);
}

// 显示全景场景
function showPanoramaScene(panoData) {
	panoramaViewer = NPPano.viewer.createNPPano('container', panoData, {
		"autoLoad" : true,
		"autoRotate" : false,
		"showZoomCtrl" : false,
		"showControls" : true,
		"click" : true,
		"location" : '/TServer/panorama/img/'
	});

	panoramaViewer.on('renderend', panoramaViewerRenderendHandler);
}

function panoramaViewerRenderendHandler(pitch, yaw, hfov) {
	// yaw --> heading
	// hfov --> roll
	yaw = yaw;
	var northdir = parseFloat($('#pano-northdir').val());
	if (linkage) {
		pMarker.rotate(yaw+northdir);
	}
    window.heading = yaw;
	$('#pano-heading').val(yaw);
	$('#pano-pitch').val(pitch);
}

//修改全景相关参数
function submitHandler() {
	// if(linkage) {
	// 	// 修改成功后不能再次提交
	// 	return;
	// }
	var name = $('#pano-name').val();
	if ('' === name) {
		$().toastmessage('showErrorToast', 'The scene name is required !');
		return;
	}

	if (!specialCharacterPattern.test(name)) {
		$().toastmessage('showErrorToast', 'The scene name can only contain Chinese, letters, numbers !');
		return;
	}

	var northdir = $('#pano-northdir').val();

	var data = {
		'panoid' : panoid,
		'name' : name,
		'northdir' : northdir
	};

	$.post('/TServer/panorama/updateOutdoorData', data, function(result) {
		if (true === result.successful) {
			$().toastmessage('showErrorToast', 'Successful !');;
			//$('#slider-range').css('display','none');
			//$('#param-submit').removeClass('param-submit');
			//$('#param-submit').addClass('param-submit2');
			//$('#param-correction').removeClass('param-submit2');
			//$('#param-correction').addClass('param-submit');
			
			// linkage = true;
		} else {
			$().toastmessage('showErrorToast', 'Failed !');
		}
	});
}

// 重新校正
function correctionHandler() {
	// if(!linkage) {
	// 	return;
	// }
	// $('#slider-range').css('display','block');
	// $('#param-correction').removeClass('param-submit');
	// $('#param-correction').addClass('param-submit2');
	// $('#param-submit').removeClass('param-submit2');
	// $('#param-submit').addClass('param-submit');
	// linkage = false;
}