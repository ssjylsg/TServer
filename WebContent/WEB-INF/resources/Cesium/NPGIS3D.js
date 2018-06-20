/**
 * 3D地图 命名空间
 * @requires NPGIS3D.js
 * @class NAPMAP3D
 * @constructor
 */
window.NPGIS3D = window.NPGIS3D || {};
window.NPMAP3D = window.NPGIS3D;
window.NPGIS3D.VesionNumber = "V1.3.0";
/**
* 获取当前文件路径
*/
NPGIS3D.getScriptLocation = function() {
    var scriptName = "NPGIS3D.js";

    function c(scriptName) {
        var r = new RegExp("(^|(.*?\\/))(" + scriptName + ")(\\?|$)"),
            s = document.getElementsByTagName('script'),
            src, m, l = "";
        for (var i = 0, len = s.length; i < len; i++) {
            src = s[i].getAttribute('src');
            if (src) {
                m = src.match(r);
                if (m) {
                    l = m[1];
                    break;
                }
            }
        }
        return l;
    }
    var result = c('NPGIS3D.js');
    window.CESIUM_BASE_URL = result + 'lib/Cesium/';
    console.log(result);
    return result;

};
/**
 * 新增CSS
 */
NPGIS3D.addCSSFiles = function(cssFiles) {
    var host = NPGIS3D.getScriptLocation();
    if (!cssFiles || cssFiles.length <= 0)
        return;
    var oHead = document.getElementsByTagName('HEAD').item(0);
    var cssTags = [];
    for (var i = 0, len = cssFiles.length; i < len; i++) {
        cssTags.push("<link type='text/css' rel='stylesheet' href = '" + (host === '' ? cssFiles[i] : host + "/" + cssFiles[i]) + "'/> ");
        // var oCss= document.createElement("link");
        // oCss.rel = "stylesheet";
        // oCss.type = "text/css";
        // oCss.href = host === '' ? cssFiles[i] : host + "/" + cssFiles[i];
        // oHead.appendChild( oCss);
    }
    if (cssTags.length > 0) {
        document.write(cssTags.join(""));
    }
};
/**
 * 新增JS
 */
NPGIS3D.addJSFiles = function(jsFiles) {
    if (!jsFiles || jsFiles.length <= 0)
        return;
    var host = NPGIS3D.getScriptLocation();
    var scriptTags = [];
    var oHead = document.getElementsByTagName('HEAD').item(0);
    for (var i = 0, len = jsFiles.length; i < len; i++) {
        scriptTags.push("<script type='text/javascript' src='" + (host === '' ? jsFiles[i] : host + "/" + jsFiles[i]) + "'></script>");
        // var oScript= document.createElement("script");
        // oScript.type = "text/javascript";
        // oScript.src = host === '' ? jsFiles[i] : host + "/" + jsFiles[i];
        // oHead.appendChild( oScript);
    }
    if (scriptTags.length > 0) {
        document.write(scriptTags.join(""));
    }
};
(function() {
    var cssFiles = [
        "lib/Cesium/Widgets/widgets.css",
        "css/NPGIS3D.css"
    ];
    var jsFiles = [
        "lib/Cesium/Cesium.js",
        "lib/Cesium/DrawHelper/DrawHelper.js",
        "lib/Cesium/CesiumHeatmap.js"
    ];
    NPGIS3D.addCSSFiles(cssFiles);
    NPGIS3D.addJSFiles(jsFiles);
})();
/**
 * StripeOrientation
 * @requires NPGIS3D.js
 * @class NPGIS3D.StripeOrientation
 * @constructor
 */
NPGIS3D.StripeOrientation = {
    /**
     * HORIZONTAL
     */
    HORIZONTAL: 0,
    /**
     * VERTICAL
     */
    VERTICAL: 1
};
/**
 * CornerType
 * @requires NPGIS3D.js
 * @class NPGIS3D.CornerType
 * @constructor
 */
NPGIS3D.CornerType = {
    /**
     * ROUNDED
     */
    ROUNDED: 0,
    /**
     * MITERED
     */
    MITERED: 1,
    /**
     * BEVELED
     */
    BEVELED: 2
};
NPGIS3D.Static = {};
/**
 * HorizontalOrigin
 * @requires NPGIS3D.js
 * @class NPGIS3D.Static.HorizontalOrigin
 * @constructor
 */
NPGIS3D.Static.HorizontalOrigin = {
    /**
     * CENTER 0
     */
    CENTER: 0,
    /**
     * LEFT  1
     */
    LEFT: 1,
    /**
     * RIGHT -1
     */
    RIGHT: -1
};
/**
 * LabelStyle
 * @requires NPGIS3D.js
 * @class NPGIS3D.Static.LabelStyle
 * @constructor
 */
NPGIS3D.Static.LabelStyle = {
    /**
     * FILL 0
     */
    FILL: 0,
    /**
     * OUTLINE 0
     */
    OUTLINE: 1,
    /**
     * FILL_AND_OUTLINE 2
     */
    FILL_AND_OUTLINE: 2
};
/**
 * VerticalOrigin
 * @requires NPGIS3D.js
 * @class NPGIS3D.Static.VerticalOrigin
 * @constructor
 */
NPGIS3D.Static.VerticalOrigin = {
    /**
     * CENTER 0
     */
    CENTER: 0,
    /**
     * BOTTOM 1
     */
    BOTTOM: 1,
    /**
     * TOP -1
     */
    TOP: -1
};
/**
 * HeightReference
 * @requires NPGIS3D.js
 * @class NPGIS3D.Static.HeightReference
 * @constructor
 */
NPGIS3D.Static.HeightReference = {
    /**
     * NONE 0
     */
    NONE: 0,
    /**
     * CLAMP_TO_GROUND 1
     */
    CLAMP_TO_GROUND: 1,
    /**
     * RELATIVE_TO_GROUND 2
     */
    RELATIVE_TO_GROUND: 2
};


 NPGIS3D.Building = {};

/**
 * Inherit the prototype methods from one constructor into another.
 *
 * Usage:
 *
 *     function ParentClass(a, b) { }
 *     ParentClass.prototype.foo = function(a) { }
 *
 *     function ChildClass(a, b, c) {
 *       // Call parent constructor
 *       ParentClass.call(this, a, b);
 *     }
 *     ol.inherits(ChildClass, ParentClass);
 *
 *     var child = new ChildClass('a', 'b', 'see');
 *     child.foo(); // This works.
 *
 * @param {!Function} childCtor Child constructor.
 * @param {!Function} parentCtor Parent constructor.
 * @function
 * @api
 */
NPGIS3D.inherits = function(childCtor, parentCtor) {
    /*childCtor.prototype = Object.create(parentCtor.prototype);
       childCtor.prototype.constructor = childCtor;*/

    var p = parentCtor.prototype;
    var c = childCtor.prototype;

    for (var i in p) {　　　　　　
        c[i] = p[i];　　　　　　
    }　　　　
    c.uber = p;

    childCtor.prototype.constructor = childCtor;
};


/**
 * A reusable function, used e.g. as a default for callbacks.
 *
 * @return {undefined} Nothing.
 */
NPGIS3D.nullFunction = function() {};


NPGIS3D.global = Function('return this')();

NPGIS3D.basemap = undefined;

/**
 * 颜色
 * @requires Color.js
 * @class NAPMAP3D.Color
 * @constructor
 */
NPGIS3D.Color = function() {
    'use strict';
};

// 产生随机颜色
NPGIS3D.Color.fromRandom = function(red, green, blue) {
    return Cesium.Color.fromRandom({
        red: red,
        green: green,
        blue: blue
    });
};

// 从CSS 颜色获取对象
NPGIS3D.Color.fromCssColorString = function(color) {
    return Cesium.Color.fromCssColorString(color);
};

// 
NPGIS3D.Color.fromHsl = function(hue, saturation, lightness, alpha) {
    return Cesium.Color.fromHsl(hue, saturation, lightness, alpha);
};


/**
 * @requires NPGIS3D.js
 * @class NPGIS3D.MAP3D
 *
 * @constructor
 * @param {String} container - 容器
 * @param {Object} opts - 配置参数
 * @param {String} opts.scene3DOnly - 默认 true
 * @param {String} opts.baseLayerPicker - 默认 false
 * @param {String} opts.animation - 默认 false
 * @param {String} opts.fullscreenButton - 默认 false
 * @param {String} opts.geocoder - 默认 false
 * @param {String} opts.homeButton - 默认 false
 * @param {String} opts.sceneModePicker - 默认 false
 * @param {String} opts.selectionIndicator - 默认 false
 * @param {String} opts.timeline - 默认 false
 * @param {String} opts.navigationHelpButton - 默认 false
 * @param {String} opts.navigationInstructionsInitiallyVisible - 默认 false
 * @param {String} opts.infoBox - 默认 false
 */
NPGIS3D.MAP3D = function(container, opts) {
    NPGIS3D.VerticalOrigin = Cesium.VerticalOrigin;
    NPGIS3D.HorizontalOrigin = Cesium.HorizontalOrigin;
    NPGIS3D.Color = Cesium.Color;
    NPGIS3D.Size = Cesium.Cartesian2;
    NPGIS3D.Size3D = Cesium.Cartesian3;
    NPGIS3D.LabelStyle = Cesium.LabelStyle;
    NPGIS3D.HeightReference = Cesium.HeightReference;

    'use strict';

    if (!NPGIS3D.NPUtil.webglSupport()) {
        alert('浏览器不支持 WebGL!');
        return;
    }
    Cesium.Camera.DEFAULT_VIEW_RECTANGLE = new Cesium.Rectangle(-3.141592653589793, -1.5707963267948966, 3.141592653589793, 1.5707963267948966);
    //Cesium.Camera.DEFAULT_VIEW_FACTOR = 0;

    opts = NPGIS3D.NPUtil.extend(opts, {
        scene3DOnly: true,
        baseLayerPicker: false,
        animation: false,
        fullscreenButton: false,
        geocoder: false,
        homeButton: false,
        sceneModePicker: false,
        selectionIndicator: false,
        timeline: false,
        navigationHelpButton: false,
        navigationInstructionsInitiallyVisible: false,
        infoBox: false
    });
    this._orginPosition = new Cesium.Cartesian3(-7032023.211687667,24311175.076032314,19651885.224244125);
    this.viewer = new Cesium.Viewer(container, opts);

    this.viewer._cesiumWidget._creditContainer.style.display = 'none';
    // 事件
    this.events = {};

    // 图层(不包含底图和覆盖物图层)
    this.thematicMap = new NPGIS3D.HashMap();
    this.modelLayers = {};

    // 默认底图
    //this._loadDefaultBaseLayer();

    // 左键点击事件
    this._setInputAction();
    this.viewer.camera.flyTo({
        destination : this._orginPosition,
        duration:0
    });
    //默认全球并定位到中国上空
    //this.flyToGlobal();
};

// 默认底图
NPGIS3D.MAP3D.prototype._loadDefaultBaseLayer = function() {
    this.viewer.imageryLayers.removeAll();
    var host = NPGIS3D.NPUtil.getHost(),
        mapLayer = new NPGIS3D.Layer.GaoDeLayer(host + 'lib/Cesium/Assets/basemap/{z}/{x}/{y}.jpg', 'AMAP_BASEMAP_DEFAULT', {
            maximumLevel: 3
        }),
        imageryLayers = mapLayer.imageryLayers,
        i = 0,
        ci = imageryLayers.length,
        imageryLayer;

    for (i; i < ci; i++) {
        imageryLayer = imageryLayers[i];
        imageryLayer._isBaseLayer = true;
        this.viewer.imageryLayers.add(imageryLayer);
    }

    NPGIS3D.basemap = mapLayer._baseMapType;
};

/**
 * 注册三维鼠标事件
 * @param {String} event - 事件类型
 * @param {String} callback - 回调函数
 */
NPGIS3D.MAP3D.prototype.addEventLinsener = function(event, callback) {
    this.events[event] = callback;
};

/**
 * 注销三维鼠标事件
 * @param {String} event - 事件类型
 */
NPGIS3D.MAP3D.prototype.removeEventLinsener = function(event) {
    if (this.events[event]) {
        delete this.events[event];
    }
};

/**
 * 添加一个图层
 * @param {NPGIS3D.Layer} layer - 图层
 */
NPGIS3D.MAP3D.prototype.addLayer = function(layer) {
    if(!layer.imageryLayers||layer.imageryLayers.length<1){
        return;
    }
    this.viewer.imageryLayers.add(layer.imageryLayers[0]);
    // 针对天地图+加载标注
    if (layer.imageryLayers.length === 2) {
        this.viewer.imageryLayers.add(layer.imageryLayers[1]);
    }

    NPGIS3D.basemap = layer._baseMapType;

    this.thematicMap.put(layer.name, layer);
};
NPGIS3D.MAP3D.prototype.addModelLayer = function(layer,callBack) {
    //场景添加S3M图层服务
    var promise = this.viewer.scene.addS3MTilesLayerByScp(layer.url,{
        name : layer.name
    });
    var that = this;         
    Cesium.when(promise,function(){
        layer.obj = that.viewer.scene.layers.find(layer.name);
        if(callBack && callBack instanceof Function){
            callBack();
        }
    });
    this.modelLayers[layer.name] = layer;
};
NPGIS3D.MAP3D.prototype.addModelLayers = function(layers,callBack) {
    //场景添加S3M图层服务
    var promises = [];
    for(var i=0;i<layers.length;i++){
        var promise = this.viewer.scene.addS3MTilesLayerByScp(layers[i].url,{
            name : layers[i].name
        });
        promises.push(promise);
        this.modelLayers[layers[i].name] = layers[i];
    }
    var that = this;         
    Cesium.when.all(promises,function(){
        for(var i=0;i<layers.length;i++){
            layers[i].obj = that.viewer.scene.layers.find(layers[i].name);
        }
        if(callBack && callBack instanceof Function){
            callBack();
        }
    });
};
NPGIS3D.MAP3D.prototype.removeModelLayer = function(layer) {
    if(layer && layer.obj){
        this.viewer.scene.layers.remove(layer.name);
        this.modelLayers[layer.name] = null;
        delete this.modelLayers[layer.name];
    }
};
/**
 * 添加一组图层
 * @param {NPGIS3D.Layer[]} layers - 图层
 */
NPGIS3D.MAP3D.prototype.addLayers = function(layers) {
    for (var i = 0, ci = layers.length; i < ci; i++) {
        this.addLayer(layers[i]);
    }
};

/**
 * 添加地形图层
 * @param {NPGIS3D.Layer.TerrainLayer} layer - 地形图层
 */
NPGIS3D.MAP3D.prototype.addTerrainLayer = function(layer) {
    if(layer instanceof NPGIS3D.Layer.TerrainLayer){
        this.viewer.terrainProvider = layer._layer;
    }
};
/**
 * 移除地形图层
 */
NPGIS3D.MAP3D.prototype.removeTerrainLayer = function() {
    this.viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
};

/*
 * 根据图层名称获取图层
 * @param {String} layerName - 图层名称
 * @return {NPGIS3D.Layer} 图层
 */
NPGIS3D.MAP3D.prototype.getLayerByName = function(layerName) {
    var layer;
    if (this.thematicMap.containsKey(layerName)) {
        layer = this.thematicMap.get(layerName);
    }
    return layer;
};

/**
 * 根据图层名称移除
 * @param {String} layerName - 图层名称
 */
NPGIS3D.MAP3D.prototype.removeLayerByName = function(layerName) {
    var layer = this.getLayerByName(layerName);

    if (Cesium.defined(layer)) {
        this.viewer.imageryLayers.remove(layer.imageryLayers[0]);
        this.thematicMap.removeByKey(layerName);

        this._setDefaultState();
    }
};

/**
 * 获取所有图层,ImageryLayer 实例数组
 * @return {NPGIS3D.Layer[]} 图层
 */
NPGIS3D.MAP3D.prototype.getAllLayers = function() {
    return this.thematicMap.values();
};

/**
 * 
 * flyTo,飞行定位到指定的位置点
 * @param {NPGIS3D.Geometry.Point3D} destination ,必须
 * @param {Object} opts  属性
 * @param {Number} opts.time 飞行持续时间，单位秒，默认 3.0
 * @param {Number} opts.maximumHeight: 最大飞行高度，默认
 * @param {Number} opts.heading
 * @param {Number} opts.pitch
 * @param {Number} opts.roll
 * @param {Function} completeCallback  完成回调方法 
 */
NPGIS3D.MAP3D.prototype.flyTo = function(destination, opts, completeCallback) {
    
    if(arguments.length < 2){
        throw new NPGIS3D.DeveloperError('MAP3D', 'flyTo() 参数 destination 和 opts 是必须项!');
    }
    
    if (!Cesium.defined(destination)) {
        throw new NPGIS3D.DeveloperError('MAP3D', 'flyTo() 参数 destination 是必须项!');
    }

    if (!Cesium.defined(opts)) {
        throw new NPGIS3D.DeveloperError('MAP3D', 'flyTo() 参数 opts 是必须项!');
    }
    
    var flyToOptions = this._buildeFlyToOptions(destination, opts, completeCallback, true);
  
    this.viewer.camera.flyTo(flyToOptions);
};

// 移除所有专题图后设置 basemap 为 NPGIS3D.BaseMap.AMAP_ROAD
NPGIS3D.MAP3D.prototype._setDefaultState = function() {
    if (this.thematicMap.isEmpty()) {
        NPGIS3D.basemap = NPGIS3D.BaseMap.AMAP_ROAD;
    }
};

// 构建 flyTo destination
NPGIS3D.MAP3D.prototype._buildeDestination = function(destination, isDegree) {
    var np,
        newDestination;

    if (isDegree) {
        np = NPGIS3D.NPCoordinate.coordinateTransByBasemap(destination.lon, destination.lat)
        newDestination = Cesium.Cartesian3.fromDegrees(np.lon, np.lat, destination.h);
    } else {
        newDestination = destination;
    }

    return newDestination;
};

// 构建 flyTo options
NPGIS3D.MAP3D.prototype._buildeFlyToOptions = function(destination, opts, completeCallback, isDegree) {
    var duration = opts.time || 3,
        maximumHeight = opts.maximumHeight || undefined,
        newOpts = {};

    newOpts.destination = this._buildeDestination(destination, isDegree);
    newOpts.duration = duration;
    newOpts.maximumHeight = maximumHeight;

    if (Cesium.defined(completeCallback)) {
        newOpts.complete = completeCallback;
    }

    newOpts.orientation = this._buildeOrientation(opts);

    return newOpts;
};

// 构建 flyTo orientation
NPGIS3D.MAP3D.prototype._buildeOrientation = function(opts) {
    var orientation = {},
        heading = opts.heading || 0,
        pitch = opts.pitch || -90,
        roll = opts.roll || 0;

    orientation.heading = Cesium.Math.toRadians(heading);
    orientation.pitch = Cesium.Math.toRadians(pitch);
    orientation.roll = roll;

    return orientation;
};

/**
 * 全球并定位到中国上空
 * @param {Function} completeCallback  完成回调方法 
 */
NPGIS3D.MAP3D.prototype.flyToGlobal = function(completeCallback) {
    var flyToOptions = this._buildeFlyToOptions(this._orginPosition, {}, completeCallback, false);

    this.viewer.camera.flyTo(flyToOptions);
};
/**
 * 设置当前场景的可视域
 * @param {Object} opts  可视域参数{position:Point3D,orientation:{heading:number,pitch:number,roll:number}} 
 */
NPGIS3D.MAP3D.prototype.setView = function(opts){
    this.viewer.scene.camera.setView({
        //将经度、纬度、高度的坐标转换为笛卡尔坐标
        destination : Cesium.Cartesian3.fromDegrees(opts.position.lon,opts.position.lat,opts.position.h),
        orientation: opts.orientation
    });
};
/**
 * 获取当前场景的可视域
 */
NPGIS3D.MAP3D.prototype.getView = function(){
    var position = this.viewer.scene.camera.position;
    position = NPGIS3D.NPCoordinate.cartesianToPointGeo(position,true);
    return {
        position:position,
        orientation:{
            heading:this.viewer.scene.camera.heading,
            pitch:this.viewer.scene.camera.pitch,
            roll:this.viewer.scene.camera.roll
        }
    }
};
/**
 * 阳光照射区域是否高亮
 * @param {Boolean} enable
 */
NPGIS3D.MAP3D.prototype.setLighting = function(enable) {
    this.viewer.scene.globe.enableLighting = enable;
};

/**
 * 添加覆盖物图层
 * @param {NPGIS3D.Layer.OverlayLayer} overlayLayer - 覆盖物图层
 */
NPGIS3D.MAP3D.prototype.addOverlayLayer = function(overlayLayer) {
    if (!Cesium.defined(overlayLayer)) {
        throw new NPGIS3D.DeveloperError('MAP3D', 'addOverlayLayer() 参数 overlayLayer 没有定义!');
    }
    this.viewer.dataSources.add(overlayLayer.dataSource);
    if(overlayLayer.dataSource.clustering.enabled){
        overlayLayer._customStyle();
    }
};

/**
 * 删除覆盖物图层
 * @param {NPGIS3D.Layer.OverlayLayer} overlayLayer - 覆盖物图层
 */
NPGIS3D.MAP3D.prototype.removeOverlayLayer = function(overlayLayer) {
    if (!Cesium.defined(overlayLayer)) {
        throw new NPGIS3D.DeveloperError('MAP3D', 'removeOverlayLayer() 参数 overlayLayer 没有定义!');
    }
    if (this.viewer.dataSources.contains(overlayLayer.dataSource)) {
        if (!this.viewer.dataSources.remove(overlayLayer.dataSource, true)) {
            throw new NPGIS3D.DeveloperError('MAP3D', 'removeOverlayLayer() 失败!');
        }
    }
};

/**
 * 获取中心点
 * @return {NPGIS3D.Geometry.Point3D} 中心点
 */
NPGIS3D.MAP3D.prototype.getCenter = function() {
    var width = this.viewer.container.offsetWidth;
    var height = this.viewer.container.offsetHeight;
    var centerPixel = new Cesium.Cartesian2(width / 2, height / 2);
    var position = this.viewer.scene.camera.pickEllipsoid(centerPixel, Cesium.Ellipsoid.WGS84);
    if(!position){
        position = this.viewer.scene.camera.position;
    }
    return NPGIS3D.NPCoordinate.cartesianToPointGeo(position);
    // var l = Cesium.Cartographic.fromCartesian(this.viewer.scene.camera.position);
    // return new NPGIS3D.Geometry.Point3D(Cesium.Math.toDegrees(l.longitude), Cesium.Math.toDegrees(l.latitude), l.height);
};

/**
 * 设置中心点
 * @param {Object} p - 中心点
 * @param {Function} complete - 完成回调函数
 * @param {Function} cancel - 取消回调函数
 */
NPGIS3D.MAP3D.prototype.setCenter = function(p, complete, cancel) {
    this.viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(p.x || p.lon, p.y || p.lat, p.z || p.h),
        complete: complete,
        cancel: cancel
    });
};

/**
 * 获取屏幕坐标
 * @param {Object} p - 点
 * @return {Object} 屏幕坐标
 */
NPGIS3D.MAP3D.prototype.getWindowCoordinates = function(p) {
    var cartographicPosition = Cesium.Cartesian3.fromDegrees(p.x || p.lon, p.y || p.lat,p.z||p.h);
    var screenPosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(this.viewer.scene, cartographicPosition);
    return {
        x: screenPosition.x,
        y: screenPosition.y
    };
};

