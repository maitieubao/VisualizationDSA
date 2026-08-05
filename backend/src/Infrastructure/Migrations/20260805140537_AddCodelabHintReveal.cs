using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCodelabHintReveal : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CodelabHintReveals",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false),
                    CodelabHintId = table.Column<Guid>(type: "TEXT", nullable: false),
                    RevealedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CodelabHintReveals", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CodelabHintReveals_CodelabHints_CodelabHintId",
                        column: x => x.CodelabHintId,
                        principalTable: "CodelabHints",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CodelabHintReveals_CodelabHintId",
                table: "CodelabHintReveals",
                column: "CodelabHintId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CodelabHintReveals");
        }
    }
}
