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
    fetch('/add-node', {
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
});

document.getElementById('point-start').addEventListener('click', () => {
    setMode('pointStart');
    logEvent("Point start.")
});

document.getElementById('point-stop').addEventListener('click', () => {
   setMode('pointStop');
   logEvent("Point stop.")
});