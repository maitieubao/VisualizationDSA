using System;
using System.Collections.Generic;
using MediatR;

namespace VisualizationDSA.Application.Features.Classrooms.Commands.ImportCourseToClassroom
{
    public record ImportCourseToClassroomCommand : IRequest<Guid>
    {
        public Guid TeacherId { get; init; }
        public Guid ClassroomId { get; init; }
        public Guid CourseId { get; init; }
        public bool IncludeAllModules { get; init; } = true;
        public List<Guid>? SelectedModuleIds { get; init; }
        public bool OverrideExisting { get; init; } = false;
    }
}