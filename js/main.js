import './mixer.js';
import { connectOBS, sendRequest, onOBSConnected } from './obs.js';
import { addSeparator } from './scenes.js';
import { loadChat } from './chat.js';
import { setPreview } from './preview.js';

let streamStartTime = null;

// === Préviews par défaut ===
setPreview(0, "69CJFPh");
setPreview(1, "GuestITWR6EMLS22025");
setPreview(2, "rvFr2XN");

// === Connexion OBS ===
document.getElementById("connectBtn").addEventListener("click", async () => {
  const ip = document.getElementById("obsIP").value.trim();
  const pass = document.getElementById("obsPass").value.trim();
  connectOBS(ip, pass);

  // Vérifie si la preview du milieu correspond à l'invité
  const middlePreviewSrc = document.getElementById("preview2").src;
  const isGuest = middlePreviewSrc.includes("GuestITWR6EMLS22025");

  if (isGuest) {
    const pseudo = prompt("Entrez votre pseudo :");
    if (!pseudo) return;

    const twitter = prompt("Entrez votre compte Twitter (sans @) :");
    if (twitter === null) return;

    try {
      const baseUrl = "https://script.google.com/macros/s/AKfycbygPQQrclL7rIB1FGkpPAwZujKK2d5kqlFjZnArIZFkOxrHqDz6Zt0-xzrIGgXBbZZowQ/exec";

      // Envoi du pseudo (row 4, col 3)
      await fetch(`${baseUrl}?row=4&col=3&value=${encodeURIComponent(pseudo)}`);

      // Envoi du twitter (row 5, col 3)
      await fetch(`${baseUrl}?row=5&col=3&value=${encodeURIComponent(twitter)}`);

      alert("✅ Informations envoyées avec succès !");
    } catch (err) {
      console.error(err);
      alert("❌ Erreur lors de l’envoi des données.");
    }
  }
});

// === Ajouter un séparateur ===
document.getElementById("addSeparatorBtn").addEventListener("click", () => addSeparator("Nouveau séparateur"));

// === Chat ===
document.getElementById("loadChat").addEventListener("click", () => {
  const ch = document.getElementById("chatChannel").value.trim();
  loadChat(ch);
});

// === Stats OBS ===
onOBSConnected(() => {
  setInterval(() => sendRequest("GetStats", "stats"), 1000);
});

document.addEventListener("obsMessage", e => {
  const msg = e.detail;
  if (msg.op === 7 && msg.d.requestId === "stats") {
    const stats = msg.d.responseData || msg.d;

    let cpu = (stats.cpuUsage ?? 0).toFixed(1);
    let ram = ((stats.memoryUsage ?? 0) / 1024 / 1024).toFixed(1);
    let fps = (stats.fps ?? 0).toFixed(1);
    let dropped = stats.droppedFrames ?? 0;
    let totalFrames = stats.renderTotalFrames ?? 1;
    let droppedPct = ((dropped / totalFrames) * 100).toFixed(1);

    const elStats = document.getElementById("cpuFps");
    if (elStats)
      elStats.textContent = `CPU ${cpu}% • RAM ${ram} MB • FPS ${fps} • Dropped ${dropped} (${droppedPct}%)`;

    const elStatus = document.getElementById("liveStatus");
    if (stats.streaming) {
      if (!streamStartTime)
        streamStartTime = Date.now() - stats.streamingTime * 1000;
      const elapsed = Date.now() - streamStartTime;
      const h = Math.floor(elapsed / 3600000)
        .toString()
        .padStart(2, "0");
      const m = Math.floor((elapsed % 3600000) / 60000)
        .toString()
        .padStart(2, "0");
      const s = Math.floor((elapsed % 60000) / 1000)
        .toString()
        .padStart(2, "0");
      if (elStatus) elStatus.textContent = `LIVE: ${h}:${m}:${s}`;
    } else {
      streamStartTime = null;
      if (elStatus) elStatus.textContent = "CONNECTED";
    }
  }
});