// 左键点击事件
NPGIS3D.MAP3D.prototype._setInputAction = function() {
    var that = this,
        handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas),
        selectedEntity = undefined,
        oldMaterial = undefined;
        this.viewer.pickEvent.addEventListener(function(f){
            if(f.id>1000000){
                return;
            }
            if(that.modelLayers[f.layerName]){
                var callBack = that.modelLayers[f.layerName].events["click"];
                if(callBack && callBack instanceof Function){
                    var p = NPGIS3D.NPCoordinate.cartesianToPointGeo(f.position);
                    callBack({
                        id:f.id,
                        position: p
                    })
                }
            }
    });
    handler.setInputAction(function(movement) {
        try {
            if (typeof(selectedEntity) !== 'undefined') {
                var oldSeletedEntityID = selectedEntity._id;
                if (Cesium.defined(oldSeletedEntityID) && oldSeletedEntityID.indexOf('building') !== -1) {
                    if (selectedEntity.polygon) {
                        selectedEntity.polygon.material = oldMaterial;
                    }
                }
                selectedEntity = undefined;
                oldMaterial = undefined;
            }
            selectedEntity = that.viewer.selectedEntity;
            if (!selectedEntity) {
                var callback = that.events["click"];
                if (callback && callback instanceof Function) {
                    var position = that.viewer.scene.camera.pickEllipsoid(movement.position, Cesium.Ellipsoid.WGS84);
                    var point = NPGIS3D.NPCoordinate.cartesianToPointGeo(position);
                    callback(point);
                }
                return;
            }
            var entityId = selectedEntity._id;
            if (Cesium.defined(entityId) && entityId.indexOf('building') !== -1) {
                var isPolygon = selectedEntity.polygon;
                if (isPolygon) {
                    oldMaterial = isPolygon.material;
                    isPolygon.material = Cesium.Color.PURPLE;
                }
            }
            if (selectedEntity.overlay && selectedEntity.overlay.events["click"] && selectedEntity.overlay.events["click"] instanceof Function) {
                var overlayCallBack = selectedEntity.overlay.events["click"];
                overlayCallBack(selectedEntity.overlay);
            }
        } catch (e) {
            throw new NPGIS3D.DeveloperError('NPGIS3D.MAP3D entityClickHandler', e);
        }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    
    handler.setInputAction(function(movement) {

        that.viewer.trackedEntity = null;

    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
};

/** 
 * destroy
 */
NPGIS3D.MAP3D.prototype.destroy = function() {
    this.viewer = null;
    this.events = null;
    this.thematicMap = null;
};


/**
 * 工具类，所有方法都是静态方法
 * @class NPGIS3D.NPUtil
 *
 * @constructor
 */
NPGIS3D.NPUtil = function() {

};



/**
 * 判断浏览器是否支持 WebGL
 * @return {Boolean}
 */
NPGIS3D.NPUtil.webglSupport = function() {
    var isSupport = true;
    try {
        var canvas = document.createElement('canvas');
        isSupport = !!window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    } catch (e) {
        isSupport = false;
    }
    return isSupport;
};

/**
 * 判断是否为数组
 * @param {Object} obj
 * @return {Boolean}
 */
NPGIS3D.NPUtil.isArray = function(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
};

/**
 * 判断是否为 Object
 * @param {Object} obj
 * @return {Boolean}
 */
NPGIS3D.NPUtil.isObject = function(obj) {
    return {}.toString.apply(obj) === '[object Object]';
};

/**
 * 判断是否为 Function
 * @param {Object} functionToCheck
 * @return {Boolean}
 */
NPGIS3D.NPUtil.isFunction = function(functionToCheck) {
    var getType = {};
    return functionToCheck && getType.toString.call(functionToCheck) == '[object Function]';
};

/**
 * 判断是否为 Boolean
 * @param {Object} b
 * @return {Boolean}
 */
NPGIS3D.NPUtil.isBoolean = function(b) {
    return (typeof b === 'boolean') ? true : false;
};


/**
 * 判断是否为数字
 * @param {Object} n
 * @return {Boolean}
 */
NPGIS3D.NPUtil.isNum = function(n) {
    return !isNaN(n);
    //return !isNaN(parseFloat(n)) && isFinite(n);
};

 /**
 * 16 进制颜色转rgb
 * @param {String} val - 16进制颜色
 * @return {String} rgb颜色
 */
NPGIS3D.NPUtil.hexToRgb = function(val) {
    //16 进制颜色转rgb，然后把r、g、b 的值转换成 [0-1] 范围内的值，范围从0(无强度)到1.0(完全强度)
    var a, b, c, intensity = 1 / 255;
    if ((/^#/g).test(val)) {
        a = val.slice(1, 3);
        b = val.slice(3, 5);
        c = val.slice(5, 7);
        //return [parseInt(a, 16) * intensity, parseInt(b, 16) * intensity, parseInt(c, 16) * intensity];
        return [parseInt(a, 16), parseInt(b, 16), parseInt(c, 16)];

    } else {
        throw new NPGIS3D.DeveloperError('NPGIS3D.NPUtil.hexToRgb', 'hexToRgb 16进制颜色格式不正确!');
    }
};


/**
 * rgb 转 16 进制颜色
 * @param {String} rgb - rgb 颜色
 * @return {String} 十六进制颜色
 */
NPGIS3D.NPUtil.rgb2hex = function(rgb) {
    //rgb [] 转 16 进制颜色
    var r = rgb[0],
        g = rgb[1],
        b = rgb[2],
        //return ((r << 16) | (g << 8) | b).toString(16);
        decimal = Number(r) * 65536 + Number(g) * 256 + Number(b),
        s = decimal.toString(16);

    while (s.length < 6) {
        s = "0" + s;
    }
    return '#' + s;
};


/**
 * 随机颜色
 * @return {String} 随机十六进制颜色
 */
NPGIS3D.NPUtil.getRandomColor = function() {
    return '#' + (Math.random() * 0xffffff << 0).toString(16);
};


/**
 * 删除左右两端的空格
 * @param {String} str - 字符串
 * @return {String} 去掉左右边空格的字符串
 */
NPGIS3D.NPUtil.StringTrim = function(str) {
    return str.replace(/(^\s*)|(\s*$)/g, '');
};


/**
 * 删除左边的空格
 * @param {String} str - 字符串
 * @return {String} 去掉左边空格的字符串
 */
NPGIS3D.NPUtil.StringLtrim = function(str) {
    return str.replace(/(^\s*)/g, '');
};


/**
 * 删除右边的空格
 * @param {String} str - 字符串
 * @return {String} 去掉右空格的字符串
 */
NPGIS3D.NPUtil.StringRtrim = function(str) {
    return str.replace(/(\s*$)/g, '');
};

NPGIS3D.NPUtil.getImage = function(text,color,size){
    var pinBuilder = new Cesium.PinBuilder();
    color = NPGIS3D.Color.fromCssColorString(color);
    return pinBuilder.fromText(text,color,size);
};

/**
 * UUID
 * return {String} UUID
 */
NPGIS3D.NPUtil.UUID = function() {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split(''),
        uuid = new Array(36),
        rnd = 0,
        r,
        i;
    for (i = 0; i < 36; i++) {
        if (i == 8 || i == 13 || i == 18 || i == 23) {
            uuid[i] = '-';
        } else if (i == 14) {
            uuid[i] = '4';
        } else {
            if (rnd <= 0x02) rnd = 0x2000000 + (Math.random() * 0x1000000) | 0;
            r = rnd & 0xf;
            rnd = rnd >> 4;
            uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
        }
    }
    return uuid.join('');
};

// 获取当前目录
NPGIS3D.NPUtil.getHost = function() {
    function c(scriptName) {
        var r = new RegExp("(^|(.*?\\/))(" + scriptName + ")(\\?|$)"),
            s = document.getElementsByTagName('script'),
            src, m, l = "";
        for (var i = 0, len = s.length; i < len; i++) {
            src = s[i].getAttribute('src');
            if (src) {
                m = src.match(r);
                if (m) {
                    l = m[1];
                    break;
                }
            }
        }
        return l;
    }
    return c('NPGIS3D.js');
};

NPGIS3D.NPUtil.forwardMercator = function(xy0) {
    var pole = 20037508.34;
    var xy = {
        x: xy0.x,
        y: xy0.y
    };
    xy.x = xy.x * pole / 180;
    var y = Math.log(Math.tan((90 + xy.y) * Math.PI / 360)) / Math.PI * pole;
    xy.y = Math.max(-20037508.34, Math.min(y, 20037508.34));
    return xy;
};

NPGIS3D.NPUtil.distinct = function(xy0, xy1) {
    var source = NPGIS3D.NPUtil.forwardMercator(xy0),
        target = NPGIS3D.NPUtil.forwardMercator(xy1);
    return Math.sqrt((source.x - target.x) * (source.x - target.x) + (source.y - target.y) * (source.y - target.y))
};

NPGIS3D.NPUtil.clone = function(from, to) {
    if (from == null || typeof from != "object") return from;
    if (from.constructor != Object && from.constructor != Array) {
        return from;
    }
    if (from.constructor == Date || from.constructor == RegExp || from.constructor == Function ||
        from.constructor == String || from.constructor == Number || from.constructor == Boolean) {
        return new from.constructor(from);
    }

    to = to || new from.constructor();

    for (var name in from) {
        to[name] = typeof to[name] == "undefined" ? NPGIS3D.NPUtil.clone(from[name], null) : to[name];
    }

    return to;
};

NPGIS3D.NPUtil.extend = function(target, options) {
    target = target || {};
    for (var key in options) {
        /*if (key === 'material' && target[key]) {
            target[key] = target[key]._;
        }*/
        if (target[key] === undefined) {
            target[key] = NPGIS3D.NPUtil.clone(options[key]);
        }
    }
    return target;
};

NPGIS3D.NPUtil = NPGIS3D.NPUtil || {};
NPGIS3D.NPUtil.rad = function(x) {
    return x * Math.PI / 180;
};
/**
 * 获取面积
 * @param {Point[]} points -点数组
 */
NPGIS3D.NPUtil.getGeodesicArea = function(points) {
    var area = 0.0;
    var len = points.length;
    if (len > 2) {
        for (var i = 0; i < len - 1; i++) {
            p1 = points[i];
            p2 = points[i + 1];
            area += NPGIS3D.NPUtil.rad(p2.x - p1.x) *
                (2 + Math.sin(NPGIS3D.NPUtil.rad(p1.y)) +
                    Math.sin(NPGIS3D.NPUtil.rad(p2.y)));
        }
        area = area * 6378137.0 * 6378137.0 / 2.0;
    }
    return area;
    // area *= Math.pow((39.37 / 39370), 2);
    // return Math.abs(area);
};
/**
 * 获取面积
 * @param {Point[]} points -点击和数组
 */
NPGIS3D.NPUtil.getArea = function(points) {
    var area = 0.0;
    var len = points.length;
    if (len > 2) {
        var sum = 0.0;
        var p = points[0];
        p = _3dhelper.degreeToWebMoctor(p.x, p.y);
        for (var i = 1; i < len - 1; i++) {
            var b = points[i];
            var c = points[i + 1];
            b = _3dhelper.degreeToWebMoctor(b.x, b.y);
            c = _3dhelper.degreeToWebMoctor(c.x, c.y);
            sum += (b.lon - p.lon) * (c.lat - p.lat) - (b.lat - p.lat) * (c.lon - p.lon);
        }
        area = Math.abs(sum) / 2.0;
    }
    return area;
};
/**
 * 坐标转换帮助
 * @requires coordinateHelper.js
 * @class NPGIS3D.NPUtil.CoordinateHelper
 * @constructor
 *
 */
NPGIS3D.NPUtil.CoordinateHelper = function() {

}
var
    pi = 3.14159265358979324,
    ee = 0.00669342162296594323,
    x_pi = 3.14159265358979324 * 3000.0 / 180.0,
    pole = 20037508.34,
    a = 6378245.0;
var _3dhelper = {
    // 经纬度-> 墨卡托投影转换
    degreeToWebMoctor: function(lon, lat) {
        var c = {
                lon: 0,
                lat: 0
            },
            tmp;

        lon = parseFloat(lon);
        lat = parseFloat(lat);
        c.lon = (lon / 180.0) * 20037508.34;
        if (lat > 85.05112) {
            lat = 85.05112;
        }
        if (lat < -85.05112) {
            lat = -85.05112;
        }
        lat = (Math.PI / 180.0) * lat;
        tmp = Math.PI / 4.0 + lat / 2.0;
        c.lat = 20037508.34 * Math.log(Math.tan(tmp)) / Math.PI;
        return c;
    },

    // 墨卡托投影转换-》经纬度
    webMoctorToDegree: function(lon, lat) {
        lon = 180 * lon / pole;
        lat = 180 / Math.PI * (2 * Math.atan(Math.exp((lat / pole) * Math.PI)) - Math.PI / 2);
        return {
            lon: lon,
            lat: lat
        };
    },
    // 火星->84
    gcjTowgs84: function(lon, lat) {
        var p = {
                lon: 0,
                lat: 0
            },
            lontitude = lon - (_3dhelper.wgs84ToGcj(lon, lat).lon - lon),
            latitude = lat - (_3dhelper.wgs84ToGcj(lon, lat).lat - lat);

        p.lon = lontitude;
        p.lat = latitude;
        return p;
    },

    // 火星坐标转百度坐标
    encryptToBd: function(gg_lon, gg_lat) {
        var x = gg_lon,
            y = gg_lat,
            z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * x_pi),
            theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * x_pi),
            bd_lon = z * Math.cos(theta) + 0.0065,
            bd_lat = z * Math.sin(theta) + 0.006;

        return {
            lon: bd_lon,
            lat: bd_lat
        };
    },

    // 百度坐标转火星坐标
    bdTodecrypt: function(bd_lon, bd_lat) {
        var x = bd_lon - 0.0065,
            y = bd_lat - 0.006,
            z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi),
            theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_pi),
            gg_lon = z * Math.cos(theta),
            gg_lat = z * Math.sin(theta);

        return {
            lon: gg_lon,
            lat: gg_lat
        };
    },

    // 84->火星
    wgs84ToGcj: function(lon, lat) {
        var localHashMap = {},
            dLat,
            dLon,
            radLat,
            magic,
            sqrtMagic,
            mgLat,
            mgLon;

        lon = parseFloat(lon);
        lat = parseFloat(lat);
        if (this.outofChina(lat, lon)) {
            localHashMap.lon = lon;
            localHashMap.lat = lat;
            return localHashMap;
        }
        dLat = _3dhelper.transformLat(lon - 105.0, lat - 35.0);
        dLon = _3dhelper.transformLon(lon - 105.0, lat - 35.0);
        radLat = lat / 180.0 * pi;
        magic = Math.sin(radLat);
        magic = 1 - ee * magic * magic;
        sqrtMagic = Math.sqrt(magic);
        dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * pi);
        dLon = (dLon * 180.0) / (a / sqrtMagic * Math.cos(radLat) * pi);
        mgLat = lat + dLat;
        mgLon = lon + dLon;
        localHashMap.lon = mgLon;
        localHashMap.lat = mgLat;

        return localHashMap;
    },

    outofChina: function(lat, lon) {
        if (lon < 72.004 || lon > 137.8347)
            return true;
        if (lat < 0.8293 || lat > 55.8271)
            return true;
        return false;
    },

    transformLat: function(x, y) {
        var ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
        ret += (20.0 * Math.sin(6.0 * x * pi) + 20.0 * Math.sin(2.0 * x * pi)) * 2.0 / 3.0;
        ret += (20.0 * Math.sin(y * pi) + 40.0 * Math.sin(y / 3.0 * pi)) * 2.0 / 3.0;
        ret += (160.0 * Math.sin(y / 12.0 * pi) + 320 * Math.sin(y * pi / 30.0)) * 2.0 / 3.0;
        return ret;
    },

    transformLon: function(x, y) {
        var ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
        ret += (20.0 * Math.sin(6.0 * x * pi) + 20.0 * Math.sin(2.0 * x * pi)) * 2.0 / 3.0;
        ret += (20.0 * Math.sin(x * pi) + 40.0 * Math.sin(x / 3.0 * pi)) * 2.0 / 3.0;
        ret += (150.0 * Math.sin(x / 12.0 * pi) + 300.0 * Math.sin(x / 30.0 * pi)) * 2.0 / 3.0;
        return ret;
    }
};
/**
 * 坐标转换 84转地图坐标
 * @param {number} lon -x坐标
 * @param {number} lat -y坐标
 */
NPGIS3D.NPUtil.CoordinateHelper.coordinateTransByBasemap = function(lon, lat, h) {
    var basemap = NPGIS3D.basemap;
    // if (typeof basemap === 'undefined') {
    //     throw new NPGIS3D.DeveloperError('coordinateTransByBasemap', '底图类型不确定!');
    // }

    var point = {
        lon: 0,
        lat: 0,
        h: h
    };

    switch (basemap) {
        case NPGIS3D.BaseMap.AMAP_ROAD:
            point = _3dhelper.wgs84ToGcj(lon, lat);
            break;
        case NPGIS3D.BaseMap.AMAP_AERIAL:
            point = _3dhelper.wgs84ToGcj(lon, lat);
            break;
        case NPGIS3D.BaseMap.GOOGLE_AERIAL:
            point = _3dhelper.wgs84ToGcj(lon, lat);
            break;
        case NPGIS3D.BaseMap.GOOGLE_ROAD:
            point = _3dhelper.wgs84ToGcj(lon, lat);
            break;

        case NPGIS3D.BaseMap.BING_AERIAL:

            break;

        case NPGIS3D.BaseMap.BING_AERIAL_WITH_LABELS:

            break;

        case NPGIS3D.BaseMap.BING_ROAD:

            break;

        case NPGIS3D.BaseMap.BING_ORDNANCE_SURVEY:

            break;
        case NPGIS3D.BaseMap.BING_COLLINS_BART:

            break;

        default:
            point.lon = lon;
            point.lat = lat;
    }
    point.h = h;
    return point;
};
/**
 * 坐标转换 地图坐标转84
 * @param {number} lon -x坐标
 * @param {number} lat -y坐标
 */
NPGIS3D.NPUtil.CoordinateHelper.coordinateFromBasemap = function(lon, lat,h) {
    var basemap = NPGIS3D.basemap;
    // if (typeof basemap === 'undefined') {
    //     throw new NPGIS3D.DeveloperError('coordinateTransByBasemap', '底图类型不确定!');
    // }

    var point = {
        lon: 0,
        lat: 0,
        h:h
    };

    switch (basemap) {
        case NPGIS3D.BaseMap.AMAP_ROAD:
            point = _3dhelper.gcjTowgs84(lon, lat);
            break;
        case NPGIS3D.BaseMap.AMAP_AERIAL:
            point = _3dhelper.gcjTowgs84(lon, lat);
            break;
        case NPGIS3D.BaseMap.GOOGLE_AERIAL:
            point = _3dhelper.gcjTowgs84(lon, lat);
            break;
        case NPGIS3D.BaseMap.GOOGLE_ROAD:
            point = _3dhelper.gcjTowgs84(lon, lat);
            break;

        case NPGIS3D.BaseMap.BING_AERIAL:

            break;

        case NPGIS3D.BaseMap.BING_AERIAL_WITH_LABELS:

            break;

        case NPGIS3D.BaseMap.BING_ROAD:

            break;

        case NPGIS3D.BaseMap.BING_ORDNANCE_SURVEY:

            break;
        case NPGIS3D.BaseMap.BING_COLLINS_BART:

            break;

        default:
            point.lon = lon;
            point.lat = lat;
    }
    point.h = h;
    return point;
};

/**
 * 矩阵转几何类型
 * @requires NPGIS3D.Geometry.js
 * @requires NPGIS3D.NPUtil.CoordinateHelper.js
 * @class: NPGIS3D.NPCoordinate
 *
 * @constructor
 */
NPGIS3D.NPCoordinate = function() {};
//Cesium cartesian3、positions、extent、cartographic 转换为 NPGIS3D 的 geometry

// 根据底图类型转换坐标
NPGIS3D.NPCoordinate.coordinateTransByBasemap = function(lon, lat) {
	return NPGIS3D.NPUtil.CoordinateHelper.coordinateTransByBasemap(lon, lat);
};

// cartesian 转 point geometry
NPGIS3D.NPCoordinate.cartesianToPointGeo = function(cartesian,isOutBaseLayer) {
	var wgs84 = Cesium.Ellipsoid.WGS84.cartesianToCartographic(cartesian),
		lon = Cesium.Math.toDegrees(wgs84.longitude),
		lat = Cesium.Math.toDegrees(wgs84.latitude);
		if(!isOutBaseLayer){
			var pObject = NPGIS3D.NPUtil.CoordinateHelper.coordinateFromBasemap(lon, lat);
			lon = pObject.lon;
			lat = pObject.lat;
		}
		point = new NPGIS3D.Geometry.Point3D(lon, lat,wgs84.height);
	return point;
};

// cartesian 数组转 polyline geometry
NPGIS3D.NPCoordinate.positionsToPolylineGeo = function(positions) {
	var i,
		ci = positions.length,
		cartesian,
		pointGeo,
		path = new Array(),
		polylineGeo;

	for (i = 0; i < ci; i++) {
		cartesian = positions[i];
		pointGeo = NPGIS3D.NPCoordinate.cartesianToPointGeo(cartesian);
		path.push(pointGeo);
	}
	polylineGeo = new NPGIS3D.Geometry.Polyline([path]);

	return polylineGeo;
};

// cartesian 数组转 polygon geometry
NPGIS3D.NPCoordinate.positionsToPolygonGeo = function(positions) {
	var i,
		ci = positions.length,
		cartesian,
		pointGeo,
		ring = new Array(),
		polygonGeo;

	for (i = 0; i < ci; i++) {
		cartesian = positions[i];
		pointGeo = NPGIS3D.NPCoordinate.cartesianToPointGeo(cartesian);
		ring.push(pointGeo);
	}
	polygonGeo = new NPGIS3D.Geometry.Polygon([ring]);

	return polygonGeo;
};

// extent 转 extent geometry
NPGIS3D.NPCoordinate.extentToExtentGeo = function(extent) {
	var northwest = Cesium.Rectangle.northwest(extent, northwest),
		southeast = Cesium.Rectangle.southeast(extent, southeast),
		northwestPoint = NPGIS3D.NPCoordinate.cartographicToDegrees(northwest),
		southeastPoint = NPGIS3D.NPCoordinate.cartographicToDegrees(southeast),
		ymin = Math.min(southeastPoint.lat, northwestPoint.lat),
		xmin = Math.min(northwestPoint.lon, southeastPoint.lon),
		ymax = Math.max(northwestPoint.lat, southeastPoint.lat),
		xmax = Math.max(southeastPoint.lon, northwestPoint.lon);

	return new NPGIS3D.Geometry.Extent(xmin, ymin, xmax, ymax);
};

// cartographic 转 经纬度
NPGIS3D.NPCoordinate.cartographicToDegrees = function(cartographic) {
	var cartesian = Cesium.Ellipsoid.WGS84.geodeticSurfaceNormalCartographic(cartographic, cartesian),
		wgs84 = Cesium.Ellipsoid.WGS84.cartesianToCartographic(cartesian),
		lon = Cesium.Math.toDegrees(wgs84.longitude),
		lat = Cesium.Math.toDegrees(wgs84.latitude),
		pObject = NPGIS3D.NPUtil.CoordinateHelper.coordinateFromBasemap(lon, lat);

	return pObject;
};

NPGIS3D.NPCoordinate.fromNPCartesian3List = function(list) {
	var p = [];
	for (var i = 0; i < list.length; i++) {
		p.push(list[i].lon);
		p.push(list[i].lat);
		p.push(list[i].h || 0);
	}
	return Cesium.Cartesian3.fromDegreesArrayHeights(p);
};
/**
 * 错误信息
 * @requires NPGIS3D.js
 * @class NPGIS3D.DeveloperError
 *
 * @constructor
 * @param {String} name - 出现错误的类
 * @param {String} message - 错误信息
 */
NPGIS3D.DeveloperError = function(name, message) {    
    this.name = name;
    this.message = message;
};

/**
 * 错误信息转字符串 
 * @return {String} 错误信息
 */
NPGIS3D.DeveloperError.prototype.toString = function() {
    var str = this.name + ': ' + this.message;

    return str;
};

/**
 * 轻量级的 javascript Promise 实现
 * @class NPGIS3D.Promise
 *
 * @constructor
 */
NPGIS3D.Promise = function() {
    'use strict';
    this._callbacks = [];
    this._isdone;
    this.result;
};

/**
 * @param {Function} func
 * @param {Object} context
 */
NPGIS3D.Promise.prototype.then = function(func, context) {
    var p,
        res;

    if (this._isdone) {
        p = func.apply(context, this.result);
    } else {
        //p = new NPGIS3D.Promise();
        p = this;
        this._callbacks.push(function() {
            res = func.apply(context, arguments);
            if (res && typeof res.then === 'function') {
                res.then(p.done, p);
            }
        });
    }
    return p;
};

/**
 *
 */
NPGIS3D.Promise.prototype.done = function() {
    var i,
        ci = this._callbacks.length;

    this.result = arguments;
    this._isdone = true;
    for (i = 0; i < ci; i++) {
        this._callbacks[i].apply(null, arguments);
    }
    this._callbacks = [];
};

/**
 * @param {Function} func
 * @param {Object[]} args
 */
NPGIS3D.Promise.prototype.chain = function(funcs, args) {
    //var p = new NPGIS3D.Promise();
    var p = this;
    if (funcs.length === 0) {
        p.done.apply(p, args);
    } else {
        funcs[0].apply(null, args).then(function() {
            funcs.splice(0, 1);
            p.chain(funcs, arguments).then(function() {
                p.done.apply(p, arguments);
            });
        });
    }
    return p;
};

/**
 * @param {Promise[]} promises 
 */
NPGIS3D.Promise.prototype.when = function(promises) {
    var //p = new NPGIS3D.Promise(),
        p = this,
        results = [],
        numdone = 0,
        total,
        i;

    if (!promises || !promises.length) {
        p.done(results);
        return p;
    }
    total = promises.length;

    function notifier(i) {
        return function() {
            numdone += 1;
            results[i] = Array.prototype.slice.call(arguments);
            if (numdone === total) {
                p.done(results);
            }
        };
    }

    for (i = 0; i < total; i++) {
        promises[i].then(notifier(i));
    }

    return p;
};

/**
 * AJAX 请求 Promise 实现
 * @requires NPGIS3D.Promise.js
 * @class NPGIS3D.HttpPromise
 *
 * @constructor
 */
NPGIS3D.HttpPromise = function() {
    'use strict';
};

/**
 * HTTP GET 请求
 * @param {String} url - 请求地址,必须
 * @param {Object} data - 请求参数
 * @param {Object} headers - 请求头
 */
NPGIS3D.HttpPromise.prototype.get = function(url, data, headers) {
    return this._ajax('GET', url, data, headers);
};

/**
 * HTTP POST 请求
 * @param {String} url - 请求地址,必须
 * @param {Object} data - 请求参数
 * @param {Object} headers - 请求头
 */
NPGIS3D.HttpPromise.prototype.post = function(url, data, headers) {
    return this._ajax('POST', url, data, headers);
};

/**
 * HTTP PUT 请求
 * @param {String} url - 请求地址,必须
 * @param {Object} data - 请求参数
 * @param {Object} headers - 请求头
 */
NPGIS3D.HttpPromise.prototype.put = function(url, data, headers) {
    return this._ajax('PUT', url, data, headers);
};

/**
 * HTTP DELETE 请求
 * @param {String} url - 请求地址,必须
 * @param {Object} data - 请求参数
 * @param {Object} headers - 请求头
 */
NPGIS3D.HttpPromise.prototype.delete = function(url, data, headers) {
    return this._ajax('DELETE', url, data, headers);
};

NPGIS3D.HttpPromise.prototype._encode = function(data) {
    var payload = '',
        e,
        params,
        k;

    if (typeof data === 'string') {
        payload = data;
    } else {
        e = encodeURIComponent;
        params = [];

        for (k in data) {
            if (data.hasOwnProperty(k)) {
                params.push(e(k) + '=' + e(data[k]));
            }
        }
        payload = params.join('&')
    }
    return payload;
};

NPGIS3D.HttpPromise.prototype._newXHR = function() {
    var xhr;
    if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
    } else if (window.ActiveXObject) {
        try {
            xhr = new ActiveXObject('Msxml2.XMLHTTP');
        } catch (e) {
            xhr = new ActiveXObject('Microsoft.XMLHTTP');
        }
    }
    return xhr;
};

NPGIS3D.HttpPromise.prototype._ajax = function(method, url, data, headers) {
    var p = new NPGIS3D.Promise(),
        xhr, payload,
        content_type = 'application/x-www-form-urlencoded',
        h,
        timeout = 10000,
        tid,
        err;

    data = data || {};
    headers = headers || {};

    try {
        xhr = this._newXHR();
    } catch (e) {
        //p.done('no xhr', '');
        p.done(true, 'no xhr');
        return p;
    }

    payload = this._encode(data);

    //if (method === 'GET' && payload) {
    if (method === 'GET') {
        if (payload !== '') {
            url += '?' + payload;
        }

        payload = null;
    }

    xhr.open(method, url, true);

    for (h in headers) {
        if (headers.hasOwnProperty(h)) {
            if (h.toLowerCase() === 'content-type')
                content_type = headers[h];
            else
                xhr.setRequestHeader(h, headers[h]);
        }
    }
    xhr.setRequestHeader('Content-type', content_type);

    function onTimeout() {
        xhr.abort();
        //p.done('time out', '', xhr);
        p.done(true, 'time out');
    }

    timeout = 10000;
    if (timeout) {
        tid = setTimeout(onTimeout, timeout);
    }

    xhr.onreadystatechange = function() {
        if (timeout) {
            clearTimeout(tid);
        }
        if (xhr.readyState === 4) {
            err = (!xhr.status ||
                (xhr.status < 200 || xhr.status >= 300) &&
                xhr.status !== 304);

            //p.done(err, xhr.responseText, xhr);
            p.done(err, xhr.responseText);
            xhr = null;
        }
    };

    xhr.send(payload);

    return p;
};

/**
 * 轻量级的 Map 实现
 * @class NPGIS3D.HashMap
 *
 * @constructor
 */
NPGIS3D.HashMap = function() {
    'use strict';
    this.elements = new Array();
};

//获取MAP元素个数 
NPGIS3D.HashMap.prototype.size = function() {
    return this.elements.length;
};

// 判断MAP是否为空
NPGIS3D.HashMap.prototype.isEmpty = function() {
    return (this.elements.length < 1);
};

// 删除MAP所有元素
NPGIS3D.HashMap.prototype.clear = function() {
    this.elements = new Array();
};

// 向MAP中增加元素（key, value) 
NPGIS3D.HashMap.prototype.put = function(_key, _value) {
    this.elements.push({
        key: _key,
        value: _value
    });
};

// 删除指定KEY的元素，成功返回True，失败返回False
NPGIS3D.HashMap.prototype.removeByKey = function(_key) {
    var bln = false,
        i,
        length = this.elements.length;
    try {
        for (i = 0; i < length; i++) {
            if (this.elements[i].key == _key) {
                this.elements.splice(i, 1);
                return true;
            }
        }
    } catch (e) {
        bln = false;
    }
    return bln;
};

// 删除指定VALUE的元素，成功返回True，失败返回False
NPGIS3D.HashMap.prototype.removeByValue = function(_value) { //removeByValueAndKey
    var bln = false,
        i,
        length = this.elements.length;
    try {
        for (i = 0; i < length; i++) {
            if (this.elements[i].value == _value) {
                this.elements.splice(i, 1);
                return true;
            }
        }
    } catch (e) {
        bln = false;
    }
    return bln;
};

// 删除指定VALUE的元素，成功返回True，失败返回False
NPGIS3D.HashMap.prototype.removeByValueAndKey = function(_key, _value) {
    var bln = false,
        i,
        length = this.elements.length;
    try {
        for (i = 0; i < length; i++) {
            if (this.elements[i].value == _value && this.elements[i].key == _key) {
                this.elements.splice(i, 1);
                return true;
            }
        }
    } catch (e) {
        bln = false;
    }
    return bln;
};

// 获取指定KEY的元素值VALUE，失败返回NULL
NPGIS3D.HashMap.prototype.get = function(_key) {
    var i,
        length = this.elements.length;
    try {
        for (i = 0; i < length; i++) {
            if (this.elements[i].key == _key) {
                return this.elements[i].value;
            }
        }
    } catch (e) {
        return false;
    }
    return false;
};

// 获取指定索引的元素（使用element.key，element.value获取KEY和VALUE），失败返回NULL
NPGIS3D.HashMap.prototype.element = function(_index) {
    if (_index < 0 || _index >= this.elements.length) {
        return null;
    }
    return this.elements[_index];
};

// 判断MAP中是否含有指定KEY的元素
NPGIS3D.HashMap.prototype.containsKey = function(_key) {
    var bln = false,
        i,
        length = this.elements.length;
    try {
        for (i = 0; i < length; i++) {
            if (this.elements[i].key == _key) {
                bln = true;
            }
        }
    } catch (e) {
        bln = false;
    }
    return bln;
};

// 判断MAP中是否含有指定VALUE的元素
NPGIS3D.HashMap.prototype.containsValue = function(_value) {
    var bln = false,
        i,
        length = this.elements.length;
    try {
        for (i = 0; i < length; i++) {
            if (this.elements[i].value == _value) {
                bln = true;
            }
        }
    } catch (e) {
        bln = false;
    }
    return bln;
};

// 判断MAP中是否含有指定VALUE的元素
NPGIS3D.HashMap.prototype.containsObj = function(_key, _value) {
    var bln = false,
        i,
        length = this.elements.length;
    try {
        for (i = 0; i < length; i++) {
            if (this.elements[i].value == _value && this.elements[i].key == _key) {
                bln = true;
            }
        }
    } catch (e) {
        bln = false;
    }
    return bln;
};

// 获取MAP中所有VALUE的数组（ARRAY） 
NPGIS3D.HashMap.prototype.values = function() {
    var arr = new Array(),
        i,
        length = this.elements.length;
    for (i = 0; i < length; i++) {
        arr.push(this.elements[i].value);
    }
    return arr;
};

// 获取MAP中所有VALUE的数组（ARRAY）
NPGIS3D.HashMap.prototype.valuesByKey = function(_key) {
    var arr = new Array(),
        i,
        length = this.elements.length;
    for (i = 0; i < length; i++) {
        if (this.elements[i].key == _key) {
            arr.push(this.elements[i].value);
        }
    }
    return arr;
};

// 获取MAP中所有KEY的数组（ARRAY） 
NPGIS3D.HashMap.prototype.keys = function() {
    var arr = new Array(),
        i,
        length = this.elements.length;
    for (i = 0; i < length; i++) {
        arr.push(this.elements[i].key);
    }
    return arr;
};

// 获取key通过value
NPGIS3D.HashMap.prototype.keysByValue = function(_value) {
    var arr = new Array(),
        i,
        length = this.elements.length;
    for (i = 0; i < length; i++) {
        if (_value == this.elements[i].value) {
            arr.push(this.elements[i].key);
        }
    }
    return arr;
};

// 获取MAP中所有KEY的数组（ARRAY） 
NPGIS3D.HashMap.prototype.keysRemoveDuplicate = function() {
    var arr = new Array(),
        i,
        length = this.elements.length,
        flag = true,
        j,
        arrLength = arr.length;

    for (i = 0; i < length; i++) {
        flag = true;
        for (j = 0; j < arrLength; j++) {
            if (arr[j] == this.elements[i].key) {
                flag = false;
                break;
            }
        }
        if (flag) {
            arr.push(this.elements[i].key);
        }
    }
    return arr;
};

