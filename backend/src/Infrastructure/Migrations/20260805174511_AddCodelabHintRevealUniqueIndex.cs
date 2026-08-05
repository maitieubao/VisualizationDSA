using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCodelabHintRevealUniqueIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_CodelabHintReveals_UserId_CodelabHintId",
                table: "CodelabHintReveals",
                columns: new[] { "UserId", "CodelabHintId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_CodelabHintReveals_UserId_CodelabHintId",
                table: "CodelabHintReveals");
        }
    }
}
