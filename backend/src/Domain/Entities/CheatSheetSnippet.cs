using System;
using System.ComponentModel.DataAnnotations;

namespace VisualizationDSA.Domain.Entities
{
    public class CheatSheetSnippet
    {
        [Key]
        public Guid Id { get; private set; }

        [Required]
        [MaxLength(20)]
        public string Language { get; private set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string DataStructure { get; private set; } = string.Empty;

        [Required]
        public string CodeSnippet { get; private set; } = string.Empty;

        public string? Explanation { get; private set; }

        private CheatSheetSnippet() { }

        public CheatSheetSnippet(string language, string dataStructure, string codeSnippet, string? explanation = null)
        {
            Id = Guid.NewGuid();
            Language = language;
            DataStructure = dataStructure;
            CodeSnippet = codeSnippet;
            Explanation = explanation;
        }

        public void Update(string codeSnippet, string? explanation)
        {
            CodeSnippet = codeSnippet;
            Explanation = explanation;
        }
    }
}
