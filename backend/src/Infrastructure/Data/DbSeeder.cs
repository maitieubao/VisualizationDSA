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
            await SeedCheatSheetAsync();
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
            var c1 = new Course(teacher.Id, "Thuật toán Sắp xếp Cơ bản", "Khóa học đi từ con số 0 đến nâng cao về các thuật toán sắp xếp. Tìm hiểu cách tổ chức dữ liệu, so sánh hiệu năng và trực quan hóa từng bước chạy của thuật toán.", "sorting", "Easy", false, "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&q=80");
            
            c1.Lessons.Add(new Lesson(c1.Id, "1. Thuật toán Sắp xếp là gì?", """
# I. Khái niệm cốt lõi
**Sắp xếp (Sorting)** là một trong những bài toán nền tảng và lâu đời nhất trong Khoa học máy tính. Nhiệm vụ của nó đơn giản là: *Nhận vào một tập hợp dữ liệu lộn xộn và tổ chức lại chúng theo một thứ tự có tính logic chặt chẽ (tăng dần, giảm dần, theo bảng chữ cái, hoặc theo một quy tắc tùy chỉnh).*

Hãy tưởng tượng bạn bước vào một thư viện mà hàng triệu cuốn sách bị vứt vung vãi trên sàn nhà thay vì được xếp gọn gàng lên kệ theo chủ đề và vần A-Z. Việc tìm ra một cuốn sách cụ thể trong đống lộn xộn đó gần như là một cực hình. Trong thế giới lập trình, hệ điều hành và các phần mềm cũng gặp phải vấn đề tương tự nếu dữ liệu không được sắp xếp.

**Vì sao chúng ta phải học thuật toán sắp xếp cơ bản?**
Nhiều người nghĩ rằng: *"Tại sao phải tự viết thuật toán sắp xếp khi các ngôn ngữ lập trình đều đã có sẵn hàm `Array.Sort()`?"*. Câu trả lời là:
1. **Rèn luyện Tư duy Thuật toán:** Các bài toán sắp xếp cơ bản là công cụ tuyệt vời nhất để bạn làm quen với vòng lặp lồng nhau (nested loops), điều kiện rẽ nhánh và cách thao tác với chỉ mục (index) của mảng.
2. **Hiểu rõ Bản chất:** Hàm `Sort()` có sẵn không phải là một phép thuật. Nó được xây dựng từ chính các thuật toán mà bạn sắp học. Hiểu rõ ưu/nhược điểm của từng thuật toán giúp bạn chọn đúng công cụ cho đúng bài toán.

# II. Ứng dụng thực tế
Sắp xếp không bao giờ đứng một mình. Nó luôn đóng vai trò là **bước tiền xử lý (preprocessing)** mang tính sống còn cho các tác vụ lớn hơn:

- **Tăng tốc độ tìm kiếm:** Bạn không thể dùng Thuật toán Tìm kiếm Nhị phân (Binary Search với tốc độ $O(\log n)$) nếu mảng chưa được sắp xếp. Việc mảng đã sắp xếp cho phép máy tính thu hẹp một nửa phạm vi tìm kiếm chỉ sau mỗi bước.
- **Thống kê và Gom nhóm:** Khi dữ liệu đã được xếp liền kề nhau, việc đếm số lượng các phần tử trùng lặp hoặc tìm kiếm Min/Max trở nên dễ dàng.
- **Hiển thị giao diện người dùng (UI):** Bảng xếp hạng game, danh bạ điện thoại, danh sách sản phẩm theo giá từ thấp đến cao... tất cả đều là ứng dụng của thuật toán sắp xếp.

# III. Tóm tắt
> 💡 Sắp xếp giúp chuẩn hóa thế giới dữ liệu hỗn loạn thành các cấu trúc có trật tự. Trong những bài tiếp theo, chúng ta sẽ lần lượt bóc tách bộ 3 thuật toán kinh điển nhất: **Bubble Sort, Selection Sort và Insertion Sort** để xem cách các nhà khoa học máy tính thế hệ đầu tiên giải quyết bài toán này.
""", "sorting", "{\"array\":[5,3,8,4,2]}", null, 10, 1));
            
            c1.Lessons.Add(new Lesson(c1.Id, "2. Đánh giá hiệu suất: Big O Notation", """
# I. Big O Notation là gì?
Trong thế giới lập trình, chúng ta không đo lường tốc độ của một thuật toán bằng đơn vị "giây" hay "phút". Vì một chiếc máy tính lượng tử chắc chắn sẽ chạy nhanh hơn chiếc laptop đời cũ của bạn, bất kể thuật toán có tệ đến đâu.

Thay vào đó, chúng ta đo lường bằng **Big O Notation** - một khái niệm toán học mô tả: *Số lượng phép tính mà CPU phải thực hiện sẽ tăng lên nhanh như thế nào khi kích thước dữ liệu đầu vào ($n$) phình to ra.*

# II. Độ phức tạp $O(n^2)$ - Nhóm thuật toán Sắp xếp cơ bản
Toàn bộ 3 thuật toán mà bạn sắp học (Bubble, Selection, Insertion) đều thuộc nhóm độ phức tạp **$O(n^2)$** (Thời gian bậc hai).
- **Đặc điểm nhận dạng:** Chúng thường yêu cầu 2 vòng lặp lồng nhau (`for i` lồng bên ngoài `for j`).
- **Ý nghĩa thực tế:** Nếu mảng có $n=10$ phần tử, máy tính mất khoảng $100$ phép so sánh. Nhưng nếu mảng tăng gấp 10 lần ($n=100$), thời gian chạy sẽ **tăng gấp 100 lần** ($10.000$ phép tính). 
- **Ứng dụng:** $O(n^2)$ là một tốc độ rùa bò đối với dữ liệu lớn (Big Data). Tuy nhiên, đối với các mảng siêu nhỏ (dưới 50 phần tử), do chi phí khởi tạo cực thấp nên chúng đôi khi lại chạy nhanh hơn cả các thuật toán tiên tiến.

# III. Tóm tắt
> 💡 Khái niệm Big O là chiếc la bàn để lập trình viên quyết định xem có nên đưa một đoạn code vào hệ thống phục vụ hàng triệu user hay không. Hãy nhớ: Mảng nhỏ dùng $O(n^2)$, mảng lớn dùng $O(n \log n)$.
""", "sorting", "{\"array\":[5,4,3,2,1]}", null, 20, 2));

            c1.Lessons.Add(new Lesson(c1.Id, "3. Sắp xếp Nổi bọt (Bubble Sort)", """
# I. Ý tưởng thuật toán
Lấy cảm hứng từ những bọt khí trong cốc nước có ga luôn tìm cách nổi lên mặt nước, **Bubble Sort** hoạt động bằng cách liên tục quét qua mảng từ trái sang phải. 

Tại mỗi bước, nó so sánh hai phần tử đứng kề nhau. Nếu phần tử đứng trước lớn hơn phần tử đứng sau, nó sẽ tráo đổi (swap) vị trí của hai phần tử này.
- **Kết thúc Vòng lặp thứ 1:** Phần tử lớn nhất chắc chắn bị "đẩy" về vị trí cuối cùng của mảng.
- **Kết thúc Vòng lặp thứ 2:** Phần tử lớn thứ nhì bị đẩy về vị trí áp chót.
Cứ thế lặp lại cho đến khi không còn phần tử nào bị sai vị trí.

# II. Đặc tính kỹ thuật & Đánh giá
- **Độ phức tạp thời gian:** $O(n^2)$ trong trường hợp xấu nhất và $O(n)$ trong trường hợp tốt nhất (nếu có cờ `isSwapped` để dừng sớm).
- **Bộ nhớ phụ (Space Complexity):** $O(1)$. Khả năng hoán đổi trực tiếp (In-place) không tốn thêm RAM.
- **Ưu điểm:** Thuật toán kinh điển, cấu trúc vòng lặp vô cùng đơn giản dễ học cho người mới bắt đầu.
- **Nhược điểm:** Đây được coi là thuật toán sắp xếp **chậm nhất** trong thực tế do phải thực hiện quá nhiều phép hoán đổi bộ nhớ (Swap operations) thừa thãi.

# III. Tóm tắt
> 💡 Quét liên tục, thấy sai thì đổi chỗ ngay lập tức. Mặc dù chậm rề rà, nhưng tính "Ngây thơ" của Bubble Sort lại là viên gạch nền móng để bạn tiến lên các thuật toán phức tạp hơn.
""", "sorting", "{\"array\":[34,1,23,4,8]}", null, 25, 3));

            c1.Lessons.Add(new Lesson(c1.Id, "4. Sắp xếp Chọn (Selection Sort)", """
# I. Ý tưởng thuật toán
Nếu Bubble Sort hơi "tăng động" vì cứ thấy lệch là đổi chỗ, thì **Selection Sort** lại điềm tĩnh hơn rất nhiều. Nó chia mảng làm hai nửa: **Nửa đã sắp xếp (bên trái)** và **Nửa chưa sắp xếp (bên phải)**.

Cách hoạt động:
1. Đứng ở vị trí hiện tại (giả sử vị trí đầu tiên).
2. Quét một vòng toàn bộ các phần tử bên phải để tìm ra **phần tử nhỏ nhất (Min)**.
3. Hoán đổi phần tử Min đó với phần tử ở vị trí hiện tại.
4. Nhích sang vị trí kế tiếp và lặp lại quá trình tìm Min.

# II. Đặc tính kỹ thuật & So sánh
- **Tối ưu Số lần Hoán đổi (Swap):** Trong khi Bubble Sort có thể phải hoán đổi hàng ngàn lần, Selection Sort chỉ thực hiện **tối đa $n-1$ phép hoán đổi**. Nó sinh ra để giải quyết bài toán: *"Việc ghi dữ liệu vào bộ nhớ (Write operation) quá đắt đỏ, hãy hạn chế ghi càng ít càng tốt"*.
- **Căn bệnh "Mù quáng":** Dù mảng của bạn đã được sắp xếp hoàn hảo 100%, Selection Sort vẫn lôi từng phần tử ra và quét lại toàn bộ phần mảng còn lại để tìm Min. Do đó, trường hợp tốt nhất hay xấu nhất của nó đều tốn thời gian **$O(n^2)$**.

# III. Tóm tắt
> 💡 Khảo sát toàn bộ mảng, "Chọn" ra đứa nhỏ nhất, và ném nó về đầu hàng. Chậm nhưng chắc, cực kỳ phù hợp cho các thiết bị cần hạn chế số lần ghi đè phần cứng.
""", "sorting", "{\"array\":[29,10,14,37,13]}", null, 30, 4));

            c1.Lessons.Add(new Lesson(c1.Id, "5. Sắp xếp Chèn (Insertion Sort)", """
# I. Ý tưởng thuật toán
Mọi người chơi bài tiến lên đều vô thức sử dụng thuật toán này! Hãy tưởng tượng tay trái bạn cầm một bộ bài đã được xếp gọn. Mỗi khi rút thêm một lá bài mới từ nọc, bạn lướt mắt từ phải sang trái tập bài trên tay, và **"Chèn" (Insert)** lá bài mới vào đúng khe hở giữa lá bài nhỏ hơn và lớn hơn nó.

Insertion Sort hoạt động y hệt: Cầm từng phần tử ở nửa mảng chưa sắp, lùi về nửa mảng đã sắp, đẩy các phần tử lớn hơn sang phải để tạo chỗ trống, rồi chèn phần tử đó vào.

# II. Đặc tính kỹ thuật & "Sức mạnh ngầm"
Đừng để cái mác độ phức tạp **$O(n^2)$** đánh lừa bạn! Insertion Sort sở hữu những "siêu năng lực" mà các thuật toán khác phải thèm khát:
1. **Nhanh như chớp với mảng gần như đã sắp xếp:** Nếu mảng chỉ có vài phần tử bị sai vị trí, Insertion Sort chỉ tốn thời gian **$O(n)$** để chạy xong.
2. **Khả năng luồng dữ liệu (Online Sorting):** Hệ thống không cần phải có sẵn toàn bộ dữ liệu mới bắt đầu sắp xếp. Dữ liệu cứ "chảy" vào đến đâu, thuật toán chèn vào đến đó. Vô địch trong các bài toán truyền phát (Streaming).
3. **Overhead cực thấp:** Với các mảng rất bé ($n < 50$), nó thậm chí đánh bại cả Quicksort và Merge Sort.

# III. Tóm tắt
> 💡 Đó là lý do tại sao bộ thư viện của JavaScript hay C++ STL đều lén lút sử dụng Insertion Sort làm phương án dự phòng khi chia mảng trong Quicksort xuống kích thước đủ nhỏ.
""", "sorting", "{\"array\":[12,5,15,3,8,9]}", null, 35, 5));

            c1.Lessons.Add(new Lesson(c1.Id, "6. Tính ổn định (Stability) & Bộ nhớ (In-place)", """
# I. Sắp xếp Tại chỗ (In-place)
Khi thao tác với hàng triệu bản ghi, việc cấp phát thêm bộ nhớ phụ (RAM) để chứa mảng tạm là điều vô cùng xa xỉ. 
Thuật toán **In-place** là thuật toán có **Space Complexity là $O(1)$**. Nghĩa là nó chỉ hoán đổi trực tiếp các phần tử trên mảng gốc mà không cần tạo thêm mảng mới. 
- **Tin vui:** Cả Bubble, Selection và Insertion Sort đều là thuật toán In-place.

# II. Tính ổn định (Stability)
Đây là một khái niệm vô cùng quan trọng khi bạn xử lý dữ liệu thực tế (Database).
Giả sử bạn có một danh sách sinh viên đã được sắp xếp sẵn theo **Tên (A-Z)**. Bây giờ sếp yêu cầu bạn sắp xếp lại danh sách đó theo **Điểm số**.
- Nếu 2 sinh viên (An và Bình) có cùng điểm số, thì liệu An có còn đứng trước Bình (do xếp theo Tên trước đó) nữa không?
- **Thuật toán Ổn định (Stable):** Đảm bảo giữ nguyên thứ tự tương đối của các phần tử có giá trị bằng nhau. 
  - *Bubble Sort & Insertion Sort* là các thuật toán **Ổn định**. Nó không hoán đổi những phần tử bằng nhau.
- **Thuật toán Không Ổn định (Unstable):** Vô tình làm đảo lộn thứ tự cũ.
  - *Selection Sort* là thuật toán **Không ổn định**. Vì phép hoán đổi khoảng cách xa của nó có thể ném một phần tử đi qua đầu một phần tử có giá trị bằng với nó.

# III. Tóm tắt
> 💡 Trong thực tế, Tính ổn định (Stability) mang tính quyết định khi bạn cần sắp xếp dữ liệu qua nhiều vòng (multi-pass sorting) giống như tính năng "Sort by Column" trên Excel.
""", "sorting", "{\"array\":[7,2,9,2,3]}", null, 40, 6));

            c1.Lessons.Add(new Lesson(c1.Id, "7. Bảng vàng Tổng kết", """
# I. Nhìn lại chặng đường
Chúc mừng bạn đã hoàn thành bộ 3 thuật toán sắp xếp nền tảng nhất của Khoa học Máy tính! Hãy cùng đối chiếu chúng:

| Thuật toán | Độ phức tạp (Best) | Độ phức tạp (Worst) | Bộ nhớ (Space) | Ổn định (Stable) | Ứng dụng nổi bật |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Bubble Sort** | $O(n)$ | $O(n^2)$ | $O(1)$ | Có | Giảng dạy & Dữ liệu cực nhỏ |
| **Selection Sort** | $O(n^2)$ | $O(n^2)$ | $O(1)$ | Không | Hạn chế số lần ghi bộ nhớ Flash (EEPROM) |
| **Insertion Sort** | $O(n)$ | $O(n^2)$ | $O(1)$ | Có | Mảng gần có thứ tự, Dữ liệu Streaming liên tục |

# II. Lời khuyên thực chiến từ Chuyên gia
Trên thực tế đi làm, bạn sẽ gần như KHÔNG BAO GIỜ phải tự tay code lại 3 thuật toán này từ đầu, mà sẽ gọi các hàm có sẵn như `Array.Sort()` hay `Collections.sort()`.

Vậy tại sao các giáo sư tại MIT hay Stanford vẫn ép sinh viên học chúng?
- Vì nó rèn luyện cho bạn **Tư duy về Độ phức tạp thuật toán (Big O)**. Bạn sẽ hiểu được tại sao hệ thống bị "treo" khi chọc vào database 1 triệu dòng với 2 vòng lặp lồng nhau.
- Vì **Insertion Sort** là xương sống của `TimSort` (Thuật toán sắp xếp mặc định của Python, Java 7+ và V8 JavaScript Engine) khi xử lý các chunk mảng nhỏ. Không có kiến thức nền tảng, bạn không thể vươn lên thành Senior Engineer.

# III. Tóm tắt
> 💡 Các thuật toán cơ bản này là viên gạch đầu tiên. Ở các khóa học sau (như Chia để trị - Divide & Conquer), chúng ta sẽ thấy sự bùng nổ sức mạnh thực sự với Merge Sort và Quick Sort.
""", "sorting", "{\"array\":[1,2,3,4,5]}", null, 45, 7));

            c1.Lessons.Add(new Lesson(c1.Id, "8. Trắc nghiệm cuối khóa (Quiz Boss)", """
# I. Thử thách cuối cùng
Mọi lý thuyết sẽ trôi tuột đi nếu bạn không thực hành. Đây là bài kiểm tra tổng hợp cuối khóa học Sắp xếp Cơ bản. 

Bài kiểm tra này được thiết kế để đánh giá 3 trụ cột kiến thức của bạn:
1. **Phân biệt luồng chạy:** Nhìn vào một mảng đang chạy dở, bạn có đoán được đó là thuật toán nào không?
2. **Hiểu Big O:** Biết khi nào nên dùng thuật toán nào để tối ưu hiệu suất.
3. **Thực hành Code:** Thử thách tự viết code JS trực tiếp trên trình duyệt, không được dùng các hàm có sẵn, hệ thống sẽ đo lường Latency & RAM của bạn theo chuẩn LeetCode.

# II. Điều kiện Vượt ải
- Bạn cần trả lời đúng ít nhất **80%** số câu hỏi.
- Phải qua được bài kiểm tra độ trễ (Linter Check) trong phần Code Sandbox.
- Nếu vượt qua, bạn sẽ nhận được một lượng lớn **XP** và có cơ hội thu thập huy hiệu **Sorting Wizard 📊** siêu hiếm.

# III. Tóm tắt
> 💡 Đã đến lúc chứng minh thực lực. Hãy bấm Khởi động Quiz để bắt đầu bài đánh giá cuối cùng!
""", "sorting", "{\"array\":[]}", bubbleSortQuiz?.Id, 50, 8));

            // 2. Graph Course
            var c2 = new Course(teacher.Id, "Thuật toán Đồ thị Nâng cao", "Khảo sát thế giới đồ thị, các phương pháp duyệt đỉnh BFS/DFS và bài toán tìm đường đi ngắn nhất Dijkstra.", "graph", "Medium", false, "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&q=80");
            c2.Lessons.Add(new Lesson(c2.Id, "1. Khái niệm Cơ bản về Đồ thị", """
# 1. Khái niệm Cơ bản về Đồ thị (Graph Theory)

Đồ thị (Graph) là một cấu trúc dữ liệu mạnh mẽ, bao gồm tập các **đỉnh (Vertices - V)** và tập các **cạnh (Edges - E)** kết nối các đỉnh đó lại với nhau. Đồ thị được sử dụng để mô hình hóa các mối quan hệ đa chiều trong thế giới thực như mạng xã hội, bản đồ giao thông, hay mạng máy tính.

### Phân loại đồ thị:
- **Đồ thị vô hướng (Undirected Graph):** Cạnh nối giữa A và B có thể đi theo cả 2 chiều. Ví dụ: Kết bạn trên Facebook.
- **Đồ thị có hướng (Directed Graph):** Cạnh chỉ đi theo 1 chiều có mũi tên. Ví dụ: Follow trên Instagram (bạn follow người ta chưa chắc người ta follow lại).
- **Đồ thị có trọng số (Weighted Graph):** Mỗi cạnh có một giá trị (chi phí, độ dài, thời gian). Ví dụ: Quãng đường di chuyển giữa các thành phố trên Google Maps.

### Biểu diễn đồ thị trong máy tính:
1. **Ma trận kề (Adjacency Matrix):** Mảng 2 chiều kích thước VxV, truy xuất $O(1)$ nhưng tốn bộ nhớ $O(V^2)$.
2. **Danh sách kề (Adjacency List):** Mảng chứa các danh sách liên kết, tối ưu bộ nhớ $O(V + E)$, thường được dùng nhiều nhất trong thực tế.
""", "graph", "{}", null, 20, 1));
            
            c2.Lessons.Add(new Lesson(c2.Id, "2. Duyệt Đồ thị BFS & DFS", """
# 2. Duyệt Đồ thị BFS & DFS

Duyệt đồ thị là quá trình "đi thăm" tất cả các đỉnh của đồ thị một cách có hệ thống. Có 2 chiến thuật phổ biến:

### A. BFS (Breadth-First Search - Duyệt theo chiều rộng)
- **Cơ chế:** Quét loang ra xung quanh như vết dầu loang. Thăm tất cả các đỉnh kề trực tiếp trước khi đi sâu hơn.
- **Cấu trúc dữ liệu:** Sử dụng **Hàng đợi (Queue - FIFO)**.
- **Ứng dụng:** Tìm đường đi ngắn nhất (ít số cạnh nhất) trên đồ thị không có trọng số, quét mạng xã hội (tìm bạn chung cấp 1, cấp 2).
- **Độ phức tạp:** Thời gian $O(V + E)$, Không gian $O(V)$.

### B. DFS (Depth-First Search - Duyệt theo chiều sâu)
- **Cơ chế:** "Đâm lao thì phải theo lao", đi sâu vào một nhánh cho tới khi cụt đường thì mới quay lui (Backtracking).
- **Cấu trúc dữ liệu:** Sử dụng **Ngăn xếp (Stack - LIFO)** hoặc dùng đệ quy (Recursion Call Stack).
- **Ứng dụng:** Dò đường trong mê cung, phát hiện chu trình (cycle detection), sắp xếp topo (Topological sort).
- **Độ phức tạp:** Thời gian $O(V + E)$, Không gian $O(V)$.
""", "graph", "{}", null, 30, 2));
            
            c2.Lessons.Add(new Lesson(c2.Id, "3. Dijkstra (Đường đi ngắn nhất)", """
# 3. Thuật toán Dijkstra

Dijkstra là thuật toán nổi tiếng bậc nhất để tìm **đường đi ngắn nhất** từ một đỉnh nguồn (Source) đến tất cả các đỉnh còn lại trên đồ thị có **trọng số không âm (Non-negative weights)**.

### Cách hoạt động:
1. Gán khoảng cách từ đỉnh nguồn đến chính nó bằng `0`, và đến mọi đỉnh khác là `Vô cực (Infinity)`.
2. Sử dụng **Hàng đợi Ưu tiên (Priority Queue / Min-Heap)** để luôn chọn ra đỉnh đang có khoảng cách ngắn nhất chưa được chốt (visited).
3. Thăm đỉnh đó và cập nhật lại khoảng cách cho tất cả các đỉnh kề của nó (Quá trình này gọi là **Relaxation**).
4. Lặp lại cho đến khi chốt xong tất cả các đỉnh.

### Đặc điểm & Giới hạn:
- **Ưu điểm:** Cực kỳ nhanh và chính xác với đồ thị thông thường. Ứng dụng cốt lõi của Google Maps (phiên bản cơ bản), OSPF Routing.
- **Nhược điểm:** **Không thể xử lý trọng số âm**. Nếu có cạnh mang giá trị âm, Dijkstra sẽ cho ra kết quả sai lệch hoặc bị kẹt.
- **Độ phức tạp thời gian:** $O((V + E) \log V)$ nhờ sức mạnh của Min-Heap.
""", "graph", "{}", null, 40, 3));
            
            c2.Lessons.Add(new Lesson(c2.Id, "4. Bellman-Ford", """
# 4. Thuật toán Bellman-Ford

Khi Dijkstra thất bại trước **đồ thị có trọng số âm**, Bellman-Ford chính là vị cứu tinh. Dù chậm hơn Dijkstra, nhưng nó có thể chịu đựng được trọng số âm và đặc biệt là phát hiện được **Chu trình âm (Negative Weight Cycle)**.

### Cơ chế hoạt động (Duyệt toàn cục):
Thay vì chọn lọc đỉnh bằng Heap, Bellman-Ford dùng chiến thuật "thà giết lầm hơn bỏ sót":
1. Khởi tạo khoảng cách nguồn là `0`, còn lại là `Vô cực`.
2. Lặp lại quá trình relaxation (cập nhật đường đi) cho **TẤT CẢ các cạnh** chính xác `V - 1` lần (với V là số đỉnh).
3. **Phát hiện chu trình âm:** Lặp thêm lần thứ `V`. Nếu vẫn còn bất kỳ khoảng cách nào được cập nhật ngắn hơn, tức là hệ thống đang kẹt trong một vòng lặp âm vô tận.

### Ứng dụng thực tế:
- Giao thức định tuyến Distance Vector Routing Protocol (RIP).
- Giao dịch ngoại tệ (Arbitrage trading) trong tài chính: tìm vòng lặp tỷ giá để sinh lời vô hạn (chính là ứng dụng của Negative Cycle).
- **Độ phức tạp thời gian:** $O(V \times E)$ - Chậm hơn khá nhiều so với Dijkstra.
""", "graph", "{}", null, 40, 4));
            
            c2.Lessons.Add(new Lesson(c2.Id, "5. Kruskal (Cây khung nhỏ nhất)", """
# 5. Thuật toán Kruskal (MST)

**Cây khung nhỏ nhất (Minimum Spanning Tree - MST)** là một mạng lưới nối tất cả các đỉnh của đồ thị với nhau sao cho **tổng trọng số các cạnh là nhỏ nhất** và **không có chu trình**. Ứng dụng tiêu biểu là việc kéo dây mạng LAN kết nối các tòa nhà với chi phí dây cáp rẻ nhất.

### Chiến thuật của Kruskal (Tham lam - Greedy):
1. Đập vụn đồ thị: Lấy tất cả các cạnh ra và sắp xếp chúng theo chiều tăng dần của trọng số.
2. Lần lượt bốc từng cạnh có trọng số nhỏ nhất ghép vào cây.
3. Trước khi ghép, kiểm tra xem cạnh đó có tạo thành chu trình khép kín không. (Dùng cấu trúc dữ liệu **Disjoint Set / Union-Find** để kiểm tra siêu tốc).
4. Nếu tạo chu trình -> Vứt bỏ cạnh đó. Nếu không -> Chấp nhận.
5. Dừng lại khi đã gom đủ `V - 1` cạnh.

- **Độ phức tạp thời gian:** $O(E \log E)$ do tốn công sắp xếp tất cả các cạnh từ đầu.
""", "graph", "{}", null, 50, 5));
            
            c2.Lessons.Add(new Lesson(c2.Id, "6. Prim (Cây khung nhỏ nhất)", """
# 6. Thuật toán Prim (MST)

Giống như Kruskal, **Prim** cũng giải quyết bài toán Cây khung nhỏ nhất (MST), nhưng cách tiếp cận của Prim lại giống hệt sự lan truyền của một mầm cây.

### Chiến thuật của Prim:
1. Bắt đầu từ một đỉnh bất kỳ, gieo mầm tại đó.
2. Tại mỗi bước, nhìn ra xung quanh các đỉnh kề đang nối với "cây" hiện tại.
3. Chọn cạnh nối có trọng số nhỏ nhất để kết nạp một đỉnh mới vào cây (Sử dụng **Priority Queue / Min-Heap** để luôn rút ra được cạnh nhỏ nhất cực nhanh).
4. Cứ liên tục lan rộng như vết dầu cho đến khi toàn bộ các đỉnh đều bị kết nạp vào cây.

### So sánh Prim vs Kruskal:
- **Kruskal:** Thích hợp cho đồ thị thưa (ít cạnh), vì thao tác sắp xếp cạnh chi phối hiệu năng.
- **Prim:** Vô đối trong các đồ thị dày đặc (Dense Graph - số cạnh khổng lồ), nhờ việc kiểm soát qua Min-Heap theo đỉnh.
- **Độ phức tạp thời gian của Prim:** $O((V + E) \log V)$ (Rất giống thuật toán Dijkstra).
""", "graph", "{}", null, 50, 6));
            
            c2.Lessons.Add(new Lesson(c2.Id, "7. Tarjan (Liên thông mạnh)", """
# 7. Thuật toán Tarjan (Strongly Connected Components)

Một **Thành phần liên thông mạnh (SCC)** trong đồ thị có hướng là một nhóm các đỉnh mà từ đỉnh nào cũng có thể đi đến tất cả các đỉnh còn lại trong nhóm. Ví dụ: Nhóm bạn thân chơi vòng tròn với nhau trên mạng xã hội, nhóm các giao lộ vòng xoay liên hoàn.

### Thuật toán siêu việt của Robert Tarjan:
Thay vì phải duyệt tới duyệt lui nhiều lần, thuật toán Tarjan có thể tìm ra tất cả các cụm SCC chỉ với **DUY NHẤT MỘT LẦN DUYỆT DFS**.

1. Sử dụng một ngăn xếp (Stack) để lưu vết các đỉnh đang khám phá.
2. Cấp cho mỗi đỉnh 2 chỉ số: `Id` (thứ tự thăm) và `LowLink` (id nhỏ nhất mà nó có thể vòng về được).
3. Nếu một đỉnh đi vào ngõ cụt và vòng về chính nó (`LowLink == Id`), đó chính là đỉnh "trưởng tộc" (Root) của một SCC. Toàn bộ các đỉnh trên Stack tính từ Root trở lên sẽ gom lại thành một cụm SCC.

- **Độ phức tạp siêu tốc:** Thời gian $O(V + E)$ - Đây là một trong những giải thuật thanh lịch và hiệu quả nhất trong khoa học máy tính.
""", "graph", "{}", null, 60, 7));
            
            c2.Lessons.Add(new Lesson(c2.Id, "8. A* Search (Đường đi tối ưu)", """
# 8. Thuật toán A* Search (A-Star)

Dijkstra tuy tìm được đường đi ngắn nhất nhưng nó quá "ngây thơ", lan tỏa một cách mù quáng ra 4 phương 8 hướng. **A* (A-Star)** ra đời để gắn thêm "trí tuệ nhân tạo" vào Dijkstra.

### Hàm Heuristic - Bộ não của A*:
A* sử dụng một hàm đánh giá: **`F(n) = G(n) + H(n)`**
- `G(n)`: Khoảng cách thực tế từ nguồn đến đỉnh n (Giống Dijkstra).
- `H(n)`: Hàm Heuristic - **Dự đoán** khoảng cách từ n đến đích (Ví dụ: Khoảng cách đường chim bay Euclidean).

Thay vì quét mọi hướng, A* luôn ưu tiên bốc ra những đỉnh có `F(n)` nhỏ nhất trong Priority Queue. Điều này giúp A* có định hướng rõ ràng, luôn đi "thẳng" về phía đích đến giống như la bàn, thay vì lan man vô hướng.

### Ứng dụng thực tế:
- Là thuật toán số 1 đằng sau việc NPC dò đường (Pathfinding) trong hàng loạt tựa game nổi tiếng (StarCraft, Age of Empires, Liên Minh Huyền Thoại).
- Đóng vai trò cốt lõi trong hệ thống dẫn đường của Google Maps và Robot tự hành.
""", "graph", "{}", null, 80, 8));

            // 3. OOP Course
            var c3 = new Course(teacher.Id, "Lập trình Hướng đối tượng thực chiến", "Làm chủ 4 cột trụ của OOP: Encapsulation, Inheritance, Polymorphism, Abstraction với các mô phỏng bộ nhớ trực quan.", "oop", "Medium", false, "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&q=80");
            c3.Lessons.Add(new Lesson(c3.Id, "1. Nhập môn OOP & Tại sao cần nó?", """
# Bài 1: Nhập môn Lập trình Hướng đối tượng (OOP)

### 1. Vấn đề của Lập trình Thủ tục (Procedural Programming)
- Trước khi có OOP, lập trình viên thường viết code theo hướng thủ tục (các hàm thực thi từ trên xuống dưới).
- **Hạn chế:** Khi hệ thống phình to, dữ liệu bị phân tán, hàm và dữ liệu không gắn kết với nhau khiến code trở thành một mớ bòng bong (Spaghetti code) rất khó bảo trì.

### 2. Lập trình Hướng đối tượng là gì?
- **OOP (Object-Oriented Programming)** là phương pháp nhóm dữ liệu (thuộc tính) và các hàm xử lý dữ liệu (phương thức) lại với nhau thành các **thực thể (Objects)** giống như thế giới thực.
- Ví dụ: Thay vì có 2 mảng rời rạc `Tên_Xe[]` và `Tốc_Độ[]` cùng hàm `Chạy()`, ta tạo ra đối tượng `Xe` chứa cả Tên, Tốc độ và hành vi Chạy bên trong nó.

### 3. Tại sao lại cần OOP?
- **Dễ quản lý:** Giúp chia nhỏ bài toán phức tạp thành các đối tượng độc lập giao tiếp với nhau.
- **Dễ tái sử dụng:** Code có thể được tái sử dụng qua các cơ sở kế thừa.
- **Bảo vệ dữ liệu:** Ngăn chặn việc sửa đổi dữ liệu tùy tiện thông qua tính đóng gói.
""", "oop", "{}", null, 10, 1));

            c3.Lessons.Add(new Lesson(c3.Id, "2. Lớp, Đối tượng & Đóng gói", """
# Bài 2: Lớp, Đối tượng & Tính Đóng gói (Encapsulation)

### 1. Bản vẽ và Thực thể (Class & Object)
- **Lớp (Class):** Là một bản thiết kế (blueprint) định nghĩa các thuộc tính và hành vi. Không chiếm bộ nhớ thực tế.
- **Đối tượng (Object):** Là một thực thể được sinh ra từ Lớp, được cấp phát vùng nhớ trên **Heap** khi dùng từ khóa `new`.

### 2. Tính Đóng gói (Encapsulation)
- Là hành lang bảo vệ dữ liệu. Biến nội bộ được đặt là `private` và chỉ cho phép truy cập qua các "cửa khẩu" an toàn là `public methods` (Getter/Setter).
- **Mô phỏng trực quan:** Một khối hộp trên Heap với biến `_balance` màu Đỏ (Private) bị khóa. Kẻ xấu truy cập trực tiếp sẽ bị dội ngược. Chỉ có thể thông qua hàm `Deposit()` (màu Xanh) để thay đổi dữ liệu một cách an toàn.

### 3. Code Minh Họa (C#)
```csharp
public class BankAccount {
    private decimal _balance; // Đóng gói

    public BankAccount(decimal initialBalance) {
        _balance = initialBalance;
    }

    public void Withdraw(decimal amount) {
        if (amount > 0 && amount <= _balance) {
            _balance -= amount;
        } else {
            throw new Exception("Lỗi: Số dư không đủ!");
        }
    }
}
```
""", "oop", "{}", null, 20, 2));

            c3.Lessons.Add(new Lesson(c3.Id, "3. Tính Kế thừa (Inheritance)", """
# Bài 3: Tính Kế thừa (Inheritance) - Tái sử dụng mã nguồn

### 1. Khái niệm Kế thừa
- Là khả năng một lớp con (Derived Class) thừa hưởng lại các thuộc tính và phương thức của lớp cha (Base Class).
- Biểu diễn mối quan hệ **"Is-A"** (Là một). Ví dụ: Chó là một Động vật (`Dog is an Animal`).
- Giúp tránh việc lặp lại mã (DRY - Don't Repeat Yourself).

### 2. Mô phỏng Trực quan
- **Cây phân cấp (Hierarchy Tree):** Canvas vẽ ra một sơ đồ hình cây. Lớp gốc là `Animal`, truyền các thuộc tính `Age`, `Weight` xuống cho 2 lớp con là `Dog` và `Cat`.
- Khi khởi tạo `new Dog()`, vùng nhớ Heap của Dog không chỉ chứa dữ liệu của Dog mà còn "cõng" thêm vùng nhớ của Animal bên trong nó.

### 3. Code Minh Họa (C#)
```csharp
public class Animal {
    public int Age { get; set; }
    public void Eat() { Console.WriteLine("Đang ăn..."); }
}

public class Dog : Animal {
    public string Breed { get; set; }
    public void Bark() { Console.WriteLine("Gâu gâu!"); }
}

// Sử dụng
Dog myDog = new Dog();
myDog.Eat(); // Kế thừa từ Animal
myDog.Bark(); // Của riêng Dog
```
""", "oop", "{}", null, 25, 3));

            c3.Lessons.Add(new Lesson(c3.Id, "4. Tính Đa hình (Polymorphism)", """
# Bài 4: Tính Đa hình (Polymorphism) - Muôn hình vạn trạng

### 1. Khái niệm Đa hình
- Cho phép một giao diện (hoặc phương thức) có nhiều cách thực thi khác nhau tùy thuộc vào đối tượng gọi nó.
- **Nạp chồng (Overloading):** Cùng tên hàm nhưng khác tham số (Compile-time).
- **Ghi đè (Overriding):** Lớp con thay đổi hành vi của lớp cha bằng từ khóa `virtual` và `override` (Runtime).

### 2. Mô phỏng Trực quan (V-Table)
- Có một mảng kiểu `Animal[]` chứa `[Dog, Cat]`. Vòng lặp gọi hàm `.Speak()`.
- **Trực quan:** Dù gọi cùng một hàm `.Speak()`, nhưng khi trỏ tới `Dog` thì bong bóng hiện *"Gâu gâu!"*, trỏ tới `Cat` thì hiện *"Meo meo!"*.
- **Cơ chế dưới ngầm:** Trình duyệt sẽ zoom vào bảng phương thức ảo (**Virtual Method Table - V-Table**) để chứng minh con trỏ hàm được phân giải động (Late Binding) tại thời gian thực.

### 3. Code Minh Họa (C#)
```csharp
public class Animal {
    public virtual void Speak() { Console.WriteLine("..."); }
}

public class Dog : Animal {
    public override void Speak() { Console.WriteLine("Gâu gâu!"); }
}

public class Cat : Animal {
    public override void Speak() { Console.WriteLine("Meo meo!"); }
}

Animal[] pets = new Animal[] { new Dog(), new Cat() };
foreach (Animal pet in pets) {
    pet.Speak(); // Tự động chọn đúng hàm tại Runtime
}
```
""", "oop", "{}", oopQuiz?.Id, 30, 4));

            c3.Lessons.Add(new Lesson(c3.Id, "5. Tính Trừu tượng (Abstraction)", """
# Bài 5: Tính Trừu tượng (Abstraction) - Tập trung vào bản chất

### 1. Khái niệm Trừu tượng
- Ẩn đi các chi tiết cài đặt phức tạp, chỉ bộc lộ ra những tính năng thiết yếu cho người dùng.
- Trừu tượng được thực hiện thông qua **Lớp trừu tượng (Abstract Class)** hoặc **Giao diện (Interface)**.
- Đóng vai trò như một "bản hợp đồng" (Contract) bắt buộc các lớp con phải tuân thủ.

### 2. Giao diện (Interface) vs Lớp Trừu Tượng (Abstract Class)
- **Interface:** Chỉ chứa khai báo, không chứa cài đặt. Một lớp có thể thực thi nhiều Interface (Đa kế thừa hành vi).
- **Abstract Class:** Có thể chứa cả khai báo lẫn cài đặt dùng chung. Một lớp chỉ được kế thừa một Abstract Class.

### 3. Code Minh Họa (C#)
```csharp
// Bản hợp đồng
public interface IShape {
    double CalculateArea();
}

public class Circle : IShape {
    public double Radius { get; set; }
    
    // Bắt buộc phải tuân thủ hợp đồng (thực thi hàm)
    public double CalculateArea() {
        return Math.PI * Radius * Radius;
    }
}
```
""", "oop", "{}", null, 35, 5));

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
