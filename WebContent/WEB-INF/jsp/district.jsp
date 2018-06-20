<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@taglib prefix="spring" uri="http://www.springframework.org/tags" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">

<link href="/TServer/resources/css/zTreeStyle/zTreeStyle.css" rel="stylesheet" type="text/css" />

<style>

.center {
    position: fixed;
    left: 5%;
    top: 60px;
    width:350px;
    height:800px;
    overflow-y:auto;
}
.button {
    cursor: hand;
    text-align: center;
    font-size: 14px;
    font-weight: bold;
    color: #fff;
    border-radius: 5px;
    margin: 0 0px 0px 0;
    position: relative;
    overflow: hidden;
}

.button.bule {
    width: 100px;
    line-height: 38px;
    border: 1px solid #428bca;
    background: #428bca;
}

.button.green {
    line-height: 30px;
    width: 80px;
    border: 1px solid #5bc0de;
    background: #5bc0de;
}
</style>
<script type="text/javascript" src="/TServer/resources/js/jquery.js"></script>
<script type="text/javascript" src="/TServer/resources/js/jquery.ztree.core-3.5.min.js"></script>

<title><spring:message code="district.bt" /></title>

<script type="text/javascript">
    var zTreeObj;
    
    var ajaxURL = '/TServer/query/getRegionTree';

    var setting = {
        async : {
            enable : true,
            url : ajaxURL,
            autoParam : [ "addvcd" ]
        }
    };

    $(document).ready(function() {
        $.ajax({
            type : "Post",
            url : ajaxURL,
            success : function(data) {
                $.fn.zTree.init($("#districtTree"), setting, data); //加载数据
            },
            error : function(e) {
                alert("获取行政区划数据失败，请刷新页面重新加载！");
            }
        });
        
        
       $("#expandAllBtn").click(function() {
           $.fn.zTree.getZTreeObj("districtTree").expandAll(false);
        });
    });
</script>

</head>
<body>
    <h3><spring:message code="district.bt" /></h3>
    <div class="center">
        <ul id="districtTree" class="ztree"></ul>
    </div>
    
    <input type="button" id="expandAllBtn" name="expandAll" class="button bule" value="<spring:message code="district.qbsq" />" style="margin-left:500px;" >
</body>
</html>