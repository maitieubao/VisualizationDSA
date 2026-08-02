using System;

namespace VisualizationDSA.Domain.Entities
{
    public class CodelabHint
    {
        public Guid Id { get; private set; }
        public Guid CodelabId { get; private set; }
        public string Content { get; private set; } = string.Empty;
        public bool IsTiered { get; private set; }
        public int XpCost { get; private set; }
        public int OrderIndex { get; private set; }

        public virtual Codelab Codelab { get; private set; } = null!;

        private CodelabHint() { }

        public CodelabHint(Guid codelabId, string content, bool isTiered, int xpCost, int orderIndex)
        {
            Id = Guid.NewGuid();
            CodelabId = codelabId;
            Content = content;
            IsTiered = isTiered;
            XpCost = xpCost;
            OrderIndex = orderIndex;
        }

        public void Update(string content, bool isTiered, int xpCost, int orderIndex)
        {
            Content = content;
            IsTiered = isTiered;
            XpCost = xpCost;
            OrderIndex = orderIndex;
        }
    }
}
