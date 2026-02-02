// Admin layout logic
(function() {
    const { $, Store, Auth, UI } = AdminCore;

    // Check auth
    if (!Auth.check()) {
        location.href = '/'; // Back to login
        return;
    }

    // Sidebar navigation highlight
    const path = location.pathname.replace(/\/$/, '') || '/admin'; // normalize path
    const links = document.querySelectorAll('.nav-item');
    links.forEach(link => {
        let href = link.getAttribute('href');
        // Handle root admin path matching
        if (href === '/admin' && (path === '/admin' || path === '/admin/')) {
            link.classList.add('active');
        } else if (href !== '/admin' && path.startsWith(href)) {
            link.classList.add('active');
        }
    });

    // Logout
    const logoutBtn = $('#logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('确定要退出登录吗？')) {
                Auth.logout();
            }
        });
    }

    // Theme toggle
    const initTheme = () => {
        const theme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', theme);
        updateThemeIcon(theme);
    };

    const updateThemeIcon = (theme) => {
        const btn = $('#themeToggle');
        if (btn) {
            btn.innerHTML = theme === 'dark'
                ? '<i class="fa-solid fa-sun"></i>'
                : '<i class="fa-solid fa-moon"></i>';
        }
    };

    const toggleTheme = () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        updateThemeIcon(next);
    };

    const themeBtn = $('#themeToggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', toggleTheme);
    }

    // Mobile sidebar toggle
    const menuBtn = $('#menuBtn');
    const sidebar = $('.admin-sidebar');
    if (menuBtn && sidebar) {
        menuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 &&
                sidebar.classList.contains('open') &&
                !sidebar.contains(e.target) &&
                e.target !== menuBtn &&
                !menuBtn.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        });
    }

    // Initialize
    initTheme();
})();
