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
		},
		{
			categoryId: "green",
			children: [],
			name: "绿地",
			level: 2,
			desc: "地图里的绿地元素，如公园（北海公园）、校园里的操场等。",
			disableFeatures: "label"
		},
		{
			categoryId: "water",
			children: [],
			name: "水系",
			level: 2,
			desc: "地图里水系的设置样式，水系包括海洋、河流（如长江、黄河）、公园里的水系（如北海公园）等。",
			disableFeatures: "label"
		},
		{
			categoryId: "building",
			children: [],
			name: "建筑物",
			level: 2,
			disableFeatures: "label",
			desc: "地图里的建筑物，如大厦、故宫里的宫殿。该类元素仅在高级别下显示。"
		},
		{
			categoryId: "manmade",
			children: [],
			name: "人造区域",
			level: 2,
			disableFeatures: "label",
			desc: "地图里的人造区域元素，如小区、学校、博物馆等面状物。"
		}
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
			name: "高速",
			level: 2,
			disableFeatures: "label",
			desc: "地图里的高速公路。"
		},
		{
			categoryId: "ringRoad",
			children: [],
			name: "城市环线",
			level: 2,
			disableFeatures: "label",
			desc: "地图里的城市环线。"
		},
		{
			categoryId: "nationalRoad",
			children: [],
			name: "国道",
			level: 2,
			disableFeatures: "label",
			desc: "地图里的国道。"
		},
		{
			categoryId: "provincialRoad",
			children: [],
			name: "省道",
			level: 2,
			disableFeatures: "label",
			desc: "地图里的省道。"
		},
		{
			categoryId: "localRoad",
			children: [],
			name: "普通道路",
			level: 2,
			disableFeatures: "label",
			desc: "地图里的一般道路，如二级、三级、四级道路。"
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
			categoryId: "other",
			children: [],
			name: "其它路线",
			level: 2,
			disableFeatures: "label",
			desc: "地图里的地下通道和天桥。"
		},
		{
			categoryId: "guideboard",
			children: [],
			name: "道路路牌",
			level: 2,
			disableFeatures: "all,geometry,label",
			desc: "地图里高速路路等路牌。"
		},
		{
			categoryId: "roadLabel",
			children: [],
			name: "道路标注",
			level: 2,
			disableFeatures: "geometry",
			desc: "地图里道路标注。"
		}
		],
		name: "<span class='glyphicon glyphicon-road'></span>道路",
		desc: "地图的全部道路，包括公路，铁路和地铁等。",
		level: 1
	}
	,
	{
		categoryId: "poi",
		children: [{"categoryId":"hotel_0","children":[],"name":"住宿","level":2,"disableFeatures":"geometry","desc":"地图里的住宿名称，可设置该名称是否显示。"},{"categoryId":"restaurant_1","children":[],"name":"餐饮","level":2,"disableFeatures":"geometry","desc":"地图里的餐饮名称，可设置该名称是否显示。"},{"categoryId":"shop_2","children":[],"name":"购物","level":2,"disableFeatures":"geometry","desc":"地图里的购物名称，可设置该名称是否显示。"},{"categoryId":"scenicSpot_3","children":[],"name":"风景名胜","level":2,"disableFeatures":"geometry","desc":"地图里的风景名胜名称，可设置该名称是否显示。"},{"categoryId":"traffic_4","children":[],"name":"交通设施","level":2,"disableFeatures":"geometry","desc":"地图里的交通设施名称，可设置该名称是否显示。"},{"categoryId":"bank_5","children":[],"name":"金融保险","level":2,"disableFeatures":"geometry","desc":"地图里的金融保险名称，可设置该名称是否显示。"},{"categoryId":"edu_6","children":[],"name":"科教文化","level":2,"disableFeatures":"geometry","desc":"地图里的科教文化名称，可设置该名称是否显示。"},{"categoryId":"live_7","children":[],"name":"生活服务","level":2,"disableFeatures":"geometry","desc":"地图里的生活服务名称，可设置该名称是否显示。"},{"categoryId":"hospital_8","children":[],"name":"医疗保健","level":2,"disableFeatures":"geometry","desc":"地图里的医疗保健名称，可设置该名称是否显示。"},{"categoryId":"pe_9","children":[],"name":"休闲体育","level":2,"disableFeatures":"geometry","desc":"地图里的休闲体育名称，可设置该名称是否显示。"},{"categoryId":"public_10","children":[],"name":"公共设施","level":2,"disableFeatures":"geometry","desc":"地图里的公共设施名称，可设置该名称是否显示。"},{"categoryId":"buidling_11","children":[],"name":"商务住宅","level":2,"disableFeatures":"geometry","desc":"地图里的商务住宅名称，可设置该名称是否显示。"},{"categoryId":"gov_12","children":[],"name":"政府机构及社会团体","level":2,"disableFeatures":"geometry","desc":"地图里的政府机构及社会团体名称，可设置该名称是否显示。"},{"categoryId":"moto_13","children":[],"name":"摩托车服务","level":2,"disableFeatures":"geometry","desc":"地图里的摩托车服务名称，可设置该名称是否显示。"},{"categoryId":"vehicle_14","children":[],"name":"汽车服务","level":2,"disableFeatures":"geometry","desc":"地图里的汽车服务名称，可设置该名称是否显示。"},{"categoryId":"pass_15","children":[],"name":"通行设施","level":2,"disableFeatures":"geometry","desc":"地图里的通行设施名称，可设置该名称是否显示。"},{"categoryId":"subway_16","children":[],"name":"地铁站","level":2,"disableFeatures":"geometry","desc":"地图里的地铁站名称，可设置该名称是否显示。"},{"categoryId":"roadFacilities_17","children":[],"name":"道路附属设施","level":2,"disableFeatures":"geometry","desc":"地图里的道路附属设施名称，可设置该名称是否显示。"},{"categoryId":"address_18","children":[],"name":"地名","level":2,"disableFeatures":"geometry","desc":"地图里的地名名称，可设置该名称是否显示。"},{"categoryId":"other_19","children":[],"name":"其他","level":2,"disableFeatures":"geometry","desc":"地图里的其他名称，可设置该名称是否显示。"}],
		name: "<span class='glyphicon glyphicon-tint'></span>兴趣点",
		level: 1,
		disableFeatures: "geometry",
		desc: "地图里的点状元素，如旅游景点、大厦、小区等。"
	},
	{
		categoryId: "administrative",
		children: [
//		           {
//			categoryId: "administrativeLabel",
//			children: [],
//			name: "行政标注",
//			level: 2,
//			disableFeatures: "geometry",
//			desc: "地图里的行政名称，如省会、城市、区县等的名称，可设置该名称是否显示。"
//		},
{
			categoryId: "city",
			children: [],
			name: "城市",
			level: 2,
			disableFeatures: "geometry",
			desc: "地图里的城市名称，可设置该名称是否显示。"
		},
		{
			categoryId: "district",
			children: [],
			name: "区县",
			level: 2,
			disableFeatures: "geometry",
			desc: "地图里的区县名称，可设置该名称是否显示。"
		},
		{
			categoryId: "town",
			children: [],
			name: "城镇",
			level: 2,
			disableFeatures: "geometry",
			desc: "地图里的城镇名称，可设置该名称是否显示。"
		},
		{
			categoryId: "village",
			children: [],
			name: "乡村",
			level: 2,
			disableFeatures: "geometry",
			desc: "地图里的乡村名称，可设置该名称是否显示。"
		},
		{
			categoryId: "regionLabel",
			children: [],
			name: "区域标注",
			level: 2,
			disableFeatures: "geometry",
			desc: "地图里的普通区域的名称，可设置该名称是否显示。"
		}],
		name: "<span class='glyphicon glyphicon-globe'></span>行政区划",
		desc: "地图里的行政区划，包括边界线和行政标注。",
		level: 1
	}],
	categoryId: "all"
};