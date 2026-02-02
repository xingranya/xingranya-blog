# 开发者备忘录

## 🎯 项目关键信息

**项目名称**: 星苒鸭博客  
**框架**: Hexo 7.3.0  
**主题**: defaultone (自定义)  
**最后更新**: 2026年2月  

## 🔧 开发环境配置

### 必需工具
- Node.js >= 14.0.0
- npm 或 yarn
- 文本编辑器 (推荐 VS Code)

### 开发命令速查
```bash
# 启动开发服务器
npm run server

# 构建生产版本
npm run build

# 清理缓存
npm run clean

# 部署
npm run deploy
```

## 📁 目录结构要点

```
source/_posts/          # ✅ 文章存放位置
themes/defaultone/      # ✅ 主题开发目录
_config.yml            # ✅ 站点主配置
themes/defaultone/_config.yml  # ✅ 主题配置
```

## ⚡ 日常开发流程

1. **启动开发环境**
   ```bash
   npm run server
   ```

2. **编写文章** (在 `source/_posts/`)

3. **实时预览** (http://localhost:4000)

4. **构建部署**
   ```bash
   npm run clean
   npm run build
   npm run deploy
   ```

## 🎨 主题开发要点

### 样式修改
- 文件位置: `themes/defaultone/source/css/`
- 使用Stylus语法
- CSS变量在 `:root` 中定义

### 模板修改
- 文件位置: `themes/defaultone/layout/`
- 使用EJS模板语法
- 组件化结构，便于维护

### JavaScript
- 文件位置: `themes/defaultone/source/js/`
- ES6+ 语法支持
- 模块化组织

## 🔧 常见问题解决

### 页面样式异常
```bash
npm run clean
npm run build
```

### 新文章不显示
- 检查Front-matter格式
- 确认date不是未来时间
- 文件必须在 `_posts/` 目录

### 本地服务启动失败
```bash
# 重装依赖
rm -rf node_modules package-lock.json
npm install
```

## 📱 移动端适配

主题已内置响应式设计：
- 使用Tailwind CSS断点
- 移动优先的设计理念
- 触摸友好的交互设计

## 🔒 注意事项

⚠️ **不要直接修改 `public/` 目录**  
⚠️ **重要的配置变更后要重新构建**  
⚠️ **部署前务必测试所有功能**  

## 📊 性能监控

- 页面加载速度
- 图片优化程度
- 代码分割效果
- 缓存策略有效性

## 🔄 版本升级注意事项

升级Hexo或主题时：
1. 备份当前配置
2. 查看更新日志
3. 逐步升级测试
4. 验证所有功能

---

*这份备忘录会随着项目发展持续更新*