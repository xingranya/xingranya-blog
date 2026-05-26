/*
author: @jiangwen5945 & EvanNotFound
*/
export const config = {
  usrTypeSpeed: theme.home_banner.subtitle.typing_speed,
  usrBackSpeed: theme.home_banner.subtitle.backing_speed,
  usrBackDelay: theme.home_banner.subtitle.backing_delay,
  usrStartDelay: theme.home_banner.subtitle.starting_delay,
  usrLoop: theme.home_banner.subtitle.loop,
  usrSmartBackspace: theme.home_banner.subtitle.smart_backspace,
  usrHitokotoAPI: theme.home_banner.subtitle.hitokoto.api,
};

function createTyped(id, strings, options) {
  if (!document.getElementById(id) || !strings || strings.length === 0) {
    return;
  }

  new Typed('#' + id, {
    strings,
    typeSpeed: options.usrTypeSpeed || 100,
    smartBackspace: options.usrSmartBackspace || false,
    backSpeed: options.usrBackSpeed || 80,
    backDelay: options.usrBackDelay || 1500,
    loop: options.usrLoop || false,
    startDelay: options.usrStartDelay || 500,
  });
}

export default function initTyped(id) {
  const options = {
    usrTypeSpeed: config.usrTypeSpeed,
    usrBackSpeed: config.usrBackSpeed,
    usrBackDelay: config.usrBackDelay,
    usrStartDelay: config.usrStartDelay,
    usrLoop: config.usrLoop,
    usrSmartBackspace: config.usrSmartBackspace,
    usrHitokotoAPI: config.usrHitokotoAPI,
  };

  const sentenceList = [...theme.home_banner.subtitle.text];

  if (theme.home_banner.subtitle.hitokoto.enable) {
    fetch(options.usrHitokotoAPI)
      .then((response) => response.json())
      .then((data) => {
        if (data.from_who && theme.home_banner.subtitle.hitokoto.show_author) {
          createTyped(id, [data.hitokoto + '——' + data.from_who], options);
        } else {
          createTyped(id, [data.hitokoto], options);
        }
      })
      .catch((error) => {
        console.error(error);
        createTyped(id, sentenceList, options);
      });
  } else {
    createTyped(id, sentenceList, options);
  }
}
