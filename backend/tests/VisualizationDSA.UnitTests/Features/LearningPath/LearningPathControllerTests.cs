using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text.Json;
using System.Threading.Tasks;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Infrastructure.Data;
using VisualizationDSA.UnitTests.Common;
using VisualizationDSA.WebApi.Controllers;
using Xunit;

namespace VisualizationDSA.UnitTests.Features.LearningPathFeature
{
    /// <summary>
    /// F9 (FR-2.10, FR-10.1) — Learning Path + Tim.
    /// Kiểm tra trừ Tim atomic + session 30 phút + mở khóa node kế + chặn node chưa mở.
    /// </summary>
    public class LearningPathControllerTests : IAsyncLifetime
    {
        private readonly F9LearningPathTestDbContext _db;
        private readonly Guid _userId = Guid.Parse("00000000-0000-0000-0000-0000000000f9");
        private readonly Guid _pathId = Guid.Parse("00000000-0000-0000-0000-000000000f91");
        private readonly Guid _lesson1Id = Guid.Parse("00000000-0000-0000-0000-000000000f92");
        private readonly Guid _lesson2Id = Guid.Parse("00000000-0000-0000-0000-000000000f93");
        private Guid _node1Id;
        private Guid _node2Id;

        public LearningPathControllerTests()
        {
            TestJwtBuilder.EnsureConfigured();
            var (db, _) = F9LearningPathTestDbContext.Create();
            _db = db;
        }

        public Task InitializeAsync() => Task.CompletedTask;

        public async Task DisposeAsync()
        {
            await _db.DisposeAsync();
        }

        private LearningPathController CreateController(ApplicationDbContext context)
        {
            var controller = new LearningPathController(context);
            var httpContext = new DefaultHttpContext();
            httpContext.Request.Headers["Authorization"] = $"Bearer {TestJwtBuilder.BuildToken(_userId.ToString(), "Student")}";
            controller.ControllerContext = new ControllerContext { HttpContext = httpContext };
            return controller;
        }

        private async Task SeedPathAsync(F9LearningPathTestDbContext? db = null)
        {
            var ctx = db ?? _db;
            var user = TestUserFactory.CreateStudent(_userId, "f9@test.com");
            ctx.Users.Add(user);

            var path = new LearningPath("Lộ trình DSA cơ bản", "Học tuần tự các chủ đề DSA.");
            var pathIdProp = typeof(LearningPath).GetProperty("Id", BindingFlags.Public | BindingFlags.Instance);
            pathIdProp!.SetValue(path, _pathId);
            ctx.Set<LearningPath>().Add(path);

            var node1 = new LearningPathNode(_pathId, 1, "Node 1 — Mảng", _lesson1Id);
            var node2 = new LearningPathNode(_pathId, 2, "Node 2 — Danh sách liên kết", _lesson2Id);
            var nodeIdProp = typeof(LearningPathNode).GetProperty("Id", BindingFlags.Public | BindingFlags.Instance);
            nodeIdProp!.SetValue(node1, Guid.Parse("00000000-0000-0000-0000-000000000f94"));
            nodeIdProp!.SetValue(node2, Guid.Parse("00000000-0000-0000-0000-000000000f95"));
            _node1Id = (Guid)nodeIdProp.GetValue(node1)!;
            _node2Id = (Guid)nodeIdProp.GetValue(node2)!;
            ctx.Set<LearningPathNode>().AddRange(node1, node2);

            var lesson1 = new Lesson("Bài học mảng", "# Mảng", "dsa", "{}", 50);
            var lesson2 = new Lesson("Bài học danh sách liên kết", "# DSLK", "dsa", "{}", 50);
            var lessonIdProp = typeof(Lesson).GetProperty("Id", BindingFlags.Public | BindingFlags.Instance);
            lessonIdProp!.SetValue(lesson1, _lesson1Id);
            lessonIdProp!.SetValue(lesson2, _lesson2Id);
            ctx.Lessons.AddRange(lesson1, lesson2);

            await ctx.SaveChangesAsync();
        }

        private static void SetUserHearts(ApplicationDbContext ctx, Guid userId, int hearts, DateTime? lastHeartAt = null)
        {
            var user = ctx.Users.Single(u => u.Id == userId);
            var heartsProp = typeof(User).GetProperty("Hearts", BindingFlags.Public | BindingFlags.Instance);
            var heartsMaxProp = typeof(User).GetProperty("HeartsMax", BindingFlags.Public | BindingFlags.Instance);
            var lastProp = typeof(User).GetProperty("LastHeartAt", BindingFlags.Public | BindingFlags.Instance);
            heartsProp!.SetValue(user, hearts);
            heartsMaxProp!.SetValue(user, 10);
            lastProp!.SetValue(user, lastHeartAt ?? DateTime.UtcNow);
            ctx.SaveChanges();
        }

        private static JsonElement JsonValue(object? value)
            => JsonDocument.Parse(JsonSerializer.Serialize(value)).RootElement;

        [Fact]
        public async Task EnterFirstNode_DeductsOneHeart_AndCreatesSession()
        {
            await SeedPathAsync();
            var controller = CreateController(_db);

            var result = await controller.EnterNode(_pathId, _node1Id);

            var ok = result.Should().BeOfType<OkObjectResult>().Subject;
            var body = JsonValue(ok.Value);
            body.GetProperty("resumed").GetBoolean().Should().Be(false);
            body.GetProperty("hearts").GetInt32().Should().Be(9);

            _db.Users.AsNoTracking().Single(u => u.Id == _userId).Hearts.Should().Be(9);
            (await _db.Set<NodeSession>().CountAsync(s => s.UserId == _userId && s.NodeId == _node1Id)).Should().Be(1);
        }

