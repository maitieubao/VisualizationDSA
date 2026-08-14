using System;
using System.Linq;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using VisualizationDSA.Application.Services;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Enums;
using VisualizationDSA.Infrastructure.Data;
using VisualizationDSA.Infrastructure.Services;
using VisualizationDSA.UnitTests.Common;
using Xunit;

namespace VisualizationDSA.UnitTests.Services
{
    /// <summary>
    /// C2: DeadlineReminderService — nhắc học viên chưa hoàn thành item có DueAt trong 24h tới.
    /// Gọi trực tiếp method private qua reflection (BackgroundService.ExecuteAsync loop vô hạn).
    /// Dùng InMemory (CreateSimple) để tránh constraint RowVersion của SQLite EnsureCreated.
    /// </summary>
    public class DeadlineReminderServiceTests
    {
        private static ApplicationDbContext CreateDb(string name) => TestDbContextFactory.CreateSimple("dl-" + name);

        private static DeadlineReminderService CreateService(ApplicationDbContext db, INotificationService notifier)
        {
            var services = new ServiceCollection();
            services.AddSingleton(db);
            services.AddSingleton(notifier);
            var provider = services.BuildServiceProvider();
            var factory = new Mock<IServiceScopeFactory>();
            var scope = new Mock<IServiceScope>();
            scope.Setup(s => s.ServiceProvider).Returns(provider);
            factory.Setup(f => f.CreateScope()).Returns(scope.Object);
            return new DeadlineReminderService(NullLogger<DeadlineReminderService>.Instance, factory.Object);
        }

        private static Task RemindAsync(DeadlineReminderService service)
        {
            var method = typeof(DeadlineReminderService).GetMethod("RemindDeadlinesAsync", BindingFlags.NonPublic | BindingFlags.Instance)!;
            return (Task)method.Invoke(service, new object[] { CancellationToken.None })!;
        }

        private static ClassroomEnrollment Enroll(ApplicationDbContext db, Classroom classroom, Guid studentId)
        {
            var e = new ClassroomEnrollment(classroom.Id, studentId);
            db.ClassroomEnrollments.Add(e);
            return e;
        }

        private static (Classroom classroom, ClassroomModule module) SetupClassroom(ApplicationDbContext db, Guid teacherId)
        {
            var classroom = new Classroom(teacherId, "Lớp A", "", "CODE1");
            db.Classrooms.Add(classroom);
            var module = new ClassroomModule(classroom.Id, "Chặng 1", "", 1000);
            db.ClassroomModules.Add(module);
            db.SaveChanges();
            return (classroom, module);
        }

        [Fact]
        public async Task Remind_ItemDueWithin24h_NotifiesIncompleteStudentsOnly()
        {
            var db = CreateDb("remind-1");
            try
            {
                var teacher = new User("t@test.com", "t", "h");
                db.Users.Add(teacher);
                db.SaveChanges();
                var (classroom, module) = SetupClassroom(db, teacher.Id);

                // 2 học viên: s1 chưa hoàn thành (nhận nhắc), s2 đã hoàn thành (bỏ qua).
                var s1 = new User("s1@test.com", "s1", "h");
                var s2 = new User("s2@test.com", "s2", "h");
                db.Users.AddRange(s1, s2);
                db.SaveChanges();
                Enroll(db, classroom, s1.Id);
                Enroll(db, classroom, s2.Id);

                // Lesson thật (FK hợp lệ) + item có DueAt trong 12h tới.
                var lesson = new Lesson("Bài tập deadline", "Nội dung", "dsa", "{}", 10);
                db.Lessons.Add(lesson);
                db.SaveChanges();
                var item = new ClassroomModuleItem(module.Id, ModuleItemType.Lesson, lesson.Id, null, null,
                    "Bài tập deadline", "", 1000, true, null, DateTime.UtcNow.AddHours(12), null, false, null, false);
                db.ClassroomModuleItems.Add(item);

                // s2 đã hoàn thành item.
                var progress = new UserModuleItemProgress(s2.Id, item.Id);
                progress.UpdateProgress(activeFrame: 0, scrollPercent: 100, isCompleted: true, score: null);
                db.UserModuleItemProgresses.Add(progress);
                db.SaveChanges();

                var notifier = new Mock<INotificationService>();
                var service = CreateService(db, notifier.Object);
                await RemindAsync(service);

                notifier.Verify(n => n.NotifyUserAsync(s1.Id, It.Is<string>(c => c.Contains("Bài tập deadline")), It.IsAny<string>()), Times.Once);
                notifier.Verify(n => n.NotifyUserAsync(s2.Id, It.IsAny<string>(), It.IsAny<string>()), Times.Never);
            }
            finally
            {
                db.Dispose();
            }
        }

        [Fact]
        public async Task Remind_ItemDueLaterThan24h_DoesNotNotify()
        {
            var db = CreateDb("remind-2");
            try
            {
                var teacher = new User("t2@test.com", "t2", "h");
                db.Users.Add(teacher);
                db.SaveChanges();
                var (classroom, module) = SetupClassroom(db, teacher.Id);

                var s1 = new User("s3@test.com", "s3", "h");
                db.Users.Add(s1);
                db.SaveChanges();
                Enroll(db, classroom, s1.Id);

                // DueAt 3 ngày nữa — ngoài cửa sổ 24h.
                var lesson = new Lesson("Xa hạn", "Nội dung", "dsa", "{}", 10);
                db.Lessons.Add(lesson);
                db.SaveChanges();
                var item = new ClassroomModuleItem(module.Id, ModuleItemType.Lesson, lesson.Id, null, null,
                    "Xa hạn", "", 1000, true, null, DateTime.UtcNow.AddDays(3), null, false, null, false);
                db.ClassroomModuleItems.Add(item);
                db.SaveChanges();

                var notifier = new Mock<INotificationService>();
                var service = CreateService(db, notifier.Object);
                await RemindAsync(service);

                notifier.Verify(n => n.NotifyUserAsync(It.IsAny<Guid>(), It.IsAny<string>(), It.IsAny<string>()), Times.Never);
            }
            finally
            {
                db.Dispose();
            }
        }

        [Fact]
        public async Task Remind_SameItemAndStudent_DoesNotNotifyTwiceInSameRun()
        {
            var db = CreateDb("remind-3");
            try
            {
                var teacher = new User("t3@test.com", "t3", "h");
                db.Users.Add(teacher);
                db.SaveChanges();
                var (classroom, module) = SetupClassroom(db, teacher.Id);

                var s1 = new User("s4@test.com", "s4", "h");
                db.Users.Add(s1);
                db.SaveChanges();
                Enroll(db, classroom, s1.Id);

                var lesson = new Lesson("Nhắc 1 lần", "Nội dung", "dsa", "{}", 10);
                db.Lessons.Add(lesson);
                db.SaveChanges();
                var item = new ClassroomModuleItem(module.Id, ModuleItemType.Lesson, lesson.Id, null, null,
                    "Nhắc 1 lần", "", 1000, true, null, DateTime.UtcNow.AddHours(6), null, false, null, false);
                db.ClassroomModuleItems.Add(item);
                db.SaveChanges();

                var notifier = new Mock<INotificationService>();
                var service = CreateService(db, notifier.Object);
                await RemindAsync(service);
                await RemindAsync(service);

                // Dedupe (StudentId|ItemId|ngày) → chỉ 1 notification trong cùng ngày.
                notifier.Verify(n => n.NotifyUserAsync(s1.Id, It.IsAny<string>(), It.IsAny<string>()), Times.Once);
            }
            finally
            {
                db.Dispose();
            }
        }
    }
}
