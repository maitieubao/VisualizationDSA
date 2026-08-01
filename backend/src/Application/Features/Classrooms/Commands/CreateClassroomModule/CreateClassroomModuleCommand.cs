using MediatR;
using System;

namespace VisualizationDSA.Application.Features.Classrooms.Commands.CreateClassroomModule
{
    public class CreateClassroomModuleCommand : IRequest<Guid>
    {
        public Guid ClassroomId { get; set; }
        public Guid TeacherId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int OrderIndex { get; set; }
        public DateTime? UnlockAt { get; set; }
    }
}