export function loadChat(channel) {
  if (!channel) return;
  const chatDiv = document.getElementById("chatFrame");

  // Reset
  chatDiv.innerHTML = "";

  // Création iframe chat-only
  const iframe = document.createElement("iframe");
  iframe.src = `https://www.twitch.tv/embed/${channel}/chat?parent=${location.hostname}`;
  iframe.width = "100%";
  iframe.height = "100%";
  iframe.frameBorder = "0";

  chatDiv.appendChild(iframe);
}

// Initialisation auto avec la valeur par défaut
window.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("chatChannel");
  loadChat(input.value);

  document.getElementById("loadChat").addEventListener("click", () => {
    loadChat(input.value);
  });
});
