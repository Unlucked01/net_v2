const contextMenu = document.getElementById('context-menu');
let rightClickPosition = { x: 0, y: 0 };


window.addEventListener('click', () => {
    contextMenu.style.display = 'none';
});

canvas.addEventListener('contextmenu', event => {
    event.preventDefault();

    rightClickPosition.x = event.offsetX;
    rightClickPosition.y = event.offsetY;

    contextMenu.style.top = `${event.pageY}px`;
    contextMenu.style.left = `${event.pageX}px`;
    contextMenu.style.display = 'block';
});

document.getElementById('add-node').addEventListener('click', () => {
    addNode();
});

document.getElementById('delete-node').addEventListener('click', () => {
    setMode('deleteNode');
});

document.getElementById('add-edge').addEventListener('click', () => {
    setMode('addEdge');
})

document.getElementById('delete-edge').addEventListener('click', () => {
    setMode('deleteEdge');
})

document.getElementById('edit-edge').addEventListener('click', () => {
    setMode('editEdge')
})

document.getElementById('point-start').addEventListener('click', () => {
    setMode('pointStart');
});

document.getElementById('point-stop').addEventListener('click', () => {
   setMode('pointStop');
});

document.getElementById('start-comp').addEventListener('click', () => {
    fetchComparisonResults();
});

document.addEventListener("DOMContentLoaded", () => {
    const startPackets = document.getElementById("start-packets");
    const routingMenu = document.getElementById("routing-menu");


    let selectedMethod = null;

    startPackets.addEventListener("click", (e) => {
        e.stopPropagation();
        routingMenu.classList.toggle("visible");
    });

    document.addEventListener("click", () => {
        if (routingMenu.classList.contains("visible")) {
            routingMenu.classList.remove("visible");
        }
    });

    routingMenu.addEventListener("click", (e) => {
        e.stopPropagation();

        if (e.target.dataset.method) {
            selectedMethod = e.target.dataset.method;
            console.log("Selected routing method:", selectedMethod);

            let packetNumber = +prompt("Ведите количество пакетов!")
            let ttl = +prompt("Введите ttl:")

            sendPacketByMethod([startNode], stopNode, packetNumber, ttl, selectedMethod);
        }
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const clearTableButton = document.getElementById("clear-routing-table");

    clearTableButton.addEventListener("click", () => {
        document.querySelector("#routingTable tbody").innerHTML = "";
        console.log("Routing table cleared.");
    });
});
