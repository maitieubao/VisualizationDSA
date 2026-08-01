using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using VisualizationDSA.Domain.Engine;

namespace VisualizationDSA.Domain.Strategies;




public class DijkstraStrategy : GraphStrategyBase
{
    public override string AlgorithmId => "dijkstra";
    public override string Name => "Dijkstra (Đường đi ngắn nhất)";
    public override string Category => "Graph";

    public override AlgorithmMetadata GetMetadata()
    {
        return new AlgorithmMetadata
        {
            TimeComplexity = "O((V + E) log V)",
            SpaceComplexity = "O(V)",
            Description = "Tìm đường đi ngắn nhất từ đỉnh nguồn đến tất cả các đỉnh còn lại trên đồ thị có trọng số không âm. Sử dụng hàng đợi ưu tiên (Priority Queue) để luôn mở rộng đỉnh có khoảng cách nhỏ nhất. Hiển thị cập nhật distance và predecessor (đường đi).",
            PseudoCode = new List<string>
            {
                "Dijkstra(graph, source):",
                "  dist = [INF for v in V]",
                "  prev = [null for v in V]",
                "  dist[source] = 0",
                "  pq = PriorityQueue()",
                "  pq.enqueue(source, 0)",
                "  while pq not empty:",
                "    u = pq.dequeue()",
                "    if u.visited: continue",
                "    u.visited = true",
                "    for (v, w) in u.neighbors:",
                "      alt = dist[u] + w",
                "      if alt < dist[v]:",
                "        dist[v] = alt",
                "        prev[v] = u",
                "        pq.enqueue(v, alt)"
            }
        };
    }

    public override List<FrameDTO> Execute(int[] inputData, CancellationToken cancellationToken = default)
    {
        InitializeRecorder();

        if (inputData == null || inputData.Length == 0)
        {
            CaptureEmptyFrame(0, "Đồ thị rỗng, không thể chạy Dijkstra.");
            return _frames;
        }

        var (nodes, edges) = BuildGraph(inputData);
        CalculateInitialPositions(nodes, edges);

        int V = nodes.Count;
        const int INF = int.MaxValue / 2;

        var adj = new List<List<(int neighbor, int weight)>>();
        for (int i = 0; i < V; i++) adj.Add(new List<(int, int)>());
        foreach (var e in edges)
        {
            adj[e.From].Add((e.To, e.Weight));
            if (!e.Directed) adj[e.To].Add((e.From, e.Weight));
        }

        int startNode = 0;
        for (int i = 0; i < V; i++) if (nodes[i].Value == 0) startNode = i;

        var dist = new int[V];
        var prev = new int?[V];
        var visited = new bool[V];
        var inQueue = new bool[V];

        for (int i = 0; i < V; i++)
        {
            dist[i] = INF;
            prev[i] = null;
        }
        dist[startNode] = 0;

        
        var pq = new PriorityQueue<int, int>();
        pq.Enqueue(startNode, 0);
        inQueue[startNode] = true;

        
        CaptureFrame(nodes, edges, 0,
            $"Khởi tạo Dijkstra từ đỉnh {nodes[startNode].Value}. Distance: {startNode}=0, others=∞",
            dist, prev, visited, new List<int>(), startNode);

        int step = 1;
        int processed = 0;

        while (pq.Count > 0)
        {
            cancellationToken.ThrowIfCancellationRequested();

            int u = pq.Dequeue();
            if (visited[u]) continue;

            visited[u] = true;
            inQueue[u] = false;
            processed++;

            
            var distDict = dist
                .Select((d, i) => new { Index = i, Value = d })
                .Where(x => x.Value < INF)
                .ToDictionary(x => x.Index, x => x.Value);
            var prevDict = prev
                .Select((p, i) => new { Index = i, Value = p })
                .Where(x => x.Value.HasValue)
                .ToDictionary(x => x.Index, x => x.Value!.Value);

            CaptureFrame(nodes, edges, step++,
                $"Xử lý đỉnh {nodes[u].Value} (distance = {dist[u]}). Đã xử lý: {processed}/{V}",
                dist, prev, visited, new List<int>(), u, distDict, prevDict);

            
            foreach (var (v, weight) in adj[u])
            {
                if (visited[v]) continue;

                int alt = dist[u] + weight;
                if (alt < dist[v])
                {
                    dist[v] = alt;
                    prev[v] = u;

                    
                    pq.Enqueue(v, alt);
                    inQueue[v] = true;

                    
                    var updatedDistDict = dist
                        .Select((d, i) => new { Index = i, Value = d })
                        .Where(x => x.Value < INF)
                        .ToDictionary(x => x.Index, x => x.Value);
                    var updatedPrevDict = prev
                        .Select((p, i) => new { Index = i, Value = p })
                        .Where(x => x.Value.HasValue)
                        .ToDictionary(x => x.Index, x => x.Value!.Value!);

                    CaptureFrame(nodes, edges, step++,
                        $"Relax cạnh ({nodes[u].Value} → {nodes[v].Value}) trọng số {weight}. Cập nhật distance[{nodes[v].Value}] = {alt}",
                        dist, prev, visited, new List<int>(), u,
                        updatedDistDict, 
                        updatedPrevDict,  
                        highlightedEdge: (u, v));
                }
            }
        }

        
        var finalDist = dist
            .Select((d, i) => new { Index = i, Value = d })
            .Where(x => x.Value < INF)
            .ToDictionary(x => x.Index, x => x.Value);
        var finalPrev = prev
            .Select((p, i) => new { Index = i, Value = p })
            .Where(x => x.Value.HasValue)
            .ToDictionary(x => x.Index, x => x.Value!.Value);

        CaptureFrame(nodes, edges, step++,
            $"Dijkstra hoàn tất! Shortest distances từ {nodes[startNode].Value}: {string.Join(", ", finalDist.OrderBy(k => k.Key).Select(k => $"{nodes[k.Key].Value}={k.Value}"))}",
            dist, prev, visited, new List<int>(), -1, finalDist, finalPrev);

        return _frames;
    }

