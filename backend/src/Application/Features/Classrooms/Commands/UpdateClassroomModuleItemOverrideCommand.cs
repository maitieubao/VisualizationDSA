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
        public Guid? PrerequisiteItemId { get; set; }
        public bool IsSequential { get; set; } = true;
        public bool IsRequired { get; set; } = true;
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
                throw new ArgumentException("Classroom not found");

            if (classroom.OwnerTeacherId != request.UserId)
                throw new UnauthorizedAccessException("Only the owner teacher can update classroom overrides");

            // LS-009/LS-024: validate item thuộc classroom TRƯỚC khi ghi override —
            // trước đây chấp nhận ModuleItem của lớp khác (teacher gán override item lớp khác).
            var item = await _context.ClassroomModuleItems
                .Include(i => i.Module)
                .FirstOrDefaultAsync(i => i.Id == request.ModuleItemId && !i.IsDeleted, cancellationToken);

            if (item == null)
                throw new ArgumentException("ModuleItem not found");

            if (item.Module.ClassroomId != request.ClassroomId)
                throw new UnauthorizedAccessException("ModuleItem does not belong to this classroom");

            var itemOverride = await _context.ClassroomModuleItemOverrides
                .FirstOrDefaultAsync(o => o.ClassroomId == request.ClassroomId && o.ModuleItemId == request.ModuleItemId, cancellationToken);

            if (itemOverride == null)
            {
                itemOverride = new ClassroomModuleItemOverride(
                    request.ClassroomId,
                    request.ModuleItemId,
                    request.OpenAt,
                    request.DueAt,
                    request.MaxAttempts,
                    request.IsHiddenForStudent,
                    request.PrerequisiteItemId,
                    request.IsSequential,
                    request.IsRequired);
                _context.ClassroomModuleItemOverrides.Add(itemOverride);
            }
            else
            {
                itemOverride.Update(
                    request.OpenAt,
                    request.DueAt,
                    request.MaxAttempts,
                    request.IsHiddenForStudent,
                    request.PrerequisiteItemId,
                    request.IsSequential,
                    request.IsRequired);
            }

            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}
