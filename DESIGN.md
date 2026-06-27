---
name: "星苒鸭 · 博客"
description: "技术深度与个人温度并存的暗色优先个人博客视觉系统。"
colors:
  primary-blush: "#FFC0CB"
  navbar-warm: "#f78736"
  navbar-cool: "#367df7"
  light-bg: "#ffffff"
  light-text: "#373D3F"
  dark-bg: "#202124"
  dark-text: "#bebec6"
  banner-light-text: "#1a1a1a"
  banner-dark-text: "#f5f5f5"
  copyright-red: "#CC0033"
typography:
  display:
    fontFamily: "'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "2.8rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0"
  headline:
    fontFamily: "'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "1.4rem"
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: "0"
  body:
    fontFamily: "'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0"
  label:
    fontFamily: "'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "0.92rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.5px"
  mono:
    fontFamily: "'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', monospace"
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
  content-width: "1000px"
  navbar-home-width: "1200px"
components:
  hero-panel:
    backgroundColor: "{colors.dark-bg}"
    textColor: "{colors.banner-dark-text}"
    typography: "{typography.display}"
    rounded: "{rounded.xl}"
    padding: "32px 24px"
  article-card:
    backgroundColor: "{colors.dark-bg}"
    textColor: "{colors.dark-text}"
    rounded: "{rounded.lg}"
    padding: "28px"
  sidebar-card:
    backgroundColor: "{colors.dark-bg}"
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
    rounded: "{rounded.sm}"
    padding: "0"
---

# Design System: 星苒鸭 · 博客

## 1. Overview

**Creative North Star: "夜间工作台上的温热笔记"**

这套视觉系统只服务博客前台：主页、文章列表、文章阅读页、标签/分类/归档和个人展示页。它的核心气质来自 `PRODUCT.md` 的三词关键词：**专业 · 简洁 · 有温度**。默认暗色模式是主体验，亮色模式是补充；整体应该像夜里打开的一本技术笔记，信息清楚、边界克制，但仍能看见个人表达。

主页允许有视觉记忆点：固定首屏图片、毛玻璃标题面板、社交图标胶囊、带缩略图的文章卡片。但装饰永远不能压过阅读。博客不是纯文档站；它要让搜索来的读者快速抵达答案，同时让人知道这是星苒鸭自己的空间。

**Key Characteristics:**
- 暗色优先，亮色兼容；不要反过来设计。
- 内容宽度收束在 1000px 附近，保持可读密度。
- 粉色主色只做少量识别与 hover 强调，不能铺满页面。
- 首屏可以有图片和轻毛玻璃，文章正文必须安静。
- 动效只做进入、hover、滚动反馈；不能做满屏粒子和 3D 喧宾夺主。

## 2. Colors

配色是深色技术博客底盘加一枚柔和粉色签名；导航允许暖橙到冷蓝的动态过渡，但正文与文章列表必须回到低噪声的中性层级。

### Primary
- **星苒粉**：前台唯一品牌主色，用于链接 hover、重点状态、选择色和少量识别元素。它的稀少感就是辨识度。

### Secondary
- **导航暖橙**：只用于导航栏渐变起点，负责一点人味和进入感。
- **导航冷蓝**：只用于导航栏渐变终点，负责技术感和清爽边界。

### Neutral
- **夜间背景**：默认页面背景，承载主页、文章列表和阅读页的暗色体验。
- **夜间正文**：暗色模式正文文字，不能再降低到不可读的灰。
- **白昼背景**：亮色模式背景，必须保持纯净，不要变成奶油色、羊皮纸色或暖米色。
- **白昼正文**：亮色模式正文，保持接近墨色的阅读对比度。
- **横幅浅色文字 / 横幅暗色文字**：只用于首屏图片上的标题和副标题，确保图片前景可读。

### Named Rules
**The Pink Signature Rule.** 星苒粉只出现在重点、链接和状态里；一个屏幕里粉色面积超过 10% 就已经过量。

**The Dark First Rule.** 新增前台页面先按暗色模式验收，再检查亮色模式；暗色不能是亮色的机械反相。

**The No Cream Rule.** 禁止把“有温度”翻译成奶油色背景、米色卡片或泛黄纸感；温度来自图片、排版节奏和个人文案。

## 3. Typography

**Display Font:** Source Sans Pro, with system sans fallbacks  
**Body Font:** Source Sans Pro, with system sans fallbacks  
**Label/Mono Font:** SFMono-Regular / Menlo / Monaco / Consolas 只用于代码块和编辑器。

**Character:** 单一 sans 字体系统让博客更像稳定的技术笔记，而不是杂志封面。字重承担层级，颜色承担状态，字号不夸张。

### Hierarchy
- **Display** (600, 2.8rem, 1.2): 只用于主页首屏标题。
- **Headline** (600, 1.4rem, 1.5): 用于首页文章卡标题，移动端降到 1.2rem。
- **Title** (600, 2.5rem-3.75rem, 1.2): 用于文章页标题，允许比卡片标题更有存在感。
- **Body** (400, 16px, 1.5): 用于文章摘要、正文和普通段落；正文行宽保持 65-75ch。
- **Label** (500, 0.92rem, 0.5px): 用于文章日期、分类、标签、侧边栏链接和次级元信息。
- **Mono** (400, 16px, 1.6): 只用于代码块和写作编辑器，不用于导航、按钮或普通标签。

