using System;
using MediatR;

namespace VisualizationDSA.Application.Features.Classrooms.Commands.RegenerateInviteCode
{
    public class RegenerateInviteCodeCommand : IRequest<string>
    {
        public Guid TeacherId { get; set; }
        public Guid ClassroomId { get; set; }
    }
}
