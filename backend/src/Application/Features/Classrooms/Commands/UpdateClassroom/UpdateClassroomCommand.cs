using System;
using MediatR;

namespace VisualizationDSA.Application.Features.Classrooms.Commands.UpdateClassroom
{
    public class UpdateClassroomCommand : IRequest<Unit>
    {
        public Guid TeacherId { get; set; }
        public Guid ClassroomId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }
}
