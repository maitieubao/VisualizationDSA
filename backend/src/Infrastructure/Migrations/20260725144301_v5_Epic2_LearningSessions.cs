using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class v5_Epic2_LearningSessions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Hint1UsedSteps",
                table: "UserLessonProgresses",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "LabPassed",
                table: "UserLessonProgresses",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "LeetCodePassed",
                table: "UserLessonProgresses",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "QuizPassed",
                table: "UserLessonProgresses",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "Stars",
                table: "UserLessonProgresses",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "WeightedScore",
                table: "UserLessonProgresses",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "LearningSessions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false),
                    NodeId = table.Column<string>(type: "TEXT", maxLength: 255, nullable: false),
                    CurrentStep = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false, defaultValue: "Theory"),
                    QuizScore = table.Column<int>(type: "INTEGER", nullable: true),
                    LabScore = table.Column<int>(type: "INTEGER", nullable: true),
                    LeetCodeScore = table.Column<int>(type: "INTEGER", nullable: true),
                    ExpiresAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LearningSessions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LearningSessions_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_LearningSessions_UserId_NodeId",
                table: "LearningSessions",
                columns: new[] { "UserId", "NodeId" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LearningSessions");

            migrationBuilder.DropColumn(
                name: "Hint1UsedSteps",
                table: "UserLessonProgresses");

            migrationBuilder.DropColumn(
                name: "LabPassed",
                table: "UserLessonProgresses");

            migrationBuilder.DropColumn(
                name: "LeetCodePassed",
                table: "UserLessonProgresses");

            migrationBuilder.DropColumn(
                name: "QuizPassed",
                table: "UserLessonProgresses");

            migrationBuilder.DropColumn(
                name: "Stars",
                table: "UserLessonProgresses");

            migrationBuilder.DropColumn(
                name: "WeightedScore",
                table: "UserLessonProgresses");
        }
    }
}
