using System;
using System.Collections.Generic;
using MediatR;
using VisualizationDSA.Application.DTOs;

namespace VisualizationDSA.Application.Features.Classrooms.Queries.GetStudentClassrooms
{
    public class GetStudentClassroomsQuery : IRequest<IEnumerable<ClassroomResponseDto>>
    {
        public Guid StudentId { get; set; }
    }
}
