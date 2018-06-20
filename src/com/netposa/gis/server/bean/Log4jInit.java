package com.netposa.gis.server.bean;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.log4j.PropertyConfigurator;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.Properties;

public class Log4jInit extends HttpServlet {

	private static final long serialVersionUID = 1L;
	
	private static final Log logger = LogFactory.getLog(Log4jInit.class);

	public void init(ServletConfig config) throws ServletException {
		String prefix = config.getServletContext().getRealPath("/");
		String fileStr = config.getInitParameter("log4j");
		String filePath = prefix + fileStr;

		String logPath = getLogDir(prefix);
		
		try (FileInputStream istream = new FileInputStream(filePath)) {
			Properties props = new Properties();
			props.load(istream);

			props.setProperty("log4j.appender.error.File", logPath);
			PropertyConfigurator.configure(props);
		} catch (IOException e) {
			logger.error(e);
		}
	}

	private String getLogDir(String path) {
		int nIndex = path.indexOf("netposa");
		String tempPath = path.substring(0, nIndex);
		File file = new File(tempPath);
		file = new File(file.getParent());
		return file.getParent() + "/netposa-logs/errors.log";
	}
}
