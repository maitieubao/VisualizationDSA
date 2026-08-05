using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Application.Interfaces;

namespace VisualizationDSA.Application.Features.Codelabs.Commands
{
    public class RevealHintCommand : IRequest<RevealHintResult>
    {
        public Guid UserId { get; set; }
        public Guid CodelabId { get; set; }
        public int HintIndex { get; set; }
    }

    public class RevealHintResult
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public int XpCost { get; set; }
        public int RemainingXp { get; set; }
        public string? Content { get; set; }
    }

    public class RevealHintCommandHandler : IRequestHandler<RevealHintCommand, RevealHintResult>
    {
        private readonly IApplicationDbContext _context;

        public RevealHintCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<RevealHintResult> Handle(RevealHintCommand request, CancellationToken cancellationToken)
        {
            var codelab = await _context.Codelabs
                .AsNoTracking()
                .Include(c => c.Hints)
                .FirstOrDefaultAsync(c => c.Id == request.CodelabId, cancellationToken);

            if (codelab == null)
            {
                return new RevealHintResult { Success = false, Message = "Codelab not found." };
            }

            var hints = codelab.Hints.OrderBy(h => h.OrderIndex).ToList();
            if (request.HintIndex < 0 || request.HintIndex >= hints.Count)
            {
                return new RevealHintResult { Success = false, Message = "Hint not found." };
            }

            var hint = hints[request.HintIndex];
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);
            if (user == null)
            {
                return new RevealHintResult { Success = false, Message = "User not found." };
            }

            // Idempotency: hint đã mở trước đó thì trả lại Content MIỄN PHÍ (không trừ XP lần 2).
            var alreadyRevealed = await _context.Set<VisualizationDSA.Domain.Entities.CodelabHintReveal>()
                .AnyAsync(r => r.UserId == request.UserId && r.CodelabHintId == hint.Id, cancellationToken);

            if (!alreadyRevealed && hint.XpCost > 0 && !user.DeductXP(hint.XpCost))
            {
                return new RevealHintResult
                {
                    Success = false,
                    Message = $"Không đủ XP để mở gợi ý (cần {hint.XpCost} XP, hiện có {user.TotalXP} XP).",
                    XpCost = hint.XpCost,
                    RemainingXp = user.TotalXP
                };
            }

            if (!alreadyRevealed)
            {
                _context.Set<VisualizationDSA.Domain.Entities.CodelabHintReveal>().Add(
                    new VisualizationDSA.Domain.Entities.CodelabHintReveal(request.UserId, hint.Id)
                );
            }

            await _context.SaveChangesAsync(cancellationToken);

            return new RevealHintResult
            {
                Success = true,
                Message = "Hint revealed.",
                XpCost = hint.XpCost,
                RemainingXp = user.TotalXP,
                Content = hint.Content
            };
        }
    }
}
