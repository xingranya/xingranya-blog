title: Splayer-Next 灵动岛修复
banner: 修复 SPlayer-Next 灵动岛功能
cover: 'https://img1.tucang.cc/api/image/show/2812e8763d501ecffcb795ad714115d1'
author: xingranya
categories:
  - 故障排查
  - 编程实践
tags:
  - 灵动岛
  - 开源
  - 修复
date: 2026-06-27 14:46:00
---
# 给 SPlayer-Next 修复 MacBook 刘海屏下的灵动岛对齐

SPlayer-Next 有一个很有意思的功能：桌面端灵动岛。它会在屏幕顶部显示当前播放信息和歌词，效果接近一个悬浮的迷你播放状态栏。

不过在 MacBook 刘海屏上，原来的灵动岛只是“吸附到工作区顶部”，并没有真正贴合物理刘海。视觉上会出现一个比较明显的问题：灵动岛和屏幕刘海之间存在错位，像是一个额外悬浮的小黑条，而不是从刘海区域自然延展出来。

这次我给 SPlayer-Next 提交的 PR 就是围绕这个问题做的修复：

> PR：<https://github.com/SPlayer-Dev/SPlayer-Next/pull/44>  
> 标题：`fix(mac): 修复灵动岛刘海对齐`  
> 状态：已合并

