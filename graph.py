import time
from heapq import heappop, heappush, heapify


class Graph:
    def __init__(self, graph: dict):
        self.graph = {}
        self.positions = {}
        self.missing_nodes = []

        for node, edges in graph.items():
            self.add_node(node)
            for neighbor, weight in edges.items():
                self.add_edge(node, neighbor, weight)

    def shortest_distances_dijkstra(self, source: str):
        """Алгоритм Дейкстры для поиска кратчайших путей от одной вершины."""
        distances = {node: float("inf") for node in self.graph}
        distances[source] = 0
        predecessors = {node: None for node in self.graph}
        pq = [(0, source)]
        heapify(pq)

        visited = set()

        while pq:
            current_distance, current_node = heappop(pq)
            if current_node in visited:
                continue
            visited.add(current_node)

            for neighbor, weight in self.graph[current_node].items():
                tentative_distance = current_distance + weight
                if tentative_distance < distances[neighbor]:
                    distances[neighbor] = tentative_distance
                    predecessors[neighbor] = current_node  # Предыдущий узел для восстановления пути
                    heappush(pq, (tentative_distance, neighbor))

        return distances, predecessors  # Возвращаем расстояния и предшественников

    def all_pairs_dijkstra(self):
        """n-кратное применение алгоритма Дейкстры для поиска кратчайших путей между всеми парами вершин."""
        shortest_paths = {}
        start_time = time.time()

        for node in self.graph:
            distances, predecessors = self.shortest_distances_dijkstra(node)
            for target, distance in distances.items():
                if distance < float("inf"):
                    path = self.reconstruct_path_dijkstra(node, target)
                    if len(path) > 1:
                        shortest_paths[(node, target)] = (path, distance)

        end_time = time.time()
        dijkstra_time = end_time - start_time
        return shortest_paths, dijkstra_time

    def reconstruct_path_dijkstra(self, source, target):
        """Восстановление пути после работы алгоритма Дейкстры."""
        distances, predecessors = self.shortest_distances_dijkstra(source)
        path = []
        current_node = target
        while current_node is not None:
            path.append(current_node)
            current_node = predecessors[current_node]
        path.reverse()  # Путь восстанавливается в обратном порядке
        return path if distances[target] != float("inf") else None

    def floyd_warshall(self):
        """Алгоритм Флойда-Уоршалла для поиска кратчайших путей между всеми парами вершин."""
        nodes = sorted(self.graph.keys(), key=int)
        dist = {node: {other: float('inf') for other in nodes} for node in nodes}
        next_node = {node: {other: None for other in nodes} for node in nodes}

        for node in nodes:
            dist[node][node] = 0
            for neighbor, weight in self.graph[node].items():
                dist[node][neighbor] = weight
                next_node[node][neighbor] = neighbor

        start_time = time.time()
        for k in nodes:
            for i in nodes:
                for j in nodes:
                    if dist[i][j] > dist[i][k] + dist[k][j]:
                        dist[i][j] = dist[i][k] + dist[k][j]
                        next_node[i][j] = next_node[i][k]
        end_time = time.time()
        floyd_time = end_time - start_time

        shortest_paths = {}
        for i in nodes:
            for j in nodes:
                if dist[i][j] < float('inf'):
                    path = self.reconstruct_path_floyd(i, j, next_node)
                    if path is not None and len(path) > 1:
                        shortest_paths[(i, j)] = (path, dist[i][j])

        return shortest_paths, floyd_time

    @staticmethod
    def reconstruct_path_floyd(source, target, next_node):
        """Восстановление пути после работы алгоритма Флойда-Уоршалла."""
        if next_node[source][target] is None:
            return None
        path = [source]
        while source != target:
            source = next_node[source][target]
            path.append(source)
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

    def edit_edge(self, node1, node2, new_weight):
        if node1 in self.graph and node2 in self.graph[node1]:
            self.graph[node1][node2] = new_weight
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

