using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Application.Interfaces;
using VisualizationDSA.Domain.Entities;

namespace VisualizationDSA.Application.Features.Codelabs.Commands
{
    public class UpdateCodelabCommand : IRequest
    {
        public Guid CodelabId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string InitialCode { get; set; } = string.Empty;
        public int Difficulty { get; set; } = 1;
        public int XPReward { get; set; } = 50;
        public int MaxRuntimeMs { get; set; } = 2000;
        public int MaxMemoryBytes { get; set; } = 128000000;
        public string AllowedLanguages { get; set; } = string.Empty;
        public string Constraints { get; set; } = string.Empty;
        public string Examples { get; set; } = string.Empty;
        public string Tags { get; set; } = string.Empty;

        /// <summary>Khi khác null, toàn bộ test case cũ bị thay thế bằng danh sách mới.</summary>
        public List<CreateCodelabTestCaseItem>? TestCases { get; set; }

        /// <summary>Khi khác null, toàn bộ template cũ bị thay thế bằng danh sách mới.</summary>
        public List<CreateCodelabTemplateItem>? Templates { get; set; }

        /// <summary>Khi khác null, toàn bộ hint cũ bị thay thế bằng danh sách mới.</summary>
        public List<CreateCodelabHintItem>? Hints { get; set; }
    }

    public class UpdateCodelabCommandValidator : AbstractValidator<UpdateCodelabCommand>
    {
        public UpdateCodelabCommandValidator()
        {
            RuleFor(x => x.CodelabId).NotEmpty();
            RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
            RuleFor(x => x.Description).NotEmpty();
            RuleFor(x => x.Difficulty).InclusiveBetween(1, 5);
            RuleFor(x => x.XPReward).GreaterThanOrEqualTo(0);
            RuleFor(x => x.MaxRuntimeMs).GreaterThan(0);
            RuleFor(x => x.MaxMemoryBytes).GreaterThan(0);
            RuleFor(x => x.AllowedLanguages).NotEmpty();
        }
    }

    public class UpdateCodelabCommandHandler : IRequestHandler<UpdateCodelabCommand>
    {
        private readonly IApplicationDbContext _context;

        public UpdateCodelabCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task Handle(UpdateCodelabCommand request, CancellationToken cancellationToken)
        {
            var codelab = await _context.Codelabs
                .FirstOrDefaultAsync(c => c.Id == request.CodelabId, cancellationToken);

            if (codelab == null)
            {
                throw new ArgumentException("Codelab not found.");
            }

            codelab.Update(
                request.Title,
                request.Description,
                request.InitialCode,
                request.Difficulty,
                request.XPReward,
                request.MaxRuntimeMs,
                request.MaxMemoryBytes,
                request.AllowedLanguages,
                request.Constraints,
                request.Examples,
                request.Tags);

            if (request.TestCases != null)
            {
                await ReplaceTestCasesAsync(codelab.Id, request.TestCases, cancellationToken);
            }

            if (request.Templates != null)
            {
                await ReplaceTemplatesAsync(codelab.Id, request.Templates, cancellationToken);
            }

            if (request.Hints != null)
            {
                await ReplaceHintsAsync(codelab.Id, request.Hints, cancellationToken);
            }

            await _context.SaveChangesAsync(cancellationToken);
        }

        private async Task ReplaceTestCasesAsync(Guid codelabId, List<CreateCodelabTestCaseItem> items, CancellationToken ct)
        {
            var existing = await _context.CodelabTestCases
                .Where(tc => tc.CodelabId == codelabId)
                .ToListAsync(ct);
            _context.CodelabTestCases.RemoveRange(existing);

            foreach (var tc in items.OrderBy(t => t.OrderIndex))
            {
                _context.CodelabTestCases.Add(new CodelabTestCase(
                    codelabId, tc.Input, tc.ExpectedOutput, tc.IsHidden, tc.ScoreWeight, tc.OrderIndex));
            }
        }

        private async Task ReplaceTemplatesAsync(Guid codelabId, List<CreateCodelabTemplateItem> items, CancellationToken ct)
        {
            var existing = await _context.CodelabTemplates
                .Where(t => t.CodelabId == codelabId)
                .ToListAsync(ct);
            _context.CodelabTemplates.RemoveRange(existing);

            foreach (var tmpl in items)
            {
                _context.CodelabTemplates.Add(new CodelabTemplate(codelabId, tmpl.Language, tmpl.StarterCode));
            }
        }

        private async Task ReplaceHintsAsync(Guid codelabId, List<CreateCodelabHintItem> items, CancellationToken ct)
        {
            var existing = await _context.CodelabHints
                .Where(h => h.CodelabId == codelabId)
                .ToListAsync(ct);
            _context.CodelabHints.RemoveRange(existing);

            foreach (var hint in items.OrderBy(h => h.OrderIndex))
            {
                _context.CodelabHints.Add(new CodelabHint(codelabId, hint.Content, hint.IsTiered, hint.XpCost, hint.OrderIndex));
            }
        }
    }
}
