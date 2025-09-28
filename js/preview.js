// js/preview.js

// helper pour créer un bouton icône
function makeIconBtn(iconName, title) {
    const btn = document.createElement("button");
    btn.className = "icon-btn";
    btn.innerHTML = `<i data-lucide="${iconName}"></i>`;
    btn.title = title;
    return btn;
}

const previews = [
    { wrapper: document.getElementById("preview1").parentElement, iframe: document.getElementById("preview1") },
    { wrapper: document.getElementById("preview2").parentElement, iframe: document.getElementById("preview2") },
    { wrapper: document.getElementById("preview3").parentElement, iframe: document.getElementById("preview3") }
];

previews.forEach((p) => {
    // Crée ou récupère la barre de contrôle
    let controls = p.wrapper.querySelector(".preview-controls");
    if(!controls) {
        controls = document.createElement("div");
        controls.className = "preview-controls";
        p.wrapper.insertBefore(controls, p.iframe);
    }

    // Input pour l'ID VDO
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "ID VDO";

    // Bouton Copy
    const copyBtn = makeIconBtn("copy", "Copier le lien OBS");
    copyBtn.addEventListener("click", () => {
        if(!input.value.trim()) return;
        const url = `https://vdo.ninja/?view=${input.value}`;
        navigator.clipboard.writeText(url);
    });

    // Bouton Connect
    const connectBtn = makeIconBtn("cast", "Connecter la caméra (push)");
    connectBtn.addEventListener("click", () => {
        if(!input.value.trim()) return;
        const url = `https://vdo.ninja/?push=${input.value}&quality=0&audiodevice=0&webcam`;
        window.open(url, "_blank");
    });

    // Bouton Refresh
    const refreshBtn = makeIconBtn("refresh-ccw", "Rafraîchir la preview");
    refreshBtn.addEventListener("click", () => {
        if(!input.value.trim()) return;
        p.iframe.src = `https://vdo.ninja/?view=${input.value}&autoplay=1`;
    });

    // Ajoute les éléments à la barre de contrôle
    controls.appendChild(input);
    controls.appendChild(copyBtn);
    controls.appendChild(connectBtn);
    controls.appendChild(refreshBtn);
});

// API publique pour changer le preview par ID
export function setPreview(index, id) {
    if(previews[index]) {
        previews[index].iframe.src = `https://vdo.ninja/?view=${id}&autoplay=1`;
        const input = previews[index].wrapper.querySelector("input");
        if(input) input.value = id; // on ne met que l'ID
    }
}

// Active les icônes Lucide si disponibles
if(window.lucide) window.lucide.createIcons();