### Named Rules
**The Readability First Rule.** 技术文章正文永远优先可读；不要用展示字、超轻字重、过紧字距来牺牲阅读。

**The One Family Rule.** 前台界面默认只用 Source Sans Pro 和系统 fallback；不要新增相近的几何 sans 或装饰 serif。

## 4. Elevation

前台使用轻量阴影和半透明层级来制造深度。主页首屏和社交胶囊可以使用毛玻璃；文章卡、侧边栏和正文容器使用 `redefine-box-shadow` 系列。阴影是层级，不是装饰。

### Shadow Vocabulary
- **Standard Container** (`var(--redefine-box-shadow)`): 用于首页文章卡片和侧边栏主容器。
- **Flat Container** (`var(--redefine-box-shadow-flat)`): 用于较轻的按钮、侧边工具、代码块和次级卡片。
- **Hover Container** (`var(--redefine-box-shadow-hover)`): 只在可交互卡片 hover 时出现。
- **Hero Glass** (`backdrop-blur-2xl` with translucent black/white surface): 只用于首页横幅标题和社交联系胶囊。

### Named Rules
**The Quiet Surface Rule.** 文章阅读区不能使用厚重投影；如果阴影比内容更抢眼，立刻降级为 flat 或去掉。

**The Glass Only At The Door Rule.** 毛玻璃只允许在主页首屏和二维码浮层出现；文章正文、归档和普通列表不要使用玻璃拟态。

## 5. Components

### Buttons
- **Shape:** 胶囊或小圆角，社交按钮用 full pill，普通文本按钮用 9px 小圆角。
- **Primary:** 前台没有大面积 CTA。阅读更多、分页、侧边工具以文字链接或轻按钮呈现，hover 时使用星苒粉。
- **Hover / Focus:** hover 使用颜色变化、轻微位移或阴影增强；focus 必须可见。
- **Secondary / Ghost:** 社交图标和向下滚动按钮使用半透明背景、细边框、轻毛玻璃。

### Chips
- **Style:** 文章分类、标签、置顶标识使用小尺寸文字、细边框和透明背景。
- **State:** hover 只改变文字或边框，不改变布局；标签数量受限，首页最多展示 3 个。

### Cards / Containers
- **Corner Style:** 首页文章卡和侧边栏使用柔和大圆角（18px），正文图片使用中圆角（14px）。
- **Background:** 暗色模式使用半透明背景层叠在固定横幅图之上；亮色模式使用白色与轻灰层级。
- **Shadow Strategy:** 默认轻阴影，hover 才增强；卡片不能同时堆叠厚边框和大投影。
- **Border:** 使用 1px 低对比边框表达边界，不使用侧边彩条。
- **Internal Padding:** 首页文章卡正文区 28px；侧边栏 15-20px；组件间距以 38px 为基础节奏。

### Inputs / Fields
- **Style:** 搜索框遵循主题默认输入样式；背景与页面模式同步。
- **Focus:** 聚焦态必须清晰，不允许只靠阴影或颜色微差。
- **Error / Disabled:** 前台少表单；出现错误时使用明确文字，不只用颜色。

### Navigation
- **Style:** 导航栏宽度首页 1200px，其他页面 1000px；高度 70px，收缩高度约 50px。
- **Typography:** 使用 Source Sans Pro，中等字重，图标和文字并列。
- **Default / Hover / Active:** 默认克制，hover 使用主色或浅背景；不要出现大面积高饱和块。
- **Mobile:** 首页侧边栏移动端进入内容流；导航复杂度在窄屏收起，不压缩成拥挤横排。

### Home Hero
- **Style:** 固定全屏背景图，浅色/暗色分别使用不同图片。
- **Title Panel:** 居中、半透明、圆角 24px、毛玻璃，文字大小从 2xl 到 5xl 响应式变化。
- **Social Dock:** 底部胶囊，图标等距排列，二维码浮层只在 hover/触发时出现。

### Article Card
- **Style:** 可带 16:9 缩略图，图片底部用轻遮罩过渡到文本区。
- **Title:** 600 字重，1.4rem，移动端递减。
- **Meta:** 日期、分类、标签在同一行；移动端隐藏低优先级分类/标签，保留主要阅读路径。

## 6. Do's and Don'ts

### Do:
- **Do** 先按暗色模式检查主页、文章卡和正文，再补亮色模式。
- **Do** 使用真实图片承载首页第一印象；首屏不要退化成纯色块。
- **Do** 保持正文可读，技术内容的代码块、标题层级、TOC 和搜索优先级高于装饰。
- **Do** 使用星苒粉做少量识别和 hover，不要把它扩展成整页粉色主题。
- **Do** 让侧边栏、文章卡、分页和阅读更多保持同一种轻容器语言。
- **Do** 支持 `prefers-reduced-motion`，动效要能被关闭或降级。

### Don't:
- **Don't** 做“过度花哨的个人主页（满屏粒子特效、3D 动画喧宾夺主）”。
- **Don't** 做“千篇一律的 AI 生成风格（奶油色背景、千篇一律的卡片网格、无意义的渐变文字）”。
- **Don't** 做“信息密度过低的极简博客（大量留白但内容稀薄）”。
- **Don't** 做“纯技术文档站风格（缺少个人辨识度）”。
- **Don't** 使用渐变文字、侧边彩条、斜纹背景、手绘涂鸦 SVG 或 32px 以上卡片圆角。
