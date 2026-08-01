using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Enums;
using VisualizationDSA.Application.Interfaces;

namespace VisualizationDSA.Application.Features.Courses.Commands.CreateCourse
{
    public class CreateCourseCommandHandler : IRequestHandler<CreateCourseCommand, Guid>
    {
        private readonly IApplicationDbContext _context;

        public CreateCourseCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Guid> Handle(CreateCourseCommand request, CancellationToken cancellationToken)
        {
            var course = new Course(
                request.TeacherId,
                request.Title,
                request.Description,
                Enum.Parse<CourseCategory>(request.Category),
                Enum.Parse<CourseDifficulty>(request.Difficulty),
                request.IsPremium,
                request.Thumbnail
            );

            if (request.IsPublished) course.Publish();

            _context.Courses.Add(course);
            await _context.SaveChangesAsync(cancellationToken);

            return course.Id;
        }
    }
}