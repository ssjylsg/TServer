package com.netposa.gis.server.utils;

import org.springframework.beans.BeansException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;

import java.util.Locale;

public class SpringUtil implements ApplicationContextAware {
    
    private static ApplicationContext applicationContext;
    
    @Override
    public void setApplicationContext(ApplicationContext arg0) throws BeansException {
        applicationContext = arg0;
    }
    
    public static ApplicationContext getApplicationContext() {
        return applicationContext;
    }
    
    public static String getMessage(String key, Locale locale) {
        return applicationContext.getMessage(key, null, null, locale);
    }

    public static String getMessage(String key, Object[] args, Locale locale) {
        return applicationContext.getMessage(key, args, locale);
    }
}
