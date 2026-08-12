using MediatR;
using System;

namespace VisualizationDSA.Application.Features.Classrooms.Commands.DeleteClassroomModuleItem
{
    // LS-002: xóa một ClassroomModuleItem (soft-delete + cascade progress/override).
    public class DeleteClassroomModuleItemCommand : IRequest
    {
        public Guid ModuleId { get; set; }
        public Guid ItemId { get; set; }
        public Guid TeacherId { get; set; }
    }
}
