/* main function */

import { main } from "../main.js";

export function initTocToggle(signal) {
  const TocToggle = {
    toggleBar: document.querySelector(".page-aside-toggle"),
    postPageContainerDom: document.querySelector(".post-page-container"),
    toggleBarIcon: document.querySelector(".page-aside-toggle i"),
    articleContentContainerDom: document.querySelector(
      ".article-content-container",
    ),
    mainContentDom: document.querySelector(".main-content"),

    isOpenPageAside: false,

    initToggleBarButton() {
      this.toggleBar &&
        this.toggleBar.addEventListener("click", () => {
          this.isOpenPageAside = !this.isOpenPageAside;
          main.styleStatus.isOpenPageAside = this.isOpenPageAside;
          main.setStyleStatus();
          this.changePageLayoutWhenOpenToggle(this.isOpenPageAside);
        }, { signal });
    },

    toggleClassName(element, className, condition) {
      if (element) {
        element.classList.toggle(className, condition);
      }
    },
    changePageLayoutWhenOpenToggle(isOpen) {
      this.toggleClassName(this.toggleBarIcon, "fas", isOpen);
      this.toggleClassName(this.toggleBarIcon, "fa-indent", isOpen);
      this.toggleClassName(this.toggleBarIcon, "fa-outdent", !isOpen);
      this.toggleClassName(this.postPageContainerDom, "show-toc", isOpen);
      this.toggleClassName(this.mainContentDom, "has-toc", isOpen);
    },

    pageAsideHandleOfTOC(isOpen) {
      this.toggleBar.style.display = "flex";
      this.isOpenPageAside = isOpen;
      this.changePageLayoutWhenOpenToggle(isOpen);
    },
  };

  TocToggle.initToggleBarButton();
  return TocToggle;
}
