using MediatR;
using System;

namespace VisualizationDSA.Application.Features.Courses.Commands.AddModule
{
    public record AddModuleCommand(
        Guid CourseId,
        string Title,
        string Description,
        int OrderIndex) : IRequest<Guid>;
}