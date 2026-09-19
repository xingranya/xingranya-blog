/* main function */
import initUtils from "./utils.js";
import initTyped from "./plugins/typed.js";
import initModeToggle from "./tools/lightDarkSwitch.js";
import initLazyLoad from "./layouts/lazyload.js";
import initScrollTopBottom from "./tools/scrollTopBottom.js";
import initLocalSearch from "./tools/localSearch.js";
import initCopyCode from "./tools/codeBlock.js";
import initBookmarkNav from "./layouts/bookmarkNav.js";
import initCategoryList from "./layouts/categoryList.js";

function syncPageSeo() {
  const dataElement = document.querySelector(".page-seo-data");
  if (!dataElement) return;
  const data = JSON.parse(dataElement.textContent);
  const setMeta = (selector, value) => {
    const element = document.head.querySelector(selector);
    if (element) element.setAttribute("content", value);
  };
  const setLink = (selector, value) => {
    const element = document.head.querySelector(selector);
    if (element) element.setAttribute("href", value);
  };

  document.title = data.title;
  setMeta('meta[name="description"]', data.description);
  setMeta('meta[name="keywords"]', data.keywords);
  setMeta('meta[name="robots"]', data.robots);
  setMeta('meta[name="googlebot"]', data.robots);
  setMeta('meta[property="og:type"]', data.type);
  setMeta('meta[property="og:title"]', data.title.replace(/ \| .+$/, ""));
  setMeta('meta[property="og:url"]', data.canonical);
  setMeta('meta[property="og:description"]', data.description);
  setMeta('meta[property="og:image"]', data.image);
  setMeta('meta[name="twitter:image"]', data.image);
  setLink('link[rel="canonical"]', data.canonical);
  setLink('link[rel="alternate"][hreflang="zh-CN"]', data.canonical);
  setLink('link[rel="alternate"][hreflang="x-default"]', data.canonical);

  const jsonLd = document.head.querySelector('script[type="application/ld+json"]');
  if (jsonLd) jsonLd.textContent = JSON.stringify(data.jsonLd);

  let markdown = document.head.querySelector('link[rel="alternate"][type="text/markdown"]');
  if (!data.markdown && markdown) markdown.remove();
  if (data.markdown) {
    if (!markdown) {
      markdown = document.createElement("link");
      markdown.rel = "alternate";
      markdown.type = "text/markdown";
      markdown.title = "Markdown 原文";
      document.head.appendChild(markdown);
    }
    markdown.href = data.markdown;
  }
}

export const main = {
  themeInfo: {
    theme: `Redefine v${theme.version}`,
    author: "EvanNotFound",
    repository: "https://github.com/EvanNotFound/hexo-theme-redefine",
  },
  localStorageKey: "REDEFINE-THEME-STATUS",
  styleStatus: {
    isExpandPageWidth: false,
    isDark: theme.colors.default_mode && theme.colors.default_mode === "dark",
    fontSizeLevel: 0,
    isOpenPageAside: true,
  },
  pageController: null,
  setStyleStatus: () => {
    localStorage.setItem(
      main.localStorageKey,
      JSON.stringify(main.styleStatus),
    );
  },
  getStyleStatus: () => {
    let temp = localStorage.getItem(main.localStorageKey);
    if (temp) {
      temp = JSON.parse(temp);
      for (let key in main.styleStatus) {
        main.styleStatus[key] = temp[key];
      }
      return temp;
    } else {
      return null;
    }
  },
  refresh: () => {
    main.pageController?.abort();
    main.pageController = new AbortController();
    const signal = main.pageController.signal;

    syncPageSeo();
    initUtils(signal);
    initModeToggle(signal);
    initScrollTopBottom(signal);
    initBookmarkNav(signal);
    initCategoryList(signal);

    if (
      theme.home_banner.subtitle.text.length !== 0 &&
      location.pathname === config.root
    ) {
      let typedStarted = false;
      const startTyped = async () => {
        if (typedStarted || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        typedStarted = true;
        if (!window.Typed) {
          window.__redefineTypedLibraryPromise ||= new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = config.root + 'js/build/libs/Typed.min.js';
            script.addEventListener('load', resolve, { once: true });
            script.addEventListener('error', reject, { once: true });
            document.head.appendChild(script);
          });
          try {
            await window.__redefineTypedLibraryPromise;
          } catch (error) {
            console.error(error);
            return;
          }
        }
        initTyped("subtitle");
      };
      if (window.__redefineUserInteracted) {
        startTyped();
      } else {
        window.addEventListener('pointerdown', startTyped, { once: true, passive: true, signal });
        window.addEventListener('touchstart', startTyped, { once: true, passive: true, signal });
        window.addEventListener('scroll', startTyped, { once: true, passive: true, signal });
        window.addEventListener('keydown', startTyped, { once: true, signal });
      }
    }

    if (theme.navbar.search.enable === true) {
      initLocalSearch(signal);
    }

    if (theme.articles.code_block.copy === true) {
      initCopyCode(signal);
    }

    if (theme.articles.lazyload === true) {
      initLazyLoad();
    }
  },
};

export function initMain() {
  main.refresh();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initMain, { once: true });
} else {
  initMain();
}

if (window.swup && window.swup.hooks) {
  window.swup.hooks.on("page:view", () => {
    main.refresh();
  });
}
