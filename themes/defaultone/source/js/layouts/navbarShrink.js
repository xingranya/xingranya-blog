export const navbarShrink = {
  navbarDom: document.querySelector(".navbar-container"),
  leftAsideDom: document.querySelector(".page-aside"),
  isnavbarShrink: false,
  navbarHeight: 0,

  init(signal) {
    this.navbarDom = document.querySelector(".navbar-container");
    this.leftAsideDom = document.querySelector(".page-aside");
    if (!this.navbarDom) return;
    this.navbarHeight = this.navbarDom.getBoundingClientRect().height;
    this.shrink();
    this.initDesktopDropdowns(signal);
    this.togglenavbarDrawerShow(signal);
    this.toggleSubmenu(signal);
  },

  shrink() {
    const scrollTop =
      document.documentElement.scrollTop || document.body.scrollTop;

    if (!this.isnavbarShrink && scrollTop > this.navbarHeight) {
      this.isnavbarShrink = true;
      document.body.classList.add("navbar-shrink");
    } else if (this.isnavbarShrink && scrollTop <= this.navbarHeight) {
      this.isnavbarShrink = false;
      document.body.classList.remove("navbar-shrink");
    }
  },

  initDesktopDropdowns(signal) {
    const items = [...this.navbarDom.querySelectorAll('.desktop .navbar-item')]
      .map((item) => ({
        item,
        button: item.querySelector(':scope > .has-dropdown'),
        submenu: item.querySelector(':scope > .sub-menu'),
      }))
      .filter(({ button, submenu }) => button && submenu);
    let activeItem = null;
    let pinnedItem = null;
    let closeTimer;

    const setOpen = (nextItem) => {
      clearTimeout(closeTimer);
      activeItem = nextItem;
      items.forEach(({ item, button, submenu }) => {
        const open = item === nextItem;
        item.classList.toggle('dropdown-open', open);
        button.setAttribute('aria-expanded', String(open));
        submenu.inert = !open;
        submenu.setAttribute('aria-hidden', String(!open));
      });
    };
    const close = (restoreFocus = false) => {
      const button = items.find(({ item }) => item === activeItem)?.button;
      pinnedItem = null;
      setOpen(null);
      if (restoreFocus) button?.focus({ preventScroll: true });
    };
    setOpen(null);

    items.forEach(({ item, button, submenu }) => {
      item.addEventListener('pointerenter', (event) => {
        if (event.pointerType === 'touch' || !matchMedia('(hover: hover)').matches) return;
        if (pinnedItem !== item) pinnedItem = null;
        setOpen(item);
      }, { signal });
      item.addEventListener('pointerleave', () => {
        if (pinnedItem === item || item.contains(document.activeElement)) return;
        closeTimer = setTimeout(() => {
          if (activeItem === item) close();
        }, 120);
      }, { signal });
      button.addEventListener('click', () => {
        if (activeItem === item && pinnedItem === item) {
          close();
        } else {
          pinnedItem = item;
          setOpen(item);
        }
      }, { signal });
      button.addEventListener('keydown', (event) => {
        if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
        event.preventDefault();
        pinnedItem = item;
        setOpen(item);
        const links = [...submenu.querySelectorAll('a[href]')];
        const target = event.key === 'ArrowDown' ? links[0] : links[links.length - 1];
        target?.focus({ preventScroll: true });
      }, { signal });
      submenu.addEventListener('click', (event) => {
        if (event.target.closest('a[href]')) close();
      }, { signal });
    });
    document.addEventListener('pointerdown', (event) => {
      if (activeItem && !activeItem.contains(event.target)) close();
    }, { signal });
    document.addEventListener('focusin', (event) => {
      if (activeItem && !activeItem.contains(event.target)) close();
    }, { signal });
    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && activeItem) {
        event.preventDefault();
        close(true);
      }
    }, { signal });
    window.addEventListener('resize', () => close(), { signal });
    signal.addEventListener('abort', () => close(), { once: true });
  },

  togglenavbarDrawerShow(signal) {
    const drawer = document.querySelector('.navbar-drawer');
    const button = document.querySelector('.navbar-bar');
    if (!drawer || !button) return;
    const setOpen = (open, restoreFocus = false) => {
      document.body.classList.toggle('navbar-drawer-show', open);
      drawer.inert = !open;
      drawer.setAttribute('aria-hidden', String(!open));
      button.setAttribute('aria-expanded', String(open));
      button.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
      if (restoreFocus) button.focus({ preventScroll: true });
    };
    setOpen(false);
    button.addEventListener('click', () => setOpen(drawer.inert), { signal });
    document.querySelector('.window-mask')?.addEventListener('click', () => setOpen(false, true), { signal });
    drawer.addEventListener('click', (event) => { if (event.target.closest('a[href]')) setOpen(false); }, { signal });
    window.addEventListener('keydown', (event) => {
      if (drawer.inert) return;
      if (event.key === 'Escape') { event.preventDefault(); setOpen(false, true); }
      if (event.key === 'Tab') {
        const controls = [button, ...drawer.querySelectorAll('a[href], button')].filter((node) => node.getClientRects().length);
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    }, { signal });
    signal.addEventListener('abort', () => setOpen(false), { once: true });
  },

  toggleSubmenu(signal) {
    const toggleElements = document.querySelectorAll("[navbar-data-toggle]");

    toggleElements.forEach((toggle) => {
      {
        toggle.addEventListener("click", function () {

          const target = document.querySelector(
            '[data-target="' + this.getAttribute("navbar-data-toggle") + '"]',
          );
          if (!target) return;

          const submenuItems = target.children; // Get submenu items
          const icon = this.querySelector(".fa-chevron-right");
          const isVisible = !target.classList.contains("hidden");
          this.setAttribute("aria-expanded", String(!isVisible));

          if (icon) {
            icon.classList.toggle("icon-rotated", !isVisible);
          }

          anime.remove(submenuItems);
          if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
            target.classList.toggle('hidden', isVisible);
            [...submenuItems].forEach((item) => { item.style.opacity = ''; item.style.transform = ''; });
            return;
          }
          if (isVisible) {
            // Animate to hide (reverse stagger effect)
            anime({
              targets: submenuItems,
              opacity: 0,
              translateY: -10,
              duration: 300,
              easing: "easeInQuart",
              delay: anime.stagger(80, { start: 20, direction: "reverse" }),
              complete: function () {
                target.classList.add("hidden");
              },
            });
          } else {
            // Animate to show with stagger effect
            target.classList.remove("hidden");

            anime({
              targets: submenuItems,
              opacity: [0, 1],
              translateY: [10, 0],
              duration: 300,
              easing: "easeOutQuart",
              delay: anime.stagger(80, { start: 20 }),
            });
          }
        }, { signal });
      }
    });
  },
};
