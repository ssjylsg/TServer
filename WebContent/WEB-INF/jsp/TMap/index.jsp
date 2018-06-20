<%--
  Created by IntelliJ IDEA.
  User: Administrator
  Date: 2018/6/15
  Time: 16:31
  To change this template use File | Settings | File Templates.
--%>
<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
    <title>欢迎使用TServer</title>
    <style type="text/css">

    </style>
    <link href="/TServer/resources/css/main.css" rel="stylesheet" type="text/css">
    <link href="/TServer/resources/css/bootstrap.css" rel="stylesheet" type="text/css">
</head>
<body class="bodyclass">
    <div>
    <div class="headMenu" id="headMenu">
		  <!--<div class="headMenulogo">-->
	       		 <img class="headlogo" src="/TServer/resources/img/logo1920.png" style="width: 226px; height: 45px;">
		  <!--</div>-->

		   <div class="headMenus">
		     <ul class="nav-main">
		       <li class="subHeadMenu services"><a href="/TServer/map/services">服务列表</a></li>
    		   <li class="subHeadMenu manager"><a href="/TServer/admin/config">服务管理</a></li>
    		   <li class="subHeadMenu manager"><a href="/TServer/admin/config">工具介绍</a></li>
    		   <li class="subHeadMenu help"><a href="help">联机帮助</a></li>
    		   
    		 </ul>
		   </div>
		 </div>
        <div class="headerweclome">
            <div class="headWelcomeTitle">
                <h1 class="headWelcomeTitleli">Welcome to TServer</h1>
                <h2>跨平台GIS应用服务器+可扩展GIS服务开发平台</h2>
            </div>
            <a href="/TServer/map/services">
        	 <div class="headWelcomePic"></div>
         	</a>
        </div>
    </div>
</body>
</html>
