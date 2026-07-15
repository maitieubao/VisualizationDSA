using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSystemAuditEventStream : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SystemAuditEventStreams",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    EventType = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: true),
                    CorrelationId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    HttpMethod = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    Path = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    StatusCode = table.Column<int>(type: "integer", nullable: true),
                    Payload = table.Column<string>(type: "jsonb", nullable: false),
                    Sequence = table.Column<long>(type: "bigint", nullable: false),
                    OccurredAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SystemAuditEventStreams", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SystemAuditEventStreams_EventType",
                table: "SystemAuditEventStreams",
                column: "EventType");

            migrationBuilder.CreateIndex(
                name: "IX_SystemAuditEventStreams_OccurredAt",
                table: "SystemAuditEventStreams",
                column: "OccurredAt");

            migrationBuilder.CreateIndex(
                name: "IX_SystemAuditEventStreams_Sequence",
                table: "SystemAuditEventStreams",
                column: "Sequence");

            migrationBuilder.CreateIndex(
                name: "IX_SystemAuditEventStreams_UserId_OccurredAt",
                table: "SystemAuditEventStreams",
                columns: new[] { "UserId", "OccurredAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SystemAuditEventStreams");
        }
    }
}
