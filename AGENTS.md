# Agent Guide for xingranya-blog

This document provides context and guidelines for AI agents working on this codebase. This project is a personal blog built with [Hexo](https://hexo.io/), using a custom theme located in `themes/defaultone` (based on `hexo-theme-redefine`).

## 1. Commands

### Core Hexo Commands
Run these from the project root:
- **Start Development Server**: `npm run server` (or `hexo server`) - runs at `http://localhost:4000`
- **Build Static Site**: `npm run build` (or `hexo generate`) - outputs to `public/`
- **Clean Cache**: `npm run clean` (or `hexo clean`) - removes `db.json` and `public/`
- **Deploy**: `npm run deploy` (or `hexo deploy`) - deploys based on `_config.yml` settings

### Theme Development
The theme is located in `themes/defaultone`. It has its own build process involving Tailwind CSS.
If modifying theme styles or scripts, you may need to check `themes/defaultone/package.json`.
- **Build Theme CSS**: `cd themes/defaultone && npm run build:css`
- **Build Theme JS**: `cd themes/defaultone && npm run build:js`

## 2. Project Structure

- **`_config.yml`**: Main site configuration (title, url, theme selection, plugins).
- **`source/`**: Content source.
    - **`_posts/`**: Markdown files for blog posts.
    - **`about/`, `tags/`, etc.**: Custom pages.
- **`themes/defaultone/`**: The active theme.
    - **`source/css/`**: Stylus (`.styl`) files and Tailwind source.
    - **`source/js/`**: Client-side JavaScript.
    - **`layout/`**: EJS templates (`.ejs`) for HTML structure.
    - **`scripts/`**: Hexo scripts/plugins (Node.js runtime).
    - **`_config.yml`**: Theme-specific configuration.
- **`public/`**: Generated static files (do not edit directly).
- **`scaffolds/`**: Templates for new posts.

## 3. Code Style & Conventions

### JavaScript (Node.js & Client-side)
- **Formatting**: 2 spaces indentation.
- **Quotes**: Prefer single quotes `'`.
- **Semicolons**: Use semicolons.
- **ES Version**: ES6+ features allowed (const/let, arrow functions).
- **Naming**: camelCase for variables/functions.

### Stylus (CSS)
- **Syntax**: Indentation-based (no braces `{}`).
- **Variables**: Use CSS variables (`var(--primary-color)`) for theming where possible.
- **Mixins**: Use provided mixins (e.g., `+redefine-tablet()`, `+redefine-mobile()`) for responsiveness.
- **Tailwind**: The theme integrates Tailwind CSS. Check `themes/defaultone/tailwind.config.js` before adding custom utility classes manually.

### EJS (Templates)
- Standard EJS syntax `<% %>` for logic, `<%- %>` for unescaped output (content), `<%= %>` for escaped output.
- Indentation: 2 spaces.

### Markdown (Content)
- Front-matter: YAML format at the top of the file.
- Date format: `YYYY-MM-DD HH:mm:ss`.

## 4. Development Workflow for Agents

1.  **Analyze Context**:
    - If the user asks to change the *look*, check `themes/defaultone/source/css` or `themes/defaultone/layout`.
    - If the user asks to change *content*, check `source/_posts`.
    - If the user asks to change *configuration* (title, author, etc.), check `_config.yml` (root) or `themes/defaultone/_config.yml`.

2.  **Safety**:
    - Do not modify `public/` directly; it is overwritten on build.
    - Always use `npm run clean` if weird rendering issues occur.

3.  **Verification**:
    - Since there are no strict unit tests for the blog content/layout, verification involves running `npm run build` to ensure no errors occur during generation.
    - If editing JS scripts in the theme, ensure syntax is valid.

## 5. Specific Rules

- **Live2D**: Configured in `_config.yml` under `live2d`. Do not remove unless requested.
- **Theme Config**: When reading theme config, note that `hexo.theme.config` is often patched in `themes/defaultone/scripts/data-handle.js`.


<claude-mem-context>
# Memory Context

# [xingranya-blog] recent context, 2026-05-01 7:11pm GMT+8

No previous sessions found.
</claude-mem-context>