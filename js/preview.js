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
