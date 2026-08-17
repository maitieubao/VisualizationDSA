using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using System;
using System.Linq;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Infrastructure.Data;

namespace VisualizationDSA.UnitTests.Common
{
    /// <summary>
    /// F9 — DbContext test độc lập cho Learning Path + Tim.
    /// ApplicationDbContext.cs KHÔNG được sửa vĩnh viễn (chỉ ghi dòng DbSet vào weld-f9.md),
    /// nên test tự cấu hình 4 entity + unique index khớp migration GapF9LearningPathHearts.
    /// </summary>
    public sealed class F9LearningPathTestDbContext : ApplicationDbContext
    {
        public F9LearningPathTestDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            var converter = new GuidToStringConverter();
            foreach (var property in modelBuilder.Model.GetEntityTypes()
                .SelectMany(e => e.GetProperties())
                .Where(p => p.ClrType == typeof(Guid) || p.ClrType == typeof(Guid?)))
            {
                property.SetValueConverter(converter);
            }

            modelBuilder.Entity<LearningPath>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            });

            modelBuilder.Entity<LearningPathNode>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => new { e.LearningPathId, e.OrderIndex }).IsUnique();
                entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
                entity.HasOne(e => e.LearningPath)
                      .WithMany(p => p.Nodes)
                      .HasForeignKey(e => e.LearningPathId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.Lesson)
                      .WithMany()
                      .HasForeignKey(e => e.LessonId)
                      .OnDelete(DeleteBehavior.SetNull);
            });

            modelBuilder.Entity<UserNodeProgress>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => new { e.UserId, e.NodeId }).IsUnique();
                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.Node)
                      .WithMany()
                      .HasForeignKey(e => e.NodeId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<NodeSession>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => new { e.UserId, e.NodeId }).IsUnique();
                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.Node)
                      .WithMany()
                      .HasForeignKey(e => e.NodeId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
        }

        public static (F9LearningPathTestDbContext Db, SqliteConnection Connection) Create()
        {
            var connection = new SqliteConnection("DataSource=:memory:");
            connection.Open();
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseSqlite(connection)
                .Options;
            var ctx = new F9LearningPathTestDbContext(options);
            ctx.Database.EnsureCreated();
            return (ctx, connection);
        }
    }
}
