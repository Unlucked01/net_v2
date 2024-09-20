const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let draggingNode = {};
let dragOffset = { x: 0, y: 0 };
let initialNodePosition = { x: 0, y: 0 };
let clickedNode = null;

let currentMode = null;

let startNode = '1';
let stopNode = null;

let nodeFrom = null;
let nodeTo = null;

let shortestPath = [];
let distance = null;

let graph = {};
let positions = {};

const logArea = document.getElementById('log');

function drawGraph() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const offset = 10;  // Отступ для кривых линий
    const weightOffset = 50;  // Смещение для отображения веса рёбер
    const nodeRadius = 19;  // Радиус вершины

    // Сначала рисуем рёбра и стрелки
    for (const nodeFrom in graph) {
        const fromPos = positions[nodeFrom];
        for (const nodeTo in graph[nodeFrom]) {
            const toPos = positions[nodeTo];
            const weight = graph[nodeFrom][nodeTo];

            const hasReverseEdge = graph[nodeTo] && graph[nodeTo][nodeFrom] !== undefined;

            const isHighlighted = shortestPath.some((node, index) =>
                (index < shortestPath.length - 1 &&  (shortestPath[index] === nodeFrom && shortestPath[index + 1] === nodeTo))
            );

            ctx.beginPath();

            const angle = Math.atan2(toPos.y - fromPos.y, toPos.x - fromPos.x);

            const toX = toPos.x - nodeRadius * Math.cos(angle);
            const toY = toPos.y - nodeRadius * Math.sin(angle);

            // Отображение веса
            const midWeightX = (fromPos.x + toX) / 2 + (fromPos.y - toPos.y) / weightOffset;
            const midWeightY = (fromPos.y + toY) / 2 + (toPos.x - fromPos.x) / weightOffset;

            if (hasReverseEdge) {
                const midX = (fromPos.x + toX) / 2;
                const midY = (fromPos.y + toY) / 2;
                const controlX = midX + (fromPos.y - toPos.y) / offset; // Отступ для закругления
                const controlY = midY + (toPos.x - fromPos.x) / offset;

                ctx.moveTo(fromPos.x, fromPos.y);
                ctx.quadraticCurveTo(controlX, controlY, toX, toY);

                ctx.font = '24px Arial';
                ctx.fillStyle = 'black';
                ctx.fillText(weight, midWeightX, midWeightY);
            } else {
                ctx.moveTo(fromPos.x, fromPos.y);
                ctx.lineTo(toX, toY);

                ctx.font = '24px Arial';
                ctx.fillStyle = 'black';
                ctx.fillText(weight, midWeightX, midWeightY);
            }

            ctx.strokeStyle = isHighlighted ? 'red' : 'gray';
            ctx.lineWidth = isHighlighted ? 4 : 3;
            ctx.stroke();

            const arrowSize = 15;
            ctx.beginPath();
            ctx.moveTo(toX, toY);
            ctx.lineTo(
                toX - arrowSize * Math.cos(angle - Math.PI / 6),
                toY - arrowSize * Math.sin(angle - Math.PI / 6)
            );
            ctx.lineTo(
                toX - arrowSize * Math.cos(angle + Math.PI / 6),
                toY - arrowSize * Math.sin(angle + Math.PI / 6)
            );
            ctx.closePath();
            ctx.fillStyle = isHighlighted ? 'red' : 'gray';
            ctx.fill();
        }
    }

    for (const node in positions) {
        const pos = positions[node];

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, nodeRadius, 0, 2 * Math.PI);
        if (node === startNode) {
            ctx.strokeStyle = 'green';
            ctx.lineWidth = 10;
        } else if (node === stopNode) {
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 10;
        } else {
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 4;
        }

        ctx.stroke();
        ctx.fillStyle = 'blue';
        ctx.fill();

        ctx.font = 'bold 20px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node, pos.x, pos.y);
    }
}

canvas.addEventListener('click',event => {
    const mouseX = event.offsetX;
    const mouseY = event.offsetY;

    const clickedNode = getClickedNode(mouseX, mouseY);
    const clickedEdge = getClickedEdge(mouseX, mouseY);

    switch (currentMode) {
        case 'pointStart':
            logEvent(`Point start. Current start node: ${startNode}`)
            startNode = clickedNode;
            logEvent(`New start node: ${startNode}`)
            fetchGraph();
            currentMode = null;
            break;
        case 'pointStop':
            logEvent("Point stop.")
            stopNode = clickedNode;
            fetchGraph();
            currentMode = null;
            break;

        case 'deleteNode':
            if (clickedNode) {
                const confirmRemove = confirm(`Do you want to remove node ${clickedNode}?`);
                if (confirmRemove) deleteNode(clickedNode);
            }
            currentMode = null;
            break;

        case 'addEdge':
            if (clickedNode) {
                if (!nodeFrom){
                    nodeFrom = clickedNode;
                    logEvent(`First node selected: ${clickedNode}`);

                } else if (!nodeTo) {
                    nodeTo = clickedNode;
                    logEvent(`Second node selected: ${clickedNode}`);
                    const weight = prompt('Enter edge weight:', '1');
                    if (weight) {
                        addEdge(nodeFrom, nodeTo, parseInt(weight));
                        nodeFrom = null;
                        nodeTo = null;
                        currentMode = null;
                    }
                }

            }
            break;

        case 'deleteEdge':
            if (clickedEdge) {
                const confirmRemove = confirm(`Do you want to remove edge from node '${clickedEdge.nodeFrom}' to node '${clickedEdge.nodeTo}'?`);
                if (confirmRemove) deleteEdge(clickedEdge.nodeFrom, clickedEdge.nodeTo);
            }
            currentMode = null;
            break;

        case 'editEdge':
            if (clickedEdge) {
                const weight = prompt('Enter new edge weight:', '1');
                if (weight) {
                    editEdge(clickedEdge.nodeFrom, clickedEdge.nodeTo, parseInt(weight));
                }
            }
            currentMode = null;
            break;

    }
});

canvas.addEventListener('mousedown', (event) => {
    const mouseX = event.offsetX;
    const mouseY = event.offsetY;
    clickedNode = getClickedNode(mouseX, mouseY);

    if (clickedNode) {
        draggingNode = positions[clickedNode];
        dragOffset.x = mouseX - draggingNode.x;
        dragOffset.y = mouseY - draggingNode.y;

        initialNodePosition.x = draggingNode.x;
        initialNodePosition.y = draggingNode.y;
    }
});

canvas.addEventListener('mousemove', (event) => {
    if (draggingNode !== {} && clickedNode) {
        const mouseX = event.offsetX;
        const mouseY = event.offsetY;
        draggingNode.x = mouseX - dragOffset.x;
        draggingNode.y = mouseY - dragOffset.y;

        drawGraph();
    }
});

canvas.addEventListener('mouseup', () => {
    if (draggingNode.x !== initialNodePosition.x || draggingNode.y !== initialNodePosition.y) {
         saveNodePosition(clickedNode, draggingNode.x, draggingNode.y)
    }
    draggingNode = null;
    clickedNode = null;
});


