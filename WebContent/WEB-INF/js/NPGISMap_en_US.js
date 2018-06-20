$(function() {
	// 高德矢量显示渲染方式
	if('json' === type && 'gaodeVector' === layerType) {
		$('#renderPanel').show();
	}
	// 新增地图服务界面
	$("#ipConfig").dialog({
		title : "",
		autoOpen : false,
		modal : true,
		width : '370px',
		buttons : {
			"Export" : function() {
				confirmExport();
			},
			"Cancel" : function() {
				$(this).dialog("close");
			}
		}
	});

	$("#expConfig").click(
			function() {
				$.ajax({
					url : "/TServer/NPGIS/getAllIP?webUrl="+encodeURI(window.location.origin.split('//')[1]),
					dataType : 'text',
					success : function(result) {
						if ('' === result) {
							$().toastmessage('showErrorToast', 'Get server IP error!');
							return;
						}

						var jsonArray = JSON.parse(result);
						var len = jsonArray.length;

						if (len !== 1) {
							$('#singleIp').val('null');// 多ip情况设置隐藏域值为 null字符串
							createIpOption(jsonArray,len);
							$('#ipConfig').dialog('open');
						} else {
							var ip = jsonArray[0].label;
							$('#ipPanel').hide();
							$('#singleIp').val(ip);//单ip 情况设置ip到隐藏域
							
							if('json' === type && 'gaodeVector' === layerType) {
								$('#ipConfig').dialog('open');
							} else {
								confirmExport();
							}
						}
					},
					error : function() {
						$('#ipConfig').append('<option value="">Select</option>');
						$().toastmessage('showErrorToast', 'Get server IP error!!');
					}

				});
			});
	

	function createIpOption(jsonArray, len) {
		$('#ipSelect').empty();
		var opts = '<option value="">Select</option>';
		for ( var i = 0; i < len; i++) {
			var obj = jsonArray[i];
			var label = obj.value;
			var value = obj.label;
			opts += '<option value="' + value + '">' + label + '</option>';
		}
		$('#ipSelect').append(opts);
	}

	function confirmExport() {
		var serviceNmae = $('#serviceName').val();
		var ip = $('#singleIp').val();
		
		// 多ip情况
		if (ip === 'null') {
			ip = $("#ipSelect  option:selected").val();
		}

		if('' === ip) {
			$().toastmessage('showErrorToast', 'Please select IP!');
			return;
		}
		
		var url = "/TServer/NPGIS/config/" + serviceNmae + "/" + ip;
		
		if('json' === type && 'gaodeVector' === layerType) {
			var render = $("#renderSelect  option:selected").val();
			if('' === render) {
				$().toastmessage('showErrorToast', 'Please select the Rendering method!');
				return;
			}
			url += '?render='+render;
		}
		
		$('#downloadFrame').attr('src', url);

		$('#ipConfig').dialog('close');
	}
});