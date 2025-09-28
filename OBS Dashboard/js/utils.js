export function saveSceneOrder(){
    const sceneList=document.getElementById("sceneList");
    const arr=[];
    Array.from(sceneList.children).forEach(c=>{
        if(c.classList.contains("separator")){
            arr.push({type:"separator",name:c.querySelector(".title").textContent,expanded:c.classList.contains("expanded")});
        } else arr.push({type:"scene",name:c.textContent});
    });
    localStorage.setItem("sceneOrder",JSON.stringify(arr));
}
