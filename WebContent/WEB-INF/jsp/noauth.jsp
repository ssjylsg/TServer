<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>认证页面</title>
</head>
<body onload='onload()'>
	<form action='/TServer/home/reg' method='POST'>
		<div style="padding-top: 40px;">
			<table style="border: 1px solid; margin: auto;">
				<tr>
					<td>用户信息:</td>
					<td><textarea rows="7" cols="75" readonly='true'>${key}</textarea> <br /> <span
						style='color: red'>请将此信息发送给<a id='sendMail'
							href="mailto:376283911@qq.com;?subject=TServer 注册验证&body=项目名称:<br/>项目编号:<br/>负责人:<br/>用户信息:">GIS组</a>
							并注明所在产品线和负责人,将返回信息填写下表
					</span></td>
				</tr>
				<tr>
					<td>许可信息:</td>
					<td><textarea rows="7" cols="75" id='reginfo' name='reginfo'> </textarea></td>
				</tr>
				<tr>
					<td colspan="2" style='text-align: center'><input
						type='submit' value='提交'></td>
				</tr>
			</table>
		</div>
	</form>
	<script>
		function onload() {
			try {
				var l = document.getElementById("sendMail");
				if (l) {
					l.href = l.href + '${key}';
				}
			} catch (e) {

			}
		}
		var message = '${message}';
		if (message.trim().length != 0) {
			alert("认证失败!");
		}
	</script>
</body>
</html>