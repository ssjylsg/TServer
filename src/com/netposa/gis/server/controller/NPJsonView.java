package com.netposa.gis.server.controller;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageNotWritableException;
import org.springframework.http.converter.json.MappingJacksonHttpMessageConverter;
import org.springframework.http.server.ServletServerHttpResponse;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@SuppressWarnings("deprecation")
public class NPJsonView {
	private static final Log LOGGER = LogFactory.getLog(NPJsonView.class);
	
	public static ModelAndView render(Object model, HttpServletResponse response) {
		MappingJacksonHttpMessageConverter jsonConverter = new MappingJacksonHttpMessageConverter();

		MediaType jsonMimeType = MediaType.APPLICATION_JSON;

		try {
			jsonConverter.write(model, jsonMimeType,
					new ServletServerHttpResponse(response));
		} catch (HttpMessageNotWritableException | IOException e) {
		    LOGGER.error(e);
		}

		return null;
	}
}
