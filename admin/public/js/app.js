const { createApp } = Vue;
const { createRouter, createWebHistory } = VueRouter;

// App Component with Enhanced Sidebar
const App = {
    template: `
        <div v-if="!isAuth" class="h-full">
            <router-view></router-view>
        </div>
        <div v-else class="flex h-screen overflow-hidden">
            <!-- Sidebar -->
            <aside class="w-72 glass-sidebar flex flex-col z-20">
                <!-- Logo -->
                <div class="p-6 border-b border-white/10">
                    <h1 class="text-2xl font-bold sidebar-logo">
                        星苒鸭 · 博客
                    </h1>
                    <p class="text-sm text-gray-500 mt-1">内容管理系统</p>
                </div>

                <!-- Navigation -->
                <nav class="flex-1 px-4 py-4 overflow-y-auto">
                    <!-- Main Menu -->
                    <div class="nav-section-title">主菜单</div>

                    <router-link to="/dashboard" custom v-slot="{ navigate, isActive }">
                        <div @click="navigate" :class="['nav-item', { active: isActive }]">
                            <i class="fas fa-th-large"></i>
                            <span>控制台</span>
                        </div>
                    </router-link>

                    <router-link to="/posts" custom v-slot="{ navigate, isActive }">
                        <div @click="navigate" :class="['nav-item', { active: isActive || $route.path.startsWith('/posts') }]">
                            <i class="fas fa-feather-alt"></i>
                            <span>文章管理</span>
                        </div>
                    </router-link>

                    <router-link to="/drafts" custom v-slot="{ navigate, isActive }">
                        <div @click="navigate" :class="['nav-item', { active: isActive }]">
                            <i class="fas fa-file-alt"></i>
                            <span>草稿箱</span>
                        </div>
                    </router-link>

                    <!-- Content -->
                    <div class="nav-section-title">内容</div>

                    <router-link to="/categories" custom v-slot="{ navigate, isActive }">
                        <div @click="navigate" :class="['nav-item', { active: isActive }]">
                            <i class="fas fa-folder"></i>
                            <span>分类管理</span>
                        </div>
                    </router-link>

                    <router-link to="/tags" custom v-slot="{ navigate, isActive }">
                        <div @click="navigate" :class="['nav-item', { active: isActive }]">
                            <i class="fas fa-tags"></i>
                            <span>标签管理</span>
                        </div>
                    </router-link>

                    <router-link to="/media" custom v-slot="{ navigate, isActive }">
                        <div @click="navigate" :class="['nav-item', { active: isActive }]">
                            <i class="fas fa-images"></i>
                            <span>媒体库</span>
                        </div>
                    </router-link>

                    <!-- System -->
                    <div class="nav-section-title">系统</div>

                    <router-link to="/stats" custom v-slot="{ navigate, isActive }">
                        <div @click="navigate" :class="['nav-item', { active: isActive }]">
                            <i class="fas fa-chart-line"></i>
                            <span>数据统计</span>
                        </div>
                    </router-link>

                    <router-link to="/settings" custom v-slot="{ navigate, isActive }">
                        <div @click="navigate" :class="['nav-item', { active: isActive }]">
                            <i class="fas fa-cog"></i>
                            <span>站点配置</span>
                        </div>
                    </router-link>

                    <router-link to="/deploy" custom v-slot="{ navigate, isActive }">
                        <div @click="navigate" :class="['nav-item', { active: isActive }]">
                            <i class="fas fa-rocket"></i>
                            <span>部署中心</span>
                        </div>
                    </router-link>
                </nav>

                <!-- User Section -->
                <div class="p-4 border-t border-white/10">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-3">
                            <div class="user-avatar">管</div>
                            <div>
                                <div class="text-sm font-medium" style="color: var(--text-primary)">管理员</div>
                                <div class="text-xs" style="color: var(--text-muted)">在线</div>
                            </div>
                        </div>
                        <button @click="logout" class="btn-icon" title="退出登录">
                            <i class="fas fa-sign-out-alt"></i>
                        </button>
                    </div>
                </div>
            </aside>

            <!-- Main Content -->
            <main class="flex-1 overflow-auto">
                <!-- Top Bar -->
                <header class="sticky top-0 z-10 glass-card mx-6 mt-6 mb-4 px-6 py-4 flex items-center justify-between" style="border-radius: 1rem;">
                    <div class="flex items-center space-x-4">
                        <h2 class="text-xl font-bold" style="color: var(--text-primary)">{{ pageTitle }}</h2>
                    </div>
                    <div class="flex items-center space-x-3">
                        <router-link to="/posts/new" class="btn-primary text-sm">
                            <i class="fas fa-plus mr-2"></i>写文章
                        </router-link>
                    </div>
                </header>

                <!-- Page Content -->
                <div class="px-6 pb-6">
                    <router-view v-slot="{ Component }">
                        <transition name="fade" mode="out-in">
                            <component :is="Component" />
                        </transition>
                    </router-view>
                </div>
            </main>
        </div>
    `,
    data() {
        return {
            isAuth: !!localStorage.getItem('token')
        }
    },
    computed: {
        pageTitle() {
            const titles = {
                '/dashboard': '控制台',
                '/posts': '文章管理',
                '/posts/new': '写文章',
                '/drafts': '草稿箱',
                '/categories': '分类管理',
                '/tags': '标签管理',
                '/media': '媒体库',
                '/stats': '数据统计',
                '/settings': '站点配置',
                '/deploy': '部署中心'
            };

            if (this.$route.path.startsWith('/posts/edit')) {
                return '编辑文章';
            }
            return titles[this.$route.path] || '博客管理';
        }
    },
    created() {
        this.$watch('$route', () => {
            this.isAuth = !!localStorage.getItem('token');
        });
    },
    methods: {
        logout() {
            if (confirm('确定要退出登录吗？')) {
                localStorage.removeItem('token');
                this.$router.push('/login');
                this.isAuth = false;
            }
        }
    }
};

