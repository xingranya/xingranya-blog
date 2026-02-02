module.exports = {
  apps: [{
    name: 'blog-admin',
    script: 'server.js',
    cwd: './',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
}
