---
title: CI/CD 自动化部署实战
date: 2026-02-02 12:00:00
banner: "从本地到线上，自动化让部署像喝水一样简单"
cover: /images/main_bg.jpg
tags:
  - CI/CD
  - DevOps
  - 自动化
  - GitHub Actions
---

你有没有经历过这样的痛苦：写完代码后，手动打包、手动上传到服务器、手动重启服务、然后祈祷一切正常...一遍遍重复这些步骤，不仅枯燥乏味，还容易出错。这就是为什么我们需要 CI/CD。

今天我们就来聊聊什么是 CI/CD，以及如何用 GitHub Actions 实现自动化部署。相信我，一旦你体验过自动化的便利，就再也回不去了哈哈哈哈。

### 什么是 CI/CD？

CI/CD 是两个概念的组合：

- **CI（Continuous Integration，持续集成）**：频繁地将代码集成到主干分支，每次集成都通过自动化的构建和测试来验证
- **CD（Continuous Deployment/Delivery，持续部署/交付）**：将通过测试的代码自动部署到生产环境

简单来说，CI/CD 就是：**你只管写代码并推送，剩下的测试、构建、部署全交给自动化工具处理**。

### GitHub Actions 入门

GitHub Actions 是 GitHub 提供的 CI/CD 服务，对于 GitHub 仓库来说，它是最方便的选择。

**基本概念**

1. **Workflow（工作流）**：一个自动化流程，包含多个 Job
2. **Job（任务）**：工作流中的执行单元，包含多个 Step
3. **Step（步骤）**：Job 中的单个操作，可以运行命令或使用 Action
4. **Action（动作）**：可复用的代码组件
5. **Runner（运行器）**：运行工作流的服务器（GitHub 提供的或自托管）

**Workflow 配置文件**

Workflow 配置文件放在 `.github/workflows/` 目录下，使用 YAML 格式：

```yaml
# .github/workflows/hello-world.yml
name: Hello World  # 工作流名称

on:               # 触发条件
  push:           # 当代码推送到仓库时触发
    branches:     # 指定分支
      - main
  pull_request:   # 当有 PR 时触发

jobs:             # 定义任务
  say-hello:      # 任务名称
    runs-on: ubuntu-latest  # 运行环境
    steps:        # 定义步骤
      - name: 打个招呼
        run: echo "Hello, GitHub Actions!"

      - name: 查看系统信息
        run: |
          echo "当前目录: $(pwd)"
          echo "系统信息:"
          uname -a
```

提交这个文件后，每次推送到 `main` 分支，GitHub 就会自动执行这个工作流。你可以在仓库的 "Actions" 标签页查看执行结果。

### 自动化测试流程

在部署之前，我们通常会先运行测试，确保代码没有问题。

```yaml
# .github/workflows/test.yml
name: 运行测试

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [16.x, 18.x, 20.x]  # 在多个 Node.js 版本下测试

    steps:
      # 检出代码
      - name: 检出代码
        uses: actions/checkout@v3

      # 设置 Node.js 环境
      - name: 设置 Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      # 安装依赖
      - name: 安装依赖
        run: npm ci

      # 运行 linter
      - name: 代码检查
        run: npm run lint

      # 运行测试
      - name: 运行测试
        run: npm test

      # 生成测试覆盖率报告
      - name: 生成覆盖率报告
        run: npm run test:coverage

      # 上传覆盖率报告
      - name: 上传到 Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

### 自动部署到服务器

测试通过后，我们就可以部署到服务器了。

```yaml
# .github/workflows/deploy.yml
name: 自动部署

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      # 检出代码
      - name: 检出代码
        uses: actions/checkout@v3

      # 设置 Node.js
      - name: 设置 Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      # 安装依赖
      - name: 安装依赖
        run: npm ci

      # 构建项目
      - name: 构建项目
        run: npm run build
        env:
          NODE_ENV: production

      # 部署到服务器
      - name: 部署到服务器
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}        # 服务器地址
          username: ${{ secrets.SERVER_USER }}     # 用户名
          key: ${{ secrets.SSH_PRIVATE_KEY }}      # SSH 私钥
          port: ${{ secrets.SERVER_PORT }}         # SSH 端口
          script: |
            cd /var/www/myproject
            git pull origin main
            npm ci --production
            npm run build
            pm2 restart myapp
