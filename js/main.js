import './mixer.js'; 
import { connectOBS, sendRequest, ws } from './obs.js';
import { addSeparator } from './scenes.js';
import { loadChat } from './chat.js';

let statsInterval = null;
let streamStartTime = null;

// Connexion OBS
document.getElementById("connectBtn").addEventListener("click", ()=>{
    const ip = document.getElementById("obsIP").value.trim();
    const pass = document.getElementById("obsPass").value.trim();
    connectOBS(ip, pass);
});

// Ajouter séparateur
document.getElementById("addSeparatorBtn").addEventListener("click", ()=>addSeparator("Nouveau séparateur"));

// Chat
document.getElementById("loadChat").addEventListener("click", ()=>{
    const ch = document.getElementById("chatChannel").value.trim();
    loadChat(ch);
});

// ---------------------
// OBS stats
// ---------------------
document.addEventListener("obsMessage", e => {
    const msg = e.detail;

    // Auth OK → lancer la requête GetStats toutes les secondes
    if(msg.op === 2){
        if(statsInterval) clearInterval(statsInterval);
        statsInterval = setInterval(()=>{
            if(ws && ws.readyState === 1){
                sendRequest("GetStats","stats");
            }
        }, 1000);
    }

    // Réception des stats
    if(msg.op === 7 && msg.d.requestId === "stats"){
        const stats = msg.d.responseData || msg.d;

        // CPU
        let cpu = stats.cpuUsage ?? stats.d?.cpuUsage ?? 0;
        cpu = cpu.toFixed(1);

        // RAM
        let ramMB = stats.memoryUsage ? stats.memoryUsage/1024/1024 : 0;
        const ram = ramMB.toFixed(1);

        // FPS
        const fps = stats.fps?.toFixed(1) ?? 0;

        // Dropped frames
        const dropped = stats.droppedFrames ?? 0;
        const totalFrames = stats.renderTotalFrames ?? 1;
        const droppedPct = ((dropped/totalFrames)*100).toFixed(1);

        // Mise à jour topbar CPU/FPS
        const elStats = document.getElementById("cpuFps");
        if(elStats) elStats.textContent = `CPU ${cpu}% • FPS ${fps} • RAM ${ram} MB • Dropped ${dropped} (${droppedPct}%)`;

        // Durée du stream et statut
        const elStatus = document.getElementById("liveStatus");
        if(stats.streaming){
            if(!streamStartTime) streamStartTime = Date.now() - stats.streamingTime*1000;
            const elapsed = Date.now() - streamStartTime;
            const h = Math.floor(elapsed/3600000).toString().padStart(2,'0');
            const m = Math.floor((elapsed%3600000)/60000).toString().padStart(2,'0');
            const s = Math.floor((elapsed%60000)/1000).toString().padStart(2,'0');
            if(elStatus) elStatus.textContent = `LIVE: ${h}:${m}:${s}`;
        } else {
            streamStartTime = null;
            if(elStatus) elStatus.textContent = "CONNECTED";
        }

        // PRG reste inchangé (géré par scenes.js)
    }
});
