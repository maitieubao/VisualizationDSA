using System;
using System.Collections.Generic;
using VisualizationDSA.Domain.Enums;
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
            await SeedCheatSheetAsync();
            try { await SeedBadgesAsync(); } catch (Exception ex) { Console.WriteLine($"[SeedBadges Error]: {ex.Message}"); }
            try { await SeedLeaderboardUsersAsync(); } catch (Exception ex) { Console.WriteLine($"[SeedUsers Error]: {ex.Message}"); }
            try { await SeedQuizzesAsync(); } catch (Exception ex) { Console.WriteLine($"[SeedQuizzes Error]: {ex.Message}"); }
            try { await SeedCoursesAsync(); } catch (Exception ex) { Console.WriteLine($"[SeedCourses Error]: {ex}"); }
            try { await SeedSemanticGraphAsync(); } catch (Exception ex) { Console.WriteLine($"[SeedGraph Error]: {ex.Message}"); }
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
            if (_context.Courses.Count() < 11)
            {
                _context.Lessons.RemoveRange(_context.Lessons);
                _context.Courses.RemoveRange(_context.Courses);
                await _context.SaveChangesAsync();
            }

            var teacher = await _context.Users.FirstOrDefaultAsync(u => u.Role == "Teacher" || u.Role == "Admin")
                          ?? await _context.Users.FirstOrDefaultAsync();
            if (teacher == null)
            {
                teacher = new User("teacher@visualizationdsa.dev", "Default Teacher", HashPasswordSHA256("Teacher@2024"));
                teacher.SetRole("Teacher");
                await _context.Users.AddAsync(teacher);
                await _context.SaveChangesAsync();
            }

            var bubbleSortQuiz = await _context.Quizzes.FirstOrDefaultAsync(q => q.Title.Contains("Bubble"));
            var quickSortQuiz = await _context.Quizzes.FirstOrDefaultAsync(q => q.Title.Contains("Quick"));
            var oopQuiz = await _context.Quizzes.FirstOrDefaultAsync(q => q.Title.Contains("OOP"));
            var solidQuiz = await _context.Quizzes.FirstOrDefaultAsync(q => q.Title.Contains("SOLID"));
            var patternsQuiz = await _context.Quizzes.FirstOrDefaultAsync(q => q.Title.Contains("Patterns"));
            var dsaBasicsQuiz = await _context.Quizzes.FirstOrDefaultAsync(q => q.Title.Contains("Nền tảng DSA"));
            var linkedListQuiz = await _context.Quizzes.FirstOrDefaultAsync(q => q.Title.Contains("Danh sách liên kết"));
            var stackQueueQuiz = await _context.Quizzes.FirstOrDefaultAsync(q => q.Title.Contains("Ngăn xếp"));
            var treeQuiz = await _context.Quizzes.FirstOrDefaultAsync(q => q.Title.Contains("Duyệt cây"));
            var graphQuiz = await _context.Quizzes.FirstOrDefaultAsync(q => q.Title.Contains("Đồ thị"));
            var dpQuiz = await _context.Quizzes.FirstOrDefaultAsync(q => q.Title.Contains("Quy hoạch động"));
            var systemQuiz = await _context.Quizzes.FirstOrDefaultAsync(q => q.Title.Contains("System Design"));

            
            
            

            
            var c1 = new Course(teacher.Id, "Nhập môn Cấu trúc dữ liệu & Giải thuật",
                "Làm quen với giao diện AlgoLens, hiểu bản chất Big-O, thao tác mảng, đệ quy và xử lý chuỗi cơ bản.",
                CourseCategory.DataStructure, CourseDifficulty.Beginner, true,
                "https://images.unsplash.com/photo-1516116211223-48a122638c59?w=500&q=80");
            AddLessonToCourse(c1, "Độ phức tạp thuật toán (Big O) & Mảng",
                @"# 📖 Đánh Giá Độ Phức Tạp Big O
Big O mô tả xu hướng tăng thời gian/bộ nhớ khi kích thước đầu vào N tăng dần.

### Mảng (Array)
- Lưu trữ các phần tử liên tiếp trên RAM.
- Truy cập ngẫu nhiên qua index `O(1)`.
- Chèn/xóa phần tử trung gian `O(N)`.

### Phân tích một số hàm phổ biến:
- `O(1)`: truy cập phần tử mảng.
- `O(log N)`: tìm kiếm nhị phân.
- `O(N)`: duyệt mảng tuyến tính.
- `O(N log N)`: sắp xếp nhanh.
- `O(N²)`: hai vòng lặp lồng nhau.",
                "dsa", "{\"array\":[5,12,8,25,3]}", dsaBasicsQuiz?.Id, 30, 1);

            AddLessonToCourse(c1, "Đệ quy & phân tích độ phức tạp không gian",
                @"# 🔁 Đệ Quy (Recursion)
Một hàm gọi lại chính nó với đầu vào nhỏ hơn cho đến khi đạt điều kiện dừng (base case).

### Ví dụ tính giai thừa
```csharp
int Factorial(int n) {
    if (n <= 1) return 1;          // base case
    return n * Factorial(n - 1);   // recursive case
}
```

### Ngăn xếp gọi đệ quy (Call Stack)
Mỗi lần gọi đệ quy, một stack frame được đẩy vào. Tổng số frame chiếm `O(N)` bộ nhớ, có thể gây StackOverflow với N lớn.

### So sánh với vòng lặp
- Đệ quy: code gọn, trực quan với bài toán chia để trị.
- Vòng lặp: tiết kiệm bộ nhớ hơn trong đa số trường hợp.",
                "dsa", "{}", null, 25, 2);

            AddLessonToCourse(c1, "Xử lý chuỗi cơ bản",
                @"# 🔤 Xử Lý Chuỗi
Chuỗi là mảng ký tự, thường là immutable trong C#.

### Các thao tác hay dùng
- `Length`: lấy độ dài.
- `Substring(start, length)`: lấy chuỗi con.
- `IndexOf(char)`: tìm vị trí ký tự.
- Duyệt bằng `foreach` hoặc `for`.

### Bài toán mẫu: đảo ngược chuỗi
```csharp
string Reverse(string s) {
    char[] arr = s.ToCharArray();
    Array.Reverse(arr);
    return new string(arr);
}
```
### Palindrome kiểm tra
```csharp
bool IsPalindrome(string s) {
    int left = 0, right = s.Length - 1;
    while (left < right) {
        if (s[left] != s[right]) return false;
        left++; right--;
    }
    return true;
}
```
Độ phức tạp `O(N)` thời gian, `O(1)` không gian.",
                "dsa", "{}", null, 25, 3);

            
            var c2 = new Course(teacher.Id, "Làm chủ Danh sách liên kết (Linked List)",
                "Nắm vững con trỏ, Node, Singly vs Doubly Linked List, kỹ thuật cắt nối, quản lý bộ nhớ và ứng dụng LRU Cache.",
                CourseCategory.DataStructure, CourseDifficulty.Beginner, true,
                "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=500&q=80");
            AddLessonToCourse(c2, "Con trỏ & Cắt nối Node trong Linked List",
                @"# 📖 Cấu Trúc Danh Sách Liên Kết
Mỗi Node chứa giá trị `Data` và con trỏ `Next` trỏ tới phần tử tiếp theo.

### Thao tác cắt nối
- **Thêm vào đầu**: tạo node mới → trỏ `next` vào head cũ → gán head = node mới.
- **Xóa node giữa**: cập nhật `prev.next = curr.next` (cần con trỏ prev).
- **Đảo ngược**: dùng 3 con trỏ `prev, curr, next`.

### Bẫy thường gặp: Memory Leak
Khi gán `head = head.next` mà không giải phóng node cũ (trong ngôn ngữ không có GC như C++). Trong C#/.NET, GC sẽ dọn, nhưng vẫn cần cẩn thận với các tham chiếu vòng.",
                "dsa", "{\"nodes\":[10,20,30]}", linkedListQuiz?.Id, 35, 1);

            AddLessonToCourse(c2, "Doubly Linked List & Sentinel Nodes",
                @"# 🔗 Doubly Linked List
Mỗi node có thêm con trỏ `Prev` trỏ về node trước.

### Ưu điểm
- Duyệt hai chiều, xóa node khi chỉ có con trỏ đến chính node đó trong O(1).
- Sentinel (node giả đầu/cuối) giúp đơn giản code thêm/xóa tại biên.

### Cài đặt Sentinel đơn giản
```csharp
class LinkedList {
    Node head = new Node(0); // sentinel
    Node tail = new Node(0);
    // head.next = tail; tail.prev = head;
}
```
Mọi node thật nằm giữa hai sentinel, tránh phải kiểm tra null liên tục.",
                "dsa", "{}", null, 30, 2);

            AddLessonToCourse(c2, "Ứng dụng: LRU Cache",
                @"# 💾 LRU Cache (Least Recently Used)
Kết hợp **Hash Map** (truy cập O(1)) và **Doubly Linked List** (duy trì thứ tự truy cập).

### Ý tưởng
- Mỗi khi truy cập một key, di chuyển node tương ứng lên đầu danh sách.
- Khi cache đầy, xóa node ở cuối danh sách (ít được dùng nhất).

### Độ phức tạp
- `Get(key)`: O(1) – tìm trong map và di chuyển node.
- `Put(key, value)`: O(1) – thêm mới hoặc cập nhật.

Đây là bài phỏng vấn kinh điển, minh họa rõ cách kết hợp hai cấu trúc dữ liệu.",
                "dsa", "{}", null, 30, 3);

            
            var c3 = new Course(teacher.Id, "Ngăn xếp & Hàng đợi (Stack & Queue)",
                "Hiểu rõ nguyên lý LIFO vs FIFO, ứng dụng Stack trong Undo/Redo, tính toán biểu thức và Queue trong xử lý hàng chờ.",
                CourseCategory.DataStructure, CourseDifficulty.Beginner, true,
                "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&q=80");
            AddLessonToCourse(c3, "Nguyên lý LIFO vs FIFO & Valid Parentheses",
                @"# 📖 Ngăn Xếp (Stack) & Hàng Đợi (Queue)
- **Stack**: Vào sau Ra trước (LIFO). Thao tác `Push` / `Pop` / `Peek`.
- **Queue**: Vào trước Ra trước (FIFO). Thao tác `Enqueue` / `Dequeue`.

### Ứng dụng Stack: Valid Parentheses
Kiểm tra chuỗi ngoặc hợp lệ:
- Gặp `(`, `[`, `{` → push vào stack.
- Gặp `)`, `]`, `}` → pop stack và kiểm tra khớp.
- Cuối cùng stack phải rỗng.

```csharp
bool IsValid(string s) {
    var stack = new Stack<char>();
    foreach (char c in s) {
        if (c == '(') stack.Push(')');
        else if (c == '[') stack.Push(']');
        else if (c == '{') stack.Push('}');
        else if (stack.Count == 0 || stack.Pop() != c) return false;
    }
    return stack.Count == 0;
}
```",
                "dsa", "{\"stack\":[\"(\",\"[\"]}", stackQueueQuiz?.Id, 35, 1);

            AddLessonToCourse(c3, "Stack & tính toán biểu thức (Infix ↔ Postfix)",
                @"# 📊 Stack với biểu thức số học
- **Infix** (toán tử giữa hai toán hạng): `A + B * C`
- **Postfix** (RPN - ký pháp nghịch đảo Ba Lan): `A B C * +`

### Chuyển Infix sang Postfix
Sử dụng stack toán tử, quy tắc ưu tiên:
1. Toán hạng → xuất thẳng.
2. Toán tử → pop các toán tử có độ ưu tiên cao hơn hoặc bằng khỏi stack trước khi push.
3. Dấu ngoặc `(` push, `)` pop đến khi gặp `(`.

### Tính Postfix
Duyệt trái sang phải: gặp toán hạng push vào stack, gặp toán tử pop 2 toán hạng, tính rồi push kết quả. Kết quả cuối cùng nằm ở đỉnh stack.",
                "dsa", "{}", null, 30, 2);

            AddLessonToCourse(c3, "Circular Queue & Deque",
                @"# 🔄 Hàng đợi vòng (Circular Queue)
Dùng mảng cố định, hai con trỏ `front` và `rear` di chuyển vòng quanh.

### Ưu điểm
- Tránh lãng phí bộ nhớ so với hàng đợi tuyến tính khi dequeue.
- Thường dùng trong scheduler, buffer.

### Deque (Double-ended Queue)
Hàng đợi hai đầu, cho phép thêm/xóa ở cả front và rear. Có thể cài bằng doubly linked list hoặc mảng vòng. Ứng dụng: lưu lịch sử undo/redo hai chiều.",
                "dsa", "{}", null, 25, 3);

            
            
            

            
            var c4 = new Course(teacher.Id, "Sắp xếp & Tìm kiếm hiệu quả",
                "Làm chủ tư duy Divide & Conquer, so sánh side-by-side tốc độ Bubble vs Quick vs Merge Sort và tìm kiếm nhị phân nâng cao.",
                CourseCategory.Sorting, CourseDifficulty.Intermediate, true,
                "https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=500&q=80");
            AddLessonToCourse(c4, "So sánh Sắp xếp Nổi bọt & Quick Sort",
                @"# 📖 Thuật Toán Sắp Xếp Kinh Điển
- **Bubble Sort**: O(n²), so sánh cặp kề nhau.
- **Quick Sort**: O(n log n) trung bình, chia mảng dựa trên Pivot.

### Bubble Sort code
```csharp
void BubbleSort(int[] arr) {
    for (int i = 0; i < arr.Length - 1; i++)
        for (int j = 0; j < arr.Length - i - 1; j++)
            if (arr[j] > arr[j + 1])
                (arr[j], arr[j + 1]) = (arr[j + 1], arr[j]);
}
```
### Quick Sort: chọn pivot & phân đoạn
```csharp
int Partition(int[] arr, int low, int high) {
    int pivot = arr[high];
    int i = low - 1;
    for (int j = low; j < high; j++) {
        if (arr[j] <= pivot) {
            i++;
            (arr[i], arr[j]) = (arr[j], arr[i]);
        }
    }
    (arr[i+1], arr[high]) = (arr[high], arr[i+1]);
    return i + 1;
}
```
Pivot quyết định hiệu năng: nếu chọn pivot xấu nhất → O(n²).",
                "sorting", "{\"array\":[29,10,14,37,13]}", bubbleSortQuiz?.Id, 45, 1);

            AddLessonToCourse(c4, "Quick Sort – chi tiết Pivot & phân vùng",
                @"# ⚡ Quick Sort In-Depth
### Chiến lược chọn Pivot
- Đầu/cuối mảng: đơn giản nhưng dễ gặp worst-case (mảng đã sắp xếp).
- Ngẫu nhiên: tránh worst-case (Las Vegas).
- Median-of-three: chọn median của first, middle, last.

### Phân vùng Lomuto vs Hoare
- **Lomuto**: chọn pivot cuối, đơn giản, thường chậm hơn.
- **Hoare**: hai con trỏ từ hai đầu, hiệu quả hơn nhưng khó cài đặt đúng.

Quick Sort là **unstable** nhưng có thể cài đặt **in-place** (O(log n) stack).",
                "sorting", null, quickSortQuiz?.Id, 50, 2);

            AddLessonToCourse(c4, "Merge Sort & Tìm kiếm nhị phân",
                @"# 🔀 Merge Sort – Chia để trị
- Đệ quy chia mảng làm đôi cho đến khi mỗi phần chỉ còn 1 phần tử.
- Hợp nhất (merge) hai mảng con đã sắp xếp thành mảng lớn hơn.
- Luôn đạt O(n log n), **ổn định** (stable), nhưng cần O(n) bộ nhớ phụ.

### Tìm kiếm nhị phân (Binary Search)
Áp dụng trên mảng đã sắp xếp.
- So sánh phần tử giữa: nếu bằng → tìm thấy.
- Nhỏ hơn → tìm nửa trái, lớn hơn → tìm nửa phải.
- Độ phức tạp O(log n).

Biến thể: tìm kiếm nhị phân trên mảng xoay (Rotated Sorted Array).",
                "sorting", "{}", null, 40, 3);

            
            var c5 = new Course(teacher.Id, "Cây nhị phân & Duyệt cây (Binary Trees)",
                "Khảo sát tư duy đệ quy, duyệt cây DFS (Pre/In/Post order), BFS theo tầng và cây tìm kiếm nhị phân.",
                CourseCategory.DataStructure, CourseDifficulty.Intermediate, true,
                "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&q=80");
            AddLessonToCourse(c5, "Duyệt Cây DFS & BFS Quay Lui",
                @"# 📖 Cấu Trúc Cây Nhị Phân & Traversal
### DFS (Depth-First Search)
- **Pre-order**: Nốt → trái → phải.
- **In-order**: trái → nốt → phải.
- **Post-order**: trái → phải → nốt.
Dùng đệ quy hoặc stack (tường minh).

### BFS (Breadth-First Search)
Duyệt theo tầng (Level Order), dùng queue:
```csharp
void BFS(TreeNode root) {
    var q = new Queue<TreeNode>();
    q.Enqueue(root);
    while (q.Count > 0) {
        var node = q.Dequeue();
        Process(node);
        if (node.left != null) q.Enqueue(node.left);
        if (node.right != null) q.Enqueue(node.right);
    }
}
```",
                "dsa", "{\"tree\":[1,2,3,4,5]}", treeQuiz?.Id, 45, 1);

            AddLessonToCourse(c5, "Cây tìm kiếm nhị phân (BST) & thao tác",
                @"# 🌳 Binary Search Tree
- Mọi nốt con trái < nốt cha < mọi nốt con phải.
- Thao tác tìm kiếm, thêm, xóa trung bình O(log n), worst-case O(n) nếu cây suy biến thành danh sách liên kết.

### Xóa node trong BST
1. Nốt lá: xóa trực tiếp.
2. Một con: thay bằng con.
3. Hai con: tìm node nhỏ nhất bên phải (in-order successor), copy giá trị, xóa successor.

### Duyệt In-order trên BST cho dãy tăng dần
Đây là tính chất quan trọng để kiểm tra tính hợp lệ của BST.",
                "dsa", "{}", null, 45, 2);

            AddLessonToCourse(c5, "Cây AVL & cân bằng cây",
                @"# ⚖️ Cây AVL (Adelson-Velsky Landis)
BST tự cân bằng, đảm bảo chiều cao O(log n) bằng cách giữ độ lệch ≤ 1.

### Hệ số cân bằng
`balance = height(left) - height(right)` nằm trong {-1, 0, 1}.

### Các phép xoay
- Xoay trái (Left Rotation)
- Xoay phải (Right Rotation)
- Xoay kép (Left-Right, Right-Left)

Nhờ cân bằng, AVL duy trì hiệu năng O(log n) cho mọi thao tác, thích hợp cho ứng dụng cần tìm kiếm nhanh.",
                "dsa", "{}", null, 40, 3);

            
            var c6 = new Course(teacher.Id, "Tư duy Hướng đối tượng (OOP Mastery)",
                "Visual hóa 4 trụ cột OOP, bảng VTable, Composition vs Inheritance và các loại interface.",
                CourseCategory.OOP, CourseDifficulty.Intermediate, true,
                "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&q=80");
            AddLessonToCourse(c6, "Đóng gói & Đa hình qua VTable",
                @"# 🔐 4 Trụ Cột OOP & VTable
### Encapsulation (Đóng gói)
Ẩn chi tiết bên trong, chỉ phơi bày những gì cần thiết qua public methods. Sử dụng `private`, `protected`.

### Polymorphism (Đa hình)
Phương thức ảo (virtual) cho phép lớp con override. Khi gọi qua tham chiếu lớp cha, runtime tra cứu VTable để gọi đúng phương thức của lớp thực tế.

VTable: mỗi lớp có bảng chứa địa chỉ các phương thức ảo. Cơ chế Dynamic Dispatch chọn đúng hàm lúc runtime.",
                "oop", "{}", oopQuiz?.Id, 50, 1);

            AddLessonToCourse(c6, "Kế thừa sâu & Composition vs Inheritance",
                @"# 🧬 Kế thừa vs Composition
### Vấn đề kế thừa sâu
- Lớp con phụ thuộc chặt vào lớp cha, khó thay đổi.
- Dễ vi phạm Liskov Substitution Principle.
- Kế thừa đa cấp tạo ra cây phức tạp.

### Ưu tiên Composition
`""Favor composition over inheritance""` – sử dụng field/object bên trong thay vì kế thừa, tạo sự linh hoạt, dễ mở rộng.

### Ví dụ
```csharp
class Car {
    Engine engine;  // composition
    void Start() { engine.Ignite(); }
}
```
Thay đổi `Engine` không ảnh hưởng đến `Car`.",
                "oop", "{}", null, 45, 2);

            AddLessonToCourse(c6, "Abstract Class, Interface & Default Implementation",
                @"# 📜 Abstract Class vs Interface
- **Abstract class**: có thể chứa method thường, constructor, state. Dùng khi các lớp có mối quan hệ ""is-a"" và chia sẻ code.
- **Interface**: khai báo hợp đồng, hỗ trợ đa kế thừa. Từ C# 8.0 có default implementation.

### Khi nào dùng?
- Dùng interface cho khả năng (can-do), abstract class cho bản chất (is-a).
- Ví dụ: `IFlyable`, `ISwimmable` là interface; `Animal` là abstract class.

### Dependency Inversion
Code hướng interface giúp giảm coupling, dễ test và bảo trì.",
                "oop", "{}", null, 40, 3);

            
            var c7 = new Course(teacher.Id, "Design Patterns cơ bản",
                "Học cách thiết kế phần mềm linh hoạt bằng Singleton, Factory, Observer, Strategy, Decorator, Proxy.",
                CourseCategory.Patterns, CourseDifficulty.Intermediate, true,
                "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=500&q=80");
            AddLessonToCourse(c7, "Observer & Strategy Pattern",
                @"# 👀 Observer Pattern
Định nghĩa phụ thuộc 1-nhiều: khi một đối tượng (Subject) thay đổi trạng thái, tất cả Observer được thông báo tự động.
- Subject giữ danh sách Observer, cung cấp Attach/Detach/Notify.
- Sử dụng trong event handling, MVC.

### 🧠 Strategy Pattern
Đóng gói các thuật toán vào từng lớp riêng, cho phép hoán đổi linh hoạt lúc runtime.
- Ví dụ: `ICompressionStrategy` với `ZipCompression`, `RarCompression`.
- Context chỉ cần tham chiếu đến strategy interface.",
                "patterns", "{}", patternsQuiz?.Id, 50, 1);

            AddLessonToCourse(c7, "Singleton & Factory Method",
                @"# 🔒 Singleton Pattern
Đảm bảo chỉ một instance duy nhất, cung cấp global access point.
```csharp
public class Logger {
    private static Logger instance;
    private Logger() {}
    public static Logger Instance {
        get {
            if (instance == null) instance = new Logger();
            return instance;
        }
    }
}
```
### 🏭 Factory Method
Định nghĩa interface để tạo đối tượng, nhưng để subclass quyết định class cụ thể.
- Giảm sự phụ thuộc vào `new`, dễ mở rộng thêm loại mới.
- Ví dụ: `Document` với `CreatePage()` factory method, các subclass `Resume`, `Report` override.",
                "patterns", "{}", null, 45, 2);

            AddLessonToCourse(c7, "Decorator & Proxy Pattern",
                @"# 🎀 Decorator Pattern
Gán thêm trách nhiệm cho object một cách động mà không sửa code gốc. Các decorator wrap object gốc.
- Ví dụ: `ICoffee` → `SimpleCoffee` → `MilkDecorator` → `SugarDecorator`.
- Mỗi decorator thêm hành vi trước/sau khi gọi đối tượng gốc.

### 🛡️ Proxy Pattern
Cung cấp đối tượng thay thế để kiểm soát truy cập đến object thật.
- Virtual Proxy: lazy loading.
- Protection Proxy: kiểm tra quyền truy cập.
- Remote Proxy: giao tiếp qua mạng.",
                "patterns", "{}", null, 40, 3);

            
            
            

            
            var c8 = new Course(teacher.Id, "Đồ thị & Bài toán tối ưu đường đi",
                "Khảo sát biểu diễn đồ thị, Dijkstra, Bellman-Ford, duyệt đồ thị và Topological Sort.",
                CourseCategory.Graph, CourseDifficulty.Advanced, true,
                "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&q=80");
            AddLessonToCourse(c8, "Thuật toán Dijkstra & Cạnh trọng số âm",
                @"# 📈 Dijkstra – Đường đi ngắn nhất
Sử dụng hàng đợi ưu tiên (Min-Heap) chọn đỉnh có khoảng cách nhỏ nhất chưa xét.
- Bắt đầu từ nguồn: dist[src]=0, còn lại ∞.
- Vòng lặp: lấy đỉnh u có dist nhỏ nhất → cập nhật các đỉnh v kề nếu `dist[u] + w < dist[v]`.

### Lưu ý quan trọng
**Không dùng được với cạnh trọng số âm** vì khi cố định khoảng cách một đỉnh, ta không thể giảm thêm nếu có đường đi qua cạnh âm chưa xét. Khi đó dùng Bellman-Ford.",
                "graph", "{}", graphQuiz?.Id, 60, 1);

            AddLessonToCourse(c8, "Bellman-Ford & Phát hiện chu trình âm",
                @"# 🔄 Bellman-Ford
- Khởi tạo dist[src]=0, còn lại ∞.
- Lặp |V|-1 lần: relax tất cả các cạnh (`if dist[u] + w < dist[v] then update`).
- Sau |V|-1 lần, nếu vẫn còn cạnh có thể relax → đồ thị chứa chu trình âm.

### So sánh với Dijkstra
- Bellman-Ford chậm hơn O(VE) nhưng xử lý được cạnh âm.
- Thường dùng trong các bài toán tài chính, mạng máy tính phát hiện arbitrage.",
                "graph", "{}", null, 55, 2);

            AddLessonToCourse(c8, "Duyệt đồ thị (BFS/DFS) & Topological Sort",
                @"# 🌐 Duyệt đồ thị
- **BFS**: Duyệt theo chiều rộng, dùng queue. Tìm đường ngắn nhất trên đồ thị không trọng số.
- **DFS**: Duyệt theo chiều sâu, dùng stack/đệ quy. Phát hiện chu trình, topological sort.

### Topological Sort (Sắp xếp topo)
Chỉ áp dụng cho DAG (Directed Acyclic Graph). Dùng DFS: khi duyệt xong một đỉnh, đẩy vào stack. Thứ tự pop ra cho ta thứ tự topo.
- Ứng dụng: lập lịch công việc, phân giải phụ thuộc.",
                "graph", "{}", null, 50, 3);

            
            var c9 = new Course(teacher.Id, "Nguyên lý SOLID & Tái cấu trúc code",
                "Tối ưu kiến trúc phần mềm với 5 nguyên lý SOLID, chỉ số LCOM4, kỹ thuật Refactoring God Class và Dependency Injection.",
                CourseCategory.SOLID, CourseDifficulty.Advanced, true,
                "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&q=80");
            AddLessonToCourse(c9, "Đo lường LCOM4 & Nguyên lý SOLID",
                @"# 🔨 SOLID & Code Metrics
### LCOM4 (Lack of Cohesion of Methods)
Đo lường sự thiếu gắn kết giữa các phương thức trong một lớp. LCOM4 cao → lớp làm quá nhiều việc, vi phạm SRP.
- Cách tính: đếm số thành phần liên thông trong đồ thị gọi phương thức.
- Mục tiêu: LCOM4 = 1 (tất cả phương thức liên quan chặt chẽ).

### Nguyên lý SOLID
- **S**ingle Responsibility
- **O**pen/Closed
- **L**iskov Substitution
- **I**nterface Segregation
- **D**ependency Inversion",
                "solid", "{}", solidQuiz?.Id, 60, 1);

            AddLessonToCourse(c9, "Refactoring God Class & Feature Envy",
                @"# 🧹 Refactoring Code Smells
### God Class (Lớp thần thánh)
Một lớp tập trung quá nhiều trách nhiệm, hàng nghìn dòng code.
- Giải pháp: tách thành các lớp nhỏ hơn, mỗi lớp một nhiệm vụ.
- Dùng Extract Class, Extract Method.

### Feature Envy (Ghen tị chức năng)
Một phương thức gọi quá nhiều phương thức của lớp khác hơn là của chính nó.
- Di chuyển phương thức đó sang lớp mà nó ""ghen tị"".

### Data Clumps, Long Parameter List...
Nhận diện qua công cụ phân tích tĩnh (SonarQube) và refactor dần.",
                "solid", "{}", null, 50, 2);

            AddLessonToCourse(c9, "Dependency Injection & Inversion of Control",
                @"# 🔄 IoC & DI
### Inversion of Control (IoC)
Nhường quyền kiểm soát việc tạo đối tượng cho framework/container, thay vì tự `new` trong code.

### Dependency Injection (DI)
- Constructor Injection: truyền dependency qua constructor.
- Method/Property Injection.
- DI Container (Unity, Autofac, .NET Core DI) quản lý vòng đời (Singleton, Scoped, Transient).

Lợi ích: giảm coupling, dễ unit test với mock, tuân thủ DIP.",
                "solid", "{}", null, 45, 3);

            
            var c10 = new Course(teacher.Id, "Quy hoạch động (Dynamic Programming)",
                "Bản chất Memoization vs Tabulation, bài toán Knapsack 0/1, LCS, Edit Distance và tối ưu không gian.",
                CourseCategory.DataStructure, CourseDifficulty.Advanced, true,
                "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=500&q=80");
            AddLessonToCourse(c10, "Bảng Tabulation & Bài toán Cái túi (Knapsack)",
                @"# 🎒 Dynamic Programming cơ bản
### Hai cách tiếp cận
- **Memoization (Top-down)**: đệ quy có lưu trữ kết quả con.
- **Tabulation (Bottom-up)**: điền bảng từ bài toán nhỏ nhất.

### Knapsack 0/1
Cho N đồ vật, trọng lượng w[i], giá trị v[i]. Túi chứa tối đa W. Chọn đồ vật (0/1) để tổng giá trị max.
- DP[i][j]: giá trị max với i đồ vật đầu và trọng lượng j.
- `dp[i][j] = max(dp[i-1][j], v[i] + dp[i-1][j-w[i]])` nếu `j >= w[i]`.
- Độ phức tạp O(N*W).",
                "dsa", "{}", dpQuiz?.Id, 65, 1);

            AddLessonToCourse(c10, "Longest Common Subsequence (LCS) & Edit Distance",
                @"# 📏 LCS – Dãy con chung dài nhất
- Cho hai chuỗi X, Y. Tìm độ dài dãy con chung dài nhất (không cần liên tiếp).
- `dp[i][j] = dp[i-1][j-1] + 1` nếu `X[i]==Y[j]`, ngược lại `max(dp[i-1][j], dp[i][j-1])`.

### Edit Distance (Levenshtein)
Số thao tác ít nhất (insert, delete, replace) để biến chuỗi A thành B.
- `dp[i][j]` với i ký tự đầu của A, j ký tự đầu của B.
- Nếu `A[i]==B[j]`: `dp[i][j] = dp[i-1][j-1]`
- Ngược lại: `1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])`.

Cả hai đều là DP 2D kinh điển, nền tảng cho so sánh văn bản, diff tool.",
                "dsa", "{}", null, 55, 2);

            AddLessonToCourse(c10, "State Machine DP & Tối ưu không gian",
                @"# 🔄 DP nâng cao
### DP với máy trạng thái
Một số bài toán yêu cầu lưu trạng thái (ví dụ: mua bán cổ phiếu với số lần giao dịch giới hạn). DP[ngày][trạng thái] lưu lợi nhuận tối đa.

### Tối ưu không gian
Nhiều bài DP 2D có thể giảm xuống 1D hoặc O(1) bằng cách chỉ lưu hàng trước đó (rolling array).
- Ví dụ: Knapsack 0/1 có thể dùng mảng 1D duyệt ngược:
```csharp
int[] dp = new int[W+1];
for (int i = 0; i < N; i++)
    for (int j = W; j >= w[i]; j--)
        dp[j] = Math.Max(dp[j], v[i] + dp[j - w[i]]);
```
Giảm không gian từ O(N*W) xuống O(W).",
                "dsa", "{}", null, 50, 3);

            
            var c11 = new Course(teacher.Id, "System Design nhập môn & Concurrency",
                "Mô phỏng Packet Routing, Load Balancing, Race Condition, Lock & Thread-safe Singleton, Caching và Consistent Hashing.",
                CourseCategory.SystemDesign, CourseDifficulty.Advanced, true,
                "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&q=80");
            AddLessonToCourse(c11, "Race Condition & Load Balancer Router",
                @"# 🧵 Concurrency & Load Balancing
### Race Condition
Nhiều thread cùng đọc/ghi tài nguyên dùng chung mà không đồng bộ → kết quả không đoán trước.
- Giải pháp: lock (`Monitor.Enter`/`Exit`), Mutex, Semaphore, `Concurrent` collections.

### Load Balancer
Phân phối request đến nhiều server backend.
- **Round Robin**: lần lượt từng server.
- **Least Connections**: chọn server có ít kết nối nhất.
- **IP Hash**: hash client IP để chọn server, giúp session stickiness.",
                "system", "{}", systemQuiz?.Id, 70, 1);

            AddLessonToCourse(c11, "Microservices vs Monolith & Communication",
                @"# 🏗️ Kiến trúc hệ thống
### Monolith
- Toàn bộ ứng dụng đóng gói cùng nhau. Dễ phát triển ban đầu, khó scale và bảo trì khi lớn.

### Microservices
- Chia thành các service nhỏ, độc lập, giao tiếp qua API (REST/gRPC) hoặc message broker (RabbitMQ, Kafka).
- Ưu: scale từng phần, triển khai độc lập.
- Nhược: độ phức tạp quản lý, distributed transactions.

### Communication patterns
- Synchronous (HTTP/REST, gRPC)
- Asynchronous (Event-driven, message queue)",
                "system", "{}", null, 55, 2);

            AddLessonToCourse(c11, "Caching Strategies & Consistent Hashing",
                @"# 💨 Caching & Consistent Hashing
### Caching Strategies
- **Cache-Aside**: App kiểm tra cache, nếu miss thì lấy từ DB rồi ghi vào cache.
- **Write-Through**: Ghi DB + cache đồng thời.
- **Write-Behind**: Ghi cache trước, async ghi DB sau.

### Consistent Hashing
Dùng trong hệ thống cache phân tán (Memcached, Redis cluster).
- Hash cả key và server lên một vòng tròn.
- Key được gán cho server gần nhất theo chiều kim đồng hồ.
- Khi thêm/bớt server, chỉ 1/N key bị ảnh hưởng (thay vì tất cả như hash modulo).",
                "system", "{}", null, 50, 3);

            await _context.Courses.AddRangeAsync(c1, c2, c3, c4, c5, c6, c7, c8, c9, c10, c11);
            await _context.SaveChangesAsync();
        }
    
        private void AddLessonToCourse(Course course, string title, string contentMd, string sandboxType, string sandboxConfig, Guid? quizId, int xpReward, int index)
        {
            var module = course.Modules.FirstOrDefault();
            if (module == null)
            {
                module = new CourseModule(course.Id, "Chương Mặc Định", "Nội dung khóa học", 1000);
                course.Modules.Add(module);
            }

            var lesson = new Lesson(title, contentMd, sandboxType, sandboxConfig, xpReward, course.TeacherId);
            _context.Lessons.Add(lesson);

            var itemOrder = (module.Items.Count + 1) * 1000;
            var lessonItem = new ModuleItem(module.Id, null, VisualizationDSA.Domain.Enums.ModuleItemType.Lesson, lesson.Id, null, null, title, itemOrder, true);
            module.Items.Add(lessonItem);

            if (quizId.HasValue)
            {
                var quizItem = new ModuleItem(module.Id, null, VisualizationDSA.Domain.Enums.ModuleItemType.Quiz, null, quizId.Value, null, "Quiz: " + title, itemOrder + 500, true);
                module.Items.Add(quizItem);
            }
        }
}
}
