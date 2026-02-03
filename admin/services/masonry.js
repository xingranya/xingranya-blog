const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const config = require('../config');

// 博客 masonry.yml 数据文件路径
const masonryPath = path.resolve(__dirname, '..', config.blogRoot, 'source/_data/masonry.yml');

// 确保目录存在
const ensureDir = () => {
  const dir = path.dirname(masonryPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// 读取数据
const getData = () => {
  ensureDir();
  if (!fs.existsSync(masonryPath)) {
    return [];
  }
  try {
    const content = fs.readFileSync(masonryPath, 'utf8');
    const data = yaml.load(content);
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error('读取 masonry.yml 失败:', e);
    return [];
  }
};

// 保存数据
const saveData = (data) => {
  ensureDir();
  const content = yaml.dump(data, {
    indent: 2,
    lineWidth: -1,
    noRefs: true
  });
  fs.writeFileSync(masonryPath, content, 'utf8');
};

module.exports = {
  // 获取所有图片
  list: async () => {
    const data = getData();
    // 为每项添加索引作为 id（用于前端操作）
    return data.map((item, index) => ({
      id: index.toString(),
      image: item.image,
      title: item.title || '',
      description: item.description || ''
    }));
  },

  // 添加图片
  add: async ({ url, title, description }) => {
    const data = getData();

    const newItem = {
      image: url,
      title: title || '',
      description: description || ''
    };

    // 添加到开头
    data.unshift(newItem);
    saveData(data);

    return {
      id: '0',
      ...newItem
    };
  },

  // 更新图片信息
  update: async (id, { title, description }) => {
    const data = getData();
    const index = parseInt(id, 10);

    if (isNaN(index) || index < 0 || index >= data.length) {
      throw new Error('图片不存在');
    }

    if (title !== undefined) {
      data[index].title = title;
    }
    if (description !== undefined) {
      data[index].description = description;
    }

    saveData(data);
    return { success: true };
  },

  // 删除图片（从展示列表移除）
  delete: async (id) => {
    const data = getData();
    const index = parseInt(id, 10);

    if (isNaN(index) || index < 0 || index >= data.length) {
      throw new Error('图片不存在');
    }

    data.splice(index, 1);
    saveData(data);
    return { success: true };
  }
};
