const Tags = {
    template: `
        <div class="space-y-6">
            <!-- Add New -->
            <div class="glass-card p-6">
                <h3 class="text-lg font-semibold mb-4" style="color: var(--text-primary)">添加标签</h3>
                <div class="flex space-x-3">
                    <input v-model="newTag" @keyup.enter="addTag" class="form-input flex-1" placeholder="输入标签名称...">
                    <button @click="addTag" :disabled="!newTag.trim()" class="btn-primary">
                        <i class="fas fa-plus mr-2"></i>添加
                    </button>
                </div>
            </div>

            <!-- Tags Cloud -->
            <div class="glass-card p-6">
                <div v-if="loading" class="text-center py-8" style="color: var(--text-muted)">
                    <i class="fas fa-spinner fa-spin text-2xl"></i>
                </div>

                <div v-else-if="tags.length === 0" class="empty-state">
                    <i class="fas fa-tags"></i>
                    <h3>暂无标签</h3>
                    <p>添加一个新标签开始吧</p>
                </div>

                <div v-else>
                    <div class="mb-4 text-sm" style="color: var(--text-muted)">
                        共 {{ tags.length }} 个标签
                    </div>
                    <div class="flex flex-wrap gap-2">
                        <div v-for="tag in tags" :key="tag.name" class="tag group">
                            <span>{{ tag.name }}</span>
                            <span class="ml-2 px-1.5 py-0.5 rounded text-xs" style="background: rgba(139, 92, 246, 0.2)">{{ tag.count }}</span>
                            <button @click="deleteTag(tag)" class="remove opacity-0 group-hover:opacity-100 ml-1">
                                <i class="fas fa-times text-xs"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tags Table -->
            <div class="glass-card overflow-hidden">
                <table class="data-table" v-if="tags.length > 0">
                    <thead>
                        <tr>
                            <th>标签名称</th>
                            <th>文章数</th>
                            <th class="text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="tag in tags" :key="tag.name">
                            <td>
                                <div class="flex items-center space-x-3">
                                    <div class="stat-icon cyan" style="width: 2rem; height: 2rem; font-size: 0.8rem;">
                                        <i class="fas fa-tag"></i>
                                    </div>
                                    <span style="color: var(--text-primary)">{{ tag.name }}</span>
                                </div>
                            </td>
                            <td style="color: var(--text-muted)">{{ tag.count }} 篇</td>
                            <td class="text-right">
                                <button @click="deleteTag(tag)" class="btn-icon text-red-500">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `,
    data() {
        return {
            tags: [],
            loading: true,
            newTag: ''
        }
    },
    methods: {
        async fetchTags() {
            this.loading = true;
            try {
                const res = await window.api.getTags();
                this.tags = res.tags || [];
            } catch (err) {
                console.error(err);
            } finally {
                this.loading = false;
            }
        },
        async addTag() {
            if (!this.newTag.trim()) return;
            alert('标签会在文章中使用时自动创建。请在写文章时添加标签。');
            this.newTag = '';
        },
        async deleteTag(tag) {
            if (confirm(`确定要删除标签「${tag.name}」吗？`)) {
                alert('标签删除需要更新所有相关文章，此功能开发中...');
            }
        }
    },
    mounted() {
        this.fetchTags();
    }
};

window.Tags = Tags;
