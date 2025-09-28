import './mixer.js';
import { connectOBS, sendRequest, onOBSConnected } from './obs.js';
import { addSeparator, createScenes } from './scenes.js';
import { loadChat } from './chat.js';
import { setPreview } from './preview.js';

// Exemple d'utilisation
setPreview(0, "https://www.example.com");
setPreview(1, "https://www.example.org");
setPreview(2, "https://www.example.net");

let streamStartTime = null;

// Connexion OBS
document.getElementById("connectBtn").addEventListener("click", () => {
    const ip = document.getElementById("obsIP").value.trim();
    const pass = document.getElementById("obsPass").value.trim();
    connectOBS(ip, pass);
});

// Ajouter séparateur
document.getElementById("addSeparatorBtn").addEventListener("click", () => addSeparator("Nouveau séparateur"));

// Chat
document.getElementById("loadChat").addEventListener("click", () => {
    const ch = document.getElementById("chatChannel").value.trim();
    loadChat(ch);
});

// ---------------------
// OBS stats CPU / RAM / FPS / Dropped / Live
// ---------------------
onOBSConnected(() => {
    // intervalle qui ne démarre qu'après que le WS soit ouvert
    setInterval(() => {
        sendRequest("GetStats", "stats");
    }, 1000);
});

document.addEventListener("obsMessage", e => {
    const msg = e.detail;

    // stats GetStats
    if(msg.op === 7 && msg.d.requestId === "stats") {
        const stats = msg.d.responseData || msg.d;
    
        // CPU
        let cpu = stats.cpuUsage ?? stats.d?.cpuUsage ?? 0;
        cpu = cpu.toFixed(1);
    
        // RAM
        let ram = 0;
        if(stats.memoryUsage !== undefined) ram = (stats.memoryUsage / 1024 / 1024).toFixed(1);
        else if(stats.d?.memoryUsage !== undefined) ram = (stats.d.memoryUsage / 1024 / 1024).toFixed(1);
    
        // FPS
        let fps = stats.fps ?? stats.d?.fps ?? 0;
        fps = fps.toFixed(1);
    
        // Dropped frames
        let dropped = stats.droppedFrames ?? stats.d?.droppedFrames ?? 0;
        let totalFrames = stats.renderTotalFrames ?? stats.d?.renderTotalFrames ?? 1;
        let droppedPct = ((dropped / totalFrames) * 100).toFixed(1);
    
        const el = document.getElementById("cpuFps");
        if(el) el.textContent = `CPU ${cpu}% • RAM ${ram} MB • FPS ${fps} • Dropped ${dropped} (${droppedPct}%)`;
    }

        // Durée du stream et statut
        const elStatus = document.getElementById("liveStatus");
        if(stats.streaming){
            if(!streamStartTime) streamStartTime = Date.now() - stats.streamingTime*1000;
            const elapsed = Date.now() - streamStartTime;
            const h = Math.floor(elapsed / 3600000).toString().padStart(2,'0');
            const m = Math.floor((elapsed % 3600000) / 60000).toString().padStart(2,'0');
            const s = Math.floor((elapsed % 60000) / 1000).toString().padStart(2,'0');
            if(elStatus) elStatus.textContent = `LIVE: ${h}:${m}:${s}`;
        } else {
            streamStartTime = null;
            if(elStatus) elStatus.textContent = "CONNECTED";
        }
    }

    // PRG reste inchangé (géré par scenes.js)
});