/**
 * 底图类型
 * @requires NPGIS3D.js
 * @class NPGIS3D.BaseMap
 * @constructor
 */
NPGIS3D.BaseMap = {

    // 天地图矢量
    TDT_ROAD: 'tdtRoad',

    // 天地图影像
    TDT_AERIAL: 'tdtAerial',

    // 天地图影像和标注
    TDT_AERIAL_WITH_LABELS: 'tdtAerialWithLabels',

    // 天地图矢量和标注
    TDT_ROAD_WITH_LABELS: 'tdtRoadWithLabels',

    // 高德矢量
    AMAP_ROAD: 'amapRoad',

    // 高德影像
    AMAP_AERIAL: 'amapAerial',

    // 百度矢量
    BAIDU_ROAD: 'baiduRoad',

    // 谷歌影像
    GOOGLE_AERIAL: 'googleAerial',

    // 谷歌矢量
    GOOGLE_ROAD: 'googleRoad',

    // 必应航空影像
    BING_AERIAL: 'Aerial',

    // 必应航空影像与道路覆盖
    BING_AERIAL_WITH_LABELS: 'AerialWithLabels',

    // 必应道路
    BING_ROAD: 'bingRoad',

    // 必应地形测量影像
    BING_ORDNANCE_SURVEY: 'OrdnanceSurvey',

    // 必应柯林斯·巴尔特影像
    BING_COLLINS_BART: 'CollinsBart'
};

/**
 * 相机
 * @requires NAPMAP3D.js
 * @class NAPMAP3D.Camera

 * @constructor
 * @param {NPGIS3D.MAP3D} viewer,必须
 */
NPGIS3D.Camera = function(viewer) {
    'use strict';

    this.camera = viewer.viewer.camera;

    this._viewer = viewer;
    this._multiplier;
    this._isFollow;
    this._firstPoint;
    this._startTime;
    this._stopTime;
    this._entity = undefined;
    this._position;
    this._preCartesian;
    this._trackFlightOverLayLayer;
    this._trackType;
    this._trackLine;
    this._tickListenerHandler;
};

/** 
 * flyTo,使用 viewer 的 flyTo()
 * @param {NPGIS3D.Overlay} target - 覆盖物,必须
 * @param {Object} opts  属性
 * @param {Number} opts.duration -飞行持续时间，单位秒，默认 3.0
 * @param {Number} opts.maximumHeight - 最大飞行高度，默认
 * @param {Number} opts.heading
 * @param {Number} opts.pitch
 * @param {Number} opts.range
 */
NPGIS3D.Camera.prototype.flyTo = function(target, options) {
    if (!Cesium.defined(target)) {
        throw new NPGIS3D.DeveloperError('NPGIS3D.Camera', 'flyTo() 参数 target 是必须项!');
    }
    if (!Cesium.defined(options)) {
        options = {};
    }
    this._viewer.viewer.flyTo(target._entity, this._getFlyToOpts(options));
};

/** 
 * zoomTo,使用 viewer 的 zoomTo()
 * @param {NPGIS3D.Overlay} target - 覆盖物,必须
 */
NPGIS3D.Camera.prototype.zoomTo = function(target) {
    if (!Cesium.defined(target)) {
        throw new NPGIS3D.DeveloperError('NPGIS3D.Camera', 'zoomTo() 参数 target 是必须项!');
    }
    this._viewer.viewer.zoomTo(target._entity);
};


//flyTo options 处理
NPGIS3D.Camera.prototype._getFlyToOpts = function(opts) {
    var duration = opts.duration,
        maximumHeight = opts.maximumHeight || -1,
        heading = opts.heading || -1,
        pitch = opts.pitch || -1,
        range = opts.range || -1,
        offset,
        newOpts = {};

    if (!Cesium.defined(duration)) {
        duration = 3;
    }
    newOpts.duration = duration;

    if (maximumHeight !== -1) {
        newOpts.maximumHeight = maximumHeight;
    }

    if (heading !== -1 || pitch !== -1 || range !== -1) {

        offset = new Cesium.HeadingPitchRange();
        if (heading !== -1) {
            offset.heading = Cesium.Math.toRadians(heading);
        }
        if (pitch !== -1) {
            offset.pitch = Cesium.Math.toRadians(pitch);
        }
        if (range !== -1) {
            offset.range = range;
        }
        newOpts.offset = offset;
    }

    return newOpts;
};

/** 
 * 沿轨迹飞行
 * @param {NPGIS3D.Geometry.Polyline} polyline 几何,必须
 * @param {Object} opts  属性
 * @param {Boolean}  opts.isLoop - 是否循环，默认 false ,此属性不开放
 * @param {Number}  opts.multiplier - 速度倍数，默认 10
 * @param {String}  opts.color - 轨迹线颜色，默认 #FF0000
 * @param {Number}  opts.width - 轨迹线宽度，默认 5
 * @param {Boolean}  opts.follow camera - 是否跟随，默认 true
 */
NPGIS3D.Camera.prototype.trackFlight = function(polyline, options) {
    this._trackType = 'flight';
    this._track(polyline, options);
};

/** 
 * 沿轨迹 drive
 * @param {NPGIS3D.Geometry.Polyline} polyline 几何,必须
 * @param {Object} opts  属性 
 * @param {Boolean} opts.isLoop - 是否循环，默认 false ,此属性不开放
 * @param {Number} opts.multiplier - 速度倍数，默认 10
 * @param {String} opts.color - 轨迹线颜色，默认 #FF0000
 * @param {Number} opts.width - 轨迹线宽度，默认 5
 * @param {Boolean} opts.follow - camera 是否跟随，默认 true
 */
NPGIS3D.Camera.prototype.trackDrive = function(polyline, options) {
    this._trackType = 'drive';
    this._track(polyline, options);
};

/** 
 * 停止飞行
 */
NPGIS3D.Camera.prototype.stopTrack = function() {
    this._doStop();
};

/** 
 * destroy
 */
NPGIS3D.Camera.prototype.destroy = function() {
    this._viewer = null;
};

// 执行轨迹播放
// carmera flyTo 默认飞行到估计的第一个点的位置，如果设置相机跟随则高度取第一个点的高度，如果没设置相机跟随则高度取 500，
// pitch 默认都取 -90 (looking down)
NPGIS3D.Camera.prototype._track = function(polyline, options) {
    this._trackLine = polyline;

    this._getFirstPoint();

    var opts = this._buildOptions(options),
        h = (opts.follow) ? this._firstPoint.h : 500,
        that = this;

    this.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(this._firstPoint.lon, this._firstPoint.lat, h),
        orientation: {
            heading: this.camera.heading,
            pitch: Cesium.Math.toRadians(-90),
            roll: this.camera.roll
        },
        duration: 1,
        complete: function() {
            that._trackFlightOverLayLayer = new NPGIS3D.Layer.OverlayLayer('trackFlightOverLayLayer');
            that._viewer.addOverlayLayer(that._trackFlightOverLayLayer);

            that._multiplier = opts.multiplier;
            that._isFollow = opts.follow;

            // 设置开始时间
            var myDate = new Date();
            that._startTime = Cesium.JulianDate.fromDate(new Date(myDate.getFullYear(), myDate.getMonth(), myDate.getDate(), myDate.getHours()));

            that._entity = that._getEntity(opts.color, opts.width);
            that._entity.position.setInterpolationOptions({
                interpolationDegree: 1,
                interpolationAlgorithm: Cesium.LagrangePolynomialApproximation
            });

            that._trackFlightOverLayLayer.addOverlay(that._entity);

            that._setClock();

            if (that._isFollow) {

                that._tickListenerHandler = function tickCallback(clock) {
                    var currentTime = clock._currentTime,
                        isTrue = Cesium.JulianDate.equals(currentTime, that._stopTime),
                        currentCartesian,
                        angle;

                    if (isTrue) {
                        that._doStop();
                    } else {
                        currentCartesian = that._position.getValue(currentTime);

                        if (Cesium.defined(currentCartesian)) {

                            if (Cesium.defined(that._preCartesian)) {
                                angle = that._getRadian(currentCartesian, that._preCartesian);

                                that._setCamera(currentCartesian, angle);
                            }
                            that._preCartesian = currentCartesian;
                        }

                    }
                };
                that._viewer.viewer.clock.onTick.addEventListener(that._tickListenerHandler);
            }
        }
    });
};

// 设置相机 
NPGIS3D.Camera.prototype._setCamera = function(currentCartesian, heading) {
    var //heading = Cesium.Math.toRadians(angle),
        pitch = Cesium.Math.toRadians(-10),
        range = 20.0;

    if (this._trackType === 'flight') {
        pitch = Cesium.Math.toRadians(-30);
        range = 100.0;
    }

    this.camera.lookAt(currentCartesian, new Cesium.HeadingPitchRange(heading, pitch, range));
};

// 计算相机 heading
NPGIS3D.Camera.prototype._getRadian = function(currentCartesian, preCartesian) {
    var cDegrees = this._cartesianToDegrees(currentCartesian),
        pDegrees = this._cartesianToDegrees(preCartesian),
        //radian = this._calculateRadian(cDegrees, pDegrees),
        //angle = Math.abs(radian) - 90;
        radian = 90 - this._calculateRadian(cDegrees, pDegrees),
        angle = Math.PI + Cesium.Math.toRadians(radian);



    /*var angle3 = Cesium.Cartesian3.angleBetween(preCartesian, currentCartesian);	
	angle3 = Math.PI + (Math.PI / 2 - angle3);
	console.log(angle3);*/

    return angle;
};

// Cartesian3 转换 WGS84
NPGIS3D.Camera.prototype._cartesianToDegrees = function(cartesian) {

    var wgs84 = Cesium.Ellipsoid.WGS84.cartesianToCartographic(cartesian),
        lon = Cesium.Math.toDegrees(wgs84.longitude),
        lat = Cesium.Math.toDegrees(wgs84.latitude);

    return NPGIS3D.NPUtil.CoordinateHelper.coordinateFromBasemap(lon, lat);

    /*return {
		lon: lon,
		lat: lat
	};*/
};

// 计算弧度
NPGIS3D.Camera.prototype._calculateRadian = function(obj1, obj2) {
    return Math.atan2((obj2.lat - obj1.lat), (obj2.lon - obj1.lon)) * 180 / Math.PI;
};

// 停止轨迹
NPGIS3D.Camera.prototype._doStop = function() {
    if (Cesium.defined(this._entity)) {

        this._viewer.viewer.clock.onTick.removeEventListener(this._tickListenerHandler);

        if (this._isFollow) {
            this.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
        }

        this._viewer.removeOverlayLayer(this._trackFlightOverLayLayer);

        //this._viewer = null;
        this._preCartesian = null;
        this._entity = null;
        this._multiplier = null;
        this._isFollow = null;
        this._firstPoint = null;
        this._startTime = null;
        this._stopTime = null;
        this._position = null;
        //this._trackFlightOverLayLayer = null;
        this._trackFlightOverLayLayer.destroy();
        this._trackType = null;
        this._trackLine = null;
        this._tickListenerHandler = null;
    }
};

// 获取轨迹点的数量和第一个点
// 如果线中的点是 NPGIS3D.Geometry.Point 实例则设置 _firstPoint 的高度为30，
// 如果线中的点是NPGIS3D.Geometry.Point3D 实例则设置 _firstPoint 的高度 NPGIS3D.Geometry.Point3D 实例的 h
NPGIS3D.Camera.prototype._getFirstPoint = function() {
    var pathLength = this._trackLine.paths.length,
        i,
        path;
    for (i = 0; i < pathLength; i++) {
        path = this._trackLine.paths[i];
        this._firstPoint = NPGIS3D.NPCoordinate.coordinateTransByBasemap(path[0].lon, path[0].lat);
        this._firstPoint.h = path[0].h ? path[0].h : 30;
    }
};

// 设置相机
NPGIS3D.Camera.prototype._setClock = function() {
    var clock = this._viewer.viewer.clock;
    clock.startTime = this._startTime.clone();
    clock.stopTime = this._stopTime.clone();
    clock.currentTime = this._startTime.clone();
    clock.clockRange = Cesium.ClockRange.CLAMPED; //CLAMPED 达到终止时间后停止 ,UNBOUNDED 达到终止时间后继续读秒,LOOP_STOP; //达到终止时间后重新循环

    clock.multiplier = this._multiplier;
};

// 轨迹 Entity
NPGIS3D.Camera.prototype._getEntity = function(color, width) {
    var host = NPGIS3D.NPUtil.getHost();
    var modelURI = host + '/lib/Cesium/Assets/Models/CesiumMilkTruck.gltf'
    if (this._trackType === 'flight') {
        modelURI = host + '/lib/Cesium/Assets/Models/Cesium_Air.gltf';
    }

    this._position = this._computeTrajectory();

    var entityOpts = {
        availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
            start: this._startTime,
            stop: this._stopTime
        })]),

        position: this._position,

        orientation: new Cesium.VelocityOrientationProperty(this._position),

        model: {
            uri: modelURI,
            minimumPixelSize: 28,
            scale:0.6
        },

        path: {
            resolution: 1,
            material: new Cesium.PolylineOutlineMaterialProperty({
                color: Cesium.Color.fromBytes(color[0], color[1], color[2], 255),
                outlineWidth: 1,
                outlineColor: Cesium.Color.fromBytes(color[0], color[1], color[2], 255)
            }),
            width: width
        }
    }

    return new Cesium.Entity(entityOpts);
};

// 轨迹数据处理
NPGIS3D.Camera.prototype._computeTrajectory = function() {
    var property = new Cesium.SampledPositionProperty(),
        pathLength = this._trackLine.paths.length,
        i,
        j,
        path,
        pLength,
        time,
        point,
        newPoint,
        positionTemp,
        dis = 0,
        position;

    for (i = 0; i < pathLength; i++) {
        path = this._trackLine.paths[i];
        pLength = path.length;

        for (j = 0; j < pLength; j++) {
            point = path[j];
            newPoint = NPGIS3D.NPCoordinate.coordinateTransByBasemap(point.lon, point.lat);

            if (this._trackType === 'flight') {
                position = Cesium.Cartesian3.fromDegrees(newPoint.lon, newPoint.lat, point.h);
            } else {
                position = Cesium.Cartesian3.fromDegrees(newPoint.lon, newPoint.lat,point.h);
            }

            if (j > 0) {
                dis += Cesium.Cartesian3.distance(positionTemp, position);
            }

            time = Cesium.JulianDate.addSeconds(this._startTime, dis, new Cesium.JulianDate());
            property.addSample(time, position);

            ////////////////////////////////
            /*this._trackFlightOverLayLayer.addOverlay({
	            position : position,
	            point : {
	                pixelSize : 8,
	                color : Cesium.Color.TRANSPARENT,
	                outlineColor : Cesium.Color.GREEN,
	                outlineWidth : 3
	            }
	        });*/
            ////////////////////////////////

            // 记录上一次的坐标
            positionTemp = position;
        }
        // 设置结束时间
        this._stopTime = Cesium.JulianDate.addSeconds(this._startTime, dis, new Cesium.JulianDate());
    }
    return property;
};

// 属性处理
NPGIS3D.Camera.prototype._buildOptions = function(opts) {
    var isLoop = opts.isLoop || false,
        multiplier = opts.multiplier || 10,
        width = opts.width || 5,
        colorTemp = opts.color || '#FF0000',
        color = NPGIS3D.NPUtil.hexToRgb(colorTemp),
        followTemp = opts.follow,
        follow,
        options;

    follow = (typeof opts.follow === 'undefined') ? true : followTemp;

    options = {
        isLoop: isLoop,
        multiplier: multiplier,
        color: color,
        width: width,
        follow: follow
    };

    return options;
};

/*
NPGIS3D.Camera.prototype.flyTo = function(destination, options) {

	this.camera.flyTo({
		destination: Cesium.Cartesian3.fromDegrees(destination.lon, destination.lat, destination.h)
	});
};
*/

/**
 * 几何基类
 * @requires NPGIS3D.js
 * @class NPGIS3D.Geometry
 * @constructor
 * 
 */
NPGIS3D.Geometry = function() {
	'use strict';
};
/**
 * point 点几何
 * @requires NPGIS3D.Geometry.js
 * @class NPGIS3D.Geometry.Point 
 * @extends NPGIS3D.Geometry
 *
 * @constructor
 * @param {Number} lon - 经度,必须
 * @param {Number} lat - 纬度,必须
 */
NPGIS3D.Geometry.Point = function(lon, lat) {
	'use strict';
	NPGIS3D.Geometry.call(this);

	this.type = 'point2D';

	this.lon = Number(lon);
	this.lat = Number(lat);
};



NPGIS3D.inherits(NPGIS3D.Geometry.Point, NPGIS3D.Geometry);
/**
 * point 三维点几何
 * @requires NPGIS3D.Geometry.js
 * @class NPGIS3D.Geometry.Point3D 
 * @extends NPGIS3D.Geometry
 *
 * @constructor
 * @param {Number} lon - 经度,必须
 * @param {Number} lat - 纬度,必须
 * @param {Number} h - 高度,必须
 */
NPGIS3D.Geometry.Point3D = function(lon, lat, h) {
	'use strict';
	NPGIS3D.Geometry.call(this);

	this.type = 'point3D';

	this.lon = Number(lon);
	this.lat = Number(lat);
	this.h = Number(h) || 0;
};

NPGIS3D.inherits(NPGIS3D.Geometry.Point3D, NPGIS3D.Geometry);
/**
 * polyline 线几何
 * @requires NPGIS3D.Geometry.js
 * @requires NPGIS3D.Geometry.Point.js
 * @class NPGIS3D.Geometry.Polyline
 * @extends NPGIS3D.Geometry
 *
 * @constructor
 * @param {NPGIS3D.Geometry.Point[]} paths - Point数组,必须
 */
NPGIS3D.Geometry.Polyline = function(paths) {
	'use strict';
	NPGIS3D.Geometry.call(this);

	this.type = 'polyline';

	this.paths = paths;
};

NPGIS3D.inherits(NPGIS3D.Geometry.Polyline, NPGIS3D.Geometry);
/**
 * Polygon 面几何
 * @requires NPGIS3D.Geometry.js
 * @requires NPGIS3D.Geometry.Point.js
 * @class NPGIS3D.Geometry.Polygon
 * @extends NPGIS3D.Geometry
 *
 * @constructor
 * @param {NPGIS3D.Geometry.Point[]}  rings - Point数组,必须
 */
NPGIS3D.Geometry.Polygon = function(rings) {
    'use strict';

    NPGIS3D.Geometry.call(this);
    this.type = 'polygon';
    this.rings = rings;
};

NPGIS3D.inherits(NPGIS3D.Geometry.Polygon, NPGIS3D.Geometry);

/**
 * Extent 范围几何
 * @requires NPGIS3D.Geometry.js
 * @class NPGIS3D.Geometry.Extent 
 * @extends NPGIS3D.Geometry
 *
 * @constructor
 * @param {Number} xmin - 最小经度,必须
 * @param {Number} ymin - 最小纬度,必须
 * @param {Number} xmax - 最大经度,必须
 * @param {Number} ymax - 最大纬度,必须
 */
NPGIS3D.Geometry.Extent = function(xmin, ymin, xmax, ymax) {
    'use strict';
    NPGIS3D.Geometry.call(this);

    this.type = 'Extent';

    this.xmin = xmin;
    this.ymin = ymin;
    this.xmax = xmax;
    this.ymax = ymax;

    this.extent = {
        xmin: xmin,
        ymin: ymin,
        xmax: xmax,
        ymax: ymax
    };
};

NPGIS3D.inherits(NPGIS3D.Geometry.Extent, NPGIS3D.Geometry);

/**
 * Circle 圆几何
 * @requires NPGIS3D.Geometry.js
 * @requires NPGIS3D.Geometry.Point.js
 * @class NPGIS3D.Geometry.Circle
 * @extends NPGIS3D.Geometry
 *
 * @constructor
 * @param {NPGIS3D.Geometry.Point} center - 中心点，必须
 * @param {Number} radius - 半径，必须
 */
NPGIS3D.Geometry.Circle = function(center, radius) {
    'use strict';
    NPGIS3D.Geometry.call(this);

    this.type = 'circle';

    this.center = center;
    this.radius = radius;
};

NPGIS3D.inherits(NPGIS3D.Geometry.Circle, NPGIS3D.Geometry);

/**
 * 基础图层
 * @requires NAPMAP3D.js
 * @class NAPMAP3D.Layer
 * @constructor
 */
NPGIS3D.Layer = function() {
	'use strict';
};
/**
 * 地图服务图层基类
 * @requires NPGIS3D.Layer.js
 * @class: NPGIS3D.Layer.MapLayer
 * @extends NPGIS3D.Layer
 *
 * @constructor
 * @param url - 服务地址,如果为 undefined 加载在线服务,必须
 * @param name - 名称,必须
 * @param opts  
 */
NPGIS3D.Layer.MapLayer = function(url, name, opts, lType) {
	'use strict';
	NPGIS3D.Layer.call(this);

	this.layerType = lType;

	// 服务地址
	this.url = url;

	// 图层名称
	this.name = name || '地图服务';

	// 最小显示级别
	this._minimumLevel = 0;

	// 最大显示级别
	this._maximumLevel = 18;

	// 地图类型
	this._baseMapType = NPGIS3D.BaseMap.AMAP_ROAD;

	// 
	this._options = this._buildeOpts(opts);

	// Cesium.ImageryLayer Array
	this.imageryLayers = new Array();

	this._getBaseLayer();
};

/*
 * 设置可见
 */
NPGIS3D.Layer.MapLayer.prototype.show = function() {
	var i, count = this.imageryLayers.length;
	for (i = 0; i < count; i++) {
		this.imageryLayers[i].show = true;
	}
};

/*
 * 设置不可见
 */
NPGIS3D.Layer.MapLayer.prototype.hide = function() {
	var i, count = this.imageryLayers.length;
	for (i = 0; i < count; i++) {
		this.imageryLayers[i].show = false;
	}
};

// 底图
NPGIS3D.Layer.MapLayer.prototype._getBaseLayer = function() {
	if (Cesium.defined(this.url)) {
		// 离线
		if (Cesium.defined(this._options.style)) {
			this._baseMapType = this._options.style;
		}

		this.imageryLayers[0] = new Cesium.ImageryLayer(this._getOfflineBaseLayer(), this._options);
	} else {
		this._getOnlineBaseLayers();
	}
};

// 在线底图
NPGIS3D.Layer.MapLayer.prototype._getOnlineBaseLayers = function() {
	// 在线
	if (this.layerType === 'TDTLayer') {
		var layers = this._getOnlineBaseLayer(this._options.style),
			i = 0,
			ci = layers.length;
		for (i; i < ci; i++) {
			this.imageryLayers[i] = new Cesium.ImageryLayer(layers[i], this._options);
		}
	} else {
		this.imageryLayers[0] = new Cesium.ImageryLayer(this._getOnlineBaseLayer(), this._options);
	}
};

// 构建参数
NPGIS3D.Layer.MapLayer.prototype._buildeOpts = function(opts) {
	var options = opts,
		extent;

	if (Cesium.defined(opts.minimumLevel)) {
		this._minimumLevel = opts.minimumLevel;
	}
	
	if (Cesium.defined(opts.maximumLevel)) {
		this._maximumLevel = opts.maximumLevel;
	}

	if (Cesium.defined(opts.rectangle)) {
		extent = this._extentTrans(options.rectangle);
		options.rectangle = Cesium.Rectangle.fromDegrees(extent.xmin, extent.ymin, extent.xmax, extent.ymax);
	}

	return options;
};

// 根据底图转换坐标
NPGIS3D.Layer.MapLayer.prototype._extentTrans = function(extent) {
	var northwestPoint = NPGIS3D.NPUtil.CoordinateHelper.coordinateTransByBasemap(extent.xmin, extent.ymin),
		southeastPoint = NPGIS3D.NPUtil.CoordinateHelper.coordinateTransByBasemap(extent.xmax, extent.ymax);
	return new NPGIS3D.Geometry.Extent(northwestPoint.lon, northwestPoint.lat, southeastPoint.lon, southeastPoint.lat);
}

// 离线
NPGIS3D.Layer.MapLayer.prototype._getOfflineBaseLayer = function() {
	return new Cesium.UrlTemplateImageryProvider({
		url: this.url,
		credit: this.name,
		minimumLevel: this._minimumLevel,
		maximumLevel: this._maximumLevel
	});
};

NPGIS3D.inherits(NPGIS3D.Layer.MapLayer, NPGIS3D.Layer);
/**
 * 天地图图层
 * @requires NPGIS3D.Layer.MapLayer.js
 * @class: NPGIS3D.Layer.TDTLayer
 * @extends NPGIS3D.Layer.MapLayer
 *
 * @constructor
 * @param url - 服务地址,如果为 undefined 加载在线服务,必须
 * @param name - 名称,必须
 * @param opts  
 */
NPGIS3D.Layer.TDTLayer = function(url, name, opts) {
	'use strict';

	NPGIS3D.Layer.MapLayer.call(this, url, name, opts, 'TDTLayer');
};

// 在线
NPGIS3D.Layer.TDTLayer.prototype._getOnlineBaseLayer = function(style) {
	var layers = [];

	if (Cesium.defined(style)) {
		this._baseMapType = style;
	} else {
		this._baseMapType = NPGIS3D.BaseMap.TDT_AERIAL_WITH_LABELS;
	}
	
	switch (style) {
		case NPGIS3D.BaseMap.TDT_AERIAL:
			layers[0] = this._getAerialLayer();
			break;
		case NPGIS3D.BaseMap.TDT_ROAD:
			layers[0] = this._getRoadLayer();
			break;
		case NPGIS3D.BaseMap.TDT_ROAD_WITH_LABELS:
			layers[0] = this._getRoadLayer();
			layers[1] = this._getLabelsLayer();
			break;
		default:
			layers[0] = this._getAerialLayer();
			layers[1] = this._getLabelsLayer();
			break;
	}

	return layers;
};

// 标注图层
NPGIS3D.Layer.TDTLayer.prototype._getLabelsLayer = function() {
	return new Cesium.WebMapTileServiceImageryProvider({
		url: 'http://{s}.tianditu.com/cia_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default.jpg',
		layer: 'img',
		style: 'default',
		format: 'tiles',
		tileMatrixSetID: 'w',
		credit: this.name,
		subdomains: ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7'],
		maximumLevel: 18
	});
};

// 影像图层
NPGIS3D.Layer.TDTLayer.prototype._getAerialLayer = function() {
	return new Cesium.WebMapTileServiceImageryProvider({
		url: 'http://{s}.tianditu.com/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles',
		layer: 'img',
		style: 'default',
		format: 'tiles',
		tileMatrixSetID: 'w',
		credit: this.name,
		subdomains: ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7'],
		maximumLevel: 18
	});
};

// 道路图层
NPGIS3D.Layer.TDTLayer.prototype._getRoadLayer = function() {
	return new Cesium.WebMapTileServiceImageryProvider({
		url: 'http://{s}.tianditu.com/vec_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=vec&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles',
		layer: 'img',
		style: 'default',
		format: 'tiles',
		tileMatrixSetID: 'w',
		credit: this.name,
		subdomains: ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7'],
		maximumLevel: 18
	});
};

NPGIS3D.inherits(NPGIS3D.Layer.TDTLayer, NPGIS3D.Layer.MapLayer);
/**
 * google地图图层
 * @requires NPGIS3D.Layer.MapLayer.js
 * @class: NPGIS3D.Layer.GoogleLayer
 * @extends NPGIS3D.Layer.MapLayer
 *
 * @constructor
 * @param url - 服务地址,如果为 undefined 加载在线服务,必须
 * @param name - 名称,必须
 * @param opts  
 */
NPGIS3D.Layer.GoogleLayer = function(url, name, opts) {
	'use strict';

	NPGIS3D.Layer.MapLayer.call(this, url, name, opts, 'GoogleLayer');
};

// 在线
NPGIS3D.Layer.GoogleLayer.prototype._getOnlineBaseLayer = function() {
	var style = this._options.style,
		layer;

	if (Cesium.defined(style)) {
		this._baseMapType = style;
	} else {
		this._baseMapType = NPGIS3D.BaseMap.GOOGLE_AERIAL;
	}

	switch (style) {
		case NPGIS3D.BaseMap.GOOGLE_ROAD:
			layer = this._getRoadLayer();
			break;
		default:
			layer = this._getAerialLayer();
			break;
	}

	return layer;
};

// 在线卫星图
NPGIS3D.Layer.GoogleLayer.prototype._getAerialLayer = function() {
	return new Cesium.UrlTemplateImageryProvider({
		url: 'http://{s}.google.cn/vt/lyrs=y@177000000&,highlight:0x35f05296e7142cb9:0xb9625620af0fa98a@1|style:maps&hl=zh-CN&gl=CN&x={x}&y={y}&z={z}&s=Galil&src=app',
		credit: this.name,
		subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
		minimumLevel: this._minimumLevel,
		maximumLevel: this._maximumLevel
	});
};

