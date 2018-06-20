/**
 * @requires OpenLayers.Geometry.LineString
 */

/**
 *
 * Class: OpenLayers.Geometry.GeoLinePlotting
 * 标绘扩展线符号类。
 * 该类是抽象类，具体的符号由其子类表现。子类必须实现方法 calculateParts()。
 *
 * Inherits from:
 *  - <OpenLayers.Geometry.LineString>
 */
OpenLayers.Geometry.GeoLinePlotting = OpenLayers.Class(
    OpenLayers.Geometry.LineString, {
        plotingExtend: true,
        /**
         * Property: _controlPoints
         * 定义控制点字段
         * 用于存储标绘扩展符号的所有控制点
         */
        _controlPoints: [],

        /**
         * Constructor: OpenLayers.Geometry.GeoLinePlotting
         * 标绘扩展线符号类。
         *
         * Parameters:
         * points - {Array(<OpenLayers.Geometry.Point>)} 控制点数组
         */
        initialize: function(points) {
            OpenLayers.Geometry.LineString.prototype.initialize.apply(this, arguments);
            this._controlPoints = points;

            if (points && points.length > 0) {
                this.calculateParts();
            }
        },
        /**
         * APIMethod: getArea
         * 获得区域面积，从区域的外部口径减去计此区域内部口径算所得的面积。
         *
         * Returns:
         * {float} 几何对象的面积。
         */
        getArea: function() {
            var area = 0.0;
            if (this.components && (this.components.length > 0)) {
                area += Math.abs(this.components[0].getArea());
                for (var i = 1, len = this.components.length; i < len; i++) {
                    area -= Math.abs(this.components[i].getArea());
                }
            }
            return area;
        },

        /**
         * APIMethod: getControlPoints
         * 获取符号控制点
         */
        getControlPoints: function() {
            return this._controlPoints;
        },

        /**
         * APIMethod: setControlPoint
         * 设置控制点
         *
         * Parameters:
         * points - {Array(<OpenLayers.Geometry.Point>)} 控制点数组
         */
        setControlPoint: function(points) {
            if (points && points.length && points.length > 0) {
                this._controlPoints = points;
                this.calculateParts();
            }
        },

        /**
         * APIMethod: clone
         * 克隆对象。
         *
         * Returns:
         * {<OpenLayers.Geometry.Collection>} 克隆的几何对象。
         */
        clone: function() {
            var geoState = new OpenLayers.Geometry.GeoLinePlotting();
            var controlPoints = [];
            //赋值控制点
            for (var i = 0, len = this._controlPoints.length; i < len; i++) {
                //这里必须深赋值，不然在编辑时由于引用的问题出现错误
                controlPoints.push(this._controlPoints[i].clone());
            }
            geoState._controlPoints = controlPoints;
            return geoState;
        },

        /**
         * APIMethod: toJSON
         * 将标绘扩展对象转换为json数据（只解析控制点）
         *
         * Returns:
         * {String} 返回转换后的 JSON 对象。
         */
        toJSON: function(map) {
            if (!this._controlPoints) {
                return null;
            }

            var len = this._controlPoints.length;
            var arr = [];
            for (var i = 0; i < len; i++) {
                arr.push(this.controlPointToJSON(this._controlPoints[i], map));
            }

            return "{\"controlPoints\":[" + arr.join(",") + "]" + ",\"CLASS_NAME\":\"" + this.CLASS_NAME + "\"}";
        },

        /**
         * APIMethod: calculateParts
         * 通过控制点计算标绘扩展符号所有点 。
         * 每次调用此方法都会重置标绘扩展符号要素的geometry 。
         * 此方法需要子类实现
         */
        calculateParts: function() {},

        /**
         * Method: calculateMidpoint
         * 计算两个点所连成的线段的的中点
         *
         * Parameters:
         * pointA - {<OpenLayers.Geometry.Point>} 第一个点
         * pointB -  {<OpenLayers.Geometry.Point>} 第二个点
         *
         * Returns:
         * {<OpenLayers.Geometry.Point>} 返回中点
         */
        calculateMidpoint: function(pointA, pointB) {
            var midPoint = new OpenLayers.Geometry.Point((pointA.x + pointB.x) / 2, (pointA.y + pointB.y) / 2);
            return midPoint;

        },

        /**
         * Method: calculateDistance
         * 计算两点间的距离
         *
         * Parameters:
         * pointA - {<OpenLayers.Geometry.Point>} 第一个点
         * pointB -  {<OpenLayers.Geometry.Point>} 第二个点
         *
         * Returns:
         * {<OpenLayers.Geometry.Point>} 返回两点间的距离值
         */
        calculateDistance: function(pointA, pointB) {
            var distance = Math.sqrt(Math.pow(pointA.x - pointB.x, 2) + Math.pow(pointA.y - pointB.y, 2));
            return distance;

        },

        /**
         * Method: toVector
         * 计算两点间的向量
         *
         * Parameters:
         * pointA - {<OpenLayers.Geometry.Point>} 起点
         * pointB -  {<OpenLayers.Geometry.Point>} 终点
         *
         * Returns:
         * {<OpenLayers.Geometry.Point>} 返回两点间的向量
         */
        toVector: function(pointA, pointB) {
            return new OpenLayers.Geometry.Point(pointA.x - pointB.x, pointA.y - pointB.y);
        },

        /**
         * Method: calculateVector
         * 计算和基准向量v夹角为a、长度为d的目标向量（理论上有两个，一左一右）
         *
         * Parameters:
         * v - {<OpenLayers.Geometry.Point>} 基准向量
         * a - {Number} 目标向量和基准向量的夹角，默认为90度，这里的单位使用弧度
         * d - {Number} 目标向量的长度，即模，默认为1，即单位向量
         *
         * Returns:
         * {Array(<OpenLayers.Geometry.Point>)} 回目标向量数组（就两个向量，一左一右）
         */
        calculateVector: function(v, a, d) {
            if (!a) a = Math.PI / 2;
            if (!d) d = 1;

            //定义目标向量的头部   x 坐标
            var x_1;
            var x_2;
            //定义目标向量的头部   y 坐标
            var y_1;
            var y_2;
            //定义目标向量，一左一右
            var v_l;
            var v_r;

            //计算基准向量v的模
            var d_v = Math.sqrt(v.x * v.x + v.y * v.y);

            //基准向量的斜率为0时，y值不能作为除数，所以需要特别处理
            if (v.y == 0) {
                //计算x,会有两个值
                x_1 = x_2 = d_v * d * Math.cos(a) / v.x;
                //根据v.x的正负判断目标向量的左右之分
                if (v.x > 0) {
                    //计算y
                    y_1 = Math.sqrt(d * d - x_1 * x_1);
                    y_2 = -y_1;
                } else if (v.x < 0) {
                    //计算y
                    y_2 = Math.sqrt(d * d - x_1 * x_1);
                    y_1 = -y_2;
                }
                v_l = new OpenLayers.Geometry.Point(x_1, y_1);
                v_r = new OpenLayers.Geometry.Point(x_2, y_2);
            }
            //此为大多数情况
            else {
                //转换为y=nx+m形式
                var n = -v.x / v.y;
                var m = d * d_v * Math.cos(a) / v.y;
                //
                //x*x + y*y = d*d
                //转换为a*x*x + b*x + c = 0
                var a = 1 + n * n;
                var b = 2 * n * m;
                var c = m * m - d * d;
                //计算x,会有两个值
                x_1 = (-b - Math.sqrt(b * b - 4 * a * c)) / (2 * a);
                x_2 = (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a);
                //计算y
                y_1 = n * x_1 + m;
                y_2 = n * x_2 + m;
                //当向量向上时
                if (v.y >= 0) {
                    v_l = new OpenLayers.Geometry.Point(x_1, y_1);
                    v_r = new OpenLayers.Geometry.Point(x_2, y_2);
                }
                //当向量向下时
                else if (v.y < 0) {
                    v_l = new OpenLayers.Geometry.Point(x_2, y_2);
                    v_r = new OpenLayers.Geometry.Point(x_1, y_1);
                }
            }
            return [v_l, v_r];
        },

        /**
         * Method: calculateIntersection
         * 计算两条直线的交点
         * 通过向量的思想进行计算，需要提供两个向量以及两条直线上各自一个点
         *
         * Parameters:
         * v_1 - {<OpenLayers.Geometry.Point>} 直线1的向量
         * v_2 - {<OpenLayers.Geometry.Point>} 直线2的向量
         * points1 - {<OpenLayers.Geometry.Point>} 直线1上的任意一点
         * points2 - {<OpenLayers.Geometry.Point>} 直线2上的任意一点
         *
         * Returns:
         * {Array(<OpenLayers.Geometry.Point>)} 返回交点
         */
        calculateIntersection: function(v_1, v_2, point1, point2) {
            //定义交点的坐标
            var x;
            var y;
            //如果向量v_1和v_2平行
            if (v_1.y * v_2.x - v_1.x * v_2.y == 0) {
                //平行也有两种情况
                //同向
                if (v_1.x * v_2.x > 0 || v_1.y * v_2.y > 0) {
                    //同向直接取两个点的中点
                    x = (point1.x + point2.x) / 2;
                    y = (point1.y + point2.y) / 2;
                }
                //反向
                else {
                    //如果反向直接返回后面的点位置
                    x = point2.x;
                    y = point2.y;
                }
            } else {
                //
                x = (v_1.x * v_2.x * (point2.y - point1.y) + point1.x * v_1.y * v_2.x - point2.x * v_2.y * v_1.x) / (v_1.y * v_2.x - v_1.x * v_2.y);
                if (v_1.x != 0) {
                    y = (x - point1.x) * v_1.y / v_1.x + point1.y;
                }
                //不可能v_1.x和v_2.x同时为0
                else {
                    y = (x - point2.x) * v_2.y / v_2.x + point2.y;
                }
            }
            return new OpenLayers.Geometry.Point(x, y);

        },

        /**
         * Method: calculateAngularBisector
         * 计算两个向量的角平分线向量
         *
         * Parameters:
         * v1 - {<OpenLayers.Geometry.Point>} 向量1
         * v2 - {<OpenLayers.Geometry.Point>} 向量2
         *
         * Returns:
         * {Array(<OpenLayers.Geometry.Point>)} 返回角平分线向量
         */
        calculateAngularBisector: function(v1, v2) {
            //计算角平分线的思想是取两个向量的单位向量，然后相加
            var d1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
            var d2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
            return new OpenLayers.Geometry.Point(v1.x / d1 + v2.x / d2, v1.y / d1 + v2.y / d2);
        },

        /**
         * Method: calculateIntersectionFromTwoCorner
         * 通过三角形的底边两端点坐标以及底边两夹角，计算第三个点坐标
         *
         * Parameters:
         * pointS - {<OpenLayers.Geometry.Point>} 底边第一个点
         * pointE - {<OpenLayers.Geometry.Point>} 底边第二个点
         * a_S - {Number} 底边和第一个点所在的另一条边的夹角
         * a_E - {Number} 底边和第二个点所在的另一条边的夹角
         *
         * Returns:
         * {Array(<OpenLayers.Geometry.Point>)} 返回顶点（理论上存在两个值）
         */
        calculateIntersectionFromTwoCorner: function(pointS, pointE, a_S, a_E) {
            if (!a_S) a_S = Math.PI / 4;
            if (!a_E) a_E = Math.PI / 4;

            //起始点、结束点、交点加起来三个点，形成一个三角形
            //斜边（起始点到结束点）的向量为
            var v_SE = new OpenLayers.Geometry.Point(pointE.x - pointS.x, pointE.y - pointS.y);
            //计算起始点、交点的单位向量
            var v_SI_lr = this.calculateVector(v_SE, a_S, 1);
            //获取
            var v_SI_l = v_SI_lr[0];
            var v_SI_r = v_SI_lr[1];
            //计算结束点、交点的单位向量
            var v_EI_lr = this.calculateVector(v_SE, Math.PI - a_S, 1);
            //获取
            var v_EI_l = v_EI_lr[0];
            var v_EI_r = v_EI_lr[1];
            //求左边的交点
            var pointI_l = this.calculateIntersection(v_SI_l, v_EI_l, pointS, pointE);
            //计算右边的交点
            var pointI_r = this.calculateIntersection(v_SI_r, v_EI_r, pointS, pointE);
            return [pointI_l, pointI_r];
        },

        /**
         * Method: cloneControlPoints
         * 克隆控制点数组
         *
         */
        cloneControlPoints: function(cp) {
            var controlPoints = [];

            for (var i = 0; i < cp.length; i++) {
                controlPoints.push(cp[i].clone());
            }
            return controlPoints;
        },

        /**
         * Method: controlPointToJSON
         * 将控制点转换为Json
         *
         * Parameters:
         * cp - {<OpenLayers.Geometry.Point>} 要转换为Json的控制点
         */
        controlPointToJSON: function(cp, map) {
            if (map) {
                cp = NPMap.T.getPoint(map, {
                    lon: cp.x,
                    lat: cp.y
                });
                cp = {
                    x: cp.lon,
                    y: cp.lat
                }
            }
            return "{\"x\":  " + cp.x + ", \"y\": " + cp.y + ",\"CLASS_NAME\":\"" + this.CLASS_NAME + "\"}";
        },

        CLASS_NAME: "OpenLayers.Geometry.GeoLinePlotting"
    }
);

/**
 * APIMethod: getControlPointsFromJSON
 * 根据控制点字符串获取控制点数据
 *
 * Parameters:
 * str - {String} 控制点字符串，形如："[{...},{...}...]"
 *
 * Returns:
 * {Array(<OpenLayers.Geometry.Point>)} 控制点数组
 */
OpenLayers.Geometry.GeoLinePlotting.getControlPointsFromJSON = function(str, map) {
    var cps = [];
    //匹配每一个Point的json格式
    var r = /{.*?}/g;
    var arr = str.match(r);
    for (var i = 0, len = arr.length; i < len; i++) {
        var point = eval('(' + arr[i] + ')');
        if (map) {
            point = NPMap.T.setPoint(map, {
                lon: point.x,
                lat: point.y
            });
            point = {
                x: point.lon,
                y: point.lat
            };
        }
        cps.push(new OpenLayers.Geometry.Point(point.x, point.y));
    }
    return cps;
};
/**
 * @requires OpenLayers.Geometry.MultiLineString
 */

/**
 *
 * Class: OpenLayers.Geometry.GeoPlotting
 * 标绘扩展多线符号类。
 * 该类是抽象类，具体的符号由其子类表现。子类必须实现方法 calculateParts()。
 *
 * Inherits from:
 *  - <OpenLayers.Geometry.MultiLineString>
 */
OpenLayers.Geometry.GeoMultiLinePlotting = OpenLayers.Class(
    OpenLayers.Geometry.MultiLineString, {
        plotingExtend: true,
        /**
         * Property: _controlPoints
         * 定义控制点字段
         * 用于存储标绘扩展符号的所有控制点
         */
        _controlPoints: [],
        /**
         * Property: isMultiPlotting
         * 用于绘制时判断是否是复合标绘符号
         */
        isMultiPlotting: true,
        /**
         * Constructor: OpenLayers.Geometry.GeoMultiLinePlotting
         * 标绘扩展多线符号类。
         *
         * Parameters:
         * points - {Array(<OpenLayers.Geometry.Point>)} 控制点数组
         */
        initialize: function(points) {
            OpenLayers.Geometry.MultiLineString.prototype.initialize.apply(this, arguments);
            this._controlPoints = points;

            if (points && points.length > 0) {
                this.calculateParts();
            }
        },
        /**
         * APIMethod: getArea
         * 获得区域面积，从区域的外部口径减去计此区域内部口径算所得的面积。
         *
         * Returns:
         * {float} 几何对象的面积。
         */
        getArea: function() {
            var area = 0.0;
            if (this.components && (this.components.length > 0)) {
                area += Math.abs(this.components[0].getArea());
                for (var i = 1, len = this.components.length; i < len; i++) {
                    area -= Math.abs(this.components[i].getArea());
                }
            }
            return area;
        },

        /**
         * APIMethod: getControlPoints
         * 获取符号控制点
         */
        getControlPoints: function() {
            return this._controlPoints;
        },

        /**
         * APIMethod: setControlPoint
         * 设置控制点
         *
         * Parameters:
         * points - {Array(<OpenLayers.Geometry.Point>)} 控制点数组
         */
        setControlPoint: function(points) {
            if (points && points.length && points.length > 0) {
                this._controlPoints = points;
                this.calculateParts();
            }
        },

        /**
         * APIMethod: clone
         * 克隆对象。
         *
         * Returns:
         * {<OpenLayers.Geometry.Collection>} 克隆的几何对象。
         */
        clone: function() {
            var geoState = new OpenLayers.Geometry.GeoMultiLinePlotting();
            var controlPoints = [];
            var components = [];
            //赋值控制点
            for (var i = 0, len = this._controlPoints.length; i < len; i++) {
                //这里必须深赋值，不然在编辑时由于引用的问题出现错误
                controlPoints.push(this._controlPoints[i].clone());
            }
            geoState._controlPoints = controlPoints;
            for (var j = 0; j < this.components.length; j++) {
                components.push(this.components[j].clone());
            }
            geoState.components = components;
            return geoState;
        },

        /**
         * APIMethod: toJSON
         * 将标绘扩展对象转换为json数据（只解析控制点）
         *
         * Returns:
         * {String} 返回转换后的 JSON 对象。
         */
        toJSON: function(map) {
            if (!this._controlPoints) {
                return null;
            }

            var len = this._controlPoints.length;
            var arr = [];
            for (var i = 0; i < len; i++) {
                arr.push(this.controlPointToJSON(this._controlPoints[i], map));
            }

            return "{\"controlPoints\":[" + arr.join(",") + "]" + ",\"CLASS_NAME\":\"" + this.CLASS_NAME + "\"}";
        },

        /**
         * APIMethod: calculateParts
         * 通过控制点计算标绘扩展符号所有点 。
         * 每次调用此方法都会重置标绘扩展符号要素的geometry 。
         * 此方法需要子类实现
         */
        calculateParts: function() {},

        /**
         * Method: calculateMidpoint
         * 计算两个点所连成的线段的的中点
         *
         * Parameters:
         * pointA - {<OpenLayers.Geometry.Point>} 第一个点
         * pointB -  {<OpenLayers.Geometry.Point>} 第二个点
         *
         * Returns:
         * {<OpenLayers.Geometry.Point>} 返回中点
         */
        calculateMidpoint: function(pointA, pointB) {
            var midPoint = new OpenLayers.Geometry.Point((pointA.x + pointB.x) / 2, (pointA.y + pointB.y) / 2);
            return midPoint;

        },

        /**
         * Method: calculateArrowLines
         * 根据两点计算其所在向量的箭头（即两条直线）
         *
         * Parameters:
         * startP - {<OpenLayers.Geometry.Point>} 向量的起点
         * endP -  {<OpenLayers.Geometry.Point>} 向量的终点
         * ratio -  {Number} 直线长度与箭头长度的比值，默认为10倍
         * angle - {Number} 箭头所在直线与直线的夹角，范围为0到π，默认为Math.PI/6。
         *
         * Returns:
         * {Array(<OpenLayers.Geometry.LineString>)} 返回中点
         */
        calculateArrowLines: function(startP, endP, ratio, angle) {
            var arrowLines = [];
            if (!ratio) ratio = 10;
            if (!angle) angle = Math.PI / 6;
            var dictance = this.calculateDistance(startP, endP);
            var vector = this.toVector(startP, endP);
            var vectorArrows = this.calculateVector(vector, angle, dictance / ratio);
            var arrowLineP_l = new OpenLayers.Geometry.Point(vectorArrows[0].x + endP.x, vectorArrows[0].y + endP.y);
            var arrowLineP_r = new OpenLayers.Geometry.Point(vectorArrows[1].x + endP.x, vectorArrows[1].y + endP.y);
            arrowLines.push(new OpenLayers.Geometry.LineString([endP, arrowLineP_l]));
            arrowLines.push(new OpenLayers.Geometry.LineString([endP, arrowLineP_r]));
            return arrowLines;
        },

        /**
         * Method: calculateDistance
         * 计算两点间的距离
         *
         * Parameters:
         * pointA - {<OpenLayers.Geometry.Point>} 第一个点
         * pointB -  {<OpenLayers.Geometry.Point>} 第二个点
         *
         * Returns:
         * {<OpenLayers.Geometry.Point>} 返回两点间的距离值
         */
        calculateDistance: function(pointA, pointB) {
            var distance = Math.sqrt(Math.pow(pointA.x - pointB.x, 2) + Math.pow(pointA.y - pointB.y, 2));
            return distance;

        },

        /**
         * Method: toVector
         * 计算两点间的向量
         *
         * Parameters:
         * pointA - {<OpenLayers.Geometry.Point>} 起点
         * pointB -  {<OpenLayers.Geometry.Point>} 终点
         *
         * Returns:
         * {<OpenLayers.Geometry.Point>} 返回两点间的向量
         */
        toVector: function(pointA, pointB) {
            return new OpenLayers.Geometry.Point(pointA.x - pointB.x, pointA.y - pointB.y);
        },

        /**
         * Method: calculateVector
         * 计算和基准向量v夹角为a、长度为d的目标向量（理论上有两个，一左一右）
         *
         * Parameters:
         * v - {<OpenLayers.Geometry.Point>} 基准向量
         * a - {Number} 目标向量和基准向量的夹角，默认为90度，这里的单位使用弧度
         * d - {Number} 目标向量的长度，即模，默认为1，即单位向量
         *
         * Returns:
         * {Array(<OpenLayers.Geometry.Point>)} 回目标向量数组（就两个向量，一左一右）
         */
        calculateVector: function(v, a, d) {
            if (!a) a = Math.PI / 2;
            if (!d) d = 1;

            //定义目标向量的头部   x 坐标
            var x_1;
            var x_2;
            //定义目标向量的头部   y 坐标
            var y_1;
            var y_2;
            //定义目标向量，一左一右
            var v_l;
            var v_r;

            //计算基准向量v的模
            var d_v = Math.sqrt(v.x * v.x + v.y * v.y);

            //基准向量的斜率为0时，y值不能作为除数，所以需要特别处理
            if (v.y == 0) {
                //计算x,会有两个值
                x_1 = x_2 = d_v * d * Math.cos(a) / v.x;
                //根据v.x的正负判断目标向量的左右之分
                if (v.x > 0) {
                    //计算y
                    y_1 = Math.sqrt(d * d - x_1 * x_1);
                    y_2 = -y_1;
                } else if (v.x < 0) {
                    //计算y
                    y_2 = Math.sqrt(d * d - x_1 * x_1);
                    y_1 = -y_2;
                }
                v_l = new OpenLayers.Geometry.Point(x_1, y_1);
                v_r = new OpenLayers.Geometry.Point(x_2, y_2);
            }
            //此为大多数情况
            else {
                //转换为y=nx+m形式
                var n = -v.x / v.y;
                var m = d * d_v * Math.cos(a) / v.y;
                //
                //x*x + y*y = d*d
                //转换为a*x*x + b*x + c = 0
                var a = 1 + n * n;
                var b = 2 * n * m;
                var c = m * m - d * d;
                //计算x,会有两个值
                x_1 = (-b - Math.sqrt(b * b - 4 * a * c)) / (2 * a);
                x_2 = (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a);
                //计算y
                y_1 = n * x_1 + m;
                y_2 = n * x_2 + m;
                //当向量向上时
                if (v.y >= 0) {
                    v_l = new OpenLayers.Geometry.Point(x_1, y_1);
                    v_r = new OpenLayers.Geometry.Point(x_2, y_2);
                }
                //当向量向下时
                else if (v.y < 0) {
                    v_l = new OpenLayers.Geometry.Point(x_2, y_2);
                    v_r = new OpenLayers.Geometry.Point(x_1, y_1);
                }
            }
            return [v_l, v_r];
        },

        /**
         * Method: calculateIntersection
         * 计算两条直线的交点
         * 通过向量的思想进行计算，需要提供两个向量以及两条直线上各自一个点
         *
         * Parameters:
         * v_1 - {<OpenLayers.Geometry.Point>} 直线1的向量
         * v_2 - {<OpenLayers.Geometry.Point>} 直线2的向量
         * points1 - {<OpenLayers.Geometry.Point>} 直线1上的任意一点
         * points2 - {<OpenLayers.Geometry.Point>} 直线2上的任意一点
         *
         * Returns:
         * {Array(<OpenLayers.Geometry.Point>)} 返回交点
         */
        calculateIntersection: function(v_1, v_2, point1, point2) {
            //定义交点的坐标
            var x;
            var y;
            //如果向量v_1和v_2平行
            if (v_1.y * v_2.x - v_1.x * v_2.y == 0) {
                //平行也有两种情况
                //同向
                if (v_1.x * v_2.x > 0 || v_1.y * v_2.y > 0) {
                    //同向直接取两个点的中点
                    x = (point1.x + point2.x) / 2;
                    y = (point1.y + point2.y) / 2;
                }
                //反向
                else {
                    //如果反向直接返回后面的点位置
                    x = point2.x;
                    y = point2.y;
                }
            } else {
                //
                x = (v_1.x * v_2.x * (point2.y - point1.y) + point1.x * v_1.y * v_2.x - point2.x * v_2.y * v_1.x) / (v_1.y * v_2.x - v_1.x * v_2.y);
                if (v_1.x != 0) {
                    y = (x - point1.x) * v_1.y / v_1.x + point1.y;
                }
                //不可能v_1.x和v_2.x同时为0
                else {
                    y = (x - point2.x) * v_2.y / v_2.x + point2.y;
                }
            }
            return new OpenLayers.Geometry.Point(x, y);

        },

        /**
         * Method: calculateAngularBisector
         * 计算两个向量的角平分线向量
         *
         * Parameters:
         * v1 - {<OpenLayers.Geometry.Point>} 向量1
         * v2 - {<OpenLayers.Geometry.Point>} 向量2
         *
         * Returns:
         * {Array(<OpenLayers.Geometry.Point>)} 返回角平分线向量
         */
        calculateAngularBisector: function(v1, v2) {
            //计算角平分线的思想是取两个向量的单位向量，然后相加
            var d1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
            var d2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
            return new OpenLayers.Geometry.Point(v1.x / d1 + v2.x / d2, v1.y / d1 + v2.y / d2);
        },

        /**
         * Method: calculateIntersectionFromTwoCorner
         * 通过三角形的底边两端点坐标以及底边两夹角，计算第三个点坐标
         *
         * Parameters:
         * pointS - {<OpenLayers.Geometry.Point>} 底边第一个点
         * pointE - {<OpenLayers.Geometry.Point>} 底边第二个点
         * a_S - {Number} 底边和第一个点所在的另一条边的夹角
         * a_E - {Number} 底边和第二个点所在的另一条边的夹角
         *
         * Returns:
         * {Array(<OpenLayers.Geometry.Point>)} 返回顶点（理论上存在两个值）
         */
        calculateIntersectionFromTwoCorner: function(pointS, pointE, a_S, a_E) {
            if (!a_S) a_S = Math.PI / 4;
            if (!a_E) a_E = Math.PI / 4;

            //起始点、结束点、交点加起来三个点，形成一个三角形
            //斜边（起始点到结束点）的向量为
            var v_SE = new OpenLayers.Geometry.Point(pointE.x - pointS.x, pointE.y - pointS.y);
            //计算起始点、交点的单位向量
            var v_SI_lr = this.calculateVector(v_SE, a_S, 1);
            //获取
            var v_SI_l = v_SI_lr[0];
            var v_SI_r = v_SI_lr[1];
            //计算结束点、交点的单位向量
            var v_EI_lr = this.calculateVector(v_SE, Math.PI - a_S, 1);
            //获取
            var v_EI_l = v_EI_lr[0];
            var v_EI_r = v_EI_lr[1];
            //求左边的交点
            var pointI_l = this.calculateIntersection(v_SI_l, v_EI_l, pointS, pointE);
            //计算右边的交点
            var pointI_r = this.calculateIntersection(v_SI_r, v_EI_r, pointS, pointE);
            return [pointI_l, pointI_r];
        },

        /**
         * Method: cloneControlPoints
         * 克隆控制点数组
         *
         */
        cloneControlPoints: function(cp) {
            var controlPoints = [];

            for (var i = 0; i < cp.length; i++) {
                controlPoints.push(cp[i].clone());
            }
            return controlPoints;
        },

        /**
         * Method: controlPointToJSON
         * 将控制点转换为Json
         *
         * Parameters:
         * cp - {<OpenLayers.Geometry.Point>} 要转换为Json的控制点
         */
        controlPointToJSON: function(cp, map) {
            if (map) {
                cp = NPMap.T.getPoint(map, {
                    lon: cp.x,
                    lat: cp.y
                });
                cp = {
                    x: cp.lon,
                    y: cp.lat
                }
            }
            return "{\"x\":  " + cp.x + ", \"y\": " + cp.y + "}";
        },

        CLASS_NAME: "OpenLayers.Geometry.GeoMultiLinePlotting"
    }
);

/**
 * APIMethod: getControlPointsFromJSON
 * 根据控制点字符串获取控制点数据
 *
 * Parameters:
 * str - {String} 控制点字符串，形如："[{...},{...}...]"
 *
 * Returns:
 * {Array(<OpenLayers.Geometry.Point>)} 控制点数组
 */
OpenLayers.Geometry.GeoMultiLinePlotting.getControlPointsFromJSON = function(str, map) {
    var cps = [];
    //匹配每一个Point的json格式
    var r = /{.*?}/g;
    var arr = str.match(r);
    for (var i = 0, len = arr.length; i < len; i++) {
        var point = eval('(' + arr[i] + ')');
        if (map) {
            point = NPMap.T.setPoint(map, {
                lon: point.x,
                lat: point.y
            });
            point = {
                x: point.lon,
                y: point.lat
            };
        }
        cps.push(new OpenLayers.Geometry.Point(point.x, point.y));
    }
    return cps;
};
/**
 * @requires OpenLayers/Geometry/Collection.js
 * @requires OpenLayers/Geometry/LinearRing.js
 * @requires OpenLayers.Geometry.Polygon.js
 */

/**
 *
 * Class: OpenLayers.Geometry.GeoPlotting
 * 标绘扩展面符号类。
 * 该类是抽象类，具体的符号由其子类表现。子类必须实现方法 calculateParts()。
 *
 * Inherits from:
 *  - <OpenLayers.Geometry.Polygon>
 */
OpenLayers.Geometry.GeoPlotting = OpenLayers.Class(
    OpenLayers.Geometry.Polygon, {
        plotingExtend: true,
        /**
         * Property: _controlPoints
         * 定义控制点字段
         * 用于存储标绘扩展符号的所有控制点
         */
        _controlPoints: [],

        /**
         * Constructor: OpenLayers.Geometry.GeoPlotting
         * 标绘扩展符号基类
         *
         * Parameters:
         * points - {Array(<OpenLayers.Geometry.Point>)} 控制点数组
         */
        initialize: function(points) {
            OpenLayers.Geometry.Polygon.prototype.initialize.apply(this, arguments);
            this._controlPoints = points;

            if (points && points.length > 0) {
                this.calculateParts();
            }
        },

        /**
         * APIMethod: getControlPoints
         * 获取符号控制点
         */
        getControlPoints: function() {
            return this._controlPoints;
            //return this.cloneControlPoints(this._controlPoints);
        },

        /**
         * APIMethod: setControlPoint
         * 设置控制点
         *
         * Parameters:
         * points - {Array(<OpenLayers.Geometry.Point>)} 控制点数组
         */
        setControlPoint: function(points) {
            if (points && points.length && points.length > 0) {
                this._controlPoints = points;
                this.calculateParts();
            }
        },

        /**
         * APIMethod: clone
         * 克隆对象。
         *
         * Returns:
         * {<OpenLayers.Geometry.Collection>} 克隆的几何对象。
         */
        clone: function() {
            var geoState = new OpenLayers.Geometry.GeoPlotting();
            var controlPoints = [];
            //赋值控制点
            for (var i = 0, len = this._controlPoints.length; i < len; i++) {
                //这里必须深赋值，不然在编辑时由于引用的问题出现错误
                controlPoints.push(this._controlPoints[i].clone());
            }
            geoState._controlPoints = controlPoints;
            return geoState;
        },

        /**
         * APIMethod: toJSON
         * 将标绘扩展对象转换为json数据（只解析控制点）
         *
         * Returns:
         * {String} 返回转换后的 JSON 对象。
         */
        toJSON: function(map) {
            if (!this._controlPoints) {
                return null;
            }

            var len = this._controlPoints.length;
            var arr = [];
            for (var i = 0; i < len; i++) {
                arr.push(this.controlPointToJSON(this._controlPoints[i], map));
            }

            return "{\"controlPoints\":[" + arr.join(",") + "]" + ",\"CLASS_NAME\":\"" + this.CLASS_NAME + "\"}";
        },
        /**
         * Method: calculateMidpoint
         * 计算两个点所连成的线段的的中点
         *
         * Parameters:
         * pointA - {<OpenLayers.Geometry.Point>} 第一个点
         * pointB -  {<OpenLayers.Geometry.Point>} 第二个点
         *
         * Returns:
         * {<OpenLayers.Geometry.Point>} 返回中点
         */
        calculateMidpoint: function(pointA, pointB) {
            var midPoint = new OpenLayers.Geometry.Point((pointA.x + pointB.x) / 2, (pointA.y + pointB.y) / 2);
            return midPoint;

        },
        /**
         * APIMethod: calculateParts
         * 通过控制点计算标绘扩展符号所有点 。
         * 每次调用此方法都会重置标绘扩展符号要素的geometry 。
         * 此方法需要子类实现
         */
        calculateParts: function() {},

        /**
         * Method: calculateVector
         * 计算和基准向量v夹角为a、长度为d的目标向量（理论上有两个，一左一右）
         *
         * Parameters:
         * v - {<OpenLayers.Geometry.Point>} 基准向量
         * a - {Number} 目标向量和基准向量的夹角，默认为90度，这里的单位使用弧度
         * d - {Number} 目标向量的长度，即模，默认为1，即单位向量
         *
         * Returns:
         * {Array(<OpenLayers.Geometry.Point>)} 回目标向量数组（就两个向量，一左一右）
         */
        calculateVector: function(v, a, d) {
            if (!a) a = Math.PI / 2;
            if (!d) d = 1;

            //定义目标向量的头部   x 坐标
            var x_1;
            var x_2;
            //定义目标向量的头部   y 坐标
            var y_1;
            var y_2;
            //定义目标向量，一左一右
            var v_l;
            var v_r;

            //计算基准向量v的模
            var d_v = Math.sqrt(v.x * v.x + v.y * v.y);

            //基准向量的斜率为0时，y值不能作为除数，所以需要特别处理
            if (v.y == 0) {
                //计算x,会有两个值
                x_1 = x_2 = d_v * d * Math.cos(a) / v.x;
                //根据v.x的正负判断目标向量的左右之分
                if (v.x > 0) {
                    //计算y
                    y_1 = Math.sqrt(d * d - x_1 * x_1);
                    y_2 = -y_1;
                } else if (v.x < 0) {
                    //计算y
                    y_2 = Math.sqrt(d * d - x_1 * x_1);
                    y_1 = -y_2;
                }
                v_l = new OpenLayers.Geometry.Point(x_1, y_1);
                v_r = new OpenLayers.Geometry.Point(x_2, y_2);
            }
            //此为大多数情况
            else {
                //转换为y=nx+m形式
                var n = -v.x / v.y;
                var m = d * d_v * Math.cos(a) / v.y;
                //
                //x*x + y*y = d*d
                //转换为a*x*x + b*x + c = 0
                var a = 1 + n * n;
                var b = 2 * n * m;
                var c = m * m - d * d;
                //计算x,会有两个值
                x_1 = (-b - Math.sqrt(b * b - 4 * a * c)) / (2 * a);
                x_2 = (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a);
                //计算y
                y_1 = n * x_1 + m;
                y_2 = n * x_2 + m;
                //当向量向上时
                if (v.y >= 0) {
                    v_l = new OpenLayers.Geometry.Point(x_1, y_1);
                    v_r = new OpenLayers.Geometry.Point(x_2, y_2);
                }
                //当向量向下时
                else if (v.y < 0) {
                    v_l = new OpenLayers.Geometry.Point(x_2, y_2);
                    v_r = new OpenLayers.Geometry.Point(x_1, y_1);
                }
            }
            return [v_l, v_r];
        },

        /**
         * Method: calculateIntersection
         * 计算两条直线的交点
         * 通过向量的思想进行计算，需要提供两个向量以及两条直线上各自一个点
         *
         * Parameters:
         * v_1 - {<OpenLayers.Geometry.Point>} 直线1的向量
         * v_2 - {<OpenLayers.Geometry.Point>} 直线2的向量
         * points1 - {<OpenLayers.Geometry.Point>} 直线1上的任意一点
         * points2 - {<OpenLayers.Geometry.Point>} 直线2上的任意一点
         *
         * Returns:
         * {Array(<OpenLayers.Geometry.Point>)} 返回交点
         */
        calculateIntersection: function(v_1, v_2, point1, point2) {
            //定义交点的坐标
            var x;
            var y;
            //如果向量v_1和v_2平行
            if (v_1.y * v_2.x - v_1.x * v_2.y == 0) {
                //平行也有两种情况
                //同向
                if (v_1.x * v_2.x > 0 || v_1.y * v_2.y > 0) {
                    //同向直接取两个点的中点
                    x = (point1.x + point2.x) / 2;
                    y = (point1.y + point2.y) / 2;
                }
                //反向
                else {
                    //如果反向直接返回后面的点位置
                    x = point2.x;
                    y = point2.y;
                }
            } else {
                //
                x = (v_1.x * v_2.x * (point2.y - point1.y) + point1.x * v_1.y * v_2.x - point2.x * v_2.y * v_1.x) / (v_1.y * v_2.x - v_1.x * v_2.y);
                if (v_1.x != 0) {
                    y = (x - point1.x) * v_1.y / v_1.x + point1.y;
                }
                //不可能v_1.x和v_2.x同时为0
                else {
                    y = (x - point2.x) * v_2.y / v_2.x + point2.y;
                }
            }
            return new OpenLayers.Geometry.Point(x, y);

        },

        /**
         * Method: calculateAngularBisector
         * 计算两个向量的角平分线向量
         *
         * Parameters:
         * v1 - {<OpenLayers.Geometry.Point>} 向量1
         * v2 - {<OpenLayers.Geometry.Point>} 向量2
         *
         * Returns:
         * {Array(<OpenLayers.Geometry.Point>)} 返回角平分线向量
         */
        calculateAngularBisector: function(v1, v2) {
            //计算角平分线的思想是取两个向量的单位向量，然后相加
            var d1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
            var d2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
            return new OpenLayers.Geometry.Point(v1.x / d1 + v2.x / d2, v1.y / d1 + v2.y / d2);
        },

        /**
         * Method: calculateIntersectionFromTwoCorner
         * 通过三角形的底边两端点坐标以及底边两夹角，计算第三个点坐标
         *
         * Parameters:
         * pointS - {<OpenLayers.Geometry.Point>} 底边第一个点
         * pointE - {<OpenLayers.Geometry.Point>} 底边第二个点
         * a_S - {Number} 底边和第一个点所在的另一条边的夹角
         * a_E - {Number} 底边和第二个点所在的另一条边的夹角
         *
         * Returns:
         * {Array(<OpenLayers.Geometry.Point>)} 返回顶点（理论上存在两个值）
         */
        calculateIntersectionFromTwoCorner: function(pointS, pointE, a_S, a_E) {
            if (!a_S) a_S = Math.PI / 4;
            if (!a_E) a_E = Math.PI / 4;

            //起始点、结束点、交点加起来三个点，形成一个三角形
            //斜边（起始点到结束点）的向量为
            var v_SE = new OpenLayers.Geometry.Point(pointE.x - pointS.x, pointE.y - pointS.y);
            //计算起始点、交点的单位向量
            var v_SI_lr = this.calculateVector(v_SE, a_S, 1);
            //获取
            var v_SI_l = v_SI_lr[0];
            var v_SI_r = v_SI_lr[1];
            //计算结束点、交点的单位向量
            var v_EI_lr = this.calculateVector(v_SE, Math.PI - a_S, 1);
            //获取
            var v_EI_l = v_EI_lr[0];
            var v_EI_r = v_EI_lr[1];
            //求左边的交点
            var pointI_l = this.calculateIntersection(v_SI_l, v_EI_l, pointS, pointE);
            //计算右边的交点
            var pointI_r = this.calculateIntersection(v_SI_r, v_EI_r, pointS, pointE);
            return [pointI_l, pointI_r];
        },

        /**
         * Method: calculateDistance
         * 计算两点间的距离
         *
         * Parameters:
         * pointA - {<OpenLayers.Geometry.Point>} 第一个点
         * pointB -  {<OpenLayers.Geometry.Point>} 第二个点
         *
         * Returns:
         * {<OpenLayers.Geometry.Point>} 返回两点间的距离值
         */
        calculateDistance: function(pointA, pointB) {
            var distance = Math.sqrt(Math.pow(pointA.x - pointB.x, 2) + Math.pow(pointA.y - pointB.y, 2));
            return distance;

        },


        /**
         * Method: calculateArc
         * 根据圆心、半径，与X轴的起点角和终点角计算圆弧。
         *
         * Parameters:
         * center - {<OpenLayers.Geometry.Point>} 圆心
         * radius - {Number}半径
         * startAngle - {Number}起点角,范围为0到2π。
         * endAngle - {Number}终点角,范围为0到2π。
         * direction - {Number}从起点到终点的方向，其值为1：逆时针，其值为-1：顺时针。默认为1，即逆时针。
         * sides - {Number}圆弧所在圆的点数，默认为360个，即每1°一个点。
         *
         * Returns:
         * {Array(<OpenLayers.Geometry.Point>)} 圆弧上的点数组
         */
        calculateArc: function(center, radius, startAngle, endAngle, direction, sides) {
            if (!direction || (direction != 1 && direction != -1)) direction = -1;
            if (!sides) sides = 360;
            var step = Math.PI / sides / 2;
            var stepDir = step * direction;
            var length = Math.abs(endAngle - startAngle);
            var points = [];
            for (var radians = startAngle, i = 0; i < length; i += step) {
                var circlePoint = new OpenLayers.Geometry.Point(Math.cos(radians) * radius + center.x, Math.sin(radians) * radius + center.y);
                points.push(circlePoint);
                radians += stepDir;
                radians = radians < 0 ? (radians + 2 * Math.PI) : radians;
                radians = radians > 2 * Math.PI ? (radians - 2 * Math.PI) : radians;

            }
            return points;
        },
        /**
         * Method: cloneControlPoints
         * 克隆控制点数组
         *
         */
        cloneControlPoints: function(cp) {
            var controlPoints = [];

            for (var i = 0; i < cp.length; i++) {
                controlPoints.push(cp[i].clone());
            }
            return controlPoints;
        },

        /**
         * Method: controlPointToJSON
         * 将控制点转换为Json
         *
         * Parameters:
         * cp - {<OpenLayers.Geometry.Point>} 要转换为Json的控制点
         */
        controlPointToJSON: function(cp, map) {
            if (map) {
                cp = NPMap.T.getPoint(map, {
                    lon: cp.x,
                    lat: cp.y
                });
                cp = {
                    x: cp.lon,
                    y: cp.lat
                }
            }
            return "{\"x\":  " + cp.x + ", \"y\": " + cp.y + "}";
        },

        CLASS_NAME: "OpenLayers.Geometry.GeoPlotting"
    }
);

/**
 * APIMethod: getControlPointsFromJSON
 * 根据控制点字符串获取控制点数据
 *
 * Parameters:
 * str - {String} 控制点字符串，形如："[{...},{...}...]"
 *
 * Returns:
 * {Array(<OpenLayers.Geometry.Point>)} 控制点数组
 */
OpenLayers.Geometry.GeoPlotting.getControlPointsFromJSON = function(str, map) {
    var cps = [];
    //匹配每一个Point的json格式
    var r = /{.*?}/g;
    var arr = str.match(r);
    for (var i = 0, len = arr.length; i < len; i++) {
        var point = eval('(' + arr[i] + ')');
        if (map) {
            point = NPMap.T.setPoint(map, {
                lon: point.x,
                lat: point.y
            });
            point = {
                x: point.lon,
                y: point.lat
            };
        }
        cps.push(new OpenLayers.Geometry.Point(point.x, point.y));
    }
    return cps;
};
/**
 * @requires OpenLayers/Handler.js
 * @requires OpenLayers/Geometry/Point.js
 */

/**
 * Class: OpenLayers.Handler.Plotting
 * 绘制态势符号的事件处理器（抽象类）
 * 该处理器会触发标记为"done"、"cancel"和“modify"的事件回调。其中modify回调会在每一次变化时被调用并传入最近一次绘制的点。
 *
 * Inherits from:
 *  - <OpenLayers.Handler.Plotting>
 */
OpenLayers.Handler.Plotting = OpenLayers.Class(OpenLayers.Handler, {
    /**
     * APIProperty: controlPoints
     * 存储标绘扩展符号的控制点。
     */
    controlPoints: [],

    /**
     * APIProperty: plotting
     * 标绘扩展符号，在子类的 createFeature() 中确定其实际类型。
     */
    plotting: null,

    /**
     * APIProperty: controlPoints
     * 标绘扩展符号是否处于绘制过程中，控制符号的动态显示。
     */
    isDrawing: false,

    /**
     * APIProperty: layerOptions
     * {Object} 临时绘制图层的可选属性，可用来设置图层的样式。
     */
    layerOptions: null,

    /**
     * APIProperty: pixelTolerance
     * {Number} 绘制点像素容差。绘制点操作所允许的鼠标 down 和 up（包括普通的mousedown、mouseup和touchstart、touchend）
     * 事件之间的最大像素间隔。
     * 如果设置为有效的integer值，则当鼠标down和up之间间隔超过该值时将被忽略，不会添加点要素。默认值是 5。
     */
    pixelTolerance: 5,

    /**
     * Property: point
     * {<OpenLayers.Feature.Vector>} The currently drawn point （当前鼠标位置点，即绘制点）
     */
    point: null,

    /**
     * Property: layer
     * {<OpenLayers.Layer.Vector>} The temporary drawing layer
     */
    layer: null,

    /**
     * Property: multi
     * {Boolean} 在传递事件到图层leyer之前，为多个节点的几何对象创建feature要素实例。默认值是false。
     */
    multi: false,

    /**
     * Property: mouseDown
     * {Boolean} The mouse is down
     */
    mouseDown: false,

    /**
     * Property: stoppedDown
     * {Boolean} Indicate whether the last mousedown stopped the event
     * propagation.
     */
    stoppedDown: null,

    /**
     * Property: lastDown
     * {<OpenLayers.Pixel>} Location of the last mouse down
     */
    lastDown: null,

    /**
     * Property: lastUp
     * {<OpenLayers.Pixel>}
     */
    lastUp: null,

    /**
     * Property: persist
     * {Boolean} 保留呈现的feature要素直到destroyFeature方法被调用。默认为false。
     * 如果设置为true，那么feature会保持呈现，直到handler被设置为无效或者开启另一次绘制的时候调用destroyFeature方法来清除。
     */
    persist: false,

    /**
     * Property: stopDown
     * {Boolean} 停止鼠标mousedown事件的传播。在允许"绘制过程中平移"的时候必须设置为false。默认值为false。
     */
    stopDown: false,

    /**
     * Propery: stopUp
     * {Boolean} 停止鼠标事件的传播。在允许"拖拽过程中平移"的时候必须设置为false。默认值为false。
     */
    stopUp: false,

    /**
     * Property: touch
     * {Boolean} Indcates the support of touch events.
     */
    touch: false,

    /**
     * Property: lastTouchPx
     * {<OpenLayers.Pixel>} The last pixel used to know the distance between
     * two touches (for double touch).
     */
    lastTouchPx: null,

    /**
     * Constructor: OpenLayers.Handler.Plotting
     * 构造函数，创建一个新的绘制态势符号要素的事件处理器。
     *
     * Parameters:
     * control - {<OpenLayers.Control>} 构建当前事件处理器的控件对象。
     * callbacks - {Object} 回调函数对象。关于回调的具体描述参见下文。
     * options - {Object} 一个可选对象，其属性将会赋值到事件处理器对象上。
     *
     * Named callbacks:
     * create - 当要素草图第一次创建的时候调用，回调函数需接收两个参数：当前点几何对象、当前要素。
     * modify - 顶点的每一次变化时调用，回调函数接受参数：几何点对象、当前要素。
     * done - 当绘制点操作完成时调用，回调函数接收一个参数，当前点的几何对象。
     * cancel - 绘制过程中关闭当前事件处理器的监听时调用，回调函数接收当前要素的几何对象作为参数。
     */
    initialize: function(control, callbacks, options) {
        if (!(options && options.layerOptions && options.layerOptions.styleMap)) {
            if (!this.style)
                this.style = OpenLayers.Util.extend(OpenLayers.Feature.Vector.style['default'], {});
        }

        OpenLayers.Handler.prototype.initialize.apply(this, arguments);
    },

    /**
     * APIMethod: activate
     * 激活事件处理器对象上的监听处理，如果这个事件处理器对象已经激活，则返回false.
     *
     * Returns:
     * {Boolean} 事件处理器对象监听激活成功.
     */
    activate: function() {
        if (!OpenLayers.Handler.prototype.activate.apply(this, arguments)) {
            return false;
        }

        this.controlPoints = [];
        this.plotting = null;
        this.isDrawing = false;

        // create temporary vector layer for rendering Geometry sketch
        // TBD: this could be moved to initialize/destroy - setting visibility here
        var options = OpenLayers.Util.extend({
            displayInLayerSwitcher: false,
            // indicate that the temp vector layer will never be out of range
            // without this, resolution properties must be specified at the
            // map-level for this temporary layer to init its resolutions
            // correctly
            calculateInRange: OpenLayers.Function.True
        }, this.layerOptions);
        this.layer = new OpenLayers.Layer.Vector(this.CLASS_NAME, options);
        this.map.addLayer(this.layer);
        OpenLayers.Element.addClass(
            this.map.viewPortDiv, "smDefault");
        return true;
    },

    /**
     * APIMethod: deactivate
     * 关闭事件处理器对象上的监听处理，如果这个事件处理器已经是关闭状态，则返回false
     *
     * Returns:
     * {Boolean} 事件处理器对象监听已经成功关闭。
     */
    deactivate: function() {
        if (!OpenLayers.Handler.prototype.deactivate.apply(this, arguments)) {
            return false;
        }

        this.controlPoints = [];
        this.plotting = null;
        this.isDrawing = false;

        this.cancel();
        // If a layer's map property is set to null, it means that that layer
        // isn't added to the map. Since we ourself added the layer to the map
        // in activate(), we can assume that if this.layer.map is null it means
        // that the layer has been destroyed (as a result of map.destroy() for
        // example.
        if (this.layer.map != null) {
            //deactivate后，移除绘制时的鼠标样式
            OpenLayers.Element.removeClass(
                this.map.viewPortDiv, "smDefault");
            this.destroyFeature(true);
            this.layer.destroy(false);
        }
        this.layer = null;
        this.touch = false;
        return true;
    },

    /**
     * APIMethod: createFeature
     * 创建标绘扩展符号。
     * 子类必须实现该方法，确定符号（plotting）的实例。eg:
     *
     *  this.plotting = new OpenLayers.Feature.Vector(
     *
     *       //标绘扩展符号的 Geometry 类型为 GeoCircle
     *
     *      new OpenLayers.Geometry.GeoCircle()
     *
     *  );
     *
     * Parameters:
     * pixel - {<OpenLayers.Pixel>} 当前鼠标在地图上的像素位置.
     */
    createFeature: function(pixel) {},

    /**
     * APIMethod: modifyFeature
     * 绘制过程中修改标绘扩展符号形状。
     * 根据已添加（up函数中添加）的部分的控制点和由当前鼠标位置作为的一个临时控制点产生和符号。
     *
     * 子类视实际情况重写此方法（示例如 DoubleArrow 中的 modifyFeature ）。
     *
     * Parameters:
     * pixel - {<OpenLayers.Pixel>} 鼠标在地图上的当前像素位置
     */
    modifyFeature: function(pixel) {
        //忽略Chrome mouseup触发瞬间 mousemove 产生的相同点
        if (this.lastUp && this.lastUp.equals(pixel)) {
            return true;
        }

        //新建标绘扩展符号
        if (!this.point || !this.plotting) {
            this.createFeature(pixel);
        }

        //修改临时点的位置（鼠标位置）
        var lonlat = this.layer.getLonLatFromViewPortPx(pixel);
        this.point.geometry.x = lonlat.lon;
        this.point.geometry.y = lonlat.lat;

        if (this.isDrawing == true) {
            var geometry = new OpenLayers.Geometry.Point(
                lonlat.lon, lonlat.lat
            );

            var cp = this.controlPoints.concat([geometry]);
            //重新设置标绘扩展符号的控制点
            this.plotting.geometry._controlPoints = this.cloneControlPoints(cp);
            //重新计算标绘扩展符号的geometry
            this.plotting.geometry.calculateParts();
            this.plotting.geometry.calculateBounds();
        }

        this.callback("modify", [this.point.geometry, this.getSketch(), false]);
        this.point.geometry.clearBounds();
        this.drawFeature();
    },

    /**
     * Method: up
     *  操作 mouseup 和 touchend，
     * 发送最后一个 mouseup 点。
     *
     * 子类必须实现此方法。此方法添加符号的控制点 ，根基实际的符号。
     *
     * Parameters:
     * evt - {Event} 浏览器事件，evt.xy 为最后一个 mouseup 的像素位置。
     *
     * Returns:
     * {Boolean} 是否允许事件继续在 map 上传送
     */
    up: function(evt) {},

    /**
     * APIMethod: down
     * Handle mousedown and touchstart.  Adjust the Geometry and redraw.
     * Return determines whether to propagate the event on the map.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    down: function(evt) {
        this.mouseDown = true;
        this.lastDown = evt.xy;
        if (!this.touch) {
            this.modifyFeature(evt.xy);
        }
        this.stoppedDown = this.stopDown;
        return !this.stopDown;
    },

    /**
     * APIMethod: move
     * Handle mousemove and touchmove.  Adjust the Geometry and redraw.
     * Return determines whether to propagate the event on the map.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    move: function(evt) {
        if (!this.touch // no point displayed until up on touch devices
            && (!this.mouseDown || this.stoppedDown)) {
            this.modifyFeature(evt.xy);
        }
        return true;
    },

    /**
     * Method: click
     * Handle clicks.  Clicks are stopped from propagating to other listeners
     *     on map.events or other dom elements.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    click: function(evt) {
        OpenLayers.Event.stop(evt);
        return false;
    },

    /**
     * Method: dblclick
     * Handle double-clicks.  Double-clicks are stopped from propagating to other
     *     listeners on map.events or other dom elements.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    dblclick: function(evt) {
        OpenLayers.Event.stop(evt);
        return false;
    },

    /**
     * Method: destroyPersistedFeature
     * Destroy the persisted feature.
     */
    destroyPersistedFeature: function() {
        var layer = this.layer;
        if (layer && layer.features.length > 1) {
            this.layer.features[0].destroy();
        }
    },

    /**
     * Method: addControlPoint
     * 向 controlPoints 添加控制点
     */
    addControlPoint: function(pixel) {
        var lonlat = this.layer.getLonLatFromViewPortPx(pixel);
        var geometry = new OpenLayers.Geometry.Point(
            lonlat.lon, lonlat.lat
        );
        this.controlPoints.push(geometry);
    },

    /**
     * Method: drawFeature
     * Render features on the temporary layer.
     */
    drawFeature: function() {
        this.layer.renderer.clear();
        this.layer.drawFeature(this.plotting, this.style);
        this.layer.drawFeature(this.point, this.style);
    },

    /**
     * Method: getSketch
     * Return the sketch feature.
     *
     * Returns:
     * {<OpenLayers.Feature.Vector>}
     */
    getSketch: function() {
        return this.plotting;
    },

    /**
     * Method: destroyFeature
     * Destroy the temporary geometries
     *
     * Parameters:
     * force - {Boolean} Destroy even if persist is true.
     */
    destroyFeature: function(force) {
        if (this.layer && (force || !this.persist)) {
            this.layer.destroyFeatures();
        }
        this.point = null;
        this.plotting = null;
    },

    /**
     * Method: finalize
     * Finish the Geometry and call the "done" callback.
     *
     * Parameters:
     * cancel - {Boolean} Call cancel instead of done callback.  Default
     *          is false.
     */
    finalize: function(cancel) {
        var key = cancel ? "cancel" : "done";
        this.mouseDown = false;
        this.lastDown = null;
        this.lastUp = null;
        this.lastTouchPx = null;
        this.callback(key, [this.geometryClone()]);
        this.destroyFeature(cancel);
    },

    /**
     * APIMethod: cancel
     * 结束绘制操作并且调用cancel回调
     */
    cancel: function() {
        this.finalize(true);
    },

    /**
     * Method: getGeometry
     * Return the sketch Geometry.
     *
     * Returns:
     * {<OpenLayers.Geometry.Point>}
     */
    getGeometry: function() {
        if (this.plotting && this.plotting.geometry) {
            return this.plotting.geometry;
        }
    },

    /**
     * Method: geometryClone
     * Return a clone of the Geometry.
     *
     * Returns:
     * {<OpenLayers.Geometry>}
     */
    geometryClone: function() {
        var geom = this.getGeometry();
        if (geom && geom._controlPoints) {
            var geo = geom.clone();
            geo.calculateParts();
            return geo;
        }
    },

    /**
     * Method: mousedown
     * Handle mousedown.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    mousedown: function(evt) {
        return this.down(evt);
    },

    /**
     * Method: touchstart
     * Handle touchstart.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    touchstart: function(evt) {
        if (!this.touch) {
            this.touch = true;
            // unregister mouse listeners
            this.map.events.un({
                mousedown: this.mousedown,
                mouseup: this.mouseup,
                mousemove: this.mousemove,
                click: this.click,
                dblclick: this.dblclick,
                scope: this
            });
        }
        this.lastTouchPx = evt.xy;
        return this.down(evt);
    },

    /**
     * Method: mousemove
     * Handle mousemove.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    mousemove: function(evt) {
        return this.move(evt);
    },

    /**
     * Method: touchmove
     * Handle touchmove.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    touchmove: function(evt) {
        this.lastTouchPx = evt.xy;
        return this.move(evt);
    },

    /**
     * Method: mouseup
     * Handle mouseup.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    mouseup: function(evt) {
        return this.up(evt);
    },

    /**
     * Method: touchend
     * Handle touchend.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    touchend: function(evt) {
        evt.xy = this.lastTouchPx;
        return this.up(evt);
    },

    /**
     * Method: mouseout
     * Handle mouse out.  For better user experience reset mouseDown
     * and stoppedDown when the mouse leaves the map viewport.
     *
     * Parameters:
     * evt - {Event} The browser event
     */
    mouseout: function(evt) {
        if (OpenLayers.Util.mouseLeft(evt, this.map.eventsDiv)) {
            this.stoppedDown = this.stopDown;
            this.mouseDown = false;
        }
    },

    /**
     * Method: passesTolerance
     * Determine whether the event is within the optional pixel tolerance.
     *
     * Returns:
     * {Boolean} The event is within the pixel tolerance (if specified).
     */
    passesTolerance: function(pixel1, pixel2, tolerance) {
        var passes = true;

        if (tolerance != null && pixel1 && pixel2) {
            var dist = pixel1.distanceTo(pixel2);
            if (dist > tolerance) {
                passes = false;
            }
        }
        return passes;
    },

    /**
     * Method: cloneControlPoints
     * 克隆控制点数组
     *
     * Parameters:
     * cp - {<OpenLayers.Geometry.Point>} 要进行克隆的控制点数组
     */
    cloneControlPoints: function(cp) {
        var controlPoints = [];

        for (var i = 0; i < cp.length; i++) {
            controlPoints.push(cp[i].clone());
        }

        return controlPoints;
    },

    /**
     * Method: drawComplete
     * 绘制完成操作
     * 当一个标绘扩展符号完成时调用此函数
     *
     */
    drawComplete: function() {
        this.finalize();
        this.isDrawing = false;
        this.controlPoints = [];

        if (this.active == true) {
            this.layer.removeAllFeatures();
        }
    },

    CLASS_NAME: "OpenLayers.Handler.Plotting"
});
/**
 * @requires OpenLayers/Control/DragFeature.js
 * @requires OpenLayers/Control/SelectFeature.js
 */

/**
 * Class: OpenLayers.Control.PlottingEdit
 * 标绘扩展符号编辑控件。
 *
 * 该控件激活时，单击即可选中标绘扩展符号，被选中的符号将显示其控制点，拖拽这些控制点以编辑标绘扩展符号，拖拽符号本身平移符号。
 *
 * 通过 active 和 deactive 两个方法，实现动态的激活和注销。
 *
 * Inherits From:
 *  - <OpenLayers.Control>
 */
OpenLayers.Control.PlottingEdit = OpenLayers.Class(OpenLayers.Control, {
    /**
     * Constant: EVENT_TYPES
     * 支持的事件类型:
     *  - *beforefeaturemodified* 当图层上的要素（标绘扩展符号）开始编辑前触发该事件。
     *  - *featuremodified* 当图层上的要素（标绘扩展符号）编辑时触发该事件。
     *  - *afterfeaturemodified* 当图层上的要素（标绘扩展符号）编辑完成时，触发该事件。
     */
    EVENT_TYPES: ["beforefeaturemodified", "featuremodified", "afterfeaturemodified"],

    /**
     * APIProperty: clickout
     * {Boolean} 是否在要素区域外点击鼠标，取消选择要素。默认为true。
     */
    clickout: true,

    /**
     * APIProperty: controlPointsStyle
     * {String} 控制点style。
     *
     * controlPointsStyle的可设属性如下：
     * fillColor - {String} 十六进制填充颜色，默认为"#ee9900"。
     * fillOpacity - {Number} 填充不透明度。默认为0.4。
     * strokeColor - {String} 十六进制描边颜色。
     * strokeOpacity - {Number} 描边的不透明度(0-1),默认为0.4。
     * strokeWidth - {Number} 像素描边宽度，默认为1。
     * pointRadius - {Number} 像素点半径，默认为6
     */
    controlPointsStyle: null,

    /**
     * Property: defaultStyle
     * {Boolean} 控制点默认 style。
     */
    defaultStyle: {
        fillColor: "#ee9900",
        fillOpacity: 0.4,
        strokeColor: "#ee9900",
        strokeOpacity: 1,
        strokeWidth: 1,
        pointRadius: 6
    },

    /**
     * Property: controlPoints
     * 标绘扩展符号的控制点
     */
    controlPoints: [],

    /**
     * Property: layer
     * {<OpenLayers.Layer.Vector>}
     */
    layer: null,

    /**
     * Property: feature
     * {<OpenLayers.Feature.Vector>} Feature（plotting symbol）currently available for modification.
     */
    feature: null,

    /**
     * Property: selectControl
     * {<OpenLayers.Control.SelectFeature>}
     */
    selectControl: null,

    /**
     * Property: dragControl
     * {<OpenLayers.Control.DragFeature>}
     */
    dragControl: null,

    /**
     * Property: modified
     * {Boolean} The currently selected feature has been modified.
     */
    modified: false,

    /**
     * Constructor: OpenLayers.Control.PlottingEdit
     * 创建该控件的新实例。
     *
     * Parameters:
     * layer - {<OpenLayers.Layer.Vector>} 执行编辑的图层。
     * options - {Object} 设置该类开放的属性值。
     *
     * 创建 PlottingEdit 控件新实例的方法如下所示：
     * (start code)
     * //定义一个矢量图层 vectorLayer 进行符号的编辑
     * var vectorLayer = new OpenLayers.Layer.Vector("vector Layer");
     * //实例化一个 plottingEdit 控件
     * var plottingEdit = new OpenLayers.Control.PlottingEdit(vectorLayer);
     * //地图上添加控件
     * map.addControl(plottingEdit);
     * //激活 plottingEdit 控件
     * plottingEdit.activate();
     * (end)
     */
    initialize: function(layer, options) {
        options = options || {};
        this.layer = layer;
        this.controlPoints = [];
        OpenLayers.Control.prototype.initialize.apply(this, [options]);

        var control = this;

        // configure the select control
        var selectOptions = {
            clickout: this.clickout,
            toggle: false,
            onBeforeSelect: this.beforeSelectFeature,
            onSelect: this.selectFeature,
            onUnselect: this.unselectFeature,
            scope: this
        };
        this.selectControl = new OpenLayers.Control.SelectFeature(
            layer, selectOptions
        );

        // configure the drag control
        var dragOptions = {
            onStart: function(feature, pixel) {
                control.dragStart.apply(control, [feature, pixel]);
            },
            onDrag: function(feature, pixel) {
                control.dragControlPoint.apply(control, [feature, pixel]);
            },
            onComplete: function(feature) {
                control.dragComplete.apply(control, [feature]);
            },
            featureCallbacks: {
                over: function(feature) {
                    control.dragControl.overFeature.apply(
                        control.dragControl, [feature]);
                }
            }
        };
        this.dragControl = new OpenLayers.Control.DragFeature(
            layer, dragOptions
        );
    },

    /**
     * APIMethod: destroy
     * 销毁该类，释放空间。
     */
    destroy: function() {
        this.controlPoints = [];
        this.layer = null;
        this.selectControl.destroy();
        this.dragControl.destroy();
        OpenLayers.Control.prototype.destroy.apply(this, []);
    },

    /**
     * APIMethod: activate
     * 激活该控件。
     *
     * Returns:
     * {Boolean} 激活控件是否成功。
     */
    activate: function() {
        return (this.selectControl.activate() &&
            OpenLayers.Control.prototype.activate.apply(this, arguments));
    },

    /**
     * APIMethod: deactivate
     * 取消激活控件，使其不可用。
     *
     * Returns:
     * {Boolean} 返回操作是否成功。
     */
    deactivate: function() {
        var deactivated = false;
        // the return from the controls is unimportant in this case
        if (OpenLayers.Control.prototype.deactivate.apply(this, arguments)) {
            this.layer.removeFeatures(this.controlPoints, {
                silent: true
            });
            this.controlPoints = [];
            this.dragControl.deactivate();
            var feature = this.feature;
            var valid = feature && feature.geometry && feature.layer;

            if (valid) {
                this.selectControl.unselect.apply(this.selectControl, [feature]);
            }
            this.selectControl.deactivate();

            deactivated = true;
        }
        return deactivated;
    },

    isPlottingGeometry: function(feature) {
        if (feature.geometry instanceof OpenLayers.Geometry.GeoPlotting || feature.geometry instanceof OpenLayers.Geometry.GeoLinePlotting || feature.geometry instanceof OpenLayers.Geometry.GeoMultiLinePlotting || feature.geometry instanceof OpenLayers.Geometry.GeoMultiPoint || feature.geometry instanceof OpenLayers.Geometry.GeoPoint)
            return true;
        else {
            return false;
        }
    },
    /**
     * APIMethod: deleteSymbol
     * 删除标绘扩展符号 (选中)
     *
     * Returns:
     * {Boolean} 返回操作是否成功。
     */
    deleteSymbol: function() {
        if (this.feature && this.controlPoints && this.controlPoints.length > 0) {
            this.layer.destroyFeatures(this.feature);
            this.layer.destroyFeatures(this.controlPoints);
            this.unselectFeature(this.feature);
            return true;
        } else {
            return false;
        };
    },

    /**
     * APIMethod: selectFeature
     * 选择需要编辑的要素。
     *
     * Parameters:
     * feature - {<OpenLayers.Feature.Vector>} 要选中的要素。
     */
    selectFeature: function(feature) {
        if (this.beforeSelectFeature(feature) !== false) {
            if (this.isPlottingGeometry(feature)) {
                this.feature = feature;
                this.modified = false;
                this.resetControlPoints();
                this.dragControl.activate();
            }
        }
    },

    /**
     * APIMethod: unselectFeature
     * 取消选择编辑的要素。
     *
     * Parameters:
     * feature - {<OpenLayers.Feature.Vector>} The unselected feature.
     */
    unselectFeature: function(feature) {
        this.layer.removeFeatures(this.controlPoints, {
            silent: true
        });
        this.controlPoints = [];
        this.feature = null;
        this.dragControl.deactivate();
        this.layer.events.triggerEvent("afterfeaturemodified", {
            feature: feature,
            modified: this.modified
        });
        this.modified = false;
    },

    /**
     * Method: beforeSelectFeature
     * Called before a feature is selected.
     *
     * Parameters:
     * feature - {<OpenLayers.Feature.Vector>} The feature（plotting symbol） about to be selected.
     */
    beforeSelectFeature: function(feature) {
        return this.layer.events.triggerEvent(
            "beforefeaturemodified", {
                feature: feature
            }
        );
    },

    /**
     * Method: dragStart
     * Called by the drag feature control with before a feature is dragged.
     *
     * Parameters:
     * feature - {<OpenLayers.Feature.Vector>} The control point or plotting symbol about to be dragged.
     * pixel - {<OpenLayers.Pixel>} Pixel location of the mouse event.
     */
    dragStart: function(feature, pixel) {
        if (feature != this.feature && (this.isPlottingGeometry(feature)) && (this.isPlottingGeometry(this.feature))) {
            if (this.feature) {
                this.selectControl.clickFeature.apply(this.selectControl, [this.feature]);
            }
            this.selectControl.clickFeature.apply(
                this.selectControl, [feature]);
            this.dragControl.overFeature.apply(this.dragControl, [feature]);
            this.dragControl.lastPixel = pixel;
            this.dragControl.handlers.drag.started = true;
            this.dragControl.handlers.drag.start = pixel;
            this.dragControl.handlers.drag.last = pixel;
        }

        this._dragPixel = pixel;
        //鼠标手势，IE7、8中需重新设置cursor
        OpenLayers.Element.removeClass(this.map.viewPortDiv, "smDragDown");
        this.map.viewPortDiv.style.cursor = "pointer";
    },

    /**
     * Method: dragControlPoint
     * Called by the drag feature control with each drag move of a control point or a plotting symbol.
     *
     * Parameters:
     * cp - {<OpenLayers.Feature.Vector>} The control point being dragged.
     * pixel - {<OpenLayers.Pixel>} Pixel location of the mouse event.
     */
    dragControlPoint: function(cp, pixel) {
        //拖拽控制点时编辑符号，拖拽符号本身时平移符号（平移符号的所有控制控制点）
        if (cp.geometry.CLASS_NAME == "OpenLayers.Geometry.Point") {
            this.modified = true;
            //拖拽控制点过程中改变符号的Geometry
            var geo = this.feature.geometry;
            if (geo.isMultiPlotting) {
                var ids = [];
                for (var i = 0; i < geo.components.length; i++) {
                    ids.push(geo.components[i].id);
                }
                geo._controlPoints = this.getCpGeos();
                geo.calculateParts();
                for (var i = 0; i < geo.components.length; i++) {
                    geo.components[i].id = ids[i];
                }
                //绘制符号及控制点
                this.layer.drawFeature(this.feature);
                this.layer.drawFeature(cp);

            } else {
                geo._controlPoints = this.getCpGeos();
                geo.calculateParts();
                //绘制符号及控制点
                this.layer.drawFeature(this.feature);
                this.layer.drawFeature(cp);
            }
        } else if (this.isPlottingGeometry(cp)) {
            this.modified = true;

            //平移的时候不显示控制点
            this.layer.removeFeatures(this.controlPoints, {
                silent: true
            });

            //当前位置
            var lonLat = this.layer.getLonLatFromViewPortPx(pixel);
            //拖拽开始的位置
            var ll = this.layer.getLonLatFromViewPortPx(this._dragPixel);

            var cps = this.getCpGeos();
            for (var i = 0, len = cps.length; i < len; i++) {
                var cp = cps[i];
                //平移控制点（符号geometry的平移在拖拽控件中完成）
                cp.x += lonLat.lon - ll.lon;
                cp.y += lonLat.lat - ll.lat;
            }
            var geo = this.feature.geometry;
            geo._controlPoints = cps;
            if (geo.isMultiPlotting) geo.calculateParts();
            this._dragPixel = pixel;
        }
    },

    /**
     * Method: dragComplete
     * Called by the drag feature control when the dragging is complete.
     */
    dragComplete: function() {
        delete this._dragPixel;
        this.resetControlPoints();
        this.setFeatureState();
        this.layer.events.triggerEvent("featuremodified", {
            feature: this.feature
        });
    },

    /**
     * Method: setFeatureState
     * Called when the feature is modified.  If the current state is not
     *     INSERT or DELETE, the state is set to UPDATE.
     */
    setFeatureState: function() {
        if (this.feature.state != OpenLayers.State.INSERT &&
            this.feature.state != OpenLayers.State.DELETE) {
            this.feature.state = OpenLayers.State.UPDATE;
        }
    },

    /**
     * Method: resetControlPoints
     * 重设控制点
     */
    resetControlPoints: function() {
        //移除当前控制点
        if (this.controlPoints.length > 0) {
            this.layer.removeFeatures(this.controlPoints, {
                silent: true
            });
            this.controlPoints = [];
        }
        //重设控制点
        this.collectControlPoints();
    },

    /**
     * Method: collectControlPoints
     * Collect the control points from the modifiable plotting symbol's Geometry and push
     *     them on to the control's controlPoints array.
     */
    collectControlPoints: function() {
        if (!this.feature || !this.feature.geometry) return;
        this.controlPoints = [];
        var control = this;

        //重设符号 Geometry 的 控制点
        function collectGeometryControlPoints(geometry) {
            var i, controlPoi, cp;
            if (geometry instanceof OpenLayers.Geometry.GeoPlotting || geometry instanceof OpenLayers.Geometry.GeoLinePlotting || geometry instanceof OpenLayers.Geometry.GeoPoint || geometry instanceof OpenLayers.Geometry.GeoMultiPoint || geometry instanceof OpenLayers.Geometry.GeoMultiLinePlotting) {
                var numCont = geometry._controlPoints.length;
                for (i = 0; i < numCont; ++i) {
                    cp = geometry._controlPoints[i];
                    if (cp.CLASS_NAME == "OpenLayers.Geometry.Point") {
                        controlPoi = new OpenLayers.Feature.Vector(cp);
                        controlPoi._sketch = true;
                        controlPoi.style = OpenLayers.Util.copyAttributes(controlPoi.style, control.defaultStyle);
                        if (control.controlPointsStyle) {
                            controlPoi.style = OpenLayers.Util.copyAttributes(controlPoi.style, control.controlPointsStyle);
                        }
                        control.controlPoints.push(controlPoi);
                    }
                }
            }
        }

        collectGeometryControlPoints.call(this, this.feature.geometry);
        this.layer.addFeatures(this.controlPoints, {
            silent: true
        });
    },


    /**
     * Method: setMap
     * Set the map property for the control and all handlers.
     *
     * Parameters:
     * map - {<OpenLayers.Map>} The control's map.
     */
    setMap: function(map) {
        this.selectControl.setMap(map);
        this.dragControl.setMap(map);
        OpenLayers.Control.prototype.setMap.apply(this, arguments);
    },

    /**
     * Method: getCpGeos
     * 从 this.controlPoints 中获取出 Geometry 控制点数组
     *
     */
    getCpGeos: function() {
        var cpFeas = this.controlPoints;
        var cpGeos = [];

        for (var i = 0; i < cpFeas.length; i++) {
            cpGeos.push(cpFeas[i].geometry);
        }

        return cpGeos;
    },

    /**
     * Method: cloneControlPoints
     * 克隆控制点数组
     *
     * Parameters:
     * cp - {<OpenLayers.Geometry.Point>} 要进行克隆的控制点数组
     */
    cloneControlPoints: function(cp) {
        var controlPoints = [];

        for (var i = 0; i < cp.length; i++) {
            controlPoints.push(cp[i].clone());
        }

        return controlPoints;
    },

    /**
     * Method: controlPointsToJSON
     * 当前符号（this.feature）的控制点（Geometry._controlPoints）转为json数据。
     * (用于测试的方法)
     */
    controlPointstoJSON: function(map) {
        if (this.feature && this.feature.geometry && (this.isPlottingGeometry(this.feature))) {
            return this.feature.geometry.toJSON();
        }
    },

    CLASS_NAME: "OpenLayers.Control.PlottingEdit"
});
/**
 * @requires OpenLayers.Geometry.Point.js
 */

/**
 *
 * Class: OpenLayers.Geometry.GeoPoint
 * 点。
 *
 * Inherits from:
 *  - <OpenLayers.Geometry.Point>
 */
OpenLayers.Geometry.GeoPoint = OpenLayers.Class(
    OpenLayers.Geometry.Point, {
        /**
         * Property: _controlPoints
         * 定义控制点字段
         * 用于存储标绘扩展符号的所有控制点
         */
        _controlPoints: [],
        /**
         * Constructor: OpenLayers.Geometry.GeoPoint
         * 构造函数
         *
         * Parameters:
         * point - {<OpenLayers.Geometry.Point>} 需要传入的控制点，默认为null
         */
        initialize: function(point) {
            OpenLayers.Geometry.Point.prototype.initialize.apply(this, arguments);
            if (point && point instanceof OpenLayers.Geometry.Point) {
                this._controlPoints.push(point);
                this.calculateParts();
            }
        },

        /**
         * APIMethod: setControlPoint
         * 设置控制点
         *
         * Parameters:
         * point - {<OpenLayers.Geometry.Point>} 控制点
         */
        setControlPoint: function(point) {
            if (point && point instanceof OpenLayers.Geometry.Point) {
                this._controlPoints = [point];
                this.calculateParts();
            }
        },
        /**
         * APIMethod: getControlPoint
         * 获取符号控制点
         */
        getControlPoint: function() {
            return this._controlPoints[0];
        },
        /**
         * APIMethod: toJSON
         * 将军标符号点对象转换为json数据
         *
         * Returns:
         * {String} 返回的字符串。
         */
        toJSON: function(map) {
            if (!this._controlPoints) {
                return null;
            }
            var cp = this._controlPoints[0];
            return "{\"controlPoints\":[" + "{\"x\":  " + cp.x + ", \"y\": " + cp.y + "}" + "]}";
        },

        /**
         * APIMethod: clone
         * 重写clone方法，必须深赋值
         *
         * Returns:
         * {String} 返回几何对象。
         */
        clone: function() {
            var GeoPoint = new OpenLayers.Geometry.GeoPoint();
            var controlPoints = [];
            //这里必须深赋值，不然在编辑时由于引用的问题出现错误
            controlPoints.push(this._controlPoints[0].clone());
            GeoPoint._controlPoints = controlPoints;
            return GeoPoint;
        },


        /**
         * Method: calculateParts
         * 重写了父类的方法
         */
        calculateParts: function() {
            if (this._controlPoints.length > 0) {
                var point = this._controlPoints[0].clone();
                this.x = point.x;
                this.y = point.y;
            }
        },
        CLASS_NAME: "OpenLayers.Geometry.Point"
    }
);

/**
 * APIMethod: fromJSON
 * 根据json数据转换为 GeoPoint 对象
 *
 * Parameters:
 * str - {String} json数据
 *
 * Returns:
 * {<OpenLayers.Geometry.GeoPoint>} 返回的 GeoPoint 对象。
 */
OpenLayers.Geometry.GeoPoint.fromJSON = function(str, map) {
    var GeoPoint = new OpenLayers.Geometry.GeoPoint();
    //匹配控制点的数据
    //取第二个代表获取括号内匹配的
    var s = str.match(/"controlPoints":(\[.*?\])/)[1];

    //匹配每一个Point的json格式
    var r = /{.*?}/g;
    var arr = s.match(r);
    var point = eval('(' + arr[0] + ')');
    var cps = [new OpenLayers.Geometry.Point(point.x, point.y)];
    GeoPoint._controlPoints = cps;
    return GeoPoint;
};
/**
 * @requires OpenLayers.Geometry.Point
 * @requires OpenLayers.Geometry.GeoMultiPoint
 */

/**
 *
 * Class: OpenLayers.Geometry.GeoMultiPoint
 * 多点。
 * 绘制多个点
 *
 * Inherits from:
 *  - <OpenLayers.Geometry.MultiPoint>
 */
OpenLayers.Geometry.GeoMultiPoint = OpenLayers.Class(
    OpenLayers.Geometry.MultiPoint, {
        /**
         * Property: _controlPoints
         * 定义控制点字段
         * 用于存储标绘扩展符号的所有控制点
         */
        _controlPoints: [],
        /**
         * Property: isMultiPlotting
         * 用于绘制时判断是否是复合标绘符号
         */
        isMultiPlotting: true,
        /**
         * Constructor: OpenLayers.Geometry.GeoMultiPoint
         * 构造函数
         *
         * Parameters:
         * points - {Array(<OpenLayers.Geometry.Point>)} 需要传入的控制点，默认为null
         */
        initialize: function(points) {
            OpenLayers.Geometry.MultiPoint.prototype.initialize.apply(this, arguments);
            this._controlPoints = points;
            if (points && points.length > 0) {
                this.calculateParts();
            }
        },

        /**
         /**
         * APIMethod: toJSON
         * 将标绘扩展对象转换为json数据（只解析控制点）
         *
         * Returns:
         * {String} 返回转换后的 JSON 对象。
         */
        toJSON: function(map) {
            if (!this._controlPoints) {
                return null;
            }

            var len = this._controlPoints.length;
            var arr = [];
            for (var i = 0; i < len; i++) {
                arr.push(this.controlPointToJSON(this._controlPoints[i], map));
            }

            return "{\"controlPoints\":[" + arr.join(",") + "]}";
        },
        /**
         * Method: controlPointToJSON
         * 将控制点转换为Json
         *
         * Parameters:
         * cp - {<OpenLayers.Geometry.Point>} 要转换为Json的控制点
         */
        controlPointToJSON: function(cp, map) {
            if (map) {
                cp = NPMap.T.getPoint(map, {
                    lon: cp.x,
                    lat: cp.y
                });
                cp = {
                    x: cp.lon,
                    y: cp.lat
                }
            }
            return "{\"x\":  " + cp.x + ", \"y\": " + cp.y + "}";
        },

        /**
         * APIMethod: getControlPoints
         * 获取符号控制点
         */
        getControlPoints: function() {
            return this._controlPoints;
        },

        /**
         * APIMethod: setControlPoint
         * 设置控制点
         *
         * Parameters:
         * points - {Array(<OpenLayers.Geometry.Point>)} 控制点数组
         */
        setControlPoint: function(points) {
            if (points && points.length && points.length > 0) {
                this._controlPoints = points;
                this.calculateParts();
            }
        },

        /**
         * APIMethod: clone
         * 重写clone方法，必须深赋值
         *
         * Returns:
         * {String} 返回几何对象。
         */
        clone: function() {
            var geoMultiPoint = new OpenLayers.Geometry.GeoMultiPoint();
            var controlPoints = [];
            //这里只需要赋值控制点
            for (var i = 0, len = this._controlPoints.length; i < len; i++) {
                //这里必须深赋值，不然在编辑时由于引用的问题出现错误
                controlPoints.push(this._controlPoints[i].clone());
            }
            geoMultiPoint._controlPoints = controlPoints;
            return geoMultiPoint;
        },


        /**
         * Method: calculateParts
         * 重写了父类的方法
         * 用于通过中点和边缘点计算圆的边缘360个点，组成一个圆
         */
        calculateParts: function() {
            var controlPoints = this.cloneControlPoints(this._controlPoints);
            //清空原有的所有点
            this.components = [];
            //至少需要两个控制点
            if (this._controlPoints.length > 0) {
                this.components = controlPoints;
            }
        },
        /**
         * Method: cloneControlPoints
         * 克隆控制点数组
         *
         */
        cloneControlPoints: function(cp) {
            var controlPoints = [];

            for (var i = 0; i < cp.length; i++) {
                controlPoints.push(cp[i].clone());
            }
            return controlPoints;
        },


        CLASS_NAME: "OpenLayers.Geometry.GeoMultiPoint"
    }
);
/**
 * APIMethod: getControlPointsFromJSON
 * 根据控制点字符串获取控制点数据
 *
 * Parameters:
 * str - {String} 控制点字符串，形如："[{...},{...}...]"
 *
 * Returns:
 * {Array(<OpenLayers.Geometry.Point>)} 控制点数组
 */
OpenLayers.Geometry.GeoMultiPoint.getControlPointsFromJSON = function(str, map) {
    var cps = [];
    //匹配每一个Point的json格式
    var r = /{.*?}/g;
    var arr = str.match(r);
    for (var i = 0, len = arr.length; i < len; i++) {
        var point = eval('(' + arr[i] + ')');
        if (map) {
            point = NPMap.T.setPoint(map, {
                lon: point.x,
                lat: point.y
            });
            point = {
                x: point.lon,
                y: point.lat
            };
        }
        cps.push(new OpenLayers.Geometry.Point(point.x, point.y));
    }
    return cps;
};
/**
 * APIMethod: fromJSON
 * 根据json数据转换为 GeoMultiPoint 对象
 *
 * Parameters:
 * str - {String} json数据
 *
 * Returns:
 * {<OpenLayers.Geometry.GeoMultiPoint>} 返回的 GeoMultiPoint 对象。
 */
OpenLayers.Geometry.GeoMultiPoint.fromJSON = function(str, map) {
    var point = new OpenLayers.Geometry.GeoMultiPoint();
    //匹配控制点的数据
    //取第二个代表获取括号内匹配的
    var s = str.match(/"controlPoints":(\[.*?\])/)[1];
    var arr = OpenLayers.Geometry.MultiPoint.getControlPointsFromJSON(s, map);
    point._controlPoints = arr;
    return point;
};
/**
 * @requires OpenLayers.Geometry.Point
 * @requires OpenLayers.Geometry.GeoLinePlotting
 */

/**
 *
 * Class: OpenLayers.Geometry.GeoArc
 * 圆弧。
 * 用三点绘制一段经过此三点的圆弧。
 *
 * Inherits from:
 *  - <OpenLayers.Geometry.GeoLinePlotting>
 */
OpenLayers.Geometry.GeoArc = OpenLayers.Class(
    OpenLayers.Geometry.GeoLinePlotting, {
        /**
         * APIProperty: sides
         * {Integer} 圆弧点的密度。默认为720，即每隔1°绘制两个点。
         */
        sides: 720,

        /**
         * Constructor: OpenLayers.Geometry.GeoArc
         * 构造函数
         *
         * Parameters:
         * points - {Array(<OpenLayers.Geometry.Point>)} 需要传入的控制点（理论上应该是两个），默认为null
         */
        initialize: function(points) {
            OpenLayers.Geometry.GeoLinePlotting.prototype.initialize.apply(this, arguments);
        },

        /**
         * APIMethod: toJSON
         * 将军标符号圆对象转换为json数据（只解析控制点）
         *
         * Returns:
         * {String} 返回的字符串。
         */
        toJSON: function(map) {
            return OpenLayers.Geometry.GeoLinePlotting.prototype.toJSON.apply(this, arguments);
        },

        /**
         * APIMethod: clone
         * 重写clone方法，必须深赋值
         *
         * Returns:
         * {String} 返回几何对象。
         */
        clone: function() {
            var geoCircle = new OpenLayers.Geometry.GeoArc();
            var controlPoints = [];
            //这里只需要赋值控制点
            for (var i = 0, len = this._controlPoints.length; i < len; i++) {
                //这里必须深赋值，不然在编辑时由于引用的问题出现错误
                controlPoints.push(this._controlPoints[i].clone());
            }
            geoCircle._controlPoints = controlPoints;
            return geoCircle;
        },

        /**
         * Method: calculateParts
         * 重写了父类的方法
         * 用于通过三点计算圆弧的圆心和半径，以第一个点A、第二个点B为圆弧的端点，第三个点C为圆弧上的一点。
         */
        calculateParts: function() {
            var controlPoints = this.cloneControlPoints(this._controlPoints);
            //清空原有的所有点
            this.components = [];

            //两个点时绘制直线
            if (this._controlPoints.length < 3) {
                this.components = controlPoints;

            }
            //至少需要三个控制点
            if (this._controlPoints.length > 2) {
                var pointA = controlPoints[0];
                var pointB = controlPoints[1];
                var pointC = controlPoints[2];
                //以第一个点A、第二个点B为圆弧的端点，C为圆弧上的一点
                //计算A点和B点的中点
                var midPointAB = this.calculateMidpoint(pointA, pointB);
                //计算B点和C点的中点
                var midPointBC = this.calculateMidpoint(pointB, pointC);
                //计算向量AB
                var vectorAB = new OpenLayers.Geometry.Point(pointB.x - pointA.x, pointB.y - pointA.y);
                //计算向量BC
                var vectorBC = new OpenLayers.Geometry.Point(pointC.x - pointB.x, pointC.y - pointB.y);
                //                判断三点是否共线，若共线，返回三点（直线）
                if (Math.abs(vectorAB.x * vectorBC.y - vectorBC.x * vectorAB.y) < 0.00001) {
                    this.components.push(pointA, pointC, pointB);
                    return;
                }
                //计算过AB中点且与向量AB垂直的向量（AB的中垂线向量）
                var vector_center_midPointAB = this.calculateVector(vectorAB)[1];
                //计算过BC中点且与向量BC垂直的向量（BC的中垂线向量）
                var vector_center_midPointBC = this.calculateVector(vectorBC)[1];
                //计算圆弧的圆心
                var centerPoint = this.calculateIntersection(vector_center_midPointAB, vector_center_midPointBC, midPointAB, midPointBC);
                //计算圆弧的半径
                var radius = this.calculateDistance(centerPoint, pointA);
                //分别计算三点所在的直径线与X轴的夹角
                var angleA = this.calculateAngle(pointA, centerPoint);
                var angleB = this.calculateAngle(pointB, centerPoint);
                var angleC = this.calculateAngle(pointC, centerPoint);
                var PI = Math.PI;

                /*绘制思路为：
                angleA、angleB中最小的角对应的点为起点，最大的角对应的点为终点，若angleC不同时小于或不同时大于angleA与angleB，
                则从起点开始逆时针（direction=1）绘制点，直至终点；否则，从起点开始顺时针（direction=-1）绘制点，直至终点。
                */
                var direction = 1,
                    startAngle = angleA,
                    endAngle = angleB,
                    startP, endP;
                if (angleA > angleB) {
                    startAngle = angleB;
                    endAngle = angleA;
                    startP = pointB;
                    endP = pointA;
                } else {
                    startP = pointA;
                    endP = pointB;
                }
                var length = endAngle - startAngle;
                if ((angleC < angleB && angleC < angleA) || (angleC > angleB && angleC > angleA)) {
                    direction = -1;
                    length = startAngle + (2 * PI - endAngle);
                }

                //计算圆弧上点，默认每隔1°绘制2个点
                var step = PI / this.sides / 2;
                var stepDir = step * direction;
                this.components.push(startP);
                for (var radians = startAngle, i = 0; i < length - step; i += step) {
                    radians += stepDir;
                    radians = radians < 0 ? (radians + 2 * PI) : radians;
                    radians = radians > 2 * PI ? (radians - 2 * PI) : radians;
                    var circlePoint = new OpenLayers.Geometry.Point(Math.cos(radians) * radius + centerPoint.x, Math.sin(radians) * radius + centerPoint.y);
                    this.components.push(circlePoint);

                }
                this.components.push(endP);
            }
        },
        /**
         * Method: calculateAngle
         * 计算圆上，结果以弧度形式表示，范围是+π到 +2π。
         */
        calculateAngle: function(pointA, centerPoint) {
            var angle = Math.atan2((pointA.y - centerPoint.y), (pointA.x - centerPoint.x));
            if (angle < 0) {
                angle += 2 * Math.PI;
            }
            return angle;
        },

        CLASS_NAME: "OpenLayers.Geometry.GeoArc"
    }
);


/**
 * APIMethod: fromJSON
 * 根据json数据转换为 GeoArc 对象
 *
 * Parameters:
 * str - {String} json数据
 *
 * Returns:
 * {<OpenLayers.Geometry.GeoArc>} 返回的 GeoArc 对象。
 */
OpenLayers.Geometry.GeoArc.fromJSON = function(str, map) {
    var geoCircle = new OpenLayers.Geometry.GeoArc();
    //匹配控制点的数据
    //取第二个代表获取括号内匹配的
    var s = str.match(/"controlPoints":(\[.*?\])/)[1];
    var arr = OpenLayers.Geometry.GeoLinePlotting.getControlPointsFromJSON(s, map);
    geoCircle._controlPoints = arr;
    return geoCircle;
};
/**
 * @requires OpenLayers.Geometry.Point
 * @requires OpenLayers.Geometry.GeoLinePlotting
 */

/**
 *
 * Class: OpenLayers.Geometry.GeoBezierCurve2
 * 二次贝塞尔曲线。
 * 使用三个控制点直接创建二次贝塞尔曲线。
 *
 * Inherits from:
 *  - <OpenLayers.Geometry.GeoLinePlotting>
 */
OpenLayers.Geometry.GeoBezierCurve2 = OpenLayers.Class(
    OpenLayers.Geometry.GeoLinePlotting, {
        /**
         * APIProperty: part
         * {Number} 平滑度。取值越大，曲线越平滑。取值为大于1的整数。
         */
        part: 50,
        /**
         * Constructor: OpenLayers.Geometry.GeoBezierCurve2
         * 构造函数
         *
         * Parameters:
         * points - {Array(<OpenLayers.Geometry.Point>)} 需要传入的控制点数组(三个)，默认为null
         */
        initialize: function(points) {
            OpenLayers.Geometry.GeoLinePlotting.prototype.initialize.apply(this, arguments);
        },

        /**
         * APIMethod: toJSON
         * 将军标符号二次贝塞尔曲线对象转换为json数据（只解析了控制点）
         *
         * Returns:
         * {String} 返回的字符串。
         */
        toJSON: function(map) {
            return OpenLayers.Geometry.GeoLinePlotting.prototype.toJSON.apply(this, arguments);
        },

        /**
         * APIMethod: clone
         * 重写clone方法，必须深赋值
         *
         * Returns:
         * {String} 返回几何对象。
         */
        clone: function() {
            var geometry = new OpenLayers.Geometry.GeoBezierCurve2();
            var controlPoints = [];
            //这里只需要赋值控制点
            for (var i = 0, len = this._controlPoints.length; i < len; i++) {
                //这里必须深赋值，不然在编辑时由于引用的问题出现错误
                controlPoints.push(this._controlPoints[i].clone());
            }
            geometry._controlPoints = controlPoints;
            return geometry;
        },
        /**
         * Method: calculateParts
         * 重写了父类的方法
         * 用于通过控制点计算二次贝塞尔曲线的所有点
         */
        calculateParts: function() {
            var controlPoints = this.cloneControlPoints(this._controlPoints);

            //清空原有的所有点
            this.components = [];
            //两个控制点时，绘制直线
            if (controlPoints.length == 2) {
                this.components = controlPoints;
            } else if (controlPoints.length > 2) {

                this.components = OpenLayers.Geometry.LineString.calculatePointsFBZ2(controlPoints, this.part);
            }
        },

        CLASS_NAME: "OpenLayers.Geometry.GeoBezierCurve2"
    }
);

/**
 * APIMethod: fromJSON
 * 根据json数据转换为 GeoBezierCurve2 对象
 *
 * Parameters:
 * str - {String} json数据
 *
 * Returns:
 * {<OpenLayers.Geometry.GeoBezierCurve2>} 返回的 GeoBezierCurve2 对象。
 */
OpenLayers.Geometry.GeoBezierCurve2.fromJSON = function(str, map) {
    var geometry = new OpenLayers.Geometry.GeoBezierCurve2();
    //匹配控制点的数据
    //取第二个代表获取括号内匹配的
    var s = str.match(/"controlPoints":(\[.*?\])/)[1];
    var arr = OpenLayers.Geometry.GeoLinePlotting.getControlPointsFromJSON(s, map);
    geometry._controlPoints = arr;
    return geometry;
};
/**
 * @requires OpenLayers.Geometry.Point.js
 * @requires OpenLayers.Geometry.GeoLinePlotting
 */

/**
 *
 * Class: OpenLayers.Geometry.GeoBezierCurve3
 * 三次贝塞尔曲线。
 * 使用四个控制点直接创建三次贝塞尔曲线。
 *
 * Inherits from:
 *  - <OpenLayers.Geometry.GeoLinePlotting>
 */
OpenLayers.Geometry.GeoBezierCurve3 = OpenLayers.Class(
    OpenLayers.Geometry.GeoLinePlotting, {
        /**
         * APIProperty: part
         * {Number} 平滑度。取值越大，曲线越平滑。取值为大于1的整数。
         */
        part: 50,
        /**
         * Constructor: OpenLayers.Geometry.GeoBezierCurve3
         * 构造函数
         *
         * Parameters:
         * points - {Array(<OpenLayers.Geometry.Point>)} 需要传入的控制点（四个），默认为null
         */
        initialize: function(points) {
            OpenLayers.Geometry.GeoLinePlotting.prototype.initialize.apply(this, arguments);
        },

        /**
         * APIMethod: toJSON
         * 将军标符号三次贝塞尔曲线对象转换为json数据（只解析了控制点）
         *
         * Returns:
         * {String} 返回的字符串。
         */
        toJSON: function(map) {
            return OpenLayers.Geometry.GeoLinePlotting.prototype.toJSON.apply(this, arguments);
        },

        /**
         * APIMethod: clone
         * 重写clone方法，必须深赋值
         *
         * Returns:
         * {String} 返回几何对象。
         */
        clone: function() {
            var geometry = new OpenLayers.Geometry.GeoBezierCurve3();
            var controlPoints = [];
            //这里只需要赋值控制点
            for (var i = 0, len = this._controlPoints.length; i < len; i++) {
                //这里必须深赋值，不然在编辑时由于引用的问题出现错误
                controlPoints.push(this._controlPoints[i].clone());
            }
            geometry._controlPoints = controlPoints;
            return geometry;
        },
        /**
         * Method: calculateParts
         * 重写了父类的方法
         * 用于通过控制点计算三次贝塞尔曲线的所有点
         */
        calculateParts: function() {
            var controlPoints = this.cloneControlPoints(this._controlPoints);

            //清空原有的所有点
            this.components = [];
            //两个控制点时，绘制直线
            if (controlPoints.length < 4) {
                this.components = controlPoints;
            } else if (controlPoints.length > 3) {
                this.components = OpenLayers.Geometry.LineString.calculatePointsFBZ3(controlPoints, this.part);
            }
        },

        CLASS_NAME: "OpenLayers.Geometry.GeoBezierCurve3"
    }
);

/**
 * APIMethod: fromJSON
 * 根据json数据转换为 GeoBezierCurve3 对象
 *
 * Parameters:
 * str - {String} json数据
 *
 * Returns:
 * {<OpenLayers.Geometry.GeoBezierCurve3>} 返回的 GeoBezierCurve3 对象。
 */
OpenLayers.Geometry.GeoBezierCurve3.fromJSON = function(str, map) {
    var geometry = new OpenLayers.Geometry.GeoBezierCurve3();
    //匹配控制点的数据
    //取第二个代表获取括号内匹配的
    var s = str.match(/"controlPoints":(\[.*?\])/)[1];
    var arr = OpenLayers.Geometry.GeoLinePlotting.getControlPointsFromJSON(s, map);
    geometry._controlPoints = arr;
    return geometry;
};
/**
 * @requires OpenLayers.Geometry.Point
 * @requires OpenLayers.Geometry.GeoLinePlotting
 */

/**
 *
 * Class: OpenLayers.Geometry.GeoBezierCurveN
 * N次贝塞尔曲线。
 * 使用四个或四个以上控制点直接创建N次贝塞尔曲线。
 *
 * Inherits from:
 *  - <OpenLayers.Geometry.GeoLinePlotting>
 */
OpenLayers.Geometry.GeoBezierCurveN = OpenLayers.Class(
    OpenLayers.Geometry.GeoLinePlotting, {
        /**
         * APIProperty: part
         * {Number} 平滑度。取值越大，曲线越平滑。取值为大于1的整数。默认为控制点点数的十倍。
         */
        part: null,
        /**
         * Constructor: OpenLayers.Geometry.GeoBezierCurveN
         * 构造函数
         *
         * Parameters:
         * points - {Array(<OpenLayers.Geometry.Point>)} 需要传入的控制点（四个或四个以上），默认为null
         */
        initialize: function(points) {
            OpenLayers.Geometry.GeoLinePlotting.prototype.initialize.apply(this, arguments);
        },

        /**
         * APIMethod: toJSON
         * 将军标符号N次贝塞尔曲线对象转换为json数据（只解析了控制点）
         *
         * Returns:
         * {String} 返回的字符串。
         */
        toJSON: function(map) {
            return OpenLayers.Geometry.GeoLinePlotting.prototype.toJSON.apply(this, arguments);
        },

        /**
         * APIMethod: clone
         * 重写clone方法，必须深赋值
         *
         * Returns:
         * {String} 返回几何对象。
         */
        clone: function() {
            var geometry = new OpenLayers.Geometry.GeoBezierCurveN();
            var controlPoints = [];
            //这里只需要赋值控制点
            for (var i = 0, len = this._controlPoints.length; i < len; i++) {
                //这里必须深赋值，不然在编辑时由于引用的问题出现错误
                controlPoints.push(this._controlPoints[i].clone());
            }
            geometry._controlPoints = controlPoints;
            return geometry;
        },
        /**
         * Method: calculateParts
         * 重写了父类的方法
         * 用于通过控制点计算N次贝塞尔曲线的所有点
         */
        calculateParts: function() {
            var controlPoints = this.cloneControlPoints(this._controlPoints);

            //清空原有的所有点
            this.components = [];
            //两个控制点时，绘制直线
            if (controlPoints.length < 4) {
                this.components = controlPoints;
            } else if (controlPoints.length > 3) {

                if (!this.part) this.part = controlPoints.length * 10;
                this.components = OpenLayers.Geometry.LineString.calculatePointsFBZN(controlPoints, this.part);
            }
        },

        CLASS_NAME: "OpenLayers.Geometry.GeoBezierCurveN"
    }
);

/**
 * APIMethod: fromJSON
 * 根据json数据转换为 GeoBezierCurveN 对象
 *
 * Parameters:
 * str - {String} json数据
 *
 * Returns:
 * {<OpenLayers.Geometry.GeoBezierCurveN>} 返回的 GeoBezierCurveN 对象。
 */
OpenLayers.Geometry.GeoBezierCurveN.fromJSON = function(str, map) {
    var geometry = new OpenLayers.Geometry.GeoBezierCurveN();
    //匹配控制点的数据
    //取第二个代表获取括号内匹配的
    var s = str.match(/"controlPoints":(\[.*?\])/)[1];
    var arr = OpenLayers.Geometry.GeoLinePlotting.getControlPointsFromJSON(s, map);
    geometry._controlPoints = arr;
    return geometry;
};
/**
 * @requires OpenLayers.Geometry.Point
 * @requires OpenLayers.Geometry.GeoLinePlotting
 */

/**
 *
 * Class: OpenLayers.Geometry.GeoCardinalCurve
 * Cardinal曲线。
 * 使用三个或三个以上控制点直接创建Cardinal曲线。
 *
 * Inherits from:
 *  - <OpenLayers.Geometry.GeoLinePlotting>
 */
OpenLayers.Geometry.GeoCardinalCurve = OpenLayers.Class(
    OpenLayers.Geometry.GeoLinePlotting, {
        /**
         * APIProperty: part
         * {Number} 平滑度。取值越大，曲线越平滑。取值为大于1的整数。默认为Cardinal插值点个数的十倍。
         */
        part: null,
        /**
         * Constructor: OpenLayers.Geometry.GeoCardinalCurve
         * 构造函数
         *
         * Parameters:
         * points - {Array(<OpenLayers.Geometry.Point>)} 需要传入的控制点（三个或三个以上），默认为null
         */
        initialize: function(points) {
            OpenLayers.Geometry.GeoLinePlotting.prototype.initialize.apply(this, arguments);
        },

        /**
         * APIMethod: toJSON
         * 将军标符号Cardinal曲线对象转换为json数据（只解析了控制点）
         *
         * Returns:
         * {String} 返回的字符串。
         */
        toJSON: function(map) {
            return OpenLayers.Geometry.GeoLinePlotting.prototype.toJSON.apply(this, arguments);
        },

        /**
         * APIMethod: clone
         * 重写clone方法，必须深赋值
         *
         * Returns:
         * {String} 返回几何对象。
         */
        clone: function() {
            var geometry = new OpenLayers.Geometry.GeoCardinalCurve();
            var controlPoints = [];
            //这里只需要赋值控制点
            for (var i = 0, len = this._controlPoints.length; i < len; i++) {
                //这里必须深赋值，不然在编辑时由于引用的问题出现错误
                controlPoints.push(this._controlPoints[i].clone());
            }
            geometry._controlPoints = controlPoints;
            return geometry;
        },
        /**
         * Method: calculateParts
         * 重写了父类的方法
         * 用于通过控制点计算Cardinal曲线的所有点
         */
        calculateParts: function() {
            var controlPoints = this.cloneControlPoints(this._controlPoints);

            //清空原有的所有点
            this.components = [];
            //两个控制点时，绘制直线
            if (controlPoints.length < 3) {
                this.components = controlPoints;
            } else if (controlPoints.length > 2) {
                var cardinalPoints = OpenLayers.Geometry.LineString.calculateCardinalPoints(controlPoints);
                if (!this.part) this.part = cardinalPoints.length * 10;
                var bezierPts = OpenLayers.Geometry.LineString.calculatePointsFBZ3(cardinalPoints, this.part);
                this.components = bezierPts;
            }
        },

        CLASS_NAME: "OpenLayers.Geometry.GeoCardinalCurve"
    }
);

/**
 * APIMethod: fromJSON
 * 根据json数据转换为 GeoCardinalCurve 对象
 *
 * Parameters:
 * str - {String} json数据
 *
 * Returns:
 * {<OpenLayers.Geometry.GeoCardinalCurve>} 返回的 GeoCardinalCurve 对象。
 */
OpenLayers.Geometry.GeoCardinalCurve.fromJSON = function(str, map) {
    var geometry = new OpenLayers.Geometry.GeoCardinalCurve();
    //匹配控制点的数据
    //取第二个代表获取括号内匹配的
    var s = str.match(/"controlPoints":(\[.*?\])/)[1];
    var arr = OpenLayers.Geometry.GeoLinePlotting.getControlPointsFromJSON(s, map);
    geometry._controlPoints = arr;
    return geometry;
};
/**
 * @requires OpenLayers.Geometry.Point
 * @requires OpenLayers.Geometry.GeoLinePlotting
 */

/**
 *
 * Class: OpenLayers.Geometry.GeoFreeline
 * 自由线。
 * 由鼠标移动轨迹而形成的自由线。
 *
 * Inherits from:
 *  - <OpenLayers.Geometry.GeoLinePlotting>
 */
OpenLayers.Geometry.GeoFreeline = OpenLayers.Class(
    OpenLayers.Geometry.GeoLinePlotting, {
        /**
         * Constructor: OpenLayers.Geometry.GeoFreeline
         * 构造函数
         *
         * Parameters:
         * points - {Array(<OpenLayers.Geometry.Point>)} 需要传入的控制点（两个或两个以上），默认为null
         */
        initialize: function(points) {
            OpenLayers.Geometry.GeoLinePlotting.prototype.initialize.apply(this, arguments);
        },

        /**
         * APIMethod: toJSON
         * 将军标符号闭合曲线对象转换为json数据（只解析了控制点）
         *
         * Returns:
         * {String} 返回的字符串。
         */
        toJSON: function(map) {
            return OpenLayers.Geometry.GeoLinePlotting.prototype.toJSON.apply(this, arguments);
        },

        /**
         * APIMethod: clone
         * 重写clone方法，必须深赋值
         *
         * Returns:
         * {String} 返回几何对象。
         */
        clone: function() {
            var geometry = new OpenLayers.Geometry.GeoFreeline();
            var controlPoints = [];
            //这里只需要赋值控制点
            for (var i = 0, len = this._controlPoints.length; i < len; i++) {
                //这里必须深赋值，不然在编辑时由于引用的问题出现错误
                controlPoints.push(this._controlPoints[i].clone());
            }
            geometry._controlPoints = controlPoints;
            return geometry;
        },
        /**
         * Method: calculateParts
         * 重写了父类的方法
         * 将所有控制点绘制成自由线
         */
        calculateParts: function() {
            var controlPoits = this.cloneControlPoints(this._controlPoints);

            //清空原有的所有点
            this.components = [];
            //两个以上控制点时，绘制自由线
            if (controlPoits.length > 1) {
                this.components = controlPoits;
            }

        },

        CLASS_NAME: "OpenLayers.Geometry.GeoFreeline"
    }
);

/**
 * APIMethod: fromJSON
 * 根据json数据转换为 GeoFreeline 对象
 *
 * Parameters:
 * str - {String} json数据
 *
 * Returns:
 * {<OpenLayers.Geometry.GeoFreeline>} 返回的 GeoFreeline 对象。
 */
OpenLayers.Geometry.GeoFreeline.fromJSON = function(str, map) {
    var geometry = new OpenLayers.Geometry.GeoFreeline();
    //匹配控制点的数据
    //取第二个代表获取括号内匹配的
    var s = str.match(/"controlPoints":(\[.*?\])/)[1];
    var arr = OpenLayers.Geometry.GeoLinePlotting.getControlPointsFromJSON(s, map);
    geometry._controlPoints = arr;
    return geometry;
};
/**
 * @requires OpenLayers.Geometry.Point.js
 * @requires OpenLayers.Geometry.GeoLinePlotting
 */

/**
 *
 * Class: OpenLayers.Geometry.GeoCloseCurve
 * 折线。
 * 使用三个或三个以上控制点直接创建折线。
 *
 * Inherits from:
 *  - <OpenLayers.Geometry.GeoLinePlotting>
 */
OpenLayers.Geometry.GeoPolyline = OpenLayers.Class(
    OpenLayers.Geometry.GeoLinePlotting, {
        /**
         * Constructor: OpenLayers.Geometry.GeoPolyline
         * 构造函数
         *
         * Parameters:
         * points - {Array(<OpenLayers.Geometry.Point>)} 需要传入的控制点（三个或三个以上），默认为null
         */
        initialize: function(points) {
            OpenLayers.Geometry.GeoLinePlotting.prototype.initialize.apply(this, arguments);
        },

        /**
         * APIMethod: toJSON
         * 将军标符号折线对象转换为json数据（只解析了控制点）
         *
         * Returns:
         * {String} 返回的字符串。
         */
        toJSON: function(map) {
            return OpenLayers.Geometry.GeoLinePlotting.prototype.toJSON.apply(this, arguments);
        },

        /**
         * APIMethod: clone
         * 重写clone方法，必须深赋值
         *
         * Returns:
         * {String} 返回几何对象。
         */
        clone: function() {
            var geometry = new OpenLayers.Geometry.GeoPolyline();
            var controlPoints = [];
            //这里只需要赋值控制点
            for (var i = 0, len = this._controlPoints.length; i < len; i++) {
                //这里必须深赋值，不然在编辑时由于引用的问题出现错误
                controlPoints.push(this._controlPoints[i].clone());
            }
            geometry._controlPoints = controlPoints;
            return geometry;
        },
        /**
         * Method: calculateParts
         * 重写了父类的方法
         */
        calculateParts: function() {
            var controlPoints = this.cloneControlPoints(this._controlPoints);
            //清空原有的所有点
            this.components = [];

            if (controlPoints.length > 1) {
                this.components = controlPoints;
            }
        },

        CLASS_NAME: "OpenLayers.Geometry.GeoPolyline"
    }
);

/**
 * APIMethod: fromJSON
 * 根据json数据转换为 GeoPolyline 对象
 *
 * Parameters:
 * str - {String} json数据
 *
 * Returns:
 * {<OpenLayers.Geometry.GeoPolyline>} 返回的 GeoPolyline 对象。
 */
OpenLayers.Geometry.GeoPolyline.fromJSON = function(str, map) {
    var geoPolyline = new OpenLayers.Geometry.GeoPolyline();
    //匹配控制点的数据
    //取第二个代表获取括号内匹配的
    var s = str.match(/"controlPoints":(\[.*?\])/)[1];
    var arr = OpenLayers.Geometry.GeoLinePlotting.getControlPointsFromJSON(s, map);
    geoPolyline._controlPoints = arr;
    return geoPolyline;
};
/**
 * @requires OpenLayers/Geometry/Collection.js
 * @requires OpenLayers/Geometry/LinearRing.js
 * @requires OpenLayers.Geometry.Point.js
 * @requires OpenLayers.Geometry.Polygon.js
 * @requires OpenLayers.Geometry.GeoPlotting
 */

/**
 *
 * Class: OpenLayers.Geometry.GeoCircle
 * 圆。
 * 使用圆心和圆上一点绘制出一个圆
 *
 * Inherits from:
 *  - <OpenLayers.Geometry.GeoPlotting>
 */
OpenLayers.Geometry.GeoCircle = OpenLayers.Class(
    OpenLayers.Geometry.GeoPlotting, {
        /**
         * Constructor: OpenLayers.Geometry.GeoCircle
         * 构造函数
         *
         * Parameters:
         * points - {Array(<OpenLayers.Geometry.Point>)} 需要传入的控制点（理论上应该是两个），默认为null
         */
        initialize: function(points) {
            OpenLayers.Geometry.GeoPlotting.prototype.initialize.apply(this, arguments);
        },

        /**
         * APIMethod: toJSON
         * 将军标符号圆对象转换为json数据（只解析控制点）
         *
         * Returns:
         * {String} 返回的字符串。
         */
        toJSON: function(map) {
            return OpenLayers.Geometry.GeoPlotting.prototype.toJSON.apply(this, arguments);
        },

        /**
         * APIMethod: clone
         * 重写clone方法，必须深赋值
         *
         * Returns:
         * {String} 返回几何对象。
         */
        clone: function() {
            var geoCircle = new OpenLayers.Geometry.GeoCircle();
            var controlPoints = [];
            //这里只需要赋值控制点
            for (var i = 0, len = this._controlPoints.length; i < len; i++) {
                //这里必须深赋值，不然在编辑时由于引用的问题出现错误
                controlPoints.push(this._controlPoints[i].clone());
            }
            geoCircle._controlPoints = controlPoints;
            return geoCircle;
        },

        /**
         * Method: calculateParts
         * 重写了父类的方法
         * 用于通过中点和边缘点计算圆的边缘360个点，组成一个圆
         */
        calculateParts: function() {
            //清空原有的所有点
            this.components = [];
            //至少需要两个控制点
            if (this._controlPoints.length > 1) {
                //取第一个作为中心点
                var centerPoint = this._controlPoints[0];
                //取最后一个作为半径控制点
                var radiusPoint = this._controlPoints[this._controlPoints.length - 1];
                var points = [];
                //计算圆的半径
                var radius = Math.sqrt((radiusPoint.x - centerPoint.x) * (radiusPoint.x - centerPoint.x) +
                    (radiusPoint.y - centerPoint.y) * (radiusPoint.y - centerPoint.y));
                //计算圆的边缘所有点
                for (var i = 0; i < 360; i++) {
                    var radians = (i + 1) * Math.PI / 180;
                    var circlePoint = new OpenLayers.Geometry.Point(Math.cos(radians) * radius + centerPoint.x, Math.sin(radians) * radius + centerPoint.y);
                    points[i] = circlePoint;
                }
                //设置点集
                this.components.push(new OpenLayers.Geometry.LinearRing(points));
            }
        },

        CLASS_NAME: "OpenLayers.Geometry.GeoCircle"
    }
);

/**
 * APIMethod: fromJSON
 * 根据json数据转换为 GeoCircle 对象
 *
 * Parameters:
 * str - {String} json数据
 *
 * Returns:
 * {<OpenLayers.Geometry.GeoCircle>} 返回的 GeoCircle 对象。
 */
OpenLayers.Geometry.GeoCircle.fromJSON = function(str, map) {
    var geoCircle = new OpenLayers.Geometry.GeoCircle();
    //匹配控制点的数据
    //取第二个代表获取括号内匹配的
    var s = str.match(/"controlPoints":(\[.*?\])/)[1];
    var arr = OpenLayers.Geometry.GeoPlotting.getControlPointsFromJSON(s, map);
    geoCircle._controlPoints = arr;
    return geoCircle;
};
/**
 * @requires OpenLayers/Geometry/Collection.js
 * @requires OpenLayers/Geometry/LinearRing.js
 * @requires OpenLayers.Geometry.Point.js
 * @requires OpenLayers.Geometry.Polygon.js
 * @requires OpenLayers.Geometry.GeoPlotting
 */

/**
 *
 * Class: OpenLayers.Geometry.GeoCloseCurve
 * 闭合曲线。
 * 使用三个或三个以上控制点直接创建闭合曲线。
 *
 * Inherits from:
 *  - <OpenLayers.Geometry.GeoPlotting>
 */
OpenLayers.Geometry.GeoCloseCurve = OpenLayers.Class(
    OpenLayers.Geometry.GeoPlotting, {
        /**
         * Constructor: OpenLayers.Geometry.GeoCloseCurve
         * 构造函数
         *
         * Parameters:
         * points - {Array(<OpenLayers.Geometry.Point>)} 需要传入的控制点（三个或三个以上），默认为null
         */
        initialize: function(points) {
            OpenLayers.Geometry.GeoPlotting.prototype.initialize.apply(this, arguments);
        },

        /**
         * APIMethod: toJSON
         * 将军标符号闭合曲线对象转换为json数据（只解析了控制点）
         *
         * Returns:
         * {String} 返回的字符串。
         */
        toJSON: function(map) {
            return OpenLayers.Geometry.GeoPlotting.prototype.toJSON.apply(this, arguments);
        },

        /**
         * APIMethod: clone
         * 重写clone方法，必须深赋值
         *
         * Returns:
         * {String} 返回几何对象。
         */
        clone: function() {
            var GeoCloseCurve = new OpenLayers.Geometry.GeoCloseCurve();
            var controlPoints = [];
            //这里只需要赋值控制点
            for (var i = 0, len = this._controlPoints.length; i < len; i++) {
                //这里必须深赋值，不然在编辑时由于引用的问题出现错误
                controlPoints.push(this._controlPoints[i].clone());
            }
            GeoCloseCurve._controlPoints = controlPoints;
            return GeoCloseCurve;
        },
        /**
         * Method: calculateParts
         * 重写了父类的方法
         * 用于通过控制点计算闭合曲线的所有点
         */
        calculateParts: function() {
            var controlPoits = this.cloneControlPoints(this._controlPoints);

            //清空原有的所有点
            this.components = [];
            //两个控制点时，绘制直线
            if (controlPoits.length == 2) {
                this.components.push(new OpenLayers.Geometry.LineString(controlPoits));
            }
            //至少需要三个控制点
            if (controlPoits.length > 2) {
                var cardinalPoints = OpenLayers.Geometry.LineString.createCloseCardinal(controlPoits);
                this.components.push(OpenLayers.Geometry.LineString.createBezier3(cardinalPoints, 100));
            }
        },

        CLASS_NAME: "OpenLayers.Geometry.GeoCloseCurve"
    }
);

/**
 * APIMethod: fromJSON
 * 根据json数据转换为 GeoCloseCurve 对象
 *
 * Parameters:
 * str - {String} json数据
 *
 * Returns:
 * {<OpenLayers.Geometry.GeoCloseCurve>} 返回的 GeoCloseCurve 对象。
 */
OpenLayers.Geometry.GeoCloseCurve.fromJSON = function(str, map) {
    var GeoCloseCurve = new OpenLayers.Geometry.GeoCloseCurve();
    //匹配控制点的数据
    //取第二个代表获取括号内匹配的
    var s = str.match(/"controlPoints":(\[.*?\])/)[1];
    var arr = OpenLayers.Geometry.GeoPlotting.getControlPointsFromJSON(s, map);
    GeoCloseCurve._controlPoints = arr;
    return GeoCloseCurve;
};
/**
 * @requires OpenLayers/Geometry/Collection.js
 * @requires OpenLayers/Geometry/LinearRing.js
 * @requires OpenLayers.Geometry.Point.js
 * @requires OpenLayers.Geometry.Polygon.js
 * @requires OpenLayers.Geometry.GeoPlotting
 */

/**
 *
 * Class: OpenLayers.Geometry.GeoEllipse
 * 椭圆。
 * 使用椭圆上的两个点绘制出一个椭圆
 *
 * Inherits from:
 *  - <OpenLayers.Geometry.GeoPlotting>
 */
OpenLayers.Geometry.GeoEllipse = OpenLayers.Class(
    OpenLayers.Geometry.GeoPlotting, {

        /**
         * APIProperty: sides
         * {Integer} 椭圆控制点点的数量，要求必须大于2。默认的值为360
         */
        sides: 360,

        /**
         * Constructor: OpenLayers.Geometry.GeoEllipse
         * 构造函数
         *
         * Parameters:
         * points - {Array(<OpenLayers.Geometry.Point>)} 需要传入的控制点（理论上应该是两个），默认为null
         */
        initialize: function(points) {
            OpenLayers.Geometry.GeoPlotting.prototype.initialize.apply(this, arguments);
        },

        /**
         * APIMethod: toJSON
         * 将军标符号圆对象转换为json数据（只解析控制点）
         *
         * Returns:
         * {String} 返回的字符串。
         */
        toJSON: function(map) {
            return OpenLayers.Geometry.GeoPlotting.prototype.toJSON.apply(this, arguments);
        },

        /**
         * APIMethod: clone
         * 重写clone方法，必须深赋值
         *
         * Returns:
         * {String} 返回几何对象。
         */
        clone: function() {
            var GeoEllipse = new OpenLayers.Geometry.GeoEllipse();
            var controlPoints = [];
            //这里只需要赋值控制点
            for (var i = 0, len = this._controlPoints.length; i < len; i++) {
                //这里必须深赋值，不然在编辑时由于引用的问题出现错误
                controlPoints.push(this._controlPoints[i].clone());
            }
            GeoEllipse._controlPoints = controlPoints;
            return GeoEllipse;
        },

        /**
         * Method: calculateParts
         * 重写了父类的方法
         * 用于通过椭圆边缘的两个点计算椭圆的边缘360个点，组成一个椭圆
         */
        calculateParts: function() {
            //清空原有的所有点
            this.components = [];
            //至少需要两个控制点
            if (this._controlPoints.length > 1) {
                //取第一个作为源点
                var origin = this._controlPoints[0];
                //取最后一个作为边计算点
                var radiusPoint = this._controlPoints[this._controlPoints.length - 1];
                var points = [];
                //计算椭圆的半径
                var radius = Math.sqrt(2) * Math.abs(radiusPoint.y - origin.y) / 2;
                var rotatedAngle, x, y, ratio;
                var angle = Math.PI * ((1 / this.sides) - (1 / 2));
                var dx = radiusPoint.x - origin.x;
                var dy = radiusPoint.y - origin.y;

                if (dy == 0) {
                    ratio = dx / (radius * Math.sqrt(2));
                } else {
                    ratio = dx / dy;
                }
                //计算圆的边缘所有点
                for (var i = 0; i < this.sides; ++i) {
                    rotatedAngle = angle + (i * 2 * Math.PI / this.sides);
                    x = origin.x + ratio * (radius * Math.cos(rotatedAngle)) + dx / 2;
                    y = origin.y + (radius * Math.sin(rotatedAngle)) + dy / 2;
                    points[i] = new OpenLayers.Geometry.Point(x, y);
                }
                //设置点集
                this.components.push(new OpenLayers.Geometry.LinearRing(points));
            }
        },

        CLASS_NAME: "OpenLayers.Geometry.GeoEllipse"
    }
);

/**
 * APIMethod: fromJSON
 * 根据json数据转换为 GeoEllipse 对象
 *
 * Parameters:
 * str - {String} json数据
 *
 * Returns:
 * {<OpenLayers.Geometry.GeoEllipse>} 返回的 GeoEllipse 对象。
 */
OpenLayers.Geometry.GeoEllipse.fromJSON = function(str, map) {
    var GeoEllipse = new OpenLayers.Geometry.GeoEllipse();
    //匹配控制点的数据
    //取第二个代表获取括号内匹配的
    var s = str.match(/"controlPoints":(\[.*?\])/)[1];
    var arr = OpenLayers.Geometry.GeoPlotting.getControlPointsFromJSON(s, map);
    GeoEllipse._controlPoints = arr;
    return GeoEllipse;
};
/**
 * @requires OpenLayers/Geometry/Collection.js
 * @requires OpenLayers/Geometry/LinearRing.js
 * @requires OpenLayers.Geometry.Point.js
 * @requires OpenLayers.Geometry.Polygon.js
 * @requires OpenLayers.Geometry.GeoPlotting
 */

/**
 *
 * Class: OpenLayers.Geometry.GeoFreePolygon
 * 手绘面。
 * 由鼠标移动轨迹而形成的手绘面。
 *
 * Inherits from:
 *  - <OpenLayers.Geometry.GeoPlotting>
 */
OpenLayers.Geometry.GeoFreePolygon = OpenLayers.Class(
    OpenLayers.Geometry.GeoPlotting, {
        /**
         * Constructor: OpenLayers.Geometry.GeoFreePolygon
         * 构造函数
         *
         * Parameters:
         * points - {Array(<OpenLayers.Geometry.Point>)} 需要传入的控制点，默认为null
         */
        initialize: function(points) {
            OpenLayers.Geometry.GeoPlotting.prototype.initialize.apply(this, arguments);
        },

        /**
         * APIMethod: toJSON
         * 将军标符号闭合曲线对象转换为json数据（只解析了控制点）
         *
         * Returns:
         * {String} 返回的字符串。
         */
        toJSON: function(map) {
            return OpenLayers.Geometry.GeoPlotting.prototype.toJSON.apply(this, arguments);
        },

        /**
         * APIMethod: clone
         * 重写clone方法，必须深赋值
         *
         * Returns:
         * {String} 返回几何对象。
         */
        clone: function() {
            var geometry = new OpenLayers.Geometry.GeoFreePolygon();
            var controlPoints = [];
            //这里只需要赋值控制点
            for (var i = 0, len = this._controlPoints.length; i < len; i++) {
                //这里必须深赋值，不然在编辑时由于引用的问题出现错误
                controlPoints.push(this._controlPoints[i].clone());
            }
            geometry._controlPoints = controlPoints;
            return geometry;
        },
        /**
         * Method: calculateParts
         * 重写了父类的方法
         * 将所有控制点绘制成手绘面
         */
        calculateParts: function() {
            var controlPoits = this.cloneControlPoints(this._controlPoints);

            //清空原有的所有点
            this.components = [];
            //两个以上控制点时，绘制手绘面
            if (controlPoits.length > 1) {
                this.components.push(new OpenLayers.Geometry.LinearRing(controlPoits));
            }

        },

        CLASS_NAME: "OpenLayers.Geometry.GeoFreePolygon"
    }
);

/**
 * APIMethod: fromJSON
 * 根据json数据转换为 GeoFreePolygon 对象
 *
 * Parameters:
 * str - {String} json数据
 *
 * Returns:
 * {<OpenLayers.Geometry.GeoCloseCurve>} 返回的 GeoCloseCurve 对象。
 */
OpenLayers.Geometry.GeoFreePolygon.fromJSON = function(str, map) {
    var geometry = new OpenLayers.Geometry.GeoFreePolygon();
    //匹配控制点的数据
    //取第二个代表获取括号内匹配的
    var s = str.match(/"controlPoints":(\[.*?\])/)[1];
    var arr = OpenLayers.Geometry.GeoLinePlotting.getControlPointsFromJSON(s, map);
    geometry._controlPoints = arr;
    return geometry;
};
/**
 * @requires OpenLayers/Geometry/Collection.js
 * @requires OpenLayers/Geometry/LinearRing.js
 * @requires OpenLayers.Geometry.Point.js
 * @requires OpenLayers.Geometry.Polygon.js
 * @requires OpenLayers.Geometry.GeoPlotting
 */

/**
 *
 * Class: OpenLayers.Geometry.GeoGatheringPlace
 * 聚集地符号。
 * 使用两个控制点直接创建聚集地符号。
 *
 * Inherits from:
 *  - <OpenLayers.Geometry.GeoPlotting>
 */
OpenLayers.Geometry.GeoGatheringPlace = OpenLayers.Class(
    OpenLayers.Geometry.GeoPlotting, {
        /**
         * Constructor: OpenLayers.Geometry.GeoGatheringPlace
         * 构造函数
         *
         * Parameters:
         * points - {Array(<OpenLayers.Geometry.Point>)} 需要传入的控制点，默认为null
         */
        initialize: function(points) {
            OpenLayers.Geometry.GeoPlotting.prototype.initialize.apply(this, arguments);
        },

        /**
         * APIMethod: toJSON
         * 将军标符号聚集地符号对象转换为json数据（只解析了控制点）
         *
         * Returns:
         * {String} 返回的字符串。
         */
        toJSON: function(map) {
            return OpenLayers.Geometry.GeoPlotting.prototype.toJSON.apply(this, arguments);
        },

        /**
         * APIMethod: clone
         * 重写clone方法，必须深赋值
         *
         * Returns:
         * {String} 返回几何对象。
         */
        clone: function() {
            var GeoGatheringPlace = new OpenLayers.Geometry.GeoGatheringPlace();
            var controlPoints = [];
            //这里只需要赋值控制点
            for (var i = 0, len = this._controlPoints.length; i < len; i++) {
                //这里必须深赋值，不然在编辑时由于引用的问题出现错误
                controlPoints.push(this._controlPoints[i].clone());
            }
            GeoGatheringPlace._controlPoints = controlPoints;
            return GeoGatheringPlace;
        },
        /**
         * Method: calculateParts
         * 重写了父类的方法
         * 用于通过控制点计算聚集地符号的所有点
         */
        calculateParts: function() {
            //清空原有的所有点
            this.components = [];
            //至少需要两个控制点
            if (this._controlPoints.length > 1) {
                //取第一个点作为第一控制点
                var originP = this._controlPoints[0];
                //取最后一个作为第二控制点
                var lastP = this._controlPoints[this._controlPoints.length - 1];
                var points = [];
                // 向量originP_lastP
                var vectorOL = new OpenLayers.Geometry.Point(lastP.x - originP.x, lastP.y - originP.y);
                // 向量originP_lastP的模
                var dOL = Math.sqrt(vectorOL.x * vectorOL.x + vectorOL.y * vectorOL.y);

                //计算第一个插值控制点
                //向量originP_P1以originP为起点，与向量originP_lastP的夹角设为30，模为√3/12*dOL，
                var v_O_P1_lr = this.calculateVector(vectorOL, Math.PI / 3, Math.sqrt(3) / 12 * dOL);
                //取左边的向量作为向量originP_P1
                var originP_P1 = v_O_P1_lr[0];
                var p1 = new OpenLayers.Geometry.Point(originP_P1.x + originP.x, originP_P1.y + originP.y);

                //计算第二个插值控制点，取第一控制点和第二控制点的中点为第二个插值控制点
                var p2 = new OpenLayers.Geometry.Point((originP.x + lastP.x) / 2, (originP.y + lastP.y) / 2);

                //计算第三个插值控制点
                //向量originP_P3以lastP为起点，与向量originP_lastP的夹角设为150°，模为√3/12*dOL，
                var v_L_P3_lr = this.calculateVector(vectorOL, Math.PI * 2 / 3, Math.sqrt(3) / 12 * dOL);
                //取左边的向量作为向量originP_P1
                var lastP_P3 = v_L_P3_lr[0];
                var p3 = new OpenLayers.Geometry.Point(lastP_P3.x + lastP.x, lastP_P3.y + lastP.y);

                //计算第四个插值控制点
                //向量originP_P4以向量originP_lastP中点为起点，与向量originP_lastP的夹角设为90°，模为1/2*dOL，
                var v_O_P5_lr = this.calculateVector(vectorOL, Math.PI / 2, 1 / 2 * dOL);
                //取左边的向量作为向量originP_P1
                var v_O_P5 = v_O_P5_lr[1];
                var p5 = new OpenLayers.Geometry.Point(v_O_P5.x + p2.x, v_O_P5.y + p2.y);

                var P0 = originP.clone();
                var P4 = lastP.clone();
                points.push(P0, p1, p2, p3, P4, p5);

                var cardinalPoints = OpenLayers.Geometry.LineString.createCloseCardinal(points);
                this.components.push(OpenLayers.Geometry.LineString.createBezier3(cardinalPoints, 100));
            }
        },

        CLASS_NAME: "OpenLayers.Geometry.GeoGatheringPlace"
    }
);

/**
 * APIMethod: fromJSON
 * 根据json数据转换为 GeoGatheringPlace 对象
 *
 * Parameters:
 * str - {String} json数据
 *
 * Returns:
 * {<OpenLayers.Geometry.GeoGatheringPlace>} 返回的 GeoGatheringPlace 对象。
 */
OpenLayers.Geometry.GeoGatheringPlace.fromJSON = function(str, map) {
    var GeoGatheringPlace = new OpenLayers.Geometry.GeoGatheringPlace();
    //匹配控制点的数据
    //取第二个代表获取括号内匹配的
    var s = str.match(/"controlPoints":(\[.*?\])/)[1];
    var arr = OpenLayers.Geometry.GeoPlotting.getControlPointsFromJSON(s, map);
    GeoGatheringPlace._controlPoints = arr;
    return GeoGatheringPlace;
};
/**
 * @requires OpenLayers/Geometry/Collection.js
 * @requires OpenLayers/Geometry/LinearRing.js
 * @requires OpenLayers.Geometry.Point.js
 * @requires OpenLayers.Geometry.Polygon.js
 * @requires OpenLayers.Geometry.GeoLinePlotting
 */

/**
 *
 * Class: OpenLayers.Geometry.GeoLune
 * 弓形符号。
 * 使用三点绘制弓形符号.
 *
 * Inherits from:
 *  - <OpenLayers.Geometry.GeoPlotting>
 */
OpenLayers.Geometry.GeoLune = OpenLayers.Class(
    OpenLayers.Geometry.GeoPlotting, {
        /**
         * APIProperty: sides
         * {Integer} 弓形上圆弧的点密度。默认为720，即每隔1°绘制两个点。
         */
        sides: 720,
        /**
         * Constructor: OpenLayers.Geometry.GeoLune
         * 构造函数
         *
         * Parameters:
         * points - {Array(<OpenLayers.Geometry.Point>)} 需要传入的控制点（理论上应该是三个），默认为null
         */
        initialize: function(points) {
            OpenLayers.Geometry.GeoPlotting.prototype.initialize.apply(this, arguments);
        },

        /**
         * APIMethod: toJSON
         * 将军标符号圆对象转换为json数据（只解析控制点）
         *
         * Returns:
         * {String} 返回的字符串。
         */
        toJSON: function(map) {
            return OpenLayers.Geometry.GeoPlotting.prototype.toJSON.apply(this, arguments);
        },

        /**
         * APIMethod: clone
         * 重写clone方法，必须深赋值
         *
         * Returns:
         * {String} 返回几何对象。
         */
        clone: function() {
            var geoCircle = new OpenLayers.Geometry.GeoLune();
            var controlPoints = [];
            //这里只需要赋值控制点
            for (var i = 0, len = this._controlPoints.length; i < len; i++) {
                //这里必须深赋值，不然在编辑时由于引用的问题出现错误
                controlPoints.push(this._controlPoints[i].clone());
            }
            geoCircle._controlPoints = controlPoints;
            return geoCircle;
        },

        /**
         * Method: calculateParts
         * 重写了父类的方法
         * 用于通过三点计算弓形圆弧的圆心和半径，以第一个点A、第二个点B为圆弧的端点，AB连成直线，第三个点C为圆弧上的一点。
         */
        calculateParts: function() {
            var controlPoints = this.cloneControlPoints(this._controlPoints);
            //清空原有的所有点
            this.components = [];

            //两个点时绘制半圆
            if (controlPoints.length == 2) {
                var pointA = controlPoints[0];
                var pointB = controlPoints[1];
                var centerP = this.calculateMidpoint(pointA, pointB);
                var radius = this.calculateDistance(pointA, pointB) / 2;
                var angleS = this.calculateAngle(pointA, centerP);
                var points = this.calculateArc(centerP, radius, angleS, angleS + Math.PI, -1);
                this.components.push(new OpenLayers.Geometry.LinearRing(points));
            }
            //至少需要三个控制点
            if (this._controlPoints.length > 2) {
                var pointA = controlPoints[0];
                var pointB = controlPoints[1];
                var pointC = controlPoints[2];
                var points = [];
                //以第一个点A、第二个点B为圆弧的端点，C为圆弧上的一点
                //计算A点和B点的中点
                var midPointAB = this.calculateMidpoint(pointA, pointB);
                //计算B点和C点的中点
                var midPointBC = this.calculateMidpoint(pointB, pointC);
                //计算向量AB
                var vectorAB = new OpenLayers.Geometry.Point(pointB.x - pointA.x, pointB.y - pointA.y);
                //计算向量BC
                var vectorBC = new OpenLayers.Geometry.Point(pointC.x - pointB.x, pointC.y - pointB.y);
                //                判断三点是否共线，若共线，返回三点（直线）
                if (Math.abs(vectorAB.x * vectorBC.y - vectorBC.x * vectorAB.y) < 0.00001) {
                    points.push(pointA, pointC, pointB);
                    return;
                }
                //计算过AB中点且与向量AB垂直的向量（AB的中垂线向量）
                var vector_center_midPointAB = this.calculateVector(vectorAB)[1];
                //计算过BC中点且与向量BC垂直的向量（BC的中垂线向量）
                var vector_center_midPointBC = this.calculateVector(vectorBC)[1];
                //计算圆弧的圆心
                var centerPoint = this.calculateIntersection(vector_center_midPointAB, vector_center_midPointBC, midPointAB, midPointBC);
                //计算圆弧的半径
                var radius = this.calculateDistance(centerPoint, pointA);
                //分别计算三点所在的直径线与X轴的夹角
                var angleA = this.calculateAngle(pointA, centerPoint);
                var angleB = this.calculateAngle(pointB, centerPoint);
                var angleC = this.calculateAngle(pointC, centerPoint);
                var PI = Math.PI;

                /*圆弧绘制思路为：
                angleA、angleB中最小的角对应的点为起点，最大的角对应的点为终点，若angleC不同时小于或不同时大于angleA与angleB，
                则从起点开始逆时针（direction=1）绘制点，直至终点；否则，从起点开始顺时针（direction=-1）绘制点，直至终点。
                */
                var direction = 1,
                    startAngle = angleA,
                    endAngle = angleB,
                    startP, endP;
                if (angleA > angleB) {
                    startAngle = angleB;
                    endAngle = angleA;
                    startP = pointB;
                    endP = pointA;
                } else {
                    startP = pointA;
                    endP = pointB;
                }
                var length = endAngle - startAngle;
                if ((angleC < angleB && angleC < angleA) || (angleC > angleB && angleC > angleA)) {
                    direction = -1;
                    length = startAngle + (2 * PI - endAngle);
                }

                //计算圆弧上点，默认每隔1°绘制2个点
                var step = PI / this.sides / 2;
                var stepDir = step * direction;
                points.push(startP);
                for (var radians = startAngle, i = 0; i < length - step; i += step) {
                    radians += stepDir;
                    radians = radians < 0 ? (radians + 2 * PI) : radians;
                    radians = radians > 2 * PI ? (radians - 2 * PI) : radians;
                    var circlePoint = new OpenLayers.Geometry.Point(Math.cos(radians) * radius + centerPoint.x, Math.sin(radians) * radius + centerPoint.y);
                    points.push(circlePoint);

                }
                points.push(endP);
                this.components.push(new OpenLayers.Geometry.LinearRing(points));
            }
        },
        /**
         * Method: calculateAngle
         * 计算圆上一点所在半径的直线与X轴的夹角，结果以弧度形式表示，范围是+π到 +2π。
         */
        calculateAngle: function(pointA, centerPoint) {
            var angle = Math.atan2((pointA.y - centerPoint.y), (pointA.x - centerPoint.x));
            if (angle < 0) {
                angle += 2 * Math.PI;
            }
            return angle;
        },

        CLASS_NAME: "OpenLayers.Geometry.GeoLune"
    }
);


/**
 * APIMethod: fromJSON
 * 根据json数据转换为 GeoLune 对象
 *
 * Parameters:
 * str - {String} json数据
 *
 * Returns:
 * {<OpenLayers.Geometry.GeoLune>} 返回的 GeoLune 对象。
 */
OpenLayers.Geometry.GeoLune.fromJSON = function(str, map) {
    var geoCircle = new OpenLayers.Geometry.GeoLune();
    //匹配控制点的数据
    //取第二个代表获取括号内匹配的
    var s = str.match(/"controlPoints":(\[.*?\])/)[1];
    var arr = OpenLayers.Geometry.GeoPlotting.getControlPointsFromJSON(s, map);
    geoCircle._controlPoints = arr;
    return geoCircle;
};
/**
 * @requires OpenLayers.Geometry.Point
 * @requires OpenLayers.Geometry.GeoPlotting
 */

/**
 *
 * Class: OpenLayers.Geometry.GeoPolygonEx
 * 多边形。
 * 使用三个或三个以上控制点直接创建多边形。
 *
 * Inherits from:
 *  - <OpenLayers.Geometry.GeoPlotting>
 */
OpenLayers.Geometry.GeoPolygonEx = OpenLayers.Class(
    OpenLayers.Geometry.GeoPlotting, {
        /**
         * Constructor: OpenLayers.Geometry.GeoPolygonEx
         * 构造函数
         *
         * Parameters:
         * points - {Array(<OpenLayers.Geometry.Point>)} 需要传入的控制点（三个或三个以上），默认为null
         */
        initialize: function(points) {
            OpenLayers.Geometry.GeoPlotting.prototype.initialize.apply(this, arguments);
        },

        /**
         * APIMethod: toJSON
         * 将军标符号多边形对象转换为json数据（只解析了控制点）
         *
         * Returns:
         * {String} 返回的字符串。
         */
        toJSON: function(map) {
            return OpenLayers.Geometry.GeoPlotting.prototype.toJSON.apply(this, arguments);
        },

        /**
         * APIMethod: clone
         * 重写clone方法，必须深赋值
         *
         * Returns:
         * {String} 返回几何对象。
         */
        clone: function() {
            var GeoPolygonEx = new OpenLayers.Geometry.GeoPolygonEx();
            var controlPoints = [];
            //这里只需要赋值控制点
            for (var i = 0, len = this._controlPoints.length; i < len; i++) {
                //这里必须深赋值，不然在编辑时由于引用的问题出现错误
                controlPoints.push(this._controlPoints[i].clone());
            }
            GeoPolygonEx._controlPoints = controlPoints;
            return GeoPolygonEx;
        },
        /**
         * Method: calculateParts
         * 重写了父类的方法
         * 用于通过控制点计算多边形的所有点
         */
        calculateParts: function() {
            var controlPoints = this.cloneControlPoints(this._controlPoints);

            //清空原有的所有点
            this.components = [];
            //两个控制点时，绘制直线
            if (controlPoints.length == 2) {
                this.components.push(new OpenLayers.Geometry.LineString(controlPoints));
            }
            //至少需要三个控制点
            if (controlPoints.length > 2) {

                this.components.push(new OpenLayers.Geometry.LinearRing(controlPoints));
            }
        },

        CLASS_NAME: "OpenLayers.Geometry.GeoPolygonEx"
    }
);

/**
 * APIMethod: fromJSON
 * 根据json数据转换为 GeoPolygonEx 对象
 *
 * Parameters:
 * str - {String} json数据
 *
 * Returns:
 * {<OpenLayers.Geometry.GeoPolygonEx>} 返回的 GeoPolygonEx 对象。
 */
OpenLayers.Geometry.GeoPolygonEx.fromJSON = function(str, map) {
    var GeoPolygonEx = new OpenLayers.Geometry.GeoPolygonEx();
    //匹配控制点的数据
    //取第二个代表获取括号内匹配的
    var s = str.match(/"controlPoints":(\[.*?\])/)[1];
    var arr = OpenLayers.Geometry.GeoPlotting.getControlPointsFromJSON(s, map);
    GeoPolygonEx._controlPoints = arr;
    return GeoPolygonEx;
};
/**
 * @requires OpenLayers/Geometry/Collection.js
 * @requires OpenLayers/Geometry/LinearRing.js
 * @requires OpenLayers.Geometry.Point.js
 * @requires OpenLayers.Geometry.Polygon.js
 * @requires OpenLayers.Geometry.GeoPlotting
 */

/**
 *
 * Class: OpenLayers.Geometry.GeoRectangle
 * 矩形。
 * 使用两个控制点直接创建矩形
 *
 * Inherits from:
 *  - <OpenLayers.Geometry.GeoPlotting>
 */
OpenLayers.Geometry.GeoRectangle = OpenLayers.Class(
    OpenLayers.Geometry.GeoPlotting, {
        /**
         * Constructor: OpenLayers.Geometry.GeoRectangle
         * 构造函数
         *
         * Parameters:
         * points - {Array(<OpenLayers.Geometry.Point>)} 需要传入的控制点（理论上应该是两个），默认为null
         */
        initialize: function(points) {
            OpenLayers.Geometry.GeoPlotting.prototype.initialize.apply(this, arguments);
        },

        /**
         * APIMethod: toJSON
         * 将军标符号矩形对象转换为json数据（只解析了控制点）
         *
         * Returns:
         * {String} 返回的字符串。
         */
        toJSON: function(map) {
            return OpenLayers.Geometry.GeoPlotting.prototype.toJSON.apply(this, arguments);
        },

        /**
         * APIMethod: clone
         * 重写clone方法，必须深赋值
         *
         * Returns:
         * {String} 返回几何对象。
         */
        clone: function() {
            var geoRectFlag = new OpenLayers.Geometry.GeoRectangle();
            var controlPoints = [];
            //这里只需要赋值控制点
            for (var i = 0, len = this._controlPoints.length; i < len; i++) {
                //这里必须深赋值，不然在编辑时由于引用的问题出现错误
                controlPoints.push(this._controlPoints[i].clone());
            }
            geoRectFlag._controlPoints = controlPoints;
            return geoRectFlag;
        },

        /**
         * Method: calculateParts
         * 重写了父类的方法
         * 用于通过两个控制点计算矩形的所有点（5个）
         */
        calculateParts: function() {
            //清空原有的所有点
            this.components = [];
            //至少需要两个控制点
            if (this._controlPoints.length > 1) {
                //取第一个
                var startPoint = this._controlPoints[0];
                //取最后一个
                var endPoint = this._controlPoints[this._controlPoints.length - 1];
                var point1 = startPoint.clone();
                var point2 = new OpenLayers.Geometry.Point(endPoint.x, startPoint.y);
                var point3 = endPoint.clone();
                var point4 = new OpenLayers.Geometry.Point(startPoint.x, endPoint.y);

                this.components.push(new OpenLayers.Geometry.LinearRing([point1, point2, point3, point4]));
            }
        },

        CLASS_NAME: "OpenLayers.Geometry.GeoRectangle"
    }
);

/**
 * APIMethod: fromJSON
 * 根据json数据转换为 GeoRectangle 对象
 *
 * Parameters:
 * str - {String} json数据
 *
 * Returns:
 * {<OpenLayers.Geometry.GeoRectangle>} 返回的 GeoRectangle 对象。
 */
OpenLayers.Geometry.GeoRectangle.fromJSON = function(str, map) {
    var geometry = new OpenLayers.Geometry.GeoRectangle();
    //匹配控制点的数据
    //取第二个代表获取括号内匹配的
    var s = str.match(/"controlPoints":(\[.*?\])/)[1];
    var arr = OpenLayers.Geometry.GeoPlotting.getControlPointsFromJSON(s, map);
    geometry._controlPoints = arr;
    return geometry;
};
/**
 * @requires OpenLayers/Geometry/Collection.js
 * @requires OpenLayers/Geometry/LinearRing.js
 * @requires OpenLayers.Geometry.Point.js
 * @requires OpenLayers.Geometry.Polygon.js
 * @requires OpenLayers.Geometry.GeoPlotting
 */

/**
 *
 * Class: OpenLayers.Geometry.GeoRoundedRect
 * 圆角矩形
 * 使用两个控制点直接创建圆角矩形
 *
 * Inherits from:
 *  - <OpenLayers.Geometry.GeoPlotting>
 */
OpenLayers.Geometry.GeoRoundedRect = OpenLayers.Class(
    OpenLayers.Geometry.GeoPlotting, {
        /**
         * Property: _ratio
         * 圆角矩形上圆弧的半径与矩形长度宽度中最小值的比值，默认是1/10.
         */
        _ratio: 1 / 10,
        /**
         * Constructor: OpenLayers.Geometry.GeoRoundedRect
         * 构造函数
         *
         * Parameters:
         * points - {Array(<OpenLayers.Geometry.Point>)} 需要传入的控制点（理论上应该是两个），默认为null
         */
        initialize: function(points) {
            OpenLayers.Geometry.GeoPlotting.prototype.initialize.apply(this, arguments);
        },

        /**
         * APIMethod: toJSON
         * 将军标符号圆角矩形对象转换为json数据（只解析了控制点）
         *
         * Returns:
         * {String} 返回的字符串。
         */
        toJSON: function(map) {
            return OpenLayers.Geometry.GeoPlotting.prototype.toJSON.apply(this, arguments);
        },

        /**
         * APIMethod: clone
         * 重写clone方法，必须深赋值
         *
         * Returns:
         * {String} 返回几何对象。
         */
        clone: function() {
            var geoRectFlag = new OpenLayers.Geometry.GeoRoundedRect();
            var controlPoints = [];
            //这里只需要赋值控制点
            for (var i = 0, len = this._controlPoints.length; i < len; i++) {
                //这里必须深赋值，不然在编辑时由于引用的问题出现错误
                controlPoints.push(this._controlPoints[i].clone());
            }
            geoRectFlag._controlPoints = controlPoints;
            return geoRectFlag;
        },

        /**
         * Method: calculateParts
         * 重写了父类的方法
         * 用于通过两个控制点计算圆角矩形的所有点（5个）
         */
        calculateParts: function() {
            //            var controlPoints = this.cloneControlPoints(this._controlPoints);
            //清空原有的所有点
            this.components = [];
            //至少需要两个控制点
            if (this._controlPoints.length > 1) {
                //取第一个
                var startPoint = this._controlPoints[0];
                //取最后一个
                var endPoint = this._controlPoints[this._controlPoints.length - 1];
                var maxX = Math.max(startPoint.x, endPoint.x);
                var minX = Math.min(startPoint.x, endPoint.x);
                var maxY = Math.max(startPoint.y, endPoint.y);
                var minY = Math.min(startPoint.y, endPoint.y);

                //圆角半径为矩形宽高中最小值的1/10
                var radius = Math.min(Math.abs(startPoint.x - endPoint.x), Math.abs(startPoint.y - endPoint.y)) * this._ratio;
                //圆角的圆心点依次为矩形的左上点、右上点、右下点、左下点
                var centerPoint0 = new OpenLayers.Geometry.Point(minX + radius, maxY - radius);
                var centerPoint1 = new OpenLayers.Geometry.Point(maxX - radius, maxY - radius);
                var centerPoint2 = new OpenLayers.Geometry.Point(maxX - radius, minY + radius);
                var centerPoint3 = new OpenLayers.Geometry.Point(minX + radius, minY + radius);
                //圆角矩形的圆弧依次为矩形的左上、右上、右下、左下
                var arc0 = this.calculateArc(centerPoint0, radius, Math.PI, Math.PI / 2, -1, 180);
                var arc1 = this.calculateArc(centerPoint1, radius, Math.PI / 2, 0, -1, 180);
                var arc2 = this.calculateArc(centerPoint2, radius, 2 * Math.PI, Math.PI * 3 / 2, -1, 180);
                var arc3 = this.calculateArc(centerPoint3, radius, Math.PI * 3 / 2, Math.PI, -1, 180);
                var points = arc0.concat(arc1, arc2, arc3);
                this.components.push(new OpenLayers.Geometry.LinearRing(points));
            }
        },

        CLASS_NAME: "OpenLayers.Geometry.GeoRoundedRect"
    }
);

/**
 * APIMethod: fromJSON
 * 根据json数据转换为 GeoRoundedRect 对象
 *
 * Parameters:
 * str - {String} json数据
 *
 * Returns:
 * {<OpenLayers.Geometry.GeoRoundedRect>} 返回的 GeoRoundedRect 对象。
 */
OpenLayers.Geometry.GeoRoundedRect.fromJSON = function(str, map) {
    var geometry = new OpenLayers.Geometry.GeoRoundedRect();
    //匹配控制点的数据
    //取第二个代表获取括号内匹配的
    var s = str.match(/"controlPoints":(\[.*?\])/)[1];
    var arr = OpenLayers.Geometry.GeoPlotting.getControlPointsFromJSON(s, map);
    geometry._controlPoints = arr;
    return geometry;
};
/**
 * @requires OpenLayers/Geometry/Collection.js
 * @requires OpenLayers/Geometry/LinearRing.js
 * @requires OpenLayers.Geometry.Point.js
 * @requires OpenLayers.Geometry.Polygon.js
 * @requires OpenLayers.Geometry.GeoSector
 */

/**
 *
 * Class: OpenLayers.Geometry.GeoSector
 * 扇形。
 * 使用圆心和圆上两点绘制出一个扇形
 *
 * Inherits from:
 *  - <OpenLayers.Geometry.GeoPlotting>
 */
OpenLayers.Geometry.GeoSector = OpenLayers.Class(
    OpenLayers.Geometry.GeoPlotting, {
        /**
         * APIProperty: direction
         * 扇形的绘制方向，顺时针绘制（值为1），或逆时针绘制（值为-1）。默认为-1，即逆时针绘制。
         */
        direction: -1,
        /**
         * Constructor: OpenLayers.Geometry.GeoSector
         * 构造函数
         *
         * Parameters:
         * points - {Array(<OpenLayers.Geometry.Point>)} 需要传入的控制点（理论上应该是两个），默认为null
         */
        initialize: function(points) {
            OpenLayers.Geometry.GeoPlotting.prototype.initialize.apply(this, arguments);
        },

        /**
         * APIMethod: toJSON
         * 将军标符号扇形对象转换为json数据（只解析控制点）
         *
         * Returns:
         * {String} 返回的字符串。
         */
        toJSON: function(map) {
            return OpenLayers.Geometry.GeoPlotting.prototype.toJSON.apply(this, arguments);
        },

        /**
         * APIMethod: clone
         * 重写clone方法，必须深赋值
         *
         * Returns:
         * {String} 返回几何对象。
         */
        clone: function() {
            var geoCircle = new OpenLayers.Geometry.GeoSector();
            var controlPoints = [];
            //这里只需要赋值控制点
            for (var i = 0, len = this._controlPoints.length; i < len; i++) {
                //这里必须深赋值，不然在编辑时由于引用的问题出现错误
                controlPoints.push(this._controlPoints[i].clone());
            }
            geoCircle._controlPoints = controlPoints;
            return geoCircle;
        },

        /**
         * Method: calculateParts
         * 重写了父类的方法
         * 绘制的第一个点为扇形的圆心，第二点与第三点为扇形圆弧上的点
         */
        calculateParts: function() {
            var controlPoints = this.cloneControlPoints(this._controlPoints);
            //清空原有的所有点
            this.components = [];

            //两个点时绘制直线
            if (controlPoints.length == 2) {
                var pointA = controlPoints[0];
                var pointB = controlPoints[1];
                this.components.push(new OpenLayers.Geometry.LinearRing([pointA, pointB]));
            }
            //至少需要三个控制点
            if (controlPoints.length > 2) {
                //取第一个点为圆心
                var centerPoint = controlPoints[0];
                //第二个点确定半径，为圆上一点
                var pointR = controlPoints[1];
                //最后一个点为圆上一点
                var pointC = controlPoints[controlPoints.length - 1];
                //计算圆弧的半径
                var radius = this.calculateDistance(centerPoint, pointR);
                //分别计算圆上的两点所在的直径线与X轴的夹角
                var angleR = this.calculateAngle(pointR, centerPoint);
                var angleC = this.calculateAngle(pointC, centerPoint);
                //逆时针绘制
                if (this.direction == 1 && angleC < angleR) angleC = 2 * Math.PI + angleC;
                //顺时针绘制
                if (this.direction == -1 && angleC > angleR) angleC = -(2 * Math.PI - angleC);
                var points = this.calculateArc(centerPoint, radius, angleR, angleC, this.direction);
                points.unshift(centerPoint);
                this.components.push(new OpenLayers.Geometry.LinearRing(points));
            }
        },
        /**
         * Method: calculateAngle
         * 计算圆上一点所在半径的直线与X轴的夹角，结果以弧度形式表示，范围是+π到 +2π。
         */
        calculateAngle: function(pointA, centerPoint) {
            var angle = Math.atan2((pointA.y - centerPoint.y), (pointA.x - centerPoint.x));
            if (angle < 0) {
                angle += 2 * Math.PI;
            }
            return angle;
        },

        CLASS_NAME: "OpenLayers.Geometry.GeoSector"
    }
);


/**
 * APIMethod: fromJSON
 * 根据json数据转换为 GeoSector 对象
 *
 * Parameters:
 * str - {String} json数据
 *
 * Returns:
 * {<OpenLayers.Geometry.GeoSector>} 返回的 GeoSector 对象。
 */
OpenLayers.Geometry.GeoSector.fromJSON = function(str, map) {
    var geoCircle = new OpenLayers.Geometry.GeoSector();
    //匹配控制点的数据
    //取第二个代表获取括号内匹配的
    var s = str.match(/"controlPoints":(\[.*?\])/)[1];
    var arr = OpenLayers.Geometry.GeoPlotting.getControlPointsFromJSON(s, map);
    geoCircle._controlPoints = arr;
    return geoCircle;
};
/**
 * @requires OpenLayers.Geometry.Point
 * @requires OpenLayers.Geometry.GeoMultiLinePlotting
 */

/**
 *
 * Class: OpenLayers.Geometry.GeoBezierCurveArrow
 * 贝塞尔曲线箭头。
 * 使用三个或三个以上控制点直接创建贝塞尔曲线箭头。
 *
 * Inherits from:
 *  - <OpenLayers.Geometry.GeoMultiLinePlotting>
 */
OpenLayers.Geometry.GeoBezierCurveArrow = OpenLayers.Class(
    OpenLayers.Geometry.GeoMultiLinePlotting, {

        /**
         * Constructor: OpenLayers.Geometry.GeoBezierCurveArrow
         * 构造函数
         *
         * Parameters:
         * points - {Array(<OpenLayers.Geometry.Point>)} 需要传入的控制点（三个或三个以上），默认为null
         */
        initialize: function(points) {
            OpenLayers.Geometry.GeoMultiLinePlotting.prototype.initialize.apply(this, arguments);
        },

        /**
         * APIMethod: toJSON
         * 将军标符号贝塞尔曲线箭头对象转换为json数据（只解析了控制点）
         *
         * Returns:
         * {String} 返回的字符串。
         */
        toJSON: function(map) {
            return OpenLayers.Geometry.GeoMultiLinePlotting.prototype.toJSON.apply(this, arguments);
        },

        /**
         * APIMethod: clone
         * 重写clone方法，必须深赋值
         *
         * Returns:
         * {String} 返回几何对象。
         */
        clone: function() {
            var geometry = new OpenLayers.Geometry.GeoBezierCurveArrow();
            var controlPoints = [];
            //这里只需要赋值控制点
            for (var i = 0, len = this._controlPoints.length; i < len; i++) {
                //这里必须深赋值，不然在编辑时由于引用的问题出现错误
                controlPoints.push(this._controlPoints[i].clone());
            }
            geometry._controlPoints = controlPoints;
            return geometry;
        },
        /**
         * Method: calculateParts
         * 重写了父类的方法
         * 用于通过控制点计算贝塞尔曲线箭头的所有点
         */
        calculateParts: function() {
            var controlPoints = this.cloneControlPoints(this._controlPoints);

            //清空原有的所有线
            //            this.components = [];
            //两个控制点时，绘制直线
            var multiLines = [];
            if (controlPoints.length == 2) {

                var startP = controlPoints[0];
                var endP = controlPoints[1];
                //直线
                var straightLine = new OpenLayers.Geometry.LineString([startP, endP]);
                //箭头
                var arrowLines = this.calculateArrowLines(startP, endP, 10);
                multiLines.push(straightLine, arrowLines[0], arrowLines[1]);
            }
            //三个控制点时，绘制二次贝塞尔曲线
            else if (controlPoints.length == 3) {
                var startP = controlPoints[1];
                var endP = controlPoints[2];
                //曲线
                var bezierCurve2 = OpenLayers.Geometry.LineString.createBezier2(controlPoints);
                //箭头
                var arrowLines = this.calculateArrowLines(startP, endP, 10);
                multiLines.push(bezierCurve2, arrowLines[0], arrowLines[1]);
            }
            //四个控制点时，绘制三次贝塞尔曲线
            else if (controlPoints.length == 4) {
                var startP = controlPoints[2];
                var endP = controlPoints[3];
                //曲线
                var bezierCurve3 = OpenLayers.Geometry.LineString.createBezier3(controlPoints);
                //箭头
                var arrowLines = this.calculateArrowLines(startP, endP, 10);
                multiLines.push(bezierCurve3, arrowLines[0], arrowLines[1]);
            } else if (controlPoints.length > 4) {
                var startP = controlPoints[controlPoints.length - 2];
                var endP = controlPoints[controlPoints.length - 1];
                //曲线
                var bezierCurveN = OpenLayers.Geometry.LineString.createBezierN(controlPoints);
                //箭头
                var arrowLines = this.calculateArrowLines(startP, endP, 10);
                multiLines.push(bezierCurveN, arrowLines[0], arrowLines[1]);
            }
            this.components = multiLines;
        },


        CLASS_NAME: "OpenLayers.Geometry.GeoBezierCurveArrow"
    }
);

/**
 * APIMethod: fromJSON
 * 根据json数据转换为 GeoBezierCurveArrow 对象
 *
 * Parameters:
 * str - {String} json数据
 *
 * Returns:
 * {<OpenLayers.Geometry.GeoBezierCurveArrow>} 返回的 GeoBezierCurveArrow 对象。
 */
OpenLayers.Geometry.GeoBezierCurveArrow.fromJSON = function(str, map) {
    var geoPolyline = new OpenLayers.Geometry.GeoBezierCurveArrow();
    //匹配控制点的数据
    //取第二个代表获取括号内匹配的
    var s = str.match(/"controlPoints":(\[.*?\])/)[1];
    var arr = OpenLayers.Geometry.GeoLinePlotting.getControlPointsFromJSON(s, map);
    geoPolyline._controlPoints = arr;
    return geoPolyline;
};
/**
 * @requires OpenLayers.Geometry.Point
 * @requires OpenLayers.Geometry.GeoMultiLinePlotting
 */

/**
 *
 * Class: OpenLayers.Geometry.GeoCardinalCurveArrow
 * Cardinal曲线箭头。
 * 使用三个或三个以上控制点直接创建Cardinal曲线箭头。
 *
 * Inherits from:
 *  - <OpenLayers.Geometry.GeoMultiLinePlotting>
 */
OpenLayers.Geometry.GeoCardinalCurveArrow = OpenLayers.Class(
    OpenLayers.Geometry.GeoMultiLinePlotting, {

        /**
         * Constructor: OpenLayers.Geometry.GeoCardinalCurveArrow
         * 构造函数
         *
         * Parameters:
         * points - {Array(<OpenLayers.Geometry.Point>)} 需要传入的控制点（三个或三个以上），默认为null
         */
        initialize: function(points) {
            OpenLayers.Geometry.GeoMultiLinePlotting.prototype.initialize.apply(this, arguments);
        },

        /**
         * APIMethod: toJSON
         * 将军标符号Cardinal曲线箭头对象转换为json数据（只解析了控制点）
         *
         * Returns:
         * {String} 返回的字符串。
         */
        toJSON: function(map) {
            return OpenLayers.Geometry.GeoMultiLinePlotting.prototype.toJSON.apply(this, arguments);
        },

        /**
         * APIMethod: clone
         * 重写clone方法，必须深赋值
         *
         * Returns:
         * {String} 返回几何对象。
         */
        clone: function() {
            var geometry = new OpenLayers.Geometry.GeoCardinalCurveArrow();
            var controlPoints = [];
            //这里只需要赋值控制点
            for (var i = 0, len = this._controlPoints.length; i < len; i++) {
                //这里必须深赋值，不然在编辑时由于引用的问题出现错误
                controlPoints.push(this._controlPoints[i].clone());
            }
            geometry._controlPoints = controlPoints;
            return geometry;
        },
        /**
         * Method: calculateParts
         * 重写了父类的方法
         * 用于通过控制点计算Cardinal曲线箭头的所有点
         */
        calculateParts: function() {
            var controlPoints = this.cloneControlPoints(this._controlPoints);
            //清空原有的所有线
            this.components = [];
            var multiLines = [];
            //两个控制点时，绘制直线
            if (controlPoints.length == 2) {
                var startP = controlPoints[0];
                var endP = controlPoints[1];
                //直线
                var curveLine = new OpenLayers.Geometry.LineString([startP, endP]);
                //箭头
                var arrowLines = this.calculateArrowLines(startP, endP, 10);
                multiLines.push(curveLine, arrowLines[0], arrowLines[1]);
                this.components = multiLines;
            } else if (controlPoints.length > 2) {
                //曲线
                var cardinalPoints = OpenLayers.Geometry.LineString.calculateCardinalPoints(controlPoints);
                var cardinalCurveN = OpenLayers.Geometry.LineString.createBezierN(cardinalPoints);

                var startP = cardinalPoints[cardinalPoints.length - 2];
                var endP = cardinalPoints[cardinalPoints.length - 1];
                //箭头
                var arrowLines = this.calculateArrowLines(startP, endP, 2);
                multiLines.push(cardinalCurveN, arrowLines[0], arrowLines[1]);
                this.components = multiLines;
            }

        },


        CLASS_NAME: "OpenLayers.Geometry.GeoCardinalCurveArrow"
    }
);

/**
 * APIMethod: fromJSON
 * 根据json数据转换为 GeoCardinalCurveArrow 对象
 *
 * Parameters:
 * str - {String} json数据
 *
 * Returns:
 * {<OpenLayers.Geometry.GeoCardinalCurveArrow>} 返回的 GeoCardinalCurveArrow 对象。
 */
OpenLayers.Geometry.GeoCardinalCurveArrow.fromJSON = function(str, map) {
    var geoPolyline = new OpenLayers.Geometry.GeoCardinalCurveArrow();
    //匹配控制点的数据
    //取第二个代表获取括号内匹配的
    var s = str.match(/"controlPoints":(\[.*?\])/)[1];
    var arr = OpenLayers.Geometry.GeoLinePlotting.getControlPointsFromJSON(s, map);
    geoPolyline._controlPoints = arr;
    return geoPolyline;
};
/**
 * @requires OpenLayers/Geometry/Collection.js
 * @requires OpenLayers/Geometry/LinearRing.js
 * @requires OpenLayers.Geometry.Point.js
 * @requires OpenLayers.Geometry.Polygon.js
 * @requires OpenLayers.Geometry.GeoPlotting
 */

/**
 *
 * Class: OpenLayers.Geometry.GeoCurveFlag
 * 曲线旗标。
 * 使用两个控制点直接创建曲线旗标
 *
 * Inherits from:
 *  - <OpenLayers.Geometry.GeoPlotting>
 */
OpenLayers.Geometry.GeoCurveFlag = OpenLayers.Class(
    OpenLayers.Geometry.GeoPlotting, {
        /**
         * Constructor: OpenLayers.Geometry.GeoCurveFlag
         * 构造函数
         *
         * Parameters:
         * points - {Array(<OpenLayers.Geometry.Point>)} 需要传入的控制点（理论上应该是两个），默认为null
         */
        initialize: function(points) {
            OpenLayers.Geometry.GeoPlotting.prototype.initialize.apply(this, arguments);
        },

        /**
         * APIMethod: toJSON
         * 将军标符号曲线旗标对象转换为json数据（只解析了控制点）
         *
         * Returns:
         * {String} 返回的字符串。
         */
        toJSON: function(map) {
            return OpenLayers.Geometry.GeoPlotting.prototype.toJSON.apply(this, arguments);
        },

        /**
         * APIMethod: clone
         * 重写clone方法，必须深赋值
         *
         * Returns:
         * {String} 返回几何对象。
         */
        clone: function() {
            var geoCurveFlag = new OpenLayers.Geometry.GeoCurveFlag();
            var controlPoints = [];
            //这里只需要赋值控制点
            for (var i = 0, len = this._controlPoints.length; i < len; i++) {
                //这里必须深赋值，不然在编辑时由于引用的问题出现错误
                controlPoints.push(this._controlPoints[i].clone());
            }
            geoCurveFlag._controlPoints = controlPoints;
            return geoCurveFlag;
        },
        /**
         * Method: calculateParts
         * 重写了父类的方法
         * 用于通过两个控制点计算曲线旗标的所有点
         */
        calculateParts: function() {
            var controlPois = this.cloneControlPoints(this._controlPoints);

            //清空原有的所有点
            this.components = [];
            //至少需要两个控制点
            if (controlPois.length > 1) {
                //取第一个
                var startPoint = controlPois[0];
                //取最后一个
                var endPoint = controlPois[controlPois.length - 1];
                //上曲线起始点
                var point1 = startPoint;
                //上曲线第一控制点
                var point2 = new OpenLayers.Geometry.Point((endPoint.x - startPoint.x) / 4 + startPoint.x, (endPoint.y - startPoint.y) / 8 + startPoint.y);
                //上曲线第二个点
                var point3 = new OpenLayers.Geometry.Point((startPoint.x + endPoint.x) / 2, startPoint.y);
                //上曲线第二控制点
                var point4 = new OpenLayers.Geometry.Point((endPoint.x - startPoint.x) * 3 / 4 + startPoint.x, -(endPoint.y - startPoint.y) / 8 + startPoint.y);
                //上曲线结束点
                var point5 = new OpenLayers.Geometry.Point(endPoint.x, startPoint.y);

                //下曲线结束点
                var point6 = new OpenLayers.Geometry.Point(endPoint.x, (startPoint.y + endPoint.y) / 2);
                //下曲线第二控制点
                var point7 = new OpenLayers.Geometry.Point((endPoint.x - startPoint.x) * 3 / 4 + startPoint.x, (endPoint.y - startPoint.y) * 3 / 8 + startPoint.y);
                //下曲线第二个点
                var point8 = new OpenLayers.Geometry.Point((startPoint.x + endPoint.x) / 2, (startPoint.y + endPoint.y) / 2);
                //下曲线第一控制点
                var point9 = new OpenLayers.Geometry.Point((endPoint.x - startPoint.x) / 4 + startPoint.x, (endPoint.y - startPoint.y) * 5 / 8 + startPoint.y);
                //下曲线起始点
                var point10 = new OpenLayers.Geometry.Point(startPoint.x, (startPoint.y + endPoint.y) / 2);
                //旗杆底部点
                var point11 = new OpenLayers.Geometry.Point(startPoint.x, endPoint.y);
                //计算上曲线
                var curve1 = OpenLayers.Geometry.LineString.createBezier2([point1, point2, point3, point4, point5]).components;
                //计算下曲线
                var curve2 = OpenLayers.Geometry.LineString.createBezier2([point6, point7, point8, point9, point10]).components;

                //合并
                var points = curve1.concat(curve2);
                points.push(point11);

                this.components.push(new OpenLayers.Geometry.LinearRing(points));
            }
        },

        CLASS_NAME: "OpenLayers.Geometry.GeoCurveFlag"
    }
);

/**
 * APIMethod: fromJSON
 * 根据json数据转换为 GeoCurveFlag 对象
 *
 * Parameters:
 * str - {String} json数据
 *
 * Returns:
 * {<OpenLayers.Geometry.GeoCurveFlag>} 返回的 GeoCurveFlag 对象。
 */
OpenLayers.Geometry.GeoCurveFlag.fromJSON = function(str, map) {
    var geoCurveFlag = new OpenLayers.Geometry.GeoCurveFlag();
    //匹配控制点的数据
    //取第二个代表获取括号内匹配的
    var s = str.match(/"controlPoints":(\[.*?\])/)[1];
    var arr = OpenLayers.Geometry.GeoPlotting.getControlPointsFromJSON(s, map);
    geoCurveFlag._controlPoints = arr;
    return geoCurveFlag;
};
/**
 * @requires OpenLayers/Geometry/Collection.js
 * @requires OpenLayers/Geometry/LinearRing.js
 * @requires OpenLayers.Geometry.Point.js
 * @requires OpenLayers.Geometry.Polygon.js
 * @requires OpenLayers.Geometry.GeoPlotting
 */

/**
 *
 * Class: OpenLayers.Geometry.GeoDiagonalArrow
 * 斜箭头
 *
 * Inherits from:
 *  - <OpenLayers.Geometry.GeoPlotting>
 */
OpenLayers.Geometry.GeoDiagonalArrow = OpenLayers.Class(
    OpenLayers.Geometry.GeoPlotting, {
        /**
         * Property: _ratio
         * 箭头长度与宽度的比值，箭头三角形需要占用总长度的1/_ratio
         */
        _ratio: 6,

        /**
         * Constructor: OpenLayers.Geometry.GeoDiagonalArrow
         * 构造函数
         *
         * Parameters:
         * points - {Array(<OpenLayers.Geometry.Point>)} 初始化时传入的控制点（理论上至少两个，默认为null）
         */
        initialize: function(points) {
            OpenLayers.Geometry.GeoPlotting.prototype.initialize.apply(this, arguments);
        },

        /**
         * APIMethod: getRatio
         * 获取箭头长宽比值，默认为6倍
         */
        getRatio: function() {
            return this._ratio;
        },

        /**
         * APIMethod: setRatio
         * 设置箭头长宽比值，默认为6倍
         *
         * Parameters:
         * value - {Number} 箭头长宽比值
         */
        setRatio: function(value) {
            if (value) {
                this._ratio = value;
                this.calculateParts();
            }
        },

        /**
         * APIMethod: toJSON
         * 将军标符号斜箭头对象转换为json数据（解析了控制点和长宽比值）
         *
         * Returns:
         * {String} 返回的字符串。
         */
        toJSON: function(map) {
            if (!this._controlPoints) {
                return null;
            }
            var result;
            var len = this._controlPoints.length;
            var arr = [];
            for (var i = 0; i < len; i++) {
                arr.push(this.controlPointToJSON(this._controlPoints[i], map));
            }
            result = "{\"controlPoints\":[" + arr.join(",") + "],\"ratio\":" + this._ratio + ",\"CLASS_NAME\":\"" + this.CLASS_NAME + "\"}";
            return result;
        },

        /**
         * APIMethod: clone
         * 重写clone方法，必须深赋值
         *
         * Returns:
         * {String} 返回几何对象。
         */
        clone: function() {
            var geoDiagonalArrow = new OpenLayers.Geometry.GeoDiagonalArrow();
            var controlPoints = [];
            //这里只需要赋值控制点
            for (var i = 0, len = this._controlPoints.length; i < len; i++) {
                //这里必须深赋值，不然在编辑时由于引用的问题出现错误
                controlPoints.push(this._controlPoints[i].clone());
            }
            geoDiagonalArrow._ratio = this._ratio;
            geoDiagonalArrow._controlPoints = controlPoints;
            return geoDiagonalArrow;
        },

        /**
         * Method: calculateParts
         * 重写了父类的方法
         * 用于通过控制点计算箭头的所有绘制点
         */
        calculateParts: function() {
            //判定少于两个点或者为空，则直接返回
            if (this._controlPoints == null || this._controlPoints.length < 2) {
                return;
            }
            //判断如果为两个点，且两个点重合时也直接返回
            if (this._controlPoints.length == 2 && (this._controlPoints[0]).equals(this._controlPoints[1])) {
                return;
            }
            //清空原有的所有点
            this.components = [];
            //计算只有两个点时，即直的斜箭头
            if (this._controlPoints.length == 2) {
                this.calculateTwoPoints();
            }
            //计算有三个或三个以上的点时，即弯曲的斜箭头
            else {
                this.calculateMorePoints();
            }
        },

        /**
         * Method: calculateTwoPoints
         * 只有两个控制点时
         *
         */
        calculateTwoPoints: function() {
            var controlPois = this.cloneControlPoints(this._controlPoints);

            //取出首尾两个点
            var pointS = controlPois[0];
            var pointE = controlPois[1];
            //计算箭头总长度
            var l = Math.sqrt((pointE.y - pointS.y) * (pointE.y - pointS.y) + (pointE.x - pointS.x) * (pointE.x - pointS.x));
            //计算直箭头的宽
            var w = l / this._ratio;

            //计算三角形的底边中心点坐标
            var x_ = pointS.x + (pointE.x - pointS.x) * (this._ratio - 1) / this._ratio;
            var y_ = pointS.y + (pointE.y - pointS.y) * (this._ratio - 1) / this._ratio;
            var point_o = new OpenLayers.Geometry.Point(x_, y_);

            //计算
            var v_lr_ = this.calculateVector(new OpenLayers.Geometry.Point(pointE.x - pointS.x, pointE.y - pointS.y), Math.PI / 2, w / 2);
            //获取左边尾部向量
            var v_l_ = v_lr_[0];
            //获取右边尾部向量
            var v_r_ = v_lr_[1];
            //获取左边尾部点
            var point_l = new OpenLayers.Geometry.Point(v_l_.x + pointS.x, v_l_.y + pointS.y);
            //获取右边尾部点
            var point_r = new OpenLayers.Geometry.Point(v_r_.x + pointS.x, v_r_.y + pointS.y);

            var point_h_l = new OpenLayers.Geometry.Point(v_l_.x / this._ratio + x_, v_l_.y / this._ratio + y_);
            var point_h_r = new OpenLayers.Geometry.Point(v_r_.x / this._ratio + x_, v_r_.y / this._ratio + y_);

            //计算三角形左边点
            var point_a_l = new OpenLayers.Geometry.Point(point_h_l.x * 2 - point_h_r.x, point_h_l.y * 2 - point_h_r.y);
            //计算三角形右边点
            var point_a_r = new OpenLayers.Geometry.Point(point_h_r.x * 2 - point_h_l.x, point_h_r.y * 2 - point_h_l.y);

            this.components.push(new OpenLayers.Geometry.LinearRing([point_l, point_h_l, point_a_l, pointE, point_a_r, point_h_r, point_r]));
        },

        /**
         * Method: calculateMorePoints
         * 重写了父类的方法
         * 用于通过控制点计算箭头的所有绘制点
         */
        calculateMorePoints: function() {
            var controlPois = this.cloneControlPoints(this._controlPoints);

            //计算箭头总长度
            var l = 0;
            //计算直箭头的宽
            var w = 0;
            for (var i = 0; i < controlPois.length - 1; i++) {
                //取出首尾两个点
                var pointS = controlPois[i];
                var pointE = controlPois[i + 1];
                l += Math.sqrt((pointE.y - pointS.y) * (pointE.y - pointS.y) + (pointE.x - pointS.x) * (pointE.x - pointS.x));
            }
            w = l / this._ratio;

            var a = Math.atan(w / (2 * l));

            //定义左右控制点集合
            var points_C_l = [];
            var points_C_r = [];
            //定义尾部左右的起始点
            var point_t_l = new OpenLayers.Geometry.Point();
            var point_t_r = new OpenLayers.Geometry.Point();


            //计算中间的所有交点
            for (var j = 0; j < controlPois.length - 2; j++) {
                var pointU_1 = controlPois[j]; //第一个用户传入的点
                var pointU_2 = controlPois[j + 1]; //第二个用户传入的点
                var pointU_3 = controlPois[j + 2]; //第三个用户传入的点

                //计算向量
                var v_U_1_2 = new OpenLayers.Geometry.Point(pointU_2.x - pointU_1.x, pointU_2.y - pointU_1.y);
                var v_U_2_3 = new OpenLayers.Geometry.Point(pointU_3.x - pointU_2.x, pointU_3.y - pointU_2.y);


                //定义左边第一个控制点
                var point_l_1 = new OpenLayers.Geometry.Point();
                //定义右边第一个控制点
                var point_r_1 = new OpenLayers.Geometry.Point();
                //如果j=0时，左右第一个控制点需要计算
                if (j == 0) {
                    var v_lr_ = this.calculateVector(v_U_1_2, Math.PI / 2, w / 2);
                    //获取左边尾部点
                    var v_l_ = v_lr_[0];
                    //获取右边尾部点
                    var v_r_ = v_lr_[1];
                    //获取左边尾部点
                    point_t_l = point_l_1 = new OpenLayers.Geometry.Point(v_l_.x + pointU_1.x, v_l_.y + pointU_1.y);
                    //获取右边尾部点
                    point_t_r = point_r_1 = new OpenLayers.Geometry.Point(v_r_.x + pointU_1.x, v_r_.y + pointU_1.y);
                }
                //否则获取上一次的记录
                else {
                    point_l_1 = points_C_l[points_C_l.length - 1];
                    point_r_1 = points_C_r[points_C_r.length - 1];
                }
                var v_lr = this.calculateVector(v_U_1_2, a, 1);
                //这里的向量需要反过来
                //获取左边向量
                var v_l = v_lr[1];
                //获取右边向量
                var v_r = v_lr[0];
                //定义角平分线向量
                var v_angularBisector = this.calculateAngularBisector(new OpenLayers.Geometry.Point(-v_U_1_2.x, -v_U_1_2.y), v_U_2_3);
                //求交点
                //计算左边第二个控制点
                var point_l_2 = this.calculateIntersection(v_l, v_angularBisector, point_l_1, pointU_2);
                var point_r_2 = this.calculateIntersection(v_r, v_angularBisector, point_r_1, pointU_2);


                //添加后面的拐角控制点
                points_C_l.push(new OpenLayers.Geometry.Point((point_l_1.x + point_l_2.x) / 2, (point_l_1.y + point_l_2.y) / 2));
                points_C_l.push(point_l_2);
                points_C_r.push(new OpenLayers.Geometry.Point((point_r_1.x + point_r_2.x) / 2, (point_r_1.y + point_r_2.y) / 2));
                points_C_r.push(point_r_2);
            }

            //进入计算头部
            //计算一下头部的长度
            var pointU_E2 = controlPois[controlPois.length - 2]; //倒数第二个用户点
            var pointU_E1 = controlPois[controlPois.length - 1]; //最后一个用户点
            var head_d = Math.sqrt((pointU_E2.x - pointU_E1.x) * (pointU_E2.x - pointU_E1.x) + (pointU_E2.y - pointU_E1.y) * (pointU_E2.y - pointU_E1.y));
            //定义头部的左右两结束点
            var point_h_l = new OpenLayers.Geometry.Point();
            var point_h_r = new OpenLayers.Geometry.Point();
            //三角形左右两点数组
            var point_lr_t = [];
            //定义曲线最后一个控制点，也就是头部结束点和最后一个拐角点的中点
            var point_C_l_e = new OpenLayers.Geometry.Point();
            var point_C_r_e = new OpenLayers.Geometry.Point();
            //定义三角形的左右两个点
            var point_triangle_l = new OpenLayers.Geometry.Point();
            var point_triangle_r = new OpenLayers.Geometry.Point();

            //获取当前的最后的控制点，也就是之前计算的拐角点
            var point_C_l_eq = points_C_l[points_C_l.length - 1];
            var point_C_r_eq = points_C_r[points_C_r.length - 1];
            //申明三角形的两边向量
            var v_l_t = new OpenLayers.Geometry.Point();
            var v_r_t = new OpenLayers.Geometry.Point();
            //三角的高度都不够
            if (head_d <= w) {
                point_lr_t = this.calculateVector(new OpenLayers.Geometry.Point(pointU_E1.x - pointU_E2.x, pointU_E1.y - pointU_E2.y), Math.PI / 2, w / 2);
                //获取三角形左右两个向量
                v_l_t = point_lr_t[0];
                v_r_t = point_lr_t[1];

                point_h_l = new OpenLayers.Geometry.Point(v_l_t.x / this._ratio + pointU_E2.x, v_l_t.y / this._ratio + pointU_E2.y);
                point_h_r = new OpenLayers.Geometry.Point(v_r_t.x / this._ratio + pointU_E2.x, v_r_t.y / this._ratio + pointU_E2.y);
                //计算三角形的左右两点
                point_triangle_l = new OpenLayers.Geometry.Point(point_h_l.x * 2 - point_h_r.x, point_h_l.y * 2 - point_h_r.y);
                point_triangle_r = new OpenLayers.Geometry.Point(point_h_r.x * 2 - point_h_l.x, point_h_r.y * 2 - point_h_l.y);


                //计算最后的控制点
                point_C_l_e = new OpenLayers.Geometry.Point((point_C_l_eq.x + point_h_l.x) / 2, (point_C_l_eq.y + point_h_l.y) / 2);
                point_C_r_e = new OpenLayers.Geometry.Point((point_C_r_eq.x + point_h_r.x) / 2, (point_C_r_eq.y + point_h_r.y) / 2);

                //添加最后的控制点（中心点）
                points_C_l.push(point_C_l_e);
                points_C_r.push(point_C_r_e);



            }
            //足够三角的高度
            else {
                //由于够了三角的高度，所以首先去掉三角的高度

                //计算向量
                var v_E2_E1 = new OpenLayers.Geometry.Point(pointU_E1.x - pointU_E2.x, pointU_E1.y - pointU_E2.y);
                //取模
                var v_E2_E1_d = Math.sqrt(v_E2_E1.x * v_E2_E1.x + v_E2_E1.y * v_E2_E1.y);
                //首先需要计算三角形的底部中心点
                var point_c = new OpenLayers.Geometry.Point(pointU_E1.x - v_E2_E1.x * w / v_E2_E1_d, pointU_E1.y - v_E2_E1.y * w / v_E2_E1_d);

                //计算出在三角形上底边上头部结束点
                point_lr_t = this.calculateVector(new OpenLayers.Geometry.Point(pointU_E1.x - point_c.x, pointU_E1.y - point_c.y), Math.PI / 2, w / 2);
                //获取三角形左右两个向量
                v_l_t = point_lr_t[0];
                v_r_t = point_lr_t[1];

                point_h_l = new OpenLayers.Geometry.Point(v_l_t.x / this._ratio + point_c.x, v_l_t.y / this._ratio + point_c.y);
                point_h_r = new OpenLayers.Geometry.Point(v_r_t.x / this._ratio + point_c.x, v_r_t.y / this._ratio + point_c.y);
                //计算三角形的左右两点
                point_triangle_l = new OpenLayers.Geometry.Point(point_h_l.x * 2 - point_h_r.x, point_h_l.y * 2 - point_h_r.y);
                point_triangle_r = new OpenLayers.Geometry.Point(point_h_r.x * 2 - point_h_l.x, point_h_r.y * 2 - point_h_l.y);

                //计算最后的控制点
                point_C_l_e = new OpenLayers.Geometry.Point((point_C_l_eq.x + point_h_l.x) / 2, (point_C_l_eq.y + point_h_l.y) / 2);
                point_C_r_e = new OpenLayers.Geometry.Point((point_C_r_eq.x + point_h_r.x) / 2, (point_C_r_eq.y + point_h_r.y) / 2);

                //添加最后的控制点（中心点）
                points_C_l.push(point_C_l_e);
                points_C_r.push(point_C_r_e);
            }
            //使用控制点计算差值
            //计算贝塞尔的控制点
            var points_BC_l = OpenLayers.Geometry.LineString.createBezier2(points_C_l).components;
            var points_BC_r = OpenLayers.Geometry.LineString.createBezier2(points_C_r).components;
            //组合左右点集和三角形三个点
            var pointsR = [point_t_l];
            //首先连接左边的差值曲线
            pointsR = pointsR.concat(points_BC_l);
            //添加左边头部结束点
            pointsR.push(point_h_l);
            //添加三角形左边点
            pointsR.push(point_triangle_l);
            //添加三角形顶点
            pointsR.push(pointU_E1);
            //添加三角形右边点
            pointsR.push(point_triangle_r);
            //添加右边头部结束点
            pointsR.push(point_h_r);
            //合并右边的所有点
            for (var k = points_BC_r.length - 1; k >= 0; k--) {
                pointsR.push(points_BC_r[k]);
            }
            //添加右边尾部起始点
            pointsR.push(point_t_r);

            this.components.push(new OpenLayers.Geometry.LinearRing(pointsR));
        },

        CLASS_NAME: "OpenLayers.Geometry.GeoDiagonalArrow"
    }
);

/**
 * APIMethod: fromJSON
 * 根据json数据转换为 GeoDiagonalArrow 对象
 *
 * Parameters:
 * str - {String} json数据
 *
 * Returns:
 * {<OpenLayers.Geometry.GeoDiagonalArrow>} 返回的 GeoDiagonalArrow 对象。
 */
OpenLayers.Geometry.GeoDiagonalArrow.fromJSON = function(str, map) {
    var geoDiagonalArrow = new OpenLayers.Geometry.GeoDiagonalArrow();
    //匹配控制点的数据
    //取第二个代表获取括号内匹配的
    //匹配长宽比例
    var r = str.match(/"ratio":([0-9]+)/)[1];
    geoDiagonalArrow._ratio = parseInt(r);

    var s = str.match(/"controlPoints":(\[.*?\])/)[1];
    var arr = OpenLayers.Geometry.GeoPlotting.getControlPointsFromJSON(s, map);
    geoDiagonalArrow._controlPoints = arr;
    return geoDiagonalArrow;
};

/**
 * @requires OpenLayers/Geometry/Collection.js
 * @requires OpenLayers/Geometry/LinearRing.js
 * @requires OpenLayers.Geometry.Point.js
 * @requires OpenLayers.Geometry.Polygon.js
 * @requires OpenLayers.Geometry.GeoPlotting
 */

/**
 *
 * Class: OpenLayers.Geometry.GeoDoubleArrow
 * 双箭头
 *
 * Inherits from:
 *  - <OpenLayers.Geometry.GeoPlotting>
 */
OpenLayers.Geometry.GeoDoubleArrow = OpenLayers.Class(
    OpenLayers.Geometry.GeoPlotting, {
        /**
         * Constructor: OpenLayers.Geometry.GeoDoubleArrow
         * 构造函数
         *
         * Parameters:
         * points - {Array(<OpenLayers.Geometry.Point>)} 初始化时传入的控制点（理论上为四个，默认为null）
         */
        initialize: function(points) {
            OpenLayers.Geometry.GeoPlotting.prototype.initialize.apply(this, arguments);
        },

        /**
         * APIMethod: toJSON
         * 将军标符号双箭头对象转换为json数据（只解析了控制点）
         *
         * Returns:
         * {String} 返回的字符串。
         */
        toJSON: function(map) {
            return OpenLayers.Geometry.GeoPlotting.prototype.toJSON.apply(this, arguments);
        },

        /**
         * APIMethod: clone
         * 重写clone方法，必须深赋值
         *
         * Returns:
         * {String} 返回几何对象。
         */
        clone: function() {
            var geoDoubleArrow = new OpenLayers.Geometry.GeoDoubleArrow();
            var controlPoints = [];
            //这里只需要赋值控制点
            for (var i = 0, len = this._controlPoints.length; i < len; i++) {
                //这里必须深赋值，不然在编辑时由于引用的问题出现错误
                controlPoints.push(this._controlPoints[i].clone());
            }
            geoDoubleArrow._controlPoints = controlPoints;
            return geoDoubleArrow;
        },

        /**
         * Method: calculateParts
         * 重写了父类的方法
         * 用于通过控制点计算箭头的所有绘制点
         */
        calculateParts: function() {
            //判定少于四个点或者为空，则直接返回
            if (this._controlPoints == null || this._controlPoints.length < 4) {
                return;
            }

            var controlPois = this.cloneControlPoints(this._controlPoints);

            //定义四个用户输入点
            var pointU_1 = controlPois[0];
            var pointU_2 = controlPois[1];
            var pointU_3 = controlPois[2];
            var pointU_4 = controlPois[3];

            //计算控制点
            //计算中间用户点
            var pointU_C = new OpenLayers.Geometry.Point(((pointU_1.x + pointU_2.x) * 5 + (pointU_3.x + pointU_4.x)) / 12, ((pointU_1.y + pointU_2.y) * 5 + (pointU_3.y + pointU_4.y)) / 12);
            //计算左边外弧的控制点
            var pointC_l_out = this.calculateIntersectionFromTwoCorner(pointU_1, pointU_4, Math.PI / 8, Math.PI / 6)[0];
            //计算左边内弧的控制点
            var pointC_l_inner = this.calculateIntersectionFromTwoCorner(pointU_C, pointU_4, Math.PI / 8, Math.PI / 16)[0];
            //计算右边外弧的控制点
            var pointC_r_out = this.calculateIntersectionFromTwoCorner(pointU_2, pointU_3, Math.PI / 8, Math.PI / 6)[1];
            //计算右边内弧的控制点
            var pointC_r_inner = this.calculateIntersectionFromTwoCorner(pointU_C, pointU_3, Math.PI / 8, Math.PI / 16)[1];

            //

            var v_l_out = new OpenLayers.Geometry.Point(pointC_l_out.x - pointU_4.x, pointC_l_out.y - pointU_4.y);
            var d_l_out = Math.sqrt(v_l_out.x * v_l_out.x + v_l_out.y * v_l_out.y);
            //单位向量
            var v_l_out_1 = new OpenLayers.Geometry.Point(v_l_out.x / d_l_out, v_l_out.y / d_l_out);

            var v_l_inner = new OpenLayers.Geometry.Point(pointC_l_inner.x - pointU_4.x, pointC_l_inner.y - pointU_4.y);
            var d_l_inner = Math.sqrt(v_l_inner.x * v_l_inner.x + v_l_inner.y * v_l_inner.y);
            //单位向量
            var v_l_inner_1 = new OpenLayers.Geometry.Point(v_l_inner.x / d_l_inner, v_l_inner.y / d_l_inner);

            //定义箭头头部的大小比例
            var ab = 0.25;

            //取最短的，除以5是一个经验值，这样效果比较好
            var d_l_a = d_l_out < d_l_inner ? d_l_out * ab : d_l_inner * ab;
            //
            var pointC_l_out_2 = new OpenLayers.Geometry.Point(v_l_out_1.x * d_l_a + pointU_4.x, v_l_out_1.y * d_l_a + pointU_4.y);
            var pointC_l_inner_2 = new OpenLayers.Geometry.Point(v_l_inner_1.x * d_l_a + pointU_4.x, v_l_inner_1.y * d_l_a + pointU_4.y);

            //左箭头左边点
            var pointC_l_a_l = new OpenLayers.Geometry.Point(pointC_l_out_2.x * 1.5 - pointC_l_inner_2.x * 0.5, pointC_l_out_2.y * 1.5 - pointC_l_inner_2.y * 0.5);
            //左箭头右边点
            var pointC_l_a_r = new OpenLayers.Geometry.Point(pointC_l_inner_2.x * 1.5 - pointC_l_out_2.x * 0.5, pointC_l_inner_2.y * 1.5 - pointC_l_out_2.y * 0.5);

            var v_r_out = new OpenLayers.Geometry.Point(pointC_r_out.x - pointU_3.x, pointC_r_out.y - pointU_3.y);
            var d_r_out = Math.sqrt(v_r_out.x * v_r_out.x + v_r_out.y * v_r_out.y);
            var v_r_out_1 = new OpenLayers.Geometry.Point(v_r_out.x / d_r_out, v_r_out.y / d_r_out);

            var v_r_inner = new OpenLayers.Geometry.Point(pointC_r_inner.x - pointU_3.x, pointC_r_inner.y - pointU_3.y);
            var d_r_inner = Math.sqrt(v_r_inner.x * v_r_inner.x + v_r_inner.y * v_r_inner.y);
            var v_r_inner_1 = new OpenLayers.Geometry.Point(v_r_inner.x / d_r_inner, v_r_inner.y / d_r_inner);

            //取最短的，除以5是一个经验值，这样效果比较好
            var d_r_a = d_r_out < d_r_inner ? d_r_out * ab : d_r_inner * ab;
            var pointC_r_out_2 = new OpenLayers.Geometry.Point(v_r_out_1.x * d_r_a + pointU_3.x, v_r_out_1.y * d_r_a + pointU_3.y);
            var pointC_r_inner_2 = new OpenLayers.Geometry.Point(v_r_inner_1.x * d_r_a + pointU_3.x, v_r_inner_1.y * d_r_a + pointU_3.y);

            //右箭头箭头右边点
            var pointC_r_a_r = new OpenLayers.Geometry.Point(pointC_r_out_2.x * 1.5 - pointC_r_inner_2.x * 0.5, pointC_r_out_2.y * 1.5 - pointC_r_inner_2.y * 0.5);
            //左箭头左边点
            var pointC_r_a_l = new OpenLayers.Geometry.Point(pointC_r_inner_2.x * 1.5 - pointC_r_out_2.x * 0.5, pointC_r_inner_2.y * 1.5 - pointC_r_out_2.y * 0.5);

            //计算坐边外弧所有点
            var points_l = OpenLayers.Geometry.LineString.createBezier2([pointU_1, pointC_l_out, pointC_l_out_2]).components;

            //计算控制点
            //定义向量
            var v_U_4_3 = new OpenLayers.Geometry.Point(pointU_3.x - pointU_4.x, pointU_3.y - pointU_4.y);

            //取部分
            //需要优化，不能左右都取一样，需要按照左右的长度取值，这样更合理一些
            //取u4和C的向量模
            //取u3和C的向量模
            //根据模的大小来取左右向量的长度，；来定位置
            var v_U_4_C = new OpenLayers.Geometry.Point(pointU_C.x - pointU_4.x, pointU_C.y - pointU_4.y);
            //求模
            var d_U_4_C = Math.sqrt(v_U_4_C.x * v_U_4_C.x + v_U_4_C.y * v_U_4_C.y);
            var v_U_3_C = new OpenLayers.Geometry.Point(pointU_C.x - pointU_3.x, pointU_C.y - pointU_3.y);
            //求模
            var d_U_3_C = Math.sqrt(v_U_3_C.x * v_U_3_C.x + v_U_3_C.y * v_U_3_C.y);

            var percent = 0.4;
            var v_U_4_3_ = new OpenLayers.Geometry.Point(v_U_4_3.x * percent, v_U_4_3.y * percent);
            var v_U_4_3_l = new OpenLayers.Geometry.Point(v_U_4_3_.x * d_U_4_C / (d_U_4_C + d_U_3_C), v_U_4_3_.y * d_U_4_C / (d_U_4_C + d_U_3_C));
            var v_U_4_3_r = new OpenLayers.Geometry.Point(v_U_4_3_.x * d_U_3_C / (d_U_4_C + d_U_3_C), v_U_4_3_.y * d_U_3_C / (d_U_4_C + d_U_3_C));
            //中心点的左控制点
            var pointC_c_l = new OpenLayers.Geometry.Point(pointU_C.x - v_U_4_3_l.x, pointU_C.y - v_U_4_3_l.y);
            //中心点右边的控制点
            var pointC_c_r = new OpenLayers.Geometry.Point(pointU_C.x + v_U_4_3_r.x, pointU_C.y + v_U_4_3_r.y);

            //测试
            var arr = [pointC_l_inner_2, pointC_l_inner, pointC_c_l, pointU_C, pointC_c_r, pointC_r_inner, pointC_r_inner_2];

            var points_c = OpenLayers.Geometry.LineString.createBezier1(arr, 0, 20).components;
            //var points_c = OpenLayers.Geometry.LineString.createBezier(arr,0.05).components;

            //计算右边外弧的所有点
            var points_r = OpenLayers.Geometry.LineString.createBezier2([pointC_r_out_2, pointC_r_out, pointU_2]).components;

            //定义结果数组
            var result = points_l;
            result.push(pointC_l_a_l);
            result.push(pointU_4);
            result.push(pointC_l_a_r);
            result = result.concat(points_c);
            result.push(pointC_r_a_l);
            result.push(pointU_3);
            result.push(pointC_r_a_r);
            result = result.concat(points_r);
            //清空原有的所有点
            this.components = [];
            this.components.push(new OpenLayers.Geometry.LinearRing(result));
        },

        CLASS_NAME: "OpenLayers.Geometry.GeoDoubleArrow"
    }
);

/**
 * APIMethod: fromJSON
 * 根据json数据转换为 GeoDoubleArrow 对象
 *
 * Parameters:
 * str - {String} json数据
 *
 * Returns:
 * {<OpenLayers.Geometry.GeoDoubleArrow>} 返回的 GeoDoubleArrow 对象。
 */
OpenLayers.Geometry.GeoDoubleArrow.fromJSON = function(str, map) {
    var geoDoubleArrow = new OpenLayers.Geometry.GeoDoubleArrow();
    //匹配控制点的数据
    //取第二个代表获取括号内匹配的
    var s = str.match(/"controlPoints":(\[.*?\])/)[1];
    var arr = OpenLayers.Geometry.GeoPlotting.getControlPointsFromJSON(s, map);
    geoDoubleArrow._controlPoints = arr;
    return geoDoubleArrow;
};
/**
 * @requires OpenLayers/Geometry/Collection.js
 * @requires OpenLayers/Geometry/LinearRing.js
 * @requires OpenLayers.Geometry.Point.js
 * @requires OpenLayers.Geometry.Polygon.js
 * @requires OpenLayers.Geometry.GeoPlotting
 */

/**
 *
 * Class: OpenLayers.Geometry.GeoDoveTailDiagonalArrow
 * 燕尾斜箭头
 *
 * Inherits from:
 *  - <OpenLayers.Geometry.GeoPlotting>
 */
OpenLayers.Geometry.GeoDoveTailDiagonalArrow = OpenLayers.Class(
    OpenLayers.Geometry.GeoPlotting, {
        /**
         * Property: _ratio
         * 箭头长度与宽度的比值，箭头三角形需要占用总长度的1/_ratio
         */
        _ratio: 6,
        /**
         * Property: _tailRatio
         * 箭头起始两个节点长度与箭头尾巴的比值
         */
        _tailRatio: 5,
        /**
         * Constructor: OpenLayers.Geometry.GeoDoveTailDiagonalArrow
         * 构造函数
         *
         * Parameters:
         * points - {Array(<OpenLayers.Geometry.Point>)} 初始化时传入的控制点（理论上至少两个，默认为null）
         */
        initialize: function(points) {
            OpenLayers.Geometry.GeoPlotting.prototype.initialize.apply(this, arguments);
        },

        /**
         * APIMethod: getRatio
         * 获取箭头长宽比值，默认为6倍
         */
        getRatio: function() {
            return this._ratio;
        },

        /**
         * APIMethod: setRatio
         * 设置箭头长宽比值，默认为6倍
         *
         * Parameters:
         * value - {Number} 箭头长宽比值
         */
        setRatio: function(value) {
            if (value) {
                this._ratio = value;
                this.calculateParts();
            }
        },

        /**
         * APIMethod: toJSON
         * 将军标符号燕尾斜箭头对象转换为json数据（解析了控制点和长宽比值）
         *
         * Returns:
         * {String} 返回的字符串。
         */
        toJSON: function(map) {
            if (!this._controlPoints) {
                return null;
            }
            var result;
            var len = this._controlPoints.length;
            var arr = [];
            for (var i = 0; i < len; i++) {
                arr.push(this.controlPointToJSON(this._controlPoints[i], map));
            }
            result = "{\"controlPoints\":[" + arr.join(",") + "],\"ratio\":" + this._ratio + ",\"CLASS_NAME\":\"" + this.CLASS_NAME + "\"}";
            return result;
        },

        /**
         * APIMethod: clone
         * 重写clone方法，必须深赋值
         *
         * Returns:
         * {String} 返回几何对象。
         */
        clone: function() {
            var geoDoveTailDiagonalArrow = new OpenLayers.Geometry.GeoDoveTailDiagonalArrow();
            var controlPoints = [];
            //这里只需要赋值控制点
            for (var i = 0, len = this._controlPoints.length; i < len; i++) {
                //这里必须深赋值，不然在编辑时由于引用的问题出现错误
                controlPoints.push(this._controlPoints[i].clone());
            }
            geoDoveTailDiagonalArrow._ratio = this._ratio;
            geoDoveTailDiagonalArrow._controlPoints = controlPoints;
            return geoDoveTailDiagonalArrow;
        },

        /**
         * Method: calculateParts
         * 重写了父类的方法
         * 用于通过控制点计算箭头的所有绘制点
         */
        calculateParts: function() {
            //判定少于两个点或者为空，则直接返回
            if (this._controlPoints == null || this._controlPoints.length < 2) {
                return;
            }
            //判断如果为两个点，且两个点重合时也直接返回
            if (this._controlPoints.length == 2 && (this._controlPoints[0]).equals(this._controlPoints[1])) {
                return;
            }
            //清空原有的所有点
            this.components = [];
            //计算只有两个点时，即直的燕尾斜箭头
            if (this._controlPoints.length == 2) {
                this.calculateTwoPoints();
            }
            //计算有三个或三个以上的点时，即弯曲的燕尾斜箭头
            else {
                this.calculateMorePoints();
            }
        },

        /**
         * Method: calculateTwoPoints
         * 只有两个控制点时
         *
         */
        calculateTwoPoints: function() {
            var controlPois = this.cloneControlPoints(this._controlPoints);

            //取出首尾两个点
            var pointS = controlPois[0];
            var pointE = controlPois[1];
            //计算箭头总长度
            var l = Math.sqrt((pointE.y - pointS.y) * (pointE.y - pointS.y) + (pointE.x - pointS.x) * (pointE.x - pointS.x));
            //计算直箭头的宽
            var w = l / this._ratio;

            //计算三角形的底边中心点坐标
            var x_ = pointS.x + (pointE.x - pointS.x) * (this._ratio - 1) / this._ratio;
            var y_ = pointS.y + (pointE.y - pointS.y) * (this._ratio - 1) / this._ratio;
            var point_o = new OpenLayers.Geometry.Point(x_, y_);

            //计算
            var v_lr_ = this.calculateVector(new OpenLayers.Geometry.Point(pointE.x - pointS.x, pointE.y - pointS.y), Math.PI / 2, w / 2);
            //获取左边尾部向量
            var v_l_ = v_lr_[0];
            //获取右边尾部向量
            var v_r_ = v_lr_[1];
            //获取左边尾部点
            var point_l = new OpenLayers.Geometry.Point(v_l_.x + pointS.x, v_l_.y + pointS.y);
            //获取右边尾部点
            var point_r = new OpenLayers.Geometry.Point(v_r_.x + pointS.x, v_r_.y + pointS.y);
            //在尾部两个中间插入一个点，是pointS往pointE平移的一个点，为了制作尾巴的效果
            var point_tail = new OpenLayers.Geometry.Point((pointE.x - pointS.x) / this._tailRatio + pointS.x, (pointE.y - pointS.y) / this._tailRatio + pointS.y);

            var point_h_l = new OpenLayers.Geometry.Point(v_l_.x / this._ratio + x_, v_l_.y / this._ratio + y_);
            var point_h_r = new OpenLayers.Geometry.Point(v_r_.x / this._ratio + x_, v_r_.y / this._ratio + y_);

            //计算三角形左边点
            var point_a_l = new OpenLayers.Geometry.Point(point_h_l.x * 2 - point_h_r.x, point_h_l.y * 2 - point_h_r.y);
            //计算三角形右边点
            var point_a_r = new OpenLayers.Geometry.Point(point_h_r.x * 2 - point_h_l.x, point_h_r.y * 2 - point_h_l.y);

            this.components.push(new OpenLayers.Geometry.LinearRing([point_tail, point_l, point_h_l, point_a_l, pointE, point_a_r, point_h_r, point_r]));
        },

        /**
         * Method: calculateMorePoints
         * 重写了父类的方法
         * 用于通过控制点计算箭头的所有绘制点
         */
        calculateMorePoints: function() {
            var controlPois = this.cloneControlPoints(this._controlPoints);

            //计算箭头总长度
            var l = 0;
            //计算直箭头的宽
            var w = 0;
            //在尾部两个中间插入一个点，是pointS往pointE平移的一个点，为了制作尾巴的效果
            var point_tail;
            for (var i = 0; i < controlPois.length - 1; i++) {
                //取出首尾两个点
                var pointS = controlPois[i];
                var pointE = controlPois[i + 1];
                l += Math.sqrt((pointE.y - pointS.y) * (pointE.y - pointS.y) + (pointE.x - pointS.x) * (pointE.x - pointS.x));
                if (i == 0) {
                    point_tail = new OpenLayers.Geometry.Point((pointE.x - pointS.x) / this._tailRatio + pointS.x, (pointE.y - pointS.y) / this._tailRatio + pointS.y);
                }
            }
            w = l / this._ratio;

            var a = Math.atan(w / (2 * l));

            //定义左右控制点集合
            var points_C_l = [];
            var points_C_r = [];
            //定义尾部左右的起始点
            var point_t_l = new OpenLayers.Geometry.Point();
            var point_t_r = new OpenLayers.Geometry.Point();


            //计算中间的所有交点
            for (var j = 0; j < controlPois.length - 2; j++) {
                var pointU_1 = controlPois[j]; //第一个用户传入的点
                var pointU_2 = controlPois[j + 1]; //第二个用户传入的点
                var pointU_3 = controlPois[j + 2]; //第三个用户传入的点

                //计算向量
                var v_U_1_2 = new OpenLayers.Geometry.Point(pointU_2.x - pointU_1.x, pointU_2.y - pointU_1.y);
                var v_U_2_3 = new OpenLayers.Geometry.Point(pointU_3.x - pointU_2.x, pointU_3.y - pointU_2.y);


                //定义左边第一个控制点
                var point_l_1 = new OpenLayers.Geometry.Point();
                //定义右边第一个控制点
                var point_r_1 = new OpenLayers.Geometry.Point();
                //如果j=0时，左右第一个控制点需要计算
                if (j == 0) {
                    var v_lr_ = this.calculateVector(v_U_1_2, Math.PI / 2, w / 2);
                    //获取左边尾部点
                    var v_l_ = v_lr_[0];
                    //获取右边尾部点
                    var v_r_ = v_lr_[1];
                    //获取左边尾部点
                    point_t_l = point_l_1 = new OpenLayers.Geometry.Point(v_l_.x + pointU_1.x, v_l_.y + pointU_1.y);
                    //获取右边尾部点
                    point_t_r = point_r_1 = new OpenLayers.Geometry.Point(v_r_.x + pointU_1.x, v_r_.y + pointU_1.y);
                }
                //否则获取上一次的记录
                else {
                    point_l_1 = points_C_l[points_C_l.length - 1];
                    point_r_1 = points_C_r[points_C_r.length - 1];
                }
                var v_lr = this.calculateVector(v_U_1_2, a, 1);
                //这里的向量需要反过来
                //获取左边向量
                var v_l = v_lr[1];
                //获取右边向量
                var v_r = v_lr[0];
                //定义角平分线向量
                var v_angularBisector = this.calculateAngularBisector(new OpenLayers.Geometry.Point(-v_U_1_2.x, -v_U_1_2.y), v_U_2_3);
                //求交点
                //计算左边第二个控制点
                var point_l_2 = this.calculateIntersection(v_l, v_angularBisector, point_l_1, pointU_2);
                var point_r_2 = this.calculateIntersection(v_r, v_angularBisector, point_r_1, pointU_2);


                //添加后面的拐角控制点
                points_C_l.push(new OpenLayers.Geometry.Point((point_l_1.x + point_l_2.x) / 2, (point_l_1.y + point_l_2.y) / 2));
                points_C_l.push(point_l_2);
                points_C_r.push(new OpenLayers.Geometry.Point((point_r_1.x + point_r_2.x) / 2, (point_r_1.y + point_r_2.y) / 2));
                points_C_r.push(point_r_2);
            }

            //进入计算头部
            //计算一下头部的长度
            var pointU_E2 = controlPois[controlPois.length - 2]; //倒数第二个用户点
            var pointU_E1 = controlPois[controlPois.length - 1]; //最后一个用户点
            var head_d = Math.sqrt((pointU_E2.x - pointU_E1.x) * (pointU_E2.x - pointU_E1.x) + (pointU_E2.y - pointU_E1.y) * (pointU_E2.y - pointU_E1.y));
            //定义头部的左右两结束点
            var point_h_l = new OpenLayers.Geometry.Point();
            var point_h_r = new OpenLayers.Geometry.Point();
            //三角形左右两点数组
            var point_lr_t = [];
            //定义曲线最后一个控制点，也就是头部结束点和最后一个拐角点的中点
            var point_C_l_e = new OpenLayers.Geometry.Point();
            var point_C_r_e = new OpenLayers.Geometry.Point();
            //定义三角形的左右两个点
            var point_triangle_l = new OpenLayers.Geometry.Point();
            var point_triangle_r = new OpenLayers.Geometry.Point();

            //获取当前的最后的控制点，也就是之前计算的拐角点
            var point_C_l_eq = points_C_l[points_C_l.length - 1];
            var point_C_r_eq = points_C_r[points_C_r.length - 1];
            //申明三角形的两边向量
            var v_l_t = new OpenLayers.Geometry.Point();
            var v_r_t = new OpenLayers.Geometry.Point();
            //三角的高度都不够
            if (head_d <= w) {
                point_lr_t = this.calculateVector(new OpenLayers.Geometry.Point(pointU_E1.x - pointU_E2.x, pointU_E1.y - pointU_E2.y), Math.PI / 2, w / 2);
                //获取三角形左右两个向量
                v_l_t = point_lr_t[0];
                v_r_t = point_lr_t[1];

                point_h_l = new OpenLayers.Geometry.Point(v_l_t.x / this._ratio + pointU_E2.x, v_l_t.y / this._ratio + pointU_E2.y);
                point_h_r = new OpenLayers.Geometry.Point(v_r_t.x / this._ratio + pointU_E2.x, v_r_t.y / this._ratio + pointU_E2.y);
                //计算三角形的左右两点
                point_triangle_l = new OpenLayers.Geometry.Point(point_h_l.x * 2 - point_h_r.x, point_h_l.y * 2 - point_h_r.y);
                point_triangle_r = new OpenLayers.Geometry.Point(point_h_r.x * 2 - point_h_l.x, point_h_r.y * 2 - point_h_l.y);


                //计算最后的控制点
                point_C_l_e = new OpenLayers.Geometry.Point((point_C_l_eq.x + point_h_l.x) / 2, (point_C_l_eq.y + point_h_l.y) / 2);
                point_C_r_e = new OpenLayers.Geometry.Point((point_C_r_eq.x + point_h_r.x) / 2, (point_C_r_eq.y + point_h_r.y) / 2);

                //添加最后的控制点（中心点）
                points_C_l.push(point_C_l_e);
                points_C_r.push(point_C_r_e);



            }
            //足够三角的高度
            else {
                //由于够了三角的高度，所以首先去掉三角的高度

                //计算向量
                var v_E2_E1 = new OpenLayers.Geometry.Point(pointU_E1.x - pointU_E2.x, pointU_E1.y - pointU_E2.y);
                //取模
                var v_E2_E1_d = Math.sqrt(v_E2_E1.x * v_E2_E1.x + v_E2_E1.y * v_E2_E1.y);
                //首先需要计算三角形的底部中心点
                var point_c = new OpenLayers.Geometry.Point(pointU_E1.x - v_E2_E1.x * w / v_E2_E1_d, pointU_E1.y - v_E2_E1.y * w / v_E2_E1_d);

                //计算出在三角形上底边上头部结束点
                point_lr_t = this.calculateVector(new OpenLayers.Geometry.Point(pointU_E1.x - point_c.x, pointU_E1.y - point_c.y), Math.PI / 2, w / 2);
                //获取三角形左右两个向量
                v_l_t = point_lr_t[0];
                v_r_t = point_lr_t[1];

                point_h_l = new OpenLayers.Geometry.Point(v_l_t.x / this._ratio + point_c.x, v_l_t.y / this._ratio + point_c.y);
                point_h_r = new OpenLayers.Geometry.Point(v_r_t.x / this._ratio + point_c.x, v_r_t.y / this._ratio + point_c.y);
                //计算三角形的左右两点
                point_triangle_l = new OpenLayers.Geometry.Point(point_h_l.x * 2 - point_h_r.x, point_h_l.y * 2 - point_h_r.y);
                point_triangle_r = new OpenLayers.Geometry.Point(point_h_r.x * 2 - point_h_l.x, point_h_r.y * 2 - point_h_l.y);

                //计算最后的控制点
                point_C_l_e = new OpenLayers.Geometry.Point((point_C_l_eq.x + point_h_l.x) / 2, (point_C_l_eq.y + point_h_l.y) / 2);
                point_C_r_e = new OpenLayers.Geometry.Point((point_C_r_eq.x + point_h_r.x) / 2, (point_C_r_eq.y + point_h_r.y) / 2);

                //添加最后的控制点（中心点）
                points_C_l.push(point_C_l_e);
                points_C_r.push(point_C_r_e);
            }
            //使用控制点计算差值
            //计算贝塞尔的控制点
            var points_BC_l = OpenLayers.Geometry.LineString.createBezier2(points_C_l).components;
            var points_BC_r = OpenLayers.Geometry.LineString.createBezier2(points_C_r).components;
            //组合左右点集和三角形三个点
            var pointsR = [point_t_l];
            //首先连接左边的差值曲线
            pointsR = pointsR.concat(points_BC_l);
            //添加左边头部结束点
            pointsR.push(point_h_l);
            //添加三角形左边点
            pointsR.push(point_triangle_l);
            //添加三角形顶点
            pointsR.push(pointU_E1);
            //添加三角形右边点
            pointsR.push(point_triangle_r);
            //添加右边头部结束点
            pointsR.push(point_h_r);
            //合并右边的所有点
            for (var k = points_BC_r.length - 1; k >= 0; k--) {
                pointsR.push(points_BC_r[k]);
            }
            //添加右边尾部起始点
            pointsR.push(point_t_r);
            //添加尾巴点
            pointsR.push(point_tail);
            this.components.push(new OpenLayers.Geometry.LinearRing(pointsR));
        },

        CLASS_NAME: "OpenLayers.Geometry.GeoDoveTailDiagonalArrow"
    }
);

/**
 * APIMethod: fromJSON
 * 根据json数据转换为 GeoDoveTailDiagonalArrow 对象
 *
 * Parameters:
 * str - {String} json数据
 *
 * Returns:
 * {<OpenLayers.Geometry.GeoDoveTailDiagonalArrow >} 返回的 GeoDoveTailDiagonalArrow  对象。
 */
OpenLayers.Geometry.GeoDoveTailDiagonalArrow.fromJSON = function(str, map) {
    var geoDoveTailDiagonalArrow = new OpenLayers.Geometry.GeoDoveTailDiagonalArrow();
    //匹配控制点的数据
    //取第二个代表获取括号内匹配的
    //匹配长宽比例
    var r = str.match(/"ratio":([0-9]+)/)[1];
    geoDoveTailDiagonalArrow._ratio = parseInt(r);

    var s = str.match(/"controlPoints":(\[.*?\])/)[1];
    var arr = OpenLayers.Geometry.GeoPlotting.getControlPointsFromJSON(s, map);
    geoDoveTailDiagonalArrow._controlPoints = arr;
    return geoDoveTailDiagonalArrow;
};

/**
 * @requires OpenLayers/Geometry/Collection.js
 * @requires OpenLayers/Geometry/LinearRing.js
 * @requires OpenLayers.Geometry.Point.js
 * @requires OpenLayers.Geometry.Polygon.js
 * @requires OpenLayers.Geometry.GeoPlotting
 */

/**
 *
 * Class: OpenLayers.Geometry.GeoDoveTailStraightArrow
 * 燕尾直箭头
 *
 * Inherits from:
 *  - <OpenLayers.Geometry.GeoPlotting>
 */
OpenLayers.Geometry.GeoDoveTailStraightArrow = OpenLayers.Class(
    OpenLayers.Geometry.GeoPlotting, {
        /**
         * Property: _ratio
         * 箭头长度与宽度的比值，箭头三角形需要占用总长度的1/_ratio
         */
        _ratio: 6,

        /**
         * Property: _tailRatio
         * 箭头起始两个节点长度与箭头尾巴的比值
         */
        _tailRatio: 5,

        /**
         * Constructor: OpenLayers.Geometry.GeoDoveTailStraightArrow
         * 构造函数
         *
         * Parameters:
         * points - {Array(<OpenLayers.Geometry.Point>)} 初始化时传入的控制点（理论上至少两个，默认为null）
         */
        initialize: function(points) {
            OpenLayers.Geometry.GeoPlotting.prototype.initialize.apply(this, arguments);
        },

        /**
         * APIMethod: getRatio
         * 获取箭头长宽比值，默认为6倍
         */
        getRatio: function() {
            return this._ratio;
        },

        /**
         * APIMethod: setRatio
         * 设置箭头长宽比值，默认为6倍
         *
         * Parameters:
         * value - {Number} 箭头长宽比值
         */
        setRatio: function(value) {
            if (value) {
                this._ratio = value;
                this.calculateParts();
            }
        },

        /**
         * APIMethod: clone
         * 重写clone方法，必须深赋值
         *
         * Returns:
         * {String} 返回几何对象。
         */
        clone: function() {
            var geoDoveTailStraightArrow = new OpenLayers.Geometry.GeoDoveTailStraightArrow();
            var controlPoints = [];
            //这里只需要赋值控制点
            for (var i = 0, len = this._controlPoints.length; i < len; i++) {
                //这里必须深赋值，不然在编辑时由于引用的问题出现错误
                controlPoints.push(this._controlPoints[i].clone());
            }
            geoDoveTailStraightArrow._ratio = this._ratio;
            geoDoveTailStraightArrow._controlPoints = controlPoints;
            return geoDoveTailStraightArrow;
        },

        /**
         * APIMethod: toJSON
         * 将军标符号燕尾直箭头对象转换为json数据（解析了控制点和长宽比值）
         *
         * Returns:
         * {String} 返回的字符串。
         */
        toJSON: function(map) {
            if (!this._controlPoints) {
                return null;
            }
            var result;
            var len = this._controlPoints.length;
            var arr = [];
            for (var i = 0; i < len; i++) {
                arr.push(this.controlPointToJSON(this._controlPoints[i], map));
            }
            result = "{\"controlPoints\":[" + arr.join(",") + "],\"ratio\":" + this._ratio + ",\"CLASS_NAME\":\"" + this.CLASS_NAME + "\"}";
            return result;
        },

        /**
         * Method: calculateParts
         * 重写了父类的方法
         * 用于通过控制点计算箭头的所有绘制点
         */
        calculateParts: function() {
            //判定少于两个点或者为空，则直接返回
            if (this._controlPoints == null || this._controlPoints.length < 2) {
                return;
            }
            //判断如果为两个点，且两个点重合时也直接返回
            if (this._controlPoints.length == 2 && (this._controlPoints[0]).equals(this._controlPoints[1])) {
                return;
            }
            //清空原有的所有点
            this.components = [];
            //计算只有两个点时，即直的斜箭头
            if (this._controlPoints.length == 2) {
                this.calculateTwoPoints();
            }
            //计算有三个或三个以上的点时，即弯曲的斜箭头
            else {
                this.calculateMorePoints();
            }
        },

        /**
         * Method: calculateTwoPoints
         * 计算两个控制点时燕尾直箭头的所有绘制点
         * 两个控制点的燕尾直箭头绘制点只需要7个就可以构成
         */
        calculateTwoPoints: function() {
            var controlPois = this.cloneControlPoints(this._controlPoints);

            //取出第一和第二两个点
            var pointS = controlPois[0];
            var pointE = controlPois[1];
            //计算箭头总长度，即两个控制点的距离
            var l = Math.sqrt((pointE.y - pointS.y) * (pointE.y - pointS.y) + (pointE.x - pointS.x) * (pointE.x - pointS.x));
            //计算燕尾直箭头的宽
            var w = l / this._ratio;

            //计算三角形的底边中心点坐标
            var x_ = pointS.x + (pointE.x - pointS.x) * (this._ratio - 1) / this._ratio;
            var y_ = pointS.y + (pointE.y - pointS.y) * (this._ratio - 1) / this._ratio;
            //计算与基本向量夹角90度的，长度为w/2的向量数组
            var v_lr = this.calculateVector(new OpenLayers.Geometry.Point(pointE.x - pointS.x, pointE.y - pointS.y), Math.PI / 2, w / 2);
            //获取左右向量
            var v_l = v_lr[0];
            var v_r = v_lr[1];
            //左1点
            var point1 = new OpenLayers.Geometry.Point(pointS.x + v_l.x, pointS.y + v_l.y);
            //左2点
            var point2 = new OpenLayers.Geometry.Point(x_ + point1.x - pointS.x, y_ + point1.y - pointS.y);
            //左3点
            var point3 = new OpenLayers.Geometry.Point(2 * point2.x - x_, 2 * point2.y - y_);
            //顶点
            var point4 = new OpenLayers.Geometry.Point(pointE.x, pointE.y);
            //右3点
            var point7 = new OpenLayers.Geometry.Point(pointS.x + v_r.x, pointS.y + v_r.y);
            //右2点
            var point6 = new OpenLayers.Geometry.Point(x_ + point7.x - pointS.x, y_ + point7.y - pointS.y);
            //右1点
            var point5 = new OpenLayers.Geometry.Point(2 * point6.x - x_, 2 * point6.y - y_);
            //在尾部两个中间插入一个点，是pointS往pointE平移的一个点，为了制作尾巴的效果
            var point_tail = new OpenLayers.Geometry.Point((pointE.x - pointS.x) / this._tailRatio + pointS.x, (pointE.y - pointS.y) / this._tailRatio + pointS.y);

            this.components.push(new OpenLayers.Geometry.LinearRing([point_tail, point1, point2, point3, point4, point5, point6, point7]));
        },

        /**
         * Method: calculateMorePoints
         * 计算三个或三个以上的控制点时的所有绘制点
         * 由于中间的控制点之间会进行差值，产生曲线效果，所以所需绘制点会很多
         * 这里使用的思想是将所有用户控制点连接起来形成一条折线段，
         * 然后在拐角进行曲线化处理（二次贝塞尔曲线差值），就形成了效果比较好的箭头
         *
         */
        calculateMorePoints: function() {
            var controlPois = this.cloneControlPoints(this._controlPoints);

            //计算箭头总长度
            var l = 0;
            //计算燕尾直箭头的宽
            var w = 0;
            //在尾部两个中间插入一个点，是pointS往pointE平移的一个点，为了制作尾巴的效果
            var point_tail;
            for (var i = 0; i < controlPois.length - 1; i++) {
                //取出首尾两个点
                var pointS = controlPois[i];
                var pointE = controlPois[i + 1];
                l += Math.sqrt((pointE.y - pointS.y) * (pointE.y - pointS.y) + (pointE.x - pointS.x) * (pointE.x - pointS.x));
                if (i == 0) {
                    point_tail = new OpenLayers.Geometry.Point((pointE.x - pointS.x) / this._tailRatio + pointS.x, (pointE.y - pointS.y) / this._tailRatio + pointS.y);
                }
            }
            w = l / this._ratio;
            //定义左右控制点集合
            var points_C_l = [];
            var points_C_r = [];
            //定义尾部左右的起始点
            var point_t_l = OpenLayers.Geometry.Point();
            var point_t_r = OpenLayers.Geometry.Point();
            //计算中间的所有交点
            for (var j = 0; j < controlPois.length - 2; j++) {
                var pointU_1 = controlPois[j]; //第一个用户传入的点
                var pointU_2 = controlPois[j + 1]; //第二个用户传入的点
                var pointU_3 = controlPois[j + 2]; //第三个用户传入的点

                //计算向量
                var v_U_1_2 = new OpenLayers.Geometry.Point(pointU_2.x - pointU_1.x, pointU_2.y - pointU_1.y);
                var v_U_2_3 = new OpenLayers.Geometry.Point(pointU_3.x - pointU_2.x, pointU_3.y - pointU_2.y);

                var v_lr_1_2 = this.calculateVector(v_U_1_2, Math.PI / 2, w / 2);
                var v_l_1_2 = v_lr_1_2[0];
                var v_r_1_2 = v_lr_1_2[1];
                var v_lr_2_3 = this.calculateVector(v_U_2_3, Math.PI / 2, w / 2);
                var v_l_2_3 = v_lr_2_3[0];
                var v_r_2_3 = v_lr_2_3[1];
                //获取左右
                var point_l_1 = new OpenLayers.Geometry.Point(pointU_1.x + v_l_1_2.x, pointU_1.y + v_l_1_2.y);
                var point_r_1 = new OpenLayers.Geometry.Point(pointU_1.x + v_r_1_2.x, pointU_1.y + v_r_1_2.y);
                var point_l_2 = new OpenLayers.Geometry.Point(pointU_2.x + v_l_2_3.x, pointU_2.y + v_l_2_3.y);
                var point_r_2 = new OpenLayers.Geometry.Point(pointU_2.x + v_r_2_3.x, pointU_2.y + v_r_2_3.y);
                //向量v_U_1_2和向量v-point_l_1和point_r_1是平行的
                //如果向量a=(x1，y1)，b=(x2，y2)，则a//b等价于x1y2－x2y1=0
                //得到(x-point_l_1.x)*v_U_1_2.y=v_U_1_2.x*(y-point_l_1.y)
                //得到(point_l_2.x-x)*v_U_2_3.y=v_U_2_3.x*(point_l_2.y-y)
                //可以求出坐边的交点(x,y)，即控制点
                var point_C_l = this.calculateIntersection(v_U_1_2, v_U_2_3, point_l_1, point_l_2);
                var point_C_r = this.calculateIntersection(v_U_1_2, v_U_2_3, point_r_1, point_r_2);
                //定义中间的控制点
                var point_C_l_c;
                var point_C_r_c;
                if (j == 0) {
                    //记录下箭头尾部的左右两个端点
                    point_t_l = point_l_1;
                    point_t_r = point_r_1;
                    //计算第一个曲线控制点
                    point_C_l_c = new OpenLayers.Geometry.Point((point_t_l.x + point_C_l.x) / 2, (point_t_l.y + point_C_l.y) / 2);
                    point_C_r_c = new OpenLayers.Geometry.Point((point_t_r.x + point_C_r.x) / 2, (point_t_r.y + point_C_r.y) / 2);
                    //添加两个拐角控制点中间的中间控制点
                    points_C_l.push(point_C_l_c);
                    points_C_r.push(point_C_r_c);
                } else {
                    //获取前一个拐角控制点
                    var point_C_l_q = points_C_l[points_C_l.length - 1];
                    var point_C_r_q = points_C_r[points_C_r.length - 1];
                    //计算两个拐角之间的中心控制点
                    point_C_l_c = new OpenLayers.Geometry.Point((point_C_l_q.x + point_C_l.x) / 2, (point_C_l_q.y + point_C_l.y) / 2);
                    point_C_r_c = new OpenLayers.Geometry.Point((point_C_r_q.x + point_C_r.x) / 2, (point_C_r_q.y + point_C_r.y) / 2);
                    //添加两个拐角控制点中间的中间控制点
                    points_C_l.push(point_C_l_c);
                    points_C_r.push(point_C_r_c);
                }
                //添加后面的拐角控制点
                points_C_l.push(point_C_l);
                points_C_r.push(point_C_r);
            }
            //计算



            //进入计算头部
            //计算一下头部的长度
            var pointU_E2 = controlPois[controlPois.length - 2]; //倒数第二个用户点
            var pointU_E1 = controlPois[controlPois.length - 1]; //最后一个用户点
            //
            var v_U_E2_E1 = new OpenLayers.Geometry.Point(pointU_E1.x - pointU_E2.x, pointU_E1.y - pointU_E2.y);
            var head_d = Math.sqrt(v_U_E2_E1.x * v_U_E2_E1.x + v_U_E2_E1.y * v_U_E2_E1.y);
            //定义头部的左右两结束点
            var point_h_l;
            var point_h_r;

            //头部左右两向量数组
            var v_lr_h = [];
            var v_l_h = OpenLayers.Geometry.Point();
            var v_r_h = OpenLayers.Geometry.Point();
            //定义曲线最后一个控制点，也就是头部结束点和最后一个拐角点的中点
            var point_C_l_e = OpenLayers.Geometry.Point();
            var point_C_r_e = OpenLayers.Geometry.Point();
            //定义三角形的左右两个点
            var point_triangle_l = OpenLayers.Geometry.Point();
            var point_triangle_r = OpenLayers.Geometry.Point();

            //获取当前的最后的控制点，也就是之前计算的拐角点
            var point_C_l_eq = points_C_l[points_C_l.length - 1];
            var point_C_r_eq = points_C_r[points_C_r.length - 1];

            //三角的高度都不够
            if (head_d <= w) {
                v_lr_h = this.calculateVector(v_U_E2_E1, Math.PI / 2, w / 2);
                v_l_h = v_lr_h[0];
                v_r_h = v_lr_h[1];
                //获取头部的左右两结束点
                point_h_l = new OpenLayers.Geometry.Point(pointU_E2.x + v_l_h.x, pointU_E2.y + v_l_h.y);
                point_h_r = new OpenLayers.Geometry.Point(pointU_E2.x + v_r_h.x, pointU_E2.y + v_r_h.y);


                //计算最后的控制点
                point_C_l_e = new OpenLayers.Geometry.Point((point_C_l_eq.x + point_h_l.x) / 2, (point_C_l_eq.y + point_h_l.y) / 2);
                point_C_r_e = new OpenLayers.Geometry.Point((point_C_r_eq.x + point_h_r.x) / 2, (point_C_r_eq.y + point_h_r.y) / 2);

                //添加最后的控制点（中心点）
                points_C_l.push(point_C_l_e);
                points_C_r.push(point_C_r_e);


                //计算三角形的左右两点
                point_triangle_l = new OpenLayers.Geometry.Point(2 * point_h_l.x - pointU_E2.x, 2 * point_h_l.y - pointU_E2.y);
                point_triangle_r = new OpenLayers.Geometry.Point(2 * point_h_r.x - pointU_E2.x, 2 * point_h_r.y - pointU_E2.y);
            }
            //足够三角的高度
            else {
                //由于够了三角的高度，所以首先去掉三角的高度

                //计算向量
                var v_E2_E1 = new OpenLayers.Geometry.Point(pointU_E1.x - pointU_E2.x, pointU_E1.y - pointU_E2.y);
                //取模
                var v_E2_E1_d = Math.sqrt(v_E2_E1.x * v_E2_E1.x + v_E2_E1.y * v_E2_E1.y);
                //首先需要计算三角形的底部中心点
                var point_c = new OpenLayers.Geometry.Point(pointU_E1.x - v_E2_E1.x * w / v_E2_E1_d, pointU_E1.y - v_E2_E1.y * w / v_E2_E1_d);
                //计算出在三角形上底边上头部结束点

                v_lr_h = this.calculateVector(v_U_E2_E1, Math.PI / 2, w / 2);
                v_l_h = v_lr_h[0];
                v_r_h = v_lr_h[1];
                //获取头部的左右两结束点
                point_h_l = new OpenLayers.Geometry.Point(point_c.x + v_l_h.x, point_c.y + v_l_h.y);
                point_h_r = new OpenLayers.Geometry.Point(point_c.x + v_r_h.x, point_c.y + v_r_h.y);

                //计算最后的控制点
                point_C_l_e = new OpenLayers.Geometry.Point((point_C_l_eq.x + point_h_l.x) / 2, (point_C_l_eq.y + point_h_l.y) / 2);
                point_C_r_e = new OpenLayers.Geometry.Point((point_C_r_eq.x + point_h_r.x) / 2, (point_C_r_eq.y + point_h_r.y) / 2);

                //添加最后的控制点（中心点）
                points_C_l.push(point_C_l_e);
                points_C_r.push(point_C_r_e);

                //计算三角形的左右点
                point_triangle_l = new OpenLayers.Geometry.Point(2 * point_h_l.x - point_c.x, 2 * point_h_l.y - point_c.y);
                point_triangle_r = new OpenLayers.Geometry.Point(2 * point_h_r.x - point_c.x, 2 * point_h_r.y - point_c.y);
            }

            //使用控制点计算差值
            //计算贝塞尔的控制点
            var points_BC_l = OpenLayers.Geometry.LineString.createBezier2(points_C_l).components;
            var points_BC_r = OpenLayers.Geometry.LineString.createBezier2(points_C_r).components;
            //组合左右点集和三角形三个点
            var pointsR = [point_t_l];
            //首先连接左边的差值曲线
            pointsR = pointsR.concat(points_BC_l);
            //添加左边头部结束点
            pointsR.push(point_h_l);
            //添加三角形左边点
            pointsR.push(point_triangle_l);
            //添加三角形顶点
            pointsR.push(pointU_E1);
            //添加三角形右边点
            pointsR.push(point_triangle_r);
            //添加右边头部结束点
            pointsR.push(point_h_r);
            //合并右边的所有点（先把右边的点倒序）
            pointsR = pointsR.concat(points_BC_r.reverse());

            //添加右边尾部起始点
            pointsR.push(point_t_r);
            //添加尾巴点
            pointsR.push(point_tail);

            this.components.push(new OpenLayers.Geometry.LinearRing(pointsR));
        },

        CLASS_NAME: "OpenLayers.Geometry.GeoDoveTailStraightArrow"
    }
);

/**
 * APIMethod: fromJSON
 * 根据json数据转换为 GeoDoveTailStraightArrow 对象
 *
 * Parameters:
 * str - {String} json数据
 *
 * Returns:
 * {<OpenLayers.Geometry.GeoDoveTailStraightArrow>} 返回的 GeoDoveTailStraightArrow 对象。
 */
OpenLayers.Geometry.GeoDoveTailStraightArrow.fromJSON = function(str, map) {
    var geoDoveTailStraightArrow = new OpenLayers.Geometry.GeoDoveTailStraightArrow();
    //匹配控制点的数据
    //取第二个代表获取括号内匹配的
    //匹配长宽比例
    var r = str.match(/"ratio":([0-9]+)/)[1];
    geoDoveTailStraightArrow._ratio = parseInt(r);

    var s = str.match(/"controlPoints":(\[.*?\])/)[1];
    var arr = OpenLayers.Geometry.GeoPlotting.getControlPointsFromJSON(s, map);
    geoDoveTailStraightArrow._controlPoints = arr;
    return geoDoveTailStraightArrow;
};
/**
 * @requires OpenLayers.Geometry.Point
 * @requires OpenLayers.Geometry.GeoMultiLinePlotting
 */

/**
 *
 * Class: OpenLayers.Geometry.GeoParallelSearch
 * 平行搜寻区。
 * 使用三个或三个以上控制点直接创建平行搜寻区。
 *
 * Inherits from:
 *  - <OpenLayers.Geometry.GeoMultiLinePlotting>
 */
OpenLayers.Geometry.GeoParallelSearch = OpenLayers.Class(
    OpenLayers.Geometry.GeoMultiLinePlotting, {

        /**
         * Constructor: OpenLayers.Geometry.GeoParallelSearch
         * 构造函数
         *
         * Parameters:
         * points - {Array(<OpenLayers.Geometry.Point>)} 需要传入的控制点（三个或三个以上），默认为null
         */
        initialize: function(points) {
            OpenLayers.Geometry.GeoMultiLinePlotting.prototype.initialize.apply(this, arguments);
        },

        /**
         * APIMethod: toJSON
         * 将军标符号平行搜寻区对象转换为json数据（只解析了控制点）
         *
         * Returns:
         * {String} 返回的字符串。
         */
        toJSON: function(map) {
            return OpenLayers.Geometry.GeoMultiLinePlotting.prototype.toJSON.apply(this, arguments);
        },

        /**
         * APIMethod: clone
         * 重写clone方法，必须深赋值
         *
         * Returns:
         * {String} 返回几何对象。
         */
        clone: function() {
            var geometry = new OpenLayers.Geometry.GeoParallelSearch();
            var controlPoints = [];
            //这里只需要赋值控制点
            for (var i = 0, len = this._controlPoints.length; i < len; i++) {
                //这里必须深赋值，不然在编辑时由于引用的问题出现错误
                controlPoints.push(this._controlPoints[i].clone());
            }
            geometry._controlPoints = controlPoints;
            return geometry;
        },
        /**
         * Method: calculateParts
         * 重写了父类的方法
         * 用于通过控制点计算平行搜寻区的所有点
         */
        calculateParts: function() {
            var controlPoints = this.cloneControlPoints(this._controlPoints);

            //清空原有的所有线
            this.components = [];
            //两个控制点时，绘制直线
            if (controlPoints.length > 1) {
                this.components.push(new OpenLayers.Geometry.LineString(controlPoints));

            }
            if (controlPoints.length > 2) {

                var firstP = controlPoints[0];
                var secondP = controlPoints[1];
                //第一、二个点的向量为基准向量
                var vectorBase = this.toVector(firstP, secondP);
                //基准向量的法向量
                var vectorNormal = this.calculateVector(vectorBase)[0];
                //从第三个点开始，当i为奇数，则第i-1、i个点的向量垂直于基准向量，当i为偶数，则第i-1、i个点的向量平行于垂直基准向量。
                var isParalel = false;

                var points = [];
                points.push(firstP);

                var multiLine = [];
                for (var i = 1; i < controlPoints.length; i++) {
                    //判断是否平行
                    isParalel = i % 2 !== 0;
                    var pointI = controlPoints[i];
                    //平行
                    if (isParalel) {

                        var previousP = points[i - 1].clone();
                        var point = this.calculateIntersection(vectorNormal, vectorBase, pointI, previousP);
                        points.push(point);
                        var arrowLines = this.calculateArrowLines(previousP, point, 15);
                        multiLine.push(arrowLines[0]);
                        multiLine.push(arrowLines[1]);
                    }
                    //垂直
                    else {

                        var previousP = points[i - 1];
                        var point = this.calculateIntersection(vectorBase, vectorNormal, pointI, previousP);
                        points.push(point);
                        var arrowLines = this.calculateArrowLines(previousP, point, 15);
                        multiLine.push(arrowLines[0]);
                        multiLine.push(arrowLines[1]);

                    }
                    multiLine.unshift(new OpenLayers.Geometry.LineString(points));

                }
                this.components = multiLine;

            }

        },


        CLASS_NAME: "OpenLayers.Geometry.GeoParallelSearch"
    }
);

/**
 * APIMethod: fromJSON
 * 根据json数据转换为 GeoParallelSearch 对象
 *
 * Parameters:
 * str - {String} json数据
 *
 * Returns:
 * {<OpenLayers.Geometry.GeoParallelSearch>} 返回的 GeoParallelSearch 对象。
 */
OpenLayers.Geometry.GeoParallelSearch.fromJSON = function(str, map) {
    var geoPolyline = new OpenLayers.Geometry.GeoParallelSearch();
    //匹配控制点的数据
    //取第二个代表获取括号内匹配的
    var s = str.match(/"controlPoints":(\[.*?\])/)[1];
    var arr = OpenLayers.Geometry.GeoLinePlotting.getControlPointsFromJSON(s, map);
    geoPolyline._controlPoints = arr;
    return geoPolyline;
};
/**
 * @requires OpenLayers/Geometry/Collection.js
 * @requires OpenLayers/Geometry/LinearRing.js
 * @requires OpenLayers.Geometry.Point.js
 * @requires OpenLayers.Geometry.Polygon.js
 * @requires OpenLayers.Geometry.GeoPlotting
 */

/**
 *
 * Class: OpenLayers.Geometry.GeoRectFlag
 * 直角旗标
 * 使用两个控制点直接创建直角旗标
 *
 * Inherits from:
 *  - <OpenLayers.Geometry.GeoPlotting>
 */
OpenLayers.Geometry.GeoRectFlag = OpenLayers.Class(
    OpenLayers.Geometry.GeoPlotting, {
        /**
         * Constructor: OpenLayers.Geometry.GeoRectFlag
         * 构造函数
         *
         * Parameters:
         * points - {Array(<OpenLayers.Geometry.Point>)} 需要传入的控制点（理论上应该是两个），默认为null
         */
        initialize: function(points) {
            OpenLayers.Geometry.GeoPlotting.prototype.initialize.apply(this, arguments);
        },

        /**
         * APIMethod: toJSON
         * 将军标符号直角旗标对象转换为json数据（只解析了控制点）
         *
         * Returns:
         * {String} 返回的字符串。
         */
        toJSON: function(map) {
            return OpenLayers.Geometry.GeoPlotting.prototype.toJSON.apply(this, arguments);
        },

        /**
         * APIMethod: clone
         * 重写clone方法，必须深赋值
         *
         * Returns:
         * {String} 返回几何对象。
         */
        clone: function() {
            var geoRectFlag = new OpenLayers.Geometry.GeoRectFlag();
            var controlPoints = [];
            //这里只需要赋值控制点
            for (var i = 0, len = this._controlPoints.length; i < len; i++) {
                //这里必须深赋值，不然在编辑时由于引用的问题出现错误
                controlPoints.push(this._controlPoints[i].clone());
            }
            geoRectFlag._controlPoints = controlPoints;
            return geoRectFlag;
        },

        /**
         * Method: calculateParts
         * 重写了父类的方法
         * 用于通过两个控制点计算直角旗标的所有点（5个）
         */
        calculateParts: function() {
            //清空原有的所有点
            this.components = [];
            //至少需要两个控制点
            if (this._controlPoints.length > 1) {
                //取第一个
                var startPoint = this._controlPoints[0];
                //取最后一个
                var endPoint = this._controlPoints[this._controlPoints.length - 1];
                var point1 = startPoint.clone();
                var point2 = new OpenLayers.Geometry.Point(endPoint.x, startPoint.y);
                var point3 = new OpenLayers.Geometry.Point(endPoint.x, (startPoint.y + endPoint.y) / 2);
                var point4 = new OpenLayers.Geometry.Point(startPoint.x, (startPoint.y + endPoint.y) / 2);
                var point5 = new OpenLayers.Geometry.Point(startPoint.x, endPoint.y);

                this.components.push(new OpenLayers.Geometry.LinearRing([point1, point2, point3, point4, point5]));
            }
        },

        CLASS_NAME: "OpenLayers.Geometry.GeoRectFlag"
    }
);

/**
 * APIMethod: fromJSON
 * 根据json数据转换为 GeoRectFlag 对象
 *
 * Parameters:
 * str - {String} json数据
 *
 * Returns:
 * {<OpenLayers.Geometry.GeoRectFlag>} 返回的 GeoRectFlag 对象。
 */
OpenLayers.Geometry.GeoRectFlag.fromJSON = function(str, map) {
    var geoRectFlag = new OpenLayers.Geometry.GeoRectFlag();
    //匹配控制点的数据
    //取第二个代表获取括号内匹配的
    var s = str.match(/"controlPoints":(\[.*?\])/)[1];
    var arr = OpenLayers.Geometry.GeoPlotting.getControlPointsFromJSON(s, map);
    geoRectFlag._controlPoints = arr;
    return geoRectFlag;
};
/**
 * @requires OpenLayers.Geometry.Point
 * @requires OpenLayers.Geometry.GeoMultiLinePlotting
 */

/**
 *
 * Class: OpenLayers.Geometry.GeoSectorSearch
 * 扇形搜寻区。
 * 使用两个控制点直接创建扇形搜寻区。
 *
 * Inherits from:
 *  - <OpenLayers.Geometry.GeoMultiLinePlotting>
 */
OpenLayers.Geometry.GeoSectorSearch = OpenLayers.Class(
    OpenLayers.Geometry.GeoMultiLinePlotting, {

        /**
         * Constructor: OpenLayers.Geometry.GeoSectorSearch
         * 构造函数
         *
         * Parameters:
         * points - {Array(<OpenLayers.Geometry.Point>)} 需要传入的控制点（两个），默认为null
         */
        initialize: function(points) {
            OpenLayers.Geometry.GeoMultiLinePlotting.prototype.initialize.apply(this, arguments);
        },

        /**
         * APIMethod: toJSON
         * 将军标符号扇形搜寻区对象转换为json数据（只解析了控制点）
         *
         * Returns:
         * {String} 返回的字符串。
         */
        toJSON: function(map) {
            return OpenLayers.Geometry.GeoMultiLinePlotting.prototype.toJSON.apply(this, arguments);
        },

        /**
         * APIMethod: clone
         * 重写clone方法，必须深赋值
         *
         * Returns:
         * {String} 返回几何对象。
         */
        clone: function() {
            var geometry = new OpenLayers.Geometry.GeoSectorSearch();
            var controlPoints = [];
            //这里只需要赋值控制点
            for (var i = 0, len = this._controlPoints.length; i < len; i++) {
                //这里必须深赋值，不然在编辑时由于引用的问题出现错误
                controlPoints.push(this._controlPoints[i].clone());
            }
            geometry._controlPoints = controlPoints;
            return geometry;
        },
        /**
         * Method: calculateParts
         * 重写了父类的方法
         * 用于通过控制点计算扇形搜寻区的所有点
         */
        calculateParts: function() {
            var controlPoints = this.cloneControlPoints(this._controlPoints);

            //清空原有的所有线
            this.components = [];
            //两个控制点时，绘制直线
            if (controlPoints.length > 1) {
                var multiLines = [];
                //第一个点为起点，也是中心点
                var centerPoint = controlPoints[0];
                var offsetX = 2 * centerPoint.x;
                var offsetY = 2 * centerPoint.y;
                //第二个点确定半径和起始方向，且为第一个扇形(Fisrst)的点
                var point_FB = controlPoints[controlPoints.length - 1];
                var radius = this.calculateDistance(centerPoint, point_FB);
                var vector_S = this.toVector(centerPoint, point_FB);
                //起始方向向右120°为第二个方向，确定第一个扇形的点
                var vectors = this.calculateVector(vector_S, 4 * Math.PI / 3, radius);
                var vector_FR = vectors[0];
                var point_FC = new OpenLayers.Geometry.Point(vector_FR.x + centerPoint.x, vector_FR.y + centerPoint.y);

                //第二个(second)扇形
                var point_SB = new OpenLayers.Geometry.Point(-point_FC.x + offsetX, -point_FC.y + offsetY);
                var vector_SL = vectors[1];
                var point_SC = new OpenLayers.Geometry.Point(vector_SL.x + centerPoint.x, vector_SL.y + centerPoint.y);

                //第三个(Third)扇形
                var point_TB = new OpenLayers.Geometry.Point(-point_SC.x + offsetX, -point_SC.y + offsetY);
                var point_TC = new OpenLayers.Geometry.Point(-point_FB.x + offsetX, -point_FB.y + offsetY);

                //连接点成扇形搜寻符号
                var points = [centerPoint, point_FB, point_FC, point_SB, point_SC, point_TB, point_TC, centerPoint];
                multiLines.push(new OpenLayers.Geometry.LineString(points));

                //计算各边的箭头
                var arrows_FA = this.calculateArrowLines(centerPoint, point_FB);
                var arrows_FB = this.calculateArrowLines(point_FB, point_FC);
                var arrows_FC = this.calculateArrowLines(point_FC, point_SB);
                var arrows_SB = this.calculateArrowLines(point_SB, point_SC);
                var arrows_SC = this.calculateArrowLines(point_SC, point_TB);
                var arrows_TB = this.calculateArrowLines(point_TB, point_TC);
                var arrows_TC = this.calculateArrowLines(point_TC, centerPoint);
                multiLines.push(arrows_FA[0], arrows_FA[1]);
                multiLines.push(arrows_FB[0], arrows_FB[1]);
                multiLines.push(arrows_FC[0], arrows_FC[1]);
                multiLines.push(arrows_SB[0], arrows_SB[1]);
                multiLines.push(arrows_SC[0], arrows_SC[1]);
                multiLines.push(arrows_TB[0], arrows_TB[1]);
                multiLines.push(arrows_TC[0], arrows_TC[1]);
                this.components = multiLines;

            }
        },


        CLASS_NAME: "OpenLayers.Geometry.GeoSectorSearch"
    }
);

/**
 * APIMethod: fromJSON
 * 根据json数据转换为 GeoSectorSearch 对象
 *
 * Parameters:
 * str - {String} json数据
 *
 * Returns:
 * {<OpenLayers.Geometry.GeoSectorSearch>} 返回的 GeoSectorSearch 对象。
 */
OpenLayers.Geometry.GeoSectorSearch.fromJSON = function(str, map) {
    var geoPolyline = new OpenLayers.Geometry.GeoSectorSearch();
    //匹配控制点的数据
    //取第二个代表获取括号内匹配的
    var s = str.match(/"controlPoints":(\[.*?\])/)[1];
    var arr = OpenLayers.Geometry.GeoLinePlotting.getControlPointsFromJSON(s, map);
    geoPolyline._controlPoints = arr;
    return geoPolyline;
};
/**
 * @requires OpenLayers/Geometry/Collection.js
 * @requires OpenLayers/Geometry/LinearRing.js
 * @requires OpenLayers.Geometry.Point.js
 * @requires OpenLayers.Geometry.Polygon.js
 * @requires OpenLayers.Geometry.GeoPlotting
 */

/**
 *
 * Class: OpenLayers.Geometry.GeoStraightArrow
 * 直箭头
 *
 * Inherits from:
 *  - <OpenLayers.Geometry.GeoPlotting>
 */
OpenLayers.Geometry.GeoStraightArrow = OpenLayers.Class(
    OpenLayers.Geometry.GeoPlotting, {
        /**
         * Property: _ratio
         * 箭头长度与宽度的比值，箭头三角形需要占用总长度的1/_ratio
         */
        _ratio: 6,

        /**
         * Constructor: OpenLayers.Geometry.GeoStraightArrow
         * 构造函数
         *
         * Parameters:
         * points - {Array(<OpenLayers.Geometry.Point>)} 初始化时传入的控制点（理论上至少两个，默认为null）
         */
        initialize: function(points) {
            OpenLayers.Geometry.GeoPlotting.prototype.initialize.apply(this, arguments);
        },

        /**
         * APIMethod: getRatio
         * 获取箭头长宽比值，默认为6倍
         */
        getRatio: function() {
            return this._ratio;
        },

        /**
         * APIMethod: setRatio
         * 设置箭头长宽比值，默认为6倍
         *
         * Parameters:
         * value - {Number} 箭头长宽比值
         */
        setRatio: function(value) {
            if (value) {
                this._ratio = value;
                this.calculateParts();
            }
        },

        /**
         * APIMethod: clone
         * 重写clone方法，必须深赋值
         *
         * Returns:
         * {String} 返回几何对象。
         */
        clone: function() {
            var geoStraightArrow = new OpenLayers.Geometry.GeoStraightArrow();
            var controlPoints = [];
            //这里只需要赋值控制点
            for (var i = 0, len = this._controlPoints.length; i < len; i++) {
                //这里必须深赋值，不然在编辑时由于引用的问题出现错误
                controlPoints.push(this._controlPoints[i].clone());
            }
            geoStraightArrow._ratio = this._ratio;
            geoStraightArrow._controlPoints = controlPoints;
            return geoStraightArrow;
        },

        /**
         * APIMethod: toJSON
         * 将军标符号直箭头对象转换为json数据（解析了控制点和长宽比值）
         *
         * Returns:
         * {String} 返回的字符串。
         */
        toJSON: function(map) {
            if (!this._controlPoints) {
                return null;
            }
            var result;
            var len = this._controlPoints.length;
            var arr = [];
            for (var i = 0; i < len; i++) {
                arr.push(this.controlPointToJSON(this._controlPoints[i], map));
            }
            result = "{\"controlPoints\":[" + arr.join(",") + "],\"ratio\":" + this._ratio + ",\"CLASS_NAME\":\"" + this.CLASS_NAME + "\"}";
            return result;
        },

        /**
         * Method: calculateParts
         * 重写了父类的方法
         * 用于通过控制点计算箭头的所有绘制点
         */
        calculateParts: function() {
            //判定少于两个点或者为空，则直接返回
            if (this._controlPoints == null || this._controlPoints.length < 2) {
                return;
            }
            //判断如果为两个点，且两个点重合时也直接返回
            if (this._controlPoints.length == 2 && (this._controlPoints[0]).equals(this._controlPoints[1])) {
                return;
            }
            //清空原有的所有点
            this.components = [];
            //计算只有两个点时，即直的斜箭头
            if (this._controlPoints.length == 2) {
                this.calculateTwoPoints();
            }
            //计算有三个或三个以上的点时，即弯曲的斜箭头
            else {
                this.calculateMorePoints();
            }
        },

        /**
         * Method: calculateTwoPoints
         * 计算两个控制点时直箭头的所有绘制点
         * 两个控制点的直箭头绘制点只需要7个就可以构成
         */
        calculateTwoPoints: function() {
            var controlPois = this.cloneControlPoints(this._controlPoints);

            //取出第一和第二两个点
            var pointS = controlPois[0];
            var pointE = controlPois[1];
            //计算箭头总长度，即两个控制点的距离
            var l = Math.sqrt((pointE.y - pointS.y) * (pointE.y - pointS.y) + (pointE.x - pointS.x) * (pointE.x - pointS.x));
            //计算直箭头的宽
            var w = l / this._ratio;

            //计算三角形的底边中心点坐标
            var x_ = pointS.x + (pointE.x - pointS.x) * (this._ratio - 1) / this._ratio;
            var y_ = pointS.y + (pointE.y - pointS.y) * (this._ratio - 1) / this._ratio;
            //计算与基本向量夹角90度的，长度为w/2的向量数组
            var v_lr = this.calculateVector(new OpenLayers.Geometry.Point(pointE.x - pointS.x, pointE.y - pointS.y), Math.PI / 2, w / 2);
            //获取左右向量
            var v_l = v_lr[0];
            var v_r = v_lr[1];
            //左1点
            var point1 = new OpenLayers.Geometry.Point(pointS.x + v_l.x, pointS.y + v_l.y);
            //左2点
            var point2 = new OpenLayers.Geometry.Point(x_ + point1.x - pointS.x, y_ + point1.y - pointS.y);
            //左3点
            var point3 = new OpenLayers.Geometry.Point(2 * point2.x - x_, 2 * point2.y - y_);
            //顶点
            var point4 = new OpenLayers.Geometry.Point(pointE.x, pointE.y);
            //右3点
            var point7 = new OpenLayers.Geometry.Point(pointS.x + v_r.x, pointS.y + v_r.y);
            //右2点
            var point6 = new OpenLayers.Geometry.Point(x_ + point7.x - pointS.x, y_ + point7.y - pointS.y);
            //右1点
            var point5 = new OpenLayers.Geometry.Point(2 * point6.x - x_, 2 * point6.y - y_);

            this.components.push(new OpenLayers.Geometry.LinearRing([point1, point2, point3, point4, point5, point6, point7]));
        },

        /**
         * Method: calculateMorePoints
         * 计算三个或三个以上的控制点时的所有绘制点
         * 由于中间的控制点之间会进行差值，产生曲线效果，所以所需绘制点会很多
         * 这里使用的思想是将所有用户控制点连接起来形成一条折线段，
         * 然后在拐角进行曲线化处理（二次贝塞尔曲线差值），就形成了效果比较好的箭头
         *
         */
        calculateMorePoints: function() {
            var controlPois = this.cloneControlPoints(this._controlPoints);

            //计算箭头总长度
            var l = 0;
            //计算直箭头的宽
            var w = 0;
            for (var i = 0; i < controlPois.length - 1; i++) {
                //取出首尾两个点
                var pointS = controlPois[i];
                var pointE = controlPois[i + 1];
                l += Math.sqrt((pointE.y - pointS.y) * (pointE.y - pointS.y) + (pointE.x - pointS.x) * (pointE.x - pointS.x));
            }
            w = l / this._ratio;
            //定义左右控制点集合
            var points_C_l = [];
            var points_C_r = [];
            //定义尾部左右的起始点
            var point_t_l = OpenLayers.Geometry.Point();
            var point_t_r = OpenLayers.Geometry.Point();
            //计算中间的所有交点
            for (var j = 0; j < controlPois.length - 2; j++) {
                var pointU_1 = controlPois[j]; //第一个用户传入的点
                var pointU_2 = controlPois[j + 1]; //第二个用户传入的点
                var pointU_3 = controlPois[j + 2]; //第三个用户传入的点

                //计算向量
                var v_U_1_2 = new OpenLayers.Geometry.Point(pointU_2.x - pointU_1.x, pointU_2.y - pointU_1.y);
                var v_U_2_3 = new OpenLayers.Geometry.Point(pointU_3.x - pointU_2.x, pointU_3.y - pointU_2.y);

                var v_lr_1_2 = this.calculateVector(v_U_1_2, Math.PI / 2, w / 2);
                var v_l_1_2 = v_lr_1_2[0];
                var v_r_1_2 = v_lr_1_2[1];
                var v_lr_2_3 = this.calculateVector(v_U_2_3, Math.PI / 2, w / 2);
                var v_l_2_3 = v_lr_2_3[0];
                var v_r_2_3 = v_lr_2_3[1];
                //获取左右
                var point_l_1 = new OpenLayers.Geometry.Point(pointU_1.x + v_l_1_2.x, pointU_1.y + v_l_1_2.y);
                var point_r_1 = new OpenLayers.Geometry.Point(pointU_1.x + v_r_1_2.x, pointU_1.y + v_r_1_2.y);
                var point_l_2 = new OpenLayers.Geometry.Point(pointU_2.x + v_l_2_3.x, pointU_2.y + v_l_2_3.y);
                var point_r_2 = new OpenLayers.Geometry.Point(pointU_2.x + v_r_2_3.x, pointU_2.y + v_r_2_3.y);
                //向量v_U_1_2和向量v-point_l_1和point_r_1是平行的
                //如果向量a=(x1，y1)，b=(x2，y2)，则a//b等价于x1y2－x2y1=0
                //得到(x-point_l_1.x)*v_U_1_2.y=v_U_1_2.x*(y-point_l_1.y)
                //得到(point_l_2.x-x)*v_U_2_3.y=v_U_2_3.x*(point_l_2.y-y)
                //可以求出坐边的交点(x,y)，即控制点
                var point_C_l = this.calculateIntersection(v_U_1_2, v_U_2_3, point_l_1, point_l_2);
                var point_C_r = this.calculateIntersection(v_U_1_2, v_U_2_3, point_r_1, point_r_2);
                //定义中间的控制点
                var point_C_l_c;
                var point_C_r_c;
                if (j == 0) {
                    //记录下箭头尾部的左右两个端点
                    point_t_l = point_l_1;
                    point_t_r = point_r_1;
                    //计算第一个曲线控制点
                    point_C_l_c = new OpenLayers.Geometry.Point((point_t_l.x + point_C_l.x) / 2, (point_t_l.y + point_C_l.y) / 2);
                    point_C_r_c = new OpenLayers.Geometry.Point((point_t_r.x + point_C_r.x) / 2, (point_t_r.y + point_C_r.y) / 2);
                    //添加两个拐角控制点中间的中间控制点
                    points_C_l.push(point_C_l_c);
                    points_C_r.push(point_C_r_c);
                } else {
                    //获取前一个拐角控制点
                    var point_C_l_q = points_C_l[points_C_l.length - 1];
                    var point_C_r_q = points_C_r[points_C_r.length - 1];
                    //计算两个拐角之间的中心控制点
                    point_C_l_c = new OpenLayers.Geometry.Point((point_C_l_q.x + point_C_l.x) / 2, (point_C_l_q.y + point_C_l.y) / 2);
                    point_C_r_c = new OpenLayers.Geometry.Point((point_C_r_q.x + point_C_r.x) / 2, (point_C_r_q.y + point_C_r.y) / 2);
                    //添加两个拐角控制点中间的中间控制点
                    points_C_l.push(point_C_l_c);
                    points_C_r.push(point_C_r_c);
                }
                //添加后面的拐角控制点
                points_C_l.push(point_C_l);
                points_C_r.push(point_C_r);
            }
            //计算



            //进入计算头部
            //计算一下头部的长度
            var pointU_E2 = controlPois[controlPois.length - 2]; //倒数第二个用户点
            var pointU_E1 = controlPois[controlPois.length - 1]; //最后一个用户点
            //
            var v_U_E2_E1 = new OpenLayers.Geometry.Point(pointU_E1.x - pointU_E2.x, pointU_E1.y - pointU_E2.y);
            var head_d = Math.sqrt(v_U_E2_E1.x * v_U_E2_E1.x + v_U_E2_E1.y * v_U_E2_E1.y);
            //定义头部的左右两结束点
            var point_h_l;
            var point_h_r;

            //头部左右两向量数组
            var v_lr_h = [];
            var v_l_h = OpenLayers.Geometry.Point();
            var v_r_h = OpenLayers.Geometry.Point();
            //定义曲线最后一个控制点，也就是头部结束点和最后一个拐角点的中点
            var point_C_l_e = OpenLayers.Geometry.Point();
            var point_C_r_e = OpenLayers.Geometry.Point();
            //定义三角形的左右两个点
            var point_triangle_l = OpenLayers.Geometry.Point();
            var point_triangle_r = OpenLayers.Geometry.Point();

            //获取当前的最后的控制点，也就是之前计算的拐角点
            var point_C_l_eq = points_C_l[points_C_l.length - 1];
            var point_C_r_eq = points_C_r[points_C_r.length - 1];

            //三角的高度都不够
            if (head_d <= w) {
                v_lr_h = this.calculateVector(v_U_E2_E1, Math.PI / 2, w / 2);
                v_l_h = v_lr_h[0];
                v_r_h = v_lr_h[1];
                //获取头部的左右两结束点
                point_h_l = new OpenLayers.Geometry.Point(pointU_E2.x + v_l_h.x, pointU_E2.y + v_l_h.y);
                point_h_r = new OpenLayers.Geometry.Point(pointU_E2.x + v_r_h.x, pointU_E2.y + v_r_h.y);


                //计算最后的控制点
                point_C_l_e = new OpenLayers.Geometry.Point((point_C_l_eq.x + point_h_l.x) / 2, (point_C_l_eq.y + point_h_l.y) / 2);
                point_C_r_e = new OpenLayers.Geometry.Point((point_C_r_eq.x + point_h_r.x) / 2, (point_C_r_eq.y + point_h_r.y) / 2);

                //添加最后的控制点（中心点）
                points_C_l.push(point_C_l_e);
                points_C_r.push(point_C_r_e);


                //计算三角形的左右两点
                point_triangle_l = new OpenLayers.Geometry.Point(2 * point_h_l.x - pointU_E2.x, 2 * point_h_l.y - pointU_E2.y);
                point_triangle_r = new OpenLayers.Geometry.Point(2 * point_h_r.x - pointU_E2.x, 2 * point_h_r.y - pointU_E2.y);
            }
            //足够三角的高度
            else {
                //由于够了三角的高度，所以首先去掉三角的高度

                //计算向量
                var v_E2_E1 = new OpenLayers.Geometry.Point(pointU_E1.x - pointU_E2.x, pointU_E1.y - pointU_E2.y);
                //取模
                var v_E2_E1_d = Math.sqrt(v_E2_E1.x * v_E2_E1.x + v_E2_E1.y * v_E2_E1.y);
                //首先需要计算三角形的底部中心点
                var point_c = new OpenLayers.Geometry.Point(pointU_E1.x - v_E2_E1.x * w / v_E2_E1_d, pointU_E1.y - v_E2_E1.y * w / v_E2_E1_d);
                //计算出在三角形上底边上头部结束点

                v_lr_h = this.calculateVector(v_U_E2_E1, Math.PI / 2, w / 2);
                v_l_h = v_lr_h[0];
                v_r_h = v_lr_h[1];
                //获取头部的左右两结束点
                point_h_l = new OpenLayers.Geometry.Point(point_c.x + v_l_h.x, point_c.y + v_l_h.y);
                point_h_r = new OpenLayers.Geometry.Point(point_c.x + v_r_h.x, point_c.y + v_r_h.y);

                //计算最后的控制点
                point_C_l_e = new OpenLayers.Geometry.Point((point_C_l_eq.x + point_h_l.x) / 2, (point_C_l_eq.y + point_h_l.y) / 2);
                point_C_r_e = new OpenLayers.Geometry.Point((point_C_r_eq.x + point_h_r.x) / 2, (point_C_r_eq.y + point_h_r.y) / 2);

                //添加最后的控制点（中心点）
                points_C_l.push(point_C_l_e);
                points_C_r.push(point_C_r_e);

                //计算三角形的左右点
                point_triangle_l = new OpenLayers.Geometry.Point(2 * point_h_l.x - point_c.x, 2 * point_h_l.y - point_c.y);
                point_triangle_r = new OpenLayers.Geometry.Point(2 * point_h_r.x - point_c.x, 2 * point_h_r.y - point_c.y);
            }

            //使用控制点计算差值
            //计算贝塞尔的控制点
            var points_BC_l = OpenLayers.Geometry.LineString.createBezier2(points_C_l).components;
            var points_BC_r = OpenLayers.Geometry.LineString.createBezier2(points_C_r).components;
            //组合左右点集和三角形三个点
            var pointsR = [point_t_l];
            //首先连接左边的差值曲线
            pointsR = pointsR.concat(points_BC_l);
            //添加左边头部结束点
            pointsR.push(point_h_l);
            //添加三角形左边点
            pointsR.push(point_triangle_l);
            //添加三角形顶点
            pointsR.push(pointU_E1);
            //添加三角形右边点
            pointsR.push(point_triangle_r);
            //添加右边头部结束点
            pointsR.push(point_h_r);
            //合并右边的所有点（先把右边的点倒序）
            pointsR = pointsR.concat(points_BC_r.reverse());

            //添加右边尾部起始点
            pointsR.push(point_t_r);

            this.components.push(new OpenLayers.Geometry.LinearRing(pointsR));
        },

        CLASS_NAME: "OpenLayers.Geometry.GeoStraightArrow"
    }
);

/**
 * APIMethod: fromJSON
 * 根据json数据转换为 GeoStraightArrow 对象
 *
 * Parameters:
 * str - {String} json数据
 *
 * Returns:
 * {<OpenLayers.Geometry.GeoStraightArrow>} 返回的 GeoStraightArrow 对象。
 */
OpenLayers.Geometry.GeoStraightArrow.fromJSON = function(str, map) {
    var geoStraightArrow = new OpenLayers.Geometry.GeoStraightArrow();
    //匹配控制点的数据
    //取第二个代表获取括号内匹配的
    //匹配长宽比例
    var r = str.match(/"ratio":([0-9]+)/)[1];
    geoStraightArrow._ratio = parseInt(r);

    var s = str.match(/"controlPoints":(\[.*?\])/)[1];
    var arr = OpenLayers.Geometry.GeoPlotting.getControlPointsFromJSON(s, map);
    geoStraightArrow._controlPoints = arr;
    return geoStraightArrow;
};
/**
 * @requires OpenLayers.Geometry.Point
 * @requires OpenLayers.Geometry.GeoMultiLinePlotting
 */

/**
 *
 * Class: OpenLayers.Geometry.GeoPolylineArrow
 * 折线箭头。
 * 使用两个或两个以上控制点直接创建折线箭头。
 *
 * Inherits from:
 *  - <OpenLayers.Geometry.GeoMultiLinePlotting>
 */
OpenLayers.Geometry.GeoPolylineArrow = OpenLayers.Class(
    OpenLayers.Geometry.GeoMultiLinePlotting, {

        /**
         * Constructor: OpenLayers.Geometry.GeoPolylineArrow
         * 构造函数
         *
         * Parameters:
         * points - {Array(<OpenLayers.Geometry.Point>)} 需要传入的控制点（三个或三个以上），默认为null
         */
        initialize: function(points) {
            OpenLayers.Geometry.GeoMultiLinePlotting.prototype.initialize.apply(this, arguments);
        },

        /**
         * APIMethod: toJSON
         * 将军标符号折线箭头对象转换为json数据（只解析了控制点）
         *
         * Returns:
         * {String} 返回的字符串。
         */
        toJSON: function(map) {
            return OpenLayers.Geometry.GeoMultiLinePlotting.prototype.toJSON.apply(this, arguments);
        },

        /**
         * APIMethod: clone
         * 重写clone方法，必须深赋值
         *
         * Returns:
         * {String} 返回几何对象。
         */
        clone: function() {
            var geometry = new OpenLayers.Geometry.GeoPolylineArrow();
            var controlPoints = [];
            //这里只需要赋值控制点
            for (var i = 0, len = this._controlPoints.length; i < len; i++) {
                //这里必须深赋值，不然在编辑时由于引用的问题出现错误
                controlPoints.push(this._controlPoints[i].clone());
            }
            geometry._controlPoints = controlPoints;
            return geometry;
        },
        /**
         * Method: calculateParts
         * 重写了父类的方法
         * 用于通过控制点计算折线箭头的所有点
         */
        calculateParts: function() {
            var controlPoints = this.cloneControlPoints(this._controlPoints);

            //清空原有的所有线
            this.components = [];
            //两个控制点时，绘制直线
            if (controlPoints.length > 1) {
                var multiLines = [];
                var startP = controlPoints[controlPoints.length - 2];
                var endP = controlPoints[controlPoints.length - 1];
                //直线
                var straightLine = new OpenLayers.Geometry.LineString(controlPoints);
                //箭头
                var arrowLines = this.calculateArrowLines(startP, endP, 10);
                multiLines.push(straightLine, arrowLines[0], arrowLines[1]);
                this.components = multiLines;
            }

        },


        CLASS_NAME: "OpenLayers.Geometry.GeoPolylineArrow"
    }
);

/**
 * APIMethod: fromJSON
 * 根据json数据转换为 GeoPolylineArrow 对象
 *
 * Parameters:
 * str - {String} json数据
 *
 * Returns:
 * {<OpenLayers.Geometry.GeoPolylineArrow>} 返回的 GeoPolylineArrow 对象。
 */
OpenLayers.Geometry.GeoPolylineArrow.fromJSON = function(str, map) {
    var geoPolyline = new OpenLayers.Geometry.GeoPolylineArrow();
    //匹配控制点的数据
    //取第二个代表获取括号内匹配的
    var s = str.match(/"controlPoints":(\[.*?\])/)[1];
    var arr = OpenLayers.Geometry.GeoLinePlotting.getControlPointsFromJSON(s, map);
    geoPolyline._controlPoints = arr;
    return geoPolyline;
};
/**
 * @requires OpenLayers/Geometry/Collection.js
 * @requires OpenLayers/Geometry/LinearRing.js
 * @requires OpenLayers.Geometry.Point.js
 * @requires OpenLayers.Geometry.Polygon.js
 * @requires OpenLayers.Geometry.GeoPlotting
 */

/**
 *
 * Class: OpenLayers.Geometry.GeoTriangleFlag
 * 三角旗标。
 * 使用两个控制点直接创建直角旗标
 *
 * Inherits from:
 *  - <OpenLayers.Geometry.GeoPlotting>
 */
OpenLayers.Geometry.GeoTriangleFlag = OpenLayers.Class(
    OpenLayers.Geometry.GeoPlotting, {
        /**
         * Constructor: OpenLayers.Geometry.GeoTriangleFlag
         * 构造函数
         *
         * Parameters:
         * points - {Array(<OpenLayers.Geometry.Point>)} 需要传入的控制点（理论上应该是两个），默认为null
         */
        initialize: function(points) {
            OpenLayers.Geometry.GeoPlotting.prototype.initialize.apply(this, arguments);
        },

        /**
         * APIMethod: toJSON
         * 将军标符号三角旗标对象转换为json数据（只解析了控制点）
         *
         * Returns:
         * {String} 返回的字符串。
         */
        toJSON: function(map) {
            return OpenLayers.Geometry.GeoPlotting.prototype.toJSON.apply(this, arguments);
        },

        /**
         * APIMethod: clone
         * 重写clone方法，必须深赋值
         *
         * Returns:
         * {String} 返回几何对象。
         */
        clone: function() {
            var geoTriangleFlag = new OpenLayers.Geometry.GeoTriangleFlag();
            var controlPoints = [];
            //这里只需要赋值控制点
            for (var i = 0, len = this._controlPoints.length; i < len; i++) {
                //这里必须深赋值，不然在编辑时由于引用的问题出现错误
                controlPoints.push(this._controlPoints[i].clone());
            }
            geoTriangleFlag._controlPoints = controlPoints;
            return geoTriangleFlag;
        },

        /**
         * Method: calculateParts
         * 重写了父类的方法
         * 用于通过两个控制点计算三角旗标的所有点（4个）
         */
        calculateParts: function() {
            //清空原有的所有点
            this.components = [];
            //至少需要两个控制点
            if (this._controlPoints.length > 1) {
                var startPoint = this._controlPoints[0];
                //取最后一个
                var endPoint = this._controlPoints[this._controlPoints.length - 1];
                var point1 = startPoint.clone();
                var point2 = new OpenLayers.Geometry.Point(endPoint.x, (startPoint.y + endPoint.y) / 2);
                var point3 = new OpenLayers.Geometry.Point(startPoint.x, (startPoint.y + endPoint.y) / 2);
                var point4 = new OpenLayers.Geometry.Point(startPoint.x, endPoint.y);

                this.components.push(new OpenLayers.Geometry.LinearRing([point1, point2, point3, point4]));
            }
        },

        CLASS_NAME: "OpenLayers.Geometry.GeoTriangleFlag"
    }
);

/**
 * APIMethod: fromJSON
 * 根据json数据转换为 GeoTriangleFlag 对象
 *
 * Parameters:
 * str - {String} json数据
 *
 * Returns:
 * {<OpenLayers.Geometry.GeoTriangleFlag>} 返回的 GeoTriangleFlag 对象。
 */
OpenLayers.Geometry.GeoTriangleFlag.fromJSON = function(str, map) {
    var geoTriangleFlag = new OpenLayers.Geometry.GeoTriangleFlag();
    //匹配控制点的数据
    //取第二个代表获取括号内匹配的
    var s = str.match(/"controlPoints":(\[.*?\])/)[1];
    var arr = OpenLayers.Geometry.GeoPlotting.getControlPointsFromJSON(s, map);
    geoTriangleFlag._controlPoints = arr;
    return geoTriangleFlag;
};
/**
 * @requires OpenLayers/Handler/Plotting
 * @requires OpenLayers/Geometry/GeoPoint
 */

/**
 * Class: OpenLayers.Handler.PointEx
 * 在地图上绘制点的事件处理器。
 * 绘制点在激活后显示，随着鼠标移动而移动，在鼠标第一次松开后完成绘制。
 * 该处理器会触发标记为"done"、"cancel"和“modify"的事件回调。其中modify回调会在每一次变化时被调用并传入最近一次绘制的点。
 * 使用 <OpenLayers.Handler.PointEx> 构造函数可以创建一个新的绘制点的事件处理器实例。
 *
 * Inherits from:
 *  - <OpenLayers.Handler.Plotting>
 */
OpenLayers.Handler.PointEx = OpenLayers.Class(OpenLayers.Handler.Plotting, {
    /**
     * Constructor: OpenLayers.Handler.PointEx
     * 构造函数，创建一个新的绘制点的事件处理器。
     *
     * Parameters:
     * control - {<OpenLayers.Control>} 构建当前事件处理器的控件对象。
     * callbacks - {Object} 回调函数对象。关于回调的具体描述参见下文。
     * options - {Object} 一个可选对象，其属性将会赋值到事件处理器对象上。
     *
     * Named callbacks:
     * create - 当要素草图第一次创建的时候调用，回调函数需接收两个参数：当前点几何对象、当前要素。
     * modify - 顶点的每一次变化时调用，回调函数接受参数：几何点对象、当前要素。
     * done - 当绘制点操作完成时调用，回调函数接收一个参数，当前点的几何对象。
     * cancel - 绘制过程中关闭当前事件处理器的监听时调用，回调函数接收当前要素的几何对象作为参数。
     */
    initialize: function(control, callbacks, options) {
        OpenLayers.Handler.Plotting.prototype.initialize.apply(this, arguments);
    },

    /**
     * Method: createFeature
     * create temporary features
     *
     * Parameters:
     * pixel - {<OpenLayers.Pixel>} A pixel location on the map.
     */
    createFeature: function(pixel) {
        var lonlat = this.layer.getLonLatFromViewPortPx(pixel);
        var geometry = new OpenLayers.Geometry.Point(
            lonlat.lon, lonlat.lat
        );
        this.point = new OpenLayers.Feature.Vector(geometry);
        //标绘扩展符号的 Geometry 类型为 GeoPoint
        this.plotting = new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.GeoPoint()
        );

        this.callback("create", [this.point.geometry, this.getSketch()]);
        this.point.geometry.clearBounds();
    },

    /**
     * APIMethod: down
     * Handle mousedown and touchstart.  Adjust the Geometry and redraw.
     * Return determines whether to propagate the event on the map.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    down: function(evt) {
        this.mouseDown = true;
        this.lastDown = evt.xy;
        this.isDrawing = true;
        if (!this.touch) {
            this.modifyFeature(evt.xy);
        }
        this.stoppedDown = this.stopDown;
        return !this.stopDown;
    },
    /**
     * Method: up
     * 操作 mouseup 和 touchend.
     * 发送最后一个 mouseup 点。
     *
     * Parameters:
     * evt - {Event} 浏览器事件，evt.xy 为最后一个 mouseup 的像素位置。
     *
     * Returns:
     * {Boolean} 是否允许事件继续在 map 上传送
     */
    up: function(evt) {
        this.mouseDown = false;
        this.stoppedDown = this.stopDown;

        // ignore double-clicks
        if (this.lastUp && this.lastUp.equals(evt.xy)) {
            return true;
        }
        if (this.lastDown && this.passesTolerance(this.lastDown, evt.xy, this.pixelTolerance)) {
            if (this.touch) {
                this.modifyFeature(evt.xy);
            }
            if (this.persist) {
                this.destroyPersistedFeature();
            }
            this.lastUp = evt.xy;
            this.addControlPoint(evt.xy);
            var len = this.controlPoints.length;
            if (len == 1) {
                this.drawComplete();
            }
            return true;
        } else {
            return true;
        }
    },
    CLASS_NAME: "OpenLayers.Handler.PointEx"
});


/**
 * @requires OpenLayers/Handler/Plotting
 * @requires OpenLayers/Geometry/GeoMultiPoint
 */

/**
 * Class: OpenLayers.Handler.MultiPointEx
 * 在地图上绘制多点的事件处理器。
 * 绘制点在激活后显示，随着鼠标移动而移动，在鼠标第一次松开后开始绘制，双击后完成绘制。
 * 该处理器会触发标记为"done"、"cancel"和“modify"的事件回调。其中modify回调会在每一次变化时被调用并传入最近一次绘制的点。
 * 使用 <OpenLayers.Handler.MultiPointEx> 构造函数可以创建一个新的绘制多点的事件处理器实例。
 *
 * Inherits from:
 *  - <OpenLayers.Handler.Plotting>
 */
OpenLayers.Handler.MultiPointEx = OpenLayers.Class(OpenLayers.Handler.Plotting, {
    /**
     * Constructor: OpenLayers.Handler.MultiPointEx
     * 构造函数，创建一个新的绘制多点的事件处理器。
     *
     * Parameters:
     * control - {<OpenLayers.Control>} 构建当前事件处理器的控件对象。
     * callbacks - {Object} 回调函数对象。关于回调的具体描述参见下文。
     * options - {Object} 一个可选对象，其属性将会赋值到事件处理器对象上。
     *
     * Named callbacks:
     * create - 当要素草图第一次创建的时候调用，回调函数需接收两个参数：当前点几何对象、当前要素。
     * modify - 顶点的每一次变化时调用，回调函数接受参数：几何点对象、当前要素。
     * done - 当绘制点操作完成时调用，回调函数接收一个参数，当前点的几何对象。
     * cancel - 绘制过程中关闭当前事件处理器的监听时调用，回调函数接收当前要素的几何对象作为参数。
     */
    initialize: function(control, callbacks, options) {
        OpenLayers.Handler.Plotting.prototype.initialize.apply(this, arguments);
    },

    /**
     * Method: createFeature
     * create temporary features
     *
     * Parameters:
     * pixel - {<OpenLayers.Pixel>} A pixel location on the map.
     */
    createFeature: function(pixel) {
        var lonlat = this.layer.getLonLatFromViewPortPx(pixel);
        var geometry = new OpenLayers.Geometry.Point(
            lonlat.lon, lonlat.lat
        );
        this.point = new OpenLayers.Feature.Vector(geometry);

        //标绘扩展符号的 Geometry 类型为 GeoMultiPointEx
        this.plotting = new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.GeoMultiPoint()
        );

        this.callback("create", [this.point.geometry, this.getSketch()]);
        this.point.geometry.clearBounds();
    },

    /**
     * APIMethod: down
     * Handle mousedown and touchstart.  Adjust the Geometry and redraw.
     * Return determines whether to propagate the event on the map.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    down: function(evt) {
        this.mouseDown = true;
        this.lastDown = evt.xy;
        this.isDrawing = true;
        if (!this.touch) {
            this.modifyFeature(evt.xy);
        }
        this.stoppedDown = this.stopDown;
        return !this.stopDown;
    },

    /**
     * Method: up
     * 操作 mouseup 和 touchend.
     * 发送最后一个 mouseup 点。
     *
     * Parameters:
     * evt - {Event} 浏览器事件，evt.xy 为最后一个 mouseup 的像素位置。
     *
     * Returns:
     * {Boolean} 是否允许事件继续在 map 上传送
     */
    up: function(evt) {
        this.mouseDown = false;
        this.stoppedDown = this.stopDown;

        //ignore double-clicks
        if (this.lastUp && this.lastUp.equals(evt.xy)) {
            return true;
        }
        if (this.lastDown && this.passesTolerance(this.lastDown, evt.xy, this.pixelTolerance)) {
            if (this.touch) {
                this.modifyFeature(evt.xy);
            }
            if (this.persist) {
                this.destroyPersistedFeature();
            }
            this.lastUp = evt.xy;

            this.addControlPoint(evt.xy);
            return true;
        } else {
            return true;
        }

    },

    /**
     * Method: dblclick
     * Handle double-clicks.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    dblclick: function(evt) {
        this.drawComplete();
        this.isDrawing = false;
        return false;
    },
    /**
     * Method: touchend
     * Handle touchend.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    touchstart: function(evt) {
        if (this.lastTouchPx && this.passesTolerance(this.lastTouchPx, evt.xy, this.pixelTolerance)) {
            evt.preventDefault();
            this.drawComplete();
            this.isDrawing = false;
            return false;
        }
        if (!this.touch) {
            this.touch = true;
            // unregister mouse listeners
            this.map.events.un({
                mousedown: this.mousedown,
                mouseup: this.mouseup,
                mousemove: this.mousemove,
                click: this.click,
                dblclick: this.dblclick,
                scope: this
            });
        }
        this.lastTouchPx = evt.xy;
        return this.down(evt);
    },
    /**
     * Method: touchend
     * Handle touchend.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    touchend: function(evt) {
        if (this.isDrawing) {
            evt.xy = this.lastTouchPx;
            return this.up(evt);
        }

    },

    CLASS_NAME: "OpenLayers.Handler.MultiPointEx"
});


/**
 * @requires OpenLayers/Handler/Plotting
 * @requires OpenLayers/Geometry/GeoArc
 */

/**
 * Class: OpenLayers.Handler.ArcEx
 * 在地图上绘制圆弧符号的事件处理器。
 * 绘制点在激活后显示，随着鼠标移动而移动，在鼠标第一次松开后开始绘制，在鼠标第二次松开后完成绘制。
 * 该处理器会触发标记为"done"、"cancel"和“modify"的事件回调。其中modify回调会在每一次变化时被调用并传入最近一次绘制的点。
 * 使用 <OpenLayers.Handler.ArcEx> 构造函数可以创建一个新的绘制圆弧符号的事件处理器实例。
 *
 * Inherits from:
 *  - <OpenLayers.Handler.Plotting>
 */
OpenLayers.Handler.ArcEx = OpenLayers.Class(OpenLayers.Handler.Plotting, {
    /**
     * Constructor: OpenLayers.Handler.ArcEx
     * 构造函数，创建一个新的绘制圆弧符号的事件处理器。
     *
     * Parameters:
     * control - {<OpenLayers.Control>} 构建当前事件处理器的控件对象。
     * callbacks - {Object} 回调函数对象。关于回调的具体描述参见下文。
     * options - {Object} 一个可选对象，其属性将会赋值到事件处理器对象上。
     *
     * Named callbacks:
     * create - 当要素草图第一次创建的时候调用，回调函数需接收两个参数：当前点几何对象、当前要素。
     * modify - 顶点的每一次变化时调用，回调函数接受参数：几何点对象、当前要素。
     * done - 当绘制点操作完成时调用，回调函数接收一个参数，当前点的几何对象。
     * cancel - 绘制过程中关闭当前事件处理器的监听时调用，回调函数接收当前要素的几何对象作为参数。
     */
    initialize: function(control, callbacks, options) {
        OpenLayers.Handler.Plotting.prototype.initialize.apply(this, arguments);
    },

    /**
     * Method: createFeature
     * create temporary features
     *
     * Parameters:
     * pixel - {<OpenLayers.Pixel>} A pixel location on the map.
     */
    createFeature: function(pixel) {
        var lonlat = this.layer.getLonLatFromViewPortPx(pixel);
        var geometry = new OpenLayers.Geometry.Point(
            lonlat.lon, lonlat.lat
        );
        this.point = new OpenLayers.Feature.Vector(geometry);

        //标绘扩展符号的 Geometry 类型为 GeoArcEx
        this.plotting = new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.GeoArc()
        );

        this.callback("create", [this.point.geometry, this.getSketch()]);
        this.point.geometry.clearBounds();
    },


    /**
     * Method: up
     * 操作 mouseup 和 touchend.
     * 发送最后一个 mouseup 点。
     *
     * Parameters:
     * evt - {Event} 浏览器事件，evt.xy 为最后一个 mouseup 的像素位置。
     *
     * Returns:
     * {Boolean} 是否允许事件继续在 map 上传送
     */
    up: function(evt) {
        this.mouseDown = false;
        this.stoppedDown = this.stopDown;

        //ignore double-clicks
        if (this.lastUp && this.lastUp.equals(evt.xy)) {
            return true;
        }

        if (this.lastDown && this.passesTolerance(this.lastDown, evt.xy, this.pixelTolerance)) {
            if (this.touch) {
                this.modifyFeature(evt.xy);
            }
            if (this.persist) {
                this.destroyPersistedFeature();
            }
            this.lastUp = evt.xy;

            this.addControlPoint(evt.xy);
            var len = this.controlPoints.length;
            if (len == 1 || len == 2) {
                this.isDrawing = true;
            } else if (len == 3) {
                this.isDrawing = false;
                this.drawComplete();
            }
            return true;
        } else {
            return true;
        }

    },


    CLASS_NAME: "OpenLayers.Handler.ArcEx"
});


/**
 * @requires OpenLayers/Handler/Plotting
 * @requires OpenLayers/Geometry/GeoBezierCurve2
 */

/**
 * Class: OpenLayers.Handler.BezierCurve2Ex
 * 在地图上绘制二次贝塞尔曲线的事件处理器。
 * 绘制点在激活后显示，随着鼠标移动而移动，在鼠标第一次松开后开始绘制，绘制第三个点后完成绘制。
 * 该处理器会触发标记为"done"、"cancel"和“modify"的事件回调。其中modify回调会在每一次变化时被调用并传入最近一次绘制的点。
 * 使用 <OpenLayers.Handler.BezierCurve2Ex> 构造函数可以创建一个新的绘制二次贝塞尔曲线的事件处理器实例。
 *
 * Inherits from:
 *  - <OpenLayers.Handler.Plotting>
 */
OpenLayers.Handler.BezierCurve2Ex = OpenLayers.Class(OpenLayers.Handler.Plotting, {
    /**
     * Constructor: OpenLayers.Handler.BezierCurve2Ex
     * 构造函数，创建一个新的绘制二次贝塞尔曲线的事件处理器。
     *
     * Parameters:
     * control - {<OpenLayers.Control>} 构建当前事件处理器的控件对象。
     * callbacks - {Object} 回调函数对象。关于回调的具体描述参见下文。
     * options - {Object} 一个可选对象，其属性将会赋值到事件处理器对象上。
     *
     * Named callbacks:
     * create - 当要素草图第一次创建的时候调用，回调函数需接收两个参数：当前点几何对象、当前要素。
     * modify - 顶点的每一次变化时调用，回调函数接受参数：几何点对象、当前要素。
     * done - 当绘制点操作完成时调用，回调函数接收一个参数，当前点的几何对象。
     * cancel - 绘制过程中关闭当前事件处理器的监听时调用，回调函数接收当前要素的几何对象作为参数。
     */
    initialize: function(control, callbacks, options) {
        OpenLayers.Handler.Plotting.prototype.initialize.apply(this, arguments);
    },

    /**
     * Method: createFeature
     * create temporary features
     *
     * Parameters:
     * pixel - {<OpenLayers.Pixel>} A pixel location on the map.
     */
    createFeature: function(pixel) {
        var lonlat = this.layer.getLonLatFromViewPortPx(pixel);
        var geometry = new OpenLayers.Geometry.Point(
            lonlat.lon, lonlat.lat
        );
        this.point = new OpenLayers.Feature.Vector(geometry);

        //标绘扩展符号的 Geometry 类型为 GeoCloseCurve
        this.plotting = new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.GeoBezierCurve2()
        );

        this.callback("create", [this.point.geometry, this.getSketch()]);
        this.point.geometry.clearBounds();
    },

    /**
     * Method: up
     * 操作 mouseup 和 touchend.
     * 发送最后一个 mouseup 点。
     *
     * Parameters:
     * evt - {Event} 浏览器事件，evt.xy 为最后一个 mouseup 的像素位置。
     *
     * Returns:
     * {Boolean} 是否允许事件继续在 map 上传送
     */
    up: function(evt) {
        this.mouseDown = false;
        this.stoppedDown = this.stopDown;

        //ignore double-clicks
        if (this.lastUp && this.lastUp.equals(evt.xy)) {
            return true;
        }

        if (this.lastDown && this.passesTolerance(this.lastDown, evt.xy, this.pixelTolerance)) {
            if (this.touch) {
                this.modifyFeature(evt.xy);
            }
            if (this.persist) {
                this.destroyPersistedFeature();
            }
            this.lastUp = evt.xy;

            this.addControlPoint(evt.xy);
            var len = this.controlPoints.length;
            if (len > 0 && len < 3) {
                this.isDrawing = true;
            } else if (len == 3) {
                this.drawComplete();
            }
            return true;
        } else {
            return true;
        }

    },


    CLASS_NAME: "OpenLayers.Handler.BezierCurve2Ex"
});


/**
 * @requires OpenLayers/Handler/Plotting
 * @requires OpenLayers/Geometry/GeoBezierCurve3
 */

/**
 * Class: OpenLayers.Handler.BezierCurve3Ex
 * 在地图上绘制三次贝塞尔曲线的事件处理器。
 * 绘制点在激活后显示，随着鼠标移动而移动，在鼠标第一次松开后开始绘制，绘制第四个点后完成绘制。
 * 该处理器会触发标记为"done"、"cancel"和“modify"的事件回调。其中modify回调会在每一次变化时被调用并传入最近一次绘制的点。
 * 使用 <OpenLayers.Handler.BezierCurve3Ex> 构造函数可以创建一个新的绘制三次贝塞尔曲线的事件处理器实例。
 *
 * Inherits from:
 *  - <OpenLayers.Handler.Plotting>
 
 */
OpenLayers.Handler.BezierCurve3Ex = OpenLayers.Class(OpenLayers.Handler.Plotting, {
    /**
     * Constructor: OpenLayers.Handler.BezierCurve3Ex
     * 构造函数，创建一个新的绘制三次贝塞尔曲线的事件处理器。
     *
     * Parameters:
     * control - {<OpenLayers.Control>} 构建当前事件处理器的控件对象。
     * callbacks - {Object} 回调函数对象。关于回调的具体描述参见下文。
     * options - {Object} 一个可选对象，其属性将会赋值到事件处理器对象上。
     *
     * Named callbacks:
     * create - 当要素草图第一次创建的时候调用，回调函数需接收两个参数：当前点几何对象、当前要素。
     * modify - 顶点的每一次变化时调用，回调函数接受参数：几何点对象、当前要素。
     * done - 当绘制点操作完成时调用，回调函数接收一个参数，当前点的几何对象。
     * cancel - 绘制过程中关闭当前事件处理器的监听时调用，回调函数接收当前要素的几何对象作为参数。
     */
    initialize: function(control, callbacks, options) {
        OpenLayers.Handler.Plotting.prototype.initialize.apply(this, arguments);
    },

    /**
     * Method: createFeature
     * create temporary features
     *
     * Parameters:
     * pixel - {<OpenLayers.Pixel>} A pixel location on the map.
     */
    createFeature: function(pixel) {
        var lonlat = this.layer.getLonLatFromViewPortPx(pixel);
        var geometry = new OpenLayers.Geometry.Point(
            lonlat.lon, lonlat.lat
        );
        this.point = new OpenLayers.Feature.Vector(geometry);

        //标绘扩展符号的 Geometry 类型为 GeoCloseCurve
        this.plotting = new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.GeoBezierCurve3()
        );

        this.callback("create", [this.point.geometry, this.getSketch()]);
        this.point.geometry.clearBounds();
    },


    /**
     * Method: up
     * 操作 mouseup 和 touchend.
     * 发送最后一个 mouseup 点。
     *
     * Parameters:
     * evt - {Event} 浏览器事件，evt.xy 为最后一个 mouseup 的像素位置。
     *
     * Returns:
     * {Boolean} 是否允许事件继续在 map 上传送
     */
    up: function(evt) {
        this.mouseDown = false;
        this.stoppedDown = this.stopDown;

        //ignore double-clicks
        if (this.lastUp && this.lastUp.equals(evt.xy)) {
            return true;
        }

        if (this.lastDown && this.passesTolerance(this.lastDown, evt.xy, this.pixelTolerance)) {
            if (this.touch) {
                this.modifyFeature(evt.xy);
            }
            if (this.persist) {
                this.destroyPersistedFeature();
            }
            this.lastUp = evt.xy;

            this.addControlPoint(evt.xy);
            var len = this.controlPoints.length;
            if (len > 0 && len < 4) {
                this.isDrawing = true;
            } else if (len == 4) {
                this.drawComplete();
            }
            return true;
        } else {
            return true;
        }

    },

    CLASS_NAME: "OpenLayers.Handler.BezierCurve3Ex"
});


/**
 * @requires OpenLayers/Handler/Plotting
 * @requires OpenLayers/Geometry/GeoBezierCurveN
 */

/**
 * Class: OpenLayers.Handler.BezierCurveNEx
 * 在地图上绘制N次贝塞尔曲线的事件处理器。
 * 绘制点在激活后显示，随着鼠标移动而移动，在鼠标第一次松开后开始绘，双击后完成绘制。
 * 该处理器会触发标记为"done"、"cancel"和“modify"的事件回调。其中modify回调会在每一次变化时被调用并传入最近一次绘制的点。
 * 使用 <OpenLayers.Handler.BezierCurveNEx> 构造函数可以创建一个新的绘制N次贝塞尔曲线的事件处理器实例。
 *
 * Inherits from:
 *  - <OpenLayers.Handler.Plotting>
 
 */
OpenLayers.Handler.BezierCurveNEx = OpenLayers.Class(OpenLayers.Handler.Plotting, {
    /**
     * Constructor: OpenLayers.Handler.BezierCurveNEx
     * 构造函数，创建一个新的绘制N次贝塞尔曲线的事件处理器。
     *
     * Parameters:
     * control - {<OpenLayers.Control>} 构建当前事件处理器的控件对象。
     * callbacks - {Object} 回调函数对象。关于回调的具体描述参见下文。
     * options - {Object} 一个可选对象，其属性将会赋值到事件处理器对象上。
     *
     * Named callbacks:
     * create - 当要素草图第一次创建的时候调用，回调函数需接收两个参数：当前点几何对象、当前要素。
     * modify - 顶点的每一次变化时调用，回调函数接受参数：几何点对象、当前要素。
     * done - 当绘制点操作完成时调用，回调函数接收一个参数，当前点的几何对象。
     * cancel - 绘制过程中关闭当前事件处理器的监听时调用，回调函数接收当前要素的几何对象作为参数。
     */
    initialize: function(control, callbacks, options) {
        OpenLayers.Handler.Plotting.prototype.initialize.apply(this, arguments);
    },

    /**
     * Method: createFeature
     * create temporary features
     *
     * Parameters:
     * pixel - {<OpenLayers.Pixel>} A pixel location on the map.
     */
    createFeature: function(pixel) {
        var lonlat = this.layer.getLonLatFromViewPortPx(pixel);
        var geometry = new OpenLayers.Geometry.Point(
            lonlat.lon, lonlat.lat
        );
        this.point = new OpenLayers.Feature.Vector(geometry);

        //标绘扩展符号的 Geometry 类型为 GeoCloseCurve
        this.plotting = new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.GeoBezierCurveN()
        );

        this.callback("create", [this.point.geometry, this.getSketch()]);
        this.point.geometry.clearBounds();
    },

    /**
     * Method: up
     * 操作 mouseup 和 touchend.
     * 发送最后一个 mouseup 点。
     *
     * Parameters:
     * evt - {Event} 浏览器事件，evt.xy 为最后一个 mouseup 的像素位置。
     *
     * Returns:
     * {Boolean} 是否允许事件继续在 map 上传送
     */
    up: function(evt) {
        this.mouseDown = false;
        this.stoppedDown = this.stopDown;

        //ignore double-clicks
        if (this.lastUp && this.lastUp.equals(evt.xy)) {
            return true;
        }

        if (this.lastDown && this.passesTolerance(this.lastDown, evt.xy, this.pixelTolerance)) {
            if (this.touch) {
                this.modifyFeature(evt.xy);
            }
            if (this.persist) {
                this.destroyPersistedFeature();
            }
            this.lastUp = evt.xy;

            this.addControlPoint(evt.xy);
            var len = this.controlPoints.length;
            if (len > 0) {
                this.isDrawing = true;
            }
            return true;
        } else {
            return true;
        }

    },

    /**
     * Method: dblclick
     * Handle double-clicks.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    dblclick: function(evt) {
        this.drawComplete();
        return false;
    },

    /**
     * Method: touchstart
     * Handle touchstart.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    touchstart: function(evt) {
        if (this.lastTouchPx && this.passesTolerance(this.lastTouchPx, evt.xy, this.pixelTolerance)) {
            evt.preventDefault();
            this.drawComplete();
            this.isDrawing = false;
            return false;
        }
        if (!this.touch) {
            this.touch = true;
            // unregister mouse listeners
            this.map.events.un({
                mousedown: this.mousedown,
                mouseup: this.mouseup,
                mousemove: this.mousemove,
                click: this.click,
                dblclick: this.dblclick,
                scope: this
            });
        }
        this.lastTouchPx = evt.xy;
        return this.down(evt);
    },
    /**
     * APIMethod: down
     * Handle mousedown and touchstart.  Adjust the Geometry and redraw.
     * Return determines whether to propagate the event on the map.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    down: function(evt) {
        this.mouseDown = true;
        this.lastDown = evt.xy;
        this.isDrawing = true;
        if (!this.touch) {
            this.modifyFeature(evt.xy);
        }
        this.stoppedDown = this.stopDown;
        return !this.stopDown;
    },

    /**
     * Method: touchend
     * Handle touchend.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    touchend: function(evt) {
        if (this.isDrawing) {
            evt.xy = this.lastTouchPx;
            return this.up(evt);
        }

    },

    CLASS_NAME: "OpenLayers.Handler.BezierCurveNEx"
});


/**
 * @requires OpenLayers/Handler/Plotting
 * @requires OpenLayers/Geometry/GeoCardinalCurve
 */

/**
 * Class: OpenLayers.Handler.CardinalCurveEx
 * 在地图上绘制Cardinal曲线的事件处理器。
 * 绘制点在激活后显示，随着鼠标移动而移动，在鼠标第一次松开后开始绘制，双击后完成绘制。
 * 该处理器会触发标记为"done"、"cancel"和“modify"的事件回调。其中modify回调会在每一次变化时被调用并传入最近一次绘制的点。
 * 使用 <OpenLayers.Handler.CardinalCurveEx> 构造函数可以创建一个新的绘制Cardinal曲线的事件处理器实例。
 *
 * Inherits from:
 *  - <OpenLayers.Handler.Plotting>
 */
OpenLayers.Handler.CardinalCurveEx = OpenLayers.Class(OpenLayers.Handler.Plotting, {
    /**
     * Constructor: OpenLayers.Handler.CardinalCurveEx
     * 构造函数，创建一个新的绘制Cardinal曲线的事件处理器。
     *
     * Parameters:
     * control - {<OpenLayers.Control>} 构建当前事件处理器的控件对象。
     * callbacks - {Object} 回调函数对象。关于回调的具体描述参见下文。
     * options - {Object} 一个可选对象，其属性将会赋值到事件处理器对象上。
     *
     * Named callbacks:
     * create - 当要素草图第一次创建的时候调用，回调函数需接收两个参数：当前点几何对象、当前要素。
     * modify - 顶点的每一次变化时调用，回调函数接受参数：几何点对象、当前要素。
     * done - 当绘制点操作完成时调用，回调函数接收一个参数，当前点的几何对象。
     * cancel - 绘制过程中关闭当前事件处理器的监听时调用，回调函数接收当前要素的几何对象作为参数。
     */
    initialize: function(control, callbacks, options) {
        OpenLayers.Handler.Plotting.prototype.initialize.apply(this, arguments);
    },

    /**
     * Method: createFeature
     * create temporary features
     *
     * Parameters:
     * pixel - {<OpenLayers.Pixel>} A pixel location on the map.
     */
    createFeature: function(pixel) {
        var lonlat = this.layer.getLonLatFromViewPortPx(pixel);
        var geometry = new OpenLayers.Geometry.Point(
            lonlat.lon, lonlat.lat
        );
        this.point = new OpenLayers.Feature.Vector(geometry);

        //标绘扩展符号的 Geometry 类型为 GeoCardinalCurve
        this.plotting = new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.GeoCardinalCurve()
        );

        this.callback("create", [this.point.geometry, this.getSketch()]);
        this.point.geometry.clearBounds();
    },

    /**
     * Method: up
     * 操作 mouseup 和 touchend.
     * 发送最后一个 mouseup 点。
     *
     * Parameters:
     * evt - {Event} 浏览器事件，evt.xy 为最后一个 mouseup 的像素位置。
     *
     * Returns:
     * {Boolean} 是否允许事件继续在 map 上传送
     */
    up: function(evt) {
        this.mouseDown = false;
        this.stoppedDown = this.stopDown;

        //ignore double-clicks
        if (this.lastUp && this.lastUp.equals(evt.xy)) {
            return true;
        }

        if (this.lastDown && this.passesTolerance(this.lastDown, evt.xy, this.pixelTolerance)) {
            if (this.touch) {
                this.modifyFeature(evt.xy);
            }
            if (this.persist) {
                this.destroyPersistedFeature();
            }
            this.lastUp = evt.xy;

            this.addControlPoint(evt.xy);
            var len = this.controlPoints.length;
            if (len >= 1) {
                this.isDrawing = true;
            }

            return true;
        } else {
            return true;
        }

    },

    /**
     * Method: dblclick
     * Handle double-clicks.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    dblclick: function(evt) {
        this.drawComplete();
        return false;
    },

    /**
     * Method: touchstart
     * Handle touchstart.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    touchstart: function(evt) {
        if (this.lastTouchPx && this.passesTolerance(this.lastTouchPx, evt.xy, this.pixelTolerance)) {
            evt.preventDefault();
            this.drawComplete();
            this.isDrawing = false;
            return false;
        }
        if (!this.touch) {
            this.touch = true;
            // unregister mouse listeners
            this.map.events.un({
                mousedown: this.mousedown,
                mouseup: this.mouseup,
                mousemove: this.mousemove,
                click: this.click,
                dblclick: this.dblclick,
                scope: this
            });
        }
        this.lastTouchPx = evt.xy;
        return this.down(evt);
    },
    /**
     * APIMethod: down
     * Handle mousedown and touchstart.  Adjust the Geometry and redraw.
     * Return determines whether to propagate the event on the map.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    down: function(evt) {
        this.mouseDown = true;
        this.lastDown = evt.xy;
        this.isDrawing = true;
        if (!this.touch) {
            this.modifyFeature(evt.xy);
        }
        this.stoppedDown = this.stopDown;
        return !this.stopDown;
    },

    /**
     * Method: touchend
     * Handle touchend.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    touchend: function(evt) {
        if (this.isDrawing) {
            evt.xy = this.lastTouchPx;
            return this.up(evt);
        }

    },
    CLASS_NAME: "OpenLayers.Handler.CardinalCurveEx"
});


/**
 * @requires OpenLayers/Handler/Plotting
 * @requires OpenLayers/Geometry/GeoFreeline
 */

/**
 * Class: OpenLayers.Handler.FreelineEx
 * 在地图上绘制自由线的事件处理器。
 * 绘制点在激活后显示，在鼠标第一次松开后开始绘制，且随着鼠标移动而绘制，双击后完成绘制。
 * 该处理器会触发标记为"done"、"cancel"和“modify"的事件回调。其中modify回调会在每一次变化时被调用并传入最近一次绘制的点。
 * 使用 <OpenLayers.Handler.FreelineEx> 构造函数可以创建一个新的绘制自由线的事件处理器实例。
 *
 * Inherits from:
 *  - <OpenLayers.Handler.Plotting>
 
 */
OpenLayers.Handler.FreelineEx = OpenLayers.Class(OpenLayers.Handler.Plotting, {
    /**
     * Constructor: OpenLayers.Handler.FreelineEx
     * 构造函数，创建一个新的绘制自由线的事件处理器。
     *
     * Parameters:
     * control - {<OpenLayers.Control>} 构建当前事件处理器的控件对象。
     * callbacks - {Object} 回调函数对象。关于回调的具体描述参见下文。
     * options - {Object} 一个可选对象，其属性将会赋值到事件处理器对象上。
     *
     * Named callbacks:
     * create - 当要素草图第一次创建的时候调用，回调函数需接收两个参数：当前点几何对象、当前要素。
     * modify - 顶点的每一次变化时调用，回调函数接受参数：几何点对象、当前要素。
     * done - 当绘制点操作完成时调用，回调函数接收一个参数，当前点的几何对象。
     * cancel - 绘制过程中关闭当前事件处理器的监听时调用，回调函数接收当前要素的几何对象作为参数。
     */
    initialize: function(control, callbacks, options) {
        OpenLayers.Handler.Plotting.prototype.initialize.apply(this, arguments);
    },

    /**
     * Method: createFeature
     * create temporary features
     *
     * Parameters:
     * pixel - {<OpenLayers.Pixel>} A pixel location on the map.
     */
    createFeature: function(pixel) {
        var lonlat = this.layer.getLonLatFromViewPortPx(pixel);
        var geometry = new OpenLayers.Geometry.Point(
            lonlat.lon, lonlat.lat
        );
        this.point = new OpenLayers.Feature.Vector(geometry);

        //标绘扩展符号的 Geometry 类型为 GeoFreeline
        this.plotting = new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.GeoFreeline()
        );

        this.callback("create", [this.point.geometry, this.getSketch()]);
        this.point.geometry.clearBounds();
    },

    /**
     * Method: up
     * 操作 mouseup 和 touchend.
     * 发送最后一个 mouseup 点。
     *
     * Parameters:
     * evt - {Event} 浏览器事件，evt.xy 为最后一个 mouseup 的像素位置。
     *
     * Returns:
     * {Boolean} 是否允许事件继续在 map 上传送
     */
    up: function(evt) {
        this.mouseDown = false;
        this.stoppedDown = this.stopDown;

        //ignore double-clicks
        if (this.lastUp && this.lastUp.equals(evt.xy)) {
            return true;
        }

        if (this.lastDown && this.passesTolerance(this.lastDown, evt.xy, this.pixelTolerance)) {
            if (this.touch) {
                this.modifyFeature(evt.xy);
            }
            if (this.persist) {
                this.destroyPersistedFeature();
            }
            this.lastUp = evt.xy;

            this.addControlPoint(evt.xy);
            var len = this.controlPoints.length;
            if (len >= 1) {
                this.isDrawing = true;
            }

            return true;
        } else {
            return true;
        }

    },
    /**
     * Method: touchstart
     * Handle touchstart.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    touchstart: function(evt) {
        if (!this.touch) {
            this.touch = true;
            // unregister mouse listeners
            this.map.events.un({
                mousedown: this.mousedown,
                mouseup: this.mouseup,
                mousemove: this.mousemove,
                click: this.click,
                dblclick: this.dblclick,
                scope: this
            });
        }
        this.map.isIESingleTouch = false;
        this.modifyFeature(evt.xy);
        if (this.persist) {
            this.destroyPersistedFeature();
        }
        this.addControlPoint(evt.xy);
        var len = this.controlPoints.length;
        if (len >= 1) {
            this.isDrawing = true;
        }
        return true;
    },
    /**
     * Method: touchmove
     * Handle touchmove.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    touchmove: function(evt) {
        this.lastTouchPx = evt.xy;
        this.modifyFeature(evt.xy);
        return true;
    },
    /**
     * APIMethod: modifyFeature
     * 绘制过程中修改标绘扩展符号形状。
     * 根据已添加的控制点和由当前鼠标位置作为的一个控制点绘制符号。
     * 重写父类的方法
     *
     * Parameters:
     * pixel - {<OpenLayers.Pixel>} 鼠标在地图上的当前像素位置
     */
    modifyFeature: function(pixel) {
        //忽略Chrome mouseup触发瞬间 mousemove 产生的相同点
        if (this.lastUp && this.lastUp.equals(pixel)) {
            return true;
        }

        //新建标绘扩展符号
        if (!this.point || !this.plotting) {
            this.createFeature(pixel);
        }

        //修改临时点的位置（鼠标位置）
        var lonlat = this.layer.getLonLatFromViewPortPx(pixel);
        this.point.geometry.x = lonlat.lon;
        this.point.geometry.y = lonlat.lat;

        if (this.isDrawing == true) {
            this.addControlPoint(pixel);

            var cp = this.controlPoints;
            //重新设置标绘扩展符号的控制点
            this.plotting.geometry._controlPoints = this.cloneControlPoints(cp);
            //重新计算标绘扩展符号的geometry
            this.plotting.geometry.calculateParts();
        }

        this.callback("modify", [this.point.geometry, this.getSketch(), false]);
        this.point.geometry.clearBounds();
        this.drawFeature();
    },


    /**
     * Method: dblclick
     * Handle double-clicks.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    dblclick: function(evt) {

        this.drawComplete();
        return false;
    },

    /**
     * Method: touchend
     * Handle touchend.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    touchend: function(evt) {
        this.drawComplete();
        this.map.isIESingleTouch = true;
        return false;
    },

    CLASS_NAME: "OpenLayers.Handler.FreelineEx"
});


/**
 * @requires OpenLayers/Handler/Plotting
 * @requires OpenLayers/Geometry/GeoPolyline
 */

/**
 * Class: OpenLayers.Handler.PolyLineEx
 * 在地图上绘制折线的事件处理器。
 * 绘制点在激活后显示，随着鼠标移动而移动，在鼠标第一次松开后开始绘制，双击后完成绘制。
 * 该处理器会触发标记为"done"、"cancel"和“modify"的事件回调。其中modify回调会在每一次变化时被调用并传入最近一次绘制的点。
 * 使用 <OpenLayers.Handler.PolyLineEx> 构造函数可以创建一个新的绘制折线的事件处理器实例。
 *
 * Inherits from:
 *  - <OpenLayers.Handler.Plotting>
 */
OpenLayers.Handler.PolyLineEx = OpenLayers.Class(OpenLayers.Handler.Plotting, {
    /**
     * Constructor: OpenLayers.Handler.PolyLineEx
     * 构造函数，创建一个新的绘制折线的事件处理器。
     *
     * Parameters:
     * control - {<OpenLayers.Control>} 构建当前事件处理器的控件对象。
     * callbacks - {Object} 回调函数对象。关于回调的具体描述参见下文。
     * options - {Object} 一个可选对象，其属性将会赋值到事件处理器对象上。
     *
     * Named callbacks:
     * create - 当要素草图第一次创建的时候调用，回调函数需接收两个参数：当前点几何对象、当前要素。
     * modify - 顶点的每一次变化时调用，回调函数接受参数：几何点对象、当前要素。
     * done - 当绘制点操作完成时调用，回调函数接收一个参数，当前点的几何对象。
     * cancel - 绘制过程中关闭当前事件处理器的监听时调用，回调函数接收当前要素的几何对象作为参数。
     */
    initialize: function(control, callbacks, options) {
        OpenLayers.Handler.Plotting.prototype.initialize.apply(this, arguments);
    },

    /**
     * Method: createFeature
     * create temporary features
     *
     * Parameters:
     * pixel - {<OpenLayers.Pixel>} A pixel location on the map.
     */
    createFeature: function(pixel) {
        var lonlat = this.layer.getLonLatFromViewPortPx(pixel);
        var geometry = new OpenLayers.Geometry.Point(
            lonlat.lon, lonlat.lat
        );
        this.point = new OpenLayers.Feature.Vector(geometry);

        //标绘扩展符号的 Geometry 类型为 GeoCloseCurve
        this.plotting = new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.GeoPolyline()
        );

        this.callback("create", [this.point.geometry, this.getSketch()]);
        this.point.geometry.clearBounds();
    },

    /**
     * Method: up
     * 操作 mouseup 和 touchend.
     * 发送最后一个 mouseup 点。
     *
     * Parameters:
     * evt - {Event} 浏览器事件，evt.xy 为最后一个 mouseup 的像素位置。
     *
     * Returns:
     * {Boolean} 是否允许事件继续在 map 上传送
     */
    up: function(evt) {
        this.mouseDown = false;
        this.stoppedDown = this.stopDown;

        //ignore double-clicks
        if (this.lastUp && this.lastUp.equals(evt.xy)) {
            return true;
        }

        if (this.lastDown && this.passesTolerance(this.lastDown, evt.xy, this.pixelTolerance)) {
            if (this.touch) {
                this.modifyFeature(evt.xy);
            }
            if (this.persist) {
                this.destroyPersistedFeature();
            }
            this.lastUp = evt.xy;

            this.addControlPoint(evt.xy);
            var len = this.controlPoints.length;
            if (len >= 1) {
                this.isDrawing = true;
            }

            return true;
        } else {
            return true;
        }

    },

    /**
     * Method: dblclick
     * Handle double-clicks.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    dblclick: function(evt) {
        this.drawComplete();
        return false;
    },
    /**
     * Method: touchstart
     * Handle touchstart.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    touchstart: function(evt) {
        if (this.lastTouchPx && this.passesTolerance(this.lastTouchPx, evt.xy, this.pixelTolerance)) {
            evt.preventDefault();
            this.drawComplete();
            this.isDrawing = false;
            return false;
        }
        if (!this.touch) {
            this.touch = true;
            // unregister mouse listeners
            this.map.events.un({
                mousedown: this.mousedown,
                mouseup: this.mouseup,
                mousemove: this.mousemove,
                click: this.click,
                dblclick: this.dblclick,
                scope: this
            });
        }
        this.lastTouchPx = evt.xy;
        return this.down(evt);
    },
    /**
     * APIMethod: down
     * Handle mousedown and touchstart.  Adjust the Geometry and redraw.
     * Return determines whether to propagate the event on the map.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    down: function(evt) {
        this.mouseDown = true;
        this.lastDown = evt.xy;
        this.isDrawing = true;
        if (!this.touch) {
            this.modifyFeature(evt.xy);
        }
        this.stoppedDown = this.stopDown;
        return !this.stopDown;
    },

    /**
     * Method: touchend
     * Handle touchend.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    touchend: function(evt) {
        if (this.isDrawing) {
            evt.xy = this.lastTouchPx;
            return this.up(evt);
        }

    },
    CLASS_NAME: "OpenLayers.Handler.PolyLineEx"
});


/**
 * @requires OpenLayers/Handler/Plotting.js
 * @requires OpenLayers/Geometry/Polygon/GeoCircle.js
 */

/**
 * Class: OpenLayers.Handler.GeoCircle
 * 在地图上绘制圆的事件处理器。
 * 绘制点在激活后显示，随着鼠标移动而移动，在鼠标第一次松开后开始绘制，在鼠标第二次松开后完成绘制。
 * 该处理器会触发标记为"done"、"cancel"和“modify"的事件回调。其中modify回调会在每一次变化时被调用并传入最近一次绘制的点。
 * 使用 <OpenLayers.Handler.GeoCircle> 构造函数可以创建一个新的绘制圆的事件处理器实例。
 *
 * Inherits from:
 *  - <OpenLayers.Handler.Plotting>
 */
OpenLayers.Handler.CircleEx = OpenLayers.Class(OpenLayers.Handler.Plotting, {
    /**
     * Constructor: OpenLayers.Handler.CircleEx
     * 构造函数，创建一个新的绘制圆的事件处理器。
     *
     * Parameters:
     * control - {<OpenLayers.Control>} 构建当前事件处理器的控件对象。
     * callbacks - {Object} 回调函数对象。关于回调的具体描述参见下文。
     * options - {Object} 一个可选对象，其属性将会赋值到事件处理器对象上。
     *
     * Named callbacks:
     * create - 当要素草图第一次创建的时候调用，回调函数需接收两个参数：当前点几何对象、当前要素。
     * modify - 顶点的每一次变化时调用，回调函数接受参数：几何点对象、当前要素。
     * done - 当绘制点操作完成时调用，回调函数接收一个参数，当前点的几何对象。
     * cancel - 绘制过程中关闭当前事件处理器的监听时调用，回调函数接收当前要素的几何对象作为参数。
     */
    initialize: function(control, callbacks, options) {
        OpenLayers.Handler.Plotting.prototype.initialize.apply(this, arguments);
    },

    /**
     * Method: createFeature
     * create temporary features
     *
     * Parameters:
     * pixel - {<OpenLayers.Pixel>} A pixel location on the map.
     */
    createFeature: function(pixel) {
        var lonlat = this.layer.getLonLatFromViewPortPx(pixel);
        var geometry = new OpenLayers.Geometry.Point(
            lonlat.lon, lonlat.lat
        );
        this.point = new OpenLayers.Feature.Vector(geometry);

        //标绘扩展符号的 Geometry 类型为 GeoCircle
        this.plotting = new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.GeoCircle()
        );

        this.callback("create", [this.point.geometry, this.getSketch()]);
        this.point.geometry.clearBounds();
    },

    /**
     * Method: destroyPersistedFeature
     * Destroy the persisted feature.
     */
    destroyPersistedFeature: function() {
        var layer = this.layer;
        if (layer && layer.features.length > 1) {
            this.layer.features[0].destroy();
        }
    },

    /**
     * Method: up
     * 操作 mouseup 和 touchend.
     * 发送最后一个 mouseup 点。
     *
     * Parameters:
     * evt - {Event} 浏览器事件，evt.xy 为最后一个 mouseup 的像素位置。
     *
     * Returns:
     * {Boolean} 是否允许事件继续在 map 上传送
     */
    up: function(evt) {
        this.mouseDown = false;
        this.stoppedDown = this.stopDown;

        // ignore double-clicks
        if (this.lastUp && this.lastUp.equals(evt.xy)) {
            return true;
        }

        if (this.lastDown && this.passesTolerance(this.lastDown, evt.xy, this.pixelTolerance)) {
            if (this.touch) {
                this.modifyFeature(evt.xy);
            }
            if (this.persist) {
                this.destroyPersistedFeature();
            }
            this.lastUp = evt.xy;

            this.addControlPoint(evt.xy);
            var len = this.controlPoints.length;
            if (len == 1) {
                this.isDrawing = true;
            } else if (len == 2) {
                this.drawComplete();
            }

            return true;
        } else {
            return true;
        }
    },

    /**
     * Method: touchstart
     * Handle touchstart.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    touchstart: function(evt) {
        if (!this.touch) {
            this.touch = true;
            // unregister mouse listeners
            this.map.events.un({
                mousedown: this.mousedown,
                mouseup: this.mouseup,
                mousemove: this.mousemove,
                click: this.click,
                dblclick: this.dblclick,
                scope: this
            });
        }
        this.map.isIESingleTouch = false;
        this.modifyFeature(evt.xy);
        if (this.persist) {
            this.destroyPersistedFeature();
        }
        this.addControlPoint(evt.xy);
        var len = this.controlPoints.length;
        if (len >= 1) {
            this.isDrawing = true;
        }
        return true;
    },
    /**
     * Method: touchend
     * Handle touchend.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    touchend: function(evt) {
        this.drawComplete();
        this.map.isIESingleTouch = true;
        return false;
    },
    /**
     * Method: touchmove
     * Handle touchmove.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    touchmove: function(evt) {
        this.lastTouchPx = evt.xy;
        this.modifyFeature(evt.xy);
        return true;
    },
    CLASS_NAME: "OpenLayers.Handler.CircleEx"
});


/**
 * @requires OpenLayers/Handler/Plotting.js
 * @requires OpenLayers/Geometry/Polygon/GeoCloseCurve.js
 */

/**
 * Class: OpenLayers.Handler.CloseCurve
 * 在地图上绘制闭合曲线的事件处理器。
 * 绘制点在激活后显示，随着鼠标移动而移动，在鼠标第一次松开后开始绘制，所绘制的控制点不小于3个，双击后完成绘制。
 * 该处理器会触发标记为"done"、"cancel"和“modify"的事件回调。其中modify回调会在每一次变化时被调用并传入最近一次绘制的点。
 * 使用 <OpenLayers.Handler.CloseCurve> 构造函数可以创建一个新的绘制闭合曲线的事件处理器实例。
 *
 * Inherits from:
 *  - <OpenLayers.Handler.Plotting>
 
 */
OpenLayers.Handler.CloseCurve = OpenLayers.Class(OpenLayers.Handler.Plotting, {
    /**
     * Constructor: OpenLayers.Handler.CloseCurve
     * 构造函数，创建一个新的绘制闭合曲线的事件处理器。
     *
     * Parameters:
     * control - {<OpenLayers.Control>} 构建当前事件处理器的控件对象。
     * callbacks - {Object} 回调函数对象。关于回调的具体描述参见下文。
     * options - {Object} 一个可选对象，其属性将会赋值到事件处理器对象上。
     *
     * Named callbacks:
     * create - 当要素草图第一次创建的时候调用，回调函数需接收两个参数：当前点几何对象、当前要素。
     * modify - 顶点的每一次变化时调用，回调函数接受参数：几何点对象、当前要素。
     * done - 当绘制点操作完成时调用，回调函数接收一个参数，当前点的几何对象。
     * cancel - 绘制过程中关闭当前事件处理器的监听时调用，回调函数接收当前要素的几何对象作为参数。
     */
    initialize: function(control, callbacks, options) {
        OpenLayers.Handler.Plotting.prototype.initialize.apply(this, arguments);
    },

    /**
     * Method: createFeature
     * create temporary features
     *
     * Parameters:
     * pixel - {<OpenLayers.Pixel>} A pixel location on the map.
     */
    createFeature: function(pixel) {
        var lonlat = this.layer.getLonLatFromViewPortPx(pixel);
        var geometry = new OpenLayers.Geometry.Point(
            lonlat.lon, lonlat.lat
        );
        this.point = new OpenLayers.Feature.Vector(geometry);

        //标绘扩展符号的 Geometry 类型为 GeoCloseCurve
        this.plotting = new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.GeoCloseCurve()
        );

        this.callback("create", [this.point.geometry, this.getSketch()]);
        this.point.geometry.clearBounds();
    },

    /**
     * Method: destroyPersistedFeature
     * Destroy the persisted feature.
     */
    destroyPersistedFeature: function() {
        var layer = this.layer;
        if (layer && layer.features.length > 1) {
            this.layer.features[0].destroy();
        }
    },

    /**
     * Method: up
     * 操作 mouseup 和 touchend.
     * 发送最后一个 mouseup 点。
     *
     * Parameters:
     * evt - {Event} 浏览器事件，evt.xy 为最后一个 mouseup 的像素位置。
     *
     * Returns:
     * {Boolean} 是否允许事件继续在 map 上传送
     */
    up: function(evt) {
        this.mouseDown = false;
        this.stoppedDown = this.stopDown;

        //ignore double-clicks
        if (this.lastUp && this.lastUp.equals(evt.xy)) {
            return true;
        }

        if (this.lastDown && this.passesTolerance(this.lastDown, evt.xy, this.pixelTolerance)) {
            if (this.touch) {
                this.modifyFeature(evt.xy);
            }
            if (this.persist) {
                this.destroyPersistedFeature();
            }
            this.lastUp = evt.xy;

            this.addControlPoint(evt.xy);
            var len = this.controlPoints.length;
            if (len >= 1) {
                this.isDrawing = true;
            }

            return true;
        } else {
            return true;
        }

    },

    /**
     * Method: dblclick
     * Handle double-clicks.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    dblclick: function(evt) {
        this.drawComplete();
        return false;
    },

    /**
     * Method: touchstart
     * Handle touchstart.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    touchstart: function(evt) {
        if (this.lastTouchPx && this.passesTolerance(this.lastTouchPx, evt.xy, this.pixelTolerance)) {
            evt.preventDefault();
            this.drawComplete();
            this.isDrawing = false;
            return false;
        }
        if (!this.touch) {
            this.touch = true;
            // unregister mouse listeners
            this.map.events.un({
                mousedown: this.mousedown,
                mouseup: this.mouseup,
                mousemove: this.mousemove,
                click: this.click,
                dblclick: this.dblclick,
                scope: this
            });
        }
        this.lastTouchPx = evt.xy;
        return this.down(evt);
    },
    /**
     * APIMethod: down
     * Handle mousedown and touchstart.  Adjust the Geometry and redraw.
     * Return determines whether to propagate the event on the map.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    down: function(evt) {
        this.mouseDown = true;
        this.lastDown = evt.xy;
        this.isDrawing = true;
        if (!this.touch) {
            this.modifyFeature(evt.xy);
        }
        this.stoppedDown = this.stopDown;
        return !this.stopDown;
    },

    /**
     * Method: touchend
     * Handle touchend.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    touchend: function(evt) {
        if (this.isDrawing) {
            evt.xy = this.lastTouchPx;
            return this.up(evt);
        }

    },
    CLASS_NAME: "OpenLayers.Handler.CloseCurve"
});


/**
 * @requires OpenLayers/Handler/Plotting.js
 * @requires OpenLayers/Geometry/Polygon/GeoEllipse.js
 */

/**
 * Class: OpenLayers.Handler.GeoEllipse
 * 在地图上绘制椭圆的事件处理器。
 * 绘制点在激活后显示，随着鼠标移动而移动，在鼠标第一次松开后开始绘制，在鼠标第二次松开后完成绘制。
 * 该处理器会触发标记为"done"、"cancel"和“modify"的事件回调。其中modify回调会在每一次变化时被调用并传入最近一次绘制的点。
 * 使用 <OpenLayers.Handler.GeoEllipse> 构造函数可以创建一个新的绘制圆的事件处理器实例。
 *
 * Inherits from:
 *  - <OpenLayers.Handler.Plotting>
 
 */
OpenLayers.Handler.EllipseEx = OpenLayers.Class(OpenLayers.Handler.Plotting, {
    /**
     * Constructor: OpenLayers.Handler.EllipseEx
     * 构造函数，创建一个新的绘制椭圆的事件处理器。
     *
     * Parameters:
     * control - {<OpenLayers.Control>} 构建当前事件处理器的控件对象。
     * callbacks - {Object} 回调函数对象。关于回调的具体描述参见下文。
     * options - {Object} 一个可选对象，其属性将会赋值到事件处理器对象上。
     *
     * Named callbacks:
     * create - 当要素草图第一次创建的时候调用，回调函数需接收两个参数：当前点几何对象、当前要素。
     * modify - 顶点的每一次变化时调用，回调函数接受参数：几何点对象、当前要素。
     * done - 当绘制点操作完成时调用，回调函数接收一个参数，当前点的几何对象。
     * cancel - 绘制过程中关闭当前事件处理器的监听时调用，回调函数接收当前要素的几何对象作为参数。
     */
    initialize: function(control, callbacks, options) {
        OpenLayers.Handler.Plotting.prototype.initialize.apply(this, arguments);
    },

    /**
     * Method: createFeature
     * create temporary features
     *
     * Parameters:
     * pixel - {<OpenLayers.Pixel>} A pixel location on the map.
     */
    createFeature: function(pixel) {
        var lonlat = this.layer.getLonLatFromViewPortPx(pixel);
        var geometry = new OpenLayers.Geometry.Point(
            lonlat.lon, lonlat.lat
        );
        this.point = new OpenLayers.Feature.Vector(geometry);

        //标绘扩展符号的 Geometry 类型为 GeoEllipse
        this.plotting = new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.GeoEllipse()
        );

        this.callback("create", [this.point.geometry, this.getSketch()]);
        this.point.geometry.clearBounds();
    },


    /**
     * Method: up
     * 操作 mouseup 和 touchend.
     * 发送最后一个 mouseup 点。
     *
     * Parameters:
     * evt - {Event} 浏览器事件，evt.xy 为最后一个 mouseup 的像素位置。
     *
     * Returns:
     * {Boolean} 是否允许事件继续在 map 上传送
     */
    up: function(evt) {
        this.mouseDown = false;
        this.stoppedDown = this.stopDown;

        // ignore double-clicks
        if (this.lastUp && this.lastUp.equals(evt.xy)) {
            return true;
        }

        if (this.lastDown && this.passesTolerance(this.lastDown, evt.xy, this.pixelTolerance)) {
            if (this.touch) {
                this.modifyFeature(evt.xy);
            }
            if (this.persist) {
                this.destroyPersistedFeature();
            }
            this.lastUp = evt.xy;

            this.addControlPoint(evt.xy);
            var len = this.controlPoints.length;
            if (len == 1) {
                this.isDrawing = true;
            } else if (len == 2) {
                this.drawComplete();
            }

            return true;
        } else {
            return true;
        }
    },

    /**
     * Method: touchstart
     * Handle touchstart.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    touchstart: function(evt) {
        if (!this.touch) {
            this.touch = true;
            // unregister mouse listeners
            this.map.events.un({
                mousedown: this.mousedown,
                mouseup: this.mouseup,
                mousemove: this.mousemove,
                click: this.click,
                dblclick: this.dblclick,
                scope: this
            });
        }
        this.map.isIESingleTouch = false;
        this.modifyFeature(evt.xy);
        if (this.persist) {
            this.destroyPersistedFeature();
        }
        this.addControlPoint(evt.xy);
        var len = this.controlPoints.length;
        if (len >= 1) {
            this.isDrawing = true;
        }
        return true;
    },
    /**
     * Method: touchend
     * Handle touchend.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    touchend: function(evt) {
        this.drawComplete();
        this.map.isIESingleTouch = true;
        return false;
    },
    /**
     * Method: touchmove
     * Handle touchmove.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    touchmove: function(evt) {
        this.lastTouchPx = evt.xy;
        this.modifyFeature(evt.xy);
        return true;
    },
    CLASS_NAME: "OpenLayers.Handler.EllipseEx"
});


/**
 * @requires OpenLayers/Handler/Plotting.js
 * @requires OpenLayers/Geometry/Polygon/GeoFreeline.js
 */

/**
 * Class: OpenLayers.Handler.FreePolygon
 * 在地图上绘制手绘面的事件处理器。
 * 绘制点在激活后显示，在鼠标第一次松开后开始绘制，且随着鼠标移动而绘制，双击后完成绘制。
 * 该处理器会触发标记为"done"、"cancel"和“modify"的事件回调。其中modify回调会在每一次变化时被调用并传入最近一次绘制的点。
 * 使用 <OpenLayers.Handler.FreePolygon> 构造函数可以创建一个新的绘制手绘面的事件处理器实例。
 *
 * Inherits from:
 *  - <OpenLayers.Handler.Plotting>
 
 */
OpenLayers.Handler.FreePolygon = OpenLayers.Class(OpenLayers.Handler.Plotting, {
    /**
     * Constructor: OpenLayers.Handler.FreePolygon
     * 构造函数，创建一个新的绘制手绘面的事件处理器。
     *
     * Parameters:
     * control - {<OpenLayers.Control>} 构建当前事件处理器的控件对象。
     * callbacks - {Object} 回调函数对象。关于回调的具体描述参见下文。
     * options - {Object} 一个可选对象，其属性将会赋值到事件处理器对象上。
     *
     * Named callbacks:
     * create - 当要素草图第一次创建的时候调用，回调函数需接收两个参数：当前点几何对象、当前要素。
     * modify - 顶点的每一次变化时调用，回调函数接受参数：几何点对象、当前要素。
     * done - 当绘制点操作完成时调用，回调函数接收一个参数，当前点的几何对象。
     * cancel - 绘制过程中关闭当前事件处理器的监听时调用，回调函数接收当前要素的几何对象作为参数。
     */
    initialize: function(control, callbacks, options) {
        OpenLayers.Handler.Plotting.prototype.initialize.apply(this, arguments);
    },

    /**
     * Method: createFeature
     * create temporary features
     *
     * Parameters:
     * pixel - {<OpenLayers.Pixel>} A pixel location on the map.
     */
    createFeature: function(pixel) {
        var lonlat = this.layer.getLonLatFromViewPortPx(pixel);
        var geometry = new OpenLayers.Geometry.Point(
            lonlat.lon, lonlat.lat
        );
        this.point = new OpenLayers.Feature.Vector(geometry);

        //标绘扩展符号的 Geometry 类型为 GeoFreePolygon
        this.plotting = new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.GeoFreePolygon()
        );

        this.callback("create", [this.point.geometry, this.getSketch()]);
        this.point.geometry.clearBounds();
    },


    /**
     * Method: up
     * 操作 mouseup 和 touchend.
     * 发送最后一个 mouseup 点。
     *
     * Parameters:
     * evt - {Event} 浏览器事件，evt.xy 为最后一个 mouseup 的像素位置。
     *
     * Returns:
     * {Boolean} 是否允许事件继续在 map 上传送
     */
    up: function(evt) {
        this.mouseDown = false;
        this.stoppedDown = this.stopDown;

        //ignore double-clicks
        if (this.lastUp && this.lastUp.equals(evt.xy)) {
            return true;
        }

        if (this.lastDown && this.passesTolerance(this.lastDown, evt.xy, this.pixelTolerance)) {
            if (this.touch) {
                this.modifyFeature(evt.xy);
            }
            if (this.persist) {
                this.destroyPersistedFeature();
            }
            this.lastUp = evt.xy;

            this.addControlPoint(evt.xy);
            var len = this.controlPoints.length;
            if (len > 0) {
                this.isDrawing = true;
            }

            return true;
        } else {
            return true;
        }

    },
    /**
     * APIMethod: modifyFeature
     * 绘制过程中修改标绘扩展符号形状。
     * 根据已添加的控制点和由当前鼠标位置作为的一个控制点绘制符号。
     *
     *
     * Parameters:
     * pixel - {<OpenLayers.Pixel>} 鼠标在地图上的当前像素位置
     */
    modifyFeature: function(pixel) {
        //忽略Chrome mouseup触发瞬间 mousemove 产生的相同点
        if (this.lastUp && this.lastUp.equals(pixel)) {
            return true;
        }

        //新建标绘扩展符号
        if (!this.point || !this.plotting) {
            this.createFeature(pixel);
        }

        //修改临时点的位置（鼠标位置）
        var lonlat = this.layer.getLonLatFromViewPortPx(pixel);
        this.point.geometry.x = lonlat.lon;
        this.point.geometry.y = lonlat.lat;

        if (this.isDrawing == true) {
            this.addControlPoint(pixel);

            var cp = this.controlPoints;
            //重新设置标绘扩展符号的控制点
            this.plotting.geometry._controlPoints = this.cloneControlPoints(cp);
            //重新计算标绘扩展符号的geometry
            this.plotting.geometry.calculateParts();
        }

        this.callback("modify", [this.point.geometry, this.getSketch(), false]);
        this.point.geometry.clearBounds();
        this.drawFeature();
    },


    /**
     * Method: dblclick
     * Handle double-clicks.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    dblclick: function(evt) {
        this.drawComplete();
        return false;
    },
    /**
     * Method: touchstart
     * Handle touchstart.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    touchstart: function(evt) {
        if (!this.touch) {
            this.touch = true;
            // unregister mouse listeners
            this.map.events.un({
                mousedown: this.mousedown,
                mouseup: this.mouseup,
                mousemove: this.mousemove,
                click: this.click,
                dblclick: this.dblclick,
                scope: this
            });
        }
        this.map.isIESingleTouch = false;
        this.modifyFeature(evt.xy);
        if (this.persist) {
            this.destroyPersistedFeature();
        }
        this.addControlPoint(evt.xy);
        var len = this.controlPoints.length;
        if (len >= 1) {
            this.isDrawing = true;
        }
        return true;
    },
    /**
     * Method: touchend
     * Handle touchend.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    touchend: function(evt) {
        this.drawComplete();
        this.map.isIESingleTouch = true;
        return false;
    },
    /**
     * Method: touchmove
     * Handle touchmove.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    touchmove: function(evt) {
        this.lastTouchPx = evt.xy;
        this.modifyFeature(evt.xy);
        return true;
    },
    CLASS_NAME: "OpenLayers.Handler.FreePolygon"
});


/**
 * @requires OpenLayers/Handler/Plotting.js
 * @requires OpenLayers/Geometry/GatheringPlace.js
 */

/**
 * Class: OpenLayers.Handler.GatheringPlace
 * 在地图上绘制聚集地符号的事件处理器。
 * 绘制点在激活后显示，随着鼠标移动而移动，在鼠标第一次松开后开始绘制，在鼠标第二次松开后完成绘制。
 * 该处理器会触发标记为"done"、"cancel"和“modify"的事件回调。其中modify回调会在每一次变化时被调用并传入最近一次绘制的点。
 * 使用 <OpenLayers.Handler.GatheringPlace> 构造函数可以创建一个新的绘制聚集地符号的事件处理器实例。
 *
 * Inherits from:
 *  - <OpenLayers.Handler.Plotting>
 
 */
OpenLayers.Handler.GatheringPlace = OpenLayers.Class(OpenLayers.Handler.Plotting, {
    /**
     * Constructor: OpenLayers.Handler.GatheringPlace
     * 构造函数，创建一个新的绘制聚集地符号的事件处理器。
     *
     * Parameters:
     * control - {<OpenLayers.Control>} 构建当前事件处理器的控件对象。
     * callbacks - {Object} 回调函数对象。关于回调的具体描述参见下文。
     * options - {Object} 一个可选对象，其属性将会赋值到事件处理器对象上。
     *
     * Named callbacks:
     * create - 当要素草图第一次创建的时候调用，回调函数需接收两个参数：当前点几何对象、当前要素。
     * modify - 顶点的每一次变化时调用，回调函数接受参数：几何点对象、当前要素。
     * done - 当绘制点操作完成时调用，回调函数接收一个参数，当前点的几何对象。
     * cancel - 绘制过程中关闭当前事件处理器的监听时调用，回调函数接收当前要素的几何对象作为参数。
     */
    initialize: function(control, callbacks, options) {
        OpenLayers.Handler.Plotting.prototype.initialize.apply(this, arguments);
    },

    /**
     * Method: createFeature
     * create temporary features
     *
     * Parameters:
     * pixel - {<OpenLayers.Pixel>} A pixel location on the map.
     */
    createFeature: function(pixel) {
        var lonlat = this.layer.getLonLatFromViewPortPx(pixel);
        var geometry = new OpenLayers.Geometry.Point(
            lonlat.lon, lonlat.lat
        );
        this.point = new OpenLayers.Feature.Vector(geometry);

        //标绘扩展符号的 Geometry 类型为 GeoGatheringPlace
        this.plotting = new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.GeoGatheringPlace()
        );

        this.callback("create", [this.point.geometry, this.getSketch()]);
        this.point.geometry.clearBounds();
    },


    /**
     * Method: up
     * 操作 mouseup 和 touchend.
     * 发送最后一个 mouseup 点。
     *
     * Parameters:
     * evt - {Event} 浏览器事件，evt.xy 为最后一个 mouseup 的像素位置。
     *
     * Returns:
     * {Boolean} 是否允许事件继续在 map 上传送
     */
    up: function(evt) {
        this.mouseDown = false;
        this.stoppedDown = this.stopDown;

        // ignore double-clicks
        if (this.lastUp && this.lastUp.equals(evt.xy)) {
            return true;
        }

        if (this.lastDown && this.passesTolerance(this.lastDown, evt.xy, this.pixelTolerance)) {
            if (this.touch) {
                this.modifyFeature(evt.xy);
            }
            if (this.persist) {
                this.destroyPersistedFeature();
            }
            this.lastUp = evt.xy;

            this.addControlPoint(evt.xy);
            var len = this.controlPoints.length;
            if (len == 1) {
                this.isDrawing = true;
            } else if (len == 2) {
                this.drawComplete();
            }
            return true;
        } else {
            return true;
        }
    },

    CLASS_NAME: "OpenLayers.Handler.GatheringPlace"
});


/**
 * @requires OpenLayers/Handler/Plotting.js
 * @requires OpenLayers/Geometry/Polygon/Lune.js
 */

/**
 * Class: OpenLayers.Handler.Lune
 * 在地图上绘制弓形符号的事件处理器。
 * 绘制点在激活后显示，随着鼠标移动而移动，在鼠标第一次松开后开始绘制，在鼠标第三次松开后完成绘制。
 * 该处理器会触发标记为"done"、"cancel"和“modify"的事件回调。其中modify回调会在每一次变化时被调用并传入最近一次绘制的点。
 * 使用 <OpenLayers.Handler.Lune> 构造函数可以创建一个新的绘制弓形符号的事件处理器实例。
 *
 * Inherits from:
 *  - <OpenLayers.Handler.Plotting>
 
 */
OpenLayers.Handler.Lune = OpenLayers.Class(OpenLayers.Handler.Plotting, {
    /**
     * Constructor: OpenLayers.Handler.Lune
     * 构造函数，创建一个新的绘制弓形符号的事件处理器。
     *
     * Parameters:
     * control - {<OpenLayers.Control>} 构建当前事件处理器的控件对象。
     * callbacks - {Object} 回调函数对象。关于回调的具体描述参见下文。
     * options - {Object} 一个可选对象，其属性将会赋值到事件处理器对象上。
     *
     * Named callbacks:
     * create - 当要素草图第一次创建的时候调用，回调函数需接收两个参数：当前点几何对象、当前要素。
     * modify - 顶点的每一次变化时调用，回调函数接受参数：几何点对象、当前要素。
     * done - 当绘制点操作完成时调用，回调函数接收一个参数，当前点的几何对象。
     * cancel - 绘制过程中关闭当前事件处理器的监听时调用，回调函数接收当前要素的几何对象作为参数。
     */
    initialize: function(control, callbacks, options) {
        OpenLayers.Handler.Plotting.prototype.initialize.apply(this, arguments);
    },

    /**
     * Method: createFeature
     * create temporary features
     *
     * Parameters:
     * pixel - {<OpenLayers.Pixel>} A pixel location on the map.
     */
    createFeature: function(pixel) {
        var lonlat = this.layer.getLonLatFromViewPortPx(pixel);
        var geometry = new OpenLayers.Geometry.Point(
            lonlat.lon, lonlat.lat
        );
        this.point = new OpenLayers.Feature.Vector(geometry);

        //标绘扩展符号的 Geometry 类型为 GeoLune
        this.plotting = new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.GeoLune()
        );

        this.callback("create", [this.point.geometry, this.getSketch()]);
        this.point.geometry.clearBounds();
    },


    /**
     * Method: up
     * 操作 mouseup 和 touchend.
     * 发送最后一个 mouseup 点。
     *
     * Parameters:
     * evt - {Event} 浏览器事件，evt.xy 为最后一个 mouseup 的像素位置。
     *
     * Returns:
     * {Boolean} 是否允许事件继续在 map 上传送
     */
    up: function(evt) {
        this.mouseDown = false;
        this.stoppedDown = this.stopDown;

        //ignore double-clicks
        if (this.lastUp && this.lastUp.equals(evt.xy)) {
            return true;
        }

        if (this.lastDown && this.passesTolerance(this.lastDown, evt.xy, this.pixelTolerance)) {
            if (this.touch) {
                this.modifyFeature(evt.xy);
            }
            if (this.persist) {
                this.destroyPersistedFeature();
            }
            this.lastUp = evt.xy;

            this.addControlPoint(evt.xy);
            var len = this.controlPoints.length;
            if (len == 1 || len == 2) {
                this.isDrawing = true;
            } else if (len == 3) {
                this.isDrawing = false;
                this.drawComplete();
            }
            return true;
        } else {
            return true;
        }

    },


    CLASS_NAME: "OpenLayers.Handler.Lune"
});


/**
 * @requires OpenLayers/Handler.js
 * @requires OpenLayers/Geometry/Polygon/GeoRectangle.js
 */

/**
 * Class: OpenLayers.Handler.PolygonEx
 * 在地图上绘制多边形的事件处理器。
 * 绘制点在激活后显示，随着鼠标移动而移动，在鼠标第一次松开后开始绘制，双击后完成绘制。
 * 该处理器会触发标记为"done"、"cancel"和“modify"的事件回调。其中modify回调会在每一次变化时被调用并传入最近一次绘制的点。
 * 使用 <OpenLayers.Handler.PolygonEx> 构造函数可以创建一个新的绘制多边形的事件处理器实例。
 *
 * Inherits from:
 *  - <OpenLayers.Handler.Plotting>
 */
OpenLayers.Handler.PolygonEx = OpenLayers.Class(OpenLayers.Handler.Plotting, {
    /**
     * Constructor: OpenLayers.Handler.PolygonEx
     * 构造函数，创建一个新的绘制多边形的事件处理器。
     *
     * Parameters:
     * control - {<OpenLayers.Control>} 构建当前事件处理器的控件对象。
     * callbacks - {Object} 回调函数对象。关于回调的具体描述参见下文。
     * options - {Object} 一个可选对象，其属性将会赋值到事件处理器对象上。
     *
     * Named callbacks:
     * create - 当要素草图第一次创建的时候调用，回调函数需接收两个参数：当前点几何对象、当前要素。
     * modify - 顶点的每一次变化时调用，回调函数接受参数：几何点对象、当前要素。
     * done - 当绘制点操作完成时调用，回调函数接收一个参数，当前点的几何对象。
     * cancel - 绘制过程中关闭当前事件处理器的监听时调用，回调函数接收当前要素的几何对象作为参数。
     */
    initialize: function(control, callbacks, options) {
        OpenLayers.Handler.Plotting.prototype.initialize.apply(this, arguments);
    },

    /**
     * Method: createFeature
     * create temporary features
     *
     * Parameters:
     * pixel - {<OpenLayers.Pixel>} A pixel location on the map.
     */
    createFeature: function(pixel) {
        var lonlat = this.layer.getLonLatFromViewPortPx(pixel);
        var geometry = new OpenLayers.Geometry.Point(
            lonlat.lon, lonlat.lat
        );
        this.point = new OpenLayers.Feature.Vector(geometry);

        //标绘扩展符号的 Geometry 类型为 GeoPolygonEx
        this.plotting = new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.GeoPolygonEx()
        );

        this.callback("create", [this.point.geometry, this.getSketch()]);
        this.point.geometry.clearBounds();
    },


    /**
     * Method: up
     * 操作 mouseup 和 touchend.
     * 发送最后一个 mouseup 点。
     *
     * Parameters:
     * evt - {Event} 浏览器事件，evt.xy 为最后一个 mouseup 的像素位置。
     *
     * Returns:
     * {Boolean} 是否允许事件继续在 map 上传送
     */
    up: function(evt) {
        this.mouseDown = false;
        this.stoppedDown = this.stopDown;

        // ignore double-clicks
        if (this.lastUp && this.lastUp.equals(evt.xy)) {
            return true;
        }

        if (this.lastDown && this.passesTolerance(this.lastDown, evt.xy, this.pixelTolerance)) {
            if (this.touch) {
                this.modifyFeature(evt.xy);
            }
            if (this.persist) {
                this.destroyPersistedFeature();
            }
            this.lastUp = evt.xy;

            this.addControlPoint(evt.xy);
            var len = this.controlPoints.length;
            if (len > 0) {
                this.isDrawing = true;
            } else {
                this.isDrawing = false;
                this.controlPoints = [];
                this.plotting = null
            }

            return true;
        } else {
            return true;
        }
    },

    /**
     * Method: dblclick
     * Handle double-clicks.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    dblclick: function(evt) {
        this.drawComplete();
        return false;
    },

    /**
     * Method: touchstart
     * Handle touchstart.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    touchstart: function(evt) {
        if (this.lastTouchPx && this.passesTolerance(this.lastTouchPx, evt.xy, this.pixelTolerance)) {
            evt.preventDefault();
            this.drawComplete();
            this.isDrawing = false;
            return false;
        }
        if (!this.touch) {
            this.touch = true;
            // unregister mouse listeners
            this.map.events.un({
                mousedown: this.mousedown,
                mouseup: this.mouseup,
                mousemove: this.mousemove,
                click: this.click,
                dblclick: this.dblclick,
                scope: this
            });
        }
        this.lastTouchPx = evt.xy;
        return this.down(evt);
    },
    /**
     * APIMethod: down
     * Handle mousedown and touchstart.  Adjust the Geometry and redraw.
     * Return determines whether to propagate the event on the map.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    down: function(evt) {
        this.mouseDown = true;
        this.lastDown = evt.xy;
        this.isDrawing = true;
        if (!this.touch) {
            this.modifyFeature(evt.xy);
        }
        this.stoppedDown = this.stopDown;
        return !this.stopDown;
    },

    /**
     * Method: touchend
     * Handle touchend.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    touchend: function(evt) {
        if (this.isDrawing) {
            evt.xy = this.lastTouchPx;
            return this.up(evt);
        }

    },
    CLASS_NAME: "OpenLayers.Handler.PolygonEx"
});


/**
 * @requires OpenLayers/Handler.js
 * @requires OpenLayers/Geometry/Polygon/GeoRectangle.js
 */

/**
 * Class: OpenLayers.Handler.Rectangle
 * 在地图上绘制矩形的事件处理器。
 * 绘制点在激活后显示，随着鼠标移动而移动，在鼠标第一次松开后开始绘制，在鼠标第二次松开后完成绘制。
 * 该处理器会触发标记为"done"、"cancel"和“modify"的事件回调。其中modify回调会在每一次变化时被调用并传入最近一次绘制的点。
 * 使用 <OpenLayers.Handler.Rectangle> 构造函数可以创建一个新的绘制矩形的事件处理器实例。
 *
 * Inherits from:
 *  - <OpenLayers.Handler.Plotting>
 */
OpenLayers.Handler.Rectangle = OpenLayers.Class(OpenLayers.Handler.Plotting, {
    /**
     * Constructor: OpenLayers.Handler.Rectangle
     * 构造函数，创建一个新的绘制矩形的事件处理器。
     *
     * Parameters:
     * control - {<OpenLayers.Control>} 构建当前事件处理器的控件对象。
     * callbacks - {Object} 回调函数对象。关于回调的具体描述参见下文。
     * options - {Object} 一个可选对象，其属性将会赋值到事件处理器对象上。
     *
     * Named callbacks:
     * create - 当要素草图第一次创建的时候调用，回调函数需接收两个参数：当前点几何对象、当前要素。
     * modify - 顶点的每一次变化时调用，回调函数接受参数：几何点对象、当前要素。
     * done - 当绘制点操作完成时调用，回调函数接收一个参数，当前点的几何对象。
     * cancel - 绘制过程中关闭当前事件处理器的监听时调用，回调函数接收当前要素的几何对象作为参数。
     */
    initialize: function(control, callbacks, options) {
        OpenLayers.Handler.Plotting.prototype.initialize.apply(this, arguments);
    },

    /**
     * Method: createFeature
     * create temporary features
     *
     * Parameters:
     * pixel - {<OpenLayers.Pixel>} A pixel location on the map.
     */
    createFeature: function(pixel) {
        var lonlat = this.layer.getLonLatFromViewPortPx(pixel);
        var geometry = new OpenLayers.Geometry.Point(
            lonlat.lon, lonlat.lat
        );
        this.point = new OpenLayers.Feature.Vector(geometry);

        //标绘扩展符号的 Geometry 类型为 GeoRectangle
        this.plotting = new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.GeoRectangle()
        );

        this.callback("create", [this.point.geometry, this.getSketch()]);
        this.point.geometry.clearBounds();
    },


    /**
     * Method: up
     * 操作 mouseup 和 touchend.
     * 发送最后一个 mouseup 点。
     *
     * Parameters:
     * evt - {Event} 浏览器事件，evt.xy 为最后一个 mouseup 的像素位置。
     *
     * Returns:
     * {Boolean} 是否允许事件继续在 map 上传送
     */
    up: function(evt) {
        this.mouseDown = false;
        this.stoppedDown = this.stopDown;

        // ignore double-clicks
        if (this.lastUp && this.lastUp.equals(evt.xy)) {
            return true;
        }

        if (this.lastDown && this.passesTolerance(this.lastDown, evt.xy, this.pixelTolerance)) {
            if (this.touch) {
                this.modifyFeature(evt.xy);
            }
            if (this.persist) {
                this.destroyPersistedFeature();
            }
            this.lastUp = evt.xy;

            this.addControlPoint(evt.xy);
            var len = this.controlPoints.length;
            if (len == 1) {
                this.isDrawing = true;
            } else if (len == 2) {
                this.drawComplete();
            } else {
                this.isDrawing = false;
                this.controlPoints = [];
                this.plotting = null
            }

            return true;
        } else {
            return true;
        }
    },

    /**
     * Method: touchstart
     * Handle touchstart.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    touchstart: function(evt) {
        if (!this.touch) {
            this.touch = true;
            // unregister mouse listeners
            this.map.events.un({
                mousedown: this.mousedown,
                mouseup: this.mouseup,
                mousemove: this.mousemove,
                click: this.click,
                dblclick: this.dblclick,
                scope: this
            });
        }
        this.map.isIESingleTouch = false;
        this.modifyFeature(evt.xy);
        if (this.persist) {
            this.destroyPersistedFeature();
        }
        this.addControlPoint(evt.xy);
        var len = this.controlPoints.length;
        if (len >= 1) {
            this.isDrawing = true;
        }
        return true;
    },
    /**
     * Method: touchend
     * Handle touchend.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    touchend: function(evt) {
        this.drawComplete();
        this.map.isIESingleTouch = true;
        return false;
    },
    /**
     * Method: touchmove
     * Handle touchmove.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    touchmove: function(evt) {
        this.lastTouchPx = evt.xy;
        this.modifyFeature(evt.xy);
        return true;
    },
    CLASS_NAME: "OpenLayers.Handler.Rectangle"
});


/**
 * @requires OpenLayers/Handler.js
 * @requires OpenLayers/Geometry/Polygon/GeoRoundedRect.js
 */

/**
 * Class: OpenLayers.Handler.RoundedRect
 * 在地图上绘制圆角矩形的事件处理器。
 * 绘制点在激活后显示，随着鼠标移动而移动，在鼠标第一次松开后开始绘制，在鼠标第二次松开后完成绘制。
 * 该处理器会触发标记为"done"、"cancel"和“modify"的事件回调。其中modify回调会在每一次变化时被调用并传入最近一次绘制的点。
 * 使用 <OpenLayers.Handler.RoundedRect> 构造函数可以创建一个新的绘制圆角矩形的事件处理器实例。
 *
 * Inherits from:
 *  - <OpenLayers.Handler.Plotting>
 */
OpenLayers.Handler.RoundedRect = OpenLayers.Class(OpenLayers.Handler.Plotting, {
    /**
     * Constructor: OpenLayers.Handler.RoundedRect
     * 构造函数，创建一个新的绘制圆角矩形的事件处理器。
     *
     * Parameters:
     * control - {<OpenLayers.Control>} 构建当前事件处理器的控件对象。
     * callbacks - {Object} 回调函数对象。关于回调的具体描述参见下文。
     * options - {Object} 一个可选对象，其属性将会赋值到事件处理器对象上。
     *
     * Named callbacks:
     * create - 当要素草图第一次创建的时候调用，回调函数需接收两个参数：当前点几何对象、当前要素。
     * modify - 顶点的每一次变化时调用，回调函数接受参数：几何点对象、当前要素。
     * done - 当绘制点操作完成时调用，回调函数接收一个参数，当前点的几何对象。
     * cancel - 绘制过程中关闭当前事件处理器的监听时调用，回调函数接收当前要素的几何对象作为参数。
     */
    initialize: function(control, callbacks, options) {
        OpenLayers.Handler.Plotting.prototype.initialize.apply(this, arguments);
    },

    /**
     * Method: createFeature
     * create temporary features
     *
     * Parameters:
     * pixel - {<OpenLayers.Pixel>} A pixel location on the map.
     */
    createFeature: function(pixel) {
        var lonlat = this.layer.getLonLatFromViewPortPx(pixel);
        var geometry = new OpenLayers.Geometry.Point(
            lonlat.lon, lonlat.lat
        );
        this.point = new OpenLayers.Feature.Vector(geometry);

        //标绘扩展符号的 Geometry 类型为 GeoRoundedRect
        this.plotting = new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.GeoRoundedRect()
        );

        this.callback("create", [this.point.geometry, this.getSketch()]);
        this.point.geometry.clearBounds();
    },

    /**
     * Method: up
     * 操作 mouseup 和 touchend.
     * 发送最后一个 mouseup 点。
     *
     * Parameters:
     * evt - {Event} 浏览器事件，evt.xy 为最后一个 mouseup 的像素位置。
     *
     * Returns:
     * {Boolean} 是否允许事件继续在 map 上传送
     */
    up: function(evt) {
        this.mouseDown = false;
        this.stoppedDown = this.stopDown;

        // ignore double-clicks
        if (this.lastUp && this.lastUp.equals(evt.xy)) {
            return true;
        }

        if (this.lastDown && this.passesTolerance(this.lastDown, evt.xy, this.pixelTolerance)) {
            if (this.touch) {
                this.modifyFeature(evt.xy);
            }
            if (this.persist) {
                this.destroyPersistedFeature();
            }
            this.lastUp = evt.xy;

            this.addControlPoint(evt.xy);
            var len = this.controlPoints.length;
            if (len == 1) {
                this.isDrawing = true;
            } else if (len == 2) {
                this.drawComplete();
            } else {
                this.isDrawing = false;
                this.controlPoints = [];
                this.plotting = null
            }

            return true;
        } else {
            return true;
        }
    },

    /**
     * Method: touchstart
     * Handle touchstart.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    touchstart: function(evt) {
        if (!this.touch) {
            this.touch = true;
            // unregister mouse listeners
            this.map.events.un({
                mousedown: this.mousedown,
                mouseup: this.mouseup,
                mousemove: this.mousemove,
                click: this.click,
                dblclick: this.dblclick,
                scope: this
            });
        }
        this.map.isIESingleTouch = false;
        this.modifyFeature(evt.xy);
        if (this.persist) {
            this.destroyPersistedFeature();
        }
        this.addControlPoint(evt.xy);
        var len = this.controlPoints.length;
        if (len >= 1) {
            this.isDrawing = true;
        }
        return true;
    },
    /**
     * Method: touchend
     * Handle touchend.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    touchend: function(evt) {
        this.drawComplete();
        this.map.isIESingleTouch = true;
        return false;
    },
    /**
     * Method: touchmove
     * Handle touchmove.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    touchmove: function(evt) {
        this.lastTouchPx = evt.xy;
        this.modifyFeature(evt.xy);
        return true;
    },
    CLASS_NAME: "OpenLayers.Handler.RoundedRect"
});


/**
 * @requires OpenLayers/Handler/Plotting.js
 * @requires OpenLayers/Geometry/Polygon/Geoector.js
 */

/**
 * Class: OpenLayers.Handler.Sector
 * 在地图上绘制扇形符号的事件处理器。
 * 绘制点在激活后显示，随着鼠标移动而移动，在鼠标第一次松开后开始绘制，在鼠标第二次松开后完成绘制。
 * 该处理器会触发标记为"done"、"cancel"和“modify"的事件回调。其中modify回调会在每一次变化时被调用并传入最近一次绘制的点。
 * 使用 <OpenLayers.Handler.Sector> 构造函数可以创建一个新的绘制扇形符号的事件处理器实例。
 *
 * Inherits from:
 *  - <OpenLayers.Handler.Plotting>
 
 */
OpenLayers.Handler.Sector = OpenLayers.Class(OpenLayers.Handler.Plotting, {
    /**
     * Constructor: OpenLayers.Handler.Sector
     * 构造函数，创建一个新的绘制扇形符号的事件处理器。
     *
     * Parameters:
     * control - {<OpenLayers.Control>} 构建当前事件处理器的控件对象。
     * callbacks - {Object} 回调函数对象。关于回调的具体描述参见下文。
     * options - {Object} 一个可选对象，其属性将会赋值到事件处理器对象上。
     *
     * Named callbacks:
     * create - 当要素草图第一次创建的时候调用，回调函数需接收两个参数：当前点几何对象、当前要素。
     * modify - 顶点的每一次变化时调用，回调函数接受参数：几何点对象、当前要素。
     * done - 当绘制点操作完成时调用，回调函数接收一个参数，当前点的几何对象。
     * cancel - 绘制过程中关闭当前事件处理器的监听时调用，回调函数接收当前要素的几何对象作为参数。
     */
    initialize: function(control, callbacks, options) {
        OpenLayers.Handler.Plotting.prototype.initialize.apply(this, arguments);
    },

    /**
     * Method: createFeature
     * create temporary features
     *
     * Parameters:
     * pixel - {<OpenLayers.Pixel>} A pixel location on the map.
     */
    createFeature: function(pixel) {
        var lonlat = this.layer.getLonLatFromViewPortPx(pixel);
        var geometry = new OpenLayers.Geometry.Point(
            lonlat.lon, lonlat.lat
        );
        this.point = new OpenLayers.Feature.Vector(geometry);

        //标绘扩展符号的 Geometry 类型为 GeoSector
        this.plotting = new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.GeoSector()
        );

        this.callback("create", [this.point.geometry, this.getSketch()]);
        this.point.geometry.clearBounds();
    },

    /**
     * Method: up
     * 操作 mouseup 和 touchend.
     * 发送最后一个 mouseup 点。
     *
     * Parameters:
     * evt - {Event} 浏览器事件，evt.xy 为最后一个 mouseup 的像素位置。
     *
     * Returns:
     * {Boolean} 是否允许事件继续在 map 上传送
     */
    up: function(evt) {
        this.mouseDown = false;
        this.stoppedDown = this.stopDown;

        //ignore double-clicks
        if (this.lastUp && this.lastUp.equals(evt.xy)) {
            return true;
        }

        if (this.lastDown && this.passesTolerance(this.lastDown, evt.xy, this.pixelTolerance)) {
            if (this.touch) {
                this.modifyFeature(evt.xy);
            }
            if (this.persist) {
                this.destroyPersistedFeature();
            }
            this.lastUp = evt.xy;

            this.addControlPoint(evt.xy);
            var len = this.controlPoints.length;
            if (len == 1 || len == 2) {
                this.isDrawing = true;
            } else if (len == 3) {
                this.isDrawing = false;
                this.drawComplete();
            }
            return true;
        } else {
            return true;
        }

    },


    CLASS_NAME: "OpenLayers.Handler.Sector"
});


/**
 * @requires OpenLayers/Handler/Plotting.js
 * @requires OpenLayers/Geometry/GeoBezierCurveArrow.js
 */

/**
 * Class: OpenLayers.Handler.BezierCurveArrow
 * 在地图上绘制贝塞尔曲线箭头的事件处理器。
 * 绘制点在激活后显示，随着鼠标移动而移动，在鼠标第一次松开后开始绘制，双击鼠标完成绘制。
 * 该处理器会触发标记为"done"、"cancel"和“modify"的事件回调。其中modify回调会在每一次变化时被调用并传入最近一次绘制的点。
 * 使用 <OpenLayers.Handler.BezierCurveArrow> 构造函数可以创建一个新的绘制贝塞尔曲线箭头的事件处理器实例。
 *
 * Inherits from:
 *  - <OpenLayers.Handler.Plotting>
 */
OpenLayers.Handler.BezierCurveArrow = OpenLayers.Class(OpenLayers.Handler.Plotting, {
    /**
     * Constructor: OpenLayers.Handler.BezierCurveArrow
     * 构造函数，创建一个新的绘制贝塞尔曲线箭头的事件处理器。
     *
     * Parameters:
     * control - {<OpenLayers.Control>} 构建当前事件处理器的控件对象。
     * callbacks - {Object} 回调函数对象。关于回调的具体描述参见下文。
     * options - {Object} 一个可选对象，其属性将会赋值到事件处理器对象上。
     *
     * Named callbacks:
     * create - 当要素草图第一次创建的时候调用，回调函数需接收两个参数：当前点几何对象、当前要素。
     * modify - 顶点的每一次变化时调用，回调函数接受参数：几何点对象、当前要素。
     * done - 当绘制点操作完成时调用，回调函数接收一个参数，当前点的几何对象。
     * cancel - 绘制过程中关闭当前事件处理器的监听时调用，回调函数接收当前要素的几何对象作为参数。
     */
    initialize: function(control, callbacks, options) {
        OpenLayers.Handler.Plotting.prototype.initialize.apply(this, arguments);
    },

    /**
     * Method: createFeature
     * create temporary features
     *
     * Parameters:
     * pixel - {<OpenLayers.Pixel>} A pixel location on the map.
     */
    createFeature: function(pixel) {
        var lonlat = this.layer.getLonLatFromViewPortPx(pixel);
        var geometry = new OpenLayers.Geometry.Point(
            lonlat.lon, lonlat.lat
        );
        this.point = new OpenLayers.Feature.Vector(geometry);

        //标绘扩展符号的 Geometry 类型为 GeoBezierCurveArrow
        this.plotting = new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.GeoBezierCurveArrow()
        );

        this.callback("create", [this.point.geometry, this.getSketch()]);
        this.point.geometry.clearBounds();
    },

    /**
     * Method: up
     * 操作 mouseup 和 touchend.
     * 发送最后一个 mouseup 点。
     *
     * Parameters:
     * evt - {Event} 浏览器事件，evt.xy 为最后一个 mouseup 的像素位置。
     *
     * Returns:
     * {Boolean} 是否允许事件继续在 map 上传送
     */
    up: function(evt) {
        this.mouseDown = false;
        this.stoppedDown = this.stopDown;

        //ignore double-clicks
        if (this.lastUp && this.lastUp.equals(evt.xy)) {
            return true;
        }

        if (this.lastDown && this.passesTolerance(this.lastDown, evt.xy, this.pixelTolerance)) {
            if (this.touch) {
                this.modifyFeature(evt.xy);
            }
            if (this.persist) {
                this.destroyPersistedFeature();
            }
            this.lastUp = evt.xy;

            this.addControlPoint(evt.xy);
            var len = this.controlPoints.length;
            if (len > 0) {
                this.isDrawing = true;
            }
            return true;
        } else {
            return true;
        }
    },
    /**
     * Method: dblclick
     * Handle double-clicks.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    dblclick: function(evt) {
        this.drawComplete();
        return false;
    },

    /**
     * Method: touchstart
     * Handle touchstart.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    touchstart: function(evt) {
        if (this.lastTouchPx && this.passesTolerance(this.lastTouchPx, evt.xy, this.pixelTolerance)) {
            evt.preventDefault();
            this.drawComplete();
            this.isDrawing = false;
            return false;
        }
        if (!this.touch) {
            this.touch = true;
            // unregister mouse listeners
            this.map.events.un({
                mousedown: this.mousedown,
                mouseup: this.mouseup,
                mousemove: this.mousemove,
                click: this.click,
                dblclick: this.dblclick,
                scope: this
            });
        }
        this.lastTouchPx = evt.xy;
        return this.down(evt);
    },
    /**
     * APIMethod: down
     * Handle mousedown and touchstart.  Adjust the Geometry and redraw.
     * Return determines whether to propagate the event on the map.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    down: function(evt) {
        this.mouseDown = true;
        this.lastDown = evt.xy;
        this.isDrawing = true;
        if (!this.touch) {
            this.modifyFeature(evt.xy);
        }
        this.stoppedDown = this.stopDown;
        return !this.stopDown;
    },

    /**
     * Method: touchend
     * Handle touchend.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    touchend: function(evt) {
        if (this.isDrawing) {
            evt.xy = this.lastTouchPx;
            return this.up(evt);
        }

    },

    CLASS_NAME: "OpenLayers.Handler.BezierCurveArrow"
});


/**
 * @requires OpenLayers/Handler/Plotting
 * @requires OpenLayers/Geometry/GeoCardinalCurveArrow
 */

/**
 * Class: OpenLayers.Handler.CardinalCurveArrow
 * 在地图上绘制Cardinal曲线箭头的事件处理器。
 * 绘制点在激活后显示，随着鼠标移动而移动，在鼠标第一次松开后开始绘制，双击鼠标完成绘制。
 * 该处理器会触发标记为"done"、"cancel"和“modify"的事件回调。其中modify回调会在每一次变化时被调用并传入最近一次绘制的点。
 * 使用 <OpenLayers.Handler.CardinalCurveArrow> 构造函数可以创建一个新的绘制Cardinal曲线箭头的事件处理器实例。
 *
 * Inherits from:
 *  - <OpenLayers.Handler.Plotting>
 */
OpenLayers.Handler.CardinalCurveArrow = OpenLayers.Class(OpenLayers.Handler.Plotting, {
    /**
     * Constructor: OpenLayers.Handler.CardinalCurveArrow
     * 构造函数，创建一个新的绘制Cardinal曲线箭头的事件处理器。
     *
     * Parameters:
     * control - {<OpenLayers.Control>} 构建当前事件处理器的控件对象。
     * callbacks - {Object} 回调函数对象。关于回调的具体描述参见下文。
     * options - {Object} 一个可选对象，其属性将会赋值到事件处理器对象上。
     *
     * Named callbacks:
     * create - 当要素草图第一次创建的时候调用，回调函数需接收两个参数：当前点几何对象、当前要素。
     * modify - 顶点的每一次变化时调用，回调函数接受参数：几何点对象、当前要素。
     * done - 当绘制点操作完成时调用，回调函数接收一个参数，当前点的几何对象。
     * cancel - 绘制过程中关闭当前事件处理器的监听时调用，回调函数接收当前要素的几何对象作为参数。
     */
    initialize: function(control, callbacks, options) {
        OpenLayers.Handler.Plotting.prototype.initialize.apply(this, arguments);
    },

    /**
     * Method: createFeature
     * create temporary features
     *
     * Parameters:
     * pixel - {<OpenLayers.Pixel>} A pixel location on the map.
     */
    createFeature: function(pixel) {
        var lonlat = this.layer.getLonLatFromViewPortPx(pixel);
        var geometry = new OpenLayers.Geometry.Point(
            lonlat.lon, lonlat.lat
        );
        this.point = new OpenLayers.Feature.Vector(geometry);

        //标绘扩展符号的 Geometry 类型为 GeoCardinalCurveArrow
        this.plotting = new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.GeoCardinalCurveArrow()
        );

        this.callback("create", [this.point.geometry, this.getSketch()]);
        this.point.geometry.clearBounds();
    },

    /**
     * Method: up
     * 操作 mouseup 和 touchend.
     * 发送最后一个 mouseup 点。
     *
     * Parameters:
     * evt - {Event} 浏览器事件，evt.xy 为最后一个 mouseup 的像素位置。
     *
     * Returns:
     * {Boolean} 是否允许事件继续在 map 上传送
     */
    up: function(evt) {
        this.mouseDown = false;
        this.stoppedDown = this.stopDown;

        //ignore double-clicks
        if (this.lastUp && this.lastUp.equals(evt.xy)) {
            return true;
        }

        if (this.lastDown && this.passesTolerance(this.lastDown, evt.xy, this.pixelTolerance)) {
            if (this.touch) {
                this.modifyFeature(evt.xy);
            }
            if (this.persist) {
                this.destroyPersistedFeature();
            }
            this.lastUp = evt.xy;

            this.addControlPoint(evt.xy);
            var len = this.controlPoints.length;
            if (len > 0) {
                this.isDrawing = true;
            }
            return true;
        } else {
            return true;
        }
    },
    /**
     * Method: dblclick
     * Handle double-clicks.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    dblclick: function(evt) {
        this.drawComplete();
        return false;
    },

    /**
     * Method: touchstart
     * Handle touchstart.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    touchstart: function(evt) {
        if (this.lastTouchPx && this.passesTolerance(this.lastTouchPx, evt.xy, this.pixelTolerance)) {
            evt.preventDefault();
            this.drawComplete();
            this.isDrawing = false;
            return false;
        }
        if (!this.touch) {
            this.touch = true;
            // unregister mouse listeners
            this.map.events.un({
                mousedown: this.mousedown,
                mouseup: this.mouseup,
                mousemove: this.mousemove,
                click: this.click,
                dblclick: this.dblclick,
                scope: this
            });
        }
        this.lastTouchPx = evt.xy;
        return this.down(evt);
    },
    /**
     * APIMethod: down
     * Handle mousedown and touchstart.  Adjust the Geometry and redraw.
     * Return determines whether to propagate the event on the map.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    down: function(evt) {
        this.mouseDown = true;
        this.lastDown = evt.xy;
        this.isDrawing = true;
        if (!this.touch) {
            this.modifyFeature(evt.xy);
        }
        this.stoppedDown = this.stopDown;
        return !this.stopDown;
    },

    /**
     * Method: touchend
     * Handle touchend.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    touchend: function(evt) {
        if (this.isDrawing) {
            evt.xy = this.lastTouchPx;
            return this.up(evt);
        }

    },
    CLASS_NAME: "OpenLayers.Handler.CardinalCurveArrow"
});


/**
 * @requires OpenLayers/Handler/Plotting.js
 * @requires OpenLayers/Geometry/GeoCurveFlag.js
 */

/**
 * Class: OpenLayers.Handler.CurveFlag
 * 在地图上绘制曲线旗标的事件处理器。
 * 绘制点在激活后显示，随着鼠标移动而移动，在鼠标第一次松开后开始绘制，在鼠标第二次松开后完成绘制。
 * 该处理器会触发标记为"done"、"cancel"和“modify"的事件回调。其中modify回调会在每一次变化时被调用并传入最近一次绘制的点。
 * 使用 <OpenLayers.Handler.CurveFlag> 构造函数可以创建一个新的绘制曲线旗标的事件处理器实例。
 *
 * Inherits from:
 *  - <OpenLayers.Handler.Plotting>
 */
OpenLayers.Handler.CurveFlag = OpenLayers.Class(OpenLayers.Handler.Plotting, {
    /**
     * Constructor: OpenLayers.Handler.CurveFlag
     * 构造函数，创建一个新的绘制曲线旗标的事件处理器。
     *
     * Parameters:
     * control - {<OpenLayers.Control>} 构建当前事件处理器的控件对象。
     * callbacks - {Object} 回调函数对象。关于回调的具体描述参见下文。
     * options - {Object} 一个可选对象，其属性将会赋值到事件处理器对象上。
     *
     * Named callbacks:
     * create - 当要素草图第一次创建的时候调用，回调函数需接收两个参数：当前点几何对象、当前要素。
     * modify - 顶点的每一次变化时调用，回调函数接受参数：几何点对象、当前要素。
     * done - 当绘制点操作完成时调用，回调函数接收一个参数，当前点的几何对象。
     * cancel - 绘制过程中关闭当前事件处理器的监听时调用，回调函数接收当前要素的几何对象作为参数。
     */
    initialize: function(control, callbacks, options) {
        OpenLayers.Handler.Plotting.prototype.initialize.apply(this, arguments);
    },

    /**
     * Method: createFeature
     * create temporary features
     *
     * Parameters:
     * pixel - {<OpenLayers.Pixel>} A pixel location on the map.
     */
    createFeature: function(pixel) {
        var lonlat = this.layer.getLonLatFromViewPortPx(pixel);
        var geometry = new OpenLayers.Geometry.Point(
            lonlat.lon, lonlat.lat
        );
        this.point = new OpenLayers.Feature.Vector(geometry);

        //标绘扩展符号的 Geometry 类型为 GeoCurveFlag
        this.plotting = new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.GeoCurveFlag()
        );

        this.callback("create", [this.point.geometry, this.getSketch()]);
        this.point.geometry.clearBounds();
    },


    /**
     * Method: up
     * 操作 mouseup 和 touchend.
     * 发送最后一个 mouseup 点。
     *
     * Parameters:
     * evt - {Event} 浏览器事件，evt.xy 为最后一个 mouseup 的像素位置。
     *
     * Returns:
     * {Boolean} 是否允许事件继续在 map 上传送
     */
    up: function(evt) {
        this.mouseDown = false;
        this.stoppedDown = this.stopDown;

        // ignore double-clicks
        if (this.lastUp && this.lastUp.equals(evt.xy)) {
            return true;
        }

        if (this.lastDown && this.passesTolerance(this.lastDown, evt.xy, this.pixelTolerance)) {
            if (this.touch) {
                this.modifyFeature(evt.xy);
            }
            if (this.persist) {
                this.destroyPersistedFeature();
            }
            this.lastUp = evt.xy;

            this.addControlPoint(evt.xy);
            var len = this.controlPoints.length;
            if (len == 1) {
                this.isDrawing = true;
            } else if (len == 2) {
                this.drawComplete();
            } else {
                this.isDrawing = false;
                this.controlPoints = [];
                this.plotting = null
            }

            return true;
        } else {
            return true;
        }
    },

    /**
     * Method: touchstart
     * Handle touchstart.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    touchstart: function(evt) {
        if (!this.touch) {
            this.touch = true;
            // unregister mouse listeners
            this.map.events.un({
                mousedown: this.mousedown,
                mouseup: this.mouseup,
                mousemove: this.mousemove,
                click: this.click,
                dblclick: this.dblclick,
                scope: this
            });
        }
        this.map.isIESingleTouch = false;
        this.modifyFeature(evt.xy);
        if (this.persist) {
            this.destroyPersistedFeature();
        }
        this.addControlPoint(evt.xy);
        var len = this.controlPoints.length;
        if (len >= 1) {
            this.isDrawing = true;
        }
        return true;
    },
    /**
     * Method: touchend
     * Handle touchend.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    touchend: function(evt) {
        this.drawComplete();
        this.map.isIESingleTouch = true;
        return false;
    },
    /**
     * Method: touchmove
     * Handle touchmove.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    touchmove: function(evt) {
        this.lastTouchPx = evt.xy;
        this.modifyFeature(evt.xy);
        return true;
    },
    CLASS_NAME: "OpenLayers.Handler.CurveFlag"
});


/**
 * @requires OpenLayers/Handler/Plotting.js
 * @requires OpenLayers/Geometry/GeoDiagonalArrow.js
 */

/**
 * Class: OpenLayers.Handler.DiagonalArrow
 * 在地图上绘制斜箭头的事件处理器。
 * 绘制点在激活后显示，随着鼠标移动而移动，在鼠标第一次松开后开始绘制，在鼠标第四次松开后完成绘制。
 * 该处理器会触发标记为"done"、"cancel"和“modify"的事件回调。其中modify回调会在每一次变化时被调用并传入最近一次绘制的点。
 * 使用 <OpenLayers.Handler.DiagonalArrow> 构造函数可以创建一个新的绘制斜箭头的事件处理器实例。
 *
 * Inherits from:
 *  - <OpenLayers.Handler.Plotting>
 */
OpenLayers.Handler.DiagonalArrow = OpenLayers.Class(OpenLayers.Handler.Plotting, {
    /**
     * Constructor: OpenLayers.Handler.DiagonalArrow
     * 构造函数，创建一个新的绘制斜箭头的事件处理器。
     *
     * Parameters:
     * control - {<OpenLayers.Control>} 构建当前事件处理器的控件对象。
     * callbacks - {Object} 回调函数对象。关于回调的具体描述参见下文。
     * options - {Object} 一个可选对象，其属性将会赋值到事件处理器对象上。
     *
     * Named callbacks:
     * create - 当要素草图第一次创建的时候调用，回调函数需接收两个参数：当前点几何对象、当前要素。
     * modify - 顶点的每一次变化时调用，回调函数接受参数：几何点对象、当前要素。
     * done - 当绘制点操作完成时调用，回调函数接收一个参数，当前点的几何对象。
     * cancel - 绘制过程中关闭当前事件处理器的监听时调用，回调函数接收当前要素的几何对象作为参数。
     */
    initialize: function(control, callbacks, options) {
        OpenLayers.Handler.Plotting.prototype.initialize.apply(this, arguments);
    },

    /**
     * Method: createFeature
     * create temporary features
     *
     * Parameters:
     * pixel - {<OpenLayers.Pixel>} A pixel location on the map.
     */
    createFeature: function(pixel) {
        var lonlat = this.layer.getLonLatFromViewPortPx(pixel);
        var geometry = new OpenLayers.Geometry.Point(
            lonlat.lon, lonlat.lat
        );
        this.point = new OpenLayers.Feature.Vector(geometry);

        //标绘扩展符号的 Geometry 类型为 GeoDiagonalArrow
        this.plotting = new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.GeoDiagonalArrow()
        );

        this.callback("create", [this.point.geometry, this.getSketch()]);
        this.point.geometry.clearBounds();
    },

    /**
     * Method: down
     * Handle mousedown and touchstart.  Add a new point to the Geometry and
     * render it. Return determines whether to propagate the event on the map.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    down: function(evt) {
        this.mouseDown = true;
        this.lastDown = evt.xy;
        if (this.touch) { // no point displayed until up on touch devices
            this.modifyFeature(evt.xy);
            OpenLayers.Event.stop(evt);
        }
        this.stoppedDown = this.stopDown;
        return !this.stopDown;
    },

    /**
     * Method: up
     * 操作 mouseup 和 touchend.
     * 发送最后一个 mouseup 点。
     *
     * Parameters:
     * evt - {Event} 浏览器事件，evt.xy 为最后一个 mouseup 的像素位置。
     *
     * Returns:
     * {Boolean} 是否允许事件继续在 map 上传送
     */
    up: function(evt) {
        this.mouseDown = false;
        this.stoppedDown = this.stopDown;

        //ignore double-clicks
        if (this.lastUp && this.lastUp.equals(evt.xy)) {
            return true;
        }

        if (this.lastDown && this.passesTolerance(this.lastDown, evt.xy, this.pixelTolerance)) {
            if (this.touch) {
                this.modifyFeature(evt.xy);
            }
            if (this.persist) {
                this.destroyPersistedFeature();
            }
            this.lastUp = evt.xy;

            this.addControlPoint(evt.xy);
            var len = this.controlPoints.length;
            if (len == 1) {
                this.isDrawing = true;
            }

            return true;
        } else {
            return true;
        }
    },

    /**
     * Method: dblclick
     * Handle double-clicks.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    dblclick: function(evt) {
        this.drawComplete();
        return false;
    },

    /**
     * Method: touchstart
     * Handle touchstart.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    touchstart: function(evt) {
        if (this.lastTouchPx && this.passesTolerance(this.lastTouchPx, evt.xy, this.pixelTolerance)) {
            evt.preventDefault();
            this.drawComplete();
            this.isDrawing = false;
            return false;
        }
        if (!this.touch) {
            this.touch = true;
            // unregister mouse listeners
            this.map.events.un({
                mousedown: this.mousedown,
                mouseup: this.mouseup,
                mousemove: this.mousemove,
                click: this.click,
                dblclick: this.dblclick,
                scope: this
            });
        }
        this.lastTouchPx = evt.xy;
        return this.down(evt);
    },
    /**
     * APIMethod: down
     * Handle mousedown and touchstart.  Adjust the Geometry and redraw.
     * Return determines whether to propagate the event on the map.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    down: function(evt) {
        this.mouseDown = true;
        this.lastDown = evt.xy;
        this.isDrawing = true;
        if (!this.touch) {
            this.modifyFeature(evt.xy);
        }
        this.stoppedDown = this.stopDown;
        return !this.stopDown;
    },

    /**
     * Method: touchend
     * Handle touchend.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    touchend: function(evt) {
        if (this.isDrawing) {
            evt.xy = this.lastTouchPx;
            return this.up(evt);
        }

    },
    CLASS_NAME: "OpenLayers.Handler.DiagonalArrow"
});


/**
 * @requires OpenLayers/Handler/Plotting.js
 * @requires OpenLayers/Geometry/GeoDoubleArrow.js
 */

/**
 * Class: OpenLayers.Handler.DoubleArrow
 * 在地图上绘制双箭头的事件处理器。
 * 绘制点在激活后显示，随着鼠标移动而移动，在鼠标第一次松开后开始绘制，双击鼠标完成绘制。
 * 该处理器会触发标记为"done"、"cancel"和“modify"的事件回调。其中modify回调会在每一次变化时被调用并传入最近一次绘制的点。
 * 使用 <OpenLayers.Handler.DoubleArrow> 构造函数可以创建一个新的绘制双箭头的事件处理器实例。
 *
 * Inherits from:
 *  - <OpenLayers.Handler.Plotting>
 */
OpenLayers.Handler.DoubleArrow = OpenLayers.Class(OpenLayers.Handler.Plotting, {
    /**
     * Constructor: OpenLayers.Handler.DoubleArrow
     * 构造函数，创建一个新的绘制双箭头的事件处理器。
     *
     * Parameters:
     * control - {<OpenLayers.Control>} 构建当前事件处理器的控件对象。
     * callbacks - {Object} 回调函数对象。关于回调的具体描述参见下文。
     * options - {Object} 一个可选对象，其属性将会赋值到事件处理器对象上。
     *
     * Named callbacks:
     * create - 当要素草图第一次创建的时候调用，回调函数需接收两个参数：当前点几何对象、当前要素。
     * modify - 顶点的每一次变化时调用，回调函数接受参数：几何点对象、当前要素。
     * done - 当绘制点操作完成时调用，回调函数接收一个参数，当前点的几何对象。
     * cancel - 绘制过程中关闭当前事件处理器的监听时调用，回调函数接收当前要素的几何对象作为参数。
     */
    initialize: function(control, callbacks, options) {
        OpenLayers.Handler.Plotting.prototype.initialize.apply(this, arguments);
    },

    /**
     * Method: createFeature
     * create temporary features
     *
     * Parameters:
     * pixel - {<OpenLayers.Pixel>} A pixel location on the map.
     */
    createFeature: function(pixel) {
        var lonlat = this.layer.getLonLatFromViewPortPx(pixel);
        var geometry = new OpenLayers.Geometry.Point(
            lonlat.lon, lonlat.lat
        );
        this.point = new OpenLayers.Feature.Vector(geometry);

        //标绘扩展符号的 Geometry 类型为 GeoDoubleArrow
        this.plotting = new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.GeoDoubleArrow()
        );

        this.callback("create", [this.point.geometry, this.getSketch()]);
        this.point.geometry.clearBounds();
    },

    /**
     * APIMethod: modifyFeature
     * 针对双箭头重新父类此方法。
     *
     * Parameters:
     * pixel - {<OpenLayers.Pixel>} 鼠标在地图上的当前像素位置
     */
    modifyFeature: function(pixel) {
        //忽略Chrome mouseup触发瞬间 mousemove 产生的相同点
        if (this.lastUp && this.lastUp.equals(pixel)) {
            return true;
        }

        //新建标绘扩展符号
        if (!this.point || !this.plotting) {
            this.createFeature(pixel);
        }

        //修改临时点的位置
        var lonlat = this.layer.getLonLatFromViewPortPx(pixel);
        this.point.geometry.x = lonlat.lon;
        this.point.geometry.y = lonlat.lat;

        if (this.isDrawing == true) {
            var geometry = new OpenLayers.Geometry.Point(
                lonlat.lon, lonlat.lat
            );

            var len = this.controlPoints.length;
            if (len == 2) {
                var offX = this.controlPoints[1].x - this.controlPoints[0].x;
                var offY = this.controlPoints[1].y - this.controlPoints[0].y;

                //第四个控制点
                var geometry2 = new OpenLayers.Geometry.Point(
                    (lonlat.lon - offX), (lonlat.lat - offY)
                );
                var cp = this.controlPoints.concat([geometry, geometry2]);
            } else if (len == 3) {
                var cp = this.controlPoints.concat([geometry]);
            }
            //重新设置标绘扩展符号的控制点
            this.plotting.geometry._controlPoints = this.cloneControlPoints(cp);
            //重新计算标绘扩展符号的geometry
            this.plotting.geometry.calculateParts();
        }

        this.callback("modify", [this.point.geometry, this.getSketch(), false]);
        this.point.geometry.clearBounds();
        this.drawFeature();
    },

    /**
     * Method: up
     * 操作 mouseup 和 touchend.
     * 发送最后一个 mouseup 点。
     *
     * Parameters:
     * evt - {Event} 浏览器事件，evt.xy 为最后一个 mouseup 的像素位置。
     *
     * Returns:
     * {Boolean} 是否允许事件继续在 map 上传送
     */
    up: function(evt) {
        this.mouseDown = false;
        this.stoppedDown = this.stopDown;

        // ignore double-clicks
        if (this.lastUp && this.lastUp.equals(evt.xy)) {
            return true;
        }

        if (this.lastDown && this.passesTolerance(this.lastDown, evt.xy, this.pixelTolerance)) {
            if (this.touch) {
                this.modifyFeature(evt.xy);
            }
            if (this.persist) {
                this.destroyPersistedFeature();
            }
            this.lastUp = evt.xy;

            this.addControlPoint(evt.xy);
            var len = this.controlPoints.length;
            if (len == 1) {} else if (len == 2 || len == 3) {
                this.isDrawing = true;
            } else if (len == 4) {
                this.drawComplete();
            } else {
                this.isDrawing = false;
                this.controlPoints = [];
                this.plotting = null
            }

            return true;
        } else {
            return true;
        }
    },

    CLASS_NAME: "OpenLayers.Handler.DoubleArrow"
});


/**
 * @requires OpenLayers/Handler/Plotting.js
 * @requires OpenLayers/Geometry/GeoDoveTailDiagonalArrow.js
 */

/**
 * Class: OpenLayers.Handler.DoveTailDiagonalArrow
 * 在地图上绘制燕尾尾巴斜箭头的事件处理器。
 * 绘制点在激活后显示，随着鼠标移动而移动，在鼠标第一次松开后开始绘制，在鼠标第四次松开后完成绘制。
 * 该处理器会触发标记为"done"、"cancel"和“modify"的事件回调。其中modify回调会在每一次变化时被调用并传入最近一次绘制的点。
 * 使用 <OpenLayers.Handler.DoveTailDiagonalArrow> 构造函数可以创建一个新的绘制燕尾斜箭头的事件处理器实例。
 *
 * Inherits from:
 *  - <OpenLayers.Handler.Plotting>
 */
OpenLayers.Handler.DoveTailDiagonalArrow = OpenLayers.Class(OpenLayers.Handler.Plotting, {
    /**
     * Constructor: OpenLayers.Handler.DoveTailDiagonalArrow
     * 构造函数，创建一个新的绘制燕尾斜箭头的事件处理器。
     *
     * Parameters:
     * control - {<OpenLayers.Control>} 构建当前事件处理器的控件对象。
     * callbacks - {Object} 回调函数对象。关于回调的具体描述参见下文。
     * options - {Object} 一个可选对象，其属性将会赋值到事件处理器对象上。
     *
     * Named callbacks:
     * create - 当要素草图第一次创建的时候调用，回调函数需接收两个参数：当前点几何对象、当前要素。
     * modify - 顶点的每一次变化时调用，回调函数接受参数：几何点对象、当前要素。
     * done - 当绘制点操作完成时调用，回调函数接收一个参数，当前点的几何对象。
     * cancel - 绘制过程中关闭当前事件处理器的监听时调用，回调函数接收当前要素的几何对象作为参数。
     */
    initialize: function(control, callbacks, options) {
        OpenLayers.Handler.Plotting.prototype.initialize.apply(this, arguments);
    },

    /**
     * Method: createFeature
     * create temporary features
     *
     * Parameters:
     * pixel - {<OpenLayers.Pixel>} A pixel location on the map.
     */
    createFeature: function(pixel) {
        var lonlat = this.layer.getLonLatFromViewPortPx(pixel);
        var geometry = new OpenLayers.Geometry.Point(
            lonlat.lon, lonlat.lat
        );
        this.point = new OpenLayers.Feature.Vector(geometry);

        //标绘扩展符号的 Geometry 类型为 GeoDoveTailDiagonalArrow
        this.plotting = new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.GeoDoveTailDiagonalArrow()
        );

        this.callback("create", [this.point.geometry, this.getSketch()]);
        this.point.geometry.clearBounds();
    },

    /**
     * Method: destroyPersistedFeature
     * Destroy the persisted feature.
     */
    destroyPersistedFeature: function() {
        var layer = this.layer;
        if (layer && layer.features.length > 2) {
            this.layer.features[0].destroy();
        }
    },

    /**
     * Method: down
     * Handle mousedown and touchstart.  Add a new point to the Geometry and
     * render it. Return determines whether to propagate the event on the map.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    down: function(evt) {
        this.mouseDown = true;
        this.lastDown = evt.xy;
        if (this.touch) { // no point displayed until up on touch devices
            this.modifyFeature(evt.xy);
            OpenLayers.Event.stop(evt);
        }
        this.stoppedDown = this.stopDown;
        return !this.stopDown;
    },

    /**
     * Method: up
     * 操作 mouseup 和 touchend.
     * 发送最后一个 mouseup 点。
     *
     * Parameters:
     * evt - {Event} 浏览器事件，evt.xy 为最后一个 mouseup 的像素位置。
     *
     * Returns:
     * {Boolean} 是否允许事件继续在 map 上传送
     */
    up: function(evt) {
        this.mouseDown = false;
        this.stoppedDown = this.stopDown;

        //ignore double-clicks
        if (this.lastUp && this.lastUp.equals(evt.xy)) {
            return true;
        }

        if (this.lastDown && this.passesTolerance(this.lastDown, evt.xy, this.pixelTolerance)) {
            if (this.touch) {
                this.modifyFeature(evt.xy);
            }
            if (this.persist) {
                this.destroyPersistedFeature();
            }
            this.lastUp = evt.xy;

            this.addControlPoint(evt.xy);
            var len = this.controlPoints.length;
            if (len == 1) {
                this.isDrawing = true;
            }

            return true;
        } else {
            return true;
        }
    },

    /**
     * Method: dblclick
     * Handle double-clicks.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    dblclick: function(evt) {
        this.drawComplete();
        return false;
    },

    /**
     * Method: touchstart
     * Handle touchstart.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    touchstart: function(evt) {
        if (this.lastTouchPx && this.passesTolerance(this.lastTouchPx, evt.xy, this.pixelTolerance)) {
            evt.preventDefault();
            this.drawComplete();
            this.isDrawing = false;
            return false;
        }
        if (!this.touch) {
            this.touch = true;
            // unregister mouse listeners
            this.map.events.un({
                mousedown: this.mousedown,
                mouseup: this.mouseup,
                mousemove: this.mousemove,
                click: this.click,
                dblclick: this.dblclick,
                scope: this
            });
        }
        this.lastTouchPx = evt.xy;
        return this.down(evt);
    },
    /**
     * APIMethod: down
     * Handle mousedown and touchstart.  Adjust the Geometry and redraw.
     * Return determines whether to propagate the event on the map.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    down: function(evt) {
        this.mouseDown = true;
        this.lastDown = evt.xy;
        this.isDrawing = true;
        if (!this.touch) {
            this.modifyFeature(evt.xy);
        }
        this.stoppedDown = this.stopDown;
        return !this.stopDown;
    },

    /**
     * Method: touchend
     * Handle touchend.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    touchend: function(evt) {
        if (this.isDrawing) {
            evt.xy = this.lastTouchPx;
            return this.up(evt);
        }

    },
    CLASS_NAME: "OpenLayers.Handler.DoveTailDiagonalArrow"
});


/**
 * @requires OpenLayers/Handler/Plotting.js
 * @requires OpenLayers/Geometry/GeoDoveTailStraightArrow.js
 */

/**
 * Class: OpenLayers.Handler.DoveTailStraightArrow
 * 在地图上绘制燕尾直箭头的事件处理器。
 * 绘制点在激活后显示，随着鼠标移动而移动，在鼠标第一次松开后开始绘制，双击鼠标完成绘制。
 * 该处理器会触发标记为"done"、"cancel"和“modify"的事件回调。其中modify回调会在每一次变化时被调用并传入最近一次绘制的点。
 * 使用 <OpenLayers.Handler.DoveTailStraightArrow> 构造函数可以创建一个新的绘制燕尾直箭头的事件处理器实例。
 *
 * Inherits from:
 *  - <OpenLayers.Handler.Plotting>
 */
OpenLayers.Handler.DoveTailStraightArrow = OpenLayers.Class(OpenLayers.Handler.Plotting, {
    /**
     * Constructor: OpenLayers.Handler.DoveTailStraightArrow
     * 构造函数，创建一个新的绘制燕尾直箭头的事件处理器。
     *
     * Parameters:
     * control - {<OpenLayers.Control>} 构建当前事件处理器的控件对象。
     * callbacks - {Object} 回调函数对象。关于回调的具体描述参见下文。
     * options - {Object} 一个可选对象，其属性将会赋值到事件处理器对象上。
     *
     * Named callbacks:
     * create - 当要素草图第一次创建的时候调用，回调函数需接收两个参数：当前点几何对象、当前要素。
     * modify - 顶点的每一次变化时调用，回调函数接受参数：几何点对象、当前要素。
     * done - 当绘制点操作完成时调用，回调函数接收一个参数，当前点的几何对象。
     * cancel - 绘制过程中关闭当前事件处理器的监听时调用，回调函数接收当前要素的几何对象作为参数。
     */
    initialize: function(control, callbacks, options) {
        OpenLayers.Handler.Plotting.prototype.initialize.apply(this, arguments);
    },

    /**
     * Method: createFeature
     * create temporary features
     *
     * Parameters:
     * pixel - {<OpenLayers.Pixel>} A pixel location on the map.
     */
    createFeature: function(pixel) {
        var lonlat = this.layer.getLonLatFromViewPortPx(pixel);
        var geometry = new OpenLayers.Geometry.Point(
            lonlat.lon, lonlat.lat
        );
        this.point = new OpenLayers.Feature.Vector(geometry);

        //标绘扩展符号的 Geometry 类型为 GeoDoveTailStraightArrow
        this.plotting = new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.GeoDoveTailStraightArrow()
        );

        this.callback("create", [this.point.geometry, this.getSketch()]);
        this.point.geometry.clearBounds();
    },

    /**
     * Method: destroyPersistedFeature
     * Destroy the persisted feature.
     */
    destroyPersistedFeature: function() {
        var layer = this.layer;
        if (layer && layer.features.length > 2) {
            this.layer.features[0].destroy();
        }
    },

    /**
     * Method: down
     * Handle mousedown and touchstart.  Add a new point to the Geometry and
     * render it. Return determines whether to propagate the event on the map.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    down: function(evt) {
        this.mouseDown = true;
        this.lastDown = evt.xy;
        if (this.touch) { // no point displayed until up on touch devices
            this.modifyFeature(evt.xy);
            OpenLayers.Event.stop(evt);
        }
        this.stoppedDown = this.stopDown;
        return !this.stopDown;
    },

    /**
     * Method: up
     * 操作 mouseup 和 touchend.
     * 发送最后一个 mouseup 点。
     *
     * Parameters:
     * evt - {Event} 浏览器事件，evt.xy 为最后一个 mouseup 的像素位置。
     *
     * Returns:
     * {Boolean} 是否允许事件继续在 map 上传送
     */
    up: function(evt) {
        this.mouseDown = false;
        this.stoppedDown = this.stopDown;

        //ignore double-clicks
        if (this.lastUp && this.lastUp.equals(evt.xy)) {
            return true;
        }

        if (this.lastDown && this.passesTolerance(this.lastDown, evt.xy, this.pixelTolerance)) {
            if (this.touch) {
                this.modifyFeature(evt.xy);
            }
            if (this.persist) {
                this.destroyPersistedFeature();
            }
            this.lastUp = evt.xy;

            this.addControlPoint(evt.xy);
            var len = this.controlPoints.length;
            if (len == 1) {
                this.isDrawing = true;
            }

            return true;
        } else {
            return true;
        }
    },

    /**
     * Method: dblclick
     * Handle double-clicks.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    dblclick: function(evt) {
        this.drawComplete();
        return false;
    },

    /**
     * Method: touchstart
     * Handle touchstart.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    touchstart: function(evt) {
        if (this.lastTouchPx && this.passesTolerance(this.lastTouchPx, evt.xy, this.pixelTolerance)) {
            evt.preventDefault();
            this.drawComplete();
            this.isDrawing = false;
            return false;
        }
        if (!this.touch) {
            this.touch = true;
            // unregister mouse listeners
            this.map.events.un({
                mousedown: this.mousedown,
                mouseup: this.mouseup,
                mousemove: this.mousemove,
                click: this.click,
                dblclick: this.dblclick,
                scope: this
            });
        }
        this.lastTouchPx = evt.xy;
        return this.down(evt);
    },
    /**
     * APIMethod: down
     * Handle mousedown and touchstart.  Adjust the Geometry and redraw.
     * Return determines whether to propagate the event on the map.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    down: function(evt) {
        this.mouseDown = true;
        this.lastDown = evt.xy;
        this.isDrawing = true;
        if (!this.touch) {
            this.modifyFeature(evt.xy);
        }
        this.stoppedDown = this.stopDown;
        return !this.stopDown;
    },

    /**
     * Method: touchend
     * Handle touchend.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    touchend: function(evt) {
        if (this.isDrawing) {
            evt.xy = this.lastTouchPx;
            return this.up(evt);
        }

    },
    CLASS_NAME: "OpenLayers.Handler.DoveTailStraightArrow"
});


/**
 * @requires OpenLayers/Handler/Plotting.js
 * @requires OpenLayers/Geometry/GeoParallelSearch.js
 */

/**
 * Class: OpenLayers.Handler.ParallelSearch
 * 在地图上绘制聚集地符号的事件处理器。
 * 绘制点在激活后显示，随着鼠标移动而移动，在鼠标第一次松开后开始绘制，在鼠标第二次松开后完成绘制。
 * 该处理器会触发标记为"done"、"cancel"和“modify"的事件回调。其中modify回调会在每一次变化时被调用并传入最近一次绘制的点。
 * 使用 <OpenLayers.Handler.ParallelSearch> 构造函数可以创建一个新的绘制聚集地符号的事件处理器实例。
 *
 * Inherits from:
 *  - <OpenLayers.Handler.Plotting>
 
 */
OpenLayers.Handler.ParallelSearch = OpenLayers.Class(OpenLayers.Handler.Plotting, {
    /**
     * Constructor: OpenLayers.Handler.ParallelSearch
     * 构造函数，创建一个新的绘制聚集地符号的事件处理器。
     *
     * Parameters:
     * control - {<OpenLayers.Control>} 构建当前事件处理器的控件对象。
     * callbacks - {Object} 回调函数对象。关于回调的具体描述参见下文。
     * options - {Object} 一个可选对象，其属性将会赋值到事件处理器对象上。
     *
     * Named callbacks:
     * create - 当要素草图第一次创建的时候调用，回调函数需接收两个参数：当前点几何对象、当前要素。
     * modify - 顶点的每一次变化时调用，回调函数接受参数：几何点对象、当前要素。
     * done - 当绘制点操作完成时调用，回调函数接收一个参数，当前点的几何对象。
     * cancel - 绘制过程中关闭当前事件处理器的监听时调用，回调函数接收当前要素的几何对象作为参数。
     */
    initialize: function(control, callbacks, options) {
        OpenLayers.Handler.Plotting.prototype.initialize.apply(this, arguments);
    },

    /**
     * Method: createFeature
     * create temporary features
     *
     * Parameters:
     * pixel - {<OpenLayers.Pixel>} A pixel location on the map.
     */
    createFeature: function(pixel) {
        var lonlat = this.layer.getLonLatFromViewPortPx(pixel);
        var geometry = new OpenLayers.Geometry.Point(
            lonlat.lon, lonlat.lat
        );
        this.point = new OpenLayers.Feature.Vector(geometry);

        //标绘扩展符号的 Geometry 类型为 GeoParallelSearch
        this.plotting = new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.GeoParallelSearch()
        );

        this.callback("create", [this.point.geometry, this.getSketch()]);
        this.point.geometry.clearBounds();
    },

    /**
     * Method: up
     * 操作 mouseup 和 touchend.
     * 发送最后一个 mouseup 点。
     *
     * Parameters:
     * evt - {Event} 浏览器事件，evt.xy 为最后一个 mouseup 的像素位置。
     *
     * Returns:
     * {Boolean} 是否允许事件继续在 map 上传送
     */
    up: function(evt) {
        this.mouseDown = false;
        this.stoppedDown = this.stopDown;

        //ignore double-clicks
        if (this.lastUp && this.lastUp.equals(evt.xy)) {
            return true;
        }

        if (this.lastDown && this.passesTolerance(this.lastDown, evt.xy, this.pixelTolerance)) {
            if (this.touch) {
                this.modifyFeature(evt.xy);
            }
            if (this.persist) {
                this.destroyPersistedFeature();
            }
            this.lastUp = evt.xy;

            this.addControlPoint(evt.xy);
            var len = this.controlPoints.length;
            if (len > 0) {
                this.isDrawing = true;
            }
            return true;
        } else {
            return true;
        }

    },
    /**
     * Method: dblclick
     * Handle double-clicks.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    dblclick: function(evt) {
        this.drawComplete();
        return false;
    },

    /**
     * Method: touchstart
     * Handle touchstart.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    touchstart: function(evt) {
        if (this.lastTouchPx && this.passesTolerance(this.lastTouchPx, evt.xy, this.pixelTolerance)) {
            evt.preventDefault();
            this.drawComplete();
            this.isDrawing = false;
            return false;
        }
        if (!this.touch) {
            this.touch = true;
            // unregister mouse listeners
            this.map.events.un({
                mousedown: this.mousedown,
                mouseup: this.mouseup,
                mousemove: this.mousemove,
                click: this.click,
                dblclick: this.dblclick,
                scope: this
            });
        }
        this.lastTouchPx = evt.xy;
        return this.down(evt);
    },
    /**
     * APIMethod: down
     * Handle mousedown and touchstart.  Adjust the Geometry and redraw.
     * Return determines whether to propagate the event on the map.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    down: function(evt) {
        this.mouseDown = true;
        this.lastDown = evt.xy;
        this.isDrawing = true;
        if (!this.touch) {
            this.modifyFeature(evt.xy);
        }
        this.stoppedDown = this.stopDown;
        return !this.stopDown;
    },

    /**
     * Method: touchend
     * Handle touchend.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    touchend: function(evt) {
        if (this.isDrawing) {
            evt.xy = this.lastTouchPx;
            return this.up(evt);
        }

    },
    CLASS_NAME: "OpenLayers.Handler.ParallelSearch"
});


/**
 * @requires OpenLayers/Handler.js
 * @requires OpenLayers/Geometry/GeoRectFlag.js
 */

/**
 * Class: OpenLayers.Handler.RectFlag
 * 在地图上绘制矩形旗标的事件处理器。
 * 绘制点在激活后显示，随着鼠标移动而移动，在鼠标第一次松开后开始绘制，在鼠标第二次松开后完成绘制。
 * 该处理器会触发标记为"done"、"cancel"和“modify"的事件回调。其中modify回调会在每一次变化时被调用并传入最近一次绘制的点。
 * 使用 <OpenLayers.Handler.RectFlag> 构造函数可以创建一个新的绘制直箭头的事件处理器实例。
 *
 * Inherits from:
 *  - <OpenLayers.Handler.Plotting>
 */
OpenLayers.Handler.RectFlag = OpenLayers.Class(OpenLayers.Handler.Plotting, {
    /**
     * Constructor: OpenLayers.Handler.RectFlag
     * 构造函数，创建一个新的绘制直角旗标的事件处理器。
     *
     * Parameters:
     * control - {<OpenLayers.Control>} 构建当前事件处理器的控件对象。
     * callbacks - {Object} 回调函数对象。关于回调的具体描述参见下文。
     * options - {Object} 一个可选对象，其属性将会赋值到事件处理器对象上。
     *
     * Named callbacks:
     * create - 当要素草图第一次创建的时候调用，回调函数需接收两个参数：当前点几何对象、当前要素。
     * modify - 顶点的每一次变化时调用，回调函数接受参数：几何点对象、当前要素。
     * done - 当绘制点操作完成时调用，回调函数接收一个参数，当前点的几何对象。
     * cancel - 绘制过程中关闭当前事件处理器的监听时调用，回调函数接收当前要素的几何对象作为参数。
     */
    initialize: function(control, callbacks, options) {
        OpenLayers.Handler.Plotting.prototype.initialize.apply(this, arguments);
    },

    /**
     * Method: createFeature
     * create temporary features
     *
     * Parameters:
     * pixel - {<OpenLayers.Pixel>} A pixel location on the map.
     */
    createFeature: function(pixel) {
        var lonlat = this.layer.getLonLatFromViewPortPx(pixel);
        var geometry = new OpenLayers.Geometry.Point(
            lonlat.lon, lonlat.lat
        );
        this.point = new OpenLayers.Feature.Vector(geometry);

        //标绘扩展符号的 Geometry 类型为 GeoRectFlag
        this.plotting = new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.GeoRectFlag()
        );

        this.callback("create", [this.point.geometry, this.getSketch()]);
        this.point.geometry.clearBounds();
    },

    /**
     * Method: destroyPersistedFeature
     * Destroy the persisted feature.
     */
    destroyPersistedFeature: function() {
        var layer = this.layer;
        if (layer && layer.features.length > 2) {
            this.layer.features[0].destroy();
        }
    },

    /**
     * Method: up
     * 操作 mouseup 和 touchend.
     * 发送最后一个 mouseup 点。
     *
     * Parameters:
     * evt - {Event} 浏览器事件，evt.xy 为最后一个 mouseup 的像素位置。
     *
     * Returns:
     * {Boolean} 是否允许事件继续在 map 上传送
     */
    up: function(evt) {
        this.mouseDown = false;
        this.stoppedDown = this.stopDown;

        // ignore double-clicks
        if (this.lastUp && this.lastUp.equals(evt.xy)) {
            return true;
        }

        if (this.lastDown && this.passesTolerance(this.lastDown, evt.xy, this.pixelTolerance)) {
            if (this.touch) {
                this.modifyFeature(evt.xy);
            }
            if (this.persist) {
                this.destroyPersistedFeature();
            }
            this.lastUp = evt.xy;

            this.addControlPoint(evt.xy);
            var len = this.controlPoints.length;
            if (len == 1) {
                this.isDrawing = true;
            } else if (len == 2) {
                this.drawComplete();
            } else {
                this.isDrawing = false;
                this.controlPoints = [];
                this.plotting = null
            }

            return true;
        } else {
            return true;
        }
    },

    /**
     * Method: touchstart
     * Handle touchstart.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    touchstart: function(evt) {
        if (!this.touch) {
            this.touch = true;
            // unregister mouse listeners
            this.map.events.un({
                mousedown: this.mousedown,
                mouseup: this.mouseup,
                mousemove: this.mousemove,
                click: this.click,
                dblclick: this.dblclick,
                scope: this
            });
        }
        this.map.isIESingleTouch = false;
        this.modifyFeature(evt.xy);
        if (this.persist) {
            this.destroyPersistedFeature();
        }
        this.addControlPoint(evt.xy);
        var len = this.controlPoints.length;
        if (len >= 1) {
            this.isDrawing = true;
        }
        return true;
    },
    /**
     * Method: touchend
     * Handle touchend.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    touchend: function(evt) {
        this.drawComplete();
        this.map.isIESingleTouch = true;
        return false;
    },
    /**
     * Method: touchmove
     * Handle touchmove.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    touchmove: function(evt) {
        this.lastTouchPx = evt.xy;
        this.modifyFeature(evt.xy);
        return true;
    },
    CLASS_NAME: "OpenLayers.Handler.RectFlag"
});


/**
 * @requires OpenLayers/Handler/Plotting
 * @requires OpenLayers/Geometry/GeoParallelSearch
 */

/**
 * Class: OpenLayers.Handler.SectorSearch
 * 在地图上绘制聚集地符号的事件处理器。
 * 绘制点在激活后显示，随着鼠标移动而移动，在鼠标第一次松开后开始绘制，在鼠标第二次松开后完成绘制。
 * 该处理器会触发标记为"done"、"cancel"和“modify"的事件回调。其中modify回调会在每一次变化时被调用并传入最近一次绘制的点。
 * 使用 <OpenLayers.Handler.SectorSearch> 构造函数可以创建一个新的绘制聚集地符号的事件处理器实例。
 *
 * Inherits from:
 *  - <OpenLayers.Handler.Plotting>
 
 */
OpenLayers.Handler.SectorSearch = OpenLayers.Class(OpenLayers.Handler.Plotting, {
    /**
     * Constructor: OpenLayers.Handler.SectorSearch
     * 构造函数，创建一个新的绘制聚集地符号的事件处理器。
     *
     * Parameters:
     * control - {<OpenLayers.Control>} 构建当前事件处理器的控件对象。
     * callbacks - {Object} 回调函数对象。关于回调的具体描述参见下文。
     * options - {Object} 一个可选对象，其属性将会赋值到事件处理器对象上。
     *
     * Named callbacks:
     * create - 当要素草图第一次创建的时候调用，回调函数需接收两个参数：当前点几何对象、当前要素。
     * modify - 顶点的每一次变化时调用，回调函数接受参数：几何点对象、当前要素。
     * done - 当绘制点操作完成时调用，回调函数接收一个参数，当前点的几何对象。
     * cancel - 绘制过程中关闭当前事件处理器的监听时调用，回调函数接收当前要素的几何对象作为参数。
     */
    initialize: function(control, callbacks, options) {
        OpenLayers.Handler.Plotting.prototype.initialize.apply(this, arguments);
    },

    /**
     * Method: createFeature
     * create temporary features
     *
     * Parameters:
     * pixel - {<OpenLayers.Pixel>} A pixel location on the map.
     */
    createFeature: function(pixel) {
        var lonlat = this.layer.getLonLatFromViewPortPx(pixel);
        var geometry = new OpenLayers.Geometry.Point(
            lonlat.lon, lonlat.lat
        );
        this.point = new OpenLayers.Feature.Vector(geometry);

        //标绘扩展符号的 Geometry 类型为 GeoSectorSearch
        this.plotting = new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.GeoSectorSearch()
        );

        this.callback("create", [this.point.geometry, this.getSketch()]);
        this.point.geometry.clearBounds();
    },

    /**
     * Method: destroyPersistedFeature
     * Destroy the persisted feature.
     */
    destroyPersistedFeature: function() {
        var layer = this.layer;
        if (layer && layer.features.length > 2) {
            this.layer.features[0].destroy();
        }
    },

    /**
     * Method: up
     * 操作 mouseup 和 touchend.
     * 发送最后一个 mouseup 点。
     *
     * Parameters:
     * evt - {Event} 浏览器事件，evt.xy 为最后一个 mouseup 的像素位置。
     *
     * Returns:
     * {Boolean} 是否允许事件继续在 map 上传送
     */
    up: function(evt) {
        this.mouseDown = false;
        this.stoppedDown = this.stopDown;

        //ignore double-clicks
        if (this.lastUp && this.lastUp.equals(evt.xy)) {
            return true;
        }

        if (this.lastDown && this.passesTolerance(this.lastDown, evt.xy, this.pixelTolerance)) {
            if (this.touch) {
                this.modifyFeature(evt.xy);
            }
            if (this.persist) {
                this.destroyPersistedFeature();
            }
            this.lastUp = evt.xy;

            this.addControlPoint(evt.xy);
            var len = this.controlPoints.length;
            if (len == 1) {
                this.isDrawing = true;
            } else if (len == 2) {
                this.drawComplete();
            }
            return true;
        } else {
            return true;
        }

    },

    CLASS_NAME: "OpenLayers.Handler.SectorSearch"
});


/**
 * @requires OpenLayers/Handler/Plotting.js
 * @requires OpenLayers/Geometry/GeoStraightArrow.js
 */

/**
 * Class: OpenLayers.Handler.StraightArrow
 * 在地图上绘制直箭头的事件处理器。
 * 绘制点在激活后显示，随着鼠标移动而移动，在鼠标第一次松开后开始绘制，双击鼠标完成绘制。
 * 该处理器会触发标记为"done"、"cancel"和“modify"的事件回调。其中modify回调会在每一次变化时被调用并传入最近一次绘制的点。
 * 使用 <OpenLayers.Handler.StraightArrow> 构造函数可以创建一个新的绘制直箭头的事件处理器实例。
 *
 * Inherits from:
 *  - <OpenLayers.Handler.Plotting>
 */
OpenLayers.Handler.StraightArrow = OpenLayers.Class(OpenLayers.Handler.Plotting, {
    /**
     * Constructor: OpenLayers.Handler.StraightArrow
     * 构造函数，创建一个新的绘制直箭头的事件处理器。
     *
     * Parameters:
     * control - {<OpenLayers.Control>} 构建当前事件处理器的控件对象。
     * callbacks - {Object} 回调函数对象。关于回调的具体描述参见下文。
     * options - {Object} 一个可选对象，其属性将会赋值到事件处理器对象上。
     *
     * Named callbacks:
     * create - 当要素草图第一次创建的时候调用，回调函数需接收两个参数：当前点几何对象、当前要素。
     * modify - 顶点的每一次变化时调用，回调函数接受参数：几何点对象、当前要素。
     * done - 当绘制点操作完成时调用，回调函数接收一个参数，当前点的几何对象。
     * cancel - 绘制过程中关闭当前事件处理器的监听时调用，回调函数接收当前要素的几何对象作为参数。
     */
    initialize: function(control, callbacks, options) {
        OpenLayers.Handler.Plotting.prototype.initialize.apply(this, arguments);
    },

    /**
     * Method: createFeature
     * create temporary features
     *
     * Parameters:
     * pixel - {<OpenLayers.Pixel>} A pixel location on the map.
     */
    createFeature: function(pixel) {
        var lonlat = this.layer.getLonLatFromViewPortPx(pixel);
        var geometry = new OpenLayers.Geometry.Point(
            lonlat.lon, lonlat.lat
        );
        this.point = new OpenLayers.Feature.Vector(geometry);

        //标绘扩展符号的 Geometry 类型为 GeoStraightArrow
        this.plotting = new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.GeoStraightArrow()
        );

        this.callback("create", [this.point.geometry, this.getSketch()]);
        this.point.geometry.clearBounds();
    },

    /**
     * Method: destroyPersistedFeature
     * Destroy the persisted feature.
     */
    destroyPersistedFeature: function() {
        var layer = this.layer;
        if (layer && layer.features.length > 2) {
            this.layer.features[0].destroy();
        }
    },

    /**
     * Method: down
     * Handle mousedown and touchstart.  Add a new point to the Geometry and
     * render it. Return determines whether to propagate the event on the map.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    down: function(evt) {
        this.mouseDown = true;
        this.lastDown = evt.xy;
        if (this.touch) { // no point displayed until up on touch devices
            this.modifyFeature(evt.xy);
            OpenLayers.Event.stop(evt);
        }
        this.stoppedDown = this.stopDown;
        return !this.stopDown;
    },

    /**
     * Method: up
     * 操作 mouseup 和 touchend.
     * 发送最后一个 mouseup 点。
     *
     * Parameters:
     * evt - {Event} 浏览器事件，evt.xy 为最后一个 mouseup 的像素位置。
     *
     * Returns:
     * {Boolean} 是否允许事件继续在 map 上传送
     */
    up: function(evt) {
        this.mouseDown = false;
        this.stoppedDown = this.stopDown;

        //ignore double-clicks
        if (this.lastUp && this.lastUp.equals(evt.xy)) {
            return true;
        }

        if (this.lastDown && this.passesTolerance(this.lastDown, evt.xy, this.pixelTolerance)) {
            if (this.touch) {
                this.modifyFeature(evt.xy);
            }
            if (this.persist) {
                this.destroyPersistedFeature();
            }
            this.lastUp = evt.xy;

            this.addControlPoint(evt.xy);
            var len = this.controlPoints.length;
            if (len == 1) {
                this.isDrawing = true;
            }

            return true;
        } else {
            return true;
        }
    },

    /**
     * Method: dblclick
     * Handle double-clicks.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    dblclick: function(evt) {
        this.drawComplete();
        return false;
    },

    /**
     * Method: touchstart
     * Handle touchstart.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    touchstart: function(evt) {
        if (this.lastTouchPx && this.passesTolerance(this.lastTouchPx, evt.xy, this.pixelTolerance)) {
            evt.preventDefault();
            this.drawComplete();
            this.isDrawing = false;
            return false;
        }
        if (!this.touch) {
            this.touch = true;
            // unregister mouse listeners
            this.map.events.un({
                mousedown: this.mousedown,
                mouseup: this.mouseup,
                mousemove: this.mousemove,
                click: this.click,
                dblclick: this.dblclick,
                scope: this
            });
        }
        this.lastTouchPx = evt.xy;
        return this.down(evt);
    },
    /**
     * APIMethod: down
     * Handle mousedown and touchstart.  Adjust the Geometry and redraw.
     * Return determines whether to propagate the event on the map.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    down: function(evt) {
        this.mouseDown = true;
        this.lastDown = evt.xy;
        this.isDrawing = true;
        if (!this.touch) {
            this.modifyFeature(evt.xy);
        }
        this.stoppedDown = this.stopDown;
        return !this.stopDown;
    },

    /**
     * Method: touchend
     * Handle touchend.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    touchend: function(evt) {
        if (this.isDrawing) {
            evt.xy = this.lastTouchPx;
            return this.up(evt);
        }

    },
    CLASS_NAME: "OpenLayers.Handler.StraightArrow"
});


/**
 * @requires OpenLayers/Handler/Plotting.js
 * @requires OpenLayers/Geometry/GeoPolylineArrow.js
 */

/**
 * Class: OpenLayers.Handler.PolylineArrow
 * 在地图上绘制折线箭头的事件处理器。
 * 绘制点在激活后显示，随着鼠标移动而移动，在鼠标第一次松开后开始绘制，双击鼠标完成绘制。
 * 该处理器会触发标记为"done"、"cancel"和“modify"的事件回调。其中modify回调会在每一次变化时被调用并传入最近一次绘制的点。
 * 使用 <OpenLayers.Handler.PolylineArrow> 构造函数可以创建一个新的绘制折线箭头的事件处理器实例。
 *
 * Inherits from:
 *  - <OpenLayers.Handler.Plotting>
 */
OpenLayers.Handler.PolylineArrow = OpenLayers.Class(OpenLayers.Handler.Plotting, {
    /**
     * Constructor: OpenLayers.Handler.PolylineArrow
     * 构造函数，创建一个新的绘制折线箭头的事件处理器。
     *
     * Parameters:
     * control - {<OpenLayers.Control>} 构建当前事件处理器的控件对象。
     * callbacks - {Object} 回调函数对象。关于回调的具体描述参见下文。
     * options - {Object} 一个可选对象，其属性将会赋值到事件处理器对象上。
     *
     * Named callbacks:
     * create - 当要素草图第一次创建的时候调用，回调函数需接收两个参数：当前点几何对象、当前要素。
     * modify - 顶点的每一次变化时调用，回调函数接受参数：几何点对象、当前要素。
     * done - 当绘制点操作完成时调用，回调函数接收一个参数，当前点的几何对象。
     * cancel - 绘制过程中关闭当前事件处理器的监听时调用，回调函数接收当前要素的几何对象作为参数。
     */
    initialize: function(control, callbacks, options) {
        OpenLayers.Handler.Plotting.prototype.initialize.apply(this, arguments);
    },

    /**
     * Method: createFeature
     * create temporary features
     *
     * Parameters:
     * pixel - {<OpenLayers.Pixel>} A pixel location on the map.
     */
    createFeature: function(pixel) {
        var lonlat = this.layer.getLonLatFromViewPortPx(pixel);
        var geometry = new OpenLayers.Geometry.Point(
            lonlat.lon, lonlat.lat
        );
        this.point = new OpenLayers.Feature.Vector(geometry);

        //标绘扩展符号的 Geometry 类型为 GeoPolylineArrow
        this.plotting = new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.GeoPolylineArrow()
        );

        this.callback("create", [this.point.geometry, this.getSketch()]);
        this.point.geometry.clearBounds();
    },

    /**
     * Method: up
     * 操作 mouseup 和 touchend.
     * 发送最后一个 mouseup 点。
     *
     * Parameters:
     * evt - {Event} 浏览器事件，evt.xy 为最后一个 mouseup 的像素位置。
     *
     * Returns:
     * {Boolean} 是否允许事件继续在 map 上传送
     */
    up: function(evt) {
        this.mouseDown = false;
        this.stoppedDown = this.stopDown;

        //ignore double-clicks
        if (this.lastUp && this.lastUp.equals(evt.xy)) {
            return true;
        }

        if (this.lastDown && this.passesTolerance(this.lastDown, evt.xy, this.pixelTolerance)) {
            if (this.touch) {
                this.modifyFeature(evt.xy);
            }
            if (this.persist) {
                this.destroyPersistedFeature();
            }
            this.lastUp = evt.xy;

            this.addControlPoint(evt.xy);
            var len = this.controlPoints.length;
            if (len > 0) {
                this.isDrawing = true;
            }

            return true;
        } else {
            return true;
        }
    },

    /**
     * Method: dblclick
     * Handle double-clicks.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    dblclick: function(evt) {
        this.drawComplete();
        return false;
    },

    /**
     * Method: touchstart
     * Handle touchstart.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    touchstart: function(evt) {
        if (this.lastTouchPx && this.passesTolerance(this.lastTouchPx, evt.xy, this.pixelTolerance)) {
            evt.preventDefault();
            this.drawComplete();
            this.isDrawing = false;
            return false;
        }
        if (!this.touch) {
            this.touch = true;
            // unregister mouse listeners
            this.map.events.un({
                mousedown: this.mousedown,
                mouseup: this.mouseup,
                mousemove: this.mousemove,
                click: this.click,
                dblclick: this.dblclick,
                scope: this
            });
        }
        this.lastTouchPx = evt.xy;
        return this.down(evt);
    },
    /**
     * APIMethod: down
     * Handle mousedown and touchstart.  Adjust the Geometry and redraw.
     * Return determines whether to propagate the event on the map.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    down: function(evt) {
        this.mouseDown = true;
        this.lastDown = evt.xy;
        this.isDrawing = true;
        if (!this.touch) {
            this.modifyFeature(evt.xy);
        }
        this.stoppedDown = this.stopDown;
        return !this.stopDown;
    },

    /**
     * Method: touchend
     * Handle touchend.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    touchend: function(evt) {
        if (this.isDrawing) {
            evt.xy = this.lastTouchPx;
            return this.up(evt);
        }

    },
    CLASS_NAME: "OpenLayers.Handler.PolylineArrow"
});


/**
 * @requires OpenLayers/Handler/Plotting.js
 * @requires OpenLayers/Geometry/GeoTriangleFlag.js
 */

/**
 * Class: OpenLayers.Handler.TriangleFlag
 * 在地图上绘制三角旗标的事件处理器。
 * 绘制点在激活后显示，随着鼠标移动而移动，在鼠标第一次松开后开始绘制，在鼠标第二次松开后完成绘制。
 * 该处理器会触发标记为"done"、"cancel"和“modify"的事件回调。其中modify回调会在每一次变化时被调用并传入最近一次绘制的点。
 * 使用 <OpenLayers.Handler.TriangleFlag> 构造函数可以创建一个新的绘制三角旗标的事件处理器实例。
 *
 * Inherits from:
 *  - <OpenLayers.Handler.Plotting>
 */
OpenLayers.Handler.TriangleFlag = OpenLayers.Class(OpenLayers.Handler.Plotting, {
    /**
     * Constructor: OpenLayers.Handler.TriangleFlag
     * 构造函数，创建一个新的绘制三角旗标的事件处理器。
     *
     * Parameters:
     * control - {<OpenLayers.Control>} 构建当前事件处理器的控件对象。
     * callbacks - {Object} 回调函数对象。关于回调的具体描述参见下文。
     * options - {Object} 一个可选对象，其属性将会赋值到事件处理器对象上。
     *
     * Named callbacks:
     * create - 当要素草图第一次创建的时候调用，回调函数需接收两个参数：当前点几何对象、当前要素。
     * modify - 顶点的每一次变化时调用，回调函数接受参数：几何点对象、当前要素。
     * done - 当绘制点操作完成时调用，回调函数接收一个参数，当前点的几何对象。
     * cancel - 绘制过程中关闭当前事件处理器的监听时调用，回调函数接收当前要素的几何对象作为参数。
     */
    initialize: function(control, callbacks, options) {
        OpenLayers.Handler.Plotting.prototype.initialize.apply(this, arguments);
    },

    /**
     * Method: createFeature
     * create temporary features
     *
     * Parameters:
     * pixel - {<OpenLayers.Pixel>} A pixel location on the map.
     */
    createFeature: function(pixel) {
        var lonlat = this.layer.getLonLatFromViewPortPx(pixel);
        var geometry = new OpenLayers.Geometry.Point(
            lonlat.lon, lonlat.lat
        );
        this.point = new OpenLayers.Feature.Vector(geometry);

        //标绘扩展符号的 Geometry 类型为 GeoTriangleFlag
        this.plotting = new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.GeoTriangleFlag()
        );

        this.callback("create", [this.point.geometry, this.getSketch()]);
        this.point.geometry.clearBounds();
    },

    /**
     * Method: destroyPersistedFeature
     * Destroy the persisted feature.
     */
    destroyPersistedFeature: function() {
        var layer = this.layer;
        if (layer && layer.features.length > 2) {
            this.layer.features[0].destroy();
        }
    },

    /**
     * Method: up
     * 操作 mouseup 和 touchend.
     * 发送最后一个 mouseup 点。
     *
     * Parameters:
     * evt - {Event} 浏览器事件，evt.xy 为最后一个 mouseup 的像素位置。
     *
     * Returns:
     * {Boolean} 是否允许事件继续在 map 上传送
     */
    up: function(evt) {
        this.mouseDown = false;
        this.stoppedDown = this.stopDown;

        // ignore double-clicks
        if (this.lastUp && this.lastUp.equals(evt.xy)) {
            return true;
        }

        if (this.lastDown && this.passesTolerance(this.lastDown, evt.xy, this.pixelTolerance)) {
            if (this.touch) {
                this.modifyFeature(evt.xy);
            }
            if (this.persist) {
                this.destroyPersistedFeature();
            }
            this.lastUp = evt.xy;

            this.addControlPoint(evt.xy);
            var len = this.controlPoints.length;
            if (len == 1) {
                this.isDrawing = true;
            } else if (len == 2) {
                this.drawComplete();
            } else {
                this.isDrawing = false;
                this.controlPoints = [];
                this.plotting = null
            }

            return true;
        } else {
            return true;
        }
    },

    /**
     * Method: touchstart
     * Handle touchstart.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    touchstart: function(evt) {
        if (!this.touch) {
            this.touch = true;
            // unregister mouse listeners
            this.map.events.un({
                mousedown: this.mousedown,
                mouseup: this.mouseup,
                mousemove: this.mousemove,
                click: this.click,
                dblclick: this.dblclick,
                scope: this
            });
        }
        this.map.isIESingleTouch = false;
        this.modifyFeature(evt.xy);
        if (this.persist) {
            this.destroyPersistedFeature();
        }
        this.addControlPoint(evt.xy);
        var len = this.controlPoints.length;
        if (len >= 1) {
            this.isDrawing = true;
        }
        return true;
    },
    /**
     * Method: touchend
     * Handle touchend.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    touchend: function(evt) {
        this.drawComplete();
        this.map.isIESingleTouch = true;
        return false;
    },
    /**
     * Method: touchmove
     * Handle touchmove.
     *
     * Parameters:
     * evt - {Event} The browser event
     *
     * Returns:
     * {Boolean} Allow event propagation
     */
    touchmove: function(evt) {
        this.lastTouchPx = evt.xy;
        this.modifyFeature(evt.xy);
        return true;
    },
    CLASS_NAME: "OpenLayers.Handler.TriangleFlag"
});

// LSG
OpenLayers.Geometry.LineString.createCurve = function(C, d, y, B) {
    var j = "lanczos";
    if (d != undefined) {
        j = d
    }
    var l = 10;
    if (y != undefined) {
        l = y
    }
    var o = {
        method: j,
        clip: "mirror",
        lanczosFilterSize: l,
        cubicTension: 0
    };
    var A = [];
    for (var D = 0; D < C.length; D++) {
        A.push([C[D].x, C[D].y])
    }
    r = Smooth(A, o);
    var f = function(s, p) {
        return Math.sqrt(Math.pow(s[0] - p[0], 2) + Math.pow(s[1] - p[1], 2))
    };
    var E = 80;
    if (B != undefined) {
        E = B
    }
    var z = [];
    var m, v, e, h, w, r, g, q, n, k, c, a;
    m = f(A[0], A[A.length - 1]) / E;
    h = 2;
    for (q = 0,
        k = 1 / h; q < 1; q += k) {
        c = [r(D + q), r(D + q + 1 / h)],
            g = c[0],
            e = c[1];
        w = f(g, e);
        v = m / w;
        for (n = 0,
            a = 1 / h; 0 <= a ? n < a : n > a; n += v) {
            var x = r(D + q + n);
            z.push(new OpenLayers.Geometry.Point(x[0], x[1]))
        }
    }
    var x = r(D + 1);
    z.push(new OpenLayers.Geometry.Point(x[0], x[1]));
    return new OpenLayers.Geometry.LineString(z)
};
OpenLayers.Geometry.LineString.createBspline = function(n, g) {
    if (n.length < 2) {
        return null
    }
    var t = [];
    var l = 10;
    if (g != undefined) {
        l = g
    }
    var o, m, w, v, u, d, c, a;
    var r, q;
    d = 1 / l;
    var f = Math.sqrt((Math.pow(n[1].x - n[0].x, 2) + Math.pow(n[1].y - n[0].y, 2)) / 2);
    var p = new OpenLayers.Geometry.Point(n[0].x - f, n[0].y - f);
    var s = [];
    s[0] = p;
    for (o = 0; o < n.length - 1; o++) {
        var e = [];
        e[0] = n[o];
        var h = new OpenLayers.Geometry.Point(n[o].x * 2 - s[o].x, n[o].y * 2 - s[o].y);
        e[1] = h;
        s[o + 1] = h;
        e[2] = n[o + 1];
        t.push(e[0]);
        for (m = 0; m <= l; m++) {
            c = m * d;
            a = c * c;
            w = (a - 2 * c + 1) / 2;
            v = (2 * c - 2 * a + 1) / 2;
            u = a / 2;
            r = w * e[0].x + v * e[1].x + u * e[2].x;
            q = w * e[0].y + v * e[1].y + u * e[2].y;
            t.push(new OpenLayers.Geometry.Point(r, q))
        }
    }
    t.push(n[n.length - 1]);
    return new OpenLayers.Geometry.LineString(t)
};
OpenLayers.Geometry.LineString.createBezier1 = function(p, l, a) {
    if (a) {
        return OpenLayers.Geometry.LineString.createBezier3(p, a)
    }
    var c = [];
    for (var e = 0; e < p.length; e++) {
        c[e] = p[e]
    }
    var h;
    var f;
    var g = 0;
    var q;
    var n = c.length;
    var d = [];
    var o = true;
    while (o) {
        q = true;
        for (h = 0; h < n - 3; h += 3) {
            if (GetBezierGap(c, h) > l) {
                q = false;
                InciseBezier(c, h, d);
                c.splice(h + 1, 2);
                for (f = 0; f < 5; f++) {
                    c.splice(h + 1 + f, 0, d[f + 1])
                }
                h -= 3;
                n = c.length
            }
            if (q) {
                break
            }
        }
        while (g < n - 1) {
            if (c[g] === c[g + 1]) {
                c.splice(g + 1, 1);
                n--
            }
            g++
        }
        o = false
    }
    return new OpenLayers.Geometry.LineString(c)
};
OpenLayers.Geometry.LineString.calculatePointsFBZ2 = function(m, a) {
    if (!a) {
        a = 20
    }
    var c = [];
    var e = 0.05;
    if (a > 0) {
        e = 1 / a
    }
    for (var g = 0; g < m.length - 2;) {
        var d = m[g];
        var p = m[g + 1];
        var l = m[g + 2];
        c.push(d);
        for (var o = 0; o < 1;) {
            var j = (1 - o) * (1 - o) * d.x + 2 * o * (1 - o) * p.x + o * o * l.x;
            var h = (1 - o) * (1 - o) * d.y + 2 * o * (1 - o) * p.y + o * o * l.y;
            var k = new OpenLayers.Geometry.Point(j, h);
            c.push(k);
            o += e
        }
        g += 2;
        if (g >= m.length) {
            c.push(d)
        }
    }
    var f = c[c.length - 1];
    var n = m[m.length - 1];
    if (!f.equals(n)) {
        c.push(n.clone())
    }
    return c
};
OpenLayers.Geometry.LineString.calculatePointsFBZ3 = function(o, a) {
    if (!a) {
        a = 20
    }
    var c = [];
    var e = 0.05;
    if (a > 0) {
        e = 1 / a
    }
    for (var g = 0; g < o.length - 3;) {
        var d = o[g];
        var j = o[g + 1];
        var h = o[g + 2];
        var n = o[g + 3];
        c.push(d);
        for (var q = 0; q < 1;) {
            var l = (1 - q) * (1 - q) * (1 - q) * d.x + 3 * q * (1 - q) * (1 - q) * j.x + 3 * q * q * (1 - q) * h.x + q * q * q * n.x;
            var k = (1 - q) * (1 - q) * (1 - q) * d.y + 3 * q * (1 - q) * (1 - q) * j.y + 3 * q * q * (1 - q) * h.y + q * q * q * n.y;
            var m = new OpenLayers.Geometry.Point(l, k);
            c.push(m);
            q += e
        }
        g += 3;
        if (g >= o.length) {
            c.push(d)
        }
    }
    var f = c[c.length - 1];
    var p = o[o.length - 1];
    if (!f.equals(p)) {
        c.push(p.clone())
    }
    return c
};
OpenLayers.Geometry.LineString.calculatePointsFBZN = function(m, a) {
    if (!a) {
        a = m.length * 8
    }
    var c = [];
    var e = 0.05;
    if (a > 0) {
        e = 1 / a
    }
    for (var p = 0; p <= 1;) {
        var k = 0;
        var j = 0;
        var d = m.length;
        for (var g = 0; g < m.length; g++) {
            var h = OpenLayers.Geometry.LineString.BEZ(d - 1, g, p);
            k += m[g].x * h;
            j += m[g].y * h
        }
        var l = new OpenLayers.Geometry.Point(k, j);
        c.push(l);
        p += e
    }
    var f = c[c.length - 1];
    var o = m[m.length - 1];
    if (!f.equals(o)) {
        c.push(o.clone())
    }
    return c
};
OpenLayers.Geometry.LineString.createBezier2 = function(c, a) {
    var d = OpenLayers.Geometry.LineString.calculatePointsFBZ2(c, a);
    return new OpenLayers.Geometry.LineString(d)
};
OpenLayers.Geometry.LineString.createBezier3 = function(c, a) {
    var d = OpenLayers.Geometry.LineString.calculatePointsFBZ3(c, a);
    return new OpenLayers.Geometry.LineString(d)
};
OpenLayers.Geometry.LineString.createBezier = function(n, h) {
    var a = [];
    for (var d = 0; d < n.length; d++) {
        a[d] = n[d]
    }
    var g, e, f = 0,
        o, l = a.length;
    var c = [];
    while (true) {
        o = true;
        for (g = 0; g < l - 3; g += 3) {
            if (GetBezierGap(a, g) > h) {
                o = false;
                InciseBezier(a, g, c);
                a.splice(g + 1, 2);
                for (e = 0; e < 5; e++) {
                    a.splice(g + 1 + e, 0, c[e + 1])
                }
                g -= 3;
                l = a.length
            }
            if (o) {
                break
            }
        }
        while (f < l - 1) {
            if (a[f] === a[f + 1]) {
                a.splice(f + 1, 1);
                l--
            }
            f++
        }
        return new OpenLayers.Geometry.LineString(a)
    }
};
InciseBezier = function(c, d, f) {
    var a = [];
    a[0] = [];
    a[1] = [];
    a[2] = [];
    var e;
    for (e = 0; e < 3; e++) {
        a[0][e] = new OpenLayers.Geometry.Point;
        a[0][e].x = (c[d + e].x + c[d + e + 1].x) / 2;
        a[0][e].y = (c[d + e].y + c[d + e + 1].y) / 2
    }
    for (e = 0; e < 2; e++) {
        a[1][e] = new OpenLayers.Geometry.Point;
        a[1][e].x = (a[0][e].x + a[0][e + 1].x) / 2;
        a[1][e].y = (a[0][e].y + a[0][e + 1].y) / 2
    }
    a[2][0] = new OpenLayers.Geometry.Point;
    a[2][0].x = (a[1][0].x + a[1][1].x) / 2;
    a[2][0].y = (a[1][0].y + a[1][1].y) / 2;
    f[0] = c[d];
    f[1] = a[0][0];
    f[2] = a[1][0];
    f[3] = a[2][0];
    f[4] = a[1][1];
    f[5] = a[0][2];
    f[6] = c[d + 3];
    return true
};
GetBezierGap = function(a, c) {
    var e = 0;
    for (var d = 1; d < 4; d++) {
        if (Math.abs(a[c + d].x - a[c + d - 1].x) > e) {
            e = Math.abs(a[c + d].x - a[c + d - 1].x)
        }
        if (Math.abs(a[c + d].y - a[c + d - 1].y) > e) {
            e = Math.abs(a[c + d].y - a[c + d - 1].y)
        }
    }
    return e
};
OpenLayers.Geometry.LineString.createBezierN = function(c, a) {
    var d = OpenLayers.Geometry.LineString.calculatePointsFBZN(c, a);
    return new OpenLayers.Geometry.LineString(d)
};
OpenLayers.Geometry.LineString.BEZ = function(d, a, c) {
    return OpenLayers.Geometry.LineString.combSort(d, a) * Math.pow(c, a) * Math.pow(1 - c, d - a)
};
OpenLayers.Geometry.LineString.combSort = function(e, a) {
    var d = OpenLayers.Geometry.LineString.factorial(e);
    var c = OpenLayers.Geometry.LineString.factorial(a) * OpenLayers.Geometry.LineString.factorial(e - a);
    return d / c
};
OpenLayers.Geometry.LineString.factorial = function(d) {
    var a = 1;
    for (var c = 1; c <= d; c++) {
        a *= c
    }
    return a
};
OpenLayers.Geometry.LineString.calculateCardinalPoints = function(A) {
    if (A == null || A.length < 3) {
        return A
    }
    var B = A;
    var l = [];
    var q = 0.4;
    var I = 0.5;
    var E = 0.005;
    var w = B.length - 1;
    for (var z = 0; z <= w + 1 - 3; z++) {
        var g = B[z];
        var f = B[z + 1];
        var d = B[z + 2];
        var o = new OpenLayers.Geometry.Point();
        var h = new OpenLayers.Geometry.Point();
        var G = new OpenLayers.Geometry.Point(f.x - g.x, f.y - g.y);
        var a = new OpenLayers.Geometry.Point(d.x - f.x, d.y - f.y);
        var v = Math.sqrt(G.x * G.x + G.y * G.y);
        var J = Math.sqrt(a.x * a.x + a.y * a.y);
        var u = new OpenLayers.Geometry.Point(G.x / v, G.y / v);
        var m = new OpenLayers.Geometry.Point(a.x / J, a.y / J);
        var H = new OpenLayers.Geometry.Point(u.x + m.x, u.y + m.y);
        var c = Math.sqrt(H.x * H.x + H.y * H.y);
        var s = new OpenLayers.Geometry.Point(H.x / c, H.y / c);
        var p = (u.x * m.x + u.y * m.y) / 1;
        if (Math.abs(1 - p) < E) {
            o.x = f.x - m.x * v * q;
            o.y = f.y - m.y * v * q;
            h.x = f.x + u.x * J * q;
            h.y = f.y + u.y * J * q
        } else {
            o.x = f.x - s.x * v * q;
            o.y = f.y - s.y * v * q;
            h.x = f.x + s.x * J * q;
            h.y = f.y + s.y * J * q
        }
        l[z * 3 + 2 + 0] = o;
        l[z * 3 + 2 + 1] = f;
        l[z * 3 + 2 + 2] = h;
        if (z == 0) {
            var F = new OpenLayers.Geometry.Point();
            var y = new OpenLayers.Geometry.Point(o.x - g.x, o.y - g.y);
            var D = Math.sqrt(y.x * y.x + y.y * y.y);
            var j = new OpenLayers.Geometry.Point(y.x / D, y.y / D);
            F.x = g.x + j.x * v * q * I;
            F.y = g.y + j.y * v * q * I;
            l[z * 3 + 0] = g;
            l[z * 3 + 1] = F
        }
        if (z == w + 1 - 3) {
            var x = new OpenLayers.Geometry.Point();
            var K = new OpenLayers.Geometry.Point(h.x - d.x, h.y - d.y);
            var C = Math.sqrt(K.x * K.x + K.y * K.y);
            var r = new OpenLayers.Geometry.Point(K.x / C, K.y / C);
            x.x = d.x + r.x * J * q * I;
            x.y = d.y + r.y * J * q * I;
            l[z * 3 + 2 + 3] = x;
            l[z * 3 + 2 + 4] = d
        }
    }
    return l
};
OpenLayers.Geometry.LineString.createCloseCardinal = function(x) {
    if (x == null || x.length < 3) {
        return x
    }
    var p = x[0];
    x.push(p);
    var y = x;
    var j = [];
    var q = 0.4;
    var C = 0.5;
    var z = 0.005;
    var v = y.length - 1;
    for (var w = 0; w <= v - 1; w++) {
        if (w == v - 1) {
            var g = y[v - 1];
            var f = y[0];
            var d = y[1]
        } else {
            var g = y[w];
            var f = y[w + 1];
            var d = y[w + 2]
        }
        var m = new OpenLayers.Geometry.Point();
        var h = new OpenLayers.Geometry.Point();
        var A = new OpenLayers.Geometry.Point(f.x - g.x, f.y - g.y);
        var a = new OpenLayers.Geometry.Point(d.x - f.x, d.y - f.y);
        var u = Math.sqrt(A.x * A.x + A.y * A.y);
        var D = Math.sqrt(a.x * a.x + a.y * a.y);
        var s = new OpenLayers.Geometry.Point(A.x / u, A.y / u);
        var l = new OpenLayers.Geometry.Point(a.x / D, a.y / D);
        var B = new OpenLayers.Geometry.Point(s.x + l.x, s.y + l.y);
        var c = Math.sqrt(B.x * B.x + B.y * B.y);
        var r = new OpenLayers.Geometry.Point(B.x / c, B.y / c);
        var o = (s.x * l.x + s.y * l.y) / 1;
        if (Math.abs(1 - o) < z) {
            m.x = f.x - l.x * u * q;
            m.y = f.y - l.y * u * q;
            h.x = f.x + s.x * D * q;
            h.y = f.y + s.y * D * q
        } else {
            m.x = f.x - r.x * u * q;
            m.y = f.y - r.y * u * q;
            h.x = f.x + r.x * D * q;
            h.y = f.y + r.y * D * q
        }
        if (w == v - 1) {
            j[0] = f;
            j[1] = h;
            j[(v - 2) * 3 + 2 + 3] = m;
            j[(v - 2) * 3 + 2 + 4] = y[v]
        } else {
            j[w * 3 + 2 + 0] = m;
            j[w * 3 + 2 + 1] = f;
            j[w * 3 + 2 + 2] = h
        }
    }
    return j
};
OpenLayers.Geometry.LineString.calculateCircle = function(A) {
    if (A.length < 3) {
        return A
    }
    var B = A.length,
        v = {},
        g = A[0],
        d = A[1],
        a = A[2];
    var l = 0,
        c = 0,
        u = true,
        C = 0,
        H = 0,
        G = 0,
        e = 72,
        v = {},
        t = [];
    var w = (a.y - g.y) / (a.x - g.x);
    var h = a.y - w * a.x;
    if ((((a.x != g.x) && (a.y != g.y)) && (d.y == w * d.x + h)) || ((a.x == g.x) && (d.x == g.x)) || ((a.y == g.y) && (d.y == g.y)) || ((a.x == g.x) && (a.y == g.y)) || ((a.x == d.x) && (a.y == d.y)) || ((g.x == d.x) && (g.y == d.y))) {
        t.push(g);
        t.push(d);
        t.push(a)
    } else {
        var r = ((d.x * d.x + d.y * d.y) - (g.x * g.x + g.y * g.y)) * (2 * (a.y - g.y)) - ((a.x * a.x + a.y * a.y) - (g.x * g.x + g.y * g.y)) * (2 * (d.y - g.y));
        var q = (2 * (d.x - g.x)) * ((a.x * a.x + a.y * a.y) - (g.x * g.x + g.y * g.y)) - (2 * (a.x - g.x)) * ((d.x * d.x + d.y * d.y) - (g.x * g.x + g.y * g.y));
        var p = 4 * ((d.x - g.x) * (a.y - g.y) - (a.x - g.x) * (d.y - g.y));
        v.x = r / p;
        v.y = q / p;
        l = Math.sqrt((g.x - v.x) * (g.x - v.x) + (g.y - v.y) * (g.y - v.y));
        var s = (g.x - a.x) * (g.x - a.x) + (g.y - a.y) * (g.y - a.y);
        var k = (2 * l * l - s) / (2 * l * l);
        k = k >= 1 ? 1 : k;
        k = k <= -1 ? -1 : k;
        G = Math.acos(k) * 180 / Math.PI;
        if (a.x == g.x) {
            G = ((v.x > g.x && d.x > g.x) || (v.x < g.x && d.x < g.x)) ? (360 - G) : G
        } else {
            G = ((v.y > (w * v.x + h) && d.y > (w * d.x + h)) || (v.y < (w * v.x + h) && d.y < (w * d.x + h))) ? (360 - G) : G
        }
        dStep = G / 72;
        if (a.y != g.y) {
            if (a.x == g.x) {
                if (a.y > g.y) {
                    if (d.x < g.x) {
                        u = false
                    }
                } else {
                    if (d.x > g.x) {
                        u = false
                    }
                }
            } else {
                if (a.x < g.x) {
                    if (d.y < w * d.x + h) {
                        u = false
                    }
                } else {
                    if (d.y > w * d.x + h) {
                        u = false
                    }
                }
            }
        } else {
            if (a.x > g.x) {
                if (d.y > g.y) {
                    u = false
                }
            } else {
                if (d.y < g.y) {
                    u = false
                }
            }
        }
        var j = (g.y - v.y) / (g.x - v.x);
        var m = j >= 0 ? Math.atan(j) * 180 / Math.PI : Math.abs(Math.atan(j) * 180 / Math.PI) + 90;
        var I = Math.abs(v.y);
        if ((g.y == I) && (I == a.y)) {
            if (g.x < a.x) {
                m = m + 180
            }
        }
        var f = g.y - v.y;
        t.push(g);
        for (var z = 1; z < e; z++) {
            C = dStep * z;
            H = m;
            if (u) {
                if (f >= 0) {
                    if (j >= 0) {
                        H = H + C
                    } else {
                        H = (180 - (H - 90)) + C
                    }
                } else {
                    if (j > 0) {
                        H = (H - 180) + C
                    } else {
                        H = (90 - H) + C
                    }
                }
            } else {
                if (f >= 0) {
                    if (j >= 0) {
                        H = H - C
                    } else {
                        H = (180 - (H - 90)) - C
                    }
                } else {
                    if (j >= 0) {
                        H = (H - 180) - C
                    } else {
                        H = (90 - H) - C
                    }
                }
            }
            H = H * Math.PI / 180;
            var o = v.x + l * Math.cos(H);
            var n = v.y + l * Math.sin(H);
            t.push(new OpenLayers.Geometry.Point(o, n))
        }
        t.push(a)
    }
    return t
};
OpenLayers.Geometry.LineString.createLineEPS = function(f) {
    var g = [],
        c = 0,
        a = f.length;
    if (f == null || a < 2) {
        return f
    }
    for (var d = 0; d < a;) {
        var e = f[d].type;
        if (e == "LTypeArc") {
            var h = OpenLayers.Geometry.LineString.createLineArc(g, d, a, f);
            g = h[0];
            d = h[1]
        } else {
            g.push(f[d]);
            d++
        }
    }
    return g
};
OpenLayers.Geometry.LineString.createLineArc = function(f, c, a, d) {
    if (c == 0) {
        var g = OpenLayers.Geometry.LineString.addPointEPS(d, c, a, "LTypeArc");
        Array.prototype.push.apply(f, g[0]);
        c = g[1] + 1
    } else {
        if (c == a - 1) {
            var e = [d[c - 1], d[c]],
                h = OpenLayers.Geometry.LineString.calculateCircle(e);
            Array.prototype.push.apply(f, h);
            c++
        } else {
            var g = OpenLayers.Geometry.LineString.addPointEPS(d, c, a, "LTypeArc");
            f.pop();
            Array.prototype.push.apply(f, g[0]);
            c = g[1] + 1
        }
    }
    return [f, c]
};
OpenLayers.Geometry.LineString.createLineCurve = function(f, c, a, d) {
    if (c == 0) {
        var g = OpenLayers.Geometry.LineString.addPointEPS(d, c, a, "LTypeCurve");
        Array.prototype.push.apply(f, g[0]);
        c = g[1] + 1
    } else {
        if (c == a - 1) {
            var e = [d[c - 1], d[c]],
                h = OpenLayers.Geometry.LineString.calculatePointsFBZN(e);
            Array.prototype.push.apply(f, h);
            c++
        } else {
            var g = OpenLayers.Geometry.LineString.addPointEPS(d, c, a, "LTypeCurve");
            f.pop();
            Array.prototype.push.apply(f, g[0]);
            c = g[1] + 1
        }
    }
    return [f, c]
};
OpenLayers.Geometry.LineString.addPointEPS = function(f, d, a, e) {
    var g = [],
        c = d + 1;
    if (d == 0) {
        Array.prototype.push.apply(g, [f[d], f[d + 1]])
    } else {
        if (d == a - 1) {
            Array.prototype.push.apply(g, [f[d - 1], f[d]])
        } else {
            Array.prototype.push.apply(g, [f[d - 1], f[d], f[d + 1]])
        }
    }
    if (e == "LTypeCurve") {
        var h = OpenLayers.Geometry.LineString.calculatePointsFBZN(g)
    } else {
        if (e == "LTypeArc") {
            var h = OpenLayers.Geometry.LineString.calculateCircle(g)
        }
    }
    return [h, c]
};

OpenLayers.Util.clipGeometryRect = function(e, c, d, b) {
    if (e) {
        d = d != undefined ? d : true;
        b = b != undefined ? b : false;
        if (((e.CLASS_NAME === "OpenLayers.Geometry.LineString") || (e.CLASS_NAME === "OpenLayers.Geometry.LinearRing")) && (e.components.length > 1)) {
            var a = OpenLayers.Util.clipLineStringRect(e, c, d, b);
            if (a) {
                if (a.length === 1) {
                    return a[0]
                } else {
                    return new OpenLayers.Geometry.MultiLineString(a)
                }
            }
        } else {
            if ((e.CLASS_NAME === "OpenLayers.Geometry.MultiLineString") && (e.components.length > 0) && (e.components[0].components.length > 1)) {
                return OpenLayers.Util.clipMultiLineStringRect(e, c, d, b)
            } else {
                if ((e.CLASS_NAME === "OpenLayers.Geometry.Polygon") && (e.components.length > 0) && (e.components[0].components.length > 2)) {
                    return OpenLayers.Util.clipPolygonRect(e, c, b)
                } else {
                    if ((e.CLASS_NAME === "OpenLayers.Geometry.MultiPolygon") && (e.components.length > 0)) {
                        return OpenLayers.Util.clipMultiPolygonRect(e, c, true)
                    } else {
                        return e
                    }
                }
            }
        }
    }
};
OpenLayers.Util.clipLineStringRect = function(l, j, b, c) {
    b = b != undefined ? b : true;
    c = c != undefined ? c : false;
    if (!j.intersectsBounds(l.getBounds())) {
        return null
    }
    if (j.containsBounds(l.getBounds())) {
        return [l]
    }
    var n = l.components;
    var g = [];
    for (var e = 0; e < n.length - 1; e++) {
        var k = new OpenLayers.Geometry.Point(n[e].x, n[e].y);
        var h = new OpenLayers.Geometry.Point(n[e + 1].x, n[e + 1].y);
        var f = OpenLayers.Util.clipLineRect(k, h, j);
        var o;
        if (f.length === 2) {
            if (((f[0].x - k.x) * (f[0].x - k.x) + (f[0].y - k.y) * (f[0].y - k.y)) > ((f[1].x - k.x) * (f[1].x - k.x) + (f[1].y - k.y) * (f[1].y - k.y))) {
                var m = f[0];
                f[0] = f[1];
                f[1] = m
            }
            if (b) {
                o = new OpenLayers.Geometry.LineString(f);
                g.push(o)
            } else {
                g.push(f[0], f[1])
            }
        } else {
            if (f.length === 1) {
                if (j.contains(k.x, k.y, false)) {
                    if (b) {
                        o = new OpenLayers.Geometry.LineString([k, f[0]]);
                        g.push(o)
                    } else {
                        g.push(k, f[0])
                    }
                } else {
                    if (j.contains(h.x, h.y, false)) {
                        if (b) {
                            o = new OpenLayers.Geometry.LineString([f[0], h]);
                            g.push(o)
                        } else {
                            g.push(f[0], h)
                        }
                    } else {}
                }
            } else {
                if (f.length == 0) {
                    if (j.contains(k.x, k.y) && j.contains(h.x, h.y)) {
                        if (b) {
                            o = new OpenLayers.Geometry.LineString([k, h]);
                            g.push(o)
                        } else {
                            g.push(k, h)
                        }
                    } else {}
                }
            }
        }
    }
    if (g.length > 0) {
        if (!b) {
            var d = new OpenLayers.Geometry.LineString(g);
            if (c) {
                d.id = l.id
            }
            return d
        } else {
            if (c) {
                g[0].id = l.id;
                if (g.length > 1) {
                    for (var e = 1; e < g.length; e++) {
                        g[e].id = l.id + "_clip_" + e
                    }
                }
            }
        }
        return g
    }
};
OpenLayers.Util.clipMultiLineStringRect = function(g, f, a, b) {
    a = a != undefined ? a : true;
    b = b != undefined ? b : false;
    if (!f.intersectsBounds(g.getBounds())) {
        return null
    }
    if (f.containsBounds(g.getBounds())) {
        return g
    }
    var c = g.components;
    var j = [];
    for (var d = 0; d < c.length; d++) {
        var e = OpenLayers.Util.clipLineStringRect(c[d], f, a, b);
        if (!e) {
            continue
        }
        if (e instanceof Array) {
            j = j.concat(e)
        } else {
            j.push(e)
        }
    }
    if (j.length > 0) {
        var h = new OpenLayers.Geometry.MultiLineString(j);
        if (b) {
            h.id = g.id;
            return h
        }
        return h
    }
};
OpenLayers.Util.clipPolygonRect = function(g, a, p) {
    if (!a.intersectsBounds(g.getBounds())) {
        return null
    }
    if (a.containsBounds(g.getBounds())) {
        return g
    }
    p = p != undefined ? p : false;
    var s = [];
    var t = g.components;
    for (var o = 0; o < t.length; o++) {
        if (a.containsBounds(t[o].getBounds())) {
            s.push(t[o]);
            continue
        }
        var b = OpenLayers.Util.getIntersectLineArray(a, t[o].getBounds());
        var r = t[o].components;
        var f = r;
        for (var n = 0; n < b.length; n++) {
            r = f;
            f = [];
            var l = b[n];
            for (var m = 0; m < r.length - 1; m++) {
                var v = r[m];
                var u = r[m + 1];
                var e = l.components[0];
                var d = l.components[1];
                var h = OpenLayers.Util.lineIntersection(v, u, e, d);
                if ((n == 0) && v.x >= a.left) {
                    f.push(v)
                } else {
                    if ((n === 1) && v.y <= a.top) {
                        f.push(v)
                    } else {
                        if ((n === 2) && v.x <= a.right) {
                            f.push(v)
                        } else {
                            if ((n === 3) && v.y >= a.bottom) {
                                f.push(v)
                            }
                        }
                    }
                }
                if (h.CLASS_NAME === "OpenLayers.Geometry.Point") {
                    f.push(h)
                } else {}
            }
            if (f.length > 0) {
                f.push(f[0])
            }
        }
        if (f.length > 2) {
            var q = new OpenLayers.Geometry.LinearRing(f);
            if (p) {
                q.id = t[o].id
            }
            s.push(q)
        }
    }
    if (s.length > 0) {
        var c = new OpenLayers.Geometry.Polygon(s);
        if (p) {
            c.id = g.id;
            return c
        }
        return c
    }
};
OpenLayers.Util.getIntersectLineArray = function(k, i) {
    var f = new OpenLayers.Geometry.Point(k.left, k.bottom < i.bottom ? k.bottom : i.bottom);
    var b = new OpenLayers.Geometry.Point(k.left, k.top > i.top ? k.top : i.top);
    var l = new OpenLayers.Geometry.LineString([f, b]);
    var m = new OpenLayers.Geometry.Point(k.left < i.left ? k.left : i.left, k.top);
    var a = new OpenLayers.Geometry.Point(k.right > i.right ? k.right : i.right, k.top);
    var g = new OpenLayers.Geometry.LineString([m, a]);
    var n = new OpenLayers.Geometry.Point(k.right, k.top > i.top ? k.top : i.top);
    var j = new OpenLayers.Geometry.Point(k.right, k.bottom < i.bottom ? k.bottom : i.bottom);
    var e = new OpenLayers.Geometry.LineString([n, j]);
    var c = new OpenLayers.Geometry.Point(k.right > i.right ? k.right : i.right, k.bottom);
    var h = new OpenLayers.Geometry.Point(k.left < i.left ? k.left : i.left, k.bottom);
    var d = new OpenLayers.Geometry.LineString([c, h]);
    return [l, g, e, d]
};
OpenLayers.Util.lineIntersection = function(d, c, l, i) {
    var o = null;
    var g;
    var e;
    var j = (i.x - l.x) * (d.y - l.y) - (i.y - l.y) * (d.x - l.x);
    var k = (c.x - d.x) * (d.y - l.y) - (c.y - d.y) * (d.x - l.x);
    var p = (i.y - l.y) * (c.x - d.x) - (i.x - l.x) * (c.y - d.y);
    if (p != 0) {
        g = j / p;
        e = k / p;
        if (g >= 0 && e <= 1 && g <= 1 && e >= 0) {
            o = new OpenLayers.Geometry.Point(d.x + g * (c.x - d.x), d.y + g * (c.y - d.y))
        } else {
            o = "No Intersection"
        }
    } else {
        if (j == 0 && k == 0) {
            var f = Math.max(d.y, c.y);
            var m = Math.min(d.y, c.y);
            var h = Math.max(d.x, c.x);
            var n = Math.min(d.x, c.x);
            if (((l.y >= m && l.y <= f) || (i.y >= m && i.y <= f)) && (l.x >= n && l.x <= h) || (i.x >= n && i.x <= h)) {
                o = "Coincident"
            } else {
                o = "Parallel"
            }
        } else {
            o = "Parallel"
        }
    }
    return o
};
OpenLayers.Util.clipLineRect = function(d, e, h) {
    var c = [];
    var b = new OpenLayers.Geometry.Point(h.left, h.bottom);
    var k = new OpenLayers.Geometry.Point(h.right, h.top);
    var g = new OpenLayers.Geometry.Point(h.right, h.bottom);
    var j = new OpenLayers.Geometry.Point(h.left, h.top);
    var a = [];
    a.push(OpenLayers.Util.lineIntersection(b, g, d, e));
    a.push(OpenLayers.Util.lineIntersection(g, k, d, e));
    a.push(OpenLayers.Util.lineIntersection(k, j, d, e));
    a.push(OpenLayers.Util.lineIntersection(j, b, d, e));
    var f = 0;
    while (f < a.length) {
        if (a[f].CLASS_NAME === "OpenLayers.Geometry.Point") {
            c.push(a[f])
        }
        f++
    }
    return c
};
OpenLayers.Geometry.Point.prototype.calculateParts = function() {

};
OpenLayers.Geometry.Point.prototype.toJSON = function(map) {
    var point = {
        lon: this.x,
        lat: this.y
    };
    if (map) {
        point = NPMap.T.getPoint(map, point);
    }
    var arr = "{\"x\":  " + point.lon + ", \"y\": " + point.lat + "}";
    return "{\"controlPoints\":[" + arr + "]" + ",\"CLASS_NAME\":\"" + this.CLASS_NAME + "\"}";

};
OpenLayers.Geometry.Point.fromJSON = function(json, map) {
    var obj = eval('(' + json + ')');
    var point = {
        lon: obj.controlPoints[0].x,
        lat: obj.controlPoints[0].y
    };
    if (map) {
        point = NPMap.T.setPoint(map, point);
    }
    return new OpenLayers.Geometry.Point(point.lon, point.lat);
};
OpenLayers.Layer.prototype.drawFeature = function(feature, style) {
    // don't try to draw the feature with the renderer if the layer is not 
    // drawn itself
    if (!this.drawn) {
        return;
    }
    if (typeof style != "object") {
        if (!style && feature.state === OpenLayers.State.DELETE) {
            style = "delete";
        }
        var renderIntent = style || feature.renderIntent;
        style = feature.style || this.style;
        if (!style) {
            style = this.styleMap.createSymbolizer(feature, renderIntent);
        }
    }
    var drawn;
    var p = this;

    function e(t, s) {
        if (s) {
            var r = document.getElementById(t + "_clip_" + s);
            s++
        } else {
            var r = document.getElementById(t);
            s = 1
        }
        if (r) {
            p.renderer.vectorRoot.removeChild(r);
            e(t, s)
        }
    }
    if ((this.renderer.CLASS_NAME === "OpenLayers.Renderer.SVG") || (this.renderer.CLASS_NAME === "OpenLayers.Renderer.VML")) {
        var g = feature.geometry;
        var q = feature;
        if (g) {
            this.renderer.removeText(q.id);
            this.renderer.removeBackground(g.id);
            if ((g.CLASS_NAME === "OpenLayers.Geometry.Collection") || (g.CLASS_NAME === "OpenLayers.Geometry.MultiPoint") || (g.CLASS_NAME === "OpenLayers.Geometry.MultiLineString") || (g.CLASS_NAME === "OpenLayers.Geometry.MultiPolygon") || g.isMultiPlotting) {
                for (var h = 0, l = g.components.length; h < l; h++) {
                    var d = g.components[h].id;
                    e(d)
                }
            } else {
                e(g.id)
            }
        }
        var m = this.getExtent();
        var a = m.getWidth();
        var f = m.getHeight();
        var n = OpenLayers.Util.clipGeometryRect(feature.geometry, new OpenLayers.Bounds(m.left - a, m.bottom - f, m.right + a, m.top + f), true, true);
        feature.geometry = n;
        drawn = this.renderer.drawFeature(feature, style);
        feature.geometry = g;
        this.renderer.vectorRoot.style.cursor = "pointer"
    } else {
        drawn = this.renderer.drawFeature(feature, style);
    }

    feature.style = style;
    //TODO remove the check for null when we get rid of Renderer.SVG
    if (drawn === false || drawn === null) {
        this.unrenderedFeatures[feature.id] = feature;
    } else {
        delete this.unrenderedFeatures[feature.id];
    }

    this.openBubbleAnimate(feature);
};