<%@ page language="java" contentType="text/html; charset=utf-8"
	pageEncoding="utf-8"%>
<%@taglib prefix="spring" uri="http://www.springframework.org/tags" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<title></title>
<style type="text/css">
#mapId {
	min-width: 500px;
	width: 1000px;
	height: 100%;
	position: absolute;
	float: right;
}

#message {
	margin-left: 1020px;
}
#message ul{
	margin-bottom:15px;
}
.stopName {
	width: 120px
}

table {
	border: gray;
	border-width: 1px;
	width: 400px;
	text-overflow: ellipsis;	
	overflow: hidden;
}
.roads ul li{
}
table tr td span{
width: 200px;
display: inline-block;
text-overflow: ellipsis;
}
.mapContainer{
    width: 1000px;
    /* position: absolute; */
    position: absolute;
    float: left;
    height: 100%;
}

</style>
</head>
<body>

	<div class='mapContainer'>
	<div id="mapId"></div>
	</div>
	<div id="message">
	<ul>
		<li><b><spring:message code="mutilPoints.fwdz" />：</b><span>
		/TServer/gis/routing?stops=</span></li>
		<li><b><spring:message code="mutilPoints.cssm" />：</b>
		    <br />
			<span style="line-height:150%;">
				&nbsp;&nbsp;stops: <i><spring:message code="mutilPoints.jd" /></i><br>
				&nbsp;&nbsp;algorithm: <i><spring:message code="mutilPoints.zcsf" /></i><br>
				&nbsp;&nbsp;weighter: <i><spring:message code="mutilPoints.qz" /></i> <br>
				&nbsp;&nbsp;RestrictField: <i><spring:message code="mutilPoints.txfs" /></i><br>
				&nbsp;&nbsp;planroadtype: <i><spring:message code="mutilPoints.jslx" /></i><br>
				&nbsp;&nbsp;geoms: <i><spring:message code="mutilPoints.zaw" /></i><br>
			</span>
		</li>
	</ul>
		 
		 
		<input type='button' value='<spring:message code="mutilPoints.js" />' id='caculate'> <input
			type='button' value='<spring:message code="mutilPoints.qc" />' id='remove'>
		<table style="margin-top:10px;">
			<thead>
				<tr>
					<td><spring:message code="mutilPoints.xh" /></td>
					<td><spring:message code="mutilPoints.zb" /></td>
					<td><spring:message code="mutilPoints.cz" /></td>
				</tr>
			</thead>
			<tbody>

			</tbody>
		</table>
		<div class="roads">
			<ul>
			 
			</ul>
		</div>
		<div class="foot">
			<input type='checkbox' checked='checked'><spring:message code="mutilPoints.qx" />
		</div>
	</div>
</body>
<script type="text/javascript" src="/TServer/resources/js/jquery.js"></script>
<script type="text/javascript" src="/TServer/resources/map/Init.js"></script>
<script type="text/javascript" src="/TServer/resources/js/npMap.js"></script>
<script type="text/javascript">
    //根据本地化需要加载 js 文件
    var npgisLocal = "${myLocale}";
    document.write("<script type='text/javascript' src='/TServer/js/mutilPoints_" + npgisLocal + ".js'><\/script>");
</script>
</html>