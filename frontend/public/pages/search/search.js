const selectedMatrixCells = [...Array(6)].map(x => Array(6).fill(false));
const axes = ["R1", "R2", "R3", "T1", "T2", "T3"];


window.onload = function () {
    initMatrix();
    initInputEvents();
};

function initMatrix() {
    const cells = document.getElementsByTagName("td");
    for (let i = 0; i < cells.length; i++) {
        cells[i].onclick = matrixClickHandler;
    }
    updateMatrix();
}

function initInputEvents() {
    $("img[class=icon], input[type=number], input[type=search], input[type=radio]").on("change keydown paste input click", function () {
        searchMechanism();
        updateMatrix()
    });

    $("input[name='radioInputMode']").on("change click", function () {
        toggleInputMode();
    });
}


String.prototype.format = function () {
    let string = this;
    for (const i in arguments) {
        string = string.replace(new RegExp("\\{" + i + "\\}", "g"), arguments[i]);
    }
    return string
};

function setImage(img, baseFileName, value, tristate = false) {
    baseFileName = baseFileName
        .replace("input", "")
        .replace("output", "")
        .toLowerCase();
    switch (value) {
        case true:
            img.src = "icons/" + baseFileName + "_selected.png";
            break;
        case false:
            if (tristate) {
                img.src = "icons/" + baseFileName + "_deselected.png";
            } else {
                img.src = "icons/" + baseFileName + ".png";
            }
            break;
        default:
            // ""
            img.src = "icons/" + baseFileName + ".png";
    }
}

function toggleImage(img) {
    switch ($(img).data("status")) {
        case true:
            $(img).data("status", false);
            break;
        case false:
            $(img).data("status", "");
            break;
        default:
            // ""
            $(img).data("status", true);
    }
    setImage(img, img.id, $(img).data("status"), true);
    updateMatrix();
}

function getParameters() {
    const parameters = {
        inputR1: $("#inputR1").data("status"),
        inputR2: $("#inputR2").data("status"),
        inputR3: $("#inputR3").data("status"),
        inputT1: $("#inputT1").data("status"),
        inputT2: $("#inputT2").data("status"),
        inputT3: $("#inputT3").data("status"),
        outputR1: $("#outputR1").data("status"),
        outputR2: $("#outputR2").data("status"),
        outputR3: $("#outputR3").data("status"),
        outputT1: $("#outputT1").data("status"),
        outputT2: $("#outputT2").data("status"),
        outputT3: $("#outputT3").data("status"),
        transmission: $("#transmission-value").val(),
        transmission_inverted: $("input[name='radioInverted']:checked").val(),
        transmission_guessed: $("input[name='radioGuessed']:checked").val(),
        name: $("#name").val(),
        parametric_model: $("input[name='radio3DModel']:checked").val(),
        complete: $("input[name='radioMatrix']:checked").val()
    };

    // read matrix
    if (document.getElementById("radioMatrixInput").checked) {
        for (let x = 0; x < 6; x++) {
            for (let y = 0; y < 6; y++) {
                const inputAxis = "input" + mapNumberToAxis(y);
                const outputAxis = "output" + mapNumberToAxis(x);
                if (selectedMatrixCells[y][x]) {
                    if (parameters[inputAxis] === undefined) {
                        parameters[inputAxis] = true;
                    }
                    if (parameters[outputAxis] === undefined) {
                        parameters[outputAxis] = true;
                    }
                }
            }
        }
    }

    // remove undefined parameters
    for (const key of Object.keys(parameters)) {
        if (parameters[key] === undefined || parameters[key] === "") {
            delete parameters[key];
        }
    }

    return parameters;
}

function getUrlWithParameters(baseUrl, parameters) {
    let url = new URL(baseUrl);
    for (const key of Object.keys(parameters)) {
        url.searchParams.append(key, parameters[key]);
    }
    return url;
}

function showResultInfo(responseLength) {
    const resultInfo = document.getElementById("resultInfo");
    if (responseLength === 1) {
        resultInfo.innerText = "1 result";
    } else {
        resultInfo.innerText = responseLength + " results";
        if (responseLength === 0) {
            const url = getUrlWithParameters("http://mechanism-browser/create/", getParameters());
            resultInfo.innerHTML = 'No results found. Do you want to <a href="' + url + '">create</a> it?';
        }
    }
}

