using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Application.Interfaces;
using VisualizationDSA.Domain.Entities;

namespace VisualizationDSA.Application.Features.Codelabs.Commands
{
    public class AddTestCaseCommand : IRequest<Guid>
    {
        public Guid CodelabId { get; set; }
        public string Input { get; set; } = string.Empty;
        public string ExpectedOutput { get; set; } = string.Empty;
        public bool IsHidden { get; set; }
        public int ScoreWeight { get; set; } = 1;
        public int OrderIndex { get; set; }
    }

    public class UpdateTestCaseCommand : IRequest
    {
        public Guid TestCaseId { get; set; }
        public string Input { get; set; } = string.Empty;
        public string ExpectedOutput { get; set; } = string.Empty;
        public bool IsHidden { get; set; }
        public int ScoreWeight { get; set; } = 1;
        public int OrderIndex { get; set; }
    }

    public class DeleteTestCaseCommand : IRequest
    {
        public Guid CodelabId { get; set; }
        public Guid TestCaseId { get; set; }
    }

    public class AddTestCaseCommandHandler : IRequestHandler<AddTestCaseCommand, Guid>
    {
        private readonly IApplicationDbContext _context;

        public AddTestCaseCommandHandler(IApplicationDbContext context) => _context = context;

        public async Task<Guid> Handle(AddTestCaseCommand request, CancellationToken cancellationToken)
        {
            var codelab = await _context.Codelabs
                .FirstOrDefaultAsync(c => c.Id == request.CodelabId, cancellationToken)
                ?? throw new ArgumentException("Codelab not found.");

            var testCase = new CodelabTestCase(
                codelab.Id, request.Input, request.ExpectedOutput, request.IsHidden, request.ScoreWeight, request.OrderIndex);
            _context.CodelabTestCases.Add(testCase);
            await _context.SaveChangesAsync(cancellationToken);
            return testCase.Id;
        }
    }

    public class UpdateTestCaseCommandHandler : IRequestHandler<UpdateTestCaseCommand>
    {
        private readonly IApplicationDbContext _context;

        public UpdateTestCaseCommandHandler(IApplicationDbContext context) => _context = context;

        public async Task Handle(UpdateTestCaseCommand request, CancellationToken cancellationToken)
        {
            var testCase = await _context.CodelabTestCases
                .FirstOrDefaultAsync(tc => tc.Id == request.TestCaseId, cancellationToken)
                ?? throw new ArgumentException("Test case not found.");

            testCase.Update(request.Input, request.ExpectedOutput, request.IsHidden, request.ScoreWeight, request.OrderIndex);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }

    public class DeleteTestCaseCommandHandler : IRequestHandler<DeleteTestCaseCommand>
    {
        private readonly IApplicationDbContext _context;

        public DeleteTestCaseCommandHandler(IApplicationDbContext context) => _context = context;

        public async Task Handle(DeleteTestCaseCommand request, CancellationToken cancellationToken)
        {
            var testCase = await _context.CodelabTestCases
                .FirstOrDefaultAsync(tc => tc.Id == request.TestCaseId && tc.CodelabId == request.CodelabId, cancellationToken)
                ?? throw new ArgumentException("Test case not found.");

            _context.CodelabTestCases.Remove(testCase);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
