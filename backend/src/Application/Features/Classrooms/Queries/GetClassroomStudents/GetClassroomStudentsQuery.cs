using System;
using System.Collections.Generic;
using MediatR;
using VisualizationDSA.Application.DTOs;

namespace VisualizationDSA.Application.Features.Classrooms.Queries.GetClassroomStudents
{
    public class GetClassroomStudentsQuery : IRequest<IEnumerable<UserDto>>
    {
        public Guid ClassroomId { get; set; }
        public Guid TeacherId { get; set; }
    }
}
