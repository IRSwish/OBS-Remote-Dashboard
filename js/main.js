// main.js
import { connectOBS, sendRequest, onOBSConnected } from './obs.js';
import { addSeparator } from './scenes.js';
import { loadChat } from './chat.js';

let streamStartTime = null;

// Topbar elements
const elStats = document.getElementById("cpuFps");
const elStatus = document.getElementById("liveStatus");
const elProgram = document.getElementById("programScene");

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

// Callback OBS connecté → start GetStats
onOBSConnected(() => {
    setInterval(() => {
        sendRequest("GetStats", "stats");
    }, 1000);
});

// Écoute des messages OBS
document.addEventListener("obsMessage", e => {
    const msg = e.detail;

    // Stats
    if(msg.op === 7 && msg.d.requestId === "stats"){
        const stats = msg.d.responseData || msg.d;

        // CPU / RAM / FPS / Dropped
        const cpu = (stats.cpuUsage ?? stats.d?.cpuUsage ?? 0).toFixed(1);
        const ram = ((stats.memoryUsage ?? 0)/1024/1024).toFixed(1);
        const fps = (stats.fps ?? 0).toFixed(1);
        const dropped = stats.droppedFrames ?? 0;
        const totalFrames = stats.renderTotalFrames ?? 1;
        const droppedPct = ((dropped/totalFrames)*100).toFixed(1);

        if(elStats) elStats.textContent = `CPU ${cpu}% • FPS ${fps} • RAM ${ram} MB • Dropped ${dropped} (${droppedPct}%)`;

        // Stream duration
        if(stats.streaming){
            if(!streamStartTime) streamStartTime = Date.now() - (stats.streamingTime ?? 0)*1000;
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

    // Mise à jour de la scène PRG (si scenes.js le fait)
    if(msg.op === 7 && msg.d.requestId.startsWith("prog_")){
        const name = msg.d.responseData?.currentProgramSceneName ?? "-";
        if(elProgram) elProgram.textContent = `PRG: ${name}`;
    }
});