主页
![PixPin_2026-06-27_17-03-37](https://img1.tucang.cc/api/image/show/bf2485f7b42d466a3ae912afd07a70a7)

播放页
![PixPin_2026-06-27_17-05-21](https://img1.tucang.cc/api/image/show/b7bd5abd21ffcf292a47b8e0c15a780e)

灵动岛截图
![PixPin_2026-06-27_18-39-59](https://img1.tucang.cc/api/image/show/04dbd64d82374e94e5531f87d6dfe34d)


## 问题出在哪里

Electron 里做窗口定位时，经常会用 `display.workArea`。它表示可用工作区，会避开菜单栏、Dock 等系统区域。

普通悬浮窗口用 `workArea` 是合理的，但 MacBook 刘海屏下的灵动岛要做的是另一件事：它需要贴住物理屏幕顶部，并从刘海位置向下展开。

也就是说，原来的逻辑更像：

```ts
y = display.workArea.y;
```

但刘海融合模式真正需要的是：

```ts
y = display.bounds.y;
```

`workArea` 是系统认为应用可以安全使用的区域，`bounds` 才是完整屏幕边界。要让软件黑色区域和物理刘海连在一起，就必须基于完整屏幕边界计算位置。

## 新增“刘海融合”开关

这次没有直接改变所有用户的默认行为，而是新增了一个配置项：

```ts
notchFusion: false
```

它只在 macOS 上显示，对应设置项叫“刘海融合”。开启后，灵动岛会进入专门为 MacBook 刘海屏设计的吸附模式。

相关配置被接入到：

- `shared/defaults/settings.ts`
- `shared/types/settings.ts`
- `src/settings/categories/externalLyric.ts`
- `src/i18n/locales/zh-CN.json`
- `src/i18n/locales/en-US.json`

同时，开启刘海融合后，“吸附时居中”会被禁用。因为这个模式下灵动岛必须强制居中，才能和屏幕正中的物理刘海对齐。

## 主进程：重新计算窗口位置

核心逻辑在 `electron/main/window/dynamicIsland.ts`。

这次改动新增了一个判断：

```ts
const isNotchFusionEnabled = (): boolean =>
  isMac && store.get("dynamicIsland").notchFusion;
```

开启刘海融合后，吸附位置不再使用工作区顶部，而是使用屏幕完整边界：

```ts
const bounds = display.bounds;
const centerX = bounds.x + Math.round(bounds.width / 2);
const leftFromCenter = centerX - Math.round(cachedSize.width / 2);

return {
  x: Math.max(bounds.x, Math.min(bounds.x + bounds.width - cachedSize.width, leftFromCenter)),
  y: bounds.y + NOTCH_TOP_OFFSET,
};
```

这里有几个关键点：

1. 使用 `display.bounds`，确保窗口贴住屏幕最顶部。
2. 强制根据屏幕中心计算 `x`，让窗口对准刘海。
3. 开启刘海融合时清空保存的手动位置，避免旧的拖拽坐标影响对齐。
4. 根据当前屏幕限制窗口宽度，避免长歌词把灵动岛撑成一条横幅。

## 物理像素和 Electron DIP

MacBook 刘海的尺寸不是直接拿物理像素就能用的。Electron 窗口使用的是 DIP，也就是设备无关像素。

所以代码里根据 `display.scaleFactor` 做了一层换算：

```ts
const scaleFactor = Math.max(1, display.scaleFactor || 1);

return {
  width: Math.round(NOTCH_PHYSICAL_WIDTH / scaleFactor) + NOTCH_SIDE_OVERHANG * 2,
  height: Math.round(NOTCH_PHYSICAL_HEIGHT / scaleFactor),
  topOffset: NOTCH_TOP_OFFSET,
};
```

在 2x Retina 屏下，又单独保留了一组实测逻辑尺寸，让刘海区域的宽高更贴近实际显示效果。

这个地方比较容易踩坑：如果直接使用物理像素，窗口会明显偏大；如果完全依赖默认窗口宽高，又无法和真实刘海贴合。

## 渲染端：用 SVG 画出融合形状

窗口定位只是第一步。真正让它看起来像“从刘海长出来”，还需要渲染端的形状配合。

在 `windows/dynamic-island/App.vue` 里，这次新增了 `notchFusionEnabled`：

```ts
const notchFusionEnabled = computed(
  () => isMac && config.notchFusion && mode.value === "snapped",
);
```

开启后，根节点不再直接使用普通圆角背景，而是绘制一个 SVG 形状：

```vue
<svg
  v-if="notchFusionEnabled"
  class="notch-shape"
  :viewBox="`0 0 ${shapeWidth} ${shapeHeight}`"
  preserveAspectRatio="none"
  aria-hidden="true"
>
  <path :d="notchPath" fill="var(--di-bg)" />
</svg>
```

这个 SVG 会贴住窗口顶部，中间覆盖刘海区域，底部保留圆角。这样视觉上就不会像一个单独悬浮的小窗口，而是更接近从 MacBook 刘海向下展开的黑色区域。

同时窗口本身设置了透明背景，普通模式和刘海融合模式分别使用不同的样式：

```css
.root.is-snapped.is-notch-fusion {
  background: transparent;
  border-radius: 0;
}
```

## 长歌词的处理

灵动岛显示歌词时，最麻烦的是宽度变化。

如果歌词太长，窗口会被撑得很宽；如果突然收缩，又会显得很跳。刘海融合模式下这个问题更明显，因为它需要始终保持和刘海居中对齐。

这次处理分成了几步：

1. 给窗口设置最大宽度，避免歌词无限横向展开。
2. 记录原始歌词宽度和实际可用宽度。
3. 宽度不足时缩放歌词，必要时加省略号。
4. 收缩窗口时延迟实际 resize，让形状动画先完成。

其中截断逻辑使用了二分搜索，尽量在有限宽度内保留更多文本：

```ts
const truncateTextToWidth = (text: string, maxWidth: number, sizePx: number): string => {
  if (!text || measureTextWidth(text, sizePx) <= maxWidth) return text;

  const ellipsis = "...";
  let low = 0;
  let high = text.length;

  while (low < high) {
    const mid = Math.ceil((low + high) / 2);
    if (measureTextWidth(`${text.slice(0, mid)}${ellipsis}`, sizePx) <= maxWidth) {
      low = mid;
    } else {
      high = mid - 1;
    }
  }

  return `${text.slice(0, low)}${ellipsis}`;
};
```

这样灵动岛在歌词变化时不会一下子撑开到很夸张，也不会因为收缩太快产生突兀感。

## 这次修复的关键点

总结下来，这次修复并不是简单把窗口往上挪几像素，而是把灵动岛在 MacBook 刘海屏下的行为单独建模：

- 用 `bounds` 而不是 `workArea` 贴合屏幕顶边。
- 用 `scaleFactor` 处理物理像素和 Electron DIP 的差异。
- 开启刘海融合后强制居中，避免旧的拖拽位置影响对齐。
- 用 SVG 绘制顶部融合形状，而不是只依赖窗口圆角。
- 对歌词宽度做限制、缩放和截断，避免灵动岛变成长条。
- 只在 macOS 暴露配置，避免影响其他平台。

## 最后

这个 PR 最终改动了 9 个文件，新增了“刘海融合”配置、主进程窗口定位逻辑、渲染端形状绘制和中英文文案。

它看起来是一个很小的 UI 修复，但实际涉及 Electron 多屏幕定位、macOS 刘海屏适配、窗口透明背景、SVG 形状绘制和歌词宽度动画。对桌面端应用来说，这类细节往往决定了功能是“能用”，还是“看起来真的融进系统里”。
