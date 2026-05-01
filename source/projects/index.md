---
title: 我的项目
date: 2025-10-24 21:01:26
type: "page"
comments: false
---

<style>
  .project-page {
    --project-line: var(--border-color);
    --project-muted: var(--third-text-color);
    --project-strong: var(--first-text-color);
    --project-surface: var(--second-background-color);
    --project-soft: var(--third-background-color);
    display: flex;
    flex-direction: column;
    gap: 26px;
  }

  .project-intro {
    display: grid;
    grid-template-columns: minmax(0, 1.45fr) minmax(260px, .55fr);
    gap: 22px;
    align-items: stretch;
    border-bottom: 1px solid var(--project-line);
    padding: 4px 0 28px;
  }

  .project-kicker {
    display: inline-flex;
    width: fit-content;
    align-items: center;
    gap: 8px;
    border: 1px solid var(--project-line);
    border-radius: 999px;
    padding: 5px 12px;
    color: var(--primary-color);
    background: var(--project-soft);
    font-size: 13px;
    font-weight: 700;
    line-height: 1.4;
  }

  .project-lead {
    margin: 16px 0 0;
    color: var(--project-strong);
    font-size: 28px;
    font-weight: 800;
    line-height: 1.35;
    letter-spacing: 0;
  }

  .project-copy {
    max-width: 780px;
    margin: 12px 0 0;
    color: var(--project-muted);
    font-size: 15px;
    line-height: 1.85;
  }

  .project-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 18px;
  }

  .project-action {
    display: inline-flex;
    min-height: 36px;
    align-items: center;
    gap: 8px;
    border: 1px solid var(--project-line);
    border-radius: 8px;
    padding: 6px 12px;
    color: var(--project-strong);
    background: var(--project-surface);
    font-size: 14px;
    font-weight: 700;
    text-decoration: none;
    transition: border-color .2s ease, color .2s ease, transform .2s ease;
  }

  .project-action:hover {
    transform: translateY(-2px);
    border-color: var(--primary-color);
    color: var(--primary-color);
    text-decoration: none;
  }

  .project-index {
    display: grid;
    gap: 10px;
    align-content: start;
  }

  .project-index-item {
    border-left: 3px solid var(--primary-color);
    padding: 4px 0 4px 12px;
  }

  .project-index-item strong {
    display: block;
    color: var(--project-strong);
    font-size: 18px;
    line-height: 1.25;
  }

  .project-index-item span {
    display: block;
    margin-top: 3px;
    color: var(--project-muted);
    font-size: 13px;
    line-height: 1.5;
  }

  .project-section-head {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
  }

  .project-section-title {
    margin: 0;
    color: var(--project-strong);
    font-size: 23px;
    line-height: 1.35;
  }

  .project-section-desc {
    max-width: 680px;
    margin: 6px 0 0;
    color: var(--project-muted);
    font-size: 14px;
    line-height: 1.75;
  }

  .project-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }

  .project-card {
    display: flex;
    min-height: 248px;
    flex-direction: column;
    justify-content: space-between;
    border: 1px solid var(--project-line);
    border-radius: 8px;
    padding: 18px;
    background: var(--project-surface);
    box-shadow: var(--redefine-box-shadow-flat);
    transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease;
  }

  .project-card:hover {
    transform: translateY(-3px);
    border-color: var(--primary-color);
    box-shadow: var(--redefine-box-shadow);
  }

  .project-card-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
  }

  .project-name {
    margin: 0;
    color: var(--project-strong);
    font-size: 18px;
    line-height: 1.35;
  }

  .project-type {
    margin: 5px 0 0;
    color: var(--primary-color);
    font-size: 13px;
    font-weight: 700;
    line-height: 1.5;
  }

  .project-icon {
    display: inline-flex;
    width: 38px;
    height: 38px;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--project-line);
    border-radius: 8px;
    color: var(--primary-color);
    background: var(--project-soft);
    font-size: 16px;
  }

  .project-desc {
    margin: 14px 0 0;
    color: var(--project-muted);
    font-size: 14px;
    line-height: 1.8;
  }

  .project-detail-list {
    display: grid;
    gap: 6px;
    margin: 14px 0 0;
    padding: 0;
    list-style: none;
  }

  .project-detail-list li {
    display: flex;
    gap: 8px;
    color: var(--project-muted);
    font-size: 13px;
    line-height: 1.65;
  }

  .project-detail-list i {
    margin-top: 4px;
    color: var(--primary-color);
    font-size: 10px;
  }

  .project-card-footer {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-top: 18px;
    border-top: 1px solid var(--project-line);
    padding-top: 13px;
  }

  .project-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .project-tag {
    display: inline-flex;
    align-items: center;
    min-height: 23px;
    border-radius: 999px;
    padding: 2px 9px;
    color: var(--project-muted);
    background: var(--project-soft);
    font-size: 12px;
    line-height: 1.4;
  }

  .project-link {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    color: var(--primary-color);
    font-size: 13px;
    font-weight: 800;
    text-decoration: none;
    white-space: nowrap;
  }

  .project-link:hover {
    text-decoration: underline;
  }

  .project-lab {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }

  .project-lab-item {
    border: 1px solid var(--project-line);
    border-radius: 8px;
    padding: 16px;
    background: linear-gradient(180deg, var(--project-surface), var(--background-color-transparent));
  }

  .project-lab-item h3 {
    margin: 0;
    color: var(--project-strong);
    font-size: 17px;
    line-height: 1.35;
  }

  .project-lab-item p {
    margin: 8px 0 0;
    color: var(--project-muted);
    font-size: 14px;
    line-height: 1.75;
  }

  .project-lab-links {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 12px;
  }

  .project-note {
    border-top: 1px solid var(--project-line);
    padding-top: 20px;
    color: var(--project-muted);
    font-size: 14px;
    line-height: 1.85;
  }

  @media (max-width: 768px) {
    .project-intro,
    .project-grid,
    .project-lab {
      grid-template-columns: 1fr;
    }

    .project-lead {
      font-size: 23px;
    }

    .project-section-head {
      align-items: flex-start;
      flex-direction: column;
    }

    .project-card {
      min-height: auto;
    }
  }
