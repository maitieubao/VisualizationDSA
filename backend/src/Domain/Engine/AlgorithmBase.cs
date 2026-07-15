namespace VisualizationDSA.Domain.Engine;

/// <summary>
/// Lớp cơ sở cho tất cả các thuật toán. Cung cấp cơ chế State Recorder
/// để ghi nhận snapshot mảng tại mỗi bước thực thi.
/// </summary>
public abstract class AlgorithmBase
{
    protected List<FrameDTO> _frames = new();
    private int _stepCounter;

    protected void InitializeRecorder()
    {
        _frames.Clear();
        _stepCounter = 0;
    }

    /// <summary>
    /// Chụp ảnh nhanh trạng thái mảng và lưu lại vào danh sách.
    /// CRITICAL: Bắt buộc dùng .Clone() để tạo vùng nhớ mảng hoàn toàn mới.
    /// </summary>
    protected void CaptureState(
        int[] currentData,
        int activeLine,
        string explanation,
        List<int>? compares = null,
        List<int>? swaps = null,
        List<int>? sorted = null)
    {
        _frames.Add(new FrameDTO
        {
            StepId = ++_stepCounter,
            ActiveLine = activeLine,
            Explanation = explanation,
            DataState = (int[])currentData.Clone(),
            Highlights = new HighlightIndices
            {
                Compare = compares ?? new List<int>(),
                Swap = swaps ?? new List<int>(),
                Sorted = sorted ?? new List<int>()
            }
        });
    }
}
