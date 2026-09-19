---
name: "星苒鸭 · 博客"
description: "暗色优先的技术笔记站：壳层半透明毛玻璃，正文保持安静。"
colors:
  primary-blush: "#FFC0CB"
  navbar-warm: "#f78736"
  navbar-cool: "#367df7"
  dark-bg: "#202124"
  dark-text: "#bebec6"
  light-bg: "#ffffff"
  light-text: "#373D3F"
  banner-light-text: "#1a1a1a"
  banner-dark-text: "#f5f5f5"
  copyright-red: "#CC0033"
  glass-dark: "rgba(32, 33, 36, 0.8)"
  glass-light: "rgba(255, 255, 255, 0.8)"
  glass-hero: "rgba(32, 33, 36, 0.4)"
  border-dark: "rgba(255, 255, 255, 0.08)"
  border-light: "rgba(0, 0, 0, 0.08)"
typography:
  display:
    fontFamily: "'Chillax-Variable', sans-serif"
    fontSize: "2.8rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0"
  headline:
    fontFamily: "'Geist Variable', 'Noto Sans SC', sans-serif"
    fontSize: "1.4rem"
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: "0"
  title:
    fontFamily: "'Geist Variable', 'Noto Sans SC', sans-serif"
    fontSize: "3.2rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0"
  body:
    fontFamily: "'Geist Variable', 'Noto Sans SC', -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0"
  label:
    fontFamily: "'Geist Variable', 'Noto Sans SC', sans-serif"
    fontSize: "0.92rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.5px"
  mono:
    fontFamily: "'Geist Mono', 'SFMono-Regular', Menlo, Monaco, Consolas, monospace"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0"
rounded:
  xs: "4px"
  sm: "9px"
  md: "14px"
  lg: "18px"
  xl: "24px"
  full: "999px"
spacing:
  xs: "5px"
  sm: "10px"
  md: "20px"
  lg: "38px"
  content: "1000px"
  navbar-home: "1200px"
components:
  hero-panel:
    backgroundColor: "{colors.glass-hero}"
    textColor: "{colors.banner-dark-text}"
    typography: "{typography.display}"
    rounded: "{rounded.xl}"
    padding: "24px 40px"
  article-card:
    backgroundColor: "{colors.glass-dark}"
    textColor: "{colors.dark-text}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "28px"
  sidebar-card:
    backgroundColor: "{colors.glass-dark}"
    textColor: "{colors.dark-text}"
    rounded: "{rounded.lg}"
    padding: "20px"
  nav-link:
    textColor: "{colors.dark-text}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "5px 10px"
  read-more:
    textColor: "{colors.dark-text}"
    typography: "{typography.label}"
    padding: "0"
---

# Design System: 星苒鸭 · 博客

## Overview

**Creative North Star: "夜间工作台上的温热笔记"**

这套系统服务博客前台：首页、文章列表、阅读页、归档/分类/标签、关于和项目。气质跟产品三词对齐：**专业 · 简洁 · 有温度**。默认是夜里打开的技术笔记：信息清楚、边界克制，仍能看出是星苒鸭的空间。

记忆点在门口：固定首屏图、毛玻璃标题板、社交胶囊。进到正文后安静下来。壳层（导航、卡片、侧栏、搜索、项目页）半透明，让背景透出来；Markdown 不再套一层雾。

**Key Characteristics:**
- 暗色优先，亮色是补充，不要反过来设计。
- 内容宽度约 1000px，首页导航约 1200px。
- 星苒粉只做识别和 hover，不能铺满一屏。
- 壳层 `blur(18px)`；正文不雾。
- 动效只做进入、hover、滚动；支持减弱动态。

## Colors

深色技术底盘加一枚浅粉签名；导航可以用暖橙到冷蓝的渐变，但列表和正文要回到低噪声中性色。

### Primary
- **星苒粉**：链接 hover、选中、少量识别。稀少才是辨识度。

### Secondary
- **导航玻璃**：离开首屏后用不透明更高的壳层玻璃，不再用橙蓝渐变抢签名。

### Neutral
- **夜间背景 / 夜间正文**：暗色模式的底和字。
- **白昼背景 / 白昼正文**：亮色模式；背景保持纯白，不要做成奶油色。
- **横幅浅色字 / 横幅暗色字**：只给首屏图上的标题用。
- **壳层玻璃**：暗色 `rgba(32, 33, 36, 0.8)`，亮色 `rgba(255, 255, 255, 0.8)`；首屏标题板更透，用 40% 暗色。

### Named Rules
**The Pink Signature Rule.** 星苒粉只出现在重点、链接和状态里；一屏粉色面积超过 10% 就过量。

**The Dark First Rule.** 新前台先过暗色，再过亮色；暗色不是亮色的反相。

**The No Cream Rule.** 「有温度」不是奶油底、米色卡或泛黄纸感；温度来自照片、节奏和文案。

## Typography

**Display Font:** Chillax Variable（首屏标题）  
**Body Font:** Geist Variable + Noto Sans SC  
**Label/Mono Font:** Geist Variable（标签）；Geist Mono / SFMono（代码）

**Character:** 正文像稳定的技术笔记，首屏用 Chillax 拉开一点识别度。字重分层级，颜色管状态，不要夸张字号。