```

> **关于 Secrets**：千万不要把敏感信息（密码、SSH 密钥等）直接写在配置文件中！应该在仓库的 Settings > Secrets and variables > Actions 中添加，然后在配置文件中用 `${{ secrets.名称 }}` 引用。

### 实战案例：Hexo 博客自动部署

让我用一个真实的案例——自动部署 Hexo 博客，来展示完整的 CI/CD 流程。

```yaml
# .github/workflows/deploy.yml
name: 部署 Hexo 博客

on:
  push:
    branches: [ main ]  # 当推送到 main 分支时触发

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      # 检出源码
      - name: 检出代码
        uses: actions/checkout@v3
        with:
          submodules: true  # 确保 submodule 被检出（主题等）
          fetch-depth: 0    # 获取完整历史记录

      # 设置 Node.js
      - name: 设置 Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      # 安装依赖
      - name: 安装 Hexo CLI 和依赖
        run: |
          npm install -g hexo-cli
          npm install

      # 生成静态文件
      - name: 生成静态文件
        run: |
          hexo clean
          hexo generate

      # 部署到 GitHub Pages
      - name: 部署到 GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./public  # Hexo 生成的静态文件目录
          publish_branch: gh-pages
          cname: xingranya.cn     # 自定义域名（可选）

      # 部署到服务器（可选）
      - name: 部署到服务器
        uses: appleboy/ssh-action@master
        if: success()  # 只有前面的步骤成功后才执行
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            # 备份当前版本
            cd /var/www/blog
            tar -czf backup_$(date +%Y%m%d_%H%M%S).tar.gz public

            # 同步最新文件
            rsync -avz --delete \
              user@github:your-repo/gh-pages/ \
              /var/www/blog/public/

            # 清理旧备份（保留最近 3 个）
            ls -t backup_*.tar.gz | tail -n +4 | xargs rm -f
```

### 高级技巧

**条件执行**

```yaml
steps:
  - name: 只在 main 分支执行
    if: github.ref == 'refs/heads/main'
    run: echo "这是 main 分支"

  - name: 只在 PR 时执行
    if: github.event_name == 'pull_request'
    run: echo "这是一个 Pull Request"

  - name: 只在特定文件修改时执行
    if: contains(github.event.head_commit.message, '[deploy]')
    run: echo "提交信息包含 [deploy]"
```

**缓存依赖**

```yaml
- name: 缓存 npm 依赖
  uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

**矩阵构建**

```yaml
strategy:
  matrix:
    os: [ubuntu-latest, windows-latest, macos-latest]
    node: [16.x, 18.x, 20.x]
runs-on: ${{ matrix.os }}

steps:
  - name: 在 ${{ matrix.os }} 上使用 Node.js ${{ matrix.node }} 测试
    run: npm test
```

### 总结

CI/CD 是现代软件开发的基础设施，它能带来：

1. **提高效率**：自动化处理重复性任务
2. **减少错误**：避免手动操作带来的失误
3. **快速反馈**：每次提交都能快速知道是否通过测试
4. **自信发布**：有完善的测试流程，发布更安心

从今天开始，把你的部署流程自动化吧！虽然前期配置可能需要花点时间，但这笔投资绝对值得。相信我，当你看到代码推送后几分钟就自动部署上线，那种感觉真的很爽哈哈哈哈。

如果你想继续深入，可以探索：
- 多环境部署（开发、测试、生产）
- 蓝绿部署和金丝雀发布
- Docker + K8s 的自动化部署
- 监控和告警集成
