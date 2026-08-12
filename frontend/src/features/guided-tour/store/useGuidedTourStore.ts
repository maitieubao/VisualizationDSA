import { ref } from 'vue';
import { defineStore } from 'pinia';

export interface TourAction {
  type: 'click' | 'type' | 'wait';
  targetSelector?: string;
  payload?: string;
  delayMs?: number;
}

export interface TourStep {
  icon?: string;
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
      title: '1. Bộ chuyển đổi Sandbox / Bài học',
      icon: 'refresh-cw',
      description: 'Chuyển đổi linh hoạt giữa trang Bài học lý thuyết (Độ phức tạp Big-O, mã giả) và Sân chơi mô phỏng tương tác 60 FPS.',
      highlightSelector: '[data-tour-id="algo-tab-switch"]',
      beforeAction: switchToTab1,
      avatarState: 'GREETING',
    },
    {
      title: '2. Thanh cấu hình dữ liệu',
      icon: 'edit',
      description: 'Nhập mảng số nguyên tùy ý của bạn (Cách nhau bằng dấu phẩy, tối đa 15 số) hoặc nhấn Random để hệ thống tự sinh mảng.',
      highlightSelector: '[data-tour-id="vcr-input-bar"]',
      beforeAction: switchToSortingAndControls,
      avatarState: 'EXPLAINING',
      actionScript: [
        { type: 'click', targetSelector: '[data-tour-id="vcr-input-bar"]' }
      ]
    },
    {
      title: '3. Sinh mảng ngẫu nhiên',
      icon: 'dice',
      description: 'Nhấn nút Random trên thanh dữ liệu để sinh nhanh một mảng số ngẫu nhiên nằm trong giới hạn an toàn của thuật toán.',
      highlightSelector: '[data-tour-id="vcr-input-bar"] button',
      beforeAction: switchToSortingAndControls,
      avatarState: 'SIMULATING',
    },
    {
      title: '4. Phát hoạt hình (Play)',
      icon: 'play',
      description: 'Nhấn Play (hoặc phím Space) để chạy hoạt cảnh mô phỏng. Các thanh đồ họa trên Canvas sẽ dịch chuyển Lerp mượt mà.',
      highlightSelector: '[data-tour-id="vcr-play-btn"]',
      beforeAction: switchToSortingAndControls,
      avatarState: 'SIMULATING',
    },
    {
      title: '5. Tạm dừng mô phỏng',
      icon: 'pause',
      description: 'Khi thuật toán đang chạy, bạn có thể nhấn nút Pause bất kỳ lúc nào để đóng băng trạng thái của mảng và nghiên cứu sâu hơn.',
      highlightSelector: '[data-tour-id="vcr-play-btn"]',
      beforeAction: switchToSortingAndControls,
      avatarState: 'EXPLAINING',
    },
    {
      title: '6. Tiến từng bước (Step Forward)',
      icon: 'step-forward',
      description: 'Khi đang Tạm dừng, sử dụng nút tiến bước (hoặc mũi tên phải →) để thực thi chính xác 1 bước (1 frame chuyển đổi) tiếp theo.',
      highlightSelector: '[data-tour-id="vcr-step-debug"]',
      beforeAction: switchToSortingAndControls,
      avatarState: 'SIMULATING',
    },
    {
      title: '7. Lùi từng bước (Step Backward)',
      icon: 'step-backward',
      description: 'Nhấn nút lùi bước (hoặc mũi tên trái ←) để khôi phục trạng thái mảng về 1 bước trước đó, giúp bạn phân tích kỹ lỗi logic.',
      highlightSelector: '[data-tour-id="vcr-step-debug"]',
      beforeAction: switchToSortingAndControls,
      avatarState: 'SIMULATING',
    },
    {
      title: '8. Tùy chọn tốc độ mô phỏng',
      icon: 'timer',
      description: 'Điều chỉnh tốc độ chạy hoạt ảnh từ rất chậm (0.25x) để soi kỹ hoán vị, cho đến cực nhanh (4x) để hoàn thành sớm mô phỏng.',
      highlightSelector: '[data-tour-id="vcr-speed-select"]',
      beforeAction: switchToSortingAndControls,
      avatarState: 'EXPLAINING',
    },
    {
      title: '9. Bảng theo dõi biến (Trace Watcher)',
      icon: 'chart-bar',
      description: 'Khung hiển thị bảng biến trạng thái (Biến vòng lặp i, j, con trỏ Low, High) giúp bạn hiểu rõ các biến FSM chạy dưới nền.',
      highlightSelector: '[data-tour-id="trace-watcher-panel"]',
      beforeAction: switchToSortingAndControls,
      avatarState: 'EXPLAINING',
    },
    {
      title: '10. Giao diện Code Sandbox',
      icon: 'monitor',
      description: 'Chuyển sang tab Code Sandbox để tự do gõ thuật toán JavaScript của riêng bạn. Code sẽ được tự động biên dịch và vẽ thành biểu đồ 60 FPS!',
      highlightSelector: '[data-tour-id="pseudocode-syncer"]',
      beforeAction: switchToTabCode,
      avatarState: 'EXPLAINING',
    },
    {
      title: '11. Bài học Lý thuyết chuyên sâu',
      icon: 'book-open',
      description: 'Chuyển sang tab này để truy cập các bài học lý thuyết trực quan chuyên sâu về Độ phức tạp Big-O và mã giả chuẩn hóa.',
      highlightSelector: '[data-tour-id="algo-theory-pane"]',
      beforeAction: switchToTab2,
      avatarState: 'SUCCESS',
    },
    {
      title: '12. Hoàn thành hướng dẫn!',
      icon: 'party-popper',
      description: 'Bạn đã nắm vững toàn bộ thanh công cụ sắp xếp. Hãy tự tay nhập mảng và khám phá các giải thuật khác nhau nhé!',
      avatarState: 'SUCCESS',
    }
  ],
  '/code-ide': [
    {
      title: '1. Monaco Code Editor',
      icon: 'monitor',
      description: 'Chào mừng bạn đến với Gỡ lỗi Code. Đây là trình biên tập Monaco Editor thực thụ, nơi bạn viết thuật toán bằng JavaScript để trực quan hóa.',
      highlightSelector: '[data-tour-id="code-ide-editor"]',
      avatarState: 'GREETING',
    },
    {
      title: '2. Tô sáng cú pháp JavaScript',
      icon: 'bulb',
      description: 'Mã nguồn JavaScript được tô màu phân biệt từ khóa (keywords), chuỗi, số và chú thích. Mọi thay đổi khi gõ đều được lưu tự động vào bộ nhớ.',
      highlightSelector: '[data-tour-id="code-ide-editor"]',
      avatarState: 'EXPLAINING',
    },
    {
      title: '3. Mảng đầu vào',
      icon: 'edit',
      description: 'Nhập mảng số bạn muốn trực quan hóa, ngăn cách bằng dấu phẩy (từ 2 đến 50 phần tử). Giá trị được kiểm tra ngay khi gõ — sai định dạng sẽ báo lỗi kèm lý do.',
      highlightSelector: '[data-tour-id="code-ide-array-input"]',
      avatarState: 'EXPLAINING',
    },
    {
      title: '4. Nút RUN biên dịch',
      icon: 'play',
      description: 'Bấm RUN để phân tích cú pháp AST, chạy mã trong môi trường Sandbox an toàn rồi sinh chuỗi bước hoạt ảnh 60 FPS trên Canvas.',
      highlightSelector: '[data-tour-id="code-ide-run-btn"]',
      avatarState: 'SIMULATING',
    },
    {
      title: '5. Nút Hủy biên dịch',
      icon: 'stop',
      description: 'Khi bấm Run, nút này tạm thời biến thành nút Hủy để bạn dừng ngay lập tức phiên Sandbox đang chạy — không phải chờ đợi mù mịt.',
      highlightSelector: '[data-tour-id="code-ide-run-btn"]',
      avatarState: 'SIMULATING',
    },
    {
      title: '6. Bảng điều khiển Compiler Console',
      icon: 'terminal',
      description: 'Console hiển thị nhật ký biên dịch theo thời gian thực: phân tích AST, sinh vết thực thi, thông báo lỗi kèm số dòng — mỗi dòng có mốc thời gian.',
      highlightSelector: '[data-tour-id="code-ide-console"]',
      avatarState: 'EXPLAINING',
    },
    {
      title: '7. Glow trạng thái biên dịch',
      icon: 'zap',
      description: 'Khung editor phát sáng ĐỎ khi biên dịch lỗi và chuyển XANH sau khi chạy thành công. Lỗi còn được đánh dấu squiggle đỏ đúng dòng trong Monaco.',
      highlightSelector: '[data-tour-id="code-ide-editor"]',
      avatarState: 'EXPLAINING',
    },
    {
      title: '8. Trực quan hóa trên Canvas',
      icon: 'palette',
      description: 'Các thanh dữ liệu được vẽ sinh động trên Canvas: so sánh, hoán vị, gán giá trị đều dịch chuyển Lerp mượt mà theo đúng dòng code đang thực thi.',
      highlightSelector: '[data-tour-id="code-ide-canvas"]',
      avatarState: 'EXPLAINING',
    },
    {
      title: '9. Điều khiển VCR Playback',
      icon: 'timer',
      description: 'Thanh điều khiển VCR cho phép Play, Pause, tiến/lùi từng bước và kéo timeline để soi từng thao tác của thuật toán trên mảng.',
      highlightSelector: '[data-tour-id="code-ide-vcr"]',
      avatarState: 'SIMULATING',
    },
    {
      title: '10. Tốc độ phát hoạt ảnh',
      icon: 'chart-bar',
      description: 'Điều chỉnh tốc độ phát từ 0.1x đến 10x: chạy chậm để phân tích kỹ hoán vị, hoặc tăng tốc để xem toàn bộ quá trình hoàn tất nhanh chóng.',
      highlightSelector: '[data-tour-id="code-ide-vcr"]',
      avatarState: 'EXPLAINING',
    },
    {
      title: '11. Dòng giải thích trạng thái',
      icon: 'code',
      description: 'Mỗi bước thực thi đều kèm giải thích trạng thái (so sánh phần tử nào, hoán vị nào...) hiển thị ngay trên Canvas, giúp bạn bám sát logic thuật toán.',
      highlightSelector: '[data-tour-id="code-ide-canvas"]',
      avatarState: 'EXPLAINING',
    },
    {
      title: '12. Hoàn thành hướng dẫn!',
      icon: 'party-popper',
      description: 'Bạn đã sẵn sàng! Hãy tự tay sửa code, nhập mảng riêng và nhấn RUN để khám phá thuật toán của chính bạn trực quan hóa trên Canvas.',
      avatarState: 'SUCCESS',
    }
  ],
  '/graph': [
    {
      title: '1. Sân chơi Đồ thị & Cây',
      icon: 'graph',
      description: 'Chào mừng đến với Sân chơi Đồ thị. Đây là vùng vẽ vector tự do để bạn thiết lập và trực quan hóa các giải thuật đồ thị.',
      highlightSelector: '[data-tour-id="graph-canvas"]',
      beforeAction: switchToTab1,
      avatarState: 'GREETING',
    },
    {
      title: '2. Chọn Chế độ vẽ đồ thị',
      icon: 'tool',
      description: 'Dùng bảng Mode Bar để chuyển đổi giữa các công cụ vẽ: Di chuyển, + Đỉnh, ↔ Cạnh, ✎ Trọng số, 🗑 Xóa.',
      highlightSelector: '[data-tour-id="graph-tool-select"]',
      beforeAction: switchToTab1,
      avatarState: 'EXPLAINING',
    },
    {
      title: '3. Thêm đỉnh mới (+ Đỉnh)',
      icon: 'plus-circle',
      description: 'Kích hoạt công cụ này và nhấp chuột vào bất cứ đâu trên Canvas để tạo ra các đỉnh (Node) có nhãn tăng dần A, B, C.',
      highlightSelector: '[data-tour-id="graph-tool-add-node"]',
      beforeAction: switchToTab1,
      avatarState: 'SIMULATING',
    },
    {
      title: '4. Vẽ cạnh nối (Cạnh)',
      icon: 'arrows-horizontal',
      description: 'Kích hoạt công cụ này, kéo chuột từ đỉnh này nối sang đỉnh kia để tạo ra các liên kết cạnh (Edge) có hướng hoặc vô hướng.',
      highlightSelector: '[data-tour-id="graph-tool-add-edge"]',
      beforeAction: switchToTab1,
      avatarState: 'SIMULATING',
    },
    {
      title: '5. Gán trọng số cạnh (Trọng số)',
      icon: 'edit-2',
      description: 'Kích hoạt công cụ này, nhấp vào một cạnh để gán giá trị độ dài/chi phí của cạnh phục vụ cho giải thuật Dijkstra.',
      highlightSelector: '[data-tour-id="graph-tool-weight"]',
      beforeAction: switchToTab1,
      avatarState: 'SIMULATING',
    },
    {
      title: '6. Xóa thành phần đỉnh/cạnh (Xóa)',
      icon: 'trash',
      description: 'Chọn công cụ này và click vào đỉnh hoặc cạnh bất kỳ để dọn dẹp phần thừa trên đồ thị của bạn.',
      highlightSelector: '[data-tour-id="graph-tool-delete"]',
      beforeAction: switchToTab1,
      avatarState: 'SIMULATING',
    },
    {
      title: '7. Lực đẩy vật lý Coulomb & Hooke',
      icon: 'atom',
      description: 'Bật/Tắt lực đẩy mô phỏng vật lý. Đồ thị sẽ tự giãn cách đều đặn, phân bổ các đỉnh hài hòa và thẩm mỹ.',
      highlightSelector: '[data-tour-id="physics-toggle"]',
      beforeAction: switchToTab1,
      avatarState: 'SIMULATING',
      actionScript: [
        { type: 'click', targetSelector: '[data-tour-id="physics-toggle"]' }
      ]
    },
    {
      title: '8. Chọn giải thuật duyệt đồ thị',
      icon: 'clipboard-list',
      description: 'Lựa chọn thuật toán bạn muốn chứng kiến: BFS (Duyệt theo chiều rộng), DFS (Chiều sâu), hay Dijkstra (Tìm đường đi ngắn nhất).',
      highlightSelector: '[data-tour-id="graph-algorithm-select"]',
      beforeAction: switchToTab1,
      avatarState: 'EXPLAINING',
    },
    {
      title: '9. Chọn đỉnh nguồn xuất phát',
      icon: 'flag',
      description: 'Chọn đỉnh bắt đầu (Source Node) từ danh sách dropdown để làm điểm khởi hành duyệt đồ thị.',
      highlightSelector: '[data-tour-id="graph-source-node-select"]',
      beforeAction: switchToTab1,
      avatarState: 'EXPLAINING',
    },
    {
      title: '10. Khởi động chạy mô phỏng',
      icon: 'play',
      description: 'Bấm nút Mô phỏng để bắt đầu chạy hoạt ảnh. Các đỉnh sẽ chuyển đổi trạng thái màu sắc theo luồng duyệt giải thuật.',
      highlightSelector: '[data-tour-id="graph-algo-trigger"]',
      beforeAction: switchToTab1,
      avatarState: 'SIMULATING',
    },
    {
      title: '11. Nhập/Xuất dữ liệu đồ thị JSON',
      icon: 'database',
      description: 'Sử dụng tab Import/Export ở thanh bên phải để lưu đồ thị đã thiết kế dưới dạng JSON hoặc nhập các mẫu đồ thị phức tạp có sẵn.',
      highlightSelector: '[data-tour-id="graph-import-label"]',
      beforeAction: switchToTab1,
      avatarState: 'EXPLAINING',
    },
    {
      title: '12. Duyệt bài học lý thuyết nâng cao',
      icon: 'book-open',
      description: 'Chuyển sang tab này để đọc phân tích thuật toán đồ thị, độ phức tạp Big-O và mã giả tương ứng của BFS/DFS.',
      highlightSelector: '[data-tour-id="algo-theory-pane"]',
      beforeAction: switchToTab2,
      avatarState: 'SUCCESS',
    }
  ],
  '/quiz': [
    {
      title: '1. Trắc nghiệm kiến thức nâng cao',
      icon: 'quiz',
      description: 'Chào mừng bạn đến với phân hệ Trắc nghiệm. Nơi giúp bạn kiểm tra và củng cố kiến thức giải thuật và thiết kế.',
      highlightSelector: '.quiz-card-overlay',
      avatarState: 'GREETING',
    },
    {
      title: '2. Thẻ câu hỏi MCQ / True-False',
      icon: 'help-circle',
      description: 'Một ô kính mờ mọc lên ở giữa màn hình chứa câu hỏi lý thuyết hoặc bài tập đọc code gỡ lỗi đệ quy.',
      highlightSelector: '.quiz-card-overlay',
      avatarState: 'EXPLAINING',
    },
    {
      title: '3. Lựa chọn phương án trả lời',
      icon: 'first-steps',
      description: 'Đọc kỹ đề bài và nhấp chọn một trong bốn phương án hiển thị trong lưới đáp án (Grid Options).',
      highlightSelector: '.quiz-options-grid',
      avatarState: 'EXPLAINING',
    },
    {
      title: '4. Xác nhận gửi đáp án',
      icon: 'upload',
      description: 'Bấm nút Gửi câu trả lời để hệ thống thực hiện kiểm định đáp án dựa trên dữ liệu giải thuật.',
      highlightSelector: '.quiz-options-grid',
      avatarState: 'SIMULATING',
    },
    {
      title: '5. Đánh giá màu sắc HSL chính xác',
      icon: 'palette',
      description: 'Nếu đúng, phương án sẽ chuyển màu Xanh Neon Emerald. Nếu sai, đáp án bạn chọn sẽ chuyển màu Đỏ Neon Ruby rực rỡ.',
      highlightSelector: '.quiz-options-grid',
      avatarState: 'EXPLAINING',
    },
    {
      title: '6. Bảng giải thích sư phạm chi tiết',
      icon: 'bulb',
      description: 'Đọc phần phân tích sư phạm chi tiết hiển thị bên dưới để hiểu rõ bản chất tại sao đáp án đó đúng/sai.',
      highlightSelector: '.quiz-explanation-panel',
      avatarState: 'EXPLAINING',
    },
    {
      title: '7. Liên kết đến mã nguồn tham chiếu',
      icon: 'link',
      description: 'Nút tham khảo nhanh trỏ thẳng tới file mã nguồn hoặc dòng pseudocode tương ứng để bạn kiểm chứng nhanh.',
      highlightSelector: '.quiz-explanation-panel',
      avatarState: 'EXPLAINING',
    },
    {
      title: '8. Tích lũy điểm kinh nghiệm XP',
      icon: 'star',
      description: 'Mỗi câu trả lời đúng sẽ cộng điểm XP trực tiếp vào tài khoản của bạn, hiển thị hoạt ảnh hạt sáng bay lên.',
      highlightSelector: '.quiz-card-overlay',
      avatarState: 'SUCCESS',
    },
    {
      title: '9. Hệ thống phần thưởng Medal',
      icon: 'medal',
      description: 'Hoàn thành trọn vẹn một gói câu hỏi mà không sai câu nào để mở khóa Huy chương Vàng danh giá.',
      highlightSelector: '.quiz-card-overlay',
      avatarState: 'SUCCESS',
    },
    {
      title: '10. Theo dõi Bảng xếp hạng Leaderboard',
      icon: 'leaderboard',
      description: 'So sánh điểm tích lũy của bạn với các học viên khác trên toàn bộ hệ thống để lấy động lực tranh đua học tập.',
      highlightSelector: '.quiz-card-overlay',
      avatarState: 'EXPLAINING',
    },
    {
      title: '11. Lịch sử làm bài thi thử',
      icon: 'calendar',
      description: 'Xem lại danh sách các câu hỏi đã làm sai trong quá khứ để ôn tập lại trước khi bước vào kỳ thi thực tế.',
      highlightSelector: '.quiz-card-overlay',
      avatarState: 'EXPLAINING',
    },
    {
      title: '12. Tổng kết lộ trình tự luyện tập',
      icon: 'academic',
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
      title: 'Chào mừng đến với VisualizationDSA!',
      icon: 'party-popper',
      description: 'Hệ thống học tập và trực quan hóa cấu trúc dữ liệu, giải thuật, cùng các nguyên lý thiết kế phần mềm trực sinh động nhất.',
      avatarState: 'GREETING',
    },
    {
      title: 'Chế độ Lý thuyết & Mô phỏng DSA',
      icon: 'chart-bar',
      description: 'Lựa chọn xem Lý thuyết chi tiết (Độ phức tạp, mã giả tiếng Việt) hoặc chuyển sang Mô phỏng tương tác 60 FPS tức thì.',
      highlightSelector: '.dashboard-view-root',
      avatarState: 'EXPLAINING',
    },
    {
      title: 'Trình gỡ lỗi trực quan & Monaco IDE',
      icon: 'monitor',
      description: 'Trải nghiệm viết code thực tế với Monaco Editor, đặt Breakpoint gỡ lỗi dòng code từng bước và theo dõi Call Stack trực tiếp.',
      highlightSelector: '[href="/ide"]',
      avatarState: 'EXPLAINING',
    },
    {
      title: 'Trực quan hóa SOLID OOP',
      icon: 'construction',
      description: 'Mô phỏng sinh động các nguyên lý SOLID (như Liskov Substitution - đà điểu bay, Dependency Inversion - neon flow).',
      highlightSelector: '[href="/solid"]',
      avatarState: 'EXPLAINING',
    },
    {
      title: 'Trắc nghiệm & Bảng thành tích',
      icon: 'trophy',
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
