using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Infrastructure.Data;
using VisualizationDSA.WebApi.Filters;

namespace VisualizationDSA.WebApi.Controllers
{
    /// <summary>
    /// F8 (FR-4.11, FR-4.3) — Practice Ladder 3 bậc gắn theo từng bài học.
    /// Bậc 1: Quiz (ngưỡng 60%). Bậc 2: Interactive Lab (sắp xếp mảng thủ công, giới hạn swap).
    /// Bậc 3: CodeLab (ngưỡng 70%). Guard thứ tự bậc chạy phía SERVER — không tin client.
    /// </summary>
    [ApiVersion("1.0")]
    [ApiController]
    [Route("api/v{version:apiVersion}/ladder")]
    [RequireJwtRole]
    public class LadderController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;

        public LadderController(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet("{lessonId}")]
        public async Task<IActionResult> GetLadder(Guid lessonId)
        {
            var userIdResult = TryGetCurrentUserId(out var userId);
            if (userIdResult != null) return userIdResult;

            var lesson = await _dbContext.Lessons.AsNoTracking()
                .FirstOrDefaultAsync(l => l.Id == lessonId && !l.IsDeleted);
            if (lesson == null)
                return NotFound(new { error = "LESSON_NOT_FOUND", message = "Không tìm thấy bài học." });

            var progresses = await _dbContext.Set<StageProgress>()
                .AsNoTracking()
                .Where(p => p.UserId == userId && p.LessonId == lessonId)
                .ToDictionaryAsync(p => p.Stage);

            var quizId = await ResolveLinkedQuizIdAsync(lessonId);
            var lab = LadderLab.GetConfig(lessonId);

            return Ok(new
            {
                lessonId,
                stages = Enumerable.Range(1, 3).Select(stage => BuildStageDto(stage, progresses, quizId, lesson.CodelabId, lab))
            });
        }

        [HttpPost("{lessonId}/stage/{stage}/pass")]
        public async Task<IActionResult> PassStage(Guid lessonId, int stage, [FromBody] PassStageRequest request)
        {
            var userIdResult = TryGetCurrentUserId(out var userId);
            if (userIdResult != null) return userIdResult;

            if (stage < 1 || stage > 3)
                return BadRequest(new { error = "INVALID_STAGE", message = "Bậc phải nằm trong khoảng 1 đến 3." });

            var lesson = await _dbContext.Lessons.AsNoTracking()
                .FirstOrDefaultAsync(l => l.Id == lessonId && !l.IsDeleted);
            if (lesson == null)
                return NotFound(new { error = "LESSON_NOT_FOUND", message = "Không tìm thấy bài học." });

            // Guard thứ tự bậc — chưa pass bậc trước thì 403 LADDER_LOCKED.
            if (stage > 1 && !await HasPassedAsync(userId, lessonId, stage - 1))
            {
                return StatusCode(403, new
                {
                    error = "LADDER_LOCKED",
                    message = $"Bạn phải vượt qua bậc {stage - 1} trước khi làm bậc {stage}."
                });
            }

            (bool Passed, int BestScore, string ErrorCode, string Message) verdict = stage switch
            {
                1 => await VerifyQuizAsync(userId, lessonId, request),
                2 => VerifyLab(lessonId, request),
                3 => await VerifyCodelabAsync(userId, lessonId, request),
                _ => (false, 0, "INVALID_STAGE", "Bậc không hợp lệ.")
            };

            if (!verdict.Passed)
            {
                return BadRequest(new
                {
                    error = verdict.ErrorCode,
                    message = verdict.Message,
                    passed = false
                });
            }

            await UpsertPassedAsync(userId, lessonId, stage, verdict.BestScore);
            return Ok(new { passed = true, stage, bestScore = verdict.BestScore });
        }

        // ── Verify từng bậc ──

        private async Task<(bool Passed, int BestScore, string ErrorCode, string Message)> VerifyQuizAsync(
            Guid userId, Guid lessonId, PassStageRequest request)
        {
            if (!Guid.TryParse(request.QuizAttemptId, out var attemptId))
                return (false, 0, "INVALID_QUIZ_ATTEMPT", "Thiếu mã lượt làm quiz hợp lệ.");

            var attempt = await _dbContext.QuizAttempts.AsNoTracking()
                .FirstOrDefaultAsync(a => a.Id == attemptId && a.UserId == userId);
            if (attempt == null)
                return (false, 0, "QUIZ_ATTEMPT_NOT_FOUND", "Không tìm thấy lượt làm quiz.");

            // Nếu bài học có quiz liên kết (ModuleItem) thì attempt phải thuộc đúng quiz đó.
            var linkedQuizId = await ResolveLinkedQuizIdAsync(lessonId);
            if (linkedQuizId.HasValue && attempt.QuizId != linkedQuizId.Value)
                return (false, 0, "QUIZ_NOT_FOR_LESSON", "Lượt làm quiz không thuộc bài học này.");

            var percent = attempt.MaxScore > 0
                ? (int)Math.Round(attempt.Score * 100.0 / attempt.MaxScore)
                : 0;
            if (percent < 60)
                return (false, 0, "LADDER_STAGE_FAILED", $"Quiz đạt {percent}% — cần tối thiểu 60% để vượt bậc 1.");

            return (true, percent, string.Empty, string.Empty);
        }

