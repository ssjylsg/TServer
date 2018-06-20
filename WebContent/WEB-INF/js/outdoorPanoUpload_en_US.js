//var map;
var specialCharacterPattern = /^[a-z\d\u4E00-\u9FA5]+$/i;

$(function() {
	// 场景文本框提示
	$('#upload-realname').attr('placeholder','The scene name');
	initMap();
	initUpload();
});

// 地图初始化
function initMap() {
	var docHeight = $(document).height();
	$('#mapId').height(docHeight - 50);

	npMap.createMap(("mapId"), {
		mapType : 'tiandiMap',
		callback : function(map) {
			npMap.setMap(map);
			window.map = map;
			map.updateSize();
			
			// 鼠标左键事件
			npMap.addClickHandler(mapClickHandler);
		},
		mapChangedHandler: mapChangedHandler
	});
}

function initUpload() {
	// 打开文件选择对话框
	$('#upload-pick-label').bind('click', function(e) {
		$('#upload-pick-input').click();
	});

	// 选择文件文件后获取文件名称
	$('#upload-pick-input').bind('change', function(e) {
		// 验证
		verifyImg();
	});
}

// 地图更换事件处理
function mapChangedHandler(url) {	
	$('#upload-basemap').val(url);
}

// 地图左键事件处理
function mapClickHandler(point) {
	map.clearOverlays();
	$('#upload-x').val('');
	$('#upload-y').val('');
	$('#upload-realname').val('');

	var size = new NPMapLib.Geometry.Size(14, 19);
	var icon = new NPMapLib.Symbols.Icon(
			'/TServer/resources/img/map-marker-smallpink.png', size);

	var lon = point.lon;
	var lat = point.lat;
	var pPoint = new NPMapLib.Geometry.Point(lon, lat);

	var pMarker = new NPMapLib.Symbols.Marker(pPoint);
	pMarker.setIcon(icon);
	map.addOverlay(pMarker);
	
	$('#upload-x').val(lon);
	$('#upload-y').val(lat);

	showUploadWindow();
}

// 上传窗口显示
function showUploadWindow() {
	$('#append-panel').css('display', 'none');
	$('#upload-panel').css('display', 'block');

	$('#uploadWindow').dialog({
		title : "Upload image",
		autoOpen : true,
		modal : true,
		width : '800px',
		height : '600',
		close : initPickInput,
		buttons : {
			'Complete the upload' : function() {
				uploadImg();
			},
			'Cancel' : function() {
				$(this).dialog('close');
				document.getElementById('upload-pick-input').value = "";
			}
		}
	});
	
	// 完成上传按钮不可用
	uploadButtonDisabled(true);
}

// 完成上传按钮可用状态控制
function uploadButtonDisabled(disabled) {
	var buttons = $('.ui-dialog-buttonset').children('button');
	
	if(disabled) {
		$(buttons[0]).attr("disabled","disabled");
	} else {
		$(buttons[0]).removeAttr("disabled");
	}
}

// 清空上传控件值
function initPickInput() {
	document.getElementById('upload-pick-input').value = "";
}

//验证上传图片
function verifyImg() {
	var files = document.getElementById('upload-pick-input').files;

	if (files.length !== 1) {
		$().toastmessage('showErrorToast', 'Can only upload a picture !');
		initPickInput();
		return;
	}

	var file = files[0];
	var type = file.type;

	// 判断图片格式
	if (type.indexOf('jpeg') === -1) {
		$().toastmessage('showErrorToast', 'Picture format can only be jpg !');
		initPickInput();
	} else {
		// 判断图片宽高比
		verifyProportion();
	}
}

// 验证图片比例
function verifyProportion() {
	var fileData = document.getElementById('upload-pick-input').files[0];

	var reader = new FileReader();

	reader.onload = function(e) {
		var data = e.target.result;
		//加载图片获取图片真实宽度和高度
		var image = new Image();

		image.onload = function() {
			var width = image.width;
			var height = image.height;

			var proportion = width / height;

			if (proportion === 2) {
				preivew();
			} else {
				$().toastmessage('showErrorToast', 'Picture aspect ratio can only be equal to 2: 1 !');
				initPickInput();
			}
		};
		image.src = data;
	};

	reader.readAsDataURL(fileData);
}

// 上传图片预览
function preivew() {
	var pickElement = document.getElementById('upload-pick-input');
	var imgURL = getUploadImgURL(pickElement);

	if ('' === imgURL) {
		$().toastmessage('showErrorToast', 'Image preview is not supported !');
	} else {
		$("#upload-preivew-img").attr("src", imgURL);

		$('#upload-panel').css('display', 'none');
		$('#append-panel').css('display', 'block');
		
		// 完成上传按钮可用
		uploadButtonDisabled(false);
	}
}

// 获取图片 URL
function getUploadImgURL(pickElement) {
	var url = '';
	if (window.createObjectURL != undefined) {
		url = window.createObjectURL(pickElement);
	} else if (window.URL != undefined) {
		url = window.URL.createObjectURL(pickElement.files[0]);
	} else if (window.webkitURL != undefined) {
		url = window.webkitURL.createObjectURL(pickElement);
	}

	return url;
}

// 完成上传
function uploadImg() {
	// 获取名称
	var realName = $('#upload-realname').val();
	
	if ('' === realName) {
		$().toastmessage('showErrorToast', 'The scene name is required !');
		return;
	}
	
	if (!specialCharacterPattern.test(realName)) {
		$().toastmessage('showErrorToast', 'The scene name can only contain Chinese, letters, numbers !');
		return;
	}
	
	$('#upload-submit').click();
}
