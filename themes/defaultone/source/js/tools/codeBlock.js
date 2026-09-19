const initCopyCode = (signal) => {
  HTMLElement.prototype.wrap = function (wrapper) {
    this.parentNode.insertBefore(wrapper, this);
    this.parentNode.removeChild(this);
    wrapper.appendChild(this);
  };

  document.querySelectorAll("figure.highlight").forEach((element) => {
    if (element.parentElement?.classList.contains("highlight-container")) return;
    const container = document.createElement("div");
    element.wrap(container);
    container.classList.add("highlight-container");
    container.insertAdjacentHTML(
      "beforeend",
      '<button type="button" class="copy-button" aria-label="复制代码"><i class="fa-regular fa-copy"></i></button>',
    );
    container.insertAdjacentHTML(
      "beforeend",
      '<button type="button" class="fold-button" aria-label="折叠代码"><i class="fa-solid fa-chevron-down"></i></button>',
    );
    const copyButton = container.querySelector(".copy-button");
    const foldButton = container.querySelector(".fold-button");
    copyButton.addEventListener("click", () => {
      const codeLines = [...container.querySelectorAll(".code .line")];
      const code = codeLines.map((line) => line.innerText).join("\n");

      // Copy code to clipboard
      navigator.clipboard.writeText(code);

      // Display 'copied' icon
      copyButton.querySelector("i").className = "fa-regular fa-check";

      // Reset icon after a while
      setTimeout(() => {
        copyButton.querySelector("i").className = "fa-regular fa-copy";
      }, 1000);
    }, { signal });
    foldButton.addEventListener("click", () => {
      container.classList.toggle("folded");
      foldButton.setAttribute("aria-expanded", String(!container.classList.contains("folded")));
      foldButton.setAttribute("aria-label", container.classList.contains("folded") ? "展开代码" : "折叠代码");
      foldButton.querySelector("i").className = container.classList.contains(
        "folded",
      )
        ? "fa-solid fa-chevron-up"
        : "fa-solid fa-chevron-down";
    }, { signal });
  });
};

export default initCopyCode;
