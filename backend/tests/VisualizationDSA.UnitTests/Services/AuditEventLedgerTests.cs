using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using VisualizationDSA.Application.Services;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Infrastructure.Data;
using VisualizationDSA.Infrastructure.Interceptors;
using VisualizationDSA.Infrastructure.Services;
using VisualizationDSA.UnitTests.Common;
using VisualizationDSA.WebApi.Filters;
using Xunit;

namespace VisualizationDSA.UnitTests.Services
{
    
    
    
    
    
    public class AuditEventLedgerTests
    {
        private static ApplicationDbContext NewContext(bool withImmutableGuard = false)
        {
            var builder = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString());
            if (withImmutableGuard)
                builder.AddInterceptors(new ImmutableAuditInterceptor());
            return new ApplicationDbContext(builder.Options);
        }
        /// <summary>AD-008: AuditEventService giờ dùng IDbContextFactory — mỗi lần ghi tạo context RIÊNG (không dùng chung ChangeTracker).</summary>
        private static (AuditEventService Service, Func<ApplicationDbContext> Open) NewServiceAndDb()
        {
            var dbName = Guid.NewGuid().ToString();
            ApplicationDbContext Open() => new(new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(dbName)
                .Options);
            var service = new AuditEventService(new TestDbContextFactoryShim(Open));
            return (service, Open);
        }

        private sealed class TestDbContextFactoryShim : IDbContextFactory<ApplicationDbContext>
        {
            private readonly Func<ApplicationDbContext> _factory;
            public TestDbContextFactoryShim(Func<ApplicationDbContext> factory) => _factory = factory;
            public ApplicationDbContext CreateDbContext() => _factory();
            public Task<ApplicationDbContext> CreateDbContextAsync(CancellationToken cancellationToken = default)
                => Task.FromResult(_factory());
        }

        [Fact]
        public async Task AppendAsync_ShouldPersistImmutableFrame()
        {
            var (service, open) = NewServiceAndDb();

            await service.AppendAsync(new AuditEventInput
            {
                EventType  = "ApiInteraction:Concepts.GetSemanticGraph",
                HttpMethod = "GET",
                Path       = "/api/v1/concepts/analytics/semantic-graph",
                StatusCode = 200,
                Payload    = "{\"route\":{\"action\":\"GetSemanticGraph\"}}",
            });

            using var db = open();
            var frame = db.SystemAuditEventStreams.Single();
            frame.EventType.Should().Be("ApiInteraction:Concepts.GetSemanticGraph");
            frame.HttpMethod.Should().Be("GET");
            frame.StatusCode.Should().Be(200);
            frame.Payload.Should().Contain("GetSemanticGraph");
            frame.Sequence.Should().BeGreaterThan(0);
            frame.OccurredAt.Kind.Should().Be(DateTimeKind.Utc);
        }

        [Fact]
        public async Task AppendAsync_ShouldDefaultEmptyPayloadToJsonObject()
        {
            var (service, open) = NewServiceAndDb();

            await service.AppendAsync(new AuditEventInput { EventType = "VcrScrub", Payload = null });

            using var db = open();
            db.SystemAuditEventStreams.Single().Payload.Should().Be("{}");
        }

        [Fact]
        public async Task AppendAsync_MultipleFrames_ShouldHaveMonotonicallyIncreasingSequence()
        {
            var (service, open) = NewServiceAndDb();

            await service.AppendAsync(new AuditEventInput { EventType = "QuizTelemetry" });
            await service.AppendAsync(new AuditEventInput { EventType = "QuizTelemetry" });
            await service.AppendAsync(new AuditEventInput { EventType = "QuizTelemetry" });

            using var db = open();
            var sequences = db.SystemAuditEventStreams.OrderBy(f => f.Sequence).Select(f => f.Sequence).ToList();
            sequences.Should().HaveCount(3);
            sequences.Should().BeInAscendingOrder();
        }

