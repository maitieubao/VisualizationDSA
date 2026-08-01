using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Sprint4_CodelabHintsAndJudge : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Hints",
                table: "Codelabs");

            migrationBuilder.AddColumn<double>(
                name: "ProgressPercent",
                table: "UserModuleItemProgresses",
                type: "REAL",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<int>(
                name: "Score",
                table: "UserModuleItemProgresses",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ImportedFromCourseId",
                table: "Classrooms",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsSequential",
                table: "ClassroomModuleItemOverrides",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "PrerequisiteItemId",
                table: "ClassroomModuleItemOverrides",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ClassroomAnnouncements",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    ClassroomId = table.Column<Guid>(type: "TEXT", nullable: false),
                    AuthorId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Title = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    ContentMd = table.Column<string>(type: "TEXT", nullable: false),
                    IsPublished = table.Column<bool>(type: "INTEGER", nullable: false),
                    IsPinned = table.Column<bool>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    PublishedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    ClassroomId1 = table.Column<Guid>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClassroomAnnouncements", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ClassroomAnnouncements_Classrooms_ClassroomId",
                        column: x => x.ClassroomId,
                        principalTable: "Classrooms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ClassroomAnnouncements_Classrooms_ClassroomId1",
                        column: x => x.ClassroomId1,
                        principalTable: "Classrooms",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ClassroomAnnouncements_Users_AuthorId",
                        column: x => x.AuthorId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ClassroomModules",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    ClassroomId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Title = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: false),
                    OrderIndex = table.Column<int>(type: "INTEGER", nullable: false),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false),
                    IsHidden = table.Column<bool>(type: "INTEGER", nullable: false),
                    UnlockAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClassroomModules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ClassroomModules_Classrooms_ClassroomId",
                        column: x => x.ClassroomId,
                        principalTable: "Classrooms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CodelabHints",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    CodelabId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Content = table.Column<string>(type: "TEXT", nullable: false),
                    IsTiered = table.Column<bool>(type: "INTEGER", nullable: false),
                    XpCost = table.Column<int>(type: "INTEGER", nullable: false),
                    OrderIndex = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CodelabHints", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CodelabHints_Codelabs_CodelabId",
                        column: x => x.CodelabId,
                        principalTable: "Codelabs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TheoryArticles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    AuthorId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Title = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Slug = table.Column<string>(type: "TEXT", maxLength: 250, nullable: false),
                    ContentMd = table.Column<string>(type: "TEXT", nullable: false),
                    Category = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Difficulty = table.Column<string>(type: "TEXT", maxLength: 30, nullable: false),
                    Tags = table.Column<string>(type: "TEXT", nullable: false),
                    ViewCount = table.Column<int>(type: "INTEGER", nullable: false),
                    ReadTimeMinutes = table.Column<int>(type: "INTEGER", nullable: false),
                    IsPublished = table.Column<bool>(type: "INTEGER", nullable: false),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    PublishedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TheoryArticles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TheoryArticles_Users_AuthorId",
                        column: x => x.AuthorId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ClassroomModuleItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    ModuleId = table.Column<Guid>(type: "TEXT", nullable: false),
                    ItemType = table.Column<int>(type: "INTEGER", nullable: false),
                    LessonId = table.Column<Guid>(type: "TEXT", nullable: true),
                    QuizId = table.Column<Guid>(type: "TEXT", nullable: true),
                    CodelabId = table.Column<Guid>(type: "TEXT", nullable: true),
                    OverrideTitle = table.Column<string>(type: "TEXT", nullable: false),
                    OverrideDescription = table.Column<string>(type: "TEXT", nullable: false),
                    OrderIndex = table.Column<int>(type: "INTEGER", nullable: false),
                    IsRequired = table.Column<bool>(type: "INTEGER", nullable: false),
                    IsHidden = table.Column<bool>(type: "INTEGER", nullable: false),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UnlockAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    DueAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    MaxAttempts = table.Column<int>(type: "INTEGER", nullable: true),
                    IsHiddenForStudent = table.Column<bool>(type: "INTEGER", nullable: false),
                    PrerequisiteItemId = table.Column<Guid>(type: "TEXT", nullable: true),
                    IsSequential = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClassroomModuleItems", x => x.Id);
                    table.CheckConstraint("CK_ClassroomModuleItem_OneReference", "(\"LessonId\" IS NOT NULL AND \"QuizId\" IS NULL AND \"CodelabId\" IS NULL) OR (\"LessonId\" IS NULL AND \"QuizId\" IS NOT NULL AND \"CodelabId\" IS NULL) OR (\"LessonId\" IS NULL AND \"QuizId\" IS NULL AND \"CodelabId\" IS NOT NULL)");
                    table.ForeignKey(
                        name: "FK_ClassroomModuleItems_ClassroomModules_ModuleId",
                        column: x => x.ModuleId,
                        principalTable: "ClassroomModules",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ClassroomModuleItems_Codelabs_CodelabId",
                        column: x => x.CodelabId,
                        principalTable: "Codelabs",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ClassroomModuleItems_Lessons_LessonId",
                        column: x => x.LessonId,
                        principalTable: "Lessons",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ClassroomModuleItems_Quizzes_QuizId",
                        column: x => x.QuizId,
                        principalTable: "Quizzes",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "LessonTheoryArticles",
                columns: table => new
                {
                    LessonId = table.Column<Guid>(type: "TEXT", nullable: false),
                    TheoryArticleId = table.Column<Guid>(type: "TEXT", nullable: false),
                    OrderIndex = table.Column<int>(type: "INTEGER", nullable: false),
                    AddedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LessonTheoryArticles", x => new { x.LessonId, x.TheoryArticleId });
                    table.ForeignKey(
                        name: "FK_LessonTheoryArticles_Lessons_LessonId",
                        column: x => x.LessonId,
                        principalTable: "Lessons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LessonTheoryArticles_TheoryArticles_TheoryArticleId",
                        column: x => x.TheoryArticleId,
                        principalTable: "TheoryArticles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TheoryArticleVersions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    ArticleId = table.Column<Guid>(type: "TEXT", nullable: false),
                    ContentMd = table.Column<string>(type: "TEXT", nullable: false),
                    ChangeSummary = table.Column<string>(type: "TEXT", nullable: false),
                    ChangedBy = table.Column<Guid>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    ChangedByUserId = table.Column<Guid>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TheoryArticleVersions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TheoryArticleVersions_TheoryArticles_ArticleId",
                        column: x => x.ArticleId,
                        principalTable: "TheoryArticles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TheoryArticleVersions_Users_ChangedByUserId",
                        column: x => x.ChangedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ModuleItems_CodelabId",
                table: "ModuleItems",
                column: "CodelabId");

            migrationBuilder.CreateIndex(
                name: "IX_ClassroomAnnouncements_AuthorId",
                table: "ClassroomAnnouncements",
                column: "AuthorId");

            migrationBuilder.CreateIndex(
                name: "IX_ClassroomAnnouncements_ClassroomId_PublishedAt",
                table: "ClassroomAnnouncements",
                columns: new[] { "ClassroomId", "PublishedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_ClassroomAnnouncements_ClassroomId1",
                table: "ClassroomAnnouncements",
                column: "ClassroomId1");

            migrationBuilder.CreateIndex(
                name: "IX_ClassroomModuleItems_CodelabId",
                table: "ClassroomModuleItems",
                column: "CodelabId");

            migrationBuilder.CreateIndex(
                name: "IX_ClassroomModuleItems_LessonId",
                table: "ClassroomModuleItems",
                column: "LessonId");

            migrationBuilder.CreateIndex(
                name: "IX_ClassroomModuleItems_ModuleId_OrderIndex",
                table: "ClassroomModuleItems",
                columns: new[] { "ModuleId", "OrderIndex" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ClassroomModuleItems_QuizId",
                table: "ClassroomModuleItems",
                column: "QuizId");

            migrationBuilder.CreateIndex(
                name: "IX_ClassroomModules_ClassroomId_OrderIndex",
                table: "ClassroomModules",
                columns: new[] { "ClassroomId", "OrderIndex" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CodelabHints_CodelabId",
                table: "CodelabHints",
                column: "CodelabId");

            migrationBuilder.CreateIndex(
                name: "IX_LessonTheoryArticles_TheoryArticleId",
                table: "LessonTheoryArticles",
                column: "TheoryArticleId");

            migrationBuilder.CreateIndex(
                name: "IX_TheoryArticles_AuthorId",
                table: "TheoryArticles",
                column: "AuthorId");

            migrationBuilder.CreateIndex(
                name: "IX_TheoryArticles_Slug",
                table: "TheoryArticles",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TheoryArticleVersions_ArticleId",
                table: "TheoryArticleVersions",
                column: "ArticleId");

            migrationBuilder.CreateIndex(
                name: "IX_TheoryArticleVersions_ChangedByUserId",
                table: "TheoryArticleVersions",
                column: "ChangedByUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_ModuleItems_Codelabs_CodelabId",
                table: "ModuleItems",
                column: "CodelabId",
                principalTable: "Codelabs",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ModuleItems_Codelabs_CodelabId",
                table: "ModuleItems");

            migrationBuilder.DropTable(
                name: "ClassroomAnnouncements");

            migrationBuilder.DropTable(
                name: "ClassroomModuleItems");

            migrationBuilder.DropTable(
                name: "CodelabHints");

            migrationBuilder.DropTable(
                name: "LessonTheoryArticles");

            migrationBuilder.DropTable(
                name: "TheoryArticleVersions");

            migrationBuilder.DropTable(
                name: "ClassroomModules");

            migrationBuilder.DropTable(
                name: "TheoryArticles");

            migrationBuilder.DropIndex(
                name: "IX_ModuleItems_CodelabId",
                table: "ModuleItems");

            migrationBuilder.DropColumn(
                name: "ProgressPercent",
                table: "UserModuleItemProgresses");

            migrationBuilder.DropColumn(
                name: "Score",
                table: "UserModuleItemProgresses");

            migrationBuilder.DropColumn(
                name: "ImportedFromCourseId",
                table: "Classrooms");

            migrationBuilder.DropColumn(
                name: "IsSequential",
                table: "ClassroomModuleItemOverrides");

            migrationBuilder.DropColumn(
                name: "PrerequisiteItemId",
                table: "ClassroomModuleItemOverrides");

            migrationBuilder.AddColumn<string>(
                name: "Hints",
                table: "Codelabs",
                type: "TEXT",
                nullable: false,
                defaultValue: "");
        }
    }
}
