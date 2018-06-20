package com.netposa.gis.server.authorization;

import com.netposa.authorization.entities.KeyFileType;
import com.netposa.authorization.exception.AuthorizionException;
import com.netposa.authorization.service.impl.KeyGenerateServiceFactory;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.simple.JSONObject;
import org.springframework.context.ApplicationListener;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.nio.channels.FileChannel;

/**
 * 授权认证
 * 
 * @author wj
 * 
 */
@RequestMapping(value = "/authorization")
@Controller
public class AuthorizationController implements
		ApplicationListener<ContextRefreshedEvent> {
	private static final Log LOGGER = LogFactory
			.getLog(AuthorizationController.class);

	// spring 容器启动后生成gis.key0,并把gis.key0拷贝到部署目录下。linux 系统有效
	@Override
	public void onApplicationEvent(ContextRefreshedEvent event) {
		String os = System.getProperty("os.name").toLowerCase();
		if (os.indexOf("linux") >= 0) {
			try {
				KeyGenerateServiceFactory.getKeyGenerateService()
						.GetNetposaKey1ByLocalFile(KeyFileType.valueOf(9));
			} catch (AuthorizionException e) {
				LOGGER.error(e);// 此异常不予处理
			}

			File sourceFile = this.key0FileGenerator();

			String tomcatPath = System.getProperty("catalina.home");
			int index = tomcatPath.lastIndexOf(File.separator);

			String targetPath = tomcatPath.substring(0, index) + File.separator
					+ "gis.key0";
			File targetFile = new File(targetPath);

			this.nioTransferCopy(sourceFile, targetFile);
		}
	}

	/**
	 * 访问界面没有授权处理
	 * 
	 * @return
	 */
	@RequestMapping("/authorization")
	public String forwardAuthorization() {
		return "authorization";
	}

	/**
	 * 没有授权的情况下请求接口处理
	 * 
	 * @param response
	 * @return
	 */
	@ResponseBody
	@RequestMapping("/noAuthorization")
	public JSONObject noAuthorizationForInterface(HttpServletResponse response) {
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

	/**
	 * 生成 gis.key0 并下载
	 * 
	 * @param response
	 */
	@RequestMapping("/key0Generator")
	public void key0Generator(HttpServletResponse response) {
		response.setContentType("application/octet-stream");
		response.setHeader("Content-Disposition",
				"attachment; filename=gis.key0");
		response.setCharacterEncoding("UTF-8");

		try {
			try {
				KeyGenerateServiceFactory.getKeyGenerateService()
						.GetNetposaKey1ByLocalFile(KeyFileType.valueOf(9));
			} catch (AuthorizionException e) {
				LOGGER.error(e);// 此异常不予处理
			}

			File file = key0FileGenerator();
			if (file != null && file.exists()) {
				ByteArrayOutputStream baos = AuthorizationUtil.readFile(file);
				ServletOutputStream out = response.getOutputStream();
				out.write(baos.toByteArray());
				out.flush();
			} else {
				LOGGER.error("生成 gis.key0 失败!");
			}

		} catch (IOException e) {
			LOGGER.error(e);
		}

	}

	// 根据生成的gis.key0创建File
	private File key0FileGenerator() {
		String os = System.getProperty("os.name").toLowerCase();
		String javaHome = null;

		if (os.indexOf("linux") >= 0) {
			javaHome = System.getProperty("java.home");
			javaHome = javaHome.substring(0, javaHome.lastIndexOf("jre") - 1);
		}
		if (os.indexOf("windows") >= 0) {
			javaHome = System.getenv("JAVA_HOME");
		}

		File file = new File(javaHome + File.separator + "bin" + File.separator
				+ "gis.key0");
		if (!file.exists()) {
			if (os.indexOf("linux") >= 0) {
				javaHome = System.getProperty("java.home");
				return new File(javaHome + File.separator + "bin"
						+ File.separator + "gis.key0");
			}
		}
		return file;
	}

	private void nioTransferCopy(File source, File target) {
		FileChannel in = null;
		FileChannel out = null;
		FileInputStream inStream = null;
		FileOutputStream outStream = null;
		try {
			inStream = new FileInputStream(source);
			outStream = new FileOutputStream(target);
			in = inStream.getChannel();
			out = outStream.getChannel();
			in.transferTo(0, in.size(), out);
		} catch (IOException e) {
			LOGGER.error(e);
		} finally {
			try {
				if (inStream != null) {
					inStream.close();
				}

				if (in != null) {
					in.close();
				}

				if (outStream != null) {
					outStream.close();
					out.close();
				}

			} catch (IOException e) {
				LOGGER.error(e);
			}
		}
	}

}
