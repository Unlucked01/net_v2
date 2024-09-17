from heapq import heapify, heappop, heappush

class Graph:
    def __init__(self, graph: dict = {}):
        self.graph = graph  # A dictionary for the adjacency list

    def shortest_distances(self, source: str):
        # Initialize the values of all nodes with infinity
        distances = {node: float("inf") for node in self.graph}
        distances[source] = 0  # Set the source value to 0
        # Initialize a priority queue
        pq = [(0, source)]
        heapify(pq)

        # Create a set to hold visited nodes
        visited = set()

        while pq:  # While the priority queue isn't empty
            current_distance, current_node = heappop(pq)
            if current_node in visited:
                continue
            visited.add(current_node)

            for neighbor, weight in self.graph[current_node].items():
                # Calculate the distance from current_node to the neighbor
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
        # Generate the predecessors dict
        _, predecessors = self.shortest_distances(source)

        path = []
        current_node = target

        # Backtrack from the target node using predecessors
        while current_node:
            path.append(current_node)
            current_node = predecessors[current_node]

        # Reverse the path and return it
        path.reverse()

        return path

    def add_edge(self, node1, node2, weight):
        self.add_node(node1)
        self.graph[node1][node2] = weight

    # Add a new node
    def add_node(self, node):
        if node not in self.graph:
            self.graph[node] = {}

    # Delete a node and all its edges
    def delete_node(self, node):
        if node in self.graph:
            del self.graph[node]
            for n in self.graph:
                if node in self.graph[n]:
                    del self.graph[n][node]

    # Delete an edge between two nodes
    def delete_edge(self, node1, node2):
        if node1 in self.graph and node2 in self.graph[node1]:
            del self.graph[node1][node2]

    # Edit an existing edge
    def edit_edge(self, node1, node2, new_weight):
        if node1 in self.graph and node2 in self.graph[node1]:
            self.graph[node1][node2] = new_weight

    def __len__(self):
        return len(self.graph)
