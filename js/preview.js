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
      <h2>Connexion à l'interview</h2>
      <label>Pseudo :</label>
      <input type="text" id="guestPseudo" placeholder="Votre pseudo">
      <label>Twitter :</label>
      <input type="text" id="guestTwitter" placeholder="Votre Twitter">
      <div class="guest-actions">
        <button id="guestCancel">Annuler</button>
        <button id="guestSubmit">Envoyer</button>
      </div>
      <div id="guestLoading" style="display:none; flex-direction:column; align-items:center; gap:8px; margin-top:12px;">
        <div class="loader"></div>
        <div id="guestPercent" style="font-size:14px; color:var(--accent2); font-weight:bold;">0%</div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // Overlay style
  Object.assign(modal.style, {
    position: "fixed",
    inset: "0",
    background: "rgba(0,0,0,0.7)",
    zIndex: "99999999",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  });

  // Box style
  const box = modal.querySelector(".guest-modal");
  Object.assign(box.style, {
    background: "var(--panel)",
    color: "#fff",
    padding: "24px",
    borderRadius: "var(--card-radius)",
    width: "320px",
    boxShadow: "0 0 20px var(--accent2)",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    fontFamily: "Inter,system-ui,-apple-system,'Segoe UI',Roboto,'Helvetica Neue',Arial",
    alignItems: "center",
    textAlign: "center"
  });

  // Loader circulaire (CSS)
  const style = document.createElement("style");
  style.textContent = `
    .loader {
      border: 4px solid rgba(255,255,255,0.15);
      border-top: 4px solid var(--accent2);
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);

  // Inputs style
  const inputs = box.querySelectorAll("input");
  inputs.forEach(input => {
    Object.assign(input.style, {
      padding: "6px",
      borderRadius: "6px",
      border: "1px solid rgba(255,255,255,0.1)",
      background: "transparent",
      color: "#fff",
      width: "80%",
      textAlign: "center"
    });
  });

  // Labels style
  const labels = box.querySelectorAll("label");
  labels.forEach(label => {
    Object.assign(label.style, {
      width: "100%",
      textAlign: "center"
    });
  });

  // Buttons style
  const btns = box.querySelectorAll("button");
  btns.forEach(btn => {
    Object.assign(btn.style, {
      padding: "6px 12px",
      borderRadius: "6px",
      border: "none",
      background: "linear-gradient(90deg,var(--accent),var(--accent2))",
      color: "#07101a",
      cursor: "pointer",
      fontWeight: "bold",
      minWidth: "100px"
    });
  });

  // Boutons centrés
  const actions = box.querySelector(".guest-actions");
  Object.assign(actions.style, {
    display: "flex",
    justifyContent: "center",
    gap: "12px",
    width: "100%"
  });

  // Actions
  modal.querySelector("#guestCancel").onclick = () => modal.remove();
  modal.querySelector("#guestSubmit").onclick = async () => {
    let pseudo = document.getElementById("guestPseudo").value.trim();
    let twitter = document.getElementById("guestTwitter").value.trim();
    if (twitter && !twitter.startsWith("@")) twitter = "@" + twitter;

    // Masquer tout sauf le chargement
    box.querySelectorAll("h2, label, input, .guest-actions").forEach(el => el.style.display = "none");
    const loader = document.getElementById("guestLoading");
    loader.style.display = "flex";

    const percent = document.getElementById("guestPercent");
    percent.textContent = "0%";

    // Animation de progression
    await new Promise(r => setTimeout(r, 500));
    percent.textContent = "50%";

    await new Promise(r => setTimeout(r, 500));
    percent.textContent = "100%";

    // Appel de la fonction finale
    await onSubmit(pseudo, twitter);
    modal.remove();
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
    const url = `https://vdo.ninja/?view=${input.value}&bitrate=2500`;
    navigator.clipboard.writeText(url);
  });

  const connectBtn = makeIconBtn("cast", "Connecter la caméra (push)");

  // Spécifique à la preview 2
  if (p.iframe.id === "preview2") {
    connectBtn.addEventListener("click", () => {
      if (!input.value.trim()) return;
      createGuestModal(async (pseudo, twitter) => {
        const baseUrl = "https://script.google.com/macros/s/AKfycbygPQQrclL7rIB1FGkpPAwZujKK2d5kqlFjZnArIZFkOxrHqDz6Zt0-xzrIGgXBbZZowQ/exec";
        try {
          await Promise.all([
            fetch(`${baseUrl}?row=4&col=3&value=${encodeURIComponent(pseudo)}`),
            fetch(`${baseUrl}?row=5&col=3&value=${encodeURIComponent(twitter)}`)
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
    connectBtn.addEventListener("click", () => {
      if (!input.value.trim()) return;
      const url = `https://vdo.ninja/?push=${input.value}&quality=0&audiodevice=0&webcam`;
      window.open(url, "_blank");
    });
  }

  const refreshBtn = makeIconBtn("refresh-ccw", "Rafraîchir la preview");
  refreshBtn.addEventListener("click", () => {
    if (!input.value.trim()) return;
    p.iframe.src = `https://vdo.ninja/?view=${input.value}&autoplay=1&muted=1&bitrate=2500`;
  });

  controls.appendChild(input);
  controls.appendChild(copyBtn);
  controls.appendChild(connectBtn);
  controls.appendChild(refreshBtn);
});

// API publique pour changer la preview par ID
export function setPreview(index, id) {
  if (previews[index]) {
    previews[index].iframe.src = `https://vdo.ninja/?view=${id}&autoplay=1&muted=1&bitrate=2500`;
    const input = previews[index].wrapper.querySelector("input");
    if (input) input.value = id;
  }
}

// Active les icônes Lucide si dispo
if (window.lucide) window.lucide.createIcons();
