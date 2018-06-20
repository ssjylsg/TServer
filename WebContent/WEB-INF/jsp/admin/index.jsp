<%@ page language="java" contentType="text/html; charset=utf-8"
    pageEncoding="utf-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<title>Insert title here</title>
</head>
<body>
<div class="login">
<div>

<form method="POST" action="<%=request.getContextPath() %>/admin/add">
<ol>
	<lable>用户名:</lable><input type="input" name="username"  value=""/>
	<lable>密码:</lable><input type="password" name="password"  value=""/>
	<input type="submit" value ="提交">
</ol>
</form>

</div>
</div>

</body>
</html>