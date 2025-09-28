// Sélection des iframes de preview
const previews = [
  document.getElementById("preview1"),
  document.getElementById("preview2"),
  document.getElementById("preview3")
];

/**
 * Met à jour l'iframe de preview.
 * @param {number} index - 0, 1 ou 2
 * @param {string} url - URL à afficher
 */
export function setPreview(index, url) {
  if (!previews[index]) return;

  // Ajouter autoplay si URL VDO Ninja
  const autoplayUrl = url.includes("?") ? `${url}&autoplay=1` : `${url}?autoplay=1`;
  previews[index].src = autoplayUrl;

  previews[index].style.width = "100%";
  previews[index].style.height = "100%";
}

// ajuste automatiquement le scale pour chaque iframe
function fitIframe(iframe) {
  const wrapper = iframe.parentElement;
  const wW = wrapper.clientWidth;
  const wH = wrapper.clientHeight;

  // largeur/hauteur de l'iframe vidéo (16/9 par défaut)
  const vW = 16;
  const vH = 9;

  const scaleW = wW / vW;
  const scaleH = wH / vH;
  const scale = Math.max(scaleW, scaleH);

  iframe.style.transform = `translate(-50%, -50%) scale(${scale})`;
}

// applique à toutes les previews
export function adjustPreviews() {
  const previews = [
    document.getElementById("preview1"),
    document.getElementById("preview2"),
    document.getElementById("preview3")
  ];
  previews.forEach(fitIframe);
}

// appel initial et on resize
window.addEventListener("resize", adjustPreviews);
adjustPreviews();

const previews = [
  { iframe: document.getElementById("preview1"), container: document.getElementById("preview1Container") },
  { iframe: document.getElementById("preview2"), container: document.getElementById("preview2Container") },
  { iframe: document.getElementById("preview3"), container: document.getElementById("preview3Container") }
];

// Crée la UI pour chaque iframe
previews.forEach((p, i) => {
  // Wrapper au-dessus de l'iframe
  const controls = document.createElement("div");
  controls.style.display = "flex";
  controls.style.gap = "4px";
  controls.style.marginBottom = "4px";

  // Input pour l'ID
  const input = document.createElement("input");
  input.placeholder = "Call ID";
  input.style.flex = "1";
  controls.appendChild(input);

  // Copy button
  const copyBtn = document.createElement("button");
  copyBtn.textContent = "Copy";
  copyBtn.addEventListener("click", () => {
    const url = `https://vdo.ninja/?view=${input.value}`;
    navigator.clipboard.writeText(url);
  });
  controls.appendChild(copyBtn);

  // Connect button
  const connectBtn = document.createElement("button");
  connectBtn.textContent = "Connect";
  connectBtn.addEventListener("click", () => {
    const url = `https://vdo.ninja/?push=${input.value}&quality=0&audiodevice=0&webcam`;
    window.open(url, "_blank");
  });
  controls.appendChild(connectBtn);

  // Reload button
  const reloadBtn = document.createElement("button");
  reloadBtn.textContent = "Reload";
  reloadBtn.addEventListener("click", () => {
    p.iframe.src = `https://vdo.ninja/?view=${input.value}&autoplay=1`;
  });
  controls.appendChild(reloadBtn);

  // Insère les contrôles avant l'iframe
  p.iframe.parentElement.insertBefore(controls, p.iframe);
});
