using VisualizationDSA.Domain.Engine;

namespace VisualizationDSA.Domain.Strategies
{
    /// <summary>
    /// Stateless quiz bank — serves pre-built quizzes for DSA, OOP, SOLID, Design Patterns.
    /// No database required. Vietnamese explanations.
    /// </summary>
    public class QuizBankStrategy
    {
        private readonly List<StatelessQuizDto> _quizzes;

        public QuizBankStrategy()
        {
            _quizzes = BuildQuizBank();
        }

        public List<StatelessQuizDto> GetAllQuizzes() => _quizzes;

        public StatelessQuizDto? GetQuizById(string id) =>
            _quizzes.FirstOrDefault(q => q.Id == id);

        public List<StatelessQuizDto> GetQuizzesByTopic(string topic) =>
            _quizzes.Where(q => string.Equals(q.Topic, topic, StringComparison.OrdinalIgnoreCase)).ToList();

        public List<string> GetTopics() =>
            _quizzes.Select(q => q.Topic).Distinct().ToList();

        public StatelessQuizDto AddQuiz(StatelessQuizDto quiz)
        {
            if (string.IsNullOrWhiteSpace(quiz.Id))
                quiz.Id = $"custom-{Guid.NewGuid():N}"[..20];
            _quizzes.Add(quiz);
            return quiz;
        }

        public StatelessQuizDto? UpdateQuiz(string id, StatelessQuizDto updatedQuiz)
        {
            var index = _quizzes.FindIndex(q => q.Id == id);
            if (index == -1) return null;
            updatedQuiz.Id = id;
            _quizzes[index] = updatedQuiz;
            return updatedQuiz;
        }

        public bool DeleteQuiz(string id)
        {
            var quiz = GetQuizById(id);
            if (quiz == null) return false;
            _quizzes.Remove(quiz);
            return true;
        }

        public StatelessQuizAttemptResult EvaluateAttempt(StatelessQuizAttemptRequest request)
        {
            var quiz = GetQuizById(request.QuizId);
            if (quiz == null)
                throw new KeyNotFoundException($"Quiz '{request.QuizId}' không tồn tại trong ngân hàng câu hỏi.");

            var questions = quiz.Questions;
            if (request.Answers.Count != questions.Count)
                throw new ArgumentException($"Số câu trả lời ({request.Answers.Count}) không khớp số câu hỏi ({questions.Count}).");

            int score = 0;
            var results = new List<StatelessQuestionResult>();

            for (int i = 0; i < questions.Count; i++)
            {
                var q = questions[i];
                var isCorrect = request.Answers[i] == q.CorrectIndex;
                if (isCorrect) score++;

                results.Add(new StatelessQuestionResult
                {
                    QuestionId = q.Id,
                    IsCorrect = isCorrect,
                    CorrectIndex = q.CorrectIndex,
                    Explanation = q.Explanation
                });
            }

            var passed = score >= (int)Math.Ceiling(questions.Count * 0.7);
            return new StatelessQuizAttemptResult
            {
                Score = score,
                MaxScore = questions.Count,
                Passed = passed,
                XpAwarded = passed ? quiz.XpReward : 0,
                QuestionResults = results
            };
        }

