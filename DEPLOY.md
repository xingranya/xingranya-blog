# 宝塔面板部署 Hexo 博客指南

## 项目信息

- **项目类型**: Hexo 静态博客
- **网站地址**: https://xingranya.cn
- **Hexo 版本**: 7.3.0
- **主题**: defaultone

## 部署方式说明

本文档提供两种部署方式：

### 方式一：本地构建 + 上传静态文件（推荐新手）
优点：简单快捷，服务器资源占用少
缺点：每次更新需要在本地构建

### 方式二：服务器端构建 + Git 部署（推荐进阶）
优点：可直接在服务器更新文章，适合团队协作
缺点：需要配置 Node.js 环境

---

## 方式一：本地构建部署（推荐）

### 第一步：本地构建博客

在本地项目目录执行：

```bash
# 安装依赖（首次需要）
npm install

# 清理之前的构建
npm run clean

# 生成静态文件
npm run build
```

构建完成后，会在项目根目录生成 `public` 文件夹，里面包含所有静态文件。

### 第二步：宝塔面板准备

1. **登录宝塔面板**

2. **安装必要软件**
   - 进入【软件商店】
   - 安装 **Nginx**（推荐）或 Apache
   - 安装 **PHP**（可选，如果需要PHP功能）

3. **创建网站**
   - 点击左侧【网站】
   - 点击【添加站点】
   - 填写信息：
     - **域名**: `xingranya.cn`（或你的服务器IP）
     - **根目录**: `/www/wwwroot/xingranya.cn`
     - **FTP**: 不创建
     - **数据库**: 不创建
     - **PHP版本**: 纯静态

### 第三步：上传静态文件

有两种方式上传：

#### 方式 A：使用宝塔文件管理器
1. 点击左侧【文件】
2. 进入 `/www/wwwroot/xingranya.cn`
3. 删除默认的 `index.html` 和 `404.html`
4. 点击【上传】
5. 将本地 `public` 文件夹内的**所有内容**（不是public文件夹本身）上传到网站根目录

#### 方式 B：使用 FTP 工具
1. 在宝塔面板创建 FTP 账户
2. 使用 FileZilla 或其他 FTP 工具连接
3. 上传 `public` 文件夹内的所有内容到网站根目录

### 第四步：配置 HTTPS（可选但推荐）

1. 进入【网站】设置
2. 点击【SSL】选项卡
3. 选择【Let's Encrypt】（免费）
4. 勾选你的域名
5. 点击【申请】
6. 开启【强制HTTPS】

### 第五步：验证部署

1. 访问你的域名，检查博客是否正常显示
2. 检查各页面：首页、文章页、标签页、分类页等
3. 测试 Live2D 看板娘功能

---

## 方式二：服务器端构建部署

### 第一步：安装 Node.js

1. **进入宝塔面板【软件商店】**
2. **搜索并安装 Node.js**
   - 推荐版本：Node.js 16.x 或 18.x
   - 如果宝塔商店没有，使用 Shell 终端安装：

```bash
# 安装 Node.js 18.x（使用官方源）
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs

# 验证安装
node -v
npm -v
```

### 第二步：安装 Hexo CLI

```bash
# 全局安装 Hexo
npm install -g hexo-cli

# 验证安装
hexo version
```

### 第三步：部署项目文件

1. **上传项目到服务器**

方式 A：使用宝塔文件管理器
- 上传整个项目文件夹（除了 `node_modules` 和 `public`）

方式 B：使用 Git 克隆
```bash
cd /www/wwwroot
git clone <你的项目Git仓库地址> xingranya.cn
cd xingranya.cn
```

2. **安装依赖**
```bash
cd /www/wwwroot/xingranya.cn
npm install
```

### 第四步：配置 Nginx

1. **进入网站设置【配置文件】**
2. **修改 root 路径指向 public 目录**

```nginx
location / {
    root /www/wwwroot/xingranya.cn/public;
    index index.html index.htm;
}
```

