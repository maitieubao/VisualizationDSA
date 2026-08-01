using System;
using MediatR;

namespace VisualizationDSA.Application.Features.Classrooms.Commands.KickStudent
{
    public class KickStudentCommand : IRequest<Unit>
    {
        public Guid TeacherId { get; set; }
        public Guid ClassroomId { get; set; }
        public Guid StudentId { get; set; }
    }
}