        [Fact]
        public void ImmutableInterceptor_ShouldBlockUpdateOnAuditFrame()
        {
            using var db = NewContext(withImmutableGuard: true);
            var frame = new SystemAuditEventStream("VcrScrub", null, null, "GET", "/x", 200, "{}");
            db.Add(frame);
            db.SaveChanges(); 

            
            db.Entry(frame).State = EntityState.Modified;

            var act = () => db.SaveChanges();
            act.Should().Throw<InvalidOperationException>().WithMessage("*append-only*");
        }

        [Fact]
        public void ImmutableInterceptor_ShouldBlockDeleteOnAuditFrame()
        {
            using var db = NewContext(withImmutableGuard: true);
            var frame = new SystemAuditEventStream("VcrScrub", null, null, "GET", "/x", 200, "{}");
            db.Add(frame);
            db.SaveChanges();

            db.Remove(frame);

            var act = () => db.SaveChanges();
            act.Should().Throw<InvalidOperationException>().WithMessage("*immutable*");
        }

        [Fact]
        public void ImmutableInterceptor_ShouldAllowAppend()
        {
            using var db = NewContext(withImmutableGuard: true);
            db.Add(new SystemAuditEventStream("CodeSyntaxGaffe", null, null, null, null, null, "{}"));

            var act = () => db.SaveChanges();
            act.Should().NotThrow();
            db.SystemAuditEventStreams.Should().ContainSingle();
        }

        [Fact]
        public void ImmutableInterceptor_ShouldBlockUpdateOnAuditLog()
        {
            // AD-011: AuditLog (admin audit) cũng append-only — chống sửa/xóa vết tích admin.
            using var db = NewContext(withImmutableGuard: true);
            var log = new AuditLog("BanUser", Guid.NewGuid(), "admin", Guid.NewGuid(), "khóa tài khoản");
            db.Add(log);
            db.SaveChanges();

            db.Entry(log).State = EntityState.Modified;

            var act = () => db.SaveChanges();
            act.Should().Throw<InvalidOperationException>().WithMessage("*append-only*");
        }

        [Fact]
        public void ImmutableInterceptor_ShouldBlockDeleteOnAuditLog()
        {
            using var db = NewContext(withImmutableGuard: true);
            var log = new AuditLog("BanUser", Guid.NewGuid(), "admin", Guid.NewGuid(), "khóa tài khoản");
            db.Add(log);
            db.SaveChanges();

            db.Remove(log);

            var act = () => db.SaveChanges();
            act.Should().Throw<InvalidOperationException>().WithMessage("*immutable*");
        }

        [Fact]
        public async Task AuditFilter_CapturesUserIdFromTokenHeader()
        {
            // AD-007: HttpContext.User rỗng (hệ dùng RequireJwtRole) — filter phải đọc sub
            // TRỰC TIẾP từ Authorization header qua JwtHelper.ExtractSubFromToken.
            TestJwtBuilder.EnsureConfigured();
            var userId = Guid.NewGuid();
            var (service, open) = NewServiceAndDb();
            var filter = new AuditEventActionFilter(service, NullLogger<AuditEventActionFilter>.Instance);

            var http = new DefaultHttpContext();
            http.Request.Headers["Authorization"] = $"Bearer {TestJwtBuilder.BuildToken(userId.ToString(), "Student")}";
            http.Request.Path = "/api/v1/users/me/progress";
            http.Request.Method = "GET";
            var actionContext = new ActionContext(http, new RouteData(), new ActionDescriptor());
            var executing = new ActionExecutingContext(actionContext, new List<IFilterMetadata>(), new Dictionary<string, object?>(), new object());

            await filter.OnActionExecutionAsync(executing, () =>
                Task.FromResult(new ActionExecutedContext(actionContext, new List<IFilterMetadata>(), executing.Controller)
                {
                    Result = new OkResult()
                }));

            using var db = open();
            var frame = db.SystemAuditEventStreams.Single();
            frame.UserId.Should().Be(userId);
            frame.Path.Should().Be("/api/v1/users/me/progress");
            frame.StatusCode.Should().Be(200);
        }
    }
}
