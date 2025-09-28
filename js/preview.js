// js/preview.js

// Sélection des iframes de preview
const previews = [
  document.getElementById("preview1"),
  document.getElementById("preview2"),
  document.getElementById("preview3")
];

/**
 * Met à jour l'iframe de preview.
 * @param {number} index - 0, 1 ou 2
 * @param {string} url - URL ou chemin à afficher
 */
export function setPreview(index, url) {
  if(previews[index]) previews[index].src = url;
}
