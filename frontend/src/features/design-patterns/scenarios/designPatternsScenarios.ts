// ============================================================
// Design Patterns Scenarios — Real-world C# examples with animation metadata
// ============================================================

export type DPAnimationType =
  | 'highlight-class'       // Glow border on a class card
  | 'highlight-member'      // Pulse a specific field/method
  | 'arrow-flow'            // Animated dot/neon traveling along an arrow
  | 'strategy-swap'         // Animate the connection switching targets
  | 'notify-observers'      // Burst of light from Subject to all Observers
  | 'singleton-instance'    // Lock effect on constructor + highlight instance
  | 'none';

export interface DPAnimationTarget {
  className?: string;
  memberName?: string;
  fromClass?: string;
  toClass?: string;
  linkId?: string;
}

export interface DPScenarioStep {
  codeLineIndex: number;
  explanation: string;
  animation: DPAnimationType;
  animationTarget: DPAnimationTarget;
}

export interface DPClassNode {
  id: string;
  className: string;
  type: 'class' | 'interface' | 'abstract';
  members: { name: string; type: 'FIELD' | 'METHOD'; accessModifier: 'PRIVATE' | 'PUBLIC' | 'PROTECTED' }[];
  x: number;
  y: number;
}

export interface DPLink {
  id: string;
  sourceId: string;
  targetId: string;
  type: 'association' | 'dependency' | 'realization' | 'inheritance';
}

export interface DPScenario {
  id: string;
  title: string;
  lessonQuestion: string;
  code: string;
  nodes: DPClassNode[];
  links: DPLink[];
  steps: DPScenarioStep[];
}

