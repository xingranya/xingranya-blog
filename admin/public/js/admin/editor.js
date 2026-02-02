(function() {
    const { API, Utils, $, $$ } = AdminCore;

    // State
    let easyMDE;
    let isEditing = false;
    let originalFilename = '';
    let currentData = {
        title: '',
        filename: '',
        date: new Date(),
        categories: [],
        tags: [],
        published: true,
        cover: '',
        content: ''
    };

    // Initialize Editor
    function initEditor() {
        easyMDE = new EasyMDE({
            element: $('#markdownEditor'),
            spellChecker: false,
            autosave: {
                enabled: true,
                uniqueId: 'blog_editor_autosave',
                delay: 1000,
            },
            toolbar: [
                'bold', 'italic', 'heading', '|',
                'quote', 'code', 'unordered-list', 'ordered-list', '|',
                'link', 'image', 'table', '|',
                'preview', 'side-by-side', 'fullscreen', '|',
                'guide'
            ],
            status: false,
            maxHeight: 'calc(100vh - 200px)',
            uploadImage: true,
            imageUploadFunction: uploadImageHandler
        });

        // Sync content changes
        easyMDE.codemirror.on('change', () => {
            currentData.content = easyMDE.value();
            updateSaveStatus('未保存');
        });
    }

    // Image Upload Handler (Tucang)
    async function uploadImageHandler(file, onSuccess, onError) {
        try {
            const formData = new FormData();
            formData.append('file', file);

            // Get tucang config if needed, but backend handles proxy usually?
            // Actually our backend proxy is /api/media/upload

            AdminCore.UI.toast('正在上传图片...', 'info');

            // We use our backend proxy
            const res = await fetch('/api/media/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${AdminCore.Store.auth.token}`
                },
                body: formData
            });

            const json = await res.json();

            if (json.success && json.data && json.data.url) {
                onSuccess(json.data.url);
                AdminCore.UI.toast('上传成功');
            } else {
                onError(json.message || '上传失败');
            }
        } catch (e) {
            console.error(e);
            onError(e.message || '上传出错');
        }
    }

    // Load Post Data
    async function loadPost() {
        const params = new URLSearchParams(location.search);
        const filename = params.get('filename');

        if (filename) {
            isEditing = true;
            originalFilename = filename;
            try {
                const res = await API.get(`/posts/${encodeURIComponent(filename)}`);

                currentData = {
                    title: res.frontMatter.title || '',
                    filename: res.filename,
                    date: res.frontMatter.date ? new Date(res.frontMatter.date) : new Date(),
                    categories: res.frontMatter.categories || [],
                    tags: res.frontMatter.tags || [],
                    published: res.frontMatter.published !== false,
                    cover: res.frontMatter.cover || res.frontMatter.thumbnail || '',
                    content: res.content
                };

                // Populate UI
                $('#postTitle').value = currentData.title;
                $('#filename').value = currentData.filename;
                $('#filename').disabled = true; // Disable renaming for now

                // Date format for input datetime-local: YYYY-MM-DDThh:mm
                const d = new Date(currentData.date);
                d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
                $('#postDate').value = d.toISOString().slice(0, 16);

                $('#published').checked = currentData.published;
                $('#coverImage').value = currentData.cover;
                updateCoverPreview();

                renderTagsAndCats();

                // Set editor content
                easyMDE.value(currentData.content);

                // Clear autosave since we loaded fresh content
                easyMDE.clearAutosave();

            } catch (e) {
                AdminCore.UI.toast('加载文章失败: ' + e.message, 'error');
            }
        } else {
            // New Post
            const d = new Date();
            d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
            $('#postDate').value = d.toISOString().slice(0, 16);
        }
    }

    // Save Post
    async function savePost() {
        try {
            updateSaveStatus('保存中...');

            // Gather data
            currentData.title = $('#postTitle').value;
            currentData.filename = $('#filename').value;
            currentData.date = new Date($('#postDate').value);
            currentData.published = $('#published').checked;
            currentData.cover = $('#coverImage').value;
            currentData.content = easyMDE.value();

            if (!currentData.title) throw new Error('请输入文章标题');

            const payload = {
                title: currentData.title,
                filename: currentData.filename,
                content: currentData.content,
                frontMatter: {
                    title: currentData.title,
                    date: currentData.date,
                    categories: currentData.categories,
                    tags: currentData.tags,
                    published: currentData.published,
                    cover: currentData.cover
                }
            };

            if (isEditing) {
                await API.put(`/posts/${encodeURIComponent(originalFilename)}`, payload);
            } else {
                const res = await API.post('/posts', payload);
                isEditing = true;
                originalFilename = res.filename;
                $('#filename').value = res.filename;
                $('#filename').disabled = true;

                // Update URL without reload
                const url = new URL(window.location);
                url.searchParams.set('filename', res.filename);
                window.history.pushState({}, '', url);
            }

            easyMDE.clearAutosave();
            updateSaveStatus('已保存');
            AdminCore.UI.toast('保存成功');

        } catch (e) {
            updateSaveStatus('保存失败');
            AdminCore.UI.toast(e.message, 'error');
        }
    }

    function updateSaveStatus(msg) {
        $('#saveStatus').textContent = msg;
    }

    // Tag & Category Management
    function renderTagsAndCats() {
        // Categories
        const catsContainer = $('#categoriesList');
        catsContainer.innerHTML = currentData.categories.map(c => `
            <span class="tag" style="background: rgba(236, 72, 153, 0.1); color: var(--a-primary);">
                ${Utils.escapeHtml(c)}
                <span class="remove" onclick="removeCategory('${Utils.escapeHtml(c)}')">&times;</span>
            </span>
        `).join('');

        // Tags
        const tagsContainer = $('#tagsList');
        tagsContainer.innerHTML = currentData.tags.map(t => `
            <span class="tag">
                ${Utils.escapeHtml(t)}
                <span class="remove" onclick="removeTag('${Utils.escapeHtml(t)}')">&times;</span>
            </span>
        `).join('');
    }

    window.removeCategory = (c) => {
        currentData.categories = currentData.categories.filter(item => item !== c);
        renderTagsAndCats();
    };

    window.removeTag = (t) => {
        currentData.tags = currentData.tags.filter(item => item !== t);
        renderTagsAndCats();
    };

    $('#addCategoryBtn').addEventListener('click', () => {
        const val = $('#newCategory').value.trim();
        if (val && !currentData.categories.includes(val)) {
            currentData.categories.push(val);
            $('#newCategory').value = '';
            renderTagsAndCats();
        }
    });

    $('#addTagBtn').addEventListener('click', () => {
        const val = $('#newTag').value.trim();
        if (val && !currentData.tags.includes(val)) {
            currentData.tags.push(val);
            $('#newTag').value = '';
            renderTagsAndCats();
        }
    });

    // Cover Preview
    function updateCoverPreview() {
        const url = $('#coverImage').value;
        const preview = $('#coverPreview');
        if (url) {
            preview.style.display = 'block';
            preview.querySelector('img').src = url;
        } else {
            preview.style.display = 'none';
        }
    }
    $('#coverImage').addEventListener('input', updateCoverPreview);

    // Save Button
    $('#saveBtn').addEventListener('click', savePost);

    // Ctrl+S to save
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            savePost();
        }
    });

    // Init
    initEditor();
    loadPost();

})();
