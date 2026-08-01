using System.IO;
using System.Threading.Tasks;

namespace VisualizationDSA.Application.Common.Interfaces
{
    public interface IUploadService
    {
        Task<string?> UploadImageAsync(Stream fileStream, string fileName);
        Task<string?> UploadVideoAsync(Stream fileStream, string fileName);
        Task<string?> UploadDocumentAsync(Stream fileStream, string fileName);
    }
}