</style>

<div class="project-page">

<section class="project-intro">
  <div>
    <span class="project-kicker"><i class="fa-brands fa-github"></i> GitHub @xingranya</span>
    <p class="project-lead">项目按应用场景和交付形态整理，方便快速查看作品范围与源码。</p>
    <p class="project-copy">内容覆盖医疗 AI、文本数字化、生态协作、交易系统、个人博客与数据分析等方向。每个项目保留清晰的定位说明、技术标签和仓库入口，便于了解实现思路与当前完成度。</p>
    <div class="project-actions">
      <a class="project-action" href="https://github.com/xingranya" target="_blank" rel="noopener">
        <i class="fa-brands fa-github"></i> 查看 GitHub 主页
      </a>
      <a class="project-action" href="/about/">
        <i class="fa-solid fa-user"></i> 关于作者
      </a>
    </div>
  </div>
  <div class="project-index" aria-label="项目概览">
    <div class="project-index-item">
      <strong>10</strong>
      <span>当前展示项目</span>
    </div>
    <div class="project-index-item">
      <strong>Vue / TS / Java / Python</strong>
      <span>主要工程栈</span>
    </div>
    <div class="project-index-item">
      <strong>AI 应用 + Web 工程</strong>
      <span>近期重点方向</span>
    </div>
  </div>
</section>

<section class="project-section-head">
  <div>
    <h2 class="project-section-title">重点项目</h2>
    <p class="project-section-desc">这些仓库覆盖较完整的应用场景，包含页面交付、业务流程和功能模块设计，适合作为主要作品入口。</p>
  </div>
</section>

