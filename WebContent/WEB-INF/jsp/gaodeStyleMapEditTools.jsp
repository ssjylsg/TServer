<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%@taglib prefix="spring" uri="http://www.springframework.org/tags" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">

	<link rel='stylesheet' href='/TServer/resources/styleMap/css/spectrum.css' />
    <link rel="stylesheet" type="text/css" href="/TServer/resources/styleMap/css/zTreeStyle/zTreeStyle.css">
    <link href="/TServer/resources/css/bootstrap.css" rel="stylesheet">
    <link href="/TServer/resources/styleMap/css/introjs.css" rel="stylesheet">
    <link href="/TServer/resources/styleMap/css/style.css" rel="stylesheet">
    
      
   <script type="text/javascript" src="/TServer/resources/map/Init.js"></script>
    <%--<script type="text/javascript" src="http://localhost:1081/v1.0/Init.js"></script>--%>
	<script type="text/javascript" src="/TServer/resources/js/jquery.js"></script> 
	
	<title><spring:message code="styleMapEditTools.bt" /></title>
</head>

<body>
	<div id="mapId"></div>
    
    <div class="control" id="selectors">
      <div class="control-body">
      <div class="selectors-top">


        <button type="button" id="addStyle" title="<spring:message code="styleMapEditTools.tjxdysgz" />"  class="btn btn-default" >
                <span class="glyphicon glyphicon-plus"></span><spring:message code="styleMapEditTools.tjysgz" />
        </button>

        <button type="button" id="templateList" class="btn btn-default">
                <span class="glyphicon glyphicon-list"></span><spring:message code="styleMapEditTools.gxhmb" />
        </button>
        
        <div id="loading"><b></b>正在应用新样式, 耗时<span id="loading-time"></span>ms..</div>
        
        <button type="button" id="toggleSelectors" class="btn btn-default pull-right"><i class="glyphicon glyphicon-chevron-down  glyphicon-chevron-up"></i></button>


        <button id="jsonButton" type="button" class="btn btn-default pull-right"><span class="glyphicon glyphicon-cog"></span><spring:message code="styleMapEditTools.ckjson" /></button>

      </div>
      
    <div id="selectors-bd" class="clearfix">
      <div class="selector-item" id="style-rules" data-step="1" data-intro="样式规则指地图元素及其显示样式的组合，每次修改元素需要重新添加规则">

      </div>
      <div class="selector-item" id="elementType-box" data-step="2" data-intro="选择需要修改的地图元素，如地铁、poi等">
        <fieldset>
            <legend><spring:message code="styleMapEditTools.ys" /></legend>
            <div class="elementType-tree-box">
             <ul id="catalogTree"  class="ztree"></ul>
             <div id="catalogTree-info" style="display:none">
                <p id="catalogTree-info-desc"></p>
                <img src="" id="catalogTree-info-img">
             </div>
            </div>
        </fieldset>
      </div>
      <div class="selector-item" id="elementType" data-step="3" data-intro=" 选择要修改的元素属性，如修改地铁的几何填充项">
        <fieldset>
            <legend><spring:message code="styleMapEditTools.sx" /></legend>
        <div class="elementType-bd">
          <div id="all-bd" class="element-type-item">
           <label for="all" style="width:100%"><input checked="checked" type="radio" id="all" value="all" name="elementType"/><spring:message code="styleMapEditTools.qb" /><span class="elementType-note"><spring:message code="styleMapEditTools.qbsm" /></span></label>
           </div>
           <div id="geometry-bd" class="element-type-item">
             <p class="elementType-title"><spring:message code="styleMapEditTools.jh" /><span class="elementType-note"><spring:message code="styleMapEditTools.jhsm" /></span></p>
            <label for="geometry"><input type="radio" id="geometry" value="geometry" name="elementType"/><spring:message code="styleMapEditTools.qb" /></label>
            <label for="geometry.fill"><input checked="checked" type="radio" id="geometry.fill" value="geometry.fill" name="elementType"/><spring:message code="styleMapEditTools.tc" /></label>
            <label for="geometry.stroke"><input type="radio" id="geometry.stroke" value="geometry.stroke" name="elementType"/><spring:message code="styleMapEditTools.bk" /></label>
          </div>
          <p class="dashline"></p>
          <div id="label-bd"  class="element-type-item">
            <p class="elementType-title"><spring:message code="styleMapEditTools.wb" /><span class="elementType-note"><spring:message code="styleMapEditTools.wbsm" /></span></p>
             <label for="labels"><input type="radio" id="labels" value="labels" name="elementType"/><spring:message code="styleMapEditTools.qb" /></label>
            <label for="labels.text"><input type="radio" id="labels.text" value="labels.text.fill" name="elementType"/><spring:message code="styleMapEditTools.tc" /></label>
            <label for="labels.text"><input type="radio" id="labels.text" value="labels.text.stroke" name="elementType"/><spring:message code="styleMapEditTools.bk" /></label>
            <!-- <label for="labels.icon"><input type="radio" id="labels.icon" value="labels.icon" name="elementType"/>图标</label> -->
          </div>
        </div>
      </fieldset>
      </div>
      <div class="selector-item" id="elementStyle" data-step="4" data-intro="设置元素的修改样式，如设置地铁几何填充色为蓝色。">
        <fieldset>
            <legend><spring:message code="styleMapEditTools.yangshi" /></legend>      

            <div class="style-item" id="elementStyleColor">
              <label class="style-item-color" title="<spring:message code="styleMapEditTools.yansesm" />"> <input type="checkbox" id="set_color"><span><spring:message code="styleMapEditTools.yanse" /></span><input id="color"></label>
              <label title="通过设置色相值的叠加,可以轻松实现整体颜色的改变,同时保留原样式的层次感"  style="visibility: hidden;"> <input type="checkbox" id="set_hue"><span>色相</span> <input id="hue"></label>
            </div>

            <div class="style-item" style="display: none;">
              <label title="设置元素的亮度值,最大值为100,最小值-100.">
               <input type="checkbox" id="set_lightness"><span>亮度</span> 
                <input class="slider" type="range" disabled="true"  id="lightnessSlider" min="-100" max="100" value="1">
               <input type="text" size="4" disabled="true" id="lightness" class="form-control input-sm" value="1">
              </label>
            </div>
             <div class="style-item" style="display: none;">
              <label title="设置元素的饱和度,最大值为100,最小值-100.">
               <input type="checkbox" id="set_saturation"><span>饱和度</span> 
               <input class="slider" type="range" disabled="true"  id="saturationSlider" min="-100" max="100" value="1">
               <input type="text" size="4" disabled="true" id="saturation" class="form-control input-sm" value="1">
              </label>
            </div>

            <div class="style-item" style="display: none;">
              <label title="设置元素的宽度,可以直接调整道路的粗细显示.">
               <input type="checkbox" id="set_weight"><span>宽度</span> 
                <input class="slider" type="range" disabled="true"  id="weightSlider" min="0.1" step="0.1" max="8" value="1"/>
                <input type="text" size="4" disabled="true" id="weight" class="form-control input-sm" value="1.0"/>
              </label>
            </div>
          <div class="style-item">
              <label  title="<spring:message code="styleMapEditTools.xssm" />"  id="visibilityDiv"> 
                <input type="checkbox" id="set_visibility"><span><spring:message code="styleMapEditTools.xs" /></span><input type="checkbox" disabled="true" checked="checked" id="visibilityCheckBox">
            </div>

      <div class="selector">

      </div>
    </fieldset>
       </div>
         
    </div>
    </div>
