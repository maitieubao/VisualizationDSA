using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    
    public partial class Sprint3_CodelabUpgrades : Migration
    {
        
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Lessons_Courses_CourseId",
                table: "Lessons");

            migrationBuilder.DropForeignKey(
                name: "FK_Lessons_Quizzes_QuizId",
                table: "Lessons");

            migrationBuilder.DropIndex(
                name: "IX_Lessons_CourseId",
                table: "Lessons");

            migrationBuilder.DropColumn(
                name: "CourseId",
                table: "Lessons");

            migrationBuilder.RenameColumn(
                name: "QuizId",
                table: "Lessons",
                newName: "CreatedByTeacherId");

            migrationBuilder.RenameColumn(
                name: "OrderIndex",
                table: "Lessons",
                newName: "PublishStatus");

            migrationBuilder.RenameIndex(
                name: "IX_Lessons_QuizId",
                table: "Lessons",
                newName: "IX_Lessons_CreatedByTeacherId");

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Quizzes",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Lessons",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "EditedAt",
                table: "LessonComments",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "LessonComments",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsEdited",
                table: "LessonComments",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AlterColumn<int>(
                name: "Difficulty",
                table: "Courses",
                type: "INTEGER",
                maxLength: 30,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 30);

            migrationBuilder.AlterColumn<int>(
                name: "Category",
                table: "Courses",
                type: "INTEGER",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 50);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Courses",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "Classrooms",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: false),
                    OwnerTeacherId = table.Column<Guid>(type: "TEXT", nullable: false),
                    CourseId = table.Column<Guid>(type: "TEXT", nullable: true),
                    InviteCode = table.Column<string>(type: "TEXT", nullable: false),
                    IsArchived = table.Column<bool>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    InviteCodeExpiresAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    MaxEnrollmentCapacity = table.Column<int>(type: "INTEGER", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Classrooms", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Classrooms_Users_OwnerTeacherId",
                        column: x => x.OwnerTeacherId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Codelabs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Title = table.Column<string>(type: "TEXT", nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: false),
                    InitialCode = table.Column<string>(type: "TEXT", nullable: false),
                    Difficulty = table.Column<int>(type: "INTEGER", nullable: false),
                    XPReward = table.Column<int>(type: "INTEGER", nullable: false),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false),
                    Constraints = table.Column<string>(type: "TEXT", nullable: false),
                    Examples = table.Column<string>(type: "TEXT", nullable: false),
                    Hints = table.Column<string>(type: "TEXT", nullable: false),
                    Tags = table.Column<string>(type: "TEXT", nullable: false),
                    MaxRuntimeMs = table.Column<int>(type: "INTEGER", nullable: false),
                    MaxMemoryBytes = table.Column<int>(type: "INTEGER", nullable: false),
                    AllowedLanguages = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Codelabs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CourseModules",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    CourseId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Title = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: false),
                    OrderIndex = table.Column<int>(type: "INTEGER", nullable: false),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CourseModules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CourseModules_Courses_CourseId",
                        column: x => x.CourseId,
                        principalTable: "Courses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LessonReviews",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    LessonId = table.Column<Guid>(type: "TEXT", nullable: false),
                    ReviewerAdminId = table.Column<Guid>(type: "TEXT", nullable: true),
                    IsApproved = table.Column<bool>(type: "INTEGER", nullable: true),
                    Feedback = table.Column<string>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    ReviewedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LessonReviews", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LessonReviews_Lessons_LessonId",
                        column: x => x.LessonId,
                        principalTable: "Lessons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LessonReviews_Users_ReviewerAdminId",
                        column: x => x.ReviewerAdminId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "ClassroomEnrollments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    ClassroomId = table.Column<Guid>(type: "TEXT", nullable: false),
                    StudentId = table.Column<Guid>(type: "TEXT", nullable: false),
                    JoinedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Status = table.Column<int>(type: "INTEGER", nullable: false),
                    StatusChangedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    StatusChangedByUserId = table.Column<Guid>(type: "TEXT", nullable: true),
                    StatusChangeReason = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClassroomEnrollments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ClassroomEnrollments_Classrooms_ClassroomId",
                        column: x => x.ClassroomId,
                        principalTable: "Classrooms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ClassroomEnrollments_Users_StudentId",
                        column: x => x.StudentId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ClassroomLessons",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    ClassroomId = table.Column<Guid>(type: "TEXT", nullable: false),
                    LessonId = table.Column<Guid>(type: "TEXT", nullable: false),
                    OrderIndex = table.Column<int>(type: "INTEGER", nullable: false),
                    UnlockAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    IsVisible = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClassroomLessons", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ClassroomLessons_Classrooms_ClassroomId",
                        column: x => x.ClassroomId,
                        principalTable: "Classrooms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ClassroomLessons_Lessons_LessonId",
                        column: x => x.LessonId,
                        principalTable: "Lessons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ClassroomQuizzes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    ClassroomId = table.Column<Guid>(type: "TEXT", nullable: false),
                    QuizId = table.Column<Guid>(type: "TEXT", nullable: false),
                    OpenAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    DueAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    MaxAttempts = table.Column<int>(type: "INTEGER", nullable: false),
                    IsArchived = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClassroomQuizzes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ClassroomQuizzes_Classrooms_ClassroomId",
                        column: x => x.ClassroomId,
                        principalTable: "Classrooms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ClassroomQuizzes_Quizzes_QuizId",
                        column: x => x.QuizId,
                        principalTable: "Quizzes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CodelabSubmissions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false),
                    CodelabId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Code = table.Column<string>(type: "TEXT", nullable: false),
                    Language = table.Column<string>(type: "TEXT", nullable: false),
                    Status = table.Column<string>(type: "TEXT", maxLength: 30, nullable: false),
                    ErrorMessage = table.Column<string>(type: "TEXT", nullable: false),
                    RuntimeMs = table.Column<int>(type: "INTEGER", nullable: false),
                    MemoryBytes = table.Column<int>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    PassedCount = table.Column<int>(type: "INTEGER", nullable: false),
                    TotalCount = table.Column<int>(type: "INTEGER", nullable: false),
                    Score = table.Column<int>(type: "INTEGER", nullable: false),
                    IsSubmit = table.Column<bool>(type: "INTEGER", nullable: false),
                    PerTestCaseResultJson = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CodelabSubmissions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CodelabSubmissions_Codelabs_CodelabId",
                        column: x => x.CodelabId,
                        principalTable: "Codelabs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CodelabSubmissions_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CodelabTemplates",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    CodelabId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Language = table.Column<string>(type: "TEXT", nullable: false),
                    BoilerplateCode = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CodelabTemplates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CodelabTemplates_Codelabs_CodelabId",
                        column: x => x.CodelabId,
                        principalTable: "Codelabs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CodelabTestCases",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    CodelabId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Input = table.Column<string>(type: "TEXT", nullable: false),
                    ExpectedOutput = table.Column<string>(type: "TEXT", nullable: false),
                    IsHidden = table.Column<bool>(type: "INTEGER", nullable: false),
                    ScoreWeight = table.Column<int>(type: "INTEGER", nullable: false),
                    OrderIndex = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CodelabTestCases", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CodelabTestCases_Codelabs_CodelabId",
                        column: x => x.CodelabId,
                        principalTable: "Codelabs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ModuleItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    ModuleId = table.Column<Guid>(type: "TEXT", nullable: false),
                    ClassroomId = table.Column<Guid>(type: "TEXT", nullable: true),
                    ItemType = table.Column<int>(type: "INTEGER", nullable: false),
                    LessonId = table.Column<Guid>(type: "TEXT", nullable: true),
                    QuizId = table.Column<Guid>(type: "TEXT", nullable: true),
                    CodelabId = table.Column<Guid>(type: "TEXT", nullable: true),
                    OverrideTitle = table.Column<string>(type: "TEXT", nullable: false),
                    OrderIndex = table.Column<int>(type: "INTEGER", nullable: false),
                    IsRequired = table.Column<bool>(type: "INTEGER", nullable: false),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ModuleItems", x => x.Id);
                    table.CheckConstraint("CK_ModuleItem_OneReference", "(\"LessonId\" IS NOT NULL AND \"QuizId\" IS NULL AND \"CodelabId\" IS NULL) OR (\"LessonId\" IS NULL AND \"QuizId\" IS NOT NULL AND \"CodelabId\" IS NULL) OR (\"LessonId\" IS NULL AND \"QuizId\" IS NULL AND \"CodelabId\" IS NOT NULL)");
                    table.ForeignKey(
                        name: "FK_ModuleItems_CourseModules_ModuleId",
                        column: x => x.ModuleId,
                        principalTable: "CourseModules",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ModuleItems_Lessons_LessonId",
                        column: x => x.LessonId,
                        principalTable: "Lessons",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ModuleItems_Quizzes_QuizId",
                        column: x => x.QuizId,
                        principalTable: "Quizzes",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "ClassroomQuizAttempts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    ClassroomQuizId = table.Column<Guid>(type: "TEXT", nullable: false),
                    StudentId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Score = table.Column<int>(type: "INTEGER", nullable: false),
                    MaxScore = table.Column<int>(type: "INTEGER", nullable: false),
                    SubmittedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    IsLate = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClassroomQuizAttempts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ClassroomQuizAttempts_ClassroomQuizzes_ClassroomQuizId",
                        column: x => x.ClassroomQuizId,
                        principalTable: "ClassroomQuizzes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ClassroomQuizAttempts_Users_StudentId",
                        column: x => x.StudentId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ClassroomModuleItemOverrides",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    ClassroomId = table.Column<Guid>(type: "TEXT", nullable: false),
                    ModuleItemId = table.Column<Guid>(type: "TEXT", nullable: false),
                    OpenAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    DueAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    MaxAttempts = table.Column<int>(type: "INTEGER", nullable: true),
                    IsHiddenForStudent = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClassroomModuleItemOverrides", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ClassroomModuleItemOverrides_Classrooms_ClassroomId",
                        column: x => x.ClassroomId,
                        principalTable: "Classrooms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ClassroomModuleItemOverrides_ModuleItems_ModuleItemId",
                        column: x => x.ModuleItemId,
                        principalTable: "ModuleItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserModuleItemProgresses",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false),
                    ModuleItemId = table.Column<Guid>(type: "TEXT", nullable: false),
                    AttemptNumber = table.Column<int>(type: "INTEGER", nullable: false),
                    Status = table.Column<string>(type: "TEXT", maxLength: 30, nullable: false, defaultValue: "NotStarted"),
                    LastActiveFrameIndex = table.Column<int>(type: "INTEGER", nullable: false, defaultValue: 0),
                    LastScrollPercent = table.Column<double>(type: "REAL", nullable: false, defaultValue: 0.0),
                    CompletedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    LastAccessedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserModuleItemProgresses", x => new { x.UserId, x.ModuleItemId, x.AttemptNumber });
                    table.ForeignKey(
                        name: "FK_UserModuleItemProgresses_ModuleItems_ModuleItemId",
                        column: x => x.ModuleItemId,
                        principalTable: "ModuleItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserModuleItemProgresses_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ClassroomEnrollments_ClassroomId",
                table: "ClassroomEnrollments",
                column: "ClassroomId");

            migrationBuilder.CreateIndex(
                name: "IX_ClassroomEnrollments_StudentId",
                table: "ClassroomEnrollments",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_ClassroomLessons_ClassroomId",
                table: "ClassroomLessons",
                column: "ClassroomId");

            migrationBuilder.CreateIndex(
                name: "IX_ClassroomLessons_LessonId",
                table: "ClassroomLessons",
                column: "LessonId");

            migrationBuilder.CreateIndex(
                name: "IX_ClassroomModuleItemOverrides_ClassroomId_ModuleItemId",
                table: "ClassroomModuleItemOverrides",
                columns: new[] { "ClassroomId", "ModuleItemId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ClassroomModuleItemOverrides_ModuleItemId",
                table: "ClassroomModuleItemOverrides",
                column: "ModuleItemId");

            migrationBuilder.CreateIndex(
                name: "IX_ClassroomQuizAttempts_ClassroomQuizId",
                table: "ClassroomQuizAttempts",
                column: "ClassroomQuizId");

            migrationBuilder.CreateIndex(
                name: "IX_ClassroomQuizAttempts_StudentId",
                table: "ClassroomQuizAttempts",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_ClassroomQuizzes_ClassroomId",
                table: "ClassroomQuizzes",
                column: "ClassroomId");

            migrationBuilder.CreateIndex(
                name: "IX_ClassroomQuizzes_QuizId",
                table: "ClassroomQuizzes",
                column: "QuizId");

            migrationBuilder.CreateIndex(
                name: "IX_Classrooms_OwnerTeacherId",
                table: "Classrooms",
                column: "OwnerTeacherId");

            migrationBuilder.CreateIndex(
                name: "IX_CodelabSubmissions_CodelabId",
                table: "CodelabSubmissions",
                column: "CodelabId");

            migrationBuilder.CreateIndex(
                name: "IX_CodelabSubmissions_UserId_CodelabId_CreatedAt",
                table: "CodelabSubmissions",
                columns: new[] { "UserId", "CodelabId", "CreatedAt" },
                descending: new[] { false, false, true });

            migrationBuilder.CreateIndex(
                name: "IX_CodelabTemplates_CodelabId",
                table: "CodelabTemplates",
                column: "CodelabId");

            migrationBuilder.CreateIndex(
                name: "IX_CodelabTestCases_CodelabId",
                table: "CodelabTestCases",
                column: "CodelabId");

            migrationBuilder.CreateIndex(
                name: "IX_CourseModules_CourseId_OrderIndex",
                table: "CourseModules",
                columns: new[] { "CourseId", "OrderIndex" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LessonReviews_LessonId",
                table: "LessonReviews",
                column: "LessonId");

            migrationBuilder.CreateIndex(
                name: "IX_LessonReviews_ReviewerAdminId",
                table: "LessonReviews",
                column: "ReviewerAdminId");

            migrationBuilder.CreateIndex(
                name: "IX_ModuleItems_LessonId",
                table: "ModuleItems",
                column: "LessonId");

            migrationBuilder.CreateIndex(
                name: "IX_ModuleItems_ModuleId_OrderIndex",
                table: "ModuleItems",
                columns: new[] { "ModuleId", "OrderIndex" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ModuleItems_QuizId",
                table: "ModuleItems",
                column: "QuizId");

            migrationBuilder.CreateIndex(
                name: "IX_UserModuleItemProgresses_ModuleItemId",
                table: "UserModuleItemProgresses",
                column: "ModuleItemId");

            migrationBuilder.AddForeignKey(
                name: "FK_Lessons_Users_CreatedByTeacherId",
                table: "Lessons",
                column: "CreatedByTeacherId",
                principalTable: "Users",
                principalColumn: "Id");
        }

        
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Lessons_Users_CreatedByTeacherId",
                table: "Lessons");

            migrationBuilder.DropTable(
                name: "ClassroomEnrollments");

            migrationBuilder.DropTable(
                name: "ClassroomLessons");

            migrationBuilder.DropTable(
                name: "ClassroomModuleItemOverrides");

            migrationBuilder.DropTable(
                name: "ClassroomQuizAttempts");

            migrationBuilder.DropTable(
                name: "CodelabSubmissions");

            migrationBuilder.DropTable(
                name: "CodelabTemplates");

            migrationBuilder.DropTable(
                name: "CodelabTestCases");

            migrationBuilder.DropTable(
                name: "LessonReviews");

            migrationBuilder.DropTable(
                name: "UserModuleItemProgresses");

            migrationBuilder.DropTable(
                name: "ClassroomQuizzes");

            migrationBuilder.DropTable(
                name: "Codelabs");

            migrationBuilder.DropTable(
                name: "ModuleItems");

            migrationBuilder.DropTable(
                name: "Classrooms");

            migrationBuilder.DropTable(
                name: "CourseModules");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Quizzes");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Lessons");

            migrationBuilder.DropColumn(
                name: "EditedAt",
                table: "LessonComments");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "LessonComments");

            migrationBuilder.DropColumn(
                name: "IsEdited",
                table: "LessonComments");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Courses");

            migrationBuilder.RenameColumn(
                name: "PublishStatus",
                table: "Lessons",
                newName: "OrderIndex");

            migrationBuilder.RenameColumn(
                name: "CreatedByTeacherId",
                table: "Lessons",
                newName: "QuizId");

            migrationBuilder.RenameIndex(
                name: "IX_Lessons_CreatedByTeacherId",
                table: "Lessons",
                newName: "IX_Lessons_QuizId");

            migrationBuilder.AddColumn<Guid>(
                name: "CourseId",
                table: "Lessons",
                type: "TEXT",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AlterColumn<string>(
                name: "Difficulty",
                table: "Courses",
                type: "TEXT",
                maxLength: 30,
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER",
                oldMaxLength: 30);

            migrationBuilder.AlterColumn<string>(
                name: "Category",
                table: "Courses",
                type: "TEXT",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER",
                oldMaxLength: 50);

            migrationBuilder.CreateIndex(
                name: "IX_Lessons_CourseId",
                table: "Lessons",
                column: "CourseId");

            migrationBuilder.AddForeignKey(
                name: "FK_Lessons_Courses_CourseId",
                table: "Lessons",
                column: "CourseId",
                principalTable: "Courses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Lessons_Quizzes_QuizId",
                table: "Lessons",
                column: "QuizId",
                principalTable: "Quizzes",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }
    }
}
