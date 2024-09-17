const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const positions = {};
let draggingNode = {};
let isDragging = false;
let dragOffset = { x: 0, y: 0 };

let shortestPath = [];

let graph = {};

// Функция для получения случайного положения вершины
function getRandomPosition(maxX, maxY) {
    const padding = 50; // чтобы вершины не располагались слишком близко к краю
    return {
        x: Math.random() * (maxX - padding * 2) + padding,
        y: Math.random() * (maxY - padding * 2) + padding
    };
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

// Начальная загрузка графа
fetch('/get-graph')
    .then(response => response.json())
    .then(graphData => {
        for (const node in graphData) {
            positions[node] = getRandomPosition(canvas.width, canvas.height);
        }
        graph = graphData;

        fetch('/shortest-path?source=A&target=B')
            .then(response => response.json())
            .then(data => {
                shortestPath = data.path;
                console.log('Shortest path:', shortestPath);
                // Перерисовываем граф, выделив кратчайший путь
                drawGraph();
            });
    })
    .catch(error => console.error('Error fetching graph:', error));

// Функция для определения узла, на который кликнули
function getClickedNode(x, y) {
    for (const node in positions) {
        const pos = positions[node];
        const dx = x - pos.x;
        const dy = y - pos.y;

        // Проверяем, находится ли клик внутри радиуса узла
        if (Math.sqrt(dx * dx + dy * dy) < 20) {
            return node;
        }
    }
    return null; // Если клик не попадает ни на один узел
}


// Обработка события мыши для перетаскивания узлов
canvas.addEventListener('mousedown', (event) => {
    const mouseX = event.offsetX;
    const mouseY = event.offsetY;

    // Получаем узел, по которому кликнули
    const clickedNode = getClickedNode(mouseX, mouseY);

    if (clickedNode) {
        isDragging = true;
        draggingNode = positions[clickedNode];
        dragOffset.x = mouseX - draggingNode.x;
        dragOffset.y = mouseY - draggingNode.y;
    }
});

canvas.addEventListener('mousemove', (event) => {
    if (draggingNode && isDragging) {
        const mouseX = event.offsetX;
        const mouseY = event.offsetY;
        const pos = draggingNode;
        pos.x = mouseX - dragOffset.x;
        pos.y = mouseY - dragOffset.x;
        drawGraph();
    }
});

canvas.addEventListener('mouseup', () => {
    draggingNode = null;
});