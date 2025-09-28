import { sendRequest, ws } from './obs.js';
import { saveSceneOrder } from './utils.js';

const sceneList = document.getElementById("sceneList");
export const scenesState = {};

// Écoute les messages OBS
document.addEventListener("obsMessage", e => {
    const msg = e.detail;
    if(msg.op === 7 && msg.d.requestId === "scenes" && msg.d.responseData?.scenes){
        createScenes(msg.d.responseData.scenes);
    }
});

// Création de la liste de scènes
export function createScenes(obsScenes){
    sceneList.innerHTML = "";
    const saved = JSON.parse(localStorage.getItem("sceneOrder") || "[]");
    const savedNames = saved.map(item => item.name);

    // D’abord recrée tous les éléments sauvegardés
    if(saved.length){
        saved.forEach(item => {
            if(item.type === "separator") addSeparator(item.name, item.expanded);
            else if(obsScenes.find(s => s.sceneName === item.name)) addScene(item.name);
        });
    }

    // Puis ajoute les scènes OBS non sauvegardées
    obsScenes.forEach(s => {
        if(!savedNames.includes(s.sceneName)) addScene(s.sceneName);
    });

    // Ajuste l’affichage selon l’état des séparateurs
    Array.from(sceneList.children).forEach(el => {
        if(el.classList.contains("separator")){
            let next = el.nextElementSibling;
            while(next && !next.classList.contains("separator")){
                next.style.display = el.classList.contains("expanded") ? "block" : "none";
                next = next.nextElementSibling;
            }
        }
    });
}

// Ajout d’une scène
export function addScene(name){
    const btn = document.createElement("button");
    btn.className = "scene";
    btn.textContent = name;
    sceneList.appendChild(btn);

    let clickTimeout;
    btn.addEventListener("click", () => {
        if(clickTimeout) return;
        clickTimeout = setTimeout(() => {
            clickTimeout = null;
            if(ws && ws.readyState === 1){
                sendRequest("SetCurrentPreviewScene","prev_"+name,{sceneName:name});
            }
            document.querySelectorAll(".scene").forEach(s => s.classList.remove("preview"));
            btn.classList.add("preview");
        }, 250);
    });

    btn.addEventListener("dblclick", () => {
        if(clickTimeout){ clearTimeout(clickTimeout); clickTimeout = null; }
        if(ws && ws.readyState === 1){
            sendRequest("SetCurrentProgramScene","prog_"+name,{sceneName:name});
        }
        document.querySelectorAll(".scene").forEach(s => s.classList.remove("program","preview"));
        btn.classList.add("program");
        document.getElementById("programScene").textContent = "PRG: " + name;
    });

    addDragEvents(btn);
}

// Ajout d’un séparateur avec input actif
export function addSeparator(name = "Nouveau séparateur", expanded = true){
    const div = document.createElement("div");
    div.className = "separator";
    if(expanded) div.classList.add("expanded");
    div.innerHTML = `<span class="title" contenteditable="true">${name}</span><button class="deleteBtn">×</button>`;
    sceneList.appendChild(div);

    // Met le focus directement sur le nom
    const title = div.querySelector(".title");
    title.focus();
    document.execCommand('selectAll', false, null);

    // Toggle expand/collapse
    div.addEventListener("click", e => {
        if(e.target.classList.contains("deleteBtn")) return;
        div.classList.toggle("expanded");
        let next = div.nextElementSibling;
        while(next && !next.classList.contains("separator")){
            next.style.display = div.classList.contains("expanded") ? "block" : "none";
            next = next.nextElementSibling;
        }
        saveSceneOrder();
    });

    // Rename automatique lors de la perte de focus
    title.addEventListener("blur", () => saveSceneOrder());
    title.addEventListener("keydown", e => {
        if(e.key === "Enter"){ e.preventDefault(); title.blur(); }
    });

    // Delete
    div.querySelector(".deleteBtn").addEventListener("click", e => {
        e.stopPropagation();
        div.remove();
        saveSceneOrder();
    });

    addDragEvents(div);
}

// Drag & Drop
function addDragEvents(el){
    el.draggable = true;
    el.addEventListener("dragstart", e => {
        const children = Array.from(sceneList.children);
        const index = children.indexOf(el);
        let dragGroup = [el];

        // Si c'est un séparateur, ajoute toutes les scènes qui suivent
        if(el.classList.contains("separator")){
            let next = el.nextElementSibling;
            while(next && !next.classList.contains("separator")){
                dragGroup.push(next);
                next = next.nextElementSibling;
            }
        }

        // On stocke les indices et le groupe
        e.dataTransfer.setData("text/plain", JSON.stringify({
            indices: dragGroup.map(n => children.indexOf(n))
        }));
    });

    el.addEventListener("dragover", e => e.preventDefault());

    el.addEventListener("drop", e => {
        e.preventDefault();
        const data = JSON.parse(e.dataTransfer.getData("text/plain"));
        const fromIndices = data.indices;
        const children = Array.from(sceneList.children);
        const toIndex = children.indexOf(el);

        if(fromIndices.includes(toIndex)) return;

        // Récupère tous les nodes à déplacer
        const nodes = fromIndices.map(i => children[i]);

        // Insertion
        if(fromIndices[0] < toIndex){
            sceneList.insertBefore(nodes[0], children[toIndex].nextSibling);
            for(let i=1;i<nodes.length;i++) sceneList.insertBefore(nodes[i], nodes[0].nextSibling);
        } else {
            sceneList.insertBefore(nodes[0], children[toIndex]);
            for(let i=1;i<nodes.length;i++) sceneList.insertBefore(nodes[i], nodes[0].nextSibling);
        }

        saveSceneOrder();
    });
}