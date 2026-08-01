using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Epic6_CheatSheetSnippet : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ContentBlocksJson",
                table: "Lessons",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TheoryImagesJson",
                table: "Lessons",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VideoUrl",
                table: "Lessons",
                type: "TEXT",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "CheatSheetSnippets",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Language = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    DataStructure = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    CodeSnippet = table.Column<string>(type: "TEXT", nullable: false),
                    Explanation = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CheatSheetSnippets", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CheatSheetSnippets_Language_DataStructure",
                table: "CheatSheetSnippets",
                columns: new[] { "Language", "DataStructure" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CheatSheetSnippets");

            migrationBuilder.DropColumn(
                name: "ContentBlocksJson",
                table: "Lessons");

            migrationBuilder.DropColumn(
                name: "TheoryImagesJson",
                table: "Lessons");

            migrationBuilder.DropColumn(
                name: "VideoUrl",
                table: "Lessons");
        }
    }
}
