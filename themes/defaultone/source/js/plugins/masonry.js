export function initMasonry() {
  const container = document.querySelector('#masonry-container');
  if (!container || container.dataset.masonryReady) return;
  container.dataset.masonryReady = 'true';
  const placeholder = document.querySelector('.loading-placeholder');
  if (placeholder) placeholder.hidden = true;
  container.classList.add('is-ready');
  container.querySelectorAll('img').forEach((image, index) => {
    image.parentElement.style.setProperty('--gallery-delay', `${Math.min(index % 3, 2) * 70}ms`);
    const reveal = () => {
      image.parentElement.classList.add('image-ready');
      image.parentElement.querySelector('.gallery-image-loader')?.remove();
    };
    const failed = () => {
      image.hidden = true;
      const link = document.createElement('a');
      link.className = 'gallery-image-error';
      link.textContent = '图片暂时无法加载，打开原图';
      link.href = image.src;
      link.target = '_blank';
      link.rel = 'noopener';
      image.parentElement.appendChild(link);
      reveal();
    };
    if (image.complete) { if (image.naturalWidth) reveal(); else failed(); }
    else { image.addEventListener('load', reveal, { once: true }); image.addEventListener('error', failed, { once: true }); }
  });
}
