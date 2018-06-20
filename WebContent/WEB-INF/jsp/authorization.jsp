<%@ page language="java" contentType="text/html; charset=UTF-8"%>
<%@taglib prefix="spring" uri="http://www.springframework.org/tags" %>
<html>
<head>

<style type="text/css">
/* * { font-family: "宋体"; font-size: 14px } */
.button {
	cursor: hand;
	text-align: center;
	font-size: 14px;
	font-weight: bold;
	color: #fff;
	border-radius: 5px;
	margin: 0 0px 0px 0;
	position: relative;
	overflow: hidden;
}

.button.bule {
	width: 100px;
	line-height: 38px;
	border: 1px solid #428bca;
	background: #428bca;
}

.button.green {
	line-height: 30px;
	width: 80px;
	border: 1px solid #5bc0de;
	background: #5bc0de;
}

li {
	list-style-type: square;
	margin: 10px 0 0 0;
}

.langDiv {
	float: right;
	width: 150px;
	text-align: center;
}
</style>

<title><spring:message code="authorization.bt" /></title>
</head>
<body>
    <div class="langDiv">
        <a href="?lang=zh_CN"><spring:message code="language.cn" /></a> | <a href="?lang=en_US"><spring:message code="language.en" /></a>    
    </div>
	&nbsp;&nbsp;&nbsp;&nbsp;<a href="/TServer/authorization/key0Generator"><spring:message code="authorization.sckey0" /></a>
	
	<div style=" width:800px; height:500px;margin:0 auto;position:relative; top:50px;background-color:#eee;">
		<div style=" margin:0 auto;position:relative; width:600px; height:30px;">
			<br/>
			<p align="center" style="font-size:40px;"><spring:message code="authorization.bt" /></p>
			<form id="form1" name="form1" method="post" action="/TServer/servlet/fileServlet" enctype="multipart/form-data">
			<div style="padding-top: 40px;width:600px;">
				 <table style="width:600px;height:200px;">
				  <tr style="height:100px;">
				   <!-- <td style="text-align: right;width:300px;">授权文件：</td> -->
				   <td colspan="2" style="text-align: center;">
							<spring:message code="authorization.sqwj" />：	
				   			<input id="textfield" type="text" style="height:30px;background:transparent;border:1px solid #777;border-radius:3px;" disabled />
				   			<input id="file" name="file" type="file" size="30" style="display: none;" onchange="document.getElementById('textfield').value=this.value" />
							<input type="button" id="" value="<spring:message code="authorization.ll" />" onclick="document.getElementById('file').click()" class="button green" />
		
				   </td>
				  </tr> 
				  
				  <tr>   
				   <td style="text-align: right;">
				   	<input type="submit" name="submit" class="button bule" value="<spring:message code="authorization.tj" />" style="margin-right:20px;" >
				   </td>
				   <td style="text-align: left;">
				    
				    <input type="reset" name="reset" class="button bule" value="<spring:message code="authorization.cz" />" style="margin-left:20px;" >
				   </td>
				  </tr>
				 </table>
	 		</div>
		</form>
		</div>
	</div>
	
	<div style=" width:800px; height:200px;margin:0 auto;position:relative; top:10px;background-color:#fff;">
		<br/>
		<p align="center" style="font-size:1em;"><spring:message code="authorization.sqsm" /></p>
		<ul>
			<li><spring:message code="authorization.sqsm1-1" />&nbsp;<font color="red" size="1em"><spring:message code="authorization.sqsm1-2" /></font></li>
			<li><spring:message code="authorization.sqsm2-1" /><%-- <font color="red">liupengyu@netposa.com</font><spring:message code="authorization.sqsm2-2" /> --%></li>
			<li><spring:message code="authorization.sqsm3" /></li>
		</ul>
	</div>
</body>
</html>