// 在线矢量图
NPGIS3D.Layer.GoogleLayer.prototype._getRoadLayer = function() {
	return new Cesium.UrlTemplateImageryProvider({
		url: 'http://{s}.google.cn/vt?pb=!1m4!1m3!1i{z}!2i{x}!3i{y}!2m3!1e0!2sm!3i285000000!3m9!2szh-CN!3sCN!5e18!12m1!1e47!12m3!1e37!2m1!1ssmartmaps!4e0',
		credit: this.name,
		subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
		minimumLevel: this._minimumLevel,
		maximumLevel: this._maximumLevel
	});
};

NPGIS3D.inherits(NPGIS3D.Layer.GoogleLayer, NPGIS3D.Layer.MapLayer);
/**
 * bing 地图图层
 * @requires NPGIS3D.Layer.MapLayer.js
 * @class NPGIS3D.Layer.GoogleLayer
 * @extends NPGIS3D.Layer.MapLayer
 *
 * @constructor
 * @param url - 服务地址,如果为 undefined 加载在线服务,必须
 * @param name - 名称,必须
 * @param opts 
 */
NPGIS3D.Layer.BingLayer = function(url, name, opts) {
    'use strict';

    NPGIS3D.Layer.MapLayer.call(this, url, name, opts, 'BingLayer');
};

// 在线
NPGIS3D.Layer.BingLayer.prototype._getOnlineBaseLayer = function() {
	var style = this._options.style;

	if (Cesium.defined(style)) {
		this._baseMapType = style;
	} else {
		this._baseMapType = style = NPGIS3D.BaseMap.BING_AERIAL;
	}

	return new Cesium.BingMapsImageryProvider({
		url: '//dev.virtualearth.net',
		key: 'AnnJBLmScQLGhCET-i0R2hNlhBsnyR2pC2EXe4zCJrgWIIqbFToRle3Xwbiig6wK',
		mapStyle: style
	});
};

NPGIS3D.inherits(NPGIS3D.Layer.BingLayer, NPGIS3D.Layer.MapLayer);
/**
 * 高德图层
 * @requires NPGIS3D.Layer.MapLayer.js
 * @class NPGIS3D.Layer.GaoDeLayer
 * @extends NPGIS3D.Layer.MapLayer
 *
 * @constructor
 * @param url - 服务地址,如果为 undefined 加载在线服务,必须
 * @param name - 名称,必须
 * @param opts 
 */
NPGIS3D.Layer.GaoDeLayer = function(url, name, opts) {
	'use strict';
	
	NPGIS3D.Layer.MapLayer.call(this, url, name, opts, 'GaoDeLayer');
};

// 在线
NPGIS3D.Layer.GaoDeLayer.prototype._getOnlineBaseLayer = function() {
	var style = this._options.style,
		layer;

	if (Cesium.defined(style)) {
		this._baseMapType = style;
	} else {
		this._baseMapType = NPGIS3D.BaseMap.AMAP_AERIAL;
	}

	switch (style) {
		case NPGIS3D.BaseMap.AMAP_ROAD:
			layer = this._getRoadLayer();
			break;
		default:
			layer = this._getAerialLayer();
			break;
	}

	return layer;
};

// 在线卫星图
NPGIS3D.Layer.GaoDeLayer.prototype._getAerialLayer = function() {
	return new Cesium.UrlTemplateImageryProvider({
		url: 'http://{s}.is.autonavi.com/appmaptile??lang=zh_cn&size=1&scale=1&style=6&L={z}&Z={z}&Y={y}&X={x}',
		credit: this.name,
		subdomains: ['webst01', 'webst02', 'webst03', 'webst04'],
		tilingScheme: new Cesium.WebMercatorTilingScheme(),
		maximumLevel: 18
	});
};

// 在线矢量图
NPGIS3D.Layer.GaoDeLayer.prototype._getRoadLayer = function() {
	return new Cesium.UrlTemplateImageryProvider({
		url: 'http://{s}.is.autonavi.com/appmaptile??lang=zh_cn&size=1&scale=1&style=7&L={z}&Z={z}&Y={y}&X={x}',
		credit: this.name,
		subdomains: ['webrd01', 'webrd02', 'webrd03', 'webrd04'],
		tilingScheme: new Cesium.WebMercatorTilingScheme(),
		maximumLevel: 18
	});
	// return new Cesium.MapboxImageryProvider({
	// 	 mapId: 'mapbox.streets',
	// 	 accessToken: 'pk.eyJ1IjoiYW5hbHl0aWNhbGdyYXBoaWNzIiwiYSI6ImNpd204Zm4wejAwNzYyeW5uNjYyZmFwdWEifQ.7i-VIZZWX8pd1bTfxIVj9g'
	// });
};
NPGIS3D.inherits(NPGIS3D.Layer.GaoDeLayer, NPGIS3D.Layer.MapLayer);
/**
 * 覆盖物图层
 * @requires NPGIS3D.Layer.js
 * @class NPGIS3D.Layer.OverlayLayer
 * @extends NPGIS3D.Layer
 *
 * @constructor
 * @param {string} name - 图层名称,必须
 */
NPGIS3D.Layer.OverlayLayer = function(name) {
	'use strict';
	NPGIS3D.Layer.call(this);

	this.layerType = 'OverlayLayer';

	if (!Cesium.defined(name)) {
		throw new NPGIS3D.DeveloperError('NPGIS3D.Layer.OverlayLayer', 'name 是必须项!');
	}

	name = NPGIS3D.NPUtil.StringTrim(name);

	if (name === '') {
		throw new NPGIS3D.DeveloperError('NPGIS3D.Layer.OverlayLayer', 'name 不能为空!');
	}

	this.name = name;

	this.dataSource = new Cesium.CustomDataSource(this.name);
};

/**
 * 图层显示
 */
NPGIS3D.Layer.OverlayLayer.prototype.show = function() {
	this.dataSource.show = true;
};

/**
 * 图层隐藏
 */
NPGIS3D.Layer.OverlayLayer.prototype.hide = function() {
	this.dataSource.show = false;
};

/**
 * 添加覆盖物
 * @param {NPGIS3D.Overlay} overlay - 覆盖物,必须
 */
NPGIS3D.Layer.OverlayLayer.prototype.addOverlay = function(overlay) {
	if (!Cesium.defined(overlay)) {
		throw new NPGIS3D.DeveloperError('NPGIS3D.Layer.OverlayLayer', 'addOverlay() 参数 overlay 是必须项!');
	}

	var temp = overlay._entity || overlay;
	this.dataSource.entities.add(temp);
};

/**
 * 删除指定的覆盖物
 * @param {NPGIS3D.Overlay} overlay - 覆盖物,必须
 */
NPGIS3D.Layer.OverlayLayer.prototype.removeOverlay = function(overlay) {
	if (!Cesium.defined(overlay)) {
		throw new NPGIS3D.DeveloperError('NPGIS3D.Layer.OverlayLayer', 'removeOverlay() 参数 overlay 是必须项!');
	}

	if (this.dataSource.entities.contains(overlay._entity)) {
		overlay = overlay._entity || overlay;
		if (!this.dataSource.entities.remove(overlay)) {
			throw new NPGIS3D.DeveloperError('NPGIS3D.Layer.OverlayLayer', 'removeOverlay() 参数 overlay 删除失败!');
		}
	}
};

/**
 * 删除所有覆盖物
 */
NPGIS3D.Layer.OverlayLayer.prototype.removeAllOverlay = function() {
	this.dataSource.entities.removeAll();
};

/**
 * 根据 ID 获取 overlay
 * @param {string} id - 覆盖物 ID,必须
 * @return {NPGIS3D.Overlay}
 */
NPGIS3D.Layer.OverlayLayer.prototype.getOverlayById = function(id) {
	if (!Cesium.defined(id)) {
		throw new NPGIS3D.DeveloperError('NPGIS3D.Layer.OverlayLayer', 'getOverlayById() 参数 id 是必须项!');
	}

	id = NPGIS3D.NPUtil.StringTrim(id);

	if (id === '') {
		throw new NPGIS3D.DeveloperError('NPGIS3D.Layer.OverlayLayer', 'getOverlayById() 参数 id 不能为空!');
	}

	return this.dataSource.entities.getById(id);
};

/**
 * 根据 ID 删除 overlay
 * @param {string} id - 覆盖物 ID,必须
 */
NPGIS3D.Layer.OverlayLayer.prototype.removeOverlayById = function(id) {
	if (!Cesium.defined(id)) {
		throw new NPGIS3D.DeveloperError('NPGIS3D.Layer.OverlayLayer', 'removeOverlayById() id 是必须项!');
	}

	id = NPGIS3D.NPUtil.StringTrim(id);

	if (id === '') {
		throw new NPGIS3D.DeveloperError('NPGIS3D.Layer.OverlayLayer', 'removeOverlayById() id 不能为空!');
	}

	if (!this.dataSource.entities.removeById(id)) {
		throw new NPGIS3D.DeveloperError('NPGIS3D.Layer.OverlayLayer', 'removeOverlayById() 删除失败!');
	}
};

/** 
 * destroy
 *
 */
NPGIS3D.Layer.OverlayLayer.prototype.destroy = function() {
	this.layerType = null;
	this.name = null;
	this.dataSource = null;
};

NPGIS3D.inherits(NPGIS3D.Layer.OverlayLayer, NPGIS3D.Layer);
/**
 * 聚合图层
 * @requires NPGIS3D.Layer.js
 * @class NPGIS3D.Layer.ClusterLayer
 * @extends NPGIS3D.Layer
 *
 * @constructor
 * @param {string} name - 图层名称,必须
 */
NPGIS3D.Layer.ClusterLayer = function(name,opts) {
	'use strict';
	NPGIS3D.Layer.OverlayLayer.call(this,name);

	this.layerType = 'ClusterLayer';

	// if (!Cesium.defined(name)) {
	// 	throw new NPGIS3D.DeveloperError('NPGIS3D.Layer.ClusterLayer', 'name 是必须项!');
	// }

	// name = NPGIS3D.NPUtil.StringTrim(name);

	// if (name === '') {
	// 	throw new NPGIS3D.DeveloperError('NPGIS3D.Layer.ClusterLayer', 'name 不能为空!');
	// }

	// this.name = name;

	// this.dataSource = new Cesium.CustomDataSource(this.name);

    this.getImage = opts && opts.getImage?opts.getImage:function(){
        var host = NPGIS3D.NPUtil.getHost() + 'lib/Cesium/Assets';
        return host+"/img/RedPin1LargeB.png";
    };
    this.clusterStyle = opts && opts.clusterStyle?opts.clusterStyle:{
        lableFont:"20px 宋体",
        lableFillColor:"#FFFFFF",
        lableOutlineColor:"#FFFFFF",
        lableOutlineWidth:1,
        lablePixelOffset:{
            x:0,
            y:-32
        },
        imageVertical:1//0中心点居中，1底部中心居中
    };
    this.getText = opts && opts.getText?opts.getText:function(count){
        return count.toString();
    };

    this.dataSource.clustering.enabled = true;
    this.dataSource.clustering.pixelRange = opts&&opts.distance?opts.distance:80;
    this.dataSource.clustering.minimumClusterSize = opts&&opts.threshold?opts.threshold:2;
};
NPGIS3D.inherits(NPGIS3D.Layer.ClusterLayer, NPGIS3D.Layer.OverlayLayer);
NPGIS3D.Layer.ClusterLayer.prototype._customStyle = function(){
    var self = this;
    var removeListener = this.dataSource.clustering.clusterEvent.addEventListener(function(clusteredEntities, cluster) {
        var clusterStyle = self.clusterStyle;
        if(clusterStyle.lableFont){
            cluster.label.font = clusterStyle.lableFont;
        }
        if(clusterStyle.lableFillColor){
            var fc = NPGIS3D.NPUtil.hexToRgb(clusterStyle.lableFillColor);
            cluster.label.fillColor = {
                alpha:1,
                blue:fc[1],
                green:fc[2],
                red:fc[0]
            };
        }
        if(clusterStyle.lableOutlineColor){
            var oc = NPGIS3D.NPUtil.hexToRgb(clusterStyle.lableOutlineColor);
            cluster.label.fillColor = {
                alpha:1,
                blue:oc[1],
                green:oc[2],
                red:oc[0]
            };
        }
        if(clusterStyle.lableOutlineWidth){
            cluster.label.outlineWidth = clusterStyle.lableOutlineWidth;
        }
        if(clusterStyle.lablePixelOffset){
            cluster.label.pixelOffset = clusterStyle.lablePixelOffset;
        }
        cluster.label.horizontalOrigin = Cesium.HorizontalOrigin.CENTER;
        cluster.label.verticalOrigin = Cesium.VerticalOrigin.CENTER;
        cluster.label.show = true;
        cluster.label.text = self.getText(clusteredEntities.length);
        cluster.billboard.show = true;
        cluster.billboard.verticalOrigin = clusterStyle.imageVertical?Cesium.VerticalOrigin.BOTTOM:Cesium.VerticalOrigin.CENTER;
        cluster.billboard.image = self.getImage(clusteredEntities.length,cluster);
    });
    // force a re-cluster with the new styling
    var pixelRange = this.dataSource.clustering.pixelRange;
    this.dataSource.clustering.pixelRange = 0;
    this.dataSource.clustering.pixelRange = pixelRange;
};
/**
 * 添加覆盖物
 * @param {NPGIS3D.Overlay.Marker[]} markers - 覆盖物数组,必须
 */
NPGIS3D.Layer.ClusterLayer.prototype.addOverlays = function(markers){
    for(var i=0;i<markers.length;i++){
        this.dataSource.entities.add(markers[i]._entity);
    }
};
/**
 * 地形图层
 * @requires NPGIS3D.Layer.TerrainLayer.js
 * @class NPGIS3D.Layer.TerrainLayer
 *
 * @constructor
 * @param url - 服务地址,如果为 undefined 加载在线服务,必须
 * @param name - 名称,必须
 * @param opts 
 */
NPGIS3D.Layer.TerrainLayer = function(url, opts) {
	'use strict';
	this._layer = new Cesium.CesiumTerrainProvider({
		url: url,
		requestVertexNormals: false
	});
};
/**
 * 热力图
 * @requires HeatMapLayer.js
 * @class NAPMAP3D.HeatMapLayer
 * 
 * @constructor
 * @param {NPGIS3D.MAP3D} viewer 必须
 * @param {Object} bbopt 必须  
 * @param {Number} bbopt.north north 必须
 * @param {Number} bbopt.east east 必须
 * @param {Number} bbopt.south south 必须
 * @param {Number} bbopt.west west 必须
 * @param {Object} heatOpt 热力图配置对象
 * @see {@linkcode http://localhost:807/3dmap/gis_manager/gis_demo.html#demos/Characteristic/createHeatMap.html| HeatMapLayer Demo[内网]}
 * @see {@linkcode http://map.netposa.com:9500/3dmap/gis_manager/gis_demo.html#demos/Characteristic/createHeatMap.html| HeatMapLayer Demo[外网]}
 */
NPGIS3D.HeatMapLayer = function(viewer, bbopt, heatOpt) {

    var heatMap = CesiumHeatmap.create(viewer.viewer, bbopt || {
        north: 40.908179104039016,
        east: 115.91325577059447,
        south: 30.008179104039016,
        west: 100.01325577059447
    }, heatOpt || {
        opacity: 0.3,
        visible: true,
        radius: 10,
    });
    /**
     * 设置数据
     * @param {Number} min the minimum allowed value for the data values
     * @param {Number} max the maximum allowed value for the data values
     * @param {Object[]} data an array of data points in WGS84 coordinates and values like { x:lon, y:lat, value }
     */
    this.setWGS84Data = function(min, max, points) {
        heatMap.setWGS84Data(min || 0, max || 300, points);
    }
}

/**
 * bing 地图图层
 * @requires NPGIS3D.Layer.S3MLayer.js
 * @class NPGIS3D.Layer.S3MLayer
 *
 * @constructor
 * @param url - 服务地址,如果为 undefined 加载在线服务,必须
 * @param name - 名称,必须
 * @param opts 
 */
NPGIS3D.Layer.S3MLayer = function(url, name, opts) {
    'use strict';
	this.url = url;
	this.name = name;
	this.opts = opts;
	this.events = {};
    NPGIS3D.Layer.call(this);
};
/**
 * 设置图层的可见性
 * @param visible - 是否显示 bool
 */
NPGIS3D.Layer.S3MLayer.prototype.setVisible = function(visible){
	if(this.obj){
		this.obj.visible = visible;
	}
};
/**
 * 设置模型的可见性
 * @param ids - 模型id 数组
 * @param visible - 是否显示 bool
 */
NPGIS3D.Layer.S3MLayer.prototype.setObjsVisible = function(ids,visible){
	if(this.obj){
		this.obj.setObjsVisible(ids,visible);
	}
};
/**
 * 设置模型图层的可选择性
 * @param enable - 模型图层是否可选择
 */
NPGIS3D.Layer.S3MLayer.prototype.setEnableSelect = function(enable){
	if(this.obj){
		this.obj.selectEnabled = enable;
	}
};
/**
 * 设置选择器的颜色
 * @param color - 颜色
 */
NPGIS3D.Layer.S3MLayer.prototype.setSelectColor = function(color){
	if(this.obj){
		this.obj.selectEnabled = color;
	}
};
/**
 * 设置选择器的颜色
 * @param color - 颜色
 */
NPGIS3D.Layer.S3MLayer.prototype.getPosition = function(){
	if(this.obj){
		var position = this.obj._position;
		var geoPoint = NPGIS3D.NPCoordinate.cartesianToPointGeo(position,true);
		return geoPoint;
	}
};
/**
 * 设置指定模型的颜色
 * @param ids - 模型ID数组
 * @param color - 颜色值
 */
NPGIS3D.Layer.S3MLayer.prototype.setObjsColor = function(ids,color){
	if(this.obj){
		this.obj.setObjsColor(ids,color);
	}
};
/**
 * 取消指定模型的颜色
 * @param ids - 模型ID数组
 */
NPGIS3D.Layer.S3MLayer.prototype.removeObjsColor = function(ids){
	if(this.obj){
		this.obj.removeObjsColor(ids);
	}
};
/**
 * 设置图层的选择对象
 * @param id - 模型ID
 */
NPGIS3D.Layer.S3MLayer.prototype.setSelection = function(id){
	if(this.obj){
		this.obj.setSelection(id);
	}
};
/**
 * 清除选择集信息
 */
NPGIS3D.Layer.S3MLayer.prototype.releaseSelection = function(){
	if(this.obj){
		this.obj.releaseSelection();
	}
};
/**
 * 获取选择集信息
 */
NPGIS3D.Layer.S3MLayer.prototype.getSelection = function(){
	if(this.obj){
		return this.obj.getSelection();
	}
	return [];
};
/**
 * 增加压平面
 * @param point3ds - 三维坐标串数组
 * @param name - 压平对象名称
 */
NPGIS3D.Layer.S3MLayer.prototype.addFlattenRegion = function(point3ds,name){
	if(this.obj){
		var positions = [];
		var postion = Cesium.Ellipsoid.WGS84.cartesianToCartographic(S3MLayer.obj._position);
		for (var index = 0; index < point3ds.length; index++) {
			var element = point3ds[index];
			positions.push(element.lon,element.lat,element.h+postion.height);
		}
		this.obj.addFlattenRegion({
			position:positions,
			name:name
		});
	}
};
/**
 * 清除所有压平面对象
 */
NPGIS3D.Layer.S3MLayer.prototype.removeAllFlattenRegion = function(){
	if(this.obj){
		this.obj.removeAllFlattenRegion();
		this.obj._flattenRegions._hash = {};
	}
};
/**
 * 清除指定名称的压平面对象
 * @param name - 平面名称
 */
NPGIS3D.Layer.S3MLayer.prototype.removeFlattenRegion = function(name){
	if(this.obj){
		var isRemove =  this.obj.removeFlattenRegion(name);
		this.obj._flattenRegions._hash[name] = null;
		return isRemove;
	}
};
/**
 * 设置BOX裁剪区域
 * @param box - 设置要采集的范围object对象{x,y,z},分别代表盒子的长宽高
 * @param point3D - 空间三维位置点，表示要裁剪盒子的中心点位置 
 * @param clipMode - 裁剪模式，string 类型，指定裁剪模式。 裁剪模式包括以下几类： 
		  clip_behind_any_plane：裁剪掉位于任何裁剪面后面的部分。 
		  clip_behind_all_plane：裁剪掉位于所有裁剪面后面的部分。 
		  only_keep_line：只保留裁剪线，裁剪掉其他部分。
 */
NPGIS3D.Layer.S3MLayer.prototype.setCustomClipBox = function(box,point3D,clipMode){
	if(this.obj){
		var opts = {
			dimensions: new Cesium.Cartesian3(box.x, box.y, box.z),
			position: Cesium.Cartesian3.fromDegrees(point3D.lon, point3D.lat, point3D.h),
			clipMode: clipMode
		}
		return this.obj.setCustomClipBox(opts);
	}
};
/**
 * 清除裁剪区域
 */
NPGIS3D.Layer.S3MLayer.prototype.clearCustomClipBox = function(){
	if(this.obj){
		this.obj.clearCustomClipBox();
	}
};
NPGIS3D.Layer.S3MLayer.prototype.addEventListener = function(event,callBack){
	this.events[event] = callBack;
};
NPGIS3D.Layer.S3MLayer.prototype.removeEventListener = function(event){
	this.events[event] = null;
	delete this.events[event];
};
NPGIS3D.inherits(NPGIS3D.Layer.S3MLayer, NPGIS3D.Layer);
/**
 * 覆盖物基类
 * @requires NPGIS3D.js
 * @class NPGIS3D.Overlay
 * @constructor
 * @param {String} name - 名称,必须
 * @param {String} id -id,必须
 */
NPGIS3D.Overlay = function(name, id) {
    'use strict';
    this._entity = new Cesium.Entity({
        show: true,
        name: name//,
        //id: id || NPGIS3D.NPUtil.UUID()
    });
    this.events = {};
    this._entity.overlay = this;
    this.optsValidation = function(opts) {
        if (!NPGIS3D.NPUtil.isObject(opts)) {

        };
    };

    this._setPosition = function(point) {
        if (!NPGIS3D.NPUtil.isObject(point)) {
            throw new NPGIS3D.DeveloperError('NPGIS3D.Overlay.Point', '参数 point 不正确!');
        }
        var newPosition = NPGIS3D.NPCoordinate.coordinateTransByBasemap(point.lon, point.lat);
        this._entity.position = Cesium.Cartesian3.fromDegrees(newPosition.lon, newPosition.lat,point.h);
    }

};
/**
 * 显示
 */
NPGIS3D.Overlay.prototype.show = function() {
    this._entity.show = true;
};
/**
 * 隐藏
 */
NPGIS3D.Overlay.prototype.hide = function() {
    this._entity.show = false;
};
/**
 * 设置位置
 * @param {NPGIS3D.Geometry.Point} val - 位置坐标
 */
NPGIS3D.Overlay.prototype.setPosition = function(val) {
    if (Cesium.defined(val)) {
        var z = val.h;
        val = NPGIS3D.NPUtil.coordinateTransByBasemap(val.lon, val.lat);
        this._entity['position'] = Cesium.Cartesian3.fromDegrees(val.lon, val.lat,z);
    }
};
/**
 * 获取位置
 */
NPGIS3D.Overlay.prototype.getPosition = function() {
    var e = this._entity['position'];
    if (Cesium.defined(e)) {
        e = e.getValue();
        var l = Cesium.Cartographic.fromCartesian(e);
        e = NPGIS3D.NPUtil.CoordinateHelper.coordinateFromBasemap(Cesium.Math.toDegrees(l.longitude), Cesium.Math.toDegrees(l.latitude));
        e.h = l.height
        return e;
    }
};
/**
 * 设置描述信息
 */
NPGIS3D.Overlay.prototype.setDescription = function(html) {
    this._entity['description'] = html;
};
/**
 * 注册事件
 * @event
 * @param {String} event 
 * @param {Function} callback  
 */
NPGIS3D.Overlay.prototype.addEventLinsener = function(event, callback) {
    this.events[event] = callback;
};
/**
 * 取消事件
 * @event
 * @param {String} event 
 */
NPGIS3D.Overlay.prototype.removeEventLinsener = function(event) {
    if (this.events[event]) {
        delete this.events[event];
    }
};

/**
 * point 覆盖物
 * @requires NPGIS3D.Overlay.js
 * @class NPGIS3D.Overlay.Point
 * @extends NPGIS3D.Overlay
 *
 * @constructor
 * @param {NPGIS3D.Geometry.Point} point - 位置,必须
 * @param {Object} opts  -   属性 
 * @param {NPGIS3D.Color} opts.color - 填充颜色，默认 RED
 * @param {Number} opts.pixelSize - 大小，默认 16px
 * @param {NPGIS3D.Color} opts.outlineColor - 边框颜色，默认 BLACK
 * @param {Number} opts.outlineWidth - 边框宽度，默认 0
 * @param {Boolean} opts.show - 是否显示，默认 true 
 * @see {@linkcode http://localhost:807/3dmap/gis_manager/gis_demo.html#demos/Overlay/Point.html| Point Demo[内网]}
 * @see {@linkcode http://map.netposa.com:9500/3dmap/gis_manager/gis_demo.html#demos/Overlay/Point.html| Point Demo[外网]}
 */
NPGIS3D.Overlay.Point = function(point, opts) {
    'use strict';

    this._CESIUMTYPE = 'point';
    opts = NPGIS3D.NPUtil.extend(opts, {
        id: NPGIS3D.NPUtil.UUID(),
        color: Cesium.Color.RED,
        pixelSize: 10,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 0,
        show: true
    });
    NPGIS3D.Overlay.call(this);
    this._setPosition(point);
    this._entity[this._CESIUMTYPE] = new Cesium.PointGraphics(opts);

};

/*
 * 获取
 */
// NPGIS3D.Overlay.Point.prototype.getColor = function() {
//     var e = this._entity[this._CESIUMTYPE]['color'];
//     if (Cesium.defined(e)) {
//         return e.getValue();
//     }
// };
/**
 * 设置color
 */
NPGIS3D.Overlay.Point.prototype.setColor = function(val) {
    if (Cesium.defined(val)) {
        this._entity[this._CESIUMTYPE]['color'] = val;
    }
};

/*
 * 获取pixelSize
 */
NPGIS3D.Overlay.Point.prototype.getPixelsize = function() {
    var e = this._entity[this._CESIUMTYPE]['pixelSize'];
    if (Cesium.defined(e)) {
        return e.getValue();
    }
};
/*
 * 设置pixelSize
 */
NPGIS3D.Overlay.Point.prototype.setPixelsize = function(val) {
    if (Cesium.defined(val)) {
        this._entity[this._CESIUMTYPE]['pixelSize'] = val;
    }
};

/*
 * 获取
 */
// NPGIS3D.Overlay.Point.prototype.getOutlinecolor = function() {
//     var e = this._entity[this._CESIUMTYPE]['outlineColor'];
//     if (Cesium.defined(e)) {
//         return e.getValue();
//     }
// };
/**
 * 设置outlineColor
 * @param {NPGIS3D.Color} outlineColor
 */
NPGIS3D.Overlay.Point.prototype.setOutlinecolor = function(outlineColor) {
    if (Cesium.defined(val)) {
        this._entity[this._CESIUMTYPE]['outlineColor'] = outlineColor;
    }
};

/**
 * 获取outlineWidth
 */
NPGIS3D.Overlay.Point.prototype.getOutlinewidth = function() {
    var e = this._entity[this._CESIUMTYPE]['outlineWidth'];
    if (Cesium.defined(e)) {
        return e.getValue();
    }
};
/**
 * 设置outlineWidth
 * @param {Number} outlineWidth
 */
NPGIS3D.Overlay.Point.prototype.setOutlinewidth = function(outlineWidth) {
    if (Cesium.defined(val)) {
        this._entity[this._CESIUMTYPE]['outlineWidth'] = outlineWidth;
    }
};

/**
 * 获取是否显示
 * @return {Boolean}
 */
NPGIS3D.Overlay.Point.prototype.getShow = function() {
    var e = this._entity[this._CESIUMTYPE]['show'];
    if (Cesium.defined(e)) {
        return e.getValue();
    }
};
/**
 * 设置是否显示
 * @param {Boolean}
 */
NPGIS3D.Overlay.Point.prototype.setShow = function(val) {
    if (Cesium.defined(val)) {
        this._entity[this._CESIUMTYPE]['show'] = val;
    }
};
NPGIS3D.inherits(NPGIS3D.Overlay.Point, NPGIS3D.Overlay);

/**
 * marker 覆盖物
 * @requires NPGIS3D.Overlay.js
 * @class NPGIS3D.Overlay.Marker
 * @extends NPGIS3D.Overlay
 *
 * @constructor
 * @param {NPGIS3D.Geometry.Point} point - 位置,必须
 * @param {Object} opts   - 属
 * @param {Number} opts.image - 图片路径，默认 ../Assets/Textures/maki/grepin.png
 * @param {Number} opts.width - 宽度，默认 32
 * @param {Number} opts.height -  高度，默认 32
 * @see {@linkcode http://localhost:807/3dmap/gis_manager/gis_demo.html#demos/Overlay/Marker.html| Marker Demo[内网]}
 * @see {@linkcode http://map.netposa.com:9500/3dmap/gis_manager/gis_demo.html#demos/Overlay/Marker.html| Marker Demo[外网]}
 */