// Router Configuration
const routes = [
    { path: '/login', component: window.Login },
    {
        path: '/dashboard',
        component: window.Dashboard,
        meta: { requiresAuth: true }
    },
    {
        path: '/posts',
        component: window.PostList,
        meta: { requiresAuth: true }
    },
    {
        path: '/posts/new',
        component: window.PostEditor,
        meta: { requiresAuth: true }
    },
    {
        path: '/posts/edit/:filename',
        component: window.PostEditor,
        meta: { requiresAuth: true }
    },
    {
        path: '/drafts',
        component: window.Drafts,
        meta: { requiresAuth: true }
    },
    {
        path: '/categories',
        component: window.Categories,
        meta: { requiresAuth: true }
    },
    {
        path: '/tags',
        component: window.Tags,
        meta: { requiresAuth: true }
    },
    {
        path: '/media',
        component: window.Media,
        meta: { requiresAuth: true }
    },
    {
        path: '/stats',
        component: window.Stats,
        meta: { requiresAuth: true }
    },
    {
        path: '/settings',
        component: window.Settings,
        meta: { requiresAuth: true }
    },
    {
        path: '/deploy',
        component: window.Deploy,
        meta: { requiresAuth: true }
    },
    { path: '/:pathMatch(.*)*', redirect: '/dashboard' }
];

const router = createRouter({
    history: createWebHistory('/admin'),
    routes
});

// Navigation Guard
router.beforeEach((to, from, next) => {
    const isAuthenticated = !!localStorage.getItem('token');

    if (to.meta.requiresAuth && !isAuthenticated) {
        next('/login');
    } else if (to.path === '/login' && isAuthenticated) {
        next('/dashboard');
    } else {
        next();
    }
});

// Initialize Vue
const app = createApp(App);
app.use(router);
app.mount('#app');
