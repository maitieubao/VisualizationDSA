using System;
using MediatR;

namespace VisualizationDSA.Application.Features.Classrooms.Commands.DeleteClassroomModule
{
    public class DeleteClassroomModuleCommand : IRequest
    {
        public Guid TeacherId { get; set; }
        public Guid ClassroomId { get; set; }
        public Guid ModuleId { get; set; }
    }
}