NPGIS3D.Overlay.Marker = function(point, opts) {
    'use strict';
    this._CESIUMTYPE = 'billboard';
    this.geometry = point;
    var buildGraOptions = function() {
        opts = NPGIS3D.NPUtil.extend(opts, {
            id: NPGIS3D.NPUtil.UUID(),
            image: NPGIS3D.getScriptLocation()+'/lib/Cesium/Assets/Textures/maki/grepin.png',
            isButtomCenter:true,
            width: 32,
            height: 32
        });
        var image = opts.image || NPGIS3D.getScriptLocation()+'/lib/Cesium/Assets/Textures/maki/grepin.png',
            width = opts.width || 32,
            height = opts.height ||32,
            opt;
        opt = {
            image: image,
            width: width,
            height: height
        };
        if(opts.isButtomCenter){
            opt.verticalOrigin = Cesium.VerticalOrigin.BOTTOM;
        }
        return opt;
    };
    var labelGraOptions = function(){
        var labelOpts = {};
        if(opts.labelText&&opts.labelText!="")
        {
            labelOpts.text = opts.labelText;
        }
        if(opts.labelColor){
            labelOpts.outlineColor = opts.labelColor;
        }
        if(opts.labelFont){
            labelOpts.font = opts.labelFont;
        }
        if(opts.labelPixelOffset){
            labelOpts.pixelOffset = opts.labelPixelOffset;
        }
        return labelOpts;
    };
    var opt = buildGraOptions();
    NPGIS3D.Overlay.call(this,"marker",opts.id);
    this._setPosition(point);
    this._entity[this._CESIUMTYPE] = opt;
    this._entity.label = labelGraOptions();
};

/**
 * 获取缩放比例
 */
NPGIS3D.Overlay.Marker.prototype.getScale = function() {
    var e = this._entity[this._CESIUMTYPE]['scale'];
    if (Cesium.defined(e)) {
        return e.getValue();
    }
};
/**
 * 设置缩放比例
 */
NPGIS3D.Overlay.Marker.prototype.setScale = function(val) {
    if (Cesium.defined(val)) {
        this._entity[this._CESIUMTYPE]['scale'] = val;
    }
}

/**
 * 获取旋转角度
 */
NPGIS3D.Overlay.Marker.prototype.getRotation = function() {
    var e = this._entity[this._CESIUMTYPE]['rotation'];
    if (Cesium.defined(e)) {
        return Cesium.Math.toDegrees(e.getValue());
    }
};
/**
 * 设置旋转角度
 */
NPGIS3D.Overlay.Marker.prototype.setRotation = function(val) {
    if (Cesium.defined(val)) {
        this._entity[this._CESIUMTYPE]['rotation'] = Cesium.Math.toRadians(Number(val));
    }
};


/**
 * 获取图片
 */
NPGIS3D.Overlay.Marker.prototype.getImage = function() {
    var e = this._entity[this._CESIUMTYPE]['image'];
    if (Cesium.defined(e)) {
        return e.getValue();
    }
};
/**
 * 设置图片
 */
NPGIS3D.Overlay.Marker.prototype.setImage = function(val) {
    if (Cesium.defined(val)) {
        this._entity[this._CESIUMTYPE]['image'] = val;
    }
}

/**
 * 获取位置信息
 */
NPGIS3D.Overlay.Marker.prototype.getPosition = function() {
    var e = this._entity[this._CESIUMTYPE]['position'];
    if (Cesium.defined(e)) {
        e = e.getValue();
        var l = Cesium.Cartographic.fromCartesian(e);
        e = NPGIS3D.NPUtil.CoordinateHelper.coordinateFromBasema(Cesium.Math.toDegrees(l.longitude), Cesium.Math.toDegrees(l.latitude));
        e.h = l.height
        return e;
    }
};
/**
 * 设置位置信息 val：{lon:0,lat:0}
 */
NPGIS3D.Overlay.Marker.prototype.setPosition = function(val) {
    if (Cesium.defined(val)) {
        val = NPGIS3D.NPCoordinate.coordinateTransByBasemap(val.lon, val.lat);
        this._entity[this._CESIUMTYPE]['position'] = Cesium.Cartesian3.fromDegrees(val.lon, val.lat);
    }
};


/**
 * 获取是否显示
 * @return {Boolean}
 */
NPGIS3D.Overlay.Marker.prototype.getShow = function() {
    var e = this._entity[this._CESIUMTYPE]['show'];
    if (Cesium.defined(e)) {
        return e.getValue();
    }
};
/**
 * 设置是否显示
 * @param {Boolean}
 */
NPGIS3D.Overlay.Marker.prototype.setShow = function(val) {
    if (Cesium.defined(val)) {
        this._entity[this._CESIUMTYPE]['show'] = val;
    }
}

/**
 * 获取Y轴对齐方式
 */
NPGIS3D.Overlay.Marker.prototype.getHorizontalorigin = function() {
    var e = this._entity[this._CESIUMTYPE]['horizontalOrigin'];
    if (Cesium.defined(e)) {
        return e.getValue();
    }
};
/**
 * 设置Y轴对齐方式
 */
NPGIS3D.Overlay.Marker.prototype.setHorizontalorigin = function(val) {
    if (Cesium.defined(val)) {
        this._entity[this._CESIUMTYPE]['horizontalOrigin'] = val;
    }
}

/**
 * 获取X轴对齐方式
 */
NPGIS3D.Overlay.Marker.prototype.getVerticalorigin = function() {
    var e = this._entity[this._CESIUMTYPE]['verticalOrigin'];
    if (Cesium.defined(e)) {
        return e.getValue();
    }
};
/**
 * 设置X轴对齐方式
 */
NPGIS3D.Overlay.Marker.prototype.setVerticalorigin = function(val) {
    if (Cesium.defined(val)) {
        this._entity[this._CESIUMTYPE]['verticalOrigin'] = val;
    }
}

/**
 * 获取图片宽度
 */
NPGIS3D.Overlay.Marker.prototype.getWidth = function() {
    var e = this._entity[this._CESIUMTYPE]['width'];
    if (Cesium.defined(e)) {
        return e.getValue();
    }
};
/**
 * 设置图片宽度
 */
NPGIS3D.Overlay.Marker.prototype.setWidth = function(val) {
    if (Cesium.defined(val)) {
        this._entity[this._CESIUMTYPE]['width'] = val;
    }
}

/**
 * 获取图片高度
 */
NPGIS3D.Overlay.Marker.prototype.getHeight = function() {
    var e = this._entity[this._CESIUMTYPE]['height'];
    if (Cesium.defined(e)) {
        return e.getValue();
    }
};
/**
 * 设置图片高度
 */
NPGIS3D.Overlay.Marker.prototype.setHeight = function(val) {
    if (Cesium.defined(val)) {
        this._entity[this._CESIUMTYPE]['height'] = val;
    }
};
/**
 * 设置标注的文案
 */
NPGIS3D.Overlay.Marker.prototype.setLabel = function(val,opts) {
    if (Cesium.defined(val)) {
        this._entity.label.text = val;
    }
    if(opts){
        if(opts.labelColor){
            this._entity.label.fillColor = opts.labelColor;
        }
        if(opts.labelFont){
            this._entity.label.font = opts.labelFont;
        }
        if(opts.labelPixelOffset){
            this._entity.label.pixelOffset = opts.labelPixelOffset;
        }
        if(opts.horizontalOrigin){
            this._entity.label.horizontalOrigin = opts.horizontalOrigin;
        }
        if(opts.verticalOrigin){
            this._entity.label.verticalOrigin = opts.verticalOrigin;
        }
        if(opts.labelStyle){
            this._entity.label.style = opts.labelStyle;
        }
        if(opts.outlineWidth){
            this._entity.label.outlineWidth = opts.outlineWidth;
        }
         if(opts.outlineColor){
            this._entity.label.outlineColor = opts.outlineColor;
        }
    }
}
NPGIS3D.inherits(NPGIS3D.Overlay.Marker, NPGIS3D.Overlay);

/**
 * label覆盖物
 * @requires NPGIS3D.Overlay.js
 * @class NPGIS3D.Overlay.Label
 * @extends NPGIS3D.Overlay
 *
 * @constructor
 * @param {NPGIS3D.Geometry.Point} point - 位置,必须
 * @param {Object} opts  -  属性
 * @param {String} opts.text -  文本信息，默认 netposa
 * @param {String} opts.font -  文本大小及字体，默认 24px Microsoft YaHei
 * @param {NPGIS3D.Color} opts.fillColor -  填充颜色，默认 RED
 * @param {NPGIS3D.Color} opts.outlineColor -  边线颜色，默认 BLACK
 * @param {Number} opts.outlineWidth -  边框宽度，默认 0
 * @param {Boolean} opts.show -  是否显示，默认 true
 * @param {Number} opts.scale -  缩放比例，默认 1
 * @param {Object} opts.pixelOffset -  X/Y 偏移量 默认值 {x : 0,y : 0}
 * @param {Number} opts.pixelOffset.x
 * @param {Number} opts.pixelOffset.y
 * @see {@linkcode http://localhost:807/3dmap/gis_manager/gis_demo.html#demos/Overlay/Label.html| Label Demo[内网]}
 * @see {@linkcode http://map.netposa.com:9500/3dmap/gis_manager/gis_demo.html#demos/Overlay/Label.html| Label Demo[外网]}
 */
NPGIS3D.Overlay.Label = function(point, opts) {
    'use strict';
    this._CESIUMTYPE = 'label';

    opts = NPGIS3D.NPUtil.extend(opts, {
        id: NPGIS3D.NPUtil.UUID(),
        text: 'netposa',
        font: '24px SimSun',
        style: NPGIS3D.LabelStyle.FILL_AND_OUTLINE,
        show: true,
        fillColor: NPGIS3D.Color.RED,
        outlineColor: NPGIS3D.Color.BLACK,
        outlineWidth: 1,
        scale: 1,
        eyeOffset:NPGIS3D.Size3D.ZERO,
        pixelOffset: NPGIS3D.Size.ZERO,
        horizontalOrigin: NPGIS3D.HorizontalOrigin.CENTER,
        verticalOrigin: NPGIS3D.VerticalOrigin.BOTTOM,
        heightReference: NPGIS3D.HeightReference.NONE
    });

    NPGIS3D.Overlay.call(this,"label");
    this._setPosition(point);
    this._entity[this._CESIUMTYPE] = new Cesium.LabelGraphics(opts);
};

/**
 * 获取文案
 */
NPGIS3D.Overlay.Label.prototype.getText = function() {
    var e = this._entity[this._CESIUMTYPE]['text'];
    if (Cesium.defined(e)) {
        return e.getValue();
    }
};
/**
 * 设置文案
 */
NPGIS3D.Overlay.Label.prototype.setText = function(val) {
    if (Cesium.defined(val)) {
        this._entity[this._CESIUMTYPE]['text'] = val;
    }
}

/**
 * 获取字体
 */
NPGIS3D.Overlay.Label.prototype.getFont = function() {
    var e = this._entity[this._CESIUMTYPE]['font'];
    if (Cesium.defined(e)) {
        return e.getValue();
    }
};
/**
 * 设置字体
 */
NPGIS3D.Overlay.Label.prototype.setFont = function(val) {
    if (Cesium.defined(val)) {
        this._entity[this._CESIUMTYPE]['font'] = val;
    }
}

/**
 * 获取outlineWidth
 */
NPGIS3D.Overlay.Label.prototype.getOutlinewidth = function() {
    var e = this._entity[this._CESIUMTYPE]['outlineWidth'];
    if (Cesium.defined(e)) {
        return e.getValue();
    }
};
/**
 * 设置outlineWidth
 */
NPGIS3D.Overlay.Label.prototype.setOutlinewidth = function(val) {
    if (Cesium.defined(val)) {
        this._entity[this._CESIUMTYPE]['outlineWidth'] = val;
    }
};

/**
 * 获取scale
 */
NPGIS3D.Overlay.Label.prototype.getScale = function() {
    var e = this._entity[this._CESIUMTYPE]['scale'];
    if (Cesium.defined(e)) {
        return e.getValue();
    }
};
/**
 * 设置scale
 */
NPGIS3D.Overlay.Label.prototype.setScale = function(val) {
    if (Cesium.defined(val)) {
        this._entity[this._CESIUMTYPE]['scale'] = val;
    }
};

/**
 * 获取是否显示
 */
NPGIS3D.Overlay.Label.prototype.getShow = function() {
    var e = this._entity[this._CESIUMTYPE]['show'];
    if (Cesium.defined(e)) {
        return e.getValue();
    }
};
/**
 * 设置是否显示
 */
NPGIS3D.Overlay.Label.prototype.setShow = function(val) {
    if (Cesium.defined(val)) {
        this._entity[this._CESIUMTYPE]['show'] = val;
    }
};

/**
 * 获取horizontalOrigin
 */
NPGIS3D.Overlay.Label.prototype.getHorizontalorigin = function() {
    var e = this._entity[this._CESIUMTYPE]['horizontalOrigin'];
    if (Cesium.defined(e)) {
        return e.getValue();
    }
};
/**
 * 设置horizontalOrigin
 */
NPGIS3D.Overlay.Label.prototype.setHorizontalorigin = function(val) {
    if (Cesium.defined(val)) {
        this._entity[this._CESIUMTYPE]['horizontalOrigin'] = val;
    }
}

/**
 * 获取verticalOrigin
 */
NPGIS3D.Overlay.Label.prototype.getVerticalorigin = function() {
    var e = this._entity[this._CESIUMTYPE]['verticalOrigin'];
    if (Cesium.defined(e)) {
        return e.getValue();
    }
};
/**
 * 设置verticalOrigin
 */
NPGIS3D.Overlay.Label.prototype.setVerticalorigin = function(val) {
    if (Cesium.defined(val)) {
        this._entity[this._CESIUMTYPE]['verticalOrigin'] = val;
    }
};

// NPGIS3D.Overlay.Label.prototype.getfillColor = function() {
//     var e = this._entity[this._CESIUMTYPE]['fillColor'];
//     if (e) {
//         return e.getValue();
//     }
// };
/**
 * 设置fillColor
 * @param  {NPGIS3D.Color} fillColor 
 */
NPGIS3D.Overlay.Label.prototype.setfillColor = function(fillColor) {
    this._entity[this._CESIUMTYPE]['fillColor'] = fillColor;
};

// NPGIS3D.Overlay.Label.prototype.getoutlineColor = function() {
//     var e = this._entity[this._CESIUMTYPE]['outlineColor'];
//     if (e) {
//         return e.getValue();
//     }
// };

/**
 * 设置outlineColor
 * @param  {NPGIS3D.Color}   outlineColor
 */
NPGIS3D.Overlay.Label.prototype.setoutlineColor = function(outlineColor) {
    this._entity[this._CESIUMTYPE]['outlineColor'] = outlineColor;
};

NPGIS3D.inherits(NPGIS3D.Overlay.Label, NPGIS3D.Overlay);

/**
 * 线覆盖物
 * @requires NPGIS3D.Overlay.js
 * @class NPGIS3D.Overlay.Polyline
 * @extends NPGIS3D.Overlay
 *
 * @constructor
 * @param {NPGIS3D.Geometry.Polyline} polyline 几何,必须
 * @param {Object} opts  属性
 * @param {Boolean} opts.followSurface - 是否跟随表面，默认 true
 * @param {Number} opts.width - 宽度，默认 1px
 * @param {NPGIS3D.Color} opts.fillColor - 填充颜色，默认 RED
 * @param {NPGIS3D.Color} opts.outlineColor - 边框颜色，默认 RED
 * @param {Number} opts.outlineWidth - 边框宽度，默认 0
 * @param {NPGIS3D.Color} opts.material - 线段材质，默认NPGIS3D.Color.RED
 * @param {Boolean} opts.show - 是否显示，默认 true
 * @see {@linkcode http://localhost:807/3dmap/gis_manager/gis_demo.html#demos/Overlay/Polyline.html| Polyline Demo[内网]}
 * @see {@linkcode http://map.netposa.com:9500/3dmap/gis_manager/gis_demo.html#demos/Overlay/Polyline.html| Polyline Demo[外网]}
 *
 */
NPGIS3D.Overlay.Polyline = function(polyline, opts) {
    'use strict';
    this._CESIUMTYPE = 'polyline';
    var height = false;
    this.geometry = polyline;
    opts = NPGIS3D.NPUtil.extend(opts, {
        // id: NPGIS3D.NPUtil.UUID(),
        followSurface: true,
        width: 5.0,
        show: true,
        material: Cesium.Color.RED,
        granularity: Cesium.Math.RADIANS_PER_DEGREE
    });
    NPGIS3D.Overlay.call(this,"polyline");

    /*
     *
     * 构建 positions
     *
     */
    var polylineToPositions = function() {
        var positions = [],
            // 根据底图坐标转换
            pathLength = polyline.paths.length,
            i = 0,
            j = 0,
            path,
            pLength,
            point,
            newPoint;

        for (i = 0; i < pathLength; i++) {
            path = polyline.paths[i];
            pLength = path.length;
            for (j = 0; j < pLength; j++) {
                point = path[j];
                newPoint = NPGIS3D.NPCoordinate.coordinateTransByBasemap(point.lon, point.lat);
                if (point.type === '2D') {
                    positions.push(newPoint.lon, newPoint.lat);
                } else {
                    positions.push(newPoint.lon, newPoint.lat, point.h+0.5);
                    if (!height) {
                        height = true;
                    }
                }
            }
        }

        return positions;
    };

    var positions,
        polylineGraphics,
        entity;

    if (!NPGIS3D.NPUtil.isArray(polyline.paths)) {
        throw new NPGIS3D.DeveloperError('NPGIS3D.Overlay.Polyline', '参数 polyline 不正确!');
    };

    positions = polylineToPositions();

    if (!NPGIS3D.NPUtil.isArray(positions) || positions.length < 4) {
        throw new NPGIS3D.DeveloperError('NPGIS3D.Overlay.Polyline', '参数 positions 不正确!');
    };

    //this.optsValidation(opts);

    polylineGraphics = new Cesium.PolylineGraphics(opts);

    if (height) {
        polylineGraphics.positions = Cesium.Cartesian3.fromDegreesArrayHeights(positions);
    } else {
        polylineGraphics.positions = Cesium.Cartesian3.fromDegreesArray(positions);
    }
    this._entity[this._CESIUMTYPE] = polylineGraphics;
};

/**
 * 获取
 */
NPGIS3D.Overlay.Polyline.prototype.getWidth = function() {
    var e = this._entity[this._CESIUMTYPE]['width'];
    if (Cesium.defined(e)) {
        return e.getValue();
    }
};
/**
 * 设置
 */
NPGIS3D.Overlay.Polyline.prototype.setWidth = function(val) {
    if (Cesium.defined(val)) {
        this._entity[this._CESIUMTYPE]['width'] = val;
    }
};

/**
 * 获取
 */
NPGIS3D.Overlay.Polyline.prototype.getFollowsurface = function() {
    var e = this._entity[this._CESIUMTYPE]['followSurface'];
    if (Cesium.defined(e)) {
        return e.getValue();
    }
};
/**
 * 设置
 */
NPGIS3D.Overlay.Polyline.prototype.setFollowsurface = function(val) {
    if (Cesium.defined(val)) {
        this._entity[this._CESIUMTYPE]['followSurface'] = val;
    }
};

/**
 * 获取
 */
NPGIS3D.Overlay.Polyline.prototype.getShow = function() {
    var e = this._entity[this._CESIUMTYPE]['show'];
    if (Cesium.defined(e)) {
        return e.getValue();
    }
};
/**
 * 设置
 */
NPGIS3D.Overlay.Polyline.prototype.setShow = function(val) {
    if (Cesium.defined(val)) {
        this._entity[this._CESIUMTYPE]['show'] = val;
    }
};


/**
 * 获取
 */
// NPGIS3D.Overlay.Polyline.prototype.getMaterial = function() {
//     var e = this._entity[this._CESIUMTYPE]['material'];
//     if (Cesium.defined(e)) {
//         return e.getValue();
//     }
// };
/**
 * 设置
 */
NPGIS3D.Overlay.Polyline.prototype.setMaterial = function(val) {
    if (Cesium.defined(val)) {
        if (val._) {
            this._entity[this._CESIUMTYPE]['material'] = val._;
        } else {
            this._entity[this._CESIUMTYPE]['material'] = val;
        }
    }
};
NPGIS3D.inherits(NPGIS3D.Overlay.Polyline, NPGIS3D.Overlay);

/**
 * 多边形覆盖物
 * @requires NPGIS3D.Overlay.js
 * @class NPGIS3D.Overlay.Polygon
 * @extends NPGIS3D.Overlay
 *
 * @constructor
 * @param {NPGIS3D.Geometry.Polygon} polygon  - 几何,必须
 * @param {Object} opts - 属性
 * @param {Boolean} opts.followSurface - 是否跟随表面，默认 true
 * @param {Boolean} opts.fill -是否填充，默认 ture
 * @param {Boolean} opts.outline - 是否显示边框，默认 false，为 false 时 outlineColor 和 outlineWidth 无效
 * @param {NPGIS3D.Color} opts.outlineColor -  边框颜色，默认 BLACK
 * @param {Number} opts.outlineWidth - 边框宽度，默认 0
 * @param {Number} opts.outlineAlpha - 边框不透明度，默认 1
 * @param {Boolean} opts.show - 是否显示，默认 true
 * @param {Number} opts.extrudedHeight - 拉起高度，默认 0 和 perPositionHeight互斥
 * @param {Number} opts.height - 距表面高度，默认 0。
 * @param {Boolean} opts.closeTop - 顶部是否闭合，默认 true
 * @param {Boolean} opts.closeBottom - 底部是否闭合，默认 false
 * @see {@linkcode http://localhost:807/3dmap/gis_manager/gis_demo.html#demos/Overlay/Polygon.html| Polygon Demo[内网]}
 * @see {@linkcode http://map.netposa.com:9500/3dmap/gis_manager/gis_demo.html#demos/Overlay/Polygon.html| Polygon Demo[外网]}
 */
NPGIS3D.Overlay.Polygon = function(polygon, opts) {
    'use strict';
    this._CESIUMTYPE = 'polygon';
    var perPositionHeight = false;
    this.geometry = polygon;
    opts = NPGIS3D.NPUtil.extend(opts, {
        //id: NPGIS3D.NPUtil.UUID(),
        // height: 0,
        // extrudedHeight: 0,
        // show: true,
        // fill: true,
        // outline: false,
        perPositionHeight:true,
        outlineColor: Cesium.Color.BLACK,
        material: Cesium.Color.RED
        // outlineWidth: 1.0,
        // outlineAlpha: 1,
        // stRotation: 0.0,
        // closeTop: true,
        // closeBottom: false
    });
    NPGIS3D.Overlay.call(this,"polygon");



    /*
     *
     * 构建 hierarchy
     *
     */
    var polygonToHierarchy = function() {
        var hierarchy = [],
            ringLength = polygon.rings.length,
            i = 0,
            j = 0,
            ring,
            rLength,
            point,
            newPoint;

        for (i = 0; i < ringLength; i++) {
            ring = polygon.rings[i];
            rLength = ring.length;
            for (j = 0; j < rLength; j++) {
                point = ring[j];
                newPoint = NPGIS3D.NPCoordinate.coordinateTransByBasemap(point.lon, point.lat);
                if (point.type === 'point2D') {
                    hierarchy.push(newPoint.lon, newPoint.lat);
                } else {
                    hierarchy.push(newPoint.lon, newPoint.lat, point.h);
                    if (!perPositionHeight) {
                        perPositionHeight = true;
                    }
                }

            }
        }

        return hierarchy;
    };


    var hierarchy,
        polygonGraphics,
        entity;

    if (!NPGIS3D.NPUtil.isArray(polygon.rings)) {
        throw new NPGIS3D.DeveloperError('NPGIS3D.Overlay.Polygon', '参数 polygon 不正确!');
    };

    hierarchy = polygonToHierarchy();

    if (!NPGIS3D.NPUtil.isArray(hierarchy) || hierarchy.length < 6) {
        throw new NPGIS3D.DeveloperError('NPGIS3D.Overlay.Polygon', '参数 hierarchy 不正确!');
    };

    //this.optsValidation(opts);
    polygonGraphics = new Cesium.PolygonGraphics(opts);


    if (perPositionHeight) {
        polygonGraphics.hierarchy = Cesium.Cartesian3.fromDegreesArrayHeights(hierarchy);
    } else {
        polygonGraphics.hierarchy = Cesium.Cartesian3.fromDegreesArray(hierarchy);
    }

    this._entity[this._CESIUMTYPE] = polygonGraphics;

};

/**
 * 获取height
 */
NPGIS3D.Overlay.Polygon.prototype.getHeight = function() {
    var e = this._entity[this._CESIUMTYPE]['height'];
    if (Cesium.defined(e)) {
        return e.getValue();
    }
};
/**
 * 设置height
 */
NPGIS3D.Overlay.Polygon.prototype.setHeight = function(val) {
    if (Cesium.defined(val)) {
        this._entity[this._CESIUMTYPE]['height'] = val;
    }
};

/**
 * 获取是否显示
 * @return {bool}
 */
NPGIS3D.Overlay.Polygon.prototype.getShow = function() {
    var e = this._entity[this._CESIUMTYPE]['show'];
    if (Cesium.defined(e)) {
        return e.getValue();
    }
};
/**
 * 设置是否显示
 * @param {bool}
 */
NPGIS3D.Overlay.Polygon.prototype.setShow = function(val) {
    if (Cesium.defined(val)) {
        this._entity[this._CESIUMTYPE]['show'] = val;
    }
};

/**
 * 获取extrudedHeight
 */
NPGIS3D.Overlay.Polygon.prototype.getExtrudedheight = function() {
    var e = this._entity[this._CESIUMTYPE]['extrudedHeight'];
    if (Cesium.defined(e)) {
        return e.getValue();
    }
};
/**
 * 设置extrudedHeight
 */
NPGIS3D.Overlay.Polygon.prototype.setExtrudedheight = function(val) {
    if (Cesium.defined(val)) {
        this._entity[this._CESIUMTYPE]['extrudedHeight'] = val;
    }
};

/**
 * 获取fill
 */
NPGIS3D.Overlay.Polygon.prototype.getFill = function() {
    var e = this._entity[this._CESIUMTYPE]['fill'];
    if (Cesium.defined(e)) {
        return e.getValue();
    }
};
/**
 * 设置fill
 */
NPGIS3D.Overlay.Polygon.prototype.setFill = function(val) {
    if (Cesium.defined(val)) {
        this._entity[this._CESIUMTYPE]['fill'] = val;
    }
};

/**
 * 获取outline
 */
NPGIS3D.Overlay.Polygon.prototype.getOutline = function() {
    var e = this._entity[this._CESIUMTYPE]['outline'];
    if (Cesium.defined(e)) {
        return e.getValue();
    }
};
/**
 * 设置outline
 */
NPGIS3D.Overlay.Polygon.prototype.setOutline = function(val) {
    if (Cesium.defined(val)) {
        this._entity[this._CESIUMTYPE]['outline'] = val;
    }
};

/**
 * 获取outlineWidth
 */
NPGIS3D.Overlay.Polygon.prototype.getOutlinewidth = function() {
    var e = this._entity[this._CESIUMTYPE]['outlineWidth'];
    if (Cesium.defined(e)) {
        return e.getValue();
    }
};
/**
 * 设置outlineWidth
 */
NPGIS3D.Overlay.Polygon.prototype.setOutlinewidth = function(val) {
    if (Cesium.defined(val)) {
        this._entity[this._CESIUMTYPE]['outlineWidth'] = val;
    }
};

/**
 * 获取stRotation
 */
NPGIS3D.Overlay.Polygon.prototype.getStrotation = function() {
    var e = this._entity[this._CESIUMTYPE]['stRotation'];
    if (Cesium.defined(e)) {
        return e.getValue();
    }
};
/**
 * 设置stRotation
 */
NPGIS3D.Overlay.Polygon.prototype.setStrotation = function(val) {
    if (Cesium.defined(val)) {
        this._entity[this._CESIUMTYPE]['stRotation'] = val;
    }
};

/**
 * 获取perPositionHeight
 */
NPGIS3D.Overlay.Polygon.prototype.getPerpositionheight = function() {
    var e = this._entity[this._CESIUMTYPE]['perPositionHeight'];
    if (Cesium.defined(e)) {
        return e.getValue();
    }
};
/**
 * 设置perPositionHeight
 */
NPGIS3D.Overlay.Polygon.prototype.setPerpositionheight = function(val) {
    if (Cesium.defined(val)) {
        this._entity[this._CESIUMTYPE]['perPositionHeight'] = val;
    }
};

/**
 * 获取closeTop
 */
NPGIS3D.Overlay.Polygon.prototype.getClosetop = function() {
    var e = this._entity[this._CESIUMTYPE]['closeTop'];
    if (Cesium.defined(e)) {
        return e.getValue();
    }
};
/**
 * 设置closeTop
 */
NPGIS3D.Overlay.Polygon.prototype.setClosetop = function(val) {
    if (Cesium.defined(val)) {
        this._entity[this._CESIUMTYPE]['closeTop'] = val;
    }
};

/**
 * 获取closeBottom
 */
NPGIS3D.Overlay.Polygon.prototype.getClosebottom = function() {
    var e = this._entity[this._CESIUMTYPE]['closeBottom'];
    if (Cesium.defined(e)) {
        return e.getValue();
    }
};
/**
 * 设置closeBottom
 */
NPGIS3D.Overlay.Polygon.prototype.setClosebottom = function(val) {
    if (Cesium.defined(val)) {
        this._entity[this._CESIUMTYPE]['closeBottom'] = val;
    }
};
/**
 * 设置
 */
