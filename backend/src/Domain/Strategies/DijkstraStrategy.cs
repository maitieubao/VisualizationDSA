using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using VisualizationDSA.Domain.Engine;

namespace VisualizationDSA.Domain.Strategies;

public class DijkstraStrategy : AlgorithmStrategyBase
{
    public override string AlgorithmId => "dijkstra";
    public override string Name => "Dijkstra's Shortest Path (Đường đi ngắn nhất)";
    public override string Category => "Graph";

    private class BSTNode
    {
        public int Id { get; set; }
        public int OriginalValue { get; set; }
        public int CurrentDistance { get; set; } = 999; // 999 represents Infinity
        public BSTNode? Left { get; set; }
        public BSTNode? Right { get; set; }
    }

    public override AlgorithmMetadata GetMetadata()
    {
        return new AlgorithmMetadata
        {
            TimeComplexity = "O((V + E) log V)",
            SpaceComplexity = "O(V)",
            Description = "Thuật toán Dijkstra tìm đường đi ngắn nhất từ đỉnh nguồn (nút gốc) đến tất cả các đỉnh khác trên đồ thị có trọng số. Mỗi cạnh trái có trọng số = 3, cạnh phải = 5.",
            PseudoCode = new List<string>
            {
                "Dijkstra(graph, source):",
                "  dist = {v: infinity for v in graph}",
                "  dist[source] = 0",
                "  pq = PriorityQueue(source, 0)",
                "  while pq is not empty:",
                "    curr, d = pq.popMin()",
                "    for neighbor, weight in curr.edges:",
                "      newDist = d + weight",
                "      if newDist < dist[neighbor]:",
                "        dist[neighbor] = newDist",
                "        pq.push(neighbor, newDist)"
            }
        };
    }

    public override List<FrameDTO> Execute(int[] inputData, CancellationToken cancellationToken = default)
    {
        InitializeRecorder();

        if (inputData == null || inputData.Length == 0)
        {
            CaptureGraphFrame(null, 0, "Cây rỗng, không thể chạy Dijkstra.", new List<int>());
            return _frames;
        }

        // Dựng cây nhị phân tìm kiếm
        BSTNode? root = null;
        int idCounter = 0;
        foreach (int val in inputData)
        {
            cancellationToken.ThrowIfCancellationRequested();
            root = Insert(root, val, ref idCounter);
        }

        CaptureGraphFrame(root, 0, "Khởi tạo cây. Đặt khoảng cách tới gốc = 0, các nút khác = Vô cùng (999).", new List<int>());

        // Dijkstra algorithm
        if (root == null) return _frames;

        root.CurrentDistance = 0;
        CaptureGraphFrame(root, 2, "Thiết lập khoảng cách của nút nguồn (nút gốc) = 0.", new List<int>(), activeNodeId: root.Id);

        var allNodes = new List<BSTNode>();
        GetAllNodes(root, allNodes);

        var unvisited = new HashSet<BSTNode>(allNodes);
        var visitedDistances = new List<int>();

        while (unvisited.Count > 0)
        {
            cancellationToken.ThrowIfCancellationRequested();

            // Lấy nút có khoảng cách nhỏ nhất
            var curr = unvisited.OrderBy(n => n.CurrentDistance).First();
            if (curr.CurrentDistance == 999)
            {
                // Tất cả các nút còn lại không thể tới được từ nguồn
                break;
            }

            unvisited.Remove(curr);
            visitedDistances.Add(curr.CurrentDistance);

            CaptureGraphFrame(root, 4, $"Chọn nút {curr.OriginalValue} có dist = {curr.CurrentDistance} nhỏ nhất để duyệt.", visitedDistances, activeNodeId: curr.Id);

            // Thư giãn các nút con (Left: weight 3, Right: weight 5)
            if (curr.Left != null && unvisited.Contains(curr.Left))
            {
                int weight = 3;
                int newDist = curr.CurrentDistance + weight;
                CaptureGraphFrame(root, 6, $"Xét nút con trái {curr.Left.OriginalValue}. Tính khoảng cách mới = {curr.CurrentDistance} + {weight} = {newDist}.", visitedDistances, activeNodeId: curr.Left.Id);

                if (newDist < curr.Left.CurrentDistance)
                {
                    curr.Left.CurrentDistance = newDist;
                    CaptureGraphFrame(root, 7, $"Cập nhật dist[{curr.Left.OriginalValue}] = {newDist} (nhỏ hơn {curr.Left.CurrentDistance}).", visitedDistances, activeNodeId: curr.Left.Id);
                }
            }

            if (curr.Right != null && unvisited.Contains(curr.Right))
            {
                int weight = 5;
                int newDist = curr.CurrentDistance + weight;
                CaptureGraphFrame(root, 6, $"Xét nút con phải {curr.Right.OriginalValue}. Tính khoảng cách mới = {curr.CurrentDistance} + {weight} = {newDist}.", visitedDistances, activeNodeId: curr.Right.Id);

                if (newDist < curr.Right.CurrentDistance)
                {
                    curr.Right.CurrentDistance = newDist;
                    CaptureGraphFrame(root, 7, $"Cập nhật dist[{curr.Right.OriginalValue}] = {newDist} (nhỏ hơn {curr.Right.CurrentDistance}).", visitedDistances, activeNodeId: curr.Right.Id);
                }
            }
        }

        CaptureGraphFrame(root, 0, "Thuật toán Dijkstra hoàn tất! Khoảng cách ngắn nhất từ nút gốc đến mọi nút đã được xác định.", visitedDistances);

        return _frames;
    }

