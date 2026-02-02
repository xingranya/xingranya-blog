const Login = {
    template: `
        <div class="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-pink-100 to-purple-200 dark:from-gray-900 dark:to-gray-800">
            <div class="glass-card w-full max-w-md p-8 rounded-2xl">
                <div class="text-center mb-8">
                    <h1 class="text-2xl font-bold text-gray-800 dark:text-white">博客管理后台</h1>
                    <p class="text-gray-500 dark:text-gray-400 mt-2">星苒鸭 · 博客</p>
                </div>

                <form @submit.prevent="handleLogin" class="space-y-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">密码</label>
                        <input
                            v-model="password"
                            type="password"
                            class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-black/20 focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all dark:text-white"
                            placeholder="请输入管理密码"
                            required
                        >
                    </div>

                    <div v-if="error" class="text-red-500 text-sm text-center bg-red-100 dark:bg-red-900/30 p-2 rounded">
                        {{ error }}
                    </div>

                    <button
                        type="submit"
                        :disabled="loading"
                        class="w-full btn-primary py-2.5 rounded-lg text-white font-medium shadow-lg shadow-pink-200/50 dark:shadow-none"
                    >
                        <span v-if="loading"><i class="fas fa-spinner fa-spin mr-2"></i>登录中...</span>
                        <span v-else>登 录</span>
                    </button>
                </form>
            </div>
        </div>
    `,
    data() {
        return {
            password: '',
            loading: false,
            error: null
        }
    },
    methods: {
        async handleLogin() {
            this.loading = true;
            this.error = null;
            try {
                const data = await window.api.login(this.password);
                localStorage.setItem('token', data.token);
                this.$router.push('/dashboard');
            } catch (err) {
                this.error = '密码错误，请重试';
            } finally {
                this.loading = false;
            }
        }
    }
};

window.Login = Login;
