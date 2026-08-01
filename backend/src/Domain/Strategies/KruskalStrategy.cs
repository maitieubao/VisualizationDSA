using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using VisualizationDSA.Domain.Engine;

namespace VisualizationDSA.Domain.Strategies;





public class KruskalStrategy : GraphStrategyBase
{
    public override string AlgorithmId => "kruskal";
    public override string Name => "Kruskal (Cây khung nhỏ nhất)";
    public override string Category => "Graph";

    public override AlgorithmMetadata GetMetadata()
    {
        return new AlgorithmMetadata
        {
            TimeComplexity = "O(E log E)",
            SpaceComplexity = "O(V)",
            Description = "Tìm cây khung nhỏ nhất (MST) của đồ thị vô hướng. Sắp xếp các cạnh theo trọng số tăng dần, thêm cạnh vào MST nếu không tạo chu trình (Union-Find).",
            PseudoCode = new List<string>
            {
                "Kruskal(graph):",
                "  sort all edges by weight",
                "  for each edge (u, v, w) in sorted order:",
                "    if Find(u) != Find(v):",
                "      MST.add(u, v)",
                "      Union(u, v)",
                "  return MST"
            }
        };
    }

    public override List<FrameDTO> Execute(int[] inputData, CancellationToken cancellationToken = default)
    {
        InitializeRecorder();

        if (inputData == null || inputData.Length == 0)
        {
            CaptureEmptyFrame(0, "Đồ thị rỗng, không thể chạy Kruskal.");
            return _frames;
        }

        var (nodes, edges) = BuildGraph(inputData);
        CalculateInitialPositions(nodes, edges);

        int V = nodes.Count;

        
        var sortedEdges = edges.OrderBy(e => e.Weight).ToList();

        
        var parent = Enumerable.Range(0, V).ToArray();
        var rank = new int[V];

        int Find(int x)
        {
            if (parent[x] != x) parent[x] = Find(parent[x]);
            return parent[x];
        }

        void Union(int x, int y)
        {
            int px = Find(x), py = Find(y);
            if (px == py) return;
            if (rank[px] < rank[py]) (px, py) = (py, px);
            parent[py] = px;
            if (rank[px] == rank[py]) rank[px]++;
        }

        var mstEdges = new List<GraphEdge>();
        var includedEdgeIndices = new HashSet<int>();

        
        CaptureFrame(nodes, edges, sortedEdges, mstEdges, includedEdgeIndices, 0,
            "Khởi tạo Kruskal. Sắp xếp cạnh theo trọng số tăng dần.", V);

        int step = 1;
        int mstWeight = 0;

        foreach (var e in sortedEdges)
        {
            cancellationToken.ThrowIfCancellationRequested();

            int u = e.From;
            int v = e.To;
            int setU = Find(u);
            int setV = Find(v);

            var currentMst = new List<GraphEdge>(mstEdges);
            var currentIncluded = new HashSet<int>(includedEdgeIndices);

            CaptureFrame(nodes, edges, sortedEdges, currentMst, currentIncluded, step++,
                $"Xét cạnh ({nodes[u].Value} ↔ {nodes[v].Value}, w={e.Weight}). Find({u})={setU}, Find({v})={setV}",
                V, activeEdgeIdx: sortedEdges.IndexOf(e));

            if (setU != setV)
            {
                Union(u, v);
                mstEdges.Add(e);
                includedEdgeIndices.Add(sortedEdges.IndexOf(e));
                mstWeight += e.Weight;

                CaptureFrame(nodes, edges, sortedEdges, mstEdges, includedEdgeIndices, step++,
                    $" ✅ Thêm cạnh ({nodes[u].Value} ↔ {nodes[v].Value}, w={e.Weight}) vào MST. Tổng trọng số = {mstWeight}",
                    V, includedIdx: sortedEdges.IndexOf(e));
            }
            else
            {
                CaptureFrame(nodes, edges, sortedEdges, mstEdges, includedEdgeIndices, step++,
                    $" ❌ Bỏ qua cạnh ({nodes[u].Value} ↔ {nodes[v].Value}, w={e.Weight}). Sẽ tạo chu trình (cùng tập hợp).",
                    V, excludedIdx: sortedEdges.IndexOf(e));
            }
        }

        CaptureFrame(nodes, edges, sortedEdges, mstEdges, includedEdgeIndices, step++,
            $"Kruskal hoàn tất! MST có {mstEdges.Count} cạnh, tổng trọng số = {mstWeight}",
            V, isFinal: true);

        return _frames;
    }

    private void CaptureFrame(
        List<GraphNode> nodes,
        List<GraphEdge> allEdges,
        List<GraphEdge> sortedEdges,
        List<GraphEdge> mstEdges,
        HashSet<int> includedIndices,
        int stepId,
        string explanation,
        int V,
        int? activeEdgeIdx = null,
        int? includedIdx = null,
        int? excludedIdx = null,
        bool isFinal = false)
    {
        var frame = new FrameDTO
        {
            StepId = stepId,
            ActiveLine = isFinal ? 5 : 3,
            Explanation = explanation,
            DataState = mstEdges.Select(e => e.Weight).ToArray(),
            Highlights = new HighlightIndices
            {
                Active = activeEdgeIdx.HasValue ? new List<int> { activeEdgeIdx.Value } : new List<int>(),
                Compare = includedIndices.ToList(),
                Dimmed = excludedIdx.HasValue ? new List<int> { excludedIdx.Value } : new List<int>()
            }
        };

        
        var mstEdgesList = new List<GraphEdgeDTO>() { };
        var edgeList = allEdges.Select(e => new GraphEdgeDTO
        {
            From = e.From,
            To = e.To,
            Weight = e.Weight,
            Directed = false,
            InMST = includedIndices.Contains(allEdges.IndexOf(e)),
            Highlighted = activeEdgeIdx.HasValue && allEdges.IndexOf(e) == activeEdgeIdx.Value
        }).ToList();

        
        var highlightedEdges = new HashSet<int>();
        if (activeEdgeIdx.HasValue) highlightedEdges.Add(activeEdgeIdx.Value);
        if (includedIdx.HasValue) highlightedEdges.Add(includedIdx.Value);
        if (excludedIdx.HasValue) highlightedEdges.Add(excludedIdx.Value);

        frame.GraphNodes = nodes.Select(n => new GraphNodeDTO { Id = n.Id, Value = n.Value, X = n.X, Y = n.Y, Label = n.Label }).ToList();
        frame.GraphEdges = edgeList;
        frame.Distances = new Dictionary<int, int> { { 0, mstEdges.Count } }; 

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