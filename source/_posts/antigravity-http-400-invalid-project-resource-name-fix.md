---
title: "【已解决】Antigravity 报错：HTTP 400 \"Invalid project resource name projects/\" 修复"
date: "2026-03-05 15:34:00"
banner: Antigravity Agent 报错 projects/ 缺失 Project ID 的修复
cover: "https://img1.tucang.cc/api/image/show/86ba7b228ba425331efc38a8f37a374a"
categories:
  - 故障排查
tags:
  - Antigravity
  - HTTP 400
  - Google 账号
  - Agent
  - 身份同步
---

### 故障现象 (Symptoms)

在使用 Antigravity 的 Agent 功能时，系统弹出如下阻断性报错：

- **Error**: `HTTP 400 Bad Request`
- **Message**: `Invalid project resource name projects/`
- **TraceID**: `0xf0f3b0b4266b92f3` (示例)
- **表现**: API 请求路径拼接异常，`projects/` 后缀缺失 Project ID，导致 Agent 无法执行任何指令。

---

### 根因分析 (Root Cause)

该问题的本质是 **Google 账号身份提供者 (IdP) 的同步死锁**。

如果你在过去几个月内执行过 **“更改 Gmail 主电子邮件地址”** 的操作，Antigravity 的服务端数据库可能仍然将你的 Cloud 项目资源挂载在**旧的邮箱标识符**下。当你以新邮箱登录时，虽然身份校验通过，但后端无法完成新身份与旧资源的映射，导致发出的 API 请求载荷中 `name` 字段为空。

---

### 修复方案 (The Fix: Identity Re-Sync)

无需重装客户端，通过以下步骤手动触发 Google IAM 与 Antigravity 后端的增量同步：

1. **还原主邮箱身份**：
   访问 [Google 账号设置 - 电子邮件](https://myaccount.google.com/google-account-email)，将你的**主电子邮件地址**暂时修改回改名之前的**老邮箱地址**。
   ![image.png](https://img1.tucang.cc/api/image/show/de4a93b1eb75fb429d715baa51e87bc7)
2. **强制激活映射**：
   彻底退出 Antigravity 客户端。
   使用该**老邮箱地址**重新登录 Antigravity。
   触发一次 Agent 对话，确认功能已恢复正常（此时服务端会重新识别并补全 Project ID 映射）。
3. **恢复当前邮箱**：
   回到 Google 账号设置，将主邮箱改回你现在使用的**新邮箱地址**。
4. **最终验证**：
   再次登录 Antigravity。由于底层资源链路已通过步骤 2 完成了“打通”，即便邮箱地址已更新，Agent 现在也能继承正确的项目配置正常运行。

---

### 总结

这属于一种罕见的“服务端账户解耦”异常。如果你曾更改过 Google 账号名且遇到 `projects/` 路径报错，请尝试此方法。希望这能帮到遇到同样困扰的开发者！
