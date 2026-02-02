(function() {
    const { API, Utils, $ } = AdminCore;

    const passwordForm = $('#passwordForm');

    passwordForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const oldPassword = $('#oldPassword').value;
        const newPassword = $('#newPassword').value;
        const confirmPassword = $('#confirmPassword').value;

        if (newPassword !== confirmPassword) {
            AdminCore.UI.toast('两次输入的新密码不一致', 'error');
            return;
        }

        try {
            const btn = passwordForm.querySelector('button');
            btn.disabled = true;
            btn.textContent = '更新中...';

            await API.post('/config/password', {
                oldPassword,
                newPassword
            });

            AdminCore.UI.toast('密码修改成功，请重新登录');
            setTimeout(() => {
                AdminCore.Auth.logout();
            }, 1500);

        } catch (error) {
            AdminCore.UI.toast(error.message, 'error');
            const btn = passwordForm.querySelector('button');
            btn.disabled = false;
            btn.textContent = '更新密码';
        }
    });

})();
