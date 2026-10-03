export default function imageViewer(signal) {
  const viewer = document.querySelector('.image-viewer-container');
  if (!viewer) return;
  const image = viewer.querySelector('img');
  const status = viewer.querySelector('.image-viewer-status');
  const counter = viewer.querySelector('.image-viewer-counter');
  const original = viewer.querySelector('.image-viewer-original');
  const closeButton = viewer.querySelector('[data-viewer-action="close"]');
  const resetButton = viewer.querySelector('[data-viewer-action="reset"]');
  const sources = [...document.querySelectorAll('.markdown-body img, .masonry-item img, #shuoshuo-content img')];
  let opened = false;
  let currentIndex = 0;
  let opener;
  let previousOverflow = '';
  let scale = 1;
  let x = 0;
  let y = 0;
  let pointer;

  function transform() {
    image.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
    resetButton.textContent = `${Math.round(scale * 100)}%`;
  }

  function reset() {
    scale = 1;
    x = 0;
    y = 0;
    pointer = null;
    image.classList.remove('is-dragging');
    transform();
  }

  function zoom(value) {
    scale = Math.min(4, Math.max(1, value));
    if (scale === 1) { x = 0; y = 0; }
    transform();
  }

  function show(index) {
    currentIndex = (index + sources.length) % sources.length;
    const source = sources[currentIndex];
    reset();
    viewer.dataset.ready = 'false';
    status.textContent = '正在加载图片…';
    counter.textContent = `${currentIndex + 1} / ${sources.length}`;
    image.alt = source.alt || '图片预览';
    original.href = source.dataset.src || source.currentSrc || source.src;
    image.src = original.href;
    viewer.querySelectorAll('[data-viewer-action="previous"], [data-viewer-action="next"]').forEach((button) => { button.disabled = sources.length < 2; });
  }

  function close(restoreFocus = true) {
    if (!opened) return;
    opened = false;
    viewer.classList.remove('active');
    viewer.setAttribute('aria-hidden', 'true');
    viewer.inert = true;
    document.body.style.overflow = previousOverflow;
    reset();
    if (restoreFocus && opener?.isConnected) opener.focus({ preventScroll: true });
  }

  image.addEventListener('load', () => {
    viewer.dataset.ready = 'true';
    status.textContent = '';
  }, { signal });
  image.addEventListener('error', () => {
    viewer.dataset.ready = 'false';
    status.textContent = '图片暂时无法加载，可以打开原图重试。';
  }, { signal });

  sources.forEach((source, index) => {
    if (!source.hasAttribute('tabindex')) source.tabIndex = 0;
    if (!source.hasAttribute('role')) source.setAttribute('role', 'button');
    if (!source.hasAttribute('aria-label')) source.setAttribute('aria-label', `预览图片：${source.alt || index + 1}`);
    source.addEventListener('click', () => {
      if (source.hidden) return;
      opener = source;
      previousOverflow = document.body.style.overflow;
      opened = true;
      viewer.inert = false;
      viewer.setAttribute('aria-hidden', 'false');
      viewer.classList.add('active');
      document.body.style.overflow = 'hidden';
      show(index);
      requestAnimationFrame(() => {
        if (opened && viewer.isConnected) closeButton.focus({ preventScroll: true });
      });
    }, { signal });
    source.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        source.click();
      }
    }, { signal });
  });

  viewer.addEventListener('click', (event) => {
    const button = event.target.closest('[data-viewer-action]');
    if (button) {
      switch (button.dataset.viewerAction) {
        case 'close': close(); break;
        case 'previous': show(currentIndex - 1); break;
        case 'next': show(currentIndex + 1); break;
        case 'zoom-in': zoom(scale + 0.25); break;
        case 'zoom-out': zoom(scale - 0.25); break;
        case 'reset': reset(); break;
      }
    } else if (event.target === viewer || event.target.classList.contains('image-viewer-stage')) close();
  }, { signal });

  image.addEventListener('wheel', (event) => {
    event.preventDefault();
    zoom(scale - event.deltaY * 0.001);
  }, { passive: false, signal });
  image.addEventListener('pointerdown', (event) => {
    if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
    pointer = { id: event.pointerId, type: event.pointerType, startX: event.clientX, startY: event.clientY, x, y };
    image.setPointerCapture(event.pointerId);
    if (scale > 1) image.classList.add('is-dragging');
  }, { signal });
  image.addEventListener('pointermove', (event) => {
    if (!pointer || pointer.id !== event.pointerId || scale === 1) return;
    x = pointer.x + event.clientX - pointer.startX;
    y = pointer.y + event.clientY - pointer.startY;
    transform();
  }, { signal });
  function endPointer(event) {
    if (!pointer || pointer.id !== event.pointerId) return;
    const dx = event.clientX - pointer.startX;
    const dy = event.clientY - pointer.startY;
    if (event.type === 'pointerup' && pointer.type === 'touch' && scale === 1 && Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) show(currentIndex + (dx < 0 ? 1 : -1));
    pointer = null;
    image.classList.remove('is-dragging');
  }
  image.addEventListener('pointerup', endPointer, { signal });
  image.addEventListener('pointercancel', endPointer, { signal });

  document.addEventListener('keydown', (event) => {
    if (!opened) return;
    if (event.key === 'Escape') { event.preventDefault(); close(); }
    else if (['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown'].includes(event.key)) {
      event.preventDefault();
      show(currentIndex + (['ArrowLeft', 'ArrowUp'].includes(event.key) ? -1 : 1));
    } else if (event.key === 'Tab') {
      const controls = [...viewer.querySelectorAll('button:not(:disabled), a[href]')];
      const index = controls.indexOf(document.activeElement);
      if (event.shiftKey && index <= 0) { event.preventDefault(); controls.at(-1).focus(); }
      else if (!event.shiftKey && (index === controls.length - 1 || index < 0)) { event.preventDefault(); controls[0].focus(); }
    }
  }, { signal });
  signal?.addEventListener('abort', () => close(false), { once: true });
}
