using MediatR;
using System;
using VisualizationDSA.Domain.Enums;

namespace VisualizationDSA.Application.Features.Courses.Commands.AddModuleItem
{
    public record AddModuleItemCommand(
        Guid ModuleId,
        ModuleItemType ItemType,
        Guid? LessonId,
        Guid? QuizId,
        Guid? CodelabId,
        string OverrideTitle,
        int OrderIndex,
        bool IsRequired) : IRequest<Guid>;
}