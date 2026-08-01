using System.Threading.Tasks;
using VisualizationDSA.Application.DTOs.Sandbox;

namespace VisualizationDSA.Application.Common.Interfaces
{
    public interface ISandboxService
    {
        Task<SandboxResult> ExecuteAsync(string sourceCode, string language);
    }
}
