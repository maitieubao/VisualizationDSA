using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using VisualizationDSA.Domain.Engine;

namespace VisualizationDSA.Domain.Strategies;





public class BellmanFordStrategy : GraphStrategyBase
{
    public override string AlgorithmId => "bellman-ford";
    public override string Name => "Bellman-Ford (Đường đi ngắn nhất)";
    public override string Category => "Graph";

    public override AlgorithmMetadata GetMetadata()
    {
        return new AlgorithmMetadata
        {
            TimeComplexity = "O(V × E)",
            SpaceComplexity = "O(V)",
            Description = "Tìm đường đi ngắn nhất từ đỉnh nguồn trên đồ thị có trọng số âm (khác biệt so với Dijkstra). Phát hiện chu trình trọng số âm (negative cycle) nếu tồn tại.",
            PseudoCode = new List<string>
            {
                "BellmanFord(graph, source):",
                "  dist = [INF for v in V]",
                "  prev = [null for v in V]",
                "  dist[source] = 0",
                "  for i = 1 to V-1:",
                "    for each edge (u, v, w):",
                "      if dist[u] + w < dist[v]:",
                "        dist[v] = dist[u] + w",
                "        prev[v] = u",
                "  for each edge (u, v, w):",
                "    if dist[u] + w < dist[v]:",
                "      return NEGATIVE CYCLE"
            }
        };
    }

    public override List<FrameDTO> Execute(int[] inputData, CancellationToken cancellationToken = default)
    {
        InitializeRecorder();

        if (inputData == null || inputData.Length == 0)
        {
            CaptureEmptyFrame(0, "Đồ thị rỗng, không thể chạy Bellman-Ford.");
            return _frames;
        }

        var (nodes, edges) = BuildGraph(inputData);
        CalculateInitialPositions(nodes, edges);

        
        
        var workingEdges = new List<GraphEdge>();
        var rand = new Random(99);
        foreach (var e in edges)
        {
            workingEdges.Add(new GraphEdge
            {
                From = e.From,
                To = e.To,
                Weight = rand.Next(-3, 12),
                Directed = true 
            });
        }

        int V = nodes.Count;
        var adj = new List<List<(int to, int weight)>>();
        for (int i = 0; i < V; i++) adj.Add(new List<(int, int)>());
        foreach (var e in workingEdges)
        {
            adj[e.From].Add((e.To, e.Weight));
        }

        int startNode = 0;
        for (int i = 0; i < V; i++) if (nodes[i].Value == 0) startNode = i;

        const int INF = int.MaxValue / 2;
        var dist = new int[V];
        var prev = new int?[V];
        for (int i = 0; i < V; i++) { dist[i] = INF; prev[i] = null; }
        dist[startNode] = 0;

        
        CaptureFrame(nodes, workingEdges, adj, 0,
            $"Khởi tạo Bellman-Ford từ đỉnh {nodes[startNode].Value}. Distance: start=0, others=∞. Đồ thị có {workingEdges.Count} cạnh (có trọng số âm).",
            dist, prev, V, null, hasNegativeCycle: false);

        int step = 1;

        
        for (int iter = 1; iter <= V - 1; iter++)
        {
            cancellationToken.ThrowIfCancellationRequested();

            bool updated = false;
            CaptureFrame(nodes, workingEdges, adj, step++,
                $"Lặp thứ {iter}/{V-1}. Duyệt qua tất cả {workingEdges.Count} cạnh để relax.",
                dist, prev, V, null, hasNegativeCycle: false);

            foreach (var e in workingEdges)
            {
                int u = e.From;
                int v = e.To;
                int w = e.Weight;

                if (dist[u] < INF && dist[u] + w < dist[v])
                {
                    dist[v] = dist[u] + w;
                    prev[v] = u;
                    updated = true;

                    CaptureFrame(nodes, workingEdges, adj, step++,
                        $"Relax cạnh ({nodes[u].Value} → {nodes[v].Value}, w={w}). Cập nhật distance[{nodes[v].Value}] = {dist[v]}",
                        dist, prev, V, (from: u, to: v, newDist: dist[v]), hasNegativeCycle: false);
                }
            }

            if (!updated)
            {
                CaptureFrame(nodes, workingEdges, adj, step++,
                    $"Không có cập nhật nào ở lặp {iter}. Thuật toán sớm dừng (tối ưu).",
                    dist, prev, V, null, hasNegativeCycle: false);
                break;
            }
        }

        
        bool hasNegativeCycle = false;
        foreach (var e in workingEdges)
        {
            int u = e.From;
            int v = e.To;
            int w = e.Weight;

            if (dist[u] < INF && dist[u] + w < dist[v])
            {
                hasNegativeCycle = true;
                CaptureFrame(nodes, workingEdges, adj, step++,
                    $"⚠ Phát hiện chu trình trọng số âm! Cạnh ({nodes[u].Value} → {nodes[v].Value}, w={w}) vẫn có thể relax.",
                    dist, prev, V, (from: u, to: v, newDist: dist[u] + w), hasNegativeCycle: true);
                break;
            }
        }

        if (!hasNegativeCycle)
        {
            var finalDist = dist.Select((d, i) => d < INF ? new { Key = i, Value = d } : null)
                .Where(x => x != null).ToDictionary(x => x.Key, x => x.Value);

            CaptureFrame(nodes, workingEdges, adj, step++,
                $"Bellman-Ford hoàn tất! Không tìm thấy chu trình trọng số âm. Đường đi ngắn nhất: {FormatDistances(finalDist, nodes)}",
                dist, prev, V, null, hasNegativeCycle: false);
        }

        return _frames;
    }

