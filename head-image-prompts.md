## 头图生图提示词（20 篇）

### 通用参数与风格（所有头图统一）

- **比例/尺寸**：21:9（建议 `2100x900` 或 `1920x823`）
- **整体风格**：扁平矢量插画（flat vector）、圆角卡片感、柔和渐变背景（蓝灰/粉紫）、轻微颗粒噪点与稀疏小圆点点缀、轻拟物柔光阴影、极简可爱治愈风；主体居中偏上、画面干净
- **硬性约束**：不要任何可读文字、不要品牌/Logo、水印、签名；不要写实摄影、不要厚重 3D、不要复杂背景、不要人物脸手

### 通用负向提示词（Negative Prompt 建议直接粘贴）

```text
文字, 可读字符, watermark, logo, signature, photorealistic, realistic, 3d render, heavy texture, clutter, messy background, high contrast, harsh shadow, face, hands, people
```

---

## 20 篇文章对应正向提示词

> 使用方式：复制「正向提示词」到 Positive Prompt；负向统一用上面的「通用负向提示词」。

### 01 Linux 性能排查（`source/_posts/linux-performance-troubleshooting.md`）

```text
宽幅横向头图 21:9，扁平矢量插画（flat vector），柔和蓝灰渐变背景，轻微颗粒噪点与稀疏小圆点点缀，圆角卡片构图，柔和投影，极简可爱治愈风；主体：一个圆角“性能仪表盘”卡片，上面用图标表达 CPU 芯片、内存条、硬盘、网络箭头；旁边一扇绿色终端窗口（无文字，仅抽象绿色线条）；角落放一只 Q 版小鸭子拿放大镜；配色蓝灰+薄荷绿+少量珊瑚红点缀；无可读文字，无logo，无水印
```

### 02 systemd 服务与加固（`source/_posts/systemd-service-writing-hardening.md`）

```text
宽幅横向头图 21:9，扁平矢量插画，蓝灰渐变背景+细小圆点，圆角卡片风，柔光阴影，极简可爱；主体：大齿轮图标+一个“服务开关 toggle”图标；旁边一张折角配置文件卡片（无文字）+小盾牌图标；角落一只 Q 版小鸭子戴安全帽；配色蓝灰+薄荷绿+少量橙红点缀；无可读文字，无logo，无水印
```

### 03 Nginx 反代与负载均衡（`source/_posts/nginx-reverse-proxy-load-balancing.md`）

```text
宽幅横向头图 21:9，扁平矢量插画，柔和渐变背景，颗粒噪点与小圆点点缀，圆角卡片构图，极简；主体：一个入口网关块（圆角），三条平滑箭头分流到三台服务器方块（圆角），每台服务器有绿色状态点；少量红色闪电/流线表示“流量”；角落一只 Q 版小鸭子拿小旗子指向分流箭头；无可读文字，无logo，无水印
```

### 04 Docker 网络与存储（`source/_posts/docker-network-storage-deep-dive.md`）

```text
宽幅横向头图 21:9，扁平矢量插画，蓝灰/浅紫渐变背景，圆角卡片感，柔和阴影，极简可爱；主体：几个彩色“集装箱”方块（无logo）通过网线/节点连接到一个圆角硬盘/volume 图标；周围点线网络与小云朵图标；角落一只 Q 版小鸭子推着一个小集装箱；无可读文字，无logo，无水印
```

### 05 K8s 最小例子跑通（`source/_posts/kubernetes-from-zero-minimal-app.md`）

```text
宽幅横向头图 21:9，扁平矢量插画，柔和蓝灰渐变背景，小圆点点缀，圆角卡片构图；主体：一组蓝色立方体/方块节点组成“小集群拓扑”，中间有调度指示（小旗标或指针图标），几条箭头表示调度到不同节点；角落一只 Q 版小鸭子举着小旗子；无可读文字，无logo，无水印
```

### 06 Prometheus + Grafana 监控（`source/_posts/prometheus-grafana-monitoring-basics.md`）

```text
宽幅横向头图 21:9，扁平矢量插画，浅蓝灰渐变背景+颗粒点，圆角卡片风，柔光阴影；主体：一个大仪表盘卡片，包含折线图、柱状图、圆形仪表（无文字刻度），右上角一个小铃铛告警图标；角落一只 Q 版小鸭子盯着图表拿记号笔；无可读文字，无logo，无水印
```

### 07 SSH 安全加固（`source/_posts/ssh-security-hardening-checklist.md`）

```text
宽幅横向头图 21:9，扁平矢量插画，蓝灰渐变背景，小圆点点缀，圆角卡片构图，极简；主体：一个终端窗口（无文字，抽象绿线）+锁头与钥匙图标+小盾牌；细线网络连接与一个“允许/拦截”的抽象闸门图标；角落一只 Q 版小鸭子握着钥匙；无可读文字，无logo，无水印
```

### 08 Python 日志最佳实践（`source/_posts/python-logging-structured-best-practices.md`）

```text
宽幅横向头图 21:9，扁平矢量插画，柔和渐变背景，圆角卡片风，轻噪点；主体：圆角“日志窗口”卡片，里面是多行彩色日志条（无文字），一个放大镜聚焦其中一行；旁边有小虫 bug 图标+文件夹图标；角落一只 Q 版小鸭子拿笔做标记；无可读文字，无logo，无水印
```

### 09 Node.js 内存泄漏排查（`source/_posts/nodejs-memory-leak-debugging-guide.md`）