export const DESIGN_PATTERN_SCENARIOS: DPScenario[] = [
  {
    id: 'strategy-pattern',
    title: 'Strategy Pattern',
    lessonQuestion: '💡 Làm sao để thay đổi thuật toán ở thời gian chạy (runtime) mà không cần sửa code cũ?',
    code: `// Giao diện chung cho các thuật toán
public interface ISortStrategy {
    void Execute(int[] data);
}

// Thuật toán 1
public class BubbleSort : ISortStrategy {
    public void Execute(int[] data) {
        Console.WriteLine("Sorting using Bubble Sort...");
    }
}

// Thuật toán 2
public class QuickSort : ISortStrategy {
    public void Execute(int[] data) {
        Console.WriteLine("Sorting using Quick Sort...");
    }
}

// Context Class
public class SorterClient {
    private ISortStrategy _strategy;
    
    // Tiêm Strategy thông qua constructor hoặc setter
    public void SetStrategy(ISortStrategy strategy) {
        _strategy = strategy;
    }
    
    public void Sort(int[] data) {
        _strategy.Execute(data);
    }
}`,
    nodes: [
      {
        id: 'SorterClient',
        className: 'SorterClient',
        type: 'class',
        x: 100, y: 50,
        members: [
          { name: '_strategy: ISortStrategy', type: 'FIELD', accessModifier: 'PRIVATE' },
          { name: 'SetStrategy(ISortStrategy)', type: 'METHOD', accessModifier: 'PUBLIC' },
          { name: 'Sort(data)', type: 'METHOD', accessModifier: 'PUBLIC' }
        ]
      },
      {
        id: 'ISortStrategy',
        className: 'ISortStrategy',
        type: 'interface',
        x: 400, y: 50,
        members: [
          { name: 'Execute(data)', type: 'METHOD', accessModifier: 'PUBLIC' }
        ]
      },
      {
        id: 'BubbleSort',
        className: 'BubbleSort',
        type: 'class',
        x: 300, y: 250,
        members: [
          { name: 'Execute(data)', type: 'METHOD', accessModifier: 'PUBLIC' }
        ]
      },
      {
        id: 'QuickSort',
        className: 'QuickSort',
        type: 'class',
        x: 500, y: 250,
        members: [
          { name: 'Execute(data)', type: 'METHOD', accessModifier: 'PUBLIC' }
        ]
      }
    ],
    links: [
      { id: 'client-to-interface', sourceId: 'SorterClient', targetId: 'ISortStrategy', type: 'association' },
      { id: 'bubble-to-interface', sourceId: 'BubbleSort', targetId: 'ISortStrategy', type: 'realization' },
      { id: 'quick-to-interface', sourceId: 'QuickSort', targetId: 'ISortStrategy', type: 'realization' }
    ],
    steps: [
      {
        codeLineIndex: 1,
        explanation: '🛠️ Bước 1: Định nghĩa một <b>Interface chung</b> cho tất cả thuật toán. Điều này giúp các thuật toán có thể hoán đổi cho nhau một cách thống nhất.',
        animation: 'highlight-class',
        animationTarget: { className: 'ISortStrategy' }
      },
      {
        codeLineIndex: 6,
        explanation: '🧱 Bước 2: Cài đặt thuật toán thứ nhất (`BubbleSort`). Nó thực thi cụ thể giao diện `ISortStrategy`.',
        animation: 'arrow-flow',
        animationTarget: { linkId: 'bubble-to-interface' }
      },
      {
        codeLineIndex: 13,
        explanation: '🧱 Bước 3: Cài đặt thuật toán thứ hai (`QuickSort`). Nhờ tuân thủ cùng giao diện, nó có thể được dùng thay thế hoàn hảo cho BubbleSort.',
        animation: 'arrow-flow',
        animationTarget: { linkId: 'quick-to-interface' }
      },
      {
        codeLineIndex: 20,
        explanation: '📦 Bước 4: Khai báo lớp Context (`SorterClient`). Thay vì gắn cứng một thuật toán, nó lưu giữ một tham chiếu đến kiểu `ISortStrategy` (Tính đa hình).',
        animation: 'highlight-class',
        animationTarget: { className: 'SorterClient' }
      },
      {
        codeLineIndex: 24,
        explanation: '🔀 Bước 5: Cung cấp phương thức `SetStrategy` để thay đổi thuật toán một cách linh hoạt tại Runtime.',
        animation: 'highlight-member',
        animationTarget: { className: 'SorterClient', memberName: 'SetStrategy(ISortStrategy)' }
      },
      {
        codeLineIndex: 28,
        explanation: '🚀 Bước 6: Khi thực thi, `SorterClient` uỷ thác công việc cho Strategy hiện tại. Nó không cần biết thuật toán chi tiết diễn ra như thế nào!',
        animation: 'strategy-swap',
        animationTarget: { linkId: 'client-to-interface' }
      }
    ]
  },
  {
    id: 'observer-pattern',
    title: 'Observer Pattern',
    lessonQuestion: '💡 Làm sao để thông báo cho nhiều đối tượng khi một sự kiện xảy ra mà không tạo liên kết cứng (tight-coupling)?',
    code: `// Giao diện dành cho các đối tượng đăng ký lắng nghe
public interface IObserver {
    void Update(string message);
}

// Đối tượng phát thông báo (Subject)
public class NewsPublisher {
    private List<IObserver> _subscribers = new List<IObserver>();
    
    public void Subscribe(IObserver observer) {
        _subscribers.Add(observer);
    }
    
    public void Notify(string message) {
        foreach (var observer in _subscribers) {
            observer.Update(message);
        }
    }
}

// Subscriber A
public class EmailSubscriber : IObserver {
    public void Update(string message) {
        Console.WriteLine("Email received: " + message);
    }
}

// Subscriber B
public class SMSSubscriber : IObserver {
    public void Update(string message) {
        Console.WriteLine("SMS received: " + message);
    }
}`,
    nodes: [
      {
        id: 'NewsPublisher',
        className: 'NewsPublisher',
        type: 'class',
        x: 100, y: 50,
        members: [
          { name: '_subscribers: List<IObserver>', type: 'FIELD', accessModifier: 'PRIVATE' },
          { name: 'Subscribe(IObserver)', type: 'METHOD', accessModifier: 'PUBLIC' },
          { name: 'Notify(message)', type: 'METHOD', accessModifier: 'PUBLIC' }
        ]
      },
      {
        id: 'IObserver',
        className: 'IObserver',
        type: 'interface',
        x: 400, y: 50,
        members: [
          { name: 'Update(message)', type: 'METHOD', accessModifier: 'PUBLIC' }
        ]
      },
      {
        id: 'EmailSubscriber',
        className: 'EmailSubscriber',
        type: 'class',
        x: 300, y: 250,
        members: [
          { name: 'Update(message)', type: 'METHOD', accessModifier: 'PUBLIC' }
        ]
      },
      {
        id: 'SMSSubscriber',
        className: 'SMSSubscriber',
        type: 'class',
        x: 500, y: 250,
        members: [
          { name: 'Update(message)', type: 'METHOD', accessModifier: 'PUBLIC' }
        ]
      }
    ],
    links: [
      { id: 'subject-to-observer', sourceId: 'NewsPublisher', targetId: 'IObserver', type: 'association' },
      { id: 'email-to-observer', sourceId: 'EmailSubscriber', targetId: 'IObserver', type: 'realization' },
      { id: 'sms-to-observer', sourceId: 'SMSSubscriber', targetId: 'IObserver', type: 'realization' }
    ],
    steps: [
      {
        codeLineIndex: 1,
        explanation: '🛠️ Bước 1: Tạo Interface `IObserver` với phương thức `Update()`. Bất kì class nào muốn nhận thông báo đều phải implement interface này.',
        animation: 'highlight-class',
        animationTarget: { className: 'IObserver' }
      },
      {
        codeLineIndex: 6,
        explanation: '📡 Bước 2: Tạo `NewsPublisher` (Subject). Nó sẽ duy trì một danh sách các `IObserver` để phát thông báo.',
        animation: 'highlight-class',
        animationTarget: { className: 'NewsPublisher' }
      },
      {
        codeLineIndex: 9,
        explanation: '✅ Bước 3: Phương thức `Subscribe()` cho phép các Observer tự động đăng ký vào danh sách của Subject tại Runtime.',
        animation: 'highlight-member',
        animationTarget: { className: 'NewsPublisher', memberName: 'Subscribe(IObserver)' }
      },
      {
        codeLineIndex: 21,
        explanation: '📧 Bước 4: Tạo các Subscriber thực tế như `EmailSubscriber` và `SMSSubscriber`. Chúng hiện thực hóa phương thức `Update`.',
        animation: 'arrow-flow',
        animationTarget: { linkId: 'email-to-observer' }
      },
      {
        codeLineIndex: 13,
        explanation: '🎉 Bước 5: Khi có sự kiện xảy ra, Subject duyệt qua danh sách và gọi `observer.Update()`. Lúc này toàn bộ mạng lưới sẽ nhận được tín hiệu tức thời!',
        animation: 'notify-observers',
        animationTarget: { className: 'NewsPublisher' }
      }
    ]
  },
  {
    id: 'singleton-pattern',
    title: 'Singleton Pattern',
    lessonQuestion: '💡 Làm thế nào để đảm bảo một lớp chỉ có ĐÚNG MỘT instance tồn tại trên toàn bộ ứng dụng và có một điểm truy cập toàn cục?',
    code: `public class DatabaseConnection {
    // Lưu trữ instance duy nhất
    private static DatabaseConnection _instance;
    
    // Constructor bắt buộc phải là PRIVATE
    private DatabaseConnection() {
        Console.WriteLine("Connecting to DB...");
    }
    
    // Điểm truy cập toàn cục
    public static DatabaseConnection GetInstance() {
        if (_instance == null) {
            _instance = new DatabaseConnection();
        }
        return _instance;
    }
    
    public void Query(string sql) {
        Console.WriteLine("Executing: " + sql);
    }
}`,
    nodes: [
      {
        id: 'DatabaseConnection',
        className: 'DatabaseConnection',
        type: 'class',
        x: 300, y: 150,
        members: [
          { name: '_instance: DatabaseConnection', type: 'FIELD', accessModifier: 'PRIVATE' },
          { name: 'DatabaseConnection()', type: 'METHOD', accessModifier: 'PRIVATE' },
          { name: 'GetInstance(): DatabaseConnection', type: 'METHOD', accessModifier: 'PUBLIC' },
          { name: 'Query(sql)', type: 'METHOD', accessModifier: 'PUBLIC' }
        ]
      }
    ],
    links: [
      { id: 'singleton-self', sourceId: 'DatabaseConnection', targetId: 'DatabaseConnection', type: 'association' }
    ],
    steps: [
      {
        codeLineIndex: 2,
        explanation: '💾 Bước 1: Khai báo một biến `static` để lưu trữ đối tượng duy nhất (instance) của lớp. Biến này gắn liền với Class, không phải Object.',
        animation: 'highlight-member',
        animationTarget: { className: 'DatabaseConnection', memberName: '_instance: DatabaseConnection' }
      },
      {
        codeLineIndex: 5,
        explanation: '🔒 Bước 2: Chìa khóa của Singleton! Constructor phải được thiết lập là **PRIVATE**. Điều này ngăn cấm các class khác dùng từ khóa `new` để tạo thêm đối tượng.',
        animation: 'highlight-member',
        animationTarget: { className: 'DatabaseConnection', memberName: 'DatabaseConnection()' }
      },
      {
        codeLineIndex: 10,
        explanation: '🔑 Bước 3: Tạo phương thức truy cập toàn cục `GetInstance()`. Nếu instance chưa tồn tại thì khởi tạo, nếu có rồi thì trả về instance cũ.',
        animation: 'highlight-member',
        animationTarget: { className: 'DatabaseConnection', memberName: 'GetInstance(): DatabaseConnection' }
      },
      {
        codeLineIndex: 12,
        explanation: '✨ Bước 4: Mẫu thiết kế Singleton giúp bảo vệ tài nguyên quan trọng như Kết nối Database, đảm bảo không bị rò rỉ bộ nhớ do sinh ra hàng loạt kết nối thừa!',
        animation: 'singleton-instance',
        animationTarget: { className: 'DatabaseConnection' }
      }
    ]
  }
];
