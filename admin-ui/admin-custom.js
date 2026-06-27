(function () {
  'use strict';

  document.documentElement.lang = 'zh-CN';
  document.title = '博客写作后台';

  var textMap = {
    'Posts': '文章',
    'Pages': '页面',
    'About': '关于',
    'Deploy': '发布',
    'Settings': '设置',
    'New Post': '新建文章',
    'Loading...': '正在加载...',
    'Draft': '草稿',
    'Publish': '发布',
    'Unpublish': '转为草稿',
    'Preview': '预览',
    'Date': '发布日期',
    'Author': '作者',
    'Tags': '标签',
    'Categories': '分类',
    'banner': '横幅文案',
    'cover': '封面图',
    'Std Output': '执行输出',
    'Std Error': '错误输出',
    'Settings': '设置',
    'Editor Settings': '编辑器设置',
    'Image Pasting Settings': '图片粘贴设置',
    'This is the Hexo Admin Plugin': '博客写作后台',
    'Goal: Provide an awesome admin experience for managing your blog.': '用于管理文章、页面和发布流程。',
    'Useful links:': '相关链接：',
    'Hexo site': 'Hexo 官网',
    'Github page for this plugin': '插件项目页',
    'Set various settings for your admin panel and editor.': '调整后台和编辑器的常用设置。',
    'Hexo admin can be secured with a password.': '可以为本地后台设置访问密码。',
    'Setup authentification here.': '在这里设置认证。',
    'Enable line numbering.': '显示行号',
    'Enable spellchecking. (buggy on older browsers)': '启用拼写检查',
    'Always ask for filename.': '粘贴图片时询问文件名',
    'Overwrite images if file already exists.': '同名图片已存在时覆盖',
    'Image directory': '图片目录',
    'Image filename prefix': '图片文件名前缀',
    'Type a message here and hit `deploy` to run your deploy script.': '输入本次更新说明，点击发布后会校验、构建、提交并推送。',
    'Back to Preview': '返回预览'
  };

  var titleMap = {
    'Settings': '文章设置',
    'Remove': '删除草稿',
    "Can't Remove Published Post": '已发布文章不能在这里删除',
    'Check for Writing Improvements': '检查英文写作建议',
    'Rename File': '重命名文件'
  };

  var placeholderMap = {
    'Deploy/commit message': '本次更新说明',
    'Untitled': '未命名文章'
  };

  function shouldSkip(node) {
    if (!node || !node.parentElement) return true;
    return Boolean(node.parentElement.closest('.CodeMirror, .editor_rendered, .posts_content, script, style'));
  }

  function replaceTextNode(node) {
    if (shouldSkip(node)) return;

    var raw = node.nodeValue;
    var normalized = raw.replace(/\s+/g, ' ').trim();
    if (!normalized) return;

    if (textMap[normalized]) {
      node.nodeValue = raw.replace(normalized, textMap[normalized]);
      return;
    }

    if (normalized === 'Markdown') {
      node.nodeValue = raw.replace('Markdown', 'Markdown 编辑');
      return;
    }

    if (normalized.indexOf('saved ') === 0) {
      node.nodeValue = raw.replace('saved ', '已保存 ');
      return;
    }

    var wordsMatch = normalized.match(/^(\d+)\s+words$/);
    if (wordsMatch) {
      node.nodeValue = raw.replace(normalized, wordsMatch[1] + ' 字');
    }
  }

  function walkText(root) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
    var nodes = [];
    var node;
    while ((node = walker.nextNode())) nodes.push(node);
    nodes.forEach(replaceTextNode);
  }

  function localizeAttributes(root) {
    Object.keys(titleMap).forEach(function (title) {
      Array.prototype.forEach.call(root.querySelectorAll('[title="' + title.replace(/"/g, '\\"') + '"]'), function (el) {
        el.setAttribute('title', titleMap[title]);
      });
    });

    Object.keys(placeholderMap).forEach(function (placeholder) {
      Array.prototype.forEach.call(root.querySelectorAll('[placeholder="' + placeholder + '"]'), function (el) {
        el.setAttribute('placeholder', placeholderMap[placeholder]);
      });
    });

    Array.prototype.forEach.call(root.querySelectorAll('input[type="submit"][value="Deploy"]'), function (el) {
      el.value = '发布';
    });

    Array.prototype.forEach.call(root.querySelectorAll('.new-post_input'), function (el) {
      if (el.value === 'Untitled') el.value = '未命名文章';
    });
  }

  function addPageHints(root) {
    var deploy = root.querySelector('.deploy');
    if (deploy && !deploy.querySelector('.admin-page-kicker')) {
      deploy.insertAdjacentHTML('afterbegin', '<div class="admin-page-kicker">发布到 GitHub</div><h1>发布更新</h1>');
    }

    var settings = root.querySelector('.settings');
    if (settings && !settings.querySelector('.admin-page-kicker')) {
      settings.insertAdjacentHTML('afterbegin', '<div class="admin-page-kicker">本地编辑器</div>');
    }

    var about = root.querySelector('.about');
    if (about && !about.querySelector('.admin-page-kicker')) {
      about.insertAdjacentHTML('afterbegin', '<div class="admin-page-kicker">Hexo Admin</div>');
    }
  }

  function localize(root) {
    walkText(root);
    localizeAttributes(root);
    addPageHints(root);
  }

  function start() {
    localize(document.body);

    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        Array.prototype.forEach.call(mutation.addedNodes, function (node) {
          if (node.nodeType === Node.TEXT_NODE) {
            replaceTextNode(node);
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            localize(node);
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
}());
