# ⚠️ Nhật Ký Lỗi Và Sự Cố Thường Gặp - Error Codes & Failover Scenarios

> **⚠️ GHI CHÚ PHỤC HỒI (2026-08-02):** Vùng tail của file này (từ mục "Lỗi 174" trở đi, ~18 entries) đã bị hỏng UTF-16LE từ commit `fa5d844` — byte gốc đã mất vĩnh viễn, chỉ còn các ký tự replacement `U+FFFD` và không thể tự động phục hồi hoàn hảo. Toàn bộ phần phía trên (Lỗi 101 → 173) đã được khôi phục chuẩn 100% bằng script cp1252→UTF-8 reverse (khớp chính xác với phiên bản sạch tại commit `4f8d4c3`). Vùng tail hỏng được giữ nguyên để bảo toàn tối đa nội dung còn đọc được; cần tái tạo thủ công nếu muốn phục hồi đầy đủ.

Tài liệu này tổng hợp các mã lỗi, kịch bản sự cố và cách thức hệ thống tự động phục hồi (Failover) của **VisualizationDSA** nhằm bảo toàn trải nghiệm mượt mà cho sinh viên.

---

## 1. Danh Mục Mã Lỗi & Cách Xử Lý (Error Directory)

### 🚨 Lỗi 101: Phụ Thuộc Vòng Tròn Trong Thùng Chứa (Cyclic Dependency Loop)
*   **Mô tả:** Đăng ký các token dịch vụ trong IoC Container bị vòng lặp chu trình chéo (A -> B -> A).
*   **Mã Lỗi:** `ERR_IOC_CYCLIC_DEPENDENCY`
*   **Phản ứng hệ thống:** DFS cycle detector chặn đứng lập tức đệ quy trước khi sập RAM, ném ra ngoại lệ báo lỗi sập đỏ rực màn hình.
*   **Cách khắc phục:** Học viên cần tách nhỏ interface hoặc sử dụng nguyên lý đảo ngược phụ thuộc (DIP) thông qua lớp trừu tượng trung gian.

### 🚨 Lỗi 102: Va Chạm Đè Nút Đồ Thị Canvas (Vertex Overlapping)
*   **Mô tả:** Học viên click tạo các nút đồ thị ở khoảng cách quá sát nhau làm đè nút mất thẩm mỹ đồ họa.
*   **Mã Lỗi:** `ERR_PLAYGROUND_NODE_OVERLAP`
*   **Phản ứng hệ thống:** Thuật toán đo khoảng cách Euclidean chặn đứng sự kiện sinh node mới nếu khoảng cách nhỏ hơn 50px.
*   **Cách khắc phục:** Click tạo nút ở vị trí thoáng đãng hơn trên màn hình.

### 🚨 Lỗi 103: Sai Định Dạng Mảng Tùy Biến (Custom Input Parse Error)
*   **Mô tả:** Nhập ký tự lạ hoặc mảng trống/quá dài vào hộp nạp Custom Input.
*   **Mã Lỗi:** `ERR_PARSER_INVALID_FORMAT`
*   **Phản ứng hệ thống:** Trình phân dịch `CustomInputParser` từ chối nạp, ném thông báo đỏ chỉ rõ phần tử lỗi dưới **5ms**.
*   **Cách khắc phục:** Nhập đúng định dạng mảng số cách nhau bởi dấu phẩy (Ví dụ: `5, 8, 12, 20`).

---

## 2. Kịch Bản Tự Phục Hồi Khi Gặp Sự Cố (Failover Scenarios)

### 🛡️ Kịch bản 1: Sập nguồn Web Server trong System Design Visualizer
*   **Ngữ cảnh:** Học sinh click đánh sập Server Web đang gánh tải HTTP.
*   **Hành động tự phục hồi:** 
    1.  Kích hoạt máy phun khói Canvas 2D bốc khói xám cuồn cuộn 60 FPS tức khắc dưới **5ms** tại tọa độ Server bị sập.
    2.  Bộ cân bằng tải Load Balancer loại bỏ ngay Server sập khỏi danh sách định tuyến healthy.
    3.  Tải HTTP request được chuyển dịch mượt mà sang Server còn sống bên cạnh dưới **5ms** mà không làm gián đoạn hệ thống.
    4.  Thu hồi sạch hạt khói khỏi RAM khi tan biến.

### 🛡️ Kịch bản 2: Trôi dòng code khi ẩn Tab trình duyệt (rAF Spike Clamping)
*   **Ngữ cảnh:** Học viên đang xem hoạt ảnh và chuyển tab trình duyệt khác, rAF bị ngắt tạm thời, khi quay lại `deltaTime` tăng đột biến gây giật lắc xé hình.
*   **Hành động tự phục hồi:** Bộ scheduler giới hạn đè `clampedDelta = Math.min(deltaTime, 32)` chặn đứng mọi hiện tượng nhảy giật ảnh.

### 🚨 Lỗi 104: Vue Reactive Proxy Không Thể Structured-Clone Qua postMessage (Phase 2)
*   **Mô tả:** Khi gửi `inputArray.value` (một Vue reactive Proxy) qua `worker.postMessage()`, trình duyệt ném lỗi `Failed to execute 'postMessage' on 'Worker': [object Array] could not be cloned.` vì structured clone algorithm không hỗ trợ Proxy objects.
*   **Mã Lỗi:** `ERR_WORKER_POSTMESSAGE_PROXY`
*   **Nguyên nhân gốc:** `inputArray` là `ref<number[]>` trong Pinia store. Dù truy cập `.value`, kết quả vẫn là reactive Proxy — không phải plain Array.
*   **Cách khắc phục:** Spread operator `[...inputArray.value]` để tạo bản sao plain Array trước khi truyền vào `postMessage`. File sửa: `useLiveCompilerStore.ts` dòng 103.

### 🚨 Lỗi 105: __loopCounter Khai Báo Trùng Lặp Trong Web Worker (Phase 2)
*   **Mô tả:** Khi thực thi code đã tiêm vết bên trong Web Worker, lỗi runtime `Identifier '__loopCounter' has already been declared` xảy ra vì biến `__loopCounter` được khai báo hai lần: một lần bởi `ASTInstrumentationEngine` (prepend `let __loopCounter = 0;`) và một lần bởi `new Function('...', '__loopCounter', code)` (parameter binding).
*   **Mã Lỗi:** `ERR_WORKER_DUPLICATE_DECLARATION`
*   **Nguyên nhân gốc:** `buildWorkerScript()` truyền `__loopCounter` làm tham số thứ 4 của `new Function()`, đồng thời `compileAndInstrument()` đã prepend `let __loopCounter = 0;` vào đầu mã nguồn đã sinh. Khi cả hai tồn tại trong cùng scope, JavaScript ném lỗi khai báo trùng.
*   **Cách khắc phục:** Loại bỏ `__loopCounter` khỏi danh sách tham số `new Function()` trong `WorkerLifecycleCoordinator.ts`, vì biến đã được khai báo nội bộ bởi mã nguồn đã tiêm vết.

### 🚨 Lỗi 106: Hàm FunctionDeclaration Không Được Gọi Trong Web Worker (Phase 2)
*   **Mô tả:** Mã nguồn đã tiêm vết chỉ khai báo hàm `function bubbleSort(arr) { ... }` mà không bao giờ gọi nó. Khi `new Function('arr', 'traceCompare', 'traceAssign', code)` thực thi, thân hàm chỉ khai báo `bubbleSort` rồi kết thúc — không có lời gọi `bubbleSort(arr)`. Kết quả: chỉ 1 frame ACCESS (trạng thái cuối) mà không có COMPARE/SWAP trace nào.
*   **Mã Lỗi:** `ERR_AST_FUNCTION_NOT_INVOKED`
*   **Nguyên nhân gốc:** `compileAndInstrument()` chỉ tiêm tracing vào bên trong hàm mà không thêm lời gọi hàm cuối chương trình. Worker wraps code trong `new Function(...)` nên cần lời gọi tường minh.
*   **Cách khắc phục:** Thêm hàm `appendAutoInvoke()` vào `ASTInstrumentationEngine.ts`. Hàm này tìm `FunctionDeclaration` đầu tiên ở top-level AST body và append `functionName(arr);` vào cuối chương trình. File sửa: `ASTInstrumentationEngine.ts` dòng 60-78.

### 🚨 Lỗi 107: Lực Hút Lò Xo Hooke Tính Sai Hướng Cho Trọng Số Khác Nhau (Edge Weight Physics)
*   **Mô tả:** Lực hút của các cạnh có trọng số nặng lại yếu hơn các cạnh có trọng số nhẹ, dẫn đến việc dàn xếp layout đồ thị bị sai logic vật lý (đáng lẽ cạnh nặng phải kéo 2 node sát nhau hơn).
*   **Mã Lỗi:** `ERR_FD_LAYOUT_WEIGHTED_ATTRACTION`
*   **Nguyên nhân gốc:** `ForceDirectedLayout.ts` nhân hệ số ideal length (chiều dài lý tưởng) của lò xo với `weightFactor`, làm tăng `idealLength` cho cạnh nặng. Điều này làm giảm `displacement = distance - idealLength`, từ đó làm giảm lực hút Hooke `force = kAttraction * displacement * weightFactor;`. File sửa: `ForceDirectedLayout.ts` dòng 88-94.

### 🚨 Lỗi 115: Lỗi Import Mismatch Các Kiểu Dữ Liệu Gamification (TS2614 Member Export Mismatch)
*   **Mô tả:** Biên dịch lỗi `error TS2614: Module '"./XPEngine"' has no exported member 'UserProgress'` trong `src/features/gamification/index.ts`.
*   **Mã Lỗi:** `ERR_TS2614_XPENDING_EXPORT_MISMATCH`
*   **Nguyên nhân gốc:** `index.ts` xuất khẩu các types `UserProgress`, `Badge`, `LevelConfig`, `XPEvent`, `EmbedConfig` trực tiếp từ `./XPEngine` sau khi các types này đã được chuyển dịch hoàn toàn sang `./xpConfig` nhằm phục vụ việc phân rã/tối giản dòng mã nguồn cho `XPEngine.ts` để đạt giới hạn dưới 100 dòng.
*   **Cách khắc phục:** Cập nhật `index.ts` để xuất khẩu các interfaces đó trực tiếp từ `./xpConfig` thay vì `./XPEngine`.

### 🚨 Lỗi 108: Thư Viện Asp.Versioning.Mvc Phiên Bản 10.0.0 Không Tương Thích Với .NET 9
*   **Mô tả:** Lỗi restore project và lỗi biên dịch do mismatch target framework khi cài đặt gói NuGet `Asp.Versioning.Mvc` và `Asp.Versioning.Mvc.ApiExplorer`.
*   **Mã Lỗi:** `ERR_NET_VERSION_MISMATCH`
*   **Nguyên nhân gốc:** NuGet tự động tải phiên bản v10.0.0 mới nhất yêu cầu .NET 10, trong khi dự án hiện tại target .NET 9.0.
*   **Cách khắc phục:** Hạ cấp và định nghĩa rõ ràng phiên bản `8.1.0` (tương thích hoàn hảo với .NET 9) trong [WebApi.csproj](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/backend/src/WebApi/WebApi.csproj).

### 🚨 Lỗi 109: Cảnh Báo Obsolete Của UseXminAsConcurrencyToken() Trong EF Core
*   **Mô tả:** Cảnh báo biên dịch CS0618 khi sử dụng phương thức cũ `UseXminAsConcurrencyToken()` cho Optimistic Concurrency Control.
*   **Mã Lỗi:** `ERR_EF_OBSOLETE_CONCURRENCY_TOKEN`
*   **Nguyên nhân gốc:** EF Core và Npgsql đã thay đổi cách đăng ký concurrency token hệ thống (xmin) và đánh dấu phương thức cũ là lỗi thời.
*   **Cách khắc phục:** Chuyển đổi cấu hình thủ công qua shadow property `xmin` dạng `.IsConcurrencyToken()` trong [ApplicationDbContext.cs](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/backend/src/Infrastructure/Data/ApplicationDbContext.cs).

### 🚨 Lỗi 110: Lỗi Phân Giải Host=localhost Trên Windows (Npgsql Connection Fail)
*   **Mô tả:** Khi khởi động WebApi backend, EF Core ném ngoại lệ `SocketException: No such host is known` tại hàm `databaseFacade.Migrate()`.
*   **Mã Lỗi:** `ERR_DB_LOCALHOST_RESOLVE_FAIL`
*   **Nguyên nhân gốc:** Trình điều khiển cơ sở dữ liệu Npgsql không phân giải được hostname `localhost` sang địa chỉ IP loopback trên một số cấu hình Windows (đặc biệt khi IPv6 được ưu tiên hoặc DNS local bị ngắt).
*   **Cách khắc phục:** Thay thế `Host=localhost` thành địa chỉ IP tĩnh rõ ràng `Host=127.0.0.1` trong [appsettings.json](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/backend/src/WebApi/appsettings.json) và [appsettings.Development.json](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/backend/src/WebApi/appsettings.Development.json). Lực chọn này bỏ qua việc phân giải DNS và kết nối trực tiếp đến IPv4 loopback của PostgreSQL local.

### 🚨 Lỗi 111: Lỗi Thiếu Hàm getStoredToken Khi Chạy Kiểm Thử Cây Lộ Trình (TypeError: getStoredToken is not a function)
*   **Mô tả:** Khi chạy unit test cho store `learning-path` (`useLearningPathStore.spec.ts`), Vitest ném lỗi runtime `TypeError: getStoredToken is not a function` tại computed property `isOnlineMode = computed(() => !!getStoredToken())`.
*   **Mã Lỗi:** `ERR_API_CLIENT_COMPATIBILITY_MISSING_EXPORTS`
*   **Nguyên nhân gốc:** `apiClient.ts` ở nhánh fork export các helper functions như `getStoredToken` và `getStoredRefreshToken` dùng để kiểm tra trực tiếp trạng thái token ngoại tuyến. Khi trộn thủ công và tái cấu trúc bảo mật API Client kết hợp với Pinia store secure token memory-only, chúng ta bỏ sót không khai báo (export) các helper này khiến store import lỗi.
*   **Cách khắc phục:** Cập nhật [apiClient.ts](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/services/apiClient.ts) để khai báo đầy đủ các helper functions. Đồng thời tối ưu hóa `getStoredToken` bằng cách kiểm tra ngữ cảnh Pinia hoạt động `getActivePinia()`, cho phép đọc Access Token từ `useAuthStore` động an toàn mà không gây ra lỗi khởi tạo Pinia ngoài ngữ cảnh trong môi trường kiểm thử unit tests.

### 🚨 Lỗi 112: Lỗi Import Sai Đường Dẫn CustomInputParser Và ForceDirectedLayout (Phase 2 Import Mismatch)
*   **Mô tả:** Khi truy cập vào tab Sorting, hệ thống gặp lỗi runtime và không thể load route: `TypeError: Failed to fetch dynamically imported module: http://localhost:5173/src/views/SortingView.vue`.
*   **Mã Lỗi:** `ERR_IMPORT_RELATIVE_MISMATCH`
*   **Nguyên nhân gốc:** Sau khi trộn code thủ công từ nhánh fork, các file composables `useInputValidation.ts` và `useGraphPlayground.ts` vẫn tham chiếu tới `../CustomInputParser` và `../ForceDirectedLayout` thay vì đi vào thư mục con `../engine/CustomInputParser` và `../engine/ForceDirectedLayout` do sự thay đổi về cấu trúc thư mục FSD (Feature-Sliced Design) trong dự án chính.
*   **Cách khắc phục:** Sửa đổi đường dẫn import trong `useInputValidation.ts` thành `../engine/CustomInputParser`, và trong `useGraphPlayground.ts` thành `../engine/CustomInputParser` và `../engine/ForceDirectedLayout`.

### 🚨 Lỗi 113: Trùng Khớp Kiểu showToast Trình Báo Lỗi Cho Component Vue (TS2322 Toast Type Mismatch)
*   **Mô tả:** Biên dịch lỗi `error TS2322: Type 'string' is not assignable to type '"error" | "success" | "info"'` trong `InteractivePlayground.vue`.
*   **Mã Lỗi:** `ERR_TS2322_TOAST_TYPE_MISMATCH`
*   **Nguyên nhân gốc:** Biến `type` trong `showToast` gán giá trị mặc định là `'info'` không ép kiểu cụ thể nên TypeScript tự nhận diện kiểu dữ liệu rộng hơn là `string`, gây xung đột với Union type nghiêm ngặt của component.
*   **Cách khắc phục:** Định nghĩa rõ ràng kiểu dữ liệu cho tham số đầu vào trong chữ ký hàm: `type: 'info' | 'error' | 'success' = 'info'`.

### 🚨 Lỗi 114: Thuộc Tính Tham Số Constructor Bị Cấm (TS1294 Parameter Property Restriction)
*   **Mô tả:** Biên dịch lỗi `error TS1294: This syntax is not allowed when 'erasableSyntaxOnly' is enabled` trong `UnifiedPlaybackCoordinator.ts`.
*   **Mã Lỗi:** `ERR_TS1294_ERASABLE_SYNTAX_ONLY`
*   **Nguyên nhân gốc:** Trình cấu dịch dự án bật tùy chọn `erasableSyntaxOnly` (chỉ cho phép các cú pháp TS dễ dàng xóa bỏ khi chuyển sang JS sạch). Constructor parameter properties (`constructor(private leftStore...)`) phát sinh mã runtime bổ sung ở JS nên bị chặn.
*   **Cách khắc phục:** Đổi sang khai báo các trường dữ liệu riêng biệt và gán giá trị tường minh trong thân hàm constructor.

### 🚨 Lỗi 116: Lỗi Test Timeout Do Fetch Không Được Mock Trong useInputStore Test
*   **Mô tả:** Chạy kiểm thử cho `useInputStore.spec.ts` bị timeout sau 5000ms ở test case "uses dummy fallback when API is unreachable".
*   **Mã Lỗi:** `ERR_TEST_FETCH_TIMEOUT`
*   **Nguyên nhân gốc:** Hàm `submitCustomInput` trong store `useInputStore.ts` gọi fetch thực tế đến URL `API_BASE` when không được mock trong môi trường kiểm thử. Không có máy chủ local phản hồi trong test runner khiến fetch bị treo và test case bị timeout quá giới hạn 5000ms của Vitest.
*   **Cách khắc phục:** Import `vi` từ `vitest` và gọi `vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'))` trong test case tương ứng để giả lập lỗi kết nối mạng ngay lập tức, đồng thời thêm `vi.restoreAllMocks()` trong `beforeEach` để tránh ảnh hưởng đến các test case khác.

### 🚨 Lỗi 117: Thiếu VCR Control Panel Trên Giao Diện Sorting (Sorting Animation Stuck)
*   **Mô tả:** Giao diện Sorting khi mở lên chỉ hiển thị cột mảng tĩnh, không thể phát animation, không chạy phím tắt Space/Arrow, cũng không phản hồi khi bấm nút đổi thuật toán (đồ thị không chạy).
*   **Mã Lỗi:** `ERR_SORTING_ANIMATION_STUCK`
*   **Nguyên nhân gốc:** Giao diện `SortingView.vue` chỉ mount component hiển thị `ArrayBarVisualizer.vue` mà bỏ sót component điều khiển `VcrControlPanel.vue` của module `vcr-player`. Do đó, trạng thái hoạt cảnh trong `useVcrStore.ts` luôn ở frame 0 (`isPlaying = false`) và không có nút bấm nào để kích hoạt luồng phát hoặc đăng ký trình lắng nghe bàn phím.
*   **Cách khắc phục:** Import và mount `VcrControlPanel` từ `@/features/vcr-player` trực tiếp vào bên dưới `ArrayBarVisualizer` trong `SortingView.vue` với layout `flex-col` và căn chỉnh lề hợp lý.

### 🚨 Lỗi 118: Cột Giao Diện Sorting Cũ Quá Hẹp Và Trống Trải (Sorting Widescreen Layout Waste)
*   **Mô tả:** Giao diện Sorting bị giới hạn bởi `max-w-3xl`, để lại khoảng trống lớn ở hai bên trên màn hình rộng của PC/Tablet, đồng thời cách bố trí xếp thẳng đứng không tối ưu không gian chiều ngang.
*   **Mã Lỗi:** `ERR_SORTING_LAYOUT_COMPACT_WASTE`
*   **Nguyên nhân gốc:** Class `max-w-3xl mx-auto flex-col` trong `SortingView.vue` là tàn dư của thiết kế di động ban đầu, chưa được nâng cấp thành layout đa cột responsive.
*   **Cách khắc phục:** Chuyển đổi `SortingView.vue` sang layout hai cột responsive sử dụng `flex-col lg:flex-row gap-4 p-4 max-w-[1600px] mx-auto w-full h-full`, phân bổ tỉ lệ 65% độ rộng cho Canvas hiển thị (`ArrayBarVisualizer`) và 35% độ rộng cho bảng điều khiển (`VcrControlPanel`), giúp đồng bộ thiết kế trực quan giống các màn hình IDE khác.

### 🚨 Lỗi 119: Cột Biểu Diễn Bubble Sort Quá Nhỏ Do Sập Chiều Cao (Bubble Sort Bar Height Collapse)
*   **Mô tả:** Các cột biểu diễn trong Bubble Sort Visualizer bị co lại thành các viên thuốc dẹt sát đáy thay vì chiếm toàn bộ chiều cao của container.
*   **Mã Lỗi:** `ERR_BUBBLE_SORT_BAR_COLLAPSE`
*   **Nguyên nhân gốc:** Container `div` của từng phần tử mảng (được tạo bởi `v-for` trong `<transition-group>`) không khai báo thuộc tính chiều cao (`h-full`). Do đó, chiều cao của container này là `auto` (chỉ bao gồm chiều cao chữ), dẫn đến việc chiều cao phần trăm của thanh cột con (`height: X%`) không thể phân giải được và bị sập về `minHeight: 32px`.
*   **Cách khắc phục:** Thêm class `h-full` vào container `div` của `v-for` trong `BubbleSortVisualizer.vue` để thiết lập chiều cao 100% theo `<transition-group>`, giúp phần trăm chiều cao của thanh cột con được hiển thị chính xác dựa trên giá trị của phần tử.

### 🚨 Lỗi 120: VcrControlPanel Bị Kéo Giãn Dài Tạo Khoảng Trắng Lớn Bên Phải (VcrControlPanel Empty Space Stretch)
*   **Mô tả:** Trong giao diện Sorting View, VcrControlPanel bị kéo giãn dài xuống sát đáy màn hình tạo ra một vùng đen trống trải lớn bên dưới các nút điều khiển.
*   **Mã Lỗi:** `ERR_VCR_CONTROL_PANEL_STRETCH`
*   **Nguyên nhân gốc:** Thùng chứa cha `<section>` sử dụng bố cục flex-row nhưng không định nghĩa thuộc tính `align-items`, dẫn đến mặc định là `items-stretch`. Khi đó, `VcrControlPanel` (mặc dù có class `h-fit`) bị ép buộc kéo giãn chiều cao theo `ArrayBarVisualizer` vốn chiếm toàn bộ chiều cao màn hình.
*   **Cách khắc phục:** Thêm class `lg:self-start` vào `VcrControlPanel` trong `SortingView.vue`. Điều này cấu hình cho panel tự căn chỉnh theo vị trí bắt đầu (top) trên màn hình lớn thay vì co giãn, giữ nguyên chiều cao tự nhiên của panel và loại bỏ hoàn toàn khoảng trắng dư thừa.

### 🚨 Lỗi 121: Phông Chữ Trực Quan Hóa Mảng Không Đồng Bộ Với Hệ Thống (Outfit Font Mismatch)
*   **Mô tả:** Chữ số trên các cột mảng trực quan và tên các con trỏ vòng lặp hiển thị sai phông chữ (sử dụng phông 'Outfit') so với phông chữ 'Inter' chuẩn hệ thống.
*   **Mã Lỗi:** `ERR_SORTING_FONT_MISMATCH`
*   **Nguyên nhân gốc:** Hàm vẽ canvas `renderArrayBar` và `renderLoopPointer` thiết lập font vẽ cứng có chứa phông chữ '"Outfit"', trong khi hệ thống không nạp phông chữ này làm phông chữ chính.
*   **Cách khắc phục:** Thay thế chuỗi định nghĩa font `'bold 18px "Outfit", "Inter", sans-serif'` và `'bold 11px "Outfit", "Inter", sans-serif'` thành phông chữ chuẩn hệ thống `'Inter', sans-serif` trong `renderArrayBar.ts` và `renderLoopPointer.ts`.

### 🚨 Lỗi 122: Thanh Cột Trực Quan Hóa Mảng Quá Hẹp Trên Màn Hình Rộng (Array Bar Width Narrow Waste)
*   **Mô tả:** Các thanh cột biểu diễn giá trị phần tử mảng và các nút trong các giải thuật Heap/Radix/Merge/Quick Sort có kích thước quá nhỏ, tạo khoảng trống lớn vô ích trên màn hình rộng của máy tính.
*   **Mã Lỗi:** `ERR_SORTING_BAR_NARROW_WASTE`
*   **Nguyên nhân gốc:** Các biến chiều rộng `barWidth`, `itemSize` và khoảng cách `itemGap` được tính toán với giá trị cứng quá nhỏ (ví dụ `48px`, `52px`) vốn tối ưu cho màn hình di động nhưng quá hẹp trên màn hình máy tính lớn.
*   **Cách khắc phục:** Tăng kích thước rộng và chiều cao động của các cột biểu diễn trong 5 visualizers (`BubbleSortVisualizer`, `QuickSortVisualizer`, `MergeSortVisualizer`, `HeapSortVisualizer`, `RadixSortVisualizer`) (ví dụ từ `52px` lên `88px`, từ `48px` lên `80px` cho mảng nhỏ) để lấp đầy không gian hiển thị và tăng tính thẩm mỹ trực quan.

### 🚨 Lỗi 123: Khoảng Trống Lớn Trong Tab Quick Sort (Quick Sort Tab Empty Space Waste)
*   **Mô tả:** Tab Quick Sort chứa quá nhiều khoảng trống màu đen không sử dụng ở phần dưới của Canvas Viewport trên các màn hình máy tính lớn.
*   **Mã Lỗi:** `ERR_QUICK_SORT_EMPTY_WASTE`
*   **Nguyên nhân gốc:** Bố cục ban đầu của Quick Sort chỉ hiển thị hàng mảng chính và hàng các phân đoạn con xếp theo chiều ngang, có tổng chiều cao thấp (~200px) trong khi khung chứa Viewport có chiều cao co giãn lớn (~500px+), tạo ra khoảng trống thừa thãi lớn.
*   **Cách khắc phục:**
    1. Thiết kế lại phần dưới của `QuickSortVisualizer.vue` thành một Dashboard chia làm 2 cột: **Lomuto Partition Inspector** và **Partition Stack**.
    2. Áp dụng cơ chế Flexbox `flex-1 min-h-0` cho thùng chứa Dashboard và các danh sách bên trong (`LomutoInspector` và `PartitionStack`) để chúng tự động co giãn kéo dài lấp đầy 100% chiều cao thừa còn lại của viewport.
    3. Tách nhỏ `QuickSortVisualizer.vue` thành 2 sub-components con `LomutoInspector.vue` và `PartitionStack.vue` để tối ưu hóa cấu trúc code, tăng khả năng bảo trì.

### 🚨 Lỗi 124: Thiếu Minh Họa Chia Để Trị Trực Quan Trong Merge Sort (Merge Sort UX Recursion Deficiency)
*   **Mô tả:** Trực quan hóa Merge Sort trước đây chỉ hiển thị mảng chính và một danh sách stack phẳng mờ nhạt, khiến người dùng không thể thấy cấu trúc cây đệ quy chia đôi mảng hoặc sự khác biệt rõ rệt giữa hai pha chia (Split) và gộp (Merge).
*   **Mã Lỗi:** `ERR_MERGE_SORT_UX_DEFICIENCY`
*   **Nguyên nhân gốc:** Thuật toán đệ quy Merge Sort có bản chất là phân rã mảng thành cây nhị phân (Recursion Tree), nhưng thiết kế cũ chỉ hiển thị các phân đoạn theo dạng stack dọc phẳng, không căn chỉnh vị trí ngang (`left`, `width`) tương ứng với vị trí thực tế của mảng cha, gây mất phương hướng dòng chảy thuật toán.
*   **Cách khắc phục:**
    1. Thiết kế lại `MergeSortVisualizer.vue` để hiển thị cây đệ quy hoàn chỉnh (Recursion Tree). Các node con ở cấp độ sâu hơn được căn chỉnh vị trí ngang chính xác theo tỷ lệ phần trăm (`left`, `width`) của phân đoạn cha mà chúng được chia ra.
    2. Tạo sub-component mới `MergeInspector.vue` gắn ở góc phải/dưới để theo dõi chi tiết pha so sánh từng phần tử `L[i]` và `R[j]` và quá trình ghi đè mảng chính tại con trỏ `k`.
    3. Thêm banner kể chuyện (storytelling subtitle) chỉ rõ trạng thái đệ quy (Split hay Merge), đồng thời đánh dấu nhãn mức độ đệ quy (Level 0, 1, 2...) ở cạnh trái để tăng tính trực quan.

### 🚨 Lỗi 125: Hoạt Ảnh Trộn Merge Sort Bị Khựng Và Bỏ Sót Tầng Cơ Sở (Merge Sort Stuttering & Leaf Base Case Skip)
*   **Mô tả:** 
    1. Hoạt ảnh chuyển đổi giá trị (swap/overwrite) trong cây đệ quy của Merge Sort bị khựng, xé hình và nhảy loạn xạ khi ghi đè phần tử.
    2. Tiến trình đệ quy không thể hiện việc đi xuống tầng cơ sở (tầng chứa các mảng con 1 phần tử - Tầng 3), mà nhảy trực tiếp từ việc chia đoạn ở tầng 2 sang trộn các phần tử.
*   **Mã Lỗi:** `ERR_MERGE_SORT_STUTTER_AND_SKIP`
*   **Nguyên nhân gốc:**
    1. Trong component `MergeSortVisualizer.vue`, thẻ `<transition-group>` sử dụng khóa động `:key="getItemAt(sub.start + idx - 1)?.id"`. Khi giá trị mảng bị ghi đè, `enrichFramesWithIds` thay đổi ID của phần tử theo giá trị mới, khiến Vue hiểu sai thứ tự phần tử bị hủy/tạo mới và sinh hoạt ảnh dịch chuyển lỗi.
    2. Trong `mergeSort.ts`, điều kiện dừng đệ quy `if (left >= right) return` lập tức trả về mà không phát (`emit`) bất kỳ frame trạng thái nào cho các mảng con kích thước 1, làm biến mất bước trực quan tại tầng cơ sở.
*   **Cách khắc phục:**
    1. Thay thế khóa `:key` của các phần tử trong cây thành chỉ số mảng ổn định `sub.start + idx - 1`. Điều này giúp Vue tái sử dụng DOM node cũ khi giá trị thay đổi, đồng thời áp dụng hiệu ứng chuyển đổi mượt mà.
    2. Thêm lớp hoạt ảnh tùy biến `@keyframes pop-flash` và lớp CSS `.animate-pop-flash` để tạo hiệu ứng phình to (`scale(1.12)`) và phát sáng khi ghi đè.
    3. Cập nhật hàm `mergeSort` trong `mergeSort.ts` phát một frame trạng thái khi đạt `left >= right` để làm nổi bật (active) mảng con đơn tử ở tầng dưới cùng.
    4. Cải thiện lớp phủ subarray (`getSubarrayClass` và `getItemClass`) để highlight nổi bật màu hổ phách (Amber) cho các phần tử so sánh thuộc mảng con đang trộn (`isChildOfActive`).

### 🚨 Lỗi 126: Các Tầng Của Cây Đệ Quy Merge Sort Bị Co Rút Và Đè Lên Nhau (Merge Sort Recursion Tree Height Collapse)
*   **Mô tả:** Các tầng của cây đệ quy trong `MergeSortVisualizer.vue` (Tầng 0, Tầng 1, Tầng 2, Tầng 3) bị co rút chiều cao đột ngột và đè lên nhau, làm các hộp phần tử mảng và đường kẻ phân chia cắt chéo lung tung.
*   **Mã Lỗi:** `ERR_MERGE_SORT_TREE_COLLAPSE`
*   **Nguyên nhân gốc:** Mỗi tầng mảng được bọc trong một container `div` có chiều cao cố định `h-[96px]`. Tuy nhiên, vì container cha có thuộc tính `flex flex-col` và không gian dọc hạn chế, các phần tử con mặc định có `flex-shrink: 1` sẽ tự động bị co rút kích thước xuống dưới 96px để ép vừa khung hiển thị, gây ra tràn nội dung và đè chồng lên nhau.
*   **Cách khắc phục:** Thêm class `shrink-0` (thiết lập `flex-shrink: 0`) vào container của từng tầng đệ quy trong `MergeSortVisualizer.vue` để đảm bảo chúng luôn duy trì chiều cao thiết kế `96px` và kích hoạt thanh cuộn dọc `overflow-y-auto` của container cha khi cần thiết.

### 🚨 Lỗi 127: Các Tầng Của Cây Đệ Quy Merge Sort Vẫn Bị Đè Lên Nhau Do Container Tree View Bị Flex Co Rút (Merge Sort Recursion Tree Parent Flex Collapse)
*   **Mô tả:** Mặc dù đã thêm `shrink-0` vào từng tầng, các tầng của cây đệ quy trong `MergeSortVisualizer.vue` vẫn tiếp tục bị đè lên nhau theo chiều dọc trên trình duyệt, không hiển thị thanh cuộn dọc riêng biệt.
*   **Mã Lỗi:** `ERR_MERGE_SORT_TREE_FLEX_COLLAPSE`
*   **Nguyên nhân gốc:** Container cha bọc cây đệ quy (`Tree View`) sử dụng class `flex-[60] min-h-0` và không có `shrink-0`. Khi chiều cao toàn cục của `MergeSortVisualizer` bị giới hạn (do Canvas container bên ngoài), và component `MergeInspector` ở dưới có `shrink-0` chiếm hết không gian dọc (khoảng 350px+), flex engine buộc phải co rút chiều cao của `Tree View` về `0px`. Vì các tầng con có chiều cao cố định `96px` và không có `overflow-hidden` ở tầng, chúng tràn ra ngoài container 0px đó và hiển thị chồng chéo lên nhau tại cùng một tọa độ hiển thị.
*   **Cách khắc phục:** Loại bỏ phân phối tỷ lệ `flex-[60] min-h-0` của `Tree View` và `flex-[40] min-h-0` của `Merge Inspector`, đồng thời gỡ bỏ `overflow-y-auto` trên `Tree View`. Thiết lập class `shrink-0` cho cả hai container này để chúng hiển thị theo chiều cao tự nhiên. Nhờ vậy, container gốc của `MergeSortVisualizer` (đã có class `overflow-y-auto`) sẽ tự động quản lý thanh cuộn dọc duy nhất mượt mà cho toàn bộ giao diện, tránh hiện tượng co rút và chồng lấn.










