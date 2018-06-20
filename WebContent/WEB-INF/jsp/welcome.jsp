<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@taglib prefix="spring" uri="http://www.springframework.org/tags" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<style type="text/css">
.langDiv {
    float: right;
    width: 150px;
    text-align: center;
}
</style>
<title>TServer</title>
</head>
<body>
    <div class="langDiv">
        <a href="?lang=zh_CN"><spring:message code="language.cn" /></a> | <a href="?lang=en_US"><spring:message code="language.en" /></a>    
    </div>
    <br />
    <b>Hello TServer! </b>
    <a href="/TServer/map/services"><spring:message code="services.fwlb" /></a>
</body>
</html>