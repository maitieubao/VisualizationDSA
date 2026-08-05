using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddLessonProgressFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "BestScore",
                table: "UserLessonProgresses",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "CodelabCompleted",
                table: "UserLessonProgresses",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "HasWatchedVisualizer",
                table: "UserLessonProgresses",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "QuizScore",
                table: "UserLessonProgresses",
                type: "INTEGER",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BestScore",
                table: "UserLessonProgresses");

            migrationBuilder.DropColumn(
                name: "CodelabCompleted",
                table: "UserLessonProgresses");

            migrationBuilder.DropColumn(
                name: "HasWatchedVisualizer",
                table: "UserLessonProgresses");

            migrationBuilder.DropColumn(
                name: "QuizScore",
                table: "UserLessonProgresses");
        }
    }
}
