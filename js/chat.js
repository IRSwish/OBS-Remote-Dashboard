let chatEmbed = null;

export function loadChat(channel) {
  if (!channel) return;
  const chatDiv = document.getElementById("chatFrame");

  // reset le container
  chatDiv.innerHTML = "";

  // créer l’embed Twitch avec chat uniquement et mode sombre
  chatEmbed = new Twitch.Embed("chatFrame", {
    width: "100%",
    height: "100%",
    channel: channel,
    layout: "chat",      // chat seul
    theme: "dark",       // force dark mode
    parent: ["irswish.github.io"] // ton domaine GitHub Pages
  });
}

// initialisation auto avec la valeur par défaut de l’input
window.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("chatChannel");
  loadChat(input.value);

  document.getElementById("loadChat").addEventListener("click", () => {
    loadChat(input.value);
  });
});
