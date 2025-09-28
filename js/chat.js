export function loadChat(channel){
    if(channel) document.getElementById("chatFrame").src=`https://www.twitch.tv/popout/${channel}/chat`;
}
