
String.prototype.format = function(opts) {
	var source = this.valueOf(),
		data = Array.prototype.slice.call(arguments, 0),
		toString = Object.prototype.toString;
	if (data.length) {
		data = data.length == 1 ?

		(opts !== null && (/\[object Array\]|\[object Object\]/.test(toString.call(opts))) ? opts : data) : data;
		return source.replace(/#\{(.+?)\}/g, function(match, key) {
			var replacer = data[key];
			// chrome 下 typeof /a/ == 'function'
			if ('[object Function]' == toString.call(replacer)) {
				replacer = replacer(key);
			}
			return ('undefined' == typeof replacer ? '' : replacer);
		});
	}
	return source;
};

var currentCustomId = '';

var StyleEditor = {
	dom: {
		styleList: $("#style-rules"),
		itemEditor: $("#selectors"),
		addBtn: $("#addStyle"),
		jsonButton: $("#jsonButton"),
		styleButton: $("#styleButton"),
		visibilityCheckBox: $("#visibilityCheckBox"),
		weightInput: $("#weight"),
		weightSlider: $("#weightSlider"),
		lightnessInput: $("#lightness"),
		lightnessSlider: $("#lightnessSlider"),
		saturationInput: $("#saturation"),
		saturationSlider: $("#saturationSlider"),
		set_color: $("#set_color"),
		set_weight: $("#set_weight"),
		set_visibility: $("#set_visibility"),
		set_lightness: $("#set_lightness"),
		set_saturation: $("#set_saturation"),
		set_hue: $("#set_hue"),
		toggleSelectors: $("#toggleSelectors"),
		set_zoom: $("#set_zoom"),
		zoomSlider: $("#zoomSlider"),
		templateList: $("#templateList")
	},
	tpl: '<div id="rule-item-#{index}" data-id = "#{index}" class="rule-item animated">' +
		'<div class="rule-item-title"><em></em><i style="float:right;" ><span data-id = "#{index}"  class="glyphicon glyphicon-trash del"></span></i>#{featureTypeName} </div>' +
		'<div class="rule-item-bd animated">' +
		'<table width="100%">' +
		'<tr><td>Attributes:<span>#{elementTypeName}</span></td></tr></table>' +
		'<table width="100%">' +
		'<tr><td  width="50%">Color:<span><em style="background:#{color}"></em>#{color}</span></td>' +
		'<td>Display:<span>#{visibility}</span></td>' + 
		'</tr>'+
		/*'<td>亮度:  <span>#{lightness}</span></td></tr>' +
		'<tr><td>宽度:<span>#{weight}</span></td>' +
		'<td>色相:<span><em style="background:#{hue}"></em>#{hue}</span></td></tr>' +
		'<tr><td>显示:<span>#{visibility}</span></td>' +
		'<td>饱和度:<span>#{saturation}</span></td></tr>' +*/
		'</table>' +
		'</div></div>',
	templateListTpl: '<div class="col-sm-3 col-md-3 template-item">\
      <div class="thumbnail template-edit" data-id="#{name}">\
        <img src="/netposa/resources/styleMap/image/#{name}.png"/>\
        <div class="caption">\
         #{title}(#{name})\
        </div>\
      </div>\
  	</div>',

	index: 1,
	data: [],
	currentIndex: -1,
	init: function() {
		var me = this;
		this.bind();
		var mapstyleStr = localStorage.getItem('mapstyle');
		if (mapstyleStr && mapstyleStr.length > 3) {
			this.setMapJson(JSON.parse(localStorage.getItem('mapstyle')));
		} else {
			this.add();
		}

		this.dom.templateList.on('click', $.proxy(this.showTemplateList, this));
	},
	showTemplateList: function(e) {
		$("#myModal").modal();
		if ($("#maplist-container").attr("loaded") == "true") {
			return;
		}
		for (var key in mapstyles) {
			mapstyles[key].name = key;
			$("#maplist-container").attr("loaded", true).append(this.templateListTpl.format(mapstyles[key]));
		}
	},


	bind: function() {
		var me = this;

		this.dom.toggleSelectors.on('click', function() {
			$("#selectors-bd").toggle();
			me.dom.toggleSelectors.find(".glyphicon").toggleClass("glyphicon-chevron-down");
		});

		this.dom.styleList.on("click", ".del", function(e) {
			var index = $(e.currentTarget).attr('data-id');
			if (index) {
				me.remove(index);
			}
			e.stopPropagation();
		});
		this.dom.styleList.on("click", ".rule-item", function(e) {
			me.currentIndex = $(e.currentTarget).attr('data-id');
			me.active();
		});
		this.dom.addBtn.on("click", function() {
			me.add();
		});
		this.dom.jsonButton.on("click", function() {
			me.showJSON();
		});
		this.dom.itemEditor.on("change", "input[type='radio']", function() {
			var val = '';
			$(".elementType-bd input[type='radio']").each(function(i, item) {
				if (item.checked) {
					val = item.value;
				}
			});
			me.setData({
				elementType: val
			});
		});

		this.dom.styleButton.on("click", function() {
			me.preview();
		});

		this.dom.visibilityCheckBox.on("change", function() {
			me.setData({
				"visibility": me.dom.visibilityCheckBox[0].checked ? 'on' : "off"
			});
		});
		this.dom.weightSlider.on("change", function() {
			me.setData({
				"weight": me.dom.weightSlider.val()
			});
			me.dom.weightInput.val(me.dom.weightSlider.val());
		});
		this.dom.weightInput.on("change", function() {
			me.setData({
				"weight": me.dom.weightSlider.val()
			});
			me.dom.weightSlider.val(me.dom.weightInput.val());
		});

		this.dom.saturationSlider.on("change", function() {
			me.setData({
				"saturation": me.dom.saturationSlider.val()
			});
			me.dom.saturationInput.val(me.dom.saturationSlider.val());
		});
		this.dom.saturationInput.on("change", function() {
			me.setData({
				"saturation": me.dom.saturationInput.val()
			});
			me.dom.saturationSlider.val(me.dom.saturationInput.val());
		});

		this.dom.lightnessSlider.on("change", function() {
			me.setData({
				"lightness": me.dom.lightnessSlider.val()
			});
			me.dom.lightnessInput.val(me.dom.lightnessSlider.val());
		});

		this.dom.lightnessInput.on("change", function() {
			me.setData({
				"lightness": me.dom.lightnessInput.val()
			});
			me.dom.lightnessSlider.val(me.dom.lightnessInput.val());
		});
		this.dom.set_color.on("change", function() {
			if (me.dom.set_color[0].checked) {
				$("#color").spectrum("enable");
				var color = $("#color").spectrum("get").toHexString(); // #ff0000
				StyleEditor.setData({
					color: color
				});
			} else {
				$("#color").spectrum("disable");
				me.setData({
					"color": ""
				});
			}
		});

		this.dom.set_hue.on("change", function() {
			if (me.dom.set_hue[0].checked) {
				$("#hue").spectrum("enable");
				var hue = $("#hue").spectrum("get").toHexString(); // #ff0000
				StyleEditor.setData({
					hue: hue
				});
			} else {
				$("#hue").spectrum("disable");
				me.setData({
					"hue": ""
				});
			}
		});

		this.dom.set_weight.on("change", function() {
			if (me.dom.set_weight[0].checked) {
				me.dom.weightInput.attr('disabled', false);
				me.dom.weightSlider.attr('disabled', false);
				me.setData({
					"weight": me.dom.weightSlider.val()
				});
			} else {
				me.dom.weightInput.attr('disabled', true);
				me.dom.weightSlider.attr('disabled', true);
				me.setData({
					"weight": ""
				});
			}
		});

		this.dom.set_lightness.on("change", function() {
			if (me.dom.set_lightness[0].checked) {
				me.dom.lightnessInput.attr('disabled', false);
				me.dom.lightnessSlider.attr('disabled', false);
				me.setData({
					"lightness": me.dom.lightnessSlider.val()
				});
			} else {
				me.dom.lightnessInput.attr('disabled', true);
				me.dom.lightnessSlider.attr('disabled', true);
				me.setData({
					"lightness": ""
				});
			}
		});

		this.dom.set_saturation.on("change", function() {
			if (me.dom.set_saturation[0].checked) {
				me.dom.saturationInput.attr('disabled', false);
				me.dom.saturationSlider.attr('disabled', false);
				me.setData({
					"saturation": me.dom.saturationSlider.val()
				});
			} else {
				me.dom.saturationInput.attr('disabled', true);
				me.dom.saturationSlider.attr('disabled', true);
				me.setData({
					"saturation": ""
				});
			}
		});

		this.dom.set_visibility.on("change", function() {
			if (me.dom.set_visibility[0].checked) {
				me.dom.visibilityCheckBox.attr('disabled', false);
				me.setData({
					"visibility": (me.dom.visibilityCheckBox[0].checked ? 'on' : 'off')
				});
			} else {
				me.dom.visibilityCheckBox.attr('disabled', true);
				me.setData({
					"visibility": ""
				});
			}
		});

		$(".rulename").on('click', function(e) {
			if ($(e.target).is('input')) {
				return;
			}
			var switchCheckBox = $(this).find("[id^=set_]");
			switchCheckBox[0].checked = switchCheckBox[0].checked ? false : true;
			switchCheckBox.trigger("change");
		});


		$("#myModal").on('click', ".template-edit", $.proxy(this.loadTemplate, this));

	},
	setData: function(obj) {
		if (this.currentIndex == -1) {
			this.add(obj);
			return;
		}
		var me = this;
		var currentData = $.grep(this.data, function(item) {
			return item.index == me.currentIndex;
		})[0];
		$.extend(currentData, obj);
		this.render();
	},
	itemTemplate: function(data) {
		return this.tpl.format(data);
	},
	render: function() {

		var elementTypeConfig = {
			"all": "all",
			"geometry": "geometry",
			"geometry.fill": "geometry fill",
			"geometry.stroke": "geometry stroke",
			"labels": "text ",
			"labels.text.fill": "text fill",
			"labels.text.stroke": "text stroke",
			"lables.text": "text",
			"labels.icon": "icon"
		};
		var html = '';
		var me = this;
		$.each(this.data, function(i, item) {
			item.elementTypeName = elementTypeConfig[item['elementType']];
			html = me.itemTemplate(item) + html;
		});
		this.dom.styleList.html(html);
		this.preview();

		//如果面版是关闭的,就打开
		$("#selectors-bd").show();
		me.dom.toggleSelectors.find(".glyphicon").addClass("glyphicon-chevron-down");

		this.active();
	},
	add: function(obj) {
		var data = {
			index: this.index++,
			featureType: "",
			elementType: "all",
			color: "",
			visibility: "",
			featureTypeName: 'Style rule (please select element)',
			lightness: '',
			hue: "",
			saturation: "",
			zoom: ""
		};
		if (obj) {
			data = $.extend(data, obj);
		}
		this.data.push(data);
		this.currentIndex = data.index;
		this.render();
	},
	remove: function(index) {
		for (var i = 0; i < this.data.length; i++) {
			var item = this.data[i];
			if (this.data[i].index == index) {
				this.data.splice(i, 1);
				break;
			}
		};

		if (this.data.length > 0) {
			if (this.currentIndex == index) {
				this.currentIndex = this.data[this.data.length - 1].index;
			}
			this.render();
		} else {
			this.add();
		}
	},
	active: function() {
		var me = this;

		this.dom.styleList.find(".rule-item").removeClass('selected');;
		$('#rule-item-' + this.currentIndex).addClass('selected');

		var currentData = $.grep(this.data, function(item) {
			return item.index == me.currentIndex;
		})[0];
		if (!currentData) return;

		if (currentData.color) {
			this.dom.set_color[0].checked = true;
			$("#color").spectrum("set", currentData.color);
			$("#color").spectrum("enable");
		} else {
			$("#color").spectrum("disable");
			this.dom.set_color[0].checked = false;
		}

		if (currentData.hue) {
			this.dom.set_hue[0].checked = true;
			$("#hue").spectrum("set", currentData.hue);
			$("#hue").spectrum("enable");
		} else {
			$("#hue").spectrum("disable");
			this.dom.set_hue[0].checked = false;
		}
		var node = zTree.getNodesByParam("categoryId", currentData.featureType);
		if (node.length == 0) { //取消选中的状态
			zTree.cancelSelectedNode(zTree.getSelectedNodes()[0]);
		}

		zTree.selectNode(node[0]);

		$("#elementType input").attr("disabled", false);
		$(".element-type-item").removeClass("disabled");
		if (node.length > 0) {
			//设置属性的置灰状态
			var disableFeatures = node[0].disableFeatures;
			if (disableFeatures) {
				var arr = disableFeatures.split(",");
				for(var i = 0, ci = arr.length; i < ci; i++) {
					$("#" + arr[i] + "-bd").addClass("disabled").find("input[id^='" + disableFeatures + "']").attr("disabled", true);
				}
			}
		}
		if (currentData.visibility) {
			this.dom.set_visibility[0].checked = true;
			this.dom.visibilityCheckBox.attr('disabled', false);
			this.dom.visibilityCheckBox[0].checked = (currentData.visibility == 'on' ? true : false);

		} else {
			this.dom.set_visibility[0].checked = false;
			this.dom.visibilityCheckBox.attr('disabled', true);
		}
		if (currentData.lightness) {
			this.dom.set_lightness[0].checked = true;
			this.dom.lightnessInput.val(currentData.lightness);
			this.dom.lightnessSlider.val(currentData.lightness);
			me.dom.lightnessInput.attr('disabled', false);
			me.dom.lightnessSlider.attr('disabled', false);
		} else {
			this.dom.set_lightness[0].checked = false;
			this.dom.lightnessInput.attr('disabled', true);
			this.dom.lightnessSlider.attr('disabled', true);
		}

		if (currentData.saturation) {
			this.dom.set_saturation[0].checked = true;
			this.dom.saturationInput.val(currentData.saturation);
			this.dom.saturationSlider.val(currentData.saturation);
			me.dom.saturationInput.attr('disabled', false);
			me.dom.saturationSlider.attr('disabled', false);
		} else {
			this.dom.set_saturation[0].checked = false;
			this.dom.saturationInput.attr('disabled', true);
			this.dom.saturationSlider.attr('disabled', true);
		}

		if (currentData.weight) {
			this.dom.set_weight[0].checked = true;
			this.dom.weightInput.val(currentData.weight);
			this.dom.weightSlider.val(currentData.weight);
			this.dom.weightInput.attr('disabled', false);
			this.dom.weightSlider.attr('disabled', false);
		} else {
			this.dom.set_weight[0].checked = false;
			this.dom.weightInput.attr('disabled', true);
			this.dom.weightSlider.attr('disabled', true);
		}

		$(".elementType-bd input[type='radio']").each(function(i, item) {
			if (item.value == currentData.elementType) {
				item.checked = true;
			}
		});
	},
	getJson: function() {
		var json = [];
		for (var i = 0, item; item = this.data[i]; i++) {
			if (item.featureType == '')
				continue;
			var stylers = {};
			if (item.color) {
				stylers.color = item.color;
			}
			if (item.hue) {
				stylers.hue = item.hue;
			}
			if (item.weight) {
				stylers.weight = item.weight;
			}

			if (item.lightness) {
				stylers.lightness = parseInt(item.lightness);
			}
			if (item.saturation) {
				stylers.saturation = parseInt(item.saturation);
			}
			if (item.visibility) {
				stylers.visibility = item.visibility;
			}
			json.push({
				"featureType": '' + item.featureType,
				"elementType": item.elementType,
				"stylers": stylers
			});
		}
		return json;
	},
	// 生成server端所需求的字符串
	getStyles: function() {
		var keys = {
			featureType: "t",
			elementType: "e",
			visibility: "v",
			color: "c",
			lightness: "l",
			saturation: "s",
			weight: "w",
			zoom: "z",
			hue: "h"
		};
		var elementTypeConfig = {
			"all": "all",
			"geometry": "g",
			"geometry.fill": "g.f",
			"geometry.stroke": "g.s",
			"labels": "l",
			"labels.text.fill": "l.t.f",
			"labels.text.stroke": "l.t.s",
			"lables.text": "l.t",
			"labels.icon": "l.i"
		};
		var result = [];
		for (var i = 0, item; item = this.data[i]; i++) {
			if (item['featureType'] == '') {
				continue;
			}
			var resultItem = [];
			for (var key in keys) {
				if (item[key]) {
					if (key == 'elementType') {
						resultItem.push(keys[key] + ":" + elementTypeConfig[item[key]]);
					} else {
						resultItem.push(keys[key] + ":" + item[key]);
					}
				}
			}
			if (resultItem.length > 2) { //如果小于两个元素, 则表示没有
				result.push(resultItem.join("|"));
			}
		}
		return result.join(',');
	},
	showJSON: function() {
		$("#json").modal('show');
		$("#jsonTextarea").val(JSON.stringify(this.getJson(), null, 100));
	},
	preview: function() {
		
		var me = this;
		var currentStyleStr = this.getStyles();
		if (this._lastStyleStr == currentStyleStr) {
			return;
		}
		
		this._lastStyleStr = currentStyleStr;
		//添加一个延迟操作.
		this._previewTimer && clearTimeout(this._previewTimer);
		this._previewTimer = setTimeout(function() {
			var style = me.getStyles();
			localStorage.setItem('mapstyle', JSON.stringify(me.getJson()));
			map.setMapStyle({
				styleJson: me.getJson()
			},false);
		}, 500);
	},
	/**
	 * @param JSON 配置
	 */
	setMapJson: function(json) {
		if (!json) {
			var str = $("#jsonTextarea").val();
			json = JSON.parse(str);
		}
		this.data = [];
		this.index = 1;
		var zTree = $.fn.zTree.getZTreeObj("catalogTree");
		// this.currentIndex = -1;
		for (var i = 0, item; item = json[i]; i++) {

			var nodes = zTree.getNodesByParam("categoryId", item.featureType);
			if (nodes.length > 0) {
				var catalogName = nodes[0].name;
				var parentNode = nodes[0].getParentNode();
				while (parentNode) {
					catalogName = parentNode.name + ' > ' + catalogName;
					parentNode = parentNode.getParentNode();
				}
			} else {
				var catalogName = item.featureType;
			}
			this.data.push({
				selected: '',
				index: this.index++,
				featureType: item.featureType,
				featureTypeName: catalogName,
				elementType: item.elementType,
				color: item.stylers.color,
				weight: item.stylers.weight,
				lightness: item.stylers.lightness,
				visibility: item.stylers.visibility,
				hue: item.stylers.hue,
				saturation: item.stylers.saturation,
				zoom: item.stylers.zoom
			});

		}
		$("#json").hide();
		this.currentIndex = this.index - 1;
		if (this.data.length > 0) {
			this.render();
		} else {
			this.add();
		}
	},

	loadTemplate: function(e) {
		var styleName = $(e.currentTarget).attr("data-id");
		if (this.data.length >= 1 && this.data[0].featureType != '') {
			if (!confirm("Are you sure you want to import it?")) {
				return;
			}
		}
		// if (confirm("导入配置将覆盖现有编辑状态的配置,你确定要导入吗?")) {
		var me = this;
		$.get("/netposa/resources/styleMap/styles/" + myMapType +"/"+ styleName + ".json", function(responseText) {
			$('#myModal').modal('hide');
			var styleJson = responseText;
			if (!$.isArray(responseText)) {
				styleJson = JSON.parse(responseText);
			}
			me.setMapJson(styleJson);
		});
		// }
	}
};

