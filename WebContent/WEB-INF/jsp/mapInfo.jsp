<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%@taglib prefix="spring" uri="http://www.springframework.org/tags" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
<title>${serviceName}(MapServer)</title>
<link rel="stylesheet" type="text/css"
	href="/TServer/resources/css/main.css" />
<link rel="stylesheet" href="/TServer/resources/css/jquery-ui-1.9.2.custom.min.css">
<link href="/TServer/resources/css/jquery.toastmessage.css" media="all" rel="stylesheet" type="text/css" />
<script type="text/javascript" src="/TServer/resources/js/jquery.js"></script>
<script type="text/javascript" src="/TServer/resources/js/json2.js"></script>
<script type="text/javascript" src="/TServer/resources/js/jquery-ui-1.9.2.custom.min.js"></script>	
<script type="text/javascript" src="/TServer/resources/js/jquery.toastmessage.js"></script>
<style>
#ipConfig {
	display: none;
}

#mapConfig ul span {
	width: 100px;
	display: inline-block;
}
</style>
</head>
<body>
	<div class="mainform">
		<span style="FONT-WEIGHT: bold;"> TServerDirectory</span>
		<div class="top">
			<a href="/TServer/map/">Home</a> > <a
				href="/TServer/map/services">services</a> > <a
				href="/TServer/arcgis/services/${serviceName}/MapServer">${serviceName}
				(MapServer)</a>
		</div>
		<a href="/TServer/arcgis/services/${serviceName}/MapServer?f=pjson" target="_blank">JSON</a>&nbsp;
	 <%-- <a href="/TServer/arcgis/config/${serviceName}" target="_blank">导出地图配置信息</a> --%>
	 
	 	<!-- <a id="expConfig" href="#" target="_blank">导出地图配置信息</a> -->
	 	<a id="expConfig" style="text-decoration:underline;color:#0000FF;cursor:pointer;" target="_blank"><spring:message code="mapInfo.dcdtpzxx" /></a>
	 
	 	<iframe id="downloadFrame" style="display: none;"></iframe>
	 	<input type="hidden" id="serviceName" value="${serviceName}">
		<h2>${serviceName}(MapServer)</h2>
		<a href="/TServer/arcgis/services/${serviceName}/Map" target='_blank'><spring:message code="mapInfo.ckys" /></a> <br />
		<div style='margin-top: 10px'>
			<b>Resolutions：</b>
			<ul>
				<li>${resolutions}</li>
			</ul>
			<b>Center：</b>
			<ul>
				<li>${center}</li>
			</ul>
			<b>Spatial Reference：</b>
			<ul>
				<li>${Spatial}</li>
			</ul>
			<b>Tile Info：</b>
			<ul>
				<li>Height:${Height}</li>
				<li>Width:${Width}</li>
				<li>Origin:${Origin}</li>
			</ul>
			<b>Full Extent：</b>
			<ul>
				<li>XMin:${XMin}</li>
				<li>YMin:${YMin}</li>
				<li>XMax:${XMax}</li>
				<li>YMax:${YMax}</li>
			</ul>
			<b>Service URI：</b>
			<ul>
				<c:forEach var="urls" items="${Urls}">
					<%-- <li>${Url}</li> --%>
					<li>${urls.url}</li>
				</c:forEach>
			</ul>
		</div>
	</div>
	
	<div id="ipConfig">
		<ul>
			<span><spring:message code="mapInfo.fwqip" />:</span>
			<select id="ipSelect" style="width: 200px;height:28px;" >
				
			</select>
		</ul>
	</div>

</body>

<script type="text/javascript">
    //根据本地化需要加载 js 文件
    var npgisLocal = "${myLocale}";
    document.write("<script type='text/javascript' src='/TServer/js/mapInfo_" + npgisLocal + ".js'><\/script>");
</script>
</html>