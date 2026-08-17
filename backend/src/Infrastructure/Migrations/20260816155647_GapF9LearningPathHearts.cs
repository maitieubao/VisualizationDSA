using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class GapF9LearningPathHearts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Hearts",
                table: "Users",
                type: "INTEGER",
                nullable: false,
                defaultValue: 10);

            migrationBuilder.AddColumn<int>(
                name: "HeartsMax",
                table: "Users",
                type: "INTEGER",
                nullable: false,
                defaultValue: 10);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastHeartAt",
                table: "Users",
                type: "TEXT",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "LearningPaths",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Title = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LearningPaths", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "LearningPathNodes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    LearningPathId = table.Column<Guid>(type: "TEXT", nullable: false),
                    LessonId = table.Column<Guid>(type: "TEXT", nullable: true),
                    OrderIndex = table.Column<int>(type: "INTEGER", nullable: false),
                    Title = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LearningPathNodes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LearningPathNodes_LearningPaths_LearningPathId",
                        column: x => x.LearningPathId,
                        principalTable: "LearningPaths",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LearningPathNodes_Lessons_LessonId",
                        column: x => x.LessonId,
                        principalTable: "Lessons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "NodeSessions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false),
                    NodeId = table.Column<Guid>(type: "TEXT", nullable: false),
                    StartedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NodeSessions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_NodeSessions_LearningPathNodes_NodeId",
                        column: x => x.NodeId,
                        principalTable: "LearningPathNodes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_NodeSessions_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserNodeProgresses",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false),
                    NodeId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Status = table.Column<int>(type: "INTEGER", nullable: false),
                    Stars = table.Column<int>(type: "INTEGER", nullable: false),
                    NodeScore = table.Column<int>(type: "INTEGER", nullable: true),
                    UnlockedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    PassedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserNodeProgresses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserNodeProgresses_LearningPathNodes_NodeId",
                        column: x => x.NodeId,
                        principalTable: "LearningPathNodes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserNodeProgresses_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_LearningPathNodes_LearningPathId_OrderIndex",
                table: "LearningPathNodes",
                columns: new[] { "LearningPathId", "OrderIndex" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LearningPathNodes_LessonId",
                table: "LearningPathNodes",
                column: "LessonId");

            migrationBuilder.CreateIndex(
                name: "IX_NodeSessions_NodeId",
                table: "NodeSessions",
                column: "NodeId");

            migrationBuilder.CreateIndex(
                name: "IX_NodeSessions_UserId_NodeId",
                table: "NodeSessions",
                columns: new[] { "UserId", "NodeId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserNodeProgresses_NodeId",
                table: "UserNodeProgresses",
                column: "NodeId");

            migrationBuilder.CreateIndex(
                name: "IX_UserNodeProgresses_UserId_NodeId",
                table: "UserNodeProgresses",
                columns: new[] { "UserId", "NodeId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "NodeSessions");

            migrationBuilder.DropTable(
                name: "UserNodeProgresses");

            migrationBuilder.DropTable(
                name: "LearningPathNodes");

            migrationBuilder.DropTable(
                name: "LearningPaths");

            migrationBuilder.DropColumn(
                name: "Hearts",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "HeartsMax",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "LastHeartAt",
                table: "Users");
        }
    }
}
