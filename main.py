from flask import Flask, render_template, jsonify, request
from graph import Graph

app = Flask(__name__)

# Структура графа
graph = {
   "A": {"B": 7, "E": 1},
   "B": {"A": 7, "C": 3, "E": 8},
   "C": {"B": 3, "E": 2, "D": 6},
   "D": {"C": 6, "E": 7},
   "E": {"A": 1, "B": 8, "C": 2, "D": 7},
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
    print(source, target)
    path = G.shortest_path(source, target)
    return jsonify({'path': path})


if __name__ == '__main__':
    app.run(debug=True)

