using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class v4_Epic11_NotificationsAndLeaderboard : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DeepLink",
                table: "Notifications",
                type: "TEXT",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "RefId",
                table: "Notifications",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Type",
                table: "Notifications",
                type: "TEXT",
                maxLength: 50,
                nullable: false,
                defaultValue: "General");

            migrationBuilder.CreateTable(
                name: "ClassroomLeaderboardHistories",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    ClassroomId = table.Column<string>(type: "TEXT", maxLength: 36, nullable: false),
                    WeekStart = table.Column<DateTime>(type: "TEXT", nullable: false),
                    WeekEnd = table.Column<DateTime>(type: "TEXT", nullable: false),
                    RankingsJson = table.Column<string>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClassroomLeaderboardHistories", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ClassroomLeaderboardHistories_ClassroomId",
                table: "ClassroomLeaderboardHistories",
                column: "ClassroomId");

            migrationBuilder.CreateIndex(
                name: "IX_ClassroomLeaderboardHistories_WeekStart",
                table: "ClassroomLeaderboardHistories",
                column: "WeekStart");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ClassroomLeaderboardHistories");

            migrationBuilder.DropColumn(
                name: "DeepLink",
                table: "Notifications");

            migrationBuilder.DropColumn(
                name: "RefId",
                table: "Notifications");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "Notifications");
        }
    }
}
