<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@taglib prefix="spring" uri="http://www.springframework.org/tags"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<title>TServer<spring:message code="services.fwlb" /></title>
<link rel="stylesheet" type="text/css"
	href="/TServer/resources/css/main.css" />

<style type="text/css">
li {
	line-height: 150%;
}
</style>
</head>
<body>
	<div class='mainform'>
		<span style="FONT-WEIGHT: bold"> TServer Directory</span>
		<div class='top'>
			<a href="/TServer/arcgis/">Home</a> > <a href="/TServer/map/services">Services</a>
		</div>
		<div style='margin-top: 10px'>
			<b><spring:message code="services.dqbbh" />：</b>${version} <br /> <br />
			<b> <spring:message code="services.dtfwlb" />：
			</b>
			<ul>
				<li><a href="/TServer/home/TiandiOnLine"><spring:message
							code="services.zxdt" /></a></li>
				<li><a href="/TServer/arcgis/arcMap"><spring:message
							code="services.wb" /> ArcGIS/NPGIS <spring:message
							code="services.fw" /></a></li>
				<li><a href="/TServer/pgis">PGIS<spring:message
						code="services.fw" /></a> </li>
				<c:forEach items="${message}" var="user">
					<c:if test="${user.mapType == 'arcgis'}">
						<li><a href="/TServer/arcgis/services/${user.name}/MapServer">${user.title}(${user.name}_${user.mapType })</a></li>
					</c:if>
					<c:if test="${user.mapType == 'NPGIS'}">
						<li><a href="/TServer/NPGIS/services/${user.name}/MapServer">${user.title}(${user.name}_${user.mapType })</a>
							<c:if test="${user.type == 'json'}">
								<a
									href="/TServer/NPGIS/services/${user.name}/styleMapEdit?type=baidu"
									target='_blank'><spring:message code="services.gxdtbjgj" /></a>
							</c:if> <c:if test="${user.type == 'gaodejson'}">
								<a
									href="/TServer/NPGIS/services/${user.name}/styleMapEdit?type=gaode"
									target='_blank'><spring:message code="services.gxdtbjgj" /></a>
							</c:if></li>
					</c:if>

				</c:forEach>
			</ul>		
			
			
			<b><a href="/TServer/Map3d/services"><spring:message code="services.modellist" />：</a> </b>
			<ul>
				<c:forEach items="${message}" var="user">
					<c:if test="${user.mapType eq 'model'}">
						<li><a href="/TServer/Map3d/services/${user.name}/Map3d">
								${user.title}(${user.name}_${user.mapType })</a></li>
					</c:if>
				</c:forEach>
			</ul>
			
			<b><spring:message code="services.zbzhfw" />： </b>
			<ul>
				<li><a href="/TServer/coordConvert/index"><spring:message
							code="services.zbzhfw" /></a></li>
			</ul>
			<b><spring:message code="services.hcqfw" />：</b>
			<ul>
				<li><a href="/TServer/gis/bufferDemo" target='_blank'>Buffer
						Service</a></li>
			</ul>
			<b><spring:message code="services.ljghfw" />：</b>
			<ul>
				<li><a href="/TServer/gis/naDemo" target='_blank'>NA
						Service</a></li>
				<li><a href="/TServer/gis/routedemo" target='_blank'><spring:message
							code="services.ddljgh" /></a></li>
			</ul>
			<b><spring:message code="services.zhcxfu" />：</b>
			<ul>
				<li><a href="/TServer/query/querydemo?#地名地址" target='_blank'><spring:message
							code="search.dmdz" /></a></li>
				<li><a href="/TServer/query/querydemo?#逆地名地址" target='_blank'><spring:message
							code="search.ndmdz" /></a></li>
				<li><a href="/TServer/query/querydemo?#查找最近道路" target='_blank'><spring:message
							code="search.cxzjdl" /></a></li>
				<li><a href="/TServer/query/querydemo?#道路搜索" target='_blank'><spring:message
							code="search.dlss" /></a></li>
				<li><a href="/TServer/query/querydemo?#路口搜索" target='_blank'><spring:message
							code="search.lkss" /></a></li>
				<li><a href="/TServer/query/querydemo?#POI范围搜索" target='_blank'><spring:message
							code="search.xqdfwss" /></a></li>
				<li><a href="/TServer/query/querydemo?#路口范围搜索" target='_blank'><spring:message
							code="search.lkfwss" /></a></li>
				<!-- <li><a href="/TServer/query/querydemo?#商圈搜索" target='_blank'>行政区/商圈搜索</a></li> -->
				<li><a href="/TServer/query/querydemo?#道路路口兴趣点搜索"
					target='_blank'><spring:message code="search.dllkxqdss" /></a></li>
				<li><a href="/TServer/query/querydemo?#多边形和道路交叉点搜索"
					target='_blank'><spring:message code="search.dbxhdljcdss" /></a></li>
				<!-- <li><a href="/TServer/query/querydemo?#地址查询兴趣点" target='_blank'>地址查询兴趣点</a></li> -->
				<li><a href="/TServer/query/querydemo?#区划码查询行政区划"
					target='_blank'><spring:message code="search.xzqhcx" /></a></li>
				<li><a href="/TServer/query/querydemo?#区划名称查询行政区划"
					target='_blank'><spring:message code="search.xzqhcx2" /></a></li>
				<%-- <li><a href="/TServer/query/querydemo?#线和道路交点搜索" target='_blank'><spring:message code="search.xhdljcdss" /></a></li> --%>
			</ul>
			<b><spring:message code="services.bzgj" />：</b>
			<ul>
				<li><a href="/TServer/admin/config" target='_blank'><spring:message
							code="services.pzzx" /></a></li>
				<li><a href="/TServer/panorama/outdoorPanoUpload"
					target='_blank'><spring:message code="outdoorPanoUpload.bt" /></a>
				</li>
				<li><a href="/TServer/map/maplist" target='_blank'><spring:message
							code="services.fwlb" /></a></li>
				<li><a href="/TServer/query/district" target='_blank'><spring:message
							code="district.bt" /></a></li>
				<li><a href="/TServer/authorization/authorization"><spring:message
							code="authorization.gxsq" /></a></li>
			</ul>
		</div>
	</div>
</body>
</html>