</div>

<!-- Modal -->
<div class="modal fade customlist" id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
        <h4 class="modal-title" id="myModalLabel"><spring:message code="styleMapEditTools.gxhztlb" /></h4>
      </div>
      <div class="modal-body" id="maplist-container">
      </div>
    </div><!-- /.modal-content -->
  </div><!-- /.modal-dialog -->
</div><!-- /.modal -->


<div class="modal fade " id="json">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
        <h4 class="modal-title"><spring:message code="styleMapEditTools.ysjson" /></h4>
      </div>
      <div class="modal-body"  style="margin-bottom:0;padding-bottom:0">
          <textarea id="jsonTextarea"></textarea>
<pre style="margin-top:15px;">
<strong><spring:message code="styleMapEditTools.syff" /></strong> 
map.setMapStyle({
  styleJson:[[<spring:message code="styleMapEditTools.smdjsondx" />]]
});</pre>
      </div>
      <div class="modal-footer">
        <!-- <button type="button" class="btn btn-default" data-dismiss="modal">复制</button> -->
        <button type="button"  data-dismiss="modal" onclick="StyleEditor.setMapJson()" class="btn btn-primary"><spring:message code="styleMapEditTools.xghbgx" /></button>
      </div>
    </div><!-- /.modal-content -->
  </div><!-- /.modal-dialog -->
</div><!-- /.modal -->


<div class="modal fade" id="mobileAlert">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
        <h4 class="modal-title"><spring:message code="styleMapEditTools.ts" /></h4>
      </div>
      <div class="modal-body">
        <p><spring:message code="styleMapEditTools.tsnr" /></p>
      </div>
    </div><!-- /.modal-content -->
  </div><!-- /.modal-dialog -->
</div><!-- /.modal -->


