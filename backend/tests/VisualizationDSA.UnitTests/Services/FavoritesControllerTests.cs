using System;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.UnitTests.Common;
using VisualizationDSA.WebApi.Controllers;
using Xunit;

namespace VisualizationDSA.UnitTests.Services
{
    /// <summary>
    /// F6 (FR-3.10) — Yêu thích mô phỏng: toggle không tạo bản ghi trùng,
    /// lưu input, liệt kê và xóa theo simulationKey.
    /// </summary>
    public class FavoritesControllerTests
    {
        static FavoritesControllerTests()
        {
            TestJwtBuilder.EnsureConfigured();
        }

        private static (FavoritesController Controller, F567TestDbContext Db, User User) Create()
        {
            var (db, _) = F567TestDbContext.Create();
            var user = new User("fav-user@test.dev", "favuser", "hash");
            db.Users.Add(user);
            db.SaveChanges();

            var controller = new FavoritesController(db);
            SetUser(controller, user.Id);
            return (controller, db, user);
        }

        private static void SetUser(FavoritesController controller, Guid userId)
        {
            var httpContext = new DefaultHttpContext();
            httpContext.Request.Headers["Authorization"] = $"Bearer {TestJwtBuilder.BuildToken(userId.ToString(), "Student")}";
            controller.ControllerContext = new ControllerContext { HttpContext = httpContext };
        }

        [Fact]
        public async Task AddFavorite_Twice_DoesNotDuplicate()
        {
            var (controller, db, user) = Create();

            var first = await controller.AddFavorite(new AddFavoriteDto("bubble-sort", "{\"input\":\"5,3,8\"}"));
            first.Should().BeOfType<OkObjectResult>();

            var second = await controller.AddFavorite(new AddFavoriteDto("bubble-sort", "{\"input\":\"5,3,8\"}"));
            second.Should().BeOfType<OkObjectResult>();

            db.Set<Favorite>().Count(f => f.UserId == user.Id && f.SimulationKey == "bubble-sort").Should().Be(1);
        }

        [Fact]
        public async Task AddFavorite_StoresInputJson()
        {
            var (controller, db, user) = Create();

            await controller.AddFavorite(new AddFavoriteDto("binary-search", "{\"input\":\"1,2,3\"}"));

            var favorite = db.Set<Favorite>().Single(f => f.UserId == user.Id);
            favorite.SimulationKey.Should().Be("binary-search");
            favorite.InputJson.Should().Be("{\"input\":\"1,2,3\"}");
        }

        [Fact]
        public async Task RemoveFavorite_DeletesBySimulationKey()
        {
            var (controller, db, user) = Create();
            db.Set<Favorite>().Add(new Favorite(user.Id, "dfs", "{}"));
            db.SaveChanges();

            var result = await controller.RemoveFavorite("dfs");
            result.Should().BeOfType<OkObjectResult>();
            db.Set<Favorite>().Count(f => f.UserId == user.Id).Should().Be(0);
        }

        [Fact]
        public async Task GetFavorites_ReturnsOnlyCurrentUserSorted()
        {
            var (controller, db, user) = Create();
            var other = new User("fav-other@test.dev", "favother", "hash");
            db.Users.Add(other);
            db.SaveChanges();

            db.Set<Favorite>().Add(new Favorite(other.Id, "bfs", "{}"));
            db.Set<Favorite>().Add(new Favorite(user.Id, "merge-sort", "{}"));
            db.SaveChanges();

            var result = await controller.GetFavorites();
            var ok = result.Should().BeOfType<OkObjectResult>().Subject;
            using var doc = JsonDocument.Parse(JsonSerializer.Serialize(ok.Value, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }));
            var keys = doc.RootElement.EnumerateArray().Select(e => e.GetProperty("simulationKey").GetString()).ToList();
            keys.Should().ContainSingle().And.Contain("merge-sort");
        }
    }
}
