<%@ page language="java" contentType="text/html; charset=utf-8"
	pageEncoding="utf-8"%>
<%@taglib prefix="spring" uri="http://www.springframework.org/tags" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<title>PGIS <spring:message code="pgis.bt" /></title>
<link rel="stylesheet" type="text/css"
	href="/TServer/resources/css/main.css" />
<style type="text/css">
.mainForm {
	margin: 15px 5px 10px 5px;
	min-height:500px;
	min-width:500px;
}

label {
	display: inline-block;
	width: 120px;
	text-align: right;
}

.middletop {
	position: absolute;
	width: 40%;
}

.middletop div {
	margin-top: 5px;
}

.operation {
	margin-left: 600px;
	float: left;
}

.middle {
	margin-top: 250px;
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
			<a href="/TServer/arcgis/">Home</a> > <a href="/TServer/map/services">services</a>>
			<a href="/TServer/pgis">PGIS</a>
		</div>
		<div class="middletop">
			<div>
				<label><b><spring:message code="pgis.fwdz" />：</b></label> <input type="text" id="mapServer"
					style="width: 400px;"
					value="http://10.173.2.20/PGIS_S_TileMapServer/Maps/V">
			</div>
			<div>
				<label><b><spring:message code="pgis.zxcj" />：</b></label> <input type="text" id="minZoom"
					style="width: 250px;" value="13">
			</div>
			<div>
				<label><b><spring:message code="pgis.zdcj" />：</b></label> <input type="text" id="maxZoom"
					style="width: 250px;" value="20">
			</div>
			<div>
				<label><b><spring:message code="pgis.xzqy" />：</b></label> <input type="text" id="restrictedExtent"
					style="width: 400px;"
					value="106.56395859374,33.179194843749,108.88134140624,34.301265156249">
			</div>
			<div>
				<label><b><spring:message code="pgis.bbh" />：</b></label> <input type="text" id="version"
					style="width: 250px;" value="0.3"> <label for="isDebug"><spring:message code="pgis.sfds" />DEBUG</label><input
					type="checkbox" id="isDebug">
			</div>
			<div>
				<label><b><spring:message code="pgis.dtzxd" />：</b></label> <input type="text" id="maxCenter"
					style="width: 250px;" value="108.72265,34.24023"> <input
					type="button" value="<spring:message code="pgis.hqdqdtzxd" />" onclick="getCenter()">
			</div>
			<div style="text-align: center">
				<input type="button" value="<spring:message code="pgis.jzdt" />" id="loadMap" > <input
					type="button" value="<spring:message code="pgis.dcdqpz" />" id="mapConfig">
			</div>
		</div>
		<div class="operation">
			<h3><spring:message code="pgis.czsm" />：</h3>
			<p>DEBUG <spring:message code="pgis.jzlstp" />，<spring:message code="pgis.f" />DEBUG <spring:message code="pgis.jzzstp" /></p>
			<p>1.<spring:message code="pgis.czsm1" /></p>
			<p>
				2.<spring:message code="pgis.czsm2_1" />： <br />
				  <spring:message code="pgis.czsm2_2" /> <br />
				  <spring:message code="pgis.czsm2_3" /><br />
				  <spring:message code="pgis.czsm2_4" /> <br />
				  <spring:message code="pgis.czsm2_5" />
			</p>
		</div>
		<div class="middle">
			<div id="mapId" style="width: 95%; height: 450px; min-height: 450px;"></div>
		</div>
	</div>
</body>
<script type="text/javascript" src="/TServer/resources/js/jquery.js"></script>
<script type="text/javascript" src="/TServer/resources/map/Init.js"></script>
<script type="text/javascript">
    //根据本地化需要加载 js 文件
    var npgisLocal = "${myLocale}";
    document.write("<script type='text/javascript' src='/TServer/js/pgisIndex_" + npgisLocal + ".js'><\/script>");
</script>
</html>