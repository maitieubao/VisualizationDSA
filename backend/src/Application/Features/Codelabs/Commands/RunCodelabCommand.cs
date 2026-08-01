using System;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Application.Interfaces;
using VisualizationDSA.Application.Services;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Enums;

namespace VisualizationDSA.Application.Features.Codelabs.Commands
{
    public class RunCodelabCommand : IRequest<RunCodelabResult>
    {
        public Guid UserId { get; set; }
        public Guid CodelabId { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Language { get; set; } = string.Empty;
    }

    public class RunCodelabResult
    {
        public bool Passed { get; set; }
        public SubmissionStatus Status { get; set; }
        public string ErrorMessage { get; set; } = string.Empty;
        public int RuntimeMs { get; set; }
        public int MemoryBytes { get; set; }
        public string TestCaseResultsJson { get; set; } = string.Empty;
    }

    public class RunCodelabCommandValidator : AbstractValidator<RunCodelabCommand>
    {
        public RunCodelabCommandValidator()
        {
            RuleFor(x => x.UserId).NotEmpty();
            RuleFor(x => x.CodelabId).NotEmpty();
            RuleFor(x => x.Code).NotEmpty();
            RuleFor(x => x.Language).NotEmpty();
        }
    }

    public class RunCodelabCommandHandler : IRequestHandler<RunCodelabCommand, RunCodelabResult>
    {
        private readonly IApplicationDbContext _context;
        private readonly ICodeJudgeService _judgeService;

        public RunCodelabCommandHandler(IApplicationDbContext context, ICodeJudgeService judgeService)
        {
            _context = context;
            _judgeService = judgeService;
        }

        public async Task<RunCodelabResult> Handle(RunCodelabCommand request, CancellationToken cancellationToken)
        {
            var codelab = await _context.Codelabs
                .Include(c => c.TestCases)
                .FirstOrDefaultAsync(c => c.Id == request.CodelabId, cancellationToken);
                
            if (codelab == null)
            {
                throw new ArgumentException("Codelab not found.");
            }

            if (!codelab.AllowedLanguages.Contains(request.Language))
            {
                throw new ArgumentException($"Language {request.Language} is not allowed for this codelab.");
            }

            
            var visibleTestCases = codelab.TestCases.Where(tc => !tc.IsHidden).ToList();

            
            var result = await _judgeService.EvaluateCodeAsync(request.Code, request.Language, visibleTestCases, codelab.MaxRuntimeMs, codelab.MaxMemoryBytes);

            string tcJson = JsonSerializer.Serialize(result.TestCaseResults);

            
            var submission = new CodelabSubmission(request.UserId, request.CodelabId, request.Code, request.Language, isSubmit: false);
            submission.UpdateResult(result.Status, result.RuntimeMs, result.MemoryBytes, result.PassedCount, result.TotalCount, result.TotalScore, tcJson, result.ErrorMessage);
            _context.CodelabSubmissions.Add(submission);
            await _context.SaveChangesAsync(cancellationToken);

            return new RunCodelabResult
            {
                Passed = result.Passed,
                Status = result.Status,
                ErrorMessage = result.ErrorMessage,
                RuntimeMs = result.RuntimeMs,
                MemoryBytes = result.MemoryBytes,
                TestCaseResultsJson = tcJson
            };
        }
    }
}
