# Claude Code Agents - 星苒鸭博客项目

本文档为 Claude Code AI 助手提供项目上下文和开发指导。

## 项目概述

**星苒鸭博客** - 基于 Hexo 的个人博客系统，包含：
- 博客前台（Hexo 静态生成）
- 管理后台（Express.js + 原生前端）

### 技术栈

| 层级 | 技术 |
|------|------|
| 博客引擎 | Hexo 7.3.0 |
| 管理后台 | Express.js 5.x |
| 前端 | 原生 JavaScript, CSS3 |
| 编辑器 | EasyMDE |
| 认证 | JWT + bcrypt |
| 部署 | PM2 + 宝塔面板 |

## 目录结构

```
xingranya-blog/
├── admin/              # 管理后台
│   ├── public/         # 前端资源
│   │   ├── css/        # 样式文件
│   │   ├── js/         # JavaScript
│   │   │   └── admin/  # 管理页面脚本
│   │   └── admin/      # 管理页面 HTML
│   ├── routes/         # API 路由
│   ├── services/       # 业务逻辑
│   ├── middleware/     # 中间件
│   ├── config.js       # 配置
│   └── server.js       # 入口
├── source/             # Hexo 源文件
│   └── _posts/         # 文章 Markdown
├── themes/             # Hexo 主题
├── _config.yml         # Hexo 配置
└── package.json        # 依赖管理
```

## 重要约定

### 代码风格

1. **简体中文注释和输出**
   - 所有注释使用简体中文
   - 用户界面文本使用简体中文
   - 错误信息使用简体中文

2. **函数命名**
   - camelCase 格式
   - 动词开头（get, set, create, update, delete）
   - 语义清晰

3. **错误处理**
   - 异步函数必须 try-catch
   - 错误信息记录到 console.error
   - API 错误返回 { success: false, error: "..." }

4. **安全规范**
   - 密码必须使用 bcrypt 哈希
   - JWT 密钥至少 32 字符
   - 路径遍历检查
   - 输入验证和转义

### 文件修改原则

1. **先读后写** - 修改文件前必须先用 Read 工具读取
2. **保持格式** - 保持现有代码风格和缩进
3. **避免重复** - 优先编辑现有文件，避免创建新文件
4. **明确范围** - 只修改与任务相关的代码

## 核心功能说明

### 1. 文章管理 (services/posts.js)

文章存储格式：FrontMatter + Markdown

```yaml
---
title: 文章标题
date: 2026-02-03 12:00:00
categories: [技术]
tags: [Hexo, Node.js]
banner: "首页横幅文字"
cover: /images/cover.jpg
---

文章内容...
```

**重要**：更新文章时必须保留原有 frontmatter 字段

### 2. 部署系统 (services/hexo.js)

使用 npm scripts 执行 Hexo 命令：
- `npm run build` = `hexo generate`
- `npm run clean` = `hexo clean`
- `npm run deploy` = `hexo deploy`

**注意**：路径解析需要正确处理绝对路径和相对路径

### 3. 认证系统

- JWT Token 有效期：24小时
- 速率限制：15分钟内最多5次登录尝试
- 密码格式：bcrypt 哈希，必须用双引号包裹

```env
PASSWORD_HASH="$2b$10$..."
```

### 4. 前端架构

核心库 (js/admin/core.js) 提供：
- `$` / `$$` - DOM 选择器
- `Store` - 全局状态管理
- `API` - HTTP 请求封装
- `UI` - UI 组件（toast, modal, confirm）
- `Auth` - 认证管理
- `Theme` - 主题切换
- `Utils` - 工具函数
- `Router` - 路由辅助

## 常见任务

### 修改 API 接口

1. 在 `routes/` 中找到对应路由文件
2. 在 `services/` 中实现业务逻辑
3. 更新前端调用（如有需要）

### 添加新页面

1. 在 `public/admin/` 创建 HTML 文件
2. 复制侧边栏代码保持一致性
3. 在 `routes/` 添加对应的 API

### 调试问题

1. 查看浏览器控制台错误
2. 查看 PM2 日志：`pm2 logs blog-admin`
3. 检查 `.env` 配置
4. 验证依赖安装：`npm install`

## 部署指南

### 本地开发

```bash
cd admin
npm install
node server.js
```

### 生产部署（宝塔 + PM2）

1. 上传项目到服务器
2. 配置 `.env` 文件
3. 启动 PM2：`pm2 start ecosystem.config.js`
4. 配置 Nginx 反向代理到 127.0.0.1:3001

详细步骤见 [admin/README.md](./admin/README.md)

## 已知问题和解决方案

| 问题 | 解决方案 |
|------|----------|
| 登录无反应 | 禁用 CSP (security.js) |
| 编辑器全屏错位 | 添加 EasyMDE 全屏样式 CSS |
| 文章字段丢失 | update 函数保留原 frontmatter |
| 日期格式变化 | 转换为 YYYY-MM-DD HH:mm:ss |
| 编辑器内容残留 | 使用动态 autosave ID |

## 依赖管理

**生产环境必须的依赖**：
- express
- helmet
- cors
- bcryptjs
- jsonwebtoken
- gray-matter
- multer
- express-rate-limit

**开发依赖**：
- dotenv

## 安全注意事项

1. **永远不要提交敏感信息**：
   - `.env` 文件已在 .gitignore
   - JWT_SECRET
   - PASSWORD_HASH
   - API Tokens

2. **生产环境必须**：
   - 使用强 JWT 密钥（32+ 字符）
   - 启用 HTTPS
   - 定期更新依赖
   - 配置 CORS 白名单

## 联系方式

- 项目作者：星苒鸭
- 管理后台：http://your-domain.com/admin
