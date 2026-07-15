namespace VisualizationDSA.Domain.Engine;

/// <summary>
/// Siêu dữ liệu lý thuyết của thuật toán: Big-O, mô tả, mã giả.
/// </summary>
public class AlgorithmMetadata
{
    public string TimeComplexity { get; set; } = string.Empty;
    public string SpaceComplexity { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<string> PseudoCode { get; set; } = new();
}
