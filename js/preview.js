// js/preview.js

// Sélection des wrappers et iframes
const previews = [
  { wrapper: document.getElementById("preview1").parentElement, iframe: document.getElementById("preview1") },
  { wrapper: document.getElementById("preview2").parentElement, iframe: document.getElementById("preview2") },
  { wrapper: document.getElementById("preview3").parentElement, iframe: document.getElementById("preview3") }
];

// Crée les contrôles au-dessus de chaque iframe
previews.forEach((p, i) => {
    const controls = document.createElement("div");
    controls.style.display = "flex";
    controls.style.gap = "4px";
    controls.style.marginBottom = "4px";

    // Input pour l'ID
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "ID VDO";
    input.style.flex = "1";
    input.value = "";

    // Bouton copy
    const copyBtn = document.createElement("button");
    copyBtn.textContent = "Copy";
    copyBtn.addEventListener("click", () => {
        const url = `https://vdo.ninja/?view=${input.value}`;
        navigator.clipboard.writeText(url);
    });

    // Bouton Connect
    const connectBtn = document.createElement("button");
    connectBtn.textContent = "Connect";
    connectBtn.addEventListener("click", () => {
        const url = `https://vdo.ninja/?push=${input.value}&quality=0&audiodevice=0&webcam`;
        window.open(url, "_blank");
    });

    // Bouton Refresh
    const refreshBtn = document.createElement("button");
    refreshBtn.textContent = "Refresh";
    refreshBtn.addEventListener("click", () => {
        p.iframe.src = `https://vdo.ninja/?view=${input.value}&autoplay=1`;
    });

    // Ajout au div controls
    controls.appendChild(input);
    controls.appendChild(copyBtn);
    controls.appendChild(connectBtn);
    controls.appendChild(refreshBtn);

    // Insère les controls avant l'iframe
    p.wrapper.insertBefore(controls, p.iframe);
});

// Fonction simple pour mettre à jour l'iframe depuis le JS
export function setPreview(index, id) {
    if(previews[index]) {
        previews[index].iframe.src = `https://vdo.ninja/?view=${id}&autoplay=1`;
        const input = previews[index].wrapper.querySelector("input");
        if(input) input.value = id;
    }
}
