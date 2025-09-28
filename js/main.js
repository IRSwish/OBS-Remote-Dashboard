import './mixer.js'; 
import { connectOBS, sendRequest, ws } from './obs.js';
import { addSeparator } from './scenes.js';
import { loadChat } from './chat.js';

let statsInterval = null;

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
// OBS stats CPU
// ---------------------
document.addEventListener("obsMessage", e => {
    const msg = e.detail;

    // Lors de l'auth OK
    if(msg.op === 2){
        if(statsInterval) clearInterval(statsInterval);
        statsInterval = setInterval(()=>{
            if(ws && ws.readyState === 1) sendRequest("GetStats","stats");
        }, 1000);
    }

    // Réception des stats
    if(msg.op === 7 && msg.d.requestId === "stats"){
        const stats = msg.d.responseData;
        const cpu = stats.cpuUsage?.toFixed(1) ?? 0;

        const el = document.getElementById("cpuFps");
        if(el) el.textContent = `CPU ${cpu}%`;
    }
});
