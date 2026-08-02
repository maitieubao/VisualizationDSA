using System;
using System.Collections.Generic;
using VisualizationDSA.Domain.Enums;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using System.IO;
using System.Text.Json;
using VisualizationDSA.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace VisualizationDSA.Infrastructure.Data
{
    public class DbSeeder
    {
        private readonly ApplicationDbContext _context;

        public DbSeeder(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task SeedAsync()
        {
            try { await SeedBadgesAsync(); } catch (Exception ex) { Console.WriteLine($"[SeedBadges Error]: {ex.Message}"); }
            try { await SeedLeaderboardUsersAsync(); } catch (Exception ex) { Console.WriteLine($"[SeedUsers Error]: {ex.Message}"); }
            try { await SeedQuizzesAsync(); } catch (Exception ex) { Console.WriteLine($"[SeedQuizzes Error]: {ex.Message}"); }
            try { await SeedSemanticGraphAsync(); } catch (Exception ex) { Console.WriteLine($"[SeedGraph Error]: {ex.Message}"); }
            try { await SeedCheatSheetAsync(); } catch (Exception ex) { Console.WriteLine($"[SeedCheatSheet Error]: {ex.Message}"); }
            try { await SeedCoursesAsync(); } catch (Exception ex) { Console.WriteLine($"[SeedCourses Error]: {ex}"); }
            try { await SeedTeacherRoadmapsAsync(); } catch (Exception ex) { Console.WriteLine($"[SeedRoadmaps Error]: {ex.Message}"); }
        }

        private async Task SeedTeacherRoadmapsAsync()
        {
            if (_context.CustomRoadmaps.Any()) return;

            var teacher = await _context.Users.FirstOrDefaultAsync(u => u.Role == "Teacher" || u.Role == "Admin");
            if (teacher == null) return;

            string baseDir = AppDomain.CurrentDomain.BaseDirectory;
            string seedContentPath = Path.Combine(baseDir, "Data", "SeedContent");
            if (!Directory.Exists(seedContentPath)) 
            {
                seedContentPath = Path.Combine(baseDir, "..", "..", "..", "Infrastructure", "Data", "SeedContent");
            }

            string roadmapsPath = Path.Combine(seedContentPath, "teacher_roadmaps.json");
            if (!File.Exists(roadmapsPath)) return;

            var jsonContent = await File.ReadAllTextAsync(roadmapsPath);
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var roadmaps = JsonSerializer.Deserialize<List<SeedRoadmapModel>>(jsonContent, options);

            if (roadmaps == null) return;

            foreach (var r in roadmaps)
            {
                var visibility = r.IsPublic ? "Public" : "Private";
                var roadmap = new CustomRoadmap(teacher.Id, r.Title, r.Description, "[]", null, visibility);
                roadmap.Approve(); // Auto approve for seed data
                
                await _context.CustomRoadmaps.AddAsync(roadmap);
                await _context.SaveChangesAsync();

                foreach (var n in r.Nodes)
                {
                    var node = new CustomNode(roadmap.Id, n.Name, n.Description, n.Difficulty ?? "Medium", n.SortOrder);
                    node.UpdateContent(n.ContentJson ?? "[]", null, null);
                    if (!string.IsNullOrEmpty(n.OfficialApproach))
                    {
                        node.SetApproach(n.OfficialApproach, "", "");
                    }
                    await _context.CustomNodes.AddAsync(node);
                }
            }
            await _context.SaveChangesAsync();
        }

        private class SeedRoadmapModel
        {
            public string Title { get; set; } = string.Empty;
            public string Description { get; set; } = string.Empty;
            public bool IsPublic { get; set; }
            public List<SeedNodeModel> Nodes { get; set; } = new();
        }

        private class SeedNodeModel
        {
            public string Name { get; set; } = string.Empty;
            public string Description { get; set; } = string.Empty;
            public string? Difficulty { get; set; }
            public int SortOrder { get; set; }
            public string? ContentJson { get; set; }
            public string? OfficialApproach { get; set; }
        }

        private async Task SeedBadgesAsync()
        {
            if (_context.Badges.Any()) return;

            var badges = new List<Badge>
            {
                new Badge("First Steps", "Hoàn thành bài trắc nghiệm đầu tiên", "🎯", "#22c55e", "{ 'quizCompleted': 1 }"),
                new Badge("Sorting Wizard", "Hoàn thành 4 thuật toán sắp xếp", "⚡", "#3b82f6", "{ 'sortingCompleted': 4 }"),
                new Badge("OOP Guru", "Hiểu rõ Encapsulation & Inheritance", "🔐", "#8b5cf6", "{ 'oopCompleted': 2 }"),
                new Badge("SOLID Master", "Áp dụng đúng 5 nguyên lý SOLID", "🏛️", "#f59e0b", "{ 'solidCompleted': 5 }"),
                new Badge("Pattern Hunter", "Sử dụng 3 Design Patterns", "🎨", "#ec4899", "{ 'patternsCompleted': 3 }"),
                new Badge("Streak Keeper", "Học liên tục 7 ngày", "🔥", "#ef4444", "{ 'streakDays': 7 }"),
                new Badge("System Architect", "Thiết kế hệ thống phân tán", "🏗️", "#f97316", "{ 'systemCompleted': 1 }"),
                new Badge("DSA Champion", "Hoàn thành toàn bộ khóa học", "👑", "#eab308", "{ 'level': 5 }")
            };

            foreach (var badge in badges)
            {
                await _context.Badges.AddAsync(badge);
            }

            await _context.SaveChangesAsync();
        }

        private async Task SeedCheatSheetAsync()
        {
            if (_context.CheatSheetSnippets.Any()) return;

            var snippets = new List<CheatSheetSnippet>
            {
                new CheatSheetSnippet("javascript", "array", "const arr = [1, 2, 3, 4, 5];\n// Truy cập phần tử: arr[0]\n// Độ dài: arr.length", "Khai báo mảng trong JavaScript"),
                new CheatSheetSnippet("python", "array", "arr = [1, 2, 3, 4, 5]\n# Truy cập phần tử: arr[0]\n# Độ dài: len(arr)", "Khai báo mảng trong Python (List)"),
                new CheatSheetSnippet("java", "array", "int[] arr = {1, 2, 3, 4, 5};\n// Truy cập: arr[0]\n// Độ dài: arr.length", "Khai báo mảng trong Java tĩnh"),
                new CheatSheetSnippet("cpp", "array", "vector<int> arr = {1, 2, 3, 4, 5};\n// Truy cập: arr[0]\n// Độ dài: arr.size()", "Khai báo Vector trong C++")
            };

            await _context.CheatSheetSnippets.AddRangeAsync(snippets);
            await _context.SaveChangesAsync();
        }

        private async Task SeedQuizzesAsync()
        {
            if (_context.Quizzes.Any()) return;

            
            var bubbleSortQuiz = new Quiz("Bubble Sort Mastery", "Test your knowledge of Bubble Sort algorithm", "sorting", 1, 50);
            bubbleSortQuiz.AddQuestion("What is the time complexity of Bubble Sort in the worst case?", new[] { "O(n)", "O(n log n)", "O(n²)", "O(2^n)" }, 2, "Bubble Sort compares adjacent elements and swaps them if needed, resulting in O(n²) complexity.");
            bubbleSortQuiz.AddQuestion("What is the best case time complexity of Bubble Sort?", new[] { "O(n)", "O(n log n)", "O(n²)", "O(1)" }, 0, "When the array is already sorted, Bubble Sort only needs one pass, achieving O(n).");
            bubbleSortQuiz.AddQuestion("Is Bubble Sort a stable sorting algorithm?", new[] { "Yes", "No", "Only with integers", "Depends on implementation" }, 0, "Bubble Sort is stable because it only swaps adjacent elements when necessary.");

            
            var quickSortQuiz = new Quiz("Quick Sort Fundamentals", "Master the divide-and-conquer approach of Quick Sort", "sorting", 2, 75);
            quickSortQuiz.AddQuestion("What is the average case time complexity of Quick Sort?", new[] { "O(n)", "O(n log n)", "O(n²)", "O(log n)" }, 1, "Quick Sort divides the array and sorts partitions, achieving O(n log n) on average.");
            quickSortQuiz.AddQuestion("What is the pivot in Quick Sort?", new[] { "The first element", "The middle element", "An element that partitions the array", "The largest element" }, 2, "The pivot is an element that divides the array into elements less than and greater than it.");

            
            var oopQuiz = new Quiz("OOP Concepts", "Test your understanding of Object-Oriented Programming", "oop", 2, 100);
            oopQuiz.AddQuestion("Which principle hides implementation details and exposes only necessary functionality?", new[] { "Inheritance", "Encapsulation", "Polymorphism", "Abstraction" }, 1, "Encapsulation bundles data and methods, hiding internal implementation.");
            oopQuiz.AddQuestion("What allows a subclass to inherit properties from a parent class?", new[] { "Inheritance", "Encapsulation", "Polymorphism", "Composition" }, 0, "Inheritance enables code reuse by allowing subclasses to inherit parent properties.");

            
            var solidQuiz = new Quiz("SOLID Principles", "Master the 5 SOLID principles of software design", "solid", 3, 125);
            solidQuiz.AddQuestion("Which principle states that a class should have only one reason to change?", new[] { "Open/Closed", "Single Responsibility", "Liskov Substitution", "Interface Segregation" }, 1, "Single Responsibility Principle (SRP) states a class should have one responsibility.");
            solidQuiz.AddQuestion("Which principle suggests classes should be open for extension but closed for modification?", new[] { "Open/Closed", "Single Responsibility", "Liskov Substitution", "Dependency Inversion" }, 0, "Open/Closed Principle (OCP) encourages extension through inheritance or composition.");

            
            var patternsQuiz = new Quiz("Design Patterns", "Recognize common design patterns and their use cases", "patterns", 3, 150);
            patternsQuiz.AddQuestion("Which pattern defines a one-to-many dependency between objects?", new[] { "Strategy", "Observer", "Factory", "Singleton" }, 1, "Observer pattern allows objects to subscribe to events and get notified automatically.");
            patternsQuiz.AddQuestion("Which pattern lets you change an algorithm's behavior at runtime?", new[] { "Observer", "Strategy", "Decorator", "Builder" }, 1, "Strategy pattern defines a family of algorithms and makes them interchangeable.");

            
            var dsaBasicsQuiz = new Quiz("Trắc nghiệm Nền tảng DSA", "Đánh giá kiến thức về Big O và Mảng", "dsa", 1, 40);
            dsaBasicsQuiz.AddQuestion("Độ phức tạp O(1) nghĩa là gì?", new[] { "Thời gian tuyến tính", "Thời gian hằng số", "Thời gian bình phương", "Thời gian mũ" }, 1, "O(1) là thời gian thực thi không phụ thuộc vào kích thước đầu vào N.");

            
            var linkedListQuiz = new Quiz("Trắc nghiệm Danh sách liên kết", "Đánh giá nguy cơ rò rỉ bộ nhớ và con trỏ", "dsa", 1, 50);
            linkedListQuiz.AddQuestion("Trường hợp nào dẫn tới Memory Leak trong Linked List?", new[] { "Gán head = head.next mà không giải phóng node cũ", "Duyệt qua danh sách", "Tạo node mới", "Đếm số node" }, 0, "Khi làm mất con trỏ trỏ tới node mà không deallocate, dữ liệu bị rò rỉ bộ nhớ.");

            
            var stackQueueQuiz = new Quiz("Trắc nghiệm Ngăn xếp & Hàng đợi", "Phân biệt nguyên lý LIFO và FIFO", "dsa", 1, 50);
            stackQueueQuiz.AddQuestion("Cấu trúc dữ liệu nào tuân theo nguyên lý LIFO (Last In First Out)?", new[] { "Queue", "Stack", "Array", "Graph" }, 1, "Stack (Ngăn xếp) vào sau ra trước (LIFO).");

            
            var treeQuiz = new Quiz("Trắc nghiệm Duyệt cây Nhị phân", "Xác định thứ tự duyệt cây DFS và BFS", "dsa", 2, 80);
            treeQuiz.AddQuestion("Thứ tự duyệt In-order (Trung thứ) trên cây tìm kiếm nhị phân cho ra kết quả gì?", new[] { "Mảng đã sắp xếp giảm dần", "Mảng đã sắp xếp tăng dần", "Mảng ngẫu nhiên", "Danh sách rỗng" }, 1, "In-order traversal trên BST luôn cho dãy giá trị tăng dần.");

            
            var graphQuiz = new Quiz("Trắc nghiệm Đồ thị & Dijkstra", "Phân tích rủi ro thuật toán đường đi ngắn nhất", "graph", 3, 120);
            graphQuiz.AddQuestion("Thuật toán Dijkstra không hoạt động chính xác trong trường hợp nào?", new[] { "Đồ thị có hướng", "Đồ thị vô hướng", "Đồ thị có cạnh trọng số âm", "Đồ thị dày" }, 2, "Dijkstra hoạt động dựa trên tham ăn và có thể đưa ra kết quả sai nếu đồ thị chứa cạnh trọng số âm.");

            
            var dpQuiz = new Quiz("Trắc nghiệm Quy hoạch động", "Phân biệt Memoization và Tabulation", "dsa", 3, 140);
            dpQuiz.AddQuestion("Tabulation trong Quy hoạch động là phương pháp gì?", new[] { "Top-down đệ quy", "Bottom-up điền bảng", "Greedy tham ăn", "Brute force" }, 1, "Tabulation điền bảng tính từ các bài toán cơ sở nhỏ nhất lên bài toán lớn (Bottom-up).");

            
            var systemQuiz = new Quiz("Trắc nghiệm System Design & Multithreading", "Phát hiện Race Condition và Deadlock", "system", 3, 150);
            systemQuiz.AddQuestion("Race Condition xảy ra khi nào?", new[] { "Chỉ có 1 thread truy cập tài nguyên", "Nhiều thread cùng đọc/ghi tài nguyên dùng chung mà không có đồng bộ", "Khi server bị quá tải", "Khi hết RAM" }, 1, "Race condition xuất hiện khi kết quả phụ thuộc vào thứ tự thực thi ngẫu nhiên của các luồng.");

            await _context.Quizzes.AddRangeAsync(
                bubbleSortQuiz, quickSortQuiz, oopQuiz, solidQuiz, patternsQuiz,
                dsaBasicsQuiz, linkedListQuiz, stackQueueQuiz, treeQuiz, graphQuiz, dpQuiz, systemQuiz
            );
            await _context.SaveChangesAsync();
        }

        private async Task SeedLeaderboardUsersAsync()
        {
            var users = new (string email, string username, string password, int xp, int level, int streak, string role)[]
            {
                ("admin@visualizationdsa.dev",     "VisualizationDSA Admin",   "Admin@2024", 9999, 8, 30, "Admin"),
                ("admin@gmail.com",                "Easy Admin",               "admin123",   9999, 8, 30, "Admin"),
                ("nguyenvana@visualizationdsa.dev",   "NguyenVanA",    "User@2024",  2850, 7, 14, "Student"),
                ("tranthib@visualizationdsa.dev",     "TranThiB",      "User@2024",  2200, 7, 10, "Student"),
                ("levanc@visualizationdsa.dev",       "LeVanC",        "User@2024",  1800, 6, 8,  "Student"),
                ("phamthid@visualizationdsa.dev",     "PhamThiD",      "User@2024",  1500, 6, 12, "Student"),
                ("hoangvane@visualizationdsa.dev",    "HoangVanE",     "User@2024",  1200, 5, 6,  "Student"),
                ("vuthif@visualizationdsa.dev",       "VuThiF",        "User@2024",  950,  4, 5,  "Student"),
                ("dangvang@visualizationdsa.dev",     "DangVanG",      "User@2024",  700,  4, 4,  "Student"),
                ("buithih@visualizationdsa.dev",      "BuiThiH",       "User@2024",  450,  3, 3,  "Student"),
                ("dovani@visualizationdsa.dev",       "DoVanI",        "User@2024",  250,  2, 2,  "Student"),
                ("demo@visualizationdsa.dev",         "VisualizationDSA Demo", "Demo@2024",  150,  2, 3,  "Teacher"),
            };

            foreach (var (email, username, password, xp, level, streak, role) in users)
            {
                var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
                if (existingUser == null)
                {
                    var passwordHash = HashPasswordSHA256(password);
                    var user = new User(email, username, passwordHash);
                    if (xp > 0) user.AwardXP(xp);
                    user.SetRole(role);
                    await _context.Users.AddAsync(user);
                }
                else
                {
                    existingUser.SetRole(role);
                }
            }

            await _context.SaveChangesAsync();
        }

        private static string HashPasswordSHA256(string password)
        {
            var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(password + "visualizationdsa-salt"));
            return Convert.ToHexString(bytes).ToLowerInvariant();
        }

        private async Task SeedSemanticGraphAsync()
        {
            if (_context.SemanticConceptNodes.Any()) return;

            var oop = new SemanticConceptNode("oop.encapsulation", "Encapsulation", "OOP", "Hành vi đóng gói che giấu chi tiết triển khai và bảo vệ dữ liệu bên trong.", new[] { 0.1, 0.2, 0.3 }, 0.9);
            var inheritance = new SemanticConceptNode("oop.inheritance", "Inheritance", "OOP", "Cho phép các lớp con kế thừa lại cấu trúc và phương thức từ lớp cha.", new[] { 0.15, 0.25, 0.35 }, 0.85);
            var polymorphism = new SemanticConceptNode("oop.polymorphism", "Polymorphism", "OOP", "Đa hình cho phép đối tượng thực hiện các hành vi khác nhau dựa trên kiểu runtime của nó.", new[] { 0.2, 0.3, 0.4 }, 0.8);
            
            var srp = new SemanticConceptNode("solid.srp", "Single Responsibility", "SOLID", "Nguyên lý đơn trách nhiệm: Mỗi lớp chỉ nên đảm nhận duy nhất một lý do để thay đổi.", new[] { 0.3, 0.4, 0.5 }, 0.95);
            var ocp = new SemanticConceptNode("solid.ocp", "Open/Closed", "SOLID", "Nguyên lý đóng mở: Lớp nên mở rộng cho việc kế thừa kế tiếp nhưng đóng cho việc sửa trực tiếp.", new[] { 0.35, 0.45, 0.55 }, 0.9);
            var dip = new SemanticConceptNode("solid.dip", "Dependency Inversion", "SOLID", "Nguyên lý đảo ngược phụ thuộc: Các module cấp cao không nên phụ thuộc trực tiếp module cấp thấp.", new[] { 0.4, 0.5, 0.6 }, 0.85);

            var array = new SemanticConceptNode("dsa.array", "Array", "DSA", "Mảng là cấu trúc dữ liệu lưu trữ tuyến tính các phần tử cùng kiểu liên tiếp.", new[] { 0.5, 0.6, 0.7 }, 0.75);
            var bst = new SemanticConceptNode("dsa.bst", "Binary Search Tree", "DSA", "Cây tìm kiếm nhị phân sắp xếp các đỉnh sao cho nhánh trái nhỏ hơn và nhánh phải lớn hơn đỉnh gốc.", new[] { 0.6, 0.7, 0.8 }, 0.8);

            await _context.SemanticConceptNodes.AddRangeAsync(oop, inheritance, polymorphism, srp, ocp, dip, array, bst);
            await _context.SaveChangesAsync();

            var edges = new List<KnowledgeEdge>
            {
                new KnowledgeEdge(inheritance.Id, oop.Id, "DependsOn", 1.2),
                new KnowledgeEdge(polymorphism.Id, inheritance.Id, "DependsOn", 1.5),
                new KnowledgeEdge(ocp.Id, polymorphism.Id, "DependsOn", 1.3),
                new KnowledgeEdge(dip.Id, oop.Id, "DependsOn", 1.4),
                new KnowledgeEdge(bst.Id, array.Id, "DependsOn", 1.1)
            };

            await _context.KnowledgeEdges.AddRangeAsync(edges);
            await _context.SaveChangesAsync();
        }

        private async Task SeedCoursesAsync()
        {
            // Forced re-seeding to apply new courses.json data
            // We will always reseed for this demo/dev phase
            
            _context.ModuleItems.RemoveRange(_context.ModuleItems);
            _context.CourseModules.RemoveRange(_context.CourseModules);
            _context.Lessons.RemoveRange(_context.Lessons);
            _context.Courses.RemoveRange(_context.Courses);
            _context.CodelabTestCases.RemoveRange(_context.CodelabTestCases);
            _context.Codelabs.RemoveRange(_context.Codelabs);
            _context.Quizzes.RemoveRange(_context.Quizzes);
            await _context.SaveChangesAsync();

            var teacher = await _context.Users.FirstOrDefaultAsync(u => u.Role == "Teacher" || u.Role == "Admin")
                          ?? await _context.Users.FirstOrDefaultAsync();
            if (teacher == null)
            {
                teacher = new User("teacher@visualizationdsa.dev", "Default Teacher", HashPasswordSHA256("Teacher@2024"));
                teacher.SetRole("Teacher");
                await _context.Users.AddAsync(teacher);
                await _context.SaveChangesAsync();
            }

            string baseDir = AppDomain.CurrentDomain.BaseDirectory;
            string seedContentPath = Path.Combine(baseDir, "Data", "SeedContent");
            if (!Directory.Exists(seedContentPath)) 
            {
                seedContentPath = Path.Combine(baseDir, "..", "..", "..", "Infrastructure", "Data", "SeedContent");
            }

            string coursesJsonPath = Path.Combine(seedContentPath, "courses.json");
            if (!File.Exists(coursesJsonPath))
            {
                Console.WriteLine($"[SeedCourses] Seed file not found at {coursesJsonPath}");
                return;
            }

            string jsonContent = await File.ReadAllTextAsync(coursesJsonPath);
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var seedCourses = JsonSerializer.Deserialize<List<SeedCourseModel>>(jsonContent, options);

            if (seedCourses == null) return;

            foreach (var sc in seedCourses)
            {
                var diff = Enum.TryParse<CourseDifficulty>(sc.Difficulty, out var parsedDiff) ? parsedDiff : CourseDifficulty.Beginner;
                var cat = Enum.TryParse<CourseCategory>(sc.Category, out var parsedCat) ? parsedCat : CourseCategory.DataStructure;
                
                var course = new Course(teacher.Id, sc.Title, sc.Description, cat, diff, true, sc.ImageUrl);
                await _context.Courses.AddAsync(course);
                await _context.SaveChangesAsync(); 

                var module = new CourseModule(course.Id, "Chương 1", "Nội dung chính", 1000);
                await _context.CourseModules.AddAsync(module);
                await _context.SaveChangesAsync();

                int lessonIndex = 1;
                foreach (var sl in sc.Lessons)
                {
                    string markdownContent = "";
                    string mdPath = Path.Combine(seedContentPath, sl.ContentFile);
                    if (File.Exists(mdPath)) markdownContent = await File.ReadAllTextAsync(mdPath);

                    var lesson = new Lesson(sl.Title, markdownContent, sl.SandboxType, sl.SandboxConfig, sl.XpReward, teacher.Id);
                    await _context.Lessons.AddAsync(lesson);
                    await _context.SaveChangesAsync();

                    int itemOrder = lessonIndex * 1000;
                    var lessonItem = new ModuleItem(module.Id, null, VisualizationDSA.Domain.Enums.ModuleItemType.Lesson, lesson.Id, null, null, sl.Title, itemOrder, true);
                    await _context.ModuleItems.AddAsync(lessonItem);

                    if (sl.Quiz != null)
                    {
                        var quiz = new Quiz(sl.Quiz.Title, "Trắc nghiệm ôn tập", "general", sl.Quiz.Questions.Count, sl.XpReward + 10);
                        foreach (var sq in sl.Quiz.Questions)
                        {
                            quiz.AddQuestion(sq.Content, sq.Options.Select(o => o.Text).ToArray(), sq.Options.FindIndex(o => o.IsCorrect), sq.Options.FirstOrDefault(o => o.IsCorrect)?.Explanation ?? "");
                        }
                        await _context.Quizzes.AddAsync(quiz);
                        await _context.SaveChangesAsync();

                        var quizItem = new ModuleItem(module.Id, null, VisualizationDSA.Domain.Enums.ModuleItemType.Quiz, null, quiz.Id, null, "Quiz: " + sl.Title, itemOrder + 500, true);
                        module.Items.Add(quizItem);
                    }

                    if (sl.Codelab != null)
                    {
                        var codelab = new Codelab(
                            sl.Codelab.Title, sl.Codelab.Description, sl.Codelab.InitialCode,
                            1, 50, 5000, 128000000, "csharp", "Vui lòng xem mô tả", "Xem ví dụ trong mô tả", "", "general"
                        );
                        
                        int caseIndex = 1;
                        foreach (var tc in sl.Codelab.TestCases)
                        {
                            codelab.TestCases.Add(new CodelabTestCase(codelab.Id, tc.Input, tc.ExpectedOutput, tc.IsHidden, 10, caseIndex++));
                        }
                        await _context.Codelabs.AddAsync(codelab);
                        await _context.SaveChangesAsync();

                        var codelabItem = new ModuleItem(module.Id, null, VisualizationDSA.Domain.Enums.ModuleItemType.Codelab, null, null, codelab.Id, "Codelab: " + sl.Title, itemOrder + 750, true);
                        module.Items.Add(codelabItem);
                    }
                    lessonIndex++;
                }
            }
        }

        private class SeedCourseModel
        {
            public string Title { get; set; } = string.Empty;
            public string Description { get; set; } = string.Empty;
            public string Category { get; set; } = string.Empty;
            public string Difficulty { get; set; } = string.Empty;
            public string ImageUrl { get; set; } = string.Empty;
            public List<SeedLessonModel> Lessons { get; set; } = new();
        }

        private class SeedLessonModel
        {
            public string Title { get; set; } = string.Empty;
            public string ContentFile { get; set; } = string.Empty;
            public string SandboxType { get; set; } = string.Empty;
            public string SandboxConfig { get; set; } = string.Empty;
            public int XpReward { get; set; }
            public SeedQuizModel? Quiz { get; set; }
            public SeedCodelabModel? Codelab { get; set; }
        }

        private class SeedQuizModel
        {
            public string Title { get; set; } = string.Empty;
            public int PassingScore { get; set; }
            public List<SeedQuestionModel> Questions { get; set; } = new();
        }

        private class SeedQuestionModel
        {
            public string Content { get; set; } = string.Empty;
            public List<SeedOptionModel> Options { get; set; } = new();
        }

        private class SeedOptionModel
        {
            public string Text { get; set; } = string.Empty;
            public bool IsCorrect { get; set; }
            public string Explanation { get; set; } = string.Empty;
        }

        private class SeedCodelabModel
        {
            public string Title { get; set; } = string.Empty;
            public string Description { get; set; } = string.Empty;
            public string InitialCode { get; set; } = string.Empty;
            public List<SeedTestCaseModel> TestCases { get; set; } = new();
        }

        private class SeedTestCaseModel
        {
            public string Input { get; set; } = string.Empty;
            public string ExpectedOutput { get; set; } = string.Empty;
            public bool IsHidden { get; set; }
        }
    }
}