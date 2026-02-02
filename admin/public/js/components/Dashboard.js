const Dashboard = {
    template: `
        <div class="space-y-6">
            <h2 class="text-2xl font-bold text-gray-800 dark:text-white">控制台</h2>

            <!-- Stats Grid -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="glass-card p-6 flex items-center space-x-4">
                    <div class="p-3 bg-pink-100 dark:bg-pink-900/30 rounded-full text-pink-500">
                        <i class="fas fa-file-alt text-xl"></i>
                    </div>
                    <div>
                        <div class="text-gray-500 dark:text-gray-400 text-sm">文章总数</div>
                        <div class="text-2xl font-bold text-gray-800 dark:text-white">{{ stats.postsCount }}</div>
                    </div>
                </div>

                <div class="glass-card p-6 flex items-center space-x-4">
                    <div class="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-500">
                        <i class="fas fa-folder text-xl"></i>
                    </div>
                    <div>
                        <div class="text-gray-500 dark:text-gray-400 text-sm">分类数</div>
                        <div class="text-2xl font-bold text-gray-800 dark:text-white">{{ stats.categoriesCount }}</div>
                    </div>
                </div>

                <div class="glass-card p-6 flex items-center space-x-4">
                    <div class="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-500">
                        <i class="fas fa-tags text-xl"></i>
                    </div>
                    <div>
                        <div class="text-gray-500 dark:text-gray-400 text-sm">标签数</div>
                        <div class="text-2xl font-bold text-gray-800 dark:text-white">{{ stats.tagsCount }}</div>
                    </div>
                </div>
            </div>

            <!-- System Info & Recent Posts -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Recent Posts -->
                <div class="glass-card p-6">
                    <h3 class="text-lg font-semibold mb-4 text-gray-800 dark:text-white">最近文章</h3>
                    <div v-if="recentPosts.length === 0" class="text-gray-500 text-center py-4">暂无文章</div>
                    <ul class="space-y-3">
                        <li v-for="post in recentPosts" :key="post.filename" class="flex justify-between items-center p-3 hover:bg-white/40 dark:hover:bg-gray-800/40 rounded-lg transition-colors cursor-pointer" @click="editPost(post.filename)">
                            <div>
                                <div class="font-medium text-gray-800 dark:text-gray-200">{{ post.title }}</div>
                                <div class="text-xs text-gray-500">{{ formatDate(post.date) }}</div>
                            </div>
                            <i class="fas fa-chevron-right text-gray-400"></i>
                        </li>
                    </ul>
                </div>

                <!-- System Status -->
                <div class="glass-card p-6">
                    <h3 class="text-lg font-semibold mb-4 text-gray-800 dark:text-white">系统状态</h3>
                    <div class="space-y-4">
                        <div class="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                            <span class="text-gray-500 dark:text-gray-400">运行平台</span>
                            <span class="font-mono text-gray-700 dark:text-gray-300">{{ system.platform }}</span>
                        </div>
                        <div class="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                            <span class="text-gray-500 dark:text-gray-400">运行时间</span>
                            <span class="font-mono text-gray-700 dark:text-gray-300">{{ Math.floor(system.uptime / 3600) }}小时 {{ Math.floor((system.uptime % 3600) / 60) }}分钟</span>
                        </div>
                         <div class="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                            <span class="text-gray-500 dark:text-gray-400">可用内存</span>
                            <span class="font-mono text-gray-700 dark:text-gray-300">{{ Math.round(system.memory?.free / 1024 / 1024) }} MB</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            stats: { postsCount: 0, categoriesCount: 0, tagsCount: 0 },
            recentPosts: [],
            system: {},
            loading: true
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
        }
    },
    async mounted() {
        try {
            const data = await window.api.getDashboard();
            this.stats = data.stats;
            this.recentPosts = data.recentPosts;
            this.system = data.system;
        } catch (err) {
            console.error(err);
        } finally {
            this.loading = false;
        }
    }
};

window.Dashboard = Dashboard;
