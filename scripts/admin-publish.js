const { spawnSync } = require('child_process');

const publishPaths = [
  'source/_posts',
  'source/images',
  'source/cover-image',
  'source/_data',
  'source/about',
  'source/categories',
  'source/tags',
  'source/links',
  'source/masonry',
  'source/projects'
];

function run(command, args, options = {}) {
  console.log(`$ ${[command, ...args].join(' ')}`);
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    encoding: 'utf8',
    ...options
  });

  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(`命令执行失败：${command} ${args.join(' ')}`);
  }

  return result.stdout.trim();
}

function hasChanges(args) {
  const result = spawnSync('git', args, {
    cwd: process.cwd(),
    stdio: 'ignore'
  });
  return result.status !== 0;
}

function ensureCleanIndex() {
  if (hasChanges(['diff', '--cached', '--quiet'])) {
    throw new Error('当前已有暂存区变更，请先提交或取消暂存，避免误提交无关内容。');
  }
}

function ensureMainBranch() {
  const branch = run('git', ['branch', '--show-current']);
  if (branch !== 'main') {
    throw new Error(`当前分支是 ${branch || '未知'}，请切换到 main 后再发布。`);
  }
}

function normalizeMessage(message) {
  const trimmed = message.trim();
  if (trimmed) return trimmed;
  return `更新博客内容 ${new Date().toISOString().slice(0, 10)}`;
}

function main() {
  const message = normalizeMessage(process.argv.slice(2).join(' '));

  ensureMainBranch();
  ensureCleanIndex();
  run('npm', ['run', 'post:check']);
  run('npm', ['run', 'build']);
  run('git', ['add', '--', ...publishPaths]);

  if (!hasChanges(['diff', '--cached', '--quiet', '--', ...publishPaths])) {
    throw new Error('没有可发布的博客内容变更。');
  }

  run('git', ['commit', '-m', message]);
  run('git', ['push', 'origin', 'main']);
  console.log('发布完成：GitHub 已更新，EdgeOne Pages 将自动部署。');
}

if (typeof hexo === 'undefined') {
  try {
    main();
  } catch (error) {
    console.error(error.message || error);
    process.exit(1);
  }
}