### 🚨 Lỗi 128: Lệch Mũi Tên Chỉ Hộp Và Giật Hoạt Ảnh Thu Hoạch Radix Sort (Radix Sort Arrow Misalignment & Collect Animation Stutter)
*   **Mô tả:** Mũi tên SVG bị lệch nhẹ so với tâm ô/bucket do chênh lệch CSS grid gap/flexbox padding. Hoạt ảnh thu hoạch từ bucket về mảng bị giật ngang và xé hình.
*   **Mã Lỗi:** `ERR_RADIX_ARROW_MISALIGN_STUTTER`
*   **Nguyên nhân gốc:**
    1. Việc tính tọa độ theo công thức tỷ lệ `(idx + 0.5) / n` bỏ qua kích thước của các khoảng trống gap khác nhau trong Grid và Flexbox.
    2. Việc trượt các phần tử mảng chưa thu hoạch ở cuối mảng tạo ra hiệu ứng chuyển động ngang không mong muốn của `transition-group`.
*   **Cách khắc phục:**
    1. Đo tọa độ pixel thực tế của các ô đang active bằng `getBoundingClientRect()` rồi map ngược lại scale `0..1000`.
    2. Che mặt nạ các phần tử chưa thu hoạch dưới dạng các ô trống nét đứt (placeholder) để cố định cột và chỉ tiết lộ giá trị dần dần khi thu hồi từ bucket.

### 🚨 Lỗi 129: Lỗi Hardcode Bubble Sort Cho Counting/Bucket Sort (Sorting detail HUD title bug)
*   **Mô tả:** Khi chọn giải thuật Counting Sort hoặc Bucket Sort trong tab Sandbox, giao diện HUD Info bên phải luôn hiển thị cứng tên "Sắp xếp nổi bọt (Bubble Sort)" thay vì hiển thị tên và mô tả đúng giải thuật.
*   **Mã Lỗi:** `ERR_HUD_HARDCODED_ALGORITHM_METADATA`
*   **Nguyên nhân gốc:** `SortingDetailPanel.vue` chỉ định nghĩa metadata độ phức tạp cho 5 thuật toán cơ bản (`bubble`, `quick`, `merge`, `heap`, `radix`). Khi gặp giá trị `counting` hoặc `bucket`, hàm fallback `algoMetadata[algo] || algoMetadata.bubble` tự động trả về metadata của Bubble Sort.
*   **Cách khắc phục:** Cập nhật `algoMetadata` trong `SortingDetailPanel.vue` bổ sung đầy đủ metadata học thuật chi tiết cho cả `counting` và `bucket`, đồng thời xây dựng các live variable template hiển thị riêng biệt thông tin chi tiết từng pha cho 2 thuật toán này.


### 🚨 Lỗi 130: Lỗi Mismatch Catalog Khi Chạy So Sánh Thuật Toán (Compare Algorithms Store Test Failure)
*   **Mô tả:** Bộ kiểm thử `useCompareAlgorithmsStore.spec.ts` bị lỗi fail 6 test cases do không thể phân giải tên thuật toán `bubble-sort` / `selection-sort` và không sinh được frame nào (chỉ có 1 frame fallback).
*   **Mã Lỗi:** `ERR_COMPARE_STORE_CATALOG_MISMATCH`
*   **Nguyên nhân gốc:** `useCompareAlgorithmsStore.ts` sử dụng `ALGORITHM_CATALOG` của `dsa-modules` vốn chỉ giới hạn 10 thuật toán searching/tree/stack-queue để tuân thủ kiểm thử nghiêm ngặt. Khi chạy so sánh thuật toán sắp xếp (sorting), hệ thống không phân giải được tên và độ phức tạp, đồng thời `dummyGenerators.ts` không đăng ký các máy phát hoạt ảnh sorting.
*   **Cách khắc phục:** 
    1. Trả lại `ALGORITHM_CATALOG` về đúng 10 phần tử gốc để bảo toàn 100% kết quả cho `dsa-modules` test suite.
    2. Đăng ký đầy đủ 5 thuật toán sắp xếp (`bubble-sort`, `selection-sort`, `insertion-sort`, `quick-sort`, `merge-sort`) vào `GENERATORS` của [dummyGenerators.ts](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/dsa-modules/services/dummyGenerators.ts).
    3. Định nghĩa một bảng tra cứu cục bộ `SORTING_ALGS` ngay trong [useCompareAlgorithmsStore.ts](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/compare-algorithms/store/useCompareAlgorithmsStore.ts) để phân giải thông tin sorting một cách độc lập và an sau.

### 🚨 Lỗi 131: Lệch Bố Cục Và Render Mảng Sai Trên Giao Diện Graph Sandbox (Graph Sandbox Array Render Bug)
*   **Mô tả:** Trong giao diện Graph Sandbox, khung Viewport bên trái hiển thị thanh biểu đồ mảng (Array Bar) của thuật toán sắp xếp thay vì hiển thị đồ thị tương tác, đồng thời bảng nhập dữ liệu tùy biến ở bên phải hiển thị dư thừa tab vẽ đồ thị nhỏ.
*   **Mã Lỗi:** `ERR_GRAPH_SANDBOX_ARRAY_RENDER_MISMATCH`
*   **Nguyên nhân gốc:** `GraphView.vue` trước đó sử dụng component `AlgorithmCanvas` (vốn được thiết kế cứng để vẽ các cột mảng sắp xếp dựa trên `vcrStore`) và `CustomInputPanel` (có chứa tab vẽ đồ thị mini `GraphPlayground`). Điều này tạo ra sự lệch pha nghiêm trọng giữa viewport chính và bảng điều khiển dữ liệu.
*   **Cách khắc phục:**
    1. Thay thế `AlgorithmCanvas` trên viewport trái bằng component đồ thị tương tác cao cấp `InteractivePlayground` lấy từ `features/interactive-playground`.
    2. Loại bỏ hoàn toàn tab switcher và canvas vẽ mini trong `CustomInputPanel.vue` để chỉ giữ lại giao diện nạp văn bản `TextDataInput` tinh gọn ở cột bên phải.
    3. Xây dựng cơ chế đồng bộ hóa 2 chiều (Bidirectional Watchers) trong `CustomInputPanel.vue` giữa chuỗi adjacency list (`graphInputText`) và Pinia store `usePlaygroundStore` (quản lý tọa độ đỉnh và liên kết lò xo vật lý), giúp việc vẽ trên canvas trái lập tức cập nhật văn bản ở cột phải và ngược lại.
    4. Gỡ bỏ Sandbox độc lập khỏi sidebar trong [appTabs.ts](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/appTabs.ts) và [routes.ts](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/router/routes.ts) để hợp nhất hoàn toàn vào trang Graph.

### 🚨 Lỗi 132: Gói Tin Mạng Lướt Qua Màn Hình Trong 2 Frame (~32ms) — System Design Viz (BUG-SD-4)
*   **Mô tả:** Trong `SystemDesignWorkspace.vue`, vòng lặp mô phỏng rAF tính `delta = time - lastTime` trả về giá trị tính bằng mili-giây (~16ms/frame). Giá trị này được truyền thẳng vào `store.tickEngine(delta)` rồi nhân với `PACKET_SPEED = 0.05`, khiến `progress += 16 * 0.05 = 0.8` mỗi frame. Kết quả: gói tin đạt `progress >= 1.0` sau chỉ 2 frame (~32ms), di chuyển quá nhanh để mắt người quan sát kịp nhìn thấy.
*   **Mã Lỗi:** `ERR_SYSDESIGN_DELTA_UNIT_MISMATCH`
*   **Nguyên nhân gốc:** `performance.now()` trả về mili-giây nhưng công thức `p.progress += deltaTime * PACKET_SPEED` giả định `deltaTime` tính bằng giây.
*   **Cách khắc phục:** Chuẩn hóa `deltaTime` sang giây bằng cách chia cho 1000 trước khi truyền vào engine: `const delta = (time - lastTime) / 1000;`. File sửa: `SystemDesignWorkspace.vue` dòng 25.

### 🚨 Lỗi 133: Bước INSTANTIATE Trong Kịch Bản OOP Xóa Sạch Heap Mỗi Lần Tạo Đối Tượng (BUG-OOP-3)
*   **Mô tả:** Trong `useOOPVisualizerStore.ts`, handler cho `step.actionName === 'INSTANTIATE'` chứa lệnh `heapObjects.value = []` xóa toàn bộ Heap trước khi tạo đối tượng mới. Điều này khiến mọi kịch bản đa đối tượng bị hỏng — khi bước INSTANTIATE thứ hai được thực thi, đối tượng đầu tiên bị xóa mất.
*   **Mã Lỗi:** `ERR_OOP_INSTANTIATE_HEAP_WIPE`
*   **Nguyên nhân gốc:** Logic scenario step handler gộp chung việc reset heap vào mỗi bước INSTANTIATE thay vì chỉ thực hiện ở bước RESET/CLONE_MEMBERS.
*   **Cách khắc phục:** Xóa dòng `heapObjects.value = [];` khỏi nhánh `INSTANTIATE`, chỉ giữ lại việc tạo đối tượng mới qua `instantiateNewObject()`. Heap chỉ được xóa ở các bước RESET và CLONE_MEMBERS. File sửa: `useOOPVisualizerStore.ts` dòng 374.

### 🚨 Lỗi 134: Động Cơ Khói Sự Cố Server Không Được Render — System Design Viz (BUG-SD-1)
*   **Mô tả:** `FailureSmokeEmitterEngine.ts` được triển khai đầy đủ nhưng không có Vue component nào render canvas cho nó. Store dispatch `CustomEvent('SERVER_FAILED_SMOKE_BURST')` đến `window` khi server fail, nhưng không có listener xử lý — hiệu ứng khói hoàn toàn chết.
*   **Mã Lỗi:** `ERR_SYSDESIGN_SMOKE_NOT_WIRED`
*   **Nguyên nhân gốc:** Thiếu component Vue overlay kết nối engine particle với canvas rendering. Ngoài ra, engine không có giới hạn số lượng particle → nguy cơ tràn bộ nhớ (MEM-SD-1).
*   **Cách khắc phục:** Tạo component `FailureSmokeOverlay.vue` với canvas overlay `pointer-events: none` trên `.architecture-canvas`. Component lắng nghe `SERVER_FAILED_SMOKE_BURST`, tạo instance `FailureSmokeEmitterEngine` cho mỗi node bị lỗi, render particle lên canvas chung. Áp dụng `MAX_PARTICLES = 200` cap để tránh tràn bộ nhớ. Mount vào `SystemDesignWorkspace.vue`. File tạo mới: `FailureSmokeOverlay.vue`. File sửa: `SystemDesignWorkspace.vue`.

### 🚨 Lỗi 135: Kiểu `any` Trong actionPayload Scenario OOP — OOP Viz (BUG-OOP-1)
*   **Mô tả:** `ScenarioStep.actionPayload` được khai báo là `any`, vi phạm quy tắc sắt "nói không với `any`". Trình biên dịch TypeScript không thể kiểm tra tính đúng đắn của các thuộc tính payload (`className`, `memberName`, `methodName`, v.v.) tại thời điểm biên dịch.
*   **Mã Lỗi:** `ERR_OOP_SCENARIO_ANY_TYPE`
*   **Nguyên nhân gốc:** `ScenarioStep` là interface đơn với `actionPayload?: any` thay vì discriminated union dựa trên `actionName`.
*   **Cách khắc phục:** Thay thế hoàn toàn bằng discriminated union type `ScenarioStep` với 7 variant (`ResetStep`, `InstantiateStep`, `CallMethodStep`, `ViolateAccessStep`, `ValidateSetterStep`, `CloneMembersStep`, `ShowAbstractErrorStep`). Mỗi variant có `actionPayload` được định kiểu chặt chẽ. Export thêm `ScenarioActionPayload` union type. File sửa: `oopScenarios.ts`.

### 🚨 Lỗi 136: requestCount Chỉ Tăng Không Giảm — System Design Viz (BUG-SD-3)
*   **Mô tả:** `requestCount` trên node đích được tăng (`++`) khi packet được gửi từ Load Balancer, nhưng không bao giờ giảm khi packet đến đích (`ARRIVED`) hoặc bị drop (`DROPPED`). Kết quả: counter tăng vô hạn, không phản ánh số request đang hoạt động thực tế.
*   **Mã Lỗi:** `ERR_SYSDESIGN_REQUESTCOUNT_NO_DECREMENT`
*   **Nguyên nhân gốc:** Thiếu logic decrement trong `updatePacketsProgress()` tại cả hai nhánh xử lý ARRIVED và DROPPED.
*   **Cách khắc phục:** Thêm `target.requestCount = Math.max(0, target.requestCount - 1)` tại cả hai nhánh: khi packet status chuyển sang `DROPPED` (server FAILED) và khi `progress >= 1.0` (ARRIVED). Dùng `Math.max(0, ...)` để tránh giá trị âm. File sửa: `SystemDesignEngine.ts`.

### 🚨 Lỗi 137: SVG stroke-dasharray Sai Cú Pháp — OOP Viz (BUG-SVG-1)
*   **Mô tả:** Thuộc tính `stroke-dasharray="4_4"` trong SVG connector giữa Shape và Circle sử dụng dấu gạch dưới (`_`) thay vì dấu cách (` `) — cú pháp không hợp lệ theo SVG spec. Trình duyệt bỏ qua giá trị này, đường kẻ hiển thị liền thay vì đứt đoạn.
*   **Mã Lỗi:** `ERR_OOP_SVG_DASHARRAY_SYNTAX`
*   **Nguyên nhân gốc:** Lỗi đánh máy trong template Vue.
*   **Cách khắc phục:** Đổi `stroke-dasharray="4_4"` thành `stroke-dasharray="4 4"`. File sửa: `OOPConceptsVisualizerWorkspace.vue` dòng 63.

### 🚨 Lỗi 138: requestCount Không Cập Nhật UI — System Design Viz (BUG-SD-REACTIVITY)
*   **Mô tả:** Trường `requestCount` trên thẻ `SystemNodeCard` (`"X req"`) không cập nhật trong giao diện Vue khi engine thay đổi giá trị. Engine mutate trực tiếp các raw JavaScript objects, bypass hoàn toàn hệ thống Proxy reactivity của Vue 3. Hàm `syncPackets()` chỉ đồng bộ mảng packets, không đồng bộ trạng thái nodes.
*   **Mã Lỗi:** `ERR_SYSDESIGN_NODE_REACTIVITY_GAP`
*   **Nguyên nhân gốc:** Engine lưu trữ raw object references qua `registerNode()`. Khi engine gọi `targetServer.requestCount++` hoặc `requestCount--`, nó mutate object gốc trực tiếp — Vue 3 Proxy chỉ phát hiện thay đổi khi setter được gọi qua Proxy, không phải qua raw object.
*   **Cách khắc phục:** Thêm hàm `syncNodes()` sử dụng `triggerRef(nodes)` từ Vue 3 để ép Vue re-render khi node data thay đổi. Gọi `syncNodes()` song song với `syncPackets()` tại tất cả các điểm mutation: `injectHttpRequest()`, `injectTrafficBurst()`, và `tickEngine()`. File sửa: `useSystemDesignStore.ts`.