    private void CaptureFrame(
        List<GraphNode> nodes,
        List<GraphEdge> edges,
        int stepId,
        string explanation,
        int[] dist,
        int?[] prev,
        bool[] visited,
        List<int> queue,
        int? activeNodeId = null,
        Dictionary<int, int>? updatedDist = null,
        Dictionary<int, int>? updatedPrev = null,
        (int from, int to)? highlightedEdge = null)
    {
        const int INF = int.MaxValue / 2;

        var frame = new FrameDTO
        {
            StepId = stepId,
            ActiveLine = GetLineForStep(stepId),
            Explanation = explanation,
            DataState = dist.Where(d => d < INF).ToArray(),
            Highlights = new HighlightIndices
            {
                Active = activeNodeId.HasValue && activeNodeId.Value >= 0 ? new List<int> { activeNodeId.Value } : new List<int>(),
                Compare = new List<int>(), 
                Sorted = Enumerable.Range(0, visited.Length).Where(i => visited[i]).ToList(), 
                Found = updatedDist?.Keys.FirstOrDefault() ?? -1, 
            }
        };

        
        frame.Distances = dist
            .Select((d, i) => d < INF ? new { Key = i, Value = d } : null)
            .Where(x => x != null)
            .ToDictionary(x => x.Key, x => x.Value);
        frame.Predecessors = prev
            .Select((p, i) => new { Index = i, Value = p })
            .Where(x => x.Value.HasValue)
            .ToDictionary(x => x.Index, x => x.Value!.Value);

        
        var highlightedEdges = new HashSet<int>();
        if (highlightedEdge.HasValue)
        {
            highlightedEdges.Add(highlightedEdge.Value.from * 1000 + highlightedEdge.Value.to);
        }

        PopulateFrameGraph(frame, nodes, edges,
            highlightedNodes: updatedDist?.Keys.ToHashSet(),
            highlightedEdges: highlightedEdges,
            activeNodeId: activeNodeId);

        _frames.Add(frame);
    }

    private void CaptureEmptyFrame(int stepId, string explanation)
    {
        _frames.Add(new FrameDTO
        {
            StepId = stepId,
            ActiveLine = 0,
            Explanation = explanation,
            DataState = Array.Empty<int>(),
            Highlights = new HighlightIndices()
        });
    }

    private int GetLineForStep(int step)
    {
        if (step == 0) return 1;
        if (step <= 2) return 2;
        if (step <= 5) return 3;
        if (step <= 8) return 4;
        if (step <= 12) return 5;
        return 6;
    }
}