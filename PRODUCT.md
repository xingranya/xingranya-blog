# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

博主本人：记录折腾过程、沉淀技术经验。

搜索进来的路人：带着具体问题来，需要清晰的答案和良好的阅读体验。

两类都是主用户，不互相降级。

## Product Purpose

这是星苒鸭（xingranya）的个人技术博客。内容以 AI、前端、安卓折腾、运维等方向的实操教程和经验总结为主。成功标准：读者能快速找到并理解解决方案，同时能感到这是星苒鸭自己的空间。

## Positioning

可照着做的实操教程，加上个人折腾过程。邻站可以有教程，也可以有作品集，但不能同时是「星苒鸭亲手做过、能复现」的笔记。

## Operating Context

- 线上博客：https://blog.xran.uk
- 个人主页（规划中，从主页跳到博客）：https://xran.uk
- GSAT 产品站：https://gsat.xran.uk
- 源码在本仓库：Hexo 生成静态站，主题在 `themes/defaultone`
- 本地预览：`npm run server`（http://localhost:4000）
- 构建：`npm run build`
- 博客源站走腾讯云 EdgeOne；不用 Cloudflare Pages 托管博客

## Capabilities and Constraints

- 前台能力：文章、分类、标签、归档、搜索、关于、项目、友链、图库、评论、Live2D。
- 博客正式域名固定为 `blog.xran.uk`。canonical、sitemap、Open Graph、RSS 都以它为准。
- `xran.uk` 留给个人主页，不把博客当成该域名的长期内容。
- `gsat.xingranya.cn` 不再作为 GSAT 官网；官网是 `gsat.xran.uk`。
- `gsat.xingranya.cn` 以外的产品子域若仍在使用，不当成博客域名去改。
- 未决：个人主页上线前，`xran.uk` 是否整站 301 到博客，由部署时决定，不在此写死。

## Brand Commitments

名称：星苒鸭 · 博客；作者 xingranya。

语气：专业但不枯燥，简洁但不冷淡，有温度但不矫情。技术内容严谨可靠，个人表达自然克制。

三词关键词：**专业 · 简洁 · 有温度**

不要做成：满屏粒子和 3D 喧宾夺主的个人主页；奶油色、卡片网格、渐变文字那种套模板站；信息稀薄的假极简；也没有个人辨识度的纯文档站。

## Evidence on Hand

- 文章：`source/_posts/`
- 关于与项目：`source/about/index.md`、`source/projects/index.md`
- 友链与图库数据：`source/_data/`
- GitHub：https://github.com/xingranya
- 不要编造读者评价、流量数字、奖项细节或未在仓库/对话中出现的产品能力。

## Product Principles

1. 阅读体验优先：装饰不能挡住答案。
2. 实操可信：步骤、代码和排版要让人敢跟着做。
3. 有个人温度，但不靠堆特效。
4. 导航和检索要好用：目录、搜索、分类标签是功能，不是摆设。
5. 域名和展示边界要清楚：博客、主页、产品站各司其职。

## Accessibility & Inclusion

- 目标：WCAG 2.1 AA
- 支持 `prefers-reduced-motion`
- 暗色/亮色都要有足够文字对比度
- 代码块使用可读配色
