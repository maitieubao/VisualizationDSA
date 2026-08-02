import type { NodeDTO, EdgeDTO } from '../store/usePlaygroundStore';

export interface GraphAnimationStep {
  stepId: number;
  activeLine: number;
  explanation: string;
  visitedNodes: string[]; 
  activeNodes: string[]; 
  visitedEdges: string[]; 
  distances?: Record<string, number>; 
  queueStack?: string[]; 
}

export interface SimulationResult {
  algorithmId: string;
  pseudoCode: string[];
  frames: GraphAnimationStep[];
}

export const BFS_PSEUDO = [
  'BFS(G, source):',
  '  let Q be a queue',
  '  Q.enqueue(source)',
  '  label source as visited',
  '  while Q is not empty:',
  '    curr = Q.dequeue()',
  '    for each neighbor w of curr:',
  '      if w is not visited:',
  '        label w as visited',
  '        Q.enqueue(w)'
];

export const DFS_PSEUDO = [
  'DFS(G, source):',
  '  let S be a stack',
  '  S.push(source)',
  '  while S is not empty:',
  '    curr = S.pop()',
  '    if curr is not visited:',
  '      label curr as visited',
  '      for each neighbor w of curr:',
  '        if w is not visited:',
  '          S.push(w)'
];

export const DIJKSTRA_PSEUDO = [
  'Dijkstra(G, source):',
  '  for each vertex v in G:',
  '    dist[v] = infinity',
  '  dist[source] = 0',
  '  Q = priority queue of all vertices',
  '  while Q is not empty:',
  '    u = Q.extractMin()',
  '    for each neighbor v of u:',
  '      alt = dist[u] + weight(u, v)',
  '      if alt < dist[v]:',
  '        dist[v] = alt',
  '        Q.decreaseKey(v, alt)'
];

export class GraphAlgorithmSimulator {
  static simulate(
    algorithm: 'BFS' | 'DFS' | 'DIJKSTRA',
    nodes: NodeDTO[],
    edges: EdgeDTO[],
    sourceNodeId: string | null
  ): SimulationResult {
    if (nodes.length === 0) {
      return {
        algorithmId: algorithm.toLowerCase(),
        pseudoCode: [],
        frames: [{
          stepId: 1,
          activeLine: 0,
          explanation: 'Đồ thị rỗng. Hãy vẽ thêm đỉnh.',
          visitedNodes: [],
          activeNodes: [],
          visitedEdges: []
        }]
      };
    }

    const startId = sourceNodeId || nodes[0].id;
    const startNode = nodes.find(n => n.id === startId) || nodes[0];

    switch (algorithm) {
      case 'BFS':
        return this.runBFS(nodes, edges, startNode.id);
      case 'DFS':
        return this.runDFS(nodes, edges, startNode.id);
      case 'DIJKSTRA':
        return this.runDijkstra(nodes, edges, startNode.id);
    }
  }

  private static getNodeLabel(nodes: NodeDTO[], id: string): string {
    return nodes.find(n => n.id === id)?.label || '?';
  }

  private static runBFS(nodes: NodeDTO[], edges: EdgeDTO[], startId: string): SimulationResult {
    const frames: GraphAnimationStep[] = [];
    let stepId = 1;

    const visited = new Set<string>();
    const queue: string[] = [];
    const visitedEdges: string[] = [];

    
    frames.push({
      stepId: stepId++,
      activeLine: 1,
      explanation: 'Khởi tạo Queue và chuẩn bị duyệt BFS.',
      visitedNodes: [],
      activeNodes: [],
      visitedEdges: [],
      queueStack: []
    });

    visited.add(startId);
    queue.push(startId);
    const startLabel = this.getNodeLabel(nodes, startId);

    
    frames.push({
      stepId: stepId++,
      activeLine: 2,
      explanation: `Bắt đầu BFS: Đưa đỉnh nguồn ${startLabel} vào Queue và đánh dấu đã duyệt.`,
      visitedNodes: [startId],
      activeNodes: [startId],
      visitedEdges: [],
      queueStack: [startLabel]
    });

    while (queue.length > 0) {
      const currId = queue.shift()!;
      const currLabel = this.getNodeLabel(nodes, currId);

      const qLabels = queue.map(id => this.getNodeLabel(nodes, id));
      frames.push({
        stepId: stepId++,
        activeLine: 5,
        explanation: `Lấy đỉnh ${currLabel} ra khỏi Queue để duyệt các đỉnh kề.`,
        visitedNodes: Array.from(visited),
        activeNodes: [currId],
        visitedEdges: [...visitedEdges],
        queueStack: [currLabel, ...qLabels]
      });

      
      const outgoingEdges = edges.filter(e => e.from === currId);
      
      for (const edge of outgoingEdges) {
        const neighborId = edge.to;
        const neighborLabel = this.getNodeLabel(nodes, neighborId);

        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          queue.push(neighborId);
          visitedEdges.push(edge.id);

          const curQLabels = queue.map(id => this.getNodeLabel(nodes, id));
          frames.push({
            stepId: stepId++,
            activeLine: 9,
            explanation: `Phát hiện đỉnh kề ${neighborLabel} chưa duyệt. Đưa vào Queue và đánh dấu đã duyệt.`,
            visitedNodes: Array.from(visited),
            activeNodes: [currId, neighborId],
            visitedEdges: [...visitedEdges],
            queueStack: curQLabels
          });
        } else {
          
          const curQLabels = queue.map(id => this.getNodeLabel(nodes, id));
          frames.push({
            stepId: stepId++,
            activeLine: 7,
            explanation: `Đỉnh kề ${neighborLabel} đã được duyệt trước đó, bỏ qua.`,
            visitedNodes: Array.from(visited),
            activeNodes: [currId, neighborId],
            visitedEdges: [...visitedEdges],
            queueStack: curQLabels
          });
        }
      }
    }

