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
        
        var id = elmnt.getAttribute("data-id");
        var svgs = document.querySelectorAll("svg[link*=\"" + id + "\"]");
        for (var i = 0; i < svgs.length; i++) {
            var svg = svgs[i];
            var link = JSON.parse(svg.getAttribute("link"));
            var otherID = (link.start == id) ? link.end : link.start;
            var elmnt1 = document.querySelector(".dialogue[data-id='" + otherID + "']") as HTMLDivElement; 
            var d = getDimensionDiff(elmnt1, elmnt);
            updateLine(d, elmnt1, elmnt, svg as SVGElement);
        }
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
        if(currentID && dialogues[currentID].nextDialogue.indexOf(parseInt(id)) < 0){
            dialogues[currentID].addNextDialogue(parseInt(id));
            var elmnt1 = document.querySelector(".dialogue[data-id='" + currentID + "']") as HTMLDivElement; 
            var d = getDimensionDiff(elmnt1, elmnt);
            var shtml = createLine(d, elmnt1, elmnt);
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

var updateLine = (dimension: Dimension, elmnt1: HTMLDivElement, elmnt2: HTMLDivElement, elmnt: SVGElement) => {
    elmnt.setAttribute('viewbox', "0 0 " + dimension.height + " " + dimension.width);
    elmnt.setAttribute('style', "position: absolute; top: " + dimension.top + "; left: " + dimension.left
         + "; width: " + dimension.width + "px; height: " + dimension.height + "px;");
    
    var line = elmnt.querySelector('line') as SVGElement
    var attrs = {};
    
    if(elmnt1.offsetTop < elmnt2.offsetTop){
        attrs = (elmnt1.offsetLeft < elmnt2.offsetLeft) ?
            {x1: "0", y1: "0", x2: dimension.width, y2: dimension.height} :
            {x1: "0", y1: dimension.height, y2: "0", x2: dimension.width}
    } else {
        attrs = (elmnt1.offsetLeft < elmnt2.offsetLeft) ?
            {x1: "0", y1: dimension.height, y2: "0", x2: dimension.width} :
            {x1: "0", y1: "0", x2: dimension.width, y2: dimension.height}
    }
    for (var k in attrs)
        line.setAttribute(k, attrs[k]);
}

function createLine(dimension: Dimension, elmnt1: HTMLDivElement, elmnt2: HTMLDivElement){
    var retE = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    retE.setAttribute('viewbox', "0 0 " + dimension.height + " " + dimension.width);
    retE.setAttribute('style', "position: absolute; top: " + dimension.top + "; left: " + dimension.left
         + "; width: " + dimension.width + "px; height: " + dimension.height + "px;");
    retE.setAttribute('link', JSON.stringify({start: elmnt1.getAttribute('data-id'), end: elmnt2.getAttribute('data-id')}));
    var line = (elmnt1.offsetTop < elmnt2.offsetTop)?
        makeSVG("line", {x1: "0", y1: "0", x2: dimension.width, y2: dimension.height, "stroke-width": "2", stroke:"black" }) :
        makeSVG("line", {x1: "0", y2: "0", x2: dimension.width, y1: dimension.height, "stroke-width": "2", stroke:"black" })
    retE.appendChild(line);
    return retE;
}

function getDimensionDiff(elmnt1: HTMLDivElement, elmnt2: HTMLDivElement){
    var topMin = Math.min(elmnt1.offsetTop, elmnt2.offsetTop)
    var topMax = Math.max(elmnt1.offsetTop, elmnt2.offsetTop)
    var leftMin = Math.min(elmnt1.offsetLeft, elmnt2.offsetLeft)
    var leftMax = Math.max(elmnt1.offsetLeft, elmnt2.offsetLeft)

    var rtn: Dimension = {
        top: (topMin == elmnt1.offsetTop)? topMin + (elmnt1.offsetHeight/2) : topMin + (elmnt2.offsetHeight/2), 
        left: (leftMin == elmnt1.offsetLeft)? leftMin + (elmnt1.offsetWidth) : leftMin + (elmnt2.offsetWidth),
        width: (leftMin == elmnt1.offsetLeft)? leftMax - leftMin - (elmnt1.offsetWidth) : leftMax - leftMin - (elmnt2.offsetWidth),
        height: (topMin == elmnt1.offsetTop)? topMax - topMin - (elmnt1.offsetHeight/2) + (elmnt2.offsetHeight/2):
        topMax - topMin - (elmnt2.offsetHeight/2) + (elmnt1.offsetHeight/2)
    }
    return rtn;
}

function exportData(name: string, data: Dialogue[]){
    var downloadDialog = document.getElementById('export-dialogues');
    var a = document.getElementById('export-link');
    a.setAttribute('download', name + ".json");
    a.setAttribute('href', 'data:application/json,' + encodeURIComponent(JSON.stringify(data)));
    a.setAttribute('target', '_blank');
    a.onclick = () => {
        downloadDialog.classList.toggle('show');
    }
}

document.addEventListener("DOMContentLoaded", () => {
    var count = 0;
    var projectE = document.getElementById('project');
    var inputDialog = document.getElementById('create-dialogue');
    var downloadDialog = document.getElementById('export-dialogues');
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
    document.getElementById('export-file').addEventListener('click', ()=>{
        var filename = document.getElementById('file-title').innerText;
        exportData(filename, dialogues);
        downloadDialog.classList.toggle('show');
    })
})