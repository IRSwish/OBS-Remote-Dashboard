// js/preview.js

const previews = [
  { wrapper: document.getElementById("preview1").parentElement, iframe: document.getElementById("preview1") },
  { wrapper: document.getElementById("preview2").parentElement, iframe: document.getElementById("preview2") },
  { wrapper: document.getElementById("preview3").parentElement, iframe: document.getElementById("preview3") }
];

previews.forEach((p, i) => {
    const controls = p.wrapper.querySelector(".preview-controls");

    // Input pour l'ID uniquement
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "ID VDO";

    // Bouton copy (clipboard)
    const copyBtn = document.createElement("button");
    copyBtn.innerHTML = "📋"; // Icône clipboard
    copyBtn.title = "Copier le lien OBS";
    copyBtn.addEventListener("click", () => {
        if (!input.value.trim()) return;
        const url = `https://vdo.ninja/?view=${input.value}`;
        navigator.clipboard.writeText(url);
    });

    // Bouton connect (push stream)
    const connectBtn = document.createElement("button");
    connectBtn.innerHTML = "🎥"; // Icône caméra
    connectBtn.title = "Connecter la caméra";
    connectBtn.addEventListener("click", () => {
        if (!input.value.trim()) return;
        const url = `https://vdo.ninja/?push=${input.value}&quality=0&audiodevice=0&webcam`;
        window.open(url, "_blank");
    });

    // Bouton refresh (reload iframe)
    const refreshBtn = document.createElement("button");
    refreshBtn.innerHTML = "🔄"; // Icône refresh
    refreshBtn.title = "Rafraîchir la preview";
    refreshBtn.addEventListener("click", () => {
        if (!input.value.trim()) return;
        p.iframe.src = `https://vdo.ninja/?view=${input.value}&autoplay=1`;
    });

    controls.appendChild(input);
    controls.appendChild(copyBtn);
    controls.appendChild(connectBtn);
    controls.appendChild(refreshBtn);
});

// API publique
export function setPreview(index, id) {
    if(previews[index]) {
        previews[index].iframe.src = `https://vdo.ninja/?view=${id}&autoplay=1`;
        const input = previews[index].wrapper.querySelector("input");
        if(input) input.value = id; // ✅ On ne met que l’ID dans l’input
    }
}
