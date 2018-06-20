package com.netposa.gis.server.authorization;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.handler.SimpleMappingExceptionResolver;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;

/**
 * 授权认证异常处理
 * @author wj
 *
 */
public class CustomSimpleMappingExceptionResolver extends SimpleMappingExceptionResolver {

	private static final Log LOGGER = LogFactory.getLog(CustomSimpleMappingExceptionResolver.class);
	
	public CustomSimpleMappingExceptionResolver() {

	}

	@Override
	protected ModelAndView doResolveException(HttpServletRequest request, HttpServletResponse response, Object handler,
			Exception ex) {
		String viewName = determineViewName(ex, request);
		if (viewName != null) {// JSP格式返回
			
			if (!(request.getHeader("accept").indexOf("application/json") > -1 || (request
					.getHeader("X-Requested-With") != null && request.getHeader("X-Requested-With").indexOf(
					"XMLHttpRequest") > -1))) {

				// 如果不是异步请求
				Integer statusCode = determineStatusCode(request, viewName);
				if (statusCode != null) {
					applyStatusCodeIfPossible(request, response, statusCode);
				}

				return getModelAndView(viewName, ex, request);
			} else {// JSON格式返回
				response.setHeader("Access-Control-Allow-Origin", "*");
				response.setContentType("text/json;charset=UTF-8");
				response.setCharacterEncoding("UTF-8");
				PrintWriter writer;
				try {
					writer = response.getWriter();
					writer.write("{\"info\":\"没有权限,请确认授权!\",\"success\":false}");
					writer.flush();
				} catch (IOException e) {
				    LOGGER.error(e);
				}

				return null;
			}
		} else {
			return null;
		}
	}

}
