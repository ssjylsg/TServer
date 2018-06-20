<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%@taglib uri="http://www.springframework.org/tags/form" prefix="form"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@taglib prefix="spring" uri="http://www.springframework.org/tags" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<link rel="stylesheet" href="/TServer/resources/css/bootstrap.css">
<link rel="stylesheet" href="/TServer/resources/css/jquery-ui-1.9.2.custom.min.css">
<link href="/TServer/resources/css/fileinput.min.css" media="all" rel="stylesheet" type="text/css" />
<link href="/TServer/resources/css/jquery.toastmessage.css" media="all" rel="stylesheet" type="text/css" />

<title><spring:message code="config.bt" /></title>
<style type="text/css">
.config div span {
	width: 200px;
	display: inline-block;
}

input[type='text'] {
	width: 200px;
}

.postData {
	text-align: center;
}

.tableTitle {
	background-color: darkgrey;
	width: 1000px;
}

.tableTitle span {
	text-align: center
}

#mapConfig {
	display: none;
}

#mapConfig ul span {
	width: 80px;
	display: inline-block;
}

#modelConfig {
    display: none;
}

#modelConfig ul span {
    width: 80px;
    display: inline-block;
}

input[type='file'] {
	width: 260px;
}

li{
    list-style-type:none;
}
</style>
</head>
<body onload="load()">
	
	<form:form action="" method="POST" modelAttribute="config">
        <div class="col-sm-12" style="padding-top:15px;">
			<div class="panel panel-info">
			
				<div class="panel-heading">
					<h3 class='panel-title'><spring:message code="config.sjkpz" />：</h3>
				</div>
				<div class="panel-body">
					<span><spring:message code="config.fwdz" />：</span>
					<form:input path="dbUrl" />
					<span><spring:message code="config.dkh" />：</span>
					<form:input path="dbport" />
					<span><spring:message code="config.sjk" />：</span>
					<form:input path="dbName" />
					<span><spring:message code="config.yhm" />：</span>
					<form:input path="dbUserName" />
					<span><spring:message code="config.mm" />：</span>
					<form:input type="password" path="dbPassword" name="dbPassword"   />
					<button id="testDb" type="button" class="btn btn-sm btn-info">
						<span class="glyphicon glyphicon-check"></span> <spring:message code="config.csbtj" />
					</button>
				</div>

				<div class="panel-heading">
					<h3 class='panel-title'><spring:message code="config.sjbdrjpz" />：</h3>
				</div>
				<div class="panel-body">
					<div id="tableConfig">
						<table id="tableConfig" class="table">
							<thead>
								<tr>
									<th><spring:message code="config.mc" /></th>
									<th><spring:message code="config.bmc" /></th>
									<th><spring:message code="config.sjwj" /></th>
									<th></th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td style="width: 10%"><spring:message code="config.lw" /></td>
									<td style="width: 20%">
									    <select id="select-roadnet" class="form-control" name="selectTableName" style="width: 200px"></select>
									</td>
									<td style="width: 30%">
										<div id="input-roadnetDiv">
											<input id="input-roadnet" name="files" type="file" class="file-loading" accept=".csv" />
										</div>
										<h5><spring:message code="config.lwwjgs" />：*_roadnet.csv</h5>
									</td>
									<td style="width: 40%"><h4 id="input-roadnet-msg">${config.roadnetMsg}</h4></td>
								</tr>

								<tr>
									<td><spring:message code="config.lk" /></td>
									<td>
									    <select id="select-roadcross" name="selectTableName" class="form-control" style="width: 200px"></select>
									</td>
									<td>
										<div id="input-roadcrossDiv">
											<input id="input-roadcross" name="files" type="file" class="file-loading" accept=".csv" />
										</div>
										<h5><spring:message code="config.lkwjgs" />：*_roadcross.csv</h5>
									</td>
									<td><h4 id="input-roadcross-msg">${config.roadcrossMsg}</h4></td>
								</tr>
								<tr>
									<td><spring:message code="config.xqd" /></td>
									<td>
									    <select id="select-poi" name="selectTableName" class="form-control" style="width: 200px"></select>
									</td>
									<td>
										<div id="input-poiDiv">
											<input id="input-poi" name="files" type="file" class="file-loading" accept=".csv" />
										</div>
										<h5><spring:message code="config.xqdwjgs" />：*_poi.csv</h5>
									</td>
									<td><h4 id="input-poi-msg">${config.poiMsg}</h4></td>
								</tr>

								<tr>
									<td><spring:message code="config.dl" /></td>
									<td>
									    <select id="select-road" name="selectTableName" class="form-control" style="width: 200px"></select></td>
									<td>
										<div id="input-roadDiv">
											<input id="input-road" name="files" type="file" class="file-loading" accept=".csv" />
										</div>
										<h5><spring:message code="config.dlwjgs" />：*_road.csv</h5>
									</td>
									<td><h4 id="input-road-msg">${config.roadMsg}</h4></td>
								</tr>
								
								<tr>
									<td><spring:message code="config.swqj" /></td>
									<td>
									    <select id="select-panoconfig" name="selectTableName" class="form-control" style="width: 200px"></select>
									    <h5><spring:message code="config.sjzj" /></h5>
									</td>
									<td>
										<div id="input-panoconfigDiv">
											<input id="input-panoconfig" name="files" type="file" class="file-loading" accept=".csv" />
										</div>
										<div id="input-panoconfig2Div" style="display:none;">
											<input id="input-panoconfig2" name="files" type="file" class="file-loading" accept=".csv" />
										</div>
										<h5><spring:message code="config.swqjwjgs" />：*_panoconfig.csv <spring:message code="config.h" />  panoconfig.csv</h5>
									</td>
									<td><h4 id="input-panoconfig-msg">${config.panoconfigMsg}</h4></td>
								</tr>

								<tr>
									<td><spring:message code="config.snqj" /></td>
									<td>
									    <select id="select-snpanopoint" name="selectTableName" class="form-control" style="width: 200px"></select>
									    <h5><spring:message code="config.dwb" />，<spring:message code="config.sjzj" /></h5>
									    
									    <select id="select-snpanoconfig" name="selectTableName" class="form-control" style="width: 200px"></select>
									    <h5><spring:message code="config.pzb" />，<spring:message code="config.sjzj" /></h5>
									</td>
									<td>
									    <div id="input-snpanopointDiv">
                                            <input id="input-snpanopoint" name="files" type="file" class="file-loading" accept=".csv" />
                                        </div>
                                        <div id="input-snpanopoint2Div" style="display:none;">
                                            <input id="input-snpanopoint2" name="files" type="file" class="file-loading" accept=".csv" />
                                        </div>
                                        <h5><spring:message code="config.snqjdwwjgs" />：*_snpanopoint.csv <spring:message code="config.h" /> snpanopoint.csv</h5>
                                        
                                        
										<div id="input-snpanoconfigDiv">
											<input id="input-snpanoconfig" name="files" type="file" class="file-loading" accept=".csv" />
										</div>
										<div id="input-snpanoconfig2Div" style="display:none;">
                                            <input id="input-snpanoconfig2" name="files" type="file" class="file-loading" accept=".csv" />
                                        </div>
										<h5><spring:message code="config.snqjpzwjgs" />：*_snpanoconfig.csv <spring:message code="config.h" /> snpanoconfig.csv</h5>
									</td>
									<td>
									    <h4 id="input-snpanopoint-msg">${config.snpanopointMsg}</h4>
									    <br />
									    <h4 id="input-snpanoconfig-msg">${config.snpanoconfigMsg}</h4>
									</td>
								</tr>
								
								<tr>
                                    <td><spring:message code="config.xzqh" /></td>
                                    <td>
                                        <h5><spring:message code="config.xzqhsm" /></h5>
                                    </td>
                                    <td>
                                        <div id="input-districtDiv">
                                            <input id="input-district" name="files" type="file" class="file-loading" accept=".csv" />
                                        </div>
                                        <h5><spring:message code="config.xzqhwjgs" />：*_district.csv <spring:message code="config.h" /> district.csv</h5>
                                    </td>
                                    <td><h4 id="input-district-msg"></h4></td>
                                </tr>

							</tbody>
						</table>
					</div>
				</div>
				<div class="panel-heading">
					<h3 class='panel-title'><spring:message code="config.dtfwpz" />：</h3>
					
				</div>
				
				<div id="serviceConfig" class="panel-body config">
					<button id="btnAddMap" type="button" class="btn btn-sm btn-info">
						<span class="glyphicon glyphicon-plus"></span> <spring:message code="config.xz" />
					</button>
					<table class="table">
						<thead>
							<tr>
								<th style="width: 15%"><spring:message code="config.mc" /></th>
								<th style="width: 10%">Title</th>
								<th style="width: 10%"><spring:message code="config.dtlx" /></th>
								<th style="width: 15%"><spring:message code="config.qpdz" /></th>
								<th style="width: 35%"><spring:message code="config.dtdemo" /></th>
	 							<th><!--<a href='javascript:$("#mapConfig").dialog("open")'>新增</a>--></th>
	 						</tr> 
						</thead>
						<tbody>
							<c:forEach var="mapConfig" items="${config.mapConfigs}">
							    <c:if test="${mapConfig.mapType ne 'model'}">
									<tr>
										<td>${mapConfig.name}</td>
										<td>${mapConfig.title}</td>
										<td>${mapConfig.mapType}</td>
										<td>${mapConfig.mapUrl}</td>
										<td>
											<c:if test="${mapConfig.mapType == 'arcgis'}">
												<a target="_blank" href="/TServer/arcgis/services/${mapConfig.name}/MapServer">${mapConfig.title}(${mapConfig.name}_${mapConfig.mapType })</a>
											</c:if> 
											<c:if test="${mapConfig.mapType == 'NPGIS'}">
												<a target="_blank" href="/TServer/NPGIS/services/${mapConfig.name}/MapServer">${mapConfig.title}(${mapConfig.name}_${mapConfig.mapType })</a>
											</c:if>
										</td>
										<td>
											<a href="javascript:void(0)" onclick='removeServiceConfig(this,"${mapConfig.name}","${modelConfig.mapType}")' class='ui-button-delete'><spring:message code="config.sc" /></a>
										</td>
									</tr>
								</c:if>
							</c:forEach>
						</tbody>
					</table>
				</div>
				
				<div class="panel-heading">
                    <h3 class='panel-title'><spring:message code="config.mxfwpz" />：</h3>
                    
                </div>
                
                <div id="modelServiceConfig" class="panel-body config">
                    <button id="btnAddModel" type="button" class="btn btn-sm btn-info">
                        <span class="glyphicon glyphicon-plus"></span> <spring:message code="config.xz" />
                    </button>
                    
                    <table class="table">
                        <thead>
                            <tr>
                                <th style="width: 15%"><spring:message code="config.mc" /></th>
                                <th style="width: 10%">Title</th>
                                <th style="width: 10%"><spring:message code="config.dtlx" /></th>
                                <th style="width: 15%"><spring:message code="config.mxdz" /></th>
                                <th style="width: 15%"><spring:message code="config.mxsx" /><spring:message code="config.sxsjdr" /></th>
                                <th style="width: 15%"><spring:message code="config.mxdemo" /></th>
                                <th><!--<a href='javascript:$("#mapConfig").dialog("open")'>新增</a>--></th>
                            </tr> 
                        </thead>
                        <tbody>
                            <c:forEach var="modelConfig" items="${config.mapConfigs}">
                                <c:if test="${modelConfig.mapType eq 'model'}">
	                                <tr>
	                                    <td>${modelConfig.name}</td>
	                                    <td>${modelConfig.title}</td>
	                                    <td>${modelConfig.mapType}</td>
	                                    <td>${modelConfig.mapUrl}</td>
	                                    <td>
	                                       <c:if test="${modelConfig.table eq 'y'}">
	                                           <a href="javascript:void(0)" onclick='importModelAttributes(this,"${modelConfig.name}")' class='ui-button-delete'><spring:message code="config.sxsjdr" /></a>
	                                       </c:if>
	                                    </td>
	                                    <td><a target="_blank" href="/TServer/Map3d/services/${modelConfig.name}/Map3d">${modelConfig.title}</a></td>
	                                    <td>
	                                        <a href="javascript:void(0)" onclick='removeServiceConfig(this,"${modelConfig.name}","${modelConfig.mapType}")' class='ui-button-delete'><spring:message code="config.sc" /></a>
	                                    </td>
	                                </tr>
                                </c:if>
                            </c:forEach>
                        </tbody>
                    </table>
                </div>
                
				<!-- 地图服务添加界面  -->
				<div id="mapConfig">
					<ul>
						<li>
							<span><spring:message code="config.mc" />：</span>
							<input type='text' />
						</li>
					</ul>
					<ul>
					    <li>
						   <span>Title：</span>
						   <input type='text' />
						</li>
					</ul>
					<ul>
				        <li>
							<span><spring:message code="config.dtlx" />：</span>
							<select style="width: 200px;height:28px;" >
								<option value="NPGIS">TServer</option>
								<option value="arcgis">ArcGIS</option>
							</select>
						</li>
					</ul>
					<ul>
					    <li>
						   <span><spring:message code="config.qpdz" />：</span>mapTitle/<select id="mapTitleName" style="width: 151px;height:28px;" ></select>
					    </li>
					</ul>
				</div>
				
				<!-- 模型服务添加界面  -->
				<div id="modelConfig">
                    <ul>
                        <li>
                            <span><spring:message code="config.mc" />：</span>
                            <input type='text' />
                        </li>
                    </ul>
                    <ul>
                        <li>
                           <span>Title：</span>
                           <input type='text' />
                        </li>
                    </ul>
                    <ul>
                        <li>
                           <span><spring:message code="config.mxdz" />：</span>model/<select id="modelTitleName" style="width: 164px;height:28px;" ></select>
                        </li>
                    </ul>
                    <ul>
                        <li>
                        <span><spring:message code="config.sxb" />：</span>
                        <input type="radio" name="modelTable" id="a" value="y" checked="checked" /><spring:message code="config.yes" />&nbsp;&nbsp;
                        <input type="radio" name="modelTable" id="b" value="n" /><spring:message code="config.no" />
                        </li>
                    </ul>
                </div>
                
                <!-- 模型属性导入界面  -->
                <div id="modelAttributes">
                    <div id="input-modelDiv">
	                   <!-- <input id="input-model" name="files" type="file" class="file-loading" accept=".csv" /> -->
	                </div>
	                <h4 id="input-model-msg"></h4>
                </div>
				
				
				<div class="postData" style="padding-top:10px;padding-bottom:10px;">
					<input type="hidden" name="queryParmeterData" />
					<input type="hidden" name="type" /> 
					<button id="submitCon" type="button" class="btn btn-primary">
						<span class="glyphicon glyphicon-ok"></span> <spring:message code="config.tj" />
					</button>
				</div>
			</div>
		</div>
		<div style="margin:0 auto;width:100%;color:red;text-align:center;">
			<h2>${subMessage}</h2> 
		</div>

	</form:form>
	<script type="text/javascript" src="/TServer/resources/js/jquery.js"></script>
	<script type="text/javascript" src="/TServer/resources/js/json2.js"></script>
	<script type="text/javascript" src="/TServer/resources/js/bootstrap.min.js"></script>
	<script type="text/javascript" src="/TServer/resources/js/jquery-ui-1.9.2.custom.min.js"></script>
	<script type="text/javascript" src="/TServer/resources/js/fileinput.min.js"></script>
	<script type="text/javascript" src="/TServer/resources/js/fileinput_locale_zh.js"></script>
	<script type="text/javascript" src="/TServer/resources/js/jquery.toastmessage.js"></script>
	<script type="text/javascript" src="/TServer/resources/js/jquery.base64.js"></script>
		
	<script>
	$("#dbPassword").change(function(){
		dbpdChangeHandler();
	});
	
	   // 根据本地化需要加载 js 文件
	   var npgisLocal = "${myLocale}";
	   document.write("<script type='text/javascript' src='/TServer/js/config_" + npgisLocal + ".js'><\/script>");
	</script>
</body>
</html>