
class Graph:
    def __init__(self, graph: dict):
        self.graph = {}
        self.positions = {}
        self.missing_nodes = []

        for node, edges in graph.items():
            self.add_node(node)
            for neighbor, weight in edges.items():
                self.add_edge(node, neighbor, weight)

    def shortest_distances(self, source: str):
        from heapq import heappop, heappush, heapify

        distances = {node: float("inf") for node in self.graph}
        distances[source] = 0
        pq = [(0, source)]
        heapify(pq)

        visited = set()

        while pq:
            current_distance, current_node = heappop(pq)
            if current_node in visited:
                continue
            visited.add(current_node)

            print(self.graph[current_node].items())

            for neighbor, weight in self.graph[current_node].items():
                tentative_distance = current_distance + weight
                if tentative_distance < distances[neighbor]:
                    distances[neighbor] = tentative_distance
                    heappush(pq, (tentative_distance, neighbor))

        predecessors = {node: None for node in self.graph}

        for node, distance in distances.items():
            for neighbor, weight in self.graph[node].items():
                if distances[neighbor] == distance + weight:
                    predecessors[neighbor] = node

        return distances, predecessors

    def shortest_path(self, source: str, target: str):
        if source not in self.graph and target not in self.graph:
            return None

        _, predecessors = self.shortest_distances(source)

        path = []
        current_node = target

        while current_node:
            path.append(current_node)
            current_node = predecessors[current_node]

        path.reverse()
        return path

    def add_edge(self, node1, node2, weight):
        self.add_node(node1)
        self.graph[node1][node2] = weight

    def add_node(self, node=None):
        if not node:
            if self.missing_nodes:
                node = str(min(self.missing_nodes))
                self.missing_nodes.remove(int(node))
            else:
                node = str(len(self.graph) + 1)

        if node not in self.graph and len(self.graph.keys()) < 10:
            self.graph[node] = {}
            self.positions[node] = self.generate_node_position()
            return True
        else:
            return False

    def delete_node(self, node):
        if node in self.graph:
            del self.graph[node]
            del self.positions[node]
            for n in self.graph:
                if node in self.graph[n]:
                    del self.graph[n][node]
            self.missing_nodes.append(int(node))
            self.missing_nodes.sort()

    def delete_edge(self, node1, node2):
        if node1 in self.graph and node2 in self.graph[node1]:
            del self.graph[node1][node2]
        if node2 in self.graph and node1 in self.graph[node2]:
            del self.graph[node2][node1]

    def edit_edge(self, node1, node2, new_weight):
        if node1 in self.graph and node2 in self.graph[node1]:
            self.graph[node1][node2] = new_weight
            if node2 in self.graph and node1 in self.graph[node2]:
                self.graph[node2][node1] = new_weight
            return True

        return False

    @staticmethod
    def generate_node_position():
        import random
        return {'x': random.randint(50, 550), 'y': random.randint(50, 350)}

    def update_position(self, node, x, y):
        if node in self.graph:
            self.positions[node] = {'x': x, 'y': y}
        else:
            raise ValueError(f"Node {node} does not exist in the graph")

    def adjacency_matrix(self):
        nodes = sorted(self.graph.keys(), key=int)
        size = len(nodes)
        matrix = [[0] * size for _ in range(size)]
        for i, node in enumerate(nodes):
            matrix[i][i] = 0
            for neighbor, weight in self.graph[node].items():
                j = nodes.index(neighbor)
                matrix[i][j] = weight

        return matrix