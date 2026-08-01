namespace VisualizationDSA.Domain.Engine;





public class TreeNodeDTO
{
    public int Id { get; set; }
    public int Value { get; set; }
    public int? LeftNodeId { get; set; }
    public int? RightNodeId { get; set; }
}
