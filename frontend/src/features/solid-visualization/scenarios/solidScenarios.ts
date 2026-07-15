// ============================================================
// SOLID Scenarios — Step-by-step interactive lessons (C#)
// ============================================================

export type SOLIDAnimationType =
  | 'highlight-class'
  | 'highlight-member'
  | 'srp-split'               // Tách God Class thành các lớp nhỏ
  | 'ocp-slide-in'            // Thêm tính năng mới qua interface (không sửa code cũ)
  | 'lsp-laser-fire'          // Lỗi thay thế Liskov – tia laser phá hủy
  | 'lsp-refactor'            // Tái cấu trúc phân cấp đúng LSP
  | 'isp-fat-interface'       // Interface béo – phình to khó chịu
  | 'isp-split-interface'     // Cắt interface béo thành các interface nhỏ
  | 'dip-direct-dependency'   // Phụ thuộc trực tiếp (mũi tên cứng)
  | 'dip-inversion-inserted'  // Đảo ngược phụ thuộc (chèn interface vào giữa)
  | 'compare'                 // So sánh trước/sau
  | 'none';

export interface SOLIDAnimationTarget {
  className?: string;
  memberName?: string;
  fromClass?: string;
  toClass?: string;
}

export interface SOLIDScenarioStep {
  // Dùng codeLineRange thay vì codeLineIndex đơn lẻ
  codeLineRange: [number, number]; // [start, end] – nếu 1 dòng thì [n, n]
  explanation: string;
  animation: SOLIDAnimationType;
  animationTarget: SOLIDAnimationTarget;
  // Xác định bước này áp dụng cho badCodeLines hay goodCodeLines
  appliesTo: 'bad' | 'good';
}

export interface SOLIDScenario {
  id: string;
  order: number;              // Thứ tự học khuyến nghị
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  prerequisiteIds: string[];  // Các bài cần học trước
  title: string;
  description: string;
  lessonQuestion: string;
  keyTakeaways: string[];
  badCodeLines: string[];
  goodCodeLines: string[];
  steps: SOLIDScenarioStep[];
}

