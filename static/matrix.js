let adjacencyMatrix;

async function fetchAdjacencyMatrix() {
    try {
        const response = await fetch('/matrix');
        const data = await response.json();
        adjacencyMatrix = data.adjacency_matrix
        await displayAdjacencyMatrix()
    } catch (error) {
        console.error('Error fetching adjacency matrix:', error);
    }
}

async function displayAdjacencyMatrix() {
    const matrixContainer = document.getElementById('matrix-container');

    if (!adjacencyMatrix) {
        matrixContainer.innerHTML = 'Error loading matrix';
        return;
    }

    const nodes = Object.keys(adjacencyMatrix);
    let matrixHTML = '<table><tr><th></th>';

    nodes.forEach(node => {
        matrixHTML += `<th class="nodes">${+node + 1}</th>`;
    });
    matrixHTML += '</tr>';

    nodes.forEach((nodeFrom, rowIndex) => {
        matrixHTML += `<tr><td class="nodes">${+nodeFrom + 1}</td>`;

        nodes.forEach((nodeTo, colIndex) => {
            const weight = adjacencyMatrix[nodeFrom][nodeTo];
            matrixHTML += `<td contenteditable="true" data-from="${nodeFrom}" data-to="${nodeTo}">${weight}</td>`;
        });

        matrixHTML += '</tr>';
    });

    matrixHTML += '</table>';
    matrixContainer.innerHTML = matrixHTML;

    const cells = matrixContainer.querySelectorAll('td[contenteditable="true"]');
    cells.forEach(cell => {
        cell.addEventListener('input', handleMatrixCellChange);
    });
}

function handleMatrixCellChange(event) {
    const nodeFrom = event.target.dataset.from;
    const nodeTo = event.target.dataset.to;
    const newWeight = event.target.textContent.trim();

    if (!newWeight || isNaN(newWeight) || parseInt(newWeight) < 0) {
        event.target.textContent = adjacencyMatrix[nodeFrom][nodeTo] || 0;
        return;
    }

    let tempNodeFrom = `${+nodeFrom + 1}`
    let tempNodeTo = `${+nodeTo + 1}`
    let tempWeight = parseInt(newWeight)

    if (adjacencyMatrix[nodeFrom][nodeTo] === 0){
        addEdge(tempNodeFrom, tempNodeTo, tempWeight);
    }else if (newWeight === '0') {
        deleteEdge(tempNodeFrom, tempNodeTo);
    } else {
        editEdge(tempNodeFrom, tempNodeTo, tempWeight);
    }

}