### 🚀 Mục 139: Phase 3 — Full-Stack Integration (System Design Frontend ↔ Backend API)
*   **Mô tả:** Refactor `useSystemDesignStore.ts` để kết nối frontend với backend API thay vì dùng topology hardcode và simulation thuần client-side. Thêm chế độ VCR playback cho kịch bản backend.
*   **Mã Mục:** `FEAT_SYSDESIGN_FULLSTACK_INTEGRATION`
*   **Thay đổi:**
    - Tạo `systemDesignApi.ts`: service layer gọi `GET /topology`, `GET /scenarios`, `POST /execute`
    - Thêm `SystemDesignFrame` type map 1:1 với `SystemDesignFrameDto` (C#)
    - `initializeDemoTopology()` → async, fetch topology từ `GET /api/v1/concepts/system-design/topology` với fallback hardcoded
    - Thêm `loadScenario(scenarioId)` → `POST /execute` lấy mảng frames, áp dụng VCR playback
    - Thêm VCR controls: `nextFrame()`, `prevFrame()`, `resetFrames()`, `toggleAutoplay()`, `setPlaybackSpeed()`
    - `tickEngine()` bỏ qua engine ticks trong VCR mode — state driven hoàn toàn bởi frame data backend
    - `SystemDesignWorkspace.vue`: thêm Scenario Picker, VCR Playback Panel, Explanation Banner
    - Interactive sandbox mode vẫn hoạt động khi không ở VCR mode
*   **Files sửa:** `useSystemDesignStore.ts`, `SystemDesignWorkspace.vue`, `system-design-viz.types.ts`, `systemDesignApi.ts` (mới), `useSystemDesignStore.spec.ts`

### 140. Phase 3 OOP Full-Stack Integration — Backend API Frames with VCR Playback
*   **ID:** FEAT-OOP-PHASE3
*   **Mô tả:** Kết nối OOP Visualization frontend với backend API. Store `useOOPVisualizerStore.ts` giờ fetch frames từ `POST /api/v1/concepts/oop/execute` thay vì dùng kịch bản hardcoded.
*   **Kiến trúc:**
    - Dual-mode: API mode (backend frames) với fallback sang local scenarios khi backend không khả dụng
    - `oopApi.ts`: service layer mới cho OOP backend calls
    - `OOPFrame` + `HeapObjectSnapshot` types tương ứng C# `OOPFrameDto`
    - `loadScenario()` async — try API first, fallback local
    - `applyApiFrame()` áp dụng state snapshot backend → reactive refs (convert JSON objects → Maps)
    - `snapshotToInstance()` chuyển đổi `Record<string, unknown>` → `Map<string, unknown>` cho fieldsData/vTable
    - `totalSteps`, `currentExplanation`, `currentActionName` computed properties phục vụ cả 2 mode
    - `OOPConceptsVisualizerWorkspace.vue`: thêm action name badge, API loading/error indicators
    - Tests: mock oopApi, async loadScenario/setPillar
*   **Files sửa:** `useOOPVisualizerStore.ts`, `OOPConceptsVisualizerWorkspace.vue`, `oop-visualization.types.ts`, `oopApi.ts` (mới), `useOOPVisualizerStore.spec.ts`

### 141. P1 — 7 Backend Sorting Strategies (IAlgorithmStrategy)
*   **ID:** FEAT-SORTING-STRATEGIES
*   **Mô tả:** Tạo 7 backend sorting strategy classes kế thừa `AlgorithmStrategyBase` và implement `IAlgorithmStrategy`. Refactor legacy `BubbleSortExecutor` thành `BubbleSortStrategy`. Tất cả tự động đăng ký qua DI reflection.
*   **Strategies:** BubbleSortStrategy, QuickSortStrategy, MergeSortStrategy, HeapSortStrategy, RadixSortStrategy, CountingSortStrategy, BucketSortStrategy
*   **Files tạo:** `BubbleSortStrategy.cs`, `QuickSortStrategy.cs`, `MergeSortStrategy.cs`, `HeapSortStrategy.cs`, `RadixSortStrategy.cs`, `CountingSortStrategy.cs`, `BucketSortStrategy.cs`

### 142. P2 — Frontend Type Safety: Eliminate 13+ non-test `any` usages
*   **ID:** FIX-TYPE-SAFETY
*   **Mô tả:** Loại bỏ tất cả `any` type trong non-test frontend code. Thay thế bằng strict TypeScript interfaces, type guards, discriminated unions.
*   **Thay đổi:**
    - `MonacoGutterClickInterceptor.ts`: `any` → `MonacoMouseEvent` + `MonacoEditorInstance`
    - `PseudocodeSyncer.ts`: `any` → `MonacoEditorForHighlight` interface
    - `MonacoLineSyncerCoordinator.ts`: `any` → `VcrBaseFrame` + `VcrStoreForSync`
    - `useGraphInteraction.ts`: `any` → `InteractivePlaygroundEngine | null`
    - `useInputValidation.ts`: `catch (err: any)` → `catch (err: unknown)` + type guard
    - `useSortingAnimation.ts`: `as any` cast removed — `VcrBaseFrame` base type
    - `SortingDetailPanel.vue`: `as any` → `isSortFrame()` type guard
    - `useVcrStore.ts`: `err: any` → `err: unknown`, `PlaybackFrame[]` → `VcrBaseFrame[]`
    - `CompilerStepExecutor.ts`: `err: any` → `err: unknown`
*   **Files sửa:** 9 files across features/vcr-player, features/algorithm-sandbox, core/

### 143. P3 — Standardize VITE_API_BASE_URL + Algorithm Dashboard Integration
*   **ID:** FIX-API-URL
*   **Mô tả:** Chuẩn hóa `VITE_API_BASE_URL` across all DSA module files. Default port 5050 (matching backend).
*   **Thay đổi:**
    - `useAlgorithmStore.ts`: Thêm `API_BASE` constant, sửa `fetchAlgorithms()` và `loadAlgorithmDetails()` dùng absolute URL
    - `dsaApi.ts`: Sửa default port từ 5000 → 5050
    - `algorithmCatalog.ts`: Thêm 7 sorting algorithms vào catalog (17 total)
    - `algorithmLocalMetadata.ts`: Thêm metadata cho 7 sorting algorithms
    - `sortingGenerators.ts`: Thêm 4 dummy generators (HeapSort, RadixSort, CountingSort, BucketSort)
    - `dummyGenerators.ts`: Đăng ký 4 generators mới
    - Tests: Cập nhật catalog (10→17) và store specs
*   **Files sửa:** `useAlgorithmStore.ts`, `dsaApi.ts`, `algorithmCatalog.ts`, `algorithmLocalMetadata.ts`, `sortingGenerators.ts`, `dummyGenerators.ts`, `algorithmCatalog.spec.ts`, `useAlgorithmStore.spec.ts`

### 144. Phase 4 — Backend Architecture Modules (SOLID, Design Patterns, DI/IoC)
*   **ID:** FEAT-PHASE4-ARCH
*   **Mô tả:** Implemented full-stack integration for 3 architecture modules: SOLID Principles, Design Patterns, DI/IoC Container.
*   **Backend thay đổi:**
    - `SOLIDPrinciplesStrategy.cs`: 3 scenarios (SRP, OCP, LSP) with 4 frames each
    - `DesignPatternsStrategy.cs`: 3 scenarios (Strategy, Observer, Singleton) with 4 frames each
    - `DIContainerStrategy.cs`: 2 scenarios (lifetime-demo: 5 frames, cycle-detection: 4 frames)
    - DTOs: `SOLIDFrameDto.cs`, `DesignPatternFrameDto.cs`, `DIContainerFrameDto.cs`
    - Controllers: `SOLIDController.cs`, `DesignPatternsController.cs`, `DIContainerController.cs`
    - DI: Registered 3 new strategies in `AlgorithmDIConfiguration.cs`
*   **Frontend thay đổi:**
    - `solidApi.ts`: Service layer for SOLID API
    - `designPatternsApi.ts`: Service layer for Design Patterns API
    - `diContainerApi.ts`: Service layer for DI Container API
    - `useSOLIDVisualizerStore.ts`: Added VCR state + actions (loadVcrScenario, vcrNext, vcrPrev, vcrReset, exitVcrMode)
    - `useDesignPatternsStore.ts`: Added VCR state + actions
    - `useDIContainerStore.ts`: New Pinia store with VCR integration
*   **Build:** `dotnet build` 0 errors, `vue-tsc --noEmit` 0 errors
*   **Files:** 16 new/modified files across backend/src/ and frontend/src/features/

### 145. Production Build — vue-tsc -b Strict Type Errors (Preexisting)
*   **ID:** FIX-FE-BUILD-TSC
*   **Mô tả:** `npm run build` (`vue-tsc -b && vite build`) thất bại với 9 lỗi TypeScript. Nguyên nhân gốc: `tsconfig.json` dùng `files: []` + project references, nên `vue-tsc --noEmit` (không có `-b`) kiểm tra 0 file → luôn báo "0 errors" sai lệch. Chỉ `vue-tsc -b` (chế độ build theo references) mới thực sự type-check toàn bộ `src/`.
*   **Các lỗi đã sửa:**
    - `canvasStateSnapshot` không tồn tại trên `VcrBaseFrame` (buffer `playbackFrames` chứa cả `PlaybackFrame` lẫn `SortFrame`). Thêm type guard `isPlaybackFrame()` trong `CompilerStepExecutor.ts`, dùng để narrow an toàn tại `useAlgorithmCanvasController.ts`, `PseudocodePanel.vue`, `PseudocodeViewer.vue`.
    - `MonacoLineSyncerCoordinator.ts`: `this.vcrStore` possibly null trong closure watch → dùng `this.vcrStore!` (đã guard trong constructor/setup).
    - `WasmComputeWorker.ts`: `inputData.buffer.slice()` trả `ArrayBuffer | SharedArrayBuffer` không gán được vào `payload: ArrayBuffer` → ép kiểu `as ArrayBuffer`.
    - `DashboardView.vue`: callback `.map((b: Record<string, unknown>))` rộng hơn `unknown` của phần tử badge → đổi sang nhận `badge` rồi ép `as Record<string, unknown>` trong thân hàm (loại bỏ luôn 1 chỗ `any`).
*   **Kết quả:** `vue-tsc -b` 0 errors, `vite build` thành công (dist sinh ra), 1528/1528 frontend tests vẫn pass, `dotnet build` 0 errors, 8/8 backend tests pass.
*   **Files:** `frontend/src/core/CompilerStepExecutor.ts`, `frontend/src/features/algorithm-sandbox/composables/useAlgorithmCanvasController.ts`, `frontend/src/features/algorithm-sandbox/engine/MonacoLineSyncerCoordinator.ts`, `frontend/src/features/code-editor/components/PseudocodePanel.vue`, `frontend/src/features/code-editor/components/PseudocodeViewer.vue`, `frontend/src/features/code-to-visualization/engine/WasmComputeWorker.ts`, `frontend/src/views/DashboardView.vue`

### 🚨 Lỗi 153: Mất Trạng Thái Đăng Nhập Khi Reload Trang (Auth Session Persistence Failure)
*   **Mô tả:** Học viên đăng nhập qua tài khoản không trạng thái (stateless auth) thành công, nhưng khi reload trình duyệt (F5) thì bị tự động đăng xuất và chuyển hướng về trang chủ.
*   **Mã Lỗi:** `ERR_AUTH_SESSION_PERSISTENCE`
*   **Nguyên nhân gốc:**
    - `main.ts` thực hiện gọi `authStore.init()` khi khởi động ứng dụng để kiểm tra phiên đăng nhập. Tuy nhiên, hàm `init()` này chỉ hỗ trợ phục hồi phiên có trạng thái (`dsa_refresh_token`) mà bỏ qua stateless session lưu trữ ở `dsa_stateless_user_id`.
    - Trình định tuyến router guard kiểm tra `authStore.isAuthenticated` trước khi tải trang dashboard. Do session chưa được phục hồi kịp thời ở thời điểm khởi chạy, hệ thống nhận định học viên chưa đăng nhập và ép buộc redirect về `/`. Sau đó, `App.vue` mới gọi `authStore.statelessInit()` nhưng lúc này học viên đã bị đẩy ra ngoài.
*   **Cách khắc phục:**
    - Cập nhật `authStore.init()` để kiểm tra `dsa_stateless_user_id`.
    - Nâng cấp `refresh` endpoint trong backend `StatelessAuthController.cs` và `statelessAuthApi.ts` của frontend để nhận thêm `userId`.
    - Khi server backend restart hoặc browser refresh, frontend truyền `savedUserId` trong hàm `statelessInit()` để backend re-hydrate (nạp lại thông tin người dùng từ PostgreSQL vào in-memory cache) qua hàm `EnsureUserInMemory` và `ForceAddRefreshToken`, khôi phục session hoàn toàn tự động mà không cần đăng nhập lại.

### 🚨 Lỗi 154: Bỏ Qua Rào Cản Đăng Nhập Ở Trang Nâng Cấp Premium (Guest Checkout Bypass Gate)
*   **Mô tả:** Người dùng chưa đăng ký hoặc đăng nhập vẫn có thể truy cập trang `/checkout`, bấm nút nâng cấp Premium và thực hiện thanh toán ảo thành công. Khi quay lại, hệ thống báo "đã sở hữu premium" cho tất cả người dùng vãng lai do trùng ID dùng chung.
*   **Mã Lỗi:** `ERR_PAYMENT_GUEST_BYPASS`
*   **Nguyên nhân gốc:**
    - Trang checkout `/checkout` không có rào cản kiểm tra trạng thái đăng nhập.
    - Trong `usePaymentStore.ts`, khi người dùng chưa đăng nhập (không có thông tin trong `authStore`), biến `userId` tự động fallback về một hằng số dùng chung `'demo-user-001'`. Do đó, bất kỳ tài khoản vãng lai nào nâng cấp premium thực chất đều nâng cấp cho ID dùng chung này, khiến dữ liệu trạng thái premium bị xung đột và báo "đã sở hữu" cho tất cả khách vãng lai.
*   **Cách khắc phục:**
    - Đã tích hợp tấm chắn mờ kính (Glassmorphic Auth Required Gate) chặn truy cập thanh toán khi chưa đăng nhập.
    - Ràng buộc checkout trên cả frontend (`usePaymentStore.ts`) lẫn backend (`StatelessPaymentController.cs` và `StatelessPaymentStrategy.cs`).
    - Cập nhật backend `StatelessPaymentController` sử dụng trực tiếp `order.UserId` thực tế từ hóa đơn thay vì `request.UserId` để cập nhật trạng thái premium cho đúng tài khoản trong cơ sở dữ liệu PostgreSQL và in-memory cache.
    - Đồng bộ hóa sự thay đổi trạng thái premium của tài khoản in-memory ngay khi hoàn tất giao dịch bằng cách gọi `_authStrategy.SetUserPremium(order.UserId, true)`.

### 🚨 Lỗi 155: Lỗi Type-Checking Mismatch Vai Trò Người Dùng Hệ Thống (TypeScript User Role Overlap Error)
*   **Mô tả:** Trình biên dịch TypeScript báo lỗi nghiêm trọng khi so sánh kiểu dữ liệu giữa role hiện tại của người dùng với vai trò quản trị viên: `This comparison appears to be unintentional because the types '"Student" | "Teacher"' and '"Admin"' have no overlap.`
*   **Mã Lỗi:** `ERR_TS_USER_ROLE_OVERLAP_MISMATCH`
*   **Nguyên nhân gốc:** 
    - Kiểu dữ liệu `role` của người dùng được định nghĩa tĩnh trong `AuthUserDto` (ở `authApi.ts`) và `StatelessUserDto` (ở `statelessAuthApi.ts`) chỉ bao gồm hai lựa chọn: `'Student' | 'Teacher'`.
    - Khi các cấu trúc như `App.vue` hay `router/index.ts` thực hiện kiểm thử quyền hạn truy cập của Admin bằng phép so sánh `role === 'Admin'`, TypeScript phát hiện ra rằng giá trị `'Admin'` nằm ngoài tập hợp vai trò được định nghĩa nên ném lỗi ngăn cản quá trình build production.
*   **Cách khắc phục:**
    - Cập nhật cả `AuthUserDto` trong [authApi.ts](file:///d:/FPT/Hihi/frontend/src/features/auth/services/authApi.ts) lẫn `StatelessUserDto` trong [statelessAuthApi.ts](file:///d:/FPT/Hihi/frontend/src/features/auth/services/statelessAuthApi.ts) để mở rộng kiểu dữ liệu trường `role` bao gồm cả vai trò `'Admin'`.
    - Việc mở rộng này giúp Pinia Store tự động phân giải kiểu dữ liệu `userRole` thành `'Student' | 'Teacher' | 'Admin'`, đảm bảo phép so sánh vai trò quản trị viên tại `App.vue` và bộ điều hướng `router/index.ts` hợp lệ tuyệt đối.

### 🚨 Lỗi 156: Lỗi Type-Checking Khi Truy Cập dataState Và highlights Trên FrameDTO (FrameDTO Optional Properties Type Mismatch)
*   **Mô tả:** Sau khi khai báo `dataState` và `highlights` là optional trên `FrameDTO` để tương thích với `GraphAnimationStep` (sử dụng trong Graph Algorithm Simulation vốn không vẽ bar charts), trình biên dịch TypeScript ném lỗi `error TS18048: 'frame.dataState' is possibly 'undefined'` và `error TS18048: 'frame.highlights' is possibly 'undefined'` ở nhiều component vẽ Canvas và Test Specs.
*   **Mã Lỗi:** `ERR_TS18048_FRAME_DTO_OPTIONAL_PROPERTIES`
*   **Nguyên nhân gốc:**
    - Các file vẽ canvas (`useAnimationCanvas.ts`, `compareCanvasDraw.ts`, `CompareCanvasPanel.vue`) và file thống kê so sánh (`compareHelpers.ts`) truy cập trực tiếp vào `frame.dataState` và `frame.highlights` mà không kiểm tra sự tồn tại của chúng.
    - File test `algorithmApi.spec.ts` truy cập trực tiếp vào các thuộc tính của `highlights` mà không dùng non-null assertion.
*   **Cách khắc phục:**
    - Cập nhật các hàm vẽ canvas và helper trong frontend để kiểm tra sự tồn tại của `dataState` và `highlights` một cách an toàn bằng các toán tử nullish coalescing (`?? []`) và optional chaining (`?.`).
    - Sử dụng các non-null assertions (`!`) trong `algorithmApi.spec.ts` khi kiểm thử bubble-sort frames vì thuật toán sorting chắc chắn sinh ra `highlights`.
    - Điều này giúp build production frontend thông suốt (`vue-tsc -b` đạt exit code 0) mà vẫn giữ được tính linh hoạt khi `FrameDTO` được dùng chung cho cả Sorting và Graph Visualizer.



### ?? L?i 157: console.log Sót L?i Trong Code Production (Rogue console.log in Production Modules)
*   **Mô t?:** L?nh console.log b? d? sót trong 3 file production (AlgorithmDashboard.vue, GamificationPanel.vue) và 1 file string template (EmbedCodeSnippet.vue — th?c ch?t là code m?u h?p l?, không ph?i debug th?c s?).
*   **Mã L?i:** ERR_CONSOLE_LOG_IN_PRODUCTION
*   **Nguyên nhân g?c:** Các hàm debug loadMore() và callback adge earned trong XPEngine không du?c d?n d?p sau giai do?n phát tri?n.
*   **Cách kh?c ph?c:**
    - AlgorithmDashboard.vue: Thay th? console.log('Loading more skills...') b?ng comment no-op.
    - GamificationPanel.vue: Thay th? (badge) => console.log(...) b?ng (_badge) => { /* no-op */ }.
    - EmbedCodeSnippet.vue:49: Không ph?i l?i — dây là chu?i template m?u hi?n th? cho user, không ph?i debug code th?c.

### ?? L?i 158: CS8618 Nullable Warnings Trong QuizDto.cs (Uninitialized Non-Nullable Reference Properties)
*   **Mô t?:** 45 warnings CS8618 Non-nullable property must contain a non-null value when exiting constructor trong QuizDto.cs.
*   **Mã L?i:** ERR_CS8618_QUIZDTO_NULLABLE
*   **Nguyên nhân g?c:** Các thu?c tính ki?u tham chi?u (string, List<T>, int[]) không du?c khai báo là 
equired ho?c nullable, khi?n .NET nullable analysis c?nh báo chúng có th? null.
*   **Cách kh?c ph?c:** Thêm 
equired modifier cho t?t c? thu?c tính ki?u tham chi?u trong QuizDto, QuizQuestionDto, QuizAttemptRequest, QuizAttemptResult, QuestionResult. Build k?t qu?: **0 Warnings, 0 Errors**.

### ?? L?i 159: L? H?ng B?o M?t Npgsql 8.0.0 (NU1903 High Severity Vulnerability)
*   **Mô t?:** NuGet báo NU1903: Package 'Npgsql' 8.0.0 has a known high severity vulnerability và Microsoft.Extensions.Caching.Memory 8.0.0 has a known high severity vulnerability.
*   **Mã L?i:** ERR_NU1903_NPGSQL_VULNERABILITY
*   **Nguyên nhân g?c:** D? án s? d?ng Npgsql.EntityFrameworkCore.PostgreSQL 8.0.0 và Microsoft.EntityFrameworkCore 8.0.0.
*   **Cách kh?c ph?c:** Nâng c?p toàn b? EF Core ecosystem lên 9.0.1 và Npgsql lên 9.0.4. Ð?ng th?i nâng Microsoft.Extensions.Caching.Memory lên 9.0.1. K?t qu?: Build **0 Warnings, 0 Errors**, 19/19 backend tests pass.

### 🚨 Lỗi 160: Trùng lặp tiền tố API trên Client (Double API Prefixing /api/v1/api/v1)
*   **Mô tả:** Các yêu cầu API gửi từ Client đến Backend bị nhân đôi tiền tố /api/v1/api/v1/... dẫn đến lỗi 404/CORS.
*   **Mã Lỗi:** ERR_CLIENT_DOUBLE_API_PREFIX
*   **Nguyên nhân gốc:** Environment variable VITE_API_BASE_URL chứa sẵn /api/v1, trong khi piClient.ts và các file Service khác cũng tự động ghép thêm /api/v1 vào sau base URL.
*   **Cách khắc phục:**
    - Cấu hình lại VITE_API_BASE_URL=http://localhost:5000 (chỉ gồm host) trong .env.development.
    - Cập nhật piClient.ts và shared piClient.ts để tự động ghép hậu tố /api/v1 một cách chuẩn hóa.

### 🚨 Lỗi 161: Định hướng Catch-All Router bị Silent Redirect thay vì hiển thị 404
*   **Mô tả:** Khi truy cập các đường dẫn không tồn tại, người dùng bị chuyển hướng im lặng về trang chủ thay vì thấy trang báo lỗi 404.
*   **Mã Lỗi:** ERR_ROUTER_SILENT_REDIRECT_NO_404
*   **Nguyên nhân gốc:** Route catch-all /:pathMatch(.*)* trong 
outes.ts được cấu hình là 
edirect: '/'.
*   **Cách khắc phục:**
    - Xây dựng component NotFoundView.vue với thiết kế mờ kính Glassmorphic, hiệu ứng glitch 404, SVG và liên kết truy cập nhanh.
    - Cập nhật route catch-all trỏ trực tiếp đến NotFoundView.vue.

### S?a L?i 162: S?p giao di?n khi Monaco Editor load th?t b?i (ERR_MONACO_LOAD_CRASH)
*   **Mô t?:** Monaco Editor dôi khi b? ng?t k?t n?i CDN/m?ng làm crash promise loader.init() không du?c try-catch, d?n d?n l?i màn hình tr?ng xóa.
*   **Mã L?i:** ERR_MONACO_LOAD_CRASH
*   **Nguyên nhân g?c:** Trình t?i Monaco không x? lý fallback khi CDN/network b? t? ch?i ho?c cache CDN b? l?i.
*   **Cách kh?c ph?c:** Thêm try-catch và c? tr?ng thái error, hi?n th? giao di?n m? kính Glassmorphic kèm nút " T?i l?i Monaco\ d? ngu?i dùng reload c?c b? mà không b? s?p trang.

### S?a L?i 163: Thi?u thông tin su ph?m gi?i thích SOLID LSP & DIP (ERR_SOLID_EXPLANATION_COGNITIVE_LOAD)
* **Mô t?:** Ngu?i dùng/Sinh viên vào trang SOLID LSP/DIP g?p nhi?u kho?ng den và không hi?u ý nghia c?a các kh?i mô ph?ng d?i tu?ng Bird/Ostrich hay các node Database.
* **Mã L?i:** ERR_SOLID_EXPLANATION_COGNITIVE_LOAD
* **Nguyên nhân g?c:** Thi?u ph?n gi?i nghia d?ch thu?t ti?ng Vi?t, c?u trúc trình bày lý thuy?t chua t?i uu d? gi?m t?i nh?n th?c.
* **Cách kh?c ph?c:** Thi?t k? l?i ph?n lý thuy?t trong LSPLessonPanel.vue và DIPLessonPanel.vue, b? sung toàn b? b?n d?ch ti?ng Vi?t h?c thu?t, b?ng so sánh tr?c quan, và gi?i thích chi ti?t co ch? vi ph?m/kh?c ph?c.



### Sửa Lỗi 164: Lỗi Phân Giải Base Image .NET 9.0 Cho Project Target .NET 10.0 (Docker Restore Failure) & Lệch Cấu Hình Database Local
* **Mô tả:** Chạy `docker-compose up --build` bị lỗi `The current .NET SDK does not support targeting .NET 10.0`. Chạy `run-project.bat` thì backend không kết nối được PostgreSQL ở localhost:5432 do password (`password123` vs `postgres`) hoặc db name (`visualization_dsa_dev` vs `visualization_dsa`) lệch cấu hình.
* **Ma Lỗi:** ERR_DOCKER_DOTNET_10_RESTORE_AND_DB_MISMATCH
* **Nguyên nhân gốc:**
  1. File `backend/Dockerfile` sử dụng base image `mcr.microsoft.com/dotnet/sdk:9.0` trong khi dự án `.csproj` nhắm mục tiêu (target) `.NET 10.0`.
  2. File `docker-compose.yml` định cấu hình cơ sở dữ liệu mặc định là `visualization_dsa` và mật khẩu `postgres`, trong khi cấu hình phát triển cục bộ `appsettings.Development.json` yêu cầu `visualization_dsa_dev` và mật khẩu `password123`.
* **Cách khắc phục:**
  1. Cập nhật `backend/Dockerfile` để sử dụng base image `.NET 10.0` (sdk:10.0 và aspnet:10.0).
  2. Đồng bộ cấu hình database trong `docker-compose.yml` (POSTGRES_DB: visualization_dsa_dev, POSTGRES_PASSWORD: password123, cùng với cập nhật healthcheck và env ConnectionStrings__DefaultConnection của backend service) khớp 100% với `appsettings.Development.json` để người dùng có thể chạy database container độc lập rồi chạy backend bằng script `.bat` trên host.

### Sửa Lỗi 165: Lệch tiêu đề cột Excel Import khi Giảng viên tải lên file mẫu cũ (ERR_EXCEL_IMPORT_TITLE_MISMATCH)
*   **Mô tả:** Import Quiz từ file Excel bị lỗi hoặc trả về dữ liệu rỗng do không ánh xạ được cột "Tiêu đề trắc nghiệm" hoặc "Tiêu đề Quiz".
*   **Mã Lỗi:** ERR_EXCEL_IMPORT_TITLE_MISMATCH
*   **Nguyên nhân gốc:** Trình phân tích excelParser.ts chỉ hỗ trợ đọc cột với tiêu đề chuẩn hóa ("Tiêu đề Quiz"), trong khi các file template cũ sử dụng "Tiêu đề trắc nghiệm" dẫn đến không nhận dạng được.
*   **Cách khắc phục:**
    - Cập nhật interface ExcelRowInput để hỗ trợ cả hai cột "Tiêu đề trắc nghiệm" và "Tiêu đề Quiz".
    - Bổ sung logic tìm kiếm linh hoạt với độ ưu tiên để lấy đúng tiêu đề quiz từ tệp tin Excel cũ và mới.
    - Xác thực bằng Vitest thành công (1539 tests passed).


### Sửa Lỗi 166: Lỗi Kiểu Dữ Liệu Handler resize Trong GuidedTourOverlay (ERR_TOUR_RESIZE_HANDLER_TYPE_MISMATCH)
*   **Mô tả:** Lỗi biên dịch TypeScript tại component `GuidedTourOverlay.vue` khi gán trực tiếp hàm `updateSpotlight(skipScroll?: boolean)` làm listener cho sự kiện `resize` của cửa sổ `window`.
*   **Mã Lỗi:** ERR_TOUR_RESIZE_HANDLER_TYPE_MISMATCH
*   **Nguyên nhân gốc:** Trình lắng nghe resize truyền vào một sự kiện `UIEvent` thay vì kiểu `boolean | undefined` như chữ ký hàm `updateSpotlight` yêu cầu, dẫn đến lỗi bất tương thích kiểu dữ liệu khi compile.
*   **Cách khắc phục:**
    - Khai báo thêm một hàm wrapper `handleResize = () => updateSpotlight(true)` không tham số và thiết lập skipScroll bằng `true` để tránh việc tự động scroll lại khi người dùng thay đổi kích thước cửa sổ.
    - Cập nhật `window.addEventListener('resize', handleResize)` và gỡ bỏ tương ứng tại `onBeforeUnmount` giúp code compile và build sạch 100%.

### Sửa Lỗi 167: Lỗi Spotlight Element Blur Trong GuidedTourOverlay (ERR_TOUR_SPOTLIGHT_BLUR)
*   **Mô tả:** Khi Tour kích hoạt, phần tử được spotlight bị mờ theo lớp nền do sử dụng filter: backdrop-blur sai chỗ.
*   **Mã Lỗi:** ERR_TOUR_SPOTLIGHT_BLUR
*   **Nguyên nhân gốc:** backdrop-blur được áp dụng trên class phủ toàn màn hình, gây mờ toàn bộ giao diện bao gồm cả spotlight element.
*   **Cách khắc phục:**
    - Loại bỏ lớp backdrop-blur trên toàn bộ overlay.
    - Áp dụng kỹ thuật CSS clip-path động để vẽ một lớp phủ tối màu đen (bg-black/60) bao quanh vùng spotlight mà không ảnh hưởng tới độ sắc nét của element đích.

### Sửa Lỗi 168: Lỗi Tooltip Tour Tràn Mép Dưới Viewport (ERR_TOUR_TOOLTIP_BOTTOM_OVERFLOW)
*   **Mô tả:** Tooltip hướng dẫn bị tràn ra ngoài màn hình ở các trang phức tạp như /state và /system thiết kế dạng cột.
*   **Mã Lỗi:** ERR_TOUR_TOOLTIP_BOTTOM_OVERFLOW
*   **Nguyên nhân gốc:** Thuật toán tính toán vị trí tooltip không tính đến giới hạn chiều cao viewport và chiều cao tooltip, dẫn đến việc đẩy tooltip vượt quá mép dưới màn hình.
*   **Cách khắc phục:**
    - Định nghĩa chiều cao mặc định ước tính của Tooltip là 200px.
    - Tự động đảo hướng preferredPosition từ 'bottom' thành 'top' khi phát hiện cạnh dưới của phần tử cộng thêm chiều cao tooltip vượt quá chiều cao màn hình.
    - Thêm hàm kẹp giới hạn an toàn Math.max(20, Math.min(top, window.innerHeight - tooltipHeight - 20)) để cố định vị trí tooltip luôn nằm trong vùng hiển thị an toàn.

### Sửa Lỗi 169: Lỗi Xung Đột Layout & Contrast Nhãn Trạng Thái Trong Phân Hệ Concurrency (ERR_CONCURRENCY_LAYOUT_COLLISION)
*   **Mô tả:** Nhãn trạng thái thread (Thread state badge) và thanh ray tiến trình (Thread rail tracks) bị đè và lệch giao diện do sử dụng vị trí động không cố định. Nhãn trạng thái cũng bị giảm tương phản khó đọc.
*   **Mã Lỗi:** ERR_CONCURRENCY_LAYOUT_COLLISION
*   **Nguyên nhân gốc:**
    - Sử dụng vị trí flex-row động cho tên luồng và nhãn trạng thái mà không có kích thước cố định dẫn đến việc dồn ép layout khi kích thước trạng thái thay đổi.
    - Màu nền và màu chữ của trạng thái (như Running, Suspended, Blocked) có tương phản quá yếu khiến chữ bị mờ.
*   **Cách khắc phục:**
    - Tách biệt nhãn trạng thái và rails trong ThreadRailsCanvas.vue bằng cách đặt nhãn ở vị trí absolute cố định bên phải với chiều rộng xác định (w-24), đồng thời thêm lề phải tương ứng cho thanh ray hoạt cảnh.
    - Chỉnh sửa độ mờ nền của các class màu trạng thái từ /5 (5%) lên /15 (15%) trong useThreadClassHelpers.ts để tạo lớp nền tương phản mạnh, giúp chữ hiển thị rõ ràng trên nền tối.

### Sửa Lỗi 170: Lỗi Đổ Vỡ Giao Diện Do Race Condition Khi Refresh Token (ERR_AUTH_REFRESH_RACE)
*   **Mô tả:** Khi Admin chuyển hướng từ trang `/admin` sang các trang khác, giao diện bị trắng xóa do việc gọi song song các request API sau khi refresh token chưa hoàn thành gây ra lỗi 401 Unauthorized và phát sinh Uncaught Exception phá vỡ luồng render của Vue Router.
*   **Mã Lỗi:** ERR_AUTH_REFRESH_RACE
*   **Nguyên nhân gốc:**
    - Thiếu cơ chế promise-locking (khóa lời hứa) tại hàm refresh token khiến nhiều request cùng lúc kích hoạt nhiều cuộc gọi `/auth/refresh` song song làm mất hiệu lực token cũ.
    - Thiếu cơ chế retry tự động tại tầng store và tầng request API khi token vừa được làm mới xong nhưng request hiện tại đã bị trả về 401.
*   **Cách khắc phục:**
    - Cài đặt một biến `refreshPromise` đóng vai trò khóa đồng bộ trong `useAuthStore.ts` để gộp toàn bộ các cuộc gọi refresh token đồng thời vào duy nhất một luồng xử lý.
    - Cài đặt cơ chế retry tự động trong `useUserProgressStore.ts` khi hàm `loadProgress` phát hiện lỗi 401 bằng cách đợi refresh token mới rồi gọi lại API.
    - Triển khai một Global Fetch Interceptor trong `main.ts` chặn toàn bộ lệnh fetch đi tới hệ thống API của VisualizationDSA, tự động đính kèm Header Authorization và tự động thực hiện refresh token + retry khi phản hồi là 401.

### Sua Loi 171: Blank Screen Sau Khi Vao /admin Do Interceptor Xu Ly 403 Nhu 401 (ERR_AUTH_FORBIDDEN_MISMATCH)
*   **Mo ta:** Admin dang nhap, vao /admin thanh cong. Sau do bam bat ky trang nao (OOP, Teacher, Sorting...) toan bo noi dung bi blank trang + banner 'Dong bo tien trinh that bai' hien ra.
*   **Ma Loi:** ERR_AUTH_FORBIDDEN_MISMATCH
*   **Nguyen nhan goc:**
    - Global Fetch Interceptor (main.ts) xu ly MOI response 401 bang cach goi refreshAccessToken(). Khi Admin vao /teacher (role Teacher only), backend tra ve 403 Forbidden (khong phai 401). NHUNG Interceptor khong phan biet 401 vs 403 - no van goi refreshAccessToken() nham. refreshAccessToken() that bai (token van hop le nhung sai role) va clear toan bo auth state: accessToken = null, currentUser = null. Ket qua: isAuthenticated = false, moi component render cung blank.
    - Router guard beforeEach goi stopImpersonating() khong dieu kien khi roi /admin, gay mutation state thua khi Admin chua impersonate ai.
*   **Cach khac phuc:**
    - main.ts: Chi goi refreshAccessToken() khi response.status === 401 (token het han), KHONG xu ly 403 (quyen bi tu choi). Them log warning phan biet cho 403.
    - router/index.ts: Chi goi stopImpersonating() khi authStore.isImpersonating === true (co vdsa_admin_access_token trong localStorage).
    - useUserProgressStore.spec.ts: Them cac truong con thieu (badgesEarned, modulesCompleted, badges) vao mock UserProgressDto de fix TS build error trong Docker.

### Sua Loi 172: Loi Xac Thu C Claim va Stuck Vue Transition Khi Admin Dieu Huong (ERR_ADMIN_NAV_AUTH_RACE)
*   **Mo ta:** Khi Admin vao page /admin roi dieu huong sang cac sandbox (OOP, Sorting...), content area bi trang xoa (blank) kem thong bao 'Dong bo tien trinh that bai'.
*   **Ma Loi:** ERR_ADMIN_NAV_AUTH_RACE
*   **Nguyen nhan goc:**
    - Tren Backend: Token validation trong Program.cs thieu cau hinh mapping NameClaimType = "sub" cho JWT. Do do claim "sub" sinh ra boi AuthService khong duoc map vao ClaimTypes.NameIdentifier, khien cho GetCurrentUserId() trong UsersController.cs tra ve null va nem UnauthorizedAccessException (401) tai endpoint /users/me/progress.
    - Tren Frontend: Component <Transition> trong App.vue su dung mode="out-in". Khi gap loi 401, error banner duoc render lam anh huong den lifecycle cua router view khien animation transition cua component tiep theo bi ket o opacity = 0 (stuck transition).
*   **Cach khac phuc:**
    - Backend Program.cs: Bo sung NameClaimType = "sub" va RoleClaimType = "role" vao TokenValidationParameters cua AddJwtBearer de map dung claim "sub" vao ClaimTypes.NameIdentifier.
    - Backend UsersController.cs: Toi uu hoa ham GetCurrentUserId() doc theo do uu tien tu NameIdentifier -> JwtRegisteredClaimNames.Sub -> "sub" va kiem tra Guid.TryParse mot cach an toan.
    - Frontend App.vue: Loai bo mode="out-in" tai page-fade transition va them :key=".fullPath" de ep component re-mount doc lap va hoat canh muot ma hon ma khong lo bi stuck opacity 0.
    - useUserProgressStore.ts & spec.ts: Xoa bo trung lap logic retry 401 de tap trung vao Global Interceptor thuc hien. Fix don vi kiem thu unit tests cho dung luong moi.

### Sua Loi 173: Thieu Co Che Chan Spam Va Phong Ngua DDoS/Can Kiet Tai Nguyen O Backend (ERR_BACKEND_SPAM_EXHAUSTION)
*   **Mo ta:** Cac endpoint backend chay thuat toan hoac tai thong ke khong co co che gioi han toc do truy cap (Rate Limiting), khong gioi han kich thuoc input dau vao gay nguy co treo Kestrel thread pool, va gay tai lon cho co so du lieu do query lien tuc.
*   **Ma Loi:** ERR_BACKEND_SPAM_EXHAUSTION
*   **Nguyen nhan goc:**
    - Cac endpoint chay thuat toan `Execute` va `Compare` la cac tac vu nang CPU nhung chay dong bo va thieu kiem tra do dai mang dau vao, khien ke xau co the gui mang lon de tan cong CPU/RAM.
    - Cac controller lay cac scenario dynamic (SOLID, OOP, DI, System Design, Design Patterns) thieu cache, dan den CPU phai tinh toan lai nhieu lan.
    - Thieu cau hinh gioi han so luong request tren moi IP khien he thong de bi spam hoac crawl trai phep.
*   **Cach khac phuc:**
    - Tich hop `ConstraintResolver.ValidateSize` vao AlgorithmsController de gioi han phan tu mang dau vao, dong thoi bọc logic chay thuat toan trong `Task.Run` de chay bat dong bo, tranh block Kestrel thread pool.
    - Cấu hinh `IMemoryCache` tren AnalyticsController cho public statistics (cache GetOverview trong 2 phut, GetPopularModules trong 10 phut) va clamp tham so limit de tranh query ton tai nguyen DB.
    - Khai bao 2 chinh sach rate limit tai `Program.cs`: `"api"` (60 request/phut) va `"heavy"` (15 request/phut, 0 queue de fail-fast) theo IP nguoi dung.
    - Ap dung decorator `[EnableRateLimiting("heavy")]` cho tat ca cac simulation controllers va `[EnableRateLimiting("api")]` cho AnalyticsController.
### S�a L�i 174: Thu�t To�n S�p X�p Ch�n Ch�y Ng�n (ERR_SANDBOX_ELSE_CATCH_BUG)
*   **M� t�:** Sandbox bi�n d�ch m� ngu�n c�a Insertion Sort b� d�ng �t ng�t (ch�y r�t ng�n) v� b�o l�i c� ph�p ng�m trong console khi g�p l�nh \else\.
*   **M� L�i:** ERR_SANDBOX_ELSE_CATCH_BUG
*   **Nguy�n nh�n g�c:** Regex ti�m v�t (instrumentation) trong \CompilerStepExecutor.ts\ th�m tracking sai v�o kh�i \else\ m� kh�ng ki�m tra c�u tr�c block, ph� v� c� ph�p JavaScript, bu�c sandbox ph�i chuy�n sang ch� � fallback t)nh (kh�ng ch�y ��c logic v�ng l�p ph�c t�p).
*   **C�ch kh�c ph�c:** C�p nh�t regex v� logic x� l� \else\ trong \CompilerStepExecutor\ � b� qua ti�m m� l�nh theo d�i sai v� tr�.

### S�a L�i 175: Code Sandbox Kh�ng C�p Nh�t Code M�i (ERR_SANDBOX_STALE_CODE)
*   **M� t�:** Ng��i d�ng ch�nh s�a code trong tab Code Sandbox, sau � b�m ch�y, nh�ng h� th�ng v�n ti�p t�c ch�y thu�t to�n ci (ho�c code ci) m� kh�ng c� l�i b�o.
*   **M� L�i:** ERR_SANDBOX_STALE_CODE
*   **Nguy�n nh�n g�c:** Tr�ng th�i cache \playbackFrames\ trong \crStore\ kh�ng b� x�a khi ng��i d�ng s�a m� ngu�n trong \CodeEditor.vue\. Khi �n ch�y l�i, store th�y frames > 0 n�n tr�c ti�p play l�i b� frames ci thay v� bi�n d�ch l�i code m�i.
*   **C�ch kh�c ph�c:** Th�m s� ki�n l�ng nghe \onCodeChange\ trong \CodeEditor.vue\. B�t c� khi n�o code thay �i, g�i \crStore.reset()\ � x�a tr�ng \playbackFrames\ bu�c h� th�ng ph�i d�ch l�i. �ng th�i b� \uto-play\ khi ch�n thu�t to�n.

### S�a L�i 176: T�i L�i Trang (F5) Lu�n B� Vng Ra Landing Page (ERR_ROUTER_F5_AUTH_RACE)
*   **M� t�:** ang � trong b�i h�c (LessonView) ho�c Dashboard, ng��i d�ng �n F5 th� lu�n b� �y ra ngo�i trang ch� \/landing\, m�c d� tr�ng th�i ng nh�p (token) v�n c�n trong localStorage.
*   **M� L�i:** ERR_ROUTER_F5_AUTH_RACE
*   **Nguy�n nh�n g�c:** Race condition (b�t �ng b�) trong Vue SPA. Tr�nh �nh tuy�n \outer\ kh�i ch�y v� �nh gi� guard \equiresAuth\ ngay l�p t�c tr��c khi \uthStore.init()\ k�p kh�i ph�c l�i tr�ng th�i Token t� localStorage (ph�i �c qua Promise), d�n �n vi�c router ngh) ng��i d�ng ch�a ng nh�p.
*   **C�ch kh�c ph�c:** Trong \main.ts\, k�m h�m kh�ng g�i \pp.use(router)\ cho �n khi \uthStore.init()\ � ho�n t�t kh�i ph�c tr�ng th�i v�o b� nh�.

### Bug: S�n ch�i �? th? b? m�n h?nh h�?ng d?n che khu?t v� kh�ng th? t?t
- **Nguy�n nh�n:** B?ng h�?ng d?n (Onboarding guide) ? ch? �? pointer-events-none khi?n click xuy�n qua, nh�ng do ch? �? m?c �?nh c?a Canvas l� SELECT n�n click v�o kh�ng v? ��?c �?nh m?i. Ng�?i d�ng t�?ng b?ng b? k?t v� che khu?t m� kh�ng c� n�t ��ng r? r�ng.
- **C�ch kh?c ph?c:** C?p nh?t usePlaygroundStore.ts th�m c? isGuideDismissed. C?p nh?t InteractivePlayground.vue th�m n�t '�? hi?u v� B?t �?u v?' v?i pointer-events-auto �? ��ng b?ng h�?ng d?n v� cho ph�p v? t? do.

### Bug: M?c l?c b�i h?c b? 'Tr? l? d?ng �? th?' �� l�n
- **Nguy�n nh�n:** Compoment CustomInputPanel trong S�n ch�i �? th? ��?c g�n z-index: 1005 (Tailwind: z-[1005]), trong khi thanh ng�n k�o (Drawer) M?c l?c kho� h?c ? LessonStudyView ch? ��?c g�n z-index: 50 (z-50). Do �� panel nh?p li?u hi?n th? �� l�n Drawer, che m?t n?i dung m?c l?c.
- **C�ch kh?c ph?c:** C?p nh?t LessonStudyView.vue, n�ng z-index c?a thanh Drawer l�n z-[2000] v� l?p n?n m? overlay l�n z-[1999] �? lu�n hi?n th? cao nh?t.