<section class="project-grid">
  <article class="project-card">
    <div>
      <div class="project-card-header">
        <div>
          <h3 class="project-name">CervixDetectAI</h3>
          <p class="project-type">医疗 AI 检测应用</p>
        </div>
        <span class="project-icon"><i class="fa-solid fa-notes-medical"></i></span>
      </div>
      <p class="project-desc">面向宫颈癌辅助筛查场景的前端应用，聚焦影像提交、检测结果展示和筛查流程呈现。</p>
      <ul class="project-detail-list">
        <li><i class="fa-solid fa-circle"></i><span>覆盖检测结果页面、业务状态展示和关键操作入口。</span></li>
        <li><i class="fa-solid fa-circle"></i><span>可扩展病例管理、报告导出和多角色权限能力。</span></li>
      </ul>
    </div>
    <div class="project-card-footer">
      <div class="project-tags">
        <span class="project-tag">Vue</span>
        <span class="project-tag">AI 医疗</span>
      </div>
      <a class="project-link" href="https://github.com/xingranya/CervixDetectAI" target="_blank" rel="noopener">
        查看源码 <i class="fa-solid fa-arrow-right"></i>
      </a>
    </div>
  </article>

  <article class="project-card">
    <div>
      <div class="project-card-header">
        <div>
          <h3 class="project-name">CervixDetectAI-Home</h3>
          <p class="project-type">项目官网与产品介绍</p>
        </div>
        <span class="project-icon"><i class="fa-solid fa-house-medical"></i></span>
      </div>
      <p class="project-desc">CervixDetectAI 的项目展示主页，用于呈现项目背景、核心能力、应用价值和访问入口。</p>
      <ul class="project-detail-list">
        <li><i class="fa-solid fa-circle"></i><span>面向访问者组织项目信息，降低理解成本。</span></li>
        <li><i class="fa-solid fa-circle"></i><span>适合承载案例截图、演示视频和部署入口。</span></li>
      </ul>
    </div>
    <div class="project-card-footer">
      <div class="project-tags">
        <span class="project-tag">Vue</span>
        <span class="project-tag">官网</span>
      </div>
      <a class="project-link" href="https://github.com/xingranya/CervixDetectAI-Home" target="_blank" rel="noopener">
        查看源码 <i class="fa-solid fa-arrow-right"></i>
      </a>
    </div>
  </article>

  <article class="project-card">
    <div>
      <div class="project-card-header">
        <div>
          <h3 class="project-name">TextDigitalisation-IP</h3>
          <p class="project-type">文本数字化工具</p>
        </div>
        <span class="project-icon"><i class="fa-solid fa-file-signature"></i></span>
      </div>
      <p class="project-desc">面向文本整理和知识产权材料处理的工具型项目，聚焦资料录入、结构化呈现和流程化管理。</p>
      <ul class="project-detail-list">
        <li><i class="fa-solid fa-circle"></i><span>包含表单、材料管理、状态追踪等业务组件方向。</span></li>
        <li><i class="fa-solid fa-circle"></i><span>可扩展 OCR 识别、文件导出和审核流程。</span></li>
      </ul>
    </div>
    <div class="project-card-footer">
      <div class="project-tags">
        <span class="project-tag">TypeScript</span>
        <span class="project-tag">数字化</span>
      </div>
      <a class="project-link" href="https://github.com/xingranya/TextDigitalisation-IP" target="_blank" rel="noopener">
        查看源码 <i class="fa-solid fa-arrow-right"></i>
      </a>
    </div>
  </article>

  <article class="project-card">
    <div>
      <div class="project-card-header">
        <div>
          <h3 class="project-name">EcoLink</h3>
          <p class="project-type">生态协作主题应用</p>
        </div>
        <span class="project-icon"><i class="fa-solid fa-leaf"></i></span>
      </div>
      <p class="project-desc">围绕环保与协作主题搭建的 Vue 应用，将议题信息、行动入口和参与流程整合到线上页面。</p>
      <ul class="project-detail-list">
        <li><i class="fa-solid fa-circle"></i><span>支持内容展示、任务入口和活动信息组织。</span></li>
        <li><i class="fa-solid fa-circle"></i><span>可扩展报名、积分和数据看板能力。</span></li>
      </ul>
    </div>
    <div class="project-card-footer">
      <div class="project-tags">
        <span class="project-tag">Vue</span>
        <span class="project-tag">协作平台</span>
      </div>
      <a class="project-link" href="https://github.com/xingranya/EcoLink" target="_blank" rel="noopener">
        查看源码 <i class="fa-solid fa-arrow-right"></i>
      </a>
    </div>
  </article>

  <article class="project-card">
    <div>
      <div class="project-card-header">
        <div>
          <h3 class="project-name">Second-hand-goods-transaction</h3>
          <p class="project-type">二手交易系统</p>
        </div>
        <span class="project-icon"><i class="fa-solid fa-store"></i></span>
      </div>
      <p class="project-desc">面向校园或社区场景的二手交易系统，围绕商品发布、浏览检索、交易流转和后台管理设计。</p>
      <ul class="project-detail-list">
        <li><i class="fa-solid fa-circle"></i><span>覆盖领域建模、接口组织和交易状态管理。</span></li>
        <li><i class="fa-solid fa-circle"></i><span>可扩展支付模拟、消息通知和风控规则。</span></li>
      </ul>
    </div>
    <div class="project-card-footer">
      <div class="project-tags">
        <span class="project-tag">Java</span>
        <span class="project-tag">业务系统</span>
      </div>
      <a class="project-link" href="https://github.com/xingranya/Second-hand-goods-transaction" target="_blank" rel="noopener">
        查看源码 <i class="fa-solid fa-arrow-right"></i>
      </a>
    </div>
  </article>

  <article class="project-card">
    <div>
      <div class="project-card-header">
        <div>
          <h3 class="project-name">SmartTech</h3>
          <p class="project-type">智能技术原型</p>
        </div>
        <span class="project-icon"><i class="fa-solid fa-microchip"></i></span>
      </div>
      <p class="project-desc">用于智能技术场景验证的 TypeScript 项目，聚焦页面结构、功能模块和交互流程搭建。</p>
      <ul class="project-detail-list">
        <li><i class="fa-solid fa-circle"></i><span>强调原型落地速度与模块化组织方式。</span></li>
        <li><i class="fa-solid fa-circle"></i><span>可沉淀为组件集合或演示平台。</span></li>
      </ul>
    </div>
    <div class="project-card-footer">
      <div class="project-tags">
        <span class="project-tag">TypeScript</span>
        <span class="project-tag">原型验证</span>
      </div>
      <a class="project-link" href="https://github.com/xingranya/SmartTech" target="_blank" rel="noopener">
        查看源码 <i class="fa-solid fa-arrow-right"></i>
      </a>
    </div>
  </article>

  <article class="project-card">
    <div>
      <div class="project-card-header">
        <div>
          <h3 class="project-name">xingranya-blog</h3>
          <p class="project-type">个人内容平台</p>
        </div>
        <span class="project-icon"><i class="fa-solid fa-pen-nib"></i></span>
      </div>
      <p class="project-desc">当前博客的源码仓库，基于 Hexo 和自定义主题维护文章发布、页面展示、导航结构和部署流程。</p>
      <ul class="project-detail-list">
        <li><i class="fa-solid fa-circle"></i><span>作为作品展示、技术复盘和个人主页入口。</span></li>
        <li><i class="fa-solid fa-circle"></i><span>持续维护页面样式、内容结构和构建流程。</span></li>
      </ul>
    </div>
    <div class="project-card-footer">
      <div class="project-tags">
        <span class="project-tag">Hexo</span>
        <span class="project-tag">JavaScript</span>
      </div>
      <a class="project-link" href="https://github.com/xingranya/xingranya-blog" target="_blank" rel="noopener">
        查看源码 <i class="fa-solid fa-arrow-right"></i>
      </a>
    </div>
  </article>

  <article class="project-card">
    <div>
      <div class="project-card-header">
        <div>
          <h3 class="project-name">daily_stock_analysis</h3>
          <p class="project-type">自动化股票分析</p>
        </div>
        <span class="project-icon"><i class="fa-solid fa-chart-line"></i></span>
      </div>
      <p class="project-desc">LLM 驱动的行情与新闻分析项目，整合数据源聚合、自动化任务和多渠道结果推送。</p>
      <ul class="project-detail-list">
        <li><i class="fa-solid fa-circle"></i><span>覆盖数据流处理、提示词组织和定时运行链路。</span></li>
        <li><i class="fa-solid fa-circle"></i><span>可扩展回测、风险提示和可视化仪表盘。</span></li>
      </ul>
    </div>
    <div class="project-card-footer">
      <div class="project-tags">
        <span class="project-tag">Python</span>
        <span class="project-tag">LLM</span>
      </div>
      <a class="project-link" href="https://github.com/xingranya/daily_stock_analysis" target="_blank" rel="noopener">
        查看源码 <i class="fa-solid fa-arrow-right"></i>
      </a>
    </div>
  </article>
