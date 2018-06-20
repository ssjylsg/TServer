window.categoryData = {
	name: "All (all elements)",
	open: !0,
	desc: "All elements contained in a map, such as water, green, roads, etc.",
	children: [{
		categoryId: "background",
		disableFeatures: "label",
		children: [{
			categoryId: "land",
			children: [],
			disableFeatures: "label",
			name: "Land",
			level: 2,
			desc: "The element refers to the land background in the map."
		},
		{
			categoryId: "green",
			children: [],
			name: "Green",
			level: 2,
			desc: "The green elements in the map, such as the Park (Beihai Park), the playground on campus, etc.",
			disableFeatures: "label"
		},
		{
			categoryId: "water",
			children: [],
			name: "Water",
			level: 2,
			desc: "The pattern of water system in the map, including the ocean, rivers (such as the Yangtze River, the Yellow River), the park's water system (such as Beihai Park) and so on.",
			disableFeatures: "label"
		},
		{
			categoryId: "building",
			children: [],
			name: "Building",
			level: 2,
			disableFeatures: "label",
			desc: "A building in a map, such as a mansion or palace in a palace museum. This class element is displayed only at a high level."
		},
		{
			categoryId: "manmade",
			children: [],
			name: "Manmade",
			level: 2,
			disableFeatures: "label",
			desc: "The artificial area elements of the map, such as community, school, museum, etc."
		}
		],
		name: "<span class='glyphicon glyphicon-cloud'></span>Map background",
		level: 1,
		desc: "Map background settings. The map background includes: Land area, water system, green space, man-made area and building."
	},
	{
		categoryId: "road",
		disableFeatures: "label",
		children: [{
			categoryId: "highway",
			children: [],
			name: "Highway",
			level: 2,
			disableFeatures: "label",
			desc: "The highway in the map."
		},
		{
			categoryId: "ringRoad",
			children: [],
			name: "Ring Road",
			level: 2,
			disableFeatures: "label",
			desc: "The City link on the map."
		},
		{
			categoryId: "nationalRoad",
			children: [],
			name: "National Road",
			level: 2,
			disableFeatures: "label",
			desc: "National Road in the map."
		},
		{
			categoryId: "provincialRoad",
			children: [],
			name: "Provincial Road",
			level: 2,
			disableFeatures: "label",
			desc: "The provincial road in the map."
		},
		{
			categoryId: "localRoad",
			children: [],
			name: "Common Road",
			level: 2,
			disableFeatures: "label",
			desc: "General roads in a map, such as two, three, four."
		},
		{
			categoryId: "railway",
			children: [],
			name: "Railway",
			level: 2,
			disableFeatures: "label",
			desc: "Train lines in the map."
		},
		{
			categoryId: "subway",
			children: [],
			name: "Subway",
			level: 2,
			disableFeatures: "label",
			desc: "Subway lines in the map."
		},
		{
			categoryId: "other",
			children: [],
			name: "Other Road",
			level: 2,
			disableFeatures: "label",
			desc: "The underground passages and flyovers in the map."
		},
		{
			categoryId: "guideboard",
			children: [],
			name: "Guideboard",
			level: 2,
			disableFeatures: "all,geometry,label",
			desc: "Map, highway and other road signs."
		},
		{
			categoryId: "roadLabel",
			children: [],
			name: "Road marking",
			level: 2,
			disableFeatures: "geometry",
			desc: "Road markings on the map."
		}
		],
		name: "<span class='glyphicon glyphicon-road'></span>Road",
		desc: "Map of all roads, including highways, railways and subways, etc.",
		level: 1
	}
	,
	{
		categoryId: "poi",
		children: [{"categoryId":"hotel_0","children":[],"name":"hotel","level":2,"disableFeatures":"geometry","desc":"The name of the  hotelname in the map to set whether the name is displayed."},{"categoryId":"restaurant_1","children":[],"name":"restaurant","level":2,"disableFeatures":"geometry","desc":"The name of the  restaurantname in the map to set whether the name is displayed."},{"categoryId":"shop_2","children":[],"name":"shop","level":2,"disableFeatures":"geometry","desc":"The name of the  shopname in the map to set whether the name is displayed."},{"categoryId":"scenicSpot_3","children":[],"name":"scenicSpot","level":2,"disableFeatures":"geometry","desc":"The name of the  scenicSpotname in the map to set whether the name is displayed."},{"categoryId":"traffic_4","children":[],"name":"traffic","level":2,"disableFeatures":"geometry","desc":"The name of the  trafficname in the map to set whether the name is displayed."},{"categoryId":"bank_5","children":[],"name":"bank","level":2,"disableFeatures":"geometry","desc":"The name of the  bankname in the map to set whether the name is displayed."},{"categoryId":"edu_6","children":[],"name":"edu","level":2,"disableFeatures":"geometry","desc":"The name of the  eduname in the map to set whether the name is displayed."},{"categoryId":"live_7","children":[],"name":"live","level":2,"disableFeatures":"geometry","desc":"The name of the  livename in the map to set whether the name is displayed."},{"categoryId":"hospital_8","children":[],"name":"hospital","level":2,"disableFeatures":"geometry","desc":"The name of the  hospitalname in the map to set whether the name is displayed."},{"categoryId":"pe_9","children":[],"name":"pe","level":2,"disableFeatures":"geometry","desc":"The name of the  pename in the map to set whether the name is displayed."},{"categoryId":"public_10","children":[],"name":"public","level":2,"disableFeatures":"geometry","desc":"The name of the  publicname in the map to set whether the name is displayed."},{"categoryId":"buidling_11","children":[],"name":"buidling","level":2,"disableFeatures":"geometry","desc":"The name of the  buidlingname in the map to set whether the name is displayed."},{"categoryId":"gov_12","children":[],"name":"gov","level":2,"disableFeatures":"geometry","desc":"The name of the  govname in the map to set whether the name is displayed."},{"categoryId":"moto_13","children":[],"name":"moto","level":2,"disableFeatures":"geometry","desc":"The name of the  motoname in the map to set whether the name is displayed."},{"categoryId":"vehicle_14","children":[],"name":"vehicle","level":2,"disableFeatures":"geometry","desc":"The name of the  vehiclename in the map to set whether the name is displayed."},{"categoryId":"pass_15","children":[],"name":"pass","level":2,"disableFeatures":"geometry","desc":"The name of the  passname in the map to set whether the name is displayed."},{"categoryId":"subway_16","children":[],"name":"subway","level":2,"disableFeatures":"geometry","desc":"The name of the  subwayname in the map to set whether the name is displayed."},{"categoryId":"roadFacilities_17","children":[],"name":"roadFacilities","level":2,"disableFeatures":"geometry","desc":"The name of the  roadFacilitiesname in the map to set whether the name is displayed."},{"categoryId":"address_18","children":[],"name":"address","level":2,"disableFeatures":"geometry","desc":"The name of the  addressname in the map to set whether the name is displayed."},{"categoryId":"other_19","children":[],"name":"other","level":2,"disableFeatures":"geometry","desc":"The name of the  othername in the map to set whether the name is displayed."}],
		name: "<span class='glyphicon glyphicon-tint'></span>POI",
		level: 1,
		disableFeatures: "geometry",
		desc: "Dotted elements in the map, such as tourist attractions, buildings, neighborhoods, etc."
	},
	{
		categoryId: "administrative",
		children: [
		
		{
			categoryId: "city",
			children: [],
			name: "city",
			level: 2,
			disableFeatures: "geometry",
			desc: "The name of the city name in the map to set whether the name is displayed."
		},
		{
			categoryId: "district",
			children: [],
			name: "district",
			level: 2,
			disableFeatures: "geometry",
			desc: "The name of the district name in the map to set whether the name is displayed."
		},
		{
			categoryId: "town",
			children: [],
			name: "town",
			level: 2,
			disableFeatures: "geometry",
			desc: "The name of the town name in the map to set whether the name is displayed."
		},
		{
			categoryId: "village",
			children: [],
			name: "village",
			level: 2,
			disableFeatures: "geometry",
			desc: "The name of the village name in the map to set whether the name is displayed."
		},
		{
			categoryId: "regionLabel",
			children: [],
			name: "Area Label",
			level: 2,
			disableFeatures: "geometry",
			desc: "The name of the normal area in the map to set whether the name is displayed."
		}],
		name: "<span class='glyphicon glyphicon-globe'></span>Administrative",
		desc: "The administrative divisions in the map, including boundary lines and administrative annotations.",
		level: 1
	}],
	categoryId: "all"
};