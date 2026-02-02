const { exec } = require('child_process');
const path = require('path');
const config = require('../config');

// 处理绝对路径和相对路径
const blogDir = path.isAbsolute(config.blogRoot)
  ? config.blogRoot
  : path.resolve(__dirname, '..', config.blogRoot);

const runCommand = (command) => {
  return new Promise((resolve, reject) => {
    console.log(`[Hexo] Running: ${command} in ${blogDir}`);
    exec(command, { cwd: blogDir, maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
      if (error) {
        console.error(`[Hexo] Error: ${error.message}`);
        if (stderr) console.error(`[Hexo] Stderr: ${stderr}`);
        return reject(new Error(stderr || error.message));
      }
      if (stderr) {
        console.warn(`[Hexo] Warning: ${stderr}`);
      }
      console.log(`[Hexo] Success: ${stdout.slice(0, 200)}`);
      resolve({ stdout, stderr });
    });
  });
};

module.exports = {
  generate: () => runCommand('npm run build'),
  deploy: () => runCommand('npm run deploy'),
  clean: () => runCommand('npm run clean')
};
