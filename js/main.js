import './mixer.js'; 
import { connectOBS, sendRequest } from './obs.js';
import { addSeparator } from './scenes.js';
import { loadChat } from './chat.js';

// Connexion OBS
document.getElementById("connectBtn").addEventListener("click", ()=>{
    const ip=document.getElementById("obsIP").value.trim();
    const pass=document.getElementById("obsPass").value.trim();
    connectOBS(ip,pass);
});

// Ajouter séparateur
document.getElementById("addSeparatorBtn").addEventListener("click", ()=>addSeparator("Nouveau séparateur"));

// Chat
document.getElementById("loadChat").addEventListener("click", ()=>{
    const ch=document.getElementById("chatChannel").value.trim();
    loadChat(ch);
});

// Références DOM pour stats
const liveStatusEl = document.getElementById("liveStatus");
const programSceneEl = document.getElementById("programScene");
const cpuEl = document.getElementById("cpu");
const ramEl = document.getElementById("ram");
const fpsEl = document.getElementById("fps");
const droppedEl = document.getElementById("dropped");
const durationEl = document.getElementById("duration");

// ------------------
// Gestion des messages OBS
// ------------------
document.addEventListener("obsMessage", e=>{
    const msg = e.detail;

    // Connexion réussie → on lance les stats en boucle
    if(msg.op===2){
        updateStats();
        updateStreamStatus();
        setInterval(updateStats,2000);     // CPU/RAM/FPS
        setInterval(updateStreamStatus,1000); // durée live
    }

    // Changement de scène program
    if(msg.op===5 && msg.d.eventType==="CurrentProgramSceneChanged"){
        programSceneEl.textContent = "PRG: " + msg.d.eventData.sceneName;
    }

    // Réponses GetStats
    if(msg.op===7 && msg.d.requestId==="stats"){
        const d=msg.d.responseData;
        if(!d) return;

        cpuEl.textContent = "CPU: " + d.cpuUsage.toFixed(1) + "%";
        ramEl.textContent = "RAM: " + d.memoryUsage.toFixed(1) + " MB";
        fpsEl.textContent = d.activeFps.toFixed(0) + " FPS";

        const dropped = d.outputSkippedFrames;
        const total = d.outputTotalFrames || 1;
        const percent = ((dropped/total)*100).toFixed(1);
        droppedEl.textContent = `Dropped: ${dropped} (${percent}%)`;
    }

    // Réponses GetStreamStatus
    if(msg.op===7 && msg.d.requestId==="streamStatus"){
        const d=msg.d.responseData;
        if(!d) return;

        if(d.outputActive){
            let sec=d.outputDuration/1000;
            const h = String(Math.floor(sec/3600)).padStart(2,"0");
            const m = String(Math.floor((sec%3600)/60)).padStart(2,"0");
            const s = String(Math.floor(sec%60)).padStart(2,"0");
            durationEl.textContent = `LIVE: ${h}:${m}:${s}`;
        } else {
            durationEl.textContent = "LIVE: --:--:--";
        }
    }
});

// ------------------
// Fonctions update
// ------------------
function updateStats(){ sendRequest("GetStats","stats"); }
function updateStreamStatus(){ sendRequest("GetStreamStatus","streamStatus"); }
