using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Moq;
using System;
using System.Linq;
using System.Threading.Tasks;
using VisualizationDSA.Domain.Engine;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Strategies;
using VisualizationDSA.UnitTests.Common;
using VisualizationDSA.WebApi.Controllers;
using Xunit;

namespace VisualizationDSA.UnitTests.Services
{
    /// <summary>
    /// GM-005t + GM-011 + GM-046: spec StatelessGamificationController —
    /// award-xp idempotent theo Idempotency-Key (bấm 2 lần không double-award), hạn mức XP/ngày
    /// (429), profile RIÊNG theo user (DB-first), streak cập nhật thật (GM-016).
    /// </summary>
    [Collection("AdminControllerTests")]
    public class StatelessGamificationControllerTests
    {
        static StatelessGamificationControllerTests()
        {
            TestJwtBuilder.EnsureConfigured();
        }

        private sealed class Harness : IDisposable
        {
            public TestSqliteDbContext Db { get; }
            public GamificationStrategy Strategy { get; }
            public StatelessGamificationController Controller { get; }

            public Harness()
            {
                (Db, _) = TestSqliteDbContext.Create();
                Strategy = new GamificationStrategy();
                Controller = new StatelessGamificationController(
                    Strategy, Db, new MemoryCache(new MemoryCacheOptions()));
                Controller.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() };
            }

            public void SetToken(string sub, string role = "Teacher")
            {
                Controller.Request.Headers["Authorization"] = $"Bearer {TestJwtBuilder.BuildToken(sub, role)}";
            }

            public void SetIdempotencyKey(string key)
            {
                Controller.Request.Headers["Idempotency-Key"] = key;
            }

            public void Dispose() => Db.Dispose();
        }

        private static User CreateDbUser(TestSqliteDbContext db, string email, string role = "Teacher")
        {
            var user = new User(email, email.Split('@')[0], "hashed");
            user.SetRole(role);
            db.Users.Add(user);
            db.SaveChanges();
            return user;
        }

        [Fact]
        public async Task AwardXp_InvalidAmount_Returns400()
        {
            using var h = new Harness();
            h.SetToken(Guid.NewGuid().ToString());

            var result = await h.Controller.AwardXp(new AwardXpRequest { Amount = 0, Reason = "khen thưởng" });
            var bad = result.Should().BeOfType<BadRequestObjectResult>().Subject;
            bad.Value!.ToString()!.Contains("INVALID_AMOUNT").Should().BeTrue();
        }

        [Fact]
        public async Task AwardXp_ValidAward_PersistsDbAndUpdatesStreak()
        {
            using var h = new Harness();
            var user = CreateDbUser(h.Db, "teacher@test.dev", "Teacher");
            h.SetToken(user.Id.ToString());

            var result = await h.Controller.AwardXp(new AwardXpRequest { Amount = 100, Reason = "Khen thưởng lớp" });
            var ok = result.Should().BeOfType<OkObjectResult>().Subject;
            var profile = ok.Value.Should().BeOfType<StatelessUserProfile>().Subject;

            profile.UserId.Should().Be(user.Id.ToString());
            profile.TotalXp.Should().Be(100);
            profile.CurrentLevel.Should().Be(2);
            profile.StreakDays.Should().Be(1, "GM-016: award phải cập nhật streak (hôm nay = ngày đầu)");
            profile.LastActiveDate.Should().NotBeNullOrEmpty();

            // DB-first: XP + streak thật phải được lưu vào DB.
            var dbUser = h.Db.Users.Single(u => u.Id == user.Id);
            dbUser.TotalXP.Should().Be(100);
            dbUser.StreakDays.Should().Be(1);
            dbUser.LastActivityDate.Should().NotBeNull();
        }

        [Fact]
        public async Task AwardXp_SameIdempotencyKey_NoDoubleAward()
        {
            using var h = new Harness();
            var user = CreateDbUser(h.Db, "teacher2@test.dev", "Teacher");
            h.SetToken(user.Id.ToString());
            h.SetIdempotencyKey("award-1");

            var request = new AwardXpRequest { Amount = 100, Reason = "Khen thưởng" };

            var first = await h.Controller.AwardXp(request);
            first.Should().BeOfType<OkObjectResult>();

            var second = await h.Controller.AwardXp(request);
            second.Should().BeOfType<OkObjectResult>();
            var replay = ((OkObjectResult)second).Value.Should().BeOfType<StatelessUserProfile>().Subject;

            // Replay trả đúng trạng thái lần đầu — XP không cộng gấp đôi.
            replay.TotalXp.Should().Be(100);
            h.Db.Users.Single(u => u.Id == user.Id).TotalXP.Should().Be(100);
        }

