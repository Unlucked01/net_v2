from flask import Flask, render_template, jsonify, request
from graph import Graph

app = Flask(__name__)

graph = {
   "1": {"2": 7, "3": 1, "4": 2},
   "2": {"1": 7, "3": 3, "5": 8},
   "3": {"2": 3, "5": 2, "4": 6},
   "4": {"2": 6, "5": 7},
   "5": {"1": 1, "2": 8, "3": 2, "4": 7},
}

G = Graph(graph)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/get-graph', methods=['GET'])
def get_graph():
    return jsonify(graph)


@app.route('/shortest-path', methods=['GET'])
def shortest_path():
    source = request.args.get('source')
    target = request.args.get('target')

    if source not in G.graph or target not in G.graph:
        return jsonify({'error': 'Source or target node does not exist'}), 400

    path = G.shortest_path(source, target)
    return jsonify({'path': path})


@app.route('/add-node', methods=['POST'])
def add_node():
    new_node = request.json.get('node')
    if not new_node:
        new_node = str(len(G) + 1)

    if new_node in G.graph:
        return jsonify({'error': f'Node {new_node} already exists'}), 400

    G.add_node(new_node)
    return jsonify({'message': f'Node {new_node} added successfully'})


@app.route('/add-edge', methods=['POST'])
def add_edge():
    node1 = request.json.get('node1')
    node2 = request.json.get('node2')
    weight = request.json.get('weight')

    # Validate the input
    if not all([node1, node2, weight]):
        return jsonify({'error': 'node1, node2, and weight must be provided'}), 400

    if node1 not in G.graph or node2 not in G.graph:
        return jsonify({'error': 'Both nodes must exist in the graph'}), 400

    G.add_edge(node1, node2, weight)
    return jsonify({'message': f'Edge added between {node1} and {node2} with weight {weight}', 'graph': G.graph})


@app.route('/delete-node', methods=['DELETE'])
def delete_node():
    node = request.json.get('node')

    if node not in G.graph:
        return jsonify({'error': f'Node {node} does not exist'}), 400

    G.delete_node(node)
    return jsonify({'message': f'Node {node} deleted successfully'})


@app.route('/delete-edge', methods=['DELETE'])
def delete_edge():
    node1 = request.json.get('node1')
    node2 = request.json.get('node2')

    if node1 not in G.graph or node2 not in G.graph[node1]:
        return jsonify({'error': f'Edge from {node1} to {node2} does not exist'}), 400

    G.delete_edge(node1, node2)
    return jsonify({'message': f'Edge from {node1} to {node2} deleted successfully', 'graph': G.graph})


if __name__ == '__main__':
    app.run(debug=True)

