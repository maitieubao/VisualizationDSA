using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using System;
using VisualizationDSA.Infrastructure.Data;

namespace VisualizationDSA.UnitTests.Common;

public static class TestDbContextFactory
{
    public static (ApplicationDbContext Context, SqliteConnection Connection) Create()
    {
        var connection = new SqliteConnection("DataSource=:memory:");
        connection.Open();
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlite(connection)
            .Options;
        var ctx = new ApplicationDbContext(options);
        ctx.Database.Migrate();
        return (ctx, connection);
    }

    public static (ApplicationDbContext Context, SqliteConnection Connection) CreateFromConnection(SqliteConnection connection)
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlite(connection)
            .Options;
        var ctx = new ApplicationDbContext(options);
        return (ctx, connection);
    }

    public static ApplicationDbContext CreateSimple(string dbName = "TestDb")
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;
        var ctx = new ApplicationDbContext(options);
        return ctx;
    }
}
