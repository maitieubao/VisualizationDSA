using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Xunit;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Enums;
using VisualizationDSA.Infrastructure.Data;

namespace VisualizationDSA.UnitTests.Infrastructure
{
    public class DbSeederTests
    {
        private static readonly string[] ExpectedQuizTitles =
        {
            "Trắc nghiệm Big O & Độ phức tạp",
            "Trắc nghiệm Mảng cơ bản",
            "Trắc nghiệm Chuỗi cơ bản",
            "Trắc nghiệm Hash Table & Set",
            "Trắc nghiệm Linked List",
            "Trắc nghiệm Stack",
            "Trắc nghiệm Queue & Deque",
            "Trắc nghiệm Đệ quy",
            "Trắc nghiệm Sắp xếp cơ bản",
            "Trắc nghiệm Tìm kiếm Linear & Binary",
            "Trắc nghiệm Two Pointers",
            "Trắc nghiệm Sliding Window",
            "Trắc nghiệm Binary Search nâng cao",
            "Trắc nghiệm Prefix Sum",
            "Trắc nghiệm Kadane",
            "Trắc nghiệm Monotonic Stack & Deque",
            "Trắc nghiệm BST",
            "Trắc nghiệm Duyệt cây",
            "Trắc nghiệm Heap & Priority Queue",
            "Trắc nghiệm Đồ thị cơ bản",
            "Trắc nghiệm Topological Sort",
            "Trắc nghiệm Backtracking",
            "Trắc nghiệm Chia để trị",
            "Trắc nghiệm Greedy",
            "Trắc nghiệm Interval Problems",
            "Trắc nghiệm Matrix & Grid",
            "Trắc nghiệm Bit Manipulation & Số học",
            "Trắc nghiệm Sắp xếp nâng cao",
            "Trắc nghiệm DP cơ bản",
            "Trắc nghiệm DP nâng cao",
            "Trắc nghiệm Đường đi ngắn nhất",
            "Trắc nghiệm MST",
            "Trắc nghiệm Union-Find",
            "Trắc nghiệm Trie",
            "Trắc nghiệm Segment Tree",
            "Trắc nghiệm Fenwick Tree",
            "Trắc nghiệm Thuật toán chuỗi nâng cao",
            "Trắc nghiệm Cấu trúc dữ liệu nâng cao",
            "Trắc nghiệm Tổng ôn DSA",
            "Trắc nghiệm DP Patterns",
        };

        private static readonly string[] ValidDemos = { "binary-search", "two-pointers", "stack", "queue", "tree-traversal", "bubble-sort", "sliding-window", "monotonic-stack", "bst", "heap-sort", "bfs", "merge-sort", "quick-sort", "dijkstra" };

        private static ApplicationDbContext CreateContext() =>
            new(new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase($"db-{Guid.NewGuid():N}")
                .Options);

        private static async Task SeedAsync(ApplicationDbContext context)
        {
            var seeder = new DbSeeder(context);
            await seeder.SeedAsync();
        }

        private async Task<Course> GetRoadmap(ApplicationDbContext context, string titleFragment)
        {
            var course = await context.Courses.FirstOrDefaultAsync(c => c.Title.Contains(titleFragment));
            Assert.NotNull(course);
            return course!;
        }

        private async Task<List<ModuleItem>> GetRoadmapItems(ApplicationDbContext context, string titleFragment)
        {
            var course = await GetRoadmap(context, titleFragment);
            var moduleIds = await context.CourseModules.Where(m => m.CourseId == course.Id).Select(m => m.Id).ToListAsync();
            return await context.ModuleItems.Where(i => moduleIds.Contains(i.ModuleId)).ToListAsync();
        }

        // ═══════════ TC-R: Lesson độc lập + Roadmap ═══════════

        [Fact]
        public async Task TC_R1_Has_40_Standalone_Lessons_And_3_Roadmaps()
        {
            var context = CreateContext();
            await SeedAsync(context);

            var lessonCount = await context.Lessons.CountAsync();
            Assert.Equal(40, lessonCount);

            var courseCount = await context.Courses.CountAsync();
            Assert.Equal(3, courseCount);
        }

