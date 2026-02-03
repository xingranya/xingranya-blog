(function(global) {
    'use strict';

    // DOM 选择器
    const $ = (s) => document.querySelector(s);
    const $$ = (s) => document.querySelectorAll(s);

    // 全局状态
    const Store = {
        auth: { isLoggedIn: false, token: null },
        posts: { list: [], selected: new Set(), total: 0, page: 1 },
        media: { files: [], uploading: false },
        stats: { data: null },
        ui: {
            theme: localStorage.getItem('theme') || 'light',
            sidebarOpen: false,
            loading: false
        }
    };

    // 工具函数
    const Utils = {
        escapeHtml(text) {
            if (!text) return '';
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        },
        debounce(fn, wait = 300) {
            let t;
            return (...a) => {
                clearTimeout(t);
                t = setTimeout(() => fn(...a), wait);
            };
        },
        throttle(fn, wait = 100) {
            let last = 0;
            return (...args) => {
                const now = Date.now();
                if (now - last >= wait) {
                    last = now;
                    fn(...args);
                }
            };
        },
        formatDate(d) {
            if (!d) return '-';
            const date = new Date(d);
            const now = new Date();
            const diff = Math.floor((now - date) / 86400000);
            if (diff === 0) return '今天';
            if (diff === 1) return '昨天';
            if (diff < 7) return `${diff}天前`;
            return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
        },
        formatFullDate(d) {
            if (!d) return '-';
            const date = new Date(d);
            return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')} ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
        },
        formatNumber(n) {
            if (n >= 10000) return (n/10000).toFixed(1) + 'w';
            if (n >= 1000) return (n/1000).toFixed(1) + 'k';
            return n.toString();
        },
        formatBytes(bytes) {
            if (bytes === 0) return '0 B';
            const k = 1024;
            const sizes = ['B', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        },
        slug(text) {
            return text
                .toLowerCase()
                .replace(/[^a-zA-Z0-9\u4e00-\u9fa5]+/g, '-')
                .replace(/^-+|-+$/g, '');
        },
        copyToClipboard(text) {
            if (navigator.clipboard) {
                return navigator.clipboard.writeText(text);
            }
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            return Promise.resolve();
        }
    };

    // API 客户端
    const API = {
        baseURL: '/api',
        async request(method, path, data, options = {}) {
            const opts = {
                method,
                headers: { 'Content-Type': 'application/json' }
            };
            if (Store.auth.token) {
                opts.headers['Authorization'] = `Bearer ${Store.auth.token}`;
            }
            if (data && !(data instanceof FormData)) {
                opts.body = JSON.stringify(data);
            } else if (data instanceof FormData) {
                delete opts.headers['Content-Type'];
                opts.body = data;
            }

            try {
                if (!options.silent) UI.loading.show();
                const res = await fetch(this.baseURL + path, opts);

                if (res.status === 401) {
                    Auth.logout();
                    throw new Error('登录已过期');
                }

                const json = await res.json();
                if (!res.ok) {
                    throw new Error(json.message || json.error || 'Request failed');
                }
                return json;
            } catch (error) {
                console.error('API Error:', error);
                if (!options.silent) UI.toast(error.message, 'error');
                throw error;
            } finally {
                if (!options.silent) UI.loading.hide();
            }
        },
        get: (p, opts) => API.request('GET', p, null, opts),
        post: (p, d, opts) => API.request('POST', p, d, opts),
        put: (p, d, opts) => API.request('PUT', p, d, opts),
        delete: (p, opts) => API.request('DELETE', p, null, opts)
    };

    // UI 组件
    const UI = {
        toast(msg, type = 'success') {
            const container = document.getElementById('toast-container') || (() => {
                const c = document.createElement('div');
                c.id = 'toast-container';
                c.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px;';
                document.body.appendChild(c);
                return c;
            })();

            const icons = {
                success: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm-2 15l-5-5 1.41-1.41L8 12.17l7.59-7.59L17 6l-9 9z" fill="currentColor"/></svg>',
                error: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm1 15H9v-2h2v2zm0-4H9V5h2v6z" fill="currentColor"/></svg>',
                warning: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M1 19h18L10 1 1 19zm10-3H9v-2h2v2zm0-4H9V8h2v4z" fill="currentColor"/></svg>',
                info: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm1 15H9V9h2v6zm0-8H9V5h2v2z" fill="currentColor"/></svg>'
            };

            const colors = {
                success: '#10b981',
                error: '#ef4444',
                warning: '#f59e0b',
                info: '#3b82f6'
            };

            const el = document.createElement('div');
            el.className = `toast toast-${type}`;
            el.style.cssText = `
                background: ${colors[type] || colors.success};
                color: white;
                padding: 12px 20px;
                border-radius: 10px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                opacity: 0;
                transform: translateX(100%);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 14px;
                font-weight: 500;
            `;
            el.innerHTML = `${icons[type] || icons.success}<span>${Utils.escapeHtml(msg)}</span>`;

            container.appendChild(el);

            requestAnimationFrame(() => {
                el.style.opacity = '1';
                el.style.transform = 'translateX(0)';
            });

            setTimeout(() => {
                el.style.opacity = '0';
                el.style.transform = 'translateX(100%)';
                setTimeout(() => el.remove(), 300);
            }, 3000);
        },

        confirm(msg, options = {}) {
            return new Promise((resolve) => {
                const backdrop = document.createElement('div');
                backdrop.className = 'modal-backdrop';
                backdrop.innerHTML = `
                    <div class="modal-content" style="max-width: 400px;">
                        <div style="text-align: center; margin-bottom: 1.5rem;">
                            <div style="width: 60px; height: 60px; margin: 0 auto 1rem; background: rgba(239, 68, 68, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="8" x2="12" y2="12"></line>
                                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                </svg>
                            </div>
                            <h3 style="font-size: 1.125rem; font-weight: 600; color: var(--a-text); margin-bottom: 0.5rem;">${options.title || '确认操作'}</h3>
                            <p style="color: var(--a-text-2); font-size: 0.95rem;">${Utils.escapeHtml(msg)}</p>
                        </div>
                        <div style="display: flex; gap: 0.75rem;">
                            <button class="btn-secondary" style="flex: 1;" data-action="cancel">${options.cancelText || '取消'}</button>
                            <button class="btn-primary" style="flex: 1; background: linear-gradient(135deg, #ef4444, #dc2626);" data-action="confirm">${options.confirmText || '确认'}</button>
                        </div>
                    </div>
                `;
                document.body.appendChild(backdrop);

                const close = (result) => {
                    backdrop.style.opacity = '0';
                    setTimeout(() => backdrop.remove(), 200);
                    resolve(result);
                };

                backdrop.querySelector('[data-action="cancel"]').onclick = () => close(false);
                backdrop.querySelector('[data-action="confirm"]').onclick = () => close(true);
                backdrop.onclick = (e) => { if (e.target === backdrop) close(false); };

                requestAnimationFrame(() => {
                    backdrop.style.opacity = '1';
                });
            });
        },

        modal(content, options = {}) {
            const backdrop = document.createElement('div');
            backdrop.className = 'modal-backdrop';
            backdrop.style.opacity = '0';
            backdrop.innerHTML = `
                <div class="modal-content" style="max-width: ${options.width || '500px'};">
                    ${options.title ? `<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <h3 style="font-size: 1.125rem; font-weight: 600; color: var(--a-text);">${options.title}</h3>
                        <button class="btn-icon" data-close>&times;</button>
                    </div>` : ''}
                    <div class="modal-body">${content}</div>
                </div>
            `;
            document.body.appendChild(backdrop);

            const close = () => {
                backdrop.style.opacity = '0';
                setTimeout(() => backdrop.remove(), 200);
            };

            if (backdrop.querySelector('[data-close]')) {
                backdrop.querySelector('[data-close]').onclick = close;
            }
            backdrop.onclick = (e) => { if (e.target === backdrop) close(); };

            requestAnimationFrame(() => {
                backdrop.style.opacity = '1';
            });

            return { close, el: backdrop };
        },

        loading: {
            show() {
                Store.ui.loading = true;
                let el = document.getElementById('global-loading');
                if (!el) {
                    el = document.createElement('div');
                    el.id = 'global-loading';
                    el.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 3px; z-index: 9999; overflow: hidden;';
                    el.innerHTML = '<div style="width: 30%; height: 100%; background: linear-gradient(90deg, var(--a-primary), #8b5cf6); animation: loading 1s ease-in-out infinite;"></div>';
                    const style = document.createElement('style');
                    style.textContent = '@keyframes loading { 0% { transform: translateX(-100%); } 100% { transform: translateX(400%); } }';
                    document.head.appendChild(style);
                    document.body.appendChild(el);
                }
                el.style.display = 'block';
            },
            hide() {
                Store.ui.loading = false;
                const el = document.getElementById('global-loading');
                if (el) el.style.display = 'none';
            }
        }
    };

    // 主题管理
    const Theme = {
        init() {
            const saved = localStorage.getItem('theme');
            if (saved) {
                this.set(saved);
            } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                this.set('dark');
            }
        },
        get() {
            return Store.ui.theme;
        },
        set(theme) {
            Store.ui.theme = theme;
            localStorage.setItem('theme', theme);
            document.documentElement.setAttribute('data-theme', theme);
            document.body.classList.toggle('dark', theme === 'dark');
        },
        toggle() {
            this.set(Store.ui.theme === 'dark' ? 'light' : 'dark');
        }
    };

    // 认证
    const Auth = {
        check() {
            const token = localStorage.getItem('token');
            if (token) {
                Store.auth.token = token;
                Store.auth.isLoggedIn = true;
                return true;
            }
            return false;
        },
        async login(password) {
            const res = await API.post('/login', { password });
            if (res.token) {
                localStorage.setItem('token', res.token);
                Store.auth.token = res.token;
                Store.auth.isLoggedIn = true;
            }
            return res;
        },
        logout() {
            localStorage.removeItem('token');
            Store.auth = { isLoggedIn: false, token: null };
            // 退出登录后跳转到登录页
            if (location.pathname.includes('/admin/')) {
                location.href = '/login';
            }
        },
        requireAuth() {
            if (!this.check()) {
                // 未登录跳转到登录页
                location.href = '/login';
                return false;
            }
            return true;
        }
    };

    // 路由辅助
    const Router = {
        getParams() {
            return Object.fromEntries(new URLSearchParams(location.search));
        },
        setParams(params) {
            const url = new URL(location.href);
            Object.entries(params).forEach(([k, v]) => {
                if (v === null || v === undefined || v === '') {
                    url.searchParams.delete(k);
                } else {
                    url.searchParams.set(k, v);
                }
            });
            history.replaceState(null, '', url);
        },
        navigate(path) {
            location.href = path;
        }
    };

    // 导出
    global.AdminCore = {
        $, $$,
        Store,
        Utils,
        API,
        UI,
        Auth,
        Theme,
        Router
    };

    // 自动初始化主题
    Theme.init();

    // ========== 动效系统 ==========
    const Motion = {
        // 涟漪效果
        ripple(e) {
            const btn = e.currentTarget;
            const rect = btn.getBoundingClientRect();
            const ripple = document.createElement('span');
            const size = Math.max(rect.width, rect.height);

            ripple.className = 'ripple';
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
            ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';

            btn.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        },

        // 页面切换动画
        pageTransition(url) {
            const overlay = document.createElement('div');
            overlay.className = 'page-transition';
            document.body.appendChild(overlay);

            requestAnimationFrame(() => {
                overlay.classList.add('active');
                setTimeout(() => {
                    location.href = url;
                }, 300);
            });
        },

        // 主题切换动画
        themeTransition() {
            document.documentElement.classList.add('theme-transitioning');
            setTimeout(() => {
                document.documentElement.classList.remove('theme-transitioning');
            }, 400);
        },

        // 数字滚动动画
        countUp(el, target, duration = 800) {
            const start = parseInt(el.textContent) || 0;
            const startTime = performance.now();

            const update = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
                const current = Math.round(start + (target - start) * eased);

                el.textContent = current;

                if (progress < 1) {
                    requestAnimationFrame(update);
                } else {
                    el.classList.add('updated');
                    setTimeout(() => el.classList.remove('updated'), 400);
                }
            };

            requestAnimationFrame(update);
        },

        // 错误抖动
        shake(el) {
            el.classList.add('error-shake');
            setTimeout(() => el.classList.remove('error-shake'), 400);
        },

        // 成功脉冲
        pulse(el) {
            el.classList.add('success-pulse');
            setTimeout(() => el.classList.remove('success-pulse'), 600);
        },

        // 入场动画
        staggerIn(container) {
            container.classList.add('stagger-animate');
        },

        // 滚动显示
        initScrollReveal() {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('revealed');
                    }
                });
            }, { threshold: 0.1 });

            document.querySelectorAll('.reveal-on-scroll').forEach(el => {
                observer.observe(el);
            });
        },

        // 初始化所有动效
        init() {
            // 给所有按钮添加涟漪效果
            document.addEventListener('click', (e) => {
                const btn = e.target.closest('.btn-primary, .btn-secondary, .btn-danger, .nav-item');
                if (btn) {
                    this.ripple(e);
                }
            });

            // 页面内链接添加过渡效果
            document.addEventListener('click', (e) => {
                const link = e.target.closest('a[href^="/admin"]');
                if (link && !e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                    this.pageTransition(link.href);
                }
            });

            // 统计卡片入场动画
            const statsGrid = document.querySelector('.stats-grid');
            if (statsGrid) {
                this.staggerIn(statsGrid);
            }

            // 初始化滚动显示
            this.initScrollReveal();
        }
    };

    // 导出 Motion
    global.AdminCore.Motion = Motion;

    // DOM Ready 后初始化动效
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => Motion.init());
    } else {
        Motion.init();
    }

})(window);
