using MediatR;
using System.Collections.Generic;

namespace VisualizationDSA.Application.Features.Classrooms.Commands.ReorderClassroomModuleItems
{
    public class ReorderClassroomModuleItemsCommand : IRequest
    {
        public Guid ModuleId { get; set; }
        public Guid TeacherId { get; set; }
        public List<ItemOrderDto> ItemOrders { get; set; } = new();
    }

    public class ItemOrderDto
    {
        public Guid ItemId { get; set; }
        public int OrderIndex { get; set; }
    }
}