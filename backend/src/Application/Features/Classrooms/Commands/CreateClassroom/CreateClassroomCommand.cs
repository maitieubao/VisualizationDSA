using System;
using MediatR;
using VisualizationDSA.Application.DTOs;

namespace VisualizationDSA.Application.Features.Classrooms.Commands.CreateClassroom
{
    public class CreateClassroomCommand : IRequest<ClassroomResponseDto>
    {
        public Guid TeacherId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }
}