3. **添加伪静态规则（如果需要）**

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### 第五步：构建博客

```bash
cd /www/wwwroot/xingranya.cn
hexo clean
hexo generate
```

### 第六步：配置自动部署脚本（可选）

创建一个 Shell 脚本 `/www/wwwroot/xingranya.cn/deploy.sh`：

```bash
#!/bin/bash
cd /www/wwwroot/xingranya.cn
git pull origin main
npm install
hexo clean
hexo generate
echo "部署完成: $(date)"
```

在宝塔面板【计划任务】中添加定时任务：
- 任务类型：Shell脚本
- 执行周期：根据需要设置
- 脚本内容：`bash /www/wwwroot/xingranya.cn/deploy.sh`

---

## 更新博客流程

### 使用方式一（本地构建）

```bash
# 本地
hexo new "新文章标题"
# 编辑文章
hexo clean && hexo generate
# 上传 public 文件夹内容到服务器
```

### 使用方式二（服务器构建）

```bash
# 方式 A：直接在服务器操作
ssh 登录服务器
cd /www/wwwroot/xingranya.cn
hexo new "新文章标题"
# 编辑文章
hexo clean && hexo generate

# 方式 B：本地提交到 Git，服务器拉取
# 本地
git add .
git commit -m "更新文章"
git push

# 服务器
cd /www/wwwroot/xingranya.cn
git pull
hexo clean && hexo generate
```

---

## 常见问题

### 1. 页面 404

**原因**：Nginx 配置的 root 路径不正确

**解决**：
- 方式一：确保 root 指向 `/www/wwwroot/xingranya.cn`
- 方式二：确保 root 指向 `/www/wwwroot/xingranya.cn/public`

### 2. Live2D 不显示

**原因**：文件路径问题或未正确上传

**解决**：
- 确保上传了完整的 `public` 目录
- 检查浏览器控制台是否有错误
- 确认主题配置文件中的 Live2D 路径正确

### 3. 样式错乱

**原因**：静态资源未正确加载

**解决**：
- 检查 `public` 目录下的 `css`、`js` 文件夹是否完整
- 清除浏览器缓存
- 检查 Nginx 配置中的静态文件路径

### 4. 构建失败

**原因**：依赖未安装或 Node.js 版本不兼容

**解决**：
```bash
# 删除 node_modules 和 package-lock.json
rm -rf node_modules package-lock.json

# 重新安装
npm install
```

---

## 性能优化建议

### 1. 开启 Gzip 压缩

在宝塔面板【网站设置】→【配置文件】中添加：

```nginx
gzip on;
gzip_vary on;
gzip_min_length 1k;
gzip_comp_level 6;
gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss;
```

### 2. 配置浏览器缓存

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. 使用 CDN

将静态资源上传到 CDN（如阿里云 OSS、腾讯云 COS），在 `_config.yml` 中配置 CDN 路径。

---

## 备份建议

### 1. 定期备份源文件

备份以下文件夹和文件：
- `source/` - 文章和页面源文件
- `themes/` - 主题文件
- `_config.yml` - 站点配置
- `scaffolds/` - 文章模板

### 2. 使用宝塔自动备份

在【计划任务】中添加：
- 备份网站：每天或每周
- 备份数据库（如果有）：每天
- 保留备份份数：建议 7-10 份

---

## 安全建议

1. **隐藏敏感文件**
   - 确保 `.git` 目录不在 web 根目录
   - 将 `node_modules` 设置为不可访问

2. **设置目录权限**
   ```bash
   chown -R www:www /www/wwwroot/xingranya.cn
   chmod -R 755 /www/wwwroot/xingranya.cn
   ```

3. **安装防火墙**
   - 在宝塔面板【安全】中配置防火墙规则
   - 只开放必要的端口（80、443、22）

---

## 联系方式

如有问题，请联系：
- 网站：https://xingranya.cn
- 作者：xingranya

---

**文档版本**: v1.0
**最后更新**: 2026-01-24
