window.categoryData = {
	name: "All (all elements)",
	open: !0,
	desc: "Refers to all elements contained in the map, such as water, green, roads, etc.",
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
		},{
			categoryId: "green",
			children: [],
			disableFeatures: "label",
			name: "Buildings and green spaces",
			level: 2,
			desc: "This element refers to the building and green background in the map."
		},
		{
			categoryId: "water",
			children: [],
			name: "Water",
			level: 2,
			desc: "The pattern of the water system in the map, including the ocean, rivers (such as the Yangtze River, the Yellow River), the park's water system (such as Beihai Park) and so on.",
			disableFeatures: "label"
		},
		],
		name: "<span class='glyphicon glyphicon-cloud'></span>Map background",
		level: 1,
		desc: "Map background settings. The map background includes: Land area, water system, green space, man-made area and buildings."
	},
	{
		categoryId: "road",
		disableFeatures: "label",
		children: [{
			categoryId: "highway",
			children: [],
			name: "High speed and National highway",
			level: 2,
			disableFeatures: "label",
			desc: "The map of the highway and National road, National highway including state-level road and level two national road."
		},
		{
			categoryId: "localRoad",
			children: [],
			name: "Common Road",
			level: 2,
			disableFeatures: "label",
			desc: "The general path in the map, such as the sidewalk, is only displayed when the map level is greater than 15."
		},
		{
			categoryId: "railway",
			children: [],
			name: "Railway",
			level: 2,
			disableFeatures: "label",
			desc: "The train lines in the map."
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
			categoryId: "roadLabel",
			children: [],
			name: "Road Label",
			level: 2,
			disableFeatures: "geometry",
			desc: "Road label on the map."
		}],
		name: "<span class='glyphicon glyphicon-road'></span>Road",
		desc: "Map of all roads, including highways, railways and subways.",
		level: 1
	}
	,
	{
		categoryId: "poi",
		children: [],
		name: "<span class='glyphicon glyphicon-tint'></span>POI",
		level: 1,
		disableFeatures: "geometry",
		desc: "Dotted elements in the map, such as tourist attractions, buildings, neighborhoods, etc."
	},
	{
		categoryId: "administrative",
		children: [{
			categoryId: "regionLabel",
			children: [],
			name: "Administrative Label",
			level: 2,
			disableFeatures: "geometry",
			desc: "The name of the administrative name in the map, such as the provincial capitals, cities, counties, etc., can be set to display the name."
		}],
		name: "<span class='glyphicon glyphicon-globe'></span>Administrative",
		desc: "The administrative divisions in the map, including boundary lines and administrative annotations.",
		level: 1
	}],
	categoryId: "all"
};