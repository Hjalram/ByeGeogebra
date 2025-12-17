const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

//canvas.width = 600;
//canvas.height = 400;

let camera = {x: 0, y: 0};
let scale = {x: 30, y: 30};
let range = 1000;
let subdivs = 4;

function calculatePosition(pos) {
    const matrix = [
        [scale.x, 0],
        [0, -scale.y],
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

function clearScreen() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#aaaaaa";
    context.fillRect(0, 0, canvas.width, canvas.height);  
}

class Graph {
    constructor() {
        this.function = "3x+5";
        this.color = "#aa0000";

        // Creating the related html elements
        const menu = document.getElementById("menu");
        this.div = document.createElement("div");

        this.colorInput = document.createElement("input");
        this.functionInput = document.createElement("input");
        this.colorInput.type = "color";
        this.functionInput.type = "text";

        this.div.appendChild(this.functionInput);
        this.div.appendChild(this.colorInput);
        menu.insertBefore(this.div, document.getElementById("add-graph"));
    }

    decodeY(x) {
        if (!this.function) return;

        
        try {
            //let newString = graph.replace(/(\d+)(x|\()/g, "$1*$2");
            //newString = newString.replace(/x/g, `(${x})`);
            //newString = newString.replace(/\^/g, "**");
            let newString = this.function.replaceAll("^", "**");
            newString = newString.replace(/(\d+)(x|\()/g, "$1*$2");
            newString = newString.replace(/x/g, `${x}`);
            
            function tand(d) {return Math.tan(d * Math.PI/180);}
            function sind(d) {return Math.sin(d * Math.PI/180);}
            function cosd(d) {return Math.sin(d * Math.PI/180);}
            function tan(d) {return Math.tan(d);}
            function sin(d) {return Math.sin(d);}
            function cos(d) {return Math.sin(d);}
            function ln(d) {return Math.log(d);}
            function lg(d) {return Math.log(d)/Math.log(10);}

            const result = Function(
                "tand",
                "sind",
                "cosd",
                "tan",
                "sin",
                "cos",
                "ln",
                "lg",
                `"use strict"; return (${newString})`
            )(tand, sind, cosd, tan, sin, cos, ln, lg);

            return result;
        }
        catch (e) {
            return NaN;
        }
    }

    render() {
        this.function = this.functionInput.value;
        this.color = this.colorInput.value;

        let prev = {x: 0, y: 0};
    
        for (let i = -range; i < range; i++) {
            for (let j = 0; j < subdivs; j++) {
                const subSize = 1/subdivs;
                const x = i+j*subSize;

                const nGraph = this.decodeY(x);
                const point = {x: x, y: nGraph}
                const nPoint = calculatePosition(point);
            
                //drawPoint(nPoint);
                if (prev.x != 0 && prev.y != 0) {
                    drawLine(prev, nPoint, this.color);
                }
                
                prev = nPoint;
            }
        }
    }
}







let graphs = [];

function update() {
    clearScreen();
    renderSystem();
    //drawFixedText("(100, 100)", {x: 100, y: 100}, "black");
    //drawCalculatedText("(10, 10)", {x: 0, y: 0}, "black");

    if (graphs.length != 0) {
        graphs.forEach(graph => {
            graph.render();
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
    graphs.push(new Graph());
}

addEventListener("wheel", (e) => {
    scale.x -= e.deltaY/100;
    scale.y -= e.deltaY/100;
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