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

function screenToWorld(pos) {
    const tx = -camera.x + canvas.width / 2;
    const ty =  camera.y + canvas.height / 2;

    return {
        x: (pos.x - tx) / scale.x,
        y: (pos.y - ty) / -scale.y
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
    context.fillStyle = "#a1a4b1ff";
    context.fillRect(0, 0, canvas.width, canvas.height);  
}

function roundTo(value, decimals) {
    const factor = 10 ** decimals;
    return Math.round(value * factor) / factor;
}

function createNewGraph() {
    graphs.push(new Graph());
}

class Graph {
    constructor() {
        this.function = "3x+5";
        this.color = "#aa0000";

        // Creating the related html elements
        const menu = document.getElementById("menu");
        this.div = document.createElement("div");

        this.colorInput = document.createElement("input");
        this.label = document.createElement("p");
        this.functionInput = document.createElement("input");
        this.colorInput.type = "color";
        this.functionInput.type = "text";

        this.div.appendChild(this.label);
        this.div.appendChild(this.functionInput);
        this.div.appendChild(this.colorInput);
        menu.insertBefore(this.div, document.getElementById("add-graph"));
    }

    getRightSide(expr) {
        const idx = expr.indexOf("=");
        return idx === -1 ? expr : expr.slice(idx + 1);
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
            newString = this.getRightSide(newString);
            
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

class Mouse {
    constructor() {
        this.viewPos = {x: 0, y: 0};
        this.canvasPos = {x: 0, y: 0};
        this.worldPos = {x: 0, y: 0};
        this.leftMouseDown = false;

        let lastX;
        let lastY;

        addEventListener("mousemove", (e) => {
            const rect = canvas.getBoundingClientRect();
            this.viewPos.x = e.clientX;
            this.viewPos.y = e.clientY;
            this.canvasPos.x = e.clientX - rect.left;
            this.canvasPos.y = e.clientY - rect.top;
            this.worldPos = screenToWorld(this.canvasPos);

            if (lastX === null) {
                lastX = this.canvasPos.x;
                lastY = this.canvasPos.y;
                return;
            }

            const deltaX = this.canvasPos.x - lastX;
            const deltaY = this.canvasPos.y - lastY;

            if (this.leftMouseDown && this.insideCanvas()) {
                camera.x -= deltaX;
                camera.y += deltaY;
            }

            lastX = this.canvasPos.x;
            lastY = this.canvasPos.y;

            //console.log(deltaX, deltaY);
        });

        addEventListener("wheel", (e) => {
            // a=scale.x b=scale.y c=konstant
            const c = e.deltaY/100;
            const d = (scale.y*c)/scale.x;

            scale.x -= c;
            scale.y -= d;

            //console.log(scale.x/scale.y);
        });

        canvas.addEventListener('mouseleave', () => {
            lastX = null;
            lastY = null;
        });

        addEventListener("mousedown", (e) => {
            this.leftMouseDown = true;
        });

        addEventListener("mouseup", (e) => {
            this.leftMouseDown = false;
        });
    }

    insideCanvas() {
        const rect = canvas.getBoundingClientRect();

        return this.viewPos.x >= rect.left &&
            this.viewPos.x <= rect.right &&
            this.viewPos.y >= rect.top &&
            this.viewPos.y <= rect.bottom;
    }

    showCoords() {
        if (this.insideCanvas()) {
            const mPos = {x: roundTo(this.worldPos.x, 2), y: roundTo(this.worldPos.y, 2)}
            drawText(`(${mPos.x}, ${mPos.y})`, {x: 30, y: 30}, "white", 20);
        }
    }
}

const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const mouse = new Mouse();

let camera = {x: 0, y: 0};
let scale = {x: 30, y: 30};
let range = 1000;
let subdivs = 4;
let graphs = [];

function update() {
    clearScreen();
    renderSystem();
    mouse.showCoords();

    if (graphs.length !== 0) {
        graphs.forEach(graph => {
            graph.render();
        });
    }

    requestAnimationFrame(update);
}

update();