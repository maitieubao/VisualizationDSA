import { ref } from 'vue';
import { defineStore } from 'pinia';

export interface TourAction {
  type: 'click' | 'type' | 'wait';
  targetSelector?: string;
  payload?: string;
  delayMs?: number;
}

export interface TourStep {
  title: string;
  description: string;
  highlightSelector?: string;
  beforeAction?: () => void;
  avatarState?: 'GREETING' | 'EXPLAINING' | 'SIMULATING' | 'SUCCESS';
  actionScript?: TourAction[];
}


const switchToTab1 = () => {
  if (typeof document === 'undefined') return;
  const tabBtn = document.querySelector('[data-tour-id="algo-tab-switch"] button:nth-child(1)') as HTMLElement;
  if (tabBtn) tabBtn.click();
};

const switchToTab2 = () => {
  if (typeof document === 'undefined') return;
  const tabBtn = document.querySelector('[data-tour-id="algo-tab-switch"] button:nth-child(2)') as HTMLElement;
  if (tabBtn) tabBtn.click();
};


const switchToTabCode = () => {
  if (typeof document === 'undefined') return;
  const tabBtn = document.querySelectorAll('.sorting-detail-panel button')[1] as HTMLElement;
  if (tabBtn) tabBtn.click();
};

const switchToSortingAndControls = () => {
  switchToTab1();
  if (typeof document === 'undefined') return;
  const tabBtn = document.querySelectorAll('.sorting-detail-panel button')[0] as HTMLElement;
  if (tabBtn) tabBtn.click();
};






