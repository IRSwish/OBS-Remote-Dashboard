import './mixer.js';
import { connectOBS, sendRequest, onOBSConnected } from './obs.js';
import { addSeparator } from './scenes.js';
import { loadChat } from './chat.js';
import { setPreview } from './preview.js';

let streamStartTime = null;

// Exemple de preview (par défaut)
setPreview(0, "https://vdo.ninja/?view=69CJFPh&autoplay=1");
setPreview(1, "https://vdo.ninja/?view=rvFr2XN&autoplay=1");
setPreview(2, "https://vdo.ninja/?view=SwishEML&autoplay=1");

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
// Preview controls (inputs + icônes)
// ---------------------
function makeIconBtn(iconName, title) {
    const btn = document.createElement("button");
    btn.className = "icon-btn";
    btn.innerHTML = `<i data-lucide="${iconName}"></i>`;
    btn.title = title;
    return btn;
}

["preview1", "preview2", "preview3"].forEach((id, i) => {
    const wrapper = document.getElementById(id).parentElement;
    const controls = document.createElement("div");
    controls.className = "preview-controls";

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "ID VDO";

    const copyBtn = makeIconBtn("copy", "Copier le lien OBS");
    copyBtn.addEventListener("click", () => {
        if (!input.value) return;
        const url = `https://vdo.ninja/?view=${input.value}`;
        navigator.clipboard.writeText(url);
    });

    const connectBtn = makeIconBtn("cast", "Connecter (push)");
    connectBtn.addEventListener("click", () => {
        if (!input.value) return;
        const url = `https://vdo.ninja/?push=${input.value}&quality=0&audiodevice=0&webcam`;
        window.open(url, "_blank");
    });

    const refreshBtn = makeIconBtn("refresh-ccw", "Rafraîchir l’aperçu");
    refreshBtn.addEventListener("click", () => {
        if (!input.value) return;
        document.getElementById(id).src = `https://vdo.ninja/?view=${input.value}&autoplay=1`;
    });

    controls.appendChild(input);
    controls.appendChild(copyBtn);
    controls.appendChild(connectBtn);
    controls.appendChild(refreshBtn);
    wrapper.insertBefore(controls, wrapper.firstChild);
});

// Active les icônes Lucide
if (window.lucide) {
    window.lucide.createIcons();
}

// ---------------------
// Stats OBS
// ---------------------
onOBSConnected(() => {
    setInterval(() => sendRequest("GetStats", "stats"), 1000);
});

document.addEventListener("obsMessage", e => {
    const msg = e.detail;

    if(msg.op === 7 && msg.d.requestId === "stats") {
        const stats = msg.d.responseData || msg.d;

        // CPU
        let cpu = stats.cpuUsage ?? 0;
        cpu = cpu.toFixed(1);

        // RAM
        let ram = (stats.memoryUsage ?? 0) / 1024 / 1024;
        ram = ram.toFixed(1);

        // FPS
        let fps = stats.fps ?? 0;
        fps = fps.toFixed(1);

        // Dropped frames
        let dropped = stats.droppedFrames ?? 0;
        let totalFrames = stats.renderTotalFrames ?? 1;
        let droppedPct = ((dropped / totalFrames) * 100).toFixed(1);

        const elStats = document.getElementById("cpuFps");
        if(elStats) elStats.textContent = `CPU ${cpu}% • RAM ${ram} MB • FPS ${fps} • Dropped ${dropped} (${droppedPct}%)`;

        // Durée du stream
        const elStatus = document.getElementById("liveStatus");
        if(stats.streaming) {
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
});
