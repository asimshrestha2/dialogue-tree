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
        var id = elmnt.getAttribute("data-id");
        var svgs = document.querySelectorAll("svg[link*=\"" + id + "\"]");
        console.log(svgs);
        for (var i = 0; i < svgs.length; i++) {
            var svg = svgs[i];
            var link = JSON.parse(svg.getAttribute("link"));
            var otherID = (link.start == id) ? link.end : link.start;
            var elmnt1 = document.querySelector(".dialogue[data-id='" + otherID + "']");
            var d = getDimensionDiff(elmnt1, elmnt);
            updateLine(d, elmnt1, elmnt, svg);
        }
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
        if (currentID && dialogues[currentID].nextDialogue.indexOf(parseInt(id)) < 0) {
            dialogues[currentID].addNextDialogue(parseInt(id));
            var elmnt1 = document.querySelector(".dialogue[data-id='" + currentID + "']");
            var d = getDimensionDiff(elmnt1, elmnt);
            var shtml = createLine(d, elmnt1, elmnt);
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
var updateLine = function (dimension, elmnt1, elmnt2, elmnt) {
    elmnt.setAttribute('viewbox', "0 0 " + dimension.height + " " + dimension.width);
    elmnt.setAttribute('style', "position: absolute; top: " + dimension.top + "; left: " + dimension.left
        + "; width: " + dimension.width + "px; height: " + dimension.height + "px;");
    var line = elmnt.querySelector('line');
    var attrs = {};
    if (elmnt1.offsetTop < elmnt2.offsetTop) {
        attrs = (elmnt1.offsetLeft < elmnt2.offsetLeft) ?
            { x1: "0", y1: "0", x2: dimension.width, y2: dimension.height } :
            { x1: "0", y1: dimension.height, y2: "0", x2: dimension.width };
    }
    else {
        attrs = (elmnt1.offsetLeft < elmnt2.offsetLeft) ?
            { x1: "0", y1: dimension.height, y2: "0", x2: dimension.width } :
            { x1: "0", y1: "0", x2: dimension.width, y2: dimension.height };
    }
    for (var k in attrs)
        line.setAttribute(k, attrs[k]);
};
function createLine(dimension, elmnt1, elmnt2) {
    var retE = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    retE.setAttribute('viewbox', "0 0 " + dimension.height + " " + dimension.width);
    retE.setAttribute('style', "position: absolute; top: " + dimension.top + "; left: " + dimension.left
        + "; width: " + dimension.width + "px; height: " + dimension.height + "px;");
    retE.setAttribute('link', JSON.stringify({ start: elmnt1.getAttribute('data-id'), end: elmnt2.getAttribute('data-id') }));
    var line = (elmnt1.offsetTop < elmnt2.offsetTop) ?
        makeSVG("line", { x1: "0", y1: "0", x2: dimension.width, y2: dimension.height, "stroke-width": "2", stroke: "black" }) :
        makeSVG("line", { x1: "0", y2: "0", x2: dimension.width, y1: dimension.height, "stroke-width": "2", stroke: "black" });
    retE.appendChild(line);
    return retE;
}
function getDimensionDiff(elmnt1, elmnt2) {
    var topMin = Math.min(elmnt1.offsetTop, elmnt2.offsetTop);
    var topMax = Math.max(elmnt1.offsetTop, elmnt2.offsetTop);
    var leftMin = Math.min(elmnt1.offsetLeft, elmnt2.offsetLeft);
    var leftMax = Math.max(elmnt1.offsetLeft, elmnt2.offsetLeft);
    var rtn = {
        top: (topMin == elmnt1.offsetTop) ? topMin + (elmnt1.offsetHeight / 2) : topMin + (elmnt2.offsetHeight / 2),
        left: (leftMin == elmnt1.offsetLeft) ? leftMin + (elmnt1.offsetWidth) : leftMin + (elmnt2.offsetWidth),
        width: (leftMin == elmnt1.offsetLeft) ? leftMax - leftMin - (elmnt1.offsetWidth) : leftMax - leftMin - (elmnt2.offsetWidth),
        height: (topMin == elmnt1.offsetTop) ? topMax - topMin - (elmnt1.offsetHeight / 2) + (elmnt2.offsetHeight / 2) :
            topMax - topMin - (elmnt2.offsetHeight / 2) + (elmnt1.offsetHeight / 2)
    };
    console.log(rtn);
    return rtn;
}
function exportData(name, data) {
    var a = document.createElement('a');
    a.setAttribute('download', name);
    a.setAttribute('href', 'data:application/json,' + encodeURIComponent(JSON.stringify(data)));
    a.setAttribute('target', '_blank');
    a.innerHTML = "Link";
    var projectE = document.getElementById('project');
    projectE.appendChild(a);
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
