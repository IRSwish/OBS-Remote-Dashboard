// mixer.js
import { sendRequest, ws } from './obs.js';

export const channels = {};

// Écoute les messages OBS pour créer ou mettre à jour le mixer
document.addEventListener("obsMessage", e => {
    const msg = e.detail;

    // Création du mixer à la réception des inputs
    if (msg.op === 7 && msg.d.requestId === "inputs" && msg.d.responseData?.inputs) {
        createMixer(msg.d.responseData.inputs);
    }

    // Mise à jour du volume en temps réel
    if (msg.op === 5 && msg.d.eventType === "InputVolumeChanged") {
        const ev = msg.d.eventData;
        if (!ev) return;
        const name = ev.inputName || ev.inputId;
        const levelValue = typeof ev.inputVolumeMul === "number" ? ev.inputVolumeMul : 0;
        if (channels[name] && !channels[name].isSliding) {
            channels[name].level.style.height = (levelValue * 100) + "%";
            channels[name].dblabel.textContent = (20 * Math.log10(Math.max(levelValue, 0.0001))).toFixed(1) + " dB";
        }
    }

    // Mise à jour du mute en temps réel
    if (msg.op === 5 && msg.d.eventType === "InputMuteStateChanged") {
        const ev = msg.d.eventData;
        if (!ev) return;
        const name = ev.inputName || ev.inputId;
        const muted = !!ev.inputMuted;
        if (channels[name] && channels[name].muteBtn) {
            channels[name].muteBtn.style.background = muted ? "#f52584" : "#555";
            channels[name].muteBtn.textContent = muted ? "Muted" : "Mute";
            channels[name].muteBtn.isMuted = muted;
        }
    }

    // Récupération initiale du volume et mute (comme dans ton HTML)
    if (msg.op === 7 && msg.d.responseData) {
        const id = msg.d.requestId;
        const resp = msg.d.responseData;
        if (id.startsWith("log_vol_")) {
            const chName = id.replace("log_vol_", "");
            if (channels[chName]) {
                const vol = resp.inputVolumeMul ?? 0;
                channels[chName].level.style.height = (vol * 100) + "%";
                channels[chName].slider.value = Math.round(Math.sqrt(vol) * 100); // correspond à l’UI carré
                channels[chName].dblabel.textContent = (20 * Math.log10(Math.max(vol, 0.0001))).toFixed(1) + " dB";
            }
        }
        if (id.startsWith("log_mute_")) {
            const chName = id.replace("log_mute_", "");
            const muted = !!resp.inputMuted;
            if (channels[chName]) {
                channels[chName].muteBtn.style.background = muted ? "#f52584" : "#555";
                channels[chName].muteBtn.textContent = muted ? "Muted" : "Mute";
                channels[chName].muteBtn.isMuted = muted;
            }
        }
    }
});

// Fonction principale pour créer le mixer
export function createMixer(inputs) {
    const mixer = document.getElementById("mixer");
    if (!mixer) return console.warn("Div #mixer introuvable !");
    mixer.innerHTML = "";

    Object.keys(channels).forEach(k => delete channels[k]);

    const audioInputs = inputs.filter(input =>
        input.inputKind.startsWith("audio") ||
        input.inputKind.includes("wasapi") ||
        input.inputKind.includes("vlc")
    );

    if (audioInputs.length === 0) {
        const msg = document.createElement("div");
        msg.style.color = "#fff";
        msg.textContent = "Aucun input audio détecté";
        mixer.appendChild(msg);
        return;
    }

    audioInputs.forEach(input => {
        const name = input.inputName || input.inputId;
        const channel = document.createElement("div");
        channel.className = "channel";

        const dblabel = document.createElement("div");
        dblabel.className = "dblabel";
        dblabel.textContent = "-∞ dB";
        channel.appendChild(dblabel);

        const fader = document.createElement("div");
        fader.className = "fader";
        const level = document.createElement("div");
        level.className = "level";
        level.style.height = "0%";
        fader.appendChild(level);

        const slider = document.createElement("input");
        slider.type = "range";
        slider.min = 0;
        slider.max = 100;
        slider.value = 0;
        slider.className = "slider";

        let isSliding = false;
        slider.addEventListener("mousedown", () => isSliding = true);
        slider.addEventListener("mouseup", () => isSliding = false);
        slider.addEventListener("touchstart", () => isSliding = true);
        slider.addEventListener("touchend", () => isSliding = false);

        slider.addEventListener("input", () => {
            const val = slider.value / 100;
            const vol = val * val;
            level.style.height = (val * 100) + "%";
            dblabel.textContent = (20 * Math.log10(Math.max(vol, 0.0001))).toFixed(1) + " dB";
            if (ws && ws.readyState === 1) {
                sendRequest("SetInputVolume", "set_" + name, { inputName: name, inputVolumeMul: vol });
            }
        });

        fader.appendChild(slider);
        channel.appendChild(fader);

        const muteBtn = document.createElement("button");
        muteBtn.className = "muteBtn";
        muteBtn.textContent = "Mute";
        let isMuted = false;
        muteBtn.addEventListener("click", () => {
            isMuted = !isMuted;
            muteBtn.style.background = isMuted ? "#f52584" : "#555";
            muteBtn.textContent = isMuted ? "Muted" : "Mute";
            if (ws && ws.readyState === 1) {
                sendRequest("SetInputMute", "mute_" + name, { inputName: name, inputMuted: isMuted });
            }
        });
        channel.appendChild(muteBtn);

        const nameDiv = document.createElement("div");
        nameDiv.className = "name";
        nameDiv.textContent = name;
        channel.appendChild(nameDiv);

        mixer.appendChild(channel);

        // Stockage pour mise à jour en temps réel
        channels[name] = { level, slider, dblabel, muteBtn, get isSliding() { return isSliding; } };

        // Abonnements OBS
        ws?.send(JSON.stringify({
            op: 6,
            d: { requestType: "SubscribeToInputVolumeChanged", requestId: "sub_" + name, requestData: { inputName: name } }
        }));
        ws?.send(JSON.stringify({
            op: 6,
            d: { requestType: "Subscribe", requestId: "sub_mute_" + name, requestData: { events: ["InputMuteStateChanged"] } }
        }));

        // Récupération initiale volume + mute comme dans ton HTML
        setTimeout(() => {
            sendRequest("GetInputVolume", "log_vol_" + name, { inputName: name });
            sendRequest("GetInputMute", "log_mute_" + name, { inputName: name });
        }, 50);
    });
}