</section>

<section class="project-section-head">
  <div>
    <h2 class="project-section-title">实验与文章</h2>
    <p class="project-section-desc">这部分收录带有文章说明的小型作品，便于查看实现过程和最终效果。</p>
  </div>
</section>

<section class="project-lab">
  <article class="project-lab-item">
    <h3>物理模拟 Web 网页</h3>
    <p>用 HTML、CSS 和 JavaScript 把运动、碰撞等物理现象做成可观察的浏览器实验。</p>
    <div class="project-lab-links">
      <a class="project-link" href="/physics-simulation-web-page/">阅读文章 <i class="fa-solid fa-arrow-right"></i></a>
      <a class="project-link" href="https://github.com/xingranya/xingranya-physics-simulation-web-page" target="_blank" rel="noopener">查看源码 <i class="fa-brands fa-github"></i></a>
    </div>
  </article>

  <article class="project-lab-item">
    <h3>纯 CSS 圣诞树</h3>
    <p>完全依靠 CSS 绘制和动效组合完成的节日作品，呈现图形层级、光效和动画节奏。</p>
    <div class="project-lab-links">
      <a class="project-link" href="/css-christmas-tree/">阅读文章 <i class="fa-solid fa-arrow-right"></i></a>
    </div>
  </article>
</section>

<section class="project-note">
  页面会按项目完成度持续更新：完整应用进入“重点项目”，小型实验和配套文章进入“实验与文章”。每个条目优先保留项目定位、技术栈和源码入口。
</section>

</div>
