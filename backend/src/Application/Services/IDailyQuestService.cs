using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using VisualizationDSA.Application.DTOs;

namespace VisualizationDSA.Application.Services
{
    public interface IDailyQuestService
    {
        Task<List<DailyQuestDto>> GetDailyQuestsAsync(Guid userId, int tzOffset = 0);
        Task<DailyQuestDto?> ClaimQuestRewardAsync(Guid userId, Guid questId, int tzOffset = 0);
        Task UpdateQuestProgressAsync(Guid userId, string questType, int amount = 1, int tzOffset = 0);
    }
}
