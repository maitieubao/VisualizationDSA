using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class v5_Epic8_TeacherStudio : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CustomRoadmaps",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    TeacherId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: false),
                    Tags = table.Column<string>(type: "TEXT", nullable: false),
                    ThumbnailUrl = table.Column<string>(type: "TEXT", nullable: true),
                    Visibility = table.Column<string>(type: "TEXT", nullable: false),
                    Status = table.Column<string>(type: "TEXT", nullable: false),
                    AdminRejectReason = table.Column<string>(type: "TEXT", nullable: true),
                    ForkedFromId = table.Column<Guid>(type: "TEXT", nullable: true),
                    ForkedFromName = table.Column<string>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CustomRoadmaps", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CustomRoadmaps_Users_TeacherId",
                        column: x => x.TeacherId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CustomNodes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    RoadmapId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: false),
                    Difficulty = table.Column<string>(type: "TEXT", nullable: false),
                    ContentJson = table.Column<string>(type: "TEXT", nullable: false),
                    VideoUrl = table.Column<string>(type: "TEXT", nullable: true),
                    VisualizerId = table.Column<Guid>(type: "TEXT", nullable: true),
                    QuizId = table.Column<Guid>(type: "TEXT", nullable: true),
                    LabId = table.Column<Guid>(type: "TEXT", nullable: true),
                    LeetCodeId = table.Column<Guid>(type: "TEXT", nullable: true),
                    SortOrder = table.Column<int>(type: "INTEGER", nullable: false),
                    OfficialApproach = table.Column<string>(type: "TEXT", nullable: true),
                    OfficialSolution = table.Column<string>(type: "TEXT", nullable: true),
                    ComplexityNote = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CustomNodes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CustomNodes_CustomRoadmaps_RoadmapId",
                        column: x => x.RoadmapId,
                        principalTable: "CustomRoadmaps",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CustomNodes_RoadmapId",
                table: "CustomNodes",
                column: "RoadmapId");

            migrationBuilder.CreateIndex(
                name: "IX_CustomRoadmaps_TeacherId",
                table: "CustomRoadmaps",
                column: "TeacherId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CustomNodes");

            migrationBuilder.DropTable(
                name: "CustomRoadmaps");
        }
    }
}
