# 星苒鸭博客 Wiki 文档

## 项目概述

这是一个基于 Hexo 的静态博客项目，当前主题为 `themes/defaultone`。

当前仓库聚焦博客前台本身，不包含独立的 `admin/` 管理后台目录。

## 当前状态

- Hexo 版本：7.3.0
- 主题：defaultone
- 运行环境：Node.js `>=22 <25`
- 最新整理时间：2026-05

## 项目结构

```text
xingranya-blog/
├── scaffolds/
├── scripts/
├── source/
│   ├── _data/
│   ├── _posts/
│   ├── about/
│   ├── categories/
│   ├── links/
│   ├── live2dw/
│   ├── masonry/
│   ├── projects/
│   ├── tags/
│   └── images/
├── themes/defaultone/
│   ├── languages/
│   ├── layout/
│   ├── scripts/
│   ├── source/
│   ├── _config.yml
│   └── package.json
├── _config.yml
├── package.json
└── public/
```

## 常用命令

### 根目录命令

```bash
npm install
npm run server
npm run build
npm run clean
npm run deploy
```

说明
- `npm run build`：先构建主题 CSS / JS，再生成静态站点
- `npm run clean`：清理 `db.json` 和 `public/`
- `npm run deploy`：是否可用取决于 `_config.yml` 的部署配置

### 主题开发命令

```bash
cd themes/defaultone
npm run build:css
npm run build:js
npm run build
npm run watch:css
```

当前主题没有 `npm run watch`，只有 `watch:css`。

## 资源与 SEO 基线

- 默认分享图：`source/images/og.svg`
- robots 文件：`source/robots.txt`
- 正式域名：`https://blog.xran.uk`
- 个人主页（规划中）：`https://xran.uk`
- sitemap：`https://blog.xran.uk/sitemap.xml`
- robots：`https://blog.xran.uk/robots.txt`
- RSS：`https://blog.xran.uk/atom.xml`
- 站点关键词在根目录 `_config.yml`

## 维护约束

- 不修改 `public/`
- Live2D 保留
- 首页特效保留
- 评论配置不要再把敏感密钥放进前端可见文件

## 主题与内容入口

- 改站点配置：根目录 `_config.yml`
- 改主题配置：`themes/defaultone/_config.yml`
- 改布局模板：`themes/defaultone/layout/`
- 改样式：`themes/defaultone/source/css/`
- 改脚本：`themes/defaultone/source/js/`
- 改文章：`source/_posts/`