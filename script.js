const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

//canvas.width = 600;
//canvas.height = 400;

let camera = {x: 0, y: 0};
let scale = 30;
let range = 1000;
let subdivs = 4;

function calculatePosition(pos) {
    const matrix = [
        [scale, 0],
        [0, -scale],
        [-camera.x + canvas.width/2, camera.y + canvas.height/2]
    ];

    return {
        x: pos.x*matrix[0][0] + pos.y*matrix[1][0] + matrix[2][0],
        y: pos.x*matrix[0][1] + pos.y*matrix[1][1] + matrix[2][1]
    };
}

function drawText(text, pos, color, size) {
    context.font = size + " Times New Roman";
    context.fillStyle = color;
    context.fillText(text, pos.x, pos.y);
}

function drawPoint(pos) {
    context.beginPath();
    context.arc(pos.x, pos.y, 2, 0, Math.PI*2);
    context.fillStyle = "white";
    context.fill();
    context.closePath();
}

function drawLine(n, p, color) {
    context.lineWidth = 3;
    context.strokeStyle = color;
    context.beginPath();
    context.moveTo(Math.round(n.x), Math.round(n.y));
    context.lineTo(Math.round(p.x), Math.round(p.y));
    context.stroke();
    context.closePath();
}

function renderSystem() {
    const left = calculatePosition({x: -range, y: 0});
    const top = calculatePosition({x: 0, y: range});
    const right = calculatePosition({x: range, y: 0});
    const bottom = calculatePosition({x: 0, y: -range});

    for (let i = -range; i < range; i++) {
        // X-axel
        drawPoint(calculatePosition({x:i, y:0}));
        if (i % 10 === 0 && i !== 0) {
            const calced = calculatePosition({x:i, y:0});
            drawText(`${i}`, {x:calced.x-7, y:calced.y+10}, "white");
        }
        

        // Y-axel
        drawPoint(calculatePosition({x:0, y:i}));
        if (i % 10 === 0 && i !== 0) {
            const calced = calculatePosition({x:0, y:i});
            drawText(`${i}`, {x:calced.x-18, y:calced.y+5}, "white");
        }
    }

    drawLine(left, right , "#ffffff");
    drawLine(top, bottom, "#ffffff");
}

function decodeY(x, graph) {
    // Handling implicit multiplication

    if (!graph) return;


    try {
        //let newString = graph.replace(/(\d+)(x|\()/g, "$1*$2");
        //newString = newString.replace(/x/g, `(${x})`);
        //newString = newString.replace(/\^/g, "**");
        let newString = graph.replaceAll("^", "**");
        newString = newString.replace(/(\d+)(x|\()/g, "$1*$2");
        newString = newString.replace(/x/g, `${x}`);
        
        //console.log(newString);
        const result = Function(
        `"use strict"; return (${newString})`
        )();
        //const result = math.evaluate(newString);
        //console.log(result);
        return result;
    }
    catch (e) {
        return NaN;
    }
}

function renderGraph(graph) {
    let prev = {x: 0, y: 0};
   
    for (let i = -range; i < range; i++) {
        for (let j = 0; j < subdivs; j++) {
            const subSize = 1/subdivs;
            const x = i+j*subSize;

            const nGraph = decodeY(x, graph);
            const point = {x: x, y: nGraph}
            const nPoint = calculatePosition(point);
        
            //drawPoint(nPoint);
            if (prev.x != 0 && prev.y != 0) {
                drawLine(prev, nPoint, "#aa0000");
            }
            
            prev = nPoint;
        }
    }
}

function clearScreen() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#aaaaaa";
    context.fillRect(0, 0, canvas.width, canvas.height);  
}

function createGraphInput(id) {
    const menu = document.getElementById("menu");
    const div = document.createElement("div");
    const colorInput = document.createElement("input");
    const graphInput = document.createElement("input");
    graphInput.id = id;
    colorInput.type = "color";
    graphInput.type = "text";

 
    //alert("sedf"); console log BS:ar just nu
    div.appendChild(graphInput);
    div.appendChild(colorInput);
    menu.insertBefore(div, document.getElementById("add-graph"));
    return graphInput;
}
let id = 0;
let graphInputs = [];

function update() {
    clearScreen();
    renderSystem();
    //drawFixedText("(100, 100)", {x: 100, y: 100}, "black");
    //drawCalculatedText("(10, 10)", {x: 0, y: 0}, "black");

    if (graphInputs.length != 0) {
        graphInputs.forEach(graph => {
            renderGraph(graph.value);
        });
    }


    requestAnimationFrame(update);
}

update();


let leftMouseDown = false;
let lastX = null;
let lastY = null;

addEventListener("mousedown", (e) => {
    leftMouseDown = true;
})
addEventListener("mouseup", (e) => {
    leftMouseDown = false;
})

document.getElementById("add-graph").onclick = function () {
    //alert("asdf");
    graphInputs.push(createGraphInput(id));
    id++;
}

addEventListener("keydown", (e) => {
    if (e.key === "r") {
        //alert("Here!");
        graphInputs.push(createGraphInput(id));
        id++;
    }
});

addEventListener("wheel", (e) => {
    scale -= e.deltaY/100;
})

addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    
    if (lastX === null) {
        lastX = x;
        lastY = y;
        return;
    }

    const deltaX = x - lastX;
    const deltaY = y - lastY;

    
    const inside =
        x >= rect.left &&
        x <= rect.right &&
        y >= rect.top &&
        y <= rect.bottom;

    if (leftMouseDown && inside) {
        camera.x -= deltaX;
        camera.y += deltaY;
    }


    lastX = x;
    lastY = y;

    //console.log(deltaX, deltaY);
});

canvas.addEventListener('mouseleave', () => {
  lastX = null;
  lastY = null;
});