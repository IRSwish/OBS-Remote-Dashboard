export function loadChat(channel) {
  if (!channel) return;
  const chatDiv = document.getElementById("chatFrame");
  chatDiv.innerHTML = "";

  const iframe = document.createElement("iframe");
  iframe.src = `https://www.twitch.tv/embed/${channel}/chat?parent=irswish.github.io&theme=dark`;
  iframe.width = "100%";
  iframe.height = "100%";
  iframe.frameBorder = "0";

  chatDiv.appendChild(iframe);
}

window.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("chatChannel");
  loadChat(input.value);

  document.getElementById("loadChat").addEventListener("click", () => {
    loadChat(input.value);
  });
});

