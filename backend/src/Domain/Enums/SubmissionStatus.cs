namespace VisualizationDSA.Domain.Enums
{
    public enum SubmissionStatus
    {
        Pending = 0,
        Accepted = 1,        
        WrongAnswer = 2,     
        TimeLimitExceeded = 3, 
        MemoryLimitExceeded = 4, 
        CompilationError = 5,  
        RuntimeError = 6       
    }
}
