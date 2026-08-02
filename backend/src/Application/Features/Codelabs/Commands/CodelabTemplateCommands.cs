using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Application.Interfaces;
using VisualizationDSA.Domain.Entities;

namespace VisualizationDSA.Application.Features.Codelabs.Commands
{
    public class AddTemplateCommand : IRequest<Guid>
    {
        public Guid CodelabId { get; set; }
        public string Language { get; set; } = string.Empty;
        public string StarterCode { get; set; } = string.Empty;
    }

    public class UpdateTemplateCommand : IRequest
    {
        public Guid TemplateId { get; set; }
        public string Language { get; set; } = string.Empty;
        public string StarterCode { get; set; } = string.Empty;
    }

    public class DeleteTemplateCommand : IRequest
    {
        public Guid CodelabId { get; set; }
        public Guid TemplateId { get; set; }
    }

    public class AddTemplateCommandHandler : IRequestHandler<AddTemplateCommand, Guid>
    {
        private readonly IApplicationDbContext _context;

        public AddTemplateCommandHandler(IApplicationDbContext context) => _context = context;

        public async Task<Guid> Handle(AddTemplateCommand request, CancellationToken cancellationToken)
        {
            var codelab = await _context.Codelabs
                .FirstOrDefaultAsync(c => c.Id == request.CodelabId, cancellationToken)
                ?? throw new ArgumentException("Codelab not found.");

            var template = new CodelabTemplate(codelab.Id, request.Language, request.StarterCode);
            _context.CodelabTemplates.Add(template);
            await _context.SaveChangesAsync(cancellationToken);
            return template.Id;
        }
    }

    public class UpdateTemplateCommandHandler : IRequestHandler<UpdateTemplateCommand>
    {
        private readonly IApplicationDbContext _context;

        public UpdateTemplateCommandHandler(IApplicationDbContext context) => _context = context;

        public async Task Handle(UpdateTemplateCommand request, CancellationToken cancellationToken)
        {
            var template = await _context.CodelabTemplates
                .FirstOrDefaultAsync(t => t.Id == request.TemplateId, cancellationToken)
                ?? throw new ArgumentException("Template not found.");

            template.Update(request.Language, request.StarterCode);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }

    public class DeleteTemplateCommandHandler : IRequestHandler<DeleteTemplateCommand>
    {
        private readonly IApplicationDbContext _context;

        public DeleteTemplateCommandHandler(IApplicationDbContext context) => _context = context;

        public async Task Handle(DeleteTemplateCommand request, CancellationToken cancellationToken)
        {
            var template = await _context.CodelabTemplates
                .FirstOrDefaultAsync(t => t.Id == request.TemplateId && t.CodelabId == request.CodelabId, cancellationToken)
                ?? throw new ArgumentException("Template not found.");

            _context.CodelabTemplates.Remove(template);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
