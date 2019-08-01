
## 如何部署项目

首先 clone 项目。

```bash
git clone https://github.com/fy0/Icarus.git
```

下面逐项照做即可。

迫于前端安装node_modules等待时间长，在环境安装完成后，前端篇和后端篇可以一起做，以节省时间。


## 环境依赖篇

### 1. Python 3.6+

Windows上直接使用Anaconda3或者官方版本。

Linux上部分发行版（例如ArchLinux）天然满足要求。

对于自带Python在3.6以下的发行版，可以通过`pyenv`来安装和管理不同版本的Python：

```bash
curl -L https://github.com/pyenv/pyenv-installer/raw/master/bin/pyenv-installer | bash

# 在终端输入以下命令
pyenv update
pyenv install 3.6
# 此时会告诉你能够安装的3.6.x小版本，安装最新的一个就可以了
# 注意安装时间会有点长，这里是下载源码包进行编译的，下载源码包慢有办法解决
# 搜一下就好了，这里不赘述。编译安装慢请耐心等待（注意编译时没有回显，只是CPU占用很高）
pyenv install 3.6.x
# 最后切换到 python 3.6 环境
pyenv local 3.6.x
```

参考自：https://github.com/pyenv/pyenv

或者使用包管理器安装，这是一个 Debian/Ubuntu 解决方案：

```bash
sudo add-apt-repository ppa:deadsnakes/ppa
sudo apt-get update
sudo apt-get install -y python3.6 python3.6-dev python3.6-venv
sudo su -c "curl https://bootstrap.pypa.io/get-pip.py | python3.6"
```


### 2. NodeJS

建议使用LTS版本的 nodejs，通过包管理器安装。官方参考文档：

https://nodejs.org/en/download/package-manager/

Ubuntu apt安装，执行以下命令：

```bash
curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
sudo apt-get install -y nodejs
```

Centos/RH
```bash
curl -sL https://rpm.nodesource.com/setup_10.x | bash -
```

### 3. PostgreSQL

官方提供了一系列操作系统的安装解决方案：https://www.postgresql.org/download/

Windows下你可以下载安装包，主流Linux可以使用包管理器添加软件源。

还是以ubuntu举例：https://www.postgresql.org/download/linux/ubuntu/

```bash
# 为 ubuntu 18.04 添加 PG 源
sudo su -c "echo 'deb http://apt.postgresql.org/pub/repos/apt/ bionic-pgdg main' > /etc/apt/sources.list.d/pgdg.list"
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | \
  sudo apt-key add -
sudo apt-get update

# 安装PostgreSQL，需要9.6以上版本
sudo apt-get install -y postgresql-11
```

装好之后做一些配置
```bash
sudo su postgres
psql
# 进入 PQ Shell
CREATE DATABASE icarus;
CREATE USER icarus WITH PASSWORD 'IcaruStest123';
GRANT ALL ON DATABASE icarus TO icarus;
\c icarus;
CREATE EXTENSION IF NOT EXISTS hstore;
CREATE EXTENSION IF NOT EXISTS citext;
```

### 4. Redis

一般直接使用包管理器安装就可以了。

Windows上可以使用[微软提供的二进制版本](https://github.com/MicrosoftArchive/redis/releases)


## 后端篇

建议使用 pipenv 进行部署，首先切到backend目录，执行：

```bash
# 首先记得用pipenv切到3.6环境
sudo pip install pipenv
pipenv install
```

不过有个问题就是 pipenv 太慢，总是在 Locking。

可以灵活使用 `--skip-lock` 参数跳过 Locking 阶段。

> 特别地，在Windows上安装aioredis库时可能会遇到依赖的hiredis包无法安装的问题  
> 如果是anaconda用户，那么可以使用：  
> ```bash
> conda config --append channels conda-forge  
> conda install hiredis
> ```  
> 来进行安装。  
> 如果不是anaconda用户，那么可以直接访问
> https://anaconda.org/conda-forge/hiredis/files  
> 直接下载.tar.bz2压缩包把里面的site-packages/hiredis解压出来放到自己的site-packages即可


环境装完之后，这样启动服务：
```bash
pipenv shell
python main.py
```

运行 backend 目录下的 `main.py`，初次运行会创建自动 `private.py` 并退出。

`private.py` 里的内容会覆盖 `config.py` 中的配置。

在初次创建后，用编辑器打开，逐项对内容进行修改，使其符合你机器的实际情况即可。


## 前端篇

```bash
# 安装项目依赖
cd Icarus
npm install
```

如果只是开发环境下看看效果，那么在后端已经跑起来的情况下：
```bash
npm run serve
```
然后在浏览器中查看即可。

如果需要部署，那么请参考下一节。

## 扩展篇：配置 Nginx

如果需要配置外部访问（注意！只是开发则不需要），可以按如下步骤操作：

我们的目标是将前端挂在某个域名或端口上，然后将后端挂在同一域名的`/api`下。

以此直接绕过同源策略的相关内容，简化配置。这也就是“单端口方案”的含义。

首先，在 Icarus 目录下新建一个 private.js，并按照下例进行填写：

```js
var host = '127.0.0.1:9999' // 服务端渲染访问的本地后端地址

if (process.browser) {
    // 浏览器中API访问的后端地址
    host = window.location.host
}

export default {
    remote: {
        API_SERVER: 'http://' + host,
        WS_SERVER: 'ws://' + host + '/ws'
    }
}
```

```bash
npx nuxt build
npx nuxt start
```

随后是nginx的配置，当然你要首先安装它。

我已经写好了配置文件的模板，只要简单改改放进配置目录就可以了。

这里使用的是单端口绑定前后端，整站使用 9001 向外网提供服务。

```bash
sudo apt install nginx
cd Icarus
sudo cp misc/icarus.conf /etc/nginx/conf.d/
```

随后编辑 /etc/nginx/conf.d/icarus.conf，将
```
# root /home/{user}/Icarus/dist;
```
修改为正确的路径，重启服务：

```bash
sudo service nginx restart
```

访问服务器IP的9001端口，就可以看到最上面截图中的画面了。

第一个注册的用户将自动成为管理员。


## 扩展篇：开启全文搜索与关联推荐功能

这事情简单，首先在机器上安装ES：

https://www.elastic.co/downloads/elasticsearch

然后搞到中文分词插件：

https://github.com/medcl/elasticsearch-analysis-ik/releases

并将分词插件解压在ES插件目录，例如`your-es-root/plugins/ik`，然后把ES开起来：

```bash
# 超低配版，最小内存256M，最大1G
# 根据自己服务器情况酌情调整参数
cd elasticsearch-6.5.1
ES_JAVA_OPTS="-Xms256m -Xmx1g" ./bin/elasticsearch
```

请注意两者版本需要一一对应，如果ES版本过新（更新非常频繁），后者可能尚未来得及更新。

随后在第一次执行`main.py`自动生成的`private.py`中修改这一段的内容：

```python
SEARCH_ENABLE = False
ES_INDEX_NAME = 'icarus-index'
ES_HOSTS = [{
    "host": "localhost",
    "port": 9200
}]
```

最省事可以只改一个：
```python
SEARCH_ENABLE = True
```

然后在backend目录下运行：
```bash
pipenv shell
python3.6 misc/force_refresh_elasticsearch.py
```

完成，重启后端进程`main.py`即可应用。
