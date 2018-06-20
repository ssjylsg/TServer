window.categoryData = {
	name: "全部(全部元素)",
	open: !0,
	desc: "指地图里包含的所有的元素，如水系、绿地、道路等。",
	children: [{
		categoryId: "background",
		disableFeatures: "label",
		children: [{
			categoryId: "land",
			children: [],
			disableFeatures: "label",
			name: "陆地",
			level: 2,
			desc: "该元素指地图里陆地背景。"
		},{
			categoryId: "green",
			children: [],
			disableFeatures: "label",
			name: "建筑物和绿地",
			level: 2,
			desc: "该元素指地图里的建筑物和绿地背景。"
		},
		{
			categoryId: "water",
			children: [],
			name: "水系",
			level: 2,
			desc: "地图里水系的设置样式，水系包括海洋、河流（如长江、黄河）、公园里的水系（如北海公园）等。",
			disableFeatures: "label"
		},
		],
		name: "<span class='glyphicon glyphicon-cloud'></span>地图背景",
		level: 1,
		desc: "地图背景设置。地图背景包括：陆地区域，水系、绿地、人造区域及建筑物。"
	},
	{
		categoryId: "road",
		disableFeatures: "label",
		children: [{
			categoryId: "highway",
			children: [],
			name: "高速及国道",
			level: 2,
			disableFeatures: "label",
			desc: "地图里的高速公路和国道，国道包括国家一级国道和二级国道。"
		},
		{
			categoryId: "localRoad",
			children: [],
			name: "普通道路",
			level: 2,
			disableFeatures: "label",
			desc: "地图里的一般道路，如人行道等，该元素仅在地图级别大于15的时候才显示。"
		},
		{
			categoryId: "railway",
			children: [],
			name: "铁路",
			level: 2,
			disableFeatures: "label",
			desc: "地图里的火车线路。"
		},
		{
			categoryId: "subway",
			children: [],
			name: "地铁",
			level: 2,
			disableFeatures: "label",
			desc: "地图里的地铁线路。"
		},
		{
			categoryId: "roadLabel",
			children: [],
			name: "标注",
			level: 2,
			disableFeatures: "geometry",
			desc: "地图里道路标注。"
		}],
		name: "<span class='glyphicon glyphicon-road'></span>道路",
		desc: "地图的全部道路，包括公路，铁路和地铁等。",
		level: 1
	}
	,
	{
		categoryId: "poi",
		children: [],
		name: "<span class='glyphicon glyphicon-tint'></span>兴趣点",
		level: 1,
		disableFeatures: "geometry",
		desc: "地图里的点状元素，如旅游景点、大厦、小区等。"
	},
	{
		categoryId: "administrative",
		children: [{
			categoryId: "regionLabel",
			children: [],
			name: "行政标注",
			level: 2,
			disableFeatures: "geometry",
			desc: "地图里的行政名称，如省会、城市、区县等的名称，可设置该名称是否显示。"
		}],
		name: "<span class='glyphicon glyphicon-globe'></span>行政区划",
		desc: "地图里的行政区划，包括边界线和行政标注。",
		level: 1
	}],
	categoryId: "all"
};