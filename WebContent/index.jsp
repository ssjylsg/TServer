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
<meta http-equiv="pragma" content="no-cache">
<meta http-equiv="cache-control" content="no-cache">
<meta http-equiv="expires" content="0">
<meta http-equiv="keywords" content="keyword1,keyword2,keyword3">
<meta http-equiv="description" content="This is my page">
</head>
<link rel="shortcut icon" href="favicon.ico" />
<link rel="bookmark" href="favicon.ico" />
</head>

<body>
	<!-- <b>Hello NPGIS Server! </b>
	<a href="/netposa/map/services">服务列表</a> -->
	<% response.sendRedirect("/TServer/welcome/index"); %>
</body>
</html>
