const fs = require('fs');
const path = require('path');
const hfm = require('hexo-front-matter');

const postsDir = path.join(process.cwd(), 'source', '_posts');
const requiredTextFields = ['title', 'date', 'banner', 'cover'];
const requiredListFields = ['categories', 'tags'];

function walkMarkdownFiles(dir) {
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walkMarkdownFiles(fullPath);
    if (entry.isFile() && entry.name.endsWith('.md')) return [fullPath];
    return [];
  });
}

function isPresent(value) {
  return value !== undefined && value !== null && String(value).trim() !== '';
}

function isNonEmptyList(value) {
  return Array.isArray(value) && value.length > 0 && value.every(isPresent);
}

function isHttpUrl(value) {
  if (!isPresent(value)) return false;
  try {
    const url = new URL(String(value));
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (error) {
    return false;
  }
}

function isExistingLocalAsset(value) {
  if (!isPresent(value)) return false;
  const assetPath = String(value).trim();
  if (!assetPath.startsWith('/') || assetPath.includes('..')) return false;
  return fs.existsSync(path.join(process.cwd(), 'source', assetPath.replace(/^\/+/, '')));
}

function isValidDate(value) {
  return isPresent(value) && !Number.isNaN(new Date(value).getTime());
}

function validatePost(filePath) {
  const relativePath = path.relative(process.cwd(), filePath);
  const raw = fs.readFileSync(filePath, 'utf8');
  const post = hfm.parse(raw);
  const errors = [];

  requiredTextFields.forEach((field) => {
    if (!isPresent(post[field])) {
      errors.push(`缺少 ${field}`);
    }
  });

  requiredListFields.forEach((field) => {
    if (!isNonEmptyList(post[field])) {
      errors.push(`${field} 不能为空列表`);
    }
  });

  if (isPresent(post.date) && !isValidDate(post.date)) {
    errors.push('date 格式无效');
  }

  if (isPresent(post.cover) && !isHttpUrl(post.cover) && !isExistingLocalAsset(post.cover)) {
    errors.push('cover 必须是 http(s) 外链或已存在的站内绝对路径');
  }

  return errors.map((message) => `${relativePath}: ${message}`);
}

function main() {
  const markdownFiles = walkMarkdownFiles(postsDir).sort();
  const errors = markdownFiles.flatMap(validatePost);

  if (errors.length > 0) {
    console.error('文章检查失败：');
    errors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
  }

  console.log(`文章检查通过：${markdownFiles.length} 篇已发布文章。`);
}

if (typeof hexo === 'undefined') {
  main();
}
