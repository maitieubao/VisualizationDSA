using System;

namespace VisualizationDSA.Domain.Entities
{
    public class CodelabTemplate
    {
        public Guid Id { get; private set; }
        public Guid CodelabId { get; private set; }
        public string Language { get; private set; } = string.Empty;     
        public string BoilerplateCode { get; private set; } = string.Empty;

        
        public virtual Codelab Codelab { get; private set; } = null!;

        private CodelabTemplate() { } 

        public CodelabTemplate(Guid codelabId, string language, string boilerplateCode)
        {
            Id = Guid.NewGuid();
            CodelabId = codelabId;
            Language = language;
            BoilerplateCode = boilerplateCode;
        }

        public void Update(string language, string boilerplateCode)
        {
            Language = language;
            BoilerplateCode = boilerplateCode;
        }
    }
}
