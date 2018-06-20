$(function() {
	// 新增地图服务界面
	$("#ipConfig").dialog({
		title : "IP selection",
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
					url : "/TServer/arcgis/getAllIP?webUrl="+encodeURI(window.location.origin.split('//')[1]),
					dataType : 'text',
					success : function(result) {
						if ('' === result) {
							$().toastmessage('showErrorToast', 'Get server IP error!');
							return;
						}

						var jsonArray = JSON.parse(result);
						var len = jsonArray.length;

						if (len !== 1) {
							$('#ipSelect').empty();
							var opts = '<option value="">Select</option>';
							for ( var i = 0; i < len; i++) {
								var obj = jsonArray[i];
								var label = obj.value;
								var value = obj.label;
								opts += '<option value="' + value + '">'
										+ label + '</option>';
							}
							$('#ipSelect').append(opts);

							$('#ipConfig').dialog('open');
						} else {
							var ip = jsonArray[0].label;
							confirmExport(ip);
						}

					},
					error : function() {
						$('#ipConfig').append('<option value="">Select</option>');
						$().toastmessage('showErrorToast', 'Get server IP error!');
					}

				});
			});

	function confirmExport(ipParam) {
		var serviceNmae = $('#serviceName').val();
		var ip = ipParam;
		if (!ip) {
			ip = $("#ipSelect  option:selected").val();
		}

		if ('' !== ip) {
			var url = "/TServer/arcgis/config/" + serviceNmae + "/" + ip;

			$('#downloadFrame').attr('src', url);

			$('#ipConfig').dialog('close');
		} else {
			$().toastmessage('showErrorToast', 'Please select IP!');
		}

	}
});