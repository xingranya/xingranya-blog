const Categories = {
    template: `
        <div class="space-y-6">
            <!-- Add New -->
            <div class="glass-card p-6">
                <h3 class="text-lg font-semibold mb-4" style="color: var(--text-primary)">添加分类</h3>
                <div class="flex space-x-3">
                    <input v-model="newCategory" @keyup.enter="addCategory" class="form-input flex-1" placeholder="输入分类名称...">
                    <button @click="addCategory" :disabled="!newCategory.trim()" class="btn-primary">
                        <i class="fas fa-plus mr-2"></i>添加
                    </button>
                </div>
            </div>

            <!-- Categories List -->
            <div class="glass-card overflow-hidden">
                <div v-if="loading" class="p-8 text-center" style="color: var(--text-muted)">
                    <i class="fas fa-spinner fa-spin text-2xl"></i>
                </div>

                <div v-else-if="categories.length === 0" class="empty-state">
                    <i class="fas fa-folder"></i>
                    <h3>暂无分类</h3>
                    <p>添加一个新分类开始吧</p>
                </div>

                <div v-else>
                    <div class="p-4 border-b" style="border-color: var(--glass-border); color: var(--text-muted)">
                        共 {{ categories.length }} 个分类
                    </div>
                    <div class="divide-y" style="border-color: var(--glass-border)">
                        <div v-for="cat in categories" :key="cat.name" class="p-4 flex items-center justify-between hover:bg-pink-50/50 dark:hover:bg-pink-900/10 transition-colors">
                            <div class="flex items-center space-x-3">
                                <div class="stat-icon purple" style="width: 2.5rem; height: 2.5rem; font-size: 1rem;">
                                    <i class="fas fa-folder"></i>
                                </div>
                                <div>
                                    <div class="font-medium" style="color: var(--text-primary)">{{ cat.name }}</div>
                                    <div class="text-sm" style="color: var(--text-muted)">{{ cat.count }} 篇文章</div>
                                </div>
                            </div>
                            <div class="flex items-center space-x-2">
                                <button @click="editCategory(cat)" class="btn-icon">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button @click="deleteCategory(cat)" class="btn-icon text-red-500">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Edit Modal -->
            <div v-if="editing" class="modal-backdrop" @click.self="editing = null">
                <div class="modal-content">
                    <h3 class="text-lg font-semibold mb-4" style="color: var(--text-primary)">编辑分类</h3>
                    <input v-model="editName" class="form-input mb-4" placeholder="分类名称">
                    <div class="flex justify-end space-x-3">
                        <button @click="editing = null" class="btn-secondary">取消</button>
                        <button @click="saveEdit" class="btn-primary">保存</button>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            categories: [],
            loading: true,
            newCategory: '',
            editing: null,
            editName: ''
        }
    },
    methods: {
        async fetchCategories() {
            this.loading = true;
            try {
                const res = await window.api.getCategories();
                this.categories = res.categories || [];
            } catch (err) {
                console.error(err);
            } finally {
                this.loading = false;
            }
        },
        async addCategory() {
            if (!this.newCategory.trim()) return;
            // Categories are derived from posts, so we just show a message
            alert('分类会在文章中使用时自动创建。请在写文章时添加分类。');
            this.newCategory = '';
        },
        editCategory(cat) {
            this.editing = cat;
            this.editName = cat.name;
        },
        async saveEdit() {
            alert('分类名称修改需要更新所有相关文章，此功能开发中...');
            this.editing = null;
        },
        async deleteCategory(cat) {
            if (confirm(`确定要删除分类「${cat.name}」吗？这不会删除该分类下的文章。`)) {
                alert('分类删除需要更新所有相关文章，此功能开发中...');
            }
        }
    },
    mounted() {
        this.fetchCategories();
    }
};

window.Categories = Categories;
