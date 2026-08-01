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
    public class SubmitCodelabCommand : IRequest<SubmitCodelabResult>
    {
        public Guid UserId { get; set; }
        public Guid CodelabId { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Language { get; set; } = string.Empty;
    }

    public class SubmitCodelabResult
    {
        public Guid SubmissionId { get; set; }
        public bool Passed { get; set; }
        public SubmissionStatus Status { get; set; }
        public string ErrorMessage { get; set; } = string.Empty;
        public int RuntimeMs { get; set; }
        public int MemoryBytes { get; set; }
        public int Score { get; set; }
    }

    public class SubmitCodelabCommandValidator : AbstractValidator<SubmitCodelabCommand>
    {
        public SubmitCodelabCommandValidator()
        {
            RuleFor(x => x.UserId).NotEmpty();
            RuleFor(x => x.CodelabId).NotEmpty();
            RuleFor(x => x.Code).NotEmpty();
            RuleFor(x => x.Language).NotEmpty();
        }
    }

    public class SubmitCodelabCommandHandler : IRequestHandler<SubmitCodelabCommand, SubmitCodelabResult>
    {
        private readonly IApplicationDbContext _context;
        private readonly ICodeJudgeService _judgeService;
        private readonly IProgressRuleEngine _progressRuleEngine;

        public SubmitCodelabCommandHandler(IApplicationDbContext context, ICodeJudgeService judgeService, IProgressRuleEngine progressRuleEngine)
        {
            _context = context;
            _judgeService = judgeService;
            _progressRuleEngine = progressRuleEngine;
        }

        public async Task<SubmitCodelabResult> Handle(SubmitCodelabCommand request, CancellationToken cancellationToken)
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

            var submission = new CodelabSubmission(request.UserId, request.CodelabId, request.Code, request.Language, isSubmit: true);
            _context.CodelabSubmissions.Add(submission);
            await _context.SaveChangesAsync(cancellationToken);

            
            var result = await _judgeService.EvaluateCodeAsync(request.Code, request.Language, codelab.TestCases.ToList(), codelab.MaxRuntimeMs, codelab.MaxMemoryBytes);

            string tcJson = JsonSerializer.Serialize(result.TestCaseResults);
            submission.UpdateResult(result.Status, result.RuntimeMs, result.MemoryBytes, result.PassedCount, result.TotalCount, result.TotalScore, tcJson, result.ErrorMessage);
            await _context.SaveChangesAsync(cancellationToken);

            
            if (result.Passed)
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);
                if (user != null)
                {
                    user.AwardXP(codelab.XPReward); 
                }
                
                
                var moduleItems = await _context.Set<ModuleItem>()
                    .Where(m => m.CodelabId == request.CodelabId && !m.IsDeleted)
                    .ToListAsync(cancellationToken);

                foreach (var moduleItem in moduleItems)
                {
                    var progress = await _context.Set<UserModuleItemProgress>()
                        .FirstOrDefaultAsync(p => p.UserId == request.UserId && p.ModuleItemId == moduleItem.Id, cancellationToken);
                        
                    if (progress == null)
                    {
                        progress = new UserModuleItemProgress(request.UserId, moduleItem.Id);
                        _context.Set<UserModuleItemProgress>().Add(progress);
                    }
                    
                    progress.UpdateProgress(activeFrame: 0, scrollPercent: 100, isCompleted: true, score: result.TotalScore);
                    await _progressRuleEngine.ProcessCompletionAsync(request.UserId, moduleItem.Id);
                }

                await _context.SaveChangesAsync(cancellationToken);
            }

            return new SubmitCodelabResult
            {
                SubmissionId = submission.Id,
                Passed = result.Passed,
                Status = result.Status,
                ErrorMessage = result.ErrorMessage,
                RuntimeMs = result.RuntimeMs,
                MemoryBytes = result.MemoryBytes,
                Score = result.TotalScore
            };
        }
    }
}
