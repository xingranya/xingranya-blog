(function() {
    const { API, Utils, $, $$ } = AdminCore;

    let currentPage = 1;
    let currentSearch = '';
    const limit = 10;

    // Elements
    const tbody = $('#postsList');
    const searchInput = $('#searchInput');
    const prevBtn = $('#prevBtn');
    const nextBtn = $('#nextBtn');
    const pageInfo = $('#pageInfo');
    const refreshBtn = $('#refreshBtn');

    // Load Posts
    async function loadPosts(page = 1) {
        try {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--a-text-3); padding: 40px;"><div class="spinner" style="margin: 0 auto;"></div></td></tr>';

            const query = `?page=${page}&limit=${limit}&search=${encodeURIComponent(currentSearch)}`;
            const res = await API.get('/posts' + query);

            currentPage = res.page;
            renderPosts(res.posts);
            updatePagination(res);

        } catch (error) {
            console.error(error);
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #ef4444;">加载失败: ${error.message}</td></tr>`;
        }
    }

    // Render List
    function renderPosts(posts) {
        if (posts.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--a-text-3); padding: 40px;">暂无文章</td></tr>';
            return;
        }

        tbody.innerHTML = posts.map(post => `
            <tr>
                <td>
                    <div style="font-weight: 500; margin-bottom: 4px;">${Utils.escapeHtml(post.title)}</div>
                    <div style="font-size: 12px; color: var(--a-text-3); font-family: monospace;">${post.filename}</div>
                </td>
                <td>
                    ${renderCategories(post.categories)}
                </td>
                <td>
                    ${renderTags(post.tags)}
                </td>
                <td style="font-size: 13px; color: var(--a-text-2);">
                    ${Utils.formatDate(post.date)}
                </td>
                <td>
                    <span class="badge ${post.published ? 'badge-success' : 'badge-warning'}">
                        ${post.published ? '已发布' : '草稿'}
                    </span>
                </td>
                <td style="text-align: right;">
                    <a href="/admin/editor.html?filename=${encodeURIComponent(post.filename)}" class="btn btn-ghost btn-icon" style="display: inline-flex;" title="编辑">
                        <i class="fa-solid fa-pen"></i>
                    </a>
                    <button class="btn btn-ghost btn-icon delete-btn" data-filename="${Utils.escapeHtml(post.filename)}" style="display: inline-flex; color: var(--a-primary);" title="删除">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        // Bind delete events
        $$('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const filename = btn.dataset.filename;
                if (await AdminCore.UI.confirm(`确定要删除文章 "${filename}" 吗？此操作不可恢复。`)) {
                    await deletePost(filename);
                }
            });
        });
    }

    function renderCategories(cats) {
        if (!cats) return '-';
        const list = Array.isArray(cats) ? cats : [cats];
        if (list.length === 0) return '-';
        return list.map(c => `<span style="font-size: 12px; color: var(--a-text-2); background: var(--a-bg); padding: 2px 6px; border-radius: 4px; margin-right: 4px;">${Utils.escapeHtml(c)}</span>`).join('');
    }

    function renderTags(tags) {
        if (!tags) return '-';
        const list = Array.isArray(tags) ? tags : [tags];
        if (list.length === 0) return '-';
        // Only show first 3 tags
        const show = list.slice(0, 3);
        let html = show.map(t => `<span style="font-size: 12px; color: var(--a-text-3); margin-right: 4px;">#${Utils.escapeHtml(t)}</span>`).join('');
        if (list.length > 3) html += `<span style="font-size: 12px; color: var(--a-text-3);">+${list.length - 3}</span>`;
        return html;
    }

    // Pagination
    function updatePagination(data) {
        pageInfo.textContent = `第 ${data.page} 页 / 共 ${data.totalPages} 页 (共 ${data.total} 篇)`;
        prevBtn.disabled = data.page <= 1;
        nextBtn.disabled = data.page >= data.totalPages;
    }

    // Actions
    async function deletePost(filename) {
        try {
            await API.delete(`/posts/${encodeURIComponent(filename)}`);
            AdminCore.UI.toast('删除成功');
            loadPosts(currentPage);
        } catch (e) {
            AdminCore.UI.toast(e.message, 'error');
        }
    }

    // Event Listeners
    searchInput.addEventListener('input', Utils.debounce((e) => {
        currentSearch = e.target.value.trim();
        loadPosts(1);
    }, 500));

    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) loadPosts(currentPage - 1);
    });

    nextBtn.addEventListener('click', () => {
        loadPosts(currentPage + 1);
    });

    refreshBtn.addEventListener('click', () => loadPosts(currentPage));

    // Init
    loadPosts();
})();