<script src="/TServer/resources/js/bootstrap.min.js"></script>
<script type="text/javascript">
function isMobile() {
  var isMobile = {
    Android: function() {
      return navigator.userAgent.match(/Android/i) ? true : false;
    },
    BlackBerry: function() {
      return navigator.userAgent.match(/BlackBerry/i) ? true : false;
    },
    iOS: function() {
      return navigator.userAgent.match(/iPhone|iPad|iPod/i) ? true : false;
    },
    Windows: function() {
      return navigator.userAgent.match(/IEMobile/i) ? true : false;
    },
    any: function() {
      return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Windows());
    }
  };
  if (isMobile.any()) {
    return true;
  }
  return false;
}

if(isMobile()){
    // document.write('<h1>百度个性化地图编辑器,暂不支持移动端, 你可以在PC上访问</h1>');
    $("#mobileAlert").modal('show');
    // return;
}

var isSupportCanvas = false;
try {
    document.createElement('canvas').getContext('2d');
    isSupportCanvas = true;
} catch(e) {
    isSupportCanvas = false;
}
if(!isSupportCanvas){
   alert("个性地图编辑器：推荐使用百度浏览器、chrome、firefox、safari、IE10"); 
}

</script>

<script type="text/javascript">
//根据本地化需要加载 js 文件
var npgisLocal = "${myLocale}";

//gaode 高德地图，baidu 百度地图
var myMapType = "${myMapType}";

var url = '/TServer/NPGIS/services/${serviceName}/MapServer';
var mapContainer = document.getElementById('mapId');
var map;

$(function() {
    requestLayerInfo();
});

// 渲染方式选择
function renderSelect() {
    var bodyElement = $("#mapId").parent();
    var divElement = document.createElement('div');
    divElement.id = 'mapSelect';
    divElement.style.position = 'absolute';
    divElement.style.float = 'right';
    divElement.style.right = bodyElement[0].style.position === '' ? '30px': (bodyElement.width() - $('#mapId').width() + 30) +  'px';
    divElement.style.zIndex = 999;
    divElement.style.marginTop = '15px';
    divElement.style.top = bodyElement.offset().top;
    
    var selectElement = document.createElement('select');
    if('zh_CN' === npgisLocal) {
        $(selectElement).append('<option value="server">服务端渲染</option>');
        $(selectElement).append('<option value="client">客户端渲染</option>');
    } else if('en_US' === npgisLocal) {
        $(selectElement).append('<option value="server">Server rendering</option>');
        $(selectElement).append('<option value="client">Browser rendering</option>');
    }
    
    
    divElement.appendChild(selectElement);
    
    bodyElement.append(divElement);
    
    
    $(selectElement).change(function() {
        createMap($(this).val());
    });
}

