using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Application.Common.Interfaces;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Infrastructure.Data;

namespace VisualizationDSA.Infrastructure.Services
{
    public class ContentModerationService : IContentModerationService
    {
        private readonly ApplicationDbContext _context;

        public ContentModerationService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<(bool IsSafe, string? Reason)> CheckContentAsync(string content)
        {
            if (string.IsNullOrWhiteSpace(content))
                return (true, null);

            var blacklistedWords = await _context.KeywordBlacklists
                .Select(b => b.Keyword)
                .ToListAsync();

            var lowerContent = content.ToLowerInvariant();

            foreach (var word in blacklistedWords)
            {
                if (lowerContent.Contains(word))
                {
                    return (false, $"Contains restricted keyword: {word}");
                }
            }

            return (true, null);
        }

        public async Task<ContentReport> CreateReportAsync(Guid nodeId, Guid reporterId, string reason, string? detail = null)
        {
            var report = new ContentReport(nodeId, reporterId, reason, detail);
            _context.ContentReports.Add(report);
            await _context.SaveChangesAsync();
            return report;
        }

        public async Task<List<ContentReport>> GetPendingReportsAsync()
        {
            return await _context.ContentReports
                .Include(r => r.Node)
                .Include(r => r.Reporter)
                .Where(r => r.Status == "Pending")
                .OrderBy(r => r.CreatedAt)
                .ToListAsync();
        }

        public async Task ResolveReportAsync(Guid reportId, string action)
        {
            var report = await _context.ContentReports.FindAsync(reportId);
            if (report == null) throw new KeyNotFoundException("Report not found");

            if (action == "dismiss")
            {
                report.Resolve("Dismissed");
            }
            else if (action == "remove" || action == "warn_teacher")
            {
                report.Resolve("Resolved");
            }
            else
            {
                throw new ArgumentException("Invalid action");
            }

            await _context.SaveChangesAsync();
        }
    }
}
