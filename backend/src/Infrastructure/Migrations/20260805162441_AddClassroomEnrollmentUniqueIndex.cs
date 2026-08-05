using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddClassroomEnrollmentUniqueIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ClassroomEnrollments_ClassroomId",
                table: "ClassroomEnrollments");

            migrationBuilder.CreateIndex(
                name: "IX_ClassroomEnrollments_ClassroomId_StudentId",
                table: "ClassroomEnrollments",
                columns: new[] { "ClassroomId", "StudentId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ClassroomEnrollments_ClassroomId_StudentId",
                table: "ClassroomEnrollments");

            migrationBuilder.CreateIndex(
                name: "IX_ClassroomEnrollments_ClassroomId",
                table: "ClassroomEnrollments",
                column: "ClassroomId");
        }
    }
}
