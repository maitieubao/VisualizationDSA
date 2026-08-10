namespace VisualizationDSA.Domain.Engine;





public abstract class AlgorithmBase
{
    protected List<FrameDTO> _frames = new();
    private int _stepCounter;

    protected void InitializeRecorder()
    {
        _frames.Clear();
        _stepCounter = 0;
    }

    
    
    
    
    protected void CaptureState(
        int[] currentData,
        int activeLine,
        string explanation,
        List<int>? compares = null,
        List<int>? swaps = null,
        List<int>? sorted = null,
        string? activeLogicalLineId = null,
        Dictionary<string, object>? variables = null)
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
            },
            ActiveLogicalLineId = activeLogicalLineId,
            Variables = variables
        });
    }
}
