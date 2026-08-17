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
    /// F9 (FR-2.10, FR-10.1) — Learning Path + Tim (hearts).
    ///
    /// Lộ trình học gồm các node tuần tự, mở khóa lần lượt. Người học vào node đang mở phải
    /// trả 1 Tim (trừ ATOMIC); node liên kết tới Lesson hiện có qua LessonId. Pass node → mở
    /// khóa node kế. Tim hồi theo giờ SERVER (1 tim mỗi 30 phút, tối đa HeartsMax).
    /// </summary>
    [ApiVersion("1.0")]
    [ApiController]
    [Route("api/v{version:apiVersion}/learning-paths")]
    public class LearningPathController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;

        /// <summary>F9: session học có hiệu lực 30 phút — trong session không trừ thêm Tim.</summary>
        private const int SessionDurationMinutes = 30;

        /// <summary>F9: XP trao 1 lần khi pass node lần đầu (bước tích hợp gamification sau có thể đổi nguồn).</summary>
        private const int PassNodeXpReward = 25;

        public LearningPathController(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        /// <summary>GET danh sách lộ trình (mở — không yêu cầu đăng nhập).</summary>
        [HttpGet]
        public async Task<IActionResult> GetLearningPaths()
        {
            var paths = await _dbContext.Set<LearningPath>()
                .AsNoTracking()
                .OrderBy(p => p.CreatedAt)
                .Select(p => new
                {
                    p.Id,
                    p.Title,
                    p.Description,
                    p.CreatedAt,
                    nodeCount = p.Nodes.Count
                })
                .ToListAsync();

            return Ok(paths);
        }

        /// <summary>GET bản đồ node kèm trạng thái của user hiện tại (cần auth).</summary>
        [HttpGet("{id:guid}")]
        [RequireJwtRole]
        public async Task<IActionResult> GetLearningPath(Guid id)
        {
            var userIdResult = TryGetCurrentUserId(out var userId);
            if (userIdResult != null) return userIdResult;

            var path = await _dbContext.Set<LearningPath>()
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.Id == id);
            if (path == null)
                return NotFound(new { error = "LEARNING_PATH_NOT_FOUND", message = "Không tìm thấy lộ trình học." });

            var nodes = await _dbContext.Set<LearningPathNode>()
                .AsNoTracking()
                .Where(n => n.LearningPathId == id)
                .OrderBy(n => n.OrderIndex)
                .ToListAsync();

            var nodeIds = nodes.Select(n => n.Id).ToList();
            var progresses = nodeIds.Count == 0
                ? new Dictionary<Guid, UserNodeProgress>()
                : await _dbContext.Set<UserNodeProgress>()
                    .AsNoTracking()
                    .Where(p => p.UserId == userId && nodeIds.Contains(p.NodeId))
                    .ToDictionaryAsync(p => p.NodeId);

            // Tim đã hồi theo giờ server — đọc sau khi regen để trả đúng giá trị hiện tại.
            var user = await _dbContext.Users.FindAsync(userId);
            if (user == null)
                return NotFound(new { error = "USER_NOT_FOUND", message = "Không tìm thấy người dùng." });
            var now = DateTime.UtcNow;
            user.RegenHearts(now);
            await _dbContext.SaveChangesAsync();

            var sessionByNode = await _dbContext.Set<NodeSession>()
                .AsNoTracking()
                .Where(s => s.UserId == userId && nodeIds.Contains(s.NodeId))
                .ToDictionaryAsync(s => s.NodeId);

            var ordered = nodes.OrderBy(n => n.OrderIndex).ToList();
            var nodeDtos = new List<object>(ordered.Count);
            for (var i = 0; i < ordered.Count; i++)
            {
                var node = ordered[i];
                progresses.TryGetValue(node.Id, out var progress);
                var status = ResolveNodeStatus(ordered, i, progresses, node.Id);
                sessionByNode.TryGetValue(node.Id, out var session);

                nodeDtos.Add(new
                {
                    node.Id,
                    node.LearningPathId,
                    node.OrderIndex,
                    node.Title,
                    node.LessonId,
                    status,
                    stars = progress?.Stars ?? 0,
                    nodeScore = progress?.NodeScore,
                    unlockedAt = progress?.UnlockedAt,
                    passedAt = progress?.PassedAt,
                    session = session == null ? null : new
                    {
                        session.StartedAt,
                        session.ExpiresAt,
                        isActive = session.ExpiresAt > now
                    }
                });
            }

            return Ok(new
            {
                path.Id,
                path.Title,
                path.Description,
                path.CreatedAt,
                hearts = user.Hearts,
                heartsMax = user.HeartsMax,
                nextHeartAt = NextHeartAt(user, now),
                nodes = nodeDtos
            });
        }

        /// <summary>
        /// POST vào node đang mở: session còn hạn → 200 resume (không trừ tim); hết hạn →
        /// hồi tim theo giờ server, trừ 1 tim ATOMIC, tạo/gia hạn session 30 phút.
        /// Hết tim → 403 { error: "HEARTS_EMPTY" }.
        /// </summary>
        [HttpPost("{id:guid}/nodes/{nodeId:guid}/enter")]
        [RequireJwtRole]
        public async Task<IActionResult> EnterNode(Guid id, Guid nodeId)
        {
            var userIdResult = TryGetCurrentUserId(out var userId);
            if (userIdResult != null) return userIdResult;

            var node = await _dbContext.Set<LearningPathNode>()
                .AsNoTracking()
                .FirstOrDefaultAsync(n => n.Id == nodeId && n.LearningPathId == id);
            if (node == null)
                return NotFound(new { error = "NODE_NOT_FOUND", message = "Không tìm thấy node trong lộ trình." });

            if (!await IsNodeOpenForUserAsync(userId, node))
            {
                return StatusCode(403, new
                {
                    error = "NODE_LOCKED",
                    message = "Node này chưa được mở khóa. Hãy hoàn thành node trước trong lộ trình."
                });
            }

            var now = DateTime.UtcNow;

            // FR-10.1: node đã pass → vào lại ôn tập KHÔNG trừ Tim.
            if (await HasPassedNodeAsync(userId, nodeId))
            {
                var reviewSession = await _dbContext.Set<NodeSession>()
                    .AsNoTracking()
                    .FirstOrDefaultAsync(s => s.UserId == userId && s.NodeId == nodeId);
                var reviewHearts = await ReadHeartsAsync(userId);
                var reviewExpiresAt = reviewSession?.ExpiresAt > now
                    ? reviewSession.ExpiresAt
                    : now.AddMinutes(SessionDurationMinutes);
                return Ok(BuildEnterResponse(reviewHearts.Hearts, reviewHearts.HeartsMax, reviewExpiresAt, resumed: true));
            }

            for (var attempt = 0; attempt < 2; attempt++)
            {
                if (attempt > 0) _dbContext.ChangeTracker.Clear();

                try
                {
                    var result = await ClaimSessionAndDeductHeartAsync(userId, nodeId, now);
                    if (result.UserNotFound)
                    {
                        return NotFound(new { error = "USER_NOT_FOUND", message = "Không tìm thấy người dùng." });
                    }

                    if (result.Resumed)
                    {
                        var resumeSession = await _dbContext.Set<NodeSession>()
                            .AsNoTracking()
                            .FirstAsync(s => s.UserId == userId && s.NodeId == nodeId);
                        var resumeHearts = await ReadHeartsAsync(userId);
                        return Ok(BuildEnterResponse(resumeHearts.Hearts, resumeHearts.HeartsMax, resumeSession.ExpiresAt, resumed: true));
                    }

                    if (result.HeartsEmpty)
                    {
                        var emptyHearts = await ReadHeartsAsync(userId);
                        return StatusCode(403, new
                        {
                            error = "HEARTS_EMPTY",
                            message = "Bạn đã hết Tim. Hãy chờ Tim hồi phục trước khi vào node mới.",
                            hearts = emptyHearts.Hearts,
                            heartsMax = emptyHearts.HeartsMax
                        });
                    }

                    var hearts = await ReadHeartsAsync(userId);
                    return Ok(BuildEnterResponse(hearts.Hearts, hearts.HeartsMax, result.ExpiresAt, resumed: false));
                }
                catch (DbUpdateException)
                {
                    // Race: request song song đã claim session trước — retry sẽ thấy session
                    // và trả resume mà không trừ thêm Tim (idempotent).
                }
            }

            // Fallback an toàn sau retry: đọc lại session đã tồn tại và trả resume.
            var fallbackSession = await _dbContext.Set<NodeSession>()
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.UserId == userId && s.NodeId == nodeId);
            if (fallbackSession != null)
            {
                var fallbackHearts = await ReadHeartsAsync(userId);
                return Ok(BuildEnterResponse(fallbackHearts.Hearts, fallbackHearts.HeartsMax, fallbackSession.ExpiresAt, resumed: true));
            }

            return StatusCode(409, new { error = "RACE_RETRY_EXHAUSTED", message = "Không thể vào node do xung đột đồng thời. Vui lòng thử lại." });
        }

        /// <summary>
        /// POST pass node: guard node đang mở hoặc đã pass; upsert Status=2 + PassedAt=Now,
        /// mở khóa node kế (Status=1 + UnlockedAt=Now). Trao XP 1 lần cho lần pass đầu.
        /// </summary>
        [HttpPost("{id:guid}/nodes/{nodeId:guid}/pass")]
        [RequireJwtRole]
        public async Task<IActionResult> PassNode(Guid id, Guid nodeId, [FromBody] PassNodeRequest? request)
        {
            var userIdResult = TryGetCurrentUserId(out var userId);
            if (userIdResult != null) return userIdResult;

            var node = await _dbContext.Set<LearningPathNode>()
                .AsNoTracking()
                .FirstOrDefaultAsync(n => n.Id == nodeId && n.LearningPathId == id);
            if (node == null)
                return NotFound(new { error = "NODE_NOT_FOUND", message = "Không tìm thấy node trong lộ trình." });

            var progress = await _dbContext.Set<UserNodeProgress>()
                .FirstOrDefaultAsync(p => p.UserId == userId && p.NodeId == nodeId);
            var alreadyPassed = progress?.Status == UserNodeProgress.StatusPassed;

            if (!alreadyPassed && !await IsNodeOpenForUserAsync(userId, node))
            {
                return StatusCode(403, new
                {
                    error = "NODE_LOCKED",
                    message = "Node này chưa được mở khóa. Hãy hoàn thành node trước trong lộ trình."
                });
            }

            var now = DateTime.UtcNow;
            var stars = request?.Stars ?? 0;
            var nodeScore = request?.NodeScore;

            var user = await _dbContext.Users.FindAsync(userId);
            if (user == null)
                return NotFound(new { error = "USER_NOT_FOUND", message = "Không tìm thấy người dùng." });

            var firstPass = false;
            if (progress == null)
            {
                progress = new UserNodeProgress(userId, nodeId, UserNodeProgress.StatusPassed, stars, nodeScore, now);
                _dbContext.Set<UserNodeProgress>().Add(progress);
                firstPass = true;
            }
            else if (!alreadyPassed)
            {
                progress.MarkPassed(stars, nodeScore);
                firstPass = true;
            }

            if (firstPass)
            {
                user.AwardXP(PassNodeXpReward);
                user.RecordActivity();
            }

            // Mở khóa node kế (OrderIndex + 1) nếu có.
            var nextNode = await _dbContext.Set<LearningPathNode>()
                .AsNoTracking()
                .FirstOrDefaultAsync(n => n.LearningPathId == id && n.OrderIndex == node.OrderIndex + 1);
            if (nextNode != null)
            {
                var nextProgress = await _dbContext.Set<UserNodeProgress>()
                    .FirstOrDefaultAsync(p => p.UserId == userId && p.NodeId == nextNode.Id);
                if (nextProgress == null)
                {
                    _dbContext.Set<UserNodeProgress>().Add(
                        new UserNodeProgress(userId, nextNode.Id, UserNodeProgress.StatusOpen, 0, null, now));
                }
                else
                {
                    nextProgress.Open();
                }
            }

            await _dbContext.SaveChangesAsync();

            return Ok(new
            {
                message = alreadyPassed ? "Node này đã hoàn thành trước đó." : "Đã hoàn thành node!",
                nodeId,
                status = UserNodeProgress.StatusPassed,
                stars = progress.Stars,
                nodeScore = progress.NodeScore,
                passedAt = progress.PassedAt,
                nextNodeUnlocked = nextNode?.Id,
                xpAwarded = firstPass ? PassNodeXpReward : 0,
                totalXp = user.TotalXP
            });
        }

        // ── Helpers ──

        /// <summary>
        /// Trừ tim ATOMIC kết hợp claim session (unique UserId+NodeId).
        ///
        /// Vì sao đúng khi 2 request song song cùng vào 1 node:
        /// 1. Transaction giữ write-lock SQLite từ lúc regen/claim tới COMMIT → 2 request serialize.
        /// 2. Session được claim TRƯỚC (INSERT hoặc conditional renew `WHERE ExpiresAt &lt;= now`):
        ///    request đến sau gặp unique constraint / 0 rows affected → trả `Resumed`, KHÔNG trừ tim.
        /// 3. Trừ tim bằng UPDATE có điều kiện `WHERE Hearts &gt; 0` rồi kiểm tra rows affected;
        ///    0 rows → rollback claim → HEARTS_EMPTY.
        /// </summary>
        private async Task<ClaimResult> ClaimSessionAndDeductHeartAsync(Guid userId, Guid nodeId, DateTime now)
        {
            await using var tx = await _dbContext.Database.BeginTransactionAsync();

            // Hồi tim theo giờ SERVER (dùng domain method — provider-agnostic) trong cùng transaction.
            var user = await _dbContext.Users.FindAsync(userId);
            if (user == null)
            {
                await tx.RollbackAsync();
                return new ClaimResult(false, false, now.AddMinutes(SessionDurationMinutes), UserNotFound: true);
            }
            user.RegenHearts(now);
            await _dbContext.SaveChangesAsync();

            var session = await _dbContext.Set<NodeSession>()
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.UserId == userId && s.NodeId == nodeId);

            // Session còn hạn → resume, không đụng gì thêm.
            if (session != null && session.ExpiresAt > now)
            {
                await tx.CommitAsync();
                return new ClaimResult(Resumed: true, HeartsEmpty: false, ExpiresAt: session.ExpiresAt, UserNotFound: false);
            }

            var expiresAt = now.AddMinutes(SessionDurationMinutes);

            if (session == null)
            {
                // Claim mới — unique (UserId, NodeId) là hàng rào chống race.
                var newSession = new NodeSession(userId, nodeId, now, expiresAt);
                _dbContext.Set<NodeSession>().Add(newSession);
                await _dbContext.SaveChangesAsync();
            }
            else
            {
                // Session đã hết hạn — gia hạn CÓ ĐIỀU KIỆN (chỉ renew nếu vẫn còn hết hạn).
                var renewed = await _dbContext.Set<NodeSession>()
                    .Where(s => s.Id == session.Id && s.ExpiresAt <= now)
                    .ExecuteUpdateAsync(s => s
                        .SetProperty(x => x.StartedAt, now)
                        .SetProperty(x => x.ExpiresAt, expiresAt));
                if (renewed == 0)
                {
                    // Request khác đã renew trước → coi như resume, không trừ tim.
                    await tx.CommitAsync();
                    return new ClaimResult(Resumed: true, HeartsEmpty: false, ExpiresAt: expiresAt, UserNotFound: false);
                }
            }

            // Trừ 1 tim ATOMIC: UPDATE ... WHERE Hearts > 0 rồi kiểm tra rows affected.
            var deducted = await _dbContext.Users
                .Where(u => u.Id == userId && u.Hearts > 0)
                .ExecuteUpdateAsync(s => s
                    .SetProperty(u => u.Hearts, u => u.Hearts - 1)
                    .SetProperty(u => u.LastHeartAt, now));

            if (deducted == 0)
            {
                // Hết tim → rollback để hủy claim session vừa tạo/renew.
                await tx.RollbackAsync();
                return new ClaimResult(Resumed: false, HeartsEmpty: true, ExpiresAt: expiresAt, UserNotFound: false);
            }

            await tx.CommitAsync();
            return new ClaimResult(Resumed: false, HeartsEmpty: false, ExpiresAt: expiresAt, UserNotFound: false);
        }

        private async Task<(int Hearts, int HeartsMax)> ReadHeartsAsync(Guid userId)
        {
            var row = await _dbContext.Users
                .AsNoTracking()
                .Where(u => u.Id == userId)
                .Select(u => new { u.Hearts, u.HeartsMax })
                .FirstAsync();
            return (row.Hearts, row.HeartsMax);
        }

        private static DateTime? NextHeartAt(User userEntity, DateTime now)
        {
            if (userEntity.Hearts >= userEntity.HeartsMax) return null;
            if (!userEntity.LastHeartAt.HasValue) return now;
            return userEntity.LastHeartAt.Value.AddMinutes(VisualizationDSA.Domain.Entities.User.HeartRegenIntervalMinutes);
        }

        private static object BuildEnterResponse(int hearts, int heartsMax, DateTime expiresAt, bool resumed)
        {
            return new
            {
                message = resumed ? "Bạn đang trong phiên học còn hiệu lực." : "Đã vào node — 1 Tim đã được sử dụng.",
                resumed,
                hearts,
                heartsMax,
                session = new { startedAt = expiresAt.AddMinutes(-SessionDurationMinutes), expiresAt }
            };
        }

        private async Task<bool> IsNodeOpenForUserAsync(Guid userId, LearningPathNode node)
        {
            var previous = await _dbContext.Set<LearningPathNode>()
                .AsNoTracking()
                .Where(n => n.LearningPathId == node.LearningPathId && n.OrderIndex == node.OrderIndex - 1)
                .Select(n => (Guid?)n.Id)
                .FirstOrDefaultAsync();

            // Node đầu tiên của lộ trình luôn mở.
            if (!previous.HasValue) return true;

            // Node trước đã pass → mở.
            var previousPassed = await _dbContext.Set<UserNodeProgress>()
                .AsNoTracking()
                .AnyAsync(p => p.UserId == userId && p.NodeId == previous.Value && p.Status == UserNodeProgress.StatusPassed);
            if (previousPassed) return true;

            // Node này đã pass → cho phép vào lại ôn tập.
            return await HasPassedNodeAsync(userId, node.Id);
        }

        private async Task<bool> HasPassedNodeAsync(Guid userId, Guid nodeId)
        {
            return await _dbContext.Set<UserNodeProgress>()
                .AsNoTracking()
                .AnyAsync(p => p.UserId == userId && p.NodeId == nodeId && p.Status == UserNodeProgress.StatusPassed);
        }

        private static int ResolveNodeStatus(
            List<LearningPathNode> orderedNodes,
            int index,
            Dictionary<Guid, UserNodeProgress> progresses,
            Guid nodeId)
        {
            if (progresses.TryGetValue(nodeId, out var progress) && progress.Status == UserNodeProgress.StatusPassed)
                return UserNodeProgress.StatusPassed;

            if (index == 0) return UserNodeProgress.StatusOpen;

            var prevId = orderedNodes[index - 1].Id;
            if (progresses.TryGetValue(prevId, out var prev) && prev.Status == UserNodeProgress.StatusPassed)
                return UserNodeProgress.StatusOpen;

            return UserNodeProgress.StatusLocked;
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

        private sealed record ClaimResult(bool Resumed, bool HeartsEmpty, DateTime ExpiresAt, bool UserNotFound);
    }

    /// <summary>Payload tùy chọn cho pass node — stars (0-3) và điểm node (có thể null).</summary>
    public class PassNodeRequest
    {
        public int Stars { get; set; }
        public int? NodeScore { get; set; }
    }
}