### Bug: N�t tr? gi�p (?) AI kh�ng hi?n th? tour h�?ng d?n trong kho� h?c �? th?
- **Nguy�n nh�n:** N�t HelpButton m?c �?nh g?i k?ch b?n AI d?a tr�n URL hi?n t?i (oute.path). Khi ? trong kho� h?c, URL l� d?ng /courses/:id/lessons/:id ch? kh�ng ph?i l� /graph. Trong khi ��, k?ch b?n h�?ng d?n l?i ��ng k? d�?i key /graph ? useGuidedTourStore, d?n �?n vi?c h? th?ng kh�ng t?m th?y k?ch b?n t��ng ?ng �? ch?y.
- **C�ch kh?c ph?c:** C?p nh?t file GraphView.vue truy?n c?ng tham s? 	our-key=/graph` cho component <HelpButton /> �? n� lu�n n?p ��ng k?ch b?n h�?ng d?n b?t k? URL b�n ngo�i l� g?.

### Bug: N?i dung h�?ng d?n AI (Guided Tour) kh�ng kh?p v?i t�n g?i c�ng c? tr�n UI
- **Nguy�n nh�n:** L?i tho?i h�?ng d?n c?a tr? l? ?o trong file useGuidedTourStore.ts d�ng c�c thu?t ng? c? ho?c ti?ng Anh (nh� Select, Add Node, Add Edge...) trong khi thanh c�ng c? th?c t? tr�n UI �? ��?c vi?t h�a (Di chuy?n, + �?nh, ? C?nh, ? Tr?ng s?, ?? X�a). Ngo�i ra, c� t?n t?i m?t b?n ghi c?u h?nh tour /graph b? tr�ng l?p.
- **C�ch kh?c ph?c:** X�a b? b?n ghi tour c?u h?nh tr�ng l?p c? v� c?p nh?t �?ng b? to�n b? n?i dung h�?ng d?n t? b�?c 2 �?n b�?c 6 cho kh?p tuy?t �?i v?i nh?n (label) c?a c�c c�ng c? v? tr�n m�n h?nh.

### Bug: Listbox (Dropdown ch?n gi?i thu?t) b? m?, kh� nh?n tr�n n?n tr?ng
- **Nguy�n nh�n:** C�c th? \<option>\ b�n trong dropdown �ang s? d?ng c�c bi?n m�u CSS custom (\g-bg-secondary\, \	ext-text-primary\). Tr?nh duy?t Windows th�?ng kh�ng render chu?n c�c bi?n m�u n�y b�n trong component dropdown g?c (native UI), d?n �?n vi?c n?n b? tr?ng to�t v� ch? b? m? nh?t (low contrast).
- **C�ch kh?c ph?c:** Ch?nh s?a file \InteractivePlayground.vue\ v� \CustomInputPanel.vue\, g? b? class m�u custom v� thay th? b?ng h? m�u t?nh chu?n c?a Tailwind (v� d?: \g-slate-900 text-slate-100\) �? �p bu?c tr?nh duy?t render m�u t?i (dark theme) cho to�n b? c�c m?c ch?n b�n trong Listbox.

### Sua Loi 177: Vite Import-Analysis Failed Resolve `./components/PseudocodeViewer.vue` Trong `code-editor` Barrel (ERR_VITE_RESOLVE_MISSING_COMPONENT)
*   **Mô tả:** Khi load trang chính, Vite báo lỗi `[plugin:vite:import-analysis] Failed to resolve import "./components/PseudocodeViewer.vue" from "src/features/code-editor/index.ts". Does the file exist?` trên overlay đỏ che khuất toàn bộ UI.
*   **Mã Lỗi:** `ERR_VITE_RESOLVE_MISSING_COMPONENT`
*   **Nguyên nhân gốc:** Barrel `src/features/code-editor/index.ts` re-export `PseudocodeViewer` từ `./components/PseudocodeViewer.vue` — file này **không tồn tại** trong module `code-editor`. Canonical component thực sự nằm ở `src/features/dsa-modules/components/PseudocodeViewer.vue` và được `DSAPlayer.vue` import trực tiếp. Việc barrel re-export một component không thuộc module là cross-module leak sai kiến trúc, và là dead code vì không có consumer nào import `PseudocodeViewer` từ barrel `code-editor`.
*   **Cách khắc phục:** Xóa dòng `export { default as PseudocodeViewer } from './components/PseudocodeViewer.vue';` khỏi `code-editor/index.ts`, thay bằng comment NOTE hướng dẫn import trực tiếp từ module sở hữu (`dsa-modules`) nếu cần dùng. Đồng thời giữ nguyên export `PseudocodePanel` vì nó đang là API công khai hợp lệ của module.

### Sua Loi 178: Hang Loat Vite Import-Analysis Failed Resolve Tren Toan Frontend (ERR_FRONTEND_BROKEN_IMPORTS_SWEEP)
*   **Mô tả:** Sau khi fix rieng code-editor/index.ts (Sua Loi 177), chay static check toan frontend phat hien them 30 broken relative import gay do cac file dich da bi xoa/di chuyen nhung code chua cap nhat. Tat ca deu khong the resolve khi Vite import-analysis quet module graph.
*   **Ma Loi:** ERR_FRONTEND_BROKEN_IMPORTS_SWEEP
*   **Nguyen nhan goc:** Qua trinh refactor truoc day da xoa/di chuyen 4 view file (OOPVisualizationView, SOLIDVisualizationView, PatternsView, DIView) sang he thong Docs, dong thoi xoa 4 modal file (TestCaseModal, TemplateModal, HintModal, CustomMarkdownEditor o vi tri cu) ma khong cap nhat cac diem import tuong ung trong isualizerMap.ts, LessonStepViz.vue, CodelabBuilderTab.vue, ItemFormModal.vue. Ngoai ra 3 view file (DashboardView.vue, GraphView.vue, Legend.vue) co relative path depth sai (off-by-one) do sau khi file duoc di chuyen vao subdirectory.
*   **Cach khac phuc:** Phan loai 30 loi thanh 3 nhom va xu ly:
    - **Nhom 1 (5 import, 2 file) — Sai do sau duong dan:** Sua ../features/... thanh ../../features/... trong DashboardView.vue:148-150 va GraphView.vue:79-85. Sua ../../store/... thanh ../store/... trong dsa-modules/components/Legend.vue:26.
    - **Nhom 2 (1 import) — Sai alias duong dan:** Sua ./CustomMarkdownEditor.vue thanh @/components/editor/CustomMarkdownEditor.vue trong ItemFormModal.vue:210 (canonical path da duoc 4 file khac su dung).
    - **Nhom 3 (7 file moi) — File bi xoa/di chuyen:** Tao 4 view stub (iews/oop/OOPVisualizationView.vue, iews/solid/SOLIDVisualizationView.vue, iews/patterns/PatternsView.vue, iews/di/DIView.vue) voi Props 	itle/message/targetRoute va redirect link sang /docs/... (route moi da ton tai). Tao 3 modal stub (iews/teacher/TestCaseModal.vue, TemplateModal.vue, HintModal.vue) voi Props/Emits interface khop parent (show, editingXxx, parentCodelab, emit update:show + save). Tat ca stub giu contract: emit tra du lieu hien tai de parent khong bi gay flow, UI hien thi "🚧 dang tai cau truc" voi link mo tai lieu moi.
*   **Verify:** rontend/scripts/find-missing-imports.cjs (custom static checker quet relative imports) bao OK: No missing relative imports found. (truoc do: 30 loi). 
px vue-tsc --noEmit exit code 0 (toan bo type check pass).

### Sua Loi 179: Frontend Features Audit Phat Hien Technical Debt An (Classroom Menu, Legacy Route, Empty CRUD) (ERR_FRONTEND_AUDIT_FIXES)
*   **Mô tả:** Audit 3 khu vực (classroom, teacher, courses) phát hiện 3 điểm tồn đọng ảnh hưởng user: (1) route /classrooms/:id không có menu link, (2) TeacherAnalyticsTab dùng route legacy không khớp convention /api/v1/, (3) 7 hàm CRUD trong CodelabBuilderTab chỉ có // Implementation rỗng.
*   **Ma Loi:** ERR_FRONTEND_AUDIT_FIXES
*   **Nguyen nhan goc:**
    - **(1)** Route /classrooms/:id được define từ trước nhưng thiếu view list /classrooms + menu entry → student chỉ truy cập được qua deep link.
    - **(2)** ClassroomController cũ (pi/[controller]) cung cấp teacher-specific endpoints (/mine, /{id}/statistics, /{id}/export-excel) mà 3 controller mới /api/v1/classrooms/* chỉ cover curriculum + progress + student analytics. Migration hoàn toàn sang v1 chưa khả thi.
    - **(3)** CodelabController (/api/v1/codelabs) hiện là skeleton — tất cả endpoint chỉ return Ok(new { message = "..." }) không thực sự persist. Frontend để hàm rỗng tốt hơn là wire-up lên stub (sẽ tạo 'fake success' 200 OK nhưng data mất khi reload).
*   **Cach khac phuc:**
    - **(1)** Tạo iews/classroom/MyClassroomsView.vue (gọi /api/Classroom/mine, kèm join modal). Thêm route /classrooms + menu entry trong ppTabs.ts.
    - **(2)** Giữ legacy URL trong TeacherAnalyticsTab.vue, thêm block NOTE comment ở đầu <script setup> giải thích lý do + hướng dẫn migrate khi backend sẵn sàng.
    - **(3)** Thay 8 hàm CRUD rỗng/sai bằng helper crudNotImplemented(action, endpoint) — show alert 'đang phát triển' + console.warn + block comment TODO với fetch boilerplate sẵn để uncomment khi backend ready.
*   **Verify:** ind-missing-imports.cjs ✓ clean, ind-duplicate-decls.cjs ✓ clean, ue-tsc --noEmit exit 0.

### S?a L?i 180: N�t "M� ph?ng thanh to�n" C�n Hi?n Th? Trong Production (ERR_SIMULATE_PAYMENT_PROD_LEAK)
* **M� t?:** N�t "?? M� ph?ng: X�c nh?n d� thanh to�n" trong PremiumCheckoutView.vue c� th? v?n hi?n th? trong production build do ki?m tra isDev chua d? robust.
* **M� L?i:** ERR_SIMULATE_PAYMENT_PROD_LEAK
* **Nguy�n nh�n g?c:** Vite thay th? import.meta.env.DEV th�nh false trong production, nhung d? d?m b?o t�nh v?ng ch?c, c?n ki?m tra c? import.meta.env.PROD.
* **C�ch kh?c ph?c:** C?p nh?t isDev = import.meta.env.DEV && !import.meta.env.PROD trong PremiumCheckoutView.vue.
* **Verify:** Build production ? n�t kh�ng xu?t hi?n trong DOM.

### S?a L?i 181: Difficulty Mismatch Trong TeacherCourseTab (ERR_COURSE_DIFFICULTY_MISMATCH)
* **M� t?:** TeacherCourseTab.vue d�ng Easy/Medium/Hard trong dropdown, trong khi backend enum CourseDifficulty v� view kh�c d�ng Beginner/Intermediate/Advanced.
* **M� L?i:** ERR_COURSE_DIFFICULTY_MISMATCH
* **Nguy�n nh�n g?c:** TeacherCourseTab vi?t d?c l?p, dropdown difficulty kh�ng d?ng b? backend enum.
* **C�ch kh?c ph?c:** C?p nh?t 3 d?a di?m: dropdown options, courseForm default, cancelCourseEdit reset � d?ng b? Beginner/Intermediate/Advanced.
* **Verify:** Vue-tsc --noEmit exit 0, backend build 0 errors.

### S?a L?i 182: D?n d?p Dead Code & Chuy?n d?i System Design Visualization Sang T�i Li?u (ERR_DEAD_CODE_CLEANUP)
* **M� t?:** D?n d?p to�n b? dead code (views, features) kh�ng c�n s? d?ng v� chuy?n d?i t�nh nang tr?c quan h�a thi?t k? h? th?ng th�nh t�i li?u l� thuy?t.
* **M� L?i:** ERR_DEAD_CODE_CLEANUP
* **Nguy�n nh�n g?c:** Nhi?u views v� features d� b? comment out trong routes nhung v?n t?n t?i trong codebase, g�y r?i v� tang k�ch thu?c bundle.
* **C�ch kh?c ph?c:**
    - **X�a 15 dead views:** AnimationView, CompareView, ConcurrencyView, DebugView, DSAModulesView, LeaderboardView, LearningPathView, MultiViewView, PlaygroundView, StateInspectorView, TimelinePlaybackView, di/, oop/, patterns/, solid/
    - **X�a dead feature:** smart-quiz (kh�ng du?c import ? d�u)
    - **Luu �:** animation-engine du?c gi? l?i v� dang du?c s? d?ng b?i nhi?u features ho?t d?ng (custom-input, code-to-visualization, dsa-modules, e-lecture, interactive-playground, lesson, quiz-system, pseudocode-sync)
    - **Chuy?n d?i System Design Visualization sang t�i li?u:** T?o 5 file markdown trong docs/content/system-design/ (system-design-intro, load-balancer, server-health, packet-routing, replication-lag, failure-handling). Th�m v�o docsNavigation.ts. X�a system-design-viz feature, SystemDesignVizView.vue, route /system, appTabs entry.
    - **C?p nh?t visualizerMap.ts:** Chuy?n hu?ng OOP/SOLID/Patterns/DI/SystemDesign t?i DocsView.vue
    - **C?p nh?t LessonStepViz.vue:** Chuy?n hu?ng OOP/SOLID t?i DocsView.vue
* **Verify:** vue-tsc --noEmit exit 0, frontend tests 688/688 PASS, find-missing-imports.cjs OK, dotnet build 0 errors.

### Sửa Lỗi 183: Audit & Fix Toàn Diện Module algorithm-sandbox (ERR_SANDBOX_ALGORITHM_AUDIT)
*   **Mô tả:** Rà soát toàn bộ module algorithm-sandbox (7 thuật toán, engine, composables, 30+ components) phát hiện và khắc phục các lỗi nghiêm trọng về tính đúng đắn thuật toán, stats không đồng nhất, edge case crash và layout vỡ trên màn hình thấp.
*   **Ma Loi:** ERR_SANDBOX_ALGORITHM_AUDIT
*   **Nguyen nhan goc:**
    - **(1) CountingSort sai bản chất:** chỉ đếm 1 pass theo chữ số hàng đơn vị (`val % 10`, Count cố định 10 ô) → mảng đa chữ số trả về kết quả KHÔNG sắp xếp nhưng description tuyên bố "đã sắp xếp"; số âm bị clamp `Math.max(0,...)` phá hỏng thứ tự.
    - **(2) RadixSort crash với số âm:** `Math.floor(-3/1) % 10 = -3` → `trackedBuckets[-3].push` ném TypeError; seed `Math.max(...input, 1)` biến mảng toàn âm thành crash. `sortedIndices` luôn rỗng ở mọi frame kể cả frame cuối.
    - **(3) QuickSort đệ quy không guard depth:** Lomuto trên mảng đã sắp xếp → độ sâu = n → StackOverflowException (che ngầm bởi MAX_ELEMENTS=15); hoán vị đặt pivot `[i+1]↔[high]` không `swaps++` → stats thiếu swap.
    - **(4) MergeSort đánh dấu sorted quá sớm:** `sortedIndices` gán sau mỗi merge trung gian dù phần tử sẽ bị merge phía sau di chuyển tiếp; thiếu hoàn toàn comparisons/writes stats.
    - **(5) Heap/Bubble empty-array:** mảng rỗng → `sortedIndices=[0]` + description "Root = undefined"; heap thiếu comparisons.
    - **(6) BucketSort:** insertion sort trong bucket không đếm comparisons/swaps; `arrayState` bất động suốt animation (tương tự CountingSort).
    - **(7) sortingIdEnricher đổi identity:** greedy nearest-value tráo identity giữa phần tử trùng giá trị khi swap nhảy xa (vd heap [10,5,5] swap [0]↔[2]).
    - **(8) UI layout:** VcrDockBar (max-w-2xl centered) đè chồng nút drawer trên màn hình < 800px; Counting/Bucket visualizer bị clip không scroll trên viewport thấp; Space phím tắt kích hoạt kép khi focus vào nút Play; dispatcher không có nhánh bubble tường minh + không có empty state khi generator lỗi; drawer cố định w-96 tràn viewport hẹp; useHeapSortVisualizer khớp keyword 'hoán đổi' không bao giờ trúng (generator emit "Hoán vị") → phase badge sai.
*   **Cach khac phuc:**
    - **(1)** Viết lại `countingSort.ts` thành LSD counting multi-pass (từng hàng chữ số: Count → Prefix Sum → Output), offset giá trị âm (val - min) để chữ số luôn hợp lệ [0..9]; `stepIndex` bắt đầu từ 0; `arrayState` tiến hóa dần (merged view nén: phần tử đã đặt chiếm vị trí ổn định, phần còn lại giữ thứ tự, id luôn duy nhất); frame cuối `sortedIndices` đủ; `activeDigitPlace` phục vụ visualizer.
    - **(2)** `radixSort.ts`: offset số âm, bỏ seed `1` sai, `sortedIndices` đủ ở frame cuối, mảng rỗng không crash.
    - **(3)** `quickSort.ts`: chuyển đệ quy → stack tường minh (không bao giờ tràn stack), `swaps++` khi đặt pivot (stats khớp 100% với swap frames).
    - **(4)** `mergeSort.ts`: chỉ đánh dấu sortedIndices ở phép gộp gốc phủ toàn mảng; bổ sung `comparisons` + `writes` stats.
    - **(5)** `heapSort.ts`/`bubbleSort.ts`: guard mảng rỗng (`sortedIndices` không gán [0] sai, không in "undefined"); heap bổ sung `comparisons` khớp từng frame so sánh.
    - **(6)** `bucketSort.ts`: bổ sung comparisons/swaps (khớp số frame So sánh/Hoán đổi); pha collect dùng merged view tiến hóa.
    - **(7)** `sortingIdEnricher.ts`: dùng sự kiện `swappedIndices` để hoán đổi identity xác định (giữ nguyên identity chính xác với phần tử trùng), greedy chỉ dùng cho ghi đè kiểu merge.
    - **(8)** UI: SortingView đổi bottom bar sang flex row (dock `flex-1 min-w-0 max-w-2xl` + drawer `shrink-0` tham gia layout, không chồng lấn); guard `BUTTON` trong handleKeydown; Counting/Bucket thêm `overflow-y-auto` cho vùng tier; dispatcher thêm nhánh `bubble` + empty/error state; drawer `w-80 max-w-[calc(100vw_-_1.5rem)] max-h-[min(520px,calc(100vh_-_6rem))]`; useHeapSortVisualizer dùng `heapSize < total` phân biệt BUILD/SORT thay keyword; sửa label tooltip heap dùng `currentHeapSize`; xóa `as any` trong ArrayBarVisualizer.
*   **Files sửa:** `algorithms/countingSort.ts`, `algorithms/radixSort.ts`, `algorithms/quickSort.ts`, `algorithms/mergeSort.ts`, `algorithms/heapSort.ts`, `algorithms/bubbleSort.ts`, `algorithms/bucketSort.ts`, `helpers/sortingIdEnricher.ts`, `composables/useHeapSortVisualizer.ts`, `components/SortingVisualizerDispatcher.vue`, `components/ArrayBarVisualizer.vue`, `components/CountingSortVisualizer.vue`, `components/BucketSortVisualizer.vue`, `components/SortingDrawerTrace.vue`, `views/sorting/SortingView.vue`, `__tests__/sortingEdgeCases.spec.ts` (mới, 27 test)
*   **Verify:** vitest 822/822 PASS (thêm 27 test edge-case), vue-tsc --noEmit exit 0.

### Sửa Lỗi 184: EF Core InMemory NRE khi Clear collection con có FK bắt buộc (ERR_INMEMORY_NAV_CLEAR)
* **Mô tả:** Test `UpdateCodelab_WithChildren_ShouldReplaceChildren` ném `NullReferenceException` tại `InternalEntityEntryNotifier.NavigationCollectionChanged` khi `SaveChangesAsync` trong `UpdateCodelabCommandHandler`.
* **Nguyên nhân gốc:** InMemory provider không hỗ trợ đúng việc xóa required dependents qua navigation collection (`codelab.TestCases.Clear()`). Đây là limitation đã biết của provider InMemory (EF khuyến nghị không dùng InMemory để test).
* **Cách khắc phục:** Bỏ mutation navigation collection trong handler; thay bằng `_context.CodelabTestCases.Where(tc => tc.CodelabId == id).ToListAsync()` → `RemoveRange(existing)` → `AddRange(new)`. Files sửa: `UpdateCodelabCommand.cs`, `CodelabCrudCommandHandlerTests.cs` (dùng `TestCases = new List<...>{...}` thay vì collection initializer).
* **Verify:** dotnet test 40/40 PASS.

### Sửa Lỗi 185: Deserialize JSON `"code": null` vào `int` (ERR_PISTON_NULL_CODE)
* **Mô tả:** Test Piston timeout ném `InvalidOperationException: Cannot get the value of a token type 'Null' as a number.` vì Piston trả `"code": null` (kill signal/timeout).
* **Nguyên nhân gốc:** `PistonStage.Code` là `int` nhưng JSON của Piston chứa `null` khi process bị timeout/kill.
* **Cách khắc phục:** Đổi `PistonStage.Code` thành `int?` và so sánh qua `(Code ?? 0)`. Files sửa: `PistonCodeJudgeService.cs`.
* **Verify:** dotnet test 40/40 PASS.

### Sửa Lỗi 186: Mojibake chuỗi tiếng Việt do PowerShell Set-Content -Encoding UTF8 (ERR_MOJIBAKE_PS)
* **Mô tả:** File `PistonCodeJudgeService.cs` bị hỏng chuỗi tiếng Việt ("Ngôn ngữ..." thay vì "Ngôn ngữ...") sau khi chỉnh sửa bằng `Set-Content -Encoding UTF8` từ PowerShell, khiến test `UnsupportedLanguage` fail khi so khớp message.
* **Nguyên nhân gốc:** PowerShell 5.1 `Get-Content`/`Set-Content` mặc định ANSI/Latin-1; đọc file UTF-8 rồi ghi lại đè làm double-encode các ký tự đa byte.
* **Cách khắc phục:** Ghi lại file bằng tool write (UTF-8 đúng), không dùng Set-Content cho file chứa ký tự không-ASCII. Verify chuỗi tiếng Việt sau khi ghi.
* **Verify:** dotnet test 40/40 PASS, message "Ngôn ngữ 'x' không được hỗ trợ..." hiển thị đúng.

### Sửa Lỗi 187: [Authorize(Roles)] trả 403 dù token hợp lệ (ERR_JWT_ROLE_CLAIM)
* **Mô tả:** POST /api/v1/codelabs trả 403 dù token thật từ AuthService có claim `"role":"Teacher"`. Mọi endpoint `[Authorize(Roles="Teacher,Admin")]` đều bị ảnh hưởng.
* **Nguyên nhân gốc:** .NET 8+ JwtBearer mặc định `MapInboundClaims=true` — claim "role" bị rename thành `ClaimTypes.Role` (URI dài), trong khi cấu hình `RoleClaimType="role"` không khớp claim đã rename → identity không có role.
* **Cách khắc phục:** Giữ `MapInboundClaims=true` (toàn app đọc `ClaimTypes.NameIdentifier`), đổi `RoleClaimType = ClaimTypes.Role` và `NameClaimType = ClaimTypes.NameIdentifier`. File sửa: `Program.cs`. Chi tiết ADR-22.
*   **Verify:** E2E POST/PUT/DELETE /api/v1/codelabs với token Teacher → 200.

### Sửa Lỗi 188: Cụm fix 2–7 — Sorting visualizers, BucketSort dải động, cô lập animation store, quiz/lesson, embed, boot an toàn (ERR_CLUSTER_FIX_2_7)
*   **Mô tả:** Làn sóng fix QA theo cụm: hiển thị sai chữ số counting/radix, bar âm vỡ khung, trace "1/0", heap cây ảo, bucket dải tĩnh sai với số âm/giá trị lớn, DSA module + playground dùng chung animation store, weight popover Escape vẫn submit, highlight comment sai màu, quiz lesson pass ẩu, embed options không khớp renderer, app treo khi backend chậm.
*   **Ma Loi:** ERR_CLUSTER_FIX_2_7
*   **Nguyen nhan goc:**
    - **(1) Singleton animation store dùng chung:** `useAnimationStore` là Pinia singleton được cả `InteractivePlayground` và `DSAPlayer` dùng; cả hai cùng mount trong `GraphView` (v-show) → loadResult của cái này ghi đè frames/pseudoCode/currentIndex của cái kia.
    - **(2) Graph input parse sai:** DSAPlayer graph mặc định theo dạng edge-list `'0-1-4'`, `parseInt("0-1-4")=0` nuốt rác → đồ thị toàn node 0; backend contract yêu cầu `inputData` = mảng giá trị NODE (cạnh tự sinh).
    - **(3) Renderer chọn theo tên algorithm:** AlgorithmVisualizer quyết định renderer bằng tên thuật toán thay vì dữ liệu frame → kết quả DSA graph (graphNodes) không bao giờ render đúng.
    - **(4) BucketSort dải tĩnh:** `[0-25), [25-50), [50-75), [75-100]` vô nghĩa với số âm hoặc giá trị > 100 → toàn bộ phần tử rơi 1 bucket hoặc index âm.
    - **(5) CountingSort hiển thị chữ số theo activePlace cố định:** luôn tính hàng đơn vị kể cả khi đang sort hàng chục; nhánh output "?" chết hiển thị khi chưa hoàn thành.
    - **(6) Escape → blur → submit:** input trọng số dùng blur để commit; phím Esc blur input trước keydown handler kịp chặn → vẫn submit.
    - **(7) Highlight comment sau keyword wrap:** comment chứa từ khóa (vd `// for`) bị bọc thẻ `<span>` keyword phá vỡ màu comment.
    - **(8) Lesson quiz không guard:** `completeStep` emit vô điều kiện; không chặn double-submit; chấm điểm khi chưa trả lời hết; chưa có ngưỡng đậu.
    - **(9) Embed options lạc hậu:** `EMBED_ALGORITHM_OPTIONS` chứa `quicksort-recursion` (bị bỏ map) + `binary-search/bst-insert/stack-operations/queue-operations` (không có trong VISUALIZER_MAP) → widget trống.
    - **(10) Boot tuần tự block mount:** `authStore.init().then(progressStore.initFromServer())` — backend treo > 5s → white screen.
    - **(11) Radix/Heap visualizer giả định frame non-null** → `frame.description` undefined ở pha collect, cây heap 6-node ảo dựng trước khi có frame.
*   **Cach khac phuc:**
    - **(1)** Refactor `useAnimationStore.ts`: factory `createAnimationVcrState()` → `useAnimationStore` (id 'animation') + `usePlaygroundAnimationStore` (id 'playground-animation'); InteractivePlayground/PlaygroundCanvas chuyển store mới; test cô lập `usePlaygroundAnimationStore.spec.ts` (3 test).
    - **(2)** DSAPlayer: default graph input `'50, 30, 70, 20, 40, 60, 80, 10'` (node values), parse chặt `^-?\d+$`, loadResult truyền nguyên graphNodes/treeNodes/distances (bỏ map strip highlight).
    - **(3)** AlgorithmVisualizer: `activeRenderer` ưu tiên frame data — `graphNodes` → GraphRenderer, `treeNodes` → TreeRenderer — trước khi rơi về tên algorithm; cast frame sang FrameDTO DSA.
    - **(4)** `bucketSort.ts`: bucket range động theo min/max/spread (`Math.floor(((v-min)/spread)*bucketCount)` clamp), helpers `fmtRange/rangeLabel/rangeSummary`, description mỗi frame kèm nhãn range `[min-max]` / `[low-high)`; +1 test số âm & >100 trong sortingEdgeCases.
    - **(5)** CountingSortVisualizer: helper `digitParts()` tính prefix/digit/suffix theo `activePlace`; bỏ nhánh "?"; BubbleSort bar height clamp span = max(maxVal, |minVal|, 1), ratio ≥ 0.
    - **(6)** InteractivePlayground: cờ `weightCancelRef` — `cancelWeightInput()` (Esc) ẩn popover + đánh dấu hủy; `submitWeight()` bỏ qua khi flag set.
    - **(7)** `highlightHelper.ts`: split comment trước (`/(\/\/[^\n]*)/g`), escape comment trước khi wrap keyword/number, unescape sau.
    - **(8)** LessonStepQuiz viết lại: PASS_THRESHOLD 0.7, quizScore/quizPassed/answeredCount, submit confirm khi còn câu trống, guard isSubmitted, resetQuiz, giải thích đáp án đúng khi fail, completeStep chỉ khi đậu; xóa QuizPanel.vue dead; excelParser skip câu rỗng + lọc quiz 0 câu; useQuizStore guard `isBackendQuizSubmitting` + throw khi 0 câu; BackendQuizWorkspace nút disabled 'Đang gửi...'.
    - **(9)** EmbedWidgetView map `'quicksort-recursion'` → SortingView; `EMBED_ALGORITHM_OPTIONS` giữ đúng 10 thuật toán được VISUALIZER_MAP hỗ trợ.
    - **(10)** `main.ts`: `Promise.allSettled([authStore.init(), progressStore.initFromServer()])` race timeout 5s → mount app không phụ thuộc backend.
    - **(11)** useRadixSortVisualizer: optional chain `frame()?.description`, placeholder dim `idx < activeIdx` pha distribute (phần tử đã vào bucket); useHeapSortVisualizer: n = length frame thực.
    - **(12)** SortingDrawerTrace: `codeBtnLabel` guard `total <= 0` + clamp step ≤ total (hết "1/0").
*   **Files sửa:** `store/useAnimationStore.ts`, `components/InteractivePlayground.vue`, `components/PlaygroundCanvas.vue`, `components/DSAPlayer.vue`, `components/AlgorithmVisualizer.vue`, `algorithms/bucketSort.ts`, `components/CountingSortVisualizer.vue`, `components/BubbleSortVisualizer.vue`, `components/SortingDrawerTrace.vue`, `composables/useRadixSortVisualizer.ts`, `composables/useHeapSortVisualizer.ts`, `helpers/highlightHelper.ts`, `views/lesson/components/LessonStepQuiz.vue`, `service/excelParser.ts`, `store/useQuizStore.ts`, `components/BackendQuizWorkspace.vue`, `views/embed/EmbedWidgetView.vue`, `types/embed-widget.types.ts`, `main.ts`, `__tests__/usePlaygroundAnimationStore.spec.ts` (mới), `__tests__/sortingEdgeCases.spec.ts` (+1); xóa `features/lesson/components/QuizPanel.vue`
 *   **Verify:** vitest 64 files / 859 tests PASS (858 + 1 sửa giả định test cô lập: `makeResult` giờ sinh N frame), vue-tsc --noEmit exit 0.

### 🚨 Lỗi 176: Counting Sort Visualizer Monolithic và Connector Gây Jank
*   **Mô tả:** Counting Sort dồn 588 dòng template/script vào một component; connector gọi `getBoundingClientRect()` mỗi frame và dùng SVG `animateMotion`, gây forced reflow, layout thrash và lỗi hiển thị không ổn định khi resize hoặc remount.
*   **Mã lỗi:** `ERR_COUNTING_VISUALIZER_LAYOUT_THRASH`
*   **Nguyên nhân phụ:** CSS riêng dùng nhiều `color-mix()`, không responsive; `getStableColor()` trả cùng một màu cho mọi ID nên không giữ được stable identity.
*   **Cách khắc phục:** Tách `useCountingSortVisualizer.ts`, `CountingBanner/Array/Grid/Output/Connector.vue`; thay connector bằng CSS-only flow label; xóa `CountingSortVisualizer.css`; dùng CSS variables và stable palette theo ID.
*   **Files sửa:** `components/CountingSortVisualizer.vue`, `components/counting-sort/*.vue`, `composables/useCountingSortVisualizer.ts`.

### 🚨 Lỗi 177: Counting Sort Không Có Input Identity Qua Các LSD Pass
*   **Mô tả:** Frame chỉ có `inputArray` dạng số và `arrayStateWithIds` có thể đã là merged output, khiến UI không thể xác định đúng ID của input source sau pass đầu; stable color bị sai hoặc đổi vị trí.
*   **Mã lỗi:** `ERR_COUNTING_INPUT_IDENTITY_LOST`
*   **Cách khắc phục:** Bổ sung `inputArrayWithIds` vào `SortFrame`, phát ra từ `countingSort.ts` ở mọi frame; UI dùng field này cho input array và `outputArrayWithIds` cho output.
*   **Verify:** Test mới `giữ metadata ID của input sau mỗi pass LSD`; full suite 64 files / 865 tests PASS.

### 🚨 Lỗi 178: Bucket Sort Visualizer Hardcode Range và Connector DOM Fragile
*   **Mô tả:** UI Bucket Sort hiển thị range cố định `[0-25)...[75-100]` dù algorithm đã dùng min/max động; connector gọi `querySelector()` và `getBoundingClientRect()` mỗi frame, SVG `animateMotion` dễ lỗi khi resize/remount.
*   **Mã lỗi:** `ERR_BUCKET_VISUALIZER_RANGE_AND_LAYOUT`
*   **Nguyên nhân phụ:** Component 405 dòng và CSS dùng nhiều `color-mix()`, input dùng `arrayStateWithIds` nên bị merged khi chuyển sang collect.
*   **Cách khắc phục:** Tách `useBucketSortVisualizer.ts`, `BucketBanner/Array/Grid/Output/Connector.vue`; thêm `bucketRangeLabels` và `inputArrayWithIds`; thay connector bằng CSS-only flow label; xóa CSS monolithic và dùng responsive grid.
*   **Files sửa:** `components/BucketSortVisualizer.vue`, `components/bucket-sort/*.vue`, `composables/useBucketSortVisualizer.ts`, `algorithms/bucketSort.ts`, `types/sorting.types.ts`.
*   **Verify:** Full suite 64 files / 866 tests PASS, `tsc --noEmit` pass.

### 🚨 Lỗi 179–184: P0 Critical Functional Bugs (2026-08-03)

*   **179 — BackendQuizWorkspace CSS Class Name Mismatch:**
    *   Template dùng class `topic-tab` / `topic-tab--active`, CSS định nghĩa `.topic-tab-btn` / `.topic-tab-btn.active` → topic filter buttons hoàn toàn không có style.
    *   Mã lỗi: `ERR_QUIZ_CLASSNAME_MISMATCH`
    *   Cách sửa: Đổi CSS match template, thêm sub-element styles.
*   **180 — DashboardView Hardcoded Stats:**
    *   `stats` computed trả về `totalCourses: 12, completedCourses: 3, streak: 7` cứng — không lấy từ store.
    *   Mã lỗi: `ERR_DASHBOARD_STATIC_STATS`
    *   Cách sửa: Kết nối `useCourseStore.courses.length`, `useUserProgressStore.completedModuleIds.length`, `useUserProgressStore.currentStreak`.
*   **181 — GraphView Zoom Level Always 100%:**
    *   `zoomLevel = ref(100)` không bao giờ cập nhật vì PlaygroundCanvas dùng local ref riêng.
    *   Mã lỗi: `ERR_GRAPH_ZOOM_STATIC`
    *   Cách sửa: Thêm `zoomLevel` vào Playground store, PlaygroundCanvas sync qua watch, GraphView đọc từ store.
*   **182 — GraphView Keyboard Shortcuts Dead:**
    *   Mảng `tools` hiển thị shortcuts `V/N/E/W/Del` nhưng không có `keydown` listener.
    *   Mã lỗi: `ERR_GRAPH_SHORTCUTS_DEAD`
    *   Cách sửa: Thêm `window.addEventListener('keydown')` với `shortcutMap` + input focus guard.
*   **183 — InteractiveLectureSlides Coordinator Memory Leak:**
    *   `LecturePlaybackCoordinator` tạo ở module scope, không bao giờ `destroy()` khi unmount.
    *   Mã lỗi: `ERR_LECTURE_COORDINATOR_LEAK`
    *   Cách sửa: Tạo trong `onMounted`, `destroy()` trong `onUnmounted`.
*   **184 — BackendQuizWorkspace Computed Side-Effect:**
    *   `isUsingFallback.value = ...` được gọi bên trong `computed()` getter — anti-pattern có thể gây render loop.
    *   Mã lỗi: `ERR_QUIZ_COMPUTED_SIDE_EFFECT`
    *   Cách sửa: Tách `isUsingFallback` thành computed thuần túy phụ thuộc `store.quizCatalog.length`.
*   **Files sửa:** `BackendQuizWorkspace.css`, `DashboardView.vue`, `usePlaygroundStore.ts`, `PlaygroundCanvas.vue`, `GraphView.vue`, `InteractiveLectureSlides.vue`, `BackendQuizWorkspace.vue`.
*   **Verify:** `tsc --noEmit` pass; 64 files / 866 tests PASS.

### 🚨 Lỗi 185–190: Playground Searching/Recursive Visualization Limitations (2026-08-03)

*   **185 — Searching demos không hiển thị search range, pointers, target:**
    *   Binary Search chỉ highlight mid, không hiển thị vùng `[low..high]`, không có con trỏ L/H/M, không hiển thị target value.
    *   Mã lỗi: `ERR_PLAYGROUND_SEARCH_NO_VISUALS`
    *   Cách sửa: Thêm `searchRange()`, `pointer()`, `searchTarget()`, `found()`, `comparisonCount()` hooks vào sandbox + renderer `drawArrayBars` hỗ trợ.
*   **186 — Searching demos không có found/not-found state rõ ràng:**
    *   Khi tìm thấy chỉ dùng amber (giống đang process), không phân biệt. Khi không tìm thấy không có overlay.
    *   Mã lỗi: `ERR_PLAYGROUND_SEARCH_NO_STATE`
    *   Cách sửa: `found()` hook + golden glow renderer + "✕ Not Found" overlay.
*   **187 — Recursive demos không có call stack visualization:**
    *   BST, tree-traversal, DFS dùng đệ quy nhưng canvas không hiển thị call stack hoặc recursion depth.
    *   Mã lỗi: `ERR_PLAYGROUND_RECURSIVE_NO_CALLSTACK`
    *   Cách sửa: Thêm `setCallStack()` hook + call stack panel renderer + depth badge.
*   **188 — BST demo không có branch pruning visualization:**
    *   BST search loại bỏ nhánh nhưng canvas không dim/prune nhánh không được visit.
    *   Mã lỗi: `ERR_PLAYGROUND_BST_NO_PRUNING`
    *   Cách sửa: Thêm `pruneNode()` hook + dashed/dimmed node renderer.
*   **189 — Tree layout dùng in-order positioning → overlap:**
    *   Cây失衡 có nodes chồng chéo vì layout chỉ đếm visit order.
    *   Mã lỗi: `ERR_PLAYGROUND_TREE_LAYOUT_OVERLAP`
    *   Cách sửa: Cải thiện tree renderer với margin responsive + call stack panel space.
*   **190 — Sandbox không có recursion depth limit + duplicate tree IDs:**
    *   Đệ quy sâu có thể gây StackOverflow. Duplicate values tạo duplicate node IDs → collision.
    *   Mã lỗi: `ERR_PLAYGROUND_SANDBOX_SAFETY`
    *   Cách sửa: Thêm `MAX_RECURSION_DEPTH = 100` + `buildTreeFromArray` tạo unique IDs (`5_2`, `5_3`).
*   **Files sửa:** `CompilerStepExecutor.ts` (type + hooks + sandbox), `algoCanvasHelpers.ts` (renderer), `playgroundAlgoDemos.ts` (7 demos), `AlgoInputParser.ts` (duplicate fix), `AlgoInputParser.spec.ts` (test update).
*   **Verify:** `tsc --noEmit` pass; 64 files / 866 tests PASS.

### 🚨 Lỗi 191: Sorting Playground Không Có Animation — Hard-Cut Snapshot Rendering (2026-08-03)

*   **Mô tả:** Algo-playground dùng `setInterval` + snapshot hard-cut — bars nhảy tức thì giữa frame N và N+1, không có interpolation, không easing. Canvas chỉ redraw khi `currentFrame` thay đổi qua Vue watcher.
*   **Mã lỗi:** `ERR_PLAYGROUND_NO_ANIMATION_ENGINE`
*   **Nguyên nhân gốc:** Rendering pipeline thuần snapshot-based: `drawPlaybackFrame(ctx, w, h, snapshot)` vẽ trực tiếp, không có `requestAnimationFrame` loop, không có `lerp()` giữa các frame.
*   **Cách sửa:**
    1. Tạo `SortingAnimationEngine` — RAF loop, lerp snapshots, cubic ease-out, interpolated bar rendering.
    2. Tạo `useAlgoAnimation` composable — wrap engine, kết nối store ↔ engine.
    3. Sửa `AlgoPlaygroundWorkspace.vue` — replace `setInterval` + `draw()` với engine RAF.
    4. Sửa `useAlgoPlaygroundStore.ts` — bỏ timer logic, giữ stepNext/play/pause.
    5. Sửa `algoCanvasHelpers.ts` — thêm `barColors?: string[]` parameter.
*   **Files sửa:** `SortingAnimationEngine.ts` (mới), `useAlgoAnimation.ts` (mới), `AlgoPlaygroundWorkspace.vue`, `useAlgoPlaygroundStore.ts`, `algoCanvasHelpers.ts`, `useAlgoPlaygroundStore.spec.ts`.
*   **Verify:** `tsc --noEmit` pass; 64 files / 866 tests PASS.

### 🚨 Lỗi 192: Tree Traversal Demo Cho Kết Quả Sai - Chỉ Thăm 3/9 Node (2026-08-03)

*   **Mô tả:** Demo "Tree Traversal (In-order)" chỉ thăm được `1, 3, 8` thay vì `1, 3, 4, 6, 7, 8, 10, 13, 14` — toàn bộ nhánh phải không bao giờ được duyệt.
*   **Mã lỗi:** `ERR_PLAYGROUND_RECURSION_SCOPE_CORRUPTION`
*   **Nguyên nhân gốc:** Instrumentation cũ dùng regex hoist mọi `let/const/var` lên đầu sandbox (`CompilerStepExecutor.ts`) → biến `left`/`right` của frame đệ quy cha bị frame con ghi đè trước khi dùng → closure đệ quy bị phá vỡ.
*   **Cách khắc phục:** Thay regex hoist bằng transform Babel AST (`instrumentAst`): giữ nguyên block scope/closure, chèn `__trackLine` theo statement + scope-aware variable capture, không hoist biến. File sửa: `CompilerStepExecutor.ts`, thêm test in-order trong `playgroundAlgoDemos.spec.ts`.

### 🚨 Lỗi 193: Vòng Lặp Vô Hạn 1 Dòng Treo Tab Trình Duyệt (2026-08-03)

*   **Mô tả:** `while (true) {}` viết trên 1 dòng làm treo cứng main thread — giới hạn 10000 bước không bao giờ được kiểm tra vì `__trackLine` chỉ chèn trước dòng, nằm ngoài thân vòng lặp.
*   **Mã lỗi:** `ERR_PLAYGROUND_INFINITE_LOOP_HANG`
*   **Cách khắc phục:** Thêm `__loopTick()` chèn vào ĐẦU thân mỗi vòng lặp (block wrap nếu thân là single statement) + ngưỡng riêng `MAX_LOOP_ITERATIONS = 1.000.000`. File sửa: `CompilerStepExecutor.ts` + test `CompilerStepExecutor.instrumentation.spec.ts`.

### 🚨 Lỗi 194: TrackLine Chèn Tại `{` Làm Đứt Khối If/Else (2026-08-03)

*   **Mô tả:** `if (x) { ... }` bị biến thành `if (x) __trackLine(...);{ ... }` → khối luôn chạy bất kể điều kiện → quick-sort chạy nhầm nhánh `continue`, BFS đẩy vô hạn, tree-traversal không thăm gì.
*   **Mã lỗi:** `ERR_PLAYGROUND_BLOCK_DETACHED`
*   **Cách khắc phục:** Không chèn trackLine vào BlockStatement; nhánh `if/else/try` xử lý qua `processBranch` (single-statement branch được bọc block). File sửa: `CompilerStepExecutor.ts`.

### 🚨 Lỗi 195: Quick-Sort Overlay Không Bao Giờ Hiển Thị (2026-08-03)

*   **Mô tả:** `drawQuickOverlay` đọc `vars.low/high` nhưng demo khai báo `lo/hi` → vùng partition + nhãn PIVOT chưa từng xuất hiện.
*   **Mã lỗi:** `ERR_PLAYGROUND_OVERLAY_VAR_CONTRACT`
*   **Cách khắc phục:** Đổi tên biến demo quick-sort sang `low/high` + thêm test contract `quick-sort frames expose low/high/p`. Tương tự heap-sort: `buildHeapTree` đọc `vars.n` — Babel giờ capture cả tham số hàm nên `n` của `heapify` xuất hiện đúng.

