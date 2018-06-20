<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%@taglib prefix="spring" uri="http://www.springframework.org/tags" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
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
		<span style="FONT-WEIGHT: bold;"> TServer  Directory</span>
		<div class="top">
			<a href="/TServer/map/">Home</a> > <a
				href="/TServer/map/services">services</a> > <a
				href="/TServer/NPGIS/services/${serviceName}/MapServer">${serviceName}
				(MapServer)</a>
		</div>
		<a href="/TServer/NPGIS/services/${serviceName}/MapServer?f=pjson"
			target="_blank">JSON</a>&nbsp;
		<%-- <a href="/TServer/NPGIS/config/${serviceName}" target="_blank"><spring:message code="NPGISMap.dcdtpzxx" /></a> --%>
		<a id="expConfig" style="text-decoration:underline;color:#0000FF;cursor:pointer;" target="_blank"><spring:message code="NPGISMap.dcdtpzxx" /></a>
		
		<iframe id="downloadFrame" style="display: none;"></iframe>
        <input type="hidden" id="serviceName" value="${serviceName}">
		<h2>${serviceName}(MapServer)</h2>
		<a href="/TServer/NPGIS/services/${serviceName}/Map" target='_blank'><spring:message code="NPGISMap.ckys" /></a> <br />
		<div style='margin-top: 10px'>
			<b>Layer Type：</b>
			<ul>
				<li>${info.layerType}</li>
			</ul>
			<b>Min Zoom：</b>
			<ul>
				<li>${info.minZoom}</li>
			</ul>
			<b>Max Zoom：</b>
			<ul>
				<li>${info.maxZoom}</li>
			</ul>
			<b>Restricted Extent：</b>
			<ul>
				<li>${info.restrictedExtent}</li>
			</ul>
			<b>Type：</b>
			<ul>
				<li>${info.type}</li>
			</ul>
			<b>Center Point：</b>
			<ul>
				<li>${info.centerPoint}</li>
			</ul>
			<b>Full Extent：</b>
			<ul>
				<li>${info.fullExtent}</li>
			</ul>
			<b>Zoom Level Sequence：</b>
			<ul>
				<li>${info.zoomLevelSequence}</li>
			</ul>
			<b>Projection：</b>
			<ul>
				<li>${info.projection}</li>
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
        <ul id="ipPanel">
            <span><spring:message code="mapInfo.fwqip" />:</span>
            <select id="ipSelect" style="width: 200px;height:28px;" >
                
            </select>
        </ul>
        <ul id="renderPanel" style="display: none;">
            <span><spring:message code="mapInfo.xrfs" />:</span>
            <select id="renderSelect" style="width: 200px;height:28px;" >
                <option value=""><spring:message code="mapInfo.qxz" /></option>
                <option value="server"><spring:message code="mapInfo.fwdxr" /></option>
                <option value="client"><spring:message code="mapInfo.khdxr" /></option>
            </select>
        </ul>
        <input type="hidden" id="singleIp" value="null">
    </div>
</body>

<script type="text/javascript">
    //根据本地化需要加载 js 文件
    var npgisLocal = "${myLocale}";
    var type = "${info.type}";
    var layerType = "${info.layerType}";
    document.write("<script type='text/javascript' src='/TServer/js/NPGISMap_" + npgisLocal + ".js'><\/script>");
</script>
</html>