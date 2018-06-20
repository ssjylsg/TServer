package com.netposa.gis.server.controller;

import com.netposa.gis.server.bean.DataResult;
import com.netposa.gis.server.service.ModelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

/**
 * 模型Controller
 * 
 * @author wj
 * 
 */
@Controller
@RequestMapping(value = "/model")
public class ModelController {

    private ModelService modelService;

    @Autowired
    public void setModelService(ModelService modelService) {
        this.modelService = modelService;
    }

    /**
     * 获取服务config
     * 
     * @param service
     *            名称
     * @return
     */
    @ResponseBody
    @RequestMapping(method = RequestMethod.GET, value = "/{service}/config")
    public String getConfigByName(@PathVariable String service) {
        return this.modelService.getConfigByName(service);
    }

    /**
     * 自定义条件查询指定服务 smid
     * 
     * @param service
     *            服务名称
     * @param condition
     *            自定义条件
     * @return
     */
    @ResponseBody
    @RequestMapping("/listSmidByCondition")
    public DataResult listSmidByCondition(
            @RequestParam(value = "service", required = true, defaultValue = "") String service,
            @RequestParam(value = "condition", required = true, defaultValue = "") String condition) {
        return this.modelService.listSmidByCondition(service, condition);
    }

    /**
     * 根据smid查询模型属性信息
     * @param service 服务名称
     * @param smid 
     * @return
     */
    @ResponseBody
    @RequestMapping("/getModelInfoBySmid")
    public DataResult getModelInfoBySmid(
            @RequestParam(value = "service", required = true, defaultValue = "") String service,
            @RequestParam(value = "smid", required = true, defaultValue = "") String smid) {
        return this.modelService.getModelInfoBySmid(service, smid);
    }
}
