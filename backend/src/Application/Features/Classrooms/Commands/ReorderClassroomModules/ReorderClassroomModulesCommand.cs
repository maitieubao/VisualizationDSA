using MediatR;
using System.Collections.Generic;

namespace VisualizationDSA.Application.Features.Classrooms.Commands.ReorderClassroomModules
{
    public class ReorderClassroomModulesCommand : IRequest
    {
        public Guid ClassroomId { get; set; }
        public Guid TeacherId { get; set; }
        public List<ModuleOrderDto> ModuleOrders { get; set; } = new();
    }

    public class ModuleOrderDto
    {
        public Guid ModuleId { get; set; }
        public int OrderIndex { get; set; }
    }
}