using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Application.Interfaces;
using VisualizationDSA.Domain.Entities;

namespace VisualizationDSA.Application.Features.Codelabs.Commands
{
    public class AddHintCommand : IRequest<Guid>
    {
        public Guid CodelabId { get; set; }
        public string Content { get; set; } = string.Empty;
        public bool IsTiered { get; set; }
        public int XpCost { get; set; }
        public int OrderIndex { get; set; }
    }

    public class UpdateHintCommand : IRequest
    {
        // SEC-2026-08-14: CodelabId bắt buộc — chống IDOR cross-codelab.
        public Guid CodelabId { get; set; }
        public Guid HintId { get; set; }
        public string Content { get; set; } = string.Empty;
        public bool IsTiered { get; set; }
        public int XpCost { get; set; }
        public int OrderIndex { get; set; }
    }

    public class DeleteHintCommand : IRequest
    {
        public Guid CodelabId { get; set; }
        public Guid HintId { get; set; }
    }

    public class AddHintCommandHandler : IRequestHandler<AddHintCommand, Guid>
    {
        private readonly IApplicationDbContext _context;

        public AddHintCommandHandler(IApplicationDbContext context) => _context = context;

        public async Task<Guid> Handle(AddHintCommand request, CancellationToken cancellationToken)
        {
            var codelab = await _context.Codelabs
                .FirstOrDefaultAsync(c => c.Id == request.CodelabId, cancellationToken)
                ?? throw new ArgumentException("Codelab not found.");

            var hint = new CodelabHint(codelab.Id, request.Content, request.IsTiered, request.XpCost, request.OrderIndex);
            _context.CodelabHints.Add(hint);
            await _context.SaveChangesAsync(cancellationToken);
            return hint.Id;
        }
    }

    public class UpdateHintCommandHandler : IRequestHandler<UpdateHintCommand>
    {
        private readonly IApplicationDbContext _context;

        public UpdateHintCommandHandler(IApplicationDbContext context) => _context = context;

        public async Task Handle(UpdateHintCommand request, CancellationToken cancellationToken)
        {
            var hint = await _context.CodelabHints
                .FirstOrDefaultAsync(h => h.Id == request.HintId && h.CodelabId == request.CodelabId, cancellationToken)
                ?? throw new ArgumentException("Hint not found.");

            hint.Update(request.Content, request.IsTiered, request.XpCost, request.OrderIndex);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }

    public class DeleteHintCommandHandler : IRequestHandler<DeleteHintCommand>
    {
        private readonly IApplicationDbContext _context;

        public DeleteHintCommandHandler(IApplicationDbContext context) => _context = context;

        public async Task Handle(DeleteHintCommand request, CancellationToken cancellationToken)
        {
            var hint = await _context.CodelabHints
                .FirstOrDefaultAsync(h => h.Id == request.HintId && h.CodelabId == request.CodelabId, cancellationToken)
                ?? throw new ArgumentException("Hint not found.");

            _context.CodelabHints.Remove(hint);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
