using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Application.Common.Interfaces;
using VisualizationDSA.Application.DTOs;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Interfaces;

namespace VisualizationDSA.Application.Services
{
    public class DailyQuestService : IDailyQuestService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IGamificationService _gamificationService;

        public DailyQuestService(IUnitOfWork unitOfWork, IGamificationService gamificationService)
        {
            _unitOfWork = unitOfWork;
            _gamificationService = gamificationService;
        }

        public async Task<List<DailyQuestDto>> GetDailyQuestsAsync(Guid userId, int tzOffset = 0)
        {
            var today = DateTime.UtcNow.AddMinutes(-tzOffset).Date;
            var questsEnum = await _unitOfWork.UserDailyQuests.FindAsync(q => q.UserId == userId && q.Date == today);
            var quests = questsEnum.ToList();

            if (!quests.Any())
            {
                quests = await GenerateDailyQuestsAsync(userId, today);
                foreach (var q in quests)
                {
                    await _unitOfWork.UserDailyQuests.AddAsync(q);
                }
                await _unitOfWork.CommitAsync();
            }

            return quests.Select(q => new DailyQuestDto
            {
                Id = q.Id,
                QuestType = q.QuestType,
                Difficulty = q.Difficulty,
                Description = q.Description,
                TargetValue = q.TargetValue,
                CurrentValue = q.CurrentValue,
                GemsReward = q.GemsReward,
                IsCompleted = q.IsCompleted,
                IsClaimed = q.IsClaimed
            }).ToList();
        }

        public async Task<DailyQuestDto?> ClaimQuestRewardAsync(Guid userId, Guid questId, int tzOffset = 0)
        {
            var today = DateTime.UtcNow.AddMinutes(-tzOffset).Date;
            var quest = await _unitOfWork.UserDailyQuests.GetByIdAsync(questId);
            if (quest == null || quest.UserId != userId || quest.Date != today)
            {
                return null;
            }

            if (!quest.IsCompleted || quest.IsClaimed)
            {
                return null;
            }

            quest.ClaimReward();
            await _unitOfWork.UserDailyQuests.UpdateAsync(quest);
            
            // Add gems to user
            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            if (user != null)
            {
                user.AddGems(quest.GemsReward);
            }
            
            await _unitOfWork.CommitAsync();

            return new DailyQuestDto
            {
                Id = quest.Id,
                QuestType = quest.QuestType,
                Difficulty = quest.Difficulty,
                Description = quest.Description,
                TargetValue = quest.TargetValue,
                CurrentValue = quest.CurrentValue,
                GemsReward = quest.GemsReward,
                IsCompleted = quest.IsCompleted,
                IsClaimed = quest.IsClaimed
            };
        }

        public async Task UpdateQuestProgressAsync(Guid userId, string questType, int amount = 1, int tzOffset = 0)
        {
            var today = DateTime.UtcNow.AddMinutes(-tzOffset).Date;
            var questsEnum = await _unitOfWork.UserDailyQuests
                .FindAsync(q => q.UserId == userId && q.Date == today && q.QuestType == questType && q.CurrentValue < q.TargetValue);
            var quests = questsEnum.ToList();

            if (!quests.Any()) return;

            foreach (var quest in quests)
            {
                quest.AddProgress(amount);
                await _unitOfWork.UserDailyQuests.UpdateAsync(quest);
            }

            await _unitOfWork.CommitAsync();
        }

        private async Task<List<UserDailyQuest>> GenerateDailyQuestsAsync(Guid userId, DateTime date)
        {
            var random = new Random((userId.ToString() + date.ToString("yyyyMMdd")).GetHashCode()); // Same quests for same user on same day
            var quests = new List<UserDailyQuest>();

            var templatesEnum = await _unitOfWork.QuestTemplates.FindAsync(t => t.IsActive);
            var templates = templatesEnum.ToList();
            
            if (!templates.Any()) return quests;

            var easyTemplates = templates.Where(t => t.Difficulty == "Easy").ToList();
            var mediumTemplates = templates.Where(t => t.Difficulty == "Medium").ToList();
            var hardTemplates = templates.Where(t => t.Difficulty == "Hard").ToList();

            // 2 Easy
            if (easyTemplates.Any())
            {
                quests.AddRange(easyTemplates.OrderBy(x => random.Next()).Take(2)
                    .Select(t => new UserDailyQuest(userId, date, t.QuestType, t.Difficulty, t.Description, t.TargetValue, t.GemsReward)));
            }

            // 2 Medium
            if (mediumTemplates.Any())
            {
                quests.AddRange(mediumTemplates.OrderBy(x => random.Next()).Take(2)
                    .Select(t => new UserDailyQuest(userId, date, t.QuestType, t.Difficulty, t.Description, t.TargetValue, t.GemsReward)));
            }

            // 1 Hard
            if (hardTemplates.Any())
            {
                quests.AddRange(hardTemplates.OrderBy(x => random.Next()).Take(1)
                    .Select(t => new UserDailyQuest(userId, date, t.QuestType, t.Difficulty, t.Description, t.TargetValue, t.GemsReward)));
            }

            return quests;
        }
    }
}
