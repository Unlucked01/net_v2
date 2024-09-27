function fetchComparisonResults() {
        fetch('/shortest_paths')
            .then(response => response.json())
            .then(data => {
                document.getElementById('dijkstra-results').value = formatResults(data.dijkstra.results, data.dijkstra.execution_time);
                document.getElementById('floyd-results').value = formatResults(data.floyd_warshall.results, data.floyd_warshall.execution_time);
                logEvent(`Dijkstra is slower than Floyd for ${data.dijkstra.execution_time - data.floyd_warshall.execution_time}sec (${Math.round(data.dijkstra.execution_time / data.floyd_warshall.execution_time)} times)`)
            })
            .catch(error => console.error('Error fetching comparison results:', error));
    }

    function formatResults(results, time) {
        let formatted = `Execution time: ${time.toFixed(6)} seconds\n\n`;
        for (const [key, value] of Object.entries(results)) {
            formatted += `Path ${key}: ${JSON.stringify(value)}\n`;
        }
        return formatted;
    }