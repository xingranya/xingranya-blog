---
title: Kubernetes 入门：用最小例子跑通 Deployment/Service
date: "2026-02-06 10:00:00"
banner: 先把核心对象跑通，再谈“云原生”
cover: "https://images.unsplash.com/photo-1652189977368-e9d033e7d3e7?auto=format&fit=crop&w=1600&q=80&ixlib=rb-4.1.0"
categories:
  - 运维技术
tags:
  - Kubernetes
  - K8s
  - 云原生
  - DevOps
---

Kubernetes（K8s）给人的第一印象经常是：概念多、术语多、Yaml 多。但你真正要掌握的“第一关”，其实只需要跑通三个对象：

- **Pod**：容器的运行载体
- **Deployment**：声明式“我要多少副本 + 如何滚动更新”
- **Service**：让访问有一个稳定入口（不怕 Pod IP 变）

![把应用拆成“积木”，再交给编排去拼](https://source.unsplash.com/ZfVyuV8l7WU/1600x900)

### 第一步：先把最小 Deployment 跑起来

下面用一个最常见的示例：跑一个 `nginx`（你也可以换成自己的镜像）。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: demo-nginx
spec:
  replicas: 2
  selector:
    matchLabels:
      app: demo-nginx
  template:
    metadata:
      labels:
        app: demo-nginx
    spec:
      containers:
        - name: nginx
          image: nginx:1.27
          ports:
            - containerPort: 80
```

你能从里面读出三件事：

- `replicas: 2`：要两个副本（其中一个挂了会自动补）
- `selector` 与 `template.labels`：用 label 把 Deployment 和 Pod 对上
- `image`：容器镜像版本最好写死，避免“latest 漂移”

### 第二步：用 Service 给它一个稳定入口

```yaml
apiVersion: v1
kind: Service
metadata:
  name: demo-nginx-svc
spec:
  selector:
    app: demo-nginx
  ports:
    - port: 80
      targetPort: 80
  type: ClusterIP
```

解释一下这几个词：

- **ClusterIP**：集群内部访问（最常用默认值）
- `selector`：把流量送到哪些 Pod（同样靠 label）
- `port/targetPort`：Service 端口 -> Pod 端口

### 第三步：你需要会看的“状态面板”

排障时最常用的几个查看命令（思路比命令更重要）：

- Deployment 是否就绪：副本数对不对、是否在滚动更新
- Pod 是否正常：是否 CrashLoop、是否镜像拉不下来
- Service 是否选到了 Pod：label 对没对上、端口对不对

> 记住：K8s 的很多问题最终都能归到“镜像/配置/权限/网络/存储”五类里。

### 一点点“可上线”的补充（别一上来就写满）

当你能跑通最小例子后，再逐步加：

- **资源限制**：`resources.requests/limits`
- **健康检查**：`livenessProbe/readinessProbe`
- **配置管理**：ConfigMap / Secret
- **外部访问**：Ingress（别一开始就搞，先理解 Service）

### 总结

入门 K8s 最有效的方法是：**把对象数量压到最低**。先跑通 Deployment + Service，你就已经掌握了“声明式 + 自愈 + 稳定入口”的核心价值。

> 封面与配图来自 Unsplash（免费使用授权）。

