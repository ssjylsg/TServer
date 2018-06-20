<%@ page language="java" contentType="text/html; charset=utf-8" pageEncoding="utf-8" %>
<%@taglib prefix="spring" uri="http://www.springframework.org/tags" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<title><spring:message code="queryDemo.bt" /></title>
</head>
<body>
	<div>
		<ul id="地名地址">
			<li><b>1.<spring:message code="search.dmdz" />：</b></li>
			<p><spring:message code="queryDemo.js" />：<i><spring:message code="queryDemo.dmdzjs" /></i></p>
			<p>URI：<i>/TServer/query/poiname?keyWord=&maxResult=&rowIndex&</i></p>
			<p><spring:message code="queryDemo.cssm" />：<i><spring:message code="queryDemo.dmdzcssm" /></i></p>
			<p>
				<a href="/TServer/query/poiname?keyWord=同治村同心" target="_blank"><spring:message code="queryDemo.sl" /></a>
				&nbsp;<a href="/TServer/query/" target="_blank"><spring:message code="queryDemo.zhsl" /></a>
				
			</p>
		</ul>
		<ul id="逆地名地址">
			<li><b>2.<spring:message code="search.ndmdz" />：</b></li>
			<p><spring:message code="queryDemo.js" />：<i><spring:message code="queryDemo.ndmdzjs" /></i></p>
			<p>URI：<i>/TServer/query/poicoord?coord=&</i></p>
			<p><spring:message code="queryDemo.cssm" />：<i><spring:message code="queryDemo.dmdzcssm" /></i></p>
			<p>
				<a
					href="/TServer/query/poicoord?coord=121.792795278,31.0003135480001"
					target="_blank"><spring:message code="queryDemo.sl" /></a>&nbsp;<a href="/TServer/query/" target="_blank"><spring:message code="queryDemo.zhsl" /></a>
			</p>
		</ul>
		<ul id="查找最近道路">
			<li><b>3.<spring:message code="search.cxzjdl" />：</b></li>
			
			<p><spring:message code="queryDemo.js" />：<i><spring:message code="queryDemo.cxzjdljs" /></i></p>
			<p>URI：<i>/TServer/query/findpointline?coord=</i></p>
			<p><spring:message code="queryDemo.cssm" />：<i><spring:message code="queryDemo.cxzjdlcssm" /></i></p>
			<p>
				<a
					href="/TServer/query/findpointline?coord=121.56854604799,31.138889267909"
					target="_blank"><spring:message code="queryDemo.sl" /></a>
					&nbsp;<a href="/TServer/query/" target="_blank"><spring:message code="queryDemo.zhsl" /></a>
			</p>
		
		</ul>
		<ul id="道路搜索">
			<li><b>4.<spring:message code="search.dlss" />：</b></li>

			<p><spring:message code="queryDemo.js" />：<i><spring:message code="queryDemo.dlssjs" /></i></p>
			<p>URI：<i>/TServer/query/getRoadsByName?roadName=</i></p>
			<p><spring:message code="queryDemo.cssm" />：<i><spring:message code="queryDemo.dlsscssm" /></i></p>
			<p>
				<a
					href="/TServer/query/getRoadsByName?roadName=凤环路"
					target="_blank"><spring:message code="queryDemo.sl" /></a>
					&nbsp;<a href="/TServer/query/" target="_blank"><spring:message code="queryDemo.zhsl" /></a>
			</p>
		
		</ul>
		<ul id="路口搜索">
			<li><b>5.<spring:message code="search.lkss" />：</b></li>

			<p><spring:message code="queryDemo.js" />：<i><spring:message code="queryDemo.lkssjs" /></i></p>
			<p>URI：<i>/TServer/query/getRoadCrossByName?roadName=</i></p>
			<p><spring:message code="queryDemo.cssm" />：<i><spring:message code="queryDemo.lksscssm" /></i></p>
			<p>
				<a
					href="/TServer/query/getRoadCrossByName?roadName=凤环路|长兴江南"
					target="_blank"><spring:message code="queryDemo.sl" /></a>
					&nbsp;<a href="/TServer/query/" target="_blank"><spring:message code="queryDemo.zhsl" /></a>
			</p>
	
		</ul>
		<ul id="POI范围搜索">
			<li><b>6.<spring:message code="search.xqdfwss" />：</b></li>
			<p><spring:message code="queryDemo.js" />：<i><spring:message code="queryDemo.xqdfwssjs" /></i></p>
			<p>URI：<i>/TServer/query/searchInBounds?wkt=&key=&maxResult=&rowIndex=</i></p>
			<p><spring:message code="queryDemo.cssm" />：<i><spring:message code="queryDemo.xqdfwsscssm" /></i></p>
			<p>
				<a
					href="<%=request.getContextPath() %>/query/searchInBounds?wkt=POLYGON((121.37750150329002%2031.139753012255,121.37750150329002%2031.146034789310995,121.39703211921999%2031.146034789311003,121.39703211921999%2031.139753012255,121.37750150329002%2031.139753012255))&key=%E6%9D%91"
					target="_blank"><spring:message code="queryDemo.sl" /></a>
					&nbsp;<a href="/TServer/query/" target="_blank"><spring:message code="queryDemo.zhsl" /></a>
			</p>		
		</ul>
		<ul id="路口范围搜索">
			<li><b>7.<spring:message code="search.lkfwss" />：</b></li>

			<p><spring:message code="queryDemo.js" />：<i><spring:message code="search.lkfwss" /></i></p>
			<p>URI：<i>/TServer/query/searchRoadCrossInBounds?wkt=&key=&maxResult=&rowIndex=</i></p>
			<p><spring:message code="queryDemo.cssm" />：<i><spring:message code="queryDemo.lkfwsscssm" /></i></p>
			<p>
				<a
					href="<%=request.getContextPath() %>/query/searchRoadCrossInBounds?wkt=POLYGON((121.37750150329002%2031.139753012255,121.37750150329002%2031.146034789310995,121.39703211921999%2031.146034789311003,121.39703211921999%2031.139753012255,121.37750150329002%2031.139753012255))&key=路"
					target="_blank"><spring:message code="queryDemo.sl" /></a>
					&nbsp;<a href="/TServer/query/" target="_blank"><spring:message code="queryDemo.zhsl" /></a>
			</p>
		</ul>
		<%-- </ul>
            <ul id="商圈搜索">
            <li>8.商圈搜索:</li>
            <div style="width: 1000px;">
                <p>解释：通过城市编号查询行政区和商圈信息</p>
                <p>URI:/TServer/query/shangquan/forward?areacode=城市编号&business_flag=商圈搜索或行政区搜索</p>
                business_flag=1 为商圈搜索，<br>business_flag=0 为行政区搜索(不包括行政区划面)，搜索全国省时areacode=1，
                如请求行政区划面，请使用/TServer/query/shangquan/getBoundary?areacode=城市编号
                <br>/TServer/query/getCityByName?areaName=城市名称
                <p>
                    <a
                        href="<%=request.getContextPath() %>/query/shangquan/forward?areacode=1&business_flag=0"
                        target="_blank">示例</a>
                        &nbsp;<a href="/TServer/query/" target="_blank">综合DEMO</a>
                </p>
            </div>          
        </ul> --%>
		<ul id="道路兴趣点路口搜索">
			<li><b>8.<spring:message code="search.dllkxqdss" />：</b></li>

			<p><spring:message code="queryDemo.js" />：<i><spring:message code="queryDemo.dllkxqdssjs" /></i></p>
			<p>URI：<i>/TServer/query/getFOIByName?keyWordString=</i></p>
			<p><spring:message code="queryDemo.cssm" />：<i><spring:message code="queryDemo.dllkxqdsscssm" /></i></p>
			<p>
				<a
					href="<%=request.getContextPath() %>/query/getFOIByName?keyWordString=凤环"
					target="_blank"><spring:message code="queryDemo.sl" /></a>
					&nbsp;<a href="/TServer/query/" target="_blank"><spring:message code="queryDemo.zhsl" /></a>
			</p>
		</ul>
		<ul id="多边形和道路交叉点搜索">
			<li><b>9.<spring:message code="search.dbxhdljcdss" />：</b></li>

			<p><spring:message code="queryDemo.js" />：<i><spring:message code="queryDemo.dbxhdljcdssjs" /></i></p>
			<p>URI：<i>/TServer/query/roadInterByGeo?wkt=</i></p>
			<p><spring:message code="queryDemo.cssm" />：<i><spring:message code="queryDemo.dbxhdljcdsscssm" /></i></p>
			<p>
				<a
					href="<%=request.getContextPath() %>/query/roadInterByGeo?wkt=POLYGON((121.37750150329002%2031.139753012255,121.37750150329002%2031.146034789310995,121.39703211921999%2031.146034789311003,121.39703211921999%2031.139753012255,121.37750150329002%2031.139753012255))"
					target="_blank"><spring:message code="queryDemo.sl" /></a>
					&nbsp;<a href="/TServer/query/" target="_blank"><spring:message code="queryDemo.zhsl" /></a>
			</p>
	
		</ul>
		<%-- </ul>
			<ul id="地址查询兴趣点">
			<li>10.地址查询兴趣点:</li>
			<div style="width: 1000px;">
				<p>解释：地址查询兴趣点</p>
				<p>URI:/TServer/query/poiaddr?keyWord=&maxResult=</p>
				keyWord:地址,只支持中文；maxResult:最大行数，默认10
				<p>
					<a
						href="<%=request.getContextPath() %>/query/poiaddr?keyWord=新城区长缨东路17号"
						target="_blank">示例</a>
						&nbsp;<a href="/TServer/query/" target="_blank">综合DEMO</a>
				</p>
			</div>			
		</ul> --%>
		<ul id="区划码查询行政区划">
			<li><b>10.<spring:message code="search.xzqhcx" />：</b></li>
			
			<p><spring:message code="queryDemo.js" />：<i><spring:message code="queryDemo.xzqhcxjs" /></i></p>
			<p>URI：<i>/TServer/query/getRegionalBound?addvcd=</i></p>
			<p><spring:message code="queryDemo.cssm" />：<i><spring:message code="queryDemo.xzqhcxcssm" /></i></p>
			<p>
				<a
					href="<%=request.getContextPath() %>/query/getRegionalBound?addvcd=610100"
					target="_blank"><spring:message code="queryDemo.sl" /></a>
					&nbsp;<a href="/TServer/query/" target="_blank"><spring:message code="queryDemo.zhsl" /></a>
			</p>
					
		</ul>
		<ul id="区划名称查询行政区划">
            <li><b>11.<spring:message code="search.xzqhcx2" />：</b></li>
            
            <p><spring:message code="queryDemo.js" />：<i><spring:message code="queryDemo.xzqhcxjs2" /></i></p>
            <p>URI：<i>/TServer/query/getRegionalBoundByName?name=</i></p>
            <p><spring:message code="queryDemo.cssm" />：<i><spring:message code="queryDemo.xzqhcxcssm2" /></i></p>
            <p>
                <a
                    href="<%=request.getContextPath() %>/query/getRegionalBoundByName?name=西安市"
                    target="_blank"><spring:message code="queryDemo.sl" /></a>
                    &nbsp;<a href="/TServer/query/" target="_blank"><spring:message code="queryDemo.zhsl" /></a>
            </p>
                    
        </ul>
        
        <%-- <ul id="线和道路交点搜索">
            <li><b>12.<spring:message code="search.xhdljcdss" />：</b></li>
            
            <p><spring:message code="queryDemo.js" />：<i><spring:message code="queryDemo.xhdljcdss" /></i></p>
            <p>URI：<i>/TServer/query/roadAndLineIntersection?wkt=</i></p>
            <p><spring:message code="queryDemo.cssm" />：<i><spring:message code="queryDemo.xhdljcdsscssm" /></i></p>
            <p>
                <a
                    href="<%=request.getContextPath() %>/query/roadAndLineIntersection?wkt=西安市"
                    target="_blank"><spring:message code="queryDemo.sl" /></a>
                    &nbsp;<a href="/TServer/query/" target="_blank"><spring:message code="queryDemo.zhsl" /></a>
            </p>
                    
        </ul> --%>
	</div>
	<div>
		<div id="mapId"></div>
	</div>
	<script type="text/javascript">
		var host = '<%=request.getContextPath() %>';
	</script>
</body>
</html>