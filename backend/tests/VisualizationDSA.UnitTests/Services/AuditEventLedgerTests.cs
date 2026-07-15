using System;
using System.Linq;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Application.Services;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Infrastructure.Data;
using VisualizationDSA.Infrastructure.Interceptors;
using VisualizationDSA.Infrastructure.Services;
using Xunit;

namespace VisualizationDSA.UnitTests.Services
{
    /// <summary>
    /// Tests cho Event Sourcing Ledger (Trụ Cột 6): AuditEventService append-only
    /// và ImmutableAuditInterceptor chặn UPDATE/DELETE.
    /// </summary>
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

        [Fact]
        public async Task AppendAsync_ShouldPersistImmutableFrame()
        {
            using var db = NewContext();
            var service = new AuditEventService(db);

            await service.AppendAsync(new AuditEventInput
            {
                EventType  = "ApiInteraction:Concepts.GetSemanticGraph",
                HttpMethod = "GET",
                Path       = "/api/v1/concepts/analytics/semantic-graph",
                StatusCode = 200,
                Payload    = "{\"route\":{\"action\":\"GetSemanticGraph\"}}",
            });

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
            using var db = NewContext();
            var service = new AuditEventService(db);

            await service.AppendAsync(new AuditEventInput { EventType = "VcrScrub", Payload = null });

            db.SystemAuditEventStreams.Single().Payload.Should().Be("{}");
        }

        [Fact]
        public async Task AppendAsync_MultipleFrames_ShouldHaveMonotonicallyIncreasingSequence()
        {
            using var db = NewContext();
            var service = new AuditEventService(db);

            await service.AppendAsync(new AuditEventInput { EventType = "QuizTelemetry" });
            await service.AppendAsync(new AuditEventInput { EventType = "QuizTelemetry" });
            await service.AppendAsync(new AuditEventInput { EventType = "QuizTelemetry" });

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
            db.SaveChanges(); // append allowed

            // Buộc entry sang trạng thái Modified (dù setters private) để kích hoạt guard.
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
    }
}
