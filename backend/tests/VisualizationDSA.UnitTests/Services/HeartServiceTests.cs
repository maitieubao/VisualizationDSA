using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Infrastructure.Data;
using VisualizationDSA.Infrastructure.Services;
using Xunit;

namespace VisualizationDSA.UnitTests.Services
{
    public class HeartServiceTests
    {
        private ApplicationDbContext GetInMemoryDbContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseSqlite($"Data Source=file:{Guid.NewGuid()}?mode=memory&cache=shared")
                .Options;

            var dbContext = new ApplicationDbContext(options);
            dbContext.Database.OpenConnection();
            dbContext.Database.EnsureCreated();
            return dbContext;
        }

        [Fact]
        public async Task DeductHeartAtomicAsync_WithHearts_DecrementsHearts()
        {
            // Arrange
            using var db = GetInMemoryDbContext();
            var user = new User("test@example.com", "testuser", "hash");
            db.Users.Add(user);
            await db.SaveChangesAsync();
            db.ChangeTracker.Clear();

            var service = new HeartService(db);

            // Act
            var result = await service.DeductHeartAtomicAsync(user.Id);

            // Assert
            Assert.True(result);
            var updatedUser = await db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == user.Id);
            Assert.NotNull(updatedUser);
            Assert.Equal(9, updatedUser!.Hearts);
            Assert.NotNull(updatedUser.LastHeartUsedAt);
        }

        [Fact]
        public async Task DeductHeartAtomicAsync_WithZeroHearts_ReturnsFalse()
        {
            // Arrange
            using var db = GetInMemoryDbContext();
            var user = new User("zero@example.com", "zerouser", "hash");
            db.Users.Add(user);
            await db.SaveChangesAsync();

            // Manually set hearts to 0 in DB
            await db.Database.ExecuteSqlInterpolatedAsync($"UPDATE Users SET Hearts = 0 WHERE Id = {user.Id}");
            db.ChangeTracker.Clear();

            var service = new HeartService(db);

            // Act
            var result = await service.DeductHeartAtomicAsync(user.Id);

            // Assert
            Assert.False(result);
            var updatedUser = await db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == user.Id);
            Assert.Equal(0, updatedUser!.Hearts);
        }

        [Fact]
        public void CalculateRecoveredHearts_FreeUser_RecoversOneHeartPerHour()
        {
            // Arrange
            using var db = GetInMemoryDbContext();
            var service = new HeartService(db);

            var user = new User("free@example.com", "freeuser", "hash");
            // Set user to 5 hearts, last used 2.5 hours ago
            var lastUsed = DateTime.UtcNow.AddHours(-2.5);
            
            typeof(User).GetProperty("Hearts")!.SetValue(user, 5);
            typeof(User).GetProperty("LastHeartUsedAt")!.SetValue(user, lastUsed);

            // Act
            var recovered = service.CalculateRecoveredHearts(user);

            // Assert: 2.5 hours = 2 full hours -> 2 hearts recovered
            Assert.Equal(2, recovered);
        }

        [Fact]
        public void CalculateRecoveredHearts_PremiumUser_RecoversOneHeartPerThirtyMins()
        {
            // Arrange
            using var db = GetInMemoryDbContext();
            var service = new HeartService(db);

            var user = new User("prem@example.com", "premuser", "hash");
            user.SetPremium(DateTime.UtcNow.AddDays(30));
            // Set user to 20 hearts out of max 30, last used 90 minutes ago
            var lastUsed = DateTime.UtcNow.AddMinutes(-90);
            typeof(User).GetProperty("Hearts")!.SetValue(user, 20);
            typeof(User).GetProperty("LastHeartUsedAt")!.SetValue(user, lastUsed);

            // Act
            var recovered = service.CalculateRecoveredHearts(user);

            // Assert: 90 mins = 3 full 30-min intervals -> 3 hearts recovered
            Assert.Equal(3, recovered);
        }

        [Fact]
        public async Task WatchAdAsync_IncreasesHeartsByTwo()
        {
            // Arrange
            using var db = GetInMemoryDbContext();
            var user = new User("ad@example.com", "aduser", "hash");
            db.Users.Add(user);
            await db.SaveChangesAsync();

            // Set hearts to 5
            await db.Database.ExecuteSqlInterpolatedAsync($"UPDATE Users SET Hearts = 5 WHERE Id = {user.Id}");
            db.ChangeTracker.Clear();

            var service = new HeartService(db);

            // Act
            var result = await service.WatchAdAsync(user.Id);

            // Assert
            Assert.Equal(7, result.Hearts);
            Assert.Equal(1, result.AdsWatchedToday);
            Assert.Equal(4, result.AdsRemainingToday);
        }

        [Fact]
        public async Task WatchAdAsync_ExceedingFiveAds_ThrowsInvalidOperationException()
        {
            // Arrange
            using var db = GetInMemoryDbContext();
            var user = new User("adlimit@example.com", "adlimituser", "hash");
            db.Users.Add(user);
            await db.SaveChangesAsync();

            // Set AdWatchCount to 5 and FirstAdAt to now
            var now = DateTime.UtcNow;
            await db.Database.ExecuteSqlInterpolatedAsync($"UPDATE Users SET AdWatchCount = 5, FirstAdAt = {now} WHERE Id = {user.Id}");
            db.ChangeTracker.Clear();

            var service = new HeartService(db);

            // Act & Assert
            var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => service.WatchAdAsync(user.Id));
            Assert.Contains("AD_LIMIT_REACHED", ex.Message);
        }
    }
}
