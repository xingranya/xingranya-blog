# 星苒鸭 · 博客 (xingranya-blog)

这是我的个人博客项目，基于 [Hexo](https://hexo.io/) 框架构建，并使用了 [hexo-theme-redefine](https://github.com/EvanNotFound/hexo-theme-redefine) 主题。

## 网站原理

本网站是一个 **静态网站**，由 [Hexo](https://hexo.io/) 框架驱动。它的核心原理是“**源文件 → 生成 → 部署**”：

1.  **编写源文件**：我使用 Markdown (`.md`) 这种简洁的格式来撰写博客文章（位于 `source/_posts` 目录）和页面（如 `source/projects`）。
2.  **主题与模板**：网站的外观和布局由 `defaultone` 主题（位于 `themes/defaultone` 目录）定义。该主题使用 EJS 模板引擎来渲染页面结构。
3.  **生成静态文件**：当运行 `npx hexo generate` 命令时，Hexo 会将 Markdown 源文件和主题模板结合，生成最终的、纯粹的 HTML、CSS 和 JavaScript 文件，并存放在 `public` 目录中。
4.  **部署**：最后，只需将 `public` 目录下的所有文件部署到任何静态网站托管服务（如 GitHub Pages, Vercel, Netlify 等）上，用户就可以通过浏览器访问了。

这种方式的好处是网站访问速度快、安全性高，并且易于部署。

## 技术栈

*   **框架 (Framework)**: [Hexo](https://hexo.io/)
*   **内容 (Content)**: Markdown
*   **模板引擎 (Templating)**: EJS
*   **主题 (Theme)**: [hexo-theme-redefine](https://github.com/EvanNotFound/hexo-theme-redefine) (本项目中命名为 `defaultone`)
*   **运行环境 (Runtime)**: Node.js

## 项目结构

```
.
├── _config.yml      # 站点主配置文件
├── package.json     # 项目依赖
├── source/          # 所有源文件
│   ├── _posts/      # 博客文章 (.md)
│   └── projects/    # “项目”页面
├── themes/          # 主题目录
│   └── defaultone/  # 当前使用的主题
└── public/          # (生成后) 最终部署的静态网站
```

## 本地开发与内容管理

### 1. 环境要求

*   [Node.js](https://nodejs.org/) (建议使用 LTS 版本)

### 2. 安装依赖

在项目根目录下执行以下命令，安装所有必需的插件和库：
```bash
npm install
```

### 3. 本地预览

执行以下命令，即可在本地启动一个实时预览的服务器。这对于撰写文章和调试样式非常方便。
```bash
npx hexo server
```
启动后，在浏览器中访问 `http://localhost:4000` 即可看到你的博客。

### 4. 内容创作

*   **创建新文章**:
    ```bash
    npx hexo new "你的文章标题"
    ```
    Hexo 会在 `source/_posts` 目录下创建一个新的 Markdown 文件，你可以在其中开始写作。

*   **创建新页面**:
    ```bash
    npx hexo new page "你的页面名称"
    ```
    这会在 `source` 目录下创建一个与页面名称同名的文件夹，其中包含一个 `index.md` 文件。

### 5. 生成与清理

*   **生成静态文件**: 当你准备部署网站时，执行此命令。所有生成的文件都会被放置在 `public` 目录中。
    ```bash
    npx hexo generate
    ```

*   **清理缓存**: 如果你遇到了奇怪的生成问题，可以先尝试清理缓存。
    ```bash
    npx hexo clean
    ```
    通常，推荐的构建流程是先清理再生成：`npx hexo clean && npx hexo generate`。

## 部署指南

### 方式 A: Vercel (推荐)

Vercel 提供了零配置的部署体验，非常适合 Hexo 博客。

1.  将你的博客项目推送到一个 GitHub 仓库。
2.  使用你的 GitHub 账号登录 [Vercel](https://vercel.com/)。
3.  在 Vercel 的仪表盘上，点击 "Add New..." -> "Project"。
4.  选择你刚刚推送的 GitHub 仓库并导入。
5.  Vercel 会自动识别出这是一个 Hexo 项目。在 "Build and Output Settings" 中，确保 **Output Directory** 设置为 `public`。
6.  点击 "Deploy"。Vercel 会自动构建并部署你的网站。之后每次你向仓库推送新的提交，Vercel 都会自动重新部署。

### 方式 B: GitHub Pages

1.  **安装部署插件**:
    ```bash
    npm install hexo-deployer-git --save
    ```

2.  **配置 `_config.yml`**: 在项目根目录的 `_config.yml` 文件末尾，添加你的部署配置：
    ```yaml
    deploy:
      type: git
      repo: https://github.com/<你的用户名>/<你的仓库名>.git
      branch: gh-pages
    ```

3.  **执行部署**:
    ```bash
    npx hexo deploy
    ```
    这个命令会自动生成静态文件，并将 `public` 目录的内容推送到指定仓库的 `gh-pages` 分支。你需要在 GitHub 仓库的设置中，将 Pages 的源设置为 `gh-pages` 分支。
