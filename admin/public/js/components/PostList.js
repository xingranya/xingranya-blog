const PostList = {
    template: `
        <div class="space-y-6">
            <div class="flex justify-between items-center">
                <h2 class="text-2xl font-bold text-gray-800 dark:text-white">文章管理</h2>
                <router-link to="/posts/new" class="btn-primary px-4 py-2 rounded-lg text-white shadow-lg shadow-pink-200/50 dark:shadow-none flex items-center">
                    <i class="fas fa-plus mr-2"></i> 新建文章
                </router-link>
            </div>

            <!-- Search -->
            <div class="glass-card p-4 flex items-center">
                <i class="fas fa-search text-gray-400 mr-3"></i>
                <input
                    v-model="search"
                    @input="debouncedSearch"
                    type="text"
                    placeholder="搜索文章..."
                    class="bg-transparent border-none focus:ring-0 w-full text-gray-700 dark:text-gray-200 outline-none"
                >
            </div>

            <!-- List -->
            <div class="glass-card overflow-hidden">
                <div v-if="loading" class="p-8 text-center text-gray-500">
                    <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
                    <p>加载中...</p>
                </div>

                <div v-else-if="posts.length === 0" class="p-8 text-center text-gray-500">
                    <i class="fas fa-inbox text-4xl mb-4"></i>
                    <p>暂无文章</p>
                </div>

                <div v-else class="divide-y divide-gray-200 dark:divide-gray-700">
                    <div
                        v-for="post in posts"
                        :key="post.filename"
                        @click="editPost(post.filename)"
                        class="p-4 hover:bg-white/40 dark:hover:bg-gray-800/40 transition-colors cursor-pointer flex items-center justify-between"
                    >
                        <div class="flex-1 min-w-0 mr-4">
                            <div class="text-base font-medium text-gray-900 dark:text-white truncate">{{ post.title }}</div>
                            <div class="text-xs text-gray-500 mt-1 flex items-center space-x-3">
                                <span><i class="far fa-calendar mr-1"></i>{{ formatDate(post.date) }}</span>
                                <span v-if="post.categories && post.categories.length" class="truncate">
                                    <i class="far fa-folder mr-1"></i>{{ Array.isArray(post.categories) ? post.categories.join(', ') : post.categories }}
                                </span>
                            </div>
                        </div>
                        <div class="flex items-center space-x-2">
                            <span v-if="post.published !== false" class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                已发布
                            </span>
                            <span v-else class="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                                草稿
                            </span>
                            <button @click.stop="confirmDelete(post)" class="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Pagination -->
                <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between" v-if="totalPages > 1">
                    <button
                        @click="changePage(page - 1)"
                        :disabled="page === 1"
                        class="px-3 py-1 rounded bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 disabled:opacity-50"
                    >
                        上一页
                    </button>
                    <span class="text-sm text-gray-500 dark:text-gray-400">第 {{ page }} / {{ totalPages }} 页</span>
                    <button
                        @click="changePage(page + 1)"
                        :disabled="page === totalPages"
                        class="px-3 py-1 rounded bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 disabled:opacity-50"
                    >
                        下一页
                    </button>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            posts: [],
            loading: true,
            search: '',
            page: 1,
            totalPages: 1,
            limit: 10,
            timer: null
        }
    },
    methods: {
        formatDate(date) {
            if (!date) return '';
            const d = new Date(date);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        },
        editPost(filename) {
            // 使用 encodeURIComponent 处理中文文件名
            this.$router.push('/posts/edit/' + encodeURIComponent(filename));
        },
        async fetchPosts() {
            this.loading = true;
            try {
                const data = await window.api.getPosts(this.page, this.search);
                this.posts = data.posts || [];
                this.totalPages = data.totalPages || 1;
                this.page = data.page || 1;
            } catch (err) {
                console.error(err);
                alert('加载文章失败');
            } finally {
                this.loading = false;
            }
        },
        debouncedSearch() {
            clearTimeout(this.timer);
            this.timer = setTimeout(() => {
                this.page = 1;
                this.fetchPosts();
            }, 300);
        },
        changePage(newPage) {
            if (newPage >= 1 && newPage <= this.totalPages) {
                this.page = newPage;
                this.fetchPosts();
            }
        },
        async confirmDelete(post) {
            if (confirm(`确定要删除「${post.title}」吗？此操作不可恢复。`)) {
                try {
                    await window.api.deletePost(post.filename);
                    this.fetchPosts();
                } catch (err) {
                    alert('删除失败: ' + err.message);
                }
            }
        }
    },
    mounted() {
        this.fetchPosts();
    }
};

window.PostList = PostList;
