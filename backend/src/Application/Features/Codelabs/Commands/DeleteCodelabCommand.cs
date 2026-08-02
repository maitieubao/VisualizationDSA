using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Application.Interfaces;

namespace VisualizationDSA.Application.Features.Codelabs.Commands
{
    public class DeleteCodelabCommand : IRequest
    {
        public Guid CodelabId { get; set; }
    }

    public class DeleteCodelabCommandValidator : AbstractValidator<DeleteCodelabCommand>
    {
        public DeleteCodelabCommandValidator()
        {
            RuleFor(x => x.CodelabId).NotEmpty();
        }
    }

    public class DeleteCodelabCommandHandler : IRequestHandler<DeleteCodelabCommand>
    {
        private readonly IApplicationDbContext _context;

        public DeleteCodelabCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task Handle(DeleteCodelabCommand request, CancellationToken cancellationToken)
        {
            var codelab = await _context.Codelabs
                .Include(c => c.TestCases)
                .Include(c => c.Templates)
                .Include(c => c.Hints)
                .FirstOrDefaultAsync(c => c.Id == request.CodelabId, cancellationToken);

            if (codelab == null)
            {
                throw new ArgumentException("Codelab not found.");
            }

            _context.CodelabTestCases.RemoveRange(codelab.TestCases);
            _context.CodelabTemplates.RemoveRange(codelab.Templates);
            _context.CodelabHints.RemoveRange(codelab.Hints);

            codelab.Delete();
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
