using System;
using System.Collections.Generic;
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
    /// F7 (FR-6.2) — Cấu hình hệ thống: GET/PUT (Admin) + cache in-memory hit sau PUT.
    /// </summary>
    public class SettingsControllerTests
    {
        static SettingsControllerTests()
        {
            TestJwtBuilder.EnsureConfigured();
        }

        private static (SettingsController Controller, F567TestDbContext Db) Create(Guid? userId = null, string role = "Admin")
        {
            var (db, _) = F567TestDbContext.Create();
            var controller = new SettingsController(db);
            SetUser(controller, userId ?? Guid.NewGuid(), role);
            return (controller, db);
        }

        private static void SetUser(SettingsController controller, Guid userId, string role)
        {
            var httpContext = new DefaultHttpContext();
            httpContext.Request.Headers["Authorization"] = $"Bearer {TestJwtBuilder.BuildToken(userId.ToString(), role)}";
            controller.ControllerContext = new ControllerContext { HttpContext = httpContext };
        }

        private static List<string> ParseKeys(IActionResult result)
        {
            var ok = result.Should().BeOfType<OkObjectResult>().Subject;
            using var doc = JsonDocument.Parse(JsonSerializer.Serialize(ok.Value, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }));
            return doc.RootElement.EnumerateArray().Select(e => e.GetProperty("key").GetString()!).ToList();
        }

        [Fact]
        public async Task GetSettings_ReturnsSeededValues()
        {
            SettingsController.ClearCache();
            var (controller, db) = Create();
            db.Set<SystemSetting>().AddRange(
                new SystemSetting("AllowRegistration", "true", "Cho phép đăng ký"),
                new SystemSetting("MaintenanceMode", "false", "Bảo trì hệ thống"));
            db.SaveChanges();

            var result = await controller.GetSettings();
            var ok = result.Should().BeOfType<OkObjectResult>().Subject;
            using var doc = JsonDocument.Parse(JsonSerializer.Serialize(ok.Value, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }));
            var keys = doc.RootElement.EnumerateArray().Select(e => e.GetProperty("key").GetString()).ToList();
            keys.Should().Contain(new[] { "AllowRegistration", "MaintenanceMode" });
        }

        [Fact]
        public async Task Put_ThenGet_ReturnsUpdatedValue_CacheHit()
        {
            SettingsController.ClearCache();
            var (controller, db) = Create();
            db.Set<SystemSetting>().Add(new SystemSetting("Theme", "light"));
            db.SaveChanges();

            var put = await controller.UpdateSettings(new List<UpdateSettingDto>
            {
                new UpdateSettingDto("Theme", "dark")
            });
            put.Should().BeOfType<OkObjectResult>();

            // Xóa khỏi DB để chứng minh GET lấy từ cache in-memory (cache hit).
            var existing = await db.Set<SystemSetting>().FindAsync("Theme");
            db.Set<SystemSetting>().Remove(existing!);
            await db.SaveChangesAsync();

            var get = await controller.GetSettings();
            var ok = get.Should().BeOfType<OkObjectResult>().Subject;
            using var doc = JsonDocument.Parse(JsonSerializer.Serialize(ok.Value, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }));
            var item = doc.RootElement.EnumerateArray().Single(e => e.GetProperty("key").GetString() == "Theme");
            item.GetProperty("value").GetString().Should().Be("dark");
        }

        [Fact]
        public async Task Put_CreatesMissingSetting()
        {
            SettingsController.ClearCache();
            var (controller, db) = Create();

            var result = await controller.UpdateSettings(new List<UpdateSettingDto>
            {
                new UpdateSettingDto("NewKey", "new-value")
            });

            result.Should().BeOfType<OkObjectResult>();
            db.Set<SystemSetting>().Single(s => s.Key == "NewKey").Value.Should().Be("new-value");
        }
    }
}
