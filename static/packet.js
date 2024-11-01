// Инициализируем массив для хранения активных пакетов
const packets = [];
const packetSpeed = 0.02;
let routingTable = []


function sendPacketByMethod(sourceNode, targetNode, packetNumber, ttl, method) {
    for (let i = 0; i <= packetNumber; i++) {
        setTimeout(() => {
            const packet = {
                path: [sourceNode],
                currentIndex: 0,
                packetNumber: i,
                routingMethod: method,
                destination: targetNode,
                ttl: ttl
            };
            packets.push(packet);
            animatePacketMovement(packet);
            console.log(`Packet ${i} created and animated with method: ${method}`);
        }, i * 1500)
    }
}


function animatePacketMovement(packet) {
    const path = packet.path;

    if (packet.currentIndex >= path.length - 1) {
        if (packet.ttl <= 0) {
            console.log(`Packet ${packet.packetNumber} expired or reached the destination.`);
            return;
        }
        if (packet.routingMethod === 'virtual') {
            console.log(shortestPath);
            packet.path = shortestPath;
        } else {
            calculateDatagramRoute(packet);
            return;
        }
    }

    let progress = 0;
    drawGraph();

    let lastX = null;
    let lastY = null;

    const animationInterval = setInterval(() => {
        const { path, currentIndex } = packet;

        if (packet.ttl <= 0 || currentIndex >= path.length - 1) {
            return;
        }

        const from = positions[path[currentIndex]];
        const to = positions[path[currentIndex + 1]];

        progress += packetSpeed;

        const x = from.x + (to.x - from.x) * progress;
        const y = from.y + (to.y - from.y) * progress;

        if (lastX !== null && lastY !== null) {
            ctx.clearRect(lastX - 15, lastY - 15, 30, 30);
        }

        drawGraphNodesOnly();

        // Рисуем пакет в новых координатах
        ctx.beginPath();
        ctx.arc(x, y, 14, 0, 2 * Math.PI);
        ctx.fillStyle = 'yellow';
        ctx.fill();

        ctx.font = 'bold 18px Arial';
        ctx.fillStyle = 'black';
        ctx.fillText(`${packet.packetNumber}`, x, y);

        lastX = x;
        lastY = y;

        if (progress >= 1) {
            packet.ttl -= 1
            if (packet.routingMethod === 'experience') {
                updateRoutingTable(routingTable[packet.currentIndex + 1]);
            }

            clearInterval(animationInterval);
            packet.currentIndex += 1;
            animatePacketMovement(packet);
        }
    }, 40);
}

function drawGraphNodesOnly() {
    const nodeRadius = 19;  // Радиус узла
    const arrowSize = 15;   // Размер стрелки

    // Отрисовываем только рёбра (стрелки) без веса и других элементов
    for (const nodeFrom in graph) {
        const fromPos = positions[nodeFrom];
        for (const nodeTo in graph[nodeFrom]) {
            const toPos = positions[nodeTo];

            // Определяем угол линии
            const angle = Math.atan2(toPos.y - fromPos.y, toPos.x - fromPos.x);

            // Вычисляем конечные координаты с учётом радиуса узла, чтобы стрелка начиналась и заканчивалась на границе узла
            const fromX = fromPos.x + nodeRadius * Math.cos(angle);
            const fromY = fromPos.y + nodeRadius * Math.sin(angle);
            const toX = toPos.x - nodeRadius * Math.cos(angle);
            const toY = toPos.y - nodeRadius * Math.sin(angle);

            // Рисуем линию между узлами
            ctx.beginPath();
            ctx.moveTo(fromX, fromY);
            ctx.lineTo(toX, toY);
            ctx.strokeStyle = 'gray';
            ctx.lineWidth = 3;
            ctx.stroke();

            // Рисуем стрелку на конце линии
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
            ctx.fillStyle = 'gray';
            ctx.fill();
        }
    }

    // Отрисовываем только узлы
    for (const node in positions) {
        const pos = positions[node];

        // Рисуем узел (круг)
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, nodeRadius, 0, 2 * Math.PI);

        // Настраиваем стиль узла: стартовый, конечный или обычный
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

        // Добавляем текст внутри узла
        ctx.font = 'bold 20px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node, pos.x, pos.y);
    }
}


function calculateDatagramRoute(packet) {
    const currentNode = packet.path[packet.currentIndex];
    const destinationNode = packet.destination;

    switch (packet.routingMethod) {
        case 'random':
            fetch(`/random_route?source=${currentNode}&target=${destinationNode}`)
                .then(response => response.json())
                .then(data => {
                    packet.path = data.path;
                    packet.currentIndex = 0;
                    animatePacketMovement(packet);
                })
                .catch(error => console.error("Ошибка при случайной маршрутизации:", error));

            break;

        case 'flood':
            fetch(`/flood_route?source=${currentNode}&target=${destinationNode}`)
                .then(response => response.json())
                .then(data => {
                    const paths = data.paths;

                    paths.forEach(path => {
                        const newPacket = {
                            ...packet,
                            path: path,
                            currentIndex: 0,
                            packetNumber: `${packet.packetNumber}`
                        };
                        packets.push(newPacket);
                        animatePacketMovement(newPacket);
                    });
                }).catch(error => console.error("Ошибка при лавинной маршрутизации:", error));
            break;

        case 'experience':
            fetch(`/experience_route?source=${currentNode}&target=${destinationNode}`)
                .then(response => response.json())
                .then(data => {
                    packet.path = data.path;
                    packet.currentIndex = 0;
                    if (data.routing_table) {
                        routingTable = data.routing_table
                    }
                    console.log(routingTable)
                    animatePacketMovement(packet);
                })
                .catch(error => console.error("Ошибка при маршрутизации на основе опыта:", error));
            break;

        default:
            console.error("Неизвестный метод маршрутизации");
            break;
    }
}

const routingTableData = {};

function updateRoutingTable(newData) {
    if (!newData) return
    const tableBody = document.querySelector("#routingTable tbody");

    for (const [node, count] of Object.entries(newData)) {
        if (routingTableData[node] !== count) {
            const row = document.createElement("tr");
            row.innerHTML = `<td>${node}</td><td>${count}</td>`;
            tableBody.appendChild(row);

            routingTableData[node] = count;
        }
    }
}



