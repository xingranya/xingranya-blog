#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.resolve('public');

function compareText(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function sortRepeatedElements(block, elementName) {
  const pattern = new RegExp(`\\s*<${elementName}(?:\\s[^>]*)?>[\\s\\S]*?<\\/${elementName}>|\\s*<${elementName}\\s[^>]*/>`, 'g');
  const elements = block.match(pattern);
  if (!elements || elements.length < 2) return block;
  let index = 0;
  const sorted = elements.sort((a, b) => compareText(a.trim(), b.trim()));
  return block.replace(pattern, () => sorted[index++]);
}

function normalizeEntries(file, compareEntries, childElements) {
  const filePath = path.join(PUBLIC_DIR, file);
  if (!fs.existsSync(filePath)) return;

  const xml = fs.readFileSync(filePath, 'utf-8');
  const entryPattern = /  <entry>[\s\S]*?  <\/entry>/g;
  const entries = xml.match(entryPattern);
  if (!entries || entries.length < 2) return;

  const normalized = entries
    .map((entry) => childElements.reduce((value, element) => sortRepeatedElements(value, element), entry))
    .sort(compareEntries);
  let index = 0;
  fs.writeFileSync(filePath, xml.replace(entryPattern, () => normalized[index++]), 'utf-8');
}

function elementText(entry, name) {
  const match = entry.match(new RegExp(`<${name}>([\\s\\S]*?)<\\/${name}>`));
  return match ? match[1].trim() : '';
}

normalizeEntries(
  'search.xml',
  (left, right) => compareText(elementText(left, 'url'), elementText(right, 'url')),
  ['category', 'tag']
);

normalizeEntries(
  'atom.xml',
  (left, right) => {
    const dateOrder = compareText(elementText(right, 'published'), elementText(left, 'published'));
    return dateOrder || compareText(elementText(left, 'id'), elementText(right, 'id'));
  },
  ['category']
);

console.log('[normalize-output] 已固定订阅与搜索索引顺序。');
