using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixClassroomOverridePrerequisiteGuid : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ClassroomModuleItemOverrides_ModuleItems_ModuleItemId",
                table: "ClassroomModuleItemOverrides");

            migrationBuilder.AlterColumn<Guid>(
                name: "PrerequisiteItemId",
                table: "ClassroomModuleItemOverrides",
                type: "TEXT",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "INTEGER",
                oldNullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsRequired",
                table: "ClassroomModuleItemOverrides",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddForeignKey(
                name: "FK_ClassroomModuleItemOverrides_ClassroomModuleItems_ModuleItemId",
                table: "ClassroomModuleItemOverrides",
                column: "ModuleItemId",
                principalTable: "ClassroomModuleItems",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ClassroomModuleItemOverrides_ClassroomModuleItems_ModuleItemId",
                table: "ClassroomModuleItemOverrides");

            migrationBuilder.DropColumn(
                name: "IsRequired",
                table: "ClassroomModuleItemOverrides");

            migrationBuilder.AlterColumn<int>(
                name: "PrerequisiteItemId",
                table: "ClassroomModuleItemOverrides",
                type: "INTEGER",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "TEXT",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_ClassroomModuleItemOverrides_ModuleItems_ModuleItemId",
                table: "ClassroomModuleItemOverrides",
                column: "ModuleItemId",
                principalTable: "ModuleItems",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
