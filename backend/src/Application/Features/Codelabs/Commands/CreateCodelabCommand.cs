using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using VisualizationDSA.Application.Interfaces;
using VisualizationDSA.Domain.Entities;

namespace VisualizationDSA.Application.Features.Codelabs.Commands
{
    public class CreateCodelabCommand : IRequest<Guid>
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string InitialCode { get; set; } = string.Empty;
        public int Difficulty { get; set; } = 1;
        public int XPReward { get; set; } = 50;
        public int MaxRuntimeMs { get; set; } = 2000;
        public int MaxMemoryBytes { get; set; } = 128000000;
        public string AllowedLanguages { get; set; } = "csharp,python,java,javascript";
        public string Constraints { get; set; } = string.Empty;
        public string Examples { get; set; } = string.Empty;
        public string Tags { get; set; } = string.Empty;
        public List<CreateCodelabTestCaseItem> TestCases { get; set; } = new();
        public List<CreateCodelabTemplateItem> Templates { get; set; } = new();
        public List<CreateCodelabHintItem> Hints { get; set; } = new();
    }

    public class CreateCodelabTestCaseItem
    {
        public string Input { get; set; } = string.Empty;
        public string ExpectedOutput { get; set; } = string.Empty;
        public bool IsHidden { get; set; }
        public int ScoreWeight { get; set; } = 1;
        public int OrderIndex { get; set; }
    }

    public class CreateCodelabTemplateItem
    {
        public string Language { get; set; } = string.Empty;
        public string StarterCode { get; set; } = string.Empty;
    }

    public class CreateCodelabHintItem
    {
        public string Content { get; set; } = string.Empty;
        public bool IsTiered { get; set; }
        public int XpCost { get; set; }
        public int OrderIndex { get; set; }
    }

    public class CreateCodelabCommandValidator : AbstractValidator<CreateCodelabCommand>
    {
        public CreateCodelabCommandValidator()
        {
            RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
            RuleFor(x => x.Description).NotEmpty();
            RuleFor(x => x.Difficulty).InclusiveBetween(1, 5);
            RuleFor(x => x.XPReward).GreaterThanOrEqualTo(0);
            RuleFor(x => x.MaxRuntimeMs).GreaterThan(0);
            RuleFor(x => x.MaxMemoryBytes).GreaterThan(0);
            RuleFor(x => x.AllowedLanguages).NotEmpty();
        }
    }

    public class CreateCodelabCommandHandler : IRequestHandler<CreateCodelabCommand, Guid>
    {
        private readonly IApplicationDbContext _context;

        public CreateCodelabCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Guid> Handle(CreateCodelabCommand request, CancellationToken cancellationToken)
        {
            var codelab = new Codelab(
                title: request.Title,
                description: request.Description,
                initialCode: request.InitialCode,
                difficulty: request.Difficulty,
                xpReward: request.XPReward,
                maxRuntimeMs: request.MaxRuntimeMs,
                maxMemoryBytes: request.MaxMemoryBytes,
                allowedLanguages: request.AllowedLanguages,
                constraints: request.Constraints,
                examples: request.Examples,
                tags: request.Tags);

            _context.Codelabs.Add(codelab);

            foreach (var tc in request.TestCases.OrderBy(t => t.OrderIndex))
            {
                codelab.TestCases.Add(new CodelabTestCase(
                    codelab.Id, tc.Input, tc.ExpectedOutput, tc.IsHidden, tc.ScoreWeight, tc.OrderIndex));
            }

            foreach (var tmpl in request.Templates)
            {
                codelab.Templates.Add(new CodelabTemplate(codelab.Id, tmpl.Language, tmpl.StarterCode));
            }

            foreach (var hint in request.Hints.OrderBy(h => h.OrderIndex))
            {
                codelab.Hints.Add(new CodelabHint(codelab.Id, hint.Content, hint.IsTiered, hint.XpCost, hint.OrderIndex));
            }

            await _context.SaveChangesAsync(cancellationToken);
            return codelab.Id;
        }
    }
}
