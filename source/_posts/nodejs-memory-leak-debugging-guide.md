---
title: Node.js 内存泄漏排查：把“越跑越慢”抓现行
date: "2026-02-06 12:00:00"
banner: 不是 GC 不努力，是对象被你“留住”了
cover: "https://images.unsplash.com/photo-1741392078190-d263a71291cd?auto=format&fit=crop&w=1600&q=80&ixlib=rb-4.1.0"
categories:
  - 编程实践
tags:
  - Node.js
  - 性能优化
  - 内存泄漏
  - 调试
---

Node 服务跑着跑着变慢、内存一路上涨、最后被 OOM 杀掉——这类问题非常常见。更糟糕的是：它往往“上线一段时间才出现”，很难在本地复现。

这篇给你一套偏实战的排查路径：从“确认是不是泄漏”到“定位是哪类对象没释放”。

![硬件不会突然吃内存，真正的问题通常在对象生命周期](https://images.unsplash.com/photo-1756575802474-b2348cef95c3?auto=format&fit=crop&w=1600&q=80&ixlib=rb-4.1.0)

### 1) 先确认：这是“泄漏”还是“正常波动”

典型泄漏曲线：

- 内存缓慢上涨
- GC 频率越来越高（CPU 被拖累）
- 最终触发 OOM / 容器被杀

而“正常波动”常见于：

- 页面缓存/连接池的热身
- 流量峰值导致临时对象增多，峰值过去后会回落

建议先看两个指标：

- **RSS**（常驻内存）：更接近进程真实占用
- **Heap Used**：V8 堆使用量（真正的 JS 对象主要在这）

### 2) 先做最简单的自检：加一段内存日志

```js
// 定期打印内存信息（示例）
setInterval(() => {
  const m = process.memoryUsage();
  console.log(JSON.stringify({
    rss: m.rss,
    heapUsed: m.heapUsed,
    heapTotal: m.heapTotal,
    external: m.external,
    ts: Date.now()
  }));
}, 60_000);
```

如果 `heapUsed` 线性上涨且不会回落，大概率就是“对象没释放”。

### 3) 真正抓现行：Heap Snapshot（最推荐）

排查思路是：**在不同时间点抓两份快照对比**。

常用方式：

- 本地/测试环境：`node --inspect` + Chrome DevTools
- 线上：更推荐在预发或复刻流量的环境做；线上直接开 inspect 要谨慎

DevTools 里你主要看：

- 哪类对象数量增长最快
- Retainers（是谁把它引用住了）

### 4) 常见“泄漏源”清单（高命中）

- **全局 Map/Set 缓存不设上限**（没有 TTL，没有 LRU）
- **事件监听没解绑**（尤其是对长生命周期对象）
- **闭包引用大对象**（请求结束了，闭包还活着）
- **定时器/interval 未清理**
- **把请求对象塞到全局**（比如把 req/res 存到数组里做“调试”）

一个非常典型的坑：

```js
// ❌ 反例：无限增长的缓存
const cache = new Map();

function getUser(id) {
  if (cache.has(id)) return cache.get(id);
  const user = loadFromDb(id);
  cache.set(id, user); // 没有上限/TTL
  return user;
}
```

修法方向：

- 加 TTL（到期清理）
- 加容量上限（LRU）
- 只缓存“必要字段”，别把整个对象塞进去

### 5) 辅助工具：Clinic / Flamegraph（看清 CPU 被 GC 吃掉多少）

当你怀疑“GC 太频繁导致抖动”，可以用 flamegraph 看：

- JS 业务在跑多少
- GC 占了多少时间
- 是否有大量序列化/拷贝导致内存压力

### 6) 线上策略：不要把排障变成事故

建议：

- 在预发环境复现（回放流量或压测）
- 给服务加内存上限与重启策略（防止彻底拖垮）
- 留一份“泄漏前后的快照/日志”作为证据

### 总结

内存泄漏的本质就是：**对象生命周期比你想象的更长**。排查时别靠猜，抓两份 heap snapshot 对比，顺着 Retainers 往上追，基本都能定位到具体代码路径。

> 封面与配图来自 Unsplash（免费使用授权）。

