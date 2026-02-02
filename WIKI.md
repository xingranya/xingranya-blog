# 星苒鸭博客 Wiki 文档

## 目录

- [项目概述](#项目概述)
- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [开发环境搭建](#开发环境搭建)
- [常用命令](#常用命令)
- [内容管理](#内容管理)
- [主题定制](#主题定制)
- [图片自定义指南](#图片自定义指南)
- [部署指南](#部署指南)
- [故障排除](#故障排除)
- [最佳实践](#最佳实践)

---

## 项目概述

这是一个基于 [Hexo](https://hexo.io/) 静态博客框架构建的个人博客项目，使用自定义主题 `defaultone`（基于 `hexo-theme-redefine`）。

### 项目特点
- 🚀 快速静态站点生成
- 🎨 响应式设计，支持多设备访问
- 🔧 模块化主题架构
- 📱 支持移动端优化
- 🌙 深色模式支持
- 💬 集成评论系统

### 当前状态
- **版本**: Hexo 7.3.0
- **主题**: defaultone (自定义)
- **部署状态**: 本地开发环境
- **最新更新**: 2026年2月

---

## 技术栈

### 核心框架
| 技术 | 版本 | 用途 |
|------|------|------|
| [Hexo](https://hexo.io/) | 7.3.0 | 静态博客生成器 |
| [Node.js](https://nodejs.org/) | >=14.0.0 | 运行环境 |
| [npm](https://www.npmjs.com/) | - | 包管理器 |

### 主题技术
| 技术 | 用途 |
|------|------|
| [EJS](https://ejs.co/) | 模板引擎 |
| [Stylus](https://stylus-lang.com/) | CSS预处理器 |
| [Tailwind CSS](https://tailwindcss.com/) | 实用优先的CSS框架 |
| JavaScript (ES6+) | 客户端交互 |

### 内容格式
| 格式 | 用途 |
|------|------|
| Markdown | 博客文章写作 |
| YAML | 配置文件 |
| EJS | 页面模板 |

---

## 项目结构

```
xingranya-blog/
├── scaffolds/              # 文章模板
│   ├── draft.md           # 草稿模板
│   ├── page.md            # 页面模板
│   └── post.md            # 文章模板
├── source/                # 源文件目录
│   ├── _data/            # 数据文件
│   │   ├── links.yml     # 友链数据
│   │   └── masonry.yml   # 瀑布流数据
│   ├── _posts/           # 博客文章
│   │   ├── KernelSU.md
│   │   ├── css-christmas-tree.md
│   │   ├── html-quick-start.md
│   │   ├── m3u8.md
│   │   ├── nginx-baota-deployment-tutorial.md
│   │   └── physics-simulation-web-page.md
│   ├── about/            # 关于页面
│   │   └── index.md
│   ├── masonry/          # 瀑布流页面
│   │   └── index.md
│   ├── projects/         # 项目页面
│   │   └── index.md
│   └── tags/             # 标签页面
│       └── index.md
├── themes/defaultone/     # 自定义主题
│   ├── languages/        # 多语言支持
│   ├── layout/           # 页面布局模板
│   │   ├── components/   # 组件模板
│   │   ├── pages/        # 页面模板
│   │   └── utils/        # 工具模板
│   ├── scripts/          # Hexo插件脚本
│   │   ├── events/       # 事件处理
│   │   ├── filters/      # 过滤器
│   │   ├── helpers/      # 辅助函数
│   │   └── modules/      # 功能模块
│   ├── source/           # 静态资源
│   │   ├── assets/       # 资源文件
│   │   ├── css/          # 样式文件
│   │   ├── fontawesome/  # 图标字体
│   │   ├── fonts/        # 字体文件
│   │   └── js/           # JavaScript文件
│   ├── _config.yml       # 主题配置
│   ├── package.json      # 主题依赖
│   └── tailwind.config.js # Tailwind配置
├── _config.yml           # 站点配置
├── package.json          # 项目依赖
└── public/               # 生成的静态文件（自动生成）
```

---

## 开发环境搭建

### 系统要求
- Node.js >= 14.0.0
- npm 或 yarn
- Git（可选，用于版本控制）

### 安装步骤

1. **克隆项目**（如果需要）
```bash
git clone <repository-url>
cd xingranya-blog
```

2. **安装依赖**
```bash
npm install
```

3. **安装主题依赖**（如果需要修改主题）
```bash
cd themes/defaultone
npm install
cd ../..
```

4. **启动开发服务器**
```bash
npm run server
```

5. **访问站点**
打开浏览器访问：http://localhost:4000

### 推荐开发工具
- **编辑器**: VS Code（推荐安装Hexo相关插件）
- **终端**: Windows Terminal / CMD / PowerShell
- **Git GUI**: SourceTree / GitKraken（可选）

---

## 常用命令

### 核心命令

| 命令 | 说明 | 使用场景 |
|------|------|----------|
| `npm run server` | 启动开发服务器 | 日常开发 |
| `npm run build` | 构建静态站点 | 部署前准备 |
| `npm run clean` | 清理缓存和生成文件 | 解决渲染问题 |
| `npm run deploy` | 部署站点 | 发布到生产环境 |

### Hexo原生命令

```bash
# 创建新文章
hexo new "文章标题"

# 创建草稿
hexo new draft "草稿标题"

# 发布草稿
hexo publish "草稿标题"

# 生成静态文件
hexo generate

# 启动服务器
hexo server

# 清理缓存
hexo clean

# 部署
hexo deploy
```

### 主题开发命令

```bash
# 构建主题CSS（在themes/defaultone目录下）
npm run build:css

# 构建主题JS（在themes/defaultone目录下）
npm run build:js

# 监听文件变化并自动构建
npm run watch
```

---

## 内容管理

### 创建新文章

#### 方法一：使用命令行
```bash
hexo new "我的第一篇博客"
```

这会在 `source/_posts/` 目录下创建一个名为 `我的第一篇博客.md` 的文件。

#### 方法二：手动创建
在 `source/_posts/` 目录下创建 `.md` 文件，文件名建议使用英文或拼音。

### 文章格式规范

每篇文章都需要包含Front-matter（前置元数据）：

```markdown
---
title: 文章标题
date: 2026-02-01 10:00:00
tags: [标签1, 标签2]
categories: [分类]
author: 作者名
cover: /images/cover.jpg  # 封面图
---

文章正文内容...
```

### 支持的Front-matter字段

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | string | 是 | 文章标题 |
| date | datetime | 是 | 发布时间 |
| tags | array | 否 | 标签列表 |
| categories | array | 否 | 分类列表 |
| author | string | 否 | 作者 |
| cover | string | 否 | 封面图片路径 |
| excerpt | string | 否 | 文章摘要 |
| sticky | boolean | 否 | 是否置顶 |

### 内容写作技巧

#### Markdown语法支持
- 标准Markdown语法
- 代码高亮：使用三个反引号包裹代码块
- 数学公式：支持LaTeX语法
- 流程图：支持Mermaid语法

#### 图片插入
```markdown
![替代文本](/images/图片名.jpg)
```

建议将图片放在 `source/images/` 目录下。

#### 内部链接
```markdown
[链接文本](/文章路径/)
```

---

## 主题定制

### 主题配置文件

主要配置文件位于 `themes/defaultone/_config.yml`，包含以下主要配置项：

#### 基础设置
```yaml
# 站点基础信息
site:
  logo: /images/logo.png
  favicon: /images/favicon.ico
  title: 站点标题
  subtitle: 副标题
  author: 作者名
```

#### 外观设置
```yaml
# 主题外观
appearance:
  theme_color: '#3b82f6'  # 主题色
  dark_mode: true         # 深色模式
  font_size: medium       # 字体大小
```

#### 功能模块
```yaml
# 功能开关
features:
  toc: true              # 目录
  share: true            # 分享按钮
  reward: true           # 打赏功能
  live2d: false          # Live2D看板娘
```

### 自定义样式

#### 修改CSS变量
在 `themes/defaultone/source/css/` 目录下找到相关样式文件，修改CSS变量：

```stylus
:root
  --primary-color: #3b82f6
  --secondary-color: #64748b
  --background-color: #ffffff
  --text-color: #333333
```

#### 添加自定义样式
创建 `themes/defaultone/source/css/custom.styl` 文件：

```stylus
// 自定义样式
.my-custom-class
  color: var(--primary-color)
  font-weight: bold
```

### 自定义JavaScript

在 `themes/defaultone/source/js/` 目录下添加自定义脚本：

```javascript
// custom.js
document.addEventListener('DOMContentLoaded', function() {
  console.log('自定义脚本已加载');
});
```

然后在模板中引入：
```ejs
<script src="<%- url_for('/js/custom.js') %>"></script>
```

### 模板修改

#### 页面布局
主要模板文件位于 `themes/defaultone/layout/`：

- `layout.ejs` - 基础布局
- `index.ejs` - 首页
- `post.ejs` - 文章页
- `page.ejs` - 页面
- `archive.ejs` - 归档页

#### 组件修改
组件模板位于 `themes/defaultone/layout/components/`：

- `header/` - 头部组件
- `footer/` - 底部组件
- `sidebar/` - 侧边栏组件
- `comments/` - 评论组件

### 多语言支持

在 `themes/defaultone/languages/` 目录下可以添加或修改语言包：

```yaml
# zh-CN.yml
nav:
  home: 首页
  about: 关于
  archives: 归档
  tags: 标签
```

---

## 图片自定义指南

### 需要自定义的图片位置清单

#### 1. 基础品牌图片

| 图片文件 | 当前路径 | 建议尺寸 | 格式 | 用途 |
|---------|----------|----------|------|------|
| **favicon.svg** | `/images/favicon.svg` | 32x32 或 任意矢量 | SVG | 浏览器标签页图标 |
| **avatar** | `/images/avatar-0.jpg` | 200x200+ | JPG/PNG | 网站头像（侧边栏） |
| **og.webp** | `/images/og.webp` | 1200x630 | WEBP/PNG | 社交媒体分享预览图 |

**配置位置**：`themes/defaultone/_config.yml`
```yaml
defaults:
  favicon: /images/favicon.svg    # 网站图标
  avatar: /images/avatar-0.jpg    # 头像

global:
  open_graph:
    image: /images/og.webp        # 分享预览图
```

#### 2. 横幅背景图片

| 图片文件 | 当前路径 | 建议尺寸 | 格式 | 用途 |
|---------|----------|----------|------|------|
| **main_bg.jpg** | `/images/main_bg.jpg` | 1920x1080+ | JPG/WebP | 暗色模式横幅背景 |
| **main_bg_ligth.jpg** | `/images/main_bg_ligth.jpg` | 1920x1080+ | JPG/WebP | 亮色模式横幅背景 |

**配置位置**：`themes/defaultone/_config.yml`
```yaml
home_banner:
  image:
    light: /images/main_bg_ligth.jpg   # 亮色模式
    dark: /images/main_bg.jpg           # 暗色模式
```

#### 3. 文章封面图

**默认封面**：`/images/main_bg.jpg`（在主题配置中设置）

**单篇文章封面**：在文章 Front Matter 中指定
```yaml
---
title: 文章标题
cover: /images/cover/linux-cover.jpg  # 为每篇文章设置不同封面
---
```

#### 4. 其他图片资源

| 图片 | 当前路径 | 用途 |
|------|----------|------|
| **bookmark-placeholder.svg** | `/images/bookmark-placeholder.svg` | 书签占位图 |
| **loading.svg** | `/images/loading.svg` | 加载动画 |
| **desc-image.jpg** | `/images/desc-image.jpg` | 描述性图片 |

#### 5. 主题默认图片（可选替换）

以下图片由主题自动生成，如需自定义可创建同名文件覆盖：

| 图片 | 说明 |
|------|------|
| `/images/defaultone-avatar.svg` | 默认SVG头像 |
| `/images/defaultone-favicon.svg` | 默认SVG图标 |
| `/images/defaultone-logo.svg` | 默认SVG Logo |

### 图片资源管理

#### 推荐目录结构

```
source/
└── images/
    ├── favicon.svg              # 网站图标
    ├── avatar.jpg               # 你的头像
    ├── og.webp                  # 分享预览图
    ├── main_bg.jpg              # 暗色背景
    ├── main_bg_light.jpg        # 亮色背景
    ├── loading.svg              # 加载动画
    └── covers/                  # 文章封面目录（可选）
        ├── linux-cover.jpg
        ├── docker-cover.jpg
        └── redis-cover.jpg
```

#### 图片命名规范

- 使用小写字母、数字和连字符
- 避免使用中文和特殊字符
- 使用描述性名称，如：`linux-command-cover.jpg`

### 国内免费图床推荐

| 图床名称 | 网址 | 免费额度 | 特点 |
|---------|------|----------|------|
| **HelloImg（图壳）** | https://www.helloimg.com | 每天100张，5GB存储 | 国内速度快，API友好 |
| **SM.MS** | https://sm.ms | 每月5GB流量 | 稳定可靠，有历史记录 |
| **路过图床** | https://imgtu.com | 每天200张（注册后） | 无需注册即可上传 |
| **新浪微博图床** | - | 完全免费无限 | 稳定但可能压缩图片 |
| **七牛云** | https://www.qiniu.com | 10GB永久免费 | 开发者友好，需要实名 |
| **又拍云** | https://www.upyun.com | 10GB存储/月 | 速度快，有联盟计划 |

### 图片处理工具推荐

| 工具 | 用途 | 网址 |
|------|------|------|
| **TinyPNG** | 图片压缩 | https://tinypng.com |
| **Squoosh** | 图片压缩/转换 | https://squoosh.app |
| **iLoveIMG** | 批量处理 | https://www.iloveimg.com |
| **Favicon.io** | Favicon生成 | https://favicon.io |
| **XnConvert** | 本地批量处理 | https://www.xnview.com |

### 快速设置步骤

1. **创建 images 目录**
```bash
mkdir -p source/images/covers
```

2. **准备图片文件**
   - 将自定义图片放入对应路径
   - 确保文件名与配置一致

3. **更新配置**（如需要）
编辑 `themes/defaultone/_config.yml`，修改图片路径

4. **重新构建**
```bash
npm run clean
npm run build
```

5. **验证效果**
```bash
npm run server
# 访问 http://localhost:4000 检查图片显示
```

### 图片优化建议

1. **格式选择**
   - 照片类：使用 JPG 或 WebP
   - 图标/Logo：使用 SVG（矢量图）
   - 透明背景：使用 PNG

2. **压缩建议**
   - JPG：质量设置 80-85%
   - PNG：使用 TinyPNG 压缩
   - WebP：现代浏览器优先推荐

3. **尺寸建议**
   - 封面图：1920x1080 或更大
   - 头像：200x200 或更大
   - 图标：32x32、64x64、128x128

---

## 部署指南

### 部署前准备

1. **清理旧文件**
```bash
npm run clean
```

2. **构建静态文件**
```bash
npm run build
```

3. **检查生成文件**
查看 `public/` 目录确保文件生成正确

### 部署方式

#### GitHub Pages
1. 在 `_config.yml` 中配置：
```yaml
deploy:
  type: git
  repo: https://github.com/username/repository.git
  branch: gh-pages
```

2. 安装部署插件：
```bash
npm install hexo-deployer-git --save
```

3. 部署：
```bash
npm run deploy
```

#### Vercel
1. 在项目根目录创建 `vercel.json`：
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/node"
    }
  ]
}
```

2. 连接Vercel并部署

#### 传统服务器
1. 将 `public/` 目录下的所有文件上传到服务器
2. 配置Web服务器（Nginx/Apache）指向这些文件

### CDN配置

建议使用CDN加速静态资源：

```yaml
# _config.yml
url: https://your-domain.com
root: /
permalink: :year/:month/:day/:title/
```

---

## 故障排除

### 常见问题及解决方案

#### 1. 页面无法正常显示
**问题**: 访问页面出现空白或样式错乱

**解决方案**:
```bash
# 清理缓存
npm run clean
# 重新生成
npm run build
```

#### 2. 新文章不显示
**问题**: 创建新文章后在首页看不到

**检查项**:
- 确认Front-matter格式正确
- 检查date字段是否为未来时间
- 确认文件保存在 `_posts/` 目录下

#### 3. 样式加载异常
**问题**: CSS样式没有正确应用

**解决方案**:
```bash
# 重新构建主题
cd themes/defaultone
npm run build:css
cd ../..
npm run build
```

#### 4. 本地服务器启动失败
**问题**: `npm run server` 报错

**排查步骤**:
1. 检查Node.js版本是否>=14.0.0
2. 删除 `node_modules` 和 `package-lock.json`
3. 重新安装依赖：`npm install`

#### 5. 部署后图片不显示
**问题**: 本地正常但部署后图片404

**解决方案**:
- 确保图片路径正确（建议使用相对路径）
- 检查CDN配置
- 确认图片文件已正确上传

### 调试技巧

#### 启用调试模式
```bash
hexo server --debug
```

#### 查看生成过程
```bash
hexo generate --verbose
```

#### 检查配置
```bash
hexo config
```

---

## 最佳实践

### 内容管理建议

1. **文章命名规范**
   - 使用英文或拼音命名文件
   - 避免特殊字符和空格
   - 保持名称简洁明了

2. **图片优化**
   - 压缩图片大小
   - 使用WebP格式（现代浏览器支持）
   - 添加alt属性描述

3. **SEO优化**
   - 每篇文章添加合适的标签和分类
   - 编写有意义的文章摘要
   - 使用语义化的标题层级

### 性能优化

1. **资源压缩**
   - 启用Gzip压缩
   - 压缩CSS和JavaScript文件
   - 优化图片大小

2. **缓存策略**
   - 设置合理的缓存头
   - 使用CDN加速
   - 启用浏览器缓存

3. **懒加载**
   - 图片懒加载
   - 代码块按需加载

### 版本控制建议

1. **Git提交规范**
   ```
   feat: 添加新功能
   fix: 修复bug
   docs: 更新文档
   style: 代码格式调整
   refactor: 代码重构
   ```

2. **分支策略**
   - `main` - 生产环境
   - `develop` - 开发环境
   - `feature/*` - 功能分支

3. **备份策略**
   - 定期备份源文件
   - 使用云存储备份重要数据
   - 保持多个版本的历史记录

### 安全建议

1. **配置安全**
   - 不要在公开仓库中暴露敏感信息
   - 使用环境变量管理密钥
   - 定期更新依赖包

2. **内容安全**
   - 验证用户输入
   - 防止XSS攻击
   - 启用内容安全策略

---

## 附录

### 有用的资源

- [Hexo官方文档](https://hexo.io/docs/)
- [EJS模板语法](https://ejs.co/)
- [Stylus CSS预处理器](https://stylus-lang.com/)
- [Tailwind CSS文档](https://tailwindcss.com/docs)

### 相关工具

- [Typora](https://typora.io/) - Markdown编辑器
- [PicGo](https://picgo.github.io/PicGo-Doc/) - 图床工具
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/) - 调试工具

### 联系方式

如有问题，请通过以下方式联系：
- 邮箱: [your-email@example.com]
- GitHub: [your-github-username]

---

*最后更新: 2026年2月1日*