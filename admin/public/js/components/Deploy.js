const Deploy = {
    template: `
        <div class="h-full flex flex-col space-y-6">
            <h2 class="text-2xl font-bold text-gray-800 dark:text-white">部署中心</h2>

            <!-- Actions -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="glass-card p-6 flex flex-col items-center text-center space-y-4">
                    <div class="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-500 mb-2">
                        <i class="fas fa-magic text-2xl"></i>
                    </div>
                    <h3 class="text-lg font-bold text-gray-800 dark:text-white">生成</h3>
                    <p class="text-gray-500 text-sm">根据 Markdown 文章生成静态页面</p>
                    <button @click="runAction('generate')" :disabled="loading" class="w-full py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50">
                        <span v-if="loading && currentAction === 'generate'"><i class="fas fa-spinner fa-spin mr-2"></i></span>
                        生成站点
                    </button>
                </div>

                <div class="glass-card p-6 flex flex-col items-center text-center space-y-4">
                    <div class="p-4 bg-pink-100 dark:bg-pink-900/30 rounded-full text-pink-500 mb-2">
                        <i class="fas fa-cloud-upload-alt text-2xl"></i>
                    </div>
                    <h3 class="text-lg font-bold text-gray-800 dark:text-white">部署</h3>
                    <p class="text-gray-500 text-sm">将更改发布到线上服务器</p>
                    <button @click="runAction('deploy')" :disabled="loading" class="w-full py-2 rounded-lg bg-pink-500 text-white hover:bg-pink-600 transition-colors disabled:opacity-50">
                        <span v-if="loading && currentAction === 'deploy'"><i class="fas fa-spinner fa-spin mr-2"></i></span>
                        发布上线
                    </button>
                </div>

                <div class="glass-card p-6 flex flex-col items-center text-center space-y-4">
                    <div class="p-4 bg-orange-100 dark:bg-orange-900/30 rounded-full text-orange-500 mb-2">
                        <i class="fas fa-broom text-2xl"></i>
                    </div>
                    <h3 class="text-lg font-bold text-gray-800 dark:text-white">清理</h3>
                    <p class="text-gray-500 text-sm">清理缓存数据库和生成的文件</p>
                    <button @click="runAction('clean')" :disabled="loading" class="w-full py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors disabled:opacity-50">
                        <span v-if="loading && currentAction === 'clean'"><i class="fas fa-spinner fa-spin mr-2"></i></span>
                        清理缓存
                    </button>
                </div>
            </div>

            <!-- Console Output -->
            <div class="flex-1 glass-card flex flex-col overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                    <span class="font-mono text-sm font-bold text-gray-700 dark:text-gray-300">控制台输出</span>
                    <button @click="logs = []" class="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">清空</button>
                </div>
                <div class="flex-1 p-4 overflow-auto bg-gray-900 font-mono text-sm">
                    <div v-if="logs.length === 0" class="text-gray-500 italic">等待执行命令...</div>
                    <div v-for="(log, i) in logs" :key="i" class="mb-1">
                        <span v-if="log.type === 'command'" class="text-green-400">$ {{ log.text }}</span>
                        <span v-else-if="log.type === 'error'" class="text-red-400">{{ log.text }}</span>
                        <span v-else-if="log.type === 'success'" class="text-green-400">✓ {{ log.text }}</span>
                        <span v-else class="text-gray-300 whitespace-pre-wrap">{{ log.text }}</span>
                    </div>
                    <div v-if="loading" class="text-blue-400 animate-pulse mt-2">执行中...</div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            loading: false,
            currentAction: '',
            logs: []
        }
    },
    methods: {
        async runAction(action) {
            this.loading = true;
            this.currentAction = action;

            const actionNames = {
                generate: 'hexo generate',
                deploy: 'hexo deploy',
                clean: 'hexo clean'
            };

            this.logs.push({ type: 'command', text: actionNames[action] });

            try {
                let res;
                if (action === 'generate') res = await window.api.generate();
                else if (action === 'deploy') res = await window.api.deploy();
                else if (action === 'clean') res = await window.api.clean();

                if (res.stdout) {
                    this.logs.push({ type: 'output', text: res.stdout });
                }
                if (res.stderr) {
                    this.logs.push({ type: 'error', text: res.stderr });
                }
                this.logs.push({ type: 'success', text: '执行完成' });
            } catch (err) {
                console.error(err);
                this.logs.push({ type: 'error', text: '执行失败: ' + err.message });
            } finally {
                this.loading = false;
                this.currentAction = '';
            }
        }
    }
};

window.Deploy = Deploy;
