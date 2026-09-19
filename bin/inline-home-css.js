'use strict';

const fs = require('node:fs');
const path = require('node:path');

const publicDir = path.join(process.cwd(), 'public');
const homePath = path.join(publicDir, 'index.html');
const styleCss = fs.readFileSync(path.join(publicDir, 'css/style.css'), 'utf8');
const tailwindCss = fs.readFileSync(path.join(publicDir, 'css/build/tailwind.css'), 'utf8');
let html = fs.readFileSync(homePath, 'utf8');

const styleLink = /\s*<link rel="stylesheet" href="\/css\/style\.css">\s*/;
const tailwindLink = /\s*<link rel="stylesheet" href="\/css\/build\/tailwind\.css">\s*/;
const existingInlineStyle = /\s*<style data-home-critical-css>[\s\S]*?<\/style>\s*/;
const inlineStyle = `<style data-home-critical-css>${styleCss}\n${tailwindCss}</style>\n`;

if (styleLink.test(html) && tailwindLink.test(html)) {
  html = html
    .replace(styleLink, '')
    .replace(tailwindLink, inlineStyle);
} else if (existingInlineStyle.test(html)) {
  html = html.replace(existingInlineStyle, inlineStyle);
} else {
  throw new Error('首页关键样式链接不存在，停止内联以避免输出不完整页面。');
}

fs.writeFileSync(homePath, html);
console.log('[home-css] 已将首页关键样式内联。');