### 🚨 Lỗi 196: Tier-3 Custom Layouts Vẽ Dữ Liệu Giả (Counting/Radix/Bucket) (2026-08-03)

*   **Mô tả:** `SortingAnimationEngine` đọc `snap.countArray`, `snap.radixBuckets`, `snap.bucketSortBucketsWithIds`... — các field không tồn tại trên `CanvasStateSnapshot` → counting grid luôn hiển thị 0, bucket/radix columns luôn rỗng (18 lỗi TS2339).
*   **Mã lỗi:** `ERR_PLAYGROUND_TIER3_DEAD_DATA`
*   **Cách khắc phục:** Thêm 10 hooks mới vào sandbox (`setCounts`, `setCountingPhase`, `setOutputs`, `setBuckets`, `setBucketPhase`, `setDigitPlace`, `setActiveBucket`, `setRangeLabels`, `setBucketComparing`) + field mới trên `CanvasStateSnapshot`; viết lại demo counting/radix/bucket gọi hooks; renderer tiêu thụ field thật.

### 🚨 Lỗi 197: Demo Cho Kết Quả Sai/Crash Với Input Tùy Biến (2026-08-03)

*   **Mô tả:** counting-sort số âm → output sai `[2,3,4,-8,3]`; bucket-sort giá trị ≥ 1 → crash `Cannot read properties of undefined (reading 'push')`; binary-search trên mảng chưa sort → báo found sai im lặng; sliding-window mảng < 3 phần tử → NaN.
*   **Mã lỗi:** `ERR_PLAYGROUND_INPUT_EDGE_CASES`
*   **Cách khắc phục:** counting/radix dùng offset min; bucket-sort throw rõ ràng nếu giá trị ngoài `[0,1)`; binary-search/two-pointers kiểm tra mảng đã sort; sliding-window kiểm tra độ dài. File sửa: `playgroundAlgoDemos.ts`.

### 🚨 Lỗi 198: Parser Nuốt Lỗi Input Im Lặng (Trái Spec Sprint 5) (2026-08-03)

*   **Mô tả:** `AlgoInputParser.parseNumberArray` map NaN → 0 im lặng, không giới hạn độ dài; `buildGraphFromText` bỏ qua part sai định dạng — trái spec yêu cầu throw rõ ràng + giới hạn 20 phần tử.
*   **Mã lỗi:** `ERR_PARSER_SILENT_INPUT`
*   **Cách khắc phục:** Throw `Giá trị '...' không phải là số hợp lệ!`, giới hạn `MAX_ARRAY_LENGTH = 100`, throw cho edge sai định dạng, hỗ trợ weight âm/thập phân. File sửa: `AlgoInputParser.ts` + test cập nhật.

### 🚨 Lỗi 199: Desync Monaco Editor Khi Đổi Demo (2026-08-03)

*   **Mô tả:** Đổi demo qua dropdown → `store.code` đổi nhưng editor không `setValue` → editor hiển thị code cũ trong khi nút Chạy chạy code mới.
*   **Mã lỗi:** `ERR_PLAYGROUND_MONACO_DESYNC`
*   **Cách khắc phục:** Thêm `watch(store.code)` đồng bộ editor khi khác giá trị. File sửa: `AlgoPlaygroundWorkspace.vue`.

### 🚨 Lỗi 200: Engine Không Redraw Khi Resize Canvas Lúc Pause (2026-08-03)

*   **Mô tả:** RAF loop chỉ vẽ khi playing → resize cửa sổ lúc pause làm canvas kéo méo/mờ tới khi tương tác lại.
*   **Mã lỗi:** `ERR_PLAYGROUND_RESIZE_STALE`
*   **Cách khắc phục:** Thêm `ResizeObserver` trong `AlgoPlaygroundWorkspace.vue` gọi `anim.onResize()` → `engine.snapToCurrent()`.

### 🚨 Lỗi 201: Build Production Fail - 28 Lỗi Type Trong Algo-Playground (2026-08-03)

*   **Mô tả:** `vue-tsc -b` fail với 28 lỗi: duplicate `get isPlaying()` (TS2300), 15+ property không tồn tại trên `CanvasStateSnapshot` (TS2339), sai số tham số `drawComparisonCounter` (TS2554), implicit any...
*   **Mã lỗi:** `ERR_BUILD_TYPECHECK_BLOCKED`
*   **Cách khắc phục:** Xóa getter trùng, cast `?? [] as number[]`, bổ sung field vào `CanvasStateSnapshot`, sửa call-site helpers, viết lại 3 hàm custom layout. Ngoài ra sửa luôn 9 lỗi pre-existing ở module khác (dsa-modules distances, quiz-system redeclare, quiz destroy, courses coverImageUrl, graph templates) → `npm run build` PASS hoàn toàn.

### 🚨 Lỗi 202: Demos Stack/Monotonic-Stack Push-Rồi-Pop Nhấp Nháy Vô Nghĩa (2026-08-03)

*   **Mô tả:** Demo gọi `push(top)` rồi `pop(top)` liền kề → visualization ngăn xếp nhấp nháy; không thể hiện các index thực sự được đẩy vào stack.
*   **Mã lỗi:** `ERR_PLAYGROUND_STACK_FLICKER`
*   **Cách khắc phục:** Chỉ gọi `pop(top)` khi pop thật; `push(i)` khi đẩy index vào stack; thêm `log()` mô tả kết quả. File sửa: `playgroundAlgoDemos.ts`.

### 🚨 Lỗi 203: Compile Chạy Đồng Bộ Trên Main Thread - Đơ UI & Treo Tab (2026-08-03)

*   **Mô tả:** `useAlgoPlaygroundStore.run()` gọi `compileAlgorithm` đồng bộ trên main thread → với input lớn (80-100 phần tử, ~10k frames) UI đơ 200-500ms; nếu guard chống vòng lặp vô hạn bị bỏ sót, toàn bộ tab bị treo cứng. Ngoài ra `new Function` chạy trong main thread có toàn quyền truy cập DOM.
*   **Mã lỗi:** `ERR_PLAYGROUND_MAIN_THREAD_COMPILE`
*   **Cách khắc phục:** Đưa toàn bộ pipeline compile sang **Web Worker**:
    1. `compiler.worker.ts` — nhận `{requestId, sourceCode, initialArray, options}`, gọi `compileAlgorithm`, trả `{requestId, ok, frames|error}`.
    2. `compileWorker.ts` — singleton worker + timeout 15s; quá hạn thì `worker.terminate()` (kill switch cuối) + reject lỗi rõ ràng; `disposeCompileWorker()` khi unmount.
    3. Store: `run()` bất đồng bộ (`runAsync`) + `runSeq` chống kết quả stale khi user bấm Chạy liên tiếp + `isCompiling` state + `pendingPlayAfterCompile` (bấm play khi chưa compile xong sẽ tự phát sau khi xong).
    4. UI: nút Chạy hiển thị "⏳ Đang chạy…" và disabled khi đang compile.
    5. Test: mock `compileInWorker` chạy đồng bộ trong vitest (worker thật không chạy được trong jsdom).
*   **Files sửa:** `compiler.worker.ts` (mới), `compileWorker.ts` (mới), `useAlgoPlaygroundStore.ts`, `AlgoPlaygroundWorkspace.vue`, `useAlgoPlaygroundStore.spec.ts` (+2 test: isCompiling, stale result).

### 🚨 Lỗi 204: Cây Sâu/Suy Biến Vẽ Chồng Lấn Node (2026-08-03)

*   **Mô tả:** `drawTree` dùng `nodeR = 18` cố định → BST suy biến (input đã sort, depth ~100) hoặc cây heap lớn vẽ node đè chồng lên nhau; `assign()` đệ quy không giới hạn độ sâu.
*   **Mã lỗi:** `ERR_PLAYGROUND_TREE_OVERLAP_DEEP`
*   **Cách khắc phục:** Scale `nodeR = min(18, max(5, slotPx * 0.4, levelH * 0.35))` theo khoảng cách slot ngang + chiều cao tầng; thêm `MAX_TREE_DEPTH = 60` guard trong `assign()`. File sửa: `algoCanvasHelpers.ts`.

### 🚨 Lỗi 205: 4 Panel Canvas Chồng Nhau Ở Góc Trên-Phải (2026-08-03)

*   **Mô tả:** `drawLegend`, `drawCallStackPanel`, `drawComparisonCounter`, `drawDepthBadge` cùng tọa độ góc trên-phải (y=12) → demo BST/DFS/Tree-traversal (có callStack + searchTarget + comparisonCount + recursionDepth đồng thời) hiển thị 4 panel đè lên nhau hoàn toàn. Legend còn luôn hiển thị 4 item mặc định kể cả khi không có yếu tố đặc biệt.
*   **Mã lỗi:** `ERR_PLAYGROUND_CANVAS_PANEL_OVERLAP`
*   **Cách khắc phục:** `drawCallStackPanel` dời sang góc trái (x=12); badge counter + depth + legend xếp dọc theo con trỏ `topRightY` (mỗi badge +30px); depth badge ẩn khi đã có callstack (panel đã hiện depth trong header); legend chỉ render khi `searchTarget` được set (trạng thái found/pruned). File sửa: `algoCanvasHelpers.ts`.

### 🚨 Lỗi 206: ResizeObserver Tạo Ở Setup Nên Không Bao Giờ Hoạt Động (2026-08-03)

*   **Mô tả:** Khối tạo `ResizeObserver` nằm trong `setup()` khi `canvasEl` chưa được bind (luôn null) → observer không bao giờ được tạo → resize cửa sổ lúc pause vẫn làm canvas méo.
*   **Mã lỗi:** `ERR_PLAYGROUND_RESIZE_OBSERVER_DEAD`
*   **Cách khắc phục:** Di chuyển khởi tạo observer vào `onMounted` sau khi canvas đã bind. File sửa: `AlgoPlaygroundWorkspace.vue`.

### 🚨 Lỗi 207: Bar Label Font Cố Định + Số Âm Vẽ Sai (2026-08-03)

*   **Mô tả:** `drawArrayBars`/`computeGeo` dùng font 9-11px cố định → mảng ≥ 30 phần tử thì value/index đè chồng; `maxVal = Math.max(...array, 1)` → số âm hiển thị như vạch 3px mất thông tin.
*   **Mã lỗi:** `ERR_PLAYGROUND_BAR_RENDERING`
*   **Cách khắc phục:** Font scale theo barW (`min(11, max(6, barW*0.5))`, ẩn label khi barW < 7); vẽ **baseline 0**: số dương dựng lên, số âm đâm xuống (`zeroY` dựa trên span min..max). Áp dụng đồng bộ cho `drawArrayBars`, `SortingAnimationEngine.computeGeo`, counting layout input tier. File sửa: `algoCanvasHelpers.ts`, `SortingAnimationEngine.ts`.

### 🚨 Lỗi 208: HOOKS_HINT 22 Dòng Nhét Vào Đầu Editor (2026-08-03)

*   **Mô tả:** `register()` prepend HOOKS_HINT vào mọi demo code → editor hiển thị ~22 dòng comment chiếm 1/3 màn hình trước code thật; gutter click lên vùng hint không nhảy (không có frame).
*   **Mã lỗi:** `ERR_PLAYGROUND_HOOKS_HINT_IN_EDITOR`
*   **Cách khắc phục:** `register()` trả demo nguyên bản (code sạch); `HOOKS_HINT` export riêng, hiển thị qua nút "ℹ️ Hooks" (panel collapsible dưới toolbar). File sửa: `playgroundAlgoDemos.ts`, `AlgoPlaygroundWorkspace.vue`, test cập nhật.

### 🚨 Lỗi 209: Editor 42% Cố Định + Không Responsive Mobile (2026-08-03)

*   **Mô tả:** Editor|Canvas chia 42/58 cố định không kéo co; không có breakpoint xếp dọc → tablet/mobile chật không dùng được.
*   **Mã lỗi:** `ERR_PLAYGROUND_LAYOUT_RIGID`
*   **Cách khắc phục:** Dùng `splitpanes` (đã có trong deps, pattern `CodelabPlayer`): Pane 42/58 kéo co được; `:horizontal="isStacked"` khi màn hình < 768px (editor trên, canvas dưới); thêm empty state "Chọn demo và bấm ▶ Chạy" + overlay "⏳ Đang biên dịch…" trên canvas. File sửa: `AlgoPlaygroundWorkspace.vue`.

### 🚨 Lỗi 210: Message Lỗi Compile Thô Kỹ Thuật (2026-08-03)

*   **Mô tả:** Lỗi hiển thị nguyên message JS ("Unexpected token 'else'", "Cannot read properties of undefined") — khó hiểu với sinh viên.
*   **Mã lỗi:** `ERR_PLAYGROUND_RAW_ERROR_MESSAGE`
*   **Cách khắc phục:** Thêm `compileErrorTranslator.ts` — map 9 nhóm lỗi phổ biến sang gợi ý tiếng Việt (cú pháp, vượt bước, vòng lặp vô hạn, undefined, gọi hàm sai, trùng khai báo...) kèm message gốc trong ngoặc; áp dụng trong `runAsync`. File sửa: `compileErrorTranslator.ts` (mới), `useAlgoPlaygroundStore.ts` + test 9 case.

### 🚨 Lỗi 211: Thiếu Các Tiện Ích VCR/Trace Cơ Bản (2026-08-03)

*   **Mô tả:** Không có trace history (log() bị mất sau mỗi bước), không keyboard shortcuts, không nút về cuối, speed chỉ 0.5-3x, không có nút sinh input ngẫu nhiên/khôi phục code mẫu, không persist state sau refresh.
*   **Mã lỗi:** `ERR_PLAYGROUND_VCR_MINIMAL`
*   **Cách khắc phục:** Store thêm `traceLogs` computed (lọc frame "Đang chạy dòng N" rác, tối đa 200 dòng) + persist `{demoId, code, inputRaw}` qua localStorage; workspace thêm: nút 🎲 sinh input theo demo (bucket [0,1), binary-search sorted, graph liên thông...), nút ↺ Code mẫu, nút ⭮ Format, hotkeys Space/←/→/Shift+→/Home/End, nút ⏩ về cuối, speed [0.25..4], panel "🧾 Lịch sử", aria-label; `PlaygroundView` validate `?demo=` không hợp lệ → fallback bubble-sort. Files sửa: `useAlgoPlaygroundStore.ts`, `AlgoPlaygroundWorkspace.vue`, `PlaygroundView.vue`, `playgroundAlgoDemos.ts` (+generateDemoInput), `compileErrorTranslator.ts`.

### 🚨 Lỗi 212: Tree/Graph Nhảy Cóc Giữa Các Frame - Không Nội Suy (2026-08-03)

*   **Mô tả:** `drawInterpolated` chỉ nội suy cho mảng; mọi snapshot tree/graph (BST, DFS, Dijkstra, heap/merge tree) hard-cut frame-to-frame; demo tree/graph còn bị **trắng màn hình giữa các frame khi đang play** (rơi vào nhánh array-switch với mảng rỗng).
*   **Mã lỗi:** `ERR_PLAYGROUND_TREE_GRAPH_HARD_CUT`
*   **Cách khắc phục:** Thêm pipeline transition trong `algoCanvasHelpers.ts`:
    1. Tách `computeTreeLayout()` (in-order layout dùng chung) + `nodeStateColor()`/`edgeStateColor()`.
    2. `drawTreeTransition`/`drawGraphTransition` — lerp màu trạng thái node/edge giữa prev và curr (id node làm khóa, vị trí ổn định).
    3. `drawPlaybackFrameTransition(ctx, w, h, prev, curr, t): boolean` — trả false nếu không phải tree/graph để engine fallback về array path.
    4. Tách `drawSnapshotOverlays()` (badge/counter/callstack/legend) dùng chung cho frame tĩnh + transition.
    Engine: nhánh `isTreeAlgorithm` bị xóa — mọi snapshot tree/graph đều qua transition khi `progress ∈ (0,1)`. File sửa: `algoCanvasHelpers.ts`, `SortingAnimationEngine.ts`.

### 🚨 Lỗi 213: Không Có Component Tests Cho AlgoPlaygroundWorkspace (2026-08-03)

*   **Mô tả:** Toàn bộ test trước đây chỉ phủ store/engine — UI (toolbar, hotkeys, trace panel, empty state, Monaco sync) không có test nào; `@vue/test-utils` đã có trong deps nhưng chưa từng dùng (0 spec file component trong toàn dự án).
*   **Mã lỗi:** `ERR_PLAYGROUND_NO_COMPONENT_TESTS`
*   **Cách khắc phục:** Tạo `AlgoPlaygroundWorkspace.spec.ts` (môi trường jsdom per-file) mock Monaco (`editor.create` stub + `?worker`), splitpanes, compileWorker; 9 test: load demo + step counter, description, đổi demo qua select, hooks panel, random input, hotkey Space/ArrowRight, trace history lọc frame rác, overlay "Đang biên dịch". Phát hiện luôn bug mock thiếu `revealLineInCenter` (watcher `syncLineToEditor` throw → phá vỡ reactivity của cả component).

### 🚨 Lỗi 214: Không Có Phản Hồi Live Cho Input (2026-08-03)

*   **Mô tả:** Lỗi input chỉ hiện SAU khi bấm Chạy (trong hộp lỗi) — người dùng gõ sai không biết cho tới khi chạy; không biết input hiện có bao nhiêu phần tử.
*   **Mã lỗi:** `ERR_PLAYGROUND_NO_LIVE_INPUT_FEEDBACK`
*   **Cách khắc phục:** Store thêm `inputValidation` computed (parse ngay khi gõ: `✓ N phần tử` xanh / `✗ <lỗi>` đỏ); hiển thị bên phải dòng mô tả demo. File sửa: `useAlgoPlaygroundStore.ts`, `AlgoPlaygroundWorkspace.vue` + 3 tests store.

### 🚨 Lỗi 215: Scrubber Thô - Không Marker Bước Quan Trọng, Không Preview (2026-08-03)

*   **Mô tả:** Timeline dài hàng nghìn frame: người học không biết bước nào quan trọng (swap/tìm thấy) để tua tới; hover trên slider không hiện description.
*   **Mã lỗi:** `ERR_PLAYGROUND_SCRUBBER_BLIND`
*   **Cách khắc phục:** Store thêm `notableSteps` (frame có `swappingIndices` → ⇄, `searchFound` → ✓; giới hạn 15 marker lấy đều); workspace vẽ chấm vàng trên scrubber + tooltip preview description khi hover (tính frame từ clientX). File sửa: `useAlgoPlaygroundStore.ts`, `AlgoPlaygroundWorkspace.vue` + 2 tests store + 1 test component.

### 🚨 Lỗi 216: Thiếu Thông Tin Độ Phức Tạp Thuật Toán Trên UI (2026-08-03)

*   **Mô tả:** `AlgoDemo` không có metadata độ phức tạp — học sinh xem demo nhưng không thấy O(n²)/O(n log n) kèm giải thích.
*   **Mã lỗi:** `ERR_PLAYGROUND_NO_COMPLEXITY_INFO`
*   **Cách khắc phục:** Thêm `complexity`/`space` vào `AlgoDemo` + map `DEMO_COMPLEXITY` cho 21 demo (merge trong `register`); UI hiển thị chip ⏱ O(n²) / 💾 O(1) bên cạnh mô tả. File sửa: `playgroundAlgoDemos.ts`, `AlgoPlaygroundWorkspace.vue` + test component.

### 🚨 Lỗi 217: Thiếu Fullscreen Canvas + VCR Disabled States + Trace Autoscroll (2026-08-03)

*   **Mô tả:** Không có chế độ toàn màn hình canvas (trình chiếu lớp học); nút VCR vẫn bấm được khi chưa có frame (no-op, gây hiểu lầm); trace history không tự cuộn xuống log mới.
*   **Mã lỗi:** `ERR_PLAYGROUND_VIEWER_POLISH`
*   **Cách khắc phục:** Nút ⛶ fullscreen trên `canvasWrap` (+ CSS `:fullscreen` dark bg); `:disabled` cho ⏮⏭⏩⟲ khi `totalFrames === 0` + style disabled; watch `traceLogs.length` → autoscroll `traceScrollEl`. File sửa: `AlgoPlaygroundWorkspace.vue`.

### 🚨 Lỗi 218: Không Chia Sẻ Được Trạng Thái Playground (2026-08-03)

*   **Mô tả:** Chỉ share được demo mặc định qua `?demo=` — code đã sửa + input tùy biến không thể chia sẻ giữa học viên/giảng viên.
*   **Mã lỗi:** `ERR_PLAYGROUND_NO_SHARE`
*   **Cách khắc phục:** Nút 🔗 Chia sẻ — nén `{demo, code, input}` bằng lz-string (tái dùng `PlaygroundUrlCodec` pattern) vào query `?src=`; workspace đọc `route.query.src` khi mount → restore + chạy; clipboard fallback `window.prompt`. File sửa: `AlgoPlaygroundWorkspace.vue`.

### 🚨 Lỗi 219: Lỗi Type Ảo Do Cache Incremental vue-tsc (2026-08-03)

*   **Mô tả:** `vue-tsc -b` (non-force) đôi khi báo TS2339 phantom cho template binding tồn tại (`parseEmojiToSvg` ở ExplanationPanel/RadixInspector) — build fail gián đoạn dù `vue-tsc -b --force` sạch. Do tsbuildinfo template-check bị stale.
*   **Mã lỗi:** `ERR_BUILD_PHANTOM_TYPECHECK`
*   **Cách khắc phục:** Đổi build script thành `vue-tsc -b --force && vite build` — luôn rebuild đầy đủ (chi phí ~+20s, đổi lấy tính deterministic).

### 🚨 Lỗi 220: Restore Trạng Thái Không Khôi Phục inputKind (2026-08-03)

*   **Mô tả:** `restoreState()` (localStorage) và `restoreSharedState()` (URL ?src=) chỉ gán `demoId` — `inputKind` giữ nguyên giá trị mặc định 'array'. Reload trang trên demo graph (bfs/dijkstra) → input validation parse text đồ thị như mảng (hint sai) và `run()` parse sai kiểu → compile lỗi.
*   **Mã lỗi:** `ERR_PLAYGROUND_RESTORE_INPUTKIND`
*   **Cách khắc phục:** Thêm action `applyExternalDemo(id)` đặt `demoId` + `inputKind` từ demo (không reset code/input); dùng chung cho cả 2 đường restore. File sửa: `useAlgoPlaygroundStore.ts`, `AlgoPlaygroundWorkspace.vue` + 2 tests (restore inputKind, applyExternalDemo giữ code).

### 🚨 Lỗi 221: Input Rỗng Trên Demo Graph Báo Sai "4 phần tử" (2026-08-03)

*   **Mô tả:** `inputValidation` gọi `parse('')` → `buildGraphFromText` trả default graph 4 node → hint "✓ 4 phần tử" dù người dùng chưa nhập gì.
*   **Mã lỗi:** `ERR_PLAYGROUND_EMPTY_INPUT_HINT`
*   **Cách khắc phục:** Nếu `inputRaw` rỗng (trim) → trả `{ valid: true, message: 'Input trống' }` trước khi parse. File sửa: `useAlgoPlaygroundStore.ts` + test.

### 🚨 Lỗi 222: Listener matchMedia Không Được Gỡ Đúng (Leak) (2026-08-03)

*   **Mô tả:** `onBeforeUnmount` gọi `removeEventListener('change', () => undefined)` — gỡ một hàm khác hàm đã đăng ký → listener giữ ref component đã unmount tồn tại vĩnh viễn trên MediaQueryList toàn cục.
*   **Mã lỗi:** `ERR_PLAYGROUND_MEDIAQUERY_LEAK`
*   **Cách khắc phục:** Giữ handler trong biến module `onMediaChange` và gỡ đúng tham chiếu. File sửa: `AlgoPlaygroundWorkspace.vue`.

### 🚨 Lỗi 223: Review Phát Hiện Lỗi Tự Gây Khi Tối Ưu + Perf Nhỏ (2026-08-03)

*   **Mô tả:** Vòng self-review phát hiện: (1) edit tối ưu `nodeStateColor` làm mất khối vẽ stroke/text của `drawTreeTransition` (bắt được ngay nhờ typecheck sau mỗi edit — đã phục hồi); (2) `nodeStateColor` tạo `new Set` mỗi node → O(n²)/frame khi vẽ cây 100 node; (3) `generateDemoInput` graph có thể sinh cạnh trùng với spanning tree.
*   **Mã lỗi:** `ERR_PLAYGROUND_SELF_REVIEW_FIXES`
*   **Cách khắc phục:** (1) phục hồi block; (2) truyền `prunedSet` dùng chung qua tham số optional; (3) đánh dấu cạnh spanning tree vào `used`. Files sửa: `algoCanvasHelpers.ts`, `playgroundAlgoDemos.ts`.

### 🚨 Lỗi 224: Hoạt Ảnh Đè Chồng Khi Chạy Tự Động (Ghosting) (2026-08-03)

*   **Mô tả:** Chạy play tự động → các bar/trail/glow của frame trước không bị xóa, đè chồng lên frame mới (vệt arc swap, halo glow compare, đầu bar cũ khi bar co ngắn, overlay bubble/MIN tích tụ). Step thủ công không bao giờ gặp — vì đi nhánh `drawPlaybackFrame` có `clearCanvas`.
*   **Mã lỗi:** `ERR_PLAYGROUND_TRANSITION_NO_CLEAR`
*   **Nguyên nhân gốc:** `SortingAnimationEngine.drawInterpolated` chỉ clear canvas khi `!this.curr`; 4 nhánh transition (`drawSwap`/`drawCompare`/`drawHighlight`/`drawMove`) vẽ trực tiếp lên canvas mà KHÔNG clear — mỗi RAF tick cộng dồn hình cũ.
*   **Cách khắc phục:** Clear canvas ngay sau `setTransform` ở đầu `drawInterpolated` (trước mọi nhánh vẽ — static/custom đã tự clear nên không sao). File sửa: `SortingAnimationEngine.ts`.
*   **Verify:** Thêm `SortingAnimationEngine.spec.ts` (mock canvas + ctx spy + rAF stub): (1) chạy play 1 RAF tick → `clearRect` phải tăng (regression — trước fix không tăng); (2) 1 tick = đúng 1 lần clear.

### 🚨 Lỗi 225: Race Timing Watcher Async Gây Transition Lệch/Đè Khi Play Tự Động (2026-08-03)

*   **Mô tả:** Báo cáo lại hiện tượng "đè hoạt ảnh lên nhau khi chạy tự động" (step thủ công không bao giờ gặp). Sau khi đã fix thiếu clear canvas (Lỗi 224), phân tích sâu tìm ra **race thứ hai**: `setSnapshots` khi đang play KHÔNG reset `progress` — watcher Vue (flush microtask) có thể trễ 1-2 RAF tick trên thiết bị chậm/render nặng → snapshots mới rơi vào giữa transition cũ → transition kế tiếp "tiếp tục" từ progress ≈ 0.5 → bar vẽ lệch giữa 2 cặp frame → nhòe/jump. Ngoài ra: (1) tick vừa advance vẽ lại transition CŨ ở progress 0 bằng snapshots cũ rồi tick sau lại vẽ transition mới → 2 hình khác nhau trong 2 tick liên tiếp; (2) `lerpColorHex` bỏ kênh alpha của màu rgba (pruned 0.2 → đặc cứng khi lerp transition cây/đồ thị); (3) pause để treo giữa chừng transition (không snap).
*   **Mã lỗi:** `ERR_PLAYGROUND_WATCHER_TRANSITION_RACE`
*   **Cách khắc phục:**
    1. `setSnapshots`: khi đang play → `progress = 0` (transition mới bắt đầu sạch, miễn nhiễm với độ trễ watcher); khi không play → `progress = 1` + vẽ frame tĩnh (giữ nguyên).
    2. RAF loop: tick vừa `onFrameAdvance` KHÔNG vẽ (chờ watcher cập nhật snapshots) — mỗi tick chỉ vẽ 1 transition nhất quán.
    3. `lerpColorHex`: parse + lerp cả alpha → giữ màu trong suốt (rgba) khi transition.
    4. `useAlgoAnimation`: pause → `engine.snapToCurrent()` — dừng ở frame tĩnh của bước hiện tại.
*   **Files sửa:** `SortingAnimationEngine.ts`, `algoCanvasHelpers.ts`, `useAlgoAnimation.ts`.
*   **Verify:** `SortingAnimationEngine.spec.ts` +3 tests: (a) tick advance không vẽ + setSnapshots khi play reset progress=0 + tick kế vẽ transition mới; (b) setSnapshots khi không play snap progress=1 và vẽ; (c) clear đúng 1 lần/tick (giữ từ Lỗi 224). 68 files / 926 tests PASS, `vue-tsc -b --force` CLEAN, `npm run build` SUCCESS.

### 🚨 Lỗi 226: Bấm Play Không Chạy Ở Bước 0 - Phải Step 1 Lần Mới Tự Chạy (2026-08-03)

*   **Mô tả:** Bấm ▶ tại `currentIndex=0` (hoặc play ngay sau khi compile) → không có gì diễn ra; phải bấm ⏭ một lần rồi mới tự động chạy.
*   **Mã lỗi:** `ERR_PLAYGROUND_PLAY_AT_STEP0`
*   **Nguyên nhân gốc:** `useAlgoAnimation.syncSnapshots` truyền `prev = null` khi `idx === 0` → RAF loop có điều kiện `if (this._playing && this.prev && this.curr)` → **prev null nên loop không bao giờ advance** (không tăng progress, không onFrameAdvance). Sau khi step 1 lần, prev có giá trị → play mới hoạt động.
*   **Cách khắc phục:** `syncSnapshots` dùng `frames[Math.max(0, idx - 1)]` làm prev — ở bước 0 prev = chính frame 0 (prev === curr → transition 'move' vẽ tĩnh rồi advance bình thường). File sửa: `useAlgoAnimation.ts` + regression test engine (prev===curr + play → advance).

### 🚨 Lỗi 227: Đường Kẻ/Sợi Dây Trang Trí Gây Nhiễu Trong Animation (2026-08-03)

*   **Mô tả:** Người dùng phản hồi các đường kẻ + sợi dây nối trong animation khó chịu: connector curve nối 2 bar đang compare, arc trail dashed khi swap, bracket + sorted-boundary của bubble, mũi tên nối MIN/KEY của selection/insertion, viền stroke vùng partition quick-sort, bracket dọc search range của binary search.
*   **Mã lỗi:** `ERR_PLAYGROUND_DECORATIVE_LINES`
*   **Cách khắc phục:** Bỏ toàn bộ các nét kẻ trang trí, giữ lại phần thông tin: glow + pulse compare, arc swap (bar bay), badge MIN/KEY + bar KEY nổi, vùng partition tô mờ (bỏ viền), vùng search tô mờ + con trỏ L/H/M (bỏ bracket dọc), vòng PIVOT. Files sửa: `SortingAnimationEngine.ts` (drawSwap/drawCompare/drawBubbleOverlay/drawSelectionOverlay/drawInsertionOverlay/drawQuickOverlay), `algoCanvasHelpers.ts` (drawArrayBars bỏ search bracket).

### 🚨 Lỗi 228: Merge Sort Dùng Cây 3-Node Giả + Bar Dịch Chung - Thiếu Animation Riêng (2026-08-03)

*   **Mô tả:** Visualization merge-sort trước đây: (1) `buildMergeTree` dựng cây 3 node GIẢ (root/left/right) chỉ hiển thị SỐ LƯỢNG phần tử hai nửa, không phải giá trị; (2) phần còn lại dùng pipeline bar 'move' chung — không thể hiện quá trình CHIA (segment nhỏ dần) và TRỘN (con trỏ so sánh 2 nửa, output điền dần).
*   **Mã lỗi:** `ERR_PLAYGROUND_MERGE_FAKE_TREE`
*   **Cách khắc phục:** Xây dựng **animation engine riêng cho Merge Sort**:
    1. `MergeSortAnimationEngine.ts` (mới) — engine stateless, singleton, hoàn toàn data-driven: Tier 1 mảng gốc với vùng segment [low..high] (nửa trái/phải tô khác màu), Tier 2 hai hàng L/R với con trỏ `leftIdx`/`rightIdx`, Tier 3 output đang điền dần + slot kế tiếp; phase label "01 CHIA / 02 TRỘN · width · [low..high]". Không kẻ viền (theo yêu cầu bỏ đường kẻ).
    2. Compiler: interface `MergeSortState` + field `mergeState` trên `CanvasStateSnapshot` + hook `setMergeState(state)` (deep-copy left/right/output) + sandbox param.
    3. Demo merge-sort viết lại bottom-up: gọi `setMergeState` pha divide (trước khi trộn từng segment) và mỗi bước merge (cập nhật con trỏ + output); giữ `compare(left+a, left+width+b)` + `highlight`.
    4. `SortingAnimationEngine`: `isCustomLayout`/`drawCustomLayout` delegate sang merge engine qua `canHandle(snap)` (data-driven, không dựa algorithmId); xóa `buildMergeTree` giả; `isTreeAlgorithm` chỉ còn heap-sort.
    5. HOOKS_HINT thêm `setMergeState`.
*   **Verify:** `MergeSortAnimationEngine.spec.ts` (3 tests: canHandle, draw divide/merge không throw, empty subarray); `playgroundAlgoDemos.spec.ts` +contract (divide: left+right = segment, output rỗng; merge: output tăng dần theo segment, con trỏ hợp lệ, frame cuối điền đủ). 69 files / 931 tests PASS.

### 🚨 Lỗi 229: Heap Sort Dùng Chung Pipeline Bar/Tree - Thiếu Animation Riêng (2026-08-03)

*   **Mô tả:** Visualization heap-sort trước đây dựa `buildHeapTree` (dựng cây từng frame trong SortingAnimationEngine) + chung pipeline tree-generic: không có pha XÂY ĐỐNG/TRÍCH XUẤT rõ ràng, không hiển thị ranh giới heapSize một cách trực quan, không có dải mảng đi kèm cây.
*   **Mã lỗi:** `ERR_PLAYGROUND_HEAP_GENERIC_RENDER`
*   **Cách khắc phục:** Xây dựng **animation engine riêng cho Heap Sort** (theo mẫu Merge Sort, ADR-29):
    1. `HeapSortAnimationEngine.ts` (mới) — stateless singleton, `canHandle(snap)` data-driven; layout 2 phần: **cây heap hoàn chỉnh** (index → con 2i+1/2i+2, complete-tree layout theo tầng; node trong đống indigo, active/so-sánh amber, extracted xanh mờ, ngoài đống tối mờ) + **dải mảng** (vùng heap [0..heapSize-1] tô vàng mờ, vùng đã sort tô xanh mờ, bar so-sánh amber, bar extracted xanh mờ); phase label "01 XÂY ĐỐNG / 02 TRÍCH XUẤT · heapSize=N". Không kẻ viền trang trí (chỉ nét cấu trúc cây).
    2. Compiler: `HeapSortState` {phase, heapSize, activeIdx} + field `heapState` + hook `setHeapState` (deep-copy) + sandbox param.
    3. Demo heap-sort: biến `phase` ('build' → 'extract'), `heapify` gọi `setHeapState({phase, heapSize: n, activeIdx: i})` mỗi vòng sift.
    4. `SortingAnimationEngine`: xóa hoàn toàn `isTreeAlgorithm`/`enrichForTree`/`buildHeapTree` (chết sau khi heap có engine riêng); `isCustomLayout`/`drawCustomLayout` delegate qua `canHandle`; `drawInterpolated` dùng snapshot trực tiếp.
    5. Store `renderMode`: `heapState` → 'tree' (cây heap). HOOKS_HINT cập nhật.
