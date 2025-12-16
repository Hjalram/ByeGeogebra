const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

//canvas.width = 600;
//canvas.height = 400;

let camera = {x: 0, y: 0};
let scale = 30;
let range = 1000;

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

function drawPoint(pos) {
    context.beginPath();
    context.arc(pos.x, pos.y, 2, 0, Math.PI*2);
    context.fillStyle = "white";
    context.fill();
    context.closePath();
}

function drawLine(n, p, color) {
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

        // Y-axel
        drawPoint(calculatePosition({x:0, y:i}));
    }

    drawLine(left, right , "#ffffff");
    drawLine(top, bottom, "#ffffff");
}

function decodeY(x, graph) {
    // Handling implicit multiplication

    if (graph === "") return;

    try {
        let newString = graph.replace(/(\d+)(x|\()/g, "$1*$2");
        newString = newString.replace(/x/g, `(${x})`);
        newString = newString.replace(/\^/g, "**");

        //console.log(newString);
        const result = Function(`"use strict"; return (${newString})`)();

        //console.log(result);
        return result;
    }
    catch {
        console.log("Incorrect Form");
    }
}

function renderGraph(graph) {
    let prev = {x: 0, y: 0};
   
    for (let i = -range; i < range; i++) {
        const nGraph = decodeY(i, graph);
        const point = {x: i, y: nGraph}
        const nPoint = calculatePosition(point);
       
        //drawPoint(nPoint);
        if (prev.x != 0 && prev.y != 0) {
            drawLine(prev, nPoint, "#00ff00");
        }
        
        prev = nPoint;
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
    const graphInput = document.createElement("input");
    graphInput.id = id;
    graphInput.type = "text";

 
    //alert("sedf"); console log BS:ar just nu
    menu.insertBefore(graphInput, document.getElementById("add-graph"));
    return graphInput;
}
let id = 0;
let graphInputs = [];

function update() {
    clearScreen();
    renderSystem();
    //renderGraph("10(x^2)");
    //renderGraph("x+10");

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