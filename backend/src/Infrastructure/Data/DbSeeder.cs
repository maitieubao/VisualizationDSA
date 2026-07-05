using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
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
            await SeedBadgesAsync();
            await SeedLeaderboardUsersAsync();
            await SeedQuizzesAsync();
            await SeedSemanticGraphAsync();
            await SeedCoursesAsync();
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

        private async Task SeedQuizzesAsync()
        {
            if (_context.Quizzes.Any()) return;

            // Bubble Sort Quiz
            var bubbleSortQuiz = new Quiz(
                "Bubble Sort Mastery",
                "Test your knowledge of Bubble Sort algorithm",
                "sorting",
                1,
                50
            );
            bubbleSortQuiz.AddQuestion(
                "What is the time complexity of Bubble Sort in the worst case?",
                new[] { "O(n)", "O(n log n)", "O(n²)", "O(2^n)" },
                2,
                "Bubble Sort compares adjacent elements and swaps them if needed, resulting in O(n²) complexity."
            );
            bubbleSortQuiz.AddQuestion(
                "What is the best case time complexity of Bubble Sort?",
                new[] { "O(n)", "O(n log n)", "O(n²)", "O(1)" },
                0,
                "When the array is already sorted, Bubble Sort only needs one pass, achieving O(n)."
            );
            bubbleSortQuiz.AddQuestion(
                "Is Bubble Sort a stable sorting algorithm?",
                new[] { "Yes", "No", "Only with integers", "Depends on implementation" },
                0,
                "Bubble Sort is stable because it only swaps adjacent elements when necessary."
            );

            // Quick Sort Quiz
            var quickSortQuiz = new Quiz(
                "Quick Sort Fundamentals",
                "Master the divide-and-conquer approach of Quick Sort",
                "sorting",
                2,
                75
            );
            quickSortQuiz.AddQuestion(
                "What is the average case time complexity of Quick Sort?",
                new[] { "O(n)", "O(n log n)", "O(n²)", "O(log n)" },
                1,
                "Quick Sort divides the array and sorts partitions, achieving O(n log n) on average."
            );
            quickSortQuiz.AddQuestion(
                "What is the pivot in Quick Sort?",
                new[] { "The first element", "The middle element", "An element that partitions the array", "The largest element" },
                2,
                "The pivot is an element that divides the array into elements less than and greater than it."
            );

            // OOP Quiz
            var oopQuiz = new Quiz(
                "OOP Concepts",
                "Test your understanding of Object-Oriented Programming",
                "oop",
                2,
                100
            );
            oopQuiz.AddQuestion(
                "Which principle hides implementation details and exposes only necessary functionality?",
                new[] { "Inheritance", "Encapsulation", "Polymorphism", "Abstraction" },
                1,
                "Encapsulation bundles data and methods, hiding internal implementation."
            );
            oopQuiz.AddQuestion(
                "What allows a subclass to inherit properties from a parent class?",
                new[] { "Inheritance", "Encapsulation", "Polymorphism", "Composition" },
                0,
                "Inheritance enables code reuse by allowing subclasses to inherit parent properties."
            );

            // SOLID Quiz
            var solidQuiz = new Quiz(
                "SOLID Principles",
                "Master the 5 SOLID principles of software design",
                "solid",
                3,
                125
            );
            solidQuiz.AddQuestion(
                "Which principle states that a class should have only one reason to change?",
                new[] { "Open/Closed", "Single Responsibility", "Liskov Substitution", "Interface Segregation" },
                1,
                "Single Responsibility Principle (SRP) states a class should have one responsibility."
            );
            solidQuiz.AddQuestion(
                "Which principle suggests classes should be open for extension but closed for modification?",
                new[] { "Open/Closed", "Single Responsibility", "Liskov Substitution", "Dependency Inversion" },
                0,
                "Open/Closed Principle (OCP) encourages extension through inheritance or composition."
            );

            // Design Patterns Quiz
            var patternsQuiz = new Quiz(
                "Design Patterns",
                "Recognize common design patterns and their use cases",
                "patterns",
                3,
                150
            );
            patternsQuiz.AddQuestion(
                "Which pattern defines a one-to-many dependency between objects?",
                new[] { "Strategy", "Observer", "Factory", "Singleton" },
                1,
                "Observer pattern allows objects to subscribe to events and get notified automatically."
            );
            patternsQuiz.AddQuestion(
                "Which pattern lets you change an algorithm's behavior at runtime?",
                new[] { "Observer", "Strategy", "Decorator", "Builder" },
                1,
                "Strategy pattern defines a family of algorithms and makes them interchangeable."
            );

            await _context.Quizzes.AddRangeAsync(bubbleSortQuiz, quickSortQuiz, oopQuiz, solidQuiz, patternsQuiz);
            await _context.SaveChangesAsync();
        }

        /// <summary>
        /// Seed 10 Vietnamese leaderboard users vào bảng Users.
        /// Mỗi user có XP, level, streak khác nhau để tạo bảng xếp hạng phong phú.
        /// </summary>
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
                    // Luôn đồng bộ role
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

            // Seed Edges
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
            if (_context.Courses.Any()) return;

            var teacher = await _context.Users.FirstOrDefaultAsync(u => u.Role == "Teacher" || u.Role == "Admin");
            if (teacher == null) return;

            var bubbleSortQuiz = await _context.Quizzes.FirstOrDefaultAsync(q => q.Title.Contains("Bubble"));
            var quickSortQuiz = await _context.Quizzes.FirstOrDefaultAsync(q => q.Title.Contains("Quick"));
            var oopQuiz = await _context.Quizzes.FirstOrDefaultAsync(q => q.Title.Contains("OOP"));
            var solidQuiz = await _context.Quizzes.FirstOrDefaultAsync(q => q.Title.Contains("SOLID"));
            var patternsQuiz = await _context.Quizzes.FirstOrDefaultAsync(q => q.Title.Contains("Patterns"));

            // 1. Sorting Course
            var c1 = new Course(teacher.Id, "Thuật toán Sắp xếp Cơ bản", "Khóa học giới thiệu các nguyên lý sắp xếp dữ liệu cơ bản, so sánh độ phức tạp và trực quan hóa từng bước chạy.", "sorting", "Easy", false, "https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=500&q=80");
            c1.Lessons.Add(new Lesson(c1.Id, "Tổng quan về Sắp xếp", "# Tổng quan về Sắp xếp\nSắp xếp (Sorting) là một trong những bài toán kinh điển nhất trong Khoa học máy tính.\n\n### Tại sao cần sắp xếp?\n- Giúp tìm kiếm dữ liệu nhanh hơn (ví dụ: Tìm kiếm nhị phân yêu cầu mảng đã sắp xếp).\n- Gom nhóm các phần tử giống nhau.\n- Tối ưu hóa các thuật toán khác.", "sorting", "{\"array\":[5,3,8,4,2]}", null, 20, 1));
            c1.Lessons.Add(new Lesson(c1.Id, "Sắp xếp Nổi bọt (Bubble Sort)", "# Sắp xếp Nổi bọt (Bubble Sort)\nBubble Sort hoạt động bằng cách liên tục so sánh hai phần tử liền kề và hoán đổi nếu chúng sai thứ tự.\n\n### Đặc tính thuật toán:\n- Độ phức tạp thời gian: O(n²) ở trường hợp trung bình và xấu nhất.\n- Bộ nhớ phụ trợ: O(1) (In-place sort).\n- Tính ổn định: Stable.", "sorting", "{\"array\":[29,10,14,37,13]}", bubbleSortQuiz?.Id, 30, 2));
            c1.Lessons.Add(new Lesson(c1.Id, "Sắp xếp Nhanh (Quick Sort)", "# Sắp xếp Nhanh (Quick Sort)\nQuick Sort sử dụng chiến lược chia để trị (Divide and Conquer), chọn một phần tử chốt (pivot) để phân hoạch mảng.\n\n### Đặc tính thuật toán:\n- Độ phức tạp trung bình: O(n log n).\n- Phụ thuộc nhiều vào cách chọn pivot.", "sorting", "{\"array\":[12,5,15,3,8,9]}", quickSortQuiz?.Id, 40, 3));

            // 2. Graph Course
            var c2 = new Course(teacher.Id, "Thuật toán Đồ thị Nâng cao", "Khảo sát thế giới đồ thị, các phương pháp duyệt đỉnh BFS/DFS và bài toán tìm đường đi ngắn nhất Dijkstra.", "graph", "Medium", false, "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&q=80");
            c2.Lessons.Add(new Lesson(c2.Id, "Khái niệm Cơ bản về Đồ thị", "# Khái niệm Cơ bản về Đồ thị\nĐồ thị (Graph) gồm tập các đỉnh (Vertices) và tập các cạnh (Edges) kết nối các đỉnh.\n\n### Phân loại đồ thị:\n- Đồ thị có hướng (Directed Graph).\n- Đồ thị vô hướng (Undirected Graph).\n- Đồ thị có trọng số.", "graph", "{}", null, 20, 1));
            c2.Lessons.Add(new Lesson(c2.Id, "Duyệt Đồ thị BFS & DFS", "# Duyệt Đồ thị BFS & DFS\n- **BFS (Breadth-First Search)**: Duyệt theo chiều rộng, sử dụng Hàng đợi (Queue).\n- **DFS (Depth-First Search)**: Duyệt theo chiều sâu, sử dụng Ngăn xếp (Stack) hoặc đệ quy.", "graph", "{}", null, 30, 2));

            // 3. OOP Course
            var c3 = new Course(teacher.Id, "Lập trình Hướng đối tượng thực chiến", "Làm chủ 4 cột trụ của OOP: Encapsulation, Inheritance, Polymorphism, Abstraction với các mô phỏng bộ nhớ trực quan.", "oop", "Medium", false, "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&q=80");
            c3.Lessons.Add(new Lesson(c3.Id, "Đóng gói (Encapsulation)", "# Tính Đóng gói (Encapsulation)\nĐóng gói là việc che giấu thông tin chi tiết bên trong đối tượng và chỉ cung cấp interface để giao tiếp.\n\n### Lợi ích:\n- Bảo vệ trạng thái đối tượng.\n- Giảm thiểu phụ thuộc (coupling).", "oop", "{}", null, 20, 1));
            c3.Lessons.Add(new Lesson(c3.Id, "Đa hình & Kế thừa (Polymorphism)", "# Tính Đa hình & Kế thừa\nĐa hình cho phép một lời gọi phương thức hành xử khác nhau tùy thuộc vào kiểu đối tượng thực tế tại runtime.\n\n### VTable (Virtual Method Table):\nC# sử dụng VTable để tìm phương thức ghi đè (override) chính xác tại runtime.", "oop", "{}", oopQuiz?.Id, 30, 2));

            // 4. SOLID Course
            var c4 = new Course(teacher.Id, "Áp dụng Nguyên lý SOLID", "Đi sâu vào 5 nguyên lý thiết kế SOLID giúp mã nguồn dễ mở rộng, bảo trì và kiểm thử.", "solid", "Hard", true, "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&q=80");
            c4.Lessons.Add(new Lesson(c4.Id, "Nguyên lý Đơn Trách Nhiệm (SRP)", "# Nguyên lý Đơn Trách Nhiệm (Single Responsibility Principle)\nMỗi lớp chỉ nên đảm nhận duy nhất một lý do để thay đổi.\n\n### Dấu hiệu vi phạm:\nMột lớp vừa đọc file, vừa parse JSON, vừa ghi log lên DB.", "solid", "{}", null, 25, 1));
            c4.Lessons.Add(new Lesson(c4.Id, "Nguyên lý Đóng Mở (OCP)", "# Nguyên lý Đóng Mở (Open/Closed Principle)\nLớp nên mở rộng cho kế thừa tiếp theo nhưng đóng cho sửa đổi trực tiếp.\n\n### Giải pháp:\nSử dụng Interface và kế thừa đa hình để thêm chức năng mới.", "solid", "{}", solidQuiz?.Id, 35, 2));

            // 5. Design Patterns Course
            var c5 = new Course(teacher.Id, "Mẫu thiết kế Kinh điển", "Học cách thiết kế hệ thống phần mềm chuyên nghiệp sử dụng Strategy, Observer, Factory và các DI container.", "patterns", "Hard", true, "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=500&q=80");
            c5.Lessons.Add(new Lesson(c5.Id, "Strategy Pattern", "# Mẫu Thiết kế Chiến lược (Strategy Pattern)\nStrategy đóng gói các thuật toán thành các lớp riêng biệt để client có thể hoán đổi hành vi tại runtime.", "patterns", "{}", null, 25, 1));
            c5.Lessons.Add(new Lesson(c5.Id, "Observer Pattern", "# Mẫu Thiết kế Quan sát (Observer Pattern)\nĐịnh nghĩa quan hệ một-nhiều giữa các đối tượng để khi một đối tượng đổi trạng thái, các subscriber tự động nhận thông báo.", "patterns", "{}", patternsQuiz?.Id, 35, 2));

            await _context.Courses.AddRangeAsync(c1, c2, c3, c4, c5);
            await _context.SaveChangesAsync();
        }
    }
}
