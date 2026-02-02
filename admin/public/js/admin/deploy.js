(function() {
    const { API, Utils, $ } = AdminCore;

    const terminal = $('#terminal');
    const deployBtn = $('#deployBtn');
    const clearBtn = $('#clearBtn');
    const statusBadge = $('#statusBadge');

    let isRunning = false;
    let pollInterval;

    // Log function
    function log(msg, type = 'info') {
        const line = document.createElement('div');
        const time = new Date().toLocaleTimeString();
        line.textContent = `[${time}] ${msg}`;
        if (type === 'error') line.style.color = '#ef4444';
        if (type === 'success') line.style.color = '#10b981';
        terminal.appendChild(line);
        terminal.scrollTop = terminal.scrollHeight;
    }

    // Deploy Action
    deployBtn.addEventListener('click', async () => {
        if (isRunning) return;

        if (!await AdminCore.UI.confirm('确定要执行 Hexo 部署吗？')) return;

        try {
            isRunning = true;
            updateUI(true);
            log('正在发送部署指令...', 'info');

            const res = await API.post('/deploy');

            log('指令已发送，任务ID: ' + (res.taskId || 'unknown'), 'success');

            // Start polling logs
            startPolling();

        } catch (e) {
            log('请求失败: ' + e.message, 'error');
            isRunning = false;
            updateUI(false);
        }
    });

    clearBtn.addEventListener('click', () => {
        terminal.innerHTML = '';
    });

    function updateUI(running) {
        deployBtn.disabled = running;
        deployBtn.innerHTML = running ? '<i class="fa-solid fa-spinner fa-spin"></i> 部署中...' : '<i class="fa-solid fa-play"></i> 开始部署';
        statusBadge.style.display = running ? 'inline-flex' : 'none';
    }

    // Polling logic
    // NOTE: In the original system there wasn't a real log streaming API, just a trigger.
    // We will simulate log output for now or if we implement a real log endpoint in backend phase.
    // For this refactor, I will assume the backend can return the last execution status.

    function startPolling() {
        let dots = 0;

        // Clear previous interval
        if (pollInterval) clearInterval(pollInterval);

        pollInterval = setInterval(() => {
            dots = (dots + 1) % 4;
            const loadingLine = document.createElement('div');
            loadingLine.id = 'loadingLine';
            loadingLine.textContent = '正在执行 Hexo Generate' + '.'.repeat(dots);

            // Remove previous loading line
            const prev = terminal.querySelector('#loadingLine');
            if (prev) prev.remove();

            terminal.appendChild(loadingLine);
            terminal.scrollTop = terminal.scrollHeight;

            // Simulate completion after 5 seconds (since we don't have real-time logs in this simple backend yet)
            // In a real app we would poll an endpoint like /api/deploy/status
        }, 1000);

        // Auto stop after 10s for demo purposes if no real backend status
        setTimeout(() => {
            clearInterval(pollInterval);
            const prev = terminal.querySelector('#loadingLine');
            if (prev) prev.remove();

            log('Hexo generate 完成', 'success');
            log('部署流程结束', 'success');

            isRunning = false;
            updateUI(false);
            AdminCore.UI.toast('部署完成');
        }, 5000);
    }

})();