NPGIS3D.Overlay.Polygon.prototype.setMaterial = function(val) {
    if (Cesium.defined(val)) {
        if (val._) {
            this._entity[this._CESIUMTYPE]['material'] = val._;
        } else {
            this._entity[this._CESIUMTYPE]['material'] = val;
        }
    }
};
NPGIS3D.inherits(NPGIS3D.Overlay.Polygon, NPGIS3D.Overlay);

/**
 * Model 覆盖物
 * @requires NPGIS3D.Overlay.js
 * @class NPGIS3D.Overlay.Model
 * @extends NPGIS3D.Overlay
 *
 * @constructor
 * @param {NPGIS3D.Geometry.Point} point - 位置,必须
 * @param {Object} opts  属性
 *
 *        dimensions: 长 宽 高 {x:0,y:0,z:0}
 *        show: 是否显示 默认显示
 *        fill: 是否填充 默认填充
 *        outline: 是否有边线 默认否
 *        outlineWidth: 边线宽度 默认1
 *        outlineColor: 【NPGIS3D.Color】边线颜色 默认BLACK
 */
NPGIS3D.Overlay.Model = function(point, opts) {
    this._CESIUMTYPE = 'model';
    opts = NPGIS3D.NPUtil.extend(opts, {
        show: true,
        scale: 1.0
    });
    NPGIS3D.Overlay.call(this);
    this._setPosition(point);
    this._entity[this._CESIUMTYPE] = new Cesium.ModelGraphics(opts);
};

/*
 * 获取
 */
NPGIS3D.Overlay.Model.prototype.getShow = function() {
    var e = this._entity[this._CESIUMTYPE]['show'];
    if (Cesium.defined(e)) {
        return e.getValue();
    }
};
/*
 * 设置
 */
NPGIS3D.Overlay.Model.prototype.setShow = function(val) {
    if (Cesium.defined(val)) {
        this._entity[this._CESIUMTYPE]['show'] = val;
    }
};
NPGIS3D.inherits(NPGIS3D.Overlay.Model, NPGIS3D.Overlay);

/**
 * 矩形覆盖物
 * @requires NPGIS3D.Overlay.js
 * @class NPGIS3D.Overlay.Rectangle
 * @extends NPGIS3D.Overlay
 *
 * @constructor
 * @param {NPGIS3D.Geometry.Extent} extent - 范围,必须
 * @param {Object} opts
 * @param {NPGIS3D.Color} opts.material -颜色
 * @param {Number} opts.rotation - 默认0 选中角度
 * @param {Number} opts.extrudedHeight -拉伸高度，默认0
 * @param {Number} opts.height -高度，默认0
 * @see {@linkcode http://localhost:807/3dmap/gis_manager/gis_demo.html#demos/Overlay/Rectangle.html| Rectangle Demo[内网]}
 * @see {@linkcode http://map.netposa.com:9500/3dmap/gis_manager/gis_demo.html#demos/Overlay/Rectangle.html| Rectangle Demo[外网]}
 */
NPGIS3D.Overlay.Rectangle = function(extent, opts) {
    this._CESIUMTYPE = 'rectangle';
    NPGIS3D.Overlay.call(this);
    opts = NPGIS3D.NPUtil.extend(opts, {
        material: Cesium.Color.GREEN.withAlpha(0.5),
        rotation: 0,
        extrudedHeight: 0,
        height: 0,
        outline: !0,
        outlineColor: Cesium.Color.YELLOW,
        closeTop: true,
        closeBottom: true,
        show: true,
        stRotation: 0.0,
        fill: true,
        granularity: Cesium.Math.RADIANS_PER_DEGREE
    });

    this.optsValidation(opts);
    if (!NPGIS3D.NPUtil.isObject(extent)) {
        throw new NPGIS3D.DeveloperError('NPGIS3D.Overlay.Point', '参数 extent 不正确!');
    };
    extent.left = extent.xmin || extent.left;
    extent.bottom = extent.ymin || extent.bottom;
    extent.right = extent.xmax || extent.right;
    extent.top = extent.ymax || extent.top;
    //  // 根据底图坐标转换
    var newPosition = NPGIS3D.NPCoordinate.coordinateTransByBasemap(extent.left, extent.bottom);
    var newPosition1 = NPGIS3D.NPCoordinate.coordinateTransByBasemap(extent.right, extent.top);

    opts.coordinates = Cesium.Rectangle.fromDegrees(newPosition.lon, newPosition.lat, newPosition1.lon, newPosition1.lat);
    this._entity[this._CESIUMTYPE] = new Cesium.RectangleGraphics(opts);
};
/**
 * 获取
 */
NPGIS3D.Overlay.Rectangle.prototype.getHeight = function() {
    var e = this._entity[this._CESIUMTYPE]['height'];
    if (Cesium.defined(e)) {
        return e.getValue();
    }
};
/**
 * 设置
 */
NPGIS3D.Overlay.Rectangle.prototype.setHeight = function(val) {
    if (Cesium.defined(val)) {
        this._entity[this._CESIUMTYPE]['height'] = val;
    }
};

/**
 * 获取
 */
NPGIS3D.Overlay.Rectangle.prototype.getClosetop = function() {
    var e = this._entity[this._CESIUMTYPE]['closeTop'];
    if (Cesium.defined(e)) {
        return e.getValue();
    }
};
/**
 * 设置
 */
NPGIS3D.Overlay.Rectangle.prototype.setClosetop = function(val) {
    if (Cesium.defined(val)) {
        this._entity[this._CESIUMTYPE]['closeTop'] = val;
    }
};

/**
 * 获取
 */
NPGIS3D.Overlay.Rectangle.prototype.getExtrudedheight = function() {
    var e = this._entity[this._CESIUMTYPE]['extrudedHeight'];
    if (Cesium.defined(e)) {
        return e.getValue();
    }
};
/**
 * 设置
 */
NPGIS3D.Overlay.Rectangle.prototype.setExtrudedheight = function(val) {
    if (Cesium.defined(val)) {
        this._entity[this._CESIUMTYPE]['extrudedHeight'] = val;
    }
};

/**
 * 获取
 */
NPGIS3D.Overlay.Rectangle.prototype.getClosebottom = function() {
    var e = this._entity[this._CESIUMTYPE]['closeBottom'];
    if (Cesium.defined(e)) {
        return e.getValue();
    }
};
/**
 * 设置
 */
NPGIS3D.Overlay.Rectangle.prototype.setClosebottom = function(val) {
    if (Cesium.defined(val)) {
        this._entity[this._CESIUMTYPE]['closeBottom'] = val;
    }
};

/**
 * 获取
 */
NPGIS3D.Overlay.Rectangle.prototype.getShow = function() {
    var e = this._entity[this._CESIUMTYPE]['show'];
    if (Cesium.defined(e)) {
        return e.getValue();
    }
};
/**
 * 设置
 */
NPGIS3D.Overlay.Rectangle.prototype.setShow = function(val) {
    if (Cesium.defined(val)) {
        this._entity[this._CESIUMTYPE]['show'] = val;
    }
};

/**
 * 获取
 */
NPGIS3D.Overlay.Rectangle.prototype.getFill = function() {
    var e = this._entity[this._CESIUMTYPE]['fill'];
    if (Cesium.defined(e)) {
        return e.getValue();
    }
};
/**
 * 设置
 */
NPGIS3D.Overlay.Rectangle.prototype.setFill = function(val) {
    if (Cesium.defined(val)) {
        this._entity[this._CESIUMTYPE]['fill'] = val;
    }
};

/**
 * 获取
 */
NPGIS3D.Overlay.Rectangle.prototype.getOutline = function() {
    var e = this._entity[this._CESIUMTYPE]['outline'];
    if (Cesium.defined(e)) {
        return e.getValue();
    }
};
/**
 * 设置
 */
NPGIS3D.Overlay.Rectangle.prototype.setOutline = function(val) {
    if (Cesium.defined(val)) {
        this._entity[this._CESIUMTYPE]['outline'] = val;
    }
};

/**
 * 获取
 */
NPGIS3D.Overlay.Rectangle.prototype.getOutlinewidth = function() {
    var e = this._entity[this._CESIUMTYPE]['outlineWidth'];
    if (Cesium.defined(e)) {
        return e.getValue();
    }
};
/**
 * 设置
 */
NPGIS3D.Overlay.Rectangle.prototype.setOutlinewidth = function(val) {
    if (Cesium.defined(val)) {
        this._entity[this._CESIUMTYPE]['outlineWidth'] = val;
    }
};

/**
 * 获取旋转角度
 */
NPGIS3D.Overlay.Rectangle.prototype.getRotation = function() {
    var e = this._entity[this._CESIUMTYPE]['rotation'];
    if (Cesium.defined(e)) {
        return Cesium.Math.toDegrees(e.getValue());
    }
};
/**
 * 设置旋转角度
 */
NPGIS3D.Overlay.Rectangle.prototype.setRotation = function(val) {
    if (Cesium.defined(val)) {
        this._entity[this._CESIUMTYPE]['rotation'] = Cesium.Math.toRadians(Number(val));
    }
};


/**
 * 获取
 */
NPGIS3D.Overlay.Rectangle.prototype.getStrotation = function() {
    var e = this._entity[this._CESIUMTYPE]['stRotation'];
    if (Cesium.defined(e)) {
        return e.getValue();
    }
};
/**
 * 设置
 */
NPGIS3D.Overlay.Rectangle.prototype.setStrotation = function(val) {
    if (Cesium.defined(val)) {
        this._entity[this._CESIUMTYPE]['stRotation'] = val;
    }
};
/**
 * 设置材质
 */
NPGIS3D.Overlay.Rectangle.prototype.setMaterial = function(val) {
    if (Cesium.defined(val)) {
        if (val._) {
            this._entity[this._CESIUMTYPE]['material'] = val._;
        } else {
            this._entity[this._CESIUMTYPE]['material'] = val;
        }
    }
};
NPGIS3D.inherits(NPGIS3D.Overlay.Rectangle, NPGIS3D.Overlay);

/**
 * BOX 覆盖物
 * @requires NPGIS3D.Overlay.js
 * @class NPGIS3D.Overlay.Box
 * @extends NPGIS3D.Overlay
 *
 * @constructor
 * @param {NPGIS3D.Geometry.Point} point -位置,必须
 * @param {Object} opts  -属性
 * @param {Object}  opts.dimensions -长 宽 高 {x:0,y:0,z:0}
 * @param {Boolean}  opts.show -是否显示 默认显示
 * @param {Boolean}  opts.fill -是否填充 默认填充
 * @param {Boolean}  opts.outline -是否有边线 默认否
 * @param {Number}  opts.outlineWidth: -边线宽度 默认1
 * @param {NPGIS3D.Color}    opts.outlineColor -【NPGIS3D.Color】边线颜色 默认BLACK
 * @see {@linkcode http://localhost:807/3dmap/gis_manager/gis_demo.html#demos/Overlay/BOX.html| BOX Demo[内网]}
 * @see {@linkcode http://map.netposa.com:9500/3dmap/gis_manager/gis_demo.html#demos/Overlay/BOX.html| BOX Demo[外网]}
 */
NPGIS3D.Overlay.Box = function(point, opts) {
    this._CESIUMTYPE = 'box';
    opts = NPGIS3D.NPUtil.extend(opts, {
        dimensions: Cesium.Cartesian3.ZERO,
        show: true,
        fill: true,
        outline: false,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 1.0,
        material: Cesium.Color.GREEN
    });
    NPGIS3D.Overlay.call(this);
    this._setPosition(point);
    this._entity[this._CESIUMTYPE] = new Cesium.BoxGraphics(opts);
};

/**
 * 获取是否显示
 * @return {Boolean}
 */
NPGIS3D.Overlay.Box.prototype.getShow = function() {
    var e = this._entity[this._CESIUMTYPE]['show'];
    if (Cesium.defined(e)) {
        return e.getValue();
    }
};
/**
 * 设置是否显示
 * @param {Boolean}
 */
NPGIS3D.Overlay.Box.prototype.setShow = function(val) {
    if (Cesium.defined(val)) {
        this._entity[this._CESIUMTYPE]['show'] = val;
    }
};

/**
 * 获取是否填充
 * @param {Boolean}
 */
NPGIS3D.Overlay.Box.prototype.getFill = function() {
    var e = this._entity[this._CESIUMTYPE]['fill'];
    if (Cesium.defined(e)) {
        return e.getValue();
    }
};
/**
 * 设置是否填充
 * @return {Boolean}
 */
NPGIS3D.Overlay.Box.prototype.setFill = function(val) {
    if (Cesium.defined(val)) {
        this._entity[this._CESIUMTYPE]['fill'] = val;
    }
};

/**
 * 获取是否设置边线
 * @return {Boolean}
 */
NPGIS3D.Overlay.Box.prototype.getOutline = function() {
    var e = this._entity[this._CESIUMTYPE]['outline'];
    if (Cesium.defined(e)) {
        return e.getValue();
    }
};
/**
 * 设置是否设置边线
 * @param {Boolean}
 */
NPGIS3D.Overlay.Box.prototype.setOutline = function(val) {
    if (Cesium.defined(val)) {
        this._entity[this._CESIUMTYPE]['outline'] = val;
    }
};

/**
 * 获取边线宽度
 * @return {Number}
 */
NPGIS3D.Overlay.Box.prototype.getOutlinewidth = function() {
    var e = this._entity[this._CESIUMTYPE]['outlineWidth'];
    if (Cesium.defined(e)) {
        return e.getValue();
    }
};
/**
 * 设置边线宽度
 * @param {Number} val 线宽
 */
NPGIS3D.Overlay.Box.prototype.setOutlinewidth = function(val) {
    if (Cesium.defined(val)) {
        this._entity[this._CESIUMTYPE]['outlineWidth'] = val;
    }
};
NPGIS3D.inherits(NPGIS3D.Overlay.Box, NPGIS3D.Overlay);

/**
 * 椭球覆盖物
 * @requires NPGIS3D.Overlay.js
 * @class NPGIS3D.Overlay.Ellipsoid
 * @extends NPGIS3D.Overlay
 *
 * @constructor
 * @param {NPGIS3D.Geometry.Point} point - 位置,必须
 * @param {Object} opts  属性
 * @param {Object}  opts.radii -  长 宽 高 {x:0,y:0,z:0}
 * @param {NPGIS3D.Color}  opts.material -  颜色
 * @param {Boolean}  opts.fill -  是否填充 默认填充
 * @param {Boolean}  opts.outline - 是否有边线 默认否
 * @param {NPGIS3D.Color}  opts.outlineColor -  边线颜色 默认BLACK
 * @see {@linkcode http://localhost:807/3dmap/gis_manager/gis_demo.html#demos/Overlay/Ellipsoid.html| Ellipsoid Demo[内网]}
 * @see {@linkcode http://map.netposa.com:9500/3dmap/gis_manager/gis_demo.html#demos/Overlay/Ellipsoid.html| Ellipsoid Demo[外网]}
 */
NPGIS3D.Overlay.Ellipsoid = function(point, opts) {
    NPGIS3D.Overlay.call(this);
    this._CESIUMTYPE = 'ellipsoid';
    NPGIS3D.Overlay.call(this);
    opts = NPGIS3D.NPUtil.extend(opts, {
        radii: Cesium.Cartesian3.ZERO,
        material: Cesium.Color.GREEN,
        outline: false,
        outlineColor: Cesium.Color.BLACK
    });

    this.optsValidation(opts);
    if (!NPGIS3D.NPUtil.isObject(point)) {
        throw new NPGIS3D.DeveloperError('NPGIS3D.Overlay.Ellipsoid', '参数 point 不正确!');
    };

    this._setPosition(point);
    this._entity[this._CESIUMTYPE] = new Cesium.EllipsoidGraphics(opts);
};

/**
 * 获取
 */
NPGIS3D.Overlay.Ellipsoid.prototype.getShow = function() {
    var e = this._entity[this._CESIUMTYPE]['show'];
    if (Cesium.defined(e)) {
        return e.getValue();
    }
};
/**
 * 设置
 */
NPGIS3D.Overlay.Ellipsoid.prototype.setShow = function(val) {
    if (Cesium.defined(val)) {
        this._entity[this._CESIUMTYPE]['show'] = val;
    }
};

/**
 * 获取
 */
NPGIS3D.Overlay.Ellipsoid.prototype.getFill = function() {
    var e = this._entity[this._CESIUMTYPE]['fill'];
    if (Cesium.defined(e)) {
        return e.getValue();
    }
};
/**
 * 设置
 */
NPGIS3D.Overlay.Ellipsoid.prototype.setFill = function(val) {
    if (Cesium.defined(val)) {
        this._entity[this._CESIUMTYPE]['fill'] = val;
    }
};

/**
 * 获取
 */
NPGIS3D.Overlay.Ellipsoid.prototype.getOutline = function() {
    var e = this._entity[this._CESIUMTYPE]['outline'];
    if (Cesium.defined(e)) {
        return e.getValue();
    }
};
/**
 * 设置
 */
NPGIS3D.Overlay.Ellipsoid.prototype.setOutline = function(val) {
    if (Cesium.defined(val)) {
        this._entity[this._CESIUMTYPE]['outline'] = val;
    }
};

/**
 * 获取
 */
// NPGIS3D.Overlay.Ellipsoid.prototype.getOutlinecolor = function() {
//     var e = this._entity[this._CESIUMTYPE]['outlineColor'];
//     if (Cesium.defined(e)) {
//         return e.getValue();
//     }
// };
/**
 * 设置边线颜色
 */
NPGIS3D.Overlay.Ellipsoid.prototype.setOutlinecolor = function(val) {
    if (Cesium.defined(val)) {
        this._entity[this._CESIUMTYPE]['outlineColor'] = val;
    }
};

/**
 * 获取边线宽度
 */
NPGIS3D.Overlay.Ellipsoid.prototype.getOutlinewidth = function() {
    var e = this._entity[this._CESIUMTYPE]['outlineWidth'];
    if (Cesium.defined(e)) {
        return e.getValue();
    }
};
/**
 * 设置边线宽度
 */
NPGIS3D.Overlay.Ellipsoid.prototype.setOutlinewidth = function(val) {
    if (Cesium.defined(val)) {
        this._entity[this._CESIUMTYPE]['outlineWidth'] = val;
    }
};

/**
 * 获取
 */
NPGIS3D.Overlay.Ellipsoid.prototype.getSubdivisions = function() {
    var e = this._entity[this._CESIUMTYPE]['subdivisions'];
    if (Cesium.defined(e)) {
        return e.getValue();
    }
};
/**
 * 设置
 */
NPGIS3D.Overlay.Ellipsoid.prototype.setSubdivisions = function(val) {
    if (Cesium.defined(val)) {
        this._entity[this._CESIUMTYPE]['subdivisions'] = val;
    }
};

/**
 * 获取
 */
NPGIS3D.Overlay.Ellipsoid.prototype.getStackpartitions = function() {
    var e = this._entity[this._CESIUMTYPE]['stackPartitions'];
    if (Cesium.defined(e)) {
        return e.getValue();
    }
};
/**
 * 设置
 */
NPGIS3D.Overlay.Ellipsoid.prototype.setStackpartitions = function(val) {
    if (Cesium.defined(val)) {
        this._entity[this._CESIUMTYPE]['stackPartitions'] = val;
    }
};

/**
 * 获取
 */
NPGIS3D.Overlay.Ellipsoid.prototype.getSlicepartitions = function() {
    var e = this._entity[this._CESIUMTYPE]['slicePartitions'];
    if (Cesium.defined(e)) {
        return e.getValue();
    }
};
/**
 * 设置
 */
NPGIS3D.Overlay.Ellipsoid.prototype.setSlicepartitions = function(val) {
    if (Cesium.defined(val)) {
        this._entity[this._CESIUMTYPE]['slicePartitions'] = val;
    }
};
/**
 * 设置材质
 */
NPGIS3D.Overlay.Ellipsoid.prototype.setMaterial = function(val) {
    if (Cesium.defined(val)) {
        if (val._) {
            this._entity[this._CESIUMTYPE]['material'] = val._;
        } else {
            this._entity[this._CESIUMTYPE]['material'] = val;
        }
    }
};
NPGIS3D.inherits(NPGIS3D.Overlay.Ellipsoid, NPGIS3D.Overlay);

/**
 * 椭圆覆盖物
 * @requires NPGIS3D.Overlay.js
 * @class NPGIS3D.Overlay.Ellipse
 * @extends NPGIS3D.Overlay
 *
 * @constructor
 * @param {NPGIS3D.Geometry.Point} point - 位置,必须
 * @param {Object} opts  属性
 * @param {Number}  opts.semiMinorAxis
 * @param {Number}  opts.semiMajorAxis
 * @param {Number}  opts.extrudedHeight
 * @param {Number}  opts.rotation
 * @param {Boolean}  opts.outline
 * @param {NPGIS3D.Color}  opts.material - BLUE
 * @see {@linkcode http://localhost:807/3dmap/gis_manager/gis_demo.html#demos/Overlay/Ellipse.html| Ellipse Demo[内网]}
 * @see {@linkcode http://map.netposa.com:9500/3dmap/gis_manager/gis_demo.html#demos/Overlay/Ellipse.html| Ellipse Demo[外网]}
 */
NPGIS3D.Overlay.Ellipse = function(point, opts) {
    this._CESIUMTYPE = 'ellipse';
    opts = NPGIS3D.NPUtil.extend(opts, {
        semiMinorAxis: 15E4,
        semiMajorAxis: 3E5,
        extrudedHeight: 0,
        rotation: Cesium.Math.toRadians(0),
        material: Cesium.Color.BLUE.withAlpha(0.5),
        outline: !0
    });
    NPGIS3D.Overlay.call(this);
    this._setPosition(point);
    this._entity[this._CESIUMTYPE] = new Cesium.EllipseGraphics(opts);
};

/**
 * 获取高度
 * @return {Number}
 */
NPGIS3D.Overlay.Ellipse.prototype.getHeight = function() {
    var e = this._entity[this._CESIUMTYPE]['height'];
    if (Cesium.defined(e)) {
        return e.getValue();
    }
};
/**
 * 设置高度
 * @param {Number} height
 */
NPGIS3D.Overlay.Ellipse.prototype.setHeight = function(val) {
    if (Cesium.defined(val)) {
        this._entity[this._CESIUMTYPE]['height'] = val;
    }
};

/**
 * 获取拉升高度
 * @return {Number}  
 */
NPGIS3D.Overlay.Ellipse.prototype.getExtrudedheight = function() {
    var e = this._entity[this._CESIUMTYPE]['extrudedHeight'];
    if (Cesium.defined(e)) {
        return e.getValue();
    }
};
/**
 * 设置拉升高度
 * @param {Number}  extrudedHeight 拉升高度
 */
NPGIS3D.Overlay.Ellipse.prototype.setExtrudedheight = function(val) {
    if (Cesium.defined(val)) {
        this._entity[this._CESIUMTYPE]['extrudedHeight'] = val;
    }
};

/**
 * 获取旋转角度
 * @return {Number} 
 */
NPGIS3D.Overlay.Ellipse.prototype.getRotation = function() {
    var e = this._entity[this._CESIUMTYPE]['rotation'];
    if (Cesium.defined(e)) {
        return Cesium.Math.toDegrees(e.getValue());
    }
};

/**
 * 设置旋转角度
 * @param {Number} rotation 
 */
NPGIS3D.Overlay.Ellipse.prototype.setRotation = function(val) {
    if (Cesium.defined(val)) {
        this._entity[this._CESIUMTYPE]['rotation'] = Cesium.Math.toRadians(Number(val));
    }
};


/**
 * 获取
 */
NPGIS3D.Overlay.Ellipse.prototype.getSemiminoraxis = function() {
    var e = this._entity[this._CESIUMTYPE]['semiMinorAxis'];
    if (Cesium.defined(e)) {
        return e.getValue();
    }
};
/**
 * 设置
 */
NPGIS3D.Overlay.Ellipse.prototype.setSemiminoraxis = function(val) {
    if (Cesium.defined(val)) {
        this._entity[this._CESIUMTYPE]['semiMinorAxis'] = val;
    }
};

/**
 * 获取
 */
NPGIS3D.Overlay.Ellipse.prototype.getSemimajoraxis = function() {
    var e = this._entity[this._CESIUMTYPE]['semiMajorAxis'];
    if (Cesium.defined(e)) {
        return e.getValue();
    }
};
/**
 * 设置
 */
NPGIS3D.Overlay.Ellipse.prototype.setSemimajoraxis = function(val) {
    if (Cesium.defined(val)) {
        this._entity[this._CESIUMTYPE]['semiMajorAxis'] = val;
    }
};

/**
 * 获取
 */
NPGIS3D.Overlay.Ellipse.prototype.getShow = function() {
    var e = this._entity[this._CESIUMTYPE]['show'];
    if (Cesium.defined(e)) {
        return e.getValue();
    }
};
/**
 * 设置
 */
NPGIS3D.Overlay.Ellipse.prototype.setShow = function(val) {
    if (Cesium.defined(val)) {
        this._entity[this._CESIUMTYPE]['show'] = val;
    }
};

/**
 * 获取
 */
NPGIS3D.Overlay.Ellipse.prototype.getFill = function() {
    var e = this._entity[this._CESIUMTYPE]['fill'];
    if (Cesium.defined(e)) {
        return e.getValue();
    }
};
/**
 * 设置
 */
NPGIS3D.Overlay.Ellipse.prototype.setFill = function(val) {
    if (Cesium.defined(val)) {
        this._entity[this._CESIUMTYPE]['fill'] = val;
    }
};

/**
 * 获取
 */
NPGIS3D.Overlay.Ellipse.prototype.getOutline = function() {
    var e = this._entity[this._CESIUMTYPE]['outline'];
    if (Cesium.defined(e)) {
        return e.getValue();
    }
};
/**
 * 设置
 */
NPGIS3D.Overlay.Ellipse.prototype.setOutline = function(val) {
    if (Cesium.defined(val)) {
        this._entity[this._CESIUMTYPE]['outline'] = val;
    }
};

/**
 * 获取
 */
NPGIS3D.Overlay.Ellipse.prototype.getOutlinewidth = function() {
    var e = this._entity[this._CESIUMTYPE]['outlineWidth'];
    if (Cesium.defined(e)) {
        return e.getValue();
    }
};
/**
 * 设置
 */
NPGIS3D.Overlay.Ellipse.prototype.setOutlinewidth = function(val) {
    if (Cesium.defined(val)) {
        this._entity[this._CESIUMTYPE]['outlineWidth'] = val;
    }
};

/**
 * 获取
 */
NPGIS3D.Overlay.Ellipse.prototype.getNumberofverticallines = function() {
    var e = this._entity[this._CESIUMTYPE]['numberOfVerticalLines'];
    if (Cesium.defined(e)) {
        return e.getValue();
    }
};
/**
 * 设置
 */
NPGIS3D.Overlay.Ellipse.prototype.setNumberofverticallines = function(val) {
    if (Cesium.defined(val)) {
        this._entity[this._CESIUMTYPE]['numberOfVerticalLines'] = val;
    }
};

/**
 * 获取
 */
NPGIS3D.Overlay.Ellipse.prototype.getStrotation = function() {
    var e = this._entity[this._CESIUMTYPE]['stRotation'];
    if (Cesium.defined(e)) {
        return e.getValue();
    }
};
/**
 * 设置
 */
NPGIS3D.Overlay.Ellipse.prototype.setStrotation = function(val) {
    if (Cesium.defined(val)) {
        this._entity[this._CESIUMTYPE]['stRotation'] = val;
    }
};
/**
 * 设置材质
 */
NPGIS3D.Overlay.Ellipse.prototype.setMaterial = function(val) {
    if (Cesium.defined(val)) {
        if (val._) {
            this._entity[this._CESIUMTYPE]['material'] = val._;
        } else {
            this._entity[this._CESIUMTYPE]['material'] = val;
        }
    }
};
NPGIS3D.inherits(NPGIS3D.Overlay.Ellipse, NPGIS3D.Overlay);

/**
 * wall覆盖物
 * @requires NPGIS3D.Overlay.js
 * @class NPGIS3D.Overlay.Wall
 * @extends NPGIS3D.Overlay
 *
 * @constructor
 * @param {NPGIS3D.Geometry.Point[]} points  -点集合
 * @param {Object} opts
 * @param {Number[]} opts.maximumHeights
 * @param {Number[]} opts.minimumHeights
 * @param {NPGIS3D.Color} opts.material
 * @param {Boolean} opts.outline - 默认false
 * @param {NPGIS3D.Color} opts.outlineColor-默认RED
 * @see {@linkcode http://localhost:807/3dmap/gis_manager/gis_demo.html#demos/Overlay/Wall.html| Wall Demo[内网]}
 * @see {@linkcode http://map.netposa.com:9500/3dmap/gis_manager/gis_demo.html#demos/Overlay/Wall.html| Wall Demo[外网]}
 */
NPGIS3D.Overlay.Wall = function(points, opts) {
    this._CESIUMTYPE = 'wall';
    var maximumHeights = [];
    var minimumHeights = [];
    opts = opts ? opts : {};
    opts.height = opts.height?opts.height:10;
    var newPoints=[];
    for (var i = points.length - 1; i >= 0; i--) {
        maximumHeights.push(points[i].h + opts.height);
        minimumHeights.push(points[i].h);
        newPoint = NPGIS3D.NPCoordinate.coordinateTransByBasemap(points[i].lon, points[i].lat);
        newPoints.push(newPoint);
    }
    opts = NPGIS3D.NPUtil.extend(opts, {
        maximumHeights: maximumHeights,
        minimumHeights: minimumHeights,
        material: Cesium.Color.GREEN,
        outline: !0,
        outlineColor: Cesium.Color.RED
    });
    NPGIS3D.Overlay.call(this);
    var wall = new Cesium.WallGraphics(opts);
    wall.positions = NPGIS3D.NPCoordinate.fromNPCartesian3List(newPoints);
    this._entity[this._CESIUMTYPE] = wall;
};


