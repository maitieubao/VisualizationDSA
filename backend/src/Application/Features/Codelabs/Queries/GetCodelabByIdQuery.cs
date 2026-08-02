using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Application.Interfaces;

namespace VisualizationDSA.Application.Features.Codelabs.Queries
{
    public class GetCodelabByIdQuery : IRequest<CodelabFullDetailDto>
    {
        public Guid CodelabId { get; set; }
    }

    public class CodelabTestCaseDto
    {
        public Guid Id { get; set; }
        public string Input { get; set; } = string.Empty;
        public string ExpectedOutput { get; set; } = string.Empty;
        public bool IsHidden { get; set; }
        public int ScoreWeight { get; set; }
        public int OrderIndex { get; set; }
    }

    public class CodelabTemplateDto
    {
        public Guid Id { get; set; }
        public string Language { get; set; } = string.Empty;
        public string StarterCode { get; set; } = string.Empty;
    }

    public class CodelabHintDto
    {
        public Guid Id { get; set; }
        public string Content { get; set; } = string.Empty;
        public bool IsTiered { get; set; }
        public int XpCost { get; set; }
        public int OrderIndex { get; set; }
    }

    public class CodelabFullDetailDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string InitialCode { get; set; } = string.Empty;
        public int Difficulty { get; set; }
        public int XPReward { get; set; }
        public int MaxRuntimeMs { get; set; }
        public int MaxMemoryBytes { get; set; }
        public string AllowedLanguages { get; set; } = string.Empty;
        public string Constraints { get; set; } = string.Empty;
        public string Examples { get; set; } = string.Empty;
        public string Tags { get; set; } = string.Empty;
        public List<CodelabTestCaseDto> TestCases { get; set; } = new();
        public List<CodelabTemplateDto> Templates { get; set; } = new();
        public List<CodelabHintDto> Hints { get; set; } = new();
    }

    public class GetCodelabByIdQueryHandler : IRequestHandler<GetCodelabByIdQuery, CodelabFullDetailDto>
    {
        private readonly IApplicationDbContext _context;

        public GetCodelabByIdQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<CodelabFullDetailDto> Handle(GetCodelabByIdQuery request, CancellationToken cancellationToken)
        {
            var codelab = await _context.Codelabs
                .AsNoTracking()
                .Include(c => c.TestCases)
                .Include(c => c.Templates)
                .Include(c => c.Hints)
                .FirstOrDefaultAsync(c => c.Id == request.CodelabId, cancellationToken);

            if (codelab == null)
            {
                throw new ArgumentException("Codelab not found.");
            }

            return new CodelabFullDetailDto
            {
                Id = codelab.Id,
                Title = codelab.Title,
                Description = codelab.Description,
                InitialCode = codelab.InitialCode,
                Difficulty = codelab.Difficulty,
                XPReward = codelab.XPReward,
                MaxRuntimeMs = codelab.MaxRuntimeMs,
                MaxMemoryBytes = codelab.MaxMemoryBytes,
                AllowedLanguages = codelab.AllowedLanguages,
                Constraints = codelab.Constraints,
                Examples = codelab.Examples,
                Tags = codelab.Tags,
                TestCases = codelab.TestCases
                    .OrderBy(tc => tc.OrderIndex)
                    .Select(tc => new CodelabTestCaseDto
                    {
                        Id = tc.Id,
                        Input = tc.Input,
                        ExpectedOutput = tc.ExpectedOutput,
                        IsHidden = tc.IsHidden,
                        ScoreWeight = tc.ScoreWeight,
                        OrderIndex = tc.OrderIndex
                    })
                    .ToList(),
                Templates = codelab.Templates
                    .Select(t => new CodelabTemplateDto
                    {
                        Id = t.Id,
                        Language = t.Language,
                        StarterCode = t.BoilerplateCode
                    })
                    .ToList(),
                Hints = codelab.Hints
                    .OrderBy(h => h.OrderIndex)
                    .Select(h => new CodelabHintDto
                    {
                        Id = h.Id,
                        Content = h.Content,
                        IsTiered = h.IsTiered,
                        XpCost = h.XpCost,
                        OrderIndex = h.OrderIndex
                    })
                    .ToList()
            };
        }
    }
}
