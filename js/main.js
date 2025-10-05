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

// === Création d'une petite fenêtre modale ===
function createGuestModal(onSubmit) {
  // Si la modale existe déjà, on la supprime
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

  // Style rapide intégré
  const style = document.createElement("style");
  style.textContent = `
    .guest-modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.6);
      backdrop-filter: blur(4px);
    }
    .guest-modal {
      position: fixed;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      background: #1a1a1a;
      color: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 0 15px #f52584;
      width: 300px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      z-index: 9999;
      font-family: 'Futura LT Book', sans-serif;
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

  // Gestion des boutons
  document.getElementById("guestCancel").onclick = () => modal.remove();
  document.getElementById("guestSubmit").onclick = () => {
    const pseudo = document.getElementById("guestPseudo").value.trim();
    const twitter = document.getElementById("guestTwitter").value.trim();
    modal.remove();
    onSubmit(pseudo, twitter);
  };
}

// === Connexion OBS ===
document.getElementById("connectBtn").addEventListener("click", async () => {
  const ip = document.getElementById("obsIP").value.trim();
  const pass = document.getElementById("obsPass").value.trim();
  connectOBS(ip, pass);

  // Vérifie si la preview du milieu correspond à l'invité
  const middlePreviewSrc = document.getElementById("preview2").src;
  const isGuest = middlePreviewSrc.includes("GuestITW