        private static (bool Passed, int BestScore, string ErrorCode, string Message) VerifyLab(
            Guid lessonId, PassStageRequest request)
        {
            if (request.Operations == null || request.FinalArray == null)
                return (false, 0, "INVALID_LAB_EVIDENCE", "Thiếu bằng chứng thao tác hoặc mảng kết quả.");

            var config = LadderLab.GetConfig(lessonId);
            if (request.Operations.Count > config.MaxSwaps)
                return (false, 0, "LADDER_STAGE_FAILED", $"Vượt quá giới hạn {config.MaxSwaps} bước swap.");

            if (!TryReplay(config.Input, request.Operations, out var replayed))
                return (false, 0, "INVALID_LAB_OPERATION", "Thao tác swap không hợp lệ (chỉ số ngoài dải hoặc trùng nhau).");

            var expected = config.Input.OrderBy(x => x).ToArray();
            if (!replayed.SequenceEqual(expected))
                return (false, 0, "LADDER_STAGE_FAILED", "Trạng thái cuối chưa khớp kết quả chuẩn.");

            if (!request.FinalArray.SequenceEqual(expected))
                return (false, 0, "LADDER_STAGE_FAILED", "Mảng cuối bạn nộp chưa đúng kết quả sắp xếp tăng dần.");

            return (true, 100, string.Empty, string.Empty);
        }

        private async Task<(bool Passed, int BestScore, string ErrorCode, string Message)> VerifyCodelabAsync(
            Guid userId, Guid lessonId, PassStageRequest request)
        {
            if (!Guid.TryParse(request.CodelabSubmissionId, out var submissionId))
                return (false, 0, "INVALID_CODELAB_SUBMISSION", "Thiếu mã lượt nộp codelab hợp lệ.");

            var submission = await _dbContext.CodelabSubmissions.AsNoTracking()
                .FirstOrDefaultAsync(s => s.Id == submissionId && s.UserId == userId);
            if (submission == null)
                return (false, 0, "CODELAB_SUBMISSION_NOT_FOUND", "Không tìm thấy lượt nộp codelab.");

            var lesson = await _dbContext.Lessons.AsNoTracking()
                .FirstOrDefaultAsync(l => l.Id == lessonId && !l.IsDeleted);
            if (lesson?.CodelabId.HasValue == true && submission.CodelabId != lesson.CodelabId.Value)
                return (false, 0, "CODELAB_NOT_FOR_LESSON", "Lượt nộp codelab không thuộc bài học này.");

            var percent = submission.TotalCount > 0
                ? (int)Math.Round(submission.PassedCount * 100.0 / submission.TotalCount)
                : 0;
            if (percent < 70)
                return (false, 0, "LADDER_STAGE_FAILED", $"Codelab đạt {percent}% — cần tối thiểu 70% để vượt bậc 3.");

            return (true, percent, string.Empty, string.Empty);
        }

        // ── Helpers ──

        private object BuildStageDto(int stage, Dictionary<int, StageProgress> progresses, Guid? quizId, Guid? codelabId, LabConfig lab)
        {
            progresses.TryGetValue(stage, out var progress);
            var passed = progress?.Status == StageProgress.StatusPassed;
            var status = stage switch
            {
                1 => passed ? StageProgress.StatusPassed : StageProgress.StatusOpen,
                2 => passed ? StageProgress.StatusPassed
                     : (progresses.ContainsKey(1) && progresses[1].Status == StageProgress.StatusPassed ? StageProgress.StatusOpen : StageProgress.StatusLocked),
                _ => passed ? StageProgress.StatusPassed
                     : (progresses.ContainsKey(2) && progresses[2].Status == StageProgress.StatusPassed ? StageProgress.StatusOpen : StageProgress.StatusLocked),
            };

            return new
            {
                stage,
                status,
                passed,
                bestScore = progress?.BestScore,
                passedAt = progress?.PassedAt,
                quizId = stage == 1 ? quizId : null,
                codelabId = stage == 3 ? codelabId : null,
                lab = stage == 2 ? new { input = lab.Input, maxSwaps = lab.MaxSwaps } : null
            };
        }

