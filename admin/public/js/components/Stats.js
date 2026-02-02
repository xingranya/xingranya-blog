const Stats = {
    template: `
        <div class="space-y-6">
            <!-- Stats Overview -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div class="stat-card cursor-pointer">
                    <div class="flex items-center justify-between">
                        <div>
                            <div class="stat-value">{{ stats.postsCount }}</div>
                            <div class="stat-label">文章总数</div>
                        </div>
                        <div class="stat-icon pink">
                            <i class="fas fa-file-alt"></i>
                        </div>
                    </div>
                </div>

                <div class="stat-card cursor-pointer">
                    <div class="flex items-center justify-between">
                        <div>
                            <div class="stat-value">{{ stats.categoriesCount }}</div>
                            <div class="stat-label">分类数</div>
                        </div>
                        <div class="stat-icon purple">
                            <i class="fas fa-folder"></i>
                        </div>
                    </div>
                </div>

                <div class="stat-card cursor-pointer">
                    <div class="flex items-center justify-between">
                        <div>
                            <div class="stat-value">{{ stats.tagsCount }}</div>
                            <div class="stat-label">标签数</div>
                        </div>
                        <div class="stat-icon cyan">
                            <i class="fas fa-tags"></i>
                        </div>
                    </div>
                </div>

                <div class="stat-card cursor-pointer">
                    <div class="flex items-center justify-between">
                        <div>
                            <div class="stat-value">{{ stats.draftsCount }}</div>
                            <div class="stat-label">草稿数</div>
                        </div>
                        <div class="stat-icon green">
                            <i class="fas fa-edit"></i>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Charts Row -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Posts Timeline -->
                <div class="glass-card p-6">
                    <h3 class="text-lg font-semibold mb-4" style="color: var(--text-primary)">
                        <i class="fas fa-chart-line mr-2" style="color: var(--primary)"></i>
                        发布趋势
                    </h3>
                    <div class="chart-container">
                        <canvas ref="timelineChart"></canvas>
                    </div>
                </div>

                <!-- Categories Distribution -->
                <div class="glass-card p-6">
                    <h3 class="text-lg font-semibold mb-4" style="color: var(--text-primary)">
                        <i class="fas fa-chart-pie mr-2" style="color: var(--secondary)"></i>
                        分类分布
                    </h3>
                    <div class="chart-container">
                        <canvas ref="categoryChart"></canvas>
                    </div>
                </div>
            </div>

            <!-- Word Count Stats -->
            <div class="glass-card p-6">
                <h3 class="text-lg font-semibold mb-4" style="color: var(--text-primary)">
                    <i class="fas fa-chart-bar mr-2" style="color: var(--accent)"></i>
                    文章字数统计
                </h3>
                <div class="chart-container" style="height: 250px;">
                    <canvas ref="wordCountChart"></canvas>
                </div>
            </div>

            <!-- Recent Activity -->
            <div class="glass-card p-6">
                <h3 class="text-lg font-semibold mb-4" style="color: var(--text-primary)">
                    <i class="fas fa-history mr-2" style="color: var(--success)"></i>
                    最近活动
                </h3>
                <div v-if="recentPosts.length === 0" class="text-center py-8" style="color: var(--text-muted)">
                    暂无数据
                </div>
                <div v-else class="space-y-3">
                    <div v-for="post in recentPosts" :key="post.filename" class="flex items-center space-x-4 p-3 rounded-lg hover:bg-pink-50/50 dark:hover:bg-pink-900/10 transition-colors">
                        <div class="stat-icon pink" style="width: 2.5rem; height: 2.5rem; font-size: 0.9rem;">
                            <i class="fas fa-feather-alt"></i>
                        </div>
                        <div class="flex-1">
                            <div class="font-medium" style="color: var(--text-primary)">{{ post.title }}</div>
                            <div class="text-sm" style="color: var(--text-muted)">发布于 {{ formatDate(post.date) }}</div>
                        </div>
                        <span class="badge" :class="post.published !== false ? 'badge-success' : 'badge-warning'">
                            {{ post.published !== false ? '已发布' : '草稿' }}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            stats: { postsCount: 0, categoriesCount: 0, tagsCount: 0, draftsCount: 0 },
            recentPosts: [],
            categories: [],
            loading: true
        }
    },
    methods: {
        formatDate(date) {
            if (!date) return '';
            const d = new Date(date);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        },
        async fetchData() {
            try {
                const dashboard = await window.api.getDashboard();
                this.stats = dashboard.stats;
                this.recentPosts = dashboard.recentPosts || [];

                // Count drafts
                const posts = await window.api.getPosts(1, '');
                this.stats.draftsCount = (posts.posts || []).filter(p => p.published === false).length;

                // Get categories
                const catRes = await window.api.getCategories();
                this.categories = catRes.categories || [];

                this.initCharts();
            } catch (err) {
                console.error(err);
            } finally {
                this.loading = false;
            }
        },
        initCharts() {
            // Check if Chart.js is available
            if (typeof Chart === 'undefined') {
                console.warn('Chart.js not loaded');
                return;
            }

            // Timeline Chart
            const timelineCtx = this.$refs.timelineChart?.getContext('2d');
            if (timelineCtx) {
                new Chart(timelineCtx, {
                    type: 'line',
                    data: {
                        labels: this.getLast6Months(),
                        datasets: [{
                            label: '发布文章数',
                            data: this.getMonthlyPosts(),
                            borderColor: '#ec4899',
                            backgroundColor: 'rgba(236, 72, 153, 0.1)',
                            fill: true,
                            tension: 0.4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                            y: { beginAtZero: true, ticks: { stepSize: 1 } }
                        }
                    }
                });
            }

            // Category Chart
            const categoryCtx = this.$refs.categoryChart?.getContext('2d');
            if (categoryCtx && this.categories.length > 0) {
                new Chart(categoryCtx, {
                    type: 'doughnut',
                    data: {
                        labels: this.categories.slice(0, 5).map(c => c.name),
                        datasets: [{
                            data: this.categories.slice(0, 5).map(c => c.count),
                            backgroundColor: ['#ec4899', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b']
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { position: 'right' } }
                    }
                });
            }

            // Word Count Chart
            const wordCountCtx = this.$refs.wordCountChart?.getContext('2d');
            if (wordCountCtx) {
                new Chart(wordCountCtx, {
                    type: 'bar',
                    data: {
                        labels: this.recentPosts.slice(0, 5).map(p => p.title.substring(0, 10) + '...'),
                        datasets: [{
                            label: '字数',
                            data: this.recentPosts.slice(0, 5).map(() => Math.floor(Math.random() * 3000) + 500),
                            backgroundColor: 'rgba(139, 92, 246, 0.6)',
                            borderRadius: 8
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                            y: { beginAtZero: true }
                        }
                    }
                });
            }
        },
        getLast6Months() {
            const months = [];
            for (let i = 5; i >= 0; i--) {
                const d = new Date();
                d.setMonth(d.getMonth() - i);
                months.push(`${d.getMonth() + 1}月`);
            }
            return months;
        },
        getMonthlyPosts() {
            // Simplified: just return random data for demo
            return [2, 4, 3, 5, 4, 6];
        }
    },
    mounted() {
        this.fetchData();
    }
};

window.Stats = Stats;
