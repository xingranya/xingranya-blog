const Drafts = {
    template: `
        <div class="space-y-6">
            <!-- Search -->
            <div class="search-box">
                <i class="fas fa-search"></i>
                <input v-model="search" @input="debouncedSearch" type="text" placeholder="搜索草稿...">
            </div>

            <!-- List -->
            <div class="glass-card overflow-hidden">
                <div v-if="loading" class="p-8 text-center" style="color: var(--text-muted)">
                    <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
                    <p>加载中...</p>
                </div>

                <div v-else-if="posts.length === 0" class="empty-state">
                    <i class="fas fa-file-alt"></i>
                    <h3>暂无草稿</h3>
                    <p>所有草稿都会显示在这里</p>
                </div>

                <div v-else class="divide-y" style="border-color: var(--glass-border)">
                    <div
                        v-for="post in posts"
                        :key="post.filename"
                        @click="editPost(post.filename)"
                        class="p-5 hover:bg-pink-50/50 dark:hover:bg-pink-900/10 transition-colors cursor-pointer flex items-center justify-between"
                    >
                        <div class="flex-1 min-w-0 mr-4">
                            <div class="text-base font-medium truncate" style="color: var(--text-primary)">{{ post.title }}</div>
                            <div class="text-sm mt-1 flex items-center space-x-4" style="color: var(--text-muted)">
                                <span><i class="far fa-calendar mr-1"></i>{{ formatDate(post.date) }}</span>
                                <span v-if="post.categories && post.categories.length">
                                    <i class="far fa-folder mr-1"></i>{{ Array.isArray(post.categories) ? post.categories[0] : post.categories }}
                                </span>
                            </div>
                        </div>
                        <div class="flex items-center space-x-2">
                            <span class="badge badge-warning">草稿</span>
                            <button @click.stop="confirmDelete(post)" class="btn-icon text-red-500">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            posts: [],
            loading: true,
            search: '',
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
            this.$router.push('/posts/edit/' + encodeURIComponent(filename));
        },
        async fetchPosts() {
            this.loading = true;
            try {
                const data = await window.api.getPosts(1, this.search);
                // Filter only drafts
                this.posts = (data.posts || []).filter(p => p.published === false);
            } catch (err) {
                console.error(err);
            } finally {
                this.loading = false;
            }
        },
        debouncedSearch() {
            clearTimeout(this.timer);
            this.timer = setTimeout(() => this.fetchPosts(), 300);
        },
        async confirmDelete(post) {
            if (confirm(`确定要删除「${post.title}」吗？`)) {
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

window.Drafts = Drafts;
