---
title: Docker 容器技术入门
date: '2026-02-02 13:00:00'
banner: 一次构建，到处运行——容器化的魔力
cover: 'https://img1.tucang.cc/api/image/show/8e285f299a0647e688ab53d72605627b'
tags:
  - Docker
  - 容器
  - 虚拟化
  - DevOps
---

你有没有遇到过这种情况：在我的电脑上明明运行得好好的，一到服务器上就各种报错？环境不同、依赖缺失、版本冲突...这些问题是不是让你头秃？别担心，Docker 来拯救你了！

今天我们来聊聊 Docker——这个改变了现代软件开发和部署方式的容器技术。

### Docker vs 虚拟机

在深入 Docker 之前，先来对比一下它和传统虚拟机的区别。

**虚拟机（VM）**
- 模拟完整的操作系统，包括内核
- 每个虚拟机都有独立的 Guest OS
- 资源占用大，启动慢（分钟级）
- 隔离性强，但重量级

**Docker 容器**
- 共享宿主机的内核，只包含应用和依赖
- 没有 Guest OS，轻量级
- 资源占用小，启动快（秒级）
- 隔离性适中，轻量灵活

简单来说，虚拟机是"一栋房子"，而 Docker 容器是"房间里的一个柜子"。前者完整独立，后者轻巧灵活。

### 安装 Docker

**Ubuntu/Debian**

```bash
# 更新包索引
sudo apt update

# 安装必要的依赖
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# 添加 Docker 官方 GPG 密钥
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# 添加 Docker 仓库
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 安装 Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# 验证安装
docker --version
```

**CentOS/RHEL**

```bash
# 安装必要的依赖
sudo yum install -y yum-utils

# 添加 Docker 仓库
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# 安装 Docker
sudo yum install -y docker-ce docker-ce-cli containerd.io

# 启动 Docker
sudo systemctl start docker
sudo systemctl enable docker
```

**macOS / Windows**

直接下载 [Docker Desktop](https://www.docker.com/products/docker-desktop/) 安装即可。

### 镜像与容器概念

Docker 有两个核心概念：

**镜像（Image）**
- 只读模板，包含运行应用所需的一切（代码、运行时、库、配置等）
- 类似于面向对象中的"类"
- 可以被分享和存储

**容器（Container）**
- 镜像的运行实例
- 类似于面向对象中的"对象"
- 可以被启动、停止、删除

```bash
# 关系图示
镜像 (类) → 容器 (对象)
class Person → Person p1 = new Person()
```

### 常用命令

**镜像操作**

```bash
# 搜索镜像
docker search nginx

# 拉取镜像
docker pull nginx:latest
docker pull nginx:1.24        # 拉取特定版本

# 查看本地镜像
docker images
docker image ls

# 删除镜像
docker rmi nginx:latest
docker image rm nginx

# 构建镜像（使用 Dockerfile）
docker build -t myapp:v1.0 .
```

**容器操作**

```bash
# 运行容器
docker run nginx:latest                        # 最简单的运行
docker run -d nginx:latest                     # 后台运行
docker run -d -p 80:80 nginx:latest            # 端口映射（宿主机80→容器80）
docker run -d -p 8080:80 --name mynginx nginx  # 自定义容器名称
docker run -d -v /host/path:/container/path nginx  # 挂载目录

# 查看容器
docker ps              # 查看运行中的容器
docker ps -a           # 查看所有容器（包括已停止的）

# 停止容器
docker stop mynginx
docker kill mynginx    # 强制停止

# 启动已停止的容器
docker start mynginx

# 重启容器
docker restart mynginx

# 删除容器
docker rm mynginx
docker rm -f mynginx   # 强制删除运行中的容器

# 查看容器日志
docker logs mynginx
docker logs -f mynginx  # 实时追踪日志

# 进入容器内部
docker exec -it mynginx /bin/bash
docker exec -it mynginx sh  # 有些容器没有 bash，用 sh
```

### Dockerfile 编写

Dockerfile 是用来构建镜像的文本文件，包含了一系列构建指令。

```dockerfile
# 基础镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制应用代码
COPY . .

# 暴露端口
EXPOSE 3000

# 设置环境变量
ENV NODE_ENV=production

# 启动命令
CMD ["node", "app.js"]
```

**常用指令说明**

| 指令 | 说明 |
|------|------|
| `FROM` | 指定基础镜像 |
| `RUN` | 执行命令（如安装软件） |
| `COPY` | 复制文件到镜像 |
| `ADD` | 类似 COPY，但支持 URL 和自动解压 |
| `WORKDIR` | 设置工作目录 |
| `ENV` | 设置环境变量 |
| `EXPOSE` | 声明容器监听的端口 |
| `CMD` | 容器启动时执行的命令（只有最后一个生效） |
| `ENTRYPOINT` | 容器启动入口点（不会被 CMD 覆盖） |

**构建镜像**

```bash
# 在 Dockerfile 所在目录执行
docker build -t myapp:v1.0 .

# -t: 给镜像打标签
# .: 构建上下文为当前目录
```

### Docker Compose 入门

当你需要同时运行多个容器（如 Web 应用 + 数据库 + 缓存），一个个手动启动太麻烦了。Docker Compose 就是用 YAML 文件定义和运行多容器应用的工具。

```yaml
# docker-compose.yml
version: '3.8'

services:
  # Web 应用
  web:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - db
      - redis
    environment:
      - NODE_ENV=production
      - DB_HOST=db
      - REDIS_HOST=redis
    volumes:
      - ./logs:/app/logs

  # MySQL 数据库
  db:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=secret
      - MYSQL_DATABASE=myapp
    volumes:
      - db-data:/var/lib/mysql
    ports:
      - "3306:3306"

  # Redis 缓存
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data

volumes:
  db-data:
  redis-data:
```

**Docker Compose 常用命令**

```bash
# 启动所有服务（后台运行）
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看服务日志
docker-compose logs
docker-compose logs -f web    # 实时查看 web 服务日志
docker-compose logs --tail=100  # 查看最近 100 行

# 停止所有服务
docker-compose stop

# 停止并删除容器、网络
docker-compose down

# 停止并删除容器、网络、卷
docker-compose down -v

# 重启服务
docker-compose restart

# 进入某个服务的容器
docker-compose exec web sh

# 构建并启动服务
docker-compose up -d --build
```

### 实战案例：部署 Node.js 应用

假设我们有一个简单的 Express 应用：

```javascript
// app.js
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello from Docker!');
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

对应的 `package.json`：

```json
{
  "name": "docker-demo",
  "version": "1.0.0",
  "main": "app.js",
  "scripts": {
    "start": "node app.js"
  },
  "dependencies": {
    "express": "^4.18.0"
  }
}
```

**Dockerfile**

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

**docker-compose.yml**

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    restart: unless-stopped
```

**部署步骤**

```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 访问应用
curl http://localhost:3000
```

### 总结

Docker 通过容器化技术解决了"在我电脑上能跑"的千古难题，它带来的好处：

1. **环境一致性**：开发、测试、生产环境完全一致
2. **快速部署**：秒级启动，快速扩缩容
3. **资源高效**：比虚拟机轻量得多
4. **版本管理**：镜像可以版本化管理
5. **微服务架构**：每个服务独立容器，互不影响

掌握 Docker 是现代后端开发和运维的必备技能。接下来你可以：

- 学习 Docker 网络和存储
- 了解容器编排工具 Kubernetes
- 探索 CI/CD 与 Docker 的结合
- 研究多阶段构建优化镜像大小

相信我，一旦你习惯了容器化开发，就再也回不去传统方式了！
