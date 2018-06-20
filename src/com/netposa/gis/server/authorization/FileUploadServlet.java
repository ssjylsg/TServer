package com.netposa.gis.server.authorization;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import javax.servlet.ServletConfig;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.IOException;
import java.util.Iterator;
import java.util.List;

/**
 * 上传授权文件
 */
public class FileUploadServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;
    
    private static final Log LOGGER = LogFactory.getLog(FileUploadServlet.class);
    
    private ServletContext sc;
    private String savePath;
    
    /**
     * @see HttpServlet#HttpServlet()
     */
    public FileUploadServlet() {
        super();
    }
    
    public void init(ServletConfig config) {
        // 在web.xml中设置的一个初始化参数
        savePath = config.getInitParameter("savePath");
        sc = config.getServletContext();
    }
    
    /**
     * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse
     * response)
     */
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        doPost(request, response);
    }
    
    /**
     * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse
     * response)
     */
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException,
            IOException {
        request.setCharacterEncoding("UTF-8");
        DiskFileItemFactory factory = new DiskFileItemFactory();
        ServletFileUpload upload = new ServletFileUpload(factory);
        try {
            List<FileItem> items = upload.parseRequest(request);
            Iterator<FileItem> itr = items.iterator();
            while (itr.hasNext()) {
                FileItem item = (FileItem) itr.next();
                if (!item.isFormField()) {
                    if (item.getName() != null && !"".equals(item.getName())) {
                        
                        File tempFile = new File(item.getName());
                        
                        // 上传文件的保存路径
                        File file = new File(sc.getRealPath("/") + savePath, tempFile.getName());
                        item.write(file);
                        
                        AuthorizationAspect.clearContentMap();
                    } else {
                        LOGGER.error("上传授权失败!");
                    }
                }
            }
        } catch (Exception e) {
            LOGGER.error(e);
        }
        
        response.sendRedirect("/netposa/map/services");
    }
}
