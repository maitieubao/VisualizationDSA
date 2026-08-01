using System;
using MediatR;

namespace VisualizationDSA.Application.Features.Classrooms.Commands.ArchiveClassroom
{
    public class ArchiveClassroomCommand : IRequest<Unit>
    {
        public Guid TeacherId { get; set; }
        public Guid ClassroomId { get; set; }
    }
}
