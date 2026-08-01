using System;
using MediatR;
using VisualizationDSA.Application.DTOs;

namespace VisualizationDSA.Application.Features.Classrooms.Commands.JoinClassroom
{
    public class JoinClassroomCommand : IRequest<ClassroomResponseDto>
    {
        public Guid StudentId { get; set; }
        public string InviteCode { get; set; } = string.Empty;
    }
}
