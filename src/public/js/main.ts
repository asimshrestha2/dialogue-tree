class Dialogue{
    id: number;
    text: string;
    actor: string; //player or npc
    nextDialogue: number[] = [];
    constructor(id:number, text: string, actor?: string){
        this.id = id;
        this.text = text;
        this.actor = actor || "npc";
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
    <div class="actor">${dialogue.actor}</div>
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
        var lines = document.querySelectorAll("line[link*=\"" + id + "\"]");
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            var link = JSON.parse(line.getAttribute("link"));
            if(link.start == id || link.end == id){
                var otherID = (link.start == id) ? link.end : link.start;
                var elmnt1 = document.querySelector(".dialogue[data-id='" + otherID + "']") as HTMLDivElement; 
                var d = getDimensionDiff(elmnt1, elmnt);
                updateLine(d, elmnt1, elmnt, line as SVGElement);
            }
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
            createLine(d, elmnt1, elmnt);
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

var updateLine = (dimension: Dimension, elmnt1: HTMLDivElement, elmnt2: HTMLDivElement, line: SVGElement) => {
    var attrs = {};
    var svgattrs = {viewbox: "0 0 " + dimension.width + " " + dimension.height,
        style: "position: absolute; top: " + dimension.top + "px; left: " + dimension.left
        + "px; width: " + dimension.width + "px; height: " + dimension.height + "px;"}
    
    var link = JSON.parse(line.getAttribute('link'));
    var style = "";
    if(link.start == elmnt1.getAttribute('data-id')){
        style = (elmnt1.offsetLeft < elmnt2.offsetLeft)?
            "marker-end: url(#arrowhead); marker-start: none;" :
            "marker-start: url(#endarrow); marker-end: none;"
    } else {
        style = (elmnt1.offsetLeft > elmnt2.offsetLeft)?
            "marker-end: url(#arrowhead); marker-start: none;" :
            "marker-start: url(#endarrow); marker-end: none;"
    }

    if(elmnt1.offsetTop < elmnt2.offsetTop){
        if(elmnt1.offsetLeft < elmnt2.offsetLeft){
            attrs = {x1: dimension.left, y1: dimension.top, x2: dimension.width + dimension.left, y2: dimension.height + dimension.top}
        } else {
            attrs = {x1: dimension.left, y1: dimension.height + dimension.top, y2: dimension.top, x2: dimension.width + dimension.left}
        }
    } else {
        if(elmnt1.offsetLeft < elmnt2.offsetLeft){
            attrs = {x1: dimension.left, y1: dimension.height + dimension.top, y2: dimension.top, x2: dimension.width + dimension.left}
        } else {
            attrs = {x1: dimension.left, y1: dimension.top, x2: dimension.width + dimension.left, y2: dimension.height + dimension.top}
        }
    }
    attrs['style'] = style;
    for (var k in attrs)
        line.setAttribute(k, attrs[k]);
}

function createLine(dimension: Dimension, elmnt1: HTMLDivElement, elmnt2: HTMLDivElement){
    var mainSVG = document.getElementById('main-svg');    
    var line = (elmnt1.offsetTop < elmnt2.offsetTop)?
        makeSVG("line", {x1: dimension.left, y1: dimension.top, x2: dimension.width + dimension.left, 
            y2: dimension.height + dimension.top, "stroke-width": "2", stroke:"black", 'style':"marker-end: url(#arrowhead);",
            link: JSON.stringify({start: elmnt1.getAttribute('data-id'), end: elmnt2.getAttribute('data-id')})}) :
        makeSVG("line", {x1: dimension.left, y2: dimension.top, x2: dimension.width + dimension.left,
            y1: dimension.height + dimension.top, "stroke-width": "2", stroke:"black", 'style':"marker-end: url(#arrowhead);",
            link: JSON.stringify({start: elmnt1.getAttribute('data-id'), end: elmnt2.getAttribute('data-id')})})
    mainSVG.appendChild(line);
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
        var inputActor = (document.getElementById("dialogActor") as HTMLInputElement);
        if(inputText.value != null && inputText.value != ""){
            var d = new Dialogue(count++, inputText.value, inputActor.value);
            dialogues.push(d);
            var el = dialogueHTML(d);
            el.style.top = "10px";
            el.style.left = "10px";
            dragElement(el);
            setLinks(el);
            projectE.appendChild(el);
            inputText.value = ""
            inputActor.value = ""
            inputDialog.classList.toggle('show');
        }
    });
    document.getElementById('cancel-dialogue').addEventListener('click', ()=>{
        var inputText = (document.getElementById("dialogText") as HTMLTextAreaElement);
        var inputActor = (document.getElementById("dialogActor") as HTMLInputElement);
        inputText.value = ""
        inputActor.value = ""
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
    document.getElementById('cancel-export').addEventListener('click', ()=>{
        downloadDialog.classList.toggle('show');
    })
    document.getElementById('file-title').addEventListener('dblclick', ()=>{
        var fileTitle = document.getElementById('file-title');
        fileTitle.style.display = 'none';
        var inputFeild = document.createElement('input');
        inputFeild.id = 'input-file-title'
        inputFeild.value = fileTitle.innerText;
        fileTitle.parentNode.appendChild(inputFeild);
        document.onclick = (e) => {
            var target = (e.target || e.srcElement) as HTMLElement;
            if(target.id != "input-file-title"){
                fileTitle.innerText = inputFeild.value;
                fileTitle.style.display = 'block';
                inputFeild.parentNode.removeChild(inputFeild);
                document.onclick = null;
                document.onkeyup = null;
            }
        }

        document.onkeyup = (e) =>{
            if(e.keyCode == 13 || e.keyCode == 27){
                fileTitle.innerText = inputFeild.value;
                fileTitle.style.display = 'block';
                inputFeild.parentNode.removeChild(inputFeild);
                document.onclick = null;
                document.onkeyup = null;
            }
        }
    })
    var fileInput = document.getElementById('file-input') as HTMLInputElement;
    fileInput.addEventListener('change', () => {
        var curFiles = fileInput.files;
        if(curFiles.length === 1){
            var file = curFiles[0];
            var reader = new FileReader();
            reader.onload = (ev) => {
                if(reader.result != ""){
                    var data = JSON.parse(reader.result);
                    if(data.length != 0){
                        for (var i = 0; i < data.length; i++) {
                            var dialogue: Dialogue = data[i];
                            var d = new Dialogue(dialogue.id, dialogue.text, dialogue.actor);
                            d.nextDialogue = dialogue.nextDialogue;
                            dialogues.push(d);
                            var el = dialogueHTML(d);
                            el.style.top = "10px";
                            el.style.left = "10px";
                            dragElement(el);
                            setLinks(el);
                            projectE.appendChild(el);
                        }
                        dialogues.forEach(d => {
                            if(d.nextDialogue.length != 0){
                                d.nextDialogue.forEach(item => {
                                    var elmnt1 = document.querySelector(".dialogue[data-id='" + d.id + "']") as HTMLDivElement;
                                    var elmnt2 = document.querySelector(".dialogue[data-id='" + item + "']") as HTMLDivElement; 
                                    var dimension = getDimensionDiff(elmnt1, elmnt2);
                                    createLine(dimension, elmnt1, elmnt2);
                                });
                            }
                        });

                        count = data.length;
                    }
                }
            }
            reader.readAsBinaryString(file.slice());
        }
    })
})