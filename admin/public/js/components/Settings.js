const Settings = {
    template: `
        <div class="h-full flex flex-col">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-gray-800 dark:text-white">站点配置</h2>
                <button @click="save" :disabled="saving" class="btn-primary px-6 py-2 rounded-lg text-white shadow-lg shadow-pink-200/50 dark:shadow-none min-w-[100px]">
                    <span v-if="saving"><i class="fas fa-spinner fa-spin"></i></span>
                    <span v-else>保存配置</span>
                </button>
            </div>

            <div class="flex-1 glass-card p-1 overflow-hidden flex flex-col">
                <div class="bg-gray-100 dark:bg-gray-800 px-4 py-2 text-xs text-gray-500 flex justify-between">
                    <span>_config.yml</span>
                    <span>YAML 格式</span>
                </div>
                <textarea v-model="configContent" class="flex-1 w-full p-4 font-mono text-sm bg-transparent border-none resize-none focus:ring-0 dark:text-gray-200 outline-none" spellcheck="false"></textarea>
            </div>

            <div class="mt-4 text-sm text-gray-500">
                <i class="fas fa-info-circle mr-1"></i>
                修改配置后保存将自动重新生成静态文件
            </div>
        </div>
    `,
    data() {
        return {
            configContent: '',
            saving: false
        }
    },
    async mounted() {
        try {
            const data = await window.api.getConfig();
            this.configContent = data.raw;
        } catch (err) {
            console.error(err);
            alert('加载配置失败');
        }
    },
    methods: {
        async save() {
            this.saving = true;
            try {
                await window.api.updateConfig({ raw: this.configContent });
                alert('配置保存成功！正在重新生成站点...');
            } catch (err) {
                console.error(err);
                alert('保存失败: ' + err.message);
            } finally {
                this.saving = false;
            }
        }
    }
};

window.Settings = Settings;
