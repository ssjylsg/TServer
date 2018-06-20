function removeServiceConfig(that, name,mapType) {
		$.post('/TServer/admin/removeServiceConfig', {
			name: name,
			mapType:mapType
		}, function(result) {
			if (result.isSucess) {
				$(that).parent().parent().remove();
				$().toastmessage('showErrorToast', '删除成功!');
			} else {
				$().toastmessage('showErrorToast', result.error + '!');
			}
		}, 'json');
	}
	
	var dbpdChange = false;
	function dbpdChangeHandler(){
		if(!dbpdChange){
			dbpdChange = true;
		}
	}

	$(function() {

		$(".panel-heading").click(function() {
			$(this).next().toggle();
		});

		// 新增地图服务界面
		$("#mapConfig").dialog({
			title: "新增地图配置",
			autoOpen: false,
			modal: true,
			width: '400px',
			buttons: {
				"新增": function() {
					var mapName = $(this).find('input').eq(0).val(),
						mapTitle = $(this).find('input').eq(1).val(),
						titleUrl = $(this).find('select').eq(1).val();
					if (mapName === '') {
						$().toastmessage('showErrorToast', '请填写名称!');
						return;
					}
					var reg = new RegExp('^[A-Za-z]+$');
					if (!reg.test(mapName)) {
						$().toastmessage('showErrorToast', '名称必须为英文!');
						return;
					}

					if (mapTitle === '') {
						$().toastmessage('showErrorToast', '请填写Title!');
						return;
					}
					if (titleUrl === '') {
						$().toastmessage('showErrorToast', '请选择切片地址!');
						return;
					}
					var data = {
						name: mapName,
						title: mapTitle,
						titleUrl: 'mapTitle/' + titleUrl,
						mapType: $(this).find('select').eq(0).val()
					};
					$.post('/TServer/admin/mapConfigAdd',
						data,
						function(result) {
							if (!result.isSucess) {
								$().toastmessage('showErrorToast', result.error + '!');
								return;
							}
							window.location.reload();
						}, 'json');
				},
				"取消": function() {
					$(this).dialog("close");
				}
			}
		});

		// 查询地图服务名称，mapTitle 文件夹下的地图切片
		$("#btnAddMap").click(function() {
			$('#mapConfig').find('input').eq(0).val('');
			$('#mapConfig').find('input').eq(1).val('');
			$('#mapTitleName').empty();

			$.ajax({
				url: "/TServer/admin/getMapTitles",
				dataType: 'text',
				success: function(result) {
					if ('' === result) {
						$().toastmessage('showErrorToast', '没有地图切片!');
					}
					var opts = '<option value="">请选择</option>';
					if (result.length !== 0) {
						var jsonArray = JSON.parse(result);
						var len = jsonArray.length;
						for (var i = 0; i < len; i++) {
							var obj = jsonArray[i];
							var mapName = obj.mapName;
							opts += '<option value="' + mapName + '">' + mapName + '</option>';
						}

					}
					$("#mapTitleName").append(opts);
				},
				error: function() {
					$('#mapTitleName').append('<option value="">请选择</option>');
				}

			});

			$('#mapConfig').dialog('open');
		});

		// 提交
		//$(".postData input[type='button']").click(
		$("#submitCon").click(
			function() {
				var data = [];
				var password = dbpdChange?encodeBase64($("#dbPassword").val(),3):$("#dbPassword").val();
				var postData = {
					userName: $("#dbUserName").val(),
					host: $("#dbUrl").val(),
					password: password,
					database: $("#dbName").val(),
					port: $("#dbport").val(),
					queryParameters:''
				};
				// 提交前先验证数据库连接
				$.post('/TServer/admin/testDb', postData, function(result) {
					if (result.isSucess) {

						$.each($("#tableConfig tbody tr"), function(index, value) {
							$(value).find("select").each(function() {
			                    var id = $(this).attr('id');
			                    var selectedValue = $("#" + id + "  option:selected").attr('value'); // 选中的值
			                    
			                    data.push({
			                        'key': id,
			                        'value': selectedValue
			                    });
			                });

						});

						$("input[name='queryParmeterData']").val(JSON.stringify(data));
						$("input[name='dbPassword']").val(password);
						$("input[name='type']").val('all');
						$("#config").submit();
					} else {
						$().toastmessage('showErrorToast', "数据库配置错误,请检查配置!");
					}
				}, 'json');

			});

		// 数据库链接测试
		$("#testDb").click(function() {
			var queryParameters = [];
			$.each($("#tableConfig tbody tr"), function(index, value) {
                $(value).find("select").each(function() {
                	var id = $(this).attr('id');
                	
                	queryParameters.push({
                        'key': id,
                        'value': ''
                    });
                });
            });
			
			var password = dbpdChange?encodeBase64($("#dbPassword").val(),3):$("#dbPassword").val();
			var postData = {
				userName: $("#dbUserName").val(),
				host: $("#dbUrl").val(),
				password: password,
				database: $("#dbName").val(),
				port: $("#dbport").val(),
				queryParameters:JSON.stringify(queryParameters)
			};

			$.post('/TServer/admin/testDb', postData, function(result) {
				if (result.isSucess) {

					var data = [];
					$("input[name='queryParmeterData']").val(JSON.stringify(data));
					$("input[name='dbPassword']").val(password);
					$("input[name='type']").val('db');
					$("#config").submit();
				} else {
					$().toastmessage('showErrorToast', "数据库配置错误,请检查配置!");
				}
			}, 'json');
		});

		$("select[name='selectTableName']")
			.change(
		//$("select[name='selectTableName']").bind('change',
				function() {
					var id = $(this).attr('id');
					id = id.split('-')[1];
					var selectValue = $(this).children(
						'option:selected').val(); //这就是selected的值
					var tableName = "路网";
					if (id === 'roadnet') {
						tableName = "路网";
					} else if (id === 'roadcross') {
						tableName = "路口";
					} else if (id === 'poi') {
						tableName = "兴趣点";
					} else if (id === 'road') {
						tableName = "道路";
					} else if (id === 'panoconfig') {
						tableName = "室外全景";
						if(selectValue === '') {
							$("#input-panoconfig2Div").hide();
							$("#input-panoconfigDiv").show();
						} else {
							$("#input-panoconfigDiv").hide();
							$("#input-panoconfig2Div").show();
							panoconfigDataAppend();
						}
						
					} else if (id === 'snpanopoint') {
						tableName = "室内全景点位";
						if(selectValue === '') {
                            $("#input-snpanopoint2Div").hide();
                            $("#input-snpanopointDiv").show();
                        } else {
                            $("#input-snpanopointDiv").hide();
                            $("#input-snpanopoint2Div").show();
                            snpanopointDataAppend();
                        }
					} else if (id === 'snpanoconfig') {
						tableName = "室内全景配置";
						if(selectValue === '') {
                            $("#input-snpanoconfig2Div").hide();
                            $("#input-snpanoconfigDiv").show();
                        } else {
                            $("#input-snpanoconfigDiv").hide();
                            $("#input-snpanoconfig2Div").show();
                            snpanoconfigDataAppend();
                        }
                    }
				
					var msg = "已选择"+tableName + "表(" + selectValue + ")";
					if (selectValue.length === 0) {
						msg = "没有"+tableName + "表";
					} else {
						if (id === 'panoconfig' || id === 'snpanopoint' || id === 'snpanoconfig') {
							msg = "已选择"+tableName + "表(" + selectValue + "),可继续追加数据";
						}

						//$().toastmessage('showErrorToast', "点击页面下方的提交按钮使配置生效!");
					}
					$('#input-' + id + '-msg').html(msg);
				});

		
		// 行政区划
		$('#input-district').fileinput({
			language: 'zh', ////设置语言
			uploadUrl: '/TServer/admin/dataAppend?table=district', //上传的地址
			allowedFileExtensions: ['csv'], //接收的文件后缀
			maxFileSize: 200000,
			showRemove: true, //是否显示删除按钮
			showCaption: true, //是否显示输入框
			showPreview: false, //是否显示预览窗口
			showCancel: true,
			showUpload: true, //是否显示上传按钮
			browseClass: "btn btn-info", //按钮样式	 
			dropZoneEnabled: false, //是否显示拖拽区域
			browseLabel: "追加数据", //选择按钮文字
			removeClass: "btn btn-danger",
			removeLabel: "取消",
			removeIcon: '<i class="glyphicon glyphicon-trash"></i>',
			uploadClass: "btn btn-success",
			uploadLabel: "导入",
			maxFileCount: 1, //表示允许同时上传的最大文件个数
			enctype: 'multipart/form-data',
			validateInitialCount: true,
			uploadIcon: '<i class="glyphicon glyphicon-upload"></i>',
			slugCallback: function(filename) { //选择文件时，过滤文件名中的特殊字符
				return filename.replace('(', '_').replace(']', '_');
			}
		});
		
		$('#input-districtDiv').find('.btn-file').on('click',function() {
			$('#input-district').fileinput('clear');
		});

		$('#input-district').on('filebatchselected', function(event, files) {
			var verify = verifyFile(files[0].name, 'district');
			var importBtn = $('#input-districtDiv').find('.fileinput-upload');
			if(!verify) {
				importBtn.attr('disabled', 'disabled');
				$().toastmessage('showErrorToast', '行政区划导入文件和表不匹配!');
			} else {
				importBtn.removeAttr('disabled');
			}
		});

		$('#input-district').on("filebatchuploadcomplete", function(event, data,
			previewId, index) {
			$('#input-district').fileinput('reset');

			getCopyMsg('input-district');

		});

		$('#input-district').on("filepreupload", function(event, data, previewId,
			index) {
			$('#input-district-msg').html("正在追加数据...");
		});
		
		
		var uploadUrl = '/TServer/admin/dataStorage';

		// 路网
		$('#input-roadnet').fileinput({
			language: 'zh', ////设置语言
			uploadUrl: uploadUrl, //上传的地址
			allowedFileExtensions: ['csv'], //接收的文件后缀
			maxFileSize: 200000,
			showRemove: true, //是否显示删除按钮
			showCaption: true, //是否显示输入框
			showPreview: false, //是否显示预览窗口
			showCancel: true,
			showUpload: true, //是否显示上传按钮
			browseClass: "btn btn-info", //按钮样式	 
			dropZoneEnabled: false, //是否显示拖拽区域
			browseLabel: "选择文件", //选择按钮文字
			removeClass: "btn btn-danger",
			removeLabel: "取消",
			removeIcon: '<i class="glyphicon glyphicon-trash"></i>',
			uploadClass: "btn btn-success",
			uploadLabel: "导入",
			maxFileCount: 1, //表示允许同时上传的最大文件个数
			enctype: 'multipart/form-data',
			validateInitialCount: true,
			uploadIcon: '<i class="glyphicon glyphicon-upload"></i>',
			slugCallback: function(filename) { //选择文件时，过滤文件名中的特殊字符
				roadnetTableName = filename.replace('(', '_').replace(']', '_');

				return roadnetTableName;
			}
		});
		
		$('#input-roadnetDiv').find('.btn-file').on('click',function() {
			$('#input-roadnet').fileinput('clear');
		});

		$('#input-roadnet').on('filebatchselected', function(event, files) {
			var verify = verifyFile(files[0].name, 'roadnet');
			var importBtn = $('#input-roadnetDiv').find('.fileinput-upload');
        	if(!verify) {
        		importBtn.attr('disabled', 'disabled');
        		$().toastmessage('showErrorToast', '路网导入文件和表不匹配!');
        	} else {
        		importBtn.removeAttr('disabled');
        	}
		});

		$('#input-roadnet').on("filebatchuploadcomplete", function(event, data,
			previewId, index) {
			$('#input-roadnet').fileinput('reset');

			getCopyMsg('input-roadnet');

		});

		$('#input-roadnet').on("filepreupload", function(event, data, previewId,
			index) {
			$('#input-roadnet-msg').html("正在导入数据...");
		});

		// 路口
		$('#input-roadcross').fileinput({
			language: 'zh', ////设置语言
			uploadUrl: uploadUrl, //上传的地址
			allowedFileExtensions: ['csv'], //接收的文件后缀
			maxFileSize: 200000,
			showRemove: true, //是否显示删除按钮
			showCaption: true, //是否显示输入框
			showPreview: false, //是否显示预览窗口
			showCancel: true,
			showUpload: true, //是否显示上传按钮
			browseClass: "btn btn-info", //按钮样式	 
			dropZoneEnabled: false, //是否显示拖拽区域
			browseLabel: "选择文件", //选择按钮文字
			removeClass: "btn btn-danger",
			removeLabel: "取消",
			removeIcon: '<i class="glyphicon glyphicon-trash"></i>',
			uploadClass: "btn btn-success",
			uploadLabel: "导入",
			maxFileCount: 1, //表示允许同时上传的最大文件个数
			enctype: 'multipart/form-data',
			validateInitialCount: true,
			uploadIcon: '<i class="glyphicon glyphicon-upload"></i>',
			slugCallback: function(filename) { //选择文件时，过滤文件名中的特殊字符
				roadcrossTableName = filename.replace('(', '_').replace(']', '_');

				return roadcrossTableName;
			}
		});

		$('#input-roadcrossDiv').find('.btn-file').on('click',function() {
			$('#input-roadcross').fileinput('clear');
		});
		
		$('#input-roadcross').on('filebatchselected', function(event, files) {
			var verify = verifyFile(files[0].name, 'roadcross');
			var importBtn = $('#input-roadcrossDiv').find('.fileinput-upload');
			if(!verify) {
        		importBtn.attr('disabled', 'disabled');
        		$().toastmessage('showErrorToast', '路口导入文件和表不匹配!');
        	} else {
        		importBtn.removeAttr('disabled');
        	}
		});

		$('#input-roadcross').on("filebatchuploadcomplete", function(event, data,
			previewId, index) {
			$('#input-roadcross').fileinput('reset');

			getCopyMsg('input-roadcross');

		});

		$('#input-roadcross').on("filepreupload", function(event, data, previewId,
			index) {
			$('#input-roadcross-msg').html("正在导入数据...");
		});

		// 兴趣点
		$('#input-poi').fileinput({
			language: 'zh', ////设置语言
			uploadUrl: uploadUrl, //上传的地址
			allowedFileExtensions: ['csv'], //接收的文件后缀
			maxFileSize: 200000,
			showRemove: true, //是否显示删除按钮
			showCaption: true, //是否显示输入框
			showPreview: false, //是否显示预览窗口
			showCancel: true,
			showUpload: true, //是否显示上传按钮
			browseClass: "btn btn-info", //按钮样式	 
			dropZoneEnabled: false, //是否显示拖拽区域
			browseLabel: "选择文件", //选择按钮文字
			removeClass: "btn btn-danger",
			removeLabel: "取消",
			removeIcon: '<i class="glyphicon glyphicon-trash"></i>',
			uploadClass: "btn btn-success",
			uploadLabel: "导入",
			maxFileCount: 1, //表示允许同时上传的最大文件个数
			enctype: 'multipart/form-data',
			validateInitialCount: true,
			uploadIcon: '<i class="glyphicon glyphicon-upload"></i>',
			slugCallback: function(filename) { //选择文件时，过滤文件名中的特殊字符
				poiTableName = filename.replace('(', '_').replace(']', '_');

				return poiTableName;
			}
		});
		
		$('#input-poiDiv').find('.btn-file').on('click',function() {
			$('#input-poi').fileinput('clear');
		});

		$('#input-poi').on('filebatchselected', function(event, files) {
			var verify = verifyFile(files[0].name, 'poi');
			var importBtn = $('#input-poiDiv').find('.fileinput-upload');
			if(!verify) {
				importBtn.attr('disabled', 'disabled');
				$().toastmessage('showErrorToast', '兴趣点导入文件和表不匹配!');
			} else {
				importBtn.removeAttr('disabled');
			}
		});

		$('#input-poi').on("filebatchuploadcomplete", function(event, data,
			previewId, index) {
			$('#input-poi').fileinput('reset');

			getCopyMsg('input-poi');

		});

		$('#input-poi').on("filepreupload", function(event, data, previewId,
			index) {
			$('#input-poi-msg').html("正在导入数据...");
		});

	    // 道路
		$('#input-road').fileinput({
			language: 'zh', ////设置语言
			uploadUrl: uploadUrl, //上传的地址
			allowedFileExtensions: ['csv'], //接收的文件后缀
			maxFileSize: 200000,
			showRemove: true, //是否显示删除按钮
			showCaption: true, //是否显示输入框
			showPreview: false, //是否显示预览窗口
			showCancel: true,
			showUpload: true, //是否显示上传按钮
			browseClass: "btn btn-info", //按钮样式	 
			dropZoneEnabled: false, //是否显示拖拽区域
			browseLabel: "选择文件", //选择按钮文字
			removeClass: "btn btn-danger",
			removeLabel: "取消",
			removeIcon: '<i class="glyphicon glyphicon-trash"></i>',
			uploadClass: "btn btn-success",
			uploadLabel: "导入",
			maxFileCount: 1, //表示允许同时上传的最大文件个数
			enctype: 'multipart/form-data',
			validateInitialCount: true,
			uploadIcon: '<i class="glyphicon glyphicon-upload"></i>',
			slugCallback: function(filename) { //选择文件时，过滤文件名中的特殊字符
				roadTableName = filename.replace('(', '_').replace(']', '_');
				return roadTableName;
			}
		});

		$('#input-roadDiv').find('.btn-file').on('click',function() {
			$('#input-road').fileinput('clear');
		});
		
		$('#input-road').on('filebatchselected', function(event, files) {
			var verify = verifyFile(files[0].name, 'road');
			var importBtn = $('#input-roadDiv').find('.fileinput-upload');
			if(!verify) {
				importBtn.attr('disabled', 'disabled');
				$().toastmessage('showErrorToast', '道路导入文件和表不匹配!');
			} else {
				importBtn.removeAttr('disabled');
			}
		});

		$('#input-road').on("filebatchuploadcomplete", function(event, data,
			previewId, index) {
			$('#input-road').fileinput('reset');

			getCopyMsg('input-road');

		});

		$('#input-road').on("filepreupload", function(event, data, previewId,
			index) {
			$('#input-road-msg').html("正在导入数据...");
		});
		
		// 室外全景
		$('#input-panoconfig').fileinput({
			language: 'zh', ////设置语言
			
			uploadExtraData: function() {
				var table = {table: 'test'};
	            return table;
	        },
	        uploadUrl: uploadUrl, //上传的地址
	        uploadAsync: true,//ajax同步
			allowedFileExtensions: ['csv'], //接收的文件后缀
			maxFileSize: 200000,
			showRemove: true, //是否显示删除按钮
			showCaption: true, //是否显示输入框
			showPreview: false, //是否显示预览窗口
			showCancel: true,
			showUpload: true, //是否显示上传按钮
			browseClass: "btn btn-info", //按钮样式	 
			dropZoneEnabled: false, //是否显示拖拽区域
			browseLabel: "选择文件", //选择按钮文字
			removeClass: "btn btn-danger",
			removeLabel: "取消",
			removeIcon: '<i class="glyphicon glyphicon-trash"></i>',
			uploadClass: "btn btn-success",
			uploadLabel: "导入",
			maxFileCount: 1, //表示允许同时上传的最大文件个数
			enctype: 'multipart/form-data',
			validateInitialCount: true,
			uploadIcon: '<i class="glyphicon glyphicon-upload"></i>',
			slugCallback: function(filename) { //选择文件时，过滤文件名中的特殊字符
				panoconfigTableName = filename.replace('(', '_').replace(']', '_');

				return panoconfigTableName;
			}
		});
		
		$('#input-panoconfigDiv').find('.btn-file').on('click',function() {
			$('#input-panoconfig').fileinput('clear');
		});

		$('#input-panoconfig').on('filebatchselected', function(event, files) {
			var verify = verifyFile(files[0].name, 'panoconfig');
			var importBtn = $('#input-panoconfigDiv').find('.fileinput-upload');
			if(!verify) {
				importBtn.attr('disabled', 'disabled');
				$().toastmessage('showErrorToast', '室外全景导入文件和表不匹配!');
			} else {
				importBtn.removeAttr('disabled');
			}
		});

		$('#input-panoconfig').on("filebatchuploadcomplete", function(event, data,
			previewId, index) {
			$('#input-panoconfig').fileinput('reset');

			getCopyMsg('input-panoconfig');

		});

		$('#input-panoconfig').on("filepreupload", function(event, data, previewId,
			index) {
			$('#input-panoconfig-msg').html("正在导入数据...");
		});

	    
		// 室内全景点位
		$('#input-snpanopoint').fileinput({
            language: 'zh', ////设置语言
            uploadUrl: uploadUrl, //上传的地址
            allowedFileExtensions: ['csv'], //接收的文件后缀
            maxFileSize: 200000,
            showRemove: true, //是否显示删除按钮
            showCaption: true, //是否显示输入框
            showPreview: false, //是否显示预览窗口
            showCancel: true,
            showUpload: true, //是否显示上传按钮
            browseClass: "btn btn-info", //按钮样式  
            dropZoneEnabled: false, //是否显示拖拽区域
            browseLabel: "选择文件", //选择按钮文字
            removeClass: "btn btn-danger",
            removeLabel: "取消",
            removeIcon: '<i class="glyphicon glyphicon-trash"></i>',
            uploadClass: "btn btn-success",
            uploadLabel: "导入",
            maxFileCount: 1, //表示允许同时上传的最大文件个数
            enctype: 'multipart/form-data',
            validateInitialCount: true,
            uploadIcon: '<i class="glyphicon glyphicon-upload"></i>',
            slugCallback: function(filename) { //选择文件时，过滤文件名中的特殊字符
            	snpanopointTableName = filename.replace('(', '_').replace(']', '_');

                return snpanopointTableName;
            }
        });
        
		$('#input-snpanopointDiv').find('.btn-file').on('click',function() {
			$('#input-snpanopoint').fileinput('clear');
		});
		
        $('#input-snpanopoint').on('filebatchselected', function(event, files) {
            var verify = verifyFile(files[0].name, 'snpanopoint');
            var importBtn = $('#input-snpanopointDiv').find('.fileinput-upload');
			if(!verify) {
				importBtn.attr('disabled', 'disabled');
				$().toastmessage('showErrorToast', '室内全景点位导入文件和表不匹配!');
			} else {
				importBtn.removeAttr('disabled');
			}
        });

        $('#input-snpanopoint').on("filebatchuploadcomplete", function(event, data,
            previewId, index) {
            $('#input-snpanopoint').fileinput('reset');

            getCopyMsg('input-snpanopoint');

        });

        $('#input-snpanopoint').on("filepreupload", function(event, data, previewId,
            index) {
            $('#input-snpanopoint-msg').html("正在导入数据...");
        });
		
		
        // 室内全景配置
		$('#input-snpanoconfig').fileinput({
			language: 'zh', ////设置语言
			uploadUrl: uploadUrl, //上传的地址
			allowedFileExtensions: ['csv'], //接收的文件后缀
			maxFileSize: 200000,
			showRemove: true, //是否显示删除按钮
			showCaption: true, //是否显示输入框
			showPreview: false, //是否显示预览窗口
			showCancel: true,
			showUpload: true, //是否显示上传按钮
			browseClass: "btn btn-info", //按钮样式	 
			dropZoneEnabled: false, //是否显示拖拽区域
			browseLabel: "选择文件", //选择按钮文字
			removeClass: "btn btn-danger",
			removeLabel: "取消",
			removeIcon: '<i class="glyphicon glyphicon-trash"></i>',
			uploadClass: "btn btn-success",
			uploadLabel: "导入",
			maxFileCount: 1, //表示允许同时上传的最大文件个数
			enctype: 'multipart/form-data',
			validateInitialCount: true,
			uploadIcon: '<i class="glyphicon glyphicon-upload"></i>',
			slugCallback: function(filename) { //选择文件时，过滤文件名中的特殊字符
                snpanoconfigTableName = filename.replace('(', '_').replace(']', '_');

                return snpanoconfigTableName;
            }
		});
		
		$('#input-snpanoconfigDiv').find('.btn-file').on('click',function() {
			$('#input-snpanoconfig').fileinput('clear');
		});
		
		$('#input-snpanoconfig').on('filebatchselected', function(event, files) {
            var verify = verifyFile(files[0].name, 'snpanoconfig');
            var importBtn = $('#input-snpanoconfigDiv').find('.fileinput-upload');
			if(!verify) {				
				importBtn.attr('disabled', 'disabled');
				$().toastmessage('showErrorToast', '室内全景配置导入文件和表不匹配!');
			} else {
				importBtn.removeAttr('disabled');
			}
        });

        $('#input-snpanoconfig').on("filebatchuploadcomplete", function(event, data,
            previewId, index) {
            $('#input-snpanoconfig').fileinput('reset');

            getCopyMsg('input-snpanoconfig');

        });

        $('#input-snpanoconfig').on("filepreupload", function(event, data, previewId,
            index) {
            $('#input-snpanoconfig-msg').html("正在导入数据...");
        });
	});
	
    
    // 室外全景数据追加
    var isPanoconfigAppend = false;
	function panoconfigDataAppend() {
    	if(isPanoconfigAppend) {
    		return;
    	}
    	isPanoconfigAppend = true;
		var uploadUrl = '/TServer/admin/dataAppend?table='+$('#select-panoconfig').children('option:selected').val();
		
		$('#input-panoconfig2').fileinput({
			language: 'zh', ////设置语言
	        uploadUrl: uploadUrl, //上传的地址
			allowedFileExtensions: ['csv'], //接收的文件后缀
			maxFileSize: 200000,
			showRemove: true, //是否显示删除按钮
			showCaption: true, //是否显示输入框
			showPreview: false, //是否显示预览窗口
			showCancel: true,
			showUpload: true, //是否显示上传按钮
			browseClass: "btn btn-info", //按钮样式	 
			dropZoneEnabled: false, //是否显示拖拽区域
			browseLabel: "追加数据", //选择按钮文字
			removeClass: "btn btn-danger",
			removeLabel: "取消",
			removeIcon: '<i class="glyphicon glyphicon-trash"></i>',
			uploadClass: "btn btn-success",
			uploadLabel: "导入",
			maxFileCount: 1, //表示允许同时上传的最大文件个数
			enctype: 'multipart/form-data',
			validateInitialCount: true,
			uploadIcon: '<i class="glyphicon glyphicon-upload"></i>',
			slugCallback: function(filename) { //选择文件时，过滤文件名中的特殊字符
				return filename.replace('(', '_').replace(']', '_');
			}
		});
			
		$('#input-panoconfig2Div').find('.btn-file').on('click',function() {
			$('#input-panoconfig2').fileinput('clear');
		});
		
		$('#input-panoconfig2').on('filebatchselected', function(event, files) {
			var verify = verifyFile(files[0].name, 'panoconfig2');
			var importBtn = $('#input-panoconfig2Div').find('.fileinput-upload');
			if(!verify) {
				importBtn.attr('disabled', 'disabled');
				$().toastmessage('showErrorToast', '室外全景导入文件和表不匹配!');
			} else {
				importBtn.removeAttr('disabled');
			}
		});

		$('#input-panoconfig2').on("filebatchuploadcomplete", function(event, data,
			previewId, index) {
			$('#input-panoconfig2').fileinput('reset');

			getCopyMsg('input-panoconfig');

		});

		$('#input-panoconfig2').on("filepreupload", function(event, data, previewId,
			index) {
			$('#input-panoconfig-msg').html("正在追加数据...");
		});
	}
    
	// 室内全景点位数据追加
	var isSnpanopointAppend = false;
    function snpanopointDataAppend() {
    	if(isSnpanopointAppend) {
    		return;
    	}
    	isSnpanopointAppend = true;
        var uploadUrl = '/TServer/admin/dataAppend?table='+$('#select-snpanopoint').children('option:selected').val();
        
        $('#input-snpanopoint2').fileinput({
            language: 'zh', ////设置语言
            uploadUrl: uploadUrl, //上传的地址
            allowedFileExtensions: ['csv'], //接收的文件后缀
            maxFileSize: 200000,
            showRemove: true, //是否显示删除按钮
            showCaption: true, //是否显示输入框
            showPreview: false, //是否显示预览窗口
            showCancel: true,
            showUpload: true, //是否显示上传按钮
            browseClass: "btn btn-info", //按钮样式  
            dropZoneEnabled: false, //是否显示拖拽区域
            browseLabel: "追加数据", //选择按钮文字
            removeClass: "btn btn-danger",
            removeLabel: "取消",
            removeIcon: '<i class="glyphicon glyphicon-trash"></i>',
            uploadClass: "btn btn-success",
            uploadLabel: "导入",
            maxFileCount: 1, //表示允许同时上传的最大文件个数
            enctype: 'multipart/form-data',
            validateInitialCount: true,
            uploadIcon: '<i class="glyphicon glyphicon-upload"></i>',
            slugCallback: function(filename) { //选择文件时，过滤文件名中的特殊字符
                return filename.replace('(', '_').replace(']', '_');
            }
        });
            
        $('#input-snpanopoint2Div').find('.btn-file').on('click',function() {
			$('#input-snpanopoint2').fileinput('clear');
		});
        
        $('#input-snpanopoint2').on('filebatchselected', function(event, files) {
            var verify = verifyFile(files[0].name, 'snpanopoint2');
            var importBtn = $('#input-snpanopoint2Div').find('.fileinput-upload');
			if(!verify) {
				importBtn.attr('disabled', 'disabled');
				$().toastmessage('showErrorToast', '室内全景点位导入文件和表不匹配!');
			} else {
				importBtn.removeAttr('disabled');
			}
        });

        $('#input-snpanopoint2').on("filebatchuploadcomplete", function(event, data,
            previewId, index) {
            $('#input-snpanopoint2').fileinput('reset');

            getCopyMsg('input-snpanopoint');

        });

        $('#input-snpanopoint2').on("filepreupload", function(event, data, previewId,
            index) {
            $('#input-snpanopoint-msg').html("正在追加数据...");
        });
    }
	
    // 室内全景配置数据追加
    var isSnpanoconfigAppend = false;
    function snpanoconfigDataAppend() {
    	if(isSnpanoconfigAppend) {
            return;
        }
        isSnpanoconfigAppend = true;
        var uploadUrl = '/TServer/admin/dataAppend?table='+$('#select-snpanoconfig').children('option:selected').val();
        
        $('#input-snpanoconfig2').fileinput({
            language: 'zh', ////设置语言
            uploadUrl: uploadUrl, //上传的地址
            allowedFileExtensions: ['csv'], //接收的文件后缀
            maxFileSize: 200000,
            showRemove: true, //是否显示删除按钮
            showCaption: true, //是否显示输入框
            showPreview: false, //是否显示预览窗口
            showCancel: true,
            showUpload: true, //是否显示上传按钮
            browseClass: "btn btn-info", //按钮样式  
            dropZoneEnabled: false, //是否显示拖拽区域
            browseLabel: "追加数据", //选择按钮文字
            removeClass: "btn btn-danger",
            removeLabel: "取消",
            removeIcon: '<i class="glyphicon glyphicon-trash"></i>',
            uploadClass: "btn btn-success",
            uploadLabel: "导入",
            maxFileCount: 1, //表示允许同时上传的最大文件个数
            enctype: 'multipart/form-data',
            validateInitialCount: true,
            uploadIcon: '<i class="glyphicon glyphicon-upload"></i>',
            slugCallback: function(filename) { //选择文件时，过滤文件名中的特殊字符
                return filename.replace('(', '_').replace(']', '_');
            }
        });
            
        $('#input-snpanoconfig2Div').find('.btn-file').on('click',function() {
        	$('#input-snpanoconfig2').fileinput('clear');
        });
        
        $('#input-snpanoconfig2').on('filebatchselected', function(event, files) {
            var verify = verifyFile(files[0].name, 'snpanoconfig2');
            var importBtn = $('#input-snpanoconfig2Div').find('.fileinput-upload');
			if(!verify) {
				importBtn.attr('disabled', 'disabled');
				$().toastmessage('showErrorToast', '室内全景配置导入文件和表不匹配!');
			} else {
				importBtn.removeAttr('disabled');
			}
        });

        $('#input-snpanoconfig2').on("filebatchuploadcomplete", function(event, data,
            previewId, index) {
            $('#input-snpanoconfig2').fileinput('reset');

            getCopyMsg('input-snpanoconfig');

        });

        $('#input-snpanoconfig2').on("filepreupload", function(event, data, previewId,
            index) {
            $('#input-snpanoconfig-msg').html("正在追加数据...");
        });
    }

	var roadnetTableName = '', // 路网
		roadcrossTableName = '', // 路口
		poiTableName = '', // 兴趣点
		roadTableName = '', // 道路
		// 室外全景配置表
		panoconfigTableName = '',
		panoconfigTableName2 = '',
		// 室内全景点位表
		snpanopointTableName = '';
	    snpanopointTableName2 = '';
	    // 室内全景配置表
		snpanoconfigTableName = '';
	    snpanoconfigTableName2 = '';


	// 获取导入过程中后台信息
	function getCopyMsg(ctrlName,tableNameTemp) {
		var tableName = '';
		if (ctrlName === 'input-roadnet') {
			tableName = roadnetTableName;
			roadnetTableName = '';
		} else if (ctrlName === 'input-roadcross') {
			tableName = roadcrossTableName;
			roadcrossTableName = '';
		} else if (ctrlName === 'input-poi') {
			tableName = poiTableName;
			poiTableName = '';
		} else if (ctrlName === 'input-road') {
			tableName = roadTableName;
			roadTableName = '';
		} else if (ctrlName === 'input-panoconfig') {
			tableName = panoconfigTableName;
			if (tableName === '') {
				tableName = $('#select-panoconfig').children('option:selected').val()+'.csv';	
			}
			panoconfigTableName = '';
		} else if (ctrlName === 'input-snpanopoint') {
			tableName = snpanopointTableName;
            if (tableName === '') {
                tableName = $('#select-snpanopoint').children('option:selected').val()+'.csv';   
            }
            snpanopointTableName = '';
		} else if (ctrlName === 'input-snpanoconfig') {
			tableName = snpanoconfigTableName;
            if (tableName === '') {
                tableName = $('#select-snpanoconfig').children('option:selected').val()+'.csv';   
            }
            snpanoconfigTableName = '';
        } else if (ctrlName === 'input-district') {
        	tableName = 'district.csv';
        } else if(ctrlName === 'input-model') {
        	tableName = tableNameTemp+".csv";
        }
		
		var data = {
			tableName: tableName
		};
		$.ajax({
			url: "/TServer/admin/getCopyMsg",
			dataType: 'text',
			data: data,
			success: function(result) {
				//$('#' + ctrlName + '-msg').html(result);
				var jsonObj = JSON.parse(result);
				
				$('#' + ctrlName + '-msg').html(jsonObj.sucMsg);
				
				var toastMsg = jsonObj.msg;
				
				if (typeof(toastMsg) !== "undefined" && toastMsg !== '') {
					$().toastmessage('showErrorToast', toastMsg);	
				}
				
				setSelectValue(tableName, ctrlName);
			},
			error: function() {
				alert('error');
			}

		});
	}
	// 上传成功后处理下拉框
	function setSelectValue(tableName, ctrlName) {
		if (tableName !== '') {
			var lastDotIndex = tableName.lastIndexOf('.');
			if (lastDotIndex != -1) {
				var selectedValue = tableName.substring(0, lastDotIndex);
				var newOpt = "<option value='" + selectedValue + "'>" + selectedValue + "</option>";
				if (ctrlName === 'input-roadnet') {
					$("#select-roadnet").append(newOpt);
					$("#select-roadnet option[value='" + selectedValue + "']").attr("selected", true);
				} else if (ctrlName === 'input-roadcross') {
					$("#select-roadcross").append(newOpt);
					$("#select-roadcross option[value='" + selectedValue + "']").attr("selected", true);
				} else if (ctrlName === 'input-poi') {
					$("#select-poi").append(newOpt);
					$("#select-poi option[value='" + selectedValue + "']").attr("selected", true);
				} else if (ctrlName === 'input-road') {
					$("#select-road").append(newOpt);
					$("#select-road option[value='" + selectedValue + "']").attr("selected", true);
				} else if (ctrlName === 'input-panoconfig') {
					var selected = $('#select-panoconfig').children('option:selected').val();
					
					// 追加数据时不增加下拉框项
					if (selected === '') {
						$("#select-panoconfig").append(newOpt);	
					}
					
					$("#select-panoconfig option[value='" + selectedValue + "']").attr("selected", true);
					
					//$("#select-panoconfig").change();
					
					panoconfigDataAppend();
					
					$("#input-panoconfigDiv").hide();
					$("#input-panoconfig2Div").show();
					
					//$('#input-panoconfig-msg').html($('#input-panoconfig-msg').html()+',可继续追加数据3');
					$('#input-panoconfig-msg').html($('#input-panoconfig-msg').html());
				} else if (ctrlName === 'input-snpanopoint') {
				    var selected = $('#select-snpanopoint').children('option:selected').val();
                    
                    // 追加数据时不增加下拉框项
                    if (selected === '') {
                        $("#select-snpanopoint").append(newOpt); 
                    }
                    
                    $("#select-snpanopoint option[value='" + selectedValue + "']").attr("selected", true);
					
				    snpanopointDataAppend();
                    
                    $("#input-snpanopointDiv").hide();
                    $("#input-snpanopoint2Div").show();
                    
                    $('#input-snpanopoint-msg').html($('#input-snpanopoint-msg').html());
				} else if (ctrlName === 'input-snpanoconfig') {
					
				    var selected = $('#select-snpanoconfig').children('option:selected').val();
                    
                    // 追加数据时不增加下拉框项
                    if (selected === '') {
                        $("#select-snpanoconfig").append(newOpt); 
                    }
                    
                    $("#select-snpanoconfig option[value='" + selectedValue + "']").attr("selected", true);
					
				    snpanoconfigDataAppend();
                    
                    $("#input-snpanoconfigDiv").hide();
                    $("#input-snpanoconfig2Div").show();
                    
                    $('#input-snpanoconfig-msg').html($('#input-snpanoconfig-msg').html());
                } else if (ctrlName === 'input-district') {
                	$('#input-district-msg').html($('#input-district-msg').html());
                }
			}
		}
	}

	// 导入文件验证
	function verifyFile(filename, type) {
		var verify = true; 
		var lastDotIndex = filename.lastIndexOf('.'),
			lastDashIndex = filename.lastIndexOf('_'),
			tableType = filename.substring(lastDashIndex + 1, lastDotIndex);
		
		// 导入按钮
		var importBtn = $('#input-' + type + 'Div').find('.fileinput-upload');
	
		if (type === 'panoconfig2') {
			if (type.indexOf(tableType) === -1) {
				verify = false;
			}
		} else if(type === 'snpanopoint2' || type === 'snpanoconfig2') {
			if (!(tableType.indexOf('sn') !== -1 && type.indexOf(tableType) !== -1)) {
				verify = false;
            }
		} else {
			if (type !== tableType) {
				verify = false;
			}
		}
		
		return verify;
	}


	// 根据表类型加载所有表信息
	function load() {
		var empOption = '<option value="">请选择</option>';
		$('#select-roadnet').empty();
		$('#select-roadcross').empty();
		$('#select-poi').empty();
		$('#select-road').empty();
		$('#select-panoconfig').empty();// 室外全景配置
		$('#select-snpanopoint').empty(); // 室内全景点位
		$('#select-snpanoconfig').empty(); // 室内全景配置

		$.ajax({
			url: "/TServer/admin/getAllTables",
			dataType: 'text',
			success: function(result) {
				var opts_roadnet = empOption;
				var opts_roadcross = empOption;
				var opts_poi = empOption;
				var opts_road = empOption;
				var opts_pconfig = empOption;// 室外全景配置
				var opts_snppoint = empOption;// 室内全景点位
				var opts_snpconfig = empOption;// 室内全景配置
				
				var resultObject = JSON.parse(result);
				
				var tableArray = resultObject.tables;
				var selectedValueObj = resultObject.selectedValue;

				var len = tableArray.length;

				for (var i = 0; i < len; i++) {
					var obj = tableArray[i];
					var tableName = obj.tablename;
				    
					if(tableName.indexOf('snpanopoint') >= 0) { // 室内全景点位
                        opts_snppoint += '<option value="' + tableName + '">' + tableName + '</option>';
                    }
					else if (tableName.indexOf('roadnet') > 0) { // 路网
						opts_roadnet += '<option value="' + tableName + '">' + tableName + '</option>';
					} else if (tableName.indexOf('roadcross') > 0) { // 路口
						opts_roadcross += '<option value="' + tableName + '">' + tableName + '</option>';
					} else if (tableName.indexOf('poi') > 0) { // 兴趣点
						opts_poi += '<option value="' + tableName + '">' + tableName + '</option>';
					} else if (tableName.indexOf('road') > 0) { // 道路
						opts_road += '<option value="' + tableName + '">' + tableName + '</option>';
					} else if (tableName.indexOf('panoconfig') >= 0 && tableName.indexOf('snpanoconfig') === -1) { // 室外全景配置
						opts_pconfig += '<option value="' + tableName + '">' + tableName + '</option>';
					} else if (tableName.indexOf('snpanoconfig') >= 0) { // 室内全景配置
                    	opts_snpconfig += '<option value="' + tableName + '">' + tableName + '</option>';
                    }
				}
				
				$('#select-roadnet').append(opts_roadnet);
				$('#select-roadcross').append(opts_roadcross);
				$('#select-poi').append(opts_poi);
				$('#select-road').append(opts_road);
				$('#select-panoconfig').append(opts_pconfig);
				$('#select-snpanopoint').append(opts_snppoint);
				$('#select-snpanoconfig').append(opts_snpconfig);
				
				// 设置下拉框默认值
				$.each(selectedValueObj,function(key,selectedValue) {
					if(selectedValue === "") {
						$("#select-" +key+ " option[value='" + selectedValue + "']").attr("selected", true);
					} else {
						var ctrlName = "input-" + key;
						var tableName = selectedValue + ".csv";
						
						setSelectValue(tableName, ctrlName);
					}
				});
			},
			error: function() {
				$('#select-roadnet').append(empOption);
				$('#select-roadcross').append(empOption);
				$('#select-poi').append(empOption);
				$('#select-road').append(empOption);
				$('#select-panoconfig').append(empOption);
				$('#select-snpanopoint').append(empOption);
                $('#select-snpanoconfig').append(empOption);

				$().toastmessage('showErrorToast', '加载数据库表信息出错!');
			}
		});
	}
	
	// 编码
	function encodeBase64(mingwen,times){  
	    var code="";  
	    var num=1;  
	    if(typeof times=='undefined'||times==null||times==""){  
	       num=1;  
	    }else{  
	       var vt=times+"";  
	       num=parseInt(vt);  
	    }  
	  
	    if(typeof mingwen=='undefined'||mingwen==null||mingwen==""){  
	  
	    }else{  
	        $.base64.utf8encode = true;  
	        code=mingwen;  
	        for(var i=0;i<num;i++){  
	           code=$.base64.btoa(code);  
	        }  
	    }  
	    return code;  
	}  
	
	
	// 新增模型服务界面
	$("#modelConfig").dialog({
		title: "新增模型配置",
		autoOpen: false,
		modal: true,
		width: '400px',
		buttons: {
			"新增": function() {
				var mapName = $(this).find('input').eq(0).val(),
					mapTitle = $(this).find('input').eq(1).val(),
					titleUrl = $(this).find('select').eq(0).val(),
					table = $('input[name="modelTable"]:checked').val();
				if (mapName === '') {
					$().toastmessage('showErrorToast', '请填写名称!');
					return;
				}
				var reg = new RegExp('^[A-Za-z]+$');
				if (!reg.test(mapName)) {
					$().toastmessage('showErrorToast', '名称必须为英文!');
					return;
				}

				if (mapTitle === '') {
					$().toastmessage('showErrorToast', '请填写Title!');
					return;
				}
				if (titleUrl === '') {
					$().toastmessage('showErrorToast', '请选择切片地址!');
					return;
				}
				var data = {
					name: mapName,
					title: mapTitle,
					titleUrl: 'model/' + titleUrl,
					mapType: 'model',
					table: table
				};
				$.post('/TServer/admin/addModelConfig',
					data,
					function(result) {
						if (!result.isSucess) {
							$().toastmessage('showErrorToast', result.error + '!');
							return;
						}
						window.location.reload();
					}, 'json');
			},
			"取消": function() {
				$(this).dialog("close");
			}
		}
	});
	// 添加模型服务
	$("#btnAddModel").click(function() {
		$('#modelConfig').find('input').eq(0).val('');
		$('#modelConfig').find('input').eq(1).val('');
		$('#modelTitleName').empty();
		
		$.ajax({
			url: "/TServer/admin/listModelData",
			dataType: 'text',
			success: function(result) {
				if ('' === result) {
					$().toastmessage('showErrorToast', '没有模型文件!');
				}
				var opts = '<option value="">请选择</option>';
				if (result.length !== 0) {
					var jsonArray = JSON.parse(result);
					var len = jsonArray.length;
					for (var i = 0; i < len; i++) {
						var obj = jsonArray[i];
						var modelName = obj.modelName;
						opts += '<option value="' + modelName + '">' + modelName + '</option>';
					}

				}
				$("#modelTitleName").append(opts);
			},
			error: function() {
				$('#modelTitleName').append('<option value="">请选择</option>');
			}

		});

		$('#modelConfig').dialog('open');
	});
	
	// 模型属性导入窗口
	$("#modelAttributes").dialog({
		title: "模型属性导入",
		autoOpen: false,
		modal: false,
		width: '600px',
		close : function() {
			//#$('#input-model').fileinput('reset');
			$('#input-modelDiv').empty();
			$(this).dialog("close");
        },
		buttons: {
//			'上传':function(){
//				
//			},
			"取消": function() {
				//$('#input-model').fileinput('reset');
				$('#input-modelDiv').empty();
				$(this).dialog("close");
			}
		}
	});
	
	// 导入模型属性数据
	function importModelAttributes(that, name) {
		$('#modelAttributes').dialog('open');
		
		$('#input-modelDiv').append('<input id="input-model" name="files" type="file" class="file-loading" accept=".csv" />');
		
		$('#input-model-msg').html("");
		modelAttributesDataAppend(name);
	}
	
	function modelAttributesDataAppend(name) {
		var tableName = name+'_model';
		var uploadUrl = '/TServer/admin/dataAppend?table='+tableName;
        
        $('#input-model').fileinput({
            language: 'zh', ////设置语言
            uploadUrl: uploadUrl, //上传的地址
            allowedFileExtensions: ['csv'], //接收的文件后缀
            maxFileSize: 200000,
            showRemove: false, //是否显示删除按钮
            showCaption: true, //是否显示输入框
            showPreview: false, //是否显示预览窗口
            showCancel: true,
            showUpload: true, //是否显示上传按钮
            browseClass: "btn btn-info", //按钮样式  
            dropZoneEnabled: false, //是否显示拖拽区域
            browseLabel: "追加数据", //选择按钮文字
            removeClass: "btn btn-danger",
            removeLabel: "取消",
            removeIcon: '<i class="glyphicon glyphicon-trash"></i>',
            uploadClass: "btn btn-success",
            uploadLabel: "导入",
            maxFileCount: 1, //表示允许同时上传的最大文件个数
            enctype: 'multipart/form-data',
            validateInitialCount: true,
            uploadIcon: '<i class="glyphicon glyphicon-upload"></i>',
            slugCallback: function(filename) { //选择文件时，过滤文件名中的特殊字符
                return filename.replace('(', '_').replace(']', '_');
            }
        });
            
        $('#input-modelDiv').find('.btn-file').on('click',function() {
        	$('#input-model').fileinput('clear');
        });
        
        $('#input-model').on('filebatchselected', function(event, files) {
        	var verify = verifyFile(files[0].name, 'model');
        	var importBtn = $('#input-modelDiv').find('.fileinput-upload');
        	if(!verify) {
        		importBtn.attr('disabled', 'disabled');
        		$().toastmessage('showErrorToast', '模型导入文件和表不匹配!');
        	} else {
        		importBtn.removeAttr('disabled');
        	}
        });

        $('#input-model').on("filebatchuploadcomplete", function(event, data,
            previewId, index) {
            $('#input-model').fileinput('reset');

            getCopyMsg('input-model',tableName);

        });

        $('#input-model').on("filepreupload", function(event, data, previewId,
            index) {
            $('#input-model-msg').html("正在追加数据...");
        });
    }