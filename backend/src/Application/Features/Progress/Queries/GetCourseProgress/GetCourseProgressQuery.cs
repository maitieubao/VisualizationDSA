using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Application.Interfaces;
using VisualizationDSA.Domain.Entities;

namespace VisualizationDSA.Application.Features.Progress.Queries.GetCourseProgress
{
    public class GetCourseProgressQuery : IRequest<CourseProgressResult>
    {
        public Guid UserId { get; set; }
        public Guid CourseId { get; set; }
    }

    public class CourseProgressResult
    {
        public Guid CourseId { get; set; }
        public double CompletionPercentage { get; set; }
        public List<ModuleProgressResult> Modules { get; set; } = new();
    }

    public class ModuleProgressResult
    {
        public Guid ModuleId { get; set; }
        public string Title { get; set; } = string.Empty;
        public int OrderIndex { get; set; }
        public List<ModuleItemProgressResult> Items { get; set; } = new();
    }

    public class ModuleItemProgressResult
    {
        public Guid ModuleItemId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty; 
        public bool IsRequired { get; set; }
        public string Status { get; set; } = "Locked"; 
        public int? Score { get; set; }
    }

    public class GetCourseProgressQueryHandler : IRequestHandler<GetCourseProgressQuery, CourseProgressResult>
    {
        private readonly IApplicationDbContext _context;
        private readonly VisualizationDSA.Application.Services.IProgressRuleEngine _ruleEngine;

        public GetCourseProgressQueryHandler(IApplicationDbContext context, VisualizationDSA.Application.Services.IProgressRuleEngine ruleEngine)
        {
            _context = context;
            _ruleEngine = ruleEngine;
        }

        public async Task<CourseProgressResult> Handle(GetCourseProgressQuery request, CancellationToken cancellationToken)
        {
            var modules = await _context.CourseModules
                .Include(m => m.Items.Where(i => !i.IsDeleted))
                    .ThenInclude(i => i.Lesson)
                .Include(m => m.Items.Where(i => !i.IsDeleted))
                    .ThenInclude(i => i.Quiz)
                
                .Where(m => m.CourseId == request.CourseId && !m.IsDeleted)
                .OrderBy(m => m.OrderIndex)
                .ToListAsync(cancellationToken);

            var moduleItemIds = modules.SelectMany(m => m.Items.Select(i => i.Id)).ToList();

            var userProgresses = await _context.UserModuleItemProgresses
                .Where(p => p.UserId == request.UserId && moduleItemIds.Contains(p.ModuleItemId))
                .ToDictionaryAsync(p => p.ModuleItemId, cancellationToken);

            var result = new CourseProgressResult { CourseId = request.CourseId };
            int totalRequiredItems = 0;
            int completedRequiredItems = 0;

            foreach (var module in modules)
            {
                var modResult = new ModuleProgressResult
                {
                    ModuleId = module.Id,
                    Title = module.Title,
                    OrderIndex = module.OrderIndex
                };

                foreach (var item in module.Items.OrderBy(i => i.OrderIndex))
                {
                    if (item.IsRequired) totalRequiredItems++;

                    string status = "NotStarted";
                    int? score = null;

                    if (userProgresses.TryGetValue(item.Id, out var progress))
                    {
                        status = progress.Status;
                        score = progress.Score;
                        if (item.IsRequired && status == "Completed")
                        {
                            completedRequiredItems++;
                        }
                    }
                    else
                    {
                        
                        bool canUnlock = await _ruleEngine.CanUnlockNextItemAsync(request.UserId, item.Id);
                        if (!canUnlock)
                        {
                            status = "Locked";
                        }
                    }

                    string itemTitle = !string.IsNullOrEmpty(item.OverrideTitle) ? item.OverrideTitle : 
                                       (item.ItemType == Domain.Enums.ModuleItemType.Lesson ? item.Lesson?.Title :
                                        item.ItemType == Domain.Enums.ModuleItemType.Quiz ? item.Quiz?.Title : "Codelab"); 

                    modResult.Items.Add(new ModuleItemProgressResult
                    {
                        ModuleItemId = item.Id,
                        Title = itemTitle ?? "Unknown",
                        Type = item.ItemType.ToString(),
                        IsRequired = item.IsRequired,
                        Status = status,
                        Score = score
                    });
                }
                result.Modules.Add(modResult);
            }

            result.CompletionPercentage = totalRequiredItems > 0 
                ? (double)completedRequiredItems / totalRequiredItems * 100 
                : 0;

            return result;
        }
    }
}
