using System;
using System.Threading.Tasks;

namespace VisualizationDSA.Application.Services
{
    public interface IClassroomExcelExportService
    {
        Task<byte[]> ExportClassReportAsync(Guid classroomId, Guid teacherId);
    }
}
