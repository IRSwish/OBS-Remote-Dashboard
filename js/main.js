import './mixer.js'; 
import { connectOBS, sendRequest } from './obs.js';
import { addSeparator } from './scenes.js';
import { loadChat } from './chat.js';

let streamStartTime = null;

// Connexion OBS
document.getElementById("connectBtn").addEventListener("click", ()=>{
    const ip=document.getElementById("obsIP").value.trim();
    const pass=document.getElementById("obsPass").value.trim();
    connectOBS(ip, pass);
});

// Ajouter séparateur
document.getElementById("addSeparatorBtn").addEventListener("click", ()=>addSeparator("Nouveau séparateur"));

// Chat
document.getElementById("loadChat").addEventListener("click", ()=>{
    const ch=document.getElementById("chatChannel").value.trim();
    loadChat(ch);
});

// ---------------------
// --- OBS stats ---
document.addEventListener("obsMessage", e => {
    const msg = e.detail;

    if(msg.op === 2){ // auth ok
        setInterval(()=>sendRequest("GetStats","stats"), 1000);
    }

    if(msg.op === 7 && msg.d.requestId === "stats"){
        const stats = msg.d.responseData;
        const cpu = stats.cpuUsage?.toFixed(1) ?? 0;
        const ramMB = stats.memoryUsage / 1024 / 1024; 
        const ram = ramMB.toFixed(1);
        const fps = stats.fps?.toFixed(1) ?? 0;
        const dropped = stats.droppedFrames ?? 0;
        const totalFrames = stats.renderTotalFrames ?? 1;
        const droppedPct = ((dropped / totalFrames)*100).toFixed(1);

        document.getElementById("cpuFps").textContent = `CPU ${cpu}% • FPS ${fps} • RAM ${ram} MB • Dropped ${dropped} (${droppedPct}%)`;

        if(stats.streaming){
            if(!streamStartTime) streamStartTime = Date.now() - stats.streamingTime*1000;
            const elapsed = Date.now() - streamStartTime;
            const h = Math.floor(elapsed/3600000).toString().padStart(2,'0');
            const m = Math.floor((elapsed%3600000)/60000).toString().padStart(2,'0');
            const s = Math.floor((elapsed%60000)/1000).toString().padStart(2,'0');
            document.getElementById("liveStatus").textContent = `LIVE: ${h}:${m}:${s}`;
        } else {
            streamStartTime = null;
            document.getElementById("liveStatus").textContent = "CONNECTED";
        }
    }
});

