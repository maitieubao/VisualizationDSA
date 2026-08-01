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
    public class RoadmapAuditService : IRoadmapAuditService
    {
        private readonly ApplicationDbContext _context;

        public RoadmapAuditService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task LogEditAsync(Guid roadmapId, Guid editorId, string changeType, string? note = null)
        {
            var log = new RoadmapEditLog(roadmapId, editorId, changeType, note);
            _context.RoadmapEditLogs.Add(log);
            await _context.SaveChangesAsync();
        }

        public async Task<List<RoadmapEditLog>> GetEditHistoryAsync(Guid roadmapId)
        {
            return await _context.RoadmapEditLogs
                .Include(x => x.Editor)
                .Where(x => x.RoadmapId == roadmapId)
                .OrderByDescending(x => x.ChangedAt)
                .ToListAsync();
        }
    }
}
