using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddQuizXpGrantUniqueIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // QZ-001/002/005: dọn các bản ghi trùng (UserId, QuizKey) do race cũ để tạo được unique index.
            migrationBuilder.Sql(
                "DELETE FROM QuizXpGrants WHERE Id NOT IN (" +
                "  SELECT MIN(Id) FROM QuizXpGrants GROUP BY UserId, QuizKey);");

            migrationBuilder.CreateIndex(
                name: "IX_QuizXpGrants_UserId_QuizKey",
                table: "QuizXpGrants",
                columns: new[] { "UserId", "QuizKey" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_QuizXpGrants_UserId_QuizKey",
                table: "QuizXpGrants");
        }
    }
}
