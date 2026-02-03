(function() {
    const { API, Utils, $ } = AdminCore;

    async function loadStats() {
        try {
            // Load stats
            const stats = await API.get('/dashboard/stats');
            $('#statPosts').textContent = stats.postsCount;
            $('#statCategories').textContent = stats.categoriesCount;
            $('#statTags').textContent = stats.tagsCount;

            // Load recent posts
            const postsData = await API.get('/posts?limit=5');
            const tbody = $('#recentPostsList');
            tbody.innerHTML = postsData.posts.map(post => `
                <tr onclick="location.href='/admin/editor.html?filename=${encodeURIComponent(post.filename)}'" style="cursor: pointer;">
                    <td>
                        <div style="font-weight: 500;">${Utils.escapeHtml(post.title)}</div>
                        <div style="font-size: 12px; color: var(--a-text-3);">${post.filename}</div>
                    </td>
                    <td style="font-size: 13px; color: var(--a-text-2);">${Utils.formatDate(post.date)}</td>
                    <td>
                        <span class="badge ${post.published ? 'badge-success' : 'badge-warning'}">
                            ${post.published ? '已发布' : '草稿'}
                        </span>
                    </td>
                </tr>
            `).join('');

        } catch (error) {
            console.error(error);
        }
    }

    // Quick Deploy Action
    window.deployHexo = async () => {
        if (!confirm('确定要开始部署吗？这可能需要几十秒时间。')) return;

        try {
            AdminCore.UI.loading.show();
            AdminCore.UI.toast('正在后台部署...', 'info');

            const res = await API.post('/deploy');

            AdminCore.UI.toast('部署指令已发送，请查看部署日志', 'success');
            setTimeout(() => {
                location.href = '/admin/deploy.html';
            }, 1000);
        } catch (e) {
            AdminCore.UI.toast(e.message, 'error');
        } finally {
            AdminCore.UI.loading.hide();
        }
    };

    // System info (mock)
    $('#nodeVersion').textContent = 'v18.x';
    $('#platformInfo').textContent = 'Hexo Blog';
    $('#uptimeInfo').textContent = 'Running';

    loadStats();
})();
