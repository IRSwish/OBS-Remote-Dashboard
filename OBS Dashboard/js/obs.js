// obs.js
export let ws;

export function connectOBS(ip, pass) {
    if(ws) ws.close();
    ws = new WebSocket("ws://" + ip);

    ws.onopen = () => ws.send(JSON.stringify({op:1,d:{rpcVersion:1,authentication:pass}}));

    ws.onmessage = e => {
        const msg = JSON.parse(e.data);
        if(msg.op===2){
            document.getElementById("liveStatus").textContent = "CONNECTED";
            sendRequest("GetSceneList","scenes");
            sendRequest("GetInputList","inputs");
        }
        document.dispatchEvent(new CustomEvent("obsMessage",{detail:msg}));
    };

    ws.onclose = () => document.getElementById("liveStatus").textContent = "OFFLINE";
}

export function sendRequest(type,id,data={}) {
    if(!ws || ws.readyState!==1) return;
    ws.send(JSON.stringify({op:6,d:{requestType:type,requestId:id,requestData:data}}));
}
