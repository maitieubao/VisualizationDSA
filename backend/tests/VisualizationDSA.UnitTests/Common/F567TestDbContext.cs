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
    /// F5/F6/F7 — DbContext test độc lập cho 3 bảng mới.
    /// ApplicationDbContext.cs KHÔNG được sửa vĩnh viễn (chỉ ghi dòng DbSet vào weld-f567.md),
    /// nên test tự cấu hình lại 3 entity + unique index khớp migration GapF567NotesFavoritesSettings.
    /// </summary>
    public sealed class F567TestDbContext : ApplicationDbContext
    {
        public F567TestDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

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

            modelBuilder.Entity<LessonNote>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => new { e.UserId, e.LessonId }).IsUnique();
                entity.Property(e => e.ContentHtml).IsRequired();
                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.Lesson)
                      .WithMany()
                      .HasForeignKey(e => e.LessonId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Favorite>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => new { e.UserId, e.SimulationKey }).IsUnique();
                entity.Property(e => e.SimulationKey).IsRequired().HasMaxLength(120);
                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<SystemSetting>(entity =>
            {
                entity.HasKey(e => e.Key);
                entity.Property(e => e.Key).HasMaxLength(150);
                entity.Property(e => e.Value).IsRequired();
                entity.Property(e => e.Description).HasMaxLength(500);
            });
        }

        public static (F567TestDbContext Db, SqliteConnection Connection) Create()
        {
            var connection = new SqliteConnection("DataSource=:memory:");
            connection.Open();
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseSqlite(connection)
                .Options;
            var ctx = new F567TestDbContext(options);
            ctx.Database.EnsureCreated();
            return (ctx, connection);
        }
    }
}
