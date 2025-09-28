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
