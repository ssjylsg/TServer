package com.netposa.gis.server.authorization;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;

public class AuthorizationUtil {

	/**
	 * 读取file
	 * @param file
	 * @return
	 * @throws IOException
	 */
	public static final ByteArrayOutputStream readFile(File file) throws IOException {
		FileInputStream fis = null;
		ByteArrayOutputStream baos = null;
		try {
			fis = new FileInputStream(file);
			baos = new ByteArrayOutputStream();
			int cnt;
			byte[] buffer = new byte[1024];
			while ((cnt = fis.read(buffer)) > 0) {
				baos.write(buffer, 0, cnt);
			}
		} finally {
			if (fis != null) {
				fis.close();
			}
		}

		return baos;
	}
}
