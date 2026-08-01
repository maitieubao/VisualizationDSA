using System;
using System.Collections.Generic;
using System.Linq;
using VisualizationDSA.Domain.Engine;

namespace VisualizationDSA.Domain.Strategies;




public class GraphNode
{
    public int Id { get; set; }
    public int Value { get; set; }
    public double X { get; set; }
    public double Y { get; set; }
    public string? Label { get; set; }
}




public class GraphEdge
{
    public int From { get; set; }
    public int To { get; set; }
    public int Weight { get; set; }
    public bool Directed { get; set; }
}





public abstract class GraphStrategyBase : AlgorithmStrategyBase
{
    protected List<GraphNode> BuildNodes(int[] inputData)
    {
        var nodes = new List<GraphNode>();
        for (int i = 0; i < inputData.Length; i++)
        {
            nodes.Add(new GraphNode
            {
                Id = i,
                Value = inputData[i],
                X = 0,
                Y = 0,
                Label = inputData[i].ToString()
            });
        }
        return nodes;
    }

    protected List<GraphEdge> BuildEdges(List<GraphNode> nodes, int[] inputData)
    {
        var edges = new List<GraphEdge>();
        var rand = new Random(42); 

        
        for (int i = 0; i < nodes.Count; i++)
        {
            int next = (i + 1) % nodes.Count;
            edges.Add(new GraphEdge
            {
                From = i,
                To = next,
                Weight = rand.Next(1, 10),
                Directed = false
            });
        }

        
        int extraEdges = Math.Min(nodes.Count, 3);
        for (int i = 0; i < extraEdges; i++)
        {
            int from = i * 2 % nodes.Count;
            int to = (from + 2 + i) % nodes.Count;
            if (from != to && !edges.Any(e => (e.From == from && e.To == to) || (e.From == to && e.To == from)))
            {
                edges.Add(new GraphEdge
                {
                    From = from,
                    To = to,
                    Weight = rand.Next(1, 10),
                    Directed = false
                });
            }
        }

        return edges;
    }

    protected (List<GraphNode>, List<GraphEdge>) BuildGraph(int[] inputData)
    {
        var nodes = BuildNodes(inputData);
        var edges = BuildEdges(nodes, inputData);
        return (nodes, edges);
    }

    protected void CalculateInitialPositions(List<GraphNode> nodes, List<GraphEdge> edges)
    {
        if (nodes.Count == 0) return;

        
        double centerX = 400;
        double centerY = 300;
        double radius = Math.Min(centerX, centerY) - 50;

        for (int i = 0; i < nodes.Count; i++)
        {
            double angle = 2 * Math.PI * i / nodes.Count - Math.PI / 2;
            nodes[i].X = centerX + radius * Math.Cos(angle);
            nodes[i].Y = centerY + radius * Math.Sin(angle);
        }

        
        if (nodes.Count <= 15)
        {
            TryTreeLayout(nodes, edges);
        }
    }

    private void TryTreeLayout(List<GraphNode> nodes, List<GraphEdge> edges)
    {
        var adj = new Dictionary<int, List<int>>();
        foreach (var n in nodes) adj[n.Id] = new List<int>();
        foreach (var e in edges)
        {
            adj[e.From].Add(e.To);
            if (!e.Directed) adj[e.To].Add(e.From);
        }

        var visited = new HashSet<int>();
        TreeLayoutRecursive(nodes, adj, 0, 400, 80, 0, 200, visited);
    }

    private void TreeLayoutRecursive(
        List<GraphNode> nodes,
        Dictionary<int, List<int>> adj,
        int nodeId,
        double x,
        double y,
        int depth,
        double xSpread,
        HashSet<int> visited)
    {
        if (visited.Contains(nodeId)) return;
        visited.Add(nodeId);

        var node = nodes.First(n => n.Id == nodeId);
        node.X = x;
        node.Y = y;

        var children = adj[nodeId].Where(c => !visited.Contains(c)).ToList();
        if (children.Count == 0) return;

        double childY = y + 100;
        double startX = x - (children.Count - 1) * xSpread / 2.0;

        for (int i = 0; i < children.Count; i++)
        {
            TreeLayoutRecursive(nodes, adj, children[i], startX + i * xSpread, childY, depth + 1, xSpread * 0.7, visited);
        }
    }

    protected void PopulateFrameGraph(
        FrameDTO frame,
        List<GraphNode> nodes,
        List<GraphEdge> edges,
        HashSet<int>? highlightedNodes = null,
        HashSet<int>? highlightedEdges = null,
        int? activeNodeId = null)
    {
        frame.GraphNodes = nodes.Select(n => new GraphNodeDTO
        {
            Id = n.Id,
            Value = n.Value,
            X = n.X,
            Y = n.Y,
            Label = n.Label
        }).ToList();

        frame.GraphEdges = edges.Select(e => new GraphEdgeDTO
        {
            From = e.From,
            To = e.To,
            Weight = e.Weight,
            Directed = e.Directed,
            Highlighted = highlightedEdges?.Contains(e.From * 1000 + e.To) ?? false,
            InMST = false
        }).ToList();

        if (activeNodeId.HasValue)
        {
            frame.Highlights.Active = new List<int> { activeNodeId.Value };
        }
        else if (highlightedNodes?.Count > 0)
        {
            frame.Highlights.Active = highlightedNodes.ToList();
        }
    }
}