        [Fact]
        public async Task AwardXp_DifferentIdempotencyKeys_AwardedTwice()
        {
            using var h = new Harness();
            var user = CreateDbUser(h.Db, "teacher3@test.dev", "Teacher");
            h.SetToken(user.Id.ToString());

            var request = new AwardXpRequest { Amount = 50, Reason = "Khen thưởng" };

            h.SetIdempotencyKey("k-1");
            (await h.Controller.AwardXp(request)).Should().BeOfType<OkObjectResult>();
            h.SetIdempotencyKey("k-2");
            (await h.Controller.AwardXp(request)).Should().BeOfType<OkObjectResult>();

            h.Db.Users.Single(u => u.Id == user.Id).TotalXP.Should().Be(100);
        }

        [Fact]
        public async Task AwardXp_DailyCapExceeded_Returns429()
        {
            using var h = new Harness();
            var user = CreateDbUser(h.Db, "teacher4@test.dev", "Teacher");
            h.SetToken(user.Id.ToString());

            // 500 = hạn mức/ngày — call đầu tiên OK (total = 500), call thứ 2 vượt cap → 429.
            var request = new AwardXpRequest { Amount = 500, Reason = "Khen thưởng" };
            (await h.Controller.AwardXp(request)).Should().BeOfType<OkObjectResult>();

            var blocked = await h.Controller.AwardXp(new AwardXpRequest { Amount = 50, Reason = "Khen thưởng" });
            var obj = blocked.Should().BeOfType<ObjectResult>().Subject;
            obj.StatusCode.Should().Be(429);

            h.Db.Users.Single(u => u.Id == user.Id).TotalXP.Should().Be(500, "call vượt cap không được cộng XP");
        }

        [Fact]
        public async Task AwardXp_NoToken_Returns401()
        {
            using var h = new Harness();
            // Không set token → 401 thay vì 500.
            var result = await h.Controller.AwardXp(new AwardXpRequest { Amount = 10, Reason = "Khen thưởng" });
            result.Should().BeOfType<UnauthorizedObjectResult>();
        }

        [Fact]
        public async Task GetProfile_IsolationPerUser()
        {
            using var h = new Harness();
            var teacherA = CreateDbUser(h.Db, "ta@test.dev", "Teacher");
            var teacherB = CreateDbUser(h.Db, "tb@test.dev", "Teacher");

            // GM-011: trạng thái RIÊNG theo user — award user A không ảnh hưởng user B.
            h.SetToken(teacherA.Id.ToString());
            await h.Controller.AwardXp(new AwardXpRequest { Amount = 200, Reason = "Khen thưởng" });

            h.SetToken(teacherB.Id.ToString());
            var profileB = await h.Controller.GetProfile();
            var ok = profileB.Should().BeOfType<OkObjectResult>().Subject;
            var userB = ok.Value.Should().BeOfType<StatelessUserProfile>().Subject;

            userB.TotalXp.Should().Be(0, "user B phải độc lập với user A");
            userB.UserId.Should().Be(teacherB.Id.ToString());
        }

        [Fact]
        public async Task GetProfile_DbFirst_ReflectsDbValues()
        {
            using var h = new Harness();
            var user = CreateDbUser(h.Db, "db-first@test.dev", "Teacher");
            user.AwardXP(250);
            user.RecordActivity();
            h.Db.SaveChanges();

            h.SetToken(user.Id.ToString());
            var result = await h.Controller.GetProfile();
            var ok = result.Should().BeOfType<OkObjectResult>().Subject;
            var profile = ok.Value.Should().BeOfType<StatelessUserProfile>().Subject;

            // DB-first (GM-011): số liệu phải đúng với DB, không phải profile demo dùng chung.
            profile.TotalXp.Should().Be(250);
            profile.CurrentLevel.Should().Be(2);
            profile.StreakDays.Should().Be(1);
            profile.LastActiveDate.Should().NotBeNullOrEmpty();
        }

        [Fact]
        public async Task GetBadges_ReturnsFullCatalog_WithUnlockStatusPerUser()
        {
            using var h = new Harness();
            var user = CreateDbUser(h.Db, "badges@test.dev", "Teacher");
            h.SetToken(user.Id.ToString());

            await h.Controller.AwardXp(new AwardXpRequest { Amount = 50, Reason = "Khen thưởng" });

            var result = h.Controller.GetBadges();
            var ok = result.Should().BeOfType<OkObjectResult>().Subject;
            var badges = ((IEnumerable<StatelessBadgeDto>)ok.Value!).ToList();

            badges!.Count.Should().Be(8, "phải trả đủ 8 huy hiệu (mở + khóa) — GM-009");
            badges.Single(b => b.Id == "first-steps").EarnedAt.Should().NotBeNullOrEmpty();
            badges.Single(b => b.Id == "dsa-champion").EarnedAt.Should().BeEmpty();
        }
    }
}
