package com.netposa.gis.server.controller;

import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.ModelAndView;

import java.util.Locale;

@Controller
@RequestMapping(value = "/welcome")
public class WelcomeController {

	@RequestMapping(value = "/", method = RequestMethod.GET)
	public ModelAndView index() {

		ModelAndView modelAndView = new ModelAndView("welcome");

		Locale locale = LocaleContextHolder.getLocale();

		modelAndView.addObject("myLocale", locale);

		return modelAndView;
	}
	@RequestMapping(value = "/index")
	public String indexTmap(){
		return "TMap/index";
	}
	
	@RequestMapping(value = "/help")
	public String help(){
		return "TMap/help";
	}
}
