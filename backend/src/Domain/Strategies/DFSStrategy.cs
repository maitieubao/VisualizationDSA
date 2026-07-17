using System;
using System.Collections.Generic;
using System.Threading;
using VisualizationDSA.Domain.Engine;

namespace VisualizationDSA.Domain.Strategies;

public class DFSStrategy : AlgorithmStrategyBase
{
    public override string AlgorithmId => "dfs";
    public override string Name => "Depth-First Search (Duyệt chiều sâu)";
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
            Description = "Duyệt theo chiều sâu (DFS) bắt đầu từ gốc, đi sâu hết mức có thể dọc theo mỗi nhánh trước khi quay lui (backtrack). Sử dụng Ngăn xếp (Stack) hoặc Đệ quy.",
            PseudoCode = new List<string>
            {
                "DFS(node, visited):",
                "  visited.add(node)",
                "  for neighbor in node.neighbors:",
                "    if neighbor not in visited:",
                "      DFS(neighbor, visited)"
            }
        };
    }

    public override List<FrameDTO> Execute(int[] inputData, CancellationToken cancellationToken = default)
    {
        InitializeRecorder();

        if (inputData == null || inputData.Length == 0)
        {
            CaptureGraphFrame(null, 0, "Cây rỗng, không thể duyệt DFS.", new List<int>());
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

        CaptureGraphFrame(root, 0, "Khởi tạo cây nhị phân để thực hiện duyệt DFS.", new List<int>());

        List<int> visitedValues = new();
        DFS(root, visitedValues, root, cancellationToken);

        CaptureGraphFrame(root, 0, $"Duyệt DFS hoàn tất! Kết quả: [{string.Join(", ", visitedValues)}]", visitedValues);

        return _frames;
    }

    private void DFS(BSTNode? node, List<int> visited, BSTNode? root, CancellationToken cancellationToken)
    {
        if (node == null) return;
        cancellationToken.ThrowIfCancellationRequested();

        visited.Add(node.Value);
        CaptureGraphFrame(root, 1, $"Duyệt qua nút {node.Value} và thêm vào danh sách kết quả.", visited, activeNodeId: node.Id);

        if (node.Left != null)
        {
            CaptureGraphFrame(root, 3, $"Đi sâu xuống cây con trái của nút {node.Value}.", visited, activeNodeId: node.Left.Id);
            DFS(node.Left, visited, root, cancellationToken);
        }

        if (node.Right != null)
        {
            CaptureGraphFrame(root, 4, $"Đi sâu xuống cây con phải của nút {node.Value}.", visited, activeNodeId: node.Right.Id);
            DFS(node.Right, visited, root, cancellationToken);
        }

        CaptureGraphFrame(root, 0, $"Quay lui (Backtrack) từ nút {node.Value}.", visited, activeNodeId: node.Id);
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
