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
    /// F8 — DbContext test độc lập cho bảng StageProgress.
    /// ApplicationDbContext.cs KHÔNG được sửa vĩnh viễn (chỉ ghi dòng DbSet vào weld-f8.md),
    /// nên test tự cấu hình entity + unique index khớp migration GapF8StageProgress.
    /// </summary>
    public sealed class F8LadderTestDbContext : ApplicationDbContext
    {
        public F8LadderTestDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

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

            modelBuilder.Entity<StageProgress>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => new { e.UserId, e.LessonId, e.Stage }).IsUnique();
                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.Lesson)
                      .WithMany()
                      .HasForeignKey(e => e.LessonId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
        }

        public static (F8LadderTestDbContext Db, SqliteConnection Connection) Create()
        {
            var connection = new SqliteConnection("DataSource=:memory:");
            connection.Open();
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseSqlite(connection)
                .Options;
            var ctx = new F8LadderTestDbContext(options);
            ctx.Database.EnsureCreated();
            return (ctx, connection);
        }
    }
}
