<%@ page language="java" contentType="text/html; charset=utf-8"
    pageEncoding="utf-8"%>
<%@taglib prefix="spring" uri="http://www.springframework.org/tags" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<title><spring:message code="bufferService.bt" /></title>
<link rel="stylesheet" type="text/css"
    href="/TServer/resources/css/main.css" />
    <style type="text/css">
    .mapContainer{
        height:600px;
        margin-top:10px;
        margin-left:20px;
    }
    #mapId{
        position: absolute;
        width: 97%;     
        height: 550px;      
    }
    .optionContainer{   
        margin-left:10px;       
    }
    
    li {
       line-height:150%;
    }
    </style>
</head>
<body>
    <div class='mainform'>
        <span style="FONT-WEIGHT: bold"> TServerDirectory</span>
        <div class='top'>
            <b><a href='/TServer/arcgis/services'>Home</a> > <a href=""><spring:message code="bufferService.bt" /></a></b>
        </div>
        <div class ="optionContainer">
            <ul>
                <li><b><spring:message code="bufferService.fwdz" />：</b>netposa/gis/buffer?distance={distance}&geometry={geom}</li>
                <li><b><spring:message code="bufferService.cssm" />：</b>distance: <i><spring:message code="bufferService.hcqfw" /> double</i></li>
                <li><span style = "visibility:hidden;"><spring:message code="bufferService.cssm" />:</span> geometry: <i><spring:message code="bufferService.gssm" /></i></li>
                <li><b>Demo：</b><a target="_blank"
                    href=/TServer/gis/buffer?distance=0.0035997452656766527&geometry=LINESTRING(121.483206679%2031.275096754271,121.39321304735809%2031.185103122629084,121.57320031064192%2031.185103122629084,121.483206679%2031.275096754271)>demo</a></li>
            </ul>
        </div>
        <div class ="optionContainer">
            <input type="button" value="<spring:message code="bufferService.hzx" />" onclick='draw(3)'>
            <input type="button" value="<spring:message code="bufferService.hzdbx" />" onclick='draw(4)'>
            <input type="button" value="<spring:message code="bufferService.qc" />" onclick='map.clearOverlays()'>
        </div>
        <div class="mapContainer">
            <div id="mapId"></div>
        </div>
    </div>
    <script type="text/javascript" src="/TServer/resources/js/jquery.js"></script>  
    <script type="text/javascript" src="/TServer/resources/map/Init.js"></script>   
    <script type="text/javascript" src="/TServer/resources/js/npMap.js"></script>
    <script type="text/javascript">
    $(function(){
        npMap.createMap(("mapId"),{
            mapType:'tiandiMap',
            callback:function(map) {
                window.drawTool = new NPMapLib.Tools.DrawingTool(map.id);
                npMap.setMap(map);
                window.map = map;
                map.updateSize();
            }
        });
    });
    function draw(mode){
        drawTool.setMode(mode,function(result, geometry){
            map.addOverlay(geometry);
            buffer(geometry);
        });
    }
     var callBackMethod = function(result) {
            var bufferResult = new NPMapLib.Geometry.Polygon(result.rings, {
                color: "blue", //颜色
                fillColor: "yellow", //填充颜色
                weight: 2, //宽度，以像素为单位
                opacity: 1, //透明度，取值范围0 - 1
                fillOpacity: 0.3 //填充的透明度，取值范围0 - 1
            });
            map.addOverlay(bufferResult);
        };
    var buffer = function(geometry) {
        var url = "/TServer/gis/buffer";
        var params = new NPMapLib.Services.bufferParams();
        params.projection = map.getProjection();
        params.distance = 200;
        params.units = "m";
        params.geometry = geometry;
        var service = new NPMapLib.Services.BufferService(map, NPMapLib.MAPTYPE_NPGIS);
        var buffer = service.buffer(url, params, callBackMethod);
    };
    </script>
</body>
</html>