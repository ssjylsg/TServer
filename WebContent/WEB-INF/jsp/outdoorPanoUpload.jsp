<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@taglib prefix="spring" uri="http://www.springframework.org/tags" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<style type="text/css">
#mapId {
	min-width: 500px;
	width: 100%;
	/* height: 100%; */
	position: absolute;
}

#uploadWindow {
	display: none;
	margin: 0;
	padding: 0;
}

.panel {
	position: absolute;
	left: 0px;
	top: 0px;
	width: 100%;
	height: 100%;
	background-color: #f5f5fa;
}

.upload-pick {
	position: absolute;
	left: 50%;
	top: 50%;
	display: block;
	width: 143px;
	height: 53px;
	line-height: 53px;
	padding: 0;
	padding-left: 63px;
	margin: -27px 0 0 -103px;
	background: url(/TServer/resources/img/upload-btn.png) 0 0 no-repeat;
	color: #fff;
	font-size: 20px;
	text-align: left;
}

.upload-prompt {
	position: absolute;
	left: 0;
	top: 50%;
	width: 100%;
	height: 24px;
	line-height: 24px;
	margin-top: -65px;
	text-align: center;
	color: #999;
	font-size: 14px;
}

.upload-element-invisible {
	position: absolute !important;
	left: -10000px !important;
	top: -10000px !important;
	clip: rect(1px, 1px, 1px, 1px);
	clip: rect(1px, 1px, 1px, 1px);
}

#img-div {
	position: absolute !important;
	top: 270px;
	left: 300px;
	width: 200px;
	height: 200px;
}

/* .upload-append-content {
    position: relative;
    width: 100%;
    height: 50px;
    line-height: 50px;
    margin: 0 auto;
    text-align: center;
    background-color: #fff;
}

.upload-append-pick {
    float: right;
    display: inline;
    width: 78px;
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
} */
.upload-preivew-conent {
	position: relative;
	width: 100%;
	height: 100%;
	margin: 0 auto;
	text-align: center;
}

.upload-preivew-img {
	position: relative;
	width: 800px;
	height: 400px;
	margin: 0 auto;
	text-align: center;
}

.upload-name-content {
	position: relative;
	top: -70px;
	width: 100%;
	height: 70px;
	line-height: 70px;
	/* margin: -60px auto; */
	text-align: center;
	background-color: #f5f5fa;
}

.upload-realname {
	position: relative;
	top: 15px;
	width: 300px;
	height: 30px;
	line-height: 30px;
	/* padding: 20px 5px; */
	border: 1px;
	outline: 0;
	font: 13.3333px Arial;
	cursor: auto;
}

.description {
	width: 100%;
	height: 50px;
	background-color: #fff;
	-webkit-box-shadow: 0 1px 6px 1px rgba(0, 0, 0, .1);
	-moz-box-shadow: 0 1px 6px 1px rgba(0, 0, 0, .1);
	box-shadow: 0 1px 6px 1px rgba(0, 0, 0, .1);
	overflow: hidden;
	text-align: center;
	line-height: 50px;
	font-weight: bold;
	font-size: 1.5em;
}
</style>
<link rel="stylesheet" href="/TServer/resources/css/jquery-ui-1.9.2.custom.min.css">
<link href="/TServer/resources/css/jquery.toastmessage.css" media="all" rel="stylesheet" type="text/css" />
<title><spring:message code="outdoorPanoUpload.bt" /></title>
</head>
<body>
    <div class="description"><spring:message code="outdoorPanoUpload.czsm" /></div>
    <div id="mapId"></div>
    
    
    <!-- 上传窗口 -->
    <div id="uploadWindow">
        <form method="POST" action="/TServer/panorama/outdoorUpload" enctype="multipart/form-data">
	        <div id="upload-panel" class="panel">
	            
			        <div class="upload-pick"><spring:message code="outdoorPanoUpload.djxztp" /></div>
			        
			        <p class="upload-prompt"><spring:message code="outdoorPanoUpload.tpgssm" /></p>
			        
			        <input id="upload-pick-input" type="file" name="files" class="upload-element-invisible" multiple="multiple" accept="image/*"></input>
			        
			        <div id="upload-pick-label" style="position: absolute; top: 210px; left: 300px; width: 206px; height: 53px; overflow: hidden; bottom: auto; right: auto;">
			                
			            <label style="opacity: 0; width: 100%; height: 100%; display: block; cursor: pointer; background: rgb(255, 255, 255);"></label>
			        </div>
	        </div>
	        
	        <div id="append-panel" class="panel" style="display:none;">
	            <!-- <div class="upload-append-content">
	                <div class="upload-append-pick">继续添加</div>
	            </div> -->
	            
	            <div class="upload-preivew-conent">
	                <img id="upload-preivew-img" class="upload-preivew-img"></img>
	            </div>
	            
	            <div class="upload-name-content">
	                <!-- 填写场景名称 -->
	                <input id="upload-realname" name="realname" type="text" class="upload-realname" value ></input>
	            </div>
	        </div>
	        <input id="upload-x" type="text" name="x" style="display: none;" />
	        <input id="upload-y" type="text" name="y" style="display: none;" />
	        <input id="upload-basemap" type="text" name="basemap" style="display: none;" />
	        <input id="upload-submit" type="submit" style="display: none;" />
        </form>
    </div>
    
</body>

<script type="text/javascript" src="/TServer/resources/js/jquery.js"></script>
<script type="text/javascript" src="/TServer/resources/js/jquery-ui-1.9.2.custom.min.js"></script>
<script type="text/javascript" src="/TServer/resources/map/Init.js"></script>
<script type="text/javascript" src="/TServer/resources/js/npMap.js"></script>
<script type="text/javascript" src="/TServer/resources/js/jquery.toastmessage.js"></script>
<script type="text/javascript">
    //根据本地化需要加载 js 文件
    var npgisLocal = "${myLocale}";
    document.write("<script type='text/javascript' src='/TServer/js/outdoorPanoUpload_" + npgisLocal + ".js'><\/script>");
</script>
</html>