*   **Verify:** `HeapSortAnimationEngine.spec.ts` (3 tests: canHandle, draw build/extract, single-element); demo contract (phase build trước → extract; heapSize giảm dần về 1; activeIdx trong heap; mảng cuối sorted). 70 files / 935 tests PASS.

### 🚨 Lỗi 230: Heap Engine v1 Kém Hiệu Quả - Layout Dồn Trái, Node Nhỏ, Nhảy Cóc, Thiếu Sift Path (2026-08-03)

*   **Mô tả:** Phân tích heap engine v1: (1) layout complete-tree theo tầng-index — heap hiếm khi đầy nên node tầng cuối bị **dồn về trái**, cây lệch, tốn chỗ; (2) `nodeR = max(6, ...)` với font tối thiểu 8px → **chữ đè nút** khi node nhỏ (mảng 30-100 phần tử); (3) **không animation**: swap giá trị 2 node nhảy cóc tức thì (engine vẽ tĩnh từng frame, khác hẳn array bars có arc bay); (4) không hiển thị **con đường sift-down**; (5) dải mảng chỉ 32% chiều cao + không hỗ trợ baseline 0 (số âm).
*   **Mã lỗi:** `ERR_PLAYGROUND_HEAP_ENGINE_INEFFECTIVE`
*   **Cách khắc phục (redesign v2):**
    1. **Layout parent-centered** (con nằm giữa cha, lá xếp trái→phải) — cân đối, node không dồn trái, tận dụng chiều ngang; `nodeR = min(20, max(5, slotPx*0.42, levelH*0.34))`.
    2. **Ẩn chữ khi nodeR < 9** — hết chữ đè nút với mảng lớn.
    3. **Swap animation trong cây**: `draw(ctx, w, h, snap, prev?, progress=1)` — frame có `swappingIndices` thì 2 giá trị **bay theo cung parabol** giữa 2 vị trí node (giống array swap); các node khác tĩnh. SortingAnimationEngine truyền `this.prev` + `this.progress`.
    4. **SIFT PATH**: `HeapSortState.siftPath?: number[]` (demo track đường đi trong heapify: khởi tạo `[i]`, push mỗi lần chọn largest/di chuyển) — node trên đường đi tô amber mờ; compiler deep-copy.
    5. **Dải mảng baseline-0** (min..max span, số âm đâm xuống) + **2 bar swap trượt ngang** khi đổi chỗ; vùng heap/sorted tô mờ giữ nguyên.
*   **Verify:** `HeapSortAnimationEngine.spec.ts` +1 test swap-animation (draw với prev+progress 0.5 không throw); contract test thêm: siftPath kết thúc tại activeIdx, mọi index trong heap, có sift path dài > 1 trong pha build. 70 files / 936 tests PASS.

### 🚨 Lỗi 231: Heap Engine v2 Vẫn Chưa Hiệu Quả - Xây Lại Giao Diện v3 (2026-08-03)

*   **Mô tả:** Sau v2 (parent-centered + swap animation + siftPath), user vẫn đánh giá chưa hiệu quả: cây/mảng chia 64/36 cứng nhắc — trong pha extract (nơi "sorting" thực sự diễn ra) mảng chỉ 36% quá nhỏ; thiếu bối cảnh hướng dẫn (không có banner phase); không có điểm nhấn ROOT khi trích xuất; cặp so sánh không có pulse.
*   **Mã lỗi:** `ERR_PLAYGROUND_HEAP_UI_REDESIGN`
*   **Cách khắc phục (v3 — xây lại giao diện):**
    1. **Header banner** (34px): text hướng dẫn theo pha — "01 · XÂY ĐỐNG — vun từng node cho đúng tính chất heap" / "02 · TRÍCH XUẤT — đưa phần tử lớn nhất về cuối mảng" + thống kê `heapSize=N · so sánh=M` (lấy `comparisonCount`).
    2. **Bố cục động theo pha**: build → cây 58%/mảng 42% (tập trung sift-down); extract → cây 42%/mảng 58% (tập trung việc đưa root về cuối).
    3. **Cây**: node lớn hơn (`nodeR = min(22, max(8, ...))`, ẩn chữ khi < 10), màu tối giản (default indigo-400/active amber+glow/path mờ/extracted emerald/beyond tối), **compare pulse** (cặp so sánh rung nhẹ theo progress), swap bay cung giữ nguyên.
    4. **Mảng**: baseline-0, vùng heap/sorted tô mờ, **ROOT MARKER** (tam giác + nhãn ROOT trên bar 0 khi extract), **2 bar swap bay cung** (x trượt + y nhấc lên), bar ngoài đống tối mờ.
*   **Verify:** HeapSortAnimationEngine.spec (4 tests) pass với mock ctx bổ sung save/restore (glow); 70 files / 936 tests PASS, `vue-tsc -b --force` CLEAN, `npm run build` SUCCESS.

### 🚨 Lỗi 232: Heap Engine v3 Vẫn Chưa Hiệu Quả - Xây Lại Theo Triết Lý "Mảng Là Chính" v4 (2026-08-03)

*   **Mô tả:** Sau 3 phiên bản (tree + strip), user vẫn đánh giá chưa hiệu quả. Phân tích sâu: vẽ CẢ CÂY HEAP là sai trọng tâm — người học xem sắp xếp nhưng 64% màn hình là cây (thông tin heap property) trong khi việc "sắp xếp" (root bay về cuối) diễn ra ở dải mảng nhỏ; cây toàn phần cũng vô nghĩa khi sift-down chỉ liên quan 1 nhánh; không có lời tường thuật hành động.
*   **Mã lỗi:** `ERR_PLAYGROUND_HEAP_UI_REBUILD_V4`
*   **Cách khắc phục (v4 — triết lý "mảng là nhân vật chính", học theo style merge/counting):**
    1. **MẢNG CHÍNH 62%**: bar lớn + chỉ số dưới mỗi bar + vùng heap/sorted tô mờ có KHE HỞ ranh giới (không kẻ đường) + ROOT marker (tam giác + nhãn khi extract) + swap bay cung + compare pulse (viền sáng nhấp nháy).
    2. **MINI FOCUS TREE 24%**: KHÔNG vẽ cả cây — chỉ vẽ node ĐANG xử lý + 2 con trong đống, node to (r=18), edge tới con trong đống; so sánh rung 1.08x; swap sift (cha↔con) bay cung ngắn.
    3. **CAPTION 12%**: tường thuật động tiếng Việt sinh từ dữ liệu (`captionFor` public static — test được): "So sánh 12 (vị trí 0) với 13 (vị trí 2) → giữ 13", "Đổi chỗ 12 và 7 — root về cuối mảng, heap thu hẹp", "Vun đống tại node 2 (giá trị 13) — so sánh với các con", "Root = 12 là phần tử lớn nhất — chuẩn bị đưa về cuối mảng".
    4. **Header gọn 28px**: pha + heapSize (+ so sánh nếu có).
*   **Verify:** `HeapSortAnimationEngine.spec.ts` +1 test captionFor (compare/swap-extract/build); 70 files / 937 tests PASS, `vue-tsc -b --force` CLEAN, `npm run build` SUCCESS.

### 🚨 Lỗi 233: Workspace Hiển Thị Quá Nhiều Component - Không Gian Chật Chội (2026-08-03)

*   **Mô tả:** AlgoPlaygroundWorkspace có tới 5-6 hàng chrome quanh editor/canvas: toolbar 7 controls (select + input + Chạy + Reset + Code mẫu + Hooks + Chia sẻ), dòng mô tả demo riêng, panel Hooks inline (24 dòng), 2 header pane riêng (Code | Visual), VCR + trace → vùng hiển thị thuật toán bị ép nhỏ.
*   **Mã lỗi:** `ERR_PLAYGROUND_SPACE_OVERFLOW`
*   **Cách khắc phục (tối ưu không gian — 6 biện pháp):**
    1. **Gộp dòng mô tả vào toolbar**: description → `title` tooltip trên select; chips ⏱/💾 dời cạnh select — bớt 1 hàng.
    2. **Menu "⋯" cho hành động phụ**: Hooks / Code mẫu / Chia sẻ vào dropdown (đóng bằng backdrop, nhãn 'Đã chép' giữ trong menu); **xóa nút Reset** (trùng ⟲ trong VCR) — toolbar còn select+chips / input+hint / Chạy / ⋯.
    3. **Gộp 2 header pane thành 1 thanh** "Code (JavaScript) · 👁 · Format | Visualization — Mảng · Bước X/Y · ⛶" — bớt 1 hàng.
    4. **Collapse editor (👁)**: ẩn editor → canvas full width (Pane size 0 + min-size 0 + ẩn splitter bằng class `hide-splitter`); nút đổi icon eye↔x.
    5. **Hooks panel → popover**: absolute dưới toolbar, không đẩy layout, max-h-48 scroll.
    6. **Validation hint inline trong ô input** (✓ N phần tử / ✗ lỗi, ẩn khi 'Input trống') — bỏ hàng hiển thị riêng.
*   **Verify:** Component tests cập nhật (description qua title select, share/hooks qua menu ⋯, +test collapse editor) — 70 files / 938 tests PASS, `vue-tsc -b --force` CLEAN, `npm run build` SUCCESS.

### Loi 175: Man hoc bai hien noi dung sai cho moi bai hoc (Lesson Study Mockup)
*   **Mo ta:** `/lessons/:id` hardcode noi dung Bubble Sort — bai binary-search/dijkstra deu hien ly thuyet + quiz + codelab Bubble Sort.
*   **Nguyen nhan:** `LessonStudyView.vue` khong dung `useLessonStore` (dead code) va khong goi `GET /concepts/lessons/{id}`; `LessonStepViz` hardcode moduleKey=sorting; `LessonStepQuiz` dung default questions; `LessonStepCodeLab` mockup setTimeout + passed:true.
*   **Cach khac phuc:** ADR-35 — loadLesson API-first, `resolveLessonViz` theo sandbox, quiz tu `statelessQuizApi`, codelab executor that trong worker + timeout.
*   **Trang thai:** `FIXED (2026-08-04)` — 974 frontend / 158 backend PASS.

### Loi 176: Khoa hoc seed khong hien thi tren trang danh sach
*   **Mo ta:** `CoursesListView` loc `isPublished` nhung seeder khong goi `Publish()` (Course ctor set false) → danh sach trong.
*   **Cach khac phuc:** DbSeeder goi `course.Publish()` cho tat ca khoa truoc AddRange.
*   **Trang thai:** `FIXED (2026-08-04)` — TC_B1_1 assert IsPublished=true.

### Loi 177: Seeder quiz/course chay lai nhan doi du lieu
*   **Mo ta:** `SeedQuizzesAsync` guard `if (Quizzes.Any()) return;` + SeedCoursesAsync luon AddRange → khi restart, quiz/course bi nhan doi moi lan startup.
*   **Cach khac phuc:** Upsert quiz theo Title; guard course theo 6 bai + early return khi da seed du.
*   **Trang thai:** `FIXED (2026-08-04)` — TC_B1_6 / TC_B2_3 assert so luong khong doi sau 2 lan seed.

### Loi 178: Test B1.5 tham chieu property khong ton tai
*   **Mo ta:** Test ban dau goi `item.XPReward` — property khong co tren ModuleItem.
*   **Cach khac phuc:** Bo assertion sai, chi kiem tra so luong item + FK khac null.
*   **Trang thai:** `FIXED (2026-08-04)` — 11/11 DbSeederTests PASS.
### Loi 179: LessonStepViz hien thi sai demo khi chuyen bai hoc (store persist demoId)
*   **Mo ta:** AlgoPlaygroundWorkspace chi goi `loadDemo` khi `store.code` rong; store playground PERSIST code + demoId qua localStorage. Bai hoc thu 2 tro di, code cua demo cu con non-empty → workspace giu demo cu (vi du: bai "Stack & Queue" van hien thi Binary Search).
*   **Nguyen nhan:** Thieu watch dong bo demo giua lesson va playground store (phat hien khi self-review 2026-08-04).
*   **Cach khac phuc:** `LessonStepViz` watch `resolved.demoId` → neu `algoStore.demoId !== demoId` thi `algoStore.loadDemo(demoId)` (immediate). Them 4 test TC-A2.7..A2.10 (`lessonStepViz.spec.ts`).
*   **Trang thai:** `FIXED (2026-08-04)` — 40/40 lesson tests PASS; full suite 978 tests (1 flaky pre-existing `SortingAnimationEngine` RAF race, pass khi chay rieng).

### Loi 180: 12 khoi mermaid trong docs loi cu phap (chua bao gio duoc kiem tra)
*   **Mo ta:** Scan tu dong toan bo 88 khoi ```mermaid (55 file docs) phat hien 12 khoi loi: `7 <-- R((R))` (mermaid KHONG ho tro backward link `<--` — 4 khoi two-pointers), parens chua quote trong diamond `HF{Hàm Băm\n(Hash Function)}` va subgraph title `subgraph Hash Table (Array)` / `subgraph S3 [3. Dequeue (Lấy 10 ra)]` / `subgraph Không gian kết quả (Tốc độ K: ...)` (binary-search), `style fill:rgba(59, 130, 246, 0.1)` bi style parser cat theo comma (3 khoi sliding-window), link subgraph bang title string `"1. Mảng Gốc (Input)" --> ...` (counting-sort), `Bước 1 ==> Bước 2` subgraph title co space chua quote (queue).
*   **Cach khac phuc:** Viet ngược arrow (`R((R)) --> 7`); quote parens trong label/subgraph (`HF{"..."}`, `subgraph S3 ["..."]`, explicit id `G1 --> G2`, `Q1 ==> Q2`); thay rgba bang mau solid palette app; chuan hoa style directive ve `#b85c5c`/`#c9a227`/`#3d9970`.
*   **Phong ngua:** Them `docsMermaidSyntax.spec.ts` — parse 88/88 khoi khi chay vitest.
*   **Trang thai:** `FIXED (2026-08-04)` — 88/88 blocks PASS; full suite 980 tests PASS.

### Loi 181: lessonStudyFlow.spec.ts mock thieu getLessonAuthToken (API refactor)
*   **Mo ta:** `lessonApi.ts` them `getLessonAuthToken()` (04:41 AM 2026-08-04) nhung spec mock cu (02:36 AM) khong include export moi → `useLessonStore.loadLesson` goi ham khong ton tai trong mock → 5 tests fail.
*   **Cach khac phuc:** Chuyen `vi.mock` sang `importOriginal` spread — giu ham that (`getLessonAuthToken` doc localStorage 'token' nhu thuc te), chi mock 4 ham API (`fetchLessonDetail`/`fetchLessonProgress`/`saveLessonProgress`/`awardXp`).
*   **Trang thai:** `FIXED (2026-08-04)` — 6/6 tests PASS (TC-A1.1 offline-first, A1.2 backend override, A1.3 fallback, A1.4 progress, A1.4b merge, A1.5 view render).

