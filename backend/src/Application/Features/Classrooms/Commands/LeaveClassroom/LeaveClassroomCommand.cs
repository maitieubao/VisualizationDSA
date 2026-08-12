using System;
using MediatR;

namespace VisualizationDSA.Application.Features.Classrooms.Commands.LeaveClassroom
{
    // CR-026: học viên rời lớp — chỉ đánh dấu enrollment Left, KHÔNG xóa dữ liệu tiến độ.
    public class LeaveClassroomCommand : IRequest<Unit>
    {
        public Guid ClassroomId { get; set; }
        public Guid StudentId { get; set; }
    }
}
