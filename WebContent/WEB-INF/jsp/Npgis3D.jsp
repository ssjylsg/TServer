<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<link href="/TServer/resources/css/jquery.toastmessage.css" media="all"
	rel="stylesheet" type="text/css" />
<title>三维模型-${serviceName}</title>
</head>
<style>
#cesiumContainer {
	width: 100%;
	height: 100%;
	margin: 0;
	padding: 0;
	overflow: hidden;
}

.cesium-viewer-bottom {
	display: none
}
</style>
<body>
	<div style="position: absolute;width: 100%;height: 100%">
		<div style="height: 30px;    margin-left: 10px;    margin-top: 10px;"><span id="info"></span></div>
		<div id="cesiumContainer"></div>
	</div>
</body>
<script type="text/javascript" src="/TServer/resources/js/jquery.js"></script>
<script type="text/javascript"
	src="/TServer/resources/js/jquery.toastmessage.js"></script>
<script type="text/javascript"
	src="/TServer/resources/Cesium//NPGIS3D.js"></script>


<script>
	var serviceName = '${serviceName}';
	var modelRequest = '${modelRequest}';
	var viewer = new NPMAP3D.MAP3D('cesiumContainer');
	if (serviceName) {
		var host = window.location.origin;
		var url = host + "/TServer/np3dMap/" + '${modelUrl}' + "/config";
		var modelRequest = '${modelRequest}';
		$("#info").html('Config:' +url);
		var s3MLayer = new NPGIS3D.Layer.S3MLayer(url, serviceName);
		window.s3MLayer = s3MLayer;
		viewer.addModelLayer(s3MLayer, function() {

			!modelRequest && s3MLayer.setEnableSelect(false);
			var postion = s3MLayer.getPosition();
			postion.h = 2500;

			viewer.setView({
				"position" : postion
			});

			if (modelRequest) {
				s3MLayer.addEventListener('click', function(model) {
					if (model.id) {
						$.getJSON(modelRequest + model.id, function(result) {
							if (result.isSucess && result.data.length > 0) {
								$(window).toastmessage('showNoticeToast',result.data[0].name)
							}
						})
					}
				})
			}

		});
	}
</script>
</html>