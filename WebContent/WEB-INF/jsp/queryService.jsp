<%@ page language="java" contentType="text/html; charset=utf-8" pageEncoding="utf-8" %>
<%@taglib prefix="spring" uri="http://www.springframework.org/tags" %>
    <!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
    <html>

    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <title><spring:message code="queryServcie.bt" /></title>
        <style>
        .map-id {
            width: 75%;
            height: 98%;
            position: absolute
        }
        .left {
            width: 350px;
            height: 100%;
            margin-left: 10px;
            margin-top: 10px;
            position: absolute;
        }
        .right {
            margin-left: 370px;
            height: 100%;
            float: left;
        }
        .window {
            clear: both;
            border-top-width: 8px;
            border-style: groove;
            height: 60px;
            margin-top: 2px;
        }
        .queryInput {
            width: 100px;
        }
        .labelName {
            width: 350px;
            display: inline-block;
        }
        .pdiv {
            margin-top:10px;
            margin-left:20px;
        }
        </style>
    </head>

    <body>
        <div>
            <div class="left">
                <div class="window" id="道路名称搜索">
                    <span class="labelName"><spring:message code="search.dlss" />：</span>
                    <div class="pdiv">
                        <input data="roadName" class="queryInput" type="input" value="凤环路" />
                        <input type="button" value="<spring:message code="queryServcie.ss" />" />
                    </div>
                    
                </div>
                <div class="window">
                    <span class="labelName"><spring:message code="search.lkss" />：</span>
                    <div class="pdiv">
                        <input data="roadCross" type="input" class="queryInput" value="凤环路|长兴江南" />
                        <input type="button" value="<spring:message code="queryServcie.ss" />">
                    </div>
                </div>
                <div class="window">
                    <span class="labelName"><spring:message code="search.dmdz" />：</span>
                    <div class="pdiv">
                        <input data="poiAddress" type="input" class="queryInput" value="同治村同心">
                        <span style="font-size:10px;"><spring:message code="queryServcie.lx" /></span>
                        <input data="poiAddress" type="input" class="queryInput" value="" />
                        <input type="button" value="<spring:message code="queryServcie.ss" />">
                    </div>
                    
                </div>
                <div class="window">
                    <span class="labelName"><spring:message code="search.ndmdz" />：</span>
                    <div class="pdiv">
                        <input data="poilonlat" type="input" class="queryInput" id="poilonlat" value="121.792795278,31.0003135480001">
                        <input type="button" value="<spring:message code="queryServcie.ss" />" />
                    </div>
                </div>
                <div class="window">
                    <span class="labelName"><spring:message code="search.cxzjdl" />：</span>
                    <div class="pdiv">
                        <input data="nearRoad" type="input" class="queryInput" id="nearRoad" value="121.56854604799,31.138889267909" />
                        <input type="button" value="<spring:message code="queryServcie.ss" />" />
                    </div>
                    
                </div>
                <div class="window">
                    <span class="labelName"><spring:message code="search.xqdfwss" />：</span>
                    <div class="pdiv">
                        <input data="searchInBounds" type="input" class="queryInput" id="searchInBounds" value="村" />
                        <span style="text-align:left;font-size:10px;"><spring:message code="queryServcie.lx" /></span>
                        <input data="searchInBounds" type="input" class="queryInput" value="" />
                        <input type="button" value="<spring:message code="queryServcie.kx" />" />
                    </div>
                </div>
                <div class="window">
                    <span class="labelName"><spring:message code="search.lkfwss" />：</span>
                    <div class="pdiv">
                        <input data="searchRoadCrossInBounds" type="input" class="queryInput" id="searchInBounds" value="路" />
                        <input type="button" value="<spring:message code="queryServcie.kx" />" />
                    </div>
                </div>
                <div class="window">
                    <span class="labelName"><spring:message code="search.dllkxqdss" />：</span>
                    <div class="pdiv">
                        <input data="foi" type="input" class="queryInput" id="searchInBounds" value="凤环" />
                        <input type="button" value="<spring:message code="queryServcie.ss" />" />
                    </div>
                </div>
                
                <div class="window">
                    <span class="labelName"><spring:message code="search.dbxhdljcdss" />：</span>
                    <div class="pdiv">
                        <input data="intersectsInBounds" type="input" class="queryInput" id="intersectsInBounds" style="visibility:hidden;" value="" />
                        <input type="button" value="<spring:message code="queryServcie.kx" />" />
                    </div>
                    
                </div>
                
                <!-- <div class="window" style='height:70px'>
                    <span class="labelName">商圈选择：</span>
                    <div id="bussinessQuery">
                    <select style="width: 70px; margin: 0px 5px;"></select>省 
                    <select style="width: 70px; margin: 0px 5px;"></select>市 
                    <br>
                    <select style="width: 70px; margin: 0px 5px;"></select>区 <select style="width: 70px; margin: 0px 5px;">
                    </select>商圈
                    </div>                   
                </div> -->
                <!-- <div class="window">
                    <span class="labelName">地址查询兴趣点：</span>
                    <input data="poiaddr" type="input" class="queryInput" id="poiaddr" value="新城区长缨东路17号">
                    <input type="button" value="搜索">
                </div> -->
                <div class="window">
                    <span class="labelName"><spring:message code="search.xzqhcx" />：</span>
                    <div class="pdiv">
                        <input data="getRegionalBound" type="input" class="queryInput" id="getRegionalBound" value="610100" />
                        <input type="button" value="<spring:message code="queryServcie.ss" />" />
                    </div>
                </div>
                <div class="window">
                    <span class="labelName"><spring:message code="search.xzqhcx2" />：</span>
                    <div class="pdiv">
                        <input data="getRegionalBoundByName" type="input" class="queryInput" id="getRegionalBoundByName" value="西安市" />
                        <input type="button" value="<spring:message code="queryServcie.ss" />" />
                    </div>
                </div>
                
                <%-- <div class="window">
                    <span class="labelName"><spring:message code="search.xhdljcdss" />：</span>
                    <div class="pdiv">
                        <input data="roadAndLineIntersection" type="input" class="queryInput" id="roadAndLineIntersection" style="visibility:hidden;" value="" />
                        <input type="button" value="<spring:message code="queryServcie.hzx" />" />
                    </div>
                    
                </div> --%>
                
               <div style='text-align:center;margin-top:10px;'>
                <input type="button" value="<spring:message code="queryServcie.qcfgw" />" onclick="map.clearOverlays()">
               </div>
            </div>
            <div class="right">
                <div class="map-id" id="mapId"></div>
            </div>
        </div>
        <script type="text/javascript" src="/TServer/resources/js/jquery.js"></script>
        <script type="text/javascript" src="/TServer/resources/js/npMap.js"></script>
        <script type="text/javascript" src="/TServer/resources/map/Init.js"></script>
        <script type="text/javascript">
        var map = null;
        var mapDrawingTool = null;
        npMap.createMap("mapId", {callback:function(map) {
            map.updateSize();            
            map.addEventListener('click', function(p) {
                $("#poilonlat").val(p.toString());
                $("#nearRoad").val(p.toString());
            })
            mapDrawingTool = new NPMapLib.Tools.DrawingTool(map.id);
            window.map = map;
        },mapType:'tiandiMap'});

        var searchResult = {};
        var currentRequest;
        var routeMap = {
            "roadName": "/TServer/query/getRoadsByName?roadName=",
            "roadCross": "/TServer/query/getRoadCrossByName?roadName=",
            "poiAddress": "/TServer/query/poiname?maxResult=100&keyWord=",
            "poilonlat": "/TServer/query/poicoord?coord=",
            "nearRoad": "/TServer/query/findpointline?coord=",
            "searchInBounds": "/TServer/query/searchInBounds?",
            "searchRoadCrossInBounds": "/TServer/query/searchRoadCrossInBounds?",
            "foi": "/TServer/query/getFOIByName?keyWordString=",
            "intersectsInBounds": "/TServer/query/roadInterByGeo?geoWkt=",
            "poiaddr": "/TServer/query/poiaddr?keyWord=",
            "getRegionalBound": "/TServer/query/getRegionalBound?addvcd=",
            "getRegionalBoundByName": "/TServer/query/getRegionalBoundByName?name=",
            "roadAndLineIntersection": "/TServer/query/roadAndLineIntersection"
        };
        $(function() {
            $(".window input[type='button']").click(function() {
                var that = $(this).prev();
                //query($(that).attr("data"), $(that).val());
                query($(that).attr("data"), that);
            });
            /* var provice = $("#bussinessQuery select").eq(0),
            city = $("#bussinessQuery select").eq(1),
            distinct = $("#bussinessQuery select").eq(2),
            bussiness = $("#bussinessQuery select").eq(3);
            f('1',0,provice);     
            provice.change(function(){
                city.children().remove();
                bussiness.children().remove();
                distinct.children().remove();
                var x = parseFloat(this.options[this.selectedIndex].x);
                var y = parseFloat(this.options[this.selectedIndex].y);                 
                var v = $(this).val();
                getBoundary(v);
                 if (v == 131 || v == 289 || v == 332 || v == 132) {
                     var u = "";
                     switch (v) {
                         case "131":
                             u = "北京市";
                             break;
                         case "289":
                             u = "上海市";
                             break;
                         case "332":
                             u = "天津市";
                             break;
                         case "132":
                             u = "重庆市";
                             break
                     }
                     var t = document.createDocumentFragment();
                     var w;
                     w = document.createElement("option");
                     w.innerHTML = u;
                     w.value = v;
                     w.title = u;
                     t.appendChild(w);                    
                     city.append($(t));
                     f($(this).val(),0,distinct);
                     map.setCenter({lon:x,lat:y},9);  
                 }else{
                     f($(this).val(),0,city);
                     map.setCenter({lon:x,lat:y},7);  
                 }              
            });
            city.change(function(){
                distinct.children().remove();
                bussiness.children().remove();
                var x = parseFloat(this.options[this.selectedIndex].x);
                var y = parseFloat(this.options[this.selectedIndex].y);
                map.setCenter({lon:x,lat:y},9);
                getBoundary($(this).val());
                f($(this).val(),0,distinct);
            });
            distinct.change(function(){
                bussiness.children().remove();              
                var x = parseFloat(this.options[this.selectedIndex].x);
                var y = parseFloat(this.options[this.selectedIndex].y);
                map.setCenter({lon:x,lat:y},11);       
                getBoundary($(this).val());
                f($(this).val(),1,bussiness);
            });
            bussiness.change(function(){
                var polygons = GeoJSON.read(this.options[this.selectedIndex].geo);
                map.clearOverlays();
                map.addOverlay(polygons);
                 if(this.options[this.selectedIndex].description){
                     var that = this;
                     polygons[0].addEventListener('click',function(f){
                         var info = new NPMapLib.Symbols.InfoWindow(polygons[0].getCentroid(),"",that.options[that.selectedIndex].description);
                         info.autoSize = true;
                         map.addOverlay(info);
                         info.open();
                     });
                 }
                polygons.length > 0 && map.setCenter(polygons[0].getCentroid(),13);
            }); */
        });
        var getBoundary = function(areaCode){
            $.getJSON('/TServer/query/shangquan/getBoundary?areacode=' + areaCode.trim(),function(msg){
                D = msg.data;
                if(D && D.length >0){
                    var c = D[0].geo;
                    var polygons = GeoJSON.read(c);
                    map.clearOverlays();
                    map.addOverlay(polygons);
                    polygons.flash();                    
                }
                
            });
        }
        /* var f = function(areacode,business_flag,container){
            $.getJSON('/TServer/query/shangquan/forward?areacode=' + areacode.trim()+'&business_flag='+business_flag,function(msg){
             D = msg.data;
                D.splice(0, 0, {
                    area_name: "请选择",
                    area_code: ""
                });
                var B = document.createDocumentFragment();
                var t;
                var x = {
                    131: 1,
                    289: 2,
                    332: 3,
                    132: 4
                };
                for (var w = 0; w < D.length; w++) {
                    D[w].sort = D[w].area_code ? x[D[w].area_code] || 5 : 0
                }
                D.sort(function(G, F) {
                    return G.sort - F.sort
                });
                for (var w = 0; w < D.length; w++) {
                    t = document.createElement("option");
                    t.innerHTML = D[w].area_name;
                    t.area_type = D[w].area_type;
                    t.geo = D[w].geo || D[w].geom;
                    t.x = D[w].x;
                    t.y = D[w].y;
                    if (D[w].business_geo) {
                        t.business_geo = D[w].business_geo;
                    }
                    if (D[w].description) {
                        t.description = D[w].description;
                    }
                    t.value = D[w].area_code;
                    t.title = D[w].area_name;
                    B.appendChild(t)
                }
                container.append($(B));
         });       
        } */
        
        // 线和道路交叉点搜索
        function roadAndLineIntersection(dataType, that) {
        	mapDrawingTool.setMode('3', function(result, gemo) {
        		map.clearOverlays();
        		
        		gemo.setStyle({
                    "color": 'red'
                });
                map.addOverlay(gemo);
                
                var q =  $.map(gemo.getPath(),function(p){
                    return p.lon + " " + p.lat;
                }).join(",");
                
               var postData = {
                    "wkt":'LINESTRING((' + q + '))'
                };
                
                $.post(routeMap[dataType],postData,function(result){
                    if (result.isSucess && result.data) {
                        for (var i = 0; i < result.data.length; i++) {
                            var geometry = eval("(" + result.data[i].geometry + ")").coordinates;
                            crateMark(
                                new NPMapLib.Geometry.Point(
                                    geometry[0],
                                    geometry[1]),
                                result.data[i]);
                        }
                    }
                 },"json");
                 
                 
                 //var wkt = 'LINESTRING((' + q + '))';
                 //var wkt = 'LINESTRING(108.92754733141504 34.24877217994572, 108.92767856607787 34.2487725318544, 108.9278683331545 34.2487761601349, 108.92808783014934 34.24877919592517, 108.92915644683025 34.24877574234845, 108.92976251187923 34.24877570716171, 108.93008454170462 34.24877550584473, 108.9305448315378 34.24877566436194, 108.9313395889971 34.24877640641915, 108.9313395889971 34.24877640641915, 108.93136586564641 34.24949886856024, 108.93138078755833 34.250008089666956, 108.93139288849926 34.25086163184227, 108.93140609092127 34.25166325167388, 108.9314132136981 34.25239878574882, 108.93141410281248 34.25250596280835, 108.93141410281248 34.25250596280835, 108.93441865526486 34.2525311772095, 108.93448408368295 34.25253162887832, 108.93460346999787 34.2525330905081, 108.93630113331658 34.25254909864962, 108.93646598858037 34.25250910869988, 108.9369286242171 34.25250997140628, 108.9382626196818 34.25251870325466, 108.93864324780668 34.252510235996155, 108.93875184120007 34.25250199113515, 108.93876899282184 34.252499460792244, 108.938920564739 34.25247641240998, 108.93906765101941 34.25242032419107, 108.93914014778287 34.25237965658607, 108.93926619538982 34.2522897390668, 108.93937259779088 34.252208184032845, 108.93951719342968 34.2520860134357, 108.93971583759101 34.251902385143936, 108.93987698513516 34.25175547120847, 108.9400061198206 34.251660546157595, 108.94012159093509 34.25159480483697, 108.94023456699085 34.25154960974232, 108.94040158575376 34.25149792455822, 108.9406346099479 34.25145277048005, 108.94090432269832 34.25142338816234, 108.9416571023813 34.25140416710773, 108.94255332478184 34.25138103341523, 108.94293278062729 34.251363339059544, 108.94336506913258 34.25134360432079, 108.94373334454568 34.25133424776536, 108.94385247914128 34.25133484701259, 108.94399922731797 34.25134593572925, 108.94414178671289 34.25136590872258, 108.94429222005694 34.251395871058534, 108.94443946149758 34.25143527542596, 108.94456297470416 34.25148528347989, 108.94466624952769 34.2515422697884, 108.94479753510149 34.251619200406466, 108.94492273791785 34.251707798402975, 108.94505122775513 34.251821099460365, 108.94513974397023 34.2519089324827, 108.94548503611617 34.25222115506455, 108.94548503611617 34.25222115506455, 108.94561133138221 34.25231335619458, 108.94571181007905 34.25237201370102, 108.94581647617933 34.25241760714432, 108.94592313599412 34.252457088381526, 108.94605302214727 34.25249180225671, 108.94618639762464 34.252512623566545, 108.94633342974842 34.252523149399615, 108.94650986827457 34.25252082718085, 108.94715331053358 34.25249641654132, 108.94725667485028 34.25253479017789, 108.94824367893989 34.25250349862337, 108.94928027530695 34.25250400100434, 108.94928027530695 34.25250400100434, 108.94928938428748 34.25324869149264, 108.94929463096828 34.25368850871425, 108.94929709694668 34.254004770052035, 108.94933137758056 34.25407827543556, 108.94933137758056 34.25407827543556, 108.94933327563224 34.25524781463243, 108.9493326537476 34.25554048152666, 108.94933142338625 34.2571837297762, 108.94931116027259 34.2575519598752, 108.94931116027259 34.2575519598752, 108.94990169691556 34.25759367890043, 108.95147669658772 34.2576309407016, 108.95173362225061 34.25763923829594, 108.95234901727386 34.257659470405535, 108.9526473890698 34.257696263037275, 108.95341861361281 34.25781080368907, 108.95341861361281 34.25781080368907, 108.95479268823541 34.2580344042143, 108.95524249312813 34.25810662532249, 108.95524249312813 34.25810662532249, 108.95512038445493 34.258604223023355, 108.95499249337175 34.259129602909766, 108.95498252481852 34.25917543873148, 108.9549811284283 34.25919154571831, 108.95498252263823 34.25920209820025, 108.95498610906077 34.259213195203266, 108.95498999463138 34.259221792475486, 108.95499467738571 34.259230387833654, 108.95500075548375 34.25923565115725, 108.95500872689217 34.25924090993428, 108.95501849209792 34.25924449506214, 108.95503064882699 34.25924835433333, 108.95504699076028 34.25925220354745, 108.95530497451185 34.259291567044706, 108.95544637131829 34.25931259753383, 108.9554782573614 34.25932196680248, 108.95550147403985 34.25933273644035, 108.95559503707314 34.259388048303336, 108.95564984009995 34.25941373548932, 108.9557286578426 34.259435755834254, 108.9559260512454 34.25947499127466, 108.9559260512454 34.25947499127466, 108.9559080095478 34.25954861598413, 108.95588009976026 34.25966196892262, 108.9558402310134 34.25979423336678, 108.95582886194957 34.2599108847738, 108.95581718688109 34.26011388269731, 108.9558331533116 34.261047643517536, 108.95583434673345 34.26107595937332, 108.9558356376866 34.26113010472988, 108.9558356376866 34.26113010472988, 108.95583682890397 34.261185359884344, 108.95584864458881 34.261699296847205, 108.95584690659209 34.26223741679101, 108.95583744447153 34.26340447398046, 108.95585827083703 34.26583233976669, 108.95585886207019 34.26591341570754)';
                 //buffer(wkt);
                
        	});
        }
        
        /* function buffer(geometry) {

            var postData = {
            		'distance':'1',
                    'geometry':geometry
                };
            
        	$.post("/TServer/gis/buffer",postData,function(result) {
        		console.log(result);
        		debugger;
                
             },"json");
        } */
        
        
        //function searchBounds(dataType, value) {
        function searchBounds(dataType, that) {
            mapDrawingTool.setMode(NPMapLib.DRAW_MODE_RECT, function(extent, gemo) {
                map.clearOverlays();
                gemo.setStyle({
                    "fillOpacity": 0.1
                });
                map.addOverlay(gemo);                
             
                var q =  $.map(gemo.getPath(),function(p){
                            return p.lon + " " + p.lat
                        }).join(","); 
                
                // poi 添加类型查询条件后添加
                var postData = {};
                if('searchInBounds' === dataType){
                    postData = {
                            "wkt":'POLYGON((' + q + '))',
                            "key":$(that).prev().prev().val(),
                            "poiType":$(that).val()
                        }
                }else if('searchRoadCrossInBounds' === dataType){
                    postData = {
                            "wkt":'POLYGON((' + q + '))',
                            "key":$(that).val()
                        }
                }else{
                    postData = {
                            "wkt":'POLYGON((' + q + '))'
                        }
                }
                // end
                
                $.post(routeMap[dataType],postData/* {
                    "wkt":'POLYGON((' + q + '))',
                    "key":$(that).val()
                } */,function(result){
                     if (result.isSucess && result.data) {
                         for (var i = 0; i < result.data.length; i++) {
                             var geometry = eval("(" + result.data[i].geometry + ")").coordinates;
                             crateMark(
                                 new NPMapLib.Geometry.Point(
                                     geometry[0],
                                     geometry[1]),
                                 result.data[i]);
                         }
                     }
                },"json");
            });
        };

        //function query(dataType, value) {
        function query(dataType, that) {
            var value = $(that).val();
            if (dataType.indexOf('InBounds') > 0) { // 框选查询
                //searchBounds(dataType, value);
                searchBounds(dataType, that);
                return;
            }
            
            if(dataType === 'roadAndLineIntersection') {
            	roadAndLineIntersection(dataType, that);
            	return;
            }
            
            if('poiAddress' === dataType){
                var name = $(that).prev().prev().val();
                var type = $(that).val();
                value = encodeURIComponent(name)+"\&poiType="+type;
            }else{
                value = encodeURIComponent(value);
            }

            $.getJSON(routeMap[dataType] + value +  "&random=" + Math.random(),
                function(result) {
                    map.clearOverlays();
                    switch (dataType) {
                        case "roadName":
                            if (result.length > 0) {
                                for (var i = 0; i < result.length; i++) {
                                    map.addOverlays(GeoJSON.read(result[i].feature));
                                }
                            }
                            break;
                        case "foi":
                            if (result.length > 0) {
                                for (var i = 0; i < result.length; i++) {
                                    var type = result[i].type;

                                    if(type === 'poi'){
                                        var value = result[i];
                                        var geometry = eval("(" + value.wkt + ")").coordinates;
                                        crateMark(
                                                new NPMapLib.Geometry.Point(
                                                    geometry[0],
                                                    geometry[1]), value);
                                    }else if(type === 'road'){
                                        map.addOverlays(GeoJSON.read(result[i].feature));
                                    }else{
                                        var value = result[i];
                                        var geometry = eval("(" + value.wkt + ")").coordinates;
                                        crateMark(
                                            new NPMapLib.Geometry.Point(
                                                    geometry[0],
                                                    geometry[1]), value);
                                    }
                                }
                            }
                            break;
                        case "roadCross":
                            if (result.length > 0) {
                                for (var i = 0; i < result.length; i++) {
                                    var value = result[i];
                                    crateMark(
                                        new NPMapLib.Geometry.Point(
                                            value.lon,
                                            value.lat), value);
                                }
                            }
                            break;
                        case "poiAddress":
                            if (result.features) {
                                for (var i = 0; i < result.features.length; i++) {
                                    var value = result.features[i];
                                    var geometry = eval("(" + value.geometry + ")").coordinates;
                                    crateMark(
                                        new NPMapLib.Geometry.Point(
                                            geometry[0],
                                            geometry[1]), value);
                                }
                            }
                            break;
                        case "poilonlat":
                            alert(result.name + "," + result.address);
                            break;
                        case "nearRoad":
                            map.addOverlays(GeoJSON.read(result.geometry));
                            break;
                        case "poiaddr":
                            if (result.features) {
                                for (var i = 0; i < result.features.length; i++) {
                                    var value = result.features[i];
                                    var geometry = eval("(" + value.geometry + ")").coordinates;
                                    crateMark(
                                        new NPMapLib.Geometry.Point(
                                            geometry[0],
                                            geometry[1]), value);
                                }
                            }
                            break;
                        case "getRegionalBound":
                        	hightlightRegional(result);
                            break;
                        case "getRegionalBoundByName":              
                            hightlightRegional(result);
                            break;
                    }
                })
        }
        
        
        function hightlightRegional(result) {
        	if(!$.isEmptyObject(result)) {
        		regionalParse(result);
        		
        		var districts = result.districts;
        		if (typeof(districts) !== 'undefined') { 
        			hightlightSubRegional(districts);
        		}
        	}
        }
        
        
        function hightlightSubRegional(districts) {
        	var ci = districts.length;
        	for(var i = 0; i < ci ; i++) {
        		regionalParse(districts[i]);
        	}
        }
        
        function regionalParse(result) {
        	var type = result.geometry.type;
    		var coordinates = result.geometry.coordinates;
    		if('Polygon' === type) {
    			polygonParse(coordinates);
    		}
    		
    		if('MultiPolygon' === type) {
    			multiPolygonParse(coordinates);
    		}
        }
        
		function polygonParse(coordinates) {
			var csLength = coordinates.length;
			for(var i = 0; i < csLength; i++){
   				var coordinate = coordinates[i];
   				var cLength = coordinate.length;
   				var points = [];
   				for(var j = 0; j < cLength; j++){
   					var arr = coordinate[j];
   					points.push(new NPMapLib.Geometry.Point(arr[0], arr[1]));
       				addRegionalToMap(points);
   				}
   				
   			}
        }
        
        function multiPolygonParse(coordinates) {
        	var csLength = coordinates.length;
        	for(var i = 0; i < csLength; i++){
   				var coordinate = coordinates[i];
   				var cLength = coordinate.length;
   				
   				for(var j = 0; j < cLength; j++){
   					var arr = coordinate[j];
           			var sLenth = arr.length;
           			var points = [];
           			for(var k = 0; k < sLenth; k++) {
           				var sArr = arr[k];
           				points.push(new NPMapLib.Geometry.Point(sArr[0], sArr[1]));
           			}
               	
       				addRegionalToMap(points);
   				}
   				
   			}
        }
        
        function addRegionalToMap(points) {
        	var polygon = new NPMapLib.Geometry.Polygon(points, {
                color: "blue", //颜色
                fillColor: "red", //填充颜色
                weight: 2, //宽度，以像素为单位
                opacity: 1, //透明度，取值范围0 - 1
                fillOpacity: 0.1 //填充的透明度，取值范围0 - 1
            });
        	
        	map.addOverlay(polygon);
        }
        
       
        var currentPopu;

        function crateMark(pt, clientData) {
            var size = new NPMapLib.Geometry.Size(32, 32);
            var icon = new NPMapLib.Symbols.Icon(
                "/TServer/resources/img/RedPin1LargeB.png", size);
            icon.setAnchor(new NPMapLib.Geometry.Size(-size.width / 2, -size.height / 2));
            marker = new NPMapLib.Symbols.Marker(pt);
            marker.setIcon(icon);
            marker.setTitle(clientData.name);
            marker.setData(clientData);
            map.addOverlay(marker);
            marker.addEventListener('click', function(f) {
                alert(f.getData().name);
            })
        }
        </script>
    </body>

    </html>
