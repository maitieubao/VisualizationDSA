using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Application.DTOs;
using VisualizationDSA.Application.Services;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Infrastructure.Data;

namespace VisualizationDSA.Infrastructure.Services
{
    public class OutOfHeartsException : Exception
    {
        public HeartRecoveryInfoDto RecoveryInfo { get; }
        public OutOfHeartsException(HeartRecoveryInfoDto recoveryInfo) : base("OUT_OF_HEARTS")
        {
            RecoveryInfo = recoveryInfo;
        }
    }

    public class SessionService : ISessionService
    {
        private readonly ApplicationDbContext _context;
        private readonly IHeartService _heartService;

        public SessionService(ApplicationDbContext context, IHeartService heartService)
        {
            _context = context;
            _heartService = heartService;
        }

        public async Task<EnterNodeResponseDto> EnterNodeAsync(Guid userId, string nodeId)
        {
            var now = DateTime.UtcNow;

            // 1. Lấy user từ DB
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null) throw new UnauthorizedAccessException("User not found");

            // 2. Check active session
            var activeSession = await _context.LearningSessions
                .Where(s => s.UserId == userId && s.NodeId == nodeId && s.ExpiresAt > now)
                .OrderByDescending(s => s.CreatedAt)
                .FirstOrDefaultAsync();

            if (activeSession != null)
            {
                // Có session active -> Không trừ tim
                return new EnterNodeResponseDto
                {
                    Resumed = true,
                    SessionId = activeSession.Id,
                    CurrentStep = activeSession.CurrentStep,
                    Hearts = user.Hearts + _heartService.CalculateRecoveredHearts(user),
                    MaxHearts = user.MaxHearts,
                    QuizScore = activeSession.QuizScore,
                    LabScore = activeSession.LabScore
                };
            }

            // 3. Không có session active -> Trừ tim (Atomic)
            bool success = await _heartService.DeductHeartAtomicAsync(userId);
            if (!success)
            {
                // Lấy thông tin recovery để trả về lỗi
                var status = await _heartService.GetHeartStatusAsync(userId);
                throw new OutOfHeartsException(new HeartRecoveryInfoDto
                {
                    HeartRecoverySeconds = status.NextHeartInSeconds ?? 3600,
                    NextHeartAt = status.NextHeartInSeconds.HasValue ? DateTime.UtcNow.AddSeconds(status.NextHeartInSeconds.Value) : null,
                    AdsWatchedToday = status.AdsWatchedToday,
                    AdsMaxPerDay = status.AdsMaxPerDay
                });
            }

            // 4. Xóa session cũ (đã expired) của user + nodeId
            var oldSessions = await _context.LearningSessions
                .Where(s => s.UserId == userId && s.NodeId == nodeId)
                .ToListAsync();
            
            if (oldSessions.Any())
            {
                _context.LearningSessions.RemoveRange(oldSessions);
            }

            // 5. Tạo session mới
            var newSession = new LearningSession(userId, nodeId);
            _context.LearningSessions.Add(newSession);
            await _context.SaveChangesAsync();

            // Refetch heart status (trừ 1 rồi nên get lại)
            var currentStatus = await _heartService.GetHeartStatusAsync(userId);

            return new EnterNodeResponseDto
            {
                Resumed = false,
                SessionId = newSession.Id,
                CurrentStep = newSession.CurrentStep,
                Hearts = currentStatus.Hearts,
                MaxHearts = currentStatus.MaxHearts,
                QuizScore = null,
                LabScore = null
            };
        }

        public async Task<LearningSessionDto?> GetCurrentSessionAsync(Guid userId)
        {
            var now = DateTime.UtcNow;
            var activeSession = await _context.LearningSessions
                .Where(s => s.UserId == userId && s.ExpiresAt > now)
                .OrderByDescending(s => s.CreatedAt)
                .FirstOrDefaultAsync();

            if (activeSession == null) return null;

            return new LearningSessionDto
            {
                SessionId = activeSession.Id,
                NodeId = activeSession.NodeId,
                CurrentStep = activeSession.CurrentStep,
                QuizScore = activeSession.QuizScore,
                LabScore = activeSession.LabScore,
                LeetCodeScore = activeSession.LeetCodeScore,
                ExpiresAt = activeSession.ExpiresAt,
                RemainingSeconds = (activeSession.ExpiresAt - now).TotalSeconds
            };
        }

        public async Task<UpdateStepResponseDto> UpdateSessionStepAsync(Guid userId, Guid sessionId, string step)
        {
            var session = await _context.LearningSessions
                .FirstOrDefaultAsync(s => s.Id == sessionId && s.UserId == userId);

            if (session == null || session.IsExpired())
            {
                return new UpdateStepResponseDto { Success = false, CurrentStep = string.Empty };
            }

            session.UpdateStep(step);
            await _context.SaveChangesAsync();

            return new UpdateStepResponseDto { Success = true, CurrentStep = session.CurrentStep };
        }
    }
}
