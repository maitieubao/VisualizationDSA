using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using VisualizationDSA.Domain.Engine;

namespace VisualizationDSA.Domain.Strategies;




public class AStarStrategy : GraphStrategyBase
{
    public override string AlgorithmId => "a-star";
    public override string Name => "A* Search (Đường đi tối ưu)";
    public override string Category => "Graph";

    public override AlgorithmMetadata GetMetadata()
    {
        return new AlgorithmMetadata
        {
            TimeComplexity = "O(E)",
            SpaceComplexity = "O(V)",
            Description = "Tìm đường đi ngắn nhất từ đỉnh nguồn đến đỉnh đích sử dụng heuristic (Euclidean distance). Kết hợp ưu điểm của BFS (tính toán chính xác) và Greedy (hướng đích). Hiển thị open set (frontier), closed set, và đường đi hiện tại.",
            PseudoCode = new List<string>
            {
                "A*(graph, source, target):",
                "  g_score = {v: INF for v in V}",
                "  f_score = {v: INF for v in V}",
                "  g_score[source] = 0",
                "  f_score[source] = heuristic(source, target)",
                "  open_set = {source}",
                "  while open_set not empty:",
                "    u = node with min f_score in open_set",
                "    if u == target: return reconstruct_path()",
                "    open_set.remove(u)",
                "    closed_set.add(u)",
                "    for (v, w) in u.neighbors:",
                "      if v in closed_set: continue",
                "      tentative_g = g_score[u] + w",
                "      if tentative_g < g_score[v]:",
                "        g_score[v] = tentative_g",
                "        f_score[v] = g_score[v] + heuristic(v, target)",
                "        open_set.add(v)"
            }
        };
    }

