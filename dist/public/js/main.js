var Dialogue = (function () {
    function Dialogue(id, text, type) {
        this.nextDialogue = [];
        this.id = id;
        this.text = text;
        this.type = type || "npc";
    }
    Dialogue.prototype.addNextDialogue = function (id) {
        this.nextDialogue.push(id);
    };
    return Dialogue;
}());
var dialogueHTML = function (dialogue) {
    var retE = document.createElement('div');
    retE.classList.add('dialogue');
    retE.setAttribute("data-id", "" + dialogue.id);
    retE.innerHTML = "<div class=\"entry-point\"></div>\n    <div class=\"next-point\"></div>\n    <div class=\"text\">" + dialogue.text + "</div>";
    return retE;
};
function dragElement(elmnt) {
    var pos = { x: 0, y: 0 };
    var tpos = { x: 0, y: 0 };
    elmnt.onmousedown = dragMouseDown;
    function dragMouseDown(e) {
        e = e || window.event;
        tpos.x = e.clientX;
        tpos.y = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }
    function elementDrag(e) {
        e = e || window.event;
        pos.x = tpos.x - e.clientX;
        pos.y = tpos.y - e.clientY;
        tpos.x = e.clientX;
        tpos.y = e.clientY;
        elmnt.style.top = (elmnt.offsetTop - pos.y) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos.x) + "px";
    }
    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}
var currentID;
var dialogues = [];
function setLinks(elmnt) {
    var entry = elmnt.querySelector('.entry-point');
    var next = elmnt.querySelector('.next-point');
    next.onclick = function () {
        var id = elmnt.getAttribute('data-id');
        if (id) {
            currentID = id;
        }
    };
    entry.onclick = function (e) {
        var id = elmnt.getAttribute('data-id');
        console.log(elmnt.offsetTop, elmnt.offsetLeft);
        if (currentID) {
            dialogues[currentID].addNextDialogue(parseInt(id));
            var d = getDimensionDiff(document.querySelector(".dialogue[data-id='" + currentID + "']"), elmnt);
            var shtml = createLine(d);
            var projectE = document.getElementById('project');
            projectE.appendChild(shtml);
            currentID = null;
        }
    };
}
var makeSVG = function (tag, attrs) {
    var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (var k in attrs)
        el.setAttribute(k, attrs[k]);
    return el;
};
function createLine(dimension) {
    var retE = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    retE.setAttribute('viewbox', "0 0 " + dimension.height + " " + dimension.width);
    retE.setAttribute('style', "position: absolute; top: " + dimension.top + "; left: " + dimension.left
        + "; width: " + dimension.width + "px; height: " + dimension.height + "px;");
    var line = makeSVG("line", { x1: "0", y1: "0", x2: dimension.width, y2: dimension.height, "stroke-width": "2", stroke: "black" });
    retE.appendChild(line);
    return retE;
}
function getDimensionDiff(elmnt1, elmnt2) {
    var topMin = Math.min(elmnt1.offsetTop, elmnt2.offsetTop);
    var topMax = Math.max(elmnt1.offsetTop, elmnt2.offsetTop);
    var leftMin = Math.min(elmnt1.offsetLeft, elmnt2.offsetLeft);
    var leftMax = Math.max(elmnt1.offsetLeft, elmnt2.offsetLeft);
    var rtn = {
        top: topMin, left: leftMin,
        width: leftMax - leftMin, height: topMax - topMin
    };
    console.log(rtn);
    return rtn;
}
document.addEventListener("DOMContentLoaded", function () {
    var count = 0;
    var projectE = document.getElementById('project');
    var inputDialog = document.getElementsByClassName('input-dialog')[0];
    var addDialogueBtn = document.getElementById('add-dialogue');
    addDialogueBtn.addEventListener("click", function () {
        var inputText = document.getElementById("dialogText");
        var inputType = document.getElementById("dialogType");
        if (inputText.value != null && inputText.value != "") {
            var d = new Dialogue(count++, inputText.value, inputType.value);
            dialogues.push(d);
            var el = dialogueHTML(d);
            el.style.top = "10px";
            el.style.left = "10px";
            dragElement(el);
            setLinks(el);
            projectE.appendChild(el);
            inputText.value = "";
            inputType.value = "";
            inputDialog.classList.toggle('show');
        }
    });
    document.getElementById('cancel-dialogue').addEventListener('click', function () {
        var inputText = document.getElementById("dialogText");
        var inputType = document.getElementById("dialogType");
        inputText.value = "";
        inputType.value = "";
        inputDialog.classList.toggle('show');
    });
    document.getElementById('add-dialog').addEventListener('click', function () {
        inputDialog.classList.toggle('show');
    });
});
