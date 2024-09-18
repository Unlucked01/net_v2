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