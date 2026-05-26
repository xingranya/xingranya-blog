# Claude Code Agents - 星苒鸭博客项目

本文档为这个博客仓库内的 AI 助手提供当前真实上下文。

## 项目概述

**星苒鸭博客** 是一个基于 Hexo 的个人博客站点仓库。

当前仓库重点是博客前台，不包含独立的 `admin/` 后台目录。

## 技术栈

| 层级 | 技术 |
|------|------|
| 博客引擎 | Hexo 7.3.0 |
| 模板 | EJS |
| 样式 | Stylus + Tailwind CSS |
| 前端脚本 | 原生 JavaScript |
| 运行环境 | Node.js 22 - 24 |

## 目录结构

```text
xingranya-blog/
├── source/
│   ├── _posts/
│   ├── about/
│   ├── categories/
│   ├── links/
│   ├── masonry/
│   ├── projects/
│   └── tags/
├── themes/
│   └── defaultone/
│       ├── layout/
│       ├── scripts/
│       ├── source/
│       └── _config.yml
├── scripts/
├── _config.yml
└── package.json
```

## 工作入口

### 改配置
- 站点配置：`_config.yml`
- 主题配置：`themes/defaultone/_config.yml`

### 改外观
- 布局模板：`themes/defaultone/layout/`
- 样式：`themes/defaultone/source/css/`
- 前端脚本：`themes/defaultone/source/js/`

### 改内容
- 文章：`source/_posts/`
- 独立页面：`source/about/`、`source/tags/`、`source/categories/`、`source/projects/`、`source/links/`

## 命令

在项目根目录执行

```bash
npm install
npm run server
npm run build
npm run clean
npm run deploy
```

补充说明
- `npm run build` 已包含主题构建和 Hexo 生成
- 如果只改主题资源，也可以单独执行 `npm run build:theme`
- 修改主题源码后，需要确认主题产物已重新生成

## 约束

1. 修改前先读文件
2. 不要直接改 `public/`
3. Live2D 默认保留，除非用户明确要求删除
4. 当前用户明确要求保留网站特效，不要主动删除粒子、鼠标效果、首页横幅、打字机、单页切换等效果
5. 评论相关敏感配置不要写回前端可见文件

## 验证

- 结构或配置改动后，优先运行 `npm run build`
- 如果改了主题脚本，确认构建无语法错误