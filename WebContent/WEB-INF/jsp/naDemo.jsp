<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@taglib prefix="spring" uri="http://www.springframework.org/tags" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
<title><spring:message code="naDemo.bt" /></title>

<style type="text/css">
#mapId {
	min-width: 500px;
	width: 1000px;
	height: 87%;
	position: absolute;
}
.stopName {
	width: 120px
}
</style>
</head>
<body>
	<div style="margin: 0px 20px 0px 5px; height: 98%">
		<div style="height: 75%">
			 
			<div style="width: 450px; float: left; margin-top: 10px;margin-left: 20px;line-height:150%;">
				<b><spring:message code="naDemo.sfxz" />：</b> 
				<label for="Dijkstra">Dijkstra</label> 
				<input type="radio" id="Dijkstra" value="Dijkstra" name="algorithm" checked="checked" />
				<label for="Astar">Astar</label> 
				<input type="radio" id="Astar" value="Astar" name="algorithm" />
				<div style="margin-top:10px;">
					<b><spring:message code="naDemo.qsd" />：</b> 
					<input type="text" id="startPointTxt" value="121.30777377796,31.274183041244" /> 
					<input type="text" id="startName" class="stopName"> <br />
					<b><spring:message code="naDemo.zhd" />：</b>
					<input type="text" id="endPointTxt" value="121.40391352052,31.282617040765" /> 
					<input type="text" id="endName" class="stopName" /> 
					<input value="<spring:message code="naDemo.js" />" type="button" id="caculateRoadNet" />

					<div style="margin-top:10px;">
						<input type="button" value="<spring:message code="naDemo.ks" />" id="roadStart" /> 
						<input type="button" value="<spring:message code="naDemo.tz" />" id="roadStop" /> 
						<input type="button" value="<spring:message code="naDemo.cxks" />" id="roadProcess" />
					</div>
					<span id="processMsg"></span>
				</div>

				<div id="routeMessge"
					style="left: 10px; margin-top:10px; width: 100%; height: 100%; background-color: RGB(248, 248, 248); overflow: auto; font-size: 14px"></div>
			</div>
			<div style="margin-left: 500px; height: 100%">
				<div id="mapId"></div>
			</div>
		</div>
		<div>
			<div style="margin-left: 20px;line-height:150%;">
				<b><spring:message code="naDemo.fwdz" />：</b>netposa/gis/na<br /> 
				<b><spring:message code="naDemo.cs" />：</b><br /> 
				&nbsp;&nbsp;graph: <i><spring:message code="naDemo.tcmc" /></i><br />
				&nbsp;&nbsp;algorithm: <i><spring:message code="naDemo.zcsf" /></i><br />
				&nbsp;&nbsp;weighter: <i><spring:message code="naDemo.qz" /></i><br />
				&nbsp;&nbsp;stops: <i><spring:message code="naDemo.tkd" /></i><br />
				&nbsp;&nbsp;restrictField: <i><spring:message code="naDemo.txfs" /></i><br />
				&nbsp;&nbsp;planroadtype: <i><spring:message code="naDemo.jslx" /></i><br />
				&nbsp;&nbsp;geoms: <i><spring:message code="naDemo.zaw" /></i><br />
			</div>
		</div>
	</div>
</body>
<script type="text/javascript" src="/TServer/resources/js/jquery.js"></script>
<script type="text/javascript" src="/TServer/resources/map/Init.js"></script>
<script type="text/javascript" src="/TServer/resources/js/npMap.js"></script>
<script type="text/javascript">
    //根据本地化需要加载 js 文件
    var npgisLocal = "${myLocale}";
    document.write("<script type='text/javascript' src='/TServer/js/naDemo_" + npgisLocal + ".js'><\/script>");
</script>
</html>