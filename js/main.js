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

    // Auth OK → lancer la requête GetStats toutes les secondes
    if(msg.op === 2){
        if(statsInterval) clearInterval(statsInterval);
        statsInterval = setInterval(()=>{
            if(ws && ws.readyState === 1){
                console.log("Sending GetStats request...");
                sendRequest("GetStats","stats");
            }
        }, 1000);
    }

    // Réception des stats
    if(msg.op === 7 && msg.d.requestId === "stats"){
        console.log("GetStats response:", msg.d); // <-- LOG pour vérifier les données exactes

        const stats = msg.d.responseData || msg.d; // fallback selon la version d'OBS
        let cpu = 0;

        // OBS 29+ : stats.cpuUsage dans d
        if(stats.cpuUsage !== undefined) cpu = stats.cpuUsage.toFixed(1);

        // OBS plus anciens : d.cpuUsage
        else if(stats.d?.cpuUsage !== undefined) cpu = stats.d.cpuUsage.toFixed(1);

        const el = document.getElementById("cpuFps");
        if(el) el.textContent = `CPU ${cpu}%`;
    }
});
