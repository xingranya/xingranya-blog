const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('../config');

// Rate limiting for login
const loginLimiter = rateLimit({
    windowMs: config.rateLimit.loginWindowMs,
    max: config.rateLimit.loginMaxAttempts,
    message: { error: '登录尝试次数过多，请15分钟后再试' },
    standardHeaders: true,
    legacyHeaders: false,
});

// General API rate limiting
const apiLimiter = rateLimit({
    windowMs: config.rateLimit.apiWindowMs,
    max: config.rateLimit.apiMaxRequests
});

// Path traversal protection checks
const pathTraversalCheck = (req, res, next) => {
    const params = { ...req.params, ...req.query, ...req.body };
    const maliciousPattern = /(\.\.[\/\\])|([\/\\]\.\.)/;

    for (const key in params) {
        if (typeof params[key] === 'string' && maliciousPattern.test(params[key])) {
            return res.status(400).json({ error: 'Invalid path characters detected' });
        }
    }
    next();
};

module.exports = {
    helmet: helmet({
        contentSecurityPolicy: false // 禁用 CSP 以允许内联脚本（开发环境）
    }),
    loginLimiter,
    apiLimiter,
    pathTraversalCheck
};
