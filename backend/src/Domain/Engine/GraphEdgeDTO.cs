namespace VisualizationDSA.Domain.Engine;





public class GraphEdgeDTO
{
    public int From { get; set; }
    public int To { get; set; }
    public int? Weight { get; set; }
    public bool Directed { get; set; }
    public bool Highlighted { get; set; }
    public bool InMST { get; set; }
}