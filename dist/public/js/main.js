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
        var lines = document.querySelectorAll("line[link*=\"" + id + "\"]");
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            var link = JSON.parse(line.getAttribute("link"));
            if (link.start == id || link.end == id) {
                var otherID = (link.start == id) ? link.end : link.start;
                var elmnt1 = document.querySelector(".dialogue[data-id='" + otherID + "']");
                var d = getDimensionDiff(elmnt1, elmnt);
                updateLine(d, elmnt1, elmnt, line);
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
            createLine(d, elmnt1, elmnt);
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
var updateLine = function (dimension, elmnt1, elmnt2, line) {
    var attrs = {};
    var svgattrs = { viewbox: "0 0 " + dimension.width + " " + dimension.height,
        style: "position: absolute; top: " + dimension.top + "px; left: " + dimension.left
            + "px; width: " + dimension.width + "px; height: " + dimension.height + "px;" };
    var link = JSON.parse(line.getAttribute('link'));
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
            attrs = { x1: dimension.left, y1: dimension.top, x2: dimension.width + dimension.left, y2: dimension.height + dimension.top };
        }
        else {
            attrs = { x1: dimension.left, y1: dimension.height + dimension.top, y2: dimension.top, x2: dimension.width + dimension.left };
        }
    }
    else {
        if (elmnt1.offsetLeft < elmnt2.offsetLeft) {
            attrs = { x1: dimension.left, y1: dimension.height + dimension.top, y2: dimension.top, x2: dimension.width + dimension.left };
        }
        else {
            attrs = { x1: dimension.left, y1: dimension.top, x2: dimension.width + dimension.left, y2: dimension.height + dimension.top };
        }
    }
    attrs['style'] = style;
    for (var k in attrs)
        line.setAttribute(k, attrs[k]);
};
function createLine(dimension, elmnt1, elmnt2) {
    var mainSVG = document.getElementById('main-svg');
    var line = (elmnt1.offsetTop < elmnt2.offsetTop) ?
        makeSVG("line", { x1: dimension.left, y1: dimension.top, x2: dimension.width + dimension.left,
            y2: dimension.height + dimension.top, "stroke-width": "2", stroke: "black", 'style': "marker-end: url(#arrowhead);",
            link: JSON.stringify({ start: elmnt1.getAttribute('data-id'), end: elmnt2.getAttribute('data-id') }) }) :
        makeSVG("line", { x1: dimension.left, y2: dimension.top, x2: dimension.width + dimension.left,
            y1: dimension.height + dimension.top, "stroke-width": "2", stroke: "black", 'style': "marker-end: url(#arrowhead);",
            link: JSON.stringify({ start: elmnt1.getAttribute('data-id'), end: elmnt2.getAttribute('data-id') }) });
    mainSVG.appendChild(line);
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
                                    createLine(dimension, elmnt1, elmnt2);
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
