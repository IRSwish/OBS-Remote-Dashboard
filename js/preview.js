// helper pour créer un bouton icône stylé
function makeIconBtn(iconName, title) {
  const btn = document.createElement("button");
  btn.className = "icon-btn";
  btn.innerHTML = `<i data-lucide="${iconName}"></i>`;
  btn.title = title;
  return btn;
}

// helper pour créer la modale invité
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

  Object.assign(modal.style, {
    position: "fixed",
    inset: "0",
    background: "rgba(0,0,0,0.7)",
    zIndex: "99999999",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  });

  const box = modal.querySelector(".guest-modal");
  Object.assign(box.style, {
    background: "#1a1a1a",
    color: "white",
    padding: "24px",
    borderRadius: "10px",
    width: "300px",
    boxShadow: "0 0 20px #f52584",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  });

  modal.querySelector("#guestCancel").onclick = () => modal.remove();
  modal.querySelector("#guestSubmit").onclick = () => {
    const pseudo = document.getElementById("guestPseudo").value.trim();
    const twitter = document.getElementById("guestTwitter").value.trim();
    modal.remove();
    onSubmit(pseudo, twitter);
  };
}

const previews = [
  { wrapper: document.getElementById("preview1").parentElement, iframe: document.getElementById("preview1") },
  { wrapper: document.getElementById("preview2").parentElement, iframe: document.getElementById("preview2") },
  { wrapper: document.getElementById("preview3").parentElement, iframe: document.getElementById("preview3") }
];

previews.forEach((p) => {
  let controls = p.wrapper.querySelector(".preview-controls");
  if (!controls) {
    controls = document.createElement("div");
    controls.className = "preview-controls";
    p.wrapper.insertBefore(controls, p.iframe);
  }

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "ID VDO";

  const copyBtn = makeIconBtn("copy", "Copier le lien OBS");
  copyBtn.addEventListener("click", () => {
    if (!input.value.trim()) return;
    const url = `https://vdo.ninja/?view=${input.value}`;
    navigator.clipboard.writeText(url);
  });

  const connectBtn = makeIconBtn("cast", "Connecter la caméra (push)");

  // ✅ Modification pour la deuxième preview
  if (p.iframe.id === "preview2") {
    connectBtn.addEventListener("click", () => {
      if (!input.value.trim()) return;

      createGuestModal(async (pseudo, twitter) => {
        const baseUrl = "https://script.google.com/macros/s/AKfycbygPQQrclL7rIB1FGkpPAwZujKK2d5kqlFjZnArIZFkOxrHqDz6Zt0-xzrIGgXBbZZowQ/exec";
        try {
          // Envoi du pseudo et du Twitter avant l'ouverture du nouvel onglet
          await Promise.all([
            fetch(`${baseUrl}?row=4&col=3&value=${encodeURIComponent(pseudo)}`),
            fetch(`${baseUrl}?row=5&col=3&value=@${encodeURIComponent(twitter)}`)
          ]);
          console.log("✅ Données envoyées :", pseudo, twitter);
        } catch (err) {
          console.error("Erreur d’envoi :", err);
        }

        const url = `https://vdo.ninja/?push=${input.value}&quality=0&audiodevice=0&webcam`;
        window.open(url, "_blank");
      });
    });
  } else {
    // Comportement normal pour les autres previews
    connectBtn.addEventListener("click", () => {
      if (!input.value.trim()) return;
      const url = `https://vdo.ninja/?push=${input.value}&quality=0&audiodevice=0&webcam`;
      window.open(url, "_blank");
    });
  }

  const refreshBtn = makeIconBtn("refresh-ccw", "Rafraîchir la preview");
  refreshBtn.addEventListener("click", () => {
    if (!input.value.trim()) return;
    p.iframe.src = `https://vdo.ninja/?view=${input.value}&autoplay=1&muted=1`;
  });

  controls.appendChild(input);
  controls.appendChild(copyBtn);
  controls.appendChild(connectBtn);
  controls.appendChild(refreshBtn);
});

// API publique pour changer la preview par ID
export function setPreview(index, id) {
  if (previews[index]) {
    previews[index].iframe.src = `https://vdo.ninja/?view=${id}&autoplay=1&muted=1`;
    const input = previews[index].wrapper.querySelector("input");
    if (input) input.value = id;
  }
}

// Active les icônes Lucide si dispo
if (window.lucide) window.lucide.createIcons();
