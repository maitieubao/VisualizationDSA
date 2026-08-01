using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using VisualizationDSA.Domain.Engine;

namespace VisualizationDSA.Domain.Strategies;





public class PrimStrategy : GraphStrategyBase
{
    public override string AlgorithmId => "prim";
    public override string Name => "Prim (Cây khung nhỏ nhất)";
    public override string Category => "Graph";

    public override AlgorithmMetadata GetMetadata()
    {
        return new AlgorithmMetadata
        {
            TimeComplexity = "O((V + E) log V)",
            SpaceComplexity = "O(V)",
            Description = "Tìm cây khung nhỏ nhất (MST) từ đỉnh 0. Tương tự Dijkstra nhưng thay vì track khoảng cách từ source, track cạnh rẻ nhất nối đỉnh trong MST với đỉnh ngoài MST.",
            PseudoCode = new List<string>
            {
                "Prim(graph, source):",
                "  key = [INF for v in V]",
                "  parent = [null for v in V]",
                "  key[source] = 0",
                "  pq = PriorityQueue([(0, source)])",
                "  while pq not empty:",
                "    (w, u) = pq.popMin()",
                "    for (v, weight) in u.neighbors:",
                "      if v not in MST and weight < key[v]:",
                "        key[v] = weight",
                "        parent[v] = u",
                "        pq.decreaseKey(v, weight)"
            }
        };
    }

    public override List<FrameDTO> Execute(int[] inputData, CancellationToken cancellationToken = default)
    {
        InitializeRecorder();

        if (inputData == null || inputData.Length == 0)
        {
            CaptureEmptyFrame(0, "Đồ thị rỗng, không thể chạy Prim.");
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

        var key = new int[V];
        var parent = new int?[V];
        var inMST = new bool[V];
        for (int i = 0; i < V; i++) key[i] = INF;
        key[startNode] = 0;

        var pq = new PriorityQueue<int, int>();
        pq.Enqueue(startNode, 0);

        int mstWeight = 0;
        int mstEdges = 0;

        CaptureFrame(nodes, edges, startNode, 0,
            "Khởi tạo Prim từ đỉnh 0. key[0]=0, others=∞.", V, key, parent, inMST);

        int step = 1;

        while (pq.Count > 0)
        {
            cancellationToken.ThrowIfCancellationRequested();

            int u = pq.Dequeue();
            if (inMST[u]) continue;

            inMST[u] = true;
            if (parent[u].HasValue) mstWeight += key[u];
            mstEdges++;

            CaptureFrame(nodes, edges, startNode, step++,
                $"Chốt đỉnh {nodes[u].Value}. MST có {mstEdges} cạnh, tổng trọng số = {mstWeight}",
                V, key, parent, inMST, activeNode: u);

            foreach (var (v, weight) in adj[u])
            {
                if (!inMST[v] && weight < key[v])
                {
                    key[v] = weight;
                    parent[v] = u;
                    pq.Enqueue(v, weight);

                    CaptureFrame(nodes, edges, startNode, step++,
                        $"Cập nhật key[{nodes[v].Value}] = {weight} (cạnh {nodes[u].Value}→{nodes[v].Value}), parent[{nodes[v].Value}] = {nodes[u].Value}",
                        V, key, parent, inMST, updatedNode: v);
                }
            }
        }

        CaptureFrame(nodes, edges, startNode, step++,
            $"Prim hoàn tất! MST có {mstEdges} cạnh, tổng trọng số = {mstWeight}",
            V, key, parent, inMST, isFinal: true);

        return _frames;
    }

    private void CaptureFrame(
        List<GraphNode> nodes,
        List<GraphEdge> edges,
        int startNode,
        int stepId,
        string explanation,
        int V,
        int[] key,
        int?[] parent,
        bool[] inMST,
        int? activeNode = null,
        int? updatedNode = null,
        bool isFinal = false)
    {
        const int INF = int.MaxValue / 2;

        var distDict = key.Select((k, i) => k < INF ? new { Key = i, Value = k } : null)
            .Where(x => x != null).ToDictionary(x => x.Key, x => x.Value);
        var prevDict = parent.Where(p => p.HasValue).ToDictionary(p => Array.IndexOf(parent, p), p => p.Value);

        var mstNodeSet = new HashSet<int>();
        for (int i = 0; i < V; i++) if (inMST[i]) mstNodeSet.Add(i);

        var frame = new FrameDTO
        {
            StepId = stepId,
            ActiveLine = isFinal ? 5 : 3,
            Explanation = explanation,
            DataState = mstNodeSet.Select(i => nodes[i].Value).ToArray(),
            Highlights = new HighlightIndices
            {
                Active = updatedNode.HasValue ? new List<int> { updatedNode.Value } : new List<int>(),
                Compare = mstNodeSet.ToList(),
                Sorted = new List<int>()
            }
        };

        var edgeList = edges.Select(e => new GraphEdgeDTO
        {
            From = e.From,
            To = e.To,
            Weight = e.Weight,
            Directed = false,
            InMST = inMST[e.From] && inMST[e.To],
            Highlighted = (activeNode.HasValue && (e.From == activeNode.Value || e.To == activeNode.Value))
                || (updatedNode.HasValue && (e.From == updatedNode.Value || e.To == updatedNode.Value))
        }).ToList();

        frame.GraphNodes = nodes.Select(n => new GraphNodeDTO { Id = n.Id, Value = n.Value, X = n.X, Y = n.Y, Label = n.Label }).ToList();
        frame.GraphEdges = edgeList;
        frame.Distances = distDict;
        frame.Predecessors = prevDict;

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