import { sendRequest, ws } from './obs.js';
import { saveSceneOrder as saveOrder } from './utils.js';

const sceneList = document.getElementById("sceneList");

// ---------------------
// OBS messages
// ---------------------
document.addEventListener("obsMessage", e => {
    const msg = e.detail;
    if(msg.op === 7 && msg.d.requestId === "scenes" && msg.d.responseData?.scenes){
        createScenes(msg.d.responseData.scenes);
    }
});

// ---------------------
// Create scenes from OBS or localStorage
// ---------------------
export function createScenes(scenes){
    sceneList.innerHTML = "";
    const saved = JSON.parse(localStorage.getItem("sceneOrder") || "[]");
    const obsSceneNames = scenes.map(s => s.sceneName);

    if(saved.length){
        saved.forEach(item => {
            if(item.type === "separator") addSeparator(item.name, item.expanded, item.children);
            else addScene(item.name);
        });
    } else {
        scenes.forEach(s => addScene(s.sceneName));
    }

    // Afficher les scènes non catégorisées
    obsSceneNames.forEach(name => {
        if(!Array.from(sceneList.children).some(c => c.textContent === name)){
            addScene(name);
        }
    });

    // Adjust display based on expanded/collapsed
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

// ---------------------
// Add a single scene
// ---------------------
function addScene(name){
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
                sendRequest("SetCurrentPreviewScene", "prev_" + name, { sceneName: name });
            }
            document.querySelectorAll(".scene").forEach(s => s.classList.remove("preview"));
            btn.classList.add("preview");
        }, 250);
    });

    btn.addEventListener("dblclick", () => {
        if(clickTimeout){ clearTimeout(clickTimeout); clickTimeout = null; }
        if(ws && ws.readyState === 1){
            sendRequest("SetCurrentProgramScene", "prog_" + name, { sceneName: name });
        }
        document.querySelectorAll(".scene").forEach(s => s.classList.remove("program", "preview"));
        btn.classList.add("program");
        document.getElementById("programScene").textContent = "PRG: " + name;
    });

    addSceneDragEvents(btn);
}

// ---------------------
// Add a separator
// ---------------------
export function addSeparator(name, expanded = true, children = []){
    const div = document.createElement("div");
    div.className = "separator";
    if(expanded) div.classList.add("expanded");
    div.innerHTML = `<span class="title">${name}</span><button class="deleteBtn">×</button>`;
    sceneList.appendChild(div);

    // Add child scenes
    children.forEach(c => addScene(c));

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

    // Rename separator
    div.querySelector(".title").addEventListener("dblclick", e => {
        e.stopPropagation();
        const newName = prompt("Renommer le séparateur :", div.querySelector(".title").textContent);
        if(newName) div.querySelector(".title").textContent = newName;
        saveSceneOrder();
    });

    // Delete separator + its scenes
    div.querySelector(".deleteBtn").addEventListener("click", e => {
        e.stopPropagation();
        let next = div.nextElementSibling;
        while(next && !next.classList.contains("separator")){
            const tmp = next.nextElementSibling;
            next.remove();
            next = tmp;
        }
        div.remove();
        saveSceneOrder();
    });

    addSeparatorDragEvents(div);
}

// ---------------------
// Drag & Drop for separators
// ---------------------
function addSeparatorDragEvents(el){
    el.draggable = true;

    el.addEventListener("dragstart", e => {
        const children = [];
        let next = el.nextElementSibling;
        while(next && !next.classList.contains("separator")){
            children.push(next);
            next = next.nextElementSibling;
        }
        e.dataTransfer.setData("text/plain", JSON.stringify({
            type: "separator",
            index: Array.from(sceneList.children).indexOf(el),
            childIndexes: children.map(c => Array.from(sceneList.children).indexOf(c))
        }));
    });

    el.addEventListener("dragover", e => e.preventDefault());

    el.addEventListener("drop", e => {
        e.preventDefault();
        const data = JSON.parse(e.dataTransfer.getData("text/plain"));
        const toIndex = Array.from(sceneList.children).indexOf(el);
        if(data.type !== "separator" || data.index === toIndex) return;

        const moving = [sceneList.children[data.index], ...data.childIndexes.map(i => sceneList.children[i])];

        if(data.index < toIndex){
            sceneList.insertBefore(moving[0], sceneList.children[toIndex].nextSibling);
            for(let i=1; i<moving.length; i++) sceneList.insertBefore(moving[i], moving[i-1].nextSibling);
        } else {
            sceneList.insertBefore(moving[0], sceneList.children[toIndex]);
            for(let i=1; i<moving.length; i++) sceneList.insertBefore(moving[i], moving[i-1].nextSibling);
        }

        saveSceneOrder();
    });
}

// ---------------------
// Drag & Drop for individual scenes
// ---------------------
function addSceneDragEvents(el){
    el.draggable = true;

    el.addEventListener("dragstart", e => {
        e.dataTransfer.setData("text/plain", JSON.stringify({
            type: "scene",
            index: Array.from(sceneList.children).indexOf(el)
        }));
    });

    el.addEventListener("dragover", e => e.preventDefault());

    el.addEventListener("drop", e => {
        e.preventDefault();
        const data = JSON.parse(e.dataTransfer.getData("text/plain"));
        if(data.type !== "scene") return;

        const fromIndex = data.index;
        const toIndex = Array.from(sceneList.children).indexOf(el);
        if(fromIndex === toIndex) return;

        const moving = sceneList.children[fromIndex];

        // Check if dropping onto a separator
        if(el.classList.contains("separator")){
            let insertAfter = el;
            while(insertAfter.nextElementSibling && !insertAfter.nextElementSibling.classList.contains("separator")){
                insertAfter = insertAfter.nextElementSibling;
            }
            sceneList.insertBefore(moving, insertAfter.nextElementSibling);
        } else {
            // Drop between scenes
            if(fromIndex < toIndex) sceneList.insertBefore(moving, sceneList.children[toIndex].nextSibling);
            else sceneList.insertBefore(moving, sceneList.children[toIndex]);
        }

        saveSceneOrder();
    });
}

// ---------------------
// Save scene/separator order
// ---------------------
export function saveSceneOrder(){
    const arr = [];
    let i = 0;
    while(i < sceneList.children.length){
        const c = sceneList.children[i];
        if(c.classList.contains("separator")){
            const sep = { type: "separator", name: c.querySelector(".title").textContent, expanded: c.classList.contains("expanded"), children: [] };
            let j = i+1;
            while(j < sceneList.children.length && !sceneList.children[j].classList.contains("separator")){
                sep.children.push(sceneList.children[j].textContent);
                j++;
            }
            arr.push(sep);
            i = j;
        } else {
            arr.push({ type: "scene", name: c.textContent });
            i++;
        }
    }
    localStorage.setItem("sceneOrder", JSON.stringify(arr));
}
