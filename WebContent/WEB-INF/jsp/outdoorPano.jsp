<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@taglib prefix="spring" uri="http://www.springframework.org/tags" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<style type="text/css">
html,body {
	margin: 0;
	padding: 0;
}

#main-pandl {
	height: 100%;
	width: 100%;
}

#container {
	float: left;
	height: 800px;
	width: 80%;
}

#param-panel {
	float: right;
	height: 800px;
	width: 20%;
	min-widht: 380px;
	background-color: #f5f5fa;
	text-align: center;
}

#mapId {
	position: relative;
	top: 0px;
	width: 100%;
}

#param-panel ul span {
	text-align: right;
	width: 100px;
	display: inline-block;
	width: 100px;
}

li {
	list-style-type: none;
	overflow: hidden;
	height: 40px;
	margin: 10px 0 0 0;
}

input[type='text'] {
	width: 150px;
}

.h-line {
	width: 100%;
	height: 1px;
	margin: 0px auto;
	padding: 0px;
	background-color: #D5D5D5;
	overflow: hidden;
}

.param-submit-content {
	position: relative;
	width: 100%;
	height: 50px;
	line-height: 50px;
	margin: 0 auto;
	text-align: center;
	/* background-color: #fff; */
}

.param-submit {
	float: none;
	display: inline;
	width: 100px;
	height: 24px;
	line-height: 24px;
	margin-top: 13px;
	margin-right: 10px;
	padding: 0;
	background-color: #65a2fc;
	border: 1px solid #5399ff;
	-webkit-border-radius: 3px;
	-moz-border-radius: 3px;
	-ms-border-radius: 3px;
	-o-border-radius: 3px;
	border-radius: 3px;
	color: #fff;
	cursor: pointer;
}

/* .param-submit2 {
    float: none;
    display: inline;
    width: 100px;
    height: 24px;
    line-height: 24px;
    margin-top: 13px;
    margin-right: 10px;
    padding: 0;
    background-color: #fff;
    border: 1px solid #e1e1e6;
    -webkit-border-radius: 3px;
    -moz-border-radius: 3px;
    -ms-border-radius: 3px;
    -o-border-radius: 3px;
    border-radius: 3px;
    color: #65a2fc;
    cursor: pointer;
} */

.slider-range-content {
	position: relative;
	width: 100%;
	height: 50px;
	line-height: 50px;
	margin: 0 auto;
	text-align: center;
	line-height: 50px;
}

.slider-range { /* position: relative; */
	width: 80%;
	margin: 10px auto;
}
</style>
<link rel="stylesheet" href="/TServer/resources/css/jquery-ui-1.9.2.custom.min.css">
<link href="/TServer/resources/css/jquery.toastmessage.css" media="all" rel="stylesheet" type="text/css" />
<link href="/TServer/resources/panorama/pannellum.css" media="all" rel="stylesheet" type="text/css" />
<title><spring:message code="outdoorPano.bt" /></title>
</head>
<body>
    <div id="main-pandl">
	    <div id="container" style="position: absolute;">
	        <noscript>
	            <div class="pnlm-info-box">
	                <p>Javascript is required to view this panorama.
	                    <br>(It could be worse; you could need a plugin.)</p>
	            </div>
	        </noscript>
	    </div>
	    
	    <div id="param-panel" >
	       <div id="mapId"></div>
	       <div class="h-line"></div>
	       <div style="position: relative;top:10px;">
		       <h3><spring:message code="outdoorPano.qjfwjz" /></h3>
		       <br />
		       <ul>
	               <li>
	                   <span><spring:message code="outdoorPano.mc" />：</span>
	                   <input id="pano-name" type='text' />
	               </li>
	           </ul>
	           <!-- <ul>
	               <li>
	                   <span>northdir：</span>
	                   <input id="pano-northdir" type='text' />
	               </li>
	           </ul> -->
	           <ul style="display: none;">
	               <li>
	                   <span>heading：</span>
	                   <input id="pano-heading" type="text" readonly />
	               </li>
	           </ul>
	           <!-- <ul>
	               <li>
	                   <span>roll：</span>
	                   <input id="pano-roll" type="text" readonly />
	               </li>
	           </ul> -->
	           <ul style="display: none;">
	               <li>
	                   <span>pitch：</span>
	                   <input id="pano-pitch" type="text" readonly />
	               </li>
	           </ul>
	           <ul>
                   <li>
                       <span><spring:message code="outdoorPano.zbjj" />：</span>
                       <input id="pano-northdir" type="text" readonly />
                   </li>
               </ul>
               
               <div class="slider-range-content">
                   <div id="slider-range" class="slider-range"></div>
               </div>
               
	           
	           <div class="param-submit-content">
                   <div id="param-submit" class="param-submit">&nbsp;&nbsp;<spring:message code="outdoorPano.tj" />&nbsp;&nbsp;</div>
<%--                    <div id="param-correction" class="param-submit2">&nbsp;&nbsp;<spring:message code="outdoorPano.cxjz" />&nbsp;&nbsp;</div> --%>
               </div>
	       </div>
	       
	       <div class="h-line"></div>
	       
	       <div style="position: relative;top:10px;">
	           <h4><spring:message code="outdoorPano.sysm" /></h4><br />
	           <div style="text-align: left;margin-left: 5px;">
		           <ul>
		               <li><spring:message code="outdoorPano.sysm1" /></li>
		               <li><spring:message code="outdoorPano.sysm2" /></li>
		           </ul>
		       </div>
		   </div>
	       
	    </div>
    </div>
</body>

<script type="text/javascript" src="/TServer/resources/js/jquery.js"></script>
<script type="text/javascript" src="/TServer/resources/js/jquery-ui-1.9.2.custom.min.js"></script>
<script type="text/javascript" src="/TServer/resources/map/Init.js"></script>
<script type="text/javascript" src="/TServer/resources/js/npMap.js"></script>
<script type="text/javascript" src="/TServer/resources/panorama/pano.js"></script>
<script type="text/javascript" src="/TServer/resources/js/jquery.toastmessage.js"></script>
<script type="text/javascript">
    var uploadSuccessful = "${successful}";

    // 根据本地化需要加载 js 文件
    var npgisLocal = "${myLocale}";
    var panoid = "${panoid}";
    
    // 底图
    var basemap = "${basemap}";
    
    document.write("<script type='text/javascript' src='/TServer/js/outdoorPano_" + npgisLocal + ".js'><\/script>");
</script>
</html>