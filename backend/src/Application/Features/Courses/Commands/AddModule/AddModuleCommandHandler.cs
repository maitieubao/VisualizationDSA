using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Application.Interfaces;

namespace VisualizationDSA.Application.Features.Courses.Commands.AddModule
{
    public class AddModuleCommandHandler : IRequestHandler<AddModuleCommand, Guid>
    {
        private readonly IApplicationDbContext _context;

        public AddModuleCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Guid> Handle(AddModuleCommand request, CancellationToken cancellationToken)
        {
            var course = await _context.Courses
                .Include(c => c.Modules)
                .FirstOrDefaultAsync(c => c.Id == request.CourseId, cancellationToken);

            if (course == null) throw new Exception("Course not found");

            var module = new CourseModule(request.CourseId, request.Title, request.Description, request.OrderIndex);
            course.Modules.Add(module);

            await _context.SaveChangesAsync(cancellationToken);

            return module.Id;
        }
    }
}