var zTree;
initCatalogTree();

StyleEditor.init();

function initCatalogTree() {
	var setting = {
		view: {
			showIcon: false,
			nameIsHTML: true,
			showTitle: false
		},
		data: {
			key: {
				// title: 'title'
			}
		},
		callback: {
			beforeExpand: beforeExpand,
			onExpand: onExpand,
			onClick: onClick
		}
	};


	var curExpandNode = null;

	function beforeExpand(treeId, treeNode) {
		var pNode = curExpandNode ? curExpandNode.getParentNode() : null;
		var treeNodeP = treeNode.parentTId ? treeNode.getParentNode() : null;
		var zTree = $.fn.zTree.getZTreeObj("catalogTree");
		for (var i = 0, l = !treeNodeP ? 0 : treeNodeP.children.length; i < l; i++) {
			if (treeNode !== treeNodeP.children[i]) {
				zTree.expandNode(treeNodeP.children[i], false);
			}
		}
		while (pNode) {
			if (pNode === treeNode) {
				break;
			}
			pNode = pNode.getParentNode();
		}
		if (!pNode) {
			singlePath(treeNode);
		}

	}

	function singlePath(newNode) {
		if (newNode === curExpandNode) return;
		if (curExpandNode && curExpandNode.open == true) {
			var zTree = $.fn.zTree.getZTreeObj("catalogTree");
			if (newNode.parentTId === curExpandNode.parentTId) {
				zTree.expandNode(curExpandNode, false);
			} else {
				var newParents = [];
				while (newNode) {
					newNode = newNode.getParentNode();
					if (newNode === curExpandNode) {
						newParents = null;
						break;
					} else if (newNode) {
						newParents.push(newNode);
					}
				}
				if (newParents != null) {
					var oldNode = curExpandNode;
					var oldParents = [];
					while (oldNode) {
						oldNode = oldNode.getParentNode();
						if (oldNode) {
							oldParents.push(oldNode);
						}
					}
					if (newParents.length > 0) {
						zTree.expandNode(oldParents[Math.abs(oldParents.length - newParents.length) - 1], false);
					} else {
						zTree.expandNode(oldParents[oldParents.length - 1], false);
					}
				}
			}
		}
		curExpandNode = newNode;
	}

	function onExpand(event, treeId, treeNode) {
		curExpandNode = treeNode;
	}

	function onClick(e, treeId, treeNode) {
		var catelogId = treeNode.categoryId;
		
		if('road' === catelogId || 'administrative' === catelogId || 'background' === catelogId) {
			$("#elementType").css('visibility','hidden');
			$("#elementStyle").css('visibility','hidden');
			return;
		} else {
			$("#elementType").css('visibility','visible');
			$("#elementStyle").css('visibility','visible');
		}
		
		changeUI(catelogId);
		
		var catalogName = treeNode.name;
		var parentNode = treeNode.getParentNode();
		while (parentNode) {
			catalogName = parentNode.name + ' > ' + catalogName;
			parentNode = parentNode.getParentNode();
		}
		var zTree = $.fn.zTree.getZTreeObj("catalogTree");
		zTree.expandNode(treeNode, true, null, null, true);
		StyleEditor.setData({
			"featureType": catelogId,
			"featureTypeName": catalogName
		});
	}
	
	function changeUI(catelogId) {
		if ('highway' === catelogId || 'local' === catelogId
				|| 'railway' === catelogId || 'subway' === catelogId
				|| 'ringRoad' === catelogId || 'nationalRoad' === catelogId
				|| 'provincialRoad' === catelogId || 'localRoad' === catelogId
				|| 'other' === catelogId || 'roadLabel' === catelogId || 'land' === catelogId) {
			
			if('roadLabel' !== catelogId) {
				$('#visibilityDiv').hide();
			}
		} else {
			$('#visibilityDiv').show();
		}
		
		if('guideboard' === catelogId) {
			$('#elementStyleColor').hide();
		} else {
			$('#elementStyleColor').show();
		}
	}

	categoryData.name = "All";



	zTree = $.fn.zTree.init($("#catalogTree"), setting, categoryData);
	var $desc = $("#catalogTree-info-desc");
	var $catImage = $("#catalogTree-info-img");
	var $catalogTreeInfo = $("#catalogTree-info");
	var _showDefaultTimer = null;
	$("#catalogTree").on('mouseover', 'a', function(e) {
		_showDefaultTimer && clearTimeout(_showDefaultTimer);
		$catalogTreeInfo.show();
		var currentTarget = e.currentTarget;
		var tid = currentTarget.id.substring(0, currentTarget.id.length - 2);
		var node = zTree.getNodeByTId(tid);
		$desc.html(node.desc); 
		$catImage.attr("src", "/netposa/resources/styleMap/image/featureType/" + node.categoryId + ".gif");
	}).on('mouseout', 'a', function(e) {
		_showDefaultTimer && clearTimeout(_showDefaultTimer);
		_showDefaultTimer = setTimeout(function() {
			$catalogTreeInfo.hide();
		}, 500);
	});
}