        [Fact]
        public async Task TC_R2_Roadmaps_Have_Correct_Metadata_And_Published()
        {
            var context = CreateContext();
            await SeedAsync(context);

            var r1 = await GetRoadmap(context, "Lộ trình Cơ bản");
            Assert.Equal(CourseDifficulty.Beginner, r1.Difficulty);
            Assert.True(r1.IsPublished);

            var r2 = await GetRoadmap(context, "Lộ trình Trung cấp");
            Assert.Equal(CourseDifficulty.Intermediate, r2.Difficulty);
            Assert.True(r2.IsPublished);

            var r3 = await GetRoadmap(context, "Lộ trình Nâng cao");
            Assert.Equal(CourseDifficulty.Advanced, r3.Difficulty);
            Assert.True(r3.IsPublished);
        }

        [Fact]
        public async Task TC_R3_Each_Roadmap_Has_2_Modules_And_Expected_Lesson_Count()
        {
            var context = CreateContext();
            await SeedAsync(context);

            foreach (var (title, expected) in new[] { ("Lộ trình Cơ bản", 12), ("Lộ trình Trung cấp", 15), ("Lộ trình Nâng cao", 13) })
            {
                var course = await GetRoadmap(context, title);
                var moduleCount = await context.CourseModules.CountAsync(m => m.CourseId == course.Id);
                Assert.Equal(2, moduleCount);

                var items = await GetRoadmapItems(context, title);
                Assert.Equal(expected, items.Count(i => i.ItemType == ModuleItemType.Lesson));
            }
        }

        [Fact]
        public async Task TC_R4_Every_Lesson_Has_Linked_Quiz_Item()
        {
            var context = CreateContext();
            await SeedAsync(context);

            foreach (var title in new[] { "Lộ trình Cơ bản", "Lộ trình Trung cấp", "Lộ trình Nâng cao" })
            {
                var items = await GetRoadmapItems(context, title);
                var lessonItems = items.Where(i => i.ItemType == ModuleItemType.Lesson).ToList();
                foreach (var lessonItem in lessonItems)
                {
                    var quizItem = items.FirstOrDefault(i => i.ItemType == ModuleItemType.Quiz
                        && i.ModuleId == lessonItem.ModuleId
                        && i.QuizId != null
                        && i.OrderIndex > lessonItem.OrderIndex);
                    Assert.NotNull(quizItem);
                }
            }
        }

        [Fact]
        public async Task TC_R5_All_39_Quizzes_Exist_With_10_Questions_And_Valid_Content()
        {
            var context = CreateContext();
            await SeedAsync(context);

            foreach (var title in ExpectedQuizTitles)
            {
                var quiz = await context.Quizzes
                    .Include(q => q.Questions)
                    .FirstOrDefaultAsync(q => q.Title == title);
                Assert.NotNull(quiz);
                Assert.True(quiz!.Questions.Count >= 10, $"Quiz '{title}' phải có ≥ 10 câu.");
                foreach (var q in quiz.Questions)
                {
                    Assert.InRange(q.CorrectIndex, 0, q.Options.Length - 1);
                    Assert.False(string.IsNullOrWhiteSpace(q.Explanation));
                }
            }
        }

        [Fact]
        public async Task TC_R6_Every_Lesson_Has_Content_And_Valid_Sandbox()
        {
            var context = CreateContext();
            await SeedAsync(context);

            var lessons = await context.Lessons.ToListAsync();
            Assert.Equal(40, lessons.Count);
            foreach (var lesson in lessons)
            {
                Assert.True(lesson.ContentMd.Length > 800, $"Lesson '{lesson.Title}' content quá ngắn.");
                Assert.True(lesson.XPReward > 0);
                Assert.Contains(lesson.SandboxType, new[] { "dsa", "sorting", "searching", "graph" });
                using var doc = JsonDocument.Parse(lesson.SandboxConfig);
                if (doc.RootElement.TryGetProperty("demo", out var demo))
                {
                    Assert.Contains(demo.GetString(), ValidDemos);
                }
            }
        }

        [Fact]
        public async Task TC_R7_Seed_Twice_Does_Not_Duplicate()
        {
            var context = CreateContext();
            await SeedAsync(context);
            var lessonsAfterFirst = await context.Lessons.CountAsync();
            var coursesAfterFirst = await context.Courses.CountAsync();

            await SeedAsync(context);
            var lessonsAfterSecond = await context.Lessons.CountAsync();
            var coursesAfterSecond = await context.Courses.CountAsync();

            Assert.Equal(lessonsAfterFirst, lessonsAfterSecond);
            Assert.Equal(coursesAfterFirst, coursesAfterSecond);
        }
    }
}