        [Fact]
        public async Task EnterSecondTimeWithinSession_DoesNotDeductAgain()
        {
            await SeedPathAsync();
            var controller = CreateController(_db);

            await controller.EnterNode(_pathId, _node1Id);
            var second = await controller.EnterNode(_pathId, _node1Id);

            var ok = second.Should().BeOfType<OkObjectResult>().Subject;
            JsonValue(ok.Value).GetProperty("resumed").GetBoolean().Should().Be(true);
            _db.Users.AsNoTracking().Single(u => u.Id == _userId).Hearts.Should().Be(9);
            (await _db.Set<NodeSession>().CountAsync(s => s.UserId == _userId && s.NodeId == _node1Id)).Should().Be(1);
        }

        [Fact]
        public async Task EnterParallel_TwoConnections_OnlyOneHeartDeducted()
        {
            var dbName = $"f9-race-{Guid.NewGuid():N}";
            var connectionString = $"Data Source={dbName};Mode=Memory;Cache=Shared";
            using var connA = new SqliteConnection(connectionString);
            using var connB = new SqliteConnection(connectionString);
            connA.Open();
            connB.Open();
            foreach (var c in new[] { connA, connB })
            {
                using var cmd = c.CreateCommand();
                cmd.CommandText = "PRAGMA busy_timeout = 30000;";
                cmd.ExecuteNonQuery();
            }

            var optionsA = new DbContextOptionsBuilder<ApplicationDbContext>().UseSqlite(connA).Options;
            var optionsB = new DbContextOptionsBuilder<ApplicationDbContext>().UseSqlite(connB).Options;
            var ctxA = new F9LearningPathTestDbContext(optionsA);
            var ctxB = new F9LearningPathTestDbContext(optionsB);
            ctxA.Database.EnsureCreated();

            // Seed qua ctxA.
            await SeedPathAsync(ctxA);

            var controllerA = CreateController(ctxA);
            var controllerB = CreateController(ctxB);

            var responses = await Task.WhenAll(
                controllerA.EnterNode(_pathId, _node1Id),
                controllerB.EnterNode(_pathId, _node1Id));

            responses.Should().OnlyContain(r => r is OkObjectResult);
            ctxA.Users.AsNoTracking().Single(u => u.Id == _userId).Hearts.Should().Be(9);
            (await ctxA.Set<NodeSession>().CountAsync(s => s.UserId == _userId && s.NodeId == _node1Id)).Should().Be(1);
        }

        [Fact]
        public async Task EnterWhenHeartsEmpty_ReturnsHeartsEmpty()
        {
            await SeedPathAsync();
            SetUserHearts(_db, _userId, 0, DateTime.UtcNow.AddMinutes(-1));
            var controller = CreateController(_db);

            var result = await controller.EnterNode(_pathId, _node1Id);

            var status = result.Should().BeOfType<ObjectResult>().Subject;
            status.StatusCode.Should().Be(403);
            JsonValue(status.Value).GetProperty("error").GetString().Should().Be("HEARTS_EMPTY");
            (await _db.Set<NodeSession>().CountAsync(s => s.UserId == _userId && s.NodeId == _node1Id)).Should().Be(0);
        }

        [Fact]
        public async Task PassNode_UnlocksNextNode()
        {
            await SeedPathAsync();
            var controller = CreateController(_db);

            var result = await controller.PassNode(_pathId, _node1Id, new PassNodeRequest { Stars = 3, NodeScore = 100 });

            result.Should().BeOfType<OkObjectResult>();
            var progress1 = await _db.Set<UserNodeProgress>()
                .SingleAsync(p => p.UserId == _userId && p.NodeId == _node1Id);
            progress1.Status.Should().Be(UserNodeProgress.StatusPassed);
            progress1.Stars.Should().Be(3);

            var progress2 = await _db.Set<UserNodeProgress>()
                .SingleAsync(p => p.UserId == _userId && p.NodeId == _node2Id);
            progress2.Status.Should().Be(UserNodeProgress.StatusOpen);
        }

        [Fact]
        public async Task EnterLockedNode_ReturnsNodeLocked()
        {
            await SeedPathAsync();
            var controller = CreateController(_db);

            var result = await controller.EnterNode(_pathId, _node2Id);

            var status = result.Should().BeOfType<ObjectResult>().Subject;
            status.StatusCode.Should().Be(403);
            JsonValue(status.Value).GetProperty("error").GetString().Should().Be("NODE_LOCKED");
        }

        [Fact]
        public async Task EnterPassedNode_DoesNotDeductHeart()
        {
            await SeedPathAsync();
            var controller = CreateController(_db);

            // Pass node 1 trước (mở khóa node 2) rồi vào lại node 1 — ôn tập không mất Tim.
            await controller.PassNode(_pathId, _node1Id, new PassNodeRequest { Stars = 3, NodeScore = 100 });
            var result = await controller.EnterNode(_pathId, _node1Id);

            var ok = result.Should().BeOfType<OkObjectResult>().Subject;
            JsonValue(ok.Value).GetProperty("resumed").GetBoolean().Should().Be(true);
            _db.Users.AsNoTracking().Single(u => u.Id == _userId).Hearts.Should().Be(10);
        }
    }
}
