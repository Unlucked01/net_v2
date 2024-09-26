// Handle file upload
document.getElementById('upload-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const formData = new FormData();
    const fileInput = document.getElementById('file-input');

    if (fileInput.files.length > 0) {
        formData.append('file', fileInput.files[0]);

        fetch('/graph', {
            method: 'POST',
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Graph uploaded successfully');
            } else {
                alert('Error uploading graph');
            }
        })
        .catch(error => console.error('Error:', error));
    }
});

// Handle graph download
document.getElementById('download-graph').addEventListener('click', function () {
    fetch('/download_graph')
        .then(response => response.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'graph.txt';
            document.body.appendChild(a);
            a.click();
            a.remove();
        })
        .catch(error => console.error('Error:', error));
});