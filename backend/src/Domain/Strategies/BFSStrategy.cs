using System;
using System.Collections.Generic;
using System.Threading;
using VisualizationDSA.Domain.Engine;

namespace VisualizationDSA.Domain.Strategies;

public class BFSStrategy : AlgorithmStrategyBase
{
    public override string AlgorithmId => "bfs";
    public override string Name => "Breadth-First Search (Duyệt chiều rộng)";
    public override string Category => "Graph";

    private class BSTNode
    {
        public int Id { get; set; }
        public int Value { get; set; }
        public BSTNode? Left { get; set; }
        public BSTNode? Right { get; set; }
    }

    public override AlgorithmMetadata GetMetadata()
    {
        return new AlgorithmMetadata
        {
            TimeComplexity = "O(V + E)",
            SpaceComplexity = "O(V)",
            Description = "Duyệt theo chiều rộng (BFS) đi qua các đỉnh của đồ thị/cây theo từng lớp (chiều rộng). Sử dụng Hàng đợi (Queue) để điều phối thứ tự duyệt.",
            PseudoCode = new List<string>
            {
                "BFS(root):",
                "  queue = [root]",
                "  visited = {root}",
                "  while queue is not empty:",
                "    curr = queue.dequeue()",
                "    for neighbor in curr.neighbors:",
                "      if neighbor not in visited:",
                "        visited.add(neighbor)",
                "        queue.enqueue(neighbor)"
            }
        };
    }

    public override List<FrameDTO> Execute(int[] inputData, CancellationToken cancellationToken = default)
    {
        InitializeRecorder();

        if (inputData == null || inputData.Length == 0)
        {
            CaptureGraphFrame(null, 0, "Cây rỗng, không thể duyệt BFS.", new List<int>());
            return _frames;
        }

        // Dựng cây nhị phân tìm kiếm từ inputData
        BSTNode? root = null;
        int idCounter = 0;
        foreach (int val in inputData)
        {
            cancellationToken.ThrowIfCancellationRequested();
            root = Insert(root, val, ref idCounter);
        }

        CaptureGraphFrame(root, 0, "Khởi tạo cây nhị phân để thực hiện duyệt BFS.", new List<int>());

        Queue<BSTNode> queue = new();
        List<int> visitedValues = new();

        queue.Enqueue(root);
        CaptureGraphFrame(root, 1, $"Bắt đầu duyệt BFS. Đưa nút gốc {root.Value} vào Queue.", visitedValues, activeNodeId: root.Id);

        while (queue.Count > 0)
        {
            cancellationToken.ThrowIfCancellationRequested();
            BSTNode curr = queue.Dequeue();
            visitedValues.Add(curr.Value);

            CaptureGraphFrame(root, 3, $"Lấy nút {curr.Value} ra khỏi Queue và đánh dấu duyệt.", visitedValues, activeNodeId: curr.Id);

            if (curr.Left != null)
            {
                queue.Enqueue(curr.Left);
                CaptureGraphFrame(root, 7, $"Phát hiện con trái {curr.Left.Value} chưa duyệt. Thêm vào Queue.", visitedValues, activeNodeId: curr.Left.Id);
            }
            if (curr.Right != null)
            {
                queue.Enqueue(curr.Right);
                CaptureGraphFrame(root, 8, $"Phát hiện con phải {curr.Right.Value} chưa duyệt. Thêm vào Queue.", visitedValues, activeNodeId: curr.Right.Id);
            }
        }

        CaptureGraphFrame(root, 0, $"Duyệt BFS hoàn tất! Kết quả: [{string.Join(", ", visitedValues)}]", visitedValues);

        return _frames;
    }

    private BSTNode Insert(BSTNode? node, int value, ref int idCounter)
    {
        if (node == null)
        {
            return new BSTNode { Id = ++idCounter, Value = value };
        }

        if (value < node.Value)
        {
            node.Left = Insert(node.Left, value, ref idCounter);
        }
        else
        {
            node.Right = Insert(node.Right, value, ref idCounter);
        }

        return node;
    }

    private void CaptureGraphFrame(
        BSTNode? root,
        int activeLine,
        string explanation,
        List<int> visitedValues,
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
            DataState = visitedValues.ToArray(),
            Highlights = highlights,
            TreeNodes = treeNodes.Count > 0 ? treeNodes : null
        });
    }

    private static void SerializeTree(BSTNode? node, List<TreeNodeDTO> nodes, List<int> values)
    {
        if (node == null) return;

        nodes.Add(new TreeNodeDTO
        {
            Id = node.Id,
            Value = node.Value,
            LeftNodeId = node.Left?.Id,
            RightNodeId = node.Right?.Id
        });
        values.Add(node.Value);

        SerializeTree(node.Left, nodes, values);
        SerializeTree(node.Right, nodes, values);
    }
}
