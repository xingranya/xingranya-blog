export default function initLocalSearch(signal) {
  // Search DB path
  let searchPath = config.path;
  if (!searchPath) {
    // Search DB path
    console.warn("`hexo-generator-searchdb` plugin is not installed!");
    return;
  }

  // Popup Window
  let isfetched = false;
  let fetchPromise;
  let datas;
  let isXml = true;
  if (searchPath.length === 0) {
    searchPath = "search.xml";
  } else if (searchPath.endsWith("json")) {
    isXml = false;
  }
  const searchInputDom = document.querySelector(".search-input");
  const resultContent = document.getElementById("search-result");
  const overlay = document.querySelector(".search-pop-overlay");
  if (!searchInputDom || !resultContent || !overlay) return;

  const getIndexByWord = (word, text, caseSensitive) => {
    let wordLen = word.length;
    if (wordLen === 0) return [];
    let startPosition = 0;
    let position = [];
    let index = [];
    if (!caseSensitive) {
      text = text.toLowerCase();
      word = word.toLowerCase();
    }
    while ((position = text.indexOf(word, startPosition)) > -1) {
      index.push({ position, word });
      startPosition = position + wordLen;
    }
    return index;
  };

  // Merge hits into slices
  const mergeIntoSlice = (start, end, index, searchText) => {
    let currentItem = index[index.length - 1];
    let { position, word } = currentItem;
    let hits = [];
    let searchTextCountInSlice = 0;

    // Merge hits into the slice
    while (position + word.length <= end && index.length !== 0) {
      if (word === searchText) {
        searchTextCountInSlice++;
      }
      hits.push({
        position,
        length: word.length,
      });

      const wordEnd = position + word.length;

      // Move to the next position of the hit
      index.pop();
      for (let i = index.length - 1; i >= 0; i--) {
        currentItem = index[i];
        position = currentItem.position;
        word = currentItem.word;
        if (wordEnd <= position) {
          break;
        } else {
          index.pop();
        }
      }
    }

    return {
      hits,
      start,
      end,
      searchTextCount: searchTextCountInSlice,
    };
  };

  // Highlight title and content
  const highlightKeyword = (text, slice) => {
    let result = "";
    let prevEnd = slice.start;
    slice.hits.forEach((hit) => {
      result += text.substring(prevEnd, hit.position);
      let end = hit.position + hit.length;
      result += `<b class="search-keyword">${text.substring(
        hit.position,
        end,
      )}</b>`;
      prevEnd = end;
    });
    result += text.substring(prevEnd, slice.end);
    return result;
  };

  const inputEventFunction = () => {
    if (!isfetched) return;
    let searchText = searchInputDom.value.trim().toLowerCase();
    let keywords = searchText.split(/[-\s]+/);
    if (keywords.length > 1) {
      keywords.push(searchText);
    }
    let resultItems = [];
    if (searchText.length > 0) {
      // Perform local searching
      datas.forEach(({ title, content, url }) => {
        let titleInLowerCase = title.toLowerCase();
        let contentInLowerCase = content.toLowerCase();
        let indexOfTitle = [];
        let indexOfContent = [];
        let searchTextCount = 0;
        keywords.forEach((keyword) => {
          indexOfTitle = indexOfTitle.concat(
            getIndexByWord(keyword, titleInLowerCase, false),
          );
          indexOfContent = indexOfContent.concat(
            getIndexByWord(keyword, contentInLowerCase, false),
          );
        });

        // Show search results
        if (indexOfTitle.length > 0 || indexOfContent.length > 0) {
          let hitCount = indexOfTitle.length + indexOfContent.length;
          // Sort index by position of keyword
          [indexOfTitle, indexOfContent].forEach((index) => {
            index.sort((itemLeft, itemRight) => {
              if (itemRight.position !== itemLeft.position) {
                return itemRight.position - itemLeft.position;
              }
              return itemLeft.word.length - itemRight.word.length;
            });
          });

          let slicesOfTitle = [];
          if (indexOfTitle.length !== 0) {
            let tmp = mergeIntoSlice(0, title.length, indexOfTitle, searchText);
            searchTextCount += tmp.searchTextCountInSlice;
            slicesOfTitle.push(tmp);
          }

          let slicesOfContent = [];
          while (indexOfContent.length !== 0) {
            let item = indexOfContent[indexOfContent.length - 1];
            let { position, word } = item;
            // Cut out 100 characters
            let start = position - 20;
            let end = position + 80;
            if (start < 0) {
              start = 0;
            }
            if (end < position + word.length) {
              end = position + word.length;
            }
            if (end > content.length) {
              end = content.length;
            }
            let tmp = mergeIntoSlice(start, end, indexOfContent, searchText);
            searchTextCount += tmp.searchTextCountInSlice;
            slicesOfContent.push(tmp);
          }

          // Sort slices in content by search text's count and hits' count
          slicesOfContent.sort((sliceLeft, sliceRight) => {
            if (sliceLeft.searchTextCount !== sliceRight.searchTextCount) {
              return sliceRight.searchTextCount - sliceLeft.searchTextCount;
            } else if (sliceLeft.hits.length !== sliceRight.hits.length) {
              return sliceRight.hits.length - sliceLeft.hits.length;
            }
            return sliceLeft.start - sliceRight.start;
          });

          // Select top N slices in content
          let upperBound = parseInt(
            theme.navbar.search.top_n_per_article
              ? theme.navbar.search.top_n_per_article
              : 1,
            10,
          );
          if (upperBound >= 0) {
            slicesOfContent = slicesOfContent.slice(0, upperBound);
          }

          let resultItem = "";

          if (slicesOfTitle.length !== 0) {
            resultItem += `<li><a href="${url}" class="search-result-title">${highlightKeyword(
              title,
              slicesOfTitle[0],
            )}</a>`;
          } else {
            resultItem += `<li><a href="${url}" class="search-result-title">${title}</a>`;
          }

          slicesOfContent.forEach((slice) => {
            resultItem += `<a href="${url}"><p class="search-result">${highlightKeyword(
              content,
              slice,
            )}...</p></a>`;
          });

          resultItem += "</li>";
          resultItems.push({
            item: resultItem,
            id: resultItems.length,
            hitCount,
            searchTextCount,
          });
        }
      });
    }
    if (keywords.length === 1 && keywords[0] === "") {
      resultContent.innerHTML =
        '<div id="no-result"><i class="fa-solid fa-magnifying-glass fa-2x" aria-hidden="true"></i><p>想读点什么？</p><span>输入关键词，查找文章标题与正文。</span></div>';
    } else if (resultItems.length === 0) {
      resultContent.innerHTML =
        '<div id="no-result"><i class="fa-solid fa-box-open fa-2x" aria-hidden="true"></i><p>没有找到相关文章</p><span>换个关键词，或缩短搜索内容试试。</span></div>';
    } else {
      resultItems.sort((resultLeft, resultRight) => {
        if (resultLeft.searchTextCount !== resultRight.searchTextCount) {
          return resultRight.searchTextCount - resultLeft.searchTextCount;
        } else if (resultLeft.hitCount !== resultRight.hitCount) {
          return resultRight.hitCount - resultLeft.hitCount;
        }
        return resultRight.id - resultLeft.id;
      });
      let searchResultList = '<ul class="search-result-list">';
      resultItems.forEach((result) => {
        searchResultList += result.item;
      });
      searchResultList += "</ul>";
      resultContent.innerHTML = searchResultList;
      window.pjax && window.pjax.refresh(resultContent);
    }
  };

  const fetchData = () => {
    if (fetchPromise) return fetchPromise;
    fetchPromise = fetch(config.root + searchPath)
      .then((response) => { if (!response.ok) throw new Error('搜索索引暂时无法加载。'); return response.text(); })
      .then((res) => {
        // Get the contents from search data
        isfetched = true;
        datas = isXml
          ? [
              ...new DOMParser()
                .parseFromString(res, "text/xml")
                .querySelectorAll("entry"),
            ].map((element) => {
              return {
                title: element.querySelector("title").textContent,
                content: element.querySelector("content").textContent,
                url: element.querySelector("url").textContent,
              };
            })
          : JSON.parse(res);
        // Only match articles with not empty titles
        datas = datas
          .filter((data) => data.title)
          .map((data) => {
            data.title = data.title.trim();
            data.content = data.content
              ? data.content.trim().replace(/<[^>]+>/g, "")
              : "";
            data.url = decodeURIComponent(data.url).replace(/\/{2,}/g, "/");
            return data;
          });
        // Remove loading animation
        inputEventFunction();
      })
      .catch((error) => {
        fetchPromise = null;
        resultContent.innerHTML = '<p id="no-result">搜索索引加载失败，请稍后重试。</p>';
        console.error(error);
      });
    return fetchPromise;
  };

  if (theme.navbar.search.preload) {
    fetchData();
  }

  if (searchInputDom) {
    searchInputDom.addEventListener("input", inputEventFunction, { signal });
  }

  let returnFocus;
  let previousOverflow = '';
  const openPopup = (trigger) => {
    if (overlay.classList.contains('active') || document.querySelector('.image-viewer-container.active')) return;
    returnFocus = trigger instanceof HTMLElement ? trigger : document.activeElement;
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    overlay.inert = false;
    overlay.classList.add('active');
    searchInputDom.focus({ preventScroll: true });
    if (!isfetched) fetchData();
    else inputEventFunction();
  };

  // 打开、关闭与键盘操作共享同一条路径。
  document.querySelectorAll(".search-popup-trigger").forEach((element) => {
    element.addEventListener('click', () => openPopup(element), { signal });
  });

  // Monitor main search box
  const onPopupClose = () => {
    if (!overlay.classList.contains('active')) return;
    document.body.style.overflow = previousOverflow;
    overlay.classList.remove("active");
    overlay.inert = true;
    if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
  };

  overlay.addEventListener("click", (event) => {
      if (event.target === overlay) {
        onPopupClose();
      }
    }, { signal });
  document
    .querySelector(".search-input-field-pre")
    .addEventListener("click", () => {
      searchInputDom.value = "";
      searchInputDom.focus();
      inputEventFunction();
    }, { signal });
  document
    .querySelector(".popup-btn-close")
    .addEventListener("click", onPopupClose, { signal });

  resultContent.addEventListener('click', (event) => { if (event.target.closest('a')) onPopupClose(); }, { signal });
  window.addEventListener('keydown', (event) => {
    if (event.isComposing || event.keyCode === 229) return;
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      if (overlay.classList.contains('active')) onPopupClose(); else openPopup();
      return;
    }
    if (!overlay.classList.contains('active')) return;
    if (event.key === 'Escape') { event.preventDefault(); onPopupClose(); }
    if (event.key === 'Tab') {
      const controls = [...overlay.querySelectorAll('button, input, a[href]')];
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    if (event.key === 'Enter' && document.activeElement === searchInputDom) resultContent.querySelector('a')?.click();
  }, { signal });
  signal.addEventListener('abort', onPopupClose, { once: true });
}
