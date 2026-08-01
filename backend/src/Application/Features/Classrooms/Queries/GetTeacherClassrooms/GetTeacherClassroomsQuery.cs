using System;
using System.Collections.Generic;
using MediatR;
using VisualizationDSA.Application.DTOs;

namespace VisualizationDSA.Application.Features.Classrooms.Queries.GetTeacherClassrooms
{
    public class GetTeacherClassroomsQuery : IRequest<IEnumerable<ClassroomResponseDto>>
    {
        public Guid TeacherId { get; set; }
    }
}
