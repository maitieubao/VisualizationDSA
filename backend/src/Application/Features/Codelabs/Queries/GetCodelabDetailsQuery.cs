using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Application.Interfaces;

namespace VisualizationDSA.Application.Features.Codelabs.Queries
{
    public class GetCodelabDetailsQuery : IRequest<CodelabDto>
    {
        public Guid CodelabId { get; set; }
    }

    public class CodelabExampleDto
    {
        public string Input { get; set; } = string.Empty;
        public string ExpectedOutput { get; set; } = string.Empty;
    }

    public class CodelabHintItemDto
    {
        public string Content { get; set; } = string.Empty;
        public int XpCost { get; set; }
    }

    public class CodelabDto
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
        public string Tags { get; set; } = string.Empty;
        public List<CodelabExampleDto>? Examples { get; set; }
        public List<CodelabHintItemDto> Hints { get; set; } = new();
        public List<CodelabTemplateDto> Templates { get; set; } = new();
    }

    public class GetCodelabDetailsQueryHandler : IRequestHandler<GetCodelabDetailsQuery, CodelabDto>
    {
        private readonly IApplicationDbContext _context;

        public GetCodelabDetailsQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<CodelabDto> Handle(GetCodelabDetailsQuery request, CancellationToken cancellationToken)
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

            return new CodelabDto
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
                Tags = codelab.Tags,
                Examples = TryParseExamples(codelab.Examples),
                Hints = codelab.Hints
                    .OrderBy(h => h.OrderIndex)
                    .Select(h => new CodelabHintItemDto
                    {
                        // Hint trả phí KHÔNG được trả Content qua GET — phải đi qua reveal-hint (trừ XP).
                        Content = h.XpCost > 0 ? string.Empty : h.Content,
                        XpCost = h.XpCost
                    })
                    .ToList(),
                Templates = codelab.Templates
                    .Select(t => new CodelabTemplateDto
                    {
                        Id = t.Id,
                        Language = t.Language,
                        StarterCode = t.BoilerplateCode
                    })
                    .ToList()
            };
        }

        private static List<CodelabExampleDto>? TryParseExamples(string raw)
        {
            if (string.IsNullOrWhiteSpace(raw)) return null;

            try
            {
                var parsed = JsonSerializer.Deserialize<List<CodelabExampleDto>>(raw);
                return parsed;
            }
            catch (JsonException)
            {
                return null;
            }
        }
    }
}
