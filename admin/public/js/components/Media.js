const Media = {
    template: `
        <div class="space-y-6">
            <!-- Upload Zone -->
            <div
                class="upload-zone glass-card"
                :class="{ dragover: isDragging }"
                @dragover.prevent="isDragging = true"
                @dragleave="isDragging = false"
                @drop.prevent="handleDrop"
                @click="$refs.fileInput.click()"
            >
                <i class="fas fa-cloud-upload-alt block"></i>
                <p class="text-lg font-medium" style="color: var(--text-primary)">拖拽文件到这里上传</p>
                <p style="color: var(--text-muted)">或点击选择文件</p>
                <p class="text-sm mt-2" style="color: var(--text-muted)">支持 JPG, PNG, GIF, WebP 格式，使用图仓存储</p>
                <input ref="fileInput" type="file" class="hidden" accept="image/*" multiple @change="handleFileSelect">
            </div>

            <!-- Upload Progress -->
            <div v-if="uploading" class="glass-card p-4">
                <div class="flex items-center justify-between mb-2">
                    <span style="color: var(--text-primary)">
                        <i class="fas fa-spinner fa-spin mr-2"></i>正在上传 {{ currentUpload }}...
                    </span>
                    <span style="color: var(--text-muted)">{{ uploadedCount }}/{{ totalCount }}</span>
                </div>
                <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-300" :style="{ width: uploadProgress + '%' }"></div>
                </div>
            </div>

            <!-- Error Message -->
            <div v-if="error" class="glass-card p-4 border-l-4 border-red-500">
                <div class="flex items-center text-red-500">
                    <i class="fas fa-exclamation-circle mr-2"></i>
                    <span>{{ error }}</span>
                    <button @click="error = null" class="ml-auto"><i class="fas fa-times"></i></button>
                </div>
            </div>

            <!-- Media Grid -->
            <div class="glass-card p-6">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-lg font-semibold" style="color: var(--text-primary)">
                        媒体文件
                        <span class="text-sm font-normal ml-2" style="color: var(--text-muted)">共 {{ media.length }} 个</span>
                    </h3>
                    <div class="flex items-center space-x-4">
                        <a href="https://tucang.cc/image/manage" target="_blank" class="btn-secondary text-sm">
                            <i class="fas fa-external-link-alt mr-2"></i>图仓管理
                        </a>
                        <div class="search-box" style="width: 250px;">
                            <i class="fas fa-search"></i>
                            <input v-model="search" type="text" placeholder="搜索文件...">
                        </div>
                    </div>
                </div>

                <div v-if="loading" class="text-center py-12" style="color: var(--text-muted)">
                    <i class="fas fa-spinner fa-spin text-3xl"></i>
                </div>

                <div v-else-if="filteredMedia.length === 0" class="empty-state">
                    <i class="fas fa-images"></i>
                    <h3>暂无媒体文件</h3>
                    <p>上传一些图片开始吧</p>
                </div>

                <div v-else class="media-grid">
                    <div v-for="file in filteredMedia" :key="file.name" class="media-item" @click="selectMedia(file)">
                        <img :src="file.url" :alt="file.name" loading="lazy">
                        <div class="overlay">
                            <span class="filename">{{ file.name }}</span>
                        </div>
                        <div v-if="selected === file.name" class="absolute inset-0 border-4 border-pink-500 rounded-lg pointer-events-none"></div>
                    </div>
                </div>
            </div>

            <!-- Selected Media Actions -->
            <div v-if="selectedFile" class="glass-card p-6">
                <h3 class="text-lg font-semibold mb-4" style="color: var(--text-primary)">文件详情</h3>
                <div class="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6">
                    <img :src="selectedFile.url" class="w-full md:w-48 h-48 object-cover rounded-lg">
                    <div class="flex-1 space-y-4">
                        <div>
                            <label class="form-label">文件名</label>
                            <div style="color: var(--text-primary)">{{ selectedFile.name }}</div>
                        </div>
                        <div>
                            <label class="form-label">上传时间</label>
                            <div style="color: var(--text-muted)">{{ formatDate(selectedFile.uploadedAt) }}</div>
                        </div>
                        <div>
                            <label class="form-label">图片链接</label>
                            <div class="flex space-x-2">
                                <input :value="selectedFile.url" class="form-input flex-1 text-sm" readonly>
                                <button @click="copyUrl" class="btn-secondary" title="复制链接">
                                    <i class="fas fa-copy"></i>
                                </button>
                            </div>
                        </div>
                        <div>
                            <label class="form-label">Markdown 格式</label>
                            <div class="flex space-x-2">
                                <input :value="markdownCode" class="form-input flex-1 text-sm" readonly>
                                <button @click="copyMarkdown" class="btn-secondary" title="复制 Markdown">
                                    <i class="fas fa-code"></i>
                                </button>
                            </div>
                        </div>
                        <div class="pt-2 flex space-x-3">
                            <a :href="selectedFile.url" target="_blank" class="btn-secondary">
                                <i class="fas fa-external-link-alt mr-2"></i>新窗口打开
                            </a>
                            <button @click="deleteMedia" class="btn-secondary text-red-500">
                                <i class="fas fa-trash mr-2"></i>删除记录
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            media: [],
            loading: true,
            search: '',
            isDragging: false,
            uploading: false,
            uploadProgress: 0,
            currentUpload: '',
            uploadedCount: 0,
            totalCount: 0,
            selected: null,
            error: null
        }
    },
    computed: {
        filteredMedia() {
            if (!this.search) return this.media;
            const s = this.search.toLowerCase();
            return this.media.filter(f => f.name.toLowerCase().includes(s));
        },
        selectedFile() {
            return this.media.find(f => f.name === this.selected);
        },
        markdownCode() {
            if (!this.selectedFile) return '';
            return `![${this.selectedFile.name}](${this.selectedFile.url})`;
        }
    },
    methods: {
        formatDate(dateStr) {
            if (!dateStr) return '';
            const d = new Date(dateStr);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
        },
        async fetchMedia() {
            this.loading = true;
            try {
                const res = await window.api.getMedia();
                this.media = res.files || [];
            } catch (err) {
                console.error(err);
                this.error = '加载媒体列表失败';
            } finally {
                this.loading = false;
            }
        },
        handleDrop(e) {
            this.isDragging = false;
            const files = e.dataTransfer.files;
            this.uploadFiles(files);
        },
        handleFileSelect(e) {
            this.uploadFiles(e.target.files);
            e.target.value = ''; // Reset input
        },
        async uploadFiles(files) {
            if (!files.length) return;

            this.uploading = true;
            this.error = null;
            this.uploadedCount = 0;
            this.totalCount = files.length;

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                this.currentUpload = file.name;
                this.uploadProgress = Math.round((i / files.length) * 100);

                try {
                    await this.uploadSingleFile(file);
                    this.uploadedCount++;
                } catch (err) {
                    console.error('Upload failed:', err);
                    this.error = `上传 ${file.name} 失败: ${err.message}`;
                }
            }

            this.uploadProgress = 100;
            setTimeout(() => {
                this.uploading = false;
                this.fetchMedia(); // Refresh list
            }, 500);
        },
        async uploadSingleFile(file) {
            const token = localStorage.getItem('token');

            // Read file as ArrayBuffer
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

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Upload failed');
            }

            return res.json();
        },
        selectMedia(file) {
            this.selected = this.selected === file.name ? null : file.name;
        },
        copyUrl() {
            navigator.clipboard.writeText(this.selectedFile.url);
            this.showToast('链接已复制到剪贴板');
        },
        copyMarkdown() {
            navigator.clipboard.writeText(this.markdownCode);
            this.showToast('Markdown 已复制到剪贴板');
        },
        showToast(msg) {
            // Simple alert for now
            alert(msg);
        },
        async deleteMedia() {
            if (!confirm('确定要删除这条记录吗？（注：仅删除本地记录，图仓上的图片不会被删除）')) return;

            try {
                const token = localStorage.getItem('token');
                await fetch(`/api/media/${encodeURIComponent(this.selectedFile.name)}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                this.selected = null;
                this.fetchMedia();
            } catch (err) {
                this.error = '删除失败: ' + err.message;
            }
        }
    },
    mounted() {
        this.fetchMedia();
    }
};

window.Media = Media;
