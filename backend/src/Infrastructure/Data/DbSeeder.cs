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
        // Tài khoản admin/demo với credential công khai chỉ nên tồn tại ở Development.
        private readonly bool _includeDemoAdmin;

        public DbSeeder(ApplicationDbContext context, bool includeDemoAdmin = false)
        {
            _context = context;
            _includeDemoAdmin = includeDemoAdmin;
        }

        public async Task SeedAsync()
        {
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

        private async Task SeedQuizzesAsync()
        {
            // Upsert theo tiêu đề: DB đã có quiz thì giữ nguyên, thiếu thì tạo mới.
            // Cho phép chạy nhiều lần mà không nhân đôi dữ liệu.
            var created = new List<Quiz>();

            async Task<Quiz> GetOrCreate(string title, string description, string topic, int difficulty, int xpReward, Action<Quiz>? configure = null)
            {
                // Tìm trong danh sách đã tạo (pending, chưa SaveChanges) TRƯỚC khi truy vấn DB
                // — tránh duplicate khi hai quiz cùng title trong cùng một seed run.
                var existing = created.FirstOrDefault(q => q.Title == title);
                if (existing == null)
                {
                    existing = await _context.Quizzes.FirstOrDefaultAsync(q => q.Title == title);
                }
                if (existing != null) return existing;
                var quiz = new Quiz(title, description, topic, difficulty, xpReward);
                configure?.Invoke(quiz);
                created.Add(quiz);
                return quiz;
            }

            var bubbleSortQuiz = await GetOrCreate("Bubble Sort Mastery", "Test your knowledge of Bubble Sort algorithm", "sorting", 1, 50, q =>
            {
                q.AddQuestion("What is the time complexity of Bubble Sort in the worst case?", new[] { "O(n)", "O(n log n)", "O(n²)", "O(2^n)" }, 2, "Bubble Sort compares adjacent elements and swaps them if needed, resulting in O(n²) complexity.");
                q.AddQuestion("What is the best case time complexity of Bubble Sort?", new[] { "O(n)", "O(n log n)", "O(n²)", "O(1)" }, 0, "When the array is already sorted, Bubble Sort only needs one pass, achieving O(n).");
                q.AddQuestion("Is Bubble Sort a stable sorting algorithm?", new[] { "Yes", "No", "Only with integers", "Depends on implementation" }, 0, "Bubble Sort is stable because it only swaps adjacent elements when necessary.");
            });

            var quickSortQuiz = await GetOrCreate("Quick Sort Fundamentals", "Master the divide-and-conquer approach of Quick Sort", "sorting", 2, 75, q =>
            {
                q.AddQuestion("What is the average case time complexity of Quick Sort?", new[] { "O(n)", "O(n log n)", "O(n²)", "O(log n)" }, 1, "Quick Sort divides the array and sorts partitions, achieving O(n log n) on average.");
                q.AddQuestion("What is the pivot in Quick Sort?", new[] { "The first element", "The middle element", "An element that partitions the array", "The largest element" }, 2, "The pivot is an element that divides the array into elements less than and greater than it.");
            });

            var oopQuiz = await GetOrCreate("OOP Concepts", "Test your understanding of Object-Oriented Programming", "oop", 2, 100, q =>
            {
                q.AddQuestion("Which principle hides implementation details and exposes only necessary functionality?", new[] { "Inheritance", "Encapsulation", "Polymorphism", "Abstraction" }, 1, "Encapsulation bundles data and methods, hiding internal implementation.");
                q.AddQuestion("What allows a subclass to inherit properties from a parent class?", new[] { "Inheritance", "Encapsulation", "Polymorphism", "Composition" }, 0, "Inheritance enables code reuse by allowing subclasses to inherit parent properties.");
            });

            var solidQuiz = await GetOrCreate("SOLID Principles", "Master the 5 SOLID principles of software design", "solid", 3, 125, q =>
            {
                q.AddQuestion("Which principle states that a class should have only one reason to change?", new[] { "Open/Closed", "Single Responsibility", "Liskov Substitution", "Interface Segregation" }, 1, "Single Responsibility Principle (SRP) states a class should have one responsibility.");
                q.AddQuestion("Which principle suggests classes should be open for extension but closed for modification?", new[] { "Open/Closed", "Single Responsibility", "Liskov Substitution", "Dependency Inversion" }, 0, "Open/Closed Principle (OCP) encourages extension through inheritance or composition.");
            });

            var patternsQuiz = await GetOrCreate("Design Patterns", "Recognize common design patterns and their use cases", "patterns", 3, 150, q =>
            {
                q.AddQuestion("Which pattern defines a one-to-many dependency between objects?", new[] { "Strategy", "Observer", "Factory", "Singleton" }, 1, "Observer pattern allows objects to subscribe to events and get notified automatically.");
                q.AddQuestion("Which pattern lets you change an algorithm's behavior at runtime?", new[] { "Observer", "Strategy", "Decorator", "Builder" }, 1, "Strategy pattern defines a family of algorithms and makes them interchangeable.");
            });

            var dsaBasicsQuiz = await GetOrCreate("Trắc nghiệm Nền tảng DSA", "Đánh giá kiến thức về Big O và Mảng", "dsa", 1, 40, q =>
            {
                q.AddQuestion("Độ phức tạp O(1) nghĩa là gì?", new[] { "Thời gian tuyến tính", "Thời gian hằng số", "Thời gian bình phương", "Thời gian mũ" }, 1, "O(1) là thời gian thực thi không phụ thuộc vào kích thước đầu vào N.");
            });

            var linkedListQuiz = await GetOrCreate("Trắc nghiệm Danh sách liên kết", "Đánh giá nguy cơ rò rỉ bộ nhớ và con trỏ", "dsa", 1, 50, q =>
            {
                q.AddQuestion("Trường hợp nào dẫn tới Memory Leak trong Linked List?", new[] { "Gán head = head.next mà không giải phóng node cũ", "Duyệt qua danh sách", "Tạo node mới", "Đếm số node" }, 0, "Khi làm mất con trỏ trỏ tới node mà không deallocate, dữ liệu bị rò rỉ bộ nhớ.");
            });

            var stackQueueQuiz = await GetOrCreate("Trắc nghiệm Ngăn xếp & Hàng đợi", "Phân biệt nguyên lý LIFO và FIFO", "dsa", 1, 50, q =>
            {
                q.AddQuestion("Cấu trúc dữ liệu nào tuân theo nguyên lý LIFO (Last In First Out)?", new[] { "Queue", "Stack", "Array", "Graph" }, 1, "Stack (Ngăn xếp) vào sau ra trước (LIFO).");
            });

            var treeQuiz = await GetOrCreate("Trắc nghiệm Duyệt cây Nhị phân", "Xác định thứ tự duyệt cây DFS và BFS", "dsa", 2, 80, q =>
            {
                q.AddQuestion("Thứ tự duyệt In-order (Trung thứ) trên cây tìm kiếm nhị phân cho ra kết quả gì?", new[] { "Mảng đã sắp xếp giảm dần", "Mảng đã sắp xếp tăng dần", "Mảng ngẫu nhiên", "Danh sách rỗng" }, 1, "In-order traversal trên BST luôn cho dãy giá trị tăng dần.");
            });

            var graphQuiz = await GetOrCreate("Trắc nghiệm Đồ thị & Dijkstra", "Phân tích rủi ro thuật toán đường đi ngắn nhất", "graph", 3, 120, q =>
            {
                q.AddQuestion("Thuật toán Dijkstra không hoạt động chính xác trong trường hợp nào?", new[] { "Đồ thị có hướng", "Đồ thị vô hướng", "Đồ thị có cạnh trọng số âm", "Đồ thị dày" }, 2, "Dijkstra hoạt động dựa trên tham ăn và có thể đưa ra kết quả sai nếu đồ thị chứa cạnh trọng số âm.");
            });

            var dpQuiz = await GetOrCreate("Trắc nghiệm Quy hoạch động", "Phân biệt Memoization và Tabulation", "dsa", 3, 140, q =>
            {
                q.AddQuestion("Tabulation trong Quy hoạch động là phương pháp gì?", new[] { "Top-down đệ quy", "Bottom-up điền bảng", "Greedy tham ăn", "Brute force" }, 1, "Tabulation điền bảng tính từ các bài toán cơ sở nhỏ nhất lên bài toán lớn (Bottom-up).");
            });

            var systemQuiz = await GetOrCreate("Trắc nghiệm System Design & Multithreading", "Phát hiện Race Condition và Deadlock", "system", 3, 150, q =>
            {
                q.AddQuestion("Race Condition xảy ra khi nào?", new[] { "Chỉ có 1 thread truy cập tài nguyên", "Nhiều thread cùng đọc/ghi tài nguyên dùng chung mà không có đồng bộ", "Khi server bị quá tải", "Khi hết RAM" }, 1, "Race condition xuất hiện khi kết quả phụ thuộc vào thứ tự thực thi ngẫu nhiên của các luồng.");
            });

            var qL01 = await GetOrCreate("Trắc nghiệm Big O & Độ phức tạp", "Kiểm tra kiến thức: Trắc nghiệm Big O & Độ phức tạp", "dsa", 1, 40, q =>
            {
                q.AddQuestion("Ký hiệu Big O dùng để đo lường điều gì?", new[] { "Thời gian chạy tuyệt đối tính bằng giây trên máy cụ thể", "Xu hướng tăng trưởng của thời gian chạy khi N tăng", "Số dòng code cần viết cho thuật toán", "Mức tiêu thụ điện năng của máy tính" }, 1, "Big O mô tả tốc độ tăng trưởng (asymptotic growth) của thời gian hoặc bộ nhớ, không phụ thuộc máy tính cụ thể.");
                q.AddQuestion("Biểu thức 3N² + 5N + 10 có độ phức tạp Big O là gì?", new[] { "O(N)", "O(N²)", "O(N³)", "O(N log N)" }, 1, "Bỏ hằng số 3 và số hạng bậc thấp 5N + 10, giữ bậc cao nhất N² nên kết quả là O(N²).");
                q.AddQuestion("Tìm kiếm nhị phân trên mảng đã sắp xếp có độ phức tạp thời gian là bao nhiêu?", new[] { "O(1)", "O(N)", "O(log N)", "O(N²)" }, 2, "Mỗi bước thuật toán loại bỏ một nửa không gian tìm kiếm nên chỉ cần log2(N) bước.");
                q.AddQuestion("Hai vòng lặp lồng nhau, mỗi vòng chạy N lần, có độ phức tạp là gì?", new[] { "O(N)", "O(N log N)", "O(N²)", "O(2N)" }, 2, "Số lần lặp tổng cộng là N x N = N², tương ứng O(N²).");
                q.AddQuestion("Với N = 1.000.000, thuật toán O(log N) cần khoảng bao nhiêu bước so với O(N)?", new[] { "20 bước thay vì 1 triệu bước", "1 triệu bước thay vì 20 bước", "500 nghìn bước thay vì 1 triệu bước", "Bằng nhau về số bước" }, 0, "log2(1.000.000) xấp xỉ 20, trong khi O(N) cần đúng 1 triệu bước.");
                q.AddQuestion("Một hàm sắp xếp mảng bằng thuật toán O(N log N) rồi duyệt mảng một lần O(N), độ phức tạp tổng là gì?", new[] { "O(N)", "O(N log N)", "O(N²)", "O(N + log N)" }, 1, "Tổng là O(N log N + N); giữ bậc cao nhất nên kết quả là O(N log N).");
                q.AddQuestion("Một thuật toán tạo thêm mảng mới có N phần tử để lưu kết quả, độ phức tạp không gian là bao nhiêu?", new[] { "O(1)", "O(log N)", "O(N)", "O(N²)" }, 2, "Bộ nhớ phụ tỉ lệ thuận với N vì cần lưu N phần tử kết quả.");
                q.AddQuestion("Với N = 1000, thuật toán O(N²) thực hiện khoảng bao nhiêu phép toán?", new[] { "1.000", "10.000", "100.000", "1.000.000" }, 3, "1000 x 1000 = 1.000.000 phép toán, đúng định nghĩa độ phức tạp bậc hai.");
                q.AddQuestion("Tìm số 12 trong mảng đã sắp xếp [2, 5, 8, 12, 20] bằng tìm kiếm nhị phân: cần bao nhiêu lần so sánh?", new[] { "1", "2", "3", "4" }, 1, "Lần 1 so phần tử giữa là 8 (nhỏ hơn 12 nên loại nửa trái); lần 2 so phần tử giữa mới là 12, tìm thấy — tổng cộng 2 lần so sánh.");
                q.AddQuestion("Đoạn code for (let i = 0; i < N; i += 2) chạy N/2 lần có độ phức tạp là gì?", new[] { "O(N/2)", "O(N)", "O(log N)", "O(N²)" }, 1, "Hằng số 1/2 bị bỏ đi trong Big O, nên N/2 vẫn quy về O(N).");
            });
            var qL02 = await GetOrCreate("Trắc nghiệm Mảng cơ bản", "Kiểm tra kiến thức: Trắc nghiệm Mảng cơ bản", "dsa", 1, 40, q =>
            {
                q.AddQuestion("Truy cập phần tử theo chỉ số arr[i] của mảng có độ phức tạp là bao nhiêu?", new[] { "O(1)", "O(log N)", "O(N)", "O(N²)" }, 0, "Địa chỉ ô nhớ tính trực tiếp từ chỉ số bằng phép toán cộng nên thời gian không đổi.");
                q.AddQuestion("Chèn một phần tử vào giữa mảng có N phần tử tốn bao nhiêu thời gian?", new[] { "O(1)", "O(log N)", "O(N)", "O(N²)" }, 2, "Tất cả phần tử phía sau vị trí chèn phải dịch chuyển một ô, trung bình N/2 lần nên là O(N).");
                q.AddQuestion("Khi dynamic array đầy, điều gì xảy ra khi thêm phần tử mới?", new[] { "Báo lỗi và từ chối thêm phần tử", "Cấp phát vùng nhớ lớn hơn (thường gấp đôi) rồi copy dữ liệu cũ sang", "Xóa phần tử cũ nhất để có chỗ", "Tự động giảm kích thước mảng" }, 1, "Dynamic array tăng trưởng bằng cách cấp phát mảng mới lớn hơn và copy dữ liệu, chi phí này được chia đều cho các lần thêm sau.");
                q.AddQuestion("Tìm giá trị lớn nhất trong mảng bằng cách duyệt hết các phần tử có độ phức tạp là bao nhiêu?", new[] { "O(1)", "O(log N)", "O(N)", "O(N log N)" }, 2, "Mỗi phần tử phải được xét ít nhất một lần để so sánh nên thời gian tuyến tính O(N).");
                q.AddQuestion("Xoay mảng [1, 2, 3, 4, 5] sang phải 2 bước, kết quả là gì?", new[] { "[2, 3, 4, 5, 1]", "[5, 4, 3, 2, 1]", "[4, 5, 1, 2, 3]", "[1, 2, 3, 5, 4]" }, 2, "Hai phần tử cuối (4, 5) được chuyển lên đầu, phần còn lại dời về sau nên kết quả là [4, 5, 1, 2, 3].");
                q.AddQuestion("Dùng cấu trúc hash (Set/Map) để kiểm tra một phần tử đã tồn tại giúp giảm độ phức tạp như thế nào so với duyệt mảng?", new[] { "Từ O(N) xuống O(1) trung bình", "Từ O(N²) xuống O(N)", "Từ O(1) lên O(N)", "Không thay đổi độ phức tạp" }, 0, "Tìm kiếm trong hash có độ phức tạp O(1) trung bình, nhanh hơn hẳn duyệt tuyến tính O(N).");
                q.AddQuestion("Sắp xếp mảng (O(N log N)) trước rồi duyệt một lần (O(N)) để xử lý, độ phức tạp tổng là gì?", new[] { "O(N)", "O(N log N)", "O(N²)", "O(N + log N)" }, 1, "Bậc cao nhất trong tổng O(N log N + N) là O(N log N).");
                q.AddQuestion("Xóa phần tử trùng trong mảng đã sắp xếp [1, 1, 2, 2, 3] bằng kỹ thuật hai con trỏ slow/fast, độ dài mảng hợp lệ còn lại là bao nhiêu?", new[] { "2", "3", "4", "5" }, 1, "Các giá trị duy nhất là 1, 2, 3 nên slow dừng ở chỉ số 2, độ dài hợp lệ là slow + 1 = 3.");
                q.AddQuestion("Thêm lần lượt N phần tử vào dynamic array (mỗi lần đầy lại gấp đôi vùng nhớ), tổng chi phí trung bình cho toàn bộ quá trình là bao nhiêu?", new[] { "O(N²)", "O(N log N)", "O(N)", "O(1)" }, 2, "Tổng chi phí copy là 1 + 2 + 4 + ... + N xấp xỉ 2N, nên thêm N phần tử chỉ tốn O(N) theo phân tích amortized.");
                q.AddQuestion("Gộp hai mảng đã sắp xếp [1, 3, 5] và mảng rỗng [], kết quả đúng là gì?", new[] { "[1, 3, 5]", "[]", "[5, 3, 1]", "Báo lỗi vì mảng rỗng" }, 0, "Vòng lặp gộp chỉ chạy trên mảng có dữ liệu, mảng rỗng được nối nguyên vẹn nên kết quả là [1, 3, 5].");
            });
            var qL03 = await GetOrCreate("Trắc nghiệm Chuỗi cơ bản", "Kiểm tra kiến thức: Trắc nghiệm Chuỗi cơ bản", "dsa", 1, 40, q =>
            {
                q.AddQuestion("Đặc điểm quan trọng nhất của chuỗi (string) trong hầu hết ngôn ngữ lập trình là gì?", new[] { "Có thể thay đổi trực tiếp từng ký tự", "Bất biến (immutable) — mỗi thao tác thay đổi tạo chuỗi mới", "Luôn lưu trữ trong vùng nhớ Stack", "Không thể so sánh bằng nhau" }, 1, "Chuỗi là bất biến: phép nối hay thay ký tự đều tạo đối tượng chuỗi mới, chuỗi cũ không bị sửa.");
                q.AddQuestion("Nối chuỗi N lần bằng phép += bên trong vòng lặp có độ phức tạp là bao nhiêu?", new[] { "O(N)", "O(N log N)", "O(N²)", "O(1)" }, 2, "Mỗi lần nối copy toàn bộ chuỗi hiện tại: 1 + 2 + ... + N lần copy, tổng cộng là O(N²).");
                q.AddQuestion("Chuỗi palindrome là gì?", new[] { "Chuỗi chỉ gồm các chữ cái in hoa", "Chuỗi đọc xuôi và đọc ngược giống hệt nhau", "Chuỗi có độ dài chẵn", "Chuỗi không chứa khoảng trắng" }, 1, "Palindrome đối xứng: đọc từ trái sang phải hay từ phải sang trái đều cho kết quả giống nhau.");
                q.AddQuestion("Hai chuỗi được gọi là anagram của nhau khi nào?", new[] { "Có độ dài bằng nhau bất kể nội dung", "Cùng bắt đầu bằng một ký tự", "Có cùng tập ký tự với cùng tần suất xuất hiện", "Có chứa các ký tự in hoa" }, 2, "Anagram đòi hỏi tần suất mỗi ký tự của hai chuỗi giống hệt nhau, chỉ khác thứ tự sắp xếp.");
                q.AddQuestion("Chuỗi nào sau đây là palindrome?", new[] { "hello", "racecar", "world", "visual" }, 1, "racecar đọc ngược vẫn là racecar, các phương án còn lại không đối xứng.");
                q.AddQuestion("Chuỗi listen và silent có phải là anagram của nhau không?", new[] { "Có, vì chúng có cùng tần suất ký tự", "Không, vì độ dài khác nhau", "Không, vì ký tự đầu khác nhau", "Chỉ đúng khi viết hoa toàn bộ" }, 0, "Cả hai đều có 1 chữ l, 1 chữ i, 1 chữ s, 1 chữ t, 1 chữ e, 1 chữ n nên bảng đếm tần suất giống hệt nhau.");
                q.AddQuestion("Trước khi so sánh hai chuỗi nhập từ người dùng, ta nên normalize bằng cách nào?", new[] { "Chỉ xóa khoảng trắng ở giữa chuỗi", "Chuyển về cùng kiểu chữ (thường hoặc hoa) và cắt khoảng trắng thừa", "Thêm ký tự đặc biệt vào cuối chuỗi", "Không cần làm gì, so sánh trực tiếp" }, 1, "Normalize (lowercase + trim) giúp Hello và hello trở nên tương đương, tránh sai sót do chữ hoa chữ thường hoặc khoảng trắng.");
                q.AddQuestion("Đảo ngược chuỗi abcde bằng hai con trỏ, sau lần hoán đổi đầu tiên chuỗi trở thành gì?", new[] { "edcba", "ebcda", "aecdb", "abced" }, 1, "Hai con trỏ đổi vị trí ký tự đầu a với ký tự cuối e, phần giữa bcd giữ nguyên nên chuỗi thành ebcda.");
                q.AddQuestion("Đếm tần suất ký tự của chuỗi aabbbcc, ký tự nào xuất hiện nhiều nhất và bao nhiêu lần?", new[] { "a với 2 lần", "b với 3 lần", "c với 2 lần", "Tất cả xuất hiện bằng nhau" }, 1, "a xuất hiện 2 lần, b xuất hiện 3 lần, c xuất hiện 2 lần nên b là ký tự xuất hiện nhiều nhất.");
                q.AddQuestion("Sau khi bỏ khoảng trắng và viết thường, chuỗi A man a plan a canal Panama có phải palindrome không?", new[] { "Có, chuỗi sau normalize đối xứng hoàn toàn", "Không, vì có chứa ký tự in hoa", "Không, vì độ dài là số chẵn", "Không, vì có chứa khoảng trắng" }, 0, "Sau normalize được amanaplanacanalpanama, đọc ngược vẫn giống hệt nên đây là palindrome.");
            });
            var qL04 = await GetOrCreate("Trắc nghiệm Hash Table & Set", "Kiểm tra kiến thức: Trắc nghiệm Hash Table & Set", "dsa", 1, 40, q =>
            {
                q.AddQuestion("Hàm băm (hash function) trong Hash Table có nhiệm vụ chính là gì?", new[] { "Biến một Key bất kỳ thành chỉ số mảng hợp lệ", "Sắp xếp các Key theo thứ tự tăng dần", "Nén dữ liệu để tiết kiệm bộ nhớ", "Mã hóa Key để bảo mật" }, 0, "Hàm băm tính index = hash(key) % capacity, giúp tìm vị trí lưu trữ và tra cứu trong O(1).");
                q.AddQuestion("Va chạm (collision) trong bảng băm xảy ra khi nào?", new[] { "Hai Value trùng nhau trong bảng", "Hai Key khác nhau băm ra cùng một chỉ số", "Bảng băm hết bộ nhớ RAM", "Một Key bị xóa khỏi bảng" }, 1, "Số Key có thể nhiều hơn dung lượng mảng, nên hai Key khác nhau có thể trùng chỉ số băm — gọi là va chạm.");
                q.AddQuestion("Phương pháp chaining (móc xích) giải quyết va chạm bằng cách nào?", new[] { "Mỗi ô của mảng chứa một danh sách liên kết các Key trùng chỉ số", "Tăng gấp đôi kích thước mảng ngay khi có va chạm", "Tìm ô trống kế tiếp theo một quy tắc dò xác định", "Lưu Key va chạm vào một mảng riêng biệt" }, 0, "Chaining đặt các Key va chạm vào cùng một bucket là danh sách liên kết; việc dò ô trống kế tiếp thuộc về open addressing.");
                q.AddQuestion("Sự khác biệt cốt lõi giữa Map (Dictionary) và Set (HashSet) là gì?", new[] { "Map chỉ lưu Value, Set chỉ lưu Key", "Map lưu cặp Key–Value, Set chỉ lưu Key", "Map sắp xếp dữ liệu, Set không sắp xếp", "Map nhanh hơn Set trong mọi thao tác" }, 1, "Map ánh xạ mỗi Key sang một Value; Set chỉ ghi nhận sự tồn tại của Key, thường dùng để khử trùng lặp.");
                q.AddQuestion("Trường hợp nào KHÔNG phù hợp để dùng Hash Table?", new[] { "Cần duyệt dữ liệu theo thứ tự tăng dần", "Cần tra cứu Key nhanh trong hàng triệu bản ghi", "Cần khử trùng lặp dữ liệu", "Cần đếm tần suất xuất hiện" }, 0, "Bảng băm không duy trì thứ tự; khi cần thứ tự hãy dùng mảng hoặc cây tìm kiếm (SortedDictionary).");
                q.AddQuestion("Tại sao các bảng băm thường chọn ngưỡng load factor khoảng 0,75?", new[] { "Để bảng không bao giờ xảy ra va chạm", "Cân bằng giữa chi phí bộ nhớ và tốc độ tra cứu", "Vì mảng chỉ hoạt động được khi đầy 75%", "Để tăng tốc độ của hàm băm" }, 1, "Load factor thấp giảm số lần dò nhưng lãng phí RAM; 0,75 là điểm cân bằng phổ biến, được C# Dictionary sử dụng.");
                q.AddQuestion("Điều gì xảy ra khi dùng một Key có giá trị thay đổi sau khi đã chèn vào Map?", new[] { "Tra cứu Key đó có thể không tìm thấy vì hash code đã đổi", "Giá trị cũ tự động được cập nhật theo", "Map tự động sắp xếp lại toàn bộ bảng", "Map ném lỗi ngay tại thời điểm chèn" }, 0, "Chỉ số ô phụ thuộc hash code tại lúc chèn; Key bị thay đổi làm hash code mới trỏ sai chỗ, gây thất bại tra cứu.");
                q.AddQuestion("Bảng băm dung lượng 10 đang chứa 8 phần tử. Load factor hiện tại là bao nhiêu và hệ thống nên làm gì?", new[] { "α = 1,25 — bảng đã đầy, cần xóa bớt", "α = 8 — cần rehash ngay", "α = 0,8 — nên sẵn sàng rehash để giảm va chạm", "α = 0,8 — không cần làm gì thêm" }, 2, "α = 8 / 10 = 0,8, vượt ngưỡng 0,75 nên bảng nên rehash để duy trì hiệu năng tra cứu.");
                q.AddQuestion("Bảng băm dung lượng 5 chứa các Key có giá trị hash lần lượt là 3, 8, 13. Khi rehash lên dung lượng 10, các Key này rơi vào những chỉ số nào?", new[] { "0, 3, 8", "3, 8, 13", "3, 3, 3", "3, 8, 3" }, 3, "Chỉ số mới = hash % 10: 3 % 10 = 3, 8 % 10 = 8, 13 % 10 = 3 — Key 3 và 13 vẫn va chạm nhưng Key 8 được tách ra.");
                q.AddQuestion("Trường hợp xấu nhất nào khiến thao tác tra cứu của bảng băm suy biến thành O(N)?", new[] { "Toàn bộ Key băm trúng cùng một ô, biến bucket thành danh sách dài", "Bảng có dung lượng quá lớn so với số phần tử", "Key là chuỗi ký tự rất dài", "Hàm băm chạy chậm hơn phép so sánh chuỗi" }, 0, "Nếu mọi Key rơi vào một bucket, chaining trở thành danh sách dài N phần tử và tra cứu phải duyệt O(N).");
            });
            var qL05 = await GetOrCreate("Trắc nghiệm Linked List", "Kiểm tra kiến thức: Trắc nghiệm Linked List", "dsa", 1, 40, q =>
            {
                q.AddQuestion("Một Node trong danh sách liên kết đơn (singly) chứa những phần thông tin gì?", new[] { "Dữ liệu và con trỏ trỏ tới Node tiếp theo", "Dữ liệu và chỉ số của Node trong mảng", "Hai con trỏ trỏ tới Node trước và Node sau", "Dữ liệu và kích thước của danh sách" }, 0, "Node singly gồm data và Next; Node doubly mới có thêm con trỏ Prev.");
                q.AddQuestion("Truy cập phần tử thứ i trong danh sách liên kết đơn có độ phức tạp là bao nhiêu?", new[] { "O(1) — dùng chỉ số như mảng", "O(N) — phải duyệt từ Head theo từng con trỏ", "O(log N) — chia đôi danh sách", "O(N²) — duyệt lồng nhau" }, 1, "Danh sách không có truy cập ngẫu nhiên; phải đi lần lượt theo các con trỏ Next từ Head nên tốn O(N).");
                q.AddQuestion("Thêm một Node vào đầu danh sách liên kết đơn gồm những thao tác nào?", new[] { "Tạo Node mới, trỏ Next của nó vào Head cũ, cập nhật Head", "Dịch chuyển toàn bộ danh sách sang phải một ô", "Duyệt tới cuối danh sách rồi nối Node mới", "Xóa Head cũ rồi thay bằng Node mới" }, 0, "Chỉ nối lại con trỏ nên tốn O(1), không cần dịch chuyển phần tử như mảng.");
                q.AddQuestion("Điểm khác biệt chính giữa danh sách liên kết đôi (doubly) và đơn (singly) là gì?", new[] { "Doubly chỉ chứa dữ liệu, không có con trỏ", "Doubly có thêm con trỏ Prev cho phép duyệt hai chiều", "Doubly được lưu trong bộ nhớ liền kề", "Doubly không thể xóa phần tử" }, 1, "Con trỏ Prev giúp quay lại phía trước và xóa Node đã biết trong O(1) không cần tìm Node trước đó.");
                q.AddQuestion("Với danh sách chỉ giữ con trỏ Head (không có Tail), chèn vào cuối tốn bao nhiêu thời gian?", new[] { "O(1) — chèn trực tiếp", "O(log N) — tìm kiếm nhị phân", "O(N) — phải duyệt tới Node cuối", "O(1) nhưng chỉ khi danh sách rỗng" }, 2, "Muốn tìm Node cuối phải đi từ Head tới khi gặp Next = null; nếu giữ thêm Tail thì mới là O(1).");
                q.AddQuestion("Kỹ thuật dummy head (head giả) trong Linked List dùng để làm gì?", new[] { "Tránh xử lý riêng trường hợp head rỗng, giúp code chèn xóa thống nhất", "Tăng tốc độ duyệt danh sách", "Giảm bộ nhớ tiêu tốn cho mỗi Node", "Làm cho danh sách trở thành vòng tròn" }, 0, "Node giả luôn tồn tại nên thao tác trên Node đầu tiên giống hệt các Node khác, giảm rẽ nhánh code.");
                q.AddQuestion("Để xóa một Node đã biết vị trí khỏi danh sách đơn, ta cần có thêm điều gì?", new[] { "Con trỏ tới Head của danh sách", "Con trỏ tới Node ngay trước Node cần xóa", "Con trỏ tới Node cuối cùng", "Chỉ cần chính Node cần xóa" }, 1, "Singly không có Prev nên phải tìm Node trước đó để nối Next của nó sang Node kế sau; doubly xóa trực tiếp O(1).");
                q.AddQuestion("Trong thuật toán Floyd, vì sao hai con trỏ slow và fast chắc chắn gặp nhau khi danh sách có chu trình (cycle)?", new[] { "Fast nhanh hơn slow đúng một bước mỗi vòng nên khoảng cách giảm dần đều về 0", "Vì fast luôn đi chậm hơn slow", "Vì chu trình không tồn tại trong thực tế", "Vì slow dừng lại ở điểm bắt đầu chu trình" }, 0, "Trong vòng lặp, fast thu hẹp khoảng cách với slow mỗi bước một đơn vị nên chúng buộc phải gặp nhau trong cycle.");
                q.AddQuestion("Danh sách 1 → 2 → 3 → 4 → 5 → 6 được duyệt bằng kỹ thuật fast and slow. Khi fast dừng lại (chạm null), slow đang đứng ở Node nào?", new[] { "Node 3", "Node 4", "Node 6", "Node 2" }, 1, "fast đi 2 bước, slow đi 1 bước: sau 3 vòng fast = null và slow = 4 — vị trí middle thứ hai của danh sách 6 phần tử.");
                q.AddQuestion("Khi đảo ngược danh sách bằng ba con trỏ, vì sao phải lưu next trước khi gán curr.next = prev?", new[] { "Phép gán phá hủy liên kết tới phần còn lại, không lưu trước sẽ mất cả danh sách phía sau", "Vì con trỏ next thay đổi giá trị mỗi vòng lặp", "Vì cần so sánh next với prev", "Vì next là con trỏ duy nhất tới Head" }, 0, "curr.next = prev cắt đứt đường tới Node kế tiếp; nếu không giữ lại trong biến next từ trước, vòng lặp không thể tiến tiếp.");
            });
            var qL06 = await GetOrCreate("Trắc nghiệm Stack", "Kiểm tra kiến thức: Trắc nghiệm Stack", "dsa", 1, 40, q =>
            {
                q.AddQuestion("Stack hoạt động theo nguyên tắc nào?", new[] { "LIFO — phần tử vào sau được lấy ra trước", "FIFO — phần tử vào trước được lấy ra trước", "Truy cập ngẫu nhiên theo chỉ số O(1)", "Sắp xếp phần tử theo giá trị khi push" }, 0, "Phần tử push sau cùng luôn là phần tử pop đầu tiên; FIFO là đặc trưng của Queue.");
                q.AddQuestion("Thao tác peek trên stack có tác dụng gì?", new[] { "Xóa phần tử ở đáy stack", "Xem phần tử ở đỉnh mà không xóa nó", "Đếm số phần tử đang có", "Thêm phần tử vào đáy stack" }, 1, "Peek chỉ đọc phần tử đỉnh, stack không thay đổi; pop mới vừa lấy vừa xóa.");
                q.AddQuestion("Độ phức tạp thời gian của các thao tác push, pop, peek trên stack là bao nhiêu?", new[] { "O(1) cho cả ba thao tác", "O(N) cho cả ba thao tác", "O(log N) cho cả ba thao tác", "Push O(N), pop O(1)" }, 0, "Mọi thao tác chỉ tác động lên đỉnh stack nên đều mất thời gian hằng số O(1).");
                q.AddQuestion("Điều gì xảy ra khi gọi pop hoặc peek trên một stack rỗng?", new[] { "Trả về null một cách an toàn", "Xảy ra lỗi underflow — thao tác bất hợp lệ", "Stack tự động tạo một phần tử rỗng mới", "Trả về phần tử được push đầu tiên" }, 1, "Không tồn tại phần tử đỉnh để lấy; cần kiểm tra độ rỗng trước khi pop hoặc peek.");
                q.AddQuestion("Thuật toán kiểm tra chuỗi ngoặc hợp lệ dùng stack theo cách nào?", new[] { "Push ngoặc mở, gặp ngoặc đóng thì pop và so khớp, kết thúc stack phải rỗng", "Pop mọi ký tự rồi đếm số lần xuất hiện", "Push toàn bộ ký tự rồi duyệt ngược lại", "Dùng stack chỉ để lưu số lượng ngoặc" }, 0, "Ngoặc mở gần nhất phải khớp với ngoặc đóng gần nhất — đúng bản chất LIFO; sót ngoặc mở cuối chuỗi là sai.");
                q.AddQuestion("Vì sao đệ quy sâu gây lỗi StackOverflow trong khi vòng lặp while lên tới hàng tỷ lần vẫn chạy được?", new[] { "Vì vòng lặp sử dụng nhiều bộ nhớ hơn đệ quy", "Vì mỗi lần gọi hàm đẩy một stack frame vào call stack có kích thước giới hạn", "Vì đệ quy chạy chậm hơn vòng lặp rất nhiều", "Vì hàm đệ quy không bao giờ trả về kết quả" }, 1, "Call stack của mỗi thread rất nhỏ (khoảng vài MB); đệ quy không dừng đẩy hàng triệu frame đến khi tràn, còn vòng lặp chỉ dùng vài biến cố định.");
                q.AddQuestion("Để cài đặt chức năng undo/redo trong trình soạn thảo, cấu trúc hợp lý nhất là gì?", new[] { "Hai stack: một lưu hành động đã làm (undo), một lưu hành động đã hoàn tác (redo)", "Một mảng đánh dấu thứ tự hành động", "Một queue duy nhất cho cả hai chiều", "Hai con trỏ trỏ vào đầu một mảng" }, 0, "Undo pop stack hành động; hành động vừa pop được push sang stack redo, đảo ngược hoàn toàn quá trình.");
                q.AddQuestion("Thực hiện liên tiếp: push 1, push 2, push 3, pop, pop, push 4, push 5. Phần tử ở đỉnh stack cuối cùng là gì?", new[] { "5", "4", "2", "3" }, 0, "Hai lần pop loại 3 rồi 2; stack còn [1], push 4 → [1, 4], push 5 → [1, 4, 5], phần tử đỉnh là 5.");
                q.AddQuestion("Cho mảng [4, 5, 2, 25]. Dùng monotonic stack, mảng Next Greater Element tương ứng là gì?", new[] { "[25, 25, 25, -1]", "[5, 2, 25, -1]", "[5, 25, 25, -1]", "[-1, -1, -1, -1]" }, 2, "4 có 5 bên phải; 5 có 25; 2 có 25; 25 không có phần tử lớn hơn bên phải nên là -1.");
                q.AddQuestion("Cho histogram với các cột cao lần lượt [2, 1, 5, 6, 2, 3]. Hình chữ nhật lớn nhất có thể vẽ được có diện tích bao nhiêu?", new[] { "12", "6", "16", "10" }, 3, "Cặp cột cao 5 và 6 kề nhau cho hình chữ nhật 2 × 5 = 10, lớn nhất trong mọi khả năng mở rộng.");
            });
            var qL07 = await GetOrCreate("Trắc nghiệm Queue & Deque", "Kiểm tra kiến thức: Trắc nghiệm Queue & Deque", "dsa", 1, 40, q =>
            {
                q.AddQuestion("Queue tuân theo nguyên tắc nào khi xử lý phần tử?", new[] { "LIFO — vào sau ra trước", "FIFO — vào trước ra trước", "Truy cập ngẫu nhiên theo chỉ số", "LIFO — vào trước ra sau" }, 1, "Queue hoạt động theo FIFO (First-In, First-Out): phần tử thêm vào trước sẽ được lấy ra trước, giống như xếp hàng mua vé.");
                q.AddQuestion("Độ phức tạp thời gian của thao tác enqueue và dequeue trên Queue chuẩn là bao nhiêu?", new[] { "O(1)", "O(log N)", "O(N)", "O(N²)" }, 0, "Cả enqueue (thêm vào đuôi) và dequeue (lấy ra từ đầu) chỉ dịch chuyển con trỏ Front/Rear nên mỗi thao tác tốn O(1).");
                q.AddQuestion("Phép toán nào giúp Circular Queue quay vòng con trỏ từ ô cuối mảng về ô đầu?", new[] { "Phép trừ index - 1", "Phép modulo (index + 1) % capacity", "Phép chia integer index / capacity", "Nhân đôi kích thước mảng" }, 1, "Công thức (index + 1) % capacity khiến con trỏ vượt qua ô cuối sẽ quay về ô 0, biến mảng thẳng thành mảng vòng.");
                q.AddQuestion("Điểm khác biệt cốt lõi giữa Deque và Queue thông thường là gì?", new[] { "Deque chỉ cho phép thêm vào đầu", "Deque cho phép thêm và xóa phần tử ở cả hai đầu", "Deque lưu phần tử theo thứ tự ngẫu nhiên", "Deque chỉ dành cho số nguyên" }, 1, "Deque (Double-ended Queue) hỗ trợ đủ bốn thao tác AddFirst, AddLast, RemoveFirst, RemoveLast với độ phức tạp O(1).");
                q.AddQuestion("Cấu trúc dữ liệu nào là trái tim của thuật toán duyệt theo chiều rộng BFS?", new[] { "Stack", "Queue", "Hash Table", "Binary Heap" }, 1, "BFS duyệt theo từng tầng và đỉnh nào được tìm thấy trước phải được duyệt trước — đúng bản chất FIFO của Queue.");
                q.AddQuestion("Khi cài đặt Queue bằng mảng thông thường, thao tác dequeue tốn bao nhiêu thời gian?", new[] { "O(1)", "O(N) — phải dời toàn bộ phần tử phía sau lên trước", "O(log N)", "O(N²)" }, 1, "Xóa phần tử đầu mảng buộc phải dời tất cả phần tử còn lại sang trái một ô nên mất O(N), khác với Circular Queue hay Linked List.");
                q.AddQuestion("Điểm khác nhau quan trọng giữa Priority Queue và Queue thường là gì?", new[] { "Priority Queue không cho xóa phần tử", "Phần tử ra trước là phần tử có độ ưu tiên cao nhất, không phải phần tử đến sớm nhất", "Priority Queue chỉ lưu được số nguyên", "Priority Queue duyệt theo LIFO" }, 1, "Priority Queue chọn phần tử theo độ ưu tiên thay vì thứ tự đến, thường được cài bằng Heap nên mỗi thao tác tốn O(log N).");
                q.AddQuestion("Circular Queue có capacity 4. Thực hiện enqueue 10, 20, 30 rồi dequeue một lần, sau đó enqueue 40 và 50. Giá trị nằm ở ô chỉ số 0 của mảng là bao nhiêu?", new[] { "10", "20", "40", "50" }, 3, "Sau enqueue 10, 20, 30 thì front = 0, rear = 2. Dequeue lấy 10, front = 1. Enqueue 40 ghi vào rear = 3. Enqueue 50: rear = (3 + 1) % 4 = 0 nên 50 quay vòng ghi vào ô 0.");
                q.AddQuestion("Cho mảng [1, 3, -1, -3, 5, 3, 6, 7] và cửa sổ kích thước k = 3. Dùng Deque tìm giá trị lớn nhất của từng cửa sổ, kết quả là gì?", new[] { "[3, 3, 5, 5, 6, 7]", "[1, 3, 5, 5, 6, 7]", "[3, 5, 5, 6, 7, 7]", "[3, -1, 5, 5, 6, 7]" }, 0, "Các cửa sổ lần lượt là [1,3,-1], [3,-1,-3], [-1,-3,5], [-3,5,3], [5,3,6], [3,6,7] với max tương ứng là 3, 3, 5, 5, 6, 7.");
                q.AddQuestion("Khi implement Queue bằng hai Stack, thời điểm nào phải chuyển toàn bộ dữ liệu từ stackIn sang stackOut?", new[] { "Mỗi lần enqueue", "Khi stackOut rỗng và có thao tác dequeue", "Khi stackIn đầy", "Khi queue có hơn hai phần tử" }, 1, "Khi dequeue mà stackOut rỗng, ta đổ toàn bộ stackIn sang stackOut làm đảo ngược thứ tự, phần tử lâu đời nhất nằm trên đỉnh để pop. Mỗi phần tử bị chuyển đúng một lần nên chi phí amortized là O(1).");
            });
            var qL08 = await GetOrCreate("Trắc nghiệm Đệ quy", "Kiểm tra kiến thức: Trắc nghiệm Đệ quy", "dsa", 1, 40, q =>
            {
                q.AddQuestion("Đệ quy là gì?", new[] { "Vòng lặp chạy vô hạn", "Hàm gọi chính nó để giải bài toán con nhỏ hơn", "Hàm chỉ gọi các hàm khác", "Cách lưu dữ liệu vào mảng" }, 1, "Đệ quy là kỹ thuật hàm tự gọi chính nó với đầu vào nhỏ hơn cho tới khi chạm điều kiện dừng.");
                q.AddQuestion("Base case (điều kiện dừng) trong hàm đệ quy có vai trò gì?", new[] { "Tăng tốc vòng lặp", "Chặn lời gọi tiếp theo và trả về kết quả trực tiếp", "Khởi tạo biến toàn cục", "Xóa toàn bộ Call Stack" }, 1, "Base case là trường hợp không gọi lại chính nó, trả về kết quả ngay để chuỗi đệ quy dừng lại và bắt đầu tháo lùi.");
                q.AddQuestion("Cấu trúc dữ liệu nào quản lý thứ tự các lời gọi hàm khi chạy đệ quy?", new[] { "Queue", "Stack (Call Stack)", "Linked List", "Binary Tree" }, 1, "Mỗi lời gọi đẩy một stack frame lên Call Stack, và khi base case trả về các frame được bốc ra theo thứ tự LIFO.");
                q.AddQuestion("Giá trị của factorial(3) (3 giai thừa) là bao nhiêu?", new[] { "3", "6", "9", "12" }, 1, "factorial(3) = 3 × 2 × 1 = 6, theo công thức n × factorial(n − 1) với base case factorial(1) = 1.");
                q.AddQuestion("Điều gì xảy ra khi một hàm đệ quy không có điều kiện dừng hoặc base case không bao giờ chạm tới?", new[] { "Chương trình chạy nhanh hơn", "Ném lỗi StackOverflow vì Call Stack tràn bộ nhớ", "Kết quả trả về 0", "Hàm tự biến thành vòng lặp" }, 1, "Các lời gọi đẩy frame liên tục lên Call Stack có dung lượng giới hạn (khoảng 1–8 MB) nên nhanh chóng tràn và ném StackOverflowException.");
                q.AddQuestion("Độ phức tạp thời gian của hàm Fibonacci cài đặt naive (không ghi nhớ) là bao nhiêu?", new[] { "O(N)", "O(N log N)", "O(2^N)", "O(1)" }, 2, "Mỗi lời gọi lại rẽ hai nhánh và tính lặp đi lặp lại các giá trị giống nhau nên số lời gọi tăng theo hàm mũ, khoảng 2^N.");
                q.AddQuestion("Kỹ thuật memoization giúp Fibonacci cải thiện độ phức tạp như thế nào?", new[] { "Lưu kết quả đã tính vào bảng tra cứu, mỗi giá trị tính một lần nên còn O(N)", "Bỏ qua base case để tính nhanh hơn", "Tăng tốc bằng đa luồng", "Dùng Queue thay vì Stack" }, 0, "Memoization ghi nhớ kết quả của từng giá trị n, các lần gọi sau chỉ đọc lại nên tổng số phép tính giảm từ O(2^N) xuống O(N).");
                q.AddQuestion("Khi gọi factorial(5), hàm factorial được gọi tổng cộng bao nhiêu lần (tính cả lời gọi ban đầu)?", new[] { "4 lần", "5 lần", "6 lần", "10 lần" }, 1, "Chuỗi lời gọi là factorial(5), factorial(4), factorial(3), factorial(2), factorial(1) — tổng cộng 5 lần, tương ứng 5 stack frame.");
                q.AddQuestion("Duyệt cây nhị phân tìm kiếm theo thứ tự In-order (L - N - R) cho ra kết quả như thế nào?", new[] { "Các giá trị theo thứ tự tăng dần", "Các giá trị theo thứ tự giảm dần", "Giá trị gốc luôn đứng đầu", "Thứ tự xen kẽ ngẫu nhiên" }, 0, "In-order duyệt nhánh trái, rồi node hiện tại, rồi nhánh phải nên với BST kết quả luôn là dãy sắp xếp tăng dần.");
                q.AddQuestion("Với hàm fib(n) = fib(n - 1) + fib(n - 2), fib(0) = 0, fib(1) = 1, hàm fib được gọi tổng cộng bao nhiêu lần khi tính fib(3) theo cách naive?", new[] { "3 lần", "4 lần", "5 lần", "7 lần" }, 2, "fib(3) gọi fib(2) và fib(1); fib(2) gọi fib(1) và fib(0). Tổng cộng: fib(3), fib(2), fib(1), fib(0), fib(1) — đúng 5 lần gọi.");
            });
            var qL09 = await GetOrCreate("Trắc nghiệm Sắp xếp cơ bản", "Kiểm tra kiến thức: Trắc nghiệm Sắp xếp cơ bản", "sorting", 1, 40, q =>
            {
                q.AddQuestion("Bubble Sort so sánh những phần tử nào trong mỗi lượt duyệt?", new[] { "Các phần tử ngẫu nhiên trong mảng", "Từng cặp phần tử liền kề nhau", "Phần tử đầu và phần tử cuối mảng", "Mỗi phần tử với giá trị cố định" }, 1, "Bubble Sort duyệt từ đầu mảng, so sánh từng cặp kề nhau và đổi chỗ nếu chúng sai thứ tự.");
                q.AddQuestion("Mỗi bước của Selection Sort thực hiện thao tác gì?", new[] { "Đổi chỗ các cặp liền kề", "Tìm phần tử nhỏ nhất trong phần chưa sắp xếp rồi đưa về đầu phần đó", "Dịch toàn bộ mảng sang phải một ô", "Chèn phần tử vào giữa mảng" }, 1, "Selection Sort tìm min của vùng chưa sắp xếp và hoán đổi nó với phần tử đầu vùng đó.");
                q.AddQuestion("Insertion Sort mô phỏng hoạt động quen thuộc nào của con người?", new[] { "Xếp bài tây trên tay", "Đếm số phần tử trong mảng", "Chia bài cho người chơi", "Trộn hai bộ bài với nhau" }, 0, "Insertion Sort hoạt động như cách ta rút từng lá bài mới và chèn vào đúng vị trí giữa các lá đã xếp.");
                q.AddQuestion("Độ phức tạp thời gian trung bình của cả ba thuật toán Bubble, Selection, Insertion Sort là gì?", new[] { "O(N)", "O(N log N)", "O(N²)", "O(log N)" }, 2, "Cả ba đều dùng hai vòng lặp lồng nhau nên trung bình là O(N²).");
                q.AddQuestion("Thuật toán nào có trường hợp tốt nhất là O(N) nhờ dừng sớm khi mảng gần như đã sắp xếp?", new[] { "Selection Sort", "Bubble Sort có cờ swapped", "Cả Bubble Sort có cờ swapped và Insertion Sort", "Không thuật toán nào" }, 2, "Bubble Sort dùng cờ swapped dừng ngay khi không còn cặp nào đổi chỗ; Insertion Sort dừng vòng dịch chuyển ngay khi gặp phần tử đúng vị trí. Selection Sort luôn O(N²).");
                q.AddQuestion("Ưu điểm nổi bật nhất của Selection Sort so với Bubble Sort là gì?", new[] { "Chạy nhanh hơn trong trường hợp xấu nhất", "Số lần đổi chỗ chỉ tối đa N − 1", "Luôn ổn định hơn", "Không cần so sánh phần tử" }, 1, "Selection Sort mỗi bước chỉ đổi chỗ đúng một lần nên tổng số swap tối đa là N − 1, trong khi Bubble Sort có thể đổi chỗ O(N²) lần.");
                q.AddQuestion("Vì sao Insertion Sort thường được các thư viện chuẩn dùng cho mảng con nhỏ trong thuật toán lai?", new[] { "Vì nó chạy O(N log N) với mọi mảng", "Vì không tốn chi phí gọi đệ quy và thân thiện CPU cache với dữ liệu nhỏ", "Vì nó không cần bộ nhớ phụ", "Vì nó hoạt động tốt trên dữ liệu phân tán" }, 1, "Với mảng nhỏ, overhead đệ quy của Quick Sort lớn hơn lợi ích, còn Insertion Sort có code ngắn, truy cập tuần tự nên nhanh hơn trên thực tế.");
                q.AddQuestion("Sau lượt duyệt thứ nhất (pass 1) của Bubble Sort trên mảng [4, 2, 5, 1], kết quả mảng là gì?", new[] { "[2, 4, 1, 5]", "[1, 2, 4, 5]", "[2, 1, 4, 5]", "[2, 4, 5, 1]" }, 0, "Đổi 4 và 2 → [2, 4, 5, 1]; giữ 4 và 5; đổi 5 và 1 → [2, 4, 1, 5]. Số lớn nhất 5 về đúng vị trí cuối.");
                q.AddQuestion("Mô phỏng bước đầu tiên của Selection Sort trên mảng [29, 10, 14, 37, 13]: phần tử nhỏ nhất nằm ở đâu và kết quả sau khi đổi chỗ là gì?", new[] { "Min tại index 4, kết quả [29, 10, 14, 37, 13]", "Min tại index 1, kết quả [10, 29, 14, 37, 13]", "Min tại index 0, kết quả giữ nguyên", "Min tại index 2, kết quả [29, 10, 14, 37, 13]" }, 1, "Giá trị nhỏ nhất là 10 ở index 1, đổi chỗ với phần tử đầu index 0 → [10, 29, 14, 37, 13].");
                q.AddQuestion("Edge case: dùng Insertion Sort sắp xếp mảng [5, 4, 3, 2, 1] (đảo ngược hoàn toàn). Tổng số lần dịch chuyển phần tử sang phải là bao nhiêu?", new[] { "4", "5", "10", "15" }, 2, "Mỗi key ở vị trí i phải dịch cả i phần tử phía trước: 1 + 2 + 3 + 4 = 10. Đây là trường hợp xấu nhất O(N²) của Insertion Sort.");
            });
            var qL10 = await GetOrCreate("Trắc nghiệm Tìm kiếm Linear & Binary", "Kiểm tra kiến thức: Trắc nghiệm Tìm kiếm Linear & Binary", "searching", 1, 40, q =>
            {
                q.AddQuestion("Điều kiện tiên quyết để chạy được Linear Search trên một mảng là gì?", new[] { "Mảng đã sắp xếp tăng dần", "Mảng đã sắp xếp giảm dần", "Không có điều kiện nào về thứ tự", "Mảng không chứa số âm" }, 2, "Linear Search chỉ duyệt tuần tự nên hoạt động trên mọi mảng, dù đã sắp xếp hay chưa.");
                q.AddQuestion("Điều kiện tiên quyết để Binary Search cho kết quả đúng là gì?", new[] { "Mảng có ít hơn 100 phần tử", "Mảng đã được sắp xếp", "Mảng chỉ chứa số nguyên dương", "Mảng không trùng giá trị" }, 1, "Binary Search loại bỏ một nửa không gian tìm kiếm dựa trên so sánh, nên chỉ đúng khi mảng đã sắp xếp.");
                q.AddQuestion("Khi không tìm thấy target, Linear Search và Binary Search trả về giá trị nào theo quy ước?", new[] { "0", "null", "-1", "Độ dài mảng" }, 2, "Cả hai thuật toán đều trả về -1 để báo không tồn tại phần tử cần tìm.");
                q.AddQuestion("Độ phức tạp thời gian trung bình của Linear Search là gì?", new[] { "O(1)", "O(log N)", "O(N)", "O(N log N)" }, 2, "Trung bình phải duyệt N/2 phần tử, hằng số 1/2 bị bỏ qua nên là O(N).");
                q.AddQuestion("Độ phức tạp thời gian của Binary Search trong trường hợp xấu nhất là gì?", new[] { "O(1)", "O(log N)", "O(N)", "O(N²)" }, 1, "Mỗi bước chia đôi không gian tìm kiếm nên chỉ cần log2(N) bước, kể cả khi target không tồn tại.");
                q.AddQuestion("Tại sao nên tính mid = low + (high - low) / 2 thay vì mid = (low + high) / 2?", new[] { "Nhanh hơn về mặt CPU", "Tránh tràn số nguyên khi low + high vượt giới hạn kiểu dữ liệu", "Giúp làm tròn kết quả khác đi", "Tránh chia cho số 0" }, 1, "Khi low và high lớn, phép cộng có thể tràn thành số âm gây sai mid; phép trừ (high - low) không bao giờ tràn.");
                q.AddQuestion("Với mảng 1 triệu phần tử đã sắp xếp, Binary Search cần tối đa khoảng bao nhiêu phép so sánh?", new[] { "1 triệu", "100.000", "500.000", "Khoảng 20" }, 3, "log2(1.000.000) xấp xỉ 20, nên cần tối đa ~20 bước, trong khi Linear Search cần tới 1 triệu.");
                q.AddQuestion("Mô phỏng Binary Search tìm target = 9 trong mảng [1, 3, 5, 7, 9, 11]: theo thứ tự các mid bị duyệt là gì?", new[] { "mid = 3, sau đó mid = 5", "mid = 2, sau đó mid = 4", "mid = 1, sau đó mid = 3", "mid = 4, sau đó mid = 5" }, 1, "low=0, high=5 → mid=2 (giá trị 5, 5 < 9 nên low=3); low=3, high=5 → mid=4 (giá trị 9, khớp).");
                q.AddQuestion("Mô phỏng Binary Search tìm 23 trong mảng [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]: dãy low, mid, high qua các bước lần lượt là gì?", new[] { "mid = 4, 7, 6 rồi mid = 5", "mid = 5, 2, 1", "mid = 9, 4, 6", "mid = 4, 2, 5" }, 0, "Bước 1: mid=4 (16 < 23 → low=5). Bước 2: mid=7 (56 > 23 → high=6). Bước 3: mid=5 (23, khớp, trả về 5).");
                q.AddQuestion("Edge case: chạy Binary Search trên mảng chưa sắp xếp [10, 3, 7, 1, 9] tìm target = 7 sẽ cho kết quả gì?", new[] { "Luôn đúng vì Binary Search kiểm tra mọi phần tử", "Kết quả có thể sai mà không báo lỗi", "Ném ngoại lệ IndexOutOfRange", "Trả về vị trí của phần tử 10" }, 1, "Binary Search giả định dữ liệu có thứ tự nên vứt bỏ nửa mảng dựa trên giả định sai → trả về -1 hoặc chỉ số sai một cách âm thầm.");
            });
            var qL11 = await GetOrCreate("Trắc nghiệm Two Pointers", "Kiểm tra kiến thức: Trắc nghiệm Two Pointers", "searching", 1, 40, q =>
            {
                q.AddQuestion("Trong kỹ thuật Two Pointers, con trỏ thực chất là gì?", new[] { "Con trỏ bộ nhớ kiểu C/C++", "Hai biến số nguyên lưu chỉ số (index) của mảng", "Hai hàm đệ quy gọi lồng nhau", "Hai mảng phụ chứa kết quả trung gian" }, 1, "Con trỏ chỉ là hai biến int lưu vị trí phần tử trong mảng, không phải con trỏ bộ nhớ.");
                q.AddQuestion("Biến thể ngược chiều (opposite direction) thường được áp dụng khi nào?", new[] { "Khi mảng chưa được sắp xếp", "Khi mảng đã được sắp xếp tăng hoặc giảm dần", "Khi mảng chỉ có một phần tử", "Khi cần sử dụng thêm cấu trúc ngăn xếp" }, 1, "Con trỏ ngược chiều dựa vào tính thứ tự của mảng để quyết định dịch left hay right, nên yêu cầu mảng đã sắp xếp.");
                q.AddQuestion("Trong bài pair sum trên mảng tăng dần, nếu sum < target thì ta nên làm gì?", new[] { "Giảm right để tổng nhỏ lại", "Dừng thuật toán ngay lập tức", "Tăng left để tổng lớn hơn", "Không đổi gì, tiếp tục vòng lặp" }, 2, "Mảng tăng dần nên cách duy nhất để tăng tổng là dịch left sang phải, loại bỏ số nhỏ nhất hiện tại.");
                q.AddQuestion("Biến thể fast & slow thường được dùng để giải quyết nhóm bài toán nào?", new[] { "Tìm kiếm nhị phân trên mảng đã sắp xếp", "Xóa phần tử trùng lặp tại chỗ, di chuyển phần tử trong mảng", "Sắp xếp mảng theo chiều giảm dần", "Tính tổng tất cả phần tử của mảng" }, 1, "Fast dò tìm phần tử mới, slow chốt vị trí ghi đè để xử lý trực tiếp trên mảng cũ mà không tốn thêm bộ nhớ.");
                q.AddQuestion("Cho nums = [1, 1, 2, 3, 3]. Độ dài mảng hợp lệ sau khi xóa phần tử trùng bằng fast & slow là bao nhiêu?", new[] { "2", "3", "4", "5" }, 1, "Mảng hợp lệ là [1, 2, 3], độ dài bằng slow + 1 = 3.");
                q.AddQuestion("Khi kiểm tra palindrome bằng hai con trỏ, vòng lặp nên dừng khi nào?", new[] { "Khi left > right", "Khi left == right", "Khi left >= right", "Khi right bằng 0" }, 2, "Khi hai con trỏ gặp nhau hoặc vượt qua nhau thì mọi cặp đối xứng đã được kiểm tra, nên dừng tại left >= right.");
                q.AddQuestion("Độ phức tạp thời gian của thuật toán 3Sum dùng một vòng for kết hợp hai con trỏ là bao nhiêu?", new[] { "O(N)", "O(N log N)", "O(N²)", "O(N³)" }, 2, "Vòng for chọn phần tử đầu chạy N lần, bên trong hai con trỏ quét phần còn lại mất O(N), tổng là O(N²).");
                q.AddQuestion("Cho numbers = [11, 23, 29, 37, 41, 58, 62, 70] và target = 66. Kết quả cặp chỉ số trả về là gì?", new[] { "[1, 3]", "[2, 4]", "[0, 5]", "[3, 6]" }, 1, "Mô phỏng: 11+70=81 → right--, 11+62=73 → right--, 11+58=69 → right--, 11+41=52 → left++, 23+41=64 → left++, 29+41=70 → right--, 29+37=66 → trả về [2, 4].");
                q.AddQuestion("Cho mảng chiều cao [1, 8, 6, 2, 5, 4, 8, 3, 7]. Diện tích nước lớn nhất hai vạch chứa được là bao nhiêu?", new[] { "42", "49", "56", "64" }, 1, "Cặp tối ưu là vạch 8 (index 1) và vạch 7 (index 8): chiều cao giới hạn 7, khoảng cách 7, diện tích 7 × 7 = 49.");
                q.AddQuestion("Trong bài pair sum, vì sao vòng lặp dùng điều kiện while (left < right) mà không phải left <= right?", new[] { "Vì left không bao giờ nhỏ hơn right", "Vì left == right nghĩa là cộng một phần tử với chính nó, không phải hai số phân biệt", "Vì mảng có chỉ số bắt đầu từ 1", "Vì cần chừa lại phần tử giữa cho lần lặp sau" }, 1, "Điều kiện left < right bảo đảm hai con trỏ trỏ vào hai phần tử khác nhau, tránh dùng lặp một phần tử duy nhất.");
            });
            var qL12 = await GetOrCreate("Trắc nghiệm Sliding Window", "Kiểm tra kiến thức: Trắc nghiệm Sliding Window", "searching", 1, 40, q =>
            {
                q.AddQuestion("Kỹ thuật cửa sổ trượt được dùng cho nhóm bài toán nào?", new[] { "Mảng con hoặc chuỗi con liên tục thỏa mãn điều kiện", "Sắp xếp mảng theo chiều tăng dần", "Tìm kiếm một phần tử trong mảng đã sắp xếp", "Duyệt cây nhị phân theo chiều sâu" }, 0, "Cửa sổ trượt tối ưu các bài toán subarray/substring liên tục bằng cách tái sử dụng kết quả cũ.");
                q.AddQuestion("Khi trượt cửa sổ cố định kích thước k sang phải một ô, tổng mới được tính như thế nào?", new[] { "Cộng lại toàn bộ k phần tử từ đầu", "Lấy tổng cũ trừ phần tử rời khỏi cửa sổ rồi cộng phần tử mới vào", "Nhân đôi tổng cũ rồi chia hai", "Chỉ cộng thêm phần tử mới, không trừ gì" }, 1, "Công thức sum = sum - arr[i - k] + arr[i] chỉ mất hai phép tính, giúp giảm từ O(N × K) xuống O(N).");
                q.AddQuestion("Hai biến thể chính của cửa sổ trượt là gì?", new[] { "Cửa sổ trái và cửa sổ phải", "Cửa sổ cố định (fixed) và cửa sổ động (dynamic)", "Cửa sổ trên và cửa sổ dưới", "Cửa sổ chẵn và cửa sổ lẻ" }, 1, "Fixed window giữ kích thước K cố định, dynamic window cho kích thước cửa sổ thay đổi linh hoạt.");
                q.AddQuestion("Ý tưởng cốt lõi của kỹ thuật cửa sổ trượt là gì?", new[] { "Chia nhỏ mảng rồi sắp xếp từng phần", "Tái sử dụng kết quả đã tính thay vì tính lại từ đầu", "Lưu toàn bộ mảng vào bộ nhớ đệm", "Dùng đệ quy để duyệt mọi tổ hợp" }, 1, "Mỗi bước trượt chỉ thay đổi hai phần tử biên, phần lớn kết quả cũ được giữ nguyên để tái sử dụng.");
                q.AddQuestion("Cho arr = [2, 1, 5, 1, 3, 2] và k = 3. Tổng lớn nhất của ba phần tử liên tiếp là bao nhiêu?", new[] { "7", "8", "9", "10" }, 2, "Các cửa sổ lần lượt có tổng 8, 7, 9, 6; giá trị lớn nhất là 9 ứng với cửa sổ [5, 1, 3].");
                q.AddQuestion("Cho nums = [2, 1, 5, 2, 3, 2] và target = 7. Mảng con liên tiếp ngắn nhất có tổng lớn hơn hoặc bằng 7 dài bao nhiêu?", new[] { "1", "2", "3", "4" }, 1, "Cửa sổ [5, 2] có tổng 7, độ dài 2; không có cửa sổ nào dài 1 đạt tổng 7 nên kết quả là 2.");
                q.AddQuestion("Cho chuỗi s = abcabcbb. Chiều dài chuỗi con dài nhất không chứa ký tự lặp là bao nhiêu?", new[] { "2", "3", "4", "6" }, 1, "Chuỗi con hợp lệ dài nhất là abc (dài 3); khi right gặp ký tự lặp, left phải co lên để loại bỏ ký tự đó khỏi cửa sổ.");
                q.AddQuestion("Vì sao thuật toán cửa sổ động tìm mảng con có tổng lớn hơn hoặc bằng target không còn đúng khi mảng chứa số âm?", new[] { "Vì số âm làm mảng bị tràn chỉ số", "Vì vươn right thêm số âm có thể làm tổng giảm, phá vỡ logic co đuôi khi tổng đạt target", "Vì số âm làm chương trình chạy chậm hơn", "Vì số âm yêu cầu phải sắp xếp mảng trước" }, 1, "Thuật toán dựa vào tính đơn điệu: thêm số dương thì tổng tăng. Có số âm thì tổng có thể giảm khi vươn right, cần chuyển sang prefix sum kết hợp hash map.");
                q.AddQuestion("Cho arr = [1, 3, -1, -3, 5, 3, 6, 7] và k = 3. Mảng các giá trị lớn nhất của từng cửa sổ là gì?", new[] { "[3, 3, 5, 5, 6, 7]", "[3, -1, 5, 3, 6, 7]", "[1, 3, 5, 5, 6, 7]", "[3, 3, -1, 5, 6, 7]" }, 0, "Lần lượt: [1,3,-1]→3, [3,-1,-3]→3, [-1,-3,5]→5, [-3,5,3]→5, [5,3,6]→6, [3,6,7]→7.");
                q.AddQuestion("Công thức đúng để tính chiều dài của cửa sổ hiện tại trong cửa sổ động là gì?", new[] { "right - left", "right - left + 1", "right + left", "right - left - 1" }, 1, "Công thức right - left + 1 là bắt buộc để tránh lỗi off-by-one, ví dụ cửa sổ [left=1, right=3] gồm 3 phần tử.");
            });
            var qL13 = await GetOrCreate("Trắc nghiệm Binary Search nâng cao", "Kiểm tra kiến thức: Trắc nghiệm Binary Search nâng cao", "searching", 2, 40, q =>
            {
                q.AddQuestion("Lower bound của x trong mảng đã sắp xếp tăng dần được định nghĩa là gì?", new[] { "Chỉ số đầu tiên có giá trị bằng x", "Chỉ số đầu tiên có giá trị lớn hơn hoặc bằng x", "Chỉ số cuối cùng có giá trị nhỏ hơn x", "Vị trí chèn giữa hai phần tử bất kỳ" }, 1, "Lower bound trả về phần tử nhỏ nhất không nhỏ hơn x, tức chỉ số đầu tiên thỏa arr[i] >= x.");
                q.AddQuestion("Điều kiện bắt buộc để áp dụng binary search thông thường trên mảng là gì?", new[] { "Mảng chứa toàn số dương", "Mảng đã được sắp xếp", "Mảng không có phần tử trùng", "Độ dài mảng là lũy thừa của 2" }, 1, "Binary search loại bỏ một nửa không gian tìm kiếm dựa vào trật tự, nên mảng phải được sắp xếp.");
                q.AddQuestion("Công thức nào tính mid an toàn, tránh tràn số nguyên khi lo và hi rất lớn?", new[] { "mid = (lo + hi) / 2", "mid = lo + (hi - lo) / 2", "mid = hi - (lo + hi) / 2", "mid = lo / 2 + hi" }, 1, "Biểu thức lo + (hi - lo) / 2 không bao giờ tạo ra tổng lo + hi vượt giới hạn biểu diễn, nên an toàn tuyệt đối.");
                q.AddQuestion("Khi tìm chính xác một giá trị target, nên dùng template nào?", new[] { "while (lo < hi) với hi = mid", "while (lo < hi) với lo = mid", "while (lo <= hi) với hi = mid - 1", "while (lo <= hi) với lo = mid" }, 2, "Khi tìm chính xác, mid chắc chắn bị loại nên cả hai con trỏ đều cộng/trừ 1; điều kiện lo <= hi giúp duyệt cả phần tử cuối cùng.");
                q.AddQuestion("Cho arr = [1, 2, 4, 4, 4, 5, 7], lower bound của x = 4 là chỉ số nào?", new[] { "1", "2", "4", "5" }, 1, "arr[2] = 4 là vị trí đầu tiên thỏa điều kiện >= 4, nên lower bound bằng 2.");
                q.AddQuestion("Cho arr = [1, 2, 4, 4, 4, 5, 7], upper bound của x = 4 (chỉ số đầu tiên > 4) là bao nhiêu?", new[] { "3", "4", "5", "6" }, 2, "arr[5] = 5 là phần tử đầu tiên lớn hơn 4, nên upper bound bằng 5; khoảng chứa số 4 là [2..4].");
                q.AddQuestion("Mảng xoay nums = [4, 5, 6, 7, 0, 1, 2], tìm target = 0. Với mid = 3 (nums[mid] = 7, nums[hi] = 2), kết luận đúng là gì?", new[] { "Nửa trái [4, 5, 6, 7] đã sắp xếp, chuyển lo = mid + 1 vì 0 không thuộc đoạn này", "Nửa trái đã sắp xếp, chuyển hi = mid - 1", "Nửa phải [0, 1, 2] đã sắp xếp, chuyển lo = mid + 1", "Nửa phải đã sắp xếp, chuyển hi = mid - 1" }, 0, "Vì nums[mid] > nums[hi] nên đoạn lo..mid tăng dần; target = 0 nằm ngoài [4..7], nên bỏ nửa trái và gán lo = mid + 1.");
                q.AddQuestion("Koko ăn chuối: piles = [3, 6, 7, 11], H = 8 giờ. Tốc độ K (quả/giờ) tối thiểu để ăn hết là bao nhiêu?", new[] { "3", "4", "5", "6" }, 1, "K = 4 cần ceil(3/4) + ceil(6/4) + ceil(7/4) + ceil(11/4) = 1 + 2 + 2 + 3 = 8 giờ vừa đủ; K = 3 cần 1 + 2 + 3 + 4 = 10 giờ nên không đạt.");
                q.AddQuestion("Tìm đỉnh với nums = [1, 2, 1, 3, 5, 6, 4] bằng cách so sánh nums[mid] với nums[mid + 1]: bắt đầu mid = 3 (nums[3] = 3 < nums[4] = 5), đỉnh tìm được có chỉ số bao nhiêu?", new[] { "1 (giá trị 2)", "4 (giá trị 5)", "5 (giá trị 6)", "6 (giá trị 4)" }, 2, "Dốc lên nên dịch lo = mid + 1: lo = 4, rồi mid = 5 có 6 > 4 nên hi = 5, mid = 4 có 5 < 6 nên lo = 5; kết thúc tại chỉ số 5 với giá trị 6 là đỉnh.");
                q.AddQuestion("Cho arr = [2, 3, 5], lower bound của x = 9 (lớn hơn mọi phần tử) trả về giá trị nào?", new[] { "0", "2", "3", "Không xác định" }, 2, "Mọi phần tử đều < 9 nên lo chạy đến cuối mảng và trả về arr.length = 3 — chính là vị trí chèn hợp lệ cho 9.");
            });
            var qL14 = await GetOrCreate("Trắc nghiệm Prefix Sum", "Kiểm tra kiến thức: Trắc nghiệm Prefix Sum", "dsa", 1, 40, q =>
            {
                q.AddQuestion("Công thức nào đúng khi xây dựng mảng prefix sum?", new[] { "prefix[i] = prefix[i - 1] + arr[i]", "prefix[i] = prefix[i] + arr[i - 1]", "prefix[i] = arr[i] - arr[i - 1]", "prefix[i] = prefix[i - 1] * arr[i]" }, 0, "Mỗi prefix[i] cộng dồn phần tử hiện tại vào tổng trước đó, với quy ước prefix[0] = 0.");
                q.AddQuestion("Với quy ước prefix[0] = 0 và chỉ số 1-based, tổng mảng con arr[l..r] tính bằng công thức nào?", new[] { "prefix[r] - prefix[l]", "prefix[r] - prefix[l - 1]", "prefix[r] + prefix[l - 1]", "prefix[l] - prefix[r]" }, 1, "Lấy tổng cộng dồn đến r rồi khử đi phần cộng dồn trước l: prefix[r] - prefix[l - 1].");
                q.AddQuestion("Độ phức tạp thời gian để xây dựng mảng prefix sum là bao nhiêu?", new[] { "O(1)", "O(N)", "O(N²)", "O(log N)" }, 1, "Chỉ một vòng lặp duyệt N phần tử, mỗi phần tử một phép cộng, nên chi phí là O(N).");
                q.AddQuestion("Sau khi có mảng prefix, mỗi truy vấn tổng mảng con có độ phức tạp bao nhiêu?", new[] { "O(N)", "O(log N)", "O(N²)", "O(1)" }, 3, "Chỉ cần hai phép truy cập mảng và một phép trừ, không phụ thuộc độ dài đoạn truy vấn.");
                q.AddQuestion("Cho arr = [3, 1, 4, 1, 5] với prefix[0] = 0, giá trị prefix[3] bằng bao nhiêu?", new[] { "8", "9", "7", "10" }, 1, "prefix[3] = 3 + 1 + 4 = 9 (tổng ba phần tử đầu tiên của mảng).");
                q.AddQuestion("Với arr = [3, 1, 4, 1, 5] và prefix = [0, 3, 4, 8, 9, 14], tổng arr[2..4] (chỉ số 1-based) bằng bao nhiêu?", new[] { "8", "9", "10", "6" }, 3, "prefix[4] - prefix[1] = 9 - 3 = 6, đúng bằng 1 + 4 + 1.");
                q.AddQuestion("Với difference array, muốn cộng v vào mọi phần tử arr[l..r] (1-based, độ dài N) thì thao tác nào đúng?", new[] { "diff[l] += v và diff[r] += v", "diff[l] += v và diff[r + 1] -= v", "diff[l + 1] += v và diff[r] -= v", "diff[l] -= v và diff[r + 1] += v" }, 1, "diff[l] += v đánh dấu bắt đầu tăng, diff[r + 1] -= v chặn tăng sau vị trí r; quét cộng dồn sẽ tái lập mảng.");
                q.AddQuestion("Cho arr = [1, 2, 3, -1, 2] và K = 3, có bao nhiêu mảng con liên tiếp có tổng đúng bằng K?", new[] { "1", "2", "3", "4" }, 1, "Hai mảng con thỏa mãn: [1, 2] và [3]. Dùng hash đếm tần suất prefix[i] - K xuất hiện trước đó cho kết quả 2.");
                q.AddQuestion("Cho ma trận 2x2 = [[1, 2], [3, 4]] và mảng 2D prefix P với P[0][*] = P[*][0] = 0, giá trị P[2][2] bằng bao nhiêu?", new[] { "7", "9", "10", "12" }, 2, "P[2][2] = P[1][2] + P[2][1] - P[1][1] + arr[2][2] = 3 + 4 - 1 + 4 = 10, bằng tổng toàn bộ ma trận.");
                q.AddQuestion("Mảng arr dài 5 (toàn số 0). Áp dụng: cộng 2 vào arr[1..3] và cộng -1 vào arr[3..4] (chỉ số 1-based). Giá trị cuối cùng của arr[3] là bao nhiêu?", new[] { "2", "1", "3", "0" }, 1, "diff = [0, 2, 0, -1, -2, 1]; cộng dồn được arr = [2, 2, 1, -1, 0]. arr[3] nhận +2 từ đoạn 1..3 và -1 từ đoạn 3..4 nên bằng 1.");
            });
            var qL15 = await GetOrCreate("Trắc nghiệm Kadane", "Kiểm tra kiến thức: Trắc nghiệm Kadane", "dsa", 1, 40, q =>
            {
                q.AddQuestion("Bài toán Maximum Subarray yêu cầu tìm gì trong một mảng số?", new[] { "Một dãy các phần tử bất kỳ có tổng lớn nhất", "Một dãy con liên tiếp có tổng lớn nhất", "Phần tử có giá trị lớn nhất trong mảng", "Cặp phần tử có tổng lớn nhất" }, 1, "Mảng con phải gồm các phần tử đứng cạnh nhau trong mảng gốc và tổng của nó phải lớn nhất.");
                q.AddQuestion("Công thức cốt lõi của thuật toán Kadane khi xét phần tử arr[i] là gì?", new[] { "current = max(arr[i], current + arr[i])", "current = current + arr[i]", "best = best + arr[i]", "current = max(best, current + arr[i])" }, 0, "Tại mỗi vị trí ta chọn giữa việc bắt đầu mảng con mới từ arr[i] hoặc nối vào mảng con đang dở, rồi lấy giá trị tốt hơn.");
                q.AddQuestion("Độ phức tạp thời gian và bộ nhớ của thuật toán Kadane là gì?", new[] { "O(N²) và O(N)", "O(N log N) và O(N)", "O(N) và O(1)", "O(N) và O(N)" }, 2, "Kadane duyệt mảng đúng một lần và chỉ giữ hai biến current cùng best nên tốn O(N) thời gian và O(1) bộ nhớ.");
                q.AddQuestion("Ý nghĩa của biến current trong thuật toán Kadane là gì?", new[] { "Tổng tốt nhất của mảng con kết thúc tại vị trí đang xét", "Tổng của toàn bộ mảng", "Giá trị nhỏ nhất từng gặp", "Vị trí bắt đầu của mảng con tối ưu" }, 0, "current mang tính quy hoạch động: nó là tổng lớn nhất của mọi mảng con có phần tử cuối trùng với vị trí hiện tại.");
                q.AddQuestion("Với mảng [-3, -1, -2] toàn số âm, Kadane trả về kết quả nào?", new[] { "0", "-1", "-3", "-6" }, 1, "Khởi tạo current = best = -3; tại i = 1: current = max(-1, -3 - 1) = -1, best = -1; i = 2 giữ nguyên, kết quả là -1 — mảng con chỉ gồm phần tử -1.");
                q.AddQuestion("Khi current đang âm trước khi xét phần tử mới arr[i], điều gì là đúng?", new[] { "Luôn tiếp tục cộng dồn để tận dụng dữ liệu", "Bắt đầu lại từ arr[i] vì nối thêm số âm chỉ làm giảm tổng", "Reset current về 0 rồi mới cộng arr[i]", "Bỏ qua arr[i] mà không cập nhật biến nào" }, 1, "Một tổng âm không bao giờ có ích cho các phần tử phía sau, nên max(arr[i], current + arr[i]) sẽ tự động khởi động lại từ arr[i].");
                q.AddQuestion("Với mảng [5, -4, 3], best cuối cùng của Kadane là bao nhiêu?", new[] { "5", "4", "3", "8" }, 0, "i = 0: current = 5, best = 5; i = 1: current = max(-4, 1) = 1, best vẫn 5; i = 2: current = max(3, 4) = 4, best vẫn là 5.");
                q.AddQuestion("Mô phỏng Kadane với mảng [-2, 1, -3, 4, -1, 2, 1, -5, 4]: best cuối cùng là bao nhiêu?", new[] { "4", "5", "6", "7" }, 2, "Mảng con tối ưu là [4, -1, 2, 1] có tổng 6; Kadane đạt best = 6 tại i = 6 và giữ nguyên tới cuối dù current có giảm.");
                q.AddQuestion("Tại sao khi gặp số -5 tại i = 7 trong mảng ví dụ trên, kết quả best không bị giảm xuống?", new[] { "Vì best đã được lưu từ các bước trước nên không bị ghi đè", "Vì số âm được cộng vào current nên best cũng giảm theo", "Vì thuật toán quay lại chạy từ đầu khi gặp số âm", "Vì -5 không được xét trong vòng lặp" }, 0, "current giảm xuống 1 nhưng best chỉ cập nhật khi lớn hơn; giá trị best = 6 đã được lưu từ bước trước nên kết quả không thay đổi.");
                q.AddQuestion("Biến thể maximum circular subarray với mảng [5, -3, 5] có đáp án là bao nhiêu?", new[] { "7", "10", "5", "15" }, 1, "Tổng mảng total = 7, mảng con tuyến tính tốt nhất = 7, minSubarray = -3; đáp án = max(7, 7 - (-3)) = 10, tương ứng mảng con vòng [5, 5].");
            });
            var qL16 = await GetOrCreate("Trắc nghiệm Monotonic Stack & Deque", "Kiểm tra kiến thức: Trắc nghiệm Monotonic Stack & Deque", "dsa", 1, 40, q =>
            {
                q.AddQuestion("Monotonic stack là gì?", new[] { "Một stack chỉ lưu các phần tử có giá trị giống nhau", "Một stack luôn duy trì thứ tự đơn điệu tăng hoặc giảm", "Một queue cho phép thêm xóa ở cả hai đầu", "Một stack chỉ lưu số nguyên dương" }, 1, "Điểm khác biệt duy nhất với stack thường là ràng buộc trật tự: các phần tử trong stack phải tăng dần hoặc giảm dần theo giá trị.");
                q.AddQuestion("Khi giải bài toán Next Greater Element bằng monotonic stack, ta nên lưu gì vào stack?", new[] { "Giá trị của phần tử", "Chỉ số (index) của phần tử", "Tổng các phần tử đã duyệt", "Cả giá trị lẫn chỉ số của từng phần tử" }, 1, "Lưu index cho phép tra ngược giá trị qua arr[index] và tính khoảng cách giữa hai vị trí — điều mà việc lưu giá trị trực tiếp không làm được.");
                q.AddQuestion("Next Greater Element của một phần tử được định nghĩa như thế nào?", new[] { "Phần tử có giá trị lớn nhất trong toàn mảng", "Phần tử đầu tiên nằm bên phải có giá trị lớn hơn nó, nếu không có thì là -1", "Phần tử đứng ngay phía bên phải nó", "Phần tử lớn nhất nằm bên trái nó" }, 1, "Phải là phần tử gần nhất về vị trí (đầu tiên) bên phải và có giá trị lớn hơn; những phần tử không có ai lớn hơn bên phải nhận kết quả -1.");
                q.AddQuestion("Deque (double-ended queue) có đặc điểm gì?", new[] { "Chỉ thêm và xóa ở một đầu", "Thêm và xóa ở cả hai đầu với độ phức tạp O(1)", "Truy cập phần tử bất kỳ ở giữa với O(1)", "Tự động sắp xếp các phần tử tăng dần" }, 1, "Deque kết hợp khả năng của stack và queue: AddFirst, AddLast, RemoveFirst, RemoveLast đều tốn O(1).");
                q.AddQuestion("Next Greater Element của mảng [2, 1, 2, 4, 3] là gì?", new[] { "[4, 2, 4, -1, -1]", "[2, 2, 4, -1, -1]", "[4, 2, 4, 3, -1]", "[-1, 4, 4, -1, -1]" }, 0, "Giá trị 2 đầu tiên gặp 4; số 1 gặp 2; giá trị 2 thứ hai gặp 4; hai phần tử cuối không có ai lớn hơn bên phải nên nhận -1.");
                q.AddQuestion("Vì sao monotonic stack chỉ tốn O(N) dù có vòng lặp while lồng bên trong vòng lặp for?", new[] { "Vì N thường rất nhỏ trong thực tế", "Vì mỗi phần tử chỉ được push vào và pop ra tối đa một lần, tổng phép toán khoảng 2N", "Vì vòng lặp while thực chất không bao giờ chạy", "Vì stack chỉ lưu ít hơn N phần tử" }, 1, "Chi phí trả trước của các lần pop được phân bổ đều cho N phần tử, nên tổng thời gian là O(N) amortized chứ không phải O(N²).");
                q.AddQuestion("Trong sliding window maximum dùng deque, giá trị lớn nhất của cửa sổ luôn nằm ở đâu?", new[] { "Cuối deque", "Đầu deque", "Giữa deque", "Ngoài deque" }, 1, "Deque duy trì các index theo thứ tự giá trị giảm dần, nên phần tử đứng đầu deque luôn là giá trị lớn nhất của cửa sổ hiện tại.");
                q.AddQuestion("Next Greater Element của mảng tăng dần [1, 2, 3, 4] là gì?", new[] { "[-1, -1, -1, -1]", "[2, 3, 4, -1]", "[1, 2, 3, 4]", "[4, 4, 4, -1]" }, 1, "Mỗi phần tử tìm thấy ngay phần tử kế bên phải lớn hơn nó; riêng phần tử cuối không có ai lớn hơn nên nhận -1.");
                q.AddQuestion("Trong quá trình xét giá trị 4 (index 3) của mảng [2, 1, 2, 4, 3] với monotonic decreasing stack, những index nào bị pop?", new[] { "Chỉ index 2", "Index 2 và index 0", "Chỉ index 1", "Không có index nào bị pop" }, 1, "4 lớn hơn giá trị tại đỉnh (2 tại index 2) nên pop index 2; đỉnh tiếp theo là index 0 (giá trị 2) cũng bị pop vì 4 > 2; dừng khi stack rỗng.");
                q.AddQuestion("Sliding window maximum với nums = [7, 2, 4] và k = 2 cho kết quả gì?", new[] { "[7, 4]", "[7, 2]", "[2, 4]", "[7, 7]" }, 0, "Cửa sổ đầu tiên [7, 2] có max là 7; cửa sổ thứ hai [2, 4] có max là 4, nên kết quả là [7, 4].");
            });
            var qL17 = await GetOrCreate("Trắc nghiệm BST", "Kiểm tra kiến thức: Trắc nghiệm BST", "tree-graph", 2, 40, q =>
            {
                q.AddQuestion("Quy tắc vàng của BST quy định điều gì?", new[] { "Toàn bộ node nhánh trái nhỏ hơn node hiện tại và toàn bộ node nhánh phải lớn hơn", "Node con trái luôn lớn hơn node con phải", "Mọi node phải mang giá trị bằng nhau", "Cây phải luôn có đủ hai con ở mọi node" }, 0, "BST yêu cầu mọi node trong nhánh trái đều nhỏ hơn node hiện tại và mọi node trong nhánh phải đều lớn hơn, áp dụng cho toàn bộ nhánh chứ không chỉ hai con kề.");
                q.AddQuestion("Trên một BST cân bằng chứa N node, thao tác tìm kiếm mất bao lâu?", new[] { "O(1)", "O(log N)", "O(N)", "O(N log N)" }, 1, "Mỗi bước rẽ nhánh loại bỏ một nửa số node còn lại nên số phép so sánh là log2(N), tức O(log N).");
                q.AddQuestion("Duyệt inorder (trái - node - phải) trên một BST cho kết quả gì?", new[] { "Dãy giảm dần", "Dãy tăng dần", "Dãy ngẫu nhiên", "Dãy bắt đầu từ node lá bên phải" }, 1, "Vì nhánh trái luôn nhỏ hơn node và nhánh phải luôn lớn hơn, duyệt trái - node - phải sẽ lần lượt in ra các giá trị theo thứ tự tăng dần.");
                q.AddQuestion("Khi nào một BST bị thoái hóa thành danh sách liên kết và chạy chậm O(N)?", new[] { "Khi chèn các giá trị đã được sắp xếp sẵn", "Khi cây có đúng 8 node", "Khi thực hiện quá nhiều thao tác xóa", "Khi node gốc có hai con" }, 0, "Chèn dãy sắp xếp sẵn như 10, 20, 30, 40 làm cây chỉ phát triển về một phía, chiều cao bằng N nên mọi thao tác rơi về O(N).");
                q.AddQuestion("Chèn lần lượt 20, 10, 30, 12, 15 vào BST rỗng. Node 15 sẽ được gắn vào đâu?", new[] { "Con trái của 20", "Con phải của 30", "Con phải của 12", "Con trái của 10" }, 2, "15 < 20 rẽ trái, 15 > 10 rẽ phải, 15 > 12 nên 15 trở thành con phải của 12.");
                q.AddQuestion("Khi xóa một node chỉ có đúng một con, cách xử lý đúng là gì?", new[] { "Nâng con của nó lên thay thế vị trí của node bị xóa", "Xóa luôn cả cây con", "Thay nó bằng node lá gần nhất", "Không thể xóa node loại này" }, 0, "Chỉ cần nối đứa con duy nhất lên vị trí của node bị xóa, cây vẫn giữ nguyên quy tắc vàng.");
                q.AddQuestion("Trong hệ thống thực tế như database, người ta thường dùng loại cây nào để tránh BST bị lệch?", new[] { "Cây nhị phân bất kỳ", "BST tự cân bằng như AVL hoặc Red-Black", "Cây chỉ toàn node lá", "Cây có gốc trùng với phần tử lớn nhất" }, 1, "AVL và Red-Black tự xoay lại sau mỗi lần chèn/xóa để giữ chiều cao O(log N), đảm bảo thao tác luôn nhanh.");
                q.AddQuestion("Chèn lần lượt 10, 20, 30, 40 vào BST rỗng rồi tìm giá trị 40. Cần bao nhiêu phép so sánh giá trị?", new[] { "1", "2", "3", "4" }, 3, "Cây lệch phải thành chuỗi 10 → 20 → 30 → 40 nên phải so sánh lần lượt với 10, 20, 30 rồi 40, tổng cộng 4 phép, đúng với độ phức tạp O(N).");
                q.AddQuestion("Cho cây: gốc 10, con trái 5, và 5 có con phải 12. Cây này có phải BST hợp lệ không?", new[] { "Có, vì mọi node so với cha đều thỏa trái nhỏ hơn", "Không, vì 12 lớn hơn 10 nhưng lại nằm bên trái gốc", "Có, vì mọi node đều có tối đa hai con", "Không, vì cây thiếu nhánh phải" }, 1, "Đây là bẫy kinh điển: 12 < 5 là sai, nhưng 12 > 10 lại vi phạm toàn bộ nhánh trái của gốc, nên cần khoảng min/max để phát hiện.");
                q.AddQuestion("Xóa node gốc 20 có hai con: nhánh phải gồm 30 với con trái 25. Quy trình đúng là gì?", new[] { "Thay 20 bằng 10 rồi xóa 10", "Thay 20 bằng 30 rồi xóa 30", "Thay 20 bằng 25 (successor) rồi xóa 25 ở nhánh phải", "Thay 20 bằng 25 rồi dừng, giữ nguyên 25 cũ" }, 2, "Successor là node nhỏ nhất nhánh phải (25): chép 25 đè lên 20, rồi đệ quy xóa 25 ở vị trí cũ, lúc đó nó chỉ có tối đa một con.");
            });
            var qL18 = await GetOrCreate("Trắc nghiệm Duyệt cây", "Kiểm tra kiến thức: Trắc nghiệm Duyệt cây", "tree-graph", 2, 40, q =>
            {
                q.AddQuestion("Node nào của cây không có node cha?", new[] { "Node lá", "Node root", "Node con trái", "Node con phải" }, 1, "Root là node gốc duy nhất không có cha; mọi node khác đều có đúng một cha.");
                q.AddQuestion("Chiều cao (height) của một node được định nghĩa như thế nào?", new[] { "Số cạnh từ root tới node đó", "Số cạnh dài nhất từ node đó xuống một node lá", "Số node con trực tiếp của node đó", "Số cạnh từ node đó tới root" }, 1, "Depth đo số cạnh từ root xuống node, còn height đo số cạnh dài nhất từ node xuống một lá; height của cây là height của root.");
                q.AddQuestion("Trong duyệt preorder, thứ tự xử lý là gì?", new[] { "Trái - Node - Phải", "Trái - Phải - Node", "Node - Trái - Phải", "Phải - Node - Trái" }, 2, "Preorder nghĩa là node hiện tại được thăm trước, sau đó mới đến nhánh trái rồi nhánh phải, nên root luôn in ra đầu tiên.");
                q.AddQuestion("Duyệt theo chiều rộng (level-order) sử dụng cấu trúc dữ liệu nào?", new[] { "Ngăn xếp (Stack)", "Hàng đợi (Queue)", "Mảng động", "Bảng băm" }, 1, "BFS cần duyệt ai phát hiện trước thì xử lý trước, đúng nguyên tắc FIFO nên bắt buộc dùng hàng đợi.");
                q.AddQuestion("Cho cây: root 1, con trái 2 (có con 4, 5), con phải 3 (có con 6). Thứ tự inorder của cây là gì?", new[] { "1 2 4 5 3 6", "4 2 5 1 6 3", "4 5 2 6 3 1", "1 2 3 4 5 6" }, 1, "Inorder là trái - node - phải: nhánh trái cho 4 2 5, thăm root 1, nhánh phải cho 6 3, kết quả là 4 2 5 1 6 3.");
                q.AddQuestion("Với cùng cây trên, thứ tự postorder là gì?", new[] { "4 5 2 6 3 1", "1 2 4 5 3 6", "4 2 5 1 6 3", "6 3 4 5 2 1" }, 0, "Postorder duyệt trái rồi phải rồi mới thăm node: nhánh trái cho 4 5 2, nhánh phải cho 6 3, cuối cùng thăm root 1.");
                q.AddQuestion("Để kiểm tra một cây có đối xứng (symmetric) hay không, cách tiếp cận đúng là gì?", new[] { "Duyệt inorder và kiểm tra dãy có tăng dần hay không", "Đệ quy so sánh cây con trái và cây con phải theo kiểu phản chiếu qua gương", "Đếm số node trái và phải bằng nhau", "So sánh chiều cao hai nhánh" }, 1, "Cây đối xứng nghĩa là con trái của nhánh trái phải bằng con phải của nhánh phải, so sánh theo cặp phản chiếu qua gốc.");
                q.AddQuestion("Cây lệch thành chuỗi dài N node, đệ quy DFS sẽ dùng ngăn xếp sâu tối đa bao nhiêu?", new[] { "O(1)", "O(log N)", "O(N)", "O(N²)" }, 2, "Chiều cao cây lệch bằng N, mỗi mức đệ quy giữ một khung gọi trên call stack nên bộ nhớ phụ là O(h) = O(N).");
                q.AddQuestion("Cho cây: root 1, con trái 2 (có con 4, 5), con phải 3 (có con 6). Thứ tự level-order (BFS) là gì?", new[] { "1 2 3 4 5 6", "1 2 4 5 3 6", "4 2 5 1 6 3", "4 5 2 6 3 1" }, 0, "BFS quét theo tầng: tầng 1 gồm 1, tầng 2 gồm 2 và 3, tầng 3 gồm 4, 5, 6 nên kết quả là 1 2 3 4 5 6.");
                q.AddQuestion("Cho cây: root 1, con trái 2 (có con trái 4), con phải 3 (có con phải 5, và 5 có con trái 6). Chiều cao của cây (số cạnh dài nhất từ root tới lá) là bao nhiêu?", new[] { "2", "3", "4", "5" }, 1, "Đường dài nhất là 1 → 3 → 5 → 6 gồm 3 cạnh; đường 1 → 2 → 4 chỉ có 2 cạnh, nên chiều cao cây là 3.");
            });
            var qL19 = await GetOrCreate("Trắc nghiệm Heap & Priority Queue", "Kiểm tra kiến thức: Trắc nghiệm Heap & Priority Queue", "dsa", 2, 40, q =>
            {
                q.AddQuestion("Trong một min-heap, phần tử ở root (gốc) là phần tử như thế nào?", new[] { "Phần tử nhỏ nhất trong heap", "Phần tử lớn nhất trong heap", "Phần tử được chèn vào đầu tiên", "Một phần tử bất kỳ" }, 0, "Min-heap đảm bảo mỗi cha nhỏ hơn hoặc bằng con nên root luôn chứa giá trị nhỏ nhất của toàn heap.");
                q.AddQuestion("Tính chất heap property của max-heap là gì?", new[] { "Cha luôn nhỏ hơn hoặc bằng con", "Cha luôn lớn hơn hoặc bằng con", "Cây con trái luôn chứa giá trị nhỏ hơn cây con phải", "Mọi node lá đều có giá trị bằng nhau" }, 1, "Max-heap yêu cầu giá trị mỗi cha lớn hơn hoặc bằng con, nhờ đó root chứa phần tử lớn nhất của heap.");
                q.AddQuestion("Độ phức tạp của thao tác peek (xem phần tử đầu heap) là bao nhiêu?", new[] { "O(1)", "O(log N)", "O(N)", "O(N log N)" }, 0, "Peek chỉ đọc mảng tại chỉ số 0, vị trí của root, nên thời gian không đổi O(1).");
                q.AddQuestion("Trong biểu diễn mảng của heap (mảng bắt đầu chỉ số 0), con trái của nút tại chỉ số i nằm ở đâu?", new[] { "Chỉ số 2*i", "Chỉ số 2*i + 1", "Chỉ số 2*i + 2", "Chỉ số (i - 1) / 2" }, 1, "Cây nhị phân hoàn chỉnh lưu trong mảng: con trái tại 2*i + 1, con phải tại 2*i + 2, cha tại (i - 1)/2.");
                q.AddQuestion("Chèn giá trị 8 vào min-heap [5, 7, 10, 15, 20, 25, 30]. Mảng sau khi sift up là gì?", new[] { "[5, 7, 10, 8, 20, 25, 30, 15]", "[5, 8, 10, 7, 20, 25, 30, 15]", "[5, 7, 8, 10, 20, 25, 30, 15]", "[5, 7, 10, 15, 20, 25, 30, 8]" }, 0, "8 được thêm vào cuối mảng, sift up: 8 nhỏ hơn cha 15 nên đổi chỗ, rồi 8 lớn hơn cha mới 7 nên dừng; kết quả là [5, 7, 10, 8, 20, 25, 30, 15].");
                q.AddQuestion("Sau khi thực hiện remove top trên min-heap [5, 7, 8, 15, 20, 25, 30], phần tử nào trở thành root mới?", new[] { "7", "8", "15", "30" }, 0, "Phần tử cuối 30 được kéo lên root rồi sift down: đổi chỗ với con nhỏ nhất là 7 nên root mới là 7, heap còn lại là [7, 15, 8, 30, 20, 25].");
                q.AddQuestion("Để tìm K phần tử lớn nhất (top K) trong một luồng dữ liệu rất lớn, cách làm hiệu quả là gì?", new[] { "Giữ một min-heap kích thước K, loại bỏ phần tử nhỏ nhất khi heap vượt quá K", "Giữ một max-heap kích thước K, loại bỏ phần tử lớn nhất khi heap vượt quá K", "Sắp xếp lại toàn bộ dữ liệu mỗi khi có phần tử mới", "Lưu toàn bộ dữ liệu vào ma trận kề rồi tìm K lần" }, 0, "Min-heap kích thước K giữ K phần tử lớn nhất đã gặp; root của nó là phần tử nhỏ nhất trong nhóm, chính là phần tử lớn thứ K.");
                q.AddQuestion("Thực hiện extract (lấy root) trên min-heap [7, 15, 8, 30, 20, 25]. Heap sau thao tác là gì?", new[] { "[8, 15, 25, 30, 20]", "[15, 8, 25, 30, 20]", "[8, 15, 30, 25, 20]", "[15, 25, 8, 30, 20]" }, 0, "Lấy 7 ra, kéo phần tử cuối 25 lên root thành [25, 15, 8, 30, 20], sift down đổi 25 với con nhỏ nhất là 8 → [8, 15, 25, 30, 20]; 25 lúc này không còn con trong giới hạn nên dừng.");
                q.AddQuestion("Phát biểu nào ĐÚNG về Heap Sort?", new[] { "Luôn O(N log N) thời gian, O(1) bộ nhớ phụ và không ổn định", "Xấu nhất O(N²) khi dữ liệu đã được sắp xếp sẵn", "Cần mảng phụ kích thước N nên không sắp xếp tại chỗ", "Luôn chạy nhanh hơn Quick Sort nhờ cache locality tốt" }, 0, "Heap sort xây max-heap rồi trích xuất root N lần, mỗi lần O(log N) nên luôn O(N log N); nó sắp xếp ngay trên mảng gốc (O(1) bộ nhớ phụ) nhưng không ổn định và cache locality kém hơn Quick Sort.");
                q.AddQuestion("Luồng số đến lần lượt: 2, 5, 1, 6, 3, được duy trì bằng kỹ thuật hai heap (max-heap nửa nhỏ, min-heap nửa lớn). Median cuối cùng của luồng là bao nhiêu?", new[] { "2", "3", "4", "5" }, 1, "Sắp xếp dãy được 1, 2, 3, 5, 6; với 5 số lẻ, median là phần tử giữa là 3 — kỹ thuật hai heap cho phép lấy median trong O(1) sau mỗi lần chèn O(log N).");
            });
            var qL20 = await GetOrCreate("Trắc nghiệm Đồ thị cơ bản", "Kiểm tra kiến thức: Trắc nghiệm Đồ thị cơ bản", "graph", 2, 40, q =>
            {
                q.AddQuestion("Trong đồ thị vô hướng, cạnh nối giữa A và B có ý nghĩa gì?", new[] { "Chỉ đi được từ A sang B", "Chỉ đi được từ B sang A", "Đi được cả hai chiều A - B và B - A", "Không cho phép di chuyển giữa A và B" }, 2, "Cạnh vô hướng không có chiều, nghĩa là có thể di chuyển cả hai chiều giữa hai đỉnh.");
                q.AddQuestion("Danh sách kề (adjacency list) của đồ thị N đỉnh, M cạnh tốn bao nhiêu bộ nhớ?", new[] { "O(N)", "O(N + M)", "O(N²)", "O(M²)" }, 1, "Mỗi đỉnh lưu một danh sách hàng xóm; tổng độ dài các danh sách là O(M) và có N danh sách nên bộ nhớ là O(N + M).");
                q.AddQuestion("Ưu điểm chính của ma trận kề (adjacency matrix) so với danh sách kề là gì?", new[] { "Tốn ít bộ nhớ hơn", "Kiểm tra tồn tại cạnh u-v trong O(1)", "Duyệt hàng xóm của một đỉnh nhanh hơn", "Không cần đánh dấu visited" }, 1, "Ma trận N×N cho phép trả lời ngay câu hỏi có cạnh giữa u và v hay không trong thời gian hằng số, đổi lại bộ nhớ O(N²).");
                q.AddQuestion("BFS duyệt đồ thị dựa trên cấu trúc dữ liệu nào?", new[] { "Ngăn xếp (stack)", "Hàng đợi (queue)", "Cây đỏ đen", "Bảng băm" }, 1, "BFS cần duyệt theo nguyên tắc ai phát hiện trước xử lý trước (FIFO) để quét hết tầng gần trước khi sang tầng xa hơn.");
                q.AddQuestion("Cho danh sách kề: 0:[1, 2], 1:[3], 2:[3], 3:[]. Thứ tự BFS bắt đầu từ đỉnh 0 là gì?", new[] { "0 1 2 3", "0 1 3 2", "0 2 1 3", "0 3 2 1" }, 0, "BFS duyệt theo tầng: đỉnh 0, rồi cả hai hàng xóm tầng 1 là 1 và 2, cuối cùng 3 ở tầng 2 nên thứ tự là 0 1 2 3.");
                q.AddQuestion("Với cùng danh sách kề trên, thứ tự DFS bắt đầu từ đỉnh 0 là gì?", new[] { "0 1 2 3", "0 1 3 2", "0 2 3 1", "0 3 1 2" }, 1, "DFS đâm sâu: 0 → 1 → 3 (ngõ cụt), quay lui về 1 rồi 0, sang 2 (3 đã thăm), nên thứ tự là 0 1 3 2.");
                q.AddQuestion("Trong đồ thị không trọng số, thuật toán nào chắc chắn tìm được đường đi có ít cạnh nhất?", new[] { "DFS", "BFS", "Tìm kiếm nhị phân", "Sắp xếp trộn (Merge Sort)" }, 1, "BFS duyệt theo tầng nên lần đầu chạm tới một đỉnh luôn là đường ngắn nhất tính theo số cạnh; DFS không có đảm bảo này.");
                q.AddQuestion("Trong DFS phát hiện chu trình trên đồ thị VÔ HƯỚNG, gặp một đỉnh kề đã thăm và là đỉnh cha trực tiếp nghĩa là gì?", new[] { "Có chu trình, vì đỉnh đó đã được thăm", "Không phải chu trình, chỉ là cạnh lùi về cha", "Đồ thị không liên thông", "Đồ thị có trọng số âm" }, 1, "Cạnh về cha chỉ là con đường vừa đi qua; chu trình trong đồ thị vô hướng chỉ xuất hiện khi gặp đỉnh đã thăm mà KHÔNG phải cha trực tiếp.");
                q.AddQuestion("Cho lưới nhị phân [[1, 1, 0], [1, 0, 0], [0, 0, 1]] với 1 là đất, 0 là nước. Số hòn đảo (vùng đất liền kề theo 4 hướng) là bao nhiêu?", new[] { "1", "2", "3", "4" }, 1, "Ba ô (0,0), (0,1), (1,0) nối nhau tạo một đảo, còn ô (2,2) tách biệt tạo đảo thứ hai, tổng cộng 2 đảo.");
                q.AddQuestion("Để phát hiện chu trình trong đồ thị CÓ HƯỚNG bằng DFS, ngoài mảng visited cần thêm điều gì?", new[] { "Mảng inStack đánh dấu đỉnh đang nằm trên đường đi hiện tại", "Mảng parent lưu đỉnh cha của từng đỉnh", "Mảng distance lưu khoảng cách từ đỉnh nguồn", "Chỉ cần visited là đủ" }, 0, "Với đồ thị có hướng, gặp đỉnh đã thăm chưa đủ kết luận; phải kiểm tra đỉnh đó có còn nằm trong nhánh đệ quy hiện tại (inStack) hay không thì mới là chu trình.");
            });
            var qL21 = await GetOrCreate("Trắc nghiệm Topological Sort", "Kiểm tra kiến thức: Trắc nghiệm Topological Sort", "graph", 2, 40, q =>
            {
                q.AddQuestion("Điều kiện bắt buộc để một đồ thị có thứ tự tô-pô là gì?", new[] { "Đồ thị có hướng không chu trình (DAG)", "Đồ thị vô hướng liên thông", "Đồ thị có hướng bất kỳ", "Đồ thị có trọng số âm" }, 0, "Chỉ đồ thị có hướng không chứa chu trình mới có thứ tự tô-pô; chu trình tạo quan hệ trước sau mâu thuẫn.");
                q.AddQuestion("Trong thứ tự tô-pô của DAG có cạnh u → v, vị trí của u và v phải thỏa mãn điều gì?", new[] { "u đứng trước v", "v đứng trước u", "u và v đứng cạnh nhau", "Thứ tự tùy ý" }, 0, "Định nghĩa thứ tự tô-pô: với mỗi cạnh u → v, đỉnh u phải xuất hiện trước đỉnh v.");
                q.AddQuestion("Thuật toán Kahn khởi động bằng cách đưa những đỉnh nào vào hàng đợi?", new[] { "Đỉnh có indegree bằng 0", "Đỉnh có outdegree bằng 0", "Đỉnh có bậc lớn nhất", "Đỉnh xuất phát bất kỳ" }, 0, "Đỉnh indegree 0 không có tiền đề nào nên chắc chắn đứng đầu thứ tự, là điểm khởi đầu của Kahn.");
                q.AddQuestion("Một DAG có bao nhiêu thứ tự tô-pô hợp lệ?", new[] { "Đúng một thứ tự duy nhất", "Có thể có nhiều thứ tự khác nhau", "Luôn là 2 thứ tự", "Không xác định được" }, 1, "Thứ tự tô-pô không duy nhất: khi có nhiều đỉnh indegree 0, ta có thể chọn xử lý đỉnh nào trước tùy ý.");
                q.AddQuestion("Indegree của một đỉnh trong đồ thị có hướng là gì?", new[] { "Số cạnh đi ra từ đỉnh đó", "Số cạnh đi vào đỉnh đó", "Tổng số cạnh nối với đỉnh đó", "Số đỉnh kề với nó" }, 1, "Indegree đếm số cạnh hướng vào đỉnh; outdegree đếm số cạnh hướng ra.");
                q.AddQuestion("Trong Kahn, khi xử lý đỉnh u, vì sao phải giảm indegree của mọi đỉnh kề v?", new[] { "Vì cạnh u → v đã được thỏa mãn", "Để tăng tốc thuật toán", "Để xóa v khỏi đồ thị", "Vì v đã được xử lý rồi" }, 0, "u đã đứng trước v trong thứ tự nên yêu cầu của cạnh u → v không còn nữa; v chỉ vào hàng đợi khi mọi tiền đề đều xong.");
                q.AddQuestion("Ứng dụng kinh điển nào sau đây dùng topological sort?", new[] { "Sắp lịch học khi môn này cần môn kia", "Tìm đường đi ngắn nhất trên bản đồ", "Sắp xếp mảng số tăng dần", "Kiểm tra chuỗi đối xứng" }, 0, "Bài toán course schedule và hệ thống build phụ thuộc (npm, make) đều cần sắp thứ tự công việc theo quan hệ phụ thuộc.");
                q.AddQuestion("Cho DAG có cạnh A → B, A → C, B → D, C → D. Thứ tự nào sau đây KHÔNG hợp lệ?", new[] { "A B C D", "A C B D", "B A C D", "A B D C" }, 3, "Cạnh C → D buộc C đứng trước D, nhưng thứ tự A B D C để D đứng trước C nên vi phạm.");
                q.AddQuestion("Đồ thị có 6 đỉnh; sau khi Kahn kết thúc, thứ tự chỉ chứa 5 đỉnh. Kết luận đúng là gì?", new[] { "Đồ thị có chu trình nên không tồn tại thứ tự tô-pô đầy đủ", "Đồ thị hợp lệ và thiếu đỉnh cô lập", "Cần chạy lại thuật toán với hàng đợi khác", "Indegree ban đầu tính sai" }, 0, "Nếu số đỉnh xử lý nhỏ hơn V, các đỉnh còn lại nằm trong chu trình nên indegree của chúng không bao giờ về 0.");
                q.AddQuestion("Với DAG có cạnh A → B và B → C, DFS postorder đẩy kết quả theo thứ tự C, B, A. Thứ tự tô-pô chính thức là gì?", new[] { "A B C", "C B A", "B C A", "C A B" }, 0, "Kỹ thuật DFS topo ghi đỉnh sau khi hoàn thành nhánh rồi đảo ngược mảng, nên C, B, A trở thành A, B, C.");
            });
            var qL22 = await GetOrCreate("Trắc nghiệm Backtracking", "Kiểm tra kiến thức: Trắc nghiệm Backtracking", "dsa", 2, 40, q =>
            {
                q.AddQuestion("Backtracking là kỹ thuật tìm kiếm dựa trên việc duyệt cấu trúc nào?", new[] { "Cây không gian trạng thái bằng DFS", "Hàng đợi theo tầng BFS", "Cây nhị phân cân bằng", "Bảng băm tối ưu" }, 0, "Backtracking mở rộng DFS: đi sâu theo từng lựa chọn, gặp ngõ cụt thì lùi lại và thử nhánh khác.");
                q.AddQuestion("Bước nào bắt buộc phải có sau mỗi lần đệ quy để thử lựa chọn tiếp theo?", new[] { "Unchoose — hủy bỏ lựa chọn", "Sắp xếp lại dữ liệu", "Tăng biến đếm", "Xóa toàn bộ state" }, 0, "Unchoose trả state về trạng thái trước khi chọn; nếu thiếu bước này, các nhánh sau bị ô nhiễm dữ liệu.");
                q.AddQuestion("Sinh toàn bộ tập con của tập n phần tử cần bao nhiêu phép thử trong trường hợp xấu nhất?", new[] { "O(n)", "O(n²)", "O(2^n)", "O(n!)" }, 2, "Mỗi phần tử có 2 lựa chọn (lấy hoặc không lấy) nên tổng số tập con là 2^n.");
                q.AddQuestion("Sinh toàn bộ hoán vị của n phần tử có độ phức tạp thời gian là bao nhiêu?", new[] { "O(2^n)", "O(n log n)", "O(n!)", "O(n²)" }, 2, "Số hoán vị của n phần tử là n! nên thời gian xấu nhất là O(n!).");
                q.AddQuestion("Trong template backtrack(state), base case có vai trò gì?", new[] { "Xác định trạng thái đủ để ghi nhận lời giải", "Tăng tốc vòng lặp", "Khởi tạo mảng visited", "Sắp xếp các lựa chọn" }, 0, "Base case kiểm tra trạng thái đã đầy đủ, nếu đúng thì lưu lời giải và dừng đệ quy xuống sâu hơn.");
                q.AddQuestion("Trong bài N-Queens, khi đặt quân hậu thứ k, điều kiện để pruning nhánh hiện tại là gì?", new[] { "Hậu mới đụng hàng, cột hoặc đường chéo của hậu trước", "Bảng cờ chưa đầy", "Số hậu đã đặt nhỏ hơn n", "Hậu nằm ở góc bảng" }, 0, "Hai hậu tấn công nhau khi cùng hàng, cùng cột hoặc cùng đường chéo; phát hiện sớm giúp bỏ cả nhánh.");
                q.AddQuestion("Trong bài generate parentheses, lúc nào được phép thêm dấu đóng ')' vào chuỗi?", new[] { "Khi số dấu đóng nhỏ hơn số dấu mở", "Khi số dấu mở nhỏ hơn n", "Khi chuỗi đạt độ dài 2n", "Luôn luôn được thêm" }, 0, "Chuỗi ngoặc hợp lệ yêu cầu close < open tại mọi thời điểm; khi open < n mới được thêm dấu mở.");
                q.AddQuestion("Cho tập 4 phần tử, số tập con khác nhau (kể cả tập rỗng) là bao nhiêu?", new[] { "8", "12", "16", "24" }, 2, "Số tập con của tập n phần tử là 2^n; với n = 4 ta có 16 tập con.");
                q.AddQuestion("Cho nums = [1, 2, 2] và thuật toán subsets không xử lý trùng. Số tập con DUY NHẤT sau khi khử trùng là bao nhiêu?", new[] { "8", "6", "4", "3" }, 1, "Trong 8 tập con thô, cặp [2] và [1, 2] xuất hiện hai lần; còn lại 6 tập con duy nhất.");
                q.AddQuestion("Bài N-Queens với bảng 4x4 có đúng bao nhiêu cách xếp thỏa mãn?", new[] { "1", "2", "4", "8" }, 1, "Bảng 4x4 chỉ có 2 lời giải, hai lời giải là phản chiếu qua trục đứng của nhau; pruning cắt bỏ toàn bộ nhánh sai.");
            });
            var qL23 = await GetOrCreate("Trắc nghiệm Chia để trị", "Kiểm tra kiến thức: Trắc nghiệm Chia để trị", "sorting", 2, 40, q =>
            {
                q.AddQuestion("Chia để trị (Divide and Conquer) gồm ba giai đoạn nào theo đúng thứ tự?", new[] { "Chia - Trị - Gộp", "Trị - Chia - Gộp", "Gộp - Chia - Trị", "Chia - Gộp - Trị" }, 0, "Ba giai đoạn chuẩn theo CLRS: Divide (chia bài toán con), Conquer (giải đệ quy), Combine (gộp lời giải).");
                q.AddQuestion("Trong Merge Sort, vì sao mảng chỉ còn một phần tử thì dừng đệ quy?", new[] { "Vì không còn bộ nhớ để chia tiếp", "Vì mảng một phần tử luôn được coi là đã sắp xếp", "Vì phần tử đó là pivot", "Vì cần bảo toàn tính ổn định" }, 1, "Đây là base case: một phần tử không có thứ tự nào để vi phạm nên luôn xem như đã sắp xếp.");
                q.AddQuestion("Binary Search chỉ chạy đúng khi dữ liệu đầu vào thỏa điều kiện gì?", new[] { "Mảng có ít hơn 1000 phần tử", "Mảng đã được sắp xếp", "Mảng chỉ chứa số dương", "Mảng không chứa phần tử trùng" }, 1, "Binary Search dựa vào so sánh với phần tử giữa để loại bỏ một nửa không gian tìm kiếm, nên mảng phải được sắp xếp sẵn.");
                q.AddQuestion("Độ phức tạp thời gian của Merge Sort trong mọi trường hợp là gì?", new[] { "O(n)", "O(n log n)", "O(n²)", "O(log n)" }, 1, "Merge Sort luôn chia đôi mảng qua log2(n) tầng và mỗi tầng trộn hết n phần tử nên mọi trường hợp đều là O(n log n).");
                q.AddQuestion("Nhược điểm chính về bộ nhớ của Merge Sort so với Quick Sort là gì?", new[] { "Cần mảng phụ kích thước O(n) để trộn", "Cần ngăn xếp đệ quy O(n²)", "Không thể chạy trên dữ liệu lớn", "Tốn O(n log n) bộ nhớ do đệ quy" }, 0, "Bước trộn bắt buộc tạo mảng phụ chứa dữ liệu hai nửa nên không gian là O(n), còn Quick Sort sắp xếp tại chỗ.");
                q.AddQuestion("Quick Sort suy thoái xuống O(n²) trong tình huống nào?", new[] { "Mảng toàn phần tử giống nhau và pivot ở giữa", "Pivot luôn chia mảng thành hai phần mất cân bằng, ví dụ mảng đã sắp xếp với pivot cuối", "Mảng có số phần tử chẵn", "Mảng chứa số âm" }, 1, "Khi pivot luôn là phần tử cuối trên mảng đã sắp xếp, một bên lúc nào cũng rỗng nên cây đệ quy dài n tầng, tổng chi phí là O(n²).");
                q.AddQuestion("Áp dụng Master Theorem cho T(n) = 2T(n/2) + O(n), kết quả là gì?", new[] { "O(n)", "O(n log n)", "O(log n)", "O(n²)" }, 1, "a = 2 bằng b^d = 2^1 nên theo trường hợp cân bằng của Master Theorem, kết quả là O(n^d log n) = O(n log n).");
                q.AddQuestion("Trong Merge Sort, hai nửa đã sắp xếp [3, 27, 38] và [9, 10, 82] được trộn thành mảng nào?", new[] { "[3, 9, 27, 38, 10, 82]", "[3, 9, 10, 27, 38, 82]", "[3, 27, 38, 9, 10, 82]", "[9, 3, 10, 27, 38, 82]" }, 1, "Trộn kiểu dây kéo: 3, 9, 10, 27, 38 rồi hốt nốt 82 — hai nửa đã sắp xếp nên kết quả cũng sắp xếp.");
                q.AddQuestion("Tìm giá trị 9 trong mảng [1, 3, 5, 7, 9, 11] bằng Binary Search, các giá trị được so sánh theo thứ tự nào?", new[] { "7 rồi 9", "5 rồi 9", "9 ngay lần đầu", "3 rồi 9" }, 1, "Mid đầu là chỉ số 2 (giá trị 5) nhỏ hơn 9 nên chuyển sang nửa phải; mid tiếp theo là chỉ số 4 (giá trị 9), tìm thấy sau hai phép so sánh.");
                q.AddQuestion("Dùng Lomuto Partition với pivot là phần tử cuối cho mảng [10, 80, 30, 90, 40, 50, 70] (pivot 70), pivot nằm ở chỉ số nào sau khi partition?", new[] { "3", "4", "5", "6" }, 1, "Sau partition mảng thành [10, 30, 40, 50, 70, 80, 90]: mọi phần tử nhỏ hơn 70 nằm bên trái, pivot 70 đứng đúng vị trí chỉ số 4.");
            });
            var qL24 = await GetOrCreate("Trắc nghiệm Greedy", "Kiểm tra kiến thức: Trắc nghiệm Greedy", "dsa", 2, 40, q =>
            {
                q.AddQuestion("Tư tưởng cốt lõi của thuật toán tham lam (Greedy) là gì?", new[] { "Thử mọi phương án rồi chọn phương án tốt nhất", "Tại mỗi bước chọn phương án tốt nhất cục bộ và không quay lui", "Chia bài toán thành các bài toán con độc lập", "Ghi nhớ kết quả các bài toán con đã giải" }, 1, "Tham lam ra quyết định tối ưu cục bộ ngay mỗi bước và giữ nguyên quyết định, hy vọng đạt tối ưu toàn cục.");
                q.AddQuestion("Hai tính chất cần có để một chiến lược tham lam chứng minh được là đúng?", new[] { "Tính chất lựa chọn tham lam và cấu trúc con tối ưu", "Tính ổn định và khả năng quay lui", "Tính đơn điệu và tính giao hoán", "Tính chất chia để trị và cấu trúc cây đệ quy" }, 0, "Phải chứng minh luôn tồn tại lời giải tối ưu chứa lựa chọn tham lam (greedy choice property) và lời giải tối ưu chứa lời giải tối ưu của bài toán con (optimal substructure).");
                q.AddQuestion("Trong Activity Selection, hoạt động đầu tiên được chọn là hoạt động nào?", new[] { "Hoạt động bắt đầu sớm nhất", "Hoạt động kết thúc sớm nhất", "Hoạt động dài nhất", "Hoạt động ngắn nhất" }, 1, "Sắp theo thời gian kết thúc tăng dần rồi chọn hoạt động kết thúc sớm nhất — lựa chọn tham lam để lại nhiều thời gian nhất cho các hoạt động sau.");
                q.AddQuestion("Vì sao Fractional Knapsack giải được tối ưu bằng tham lam, còn 0/1 Knapsack thì không?", new[] { "Vì 0/1 Knapsack có nhiều đồ vật hơn", "Vì đồ vật trong Fractional Knapsack có thể chia nhỏ tùy ý, còn 0/1 phải lấy trọn hoặc bỏ", "Vì Fractional Knapsack không cần sắp xếp", "Vì 0/1 Knapsack không có lời giải" }, 1, "Khi đồ vật chia được, đổ đầy theo tỷ lệ giá trị/khối lượng giảm dần là tối ưu; còn 0/1 bắt buộc chọn trọn nên tham lam có thể bỏ lỡ phối hợp tốt hơn.");
                q.AddQuestion("Trong bài toán Jump Game, tại mỗi vị trí i cần cập nhật điều gì?", new[] { "Vị trí nhỏ nhất có thể đứng", "Vị trí xa nhất có thể nhảy tới từ các bước đã duyệt", "Tổng số lần nhảy đã thực hiện", "Chi phí nhảy đến vị trí i" }, 1, "Duyệt trái qua phải, mỗi bước cập nhật farthest = max(farthest, i + nums[i]); nếu farthest đủ lớn để vượt mảng thì thắng.");
                q.AddQuestion("Đổi 6 đồng bằng bộ mệnh giá {1, 3, 4}, thuật toán tham lam cho kết quả nào?", new[] { "3 đồng (3 + 3)", "3 đồng (4 + 1 + 1)", "2 đồng (4 + 2)", "2 đồng (3 + 3)" }, 1, "Tham lam lấy 4 trước rồi 1 và 1, được 3 đồng — trong khi lời giải tối ưu là 3 + 3 chỉ dùng 2 đồng, nên tham lam sai với bộ mệnh giá này.");
                q.AddQuestion("Để giải bài toán Assign Cookies, việc đầu tiên cần làm là gì?", new[] { "Gán bánh lớn nhất cho trẻ có độ tham ăn nhỏ nhất", "Sắp xếp cả độ tham ăn của trẻ và kích thước bánh", "Đếm tổng số bánh và tổng số trẻ", "Chỉ quan tâm đến trẻ có độ tham ăn lớn nhất" }, 1, "Sắp xếp cả hai mảng rồi dùng hai con trỏ, mỗi lần gán chiếc bánh nhỏ nhất vừa đủ cho từng trẻ — chuẩn greedy tối ưu.");
                q.AddQuestion("Cho 11 hoạt động (s, f): (1,4), (3,5), (0,6), (5,7), (3,9), (5,9), (6,10), (8,11), (8,12), (2,14), (12,16). Số hoạt động tối đa có thể chọn là bao nhiêu?", new[] { "3", "4", "5", "6" }, 1, "Greedy theo end: chọn (1,4), (5,7), (8,11), (12,16) — 4 hoạt động không chồng nhau, và không thể chọn được nhiều hơn.");
                q.AddQuestion("Đổi 36 đồng bằng bộ mệnh giá {1, 5, 10, 25}, tham lam dùng tối thiểu bao nhiêu đồng xu?", new[] { "3 đồng", "4 đồng", "5 đồng", "6 đồng" }, 0, "Lấy 25, còn 11; lấy 10, còn 1; lấy 1 — tổng 3 đồng (25 + 10 + 1), và đây là lời giải tối ưu vì bộ mệnh giá chuẩn.");
                q.AddQuestion("Cái túi chứa tối đa 50 đơn vị khối lượng. Có 3 đồ vật (khối lượng, giá trị): (10, 60), (20, 100), (30, 120). Fractional Knapsack thu được giá trị tối đa là bao nhiêu?", new[] { "220", "230", "240", "260" }, 2, "Tỷ lệ lần lượt 6, 5, 4: lấy đủ (10, 60) và (20, 100), lấy 20/30 của (30, 120) được 80; tổng 60 + 100 + 80 = 240.");
            });
            var qL25 = await GetOrCreate("Trắc nghiệm Interval Problems", "Kiểm tra kiến thức: Trắc nghiệm Interval Problems", "dsa", 2, 40, q =>
            {
                q.AddQuestion("Hai khoảng [a, b] và [c, d] chồng nhau khi nào?", new[] { "a ≤ d và c ≤ b", "a ≤ c và b ≤ d", "a ≥ c và b ≥ d", "a < b và c < d" }, 0, "Hai khoảng chồng nhau khi điểm bắt đầu của khoảng này không vượt quá điểm kết thúc của khoảng kia: a ≤ d và c ≤ b.");
                q.AddQuestion("Trước khi gộp các khoảng (merge intervals), việc đầu tiên phải làm là gì?", new[] { "Sắp xếp tăng dần theo điểm bắt đầu", "Sắp xếp giảm dần theo độ dài khoảng", "Loại bỏ các khoảng trùng lặp hoàn toàn", "Tính tổng độ dài tất cả khoảng" }, 0, "Sau khi sắp theo start, các khoảng chồng nhau sẽ đứng liền kề nên chỉ cần quét một lượt là gộp được hết.");
                q.AddQuestion("Với current = [1, 4] và khoảng kế tiếp [3, 6], điều kiện để gộp chúng là gì?", new[] { "4 < 3", "3 ≤ 4", "6 ≤ 4", "1 ≤ 3" }, 1, "Khoảng kế tiếp chồng lên current khi start của nó không lớn hơn end của current: 3 ≤ 4, nên gộp thành [1, 6].");
                q.AddQuestion("Hai khoảng [1, 3] và [3, 5] có được coi là chồng nhau không?", new[] { "Không, vì chúng chỉ chạm nhau tại điểm 3", "Có, vì dấu bằng trong điều kiện chồng nhau vẫn tính là chồng", "Không, vì chúng không dùng chung một điểm trong", "Có, nhưng chỉ khi cả hai có độ dài bằng nhau" }, 1, "Điều kiện chồng nhau dùng dấu ≤: 1 ≤ 5 và 3 ≤ 3 đều đúng nên [1, 3] và [3, 5] được tính là chồng nhau và gộp được.");
                q.AddQuestion("Gộp các khoảng [[1, 3], [2, 6], [8, 10], [15, 18]] cho kết quả nào?", new[] { "[[1, 6], [8, 10], [15, 18]]", "[[1, 3], [2, 6], [8, 10], [15, 18]]", "[[1, 10], [15, 18]]", "[[1, 18]]" }, 0, "[1, 3] và [2, 6] chồng nhau (2 ≤ 3) nên gộp thành [1, 6]; [8, 10] và [15, 18] không chồng với khoảng nào nên giữ nguyên.");
                q.AddQuestion("Chèn khoảng [4, 8] vào danh sách đã sắp xếp [[1, 3], [6, 9]] cho kết quả nào?", new[] { "[[1, 3], [4, 8], [6, 9]]", "[[1, 3], [4, 9]]", "[[1, 8], [6, 9]]", "[[1, 9]]" }, 1, "[4, 8] chồng với [6, 9] (6 ≤ 8) nên gộp thành [4, 9]; [1, 3] tách biệt nên kết quả là [[1, 3], [4, 9]].");
                q.AddQuestion("Cần xóa ít nhất bao nhiêu khoảng trong [[1, 2], [2, 3], [3, 4], [1, 3]] để phần còn lại không chồng nhau?", new[] { "0", "1", "2", "3" }, 1, "Sắp theo end và giữ khoảng kết thúc sớm: giữ [1, 2], [2, 3], [3, 4]; [1, 3] chồng với cả [1, 2] và [2, 3] nên bị xóa — chỉ cần xóa 1 khoảng.");
                q.AddQuestion("Các điểm trên trục số: [1, 6], [2, 8], [7, 12], [10, 16]. Cần tối thiểu bao nhiêu mũi tên để bắn trúng tất cả các điểm?", new[] { "1", "2", "3", "4" }, 1, "Sắp theo end: bắn mũi tên tại 6 trúng [1, 6] và [2, 8]; [7, 12] có start 7 > 6 nên bắn mũi tên mới tại 12, trúng cả [10, 16] — tổng 2 mũi tên.");
                q.AddQuestion("Các cuộc họp [[0, 30], [5, 10], [15, 20]] cần tối thiểu bao nhiêu phòng họp?", new[] { "1", "2", "3", "4" }, 1, "Quét sự kiện: tại thời điểm 5 có 2 cuộc họp đồng thời ([0, 30] và [5, 10]) — đây là mức chồng chéo tối đa nên cần 2 phòng.");
                q.AddQuestion("Gộp các khoảng [[1, 4], [2, 3], [3, 5]] cho kết quả nào?", new[] { "[[1, 4], [3, 5]]", "[[1, 5]]", "[[1, 3], [3, 5]]", "[[2, 5]]" }, 1, "[2, 3] nằm hoàn toàn trong [1, 4] nên end giữ nguyên 4; [3, 5] chồng (3 ≤ 4) nên end = max(4, 5) = 5; kết quả [[1, 5]] — phải dùng max(end) thay vì gán trực tiếp.");
            });
            var qL26 = await GetOrCreate("Trắc nghiệm Matrix & Grid", "Kiểm tra kiến thức: Trắc nghiệm Matrix & Grid", "dsa", 2, 40, q =>
            {
                q.AddQuestion("Trong mảng directions = [(-1,0),(1,0),(0,-1),(0,1)], cặp (0,-1) tương ứng với hướng nào?", new[] { "Lên trên", "Xuống dưới", "Sang trái", "Sang phải" }, 2, "Cặp (dr, dc) cộng vào tọa độ ô hiện tại: (0,-1) làm cột giảm đi 1 nên đi sang trái.");
                q.AddQuestion("Điều kiện đúng để ô (r, c) nằm trong lưới có M hàng và N cột?", new[] { "0 ≤ r ≤ M và 0 ≤ c ≤ N", "0 ≤ r < M và 0 ≤ c < N", "0 < r ≤ M và 0 < c ≤ N", "r ≥ 0 và c ≥ 0" }, 1, "Chỉ số hàng chạy từ 0 tới M-1 và chỉ số cột từ 0 tới N-1, nên phải dùng dấu nhỏ hơn (không lấy dấu bằng).");
                q.AddQuestion("Vai trò chính của việc đánh dấu visited trong thuật toán flood fill là gì?", new[] { "Lưu giá trị của từng ô", "Tăng tốc độ duyệt lưới", "Tránh thăm lại ô đã xử lý gây vòng lặp vô hạn hoặc đếm trùng", "So sánh kích thước các vùng" }, 2, "Không đánh dấu visited, DFS sẽ quay lại chính ô đã đi qua mãi mãi; đánh dấu cũng đảm bảo mỗi ô được xử lý đúng một lần.");
                q.AddQuestion("Trong lưới 3×3, ô (2,2) có bao nhiêu ô lân cận theo 4 hướng nằm trong biên?", new[] { "4", "3", "2", "1" }, 2, "Ô góc (2,2) chỉ có hai ô lân cận hợp lệ là (1,2) phía trên và (2,1) bên trái; hai hướng còn lại vượt biên.");
                q.AddQuestion("Xoay ma trận [[1,2],[3,4]] 90 độ theo chiều kim đồng hồ cho kết quả nào?", new[] { "[[3,1],[4,2]]", "[[1,3],[2,4]]", "[[4,2],[3,1]]", "[[2,4],[1,3]]" }, 0, "Hàng trên cùng của kết quả là cột ngoài cùng bên trái đọc từ dưới lên: 3, 1; hàng dưới là cột còn lại: 4, 2.");
                q.AddQuestion("Trong bài toán rotting oranges, vì sao dùng BFS thay vì DFS?", new[] { "BFS tiêu tốn ít bộ nhớ hơn", "BFS lan đều theo từng phút từ mọi quả hỏng cùng lúc, khớp với quy tắc lây lan theo thời gian", "DFS không thể duyệt qua các ô liền kề", "BFS luôn chạy nhanh hơn DFS trong mọi lưới" }, 1, "Mỗi phút một lớp quả hỏng mới xuất hiện, đúng với cơ chế quét theo tầng của BFS; DFS đi sâu một nhánh sẽ sai thời điểm lây lan.");
                q.AddQuestion("Khi gặp một ô đất chưa thăm trong bài đếm hòn đảo, việc làm đúng là gì?", new[] { "Chỉ tăng biến đếm rồi tiếp tục duyệt", "Tăng biến đếm và loang đánh dấu toàn bộ hòn đảo chứa ô đó", "Tăng biến đếm cho từng ô đất", "Loang nhưng không đánh dấu để dễ đếm lại" }, 1, "Mỗi ô đất chưa thăm là khởi đầu của một hòn đảo; loang và đánh dấu cả vùng giúp mỗi hòn đảo chỉ được đếm đúng một lần.");
                q.AddQuestion("Lưới 3×3 toàn bộ là ô đất (giá trị 1). Diện tích hòn đảo lớn nhất trong lưới là bao nhiêu?", new[] { "9", "6", "8", "12" }, 0, "Toàn bộ 9 ô nối liền nhau theo 4 hướng nên chỉ có một hòn đảo duy nhất, diện tích đúng bằng 9.");
                q.AddQuestion("Thứ tự duyệt xoắn ốc (spiral) của ma trận [[1,2,3],[4,5,6],[7,8,9]] là gì?", new[] { "1 2 3 6 9 8 7 4 5", "1 2 3 4 5 6 7 8 9", "1 4 7 8 9 6 3 2 5", "3 6 9 8 7 4 1 2 5" }, 0, "Quét hàng trên 1 2 3, xuống cột phải 6 9, ngược hàng dưới 8 7, lên cột trái 4, kết thúc tại ô giữa 5.");
                q.AddQuestion("Trong bài word search, vì sao phải khôi phục lại giá trị ban đầu của ô sau khi nhánh đệ quy thất bại?", new[] { "Để giảm độ phức tạp thời gian", "Để các nhánh tìm kiếm khác bắt đầu từ ô này có thể sử dụng lại nó", "Để tránh tràn bộ nhớ stack", "Để lưu lại đường đi đã đi" }, 1, "Đánh dấu tạm chỉ có giá trị trong đường đi đang thử; thất bại thì phải trả lại trạng thái ban đầu, nếu không các hướng đi khác sẽ bỏ lỡ ô này.");
            });
            var qL27 = await GetOrCreate("Trắc nghiệm Bit Manipulation & Số học", "Kiểm tra kiến thức: Trắc nghiệm Bit Manipulation & Số học", "dsa", 2, 40, q =>
            {
                q.AddQuestion("Kết quả của phép 5 & 3 là bao nhiêu?", new[] { "1", "7", "4", "6" }, 0, "5 là 0101, 3 là 0011; AND từng bit cho 0001, tức là 1.");
                q.AddQuestion("Tính chất nào sau đây luôn đúng với phép XOR?", new[] { "a ^ a = 1", "a ^ a = 0", "a ^ a = a", "a ^ a = 2a" }, 1, "Hai bit giống nhau XOR cho 0 nên a ^ a = 0; kết hợp a ^ 0 = a giúp triệt tiêu cặp trùng.");
                q.AddQuestion("Phép dịch trái x << 3 tương đương với phép toán số học nào?", new[] { "Chia nguyên x cho 3", "Nhân x với 3", "Nhân x với 8", "Cộng x với 3" }, 2, "Mỗi lần dịch trái 1 bit là nhân đôi giá trị, dịch 3 bit tương đương nhân với 2³ = 8.");
                q.AddQuestion("Cách chuẩn để kiểm tra bit thứ k (tính từ 0) của số x có bằng 1 hay không?", new[] { "x & (1 << k) bằng 0", "(x >> k) & 1", "x | (1 << k)", "x ^ (1 << k)" }, 1, "Dịch phải k bit đưa bit cần kiểm tra xuống vị trí thấp nhất, AND với 1 trả về đúng 0 hoặc 1.");
                q.AddQuestion("Mảng [2, 3, 2, 5, 3] chứa các số xuất hiện đúng hai lần ngoại trừ một số xuất hiện một lần. Số đó là?", new[] { "2", "3", "5", "6" }, 2, "XOR toàn bộ: 2^2 = 0, 3^3 = 0, còn lại 0^5 = 5 — hai phần tử trùng triệt tiêu nhau.");
                q.AddQuestion("Với x là số nguyên dương, điều kiện đúng để x là luỹ thừa của 2 là gì?", new[] { "(x & (x - 1)) === 0", "(x & (x + 1)) === 0", "(x | (x - 1)) === 0", "(x ^ (x - 1)) === 0" }, 0, "Luỹ thừa của 2 chỉ có một bit 1; x - 1 sẽ làm bit đó trở thành 0 nên x & (x - 1) triệt tiêu.");
                q.AddQuestion("Ước chung lớn nhất gcd(48, 18) tính theo thuật toán Euclid bằng bao nhiêu?", new[] { "6", "12", "18", "3" }, 0, "48 mod 18 = 12; 18 mod 12 = 6; 12 mod 6 = 0, số dư cuối khác 0 là 6 nên gcd = 6.");
                q.AddQuestion("Toggle (đảo) bit thứ 1 (tính từ 0) của số 5 (101) cho kết quả nào?", new[] { "3", "4", "7", "13" }, 2, "Toggle dùng x ^ (1 << k): 101 ^ 010 = 111, tức là 7.");
                q.AddQuestion("fastPower(2, 10, 7) — tính 2^10 rồi lấy phần dư khi chia cho 7 — trả về bao nhiêu?", new[] { "4", "3", "1", "2" }, 3, "2^10 = 1024; 1024 chia 7 được 146 dư 2, nên kết quả là 2.");
                q.AddQuestion("Sử dụng sàng Eratosthenes, có bao nhiêu số nguyên tố nhỏ hơn 20?", new[] { "9", "8", "7", "10" }, 1, "Các số nguyên tố nhỏ hơn 20 là 2, 3, 5, 7, 11, 13, 17, 19 — đếm được 8 số.");
            });
            var qL28 = await GetOrCreate("Trắc nghiệm Sắp xếp nâng cao", "Kiểm tra kiến thức: Trắc nghiệm Sắp xếp nâng cao", "sorting", 1, 40, q =>
            {
                q.AddQuestion("Độ phức tạp thời gian của Merge Sort trong trường hợp xấu nhất là gì?", new[] { "O(N)", "O(N log N)", "O(N²)", "O(log N)" }, 1, "Merge Sort luôn chẻ đôi mảng thành log(N) tầng và trộn O(N) mỗi tầng nên mọi trường hợp đều là O(N log N).");
                q.AddQuestion("Tình huống nào khiến Quick Sort suy thoái xuống O(N²)?", new[] { "Mảng chứa số âm", "Pivot luôn rơi vào phần tử biên, ví dụ mảng đã sắp xếp", "Mảng có quá ít phần tử", "Mảng chứa nhiều số trùng lặp" }, 1, "Khi pivot luôn là phần tử nhỏ nhất hoặc lớn nhất, mỗi partition chỉ loại được một phần tử nên tổng chi phí trở thành O(N²).");
                q.AddQuestion("Counting Sort thuộc nhóm thuật toán nào?", new[] { "Dựa trên so sánh cặp phần tử", "Không dựa trên so sánh", "Ngẫu nhiên hóa", "Chỉ dùng được cho chuỗi ký tự" }, 1, "Counting Sort đếm tần suất xuất hiện của từng giá trị thay vì so sánh hai phần tử với nhau.");
                q.AddQuestion("Heap Sort cần bao nhiêu bộ nhớ phụ?", new[] { "O(N)", "O(log N)", "O(1)", "O(N log N)" }, 2, "Heap Sort sắp xếp tại chỗ trên chính mảng đầu vào, chỉ dùng phép tráo đổi nên bộ nhớ phụ là O(1).");
                q.AddQuestion("Vì sao Heap Sort thực tế chạy chậm hơn Quick Sort dù cùng độ phức tạp O(N log N)?", new[] { "Heap Sort tạo nhiều mảng phụ", "Heap Sort nhảy cóc chỉ số (i sang 2i+1) gây trượt CPU cache", "Heap Sort không xử lý được mảng lớn", "Heap Sort bị giới hạn ở số nguyên" }, 1, "Thao tác nhảy cóc liên tục giữa các chỉ số khiến tỉ lệ trượt cache cao, trong khi Quick Sort duyệt mảng tuần tự liền kề.");
                q.AddQuestion("Radix Sort thường dùng thuật toán nào làm bước chia xô nội bộ cho từng chữ số?", new[] { "Quick Sort", "Counting Sort", "Merge Sort", "Insertion Sort" }, 1, "Radix Sort dùng Counting Sort vì nó ổn định (stable) — tính chất bắt buộc để giữ thứ tự của các vòng trước.");
                q.AddQuestion("Thuật toán nào sau đây KHÔNG ổn định (stable)?", new[] { "Merge Sort", "Counting Sort", "Quick Sort", "Radix Sort" }, 2, "Quick Sort không ổn định vì quá trình partition hoán đổi có thể đảo thứ tự các phần tử bằng nhau; ba thuật toán còn lại đều ổn định.");
                q.AddQuestion("Sắp xếp mảng [1, 5, 1000000000] bằng Counting Sort, mảng đếm cần khoảng bao nhiêu bộ nhớ (mỗi int 4 byte)?", new[] { "48 byte", "4 GB", "40 MB", "400 KB" }, 1, "Mảng đếm cần K + 1 phần tử với K = 1 tỷ, tức khoảng 4 tỷ byte bằng 4 GB — lãng phí cho chỉ 3 phần tử dữ liệu.");
                q.AddQuestion("Mảng [5, 4, 3, 2, 1] dùng Quick Sort Lomuto với pivot luôn là phần tử cuối, độ phức tạp thời gian là gì?", new[] { "O(N log N)", "O(N)", "O(N²)", "O(log N)" }, 2, "Pivot luôn là phần tử nhỏ nhất nên partition chia cực lệch, đệ quy sâu N tầng và tổng chi phí là O(N²).");
                q.AddQuestion("Radix Sort với mảng [170, 45, 75, 90, 802, 24, 2, 66], sau vòng sắp theo hàng đơn vị, mảng trở thành gì?", new[] { "[170, 90, 802, 2, 24, 45, 75, 66]", "[2, 24, 45, 66, 75, 90, 170, 802]", "[802, 2, 170, 90, 45, 75, 24, 66]", "[170, 45, 75, 90, 802, 24, 2, 66]" }, 0, "Xếp vào xô theo chữ số đơn vị: xô 0 có 170, 90; xô 2 có 802, 2; xô 4 có 24; xô 5 có 45, 75; xô 6 có 66 — ghép lại đúng thứ tự.");
            });
            var qL29 = await GetOrCreate("Trắc nghiệm DP cơ bản", "Kiểm tra kiến thức: Trắc nghiệm DP cơ bản", "dsa", 1, 40, q =>
            {
                q.AddQuestion("Một bài toán cần có hai đặc tính gì để áp dụng quy hoạch động?", new[] { "Đệ quy và vòng lặp", "Overlapping subproblems và optimal substructure", "Dữ liệu được sắp xếp và không trùng lặp", "Tham lam và chia để trị" }, 1, "Các bài toán con phải chồng lấn nhau (được gọi lại nhiều lần) và lời giải tối ưu phải xây dựng từ lời giải con tối ưu.");
                q.AddQuestion("Top-down memoization hoạt động theo hướng nào?", new[] { "Đệ quy từ trên xuống kèm lưu kết quả đã tính", "Lấp bảng từ các trường hợp cơ sở lên", "Sinh mọi tổ hợp rồi chọn tối ưu", "Liên tục chia đôi dữ liệu đầu vào" }, 0, "Top-down giữ cấu trúc đệ quy của bài toán gốc nhưng lưu (memoize) kết quả từng trạng thái để tái sử dụng.");
                q.AddQuestion("Công thức truy hồi đúng của dãy Fibonacci là gì?", new[] { "dp[i] = dp[i-1] + 1", "dp[i] = dp[i-1] + dp[i-2]", "dp[i] = max(dp[i-1], dp[i-2])", "dp[i] = dp[i-1] * 2" }, 1, "Mỗi số Fibonacci bằng tổng hai số đứng trước, với base dp[0] = 0 và dp[1] = 1.");
                q.AddQuestion("Trong bottom-up tabulation, bảng được lấp theo thứ tự nào?", new[] { "Từ bài toán gốc xuống các bài toán con", "Từ các trường hợp cơ sở lên bài toán gốc", "Ngẫu nhiên, miễn đủ các ô", "Chỉ lấp các ô ở vị trí chẵn" }, 1, "Bottom-up bắt đầu từ base case rồi tăng dần kích thước bài toán con để mỗi ô luôn đọc được giá trị đã tính trước đó.");
                q.AddQuestion("Leo cầu thang: mỗi bước đi được 1 hoặc 2 bậc. Số cách leo lên bậc thứ 3 là bao nhiêu?", new[] { "2", "3", "4", "5" }, 1, "Các cách leo: 1+1+1, 1+2, 2+1 — tổng cộng 3 cách, đúng bằng dp[3] = dp[2] + dp[1] = 2 + 1.");
                q.AddQuestion("House Robber với dãy nhà [2, 7, 9, 3, 1], tổng tiền trộm được tối đa là bao nhiêu?", new[] { "10", "12", "13", "15" }, 1, "Trộm nhà giá trị 2, 9 và 1: 2 + 9 + 1 = 12; dp[4] = max(dp[3], dp[2] + 1) = max(11, 12) = 12.");
                q.AddQuestion("Coin Change với các đồng xu [1, 2, 5] và amount = 11, số đồng xu tối thiểu là bao nhiêu?", new[] { "3", "4", "5", "2" }, 0, "Phương án tối ưu là 11 = 5 + 5 + 1, cần 3 đồng; không thể ít hơn vì đồng xu lớn nhất chỉ là 5.");
                q.AddQuestion("Đệ quy ngây thơ tính Fibonacci không dùng memoization có độ phức tạp thời gian là gì?", new[] { "O(N)", "O(log N)", "O(2^N)", "O(N²)" }, 2, "Mỗi lần gọi lại rẽ nhánh thành hai lần gọi nhỏ hơn nên tổng số lần gọi tăng theo cấp số nhân O(2^N).");
                q.AddQuestion("House Robber với dãy nhà [3, 1, 1, 3] cho kết quả tối ưu là bao nhiêu?", new[] { "6", "5", "4", "7" }, 0, "dp: 3 → max(3,1) = 3 → max(3, 3+1) = 4 → max(4, 3+3) = 6; trộm nhà đầu và nhà cuối.");
                q.AddQuestion("Với giá cổ phiếu [7, 1, 5, 3, 6, 4], lợi nhuận tối đa khi mua rồi bán một lần là bao nhiêu?", new[] { "5", "6", "4", "3" }, 0, "Mua ngày thứ hai với giá 1 và bán ngày thứ năm với giá 6: lợi nhuận 6 - 1 = 5, không phương án nào tốt hơn.");
            });
            var qL30 = await GetOrCreate("Trắc nghiệm DP nâng cao", "Kiểm tra kiến thức: Trắc nghiệm DP nâng cao", "dsa", 1, 40, q =>
            {
                q.AddQuestion("Công thức truy hồi đúng của Knapsack 0/1 với món i và sức chứa w là gì?", new[] { "dp[i][w] = max(dp[i-1][w], dp[i-1][w - wi] + vi)", "dp[i][w] = dp[i-1][w] + dp[i][w-1]", "dp[i][w] = dp[i][w - wi] + vi", "dp[i][w] = max(dp[i][w-1], dp[i-1][w])" }, 0, "Với mỗi món ta chọn giữa bỏ qua (giữ dp[i-1][w]) hoặc lấy món (cộng giá trị vi vào dp[i-1][w - wi]).");
                q.AddQuestion("Trong LCS, khi hai ký tự khớp nhau, ô dp[i][j] được tính như thế nào?", new[] { "dp[i-1][j] + 1", "dp[i-1][j-1] + 1", "max(dp[i-1][j], dp[i][j-1])", "dp[i][j-1] + 1" }, 1, "Khi ký tự khớp, độ dài chuỗi con chung tăng thêm 1 so với ô đường chéo dp[i-1][j-1].");
                q.AddQuestion("Edit Distance cho phép ba phép toán nào trên chuỗi?", new[] { "Chèn, xóa, thay thế ký tự", "Hoán đổi, xoay, dịch chuyển", "Cộng, nhân, chia", "Trộn, tách, nhân đôi" }, 0, "Ba phép biến đổi cơ bản của Edit Distance là insert (chèn), delete (xóa) và replace (thay thế), mỗi phép tốn chi phí 1.");
                q.AddQuestion("Trong Unique Paths, giá trị khởi tạo của hàng đầu tiên và cột đầu tiên là gì?", new[] { "0", "1", "Tổng kích thước lưới", "Vô cực" }, 1, "Chỉ có đúng một cách di chuyển dọc theo hàng đầu hoặc cột đầu nên mọi ô ở đó đều bằng 1.");
                q.AddQuestion("Độ dài LCS của hai chuỗi ABCBDAB và BDCABA là bao nhiêu?", new[] { "3", "4", "5", "6" }, 1, "Dãy con chung dài nhất là BDAB, độ dài 4 — lấp bảng LCS cho kết quả dp[7][6] = 4.");
                q.AddQuestion("Knapsack 0/1 sức chứa 5 với các món (trọng lượng, giá trị): (2,3), (3,4), (4,5), (5,6). Giá trị tối ưu là bao nhiêu?", new[] { "6", "7", "9", "8" }, 1, "Chọn món (2,3) và (3,4): tổng trọng lượng 5, tổng giá trị 3 + 4 = 7, cao hơn món (5,6) đơn lẻ là 6.");
                q.AddQuestion("Khác biệt chính giữa Unbounded Knapsack và Knapsack 0/1 là gì?", new[] { "Mỗi món có thể được chọn lại không giới hạn", "Không có giới hạn sức chứa", "Chỉ chấp nhận trọng lượng chẵn", "Giá trị bắt buộc bằng trọng lượng" }, 0, "Unbounded cho phép tái sử dụng cùng một món nhiều lần, do đó truy hồi đọc chính hàng hiện tại thay vì hàng trước.");
                q.AddQuestion("Edit Distance giữa hai chuỗi kitten và sitting là bao nhiêu?", new[] { "3", "4", "5", "6" }, 0, "Ba phép biến đổi: thay k thành s, thay e thành i, và chèn g vào cuối — tổng chi phí 3.");
                q.AddQuestion("Robot đi từ ô (0,0) đến ô (2,6) chỉ được sang phải hoặc xuống dưới, có bao nhiêu đường đi khác nhau?", new[] { "18", "21", "28", "35" }, 2, "Lưới 3×7, số đường đi là tổ hợp C(3+7-2, 3-1) = C(8, 2) = 28.");
                q.AddQuestion("Khi nén Knapsack 0/1 xuống còn một mảng 1D, tại sao phải duyệt capacity theo chiều giảm dần?", new[] { "Để mỗi món chỉ được chọn tối đa một lần", "Để tăng tốc truy cập bộ nhớ", "Để ưu tiên những món nhẹ hơn", "Để tránh tràn số nguyên" }, 0, "Nếu duyệt tăng dần, giá trị vừa ghi đè sẽ được tái sử dụng trong cùng vòng lặp khiến một món bị chọn nhiều lần — biến bài toán thành unbounded.");
            });
            var qL31 = await GetOrCreate("Trắc nghiệm Đường đi ngắn nhất", "Kiểm tra kiến thức: Trắc nghiệm Đường đi ngắn nhất", "graph", 2, 40, q =>
            {
                q.AddQuestion("BFS có thể tìm đường đi ngắn nhất chính xác trong trường hợp nào?", new[] { "Đồ thị không trọng số (mọi cạnh nặng 1)", "Đồ thị có trọng số dương bất kỳ", "Đồ thị có cạnh âm", "Đồ thị có chu trình âm" }, 0, "BFS ngầm coi mọi cạnh nặng 1 nên chỉ đúng khi các cạnh bằng nhau; hàng đợi FIFO bảo đảm đỉnh gần nhất được thăm trước, tìm được đường ít cạnh nhất.");
                q.AddQuestion("Cấu trúc dữ liệu nào giúp Dijkstra luôn chọn được đỉnh gần nhất ở mỗi bước?", new[] { "Hàng đợi FIFO", "Ngăn xếp", "Min-heap (hàng đợi ưu tiên)", "Bảng băm" }, 2, "Min-heap trả về phần tử nhỏ nhất trong O(log V), giúp Dijkstra chốt đỉnh có dist nhỏ nhất ở mỗi vòng lặp.");
                q.AddQuestion("Phép nới lỏng cạnh (relaxation) trong Dijkstra nghĩa là gì?", new[] { "Xóa cạnh có trọng số lớn nhất", "Cập nhật dist[v] nếu dist[u] + w(u,v) nhỏ hơn giá trị đang có", "Đổi hướng cạnh ngược lại", "Cộng thêm trọng số vào mọi đỉnh" }, 1, "Relaxation so sánh đường mới qua u với kỷ lục cũ của v; nếu ngắn hơn thì ghi đè dist[v], đây là linh hồn của thuật toán.");
                q.AddQuestion("Điểm mạnh riêng của Bellman-Ford so với Dijkstra là gì?", new[] { "Chạy nhanh hơn trên đồ thị lớn", "Chấp nhận cạnh trọng số âm và phát hiện chu trình âm", "Không cần khởi tạo mảng dist", "Chỉ làm việc với đồ thị vô hướng" }, 1, "Bellman-Ford nới lỏng toàn bộ E cạnh trong V-1 vòng nên vẫn đúng với cạnh âm; vòng thứ V dùng để phát hiện chu trình âm.");
                q.AddQuestion("Vì sao Dijkstra cho kết quả sai khi đồ thị có cạnh âm?", new[] { "Vì heap không sắp xếp được số âm", "Vì nó chốt đỉnh là tối ưu ngay khi rút khỏi heap, trong khi cạnh âm có thể rút ngắn đường sau đó", "Vì phép nới lỏng chỉ cộng không trừ", "Vì cần duyệt mảng thay vì heap" }, 1, "Dijkstra tham lam chốt đỉnh khi rút khỏi heap và tin không còn đường ngắn hơn; cạnh âm xuất hiện sau có thể hạ dist của đỉnh đã chốt nên đáp án sai.");
                q.AddQuestion("Bellman-Ford phát hiện negative cycle (chu trình âm) bằng cách nào?", new[] { "So sánh số đỉnh trong chu trình", "Chạy thêm vòng lặp thứ V: nếu còn cạnh nới lỏng được thì có chu trình âm", "Đếm số lần cập nhật dist của mỗi đỉnh", "Dùng BFS dự phòng" }, 1, "Sau V-1 vòng, mọi đường đi đơn giản đã tối ưu; nếu vòng thứ V vẫn nới lỏng được tức tồn tại chu trình khiến dist giảm vô hạn.");
                q.AddQuestion("Floyd-Warshall khác Dijkstra ở điểm cốt lõi nào?", new[] { "Chỉ chạy trên đồ thị không có cạnh", "Trả về khoảng cách ngắn nhất giữa MỌI cặp đỉnh bằng quy hoạch động", "Không cần lưu trọng số", "Chạy nhanh hơn O(V²) cho đồ thị dày" }, 1, "Floyd dùng ba vòng lặp với đỉnh trung gian k để cập nhật dist[i][j] cho mọi cặp (i,j), nên trả về all-pairs trong O(V³).");
                q.AddQuestion("Đồ thị có các cạnh A-B = 4, A-C = 2, C-E = 3, E-D = 4, B-D = 10. Chạy Dijkstra từ A, khoảng cách ngắn nhất tới D là bao nhiêu?", new[] { "10", "14", "9", "12" }, 2, "A→C = 2, C→E = 5, E→D = 9; đường A→B→D = 14 dài hơn nên dist[D] = 9 sau khi nới lỏng qua E.");
                q.AddQuestion("Đồ thị có cạnh âm nhưng không có chu trình âm. Thuật toán nào sau đây vẫn cho kết quả chính xác?", new[] { "BFS", "Dijkstra", "Bellman-Ford", "Cả BFS và Dijkstra" }, 2, "BFS coi mọi cạnh nặng 1, Dijkstra sai với cạnh âm; chỉ Bellman-Ford chấp nhận cạnh âm miễn không có chu trình âm.");
                q.AddQuestion("Đồ thị tồn tại chu trình âm. Bellman-Ford sẽ phản hồi như thế nào?", new[] { "Vẫn trả về đáp án đúng như Dijkstra", "Báo tồn tại chu trình âm và kết luận không có đường đi ngắn nhất hữu hạn", "Tự động loại bỏ cạnh âm rồi chạy tiếp", "Chuyển sang dùng Floyd-Warshall" }, 1, "Khi còn cạnh nới lỏng được ở vòng thứ V, chu trình âm làm khoảng cách giảm vô hạn nên đáp án không xác định; thuật toán chỉ phát hiện và báo lỗi.");
            });
            var qL32 = await GetOrCreate("Trắc nghiệm MST", "Kiểm tra kiến thức: Trắc nghiệm MST", "graph", 2, 40, q =>
            {
                q.AddQuestion("Cây khung nhỏ nhất (MST) là gì?", new[] { "Tập cạnh nối mọi đỉnh, không chu trình, có tổng trọng số nhỏ nhất", "Đường đi ngắn nhất giữa hai đỉnh bất kỳ", "Đồ thị con chứa đúng một nửa số cạnh", "Tập cạnh có tổng trọng số lớn nhất" }, 0, "MST là cây khung (đủ V đỉnh, V-1 cạnh, liên thông, không chu trình) có tổng trọng số tối thiểu.");
                q.AddQuestion("MST của đồ thị có V đỉnh chứa bao nhiêu cạnh?", new[] { "V", "V-1", "V+1", "2V" }, 1, "Mọi cây có V đỉnh đều có đúng V-1 cạnh; thêm một cạnh bất kỳ sẽ tạo ra chu trình.");
                q.AddQuestion("Ý tưởng chính của thuật toán Kruskal là gì?", new[] { "Xuất phát từ một đỉnh rồi lan dần ra", "Sắp xếp cạnh theo trọng số tăng dần và chọn cạnh không tạo chu trình", "Chạy BFS từ đỉnh có bậc cao nhất", "Chia đồ thị thành hai phần bằng nhau" }, 1, "Kruskal duyệt cạnh đã sắp xếp tăng dần, giữ cạnh nối hai thành phần khác nhau (kiểm tra bằng Union-Find) tới khi đủ V-1 cạnh.");
                q.AddQuestion("Cấu trúc dữ liệu nào hỗ trợ Kruskal kiểm tra cạnh có tạo chu trình hay không?", new[] { "Min-heap", "Bảng băm", "Union-Find", "Hàng đợi FIFO" }, 2, "Union-Find trả lời hai đầu cạnh có cùng tập hay không trong O(α(N)); nếu khác tập thì cạnh an toàn và được gộp lại.");
                q.AddQuestion("Prim giống Dijkstra nhưng khác nhau ở tiêu chí cập nhật nào?", new[] { "Prim dùng stack, Dijkstra dùng queue", "Prim cập nhật dist theo cạnh nhẹ nhất nối tới cây, Dijkstra theo tổng khoảng cách từ nguồn", "Prim chỉ chạy trên đồ thị có hướng", "Prim không cần mảng visited" }, 1, "Cả hai đều chọn đỉnh nhỏ nhất từ heap, nhưng dist của Prim là trọng số cạnh nhẹ nhất tới cây, còn dist của Dijkstra là tổng từ đỉnh nguồn.");
                q.AddQuestion("Với đồ thị dày đặc (E gần bằng V²), thuật toán nào phù hợp hơn?", new[] { "Kruskal", "Prim", "Bellman-Ford", "Floyd-Warshall" }, 1, "Prim với heap chạy O(E log V); khi E ≈ V² thì log V nhỏ hơn log E nên Prim nhỉnh hơn Kruskal O(E log E).");
                q.AddQuestion("Cut property (tính chất lát cắt) phát biểu như thế nào?", new[] { "Cạnh dài nhất băng qua lát cắt luôn bị loại", "Cạnh nhẹ nhất băng qua một lát cắt bất kỳ luôn thuộc một MST nào đó", "MST luôn chứa mọi cạnh của đồ thị", "Mọi cây khung đều có cùng trọng số" }, 1, "Nếu cạnh nhẹ nhất qua lát cắt không nằm trong MST, thay cạnh khác qua lát cắt bằng nó sẽ ra cây nhỏ hơn — mâu thuẫn; tính chất này bảo đảm tính đúng của Kruskal và Prim.");
                q.AddQuestion("Đồ thị 4 đỉnh A, B, C, D có cạnh AB = 1, BC = 2, CD = 3, DA = 4, AC = 5. Tổng trọng số của MST là bao nhiêu?", new[] { "6", "10", "11", "15" }, 0, "Kruskal chọn AB(1), BC(2), CD(3); DA(4) và AC(5) đều tạo chu trình nên bị bỏ; tổng trọng số = 1 + 2 + 3 = 6.");
                q.AddQuestion("Đồ thị không liên thông, Kruskal chạy tới hết cạnh nhưng chưa đủ V-1 cạnh. Kết luận đúng là gì?", new[] { "Đồ thị có nhiều MST", "Không tồn tại MST vì không thể nối mọi đỉnh", "MST có ít hơn V-1 cạnh là bình thường", "Phải chạy thêm Prim để bù" }, 1, "MST yêu cầu nối mọi đỉnh; đồ thị không liên thông không thể có cây khung, Kruskal chỉ tạo được một rừng cây.");
                q.AddQuestion("Với đồ thị 4 đỉnh ở trên, cạnh nào bị bỏ qua đầu tiên vì tạo chu trình khi chạy Kruskal?", new[] { "AB", "CD", "DA", "AC" }, 2, "Sau khi thêm AB(1), BC(2), CD(3), xét DA(4): D và A đã cùng thành phần qua đường D-C-B-A nên bị bỏ trước; AC(5) bị bỏ sau đó.");
            });
            var qL33 = await GetOrCreate("Trắc nghiệm Union-Find", "Kiểm tra kiến thức: Trắc nghiệm Union-Find", "dsa", 2, 40, q =>
            {
                q.AddQuestion("Hai thao tác cốt lõi của Union-Find là gì?", new[] { "Push và Pop", "Find và Union", "Insert và Delete", "Search và Sort" }, 1, "Find(x) trả về gốc đại diện của tập chứa x; Union(x, y) gộp hai tập chứa x và y thành một tập.");
                q.AddQuestion("Path compression (nén đường) làm gì khi gọi Find(x)?", new[] { "Tăng chiều cao của cây", "Trỏ thẳng mọi node trên đường đi về gốc để lần sau tìm nhanh hơn", "Xóa toàn bộ tập chứa x", "Hoán đổi gốc với node lá" }, 1, "Khi leo tới gốc, thuật toán gán parent của mọi node trên đường đi cho chính gốc, rút ngắn chuỗi cha từ O(N) xuống gần 1 bước.");
                q.AddQuestion("Union by rank (gộp theo hạng) có tác dụng gì?", new[] { "Luôn treo cây thấp hơn dưới cây cao hơn để giữ cây cân bằng", "Sắp xếp các tập theo kích thước", "Đếm số phần tử trong tập", "Loại bỏ các cạnh trùng nhau" }, 0, "Treo gốc của cây thấp hơn làm con của gốc cây cao hơn giữ chiều cao cây ở mức O(log N) ngay cả khi chưa nén đường.");
                q.AddQuestion("Kết hợp path compression và union by rank, độ phức tạp mỗi thao tác là bao nhiêu?", new[] { "O(N)", "O(log N)", "O(N log N)", "O(α(N)) ≈ O(1)" }, 3, "α là hàm nghịch đảo Ackermann; với mọi N thực tế α(N) ≤ 4 nên coi như thời gian hằng số.");
                q.AddQuestion("Trạng thái khởi tạo của mảng parent khi tạo Union-Find với N phần tử là gì?", new[] { "parent[i] = 0 với mọi i", "parent[i] = i với mọi i", "parent[i] = i - 1 với mọi i", "parent[i] = i + 1 với mọi i" }, 1, "Ban đầu mỗi phần tử là một tập riêng nên nó là gốc của chính mình: parent[i] = i.");
                q.AddQuestion("Dùng Union-Find phát hiện chu trình trong đồ thị vô hướng trong trường hợp nào?", new[] { "Khi Find(u) khác Find(v) trong phép union(u, v)", "Khi Find(u) bằng Find(v) trước khi gộp union(u, v)", "Khi số đỉnh lớn hơn số cạnh", "Khi rank của hai gốc bằng nhau" }, 1, "Nếu hai đầu cạnh đã cùng tập nghĩa là đã có đường nối giữa chúng; thêm cạnh này sẽ tạo chu trình — union trả về false.");
                q.AddQuestion("Bài toán nào sau đây KHÔNG phù hợp để dùng Union-Find?", new[] { "Đếm thành phần liên thông", "Thuật toán Kruskal", "Tìm đường đi ngắn nhất đơn nguồn", "Số tỉnh kết nối (Number of Provinces)" }, 2, "Đường đi ngắn nhất cần tổng trọng số nhỏ nhất nên dùng Dijkstra hoặc Bellman-Ford; Union-Find chỉ trả lời câu hỏi kết nối.");
                q.AddQuestion("Union-Find với 5 phần tử 0..4, thực hiện Union(0,1), Union(2,3), Union(0,3). Còn lại bao nhiêu thành phần liên thông?", new[] { "1", "2", "3", "4" }, 1, "{0,1,2,3} gộp thành một thành phần nhờ các lệnh union, còn 4 đứng riêng nên tổng cộng còn 2 thành phần.");
                q.AddQuestion("Redundant Connection: đồ thị vô hướng 3 đỉnh với các cạnh [1,2], [2,3], [3,1]. Cạnh nào tạo ra chu trình?", new[] { "[1,2]", "[2,3]", "[3,1]", "Không cạnh nào" }, 2, "Union(1,2) và Union(2,3) gộp ba đỉnh về một tập; tới [3,1], Find(3) bằng Find(1) nên cạnh này tạo chu trình và bị đánh dấu thừa.");
                q.AddQuestion("Sau Union(0,1) rồi Union(1,2) với union by rank (rank khởi tạo đều bằng 0), parent[2] có giá trị bao nhiêu?", new[] { "0", "1", "2", "Không xác định" }, 0, "Union(0,1): rank bằng nhau nên gắn parent[1] = 0 và rank[0] = 1. Union(1,2): rank[0] = 1 lớn hơn rank[2] = 0 nên gắn parent[2] = 0.");
            });
            var qL34 = await GetOrCreate("Trắc nghiệm Trie", "Kiểm tra kiến thức: Trắc nghiệm Trie", "dsa", 2, 40, q =>
            {
                q.AddQuestion("Trie (cây tiền tố) được thiết kế để giải quyết tốt nhất bài toán nào?", new[] { "Tìm kiếm từ chính xác trong từ điển cố định", "Truy vấn các từ theo tiền tố và autocomplete", "Sắp xếp mảng số nguyên", "Tìm đường đi ngắn nhất trên đồ thị" }, 1, "Trie cho phép tìm mọi từ bắt đầu bằng một tiền tố trong O(L), điều mà hash set không làm được.");
                q.AddQuestion("Trong Trie, mỗi node đại diện cho điều gì?", new[] { "Một từ hoàn chỉnh", "Một ký tự duy nhất", "Một tiền tố bất kỳ", "Một bảng băm" }, 1, "Mỗi node lưu một ký tự; chuỗi ký tự dọc đường đi từ gốc tới node đó chính là tiền tố.");
                q.AddQuestion("Ý nghĩa của cờ isEnd trong node Trie là gì?", new[] { "Đánh dấu node gốc của cây", "Đánh dấu nơi kết thúc một từ hợp lệ", "Đếm số ký tự trong từ dài nhất", "Lưu tần suất xuất hiện của từ" }, 1, "isEnd = true cho biết đường đi tới node này tạo thành một từ hoàn chỉnh, phân biệt từ thật sự với tiền tố.");
                q.AddQuestion("Độ phức tạp thời gian của thao tác insert một chuỗi độ dài L vào Trie là bao nhiêu?", new[] { "O(1)", "O(L)", "O(L log L)", "O(N × L) với N là số từ đã có" }, 1, "Insert chỉ đi xuống cây theo từng ký tự nên mất đúng O(L), không phụ thuộc số từ đã chèn.");
                q.AddQuestion("Nhược điểm chính của Trie so với hash set là gì?", new[] { "Tìm kiếm chậm hơn nhiều lần", "Tốn bộ nhớ hơn vì mỗi node giữ cấu trúc children", "Không lưu được chuỗi dài", "Không thể xóa từ" }, 1, "Mỗi node mang một children (mảng hoặc bảng băm) nên chi phí bộ nhớ cao hơn hash set, nhất là khi ít tiền tố dùng chung.");
                q.AddQuestion("Từ điển gồm app và apple. Kết quả của search('ap') là gì?", new[] { "true", "false", "true vì ap khớp tiền tố", "Lỗi vì ap không nằm trong từ điển" }, 1, "Đường đi a-p-p tồn tại nhưng node cuối không có isEnd vì 'ap' không phải từ hoàn chỉnh, nên search trả false.");
                q.AddQuestion("Với hash set thông thường, muốn tìm mọi từ bắt đầu bằng prefix 'ab' thì phải làm gì?", new[] { "Duyệt toàn bộ tập hợp O(N) và so sánh từng từ", "Dùng phép băm truy vấn trong O(1)", "Không thể thực hiện được trong mọi trường hợp", "Sắp xếp tập hợp rồi dùng tìm kiếm nhị phân" }, 0, "Hash set không hỗ trợ truy vấn tiền tố nên phải duyệt hết N từ, trong khi Trie chỉ mất O(L).");
                q.AddQuestion("Lần lượt insert các từ cat, car, dog vào Trie rỗng. Tổng số node của cây (kể cả gốc) là bao nhiêu?", new[] { "7", "8", "9", "10" }, 1, "cat tạo 3 node; car dùng chung c và a rồi thêm 1 node r; dog tạo thêm 3 node; cộng gốc: 1 + 3 + 1 + 3 = 8.");
                q.AddQuestion("Trie hiện chứa đúng từ app. Kết quả của search('apple') là gì?", new[] { "true vì app là tiền tố của apple", "false vì đường đi a-p-p-l-e không tồn tại", "true vì đủ ba ký tự a-p-p", "Lỗi vì apple dài hơn app" }, 1, "Search yêu cầu từng ký tự đều có node; trie chỉ có đến node 'p' thứ hai, thiếu l và e nên findNode trả null và search trả false.");
                q.AddQuestion("Autocomplete với prefix 'car' trên một Trie lớn (N từ) chạy trong thời gian bao lâu?", new[] { "O(K) với K là số gợi ý", "O(L + K) với L là độ dài prefix", "O(N) với N là tổng số từ", "O(N × L)" }, 1, "Mất O(L) để đi tới node cuối của prefix rồi O(K) thu thập gợi ý bằng duyệt DFS nhánh con, không phụ thuộc tổng số từ.");
            });
            var qL35 = await GetOrCreate("Trắc nghiệm Segment Tree", "Kiểm tra kiến thức: Trắc nghiệm Segment Tree", "dsa", 2, 40, q =>
            {
                q.AddQuestion("Mỗi node của Segment Tree lưu trữ thông tin gì?", new[] { "Một phần tử duy nhất của mảng", "Giá trị tổng hợp (tổng, min, max...) của một đoạn mảng con", "Chỉ số của phần tử lớn nhất", "Con trỏ tới node cha" }, 1, "Mỗi node quản lý một đoạn [l, r] và lưu giá trị tổng hợp của đoạn đó; chỉ node lá mới lưu đúng một phần tử.");
                q.AddQuestion("Node gốc của Segment Tree quản lý đoạn nào của mảng gốc?", new[] { "Đoạn [0, 0]", "Đoạn [N-1, N-1]", "Toàn bộ mảng [0, N-1]", "Nửa đầu mảng" }, 2, "Gốc đại diện cho toàn bộ mảng; các con chia đôi dần đoạn đó cho tới khi đạt node lá [i, i].");
                q.AddQuestion("Trong cách lưu Segment Tree bằng mảng, với node tại chỉ số i, node con phải nằm ở chỉ số nào?", new[] { "2i", "2i + 1", "2i + 2", "i + 1" }, 2, "Cách lưu giống heap: con trái ở 2i + 1, con phải ở 2i + 2, cha ở (i - 1) chia 2.");
                q.AddQuestion("Thời gian xây dựng (build) một Segment Tree từ mảng N phần tử là bao nhiêu?", new[] { "O(1)", "O(log N)", "O(N)", "O(N log N)" }, 2, "Build đệ quy thăm đúng một lần mỗi node của cây (khoảng 2N node) nên tốn O(N).");
                q.AddQuestion("Trong thao tác query, khi đoạn [start, end] của node nằm gọn hoàn toàn trong [l, r] thì làm gì?", new[] { "Trả về 0", "Trả nguyên tree[node]", "Đệ quy cả hai con", "Trả về giá trị trung hòa" }, 1, "Nếu đoạn node nằm gọn trong đoạn cần truy vấn, toàn bộ giá trị của nó được dùng, không cần đi sâu thêm.");
                q.AddQuestion("Khi nào nên chọn Segment Tree thay vì Fenwick Tree?", new[] { "Chỉ cần tổng đoạn và cập nhật điểm", "Cần truy vấn min/max đoạn hoặc cập nhật cả đoạn", "Cần bộ nhớ tối thiểu", "Chỉ cần tính tổng tiền tố" }, 1, "Fenwick không hỗ trợ min/max (phép toán không khả nghịch) và không cập nhật đoạn; hai việc này chỉ Segment Tree đảm nhận được.");
                q.AddQuestion("Lazy propagation được dùng trong tình huống nào?", new[] { "Cập nhật một điểm duy nhất", "Cập nhật đồng thời một đoạn [l, r]", "Xây dựng cây lần đầu", "Tìm kiếm nhị phân trên mảng" }, 1, "Lazy trì hoãn việc ghi giá trị xuống từng phần tử: chỉ sửa node nằm gọn và ghi nợ cho con, giúp cập nhật đoạn chỉ còn O(log N).");
                q.AddQuestion("Cho mảng [1, 3, 5, 7, 9, 11]. Truy vấn tổng đoạn [1, 3] trên Segment Tree cho kết quả bao nhiêu?", new[] { "12", "15", "16", "24" }, 1, "Tổng các phần tử tại chỉ số 1, 2, 3 là 3 + 5 + 7 = 15; query chỉ ghép các node nằm gọn trong [1, 3].");
                q.AddQuestion("Với mảng [1, 3, 5, 7, 9, 11], sau khi update(2, 8) (đặt arr[2] = 8), tổng đoạn [0, 2] trở thành bao nhiêu?", new[] { "9", "11", "12", "14" }, 2, "Mảng trở thành [1, 3, 8, 7, 9, 11]; tổng [0, 2] = 1 + 3 + 8 = 12, các node cha trên đường đi được tính lại.");
                q.AddQuestion("Cây đoạn tổng cho mảng [1, 3, 5, 7, 9, 11] có gốc bằng 36. Dùng lazy propagation để cộng 10 vào toàn bộ đoạn [0, 5] thì node gốc trở thành bao nhiêu?", new[] { "46", "56", "96", "66" }, 2, "Node gốc nằm gọn trong [0, 5] nên chỉ cập nhật gốc: 36 + 10 × 6 = 96, và ghi nợ lazy cho hai con, không chạm vào từng phần tử.");
            });
            var qL36 = await GetOrCreate("Trắc nghiệm Fenwick Tree", "Kiểm tra kiến thức: Trắc nghiệm Fenwick Tree", "dsa", 2, 40, q =>
            {
                q.AddQuestion("Fenwick Tree (BIT) được thiết kế để hỗ trợ chính xác cặp thao tác nào?", new[] { "Truy vấn min đoạn và cập nhật đoạn", "Tính tổng tiền tố và cập nhật điểm", "Sắp xếp mảng và tìm kiếm nhị phân", "Duyệt cây theo chiều sâu" }, 1, "BIT gồm hai thao tác cốt lõi: PrefixSum (tổng tiền tố) và Update (cập nhật điểm), cả hai đều O(log N).");
                q.AddQuestion("Phép toán lowbit(i) được tính bằng biểu thức nào?", new[] { "i & (i - 1)", "i & (-i)", "i | (-i)", "i ^ (i - 1)" }, 1, "i & (-i) trả về bit 1 nhỏ nhất của i; đây là phép toán nền tảng giúp BIT xác định đoạn mỗi node quản lý.");
                q.AddQuestion("lowbit(12) bằng bao nhiêu (12 có biểu diễn nhị phân 1100)?", new[] { "2", "4", "8", "12" }, 1, "12 & (-12) = 1100 & 0100 = 0100 = 4; bit 1 nhỏ nhất của 12 nằm ở vị trí có trọng số 4.");
                q.AddQuestion("Mảng tree của Fenwick Tree được đánh chỉ số như thế nào?", new[] { "Từ 0 giống mảng thường", "Từ 1 (1-indexed)", "Từ -1", "Chỉ số tùy ý do lập trình viên chọn" }, 1, "BIT dùng mảng 1-indexed: tree[i] quản lý đoạn kết thúc tại i; khi dùng phải cộng 1 để chuyển từ 0-indexed.");
                q.AddQuestion("Trên BIT của mảng [1, 3, 5, 7, 9, 11], PrefixSum(5) (tổng từ đầu tới arr[5]) bằng bao nhiêu?", new[] { "20", "25", "30", "36" }, 3, "Bắt đầu ở node 6: tree[6] = 20, lùi lowbit(6) = 2 về node 4: tree[4] = 16, tổng là 36 — bằng 1+3+5+7+9+11.");
                q.AddQuestion("Tổng đoạn [l, r] trên Fenwick Tree được tính bằng công thức nào?", new[] { "PrefixSum(l) + PrefixSum(r)", "PrefixSum(r) - PrefixSum(l - 1)", "PrefixSum(r) - PrefixSum(l)", "PrefixSum(l) - PrefixSum(r)" }, 1, "Vì phép cộng khả nghịch, tổng đoạn [l, r] bằng tổng tiền tố tới r trừ tổng tiền tố tới l - 1.");
                q.AddQuestion("Vì sao Fenwick Tree không hỗ trợ truy vấn min/max đoạn như Segment Tree?", new[] { "Vì phép min không khả nghịch nên không thể trừ bỏ phần ngoài đoạn", "Vì BIT lưu dữ liệu không sắp xếp", "Vì BIT dùng quá nhiều bộ nhớ", "Vì phép min chậm hơn phép cộng" }, 0, "Range sum cần trừ tổng tiền tố l - 1; min(a, b) không có phép trừ tương ứng nên không thể loại bỏ phần ngoài đoạn, phải dùng Segment Tree.");
                q.AddQuestion("Trên BIT đã build cho mảng [1, 3, 5, 7, 9, 11], thực hiện update(2, +3) (arr[2] += 3). PrefixSum(3) sau đó bằng bao nhiêu?", new[] { "16", "17", "19", "22" }, 2, "arr trở thành [1, 3, 8, 7, 9, 11]; PrefixSum(3) = 1 + 3 + 8 + 7 = 19, phù hợp với việc tree[3] và tree[4] được cộng thêm 3.");
                q.AddQuestion("Dùng BIT đếm số cặp nghịch thế của mảng [3, 1, 2]. Kết quả là bao nhiêu?", new[] { "1", "2", "3", "4" }, 1, "Các cặp nghịch thế là (3, 1) và (3, 2); duyệt từ phải sang trái, mỗi lần đếm số phần tử nhỏ hơn đã chèn vào BIT.");
                q.AddQuestion("Với BIT kích thước N = 8, cập nhật tại vị trí 0 (chỉ số 1 sau khi chuyển đổi) sẽ chạm vào những node nào?", new[] { "tree[1] và tree[2]", "tree[1], tree[2], tree[4], tree[8]", "tree[1] duy nhất", "tree[0], tree[1], tree[2]" }, 1, "Nhảy tiến theo lowbit: 1 → 2 → 4 → 8 rồi dừng vì vượt N; các node này đều chứa vị trí 1 trong đoạn quản lý.");
            });
            var qL37 = await GetOrCreate("Trắc nghiệm Thuật toán chuỗi nâng cao", "Kiểm tra kiến thức: Trắc nghiệm Thuật toán chuỗi nâng cao", "dsa", 2, 40, q =>
            {
                q.AddQuestion("Cách so khớp mẫu ngây thơ (naive) có độ phức tạp xấu nhất là gì?", new[] { "O(n+m)", "O(n×m)", "O(n log m)", "O(m log n)" }, 1, "Naive thử mọi vị trí bắt đầu trong n-m+1 khả năng, mỗi lần so đến m ký tự, nên xấu nhất là O(n×m).");
                q.AddQuestion("Bảng LPS trong KMP lưu trữ thông tin gì tại mỗi vị trí i?", new[] { "Độ dài chuỗi con đối xứng dài nhất kết thúc tại i", "Độ dài tiền tố thật sự dài nhất đồng thời là hậu tố của đoạn P[0..i]", "Chỉ số ký tự tiếp theo cần so sánh trong văn bản", "Số lần P[i] xuất hiện trong văn bản T" }, 1, "LPS[i] cho biết đoạn đầu của mẫu dài bao nhiêu vẫn khớp ở cuối P[0..i], giúp dịch mẫu nhanh khi so khớp hỏng.");
                q.AddQuestion("Rabin-Karp tăng tốc việc so khớp bằng kỹ thuật nào?", new[] { "So sánh đệ quy từng ký tự", "Dùng bảng LPS để dịch mẫu", "Băm cửa sổ trượt và tính băm cửa sổ kế tiếp trong O(1)", "Dùng mảng hậu tố để truy vấn" }, 2, "Rolling hash giúp băm cửa sổ mới suy từ cửa sổ cũ chỉ với phép toán O(1), thay vì băm lại toàn bộ m ký tự.");
                q.AddQuestion("Thuật toán Manacher giải quyết bài toán nào trong O(n)?", new[] { "Tìm tiền tố chung dài nhất của hai chuỗi", "Tìm chuỗi con đối xứng dài nhất", "Đếm tần suất từng ký tự", "Tìm lần xuất hiện đầu tiên của mẫu" }, 1, "Manacher mở rộng quanh tâm và tái dùng thông tin phản chiếu, tìm palindrome dài nhất chỉ trong O(n).");
                q.AddQuestion("Bảng LPS của mẫu P = 'AABA' là gì?", new[] { "[0, 1, 0, 1]", "[1, 0, 1, 0]", "[0, 0, 1, 2]", "[0, 1, 1, 2]" }, 0, "Tại i=1 đoạn 'AA' có tiền tố 'A' trùng hậu tố 'A' nên bằng 1; tại i=3 đoạn 'AABA' khớp tiền tố-hậu tố 'A' nên bằng 1, kết quả là [0, 1, 0, 1].");
                q.AddQuestion("Tổng độ phức tạp thời gian của KMP trong trường hợp xấu nhất là bao nhiêu?", new[] { "O(n×m)", "O(n+m)", "O(n²)", "O(m²)" }, 1, "Mỗi ký tự văn bản được xét tuyến tính và con trỏ j chỉ dịch lui theo bảng LPS nên tổng công sức là O(n+m).");
                q.AddQuestion("Trong vòng lặp chính của KMP, khi T[i] khác P[j] và j > 0, ta làm gì?", new[] { "Tăng i và đặt j = 0", "Đặt j = 0 và giữ nguyên i", "Gán j = LPS[j-1] và giữ nguyên i", "Tăng cả i lẫn j" }, 2, "Phần cuối đã khớp trước đó trùng với một tiền tố của mẫu, nên ta dùng LPS để dịch mẫu mà không lùi i.");
                q.AddQuestion("Bảng LPS của mẫu P = 'ABABAB' có giá trị như thế nào?", new[] { "[0, 0, 1, 2, 3, 4]", "[0, 1, 2, 3, 4, 5]", "[1, 1, 1, 1, 1, 1]", "[0, 0, 0, 1, 2, 3]" }, 0, "Các đoạn 'AB', 'ABA', 'ABAB', 'ABABA', 'ABABAB' lần lượt có tiền tố-hậu tố dài 0, 1, 2, 3, 4 nên LPS = [0, 0, 1, 2, 3, 4].");
                q.AddQuestion("Văn bản toàn ký tự giống nhau khiến mọi băm cửa sổ của Rabin-Karp trùng nhau — độ phức tạp xấu nhất là gì?", new[] { "O(n+m)", "O(n×m)", "O(n)", "O(m)" }, 1, "Khi collision xảy ra liên tục, mỗi cửa sổ phải so sánh thật đến m ký tự, tổng cộng O(n×m).");
                q.AddQuestion("Cho văn bản T = 'AAAAA' và mẫu P = 'AA', KMP đếm được bao nhiêu vị trí xuất hiện?", new[] { "2", "3", "4", "5" }, 2, "Mẫu 'AA' xuất hiện tại các vị trí bắt đầu 0, 1, 2, 3 — tổng cộng 4 lần, các lần trùng nhau vẫn được tính.");
            });
            var qL38 = await GetOrCreate("Trắc nghiệm Cấu trúc dữ liệu nâng cao", "Kiểm tra kiến thức: Trắc nghiệm Cấu trúc dữ liệu nâng cao", "dsa", 2, 40, q =>
            {
                q.AddQuestion("Khi bộ nhớ cache LRU đầy, phần tử nào bị đuổi ra?", new[] { "Phần tử được thêm vào sớm nhất", "Phần tử ít được sử dụng gần đây nhất", "Phần tử có giá trị lớn nhất", "Phần tử được truy cập nhiều nhất" }, 1, "LRU (Least Recently Used) luôn xóa phần tử có thời điểm truy cập xa nhất trong quá khứ.");
                q.AddQuestion("Bloom Filter có thể đưa ra kết luận sai kiểu nào?", new[] { "Báo không có trong khi thực tế có", "Báo có trong khi thực tế không có", "Cả hai kiểu sai đều có thể xảy ra", "Bloom Filter không bao giờ sai" }, 1, "Các bit bật có thể là do phần tử khác gây nên, nên false positive xảy ra; còn false negative thì không thể.");
                q.AddQuestion("Điều nào sau đây KHÔNG BAO GIỜ xảy ra với Bloom Filter?", new[] { "Trả lời có cho phần tử chưa được chèn", "Trả lời không cho phần tử đã được chèn", "Gán nhiều bit bằng 1 khi chèn một phần tử", "Cần nhiều hàm băm khác nhau" }, 1, "Phần tử đã chèn chắc chắn bật đủ k bit nên truy vấn luôn trả về có; nói không cho phần tử đã tồn tại là false negative — không thể xảy ra.");
                q.AddQuestion("Skip List tìm kiếm một giá trị trung bình mất bao lâu?", new[] { "O(1)", "O(log n)", "O(n)", "O(n log n)" }, 1, "Các tầng trên giúp bỏ qua khoảng nửa số phần tử mỗi bước, nên trung bình chỉ cần O(log n) bước.");
                q.AddQuestion("Để cả thao tác lấy và chèn của LRU đều đạt O(1), ta kết hợp những cấu trúc nào?", new[] { "Bảng băm và danh sách liên kết đôi", "Mảng động và con trỏ", "Cây nhị phân và hàng đợi", "Hai ngăn xếp" }, 0, "Bảng băm tra cứu vị trí node trong O(1), danh sách liên kết đôi chèn/xóa node trong O(1) nhờ con trỏ trước-sau.");
                q.AddQuestion("Khác với LRU, LFU quyết định phần tử bị đuổi dựa trên tiêu chí gì?", new[] { "Kích thước của phần tử", "Tần suất truy cập, nếu bằng nhau thì theo thời gian gần đây", "Thứ tự nhập vào cache", "Giá trị của khóa" }, 1, "LFU đếm số lần truy cập của từng phần tử, xóa phần tử ít dùng nhất; cùng tần suất thì áp dụng quy tắc LRU để chọn.");
                q.AddQuestion("Skip List được dùng trong hệ thống thực tế nào dưới đây?", new[] { "Sorted set của Redis", "Bảng băm của Python", "Ngăn xếp của trình duyệt", "Bộ đếm tham chiếu" }, 0, "Redis dùng Skip List cho cấu trúc sorted set nhờ tìm kiếm có thứ tự O(log n) trung bình và dễ triển khai đồng bộ.");
                q.AddQuestion("Bloom Filter có m bit và k hàm băm, khi chèn một chuỗi thì bao nhiêu bit bị đặt thành 1?", new[] { "1 bit", "k bit", "m bit", "k ÷ 2 bit" }, 1, "Mỗi hàm băm cho một chỉ số, cả k hàm cùng bật k bit tương ứng trong mảng.");
                q.AddQuestion("Trong LFU, khi một phần tử ở bucket tần suất 1 được truy cập thêm một lần, ta xử lý như thế nào?", new[] { "Giữ nguyên trong bucket cũ", "Chuyển sang bucket tần suất 2", "Xóa nó khỏi cache ngay", "Đưa nó lên đầu bucket tần suất 1" }, 1, "Mỗi lần truy cập tăng tần suất lên 1, phần tử phải rời bucket cũ và nối vào cuối bucket tần suất mới.");
                q.AddQuestion("Trong Skip List, mỗi node được thăng lên tầng cao hơn với xác suất 1/2. Xác suất để một node xuất hiện ở tầng 4 (được thăng 3 lần liên tiếp) là bao nhiêu?", new[] { "1/4", "1/8", "1/16", "1/2" }, 1, "Ba lần thăng liên tiếp, mỗi lần xác suất 1/2 nên kết quả là (1/2)³ = 1/8.");
            });
            var qL39 = await GetOrCreate("Trắc nghiệm Tổng ôn DSA", "Kiểm tra kiến thức: Trắc nghiệm Tổng ôn DSA", "dsa", 2, 40, q =>
            {
                q.AddQuestion("Cần liên tục tra cứu nhanh một phần tử theo khóa, cấu trúc dữ liệu phù hợp nhất là gì?", new[] { "Hash table", "Danh sách liên kết đơn", "Ngăn xếp", "Hàng đợi" }, 0, "Hash table tra cứu theo khóa trong O(1) trung bình, nhanh nhất trong các lựa chọn trên.");
                q.AddQuestion("Cần lặp đi lặp lại thao tác lấy phần tử nhỏ nhất đang có, nên dùng cấu trúc nào?", new[] { "Mảng chưa sắp xếp", "Heap (hàng đợi ưu tiên)", "Bảng băm", "Ngăn xếp" }, 1, "Heap đưa phần tử min/max lên đầu trong O(1) và mỗi lần thêm/xóa chỉ mất O(log n).");
                q.AddQuestion("Đồ thị không trọng số, tìm đường đi ngắn nhất từ đỉnh S, thuật toán phù hợp nhất là gì?", new[] { "BFS", "Topological sort", "Backtracking", "Binary search" }, 0, "BFS mở rộng theo tầng nên lần đầu chạm tới đỉnh đích chính là đường đi ngắn nhất về số cạnh.");
                q.AddQuestion("Dữ liệu xử lý theo nguyên tắc vào trước ra trước nên dùng cấu trúc nào?", new[] { "Stack", "Queue", "Heap", "Trie" }, 1, "Queue thực thi đúng FIFO — phần tử thêm trước được lấy ra trước.");
                q.AddQuestion("Mảng đã sắp xếp tăng dần, cần tìm vị trí của một phần tử, cách nhanh nhất là gì?", new[] { "Quét tuần tự", "Binary search", "Dùng stack", "Dựng đồ thị rồi DFS" }, 1, "Binary search khai thác tính có thứ tự của mảng, chia đôi không gian tìm kiếm mỗi bước, chỉ mất O(log n).");
                q.AddQuestion("Đề yêu cầu liệt kê mọi hoán vị của một tập hợp, kỹ thuật phù hợp nhất là gì?", new[] { "Backtracking", "Two pointers", "Rolling hash", "Union-Find" }, 0, "Sinh mọi nghiệm đòi hỏi duyệt toàn bộ không gian lời giải theo kiểu thử-sai, đúng bản chất của backtracking.");
                q.AddQuestion("Cần tìm 3 phần tử lớn nhất trong mảng 1 triệu phần tử, giải pháp tiết kiệm nhất là gì?", new[] { "Sắp xếp toàn mảng rồi lấy 3 phần tử cuối", "Dùng heap tối thiểu kích thước 3", "Dùng bảng băm", "Chạy binary search" }, 1, "Min-heap kích thước 3 luôn giữ 3 phần tử lớn nhất, mỗi phần tử chỉ tốn O(log 3) thay vì O(N log N) khi sắp xếp.");
                q.AddQuestion("Để tránh tràn số khi tính chỉ số giữa của binary search với lo và hi rất lớn, công thức nào đúng?", new[] { "mid = (lo + hi) / 2", "mid = lo + (hi - lo) / 2", "mid = (hi - lo) / 2", "mid = hi - (hi + lo)" }, 1, "Biểu thức lo + (hi - lo)/2 tránh phép cộng lo + hi có thể tràn kiểu số nguyên 32-bit.");
                q.AddQuestion("Cho mảng [2, 2, 1], mọi số xuất hiện đúng 2 lần trừ một số. Gộp toàn mảng bằng phép XOR cho kết quả là bao nhiêu?", new[] { "0", "1", "2", "3" }, 1, "XOR là phép toán có phần tử trung hòa 0 và hai giá trị giống nhau triệt tiêu nhau: 2 XOR 2 = 0, còn lại 0 XOR 1 = 1.");
                q.AddQuestion("Mảng sắp xếp [1, 2, 4, 6, 9] với target 8, thuật toán two pointers bắt đầu lo = 0, hi = 4. Tổng 1 + 9 = 10 lớn hơn 8, bước tiếp theo là gì?", new[] { "Tăng lo lên 1", "Giảm hi xuống 3", "Tăng cả lo và hi", "Dừng thuật toán" }, 1, "Tổng lớn hơn target nên phải giảm số hạng lớn nhất, tức giảm hi; khi tổng nhỏ hơn target mới tăng lo.");
            });


            var qL40 = await GetOrCreate("Trắc nghiệm DP Patterns", "Kiểm tra kiến thức: Trắc nghiệm DP Patterns", "dsa", 1, 45, q =>
            {
                q.AddQuestion("Interval DP thường dùng trạng thái nào?", new[] { "dp[i] với i là độ dài dãy", "dp[i][j] với i, j là hai đầu đoạn liên tục", "dp[mask] với mask là tập con", "dp[u] với u là node trên cây" }, 1, "Interval DP đại diện kết quả của đoạn từ i đến j bằng dp[i][j].");
                q.AddQuestion("Bitmask DP chỉ khả thi khi số phần tử n thỏa điều kiện nào?", new[] { "n ≤ 10", "n ≤ 20", "n ≤ 100", "n ≤ 1000" }, 1, "Số trạng thái là 2^n, chỉ khả thi với n khoảng 20 hoặc nhỏ hơn.");
                q.AddQuestion("Tree DP thường duyệt cây theo thứ tự nào để tính bài toán con trước?", new[] { "Preorder (gốc trước)", "Inorder (trái - gốc - phải)", "Postorder (con trước, gộp lên cha)", "Level-order (BFS)" }, 2, "Cần kết quả của node con trước khi gộp lên node cha nên dùng postorder.");
                q.AddQuestion("Bài toán matrix chain multiplication phù hợp pattern DP nào?", new[] { "Interval DP", "Bitmask DP", "Tree DP", "Linear DP" }, 0, "Chọn vị trí cắt phép nhân giữa một đoạn ma trận — đúng hình dạng Interval DP.");
                q.AddQuestion("Với n = 4 thành phố, số trạng thái bitmask tối đa là bao nhiêu?", new[] { "4", "8", "16", "64" }, 2, "Số tập con của 4 phần tử là 2^4 = 16 trạng thái mask.");
                q.AddQuestion("Trong Interval DP cho burst balloons, tư duy đảo ngược là gì?", new[] { "Nổ quả bóng đầu tiên trước", "Chọn quả bóng nổ cuối cùng trong đoạn", "Nổ quả bóng lớn nhất trước", "Nổ hai quả cùng lúc" }, 1, "Chọn quả nổ cuối giúp hai đoạn con độc lập và chi phí chỉ còn tích với biên ngoài.");
                q.AddQuestion("Trong house robber III, nếu cướp node hiện tại thì node con phải thế nào?", new[] { "Cũng cướp để tối đa lợi nhuận", "Không được cướp", "Cướp hoặc không đều được", "Chỉ cướp một nửa số con" }, 1, "Hai node kề nhau không thể cùng bị cướp, nên khi cướp node cha, các con phải ở trạng thái không cướp.");
                q.AddQuestion("Độ phức tạp điển hình của Interval DP (không tối ưu bằng Knuth) là bao nhiêu?", new[] { "O(n)", "O(n²)", "O(n³)", "O(2^n)" }, 2, "O(n²) trạng thái, mỗi trạng thái duyệt điểm chia k — tổng O(n³).");
                q.AddQuestion("Cho dp[mask][last] trong TSP, cách mở rộng trạng thái đúng là gì?", new[] { "Xóa một bit khỏi mask", "Thêm một thành phố chưa đi vào mask và cập nhật last", "Đảo ngược thứ tự duyệt", "Gộp hai mask bất kỳ" }, 1, "Từ mask hiện tại kết thúc ở last, thêm thành phố next chưa đi vào mask và cập nhật chi phí.");
                q.AddQuestion("Với mảng [3, 1, 5], bài burst balloons chọn quả 1 nổ cuối cùng cho kết quả bao nhiêu?", new[] { "5", "8", "15", "30" }, 2, "Hai bên quả 1 đã nổ hết, chi phí cuối là 3 × 1 × 5 = 15, hai đoạn con đều rỗng nên tổng bằng 15.");
            });

            await _context.Quizzes.AddRangeAsync(created);




            await _context.SaveChangesAsync();
        }

        private async Task SeedLeaderboardUsersAsync()
        {
            // 2 tài khoản admin + demo Teacher có credential công khai trong source —
            // CHỈ seed ở Development (backdoor nếu lọt production).
            if (!_includeDemoAdmin)
            {
                await SeedNonAdminLeaderboardUsersAsync();
                return;
            }

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

            await InsertUsersAsync(users);
        }

        private async Task SeedNonAdminLeaderboardUsersAsync()
        {
            // Production: chỉ seed học viên demo (không có credential admin công khai).

            // VÔ HIỆU HÓA admin/demo account từ DB cũ (đã seed trước khi có guard) —
            // admin@gmail.com/admin123 lọt production = backdoor.
            var legacyAdmins = await _context.Users
                .Where(u => u.Email == "admin@gmail.com"
                         || u.Email == "admin@visualizationdsa.dev"
                         || u.Email == "demo@visualizationdsa.dev")
                .ToListAsync();
            foreach (var legacy in legacyAdmins)
            {
                legacy.SetActiveStatus(false);
            }
            if (legacyAdmins.Count > 0)
            {
                await _context.SaveChangesAsync();
            }

            var users = new (string email, string username, string password, int xp, int level, int streak, string role)[]
            {
                ("nguyenvana@visualizationdsa.dev",   "NguyenVanA",    "User@2024",  2850, 7, 14, "Student"),
                ("tranthib@visualizationdsa.dev",     "TranThiB",      "User@2024",  2200, 7, 10, "Student"),
                ("levanc@visualizationdsa.dev",       "LeVanC",        "User@2024",  1800, 6, 8,  "Student"),
                ("phamthid@visualizationdsa.dev",     "PhamThiD",      "User@2024",  1500, 6, 12, "Student"),
                ("hoangvane@visualizationdsa.dev",    "HoangVanE",     "User@2024",  1200, 5, 6,  "Student"),
                ("vuthif@visualizationdsa.dev",       "VuThiF",        "User@2024",  950,  4, 5,  "Student"),
                ("dangvang@visualizationdsa.dev",     "DangVanG",      "User@2024",  700,  4, 4,  "Student"),
                ("buithih@visualizationdsa.dev",      "BuiThiH",       "User@2024",  450,  3, 3,  "Student"),
                ("dovani@visualizationdsa.dev",       "DoVanI",        "User@2024",  250,  2, 2,  "Student"),
            };

            await InsertUsersAsync(users);
        }

        private async Task InsertUsersAsync((string email, string username, string password, int xp, int level, int streak, string role)[] users)
        {
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
                    if (_includeDemoAdmin && IsDevelopmentCredential(email))
                    {
                        existingUser.SetActiveStatus(true);
                        existingUser.ChangePassword(HashPasswordSHA256(password));
                    }
                }
            }

            await _context.SaveChangesAsync();
        }

        private static bool IsDevelopmentCredential(string email)
        {
            return email.Equals("admin@visualizationdsa.dev", StringComparison.OrdinalIgnoreCase)
                || email.Equals("admin@gmail.com", StringComparison.OrdinalIgnoreCase)
                || email.Equals("demo@visualizationdsa.dev", StringComparison.OrdinalIgnoreCase);
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
        // Guard: lesson marker đã tồn tại → dữ liệu lesson độc lập + roadmap đã seed (tránh nhân đôi khi restart).
        // Dùng Contains vì title lesson có phần mô tả đuôi (vd "Two Pointers - Kỹ thuật hai con trỏ...").
        var marker = await _context.Lessons.FirstOrDefaultAsync(l => l.Title.Contains("Two Pointers"));
        var lessonCount = await _context.Lessons.CountAsync();
        if (marker != null && lessonCount >= 40) return;

        _context.Lessons.RemoveRange(_context.Lessons);
        _context.Courses.RemoveRange(_context.Courses);
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

        // ── Quiz liên kết 39 lesson (upsert theo title) ──
            var quizL01 = await _context.Quizzes.FirstOrDefaultAsync(q => q.Title == "Trắc nghiệm Big O & Độ phức tạp");
            var quizL02 = await _context.Quizzes.FirstOrDefaultAsync(q => q.Title == "Trắc nghiệm Mảng cơ bản");
            var quizL03 = await _context.Quizzes.FirstOrDefaultAsync(q => q.Title == "Trắc nghiệm Chuỗi cơ bản");
            var quizL04 = await _context.Quizzes.FirstOrDefaultAsync(q => q.Title == "Trắc nghiệm Hash Table & Set");
            var quizL05 = await _context.Quizzes.FirstOrDefaultAsync(q => q.Title == "Trắc nghiệm Linked List");
            var quizL06 = await _context.Quizzes.FirstOrDefaultAsync(q => q.Title == "Trắc nghiệm Stack");
            var quizL07 = await _context.Quizzes.FirstOrDefaultAsync(q => q.Title == "Trắc nghiệm Queue & Deque");
            var quizL08 = await _context.Quizzes.FirstOrDefaultAsync(q => q.Title == "Trắc nghiệm Đệ quy");
            var quizL09 = await _context.Quizzes.FirstOrDefaultAsync(q => q.Title == "Trắc nghiệm Sắp xếp cơ bản");
            var quizL10 = await _context.Quizzes.FirstOrDefaultAsync(q => q.Title == "Trắc nghiệm Tìm kiếm Linear & Binary");
            var quizL11 = await _context.Quizzes.FirstOrDefaultAsync(q => q.Title == "Trắc nghiệm Two Pointers");
            var quizL12 = await _context.Quizzes.FirstOrDefaultAsync(q => q.Title == "Trắc nghiệm Sliding Window");
            var quizL13 = await _context.Quizzes.FirstOrDefaultAsync(q => q.Title == "Trắc nghiệm Binary Search nâng cao");
            var quizL14 = await _context.Quizzes.FirstOrDefaultAsync(q => q.Title == "Trắc nghiệm Prefix Sum");
            var quizL15 = await _context.Quizzes.FirstOrDefaultAsync(q => q.Title == "Trắc nghiệm Kadane");
            var quizL16 = await _context.Quizzes.FirstOrDefaultAsync(q => q.Title == "Trắc nghiệm Monotonic Stack & Deque");
            var quizL17 = await _context.Quizzes.FirstOrDefaultAsync(q => q.Title == "Trắc nghiệm BST");
            var quizL18 = await _context.Quizzes.FirstOrDefaultAsync(q => q.Title == "Trắc nghiệm Duyệt cây");
            var quizL19 = await _context.Quizzes.FirstOrDefaultAsync(q => q.Title == "Trắc nghiệm Heap & Priority Queue");
            var quizL20 = await _context.Quizzes.FirstOrDefaultAsync(q => q.Title == "Trắc nghiệm Đồ thị cơ bản");
            var quizL21 = await _context.Quizzes.FirstOrDefaultAsync(q => q.Title == "Trắc nghiệm Topological Sort");
            var quizL22 = await _context.Quizzes.FirstOrDefaultAsync(q => q.Title == "Trắc nghiệm Backtracking");
            var quizL23 = await _context.Quizzes.FirstOrDefaultAsync(q => q.Title == "Trắc nghiệm Chia để trị");
            var quizL24 = await _context.Quizzes.FirstOrDefaultAsync(q => q.Title == "Trắc nghiệm Greedy");
            var quizL25 = await _context.Quizzes.FirstOrDefaultAsync(q => q.Title == "Trắc nghiệm Interval Problems");
            var quizL26 = await _context.Quizzes.FirstOrDefaultAsync(q => q.Title == "Trắc nghiệm Matrix & Grid");
            var quizL27 = await _context.Quizzes.FirstOrDefaultAsync(q => q.Title == "Trắc nghiệm Bit Manipulation & Số học");
            var quizL28 = await _context.Quizzes.FirstOrDefaultAsync(q => q.Title == "Trắc nghiệm Sắp xếp nâng cao");
            var quizL29 = await _context.Quizzes.FirstOrDefaultAsync(q => q.Title == "Trắc nghiệm DP cơ bản");
            var quizL30 = await _context.Quizzes.FirstOrDefaultAsync(q => q.Title == "Trắc nghiệm DP nâng cao");
            var quizL31 = await _context.Quizzes.FirstOrDefaultAsync(q => q.Title == "Trắc nghiệm Đường đi ngắn nhất");
            var quizL32 = await _context.Quizzes.FirstOrDefaultAsync(q => q.Title == "Trắc nghiệm MST");
            var quizL33 = await _context.Quizzes.FirstOrDefaultAsync(q => q.Title == "Trắc nghiệm Union-Find");
            var quizL34 = await _context.Quizzes.FirstOrDefaultAsync(q => q.Title == "Trắc nghiệm Trie");
            var quizL35 = await _context.Quizzes.FirstOrDefaultAsync(q => q.Title == "Trắc nghiệm Segment Tree");
            var quizL36 = await _context.Quizzes.FirstOrDefaultAsync(q => q.Title == "Trắc nghiệm Fenwick Tree");
            var quizL37 = await _context.Quizzes.FirstOrDefaultAsync(q => q.Title == "Trắc nghiệm Thuật toán chuỗi nâng cao");
            var quizL38 = await _context.Quizzes.FirstOrDefaultAsync(q => q.Title == "Trắc nghiệm Cấu trúc dữ liệu nâng cao");
            var quizL39 = await _context.Quizzes.FirstOrDefaultAsync(q => q.Title == "Trắc nghiệm Tổng ôn DSA");
            var quizL40 = await _context.Quizzes.FirstOrDefaultAsync(q => q.Title == "Trắc nghiệm DP Patterns");

        // ── 39 Lesson độc lập (nội dung + demo + quizId) ──
            var lesson01 = new Lesson("Độ phức tạp thuật toán (Big O)",
                @"# 🎯 Độ phức tạp thuật toán (Big O)

## 1. Động cơ học (Why this matters)
Một ứng dụng tìm kiếm sản phẩm có thể chứa tới hàng triệu bản ghi. Nếu dùng thuật toán kém, thao tác tìm kiếm sẽ chậm dần đáng kể khi dữ liệu lớn, còn thuật toán tốt thì phản hồi gần như tức thì. Big O là thước đo chuẩn quốc tế giúp ta dự đoán tốc độ chạy trước khi viết code, đồng thời là ngôn ngữ chung trong mọi buổi phỏng vấn kỹ sư phần mềm.

## 2. Lý thuyết cốt lõi
- Big O mô tả xu hướng tăng trưởng của thời gian chạy (hoặc bộ nhớ) khi kích thước đầu vào N tăng, không đo thời gian tuyệt đối tính bằng giây trên một máy cụ thể.
- Quy tắc rút gọn gồm ba ý chính: bỏ hằng số (O(2N) thành O(N)); giữ bậc cao nhất (O(N² + N) thành O(N²)); vòng lặp lồng nhau thì nhân số lần lặp với nhau.
- Thang đo phổ biến từ nhanh đến chậm: O(1) < O(log N) < O(N) < O(N log N) < O(N²) < O(2^N).

Để hình dung sự khác biệt, lấy N bằng 1 triệu: thuật toán O(log N) chỉ cần khoảng 20 bước, thuật toán O(N) cần 1 triệu bước, còn thuật toán O(N²) cần tới 1 nghìn tỷ bước. Một máy tính thực hiện khoảng 1 tỷ phép toán mỗi giây, nên giải pháp O(N²) mất hơn 16 phút trong khi giải pháp O(N log N) hoàn tất chưa đầy một giây. Đây là lý do các hệ thống lớn luôn tránh vòng lặp lồng nhau trong đường dẫn xử lý chính và tìm cách thay bằng tìm kiếm nhị phân hoặc bảng băm.

## 3. Các mức độ phổ biến
1. O(1): truy cập arr[i] hoặc phép toán số học — thời gian không đổi dù N lớn đến đâu.
2. O(log N): tìm kiếm nhị phân — mỗi bước chia đôi không gian tìm kiếm.
3. O(N): duyệt toàn bộ mảng một lần bằng vòng lặp.
4. O(N log N): các thuật toán sắp xếp tốt như Merge, Quick, Heap.
5. O(N²): hai vòng lặp lồng nhau xử lý mọi cặp phần tử.

Ví dụ minh họa có số liệu cụ thể: tìm số 8 trong mảng đã sắp xếp [1, 3, 4, 8, 9] bằng tìm kiếm nhị phân. Bước 1 so với phần tử giữa là 4 (nhỏ hơn 8 nên bỏ nửa trái), bước 2 so với phần tử giữa mới là 8 — tổng cộng 2 phép so sánh thay vì 5 phép duyệt tuần tự. Nếu mảng có 1 triệu phần tử, số bước chỉ tăng lên khoảng 20 — sức mạnh của logarit nằm ở chỗ này.

### Ví dụ
```javascript
// O(1) — thời gian không đổi
function layPhanTu(arr) { return arr[3]; }

// O(N) — thời gian tỷ lệ với N
function tinhTong(arr) {
  let tong = 0;
  for (const v of arr) tong += v; // N phép cộng
  return tong;
}

// O(N²) — hai vòng lặp lồng nhau
function inCapSo(arr) {
  for (let i = 0; i < arr.length; i++) {     // N lần
    for (let j = 0; j < arr.length; j++) {   // N lần cho mỗi i
      console.log(arr[i], arr[j]);           // N² phép in
    }
  }
}
```

## 4. Độ phức tạp & so sánh
| Trường hợp | Thời gian | Ghi chú |
| :--- | :--- | :--- |
| Tốt nhất | O(1) | Dữ liệu đầu vào đặc biệt thuận lợi |
| Trung bình | O(N log N) | Thường gặp ở thuật toán sắp xếp tốt |
| Xấu nhất | O(N²) | Hai vòng lặp lồng nhau |

- Bộ nhớ: O(1) nếu thuật toán không cấp phát cấu trúc dữ liệu phụ thuộc N.

## 5. Liên kết trực quan hóa
👉 Bấm **Trực Quan Hóa** để xem Tìm kiếm nhị phân — minh họa thuật toán O(log N).

## 6. Tổng kết
- Big O đo xu hướng tăng trưởng của thời gian và bộ nhớ, không phải thời gian đo bằng đồng hồ.
- Luôn bỏ hằng số và giữ bậc cao nhất khi rút gọn biểu thức độ phức tạp.
- O(log N) và O(N log N) là mục tiêu thiết kế của mọi thuật toán chất lượng cao.
- Bẫy thường gặp: nhầm O(N) với tốc độ chạy thực tế — hai thuật toán cùng O(N) có thể chênh nhau nhiều lần; quên tính chi phí của hàm gọi bên trong vòng lặp.

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)",
                "searching", "{\"demo\":\"binary-search\"}", 30, teacher.Id);
            _context.Lessons.Add(lesson01);
            var lesson02 = new Lesson("Mảng & kỹ thuật cơ bản",
                @"# 🎯 Mảng & kỹ thuật cơ bản

## 1. Động cơ học (Why this matters)
Mảng là cấu trúc dữ liệu xuất hiện trong gần như mọi chương trình: danh sách sản phẩm, điểm số sinh viên, hàng đợi lệnh giao dịch. Nắm chắc đặc tính truy cập nhanh và chi phí chèn xóa của mảng giúp ta chọn đúng thao tác, tránh viết vòng lặp chậm chạp. Hầu hết bài phỏng vấn về thuật toán đều xoay quanh mảng hoặc biến thể của nó.

## 2. Lý thuyết cốt lõi
- Mảng lưu các phần tử cùng kiểu trong vùng bộ nhớ liên tục, mỗi phần tử được đánh chỉ số từ 0 đến N - 1.
- Truy cập arr[i] có độ phức tạp O(1): máy tính tính địa chỉ ô nhớ trực tiếp bằng phép cộng, không cần duyệt.
- Chèn hoặc xóa ở đầu hoặc giữa mảng tốn O(N) vì phải dịch chuyển toàn bộ phần tử phía sau.
- Dynamic array (List trong C#, ArrayList trong Java, mảng JavaScript) tự cấp phát vùng nhớ lớn gấp đôi khi đầy rồi copy dữ liệu cũ sang, nên thao tác thêm vào cuối đạt O(1) trung bình (amortized).

### Kỹ thuật xử lý phổ biến
- Duyệt bằng chỉ số hoặc for-each để đọc toàn bộ mảng trong O(N).
- Sort trước rồi xử lý: giảm các bài toán tìm cặp, trùng lặp từ O(N²) xuống O(N log N + N).
- Dùng hash (Set/Map) để kiểm tra phần tử tồn tại trong O(1) trung bình thay vì duyệt từng phần tử.

## 3. Các bài toán kinh điển
1. Tìm max/min: duyệt một lần, cập nhật biến tốt nhất — độ phức tạp O(N).
2. Xoay mảng k bước: thực hiện ba lần đảo ngược (toàn mảng, nửa trước, nửa sau) — O(N), không tốn bộ nhớ phụ.
3. Remove duplicates: hai con trỏ slow/fast ghi đè phần tử hợp lệ ngay trên mảng — O(N) thời gian, O(1) bộ nhớ.
4. Merge hai mảng đã sắp xếp: hai con trỏ so sánh và lấy phần tử nhỏ hơn — O(N + M).

Ví dụ xoay mảng [1, 2, 3, 4, 5] sang phải 2 bước: đảo toàn mảng được [5, 4, 3, 2, 1]; đảo nửa trước (hai phần tử) được [4, 5, 3, 2, 1]; đảo nửa sau được [4, 5, 1, 2, 3] — đúng kết quả mong đợi.

### Ví dụ
```javascript
// Tìm max — duyệt một lần
function timMax(arr) {
  let max = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > max) max = arr[i];
  }
  return max;
}

// Xoay phải k bước bằng ba lần đảo
function dao(arr, l, r) {
  while (l < r) {
    [arr[l], arr[r]] = [arr[r], arr[l]]; // hoán đổi
    l++;
    r--;
  }
}
function xoayPhai(arr, k) {
  k = k % arr.length; // k lớn hơn N vẫn xử lý đúng
  dao(arr, 0, arr.length - 1);
  dao(arr, 0, k - 1);
  dao(arr, k, arr.length - 1);
  return arr;
}

// Gộp hai mảng đã sắp xếp
function gopMang(a, b) {
  const ketQua = [];
  let i = 0, j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] < b[j]) ketQua.push(a[i++]);
    else ketQua.push(b[j++]);
  }
  return ketQua.concat(a.slice(i)).concat(b.slice(j));
}
```

## 4. Độ phức tạp & so sánh
| Thao tác | Thời gian | Ghi chú |
| :--- | :--- | :--- |
| Truy cập arr[i] | O(1) | Tính địa chỉ trực tiếp |
| Chèn/xóa đầu hoặc giữa | O(N) | Phải dịch chuyển phần tử |
| Thêm cuối (dynamic array) | O(1) trung bình | Thỉnh thoảng resize O(N) |
| Tìm kiếm tuyến tính | O(N) | Duyệt hết mảng |

- Bộ nhớ: O(N) cho dữ liệu; kỹ thuật two pointers chỉ tốn thêm O(1).

## 5. Liên kết trực quan hóa
👉 Bấm **Trực Quan Hóa** để xem kỹ thuật Two Pointers trên dữ liệu mảng.

## 6. Tổng kết
- Truy cập theo chỉ số là O(1), chèn xóa giữa mảng là O(N).
- Dynamic array chia sẻ chi phí resize nên thêm cuối trung bình vẫn là O(1).
- Sort trước khi xử lý và dùng hash là hai cách phổ biến để tránh vòng lặp lồng nhau.
- Bẫy thường gặp: quên lấy k %= N khi xoay mảng; gọi indexOf bên trong vòng lặp vô tình tạo O(N²); duyệt mảng trong khi đang sửa độ dài mảng.

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)",
                "searching", "{\"demo\":\"two-pointers\"}", 30, teacher.Id);
            _context.Lessons.Add(lesson02);
            var lesson03 = new Lesson("Chuỗi cơ bản",
                @"# 🎯 Chuỗi cơ bản

## 1. Động cơ học (Why this matters)
Mọi ứng dụng đều xử lý văn bản: kiểm tra email nhập vào, tìm kiếm tên, đảo ngược chuỗi hiển thị. Chuỗi có đặc tính bất biến khác hẳn mảng, khiến những thao tác tưởng vô hại như nối chuỗi trong vòng lặp lại gây chậm chạm nghiêm trọng. Hiểu bản chất chuỗi cùng các kỹ thuật hai con trỏ, đếm tần suất ký tự giúp ta xử lý văn bản hiệu quả và đúng chuẩn phỏng vấn.

## 2. Lý thuyết cốt lõi
- Chuỗi là bất biến (immutable): mỗi phép nối tạo ra một đối tượng chuỗi hoàn toàn mới, chuỗi cũ bị bỏ lại trong bộ nhớ.
- Nối chuỗi N lần trong vòng lặp tốn O(N²): tổng kích thước dữ liệu phải copy là 1 + 2 + ... + N.
- Giải pháp hiệu quả: dùng StringBuilder (C#/Java) hoặc gom kết quả vào mảng rồi join một lần (JavaScript) — giảm chi phí về O(N).
- Ba kỹ thuật chính: hai con trỏ quét hai đầu chuỗi, hash đếm tần suất ký tự, và normalize chuỗi trước khi so sánh.

### Ý nghĩa của normalize
Hai chuỗi Hello và hello nếu so trực tiếp sẽ bị xem là khác nhau, nhưng sau khi chuyển hết về chữ thường và cắt khoảng trắng thừa thì trở nên tương đương. Thao tác này rất quan trọng khi kiểm tra palindrome hay anagram với dữ liệu người dùng nhập, vì người dùng thường viết hoa lẫn viết thường và thừa khoảng trắng.

## 3. Các bài toán kinh điển
1. Kiểm tra palindrome: đặt con trỏ trái ở đầu, phải ở cuối, so sánh dần về phía giữa — O(N).
2. Đảo chuỗi: hai con trỏ hoán đổi ký tự hai đầu hoặc duyệt ngược — O(N).
3. Kiểm tra anagram: đếm tần suất từng ký tự của hai chuỗi rồi so sánh bảng đếm — O(N).
4. Tìm ký tự xuất hiện nhiều nhất: mảng đếm 26 ô cho chữ cái thường hoặc Map cho ký tự Unicode — O(N).

Ví dụ kiểm tra palindrome với chuỗi racecar: con trỏ trái trỏ ký tự r, phải trỏ ký tự r — bằng nhau; tiếp tục a với a, c với c đều bằng nhau; hai con trỏ gặp nhau tại ký tự giữa e nên kết luận chuỗi là palindrome. Ví dụ đếm tần suất chuỗi aabbbcc: a đếm được 2, b đếm được 3, c đếm được 2 — ký tự xuất hiện nhiều nhất là b với 3 lần.

### Ví dụ
```javascript
// Kiểm tra palindrome bằng hai con trỏ
function laPalindrome(s) {
  let trai = 0, phai = s.length - 1;
  while (trai < phai) {
    if (s[trai] !== s[phai]) return false;
    trai++;
    phai--;
  }
  return true;
}

// Đếm tần suất chữ cái thường — mảng 26 ô
function demKyTu(s) {
  const dem = new Array(26).fill(0);
  for (const c of s.toLowerCase()) {
    dem[c.charCodeAt(0) - 97]++; // mã ASCII của 'a' là 97
  }
  return dem;
}

// Nối chuỗi hiệu quả: gom mảng rồi join
function lapLai(c, n) {
  return new Array(n).fill(c).join('');
}
```

## 4. Độ phức tạp & so sánh
| Thao tác | Thời gian | Ghi chú |
| :--- | :--- | :--- |
| Truy cập ký tự theo chỉ số | O(1) | Giống mảng |
| Nối chuỗi trong vòng lặp | O(N²) | Copy lặp lại do bất biến |
| Nối bằng StringBuilder/join | O(N) | Tích lũy trước, nối một lần |
| Palindrome/đảo chuỗi hai con trỏ | O(N) | Mỗi ký tự xét tối đa một lần |

- Bộ nhớ: O(1) cho kỹ thuật hai con trỏ; O(N) khi tạo chuỗi hoặc mảng đếm kết quả mới.

## 5. Liên kết trực quan hóa
👉 Bấm **Trực Quan Hóa** để xem kỹ thuật Two Pointers — hai con trỏ quét chuỗi.

## 6. Tổng kết
- Chuỗi bất biến nên nối trong vòng lặp tốn O(N²); hãy dùng StringBuilder hoặc mảng rồi join.
- Hai con trỏ giải quyết trọn vẹn bài toán palindrome và đảo chuỗi trong O(N).
- Đếm tần suất ký tự giúp nhận diện anagram nhanh chóng.
- Bẫy thường gặp: quên normalize trước khi so sánh; mảng đếm 26 ô chỉ đúng với chữ cái thường không dấu; quên kiểm tra chuỗi rỗng — chuỗi rỗng là một palindrome hợp lệ.

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)",
                "searching", "{\"demo\":\"two-pointers\"}", 30, teacher.Id);
            _context.Lessons.Add(lesson03);
            var lesson04 = new Lesson("Hash Table & Set",
                @"# 🎯 Hash Table & Set

## 1. Động cơ học (Why this matters)
Để tìm một biển số trong tập 10 triệu biển số vi phạm, mảng buộc ta quét tuần tự O(N) — quá chậm. Hash Table tra cứu và kiểm tra tồn tại trong thời gian gần như tức thì O(1) bất kể dữ liệu lớn cỡ nào. Từ đếm tần suất từ, chống trùng lặp, đến cache và chỉ mục cơ sở dữ liệu, bảng băm là nền móng của gần như mọi phần mềm hiện đại.

## 2. Lý thuyết cốt lõi
- Hash Table ánh xạ Key sang Value bằng một mảng vật lý; hàm băm biến Key bất kỳ thành chỉ số: index = hash(key) % capacity.
- Hàm băm tốt có ba tính chất: xác định (cùng Key cho cùng chỉ số), phân tán đều và chạy nhanh O(1).
- Va chạm (collision) xảy ra khi hai Key khác nhau băm trúng cùng chỉ số; hai cách xử lý kinh điển là chaining (mỗi ô chứa một danh sách liên kết) và open addressing (dò ô trống kế tiếp theo linear, quadratic hoặc double hashing).
- Load factor α = số phần tử chia dung lượng. Khi α vượt ngưỡng 0,75, bảng rehash: cấp phát mảng gấp đôi rồi băm lại toàn bộ Key — tốn O(N) nhưng hiếm nên trung bình vẫn O(1).
- Map (Dictionary) lưu cặp Key–Value; Set (HashSet) chỉ lưu Key để trả lời câu hỏi đã từng xuất hiện hay chưa và khử trùng lặp.

Điểm mạnh của bảng băm là biến câu hỏi so sánh nhiều phần tử thành một phép tính số học: tính chỉ số rồi đi thẳng tới ô đó. Mọi khó khăn nằm ở va chạm — xảy ra quá nhiều thì bảng suy biến thành danh sách dài, mất lợi thế O(1), nên giữ mật độ dưới 0,75 là điểm cân bằng giữa tốc độ và bộ nhớ. Đổi lại, bảng băm tốn bộ nhớ thừa và không duy trì thứ tự chèn — hai giới hạn cần ghi nhớ.

## 3. Thuật toán từng bước (hoặc ý tưởng chính)
Đếm tần suất bằng Map:
1. Khởi tạo một bảng băm rỗng.
2. Với từng phần tử, tra cứu Key; chưa có thì đặt 1, đã có thì tăng lên 1.
3. Sau khi duyệt hết, bảng chứa tần suất chính xác của mọi phần tử.

Ví dụ mảng [1, 2, 2, 3, 1, 1]: dần thu được {1: 1}, {1: 1, 2: 1}, {1: 1, 2: 2} rồi {1: 3, 2: 2, 3: 1}. Tổng chi phí O(N) thay vì O(N²) với hai vòng lặp.

### Ví dụ
```javascript
// Đếm tần suất từng phần tử bằng Map — bảng băm của JavaScript
function countFrequency(arr) {
  const map = new Map();               // Bảng băm rỗng
  for (const v of arr) {
    map.set(v, (map.get(v) ?? 0) + 1); // Tra cứu rồi tăng tần suất
  }
  return map;
}

// Khử trùng lặp bằng Set — chỉ cần câu trả lời có hay không
function uniqueCount(arr) {
  return new Set(arr).size;            // Số phần tử phân biệt
}
```

## 4. Độ phức tạp & so sánh
| Trường hợp | Thời gian | Ghi chú |
| :--- | :--- | :--- |
| Tra cứu trung bình | O(1) | Hàm băm tốt, tải thấp |
| Chèn trung bình | O(1) | Amortized nhờ rehash hiếm |
| Xấu nhất | O(N) | Mọi Key va chạm một ô |

- Bộ nhớ: O(N) nhưng hệ số thừa lớn, thường gấp đôi dung lượng thực tế.
- Không duy trì thứ tự chèn; nếu cần thứ tự hãy dùng mảng hoặc cây tìm kiếm.

## 5. Liên kết trực quan hóa
🖥️ **Mô phỏng tương tác:** bài học này chưa có demo trực quan chuyên biệt — hãy tự chạy code mẫu ở mục 3 để quan sát kết quả, rồi tiếp tục với phần Quiz.

## 6. Tổng kết
- Hàm băm biến Key thành chỉ số mảng; chaining và open addressing là hai chiến lược chống va chạm.
- Load factor quyết định hiệu năng; rehash đúng lúc giữ thao tác trung bình O(1).
- Map lưu cặp Key–Value, Set chỉ lưu Key — cùng phục vụ đếm tần suất và tra cứu nhanh.
- Bẫy thường gặp: dùng Key thay đổi sau khi chèn khiến tra cứu không tìm thấy; giả định bảng băm có thứ tự; quên khai báo dung lượng ban đầu gây rehash liên tục.

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)",
                "dsa", "{}", 30, teacher.Id);
            _context.Lessons.Add(lesson04);
            var lesson05 = new Lesson("Linked List",
                @"# 🎯 Linked List

## 1. Động cơ học (Why this matters)
Mảng buộc phần tử nằm liền kề trong bộ nhớ, nên chèn vào đầu phải dịch chuyển cả danh sách — tốn O(N). Linked List giải quyết bằng cách mỗi phần tử là một Node nắm con trỏ trỏ tới Node kế tiếp, nhờ vậy thêm bớt đầu hoặc cuối chỉ mất O(1) dù dữ liệu nằm rải rác. Đây cũng là nền tảng của bảng băm chaining, hàng đợi và bộ đệm LRU.

## 2. Lý thuyết cốt lõi
- Node là đơn vị cơ bản gồm hai phần: dữ liệu (data) và con trỏ Next; danh sách chỉ cần giữ một tham chiếu Head là truy cập được toàn bộ.
- Singly Linked List: mỗi Node chỉ trỏ tới Node tiếp theo, duyệt một chiều từ Head tới null, không thể quay lại.
- Doubly Linked List: thêm con trỏ Prev, duyệt hai chiều, xóa Node đã biết O(1) không cần tìm Prev; chi phí là bộ nhớ gần gấp đôi.
- Circular Linked List: Node cuối trỏ ngược về Head, dùng cho các vòng lặp như round-robin hay danh sách phát lặp.
- Truy cập ngẫu nhiên O(N): phải đi từ Head theo từng con trỏ; bù lại, thêm xóa ở đầu và cuối (nếu giữ Tail) là O(1).

Thao tác trên Linked List về bản chất chỉ là nối lại con trỏ: xóa một Node là bảo Node trước đó trỏ thẳng tới Node kế sau, đảo ngược là đổi hướng từng Next. Vì không có chỉ số, mọi vòng lặp phải kiểm tra null trước khi truy cập Next — lỗi null reference phổ biến nhất khi tự cài đặt.

## 3. Thuật toán từng bước (hoặc ý tưởng chính)
Đảo ngược danh sách (reverse) bằng kỹ thuật ba con trỏ:
1. Khởi tạo prev = null, current = head.
2. Trước khi đổi hướng, lưu next = current.next — nếu quên bước này sẽ mất toàn bộ phần còn lại của danh sách.
3. Gán current.next = prev để đảo hướng con trỏ.
4. Tiến prev = current, current = next, lặp lại tới khi current = null.
5. Head mới chính là prev.

Ví dụ chuỗi 1 → 2 → 3 → 4 đảo thành 4 → 3 → 2 → 1. Kỹ thuật fast and slow dùng hai con trỏ chạy khác tốc độ: fast đi hai bước, slow đi một bước, khi fast chạm đích thì slow nằm đúng giữa; nếu hai con trỏ gặp lại nhau giữa đường thì chắc chắn danh sách có chu trình (thuật toán Floyd).

### Ví dụ
```javascript
// Node của danh sách liên kết đơn
class Node {
  constructor(val) { this.val = val; this.next = null; }
}

// Đảo ngược danh sách — ba con trỏ, nhớ lưu next trước
function reverse(head) {
  let prev = null, curr = head;
  while (curr) {
    const next = curr.next; // Lưu lại trước khi cắt dây
    curr.next = prev;       // Đảo hướng con trỏ
    prev = curr;
    curr = next;
  }
  return prev;              // Head mới
}

// Phát hiện chu trình bằng Floyd — hai con trỏ gặp nhau
function hasCycle(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}
```

## 4. Độ phức tạp & so sánh
| Trường hợp | Thời gian | Ghi chú |
| :--- | :--- | :--- |
| Thêm xóa ở đầu (Head) | O(1) | Tạo Node mới, trỏ tới Head cũ |
| Thêm xóa ở cuối | O(1) hoặc O(N) | O(1) nếu giữ con trỏ Tail |
| Truy cập phần tử thứ i | O(N) | Phải duyệt từ Head |
| Tìm kiếm một giá trị | O(N) | Duyệt tuần tự |

- Bộ nhớ: O(N) dữ liệu cộng thêm 1–2 con trỏ mỗi Node (doubly tốn gần gấp đôi singly).
- Mảng truy cập O(1) và thân thiện cache hơn; chỉ chọn Linked List khi cần chèn xóa giữa rất nhiều.

## 5. Liên kết trực quan hóa
🖥️ **Mô phỏng tương tác:** bài học này chưa có demo trực quan chuyên biệt — hãy tự chạy code mẫu ở mục 3, rồi tiếp tục với phần Quiz.

## 6. Tổng kết
- Node = data + Next; Singly duyệt một chiều, Doubly hai chiều, Circular vòng kín.
- Thêm xóa đầu O(1) nhưng truy cập O(N) — ngược lại hoàn toàn với mảng.
- Reverse cần ba con trỏ; fast and slow giải quyết bài toán middle, cycle và giao điểm.
- Bẫy thường gặp: gán current.next = prev trước khi lưu next làm mất phần danh sách còn lại; quên xử lý head rỗng; dùng chung con trỏ chạy cho hai danh sách khi merge.

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)",
                "dsa", "{}", 30, teacher.Id);
            _context.Lessons.Add(lesson05);
            var lesson06 = new Lesson("Stack",
                @"# 🎯 Stack

## 1. Động cơ học (Why this matters)
Nút Hoàn tác trong mọi trình soạn thảo hoạt động đúng theo nguyên tắc vào sau ra trước: thao tác gần nhất luôn được đảo ngược đầu tiên. Stack cũng là bộ máy đằng sau call stack của mọi ngôn ngữ lập trình — hiểu nó giúp bạn biết vì sao đệ quy sâu lại gây lỗi StackOverflow. Cấu trúc nhỏ bé này còn là chìa khóa cho hàng loạt bài toán phỏng vấn kinh điển.

## 2. Lý thuyết cốt lõi
- Stack là cấu trúc dữ liệu LIFO: phần tử đưa vào sau cùng được lấy ra trước tiên.
- Ba thao tác cơ bản: push (đẩy lên đỉnh), pop (lấy và xóa phần tử đỉnh), peek (chỉ xem phần tử đỉnh) — tất cả đều O(1).
- Pop và peek trên stack rỗng gây lỗi underflow; luôn kiểm tra độ rỗng trước khi gọi.
- Call stack: mỗi lệnh gọi hàm đẩy một stack frame chứa biến cục bộ vào vùng nhớ giới hạn; đệ quy không dừng sẽ làm tràn vùng nhớ này.
- Monotonic stack giữ phần tử theo thứ tự tăng hoặc giảm nghiêm ngặt, giúp giải bài toán tìm phần tử lớn hơn kế tiếp trong O(N) thay vì O(N²).

Sức mạnh của stack nằm ở việc nó ghi nhớ các phần tử đang chờ xử lý theo đúng thứ tự ngược với cách chúng xuất hiện. Khi duyệt dữ liệu theo chiều xuôi nhưng câu trả lời lại phụ thuộc phần tử gặp sau, ta đẩy phần tử hiện tại vào stack và chờ tương lai giải phóng nó — đây chính là tư duy cốt lõi của monotonic stack. Cơ chế gọi hàm cũng vậy: A gọi B thì A tạm dừng và khôi phục đúng khi B trả về — giống hệt pop.

## 3. Thuật toán từng bước (hoặc ý tưởng chính)
Kiểm tra chuỗi ngoặc hợp lệ (valid parentheses) bằng stack:
1. Khởi tạo stack rỗng.
2. Duyệt từng ký tự: nếu là ngoặc mở thì push; nếu là ngoặc đóng thì pop một phần tử và so khớp với cặp tương ứng.
3. Nếu pop trên stack rỗng hoặc cặp không khớp, chuỗi không hợp lệ.
4. Kết thúc, chuỗi hợp lệ khi và chỉ khi stack rỗng.

Ví dụ chuỗi ([{}]): duyệt lần lượt đẩy ( rồi [ rồi {, gặp } khớp với {, gặp ] khớp với [, gặp ) khớp với ( — stack trống nên hợp lệ. Cùng tư duy đó, bài toán tìm phần tử lớn hơn kế tiếp dùng stack lưu chỉ số; khi gặp giá trị lớn hơn đỉnh stack, ta pop và ghi kết quả cho chỉ số vừa pop, mỗi phần tử vào ra đúng một lần nên tổng chi phí là O(N).

### Ví dụ
```javascript
// Kiểm tra chuỗi ngoặc hợp lệ — push khi gặp mở, pop khi gặp đóng
function isValid(s) {
  const stack = [];
  const pair = { ')': '(', ']': '[', '}': '{' };
  for (const ch of s) {
    if (ch === '(' || ch === '[' || ch === '{') {
      stack.push(ch);
    } else if (stack.pop() !== pair[ch]) {
      return false;          // Không khớp hoặc stack rỗng
    }
  }
  return stack.length === 0; // Còn sót ngoặc mở là sai
}

// Tìm phần tử lớn hơn kế tiếp — monotonic stack lưu chỉ số
function nextGreater(nums) {
  const res = new Array(nums.length).fill(-1);
  const stack = [];
  for (let i = 0; i < nums.length; i++) {
    while (stack.length && nums[i] > nums[stack[stack.length - 1]]) {
      res[stack.pop()] = nums[i]; // Giải phóng các chỉ số nhỏ hơn
    }
    stack.push(i);
  }
  return res;
}
```

## 4. Độ phức tạp & so sánh
| Trường hợp | Thời gian | Ghi chú |
| :--- | :--- | :--- |
| Push | O(1) | Amortized nếu cài bằng mảng động |
| Pop / Peek | O(1) | Kiểm tra rỗng trước khi gọi |
| Duyệt toàn bộ | O(N) | Mỗi phần tử được push và pop đúng một lần |

- Bộ nhớ: O(N) với cả hai cách cài bằng mảng hoặc danh sách liên kết.
- Cài bằng mảng nhanh hơn nhờ cache locality; cài bằng linked list không giới hạn kích thước nhưng tốn thêm con trỏ.

## 5. Liên kết trực quan hóa
👉 Bấm **Trực Quan Hóa** để xem mô phỏng Stack trực quan trên canvas.

## 6. Tổng kết
- Stack là LIFO với ba thao tác push, pop, peek đều O(1).
- Ứng dụng: so khớp ngoặc, đánh giá biểu thức, undo redo, call stack, DFS không đệ quy.
- Monotonic stack giải next greater element, min stack và histogram trong O(N).
- Bẫy thường gặp: gọi pop hoặc peek trên stack rỗng; viết đệ quy thiếu điều kiện dừng gây tràn call stack; quên rằng phần tử pop ra luôn là phần tử được push gần nhất.

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)",
                "dsa", "{\"demo\":\"stack\"}", 30, teacher.Id);
            _context.Lessons.Add(lesson06);
            var lesson07 = new Lesson("Queue & Deque: Hàng đợi và Hàng đợi hai đầu",
                @"# 🎯 Queue & Deque: Hàng đợi và Hàng đợi hai đầu

## 1. Động cơ học (Why this matters)
Xếp hàng mua vé máy bay, hàng đợi in ấn trong văn phòng, hay hàng triệu request đổ về server đều vận hành theo một nguyên tắc chung: ai đến trước phục vụ trước. Queue hóa thân nguyên tắc công bằng này, còn Deque giúp giải bài toán cửa sổ trượt chỉ trong O(N).

## 2. Lý thuyết cốt lõi
- Queue (hàng đợi) tuân thủ FIFO (First-In, First-Out): phần tử vào trước thì ra trước. Hai con trỏ Front (đầu hàng) và Rear (cuối hàng) quản lý hai đầu.
- Enqueue(x) thêm vào cuối; Dequeue() lấy và xóa phần tử đầu; Peek() chỉ xem không xóa. Cả ba thao tác chạy O(1) trên cài đặt chuẩn.
- Dùng mảng thường, Dequeue phải dời toàn bộ phần tử sang trái nên tốn O(N). Giải pháp là Circular Queue: khi con trỏ chạm đáy, dùng modulo (rear + 1) % capacity để quay vòng về các ô trống phía trước.
- Deque (Double-ended Queue) cho phép thêm và xóa ở cả hai đầu với O(1), kết hợp sức mạnh của Stack và Queue.
- Priority Queue khác Queue thường: phần tử ra trước là phần tử có độ ưu tiên cao nhất thay vì phần tử đến sớm nhất, thường được cài bằng Heap nên mỗi thao tác tốn O(log N).

Queue bảo toàn thứ tự xử lý: dữ liệu đến trước không bao giờ bị vượt mặt. Nhờ vậy nó là trái tim của BFS — đỉnh nào được tìm thấy trước sẽ được duyệt trước. Trong hệ thống thực tế, Queue làm bộ đệm (buffer) làm mượt luồng dữ liệu, làm cơ chế giới hạn tốc độ (rate limiting) cho API, và sắp xếp tác vụ (task scheduling) theo thứ tự đến.

## 3. Thuật toán từng bước (hoặc ý tưởng chính)

### Cài đặt Circular Queue
1. Khởi tạo mảng capacity ô, front = 0, rear = capacity − 1, size = 0.
2. Enqueue(x): nếu size == capacity thì hàng đầy, báo lỗi. Ngược lại gán rear = (rear + 1) % capacity, đặt arr[rear] = x rồi tăng size.
3. Dequeue(): nếu size == 0 thì hàng rỗng. Ngược lại lưu arr[front], gán front = (front + 1) % capacity, giảm size và trả về phần tử vừa lấy.

Ví dụ capacity = 4: enqueue 10, 20, 30 → [10, 20, 30, _], front = 0, rear = 2. Dequeue lấy 10, front sang ô 1. Enqueue 40 vào ô 3. Enqueue 50: rear = (3 + 1) % 4 = 0 — ô 0 đang trống nên 50 quay vòng ghi vào ô 0.

### Sliding Window Maximum bằng Deque
1. Duyệt từng chỉ số i của mảng.
2. Loại phần tử ở đầu Deque nếu chỉ số của nó đã trượt ra ngoài cửa sổ (nhỏ hơn i − k + 1).
3. Trong khi phần tử ở đuôi Deque nhỏ hơn nums[i], đẩy chúng ra — chúng không bao giờ là max của cửa sổ nữa.
4. Thêm i vào đuôi Deque. Khi i ≥ k − 1, phần tử đầu Deque chính là max của cửa sổ.

Mảng [1, 3, −1, −3, 5, 3, 6, 7], k = 3 → kết quả [3, 3, 5, 5, 6, 7].

### Implement Queue bằng hai Stack
Enqueue đẩy vào stackIn. Khi dequeue mà stackOut rỗng, đổ toàn bộ stackIn sang stackOut (đảo ngược thứ tự) rồi pop stackOut. Mỗi phần tử bị chuyển đúng một lần nên chi phí trung bình (amortized) là O(1).

### Ví dụ
```javascript
// Queue bằng mảng vòng: enqueue và dequeue đều O(1)
class CircularQueue {
  constructor(capacity) {
    this.arr = new Array(capacity);
    this.capacity = capacity;
    this.front = 0;
    this.rear = capacity - 1;
    this.size = 0;
  }
  enqueue(x) {
    if (this.size === this.capacity) return false; // hàng đầy
    this.rear = (this.rear + 1) % this.capacity;   // quay vòng bằng modulo
    this.arr[this.rear] = x;
    this.size++;
    return true;
  }
  dequeue() {
    if (this.size === 0) return undefined; // hàng rỗng
    const value = this.arr[this.front];
    this.front = (this.front + 1) % this.capacity;
    this.size--;
    return value;
  }
}
```

## 4. Độ phức tạp & so sánh
| Cấu trúc | Enqueue | Dequeue | Truy cập đầu |
| :--- | :--- | :--- | :--- |
| Queue (mảng thường) | O(1) | O(N) — phải dời cả dãy | O(1) |
| Circular Queue | O(1) | O(1) | O(1) |
| Queue (linked list) | O(1) | O(1) | O(1) |
| Deque | O(1) cả hai đầu | O(1) cả hai đầu | O(1) |
| Priority Queue (Heap) | O(log N) | O(log N) | O(1) |

- Bộ nhớ: O(N) với N là số phần tử tối đa chứa được.

## 5. Liên kết trực quan hóa
👉 Bấm **Trực Quan Hóa** để xem mô phỏng Queue trực quan trên canvas.

## 6. Tổng kết
- Queue là FIFO, Deque thêm/xóa hai đầu, Priority Queue ưu tiên độ quan trọng.
- Circular Queue dùng (index + 1) % capacity giúp mảng đạt O(1) cho cả enqueue lẫn dequeue.
- BFS, buffer, rate limiting và task scheduling đều xoay quanh Queue.
- Sliding Window Maximum đạt O(N) nhờ Deque giữ thứ tự giảm dần, max luôn ở đầu.
- Bẫy thường gặp: quên kiểm tra hàng đầy/rỗng dẫn đến ghi đè hoặc đọc ô rác.

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)",
                "dsa", "{\"demo\":\"queue\"}", 30, teacher.Id);
            _context.Lessons.Add(lesson07);
            var lesson08 = new Lesson("Đệ quy (Recursion): Hàm gọi chính mình",
                @"# 🎯 Đệ quy (Recursion): Hàm gọi chính mình

## 1. Động cơ học (Why this matters)
Tính tổng dung lượng một thư mục phải mở lần lượt từng thư mục con bên trong, dãy Fibonacci lại tự lặp lại chính mình ở bước nhỏ hơn. Đệ quy diễn đạt những bài toán tự đồng dạng (self-similar) chỉ trong vài dòng code, là nền tảng của mọi thuật toán chia để trị như sắp xếp trộn, duyệt cây và đồ thị.

## 2. Lý thuyết cốt lõi
- Đệ quy là hàm gọi chính nó với đầu vào nhỏ hơn, gồm hai phần: base case (điều kiện dừng) và recursive case (trường hợp gọi lại).
- Mỗi lời gọi hàm được máy tính lưu thành một stack frame chứa biến cục bộ và địa chỉ quay về, đẩy lên Call Stack. Khi base case trả về, các frame được bốc ra theo thứ tự ngược lại (gọi là unwinding).
- Call Stack có dung lượng giới hạn (khoảng 1–8 MB), đệ quy vô hạn sẽ làm tràn bộ nhớ và ném lỗi StackOverflowException.
- Giai thừa: factorial(n) = n × factorial(n − 1) với base case factorial(1) = 1.
- Fibonacci naive: fib(n) = fib(n − 1) + fib(n − 2) tạo cây đệ quy chồng lấp khổng lồ nên độ phức tạp là O(2^N).
- Memoization (ghi nhớ): lưu kết quả đã tính vào bảng tra cứu, gặp lại thì đọc ngay, đưa Fibonacci về O(N).
- Mọi đệ quy đều viết lại được bằng vòng lặp kết hợp stack tường minh: đệ quy giúp code ngắn gọn, vòng lặp tiết kiệm bộ nhớ ngăn xếp.

Khi gọi factorial(3) = 3 × factorial(2), máy tính chưa nhân được ngay vì factorial(2) chưa có kết quả, nên nó treo frame của factorial(3) lên đỉnh Call Stack rồi chạy factorial(2). Tương tự, factorial(2) treo để chạy factorial(1). Chỉ khi factorial(1) trả về 1, factorial(2) mới hoàn thành 2 × 1 = 2 rồi trả về, cuối cùng factorial(3) tính 3 × 2 = 6. Luồng trả về diễn ra theo đúng thứ tự LIFO — đệ quy chính là ngụy trang của Stack.

## 3. Thuật toán từng bước (hoặc ý tưởng chính)

### Tính giai thừa
1. Base case: nếu n ≤ 1, trả về 1.
2. Recursive case: trả về n × factorial(n − 1).

factorial(4) đi sâu: 4 × factorial(3) → 3 × factorial(2) → 2 × factorial(1) → 1. Tháo ngược: 1 × 2 = 2; 2 × 3 = 6; 6 × 4 = 24.

### Fibonacci và phân tích cây đệ quy
fib(5) gọi fib(4) và fib(3); fib(4) lại gọi fib(3) và fib(2). Trong cây đệ quy, cùng một phép tính như fib(3) xuất hiện nhiều lần ở nhiều nhánh — đó là lý do số lời gọi tăng theo hàm mũ. Thêm bảng memo: fib(3) chỉ tính một lần, các lần gặp lại sau chỉ đọc kết quả, cây đệ quy co lại thành một đường tuyến tính O(N).

### Ví dụ
```javascript
// Giai thừa: base case n <= 1
function factorial(n) {
  if (n <= 1) return 1;        // điều kiện dừng
  return n * factorial(n - 1); // gọi lại với đầu vào nhỏ hơn
}

// Fibonacci với memoization: O(N)
function fib(n, memo = {}) {
  if (n <= 1) return n;          // base case
  if (n in memo) return memo[n]; // đã tính rồi thì đọc ngay
  memo[n] = fib(n - 1, memo) + fib(n - 2, memo);
  return memo[n];
}
```

## 4. Độ phức tạp & so sánh
| Trường hợp | Thời gian | Ghi chú |
| :--- | :--- | :--- |
| Factorial đệ quy | O(N) | N lời gọi lồng nhau |
| Fibonacci naive | O(2^N) | Cây đệ quy chồng lấp |
| Fibonacci + memoization | O(N) | Mỗi giá trị tính một lần |
| Duyệt cây DFS đệ quy | O(N) | Thăm đúng N node |

- Bộ nhớ: đệ quy tốn O(N) cho Call Stack, trong khi vòng lặp chỉ tốn O(1) — đây là khác biệt lớn khi bài toán cần độ sâu lớn.

## 5. Liên kết trực quan hóa
👉 Bấm **Trực Quan Hóa** để xem Duyệt cây In-order — mỗi lần đệ quy đẩy một frame lên Call Stack.

## 6. Tổng kết
- Đệ quy gồm base case dừng bài toán và recursive case thu nhỏ đầu vào.
- Mỗi lời gọi đẩy một frame lên Call Stack; đệ quy sâu có thể gây StackOverflow.
- Fibonacci naive là O(2^N), memoization đưa về O(N) với bộ nhớ O(N).
- Chọn đệ quy khi code ngắn gọn, chọn vòng lặp khi cần tiết kiệm ngăn xếp.
- Bẫy thường gặp: quên base case, hoặc base case không bao giờ chạm tới khiến đệ quy chạy vô tận.

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)",
                "dsa", "{\"demo\":\"tree-traversal\"}", 30, teacher.Id);
            _context.Lessons.Add(lesson08);
            var lesson09 = new Lesson("Sắp xếp cơ bản (Bubble, Selection, Insertion)",
                @"# 🎯 Sắp xếp cơ bản (Bubble, Selection, Insertion)

## 1. Động cơ học
Mọi ứng dụng thực tế — từ bảng xếp hạng game đến lịch sử giao dịch ngân hàng — đều phải sắp xếp dữ liệu. Ba thuật toán O(N²) trong bài là nền tảng để hiểu vòng lặp lồng nhau, thao tác hoán đổi và tính ổn định — khái niệm cốt lõi cho Quick Sort, Merge Sort ở giai đoạn sau.

## 2. Lý thuyết cốt lõi
- **Bubble Sort**: duyệt mảng nhiều lượt, mỗi lượt so sánh từng cặp liền kề và đổi chỗ nếu sai thứ tự; phần tử lớn nhất trôi dần về cuối như bọt khí nổi lên.
- **Selection Sort**: chia mảng thành phần trái đã sắp xếp và phần phải chưa sắp xếp; mỗi bước tìm phần tử nhỏ nhất bên phải rồi đổi chỗ với phần tử đầu của phần đó.
- **Insertion Sort**: giữ phần đầu đã sắp xếp, lấy phần tử kế tiếp làm `key`, dịch các phần tử lớn hơn sang phải rồi chèn `key` vào đúng chỗ — y hệt cách xếp bài tây trên tay.

Cả ba đều in-place (bộ nhớ phụ O(1)) và đều stable. Khác biệt chính nằm ở số phép so sánh và đổi chỗ, quyết định tốc độ thực tế.

## 3. Thuật toán từng bước

### Bubble Sort với [5, 3, 8, 4, 2]
1. So sánh 5 và 3 → đổi chỗ → [3, 5, 8, 4, 2]
2. So sánh 5 và 8 → đúng thứ tự, giữ nguyên
3. So sánh 8 và 4 → đổi chỗ → [3, 5, 4, 8, 2]
4. So sánh 8 và 2 → đổi chỗ → [3, 5, 4, 2, 8]

Hết lượt 1, số 8 về đúng vị trí cuối; lượt 2 xét 4 phần tử đầu, số 5 về vị trí áp chót. Lặp lại đến khi mảng sắp xếp xong.

### Selection Sort với [64, 25, 12, 22, 11]
- Bước 1: min toàn mảng là 11, đổi chỗ với 64 → [11, 25, 12, 22, 64]
- Bước 2: min còn lại là 12, đổi chỗ với 25 → [11, 12, 25, 22, 64]
- Bước 3: min là 22, đổi chỗ với 25 → [11, 12, 22, 25, 64]

### Insertion Sort với [12, 11, 13, 5, 6]
- key = 11: dịch 12 sang phải, chèn 11 → [11, 12, 13, 5, 6]
- key = 13: đã đúng vị trí, không dịch chuyển
- key = 5: dịch 13, 12, 11 sang phải → [5, 11, 12, 13, 6]
- key = 6: dịch 13 sang phải rồi chèn → [5, 6, 11, 12, 13]

### Ví dụ
```javascript
// Bubble Sort có cờ swapped để dừng sớm khi mảng đã sắp xếp
function bubbleSort(arr) {
  for (let i = 0; i < arr.length - 1; i++) {
    let swapped = false;
    for (let j = 0; j < arr.length - 1 - i; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]; // đổi chỗ
        swapped = true;
      }
    }
    if (!swapped) break; // không còn cặp nào đổi chỗ, mảng đã xong
  }
  return arr;
}
```

## 4. Độ phức tạp & so sánh
| Thuật toán | Tốt nhất | Trung bình | Xấu nhất | Đổi chỗ tối đa |
| :--- | :--- | :--- | :--- | :--- |
| Bubble Sort | O(N) | O(N²) | O(N²) | O(N²) |
| Selection Sort | O(N²) | O(N²) | O(N²) | O(N) |
| Insertion Sort | O(N) | O(N²) | O(N²) | O(N²) |

- Bộ nhớ: O(1) — cả ba đều in-place, không cần mảng phụ.
- Ổn định: cả ba đều stable.
- Khi nào dùng: chọn **Insertion Sort** cho mảng nhỏ (dưới 16–32 phần tử) hoặc gần như đã sắp xếp — best case gần O(N), thân thiện CPU cache; C# Introsort dùng nó kết thúc các mảng con nhỏ.

## 5. Liên kết trực quan hóa
👉 Bấm **Trực Quan Hóa** để xem Bubble Sort từng bước trên canvas.

## 6. Tổng kết
- Bubble Sort dễ học nhất nhưng đổi chỗ nhiều nhất (O(N²)) nên ít dùng trong thực tế.
- Selection Sort luôn O(N²) nhưng đổi chỗ tối đa N − 1 lần — hợp hệ thống nhúng nơi thao tác ghi bộ nhớ đắt tiền.
- Insertion Sort best case O(N), là vua của mảng nhỏ và mảng gần sắp xếp.
- Bẫy thường gặp: quên cờ `swapped` khiến Bubble Sort không bao giờ đạt O(N); nhầm tưởng Selection Sort có best case tốt hơn O(N²).

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)",
                "sorting", "{\"demo\":\"bubble-sort\"}", 30, teacher.Id);
            _context.Lessons.Add(lesson09);
            var lesson10 = new Lesson("Tìm kiếm: Linear & Binary",
                @"# 🎯 Tìm kiếm: Linear & Binary

## 1. Động cơ học
Tìm kiếm là thao tác phổ biến nhất trong lập trình: tìm tài khoản trong danh sách, tra cứu từ điển, kiểm tra sản phẩm còn hàng. Khi mảng có 1 triệu phần tử, duyệt tuyến tính cần tới ~500.000 phép so sánh, trong khi tìm kiếm nhị phân chỉ cần khoảng 20 phép — nhưng đổi lại nó đòi hỏi dữ liệu đã được sắp xếp. Bài này giúp bạn chọn đúng thuật toán cho đúng tình huống.

## 2. Lý thuyết cốt lõi
- **Tìm kiếm tuyến tính (Linear Search)**: duyệt từng phần tử từ đầu đến cuối, so sánh với giá trị cần tìm `target`; trả về chỉ số đầu tiên khớp, hoặc −1 khi không tồn tại. Không cần bất kỳ điều kiện tiên quyết nào về thứ tự dữ liệu.
- **Tìm kiếm nhị phân (Binary Search)**: **bắt buộc mảng đã sắp xếp tăng dần**. Mỗi bước so sánh `target` với phần tử giữa (`mid`): bằng thì trả về, nhỏ hơn thì bỏ nửa bên phải, lớn hơn thì bỏ nửa bên trái — không gian tìm kiếm thu hẹp một nửa mỗi lần.
- **Công thức an toàn cho mid**: dùng `mid = low + (high - low) / 2` thay vì `(low + high) / 2`. Khi `low` và `high` rất lớn (gần 2,1 tỷ với kiểu int 32 bit), phép cộng `low + high` có thể tràn thành số âm và làm `mid` sai — một lỗi từng tồn tại trong thư viện Java suốt 9 năm.

## 3. Thuật toán từng bước

### Linear Search: tìm 8 trong mảng [5, 2, 8, 4, 1]
1. Vị trí 0 (số 5): khác 8 → sang tiếp
2. Vị trí 1 (số 2): khác 8 → sang tiếp
3. Vị trí 2 (số 8): khớp → trả về chỉ số 2

### Binary Search: tìm 23 trong mảng [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]
1. low = 0, high = 9, mid = 0 + (9 − 0) / 2 = 4 → arr[4] = 16. 16 < 23 nên low = 5.
2. low = 5, high = 9, mid = 5 + (9 − 5) / 2 = 7 → arr[7] = 56. 56 > 23 nên high = 6.
3. low = 5, high = 6, mid = 5 + (6 − 5) / 2 = 5 → arr[5] = 23. Khớp, trả về 5.

### Ví dụ
```javascript
// Binary Search: mảng đã sắp xếp tăng dần, trả về chỉ số hoặc -1
function binarySearch(arr, target) {
  let low = 0;
  let high = arr.length - 1;
  while (low <= high) {
    const mid = low + Math.floor((high - low) / 2); // tránh tràn số
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) low = mid + 1;  // bỏ nửa trái
    else high = mid - 1;                    // bỏ nửa phải
  }
  return -1; // không tìm thấy
}
```

## 4. Độ phức tạp & so sánh
| Trường hợp | Linear Search | Binary Search |
| :--- | :--- | :--- |
| Tốt nhất | O(1) — target ở đầu mảng | O(1) — target nằm ngay giữa |
| Trung bình | O(N) — trung bình N/2 bước | O(log N) |
| Xấu nhất | O(N) — target ở cuối hoặc không tồn tại | O(log N) |

- Bộ nhớ: O(1) cho cả hai.
- Khi nào chọn: Linear Search cho mảng nhỏ (dưới 50–100 phần tử), mảng chưa sắp xếp, dữ liệu thay đổi liên tục hoặc cần tìm tất cả vị trí xuất hiện. Binary Search cho mảng lớn, tĩnh và đã sắp xếp — chi phí sort O(N log N) nhiều khi đắt hơn cả việc duyệt tuyến tính một lần.

## 5. Liên kết trực quan hóa
👉 Bấm **Trực Quan Hóa** để xem Tìm kiếm nhị phân với các con trỏ low/mid/high.

## 6. Tổng kết
- Linear Search O(N), chạy trên mọi mảng, code đơn giản khó sai; không thể nhanh hơn O(N) về độ phức tạp tiệm cận.
- Binary Search O(log N) chỉ hoạt động đúng trên mảng đã sắp xếp — dùng trên mảng chưa sort cho kết quả sai mà không báo lỗi.
- Luôn dùng `low + (high - low) / 2` để tránh tràn số nguyên với chỉ số lớn.
- Bẫy thường gặp: quên điều kiện `low <= high` gây vòng lặp vô hạn; bỏ sót `mid + 1` / `mid - 1` khiến thuật toán không bao giờ hội tụ.

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)",
                "searching", "{\"demo\":\"binary-search\"}", 30, teacher.Id);
            _context.Lessons.Add(lesson10);
            var lesson11 = new Lesson("Two Pointers — Kỹ thuật hai con trỏ quét dữ liệu",
                @"# 🎯 Two Pointers — Kỹ thuật hai con trỏ quét dữ liệu

## 1. Động cơ học (Why this matters)
Muốn tìm cặp số có tổng bằng target trong mảng, cách ngây thơ dùng hai vòng lặp lồng nhau tốn O(N²) — với 100.000 phần tử là 10 tỷ phép so sánh. Kỹ thuật Two Pointers chỉ dùng hai biến chỉ số cùng quét dữ liệu để hạ xuống O(N), trở thành phản xạ đầu tiên khi gặp bài toán cặp số, tổng, đối xứng, trùng lặp.

## 2. Lý thuyết cốt lõi
- Con trỏ ở đây chỉ là hai biến số nguyên lưu vị trí (index) trong mảng, không phải con trỏ bộ nhớ kiểu C/C++.
- Nguyên lý vận hành: mỗi bước loại bỏ một vùng dữ liệu chắc chắn không chứa đáp án, nhờ vậy không bao giờ quét lại phần tử cũ.
- Ba biến thể chính:
  - Ngược chiều (opposite direction): left xuất phát đầu mảng, right xuất phát cuối mảng, chúng tiến về giữa.
  - Cùng chiều (same direction): cả hai xuất phát từ đầu, cùng đi về phải.
  - Chạy nhanh–chậm (fast & slow): con trỏ fast đi trước dò tìm, con trỏ slow đứng sau chốt vị trí ghi đè hợp lệ.

Khi mảng tăng dần, tổng quá nhỏ thì dịch left sang phải (loại số nhỏ nhất), tổng quá lớn thì dịch right sang trái (loại số lớn nhất). Mỗi phần tử bị loại đúng một lần nên tổng chi phí là O(N).

## 3. Thuật toán từng bước (mẫu ngược chiều — bài pair sum)
1. Khởi tạo left = 0, right = n - 1.
2. Tính sum = arr[left] + arr[right].
3. Nếu sum bằng target: trả về cặp chỉ số.
4. Nếu sum < target: tăng left (loại số nhỏ nhất).
5. Nếu sum > target: giảm right (loại số lớn nhất).
6. Lặp lại cho đến khi left >= right thì kết luận không tồn tại cặp.

Ví dụ arr = [2, 7, 11, 15], target = 18:
- Bước 1: 2 + 15 = 17 < 18 → tăng left.
- Bước 2: 7 + 15 = 22 > 18 → giảm right.
- Bước 3: 7 + 11 = 18 → trả về cặp chỉ số [1, 2].

### Ví dụ
```javascript
// Ngược chiều: tìm cặp có tổng bằng target trong mảng đã sắp xếp
function pairSumSorted(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  while (left < right) {
    const sum = arr[left] + arr[right];
    if (sum === target) return [left, right]; // tìm thấy cặp
    if (sum < target) left++;   // tổng nhỏ: loại số nhỏ nhất
    else right--;               // tổng lớn: loại số lớn nhất
  }
  return [-1, -1];              // không có cặp nào
}

// Cùng chiều fast & slow: xóa phần tử trùng trong mảng đã sắp xếp (in-place)
function removeDuplicates(nums) {
  if (nums.length === 0) return 0;
  let slow = 0;
  for (let fast = 1; fast < nums.length; fast++) {
    if (nums[fast] !== nums[slow]) {  // fast phát hiện số mới lạ
      slow++;                          // slow nhích lên chốt vị trí mới
      nums[slow] = nums[fast];         // ghi đè tại chỗ, không tốn RAM
    }
  }
  return slow + 1;                     // độ dài mảng hợp lệ
}
```

Ứng dụng khác: palindrome so sánh arr[left] với arr[right] rồi thu hẹp hai đầu; 3Sum giữ một vòng lặp for và hai con trỏ quét phần còn lại; container nhiều nước nhất thì dịch con trỏ bên cạnh ngắn hơn vì diện tích bị khóa bởi cạnh ngắn.

## 4. Độ phức tạp & so sánh
| Trường hợp | Thời gian | Ghi chú |
| :--- | :--- | :--- |
| Ngược chiều (pair sum, palindrome) | O(N) | mỗi bước loại đúng một phần tử |
| Cùng chiều fast & slow (remove duplicates) | O(N) | fast duyệt hết mảng, slow không bao giờ vượt fast |
| 3Sum | O(N²) | vòng for O(N) kết hợp hai con trỏ O(N) |

- Bộ nhớ: O(1) — chỉ dùng hai biến chỉ số, hoạt động in-place.
- Không phải thuật toán sắp xếp nên không bàn tính ổn định.

## 5. Liên kết trực quan hóa
👉 Bấm **Trực Quan Hóa** để xem kỹ thuật Two Pointers — hai con trỏ quét dữ liệu.

## 6. Tổng kết
- Dấu hiệu nhận biết: mảng đã sắp xếp, tìm cặp số, tổng, palindrome, trùng lặp, gộp mảng.
- Ngược chiều dùng khi mảng tăng dần, cùng chiều fast & slow dùng để xử lý in-place.
- Mọi biến thể đều chạy O(N) thời gian và O(1) bộ nhớ.
- Bẫy thường gặp: quên sắp xếp mảng trước khi dùng con trỏ ngược chiều; khởi tạo right = n thay vì n - 1 gây tràn chỉ số; quên tăng hoặc giảm con trỏ dẫn đến vòng lặp vô hạn; cộng hai số lớn gần ngưỡng gây tràn số nguyên — nên tính bằng long.

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)",
                "searching", "{\"demo\":\"two-pointers\"}", 30, teacher.Id);
            _context.Lessons.Add(lesson11);
            var lesson12 = new Lesson("Sliding Window — Kỹ thuật cửa sổ trượt",
                @"# 🎯 Sliding Window — Kỹ thuật cửa sổ trượt

## 1. Động cơ học (Why this matters)
Một kế toán viên phải tính tổng doanh thu từng nhóm 3 ngày liên tiếp trong năm. Cách ngây thơ cộng lại từ đầu mỗi nhóm, tốn O(N × K) phép toán. Kỹ thuật cửa sổ trượt chỉ cần lấy tổng cũ trừ đi ngày vừa rời khỏi cửa sổ và cộng thêm ngày mới bước vào — mỗi bước đúng 2 phép tính, đưa toàn bộ bài toán về O(N). Đây là mẫu thuật toán quan trọng nhất cho bài toán mảng con hoặc chuỗi con liên tục.

## 2. Lý thuyết cốt lõi
- Cửa sổ trượt được dùng khi đề bài nhắc đến mảng con (subarray) hoặc chuỗi con (substring) **liên tục** thỏa mãn điều kiện nào đó.
- Ý tưởng cốt lõi: **tái sử dụng kết quả đã tính** thay vì tính lại từ đầu mỗi lần.
- Hai biến thể:
  - Cửa sổ cố định (fixed window): kích thước K không đổi, trượt sang phải mỗi bước một ô.
  - Cửa sổ động (dynamic window): kích thước thay đổi, đầu right vươn lên ăn dữ liệu, đuôi left co lại khi cửa sổ vi phạm điều kiện.
- Độ phức tạp thời gian O(N): dù dynamic có vòng while lồng bên trong for, mỗi phần tử chỉ vào cửa sổ một lần và ra một lần, nên tổng chi phí là O(N) amortized.

## 3. Thuật toán từng bước (mẫu dynamic window)
1. Khởi tạo left = 0, right = 0, sum = 0.
2. Vươn right sang phải, cộng arr[right] vào cửa sổ.
3. Trong khi cửa sổ không hợp lệ: trừ arr[left] rồi tăng left để co đuôi.
4. Khi hợp lệ: cập nhật kết quả (độ dài, tổng, tần suất ký tự).
5. Lặp đến khi right chạm cuối mảng.

Ví dụ tìm mảng con ngắn nhất có tổng >= 7 với nums = [2, 1, 5, 2, 3, 2]:
- right = 2: sum = 8 hợp lệ, cửa sổ [2, 1, 5] dài 3; co đuôi trừ 2 còn 6, hết hợp lệ.
- right = 3: sum = 8 hợp lệ, co đuôi trừ 1 còn 7 vẫn hợp lệ, cửa sổ [5, 2] dài 2 — kỷ lục mới; trừ tiếp 5 còn 2.
- Kết quả: độ dài nhỏ nhất là 2, ứng với cửa sổ [5, 2].

### Ví dụ
```javascript
// Cửa sổ cố định: tổng lớn nhất của k phần tử liên tiếp
function maxSumFixed(arr, k) {
  let sum = 0;
  for (let i = 0; i < k; i++) sum += arr[i]; // cửa sổ đầu tiên
  let max = sum;
  for (let i = k; i < arr.length; i++) {
    sum = sum - arr[i - k] + arr[i]; // bỏ phần tử rời, thêm phần tử mới
    if (sum > max) max = sum;
  }
  return max;
}

// Cửa sổ động: mảng con ngắn nhất có tổng >= target
function minSubArrayLen(target, nums) {
  let left = 0;
  let sum = 0;
  let best = Infinity;
  for (let right = 0; right < nums.length; right++) {
    sum += nums[right];                 // vươn đầu cửa sổ
    while (sum >= target) {             // hợp lệ thì cố co đuôi lại
      best = Math.min(best, right - left + 1);
      sum -= nums[left];
      left++;
    }
  }
  return best === Infinity ? 0 : best;
}
```

Bài longest substring without repeating characters cũng theo mẫu trên: vươn right, khi ký tự lặp thì co left đến khi hết lặp rồi cập nhật chiều dài tối đa. Riêng sliding window maximum cần thêm deque (hàng đợi hai đầu) giữ các ứng viên lớn nhất.

## 4. Độ phức tạp & so sánh
| Biến thể | Thời gian | Không gian | Dấu hiệu nhận biết |
| :--- | :--- | :--- | :--- |
| Cửa sổ cố định | O(N) | O(1) | Chuỗi liên tiếp đúng K phần tử |
| Cửa sổ động | O(N) | O(1) | Dài nhất / ngắn nhất thỏa điều kiện |
| Sliding window maximum | O(N) | O(K) | Cần deque lưu ứng viên |

- Bộ nhớ: O(1) với hai biến left/right; O(K) nếu giữ thêm deque.

## 5. Liên kết trực quan hóa
👉 Bấm **Trực Quan Hóa** để xem Sliding Window — cửa sổ trượt qua dữ liệu.

## 6. Tổng kết
- Gặp subarray hoặc substring liên tục: nghĩ ngay đến cửa sổ trượt thay vì vòng lặp lồng nhau.
- Cửa sổ cố định: mỗi bước trừ phần tử cũ, cộng phần tử mới.
- Cửa sổ động: vươn right liên tục, dùng while co left khi không hợp lệ.
- Dù có vòng lặp lồng nhau, tổng chi phí vẫn là O(N) amortized vì mỗi phần tử xử lý đúng hai lần.
- Bẫy thường gặp: bài toán tổng dạng động đòi hỏi các số dương vì số âm phá vỡ tính đơn điệu của tổng (khi đó cần prefix sum kết hợp hash map); quên +1 trong công thức right - left + 1; thiếu kiểm tra arr.length < k ở cửa sổ cố định.

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)",
                "searching", "{\"demo\":\"sliding-window\"}", 30, teacher.Id);
            _context.Lessons.Add(lesson12);
            var lesson13 = new Lesson("Binary Search nâng cao",
                @"# 🎯 Binary Search nâng cao

## 1. Động cơ học
Nhiều bài toán không dừng lại ở việc tìm đúng một giá trị: cần vị trí chèn, khoảng chứa phần tử lặp, hay đáp án tối ưu trong một khoảng lớn. Bản nhị phân cơ bản trả về -1 không đủ cho các tình huống này. Chặt nhị phân trên biên và trên không gian kết quả là vũ khí quyết định trong phỏng vấn, đưa nhiều bài toán từ O(N) hay O(N²) về O(log N).

## 2. Lý thuyết cốt lõi
- **Lower bound (biên dưới):** chỉ số đầu tiên có `arr[i] >= x`. **Upper bound (biên trên):** chỉ số đầu tiên có `arr[i] > x`. Hai biên khép lại khoảng chứa giá trị x trong mảng sắp xếp.
- **Binary search on answer:** không tìm trong mảng mà tìm trong khoảng đáp án `[lo..hi]`; cần hàm predicate đơn điệu — chuỗi kết quả dạng Sai...Sai, Đúng...Đúng — và chỉ cần tìm ranh giới chuyển tiếp đầu tiên.
- Điều kiện tiên quyết: dữ liệu hoặc không gian đáp án phải có trật tự để loại bỏ một nửa mỗi bước.
- Chống tràn số: tính `mid = lo + (hi - lo) / 2` thay vì `(lo + hi) / 2`.

## 3. Thuật toán từng bước
1. Xác định điều kiện cần tìm (==, >= hay >) để chọn đúng template.
2. Template biên dùng `while (lo < hi)`: rẽ phải `lo = mid + 1` (vứt hẳn mid), rẽ trái `hi = mid` (giữ mid vì có thể là kết quả). Khi thoát, lo == hi là đáp án.
3. Template tìm chính xác dùng `while (lo <= hi)`: cả hai phía loại hẳn mid (`lo = mid + 1` hoặc `hi = mid - 1`); thoát vòng lặp nghĩa là không tồn tại.
4. Mảng xoay: so sánh `nums[mid]` với `nums[hi]` để nhận nửa còn giữ trật tự, rồi quyết định target có thuộc nửa đó để bỏ nửa kia.
5. Tìm đỉnh: so sánh `nums[mid]` với `nums[mid + 1]`; dốc lên thì đỉnh bên phải, dốc xuống thì đỉnh bên trái.
6. Binary search on answer: mô phỏng dãy predicate [F, F, T, T] rồi áp dụng template lower bound.

### Ví dụ minh họa
Xét `arr = [1, 2, 4, 4, 4, 5, 7]` với x = 4: lower bound dừng ở chỉ số 2, upper bound dừng ở chỉ số 5, khoảng chứa số 4 là [2..4]. Với x = 9, lower bound trả về arr.length = 7 — vị trí chèn hợp lệ.

```javascript
// Lower bound: chỉ số đầu tiên có giá trị >= x
function lowerBound(arr, x) {
  let lo = 0, hi = arr.length;            // hi mở: kết quả có thể là arr.length
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (arr[mid] < x) lo = mid + 1;       // mid chưa đạt ngưỡng, vứt hẳn
    else hi = mid;                        // mid có thể là kết quả, giữ lại
  }
  return lo;
}

// Tìm đỉnh trong mảng bất kỳ (nums[i-1] < nums[i] > nums[i+1])
function findPeak(nums) {
  let lo = 0, hi = nums.length - 1;
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (nums[mid] < nums[mid + 1]) lo = mid + 1;  // dốc lên, đỉnh bên phải
    else hi = mid;                                 // dốc xuống, đỉnh bên trái
  }
  return lo;
}

// Binary search on answer: tốc độ ăn tối thiểu của Koko
function minSpeed(piles, h) {
  let lo = 1, hi = Math.max(...piles);
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (canFinish(piles, h, mid)) hi = mid;        // đủ nhanh, thử chậm hơn
    else lo = mid + 1;                             // quá chậm, phải nhanh hơn
  }
  return lo;
}
function canFinish(piles, h, k) {
  let hours = 0;
  for (const p of piles) hours += Math.ceil(p / k);
  return hours <= h;
}
```

## 4. Độ phức tạp & so sánh
| Trường hợp | Thời gian | Ghi chú |
| :--- | :--- | :--- |
| Tìm chính xác / lower / upper bound | O(log N) | mỗi bước loại một nửa mảng |
| Tìm trong mảng xoay | O(log N) | phán đoán nửa còn trật tự |
| Tìm đỉnh | O(log N) | chỉ so sánh với lân cận phải |
| Binary search on answer | O(log M × F) | M là bề rộng khoảng đáp án, F là chi phí predicate |

- Bộ nhớ: O(1) cho mọi biến thể (không kể mảng đầu vào).

## 5. Liên kết trực quan hóa
👉 Bấm **Trực Quan Hóa** để xem Tìm kiếm nhị phân với các con trỏ low/mid/high.

## 6. Tổng kết
- Lower bound (≥ x) và upper bound (> x) khép lại khoảng chính xác của mọi giá trị lặp trong mảng sắp xếp.
- Template biên dùng `while (lo < hi)` với `hi = mid`; template tìm chính xác dùng `while (lo <= hi)` với `hi = mid - 1`.
- Bẫy kinh điển: `hi = mid - 1` khi đang tìm biên làm mất kết quả — hãy giữ nguyên mid.
- Mảng xoay và tìm đỉnh chỉ cần một phép so sánh định hướng mỗi bước.
- Binary search on answer biến bài toán có predicate đơn điệu thành O(log M) lần gọi hàm kiểm tra.

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)",
                "searching", "{\"demo\":\"binary-search\"}", 40, teacher.Id);
            _context.Lessons.Add(lesson13);
            var lesson14 = new Lesson("Prefix Sum & Difference Array",
                @"# 🎯 Prefix Sum & Difference Array

## 1. Động cơ học
Truy vấn tổng mảng con lặp đi lặp lại rất phổ biến trong phân tích dữ liệu và bài toán lập trình; nếu mỗi lần hỏi lại duyệt toàn bộ đoạn, chi phí tích lũy thành O(N × Q) và sụp đổ ngay khi N, Q lớn. Prefix sum trả lời mọi truy vấn tổng trong O(1) sau một lần tiền xử lý, còn difference array biến hàng loạt cập nhật phạm vi thành O(1) mỗi lần — bộ đôi vũ khí tưởng đơn giản nhưng xuất hiện trong vô số đề thi và bài toán dữ liệu tuần tự.

## 2. Lý thuyết cốt lõi
- Định nghĩa: `prefix[i] = prefix[i - 1] + arr[i]`, quy ước `prefix[0] = 0`.
- Truy vấn tổng: `arr[l..r] = prefix[r] - prefix[l - 1]` — lấy tổng cộng dồn đến r rồi khử bớt phần cộng dồn trước l.
- Difference array: cộng v lên cả đoạn [l..r] tương đương hai thao tác `diff[l] += v` và `diff[r + 1] -= v`; quét cộng dồn diff một lần sẽ tái tạo mảng cuối cùng.
- 2D prefix sum: `P[i][j] = P[i-1][j] + P[i][j-1] - P[i-1][j-1] + arr[i][j]`; truy vấn vùng hình chữ nhật chỉ cần cộng trừ bốn ô góc.
- Subarray sum equals K: số mảng con kết thúc tại vị trí hiện tại có tổng K đúng bằng số lần `prefix - K` đã xuất hiện trước đó, đếm bằng hash map.

## 3. Thuật toán từng bước
1. Xây dựng prefix: tạo mảng độ dài N + 1, gán `prefix[0] = 0`, rồi với i từ 1 đến N gán `prefix[i] = prefix[i - 1] + arr[i]`.
2. Trả lời truy vấn: tổng `arr[l..r] = prefix[r] - prefix[l - 1]` (chỉ số 1-based); khi l = 1 thì kết quả là `prefix[r]`.
3. Cập nhật phạm vi: với mỗi lệnh cộng v vào [l..r], ghi `diff[l] += v` và `diff[r + 1] -= v` (bỏ qua nếu tràn biên), cuối cùng quét cộng dồn để ra mảng kết quả.
4. Đếm mảng con tổng K: duy trì tổng chạy cur, đáp án tăng thêm số lần `cur - K` có trong hash (khởi tạo cặp (0, 1)), rồi lưu cur vào hash.

### Ví dụ minh họa
Với `arr = [3, 1, 4, 1, 5]`, prefix thu được là `[0, 3, 4, 8, 9, 14]`. Tổng arr[2..4] (1-based) = 1 + 4 + 1 = 6, khớp với công thức `prefix[4] - prefix[1] = 9 - 3`.

```javascript
// Xây mảng prefix, quy ước prefix[0] = 0
function buildPrefix(arr) {
  const prefix = new Array(arr.length + 1).fill(0);
  for (let i = 1; i <= arr.length; i++) {
    prefix[i] = prefix[i - 1] + arr[i - 1];
  }
  return prefix;
}

// Truy vấn tổng arr[l..r] theo chỉ số 0-based
function rangeSum(prefix, l, r) {
  return prefix[r + 1] - prefix[l];
}

// Cộng v vào arr[l..r] (0-based) bằng difference array
function rangeUpdate(arr, l, r, v) {
  const diff = new Array(arr.length + 1).fill(0);
  diff[l] += v;
  diff[r + 1] -= v;
  let cur = 0;
  for (let i = 0; i < arr.length; i++) {
    cur += diff[i];
    arr[i] += cur;
  }
}

// Đếm số mảng con liên tiếp có tổng bằng k
function subarraySum(arr, k) {
  const count = new Map([[0, 1]]);
  let cur = 0, result = 0;
  for (const num of arr) {
    cur += num;
    result += count.get(cur - k) ?? 0;
    count.set(cur, (count.get(cur) ?? 0) + 1);
  }
  return result;
}
```

## 4. Độ phức tạp & so sánh
| Trường hợp | Thời gian | Ghi chú |
| :--- | :--- | :--- |
| Xây dựng prefix sum | O(N) | một vòng duyệt duy nhất |
| Mỗi truy vấn tổng | O(1) | hai truy cập mảng, một phép trừ |
| Mỗi cập nhật phạm vi (diff array) | O(1) | ghi hai ô; tái tạo cuối O(N) |
| Subarray sum equals K | O(N) | hash map đếm tần suất prefix |
| 2D prefix: build / query | O(N×M) / O(1) | công thức bốn ô góc |

- Bộ nhớ: O(N) cho mảng prefix (O(N×M) cho bản 2D).

## 5. Liên kết trực quan hóa
🖥️ **Mô phỏng tương tác:** bài học này chưa có demo trực quan chuyên biệt — hãy tự chạy code mẫu ở mục 3, rồi tiếp tục với phần Quiz.

## 6. Tổng kết
- Prefix sum đổi chi phí O(N) mỗi truy vấn tổng mảng con thành O(1) với tiền xử lý O(N).
- Công thức `sum(l..r) = prefix[r] - prefix[l - 1]` chỉ đúng khi dùng quy ước `prefix[0] = 0`.
- Difference array giảm Q lần cập nhật phạm vi từ O(Q × N) xuống O(Q + N).
- Subarray sum equals K dùng hash đếm tần suất prefix, đạt O(N) thay vì O(N²).
- Bẫy thường gặp: quên xử lý lề khi l = 0, hoặc ghi `diff[r + 1]` vượt kích thước mảng.

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)",
                "dsa", "{}", 40, teacher.Id);
            _context.Lessons.Add(lesson14);
            var lesson15 = new Lesson("Kadane & Maximum Subarray",
                @"# 🎯 Kadane & Maximum Subarray

## 1. Động cơ học
Nhà đầu tư muốn biết đoạn ngày liên tiếp nào mang lại lợi nhuận cao nhất trong chuỗi lãi lỗ hằng ngày. Câu trả lời là một dãy con liên tiếp có tổng lớn nhất — bài toán Maximum Subarray. Thuật toán Kadane giải quyết nó chỉ trong một vòng lặp duy nhất, là câu hỏi kinh điển trong phỏng vấn và nền tảng cho nhiều bài toán chuỗi thời gian.

## 2. Lý thuyết cốt lõi
- Mảng con (subarray) là một dãy các phần tử ĐỨNG CẠNH NHAU trong mảng gốc — không được lấy rời rạc.
- Ý tưởng quy hoạch động: gọi `current` là tổng tốt nhất của mảng con KẾT THÚC tại vị trí đang xét. Chỉ có hai lựa chọn: nối phần tử mới vào mảng con đang dở (`current + arr[i]`), hoặc bắt đầu mảng con mới chỉ gồm `arr[i]`.
- Công thức lõi: `current = max(arr[i], current + arr[i])` rồi `best = max(best, current)`.
- `best` là tổng lớn nhất trong mọi mảng con có thể — chính là đáp án cần trả về.

Giải thích bằng lời văn riêng: Tổng tích lũy âm không bao giờ có ích cho tương lai — nối thêm chỉ làm tổng nhỏ đi, nên tối ưu nhất là vứt bỏ và khởi động lại từ phần tử mới. Tổng dương thì giữ lại vì phần tử kế tiếp có thể hưởng lợi. Kadane không lưu cả bảng quy hoạch động mà chỉ giữ hai biến, nhờ vậy bộ nhớ chỉ là O(1) trong khi kết quả vẫn tối ưu toàn cục.

## 3. Thuật toán từng bước
1. Khởi tạo `current = best = arr[0]` — bài toán yêu cầu mảng con không rỗng nên không khởi tạo bằng 0.
2. Duyệt từ i = 1 đến hết mảng: tính `current = max(arr[i], current + arr[i])`.
3. Cập nhật `best = max(best, current)`.
4. Trả về `best`.

Ví dụ mảng [-2, 1, -3, 4, -1, 2, 1, -5, 4]:
- i = 1: `current = max(1, -2 + 1) = 1`, `best = 1`; i = 2: `current = -2`, `best = 1`.
- i = 3: `current = 4`, `best = 4`; i = 4: `current = 3`; i = 5: `current = 5`, `best = 5`.
- i = 6: `current = 6`, `best = 6`; i = 7: `current = 1`; i = 8: `current = 5` — best giữ nguyên 6.

Đáp án là 6, tương ứng mảng con [4, -1, 2, 1].

### Ví dụ
```javascript
function maxSubarraySum(arr) {
  let current = arr[0]; // tổng mảng con tốt nhất kết thúc tại vị trí đang xét
  let best = arr[0];    // tổng mảng con tốt nhất toàn cục
  for (let i = 1; i < arr.length; i++) {
    // nối vào chuỗi cũ hoặc bắt đầu lại từ arr[i]
    current = Math.max(arr[i], current + arr[i]);
    best = Math.max(best, current);
  }
  return best;
}
```

## 4. Độ phức tạp & so sánh
| Trường hợp | Thời gian | Ghi chú |
| :--- | :--- | :--- |
| Tốt nhất | O(N) | Một vòng lặp duy nhất cho mọi đầu vào |
| Trung bình | O(N) | Không phụ thuộc phân bố dữ liệu |
| Xấu nhất | O(N) | So với brute force O(N²) |

- Bộ nhớ: O(1) — chỉ dùng hai biến `current` và `best`.
- Brute force duyệt mọi cặp (i, j) tốn O(N²); chia để trị đạt O(N log N) nhưng cài đặt phức tạp hơn hẳn mà không nhanh hơn Kadane.

## 5. Liên kết trực quan hóa
🖥️ **Mô phỏng tương tác:** bài học này chưa có demo trực quan chuyên biệt — hãy tự chạy code mẫu ở mục 3, rồi tiếp tục với phần Quiz.

## 6. Tổng kết
- Kadane quét mảng đúng một lần, giữ hai biến `current` và `best` theo công thức `current = max(arr[i], current + arr[i])`.
- Bẫy 1: với mảng toàn số âm, phải khởi tạo `current = best = arr[0]` — khởi tạo bằng 0 sẽ trả về 0 sai lệch.
- Bẫy 2: `current` âm nên vứt bỏ ngay; cộng dồn tiếp chỉ làm hỏng kết quả.
- Biến thể circular subarray: đáp án = `max(best tuyến tính, total − minSubarray)`, cẩn thận trường hợp toàn số âm.
- Biến thể max product: hai số âm nhân ra số dương nên phải giữ đồng thời min và max của tích tại mỗi bước.

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)",
                "dsa", "{}", 40, teacher.Id);
            _context.Lessons.Add(lesson15);
            var lesson16 = new Lesson("Monotonic Stack & Deque",
                @"# 🎯 Monotonic Stack & Deque

## 1. Động cơ học
Giáo viên muốn biết cho mỗi ngày, ngày nóng hơn gần nhất tiếp theo là ngày nào (bài toán Daily Temperatures kinh điển). Cách làm ngây thơ tốn O(N²), nhưng monotonic stack trả lời toàn bộ chỉ trong O(N). Tương tự, hệ thống giám sát cần giá trị lớn nhất của cửa sổ dữ liệu trượt mỗi giây — monotonic deque là công cụ chuẩn cho dạng bài này. Cả hai xuất hiện liên tục trong phỏng vấn lẫn xử lý tín hiệu thời gian thực.

## 2. Lý thuyết cốt lõi
- Monotonic stack là một stack bình thường bị ép duy trì trật tự đơn điệu: giảm dần (đáy lớn nhất, đỉnh nhỏ nhất) hoặc tăng dần (đáy nhỏ nhất, đỉnh lớn nhất).
- Khi phần tử mới phá vỡ tính đơn điệu, ta pop đỉnh tới khi thoả mãn; phần tử mới chính là Next Greater (hoặc Next Smaller) Element của những phần tử bị pop.
- Kinh nghiệm xương máu: luôn lưu CHỈ SỐ vào stack thay vì giá trị — index cho phép tra ngược giá trị qua arr[index] và tính khoảng cách.
- Deque (double-ended queue) cho phép thêm xóa ở cả hai đầu với chi phí O(1): AddFirst, AddLast, RemoveFirst, RemoveLast.

Giải thích bằng lời văn riêng: Với Next Greater Element, mỗi phần tử được push một lần và pop tối đa một lần nên tổng phép toán chỉ khoảng 2N — nguồn gốc của O(N) amortized dù có vòng lặp while lồng nhau. Với deque trong sliding window, ta giữ index giảm dần; phần tử mới đá bật phần tử nhỏ hơn ở đuôi vì chúng không bao giờ thành max, và xóa index đã trượt khỏi cửa sổ ở đầu deque.

## 3. Thuật toán từng bước (Next Greater Element với mảng [2, 1, 2, 4, 3])
1. Khởi tạo result gồm toàn -1 và stack rỗng.
2. i = 0 (giá trị 2): stack rỗng → push 0. Stack [0].
3. i = 1 (giá trị 1): 1 ≤ đỉnh 2, giữ giảm dần → push 1. Stack [0, 1].
4. i = 2, giá trị 2: 2 > 1 → pop 1, ghi result[1] = 2; đỉnh mới (index 0) không nhỏ hơn 2 nên dừng → push 2. Stack [0, 2].
5. i = 3, giá trị 4: 4 > 2 → pop 2, ghi result[2] = 4; 4 > 2 (index 0) → pop 0, ghi result[0] = 4; stack rỗng → push 3. Stack [3].
6. i = 4, giá trị 3: 3 ≤ 4, giữ giảm dần → push 4. Stack [3, 4].
7. Duyệt xong: index 3 và 4 còn kẹt trong stack nên result[3] = result[4] = -1.

Kết quả: [4, 2, 4, -1, -1]. Với deque, sliding window max của [1, 3, -1, -3, 5, 3, 6, 7], k = 3 cho [3, 3, 5, 5, 6, 7] — max ở đầu deque.

### Ví dụ
```javascript
function nextGreaterElements(arr) {
  const result = new Array(arr.length).fill(-1);
  const stack = []; // stack lưu chỉ số
  for (let i = 0; i < arr.length; i++) {
    // arr[i] lớn hơn đỉnh: chính là NGE của đỉnh đó
    while (stack.length > 0 && arr[i] > arr[stack[stack.length - 1]]) {
      result[stack.pop()] = arr[i];
    }
    stack.push(i); // lưu chỉ số, không lưu giá trị
  }
  return result;
}
```

## 4. Độ phức tạp & so sánh
| Trường hợp | Thời gian | Ghi chú |
| :--- | :--- | :--- |
| Tốt nhất | O(N) | Mỗi phần tử push/pop một lần |
| Trung bình | O(N) | Chi phí amortized |
| Xấu nhất | O(N) | Không bao giờ vượt quá 2N phép toán |

- Bộ nhớ: O(N) cho stack/deque và mảng kết quả.
- Brute force NGE tốn O(N²); sliding window brute force tốn O(N × k) trong khi deque chỉ tốn O(N).

## 5. Liên kết trực quan hóa
👉 Bấm **Trực Quan Hóa** để xem Monotonic Stack — minh họa thuật toán trên canvas.

## 6. Tổng kết
- Monotonic stack giải họ bài toán next greater/smaller element trong O(N) amortized.
- Luôn lưu chỉ số thay vì giá trị trong cả stack lẫn deque.
- Monotonic deque giữ thứ tự giảm dần, kiểm tra index trượt khỏi cửa sổ → sliding window max/min tốn O(N).
- Bẫy: quên loại index trượt khỏi cửa sổ gây kết quả sai; điều kiện > hay ≥ phải nhất quán khi xử lý phần tử trùng nhau.

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)",
                "dsa", "{\"demo\":\"monotonic-stack\"}", 40, teacher.Id);
            _context.Lessons.Add(lesson16);
            var lesson17 = new Lesson("Cây Nhị Phân Tìm Kiếm (Binary Search Tree — BST)",
                @"# 🎯 Cây Nhị Phân Tìm Kiếm (Binary Search Tree — BST)

## 1. Động cơ học (Why this matters)
Một ứng dụng quản lý điểm số cần vừa tìm kiếm nhanh vừa chèn bản ghi liên tục. Mảng chưa sắp xếp thì tìm mất O(N), mảng đã sắp xếp thì chèn phải dời cả khối phần tử, danh sách liên kết lại không thể tìm nhanh. BST dung hòa cả ba: tìm, chèn, xóa đều chạy O(log N) khi cây cân bằng. Đây là nền móng của từ điển, autocomplete và index trong cơ sở dữ liệu.

## 2. Lý thuyết cốt lõi
- BST là cây nhị phân: mỗi node có tối đa hai con `left` và `right`.
- **Quy tắc vàng:** toàn bộ node ở nhánh trái nhỏ hơn node hiện tại, toàn bộ node ở nhánh phải lớn hơn node hiện tại. Chuẩn BST không chứa giá trị trùng lặp.
- Nhờ quy tắc vàng, từ gốc mỗi bước so sánh loại bỏ một nửa số node còn lại, cùng tinh thần tìm kiếm nhị phân.
- Độ nhanh của mọi thao tác phụ thuộc **chiều cao cây h**: cân bằng có h ≈ log2(N), lệch thì thành chuỗi dài N node.

Quy tắc vàng là bất biến **toàn cục**, không phải so sánh cha – con: node 12 làm con phải của 5 trong nhánh trái gốc 10 vẫn vi phạm vì 12 lớn hơn 10. Vì thế khi kiểm tra BST phải truyền xuống khoảng giá trị (min, max) của từng nhánh.

## 3. Thuật toán từng bước
1. **Search:** so sánh khóa với node hiện tại; bằng là tìm thấy, nhỏ hơn rẽ trái, lớn hơn rẽ phải; chạm null là không tồn tại.
2. **Insert:** đi xuống như search; gặp null thì gắn node mới vào vị trí đó.
3. **Delete** có 3 trường hợp:
   - **Lá (không con):** cắt liên kết từ node cha, gán null.
   - **Một con:** nâng đứa con lên thay thế vị trí của node bị xóa.
   - **Hai con:** tìm in-order successor (node nhỏ nhất nhánh phải), chép giá trị lên node bị xóa, rồi xóa successor ở vị trí cũ — lúc này nó chỉ có tối đa một con nên quay về trường hợp dễ.
4. **Validate BST:** đệ quy với khoảng (min, max); mỗi node phải thỏa min < val < max; sang trái thu hẹp max, sang phải nâng min.

**Ví dụ:** chèn lần lượt 20, 10, 30, 12, 15. 20 làm gốc, 10 rẽ trái, 30 rẽ phải, 12 thành con phải của 10, 15 thành con phải của 12. Tìm 15 chỉ mất 4 bước: 20 → 10 → 12 → 15.

### Ví dụ
```javascript
// Chèn giá trị val vào BST, trả về gốc cây mới
function insert(root, val) {
  if (root === null) return { val, left: null, right: null }; // gắn vào chỗ trống
  if (val < root.val) {
    root.left = insert(root.left, val);    // nhỏ hơn: rẽ trái
  } else if (val > root.val) {
    root.right = insert(root.right, val);  // lớn hơn: rẽ phải
  }
  return root; // bằng nhau: bỏ qua, không chấp nhận trùng
}

// Kiểm tra cây có đúng là BST không (dùng khoảng min/max)
function isValidBST(root, min = -Infinity, max = Infinity) {
  if (root === null) return true;                      // cây rỗng hợp lệ
  if (root.val <= min || root.val >= max) return false; // ra ngoài khoảng
  return isValidBST(root.left, min, root.val) &&       // nhánh trái chặn trên
         isValidBST(root.right, root.val, max);        // nhánh phải chặn dưới
}
```

## 4. Độ phức tạp & so sánh
| Trường hợp | Thời gian | Ghi chú |
| :--- | :--- | :--- |
| Cây cân bằng | O(log N) | Dữ liệu ngẫu nhiên |
| Trung bình | O(log N) | Tùy phân bố dữ liệu |
| Xấu nhất | O(N) | Chèn dãy đã sắp xếp, cây lệch thành danh sách liên kết |

- Bộ nhớ: O(N) cho cây; mỗi thao tác đệ quy thêm O(h) cho call stack.
- Khắc phục cây lệch: dùng BST tự cân bằng như **AVL** (chênh lệch chiều cao hai nhánh không quá 1) hoặc **Red-Black**, tự xoay lại sau mỗi lần chèn/xóa để giữ O(log N).

## 5. Liên kết trực quan hóa
👉 Bấm **Trực Quan Hóa** để xem Binary Search Tree — mô phỏng cây trên canvas.

## 6. Tổng kết
- Quy tắc vàng trái < node < phải áp dụng cho toàn bộ nhánh, không chỉ hai con kề.
- Search và Insert đi chung một con đường rẽ nhánh; Delete có 3 trường hợp, khó nhất là node hai con phải dùng successor.
- Duyệt inorder trên BST cho dãy tăng dần — cách kiểm tra nhanh tính đúng đắn.
- Bẫy thường gặp: quên cập nhật liên kết khi xóa; validate chỉ so sánh node cha – con; tưởng BST lệch vẫn O(log N) trong khi thực tế đã thành O(N).

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)",
                "dsa", "{\"demo\":\"bst\"}", 40, teacher.Id);
            _context.Lessons.Add(lesson17);
            var lesson18 = new Lesson("Cây & Duyệt cây (DFS / BFS)",
                @"# 🎯 Cây & Duyệt cây (DFS / BFS)

## 1. Động cơ học (Why this matters)
Cấu trúc dạng cây xuất hiện khắp nơi: cây DOM của trang web, hệ thống thư mục, cây cú pháp của trình biên dịch, sơ đồ tổ chức công ty. Để thao tác với cây, việc đầu tiên là **duyệt** — đi qua mọi node đúng một lần. Khác với mảng chỉ có một chiều duyệt, cây cho phép nhiều thứ tự duyệt khác nhau, mỗi thứ tự phục vụ một bài toán riêng: sao chép cây, xóa cây, kiểm tra đối xứng, tìm tổ tiên chung.

## 2. Lý thuyết cốt lõi
- **Root:** node gốc, không có cha. **Leaf:** node lá, không có con nào.
- **Depth** của một node là số cạnh từ root tới node đó; **height** là số cạnh dài nhất từ node xuống một lá (chiều cao của cây chính là height của root).
- **Subtree:** cây con gồm một node cùng toàn bộ hậu duệ của nó.
- **Binary tree:** mỗi node tối đa hai con (left, right); cây rỗng (null) cũng là cây hợp lệ.
- **DFS (depth-first):** đi sâu hết một nhánh rồi mới quay lại, gồm 3 thứ tự: preorder (N-L-R), inorder (L-N-R), postorder (L-R-N), khác nhau ở vị trí thăm node.
- **BFS (breadth-first / level-order):** quét từng tầng từ trên xuống dưới bằng hàng đợi.
- Duyệt inorder trên một BST luôn ra dãy tăng dần; đảo thành R-N-L để ra dãy giảm dần.

## 3. Thuật toán từng bước
1. **Preorder (N-L-R):** thăm node trước, rồi duyệt trái, phải. Root in đầu tiên. Dùng để sao chép cây, serialize.
2. **Inorder (L-N-R):** duyệt trái, thăm node, duyệt phải. Trên BST cho dãy tăng dần.
3. **Postorder (L-R-N):** duyệt trái, duyệt phải, cuối cùng mới thăm node. Root in cuối. Dùng để xóa cây (xóa con trước cha) và tính dung lượng thư mục.
4. **Level-order (BFS):** đưa root vào queue, lặp lại dequeue rồi enqueue hai con; quét xong tầng này mới sang tầng kế.

**Ví dụ cây:** root 1, con trái 2 (có con 4, 5), con phải 3 (có con 6):
- Preorder: 1 2 4 5 3 6
- Inorder: 4 2 5 1 6 3
- Postorder: 4 5 2 6 3 1
- Level-order: 1 2 3 4 5 6

**Bài toán kinh điển:** max depth (chiều cao cây, đệ quy postorder); symmetric (so sánh hai nhánh đối xứng); invert (hoán đổi left/right mọi node); path sum (cộng dồn dọc đường đi); LCA (node thấp nhất là tổ tiên chung của hai node); diameter (đường dài nhất giữa hai node — tính tại mỗi node bằng left + right).

### Ví dụ
```javascript
// Chiều cao của cây nhị phân — đệ quy kiểu postorder
function maxDepth(root) {
  if (root === null) return 0;               // cây rỗng có độ sâu 0
  const left = maxDepth(root.left);          // đệ quy xuống nhánh trái
  const right = maxDepth(root.right);        // đệ quy xuống nhánh phải
  return 1 + Math.max(left, right);          // cộng 1 cho node hiện tại
}
```

## 4. Độ phức tạp & so sánh
| Duyệt | Thời gian | Bộ nhớ phụ |
| :--- | :--- | :--- |
| DFS — pre/in/postorder | O(N) | O(h) — call stack |
| BFS — level-order | O(N) | O(w) — hàng đợi chứa tầng rộng nhất |

- h là chiều cao cây, w là bề rộng tối đa của một tầng.
- Cả hai đều thăm đúng N node nên thời gian giống nhau; khác biệt nằm ở bộ nhớ phụ và thứ tự duyệt.
- Xấu nhất: cây lệch h = N khiến DFS dùng O(N) stack; cây đầy đủ tầng cuối rộng N/2 khiến BFS dùng O(N) hàng đợi.

## 5. Liên kết trực quan hóa
👉 Bấm **Trực Quan Hóa** để xem Duyệt cây In-order — minh họa các kiểu duyệt trên canvas.

## 6. Tổng kết
- DFS đi sâu hết nhánh rồi mới sang nhánh khác; BFS quét theo từng tầng với hàng đợi.
- Preorder cho root ở đầu, postorder cho root ở cuối, inorder trên BST cho dãy tăng dần.
- Thời gian duyệt luôn O(N); bộ nhớ phụ của DFS là O(h), của BFS là O(w).
- Bẫy thường gặp: quên xử lý cây rỗng (null); nhầm thứ tự ba kiểu duyệt; cây sâu hàng trăm nghìn tầng có thể tràn ngăn xếp — hãy đổi sang stack tường minh.

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)",
                "dsa", "{\"demo\":\"tree-traversal\"}", 40, teacher.Id);
            _context.Lessons.Add(lesson18);
            var lesson19 = new Lesson("Heap & Hàng đợi ưu tiên (Priority Queue)",
                @"# 🎯 Heap & Hàng đợi ưu tiên (Priority Queue)

## 1. Động cơ học (Why this matters)
Khoa cấp cứu luôn cần đưa bệnh nhân nặng nhất vào phòng mổ ngay lập tức, dù bệnh nhân đến không theo thứ tự. Nếu giữ danh sách đã sắp xếp, thêm người mới mất O(N); nếu giữ mảng lộn xộn, tìm người nặng nhất cũng mất O(N). Heap giải quyết trọn vẹn: thêm phần tử mới trong O(log N) và lấy phần tử ưu tiên nhất trong O(1). Chính cấu trúc này đứng sau hàng đợi ưu tiên dùng trong Dijkstra, nén Huffman, top K và heap sort.

## 2. Lý thuyết cốt lõi
- Heap là một cây nhị phân hoàn chỉnh (complete binary tree) thỏa mãn heap property.
- Min-heap: mỗi cha luôn nhỏ hơn hoặc bằng con, nên root chứa phần tử NHỎ NHẤT.
- Max-heap: mỗi cha luôn lớn hơn hoặc bằng con, nên root chứa phần tử LỚN NHẤT.
- Heap không phải BST: không có quy tắc trái nhỏ phải lớn, chỉ đảm bảo root là cực trị nên heap KHÔNG sắp xếp toàn bộ dữ liệu — nó chỉ biết ai đứng đầu hàng.
- Nhờ tính chất cây hoàn chỉnh, heap được lưu gọn trong một mảng không cần con trỏ: con trái tại 2*i+1, con phải tại 2*i+2, cha tại (i-1)/2.
- Hàng đợi ưu tiên là khái niệm trừu tượng, còn heap là cách cài đặt hiệu quả cho nó.

## 3. Thuật toán từng bước
1. **Peek:** trả về arr[0] — phần tử cực trị — trong O(1).
2. **Insert:** đẩy phần tử mới vào cuối mảng, sau đó sift up (đổi chỗ với cha khi vi phạm heap property) cho tới khi đúng vị trí — O(log N).
3. **Remove top:** giữ root, kéo phần tử cuối lên thay thế, rồi sift down (đổi chỗ với con nhỏ nhất/lớn nhất) — O(log N).

Ví dụ min-heap [5, 7, 10, 15, 20, 25, 30]: chèn 8 vào cuối mảng, 8 nhỏ hơn cha 15 nên đổi chỗ, rồi lớn hơn cha mới 7 nên dừng — mảng thành [5, 7, 10, 8, 20, 25, 30, 15]. Ngược lại khi lấy phần tử nhỏ nhất, 5 rời heap, phần tử cuối 15 được kéo lên root rồi sift down qua hai lần đổi chỗ, heap trở thành [7, 8, 10, 15, 20, 25, 30]. Mỗi thao tác đi qua nhiều nhất log2(N) tầng cây.

### Ví dụ
```javascript
// Min-heap tối giản, lưu bằng mảng
class MinHeap {
  constructor() { this.arr = []; }
  peek() { return this.arr[0]; }              // O(1)
  insert(v) {
    this.arr.push(v);
    let i = this.arr.length - 1;
    while (i > 0) {                           // sift up
      let p = (i - 1) >> 1;                   // cha của i
      if (this.arr[p] <= this.arr[i]) break;  // đã đúng vị trí
      [this.arr[p], this.arr[i]] = [this.arr[i], this.arr[p]];
      i = p;
    }
  }
  extractMin() {
    const top = this.arr[0];
    const last = this.arr.pop();              // phần tử cuối
    if (this.arr.length > 0) {
      this.arr[0] = last;                     // kéo lên root
      let i = 0;
      while (true) {                          // sift down
        let l = 2 * i + 1, r = 2 * i + 2, s = i;
        if (l < this.arr.length && this.arr[l] < this.arr[s]) s = l;
        if (r < this.arr.length && this.arr[r] < this.arr[s]) s = r;
        if (s === i) break;                   // con đều lớn hơn
        [this.arr[s], this.arr[i]] = [this.arr[i], this.arr[s]];
        i = s;
      }
    }
    return top;
  }
}
```

## 4. Độ phức tạp & so sánh
| Thao tác | Độ phức tạp | Ghi chú |
| :--- | :--- | :--- |
| Peek | O(1) | Đọc thẳng arr[0] |
| Insert | O(log N) | Sift up nhiều nhất log2(N) tầng |
| Remove top | O(log N) | Sift down nhiều nhất log2(N) tầng |
| Build heap từ mảng | O(N) | Heapify từ dưới lên |
| Tìm phần tử bất kỳ | O(N) | Heap không hỗ trợ tìm kiếm nhanh |

- Bộ nhớ: O(N) — heap nằm trong một mảng liên tục nên rất thân thiện cache.
- Build heap bằng heapify từ dưới lên chỉ mất O(N), nhanh hơn chèn N phần tử từng cái (O(N log N)).
- Heap không ổn định (unstable): hai phần tử cùng ưu tiên có thể được lấy ra theo thứ tự bất kỳ.

## 5. Liên kết trực quan hóa
👉 Bấm **Trực Quan Hóa** để xem Heap Sort — mô phỏng heap trên canvas.

## 6. Tổng kết
- Min-heap đặt phần tử nhỏ nhất ở root, max-heap đặt phần tử lớn nhất ở root; chỉ mất O(1) để xem đỉnh.
- Insert và remove top đều O(log N) nhờ sift up và sift down trên cây hoàn chỉnh.
- Heap không sắp xếp toàn bộ dữ liệu, không tìm kiếm nhanh (O(N)) và không ổn định.
- Ứng dụng tiêu biểu: top K, kth largest, trộn K danh sách đã sắp xếp, duy trì median bằng hai heap, Dijkstra.
- Bẫy thường gặp: nhầm con trái là 2*i thay vì 2*i+1 (mảng bắt đầu tại 0); quên sift down sau khi kéo phần tử cuối lên root; nhầm heap với BST.

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)",
                "sorting", "{\"demo\":\"heap-sort\"}", 40, teacher.Id);
            _context.Lessons.Add(lesson19);
            var lesson20 = new Lesson("Đồ thị (Graph): biểu diễn & duyệt BFS/DFS",
                @"# 🎯 Đồ thị (Graph): biểu diễn & duyệt BFS/DFS

## 1. Động cơ học (Why this matters)
Mạng xã hội, bản đồ chỉ đường, hệ thống phụ thuộc gói thư viện, mạch điện đều là những mạng lưới kết nối — tất cả được mô hình hóa bằng đồ thị. Để xử lý chúng (tìm đường, tìm nhóm liên thông, phát hiện vòng lặp phụ thuộc), ta cần một cách biểu diễn hiệu quả và một chiến lược duyệt đỉnh. BFS và DFS là hai chiến lược nền tảng cho gần như mọi thuật toán đồ thị.

## 2. Lý thuyết cốt lõi
- Đồ thị gồm tập đỉnh V và tập cạnh E; ký hiệu N = |V|, M = |E|.
- Vô hướng: cạnh A-B đi cả hai chiều. Có hướng: cạnh A→B chỉ đi từ A sang B. Có trọng số: mỗi cạnh mang một chi phí.
- Danh sách kề (adjacency list): mỗi đỉnh giữ danh sách hàng xóm; bộ nhớ O(N+M), phù hợp đồ thị thưa (ít cạnh).
- Ma trận kề (adjacency matrix): bảng N×N; kiểm tra cạnh u-v trong O(1) nhưng tốn O(N²) bộ nhớ, hợp đồ thị dày đặc.
- BFS dùng queue, duyệt theo tầng; lần đầu chạm tới một đỉnh là đường ngắn nhất tính theo số cạnh trong đồ thị không trọng số.
- DFS dùng stack (tường minh hoặc call stack của đệ quy), đâm sâu hết nhánh rồi quay lui (backtrack).
- visited là bắt buộc cho cả hai: nếu thiếu, đồ thị có chu trình khiến thuật toán lặp vô hạn hoặc tràn ngăn xếp.

## 3. Thuật toán từng bước
**BFS:**
1. Enqueue đỉnh xuất phát và đánh dấu visited ngay lập tức.
2. Lặp: dequeue một đỉnh, xử lý nó.
3. Với mỗi hàng xóm chưa thăm: đánh dấu visited rồi enqueue.

**DFS:**
1. Đánh dấu đỉnh hiện tại đã thăm và xử lý nó.
2. Đệ quy sang từng hàng xóm chưa thăm.
3. Khi hết hàng xóm, quay lui về đỉnh trước.

Ví dụ đồ thị vô hướng A-B, A-C, B-D, B-E, C-F. BFS từ A cho thứ tự A B C D E F (quét hết tầng 1 là B, C rồi mới tới tầng 2) và khẳng định đường A→D chỉ cần 2 cạnh. DFS từ A cho thứ tự A B D E C F (đâm sâu xuống D trước khi quay lên), phù hợp tìm kiếm tổ hợp hơn.

### Ví dụ
```javascript
// BFS: duyệt theo tầng bằng hàng đợi
function bfs(graph, start) {
  const visited = new Set([start]);            // đánh dấu NGAY khi enqueue
  const queue = [start];                       // mảng dùng như queue
  const order = [];
  while (queue.length) {
    const u = queue.shift();
    order.push(u);
    for (const v of graph[u] || []) {
      if (!visited.has(v)) {
        visited.add(v);                        // chống enqueue trùng
        queue.push(v);
      }
    }
  }
  return order;
}

// DFS: đệ quy lợi dụng call stack
function dfs(graph, u, visited = new Set(), order = []) {
  visited.add(u);
  order.push(u);
  for (const v of graph[u] || []) {
    if (!visited.has(v)) dfs(graph, v, visited, order);
  }
  return order;
}
```

## 4. Độ phức tạp & so sánh
| Cách biểu diễn | Bộ nhớ | Kiểm tra cạnh u-v |
| :--- | :--- | :--- |
| Danh sách kề | O(N + M) | O(deg(u)) — phải quét danh sách |
| Ma trận kề | O(N²) | O(1) — đọc ô (u, v) |

- BFS và DFS đều duyệt toàn bộ đồ thị trong O(N + M): mỗi đỉnh vào hàng đợi/ngăn xếp một lần, mỗi cạnh xét một lần.
- Bộ nhớ phụ: BFS O(N) cho queue; DFS O(N) cho call stack xấu nhất (chuỗi dài).
- Bài toán ứng dụng: number of islands (đếm vùng liên thông trên lưới), clone graph (sao chép đồ thị), đường đi ngắn nhất không trọng số (BFS), phát hiện chu trình (DFS kèm parent hoặc mảng inStack).

## 5. Liên kết trực quan hóa
👉 Bấm **Trực Quan Hóa** để xem BFS trên đồ thị — minh họa duyệt theo tầng.

## 6. Tổng kết
- Danh sách kề tiết kiệm bộ nhớ cho đồ thị thưa; ma trận kề trả lời câu hỏi có cạnh hay không trong O(1).
- BFS dùng queue, duyệt theo tầng, tìm được đường ngắn nhất trên đồ thị không trọng số.
- DFS dùng stack/đệ quy, đâm sâu rồi quay lui, là nền tảng của backtracking và phát hiện chu trình.
- Cả hai đều chạy O(N + M) và đều cần visited để chống vòng lặp khi có chu trình.
- Bẫy thường gặp: quên visited dẫn tới vòng lặp vô hạn; đánh dấu visited sau khi dequeue khiến một đỉnh bị enqueue nhiều lần; nhầm cạnh lùi về cha với chu trình vô hướng; DFS đệ quy có thể tràn stack trên đồ thị rất sâu.

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)",
                "graph", "{\"demo\":\"bfs\"}", 40, teacher.Id);
            _context.Lessons.Add(lesson20);
            var lesson21 = new Lesson("Topological Sort (Sắp xếp tô-pô)",
                @"# 🎯 Topological Sort (Sắp xếp tô-pô)

## 1. Động cơ học (Why this matters)
Sắp xếp tô-pô (topological sort) là thuật toán sắp thứ tự các công việc phụ thuộc lẫn nhau — từ lịch học môn trước môn sau, đến thứ tự biên dịch gói trong mọi hệ thống build như make, npm, Maven.

## 2. Lý thuyết cốt lõi
- **DAG (Directed Acyclic Graph):** đồ thị có hướng không chứa chu trình — điều kiện tiên quyết để có thứ tự tô-pô.
- **Sắp xếp tô-pô:** thứ tự tuyến tính của mọi đỉnh sao cho với mỗi cạnh (u, v), đỉnh u luôn đứng trước đỉnh v.
- Mọi DAG có ít nhất một thứ tự tô-pô; đồ thị có chu trình thì không có thứ tự nào.
- Thứ tự tô-pô KHÔNG duy nhất: cùng một DAG thường có nhiều cách sắp xếp hợp lệ.
- Đỉnh có indegree bằng 0 (không cạnh nào đi vào) không có tiền đề nên luôn nằm ở đầu thứ tự.

Quan sát quan trọng: mỗi cạnh chỉ ràng buộc thứ tự tương đối, u phải trước v nhưng khoảng cách giữa chúng tùy ý — vì vậy thứ tự tô-pô thường không duy nhất. Ngược lại, một chu trình tạo quan hệ trước sau mâu thuẫn nên đồ thị có chu trình không có thứ tự tô-pô, và hệ thống build phải báo lỗi dependency.

## 3. Thuật toán từng bước
**Cách 1 — Kahn (indegree + hàng đợi):**
1. Tính indegree của từng đỉnh.
2. Đưa mọi đỉnh có indegree 0 vào hàng đợi.
3. Dequeue đỉnh u, thêm vào kết quả, giảm indegree của mọi đỉnh kề v.
4. Đỉnh nào indegree về 0 thì enqueue.
5. Lặp đến khi hàng đợi rỗng; nếu xử lý được ít hơn V đỉnh thì đồ thị có chu trình.

**Ví dụ:** môn 0 trước môn 1, 2; môn 1, 2 trước môn 3 (cạnh 0→1, 0→2, 1→3, 2→3). Indegree: 0:0, 1:1, 2:1, 3:2. Hàng đợi khởi đầu [0]; xử lý 0 làm indegree của 1, 2 về 0 → [1, 2]; xử lý 1, rồi 2 làm indegree của 3 về 0 → [3]. Kết quả: 0, 1, 2, 3 — 0, 2, 1, 3 cũng hợp lệ.

**Cách 2 — DFS postorder:**
1. Duyệt DFS từ mọi đỉnh chưa thăm, dùng ba trạng thái: 0 chưa thăm, 1 đang trong nhánh, 2 hoàn thành.
2. Sau khi duyệt xong toàn bộ đỉnh kề, thêm đỉnh hiện tại vào mảng kết quả.
3. Đảo ngược mảng để có thứ tự tô-pô.
4. Gặp lại đỉnh trạng thái 1 (back edge) nghĩa là có chu trình.

### Ví dụ
```javascript
function topologicalSort(numCourses, prerequisites) {
  const indegree = new Array(numCourses).fill(0);
  const adj = Array.from({ length: numCourses }, () => []);
  for (const [u, v] of prerequisites) { // cạnh u truoc v
    adj[u].push(v);
    indegree[v]++;
  }
  const queue = [];
  for (let i = 0; i < numCourses; i++) {
    if (indegree[i] === 0) queue.push(i); // khong con tien de
  }
  const order = [];
  while (queue.length > 0) {
    const u = queue.shift();
    order.push(u);
    for (const v of adj[u]) {
      indegree[v]--;
      if (indegree[v] === 0) queue.push(v); // du dieu kien vao hang doi
    }
  }
  // neu khong xu ly du V dinh, do thi co chu trinh
  return order.length === numCourses ? order : [];
}
```

## 4. Độ phức tạp & so sánh
| Trường hợp | Thời gian | Ghi chú |
| :--- | :--- | :--- |
| Kahn | O(V + E) | Mỗi đỉnh vào hàng đợi 1 lần, mỗi cạnh giảm indegree 1 lần |
| DFS postorder | O(V + E) | Mỗi đỉnh và mỗi cạnh được duyệt đúng 1 lần |

- Bộ nhớ: O(V + E) cho danh sách kề, thêm O(V) cho hàng đợi và indegree (Kahn) hoặc call stack (DFS).
- Đồ thị có chu trình không có thứ tự tô-pô; hãy kiểm tra cycle trước khi dùng kết quả.

## 5. Liên kết trực quan hóa
🖥️ **Mô phỏng tương tác:** bài học này chưa có demo trực quan chuyên biệt — hãy tự chạy code mẫu ở mục 3, rồi tiếp tục với phần Quiz.

## 6. Tổng kết
- Sắp xếp tô-pô chỉ áp dụng cho DAG; chu trình khiến thuật toán không thể xếp hết đỉnh.
- Kahn dùng hàng đợi và indegree; DFS dùng postorder rồi đảo ngược mảng kết quả.
- Cả hai cách đều chạy trong O(V + E) thời gian và bộ nhớ.
- Bẫy thường gặp: quên kiểm tra cycle; nhầm chiều cạnh; ngộ nhận thứ tự là duy nhất.

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)",
                "dsa", "{}", 40, teacher.Id);
            _context.Lessons.Add(lesson21);
            var lesson22 = new Lesson("Backtracking (Quay lui)",
                @"# 🎯 Backtracking (Quay lui)

## 1. Động cơ học (Why this matters)
Sudoku, xếp 8 quân hậu, tìm đường trong mê cung — bài toán không có công thức giải trực tiếp, phải dò thử nhiều khả năng. Dò mù (brute force) sinh hàng tỷ tổ hợp thì máy tính cũng chịu thua; quay lui (backtracking) dò thông minh hơn: thử từng bước, gặp ngõ cụt thì lùi lại, cắt bỏ cả nhánh vô ích.

## 2. Lý thuyết cốt lõi
- Backtracking là DFS duyệt **cây không gian trạng thái**: mỗi nút là một lời giải dở dang, mỗi nhánh là một lựa chọn tiếp theo.
- Tại mỗi bước: chọn ứng viên hợp lệ → đệ quy sang trạng thái kế tiếp → sau khi quay về, **hủy bỏ lựa chọn (unchoose)** để thử ứng viên khác.
- Unchoose là điểm khác biệt sống còn với DFS thường: nó trả state về nguyên trạng để mọi nhánh dùng chung một đường đi.
- **Pruning (cắt tỉa):** bỏ sớm nhánh không thể dẫn tới lời giải — nguồn sức mạnh lớn nhất của kỹ thuật này.

Mọi nhánh con chia sẻ chung một state nên backtracking tốn bộ nhớ bằng đúng độ sâu đệ quy, nhưng cũng cực nhạy cảm với sai sót: quên unchoose khiến dữ liệu nhánh trước tràn sang nhánh sau, kết quả lặp hoặc sai. Hãy nhớ cặp bất biến: đã chọn gì thì phải hủy đúng cái đó.

## 3. Thuật toán từng bước
**Mẫu chung backtrack(state):**
1. Base case: trạng thái đã đủ → ghi nhận lời giải rồi return.
2. Duyệt mọi lựa chọn hợp lệ ở bước hiện tại.
3. Choose: thực hiện lựa chọn, cập nhật state.
4. Đệ quy sang trạng thái kế tiếp.
5. Unchoose: hủy lựa chọn vừa làm rồi thử lựa chọn khác.

**Các bài toán kinh điển:**
- **Subsets:** mỗi phần tử quyết định lấy hoặc không lấy → 2^n tập con.
- **Permutations:** mảng visited đánh dấu phần tử đã dùng → n! hoán vị.
- **Combinations:** chọn k phần tử, bắt đầu từ vị trí start để tránh lặp thứ tự.
- **N-Queens:** đặt hậu từng hàng, kiểm tra cột và hai đường chéo; bảng 4x4 chỉ có 2 lời giải nhờ cắt tỉa.
- **Generate parentheses:** thêm '(' khi open < n, thêm ')' khi close < open.
- **Word search:** DFS bốn hướng quanh ô hiện tại kèm visited; quay lui khi chạm biên hoặc ký tự sai.

**Ví dụ subsets [1, 2]:** cây lựa chọn có/không sinh ra [] → [1] → [1, 2] → [2] theo thứ tự DFS.

### Ví dụ
```javascript
function subsets(nums) {
  const result = [];
  const path = [];
  function backtrack(start) {
    result.push([...path]);            // moi trang thai la mot subset
    for (let i = start; i < nums.length; i++) {
      path.push(nums[i]);              // choose: lay nums[i]
      backtrack(i + 1);                // de quy sang phan tu ke tiep
      path.pop();                      // unchoose: bo nums[i] de thu cai khac
    }
  }
  backtrack(0);
  return result;
}
```

**Chống trùng lặp:** với đầu vào có phần tử trùng (subsets II, permutations II), sắp xếp trước rồi bỏ qua phần tử giống phần tử liền trước khi i > start, hoặc dùng Set theo từng mức đệ quy.

## 4. Độ phức tạp & so sánh
| Bài toán | Thời gian | Ghi chú |
| :--- | :--- | :--- |
| Subsets / Combinations | O(2^n) | O(n · 2^n) nếu copy mảng mỗi lần ghi nhận |
| Permutations | O(n!) | O(n · n!) nếu copy từng hoán vị |
| N-Queens | O(n!) | Cắt tỉa khiến thực tế nhanh hơn nhiều |

- Bộ nhớ: O(n) cho call stack và mảng path; N-Queens thêm O(n²) cho bảng cờ.
- Pruning đúng chỗ biến thuật toán bất khả thi thành chạy được trong thực tế.

## 5. Liên kết trực quan hóa
🖥️ **Mô phỏng tương tác:** bài học này chưa có demo trực quan chuyên biệt — hãy tự chạy code mẫu ở mục 3, rồi tiếp tục với phần Quiz.

## 6. Tổng kết
- Backtracking = DFS trên cây không gian trạng thái với cặp choose/unchoose.
- Quên unchoose là lỗi phổ biến nhất — state bị ô nhiễm, kết quả lặp hoặc thiếu.
- Luôn cắt tỉa sớm và dùng visited/Set để chống lời giải trùng.
- Độ phức tạp cấp số nhân (2^n hoặc n!), chỉ khả thi khi pruning hiệu quả.

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)",
                "dsa", "{}", 40, teacher.Id);
            _context.Lessons.Add(lesson22);
            var lesson23 = new Lesson("Chia để Trị (Divide & Conquer)",
                @"# 🎯 Chia để Trị (Divide & Conquer)

## 1. Động cơ học (Why this matters)
Sắp xếp hàng triệu bản ghi, tìm kiếm trong danh bạ khổng lồ, phát hiện cặp điểm gần nhau nhất trên bản đồ — duyệt theo kiểu ngây thơ sẽ chậm không chịu nổi. Chia để trị (Divide and Conquer) là tư duy đập vỡ bài toán lớn thành những mảnh nhỏ dễ giải rồi nối kết lời giải lại. Đây là nền tảng của những thuật toán nhanh nhất thế giới: Merge Sort, Quick Sort và Binary Search.

## 2. Lý thuyết cốt lõi
- Định nghĩa (CLRS): ba giai đoạn — **Divide** (chia bài toán thành các bài toán con nhỏ hơn, độc lập, cùng dạng), **Conquer** (giải đệ quy từng bài toán con, dừng khi đủ nhỏ để giải trực tiếp), **Combine** (gộp lời giải thành lời giải chung).
- **Base case:** bài toán đủ nhỏ — mảng một phần tử luôn được coi là đã sắp xếp.
- Mọi thuật toán D&C sinh ra cây đệ quy; độ phức tạp phụ thuộc số nhánh a, mức giảm kích thước b và chi phí gộp f(n).
- **Master Theorem:** với T(n) = aT(n/b) + O(n^d), so sánh a với b^d: bằng nhau cho O(n^d log n), nhỏ hơn cho O(n^d), lớn hơn cho O(n^log_b(a)).
- Điển hình: Merge Sort → O(n log n); Quick Sort trung bình O(n log n); Binary Search O(log n); Closest Pair O(n log n) — bước gộp chỉ kiểm tra tối đa 7 điểm ở dải giữa nên mỗi tầng tốn O(n).

## 3. Thuật toán từng bước
1. **Chia:** tách bài toán thành các bài toán con độc lập, cùng dạng — thường là chia đôi mảng.
2. **Trị:** gọi đệ quy giải từng bài toán con cho tới khi chạm base case.
3. **Gộp:** kết hợp lời giải các phần — bước khó nhất và quyết định độ phức tạp tổng thể.

**Ví dụ Merge Sort với mảng [38, 27, 43, 3]:**
- Chia: [38, 27] và [43, 3]; chia tiếp: [38] | [27] và [43] | [3].
- Trị: mảng một phần tử xem như đã sắp xếp.
- Gộp: [27, 38]; [3, 43]; trộn kiểu dây kéo thành [3, 27, 38, 43].

**Binary Search** cũng là D&C: so sánh target với phần tử giữa rồi tìm nửa trái hoặc nửa phải — bước gộp miễn phí nên đạt O(log n).

### Ví dụ
```javascript
// Merge Sort — chia để trị kinh điển
function mergeSort(arr) {
  if (arr.length <= 1) return arr;            // base case: mảng 1 phần tử đã sắp xếp
  const mid = Math.floor(arr.length / 2);     // Chia: tìm điểm giữa
  const left = mergeSort(arr.slice(0, mid));  // Trị: đệ quy nửa trái
  const right = mergeSort(arr.slice(mid));    // Trị: đệ quy nửa phải
  return merge(left, right);                  // Gộp: trộn hai nửa đã sắp xếp
}

function merge(a, b) {
  const out = [];
  let i = 0, j = 0;
  while (i < a.length && j < b.length) {      // trộn kiểu dây kéo áo
    if (a[i] <= b[j]) out.push(a[i++]);
    else out.push(b[j++]);
  }
  return out.concat(a.slice(i)).concat(b.slice(j)); // hốt nốt phần còn lại
}
```

## 4. Độ phức tạp & so sánh
| Trường hợp | Merge Sort | Quick Sort | Binary Search |
| :--- | :--- | :--- | :--- |
| Tốt nhất | O(n log n) | O(n log n) | O(1) |
| Trung bình | O(n log n) | O(n log n) | O(log n) |
| Xấu nhất | O(n log n) | O(n²) | O(log n) |

- Merge Sort: bộ nhớ O(n) do mảng phụ khi trộn; **ổn định**.
- Quick Sort: sắp xếp tại chỗ, bộ nhớ phụ O(log n) cho call stack; **không ổn định**.
- Quick Sort rơi xuống O(n²) khi pivot chia mảng mất cân bằng, như mảng đã sắp xếp với pivot cuối.

## 5. Liên kết trực quan hóa
👉 Bấm **Trực Quan Hóa** để xem Merge Sort — minh họa chia để trị trên canvas.

## 6. Tổng kết
- D&C gồm ba giai đoạn: chia, trị, gộp; các bài toán con phải độc lập và cùng dạng.
- Base case đúng giúp đệ quy dừng đúng chỗ; bước gộp quyết định độ phức tạp tổng thể.
- Thuật toán D&C điển hình đạt O(n log n) hoặc tốt hơn; Quick Sort tiềm ẩn rủi ro O(n²) khi chọn pivot tồi.
- Bẫy thường gặp: quên xử lý mảng rỗng hoặc đơn phần tử; trộn sai thứ tự làm mất tính ổn định; nghĩ D&C luôn giảm độ phức tạp — thực tế còn phụ thuộc chi phí gộp.

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)",
                "sorting", "{\"demo\":\"merge-sort\"}", 40, teacher.Id);
            _context.Lessons.Add(lesson23);
            var lesson24 = new Lesson("Thuật toán Tham lam (Greedy)",
                @"# 🎯 Thuật toán Tham lam (Greedy)

## 1. Động cơ học (Why this matters)
Xếp lịch họp nhiều buổi nhất, chọn đồ quý nhất bỏ vào balo giới hạn, trả tiền bằng ít tờ nhất — đều là bài toán ra quyết định hằng ngày. Thuật toán tham lam (Greedy) chọn phương án tốt nhất ngay tại mỗi bước mà không nhìn lại tương lai. Đơn giản và nhanh, nó là vũ khí đầu tiên khi gặp bài toán tối ưu.

## 2. Lý thuyết cốt lõi
- **Tư tưởng:** tại mỗi bước chọn phương án cục bộ tốt nhất (local optimum), hy vọng chuỗi lựa chọn tạo phương án toàn cục tốt nhất (global optimum).
- Tham lam **không quay lui**: quyết định một lần là giữ mãi — khác biệt lớn nhất với quy hoạch động.
- Chiến lược đúng phải thỏa **tính chất lựa chọn tham lam** (có lời giải tối ưu chứa lựa chọn tham lam) và **cấu trúc con tối ưu** (lời giải tối ưu chứa lời giải tối ưu bài toán con).
- Chứng minh: **phản ví dụ** để bác bỏ; **exchange argument** (hoán đổi lời giải tối ưu về dạng tham lam) để xác nhận.
- Không có quy tắc chung đảm bảo tham lam đúng — mỗi bài toán phải chứng minh riêng.

## 3. Thuật toán từng bước (ý tưởng chính)
1. **Activity Selection:** sắp theo thời gian kết thúc tăng dần, chọn hoạt động kết thúc sớm nhất không chồng với hoạt động đã chọn.
2. **Interval Scheduling:** cùng chiến lược sắp theo end; dùng để bỏ tối thiểu khoảng chồng nhau.
3. **Jump Game:** duyệt trái qua phải, cập nhật vị trí xa nhất nhảy tới được; vượt hết mảng thì thắng.
4. **Assign Cookies:** sắp xếp độ tham ăn và kích thước bánh, hai con trỏ gán chiếc bánh nhỏ nhất vừa đủ cho từng trẻ.
5. **Coin Change (kiểu tham lam):** luôn chọn đồng xu mệnh giá lớn nhất còn vừa — chỉ tối ưu với bộ mệnh giá chuẩn (1, 5, 10, 25); sai với bộ 1, 3, 4 khi đổi 6 (4+1+1 thay vì 3+3).
6. **Fractional Knapsack:** sắp theo tỷ lệ giá trị/khối lượng giảm dần rồi đổ đầy túi — chia được nên tham lam luôn tối ưu.

**Ví dụ:** các buổi họp (1,4), (3,5), (0,6), (5,7), (3,9) đã sắp theo end. Chọn (1,4); bỏ (3,5), (0,6) vì chồng; chọn (5,7) — tối đa 2 buổi.

### Ví dụ
```javascript
// Chọn nhiều hoạt động nhất không chồng nhau
function activitySelection(activities) {
  const sorted = [...activities].sort((a, b) => a[1] - b[1]); // sắp theo end tăng dần
  const chosen = [sorted[0]];                                 // chọn cái kết thúc sớm nhất
  let lastEnd = sorted[0][1];
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i][0] >= lastEnd) {   // bắt đầu sau khi buổi trước kết thúc
      chosen.push(sorted[i]);
      lastEnd = sorted[i][1];
    }
  }
  return chosen;
}
```

## 4. Độ phức tạp & so sánh
| Bài toán | Chiến lược tham lam | Thời gian | Ghi chú |
| :--- | :--- | :--- | :--- |
| Activity selection | Sắp theo end, chọn lần lượt | O(n log n) | Tối ưu |
| Jump game | Cập nhật farthest | O(n) | Tối ưu |
| Assign cookies | Sort hai mảng, hai con trỏ | O(n log n) | Tối ưu |
| Coin change | Luôn lấy mệnh giá lớn nhất | O(n) | Chỉ đúng với bộ mệnh giá chuẩn |
| Fractional knapsack | Sắp theo tỷ lệ value/weight | O(n log n) | Tối ưu |

- Chi phí chủ yếu là sắp xếp O(n log n); phần quyết định tham lam chỉ là một vòng lặp O(n), bộ nhớ phụ O(1) nếu sắp tại chỗ.

## 5. Liên kết trực quan hóa
🖥️ **Mô phỏng tương tác:** bài học này chưa có demo trực quan chuyên biệt — hãy tự chạy code mẫu ở mục 3, rồi tiếp tục với phần Quiz.

## 6. Tổng kết
- Tham lam chọn tối ưu cục bộ mỗi bước, không quay lui; đúng khi có tính chất lựa chọn tham lam và cấu trúc con tối ưu.
- Activity selection và fractional knapsack là ví dụ kinh điển mà tham lam tối ưu.
- Coin change tham lam sai với bộ mệnh giá tùy ý — đổi 6 bằng bộ 1, 3, 4 là phản ví dụ nổi tiếng.
- Bẫy thường gặp: áp dụng tham lam vì trông hợp lý mà không chứng minh; nhầm fractional knapsack (chia được) với 0/1 knapsack (không chia được).

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)",
                "dsa", "{}", 40, teacher.Id);
            _context.Lessons.Add(lesson24);
            var lesson25 = new Lesson("Bài toán Khoảng thời gian (Interval Problems)",
                @"# 🎯 Bài toán Khoảng thời gian (Interval Problems)

## 1. Động cơ học (Why this matters)
Lịch đặt phòng họp chồng nhau, ghép khung giờ rảnh, bắn mũi tên xuyên nhiều bóng bay nhất, tính số phòng họp cần thiết — đều quy về xử lý các khoảng [start, end] trên trục thời gian. Dạng bài này xuất hiện dày đặc trong phỏng vấn và đời thực của kỹ sư. Điểm mấu chốt gần như luôn giống nhau: sắp xếp, rồi quét một lần duy nhất.

## 2. Lý thuyết cốt lõi
- Một khoảng [a, b] gồm điểm bắt đầu a và điểm kết thúc b; hai khoảng [a, b] và [c, d] **chồng nhau** khi a ≤ d và c ≤ b — chạm nhau đúng một điểm vẫn tính là chồng.
- Hai cách sắp xếp chính: theo **start** (dùng khi gộp khoảng) và theo **end** (dùng khi tối đa hóa số khoảng không chồng).
- Nguyên lý bất biến: không thể gộp danh sách khoảng lộn xộn — bước sắp xếp luôn đứng đầu.
- Sau khi sắp theo start, các khoảng chồng nhau nằm liền kề, nên một lượt quét là đủ.

## 3. Thuật toán từng bước
1. **Merge Intervals:** sắp theo start; khởi tạo khoảng hiện tại là khoảng đầu; với mỗi khoảng kế tiếp, nếu next.start ≤ current.end thì cập nhật current.end = max(current.end, next.end), ngược lại đóng gói khoảng hiện tại và mở khoảng mới.
2. **Insert Interval:** danh sách đã sắp sẵn, chèn khoảng mới vào đúng vị trí rồi gộp liên tiếp một lượt — tổng chi phí O(n).
3. **Non-overlapping Intervals:** sắp theo end, khi hai khoảng chồng nhau thì giữ khoảng kết thúc sớm hơn.
4. **Meeting Rooms:** tách start và end thành hai mảng, sắp riêng, hai con trỏ đếm số cuộc họp đồng thời tối đa.
5. **Minimum Number of Arrows:** sắp bóng bay theo end; bắn mũi tên đầu tiên tại end của quả đầu; quả sau có start ≤ vị trí bắn là đã trúng, ngược lại bắn mũi tên mới tại end.

**Ví dụ với [[1,3],[2,6],[8,10],[15,18]]:**
- Sắp theo start: [[1,3],[2,6],[8,10],[15,18]] (đã sắp sẵn).
- current = [1,3]; [2,6] có start 2 ≤ 3 → gộp thành [1,6].
- [8,10] có start 8 > 6 → đóng [1,6], mở current = [8,10].
- [15,18] có start 15 > 10 → đóng [8,10], mở [15,18].
- Kết quả: [[1,6],[8,10],[15,18]].

### Ví dụ
```javascript
// Gộp các khoảng chồng nhau
function mergeIntervals(intervals) {
  if (intervals.length === 0) return [];
  const sorted = [...intervals].sort((a, b) => a[0] - b[0]); // sắp theo start
  const result = [sorted[0]];                                // khoảng đang mở
  for (let i = 1; i < sorted.length; i++) {
    const cur = result[result.length - 1];
    if (sorted[i][0] <= cur[1]) {            // chồng lên khoảng đang mở
      cur[1] = Math.max(cur[1], sorted[i][1]); // kéo dài end tối đa
    } else {
      result.push(sorted[i]);                // đóng gói, mở khoảng mới
    }
  }
  return result;
}
```

## 4. Độ phức tạp & so sánh
| Bài toán | Thời gian | Bộ nhớ phụ | Ghi chú |
| :--- | :--- | :--- | :--- |
| Merge intervals | O(n log n) | O(n) | Sắp theo start, quét một lượt |
| Insert interval | O(n) | O(n) | Danh sách đã sắp xếp sẵn |
| Non-overlapping | O(n log n) | O(1) hoặc O(n) | Sắp theo end, giữ khoảng kết thúc sớm |
| Meeting rooms | O(n log n) | O(n) | Hai con trỏ trên start/end đã sắp |
| Min arrows | O(n log n) | O(1) hoặc O(n) | Sắp theo end, bắn tại end |

- Chi phí sắp xếp O(n log n) là hạng mục lớn nhất; phần quét sau đó chỉ O(n) — không cần cấu trúc dữ liệu phức tạp.

## 5. Liên kết trực quan hóa
🖥️ **Mô phỏng tương tác:** bài học này chưa có demo trực quan chuyên biệt — hãy tự chạy code mẫu ở mục 3, rồi tiếp tục với phần Quiz.

## 6. Tổng kết
- Hai việc luôn làm đầu tiên: sắp xếp (theo start hoặc end tùy bài) rồi quét một lượt.
- Điều kiện chồng nhau: a ≤ d và c ≤ b; dấu bằng vẫn tính là chồng (hai khoảng chạm nhau).
- Gộp khoảng dùng max(end); bài tối ưu số khoảng thì sắp theo end và giữ khoảng kết thúc sớm.
- Bẫy thường gặp: quên sắp xếp; bỏ sót trường hợp hai khoảng chạm nhau đúng một điểm; gán end trực tiếp thay vì max(end) khi khoảng này chứa khoảng kia.

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)",
                "dsa", "{}", 40, teacher.Id);
            _context.Lessons.Add(lesson25);
            var lesson26 = new Lesson("Ma trận & Các khuôn mẫu xử lý lưới (Matrix / Grid Patterns)",
                @"# 🎯 Ma trận & Các khuôn mẫu xử lý lưới (Matrix / Grid Patterns)

## 1. Động cơ học (Why this matters)
Ảnh kỹ thuật số, bản đồ địa lý, bàn cờ hay ô đất trong game đều là những lưới ô vuông hai chiều. Thuật toán trên lưới chi phối trực tiếp việc đếm hòn đảo trên bản đồ, nén ảnh, tìm đường đi ngắn nhất và nhận diện vùng liên thông trong ảnh y khoa. Nắm vững khuôn mẫu (pattern) duyệt lưới là bước đệm bắt buộc trước khi tiến tới các thuật toán đồ thị tổng quát hơn.

## 2. Lý thuyết cốt lõi
- Lưới M×N là mảng hai chiều: ô grid[r][c] với hàng r từ 0 tới M-1, cột c từ 0 tới N-1.
- Duyệt 4 hướng nhờ mảng hướng chuẩn directions = [(-1,0),(1,0),(0,-1),(0,1)] — tương ứng lên, xuống, trái, phải; muốn duyệt 8 hướng thì thêm 4 cặp đường chéo.
- Quy tắc vàng: kiểm tra biên TRƯỚC khi truy cập — ô (r,c) hợp lệ khi 0 ≤ r < M và 0 ≤ c < N, nếu không sẽ dính lỗi tràn chỉ số.
- Flood fill: kỹ thuật loang từ một ô ra các ô lân cận cùng đặc tính, triển khai bằng DFS (đệ quy hoặc stack tường minh) hoặc BFS (hàng đợi).
- Đánh dấu visited: tránh thăm lại ô cũ gây vòng lặp vô hạn hoặc đếm trùng; có thể dùng mảng visited riêng hoặc sửa giá trị ngay trên lưới (in-place).

## 3. Thuật toán từng bước
Flood fill đếm hòn đảo:
1. Duyệt toàn bộ lưới bằng hai vòng lặp lồng nhau.
2. Gặp ô đất chưa thăm: tăng biến đếm rồi ném DFS loang từ ô đó.
3. Trong DFS: kiểm tra biên và điều kiện ô đất; đánh dấu đã thăm; gọi đệ quy bốn hướng.
4. Sau khi loang, mọi ô của hòn đảo đã bị đánh dấu nên không bị đếm lại ở vòng sau.

Rotate matrix 90 độ: xoay bốn ô một lượt — với ma trận N×N, hoán đổi vòng tròn bốn vị trí (r,c), (c,N-1-r), (N-1-r,N-1-c), (N-1-c,r). Cách dễ nhớ hơn: chuyển vị (đổi grid[r][c] với grid[c][r]) rồi đảo ngược từng hàng.

Spiral traversal: duyệt viền ngoài rồi thu dần — giữ bốn biên top, bottom, left, right; quét ngang phải, xuống dưới, ngang trái, lên trên; sau mỗi lượt thu biên lại một ô.

### Ví dụ
```javascript
// Đếm số hòn đảo — flood fill dùng DFS, đánh dấu tại chỗ
const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

function numIslands(grid) {
  if (grid.length === 0) return 0;
  let count = 0;
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[0].length; c++) {
      if (grid[r][c] === 1) {   // gặp ô đất chưa thăm
        count++;
        dfs(grid, r, c);        // loang toàn bộ hòn đảo
      }
    }
  }
  return count;
}

function dfs(grid, r, c) {
  // kiểm tra biên trước khi truy cập ô lân cận
  if (r < 0 || c < 0 || r >= grid.length || c >= grid[0].length) return;
  if (grid[r][c] !== 1) return;
  grid[r][c] = 0;               // đánh dấu đã thăm tại chỗ
  for (const [dr, dc] of directions) dfs(grid, r + dr, c + dc);
}
```

## 4. Độ phức tạp & so sánh
| Thuật toán | Thời gian | Bộ nhớ phụ |
| :--- | :--- | :--- |
| Flood fill (DFS/BFS) | O(M×N) | O(M×N) xấu nhất |
| Rotate 90 độ | O(N²) | O(1) |
| Spiral traversal | O(M×N) | O(1) |

- Flood fill thăm mỗi ô đúng một lần nên thời gian luôn O(M×N); call stack đệ quy xấu nhất sâu bằng tổng số ô.
- Rotate và spiral thao tác tại chỗ, không cần cấu trúc phụ đáng kể.

## 5. Liên kết trực quan hóa
🖥️ **Mô phỏng tương tác:** bài học này chưa có demo trực quan chuyên biệt — hãy tự chạy code mẫu ở mục 3, rồi tiếp tục với phần Quiz.

## 6. Tổng kết
- Luôn kiểm tra biên trước khi truy cập grid[r][c] để tránh lỗi tràn chỉ số.
- Khuôn mẫu mảng directions giúp code gọn, dễ mở rộng từ 4 hướng sang 8 hướng.
- Flood fill kết hợp đánh dấu visited là nền tảng của các bài đếm vùng liên thông.
- Rotate 90 độ tương đương chuyển vị rồi đảo hàng; spiral traversal thu biên dần sau mỗi vòng.
- Bẫy thường gặp: quên đánh dấu đã thăm dẫn tới đệ quy vô hạn; nhầm lẫn hàng và cột khi xoay ma trận.

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)",
                "dsa", "{}", 40, teacher.Id);
            _context.Lessons.Add(lesson26);
            var lesson27 = new Lesson("Thao tác Bit & Số học (Bit Manipulation & Số học)",
                @"# 🎯 Thao tác Bit & Số học (Bit Manipulation & Số học)

## 1. Động cơ học (Why this matters)
Máy tính lưu mọi dữ liệu dưới dạng bit; thao tác trực tiếp trên bit giúp tiết kiệm bộ nhớ và tăng tốc gấp nhiều lần so với phép toán thông thường. Kỹ thuật này nằm trong lõi của cờ quyền (permissions), bộ lọc Bloom, mã hóa và nén ảnh. Bên cạnh đó, các thuật toán số học như GCD Euclid hay luỹ thừa nhanh xuất hiện dày đặc trong mật mã và lập trình thi đấu.

## 2. Lý thuyết cốt lõi
- Toán tử bit gồm: AND (&), OR (|), XOR (^), NOT (~), dịch trái (<<), dịch phải (>>).
- x << k nhân x với 2^k; x >> k chia nguyên x cho 2^k.
- Tính chất XOR: a ^ a = 0, a ^ 0 = a, đồng thời giao hoán và kết hợp — XOR toàn bộ mảng chứa cặp trùng sẽ làm các cặp triệt tiêu lẫn nhau.
- Thao tác cơ bản với bit thứ k (tính từ 0): kiểm tra (x >> k) & 1; set bit x | (1 << k); clear bit x & ~(1 << k); toggle bit x ^ (1 << k).
- GCD Euclid: gcd(a, b) = gcd(b, a mod b), dừng khi số dư bằng 0.
- Kiểm tra nguyên tố chỉ cần thử chia tới sqrt(n); sàng Eratosthenes đánh dấu bội số để liệt kê mọi số nguyên tố nhỏ hơn n.
- Luỹ thừa nhanh (fast power) chia đôi số mũ mỗi bước đưa độ phức tạp về O(log k); số học mô-đun giữ kết quả luôn trong khoảng [0, m-1].

## 3. Thuật toán từng bước
Single number (tìm phần tử xuất hiện một lần):
1. Khởi tạo result = 0.
2. XOR toàn bộ phần tử mảng vào result.
3. Mọi cặp trùng triệt tiêu nhau (a ^ a = 0), chỉ còn lại đúng số cần tìm.

Power of two:
1. Nếu n ≤ 0 trả về false.
2. Trả về (n & (n - 1)) === 0 — luỹ thừa của 2 có đúng một bit 1 nên trừ 1 sẽ biến bit đó thành 0.

Counting bits:
1. Lặp cho tới khi n bằng 0.
2. Mỗi vòng cộng 1 rồi thực hiện n = n & (n - 1) để xóa bit 1 thấp nhất.
Ví dụ n = 13 (1101): (13 & 12) = 12; (12 & 11) = 8; (8 & 7) = 0 — dừng sau 3 vòng, đúng bằng số bit 1.

GCD Euclid: gcd(48, 18): 48 mod 18 = 12; 18 mod 12 = 6; 12 mod 6 = 0 → gcd = 6.

Sàng Eratosthenes: khởi tạo mảng đánh dấu, với từng số nguyên tố p đánh dấu mọi bội 2p, 3p...; với n = 20, các số nguyên tố còn lại là 2, 3, 5, 7, 11, 13, 17, 19.

Fast power: nếu số mũ k chẵn thì a^k = (a^(k/2))², nếu lẻ thì nhân thêm a; áp dụng phép mod vào từng bước nhân để kết quả không bị tràn.

### Ví dụ
```javascript
// Luỹ thừa nhanh kèm mô-đun — O(log k)
function fastPower(a, k, m) {
  let result = 1;
  while (k > 0) {
    if (k & 1) result = (result * a) % m; // bit thấp nhất bằng 1
    a = (a * a) % m;                       // bình phương cơ số
    k = k >> 1;                            // dịch phải: chia đôi số mũ
  }
  return result;
}
```

## 4. Độ phức tạp & so sánh
| Thuật toán | Thời gian | Bộ nhớ phụ |
| :--- | :--- | :--- |
| XOR single number | O(N) | O(1) |
| Counting bits | O(log n) | O(1) |
| GCD Euclid | O(log min(a,b)) | O(1) |
| Kiểm tra nguyên tố | O(sqrt(n)) | O(1) |
| Sàng Eratosthenes | O(n log log n) | O(n) |
| Fast power | O(log k) | O(1) |

- Mỗi thao tác bit đơn lẻ mất thời gian hằng số O(1) trên một từ máy.
- Sàng Eratosthenes đánh dấu mỗi bội số một lần nên tổng phép gán vào cỡ n log log n.

## 5. Liên kết trực quan hóa
🖥️ **Mô phỏng tương tác:** bài học này chưa có demo trực quan chuyên biệt — hãy tự chạy code mẫu ở mục 3, rồi tiếp tục với phần Quiz.

## 6. Tổng kết
- XOR triệt tiêu cặp trùng — vũ khí cho loạt bài single number.
- n & (n - 1) xóa bit 1 thấp nhất; kết quả bằng 0 khi n là luỹ thừa của 2.
- Ghi nhớ mặt nạ 1 << k: kiểm tra (x >> k) & 1, set, clear và toggle.
- GCD Euclid và fast power đều rút gọn bài toán bằng phép chia đôi — độ phức tạp logarit.
- Bẫy thường gặp: quên xử lý n ≤ 0 khi kiểm tra luỹ thừa của 2; không mod từng bước khiến số tràn; nhầm độ ưu tiên giữa toán tử bit và toán tử so sánh.

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)",
                "dsa", "{}", 40, teacher.Id);
            _context.Lessons.Add(lesson27);
            var lesson28 = new Lesson("Sắp xếp nâng cao (Merge, Quick, Heap & Non-comparison)",
                @"# 🎯 Sắp xếp nâng cao (Merge, Quick, Heap & Non-comparison)

## 1. Động cơ học
Khi một hệ thống phải sắp xếp 10 triệu bản ghi mỗi đêm, chênh lệch giữa O(N²) và O(N log N) tính ra hàng trăm lần về thời gian — từ nhiều giờ xuống còn vài giây. Merge Sort, Quick Sort, Heap Sort cùng nhóm không-so-sánh (Counting, Radix, Bucket) là bộ vũ khí xử lý dữ liệu lớn.

## 2. Lý thuyết cốt lõi
- Merge Sort: chia để trị — chẻ đôi mảng tới khi còn 1 phần tử rồi trộn hai nửa bằng hai con trỏ; O(N log N) mọi trường hợp, ổn định (stable) nhưng tốn O(N) bộ nhớ phụ.
- Quick Sort: chọn chốt (pivot), phân mảnh (partition) đưa chốt về đúng vị trí rồi đệ quy hai nửa; trung bình O(N log N), xấu nhất O(N²) khi pivot là phần tử biên; sắp tại chỗ, thân thiện CPU cache, không ổn định.
- Heap Sort: xây Max Heap rồi đưa phần tử lớn nhất về cuối; O(N log N) mọi trường hợp, in-place tốn O(1) bộ nhớ, nhưng nhảy chỉ số gây trượt cache nên thực tế chậm hơn Quick Sort; không ổn định.
- Nhóm không-so-sánh: Counting Sort đếm tần suất trong khoảng giá trị K hẹp (O(N+K)); Radix Sort sắp từng chữ số bằng Counting Sort ổn định (O(d(N+K)); Bucket Sort rải dữ liệu phân bố đều vào xô rồi sắp nội bộ (trung bình O(N+K), tệ nhất O(N²)).

Định lý lower bound chứng minh thuật toán dựa trên so sánh không thể nhanh hơn O(N log N). Nhóm không-so-sánh phá rào cản này bằng cách không so sánh trực tiếp, nhưng phải trả giá bằng ràng buộc dữ liệu.

Tính ổn định (stable): hai phần tử bằng nhau giữ nguyên thứ tự tương đối ban đầu — quan trọng khi sắp xếp đối tượng theo nhiều khóa.

## 3. Thuật toán từng bước
1. Merge Sort: chia đôi → đệ quy hai nửa → trộn bằng hai con trỏ (dấu nhỏ hơn hoặc bằng giữ tính stable).
2. Quick Sort: chọn pivot → quét mảng đẩy số nhỏ hơn về trái → đặt pivot đúng vị trí → đệ quy hai bên.
3. Heap Sort: vun đống từ n/2 - 1 ngược về 0 → tráo gốc với phần tử cuối → giảm kích thước → heapify gốc, lặp tới khi còn 1 phần tử.
4. Counting Sort: tìm max K → mảng đếm K + 1 → cộng dồn → trải ngược từ cuối để giữ stable.
5. Radix Sort: với từng chữ số từ hàng đơn vị lên, dùng Counting Sort chia 10 xô rồi ghép lại.
6. Bucket Sort: rải phần tử vào n xô theo khoảng giá trị → sắp từng xô (thường dùng Insertion Sort) → gộp tuần tự.

Ví dụ Quick Sort với mảng [10, 80, 30, 90, 40, 50, 70], pivot = 70: sau partition mảng thành [10, 30, 40, 50, 70, 80, 90], chốt nằm đúng vị trí, rồi đệ quy hai nửa.

### Ví dụ
```javascript
// Partition Lomuto: các số nhỏ hơn chốt dồn về trái, trả về vị trí chốt
function partition(arr, lo, hi) {
  const pivot = arr[hi];        // chọn phần tử cuối làm chốt
  let i = lo - 1;               // biên giới vùng số nhỏ hơn chốt
  for (let j = lo; j < hi; j++) {
    if (arr[j] < pivot) {       // số nhỏ hơn chốt thì đẩy sang trái
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  [arr[i + 1], arr[hi]] = [arr[hi], arr[i + 1]]; // chốt về đúng vị trí
  return i + 1;
}
```

## 4. Độ phức tạp & so sánh
| Thuật toán | Trung bình | Xấu nhất | Bộ nhớ | Stable | In-place |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Merge Sort | O(N log N) | O(N log N) | O(N) | Có | Không |
| Quick Sort | O(N log N) | O(N²) | O(log N) | Không | Có |
| Heap Sort | O(N log N) | O(N log N) | O(1) | Không | Có |
| Counting Sort | O(N + K) | O(N + K) | O(N + K) | Có | Không |
| Radix Sort | O(d(N + K)) | O(d(N + K)) | O(N + K) | Có | Không |
| Bucket Sort | O(N + K) | O(N²) | O(N + K) | Tùy thuộc | Không |

Khi nào dùng: dữ liệu nhỏ dùng Insertion Sort; cần ổn định chọn Merge Sort; cần tốc độ chọn Quick Sort (C# dùng Introsort); bộ nhớ eo hẹp chọn Heap Sort; giá trị nguyên khoảng hẹp chọn Counting Sort; số thập phân phân bố đều chọn Bucket Sort.

## 5. Liên kết trực quan hóa
👉 Bấm **Trực Quan Hóa** để xem Quick Sort — minh họa chia để trị trên canvas.

## 6. Tổng kết
- Merge Sort luôn O(N log N), stable nhưng tốn O(N) bộ nhớ phụ.
- Quick Sort nhanh thực tế nhờ cache nhưng suy thoái O(N²) với pivot tồi.
- Heap Sort dung hòa hai nhược điểm trên nhưng trượt cache, không stable.
- Nhóm không-so-sánh đạt O(N) nhưng chỉ hợp giá trị khoảng hẹp hoặc phân bố đều.
- Bẫy thường gặp: Counting Sort với max quá lớn làm mảng đếm phình tới hàng GB; pivot cố định khi mảng gần như đã sắp xếp.

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)",
                "sorting", "{\"demo\":\"quick-sort\"}", 45, teacher.Id);
            _context.Lessons.Add(lesson28);
            var lesson29 = new Lesson("Quy hoạch động cơ bản (1D & State Machine)",
                @"# 🎯 Quy hoạch động cơ bản (1D & State Machine)

## 1. Động cơ học
Tính số Fibonacci thứ 50 bằng đệ quy ngây thơ có thể cần tới hàng nghìn tỷ phép tính, trong khi viết đúng quy hoạch động (DP) chỉ cần 50 phép cộng. DP là nền tảng giải hàng loạt bài toán tối ưu trong lập trình thi đấu, tài chính (mua bán cổ phiếu) và cả các hệ thống khuyến nghị — một kỹ năng không thể thiếu trong phỏng vấn kỹ sư phần mềm.

## 2. Lý thuyết cốt lõi
- DP áp dụng khi bài toán có hai đặc tính: các bài toán con chồng lấn nhau (overlapping subproblems) — cùng một bài toán con bị tính lại nhiều lần — và lời giải tối ưu được cấu thành từ lời giải tối ưu của các bài toán con (optimal substructure).
- Top-down (memoization): viết đệ quy như bình thường nhưng lưu kết quả từng trạng thái vào mảng để tái sử dụng, tránh tính lại.
- Bottom-up (tabulation): lấp bảng từ các trường hợp cơ sở lên bài toán gốc, không dùng đệ quy, thường kiểm soát bộ nhớ tốt hơn.
- Bảng dp một chiều dp[i] mô tả lời giải tối ưu cho tiền tố độ dài i.
- State machine: khi bài toán có nhiều chế độ trạng thái (ví dụ đang giữ cổ phiếu hoặc không), dùng nhiều mảng dp cho từng chế độ.

Năm bước giải một bài DP bất kỳ: (1) định nghĩa trạng thái; (2) tìm công thức truy hồi; (3) xác định trường hợp cơ sở; (4) chọn thứ tự lấp bảng; (5) tối ưu không gian nếu có thể.

## 3. Thuật toán từng bước
1. Fibonacci: dp[i] = dp[i-1] + dp[i-2], base dp[0] = 0, dp[1] = 1.
2. Leo cầu thang: mỗi bước đi 1 hoặc 2 bậc, số cách leo dp[i] = dp[i-1] + dp[i-2], base dp[1] = 1, dp[2] = 2.
3. Trộm nhà (House Robber): không được lấy hai nhà kề nhau, dp[i] = max(dp[i-1], dp[i-2] + nums[i]).
4. Đổi tiền (Coin Change): tìm số đồng xu tối thiểu, dp[a] = min(dp[a - c] + 1) với mỗi đồng c.
5. Mua bán cổ phiếu (state machine): hai biến trạng thái — hold (đang giữ) và cash (không giữ); mỗi ngày cập nhật hold = max(hold, cash - price) và cash = max(cash, hold + price).

Ví dụ House Robber với dãy nhà [2, 7, 9, 3, 1]: dp[0] = 2; dp[1] = max(2, 7) = 7; dp[2] = max(7, 2 + 9) = 11; dp[3] = max(11, 7 + 3) = 11; dp[4] = max(11, 11 + 1) = 12. Đáp án 12 bằng cách trộm nhà giá trị 2, 9 và 1.

### Ví dụ
```javascript
// Trộm nhà: dp[i] là tổng tiền lớn nhất xét tới nhà i
function rob(nums) {
  let prev2 = 0;          // dp[i-2]
  let prev1 = 0;          // dp[i-1]
  for (const x of nums) {
    const cur = Math.max(prev1, prev2 + x); // không lấy hoặc lấy nhà này
    prev2 = prev1;
    prev1 = cur;
  }
  return prev1;
}
```

## 4. Độ phức tạp & so sánh
| Cách tiếp cận | Thời gian | Bộ nhớ | Ghi chú |
| :--- | :--- | :--- | :--- |
| Đệ quy ngây thơ | O(2^N) | O(N) | Tính lại vô số trạng thái trùng |
| Top-down memo | O(N) | O(N) | Giữ cấu trúc đệ quy, lưu kết quả |
| Bottom-up | O(N) | O(N) | Lấp bảng không đệ quy |
| Bottom-up tối ưu | O(N) | O(1) | Chỉ giữ hai biến gần nhất |

Với state machine mua bán cổ phiếu: thời gian O(N), bộ nhớ O(1) khi chỉ dùng hai biến hold và cash.

## 5. Liên kết trực quan hóa
🖥️ **Mô phỏng tương tác:** bài học này chưa có demo trực quan chuyên biệt — hãy tự chạy code mẫu ở mục 3, rồi tiếp tục với phần Quiz.

## 6. Tổng kết
- DP cần đồng thời overlapping subproblems và optimal substructure; thiếu một trong hai thì không nên dùng DP.
- Top-down dễ viết hơn, bottom-up kiểm soát thứ tự và bộ nhớ tốt hơn.
- Công thức 1D điển hình gồm dạng cộng tổ hợp (Fibonacci, leo cầu thang) và dạng max/min lựa chọn (trộm nhà, đổi tiền).
- State machine dùng nhiều mảng dp cho các chế độ trạng thái khác nhau.
- Bẫy thường gặp: quên base case gây tràn mảng; trật thứ tự lấp bảng khiến truy hồi đọc giá trị chưa tính; nhầm DP với tham lam — tham lam chỉ đúng khi lựa chọn cục bộ luôn tối ưu toàn cục.

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)",
                "dsa", "{}", 45, teacher.Id);
            _context.Lessons.Add(lesson29);
            var lesson30 = new Lesson("Quy hoạch động nâng cao (2D)",
                @"# 🎯 Quy hoạch động nâng cao (2D)

## 1. Động cơ học
So khớp hai chuỗi gene, sửa lỗi chính tả (Edit Distance), đóng gói hàng hóa tối ưu (Knapsack) hay tìm đoạn chung của hai văn bản (LCS) đều có hai chiều trạng thái. Bảng dp hai chiều là cấu trúc lời giải cho nhóm bài toán này — kiến thức bắt buộc khi phỏng vấn kỹ sư phần mềm.

## 2. Lý thuyết cốt lõi
- dp[i][j] biểu diễn lời giải cho bài toán con xác định bởi cặp tiền tố (i, j) của hai chuỗi, hoặc cặp (số món đang xét, sức chứa) của bài toán đóng gói.
- Knapsack 0/1: với món i và sức chứa w, dp[i][w] = max(dp[i-1][w], dp[i-1][w - w_i] + v_i) — bỏ qua hoặc chọn món i, mỗi món chỉ dùng tối đa một lần.
- Unbounded Knapsack: mỗi món dùng lại không giới hạn nên truy hồi đọc chính hàng hiện tại: dp[w] = max(dp[w], dp[w - w_i] + v_i).
- LCS: nếu ký tự khớp thì dp[i][j] = dp[i-1][j-1] + 1; ngược lại dp[i][j] = max(dp[i-1][j], dp[i][j-1]).
- Edit Distance: ba phép biến đổi — chèn, xóa, thay, mỗi phép chi phí 1; ô (i, j) là min của ba phương án đó.
- Unique Paths: số đường đi từ góc trên trái, dp[i][j] = dp[i-1][j] + dp[i][j-1], hàng 0 và cột 0 toàn giá trị 1.

Thứ tự lấp bảng đi từ cơ sở (hàng 0, cột 0) theo hướng tăng i, tăng j vì mỗi ô chỉ phụ thuộc các ô phía trên và bên trái. Nhờ vậy mọi bài 2D nén được không gian xuống còn vài hàng — mỗi lần tính chỉ cần hàng trước đó.

## 3. Thuật toán từng bước
1. Knapsack 0/1: khởi tạo hàng và cột đầu bằng 0 → với mỗi món i và sức chứa w, so sánh bỏ qua và lấy món → ô cuối là đáp án.
2. Unbounded: lấp mảng từ trái sang phải để cùng món được chọn nhiều lần.
3. LCS: lấp bảng (m+1) × (n+1); ô khớp lấy đường chéo cộng 1, ô lệch lấy max của hai ô liền kề.
4. Edit Distance: so sánh ký tự thứ i-1 của A với ký tự thứ j-1 của B; bằng nhau thì giữ giá trị đường chéo, khác nhau thì cộng 1 vào min của ba phép biến đổi.
5. Unique Paths: gán 1 cho hàng 0 và cột 0, mỗi ô còn lại bằng tổng ô trên và ô trái.
6. Tối ưu không gian: giữ hai hàng prev và cur; Knapsack 0/1 nén xuống một mảng 1D nhưng phải duyệt capacity giảm dần.

Ví dụ LCS của hai chuỗi ABCBDAB và BDCABA: lấp bảng cho kết quả 4 (dãy con chung BDAB). Ví dụ Knapsack 0/1 sức chứa 5 với các món (2, 3), (3, 4), (4, 5), (5, 6): chọn món (2, 3) và (3, 4) cho tổng giá trị 7 — cao hơn món (5, 6) đơn lẻ.

### Ví dụ
```javascript
// Knapsack 0/1: trả về giá trị lớn nhất trong sức chứa cho trước
function knapsack01(weights, values, capacity) {
  const n = weights.length;
  let prev = new Array(capacity + 1).fill(0);
  for (let i = 0; i < n; i++) {
    const cur = prev.slice();            // phương án không lấy món i
    for (let w = weights[i]; w <= capacity; w++) {
      cur[w] = Math.max(prev[w], prev[w - weights[i]] + values[i]);
    }
    prev = cur;                          // chỉ giữ hai hàng
  }
  return prev[capacity];
}
```

## 4. Độ phức tạp & so sánh
| Bài toán | Thời gian | Bộ nhớ ban đầu | Bộ nhớ tối ưu |
| :--- | :--- | :--- | :--- |
| Knapsack 0/1 | O(N × W) | O(N × W) | O(W) — một mảng 1D |
| LCS | O(M × N) | O(M × N) | O(min(M, N)) — hai hàng |
| Edit Distance | O(M × N) | O(M × N) | O(N) — hai hàng |
| Unique Paths | O(M × N) | O(M × N) | O(N) — một hàng |

Lưu ý: Knapsack 0/1 nén xuống 1D phải duyệt capacity giảm dần để mỗi món chọn đúng một lần; unbounded duyệt tăng dần.

## 5. Liên kết trực quan hóa
🖥️ **Mô phỏng tương tác:** bài học này chưa có demo trực quan chuyên biệt — hãy tự chạy code mẫu ở mục 3, rồi tiếp tục với phần Quiz.

## 6. Tổng kết
- Bảng 2D giải quyết bài toán có hai chiều trạng thái: chuỗi-chuỗi (LCS, Edit Distance) hoặc món-đóng gói (Knapsack).
- Knapsack 0/1 truy hồi đọc hàng trước; unbounded đọc cùng hàng nên cho phép tái sử dụng món.
- LCS dùng đường chéo khi khớp, max hai ô khi lệch; Edit Distance tương tự nhưng cộng thêm chi phí 1 cho ba phép biến đổi.
- Mọi bài 2D đều nén được bộ nhớ xuống còn vài hàng nhờ thứ tự lấp bảng.
- Bẫy thường gặp: nhầm chiều duyệt khi nén 1D (0/1 giảm dần, unbounded tăng dần); quên lấp hàng hoặc cột cơ sở; lệch chỉ số vì mảng kích thước (m+1) × (n+1).

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)",
                "dsa", "{}", 45, teacher.Id);
            _context.Lessons.Add(lesson30);
            var lesson31 = new Lesson("Đường đi ngắn nhất (Shortest Path)",
                @"# 🎯 Đường đi ngắn nhất (Shortest Path)

## 1. Động cơ học (Why this matters)
Google Maps tìm tuyến đường nhanh nhất, router chọn đường truyền gói tin rẻ nhất, app gọi xe ước lượng cước di chuyển — tất cả đều là bài toán tìm đường đi ngắn nhất trên đồ thị có trọng số. Tùy đặc tính đồ thị (không trọng số, có cạnh âm, cần khoảng cách mọi cặp đỉnh) mà ta chọn BFS, Dijkstra, Bellman-Ford hay Floyd-Warshall.

## 2. Lý thuyết cốt lõi
- BFS chỉ đúng với đồ thị KHÔNG trọng số: mọi cạnh coi như nặng 1, FIFO bảo đảm đỉnh khám phá sớm thì gần hơn, đường tìm được có ít cạnh nhất — O(V+E).
- Dijkstra: bản nâng cấp của BFS, thay hàng đợi bằng min-heap. Trái tim là phép NỚI LỎNG (relaxation): nếu dist[u] + w(u,v) < dist[v] thì ghi đè dist[v]. Đỉnh nào rút khỏi heap là chốt sổ nên chỉ đúng với trọng số không âm — O((V+E) log V).
- Bellman-Ford: lặp V-1 vòng, mỗi vòng nới lỏng toàn bộ E cạnh, chấp nhận cạnh âm. Vòng thứ V nếu còn nới lỏng được thì có chu trình âm (negative cycle), bài toán không có đáp án hữu hạn — O(V·E).
- Floyd-Warshall: quy hoạch động ba vòng lặp trên ma trận kề, cho khoảng cách MỌI cặp đỉnh trong O(V³).

Vì sao Dijkstra cấm cạnh âm: nó tham lam tin đỉnh vừa rút khỏi heap đã tối ưu — điều này chỉ đúng khi mọi cạnh làm khoảng cách tăng. Cạnh âm xuất hiện sau có thể rút ngắn đường về đỉnh đã chốt, khiến đáp án sai không sửa được.

## 3. Thuật toán từng bước
1. BFS: dist[start] = 0, các đỉnh khác là vô cực; enqueue start; mỗi lần dequeue u, gán dist cho hàng xóm chưa thăm rồi enqueue.
2. Dijkstra: đưa (start, 0) vào heap; lặp lại rút cặp (u, d) nhỏ nhất, bỏ qua bản ghi cũ lỗi thời (lazy deletion), chốt u, nới lỏng mọi cạnh (u, v); dừng khi heap rỗng.
3. Bellman-Ford: khởi tạo dist; lặp đúng V-1 lần, mỗi lần quét toàn bộ cạnh để nới lỏng; vòng thứ V chỉ kiểm tra chu trình âm.
4. Floyd-Warshall: dist[i][j] ban đầu là trọng số cạnh (0 khi i = j, vô cực nếu không có cạnh); với mỗi đỉnh trung gian k: dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j]).

Ví dụ đồ thị 5 đỉnh với cạnh A-B = 4, A-C = 2, C-E = 3, E-D = 4, B-D = 10. Dijkstra từ A: chốt A(0) → B = 4, C = 2; chốt C → E = 5; chốt B → D = 14; chốt E → phát hiện 9 < 14 nên ghi đè D = 9; chốt D. Kết quả dist = [0, 4, 2, 9, 5] — D được nới lỏng lại nhờ E.

### Ví dụ
```javascript
// Dijkstra cài tay bằng mảng, không dùng thư viện
function dijkstra(graph, start) {
  const n = graph.length;
  const dist = Array(n).fill(Infinity);   // khoảng cách từ start tới mọi đỉnh
  const done = Array(n).fill(false);      // đỉnh đã chốt sổ
  dist[start] = 0;
  for (let i = 0; i < n; i++) {
    let u = -1;                           // tìm đỉnh gần nhất chưa chốt
    for (let v = 0; v < n; v++) {
      if (!done[v] && (u === -1 || dist[v] < dist[u])) u = v;
    }
    if (u === -1 || dist[u] === Infinity) break; // các đỉnh còn lại không tới được
    done[u] = true;
    for (const [v, w] of graph[u]) {      // nới lỏng các cạnh đi ra từ u
      if (dist[u] + w < dist[v]) dist[v] = dist[u] + w;
    }
  }
  return dist;
}
```

## 4. Độ phức tạp & so sánh
| Thuật toán | Điều kiện áp dụng | Thời gian | Bộ nhớ |
| :--- | :--- | :--- | :--- |
| BFS | Đồ thị không trọng số | O(V+E) | O(V) |
| Dijkstra (heap) | Trọng số không âm | O((V+E) log V) | O(V) |
| Bellman-Ford | Cho phép cạnh âm, phát hiện chu trình âm | O(V·E) | O(V) |
| Floyd-Warshall | Mọi cặp đỉnh, đồ thị nhỏ | O(V³) | O(V²) |

- BFS khi cạnh nặng bằng nhau; Dijkstra khi trọng số dương; Bellman-Ford khi có cạnh âm; Floyd khi cần mọi cặp, đồ thị nhỏ.

## 5. Liên kết trực quan hóa
👉 Bấm **Trực Quan Hóa** để xem Dijkstra — tìm đường đi ngắn nhất trên đồ thị.

## 6. Tổng kết
- BFS đếm số cạnh, Dijkstra cộng trọng số; Dijkstra chỉ đúng khi trọng số không âm.
- Bellman-Ford chậm hơn (O(V·E)) nhưng chấp nhận cạnh âm và bắt negative cycle ở vòng thứ V.
- Floyd-Warshall cho mọi cặp đỉnh nhưng O(V³) chỉ hợp đồ thị nhỏ.
- Bẫy: dùng Dijkstra với cạnh âm; quên lazy deletion khi heap còn bản ghi cũ; nhầm BFS với Dijkstra trên đồ thị có trọng số.

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)",
                "graph", "{\"demo\":\"dijkstra\"}", 45, teacher.Id);
            _context.Lessons.Add(lesson31);
            var lesson32 = new Lesson("Cây khung nhỏ nhất (Minimum Spanning Tree - MST)",
                @"# 🎯 Cây khung nhỏ nhất (Minimum Spanning Tree - MST)

## 1. Động cơ học (Why this matters)
Khi kéo điện cho một khu đô thị, trải cáp quang giữa các máy chủ, hay xây đường nối các huyện đảo, mục tiêu chung là kết nối tất cả các điểm với tổng chi phí nhỏ nhất. Đó chính là bài toán cây khung nhỏ nhất (MST): chọn một tập cạnh sao cho mọi đỉnh đều liên thông mà tổng trọng số tối thiểu. Hai thuật toán kinh điển là Kruskal và Prim.

## 2. Lý thuyết cốt lõi
- Cây khung (spanning tree): đồ thị con chứa đủ V đỉnh, đúng V-1 cạnh, liên thông và không có chu trình — chính nhờ ba đặc trưng đó nên gọi là cây.
- MST: cây khung có tổng trọng số nhỏ nhất. Đồ thị có thể có nhiều MST khác nhau khi các cạnh trùng trọng số, nhưng tổng trọng số tối ưu thì duy nhất.
- Kruskal: sắp xếp E cạnh theo trọng số tăng dần, duyệt từng cạnh, bỏ qua cạnh tạo chu trình (kiểm tra bằng Union-Find), giữ cạnh nối hai thành phần khác nhau cho tới khi đủ V-1 cạnh — O(E log E).
- Prim: xuất phát từ một đỉnh, mỗi bước chọn cạnh nhẹ nhất nối đỉnh trong cây với đỉnh ngoài cây — giống Dijkstra nhưng tiêu chí là trọng số cạnh tới cây, không phải tổng từ nguồn; min-heap đạt O(E log V).
- Hai tính chất nền tảng: cut property — cạnh nhẹ nhất băng qua một lát cắt luôn thuộc một MST nào đó; cycle property — cạnh nặng nhất trong một chu trình không nằm trong MST. Kruskal và Prim đều dựa vào cut property.

## 3. Thuật toán từng bước
1. Sắp xếp toàn bộ cạnh theo trọng số tăng dần.
2. Khởi tạo Union-Find gồm V đỉnh, mỗi đỉnh là một tập riêng.
3. Duyệt danh sách đã sắp xếp: nếu hai đầu cạnh thuộc hai tập khác nhau thì thêm cạnh vào MST rồi gộp hai tập; nếu đã cùng tập thì bỏ qua vì cạnh ấy tạo chu trình.
4. Dừng khi MST đủ V-1 cạnh; nếu hết cạnh mà chưa đủ thì đồ thị không liên thông, không tồn tại MST.

Ví dụ 4 đỉnh A, B, C, D với cạnh AB = 1, BC = 2, CD = 3, DA = 4, AC = 5. Sắp xếp được AB(1), BC(2), CD(3), DA(4), AC(5). AB, BC, CD được thêm; DA tạo chu trình A-B-C-D-A nên bị bỏ; AC cũng tạo chu trình nên bị bỏ. MST gồm AB, BC, CD, tổng 6. Prim chạy từ A cũng ra đúng bộ cạnh đó.

### Ví dụ
```javascript
// Kruskal — sắp xếp cạnh rồi dùng Union-Find gọn nhẹ
function kruskal(n, edges) {
  edges.sort((a, b) => a.w - b.w);            // cạnh tăng dần theo trọng số
  const parent = Array.from({ length: n }, (_, i) => i);
  const find = (x) => {                        // tìm gốc kèm nén đường
    while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; }
    return x;
  };
  let total = 0, used = 0;
  for (const e of edges) {
    const ru = find(e.u), rv = find(e.v);
    if (ru !== rv) {                           // hai đầu khác tập: an toàn
      parent[ru] = rv;
      total += e.w;
      if (++used === n - 1) return total;      // đủ V-1 cạnh, hoàn tất
    }
  }
  return -1;                                   // không liên thông, không có MST
}
```

## 4. Độ phức tạp & so sánh
| Thuật toán | Ý tưởng chính | Thời gian | Phù hợp |
| :--- | :--- | :--- | :--- |
| Kruskal | Sort cạnh + Union-Find | O(E log E) | Đồ thị thưa (E gần bằng V) |
| Prim (min-heap) | Mở rộng cây từ một đỉnh | O(E log V) | Đồ thị dày (E gần bằng V²) |

- Bộ nhớ: Kruskal cần O(E) lưu danh sách cạnh cộng O(V) cho Union-Find; Prim cần O(V).
- Cả hai đều cho kết quả tối ưu ngang nhau; khác biệt nằm ở tốc độ tùy mật độ của đồ thị.

## 5. Liên kết trực quan hóa
🖥️ **Mô phỏng tương tác:** bài học này chưa có demo trực quan chuyên biệt — hãy tự chạy code mẫu ở mục 3, rồi tiếp tục với phần Quiz.

## 6. Tổng kết
- MST nối mọi đỉnh bằng V-1 cạnh với tổng trọng số nhỏ nhất; nền tảng của thiết kế mạng lưới, đường sá và hệ thống điện.
- Kruskal xét theo cạnh (sắp xếp + Union-Find), Prim xét theo đỉnh (min-heap); cả hai đều dựa trên cut property và luôn tối ưu.
- Bẫy thường gặp: quên kiểm tra chu trình trong Kruskal; nhầm tiêu chí của Prim với Dijkstra; không xử lý đồ thị không liên thông (không tồn tại MST).

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)",
                "dsa", "{}", 45, teacher.Id);
            _context.Lessons.Add(lesson32);
            var lesson33 = new Lesson("Union-Find / Disjoint Set Union (DSU)",
                @"# 🎯 Union-Find / Disjoint Set Union (DSU)

## 1. Động cơ học (Why this matters)
Mạng xã hội cần trả lời liên tục: A và B có cùng nhóm bạn không, và khi kết bạn thì gộp hai nhóm lại. Với hàng triệu người dùng, BFS/DFS cho từng truy vấn là quá chậm. Union-Find (Disjoint Set Union - DSU) trả lời hai thao tác này trong O(α(N)) — coi như O(1) — và là nền tảng của Kruskal, Number of Provinces, Redundant Connection.

## 2. Lý thuyết cốt lõi
- Disjoint set: họ các tập không giao nhau; mỗi tập được biểu diễn bằng một cây, gốc (root) là đại diện của toàn bộ tập.
- Find(x): trả về gốc của tập chứa x. Union(x, y): gộp tập chứa x và tập chứa y thành một tập.
- Cài đặt ngây thơ: mảng parent với parent[i] = i ban đầu. Find leo chuỗi cha tới gốc; Union gắn gốc này làm con của gốc kia. Gộp tệ (0-1, 1-2, 2-3...) biến cây thành dây xích dài N nên mỗi Find tốn O(N).
- Path compression: trong Find, trỏ thẳng mọi đỉnh trên đường đi về gốc nên các lần tìm sau chỉ còn một bước.
- Union by rank: khi gộp, treo cây thấp hơn dưới cây cao hơn (đo bằng rank ước lượng), giữ chiều cao ở mức O(log N) ngay cả khi chưa nén đường.
- Kết hợp cả hai kỹ thuật đạt O(α(N)), trong đó α là hàm nghịch đảo Ackermann — với mọi N thực tế, α(N) ≤ 4.

Vì sao phải dùng đủ cả hai: chúng bổ sung cho nhau — chỉ union by rank thì Find vẫn tốn O(log N); chỉ path compression thì cây vẫn có thể cao nếu gộp tệ. Chỉ khi kết hợp mới đạt O(α(N)).

## 3. Thuật toán từng bước
1. Khởi tạo: parent[i] = i và rank[i] = 0 với mọi i.
2. Find(x): nếu parent[x] khác x, đệ quy tìm gốc của parent[x] rồi gán thẳng cho parent[x] (nén đường); trả về gốc.
3. Union(x, y): rX = Find(x), rY = Find(y). Nếu rX = rY thì đã cùng tập — không làm gì, đó chính là tín hiệu chu trình khi duyệt cạnh. Ngược lại treo gốc rank thấp dưới gốc rank cao; bằng nhau thì chọn một bên và tăng rank lên 1.

Mô phỏng 5 phần tử: Union(0,1) tạo cây gốc 0; Union(2,3) tạo cây gốc 2; Union(0,3) gộp hai cây. Kết quả {0,1,2,3} là một thành phần, {4} đứng riêng — còn 2 thành phần; Find(4) = 4, Find(2) trả về gốc chung 0 sau khi nén đường.

### Ví dụ
```javascript
// Union-Find: nén đường + union by rank
class DSU {
  constructor(n) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = Array(n).fill(0);
  }
  find(x) {                                     // nén đường ngay trong đệ quy
    if (this.parent[x] !== x) this.parent[x] = this.find(this.parent[x]);
    return this.parent[x];
  }
  union(x, y) {
    const rx = this.find(x), ry = this.find(y);
    if (rx === ry) return false;                // đã cùng tập: cạnh tạo chu trình
    if (this.rank[rx] < this.rank[ry]) this.parent[rx] = ry;
    else if (this.rank[rx] > this.rank[ry]) this.parent[ry] = rx;
    else { this.parent[ry] = rx; this.rank[rx]++; } // ngang nhau: chọn một bên
    return true;
  }
}
// Ứng dụng: phát hiện chu trình trên đồ thị vô hướng
function hasCycle(n, edges) {
  const dsu = new DSU(n);
  for (const [u, v] of edges) if (!dsu.union(u, v)) return true;
  return false;
}
```

## 4. Độ phức tạp & so sánh
| Cài đặt | Find | Union | Ghi chú |
| :--- | :--- | :--- | :--- |
| Ngây thơ | O(N) | O(N) | Cây có thể thành dây xích dài |
| Path compression | O(log N) trung bình | O(log N) trung bình | Vẫn phụ thuộc chiều cao cây |
| Cả hai kỹ thuật | O(α(N)) ≈ O(1) | O(α(N)) ≈ O(1) | Chuẩn cho mọi ứng dụng |

- Bộ nhớ: O(N) cho hai mảng parent và rank.
- BFS/DFS trả lời truy vấn kết nối trong O(V+E) mỗi lần; DSU trả lời trong O(α(N)) nên thắng tuyệt đối ở bài toán động — nhất là trong Kruskal, nơi cần hàng chục nghìn phép tìm gốc.

## 5. Liên kết trực quan hóa
🖥️ **Mô phỏng tương tác:** bài học này chưa có demo trực quan chuyên biệt — hãy tự chạy code mẫu ở mục 3, rồi tiếp tục với phần Quiz.

## 6. Tổng kết
- DSU quản lý các tập rời nhau bằng hai thao tác Find (tìm gốc) và Union (gộp tập).
- Path compression + union by rank đưa độ phức tạp về O(α(N)), gần như O(1).
- Ứng dụng chính: đếm thành phần liên thông, phát hiện chu trình đồ thị vô hướng, Kruskal MST, Number of Provinces, Redundant Connection.
- Bẫy thường gặp: chỉ dùng một trong hai kỹ thuật tối ưu; quên rằng union trả về false khi hai đỉnh đã cùng tập — đó chính là dấu hiệu chu trình.

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)",
                "dsa", "{}", 45, teacher.Id);
            _context.Lessons.Add(lesson33);
            var lesson34 = new Lesson("Trie (Prefix Tree)",
                @"# 🎯 Trie (Prefix Tree)

## 1. Động cơ học (Why this matters)
Khi gõ 'ap' vào hộp tìm kiếm, các gợi ý apple, application, apex hiện ra tức thì — đó là autocomplete, tính năng quen thuộc nhưng rất khó cài bằng cấu trúc dữ liệu thường. Một hash set chỉ cho biết một từ có tồn tại hay không, không thể liệt kê các từ bắt đầu bằng một tiền tố. Trie (cây tiền tố) được thiết kế riêng cho lớp bài toán này: mọi phép toán chạy theo độ dài chuỗi, không phụ thuộc tổng số từ.

## 2. Lý thuyết cốt lõi
- Trie là cây đa phân, mỗi node đại diện một ký tự; đường đi từ gốc tạo thành một chuỗi (prefix).
- Node mang cờ isEnd = true đánh dấu nơi kết thúc một từ hợp lệ — quan trọng vì 'app' vừa là tiền tố của 'apple' vừa là từ độc lập.
- Mỗi node gồm children (bảng băm ký tự → node con) và cờ isEnd; node gốc rỗng, không mang ký tự.
- Các từ chia sẻ tiền tố chung sẽ dùng chung node nên cây gọn hơn lưu trữ riêng rẽ.

Ba thao tác insert, search, startsWith đều chỉ đi xuống cây theo từng ký tự nên thời gian không phụ thuộc kích thước từ điển — lợi thế hash set không có. Đổi lại, mỗi node giữ một cấu trúc children riêng nên bộ nhớ tăng nhanh với bảng chữ cái lớn hay từ vựng ít tiền tố chung; khi đó dùng Radix Tree để nén các node chỉ có một con.

## 3. Thuật toán từng bước
1. Insert: bắt đầu từ gốc, với mỗi ký tự của từ, tạo node con nếu chưa tồn tại rồi di chuyển xuống; sau khi đi hết từ, gán isEnd = true.
2. Search: đi theo từng ký tự; nếu gặp thiếu node ở giữa chuỗi thì trả false, nếu đi hết thì trả giá trị isEnd — khớp đủ ký tự thôi chưa đủ, cần cờ kết thúc.
3. StartsWith: giống search nhưng bỏ qua cờ isEnd — chỉ cần đường đi tồn tại là trả true.
4. Autocomplete: tới node cuối của prefix rồi duyệt DFS nhánh con, ghép ký tự dọc đường để thu thập từ; chi phí O(L + K) với K là số gợi ý.

Ví dụ từ điển gồm app và apple: gốc → 'a' → 'p' → 'p'; node 'p' thứ hai có isEnd (kết thúc app) và con 'l' → 'e' có isEnd (kết thúc apple). Search('ap') trả false do thiếu isEnd; StartsWith('ap') trả true; autocomplete với 'app' trả về app và apple.

### Ví dụ
```javascript
class TrieNode {
  constructor() {
    this.children = new Map(); // ký tự -> node con
    this.isEnd = false;        // đánh dấu cuối một từ
  }
}

class Trie {
  constructor() { this.root = new TrieNode(); }

  // chèn từ: tạo node con khi thiếu, cuối cùng gắn cờ
  insert(word) {
    let cur = this.root;
    for (const c of word) {
      if (!cur.children.has(c)) cur.children.set(c, new TrieNode());
      cur = cur.children.get(c);
    }
    cur.isEnd = true;
  }

  // trả node cuối của chuỗi, hoặc null khi thiếu đường đi
  findNode(word) {
    let cur = this.root;
    for (const c of word) {
      if (!cur.children.has(c)) return null;
      cur = cur.children.get(c);
    }
    return cur;
  }

  // tìm kiếm chính xác: cần cả đường đi lẫn cờ isEnd
  search(word) {
    const node = this.findNode(word);
    return node !== null && node.isEnd;
  }

  // kiểm tra tiền tố: chỉ cần đường đi tồn tại
  startsWith(prefix) {
    return this.findNode(prefix) !== null;
  }
}
```

## 4. Độ phức tạp & so sánh
| Thao tác | Thời gian | Ghi chú |
| :--- | :--- | :--- |
| Insert | O(L) | L là độ dài chuỗi |
| Search | O(L) | Đi xuống theo từng ký tự |
| StartsWith | O(L) | Không cần kiểm tra isEnd |
| Autocomplete | O(L + K) | K là số gợi ý trả về |

- Bộ nhớ: O(A × N × L) với A là kích thước bảng chữ cái, N là số từ, L là độ dài trung bình — tốn hơn hash set vì chi phí mỗi node.
- Tìm từ chính xác: cả hai đều O(L), nhưng truy vấn tiền tố với hash set phải duyệt toàn bộ O(N × L) còn Trie chỉ O(L).
- Trie duyệt theo thứ tự từ điển tự nhiên; ứng dụng gồm autocomplete, kiểm tra chính tả, định tuyến IP, word search II.

## 5. Liên kết trực quan hóa
🖥️ **Mô phỏng tương tác:** bài học này chưa có demo trực quan chuyên biệt — hãy tự chạy code mẫu ở mục 3, rồi tiếp tục với phần Quiz.

## 6. Tổng kết
- Trie lưu từng ký tự thành node; đường đi từ gốc là một tiền tố, cờ isEnd phân biệt từ với tiền tố.
- Insert, search, startsWith đều chạy O(L) — không phụ thuộc số lượng từ trong từ điển.
- Điểm mạnh là truy vấn tiền tố và autocomplete; hash set chỉ trả lời được câu hỏi tồn tại.
- Bộ nhớ cao hơn hash set; dùng Radix Tree khi từ vựng lớn và ít tiền tố chung.
- Bẫy thường gặp: search trả true khi chỉ khớp tiền tố mà quên kiểm tra isEnd; quên tạo node mới khi insert từ dài hơn các từ hiện có.

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)",
                "dsa", "{}", 45, teacher.Id);
            _context.Lessons.Add(lesson34);
            var lesson35 = new Lesson("Segment Tree (Cây đoạn)",
                @"# 🎯 Segment Tree (Cây đoạn)

## 1. Động cơ học (Why this matters)
Bài toán truy vấn đoạn xuất hiện liên tục: tổng doanh số từ ngày 2 đến ngày 4, nhiệt độ thấp nhất tuần trước, lượng hàng tồn kho lớn nhất... Nếu duyệt trực tiếp, mỗi truy vấn [l, r] tốn O(N) và mỗi lần dữ liệu thay đổi phải tính lại từ đầu. Segment Tree (cây đoạn) trả lời truy vấn đoạn và cập nhật điểm đều trong O(log N), biến bài toán quá chậm thành xử lý tức thời ngay cả với mảng hàng triệu phần tử.

## 2. Lý thuyết cốt lõi
- Segment Tree là cây nhị phân, mỗi node quản lý một đoạn [l, r] của mảng gốc và lưu giá trị tổng hợp (tổng, min, max...) của đoạn đó.
- Node gốc quản lý [0, N-1]; mỗi node cha chia đôi đoạn cho hai con trái, phải; node lá là [i, i] chứa đúng một phần tử.
- Lưu cây trong mảng giống heap: node i có con trái 2i+1, con phải 2i+2; cấp phát 4 × N phần tử cho an toàn.
- Xây dựng theo chia để trị: lá nhận giá trị mảng, node cha bằng tổng (hoặc min, max) của hai con.

Truy vấn [l, r] xuất phát từ gốc; tại mỗi node xảy ra một trong ba trường hợp: đoạn nằm ngoài [l, r] thì trả giá trị trung hòa (0 với tổng), nằm gọn thì trả nguyên tree[node], giao một phần thì đệ quy xuống hai con. Mỗi tầng chỉ thăm tối đa hai nhánh nên chi phí là O(log N); cập nhật điểm tính lại các cha trên đường đi cũng O(log N). Code phức tạp hơn Fenwick Tree, nhưng cây đoạn linh hoạt hơn: hỗ trợ min/max đoạn và cập nhật cả đoạn nhờ lazy propagation.

## 3. Thuật toán từng bước
1. Build: đệ quy từ node gốc ứng với đoạn [0, N-1]; nếu start bằng end thì gán arr[start] cho lá, ngược lại gọi build hai con rồi cộng dồn giá trị lên cha.
2. Query(l, r): tại node đang xét đoạn [start, end], nếu nằm ngoài [l, r] trả 0; nếu nằm gọn trả tree[node]; nếu giao một phần, đệ quy cả hai con và cộng kết quả.
3. Point update: từ gốc đi xuống lá chứa vị trí cần sửa, cập nhật lá, rồi tính lại các cha trên đường đi.
4. Lazy propagation (cập nhật đoạn): cộng giá trị vào node nằm gọn trong [l, r] và ghi nợ vào mảng lazy; trước khi đệ quy qua node có nợ, đẩy nợ xuống hai con.

Ví dụ mảng [1, 3, 5, 7, 9, 11]: gốc [0,5] = 36; con trái [0,2] = 9 gồm [0,1] = 4 và [2,2] = 5; con phải [3,5] = 27. Truy vấn tổng [1,3] lấy từ lá [1,1] = 3, node [2,2] = 5 và lá [3,3] = 7; kết quả 3 + 5 + 7 = 15.

### Ví dụ
```javascript
class SegmentTree {
  constructor(arr) {
    this.n = arr.length;
    this.tree = new Array(4 * this.n); // mảng cây đoạn, 4N là đủ an toàn
    this.build(arr, 0, 0, this.n - 1);
  }

  // chia để trị: lá nhận giá trị, cha bằng tổng hai con
  build(arr, node, start, end) {
    if (start === end) {
      this.tree[node] = arr[start];
      return;
    }
    const mid = Math.floor((start + end) / 2);
    const left = 2 * node + 1, right = 2 * node + 2;
    this.build(arr, left, start, mid);
    this.build(arr, right, mid + 1, end);
    this.tree[node] = this.tree[left] + this.tree[right];
  }

  // truy vấn tổng đoạn [l, r]
  query(l, r) {
    return this._query(0, 0, this.n - 1, l, r);
  }

  _query(node, start, end, l, r) {
    if (r < start || end < l) return 0;              // ngoài đoạn: trung hòa 0
    if (l <= start && end <= r) return this.tree[node]; // nằm gọn: lấy nguyên
    const mid = Math.floor((start + end) / 2);
    return this._query(2 * node + 1, start, mid, l, r) +
           this._query(2 * node + 2, mid + 1, end, l, r);
  }

  // cập nhật arr[idx] = newValue
  update(idx, newValue) {
    this._update(0, 0, this.n - 1, idx, newValue);
  }

  _update(node, start, end, idx, newValue) {
    if (start === end) {
      this.tree[node] = newValue; // sửa lá
      return;
    }
    const mid = Math.floor((start + end) / 2);
    if (idx <= mid) this._update(2 * node + 1, start, mid, idx, newValue);
    else this._update(2 * node + 2, mid + 1, end, idx, newValue);
    this.tree[node] = this.tree[2 * node + 1] + this.tree[2 * node + 2];
  }
}
```

## 4. Độ phức tạp & so sánh
| Thao tác | Thời gian | Ghi chú |
| :--- | :--- | :--- |
| Build | O(N) | Duyệt toàn bộ node một lần |
| Query [l, r] | O(log N) | Mỗi tầng thăm tối đa hai nhánh |
| Point update | O(log N) | Sửa lá rồi cập nhật ngược lên gốc |
| Range update (lazy) | O(log N) | Trì hoãn việc đẩy nợ xuống con |

- Bộ nhớ: O(N) — mảng 4 × N phần tử.
- So với Fenwick Tree: Fenwick chỉ hợp với tổng cộng dồn, cài đặt đơn giản và chạy nhanh hơn khoảng 2-3 lần trong thực tế; Segment Tree khó cài hơn nhưng linh hoạt hơn: min/max đoạn, cập nhật đoạn bằng lazy, tìm phần tử thứ k.

## 5. Liên kết trực quan hóa
🖥️ **Mô phỏng tương tác:** bài học này chưa có demo trực quan chuyên biệt — hãy tự chạy code mẫu ở mục 3, rồi tiếp tục với phần Quiz.

## 6. Tổng kết
- Segment Tree lưu giá trị tổng hợp của từng đoạn; gốc là toàn bộ mảng, lá là từng phần tử.
- Build O(N), truy vấn đoạn và cập nhật điểm đều O(log N); cây nằm trên mảng 4 × N.
- Lazy propagation cho phép cập nhật cả đoạn trong O(log N) thay vì sửa từng phần tử.
- Chọn Fenwick khi chỉ cần tổng và cập nhật điểm; chọn Segment Tree khi cần min/max hay cập nhật đoạn.
- Bẫy thường gặp: quên trường hợp đoạn nằm ngoài trong query; cấp phát 2 × N khi N không phải lũy thừa của 2; quên đẩy lazy trước khi đệ quy xuống con.

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)",
                "dsa", "{}", 45, teacher.Id);
            _context.Lessons.Add(lesson35);
            var lesson36 = new Lesson("Fenwick Tree (Binary Indexed Tree — BIT)",
                @"# 🎯 Fenwick Tree (Binary Indexed Tree — BIT)

## 1. Động cơ học (Why this matters)
Đếm số cặp nghịch thế trong mảng, tính tổng doanh số từ đầu tháng tới ngày K, đếm tần suất giá trị trong một khoảng — tất cả đều quy về hai thao tác: tổng tiền tố và cập nhật điểm. Cả hai chạy O(log N) nhờ Fenwick Tree (BIT), một cấu trúc chỉ gồm một mảng duy nhất và một phép toán bit, cài đặt chưa tới chục dòng nhưng thực tế còn nhanh hơn Segment Tree.

## 2. Lý thuyết cốt lõi
- BIT dùng mảng tree đánh chỉ số từ 1; tree[i] lưu tổng của đoạn con độ dài i & (-i) kết thúc tại vị trí i.
- Phép lowbit(i) = i & (-i) trả về bit 1 nhỏ nhất của i — chìa khóa xác định đoạn mà mỗi node quản lý và cách nhảy giữa các node.
- Tổng tiền tố: cộng dồn tree[i] rồi trừ lowbit cho tới khi i về 0.
- Cập nhật điểm: cộng delta vào tree[i] rồi cộng lowbit cho tới khi vượt quá kích thước mảng.
- BIT chỉ hợp với phép toán khả nghịch như phép cộng; không hợp với min/max vì không thể trừ bỏ một phần tử.

Các đoạn được thiết kế theo nhị phân nên bất kỳ tiền tố nào cũng phân rã thành ít hơn log N đoạn rời nhau, và một vị trí chỉ nằm trong ít hơn log N node — nhờ đó cả hai thao tác đều O(log N). Tổng đoạn [l, r] bằng tổng tiền tố tới r trừ tổng tiền tố tới l-1. Số phép toán ít hơn Segment Tree nhiều (hai vòng while thay vì đệ quy) nên BIT chạy nhanh hơn khoảng 2-3 lần, lại ít bộ nhớ hơn vì không cần mảng lazy hay mảng 4 × N.

## 3. Thuật toán từng bước
1. Khởi tạo: tree là mảng N+1 toàn số 0; build từ mảng gốc bằng cách copy rồi cộng dồn node con vào cha (node i cộng vào j = i + lowbit(i)).
2. Update(idx, delta): đổi sang chỉ số 1; lặp while idx ≤ N: cộng delta vào tree[idx], rồi idx += lowbit(idx).
3. PrefixSum(idx): đổi sang chỉ số 1; lặp while idx > 0: cộng tree[idx] vào tổng, rồi idx -= lowbit(idx).
4. RangeSum(l, r): PrefixSum(r) − PrefixSum(l − 1).
5. Bài toán đếm: duyệt từ phải sang trái, mỗi bước truy vấn số phần tử nhỏ hơn giá trị hiện tại rồi cập nhật vị trí của nó lên 1 — kết hợp nén tọa độ để đếm cặp nghịch thế.

Ví dụ mảng [1, 3, 5, 7, 9, 11]: tree[1] = 1, tree[2] = 4, tree[3] = 5, tree[4] = 16, tree[5] = 9, tree[6] = 20. PrefixSum(5): bắt đầu ở 6 → cộng tree[6] = 20 → lùi lowbit(6) = 2 về 4 → cộng tree[4] = 16 → lùi về 0, kết quả 36. Update(2, +3): 3 → cộng tree[3] (5 thành 8) → tiến lên 4 → cộng tree[4] (16 thành 19).

### Ví dụ
```javascript
class FenwickTree {
  constructor(arr) {
    this.n = arr.length;
    this.tree = new Array(this.n + 1).fill(0); // đánh chỉ số từ 1
    for (let i = 0; i < this.n; i++) this.update(i, arr[i]);
  }

  // cập nhật arr[idx] += delta, đẩy lên các node chứa idx
  update(idx, delta) {
    for (let i = idx + 1; i <= this.n; i += i & -i) {
      this.tree[i] += delta;
    }
  }

  // tổng từ arr[0] tới arr[idx]
  prefixSum(idx) {
    let sum = 0;
    for (let i = idx + 1; i > 0; i -= i & -i) {
      sum += this.tree[i];
    }
    return sum;
  }

  // tổng đoạn [l, r]
  rangeSum(l, r) {
    return this.prefixSum(r) - this.prefixSum(l - 1);
  }
}
```

## 4. Độ phức tạp & so sánh
| Thao tác | Thời gian | Ghi chú |
| :--- | :--- | :--- |
| Build | O(N log N) | hoặc O(N) với phiên bản cộng dồn tối ưu |
| Prefix sum | O(log N) | Nhảy theo lowbit về phía 0 |
| Range sum | O(log N) | Hai lần prefix sum |
| Point update | O(log N) | Nhảy theo lowbit về phía lớn |

- Bộ nhớ: O(N) — đúng một mảng N+1, ít hơn mảng 4 × N của Segment Tree.
- Giới hạn: BIT chỉ hợp phép toán khả nghịch như tổng; không hỗ trợ min/max đoạn và không cập nhật đoạn trực tiếp.
- Ứng dụng: tổng đoạn với dữ liệu thay đổi liên tục, đếm cặp nghịch thế, bảng tần số, tìm phần tử nhỏ thứ k (order statistics).

## 5. Liên kết trực quan hóa
🖥️ **Mô phỏng tương tác:** bài học này chưa có demo trực quan chuyên biệt — hãy tự chạy code mẫu ở mục 3, rồi tiếp tục với phần Quiz.

## 6. Tổng kết
- BIT là một mảng 1-indexed; tree[i] quản lý đoạn độ dài lowbit(i) kết thúc tại i.
- Prefix sum lùi theo lowbit, point update tiến theo lowbit; cả hai đều O(log N).
- Bộ nhớ gọn và thực tế nhanh hơn Segment Tree, nhưng chỉ hợp phép toán khả nghịch như tổng.
- Đếm cặp nghịch thế, bảng tần số, tìm phần tử thứ k là những bài toán kinh điển của BIT.
- Bẫy thường gặp: quên chuyển 0-indexed sang 1-indexed; dùng BIT cho min/max; rangeSum với l = 0 mà quên prefixSum(-1) trả 0.

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)",
                "dsa", "{}", 45, teacher.Id);
            _context.Lessons.Add(lesson36);
            var lesson37 = new Lesson("Thuật toán chuỗi nâng cao (KMP / Rabin-Karp)",
                @"# 🎯 Thuật toán chuỗi nâng cao (KMP / Rabin-Karp)

## 1. Động cơ học
Tìm kiếm chuỗi con là thao tác phổ biến nhất trên văn bản: Ctrl+F trong trình soạn thảo, khớp trình tự DNA hàng triệu ký tự, phát hiện đạo văn, lọc nội dung độc hại. Cách ngây thơ duyệt từng vị trí bắt đầu mất O(n×m) phép so sánh — với bộ gen người (3 tỷ ký tự) con số đó là thảm họa. Bài học này trang bị các thuật toán đưa việc tìm kiếm về O(n+m): KMP, Rabin-Karp, Z-function và Manacher.

## 2. Lý thuyết cốt lõi
- Bài toán pattern matching: cho văn bản T dài n và mẫu P dài m, tìm mọi vị trí P xuất hiện trong T.
- Cách naive: thử mọi vị trí bắt đầu rồi so từng ký tự, xấu nhất O(n×m) — các ký tự đã khớp ở vòng trước bị so lại phí phạm.
- **KMP** dựa trên bảng LPS (longest proper prefix also suffix): khi so khớp hỏng tại vị trí j của P, ta dịch mẫu theo LPS thay vì quay về đầu; tổng cộng O(n+m).
- **Rabin-Karp** băm từng cửa sổ độ dài m; nhờ rolling hash, băm cửa sổ kế tiếp suy từ cửa sổ cũ trong O(1). Băm trùng (collision) vẫn phải xác minh bằng so sánh thật.
- **Z-function**: mảng Z[i] là độ dài đoạn dài nhất bắt đầu tại i trùng với tiền tố của chuỗi, xây được trong O(n).
- **Manacher**: tìm chuỗi con đối xứng dài nhất trong O(n) nhờ mở rộng quanh tâm và tận dụng thông tin phản chiếu từ tâm trước.

## 3. Thuật toán từng bước
1. Xây bảng LPS: tại mỗi vị trí i, tìm độ dài lớn nhất của tiền tố thật sự đồng thời là hậu tố của đoạn P[0..i].
2. Duyệt T với hai con trỏ i, j: T[i] bằng P[j] thì tăng cả hai; khác và j > 0 thì gán j = LPS[j-1] giữ nguyên i; khác và j = 0 thì tăng i.
3. Khi j đạt m, ghi nhận vị trí i - m rồi tiếp tục với j = LPS[j-1] để tìm vị trí kế tiếp.

Ví dụ P = 'ABABCABAB' có LPS = [0, 0, 1, 2, 0, 1, 2, 3, 4]; chẳng hạn LPS[7] = 3 vì 'ABA' vừa là tiền tố vừa là hậu tố của 'ABABCABA'. Với T = 'ABABDABACDABABCABAB', khi hỏng tại D (j = 4), ta nhảy j về LPS[3] = 2 thay vì về 0 — tiết kiệm hai lần so sánh.

Rabin-Karp với T = '3141592653' và P = '4159': băm cửa sổ đầu '3141' tính sẵn, mỗi bước trượt bỏ ký tự đầu và thêm ký tự cuối; chỉ khi băm trùng mới đối chiếu thật từng ký tự.

### Ví dụ
```javascript
// Xây bảng LPS cho KMP
function buildLPS(pattern) {
  const lps = new Array(pattern.length).fill(0);
  let len = 0, i = 1;
  while (i < pattern.length) {
    if (pattern[i] === pattern[len]) {
      len++;
      lps[i] = len;
      i++;
    } else if (len > 0) {
      len = lps[len - 1];          // rút ngắn tiền tố đang khớp
    } else {
      lps[i] = 0;
      i++;
    }
  }
  return lps;
}

// Tìm mọi vị trí mẫu xuất hiện trong văn bản
function kmpSearch(text, pattern) {
  const lps = buildLPS(pattern);
  const result = [];
  let i = 0, j = 0;
  while (i < text.length) {
    if (text[i] === pattern[j]) {
      i++; j++;
      if (j === pattern.length) {
        result.push(i - j);        // ghi nhận một vị trí khớp
        j = lps[j - 1];            // tìm tiếp vị trí sau
      }
    } else if (j > 0) {
      j = lps[j - 1];              // dịch mẫu nhờ bảng LPS
    } else {
      i++;
    }
  }
  return result;
}
```

## 4. Độ phức tạp & so sánh
| Thuật toán | Thời gian trung bình | Xấu nhất |
| :--- | :--- | :--- |
| Naive | O(n×m) | O(n×m) |
| KMP | O(n+m) | O(n+m) |
| Rabin-Karp | O(n+m) | O(n×m) |
| Z-function | O(n) | O(n) |
| Manacher | O(n) | O(n) |

- Bộ nhớ: KMP dùng O(m) cho bảng LPS; Z và Manacher dùng O(n); Rabin-Karp chỉ cần O(1) thêm.
- Manacher giải bài toán palindrome riêng, không phải pattern matching tổng quát.

## 5. Liên kết trực quan hóa
🖥️ **Mô phỏng tương tác:** bài học này chưa có demo trực quan chuyên biệt — hãy tự chạy code mẫu ở mục 3, rồi tiếp tục với phần Quiz.

## 6. Tổng kết
- Naive mất O(n×m) vì quay về đầu mỗi lần hỏng; KMP dùng LPS để dịch mẫu, đạt O(n+m).
- Rabin-Karp băm cửa sổ trượt trong O(1) nhưng phải xác minh khi collision; chọn modulo lớn để giảm xác suất trùng.
- Z-function và Manacher đều chạy tuyến tính nhưng phục vụ những bài toán riêng biệt.
- Bẫy thường gặp: quên nhánh j = 0 khi hỏng ngay ký tự đầu; kết quả băm modulo có thể âm — hãy cộng lại modulo.

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)",
                "dsa", "{}", 45, teacher.Id);
            _context.Lessons.Add(lesson37);
            var lesson38 = new Lesson("Advanced Data Structures (LFU / Bloom Filter / Skip List)",
                @"# 🎯 Advanced Data Structures (LFU / Bloom Filter / Skip List)

## 1. Động cơ học
Trình duyệt tải lại trang không phải lúc nào cũng gọi máy chủ nhờ bộ nhớ đệm; mỗi CPU có nhiều tầng cache; Redis phục vụ hàng tỷ truy vấn mỗi ngày. Đứng sau chúng là các cấu trúc dữ liệu tiên tiến của bài này: LFU quyết định ai bị đuổi khỏi cache, Bloom Filter trả lời câu hỏi tồn tại trong vài nanô-giây với sai số kiểm soát được, Skip List tìm kiếm có thứ tự mà không cần cây cân bằng.

## 2. Lý thuyết cốt lõi
- **LRU (đã học)**: xóa phần tử ít được dùng gần đây nhất; bảng băm cộng danh sách liên kết đôi đạt O(1) cho lấy và chèn.
- **LFU**: xóa phần tử truy cập ít lần nhất; bằng tần suất thì xóa phần tử lâu chưa dùng (tie-break LRU). Cấu trúc gồm bảng bucket tần suất và biến minFreq.
- **Bloom Filter**: mảng bit độ dài m với k hàm băm; chèn gán k bit, truy vấn kiểm tra cả k bit. Gặp bit 0 là chắc chắn không có; cả k bit bằng 1 mới chỉ là có thể có — false positive xảy ra, false negative không bao giờ.
- **Skip List**: nhiều tầng danh sách liên kết, mỗi node thăng lên tầng cao hơn với xác suất 1/2; tìm từ tầng cao nhất đi phải rồi rơi xuống khi vượt; trung bình O(log n).

## 3. Thuật toán từng bước
1. LFU truy cập phần tử: tăng tần suất thêm 1, chuyển từ bucket f sang bucket f+1.
2. LFU hết chỗ: xóa phần tử đầu bucket minFreq — lâu chưa dùng nhất trong nhóm ít dùng nhất.
3. Bloom filter chèn x: đặt các bit h1(x)...hk(x) thành 1; truy vấn y: một bit 0 bất kỳ là chắc chắn không có.
4. Skip list tìm 7: bắt đầu từ nút trái trên cùng, đi phải khi nút kế tiếp nhỏ hơn 7, hết tầng thì rơi xuống một tầng.

Ví dụ Bloom Filter: m = 10 bit, k = 2; chèn 'dog' bật bit 2 và 7; chèn 'cat' bật bit 3 và 7. Truy vấn 'bird' cần bit 3 và 5 — bit 5 bằng 0 nên kết luận chưa từng chèn.

Ví dụ Skip List: bốn node 3, 7, 9, 12; node 7 và 9 ở tầng 2, node 7 ở tầng 3 — tìm 7 chỉ mất hai bước thay vì bốn.

### Ví dụ
```javascript
// Bloom Filter đơn giản — m bit và k hàm băm
class BloomFilter {
  constructor(m, k) {
    this.bits = new Array(m).fill(0);
    this.k = k;
  }
  // Hàm băm kiểu FNV-1a, trả về chỉ số bit
  hash(str, salt) {
    let h = 2166136261 ^ salt;
    for (const ch of str) {
      h ^= ch.charCodeAt(0);
      h = Math.imul(h, 16777619);
    }
    return Math.abs(h) % this.bits.length;
  }
  insert(str) {
    for (let s = 0; s < this.k; s++) {
      this.bits[this.hash(str, s)] = 1;  // gán k bit về 1
    }
  }
  contains(str) {
    for (let s = 0; s < this.k; s++) {
      if (this.bits[this.hash(str, s)] === 0) return false; // chắc chắn không có
    }
    return true;                          // có thể có (false positive)
  }
}
```

## 4. Độ phức tạp & so sánh
| Cấu trúc | Lấy / tra cứu | Thêm / chèn | Ghi chú |
| :--- | :--- | :--- | :--- |
| LRU | O(1) | O(1) | bảng băm + danh sách liên kết đôi |
| LFU | O(1) trung bình | O(1) trung bình | bucket tần suất, triển khai phức tạp |
| Bloom Filter | O(k) | O(k) | k hàm băm, xác suất, không false negative |
| Skip List | O(log n) trung bình | O(log n) trung bình | xấu nhất O(n) |

- Bộ nhớ: LRU/LFU dùng O(capacity); Bloom Filter dùng O(m) bit; Skip List trung bình O(n) cho con trỏ.
- Skip List thay cây cân bằng khi cần đơn giản, dễ đồng bộ đa luồng — Redis dùng cho sorted set.

## 5. Liên kết trực quan hóa
🖥️ **Mô phỏng tương tác:** bài học này chưa có demo trực quan chuyên biệt — hãy tự chạy code mẫu ở mục 3, rồi tiếp tục với phần Quiz.

## 6. Tổng kết
- LRU nhìn thời gian gần đây, LFU nhìn tần suất; LFU hợp cache ổn định nhưng triển khai khó hơn.
- Bloom Filter trả lời chắc chắn 'không có', chỉ 'có thể có'; tăng m giảm false positive.
- Skip List dễ cài đặt hơn cây cân bằng, Redis dùng cho sorted set.
- Bẫy thường gặp: Bloom Filter không xóa được phần tử (trừ counting variant); quên tie-break LRU khi cùng tần suất; skip list xấu nhất vẫn O(n).

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)",
                "dsa", "{}", 45, teacher.Id);
            _context.Lessons.Add(lesson38);
            var lesson39 = new Lesson("Tổng ôn & chiến lược phỏng vấn",
                @"# 🎯 Tổng ôn & chiến lược phỏng vấn

## 1. Động cơ học
Một buổi phỏng vấn thuật toán thường chỉ kéo dài 45 phút: vài phút phân tích đề, một giải pháp đúng và sạch, vài phút kiểm thử. Người được tuyển không phải người thuộc nhiều code nhất mà là người chọn đúng cấu trúc dữ liệu và thuật toán ngay từ phút đầu. Đó là kỹ năng rèn được bằng phương pháp — bài cuối này tổng hợp tư duy đó thành bản đồ quyết định.

## 2. Lý thuyết cốt lõi
- **Chọn cấu trúc theo thao tác ưu tiên:** tra cứu khóa nhanh → hash table; giữ thứ tự → mảng sắp xếp hoặc BST; min/max liên tục → heap; FIFO → queue; LIFO → stack; quan hệ cặp đôi → graph; tiền tố chung → trie.
- **Chọn thuật toán theo dấu hiệu đề:** mảng đã sắp xếp → binary search, two pointers; mọi nghiệm → backtracking; trạng thái lặp lại → quy hoạch động; đường đi ngắn nhất → BFS hoặc Dijkstra; phụ thuộc → topological sort; top K → heap kích thước K; liên thông → DFS hoặc Union-Find.
- Hai bảng ánh xạ giúp hình dung giải pháp trước khi viết code — thói quen quyết định kết quả phỏng vấn.

## 3. Quy trình giải bài (checklist)
1. Đọc đề, ghi rõ ràng buộc: kích thước đầu vào, kiểu dữ liệu, giới hạn thời gian — suy ra mức Big O cần đạt.
2. Nêu brute force trước rồi tối ưu; xác nhận cách hiểu đề với người phỏng vấn trước khi code.
3. Viết code biến tên rõ nghĩa, xử lý biên ngay: rỗng, một phần tử, toàn phần tử trùng.
4. Dry-run ví dụ nhỏ trên giấy, đối chiếu từng bước với đầu ra mong đợi.
5. Sau khi chạy đúng, kiểm tra edge case sót: tràn số, âm, null, chu trình, N cực lớn.

Edge case kinh điển: mảng rỗng và một phần tử; số âm khi đề chỉ nhắc số nguyên; tổng/tích tràn 32-bit; đồ thị có chu trình khi DFS; đầu vào đã sắp xếp hoặc ngược.

Lỗi thường gặp: off-by-one; đệ quy thiếu điều kiện dừng; BFS quên đánh dấu đã thăm gây lặp vô hạn; hai vòng lặp khi hash làm trong O(n); sửa đầu vào gốc của đề.

## 4. Độ phức tạp & so sánh — bảng tra nhanh
| Nhu cầu | Cấu trúc phù hợp | Tra cứu/lấy | Thêm |
| :--- | :--- | :--- | :--- |
| Tra theo khóa | Hash table | O(1) | O(1) |
| Giữ thứ tự | Mảng sort / BST | O(log n) | O(n) / O(log n) |
| Min/max liên tục | Heap | O(1) | O(log n) |
| Vào trước ra trước | Queue | O(1) | O(1) |
| Vào sau ra trước | Stack | O(1) | O(1) |
| Thành phần liên thông | Union-Find | gần O(1) | gần O(1) |

- Bảng này trả lời phần lớn câu hỏi 'nên dùng cấu trúc nào'; nắm nhịp O(1) - O(log n) - O(n) là nền tảng suy ra mọi cấu trúc khác.

## 5. Liên kết trực quan hóa
🖥️ **Mô phỏng tương tác:** bài học này chưa có demo trực quan chuyên biệt — hãy tự chạy code mẫu ở mục 3, rồi tiếp tục với phần Quiz.

## 6. Tổng kết
- Tra nhanh bằng hash, giữ thứ tự bằng sort/BST, min/max bằng heap, phụ thuộc bằng topo, liên thông bằng DFS/Union-Find.
- Viết brute force trước để hiểu đúng đề, tối ưu sau; luôn khai báo giả định và độ phức tạp.
- Kiểm thử biên là bắt buộc: rỗng, một phần tử, trùng, tràn, chu trình.
- Luyện theo pattern mỗi ngày một bài, ghi chép lỗi sai, tái giải bài cũ sau một đến hai tuần.
- Bẫy lớn nhất: chọn cấu trúc theo sở thích thay vì yêu cầu đề; ngừng suy nghĩ khi code chạy đúng một ví dụ.

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)",
                "dsa", "{}", 45, teacher.Id);
            _context.Lessons.Add(lesson39);
            var lesson40 = new Lesson("DP Patterns (Interval, Bitmask, Tree DP)",
                @"# 🎯 DP Patterns (Interval, Bitmask, Tree DP)

## 1. Động cơ học
Một bài toán DP khó thường không chỉ là tìm đúng công thức truy hồi, mà còn là chọn đúng **hình dạng trạng thái**: mảng 1 chiều, bảng 2 chiều, khoảng trên dãy, hay tập con các phần tử. Khi gặp bài toán chia chuỗi bóng bay, tối ưu hành trình qua tập thành phố, hay đếm đường đi trên cây, các pattern Interval DP, Bitmask DP và Tree DP xuất hiện lặp đi lặp lại trong phỏng vấn nâng cao và các kỳ thi lập trình thi đấu. Bài này trang bị cho bạn bộ khuôn mẫu nhận diện và khung giải cho cả ba họ bài toán đó.

## 2. Lý thuyết cốt lõi
- **Interval DP**: trạng thái là `dp[i][j]` — kết quả tối ưu của đoạn liên tiếp từ i đến j. Recurrence thường chọn một điểm chia k giữa i và j, cộng hai bài toán con rồi gộp chi phí.
- **Bitmask DP**: trạng thái là `dp[mask]` trong đó mask là số nguyên biểu diễn tập hợp các phần tử đã dùng (bit thứ bật nghĩa là phần tử đó đã được chọn). Chỉ khả thi khi số phần tử n ≤ 20 vì có 2^n trạng thái.
- **Tree DP**: trạng thái gắn với node trên cây — `dp[node]` phụ thuộc vào kết quả của các node con; duyệt postorder để tính con trước rồi mới gộp lên cha.
- Điểm chung của cả ba: vẫn cần overlapping subproblems và optimal substructure — nếu không có hai tính chất đó thì không phải DP.

Interval DP mô hình hóa các bài toán mà thao tác xảy ra trên một khoảng và thứ tự xử lý giữa trong ra ngoài: burst balloons chọn quả bóng bị nổ cuối cùng trong đoạn, matrix chain chọn vị trí cắt phép nhân. Bitmask DP xử lý các bài toán hoán vị hoặc chia nhóm mà thứ tự xử lý ảnh hưởng kết quả: shortest Hamiltonian path, chia tập thành các nhóm cân bằng. Tree DP khai thác cấu trúc phân cấp tự nhiên: đường đi lớn nhất trong cây, chọn node sao cho tổng giá trị lớn nhất mà không chọn hai node kề nhau (house robber III).

## 3. Ý tưởng chính từng bước
1. Xác định hình dạng trạng thái: khoảng (i, j) / tập con (mask) / node (u).
2. Viết recurrence:
   - Interval: `dp[i][j] = max(dp[i][k] + dp[k+1][j] + cost)` với k chạy từ i đến j-1.
   - Bitmask: `dp[mask] = min(dp[mask without bit b] + cost(last, b))` — thêm phần tử b vào cuối hành trình.
   - Tree: `dp[u] = f(dp[child1], dp[child2], ...)` gộp từ con lên cha.
3. Xác định base case: đoạn dài 1, mask chỉ 1 bit, node lá.
4. Duyệt theo thứ tự đảm bảo bài toán con tính trước: khoảng tăng dần độ dài; mask tăng dần giá trị; cây duyệt postorder.

Ví dụ Interval — burst balloons với mảng [3, 1, 5]: mỗi lần nổ một quả thu điểm bằng tích giá trị quả đó với hai hàng xóm hiện tại. Thay vì mô phỏng thứ tự nổ, ta đảo ngược tư duy: chọn quả bóng **nổ cuối cùng** trong đoạn — khi đó hai bên đã bị nổ hết nên chi phí chỉ còn tích với biên ngoài đoạn. Chọn quả 1 nổ cuối: chi phí 3×1×5 = 15 cộng hai đoạn con rỗng, tổng 15; chọn quả 3 nổ cuối: đoạn trái [1,5] tối ưu là 5 rồi nổ 3 với biên 1×3×1... cách quy hoạch khoảng cho phép thử mọi phương án trong O(n³).

Ví dụ Bitmask — bài toán người bán hàng nhỏ (travelling salesman): với 4 thành phố, `dp[mask][last]` lưu chi phí thấp nhất đi qua đúng tập mask và kết thúc tại last. Từ mask 0001 (chỉ ở thành phố 0), mở rộng dần từng bit, mỗi bước thử mọi thành phố chưa đi. Độ phức tạp O(2^n × n²) — chấp nhận với n ≤ 20.

Ví dụ Tree DP — house robber III: mỗi node chọn đánh cắp (không được cướp con) hoặc không đánh cắp (có thể cướp con). Với mỗi node lưu cặp (không-cướp, cướp): không-cướp = tổng max của cặp con; cướp = giá trị node + tổng không-cướp của con. Kết quả là max của cặp tại gốc.

### Ví dụ
```javascript
// Interval DP: tối đa điểm nổ bóng (burst balloons) — chọn quả nổ cuối
function maxCoins(nums) {
  const n = nums.length;
  const val = [1, ...nums, 1];       // thêm biên 1 hai đầu
  const dp = Array.from({ length: n + 2 }, () => Array(n + 2).fill(0));
  for (let len = 1; len <= n; len++) {
    for (let i = 1; i <= n - len + 1; i++) {
      const j = i + len - 1;
      for (let k = i; k <= j; k++) {
        dp[i][j] = Math.max(
          dp[i][j],
          dp[i][k - 1] + val[i - 1] * val[k] * val[j + 1] + dp[k + 1][j]
        );
      }
    }
  }
  return dp[1][n];
}

// Bitmask DP: đường đi ngắn nhất qua mọi thành phố (TSP nhỏ, n <= 20)
function tspMin(dist) {
  const n = dist.length;
  const size = 1 << n;
  const dp = Array.from({ length: size }, () => Array(n).fill(Infinity));
  dp[1][0] = 0; // bắt đầu từ thành phố 0
  for (let mask = 1; mask < size; mask++) {
    for (let last = 0; last < n; last++) {
      if (!(mask & (1 << last))) continue;
      for (let next = 0; next < n; next++) {
        if (mask & (1 << next)) continue;
        dp[mask | (1 << next)][next] = Math.min(
          dp[mask | (1 << next)][next],
          dp[mask][last] + dist[last][next]
        );
      }
    }
  }
  return Math.min(...dp[size - 1]);
}

// Tree DP: house robber III — dp[u] = [khong-cuop, cuop]
function robTree(root) {
  function dfs(node) {
    if (!node) return [0, 0];
    const l = dfs(node.left);
    const r = dfs(node.right);
    const notRob = Math.max(l[0], l[1]) + Math.max(r[0], r[1]);
    const rob = node.val + l[0] + r[0];
    return [notRob, rob];
  }
  const res = dfs(root);
  return Math.max(res[0], res[1]);
}
```

## 4. Độ phức tạp & so sánh
| Pattern | Trạng thái | Độ phức tạp | Dùng khi |
| :--- | :--- | :--- | :--- |
| Interval DP | dp[i][j] | O(n³) điển hình | Thao tác trên đoạn, chia trong ra ngoài |
| Bitmask DP | dp[mask] | O(2^n × n²) | Tập con, n ≤ 20, thứ tự ảnh hưởng |
| Tree DP | dp[node] | O(n) | Kết quả gộp từ node con |

- Bộ nhớ: O(n²) cho Interval, O(2^n × n) cho Bitmask, O(n) cho Tree.
- Chọn đúng pattern giảm thời gian suy nghĩ và tránh recurrence sai hình dạng.

## 5. Liên kết trực quan hóa
🖥️ **Mô phỏng tương tác:** bài học này chưa có demo trực quan chuyên biệt — hãy tự chạy code mẫu ở mục 3, rồi tiếp tục với phần Quiz.

## 6. Tổng kết
- Interval DP dùng dp[i][j] cho đoạn liên tục, chia điểm k ở giữa — nhớ tư duy đảo ngược (chọn thao tác cuối cùng).
- Bitmask DP dùng số nguyên làm tập hợp, giới hạn n ≤ 20, mở rộng từng bit.
- Tree DP gộp kết quả từ con lên cha theo postorder.
- Bẫy thường gặp: dùng Interval DP cho bài không có tính khoảng, dùng Bitmask khi n quá lớn (2^n bùng nổ), quên base case hoặc duyệt sai thứ tự khiến bài toán con chưa tính xong.

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)",
                "dsa", "{}", 45, teacher.Id);
            _context.Lessons.Add(lesson40);

        // ── Publish toàn bộ lessons: ApproveAndPublish() yêu cầu trạng thái PendingReview ──
            foreach (var lesson in new[]
            {
                lesson01, lesson02, lesson03, lesson04, lesson05, lesson06, lesson07, lesson08,
                lesson09, lesson10, lesson11, lesson12, lesson13, lesson14, lesson15, lesson16,
                lesson17, lesson18, lesson19, lesson20, lesson21, lesson22, lesson23, lesson24,
                lesson25, lesson26, lesson27, lesson28, lesson29, lesson30, lesson31, lesson32,
                lesson33, lesson34, lesson35, lesson36, lesson37, lesson38, lesson39, lesson40
            })
            {
                lesson.SubmitForReview();
                lesson.ApproveAndPublish();
            }

        // ── 3 Roadmap (Course container, Module = chặng, ModuleItem = lesson tham chiếu) ──
            var r1 = new Course(teacher.Id, "Lộ trình Cơ bản (Foundation)", "Lộ trình nhập môn DSA: nắm vững nền tảng thuật toán, cấu trúc dữ liệu tuyến tính và các kỹ thuật xử lý dữ liệu cơ bản.", CourseCategory.DataStructure, CourseDifficulty.Beginner, false, "https://images.unsplash.com/photo-1516116211223-48a122638c59?w=500&q=80");
            var r1m1 = new CourseModule(r1.Id, "Chặng 1 · Nền tảng", "Khái niệm và cấu trúc dữ liệu nền tảng", 1000);
            r1.Modules.Add(r1m1);
            r1m1.Items.Add(new ModuleItem(r1m1.Id, null, ModuleItemType.Lesson, lesson01.Id, null, null, "Độ phức tạp thuật toán (Big O)", 1000, true));
            r1m1.Items.Add(new ModuleItem(r1m1.Id, null, ModuleItemType.Quiz, null, quizL01.Id, null, "Quiz: Độ phức tạp thuật toán (Big O)", 1500, true));
            r1m1.Items.Add(new ModuleItem(r1m1.Id, null, ModuleItemType.Lesson, lesson02.Id, null, null, "Mảng & kỹ thuật cơ bản", 2000, true));
            r1m1.Items.Add(new ModuleItem(r1m1.Id, null, ModuleItemType.Quiz, null, quizL02.Id, null, "Quiz: Mảng & kỹ thuật cơ bản", 2500, true));
            r1m1.Items.Add(new ModuleItem(r1m1.Id, null, ModuleItemType.Lesson, lesson03.Id, null, null, "Chuỗi cơ bản", 3000, true));
            r1m1.Items.Add(new ModuleItem(r1m1.Id, null, ModuleItemType.Quiz, null, quizL03.Id, null, "Quiz: Chuỗi cơ bản", 3500, true));
            r1m1.Items.Add(new ModuleItem(r1m1.Id, null, ModuleItemType.Lesson, lesson04.Id, null, null, "Hash Table & Set", 4000, true));
            r1m1.Items.Add(new ModuleItem(r1m1.Id, null, ModuleItemType.Quiz, null, quizL04.Id, null, "Quiz: Hash Table & Set", 4500, true));
            r1m1.Items.Add(new ModuleItem(r1m1.Id, null, ModuleItemType.Lesson, lesson05.Id, null, null, "Linked List", 5000, true));
            r1m1.Items.Add(new ModuleItem(r1m1.Id, null, ModuleItemType.Quiz, null, quizL05.Id, null, "Quiz: Linked List", 5500, true));
            r1m1.Items.Add(new ModuleItem(r1m1.Id, null, ModuleItemType.Lesson, lesson06.Id, null, null, "Stack", 6000, true));
            r1m1.Items.Add(new ModuleItem(r1m1.Id, null, ModuleItemType.Quiz, null, quizL06.Id, null, "Quiz: Stack", 6500, true));
            r1m1.Items.Add(new ModuleItem(r1m1.Id, null, ModuleItemType.Lesson, lesson07.Id, null, null, "Queue & Deque: Hàng đợi và Hàng đợi hai đầu", 7000, true));
            r1m1.Items.Add(new ModuleItem(r1m1.Id, null, ModuleItemType.Quiz, null, quizL07.Id, null, "Quiz: Queue & Deque: Hàng đợi và Hàng đợi hai đầu", 7500, true));
            r1m1.Items.Add(new ModuleItem(r1m1.Id, null, ModuleItemType.Lesson, lesson08.Id, null, null, "Đệ quy (Recursion): Hàm gọi chính mình", 8000, true));
            r1m1.Items.Add(new ModuleItem(r1m1.Id, null, ModuleItemType.Quiz, null, quizL08.Id, null, "Quiz: Đệ quy (Recursion): Hàm gọi chính mình", 8500, true));
            var r1m2 = new CourseModule(r1.Id, "Chặng 2 · Kỹ thuật nền", "Sắp xếp, tìm kiếm và kỹ thuật xử lý", 2000);
            r1.Modules.Add(r1m2);
            r1m2.Items.Add(new ModuleItem(r1m2.Id, null, ModuleItemType.Lesson, lesson09.Id, null, null, "Sắp xếp cơ bản (Bubble, Selection, Insertion)", 1000, true));
            r1m2.Items.Add(new ModuleItem(r1m2.Id, null, ModuleItemType.Quiz, null, quizL09.Id, null, "Quiz: Sắp xếp cơ bản (Bubble, Selection, Insertion)", 1500, true));
            r1m2.Items.Add(new ModuleItem(r1m2.Id, null, ModuleItemType.Lesson, lesson10.Id, null, null, "Tìm kiếm: Linear & Binary", 2000, true));
            r1m2.Items.Add(new ModuleItem(r1m2.Id, null, ModuleItemType.Quiz, null, quizL10.Id, null, "Quiz: Tìm kiếm: Linear & Binary", 2500, true));
            r1m2.Items.Add(new ModuleItem(r1m2.Id, null, ModuleItemType.Lesson, lesson11.Id, null, null, "Two Pointers — Kỹ thuật hai con trỏ quét dữ liệu", 3000, true));
            r1m2.Items.Add(new ModuleItem(r1m2.Id, null, ModuleItemType.Quiz, null, quizL11.Id, null, "Quiz: Two Pointers — Kỹ thuật hai con trỏ quét dữ liệu", 3500, true));
            r1m2.Items.Add(new ModuleItem(r1m2.Id, null, ModuleItemType.Lesson, lesson12.Id, null, null, "Sliding Window — Kỹ thuật cửa sổ trượt", 4000, true));
            r1m2.Items.Add(new ModuleItem(r1m2.Id, null, ModuleItemType.Quiz, null, quizL12.Id, null, "Quiz: Sliding Window — Kỹ thuật cửa sổ trượt", 4500, true));
            r1.Publish();
            _context.Courses.Add(r1);

            var r2 = new Course(teacher.Id, "Lộ trình Trung cấp (Intermediate)", "Nâng cao kỹ năng: kỹ thuật xử lý mảng, cây, đồ thị và các chiến lược thiết kế thuật toán.", CourseCategory.DataStructure, CourseDifficulty.Intermediate, false, "https://images.unsplash.com/photo-1554177255-61502b352de3?w=500&q=80");
            var r2m1 = new CourseModule(r2.Id, "Chặng 1 · Kỹ thuật mảng", "Binary search nâng cao, prefix sum, Kadane, monotonic stack", 1000);
            r2.Modules.Add(r2m1);
            r2m1.Items.Add(new ModuleItem(r2m1.Id, null, ModuleItemType.Lesson, lesson13.Id, null, null, "Binary Search nâng cao", 1000, true));
            r2m1.Items.Add(new ModuleItem(r2m1.Id, null, ModuleItemType.Quiz, null, quizL13.Id, null, "Quiz: Binary Search nâng cao", 1500, true));
            r2m1.Items.Add(new ModuleItem(r2m1.Id, null, ModuleItemType.Lesson, lesson14.Id, null, null, "Prefix Sum & Difference Array", 2000, true));
            r2m1.Items.Add(new ModuleItem(r2m1.Id, null, ModuleItemType.Quiz, null, quizL14.Id, null, "Quiz: Prefix Sum & Difference Array", 2500, true));
            r2m1.Items.Add(new ModuleItem(r2m1.Id, null, ModuleItemType.Lesson, lesson15.Id, null, null, "Kadane & Maximum Subarray", 3000, true));
            r2m1.Items.Add(new ModuleItem(r2m1.Id, null, ModuleItemType.Quiz, null, quizL15.Id, null, "Quiz: Kadane & Maximum Subarray", 3500, true));
            r2m1.Items.Add(new ModuleItem(r2m1.Id, null, ModuleItemType.Lesson, lesson16.Id, null, null, "Monotonic Stack & Deque", 4000, true));
            r2m1.Items.Add(new ModuleItem(r2m1.Id, null, ModuleItemType.Quiz, null, quizL16.Id, null, "Quiz: Monotonic Stack & Deque", 4500, true));
            var r2m2 = new CourseModule(r2.Id, "Chặng 2 · Cấu trúc & đồ thị", "Cây, đồ thị, backtracking và các chiến lược thiết kế", 2000);
            r2.Modules.Add(r2m2);
            r2m2.Items.Add(new ModuleItem(r2m2.Id, null, ModuleItemType.Lesson, lesson17.Id, null, null, "Cây Nhị Phân Tìm Kiếm (Binary Search Tree — BST)", 1000, true));
            r2m2.Items.Add(new ModuleItem(r2m2.Id, null, ModuleItemType.Quiz, null, quizL17.Id, null, "Quiz: Cây Nhị Phân Tìm Kiếm (Binary Search Tree — BST)", 1500, true));
            r2m2.Items.Add(new ModuleItem(r2m2.Id, null, ModuleItemType.Lesson, lesson18.Id, null, null, "Cây & Duyệt cây (DFS / BFS)", 2000, true));
            r2m2.Items.Add(new ModuleItem(r2m2.Id, null, ModuleItemType.Quiz, null, quizL18.Id, null, "Quiz: Cây & Duyệt cây (DFS / BFS)", 2500, true));
            r2m2.Items.Add(new ModuleItem(r2m2.Id, null, ModuleItemType.Lesson, lesson19.Id, null, null, "Heap & Hàng đợi ưu tiên (Priority Queue)", 3000, true));
            r2m2.Items.Add(new ModuleItem(r2m2.Id, null, ModuleItemType.Quiz, null, quizL19.Id, null, "Quiz: Heap & Hàng đợi ưu tiên (Priority Queue)", 3500, true));
            r2m2.Items.Add(new ModuleItem(r2m2.Id, null, ModuleItemType.Lesson, lesson20.Id, null, null, "Đồ thị (Graph): biểu diễn & duyệt BFS/DFS", 4000, true));
            r2m2.Items.Add(new ModuleItem(r2m2.Id, null, ModuleItemType.Quiz, null, quizL20.Id, null, "Quiz: Đồ thị (Graph): biểu diễn & duyệt BFS/DFS", 4500, true));
            r2m2.Items.Add(new ModuleItem(r2m2.Id, null, ModuleItemType.Lesson, lesson21.Id, null, null, "Topological Sort (Sắp xếp tô-pô)", 5000, true));
            r2m2.Items.Add(new ModuleItem(r2m2.Id, null, ModuleItemType.Quiz, null, quizL21.Id, null, "Quiz: Topological Sort (Sắp xếp tô-pô)", 5500, true));
            r2m2.Items.Add(new ModuleItem(r2m2.Id, null, ModuleItemType.Lesson, lesson22.Id, null, null, "Backtracking (Quay lui)", 6000, true));
            r2m2.Items.Add(new ModuleItem(r2m2.Id, null, ModuleItemType.Quiz, null, quizL22.Id, null, "Quiz: Backtracking (Quay lui)", 6500, true));
            r2m2.Items.Add(new ModuleItem(r2m2.Id, null, ModuleItemType.Lesson, lesson23.Id, null, null, "Chia để Trị (Divide & Conquer)", 7000, true));
            r2m2.Items.Add(new ModuleItem(r2m2.Id, null, ModuleItemType.Quiz, null, quizL23.Id, null, "Quiz: Chia để Trị (Divide & Conquer)", 7500, true));
            r2m2.Items.Add(new ModuleItem(r2m2.Id, null, ModuleItemType.Lesson, lesson24.Id, null, null, "Thuật toán Tham lam (Greedy)", 8000, true));
            r2m2.Items.Add(new ModuleItem(r2m2.Id, null, ModuleItemType.Quiz, null, quizL24.Id, null, "Quiz: Thuật toán Tham lam (Greedy)", 8500, true));
            r2m2.Items.Add(new ModuleItem(r2m2.Id, null, ModuleItemType.Lesson, lesson25.Id, null, null, "Bài toán Khoảng thời gian (Interval Problems)", 9000, true));
            r2m2.Items.Add(new ModuleItem(r2m2.Id, null, ModuleItemType.Quiz, null, quizL25.Id, null, "Quiz: Bài toán Khoảng thời gian (Interval Problems)", 9500, true));
            r2m2.Items.Add(new ModuleItem(r2m2.Id, null, ModuleItemType.Lesson, lesson26.Id, null, null, "Ma trận & Các khuôn mẫu xử lý lưới (Matrix / Grid Patterns)", 10000, true));
            r2m2.Items.Add(new ModuleItem(r2m2.Id, null, ModuleItemType.Quiz, null, quizL26.Id, null, "Quiz: Ma trận & Các khuôn mẫu xử lý lưới (Matrix / Grid Patterns)", 10500, true));
            r2m2.Items.Add(new ModuleItem(r2m2.Id, null, ModuleItemType.Lesson, lesson27.Id, null, null, "Thao tác Bit & Số học (Bit Manipulation & Số học)", 11000, true));
            r2m2.Items.Add(new ModuleItem(r2m2.Id, null, ModuleItemType.Quiz, null, quizL27.Id, null, "Quiz: Thao tác Bit & Số học (Bit Manipulation & Số học)", 11500, true));
            r2.Publish();
            _context.Courses.Add(r2);

            var r3 = new Course(teacher.Id, "Lộ trình Nâng cao (Advanced)", "Thuật toán nâng cao: quy hoạch động, đường đi ngắn nhất, cấu trúc dữ liệu chuyên sâu và chiến lược phỏng vấn.", CourseCategory.DataStructure, CourseDifficulty.Advanced, false, "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=500&q=80");
            var r3m1 = new CourseModule(r3.Id, "Chặng 1 · Thuật toán nâng cao", "Sắp xếp nâng cao, DP, đường đi ngắn nhất, MST, Union-Find", 1000);
            r3.Modules.Add(r3m1);
            r3m1.Items.Add(new ModuleItem(r3m1.Id, null, ModuleItemType.Lesson, lesson28.Id, null, null, "Sắp xếp nâng cao (Merge, Quick, Heap & Non-comparison)", 1000, true));
            r3m1.Items.Add(new ModuleItem(r3m1.Id, null, ModuleItemType.Quiz, null, quizL28.Id, null, "Quiz: Sắp xếp nâng cao (Merge, Quick, Heap & Non-comparison)", 1500, true));
            r3m1.Items.Add(new ModuleItem(r3m1.Id, null, ModuleItemType.Lesson, lesson29.Id, null, null, "Quy hoạch động cơ bản (1D & State Machine)", 2000, true));
            r3m1.Items.Add(new ModuleItem(r3m1.Id, null, ModuleItemType.Quiz, null, quizL29.Id, null, "Quiz: Quy hoạch động cơ bản (1D & State Machine)", 2500, true));
            r3m1.Items.Add(new ModuleItem(r3m1.Id, null, ModuleItemType.Lesson, lesson30.Id, null, null, "Quy hoạch động nâng cao (2D)", 3000, true));
            r3m1.Items.Add(new ModuleItem(r3m1.Id, null, ModuleItemType.Quiz, null, quizL30.Id, null, "Quiz: Quy hoạch động nâng cao (2D)", 3500, true));
            r3m1.Items.Add(new ModuleItem(r3m1.Id, null, ModuleItemType.Lesson, lesson40.Id, null, null, "DP Patterns (Interval, Bitmask, Tree DP)", 4000, true));
            r3m1.Items.Add(new ModuleItem(r3m1.Id, null, ModuleItemType.Quiz, null, quizL40.Id, null, "Quiz: DP Patterns (Interval, Bitmask, Tree DP)", 4500, true));
            r3m1.Items.Add(new ModuleItem(r3m1.Id, null, ModuleItemType.Lesson, lesson31.Id, null, null, "Đường đi ngắn nhất (Shortest Path)", 5000, true));
            r3m1.Items.Add(new ModuleItem(r3m1.Id, null, ModuleItemType.Quiz, null, quizL31.Id, null, "Quiz: Đường đi ngắn nhất (Shortest Path)", 5500, true));
            r3m1.Items.Add(new ModuleItem(r3m1.Id, null, ModuleItemType.Lesson, lesson32.Id, null, null, "Cây khung nhỏ nhất (Minimum Spanning Tree - MST)", 6000, true));
            r3m1.Items.Add(new ModuleItem(r3m1.Id, null, ModuleItemType.Quiz, null, quizL32.Id, null, "Quiz: Cây khung nhỏ nhất (Minimum Spanning Tree - MST)", 6500, true));
            r3m1.Items.Add(new ModuleItem(r3m1.Id, null, ModuleItemType.Lesson, lesson33.Id, null, null, "Union-Find / Disjoint Set Union (DSU)", 7000, true));
            r3m1.Items.Add(new ModuleItem(r3m1.Id, null, ModuleItemType.Quiz, null, quizL33.Id, null, "Quiz: Union-Find / Disjoint Set Union (DSU)", 7500, true));
            var r3m2 = new CourseModule(r3.Id, "Chặng 2 · Cấu trúc nâng cao & tổng ôn", "Trie, Segment Tree, Fenwick, thuật toán chuỗi và chiến lược phỏng vấn", 2000);
            r3.Modules.Add(r3m2);
            r3m2.Items.Add(new ModuleItem(r3m2.Id, null, ModuleItemType.Lesson, lesson34.Id, null, null, "Trie (Prefix Tree)", 1000, true));
            r3m2.Items.Add(new ModuleItem(r3m2.Id, null, ModuleItemType.Quiz, null, quizL34.Id, null, "Quiz: Trie (Prefix Tree)", 1500, true));
            r3m2.Items.Add(new ModuleItem(r3m2.Id, null, ModuleItemType.Lesson, lesson35.Id, null, null, "Segment Tree (Cây đoạn)", 2000, true));
            r3m2.Items.Add(new ModuleItem(r3m2.Id, null, ModuleItemType.Quiz, null, quizL35.Id, null, "Quiz: Segment Tree (Cây đoạn)", 2500, true));
            r3m2.Items.Add(new ModuleItem(r3m2.Id, null, ModuleItemType.Lesson, lesson36.Id, null, null, "Fenwick Tree (Binary Indexed Tree — BIT)", 3000, true));
            r3m2.Items.Add(new ModuleItem(r3m2.Id, null, ModuleItemType.Quiz, null, quizL36.Id, null, "Quiz: Fenwick Tree (Binary Indexed Tree — BIT)", 3500, true));
            r3m2.Items.Add(new ModuleItem(r3m2.Id, null, ModuleItemType.Lesson, lesson37.Id, null, null, "Thuật toán chuỗi nâng cao (KMP / Rabin-Karp)", 4000, true));
            r3m2.Items.Add(new ModuleItem(r3m2.Id, null, ModuleItemType.Quiz, null, quizL37.Id, null, "Quiz: Thuật toán chuỗi nâng cao (KMP / Rabin-Karp)", 4500, true));
            r3m2.Items.Add(new ModuleItem(r3m2.Id, null, ModuleItemType.Lesson, lesson38.Id, null, null, "Advanced Data Structures (LFU / Bloom Filter / Skip List)", 5000, true));
            r3m2.Items.Add(new ModuleItem(r3m2.Id, null, ModuleItemType.Quiz, null, quizL38.Id, null, "Quiz: Advanced Data Structures (LFU / Bloom Filter / Skip List)", 5500, true));
            r3m2.Items.Add(new ModuleItem(r3m2.Id, null, ModuleItemType.Lesson, lesson39.Id, null, null, "Tổng ôn & chiến lược phỏng vấn", 6000, true));
            r3m2.Items.Add(new ModuleItem(r3m2.Id, null, ModuleItemType.Quiz, null, quizL39.Id, null, "Quiz: Tổng ôn & chiến lược phỏng vấn", 6500, true));
            r3.Publish();
            _context.Courses.Add(r3);


        await _context.SaveChangesAsync();
    }
}
}
