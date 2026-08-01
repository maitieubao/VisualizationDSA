using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using VisualizationDSA.Domain.Engine;

namespace VisualizationDSA.Domain.Strategies;




public class DFSStrategy : GraphStrategyBase
{
    public override string AlgorithmId => "dfs";
    public override string Name => "Depth-First Search (Duyệt DFS)";
    public override string Category => "Graph";

    public override AlgorithmMetadata GetMetadata()
    {
        return new AlgorithmMetadata
        {
            TimeComplexity = "O(V + E)",
            SpaceComplexity = "O(V)",
            Description = "Duyệt đồ thị theo chiều sâu (DFS) từ đỉnh bắt đầu. Sử dụng ngăn xếp (Stack) hoặc đệ quy để đi sâu hết mức trước khi quay lui (backtrack). Ứng dụng: tìm chu trình, sắp xếp topo, tìm thành phần liên thông mạnh.",
            PseudoCode = new List<string>
            {
                "DFS(graph, start):",
                "  visited = {v: false for v in graph}",
                "  stack = Stack()",
                "  stack.push(start)",
                "  while stack not empty:",
                "    u = stack.pop()",
                "    if not visited[u]:",
                "      visited[u] = true",
                "      for v in u.neighbors:",
                "        if not visited[v]:",
                "          stack.push(v)"
            }
        };
    }

    public override List<FrameDTO> Execute(int[] inputData, CancellationToken cancellationToken = default)
    {
        InitializeRecorder();

        if (inputData == null || inputData.Length == 0)
        {
            CaptureEmptyFrame(0, "Đồ thị rỗng, không thể chạy DFS.");
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
        var stack = new Stack<int>();
        var order = new List<int>();

        stack.Push(startNode);

        CaptureFrame(nodes, edges, 0,
            $"Khởi tạo DFS từ đỉnh {nodes[startNode].Value}. Đưa vào ngăn xếp: [{nodes[startNode].Value}]",
            visited, new List<int>(stack), startNode);

        int step = 1;

        while (stack.Count > 0)
        {
            cancellationToken.ThrowIfCancellationRequested();

            int u = stack.Pop();

            if (visited[u]) continue;

            visited[u] = true;
            order.Add(u);

            CaptureFrame(nodes, edges, step++,
                $"Lấy đỉnh {nodes[u].Value} từ ngăn xếp, đánh dấu đã duyệt. Đã duyệt: [{string.Join(", ", order.Select(i => nodes[i].Value))}]",
                visited, new List<int>(stack), u);

            
            var neighbors = adj[u].OrderByDescending(v => v).ToList();
            foreach (int v in neighbors)
            {
                if (!visited[v])
                {
                    stack.Push(v);
                    CaptureFrame(nodes, edges, step++,
                        $"Khám phá đỉnh {nodes[v].Value} (kề {nodes[u].Value}). Đẩy vào ngăn xếp: [{string.Join(", ", stack.Select(i => nodes[i].Value))}]",
                        visited, new List<int>(stack), v);
                }
            }
        }

        CaptureFrame(nodes, edges, step++,
            $"DFS hoàn tất! Thứ tự duyệt: [{string.Join(" → ", order.Select(i => nodes[i].Value))}]",
            visited, new List<int>(), order.LastOrDefault());

        return _frames;
    }

    private void CaptureFrame(
        List<GraphNode> nodes,
        List<GraphEdge> edges,
        int stepId,
        string explanation,
        bool[] visited,
        List<int> stack,
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
                Compare = stack, 
                Sorted = Enumerable.Range(0, visited.Length).Where(i => visited[i]).ToList() 
            }
        };

        PopulateFrameGraph(frame, nodes, edges,
            highlightedNodes: new HashSet<int>(Enumerable.Range(0, visited.Length).Where(i => visited[i])),
            activeNodeId: activeNodeId);

        frame.QueueState = stack; 

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
        return 5;
    }
}