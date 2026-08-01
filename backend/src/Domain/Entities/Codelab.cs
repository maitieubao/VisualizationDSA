using System;
using System.Collections.Generic;

namespace VisualizationDSA.Domain.Entities
{
    public class Codelab
    {
        public Guid Id { get; private set; }
        public string Title { get; private set; } = string.Empty;
        public string Description { get; private set; } = string.Empty;
        public string InitialCode { get; private set; } = string.Empty;
        public int Difficulty { get; private set; }
        public int XPReward { get; private set; }
        public bool IsDeleted { get; private set; }
        
        public string Constraints { get; private set; } = string.Empty;
        public string Examples { get; private set; } = string.Empty; 
        public string Hints { get; private set; } = string.Empty; 
        public string Tags { get; private set; } = string.Empty;
        
        
        public int MaxRuntimeMs { get; private set; }
        public int MaxMemoryBytes { get; private set; }
        public string AllowedLanguages { get; private set; } = "csharp,python,java,javascript";

        public virtual ICollection<CodelabSubmission> Submissions { get; private set; } = new List<CodelabSubmission>();
        public virtual ICollection<CodelabTestCase> TestCases { get; private set; } = new List<CodelabTestCase>();
        public virtual ICollection<CodelabTemplate> Templates { get; private set; } = new List<CodelabTemplate>();

        private Codelab() { }

        public Codelab(string title, string description, string initialCode, int difficulty, int xpReward, 
            int maxRuntimeMs = 2000, int maxMemoryBytes = 128000000, string allowedLanguages = "csharp,python,java,javascript",
            string constraints = "", string examples = "", string hints = "", string tags = "")
        {
            Id = Guid.NewGuid();
            Title = title;
            Description = description;
            InitialCode = initialCode;
            Difficulty = difficulty;
            XPReward = xpReward;
            MaxRuntimeMs = maxRuntimeMs;
            MaxMemoryBytes = maxMemoryBytes;
            AllowedLanguages = allowedLanguages;
            Constraints = constraints;
            Examples = examples;
            Hints = hints;
            Tags = tags;
            IsDeleted = false;
        }

        public void Update(string title, string description, string initialCode, int difficulty, int xpReward, 
            int maxRuntimeMs, int maxMemoryBytes, string allowedLanguages,
            string constraints, string examples, string hints, string tags)
        {
            Title = title;
            Description = description;
            InitialCode = initialCode;
            Difficulty = difficulty;
            XPReward = xpReward;
            MaxRuntimeMs = maxRuntimeMs;
            MaxMemoryBytes = maxMemoryBytes;
            AllowedLanguages = allowedLanguages;
            Constraints = constraints;
            Examples = examples;
            Hints = hints;
            Tags = tags;
        }

        public void Delete()
        {
            IsDeleted = true;
        }
    }
}