// 请求图层信息
function requestLayerInfo() {
    $.getJSON(url + "?f=json", function(layerInfo) {
        createMap('server');

        var layerType = "${info.layerType}";

        // 高德矢量添加渲染方式选择
        if (layerType === 'gaodeVector') {
            renderSelect();
        }
    });
}
function createMap1(){
	mapConfig = {
	     "mapOpts": {
	         "minZoom": 5,
	         "defaultZoom": 10,
	         "maxZoom": 22,
	         "projection": "EPSG:900913",
	         "centerPoint": [108.93500029853632,34.27412427271407],
	         "displayProjection": "EPSG:4326"
	     },
	     "vectorLayer": [{
	         "layerName": "shanghaiBaseMap1",
	         "layerType": "NPMapLib.Layers.GaoDeLayer",
	         "layerOpt": {
	             "url": ["http://webrd01.is.autonavi.com/appmaptile??lang=zh_cn&size=1&scale=1&style=7", "http://webrd02.is.autonavi.com/appmaptile??lang=zh_cn&size=1&scale=1&style=7", "http://webrd03.is.autonavi.com/appmaptile??lang=zh_cn&size=1&scale=1&style=7", "http://webrd04.is.autonavi.com/appmaptile??lang=zh_cn&size=1&scale=1&style=7"],

	             "isBaseLayer": true,
	             "isVectorLayer": true
	         }
	     }],
	     "sattilateLayer": []
	 }
	  map = window.map = new NPMapLib.Map(mapContainer, mapConfig.mapOpts);

	        /** ****基础图层***** */
	        var baseLayer = [],
	            vectorLayerItem, sattilateLayerItem, baseLayerItem, vectorBaseLayer = [],
	            sattilateBaseLayer = [],
	            layerType;
	        for (var i = 0, len = mapConfig.vectorLayer.length; i < len; i++) {
	            vectorLayerItem = mapConfig.vectorLayer[i];
	            layerType = vectorLayerItem.layerType
	                .split('.');
	            baseLayerItem = new NPMapLib.Layers[layerType[layerType.length - 1]](
	                vectorLayerItem.layerOpt.url,
	                vectorLayerItem.layerName,
	                vectorLayerItem.layerOpt);            
	            vectorBaseLayer.push(baseLayerItem);
	            baseLayer.push(baseLayerItem);
	        }
	        map.addLayers(baseLayer);
}
function createMap(render) {
	if (map) {
        map.destroyMap();
        map = null;
    }
	//return createMap1();
    var center = "${info.centerPoint}";
    var extent = "${info.fullExtent}";
    var restrictedExtent = "${info.restrictedExtent}".replace('[','').replace(']','').split(',');
    var minZoom = "${info.minZoom}";
    var maxZoom = parseInt("${info.maxZoom}");
    var projection = "EPSG:" + "${info.projection}";
    var type = "${info.type}";
    var layerType = "${info.layerType}";
    var zoomLevelSequence = "${info.zoomLevelSequence}";
    var defaultZoom = "${info.defaultZoom}";

    var layerInfo = {
        "centerPoint" : center,
        "defaultZoom" : defaultZoom,
        "fullExtent" : extent,
        "layerType" : layerType,
        "maxZoom" : maxZoom,
        "minZoom" : minZoom,
        "projection" : projection,
        "restrictedExtent" : restrictedExtent,
        "type" : type,
        "zoomLevelSequence" : zoomLevelSequence
    };

    map = new NPMapLib.Map(mapContainer, {
        minZoom : minZoom,
        defaultZoom : minZoom,
        maxZoom : maxZoom,
        projection : projection,
        restrictedExtent : restrictedExtent
    });
    
    window.map = map;

    var layers;
    var baseLayer;
    var labelLayer;
    
    if ('gaodeVector' === layerType) {
        // 矢量切片
        if ('client' === render) {
            // 客户端渲染  
            var opt = {
                labelUrl : [ url + '/getGaodeMapLabel' ],
                "isBaseLayer" : true,
                "isVectorTile" : false,
                "isVectorLayer" : true,
                "layerInfo" : layerInfo,
                "numZoomLevels" : 23
            };
            baseLayer = new NPMapLib.Layers.GaoDeLayer([ url
                    + '/getGaodeMapRegion' ], '${serviceName}', opt);
            layers = new Array(baseLayer);
        } else {
            // 服务端渲染
            baseLayer = new NPMapLib.Layers.GaoDeLayer([ url
                    + "/getGaodeVectorTile" ], '${serviceName}', {
                "isBaseLayer" : true,
                "numZoomLevels" : 23,
                "imgCache" : false
            });

            labelLayer = new NPMapLib.Layers.GaoDeLayer(
                    undefined,
                    '${serviceName}'+'label',
                    {
                        "labelUrl" : [ url + "/getGaodeVectorTileLabel" ],
                        "isBaseLayer" : false,
                        "isVectorTile" : false,
                        "isVectorLayer" : true,
                        "layerInfo" : layerInfo
                    });

            layers = new Array(baseLayer, labelLayer);
        }
    } else {
        // 百度矢量切片
        baseLayer = new NPMapLib.Layers.BaiduTileLayer(
                url + "/getVectorTile?x=\${x}&y=\${y}&l=\${z}&scale=1&custom=&imgCache=false",
                '${serviceName}',
                {
                    "url" : [ url
                            + "/getVectorTile?x=\${x}&y=\${y}&l=\${z}&scale=1&custom=&imgCache=false" ],
                    "labelUrl" : [ url
                            + "/getVectorTileLabel?x=\${x}&y=\${y}&l=\${z}" ],
                    "isBaseLayer" : true,
                    "isVectorTile" : true
                });
        layers = new Array(baseLayer);
    }

    map.addLayers(layers);
    map.addControl(new NPMapLib.Controls.NavigationControl());
    map.addControl(new NPMapLib.Controls.ScaleControl());
    
    // 设置地图风格为上次设置的风格
   	var myStyle = JSON.parse(localStorage.getItem('gaodeMapstyle'));
    if(myStyle !== null) {
        map.setMapStyle({styleJson: myStyle});
    }
}
</script>

 <script type="text/javascript" src="/TServer/resources/styleMap/js/spectrum.js"></script>
 <script type="text/javascript" src="/TServer/resources/styleMap/js/jquery.ztree.core-3.5.js"></script>
 <script type="text/javascript" src="/TServer/resources/styleMap/js/intro.js"></script>
 
 <script type="text/javascript">
    document.write("<script type='text/javascript' src='/TServer/resources/styleMap/js/"+myMapType+"_cat_" + npgisLocal + ".js'><\/script>");
    document.write("<script type='text/javascript' src='/TServer/resources/styleMap/stylelist_" + npgisLocal + ".js'><\/script>");
    document.write("<script type='text/javascript' src='/TServer/resources/styleMap/js/"+myMapType+"_editor_" + npgisLocal + ".js'><\/script>");
 </script>
<body>
</html>