function setButtonStatus(button, activated, searchUrl) {
    button.disabled = !activated;
    button.setAttribute("onclick", "searchMechanism('" + searchUrl + "')");
}

function showPageInfo(first, previous, current, next, last) {
    const pageInfo = document.getElementById("pageInfo");
    if (first === last) {
        pageInfo.style.display = "none";
        return;
    }
    pageInfo.style.display = "";

    const lastUrl = new URL(last);
    const pages = parseInt(lastUrl.searchParams.get("page"));
    const currentPage = current;

    document.getElementById("pageInfoText").textContent = "{0}/{1}".format(currentPage, pages);

    setButtonStatus(document.getElementById("firstPage"), currentPage !== 1, first);
    setButtonStatus(document.getElementById("previousPage"), previous !== null, previous);
    setButtonStatus(document.getElementById("nextPage"), next !== null, next);
    setButtonStatus(document.getElementById("lastPage"), currentPage !== pages, last);
}

function updateStyles() {
    const documentHeight = document.getElementsByTagName("html")[0].offsetHeight;
    document.getElementById("content").style.display = "";
    document.getElementsByTagName("body")[0].style.height = "auto";
    document.getElementsByClassName("background")[0].style.minHeight = documentHeight + "px";
    document.getElementsByClassName("background-overlay")[0].style.minHeight = documentHeight + "px";
}

function showRating(entry, rating) {
    const star = entry.querySelector("span.glyphicon-star");
    entry.querySelector("div.mechanism-rating").textContent = rating;
    if (rating < 0) {
        star.style.color = "red";
    } else if (rating === 0) {
        star.style.color = "grey";
    } else {
        star.style.color = "orange";
    }
}

function showParameters(entry, mechanism) {
    for (const axis of axes) {
        const inputImage = entry.querySelector("img.input" + axis);
        const outputImage = entry.querySelector("img.output" + axis);
        setImage(inputImage, "input" + axis, mechanism.input[axis.toLowerCase()]);
        setImage(outputImage, "output" + axis, mechanism.output[axis.toLowerCase()]);
    }
}

function searchMechanism(baseUrl = "http://mechanism-browser:8000/api/mechanisms/") {
    const xhttp = new XMLHttpRequest();
    const url = getUrlWithParameters(baseUrl, getParameters());
    xhttp.open("GET", url.toString());
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send();
    xhttp.onreadystatechange = function () {
        if (xhttp.readyState === 4 && xhttp.status === 200) {
            const response = JSON.parse(xhttp.responseText);
            updateStyles();
            showResultInfo(response.count);
            showPageInfo(response.first, response.previous, response.current, response.next, response.last);
            const list = document.getElementById("mechanisms");
            list.innerHTML = "";

            // https://stackoverflow.com/a/41447500/8816968
            for (const mechanismId of Object.keys(response.results)) {
                const mechanism = response.results[mechanismId];
                const entry = document.querySelector("div[data-type='template']").cloneNode(true);
                entry.querySelector("a.mechanism-name").textContent = mechanism.name;
                entry.querySelector("a.mechanism-name").href = "mechanism/" + mechanism.id;
                entry.querySelector("a.image-link").href = "mechanism/" + mechanism.id;
                entry.querySelector("img").src = mechanism.image.substring(1);
                entry.querySelector("div.mechanism-description").textContent = mechanism.comments;
                showRating(entry, mechanism.rating_likes - mechanism.rating_dislikes);
                showParameters(entry, mechanism);
                if (mechanism.complete === false) {
                    entry.querySelector("p.mechanism-incomplete-note").style.display = "inline-block";
                }
                entry.querySelector("a.mechanism-link").textContent = mechanism.link;
                entry.querySelector("a.mechanism-link").href = mechanism.link;
                entry.style.display = "block";
                list.appendChild(entry);
            }
        }
    };
}

function createMechanism() {
    window.location.href = getUrlWithParameters("http://mechanism-browser/create/", getParameters());
}

