let chatEmbed = null;

export function loadChat(channel) {
  if (!channel) return;
  document.getElementById("twitch-embed").innerHTML = ""; // reset

  chatEmbed = new Twitch.Embed("twitch-embed", {
    width: "100%",
    height: "100%",
    channel: channel,
    layout: "chat", // juste le chat
    theme: "dark"   // optionnel: dark ou light
  });
}
