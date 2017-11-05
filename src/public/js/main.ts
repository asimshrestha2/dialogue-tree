class Dialogue{
    id: number;
    text: string;
    type: string; //player or npc
    nextDialogue: number[] = [];
    constructor(id:number, text: string, type?: string){
        this.id = id;
        this.text = text;
        this.type = type || "npc";
    }
    addNextDialogue(id: number){
        this.nextDialogue.push(id);
    }
}

var dialogueHTML = (dialogue: Dialogue) => {
    var retE = document.createElement('div');
    retE.classList.add('dialogue');
    retE.setAttribute("data-id", ""+dialogue.id);
    retE.innerHTML = `<div class="entry-point"></div>
    <div class="next-point"></div>
    <div class="text">${dialogue.text}</div>`
    return retE;
}

function dragElement(elmnt) {
    var pos = {x: 0, y: 0}    
    var tpos = {x: 0, y: 0}
    elmnt.onmousedown = dragMouseDown;
  
    function dragMouseDown(e) {
        e = e || window.event;
        // get the mouse cursor position at startup:
        tpos.x = e.clientX;
        tpos.y = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }
  
    function elementDrag(e) {
        e = e || window.event;
        // calculate the new cursor position:
        pos.x = tpos.x - e.clientX;
        pos.y = tpos.y - e.clientY;
        tpos.x = e.clientX;
        tpos.y = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos.y) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos.x) + "px";
    }
  
    function closeDragElement() {
        /* stop moving when mouse button is released:*/
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

var currentID;
var dialogues: Dialogue[] = [];

function setLinks(elmnt: HTMLDivElement){
    var entry = (elmnt.querySelector('.entry-point') as HTMLElement);
    var next = (elmnt.querySelector('.next-point') as HTMLElement);
    next.onclick = () => {
        var id = elmnt.getAttribute('data-id');
        if(id){
            currentID = id;
        }
    }

    entry.onclick = (e) => {
        var id = elmnt.getAttribute('data-id');
        console.log(elmnt.offsetTop, elmnt.offsetLeft);
        if(currentID){
            dialogues[currentID].addNextDialogue(parseInt(id));
            var d = getDimensionDiff(document.querySelector(".dialogue[data-id='" + currentID + "']") as HTMLDivElement, elmnt);
            var shtml = createLine(d);
            var projectE = document.getElementById('project');
            projectE.appendChild(shtml);
            currentID = null
        }
    }
}

interface Dimension{
    top: number,
    left: number,
    width: number,
    height: number
}

var makeSVG = (tag: string, attrs: {}) => {
    var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (var k in attrs)
        el.setAttribute(k, attrs[k]);
    return el;
}

function createLine(dimension: Dimension){
    var retE = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    retE.setAttribute('viewbox', "0 0 " + dimension.height + " " + dimension.width);
    retE.setAttribute('style', "position: absolute; top: " + dimension.top + "; left: " + dimension.left
         + "; width: " + dimension.width + "px; height: " + dimension.height + "px;");
    var line = makeSVG("line", {x1: "0", y1: "0", x2: dimension.width, y2: dimension.height, "stroke-width": "2", stroke:"black" })
    retE.appendChild(line);
    return retE;
}

function getDimensionDiff(elmnt1: HTMLDivElement, elmnt2: HTMLDivElement){
    var topMin = Math.min(elmnt1.offsetTop, elmnt2.offsetTop)
    var topMax = Math.max(elmnt1.offsetTop, elmnt2.offsetTop)
    var leftMin = Math.min(elmnt1.offsetLeft, elmnt2.offsetLeft)
    var leftMax = Math.max(elmnt1.offsetLeft, elmnt2.offsetLeft)
    var rtn: Dimension = {
        top: topMin, left: leftMin,
        width: leftMax - leftMin, height: topMax - topMin
    }
    console.log(rtn);
    return rtn;
}

document.addEventListener("DOMContentLoaded", () => {
    var count = 0;
    var projectE = document.getElementById('project');
    var inputDialog = document.getElementsByClassName('input-dialog')[0];
    var addDialogueBtn = document.getElementById('add-dialogue');
    addDialogueBtn.addEventListener("click", () => {
        var inputText = (document.getElementById("dialogText") as HTMLTextAreaElement);
        var inputType = (document.getElementById("dialogType") as HTMLInputElement);
        if(inputText.value != null && inputText.value != ""){
            var d = new Dialogue(count++, inputText.value, inputType.value);
            dialogues.push(d);
            var el = dialogueHTML(d);
            el.style.top = "10px";
            el.style.left = "10px";
            dragElement(el);
            setLinks(el);
            projectE.appendChild(el);
            inputText.value = ""
            inputType.value = ""
            inputDialog.classList.toggle('show');
        }
    });
    document.getElementById('cancel-dialogue').addEventListener('click', ()=>{
        var inputText = (document.getElementById("dialogText") as HTMLTextAreaElement);
        var inputType = (document.getElementById("dialogType") as HTMLInputElement);
        inputText.value = ""
        inputType.value = ""
        inputDialog.classList.toggle('show');
    })
    document.getElementById('add-dialog').addEventListener('click', ()=>{
        inputDialog.classList.toggle('show');
    })
})