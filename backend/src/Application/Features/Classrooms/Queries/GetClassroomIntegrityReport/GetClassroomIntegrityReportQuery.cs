using System;
using System.Collections.Generic;
using MediatR;

namespace VisualizationDSA.Application.Features.Classrooms.Queries.GetClassroomIntegrityReport
{
    public class GetClassroomIntegrityReportQuery : IRequest<ClassroomIntegrityReportDto>
    {
        public Guid ClassroomId { get; set; }
        public Guid TeacherId { get; set; }
    }

    public class ModuleIntegrityIssueDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public int OrderIndex { get; set; }
        public string Issue { get; set; } = string.Empty;
    }

    public class ModuleItemIntegrityIssueDto
    {
        public Guid Id { get; set; }
        public Guid ModuleId { get; set; }
        public string Title { get; set; } = string.Empty;
        public int OrderIndex { get; set; }
        public string Issue { get; set; } = string.Empty;
    }

    public class ClassroomIntegrityReportDto
    {
        public Guid ClassroomId { get; set; }
        public string ClassroomName { get; set; } = string.Empty;
        public List<ModuleIntegrityIssueDto> ModuleIssues { get; set; } = new();
        public List<ModuleItemIntegrityIssueDto> ItemIssues { get; set; } = new();
        public bool IsValid { get; set; }
    }
}
