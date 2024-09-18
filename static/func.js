window.onload = fetchGraph;

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

function getClickedEdge(x, y) {
    const tolerance = 10;
    for (const nodeFrom in graph) {
        const fromPos = positions[nodeFrom];
        for (const nodeTo in graph[nodeFrom]){
            const toPos = positions[nodeTo];
            const distance = pointToLineDistance(x, y, fromPos.x, fromPos.y, toPos.x, toPos.y);
             if (distance < tolerance) {
                return {nodeFrom: nodeFrom, nodeTo: nodeTo};
            }
        }
    }
    return null; // No edge found
}

function pointToLineDistance(x, y, x1, y1, x2, y2) {
    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    let param = -1;
    if (len_sq !== 0) param = dot / len_sq;

    let xx, yy;

    if (param < 0) {
        xx = x1;
        yy = y1;
    } else if (param > 1) {
        xx = x2;
        yy = y2;
    } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }

    const dx = x - xx;
    const dy = y - yy;
    return Math.sqrt(dx * dx + dy * dy);
}

function logEvent(message) {
    logArea.value += `${message}\n`;
    logArea.scrollTop = logArea.scrollHeight;
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

function addNode(){
    fetch('/node', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
    })
    .then(response => response.json())
    .then(data => {
        fetchGraph();
        logEvent(data.message);
    })
    .catch(error => {
        logEvent(`Error adding node: ${error}`);
    });
}

function deleteNode(node){
    fetch('/node', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({node: node})
    })
    .then(response => response.json())
    .then(data => {
        fetchGraph();
        logEvent(data.message);
    })
    .catch(error => {
        logEvent(`Error deleting node: ${error}`);
    });
}

function addEdge(nodeFrom, nodeTo, weight){
    fetch('/edge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({nodeFrom: nodeFrom, nodeTo: nodeTo, weight: weight})
    })
    .then(response => response.json())
    .then(data => {
        fetchGraph();
        logEvent(data.message);
    })
    .catch(error => {
        logEvent(`Error adding edge: ${error}`);
    });
}

function deleteEdge(nodeFrom, nodeTo) {
    fetch('/edge', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({nodeFrom: nodeFrom, nodeTo: nodeTo})
    })
    .then(response => response.json())
    .then(data => {
        fetchGraph();
        logEvent(data.message);
    })
    .catch(error => {
        logEvent(`Error deleting edge: ${error}`);
    });
}

function saveNodePosition(node, x, y) {
    fetch('/position', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ node: node, x: x, y: y }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.error(data.error);
        } else {
            console.log(data.message);
        }
    })
    .catch(error => {
        console.error('Error updating position:', error);
    });
}