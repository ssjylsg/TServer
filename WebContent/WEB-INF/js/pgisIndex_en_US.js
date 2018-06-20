$(function() {
	$("#isDebug").click(function() {
		NPMapLib.IsDebug = $("#isDebug").prop("checked");
	});
	$("#mapConfig").click(function() {
		mapConfig();
	});
	$("#loadMap").click(function() {
		loadMap();
	});
});
function getCenter() {
	if (window.map) {
		$("#maxCenter").val(window.map.getCenter().toString());
	}
}
function mapConfig() {
	var url = "/TServer/pgis/config?minZoom=" + $("#minZoom").val()
			+ "&maxZoom=" + $("#maxZoom").val() + "&centerPoint="
			+ $("#maxCenter").val() + "&mapUrl="
			+ encodeURI($("#mapServer").val()) + "&version="
			+ ($("#version").val() || "0.3") + "&restrictedExtent="
			+ $("#restrictedExtent").val();
	window.open(url);
}
function loadMap() {
	if ($("#maxCenter").val().split(",").length != 2) {
		alert("The map center is not correct！");
		return;
	}
	NPMapLib.IsDebug = $("#isDebug").prop("checked");
	var mapConfig = {
		minZoom : parseInt($("#minZoom").val()),
		maxZoom : parseInt($("#maxZoom").val()),
		centerPoint : [ $("#maxCenter").val().split(",") ],
		restrictedExtent : $("#restrictedExtent").val().split(",")
	};
	if (!mapConfig.minZoom || !mapConfig.maxZoom || !mapConfig.centerPoint
			|| !mapConfig.restrictedExtent) {
		alert("Configuration error！");
		return;
	}
	var layerConfig = {
		serviceVersion : $("#version").val() || "0.3"
	};
	var url = $("#mapServer").val();
	if (!url) {
		alert("The map URL must be configured！");
		return;
	}
	if (window.map) {
		window.map.destroyMap();
		window.map = null;
	}

	var mapContainer = document.getElementById("mapId");
	map = new NPMapLib.Map(mapContainer, mapConfig);
	layerSLYX = new NPMapLib.Layers.EzMapTileLayer(url, "Vector image map", layerConfig);
	map.addLayers([ layerSLYX ]);
	map.addControl(new NPMapLib.Controls.NavigationControl());
	map.addControl(new NPMapLib.Controls.ScaleControl());
	map.addControl(new NPMapLib.Controls.OverviewControl());
	window.map = map;
}