export const SOLID_SCENARIOS: SOLIDScenario[] = [
  // ================================================================
  // 🎯 SRP (Single Responsibility Principle)
  // ================================================================
  {
    id: 'SRP',
    order: 1,
    difficultyLevel: 'beginner',
    prerequisiteIds: [],
    title: '🎯 Single Responsibility (SRP)',
    description: 'Mỗi lớp chỉ nên có một lý do duy nhất để thay đổi.',
    lessonQuestion: '💡 Nếu lớp UserManager vừa lưu DB, vừa mã hóa mật khẩu, vừa gửi email – chuyện gì xảy ra khi ta đổi nhà cung cấp email?',
    keyTakeaways: [
      'God Class (lớp ôm đồm) là nguồn gốc của lỗi – thay đổi một thứ ảnh hưởng toàn bộ',
      'Mỗi lớp nên giữ một vai trò duy nhất – phân tách trách nhiệm rõ ràng',
      'Khi có nhiều lý do thay đổi, hãy tách lớp thành những lớp nhỏ hơn với mục đích cụ thể',
    ],
    badCodeLines: [
      'public class UserManager {',               // 0
      '    private string dbConn;',               // 1
      '    private string hasher;',               // 2
      '    private string smtpServer;',           // 3
      '',                                         // 4
      '    public void SaveUser() {',             // 5
      '        // Kết nối DB và lưu user',        // 6
      '    }',                                    // 7
      '',                                         // 8
      '    public void FindUser() {',             // 9
      '        // Truy vấn DB',                   // 10
      '    }',                                    // 11
      '',                                         // 12
      '    public void HashPassword() {',         // 13
      '        // Mã hóa mật khẩu',               // 14
      '    }',                                    // 15
      '',                                         // 16
      '    public void SendWelcomeEmail() {',     // 17
      '        // Kết nối SMTP, gửi email',       // 18
      '    }',                                    // 19
      '}',                                        // 20
    ],
    goodCodeLines: [
      'public class UserRepository {',            // 0
      '    private string dbConn;',               // 1
      '    public void SaveUser() { /* ... */ }', // 2
      '    public void FindUser() { /* ... */ }', // 3
      '}',                                        // 4
      '',                                         // 5
      'public class PasswordHasher {',            // 6
      '    private string hasher;',               // 7
      '    public void HashPassword() { /* ... */ }', // 8
      '}',                                        // 9
      '',                                         // 10
      'public class EmailNotifier {',             // 11
      '    private string smtpServer;',           // 12
      '    public void SendWelcomeEmail() { /* ... */ }', // 13
      '}',                                        // 14
    ],
    steps: [
      {
        codeLineRange: [0, 20],
        explanation: '📦 Đây là lớp `UserManager` – một God Class thực sự. Nó ôm đồm ba trách nhiệm hoàn toàn khác nhau: truy xuất database, mã hóa mật khẩu và gửi email. Khi một trong ba thứ thay đổi, cả lớp này phải sửa theo.',
        animation: 'highlight-class',
        animationTarget: { className: 'UserManager' },
        appliesTo: 'bad',
      },
      {
        codeLineRange: [5, 11],
        explanation: '💾 Trách nhiệm 1: Thao tác với database (`SaveUser`, `FindUser`). Nếu chuyển từ SQL Server sang MongoDB, code này phải viết lại.',
        animation: 'highlight-member',
        animationTarget: { className: 'UserManager', memberName: 'SaveUser' },
        appliesTo: 'bad',
      },
      {
        codeLineRange: [13, 15],
        explanation: '🔒 Trách nhiệm 2: Mã hóa mật khẩu (`HashPassword`). Muốn nâng cấp từ MD5 lên BCrypt? Lại phải sửa `UserManager`.',
        animation: 'highlight-member',
        animationTarget: { className: 'UserManager', memberName: 'HashPassword' },
        appliesTo: 'bad',
      },
      {
        codeLineRange: [17, 19],
        explanation: '📧 Trách nhiệm 3: Gửi email (`SendWelcomeEmail`). Đổi nhà cung cấp email hoặc template? Lại động vào `UserManager`!',
        animation: 'highlight-member',
        animationTarget: { className: 'UserManager', memberName: 'SendWelcomeEmail' },
        appliesTo: 'bad',
      },
      {
        codeLineRange: [0, 20],
        explanation: '⚡ REFACTOR: Kích hoạt phân tách SRP. Chúng ta sẽ chia `UserManager` thành ba lớp riêng biệt, mỗi lớp đảm nhận đúng một trách nhiệm.',
        animation: 'srp-split',
        animationTarget: { className: 'UserManager' },
        appliesTo: 'bad',
      },
      {
        codeLineRange: [0, 4],
        explanation: '📁 `UserRepository` – chỉ lo việc lưu trữ và truy xuất người dùng. Khi thay đổi database, chỉ cần sửa lớp này.',
        animation: 'highlight-class',
        animationTarget: { className: 'UserRepository' },
        appliesTo: 'good',
      },
      {
        codeLineRange: [6, 9],
        explanation: '🔐 `PasswordHasher` – chỉ lo mã hóa. Khi đổi thuật toán hash, chỉ lớp này bị ảnh hưởng.',
        animation: 'highlight-class',
        animationTarget: { className: 'PasswordHasher' },
        appliesTo: 'good',
      },
      {
        codeLineRange: [11, 14],
        explanation: '✉️ `EmailNotifier` – chỉ phụ trách gửi email. Cô lập hoàn toàn logic truyền thông khỏi phần còn lại.',
        animation: 'highlight-class',
        animationTarget: { className: 'EmailNotifier' },
        appliesTo: 'good',
      },
    ],
  },

  // ================================================================
  // 🔌 OCP (Open/Closed Principle)
  // ================================================================
  {
    id: 'OCP',
    order: 2,
    difficultyLevel: 'intermediate',
    prerequisiteIds: ['SRP'],
    title: '🔌 Open/Closed (OCP)',
    description: 'Mở để mở rộng, đóng để sửa đổi.',
    lessonQuestion: '💡 Nếu có thêm loại chiết khấu dành cho sinh viên, ta có phải mổ xẻ lại khối if‑else trong lõi hệ thống?',
    keyTakeaways: [
      'Dùng interface/abstract class để định nghĩa điểm mở rộng',
      'Khi yêu cầu mới xuất hiện, chỉ cần thêm lớp mới – không sửa code cũ',
      'Mẫu Strategy là một cách hiện thực OCP điển hình',
    ],
    badCodeLines: [
      'public class DiscountCalculator {',                                 // 0
      '    public double Calculate(string type, double amount) {',        // 1
      '        if (type == "Regular") return amount * 0.05;',            // 2
      '        else if (type == "VIP") return amount * 0.10;',           // 3
      '        // Khi thêm "Student", phải sửa code ở đây!',             // 4
      '        else if (type == "Student") return amount * 0.15;',       // 5
      '        return 0;',                                                // 6
      '    }',                                                             // 7
      '}',                                                                 // 8
    ],
    goodCodeLines: [
      'public interface IDiscountStrategy {',                              // 0
      '    double Calculate(double amount);',                             // 1
      '}',                                                                 // 2
      '',                                                                  // 3
      'public class RegularDiscount : IDiscountStrategy {',                // 4
      '    public double Calculate(double a) => a * 0.05;',               // 5
      '}',                                                                 // 6
      'public class VIPDiscount : IDiscountStrategy {',                    // 7
      '    public double Calculate(double a) => a * 0.10;',               // 8
      '}',                                                                 // 9
      '// Thêm StudentDiscount cực dễ, không đụng vào code cũ',          // 10
      'public class StudentDiscount : IDiscountStrategy {',                // 11
      '    public double Calculate(double a) => a * 0.15;',               // 12
      '}',                                                                 // 13
      '',                                                                  // 14
      'public class DiscountCalculator {',                                 // 15
      '    // Nhận chiến lược qua tham số, không phụ thuộc kiểu cụ thể', // 16
      '    public double Calculate(IDiscountStrategy strategy, double amount) {', // 17
      '        return strategy.Calculate(amount);',                       // 18
      '    }',                                                             // 19
      '}',                                                                 // 20
    ],
    steps: [
      {
        codeLineRange: [0, 8],
        explanation: '🛠️ `DiscountCalculator` ban đầu rất cứng nhắc. Mỗi loại chiết khấu được xử lý bằng một nhánh if‑else. Khi thêm loại mới, ta buộc phải sửa trực tiếp lớp này – vi phạm OCP.',
        animation: 'highlight-class',
        animationTarget: { className: 'DiscountCalculator' },
        appliesTo: 'bad',
      },
      {
        codeLineRange: [2, 5],
        explanation: '❌ Yêu cầu mới: giảm giá cho học sinh. Lập trình viên phải thêm `else if` vào giữa lõi. Mỗi lần sửa code đang chạy ổn định là một rủi ro.',
        animation: 'highlight-member',
        animationTarget: { className: 'DiscountCalculator', memberName: 'Calculate' },
        appliesTo: 'bad',
      },
      {
        codeLineRange: [0, 2],
        explanation: '✨ Giải pháp: Tạo interface `IDiscountStrategy` – đây là điểm mở rộng. `DiscountCalculator` sẽ chỉ phụ thuộc vào interface này.',
        animation: 'ocp-slide-in',
        animationTarget: { className: 'DiscountCalculator' },
        appliesTo: 'good',
      },
      {
        codeLineRange: [4, 13],
        explanation: '📦 Các chiến lược cụ thể (`RegularDiscount`, `VIPDiscount`, `StudentDiscount`) đóng gói logic của riêng mình. Khi cần thêm loại mới, ta chỉ việc tạo lớp mới implement `IDiscountStrategy`.',
        animation: 'ocp-slide-in',
        animationTarget: { className: 'StudentDiscount' },
        appliesTo: 'good',
      },
      {
        codeLineRange: [15, 20],
        explanation: '🚀 `DiscountCalculator` giờ đây đóng với sửa đổi (không còn if‑else) nhưng mở để mở rộng vô hạn. Thêm bao nhiêu loại chiết khấu cũng được, không sợ bug!',
        animation: 'highlight-member',
        animationTarget: { className: 'DiscountCalculator', memberName: 'Calculate' },
        appliesTo: 'good',
      },
    ],
  },

  // ================================================================
  // 🧩 LSP (Liskov Substitution Principle)
  // ================================================================
  {
    id: 'LSP',
    order: 3,
    difficultyLevel: 'intermediate',
    prerequisiteIds: ['SRP'],
    title: '🧩 Liskov Substitution (LSP)',
    description: 'Lớp con phải có thể thay thế lớp cha mà không làm hỏng chương trình.',
    lessonQuestion: '💡 Đà điểu kế thừa lớp Chim. Chim có phương thức Bay(). Vậy khi ta yêu cầu đà điểu bay, chương trình có “nổ tung” không?',
    keyTakeaways: [
      'Nếu lớp con không thể thực hiện hành vi của lớp cha, đừng ép kế thừa',
      'Ngoại lệ `NotImplementedException` là dấu hiệu vi phạm LSP',
      'Tách hành vi riêng biệt (ví dụ: FlyingBird) để tránh ép buộc lớp con',
    ],
    badCodeLines: [
      'public class Bird {',                                               // 0
      '    public virtual void Fly() {',                                  // 1
      '        Console.WriteLine("Đang bay...");',                       // 2
      '    }',                                                             // 3
      '}',                                                                 // 4
      '',                                                                  // 5
      'public class Eagle : Bird {}',                                      // 6
      '',                                                                  // 7
      'public class Ostrich : Bird {',                                     // 8
      '    public override void Fly() {',                                 // 9
      '        throw new NotImplementedException("Tôi không bay được!");', // 10
      '    }',                                                             // 11
      '}',                                                                 // 12
      '',                                                                  // 13
      'public void MakeBirdFly(Bird bird) {',                             // 14
      '    bird.Fly(); // Sẽ crash nếu là Ostrich',                       // 15
      '}',                                                                 // 16
    ],
    goodCodeLines: [
      'public class Bird {',                                               // 0
      '    public void Eat() { /* ... */ }',                              // 1
      '}',                                                                 // 2
      '',                                                                  // 3
      'public class FlyingBird : Bird {',                                 // 4
      '    public virtual void Fly() {',                                  // 5
      '        Console.WriteLine("Đang cất cánh...");',                  // 6
      '    }',                                                             // 7
      '}',                                                                 // 8
      '',                                                                  // 9
      'public class Eagle : FlyingBird { }',                              // 10
      '',                                                                  // 11
      'public class Ostrich : Bird {',                                    // 12
      '    public void Walk() {',                                         // 13
      '        Console.WriteLine("Chạy bộ trên sa mạc...");',            // 14
      '    }',                                                             // 15
      '}',                                                                 // 16
    ],
    steps: [
      {
        codeLineRange: [0, 4],
        explanation: '🦅 Lớp cha `Bird` định nghĩa `Fly()`. Ngầm định rằng mọi loài chim đều bay được.',
        animation: 'highlight-class',
        animationTarget: { className: 'Bird' },
        appliesTo: 'bad',
      },
      {
        codeLineRange: [8, 12],
        explanation: '🐧 `Ostrich` (đà điểu) kế thừa `Bird` nhưng không thể bay, nên ghi đè `Fly()` và ném ngoại lệ. Đây là vi phạm LSP: lớp con không thể thay thế lớp cha một cách an toàn.',
        animation: 'highlight-class',
        animationTarget: { className: 'Ostrich' },
        appliesTo: 'bad',
      },
      {
        codeLineRange: [14, 16],
        explanation: '🔥 Khi client gọi `MakeBirdFly(bird)`, nếu truyền vào một `Ostrich`, chương trình sẽ crash. Lỗi thay thế Liskov – tia laser phá hủy tính đúng đắn của hệ thống.',
        animation: 'lsp-laser-fire',
        animationTarget: { className: 'Ostrich', memberName: 'Fly' },
        appliesTo: 'bad',
      },
      {
        codeLineRange: [0, 2],
        explanation: '💡 REFACTOR: Tạo lớp `Bird` cơ bản chỉ có hành vi chung (ăn). Tách khả năng bay thành lớp `FlyingBird` riêng.',
        animation: 'lsp-refactor',
        animationTarget: { className: 'FlyingBird' },
        appliesTo: 'good',
      },
      {
        codeLineRange: [4, 10],
        explanation: '🦅 `Eagle` kế thừa `FlyingBird` – hoàn toàn phù hợp. Khi client gọi `Fly()`, mọi thứ an toàn.',
        animation: 'highlight-class',
        animationTarget: { className: 'Eagle' },
        appliesTo: 'good',
      },
      {
        codeLineRange: [12, 16],
        explanation: '🐧 `Ostrich` giờ kế thừa trực tiếp `Bird`, không có `Fly()`. Nó chỉ có `Walk()` – hành vi của riêng mình. Không còn nguy cơ crash, LSP được bảo toàn.',
        animation: 'highlight-class',
        animationTarget: { className: 'Ostrich' },
        appliesTo: 'good',
      },
    ],
  },

  // ================================================================
  // ✂️ ISP (Interface Segregation Principle)
  // ================================================================
  {
    id: 'ISP',
    order: 4,
    difficultyLevel: 'intermediate',
    prerequisiteIds: [],
    title: '✂️ Interface Segregation (ISP)',
    description: 'Nhiều interface nhỏ chuyên biệt tốt hơn một interface lớn.',
    lessonQuestion: '💡 Robot làm việc trong nhà máy có cần phải ăn và ngủ như công nhân con người?',
    keyTakeaways: [
      'Interface béo ép client phụ thuộc vào những phương thức không dùng',
      'Tách interface lớn thành các interface nhỏ theo đúng nhu cầu',
      'Luôn ưu tiên interface đơn nhiệm (Single‑Purpose)',
    ],
    badCodeLines: [
      'public interface IWorker {',                                        // 0
      '    void Work();',                                                 // 1
      '    void Eat();',                                                  // 2
      '    void Sleep();',                                                // 3
      '}',                                                                 // 4
      '',                                                                  // 5
      'public class HumanWorker : IWorker {',                             // 6
      '    public void Work() => Console.WriteLine("Lập trình...");',    // 7
      '    public void Eat()  => Console.WriteLine("Ăn cơm...");',       // 8
      '    public void Sleep() => Console.WriteLine("Ngủ trưa...");',    // 9
      '}',                                                                 // 10
      '',                                                                  // 11
      'public class RobotWorker : IWorker {',                             // 12
      '    public void Work() => Console.WriteLine("Hàn bo mạch...");',  // 13
      '    public void Eat() => throw new NotImplementedException();',   // 14
      '    public void Sleep() => throw new NotImplementedException();', // 15
      '}',                                                                 // 16
    ],
    goodCodeLines: [
      'public interface IWorkable {',                                      // 0
      '    void Work();',                                                 // 1
      '}',                                                                 // 2
      'public interface IEatable {',                                       // 3
      '    void Eat();',                                                  // 4
      '}',                                                                 // 5
      'public interface ISleepable {',                                     // 6
      '    void Sleep();',                                                // 7
      '}',                                                                 // 8
      '',                                                                  // 9
      'public class HumanWorker : IWorkable, IEatable, ISleepable {',    // 10
      '    public void Work() { /* ... */ }',                             // 11
      '    public void Eat()  { /* ... */ }',                             // 12
      '    public void Sleep() { /* ... */ }',                            // 13
      '}',                                                                 // 14
      '',                                                                  // 15
      'public class RobotWorker : IWorkable {',                           // 16
      '    public void Work() => Console.WriteLine("Hàn bo mạch...");',  // 17
      '}',                                                                 // 18
    ],
    steps: [
      {
        codeLineRange: [0, 4],
        explanation: '🔌 `IWorker` là một "interface béo" – nó chứa cả ba hành vi: làm việc, ăn, ngủ. Bất kỳ class nào implement nó đều phải có đủ ba.',
        animation: 'isp-fat-interface',
        animationTarget: { className: 'IWorker' },
        appliesTo: 'bad',
      },
      {
        codeLineRange: [6, 10],
        explanation: '🧑 `HumanWorker` triển khai đầy đủ – hợp lý với con người.',
        animation: 'highlight-class',
        animationTarget: { className: 'HumanWorker' },
        appliesTo: 'bad',
      },
      {
        codeLineRange: [12, 16],
        explanation: '🤖 `RobotWorker` bị ép phải có `Eat()` và `Sleep()` dù robot không cần. Kết quả là code ném lỗi – vừa thừa, vừa nguy hiểm.',
        animation: 'highlight-class',
        animationTarget: { className: 'RobotWorker' },
        appliesTo: 'bad',
      },
      {
        codeLineRange: [0, 8],
        explanation: '✂️ REFACTOR: Cắt `IWorker` thành ba interface nhỏ, chuyên biệt: `IWorkable`, `IEatable`, `ISleepable`. Mỗi interface chỉ chứa đúng một hành vi.',
        animation: 'isp-split-interface',
        animationTarget: { className: 'IWorker' },
        appliesTo: 'good',
      },
      {
        codeLineRange: [10, 14],
        explanation: '🧑 `HumanWorker` giờ implement cả ba interface nhỏ – vẫn đầy đủ chức năng.',
        animation: 'highlight-class',
        animationTarget: { className: 'HumanWorker' },
        appliesTo: 'good',
      },
      {
        codeLineRange: [16, 18],
        explanation: '🤖 `RobotWorker` chỉ cần `IWorkable`. Không còn phương thức thừa, code sạch và an toàn tuyệt đối!',
        animation: 'highlight-class',
        animationTarget: { className: 'RobotWorker' },
        appliesTo: 'good',
      },
    ],
  },

  // ================================================================
  // 🔀 DIP (Dependency Inversion Principle)
  // ================================================================
  {
    id: 'DIP',
    order: 5,
    difficultyLevel: 'advanced',
    prerequisiteIds: ['OCP'],
    title: '🔀 Dependency Inversion (DIP)',
    description: 'Module cấp cao không nên phụ thuộc vào module cấp thấp. Cả hai nên phụ thuộc vào abstraction.',
    lessonQuestion: '💡 Lớp Car tự khởi tạo GasolineEngine bên trong. Muốn lắp ElectricEngine, ta có phải “mổ bụng” lớp Car không?',
    keyTakeaways: [
      'Phụ thuộc trực tiếp vào class cụ thể tạo ra Tight Coupling',
      'Đảo ngược bằng cách cho cả hai cùng phụ thuộc vào interface',
      'Dependency Injection (DI) là cách hiện thực DIP phổ biến nhất',
    ],
    badCodeLines: [
      'public class GasolineEngine {',                                     // 0
      '    public void Start() => Console.WriteLine("Động cơ xăng nổ máy");', // 1
      '}',                                                                 // 2
      '',                                                                  // 3
      'public class Car {',                                                // 4
      '    private GasolineEngine engine;',                                // 5
      '',                                                                  // 6
      '    public Car() {',                                                // 7
      '        this.engine = new GasolineEngine(); // Bó cứng vào xăng',   // 8
      '    }',                                                             // 9
      '',                                                                  // 10
      '    public void Drive() {',                                         // 11
      '        this.engine.Start();',                                      // 12
      '    }',                                                             // 13
      '}',                                                                 // 14
    ],
    goodCodeLines: [
      'public interface IEngine {',                                        // 0
      '    void Start();',                                                // 1
      '}',                                                                 // 2
      '',                                                                  // 3
      'public class GasolineEngine : IEngine {',                           // 4
      '    public void Start() { /* ... */ }',                             // 5
      '}',                                                                 // 6
      '',                                                                  // 7
      'public class ElectricEngine : IEngine {',                           // 8
      '    public void Start() => Console.WriteLine("Động cơ điện khởi động");', // 9
      '}',                                                                 // 10
      '',                                                                  // 11
      'public class Car {',                                                // 12
      '    private IEngine engine; // Phụ thuộc abstraction',             // 13
      '',                                                                  // 14
      '    public Car(IEngine engine) { // Injection',                     // 15
      '        this.engine = engine;',                                     // 16
      '    }',                                                             // 17
      '',                                                                  // 18
      '    public void Drive() {',                                         // 19
      '        this.engine.Start();',                                      // 20
      '    }',                                                             // 21
      '}',                                                                 // 22
    ],
    steps: [
      {
        codeLineRange: [4, 14],
        explanation: '🚗 Lớp `Car` (module cấp cao) đang trực tiếp phụ thuộc vào `GasolineEngine` (module cấp thấp). Nó tự khởi tạo `new GasolineEngine()` bên trong constructor.',
        animation: 'highlight-class',
        animationTarget: { className: 'Car' },
        appliesTo: 'bad',
      },
      {
        codeLineRange: [5, 8],
        explanation: '❌ Sự phụ thuộc cứng này khiến `Car` bị bó chặt với động cơ xăng. Muốn dùng động cơ điện, phải sửa code lớp `Car` – vi phạm DIP.',
        animation: 'dip-direct-dependency',
        animationTarget: { fromClass: 'Car', toClass: 'GasolineEngine' },
        appliesTo: 'bad',
      },
      {
        codeLineRange: [0, 2],
        explanation: '⚙️ Giải pháp: Tạo interface `IEngine` – một abstraction. Cả `Car` và các loại động cơ đều sẽ phụ thuộc vào interface này.',
        animation: 'dip-inversion-inserted',
        animationTarget: { className: 'IEngine' },
        appliesTo: 'good',
      },
      {
        codeLineRange: [4, 10],
        explanation: '🔌 `GasolineEngine` và `ElectricEngine` đều implement `IEngine`. Chúng là các chi tiết (detail) phụ thuộc vào abstraction.',
        animation: 'highlight-class',
        animationTarget: { className: 'ElectricEngine' },
        appliesTo: 'good',
      },
      {
        codeLineRange: [12, 22],
        explanation: '🔀 `Car` giờ chỉ phụ thuộc vào `IEngine`. Constructor nhận một `IEngine` từ bên ngoài (Dependency Injection). Có thể dễ dàng “cắm” bất kỳ loại động cơ nào mà không cần sửa `Car`.',
        animation: 'dip-inversion-inserted',
        animationTarget: { className: 'Car' },
        appliesTo: 'good',
      },
    ],
  },
];
