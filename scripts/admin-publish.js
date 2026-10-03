const { spawnSync } = require('child_process');

const jsonOutput = process.argv.includes('--json');
const checkOnly = process.argv.includes('--check');
const commandOutput = [];

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
  if (!jsonOutput) console.log(`$ ${[command, ...args].join(' ')}`);
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    encoding: 'utf8',
    ...options
  });

  if (result.stdout) commandOutput.push(result.stdout);
  if (result.stderr) commandOutput.push(result.stderr);
  if (!jsonOutput && result.stdout) process.stdout.write(result.stdout);
  if (!jsonOutput && result.stderr) process.stderr.write(result.stderr);

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
  return `chore(content): 更新博客内容\n\n保存后台确认的内容源文件，触发站点构建。`;
}

function main() {
  const message = normalizeMessage(process.argv.slice(2).filter((arg) => !arg.startsWith('--')).join(' '));

  if (!checkOnly) { ensureMainBranch(); ensureCleanIndex(); }
  run('npm', ['run', 'post:check']);
  run('npm', ['run', 'build']);

  if (checkOnly) {
    const result = {
      success: true,
      mode: 'check',
      branch: run('git', ['branch', '--show-current']),
      status: run('git', ['status', '--short']),
      output: commandOutput.join('').slice(-20000)
    };
    if (jsonOutput) console.log(JSON.stringify(result));
    else console.log('博客预检完成，未提交或推送。');
    return result;
  }

  run('git', ['add', '--', ...publishPaths]);

  if (!hasChanges(['diff', '--cached', '--quiet', '--', ...publishPaths])) {
    throw new Error('没有可发布的博客内容变更。');
  }

  run('git', ['commit', '-m', message]);
  run('git', ['push', 'origin', 'main']);
  const result = { success: true, mode: 'publish', branch: 'main', output: commandOutput.join('').slice(-20000) };
  if (jsonOutput) console.log(JSON.stringify(result));
  else console.log('GitHub 已更新，线上部署结果请在 EdgeOne Pages 确认。');
  return result;
}

if (typeof hexo === 'undefined') {
  try {
    main();
  } catch (error) {
    if (jsonOutput) console.log(JSON.stringify({ success: false, error: error.message || String(error), output: commandOutput.join('').slice(-20000) }));
    else console.error(error.message || error);
    process.exit(1);
  }
}
