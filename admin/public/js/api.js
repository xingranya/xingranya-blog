const API_URL = '/api';

const api = {
    // Auth
    login: async (password) => {
        const res = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Login failed');
        return data;
    },

    // Posts
    getPosts: async (page = 1, search = '') => {
        const token = localStorage.getItem('token');
        const query = new URLSearchParams({ page, search, limit: 100 }).toString();
        const res = await fetch(`${API_URL}/posts?${query}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch posts');
        return res.json();
    },

    getPost: async (filename) => {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/posts/${encodeURIComponent(filename)}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch post');
        return res.json();
    },

    createPost: async (data) => {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to create post');
        return res.json();
    },

    updatePost: async (filename, data) => {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/posts/${encodeURIComponent(filename)}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to update post');
        return res.json();
    },

    deletePost: async (filename) => {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/posts/${encodeURIComponent(filename)}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to delete post');
        return res.json();
    },

    // Dashboard
    getDashboard: async () => {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/dashboard`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch dashboard data');
        return res.json();
    },

    // Categories
    getCategories: async () => {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/dashboard/categories`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch categories');
        return res.json();
    },

    // Tags
    getTags: async () => {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/dashboard/tags`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch tags');
        return res.json();
    },

    // Media
    getMedia: async () => {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/media`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) return { files: [] };
        return res.json();
    },

    uploadMedia: async (formData) => {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/media/upload`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        if (!res.ok) throw new Error('Failed to upload');
        return res.json();
    },

    // Config
    getConfig: async () => {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/config`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch config');
        return res.json();
    },

    updateConfig: async (data) => {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/config`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to update config');
        return res.json();
    },

    // Deploy
    deploy: async () => {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/deploy`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to deploy');
        return res.json();
    },

    generate: async () => {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/deploy/generate`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to generate');
        return res.json();
    },

    clean: async () => {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/deploy/clean`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to clean');
        return res.json();
    }
};

window.api = api;
