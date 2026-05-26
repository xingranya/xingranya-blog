# 星苒鸭 · 博客 (xingranya-blog)

这是我的个人博客项目，基于 [Hexo](https://hexo.io/) 构建，当前使用自定义主题 `themes/defaultone`。

## 当前项目形态

这是一个静态博客站点仓库，当前仓库内不包含独立的 `admin/` 后台目录。

站点的生成链路是
- Markdown / 页面源文件放在 `source/`
- 主题模板和前端资源放在 `themes/defaultone/`
- 构建时先生成主题 CSS / JS，再由 Hexo 输出到 `public/`

## 技术基线

- 博客引擎：Hexo 7.3.0
- 模板：EJS
- 样式：Stylus + Tailwind CSS
- 前端脚本：原生 JavaScript
- Node.js：`>=22 <25`

## 项目结构

```text
.
├── _config.yml
├── package.json
├── source/
│   ├── _posts/
│   ├── about/
│   ├── categories/
│   ├── links/
│   ├── masonry/
│   ├── projects/
│   ├── tags/
│   └── images/
├── themes/
│   └── defaultone/
│       ├── _config.yml
│       ├── layout/
│       ├── scripts/
│       └── source/
└── public/
```

## 常用命令

### 安装依赖

```bash
npm install
```

### 本地预览

```bash
npm run server
```

访问 `http://localhost:4000`

### 构建站点

```bash
npm run build
```

当前 `build` 会先构建主题产物，再执行 Hexo 生成。

### 清理缓存

```bash
npm run clean
```

### 部署

```bash
npm run deploy
```

是否能直接部署，取决于根目录 `_config.yml` 里的 `deploy` 配置是否已填写。

## 内容维护

### 创建文章

```bash
npx hexo new "文章标题"
```

### 创建页面

```bash
npx hexo new page "页面名称"
```

## 主题开发

如果修改了 `themes/defaultone` 里的样式或脚本，可以单独构建主题

```bash
npm run build:theme
```

或进入主题目录执行

```bash
cd themes/defaultone
npm run build:css
npm run build:js
```

## 当前已经接入的能力

- sitemap
- 评论系统
- Live2D
- 首页横幅与动效
- 单页切换
- 站点统计与字数统计

## 当前需要注意的点

- 不要直接修改 `public/`
- `source/images/og.svg` 是当前默认分享图
- `source/robots.txt` 已声明 sitemap
- 评论如果继续使用 Gitalk，不要把 secret 放进前端可见配置