### Loi 182: Navbar dropdown (va toan app) trong suot — Tailwind v4 khong nap tailwind.config.js
*   **Mo ta:** Dropdown nhom tab trong navbar: panel `bg-bg-surface border-border-default` va cac item `hover:bg-bg-hover` hien 100% trong suot → element phia sau nhin xuyen qua noi dung dropdown. Nguyen nhan goc: Tailwind v4.3 KHONG tu dong nap `tailwind.config.js` (JS config phai nap qua `@config`, hoac khai bao CSS-first bang `@theme`). Kiem tra CSS build: 0 rule `.bg-*` token — **1.862 luot dung token classes (bg-bg-*, text-text-*, border-border-*) tai 122 file .vue deu chet**.
*   **Cach khac phuc:**
   1. Thu `@config "../tailwind.config.js"` → FAIL: v4 xu ly legacy config nhu theme thay the, core utilities (px-4, opacity-0, w-48, rounded-lg...) bien mat khoi bundle → revert.
   2. Dung dung cach v4: them block `@theme inline { ... }` trong `src/style.css` bridge toan bo design tokens (colors/radius/shadow/font) tham chieu truc tiep bien runtime `var(--color-bg-surface)` trong `styles/theme.css` — utility compile thanh `background-color:var(--color-bg-surface)`, doi theme sang/toi van dung (unlayered `:root` cua theme.css thang `@layer theme` cua Tailwind, het circular reference).
   3. Bo sung token thieu: `--color-accent-cyan` (#06b6d4 dark / #0891b2 light) va `--color-accent-purple` (#a78bfa dark / #7c3aed light) + glow/dim vao `theme.css` (truoc day 183 luot `text-accent-cyan` trong .vue khong co dinh nghia).
*   **Trang thai:** `FIXED (2026-08-04)` — build CSS chua `.bg-bg-surface{background-color:var(--color-bg-surface)}`, `.text-accent-cyan{...}`, `hover:bg-bg-hover`, core utilities con nguyen; full suite 980 tests PASS. Luu y: day la fix he thong — toan bo UI lay lai background/border/hover nhu thiet ke (khong chi rieng dropdown).

### Loi 183: Token classes con sot sau bridge — accent-emerald/primary/secondary, bg-base/tertiary, border-color
*   **Mo ta:** Sau bridge `@theme inline` lan 1, quet tu dong 40 token class dung trong template phat hien con thieu: `accent-emerald` (dung nhieu tai InteractivePlayground/GraphView/HeapSortVisualizer — chua tung co dinh nghia token), `accent-primary` + cac bien the `-light/-dim/-glow/-text/-dark` (DSAHeader, Docs*, VcrControlPanel, Bucket/Counting visualizer...), `accent-secondary` (DocsView hover), `bg-bg-base` (DocsLayout/Sidebar), `bg-bg-tertiary` (MyClassroomsView), `border-border-color` (DocsSidebar).
*   **Cach khac phuc:** them token vao `theme.css` (dark + light): `--color-accent-emerald` (#10b981 dark / #0d9a6c light) + light/glow/dim, `--color-accent-secondary` (alias primary-light), `--color-bg-base`, `--color-bg-tertiary`, `--color-border-color`; mo rong bridge `@theme inline` trong `style.css` cho toan bo bien the accent (primary/green/red/yellow/cyan/purple/emerald x light/glow/dim).
*   **Trang thai:** `FIXED (2026-08-04)` — 0/40 class missing (kể cả dạng modifier `\/10` `\/20` `\/40`); 993 tests PASS.
### Loi 180: lessonApi/useLessonStore doc token tu localStorage 'token' (key khong ton tai)
*   **Mo ta:** App khong bao gio ghi key 'token' — UI login dung `statelessLogin`, token nam trong `useAuthStore().getAccessToken()` ref. lessonApi doc `localStorage.getItem('token')` → luon null → moi API lesson gui thieu header → 401 → bai hoc khong tai duoc.
*   **Phat hien:** Verify E2E bang curl sau khi restart backend (2026-08-04).
*   **Cach khac phuc:** `getLessonAuthToken()` trong lessonApi — uu tien authStore token, fallback localStorage; su dung o ca 4 ham API + 2 cho trong useLessonStore.
*   **Trang thai:** `FIXED (2026-08-04)` — E2E xac nhan lesson detail tra du lieu khi login stateless.

### Loi 181: GetLessonById/GetCourseById tra quizId=null (quiz tren ModuleItem rieng)
*   **Mo ta:** Seeder tao 2 ModuleItem rieng (Lesson item + Quiz item) cho moi bai; controller doc `item.QuizId` tu Lesson item (luon null) → frontend khong nhan duoc quizId → buoc Quiz trong.
*   **Cach khac phuc:** Tim Quiz item CUNG module co OrderIndex > lesson item (quiz item cua lesson N nam ngay sau lesson item N); CourseController dung GroupBy+ToDictionary (dau tien dung ToDictionary theo ModuleId bi duplicate key → 400, chuyen sang GroupBy).
*   **Trang thai:** `FIXED (2026-08-04)` — E2E: 6 bai deu co quizId rieng dung chung.

### Loi 182: /concepts/quiz/{id} 404 cho quiz DB (chi doc QuizBankStrategy in-memory)
*   **Mo ta:** StatelessQuizController chi lookup trong bank 12 quiz mac dinh — moi quiz tu seeder/DB deu 404 → frontend khong tai duoc cau hoi.
*   **Cach khac phuc:** GET fallback DB (Guid.TryParse truoc de tranh EF translate `Id.ToString()` sai tren SQLite); SUBMIT tu cham truc tiep tu DB questions khi quiz khong nam trong bank.
*   **Trang thai:** `FIXED (2026-08-04)`.

### Loi 183: SUBMIT quiz DB cham sai diem (OrderBy(Question) lech index)
*   **Mo ta:** Code cham sort questions theo `q.Question` nhung GET tra theo thu tu DB → index khong khop request.Answers → 2/4 du khi tra loi dung het.
*   **Cach khac phuc:** Bo OrderBy, giu dung thu tu DB nhu GET.
*   **Trang thai:** `FIXED (2026-08-04)` — E2E: dung het 4/4 passed=True xp=40; sai het 1/4 passed=False.
### Loi 184: Course list trang khong hien thi khoa hoc nao (CourseCard crash)
*   **Mo ta:** Trang /courses hien header/filter/sort nhung grid card TRONG (khong co loi nao bao). API tra 200, 11 khoa published.
*   **Nguyen nhan:** `useCourseStore.getCourseProgress()` iterate `course.lessons` — nhung API list `/concepts/courses` KHONG tra `lessons` field (chi totalLessons) → `for...of undefined` → TypeError trong computed cua CourseCard → render crash → grid rong. Bug an vi du lieu local `data/courses.ts` luon co lessons.
*   **Phat hien:** Test mount `CoursesListView` voi dung du lieu API that (`coursesListView.spec.ts`) — DEBUG state cho thay courses=2, filtered=2, isLoading=false nhung card khong render.
*   **Cach khac phuc:** Null-safe `course.lessons ?? []` trong getCourseProgress + getFirstUncompletedLesson (useCourseStore.ts).
*   **Trang thai:** `FIXED (2026-08-04)` — test mount xac nhan card render.

### Loi 185: Difficulty enum mismatch (Beginner/Intermediate/Advanced vs Easy/Medium/Hard)
*   **Mo ta:** Backend tra difficulty 'Beginner' nhung UI chi hieu Easy/Medium/Hard → badge xam, label 'Kho', sort sai thu tu.
*   **Cach khac phuc:** CourseFilter label, CourseCard badge, CoursesListView sort order ho tro ca 2 bo enum; `Course.difficulty` type mo rong.
*   **Trang thai:** `FIXED (2026-08-04)`.

### Ghi chu test env
*   `stubs: { RouterLink: true }` (auto-stub) KHONG render slot trong vue-test-utils — phai dung stub tuong minh `{ template: '<a><slot /></a>' }` de test grid (khong phai bug app).
### Loi 186: Seed quiz duplicate title khi 2 quiz cung title trong 1 seed run
*   **Mo ta:** `GetOrCreate` chi query DB — quiz tao moi (pending, chua SaveChanges) khong duoc tim thay → khi title moi trung title quiz cu cung seed run, tao ra 2 ban (duplicate).
*   **Phat hien:** DbSeederTests TC_B2_2 dem 20 quiz thay vi 18 (Trắc nghiệm Đệ quy & Call Stack x2, Trắc nghiệm Sắp xếp cơ bản x2) — phat hien khi mo rong 18 quiz moi Dot 1.
*   **Cach khac phuc:** GetOrCreate tim trong `created` list (pending) truoc khi query DB.
*   **Trang thai:** `FIXED (2026-08-04)` — 12/12 DbSeederTests PASS.
### Loi 187: Quiz trung title giu lai 4 cau cu khi tai sinh 10 cau
*   **Mo ta:** Sau khi tai sinh quiz blocks 10 cau, 2 quiz trung title voi block cu (recursionQuiz, sortingBasicQuiz tu Dot 1) bi GetOrCreate tra ve quiz cu 4 cau (created list uu tien) → TC_B2_1 fail.
*   **Cach khac phuc:** Xoa 2 block GetOrCreate cu trung title; giu block moi 10 cau.
*   **Trang thai:** `FIXED (2026-08-04)` — 159/159 PASS, E2E 10 cau/bai.
### Loi 188: Quiz matching sai khi lesson order cach nhau 10
*   **Mo ta:** Seeder moi dat lesson items order 1010, 1020... (cach 10) va quiz +500 → `OrderIndex > lesson` luon match quiz dau tien cua module → moi lesson tra ve cung 1 quizId.
*   **Cach khac phuc:** Doi buoc nhay thanh 1000 (lesson 1000, 2000...; quiz = lesson + 500) nhu seeder cu.
*   **Trang thai:** `FIXED (2026-08-04)` — E2E: 39 lesson quiz rieng dung chu de.
### Loi 189: Quiz block bi them SAU AddRange khi ghep seeder
*   **Mo ta:** Khi them quiz 40, block GetOrCreate bi chen sau `AddRangeAsync(created)` → quiz tao trong memory nhung khong duoc luu → lookup null → NRE khi seed (SeedCoursesAsync fail giua chung → chi 2 roadmaps).
*   **Cach khac phuc:** Dam bao moi quiz block nam TRUOC AddRange; xac minh thu tu bang grep.
*   **Trang thai:** `FIXED (2026-08-04)` — 7/7 DbSeederTests PASS.

### Loi 190: Substring sinh 'quizL28..Id' (hai dau cham)
*   **Mo ta:** Script sua title dung `Substring(IndexOf('quizL'), 8)` — 'quizL28' chi 7 ky tu nen lay ca dau cham → 'quizL28..Id' → CS0029.
*   **Cach khac phuc:** Regex 'quizL(\d+)\.\.Id' -> 'quizL$1.Id'.
*   **Trang thai:** `FIXED (2026-08-04)`.
### Loi 191: Guard seeder dung `Title == "Two Pointers"` khong khop title thuc
*   **Mo ta:** Lesson 11 title thuc la "Two Pointers - Ky thuat hai con tro quet du lieu" (co mo ta duoi) → `== "Two Pointers"` luon false → guard khong return → **moi restart seeder xoa toan bo Course/Lesson (mat progress)**.
*   **Cach khac phuc:** `Title.Contains("Two Pointers")` + kiem tra `lessonCount >= 40`; verify: restart 2 lan du lieu giu nguyen (3 roadmaps / 40 lesson).
*   **Trang thai:** `FIXED (2026-08-04)` — 154/154 backend PASS.

### Loi 192: ModuleItem Quiz lesson30 co overrideTitle rong
*   **Mo ta:** Script sua title r3m1 bo sot 1 dong (quizL30, null, "", 3500) — hien thi xau trong curriculum.
*   **Cach khac phuc:** Set "Quiz: Quy hoach dong nang cao (2D)".
*   **Trang thai:** `FIXED (2026-08-04)`.
### Loi 193: Thu tu lesson tron giua cac chang (module OrderIndex)
*   **Mo ta:** Moi chang (module) dem OrderIndex lai tu 1000 → CourseController sort toan cuc theo OrderIndex va LessonStudyView resolveNextLessonId sort lai → bai hoc tron giua 2 chang (vd bai cuoi chang 1 la 'De quy' nhung 'Sap xep co ban' chang 2 dung truoc).
*   **Cach khac phuc:** CourseController: sort theo (module.OrderIndex, item.OrderIndex); LessonStudyView: bo sort, dung thu tu API.
*   **Trang thai:** `FIXED (2026-08-04)` — E2E: chang 1 (Big O..De quy) truoc chang 2 (Sap xep..Sliding Window).
### Dot sua P0 (Lo 194-205) — 2026-08-04
| Lo | Mo ta | Nguyen nhan | Cach khac phuc | Trang thai |
| :-- | :-- | :-- | :-- | :-- |
| 194 | JwtHelper secret hardcode + signature base64 sai chuan | Key hardcode trong source; so sanh Convert.ToBase64String vs base64url | Tao JwtSigningConfig (Domain), Program.cs cap Jwt:Key; verifier normalize base64url + FixedTimeEquals + bat buoc exp; issuer (StatelessAuthStrategy/AdminController) sang base64url | `FIXED` — E2E login+me OK |
| 195 | ForceAddRefreshToken tu dung refresh token | Refresh re-hydrate DB roi ForceAddRefreshToken | Xoa khoi; refresh chi chap nhan token server sinh | `FIXED` — token gia 401 |
| 196 | StatelessAuth khong auth + IDOR | Khong [RequireJwtRole], tin userId client | [RequireJwtRole] + userId tu token (me/progress/profile/change-password/award-xp); frontend gui Authorization header | `FIXED` — khong token 401 |
| 197 | AdminUsersController lo toan bo user | Thieu auth | [RequireJwtRole("Admin")] class-level + clamp page/pageSize | `FIXED` |
| 198 | UsersController {id}/progress IDOR | Khong kiem tra quyen | [RequireJwtRole("Admin")] | `FIXED` |
| 199 | CourseController IDOR teacher sua khóa nguoi khac | AddModule/AddModuleItem khong check ownership | Check IsOwnerOrAdmin + Enum.TryParse ItemType | `FIXED` |
| 200 | StatelessPayment tu cap premium | simulate-webhook public + userId client tu khai | [RequireJwtRole] toan controller; simulate-webhook chi Development; userId tu token; xoa secret webhook khoi bundle client | `FIXED` |
| 201 | StatelessGamification award-xp anonymous | Thieu auth | [RequireJwtRole("Teacher,Admin")] | `FIXED` |
| 202 | QuizController xung dot route api/v1/quizzes | 2 controller cung route | Xoa QuizController (stub dead) | `FIXED` |
| 203 | LessonReview auth lech he | [Authorize] JwtBearer vs [RequireJwtRole] | Doi sang [RequireJwtRole("Admin")] + route versioned | `FIXED` — (con gioi han: chua co SubmitForReview flow - P1 backlog) |
| 204 | html-playground sandbox vo hieu | allow-same-origin + allow-scripts | Bo allow-same-origin | `FIXED` |
| 205 | XSS parseEmojiToSvg (3 vi tri v-html) | Khong escape HTML | Escape &<>"' truoc khi thay emoji (fix toan bo v-html dung chung) | `FIXED` |
| 206 | export-share interval leak khi fail | clearInterval chi o nhanh thanh cong | try/finally clearInterval | `FIXED` |
| 207 | codelabs revealHint route sai | /hints/{idx}/reveal khong ton tai | /reveal-hint voi body { hintIndex } | `FIXED` |
### Review lai dot P0 - phat hien them (Lo 208-209) — 2026-08-04
| Lo | Mo ta | Nguyen nhan | Cach khac phuc | Trang thai |
| :-- | :-- | :-- | :-- | :-- |
| 208 | 14 controller dung [Authorize] JwtBearer bi 401 voi token stateless (login chinh cua app) | 2 he auth song song; JwtBearer yeu cau iss/aud ma token stateless khong co | Chuyen sang [RequireJwtRole] (cung key Jwt:Key, ho tro ca 2 token); verify E2E: TheoryArticles/Leaderboard/Users/Analytics/Auth/Payments OK | `FIXED` |
| 209 | 5 controller doc User principal claim (FindFirstValue) -> null sau khi doi sang RequireJwtRole | RequireJwtRole khong populate HttpContext.User | Doi sang JwtHelper.ExtractSubFromToken(Request) / ExtractRoleFromToken (Analytics, Auth, Leaderboard, Payments, Classroom) | `FIXED` |
| Ghi nhan backlog | Classroom route `api/Classroom/mine` tra 409 (route khong versioned + 3 controller cung `api/v1/classrooms`); Notifications route `/concepts/Notifications` sai; feature classrooms chua mount frontend | — | — | `OPEN` (P2/P3) |
### Dot sua P1 bao mat (Lo 210-221) — 2026-08-04
| Lo | Mo ta | Cach khac phuc | Trang thai |
| :-- | :-- | :-- | :-- |
| 210 | PaymentService: Order Cancelled van cap Premium + khong doi chieu AccountNumber | Chi xu ly khi Status==Pending; verify AccountNumber vs SePay:BankAccount | `FIXED` |
| 211 | PaymentsController webhook fail-open (OR 2 co che) + leak ex.Message | Fail-closed: bat buoc Apikey; message chung | `FIXED` |
| 212 | Codelab ro ri hidden testcase + hint tra phi qua GET | GetCodelabById/DetailsQuery: loc IsHidden + Content hint tra phi = rong | `FIXED` |
| 213 | Codelab farm XP (submit lap van award) + trừ XP hint khong idempotent | XP chi lan dau pass (AnyAsync Accepted); bang CodelabHintReveal + migration | `FIXED` |
| 214 | StatelessQuiz lo dap an qua GET public | DTO cong khai an CorrectIndex/Explanation; co token moi tra du; E2E xac nhan | `FIXED` |
| 215 | Quiz bank khong bao gio cap XP that (UI bao +XP nhung khong cong) | Cong XP that lan dau + bang QuizXpGrant chong farm (migration) | `FIXED` |
| 216 | Lesson: CompleteLesson bo qua premium gate + doc Draft qua GUID + entity leak | Gate CheckLessonAccessAsync (publish + premium) dung chung GET/Complete; seeder publish 40 lessons | `FIXED` |
| 217 | TheoryArticle: onlyPublished client-controlled + IDOR draft | Server ep onlyPublished cho Student; draft -> 404 neu khong Teacher/Admin | `FIXED` |
| 218 | Directed graph bi duyet nhu undirected (BFS/DFS/Dijkstra sai) | Simulator nhan graphType, resolveNeighbor chi duyet from->to khi directed | `FIXED` |
| 219 | Embed host script khong verify origin (CSS injection) | Check event.origin + Number.isFinite(height) + clamp | `FIXED` |
| 220 | UploadController khong magic bytes (polyglot XSS) | Kiem tra header jpeg/png/gif/webp | `FIXED` |
| 221 | AuthService: user bi khoa van login + user enumeration register | Check IsActive sau verify; message register chung chung | `FIXED` |
| Phu | ToString() trong LINQ (u.Id.ToString()==userIdStr) khong match SQLite -> XP khong cong that + attempt khong luu | Guid.TryParse + so sanh Id (phat hien khi E2E Doat B) | `FIXED` |
| Phu | Badges/Quizzes/Classroom/Codelabs dung principal claim -> 401 (RequireJwtRole khong populate User) | Doi sang JwtHelper.ExtractSubFromToken(Request) | `FIXED` |
| CANH BAO | Judge:ApiKey + AimlApi:ApiKey (khoa API that) trong appsettings.json da commit | Nguoi dung phai ROTATE 2 khoa API tren OpenRouter + AIML | `OPEN` (nguoi dung xu ly) |
### Dot sua P1 logic (Lo 222-234) — 2026-08-04
| Lo | Mo ta | Cach khac phuc | Trang thai |
| :-- | :-- | :-- | :-- |
| 222 | Lesson progress API `/auth/progress/{lessonId}` KHONG TON TAI backend (404) -> sync progress chua bao gio hoat dong | Them GET/POST endpoint + entity UserLessonProgress them 4 field (HasWatchedVisualizer/QuizScore/BestScore/CodelabCompleted) + migration AddLessonProgressFields | `FIXED` — E2E POST/GET OK |
| 223 | bestScore bi ghi de bang diem thap hon (lessonApi gui quizScore) | Payload gui bestScore tu store; backend RecordQuizAttempt giu max | `FIXED` — E2E: 9 -> 5 giu 9 |
| 224 | XP sai cho bai khong codelab (chi 50% nhung modal hien full) + isLessonComplete luon false | Quiz pass = FULL XP khi khong co codelab; isLessonComplete = codelabCompleted \|\| (khong codelab && quizPassed); luu flag completed | `FIXED` |
| 225 | loadLesson race (doi bai nhanh A->B, response A ghi de B) | lessonLoadRequestId token bo qua response cu | `FIXED` |
| 226 | codelabExecutor fallback main-thread khong kill-switch (loop vo han dung bang trang) | Bo fallback: worker loi -> tra loi an toan | `FIXED` |
| 227 | XSS LessonStepTheory: contentMd inline/table cell khong escape | Escape HTML toan bo inline truoc khi bien doi markdown | `FIXED` |
| 228 | Progress roadmap luon 0 (so XP trung binh + API list khong tra lessons) | Cờ completed tu lesson flow + codelabCompleted fallback; bo dieu kien XP trung binh | `FIXED` |
| 229 | Premium gate bypass khi chua dang nhap (chi check role Student) | Chặn moi user chua co isPremium | `FIXED` |
| 230 | Gamification: confetti khong bao gio ban (prevBadgeCount doc sau khi gan) + streak reset sau sync + freezes nut gia + requiredAlgorithmId bo qua | Doc prevBadgeCount truoc; set lastActiveDate khi sync; StreakCalculator dung freeze (freezeUsed); checkNewUnlockedBadges kiem tra completedAlgorithms | `FIXED` |
| 231 | Docs: copy button vo voi `'` (C# char literal) + heading hien **/backtick tho + link /docs vo hash router (79 link) | data-copy-code + event delegation; render inline trong heading; renderer.link chuyen /docs -> #/docs | `FIXED` |
| 232 | countingSort sai (chi sort theo hang don vi) | Counting sort that (range min..max) + guard range > 1000 fallback radix | `FIXED` |
| 233 | Keyboard DSA trung KeepAlive (Space dieu khien ca 2 player) | onActivated/onDeactivated flag isViewActive + pause khi roi tab | `FIXED` |
| 234 | user-progress: markModuleComplete khong persist (stateless return) + level formula lech backend + SkillRadarChart so ao | Luon goi endpoint JWT; bang nguong level khop backend; chart tu XP/level that | `FIXED` |
| Phu | Auth timer refresh cross-mode (classic endpoint voi token stateless -> xoa session song) + race refresh | Timer goi refreshAccessToken() cua store (dedupe + dung mode) | `FIXED` |
| Phu | e-lecture race skip PLAY_UNTIL (continuation ghi de state) + double-click nhay 2 slide | Generation token + isTransitioning guard | `FIXED` |
### Dot sua P2/P3 + dead code (Lo 235-240) — 2026-08-04
| Lo | Mo ta | Cach khac phuc | Trang thai |
| :-- | :-- | :-- | :-- |
| 235 | Classroom 409: 2 nguyen nhan chong nhau — (a) route khong version + {id} khong constraint, (b) **IClassroomGradingService + IClassroomExcelExportService KHONG dang ky DI** -> endpoint classroom chua tung hoat dong | Thong nhat route versioned + :guid constraint; dang ky 2 service | `FIXED` — E2E: Classrooms mine OK |
| 236 | Notifications route /concepts/Notifications sai | Bo "concepts/" | `FIXED` |
| 237 | N+1 GetCourses (query progress trong loop) + khong loc IsDeleted | Gom 1 query toan bo lessonIds + HashSet; filter !IsDeleted | `FIXED` |
| 238 | QuizzesController: body null NRE + page khong clamp + GetCurrentUserId Guid.Parse NRE | Guard + clamp + TryParse | `FIXED` |
| 239 | Notifications: khong AsNoTracking + SaveChanges vo nghia khi rong | AsNoTracking + Take(100) + early return | `FIXED` |
| 240 | Dead code ~2500 dong: features/graph (toan module), features/quiz (toan module), VcrControlPanel/VcrArrayInput, CustomInputPanel/EdgeBuilderForm/useInputValidation/CustomInputParser, WasmComputeWorker, BubbleSortRenderer, useGraphSimulation, ExternalStylesheetsInjector | Xoa file + don index.ts (giu VcrDockBar — dung thuc su trong SortingView, useVcrStore — dung rong rai) | `FIXED` |
### Dot fix tiep (Lo 241-248) — 2026-08-05
| Lo | Mo ta | Cach khac phuc | Trang thai |
| :-- | :-- | :-- | :-- |
| 241 | Hash mat khau 2 he lech: stateless dung SHA256 (salt tinh) -> user dang ky/doi mat khau qua stateless KHONG login duoc qua he chuan (BCrypt) | Strategy.HashPassword + StatelessAuthController -> BCrypt workFactor 12; verify delegate giu fallback SHA256 cho du lieu cu | `FIXED` — E2E login OK |
| 242 | Classroom: invite code het han van join duoc | Check InviteCodeExpiresAt trong JoinClassroomHandler | `FIXED` |
| 243 | Classroom Kick xoa cung enrollment -> bi kick van join lai duoc + mat lich su | enrollment.Kick() soft-kick (Status=Kicked) + Join chan Kicked | `FIXED` |
| 244 | Classroom lo invite code cho student (Details tra Code cho moi nguoi) | Code chi tra khi isOwner (DTO nullable) | `FIXED` |
| 245 | CourseController: Admin khong tao/sua/xoa lesson (handler chi chap nhan owner id -> 500) + CreateCourse Enum.Parse rong -> 500 | Resolve TeacherId = course.TeacherId khi admin; Enum.TryParse -> 400 | `FIXED` |
| 246 | useAnimationStore.stop() khong resolve playUntil -> lecture ket isWaitingForAnimation vinh vien | stop() goi resolvePlayUntil khi playUntilTarget != null | `FIXED` |
| 247 | InteractivePlayground deep-watch nodes/edges (bat x/y moi tick physics + mousemove) -> resimulate + reset playback | Watch theo topology signature (id:label / from>to:weight) | `FIXED` |
| 248 | e-lecture exitLecture unlock vo dieu kien (mo khoa canvas giua cau hoi quiz checkpoint) | Lock theo chu quyen (owner set: lecture/quiz) | `FIXED` |
| Phu | Badges my N+1 (query tung badge); Leaderboard rank tie-break ngau nhien; algorithmApi fetch khong timeout; AnalyticsService Include ca collection de dem | GetByIdWithDetailsAsync 1 query; ThenBy tie-break; AbortSignal.timeout(8000); CountAsync rieng | `FIXED` |
| Phu | SortingAnimationEngine delta am khi ts < lastTimestamp -> progress lui, advance khong xay ra (test "flaky" that ra la bug that) | Clamp delta >= 0 + test dung ts tuong doi | `FIXED` — 982/982 full suite on dinh |
### Dot fix tiep (Lo 249-255) — 2026-08-05
| Lo | Mo ta | Cach khac phuc | Trang thai |
| :-- | :-- | :-- | :-- |
| 249 | Register stateless ghi DB TRUOC validate (row rac) + nuot loi DB van tra 200 gia | Validate qua strategy truoc; DB loi -> 503 ro rang; hash BCrypt khi ghi | `FIXED` — E2E: register trung email 400, khong tao row |
| 250 | GetDemoCredentials public lo mat khau demo | Chi Development (404 o production) — E2E xac nhan | `FIXED` |
| 251 | Classroom khong enforce MaxEnrollmentCapacity | Check active count vs capacity trong JoinHandler | `FIXED` |
| 252 | Race join trung (2 request dong thoi tao 2 enrollment) | Unique index (ClassroomId, StudentId) + migration + catch DbUpdateException | `FIXED` |
| 253 | Invite code case-sensitive (nhap thuong fail) | ToUpperInvariant o controller | `FIXED` |
| 254 | Upload: khong RequestSizeLimit (nhan toan body roi moi check) + IO loi -> 500 + file rac | [RequestSizeLimit(6MB)] + try/catch IO xoa file partial | `FIXED` |
| 255 | Analytics overview cache null (Set null = no-op -> miss moi request) + TheoryArticle CreateArticle Title/Slug rong -> 500 | Chi cache khi != null; validate + 400 | `FIXED` |
| Ghi nhan | App chay Production mac dinh (khong launchSettings) -> simulate-webhook/demo-credentials 404 dung thiet ke; dev can set ASPNETCORE_ENVIRONMENT=Development | — | `INFO` |
### 2026-08-06: Frontend UX Audit 25 modules + Fixes
| Lo | Mo ta | Cach khac phuc | Trang thai |
| :-- | :-- | :-- | :-- |
| 256 | API error nuot im lang (custom-input, dsa-modules, lesson, courses) | Hien error banner + retry; courses store dung courseApi thay mock setTimeout | FIXED - 992/992 vitest + vue-tsc CLEAN |
| 257 | Phim Space/ArrowRight kich hoat kep khi focus button VCR (algo-playground) | Guard them BUTTON trong onKeydown | FIXED |
| 258 | XSS: v-html parseEmojiToSvg khong escape (codelabs, gamification, dashboard, admin, animation-engine, VcrExplanationBanner) | escapeHtmlText truoc khi parse | FIXED |
| 259 | BFS/DFS/Dijkstra dead: setAlgorithmMode khong duoc goi | Them section "Thuật toán" trong GraphView sidebar | FIXED |
| 260 | emojiParser thieu path 'pencil' (icon rong) | Them path pencil feather | FIXED |
| 261 | EmbedCommunicationBridge mac dinh allowedOrigins ['*'] + sendMessage '*' | Mac dinh same-origin; test cap nhat | FIXED |
| 262 | Quiz submit error vo hinh; realtime errorMessage khong reset + invoke() khong bat loi | Banner error luon hien; reset error + try/catch invoke + cap notifications | FIXED |
### Review lai toan bo fix - phat hien va xu ly regression (Lo 256-266) — 2026-08-05
| Lo | Mo ta | Cach khac phuc | Trang thai |
| :-- | :-- | :-- | :-- |
| 256 | P0: emojiParser escape toan bo HTML -> vo toan bo Docs/Ly thuyet/markdown (regression tu fix XSS) | Revert: parseEmojiToSvg khong escape; them escapeHtmlText xu ly rieng cho 2 caller XSS that (AlgoPlaygroundWorkspace description code-user, InteractivePlayground explanation label import) | `FIXED` |
| 257 | P0: build fail route /teacher (TeacherQuizTab import features/quiz da xoa) | Xoa import + block ExcelQuizImporter + handler | `FIXED` |
| 258 | P0: double-award XP (lesson flow awardXp + SaveLessonProgress award delta) + farm XP qua XpAwarded tuy y | Bo nhanh award trong SaveLessonProgress (XP chi qua /award-xp co cap); clamp QuizScore 0-100 | `FIXED` — E2E: post 9999 XP khong doi XP |
| 259 | P0: backdoor admin@gmail.com/admin123 + demo Teacher o MỌI moi truong (strategy seed + DbSeeder seed DB) | EnableDemoAccounts chi Development; DbSeeder includeDemoAdmin chi Development + vo hieu hoa legacy admin/demo trong DB cu | `FIXED` — E2E: ca 2 bi 401 |
| 260 | P1: Register id tam (in-memory) != id DB -> token sub sai -> lesson progress orphan | ChangeUserId(tempId, dbId) + phat hanh lai token qua Login; check DB email trung truoc (chong identity confusion) | `FIXED` — E2E: sub khop DB id |
| 261 | P1: Login tra 403 ACCOUNT_BANNED truoc verify -> enumeration | Verify truoc, check ban sau (401 chung) | `FIXED` |
| 262 | P1: Kicked student van truoc lop (ClassroomProgressService khong loc Status) | Them Status==Active o 4 cho check enrollment | `FIXED` |
| 263 | P1: Join bi kick khong rejoin duoc (unique index + Add moi) + InviteCode lo qua Join/GetStudentClassrooms | Reactivate enrollment Kicked/Left; an InviteCode (nullable) o DTO student; StudentCount dem Active | `FIXED` |
| 264 | P1: GetCourseById khong gate publish/premium (lo ContentMd/Draft) + LessonController user null/khong check course.IsPublished | Gate publish/premium o GetCourseById + loc lesson Draft; CheckLessonAccessAsync chinh lai | `FIXED` |
| 265 | P1: RevealHint race double-deduct XP (thieu unique index CodelabHintReveal) | Unique index (UserId, CodelabHintId) + migration | `FIXED` |
| 266 | P2: InteractivePlayground watch thieu graphType; resetQuizStore khong unlock 'quiz' (lock ket); countingSort fallback radix sai so am; CourseDetailView khong watch param; DocsMarkdownRenderer highlighter possibly-null; GuidedTour typingInterval; useAuthStore statelessUser type | Them graphType vao watch; unlock trong resetQuizStore; fallback insertion sort giu algorithmId; watch route.params.id; highlighter!; guard interval; map StatelessUserDto | `FIXED` |
| Ghi nhan | useCourseStore bi doi sang API-first (thay doi NGOAI session) — toi da cap nhat spec mock | — | `INFO` |
### 2026-08-06: Cleanup toan bo loi typecheck/build (docs audit tiep theo)
| Lo | Mo ta | Cach khac phuc | Trang thai |
| :-- | :-- | :-- | :-- |
| 267 | vue-tsc TS2339: Property 'retryFetch' does not exist on type AlgorithmDashboard.vue:32 | Ham retryFetch(): void -> algoStore.fetchAlgorithms() da ton tai tai line 124; typecheck `npx vue-tsc -b --force` exit 0 | `FIXED` |
| 268 | Build warning lightningcss: ':global()' khong hop le trong App.css (file CSS toan cuc, khong phai scoped) | Bo wrapper `:global(...)` o 4 block page-fade transition — selectors van toan cuc vi App.css import global | `FIXED` |
| Ghi nhan | Backend test can `DOTNET_ROLL_FORWARD=LatestMajor` vi may chi co .NET 10 runtime (du an target net9.0); `dotnet test` chay: 154/154 PASS | — | `INFO` |
| Ghi nhan | Build warning "Gradient has outdated direction syntax" (2 lan) den tu `@shikijs/langs` (grammar CSS ben thu 3, khong thuoc src/) — khong block build | — | `INFO` |
### Review lan 2 - fix P1/P2 con sot (Lo 267-281) — 2026-08-06
| Lo | Mo ta | Cach khac phuc | Trang thai |
| :-- | :-- | :-- | :-- |
| 267 | GetCourseById gate publish NHUNG chua gate premium (lo ContentMd khoa tra phi) | Them gate premium (owner/Teacher/Admin/Premium) | `FIXED` |
| 268 | AuthService.MapToUserDto khong set Role (Admin/Teacher tra ve Student qua flow chuan) | Role = user.Role | `FIXED` |
| 269 | Refresh token stateless khong expiry (song vo han) + impersonation refresh vinh vien | RefreshTokenLifetime 30 ngay; ForceAddRefreshToken mac dinh 15 phut; check expiry khi refresh | `FIXED` |
| 270 | StatelessAuth khong rate limit (brute-force login/register) | [EnableRateLimiting("auth")] class-level | `FIXED` — E2E: 429 sau 10 lan |
| 271 | Lesson progress/comments khong qua gate (ghi progress/comment bai premium/draft) | CheckLessonAccessAsync o 3 endpoint + parent comment cung bai | `FIXED` |
| 272 | SaveLessonProgress mark Completed khi quizScore>=1 (sai rule 70%) + XPRewarded khong luu (farm khi doi thiet bi) | Them QuizPassed flag tu client; mark Completed khi codelab/quizPassed; luu XpAwarded clamp | `FIXED` |
| 273 | BadgesController Guid.Parse NRE + Include thua (N+1) | TryParse -> Unauthorized | `FIXED` |
| 274 | Register DbUpdateException -> 503 sai nghia (trung username) + RecordLogin mat o stateless login | DbUpdateException -> 400; RecordLogin khoi phuc | `FIXED` |
| 275 | DeleteModule STUB (khong xoa gi) — khong ton tai command | Tao DeleteClassroomModuleCommand + handler (soft-delete + ownership) | `FIXED` |
| 276 | Codelab CRUD IDOR (teacher sua codelab nguoi khac, entity khong OwnerId) | Them OwnerId + migration; RequireCodelabOwnershipAsync o 11 mutation; CreateCodelab set OwnerId | `FIXED` |
| 277 | VerifyPasswordDelegate default luon false (BCrypt salt ngau nhien) | Default BCrypt.Verify + fallback SHA256 | `FIXED` |
| 278 | ChangePassword demo so chuoi "Demo@2024" (sau lan doi khong doi lai duoc) | Verify qua GetUserPasswordHash + delegate | `FIXED` |
| 279 | GetAuditLogs khong clamp + LogAdminAction loi -> 500 sau action thanh cong | Clamp + try/catch log | `FIXED` |
| 280 | Leaderboard khong clamp (limit toi da 100); Analytics overview/popular public | Clamp 1-20; RequireJwtRole("Teacher,Admin") — frontend khong goi nen an toan | `FIXED` |
| 281 | Frontend: completedAlgorithms khong populate + id lech; stateless khong refresh chu dong; prevSlide khong cancel; isLessonComplete latent; Toast khong escape; TeacherQuizTab nut Excel chet | Lesson flow ghi localStorage + alias nhom; _scheduleRefresh trong _applyStatelessAuth; prevSlide cancel; isLessonComplete them nhanh ly thuyet; Toast escapeHtmlText; xoa nut | `FIXED` |
| Ghi nhan | P0Tests/debug7/lessonStepTheory class mismatch la test files NGOAI session (mock thieu component) — khong do fix cua toi | — | `INFO` |
### Review lan 3 - fix regression dot S (Lo 282-288) — 2026-08-06
| Lo | Mo ta | Cach khac phuc | Trang thai |
| :-- | :-- | :-- | :-- |
| 282 | Rate limit auth truom ca class -> /me/progress/award-xp cung bi 10/phut (chan nham flow hoc) | Chuyen [EnableRateLimiting("auth")] sang method-level: register/login/refresh/logout | `FIXED` — E2E: /me 15 lan khong 429 |
| 283 | Impersonation refresh rotation: refresh trong 15 phut cap refresh moi 30 ngay (mat flag) | RefreshToken giu TTL con lai cua token goc (GenerateAuthResponse nhan refreshTtl) | `FIXED` |
| 284 | DeleteModule handler nem exception -> 500 thay vi 403/404 | Controller bat UnauthorizedAccessException->403, ArgumentException->404 | `FIXED` |
| 285 | LogAdminAction FindAsync ngoai try/catch (DB loi giua chung -> 500) | Boc toan bo body try/catch | `FIXED` |
| 286 | Ban chi chan login: refresh token cu van dung duoc | Refresh check IsActive DB (vo hieu hoa token) | `FIXED` |
| 287 | Frontend: gamification completedAlgorithms stale (chi doc khi rong) + timer catch cleanup sai mode (mat stateless keys) + escapeHtml NO-OP o 2 editor preview (self-XSS) | Merge localStorage moi lan check; _clearStatelessSession dung mode; escape dung &amp;/&lt;/&gt; | `FIXED` |
| 288 | Refresh token tam (Register tempId) dangle trong dictionary | Ghi nhan P3 — token chet sau 30 ngay, khong lo ra client | `INFO` |
### Review lan 4 - fix (Lo 289-296) — 2026-08-06
| Lo | Mo ta | Cach khac phuc | Trang thai |
| :-- | :-- | :-- | :-- |
| 289 | P1: Refresh ban check phu thuoc DB — DB down -> 500 -> frontend xoa session (dang xuat hang loat) | Boc FindAsync try/catch: DB loi -> bo qua ban check, giu phien | `FIXED` |
| 290 | P2: AwardXP memory truoc DB sau — DB loi -> lech vinh vien | DB truoc (FindAsync theo Guid), memory sau | `FIXED` |
| 291 | P2: Register de refresh token tam (sub=tempId) dangle 30 ngay | Logout(response.RefreshToken) ngay sau Register | `FIXED` |
| 292 | P2: BanUser khong sync stateless memory (DB down van login duoc) | InMemoryUser.IsActive + SetUserActive + Login check + BanUser goi | `FIXED` |
| 293 | P2: Frontend isLessonComplete dung quizQuestions.length (quiz tai loi -> completed sai) + setSession khong xoa stateless key (classic mat phien) + timer catch van dang xuat khi loi mang + inline code XSS 2 editor + escape " no-op | Dung lessonMeta.quizId; setSession remove vdsa_stateless_user_id; catch chi clear khi 401; callback escape inline code; &quot; | `FIXED` |
| 294 | P2: Codelab demo-user-001 khong GUID -> OwnerId null + Unauthorized | Map demo -> GUID co dinh (CreateCodelab + GetCurrentUserAndCheckAsync) | `FIXED` |
| 295 | P3: RefreshToken remaining==0 -> 30 ngay | remaining > 1s | `FIXED` |
| 296 | P3: features/codelabs toan module dead code + api path sai | Xoa module (3 file) | `FIXED` |
| Xac nhan | KHONG lo PasswordHash (StatelessUserDto sach); LogAdminAction brace dung; merge badge khong nhan doi | — | `INFO` |
### Review lan 5 - fix (Lo 297-304) — 2026-08-06
| Lo | Mo ta | Cach khac phuc | Trang thai |
| :-- | :-- | :-- | :-- |
| 297 | P1: BanUser KHONG goi SetUserActive (fix Lo 292 bi mat khi chua thuc su ap dung) -> check IsActive memory la dead code, DB down van login duoc | Them _authStrategy.SetUserActive sau SaveChanges trong BanUser | `FIXED` |
| 298 | P1: Timer catch la dead code — refreshAccessToken clear session vo dieu kien TRUOC rethrow -> loi mang thoang qua van dang xuat | refreshAccessToken chi clear khi auth-fail (HTTP 401/403 hoac token/invalid/hết hạn); handleResponse gan status vao Error; timer catch dung status | `FIXED` |
| 299 | P2: Login ban sinh token roi moi check (refresh moi moc oi) | Logout(response.RefreshToken) trong nhanh 401 | `FIXED` |
| 300 | P2: Refresh check ban SAU rotation (token moi moc oi, xoa nham token cu) | GetRefreshTokenOwner check truoc rotation | `FIXED` |
| 301 | P2: AwardXP DB-first khong try/catch (DB hiccup -> 500 tran) | Boc try/catch: loi DB -> log + van award memory | `FIXED` |
| 302 | P2: Codelab admin-user khong GUID -> Guid.Empty -> 401 (admin dev khong sua codelab) | IsAdmin check truoc khi map Guid | `FIXED` |
| 303 | P3: new Random() time-seeded 3 cho (payment code + invite code x2) — cung ms trung ma | RandomNumberGenerator.GetInt32 | `FIXED` |
| 304 | P3: BestScore field chet; rate limit thieu Codelabs/Upload/Payments; isLessonComplete stuck khi quiz tai loi | Xoa field; them heavy/api; quay lai !quizQuestions.length (khong the cham quiz khong tai duoc) | `FIXED` |
| Xac nhan | chuoi "hoặc mật khẩu" dung (console encoding); mojibake khong ton tai | — | `INFO` |
### Review lan 6 - fix (Lo 305-311) — 2026-08-06
| Lo | Mo ta | Cach khac phuc | Trang thai |
| :-- | :-- | :-- | :-- |
| 305 | P1: Classic mode production refresh 401 khong clear session (authApi khong gan status + safe-message thay the) -> 401-refresh loop vo han | authApi.handleResponse gan .status; isAuthFailure = moi 4xx (tru 429) hoac regex | `FIXED` |
| 306 | P1: CreateCodelab admin giu OwnerId client gui (gan codelab cho hoc vien) | IsAdmin -> OwnerId = null (khong tin client) | `FIXED` |
| 307 | P2: Refresh KeyNotFoundException -> 404 -> frontend khong clear -> ket phien | isAuthFailure bao gom 404 (moi 4xx tru 429) | `FIXED` |
| 308 | P2: GenerateMockJwt/GenerateImpersonatedJwt interpolate raw username/email (self-DoS token hong) | JsonSerializer.Serialize payload ca 2 cho | `FIXED` — E2E login/refresh OK |
| 309 | P2: Codelabs heavy class-level gop GET + Run/Submit 15/phut (hoc vien 429 khi luyen code) | GET khong limit; submit/run/reveal-hint heavy rieng | `FIXED` |
| 310 | P2: N+1 GetCourseById (1 query/lesson) + GetCourseAnalytics (2N CountAsync) | Gom GroupBy 1 query -> dictionary ca 2 noi | `FIXED` — E2E 12 lessons OK |
| 311 | P3: RefreshToken remaining<=1s -> 30 ngay (impersonation edge) | Ghi nhan edge (race 1s) | `INFO` |
| Ghi nhan | BanUser memory sync vo hieu voi user chua tung vao memory (van chan duoc qua DB check); ManageQuiz dual-write 2 nguon (P2 cu, can chon 1 nguon); Teacher xem toan bo email (intent?) | — | `INFO` |
### Review lan 7 - fix (Lo 312-322) — 2026-08-06
| Lo | Mo ta | Cach khac phuc | Trang thai |
| :-- | :-- | :-- | :-- |
| 312 | P1: Tab Quan ly hoc vien cua Teacher luon 403 - class-level RequireJwtRole("Admin") chan Teacher nhung frontend (TeacherStudentTab.vue:156) goi /admin/users bang token Teacher; va AdminUsersController (route literal, Admin-only, shape items/totalCount khac frontend) chiếm route | Tao TeacherController (route /concepts/admin/users, method-level Teacher,Admin + filter Role=Student cho teacher); xoa AdminUsersController + GetUsersQuery handler | `FIXED` — E2E: teacher 200 chi Student(11), student 403 |
| 313 | P2: Impersonate half-state: refresh 401 chi xoa stateless keys, ADMIN_* keys con lai -> UI "dang impersonate" khi session da chet | _clearStatelessSession xoa ca vdsa_admin_* + impersonateTrigger++ | `FIXED` |
| 314 | P2: CreateCodelab teacher sub khong phai GUID (khong admin/demo) van giu OwnerId client gui | Fail-closed: else -> OwnerId = null | `FIXED` |
| 315 | P2: ManageQuiz dual-write 2 nguon (bank + DB) - quiz da xoa van hien qua fallback bank | DB la nguon duy nhat: bo _quizBank.Add/Update; GET/Delete da dung DB | `FIXED` — E2E teacher create/GET-by-title/delete OK |
| 316 | P2: Race double XP QuizService: attempt chua commit -> 2 request dong thoi cung thay 0 pass | CommitAsync attempt ngay sau AddAsync (truoc khi doc previousAttempts) | `FIXED` |
| 317 | P2: N+1 CompleteLesson + QuizService (FirstOrDefaultAsync trong loop) | Gom 1 query -> dictionary ca 2 cho | `FIXED` |
| 318 | P2: VisualizationPlayer khong cleanup khi rời view giua cau hoi -> activeQuestion + lock 'quiz' stale | onUnmounted -> quizStore.resetQuizStore() | `FIXED` |
| 319 | P2: Premium lesson -> 403 bi hien "Khong tim thay bai hoc" (sai thong diep, khong CTA) | lessonApi gan .status; store phan biet 403 -> thong diep Premium | `FIXED` |
| 320 | P3: GetMe demo-user-001 404 sau restart (production) -> profile stale | 401 khi EnableDemoAccounts=false de frontend don session | `FIXED` |
| 321 | P3: lessonDistribution sort toan cuc theo OrderIndex (interleave module) | Sort theo (ModuleOrder, OrderIndex) | `FIXED` |
| 322 | Ghi nhan | Codelab legacy (OwnerId null truoc R6): chi Admin sua duoc - trade-off dung (khong biet chu that); Teacher chi thay Student qua /admin/users; rate limit theo IP can UseForwardedHeaders khi deploy sau proxy | — | `INFO` |
### Review lan 8 - fix (Lo 323-333) — 2026-08-06
| Lo | Mo ta | Cach khac phuc | Trang thai |
| :-- | :-- | :-- | :-- |
| 323 | CAO: Quiz teacher tao (DB-only) bien mat khoi tab teacher - GET /quiz/all + /topics + /topic/{t} van bank-only; GetById uu tien bank truoc nhung Submit uu tien DB truoc (le 2 nguon) | Merge DB + bank vao /all (dedupe theo Title), /topics, /topic/{t}; dao GetById: DB truoc -> bank fallback (dung nhu Submit) | `FIXED` — E2E: all=58, topics=11, seed by title OK |
| 324 | CAO: Thieu UseForwardedHeaders - sau proxy rate limit gop 1 bucket IP + HttpsRedirection sai scheme | app.UseForwardedHeaders(XForwardedFor + XForwardedProto) sau request logging | `FIXED` |
| 325 | TB: TeacherController fallback in-memory khong filter Student (lo email Admin/Teacher khi DB down) + page khong clamp | Filter Student o ca fallback; clamp page>=1, pageSize<=100 | `FIXED` |
| 326 | TB: CreateQuiz response quiz.id rong (DTO dau vao khong Id) | Gắn Id GUID thuc sau SaveChanges | `FIXED` |
| 327 | TB: q.Id.ToString() == quizId trong EF query (UpdateQuiz/DeleteQuiz) phu thuoc EF translate | Parse Guid truoc, query theo Id hoac Title | `FIXED` |
| 328 | TB: QuizService commit som lam mat tinh nguyen tu - AwardXP throw sau commit -> XP mat vinh vien, attempt da Passed | Bao try/catch quanh AwardXP + CompleteModule, log loi, van tra ket qua | `FIXED` |
| 329 | TB: Jwt:Key placeholder trong appsettings (production) - JWT gia mao duoc neu quen set env | Fail-fast: IsProduction + key placeholder/rong -> throw InvalidOperationException | `FIXED` — E2E can set Jwt__Key env |
| 330 | TB: PaymentsController catch im lang (webhook SePay kho debug) | Serilog.Log.Error("SePay webhook failed") | `FIXED` |
| 331 | THAP: Thieu AsNoTracking o query read-only (dashboard, registration, audit, analytics) | Them AsNoTracking 4 noi | `FIXED` |
| 332 | THAP: 5 .vue dead (ConceptScenarioPicker, VcrExplanationBanner, LessonContentEditor, CourseBuilder, AlgorithmSearchBar) | Xoa (0 import) | `FIXED` |
| 333 | Ghi nhan INFO | 7 .vue chi test import (PremiumGate, LessonDiscussionPanel, LessonListItem, CodelabItemModal, CustomLessonCreator, ClassroomModuleAccordion, CodeEditorApiHints) - giu cho test; cleanup useAuthStore 2 duong lech (timer xoa admin keys khi impersonate) - TH hiem; EF warnings (global query filter required-end, ClassroomAnnouncement.ClassroomId1 shadow FK, Embedding comparer) | — | `INFO` |
### Review lan 9 - fix (Lo 334-343) — 2026-08-06
| Lo | Mo ta | Cach khac phuc | Trang thai |
| :-- | :-- | :-- | :-- |
| 334 | CAO: Difficulty DB tra "1/2/3" (int.ToString) trong khi bank "easy/medium/hard" - teacher sua quiz DB bi reset ve medium | Helper DifficultyToLabel map int->easy/medium/hard, ap 4 diem (GetAll/GetById/GetByTopic/CreateQuiz) | `FIXED` — E2E difficulties=[easy,hard,medium] |
| 335 | CAO: API keys that (OpenRouter + AimlApi) trong appsettings.Development.json - bi mat trong git | Xoa key, thay placeholder + doc tu env; CAN XOAY (revoke) key cu | `FIXED` — user phai xoay key |
| 336 | CAO: XSS stored — LectureOverlay v-html raw (no sanitize) + DocsMarkdownRenderer marked.parse khong DOMPurify | Them dompurify dep; sanitize ca 2 (ADD_ATTR style giu layout) | `FIXED` |
| 337 | TB: 7 component v-html parseEmojiToSvg khong escape (SortingTraceTable, BucketBanner, RadixBanner, RadixInspector, CountingBanner, SortingDetailPanel, BucketConnector) | Bao escapeHtmlText 9 diem | `FIXED` |
| 338 | TB: GetByTopic Concat khong dedupe - quiz trung title 2 nguon hien 2 card | GroupBy Title (DB thang) nhu GetAll | `FIXED` — E2E /topic/Sorting 1 quiz |
| 339 | TB: Rate limit partition theo IP - truong hoc chung IP (NAT) -> 429 hang loat khi cung login | Partition theo user sub (da dang nhap) -> IP fallback | `FIXED` |
| 340 | TB: Production CORS chua localhost:5173/3000 + domain placeholder | Chi giu domain that (placeholder) | `FIXED` |
| 341 | Ghi nhan: X-Forwarded-For spoof (client tu dat header gia de tron rate limit khi goi thang) | Khi deploy sau proxy: config KnownNetworks = dai proxy | `INFO` |
| 342 | Ghi nhan: SignalR token qua query string (access_token) co the lot access log/proxy | Chan log query tai nginx hoac doi headers transport | `INFO` |
| 343 | Ghi nhan: Jwt:Key fail-fast chi IsProduction - Staging/trong env van dung placeholder | Xem lai neu co moi truong staging | `INFO` |
### Review lan 10 - fix (Lo 344-345) + tong ket — 2026-08-06
| Lo | Mo ta | Cach kiem tra | Trang thai |
| :-- | :-- | :-- | :-- |
| 344 | Kiem tra XP bug (attempt.Id client-side GUID — SAI, khong phai bug) | QuizAttempt constructor dung Guid.NewGuid() -> filter dung | `FALSE POSITIVE` |
| 345 | P2: localStorage.setItem khong try/catch trong impersonate/restore path | Wrap try/catch ca 2 path | `FIXED` |
| — | P2 INFO con lai: Task.Run AlgorithmsController (demo OK), new Random fallback (demo OK), EF warnings (khong runtime bug), SQLite wildcard (parameterized OK) | — | `INFO` |
### Hotfix local CORS — 2026-08-06
| Lo | Mo ta | Cach khac phuc | Trang thai |
| :-- | :-- | :-- | :-- |
| 346 | Preflight tu `http://localhost:5173` den backend `:5055` tra 204 nhung thieu `Access-Control-Allow-Origin` vi `START-PROJECT.bat` khoi dong backend bang Production, trong khi Production CORS chi cho domain deploy | Dat `ASPNETCORE_ENVIRONMENT=Development` trong launcher va them `launchSettings.json` de `dotnet run` local mac dinh dung Development CORS | `FIXED` — runtime verify: OPTIONS login/courses co Allow-Origin, GET courses 200 |
| 347 | Login demo tra 401 sau khi backend tung chay Production: production seeder da disable credential cong khai trong DB; khi quay lai Development, seeder chi set role nen `IsActive=false` van con. Frontend lai thu refresh token tren chinh request login 401 | Development seeder reactivate + reset password cho 3 credential development; fetch interceptor bo attach/refresh token tren login/register/refresh/logout/demo-credentials | `FIXED` — runtime login demo 200, role Teacher; Vite build pass |

### UI Redesign Review — Business Logic & UX Fixes — 2026-08-07
| Lo | Mo ta | Cach khac phuc | Trang thai |
| :-- | :-- | :-- | :-- |
| 348 | BreadcrumbsBar: separator render SAU tat ca links thay vi GIUA chung — do 2 v-for loop rieng biet, DOM order: [link1][link2][link3][sep1][sep2] | Gop vao 1 template v-for duy nhat, moi item: router-link + separator | `FIXED` |
| 349 | goToStep(3) bi block neu user da pass quiz truoc do nhung vua load lesson — hasWatchedVisualizer reset false trong loadLesson, guard chi cho phep neu da watch viz | Relax guard: `stepNumber === 3 && !hasWatchedVisualizer.value && !quizPassed.value` | `FIXED` |
| 350 | Sidebar khong auto-scroll toi lesson hien tai khi navigate qua bottom nav buttons | Watch currentLessonId + querySelector('.border-l-accent') + scrollIntoView({ block: 'nearest', behavior: 'smooth' }) | `FIXED` |

### UI Redesign Round 2 — Review Fixes — 2026-08-07
| Lo | Mo ta | Cach khac phuc | Trang thai |
| :-- | :-- | :-- | :-- |
| 351 | CourseDetailView: `useRouter` imported but never used — dead code | Removed unused import + `const router = useRouter()` declaration | `FIXED` |
| 352 | CodeLab: `activeTab.value = 'testcases'` on every Run click overrides user's active tab (Problem/Hints) | Removed forced tab switch — user stays on current tab after Run | `FIXED` |
| 353 | Completion modal has no click-outside-to-close — user must click one of 3 buttons to dismiss | Added `@click.self="$emit('close')"` on backdrop div | `FIXED` |
| 354 | Breadcrumb first item label inconsistent: CourseDetail "Khóa học" vs LessonStudy "Trang chủ" — both point to /courses | Unified to 'Khóa học' across both views | `FIXED` |

### UI Redesign — New Component Unit Tests (2026-08-07)
| Lo | Mo ta | Cach khac phuc | Trang thai |
| :-- | :-- | :-- | :-- |
| 355 | uiRedesignComponents.spec.ts: CourseSidebar emit test failed — Pinia not set up, `useCourseStore()` threw `getActivePinia()` error | Added `beforeEach(() => setActivePinia(createPinia()))` to CourseSidebar describe block | `FIXED` |
| 356 | uiRedesignComponents.spec.ts: CourseSidebar emit test — RouterLink stub did not forward `@click` events, `findComponents` + `findAll('a.rl-stub')` approach failed | Changed stub to explicitly emit 'click' on root `<a>` with `emits: ['click']`; used `findComponents(RouterLinkStub)` + index fix (links[2] = l2 due to back-to-course link at index 0) | `FIXED` |

### EC Execution Control Batch � VCR Playback UI/UX Fixes � 2026-08-09
| Lo | Mo ta | Cach khac phuc | Trang thai |
| :-- | :-- | :-- | :-- |
| 357 | EC-003: Nut Play "chet" o frame cuoi - thieu Replay | VcrDockBar: icon refresh-cw + title/aria-label "Phat lai tu dau" khi isAtEnd && !isPlaying | FIXED |
| 358 | EC-007: Option toc do 10x vuot tran spec (max 5.0x) | 2 noi (VcrDockBar + AnimationVcrControls) dung chung SPEED_PRESETS [0.1..5.0] | FIXED |
| 359 | EC-013: Thieu @mousedown pause + throttle 30FPS cho scrub | @mousedown=vcrStore.pause() + throttle 33ms (performance.now guard) trong handleScrub | FIXED |
| 360 | EC-014: Scrubber VcrDockBar mat thumb + fill progress | style scoped .vcr-scrubber: thumb 20px trang vien #06B6D4 + gradient fill qua --scrub-progress | FIXED |
| 361 | EC-015: AnimationVcrControls thieu disabled states + counter 1/0 | disabled stepBack/stepForward/ca 4 nut+slider khi totalSteps===0; counter 0 / 0 | FIXED |
| 362 | EC-025: Phim tat khong chan e.repeat (Space toggle rung) | guard e.repeat cho Space/R o usePlaybackHotkeys, useDSAKeyboard, SortingView; Arrow giu repeat | FIXED |
| 363 | EC-027: Title nut play tinh | title/aria-label computed dong theo isPlaying/isAtEnd (VcrDockBar) | FIXED |
| 364 | EC-028: Nut icon-only thieu aria-label (AnimationVcrControls) | them aria-label + title cho 4 nut | FIXED |
| 365 | EC-029: Counter thieu aria-live | aria-live=polite cho counter VcrDockBar + AnimationVcrControls | FIXED |
| 366 | EC-030: Thieu phim tat R: Reset trong huong dan SortingView | them "| R: Reset" vao hint bar | FIXED |
| 367 | EC-031: VcrDockBar lech visual phase2 S1 (rounded-lg) | rounded-full + bg-slate-900/45 + border-white/10 + backdrop-blur (capsule glassmorphic) | FIXED |
| 368 | EC-036: SortingView hotkey khong check interactionLocked | guard animStore.interactionLocked truoc switch (tuong tu usePlaybackHotkeys:15) | FIXED |
| � | Ghi nhan: 2 test cu pin SPEED_PRESETS cu (5 options 0.5x-10x) se fail sau EC-007 (drift EC-044) � animationP0Tests 'renders speed selector with correct options' + dsaP0Tests 'renders speed selector with all options' | � | INFO |

### Interactive Playground Canvas & Physics Fixes (IP-006..IP-030 + EC-018) — 2026-08-10
| Lo | Mo ta | Cach khac phuc | Trang thai |
| :-- | :-- | :-- | :-- |
| 369 | EC-018/IP-030: Vong lap idle draw full-graph 12.5FPS vi vinh vien (khong dung isStable) | PlaygroundCanvas.vue: dirty-flag render loop — loop chi chay khi busy (algorithm mode/drag/pan/ve canh/physics dang hoi tu) hoac markDirty(); khi physics isStable(energy) ve 1 frame cuoi roi dung han (bo idleTimer 80ms) | FIXED |
| 370 | IP-006: Clamp keo-tha node dung view-space ap len world-space (zoom 0.5 node dung giua man hinh) | canvasEventHandlers.handleMouseMove nhan them zoom+pan, clamp qua GraphGeometryEngine.worldBoundsFromViewport + clampPointToBounds (minX=-pan.x/zoom+20, maxX=(width-pan.x)/zoom-20) | FIXED |
| 371 | IP-007: Hover highlight dead code — setHoveredNodeId/setHoveredEdgeId khong bao gio duoc goi | handleMouseMove (khong drag, khong ve canh): hitTestNode uu tien thang hitTestEdge, set hover theo bien doi; onPointerLeave clear hover | FIXED |
| 372 | IP-010: Tao canh "ma" khi kéo ra ngoai canvas (mouseleave = mouseup) | Bo @mouseleave="onMouseUp"; dang ky window pointerup/pointercancel khi bat dau interaction — chi commit addEdge khi release TRONG canvas, ngoai canvas thi cancel | FIXED |
| 373 | IP-012: Thieu DPI/Retina (text/grid mo nhoe tren HiDPI) | draw()/resizeCanvas(): canvas.width = cssW*dpr, setTransform(dpr,0,0,dpr,0,0); bo binding :width/:height template; sua vi tri popover weight bo nhan rect.width/canvas.width (getMousePos giu nguyen nhan ty le) | FIXED |
| 374 | IP-013: Snap 40px + hit-test edge 8px tinh theo world vo UX khi zoom | isWithinSnapDistance + hitTestEdge nhan them param zoom: threshold/zoom, toi thieu 5px screen | FIXED |
| 375 | IP-014: Khong co touch/pointer events | Chuyen canvas sang Pointer Events (pointerdown/move/up/cancel/leave) + setPointerCapture/releasePointerCapture + CSS touch-action:none; touch single pointer hoat dong nhu chuot; TODO pinch zoom | FIXED |
| 376 | IP-015: Zoom bi tre ~80ms (khong nam trong busy list) | onWheel goi markDirty() ngay — render loop dirty flag ve ngay khong cho idle timer | FIXED |
| 377 | IP-016: Physics clamp quen tru panOffset (node bi day ra ngoai man hinh khi pan) | ForceDirectedEngine.tick nhan optional worldBounds (minX/maxX/minY/maxY world-space tu pan/zoom); PlaygroundCanvas truyen getPhysicsWorldBounds() | FIXED |
| 378 | IP-017: Grid khong phu vung visible khi pan + lineWidth khong theo zoom | drawGrid ve tu -pan.x/zoom -> (width-pan.x)/zoom (snap boi so gridSize 40), ctx.lineWidth = 1/zoom | FIXED |
| 379 | IP-018: Hai node trung toa do dx=dy=0 -> luc day = 0 -> chong lan vinh vien | ForceDirectedEngine: khi dist===0 chon huong jitter (dx=1, dy=0) ca vong repulsion lan spring | FIXED |
| 380 | IP-024: hitTestEdge threshold 8px world — zoom<1 khong bam duoc canh | GraphGeometryEngine.hitTestEdge them param zoom: screenThreshold = Math.max(threshold/zoom, 5) | FIXED |
| 381 | IP-027: store.zoomLevel khong reset khi unmount (header % sai khi quay lai view) | onUnmounted: store.resetZoom?.() neu co, nguoc lai store.zoomLevel = 100 (TODO khi store them action) | FIXED |
| � | Ghi nhan: addEdge chua nhan graphType (IP-004 cho agent store) — PlaygroundCanvas con TODO comment nối directed | � | INFO |

### Interactive Playground Test Hardening (IP-033..IP-041) — 2026-08-10
| Lo | Mo ta | Cach khac phuc | Trang thai |
| :-- | :-- | :-- | :-- |
| 382 | IP-033: graphP2Tests tautological (zoom/pan/legend/guide/header assert tren gia tri tu tinh) | Xoa test sao chep bieu thuc; thay bang mount PlaygroundCanvas/InteractivePlayground + assert DOM/canvas that: wheel→store.zoomLevel+ctx.scale+clamp 20-300%, pan→ctx.translate, legend aria-label, guide overlay text+nut "Da hieu", header counter — graphComponentTests.spec.ts | FIXED |
| 383 | IP-034: graphP0Tests "exportGraph" tu JSON.stringify store (store khong co ham export) | Thay bang mount InteractivePlayground + click nut "Xuat JSON" (aria-label) + spy URL.createObjectURL/HTMLAnchorElement.click + doc noi dung Blob + toast — graphP0Tests.spec.ts + graphComponentTests.spec.ts | FIXED |
| 384 | IP-035: graphP2Tests "loadTemplate" tu addNode/addEdge tay, khong goi loadTemplate that | Thay bang mount GraphView + click nut Triangle/Square/Star → kiem tra store that (3N/3E, 4N/4E, 6N/5E) — graphComponentTests.spec.ts | FIXED |
| 385 | IP-036: Simulator chi test undirected — nhanh resolveNeighbor directed 0 test | Them 12 tests directed: BFS/DFS/Dijkstra chi di theo muoi ten, dist nguoc huong=Infinity, 2 canh nguoc chieu A->B+B->A, trong so dung chieu — graphAlgorithmSimulator.spec.ts | FIXED |
| 386 | IP-038: Mock canvas graphP0Tests thieu save/restore/translate/scale... | Tao __tests__/canvasMock.ts: context mock day du (save/restore/translate/scale/rotate/setTransform/arc/fill/stroke/beginPath/closePath/clearRect/fillText/measureText/setLineDash/getLineDash + style props), installCanvasMock() dung chung graphP0Tests + graphComponentTests | FIXED |
| 387 | IP-039: Tracking lech + 0 test component cho PlaygroundCanvas/InteractivePlayground/canvasEventHandlers | graphComponentTests.spec.ts (33 tests mount PlaygroundCanvas: ADD_NODE, ADD_EDGE snap, IP-010 release ngoai canvas, khoa ve; InteractivePlayground: weight popover Enter/Blur/Esc + 0/1000/NaN, import toast, phim tat that, toolbar lock, legend/guide/header) + canvasEventHandlersTests.spec.ts (21 tests unit 5 mode × hit/miss) + cap nhat progress.md/features-tested.md | FIXED |
| 388 | IP-040: 0 test component InteractivePlayground.vue (weight popover, import, shortcuts, lock) | Phu het trong graphComponentTests.spec.ts — popover weight (Enter/Blur/Esc, gia tri 0/1000/NaN), toast import invalid/valid, phim tat V/N/E/W/Del/Backspace qua handleKeydown that, lock toolbar khi isAlgorithmMode (an export/import/physics/clear + chan ve canvas) | FIXED |
| 389 | IP-041: mockKeydownHandler nhan ban logic that cua handleKeydown (nguy co drift) | Xoa mockKeydownHandler + stubs window khong con dung; phim tat test qua mount InteractivePlayground + dispatch KeyboardEvent that tren window (handleKeydown that, InteractivePlayground.vue:386-403) | FIXED |
| � | Ghi nhan: BEHAVIOR_SPEC S3 (lock toolbar chua disable tool buttons khi isAlgorithmMode — tool buttons van click duoc) — component dang xem xet | Tool buttons (Select/Node/Edge/Weight/Delete) van hien + click duoc trong algorithm mode; test chi assert phan da implement (an nut hanh dong + chan vẽ canvas + chan phim tat) | INFO |
| � | Ghi nhan: import JSON component (InteractivePlayground.vue:314-319) van dung clearAll+push thay vi store.importGraph (TODO IP-003) — test component viet theo hanh vi hien tai | Khi component chuyen sang importGraph, kiem tra lai test "JSON hop le" (toast text "Đã nhập 1 đỉnh, 0 cạnh.") | INFO |

### Pseudocode Sync Data Source Fixes (PS-001, PS-009, PS-010, PS-024, CC-009) — 2026-08-10
| Lo | Mo ta | Cach khac phuc | Trang thai |
| :-- | :-- | :-- | :-- |
| 390 | PS-001/CC-009: Frame khong bao gio mang activeLogicalLineId/variables — toan bo pseudocode highlight chet | FrameDTO.cs them `ActiveLogicalLineId` (string?) + `Variables` (Dictionary<string,object>?); `AlgorithmBase.CaptureState` them 2 optional param (backward-compatible); `BubbleSortStrategy.cs` emit FUNC_DECL/OUTER_LOOP/INNER_LOOP/COMPARE_STEP/SWAP_STEP + variables (i/j/n/temp); fallback `sortingGenerators.generateBubbleSort` bo sung dong bo. WebApi camelCase + WhenWritingNull tu dong serialize dung | FIXED |
| 391 | PS-009: temp trong frame swap hien thi sai (capture sau swap) | `const temp = arr[j]` TRUOC lenh swap o ca 3 nguon: `algorithmApi.ts` (dummy), `sortingGenerators.ts`, `BubbleSortStrategy.cs` | FIXED |
| 392 | PS-010: INNER_LOOP khong bao gio duoc emit (dong "for j" khong bao gio highlight) | Them frame `INNER_LOOP` dau moi pass (j===0) o ca 3 nguon sinh frame | FIXED |
| 393 | PS-024: OUTER_LOOP chi phat CUOI moi pass thay vi dau pass | Them frame `OUTER_LOOP` ngay dau moi pass (i++ bat dau pass); giu frame tong ket cuoi pass (semantics loop header re-eval) | FIXED |

### Pseudocode Sync UI Fixes (PS-003, PS-004, PS-005, PS-008, PS-012, PS-013, PS-014, PS-015, PS-018, PS-019, PS-020, PS-033, PS-034, PS-035, PS-036, PS-037, PS-039) — 2026-08-10

| Lo | Mo ta | Cach khac phuc | Trang thai |
| :-- | :-- | :-- | :-- |
| 394 | PS-003 (P0): `highlightSyntax` regex chay tren HTML da chen span → chu rac CSS `#60a5fa` | Viet lai tokenizer 1 luot tren TEXT GOC: alternation `(comment|string|apiFunc|keyword|number|punct)`, escape tung token (`&` `<` `>`), khong bao gio regex tren HTML da sinh; verify jsdom (comment nguyen khoi, `&gt;` khong du, khong con `#60a5fa` rac) | FIXED |
| 395 | PS-039: keyword set chung moi ngon ngu (def/in/range/len to ca trong C++) | Tach bang KEYWORDS/API_FUNCS theo language — `def/in/range/len` chi trong python, `print` chi API python; `highlightSyntax(text, language?)` them param language | FIXED |
| 396 | PS-005 (P1): Auto-scroll sai he toa do (`offsetTop` theo body vs `scrollTop` viewport) → scroll ve day moi frame | Rect math: `top = aRect.top - vRect.top + viewportEl.scrollTop` (getBoundingClientRect), so sanh voi scrollTop/clientHeight | FIXED |
| 397 | PS-012: class `white-space-pre` khong ton tai → mat thut le | Doi thanh `whitespace-pre` (Tailwind) + CSS `white-space: pre` tren `.code-line` (dam bao khong phu thuoc scanner) | FIXED |
| 398 | PS-013: O(L×F) moi render — getOccurrenceInfo/goi 2 lan/dong trong v-for | Computed `occurrenceMap: Map<logicalId, {current,total}>` tinh 1 lan moi khi frames/currentIndex/script doi; template doc tu map | FIXED |
| 399 | PS-014: Tab preventDefault vo dieu kien → bay focus | Tab giu focus mac dinh; chi Ctrl+Tab/Alt+Tab (Shift de lui) moi doi ngon ngu | FIXED |
| 400 | PS-015: Badge watch order nhay theo Object.entries frame; panel bien mat khi frame thieu variables | Sort alphabet theo ten trong component; bo `v-if` + `min-height: 96px` cho `.watch-panel-card` | FIXED |
| 401 | PS-018: ref callback bo qua null → lineRefs giu node detached khi doi ngon ngu | Ref callback `else { delete lineRefs[line.lineNumber] }` khi el = null | FIXED |
| 402 | PS-019: smooth-scroll xep hang jank khi seek nhanh | `behavior: animStore.isPlaying ? 'auto' : 'smooth'` | FIXED |
| 403 | PS-020: badge hien "2/5" cho dong chua thuc thi | Badge chi render khi `line.logicalId === pseudocodeStore.activeLogicalLineId && total > 1` | FIXED |
| 404 | PS-004 (P1): doi thuật toan khong co script → pseudocode cu hien sai | VisualizationPlayer.vue: `else pseudocodeStore.resetStore()` khi `loadPsScript(newId)` tra null | FIXED |
| 405 | PS-008 (P1): onUnmounted khong reset pseudocode store | `pseudocodeStore.resetStore()` trong onUnmounted (truoc quizStore.resetQuizStore + animStore.destroy) | FIXED |
| 406 | PS-033/PS-034: a11y — tabs thieu role/aria, dong code khong tabindex, viewport outline:none mat focus ring | Tablist/Tab + aria-selected + aria-controls; viewport role=tabpanel + aria-label + aria-labelledby; dong code tabindex=0 + role=button + Enter snap; focus-visible ring cho tab/viewport/code-line | FIXED |
| 407 | PS-035: Lech CSS spec 02-ui-ux.md | Active line `text-shadow: 0 0 10px` neon green; gutter 28px/margin 16px; code-line padding 6/20; lang-btn font 13px; watch card margin 16px/padding 16px/radius 16px | FIXED |
| 408 | PS-036: Empty line hien thi `//` gia | `highlightSyntax` tra `''` khi text rong/whitespace-only | FIXED |
| 409 | PS-037: dieu kien thua `!isLineExecutable(x) && x === 'NO_ACTION'` | Don gian thanh `'comment': !isLineExecutable(line.logicalId)` | FIXED |
| 410 | PS-038: `VariableState` thieu `type: 'index'|'pointer'|'temporary'` (TECHNICAL_SPEC §1) | TODO comment trong VariableWatchPanel.vue — file types/* do agent khac so huu; chua sua | TODO |
| 411 | PS-006 (P1): Thieu debounce highlight 50ms khi speed >= 2.0 (BEHAVIOR_SPEC section 1) | usePseudocodeStore: watcher flush:'sync' theo currentFrame/language/script; speed >= 2 -> trailing debounce 50ms + xoa highlight ngay khi vao cua so (skip intermediate, chi hien dong dich cuoi); speed < 2 -> cap nhat dong bo; timer clear khi reset + onScopeDispose (khong leak timer) | FIXED |
| 412 | PS-016 (P2): usePseudocodeStore tu viet lai lookup line | Chuyen sang duy nhat PseudocodeSyncEngine.getPhysicalLineNumbers (bien the cua getPhysicalLineNumber tra danh sach) - 1 nguon logic duy nhat | FIXED |
| 413 | PS-017 (P2): in operator trong scriptLoader -> hasPseudocodeScript('toString') true, loadPseudocodeScript('constructor') crash | Thay bang Object.hasOwn(registry, id) o ca 2 ham | FIXED |
| 414 | PS-021 (P2): usePseudocodeStore hardcode useAnimationStore() | Them indAnimationStore(store)/unbindAnimationStore() (module-level binder; KHONG dung tham so setup store vi pinia 2.3+ goi setup({action}) chiem cho tham so); default giu useAnimationStore() | FIXED |
| 415 | PS-022 (P2): pause() goi 2 lan trong snap helpers | Bo ca 2 nimStore.pause() (goToFrame da pause); interface AnimationStoreSync ghi hop dong goToFrame tu pause | FIXED |
| 416 | PS-023 (P2): scriptLoader khong validate cau truc script khi dang ky | alidatePseudocodeScript + egisterPseudocodeScript fail-fast (throw + console.error): languages non-empty, language hop le, lines non-empty, lineNumber duong & duy nhat, text/logicalId non-empty; registry duyet qua register | FIXED |
| 417 | PS-011 (P2): Nhieu dong cung logicalId -> chi dong dau sang (Java 5,6,7 SWAP_STEP; Python/JS 2 dong FUNC_DECL) | Chon huong ENGINE TRA DANH SACH (it pha vo test nhat): them PseudocodeSyncEngine.getPhysicalLineNumbers tra toan bo line khop + store expose ctivePhysicalLineNumbers: number[] (giu ctivePhysicalLineNumber first-match de tuong thich); TODO agent component: MultilingualCodePanel chuyen sang danh sach de ca 3 dong Java cung sang | FIXED (phan engine/store; con TODO component) |
| 418 | PS-010 (P2): INNER_LOOP khong bao gio duoc emit (phan dsa-modules sortingGenerators.ts) | Dummy generator animation-engine + backend da emit INNER_LOOP dau moi vong j (agent khac fix); sortingGenerators.ts (dsa-modules) van chua gan activeLogicalLineId - TODO agent dsa-modules (da ghi comment trong bubble-sort.pseudocode.ts) | TODO (agent khac) |
| 419 | PS-009/PS-024 (P2): temp trong frame swap sai + OUTER_LOOP phat cuoi pass | Da fix o animation-engine/services/algorithmApi.ts + sortingGenerators.ts + backend (agent khac) - xac nhan nhin code 2026-08-10 | FIXED (agent khac) |
| 420 | QZ-010 (P1): Validator khong check can tren correctOptionIndex + khong Number.isInteger | QuizSchemaValidator.ts: them Number.isInteger + >= 0 + `< options.length` (loi "ngoai dai phuong an") | FIXED 2026-08-10 |
| 421 | QZ-011 (P1): question.type khong hop le bi bo qua im lang | QuizSchemaValidator.ts: else branch day loi `Kieu cau hoi khong ho tro: <type>` | FIXED 2026-08-10 |
| 422 | QZ-012 (P1): Validator crash TypeError khi checkpoint la null | QuizSchemaValidator.ts: guard `!cp || typeof cp !== 'object'` dau vong lap + bao loi | FIXED 2026-08-10 |
| 423 | QZ-013 (P1): saveAttempt crash khi localStorage hop le JSON nhung sai shape | QuizStatsManager.ts: normalizeStats validate shape sau parse (completedQuizzes la array, field la so nguyen khong am) + fallback default + try/catch bao | FIXED 2026-08-10 |
| 424 | QZ-020 (P2): checkpoints: [] duoc chap nhan (isValid true) | QuizSchemaValidator.ts: checkpoints rong -> loi "Quiz khong co cau hoi nao." | FIXED 2026-08-10 |
| 425 | QZ-021 (P2): frameIndex 5.5 pass validate nhung checkpoint chet am tham | QuizSchemaValidator.ts: them Number.isInteger(frameIndex) | FIXED 2026-08-10 |
| 426 | QZ-022 (P2): Khong phat hien trung frameIndex / trung question.id | QuizSchemaValidator.ts: Set<number> + Set<string> do trung lap, day loi cu the | FIXED 2026-08-10 |
| 427 | QZ-023 (P2): Streak lifetime toan cuc (sai 1 cau tuan truoc -> streak ve 0); thieu getAccuracy | quiz.types.ts: them `bestStreak` (lifetime ky luc khong giam), giu `streak` (phien, reset khi sai) backward-compat voi QuizSummaryCard; QuizStatsManager.getAccuracy() = round(correct/total*100) | FIXED 2026-08-10 |
| 428 | QZ-038 (P2, phan types): TRUE_FALSE khong ep dung 2 options; options khong ep la chuoi khong rong; radius node khong check | QuizSchemaValidator.ts: TRUE_FALSE dung 2 phuong an; moi option phai la chuoi khong rong; optional `nodes` radius > 0 | FIXED 2026-08-10 |
| 429 | QZ-049 (P3): QuizStatsManager.spec thieu test partial JSON (thieu field) | QuizStatsManager.spec.ts: them 5 test moi (partial JSON, wrong-shape fields, saveAttempt tren storage sai shape, bestStreak lifetime, getAccuracy) | FIXED 2026-08-10 |
| 430 | QZ-006 (P1): syncSessionToServer dead code + POST sai URL /api/v1/quizzes/attempt | quizApi.ts: doi URL thanh /api/v1/concepts/quiz/submit, payload { quizId, answers: number[] } khop StatelessQuizAttemptRequest, response StatelessQuizAttemptResult; retry 1 lan (mang/5xx/timeout, khong retry 4xx); xpSyncError state; goi trong dismissQuestionAndContinue khi hoan tat toan bo checkpoint; loadCheckpoints(quizCheckpoints, quizId?) - TODO agent PS: truyen script.algorithmId tu VisualizationPlayer | FIXED 2026-08-10 (phia store/service; TODO wire player) |
| 431 | QZ-007 (P1): Race thoat quiz khi submitBackendQuiz in-flight -> state cu song lai | exitBackendQuiz guard isBackendQuizSubmitting (chan thoat giua chung submit) + generation-token backendQuizGeneration cho start/submit - response cu bi loai bo sau exit (mau useLectureStore:17) | FIXED 2026-08-10 |
| 432 | QZ-008 (P1): statelessQuizApi thieu timeout -> treo vinh vien | Ca 4 ham fetch dung AbortSignal.timeout(10000); TimeoutError/AbortError -> throw Error('timeout') -> backendQuizError | FIXED 2026-08-10 |
| 433 | QZ-017 (P1): submitQuizAttempt payload thieu answers -> 400 im lang | QuizAttemptPayload = { quizId, answers: number[] } (khop StatelessQuizAttemptRequest.Answers); QuizAttemptResponse = StatelessQuizAttemptResult; throw loi ro thay vi console.warn + return null (QZ-031) | FIXED 2026-08-10 |
| 434 | QZ-018 (P1): Checkpoint completed TRUOC khi tra loi dung | triggerCheckpointQuestion khong con push; markCheckpointCompleted chi push khi isCorrect===true (BEHAVIOR_SPEC 3); tra loi sai -> tua lai van retry | FIXED 2026-08-10 |
| 435 | QZ-019 (P1): Dismiss khong resume playback -> lecture ket isWaitingForAnimation | useLectureStore.them resumeLecturePlayback(): resume tu currentIndex, nhanh isWaitingForAnimation chay lai playUntilFrame; dismissQuestionAndContinue goi sau unlock | FIXED 2026-08-10 |
| 436 | QZ-024 (P2): quizLoader khong validate script khi dang ky | registerQuizScript fail-fast: key === script.algorithmId + QuizSchemaValidator.validateQuizJson({ checkpoints }) | FIXED 2026-08-10 |
| 437 | QZ-025 (P2): 401 khong tu refresh/retry | statelessQuizApi: 401 -> authStore.refreshAccessToken() -> retry 1 lan voi token moi; refresh that bai -> giu loi HTTP goc | FIXED 2026-08-10 |
| 438 | QZ-026 (P2): Double-click "Lam lai" -> 2 GET song song; retry fail giu quiz cu | startBackendQuiz guard isBackendQuizLoading (chan double-call); catch fail -> xoa activeBackendQuiz + isBackendQuizMode=false | FIXED 2026-08-10 |
| 439 | QZ-027 (P2): isBackendQuizLoading dung chung cho submit -> UI skeleton thay vi "Dang gui..." | submitBackendQuiz chi set isBackendQuizSubmitting, khong con set isBackendQuizLoading | FIXED 2026-08-10 |
| 440 | QZ-029 (P2): CANVAS_TARGET khong loi thoat (data mismatch) | handleCanvasClickAnswer: data mismatch (nodes rong / khong co targetNodeId) -> nop tu dong (sai) mo nut "Tiep tuc"; click trong > 5 lan (MAX_CANVAS_BLANK_CLICKS) -> bo qua an toan; reset counter o trigger/load/reset | FIXED 2026-08-10 (phan store; nut "Bo qua" overlay ngoai quyen - TODO agent component) |
| 441 | QZ-030 (P2): Cast res.json() khong validate runtime | Type guards: isQuizSummary/isQuizDetail/isAttemptResult/topics array; shape sai -> Error ro rang -> backendQuizError; TODO component: an fallback khi backendQuizError != null | FIXED 2026-08-10 (API layer; TODO component) |
| 442 | QZ-031 (P2): Lesson flow khong error surface | submitQuizAttempt throw loi ro (HTTP/network/thieu token) -> syncSessionToServer catch -> xpSyncError + console.error | FIXED 2026-08-10 |
| 443 | QZ-032 (P2): Fallback localStorage.getItem('token') vo dung | getAuthToken chi dung useAuthStore().getAccessToken(); pinia chua active -> null | FIXED 2026-08-10 |
| 444 | QZ-033 (P2): Khong luu tien trinh quiz; backend quiz khong ghi QuizStatsManager | sessionStorage 'dsa_backend_quiz_progress_v1' luu {quizId,index,answers} tren select/next/prev/start; restore 1 lan/page-load trong loadQuizCatalog (flag module - test-isolation an toan); submit thanh cong -> saveAttempt theo questionResults + xoa progress; exit -> xoa | FIXED 2026-08-10 |
| 445 | QZ-034 (P2): exitBackendQuiz khong reset loading | Reset ca isBackendQuizLoading + isBackendQuizSubmitting + backendQuizError + xoa progress | FIXED 2026-08-10 |
| 446 | QZ-035 (P2): fetchQuizHistory sai URL + dead | URL dung /api/v1/concepts/quiz/history (khop StatelessQuizController.GetHistory); type QuizHistoryEntry[]; van chua caller - TODO khi dung trang lich su | FIXED 2026-08-10 |
| 447 | QZ-036 (P2): Timeout submit 5000ms qua ngan | SUBMIT_TIMEOUT_MS = 15000 | FIXED 2026-08-10 |
| 448 | QZ-005 (frontend part): lesson awardXp vs syncSessionToServer trung XP | Ra soat: useLessonStore.submitQuiz -> awardXp (lessonApi) va quiz-system sync -> /concepts/quiz/submit la 2 duong XP tach biet cho 2 loai quiz khac nhau, khong goi trung o frontend; backend da dong ledger QuizXpGrant (QZ-001/002, ADR-39) | RÀ SOÁT XONG 2026-08-10 (khong co double-call frontend) |

## BugFix Campaign 2026-08-10 — Tổng kết chiến dịch fix 4 feature (16 sub agent)

- **Kết quả cuối:** frontend 2712/2712 test PASS, backend 372/372 PASS (build 0 lỗi).
- **Còn mở:** QZ-048 (bank quiz không ghi QuizAttempt — cần materialize bank hoặc thêm cột QuizKey, đã DEFERRED trong DATN_ERRORS.md); CC-011 (type drift pre-existing ở dsa-modules renderers/tests: FrameDTO.dataState optional nhưng renderers chưa guard — ue-tsc còn ~143 lỗi; nằm ngoài scope 4 feature, cần batch riêng).
- **Contract mới cần lưu ý:** GET /api/v1/concepts/quiz/{id} mặc định KHÔNG trả correctIndex/explanation (anti-cheat QZ-003) — lesson/teacher/admin phải gửi ?withAnswers=true (đã cập nhật useLessonStore.ts, TeacherQuizTab.vue, AdminQuizzesTab.vue).

## Review Round 2 — 2026-08-10 (6 lỗi mới từ review tổng hợp)

| ID | Mức | Fix |
| :--- | :--- | :--- |
| IP-042 | High | toAdjacencyList nhận graphType — directed chỉ 1 chiều + test 2 mode (GraphParser.ts, InteractivePlayground.vue:378) |
| IP-043 | Medium | PlaygroundCanvas watch zoomLevel -> store.setZoomLevel action |
| IP-044 | Low | Xóa TODO stale addEdge graphType |
| EC-048 | Low | Inline SVG chevron -> BaseIcon arrow-down |
| EC-049 | Low | Alias code/sourceCode đảo vai trò + DEFAULT_INPUT_RAW/ARRAY vao vcrDefaults |
| QZ-053 | Test | mountQuiz() stub BaseIcon (quizP2Tests 20+ mount + quizP0Tests 2 mount) — het warning quiz-system |
| CC-012 | Open | Warning BaseIcon pre-existing o dsa-modules/export-share/dashboard (ngoai scope) |

- **Kết quả:** frontend 2713/2713 PASS (them 1 test directed IP-042).

## Deep Review Round 3 — 2026-08-10 (9 lỗi mới, 839 tests xanh)

| ID | Mức | Fix |
| :--- | :--- | :--- |
| QZ-006 (bổ sung) | High | VisualizationPlayer truyen quizId vao loadCheckpoints (2 cho) + 2 test sync XP |
| IP-045 | High | return sau toast loi import — khong ghi de bang toast success |
| IP-046 | Medium | Cache getComputedStyle module-level (playgroundCanvasDraw) |
| IP-047 | Medium | Goi store.resetZoom() truc tiep, xoa cast/dead code |
| IP-048/049 | Medium | Toast vao usePlaygroundStore (single source) + GraphView import feedback |
| EC-050 | Medium | Comment hop dong customCompileFn (host tu reset index) |
| QZ-054 | Medium | Clamp answers vao 0..options.length-1 khi restore sessionStorage |
| QZ-055 | Low | Action setBackendQuizError — component khong gan state truc tiep |
| QZ-056 | Low | selectBackendAnswer dung reassignment thay splice |

- **Kết quả:** frontend 2715/2715 PASS (2713 + 2 test QZ-006).