    private BSTNode Insert(BSTNode? node, int value, ref int idCounter)
    {
        if (node == null)
        {
            return new BSTNode { Id = ++idCounter, OriginalValue = value };
        }

        if (value < node.OriginalValue)
        {
            node.Left = Insert(node.Left, value, ref idCounter);
        }
        else
        {
            node.Right = Insert(node.Right, value, ref idCounter);
        }

        return node;
    }

    private void GetAllNodes(BSTNode? node, List<BSTNode> list)
    {
        if (node == null) return;
        list.Add(node);
        GetAllNodes(node.Left, list);
        GetAllNodes(node.Right, list);
    }

    private void CaptureGraphFrame(
        BSTNode? root,
        int activeLine,
        string explanation,
        List<int> visitedDistances,
        int activeNodeId = -1)
    {
        var treeNodes = new List<TreeNodeDTO>();
        var dataValues = new List<int>();
        SerializeTree(root, treeNodes, dataValues);

        var highlights = new HighlightIndices
        {
            Compare = new List<int>(),
            Swap = new List<int>(),
            Sorted = new List<int>(),
            Active = activeNodeId >= 0 ? new List<int> { activeNodeId } : new List<int>()
        };

        _frames.Add(new FrameDTO
        {
            StepId = _frames.Count + 1,
            ActiveLine = activeLine,
            Explanation = explanation,
            DataState = visitedDistances.ToArray(),
            Highlights = highlights,
            TreeNodes = treeNodes.Count > 0 ? treeNodes : null
        });
    }

    private static void SerializeTree(BSTNode? node, List<TreeNodeDTO> nodes, List<int> values)
    {
        if (node == null) return;

        // Render the CurrentDistance as the node value in the UI visualizer so it updates in real time!
        nodes.Add(new TreeNodeDTO
        {
            Id = node.Id,
            Value = node.CurrentDistance == 999 ? 999 : node.CurrentDistance,
            LeftNodeId = node.Left?.Id,
            RightNodeId = node.Right?.Id
        });
        values.Add(node.CurrentDistance);

        SerializeTree(node.Left, nodes, values);
        SerializeTree(node.Right, nodes, values);
    }
}