/**
 * 获取
 */
NPGIS3D.Overlay.Wall.prototype.getShow = function() {
    var e = this._entity[this._CESIUMTYPE]['show'];
    if (Cesium.defined(e)) {
        return e.getValue();
    }
};
/**
 * 设置
 */
NPGIS3D.Overlay.Wall.prototype.setShow = function(val) {
    if (Cesium.defined(val)) {
        this._entity[this._CESIUMTYPE]['show'] = val;
    }
};

/**
 * 获取
 */
NPGIS3D.Overlay.Wall.prototype.getFill = function() {
    var e = this._entity[this._CESIUMTYPE]['fill'];
    if (Cesium.defined(e)) {
        return e.getValue();
    }
};
/**
 * 设置
 */
NPGIS3D.Overlay.Wall.prototype.setFill = function(val) {
    if (Cesium.defined(val)) {
        this._entity[this._CESIUMTYPE]['fill'] = val;
    }
};

/**
 * 获取
 */
NPGIS3D.Overlay.Wall.prototype.getOutline = function() {
    var e = this._entity[this._CESIUMTYPE]['outline'];
    if (Cesium.defined(e)) {
        return e.getValue();
    }
};
/**
 * 设置
 */
NPGIS3D.Overlay.Wall.prototype.setOutline = function(val) {
    if (Cesium.defined(val)) {
        this._entity[this._CESIUMTYPE]['outline'] = val;
    }
};

/**
 * 获取
 */
// NPGIS3D.Overlay.Wall.prototype.getOutlinecolor = function() {
//     var e = this._entity[this._CESIUMTYPE]['outlineColor'];
//     if (Cesium.defined(e)) {
//         return e.getValue();
//     }
// };
/**
 * 设置
 */
NPGIS3D.Overlay.Wall.prototype.setOutlinecolor = function(val) {
    if (Cesium.defined(val)) {
        this._entity[this._CESIUMTYPE]['outlineColor'] = val;
    }
};

/**
 * 获取
 */
NPGIS3D.Overlay.Wall.prototype.getOutlinewidth = function() {
    var e = this._entity[this._CESIUMTYPE]['outlineWidth'];
    if (Cesium.defined(e)) {
        return e.getValue();
    }
};
/**
 * 设置
 */
NPGIS3D.Overlay.Wall.prototype.setOutlinewidth = function(val) {
    if (Cesium.defined(val)) {
        this._entity[this._CESIUMTYPE]['outlineWidth'] = val;
    }
};
/**
 * 设置材质
 */
NPGIS3D.Overlay.Wall.prototype.setMaterial = function(val) {
    if (Cesium.defined(val)) {
        if (val._) {
            this._entity[this._CESIUMTYPE]['material'] = val._;
        } else {
            this._entity[this._CESIUMTYPE]['material'] = val;
        }
    }
};
NPGIS3D.inherits(NPGIS3D.Overlay.Wall, NPGIS3D.Overlay);

/**
 * 信息窗
 * @requires InfoWindow.js
 * @class NPGIS3D.Overlay.InfoWindow
 *
 *
 * @constructor
 * @param {NPGIS3D.Geometry.Point} position - 位置,必须
 * @param {NPGIS3D.MAP3D} map - 位置,必须
 * @param {Object} dom - 填充dom
 * @param {Object} opt -
 */
NPGIS3D.Overlay.InfoWindow = function(position, map, dom, opt) {
    opt = opt || {
        infoSize: {
            h: '160px',
            w: ''
        }
    };
    var div = window.document.createElement('div');
    div.className = 'ol-popup';
    //div.style.zIndex = 1000;
    map.viewer.scene.canvas.parentElement.parentElement.appendChild(div);
    if(typeof dom == 'string'){
        div.innerHTML = dom;
    }else{
        div.appendChild(dom);
    }
    var viewer = map.viewer;
    position = NPGIS3D.NPUtil.CoordinateHelper.coordinateTransByBasemap(position.lon, position.lat,position.h);
    var c = map.getWindowCoordinates({
        x: position.lon,
        y: position.lat,
        z: position.h
    });
    var offset = opt.offset?opt.offset:{
        x:0,
        y:0
    };
    div.style.left = (c.x - 50 + offset.x) + 'px';
    div.style.top = (c.y - opt.infoSize.h + offset.y -11) + 'px';
    div.style.height = opt.infoSize.h+"px";
    div.style.width = opt.infoSize.w+"px";

    position = Cesium.Cartesian3.fromDegrees(position.lon, position.lat,position.h);

    var entity = new Cesium.Entity({
        position: position,
        show: false,
        point: {
            color: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.RED,
            outlineWidth: 1,
            pixelSize: 6
        }
    });
    viewer.entities.add(entity);

    var removeHandler = viewer.scene.postRender.addEventListener(function() {
        var changedC = Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, entity.position.getValue(Cesium.JulianDate.now())); //position);
        try {
            //if ((c.x !== changedC.x) || (c.y !== changedC.y)) {
            div.style.left = (c.x - 50 + offset.x) + 'px';
            div.style.top = (c.y - opt.infoSize.h + offset.y-22) + 'px';
            c = changedC;
            //}
        } catch (e) {}
    });
    /**
     * 显示
     */
    this.show = function() {
        div.style.display = '';
    };
    /**
     * 隐藏
     */
    this.hide = function() {
        div.style.display = 'none';
    };
    /**
     * 获取容器
     */
    this.getContainer = function() {
        return div;
    };
    /**
     * 移除
     */
    this.remove = function() {
        map.viewer.scene.canvas.parentElement.parentElement.removeChild(div);
        removeHandler.call();
        viewer.entities.remove(entity);
    };
}
NPGIS3D.inherits(NPGIS3D.Overlay.InfoWindow, NPGIS3D.Overlay);

/**
 * 模型
 * @requires NAPMAP3D.js
 * @class: NAPMAP3D.ModelLoader
 *
 * @constructor
 * @param {NPGIS3D.MAP3D} viewer 必须
 */
NPGIS3D.ModelLoader = function(viewer) {
	this._viewer = viewer;
	this._collection = new Cesium.PrimitiveCollection();

	this._modelMap = new NPGIS3D.HashMap();

	this._viewer.viewer.camera.changed.addEventListener(this._cameraChangedHandler, this);
};

/** 
 * 加载模型
 * @param {String} url - 模型地址,必须
 * @param {Object} position - 位置,必须
 * @param {Number} position.lon - 经度
 * @param {Number} position.lat - 纬度
 */
NPGIS3D.ModelLoader.prototype.loadModel = function(url, position) {
	this._collection.add(this._getModel(url, position));
	this._viewer.viewer.scene.groundPrimitives.add(this._collection);
};

/** 
 * 批量加载模型
 * @param {Object[]} modelArray 模型信息数组 {url:'',position:{lon:0,lat:0}}
 *
 */
NPGIS3D.ModelLoader.prototype.loadModels = function(modelArray) {
	if (!Cesium.defined(modelArray)) {
		throw new NPGIS3D.DeveloperError('NPGIS3D.ModelLoader', 'loadModels() 参数 modelArray 是必须项!');
	}

	if (!NPGIS3D.NPUtil.isArray(modelArray)) {
		throw new NPGIS3D.DeveloperError('NPGIS3D.ModelLoader', 'loadModels() 参数 modelArray 必须是数组!');
	}

	var i = modelArray.length - 1,
		item;

	for (i; i >= 0; i--) {
		item = modelArray[i];

		this._collection.add(this._getModel(item.url, item.position));
	}

	this._viewer.viewer.scene.groundPrimitives.add(this._collection);
};

/** 
 * 清除所有模型
 */
NPGIS3D.ModelLoader.prototype.removeAll = function() {
	if (this._collection.length > 0) {
		this._collection.removeAll();
	}
};

/** 
 * 显示所有模型
 *
 */
NPGIS3D.ModelLoader.prototype.show = function() {
	this._collection.show = true;
};

/** 
 * 隐藏所有模型
 *
 */
NPGIS3D.ModelLoader.prototype.hide = function() {
	this._collection.show = false;
};

/** 
 * destroy
 *
 */
NPGIS3D.ModelLoader.prototype.destroy = function() {
    this._viewer = null;
    this._collection = null;
};

// 控制模型是否显示，当模型和相机距离小于等于1000米时显示 
NPGIS3D.ModelLoader.prototype._cameraChangedHandler = function() {

	var cp = this._viewer.viewer.camera.positionWC,
		i = 0,
		count = this._collection.length,
		model,
		modelCartesian = new Cesium.Cartesian3(),
		dis;

	if (!this._collection.show) {
		this._collection.show = true;
	}

	for (i; i < count; i++) {
		model = this._collection.get(i);
		modelCartesian = Cesium.Matrix4.getTranslation(model.modelMatrix, modelCartesian);

		dis = Cesium.Cartesian3.distance(cp, modelCartesian);
		if (dis <= 1000) {
			model.show = true;
		} else {
			model.show = false;
		}
	}
};

//创建模型
//@param {String} url 模型地址
//@param {Object} position  位置
//@param {Number} position.lon
//@param {Number} position.lat
NPGIS3D.ModelLoader.prototype._getModel = function(url, position) {
	if (!Cesium.defined(url)) {
		throw new NPGIS3D.DeveloperError('NPGIS3D.ModelLoader', 'loadModel() 参数 url 是必须项!');
	}

	if (!Cesium.defined(position)) {
		throw new NPGIS3D.DeveloperError('NPGIS3D.ModelLoader', 'loadModel() 参数 position 是必须项!');
	}

	var p = NPGIS3D.NPUtil.CoordinateHelper.coordinateTransByBasemap(position.lon, position.lat),
		modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(Cesium.Cartesian3.fromDegrees(p.lon, p.lat, 0.0)),
		model = Cesium.Model.fromGltf({
			url: url,
			modelMatrix: modelMatrix,
			scale: 40,
			show:false
		});
	return model;
};

/**
 * 数据源基类
 * @requires NPGIS3D.js
 * @class NPGIS3D.DataSource
 *
 * @constructor
 */
NPGIS3D.DataSource = function() {
    'use strict';
};

/**
 * 处理建筑物的数据源
 * @requires NAPMAP3D.js
 * @requires NPGIS3D.Promise.js
 * @requires NPGIS3D.HttpPromise.js
 * @class NPGIS3D.DataSource.BuildingDataSource
 * @extends NPGIS3D.DataSource
 *
 * @constructor
 */
NPGIS3D.DataSource.BuildingDataSource = function(opts) {
    'use strict';
    this.color = opts.color?opts.color:"#d9ccbe";
    this.fillAlpha = opts.fillAlpha?opts.fillAlpha:1;
    NPGIS3D.DataSource.call(this);
};

// 加载数据
// @param {String} url - 数据地址,必须
// @param {String} key - 唯一标识,必须
NPGIS3D.DataSource.BuildingDataSource.prototype.load = function(url, key) {
    var promise = new NPGIS3D.Promise(),
        httpPromise = new NPGIS3D.HttpPromise(),
        material = NPGIS3D.NPUtil.hexToRgb(this.color),
        fillAlpha = this.fillAlpha,
        context = this;

    function loadJson() {
        return httpPromise.get(url, {});
    };

    loadJson().then(function(err, result) {
        var json,
            geometryInstances = [],
            i,
            ci,
            item,
            opts2,
            polygonGeometry,
            instance,
            primitive;

        if (!err) {
            if (result === '') {
                return;
            }
            json = JSON.parse(result);
            for (i = 1, ci = json.length; i < ci; i++) {
                item = json[i];
                opts2 = context._getOpts(item);
                polygonGeometry = new Cesium.PolygonGeometry(opts2);

                instance = new Cesium.GeometryInstance({
                    geometry: polygonGeometry,
                    id: item.id,
                    attributes: {
                        color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.fromBytes(material[0], material[1], material[2], fillAlpha * 255)),
                    }
                });
                instance.data = item;
                geometryInstances.push(instance);
            }

            primitive = new Cesium.Primitive({
                geometryInstances: geometryInstances,
                cull: true,
                interleave:true,
                // appearance: new Cesium.MaterialAppearance({
                //     material: new Cesium.Material({
                //         fabric: {
                //             type: 'Color',
                //             uniforms: {
                //                 color: Cesium.Color.fromBytes(material[0], material[1], material[2], fillAlpha * 255)
                //             }
                //         }
                //     }),
                //     translucent:false,
                //     faceForward:true,
                //     closed : false,
                //     renderState:{
                //         cull:{
                //             enabled:true,
                //             face:1029
                //         }
                //     }
                // })
                appearance:new Cesium.PerInstanceColorAppearance({
                    translucent:false,
                    faceForward:true,
                    closed : false,
                    renderState:{
                        cull:{
                            enabled:true,
                            face:1029
                        }
                    }
                })
            });

            primitive.instances = geometryInstances;
            promise.done(false, key, primitive);
        }
    });
    /*promise.when([loadJson()]).then(function(results) {
		var res0,
			result,
			json,
			geometryInstances = [],
			i,
			ci,
			item,
			opts2,
			polygonGeometry,
			instance,
			primitive;

		res0 = results[0];
		result = res0[1];
		if (result === '') {
			return;
		}
		json = JSON.parse(result);
		for (i = 1, ci = json.length; i < ci; i++) {
			item = json[i];
			opts2 = context._getOpts(item);
			polygonGeometry = new Cesium.PolygonGeometry(opts2);

			instance = new Cesium.GeometryInstance({
				geometry: polygonGeometry,
				id: item.id
			});

			geometryInstances.push(instance);
		}

		primitive = new Cesium.Primitive({
			geometryInstances: geometryInstances,
			cull: false,
			appearance: new Cesium.MaterialAppearance({
				material: new Cesium.Material({
					fabric: {
						type: 'Color',
						uniforms: {
							color: Cesium.Color.fromBytes(material[0], material[1], material[2], fillAlpha * 255)
						}
					}
				})

			})

		});

		primitive.instances = geometryInstances;
		promise.done(null, key, primitive);
	});*/

    return promise;
};


NPGIS3D.DataSource.BuildingDataSource.prototype._getOpts = function(item) {
    var polygonItem = item.polygon,
        hierarchy = polygonItem.positions.cartographicDegrees,
        newHierarchy,
        extrudedHeightItem,
        extrudedHeight,
        options;

    if (!NPGIS3D.NPUtil.isArray(hierarchy) || hierarchy.length <= 2) {
        throw new NPGIS3D.DeveloperError('NPGIS3D.BuildingDataSource', '参数 cartographicDegrees 不正确!' + item.id);
    }

    // 坐标系转换
    newHierarchy = this._coordinateTransHeights(hierarchy);

    extrudedHeightItem = polygonItem.extrudedHeight;
    extrudedHeight = extrudedHeightItem.number;

    options = {
        polygonHierarchy: new Cesium.PolygonHierarchy(
            Cesium.Cartesian3.fromDegreesArrayHeights(newHierarchy)
        ),
        perPositionHeight: false,
        vertexFormat : Cesium.VertexFormat.POSITION_AND_NORMAL,
        extrudedHeight: extrudedHeight
    };
    options.closeTop = true;
    options.closeBottom = false;
    // options.outline = true;
    // options.outlineColor = Cesium.Color.WHITE;
    // options.outlineWidth = 4;
    return options;
};

NPGIS3D.DataSource.BuildingDataSource.prototype._coordinateTransHeights = function(hierarchy) {
    var length = hierarchy.length,
        newHierarchy = new Array(),
        i,
        lon,
        lat,
        h,
        wgs84;

    for (i = 0; i < length; i += 3) {
        lon = hierarchy[i];
        lat = hierarchy[i + 1];
        h = hierarchy[i + 2];

        wgs84 = NPGIS3D.NPUtil.CoordinateHelper.coordinateTransByBasemap(lon, lat);

        newHierarchy.push(wgs84.lon);
        newHierarchy.push(wgs84.lat);
        newHierarchy.push(h);
    }

    return newHierarchy;
};

NPGIS3D.inherits(NPGIS3D.DataSource.BuildingDataSource, NPGIS3D.DataSource);

/**
 * 处理建筑物的数据源
 * @requires NAPMAP3D.js
 * @requires NPGIS3D.Promise.js
 * @requires NPGIS3D.HttpPromise.js
 * @class NPGIS3D.DataSource.BuildingDataSourceEntity
 * @extends NPGIS3D.DataSource
 *
 * @constructor
 * @param {Function}  callback - 回调函数
 */
NPGIS3D.DataSource.BuildingDataSourceEntity = function(callback,opts) {
	'use strict';
	NPGIS3D.DataSource.call(this);
	this.color = opts.color?opts.color:"#f0ede5";
    this.fillAlpha = 1;//opts.fillAlpha?opts.fillAlpha:1;//因为entity模式下透明效果有问题，展示不支持透明
	this._callback = callback;
};

// 加载数据
// @param {String} url - 数据地址,必须
// @param {String} key - 唯一标识,必须
NPGIS3D.DataSource.BuildingDataSourceEntity.prototype.load = function(url, key) {
	var promise = new NPGIS3D.Promise(),
		httpPromise = new NPGIS3D.HttpPromise(),
		context = this;

	function loadJson() {
		return httpPromise.get(url, {});
	};
	var that = this;
	loadJson().then(function(err, result) {
		var json,
			i,
			ci,
			item,
			hierarchy,
			newHierarchy,
			dataSource,
			entity;

		if (!err) {
			json = JSON.parse(result);
			dataSource = new Cesium.CustomDataSource('building_' + key);
			for (i = 1, ci = json.length; i < ci; i++) {
				item = json[i];

				hierarchy = item.polygon.positions.cartographicDegrees;
				// 坐标系转换
				newHierarchy = context._coordinateTransHeights(hierarchy);
				entity = context._getEntity(item, newHierarchy);
				entity.overlay = item;
				entity.overlay._entity = entity;
				entity.overlay.events = {};
				entity.overlay.events["click"] = that._callback;
				dataSource.entities.add(entity);
			}
			promise.done(false, key, dataSource);
		}
	});

	/*promise.when([loadJson()]).then(function(results) {
		var res0,
			result,
			json,
			i,
			ci,
			item,
			hierarchy,
			newHierarchy,
			dataSource,
			entity;

		res0 = results[0];
		result = res0[1];
		if (result === '') {
			return;
		}
		json = JSON.parse(result);
		dataSource = new Cesium.CustomDataSource('building_' + key);

		for (i = 1, ci = json.length; i < ci; i++) {
			item = json[i];

			hierarchy = item.polygon.positions.cartographicDegrees;
			// 坐标系转换
			newHierarchy = context._coordinateTransHeights(hierarchy);
			entity = context._getEntity(item, newHierarchy);
			entity.overlay = item;
			entity.overlay._entity = entity;
			entity.overlay.events = {};
			entity.overlay.events["click"] = that._callback;
			dataSource.entities.add(entity);
		}
		promise.done(null, key, dataSource);
	});
*/
	return promise;
};

// 获取建筑 entity，分两种情况：1.不分拆，2.把建筑分拆成围墙和顶  
NPGIS3D.DataSource.BuildingDataSourceEntity.prototype._getEntity = function(item, newHierarchy) {
	var entity = new Cesium.Entity({
		id: 'building_' + NPGIS3D.NPUtil.UUID()
	});

	// 建筑不拆分
	entity.polygon = this._getPolygonGraphics(item, newHierarchy);
	item.description = item.description !== "" ? item.description : "未命名";
	entity.description = "<span>名称：" + item.description+"</span>";

	// 把建筑分拆成两部分
	//entity.polygon = this._getTopGraphics(item, newHierarchy);
	//entity.wall = this._getWallGraphics(newHierarchy);

	return entity;
};

// 不分拆建筑的情况下获取 Graphics
NPGIS3D.DataSource.BuildingDataSourceEntity.prototype._getPolygonGraphics = function(item, hierarchy) {
	var opts = this._getPolygonOpts(item),
		polygonGraphics = new Cesium.PolygonGraphics(opts);
	polygonGraphics.hierarchy = Cesium.Cartesian3.fromDegreesArrayHeights(hierarchy);

	return polygonGraphics;
};

// 分拆建筑的情况下获取围墙 Graphics
NPGIS3D.DataSource.BuildingDataSourceEntity.prototype._getWallGraphics = function(positions) {
	var material = NPGIS3D.NPUtil.hexToRgb(this.color),
		alpha = this.fillAlpha;
	return new Cesium.WallGraphics({
		positions: Cesium.Cartesian3.fromDegreesArrayHeights(positions),
		material: Cesium.Color.fromBytes(material[0], material[1], material[2], alpha * 255)
	});
};

// 分拆建筑的情况下获取顶 Graphics
NPGIS3D.DataSource.BuildingDataSourceEntity.prototype._getTopGraphics = function(item, hierarchy) {
	var opts = this._getTopOpts(item),
		polygonGraphics = new Cesium.PolygonGraphics(opts);
	polygonGraphics.hierarchy = Cesium.Cartesian3.fromDegreesArrayHeights(hierarchy);

	return polygonGraphics;
};

// 不分拆建筑的情况下获取 Graphics 的 options
NPGIS3D.DataSource.BuildingDataSourceEntity.prototype._getPolygonOpts = function(item) {
	var polygonItem = item.polygon,
		extrudedHeightItem = polygonItem.extrudedHeight,
		extrudedHeight = extrudedHeightItem.number,
		material = NPGIS3D.NPUtil.hexToRgb(this.color),
		alpha = this.fillAlpha,
		options;

	options = {
		id: item.id,
		perPositionHeight: true,
		extrudedHeight: extrudedHeight,
		material: Cesium.Color.fromBytes(material[0], material[1], material[2], alpha * 255),
		closeTop: false,
		closeBottom: true
	};

	return options;
};

// 分拆建筑的情况下获取顶 Graphics 的 options
NPGIS3D.DataSource.BuildingDataSourceEntity.prototype._getTopOpts = function(item) {
	var polygonItem = item.polygon,
		material = NPGIS3D.NPUtil.hexToRgb(this.color),
		alpha = this.fillAlpha,
		options;

	options = {
		height: 50,
		material: Cesium.Color.fromBytes(material[0], material[1], material[2], alpha * 255),
		closeTop: false,
		closeBottom: true
	};

	return options;
};

// 根据底图类型转换坐标
NPGIS3D.DataSource.BuildingDataSourceEntity.prototype._coordinateTransHeights = function(hierarchy) {
	var length = hierarchy.length,
		newHierarchy = new Array(),
		i,
		lon,
		lat,
		h,
		wgs84;

	for (i = 0; i < length; i += 3) {
		lon = hierarchy[i];
		lat = hierarchy[i + 1];
		h = hierarchy[i + 2];

		wgs84 = NPGIS3D.NPUtil.CoordinateHelper.coordinateTransByBasemap(lon, lat);

		newHierarchy.push(wgs84.lon);
		newHierarchy.push(wgs84.lat);
		newHierarchy.push(h);
	}

	return newHierarchy;
};

NPGIS3D.inherits(NPGIS3D.DataSource.BuildingDataSourceEntity, NPGIS3D.DataSource);
/**
 * 加载建筑物
 * @requires NPGIS3D.CzmlDataSource.js
 * @class NPGIS3D.LoadBuilding
 *
 * @constructor
 * @param {NPGIS3D.MAP3D} viewer,必须
 * @param {String} url -数据地址,必须
 * @param {Object} opts
 * @param {Number}  opts.maxDistance - 默认3000
 * @param {Number}  opts.maxHeight - 默认5000
 * @param {NPGIS3D.Geometry.Extent}  opts.extent - 默认中国范围 (73.55,3.85,135.08333333333334,53.55)
 */
NPGIS3D.Building.LoadBuilding = function(viewer, url, opts) {
    'use strict';
    this._url = url;
    this._events = {};
    this._visiblity = true;
    this._viewer = viewer;
    this._T_C_DISTANCE = (opts && opts.maxDistance) ? opts.maxDistance : 3000;
    this._CAMERA_HEIGHT = (opts && opts.maxHeight) ? opts.maxHeight : 5000;
    this.ORIGIN_LON = -180;
    this._isLoad = false;
    this.ORIGIN_LAT = 90;
    this.MAP_LEVEL = 16;
    this.coef = 360.0 / Math.pow(2, this.MAP_LEVEL);
    this.hashMap = new NPGIS3D.HashMap();
    this.camera = this._viewer.viewer.camera;
    this.scene = this._viewer.viewer.scene;
    this.ellipsoid = this._viewer.viewer.scene.globe.ellipsoid;
    this.isInteraction = false;
    this._extent = (opts && opts.extent) ? opts.extent : new NPGIS3D.Geometry.Extent(73.55, 3.85, 135.08333333333334, 53.55);
    this._boundExtent = this._getBound();
    this.color = opts && opts.color?opts.color:"#f0ede5";
    this.fillAlpha = opts && opts.fillAlpha?opts.fillAlpha:1;
};

/**
 * 添加事件监听函数
 * @event
 * @param {String} event - 事件类型,必须
 * @param {Function} handler - 回调函数
 */
NPGIS3D.Building.LoadBuilding.prototype.addEventListener = function(event, callback) {
    if (event === "click") {
        this._clearAll();
        this.isInteraction = true;
        this._events["click"] = callback;
        if (this._isLoad) {
            this._loadBuildingData();
        }
    }
};

/**
 * 移除事件监听函数
 * @param {String} event - 事件类型,必须
 */
NPGIS3D.Building.LoadBuilding.prototype.removeEventListener = function(event) {
    if (event === "click") {
        this._events["click"] = null;
        this._clearAll();
        if(this.removeHandler){
            this.removeHandler.call();
        }
        this.isInteraction = false;
        this._loadBuildingData();
    }
};

/**  
 *  加载
 */
