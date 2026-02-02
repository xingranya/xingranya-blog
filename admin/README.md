# 星苒鸭博客管理后台

基于 Express.js 的 Hexo 博客管理系统，提供文章管理、媒体上传、部署控制等功能。

## 功能特性

- 文章管理（创建、编辑、删除、搜索）
- Markdown 编辑器（EasyMDE）
- 媒体库管理（图床上传）
- 一键部署（hexo generate/deploy/clean）
- 站点配置管理
- 响应式设计，支持移动端
- 深色/浅色主题切换

## 技术栈

- **后端**: Express.js 5.x, Node.js
- **前端**: 原生 JavaScript, CSS3
- **编辑器**: EasyMDE
- **认证**: JWT + bcrypt
- **图床**: 图仓 API

## 目录结构

```
admin/
├── config.js           # 配置文件
├── server.js           # 主服务器入口
├── ecosystem.config.js # PM2 配置
├── gen-hash.js         # 密码哈希生成工具
├── .env                # 环境变量（不提交到git）
├── .env.example        # 环境变量示例
├── middleware/
│   ├── auth.js         # JWT 认证中间件
│   └── security.js     # 安全中间件（Helmet, 速率限制）
├── routes/
│   ├── auth.js         # 登录认证 API
│   ├── posts.js        # 文章 CRUD API
│   ├── dashboard.js    # 仪表盘统计 API
│   ├── deploy.js       # 部署控制 API
│   ├── media.js        # 媒体上传 API
│   └── config.js       # 站点配置 API
├── services/
│   ├── posts.js        # 文章业务逻辑
│   ├── hexo.js         # Hexo 命令执行
│   ├── config.js       # 配置读写
│   └── media.js        # 媒体上传逻辑
└── public/
    ├── index.html      # 登录页
    ├── css/admin.css   # 样式文件
    ├── js/admin/core.js # 前端核心库
    └── admin/          # 管理页面
        ├── index.html  # 控制台
        ├── posts.html  # 文章管理
        ├── editor.html # 文章编辑器
        ├── media.html  # 媒体库
        ├── deploy.html # 部署管理
        └── settings.html # 站点设置
```

## 本地开发

### 1. 安装依赖

```bash
cd admin
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并修改：

```bash
cp .env.example .env
```

编辑 `.env`：

```env
PORT=3001
JWT_SECRET=your-secret-key-at-least-32-chars
PASSWORD_HASH="$2b$10$your-bcrypt-hash-here"
TUCANG_TOKEN=your-tucang-api-token
TUCANG_FOLDER_ID=your-folder-id
```

### 3. 生成密码哈希

修改 `gen-hash.js` 中的密码，然后运行：

```bash
node gen-hash.js
```

将输出的哈希值填入 `.env` 的 `PASSWORD_HASH`（记得加双引号）。

### 4. 启动开发服务器

```bash
node server.js
```

访问 http://localhost:3001

---

## 服务器部署（宝塔面板 + PM2）

### 前置要求

- 宝塔面板已安装
- Node.js 18+ 已安装
- PM2 已安装（`npm install -g pm2`）

### 1. 上传项目

将整个博客项目上传到服务器，例如：`/www/wwwroot/xingranya-blog`

### 2. 安装依赖

```bash
# 博客主目录
cd /www/wwwroot/xingranya-blog
npm install

# 管理后台
cd admin
npm install
```

### 3. 配置环境变量

```bash
cd /www/wwwroot/xingranya-blog/admin
cp .env.example .env
nano .env  # 或使用宝塔文件管理器编辑
```

配置内容：

```env
PORT=3001
JWT_SECRET=生成一个随机的32位以上字符串
PASSWORD_HASH="用gen-hash.js生成的哈希值"
TUCANG_TOKEN=你的图仓Token
TUCANG_FOLDER_ID=你的图仓文件夹ID
```

### 4. 使用 PM2 启动

```bash
cd /www/wwwroot/xingranya-blog/admin

