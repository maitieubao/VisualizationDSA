namespace VisualizationDSA.Domain.Engine;

/// <summary>
/// Kết quả trả về sau khi chạy thuật toán, bao gồm danh sách frames và mã giả.
/// </summary>
public class AlgorithmResult
{
    public string AlgorithmId { get; set; } = string.Empty;
    public List<string> PseudoCode { get; set; } = new();
    public List<FrameDTO> Frames { get; set; } = new();
}
