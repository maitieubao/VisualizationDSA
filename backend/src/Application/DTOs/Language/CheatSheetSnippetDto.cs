namespace VisualizationDSA.Application.DTOs.Language
{
    public class CheatSheetSnippetDto
    {
        public string Language { get; set; } = string.Empty;
        public string DataStructure { get; set; } = string.Empty;
        public string CodeSnippet { get; set; } = string.Empty;
        public string? Explanation { get; set; }
    }
}
