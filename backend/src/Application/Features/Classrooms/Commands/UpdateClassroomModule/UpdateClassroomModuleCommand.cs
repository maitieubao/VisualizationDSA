using MediatR;
using System;

namespace VisualizationDSA.Application.Features.Classrooms.Commands.UpdateClassroomModule
{
    public class UpdateClassroomModuleCommand : IRequest
    {
        public Guid ModuleId { get; set; }
        public Guid TeacherId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int OrderIndex { get; set; }
        public bool IsHidden { get; set; }
        public DateTime? UnlockAt { get; set; }
    }
}