function toggleInputMode() {
    if (document.getElementById("radioMatrixInput").checked) {
        document.getElementById("inputColumn").style.display = "none";
        document.getElementById("outputColumn").style.display = "none";
        document.getElementById("matrixColumn").style.display = "";

        for (const io of ["input", "output"]) {
            for (const axis of axes) {
                const axisSelector = "#" + io + axis;
                const icon = $(axisSelector);
                icon.appendTo($(axisSelector + "Placeholder"));
                icon.css("marginBottom", "0px");
            }
        }
    } else {
        document.getElementById("inputColumn").style.display = "";
        document.getElementById("outputColumn").style.display = "";
        document.getElementById("matrixColumn").style.display = "none";

        for (const io of ["input", "output"]) {
            for (const axis of axes) {
                const axisSelector = "#" + io + axis;
                const icon = $(axisSelector);
                icon.appendTo($("#" + io + "Column"));
                icon.css("marginBottom", "20px");
            }
        }
    }
}

function mapNumberToAxis(number) {
    switch (number) {
        case 0:
            return "R1";
        case 1:
            return "R2";
        case 2:
            return "R3";
        case 3:
            return "T1";
        case 4:
            return "T2";
        case 5:
            return "T3";
        default:
            return undefined;
    }
}

function matrixClickHandler(e) {
    // https://stackoverflow.com/a/12193346/8816968
    e = e || window.event;
    const cell = e.target || e.srcElement;
    const inputIndex = cell.parentNode.rowIndex - 2;
    const outputIndex = cell.cellIndex - 1;
    if (inputIndex >= 0 && outputIndex >= 0) {
        selectedMatrixCells[inputIndex][outputIndex] = !selectedMatrixCells[inputIndex][outputIndex];
        if (selectedMatrixCells[inputIndex][outputIndex]) {
            cell.style.border = "5px solid rgb(0, 162, 232)";
        } else {
            cell.style.border = "0px";
        }
        updateMatrix();
        searchMechanism("http://mechanism-browser:8000/api/mechanisms/");
    }
}

function lerp(value, min, max) {
    return min + (max - min) * value;
}

function isDark(r, g, b) {
    return (r + g + b) / 3 < 130;
}

function setCellColor(cell, value, minValue, maxValue) {
    let colorValue = 0.0;
    if (value > maxValue) {
        colorValue = 1.0;
    } else if (value > 0) {
        colorValue = Math.min(0.9, Math.max(0.1, (value - minValue) / (maxValue - minValue)));
    }

    const startR = 180;
    const startG = 225;
    const startB = 165;
    const endR = 35;
    const endG = 105;
    const endB = 60;
    const r = lerp(colorValue, startR, endR);
    const g = lerp(colorValue, startG, endG);
    const b = lerp(colorValue, startB, endB);

    $(cell).css("background-color", "rgb(" + r + ", " + g + ", " + b + ")");
    if (isDark(r, g, b)) {
        $(cell).css("color", "white");
    } else {
        $(cell).css("color", "black");
    }
}

function updateMatrix() {
    const xhttp = new XMLHttpRequest();
    const url = getUrlWithParameters("http://mechanism-browser:8000/api/mechanisms/matrix/", getParameters());
    xhttp.open("GET", url.toString());
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send();
    xhttp.onreadystatechange = function () {
        if (xhttp.readyState === 4 && xhttp.status === 200) {
            const response = JSON.parse(xhttp.responseText);
            let minValue = 0;
            let maxValue = 0;
            for (let y = 0; y < 6; y++) {
                for (let x = 0; x < 6; x++) {
                    minValue = Math.min(minValue, response[y][x]);
                    maxValue = Math.max(maxValue, response[y][x]);
                }
            }

            for (let y = 0; y < 6; y++) {
                for (let x = 0; x < 6; x++) {
                    const row = y + 2;
                    const column = x + 1;
                    const cell = $("#matrix")[0].rows[row].cells[column];
                    cell.textContent = response[y][x];
                    setCellColor(cell, response[y][x], minValue, maxValue)
                }
            }
        }
    };
}