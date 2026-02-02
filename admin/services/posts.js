const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const config = require('../config');
const hexoService = require('./hexo');

const postsDir = path.resolve(__dirname, '..', config.blogRoot, 'source/_posts');

// Ensure directory exists
if (!fs.existsSync(postsDir)) {
  fs.mkdirSync(postsDir, { recursive: true });
}

const getPostPath = (filename) => {
  const sanitized = path.basename(filename);
  const fullPath = path.join(postsDir, sanitized);
  // Ensure the path is within postsDir to prevent directory traversal
  if (!fullPath.startsWith(postsDir)) {
    throw new Error('Invalid filename');
  }
  return fullPath;
};

module.exports = {
  list: async (page = 1, limit = 10, search = '') => {
    // 参数验证
    page = Math.max(1, parseInt(page) || 1);
    limit = Math.min(100, Math.max(1, parseInt(limit) || 10));

    try {
      const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));

      let posts = files.map(filename => {
        try {
          const content = fs.readFileSync(getPostPath(filename), 'utf8');
          const parsed = matter(content);
          return {
            filename,
            title: parsed.data.title || filename.replace('.md', ''),
            date: parsed.data.date ? new Date(parsed.data.date) : new Date(fs.statSync(getPostPath(filename)).birthtime),
            categories: parsed.data.categories || [],
            tags: parsed.data.tags || [],
            published: parsed.data.published !== false
          };
        } catch (e) {
          console.error(`Error parsing ${filename}:`, e);
          return null;
        }
      }).filter(p => p !== null);

      // Sort by date desc
      posts.sort((a, b) => b.date - a.date);

      // Search
      if (search) {
        const lowerSearch = search.toLowerCase();
        posts = posts.filter(p =>
          p.title.toLowerCase().includes(lowerSearch) ||
          p.filename.toLowerCase().includes(lowerSearch)
        );
      }

      // Pagination
      const total = posts.length;
      const start = (page - 1) * limit;
      const paginatedPosts = posts.slice(start, start + parseInt(limit));

      return {
        posts: paginatedPosts,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      throw error;
    }
  },

  get: async (filename) => {
    try {
      const filePath = getPostPath(filename);
      if (!fs.existsSync(filePath)) throw new Error('Post not found');

      const content = fs.readFileSync(filePath, 'utf8');
      const parsed = matter(content);

      return {
        filename,
        content: parsed.content,
        frontMatter: parsed.data,
        raw: content
      };
    } catch (error) {
      throw error;
    }
  },

  create: async (data) => {
    try {
      let filename = data.filename || `${data.title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '-').toLowerCase()}.md`;
      if (!filename.endsWith('.md')) filename += '.md';

      const filePath = getPostPath(filename);

      // Check if exists
      if (fs.existsSync(filePath)) {
        throw new Error('File already exists');
      }

      const content = matter.stringify(data.content || '', data.frontMatter || {
        title: data.title,
        date: new Date(),
        tags: [],
        categories: []
      });

      fs.writeFileSync(filePath, content, 'utf8');

      // Trigger generate in background
      hexoService.generate().catch(console.error);

      return { filename };
    } catch (error) {
      throw error;
    }
  },

  update: async (filename, data) => {
    try {
      const filePath = getPostPath(filename);
      if (!fs.existsSync(filePath)) throw new Error('Post not found');

      // 读取原文件，保留未修改的 frontmatter 字段
      const originalContent = fs.readFileSync(filePath, 'utf8');
      const originalParsed = matter(originalContent);

      // 合并 frontmatter：保留原有字段，用新数据覆盖
      const mergedFrontMatter = {
        ...originalParsed.data,  // 保留原有字段（如 banner）
        ...data.frontMatter      // 覆盖编辑器传来的字段
      };

      // 保持日期格式：如果原来是字符串格式，保持不变
      if (data.frontMatter.date) {
        const originalDate = originalParsed.data.date;
        const newDate = data.frontMatter.date;

        // 如果新日期是 Date 对象或 ISO 字符串，转换为简洁格式
        if (newDate instanceof Date || (typeof newDate === 'string' && newDate.includes('T'))) {
          const d = new Date(newDate);
          mergedFrontMatter.date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
        }
      }

      const content = matter.stringify(data.content || '', mergedFrontMatter);
      fs.writeFileSync(filePath, content, 'utf8');

      // Trigger generate
      hexoService.generate().catch(console.error);

      return { filename };
    } catch (error) {
      throw error;
    }
  },

  delete: async (filename) => {
    try {
      const filePath = getPostPath(filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);

        // Trigger generate
        hexoService.generate().catch(console.error);

        return true;
      }
      return false;
    } catch (error) {
      throw error;
    }
  },

  getStats: async () => {
    try {
      const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
      let categories = new Set();
      let tags = new Set();

      files.forEach(filename => {
        try {
          const content = fs.readFileSync(getPostPath(filename), 'utf8');
          const parsed = matter(content);
          if (parsed.data.categories) {
            if (Array.isArray(parsed.data.categories)) {
              parsed.data.categories.forEach(c => categories.add(c));
            } else {
              categories.add(parsed.data.categories);
            }
          }
          if (parsed.data.tags) {
            if (Array.isArray(parsed.data.tags)) {
              parsed.data.tags.forEach(t => tags.add(t));
            } else {
              tags.add(parsed.data.tags);
            }
          }
        } catch (e) {
          console.warn(`Failed to parse frontmatter in ${filename}:`, e.message);
        }
      });

      return {
        postsCount: files.length,
        categoriesCount: categories.size,
        tagsCount: tags.size
      };
    } catch (error) {
      console.error(error);
      return { postsCount: 0, categoriesCount: 0, tagsCount: 0 };
    }
  },

  getCategories: async () => {
    try {
      const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
      const categoryMap = new Map();

      files.forEach(filename => {
        try {
          const content = fs.readFileSync(getPostPath(filename), 'utf8');
          const parsed = matter(content);
          if (parsed.data.categories) {
            const cats = Array.isArray(parsed.data.categories)
              ? parsed.data.categories
              : [parsed.data.categories];
            cats.forEach(c => {
              if (c) {
                categoryMap.set(c, (categoryMap.get(c) || 0) + 1);
              }
            });
          }
        } catch (e) {
          console.warn(`Failed to parse frontmatter in ${filename}:`, e.message);
        }
      });

      return Array.from(categoryMap.entries()).map(([name, count]) => ({
        name,
        count
      })).sort((a, b) => b.count - a.count);
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  getTags: async () => {
    try {
      const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
      const tagMap = new Map();

      files.forEach(filename => {
        try {
          const content = fs.readFileSync(getPostPath(filename), 'utf8');
          const parsed = matter(content);
          if (parsed.data.tags) {
            const tagList = Array.isArray(parsed.data.tags)
              ? parsed.data.tags
              : [parsed.data.tags];
            tagList.forEach(t => {
              if (t) {
                tagMap.set(t, (tagMap.get(t) || 0) + 1);
              }
            });
          }
        } catch (e) {
          console.warn(`Failed to parse frontmatter in ${filename}:`, e.message);
        }
      });

      return Array.from(tagMap.entries()).map(([name, count]) => ({
        name,
        count
      })).sort((a, b) => b.count - a.count);
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  getMonthlyStats: async () => {
    try {
      const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
      const monthlyMap = new Map();

      files.forEach(filename => {
        try {
          const content = fs.readFileSync(getPostPath(filename), 'utf8');
          const parsed = matter(content);
          const date = parsed.data.date ? new Date(parsed.data.date) : new Date(fs.statSync(getPostPath(filename)).birthtime);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + 1);
        } catch (e) {}
      });

      // 获取最近12个月的数据
      const result = [];
      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        result.push({
          month: key,
          count: monthlyMap.get(key) || 0
        });
      }

      return result;
    } catch (error) {
      console.error(error);
      return [];
    }
  }
};
