using System.Threading;

namespace VisualizationDSA.Domain.Strategies;







public interface IConceptStrategy
{
    
    string ConceptId { get; }

    
    string Name { get; }

    
    string Category { get; }

    
    List<string> SupportedScenarios { get; }
}
