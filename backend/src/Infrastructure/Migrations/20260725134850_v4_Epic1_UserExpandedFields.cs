using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class v4_Epic1_UserExpandedFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AdWatchCount",
                table: "Users",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "AiGlobalUsed",
                table: "Users",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "AiLessonUsed",
                table: "Users",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "AiQuotaResetAt",
                table: "Users",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AvatarFrameType",
                table: "Users",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AvatarUrl",
                table: "Users",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "FirstAdAt",
                table: "Users",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "GemsCount",
                table: "Users",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Hearts",
                table: "Users",
                type: "INTEGER",
                nullable: false,
                defaultValue: 10);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastHeartUsedAt",
                table: "Users",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastHintAt",
                table: "Users",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MaxHearts",
                table: "Users",
                type: "INTEGER",
                nullable: false,
                defaultValue: 10);

            migrationBuilder.AddColumn<DateTime>(
                name: "PremiumExpiresAt",
                table: "Users",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "StreakFreezeCount",
                table: "Users",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "TeacherAppStatus",
                table: "Users",
                type: "TEXT",
                nullable: false,
                defaultValue: "None");

            migrationBuilder.AddColumn<DateTime>(
                name: "XpBoostExpiresAt",
                table: "Users",
                type: "TEXT",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "TeacherApplications",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false),
                    SchoolName = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    CvUrl = table.Column<string>(type: "TEXT", maxLength: 500, nullable: false),
                    Reason = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: false),
                    Status = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false, defaultValue: "Pending"),
                    RejectReason = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    ReviewedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    ReviewedBy = table.Column<Guid>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TeacherApplications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TeacherApplications_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TeacherApplications_Status",
                table: "TeacherApplications",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_TeacherApplications_UserId",
                table: "TeacherApplications",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TeacherApplications");

            migrationBuilder.DropColumn(
                name: "AdWatchCount",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "AiGlobalUsed",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "AiLessonUsed",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "AiQuotaResetAt",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "AvatarFrameType",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "AvatarUrl",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "FirstAdAt",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "GemsCount",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Hearts",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "LastHeartUsedAt",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "LastHintAt",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "MaxHearts",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "PremiumExpiresAt",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "StreakFreezeCount",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "TeacherAppStatus",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "XpBoostExpiresAt",
                table: "Users");
        }
    }
}
