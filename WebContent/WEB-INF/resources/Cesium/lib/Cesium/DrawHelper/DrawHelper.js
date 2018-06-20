/**
 * Created by thomas on 9/01/14.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * (c) www.geocento.com
 * www.metaaps.com
 *
 */

var DrawHelper = (function() {



    // constructor
    function _(viewer, container) {
        this.map = viewer;
        this._scene = viewer.scene;
        if (container) {
            container = document.getElementById(container)
        }
        container = container || viewer.container;
        this._tooltip = createTooltip(container);
        this._surfaces = [];
        this._drawing = true;

        this.initialiseHandlers();

        this.enhancePrimitives();

    }

    _.prototype.initialiseHandlers = function() {
        var scene = this._scene;
        var _self = this;
        // scene events
        var handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);

        function callPrimitiveCallback(name, position) {
            if (_self._handlersMuted == true) return;
            var pickedObject = scene.pick(position);
            if (pickedObject && pickedObject.primitive && pickedObject.primitive[name]) {
                pickedObject.primitive[name](position);
            }
        }
        handler.setInputAction(
            function(movement) {
                callPrimitiveCallback('leftClick', movement.position);
            }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        handler.setInputAction(
            function(movement) {
                callPrimitiveCallback('leftDoubleClick', movement.position);
            }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        var mouseOutObject;
        handler.setInputAction(
            function(movement) {
                if (_self._handlersMuted == true) return;
                var pickedObject = scene.pick(movement.endPosition);
                if (mouseOutObject && (!pickedObject || mouseOutObject != pickedObject.primitive)) {
                    !(mouseOutObject.isDestroyed && mouseOutObject.isDestroyed()) && mouseOutObject.mouseOut(movement.endPosition);
                    mouseOutObject = null;
                }
                if (pickedObject && pickedObject.primitive) {
                    pickedObject = pickedObject.primitive;
                    if (pickedObject.mouseOut) {
                        mouseOutObject = pickedObject;
                    }
                    if (pickedObject.mouseMove) {
                        pickedObject.mouseMove(movement.endPosition);
                    }
                }
            }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        handler.setInputAction(
            function(movement) {
                callPrimitiveCallback('leftUp', movement.position);
            }, Cesium.ScreenSpaceEventType.LEFT_UP);
        handler.setInputAction(
            function(movement) {
                callPrimitiveCallback('leftDown', movement.position);
            }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
    }

    _.prototype.setListener = function(primitive, type, callback) {
        primitive[type] = callback;
    }

    _.prototype.muteHandlers = function(muted) {
        this._handlersMuted = muted;
    }

    // register event handling for an editable shape
    // shape should implement setEditMode and setHighlighted
    _.prototype.registerEditableShape = function(surface) {
        var _self = this;

        // handlers for interactions
        // highlight polygon when mouse is entering
        setListener(surface, 'mouseMove', function(position) {
            surface.setHighlighted(true);
            if (!surface._editMode) {
                _self._tooltip.showAt(position, "Click to edit this shape");
            }
        });
        // hide the highlighting when mouse is leaving the polygon
        setListener(surface, 'mouseOut', function(position) {
            surface.setHighlighted(false);
            _self._tooltip.setVisible(false);
        });
        setListener(surface, 'leftClick', function(position) {
            surface.setEditMode(true);
        });
    }

    _.prototype.startDrawing = function(cleanUp) {
        // undo any current edit of shapes
        this.disableAllEditMode();
        // check for cleanUp first
        if (this.editCleanUp) {
            this.editCleanUp();
        }
        this.editCleanUp = cleanUp;
        this.muteHandlers(true);
    }

    _.prototype.stopDrawing = function() {
        // check for cleanUp first
        if (this.editCleanUp) {
            this.editCleanUp();
            this.editCleanUp = null;
        }
        this.muteHandlers(false);
    }

    // make sure only one shape is highlighted at a time
    _.prototype.disableAllHighlights = function() {
        this.setHighlighted(undefined);
    }

    _.prototype.setHighlighted = function(surface) {
        if (this._highlightedSurface && !this._highlightedSurface.isDestroyed() && this._highlightedSurface != surface) {
            this._highlightedSurface.setHighlighted(false);
        }
        this._highlightedSurface = surface;
    }

    _.prototype.disableAllEditMode = function() {
        this.setEdited(undefined);
    }

    _.prototype.setEdited = function(surface) {
        if (this._editedSurface && !this._editedSurface.isDestroyed()) {
            this._editedSurface.setEditMode(false);
        }
        this._editedSurface = surface;
    }



    var defaultShapeOptions = function() {
        return {
            ellipsoid: Cesium.Ellipsoid.WGS84,
            textureRotationAngle: 0.0,
            height: 0.0,
            asynchronous: true,
            show: true,
            debugShowBoundingVolume: false
        };
    }

    var defaultSurfaceOptions = function() {
        var material = Cesium.Material.fromType(Cesium.Material.ColorType);
        material.uniforms.color = new Cesium.Color(1.0, 1.0, 0.0, 0.5);
        return copyOptions(defaultShapeOptions(), {
            appearance: new Cesium.EllipsoidSurfaceAppearance({
                aboveGround: false
            }),
            material: material,
            granularity: Math.PI / 180.0
        });
    }

    var defaultPolygonOptions = function() {
        copyOptions(defaultShapeOptions(), {});
    }
    var defaultExtentOptions = function() {
        return copyOptions(defaultShapeOptions(), {});
    }
    var defaultCircleOptions = function() {
        return copyOptions(defaultShapeOptions(), {});
    }
    var defaultEllipseOptions = function() {
        return copyOptions(defaultSurfaceOptions(), {
            rotation: 0
        });
    }
    var getMaterial = function() {
        var material = Cesium.Material.fromType(Cesium.Material.ColorType);
        material.uniforms.color = new Cesium.Color(1.0, 1.0, 0.0, 0.5);
        return material;
    }
    var defaultPolylineOptions = function() {
        var material = getMaterial();
        return copyOptions(defaultShapeOptions(), {
            width: 5,
            geodesic: true,
            granularity: 10000,
            appearance: new Cesium.PolylineMaterialAppearance({
                aboveGround: false
            }),
            material: material
        });
    }



    var ChangeablePrimitive = (function() {
        function _() {}

        _.prototype.initialiseOptions = function(options) {

            fillOptions(this, options);

            this._ellipsoid = undefined;
            this._granularity = undefined;
            this._height = undefined;
            this._textureRotationAngle = undefined;
            this._id = undefined;

            // set the flags to initiate a first drawing
            this._createPrimitive = true;
            this._primitive = undefined;
            this._outlinePolygon = undefined;

        }

        _.prototype.setAttribute = function(name, value) {
            this[name] = value;
            this._createPrimitive = true;
        };

        _.prototype.getAttribute = function(name) {
            return this[name];
        };

        /**
         * @private
         */
        _.prototype.update = function(context, frameState, commandList) {

            if (!Cesium.defined(Cesium.Ellipsoid.WGS84)) {
                throw new Cesium.DeveloperError('this.ellipsoid must be defined.');
            }

            if (!Cesium.defined(this.appearance)) {
                // throw new Cesium.DeveloperError('this.material must be defined.');
            }

            if (this.granularity < 0.0) {
                throw new Cesium.DeveloperError('this.granularity and scene2D/scene3D overrides must be greater than zero.');
            }

            if (!this.show) {
                return;
            }

            if (!this._createPrimitive && (!Cesium.defined(this._primitive))) {
                // No positions/hierarchy to draw
                return;
            }

            if (this._createPrimitive ||
                (this._ellipsoid !== Cesium.Ellipsoid.WGS84) ||
                (this._granularity !== this.granularity) ||
                (this._height !== this.height) ||
                (this._textureRotationAngle !== this.textureRotationAngle) ||
                (this._id !== this.id)) {

                var geometry = this.getGeometry();
                if (!geometry) {
                    return;
                }

                this._createPrimitive = false;
                this._ellipsoid = Cesium.Ellipsoid.WGS84;
                this._granularity = this.granularity;
                this._height = this.height;
                this._textureRotationAngle = this.textureRotationAngle;
                this._id = this.id;

                this._primitive = this._primitive && this._primitive.destroy();

                this._primitive = new Cesium.Primitive({
                    geometryInstances: new Cesium.GeometryInstance({
                        geometry: geometry,
                        id: this.id,
                        pickPrimitive: this
                    }),
                    appearance: this.appearance,
                    asynchronous: this.asynchronous
                });

                this._outlinePolygon = this._outlinePolygon && this._outlinePolygon.destroy();
                if (this.strokeColor && this.getOutlineGeometry) {
                    // create the highlighting frame
                    context._aliasedLineWidthRange = context._aliasedLineWidthRange || [1, 2];
                    this._outlinePolygon = new Cesium.Primitive({
                        geometryInstances: new Cesium.GeometryInstance({
                            geometry: this.getOutlineGeometry(),
                            attributes: {
                                color: Cesium.ColorGeometryInstanceAttribute.fromColor(this.strokeColor)
                            }
                        }),
                        appearance: new Cesium.PerInstanceColorAppearance({
                            flat: true,
                            renderState: {
                                depthTest: {
                                    enabled: true
                                },
                                lineWidth: Math.min(this.strokeWidth || 4.0, context._aliasedLineWidthRange[1])
                            }
                        })
                    });
                }
            }

            var primitive = this._primitive;
            primitive.appearance.material = getMaterial();
            primitive.debugShowBoundingVolume = this.debugShowBoundingVolume;
            primitive.update(context, frameState, commandList);
            this._outlinePolygon && this._outlinePolygon.update(context, frameState, commandList);

        };

        _.prototype.isDestroyed = function() {
            return false;
        };

        _.prototype.destroy = function() {
            this._primitive = this._primitive && this._primitive.destroy();
            return Cesium.destroyObject(this);
        };

        _.prototype.setStrokeStyle = function(strokeColor, strokeWidth) {
            if (!this.strokeColor || !this.strokeColor.equals(strokeColor) || this.strokeWidth != strokeWidth) {
                this._createPrimitive = true;
                this.strokeColor = strokeColor;
                this.strokeWidth = strokeWidth;
            }
        }

        return _;
    })();

    _.ExtentPrimitive = (function() {
        function _(options) {

            if (!Cesium.defined(options.extent)) {
                throw new Cesium.DeveloperError('Extent is required');
            }

            options = copyOptions(options, defaultSurfaceOptions());

            this.initialiseOptions(options);

            this.setExtent(options.extent);

        }

        _.prototype = new ChangeablePrimitive();

        _.prototype.setExtent = function(extent) {
            this.setAttribute('extent', extent);
        };

        _.prototype.getExtent = function() {
            return this.getAttribute('extent');
        };

        _.prototype.getGeometry = function() {

            if (!Cesium.defined(this.extent)) {
                return;
            }

            return new Cesium.RectangleGeometry({
                rectangle: this.extent,
                height: this.height,
                vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
                stRotation: this.textureRotationAngle,
                ellipsoid: Cesium.Ellipsoid.WGS84,
                granularity: this.granularity
            });
        };

        _.prototype.getOutlineGeometry = function() {
            return new Cesium.RectangleOutlineGeometry({
                rectangle: this.extent
            });
        }

        return _;
    })();

    _.PolygonPrimitive = (function() {

        function _(options) {

            options = copyOptions(options, defaultSurfaceOptions());

            this.initialiseOptions(options);

            this.isPolygon = true;

        }

        _.prototype = new ChangeablePrimitive();

        _.prototype.setPositions = function(positions) {
            this.setAttribute('positions', positions);
        };

        _.prototype.getPositions = function() {
            return this.getAttribute('positions');
        };

        _.prototype.getGeometry = function() {

            if (!Cesium.defined(this.positions) || this.positions.length < 3) {
                return;
            }

            return Cesium.PolygonGeometry.fromPositions({
                positions: this.positions,
                height: this.height,
                vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
                stRotation: this.textureRotationAngle,
                ellipsoid: Cesium.Ellipsoid.WGS84,
                granularity: this.granularity
            });
        };

        _.prototype.getOutlineGeometry = function() {
            return Cesium.PolygonOutlineGeometry.fromPositions({
                positions: this.getPositions()
            });
        }

        return _;
    })();

    _.CirclePrimitive = (function() {

        function _(options) {

            if (!(Cesium.defined(options.center) && Cesium.defined(options.radius))) {
                throw new Cesium.DeveloperError('Center and radius are required');
            }

            options = copyOptions(options, defaultSurfaceOptions());

            this.initialiseOptions(options);

            this.setRadius(options.radius);

        }

        _.prototype = new ChangeablePrimitive();

        _.prototype.setCenter = function(center) {
            this.setAttribute('center', center);
        };

        _.prototype.setRadius = function(radius) {
            this.setAttribute('radius', Math.max(0.1, radius));
        };

        _.prototype.getCenter = function() {
            return this.getAttribute('center');
        };

        _.prototype.getRadius = function() {
            return this.getAttribute('radius');
        };

        _.prototype.getGeometry = function() {

            if (!(Cesium.defined(this.center) && Cesium.defined(this.radius))) {
                return;
            }

            return new Cesium.CircleGeometry({
                center: this.center,
                radius: this.radius,
                height: this.height,
                vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
                stRotation: this.textureRotationAngle,
                ellipsoid: Cesium.Ellipsoid.WGS84,
                granularity: this.granularity
            });
        };

        _.prototype.getOutlineGeometry = function() {
            return new Cesium.CircleOutlineGeometry({
                center: this.getCenter(),
                radius: this.getRadius()
            });
        }

        return _;
    })();

    _.EllipsePrimitive = (function() {
        function _(options) {

            if (!(Cesium.defined(options.center) && Cesium.defined(options.semiMajorAxis) && Cesium.defined(options.semiMinorAxis))) {
                throw new Cesium.DeveloperError('Center and semi major and semi minor axis are required');
            }

            options = copyOptions(options, defaultEllipseOptions());

            this.initialiseOptions(options);

        }

        _.prototype = new ChangeablePrimitive();

        _.prototype.setCenter = function(center) {
            this.setAttribute('center', center);
        };

        _.prototype.setSemiMajorAxis = function(semiMajorAxis) {
            if (semiMajorAxis < this.getSemiMinorAxis()) return;
            this.setAttribute('semiMajorAxis', semiMajorAxis);
        };

        _.prototype.setSemiMinorAxis = function(semiMinorAxis) {
            if (semiMinorAxis > this.getSemiMajorAxis()) return;
            this.setAttribute('semiMinorAxis', semiMinorAxis);
        };

        _.prototype.setRotation = function(rotation) {
            return this.setAttribute('rotation', rotation);
        };

        _.prototype.getCenter = function() {
            return this.getAttribute('center');
        };

        _.prototype.getSemiMajorAxis = function() {
            return this.getAttribute('semiMajorAxis');
        };

        _.prototype.getSemiMinorAxis = function() {
            return this.getAttribute('semiMinorAxis');
        };

        _.prototype.getRotation = function() {
            return this.getAttribute('rotation');
        };

        _.prototype.getGeometry = function() {

            if (!(Cesium.defined(this.center) && Cesium.defined(this.semiMajorAxis) && Cesium.defined(this.semiMinorAxis))) {
                return;
            }

            return new Cesium.EllipseGeometry({
                ellipsoid: Cesium.Ellipsoid.WGS84,
                center: this.center,
                semiMajorAxis: this.semiMajorAxis,
                semiMinorAxis: this.semiMinorAxis,
                rotation: this.rotation,
                height: this.height,
                vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
                stRotation: this.textureRotationAngle,
                ellipsoid: Cesium.Ellipsoid.WGS84,
                granularity: this.granularity
            });
        };

        _.prototype.getOutlineGeometry = function() {
            return new Cesium.EllipseOutlineGeometry({
                center: this.getCenter(),
                semiMajorAxis: this.getSemiMajorAxis(),
                semiMinorAxis: this.getSemiMinorAxis(),
                rotation: this.getRotation()
            });
        }

        return _;
    })();

    _.PolylinePrimitive = (function() {

        function _(options) {

            options = copyOptions(options, defaultPolylineOptions());

            this.initialiseOptions(options);

        }

        _.prototype = new ChangeablePrimitive();

        _.prototype.setPositions = function(positions) {
            this.setAttribute('positions', positions);
        };

        _.prototype.setWidth = function(width) {
            this.setAttribute('width', width);
        };

        _.prototype.setGeodesic = function(geodesic) {
            this.setAttribute('geodesic', geodesic);
        };

        _.prototype.getPositions = function() {
            return this.getAttribute('positions');
        };

        _.prototype.getWidth = function() {
            return this.getAttribute('width');
        };

        _.prototype.getGeodesic = function(geodesic) {
            return this.getAttribute('geodesic');
        };

        _.prototype.getGeometry = function() {

            if (!Cesium.defined(this.positions) || this.positions.length < 2) {
                return;
            }

            return new Cesium.PolylineGeometry({
                positions: this.positions,
                height: this.height,
                width: this.width < 1 ? 1 : this.width,
                vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
                ellipsoid: Cesium.Ellipsoid.WGS84
            });
        }

        return _;
    })();
    //var host = NPUtil.getHost() + '/DrawHelper';
    var host = NPGIS3D.NPUtil.getHost() + 'lib/Cesium/Assets';
    var defaultBillboard = {
        iconUrl: host + "/img/dragIcon.png",
        shiftX: 0,
        shiftY: 0,
        color: Cesium.Color.RED
    }

    var dragBillboard = {
        iconUrl: host + "/img/dragIcon.png",
        shiftX: 0,
        shiftY: 0,
        color: Cesium.Color.RED
    }

    var dragHalfBillboard = {
        iconUrl: host + "/img/dragIconLight.png",
        shiftX: 0,
        shiftY: 0
    }

    _.prototype.createBillboardGroup = function(points, options, callbacks) {
        var markers = new _.BillboardGroup(this, options);
        markers.addBillboards(points, callbacks);
        return markers;
    }

    _.BillboardGroup = function(drawHelper, options) {

        this._drawHelper = drawHelper;
        this._scene = drawHelper._scene;

        this._options = copyOptions(options, defaultBillboard);

        // create one common billboard collection for all billboards
        var b = new Cesium.BillboardCollection();
        this._scene.primitives.add(b);
        this._billboards = b;
        // keep an ordered list of billboards
        this._orderedBillboards = [];
    }

    _.BillboardGroup.prototype.createBillboard = function(position, callbacks) {
        var ellipsoid = Cesium.Ellipsoid.WGS84;
        var billboard = this._billboards.add({
            show: true,
            position: position,
            pixelOffset: new Cesium.Cartesian2(this._options.shiftX, this._options.shiftY),
            eyeOffset: new Cesium.Cartesian3(0.0, 0.0, 0.0),
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            verticalOrigin: Cesium.VerticalOrigin.CENTER,
            scale: 1.0,
            image: this._options.iconUrl,
            color: Cesium.Color.RED
        });

        // if editable
        if (callbacks) {
            var _self = this;
            var screenSpaceCameraController = this._scene.screenSpaceCameraController;

            function enableRotation(enable) {
                screenSpaceCameraController.enableRotate = enable;
            }

            function getIndex() {
                // find index
                for (var i = 0, I = _self._orderedBillboards.length; i < I && _self._orderedBillboards[i] != billboard; ++i);
                return i;
            }
            if (callbacks.dragHandlers) {
                var _self = this;
                setListener(billboard, 'leftDown', function(position) {
                    if (_self.isActive) {
                        return;
                    }
                    _self.isActive = true;
                    // TODO - start the drag handlers here
                    // create handlers for mouseOut and leftUp for the billboard and a mouseMove
                    function onDrag(position) {
                        billboard.position = position;
                        // find index
                        for (var i = 0, I = _self._orderedBillboards.length; i < I && _self._orderedBillboards[i] != billboard; ++i);
                        callbacks.dragHandlers.onDrag && callbacks.dragHandlers.onDrag(getIndex(), position);
                    }

                    function onDragEnd(position) {
                        handler.destroy();
                        enableRotation(true);
                        callbacks.dragHandlers.onDragEnd && callbacks.dragHandlers.onDragEnd(getIndex(), position);
                    }
                    var handler = new Cesium.ScreenSpaceEventHandler(_self._scene.canvas);

                    handler.setInputAction(function(movement) {
                        var cartesian = _self._scene.camera.pickEllipsoid(movement.endPosition, ellipsoid);
                        if (cartesian) {
                            onDrag(cartesian);
                        } else {
                            onDragEnd(cartesian);
                        }
                    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

                    handler.setInputAction(function(movement) {
                        _self.isActive = false;
                        onDragEnd(_self._scene.camera.pickEllipsoid(movement.position, ellipsoid));
                    }, Cesium.ScreenSpaceEventType.LEFT_UP);

                    enableRotation(false);

                    callbacks.dragHandlers.onDragStart && callbacks.dragHandlers.onDragStart(getIndex(), _self._scene.camera.pickEllipsoid(position, ellipsoid));
                });
            }
            if (callbacks.onDoubleClick) {
                setListener(billboard, 'leftDoubleClick', function(position) {
                    callbacks.onDoubleClick(getIndex());
                });
            }
            if (callbacks.onClick) {
                setListener(billboard, 'leftClick', function(position) {
                    callbacks.onClick(getIndex());
                });
            }
            if (callbacks.tooltip) {
                setListener(billboard, 'mouseMove', function(position) {
                    _self._drawHelper._tooltip.showAt(position, callbacks.tooltip());
                });
                setListener(billboard, 'mouseOut', function(position) {
                    _self._drawHelper._tooltip.setVisible(false);
                });
            }
        }

        return billboard;
    }

    _.BillboardGroup.prototype.insertBillboard = function(index, position, callbacks) {
        this._orderedBillboards.splice(index, 0, this.createBillboard(position, callbacks));
    }

    _.BillboardGroup.prototype.addBillboard = function(position, callbacks) {
        this._orderedBillboards.push(this.createBillboard(position, callbacks));
    }

    _.BillboardGroup.prototype.addBillboards = function(positions, callbacks) {
        var index = 0;
        for (; index < positions.length; index++) {
            this.addBillboard(positions[index], callbacks);
        }
    }

    _.BillboardGroup.prototype.updateBillboardsPositions = function(positions) {
        var index = 0;
        for (; index < positions.length; index++) {
            this.getBillboard(index).position = positions[index];
        }
    }

    _.BillboardGroup.prototype.countBillboards = function() {
        return this._orderedBillboards.length;
    }

    _.BillboardGroup.prototype.getBillboard = function(index) {
        return this._orderedBillboards[index];
    }

    _.BillboardGroup.prototype.removeBillboard = function(index) {
        this._billboards.remove(this.getBillboard(index));
        this._orderedBillboards.splice(index, 1);
    }

    _.BillboardGroup.prototype.remove = function() {
        this._billboards = this._billboards && this._billboards.removeAll() && this._billboards.destroy();
    }

    _.BillboardGroup.prototype.setOnTop = function() {
        this._scene.primitives.raiseToTop(this._billboards);
    }

    _.prototype.startDrawingMarker = function(options) {

        var options = copyOptions(options, defaultBillboard);

        this.startDrawing(
            function() {
                markers && markers.remove();
                mouseHandler.destroy();
                tooltip.setVisible(false);
            }
        );

        var _self = this;
        var scene = this._scene;
        var primitives = scene.primitives;
        var tooltip = this._tooltip;

        var markers = new _.BillboardGroup(this, options);

        var mouseHandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);

        // Now wait for start
        mouseHandler.setInputAction(function(movement) {
            if (movement.position != null) {
                var cartesian = scene.camera.pickEllipsoid(movement.position, Cesium.Ellipsoid.WGS84);
                if (cartesian) {
                    markers.addBillboard(cartesian);
                    _self.stopDrawing();
                    var data = {
                        position: cartesian,
                        scene: scene
                    };
                    options.callback(data);
                    //options.callback(cartesian);
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        mouseHandler.setInputAction(function(movement) {
            var position = movement.endPosition;
            if (position != null) {
                var cartesian = scene.camera.pickEllipsoid(position, Cesium.Ellipsoid.WGS84);
                if (cartesian) {
                    tooltip.showAt(position, "<p>右键新增标注. 当前位置: </p>" + getDisplayLatLngString(Cesium.Ellipsoid.WGS84.cartesianToCartographic(cartesian)));
                } else {
                    tooltip.showAt(position, "<p>右键新增标注.</p>");
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    }

    _.prototype.startDrawingPolygon = function(options) {
        var options = copyOptions(options, defaultSurfaceOptions());
        this.startDrawingPolyshape(true, options);
    }

    _.prototype.startDrawingPolyline = function(options) {
        var options = copyOptions(options, defaultPolylineOptions());
        this.startDrawingPolyshape(false, options);
    }

    _.prototype.startDrawingPolyshape = function(isPolygon, options) {

        this.startDrawing(
            function() {
                primitives.remove(poly);
                markers && markers.remove();
                mouseHandler.destroy();
                tooltip.setVisible(false);
            }
        );

        var _self = this;
        var scene = this._scene;
        var primitives = scene.primitives;
        var tooltip = this._tooltip;

        var minPoints = isPolygon ? 3 : 2;
        var poly;
        if (isPolygon) {
            poly = new DrawHelper.PolygonPrimitive(options);
        } else {
            poly = new DrawHelper.PolylinePrimitive(options);
        }
        poly.asynchronous = false;
        primitives.add(poly);

        var positions = [];
        var markers = new _.BillboardGroup(this, defaultBillboard);

        var mouseHandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);

        // Now wait for start
        mouseHandler.setInputAction(function(movement) {
            if (movement.position != null) {
                var cartesian = scene.camera.pickEllipsoid(movement.position, Cesium.Ellipsoid.WGS84);
                if (cartesian) {
                    // first click
                    if (positions.length == 0) {
                        positions.push(cartesian.clone());
                        markers.addBillboard(positions[0]);
                    }
                    if (positions.length >= minPoints) {
                        poly.positions = positions;
                        poly._createPrimitive = true;
                    }
                    // add new point to polygon
                    // this one will move with the mouse
                    positions.push(cartesian);
                    // add marker at the new position
                    markers.addBillboard(cartesian);
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        mouseHandler.setInputAction(function(movement) {
            var position = movement.endPosition;
            if (position != null) {
                if (positions.length == 0) {
                    tooltip.showAt(position, "<p>单击新增第一个点</p>");
                } else {
                    var cartesian = scene.camera.pickEllipsoid(position, Cesium.Ellipsoid.WGS84);
                    if (cartesian) {
                        positions.pop();
                        // make sure it is slightly different
                        //cartesian.y += (1 + Math.random());
                        positions.push(cartesian);
                        if (positions.length >= minPoints) {
                            poly.positions = positions;
                            poly._createPrimitive = true;
                        }
                        // update marker
                        markers.getBillboard(positions.length - 1).position = cartesian;
                        // show tooltip
                        tooltip.showAt(position, "<p>单击新增点位(" + positions.length + ")</p>" + (positions.length > minPoints ? "<p>双击结束绘制</p>" : ""));
                    }
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        mouseHandler.setInputAction(function(movement) {
            var position = movement.position;
            if (position != null) {
                if (positions.length < minPoints + 2) {
                    return;
                } else {
                    var cartesian = scene.camera.pickEllipsoid(position, Cesium.Ellipsoid.WGS84);
                    if (cartesian) {
                        _self.stopDrawing();
                        if (typeof options.callback == 'function') {
                            // remove overlapping ones
                            var index = positions.length - 1;
                            // TODO - calculate some epsilon based on the zoom level
                            var epsilon = 0.0000001; // Cesium.Math.EPSILON3;
                            for (; index > 0 && positions[index].equalsEpsilon(positions[index - 1], epsilon); index--) {

                            }
                            if (index === 0) {
                                index = 1;
                            }
                            //options.callback(positions.splice(0, index + 1));

                            //options.callback(positions); 

                            var data = {
                                positions: positions.slice(0, positions.length - 2),
                                scene: scene
                            };
                            options.callback(data);
                        }
                    }
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

    }

    function getExtentCorners(value) {
        return Cesium.Ellipsoid.WGS84.cartographicArrayToCartesianArray([Cesium.Rectangle.northwest(value), Cesium.Rectangle.northeast(value), Cesium.Rectangle.southeast(value), Cesium.Rectangle.southwest(value)]);
    }

    _.prototype.startDrawingExtent = function(options) {

        var options = copyOptions(options, defaultSurfaceOptions());

        this.startDrawing(
            function() {
                if (extent != null) {
                    primitives.remove(extent);
                }
                markers && markers.remove();
                mouseHandler.destroy();
                tooltip.setVisible(false);
            }
        );

        var _self = this;
        var scene = this._scene;
        var primitives = this._scene.primitives;
        var tooltip = this._tooltip;

        var firstPoint = null;
        var extent = null;
        var markers = null;

        var mouseHandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);

        function updateExtent(value) {
            if (extent == null) {
                // extent = new Cesium.RectanglePrimitive();
                // extent.asynchronous = false;

                var instance = new Cesium.GeometryInstance({
                    geometry: new Cesium.RectangleGeometry({
                        rectangle: Cesium.Rectangle.fromDegrees(-100.0, 20.0, -90.0, 30.0),
                        vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT
                    })
                });

                extent = new Cesium.Primitive({
                    geometryInstances: instance,
                    appearance: new Cesium.EllipsoidSurfaceAppearance({
                        material: Cesium.Material.fromType('Dot')
                    })
                });
                extent.asynchronous = false;
                primitives.add(extent);
            }
            extent.rectangle = value;
            // update the markers
            var corners = getExtentCorners(value);
            // create if they do not yet exist
            if (markers == null) {
                markers = new _.BillboardGroup(_self, defaultBillboard);
                markers.addBillboards(corners);
            } else {
                markers.updateBillboardsPositions(corners);
            }
        }

        // Now wait for start
        mouseHandler.setInputAction(function(movement) {
            if (movement.position != null) {
                var cartesian = scene.camera.pickEllipsoid(movement.position, Cesium.Ellipsoid.WGS84);
                if (cartesian) {
                    if (extent == null) {
                        // create the rectangle
                        firstPoint = Cesium.Ellipsoid.WGS84.cartesianToCartographic(cartesian);
                        var value = getExtent(firstPoint, firstPoint);
                        updateExtent(value);
                    } else {
                        _self.stopDrawing();
                        if (typeof options.callback == 'function') {

                            //options.callback(getExtent(firstPoint, ellipsoid.cartesianToCartographic(cartesian)));
                            var data = {
                                extent: getExtent(firstPoint, Cesium.Ellipsoid.WGS84.cartesianToCartographic(cartesian)),
                                scene: scene
                            };
                            options.callback(data);
                        }
                    }
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

        mouseHandler.setInputAction(function(movement) {
            var position = movement.endPosition;
            if (position != null) {
                if (extent == null) {
                    tooltip.showAt(position, "<p>单击开始绘制矩形</p>");
                } else {
                    var cartesian = scene.camera.pickEllipsoid(position, Cesium.Ellipsoid.WGS84);
                    if (cartesian) {
                        var value = getExtent(firstPoint, Cesium.Ellipsoid.WGS84.cartesianToCartographic(cartesian));
                        updateExtent(value);
                        tooltip.showAt(position, "<p>拖拽改变矩形大小</p><p>再次单击结束绘制</p>");
                    }
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    }

    _.prototype.startDrawingCircle = function(options) {

        var options = copyOptions(options, defaultSurfaceOptions());

        this.startDrawing(
            function cleanUp() {
                if (circle != null) {
                    primitives.remove(circle);
                }
                markers && markers.remove();
                mouseHandler.destroy();
                tooltip.setVisible(false);
            }
        );

        var _self = this;
        var scene = this._scene;
        var primitives = this._scene.primitives;
        var tooltip = this._tooltip;

        var circle = null;
        var markers = null;

        var mouseHandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);

        // Now wait for start
        mouseHandler.setInputAction(function(movement) {
            if (movement.position != null) {
                var cartesian = scene.camera.pickEllipsoid(movement.position, Cesium.Ellipsoid.WGS84);
                if (cartesian) {
                    if (circle == null) {
                        // create the circle
                        circle = new _.CirclePrimitive({
                            center: cartesian,
                            radius: 0,
                            asynchronous: false,
                            material: options.material
                        });
                        primitives.add(circle);
                        markers = new _.BillboardGroup(_self, defaultBillboard);
                        markers.addBillboards([cartesian]);
                    } else {
                        if (typeof options.callback == 'function') {
                            //options.callback(circle.getCenter(), circle.getRadius());
                            var data = {
                                center: circle.getCenter(),
                                radius: circle.getRadius(),
                                scene: scene
                            };
                            options.callback(data);
                        }
                        _self.stopDrawing();
                    }
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

        mouseHandler.setInputAction(function(movement) {
            var position = movement.endPosition;
            if (position != null) {
                if (circle == null) {
                    tooltip.showAt(position, "<p>点击开始绘制圆</p>");
                } else {
                    var cartesian = scene.camera.pickEllipsoid(position, Cesium.Ellipsoid.WGS84);
                    if (cartesian) {
                        circle.setRadius(Cesium.Cartesian3.distance(circle.getCenter(), cartesian));
                        markers.updateBillboardsPositions(cartesian);
                        tooltip.showAt(position, "<p>移动鼠标改变圆半径</p><p>单击结束绘制</p>");
                    }
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    }

    _.prototype.enhancePrimitives = function() {

        var drawHelper = this;

        Cesium.Billboard.prototype.setEditable = function() {

            if (this._editable) {
                return;
            }

            this._editable = true;

            var billboard = this;

            var _self = this;

            function enableRotation(enable) {
                drawHelper._scene.screenSpaceCameraController.enableRotate = enable;
            }

            setListener(billboard, 'leftDown', function(position) {
                // TODO - start the drag handlers here
                // create handlers for mouseOut and leftUp for the billboard and a mouseMove
                function onDrag(position) {
                    billboard.position = position;
                    _self.executeListeners({
                        name: 'drag',
                        positions: position
                    });
                }

                function onDragEnd(position) {
                    handler.destroy();
                    enableRotation(true);
                    _self.executeListeners({
                        name: 'dragEnd',
                        positions: position
                    });
                }

                var handler = new Cesium.ScreenSpaceEventHandler(drawHelper._scene.canvas);

                handler.setInputAction(function(movement) {
                    var cartesian = drawHelper._scene.camera.pickEllipsoid(movement.endPosition, Cesium.Ellipsoid.WGS84);
                    if (cartesian) {
                        onDrag(cartesian);
                    } else {
                        onDragEnd(cartesian);
                    }
                }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

                handler.setInputAction(function(movement) {
                    onDragEnd(drawHelper._scene.camera.pickEllipsoid(movement.position, Cesium.Ellipsoid.WGS84));
                }, Cesium.ScreenSpaceEventType.LEFT_UP);

                enableRotation(false);

            });

            enhanceWithListeners(billboard);

        }

        function setHighlighted(highlighted) {

            var scene = drawHelper._scene;

            // if no change
            // if already highlighted, the outline polygon will be available
            if (this._highlighted && this._highlighted == highlighted) {
                return;
            }
            // disable if already in edit mode
            if (this._editMode === true) {
                return;
            }
            this._highlighted = highlighted;
            // highlight by creating an outline polygon matching the polygon points
            if (highlighted) {
                // make sure all other shapes are not highlighted
                drawHelper.setHighlighted(this);
                this._strokeColor = this.strokeColor;
                this.setStrokeStyle(Cesium.Color.fromCssColorString('white'), this.strokeWidth);
            } else {
                if (this._strokeColor) {
                    this.setStrokeStyle(this._strokeColor, this.strokeWidth);
                } else {
                    this.setStrokeStyle(undefined, undefined);
                }
            }
        }

        function setEditMode(editMode) {
            // if no change
            if (this._editMode == editMode) {
                return;
            }
            // make sure all other shapes are not in edit mode before starting the editing of this shape
            drawHelper.disableAllHighlights();
            // display markers
            if (editMode) {
                drawHelper.setEdited(this);
                var scene = drawHelper._scene;
                var _self = this;
                // create the markers and handlers for the editing
                if (this._markers == null) {
                    var markers = new _.BillboardGroup(drawHelper, dragBillboard);
                    var editMarkers = new _.BillboardGroup(drawHelper, dragHalfBillboard);
                    // function for updating the edit markers around a certain point
                    function updateHalfMarkers(index, positions) {
                        // update the half markers before and after the index
                        var editIndex = index - 1 < 0 ? positions.length - 1 : index - 1;
                        if (editIndex < editMarkers.countBillboards()) {
                            editMarkers.getBillboard(editIndex).position = calculateHalfMarkerPosition(editIndex);
                        }
                        editIndex = index;
                        if (editIndex < editMarkers.countBillboards()) {
                            editMarkers.getBillboard(editIndex).position = calculateHalfMarkerPosition(editIndex);
                        }
                    }

                    function onEdited() {
                        _self.executeListeners({
                            name: 'onEdited',
                            positions: _self.positions
                        });
                    }
                    var handleMarkerChanges = {
                        dragHandlers: {
                            onDrag: function(index, position) {
                                _self.positions[index] = position;
                                updateHalfMarkers(index, _self.positions);
                                _self._createPrimitive = true;
                            },
                            onDragEnd: function(index, position) {
                                _self._createPrimitive = true;
                                onEdited();
                            }
                        },
                        onDoubleClick: function(index) {
                            if (_self.positions.length < 4) {
                                return;
                            }
                            // remove the point and the corresponding markers
                            _self.positions.splice(index, 1);
                            _self._createPrimitive = true;
                            markers.removeBillboard(index);
                            editMarkers.removeBillboard(index);
                            updateHalfMarkers(index, _self.positions);
                            onEdited();
                        },
                        tooltip: function() {
                            if (_self.positions.length > 3) {
                                return "Double click to remove this point";
                            }
                        }
                    };
                    // add billboards and keep an ordered list of them for the polygon edges
                    markers.addBillboards(_self.positions, handleMarkerChanges);
                    this._markers = markers;

                    function calculateHalfMarkerPosition(index) {
                        var positions = _self.positions;
                        var ellipsoid = Cesium.Ellipsoid.WGS84;
                        return ellipsoid.cartographicToCartesian(
                            new Cesium.EllipsoidGeodesic(ellipsoid.cartesianToCartographic(positions[index]),
                                ellipsoid.cartesianToCartographic(positions[index < positions.length - 1 ? index + 1 : 0])).interpolateUsingFraction(0.5)
                        );
                    }
                    var halfPositions = [];
                    var index = 0;
                    var length = _self.positions.length + (this.isPolygon ? 0 : -1);
                    for (; index < length; index++) {
                        halfPositions.push(calculateHalfMarkerPosition(index));
                    }
                    var handleEditMarkerChanges = {
                        dragHandlers: {
                            onDragStart: function(index, position) {
                                this.index = index + 1;
                                // add a new position to the polygon but not a new marker yet
                                _self.positions.splice(this.index, 0, position);
                                _self._createPrimitive = true;
                            },
                            onDrag: function(index, position) {
                                _self.positions[this.index] = position;
                                _self._createPrimitive = true;
                            },
                            onDragEnd: function(index, position) {
                                // create new sets of makers for editing
                                markers.insertBillboard(this.index, position, handleMarkerChanges);
                                editMarkers.getBillboard(this.index - 1).position = calculateHalfMarkerPosition(this.index - 1);
                                editMarkers.insertBillboard(this.index, calculateHalfMarkerPosition(this.index), handleEditMarkerChanges);
                                _self._createPrimitive = true;
                                onEdited();
                            }
                        },
                        tooltip: function() {
                            return "Drag to create a new point";
                        }
                    };
                    editMarkers.addBillboards(halfPositions, handleEditMarkerChanges);
                    this._editMarkers = editMarkers;
                    // add a handler for clicking in the globe
                    this._globeClickhandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
                    this._globeClickhandler.setInputAction(
                        function(movement) {
                            var pickedObject = scene.pick(movement.position);
                            if (!(pickedObject && pickedObject.primitive)) {
                                _self.setEditMode(false);
                            }
                        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

                    // set on top of the polygon
                    markers.setOnTop();
                    editMarkers.setOnTop();
                }
                this._editMode = true;
            } else {
                if (this._markers != null) {
                    this._markers.remove();
                    this._editMarkers.remove();
                    this._markers = null;
                    this._editMarkers = null;
                    this._globeClickhandler.destroy();
                }
                this._editMode = false;
            }

        }

        DrawHelper.PolylinePrimitive.prototype.setEditable = function() {

            if (this.setEditMode) {
                return;
            }

            var polyline = this;
            polyline.isPolygon = false;
            polyline.asynchronous = false;

            drawHelper.registerEditableShape(polyline);

            polyline.setEditMode = setEditMode;

            var originalWidth = this.width;

            polyline.setHighlighted = function(highlighted) {
                // disable if already in edit mode
                if (this._editMode === true) {
                    return;
                }
                if (highlighted) {
                    drawHelper.setHighlighted(this);
                    this.setWidth(originalWidth * 2);
                } else {
                    this.setWidth(originalWidth);
                }
            }

            polyline.getExtent = function() {
                return Cesium.Extent.fromCartographicArray(ellipsoid.cartesianArrayToCartographicArray(this.positions));
            }

            enhanceWithListeners(polyline);

            polyline.setEditMode(false);

        }

        DrawHelper.PolygonPrimitive.prototype.setEditable = function() {

            var polygon = this;
            polygon.asynchronous = false;

            var scene = drawHelper._scene;

            drawHelper.registerEditableShape(polygon);

            polygon.setEditMode = setEditMode;

            polygon.setHighlighted = setHighlighted;

            enhanceWithListeners(polygon);

            polygon.setEditMode(false);

        }

        DrawHelper.ExtentPrimitive.prototype.setEditable = function() {

            if (this.setEditMode) {
                return;
            }

            var extent = this;
            var scene = drawHelper._scene;

            drawHelper.registerEditableShape(extent);
            extent.asynchronous = false;

            extent.setEditMode = function(editMode) {
                // if no change
               var ellipsoid = Cesium.Ellipsoid.WGS84;
                if (this._editMode == editMode) {
                    return;
                }
                drawHelper.disableAllHighlights();
                // display markers
                if (editMode) {
                    // make sure all other shapes are not in edit mode before starting the editing of this shape
                    drawHelper.setEdited(this);
                    // create the markers and handlers for the editing
                    if (this._markers == null) {
                        var markers = new _.BillboardGroup(drawHelper, dragBillboard);

                        function onEdited() {
                            extent.executeListeners({
                                name: 'onEdited',
                                extent: extent.extent
                            });
                        }
                        var handleMarkerChanges = {
                            dragHandlers: {
                                onDrag: function(index, position) {
                                    var corner = markers.getBillboard((index + 2) % 4).position;
                                    extent.setExtent(getExtent(ellipsoid.cartesianToCartographic(corner), ellipsoid.cartesianToCartographic(position)));
                                    markers.updateBillboardsPositions(getExtentCorners(extent.extent));
                                },
                                onDragEnd: function(index, position) {
                                    onEdited();
                                }
                            },
                            tooltip: function() {
                                return "Drag to change the corners of this extent";
                            }
                        };
                        markers.addBillboards(getExtentCorners(extent.extent), handleMarkerChanges);
                        this._markers = markers;
                        // add a handler for clicking in the globe
                        this._globeClickhandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
                        this._globeClickhandler.setInputAction(
                            function(movement) {
                                var pickedObject = scene.pick(movement.position);
                                // disable edit if pickedobject is different or not an object
                                if (!(pickedObject && pickedObject.primitive)) { //&& !pickedObject.isDestroyed()
                                    extent.setEditMode(false);
                                }
                            }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

                        // set on top of the polygon
                        markers.setOnTop();
                    }
                    this._editMode = true;
                } else {
                    if (this._markers != null) {
                        this._markers.remove();
                        this._markers = null;
                        this._globeClickhandler.destroy();
                    }
                    this._editMode = false;
                }
            }

            extent.setHighlighted = setHighlighted;

            enhanceWithListeners(extent);

            extent.setEditMode(false);

        }

        _.EllipsePrimitive.prototype.setEditable = function() {

            if (this.setEditMode) {
                return;
            }

            var ellipse = this;
            var scene = drawHelper._scene;

            ellipse.asynchronous = false;

            drawHelper.registerEditableShape(ellipse);

            ellipse.setEditMode = function(editMode) {
                // if no change
                if (this._editMode == editMode) {
                    return;
                }
                drawHelper.disableAllHighlights();
                // display markers
                if (editMode) {
                    // make sure all other shapes are not in edit mode before starting the editing of this shape
                    drawHelper.setEdited(this);
                    var _self = this;
                    // create the markers and handlers for the editing
                    if (this._markers == null) {
                        var markers = new _.BillboardGroup(drawHelper, dragBillboard);

                        function getMarkerPositions() {
                            return Cesium.Shapes.computeEllipseBoundary(ellipsoid, ellipse.getCenter(), ellipse.getSemiMajorAxis(), ellipse.getSemiMinorAxis(), ellipse.getRotation() + Math.PI / 2, Math.PI / 2.0).splice(0, 4);
                        }

                        function onEdited() {
                            ellipse.executeListeners({
                                name: 'onEdited',
                                center: ellipse.getCenter(),
                                semiMajorAxis: ellipse.getSemiMajorAxis(),
                                semiMinorAxis: ellipse.getSemiMinorAxis(),
                                rotation: 0
                            });
                        }
                        var handleMarkerChanges = {
                            dragHandlers: {
                                onDrag: function(index, position) {
                                    var distance = Cesium.Cartesian3.distance(ellipse.getCenter(), position);
                                    if (index % 2 == 0) {
                                        ellipse.setSemiMajorAxis(distance);
                                    } else {
                                        ellipse.setSemiMinorAxis(distance);
                                    }
                                    markers.updateBillboardsPositions(getMarkerPositions());
                                },
                                onDragEnd: function(index, position) {
                                    onEdited();
                                }
                            },
                            tooltip: function() {
                                return "Drag to change the excentricity and radius";
                            }
                        };
                        markers.addBillboards(getMarkerPositions(), handleMarkerChanges);
                        this._markers = markers;
                        // add a handler for clicking in the globe
                        this._globeClickhandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
                        this._globeClickhandler.setInputAction(
                            function(movement) {
                                var pickedObject = scene.pick(movement.position);
                                if (!(pickedObject && pickedObject.primitive)) {
                                    _self.setEditMode(false);
                                }
                            }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

                        // set on top of the polygon
                        markers.setOnTop();
                    }
                    this._editMode = true;
                } else {
                    if (this._markers != null) {
                        this._markers.remove();
                        this._markers = null;
                        this._globeClickhandler.destroy();
                    }
                    this._editMode = false;
                }
            }

            ellipse.setHighlighted = setHighlighted;

            enhanceWithListeners(ellipse);

            ellipse.setEditMode(false);
        }

        _.CirclePrimitive.prototype.getCircleCartesianCoordinates = function(granularity) {
            var geometry = Cesium.CircleOutlineGeometry.createGeometry(new Cesium.CircleOutlineGeometry({
                ellipsoid: Cesium.Ellipsoid.WGS84,
                center: this.getCenter(),
                radius: this.getRadius(),
                granularity: granularity
            }));
            var count = 0,
                value, values = [];
            for (; count < geometry.attributes.position.values.length; count += 3) {
                value = geometry.attributes.position.values;
                values.push(new Cesium.Cartesian3(value[count], value[count + 1], value[count + 2]));
            }
            return values;
        };

        _.CirclePrimitive.prototype.setEditable = function() {

            if (this.setEditMode) {
                return;
            }

            var circle = this;
            var scene = drawHelper._scene;

            circle.asynchronous = false;

            drawHelper.registerEditableShape(circle);

            circle.setEditMode = function(editMode) {
                // if no change
                if (this._editMode == editMode) {
                    return;
                }
                drawHelper.disableAllHighlights();
                // display markers
                if (editMode) {
                    // make sure all other shapes are not in edit mode before starting the editing of this shape
                    drawHelper.setEdited(this);
                    var _self = this;
                    // create the markers and handlers for the editing
                    if (this._markers == null) {
                        var markers = new _.BillboardGroup(drawHelper, dragBillboard);

                        function getMarkerPositions() {
                            return _self.getCircleCartesianCoordinates(Cesium.Math.PI_OVER_TWO);
                        }

                        function onEdited() {
                            circle.executeListeners({
                                name: 'onEdited',
                                center: circle.getCenter(),
                                radius: circle.getRadius()
                            });
                        }
                        var handleMarkerChanges = {
                            dragHandlers: {
                                onDrag: function(index, position) {
                                    circle.setRadius(Cesium.Cartesian3.distance(circle.getCenter(), position));
                                    markers.updateBillboardsPositions(getMarkerPositions());
                                },
                                onDragEnd: function(index, position) {
                                    onEdited();
                                }
                            },
                            tooltip: function() {
                                return "Drag to change the radius";
                            }
                        };
                        markers.addBillboards(getMarkerPositions(), handleMarkerChanges);
                        this._markers = markers;
                        // add a handler for clicking in the globe
                        this._globeClickhandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
                        this._globeClickhandler.setInputAction(
                            function(movement) {
                                var pickedObject = scene.pick(movement.position);
                                if (!(pickedObject && pickedObject.primitive)) {
                                    _self.setEditMode(false);
                                }
                            }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

                        // set on top of the polygon
                        markers.setOnTop();
                    }
                    this._editMode = true;
                } else {
                    if (this._markers != null) {
                        this._markers.remove();
                        this._markers = null;
                        this._globeClickhandler.destroy();
                    }
                    this._editMode = false;
                }
            }

            circle.setHighlighted = setHighlighted;

            enhanceWithListeners(circle);

            circle.setEditMode(false);
        }

    }

    function getExtent(mn, mx) {
        var e = new Cesium.Rectangle();

        // Re-order so west < east and south < north
        e.west = Math.min(mn.longitude, mx.longitude);
        e.east = Math.max(mn.longitude, mx.longitude);
        e.south = Math.min(mn.latitude, mx.latitude);
        e.north = Math.max(mn.latitude, mx.latitude);

        // Check for approx equal (shouldn't require abs due to re-order)
        var epsilon = Cesium.Math.EPSILON7;

        if ((e.east - e.west) < epsilon) {
            e.east += epsilon * 2.0;
        }

        if ((e.north - e.south) < epsilon) {
            e.north += epsilon * 2.0;
        }

        return e;
    };

    function createTooltip(frameDiv) {

        var tooltip = function(frameDiv) {

            var div = document.createElement('DIV');
            div.className = "twipsy right";

            var arrow = document.createElement('DIV');
            arrow.className = "twipsy-arrow";
            div.appendChild(arrow);

            var title = document.createElement('DIV');
            title.className = "twipsy-inner";
            div.appendChild(title);

            this._div = div;
            this._title = title;

            // add to frame div and display coordinates
            frameDiv.appendChild(div);
        }

        tooltip.prototype.setVisible = function(visible) {
            this._div.style.display = visible ? 'block' : 'none';
        }

        tooltip.prototype.showAt = function(position, message) {
            if (position && message) {
                this.setVisible(true);
                this._title.innerHTML = message;
                this._div.style.left = position.x + 10 + "px";
                this._div.style.top = (position.y - this._div.clientHeight / 2) + "px";
            }
        }

        return new tooltip(frameDiv);
    }

    function getDisplayLatLngString(cartographic, precision) {
        return Cesium.Math.toDegrees(cartographic.longitude).toFixed(precision || 3) + ", " +
            Cesium.Math.toDegrees(cartographic.latitude).toFixed(precision || 3);
    }

    function clone(from, to) {
        if (from == null || typeof from != "object") return from;
        if (from.constructor != Object && from.constructor != Array) return from;
        if (from.constructor == Date || from.constructor == RegExp || from.constructor == Function ||
            from.constructor == String || from.constructor == Number || from.constructor == Boolean)
            return new from.constructor(from);

        to = to || new from.constructor();

        for (var name in from) {
            to[name] = typeof to[name] == "undefined" ? clone(from[name], null) : to[name];
        }

        return to;
    }

    function fillOptions(options, defaultOptions) {
        options = options || {};
        var option;
        for (option in defaultOptions) {
            if (options[option] === undefined) {
                options[option] = clone(defaultOptions[option]);
            }
        }
    }

    // shallow copy
    function copyOptions(options, defaultOptions) {
        var newOptions = clone(options),
            option;
        for (option in defaultOptions) {
            if (newOptions[option] === undefined) {
                newOptions[option] = clone(defaultOptions[option]);
            }
        }
        return newOptions;
    }

    function setListener(primitive, type, callback) {
        primitive[type] = callback;
    }

    function enhanceWithListeners(element) {
        element._listeners = {};

        element.addListener = function(name, callback) {
            this._listeners[name] = (this._listeners[name] || []);
            this._listeners[name].push(callback);
            return this._listeners[name].length;
        }

        element.executeListeners = function(event, defaultCallback) {
            if (this._listeners[event.name] && this._listeners[event.name].length > 0) {
                var index = 0;
                for (; index < this._listeners[event.name].length; index++) {
                    this._listeners[event.name][index](event);
                }
            } else {
                if (defaultCallback) {
                    defaultCallback(event);
                }
            }
        }
    }




    function convertPosition(options) {
        if (options.constructor.name == 'Array') {
            var p = [];
            for (var i = 0; i < options.length; i++) {
                p.push(convertPosition(options[i]));
            }
            return p;
        } else {
            var l = Cesium.Cartographic.fromCartesian(options);

            var p = NPGIS3D.NPUtil.CoordinateHelper.coordinateFromBasemap(Cesium.Math.toDegrees(l.longitude), Cesium.Math.toDegrees(l.latitude));

            return {
                x: p.lon,
                y: p.lat,
                z: l.height
            };

        }
    }
    _.prototype.measureDistance = function(option) {
        this._drawing = false;
        option = option || {};
        var that = this;


        this.startDrawingPolyline({
            callback: function(positions) {
                positions = positions.positions
                if (positions.length < 2) {
                    return;
                }

                var points = convertPosition(positions);
                var xPoints = [];
                var yPoints = [];
                for (var i = points.length - 1; i >= 0; i--) {
                    xPoints.push(points[i].x);
                    yPoints.push(points[i].y);
                }
                xPoints.sort();
                yPoints.sort();
                var lastPosition = positions[positions.length - 1];
                var length = 0;
                for (var i = points.length - 1; i >= 0; i--) {
                    length += NPGIS3D.NPUtil.distinct(points[i], points[i - 1]);
                    if (i == 1) {
                        break;
                    }
                }
                if (length > 1000) {
                    length = (length / 1000.0).toFixed(2) + "km";
                } else {
                    length = (length).toFixed(2) + "m";
                }
                if (option.callback) {
                    option.callback(length);
                }
                entity = new Cesium.Entity({
                    position: positions[0],
                    polyline: {
                        positions: positions,
                        width: 2,
                        material: Cesium.Color.RED
                    }
                });
                that.map.entities.add(entity);

                var host = NPGIS3D.NPUtil.getHost() + '/lib/Cesium/Assets';

                var horizontalOrigin = points[0].x < lastPosition.x ? 1 : -1
                var verticalOrigin = points[0].y < lastPosition.y ? 1 : -1
                var entity0 = new Cesium.Entity({
                    position: lastPosition, //Cesium.Cartesian3.fromDegrees((xPoints[0] + xPoints[xPoints.length - 1]) / 2.0, yPoints[yPoints.length - 1]),
                    label: {
                        text: '总长' + length,
                        font: '14px 宋体',
                        fillColor: Cesium.Color.RED,
                        outlineColor: Cesium.Color.RED,
                        outlineWidth: 1,
                        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                        show: true,
                        horizontalOrigin: -1,
                        verticalOrigin: verticalOrigin,
                        pixelOffset: {
                            x: 0,
                            y: -12
                        }
                    }
                });
                that.map.entities.add(entity0);
                var id = NPGIS3D.NPUtil.UUID();
                var entity1 = new Cesium.Entity({
                    id: id,
                    position: lastPosition, //Cesium.Cartesian3.fromDegrees((xPoints[0] + xPoints[xPoints.length - 1]) / 2.0, yPoints[yPoints.length - 1]),
                    billboard: {
                        image: host + "/img/close.gif",
                        horizontalOrigin: 1,
                        verticalOrigin: verticalOrigin,
                        pixelOffset: {
                            x: 0,
                            y: -12
                        }
                    }
                });
                that.map.entities.add(entity1);

                var scene = that.map.scene;
                var _billboards = scene.primitives.add(new Cesium.PointPrimitiveCollection());
                for (var i = positions.length - 1; i >= 0; i--) {
                    _billboards.add({
                        color: Cesium.Color.WHITE,
                        outlineColor: Cesium.Color.RED,
                        outlineWidth: 1,
                        pixelSize: 6,
                        position: positions[i]
                    });
                }
                (function(entity, entity0, entity1, id) {
                    var handler = new Cesium.ScreenSpaceEventHandler(that.map.scene.canvas);
                    handler.setInputAction(function(c) {
                        var f = that.map.scene.pick(c.position);
                        if (f && f.id && f.id._id === id) {
                            that.map.entities.remove(entity);
                            that.map.entities.remove(entity0);
                            that.map.entities.remove(entity1);
                            _billboards.removeAll();
                            handler.destroy();
                            scene.primitives.remove(_billboards);
                        }
                    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
                })(entity, entity0, entity1, id);
            }
        });
    };
    _.prototype.measureArea = function(option) {
        this._drawing = false;
        option = option || {};
        var that = this;

        var host = NPGIS3D.NPUtil.getHost() + '/lib/Cesium/Assets';
        this.startDrawingPolygon({
            callback: function(positions) {
                positions = positions.positions;
                var lastPosition = positions[positions.length - 1];
                var points = convertPosition(positions);
                var text = NPGIS3D.NPUtil.getArea(points).toFixed(2);
                if (text > 100000) {
                    text = (text / 1000000.0).toFixed(2) + "平方千米";
                } else {
                    text = text + "平方米";
                }
                var xPoints = [];
                var yPoints = [];
                for (var i = points.length - 1; i >= 0; i--) {
                    xPoints.push(points[i].x);
                    yPoints.push(points[i].y);
                }
                xPoints.sort();
                yPoints.sort();

                var entity0 = new Cesium.Entity({
                    polygon: {
                        hierarchy: positions,
                        outline: true,
                        height: 0,
                        outlineColor: Cesium.Color.RED,
                        outlineWidth: 2.0,
                        width: 10,
                        material: Cesium.Color.fromCssColorString('rgba(248,247,169,0.5)')
                    }
                });

                that.map.entities.add(entity0);
                var id = NPGIS3D.NPUtil.UUID();
                var entity1 = new Cesium.Entity({
                    position: lastPosition, //Cesium.Cartesian3.fromDegrees((xPoints[0] + xPoints[xPoints.length - 1]) / 2.0, yPoints[yPoints.length - 1]),
                    label: {
                        text: text,
                        font: '14px 宋体',
                        fillColor: Cesium.Color.RED,
                        outlineColor: Cesium.Color.RED,
                        horizontalOrigin: -1,
                        verticalOrigin: 1,
                        outlineWidth: 1,
                        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                        show: true,
                        pixelOffset: {
                            x: 0,
                            y: -12
                        }
                    }
                });
                that.map.entities.add(entity1);

                var entity2 = new Cesium.Entity({
                    id: id,
                    position: lastPosition, //Cesium.Cartesian3.fromDegrees((xPoints[0] + xPoints[xPoints.length - 1]) / 2.0, yPoints[yPoints.length - 1]),
                    billboard: {
                        image: host + "/img/close.gif",
                        horizontalOrigin: 1,
                        verticalOrigin: 1,
                        pixelOffset: {
                            x: 0,
                            y: -12
                        }
                    }
                });
                that.map.entities.add(entity2);

                var scene = that.map.scene;
                var _billboards = scene.primitives.add(new Cesium.PointPrimitiveCollection());
                for (var i = positions.length - 1; i >= 0; i--) {
                    _billboards.add({
                        color: Cesium.Color.WHITE,
                        outlineColor: Cesium.Color.RED,
                        outlineWidth: 1,
                        pixelSize: 6,
                        position: positions[i]
                    });
                }
                (function(entity2, entity0, entity1, id) {
                    var handler = new Cesium.ScreenSpaceEventHandler(that.map.scene.canvas);
                    handler.setInputAction(function(c) {
                        var f = that.map.scene.pick(c.position);
                        if (f && f.id && f.id._id === id) {
                            that.map.entities.remove(entity2);
                            that.map.entities.remove(entity0);
                            that.map.entities.remove(entity1);
                            _billboards.removeAll();
                            handler.destroy();
                            scene.primitives.remove(_billboards);
                        }
                    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
                })(entity2, entity0, entity1, id);
            }
        });
    }
    _.prototype.draw = function(mode) {

    }
    return _;
})();
