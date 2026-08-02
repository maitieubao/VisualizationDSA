using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using VisualizationDSA.Domain.Entities;

namespace VisualizationDSA.Infrastructure.Data
{
    public class ApplicationDbContext : DbContext, VisualizationDSA.Application.Interfaces.IApplicationDbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<User>           Users           { get; set; }
        public DbSet<Badge>          Badges          { get; set; }
        public DbSet<UserBadge>      UserBadges      { get; set; }
        public DbSet<Quiz>           Quizzes         { get; set; }
        public DbSet<QuizQuestion>   QuizQuestions   { get; set; }
        public DbSet<QuizAttempt>    QuizAttempts    { get; set; }
        public DbSet<LearningProgress> LearningProgresses { get; set; }
        public DbSet<RefreshToken>   RefreshTokens   { get; set; }
        public DbSet<Order>          Orders          { get; set; }
        public DbSet<SemanticConceptNode> SemanticConceptNodes { get; set; }
        public DbSet<KnowledgeEdge>       KnowledgeEdges       { get; set; }
        public DbSet<SystemAuditEventStream> SystemAuditEventStreams { get; set; }
        public DbSet<Course>         Courses         { get; set; }
        public DbSet<Lesson>         Lessons         { get; set; }
        public DbSet<UserLessonProgress> UserLessonProgresses { get; set; }
        public DbSet<UserModuleItemProgress> UserModuleItemProgresses { get; set; }
        public DbSet<LessonComment>  LessonComments  { get; set; }
        public DbSet<AuditLog>       AuditLogs       { get; set; }
        public DbSet<Notification>   Notifications   { get; set; }
        public DbSet<TeacherApplication> TeacherApplications => Set<TeacherApplication>();
        public DbSet<UserInventory>  UserInventory   { get; set; }
        public DbSet<LearningSession> LearningSessions { get; set; }
        public DbSet<CustomRoadmap> CustomRoadmaps => Set<CustomRoadmap>();
        public DbSet<CustomNode> CustomNodes => Set<CustomNode>();
        public DbSet<RoadmapEditLog> RoadmapEditLogs => Set<RoadmapEditLog>();
        public DbSet<ContentReport> ContentReports => Set<ContentReport>();
        public DbSet<KeywordBlacklist> KeywordBlacklists => Set<KeywordBlacklist>();
        public DbSet<UserDailyQuest> UserDailyQuests => Set<UserDailyQuest>();
        public DbSet<QuestTemplate> QuestTemplates => Set<QuestTemplate>();
        public DbSet<Classroom> Classrooms { get; set; }
        public DbSet<ClassroomLesson> ClassroomLessons { get; set; }
        public DbSet<ClassroomEnrollment> ClassroomEnrollments { get; set; }
        public DbSet<ClassroomQuiz> ClassroomQuizzes { get; set; }
        public DbSet<ClassroomQuizAttempt> ClassroomQuizAttempts { get; set; }
        public DbSet<LessonReview> LessonReviews { get; set; }
        public DbSet<CourseModule> CourseModules { get; set; }
        public DbSet<ModuleItem> ModuleItems { get; set; }
        public DbSet<ClassroomModuleItemOverride> ClassroomModuleItemOverrides { get; set; }
        public DbSet<ClassroomModule> ClassroomModules { get; set; }
        public DbSet<ClassroomModuleItem> ClassroomModuleItems { get; set; }
        public DbSet<TheoryArticle> TheoryArticles { get; set; }
        public DbSet<TheoryArticleVersion> TheoryArticleVersions { get; set; }
        public DbSet<LessonTheoryArticle> LessonTheoryArticles { get; set; }
        public DbSet<ClassroomAnnouncement> ClassroomAnnouncements { get; set; }
        public DbSet<Codelab> Codelabs { get; set; }
        public DbSet<CodelabTestCase> CodelabTestCases { get; set; }
        public DbSet<CodelabTemplate> CodelabTemplates { get; set; }
        public DbSet<CodelabHint> CodelabHints { get; set; }
        public DbSet<CodelabSubmission> CodelabSubmissions { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            
            
            modelBuilder.Entity<CourseModule>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => new { e.CourseId, e.OrderIndex }).IsUnique();
                entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
                entity.HasOne(e => e.Course)
                      .WithMany(c => c.Modules)
                      .HasForeignKey(e => e.CourseId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasQueryFilter(e => !e.IsDeleted);
            });

            
            modelBuilder.Entity<ModuleItem>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => new { e.ModuleId, e.OrderIndex }).IsUnique();
                entity.HasOne(e => e.Module)
                      .WithMany(m => m.Items)
                      .HasForeignKey(e => e.ModuleId)
                      .OnDelete(DeleteBehavior.Cascade);
                
                entity.ToTable(t => t.HasCheckConstraint("CK_ModuleItem_OneReference", 
                    "(\"LessonId\" IS NOT NULL AND \"QuizId\" IS NULL AND \"CodelabId\" IS NULL) OR " +
                    "(\"LessonId\" IS NULL AND \"QuizId\" IS NOT NULL AND \"CodelabId\" IS NULL) OR " +
                    "(\"LessonId\" IS NULL AND \"QuizId\" IS NULL AND \"CodelabId\" IS NOT NULL)"));

                entity.HasQueryFilter(e => !e.IsDeleted);

                
            });
            
            
            modelBuilder.Entity<ClassroomModuleItemOverride>(entity => {
                entity.HasKey(o => o.Id);
                entity.HasIndex(o => new { o.ClassroomId, o.ModuleItemId }).IsUnique();
                entity.HasOne(o => o.Classroom)
                    .WithMany(c => c.ModuleItemOverrides)
                    .HasForeignKey(o => o.ClassroomId)
                    .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(o => o.ModuleItem)
                    .WithMany()
                    .HasForeignKey(o => o.ModuleItemId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            
            modelBuilder.Entity<ClassroomModule>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => new { e.ClassroomId, e.OrderIndex }).IsUnique();
                entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
                entity.HasOne(e => e.Classroom)
                      .WithMany(c => c.Modules)
                      .HasForeignKey(e => e.ClassroomId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasQueryFilter(e => !e.IsDeleted);
            });

            
            modelBuilder.Entity<ClassroomModuleItem>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => new { e.ModuleId, e.OrderIndex }).IsUnique();
                entity.HasOne(e => e.Module)
                      .WithMany(m => m.Items)
                      .HasForeignKey(e => e.ModuleId)
                      .OnDelete(DeleteBehavior.Cascade);
                
                entity.ToTable(t => t.HasCheckConstraint("CK_ClassroomModuleItem_OneReference", 
                    "(\"LessonId\" IS NOT NULL AND \"QuizId\" IS NULL AND \"CodelabId\" IS NULL) OR " +
                    "(\"LessonId\" IS NULL AND \"QuizId\" IS NOT NULL AND \"CodelabId\" IS NULL) OR " +
                    "(\"LessonId\" IS NULL AND \"QuizId\" IS NULL AND \"CodelabId\" IS NOT NULL)"));

                entity.HasQueryFilter(e => !e.IsDeleted);
            });

            
            modelBuilder.Entity<TheoryArticle>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Slug).IsUnique();
                entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Slug).IsRequired().HasMaxLength(250);
                entity.Property(e => e.ContentMd).IsRequired();
                entity.Property(e => e.Category).HasMaxLength(100);
                entity.Property(e => e.Difficulty).HasMaxLength(30);
                entity.HasOne(e => e.Author)
                      .WithMany()
                      .HasForeignKey(e => e.AuthorId)
                      .OnDelete(DeleteBehavior.Restrict);
                entity.HasQueryFilter(e => !e.IsDeleted);
            });

            
            modelBuilder.Entity<TheoryArticleVersion>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.Article)
                      .WithMany(a => a.Versions)
                      .HasForeignKey(e => e.ArticleId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            
            modelBuilder.Entity<LessonTheoryArticle>(entity =>
            {
                entity.HasKey(e => new { e.LessonId, e.TheoryArticleId });
                entity.HasOne(e => e.Lesson)
                      .WithMany()
                      .HasForeignKey(e => e.LessonId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.TheoryArticle)
                      .WithMany()
                      .HasForeignKey(e => e.TheoryArticleId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            
            modelBuilder.Entity<ClassroomAnnouncement>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => new { e.ClassroomId, e.PublishedAt });
                entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
                entity.Property(e => e.ContentMd).IsRequired();
                entity.HasOne(e => e.Classroom)
                      .WithMany()
                      .HasForeignKey(e => e.ClassroomId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.Author)
                      .WithMany()
                      .HasForeignKey(e => e.AuthorId)
                      .OnDelete(DeleteBehavior.Restrict);
            });
            
            
            modelBuilder.Entity<UserModuleItemProgress>(entity =>
            {
                entity.HasKey(e => new { e.UserId, e.ModuleItemId, e.AttemptNumber });
                entity.Property(e => e.Status).IsRequired().HasMaxLength(30).HasDefaultValue("NotStarted");
                entity.Property(e => e.LastActiveFrameIndex).HasDefaultValue(0);
                entity.Property(e => e.LastScrollPercent).HasDefaultValue(0.0);
                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.ModuleItem)
                      .WithMany()
                      .HasForeignKey(e => e.ModuleItemId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Lesson>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<Quiz>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<Codelab>(entity => {
                entity.HasKey(e => e.Id);
                entity.HasQueryFilter(e => !e.IsDeleted);
            });

            modelBuilder.Entity<CodelabTestCase>(entity => {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.Codelab)
                    .WithMany(c => c.TestCases)
                    .HasForeignKey(e => e.CodelabId)
                    .OnDelete(DeleteBehavior.Restrict); 
            });

            modelBuilder.Entity<CodelabTemplate>(entity => {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.Codelab)
                    .WithMany(c => c.Templates)
                    .HasForeignKey(e => e.CodelabId)
                    .OnDelete(DeleteBehavior.Restrict); 
            });

            modelBuilder.Entity<CodelabHint>(entity => {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.Codelab)
                    .WithMany(c => c.Hints)
                    .HasForeignKey(e => e.CodelabId)
                    .OnDelete(DeleteBehavior.Restrict); 
            });

            modelBuilder.Entity<CodelabSubmission>(entity => {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => new { e.UserId, e.CodelabId, e.CreatedAt }).IsDescending(false, false, true); 
                
                entity.Property(e => e.Status).HasConversion<string>().HasMaxLength(30);

                entity.HasOne(e => e.User)
                    .WithMany()
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
                    
                entity.HasOne(e => e.Codelab)
                    .WithMany(c => c.Submissions)
                    .HasForeignKey(e => e.CodelabId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<UserInventory>()
                .HasOne(ui => ui.User)
                .WithMany()
                .HasForeignKey(ui => ui.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<CustomRoadmap>()
                .HasMany(r => r.Nodes)
                .WithOne(n => n.Roadmap)
                .HasForeignKey(n => n.RoadmapId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<CustomRoadmap>()
                .HasOne<User>()
                .WithMany()
                .HasForeignKey(r => r.TeacherId)
                .OnDelete(DeleteBehavior.Restrict);

            // User configuration
            
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Email).IsUnique();
                entity.HasIndex(e => e.Username).IsUnique();
                entity.HasIndex(e => e.TotalXP);
                entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
                entity.Property(e => e.Username).IsRequired().HasMaxLength(100);
                entity.Property(e => e.PasswordHash).IsRequired();
                entity.Property(e => e.TotalXP).HasDefaultValue(0);
                entity.Property(e => e.CurrentLevel).HasDefaultValue(1);
                entity.Property(e => e.StreakDays).HasDefaultValue(0);
                
                entity.Property(e => e.LastActivityDate).IsRequired(false);
                entity.Property(e => e.Role).IsRequired().HasMaxLength(20).HasDefaultValue("Student");
                entity.Property<uint>("xmin")
                    .HasColumnType("xid")
                    .ValueGeneratedOnAddOrUpdate()
                    .IsRowVersion();
            });

            
            modelBuilder.Entity<Badge>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Name).IsUnique();
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Description).HasMaxLength(500);
                entity.Property(e => e.Icon).HasMaxLength(50);
                entity.Property(e => e.Color).HasMaxLength(20);
            });

            
            modelBuilder.Entity<UserBadge>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => new { e.UserId, e.BadgeId }).IsUnique();
                entity.HasOne(e => e.User).WithMany(u => u.UserBadges).HasForeignKey(e => e.UserId);
                entity.HasOne(e => e.Badge).WithMany(b => b.UserBadges).HasForeignKey(e => e.BadgeId);
            });

            
            modelBuilder.Entity<Quiz>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Topic).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Difficulty).HasDefaultValue(1);
                entity.HasMany(e => e.Questions).WithOne().HasForeignKey(q => q.QuizId);
            });

            
            modelBuilder.Entity<QuizQuestion>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Question).IsRequired().HasMaxLength(500);
            });

            
            modelBuilder.Entity<QuizAttempt>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.User).WithMany(u => u.QuizAttempts).HasForeignKey(e => e.UserId);
                entity.HasOne(e => e.Quiz).WithMany(q => q.Attempts).HasForeignKey(e => e.QuizId);
            });

            
            modelBuilder.Entity<LearningProgress>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => new { e.UserId, e.ModuleId }).IsUnique();
                entity.HasOne(e => e.User).WithMany(u => u.LearningProgresses).HasForeignKey(e => e.UserId);
            });

            
            modelBuilder.Entity<RefreshToken>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Token).IsUnique();
                entity.Property(e => e.Token).IsRequired().HasMaxLength(128);
                entity.Property(e => e.IsRevoked).HasDefaultValue(false);
                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            
            modelBuilder.Entity<Order>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.PaymentCode).IsUnique();
                entity.HasIndex(e => e.TransactionReference).IsUnique();
                entity.Property(e => e.PaymentCode).IsRequired().HasMaxLength(50);
                entity.Property(e => e.TransactionReference).HasMaxLength(100);
                entity.Property(e => e.Status).IsRequired().HasMaxLength(20).HasDefaultValue("Pending");
                entity.Property(e => e.Amount).HasPrecision(18, 2);
                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            
            modelBuilder.Entity<SemanticConceptNode>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.ConceptKey).IsUnique();
                entity.HasIndex(e => e.Category);
                entity.Property(e => e.ConceptKey).IsRequired().HasMaxLength(150);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Category).IsRequired().HasMaxLength(60);
                entity.Property(e => e.Description).HasMaxLength(2000);
                
                var embeddingProp = entity.Property(e => e.Embedding);
                embeddingProp.HasColumnType("double precision[]");
                entity.Property(e => e.Importance).HasDefaultValue(0.0);
            });

            
            modelBuilder.Entity<KnowledgeEdge>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => new { e.SourceNodeId, e.TargetNodeId, e.RelationType }).IsUnique();
                entity.HasIndex(e => e.RelationType);
                entity.Property(e => e.RelationType).IsRequired().HasMaxLength(60);
                entity.Property(e => e.Weight).HasDefaultValue(1.0);

                entity.HasOne(e => e.SourceNode)
                      .WithMany(n => n.OutgoingEdges)
                      .HasForeignKey(e => e.SourceNodeId)
                      .OnDelete(DeleteBehavior.Cascade);

                
                entity.HasOne(e => e.TargetNode)
                      .WithMany(n => n.IncomingEdges)
                      .HasForeignKey(e => e.TargetNodeId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            
            modelBuilder.Entity<SystemAuditEventStream>(entity =>
            {
                entity.HasKey(e => e.Id);
                
                entity.HasIndex(e => e.OccurredAt);
                entity.HasIndex(e => e.Sequence);
                entity.HasIndex(e => new { e.UserId, e.OccurredAt });
                entity.HasIndex(e => e.EventType);
                entity.Property(e => e.EventType).IsRequired().HasMaxLength(120);
                entity.Property(e => e.CorrelationId).HasMaxLength(100);
                entity.Property(e => e.HttpMethod).HasMaxLength(10);
                entity.Property(e => e.Path).HasMaxLength(500);
                
                var payloadProp = entity.Property(e => e.Payload);
                payloadProp.HasColumnType("jsonb");
            });

            
            modelBuilder.Entity<Course>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Category).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Difficulty).HasMaxLength(30);
                entity.HasOne(e => e.Teacher)
                      .WithMany()
                      .HasForeignKey(e => e.TeacherId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            
            modelBuilder.Entity<Lesson>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
                entity.Property(e => e.SandboxType).HasMaxLength(50);
                
                
            });

            
            modelBuilder.Entity<UserLessonProgress>(entity =>
            {
                entity.HasKey(e => new { e.UserId, e.LessonId });
                entity.Property(e => e.Status).IsRequired().HasMaxLength(30).HasDefaultValue("NotStarted");
                entity.Property(e => e.LastActiveFrameIndex).HasDefaultValue(0);
                entity.Property(e => e.LastScrollPercent).HasDefaultValue(0.0);
                entity.HasOne(e => e.User)
                      .WithMany(u => u.UserLessonProgresses)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.Lesson)
                      .WithMany(l => l.Progresses)
                      .HasForeignKey(e => e.LessonId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // LearningSession configuration
            modelBuilder.Entity<LearningSession>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => new { e.UserId, e.NodeId });
                entity.Property(e => e.CurrentStep).IsRequired().HasMaxLength(50).HasDefaultValue("Theory");
                entity.HasOne(e => e.User)
                      .WithMany(u => u.LearningSessions)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // LessonComment configuration
            
            modelBuilder.Entity<LessonComment>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Content).IsRequired().HasMaxLength(2000);
                entity.HasOne(e => e.Lesson)
                      .WithMany()
                      .HasForeignKey(e => e.LessonId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.ParentComment)
                      .WithMany(c => c.Replies)
                      .HasForeignKey(e => e.ParentId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            
            modelBuilder.Entity<AuditLog>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Action).IsRequired().HasMaxLength(100);
                entity.Property(e => e.ActorName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Details).HasMaxLength(2000);
                entity.HasIndex(e => e.CreatedAt);
            });

            
            modelBuilder.Entity<Notification>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Content).IsRequired().HasMaxLength(1000);
                entity.Property(e => e.LinkUrl).HasMaxLength(500);
                entity.Property(e => e.DeepLink).HasMaxLength(500);
                entity.Property(e => e.Type).IsRequired().HasMaxLength(50).HasDefaultValue("General");
                entity.HasIndex(e => e.CreatedAt);
                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // TeacherApplication configuration
            modelBuilder.Entity<TeacherApplication>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.SchoolName).IsRequired().HasMaxLength(200);
                entity.Property(e => e.CvUrl).IsRequired().HasMaxLength(500);
                entity.Property(e => e.Reason).IsRequired().HasMaxLength(1000);
                entity.Property(e => e.Status).IsRequired().HasMaxLength(20).HasDefaultValue("Pending");
                entity.Property(e => e.RejectReason).HasMaxLength(500);
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.Status);
                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // ClassroomLeaderboardHistory configuration
            modelBuilder.Entity<ClassroomLeaderboardHistory>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.ClassroomId);
                entity.HasIndex(e => e.WeekStart);
                entity.Property(e => e.ClassroomId).IsRequired().HasMaxLength(36);
                entity.Property(e => e.RankingsJson).HasColumnType("jsonb");
            });

            // RoadmapEditLog configuration
            modelBuilder.Entity<RoadmapEditLog>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.ChangeType).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Note).HasMaxLength(500);
                
                entity.HasOne(e => e.Roadmap)
                      .WithMany()
                      .HasForeignKey(e => e.RoadmapId)
                      .OnDelete(DeleteBehavior.Cascade);
                      
                entity.HasOne(e => e.Editor)
                      .WithMany()
                      .HasForeignKey(e => e.EditorId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // ContentReport configuration
            modelBuilder.Entity<ContentReport>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Reason).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Detail).HasMaxLength(1000);
                entity.Property(e => e.Status).IsRequired().HasMaxLength(20).HasDefaultValue("Pending");
                
                entity.HasOne(e => e.Node)
                      .WithMany()
                      .HasForeignKey(e => e.NodeId)
                      .OnDelete(DeleteBehavior.Cascade);
                      
                entity.HasOne(e => e.Reporter)
                      .WithMany()
                      .HasForeignKey(e => e.ReporterId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // KeywordBlacklist configuration
            modelBuilder.Entity<KeywordBlacklist>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Keyword).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Category).IsRequired().HasMaxLength(50).HasDefaultValue("general");
                entity.HasIndex(e => e.Keyword).IsUnique();
            });

            // UserDailyQuest configuration
            modelBuilder.Entity<UserDailyQuest>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => new { e.UserId, e.Date });
                entity.Property(e => e.QuestType).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Difficulty).IsRequired().HasMaxLength(20);
                entity.Property(e => e.Description).IsRequired().HasMaxLength(200);
                
                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // QuestTemplate configuration and Seeding
            modelBuilder.Entity<QuestTemplate>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.QuestType).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Difficulty).IsRequired().HasMaxLength(20);
                entity.Property(e => e.Description).IsRequired().HasMaxLength(200);

                // Seed some basic quest templates
                var seedData = new[]
                {
                    new { Id = Guid.Parse("11111111-1111-1111-1111-111111111111"), QuestType = "EARN_XP", Difficulty = "Easy", Description = "Kiếm 50 XP", TargetValue = 50, GemsReward = 10, IsActive = true },
                    new { Id = Guid.Parse("22222222-2222-2222-2222-222222222222"), QuestType = "COMPLETE_QUIZ", Difficulty = "Easy", Description = "Hoàn thành 1 bài trắc nghiệm", TargetValue = 1, GemsReward = 10, IsActive = true },
                    new { Id = Guid.Parse("33333333-3333-3333-3333-333333333333"), QuestType = "COMPLETE_MODULE", Difficulty = "Medium", Description = "Hoàn thành 1 bài học (Module)", TargetValue = 1, GemsReward = 20, IsActive = true },
                    new { Id = Guid.Parse("44444444-4444-4444-4444-444444444444"), QuestType = "EARN_XP", Difficulty = "Medium", Description = "Kiếm 150 XP", TargetValue = 150, GemsReward = 20, IsActive = true },
                    new { Id = Guid.Parse("55555555-5555-5555-5555-555555555555"), QuestType = "PERFECT_QUIZ", Difficulty = "Hard", Description = "Hoàn thành 1 bài trắc nghiệm với điểm tối đa", TargetValue = 1, GemsReward = 50, IsActive = true },
                    new { Id = Guid.Parse("66666666-6666-6666-6666-666666666666"), QuestType = "EARN_XP", Difficulty = "Hard", Description = "Kiếm 300 XP", TargetValue = 300, GemsReward = 50, IsActive = true }
                };

                entity.HasData(seedData);
            });
        }
    }
}
