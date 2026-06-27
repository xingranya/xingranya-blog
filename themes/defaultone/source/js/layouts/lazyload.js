export default function initLazyLoad() {
  const imgs = document.querySelectorAll("img");
  if (!("IntersectionObserver" in window)) {
    imgs.forEach((img) => {
      const src = img.getAttribute("data-src");
      if (img.hasAttribute("lazyload") && src) {
        img.src = src;
        img.removeAttribute("lazyload");
      }
    });
    return;
  }

  const options = {
    rootMargin: "200px 0px",
    threshold: 0.1,
  };
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        const src = img.getAttribute("data-src");
        if (src) img.src = src;
        img.removeAttribute("lazyload");
        observer.unobserve(img);
      }
    });
  }, options);
  imgs.forEach((img) => {
    if (!img.hasAttribute("loading")) img.setAttribute("loading", "lazy");
    if (!img.hasAttribute("decoding")) img.setAttribute("decoding", "async");

    if (img.hasAttribute("lazyload")) {
      observer.observe(img);
    }
  });
}
