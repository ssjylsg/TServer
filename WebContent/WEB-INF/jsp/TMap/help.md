服务器的启动/停止
发送反馈

TServer 作为一个 Web 应用可以部署到多种 Web 服务器中，TServer 默认部署在自带的 Tomcat 中，启动 Tomcat 就能够启动 TServer，并同时启动 TServer 所提供的服务。

在 %TServer_HOME%/bin 目录下，提供了启动/停止 TServer 服务器的批处理文件：

startup.bat：在 Windows 系统下启动 TServer 服务器
startup.sh：在 Linux 系统下启动 TServer 服务器
shutdown.bat：在 Windows 系统下停止 TServer 服务器
shutdown.sh：在 Linux 系统下停止 TServer 服务器
此外，在 %TServer_HOME%/bin 目录下提供了 startup.bat/startup.sh 来启动和调试 TServer，用法如下：

用法:  TServer [选项]

选项:

        -start              启动 TServer

        -stop               停止 TServer

        -v / -version    显示 TServer 的版本信息，包含所用的 JRE/TServer iObjects Java 等参数信息

        -help               显示帮助

在 Windows 平台下使用 setup 安装包安装 TServer 后，您在开始菜单中也可以找到 TServer 启动/停止的快捷方式（以 Windows XP 系统为例）：

开始 → 程序 → TMap → TServer → 启动 TServer 服务
开始 → 程序 → TMap → TServer → 停止 TServer 服务
 

TServer 服务器启动后，会自动发布默认的 GIS 服务。访问管理服务页面（本机）：http://localhost:8080/TServer/admin/，即可进行服务管理；访问 http://localhost:8080/TServer/services/（本机），即可查看 TServer 服务器默认发布的所有 GIS 服务列表。（iExpress 不提供示范GIS服务，首次启动服务列表界面时，服务列表为空。）

TServer 提供了服务器非正常关闭时自动重启功能，及系统配置文件中控制该功能是否开启的<restartWhenCrash>参数。

高级配置
以 Windows 服务的方式启动 TServer
除了上述方式启动/停止 TServer 服务外，还可以通过 Windows 服务的方式来启动/停止 TServer，当然首先需要将 Tomcat 注册为 Windows 服务。详细步骤请参考以 Windows 服务的方式启动 TServer

指定配置文件目录启动 TServer
TServer 支持指定配置目录启动。配置目录包含了 TServer 中的所有配置信息。非 war 包中，默认的配置目录位于 %TServer_HOME%/webapps/TServer/WEB-INF（不含 lib），war 包中，默认的配置目录位于 %TServer 服务目录%/WEB-INF（不含 lib）。

高级用户启动时，可设置名为 TServer.config 的 Java 虚拟机参数类指定 TServer 配置目录的位置，例如在 windows 下运行如下命令启动：

set JAVA_OPTS=%JAVA_OPTS% -DTServer.config="D:/WEB-INF1"

startup.bat

即可使用“D:/WEB-INF1”目录包含的配置文件部署 TServer。

在 Tomcat 中，可使用如下命令来同时定制 Tomcat 的 server.xml 和 TServer 的配置文件：

启动：

set JAVA_OPTS=%JAVA_OPTS% -DTServer.config="D:/WEB-INF1"

startup.bat -config="D:/server1.xml"

停止：

shutdown.bat -config="D:/server1.xml"

  设置监控进程通信端口号
TServer 支持指定守护进程与主进程间通信端口号。并提供两种方式设置：

修改 setenv.sh/setenv.bat

打开【TServer 根目录】\bin\setenv.sh（Linux）或 setenv.bat（Windows），添加如下内容：

set com.supermap.server.mainprocessport=8091

set com.supermap.server.daemonprocessport=8092

修改 TServer-system.xml

打开【TServer 根目录】\webapps\TServer\WEB-INF\TServer-system.xml，在<properties>中添加：

```
    <daemonprocessport>8092</daemonprocessport>  

    <mainprocessport>8091</mainprocessport>
```

配置完成后如下：

```
 <properties> 
    <outputPath>../../webapps/{contextPath}/output</outputPath>  
    <outputSite>http://{ip}:{port}/{contextPath}/output/</outputSite>  
    <realspaceCacheAccessKey>70 39 -37 -116 -91 105 73 111 -71 90 -24 -17 -115 80 -56 -17</realspaceCacheAccessKey>  
    <realspaceSecurityEnabled>true</realspaceSecurityEnabled>  
    <envCheckEnabled>true</envCheckEnabled>  
    <daemonprocessport>8092</daemonprocessport>  
    <mainprocessport>8091</mainprocessport> 
  </properties>
  ```