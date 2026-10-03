/** 内容在进入视野时轻轻展开；中止导航或减弱动态后回到静止状态。 */
export default function initPageMotion(signal) {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const animations = new Set();
  const observer = new IntersectionObserver((entries) => {
    if (motion.matches) return;
    entries.filter((entry) => entry.isIntersecting).forEach((entry, index) => {
      observer.unobserve(entry.target);
      const heading = entry.target.matches('h1, h2, .archive-item-header');
      const animation = entry.target.animate([
        { opacity: heading ? 0.65 : 0.4, transform: `translateY(${heading ? 10 : 18}px)`, filter: heading ? 'blur(3px)' : 'blur(0)' },
        { opacity: 1, transform: 'translateY(0)', filter: 'blur(0)' },
      ], { duration: heading ? 540 : 640, delay: Math.min(index, 4) * 55, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' });
      animations.add(animation);
      animation.finished.then(() => animations.delete(animation)).catch(() => {});
    });
  }, { rootMargin: '0px 0px -24px 0px', threshold: 0.08 });

  document.querySelectorAll('.home-article-item, .archive-item-header, .archive-list-container .article-item, .project-card, .project-pr-item, .project-repo-item, .friends-link-container li, .all-category-list > li, .tagcloud-content a, .about-profile, .page-template-content h2, .article-content h2, .page-title-header, .article-title h1, .collection-title').forEach((node) => observer.observe(node));

  const hero = document.querySelector('.home-banner-container .description');
  const pointer = matchMedia('(hover: hover) and (pointer: fine)');
  let frame = 0;
  const resetHero = () => { cancelAnimationFrame(frame); if (hero) hero.style.transform = ''; };
  if (hero) {
    hero.addEventListener('pointermove', (event) => {
      if (motion.matches || !pointer.matches) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = hero.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        hero.style.transform = `perspective(900px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg)`;
      });
    }, { passive: true, signal });
    hero.addEventListener('pointerleave', resetHero, { signal });
  }
  const stop = () => {
    cancelAnimationFrame(frame);
    observer.disconnect();
    animations.forEach((animation) => animation.cancel());
    animations.clear();
    resetHero();
  };
  motion.addEventListener('change', stop, { signal });
  signal.addEventListener('abort', stop, { once: true });
}
