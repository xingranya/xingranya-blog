(function () {
  'use strict';

  document.documentElement.lang = 'zh-CN';
  document.title = '博客写作后台';

  var textMap = {
    'Posts': '文章',
    'Pages': '页面',
    'About': '壁纸图库',
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
    'Back to Preview': '返回预览',
    'Delete this post?': '确定删除这篇文章？',
    'This operation will move current draft into source/_discarded folder.': '删除后会移除本地 Markdown 文件，图仓远端图片会保留。',
    'Yes': '删除',
    'No': '取消'
  };

  var titleMap = {
    'Settings': '文章设置',
    'Remove': '删除草稿',
    "Can't Remove Published Post": '已发布文章不能在这里删除',
    'Check for Writing Improvements': '检查英文写作建议',
    'Rename File': '重命名文件'
  };

  var API_BASE = '/admin/api';
  var MAX_IMAGE_BYTES = 5 * 1024 * 1024;
  var termCache = null;
  var wallpaperRouteAutoOpened = false;
  var templatePageCache = {};
  var adminImageObserver = null;

  function requestJson(url, options) {
    var nextOptions = options || {};
    nextOptions.headers = Object.assign({
      'Content-Type': 'application/json'
    }, nextOptions.headers || {});

    return fetch(API_BASE + url, nextOptions).then(function (response) {
      return response.text().then(function (text) {
        var data = {};
        if (text) {
          try {
            data = JSON.parse(text);
          } catch (error) {
            if (!response.ok) throw new Error(text || '请求失败。');
            throw new Error('后台返回内容无法解析。');
          }
        }
        if (!response.ok || data.success === false) {
          throw new Error(data.error || data.msg || '请求失败。');
        }
        return data;
      });
    });
  }

  function showToast(message, type) {
    var toast = document.querySelector('.admin-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'admin-toast';
      document.body.appendChild(toast);
    }

    toast.className = 'admin-toast admin-toast--' + (type || 'info');
    toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
    toast.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(function () {
      toast.hidden = true;
    }, 3600);
  }

  function formatBytes(bytes) {
    var value = Number(bytes || 0);
    if (value < 1024) return value + ' B';
    if (value < 1024 * 1024) return (value / 1024).toFixed(1) + ' KB';
    return (value / 1024 / 1024).toFixed(2) + ' MB';
  }

  function purposeLabel(purpose) {
    if (purpose === 'cover') return '封面图';
    if (purpose === 'wallpaper') return '壁纸';
    if (purpose === 'link') return '友情链接图片';
    return '文章图片';
  }

  function ensureUploadCenter() {
    var center = document.querySelector('.admin-upload-center');
    if (center) return center;

    center = document.createElement('section');
    center.className = 'admin-upload-center';
    center.setAttribute('aria-live', 'polite');
    center.innerHTML = '' +
      '<div class="admin-upload-center-head">' +
        '<div><strong>上传任务</strong><span>图片会自动压缩到 5MB 内</span></div>' +
        '<button type="button" aria-label="收起上传任务">收起</button>' +
      '</div>' +
      '<div class="admin-upload-list"></div>';
    document.body.appendChild(center);

    center.querySelector('button').addEventListener('click', function () {
      center.classList.toggle('admin-upload-center--collapsed');
    });

    return center;
  }

  function createUploadTask(title, detail) {
    var center = ensureUploadCenter();
    var list = center.querySelector('.admin-upload-list');
    var item = document.createElement('article');
    item.className = 'admin-upload-task';
    item.innerHTML = '' +
      '<div class="admin-upload-task-top">' +
        '<strong></strong>' +
        '<span class="admin-upload-percent">0%</span>' +
      '</div>' +
      '<p class="admin-upload-detail"></p>' +
      '<div class="admin-upload-progress" aria-hidden="true"><span></span></div>' +
      '<div class="admin-upload-status">等待开始...</div>';

    item.querySelector('strong').textContent = title;
    item.querySelector('.admin-upload-detail').textContent = detail || '';
    list.prepend(item);
    center.classList.remove('admin-upload-center--collapsed');

    function update(percent, status, type) {
      var nextPercent = Math.max(0, Math.min(100, Math.round(percent || 0)));
      item.className = 'admin-upload-task admin-upload-task--' + (type || 'running');
      item.querySelector('.admin-upload-percent').textContent = nextPercent + '%';
      item.querySelector('.admin-upload-progress span').style.width = nextPercent + '%';
      item.querySelector('.admin-upload-status').textContent = status || '';
    }

    return {
      update: update,
      done: function (status) {
        update(100, status || '完成', 'success');
        setTimeout(function () {
          if (item.parentElement) item.remove();
          if (!list.children.length) center.classList.add('admin-upload-center--collapsed');
        }, 7000);
      },
      fail: function (status) {
        update(100, status || '上传失败', 'error');
      }
    };
  }

  function notifyUploadStatus(options, message, percent, task, type) {
    if (options && options.onStatus) options.onStatus(message);
    if (task) task.update(percent, message, type);
  }

  function postJsonWithProgress(url, payload, onProgress) {
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', API_BASE + url, true);
      xhr.setRequestHeader('Content-Type', 'application/json');

      xhr.upload.onprogress = function (event) {
        if (event.lengthComputable && onProgress) {
          onProgress(event.loaded / event.total);
        }
      };

      xhr.onload = function () {
        var data = {};
        try {
          data = xhr.responseText ? JSON.parse(xhr.responseText) : {};
        } catch (error) {
          reject(new Error('后台返回内容无法解析。'));
          return;
        }

        if (xhr.status < 200 || xhr.status >= 300 || data.success === false) {
          reject(new Error(data.error || data.msg || '请求失败。'));
          return;
        }

        resolve(data);
      };

      xhr.onerror = function () {
        reject(new Error('网络请求失败。'));
      };

      xhr.send(JSON.stringify(payload));
    });
  }

  function blobToDataUrl(blob, onProgress) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function (event) {
        resolve(event.target.result);
      };
      reader.onprogress = function (event) {
        if (event.lengthComputable && onProgress) {
          onProgress(event.loaded / event.total);
        }
      };
      reader.onerror = function () {
        reject(new Error('读取图片失败。'));
      };
      reader.readAsDataURL(blob);
    });
  }

  function loadImageFromFile(file) {
    return new Promise(function (resolve, reject) {
      var image = new Image();
      var url = URL.createObjectURL(file);

      image.onload = function () {
        URL.revokeObjectURL(url);
        resolve(image);
      };
      image.onerror = function () {
        URL.revokeObjectURL(url);
        reject(new Error('图片无法解码，不能自动压缩。'));
      };
      image.src = url;
    });
  }

  function canvasToBlob(canvas, type, quality) {
    return new Promise(function (resolve, reject) {
      canvas.toBlob(function (blob) {
        if (blob) return resolve(blob);
        reject(new Error('图片压缩失败。'));
      }, type, quality);
    });
  }

  function renameAsJpg(filename) {
    return String(filename || 'image').replace(/\.[^.]+$/, '') + '.jpg';
  }

  function makeFile(blob, filename, type) {
    try {
      return new File([blob], filename, { type: type || blob.type || 'image/jpeg' });
    } catch (error) {
      blob.name = filename;
      return blob;
    }
  }

  function compressImage(file) {
    if (!file || !/^image\//.test(file.type || '')) {
      return Promise.reject(new Error('只能上传图片文件。'));
    }

    if (file.size <= MAX_IMAGE_BYTES) {
      return Promise.resolve(file);
    }

    return loadImageFromFile(file).then(function (image) {
      var canvas = document.createElement('canvas');
      var context = canvas.getContext('2d');
      var width = image.naturalWidth || image.width;
      var height = image.naturalHeight || image.height;
      var scale = 1;
      var quality = 0.88;
      var attempts = 0;

      function tryCompress() {
        attempts += 1;
        canvas.width = Math.max(1, Math.round(width * scale));
        canvas.height = Math.max(1, Math.round(height * scale));
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        return canvasToBlob(canvas, 'image/jpeg', quality).then(function (blob) {
          if (blob.size <= MAX_IMAGE_BYTES) {
            return makeFile(blob, renameAsJpg(file.name), 'image/jpeg');
          }
          if (attempts >= 16 || canvas.width <= 360 || canvas.height <= 360) {
            throw new Error('图片超过 5MB，自动压缩后仍然过大。');
          }

          if (quality > 0.5) {
            quality -= 0.12;
          } else {
            scale *= 0.82;
            quality = 0.82;
          }

          return tryCompress();
        });
      }

      return tryCompress();
    });
  }

  function uploadImage(file, purpose, options) {
    var uploadOptions = options || {};
    var label = purposeLabel(purpose);
    var task = uploadOptions.task || createUploadTask(label + '上传', (file && file.name ? file.name : '图片') + ' · ' + formatBytes(file && file.size));
    notifyUploadStatus(uploadOptions, file.size > MAX_IMAGE_BYTES ? '正在压缩图片...' : '正在准备上传...', 8, task);

    return compressImage(file).then(function (readyFile) {
      notifyUploadStatus(uploadOptions, readyFile.size !== file.size ? '压缩完成：' + formatBytes(readyFile.size) : '图片无需压缩。', 30, task);
      notifyUploadStatus(uploadOptions, '正在读取图片文件...', 38, task);
      return blobToDataUrl(readyFile, function (ratio) {
        task.update(38 + ratio * 18, '正在读取图片文件...');
      }).then(function (dataUrl) {
        notifyUploadStatus(uploadOptions, '正在上传到本地后台...', 60, task);
        return postJsonWithProgress('/tucang/upload', {
            purpose: purpose || 'post',
            filename: readyFile.name || file.name || 'image.jpg',
            data: dataUrl
          }, function (ratio) {
            task.update(60 + ratio * 20, '正在上传到本地后台...');
          }).then(function (result) {
            task.update(90, '图仓处理中，等待返回链接...');
            result._uploadTask = task;
            if (!uploadOptions.deferDone) {
              task.done('上传完成，已获得图床链接。');
            }
            return result;
        });
      });
    }).catch(function (error) {
      task.fail(error.message || '上传失败。');
      throw error;
    });
  }

  function uploadImageUrl(url, purpose, options) {
    var uploadOptions = options || {};
    var task = uploadOptions.task || createUploadTask(purposeLabel(purpose) + ' URL 导入', url);
    notifyUploadStatus(uploadOptions, '正在从 URL 导入图仓...', 20, task);

    return postJsonWithProgress('/tucang/upload', {
        purpose: purpose || 'wallpaper',
        url: url
      }, function (ratio) {
        task.update(20 + ratio * 45, '正在提交导入请求...');
      }).then(function (result) {
        result._uploadTask = task;
        if (!uploadOptions.deferDone) {
          task.done('导入完成，已获得图床链接。');
        }
        return result;
      }).catch(function (error) {
        task.fail(error.message || 'URL 导入失败。');
        throw error;
    });
  }

  function saveCurrentPostContent(cm) {
    var postId = currentPostId();
    if (!postId) return Promise.resolve();

    return requestJson('/posts/' + encodeURIComponent(postId), {
      method: 'POST',
      body: JSON.stringify({ _content: cm.getValue() })
    });
  }

  function activeCodeMirror() {
    var active = document.activeElement;
    var wrapper = active && active.closest ? active.closest('.CodeMirror') : null;
    wrapper = wrapper || document.querySelector('.CodeMirror-focused') || document.querySelector('.CodeMirror');
    return wrapper && wrapper.CodeMirror ? wrapper.CodeMirror : null;
  }

  function safeImageAlt(filename) {
    return String(filename || '图片')
      .replace(/\.[^.]+$/, '')
      .replace(/[[\]()]/g, '')
      .trim() || '图片';
  }

  function imageMarkdown(editor, alt, url) {
    var cursor = editor.getCursor ? editor.getCursor() : { line: 0, ch: 0 };
    var line = editor.getLine ? editor.getLine(cursor.line) || '' : '';
    var needsLineBreakBefore = line.slice(0, cursor.ch).trim() || line.slice(cursor.ch).trim();
    return (needsLineBreakBefore ? '\n' : '') + '![' + alt + '](' + url + ')' + '\n';
  }

  function forceEditorPreview(editor) {
    if (!editor) return;

    if (typeof editor.focus === 'function') editor.focus();
    if (typeof editor.refresh === 'function') editor.refresh();

    setTimeout(function () {
      if (window.CodeMirror && typeof window.CodeMirror.signal === 'function') {
        window.CodeMirror.signal(editor, 'change', editor, { origin: '+input' });
        return;
      }

      if (typeof editor.setValue === 'function' && typeof editor.getValue === 'function') {
        var cursor = editor.getCursor && editor.getCursor();
        var scroll = editor.getScrollInfo && editor.getScrollInfo();
        editor.setValue(editor.getValue());
        if (cursor && editor.setCursor) editor.setCursor(cursor);
        if (scroll && editor.scrollTo) editor.scrollTo(scroll.left, scroll.top);
      }
    }, 0);
  }

  function imageRealSrc(image) {
    return image.getAttribute('data-admin-original-src') ||
      image.getAttribute('data-src') ||
      image.getAttribute('data-original') ||
      image.getAttribute('lazy-src') ||
      image.getAttribute('src') ||
      '';
  }

  function loadAdminImageNow(image) {
    var realSrc = imageRealSrc(image);
    if (!realSrc) return;

    image.setAttribute('data-admin-original-src', realSrc);
    image.removeAttribute('lazyload');
    image.removeAttribute('data-src');
    image.removeAttribute('data-original');
    image.removeAttribute('lazy-src');

    if (image.getAttribute('src') !== realSrc) {
      image.setAttribute('src', realSrc);
    }
  }

  function isImageNearViewport(image) {
    var rect = image.getBoundingClientRect();
    var margin = 640;
    return rect.bottom >= -margin &&
      rect.right >= -margin &&
      rect.top <= (window.innerHeight || document.documentElement.clientHeight) + margin &&
      rect.left <= (window.innerWidth || document.documentElement.clientWidth) + margin;
  }

  function ensureAdminImageObserver() {
    if (adminImageObserver || !('IntersectionObserver' in window)) return adminImageObserver;

    adminImageObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        loadAdminImageNow(entry.target);
        adminImageObserver.unobserve(entry.target);
      });
    }, {
      root: null,
      rootMargin: '640px 0px',
      threshold: 0.01
    });

    return adminImageObserver;
  }

  function setupAdminImages(root) {
    Array.prototype.forEach.call((root || document).querySelectorAll('img'), function (image) {
      var realSrc = imageRealSrc(image);
      var isThemeLazyImage = Boolean(image.getAttribute('data-src') || image.hasAttribute('lazyload'));

      if (realSrc && /^https?:\/\//.test(realSrc)) {
        image.setAttribute('data-admin-original-src', realSrc);
      }

      image.setAttribute('loading', isThemeLazyImage ? 'lazy' : 'eager');
      image.setAttribute('decoding', 'async');
      image.referrerPolicy = 'no-referrer';

      if (image.complete && image.naturalWidth > 0) {
        image.classList.add('admin-image-loaded');
      } else if (image.complete && image.getAttribute('src')) {
        image.classList.add('admin-image-error');
      }

      if (!image.dataset.adminImageBound) {
        image.dataset.adminImageBound = 'true';
        image.addEventListener('load', function () {
          image.classList.add('admin-image-loaded');
          image.classList.remove('admin-image-error');
        });
        image.addEventListener('error', function () {
          image.classList.add('admin-image-error');
          image.classList.remove('admin-image-loaded');
        });
      }

      if (!isThemeLazyImage) return;

      if (isImageNearViewport(image)) {
        loadAdminImageNow(image);
      } else {
        var observer = ensureAdminImageObserver();
        if (observer) observer.observe(image);
      }

      clearTimeout(image._adminImageFallbackTimer);
      image._adminImageFallbackTimer = setTimeout(function () {
        loadAdminImageNow(image);
      }, 1200);
    });
  }

  function imageFromClipboard(event) {
    var items = event.clipboardData && event.clipboardData.items;
    if (!items) return null;

    for (var i = 0; i < items.length; i += 1) {
      if (items[i].kind === 'file') {
        var file = items[i].getAsFile();
        if (file && /^image\//.test(file.type || '')) return file;
      }
    }

    return null;
  }

  function handlePasteImage(event) {
    var file = imageFromClipboard(event);
    if (!file) return;

    var cm = activeCodeMirror();
    if (!cm) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    showToast('正在处理图片...', 'info');

    insertPostImage(file, cm);
  }

  function insertPostImage(file, cm) {
    if (!file) {
      showToast('请选择一张图片。', 'error');
      return Promise.resolve();
    }

    var editor = cm || activeCodeMirror();
    if (!editor) {
      showToast('请先打开一篇文章，再插入图片。', 'error');
      return Promise.resolve();
    }

    showToast('正在处理图片...', 'info');

    return uploadImage(file, 'post', {
      deferDone: true,
      onStatus: function (message) {
        showToast(message, 'info');
      }
    }).then(function (result) {
      var task = result._uploadTask;
      var alt = safeImageAlt(file.name);
      editor.replaceSelection(imageMarkdown(editor, alt, result.url), 'end', '+input');
      forceEditorPreview(editor);
      if (task) task.update(94, '正在写入文章...');
      showToast('图片已上传，正在写入文章...', 'info');
      return saveCurrentPostContent(editor).then(function () {
        if (task) task.done('图片已上传并写入文章。');
        showToast('图片已上传并写入文章。', 'success');
      }).catch(function (error) {
        if (task) task.fail('图片已上传，但写入文章失败。');
        showToast('图片已上传，但写入文章失败：' + (error.message || '请手动保存。'), 'error');
      });
    }).catch(function (error) {
      showToast(error.message || '图片上传失败。', 'error');
    });
  }

  function setNativeValue(input, value) {
    var descriptor = Object.getOwnPropertyDescriptor(input.constructor.prototype, 'value');
    if (descriptor && descriptor.set) {
      descriptor.set.call(input, value);
    } else {
      input.value = value;
    }
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function currentPostId() {
    var match = window.location.hash.match(/posts\/([^/?#]+)/);
    return match ? decodeURIComponent(match[1]) : '';
  }

  function currentPageId() {
    var match = window.location.hash.match(/pages\/([^/?#]+)/);
    return match ? decodeURIComponent(match[1]) : '';
  }

  function enhanceCoverUpload(root) {
    Array.prototype.forEach.call(root.querySelectorAll('.config_section'), function (section) {
      var title = section.querySelector('.config_section-title');
      var input = section.querySelector('input.config_metadata[name="cover"]');
      if (!title || !input || section.classList.contains('admin-cover-enhanced')) return;

      section.classList.add('admin-cover-enhanced');
      var button = document.createElement('button');
      var fileInput = document.createElement('input');

      button.type = 'button';
      button.className = 'admin-inline-button';
      button.textContent = '上传封面';
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.hidden = true;

      button.addEventListener('click', function () {
        fileInput.click();
      });
      fileInput.addEventListener('change', function () {
        var file = fileInput.files && fileInput.files[0];
        if (!file) return;

        button.disabled = true;
        button.textContent = '处理中...';
        uploadImage(file, 'cover', {
          deferDone: true,
          onStatus: function (message) {
            showToast(message, 'info');
          }
        }).then(function (result) {
          var task = result._uploadTask;
          var postId = currentPostId();
          setNativeValue(input, result.url);
          if (postId) {
            if (task) task.update(94, '正在保存封面字段...');
            showToast('封面已上传，正在保存文章...', 'info');
            return requestJson('/posts/' + encodeURIComponent(postId), {
              method: 'POST',
              body: JSON.stringify({ cover: result.url })
            }).then(function (data) {
              if (task) task.done('封面图已上传并保存。');
              return data;
            });
          }
          if (task) task.done('封面图已上传并填写。');
          return result;
        }).then(function () {
          showToast('封面图已填写。', 'success');
        }).catch(function (error) {
          showToast(error.message || '封面上传失败。', 'error');
        }).then(function () {
          button.disabled = false;
          button.textContent = '上传封面';
          fileInput.value = '';
        });
      });

      input.insertAdjacentElement('afterend', button);
      button.insertAdjacentElement('afterend', fileInput);
    });
  }

  function fetchTerms() {
    if (termCache) return Promise.resolve(termCache);
    return requestJson('/tags-categories-and-metadata', { method: 'GET' }).then(function (data) {
      termCache = {
        tags: Object.keys(data.tags || {}).map(function (key) { return data.tags[key]; }).filter(Boolean),
        categories: Object.keys(data.categories || {}).map(function (key) { return data.categories[key]; }).filter(Boolean)
      };
      return termCache;
    });
  }

  function selectedAutolistValues(section) {
    return Array.prototype.map.call(section.querySelectorAll('.autolist_show:not(.autolist_show--new)'), function (item) {
      return item.textContent.trim();
    });
  }

  function addAutolistValue(section, value) {
    var selected = selectedAutolistValues(section);
    if (selected.indexOf(value) !== -1) return;

    var addNew = section.querySelector('.autolist_show--new');
    if (!addNew) return;

    addNew.dispatchEvent(new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
      button: 0
    }));

    setTimeout(function () {
      var input = section.querySelector('.autolist_input');
      if (!input) return;

      setNativeValue(input, value);
      input.dispatchEvent(new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        key: 'Enter'
      }));
      input.blur();
    }, 60);
  }

  function enhanceTermOptions(root) {
    var sections = Array.prototype.filter.call(root.querySelectorAll('.config_section'), function (section) {
      var title = section.querySelector('.config_section-title');
      return title && /^(Tags|标签|Categories|分类)$/.test(title.textContent.trim());
    });

    if (!sections.length) return;

    fetchTerms().then(function (terms) {
      sections.forEach(function (section) {
        if (section.querySelector('.admin-term-options')) return;

        var title = section.querySelector('.config_section-title').textContent.trim();
        var type = /Tags|标签/.test(title) ? 'tags' : 'categories';
        var options = terms[type] || [];
        if (!options.length) return;

        var panel = document.createElement('div');
        var search = document.createElement('input');
        var list = document.createElement('div');
        var count = document.createElement('div');

        panel.className = 'admin-term-options';
        search.className = 'admin-term-search';
        search.type = 'search';
        search.placeholder = type === 'tags' ? '搜索已有标签' : '搜索已有分类';
        search.setAttribute('aria-label', type === 'tags' ? '搜索已有标签' : '搜索已有分类');
        list.className = 'admin-term-list';
        count.className = 'admin-term-count';
        count.setAttribute('role', 'status');
        count.setAttribute('aria-live', 'polite');

        function renderOptions() {
          var query = search.value.trim().toLowerCase();
          var filtered = options.filter(function (option) {
            return !query || String(option).toLowerCase().indexOf(query) !== -1;
          });
          var shown = filtered.slice(0, 24);

          list.innerHTML = '';
          shown.forEach(function (option) {
            var button = document.createElement('button');
            button.type = 'button';
            button.textContent = option;
            button.addEventListener('click', function () {
              addAutolistValue(section, option);
            });
            list.appendChild(button);
          });

          count.textContent = filtered.length > shown.length
            ? '显示前 ' + shown.length + ' 项，继续输入可缩小范围'
            : '共 ' + filtered.length + ' 项可选';
        }

        search.addEventListener('input', renderOptions);
        panel.appendChild(search);
        panel.appendChild(list);
        panel.appendChild(count);
        section.appendChild(panel);
        renderOptions();
      });
    }).catch(function () {
      // 候选项加载失败时不阻断原有编辑功能。
    });
  }

  function enablePublishedRemove(root) {
    Array.prototype.forEach.call(root.querySelectorAll('.editor_remove[disabled]'), function (button) {
      button.disabled = false;
      button.removeAttribute('disabled');
      button.setAttribute('title', '删除文章');
    });
  }

  function enhanceEditorImageTools(root) {
    var header = root.querySelector('.editor_md-header') || root.querySelector('.editor_top');
    if (!header || header.querySelector('.admin-editor-image-tools')) return;

    var tools = document.createElement('span');
    var button = document.createElement('button');
    var fileInput = document.createElement('input');

    tools.className = 'admin-editor-image-tools';
    button.type = 'button';
    button.className = 'admin-editor-image-button';
    button.textContent = '插入图片';
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.hidden = true;

    button.addEventListener('click', function () {
      fileInput.click();
    });

    fileInput.addEventListener('change', function () {
      var file = fileInput.files && fileInput.files[0];
      if (!file) return;

      button.disabled = true;
      button.textContent = '上传中...';
      insertPostImage(file).then(function () {
        button.disabled = false;
        button.textContent = '插入图片';
        fileInput.value = '';
      });
    });

    tools.appendChild(button);
    tools.appendChild(fileInput);
    header.appendChild(tools);
  }

  function ensureWallpaperEntry() {
    var navLinks = Array.prototype.slice.call(document.querySelectorAll('.app_nav a'));
    var aboutLink = navLinks.find(function (link) {
      return /about/i.test(link.getAttribute('href') || '') || /关于|壁纸图库/.test(link.textContent || '');
    });

    function openFromNav(event) {
      if (event) event.preventDefault();
      navLinks.forEach(function (link) {
        link.classList.remove('active');
      });
      if (aboutLink) aboutLink.classList.add('active');
      openWallpaperPanel();
    }

    if (aboutLink && !aboutLink.classList.contains('admin-wallpaper-nav')) {
      aboutLink.textContent = '壁纸图库';
      aboutLink.setAttribute('href', '#/wallpapers');
      aboutLink.classList.add('admin-wallpaper-nav');
      aboutLink.addEventListener('click', openFromNav);
    }

    if (!aboutLink && !document.querySelector('.admin-wallpaper-open')) {
      var header = document.querySelector('.app_header') || document.body;
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'admin-wallpaper-open';
      button.textContent = '壁纸图库';
      button.addEventListener('click', openWallpaperPanel);
      header.appendChild(button);
    }

    if (!wallpaperRouteAutoOpened && /\/(about|wallpapers)$/.test(window.location.hash)) {
      wallpaperRouteAutoOpened = true;
      openFromNav();
    }
  }

  function wallpaperPanelTemplate() {
    return '' +
      '<div class="admin-wallpaper-backdrop">' +
        '<section class="admin-wallpaper-panel" role="dialog" aria-modal="true" aria-labelledby="admin-wallpaper-title" tabindex="-1">' +
          '<div class="admin-wallpaper-head">' +
            '<div><div class="admin-page-kicker">博客壁纸页</div><h2 id="admin-wallpaper-title">壁纸图库</h2><p class="admin-wallpaper-count">正在读取...</p></div>' +
            '<button type="button" class="admin-wallpaper-close" aria-label="关闭">关闭</button>' +
          '</div>' +
          '<div class="admin-wallpaper-toolbar">' +
            '<div class="admin-wallpaper-import">' +
              '<button type="button" class="admin-wallpaper-upload">上传图片</button>' +
              '<input class="admin-wallpaper-file" type="file" accept="image/*" multiple hidden>' +
              '<input class="admin-wallpaper-url" type="url" placeholder="从图片 URL 导入" aria-label="图片 URL">' +
              '<button type="button" class="admin-wallpaper-url-add">导入 URL</button>' +
            '</div>' +
            '<input class="admin-wallpaper-search" type="search" placeholder="搜索标题、描述或图片链接" aria-label="搜索壁纸">' +
          '</div>' +
          '<div class="admin-wallpaper-status" role="status" aria-live="polite" hidden></div>' +
          '<div class="admin-wallpaper-list" aria-live="polite"></div>' +
        '</section>' +
      '</div>';
  }

  function focusableElements(root) {
    return Array.prototype.slice.call(root.querySelectorAll([
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled]):not([type="hidden"])',
      'textarea:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(','))).filter(function (element) {
      return !element.hidden && Boolean(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
    });
  }

  function focusWallpaperPanel(panel) {
    var target = panel.querySelector('.admin-wallpaper-upload') ||
      panel.querySelector('.admin-wallpaper-close') ||
      panel;

    try {
      target.focus({ preventScroll: true });
    } catch (error) {
      target.focus();
    }
  }

  function closeWallpaperPanel(backdrop) {
    backdrop.hidden = true;

    var returnFocus = backdrop._returnFocus;
    if (returnFocus && document.contains(returnFocus) && typeof returnFocus.focus === 'function') {
      try {
        returnFocus.focus({ preventScroll: true });
      } catch (error) {
        returnFocus.focus();
      }
    }
  }

  function trapWallpaperFocus(event, backdrop, panel) {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeWallpaperPanel(backdrop);
      return;
    }

    if (event.key !== 'Tab') return;

    var items = focusableElements(panel);
    if (!items.length) {
      event.preventDefault();
      panel.focus();
      return;
    }

    var first = items[0];
    var last = items[items.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
      return;
    }

    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function fileTitle(file) {
    return (file && file.name ? file.name : '新壁纸').replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim() || '新壁纸';
  }

  function setWallpaperStatus(panel, message, type) {
    var status = panel.querySelector('.admin-wallpaper-status');
    status.textContent = message || '';
    status.className = 'admin-wallpaper-status admin-wallpaper-status--' + (type || 'info');
    status.hidden = !message;
  }

  function refreshWallpaperCount(panel, shownCount) {
    var total = (panel._wallpaperItems || []).length;
    var count = panel.querySelector('.admin-wallpaper-count');
    var query = panel._wallpaperQuery || '';
    count.textContent = query ? '显示 ' + shownCount + ' / 共 ' + total + ' 张' : '共 ' + total + ' 张壁纸';
  }

  function renderWallpaperList(panel, items) {
    var list = panel.querySelector('.admin-wallpaper-list');
    var query = (panel._wallpaperQuery || '').trim().toLowerCase();
    var sourceItems = items || [];
    var viewItems = sourceItems.map(function (item, index) {
      return { item: item, index: index };
    }).filter(function (entry) {
      if (!query) return true;
      return [entry.item.title, entry.item.description, entry.item.image].join(' ').toLowerCase().indexOf(query) !== -1;
    });

    list.innerHTML = '';
    refreshWallpaperCount(panel, viewItems.length);

    if (!sourceItems.length) {
      list.innerHTML = '<p class="admin-wallpaper-empty">还没有壁纸。上传图片或从图片 URL 导入后，会写入博客的壁纸页。</p>';
      return;
    }

    if (!viewItems.length) {
      list.innerHTML = '<p class="admin-wallpaper-empty">没有匹配的壁纸。</p>';
      return;
    }

    viewItems.forEach(function (entry) {
      var item = entry.item;
      var index = entry.index;
      var row = document.createElement('article');
      var preview = document.createElement('a');
      var image = document.createElement('img');
      var fields = document.createElement('div');
      var title = document.createElement('input');
      var description = document.createElement('textarea');
      var url = document.createElement('input');
      var actions = document.createElement('div');
      var upButton = document.createElement('button');
      var downButton = document.createElement('button');
      var saveButton = document.createElement('button');
      var removeButton = document.createElement('button');

      row.className = 'admin-wallpaper-item';
      preview.className = 'admin-wallpaper-preview';
      preview.href = item.image || '#';
      preview.target = '_blank';
      preview.rel = 'noreferrer';
      image.alt = item.title || '壁纸预览';
      image.src = item.image || '';
      if (item.image) image.setAttribute('data-admin-original-src', item.image);
      image.loading = 'eager';
      image.decoding = 'async';
      image.referrerPolicy = 'no-referrer';
      title.type = 'text';
      title.value = item.title || '';
      title.placeholder = '标题';
      title.setAttribute('aria-label', '壁纸标题');
      description.value = item.description || '';
      description.placeholder = '描述';
      description.setAttribute('aria-label', '壁纸描述');
      url.type = 'url';
      url.value = item.image || '';
      url.placeholder = '图片链接';
      url.setAttribute('aria-label', '壁纸图片链接');
      actions.className = 'admin-wallpaper-actions';
      upButton.type = 'button';
      upButton.textContent = '上移';
      upButton.disabled = index === 0;
      downButton.type = 'button';
      downButton.textContent = '下移';
      downButton.disabled = index === sourceItems.length - 1;
      saveButton.type = 'button';
      saveButton.textContent = '保存';
      removeButton.type = 'button';
      removeButton.textContent = '删除';

      function applyItems(data, successMessage) {
        panel._wallpaperItems = data.items || [];
        renderWallpaperList(panel, panel._wallpaperItems);
        if (successMessage) showToast(successMessage, 'success');
      }

      upButton.addEventListener('click', function () {
        requestJson('/masonry/reorder', {
          method: 'POST',
          body: JSON.stringify({ from: index, to: index - 1 })
        }).then(function (data) {
          applyItems(data, '壁纸顺序已更新。');
        }).catch(function (error) {
          showToast(error.message || '排序失败。', 'error');
        });
      });

      downButton.addEventListener('click', function () {
        requestJson('/masonry/reorder', {
          method: 'POST',
          body: JSON.stringify({ from: index, to: index + 1 })
        }).then(function (data) {
          applyItems(data, '壁纸顺序已更新。');
        }).catch(function (error) {
          showToast(error.message || '排序失败。', 'error');
        });
      });

      saveButton.addEventListener('click', function () {
        saveButton.disabled = true;
        requestJson('/masonry/update', {
          method: 'POST',
          body: JSON.stringify({
            index: index,
            item: {
              image: url.value,
              title: title.value,
              description: description.value
            }
          })
        }).then(function (data) {
          applyItems(data, '壁纸信息已保存。');
        }).catch(function (error) {
          showToast(error.message || '保存失败。', 'error');
        }).then(function () {
          saveButton.disabled = false;
        });
      });

      removeButton.addEventListener('click', function () {
        if (!window.confirm('确定从壁纸页删除这张图片吗？图仓远端图片会保留。')) return;
        requestJson('/masonry/remove', {
          method: 'POST',
          body: JSON.stringify({ index: index, image: item.image })
        }).then(function (data) {
          applyItems(data, '壁纸条目已删除。');
        }).catch(function (error) {
          showToast(error.message || '删除失败。', 'error');
        });
      });

      preview.appendChild(image);
      fields.className = 'admin-wallpaper-fields';
      fields.appendChild(title);
      fields.appendChild(description);
      fields.appendChild(url);
      actions.appendChild(upButton);
      actions.appendChild(downButton);
      actions.appendChild(saveButton);
      actions.appendChild(removeButton);
      row.appendChild(preview);
      row.appendChild(fields);
      row.appendChild(actions);
      list.appendChild(row);
      setupAdminImages(row);
    });
  }

  function loadWallpaperList(panel) {
    setWallpaperStatus(panel, '正在读取壁纸图库...', 'info');
    requestJson('/masonry/list', { method: 'GET' }).then(function (data) {
      try {
        panel._wallpaperItems = data.items || [];
        renderWallpaperList(panel, panel._wallpaperItems);
        setWallpaperStatus(panel, '', 'info');
      } catch (error) {
        setWallpaperStatus(panel, error.message || '壁纸列表渲染失败。', 'error');
        showToast(error.message || '壁纸列表渲染失败。', 'error');
      }
    }).catch(function (error) {
      setWallpaperStatus(panel, error.message || '读取壁纸列表失败。', 'error');
      showToast(error.message || '读取壁纸列表失败。', 'error');
    });
  }

  function openWallpaperPanel() {
    var existing = document.querySelector('.admin-wallpaper-backdrop');
    if (existing) {
      existing._returnFocus = document.activeElement;
      existing.hidden = false;
      focusWallpaperPanel(existing.querySelector('.admin-wallpaper-panel'));
      return;
    }

    document.body.insertAdjacentHTML('beforeend', wallpaperPanelTemplate());
    var backdrop = document.querySelector('.admin-wallpaper-backdrop');
    var panel = backdrop.querySelector('.admin-wallpaper-panel');
    var fileInput = panel.querySelector('.admin-wallpaper-file');
    var urlInput = panel.querySelector('.admin-wallpaper-url');
    var searchInput = panel.querySelector('.admin-wallpaper-search');
    var uploadButton = panel.querySelector('.admin-wallpaper-upload');
    var urlButton = panel.querySelector('.admin-wallpaper-url-add');

    backdrop._returnFocus = document.activeElement;
    panel.querySelector('.admin-wallpaper-close').addEventListener('click', function () {
      closeWallpaperPanel(backdrop);
    });
    backdrop.addEventListener('click', function (event) {
      if (event.target === backdrop) closeWallpaperPanel(backdrop);
    });
    backdrop.addEventListener('keydown', function (event) {
      trapWallpaperFocus(event, backdrop, panel);
    });
    uploadButton.addEventListener('click', function () {
      fileInput.click();
    });

    searchInput.addEventListener('input', function () {
      panel._wallpaperQuery = searchInput.value;
      renderWallpaperList(panel, panel._wallpaperItems || []);
    });

    fileInput.addEventListener('change', function () {
      var files = Array.prototype.slice.call(fileInput.files || []);
      var uploadedItems = [];
      if (!files.length) return;

      uploadButton.disabled = true;
      uploadButton.textContent = '上传中...';
      setWallpaperStatus(panel, '准备上传 ' + files.length + ' 张图片...', 'info');
      files.reduce(function (chain, file, index) {
        return chain.then(function () {
          return uploadImage(file, 'wallpaper', {
            onStatus: function (message) {
              setWallpaperStatus(panel, message + '（' + (index + 1) + '/' + files.length + '）', 'info');
            }
          }).then(function (result) {
            uploadedItems.push({
              image: result.url,
              title: fileTitle(file),
              description: '通过后台上传到壁纸页。'
            });
          });
        });
      }, Promise.resolve()).then(function () {
        setWallpaperStatus(panel, '正在写入壁纸页...', 'info');
        return requestJson('/masonry/bulk-add', {
          method: 'POST',
          body: JSON.stringify({ items: uploadedItems })
        });
      }).then(function (data) {
        panel._wallpaperItems = data.items || [];
        renderWallpaperList(panel, panel._wallpaperItems);
        setWallpaperStatus(panel, '', 'info');
        showToast('壁纸已上传并加入图库。', 'success');
      }).catch(function (error) {
        setWallpaperStatus(panel, error.message || '壁纸上传失败。', 'error');
        showToast(error.message || '壁纸上传失败。', 'error');
      }).then(function () {
        uploadButton.disabled = false;
        uploadButton.textContent = '上传图片';
        fileInput.value = '';
      });
    });

    urlButton.addEventListener('click', function () {
      var rawUrl = urlInput.value.trim();
      if (!rawUrl) {
        showToast('请先填写图片 URL。', 'error');
        return;
      }

      urlButton.disabled = true;
      setWallpaperStatus(panel, '正在从 URL 导入图仓...', 'info');
      uploadImageUrl(rawUrl, 'wallpaper', {
        onStatus: function (message) {
          setWallpaperStatus(panel, message, 'info');
        }
      }).then(function (result) {
        return requestJson('/masonry/add', {
          method: 'POST',
          body: JSON.stringify({
            image: result.url,
            title: fileTitle({ name: rawUrl.split('/').pop() || 'URL 壁纸' }),
            description: '通过图片 URL 导入到壁纸页。'
          })
        });
      }).then(function (data) {
        urlInput.value = '';
        panel._wallpaperItems = data.items || [];
        renderWallpaperList(panel, panel._wallpaperItems);
        setWallpaperStatus(panel, '', 'info');
        showToast('URL 图片已加入图库。', 'success');
      }).catch(function (error) {
        setWallpaperStatus(panel, error.message || 'URL 导入失败。', 'error');
        showToast(error.message || 'URL 导入失败。', 'error');
      }).then(function () {
        urlButton.disabled = false;
      });
    });

    loadWallpaperList(panel);
    focusWallpaperPanel(panel);
  }

  function pageTemplateType(page) {
    var source = page && page.source || '';
    var raw = page && page.raw || '';
    if (source === 'links/index.md' || /template:\s*links/.test(raw)) return 'links';
    if (source === 'tags/index.md' || /template:\s*tags/.test(raw)) return 'tags';
    if (source === 'categories/index.md' || /template:\s*categories/.test(raw)) return 'categories';
    return '';
  }

  function loadCurrentPage() {
    var pageId = currentPageId();
    if (!pageId) return Promise.resolve(null);
    if (templatePageCache[pageId]) return Promise.resolve(templatePageCache[pageId]);

    return requestJson('/pages/' + encodeURIComponent(pageId), { method: 'GET' }).then(function (page) {
      templatePageCache[pageId] = page;
      return page;
    });
  }

  function managedPanel(page, type) {
    var editor = document.querySelector('.editor');
    if (!editor) return null;

    editor.classList.add('admin-template-managed');
    editor.setAttribute('data-template-page', type);

    var existing = editor.querySelector('.admin-template-panel');
    if (existing && existing.getAttribute('data-page-id') === (page._id || '')) return existing;
    if (existing) existing.remove();

    var panel = document.createElement('section');
    panel.className = 'admin-template-panel';
    panel.setAttribute('data-page-id', page._id || '');
    panel.setAttribute('data-template-page', type);

    var top = editor.querySelector('.editor_top');
    if (top) top.insertAdjacentElement('afterend', panel);
    else editor.insertBefore(panel, editor.firstChild);

    return panel;
  }

  function renderTermManager(panel, type) {
    var label = type === 'tags' ? '标签' : '分类';
    panel.innerHTML = '' +
      '<div class="admin-template-head">' +
        '<div><div class="admin-page-kicker">内容索引</div><h2>' + label + '管理</h2><p class="admin-template-subtitle">正在读取...</p></div>' +
        '<button type="button" class="admin-template-primary">新建文章</button>' +
      '</div>' +
      '<div class="admin-template-toolbar">' +
        '<input class="admin-template-search" type="search" placeholder="搜索' + label + '">' +
      '</div>' +
      '<div class="admin-term-grid"></div>';

    var search = panel.querySelector('.admin-template-search');
    var list = panel.querySelector('.admin-term-grid');
    var subtitle = panel.querySelector('.admin-template-subtitle');

    panel.querySelector('.admin-template-primary').addEventListener('click', function () {
      window.location.hash = '#/posts';
    });

    function render(items) {
      var query = search.value.trim().toLowerCase();
      var view = items.filter(function (item) {
        return !query || item.name.toLowerCase().indexOf(query) !== -1;
      });

      subtitle.textContent = '共 ' + items.length + ' 个' + label + '，当前显示 ' + view.length + ' 个';
      list.innerHTML = '';

      if (!view.length) {
        list.innerHTML = '<p class="admin-template-empty">没有匹配项。</p>';
        return;
      }

      view.forEach(function (item) {
        var card = document.createElement('article');
        card.className = 'admin-term-card';
        card.innerHTML = '<strong></strong><span></span>';
        card.querySelector('strong').textContent = item.name;
        card.querySelector('span').textContent = (item.count || 0) + ' 篇文章';
        list.appendChild(card);
      });
    }

    requestJson('/terms/summary', { method: 'GET' }).then(function (data) {
      var items = data[type] || [];
      render(items);
      search.addEventListener('input', function () {
        render(items);
      });
    }).catch(function (error) {
      subtitle.textContent = error.message || '读取失败。';
    });
  }

  function emptyLinkItem() {
    return { name: '', link: '', description: '', avatar: '', thumbnail: '' };
  }

  function renderLinksManager(panel) {
    panel.innerHTML = '' +
      '<div class="admin-template-head">' +
        '<div><div class="admin-page-kicker">站点链接</div><h2>友情链接管理</h2><p class="admin-template-subtitle">正在读取...</p></div>' +
        '<button type="button" class="admin-template-primary admin-link-add-group">新增分组</button>' +
      '</div>' +
      '<div class="admin-template-toolbar">' +
        '<input class="admin-template-search" type="search" placeholder="搜索站点、描述或链接">' +
      '</div>' +
      '<div class="admin-link-groups"></div>';

    var groups = [];
    var list = panel.querySelector('.admin-link-groups');
    var search = panel.querySelector('.admin-template-search');
    var subtitle = panel.querySelector('.admin-template-subtitle');

    function applyGroups(data, message) {
      groups = data.groups || [];
      render();
      if (message) showToast(message, 'success');
    }

    function uploadField(button, input) {
      var fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.hidden = true;
      button.insertAdjacentElement('afterend', fileInput);
      button.addEventListener('click', function () {
        fileInput.click();
      });
      fileInput.addEventListener('change', function () {
        var file = fileInput.files && fileInput.files[0];
        if (!file) return;

        button.disabled = true;
        button.textContent = '上传中';
        uploadImage(file, 'post', {
          onStatus: function (message) {
            showToast(message, 'info');
          }
        }).then(function (result) {
          setNativeValue(input, result.url);
          showToast('图片链接已填写。', 'success');
        }).catch(function (error) {
          showToast(error.message || '图片上传失败。', 'error');
        }).then(function () {
          button.disabled = false;
          button.textContent = '上传';
          fileInput.value = '';
        });
      });
    }

    function collectGroup(groupNode) {
      var itemNodes = Array.prototype.slice.call(groupNode.querySelectorAll('.admin-link-item'));
      return {
        links_category: groupNode.querySelector('[data-field="links_category"]').value.trim(),
        has_thumbnail: groupNode.querySelector('[data-field="has_thumbnail"]').checked,
        list: itemNodes.map(function (itemNode) {
          return {
            name: itemNode.querySelector('[data-field="name"]').value.trim(),
            link: itemNode.querySelector('[data-field="link"]').value.trim(),
            description: itemNode.querySelector('[data-field="description"]').value.trim(),
            avatar: itemNode.querySelector('[data-field="avatar"]').value.trim(),
            thumbnail: itemNode.querySelector('[data-field="thumbnail"]').value.trim()
          };
        })
      };
    }

    function saveGroup(index, groupNode, message) {
      return requestJson('/links/group/update', {
        method: 'POST',
        body: JSON.stringify({
          index: index,
          group: collectGroup(groupNode)
        })
      }).then(function (data) {
        applyGroups(data, message || '友情链接已保存。');
      }).catch(function (error) {
        showToast(error.message || '保存失败。', 'error');
      });
    }

    function renderItem(item, groupIndex, itemIndex) {
      var node = document.createElement('article');
      node.className = 'admin-link-item';
      node.innerHTML = '' +
        '<div class="admin-link-item-head"><strong>站点 ' + (itemIndex + 1) + '</strong><div><button type="button" data-action="up">上移</button><button type="button" data-action="down">下移</button><button type="button" data-action="remove">删除</button></div></div>' +
        '<label>名称<input data-field="name" type="text"></label>' +
        '<label>链接<input data-field="link" type="url"></label>' +
        '<label>描述<textarea data-field="description"></textarea></label>' +
        '<label>头像<div class="admin-link-url-row"><input data-field="avatar" type="url"><button type="button" data-action="upload-avatar">上传</button></div></label>' +
        '<label>缩略图<div class="admin-link-url-row"><input data-field="thumbnail" type="url"><button type="button" data-action="upload-thumbnail">上传</button></div></label>';

      node.querySelector('[data-field="name"]').value = item.name || '';
      node.querySelector('[data-field="link"]').value = item.link || '';
      node.querySelector('[data-field="description"]').value = item.description || '';
      node.querySelector('[data-field="avatar"]').value = item.avatar || '';
      node.querySelector('[data-field="thumbnail"]').value = item.thumbnail || '';

      uploadField(node.querySelector('[data-action="upload-avatar"]'), node.querySelector('[data-field="avatar"]'));
      uploadField(node.querySelector('[data-action="upload-thumbnail"]'), node.querySelector('[data-field="thumbnail"]'));

      node.querySelector('[data-action="remove"]').addEventListener('click', function () {
        var groupNode = node.closest('.admin-link-group');
        node.remove();
        saveGroup(groupIndex, groupNode, '站点已删除。');
      });

      node.querySelector('[data-action="up"]').addEventListener('click', function () {
        var group = groups[groupIndex];
        if (itemIndex <= 0) return;
        var moved = group.list.splice(itemIndex, 1)[0];
        group.list.splice(itemIndex - 1, 0, moved);
        requestJson('/links/group/update', {
          method: 'POST',
          body: JSON.stringify({ index: groupIndex, group: group })
        }).then(function (data) {
          applyGroups(data, '站点顺序已更新。');
        }).catch(function (error) {
          showToast(error.message || '排序失败。', 'error');
        });
      });

      node.querySelector('[data-action="down"]').addEventListener('click', function () {
        var group = groups[groupIndex];
        if (itemIndex >= group.list.length - 1) return;
        var moved = group.list.splice(itemIndex, 1)[0];
        group.list.splice(itemIndex + 1, 0, moved);
        requestJson('/links/group/update', {
          method: 'POST',
          body: JSON.stringify({ index: groupIndex, group: group })
        }).then(function (data) {
          applyGroups(data, '站点顺序已更新。');
        }).catch(function (error) {
          showToast(error.message || '排序失败。', 'error');
        });
      });

      return node;
    }

    function renderGroup(group, groupIndex) {
      var node = document.createElement('section');
      node.className = 'admin-link-group';
      node.innerHTML = '' +
        '<div class="admin-link-group-head">' +
          '<label>分组名称<input data-field="links_category" type="text"></label>' +
          '<label class="admin-link-check"><input data-field="has_thumbnail" type="checkbox">显示缩略图</label>' +
          '<div class="admin-link-actions">' +
            '<button type="button" data-action="group-up">上移</button>' +
            '<button type="button" data-action="group-down">下移</button>' +
            '<button type="button" data-action="group-save">保存分组</button>' +
            '<button type="button" data-action="item-add">添加站点</button>' +
            '<button type="button" data-action="group-remove">删除分组</button>' +
          '</div>' +
        '</div>' +
        '<div class="admin-link-items"></div>';

      node.querySelector('[data-field="links_category"]').value = group.links_category || '';
      node.querySelector('[data-field="has_thumbnail"]').checked = Boolean(group.has_thumbnail);

      var itemList = node.querySelector('.admin-link-items');
      (group.list || []).forEach(function (item, itemIndex) {
        itemList.appendChild(renderItem(item, groupIndex, itemIndex));
      });

      node.querySelector('[data-action="group-save"]').addEventListener('click', function () {
        saveGroup(groupIndex, node);
      });

      node.querySelector('[data-action="item-add"]').addEventListener('click', function () {
        itemList.appendChild(renderItem(emptyLinkItem(), groupIndex, itemList.children.length));
      });

      node.querySelector('[data-action="group-remove"]').addEventListener('click', function () {
        if (!window.confirm('确定删除这个友情链接分组吗？')) return;
        requestJson('/links/group/remove', {
          method: 'POST',
          body: JSON.stringify({ index: groupIndex })
        }).then(function (data) {
          applyGroups(data, '分组已删除。');
        }).catch(function (error) {
          showToast(error.message || '删除失败。', 'error');
        });
      });

      node.querySelector('[data-action="group-up"]').addEventListener('click', function () {
        if (groupIndex <= 0) return;
        requestJson('/links/group/reorder', {
          method: 'POST',
          body: JSON.stringify({ from: groupIndex, to: groupIndex - 1 })
        }).then(function (data) {
          applyGroups(data, '分组顺序已更新。');
        }).catch(function (error) {
          showToast(error.message || '排序失败。', 'error');
        });
      });

      node.querySelector('[data-action="group-down"]').addEventListener('click', function () {
        if (groupIndex >= groups.length - 1) return;
        requestJson('/links/group/reorder', {
          method: 'POST',
          body: JSON.stringify({ from: groupIndex, to: groupIndex + 1 })
        }).then(function (data) {
          applyGroups(data, '分组顺序已更新。');
        }).catch(function (error) {
          showToast(error.message || '排序失败。', 'error');
        });
      });

      return node;
    }

    function render() {
      var query = search.value.trim().toLowerCase();
      var siteCount = groups.reduce(function (sum, group) {
        return sum + (group.list || []).length;
      }, 0);

      subtitle.textContent = '共 ' + groups.length + ' 个分组，' + siteCount + ' 个站点';
      list.innerHTML = '';

      groups.forEach(function (group, index) {
        var haystack = [group.links_category].concat((group.list || []).map(function (item) {
          return [item.name, item.link, item.description].join(' ');
        })).join(' ').toLowerCase();
        if (query && haystack.indexOf(query) === -1) return;
        list.appendChild(renderGroup(group, index));
      });

      if (!list.children.length) {
        list.innerHTML = '<p class="admin-template-empty">没有匹配的友情链接。</p>';
      }
    }

    panel.querySelector('.admin-link-add-group').addEventListener('click', function () {
      requestJson('/links/group/add', {
        method: 'POST',
        body: JSON.stringify({
          links_category: '新分组',
          has_thumbnail: false,
          list: []
        })
      }).then(function (data) {
        applyGroups(data, '分组已添加。');
      }).catch(function (error) {
        showToast(error.message || '添加失败。', 'error');
      });
    });

    search.addEventListener('input', render);

    requestJson('/links/list', { method: 'GET' }).then(function (data) {
      applyGroups(data);
    }).catch(function (error) {
      subtitle.textContent = error.message || '读取失败。';
    });
  }

  function enhanceTemplatePageManager() {
    if (!/pages\/([^/?#]+)/.test(window.location.hash)) return;

    loadCurrentPage().then(function (page) {
      var type = pageTemplateType(page);
      if (!type) return;

      var panel = managedPanel(page, type);
      if (!panel || panel.getAttribute('data-rendered') === type) return;

      panel.setAttribute('data-rendered', type);
      if (type === 'links') renderLinksManager(panel);
      else renderTermManager(panel, type);
    }).catch(function (error) {
      showToast(error.message || '页面管理面板加载失败。', 'error');
    });
  }

  function enhanceAdmin(root) {
    setupAdminImages(root);
    enablePublishedRemove(root);
    enhanceCoverUpload(root);
    enhanceTermOptions(root);
    enhanceEditorImageTools(root);
    enhanceTemplatePageManager();
    ensureWallpaperEntry();
  }

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
    if (about && !about.querySelector('.admin-wallpaper-about')) {
      about.innerHTML = '<div class="admin-wallpaper-about"><div class="admin-page-kicker">博客壁纸页</div><h1>壁纸图库</h1><p>在这里管理博客壁纸页展示的图片、标题、描述和排序。</p><button type="button" class="admin-wallpaper-about-button">打开壁纸图库</button></div>';
      about.querySelector('.admin-wallpaper-about-button').addEventListener('click', openWallpaperPanel);
    }
  }

  function localize(root) {
    walkText(root);
    localizeAttributes(root);
    addPageHints(root);
    enhanceAdmin(root);
  }

  function start() {
    document.addEventListener('paste', handlePasteImage, true);
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
