package com.netposa.gis.server.authorization;

import com.netposa.authorization.entities.KeyFileContents;
import com.netposa.authorization.entities.KeyFileType;
import com.netposa.authorization.exception.AuthorizionException;
import com.netposa.authorization.service.IKeyGenerateService;
import com.netposa.authorization.service.impl.KeyGenerateServiceFactory;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.ResponseBody;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.lang.reflect.Method;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * 授权认证处理
 * 
 * @author wj
 * 
 */
@Component
@Aspect
public class AuthorizationAspect {

	private static final Log LOGGER = LogFactory.getLog(AuthorizationAspect.class);

	private static final String ACCESS_DENIED_MSG = "没有权限,请确认授权!";

	// 授权时间为-1时表示永久有效
	private static final long INVALID_UTC_MSEL = -1;

	// 缓存解析的认证信息,不用每次都解析
	private static Map<String, Object> contentsMap = new HashMap<>();
	private static final String CONTENTS_KEY = "contents";
	private static final String VALIDTIME_KEY = "validTime";

	// 授权认证处理
	@Before("execution(* com.netposa.gis.server.controller.*.*(..))")
	public void checkAuthorization(JoinPoint jp) {
	
		if(System.getProperty("netposaDebug") != null && System.getProperty("netposaDebug").equals("true")){
			return;
		}
		
		Method soruceMethod = getSourceMethod(jp);

		if (soruceMethod != null) {
			ResponseBody responseBody = soruceMethod
					.getAnnotation(org.springframework.web.bind.annotation.ResponseBody.class);
			/*
			 * 1.判断授权文件是否存在 2.授权文件能正确解析 3.判断授权日期是否过期
			 */
			if (!contentsMap.isEmpty() && contentsMap.containsKey(CONTENTS_KEY)
					&& contentsMap.containsKey(VALIDTIME_KEY)) {
				long validTime = (long) contentsMap.get(VALIDTIME_KEY);

				if (verifyValidTime(validTime)) {
					return;
				} else {
					contentsMap.clear();
				}
			} else {
				if (parseAuthorizationFile(responseBody)) {
					return;
				}
			}

			if (responseBody != null) {
				throw new AccessDeniedForJsonException(ACCESS_DENIED_MSG);
			} else {
				throw new AccessDeniedForViewException(ACCESS_DENIED_MSG);
			}
		}
	}
	
	// 清空授权缓存
    public static void clearContentMap() {
        if (!contentsMap.isEmpty()) {
            contentsMap.clear();
        }
    }

	// 解析授权文件，授权正确则按正常流程处理，授权不正确则根据情况跳转到授权界面或者提示没有授权信息
	private boolean parseAuthorizationFile(ResponseBody responseBody) {
		boolean isEffective = false;
		String path = Thread.currentThread().getContextClassLoader().getResource("/").getPath();
		int nIndex = path.indexOf("netposa");
		
        String keyPath = path.substring(0, nIndex) + File.separator + "netposa" + File.separator + "license"
                + File.separator + "gis.key1";

		File keyFile = new File(keyPath);
		if (keyFile.exists()) {
			try {
				IKeyGenerateService service = KeyGenerateServiceFactory.getKeyGenerateService();
				ByteArrayOutputStream baos = readLicense(keyFile);

				KeyFileContents contents = service.GetNetposaKey1ByMemoryData(KeyFileType.KFT_GIS_KEY1,
						baos.toByteArray());

				long validTime = contents.getValidTime();

				isEffective = verifyValidTime(validTime);
				
				if (isEffective) {
					contentsMap.put(CONTENTS_KEY, contents);
					contentsMap.put(VALIDTIME_KEY, validTime);
				}
			} catch (IOException | AuthorizionException e) {
			    LOGGER.error(e);
				if (responseBody != null) {
					throw new AccessDeniedForJsonException(ACCESS_DENIED_MSG);
				} else {
					throw new AccessDeniedForViewException(ACCESS_DENIED_MSG);
				}
			}

		} else {
		    LOGGER.error(ACCESS_DENIED_MSG);
		}
		return isEffective;
	}

	// 验证使用时间
    private boolean verifyValidTime(long validTime) {
        boolean isEffective = false;

        if (validTime == INVALID_UTC_MSEL) {
            isEffective = true;
        } else {
            Date currnetDate = new Date();
            long currentTime = currnetDate.getTime();
            if (currentTime <= validTime) {
                isEffective = true;
            }
        }

        return isEffective;
    }

	// 获取目标类连接点对象
	private Method getSourceMethod(JoinPoint jp) {
		Method proxyMethod = ((MethodSignature) jp.getSignature()).getMethod();

		try {
			return jp.getTarget().getClass().getMethod(proxyMethod.getName(), proxyMethod.getParameterTypes());
		} catch (NoSuchMethodException | SecurityException e) {
		    LOGGER.error(e);
		}

		return null;
	}

	// 读取授权文件 gis.key1
	private ByteArrayOutputStream readLicense(File file) throws IOException {
		return AuthorizationUtil.readFile(file);
	}

}