### Hierarchy
- **Display** (600, 2.8rem, 1.2)：只用于首页首屏标题。
- **Headline** (600, 1.4rem, 1.5)：首页文章卡标题；窄屏降到 1.2rem。
- **Title** (600, 3.2rem, 1.2)：文章页标题。
- **Body** (400, 16px, 1.5)：摘要和正文；行宽约 65–75ch。
- **Label** (500, 0.92rem, 0.5px tracking)：日期、分类、标签、侧栏链接。
- **Mono** (400, 16px, 1.6)：只给代码块。

### Named Rules
**The Readability First Rule.** 技术正文永远优先可读；不用展示字、超轻字重或过紧字距去换感觉。

**The Role Font Rule.** Chillax 停在首屏；Geist / Noto 管阅读和界面；等宽只出现在代码里。

## Layout

单栏阅读加可选侧栏。内容最大宽度 1000px；首页导航 1200px；侧栏约 210–240px。组件间距以 38px 为节奏，平板和手机按 0.8 / 0.6 收。断点：640px 手机、768px 平板。首页文章卡可带 16:9 图；移动端侧栏进入文档流，导航收起，不要挤成一行。

## Elevation & Depth

混合：休息时靠半透明层 + 轻阴影；交互时阴影略加强。毛玻璃是壳层材质，不是装饰滤镜。

### Shadow Vocabulary
- **Standard Container** (`var(--shadow-color-2) 0 6px 24px, var(--shadow-color-1) 0 0 0 1px`)：首页卡、侧栏。
- **Flat Container** (`0 1px 4px` + 1px 描边)：工具按钮、代码块、次级卡。
- **Hover Container**：可点卡片 hover 时用。
- **Quiet Glass** (`backdrop-filter: blur(18px) saturate(1.12)`)：导航、卡片、侧栏、搜索、项目页、版权栏。

### Named Rules
**The Quiet Surface Rule.** 阅读区不要厚投影；阴影比字抢眼就降成 flat 或去掉。

**The Quiet Glass Rule.** 雾在壳上，不在字上。Markdown 正文不要再套一层 `backdrop-filter`。

## Shapes

大容器 18px，图片和中等面板 14px，控件 9px，社交胶囊全圆。边框 1px 低对比，不用侧边彩条。卡片圆角不要超过 24px 的首屏标题板；32px 以上禁止。

## Components

### Buttons
- **Shape:** 社交入口全胶囊；普通文字按钮约 9px。
- **Primary:** 前台没有大面积主按钮。阅读全文、分页、侧工具是文字或轻按钮，hover 变星苒粉。
- **Hover / Focus:** 颜色、轻微位移或阴影；focus 必须看得见（2px 主色描边，offset 3px）。
- **Secondary / Ghost:** 社交图标和向下滚用半透明底 + 细边 + 轻雾。

### Chips
- **Style:** 分类、标签、置顶：小字、细边、透明或轻雾底。
- **State:** hover 只改字或边，不改布局；首页标签最多 3 个。

### Cards / Containers
- **Corner Style:** 文章卡和侧栏 18px。
- **Background:** 暗色玻璃 80%；叠在固定首屏图上。
- **Shadow Strategy:** 默认 standard，hover 才加强。
- **Border:** 1px 低对比；不要左边彩条。
- **Internal Padding:** 文章卡正文区约 28px；侧栏 15–20px。

### Inputs / Fields
- **Style:** 搜索跟主题底走。
- **Focus:** 必须清晰，不能只靠阴影微差。
- **Error / Disabled:** 前台少表单；出错用文字说明。

### Navigation
- **Style:** 首页宽 1200px，内页 1000px；高 70px，收缩约 50px。壳层玻璃 + `blur(18px)`，离开首屏后提高不透明度。
- **Typography:** 中等字重，图标和文字并列。
- **Default / Hover / Active:** 默认克制，hover 主色或浅底，不要大块高饱和。
- **Mobile:** 菜单收起，不要挤横排。

### Home Hero
- **Style:** 固定全屏背景，亮/暗各一张图。
- **Title Panel:** 居中、更透的玻璃、24px 圆角、`blur(22px)`。
- **Social Dock:** 底部胶囊；微信/QQ 二维码只在触发时出现。

### Article Card
- **Style:** 可带 16:9 缩略图，底部用轻遮罩接到文字。
- **Title:** 600 / 1.4rem。
- **Meta:** 日期、分类、标签同一行；窄屏藏次要项。

## Do's and Don'ts

### Do:
- **Do** 先过暗色首页、卡片和正文，再过亮色。
- **Do** 用真实照片做第一印象，首屏不要退化成纯色块。
- **Do** 让代码块、标题层级、目录和搜索高于装饰。
- **Do** 星苒粉只做少量识别和 hover。
- **Do** 侧栏、文章卡、分页、阅读全文用同一种轻容器语言。
- **Do** 尊重 `prefers-reduced-motion`。

### Don't:
- **Don't** 满屏粒子和 3D 压过内容。
- **Don't** 奶油底、网格套模板、渐变文字。
- **Don't** 靠大留白装极简却没有信息。
- **Don't** 做成没有个人辨识度的纯文档站。
- **Don't** 侧边彩条、斜纹底、手绘涂鸦 SVG，或大于 24px 的常规卡片圆角。
- **Don't** 在 Markdown 正文上再加一层毛玻璃。
