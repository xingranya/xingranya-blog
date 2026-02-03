const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config');
const { helmet, apiLimiter, pathTraversalCheck } = require('./middleware/security');

const app = express();

// Trust proxy - 信任 Nginx 反向代理
app.set('trust proxy', true);

// Security Middleware
app.use(helmet); // Secure HTTP headers
app.use(cors()); // Enable CORS (configure stricter in prod if needed)
app.use(express.json({ limit: '10mb' })); // Body parser
app.use(express.urlencoded({ extended: true }));
app.use(pathTraversalCheck); // Path traversal protection

// Apply Rate Limiting to API
app.use('/api', apiLimiter);

// Static Files
app.use(express.static(path.join(__dirname, 'public')));

// 主题图片静态目录
const imagesDir = path.resolve(__dirname, config.blogRoot, 'themes/defaultone/source/images');
app.use('/images', express.static(imagesDir));

// Routes
app.use('/api', require('./routes/auth')); // Login route
app.use('/api/posts', require('./routes/posts'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/config', require('./routes/config'));
app.use('/api/deploy', require('./routes/deploy'));
app.use('/api/media', require('./routes/media'));
app.use('/api/masonry', require('./routes/masonry'));

// Admin catch-all - 同时处理 /admin 和 /admin/
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'index.html'));
});

app.get('/admin/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'index.html'));
});

// 后台登录页
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Redirect root to login or admin
app.get('/', (req, res) => {
    res.redirect('/index.html');
});

// 404 Handler
app.use((req, res, next) => {
    res.status(404).json({ error: 'Not Found' });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  console.log(`Admin panel available at http://localhost:${PORT}`);
});
