<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%
	String path = request.getContextPath();
	String basePath = request.getScheme() + "://"
			+ request.getServerName() + ":" + request.getServerPort()
			+ path + "/";
%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
<head>
<base href="<%=basePath%>">
<title>TServer</title>
<link rel="stylesheet" type="text/css"
	href="/TServer/resources/css/main.css" />
</head>
<body>
	<div class="arcgis">
		<div class="container_12">
			<div class="primaryTabs">TServer</div>
			<div class="secondaryTabs"></div>
		</div>
		<div
			style="background: url('/TServer/resources/img/globe-bg.jpg') no-repeat top center; height: 400px">
			<div style="width: 400px;">
				<div style="margin-left: 20px">
					<b style="margin-top: 10px">Welcome to TServer</b>
					<p style="padding-left: 1em;">
						<span>Click to open the</span>&nbsp;<a href='${message}'>Services
							Directory</a>
					</p>
				</div>

			</div>
		</div>
	</div>
	<script>
	window.location.href = '/TServer/welcome/index'
	</script>
</body>
</html>
