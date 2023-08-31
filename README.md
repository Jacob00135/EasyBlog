# 一个简单的个人博客网站

## 简介

1. 单用户（即管理员），除管理员外的用户仅可查看文章
2. 用Markdown语法编写博客
3. 可上传图片作为Markdown中的内容，图片将保存在本地
4. 提供明暗两种主题


## 环境配置

1. 下载整个项目代码
2. 安装Python3.9.12（或者其他版本）
3. 以管理员身份运行cmd，然后输入以下指令进入项目根目录：

```cmd
cd 你存放此项目的路径
```

4. 输入以下指令新建一个Python环境，并激活该环境

```cmd
python -m venv venv
venv\Scripts\activate
```

5. 安装以下Python三方库：

```cmd
pip install Flask==2.3.3
pip install Flask-SQLAlchemy==3.0.5
pip install Flask-Login==0.6.2
pip install Flask-Moment==1.0.5
pip install Markdown==3.4.4
```

6. 如果安装这些三方库时速度太慢，或者出现超时错误，可以尝试使用镜像源：

```cmd
pip install Flask==2.3.3 -i https://mirrors.aliyun.com/pypi/simple/
pip install Flask-SQLAlchemy==3.0.5 -i https://mirrors.aliyun.com/pypi/simple/
pip install Flask-Login==0.6.2 -i https://mirrors.aliyun.com/pypi/simple/
pip install Flask-Moment==1.0.5 -i https://mirrors.aliyun.com/pypi/simple/
pip install Markdown==3.4.4 -i https://mirrors.aliyun.com/pypi/simple/
```

## 启动项目

当你配置好环境之后，就可以尝试启动了，你需要编写一个启动脚本，可以使用cmd或者PowerShell等编写。

以cmd为例，新建一个文件start.bat，编写以下内容并保存：

```cmd
set FLASK_APP=app.py
set FLASK_ENV=production
set FLASK_DEBUG=0
set FLASK_ADMIN_USERNAME=admin
set FLASK_ADMIN_PASSWORD=123456
flask run -h 0.0.0.0 -p 5000
```

其中的变量含义为：

- `FLASK_APP`：启动的入口代码文件，不可修改。
- `FLASK_ENV`：启动环境。可选production或development，一般设置为production，development用于开发
- `FLASK_DEBUG`：是否启动调试器，0表示不启动，1表示启动，若不是开发环境请设置为0
- `FLASK_ADMIN_USERNAME`：网站管理员的初始用户名，可自行更改。第一次启动网站时，使用该用户名来登录，登录后可以更改用户名，*用户名被更改过一次后，用此参数设置的用户名将无效*，即使更改此启动参数也无效
- `FLASK_ADMIN_PASSWORD`：网站管理员的初始密码。机制同FLASK_ADMIN_USERNAME
- `flask run -h host -p port`：这一行有host和port两个参数可更改，一般把host设置为0.0.0.0，这样与你的主机处于同一内网的主机就可以访问此网站了，port可以设置1-65535，影响访问网站的地址

然后在***进入项目根目录并且已经激活项目环境的情况下***，在cmd执行start.bat，当你看到输出类似以下信息时，说明启动成功：

```text
 * Serving Flask app 'app.py'
 * Debug mode: off
WARNING: This is a development server. Do not use it in a production deployment. Use a production WSGI server instead.
 * Running on all addresses (0.0.0.0)
 * Running on http://127.0.0.1:5000
 * Running on http://192.168.1.2:5000
Press CTRL+C to quit
```

其中的`http://127.0.0.1:5000`是只有本机才可以访问的网站地址，`http://192.168.1.2:5000`则是同一内网所有主机都可以访问的网站地址

如果使用PowerShell来编写脚本会更简单，可以把进入根目录、激活环境一起完成，例如：

`PowerShell编写的启动脚本start.ps1`

```PowerShell
cd 你的项目存放路径
.\venv\scripts\activate
$env:FLASK_APP="app.py"
$env:FLASK_ENV="production"
$env:FLASK_DEBUG="0"
$env:FLASK_ADMIN_USERNAME="admin"
$env:FLASK_ADMIN_PASSWORD="123456"
flask.exe run -h 0.0.0.0 -p 5000
```
