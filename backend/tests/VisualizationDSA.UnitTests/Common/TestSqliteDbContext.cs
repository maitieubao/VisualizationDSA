using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using System;
using System.Linq;
using VisualizationDSA.Infrastructure.Data;

namespace VisualizationDSA.UnitTests.Common;

/// <summary>
/// ApplicationDbContext cho test trên SQLite in-memory:
/// - EnsureCreated thay Migrate (migration cũ tham chiếu Npgsql 9 không chạy được với EF Core 10);
/// - Guid được lưu TEXT định dạng "D" (GuidToStringConverter) — khớp với cách migration gốc lưu
///   cột "uuid", nên lookup kiểu `u.Id.ToString() == id` của controller hoạt động đúng.
/// </summary>
public sealed class TestSqliteDbContext : ApplicationDbContext
{
    public TestSqliteDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        var converter = new GuidToStringConverter();
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            foreach (var property in entityType.GetProperties()
                .Where(p => p.ClrType == typeof(Guid) || p.ClrType == typeof(Guid?)))
            {
                property.SetValueConverter(converter);
            }
        }
    }

    public static (TestSqliteDbContext Db, SqliteConnection Connection) Create()
    {
        var connection = new SqliteConnection("DataSource=:memory:");
        connection.Open();
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlite(connection)
            .Options;
        var ctx = new TestSqliteDbContext(options);
        ctx.Database.EnsureCreated();
        return (ctx, connection);
    }
}