# 启动服务
pm2 start ecosystem.config.js

# 查看状态
pm2 status

# 查看日志
pm2 logs blog-admin

# 设置开机自启
pm2 save
pm2 startup
```

### 5. 宝塔面板配置反向代理

在宝塔面板中为你的域名添加反向代理：

1. 进入 **网站** -> 选择你的站点 -> **反向代理**
2. 添加反向代理：
   - **代理名称**: blog-admin
   - **目标URL**: http://127.0.0.1:3001
   - **发送域名**: $host

或手动编辑 Nginx 配置：

```nginx
# 在你的站点配置中添加
location /admin {
    proxy_pass http://127.0.0.1:3001;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location /api {
    proxy_pass http://127.0.0.1:3001;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

### 6. PM2 常用命令

```bash
# 重启服务
pm2 restart blog-admin

# 停止服务
pm2 stop blog-admin

# 删除服务
pm2 delete blog-admin

# 查看实时日志
pm2 logs blog-admin --lines 100

# 监控面板
pm2 monit
```

---

## API 接口

### 认证

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/login` | 登录获取 Token |
| GET | `/api/user` | 验证 Token |

### 文章

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/posts` | 获取文章列表 |
| GET | `/api/posts/:filename` | 获取文章详情 |
| POST | `/api/posts` | 创建文章 |
| PUT | `/api/posts/:filename` | 更新文章 |
| DELETE | `/api/posts/:filename` | 删除文章 |

### 仪表盘

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/dashboard/stats` | 获取统计数据 |
| GET | `/api/dashboard/monthly` | 获取月度统计 |

### 部署

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/deploy/generate` | 执行 npm run build |
| POST | `/api/deploy/clean` | 执行 npm run clean |
| POST | `/api/deploy` | 执行 npm run deploy |

### 媒体

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/media` | 获取媒体列表 |
| POST | `/api/media/upload` | 上传文件 |
| DELETE | `/api/media/:filename` | 删除媒体记录 |

---

## 配置说明

### config.js

```javascript
module.exports = {
  port: 3001,                    // 服务端口
  jwtSecret: 'xxx',              // JWT 密钥
  jwtExpiresIn: '24h',           // Token 过期时间
  passwordHash: 'xxx',           // 密码 bcrypt 哈希
  blogRoot: '/path/to/blog',     // 博客根目录

  rateLimit: {
    loginWindowMs: 15 * 60 * 1000,  // 登录限制窗口
    loginMaxAttempts: 5,            // 最大登录尝试
    apiWindowMs: 15 * 60 * 1000,    // API 限制窗口
    apiMaxRequests: 100             // 最大 API 请求数
  },

  tucang: {
    apiUrl: 'https://api.tucang.cc/api/v1/upload',
    token: 'xxx',                // 图仓 Token
    folderId: '3528'             // 图仓文件夹 ID
  }
};
```

---

## 常见问题

### 1. 登录没有反应

检查浏览器控制台是否有 CSP 错误。确保 `middleware/security.js` 中已禁用 CSP：

```javascript
helmet: helmet({
    contentSecurityPolicy: false
}),
```

### 2. 部署失败

- 确认博客目录下有 `package.json` 且包含 `build`、`clean` 脚本
- 检查 `config.blogRoot` 路径是否正确
- 查看 PM2 日志：`pm2 logs blog-admin`

### 3. 编辑文章后字段丢失

已修复：更新文章时会保留原有的 frontmatter 字段（如 banner）。

### 4. 密码哈希中的 $ 符号问题

在 `.env` 文件中，bcrypt 哈希值必须用**双引号**包裹：

```env
PASSWORD_HASH="$2b$10$..."
```

---

## 更新日志

### v1.0.0 (2026-02-03)

- 初始版本
- 文章 CRUD 功能
- Markdown 编辑器
- 媒体库管理
- 部署控制
- JWT 认证
- 响应式设计