NPGIS3D.Building.LoadBuilding.prototype.load = function() {
    var that = this;
    this._isLoad = true;
    this.camera.changed.addEventListener(this._loadBuildingData, this);
    this._loadBuildingData();
    var handler = new Cesium.ScreenSpaceEventHandler(this.scene.canvas);
    //设置单击事件的处理句柄
    handler.setInputAction( function( movement )
    {
        var pick = that.scene.pick( movement.position );
        if (Cesium.defined(pick))
        {
            console.log(pick.id);
        }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK );
};

/**  
 *  显示
 */
NPGIS3D.Building.LoadBuilding.prototype.show = function() {
    this._visiblity = true;
    if (this._isLoad) {
        this._loadBuildingData();
    }
};

/**  
 *  隐藏
 */
NPGIS3D.Building.LoadBuilding.prototype.hide = function() {
    this._visiblity = false;
    this._clearAll();
};
/**  
 *  销毁
 */
NPGIS3D.Building.LoadBuilding.prototype.destory = function() {
    this._visiblity = false;
    this._clearAll();
    this.camera.changed.removeEventListener(this._loadBuildingData, this);
};

NPGIS3D.Building.LoadBuilding.prototype._clearAll = function() {
    if (this.isInteraction) {
        this._remoreBuildingDs();
    } else {
        this._remoreBuildingPt();
    }
    this.hashMap.clear();
};

NPGIS3D.Building.LoadBuilding.prototype._loadBuildingData = function() {
    if (!this._visiblity) {
        return;
    }
    if(this.camera.pitch/3.1415926*180>-9){
        return;
    }
    var cameraHeight = this.ellipsoid.cartesianToCartographic(this.camera.position).height,
        cameraCenter,
        cameraViewRect,
        minRow,
        maxRow,
        minCol,
        maxCol;

    if (cameraHeight > this._CAMERA_HEIGHT) {
        this._clearAll();
        return;
    }

    cameraCenter = this._cameraCenterToWebMoctor();

    cameraViewRect = this._cameraViewRectToTileScope();
    minRow = cameraViewRect.minRow;
    maxRow = cameraViewRect.maxRow;
    minCol = cameraViewRect.minCol;
    maxCol = cameraViewRect.maxCol;

    this.hashMap = this._remove(minRow, maxRow, minCol, maxCol);

    this._loadBuildingTiles(minRow, maxRow, minCol, maxCol, cameraCenter);
};

// 使用 Entity 时清除全部
NPGIS3D.Building.LoadBuilding.prototype._remoreBuildingDs = function() {
    var dsc = this.hashMap.values(),
        dscLength = dsc.length,
        i;
    for (i = 0; i < dscLength; i++) {
        this._viewer.viewer.dataSources.remove(dsc[i].dataSource, true);
    }
};

NPGIS3D.Building.LoadBuilding.prototype._remoreBuildingPt = function() {
    var dsc = this.hashMap.values(),
        dscLength = dsc.length,
        i;
    for (i = 0; i < dscLength; i++) {
        this._viewer.viewer.scene.primitives.remove(dsc[i].dataSource, true);
    }
};

// 加载建筑切片
NPGIS3D.Building.LoadBuilding.prototype._loadBuildingTiles = function(minRow, maxRow, minCol, maxCol, cameraCenter) {
    var i,
        j,
        key,
        tileURL;

    for (i = minRow; i < maxRow + 1; i++) {
        for (j = minCol; j < maxCol + 1; j++) {

            if (!this._isRequestTile(i, j, cameraCenter)) {
                continue;
            }

            key = this.MAP_LEVEL + '_' + i + '_' + j;

            tileURL = this._url + '/' + key + '.czml';

            if (!this.hashMap.containsKey(key)) {
                if (this.isInteraction) {
                    // 使用 Entity
                    this._loadBuildingTileForEntity(tileURL, key);
                } else {
                    // 使用 Primitive
                    this._loadBuildingTile(tileURL, key);
                }
            }
        }
    }
};

// 判断是否可以请求切片，相机中心点距切片终点距离和切片行列号都必须满足条件
NPGIS3D.Building.LoadBuilding.prototype._isRequestTile = function(row, col, cameraCenter) {
    var isRequest = true,
        minLon = row * this.coef + this.ORIGIN_LON,
        maxLon = (row + 1) * this.coef + this.ORIGIN_LON,
        minLat = this.ORIGIN_LAT - (col + 1) * this.coef,
        maxLat = this.ORIGIN_LAT - col * this.coef,

        tileCenter = _3dhelper.degreeToWebMoctor((minLon + maxLon) / 2, (minLat + maxLat) / 2),

        dis = Math.sqrt(Math.pow(cameraCenter.lon - tileCenter.lon, 2) + Math.pow(cameraCenter.lat - tileCenter.lat, 2));

    if (dis > this._T_C_DISTANCE || !this._isInBoundExtent(row, col)) {
        isRequest = false;
    }
    
    return isRequest;
};

// 请求的切片行列号是否在控制范围内
NPGIS3D.Building.LoadBuilding.prototype._isInBoundExtent = function(row, col) {
    var isIn = true;

    /*var offset = this._getIncremental();

    if (row - offset < this._boundExtent.minRow || row + offset > this._boundExtent.maxRow || col - offset < this._boundExtent.minCol || col + offset > this._boundExtent.maxCol) {
        isIn = false;
    }*/

    if (row < this._boundExtent.minRow || row > this._boundExtent.maxRow || col < this._boundExtent.minCol || col > this._boundExtent.maxCol) {
        isIn = false;
    }

    return isIn;
};

 /* 
 *
 * 行列号缓冲增量
 *
 */
/*NPGIS3D.Building.LoadBuilding.prototype._getIncremental = function() {
    var offset = 1,
        rec = new Cesium.Rectangle(),

        result = this.camera.computeViewRectangle(Cesium.Ellipsoid.WGS84, rec),

        minX = Cesium.Math.toDegrees(result.west),

        maxX = Cesium.Math.toDegrees(result.east),

        minRow = Math.floor((minX - this.ORIGIN_LON) / this.coef),
        maxRow = Math.ceil((maxX - this.ORIGIN_LON) / this.coef);

    if (maxRow - minRow < 4) {
        offset = 2;
    }

    return offset;
};*/

// 建筑物范围
NPGIS3D.Building.LoadBuilding.prototype._getBound = function() {
    var rect = {
            minRow: 0,
            maxRow: 0,
            minCol: 0,
            maxCol: 0
        },

        northwestPoint = NPGIS3D.NPUtil.CoordinateHelper.coordinateTransByBasemap(this._extent.xmin, this._extent.ymax),
        southeastPoint = NPGIS3D.NPUtil.CoordinateHelper.coordinateTransByBasemap(this._extent.xmax, this._extent.ymin),


        minX = northwestPoint.lon,
        maxY = northwestPoint.lat,
        maxX = southeastPoint.lon,
        minY = southeastPoint.lat;

    rect.minRow = Math.floor((minX - this.ORIGIN_LON) / this.coef);
    rect.maxRow = Math.ceil((maxX - this.ORIGIN_LON) / this.coef);
    rect.minCol = Math.floor((this.ORIGIN_LAT - maxY) / this.coef);
    rect.maxCol = Math.ceil((this.ORIGIN_LAT - minY) / this.coef);

    return rect;
};

// 使用 Primitive 加载建筑单个切片
NPGIS3D.Building.LoadBuilding.prototype._loadBuildingTile = function(tileURL, key) {
    var promise = new NPGIS3D.Promise(),
        buildingDataSource = new NPGIS3D.DataSource.BuildingDataSource({
            color:this.color,
            fillAlpha:this.fillAlpha
        });

    function czmlLoaded() {
        return buildingDataSource.load(tileURL, key);
    };
    var that = this;
    promise.when([czmlLoaded()]).then(function(results) {
        var res0,
            rkey,
            primitive,
            vObj;

        res0 = results[0];
        rkey = res0[1];

        primitive = res0[2];
        primitive.key = rkey;
        for (var i = 0; i < that.scene.primitives.length; i++) {
            if (that.scene.primitives.get(i).key === rkey) {
                return;
            }
        }
        that.scene.primitives.add(primitive);

        vObj = {
            'dataSource': primitive,
            'state': false
        };
        that.hashMap.put(rkey, vObj);

        primitive = null;
    });
};

// 使用 Entity 加载建筑单个切片
NPGIS3D.Building.LoadBuilding.prototype._loadBuildingTileForEntity = function(tileURL, key) {
    var promise = new NPGIS3D.Promise(),
        buildingDataSource = new NPGIS3D.DataSource.BuildingDataSourceEntity(this._events["click"],{
            color:this.color,
            fillAlpha:this.fillAlpha
        });

    function czmlLoaded() {
        return buildingDataSource.load(tileURL, key);
    };
    var that = this;
    promise.when([czmlLoaded()]).then(function(results) {
        var res0 = results[0],
            rkey = res0[1],
            dataSource = res0[2],
            vObj;
        dataSource.key = rkey;
        for (var i = 0; i < that._viewer.viewer.dataSources.length; i++) {
            if (that._viewer.viewer.dataSources.get(i).key === rkey) {
                return;
            }
        }
        that._viewer.viewer.dataSources.add(dataSource);

        vObj = {
            'dataSource': dataSource,
            'state': false
        };
        that.hashMap.put(rkey, vObj);
    });
};

// camera 中心墨卡托坐标
NPGIS3D.Building.LoadBuilding.prototype._cameraCenterToWebMoctor = function() {
    var cp = this.camera.positionWC,
        wgs84 = this.ellipsoid.cartesianToCartographic(cp),
        coord_xyz = this.ellipsoid.cartographicToCartesian(wgs84),

        cameraLon = Cesium.Math.toDegrees(wgs84.longitude),
        cameraLat = Cesium.Math.toDegrees(wgs84.latitude);

    return _3dhelper.degreeToWebMoctor(cameraLon, cameraLat);
};

// camera 视野范围计算切片范围，最小行/列号，最大行/列号
NPGIS3D.Building.LoadBuilding.prototype._cameraViewRectToTileScope = function() {
    var rect = {
            minRow: 0,
            maxRow: 0,
            minCol: 0,
            maxCol: 0
        },

        rec = new Cesium.Rectangle(),

        result = this.camera.computeViewRectangle(Cesium.Ellipsoid.WGS84, rec),

        minX = Cesium.Math.toDegrees(result.west),
        minY = Cesium.Math.toDegrees(result.north),
        maxX = Cesium.Math.toDegrees(result.east),
        maxY = Cesium.Math.toDegrees(result.south),

        minRow = Math.floor((minX - this.ORIGIN_LON) / this.coef),
        maxRow = Math.ceil((maxX - this.ORIGIN_LON) / this.coef),
        maxCol = Math.floor((this.ORIGIN_LAT - maxY) / this.coef),
        minCol = Math.ceil((this.ORIGIN_LAT - minY) / this.coef);
    var offset = 1;
    if (maxRow - minRow < 4) {
        offset = 2;
    }
    minRow -= offset;
    maxRow += offset;

    minCol -= offset;
    maxCol += offset;

    rect.minRow = minRow;
    rect.maxRow = maxRow;
    rect.minCol = minCol;
    rect.maxCol = maxCol;

    return rect;
};

// 清除加载的建筑物
NPGIS3D.Building.LoadBuilding.prototype._remove = function(minRow, maxRow, minCol, maxCol) {
    var newHashMap = new NPGIS3D.HashMap(),
        i,
        j,
        key,
        keys = this.hashMap.keys(),
        k;

    for (i = minRow; i < maxRow + 1; i++) {
        for (j = minCol; j < maxCol + 1; j++) {
            key = this.MAP_LEVEL + '_' + i + '_' + j;
            var cameraCenter = this._cameraCenterToWebMoctor();
            var minLon = i * this.coef + this.ORIGIN_LON;
            var maxLon = (i + 1) * this.coef + this.ORIGIN_LON;
            var minLat = this.ORIGIN_LAT - (j + 1) * this.coef;
            var maxLat = this.ORIGIN_LAT - j * this.coef;
            var tileCenter = _3dhelper.degreeToWebMoctor((minLon + maxLon) / 2, (minLat + maxLat) / 2);
            var dis = Math.sqrt(Math.pow(cameraCenter.lon - tileCenter.lon, 2) + Math.pow(cameraCenter.lat - tileCenter.lat, 2));
            if (dis > this._T_C_DISTANCE) {
                if (this.hashMap.containsKey(key)) {
                    this.hashMap.get(key).state = false;
                }
            }
            if (this.hashMap.containsKey(key)) {
                this.hashMap.get(key).state = true;
            }
        }
    }

    for (i = keys.length - 1; i >= 0; i--) {
        k = keys[i];

        if (!this.hashMap.get(k).state) {
            if (this.isInteraction) {
                // 使用 Entity 的情况
                this._viewer.viewer.dataSources.remove(this.hashMap.get(k).dataSource);
            } else {
                // 使用 Primitive 的情况
                this.scene.primitives.remove(this.hashMap.get(k).dataSource);
            }
        } else {
            this.hashMap.get(k).state = false;
            newHashMap.put(k, this.hashMap.get(k));
        }
    }
    return newHashMap;
};

/**
 * 轨迹
 * @requires NAPMAP3D.js
 * @requires NPGIS3D.Camera.js
 * @class NAPMAP3D.Trajectory
 *
 * @constructor
 * @param {NPGIS3D.MAP3D} viewer - 必须
 */
NPGIS3D.Trajectory = function(viewer) {
    'use strict';

    this.camera = new NPGIS3D.Camera(viewer);
};

/**
 *
 * 轨迹播放
 *
 * @param {NPGIS3D.Geometry.Polyline} polyline 几何,必须
 * @param {Object} opts  属性
 * @param {number} opts.isLoop - 是否循环，默认 false ,此属性不开放
 * @param {number} opts.multiplier - 速度倍数，默认 10
 * @param {number} opts.color - 轨迹线颜色，默认 #FF0000
 * @param {number} opts.width - 轨迹线宽度，默认 5
 * @param {number} opts.follow - camera 是否跟随，默认 true
 */
NPGIS3D.Trajectory.prototype.play = function(polyline, opts) {
    this.camera.trackDrive(polyline, opts);
};

/**
 * 估计停止
 */
NPGIS3D.Trajectory.prototype.stop = function() {
    this.camera.stopTrack();
};

NPGIS3D.Tools = NPGIS3D.Tools || {};
/**
 * 绘制工具
 * @requires NAPMAP3D.js
 * @class NPGIS3D.Tools.DrawingTool
 *
 * @constructor
 * @param {NPGIS3D.MAP3D} viewer,必须
 * @param {String} container - div容器,必须
 */
NPGIS3D.Tools.DrawingTool = function(viewer, container) {
    // this._drawHelper = new DrawHelper(viewer.viewer, container);
    this._viewer = viewer.viewer;
    // this._drawCollection = new Cesium.PrimitiveCollection();
    // this._viewer.scene.primitives.add(this._drawCollection);
};


/**
 * 启动绘制功能
 * @param {String} mode - 绘制类型,必须
 * @param {Function} callback - 回调函数
 */
NPGIS3D.Tools.DrawingTool.prototype.setMode = function(mode, callback, options) {
    var ces_mode = Cesium.DrawMode.Point;
    switch (mode) {
        case NPGIS3D.DrawingMode.MARKER:
            //this.drawMarker(callback, options);
            ces_mode = Cesium.DrawMode.Marker;
            break;
        case NPGIS3D.DrawingMode.POLYLINE:
            //this.drawPolyline(callback, options);
            ces_mode = Cesium.DrawMode.Line;
            break;
        case NPGIS3D.DrawingMode.POLYGON:
            ces_mode = Cesium.DrawMode.Polygon;
            break;
        // case NPGIS3D.DrawingMode.CIRCLE:
        //     this.drawCircle(callback, options);
        //     break;
        // case NPGIS3D.DrawingMode.EXTENT:
        //     this.drawExtent(callback, options);
        //     break;
        default:
            this.drawClean();
            return;
    }
    if(this._handler){
        this._handler.clear();
        this._handler.deactivate();
    }
    this._handler = new Cesium.DrawHandler(this._viewer,ces_mode,0);
    //激活处理器
    var that = this;
    this._handler.drawEvt.addEventListener(function(result){
        var obj;
        
        if(ces_mode == Cesium.DrawMode.Line){
           var geoLine = NPGIS3D.NPCoordinate.positionsToPolylineGeo(result.object.positions);
           for(var i=0;i<geoLine.paths[0].length;i++){
               if(geoLine.paths[0][i].h < 0){
                   geoLine.paths[0][i].h = 0;
               }
           }
           obj = new NPGIS3D.Overlay.Polyline(geoLine);
           that._handler.clear();
        }else if(ces_mode == Cesium.DrawMode.Polygon){
           var geoPolygon = NPGIS3D.NPCoordinate.positionsToPolygonGeo(result.object.positions);
           for(var i=0;i<geoPolygon.rings[0].length;i++){
               if(geoPolygon.rings[0][i].h < 0){
                   geoPolygon.rings[0][i].h = 0;
               }
           }
           obj = new NPGIS3D.Overlay.Polygon(geoPolygon);
           that._handler.polygon.show=false;
           that._handler.polyline.show=false;
        }else if(ces_mode == Cesium.DrawMode.Marker){
           var geoPoint = NPGIS3D.NPCoordinate.cartesianToPointGeo(result.object.position);
           console.log(geoPoint);
           if(geoPoint.h<0){
               geoPoint.h = 0;
           }
           obj = new NPGIS3D.Overlay.Marker(geoPoint);
           that._handler.clear();
        }
        callback(obj);
    });
    this._handler.activeEvt.addEventListener(function(isActive){
        if(isActive == true){
            that._viewer.enableCursorStyle = false;
            that._viewer._element.style.cursor = 'crosshair';
        }
        else{
            that._viewer._element.style.cursor = '';
            that._viewer.enableCursorStyle = true;
        }
    });
    this._handler.activate();
};

/**
 * 清除绘制要素
 */
NPGIS3D.Tools.DrawingTool.prototype.drawClean = function() {
    if(this._handler){
        this._handler.deactivate();
        this._handler.clear();
    }
    // var i,
    //     drawLength = this._drawCollection.length,
    //     drawPrimitive;

    // for (var i = drawLength - 1; i >= 0; i--) {
    //     drawPrimitive = this._drawCollection.get(i);
    //     try {
    //         drawPrimitive.setEditMode(false);
    //     } catch (e) {
    //         // marker 没有 setEditMode()
    //     }
    //     this._viewer.scene.primitives.remove(drawPrimitive);
    // }
    // this._drawCollection._primitives = [];
    // this._drawHelper.stopDrawing();
};

/**
 * 绘制圆形
 * @param {Function} callback - 回调函数
 */
NPGIS3D.Tools.DrawingTool.prototype.drawCircle = function(callback, options) {
    var that = this;
    this._drawHelper.startDrawingCircle({
        callback: function(event) {
            var center = event.center,
                radius = event.radius,
                scene = event.scene,
                circle = new DrawHelper.CirclePrimitive({
                    center: center,
                    radius: radius,
                    material: Cesium.Material.fromType(Cesium.Material.RimLightingType)
                }),
                circleGeo;

            if (typeof callback === 'function') {
                circleGeo = new NPGIS3D.Geometry.Circle(NPGIS3D.NPCoordinate.cartesianToPointGeo(center), radius);
                callback(circleGeo);
            }

            scene.primitives.add(circle);
            that._drawCollection.add(circle);
            //NPUtil.enhanceWithListeners(circle);

            circle.setEditable();
            circle.addListener('onEdited', function(event) {
                if (typeof callback === 'function') {
                    circleGeo = new NPGIS3D.Geometry.Circle(NPGIS3D.NPCoordinate.cartesianToPointGeo(event.center), event.radius);
                    callback(circleGeo);
                }
            });
        }
    });
};

/**
 * 绘制范围
 * @param {Function} callback - 回调函数
 */
NPGIS3D.Tools.DrawingTool.prototype.drawExtent = function(callback, options) {
    var that = this;
    this._drawHelper.startDrawingExtent({
        callback: function(event) {
            var extent = event.extent,
                scene = event.scene,
                extentPrimitive = new DrawHelper.ExtentPrimitive({
                    extent: extent,
                    material: Cesium.Material.fromType(Cesium.Material.RimLightingType)
                }),
                extentGeo;

            if (typeof callback === 'function') {
                extentGeo = NPGIS3D.NPCoordinate.extentToExtentGeo(extent);
                callback(extentGeo);
            }

            scene.primitives.add(extentPrimitive);
            that._drawCollection.add(extentPrimitive);
            //NPUtil.enhanceWithListeners(extent);

            extentPrimitive.setEditable();
            extentPrimitive.addListener('onEdited', function(event) {
                if (typeof callback === 'function') {
                    extentGeo = NPGIS3D.NPCoordinate.extentToExtentGeo(event.extent);
                    callback(extentGeo);
                }
            });
        }
    });
};

/**
 * 绘制多边形
 * @param {Function} callback - 回调函数
 */
NPGIS3D.Tools.DrawingTool.prototype.drawPolygon = function(callback, options) {
    var that = this;
    this._drawHelper.startDrawingPolygon({
        callback: function(event) {
            var positions = event.positions,
                scene = event.scene,
                polygon = new DrawHelper.PolygonPrimitive({
                    positions: positions,
                    material: Cesium.Material.fromType(Cesium.Material.RimLightingType)
                }),
                polygonGeo;

            if (typeof callback === 'function') {
                polygonGeo = NPGIS3D.NPCoordinate.positionsToPolygonGeo(positions);
                callback(polygonGeo);
            }

            scene.primitives.add(polygon);
            that._drawCollection.add(polygon);
            //NPUtil.enhanceWithListeners(polygon);

            polygon.setEditable();
            polygon.addListener('onEdited', function(event) {
                positions = event.positions;
                if (typeof callback === 'function') {
                    polygonGeo = NPGIS3D.NPCoordinate.positionsToPolygonGeo(positions);
                    callback(polygonGeo);
                }
            });
        }
    });
};

/**
 * 绘制线
 * @param {Function} callback - 回调函数
 */
NPGIS3D.Tools.DrawingTool.prototype.drawPolyline = function(callback, options) {
    var that = this;
    this._drawHelper.startDrawingPolyline({
        callback: function(event) {
            var positions = event.positions,
                scene = event.scene,
                polyline = new DrawHelper.PolylinePrimitive({
                    positions: positions,
                    width: 5,
                    material: Cesium.Material.fromType(Cesium.Material.RimLightingType),
                    geodesic: true
                }),
                polylineGeo;

            polylineGeo;

            if (typeof callback === 'function') {
                polylineGeo = NPGIS3D.NPCoordinate.positionsToPolylineGeo(positions);
                callback(polylineGeo);
            }


            scene.primitives.add(polyline);
            that._drawCollection.add(polyline);
            //NPUtil.enhanceWithListeners(polyline);

            polyline.setEditable();
            polyline.addListener('onEdited', function(event) {
                positions = event.positions;
                if (typeof callback === 'function') {
                    polylineGeo = NPGIS3D.NPCoordinate.positionsToPolylineGeo(positions);
                    callback(polylineGeo);
                }
            });
        }
    });
};

/**
 * 绘制标记
 * @param {Function} callback - 回调函数
 */
NPGIS3D.Tools.DrawingTool.prototype.drawMarker = function(callback, options) {
    var that = this;
    this._drawHelper.startDrawingMarker({
        callback: function(event) {
            var position = event.position,
                scene = event.scene,
                b = new Cesium.BillboardCollection(),
                point;

            if (typeof callback === 'function') {
                point = NPGIS3D.NPCoordinate.cartesianToPointGeo(position);
                callback(point);
            }

            scene.primitives.add(b);
            var host = NPGIS3D.NPUtil.getHost() + 'lib/Cesium/Assets';
            var billboard = b.add({
                show: true,
                position: position,
                pixelOffset: new Cesium.Cartesian2(0, 0),
                eyeOffset: new Cesium.Cartesian3(0.0, 0.0, 0.0),
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                verticalOrigin: Cesium.VerticalOrigin.CENTER,
                scale: 1.0,
                image: host + "/img/glyphicons_242_google_maps.png",
                color: new Cesium.Color(1.0, 1.0, 1.0, 1.0)
            });

            that._drawCollection.add(b);
            //NPUtil.enhanceWithListeners(b);

            billboard.setEditable();
            billboard.addListener('dragEnd', function(event) {
                position = event.positions;
                if (typeof callback === 'function') {
                    point = NPGIS3D.NPCoordinate.cartesianToPointGeo(position);
                    callback(point);
                }
            });
        }
    });
};

/**
 * 绘制类型常量
 */
NPGIS3D.DrawingMode = {
    MARKER: 'drawMarker',
    POLYLINE: 'drawPolyline',
    POLYGON: 'drawPolygon',
    CIRCLE: 'drawCircle',
    EXTENT: 'drawExtent',
    CLEAN: 'clean'
};

/**
 * 测量工具
 * @requires NAPMAP3D.js
 * @class NPGIS3D.MeasureTool
 *
 * @constructor
 * @param {NPGIS3D.MAP3D} viewer,必须
 * @param {String} container - div容器,必须
 * 
 */
NPGIS3D.Tools = NPGIS3D.Tools || {};
NPGIS3D.Tools.MeasureTool = function(viewer, container) {
    // this.drawHelper = new DrawHelper(viewer.viewer, container);
    this.viewer = viewer.viewer;
};

/**
 * 测量
 * @param {String} mode 测量类型,必须
 * @param {Object} options 属性
 */
NPGIS3D.Tools.MeasureTool.prototype.setMode = function(mode,options) {
    var measureModel = Cesium.MeasureMode.Area;
    switch (mode) {
        case NPGIS3D.MeasureMode.AREA:
            // this.measureArea(options);
            measureModel = Cesium.MeasureMode.Area;
            break;
        case NPGIS3D.MeasureMode.DISTANCE:
            //this.measureDistance(options);
            measureModel = Cesium.MeasureMode.Distance;
            break;
        case NPGIS3D.MeasureMode.HEIGHT:
        case NPGIS3D.MeasureMode.DVH:
            measureModel = Cesium.MeasureMode.DVH;
            break;
        default:
            this.measureClean();
            return;
    }
    if(this._handler){
        this._handler.deactivate();
        this._handler.clear();
    }
    this._handler = new Cesium.MeasureHandler(this.viewer,measureModel);
    var that = this;
    this._handler.measureEvt.addEventListener(function(result){
        if(measureModel == Cesium.MeasureMode.Distance){
            var distance = result.distance > 1000 ? (result.distance/1000) + 'km' : result.distance + 'm';
            that._handler.disLabel.text = '距离:' + distance;
            that._handler.disLabel.outlineColor = new Cesium.Color(0, 0, 1,0.9);
            that._handler.disLabel.font='100 20px 宋体';
            that._handler.disLabel.outlineWidth=5;
            that._handler.disLabel.showBackground=false;
        }else if(measureModel == Cesium.MeasureMode.Area){
            var area = result.area > 1000000 ? result.area/1000000 + 'km²' : result.area + '㎡'
            that._handler.areaLabel.text = '面积:' + area;
            that._handler.areaLabel.outlineColor = new Cesium.Color(0, 0, 1,0.9);
            that._handler.areaLabel.font='100 20px 宋体';
            that._handler.areaLabel.outlineWidth=5.0;
            that._handler.areaLabel.showBackground=false;
        }else if(measureModel == Cesium.MeasureMode.DVH||measureModel == Cesium.measureModel.HEIGHT){
            var distance = result.distance > 1000 ? (result.distance/1000).toFixed(2) + 'km' : result.distance + 'm';
            var vHeight = result.verticalHeight > 1000 ? (result.verticalHeight/1000).toFixed(2) + 'km' : result.verticalHeight + 'm';
            var hDistance = result.horizontalDistance > 1000 ? (result.horizontalDistance/1000).toFixed(2) + 'km' : result.horizontalDistance + 'm';
            that._handler.disLabel.text = '空间距离:' + distance;
            that._handler.disLabel.outlineColor = new Cesium.Color(0, 0, 1,0.9);
            that._handler.disLabel.font='100 20px 宋体';
            that._handler.disLabel.outlineWidth=5.0;
            that._handler.vLabel.text = '垂直高度:' + vHeight;
            that._handler.vLabel.outlineColor = new Cesium.Color(0, 0, 1,0.9);
            that._handler.vLabel.font='100 20px 宋体';
            that._handler.vLabel.outlineWidth=5.0;
            that._handler.hLabel.text = '水平距离:' + hDistance;
            that._handler.hLabel.outlineColor = new Cesium.Color(0, 0, 1,0.9);
            that._handler.hLabel.font='100 20px 宋体';
            that._handler.hLabel.outlineWidth=5.0;
        }
    });
    this._handler.activeEvt.addEventListener(function(isActive){
        if(isActive == true){
            that.viewer.enableCursorStyle = false;
            that.viewer._element.style.cursor = 'crosshair';
        }
        else{
            that.viewer._element.style.cursor = '';
            that.viewer.enableCursorStyle = true;
        }
    });
    this._handler.activate();
};

NPGIS3D.Tools.MeasureTool.prototype.measureDistance = function(options) {
    this.drawHelper.measureDistance(options);
};

NPGIS3D.Tools.MeasureTool.prototype.measureArea = function(options) {
    this.drawHelper.measureArea(options);
};

/**
 * 停止测量
 */
NPGIS3D.Tools.MeasureTool.prototype.measureClean = function() {
    // this.drawHelper.stopDrawing();
    if(this._handler){
        this._handler.deactivate();
        this._handler.clear();
    }
};

/*
 * 测量类型常量
 */
NPGIS3D.MeasureMode = {
    DISTANCE: 'measureDistance',
    AREA: 'measureArea',
    HEIGHT: 'height',
    DVH: 'DVH',
    CLEAN: 'measureClean'
};
 /**
  * A {@link MaterialProperty} that maps to PolylineArrow {@link Material} uniforms.
  *
  * @param {Property} [color=Color.WHITE] The {@link Color} Property to be used.
  *
  * @class  NPGIS3D.PolylineArrowMaterialProperty
  * @constructor
  */
 NPGIS3D.PolylineArrowMaterialProperty = function(color) {      
     this._ = new Cesium.PolylineArrowMaterialProperty(color || Cesium.Color.WHITE);
 };

 /**
  * A {@link MaterialProperty} that maps to PolylineArrow {@link Material} uniforms.
  *
  * @param {Property} [color=Color.WHITE] The {@link Color} Property to be used.
  *
  * @class  NPGIS3D.PolylineOutlineMaterialProperty
  * @constructor
  */
 NPGIS3D.PolylineOutlineMaterialProperty = function(opts) {
     opts = opts || {
         color: Cesium.Color.WHITE,
         outlineColor: Cesium.Color.BLACK,
         outlineWidth: 1.0
     };
     this._ = new Cesium.PolylineOutlineMaterialProperty(opts);
 };

/**
 * 三维切片模型数据
 * @requires NAPMAP3D.js
 * @class: NAPMAP3D.Tile3DLoader
 *
 * @constructor
 * @param {NPGIS3D.MAP3D} viewer 必须
 */
NPGIS3D.Tile3DLoader = function(viewer) {
	this._viewer = viewer;
	this._collection = [];
};

/** 
 * 加载三维切片模型
 * @param {String} url - 3D Tiles文件的json地址,必须
 */
NPGIS3D.Tile3DLoader.prototype.loadTile3D = function(url) {
	var titleset = map.viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
        url:url,
        debugShowStatistics:true,
        maximumNumberOfLoadedTiles:3
    }));
	this._collection.push(titleset);
};

/** 
 * 批量加载三维切片模型
 * @param {Object[]} urls 模型信息数组 {url:''}
 *
 */
NPGIS3D.Tile3DLoader.prototype.loadTile3Ds = function(urls) {
	if (!NPGIS3D.NPUtil.isArray(urls)) {
		throw new NPGIS3D.DeveloperError('NPGIS3D.Tile3DLoader', 'loadTile3Ds() 参数 urls 必须是数组!');
	}
	var i = urls.length - 1,
		item;

	for (i; i >= 0; i--) {
		item = urls[i];
		this.loadTile3D(item);
	}
};

/** 
 * 清除所有三维切片模型
 */
NPGIS3D.Tile3DLoader.prototype.removeAll = function() {
	for(var i=0;i<this._collection.length;i++){
		this._collection[i].destroy();
	}
};

/** 
 * 显示所有三维切片模型
 *
 */
NPGIS3D.Tile3DLoader.prototype.show = function() {
	for(var i=0;i<this._collection.length;i++){
		this._collection[i].show(true);
	}
};

/** 
 * 隐藏所有三维切片模型
 *
 */
NPGIS3D.Tile3DLoader.prototype.hide = function() {
	for(var i=0;i<this._collection.length;i++){
		this._collection[i].show(false);
	}
};

/** 
 * destroy
 *
 */
NPGIS3D.Tile3DLoader.prototype.destroy = function() {
	this.removeAll();
    this._viewer = null;
    this._collection = null;
};
