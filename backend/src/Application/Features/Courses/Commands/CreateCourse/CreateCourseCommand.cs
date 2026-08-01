using MediatR;
using System;

namespace VisualizationDSA.Application.Features.Courses.Commands.CreateCourse
{
    public record CreateCourseCommand(
        Guid TeacherId,
        string Title,
        string Description,
        string Thumbnail,
        int ExpectedTime,
        string Category,
        string Difficulty,
        bool IsPremium,
        bool IsPublished) : IRequest<Guid>;
}