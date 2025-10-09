/* delete mask */

"use strict";

hexo.extend.filter.register(
  "after_post_render",
  function (data) {
    const theme = this.theme;

    // Code to handle del tags
    const regPureDelTag = /<del(?:\s+[^>]*)?>((?:(?!<\/?del[\s>])[^])*)<\/del>/g;

    data.content = data.content.replace(
      regPureDelTag,
      function (match, html) {
        // Only add mask class when configured as true
        if (theme.config.articles.style.delete_mask === true) {
          return `<del class="mask">${html}</del>`;
        }
        return match;
      }
    );

    return data;
  },
  0
);
