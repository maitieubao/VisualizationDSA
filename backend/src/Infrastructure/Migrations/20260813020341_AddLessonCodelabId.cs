using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddLessonCodelabId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "CodelabId",
                table: "Lessons",
                type: "TEXT",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Lessons_CodelabId",
                table: "Lessons",
                column: "CodelabId");

            migrationBuilder.AddForeignKey(
                name: "FK_Lessons_Codelabs_CodelabId",
                table: "Lessons",
                column: "CodelabId",
                principalTable: "Codelabs",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Lessons_Codelabs_CodelabId",
                table: "Lessons");

            migrationBuilder.DropIndex(
                name: "IX_Lessons_CodelabId",
                table: "Lessons");

            migrationBuilder.DropColumn(
                name: "CodelabId",
                table: "Lessons");
        }
    }
}
