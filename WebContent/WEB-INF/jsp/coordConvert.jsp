<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%@taglib prefix="spring" uri="http://www.springframework.org/tags" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<title><spring:message code="coordConvert.bt" /></title>
<link rel="stylesheet" type="text/css"
	href="/TServer/resources/css/main.css" />
<style type="text/css">
li {
       line-height:150%;
    }
</style>
</head>
<body>
	<div class='mainform'>
		<span style="FONT-WEIGHT: bold"> TServer Directory</span>
		<div class='top'>
			<b><a href='/TServer/arcgis/services'>Home</a> > <a href=""><spring:message code="coordConvert.bt" />Service</a></b>
		</div>
		<div>
			<ul>
				<li><b><spring:message code="coordConvert.fwdz" />：</b>netposa/coordConvert?from={from}&to={to}&x={x}&y={y}</li>
				<li><b><spring:message code="coordConvert.cssm" />：</b>from,to value:1(WGS84 <spring:message code="coordConvert.jwd" />),2(gcj <spring:message code="coordConvert.hxzb" />),3(BAIDU
					<spring:message code="coordConvert.bdzb" />),4(900913 <spring:message code="coordConvert.pmzb" />)</li>
				<li><b>Demo：</b><a target="_blank" href=/TServer/coordConvert?from=1&to=2&x=121.32&y=32.3>demo</a></li>
			</ul>
		</div>
	</div>
</body>
</html>