        private static List<StatelessQuizDto> BuildQuizBank()
        {
            return new List<StatelessQuizDto>
            {
                // ── DSA: Sorting ────────────────────────────────────
                new StatelessQuizDto
                {
                    Id = "sorting-fundamentals",
                    Title = "Cơ bản về Sắp xếp",
                    Topic = "sorting",
                    Difficulty = "easy",
                    XpReward = 50,
                    Questions = new List<StatelessQuestionDto>
                    {
                        new() { Id = "s1", Text = "Bubble Sort có độ phức tạp thời gian trung bình là gì?", Options = new() { "O(n)", "O(n log n)", "O(n²)", "O(log n)" }, CorrectIndex = 2, Explanation = "Bubble Sort so sánh từng cặp phần tử liền kề, lặp n vòng × n phần tử → O(n²)." },
                        new() { Id = "s2", Text = "Thuật toán sắp xếp nào KHÔNG phải là so sánh (comparison-based)?", Options = new() { "Merge Sort", "Quick Sort", "Counting Sort", "Heap Sort" }, CorrectIndex = 2, Explanation = "Counting Sort sử dụng mảng đếm tần suất, không dựa trên so sánh giữa các phần tử." },
                        new() { Id = "s3", Text = "Quick Sort chọn pivot để làm gì?", Options = new() { "Tìm phần tử lớn nhất", "Chia mảng thành 2 phần: nhỏ hơn và lớn hơn pivot", "Sắp xếp mảng con bên trái", "Đếm số phần tử" }, CorrectIndex = 1, Explanation = "Pivot là phần tử dùng để phân hoạch (partition) mảng thành 2 nửa: phần tử nhỏ hơn bên trái, lớn hơn bên phải." },
                        new() { Id = "s4", Text = "Merge Sort có tính chất stable không?", Options = new() { "Có — giữ nguyên thứ tự phần tử bằng nhau", "Không — thứ tự phần tử bằng nhau thay đổi", "Tùy thuộc vào input", "Chỉ stable khi mảng đã sắp xếp" }, CorrectIndex = 0, Explanation = "Merge Sort là stable sort — khi hai phần tử có giá trị bằng nhau, phần tử xuất hiện trước trong mảng gốc sẽ xuất hiện trước trong kết quả." },
                        new() { Id = "s5", Text = "Heap Sort sử dụng cấu trúc dữ liệu nào?", Options = new() { "Stack", "Queue", "Binary Heap (Max-Heap)", "Linked List" }, CorrectIndex = 2, Explanation = "Heap Sort xây dựng Max-Heap từ mảng, sau đó liên tục trích xuất phần tử lớn nhất (root) để sắp xếp." },
                    }
                },

                // ── DSA: Graph ──────────────────────────────────────
                new StatelessQuizDto
                {
                    Id = "graph-traversal",
                    Title = "Duyệt Đồ thị BFS & DFS",
                    Topic = "graph",
                    Difficulty = "medium",
                    XpReward = 75,
                    Questions = new List<StatelessQuestionDto>
                    {
                        new() { Id = "g1", Text = "BFS sử dụng cấu trúc dữ liệu nào để duyệt?", Options = new() { "Stack", "Queue", "Priority Queue", "Deque" }, CorrectIndex = 1, Explanation = "BFS (Breadth-First Search) duyệt theo chiều rộng, sử dụng Queue (FIFO) để xử lý các đỉnh theo thứ tự khoảng cách từ nguồn." },
                        new() { Id = "g2", Text = "DFS có thể phát hiện chu trình trong đồ thị có hướng không?", Options = new() { "Có — bằng cách phát hiện back edge", "Không — chỉ BFS mới phát hiện được", "Chỉ trong đồ thị vô hướng", "Chỉ khi đồ thị liên thông" }, CorrectIndex = 0, Explanation = "DFS phát hiện chu trình bằng cách kiểm tra back edge — nếu gặp đỉnh đang trong stack đệ quy (gray), tức là có chu trình." },
                        new() { Id = "g3", Text = "Dijkstra KHÔNG hoạt động đúng khi nào?", Options = new() { "Đồ thị có trọng số dương", "Đồ thị có cạnh trọng số âm", "Đồ thị vô hướng", "Đồ thị thưa" }, CorrectIndex = 1, Explanation = "Dijkstra giả định trọng số cạnh không âm. Với cạnh âm, cần dùng Bellman-Ford hoặc SPFA." },
                        new() { Id = "g4", Text = "Độ phức tạp thời gian của BFS trên đồ thị có V đỉnh và E cạnh?", Options = new() { "O(V)", "O(E)", "O(V + E)", "O(V × E)" }, CorrectIndex = 2, Explanation = "BFS duyệt mỗi đỉnh 1 lần (V) và mỗi cạnh 1 lần (E), tổng cộng O(V + E)." },
                    }
                },

                // ── OOP Concepts ────────────────────────────────────
                new StatelessQuizDto
                {
                    Id = "oop-pillars",
                    Title = "4 Trụ cột OOP",
                    Topic = "oop",
                    Difficulty = "medium",
                    XpReward = 75,
                    Questions = new List<StatelessQuestionDto>
                    {
                        new() { Id = "o1", Text = "Encapsulation (Đóng gói) có nghĩa là gì?", Options = new() { "Kế thừa thuộc tính từ lớp cha", "Ẩn dữ liệu nội bộ, chỉ cho phép truy cập qua phương thức public", "Đa hình — cùng phương thức, hành vi khác nhau", "Tạo đối tượng từ lớp trừu tượng" }, CorrectIndex = 1, Explanation = "Encapsulation che giấu trạng thái nội bộ (private fields) và chỉ cung cấp interface public (getters/setters) để bảo vệ tính toàn vẹn dữ liệu." },
                        new() { Id = "o2", Text = "Polymorphism cho phép điều gì?", Options = new() { "Lớp con truy cập private field của lớp cha", "Cùng một lời gọi phương thức nhưng thực thi khác nhau tùy đối tượng", "Tạo nhiều constructor trong một lớp", "Khai báo biến kiểu dynamic" }, CorrectIndex = 1, Explanation = "Polymorphism (Đa hình) cho phép runtime dispatch — cùng gọi .draw() nhưng Circle vẽ hình tròn, Square vẽ hình vuông thông qua VTable lookup." },
                        new() { Id = "o3", Text = "Từ khóa 'abstract' trong C# dùng để làm gì?", Options = new() { "Khai báo lớp không thể được khởi tạo trực tiếp", "Khai báo lớp final không thể kế thừa", "Khai báo biến static", "Khai báo interface" }, CorrectIndex = 0, Explanation = "Abstract class không thể tạo instance trực tiếp (new AbstractClass() sẽ lỗi). Lớp con bắt buộc implement các abstract method." },
                        new() { Id = "o4", Text = "Lớp 'Circle' kế thừa 'Shape'. Gọi shape.Area() sẽ chạy method của lớp nào?", Options = new() { "Luôn chạy Shape.Area()", "Chạy Circle.Area() nếu Area() là virtual/override", "Lỗi biên dịch", "Tùy thuộc vào compiler" }, CorrectIndex = 1, Explanation = "Nếu Area() được khai báo virtual trong Shape và override trong Circle, VTable dispatch sẽ gọi đúng Circle.Area() tại runtime." },
                    }
                },

                // ── SOLID Principles ────────────────────────────────
                new StatelessQuizDto
                {
                    Id = "solid-principles",
                    Title = "Nguyên lý SOLID",
                    Topic = "solid",
                    Difficulty = "hard",
                    XpReward = 100,
                    Questions = new List<StatelessQuestionDto>
                    {
                        new() { Id = "sol1", Text = "SRP (Single Responsibility Principle) yêu cầu điều gì?", Options = new() { "Mỗi lớp chỉ có một phương thức", "Mỗi lớp chỉ có một lý do để thay đổi", "Mỗi lớp chỉ có một thuộc tính", "Mỗi lớp chỉ kế thừa từ một lớp cha" }, CorrectIndex = 1, Explanation = "SRP: Một lớp chỉ nên có MỘT lý do để thay đổi. UserManager vừa lưu DB, vừa hash password, vừa gửi email → vi phạm SRP vì có 3 trách nhiệm." },
                        new() { Id = "sol2", Text = "OCP (Open/Closed Principle) có nghĩa là gì?", Options = new() { "Lớp phải mở cho kế thừa, đóng cho interface", "Mở cho mở rộng (extension), đóng cho sửa đổi (modification)", "Mở cho tất cả, không đóng gì", "Đóng hoàn toàn, không cho phép thay đổi" }, CorrectIndex = 1, Explanation = "OCP: Module nên MỞ cho việc mở rộng (thêm hình mới như Triangle) nhưng ĐÓNG cho sửa đổi (không sửa code AreaCalculator cũ)." },
                        new() { Id = "sol3", Text = "LSP (Liskov Substitution) bị vi phạm khi nào?", Options = new() { "Lớp con không kế thừa lớp cha", "Lớp con thay đổi hành vi mà lớp cha cam kết (break contract)", "Lớp con thêm phương thức mới", "Lớp con dùng interface thay vì abstract class" }, CorrectIndex = 1, Explanation = "LSP: Lớp con phải thay thế được lớp cha mà không làm hỏng chương trình. Ví dụ: Penguin extends Bird nhưng Penguin.fly() ném exception → vi phạm LSP." },
                        new() { Id = "sol4", Text = "DIP (Dependency Inversion) khuyến khích dùng gì?", Options = new() { "Concrete class trực tiếp", "Interface hoặc abstract class để giảm coupling", "Global variables", "Static methods" }, CorrectIndex = 1, Explanation = "DIP: Module cấp cao không phụ thuộc module cấp thấp. Cả hai phụ thuộc vào abstraction (interface). UserService phụ thuộc IRepository, không phải PostgresRepository cụ thể." },
                        new() { Id = "sol5", Text = "LCOM4 = 3 cho thấy lớp đang vi phạm nguyên lý nào?", Options = new() { "OCP", "SRP — lớp có 3 nhóm trách nhiệm rời rạc", "LSP", "ISP" }, CorrectIndex = 1, Explanation = "LCOM4 (Lack of Cohesion of Methods) đo tính kết dính. LCOM4 = 3 nghĩa là lớp có 3 đồ thị con rời rạc → 3 nhóm trách nhiệm riêng biệt → vi phạm SRP." },
                    }
                },

                // ── Design Patterns ─────────────────────────────────
                new StatelessQuizDto
                {
                    Id = "design-patterns",
                    Title = "Mẫu Thiết kế Kinh điển",
                    Topic = "design-patterns",
                    Difficulty = "hard",
                    XpReward = 100,
                    Questions = new List<StatelessQuestionDto>
                    {
                        new() { Id = "dp1", Text = "Strategy Pattern giải quyết vấn đề gì?", Options = new() { "Tạo đối tượng phức tạp", "Thay đổi thuật toán tại runtime mà không sửa client code", "Quản lý trạng thái đối tượng", "Thông báo sự kiện cho nhiều observer" }, CorrectIndex = 1, Explanation = "Strategy Pattern đóng gói các thuật toán thành các class riêng biệt (ISortStrategy), cho phép client hoán đổi giữa BubbleSort và QuickSort tại runtime." },
                        new() { Id = "dp2", Text = "Observer Pattern hoạt động theo mô hình nào?", Options = new() { "Request-Response", "Publish-Subscribe (1 Subject → N Observers)", "Client-Server", "Peer-to-Peer" }, CorrectIndex = 1, Explanation = "Observer là Pub-Sub: Subject (NewsPublisher) duy trì danh sách IObserver. Khi có tin mới, gọi notify() để thông báo TẤT CẢ subscriber đồng loạt." },
                        new() { Id = "dp3", Text = "Singleton Pattern đảm bảo điều gì?", Options = new() { "Một lớp có nhiều instance", "Chỉ có DUY NHẤT một instance trong toàn bộ ứng dụng", "Mỗi thread có instance riêng", "Instance được tạo mới mỗi lần gọi" }, CorrectIndex = 1, Explanation = "Singleton đảm bảo một lớp chỉ có MỘT instance duy nhất và cung cấp global access point. Ví dụ: DatabaseConnection, Logger." },
                        new() { Id = "dp4", Text = "Factory Method Pattern khác gì với 'new' trực tiếp?", Options = new() { "Không có sự khác biệt", "Factory ủy thác việc tạo đối tượng cho subclass, giảm coupling", "Factory nhanh hơn new", "Factory chỉ dùng cho Singleton" }, CorrectIndex = 1, Explanation = "Factory Method để subclass quyết định tạo đối tượng nào. Client gọi factory.create() thay vì new ConcreteProduct(), giảm phụ thuộc vào implementation cụ thể." },
                    }
                },

                // ── DI / IoC Container ──────────────────────────────
                new StatelessQuizDto
                {
                    Id = "di-container",
                    Title = "Dependency Injection & IoC",
                    Topic = "di",
                    Difficulty = "hard",
                    XpReward = 100,
                    Questions = new List<StatelessQuestionDto>
                    {
                        new() { Id = "di1", Text = "Sự khác biệt giữa Singleton và Transient lifetime trong DI Container?", Options = new() { "Singleton tạo mới mỗi lần, Transient dùng lại", "Singleton dùng lại 1 instance, Transient tạo mới mỗi lần resolve", "Không có sự khác biệt", "Singleton chỉ dùng cho interface" }, CorrectIndex = 1, Explanation = "Singleton: Container tạo 1 lần và cache — mọi lần resolve đều nhận cùng instance. Transient: Mỗi lần resolve tạo instance MỚI hoàn toàn." },
                        new() { Id = "di2", Text = "Cyclic Dependency xảy ra khi nào?", Options = new() { "Service A phụ thuộc B, B phụ thuộc A (vòng lặp)", "Service có quá nhiều dependency", "Service không có dependency nào", "Service sử dụng Singleton lifetime" }, CorrectIndex = 0, Explanation = "Cyclic Dependency: A → B → A tạo vòng lặp vô hạn khi container cố resolve. DFS cycle detection phát hiện back edge trong dependency graph." },
                        new() { Id = "di3", Text = "Inversion of Control (IoC) có nghĩa là gì?", Options = new() { "Code chạy ngược từ dưới lên", "Framework kiểm soát luồng thực thi, không phải developer", "Đảo ngược thứ tự tham số", "Sử dụng reflection để gọi method" }, CorrectIndex = 1, Explanation = "IoC đảo ngược quyền kiểm soát: thay vì class tự tạo dependency (new DbConnection()), Container sẽ TIÊM chúng vào qua constructor injection." },
                        new() { Id = "di4", Text = "Constructor Injection ưu điểm gì so với Service Locator?", Options = new() { "Nhanh hơn", "Rõ ràng dependency, dễ test với mock", "Ít code hơn", "Không cần interface" }, CorrectIndex = 1, Explanation = "Constructor Injection khai báo rõ ràng dependency trong constructor → dễ đọc, dễ unit test (inject mock), không có hidden dependency như Service Locator." },
                    }
                },
            };
        }
    }
}
