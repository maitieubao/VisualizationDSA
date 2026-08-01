using System.Threading.Tasks;

namespace VisualizationDSA.Application.Common.Interfaces
{
    public interface IAiAssistantService
    {
        Task<string> GenerateContentAsync(string prompt);
    }
}
