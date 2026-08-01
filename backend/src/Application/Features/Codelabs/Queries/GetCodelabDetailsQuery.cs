using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Application.Interfaces;
using VisualizationDSA.Application.DTOs;
using VisualizationDSA.Domain.Entities;
using System.Linq;

namespace VisualizationDSA.Application.Features.Codelabs.Queries
{
    public class GetCodelabDetailsQuery : IRequest<CodelabDto>
    {
        public Guid CodelabId { get; set; }
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
                AllowedLanguages = codelab.AllowedLanguages
            };
        }
    }
}
