const PostEditor = {
    template: `
        <div class="h-full flex flex-col">
            <div class="flex justify-between items-center mb-6">
                <div class="flex items-center space-x-4">
                    <button @click="$router.back()" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <h2 class="text-2xl font-bold" style="color: var(--text-primary)">{{ isNew ? '新建文章' : '编辑文章' }}</h2>
                    <span v-if="autoSaveStatus" class="text-sm" style="color: var(--text-muted)">
                        <i class="fas fa-check-circle text-green-500 mr-1"></i>{{ autoSaveStatus }}
                    </span>
                </div>
                <div class="flex items-center space-x-3">
                    <span class="text-sm" style="color: var(--text-muted)">
                        <i class="fas fa-font mr-1"></i>{{ wordCount }} 字
                    </span>
                    <button @click="openMediaPicker" class="btn-secondary">
                        <i class="fas fa-image mr-2"></i>插入图片
                    </button>
                    <button @click="toggleSettings" class="btn-secondary">
                        <i class="fas fa-cog mr-2"></i>设置
                    </button>
                    <button @click="save" :disabled="saving" class="btn-primary min-w-[100px]">
                        <span v-if="saving"><i class="fas fa-spinner fa-spin"></i></span>
                        <span v-else><i class="fas fa-save mr-2"></i>保存</span>
                    </button>
                </div>
            </div>

            <div class="flex-1 flex gap-6 overflow-hidden">
                <!-- Main Editor -->
                <div class="flex-1 flex flex-col glass-card p-1 min-h-[500px]">
                    <textarea ref="editor"></textarea>
                </div>

                <!-- Side Settings Panel -->
                <div v-if="showSettings" class="w-80 glass-card p-6 overflow-y-auto transition-all">
                    <h3 class="font-bold text-lg mb-4" style="color: var(--text-primary)">
                        <i class="fas fa-sliders-h mr-2" style="color: var(--primary)"></i>文章设置
                    </h3>

                    <div class="space-y-4">
                        <div>
                            <label class="form-label">标题 <span class="text-red-400">*</span></label>
                            <input v-model="post.frontMatter.title" class="form-input" placeholder="请输入文章标题">
                        </div>

                        <div v-if="isNew">
                            <label class="form-label">文件名 (可选)</label>
                            <input v-model="post.filename" placeholder="my-post-slug" class="form-input">
                            <p class="text-xs mt-1" style="color: var(--text-muted)">留空将自动根据标题生成</p>
                        </div>

                        <div>
                            <label class="form-label">发布日期</label>
                            <input type="datetime-local" v-model="postDate" class="form-input">
                        </div>

                        <div>
                            <label class="form-label">分类</label>
                            <input v-model="categoriesStr" placeholder="用逗号分隔多个分类" class="form-input">
                            <div v-if="availableCategories.length" class="flex flex-wrap gap-1 mt-2">
                                <span v-for="cat in availableCategories.slice(0, 5)" :key="cat.name"
                                    @click="addCategory(cat.name)"
                                    class="badge badge-secondary cursor-pointer hover:opacity-80">
                                    {{ cat.name }}
                                </span>
                            </div>
                        </div>

                        <div>
                            <label class="form-label">标签</label>
                            <input v-model="tagsStr" placeholder="用逗号分隔多个标签" class="form-input">
                            <div v-if="availableTags.length" class="flex flex-wrap gap-1 mt-2">
                                <span v-for="tag in availableTags.slice(0, 8)" :key="tag.name"
                                    @click="addTag(tag.name)"
                                    class="badge badge-primary cursor-pointer hover:opacity-80">
                                    {{ tag.name }}
                                </span>
                            </div>
                        </div>

                        <div>
                            <label class="form-label">封面图片</label>
                            <div class="flex space-x-2">
                                <input v-model="post.frontMatter.cover" class="form-input flex-1" placeholder="输入图片URL">
                                <button @click="selectCoverFromMedia" class="btn-secondary" title="从媒体库选择">
                                    <i class="fas fa-images"></i>
                                </button>
                            </div>
                            <div v-if="post.frontMatter.cover" class="mt-2">
                                <img :src="post.frontMatter.cover" class="w-full h-32 object-cover rounded-lg" @error="coverError = true">
                            </div>
                        </div>

                        <div class="flex items-center p-3 rounded-lg" style="background: var(--bg-tertiary)">
                            <input type="checkbox" id="published" v-model="isPublished" class="rounded text-pink-500 focus:ring-pink-500">
                            <label for="published" class="ml-2 text-sm" style="color: var(--text-primary)">
                                <i class="fas fa-globe mr-1"></i>发布文章
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Media Picker Modal -->
            <div v-if="showMediaPicker" class="fixed inset-0 z-50 flex items-center justify-center p-4" style="background: rgba(0,0,0,0.5)">
                <div class="glass-card p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-bold" style="color: var(--text-primary)">选择图片</h3>
                        <button @click="showMediaPicker = false" class="text-gray-500 hover:text-gray-700">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>

                    <!-- Upload Zone -->
                    <div class="upload-zone mb-4 p-4 text-center border-2 border-dashed rounded-lg cursor-pointer"
                        style="border-color: var(--border-color)"
                        @click="$refs.mediaFileInput.click()"
                        @dragover.prevent
                        @drop.prevent="handleMediaDrop">
                        <i class="fas fa-cloud-upload-alt text-2xl mb-2" style="color: var(--primary)"></i>
                        <p style="color: var(--text-muted)">点击或拖拽上传新图片</p>
                        <input ref="mediaFileInput" type="file" class="hidden" accept="image/*" @change="handleMediaUpload">
                    </div>

                    <div v-if="mediaLoading" class="text-center py-8">
                        <i class="fas fa-spinner fa-spin text-2xl" style="color: var(--primary)"></i>
                    </div>

                    <div v-else class="grid grid-cols-4 gap-3">
                        <div v-for="file in mediaFiles" :key="file.name"
                            @click="insertImage(file.url, file.name)"
                            class="aspect-square rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-pink-500 transition-all">
                            <img :src="file.url" :alt="file.name" class="w-full h-full object-cover">
                        </div>
                    </div>

                    <div v-if="!mediaLoading && mediaFiles.length === 0" class="text-center py-8" style="color: var(--text-muted)">
                        <i class="fas fa-images text-3xl mb-2"></i>
                        <p>暂无图片，请先上传</p>
                    </div>
                </div>
            </div>

            <!-- Toast Notification -->
            <div v-if="toast.show" class="fixed bottom-6 right-6 z-50 glass-card px-6 py-3 shadow-lg"
                :class="toast.type === 'success' ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'">
                <div class="flex items-center space-x-2">
                    <i :class="toast.type === 'success' ? 'fas fa-check-circle text-green-500' : 'fas fa-exclamation-circle text-red-500'"></i>
                    <span style="color: var(--text-primary)">{{ toast.message }}</span>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            isNew: true,
            saving: false,
            showSettings: true,
            showMediaPicker: false,
            mediaLoading: false,
            mediaFiles: [],
            availableCategories: [],
            availableTags: [],
            autoSaveStatus: '',
            coverError: false,
            toast: { show: false, message: '', type: 'success' },
            post: {
                filename: '',
                content: '',
                frontMatter: {
                    title: '',
                    date: new Date(),
                    categories: [],
                    tags: [],
                    cover: ''
                }
            },
            easyMDE: null
        }
    },
    computed: {
        wordCount() {
            const content = this.easyMDE ? this.easyMDE.value() : '';
            return content.replace(/\s/g, '').length;
        },
        categoriesStr: {
            get() {
                const cats = this.post.frontMatter.categories;
                return Array.isArray(cats) ? cats.join(', ') : (cats || '');
            },
            set(val) {
                this.post.frontMatter.categories = val.split(',').map(s => s.trim()).filter(Boolean);
            }
        },
        tagsStr: {
            get() {
                const tags = this.post.frontMatter.tags;
                return Array.isArray(tags) ? tags.join(', ') : (tags || '');
            },
            set(val) {
                this.post.frontMatter.tags = val.split(',').map(s => s.trim()).filter(Boolean);
            }
        },
        postDate: {
            get() {
                if (!this.post.frontMatter.date) return '';
                const d = new Date(this.post.frontMatter.date);
                const pad = (n) => n < 10 ? '0' + n : n;
                return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
            },
            set(val) {
                this.post.frontMatter.date = new Date(val);
            }
        },
        isPublished: {
            get() {
                return this.post.frontMatter.published !== false;
            },
            set(val) {
                this.post.frontMatter.published = val;
            }
        }
    },
    methods: {
        toggleSettings() {
            this.showSettings = !this.showSettings;
        },
        showToast(message, type = 'success') {
            this.toast = { show: true, message, type };
            setTimeout(() => { this.toast.show = false; }, 3000);
        },
        addCategory(name) {
            const cats = this.post.frontMatter.categories || [];
            if (!cats.includes(name)) {
                this.post.frontMatter.categories = [...cats, name];
            }
        },
        addTag(name) {
            const tags = this.post.frontMatter.tags || [];
            if (!tags.includes(name)) {
                this.post.frontMatter.tags = [...tags, name];
            }
        },
        async openMediaPicker() {
            this.showMediaPicker = true;
            this.mediaLoading = true;
            try {
                const res = await window.api.getMedia();
                this.mediaFiles = res.files || [];
            } catch (err) {
                console.error(err);
            } finally {
                this.mediaLoading = false;
            }
        },
        insertImage(url, name) {
            const markdown = `![${name}](${url})`;
            const cm = this.easyMDE.codemirror;
            cm.replaceSelection(markdown);
            this.showMediaPicker = false;
            this.showToast('图片已插入');
        },
        async selectCoverFromMedia() {
            await this.openMediaPicker();
            // User will select from modal, then we close
        },
        async handleMediaUpload(e) {
            const file = e.target.files[0];
            if (!file) return;
            await this.uploadFile(file);
            e.target.value = '';
        },
        async handleMediaDrop(e) {
            const file = e.dataTransfer.files[0];
            if (file) await this.uploadFile(file);
        },
        async uploadFile(file) {
            try {
                const token = localStorage.getItem('token');
                const buffer = await file.arrayBuffer();
                const res = await fetch('/api/media/upload', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': file.type,
                        'X-Filename': encodeURIComponent(file.name)
                    },
                    body: buffer
                });
                if (!res.ok) throw new Error('Upload failed');
                const data = await res.json();
                this.mediaFiles.unshift(data.file);
                this.showToast('图片上传成功');
            } catch (err) {
                this.showToast('上传失败: ' + err.message, 'error');
            }
        },
        async save() {
            this.saving = true;
            this.post.content = this.easyMDE.value();

            try {
                if (this.isNew) {
                    const res = await window.api.createPost(this.post);
                    this.showToast('文章创建成功！');
                    this.$router.push('/posts/edit/' + encodeURIComponent(res.filename));
                } else {
                    await window.api.updatePost(this.post.filename, this.post);
                    this.showToast('保存成功！');
                    this.autoSaveStatus = '已保存';
                    setTimeout(() => { this.autoSaveStatus = ''; }, 3000);
                }
            } catch (err) {
                console.error(err);
                this.showToast('保存失败: ' + err.message, 'error');
            } finally {
                this.saving = false;
            }
        },
        async fetchPost(filename) {
            try {
                const decodedFilename = decodeURIComponent(filename);
                const data = await window.api.getPost(decodedFilename);
                this.post = {
                    filename: data.filename,
                    content: data.content,
                    frontMatter: data.frontMatter || {}
                };

                if (!this.post.frontMatter.title) this.post.frontMatter.title = '无标题';
                if (!this.post.frontMatter.date) this.post.frontMatter.date = new Date();

                this.easyMDE.value(this.post.content);
            } catch (err) {
                console.error(err);
                this.showToast('加载文章失败', 'error');
                this.$router.push('/posts');
            }
        },
        async fetchCategoriesAndTags() {
            try {
                const [catRes, tagRes] = await Promise.all([
                    window.api.getCategories(),
                    window.api.getTags()
                ]);
                this.availableCategories = catRes.categories || [];
                this.availableTags = tagRes.tags || [];
            } catch (err) {
                console.error(err);
            }
        }
    },
    mounted() {
        this.easyMDE = new EasyMDE({
            element: this.$refs.editor,
            spellChecker: false,
            autosave: {
                enabled: false,
                uniqueId: "post-editor",
            },
            toolbar: [
                "bold", "italic", "heading", "|",
                "quote", "unordered-list", "ordered-list", "|",
                "link", "image", "table", "horizontal-rule", "|",
                "preview", "side-by-side", "fullscreen", "|",
                "guide"
            ],
            status: ["lines", "words", "cursor"],
            minHeight: "500px",
            placeholder: "在这里输入文章内容（支持 Markdown 格式）...",
            renderingConfig: {
                codeSyntaxHighlighting: true
            }
        });

        this.fetchCategoriesAndTags();

        const filename = this.$route.params.filename;
        if (filename) {
            this.isNew = false;
            this.fetchPost(filename);
        }
    },
    beforeUnmount() {
        if (this.easyMDE) {
            this.easyMDE.toTextArea();
            this.easyMDE = null;
        }
    }
};

window.PostEditor = PostEditor;