const PAGE_TOURS: Record<string, TourStep[]> = {
  '/sorting': [
    {
      title: '1. Bộ chuyển đổi Sandbox / Bài học 🔄',
      description: 'Chuyển đổi linh hoạt giữa trang Bài học lý thuyết (Độ phức tạp Big-O, mã giả) và Sân chơi mô phỏng tương tác 60 FPS.',
      highlightSelector: '[data-tour-id="algo-tab-switch"]',
      beforeAction: switchToTab1,
      avatarState: 'GREETING',
    },
    {
      title: '2. Thanh cấu hình dữ liệu 📝',
      description: 'Nhập mảng số nguyên tùy ý của bạn (Cách nhau bằng dấu phẩy, tối đa 15 số) hoặc nhấn Random để hệ thống tự sinh mảng.',
      highlightSelector: '[data-tour-id="vcr-input-bar"]',
      beforeAction: switchToSortingAndControls,
      avatarState: 'EXPLAINING',
      actionScript: [
        { type: 'click', targetSelector: '[data-tour-id="vcr-input-bar"]' }
      ]
    },
    {
      title: '3. Sinh mảng ngẫu nhiên 🎲',
      description: 'Nhấn nút Random trên thanh dữ liệu để sinh nhanh một mảng số ngẫu nhiên nằm trong giới hạn an toàn của thuật toán.',
      highlightSelector: '[data-tour-id="vcr-input-bar"] button',
      beforeAction: switchToSortingAndControls,
      avatarState: 'SIMULATING',
    },
    {
      title: '4. Phát hoạt hình (Play) ▶️',
      description: 'Nhấn Play (hoặc phím Space) để chạy hoạt cảnh mô phỏng. Các thanh đồ họa trên Canvas sẽ dịch chuyển Lerp mượt mà.',
      highlightSelector: '[data-tour-id="vcr-play-btn"]',
      beforeAction: switchToSortingAndControls,
      avatarState: 'SIMULATING',
    },
    {
      title: '5. Tạm dừng mô phỏng ⏸️',
      description: 'Khi thuật toán đang chạy, bạn có thể nhấn nút Pause bất kỳ lúc nào để đóng băng trạng thái của mảng và nghiên cứu sâu hơn.',
      highlightSelector: '[data-tour-id="vcr-play-btn"]',
      beforeAction: switchToSortingAndControls,
      avatarState: 'EXPLAINING',
    },
    {
      title: '6. Tiến từng bước (Step Forward) ⏭️',
      description: 'Khi đang Tạm dừng, sử dụng nút tiến bước (hoặc mũi tên phải →) để thực thi chính xác 1 bước (1 frame chuyển đổi) tiếp theo.',
      highlightSelector: '[data-tour-id="vcr-step-debug"]',
      beforeAction: switchToSortingAndControls,
      avatarState: 'SIMULATING',
    },
    {
      title: '7. Lùi từng bước (Step Backward) ⏮️',
      description: 'Nhấn nút lùi bước (hoặc mũi tên trái ←) để khôi phục trạng thái mảng về 1 bước trước đó, giúp bạn phân tích kỹ lỗi logic.',
      highlightSelector: '[data-tour-id="vcr-step-debug"]',
      beforeAction: switchToSortingAndControls,
      avatarState: 'SIMULATING',
    },
    {
      title: '8. Tùy chọn tốc độ mô phỏng ⏱️',
      description: 'Điều chỉnh tốc độ chạy hoạt ảnh từ rất chậm (0.25x) để soi kỹ hoán vị, cho đến cực nhanh (4x) để hoàn thành sớm mô phỏng.',
      highlightSelector: '[data-tour-id="vcr-speed-select"]',
      beforeAction: switchToSortingAndControls,
      avatarState: 'EXPLAINING',
    },
    {
      title: '9. Bảng theo dõi biến (Trace Watcher) 📊',
      description: 'Khung hiển thị bảng biến trạng thái (Biến vòng lặp i, j, con trỏ Low, High) giúp bạn hiểu rõ các biến FSM chạy dưới nền.',
      highlightSelector: '[data-tour-id="trace-watcher-panel"]',
      beforeAction: switchToSortingAndControls,
      avatarState: 'EXPLAINING',
    },
    {
      title: '10. Giao diện Code Sandbox 💻',
      description: 'Chuyển sang tab Code Sandbox để tự do gõ thuật toán JavaScript của riêng bạn. Code sẽ được tự động biên dịch và vẽ thành biểu đồ 60 FPS!',
      highlightSelector: '[data-tour-id="pseudocode-syncer"]',
      beforeAction: switchToTabCode,
      avatarState: 'EXPLAINING',
    },
    {
      title: '11. Bài học Lý thuyết chuyên sâu 📚',
      description: 'Chuyển sang tab này để truy cập các bài học lý thuyết trực quan chuyên sâu về Độ phức tạp Big-O và mã giả chuẩn hóa.',
      highlightSelector: '[data-tour-id="algo-theory-pane"]',
      beforeAction: switchToTab2,
      avatarState: 'SUCCESS',
    },
    {
      title: '12. Hoàn thành hướng dẫn! 🎉',
      description: 'Bạn đã nắm vững toàn bộ thanh công cụ sắp xếp. Hãy tự tay nhập mảng và khám phá các giải thuật khác nhau nhé!',
      avatarState: 'SUCCESS',
    }
  ],
  '/compare': [
    {
      title: '1. So sánh hiệu năng thuật toán 🆚',
      description: 'Chào mừng bạn đến với phân hệ So sánh hiệu năng. Tại đây bạn có thể đối sánh trực quan 2 giải thuật khác nhau chạy song hành.',
      highlightSelector: '[data-tour-id="compare-selectors"]',
      avatarState: 'GREETING',
    },
    {
      title: '2. Chọn thuật toán thứ nhất 👈',
      description: 'Lựa chọn thuật toán sắp xếp ở cột bên trái (Ví dụ: Quick Sort để so sánh tốc độ vượt trội với các giải thuật khác).',
      highlightSelector: '[data-tour-id="compare-left-algo"]',
      avatarState: 'EXPLAINING',
    },
    {
      title: '3. Chọn thuật toán thứ hai 👉',
      description: 'Lựa chọn thuật toán sắp xếp ở cột bên phải (Ví dụ: Bubble Sort để chứng kiến sự chậm trễ khi số lượng phần tử tăng lên).',
      highlightSelector: '[data-tour-id="compare-right-algo"]',
      avatarState: 'EXPLAINING',
    },
    {
      title: '4. Mảng dữ liệu đối sánh 📊',
      description: 'Hai thuật toán sẽ chạy trên cùng một mảng dữ liệu ngẫu nhiên đầu vào để đảm bảo tính công bằng tuyệt đối khi so sánh.',
      highlightSelector: '[data-tour-id="compare-input-array"]',
      avatarState: 'EXPLAINING',
    },
    {
      title: '5. Sinh dữ liệu ngẫu nhiên 🎲',
      description: 'Nhấn nút sinh ngẫu nhiên để tái thiết lập mảng dữ liệu thử nghiệm, thay đổi kích thước mảng nếu cần đo lường tải nặng.',
      highlightSelector: '[data-tour-id="compare-random-btn"]',
      avatarState: 'SIMULATING',
    },
    {
      title: '6. Không gian vẽ bên trái 🎨',
      description: 'Khung Canvas bên trái hiển thị hoạt ảnh các thanh dữ liệu của thuật toán thứ nhất dịch chuyển và đổi màu sinh động.',
      highlightSelector: '[data-tour-id="compare-left-canvas"]',
      avatarState: 'EXPLAINING',
    },
    {
      title: '7. Không gian vẽ bên phải 🎨',
      description: 'Khung Canvas bên phải hiển thị hoạt ảnh các thanh dữ liệu của thuật toán thứ hai để bạn so sánh trực quan tốc độ.',
      highlightSelector: '[data-tour-id="compare-right-canvas"]',
      avatarState: 'EXPLAINING',
    },
    {
      title: '8. Khởi động chạy song hành ▶️',
      description: 'Nhấn Play để kích hoạt đồng thời cả hai thuật toán chạy trên cùng một trục thời gian đồng bộ 60 FPS.',
      highlightSelector: '[data-tour-id="compare-play-btn"]',
      avatarState: 'SIMULATING',
    },
    {
      title: '9. Xem so sánh tốc độ thực tế ⚡',
      description: 'Quan sát sự chênh lệch rõ rệt về tốc độ hoàn thành và cách thức phân hoạch hay hoán vị của các thuật toán.',
      highlightSelector: '[data-tour-id="compare-canvas-split"]',
      avatarState: 'EXPLAINING',
    },
    {
      title: '10. Số lần so sánh (Comparisons) 🔢',
      description: 'Thống kê tổng số phép so sánh phần tử thực hiện trong suốt quá trình chạy. Thuật toán tốt sẽ giảm thiểu số lần này.',
      highlightSelector: '[data-tour-id="compare-metrics-comparisons"]',
      avatarState: 'EXPLAINING',
    },
    {
      title: '11. Số lần hoán vị (Swaps) 🔄',
      description: 'Thống kê tổng số lần hoán đổi vị trí các phần tử trên bộ nhớ. Số lần hoán vị ảnh hưởng trực tiếp đến tốc độ ghi bộ nhớ.',
      highlightSelector: '[data-tour-id="compare-metrics-swaps"]',
      avatarState: 'EXPLAINING',
    },
    {
      title: '12. Kết luận hiệu năng Big-O 🏆',
      description: 'Bảng tổng hợp chỉ số hiệu năng sẽ chỉ rõ thuật toán nào tối ưu hơn và đưa ra kết luận Big-O thực chứng tương ứng.',
      highlightSelector: '[data-tour-id="compare-metrics-board"]',
      avatarState: 'SUCCESS',
    }
  ],
  '/concurrency': [
    {
      title: '1. Trực quan hóa Đa luồng 🧵',
      description: 'Chào mừng bạn đến với phân hệ Trực quan hóa Đa luồng. Tại đây chúng ta sẽ khám phá cách hệ điều hành chạy các luồng song song.',
      highlightSelector: '[data-tour-id="concurrency-toolbar"]',
      avatarState: 'GREETING',
    },
    {
      title: '2. Chọn Kịch bản mô phỏng 🎬',
      description: 'Lựa chọn kịch bản lý thuyết đa luồng kinh điển như: Race Condition (Tranh chấp), Deadlock (Khóa chết), hay Producer-Consumer.',
      highlightSelector: '[data-tour-id="concurrency-scenario-select"]',
      avatarState: 'EXPLAINING',
    },
    {
      title: '3. Đường ray luồng (Thread Rails) 🛤️',
      description: 'Khung Canvas chính hiển thị các dòng neon chuyển động tượng trưng cho tiến trình chạy của từng luồng (Thread A, Thread B).',
      highlightSelector: '[data-tour-id="thread-rails-canvas"]',
      avatarState: 'EXPLAINING',
    },
    {
      title: '4. Đồng bộ hóa bằng Mutex 🔒',
      description: 'Bật/Tắt nút khóa Mutex. Khi bật, cơ chế khóa độc quyền sẽ ngăn không cho 2 luồng cùng ghi vào một tài nguyên dùng chung.',
      highlightSelector: '[data-tour-id="concurrency-mutex-toggle"]',
      avatarState: 'SIMULATING',
    },
    {
      title: '5. Xem mã giả đa luồng 💻',
      description: 'Theo dõi mã nguồn C# gỡ lỗi của các tác vụ đa luồng, nơi hiển thị các từ khóa quan trọng như lock, lockTaken, Monitor.',
      highlightSelector: '[data-tour-id="concurrency-pseudocode"]',
      avatarState: 'EXPLAINING',
    },
    {
      title: '6. Bộ điều khiển VCR Playback 🕹️',
      description: 'Thanh điều khiển giúp bạn dừng, phát hoặc tua nhanh/chậm tiến trình chạy của các luồng để phân tích sự xung đột.',
      highlightSelector: '[data-tour-id="concurrency-playback-bar"]',
      avatarState: 'EXPLAINING',
    },
    {
      title: '7. Phát hoạt cảnh đa luồng ▶️',
      description: 'Nhấn nút Play để bắt đầu chạy mô phỏng. Các luồng sẽ bắt đầu di chuyển dọc theo đường ray Canvas.',
      highlightSelector: '[data-tour-id="concurrency-play-btn"]',
      avatarState: 'SIMULATING',
    },
    {
      title: '8. Chạy từng bước nhỏ ⏭️',
      description: 'Khi tạm dừng, click nút Step Forward để chuyển tiếp luồng thêm một khoảng thời gian micro-giây cực nhỏ.',
      highlightSelector: '[data-tour-id="concurrency-step-forward"]',
      avatarState: 'SIMULATING',
    },
    {
      title: '9. Thanh trượt Timeline luồng 🎚️',
      description: 'Kéo thanh trượt để quay ngược hoặc tua nhanh toàn bộ lịch sử tranh chấp tài nguyên của hai luồng.',
      highlightSelector: '[data-tour-id="concurrency-slider"]',
      avatarState: 'EXPLAINING',
    },
    {
      title: '10. Tùy chỉnh tốc độ thực thi ⏱️',
      description: 'Thay đổi tốc độ phát hoạt ảnh đa luồng để dễ dàng chụp lại khoảnh khắc luồng A chuẩn bị cướp tài nguyên của luồng B.',
      highlightSelector: '[data-tour-id="concurrency-speed-select"]',
      avatarState: 'EXPLAINING',
    },
    {
      title: '11. Phân tích Tranh chấp (Race Condition) ⚠️',
      description: 'Khi Mutex tắt, hãy quan sát cách shared variable bị ghi đè lung tung do hai luồng thay đổi giá trị bất tuần tự.',
      highlightSelector: '[data-tour-id="thread-rails-canvas"]',
      avatarState: 'EXPLAINING',
    },
    {
      title: '12. Xử lý Deadlock an toàn 🛡️',
      description: 'Học cách thiết kế hệ thống giải tỏa bế tắc khi luồng A giữ khóa 1 đợi khóa 2 và luồng B giữ khóa 2 đợi khóa 1.',
      highlightSelector: '[data-tour-id="concurrency-mutex-toggle"]',
      avatarState: 'SUCCESS',
    }
  ],
  '/oop': [
    {
      title: '1. Trực quan hóa Hướng đối tượng 📐',
      description: 'Chào mừng bạn đến với phân hệ OOP. Tại đây chúng ta sẽ bóc tách sâu cách các lớp kế thừa hoạt động trong bộ nhớ RAM.',
      highlightSelector: '.oop-class-hierarchy',
      avatarState: 'GREETING',
    },
    {
      title: '2. Sơ đồ kế thừa Shape 🔺',
      description: 'Xem cấu trúc phân cấp lớp: Lớp cha trừu tượng Shape, và các lớp con kế thừa Circle, Rectangle.',
      highlightSelector: '.oop-class-hierarchy',
      avatarState: 'EXPLAINING',
    },
    {
      title: '3. Bản đồ Vùng nhớ Stack 🥞',
      description: 'Ngăn xếp lưu trữ các con trỏ biến tham chiếu cục bộ. Con trỏ này sẽ chứa địa chỉ vùng nhớ trỏ sang Heap.',
      highlightSelector: '[data-tour-id="oop-memory-canvas"]',
      avatarState: 'EXPLAINING',
    },
    {
      title: '4. Bản đồ Vùng nhớ Heap 🌳',
      description: 'Vùng nhớ chứa toàn bộ dữ liệu thuộc tính của các đối tượng được khởi tạo động, có kích thước biến động.',
      highlightSelector: '[data-tour-id="oop-memory-canvas"]',
      avatarState: 'EXPLAINING',
    },
    {
      title: '5. Cấp phát đối tượng động ⚙️',
      description: 'Xem cách toán tử `new` hoạt động: cấp phát một khối bytes trống trên Heap và gán địa chỉ Hexa cho Stack.',
      highlightSelector: '[data-tour-id="oop-memory-canvas"]',
      avatarState: 'SIMULATING',
    },
    {
      title: '6. Đóng gói (Encapsulation) 🔒',
      description: 'Cơ chế che giấu thông tin. Các thuộc tính private được khóa kín để tránh bên ngoài sửa đổi trực tiếp dữ liệu.',
      highlightSelector: '.oop-encapsulation-locks',
      avatarState: 'EXPLAINING',
    },
    {
      title: '7. Khóa bảo vệ Private/Public 🔑',
      description: 'Chỉ các phương thức Public mới được quyền truy xuất các thuộc tính Private thông qua các getter/setter an toàn.',
      highlightSelector: '.oop-encapsulation-locks',
      avatarState: 'EXPLAINING',
    },
    {
      title: '8. Bảng hàm ảo Virtual Table 📋',
      description: 'Virtual Table (VTable) là một mảng các con trỏ hàm ảo được trình biên dịch tự động tạo ra để phục vụ đa hình.',
      highlightSelector: '[data-tour-id="vtable-router"]',
      avatarState: 'EXPLAINING',
    },
    {
      title: '9. Con trỏ bảng ảo VPtr 🔗',
      description: 'Mỗi đối tượng của lớp có hàm ảo sẽ chứa một con trỏ ngầm định VPtr trỏ thẳng tới bảng VTable của lớp đó.',
      highlightSelector: '[data-tour-id="vtable-router"]',
      avatarState: 'EXPLAINING',
    },
    {
      title: '10. Kích hoạt hàm Đa hình ▶️',
      description: 'Nhấn nút gọi hàm để gửi yêu cầu thực thi đa hình, theo dõi cách hệ thống truy tìm địa chỉ hàm thực tế.',
      highlightSelector: '.oop-exec-controls',
      avatarState: 'SIMULATING',
    },
    {
      title: '11. Liên kết động Bezier Laser ⚡',
      description: 'Một tia laser Bezier sáng rực bắn từ Stack sang Heap, tra cứu VTable rồi chuyển hướng đến địa chỉ mã máy của lớp con.',
      highlightSelector: '[data-tour-id="oop-memory-canvas"]',
      avatarState: 'SIMULATING',
    },
    {
      title: '12. Tổng kết quản lý bộ nhớ OOP 🏆',
      description: 'Bạn đã hoàn tất tìm hiểu cơ chế cấp phát bộ nhớ của OOP. Đây là nền tảng cốt lõi của các ngôn ngữ C++ và C#.',
      avatarState: 'SUCCESS',
    }
  ],
  '/solid': [
    {
      title: '1. Trực quan hóa Nguyên lý SOLID 🏗️',
      description: 'Chào mừng bạn đến với phân hệ SOLID. Chúng ta sẽ xem cách viết mã nguồn dễ bảo trì và tránh thối rữa thiết kế.',
      highlightSelector: '.solid-lesson-tabs',
      avatarState: 'GREETING',
    },
    {
      title: '2. Nguyên lý Đơn nhiệm (SRP) 🎯',
      description: 'Single Responsibility Principle: Một lớp chỉ nên có một lý do duy nhất để thay đổi để tránh quá tải chức năng.',
      highlightSelector: '[data-tour-id="srp-tab"]',
      avatarState: 'EXPLAINING',
    },
    {
      title: '3. Độ kết dính SRP LCOM4 📊',
      description: 'Đo lường tính đơn nhiệm bằng đồ thị kết dính LCOM4. Đồ thị bị phân rã thành nhiều cụm độc lập nghĩa là vi phạm SRP.',
      highlightSelector: '[data-tour-id="srp-lcom4-graph"]',
      avatarState: 'EXPLAINING',
    },
    {
      title: '4. Nguyên lý Đóng/Mở (OCP) 🚪',
      description: 'Open-Closed Principle: Dễ dàng mở rộng tính năng mới nhưng hạn chế tối đa việc sửa đổi mã nguồn lõi hiện có.',
      highlightSelector: '[data-tour-id="ocp-tab"]',
      avatarState: 'EXPLAINING',
    },
    {
      title: '5. Nguyên lý Thế mạng Liskov (LSP) 👥',
      description: 'Liskov Substitution Principle: Các đối tượng của lớp con phải thay thế được lớp cha mà không làm thay đổi tính đúng đắn.',
      highlightSelector: '[data-tour-id="lsp-tab"]',
      avatarState: 'EXPLAINING',
    },
    {
      title: '6. Thử nghiệm Đà điểu bay vỡ kính 💥',
      description: 'Khi đưa lớp Đà Điểu (kế thừa lớp Chim nhưng không biết bay) gọi hàm fly(), kính mô phỏng sẽ rạn nứt sinh động.',
      highlightSelector: '[data-tour-id="lsp-glass-sandbox"]',
      avatarState: 'SIMULATING',
    },
    {
      title: '7. Giải quyết vi phạm LSP 🛠️',
      description: 'Nhấn nút tái cấu trúc thiết kế, chia tách lớp Chim thành ChimBiếtBay và ChimKhôngBay để sửa lỗi thế mạng Liskov.',
      highlightSelector: '.solid-action-controls',
      avatarState: 'SIMULATING',
    },
    {
      title: '8. Nguyên lý Phân tách Giao diện (ISP) ✂️',
      description: 'Interface Segregation Principle: Thay vì một giao diện béo chứa tất cả hàm, hãy chia nhỏ thành nhiều giao diện chuyên biệt.',
      highlightSelector: '[data-tour-id="isp-tab"]',
      avatarState: 'EXPLAINING',
    },
    {
      title: '9. Nguyên lý Đảo ngược Phụ thuộc (DIP) 🔄',
      description: 'Dependency Inversion Principle: Các module cấp cao không nên phụ thuộc vào module cấp thấp, cả hai nên phụ thuộc vào Abstraction.',
      highlightSelector: '[data-tour-id="dip-tab"]',
      avatarState: 'EXPLAINING',
    },
    {
      title: '10. Neon Flow đảo ngược dòng chảy 🌌',
      description: 'Quan sát các hạt neon chạy ngược từ cả module cấp cao và cấp thấp hội tụ về một Interface trung gian.',
      highlightSelector: '.solid-sandbox-canvas',
      avatarState: 'EXPLAINING',
    },
    {
      title: '11. So sánh Vi phạm vs Tuân thủ ⚖️',
      description: 'Đánh giá cấu trúc mã nguồn trước và sau khi áp dụng SOLID qua các nút bật tắt so sánh trực quan.',
      highlightSelector: '.solid-action-controls',
      avatarState: 'EXPLAINING',
    },
    {
      title: '12. Tổng kết lợi ích thiết kế hệ thống 🏆',
      description: 'Chúc mừng bạn! Việc áp dụng SOLID sẽ giúp dự án của bạn phát triển quy mô lớn mà không bị chồng chéo mã nguồn.',
      avatarState: 'SUCCESS',
    }
  ],
  '/state': [
    {
      title: '1. Giám sát Trạng thái & Đệ quy 🔍',
      description: 'Chào mừng bạn đến với State Inspector. Tại đây chúng ta sẽ soi rõ cách đệ quy phân bổ tài nguyên bộ nhớ Stack.',
      highlightSelector: '[data-tour-id="call-stack-3d-panel"]',
      avatarState: 'GREETING',
    },
    {
      title: '2. Call Stack 3D ngăn xếp 🥞',
      description: 'Mô hình 3D kính mờ mô tả trực quan các Stack Frame xếp chồng lên nhau tương ứng với mỗi lần gọi hàm.',
      highlightSelector: '[data-tour-id="call-stack-3d-panel"]',
      avatarState: 'EXPLAINING',
    },
    {
      title: '3. Thao tác Push Frame 📥',
      description: 'Khi hàm tự gọi lại chính nó, một Stack Frame mới chứa các tham số cục bộ được đẩy (Push) lên đỉnh ngăn xếp.',
      highlightSelector: '[data-tour-id="call-stack-3d-panel"]',
      avatarState: 'SIMULATING',
    },
    {
      title: '4. Thao tác Pop Frame 📤',
      description: 'Khi đạt điều kiện dừng đệ quy, hàm trả giá trị về cho cha. Khung ngăn xếp trên đỉnh lập tức bị rút ra (Pop) giải phóng RAM.',
      highlightSelector: '[data-tour-id="call-stack-3d-panel"]',
      avatarState: 'SIMULATING',
    },
    {
      title: '5. Cảnh báo Stack Overflow ⚠️',
      description: 'Nếu quên viết điều kiện dừng, đệ quy sẽ chạy vô hạn, lắp đầy dung lượng Stack và gây ra lỗi sập StackOverflowException.',
      highlightSelector: '[data-tour-id="call-stack-3d-panel"]',
      avatarState: 'EXPLAINING',
    },
    {
      title: '6. Cây phân rã đệ quy (Recursion Tree) 🌳',
      description: 'Đồ thị SVG tự động vẽ các bài toán con phân nhánh dưới dạng cây nhị phân (ví dụ Fibonacci: F(n) = F(n-1) + F(n-2)).',
      highlightSelector: '[data-tour-id="recursion-tree-svg"]',
      avatarState: 'EXPLAINING',
    },
    {
      title: '7. Neon liên kết Stack-to-Heap 🔗',
      description: 'Xem các tia sáng neon quét động nối từ biến con trỏ trên Stack sang các vùng dữ liệu lưu trên Heap thực tế.',
      highlightSelector: '[data-tour-id="state-heap-pointer-panel"]',
      avatarState: 'EXPLAINING',
    },
    {
      title: '8. Watch Panel theo dõi biến 📊',
      description: 'Bảng giám sát giá trị của các tham số (n, low, high) thay đổi tức thời theo mỗi bước mô phỏng.',
      highlightSelector: '[data-tour-id="state-heap-pointer-panel"]',
      avatarState: 'EXPLAINING',
    },
    {
      title: '9. Điều khiển timeline trạng thái 🕹️',
      description: 'Sử dụng thanh VCR Controller để tua nhanh quá trình duyệt cây đệ quy hoặc quay lại các bước gọi hàm trước đó.',
      highlightSelector: '[data-tour-id="state-vcr-controls"]',
      avatarState: 'SIMULATING',
    },
    {
      title: '10. Phân biệt truyền Tham chiếu vs Tham trị ⚖️',
      description: 'Học cách nhận biết sự khác biệt khi truyền biến nguyên bản (value type) và truyền tham chiếu trỏ sang heap (reference type).',
      highlightSelector: '[data-tour-id="state-heap-pointer-panel"]',
      avatarState: 'EXPLAINING',
    },
    {
      title: '11. Theo dõi bộ nhớ Heap ảo 📟',
      description: 'Quan sát các ô nhớ heap được cấp phát động và quá trình thu hồi rác (Garbage Collector) dọn dẹp các ô nhớ mồ côi.',
      highlightSelector: '[data-tour-id="state-heap-pointer-panel"]',
      avatarState: 'EXPLAINING',
    },
    {
      title: '12. Hoàn thành giám sát trạng thái 🏆',
      description: 'Tuyệt vời! Bạn đã hiểu tường tận cách ngăn xếp quản lý bộ nhớ đệ quy. Hãy bấm chọn các thuật toán đệ quy khác để thử nhé!',
      avatarState: 'SUCCESS',
    }
  ],
  '/code-ide': [
    {
      title: '1. Monaco Code Editor 💻',
      description: 'Chào mừng bạn đến với Gỡ lỗi Code. Đây là trình biên tập Monaco Editor thực thụ, nơi chứa mã nguồn C# thực thi giải thuật.',
      highlightSelector: '.monaco-editor-container',
      avatarState: 'GREETING',
    },
    {
      title: '2. Tô sáng cú pháp & Cố vấn thông minh 💡',
      description: 'Mã nguồn được hiển thị có màu sắc phân biệt từ khóa (keywords) và hỗ trợ tự động gợi ý IntelliSense khi gõ.',
      highlightSelector: '.monaco-editor-container',
      avatarState: 'EXPLAINING',
    },
    {
      title: '3. Đặt Breakpoint lề trái 🔴',
      description: 'Nhấp chuột vào khoảng trống màu xám (gutter) ở lề trái dòng code để đặt điểm dừng đỏ. Thuật toán sẽ tự động dừng lại ở đây.',
      highlightSelector: '.monaco-editor .margin',
      avatarState: 'EXPLAINING',
    },
    {
      title: '4. Nút Bắt đầu phiên gỡ lỗi ⚡',
      description: 'Bấm nút Start Debugging (hoặc F5) để bắt đầu phiên biên dịch mã nguồn và chạy giả lập tương tác.',
      highlightSelector: '.debugger-actions-panel',
      avatarState: 'SIMULATING',
    },
    {
      title: '5. Nút Step Over (Chạy qua từng dòng) ⏭️',
      description: 'Bấm nút Step Over (hoặc F10) để đi qua dòng code tiếp theo trong hàm hiện tại, không đi sâu vào chi tiết các hàm phụ.',
      highlightSelector: '.debugger-actions-panel',
      avatarState: 'SIMULATING',
    },
    {
      title: '6. Nút Continue (Chạy tiếp) ▶️',
      description: 'Bấm Continue để giải phóng luồng chạy, thuật toán tiếp tục thực hiện cho đến khi va chạm vào điểm dừng Breakpoint tiếp theo.',
      highlightSelector: '.debugger-actions-panel',
      avatarState: 'SIMULATING',
    },
    {
      title: '7. Theo dõi giá trị Biến Watch 🔍',
      description: 'Bảng giám sát giá trị biến hiển thị các biến cục bộ đang thay đổi trị số thế nào sau mỗi dòng lệnh được duyệt qua.',
      highlightSelector: '.debug-inspect-panel',
      avatarState: 'EXPLAINING',
    },
    {
      title: '8. Theo dõi Stack cuộc gọi 🥞',
      description: 'Danh sách ngăn xếp Call Stack hiển thị trình tự các hàm được kích hoạt lồng nhau để bạn lần dấu vết thực thi ngược.',
      highlightSelector: '.debug-inspect-panel',
      avatarState: 'EXPLAINING',
    },
    {
      title: '9. Tốc độ gỡ lỗi tự động ⏱️',
      description: 'Bạn có thể chỉnh tốc độ tự động chạy Step Over từ chậm đến nhanh để xem code tự động nhảy dòng lướt qua.',
      highlightSelector: '.debugger-actions-panel',
      avatarState: 'EXPLAINING',
    },
    {
      title: '10. Đồng bộ trạng thái trên Canvas 🎨',
      description: 'Nhìn sang Canvas: khi code chạy qua dòng hoán vị, các thanh dữ liệu sẽ lập tức đổi chỗ tương ứng trong thời gian thực.',
      highlightSelector: '.debug-canvas-container',
      avatarState: 'EXPLAINING',
    },
    {
      title: '11. Nhận diện dòng code tích cực 💛',
      description: 'Dòng lệnh đang được thực thi sẽ có một dải màu vàng sáng bao phủ toàn bộ dòng để bạn biết con trỏ lệnh IP đang ở đâu.',
      highlightSelector: '.monaco-editor-container',
      avatarState: 'EXPLAINING',
    },
    {
      title: '12. Kết thúc quy trình gỡ lỗi mẫu 🎉',
      description: 'Chúc mừng bạn đã làm quen với IDE! Hãy tự tay đặt một vài breakpoint và bấm gỡ lỗi để thực hành chuyên sâu.',
      avatarState: 'SUCCESS',
    }
  ],
  '/graph': [
    {
      title: '1. Sân chơi Đồ thị & Cây 🌳',
      description: 'Chào mừng đến với Sân chơi Đồ thị. Đây là vùng vẽ vector tự do để bạn thiết lập và trực quan hóa các giải thuật đồ thị.',
      highlightSelector: '[data-tour-id="graph-canvas"]',
      beforeAction: switchToTab1,
      avatarState: 'GREETING',
    },
    {
      title: '2. Chọn Chế độ vẽ đồ thị 🛠️',
      description: 'Dùng bảng Mode Bar để chuyển đổi giữa các công cụ vẽ: Di chuyển, + Đỉnh, ↔ Cạnh, ✎ Trọng số, 🗑 Xóa.',
      highlightSelector: '[data-tour-id="graph-tool-select"]',
      beforeAction: switchToTab1,
      avatarState: 'EXPLAINING',
    },
    {
      title: '3. Thêm đỉnh mới (+ Đỉnh) 🔵',
      description: 'Kích hoạt công cụ này và nhấp chuột vào bất cứ đâu trên Canvas để tạo ra các đỉnh (Node) có nhãn tăng dần A, B, C.',
      highlightSelector: '[data-tour-id="graph-tool-add-node"]',
      beforeAction: switchToTab1,
      avatarState: 'SIMULATING',
    },
    {
      title: '4. Vẽ cạnh nối (↔ Cạnh) ➖',
      description: 'Kích hoạt công cụ này, kéo chuột từ đỉnh này nối sang đỉnh kia để tạo ra các liên kết cạnh (Edge) có hướng hoặc vô hướng.',
      highlightSelector: '[data-tour-id="graph-tool-add-edge"]',
      beforeAction: switchToTab1,
      avatarState: 'SIMULATING',
    },
    {
      title: '5. Gán trọng số cạnh (✎ Trọng số) 🔢',
      description: 'Kích hoạt công cụ này, nhấp vào một cạnh để gán giá trị độ dài/chi phí của cạnh phục vụ cho giải thuật Dijkstra.',
      highlightSelector: '[data-tour-id="graph-tool-weight"]',
      beforeAction: switchToTab1,
      avatarState: 'SIMULATING',
    },
    {
      title: '6. Xóa thành phần đỉnh/cạnh (🗑 Xóa) ❌',
      description: 'Chọn công cụ này và click vào đỉnh hoặc cạnh bất kỳ để dọn dẹp phần thừa trên đồ thị của bạn.',
      highlightSelector: '[data-tour-id="graph-tool-delete"]',
      beforeAction: switchToTab1,
      avatarState: 'SIMULATING',
    },
    {
      title: '7. Lực đẩy vật lý Coulomb & Hooke ⚛️',
      description: 'Bật/Tắt lực đẩy mô phỏng vật lý. Đồ thị sẽ tự giãn cách đều đặn, phân bổ các đỉnh hài hòa và thẩm mỹ.',
      highlightSelector: '[data-tour-id="physics-toggle"]',
      beforeAction: switchToTab1,
      avatarState: 'SIMULATING',
      actionScript: [
        { type: 'click', targetSelector: '[data-tour-id="physics-toggle"]' }
      ]
    },
    {
      title: '8. Chọn giải thuật duyệt đồ thị 📋',
      description: 'Lựa chọn thuật toán bạn muốn chứng kiến: BFS (Duyệt theo chiều rộng), DFS (Chiều sâu), hay Dijkstra (Tìm đường đi ngắn nhất).',
      highlightSelector: '[data-tour-id="graph-algorithm-select"]',
      beforeAction: switchToTab1,
      avatarState: 'EXPLAINING',
    },
    {
      title: '9. Chọn đỉnh nguồn xuất phát 🏁',
      description: 'Chọn đỉnh bắt đầu (Source Node) từ danh sách dropdown để làm điểm khởi hành duyệt đồ thị.',
      highlightSelector: '[data-tour-id="graph-source-node-select"]',
      beforeAction: switchToTab1,
      avatarState: 'EXPLAINING',
    },
    {
      title: '10. Khởi động chạy mô phỏng ▶️',
      description: 'Bấm nút Mô phỏng để bắt đầu chạy hoạt ảnh. Các đỉnh sẽ chuyển đổi trạng thái màu sắc theo luồng duyệt giải thuật.',
      highlightSelector: '[data-tour-id="graph-algo-trigger"]',
      beforeAction: switchToTab1,
      avatarState: 'SIMULATING',
    },
    {
      title: '11. Nhập/Xuất dữ liệu đồ thị JSON 💾',
      description: 'Sử dụng tab Import/Export ở thanh bên phải để lưu đồ thị đã thiết kế dưới dạng JSON hoặc nhập các mẫu đồ thị phức tạp có sẵn.',
      highlightSelector: '[data-tour-id="graph-import-label"]',
      beforeAction: switchToTab1,
      avatarState: 'EXPLAINING',
    },
    {
      title: '12. Duyệt bài học lý thuyết nâng cao 📚',
      description: 'Chuyển sang tab này để đọc phân tích thuật toán đồ thị, độ phức tạp Big-O và mã giả tương ứng của BFS/DFS.',
      highlightSelector: '[data-tour-id="algo-theory-pane"]',
      beforeAction: switchToTab2,
      avatarState: 'SUCCESS',
    }
  ],
  '/di': [
    {
      title: '1. Dependency Injection & IoC Container 🧪',
      description: 'Chào mừng bạn đến với phân hệ DI/IoC Container. Tại đây chúng ta sẽ khám phá cách quản lý vòng đời đối tượng lỏng lẻo.',
      highlightSelector: '[data-tour-id="di-container-visualizer"]',
      avatarState: 'GREETING',
    },
    {
      title: '2. Bảng Services đăng ký 📋',
      description: 'Nơi hiển thị danh sách các dịch vụ (Services) được khai báo đăng ký trước vào IoC Container của ASP.NET Core.',
      highlightSelector: '[data-tour-id="di-container-visualizer"]',
      avatarState: 'EXPLAINING',
    },
    {
      title: '3. Dịch vụ dạng Singleton 🥇',
      description: 'Dịch vụ được khởi tạo duy nhất một lần trong suốt vòng đời ứng dụng. Mọi yêu cầu resolve sau đó đều nhận chung 1 instance.',
      highlightSelector: '[data-tour-id="di-container-visualizer"]',
      avatarState: 'EXPLAINING',
    },
    {
      title: '4. Dịch vụ dạng Transient 🥈',
      description: 'Dịch vụ được sinh mới liên tục mỗi khi được yêu cầu resolve, phù hợp cho các dịch vụ nhẹ, không lưu trạng thái.',
      highlightSelector: '[data-tour-id="di-container-visualizer"]',
      avatarState: 'EXPLAINING',
    },
    {
      title: '5. Đồ thị Dependency Graph 🕸️',
      description: 'Sơ đồ mạng lưới mô tả các lớp phụ thuộc lẫn nhau, hiển thị hướng truyền tham chiếu thông qua các dòng neon màu neon.',
      highlightSelector: '[data-tour-id="dependency-graph-panel"]',
      avatarState: 'EXPLAINING',
    },
    {
      title: '6. Nút Yêu cầu Resolve Service 🎯',
      description: 'Bấm nút Resolve để yêu cầu IoC Container phân tích các tham số hàm tạo và khởi tạo cây phụ thuộc tương ứng.',
      highlightSelector: '.di-resolve-trigger',
      avatarState: 'SIMULATING',
    },
    {
      title: '7. Quy trình giải quyết phụ thuộc ⚙️',
      description: 'Quan sát các hạt neon chạy dọc theo các cạnh đồ thị, khởi tạo các dịch vụ con trước rồi truyền vào hàm tạo dịch vụ cha.',
      highlightSelector: '[data-tour-id="dependency-graph-panel"]',
      avatarState: 'SIMULATING',
    },
    {
      title: '8. Phát hiện vòng lặp phụ thuộc 🔄',
      description: 'Nếu lớp A cần lớp B, và lớp B lại cần lớp A, container sẽ rơi vào vòng lặp vô hạn và phát sinh lỗi phụ thuộc vòng.',
      highlightSelector: '[data-tour-id="dependency-graph-panel"]',
      avatarState: 'EXPLAINING',
    },
    {
      title: '9. Giải thuật DFS Cycle Detection 🔍',
      description: 'Container sử dụng thuật toán tìm kiếm chiều sâu DFS để duyệt đồ thị phụ thuộc và báo động ngay nếu phát hiện đường đi lặp.',
      highlightSelector: '[data-tour-id="dependency-graph-panel"]',
      avatarState: 'EXPLAINING',
    },
    {
      title: '10. Theo dõi Vùng nhớ đối tượng 📟',
      description: 'Nhìn vào danh sách services để thấy các địa chỉ Hexa của instances được cập nhật và kiểm chứng Singleton vs Transient.',
      highlightSelector: '[data-tour-id="di-container-visualizer"]',
      avatarState: 'EXPLAINING',
    },
    {
      title: '11. Giải phóng dịch vụ đã dùng 🗑️',
      description: 'Khi phạm vi Scope kết thúc, các dịch vụ IDisposable sẽ tự động được thu hồi để tránh rò rỉ bộ nhớ RAM hệ thống.',
      highlightSelector: '.di-resolve-trigger',
      avatarState: 'SIMULATING',
    },
    {
      title: '12. Tổng kết nguyên lý Dependency Inversion 🏆',
      description: 'Chúc mừng bạn! Bằng cách ủy thác việc tạo đối tượng cho IoC Container, mã nguồn của bạn đã đạt độ tách biệt lỏng lẻo cao nhất.',
      avatarState: 'SUCCESS',
    }
  ],
  '/patterns': [
    {
      title: '1. Bộ sưu tập Design Patterns 🎭',
      description: 'Chào mừng đến với Mẫu thiết kế. Phân hệ này trực quan hóa các giải pháp thiết kế hướng đối tượng kinh điển.',
      highlightSelector: '.patterns-scenario-tabs',
      avatarState: 'GREETING',
    },
    {
      title: '2. Chọn mẫu thiết kế Strategy/Observer 📂',
      description: 'Sử dụng tab chuyển đổi để chọn mẫu Observer (Báo động sự kiện) hoặc Strategy (Chuyển đổi thuật toán runtime).',
      highlightSelector: '.patterns-scenario-tabs',
      avatarState: 'EXPLAINING',
    },
    {
      title: '3. Mô phỏng Observer Pattern 🌌',
      description: 'Vùng Canvas vẽ mô phỏng một Subject (Nhà phát hành) liên kết với nhiều Subscriber (Người đăng ký nhận tin).',
      highlightSelector: '[data-tour-id="observer-graph"]',
      avatarState: 'EXPLAINING',
    },
    {
      title: '4. Thay đổi trạng thái Subject ⚙️',
      description: 'Nhấn nút để cập nhật dữ liệu của Subject, theo dõi cách Subject tự động duyệt danh sách để thông báo cho Subscribers.',
      highlightSelector: '[data-tour-id="strategy-sandbox"]',
      avatarState: 'SIMULATING',
    },
    {
      title: '5. Tia laser phát thông báo ⚡',
      description: 'Các hạt neon thông báo (Event Notification) được phóng đi từ tâm Subject lan tỏa đến các Subscriber xung quanh.',
      highlightSelector: '[data-tour-id="observer-graph"]',
      avatarState: 'SIMULATING',
    },
    {
      title: '6. Subscribers nhận thông tin 📥',
      description: 'Các Subscriber nhận được hạt neon sẽ đổi màu sáng phát ra vòng tròn sóng để báo hiệu đã xử lý tin thành công.',
      highlightSelector: '[data-tour-id="observer-graph"]',
      avatarState: 'SIMULATING',
    },
    {
      title: '7. Mô phỏng Strategy Pattern 🛠️',
      description: 'Chuyển sang mẫu Strategy. Vùng điều khiển hiển thị một bối cảnh Context có thể nhúng các thuật toán hoán đổi.',
      highlightSelector: '[data-tour-id="strategy-sandbox"]',
      avatarState: 'EXPLAINING',
    },
    {
      title: '8. Thay đổi Strategy lúc runtime 🔄',
      description: 'Bấm thay đổi thuật toán (Ví dụ: Đổi từ Sắp xếp Nhanh sang Sắp xếp Nổi bọt), thuật toán xử lý dữ liệu sẽ thay đổi tức thì.',
      highlightSelector: '[data-tour-id="strategy-sandbox"]',
      avatarState: 'SIMULATING',
    },
    {
      title: '9. Theo dõi mã nguồn mẫu 💻',
      description: 'Khung mã nguồn sẽ hiển thị thiết kế mẫu sử dụng interface và các class cụ thể của mẫu thiết kế tương ứng.',
      highlightSelector: '[data-tour-id="patterns-code-panel"]',
      avatarState: 'EXPLAINING',
    },
    {
      title: '10. Kiểm tra tương tác Dynamic 🕹️',
      description: 'Tương tác với đồ thị bằng chuột, nhấp đúp để thêm hoặc bớt Subscribers để thấy sự linh động của liên kết lỏng lẻo.',
      highlightSelector: '[data-tour-id="observer-graph"]',
      avatarState: 'SIMULATING',
    },
    {
      title: '11. So sánh với lập trình không mẫu ⚖️',
      description: 'Phân tích các nhược điểm nếu không dùng Pattern (như code bị phình to bởi hàng tá câu lệnh if-else lồng nhau).',
      highlightSelector: '[data-tour-id="observer-graph"]',
      avatarState: 'EXPLAINING',
    },
    {
      title: '12. Tổng kết lợi ích mở rộng hệ thống 🏆',
      description: 'Bạn đã hoàn tất tìm hiểu Design Patterns. Việc nắm vững các mẫu này giúp bạn tự tin thiết kế các hệ thống quy mô doanh nghiệp.',
      avatarState: 'SUCCESS',
    }
  ],
  '/system': [
    {
      title: '1. Thiết kế Hệ thống phân tán 🌐',
      description: 'Chào mừng đến với phân hệ System Design. Chúng ta sẽ xem cách một hệ thống lớn chịu tải hàng triệu request vận hành.',
      highlightSelector: '[data-tour-id="distributed-canvas"]',
      avatarState: 'GREETING',
    },
    {
      title: '2. Khách hàng gửi HTTP Request 📥',
      description: 'Nhấp vào nút gửi yêu cầu để giả lập gói tin (hạt neon) được truyền tải từ trình duyệt client qua internet.',
      highlightSelector: '[data-tour-id="scenario-controls"]',
      avatarState: 'SIMULATING',
    },
    {
      title: '3. Cân bằng tải Load Balancer ⚖️',
      description: 'Gói tin đi qua Load Balancer (Nginx/HAProxy), thiết bị này có nhiệm vụ phân chia tải đều đặn tránh nghẽn cổ chai.',
      highlightSelector: '[data-tour-id="distributed-canvas"]',
      avatarState: 'EXPLAINING',
    },
    {
      title: '4. Định tuyến Round-Robin 🔄',
      description: 'Quan sát các hạt neon được dẫn hướng lần lượt tới Web Server 1, Web Server 2 theo thuật toán xoay vòng Round-Robin.',
      highlightSelector: '[data-tour-id="distributed-canvas"]',
      avatarState: 'EXPLAINING',
    },
    {
      title: '5. Cụm Web Server xử lý ⚙️',
      description: 'Các Web Server nhận gói tin, truy vấn database và sinh mã HTML/JSON trả ngược về cho Client.',
      highlightSelector: '[data-tour-id="distributed-canvas"]',
      avatarState: 'EXPLAINING',
    },
    {
      title: '6. Cơ sở dữ liệu Replication 🗄️',
      description: 'Mô hình Primary-Replica: Các lệnh Ghi (Write) gửi tới máy chủ Primary, lệnh Đọc (Read) gửi tới máy chủ Replica để giảm tải.',
      highlightSelector: '[data-tour-id="distributed-canvas"]',
      avatarState: 'EXPLAINING',
    },
    {
      title: '7. Độ trễ Replication Lag ⏳',
      description: 'Xem cách dữ liệu đồng bộ từ Primary sang Replica. Khoảng thời gian trễ đồng bộ này gọi là Replication Lag.',
      highlightSelector: '[data-tour-id="distributed-canvas"]',
      avatarState: 'EXPLAINING',
    },
    {
      title: '8. Cơ chế Cache IMemoryCache 🚀',
      description: 'Khi bật Cache, Web Server sẽ đọc dữ liệu từ RAM thay vì chọc thẳng xuống Database, tăng tốc độ phản hồi gấp 100 lần.',
      highlightSelector: '[data-tour-id="distributed-canvas"]',
      avatarState: 'EXPLAINING',
    },
    {
      title: '9. Mô phỏng sập máy chủ bốc khói 💥',
      description: 'Kích hoạt kịch bản sập nguồn Server. Máy chủ sập sẽ bốc khói xám sinh động và Load Balancer tự động cô lập máy chủ lỗi.',
      highlightSelector: '[data-tour-id="scenario-controls"]',
      avatarState: 'SIMULATING',
    },
    {
      title: '10. Mô phỏng phân tách mạng (Network Partition) 🪓',
      description: 'Kích hoạt đứt cáp giữa các data centers để quan sát các vùng độc lập bị cô lập, minh họa cho định lý CAP nổi tiếng.',
      highlightSelector: '[data-tour-id="scenario-controls"]',
      avatarState: 'SIMULATING',
    },
    {
      title: '11. Thống kê Request Rate & Latency 📊',
      description: 'Xem bảng thống kê: Số request/giây, độ trễ phản hồi (ms) và tỷ lệ lỗi để đánh giá độ khỏe mạnh của hệ thống.',
      highlightSelector: '[data-tour-id="distributed-canvas"]',
      avatarState: 'EXPLAINING',
    },
    {
      title: '12. Tổng kết nguyên lý System Design 🏆',
      description: 'Chúc mừng bạn! Việc nắm vững cân bằng tải, replication, cache và thiết kế chịu lỗi giúp bạn làm chủ các hệ thống đám mây.',
      avatarState: 'SUCCESS',
    }
  ],
  '/quiz': [
    {
      title: '1. Trắc nghiệm kiến thức nâng cao 📝',
      description: 'Chào mừng bạn đến với phân hệ Trắc nghiệm. Nơi giúp bạn kiểm tra và củng cố kiến thức giải thuật và thiết kế.',
      highlightSelector: '.quiz-card-overlay',
      avatarState: 'GREETING',
    },
    {
      title: '2. Thẻ câu hỏi MCQ / True-False ❓',
      description: 'Một ô kính mờ mọc lên ở giữa màn hình chứa câu hỏi lý thuyết hoặc bài tập đọc code gỡ lỗi đệ quy.',
      highlightSelector: '.quiz-card-overlay',
      avatarState: 'EXPLAINING',
    },
    {
      title: '3. Lựa chọn phương án trả lời 🎯',
      description: 'Đọc kỹ đề bài và nhấp chọn một trong bốn phương án hiển thị trong lưới đáp án (Grid Options).',
      highlightSelector: '.quiz-options-grid',
      avatarState: 'EXPLAINING',
    },
    {
      title: '4. Xác nhận gửi đáp án 📤',
      description: 'Bấm nút Gửi câu trả lời để hệ thống thực hiện kiểm định đáp án dựa trên dữ liệu giải thuật.',
      highlightSelector: '.quiz-options-grid',
      avatarState: 'SIMULATING',
    },
    {
      title: '5. Đánh giá màu sắc HSL chính xác 🎨',
      description: 'Nếu đúng, phương án sẽ chuyển màu Xanh Neon Emerald. Nếu sai, đáp án bạn chọn sẽ chuyển màu Đỏ Neon Ruby rực rỡ.',
      highlightSelector: '.quiz-options-grid',
      avatarState: 'EXPLAINING',
    },
    {
      title: '6. Bảng giải thích sư phạm chi tiết 💡',
      description: 'Đọc phần phân tích sư phạm chi tiết hiển thị bên dưới để hiểu rõ bản chất tại sao đáp án đó đúng/sai.',
      highlightSelector: '.quiz-explanation-panel',
      avatarState: 'EXPLAINING',
    },
    {
      title: '7. Liên kết đến mã nguồn tham chiếu 🔗',
      description: 'Nút tham khảo nhanh trỏ thẳng tới file mã nguồn hoặc dòng pseudocode tương ứng để bạn kiểm chứng nhanh.',
      highlightSelector: '.quiz-explanation-panel',
      avatarState: 'EXPLAINING',
    },
    {
      title: '8. Tích lũy điểm kinh nghiệm XP ⭐',
      description: 'Mỗi câu trả lời đúng sẽ cộng điểm XP trực tiếp vào tài khoản của bạn, hiển thị hoạt ảnh hạt sáng bay lên.',
      highlightSelector: '.quiz-card-overlay',
      avatarState: 'SUCCESS',
    },
    {
      title: '9. Hệ thống phần thưởng Medal 🏅',
      description: 'Hoàn thành trọn vẹn một gói câu hỏi mà không sai câu nào để mở khóa Huy chương Vàng danh giá.',
      highlightSelector: '.quiz-card-overlay',
      avatarState: 'SUCCESS',
    },
    {
      title: '10. Theo dõi Bảng xếp hạng Leaderboard 🏆',
      description: 'So sánh điểm tích lũy của bạn với các học viên khác trên toàn bộ hệ thống để lấy động lực tranh đua học tập.',
      highlightSelector: '.quiz-card-overlay',
      avatarState: 'EXPLAINING',
    },
    {
      title: '11. Lịch sử làm bài thi thử 📅',
      description: 'Xem lại danh sách các câu hỏi đã làm sai trong quá khứ để ôn tập lại trước khi bước vào kỳ thi thực tế.',
      highlightSelector: '.quiz-card-overlay',
      avatarState: 'EXPLAINING',
    },
    {
      title: '12. Tổng kết lộ trình tự luyện tập 🎓',
      description: 'Tuyệt vời! Bạn đã hoàn thành hướng dẫn trắc nghiệm. Hãy bắt đầu chinh phục các câu hỏi hóc búa nhất nhé!',
      avatarState: 'SUCCESS',
    }
  ],
};

