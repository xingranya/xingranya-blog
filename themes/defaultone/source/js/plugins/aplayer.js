(function() {
  const audioList = [];
  const isFixed = theme.plugins.aplayer.type === "fixed";
  const isMini = theme.plugins.aplayer.type === "mini";
  const container = document.getElementById("aplayer");

  const labelControls = () => {
    const labels = [
      [".aplayer-icon-play, .aplayer-icon-pause", "播放或暂停"],
      [".aplayer-icon-volume-down", "调整音量"],
      [".aplayer-icon-order", "切换播放顺序"],
      [".aplayer-icon-loop", "切换循环模式"],
      [".aplayer-icon-lrc", "切换歌词"],
      [".aplayer-icon-menu", "打开播放列表"],
      [".aplayer-icon-back", "上一首"],
      [".aplayer-icon-forward", "下一首"],
      [".aplayer-miniswitcher button", "展开或收起播放器"],
    ];

    labels.forEach(([selector, label]) => {
      container?.querySelectorAll(selector).forEach((control) => {
        if (control.tagName !== "BUTTON") return;
        control.setAttribute("aria-label", label);
        control.setAttribute("title", label);
      });
    });

    container?.querySelectorAll("button").forEach((button, index) => {
      if (!button.getAttribute("aria-label")) {
        button.setAttribute("aria-label", `音频播放器操作 ${index + 1}`);
      }
    });
  };

  for (const audio of theme.plugins.aplayer.audios) {
    const audioObj = {
      name: audio.name,
      artist: audio.artist,
      url: audio.url,
      cover: audio.cover,
      lrc: audio.lrc,
      theme: audio.theme,
    };
    audioList.push(audioObj);
  }

  if (isMini) {
    new APlayer({
      container,
      mini: true,
      preload: "none",
      audio: audioList,
    });
  } else if (isFixed) {
    const hasLrc = audioList.some((audio) => audio.lrc);
    const player = new APlayer({
      container,
      fixed: true,
      preload: "none",
      lrcType: hasLrc ? 3 : 0,
      audio: audioList,
    });
    if (hasLrc) {
      document.querySelector(".aplayer-icon-lrc").click();
    }
  }

  labelControls();
})();
