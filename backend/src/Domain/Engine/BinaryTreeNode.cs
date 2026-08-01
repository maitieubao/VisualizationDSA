using System;

namespace VisualizationDSA.Domain.Engine
{
    public class BinaryTreeNode
    {
        public int Value { get; set; }
        public int Id { get; set; } 
        public BinaryTreeNode? Left { get; set; }
        public BinaryTreeNode? Right { get; set; }
        public int Depth { get; set; }

        public BinaryTreeNode(int value, int id, int depth)
        {
            Value = value;
            Id = id;
            Depth = depth;
        }
    }
}