    frames.push({
      stepId: stepId++,
      activeLine: 4,
      explanation: 'Queue rỗng. Quá trình duyệt BFS hoàn tất.',
      visitedNodes: Array.from(visited),
      activeNodes: [],
      visitedEdges: [...visitedEdges],
      queueStack: []
    });

    return {
      algorithmId: 'bfs',
      pseudoCode: BFS_PSEUDO,
      frames
    };
  }

  private static runDFS(nodes: NodeDTO[], edges: EdgeDTO[], startId: string): SimulationResult {
    const frames: GraphAnimationStep[] = [];
    let stepId = 1;

    const visited = new Set<string>();
    
    const stack: { id: string; edgeId: string | null }[] = [];
    const visitedEdges: string[] = [];

    
    frames.push({
      stepId: stepId++,
      activeLine: 1,
      explanation: 'Khởi tạo Stack và chuẩn bị duyệt DFS.',
      visitedNodes: [],
      activeNodes: [],
      visitedEdges: [],
      queueStack: []
    });

    stack.push({ id: startId, edgeId: null });
    const startLabel = this.getNodeLabel(nodes, startId);

    
    frames.push({
      stepId: stepId++,
      activeLine: 2,
      explanation: `Bắt đầu DFS: Đẩy đỉnh nguồn ${startLabel} vào Stack.`,
      visitedNodes: [],
      activeNodes: [startId],
      visitedEdges: [],
      queueStack: [startLabel]
    });

    while (stack.length > 0) {
      const { id: currId, edgeId: incomingEdgeId } = stack.pop()!;
      const currLabel = this.getNodeLabel(nodes, currId);
      const sLabels = stack.map(item => this.getNodeLabel(nodes, item.id));

      if (!visited.has(currId)) {
        visited.add(currId);
        
        
        if (incomingEdgeId && !visitedEdges.includes(incomingEdgeId)) {
          visitedEdges.push(incomingEdgeId);
        }

        frames.push({
          stepId: stepId++,
          activeLine: 5,
          explanation: `Lấy đỉnh ${currLabel} ra khỏi Stack và đánh dấu đã duyệt.`,
          visitedNodes: Array.from(visited),
          activeNodes: [currId],
          visitedEdges: [...visitedEdges],
          queueStack: [...sLabels]
        });

        
        const outgoingEdges = edges.filter(e => e.from === currId);

        for (const edge of outgoingEdges) {
          const neighborId = edge.to;
          const neighborLabel = this.getNodeLabel(nodes, neighborId);

          if (!visited.has(neighborId)) {
            stack.push({ id: neighborId, edgeId: edge.id });

            const curSLabels = stack.map(item => this.getNodeLabel(nodes, item.id));
            frames.push({
              stepId: stepId++,
              activeLine: 9,
              explanation: `Đỉnh kề ${neighborLabel} chưa duyệt. Đẩy vào Stack.`,
              visitedNodes: Array.from(visited),
              activeNodes: [currId, neighborId],
              visitedEdges: [...visitedEdges],
              queueStack: curSLabels
            });
          }
        }
      } else {
        
        frames.push({
          stepId: stepId++,
          activeLine: 6,
          explanation: `Đỉnh ${currLabel} đã được duyệt từ trước, bỏ qua.`,
          visitedNodes: Array.from(visited),
          activeNodes: [currId],
          visitedEdges: [...visitedEdges],
          queueStack: [...sLabels]
        });
      }
    }

    frames.push({
      stepId: stepId++,
      activeLine: 4,
      explanation: 'Stack rỗng. Quá trình duyệt DFS hoàn tất.',
      visitedNodes: Array.from(visited),
      activeNodes: [],
      visitedEdges: [...visitedEdges],
      queueStack: []
    });

    return {
      algorithmId: 'dfs',
      pseudoCode: DFS_PSEUDO,
      frames
    };
  }

  private static runDijkstra(nodes: NodeDTO[], edges: EdgeDTO[], startId: string): SimulationResult {
    const frames: GraphAnimationStep[] = [];
    let stepId = 1;

    const dist: Record<string, number> = {};
    const parentEdge: Record<string, string> = {}; 
    const visited = new Set<string>();

    for (const node of nodes) {
      dist[node.id] = Infinity;
    }
    dist[startId] = 0;

    const startLabel = this.getNodeLabel(nodes, startId);

    
    frames.push({
      stepId: stepId++,
      activeLine: 1,
      explanation: `Khởi tạo khoảng cách: Đặt đỉnh nguồn ${startLabel} = 0, các đỉnh khác = ∞.`,
      visitedNodes: [],
      activeNodes: [],
      visitedEdges: [],
      distances: { ...dist }
    });

    const unvisited = new Set<string>(nodes.map(n => n.id));

    while (unvisited.size > 0) {
      
      let currId: string | null = null;
      let minD = Infinity;

      for (const nodeId of unvisited) {
        if (dist[nodeId] < minD) {
          minD = dist[nodeId];
          currId = nodeId;
        }
      }

      if (currId === null || minD === Infinity) {
        break;
      }

      unvisited.delete(currId);
      visited.add(currId);
      const currLabel = this.getNodeLabel(nodes, currId);

      
      const currentVisitedEdges = Object.values(parentEdge);
      frames.push({
        stepId: stepId++,
        activeLine: 6,
        explanation: `Chọn đỉnh ${currLabel} chưa duyệt có khoảng cách ngắn nhất (dist = ${dist[currId]}).`,
        visitedNodes: Array.from(visited),
        activeNodes: [currId],
        visitedEdges: [...currentVisitedEdges],
        distances: { ...dist }
      });

      
      const outgoingEdges = edges.filter(e => e.from === currId);

      for (const edge of outgoingEdges) {
        const neighborId = edge.to;
        const neighborLabel = this.getNodeLabel(nodes, neighborId);

        if (visited.has(neighborId)) continue;

        const alt = dist[currId] + edge.weight;

        
        frames.push({
          stepId: stepId++,
          activeLine: 8,
          explanation: `Xét đỉnh kề ${neighborLabel}. Tính khoảng cách: dist[${currLabel}] (${dist[currId]}) + weight (${edge.weight}) = ${alt}.`,
          visitedNodes: Array.from(visited),
          activeNodes: [currId, neighborId],
          visitedEdges: [...currentVisitedEdges],
          distances: { ...dist }
        });

        if (alt < dist[neighborId]) {
          dist[neighborId] = alt;
          parentEdge[neighborId] = edge.id; 

          const updatedVisitedEdges = Object.values(parentEdge);
          frames.push({
            stepId: stepId++,
            activeLine: 10,
            explanation: `Khoảng cách mới ${alt} < dist[${neighborLabel}] (${dist[neighborId] === Infinity ? '∞' : dist[neighborId]}). Cập nhật dist[${neighborLabel}] = ${alt}.`,
            visitedNodes: Array.from(visited),
            activeNodes: [currId, neighborId],
            visitedEdges: [...updatedVisitedEdges],
            distances: { ...dist }
          });
        } else {
          frames.push({
            stepId: stepId++,
            activeLine: 9,
            explanation: `Khoảng cách mới ${alt} >= dist[${neighborLabel}] (${dist[neighborId]}). Không cập nhật.`,
            visitedNodes: Array.from(visited),
            activeNodes: [currId, neighborId],
            visitedEdges: [...currentVisitedEdges],
            distances: { ...dist }
          });
        }
      }
    }

    frames.push({
      stepId: stepId++,
      activeLine: 0,
      explanation: 'Thuật toán Dijkstra hoàn tất. Đường đi ngắn nhất từ đỉnh nguồn đã được xác định.',
      visitedNodes: Array.from(visited),
      activeNodes: [],
      visitedEdges: Object.values(parentEdge),
      distances: { ...dist }
    });

    return {
      algorithmId: 'dijkstra',
      pseudoCode: DIJKSTRA_PSEUDO,
      frames
    };
  }
}
