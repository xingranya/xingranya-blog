---
title: "VS Code 中将含 Mermaid 图形的 Markdown 文档转换为 Word（macOS 版）"
date: "2026-05-01 17:55:52"
banner: 把 Mermaid 图从代码块自动变成 Word 里的图片
cover: ""
categories:
  - 效率工具
tags:
  - VS Code
  - Markdown
  - Mermaid
  - Pandoc
  - Word
  - macOS
---

这篇记录一个在 macOS 上比较顺手的方案：用 **Pandoc** 加 **mermaid-filter**，把 Markdown 文档里的 Mermaid 代码块自动渲染成图片，并嵌入到 Word 文档中。

适合下面这类场景：

- 用 Markdown 写技术文档
- 文档里有流程图、时序图、架构图
- 最终需要交付 `.docx` 文件
- 希望在 VS Code 里一键转换

---

## 第一步：安装 Pandoc

### 方法一：Homebrew 安装

推荐使用 Homebrew：

```bash
brew install pandoc
```

### 方法二：安装包安装

也可以使用官方安装包：

1. 访问 <https://pandoc.org/installing.html>
2. 下载 macOS 安装包，也就是 `.pkg` 文件
3. 运行安装包完成安装

安装完成后验证版本：

```bash
pandoc --version
```

如果能正常输出版本信息，就说明 Pandoc 已经可以使用。

---

## 第二步：安装 Node.js 与 npm

`mermaid-filter` 依赖 Node.js 环境，所以还需要安装 Node.js 和 npm。

### 方法一：Homebrew 安装

```bash
brew install node
```

### 方法二：安装包安装

也可以从 Node.js 官网下载安装：

1. 访问 <https://nodejs.org/>
2. 下载 LTS 版本
3. 运行安装包完成安装

安装后验证：

```bash
node --version
npm --version
```

如果 npm 下载较慢，可以配置国内镜像：

```bash
npm config set registry https://registry.npmmirror.com
```

---

## 第三步：安装 mermaid-filter

全局安装 `mermaid-filter`：

```bash
npm install -g mermaid-filter
```

验证安装：

```bash
mermaid-filter --help
```

如果命令不可用，可以先查一下 npm 的全局安装路径：

```bash
npm config get prefix
```

输出通常类似：

```text
/Users/你的用户名/.npm-global
```

那么 `mermaid-filter` 的完整路径一般是：

```text
/Users/你的用户名/.npm-global/lib/node_modules/mermaid-filter/index.js
```

后面配置 VS Code 任务时，建议直接使用这个绝对路径，稳定一点。

---

## 第四步：配置 VS Code 一键转换任务

在 VS Code 中打开命令面板：

```text
Cmd + Shift + P
```

输入：

```text
Tasks: Configure Task
```

然后选择 `Others`，在项目的 `.vscode/tasks.json` 中写入下面的配置。

注意把 `/Users/你的用户名/.npm-global/lib/node_modules/mermaid-filter/index.js` 替换成你自己电脑上的真实路径。

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Convert MD to Word with Mermaid",
      "type": "shell",
      "command": "pandoc",
      "args": [
        "${relativeFile}",
        "-o",
        "${relativeFileDirname}/${fileBasenameNoExtension}.docx",
        "--filter",
        "/Users/你的用户名/.npm-global/lib/node_modules/mermaid-filter/index.js"
      ],
      "group": {
        "kind": "build",
        "isDefault": true
      },
      "presentation": {
        "reveal": "always",
        "panel": "shared",
        "clear": true
      },
      "problemMatcher": []
    }
  ]
}
```

配置完成后，打开一个包含 Mermaid 图形的 `.md` 文件，按：

```text
Cmd + Shift + B
```

VS Code 会调用 Pandoc 转换当前 Markdown 文件，并在同目录下生成同名 `.docx` 文件。

效果大概是这样：

![Mermaid 图形转换到 Word 后的效果](https://cdn3.ldstatic.com/original/4X/7/d/4/7d4a8a3e914e74a4e512fa2a8baf70dd2d749109.jpeg)

---

## 第五步：Mermaid 语法常见错误

Mermaid 对一些符号比较敏感，尤其是中文、冒号、感叹号、引号混用时，建议给节点文本加上引号。

| 错误写法 | 正确写法 |
| --- | --- |
| `S: 状态: 描述` | `S: "状态: 描述"` |
| `A[你好！]` | `A["你好！"]` |
| `A->B: 消息"hello"` | `A->B: "消息\"hello\""` |

如果转换时报 Mermaid 语法错误，可以先把代码贴到 Mermaid Live Editor 验证：

<https://mermaid.live/>

---

## 第六步：进阶配置

### 调整 Mermaid 图片宽度

如果导出的图太小，可以在 `args` 中添加：

```json
"--metadata",
"mermaid-width:1200"
```

完整配置时，这两项要作为数组里的两个独立参数。

### 使用 Word 样式模板

如果需要统一 Word 样式，可以准备一个 `reference.docx`，然后在 Pandoc 参数中加入：

```json
"--reference-doc",
"/path/to/reference.docx"
```

这样导出的 Word 会尽量套用参考文档里的标题、正文、代码块等样式。

### 批量转换 Markdown

如果当前目录下有多个 Markdown 文件，可以用循环批量转换：

```bash
for file in *.md; do
  pandoc "$file" -o "${file%.md}.docx" --filter /Users/xingranya/.npm-global/lib/node_modules/mermaid-filter/index.js
done
```

---

## 常见错误排查

| 错误信息 | 解决方案 |
| --- | --- |
| `pandoc: command not found` | 重新安装 Pandoc，并重启终端或 VS Code |
| `mermaid-filter: command not found` | 在 VS Code 任务中使用 `mermaid-filter` 的绝对路径 |
| `Parse error on line X` | Mermaid 语法错误，先用 <https://mermaid.live/> 修正 |

---

## 备选方案

如果不想折腾 Pandoc，也可以考虑这些方案：

1. **Markdown Preview Enhanced**：先导出 HTML，再用 Word 打开
2. **Typora 付费版**：直接导出 Word
3. **手动截图**：把 Mermaid 图截图后插入 Word

不过如果你经常写带流程图的技术文档，Pandoc 加 `mermaid-filter` 的一键转换方式会更稳定，也更适合长期复用。
