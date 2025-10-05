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

// === Fonction pour créer une fenêtre modale ===
function createGuestModal(onSubmit) {
  const existing = document.getElementById("guestModal");
  if (existing) existing.remove();

  const modal = document.createElement("div");
  modal.id = "guestModal";
  modal.innerHTML = `
    <div class="guest-modal-overlay"></div>
    <div class="guest-modal">
      <h2>Connexion invité</h2>
      <label>Pseudo :</label>
      <input type="text" id="guestPseudo" placeholder="Votre pseudo">
      <label>Twitter :</label>
      <input type="text" id="guestTwitter" placeholder="@exemple">
      <div class="guest-actions">
        <button id="guestCancel">Annuler</button>
        <button id="guestSubmit">Envoyer</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // Style
  const style = document.createElement("style");
  style.textContent = `
    #guestModal {
      position: fixed;
      inset: 0;
      z-index: 99999999;
    }
    .guest-modal-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.75);
      backdrop-filter: blur(6px);
    }
    .guest-modal {
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      background: #1a1a1a;
      color: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 0 20px #f52584;
      width: 320px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      font-family: 'Futura LT Book', sans-serif;
      animation: fadeIn 0.25s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translate(-50%, -45%) scale(0.9); }
      to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    }
    .guest-modal h2 {
      color: #f52584;
      text-align: center;
      margin-bottom: 10px;
    }
    .guest-modal input {
      background: #2a2a2a;
      border: 1px solid #555;
      color: white;
      padding: 6px 8px;
      border-radius: 6px;
    }
    .guest-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 10px;
    }
    .guest-actions button {
      background: #f52584;
      border: none;
      color: white;
      padding: 6px 12px;
      border-radius: 6px;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    .guest-actions button:hover {
      opacity: 0.8;
    }
    #guestCancel {
      background: #555;
    }
  `;
  document.head.appendChild(style);

  // Actions
  modal.addEventListener("click", e => {
    if (e.target.classList.contains("guest-modal-overlay")) modal.remove();
  });
  document.getElementById("guestCancel").onclick = () => modal.remove();
  document.getElementById("guestSubmit").onclick = () => {
    const pseudo = document.getElementById("guestPseudo").value.trim();
    const twitter = document.getElementById("guestTwitter").value.trim();
    modal.remove();
    onSubmit(pseudo, twitter);
  };
}

// === Connexion OBS ===
document.getElementById("connectBtn").addEventListener("click", () => {
  // Ouvre la fenêtre de saisie pour l'invité du milieu
  createGuestModal(async (pseudo, twitter) => {
    // Envoie les infos à Google Apps Script
    const baseUrl = "https://script.google.com/macros/s/AKfycbygPQQrclL7rIB1FGkpPAwZujKK2d5kqlFjZnArIZFkOxrHqDz6Zt0-xzrIGgXBbZZowQ/exec";
    try {
      await fetch(`${baseUrl}?row=4&col=3&value=${encodeURIComponent(pseudo)}`);
      await fetch(`${baseUrl}?row=5&col=3&value=${encodeURIComponent(twitter)}`);
      console.log("✅ Données envoyées :", pseudo, twitter);
    } catch (err) {
      console.error("Erreur d’envoi :", err);
    }

    // Puis lance la connexion OBS (comportement normal)
    const ip = document.getElementById("obsIP")?.value.trim() || "localh
