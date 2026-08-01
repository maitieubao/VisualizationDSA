namespace VisualizationDSA.Domain.Engine;




public class AlgorithmResult
{
    public string AlgorithmId { get; set; } = string.Empty;
    public List<string> PseudoCode { get; set; } = new();
    public List<FrameDTO> Frames { get; set; } = new();
}
