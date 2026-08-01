using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class v4_Epic7_Classroom : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_CheatSheetSnippets",
                table: "CheatSheetSnippets");

            migrationBuilder.DropIndex(
                name: "IX_CheatSheetSnippets_Language_DataStructure",
                table: "CheatSheetSnippets");

            migrationBuilder.AddPrimaryKey(
                name: "PK_CheatSheetSnippets",
                table: "CheatSheetSnippets",
                columns: new[] { "Language", "DataStructure" });

            migrationBuilder.CreateTable(
                name: "Classrooms",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    RoadmapId = table.Column<Guid>(type: "TEXT", nullable: false),
                    TeacherId = table.Column<Guid>(type: "TEXT", nullable: false),
                    JoinCode = table.Column<string>(type: "TEXT", maxLength: 6, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Classrooms", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Classrooms_Courses_RoadmapId",
                        column: x => x.RoadmapId,
                        principalTable: "Courses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Classrooms_Users_TeacherId",
                        column: x => x.TeacherId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ClassroomMembers",
                columns: table => new
                {
                    ClassroomId = table.Column<string>(type: "TEXT", nullable: false),
                    StudentId = table.Column<Guid>(type: "TEXT", nullable: false),
                    JoinedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClassroomMembers", x => new { x.ClassroomId, x.StudentId });
                    table.ForeignKey(
                        name: "FK_ClassroomMembers_Classrooms_ClassroomId",
                        column: x => x.ClassroomId,
                        principalTable: "Classrooms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ClassroomMembers_Users_StudentId",
                        column: x => x.StudentId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ClassroomMembers_StudentId",
                table: "ClassroomMembers",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_Classrooms_JoinCode",
                table: "Classrooms",
                column: "JoinCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Classrooms_RoadmapId",
                table: "Classrooms",
                column: "RoadmapId");

            migrationBuilder.CreateIndex(
                name: "IX_Classrooms_TeacherId",
                table: "Classrooms",
                column: "TeacherId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ClassroomMembers");

            migrationBuilder.DropTable(
                name: "Classrooms");

            migrationBuilder.DropPrimaryKey(
                name: "PK_CheatSheetSnippets",
                table: "CheatSheetSnippets");

            migrationBuilder.AddPrimaryKey(
                name: "PK_CheatSheetSnippets",
                table: "CheatSheetSnippets",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_CheatSheetSnippets_Language_DataStructure",
                table: "CheatSheetSnippets",
                columns: new[] { "Language", "DataStructure" },
                unique: true);
        }
    }
}