//-->


var spectrumOptions = {
	color: "#000",
	flat: false,
	showInput: true,
	className: "full-spectrum",
	showInitial: true,
	showPalette: true,
	showSelectionPalette: true,
	showButtons: false,
	maxPaletteSize: 10,
	preferredFormat: "hex",
	localStorageKey: "spectrum.example",
	chooseText: "Select",
	cancelText: "Cancel",
	disabled: true,
	move: function(color) {

	},
	show: function() {

	},
	beforeShow: function() {

	},
	hide: function(color) {},
	change: function(color) {
		var color = color.toHexString(); // #ff0000
		StyleEditor.setData({
			color: color
		});
	},
	palette: [
		["#000", "#444", "#666", "#999", "#ccc", "#eee", "#f3f3f3", "#fff"],
		["#f00", "#f90", "#ff0", "#0f0", "#0ff", "#00f", "#90f", "#f0f"],
		["#f4cccc", "#fce5cd", "#fff2cc", "#d9ead3", "#d0e0e3", "#cfe2f3", "#d9d2e9", "#ead1dc"],
		["#ea9999", "#f9cb9c", "#ffe599", "#b6d7a8", "#a2c4c9", "#9fc5e8", "#b4a7d6", "#d5a6bd"],
		["#e06666", "#f6b26b", "#ffd966", "#93c47d", "#76a5af", "#6fa8dc", "#8e7cc3", "#c27ba0"],
		["#c00", "#e69138", "#f1c232", "#6aa84f", "#45818e", "#3d85c6", "#674ea7", "#a64d79"],
		["#900", "#b45f06", "#bf9000", "#38761d", "#134f5c", "#0b5394", "#351c75", "#741b47"],
		["#600", "#783f04", "#7f6000", "#274e13", "#0c343d", "#073763", "#20124d", "#4c1130"]
	]
};

$("#color").spectrum(spectrumOptions);
spectrumOptions.change = function(color) {
	var hue = color.toHexString(); // #ff0000
	StyleEditor.setData({
		hue: hue
	});
};
$("#hue").spectrum(spectrumOptions);