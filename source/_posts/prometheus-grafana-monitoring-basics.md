---
title: Prometheus + Grafana：搭一套“看得见”的监控
date: "2026-02-06 10:30:00"
banner: 指标、告警、仪表盘——把服务状态从“玄学”变成数字
cover: "https://img1.tucang.cc/api/image/show/186a25ffafe5bb6c3c6daae3916f6c55"
categories:
  - 运维技术
tags:
  - Prometheus
  - Grafana
  - 监控
  - 可观测性
---

没有监控的服务就像“闭眼开车”：平时可能没事，一出事就全靠猜。Prometheus + Grafana 是最常见的一套开源监控组合，适合从个人服务器到中小规模集群。

这篇不追求把所有细节讲满，而是先帮你建立一套清晰的骨架：**指标从哪来 → 怎么存 → 怎么看 → 什么时候告警**。

![把曲线画出来，你就不再靠感觉排障](https://images.unsplash.com/photo-1695668548342-c0c1ad479aee?auto=format&fit=crop&w=1600&q=80&ixlib=rb-4.1.0)

### Prometheus 解决的是什么问题

Prometheus 是“拉取式”的指标系统：

- 目标（Exporter/应用）暴露 `/metrics`
- Prometheus 定期抓取（scrape）并存储
- 用 PromQL 查询，再交给 Grafana 可视化

它最擅长：

- 时序指标（CPU、内存、请求量、延迟、错误率）
- 告警（比如错误率持续 5 分钟超过阈值）

### 先记住 4 个最常用指标维度

做服务监控时，最推荐从这四类开始（够用且通用）：

- **流量**：QPS/吞吐
- **错误**：5xx、业务失败率
- **延迟**：P50/P90/P99
- **饱和度**：CPU、内存、磁盘、连接池、队列长度

### Exporter：指标从哪来

常见三件套：

- **node_exporter**：机器 CPU/内存/磁盘/网络
- **blackbox_exporter**：探活（HTTP/TCP/ICMP）
- **应用指标**：你自己的服务暴露业务指标（更重要）

### PromQL：你不需要背，但要会读

几个“读得懂就够用”的例子：

```promql
# 1) 主机 CPU 使用率（示意，实际按 exporter 指标调整）
100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# 2) 请求量（QPS）
sum(rate(http_requests_total[1m]))

# 3) 错误率（5xx / 总请求）
sum(rate(http_requests_total{status=~"5.."}[5m]))
/
sum(rate(http_requests_total[5m]))
```

你会发现 PromQL 就是在做两件事：

- `rate()`：把计数器变成“每秒增长”
- `sum/avg by (...)`：按维度聚合

### 告警：别“每次都响”，要“该响才响”

一个典型告警应该满足：

- **有持续时间**（比如 5 分钟持续异常，避免抖动）
- **能定位责任方**（哪个实例、哪个接口、哪个机房）
- **有处理建议**（最好能在告警里带排查链接）

示例（概念示意）：

```yaml
groups:
  - name: api-alerts
    rules:
      - alert: High5xxRate
        expr: |
          (
            sum(rate(http_requests_total{status=~"5.."}[5m]))
            /
            sum(rate(http_requests_total[5m]))
          ) > 0.02
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "5xx 错误率持续升高"
          description: "过去 5 分钟 5xx > 2%，请检查上游依赖、最近发布与错误日志。"
```

### Grafana：把“看曲线”变成“看故事”

建议先做 3 张仪表盘（少而精）：

- **主机概览**：CPU/内存/磁盘/网络（node_exporter）
- **服务概览**：QPS/错误率/延迟（RED 指标）
- **依赖概览**：数据库/缓存/消息队列的关键指标

### 总结

监控不是“装了就有用”，而是你要用它回答问题：

- 现在系统健康吗？
- 哪个维度开始恶化？
- 恶化到什么程度，该不该告警？

先把最小可用的监控建起来，再逐步加深，你的排障效率会提升一个档次。

> 封面与配图来自 Unsplash（免费使用授权）。

