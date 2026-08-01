using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;
using VisualizationDSA.Application.Interfaces;
using VisualizationDSA.Domain.Entities;

namespace VisualizationDSA.Application.Features.Classrooms.Commands
{
    public class UpdateClassroomModuleItemOverrideCommand : IRequest<bool>
    {
        public Guid ClassroomId { get; set; }
        public Guid ModuleItemId { get; set; }
        public Guid UserId { get; set; } 
        public DateTime? OpenAt { get; set; }
        public DateTime? DueAt { get; set; }
        public int? MaxAttempts { get; set; }
        public bool IsHiddenForStudent { get; set; }
    }

    public class UpdateClassroomModuleItemOverrideValidator : AbstractValidator<UpdateClassroomModuleItemOverrideCommand>
    {
        public UpdateClassroomModuleItemOverrideValidator()
        {
            RuleFor(v => v.ClassroomId).NotEmpty();
            RuleFor(v => v.ModuleItemId).NotEmpty();
            RuleFor(v => v.UserId).NotEmpty();
            RuleFor(v => v.DueAt).GreaterThan(v => v.OpenAt).When(v => v.OpenAt.HasValue && v.DueAt.HasValue)
                .WithMessage("DueAt must be after OpenAt");
            RuleFor(v => v.MaxAttempts).GreaterThan(0).When(v => v.MaxAttempts.HasValue)
                .WithMessage("MaxAttempts must be greater than 0");
        }
    }

    public class UpdateClassroomModuleItemOverrideHandler : IRequestHandler<UpdateClassroomModuleItemOverrideCommand, bool>
    {
        private readonly IApplicationDbContext _context;

        public UpdateClassroomModuleItemOverrideHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(UpdateClassroomModuleItemOverrideCommand request, CancellationToken cancellationToken)
        {
            
            var classroom = await _context.Classrooms
                .FirstOrDefaultAsync(c => c.Id == request.ClassroomId, cancellationToken);

            if (classroom == null)
            {
                throw new ArgumentException("Classroom not found");
            }

            if (classroom.OwnerTeacherId != request.UserId)
            {
                throw new UnauthorizedAccessException("Only the owner teacher can update classroom overrides");
            }

            
            var moduleItem = await _context.ModuleItems
                .FirstOrDefaultAsync(m => m.Id == request.ModuleItemId, cancellationToken);

            if (moduleItem == null)
            {
                throw new ArgumentException("ModuleItem not found");
            }

            var itemOverride = await _context.ClassroomModuleItemOverrides
                .FirstOrDefaultAsync(o => o.ClassroomId == request.ClassroomId && o.ModuleItemId == request.ModuleItemId, cancellationToken);

            if (itemOverride == null)
            {
                
                itemOverride = new ClassroomModuleItemOverride(request.ClassroomId, request.ModuleItemId, request.OpenAt, request.DueAt, request.MaxAttempts, request.IsHiddenForStudent);
                _context.ClassroomModuleItemOverrides.Add(itemOverride);
            }
            else
            {
                
                itemOverride.Update(request.OpenAt, request.DueAt, request.MaxAttempts, request.IsHiddenForStudent);
            }

            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}