```text
宽幅横向头图 21:9，扁平矢量插画，蓝灰渐变背景+颗粒点，圆角卡片构图；主体：一枚内存芯片图标变成小水桶/容器，漏出“像素水滴”，旁边有垃圾桶图标与警告三角；角落一只 Q 版小鸭子拿胶带在修补漏点；无可读文字，无logo，无水印
```

### 10 Go 并发 Worker Pool（`source/_posts/go-concurrency-workerpool-context.md`）

```text
宽幅横向头图 21:9，扁平矢量插画，柔和渐变背景，小圆点点缀，圆角卡片风；主体：一条传送带把多个任务小盒子送进三个 worker 齿轮；旁边一个圆角“停止/取消”按钮 X 图标与节流闸门图标（抽象）；角落一只 Q 版小鸭子戴耳机指挥；无可读文字，无logo，无水印
```

### 11 API 设计要点（`source/_posts/api-design-errors-idempotency-pagination.md`）

```text
宽幅横向头图 21:9，扁平矢量插画，浅蓝灰渐变背景，圆角卡片构图，极简；主体：多个 API 节点（圆角小方块）用线连接成网络；一个循环箭头表示幂等；一叠分页卡片表示分页；一个漏斗/闸门图标表示限流；角落一只 Q 版小鸭子拿着小钥匙卡图标；无可读文字，无logo，无水印
```

### 12 大模型基础（Token/采样/上下文）（`source/_posts/llm-basics-tokens-sampling-context.md`）

```text
宽幅横向头图 21:9，扁平矢量插画，蓝紫渐变背景+稀疏小圆点，圆角卡片风；主体：抽象大脑/神经网络光点图案，周围漂浮 token 方块与骰子图标；外圈一个半透明圆环表示上下文窗口；角落一只 Q 版小鸭子托着 token 方块；无可读文字，无logo，无水印
```

### 13 本地跑大模型（`source/_posts/local-llm-ollama-lmstudio-setup.md`）

```text
宽幅横向头图 21:9，扁平矢量插画，柔和蓝灰渐变背景，圆角卡片构图；主体：一台笔记本电脑/台式机图标+GPU 风扇/散热片图标（无品牌），旁边有“离线”云朵打叉图标；一堆模型权重立方体/芯片块；角落一只 Q 版小鸭子抱着小电脑；无可读文字，无logo，无水印
```

### 14 RAG 实战（`source/_posts/rag-practice-chunk-embedding-rerank.md`）

```text
宽幅横向头图 21:9，扁平矢量插画，浅灰蓝渐变背景+小圆点，圆角卡片风，极简；主体：打开的书本/文档卡片，旁边漂浮“切分块”小方块；一个放大镜从文档里“检索”出几块内容，箭头指向聊天气泡；角落一只 Q 版小鸭子在翻书；无可读文字，无logo，无水印
```

### 15 提示工程模板（`source/_posts/prompt-engineering-templates-and-pitfalls.md`）

```text
宽幅横向头图 21:9，扁平矢量插画，柔和渐变背景，圆角卡片构图；主体：聊天气泡+一张“模板卡片”分区线（无文字）+勾选清单 checkbox（无文字）；风格极简可爱，轻噪点；角落一只 Q 版小鸭子拿笔打勾；无可读文字，无logo，无水印
```

### 16 大模型安全与隐私（`source/_posts/llm-security-privacy-deployment.md`）

```text
宽幅横向头图 21:9，扁平矢量插画，偏稳重蓝灰渐变背景+细小圆点，圆角卡片风；主体：盾牌+锁头+钥匙；一张文档卡片上有几条黑色遮罩条（redaction，不能有文字）；旁边一个小服务器/云朵图标；角落一只 Q 版小鸭子贴隐私遮罩；无可读文字，无logo，无水印
```

### 17 Magisk vs KernelSU 选型（`source/_posts/magisk-vs-kernelsu-choose-guide.md`）

```text
宽幅横向头图 21:9，扁平矢量插画，蓝灰渐变背景，圆角卡片构图，极简；主体：左右对比两张圆角卡片——左卡片是“面具”图标，右卡片是“芯片+小盾牌”图标；中间用闪电分割表达对比；底部有一台手机轮廓；角落一只 Q 版小鸭子举着天平；无可读文字，无logo，无水印
```

### 18 Root 兼容性/完整性检测（`source/_posts/root-hide-play-integrity-lsposed-zygisk.md`）

```text
宽幅横向头图 21:9，扁平矢量插画，浅蓝灰渐变背景+小圆点，圆角卡片风；主体：手机图标上出现“安全扫描”光束与盾牌（勾/叉用图形表达，不要文字）；旁边一个透明“沙盒泡泡”隔离几枚抽象 app 小方块图标；角落一只 Q 版小鸭子拿扫描器；无可读文字，无logo，无水印
```

### 19 救砖与备份/分区/fastboot（`source/_posts/android-backup-unbrick-fastboot-partitions.md`）

```text
宽幅横向头图 21:9，扁平矢量插画，蓝灰渐变背景，圆角卡片构图；主体：手机通过 USB 线连接电脑，旁边堆叠彩色“分区块”（像乐高/积木，无文字）；一个扳手图标+救生圈图标；角落一只 Q 版小鸭子拿螺丝刀；无可读文字，无logo，无水印
```

### 20 搞机排查（bootloop/模块冲突）（`source/_posts/android-root-troubleshooting-common-issues.md`）

```text
宽幅横向头图 21:9，扁平矢量插画，浅蓝灰渐变背景+颗粒点，圆角卡片风；主体：警告三角图标+循环箭头表示 bootloop；两块“模块拼图卡片”相撞擦出小火花；旁边一个小工具箱；角落一只 Q 版小鸭子皱眉排查拿扳手；无可读文字，无logo，无水印
```

