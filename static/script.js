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

let graph = {};
let positions = {};

const logArea = document.getElementById('log');

function drawGraph() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const nodeFrom in graph) {
        const fromPos = positions[nodeFrom];
        for (const nodeTo in graph[nodeFrom]) {
            const toPos = positions[nodeTo];
            const weight = graph[nodeFrom][nodeTo];

            const isHighlighted = shortestPath.some((node, index) =>
                (index < shortestPath.length - 1 &&
                ((shortestPath[index] === nodeFrom && shortestPath[index + 1] === nodeTo) ||
                (shortestPath[index] === nodeTo && shortestPath[index + 1] === nodeFrom)))
            );

            ctx.beginPath();
            ctx.moveTo(fromPos.x, fromPos.y);
            ctx.lineTo(toPos.x, toPos.y);
            ctx.strokeStyle = isHighlighted ? 'red' : 'gray';
            ctx.lineWidth = isHighlighted ? 4 : 3;
            ctx.stroke();

            const midX = (fromPos.x + toPos.x) / 2;
            const midY = (fromPos.y + toPos.y) / 2;
            ctx.font = '24px Arial';
            ctx.fillStyle = 'black';
            ctx.fillText(weight, midX + 10, midY);
        }
    }
    for (const node in positions) {
        const pos = positions[node];

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 20, 0, 2 * Math.PI);

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
            logEvent("Point start.")
            if (startNode !== clickedNode && stopNode !== startNode) alert('Start and Stop node must be different!')
            startNode = clickedNode;
            fetchHighlightPath();
            currentMode = null;
            break;
        case 'pointStop':
            logEvent("Point stop.")
            stopNode = clickedNode;
            fetchHighlightPath();
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
    if (draggingNode !== {} && draggingNode) {
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
});


