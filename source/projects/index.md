---
title: 我的项目
date: 2025-10-24 21:01:26
type: "page"
comments: false
description: 星苒鸭的个人项目列表，包括 GSAT、效率工具和开源实践。
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

  .project-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 14px;
    margin-top: 12px;
    color: var(--project-muted);
    font-size: 12px;
    line-height: 1.5;
  }

  .project-meta span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
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

  .project-tags,
  .project-links {
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

  .project-pr-list {
    display: grid;
    gap: 10px;
  }

  .project-pr-item {
    display: grid;
    grid-template-columns: minmax(150px, .6fr) minmax(0, 1.4fr) auto;
    gap: 12px;
    align-items: center;
    border: 1px solid var(--project-line);
    border-radius: 8px;
    padding: 14px 16px;
    color: var(--project-muted);
    background: var(--project-surface);
    text-decoration: none;
    transition: transform .2s ease, border-color .2s ease, color .2s ease;
  }

  .project-pr-item:hover {
    transform: translateY(-2px);
    border-color: var(--primary-color);
    color: var(--project-muted);
    text-decoration: none;
  }

  .project-pr-repo {
    color: var(--primary-color);
    font-size: 13px;
    font-weight: 800;
    line-height: 1.5;
  }

  .project-pr-title {
    color: var(--project-strong);
    font-size: 14px;
    font-weight: 700;
    line-height: 1.6;
  }

  .project-pr-status {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--project-muted);
    font-size: 12px;
    line-height: 1.5;
    white-space: nowrap;
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
    .project-grid {
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

    .project-pr-item {
      grid-template-columns: 1fr;
      gap: 6px;
    }
  }
</style>

<div class="project-page">

<section class="project-intro">
  <div>
    <span class="project-kicker"><i class="fa-brands fa-github"></i> GitHub @xingranya</span>
    <p class="project-lead">这些项目记录了我在 Web 应用、小程序、桌面工具与开源社区中的实践。</p>
    <p class="project-copy">每个项目都附有源码入口，欢迎查看实现细节。</p>
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
      <strong>14</strong>
      <span>公开项目</span>
    </div>
    <div class="project-index-item">
      <strong>6</strong>
      <span>开源贡献</span>
    </div>
    <div class="project-index-item">
      <strong>TypeScript / Rust / Vue / Swift / Java</strong>
      <span>主要技术栈</span>
    </div>
  </div>
</section>

<section class="project-section-head">
  <div>
    <h2 class="project-section-title">项目作品与开源贡献</h2>
    <p class="project-section-desc">按项目类型和贡献内容整理，优先收录仍在维护、可查看源码或已有上游合并记录的仓库。</p>
  </div>
</section>

<section class="project-grid">
  <article class="project-card" style="grid-column:1/-1;">
    <div>
      <div class="project-card-header">
        <div>
          <h3 class="project-name">GSAT — GitHub Stars AI Tools</h3>
          <p class="project-type">GitHub Stars 本地 AI 知识库 · 主要项目</p>
        </div>
        <span class="project-icon" style="padding:4px;overflow:hidden"><img src="https://gsat.xingranya.cn/icon.svg" alt="GSAT" style="width:30px;height:30px"></span>
      </div>
      <p class="project-desc">把 GitHub Stars 变成可搜索、可总结、可追问的本地 AI 知识库。同步 Stars 到本地 SQLite，AI 自动生成中文摘要和标签，支持自然语言搜索、标签网络、相似项目发现等能力。数据全程本地存储，支持多种 AI 服务提供商。</p>
      <div class="project-meta">
        <span><i class="fa-solid fa-code"></i> TypeScript / Rust</span>
        <span><i class="fa-solid fa-clock"></i> 2026-07-09</span>
        <span><i class="fa-solid fa-download"></i> macOS · Windows · Linux</span>
      </div>
      <ul class="project-detail-list">
        <li><i class="fa-solid fa-circle"></i><span>Tauri 2 + React 19 + SQLite 架构，安装包体积小、内存占用低。</span></li>
        <li><i class="fa-solid fa-circle"></i><span>支持 OpenAI、Anthropic、DeepSeek、Ollama 等十余种 AI 服务。</span></li>
        <li><i class="fa-solid fa-circle"></i><span>Token 和 API Key 存在系统密钥链，所有数据本地可控。</span></li>
      </ul>
    </div>
    <div class="project-card-footer">
      <div class="project-tags">
        <span class="project-tag">Tauri</span>
        <span class="project-tag">Rust</span>
        <span class="project-tag">React</span>
        <span class="project-tag">AI</span>
        <span class="project-tag">SQLite</span>
      </div>
      <div class="project-links">
        <a class="project-link" href="https://gsat.xingranya.cn" target="_blank" rel="noopener">官网 <i class="fa-solid fa-arrow-right"></i></a>
        <a class="project-link" href="https://github.com/xingranya/GitHub-Stars-AI-Tools/wiki" target="_blank" rel="noopener">文档 <i class="fa-solid fa-book"></i></a>
        <a class="project-link" href="https://gsat.xingranya.cn/download" target="_blank" rel="noopener">下载 <i class="fa-solid fa-download"></i></a>
      </div>
    </div>
  </article>

  <article class="project-card">
    <div>
      <div class="project-card-header">
        <div>
          <h3 class="project-name">SPlayer-Next</h3>
          <p class="project-type">跨平台桌面音乐播放器 · 开源贡献</p>
        </div>
        <span class="project-icon"><i class="fa-solid fa-music"></i></span>
      </div>
      <p class="project-desc">跨平台桌面音乐播放器，支持歌词显示和多格式音频播放。我参与了 macOS 端显示细节修复，改善带刘海屏设备上的界面对齐。</p>
      <div class="project-meta">
        <span><i class="fa-solid fa-code"></i> TypeScript</span>
        <span><i class="fa-solid fa-clock"></i> 2026-06-22</span>
        <span><i class="fa-solid fa-star"></i> 1</span>
      </div>
      <ul class="project-detail-list">
        <li><i class="fa-solid fa-circle"></i><span>修复 macOS 刘海区域的窗口对齐问题，相关改动已合并到上游项目。</span></li>
        <li><i class="fa-solid fa-circle"></i><span>关注桌面端播放体验、界面适配和细节一致性。</span></li>
      </ul>
    </div>
    <div class="project-card-footer">
      <div class="project-tags">
        <span class="project-tag">TypeScript</span>
        <span class="project-tag">桌面应用</span>
        <span class="project-tag">PR</span>
      </div>
      <div class="project-links">
        <a class="project-link" href="https://github.com/xingranya/SPlayer-Next" target="_blank" rel="noopener">仓库 <i class="fa-brands fa-github"></i></a>
        <a class="project-link" href="https://github.com/SPlayer-Dev/SPlayer-Next/pull/44" target="_blank" rel="noopener">贡献记录 <i class="fa-solid fa-code-pull-request"></i></a>
      </div>
    </div>
  </article>

  <article class="project-card">
    <div>
      <div class="project-card-header">
        <div>
          <h3 class="project-name">OQQWall_rust</h3>
          <p class="project-type">QQ 校园墙 Rust 方案 · 开源贡献</p>
        </div>
        <span class="project-icon"><i class="fa-brands fa-rust"></i></span>
      </div>
      <p class="project-desc">QQ 校园墙的 Rust 实现。我参与发布流程、审核后台交互和后台信息展示等工程化改进。</p>
      <div class="project-meta">
        <span><i class="fa-solid fa-code"></i> Rust</span>
        <span><i class="fa-solid fa-clock"></i> 2026-06-15</span>
        <span><i class="fa-solid fa-code-pull-request"></i> 多次贡献</span>
      </div>
      <ul class="project-detail-list">
        <li><i class="fa-solid fa-circle"></i><span>整理多架构构建与手动发布流程，提升版本发布的可控性。</span></li>
        <li><i class="fa-solid fa-circle"></i><span>修复审核后台关键交互，让管理操作和记录展示更清晰。</span></li>
      </ul>
    </div>
    <div class="project-card-footer">
      <div class="project-tags">
        <span class="project-tag">Rust</span>
        <span class="project-tag">GitHub Actions</span>
        <span class="project-tag">PR</span>
      </div>
      <div class="project-links">
        <a class="project-link" href="https://github.com/xingranya/OQQWall_rust" target="_blank" rel="noopener">仓库 <i class="fa-brands fa-github"></i></a>
        <a class="project-link" href="https://github.com/gfhdhytghd/OQQWall_rust/pull/6" target="_blank" rel="noopener">贡献记录 <i class="fa-solid fa-code-pull-request"></i></a>
      </div>
    </div>
  </article>

  <article class="project-card">
    <div>
      <div class="project-card-header">
        <div>
          <h3 class="project-name">CervixDetectAI_wx</h3>
          <p class="project-type">宫颈智能诊断小程序端</p>
        </div>
        <span class="project-icon"><i class="fa-solid fa-mobile-screen-button"></i></span>
      </div>
      <p class="project-desc">面向移动端使用场景的小程序项目，围绕用户入口、病例/影像流程和智能问答体验做端侧组织。</p>
      <div class="project-meta">
        <span><i class="fa-solid fa-code"></i> JavaScript</span>
        <span><i class="fa-solid fa-clock"></i> 2026-06-18</span>
      </div>
      <ul class="project-detail-list">
        <li><i class="fa-solid fa-circle"></i><span>承接 CervixDetectAI 的移动端访问、资料展示和交互入口。</span></li>
        <li><i class="fa-solid fa-circle"></i><span>围绕授权流程、端侧体验和真机兼容性持续完善。</span></li>
      </ul>
    </div>
    <div class="project-card-footer">
      <div class="project-tags">
        <span class="project-tag">小程序</span>
        <span class="project-tag">JavaScript</span>
        <span class="project-tag">医疗 AI</span>
      </div>
      <a class="project-link" href="https://github.com/xingranya/CervixDetectAI_wx" target="_blank" rel="noopener">
        查看源码 <i class="fa-solid fa-arrow-right"></i>
      </a>
    </div>
  </article>

  <article class="project-card">
    <div>
      <div class="project-card-header">
        <div>
          <h3 class="project-name">chaoxing-agent-skill</h3>
          <p class="project-type">学习通自动化技能 · 开源贡献</p>
        </div>
        <span class="project-icon"><i class="fa-solid fa-robot"></i></span>
      </div>
      <p class="project-desc">面向学习通课程任务的自动化技能。我补充了浏览器自动化场景下的验证码处理方案，完善了使用说明。</p>
      <div class="project-meta">
        <span><i class="fa-solid fa-code"></i> Python</span>
        <span><i class="fa-solid fa-clock"></i> 2026-06-17</span>
      </div>
      <ul class="project-detail-list">
        <li><i class="fa-solid fa-circle"></i><span>补充 Playwright CLI 场景下的验证码处理路径，相关改动已合并。</span></li>
        <li><i class="fa-solid fa-circle"></i><span>覆盖课程扫描、任务处理和自动化执行说明。</span></li>
      </ul>
    </div>
    <div class="project-card-footer">
      <div class="project-tags">
        <span class="project-tag">Python</span>
        <span class="project-tag">自动化</span>
        <span class="project-tag">PR</span>
      </div>
      <div class="project-links">
        <a class="project-link" href="https://github.com/xingranya/chaoxing-agent-skill" target="_blank" rel="noopener">仓库 <i class="fa-brands fa-github"></i></a>
        <a class="project-link" href="https://github.com/iwillwill-ALLWILL/chaoxing-agent-skill/pull/1" target="_blank" rel="noopener">贡献记录 <i class="fa-solid fa-code-pull-request"></i></a>
      </div>
    </div>
  </article>

  <article class="project-card">
    <div>
      <div class="project-card-header">
        <div>
          <h3 class="project-name">nosleep-mac</h3>
          <p class="project-type">macOS 合盖不休眠工具</p>
        </div>
        <span class="project-icon"><i class="fa-solid fa-laptop"></i></span>
      </div>
      <p class="project-desc">MacBook 合盖后保持运行的菜单栏工具，围绕睡眠控制、状态提示、诊断菜单和 DMG 发版流程打磨。</p>
      <div class="project-meta">
        <span><i class="fa-solid fa-code"></i> Swift</span>
        <span><i class="fa-solid fa-clock"></i> 2026-06-06</span>
        <span><i class="fa-solid fa-star"></i> 2</span>
      </div>
      <ul class="project-detail-list">
        <li><i class="fa-solid fa-circle"></i><span>面向真实 macOS 使用场景，关注权限、常驻和系统状态一致性。</span></li>
        <li><i class="fa-solid fa-circle"></i><span>包含菜单栏交互、诊断入口和安装包发布流程。</span></li>
      </ul>
    </div>
    <div class="project-card-footer">
      <div class="project-tags">
        <span class="project-tag">Swift</span>
        <span class="project-tag">macOS</span>
        <span class="project-tag">工具</span>
      </div>
      <a class="project-link" href="https://github.com/xingranya/nosleep-mac" target="_blank" rel="noopener">
        查看源码 <i class="fa-solid fa-arrow-right"></i>
      </a>
    </div>
  </article>

  <article class="project-card">
    <div>
      <div class="project-card-header">
        <div>
          <h3 class="project-name">CervixDetectAI</h3>
          <p class="project-type">医疗 AI 检测应用</p>
        </div>
        <span class="project-icon"><i class="fa-solid fa-notes-medical"></i></span>
      </div>
      <p class="project-desc">面向宫颈癌辅助筛查场景的 Web 应用，聚焦病例管理、影像提交、检测结果展示和报告流程。</p>
      <div class="project-meta">
        <span><i class="fa-solid fa-code"></i> Vue</span>
        <span><i class="fa-solid fa-clock"></i> 2026-05-28</span>
        <span><i class="fa-solid fa-star"></i> 3</span>
      </div>
      <ul class="project-detail-list">
        <li><i class="fa-solid fa-circle"></i><span>覆盖检测结果页、权限入口、患者信息和报告展示链路。</span></li>
        <li><i class="fa-solid fa-circle"></i><span>围绕报告导出、订阅计划和部署流程完善产品体验。</span></li>
      </ul>
    </div>
    <div class="project-card-footer">
      <div class="project-tags">
        <span class="project-tag">Vue</span>
        <span class="project-tag">AI 医疗</span>
        <span class="project-tag">Web</span>
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
          <h3 class="project-name">xingranya-blog</h3>
          <p class="project-type">个人内容平台</p>
        </div>
        <span class="project-icon"><i class="fa-solid fa-pen-nib"></i></span>
      </div>
      <p class="project-desc">本博客的源码仓库，基于 Hexo 和自定义主题维护文章发布、作品展示、导航结构和部署流程。</p>
      <div class="project-meta">
        <span><i class="fa-solid fa-code"></i> JavaScript</span>
        <span><i class="fa-solid fa-clock"></i> 2026-05-26</span>
        <span><i class="fa-solid fa-star"></i> 1</span>
      </div>
      <ul class="project-detail-list">
        <li><i class="fa-solid fa-circle"></i><span>作为作品集、技术文章和个人主页的统一入口。</span></li>
        <li><i class="fa-solid fa-circle"></i><span>持续优化页面样式、构建脚本和内容发布体验。</span></li>
      </ul>
    </div>
    <div class="project-card-footer">
      <div class="project-tags">
        <span class="project-tag">Hexo</span>
        <span class="project-tag">JavaScript</span>
        <span class="project-tag">博客</span>
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
          <h3 class="project-name">openreel-video</h3>
          <p class="project-type">浏览器端视频编辑器</p>
        </div>
        <span class="project-icon"><i class="fa-solid fa-film"></i></span>
      </div>
      <p class="project-desc">开源浏览器视频编辑器方向项目，关注无安装、无上传、无水印的本地化剪辑体验。</p>
      <div class="project-meta">
        <span><i class="fa-solid fa-code"></i> TypeScript</span>
        <span><i class="fa-solid fa-clock"></i> 2026-05-09</span>
      </div>
      <ul class="project-detail-list">
        <li><i class="fa-solid fa-circle"></i><span>关注 Web 多媒体编辑、时间轴交互和素材处理架构。</span></li>
        <li><i class="fa-solid fa-circle"></i><span>用于探索浏览器端创作工具的工程实现方式。</span></li>
      </ul>
    </div>
    <div class="project-card-footer">
      <div class="project-tags">
        <span class="project-tag">TypeScript</span>
        <span class="project-tag">视频编辑</span>
      </div>
      <a class="project-link" href="https://github.com/xingranya/openreel-video" target="_blank" rel="noopener">
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
      <p class="project-desc">CervixDetectAI 的展示主页，用于呈现项目背景、核心能力、应用价值和访问入口。</p>
      <div class="project-meta">
        <span><i class="fa-solid fa-code"></i> Vue</span>
        <span><i class="fa-solid fa-clock"></i> 2026-04-30</span>
        <span><i class="fa-solid fa-star"></i> 1</span>
      </div>
      <ul class="project-detail-list">
        <li><i class="fa-solid fa-circle"></i><span>帮助访问者快速了解项目背景、能力边界和使用入口。</span></li>
        <li><i class="fa-solid fa-circle"></i><span>承载项目介绍、案例展示和在线访问路径。</span></li>
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
      <p class="project-desc">面向文本整理和知识产权材料处理的工具型项目，聚焦资料录入、结构化呈现和流程管理。</p>
      <div class="project-meta">
        <span><i class="fa-solid fa-code"></i> TypeScript</span>
        <span><i class="fa-solid fa-clock"></i> 2026-04-22</span>
      </div>
      <ul class="project-detail-list">
        <li><i class="fa-solid fa-circle"></i><span>包含表单录入、材料管理和状态追踪等业务组件。</span></li>
        <li><i class="fa-solid fa-circle"></i><span>围绕 OCR 识别、文件导出和审核流程组织功能。</span></li>
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
      <div class="project-meta">
        <span><i class="fa-solid fa-code"></i> Vue</span>
        <span><i class="fa-solid fa-clock"></i> 2026-04-16</span>
      </div>
      <ul class="project-detail-list">
        <li><i class="fa-solid fa-circle"></i><span>支持内容展示、任务入口和活动信息组织。</span></li>
        <li><i class="fa-solid fa-circle"></i><span>围绕参与流程、积分反馈和数据展示搭建页面结构。</span></li>
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
      <div class="project-meta">
        <span><i class="fa-solid fa-code"></i> Java</span>
        <span><i class="fa-solid fa-clock"></i> 2026-04-15</span>
        <span><i class="fa-solid fa-star"></i> 2</span>
      </div>
      <ul class="project-detail-list">
        <li><i class="fa-solid fa-circle"></i><span>覆盖领域建模、接口组织和交易状态管理。</span></li>
        <li><i class="fa-solid fa-circle"></i><span>围绕商品流转、消息通知和后台管理组织业务流程。</span></li>
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
          <h3 class="project-name">CC-Statusline-Builder</h3>
          <p class="project-type">状态栏配置工具 · 已合并 PR</p>
        </div>
        <span class="project-icon"><i class="fa-solid fa-terminal"></i></span>
      </div>
      <p class="project-desc">用于 Claude Code 状态栏可视化配置的网页工具。我参与了跨平台路径处理修复，提升 Windows 环境下的安装可靠性。</p>
      <div class="project-meta">
        <span><i class="fa-solid fa-code"></i> HTML</span>
        <span><i class="fa-solid fa-clock"></i> 2026-02-24</span>
        <span><i class="fa-solid fa-star"></i> 11</span>
      </div>
      <ul class="project-detail-list">
        <li><i class="fa-solid fa-circle"></i><span>修复 Windows 路径配置问题，相关改动已合并到上游项目。</span></li>
        <li><i class="fa-solid fa-circle"></i><span>关注开发工具在不同系统环境下的可用性。</span></li>
      </ul>
    </div>
    <div class="project-card-footer">
      <div class="project-tags">
        <span class="project-tag">HTML</span>
        <span class="project-tag">开发工具</span>
        <span class="project-tag">PR</span>
      </div>
      <div class="project-links">
        <a class="project-link" href="https://github.com/xingranya/CC-Statusline-Builder" target="_blank" rel="noopener">仓库 <i class="fa-brands fa-github"></i></a>
        <a class="project-link" href="https://github.com/denki-san/CC-Statusline-Builder/pull/1" target="_blank" rel="noopener">贡献记录 <i class="fa-solid fa-code-pull-request"></i></a>
      </div>
    </div>
  </article>
</section>

<section class="project-section-head">
  <div>
    <h2 class="project-section-title">开源贡献记录</h2>
    <p class="project-section-desc">收录已经合并到上游仓库的主要贡献，便于查看具体改动和讨论记录。</p>
  </div>
</section>

<section class="project-pr-list" aria-label="已合并 PR 记录">
  <a class="project-pr-item" href="https://github.com/SPlayer-Dev/SPlayer-Next/pull/44" target="_blank" rel="noopener">
    <span class="project-pr-repo">SPlayer-Next #44</span>
    <span class="project-pr-title">修复 macOS 刘海屏窗口对齐</span>
    <span class="project-pr-status"><i class="fa-solid fa-code-pull-request"></i> 已合并 · 2026-06-22</span>
  </a>
  <a class="project-pr-item" href="https://github.com/iwillwill-ALLWILL/chaoxing-agent-skill/pull/1" target="_blank" rel="noopener">
    <span class="project-pr-repo">chaoxing-agent-skill #1</span>
    <span class="project-pr-title">补充 Playwright CLI 验证码处理方案</span>
    <span class="project-pr-status"><i class="fa-solid fa-code-pull-request"></i> 已合并 · 2026-06-17</span>
  </a>
  <a class="project-pr-item" href="https://github.com/gfhdhytghd/OQQWall_rust/pull/6" target="_blank" rel="noopener">
    <span class="project-pr-repo">OQQWall_rust #6</span>
    <span class="project-pr-title">支持手动填写发布更新日志</span>
    <span class="project-pr-status"><i class="fa-solid fa-code-pull-request"></i> 已合并 · 2026-06-22</span>
  </a>
  <a class="project-pr-item" href="https://github.com/gfhdhytghd/OQQWall_rust/pull/5" target="_blank" rel="noopener">
    <span class="project-pr-repo">OQQWall_rust #5</span>
    <span class="project-pr-title">恢复审核后台交互并优化记录展示</span>
    <span class="project-pr-status"><i class="fa-solid fa-code-pull-request"></i> 已合并 · 2026-06-15</span>
  </a>
  <a class="project-pr-item" href="https://github.com/gfhdhytghd/OQQWall_rust/pull/3" target="_blank" rel="noopener">
    <span class="project-pr-repo">OQQWall_rust #3</span>
    <span class="project-pr-title">合并多架构构建与手动发布流程</span>
    <span class="project-pr-status"><i class="fa-solid fa-code-pull-request"></i> 已合并 · 2026-06-15</span>
  </a>
  <a class="project-pr-item" href="https://github.com/denki-san/CC-Statusline-Builder/pull/1" target="_blank" rel="noopener">
    <span class="project-pr-repo">CC-Statusline-Builder #1</span>
    <span class="project-pr-title">修复 Windows 路径配置问题</span>
    <span class="project-pr-status"><i class="fa-solid fa-code-pull-request"></i> 已合并 · 2026-02-21</span>
  </a>
</section>

<section class="project-note">
  更多项目和贡献会随仓库更新持续补充。完整源码和讨论记录可通过每个条目的 GitHub 链接查看。
</section>

</div>
