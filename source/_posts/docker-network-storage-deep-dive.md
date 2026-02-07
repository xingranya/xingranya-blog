---
title: Docker 网络与存储进阶：容器不“迷路”
date: "2026-02-06 09:30:00"
banner: 端口映射、网络驱动、volume，一次讲透最常踩的坑
cover: "https://img1.tucang.cc/api/image/show/d25e016ab6b1f524fa9910db3d932e3b"
categories:
  - 运维技术
tags:
  - Docker
  - 容器
  - 网络
  - 存储
---

你用 Docker 跑起来一个服务很容易，但一旦要“连数据库”“挂数据盘”“多容器互通”，问题就开始出现：端口怎么映射才对？容器之间怎么互相访问？数据放哪才不会一删容器就没了？

这篇把 Docker 的网络与存储做一次“从能用到好用”的梳理，重点解决：**能解释、能排查、能避免坑**。

![容器的隐喻：装得下，也要运得稳](https://images.unsplash.com/photo-1758146296671-0e46a91739a8?auto=format&fit=crop&w=1600&q=80&ixlib=rb-4.1.0)

### 先把最常见的 3 个误解掰正

- **误解 1：`-p 80:80` 是“把容器端口改成 80”**  
  实际上它是：把宿主机的 80 端口转发到容器的 80。
- **误解 2：容器 IP 是固定的**  
  默认不是。容器重建后 IP 可能变化，所以不要写死容器 IP。
- **误解 3：数据写在容器里就行**  
  容器层是可丢弃的。数据应该放到 **volume/bind mount**。

### Docker 网络：你真正需要记住的就这几条

#### 1) 默认网络（bridge）适合大多数单机服务

```bash
# 看网络列表
docker network ls

# 看容器网络信息
docker inspect <容器名或ID>
```

bridge 网络下：

- 宿主机有一张虚拟网桥（常见是 `docker0`）
- 容器拿到一个私有 IP
- 容器之间可以互通（同一网络）

#### 2) 让“容器名”变成 DNS：自定义网络

最推荐的姿势是：**创建一个自定义 bridge 网络**，这样容器之间可以用名字互相访问。

```bash
docker network create mynet

docker run -d --name redis --network mynet redis:7
docker run -d --name api --network mynet -p 8080:8080 my-api:latest
```

此时 `api` 容器里访问 `redis:6379` 就能通（不用写 IP）。

#### 3) `host` 网络：性能更直接，但隔离更弱

```bash
docker run --network host nginx:latest
```

特征：

- 容器直接使用宿主机网络栈
- 不需要 `-p` 映射
- 适合少数对网络性能/端口映射复杂度极敏感的场景

#### 4) overlay 网络：跨主机（Swarm/K8s 里更常见）

单机学习阶段你知道它的存在即可：**跨主机互联一般交给编排层**。

### Docker 存储：容器里写数据的正确姿势

#### 1) 三种常用方式对比

| 方式 | 写法 | 适合场景 | 特点 |
| --- | --- | --- | --- |
| Named Volume | `-v data:/var/lib/mysql` | 数据库、持久化数据 | Docker 管理，迁移方便 |
| Bind Mount | `-v /host/path:/app/data` | 本地开发、明确目录 | 宿主机强绑定，权限要小心 |
| tmpfs | `--tmpfs /tmp` | 临时文件、缓存 | 内存里，重启即丢 |

#### 2) 推荐：数据库一律用 Named Volume

```bash
docker volume create mysql-data

docker run -d --name mysql \
  -e MYSQL_ROOT_PASSWORD=secret \
  -v mysql-data:/var/lib/mysql \
  -p 3306:3306 \
  mysql:8
```

好处：

- 不跟宿主机具体路径耦合
- `docker volume` 可以统一管理与备份

#### 3) 最常见的坑：权限与用户

容器内进程可能不是 root，挂载宿主机目录时容易遇到“写不进去”。

排查思路：

- 看容器内进程用户：是否需要 `user:` 指定 UID/GID
- 宿主机目录权限：是否给到了对应 UID 写权限
- SELinux/AppArmor（部分发行版）是否限制挂载写入

### 用 Compose 把网络与存储写“成体系”

```yaml
services:
  redis:
    image: redis:7
    networks: [mynet]

  api:
    image: my-api:latest
    ports:
      - "8080:8080"
    environment:
      - REDIS_HOST=redis
    networks: [mynet]

networks:
  mynet:
    driver: bridge
```

Compose 的核心价值是：把“运行姿势”固化成文件，避免手工命令越来越长。

### 总结

- **网络**：优先自定义 bridge 网络，用“容器名当 DNS”解决互联问题
- **存储**：需要持久化的数据，优先用 named volume（尤其数据库）
- **排查**：`docker inspect` 是你最强的“事实来源”

> 封面与配图来自 Unsplash（免费使用授权）。

