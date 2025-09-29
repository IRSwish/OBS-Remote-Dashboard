let chatEmbed = null;

export function loadChat(channel) {
  if (!channel) return;
  const chatDiv = document.getElementById("chatFrame");

  // reset le container
  chatDiv.innerHTML = "";

  // créer l’embed Twitch (seulement le chat)
  chatEmbed = new Twitch.Embed("chatFrame", {
    width: "100%",
    height: "100%",
    channel: channel,
    layout: "chat",
    theme: "dark"
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
