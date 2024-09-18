const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let draggingNode = {};
let dragOffset = { x: 0, y: 0 };
let clickedNode = null;

let currentMode = null;

let startNode = '1';
let stopNode = null;

let shortestPath = [];

let graph = {};
let positions = {};

const logArea = document.getElementById('log');

function logEvent(message) {
    logArea.value += `${message}\n`;
    logArea.scrollTop = logArea.scrollHeight;
}

// Функция для рисования графа
function drawGraph() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Рисуем рёбра
    for (const nodeFrom in graph) {
        const fromPos = positions[nodeFrom];
        for (const nodeTo in graph[nodeFrom]) {
            const toPos = positions[nodeTo];
            const weight = graph[nodeFrom][nodeTo];
            // Определяем, если это часть кратчайшего пути
            const isHighlighted = shortestPath.some((node, index) =>
                (index < shortestPath.length - 1 &&
                ((shortestPath[index] === nodeFrom && shortestPath[index + 1] === nodeTo) ||
                (shortestPath[index] === nodeTo && shortestPath[index + 1] === nodeFrom)))
            );
            // Линия для ребра
            ctx.beginPath();
            ctx.moveTo(fromPos.x, fromPos.y);
            ctx.lineTo(toPos.x, toPos.y);
            ctx.strokeStyle = isHighlighted ? 'red' : 'gray';
            ctx.lineWidth = isHighlighted ? 4 : 3;
            ctx.stroke();

            // Пишем вес ребра посередине линии
            const midX = (fromPos.x + toPos.x) / 2;
            const midY = (fromPos.y + toPos.y) / 2;
            ctx.font = '24px Arial';
            ctx.fillStyle = 'black';
            ctx.fillText(weight, midX + 10, midY);
        }
    }
    // Рисуем узлы
    for (const node in positions) {
        const pos = positions[node];
        // Рисуем круг для узла
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 20, 0, 2 * Math.PI);
        ctx.fillStyle = 'blue';
        ctx.fill();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Пишем идентификатор узла
        ctx.font = 'bold 20px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node, pos.x, pos.y);
    }
}

function fetchGraph(){
    fetch('/graph')
        .then(response => response.json())
        .then(graphData => {
            graph = graphData.graph;
            positions = graphData.positions;
            console.log(graph);
            drawGraph();
            fetchHighlightPath();
        })
        .catch(error => console.error('Error fetching graph:', error));
}

function fetchHighlightPath(){
    if (startNode === null || stopNode === null) {
        return
    }
    fetch(`/path?source=${startNode}&target=${stopNode}`)
        .then(response => response.json())
        .then(data => {
            shortestPath = data.path;
            console.log('Shortest path:', shortestPath);
            drawGraph();
        })
        .catch(error => console.error('Error highlighting graph', startNode, stopNode));
}


function getClickedNode(x, y) {
    for (const node in positions) {
        const pos = positions[node];
        const dx = x - pos.x;
        const dy = y - pos.y;

        if (Math.sqrt(dx * dx + dy * dy) < 20) {
            return node;
        }
    }
    return null;
}

canvas.addEventListener('click',event => {
    const mouseX = event.offsetX;
    const mouseY = event.offsetY;

    const clickedNode = getClickedNode(mouseX, mouseY);

    switch (currentMode) {
        case 'pointStart':
            logEvent("Point start.")
            startNode = clickedNode;
            fetchHighlightPath();
            break;
        case 'pointStop':
            logEvent("Point stop.")
            stopNode = clickedNode;
            fetchHighlightPath();
            break;
        case 'deleteNode':
            if (clickedNode) {
                const confirmRemove = confirm(`Do you want to remove node ${clickedNode}?`);
                if (confirmRemove) deleteNode(clickedNode);
            }
            break;
    }

    currentMode = null;
});

canvas.addEventListener('mousedown', (event) => {
    const mouseX = event.offsetX;
    const mouseY = event.offsetY;
    clickedNode = getClickedNode(mouseX, mouseY);

    if (clickedNode) {
        draggingNode = positions[clickedNode];
        dragOffset.x = mouseX - draggingNode.x;
        dragOffset.y = mouseY - draggingNode.y;
    }
});

canvas.addEventListener('mousemove', (event) => {
    if (draggingNode !== {} && draggingNode) {
        const mouseX = event.offsetX;
        const mouseY = event.offsetY;
        draggingNode.x = mouseX - dragOffset.x;
        draggingNode.y = mouseY - dragOffset.y;
        drawGraph();
    }
});

canvas.addEventListener('mouseup', () => {
    if (clickedNode) {
         saveNodePosition(clickedNode, draggingNode.x, draggingNode.y)
    }
    draggingNode = null;
});


function setMode(mode) {
    currentMode = mode;
}

window.onload = fetchGraph;