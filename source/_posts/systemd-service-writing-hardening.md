---
title: systemd：写一个靠谱的服务并顺手加固
date: "2026-02-06 08:30:00"
banner: 从“能跑”到“可维护”，只差一个 unit 文件
cover: "https://img1.tucang.cc/api/image/show/072784e18bafcb68393691484f75ec7d"
categories:
  - 运维技术
tags:
  - Linux
  - systemd
  - 服务管理
  - 安全
---

很多服务“上线能跑”，但一旦出问题就很难定位：重启策略乱、日志散、权限大、环境变量不透明……systemd 其实已经把这些“工程化”能力都给你准备好了。

这篇用一个最小的服务为例，教你写一份**可读、可控、可加固**的 unit 文件。

![机房里最重要的不是灯光，而是可控性](https://images.unsplash.com/photo-1667264501379-c1537934c7ab?auto=format&fit=crop&w=1600&q=80&ixlib=rb-4.1.0)

### 你会用到的 3 个概念

- **Unit 文件**：描述服务怎么启动、怎么停、怎么重启
- **依赖与顺序**：确保网络/文件系统就绪后再启动
- **沙盒化（Hardening）**：最小权限原则，减少“服务被打穿”的后果

### 一份推荐的模板（可直接改）

下面以一个假想的 `myapp`（监听 3000 端口）为例：

```ini
# /etc/systemd/system/myapp.service
[Unit]
Description=MyApp Service
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=myapp
Group=myapp
WorkingDirectory=/opt/myapp

# 环境变量：建议用文件集中管理
EnvironmentFile=/etc/myapp/myapp.env

# 启动命令
ExecStart=/opt/myapp/myapp

# 失败自动重启（避免抖动：带点延迟）
Restart=on-failure
RestartSec=3

# 日志：默认就会进 journald
StandardOutput=journal
StandardError=journal

# 资源限制（按需开启）
LimitNOFILE=65535

# --- 安全加固（推荐从保守项开始） ---
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ProtectKernelTunables=true
ProtectKernelModules=true
ProtectControlGroups=true
LockPersonality=true
MemoryDenyWriteExecute=true
RestrictRealtime=true

# 只允许使用 IPv4/IPv6
RestrictAddressFamilies=AF_INET AF_INET6

# 如果服务只读写某些目录，白名单化（按需修改）
ReadWritePaths=/var/lib/myapp /var/log/myapp

[Install]
WantedBy=multi-user.target
```

### 关键字段怎么选

#### `Type=simple` vs `Type=forking`

- **simple**：前台运行、最常见（Go/Node/Python 大多是这样）
- **forking**：传统守护进程会 fork 到后台（不建议新项目这样写）

#### `Restart=on-failure` 的意义

只在非 0 退出、被信号杀死时重启，避免“正常停止也被拉起来”的尴尬。

#### `EnvironmentFile=...`

把配置从 unit 文件里拿出来，避免：

- unit 太长难读
- 改一行环境变量就要改 unit
- 不小心把敏感信息写进 repo

建议环境文件权限最小化（例如仅 root 可读写）。

### 加固项怎么逐步启用（避免一上来就把自己锁死）

推荐顺序（从风险小到大）：

- `NoNewPrivileges=true`
- `PrivateTmp=true`
- `ProtectHome=true`
- `ProtectSystem=strict` + `ReadWritePaths=...`
- `MemoryDenyWriteExecute=true`
- `RestrictAddressFamilies=...`

如果某项启用后服务启动失败，优先看日志里被拒绝的路径/权限，然后补充 `ReadWritePaths` 或调整业务写入目录。

### 常用排障命令（建议记住）

```bash
# 查看服务状态（含最近日志）
systemctl status myapp

# 查看详细日志
journalctl -u myapp -e

# 实时追踪日志
journalctl -u myapp -f

# 验证 unit 文件是否有语法问题
systemd-analyze verify /etc/systemd/system/myapp.service
```

### 总结

systemd 的价值不只是“开机自启”，更是把服务运行变成**可观测、可复现、可加固**的工程化过程。你写好一份 unit，未来排障与迁移都会省很多时间。

> 封面与配图来自 Unsplash（免费使用授权）。

