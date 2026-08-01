using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Application.Common.Interfaces;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Infrastructure.Data;

namespace VisualizationDSA.Infrastructure.Services
{
    public class RoadmapLanguageService : IRoadmapLanguageService
    {
        private readonly ApplicationDbContext _context;

        public RoadmapLanguageService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<string?> GetLanguageAsync(Guid userId, string roadmapId)
        {
            var userLang = await _context.UserRoadmapLanguages
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.UserId == userId && x.RoadmapId == roadmapId);
            
            // Trả về null nếu chưa bao giờ chọn, để Frontend hiện force-modal
            return userLang?.Language;
        }

        public async Task SetLanguageAsync(Guid userId, string roadmapId, string language)
        {
            var userLang = await _context.UserRoadmapLanguages
                .FirstOrDefaultAsync(x => x.UserId == userId && x.RoadmapId == roadmapId);

            if (userLang == null)
            {
                userLang = new UserRoadmapLanguage(userId, roadmapId, language);
                _context.UserRoadmapLanguages.Add(userLang);
            }
            else
            {
                userLang.UpdateLanguage(language);
            }

            await _context.SaveChangesAsync();
        }
    }
}