    private void CaptureFrame(
        List<GraphNode> nodes,
        List<GraphEdge> edges,
        List<List<(int to, int weight)>> adj,
        int stepId,
        string explanation,
        int[] dist,
        int?[] prev,
        int V,
        (int from, int to, int newDist)? updatedEdge = null,
        bool hasNegativeCycle = false)
    {
        const int INF = int.MaxValue / 2;

        var distDict = dist.Select((d, i) => d < INF ? new { Key = i, Value = d } : null)
            .Where(x => x != null).ToDictionary(x => x.Key, x => x.Value);
        var prevDict = prev.Where(p => p.HasValue).ToDictionary(p => Array.IndexOf(prev, p), p => p.Value);

        var frame = new FrameDTO
        {
            StepId = stepId,
            ActiveLine = 3,
            Explanation = explanation,
            DataState = dist.Where(d => d < INF).ToArray(),
            Highlights = new HighlightIndices
            {
                Active = updatedEdge.HasValue ? new List<int> { updatedEdge.Value.to } : new List<int>(),
                Compare = distDict.Keys.ToList(),
                Dimmed = dist.Where((d, i) => d >= INF).Select((d, i) => i).ToList()
            }
        };

        var highlightedEdges = new HashSet<int>();
        if (updatedEdge.HasValue)
        {
            highlightedEdges.Add(updatedEdge.Value.from * 1000 + updatedEdge.Value.to);
        }

        PopulateFrameGraph(frame, nodes, edges,
            highlightedNodes: updatedEdge.HasValue ? new HashSet<int> { updatedEdge.Value.to } : null,
            highlightedEdges: highlightedEdges);

        frame.Distances = distDict;
        frame.Predecessors = prevDict;
        if (hasNegativeCycle) frame.CurrentPath = new List<int> { updatedEdge?.from ?? 0 };

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

    private string FormatDistances(Dictionary<int, int> dist, List<GraphNode> nodes)
    {
        return "{" + string.Join(", ", dist.OrderBy(k => k.Key).Select(k => $"{nodes[k.Key].Value}={k.Value}")) + "}";
    }
}