    public override List<FrameDTO> Execute(int[] inputData, CancellationToken cancellationToken = default)
    {
        InitializeRecorder();

        if (inputData == null || inputData.Length == 0)
        {
            CaptureEmptyFrame(0, "Đồ thị rỗng, không thể chạy A*.");
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
        int targetNode = nodes.Select((n, i) => new { n.Value, i }).OrderBy(x => x.Value).Last().i;

        if (startNode == targetNode && V > 1)
            targetNode = 1;

        int targetNodeFinal = targetNode;

        
        double heuristic(int nodeId)
        {
            var n = nodes[nodeId];
            var t = nodes[targetNodeFinal];
            return Math.Sqrt((n.X - t.X) * (n.X - t.X) + (n.Y - t.Y) * (n.Y - t.Y));
        }

        var gScore = new int[V];
        var fScore = new int[V];
        var prev = new int?[V];
        var openSet = new HashSet<int>();
        var closedSet = new HashSet<int>();

        for (int i = 0; i < V; i++) { gScore[i] = INF; fScore[i] = INF; }
        gScore[startNode] = 0;
        fScore[startNode] = (int)heuristic(startNode);

        openSet.Add(startNode);

        CaptureFrame(nodes, edges, 0,
            $"Khởi tạo A* từ {nodes[startNode].Value} đến {nodes[targetNodeFinal].Value}. f(start) = {fScore[startNode]} (heuristic only).",
            V, gScore, fScore, prev, openSet, closedSet, startNode, null);

        int step = 1;

        while (openSet.Count > 0)
        {
            cancellationToken.ThrowIfCancellationRequested();

            
            int u = openSet.OrderBy(n => fScore[n]).First();
            openSet.Remove(u);

            
            if (u == targetNodeFinal)
            {
                closedSet.Add(u);

                
                var path = new List<int>();
                int? curr = u;
                while (curr.HasValue)
                {
                    path.Add(curr.Value);
                    curr = prev[curr.Value];
                }
                path.Reverse();

                CaptureFrame(nodes, edges, step++,
                    $"🎯 Đạt đích {nodes[u].Value}! Khoảng cách = {gScore[u]}. Đường đi: {string.Join(" → ", path.Select(i => nodes[i].Value))}",
                    V, gScore, fScore, prev, openSet, closedSet, u, path);

                return _frames;
            }

            closedSet.Add(u);

            CaptureFrame(nodes, edges, step++,
                $"Mở rộng {nodes[u].Value} (f={fScore[u]}, g={gScore[u]}). Closed set +1.",
                V, gScore, fScore, prev, openSet, closedSet, u, null);

            foreach (var (v, weight) in adj[u])
            {
                if (closedSet.Contains(v)) continue;

                int tentativeG = gScore[u] + weight;

                bool isNew = !openSet.Contains(v);

                if (tentativeG < gScore[v])
                {
                    gScore[v] = tentativeG;
                    fScore[v] = tentativeG + (int)heuristic(v);
                    prev[v] = u;

                    if (isNew) openSet.Add(v);

                    CaptureFrame(nodes, edges, step++,
                        $"Cập nhật {nodes[v].Value}: g={tentativeG}, f={fScore[v]} (t qua {nodes[u].Value})",
                        V, gScore, fScore, prev, openSet, closedSet, u, new List<int> { v });
                }
                else
                {
                    CaptureFrame(nodes, edges, step++,
                        $"Bỏ qua {nodes[v].Value}: g={tentativeG} ≥ g[{nodes[v].Value}]={gScore[v]}",
                        V, gScore, fScore, prev, openSet, closedSet, u, null);
                }
            }
        }

        CaptureFrame(nodes, edges, step++,
            $"A* không tìm được đường đi từ {nodes[startNode].Value} đến {nodes[targetNodeFinal].Value}.",
            V, gScore, fScore, prev, openSet, closedSet);

        return _frames;
    }

    private void CaptureFrame(
        List<GraphNode> nodes,
        List<GraphEdge> edges,
        int stepId,
        string explanation,
        int V,
        int[] gScore,
        int[] fScore,
        int?[] prev,
        HashSet<int> openSet,
        HashSet<int> closedSet,
        int? activeNode = null,
        List<int>? path = null)
    {
        const int INF = int.MaxValue / 2;

        var gDict = gScore.Select((g, i) => g < INF ? new { Key = i, Value = g } : null)
            .Where(x => x != null).ToDictionary(x => x.Key, x => x.Value);
        var fDict = fScore.Select((f, i) => f < INF ? new { Key = i, Value = f } : null)
            .Where(x => x != null).ToDictionary(x => x.Key, x => x.Value);
        var prevDict = prev.Where(p => p.HasValue).ToDictionary(p => Array.IndexOf(prev, p), p => p.Value);

        var mstNodeSet = new HashSet<int>(closedSet); 

        
        var pathEdges = new HashSet<string>();
        if (path != null && path.Count > 1)
        {
            for (int i = 0; i < path.Count - 1; i++)
            {
                pathEdges.Add($"{Math.Min(path[i], path[i + 1])}-{Math.Max(path[i], path[i + 1])}");
            }
        }

        var edgeList = edges.Select(e => new GraphEdgeDTO
        {
            From = e.From,
            To = e.To,
            Weight = e.Weight,
            Directed = false,
            InMST = pathEdges.Contains($"{Math.Min(e.From, e.To)}-{Math.Max(e.From, e.To)}"),
            Highlighted = (activeNode.HasValue && (e.From == activeNode.Value || e.To == activeNode.Value))
        }).ToList();

        var frame = new FrameDTO
        {
            StepId = stepId,
            ActiveLine = 3,
            Explanation = explanation,
            DataState = closedSet.Select(i => nodes[i].Value).ToArray(),
            Highlights = new HighlightIndices
            {
                Active = activeNode.HasValue ? new List<int> { activeNode.Value } : new List<int>(),
                Compare = openSet.ToList(), 
                Sorted = closedSet.ToList()  
            }
        };

        frame.GraphNodes = nodes.Select(n => new GraphNodeDTO { Id = n.Id, Value = n.Value, X = n.X, Y = n.Y, Label = n.Label }).ToList();
        frame.GraphEdges = edgeList;
        frame.Distances = gDict;
        frame.Predecessors = prevDict;
        frame.CurrentPath = path;
        frame.QueueState = openSet.ToList(); 

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
}