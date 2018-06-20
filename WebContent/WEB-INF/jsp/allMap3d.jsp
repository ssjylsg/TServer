<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<link href="/TServer/resources/css/jquery.toastmessage.css" media="all"
	rel="stylesheet" type="text/css" />
<title>三维模型-${serviceName}</title>
</head>
<style>
html,body,#cesiumContainer {
	width: 100%;
	height: 100%;
	margin: 0;
	padding: 0;
	overflow: hidden;
}

.left {
	position: absolute;
	float: left;
	width: 20%;
}

.right {
	position: inherit;
	float: right;
	width: 80%;
	height: 100%;
}

.left li lable {
	width: 100px;
	display: inline-block;
}

.cesium-viewer-bottom {
	display: none
}
</style>
<body>
	<div class='left'>
		<ul>

		</ul>
	</div>
	<div class="right">
		<div id="cesiumContainer"></div>
	</div>

</body>
<script type="text/javascript" src="/TServer/resources/js/jquery.js"></script>
<script type="text/javascript"
	src="/TServer/resources/js/jquery.toastmessage.js"></script>
<script type="text/javascript"
	src="/TServer/resources/Cesium//NPGIS3D.js"></script>


<script>
	var viewer = new NPMAP3D.MAP3D('cesiumContainer');
	var services = JSON.parse('${models}');
	var ul = $('ul', $('.left'));
	services.map(function(service, index) {
		var li = $('<li></li>');
		var check = $("<input type='checkbox' >");
		li.append($('<lable></lable>').html(service.name)).append(check);
		ul.append(li);
		check.click(function() {
			this.layer.setVisible(this.checked);
			if (this.postion && this.checked)
				viewer.setView({
					"position" : this.postion
				});
		});
		(function(service, check) {
			loadModel(service, check);
		})(service, check[0]);
		if (index == 0) {
			(function() {
				window.setTimeout(function() {
					check.trigger('click');
				}, 2000);
			})(check);
		}
	});

	function loadModel(model, li) {

		var host = window.location.origin;
		var url = host + "/TServer/np3dMap/" + model.mapUrl + "/config";

		var s3MLayer = new NPGIS3D.Layer.S3MLayer(url, model.name);
		li.layer = s3MLayer;
		viewer.addModelLayer(s3MLayer, function() {
			s3MLayer.setVisible(false);
			!model.table && s3MLayer.setEnableSelect(false);
			var postion = s3MLayer.getPosition();
			postion.h = 2500;
			li.postion = postion;
			viewer.setView({
				"position" : postion
			});

			if (model.table && model.table == 'y') {
				var url = '/TServer//Map3d/getModelBySmid?table=' + model.name;
				s3MLayer.addEventListener('click', function(model) {
					if (model.id) {
						$.getJSON(url + "&smId=" + model.id, function(result) {
							if (result.isSucess && result.data.length > 0) {
								$(window).toastmessage('showNoticeToast',
										result.data[0].name)
							}
						})
					}
				})
			}

		});
	}
</script>
</html>