        private async Task<bool> HasPassedAsync(Guid userId, Guid lessonId, int stage)
        {
            return await _dbContext.Set<StageProgress>().AsNoTracking()
                .AnyAsync(p => p.UserId == userId && p.LessonId == lessonId && p.Stage == stage && p.Status == StageProgress.StatusPassed);
        }

        private async Task UpsertPassedAsync(Guid userId, Guid lessonId, int stage, int bestScore)
        {
            var progress = await _dbContext.Set<StageProgress>()
                .FirstOrDefaultAsync(p => p.UserId == userId && p.LessonId == lessonId && p.Stage == stage);
            if (progress == null)
            {
                _dbContext.Set<StageProgress>().Add(new StageProgress(userId, lessonId, stage, StageProgress.StatusPassed, bestScore));
            }
            else
            {
                progress.MarkPassed(bestScore);
            }
            await _dbContext.SaveChangesAsync();
        }

        /// <summary>
        /// Tìm quiz liên kết với bài học theo cùng heuristic ModuleItem của LessonController
        /// ("quiz ngay sau lesson"). Trả null khi bài không có quiz liên kết trong module.
        /// </summary>
        private async Task<Guid?> ResolveLinkedQuizIdAsync(Guid lessonId)
        {
            var moduleItem = await _dbContext.ModuleItems.AsNoTracking()
                .FirstOrDefaultAsync(i => i.LessonId == lessonId && !i.IsDeleted);
            if (moduleItem == null) return null;

            var nextLessonOrder = await _dbContext.ModuleItems.AsNoTracking()
                .Where(i => i.ModuleId == moduleItem.ModuleId
                    && i.ItemType == Domain.Enums.ModuleItemType.Lesson
                    && !i.IsDeleted
                    && i.OrderIndex > moduleItem.OrderIndex)
                .OrderBy(i => i.OrderIndex)
                .Select(i => (int?)i.OrderIndex)
                .FirstOrDefaultAsync() ?? int.MaxValue;

            return await _dbContext.ModuleItems.AsNoTracking()
                .Where(i => i.ModuleId == moduleItem.ModuleId
                    && i.ItemType == Domain.Enums.ModuleItemType.Quiz
                    && i.QuizId != null
                    && !i.IsDeleted
                    && i.OrderIndex > moduleItem.OrderIndex
                    && i.OrderIndex < nextLessonOrder)
                .OrderBy(i => i.OrderIndex)
                .Select(i => i.QuizId)
                .FirstOrDefaultAsync();
        }

        private static bool TryReplay(int[] input, List<LabOperationDto> operations, out int[] result)
        {
            var arr = (int[])input.Clone();
            foreach (var op in operations)
            {
                if (op == null
                    || op.FromIndex < 0 || op.FromIndex >= arr.Length
                    || op.ToIndex < 0 || op.ToIndex >= arr.Length
                    || op.FromIndex == op.ToIndex)
                {
                    result = arr;
                    return false;
                }
                (arr[op.FromIndex], arr[op.ToIndex]) = (arr[op.ToIndex], arr[op.FromIndex]);
            }
            result = arr;
            return true;
        }

        private IActionResult? TryGetCurrentUserId(out Guid userId)
        {
            var userIdStr = JwtHelper.ExtractSubFromToken(Request);
            if (userIdStr == null || !Guid.TryParse(userIdStr, out userId))
            {
                userId = Guid.Empty;
                return Unauthorized(new { error = "UNAUTHORIZED", message = "Yêu cầu đăng nhập." });
            }
            return null;
        }
    }

    /// <summary>Bằng chứng nộp cho từng bậc (stage 1: quizAttemptId; stage 2: operations + finalArray; stage 3: codelabSubmissionId).</summary>
    public class PassStageRequest
    {
        public string? QuizAttemptId { get; set; }
        public List<LabOperationDto>? Operations { get; set; }
        public int[]? FinalArray { get; set; }
        public string? CodelabSubmissionId { get; set; }
    }

    public class LabOperationDto
    {
        public int FromIndex { get; set; }
        public int ToIndex { get; set; }
    }

    public sealed record LabConfig(int[] Input, int MaxSwaps);

    /// <summary>
    /// Cấu hình lab tối giản cho bậc 2. Input do SERVER cấp (client nhận qua GET) và server
    /// so khớp trạng thái cuối — không cần canvas hay engine phức tạp.
    /// </summary>
    public static class LadderLab
    {
        public static readonly int[] DefaultInput = new[] { 4, 2, 3, 1 };
        public const int DefaultMaxSwaps = 6;

        public static LabConfig GetConfig(Guid lessonId)
        {
            // MVP: dùng chung một mảng mẫu nhỏ. Có thể mở rộng derive theo lessonId sau.
            return new LabConfig(DefaultInput, DefaultMaxSwaps);
        }
    }
}
