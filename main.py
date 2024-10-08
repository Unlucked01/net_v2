from io import BytesIO

from flask import Flask, render_template, jsonify, request, send_file
from graph import Graph, time

app = Flask(__name__)


G = Graph({
    "1": {"3": 1},
    "2": {"3": 3, "5": 1},
    "3": {"2": 1, "4": 6, "5": 2},
    "4": {"2": 6, "5": 7},
    "5": {"1": 1, "2": 8, "4": 2}
})


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/graph', methods=['GET'])
def get_graph():
    return jsonify({'graph': G.graph, 'positions': G.positions})


@app.route('/graph', methods=['POST'])
def upload_graph():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file and file.filename.endswith('.txt'):
        content = file.read().decode('utf-8')
        try:
            graph_data = eval(content)
            G.graph = graph_data
            return jsonify({'success': True, 'graph': G.graph})
        except Exception as e:
            return jsonify({'error': str(e)}), 400

    return jsonify({'error': 'Invalid file format. Only .txt allowed'}), 400


def convert_keys_to_strings(data):
    new_data = {}
    for key, value in data.items():
        if isinstance(key, tuple):
            new_key = ' -> '.join(key)
        else:
            new_key = key
        new_data[new_key] = value
    return new_data


@app.route('/shortest_paths', methods=['GET'])
def shortest_paths():
    # Выполняем оба алгоритма
    dijkstra_results, dijkstra_execution_time = G.all_pairs_dijkstra()
    floyd_results, floyd_execution_time = G.floyd_warshall()

    # Преобразуем кортежи ключей в строки
    dijkstra_results = convert_keys_to_strings(dijkstra_results)
    floyd_results = convert_keys_to_strings(floyd_results)

    # Возвращаем JSON с результатами
    return jsonify({
        'dijkstra': {
            'results': dijkstra_results,
            'execution_time': round(dijkstra_execution_time, 6),
        },
        'floyd_warshall': {
            'results': floyd_results,
            'execution_time': round(floyd_execution_time, 6),
        }
    })

@app.route('/download_graph', methods=['GET'])
def download_graph():
    output = BytesIO()
    output.write(str(G.graph).encode('utf-8'))
    output.seek(0)

    return send_file(output, mimetype='text/plain', as_attachment=True, download_name='graph.txt')


@app.route('/path', methods=['GET'])
def shortest_path():
    source = request.args.get('source')
    target = request.args.get('target')

    path, distance = G.dijkstra(source, target)
    if path is not None and len(path) > 1:
        return jsonify({'path': path, 'distance': distance})
    else:
        return jsonify({'error': 'no path found'}), 400


@app.route('/node', methods=['POST'])
def add_node():
    if G.add_node():
        return jsonify({'message': f'Node added successfully'})
    else:
        return jsonify({'error': 'Node already exists'}), 400


@app.route('/edge', methods=['POST'])
def add_edge():
    node_from = request.json.get('nodeFrom')
    node_to = request.json.get('nodeTo')
    weight = request.json.get('weight')

    if not all([node_from, node_to, weight]):
        return jsonify({'error': 'node_from, node_to, and weight must be provided'}), 400

    if node_from not in G.graph or node_to not in G.graph:
        return jsonify({'error': 'Both nodes must exist in the graph'}), 400

    if weight < 1:
        return jsonify({'error': 'weight must be greater than zero'}), 400

    G.add_edge(node_from, node_to, weight)
    return jsonify({'message': f'Edge added between {node_from} and {node_to} with weight {weight}', 'graph': G.graph})


@app.route('/node', methods=['DELETE'])
def delete_node():
    node = request.json.get('node')

    if node not in G.graph:
        return jsonify({'error': f'Node {node} does not exist'}), 400

    G.delete_node(node)
    return jsonify({'message': f'Node {node} deleted successfully'})


@app.route('/edge', methods=['DELETE'])
def delete_edge():
    node_from = request.json.get('nodeFrom')
    node_to = request.json.get('nodeTo')

    if node_from not in G.graph or node_to not in G.graph[node_from]:
        return jsonify({'error': f'Edge from {node_from} to {node_to} does not exist'}), 400

    G.delete_edge(node_from, node_to)
    return jsonify({'message': f'Edge from {node_from} to {node_to} deleted successfully', 'graph': G.graph})


@app.route('/edge', methods=['PUT'])
def edit_edge():
    node_from = request.json.get('nodeFrom')
    node_to = request.json.get('nodeTo')
    weight = request.json.get('weight')

    if not all([node_from, node_to, weight]):
        return jsonify({'error': 'node_from, node_to, and weight must be provided'}), 400

    if node_from not in G.graph or node_to not in G.graph[node_from]:
        return jsonify({'error': 'Both nodes must exist in the graph'}), 400

    if G.edit_edge(node_from, node_to, weight):
        return jsonify({'message': f'Edge edited successfully'})
    else:
        return jsonify({'error': 'Edge cannot be edited'}), 400


@app.route('/position', methods=['POST'])
def update_position():
    node = request.json.get('node')
    x = request.json.get('x')
    y = request.json.get('y')

    if not all([node, x, y]):
        return jsonify({'error': 'node, x, and y must be provided'}), 400

    if node not in G.graph:
        return jsonify({'error': f'Node {node} does not exist'}), 400

    try:
        G.update_position(node, x, y)
        return jsonify({'message': f'Position of node {node} updated successfully'})
    except ValueError as e:
        return jsonify({'error': str(e)}), 400


@app.route('/matrix', methods=['GET'])
def get_adjacency_matrix():
    matrix = G.adjacency_matrix()
    return jsonify({'adjacency_matrix': matrix})


if __name__ == '__main__':
    app.run(debug=True)

