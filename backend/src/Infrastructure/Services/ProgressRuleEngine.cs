using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Application.Services;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Application.Interfaces;

namespace VisualizationDSA.Infrastructure.Services
{
    public class ProgressRuleEngine : IProgressRuleEngine
    {
        private readonly IApplicationDbContext _context;

        public ProgressRuleEngine(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<bool> CanUnlockNextItemAsync(Guid userId, Guid currentModuleItemId)
        {
            var currentItem = await _context.ModuleItems
                .Include(m => m.Module)
                .FirstOrDefaultAsync(m => m.Id == currentModuleItemId && !m.IsDeleted);

            if (currentItem == null) return false;

            
            var previousRequiredItems = await _context.ModuleItems
                .Where(m => m.ModuleId == currentItem.ModuleId 
                         && !m.IsDeleted 
                         && m.IsRequired 
                         && m.OrderIndex < currentItem.OrderIndex)
                .ToListAsync();

            if (!previousRequiredItems.Any())
            {
                
                return true;
            }

            
            var previousItemIds = previousRequiredItems.Select(m => m.Id).ToList();
            
            var completedCount = await _context.UserModuleItemProgresses
                .Where(p => p.UserId == userId 
                         && previousItemIds.Contains(p.ModuleItemId) 
                         && p.Status == "Completed")
                .CountAsync();

            return completedCount == previousItemIds.Count;
        }

        public async Task ProcessCompletionAsync(Guid userId, Guid moduleItemId)
        {
            
            
            
            await Task.CompletedTask;
        }
    }
}
