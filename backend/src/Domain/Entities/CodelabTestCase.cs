using System;

namespace VisualizationDSA.Domain.Entities
{
    public class CodelabTestCase
    {
        public Guid Id { get; private set; }
        public Guid CodelabId { get; private set; }
        public string Input { get; private set; } = string.Empty;       
        public string ExpectedOutput { get; private set; } = string.Empty;
        public bool IsHidden { get; private set; }       
        public int ScoreWeight { get; private set; }     
        public int OrderIndex { get; private set; }

        
        public virtual Codelab Codelab { get; private set; } = null!;

        private CodelabTestCase() { } 

        public CodelabTestCase(Guid codelabId, string input, string expectedOutput, bool isHidden, int scoreWeight, int orderIndex)
        {
            Id = Guid.NewGuid();
            CodelabId = codelabId;
            Input = input;
            ExpectedOutput = expectedOutput;
            IsHidden = isHidden;
            ScoreWeight = scoreWeight;
            OrderIndex = orderIndex;
        }

        public void Update(string input, string expectedOutput, bool isHidden, int scoreWeight, int orderIndex)
        {
            Input = input;
            ExpectedOutput = expectedOutput;
            IsHidden = isHidden;
            ScoreWeight = scoreWeight;
            OrderIndex = orderIndex;
        }
    }
}
