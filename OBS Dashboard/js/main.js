import './mixer.js'; 
import { connectOBS } from './obs.js';
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

// Mock CPU/FPS
setInterval(()=>{
    const cpu=Math.floor(Math.random()*50);
    const fps=Math.floor(24+Math.random()*6);
    document.getElementById("cpuFps").textContent=`CPU ${cpu}% • FPS ${fps}`;
},1000);