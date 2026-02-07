---
title: Nginx 反向代理与负载均衡：从入门到可上线
date: "2026-02-06 09:00:00"
banner: 配对转发、缓存、健康检查，一套配置吃遍常见场景
cover: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1600&q=80&ixlib=rb-4.1.0"
categories:
  - 运维技术
tags:
  - Nginx
  - 反向代理
  - 负载均衡
  - 网站部署
---

如果说“部署”是把服务跑起来，那么“上线”就是：**稳定、可扩展、可回滚**。Nginx 反向代理和负载均衡，基本是这一关的必修课。

这篇不重复宝塔面板那种“点点点部署”，而是把你最常用的 Nginx 核心能力用**可直接复用**的配置串起来。

![网络转发的本质：连接、路由与队列](https://images.unsplash.com/photo-1691435828932-911a7801adfb?auto=format&fit=crop&w=1600&q=80&ixlib=rb-4.1.0)

### 反向代理到底做了什么

用户访问：

```
浏览器 -> Nginx(入口) -> 后端服务(应用)
```

你得到的好处：

- **统一入口**：一个域名多服务/多端口整合
- **隔离后端**：后端不暴露公网
- **抗压**：缓存、限流、连接复用
- **扩展**：后端可水平扩容做负载均衡

### 最常用的反向代理模板

```nginx
server {
  listen 80;
  server_name example.com;

  location / {
    proxy_pass http://127.0.0.1:3000;

    # 真实客户端 IP
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    # 超时（按业务调整）
    proxy_connect_timeout 3s;
    proxy_read_timeout 60s;
    proxy_send_timeout 60s;
  }
}
```

### WebSocket / SSE：别忘了升级头

如果你有 WebSocket（或某些框架的实时能力），需要：

```nginx
location /ws/ {
  proxy_pass http://127.0.0.1:3000;
  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "upgrade";
}
```

### 负载均衡：upstream 三种常用策略

```nginx
upstream api_backend {
  # 1) 轮询（默认）
  server 10.0.0.11:3000;
  server 10.0.0.12:3000;

  # 2) 权重（某台机器更强）
  # server 10.0.0.13:3000 weight=2;

  # 3) 最少连接（长连接/耗时请求更适合）
  # least_conn;
}

server {
  listen 80;
  server_name api.example.com;

  location / {
    proxy_pass http://api_backend;
  }
}
```

### 健康与故障转移：让“坏节点”自动下线

Nginx 开源版虽然没有“主动健康检查”，但你可以用被动方式显著改善：

```nginx
upstream api_backend {
  server 10.0.0.11:3000 max_fails=3 fail_timeout=10s;
  server 10.0.0.12:3000 max_fails=3 fail_timeout=10s;
}
```

含义：

- `max_fails`：连续失败次数到达就认为该节点暂时不可用
- `fail_timeout`：在这个窗口里先不再尝试该节点

### 静态资源缓存：把压力从后端挪走

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|svg|webp|ico)$ {
  expires 30d;
  add_header Cache-Control "public, max-age=2592000";
}
```

如果你是前后端分离，建议把静态文件交给 Nginx（或 CDN），后端只做 API。

### 基础限流：先保命，再谈体验

```nginx
limit_req_zone $binary_remote_addr zone=api_ratelimit:10m rate=10r/s;

server {
  location /api/ {
    limit_req zone=api_ratelimit burst=20 nodelay;
    proxy_pass http://api_backend;
  }
}
```

### 上线前必做的 4 件事

- **配置检查**：`nginx -t`
- **灰度/回滚**：保留上一份配置，reload 失败能快速恢复
- **日志可用**：access/error 日志路径、格式、切割策略
- **超时合理**：避免后端“卡死”拖垮连接池

### 总结

你可以把 Nginx 当成“流量调度器”：把正确的请求送到正确的后端，并在入口层尽可能把风险挡住（缓存、限流、超时、故障隔离）。

> 封面与配图来自 Unsplash（免费使用授权）。

