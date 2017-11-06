var Dialogue = (function () {
    function Dialogue(id, text, actor) {
        this.nextDialogue = [];
        this.id = id;
        this.text = text;
        this.actor = actor || "npc";
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
    retE.innerHTML = "<div class=\"entry-point\"></div>\n    <div class=\"next-point\"></div>\n    <div class=\"actor\">" + dialogue.actor + "</div>\n    <div class=\"text\">" + dialogue.text + "</div>";
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
        for (var i = 0; i < svgs.length; i++) {
            var svg = svgs[i];
            var link = JSON.parse(svg.getAttribute("link"));
            if (link.start == id || link.end == id) {
                var otherID = (link.start == id) ? link.end : link.start;
                var elmnt1 = document.querySelector(".dialogue[data-id='" + otherID + "']");
                var d = getDimensionDiff(elmnt1, elmnt);
                updateLine(d, elmnt1, elmnt, svg);
            }
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
    dimension = {
        top: dimension.top,
        left: dimension.left,
        height: (dimension.height <= 12) ? 12 : dimension.height,
        width: (dimension.width <= 12) ? 12 : dimension.width
    };
    var line = elmnt.querySelector('line');
    var attrs = {};
    var svgattrs = { viewbox: "0 0 " + dimension.width + " " + dimension.height,
        style: "position: absolute; top: " + dimension.top + "px; left: " + dimension.left
            + "px; width: " + dimension.width + "px; height: " + dimension.height + "px;" };
    var link = JSON.parse(elmnt.getAttribute('link'));
    var style = "";
    if (link.start == elmnt1.getAttribute('data-id')) {
        style = (elmnt1.offsetLeft < elmnt2.offsetLeft) ?
            "marker-end: url(#arrowhead); marker-start: none;" :
            "marker-start: url(#endarrow); marker-end: none;";
    }
    else {
        style = (elmnt1.offsetLeft > elmnt2.offsetLeft) ?
            "marker-end: url(#arrowhead); marker-start: none;" :
            "marker-start: url(#endarrow); marker-end: none;";
    }
    if (elmnt1.offsetTop < elmnt2.offsetTop) {
        if (elmnt1.offsetLeft < elmnt2.offsetLeft) {
            attrs = { x1: "0", y1: "0", x2: (dimension.width), y2: (dimension.height) };
        }
        else {
            attrs = { x1: "0", y1: (dimension.height), y2: "0", x2: (dimension.width) };
        }
    }
    else {
        if (elmnt1.offsetLeft < elmnt2.offsetLeft) {
            attrs = { x1: "0", y1: (dimension.height), y2: "0", x2: dimension.width };
        }
        else {
            attrs = { x1: "0", y1: "0", x2: (dimension.width), y2: dimension.height };
        }
    }
    attrs['style'] = style;
    for (var k in attrs)
        line.setAttribute(k, attrs[k]);
    for (var k in svgattrs)
        elmnt.setAttribute(k, svgattrs[k]);
};
function createLine(dimension, elmnt1, elmnt2) {
    dimension = {
        top: dimension.top,
        left: dimension.left,
        height: (dimension.height <= 12) ? 12 : dimension.height,
        width: (dimension.width <= 12) ? 12 : dimension.width
    };
    var retE = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    retE.setAttribute('viewbox', "0 0 " + dimension.height + " " + dimension.width);
    retE.setAttribute('style', "position: absolute; top: " + dimension.top + "; left: " + dimension.left
        + "; width: " + dimension.width + "px; height: " + dimension.height + "px;");
    retE.setAttribute('link', JSON.stringify({ start: elmnt1.getAttribute('data-id'), end: elmnt2.getAttribute('data-id') }));
    var def = makeSVG('defs', {});
    var marker = makeSVG('marker', { id: "arrowhead", markerWidth: "12", markerHeight: "12", refX: "12", refY: "6", orient: "auto" });
    var arrowhead = makeSVG('path', { d: "M0,0 L0,12 L12,6 L0,0", style: "fill: #000000;" });
    marker.appendChild(arrowhead);
    def.appendChild(marker);
    var marker2 = makeSVG('marker', { id: "endarrow", markerWidth: "12", markerHeight: "12", refX: "0", refY: "6", orient: "auto" });
    var endarrow = makeSVG('path', { d: "M12,12 L12,0 L0,6 L12,12", style: "fill: #000000;" });
    marker2.appendChild(endarrow);
    def.appendChild(marker2);
    var line = (elmnt1.offsetTop < elmnt2.offsetTop) ?
        makeSVG("line", { x1: "0", y1: "0", x2: dimension.width, y2: dimension.height, "stroke-width": "2", stroke: "black", 'style': "marker-end: url(#arrowhead);" }) :
        makeSVG("line", { x1: "0", y2: "0", x2: dimension.width, y1: dimension.height, "stroke-width": "2", stroke: "black", 'style': "marker-end: url(#arrowhead);" });
    retE.appendChild(def);
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
    return rtn;
}
function exportData(name, data) {
    var downloadDialog = document.getElementById('export-dialogues');
    var a = document.getElementById('export-link');
    a.setAttribute('download', name + ".json");
    a.setAttribute('href', 'data:application/json,' + encodeURIComponent(JSON.stringify(data)));
    a.setAttribute('target', '_blank');
    a.onclick = function () {
        downloadDialog.classList.toggle('show');
    };
}
document.addEventListener("DOMContentLoaded", function () {
    var count = 0;
    var projectE = document.getElementById('project');
    var inputDialog = document.getElementById('create-dialogue');
    var downloadDialog = document.getElementById('export-dialogues');
    var addDialogueBtn = document.getElementById('add-dialogue');
    addDialogueBtn.addEventListener("click", function () {
        var inputText = document.getElementById("dialogText");
        var inputActor = document.getElementById("dialogActor");
        if (inputText.value != null && inputText.value != "") {
            var d = new Dialogue(count++, inputText.value, inputActor.value);
            dialogues.push(d);
            var el = dialogueHTML(d);
            el.style.top = "10px";
            el.style.left = "10px";
            dragElement(el);
            setLinks(el);
            projectE.appendChild(el);
            inputText.value = "";
            inputActor.value = "";
            inputDialog.classList.toggle('show');
        }
    });
    document.getElementById('cancel-dialogue').addEventListener('click', function () {
        var inputText = document.getElementById("dialogText");
        var inputActor = document.getElementById("dialogActor");
        inputText.value = "";
        inputActor.value = "";
        inputDialog.classList.toggle('show');
    });
    document.getElementById('add-dialog').addEventListener('click', function () {
        inputDialog.classList.toggle('show');
    });
    document.getElementById('export-file').addEventListener('click', function () {
        var filename = document.getElementById('file-title').innerText;
        exportData(filename, dialogues);
        downloadDialog.classList.toggle('show');
    });
    document.getElementById('cancel-export').addEventListener('click', function () {
        downloadDialog.classList.toggle('show');
    });
    document.getElementById('file-title').addEventListener('dblclick', function () {
        var fileTitle = document.getElementById('file-title');
        fileTitle.style.display = 'none';
        var inputFeild = document.createElement('input');
        inputFeild.id = 'input-file-title';
        inputFeild.value = fileTitle.innerText;
        fileTitle.parentNode.appendChild(inputFeild);
        document.onclick = function (e) {
            var target = (e.target || e.srcElement);
            if (target.id != "input-file-title") {
                fileTitle.innerText = inputFeild.value;
                fileTitle.style.display = 'block';
                inputFeild.parentNode.removeChild(inputFeild);
                document.onclick = null;
                document.onkeyup = null;
            }
        };
        document.onkeyup = function (e) {
            if (e.keyCode == 13 || e.keyCode == 27) {
                fileTitle.innerText = inputFeild.value;
                fileTitle.style.display = 'block';
                inputFeild.parentNode.removeChild(inputFeild);
                document.onclick = null;
                document.onkeyup = null;
            }
        };
    });
    var fileInput = document.getElementById('file-input');
    fileInput.addEventListener('change', function () {
        var curFiles = fileInput.files;
        if (curFiles.length === 1) {
            var file = curFiles[0];
            var reader = new FileReader();
            reader.onload = function (ev) {
                if (reader.result != "") {
                    var data = JSON.parse(reader.result);
                    if (data.length != 0) {
                        for (var i = 0; i < data.length; i++) {
                            var dialogue = data[i];
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
                        dialogues.forEach(function (d) {
                            if (d.nextDialogue.length != 0) {
                                d.nextDialogue.forEach(function (item) {
                                    var elmnt1 = document.querySelector(".dialogue[data-id='" + d.id + "']");
                                    var elmnt2 = document.querySelector(".dialogue[data-id='" + item + "']");
                                    var dimension = getDimensionDiff(elmnt1, elmnt2);
                                    var shtml = createLine(dimension, elmnt1, elmnt2);
                                    var projectE = document.getElementById('project');
                                    projectE.appendChild(shtml);
                                });
                            }
                        });
                        count = data.length;
                    }
                }
            };
            reader.readAsBinaryString(file.slice());
        }
    });
});