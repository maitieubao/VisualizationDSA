using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialSuperApp : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AuditLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Action = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    ActorId = table.Column<Guid>(type: "TEXT", nullable: false),
                    ActorName = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    TargetId = table.Column<Guid>(type: "TEXT", nullable: true),
                    Details = table.Column<string>(type: "TEXT", maxLength: 2000, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditLogs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Badges",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 500, nullable: false),
                    Icon = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    Color = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    Criteria = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Badges", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CheatSheetSnippets",
                columns: table => new
                {
                    Language = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    DataStructure = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    CodeSnippet = table.Column<string>(type: "TEXT", nullable: false),
                    Explanation = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CheatSheetSnippets", x => new { x.Language, x.DataStructure });
                });

            migrationBuilder.CreateTable(
                name: "ClassroomLeaderboardHistory",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    ClassroomId = table.Column<string>(type: "TEXT", maxLength: 36, nullable: false),
                    WeekStart = table.Column<DateTime>(type: "TEXT", nullable: false),
                    WeekEnd = table.Column<DateTime>(type: "TEXT", nullable: false),
                    RankingsJson = table.Column<string>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClassroomLeaderboardHistory", x => x.Id);
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
                name: "KeywordBlacklists",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Keyword = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Category = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false, defaultValue: "general"),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_KeywordBlacklists", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "QuestTemplates",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    QuestType = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    Difficulty = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    TargetValue = table.Column<int>(type: "INTEGER", nullable: false),
                    GemsReward = table.Column<int>(type: "INTEGER", nullable: false),
                    IsActive = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuestTemplates", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Quizzes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Title = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: false),
                    Topic = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Difficulty = table.Column<int>(type: "INTEGER", nullable: false, defaultValue: 1),
                    XPReward = table.Column<int>(type: "INTEGER", nullable: false),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Quizzes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SemanticConceptNodes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    ConceptKey = table.Column<string>(type: "TEXT", maxLength: 150, nullable: false),
                    Title = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Category = table.Column<string>(type: "TEXT", maxLength: 60, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 2000, nullable: false),
                    Embedding = table.Column<string>(type: "TEXT", nullable: false),
                    Importance = table.Column<double>(type: "REAL", nullable: false, defaultValue: 0.0),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SemanticConceptNodes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SystemAuditEventStreams",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    EventType = table.Column<string>(type: "TEXT", maxLength: 120, nullable: false),
                    UserId = table.Column<Guid>(type: "TEXT", nullable: true),
                    CorrelationId = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    HttpMethod = table.Column<string>(type: "TEXT", maxLength: 10, nullable: true),
                    Path = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    StatusCode = table.Column<int>(type: "INTEGER", nullable: true),
                    Payload = table.Column<string>(type: "TEXT", nullable: false),
                    Sequence = table.Column<long>(type: "INTEGER", nullable: false),
                    OccurredAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SystemAuditEventStreams", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Email = table.Column<string>(type: "TEXT", maxLength: 255, nullable: false),
                    Username = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    PasswordHash = table.Column<string>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    LastLoginAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    TotalXP = table.Column<int>(type: "INTEGER", nullable: false, defaultValue: 0),
                    CurrentLevel = table.Column<int>(type: "INTEGER", nullable: false, defaultValue: 1),
                    StreakDays = table.Column<int>(type: "INTEGER", nullable: false, defaultValue: 0),
                    IsPremium = table.Column<bool>(type: "INTEGER", nullable: false),
                    Role = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false, defaultValue: "Student"),
                    IsActive = table.Column<bool>(type: "INTEGER", nullable: false),
                    LastActivityDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    Hearts = table.Column<int>(type: "INTEGER", nullable: false),
                    MaxHearts = table.Column<int>(type: "INTEGER", nullable: false),
                    LastHeartUsedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    GemsCount = table.Column<int>(type: "INTEGER", nullable: false),
                    StreakFreezeCount = table.Column<int>(type: "INTEGER", nullable: false),
                    AvatarUrl = table.Column<string>(type: "TEXT", nullable: true),
                    AvatarFrameType = table.Column<string>(type: "TEXT", nullable: true),
                    TeacherAppStatus = table.Column<string>(type: "TEXT", nullable: false),
                    PremiumExpiresAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    AdWatchCount = table.Column<int>(type: "INTEGER", nullable: false),
                    FirstAdAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    AiQuotaResetAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    AiGlobalUsed = table.Column<int>(type: "INTEGER", nullable: false),
                    AiLessonUsed = table.Column<int>(type: "INTEGER", nullable: false),
                    LastHintAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    XpBoostExpiresAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
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
                name: "QuizQuestions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    QuizId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Question = table.Column<string>(type: "TEXT", maxLength: 500, nullable: false),
                    Options = table.Column<string>(type: "TEXT", nullable: false),
                    CorrectIndex = table.Column<int>(type: "INTEGER", nullable: false),
                    Explanation = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuizQuestions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_QuizQuestions_Quizzes_QuizId",
                        column: x => x.QuizId,
                        principalTable: "Quizzes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "KnowledgeEdges",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    SourceNodeId = table.Column<Guid>(type: "TEXT", nullable: false),
                    TargetNodeId = table.Column<Guid>(type: "TEXT", nullable: false),
                    RelationType = table.Column<string>(type: "TEXT", maxLength: 60, nullable: false),
                    Weight = table.Column<double>(type: "REAL", nullable: false, defaultValue: 1.0),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_KnowledgeEdges", x => x.Id);
                    table.ForeignKey(
                        name: "FK_KnowledgeEdges_SemanticConceptNodes_SourceNodeId",
                        column: x => x.SourceNodeId,
                        principalTable: "SemanticConceptNodes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_KnowledgeEdges_SemanticConceptNodes_TargetNodeId",
                        column: x => x.TargetNodeId,
                        principalTable: "SemanticConceptNodes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Classrooms",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: false),
                    OwnerTeacherId = table.Column<Guid>(type: "TEXT", nullable: false),
                    CourseId = table.Column<Guid>(type: "TEXT", nullable: true),
                    ImportedFromCourseId = table.Column<Guid>(type: "TEXT", nullable: true),
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
                name: "Courses",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    TeacherId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Title = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: false),
                    Category = table.Column<int>(type: "INTEGER", maxLength: 50, nullable: false),
                    Difficulty = table.Column<int>(type: "INTEGER", maxLength: 30, nullable: false),
                    IsPremium = table.Column<bool>(type: "INTEGER", nullable: false),
                    CoverImageUrl = table.Column<string>(type: "TEXT", nullable: false),
                    IsPublished = table.Column<bool>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Courses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Courses_Users_TeacherId",
                        column: x => x.TeacherId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CustomRoadmaps",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    TeacherId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: false),
                    Tags = table.Column<string>(type: "TEXT", nullable: false),
                    ThumbnailUrl = table.Column<string>(type: "TEXT", nullable: true),
                    Visibility = table.Column<string>(type: "TEXT", nullable: false),
                    Status = table.Column<string>(type: "TEXT", nullable: false),
                    AdminRejectReason = table.Column<string>(type: "TEXT", nullable: true),
                    ForkedFromId = table.Column<Guid>(type: "TEXT", nullable: true),
                    ForkedFromName = table.Column<string>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CustomRoadmaps", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CustomRoadmaps_Users_TeacherId",
                        column: x => x.TeacherId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "LearningProgresses",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false),
                    ModuleId = table.Column<string>(type: "TEXT", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    TimeSpentMinutes = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LearningProgresses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LearningProgresses_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LearningSessions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false),
                    NodeId = table.Column<string>(type: "TEXT", maxLength: 255, nullable: false),
                    CurrentStep = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false, defaultValue: "Theory"),
                    QuizScore = table.Column<int>(type: "INTEGER", nullable: true),
                    LabScore = table.Column<int>(type: "INTEGER", nullable: true),
                    LeetCodeScore = table.Column<int>(type: "INTEGER", nullable: true),
                    ExpiresAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LearningSessions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LearningSessions_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Lessons",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Title = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    ContentMd = table.Column<string>(type: "TEXT", nullable: false),
                    SandboxType = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    SandboxConfig = table.Column<string>(type: "TEXT", nullable: false),
                    XPReward = table.Column<int>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CreatedByTeacherId = table.Column<Guid>(type: "TEXT", nullable: true),
                    PublishStatus = table.Column<int>(type: "INTEGER", nullable: false),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Lessons", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Lessons_Users_CreatedByTeacherId",
                        column: x => x.CreatedByTeacherId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Notifications",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Content = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: false),
                    IsRead = table.Column<bool>(type: "INTEGER", nullable: false),
                    LinkUrl = table.Column<string>(type: "TEXT", maxLength: 500, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Type = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false, defaultValue: "General"),
                    RefId = table.Column<Guid>(type: "TEXT", nullable: true),
                    DeepLink = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notifications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Notifications_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Orders",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false),
                    PaymentCode = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    TransactionReference = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    Amount = table.Column<decimal>(type: "TEXT", precision: 18, scale: 2, nullable: false),
                    Status = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false, defaultValue: "Pending"),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Orders", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Orders_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "QuizAttempts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false),
                    QuizId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Score = table.Column<int>(type: "INTEGER", nullable: false),
                    MaxScore = table.Column<int>(type: "INTEGER", nullable: false),
                    Passed = table.Column<bool>(type: "INTEGER", nullable: false),
                    AttemptedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Answers = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuizAttempts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_QuizAttempts_Quizzes_QuizId",
                        column: x => x.QuizId,
                        principalTable: "Quizzes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_QuizAttempts_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RefreshTokens",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Token = table.Column<string>(type: "TEXT", maxLength: 128, nullable: false),
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    IsRevoked = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RefreshTokens", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RefreshTokens_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TeacherApplications",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false),
                    SchoolName = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    CvUrl = table.Column<string>(type: "TEXT", maxLength: 500, nullable: false),
                    Reason = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: false),
                    Status = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false, defaultValue: "Pending"),
                    RejectReason = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    ReviewedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    ReviewedBy = table.Column<Guid>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TeacherApplications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TeacherApplications_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
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
                name: "UserBadges",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false),
                    BadgeId = table.Column<Guid>(type: "TEXT", nullable: false),
                    EarnedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserBadges", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserBadges_Badges_BadgeId",
                        column: x => x.BadgeId,
                        principalTable: "Badges",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserBadges_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserDailyQuests",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Date = table.Column<DateTime>(type: "TEXT", nullable: false),
                    QuestType = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    Difficulty = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    TargetValue = table.Column<int>(type: "INTEGER", nullable: false),
                    CurrentValue = table.Column<int>(type: "INTEGER", nullable: false),
                    GemsReward = table.Column<int>(type: "INTEGER", nullable: false),
                    IsClaimed = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserDailyQuests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserDailyQuests_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserInventory",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false),
                    ItemId = table.Column<string>(type: "TEXT", nullable: false),
                    ItemType = table.Column<string>(type: "TEXT", nullable: false),
                    PurchasedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserInventory", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserInventory_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserRoadmapLanguages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false),
                    RoadmapId = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Language = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserRoadmapLanguages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserRoadmapLanguages_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

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
                name: "CustomNodes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    RoadmapId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: false),
                    Difficulty = table.Column<string>(type: "TEXT", nullable: false),
                    ContentJson = table.Column<string>(type: "TEXT", nullable: false),
                    VideoUrl = table.Column<string>(type: "TEXT", nullable: true),
                    VisualizerId = table.Column<Guid>(type: "TEXT", nullable: true),
                    QuizId = table.Column<Guid>(type: "TEXT", nullable: true),
                    LabId = table.Column<Guid>(type: "TEXT", nullable: true),
                    LeetCodeId = table.Column<Guid>(type: "TEXT", nullable: true),
                    SortOrder = table.Column<int>(type: "INTEGER", nullable: false),
                    OfficialApproach = table.Column<string>(type: "TEXT", nullable: true),
                    OfficialSolution = table.Column<string>(type: "TEXT", nullable: true),
                    ComplexityNote = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CustomNodes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CustomNodes_CustomRoadmaps_RoadmapId",
                        column: x => x.RoadmapId,
                        principalTable: "CustomRoadmaps",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RoadmapEditLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    RoadmapId = table.Column<Guid>(type: "TEXT", nullable: false),
                    EditorId = table.Column<Guid>(type: "TEXT", nullable: false),
                    ChangeType = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    ChangedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Note = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RoadmapEditLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RoadmapEditLogs_CustomRoadmaps_RoadmapId",
                        column: x => x.RoadmapId,
                        principalTable: "CustomRoadmaps",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RoadmapEditLogs_Users_EditorId",
                        column: x => x.EditorId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
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
                name: "LessonComments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    LessonId = table.Column<Guid>(type: "TEXT", nullable: false),
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Content = table.Column<string>(type: "TEXT", maxLength: 2000, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    ParentId = table.Column<Guid>(type: "TEXT", nullable: true),
                    IsEdited = table.Column<bool>(type: "INTEGER", nullable: false),
                    EditedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LessonComments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LessonComments_LessonComments_ParentId",
                        column: x => x.ParentId,
                        principalTable: "LessonComments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LessonComments_Lessons_LessonId",
                        column: x => x.LessonId,
                        principalTable: "Lessons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LessonComments_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
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
                name: "UserLessonProgresses",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false),
                    LessonId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Status = table.Column<string>(type: "TEXT", maxLength: 30, nullable: false, defaultValue: "NotStarted"),
                    CompletedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    XPRewarded = table.Column<int>(type: "INTEGER", nullable: false),
                    LastActiveFrameIndex = table.Column<int>(type: "INTEGER", nullable: false, defaultValue: 0),
                    LastScrollPercent = table.Column<double>(type: "REAL", nullable: false, defaultValue: 0.0),
                    Stars = table.Column<int>(type: "INTEGER", nullable: true),
                    QuizPassed = table.Column<bool>(type: "INTEGER", nullable: false),
                    LabPassed = table.Column<bool>(type: "INTEGER", nullable: false),
                    LeetCodePassed = table.Column<bool>(type: "INTEGER", nullable: false),
                    WeightedScore = table.Column<int>(type: "INTEGER", nullable: true),
                    Hint1UsedSteps = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserLessonProgresses", x => new { x.UserId, x.LessonId });
                    table.ForeignKey(
                        name: "FK_UserLessonProgresses_Lessons_LessonId",
                        column: x => x.LessonId,
                        principalTable: "Lessons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserLessonProgresses_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
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
                        name: "FK_ModuleItems_Codelabs_CodelabId",
                        column: x => x.CodelabId,
                        principalTable: "Codelabs",
                        principalColumn: "Id");
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
                name: "ContentReports",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    NodeId = table.Column<Guid>(type: "TEXT", nullable: false),
                    ReporterId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Reason = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    Detail = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    Status = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false, defaultValue: "Pending"),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContentReports", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ContentReports_CustomNodes_NodeId",
                        column: x => x.NodeId,
                        principalTable: "CustomNodes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ContentReports_Users_ReporterId",
                        column: x => x.ReporterId,
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
                    IsHiddenForStudent = table.Column<bool>(type: "INTEGER", nullable: false),
                    PrerequisiteItemId = table.Column<int>(type: "INTEGER", nullable: true),
                    IsSequential = table.Column<bool>(type: "INTEGER", nullable: false)
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
                    ProgressPercent = table.Column<double>(type: "REAL", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    Score = table.Column<int>(type: "INTEGER", nullable: true),
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

            migrationBuilder.InsertData(
                table: "QuestTemplates",
                columns: new[] { "Id", "Description", "Difficulty", "GemsReward", "IsActive", "QuestType", "TargetValue" },
                values: new object[,]
                {
                    { new Guid("11111111-1111-1111-1111-111111111111"), "Kiếm 50 XP", "Easy", 10, true, "EARN_XP", 50 },
                    { new Guid("22222222-2222-2222-2222-222222222222"), "Hoàn thành 1 bài trắc nghiệm", "Easy", 10, true, "COMPLETE_QUIZ", 1 },
                    { new Guid("33333333-3333-3333-3333-333333333333"), "Hoàn thành 1 bài học (Module)", "Medium", 20, true, "COMPLETE_MODULE", 1 },
                    { new Guid("44444444-4444-4444-4444-444444444444"), "Kiếm 150 XP", "Medium", 20, true, "EARN_XP", 150 },
                    { new Guid("55555555-5555-5555-5555-555555555555"), "Hoàn thành 1 bài trắc nghiệm với điểm tối đa", "Hard", 50, true, "PERFECT_QUIZ", 1 },
                    { new Guid("66666666-6666-6666-6666-666666666666"), "Kiếm 300 XP", "Hard", 50, true, "EARN_XP", 300 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_CreatedAt",
                table: "AuditLogs",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Badges_Name",
                table: "Badges",
                column: "Name",
                unique: true);

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
                name: "IX_ClassroomEnrollments_ClassroomId",
                table: "ClassroomEnrollments",
                column: "ClassroomId");

            migrationBuilder.CreateIndex(
                name: "IX_ClassroomEnrollments_StudentId",
                table: "ClassroomEnrollments",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_ClassroomLeaderboardHistory_ClassroomId",
                table: "ClassroomLeaderboardHistory",
                column: "ClassroomId");

            migrationBuilder.CreateIndex(
                name: "IX_ClassroomLeaderboardHistory_WeekStart",
                table: "ClassroomLeaderboardHistory",
                column: "WeekStart");

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
                name: "IX_ContentReports_NodeId",
                table: "ContentReports",
                column: "NodeId");

            migrationBuilder.CreateIndex(
                name: "IX_ContentReports_ReporterId",
                table: "ContentReports",
                column: "ReporterId");

            migrationBuilder.CreateIndex(
                name: "IX_CourseModules_CourseId_OrderIndex",
                table: "CourseModules",
                columns: new[] { "CourseId", "OrderIndex" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Courses_TeacherId",
                table: "Courses",
                column: "TeacherId");

            migrationBuilder.CreateIndex(
                name: "IX_CustomNodes_RoadmapId",
                table: "CustomNodes",
                column: "RoadmapId");

            migrationBuilder.CreateIndex(
                name: "IX_CustomRoadmaps_TeacherId",
                table: "CustomRoadmaps",
                column: "TeacherId");

            migrationBuilder.CreateIndex(
                name: "IX_KeywordBlacklists_Keyword",
                table: "KeywordBlacklists",
                column: "Keyword",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_KnowledgeEdges_RelationType",
                table: "KnowledgeEdges",
                column: "RelationType");

            migrationBuilder.CreateIndex(
                name: "IX_KnowledgeEdges_SourceNodeId_TargetNodeId_RelationType",
                table: "KnowledgeEdges",
                columns: new[] { "SourceNodeId", "TargetNodeId", "RelationType" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_KnowledgeEdges_TargetNodeId",
                table: "KnowledgeEdges",
                column: "TargetNodeId");

            migrationBuilder.CreateIndex(
                name: "IX_LearningProgresses_UserId_ModuleId",
                table: "LearningProgresses",
                columns: new[] { "UserId", "ModuleId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LearningSessions_UserId_NodeId",
                table: "LearningSessions",
                columns: new[] { "UserId", "NodeId" });

            migrationBuilder.CreateIndex(
                name: "IX_LessonComments_LessonId",
                table: "LessonComments",
                column: "LessonId");

            migrationBuilder.CreateIndex(
                name: "IX_LessonComments_ParentId",
                table: "LessonComments",
                column: "ParentId");

            migrationBuilder.CreateIndex(
                name: "IX_LessonComments_UserId",
                table: "LessonComments",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_LessonReviews_LessonId",
                table: "LessonReviews",
                column: "LessonId");

            migrationBuilder.CreateIndex(
                name: "IX_LessonReviews_ReviewerAdminId",
                table: "LessonReviews",
                column: "ReviewerAdminId");

            migrationBuilder.CreateIndex(
                name: "IX_Lessons_CreatedByTeacherId",
                table: "Lessons",
                column: "CreatedByTeacherId");

            migrationBuilder.CreateIndex(
                name: "IX_LessonTheoryArticles_TheoryArticleId",
                table: "LessonTheoryArticles",
                column: "TheoryArticleId");

            migrationBuilder.CreateIndex(
                name: "IX_ModuleItems_CodelabId",
                table: "ModuleItems",
                column: "CodelabId");

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
                name: "IX_Notifications_CreatedAt",
                table: "Notifications",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_UserId",
                table: "Notifications",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_PaymentCode",
                table: "Orders",
                column: "PaymentCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Orders_TransactionReference",
                table: "Orders",
                column: "TransactionReference",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Orders_UserId",
                table: "Orders",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_QuizAttempts_QuizId",
                table: "QuizAttempts",
                column: "QuizId");

            migrationBuilder.CreateIndex(
                name: "IX_QuizAttempts_UserId",
                table: "QuizAttempts",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_QuizQuestions_QuizId",
                table: "QuizQuestions",
                column: "QuizId");

            migrationBuilder.CreateIndex(
                name: "IX_RefreshTokens_Token",
                table: "RefreshTokens",
                column: "Token",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RefreshTokens_UserId",
                table: "RefreshTokens",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_RoadmapEditLogs_EditorId",
                table: "RoadmapEditLogs",
                column: "EditorId");

            migrationBuilder.CreateIndex(
                name: "IX_RoadmapEditLogs_RoadmapId",
                table: "RoadmapEditLogs",
                column: "RoadmapId");

            migrationBuilder.CreateIndex(
                name: "IX_SemanticConceptNodes_Category",
                table: "SemanticConceptNodes",
                column: "Category");

            migrationBuilder.CreateIndex(
                name: "IX_SemanticConceptNodes_ConceptKey",
                table: "SemanticConceptNodes",
                column: "ConceptKey",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SystemAuditEventStreams_EventType",
                table: "SystemAuditEventStreams",
                column: "EventType");

            migrationBuilder.CreateIndex(
                name: "IX_SystemAuditEventStreams_OccurredAt",
                table: "SystemAuditEventStreams",
                column: "OccurredAt");

            migrationBuilder.CreateIndex(
                name: "IX_SystemAuditEventStreams_Sequence",
                table: "SystemAuditEventStreams",
                column: "Sequence");

            migrationBuilder.CreateIndex(
                name: "IX_SystemAuditEventStreams_UserId_OccurredAt",
                table: "SystemAuditEventStreams",
                columns: new[] { "UserId", "OccurredAt" });

            migrationBuilder.CreateIndex(
                name: "IX_TeacherApplications_Status",
                table: "TeacherApplications",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_TeacherApplications_UserId",
                table: "TeacherApplications",
                column: "UserId");

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

            migrationBuilder.CreateIndex(
                name: "IX_UserBadges_BadgeId",
                table: "UserBadges",
                column: "BadgeId");

            migrationBuilder.CreateIndex(
                name: "IX_UserBadges_UserId_BadgeId",
                table: "UserBadges",
                columns: new[] { "UserId", "BadgeId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserDailyQuests_UserId_Date",
                table: "UserDailyQuests",
                columns: new[] { "UserId", "Date" });

            migrationBuilder.CreateIndex(
                name: "IX_UserInventory_UserId",
                table: "UserInventory",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserLessonProgresses_LessonId",
                table: "UserLessonProgresses",
                column: "LessonId");

            migrationBuilder.CreateIndex(
                name: "IX_UserModuleItemProgresses_ModuleItemId",
                table: "UserModuleItemProgresses",
                column: "ModuleItemId");

            migrationBuilder.CreateIndex(
                name: "IX_UserRoadmapLanguages_UserId_RoadmapId",
                table: "UserRoadmapLanguages",
                columns: new[] { "UserId", "RoadmapId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_TotalXP",
                table: "Users",
                column: "TotalXP");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Username",
                table: "Users",
                column: "Username",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AuditLogs");

            migrationBuilder.DropTable(
                name: "CheatSheetSnippets");

            migrationBuilder.DropTable(
                name: "ClassroomAnnouncements");

            migrationBuilder.DropTable(
                name: "ClassroomEnrollments");

            migrationBuilder.DropTable(
                name: "ClassroomLeaderboardHistory");

            migrationBuilder.DropTable(
                name: "ClassroomLessons");

            migrationBuilder.DropTable(
                name: "ClassroomModuleItemOverrides");

            migrationBuilder.DropTable(
                name: "ClassroomModuleItems");

            migrationBuilder.DropTable(
                name: "ClassroomQuizAttempts");

            migrationBuilder.DropTable(
                name: "CodelabSubmissions");

            migrationBuilder.DropTable(
                name: "CodelabTemplates");

            migrationBuilder.DropTable(
                name: "CodelabTestCases");

            migrationBuilder.DropTable(
                name: "ContentReports");

            migrationBuilder.DropTable(
                name: "KeywordBlacklists");

            migrationBuilder.DropTable(
                name: "KnowledgeEdges");

            migrationBuilder.DropTable(
                name: "LearningProgresses");

            migrationBuilder.DropTable(
                name: "LearningSessions");

            migrationBuilder.DropTable(
                name: "LessonComments");

            migrationBuilder.DropTable(
                name: "LessonReviews");

            migrationBuilder.DropTable(
                name: "LessonTheoryArticles");

            migrationBuilder.DropTable(
                name: "Notifications");

            migrationBuilder.DropTable(
                name: "Orders");

            migrationBuilder.DropTable(
                name: "QuestTemplates");

            migrationBuilder.DropTable(
                name: "QuizAttempts");

            migrationBuilder.DropTable(
                name: "QuizQuestions");

            migrationBuilder.DropTable(
                name: "RefreshTokens");

            migrationBuilder.DropTable(
                name: "RoadmapEditLogs");

            migrationBuilder.DropTable(
                name: "SystemAuditEventStreams");

            migrationBuilder.DropTable(
                name: "TeacherApplications");

            migrationBuilder.DropTable(
                name: "TheoryArticleVersions");

            migrationBuilder.DropTable(
                name: "UserBadges");

            migrationBuilder.DropTable(
                name: "UserDailyQuests");

            migrationBuilder.DropTable(
                name: "UserInventory");

            migrationBuilder.DropTable(
                name: "UserLessonProgresses");

            migrationBuilder.DropTable(
                name: "UserModuleItemProgresses");

            migrationBuilder.DropTable(
                name: "UserRoadmapLanguages");

            migrationBuilder.DropTable(
                name: "ClassroomModules");

            migrationBuilder.DropTable(
                name: "ClassroomQuizzes");

            migrationBuilder.DropTable(
                name: "CustomNodes");

            migrationBuilder.DropTable(
                name: "SemanticConceptNodes");

            migrationBuilder.DropTable(
                name: "TheoryArticles");

            migrationBuilder.DropTable(
                name: "Badges");

            migrationBuilder.DropTable(
                name: "ModuleItems");

            migrationBuilder.DropTable(
                name: "Classrooms");

            migrationBuilder.DropTable(
                name: "CustomRoadmaps");

            migrationBuilder.DropTable(
                name: "Codelabs");

            migrationBuilder.DropTable(
                name: "CourseModules");

            migrationBuilder.DropTable(
                name: "Lessons");

            migrationBuilder.DropTable(
                name: "Quizzes");

            migrationBuilder.DropTable(
                name: "Courses");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
