using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using VisualizationDSA.Application.DTOs;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Infrastructure.Data;
using VisualizationDSA.Infrastructure.Services;
using Xunit;

namespace VisualizationDSA.UnitTests.Services
{
    public class TeacherApplicationServiceTests
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
        public async Task SubmitApplication_ValidData_CreatesApplication()
        {
            // Arrange
            using var db = GetInMemoryDbContext();
            var user = new User("student@example.com", "student1", "hash");
            db.Users.Add(user);
            await db.SaveChangesAsync();

            var service = new TeacherApplicationService(db);
            var dto = new SubmitTeacherApplicationDto
            {
                SchoolName = "FPT University",
                CvUrl = "https://example.com/cv.pdf",
                Reason = "I want to share my DSA knowledge with everyone."
            };

            // Act
            var result = await service.SubmitApplicationAsync(user.Id, dto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Pending", result.Status);
            Assert.Equal(dto.SchoolName, result.SchoolName);
            
            var savedUser = await db.Users.FindAsync(user.Id);
            Assert.Equal("Pending", savedUser!.TeacherAppStatus);
        }

        [Fact]
        public async Task SubmitApplication_UserIsTeacher_ThrowsInvalidOperationException()
        {
            // Arrange
            using var db = GetInMemoryDbContext();
            var user = new User("teacher@example.com", "teacher1", "hash");
            user.SetRole("Teacher");
            db.Users.Add(user);
            await db.SaveChangesAsync();

            var service = new TeacherApplicationService(db);
            var dto = new SubmitTeacherApplicationDto();

            // Act & Assert
            await Assert.ThrowsAsync<InvalidOperationException>(() =>
                service.SubmitApplicationAsync(user.Id, dto));
        }

        [Fact]
        public async Task SubmitApplication_HasPending_ThrowsInvalidOperationException()
        {
            // Arrange
            using var db = GetInMemoryDbContext();
            var user = new User("student@example.com", "student2", "hash");
            db.Users.Add(user);
            
            var existingApp = new TeacherApplication(user.Id, "School", "cv", "reason");
            db.TeacherApplications.Add(existingApp);
            await db.SaveChangesAsync();

            var service = new TeacherApplicationService(db);
            var dto = new SubmitTeacherApplicationDto();

            // Act & Assert
            await Assert.ThrowsAsync<InvalidOperationException>(() =>
                service.SubmitApplicationAsync(user.Id, dto));
        }

        [Fact]
        public async Task ApproveApplication_SetsRoleAndNotifies()
        {
            // Arrange
            using var db = GetInMemoryDbContext();
            var user = new User("student@example.com", "student3", "hash");
            var admin = new User("admin@example.com", "admin1", "hash");
            db.Users.AddRange(user, admin);
            
            var app = new TeacherApplication(user.Id, "School", "cv", "reason");
            db.TeacherApplications.Add(app);
            await db.SaveChangesAsync();

            var service = new TeacherApplicationService(db);

            // Act
            var result = await service.ApproveApplicationAsync(app.Id, admin.Id);

            // Assert
            Assert.Equal("Approved", result.Status);
            Assert.Equal(admin.Id, result.ReviewedBy);

            var savedUser = await db.Users.FindAsync(user.Id);
            Assert.Equal("Teacher", savedUser!.Role);
            Assert.Equal("Approved", savedUser.TeacherAppStatus);

            var notification = await db.Notifications.FirstOrDefaultAsync(n => n.UserId == user.Id);
            Assert.NotNull(notification);
            Assert.Contains("duyệt", notification.Content);
        }

        [Fact]
        public async Task RejectApplication_SetsCooldownAndReason()
        {
            // Arrange
            using var db = GetInMemoryDbContext();
            var user = new User("student@example.com", "student4", "hash");
            var admin = new User("admin@example.com", "admin2", "hash");
            db.Users.AddRange(user, admin);
            
            var app = new TeacherApplication(user.Id, "School", "cv", "reason");
            db.TeacherApplications.Add(app);
            await db.SaveChangesAsync();

            var service = new TeacherApplicationService(db);
            var rejectReason = "Không đủ kinh nghiệm";

            // Act
            var result = await service.RejectApplicationAsync(app.Id, admin.Id, rejectReason);

            // Assert
            Assert.Equal("Rejected", result.Status);
            Assert.Equal(rejectReason, result.RejectReason);
            Assert.NotNull(result.CooldownUntil);
            Assert.True(result.CooldownUntil.Value > DateTime.UtcNow.AddDays(29));

            var savedUser = await db.Users.FindAsync(user.Id);
            Assert.Equal("Rejected", savedUser!.TeacherAppStatus);
            
            // Wait, we need to check if SubmitApplication fails during cooldown
            var dto = new SubmitTeacherApplicationDto
            {
                SchoolName = "FPT",
                CvUrl = "cv",
                Reason = "Reason reason"
            };

            await Assert.ThrowsAsync<InvalidOperationException>(() =>
                service.SubmitApplicationAsync(user.Id, dto));
        }
    }
}
