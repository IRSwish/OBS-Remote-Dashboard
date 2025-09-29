let chatEmbed = null;

export function loadChat(channel) {
  if (!channel) return;
  const chatDiv = document.getElementById("chatFrame");
  chatDiv.innerHTML = "";

  chatEmbed = new Twitch.Embed("chatFrame", {
    width: "100%",
    height: "100%",
    channel: channel,
    layout: "chat",      // chat seul
    theme: "dark",       // dark mode forcé
    parent: ["irswish.github.io"] // ton domaine exact GitHub Pages
  });
}

// initialisation auto
window.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("chatChannel");
  loadChat(input.value);

  document.getElementById("loadChat").addEventListener("click", () => {
    loadChat(input.value);
  });
});