export const useGuidedTourStore = defineStore('guidedTour', () => {
  const isActive = ref(false);
  const currentStepIndex = ref(0);
  const activePageKey = ref<string | null>(null);

  
  const virtualCursor = ref<{ x: number; y: number; visible: boolean; clicking: boolean } | null>(null);
  const isExecutingScript = ref(false);

  
  const steps = ref<TourStep[]>([
    {
      title: 'Chào mừng đến với VisualizationDSA! 👋',
      description: 'Hệ thống học tập và trực quan hóa cấu trúc dữ liệu, giải thuật, cùng các nguyên lý thiết kế phần mềm trực sinh động nhất.',
      avatarState: 'GREETING',
    },
    {
      title: 'Chế độ Lý thuyết & Mô phỏng DSA 📊',
      description: 'Lựa chọn xem Lý thuyết chi tiết (Độ phức tạp, mã giả tiếng Việt) hoặc chuyển sang Mô phỏng tương tác 60 FPS tức thì.',
      highlightSelector: '.dashboard-view-root',
      avatarState: 'EXPLAINING',
    },
    {
      title: 'Trình gỡ lỗi trực quan & Monaco IDE 💻',
      description: 'Trải nghiệm viết code thực tế với Monaco Editor, đặt Breakpoint gỡ lỗi dòng code từng bước và theo dõi Call Stack trực tiếp.',
      highlightSelector: '[href="/ide"]',
      avatarState: 'EXPLAINING',
    },
    {
      title: 'Trực quan hóa SOLID OOP 🏗️',
      description: 'Mô phỏng sinh động các nguyên lý SOLID (như Liskov Substitution - đà điểu bay, Dependency Inversion - neon flow).',
      highlightSelector: '[href="/solid"]',
      avatarState: 'EXPLAINING',
    },
    {
      title: 'Trắc nghiệm & Bảng thành tích 🏆',
      description: 'Củng cố kiến thức qua các câu hỏi trắc nghiệm, tích lũy điểm XP để thăng hạng trên Bảng xếp hạng!',
      highlightSelector: '[href="/quiz"]',
      avatarState: 'SUCCESS',
    },
  ]);

  
  const currentSteps = ref<TourStep[]>(steps.value);

  function initTour() {
    const tourSeen = localStorage.getItem('guided_tour_seen');
    if (!tourSeen) {
      startTour();
    }
  }

  function startTour() {
    virtualCursor.value = null;
    isExecutingScript.value = false;
    activePageKey.value = null;
    currentSteps.value  = steps.value;
    isActive.value      = true;
    currentStepIndex.value = 0;
    if (currentSteps.value[0]?.beforeAction) {
      currentSteps.value[0].beforeAction();
    }
  }

  




  function startPageTour(routePath: string, force = false): void {
    const storageKey = `page_tour_${routePath.replace('/', '')}_seen`;
    if (!force && localStorage.getItem(storageKey)) return;

    const pageTourSteps = PAGE_TOURS[routePath];
    if (!pageTourSteps || pageTourSteps.length === 0) return;

    virtualCursor.value = null;
    isExecutingScript.value = false;
    activePageKey.value    = routePath;
    currentSteps.value     = pageTourSteps;
    isActive.value         = true;
    currentStepIndex.value = 0;
    if (pageTourSteps[0]?.beforeAction) {
      pageTourSteps[0].beforeAction();
    }
  }

  function nextStep() {
    virtualCursor.value = null;
    isExecutingScript.value = false;
    if (currentStepIndex.value < currentSteps.value.length - 1) {
      const nextIdx = currentStepIndex.value + 1;
      const nextStepObj = currentSteps.value[nextIdx];
      if (nextStepObj?.beforeAction) {
        nextStepObj.beforeAction();
        setTimeout(() => {
          currentStepIndex.value = nextIdx;
        }, 150);
      } else {
        currentStepIndex.value = nextIdx;
      }
    } else {
      completeTour();
    }
  }

  function prevStep() {
    virtualCursor.value = null;
    isExecutingScript.value = false;
    if (currentStepIndex.value > 0) {
      const prevIdx = currentStepIndex.value - 1;
      const prevStepObj = currentSteps.value[prevIdx];
      if (prevStepObj?.beforeAction) {
        prevStepObj.beforeAction();
        setTimeout(() => {
          currentStepIndex.value = prevIdx;
        }, 150);
      } else {
        currentStepIndex.value = prevIdx;
      }
    }
  }

  function skipTour() {
    virtualCursor.value = null;
    isExecutingScript.value = false;
    _markTourSeen();
    isActive.value = false;
  }

  function completeTour() {
    virtualCursor.value = null;
    isExecutingScript.value = false;
    _markTourSeen();
    isActive.value = false;
  }

  function _markTourSeen() {
    if (activePageKey.value) {
      const storageKey = `page_tour_${activePageKey.value.replace('/', '')}_seen`;
      localStorage.setItem(storageKey, 'true');
      activePageKey.value = null;
    } else {
      localStorage.setItem('guided_tour_seen', 'true');
    }
    currentSteps.value = steps.value;
  }

  async function runCurrentStepScript() {
    const step = currentSteps.value[currentStepIndex.value];
    if (!step?.actionScript || step.actionScript.length === 0) return;

    isExecutingScript.value = true;
    for (const action of step.actionScript) {
      if (action.type === 'click' && action.targetSelector) {
        const el = document.querySelector(action.targetSelector) as HTMLElement;
        if (el) {
          const rect = el.getBoundingClientRect();
          const targetX = rect.left + rect.width / 2;
          const targetY = rect.top + rect.height / 2;

          if (!virtualCursor.value) {
            virtualCursor.value = { x: targetX - 80, y: targetY + 80, visible: true, clicking: false };
            await new Promise(resolve => setTimeout(resolve, 150));
          }

          virtualCursor.value = { x: targetX, y: targetY, visible: true, clicking: false };
          await new Promise(resolve => setTimeout(resolve, 750));

          virtualCursor.value.clicking = true;
          el.click();
          await new Promise(resolve => setTimeout(resolve, 350));
          virtualCursor.value.clicking = false;
        }
      } else if (action.type === 'type' && action.targetSelector) {
        const el = document.querySelector(action.targetSelector) as HTMLInputElement;
        if (el) {
          const rect = el.getBoundingClientRect();
          const targetX = rect.left + rect.width / 2;
          const targetY = rect.top + rect.height / 2;

          virtualCursor.value = { x: targetX, y: targetY, visible: true, clicking: false };
          await new Promise(resolve => setTimeout(resolve, 750));

          virtualCursor.value.clicking = true;
          el.focus();
          el.value = action.payload || '';
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
          await new Promise(resolve => setTimeout(resolve, 350));
          virtualCursor.value.clicking = false;
        }
      }
    }
    isExecutingScript.value = false;
    setTimeout(() => {
      if (!isExecutingScript.value) {
        virtualCursor.value = null;
      }
    }, 1000);
  }

  return {
    isActive,
    currentStepIndex,
    steps,
    currentSteps,
    activePageKey,
    virtualCursor,
    isExecutingScript,
    initTour,
    startTour,
    startPageTour,
    nextStep,
    prevStep,
    skipTour,
    completeTour,
    runCurrentStepScript,
  };
});
