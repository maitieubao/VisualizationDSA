using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using VisualizationDSA.Domain.Engine;

namespace VisualizationDSA.Domain.Strategies;




public class BFSStrategy : GraphStrategyBase
{
    public override string AlgorithmId => "bfs";
    public override string Name => "Breadth-First Search (Duyệt BFS)";
    public override string Category => "Graph";

    public override AlgorithmMetadata GetMetadata()
    {
        return new AlgorithmMetadata
        {
            TimeComplexity = "O(V + E)",
            SpaceComplexity = "O(V)",
            Description = "Duyệt đồ thị theo chiều rộng (BFS) từ đỉnh bắt đầu. Sử dụng hàng đợi (Queue) để thăm các đỉnh theo từng tầng. Ứng dụng: tìm đường đi ngắn nhất trên đồ thị không trọng số, kiểm tra tính liên thông.",
            PseudoCode = new List<string>
            {
                "BFS(graph, start):",
                "  visited = {v: false for v in graph}",
                "  queue = Queue()",
                "  queue.enqueue(start)",
                "  visited[start] = true",
                "  while queue not empty:",
                "    u = queue.dequeue()",
                "    for v in u.neighbors:",
                "      if not visited[v]:",
                "        visited[v] = true",
                "        queue.enqueue(v)"
            }
        };
    }

    public override List<FrameDTO> Execute(int[] inputData, CancellationToken cancellationToken = default)
    {
        InitializeRecorder();

        if (inputData == null || inputData.Length == 0)
        {
            CaptureEmptyFrame(0, "Đồ thị rỗng, không thể chạy BFS.");
            return _frames;
        }

        var (nodes, edges) = BuildGraph(inputData);
        CalculateInitialPositions(nodes, edges);

        int V = nodes.Count;
        var adj = new List<List<int>>();
        for (int i = 0; i < V; i++) adj.Add(new List<int>());
        foreach (var e in edges)
        {
            adj[e.From].Add(e.To);
            if (!e.Directed) adj[e.To].Add(e.From);
        }

        
        int startNode = 0;
        for (int i = 0; i < V; i++) if (nodes[i].Value == 0) startNode = i;

        var visited = new bool[V];
        var queue = new Queue<int>();
        var order = new List<int>();

        visited[startNode] = true;
        queue.Enqueue(startNode);

        
        CaptureFrame(nodes, edges, adj, 0,
            $"Khởi tạo BFS từ đỉnh {nodes[startNode].Value}. Đưa vào hàng đợi: [{nodes[startNode].Value}]",
            visited, new List<int>(queue), startNode);

        int step = 1;

        while (queue.Count > 0)
        {
            cancellationToken.ThrowIfCancellationRequested();

            int u = queue.Dequeue();
            order.Add(u);

            CaptureFrame(nodes, edges, adj, step++,
                $"Lấy đỉnh {nodes[u].Value} từ hàng đợi. Đã duyệt: [{string.Join(", ", order.Select(i => nodes[i].Value))}]",
                visited, new List<int>(queue), u);

            foreach (int v in adj[u])
            {
                if (!visited[v])
                {
                    visited[v] = true;
                    queue.Enqueue(v);

                    CaptureFrame(nodes, edges, adj, step++,
                        $"Khám phá đỉnh {nodes[v].Value} (kề {nodes[u].Value}). Đưa vào hàng đợi: [{string.Join(", ", queue.Select(i => nodes[i].Value))}]",
                        visited, new List<int>(queue), v);
                }
            }
        }

        CaptureFrame(nodes, edges, adj, step++,
            $"BFS hoàn tất! Thứ tự duyệt: [{string.Join(" → ", order.Select(i => nodes[i].Value))}]",
            visited, new List<int>(), order.LastOrDefault());

        return _frames;
    }

    private void CaptureFrame(
        List<GraphNode> nodes,
        List<GraphEdge> edges,
        List<List<int>> adj,
        int stepId,
        string explanation,
        bool[] visited,
        List<int> queue,
        int? activeNodeId = null)
    {
        var frame = new FrameDTO
        {
            StepId = stepId,
            ActiveLine = GetLineForStep(stepId),
            Explanation = explanation,
            DataState = Enumerable.Range(0, visited.Length).Where(i => visited[i]).Select(i => nodes[i].Value).ToArray(),
            Highlights = new HighlightIndices
            {
                Active = activeNodeId.HasValue ? new List<int> { activeNodeId.Value } : new List<int>(),
                Compare = queue, 
                Sorted = Enumerable.Range(0, visited.Length).Where(i => visited[i]).ToList() 
            }
        };

        PopulateFrameGraph(frame, nodes, edges,
            highlightedNodes: new HashSet<int>(Enumerable.Range(0, visited.Length).Where(i => visited[i])),
            activeNodeId: activeNodeId);

        frame.QueueState = queue;

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
        if (step <= 4) return 3;
        if (step <= 6) return 4;
        if (step <= 10) return 5;
        return 6;
    }
}