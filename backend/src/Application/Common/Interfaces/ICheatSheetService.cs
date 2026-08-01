using System.Threading.Tasks;
using VisualizationDSA.Application.DTOs.Language;

namespace VisualizationDSA.Application.Common.Interfaces
{
    public interface ICheatSheetService
    {
        Task<CheatSheetSnippetDto?> GetSnippetAsync(string language, string dataStructure);
    }
}
