using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using VisualizationDSA.Domain.Engine;

namespace VisualizationDSA.Domain.Strategies;

public class BSTStrategy : AlgorithmStrategyBase
{
    public override string AlgorithmId => "bst";
    public override string Name => "Binary Search Tree (Cây tìm kiếm nhị phân)";
    public override string Category => "Tree";

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
            TimeComplexity = "O(log N)",
            SpaceComplexity = "O(N)",
            Description = "Cây tìm kiếm nhị phân (BST) lưu trữ dữ liệu sao cho mỗi node trái nhỏ hơn node cha, mỗi node phải lớn hơn node cha. Hỗ trợ chèn, tìm kiếm và duyệt cây LNR.",
            PseudoCode = new List<string>
            {
                "insert(root, value):",
                "  if root is null:",
                "    return new Node(value)",
                "  if value < root.value:",
                "    root.left = insert(root.left, value)",
                "  else:",
                "    root.right = insert(root.right, value)",
                "  return root",
                "inorder(root):",
                "  inorder(root.left)",
                "  visit(root)",
                "  inorder(root.right)"
            }
        };
    }

    public override List<FrameDTO> Execute(int[] inputData, CancellationToken cancellationToken = default)
    {
        InitializeRecorder();
        int nodeIdCounter = 0;
        BSTNode? root = null;

        CaptureBSTFrame(null, 0, "Khởi tạo cây BST rỗng.", new List<int>());

        foreach (int val in inputData)
        {
            cancellationToken.ThrowIfCancellationRequested();
            root = Insert(root, val, ref nodeIdCounter, root, cancellationToken);
        }

        CaptureBSTFrame(root, 0,
            $"Đã chèn xong {inputData.Length} node. Bắt đầu duyệt cây theo thứ tự LNR (In-Order).",
            new List<int>());

        var inorderResult = new List<int>();
        InorderTraversal(root, inorderResult, cancellationToken);

        CaptureBSTFrame(root, 0,
            $"Duyệt LNR hoàn tất: [{string.Join(", ", inorderResult)}]",
            inorderResult);

        return _frames;
    }

    private BSTNode Insert(BSTNode? node, int value, ref int idCounter, BSTNode? root, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        if (node == null)
        {
            var newNode = new BSTNode { Id = ++idCounter, Value = value };

            CaptureBSTFrame(root, 2,
                $"Tạo node mới với giá trị {value} (ID: {newNode.Id}).",
                new List<int>(),
                highlightNodeId: newNode.Id);

            return newNode;
        }

        if (value < node.Value)
        {
            CaptureBSTFrame(root, 3,
                $"So sánh {value} < {node.Value}. Đi sang cây con trái.",
                new List<int>(),
                highlightNodeId: node.Id);

            node.Left = Insert(node.Left, value, ref idCounter, root, cancellationToken);
        }
        else
        {
            CaptureBSTFrame(root, 5,
                $"So sánh {value} >= {node.Value}. Đi sang cây con phải.",
                new List<int>(),
                highlightNodeId: node.Id);

            node.Right = Insert(node.Right, value, ref idCounter, root, cancellationToken);
        }

        return node;
    }

    private void InorderTraversal(BSTNode? node, List<int> result, CancellationToken cancellationToken)
    {
        if (node == null) return;
        cancellationToken.ThrowIfCancellationRequested();

        InorderTraversal(node.Left, result, cancellationToken);

        result.Add(node.Value);

        CaptureBSTFrame(node, 10,
            $"Duyệt node {node.Value} (LNR). Kết quả hiện tại: [{string.Join(", ", result)}]",
            result,
            highlightNodeId: node.Id);

        InorderTraversal(node.Right, result, cancellationToken);
    }

    private void CaptureBSTFrame(
        BSTNode? root,
        int activeLine,
        string explanation,
        List<int> sortedValues,
        int highlightNodeId = -1)
    {
        var treeNodes = new List<TreeNodeDTO>();
        var dataValues = new List<int>();
        SerializeTree(root, treeNodes, dataValues);

        var highlights = new HighlightIndices
        {
            Compare = highlightNodeId >= 0 ? new List<int> { highlightNodeId } : new List<int>(),
            Swap = new List<int>(),
            Sorted = new List<int>(),
            Active = highlightNodeId >= 0 ? new List<int> { highlightNodeId } : new List<int>()
        };

        _frames.Add(new FrameDTO
        {
            StepId = _frames.Count + 1,
            ActiveLine = activeLine,
            Explanation = explanation,
            DataState = dataValues.ToArray(),
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
