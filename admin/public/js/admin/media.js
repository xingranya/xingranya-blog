(function() {
    const { API, Utils, $, $$ } = AdminCore;

    // Elements
    const uploadZone = $('#uploadZone');
    const fileInput = $('#fileInput');
    const mediaGrid = $('#mediaGrid');
    const imageModal = $('#imageModal');

    // Upload Logic
    uploadZone.addEventListener('click', () => fileInput.click());

    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
    });

    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('dragover');
    });

    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });

    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    async function handleFiles(files) {
        if (!files.length) return;

        AdminCore.UI.toast('开始上传...', 'info');

        for (let file of files) {
            try {
                const formData = new FormData();
                formData.append('file', file);

                const res = await fetch('/api/media/upload', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${AdminCore.Store.auth.token}`
                    },
                    body: formData
                });

                const json = await res.json();
                if (json.success && json.data) {
                    addRecentImage(json.data);
                    AdminCore.UI.toast('上传成功: ' + file.name);
                } else {
                    AdminCore.UI.toast('上传失败: ' + (json.message || file.name), 'error');
                }
            } catch (e) {
                console.error(e);
                AdminCore.UI.toast('上传错误: ' + file.name, 'error');
            }
        }
    }

    // Since Tucang API doesn't provide a list API easily accessible without more complex auth sometimes,
    // or if we want to list, we might need a backend proxy that lists from local DB or calls tucang.
    // However, the original request specified "Retain Tucang logic". The original logic (media.js service)
    // had a local JSON db (media-db.json) to store uploaded records.

    // We should implement loading from that local DB.

    async function loadMedia() {
        try {
            mediaGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--a-text-3);">加载中...</div>';

            const res = await API.get('/media'); // This needs to be implemented in backend

            if (!res || res.length === 0) {
                 mediaGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--a-text-3);">暂无图片，快上传一张吧</div>';
                 return;
            }

            renderGrid(res);
        } catch (e) {
             mediaGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #ef4444;">加载失败: ${e.message}</div>`;
        }
    }

    function renderGrid(images) {
        mediaGrid.innerHTML = images.map(img => `
            <div class="media-item" onclick="showImage('${img.url}')">
                <img src="${img.url}" loading="lazy">
                <div class="overlay">
                    <div class="filename">${Utils.escapeHtml(img.name || 'Unknown')}</div>
                </div>
            </div>
        `).join('');
    }

    function addRecentImage(imgData) {
        // Prepend to grid
        const div = document.createElement('div');
        div.className = 'media-item';
        div.onclick = () => showImage(imgData.url);
        div.innerHTML = `
            <img src="${imgData.url}">
            <div class="overlay">
                <div class="filename">Just uploaded</div>
            </div>
        `;
        mediaGrid.insertBefore(div, mediaGrid.firstChild);

        // Remove empty state if exists
        if (mediaGrid.children.length === 1 && mediaGrid.innerText.includes('暂无')) {
            loadMedia();
        }
    }

    // Modal logic
    window.showImage = (url) => {
        $('#modalImage').src = url;
        $('#modalUrl').value = url;
        imageModal.style.display = 'flex';
    };

    $('#closeModalBtn').addEventListener('click', () => {
        imageModal.style.display = 'none';
    });

    imageModal.addEventListener('click', (e) => {
        if (e.target === imageModal) imageModal.style.display = 'none';
    });

    $('#copyUrlBtn').addEventListener('click', () => {
        const input = $('#modalUrl');
        input.select();
        document.execCommand('copy');
        AdminCore.UI.toast('链接已复制');
    });

    // Init
    loadMedia();

})();
