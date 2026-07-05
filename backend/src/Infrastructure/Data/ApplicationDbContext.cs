using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using VisualizationDSA.Domain.Entities;

namespace VisualizationDSA.Infrastructure.Data
{
    public class ApplicationDbContext : DbContext
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
        public DbSet<LessonComment>  LessonComments  { get; set; }
        public DbSet<AuditLog>       AuditLogs       { get; set; }
        public DbSet<Notification>   Notifications   { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

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
                // ✅ FIX 3.4: LastActivityDate — nullable, dùng để tính streak chính xác
                entity.Property(e => e.LastActivityDate).IsRequired(false);
                entity.Property(e => e.Role).IsRequired().HasMaxLength(20).HasDefaultValue("Student");
                if (!Database.IsSqlite())
                {
                    entity.Property<uint>("xmin")
                        .HasColumnType("xid")
                        .ValueGeneratedOnAddOrUpdate()
                        .IsRowVersion();
                }
            });

            // Badge configuration
            modelBuilder.Entity<Badge>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Name).IsUnique();
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Description).HasMaxLength(500);
                entity.Property(e => e.Icon).HasMaxLength(50);
                entity.Property(e => e.Color).HasMaxLength(20);
            });

            // UserBadge configuration (many-to-many)
            modelBuilder.Entity<UserBadge>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => new { e.UserId, e.BadgeId }).IsUnique();
                entity.HasOne(e => e.User).WithMany(u => u.UserBadges).HasForeignKey(e => e.UserId);
                entity.HasOne(e => e.Badge).WithMany(b => b.UserBadges).HasForeignKey(e => e.BadgeId);
            });

            // Quiz configuration
            modelBuilder.Entity<Quiz>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Topic).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Difficulty).HasDefaultValue(1);
                entity.HasMany(e => e.Questions).WithOne().HasForeignKey(q => q.QuizId);
            });

            // QuizQuestion configuration
            modelBuilder.Entity<QuizQuestion>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Question).IsRequired().HasMaxLength(500);
            });

            // QuizAttempt configuration
            modelBuilder.Entity<QuizAttempt>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.User).WithMany(u => u.QuizAttempts).HasForeignKey(e => e.UserId);
                entity.HasOne(e => e.Quiz).WithMany(q => q.Attempts).HasForeignKey(e => e.QuizId);
            });

            // LearningProgress configuration
            modelBuilder.Entity<LearningProgress>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => new { e.UserId, e.ModuleId }).IsUnique();
                entity.HasOne(e => e.User).WithMany(u => u.LearningProgresses).HasForeignKey(e => e.UserId);
            });

            // RefreshToken configuration
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

            // Order configuration
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

            // SemanticConceptNode configuration — đỉnh đồ thị tri thức (Graph RAG)
            modelBuilder.Entity<SemanticConceptNode>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.ConceptKey).IsUnique();
                entity.HasIndex(e => e.Category);
                entity.Property(e => e.ConceptKey).IsRequired().HasMaxLength(150);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Category).IsRequired().HasMaxLength(60);
                entity.Property(e => e.Description).HasMaxLength(2000);
                // Vector embedding ngữ nghĩa — ánh xạ sang double precision[] của PostgreSQL.
                var embeddingProp = entity.Property(e => e.Embedding);
                if (Database.IsSqlite())
                {
                    embeddingProp.HasConversion(
                        v => v == null ? null : string.Join(",", v),
                        v => string.IsNullOrEmpty(v) ? Array.Empty<double>() : v.Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries).Select(double.Parse).ToArray()
                    );
                }
                else
                {
                    embeddingProp.HasColumnType("double precision[]");
                }
                entity.Property(e => e.Importance).HasDefaultValue(0.0);
            });

            // KnowledgeEdge configuration — cạnh có hướng giữa hai concept node
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

                // Restrict ở chiều còn lại để tránh multiple cascade paths trên cùng một bảng.
                entity.HasOne(e => e.TargetNode)
                      .WithMany(n => n.IncomingEdges)
                      .HasForeignKey(e => e.TargetNodeId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // SystemAuditEventStream configuration — Event Sourcing Ledger (append-only time-series)
            modelBuilder.Entity<SystemAuditEventStream>(entity =>
            {
                entity.HasKey(e => e.Id);
                // Index thời gian + sequence để truy vấn time-series hiệu quả.
                entity.HasIndex(e => e.OccurredAt);
                entity.HasIndex(e => e.Sequence);
                entity.HasIndex(e => new { e.UserId, e.OccurredAt });
                entity.HasIndex(e => e.EventType);
                entity.Property(e => e.EventType).IsRequired().HasMaxLength(120);
                entity.Property(e => e.CorrelationId).HasMaxLength(100);
                entity.Property(e => e.HttpMethod).HasMaxLength(10);
                entity.Property(e => e.Path).HasMaxLength(500);
                // Payload thô lưu dạng JSONB của PostgreSQL.
                var payloadProp = entity.Property(e => e.Payload);
                if (!Database.IsSqlite())
                {
                    payloadProp.HasColumnType("jsonb");
                }
            });

            // Course configuration
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

            // Lesson configuration
            modelBuilder.Entity<Lesson>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
                entity.Property(e => e.SandboxType).HasMaxLength(50);
                entity.HasOne(e => e.Course)
                      .WithMany(c => c.Lessons)
                      .HasForeignKey(e => e.CourseId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.Quiz)
                      .WithMany()
                      .HasForeignKey(e => e.QuizId)
                      .OnDelete(DeleteBehavior.SetNull);
            });

            // UserLessonProgress configuration
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

            // AuditLog configuration
            modelBuilder.Entity<AuditLog>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Action).IsRequired().HasMaxLength(100);
                entity.Property(e => e.ActorName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Details).HasMaxLength(2000);
                entity.HasIndex(e => e.CreatedAt);
            });

            // Notification configuration
            modelBuilder.Entity<Notification>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Content).IsRequired().HasMaxLength(1000);
                entity.Property(e => e.LinkUrl).HasMaxLength(500);
                entity.HasIndex(e => e.CreatedAt);
                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
