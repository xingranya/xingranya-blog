export default function initCursorEffect() {
  if (window.__redefineCursorEffect || !window.cursoreffects) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || matchMedia('(pointer: coarse)').matches) return;
  window.__redefineCursorEffect = new window.cursoreffects.emojiCursor({
    emoji: ['❄️'],
    length: 4,
    size: 8,
  });
}
