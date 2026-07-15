# 🧪 Danh Sách Tính Năng Đã Kiểm Thử - Features Verified & Test Suite Status

Tài liệu này ghi nhận trạng thái kiểm thử đơn vị tự động (Unit Test Suite) của toàn bộ 23 tính năng hạt nhân thuộc Phase 1 và Phase 2 của dự án **VisualizationDSA**.

---

## 📌 Trạng Thái Bao Phủ Kiểm Thử (Test Coverage Status)
*   **Tổng số tính năng hạt nhân:** 23/23 Tính năng + Phase 1 Animation Engine (23 tests) + Phase 1 Custom Input (38 tests) + Phase 1 DSA Modules (40 tests mới) + Phase 1 E-Lecture Mode (28 tests mới) + Phase 1 Execution Control (23 tests mới) + Phase 1 Interactive Playground (31 tests mới) + Phase 1 Pseudocode Sync (37 tests mới) + Phase 1 Quiz System (54 tests mới) + Phase 2 Code-to-Visualization (32 tests mới) + Phase 2 Compare Algorithms (33 tests mới) + Phase 2 Concurrency Visualizer (35 tests mới) + Phase 2 Debug Mode (49 tests mới) + Phase 2 Design Patterns (50 tests mới) + Phase 2 Embed Widget (76 tests mới) + Phase 2 Export & Share (85 tests mới) + Phase 2 Gamification Engine (88 tests mới) + Phase 2 Learning Path (98 tests mới) + Phase 2 Multi-View Sync (102 tests mới) + Phase 2 OOP Visualization (59 tests) + Phase 2 Smart Quiz (90 tests mới) + Phase 2 SOLID Visualization (105 tests mới) + Phase 2 State Inspector (90 tests mới) + Phase 2 System Design Viz (64 tests mới) + Guided Tour (8 tests mới).
*   **Trạng thái Vitest Suite (Frontend):** 🟢 100% PASSED (1549/1549 - all tests pass).
*   **Trạng thái xUnit Suite (Backend C#):** 🟢 100% PASSED (212/212 — 88 Domain + 46 Application + 78 Infrastructure).
*   **Công cụ chạy kiểm thử:** Vitest Core (Frontend), xUnit 2.6.6 + FluentAssertions 6.12.0 + Moq 4.20.70 (Backend).
*   **Thời gian phản hồi test suite:** Frontend ~180ms, Backend ~10s.

---

## 📋 Danh Sách 23 Tính Năng Đã Kiểm Thử Hoàn Hảo (Verified Features Log)

| STT | Phân hệ kiểm thử | Tính năng hạt nhân được xác thực | Phương thức kiểm tra (Test Spec) | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| 1 | **Core Engine** | Nội suy tuyến tính Lerp Point | Khớp tọa độ 50% đạt giá trị trung vị chính xác. | 🟢 PASSED |
| 2 | **Core Engine** | Biên dịch mã nguồn giả AST | Dòng lệnh so sánh/hoán vị phân tích đúng dòng code. | 🟢 PASSED |
| 3 | **Array Swap** | Nội suy parabol uốn cong X-Y | Trục Y nhô cong parabol tránh va chạm đè cột bar. | 🟢 PASSED |
| 4 | **Array Swap** | Sinh khung hình Bubble Sort | Đầu vào mảng xáo trộn ra mảng xếp tăng dần đúng dòng. | 🟢 PASSED |
| 5 | **Monaco Sync** | Đồng bộ hai chiều bước - dòng | Ánh xạ xuôi bước giải thuật ra dòng lệnh và ngược lại. | 🟢 PASSED |
| 6 | **Lecture Mode** | Đổi Slide tự động đồng bộ VCR | Slide ID chuyển tiếp phát đúng sự kiện nhảy bước. | 🟢 PASSED |
| 7 | **Quiz Scoring** | Tính điểm trắc nghiệm 80% | Đáp án đúng đạt điểm đạt qua môn, sai dưới 80% trượt. | 🟢 PASSED |
| 8 | **Static Linting**| Linter kiểm duyệt từ khóa AST | Quét chuỗi code SV chứa đủ từ khóa temp, bubblesort. | 🟢 PASSED |
| 9 | **Custom Input** | Parser mảng tùy biến tự nhập | Nhận chuỗi phân tách dấu phẩy, ném lỗi khi có chữ. | 🟢 PASSED |
| 10 | **Custom Input** | Parser ma trận kề đồ thị | Biên dịch đúng chuỗi định dạng "A-B:10" thành Graph. | 🟢 PASSED |
| 11 | **Playground** | Click vẽ nút đồ thị va chạm | Khoảng cách đúp chuột < 50px bị chặn trùng node. | 🟢 PASSED |
| 12 | **OOP Sandbox** | Cản phá vi phạm Đóng gói | Chặn truy cập biến PRIVATE từ lớp ngoài, public OK. | 🟢 PASSED |
| 13 | **OOP Sandbox** | Định tuyến đa hình động VTable | Liên kết động gọi chính xác phương thức lớp con override. | 🟢 PASSED |
| 14 | **SOLID Math**  | Cohesion LCOM4 BFS Đồ thị | Đếm đúng số đồ thị rời rạc. Cohesive = 1, Violate = 2. | 🟢 PASSED |
| 15 | **SOLID Math**  | Hợp ước thay thế Liskov LSP | Phát hiện lớp con phá vỡ contract hoạt động lớp cha. | 🟢 PASSED |
| 16 | **IoC Container**| Phân giải Transient Service | Mỗi lần resolve sinh ra 1 thực thể đối tượng mới. | 🟢 PASSED |
| 17 | **IoC Container**| Phân giải Singleton Service | Chia sẻ duy nhất 1 thực thể duy nhất trong bộ nhớ RAM. | 🟢 PASSED |
| 18 | **IoC Container**| Phát hiện Dependency Loop DFS | Ném lỗi Cyclic Dependency Detected khi đăng ký chéo. | 🟢 PASSED |
| 19 | **Design Pattern**| Truyền tin Observer Simulator | Subject update gửi tin báo động uốn nối Observers. | 🟢 PASSED |
| 20 | **State Inspector**| Tính toán Bezier Stack-to-Heap | Sinh chuỗi d của SVG Path đúng độ uốn lượn parabolic. | 🟢 PASSED |
| 21 | **DSL Compiler** | Phân tích cú pháp lệnh DSL | Biên dịch chính xác ALLOC, PUSH, LINK hoặc ném lỗi. | 🟢 PASSED |
| 22 | **System Design** | Định tuyến Round-Robin LB | HTTP request được xoay tua đều đặn SRV_A và SRV_B. | 🟢 PASSED |
| 23 | **System Design** | DB Replication Lag delay | Tính toán độ trễ đồng bộ tỷ lệ thuận dung lượng data. | 🟢 PASSED |
| 24 | **System Design** | Khói sập nguồn Canvas GC | Lọc sạch các hạt chết hoặc tan biến sau khi cập nhật. | 🟢 PASSED |
| 25 | **Embed Widget** | Tạo mã nhúng Iframe HTML | Xây dựng URL an toàn kèm query params mã hóa sandbox. | 🟢 PASSED |
| 26 | **Gamification** | Tích lũy XP thăng cấp Level | Cộng XP vượt ngưỡng 1000 thăng cấp, tặng huy hiệu Neon. | 🟢 PASSED |
| 27 | **Animation Store** | FSM UNINITIALIZED → LOADED | loadResult chuyển trạng thái, gán currentIndex=0, frames > 0. | 🟢 PASSED |
| 28 | **Animation Store** | stepForward/stepBackward | Tăng/giảm currentIndex, kẹp biên [0, totalSteps-1]. | 🟢 PASSED |
| 29 | **Animation Store** | scrubTo out-of-bounds guard | Từ chối index âm hoặc vượt kích thước mảng frames. | 🟢 PASSED |
| 30 | **Animation Store** | play/pause cascade setTimeout | Tick tự động tăng currentIndex, pause dừng hẳn timer. | 🟢 PASSED |
| 31 | **Animation Store** | isFinished + FINISHED state | Chạm bước cuối → isFinished=true, play bị chặn. | 🟢 PASSED |
| 32 | **Animation Store** | progressPercent computation | 0% ở step đầu, 100% ở step cuối. | 🟢 PASSED |
| 33 | **Dummy Engine** | BubbleSort algorithmId/pseudoCode | Trả đúng 'bubble-sort' và 4 dòng pseudoCode. | 🟢 PASSED |
| 34 | **Dummy Engine** | First frame = unsorted array | stepId=1, dataState khớp input, highlights rỗng. | 🟢 PASSED |
| 35 | **Dummy Engine** | Last frame = sorted array | dataState sắp xếp tăng dần, sorted indices = N. | 🟢 PASSED |
| 36 | **Dummy Engine** | Sequential stepIds | Tất cả frames có stepId liên tục từ 1 đến N. | 🟢 PASSED |
| 37 | **Dummy Engine** | Single-element array | Trả ít nhất 1 frame, dataState giữ nguyên. | 🟢 PASSED |
| 38 | **Dummy Engine** | Compare highlights validation | Compare frames luôn chứa đúng 2 index liền kề. | 🟢 PASSED |
| 39 | **Input Store** | Initial state defaults | rawText='', maxLimit=50, isLoading=false. | 🟢 PASSED |
| 40 | **Input Store** | parsedArray Regex parsing | Phân tách chuỗi thô thành int[], từ chối ký tự lạ. | 🟢 PASSED |
| 41 | **Input Store** | Negative/single number parsing | Hỗ trợ -5, +3, số đơn lẻ '42'. | 🟢 PASSED |
| 42 | **Input Store** | isValidFormat Regex check | true cho '12, 5, 8', false cho '12, a', '5,,3', '12.5'. | 🟢 PASSED |
| 43 | **Input Store** | isWithinLimit guard | true khi N <= maxLimit, false khi vượt. | 🟢 PASSED |
| 44 | **Input Store** | canExecute composite gate | false khi rỗng/sai format/vượt limit/loading, true khi hợp lệ. | 🟢 PASSED |
| 45 | **Input Store** | setLimit action | Cập nhật maxLimit thành giá trị mới. | 🟢 PASSED |
| 46 | **Input Store** | generateRandomInput random | Sinh mảng ngẫu nhiên [10,99], đếm đúng size. | 🟢 PASSED |
| 47 | **Input Store** | generateRandomInput nearly-sorted | Mảng gần sắp xếp, tối đa 2 cặp đảo. | 🟢 PASSED |
| 48 | **Input Store** | generateRandomInput reversed | Mảng giảm dần hoàn toàn. | 🟢 PASSED |
| 49 | **Input Store** | generateRandomInput clamp | Kẹp size không vượt maxLimit. | 🟢 PASSED |
| 50 | **Input Store** | clear action | Reset rawText, apiErrorMessage, isLoading. | 🟢 PASSED |
| 51 | **Input Store** | submitCustomInput guard | Không gọi API khi canExecute=false. | 🟢 PASSED |
| 52 | **Input Store** | submitCustomInput fallback | Fallback sang dummy engine khi API unreachable. | 🟢 PASSED |
| 53 | **Algorithm Store** | Initial state empty | algorithms=[], currentAlgorithm=null, metadata=null. | 🟢 PASSED |
| 54 | **Algorithm Store** | fetchAlgorithms API fallback | Fallback sang local catalog khi API fails. | 🟢 PASSED |
| 55 | **Algorithm Store** | fetchAlgorithms API success | Load algorithms từ API response. | 🟢 PASSED |
| 56 | **Algorithm Store** | selectAlgorithm + metadata | Gán currentAlgorithm, load local metadata. | 🟢 PASSED |
| 57 | **Algorithm Store** | clearActive reset | Reset currentAlgorithm + metadata về null. | 🟢 PASSED |
| 58 | **Algorithm Store** | filteredAlgorithms search | Filter theo tên/category, clear trả về tất cả. | 🟢 PASSED |
| 59 | **Algorithm Store** | filteredAlgorithms category | Filter 'searching' trả 3 algos đúng category. | 🟢 PASSED |
| 60 | **Algorithm Store** | categories unique | 3 categories: Searching, Stack-Queue, Tree. | 🟢 PASSED |
| 61 | **Algorithm Store** | loadAlgorithmDetails fallback | Set currentAlgorithm + metadata từ local. | 🟢 PASSED |
| 62 | **Algorithm Store** | 10 algorithms metadata | Tất cả 10 algos có metadata + pseudoCode. | 🟢 PASSED |
| 63 | **Dummy Generators** | BFS traversal | Duyệt theo chiều rộng, dataState khớp kết quả BFS. | 🟢 PASSED |
| 64 | **Dummy Generators** | DFS traversal | Duyệt theo chiều sâu, dataState khớp kết quả DFS. | 🟢 PASSED |
| 65 | **Dummy Generators** | Dijkstra shortest path | Tính toán khoảng cách ngắn nhất, cập nhật nút trong BST. | 🟢 PASSED |
| 66 | **Dummy Generators** | Sliding Window correct | Tìm tổng mảng con max độ dài K=3, gán low/high. | 🟢 PASSED |
| 67 | **Dummy Generators** | Monotonic Stack correct | Next Greater Element giải chính xác, dataState có stack. | 🟢 PASSED |
| 68 | **Dummy Generators** | LinearSearch found | highlights.found != null khi target tồn tại. | 🟢 PASSED |
| 69 | **Dummy Generators** | LinearSearch not found | Không có found highlight khi target vắng mặt. | 🟢 PASSED |
| 70 | **Dummy Generators** | BinarySearch found | highlights.found != null, sorted array. | 🟢 PASSED |
| 71 | **Dummy Generators** | BinarySearch pointers | highlights.mid != null (Low/Mid/High). | 🟢 PASSED |
| 72 | **Dummy Generators** | Stack push/pop | 3 Push frames, final dataState rỗng. | 🟢 PASSED |
| 73 | **Dummy Generators** | Stack empty final | Last frame dataState = []. | 🟢 PASSED |
| 74 | **Dummy Generators** | Queue enqueue/dequeue | 3 Enqueue frames, final dataState rỗng. | 🟢 PASSED |
| 75 | **Dummy Generators** | Queue empty final | Last frame dataState = []. | 🟢 PASSED |
| 76 | **Dummy Generators** | BST tree nodes | treeNodes defined, length = 3. | 🟢 PASSED |
| 77 | **Dummy Generators** | BST parent-child | Root leftNodeId/rightNodeId not null. | 🟢 PASSED |
| 78 | **Dummy Generators** | Unknown fallback | Returns single frame fallback. | 🟢 PASSED |
| 79 | **Algorithm Catalog** | 10 algorithms count | Exactly 10 algorithms. | 🟢 PASSED |
| 80 | **Algorithm Catalog** | Required fields | All fields (id, name, category, etc.) populated. | 🟢 PASSED |
| 81 | **Algorithm Catalog** | Unique IDs | No duplicate algorithm IDs. | 🟢 PASSED |
| 82 | **Algorithm Catalog** | 3 categories | Searching, Stack-Queue, Tree. | 🟢 PASSED |
| 83 | **Algorithm Catalog** | 3 searching algos | 3 searching algorithms. | 🟢 PASSED |
| 84 | **Algorithm Catalog** | 3 stack-queue algos | 3 stack-queue algorithms. | 🟢 PASSED |
| 85 | **Algorithm Catalog** | 4 tree algos | 4 tree algorithms, bao gồm bst, bfs, dfs, dijkstra. | 🟢 PASSED |
| 90 | **DSA API** | Fallback on network error | Returns dummy result. | 🟢 PASSED |
| 91 | **DSA API** | API success | Returns API response. | 🟢 PASSED |
| 92 | **DSA API** | HTTP error fallback | Returns dummy on 500 status. | 🟢 PASSED |

### Phase 1 E-Lecture Mode — 28 Unit Tests

| STT | Phân hệ kiểm thử | Tính năng hạt nhân được xác thực | Phương thức kiểm tra (Test Spec) | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| 93 | **useLectureStore** | Starts in inactive state | isActive=false, activeSlide=null, isWaitingForAnimation=false | 🟢 PASSED |
| 94 | **useLectureStore** | startLecture activates + first slide | isActive=true, slideId=1, interactionLocked=true | 🟢 PASSED |
| 95 | **useLectureStore** | slideProgress format | Returns "1 / 3" correct format | 🟢 PASSED |
| 96 | **useLectureStore** | isFirstSlide / isLastSlide | Correct boundary detection | 🟢 PASSED |
| 97 | **useLectureStore** | nextSlide advances slide | Index increments, PLAY_UNTIL with fake timers | 🟢 PASSED |
| 98 | **useLectureStore** | prevSlide goes back | Index decrements after nextSlide | 🟢 PASSED |
| 99 | **useLectureStore** | prevSlide does nothing on first | currentSlideIndex remains 0 | 🟢 PASSED |
| 100 | **useLectureStore** | nextSlide does nothing on last | Stays at last index, isLastSlide=true | 🟢 PASSED |
| 101 | **useLectureStore** | exitLecture resets all state | isActive=false, lecture=null, interactionLocked=false | 🟢 PASSED |
| 102 | **useLectureStore** | totalSlides count | Returns 3 for 3-slide lecture | 🟢 PASSED |
| 103 | **useLectureStore** | RESET_CANVAS calls goToFrame | animStore.currentIndex = 0 | 🟢 PASSED |
| 104 | **useLectureStore** | goToSlide navigates | Jumps to specific slide index | 🟢 PASSED |
| 105 | **useLectureStore** | goToSlide rejects OOB | Ignores -1 and 100 | 🟢 PASSED |
| 106 | **lectureLoader** | hasLecture bubble-sort | Returns true | 🟢 PASSED |
| 107 | **lectureLoader** | hasLecture unknown | Returns false | 🟢 PASSED |
| 108 | **lectureLoader** | getAvailableLectureIds | Contains 'bubble-sort' | 🟢 PASSED |
| 109 | **lectureLoader** | loadLecture bundled | Returns full LectureScript | 🟢 PASSED |
| 110 | **lectureLoader** | loadLecture fetch fail | Returns null | 🟢 PASSED |
| 111 | **lectureLoader** | loadLecture 404 | Returns null | 🟢 PASSED |
| 112 | **lectureLoader** | Correct slide types | theory + guided-animation + interactive-check | 🟢 PASSED |
| 113 | **lectureLoader** | Valid actions | All commands in RESET_CANVAS/PLAY_UNTIL/PAUSE | 🟢 PASSED |
| 114 | **AnimStore Ext** | goToFrame moves to index | currentIndex=5, isPlaying=false | 🟢 PASSED |
| 115 | **AnimStore Ext** | goToFrame rejects OOB | Stays at 0 for -1 and 999 | 🟢 PASSED |
| 116 | **AnimStore Ext** | setInteractionLocked toggle | true→true, false→false | 🟢 PASSED |
| 117 | **AnimStore Ext** | playUntilFrame resolves | Stops at target frame 3 | 🟢 PASSED |
| 118 | **AnimStore Ext** | playUntilFrame already past | Snaps to target | 🟢 PASSED |
| 119 | **AnimStore Ext** | playUntilFrame empty frames | Resolves immediately | 🟢 PASSED |
| 120 | **AnimStore Ext** | cancelPlayUntil snaps | Stops + snaps to target 7 | 🟢 PASSED |

### Phase 1 Execution Control — 23 Unit Tests

| STT | Phân hệ kiểm thử | Tính năng hạt nhân được xác thực | Phương thức kiểm tra (Test Spec) | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| 121 | **Speed Presets** | Plan-specified values | SPEED_PRESETS = [0.25, 0.5, 1.0, 2.0, 4.0] | 🟢 PASSED |
| 122 | **Speed Preferences** | Default speed 1.0 | No saved preference returns 1.0 | 🟢 PASSED |
| 123 | **Speed Preferences** | Save to localStorage | Writes dsa_preferences JSON with defaultSpeed | 🟢 PASSED |
| 124 | **Speed Preferences** | Load saved speed | Reads previously saved 4.0x speed | 🟢 PASSED |
| 125 | **Speed Preferences** | Corrupted localStorage fallback | Returns 1.0 on invalid JSON | 🟢 PASSED |
| 126 | **Speed Preferences** | Invalid speed value fallback | Returns 1.0 on negative speed | 🟢 PASSED |
| 127 | **Throttled Scrub** | Scrubs to target frame | goToFrame(3) after startScrub | 🟢 PASSED |
| 128 | **Throttled Scrub** | Pauses on scrub start | isPlaying=false after startScrub | 🟢 PASSED |
| 129 | **Throttled Scrub** | isScrubbing flag toggle | true after start, false after end | 🟢 PASSED |
| 130 | **Replay Logic** | goToFrame(0) + play from FINISHED | currentIndex=0, isPlaying=true | 🟢 PASSED |
| 131 | **Replay Logic** | FINISHED state detection | playbackState='FINISHED' at last frame | 🟢 PASSED |
| 132 | **Replay Logic** | togglePlay action | play/pause toggle in store | 🟢 PASSED |
| 133 | **Hotkeys** | createHotkeyHandler type | Returns function | 🟢 PASSED |
| 134 | **Hotkeys** | Space play/pause | Toggles isPlaying via Space key | 🟢 PASSED |
| 135 | **Hotkeys** | ArrowRight stepForward | Increments currentIndex by 1 | 🟢 PASSED |
| 136 | **Hotkeys** | ArrowLeft stepBackward | Decrements currentIndex by 1 | 🟢 PASSED |
| 137 | **Hotkeys** | Shift+ArrowLeft rewind | Goes to frame 0 | 🟢 PASSED |
| 138 | **Hotkeys** | Shift+ArrowRight fast-forward | Goes to last frame | 🟢 PASSED |
| 139 | **Hotkeys** | interactionLocked guard | Ignores Space when locked | 🟢 PASSED |
| 140 | **Hotkeys** | UNINITIALIZED guard | Ignores Space when no data | 🟢 PASSED |
| 141 | **Hotkeys** | Space replay from FINISHED | goToFrame(0) + play from end | 🟢 PASSED |
| 142 | **Tooltip** | truncateText long string | Truncates at maxLength + '...' | 🟢 PASSED |
| 143 | **Tooltip** | truncateText empty string | Returns empty string | 🟢 PASSED |

### Phase 1 Interactive Playground — 31 Unit Tests

| STT | Phân hệ kiểm thử | Tính năng hạt nhân được xác thực | Phương thức kiểm tra (Test Spec) | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| 144 | **PlaygroundStore** | Initial SELECT mode + empty | mode='SELECT', nodes=[], edges=[] | 🟢 PASSED |
| 145 | **PlaygroundStore** | addNode auto-label A,B,C | 3 nodes, labels A/B/C, radius 20 | 🟢 PASSED |
| 146 | **PlaygroundStore** | Max 30 nodes limit | 31st addNode returns null | 🟢 PASSED |
| 147 | **PlaygroundStore** | addEdge between nodes | Creates edge with weight=1 | 🟢 PASSED |
| 148 | **PlaygroundStore** | Self-loop prevention | addEdge(a, a) returns null | 🟢 PASSED |
| 149 | **PlaygroundStore** | Duplicate edge prevention | Second addEdge + reverse both null | 🟢 PASSED |
| 150 | **PlaygroundStore** | updateEdgeWeight valid range | Accepts 42, rejects 0 and 1000 | 🟢 PASSED |
| 151 | **PlaygroundStore** | Cascade delete edges | Removing node A removes A-B, A-C edges | 🟢 PASSED |
| 152 | **PlaygroundStore** | clearAll reset | Empties nodes, edges, selection | 🟢 PASSED |
| 153 | **PlaygroundStore** | setMode clears selection | Switching mode resets selectedNodeId | 🟢 PASSED |
| 154 | **PlaygroundStore** | moveNode position | Updates x/y coordinates | 🟢 PASSED |
| 155 | **GeometryEngine** | hitTestNode inside circle | Returns node when click inside | 🟢 PASSED |
| 156 | **GeometryEngine** | hitTestNode miss | Returns null when far away | 🟢 PASSED |
| 157 | **GeometryEngine** | hitTestNode boundary | Returns node at exact radius | 🟢 PASSED |
| 158 | **GeometryEngine** | ArrowPlacement border contact | Start/end at circle borders, not centers | 🟢 PASSED |
| 159 | **GeometryEngine** | hitTestEdge within threshold | Detects edge at 3px distance | 🟢 PASSED |
| 160 | **GeometryEngine** | hitTestEdge miss | Returns null at 100px distance | 🟢 PASSED |
| 161 | **GeometryEngine** | Snap distance detection | true within 40px, false beyond | 🟢 PASSED |
| 162 | **GeometryEngine** | Edge midpoint | Correct (200,100) for (100,100)-(300,100) | 🟢 PASSED |
| 163 | **ForceDirected** | Repulsion separates overlapping | dist > 10 after 50 ticks | 🟢 PASSED |
| 164 | **ForceDirected** | Spring pulls far nodes | finalDist < initialDist after 100 ticks | 🟢 PASSED |
| 165 | **ForceDirected** | Dragged node skipped | Position unchanged during drag | 🟢 PASSED |
| 166 | **ForceDirected** | Stability detection | isStable=true after 300 ticks | 🟢 PASSED |
| 167 | **GraphParser** | Adjacency list undirected | Both A→B and B→A with weight 8 | 🟢 PASSED |
| 168 | **GraphParser** | findIsolatedNodes disconnected | Node D isolated from A-B-C | 🟢 PASSED |
| 169 | **GraphParser** | findIsolatedNodes connected | Empty array for connected graph | 🟢 PASSED |
| 170 | **GraphParser** | Export + reimport roundtrip | 3 nodes, 2 edges preserved | 🟢 PASSED |
| 171 | **GraphParser** | Invalid JSON import | Returns null for bad input | 🟢 PASSED |
| 172 | **GraphParser** | Empty graph payload | Empty nodes/adjacencyList | 🟢 PASSED |
| 173 | **GraphParser** | Single node connectivity | Not isolated (own component) | 🟢 PASSED |
| 174 | **GeometryEngine** | pointToSegmentDistance | 10px perpendicular distance correct | 🟢 PASSED |
| 174.1 | **Simulator** | BFS simulation | Sinh đúng queue và vết đỉnh đã duyệt | 🟢 PASSED |
| 174.2 | **Simulator** | DFS simulation | Sinh đúng stack và vết đỉnh đã duyệt | 🟢 PASSED |
| 174.3 | **Simulator** | Dijkstra simulation | Tính toán và cập nhật chính xác khoảng cách Dijkstra | 🟢 PASSED |

### Phase 1 Pseudocode Sync — 37 Unit Tests

| STT | Phân hệ kiểm thử | Tính năng hạt nhân được xác thực | Phương thức kiểm tra (Test Spec) | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| 175 | **SyncEngine** | getPhysicalLineNumber C++ | SWAP_STEP → line 5 in C++ | 🟢 PASSED |
| 176 | **SyncEngine** | getPhysicalLineNumber Python | SWAP_STEP → line 6 in Python | 🟢 PASSED |
| 177 | **SyncEngine** | getPhysicalLineNumber Java | COMPARE_STEP → line 4 in Java | 🟢 PASSED |
| 178 | **SyncEngine** | Unknown language returns null | rust → null | 🟢 PASSED |
| 179 | **SyncEngine** | Unknown logicalId returns null | UNKNOWN_STEP → null | 🟢 PASSED |
| 180 | **SyncEngine** | FUNC_DECL cross-language consistency | Line 1 in all 3 languages | 🟢 PASSED |
| 181 | **SyncEngine** | findFirstFrameIndex SWAP_STEP | Returns index 3 | 🟢 PASSED |
| 182 | **SyncEngine** | findFirstFrameIndex COMPARE_STEP | Returns index 2 | 🟢 PASSED |
| 183 | **SyncEngine** | findFirstFrameIndex non-existent | Returns -1 | 🟢 PASSED |
| 184 | **SyncEngine** | findFirstFrameIndex FUNC_DECL | Returns index 0 | 🟢 PASSED |
| 185 | **SyncEngine** | findAllFrameIndices COMPARE_STEP | Returns [2, 4, 7] | 🟢 PASSED |
| 186 | **SyncEngine** | findAllFrameIndices SWAP_STEP | Returns [3, 5] | 🟢 PASSED |
| 187 | **SyncEngine** | findAllFrameIndices non-existent | Returns [] | 🟢 PASSED |
| 188 | **SyncEngine** | transformVariablesForWatch basic | {i:0, j:1, n:5} → 3 VariableState | 🟢 PASSED |
| 189 | **SyncEngine** | transformVariablesForWatch float | 3.14159 → 3.14 rounded | 🟢 PASSED |
| 190 | **SyncEngine** | transformVariablesForWatch empty | {} → [] | 🟢 PASSED |
| 191 | **SyncEngine** | transformVariablesForWatch string | {status:'sorting'} preserved | 🟢 PASSED |
| 192 | **SyncEngine** | transformVariablesForWatch integer | {count:42} unchanged | 🟢 PASSED |
| 193 | **SyncEngine** | getOccurrenceCount COMPARE_STEP | Returns 3 | 🟢 PASSED |
| 194 | **SyncEngine** | getOccurrenceCount SWAP_STEP | Returns 2 | 🟢 PASSED |
| 195 | **SyncEngine** | getOccurrenceCount non-existent | Returns 0 | 🟢 PASSED |
| 196 | **SyncEngine** | getNextCycleFrameIndex forward | After frame 2 → frame 4 | 🟢 PASSED |
| 197 | **SyncEngine** | getNextCycleFrameIndex wrap | After frame 7 → frame 2 (wrap) | 🟢 PASSED |
| 198 | **SyncEngine** | getNextCycleFrameIndex first | Before any → frame 3 | 🟢 PASSED |
| 199 | **SyncEngine** | getNextCycleFrameIndex non-existent | Returns -1 | 🟢 PASSED |
| 200 | **SyncEngine** | findCodeLineByLogicalId found | SWAP_STEP → {lineNumber:2, text:'swap'} | 🟢 PASSED |
| 201 | **SyncEngine** | findCodeLineByLogicalId not found | UNKNOWN → null | 🟢 PASSED |
| 202 | **PseudocodeStore** | Initial default state | selectedLanguage='cpp', codeLanguages=[] | 🟢 PASSED |
| 203 | **PseudocodeStore** | loadPseudocodeScript | 2 languages loaded, isScriptLoaded=true | 🟢 PASSED |
| 204 | **PseudocodeStore** | activeCodeLines for language | Returns C++ lines, first logicalId='FUNC_DECL' | 🟢 PASSED |
| 205 | **PseudocodeStore** | changeLanguage + update lines | Python lines with 'def bubble_sort' text | 🟢 PASSED |
| 206 | **PseudocodeStore** | cycleLanguage round-robin | cpp → python → cpp | 🟢 PASSED |
| 207 | **PseudocodeStore** | availableLanguages | ['cpp', 'python'] | 🟢 PASSED |
| 208 | **PseudocodeStore** | activePhysicalLineNumber from frame | COMPARE_STEP → line 3 | 🟢 PASSED |
| 209 | **PseudocodeStore** | activePhysicalLineNumber language switch | SWAP_STEP → 4 (cpp), 4 (python) | 🟢 PASSED |
| 210 | **PseudocodeStore** | null activePhysicalLineNumber no frames | Returns null | 🟢 PASSED |
| 211 | **PseudocodeStore** | watchVariablesList from frame | {i:2, j:3, n:5} → 3 items | 🟢 PASSED |
| 212 | **PseudocodeStore** | empty watchVariablesList no frames | Returns [] | 🟢 PASSED |
| 213 | **PseudocodeStore** | snapToLogicalLine jumps frame | SWAP_STEP → currentIndex=2 | 🟢 PASSED |
| 214 | **PseudocodeStore** | getOccurrenceInfo counts | COMPARE_STEP total=2 | 🟢 PASSED |
| 215 | **PseudocodeStore** | resetStore clears state | cpp, [], isScriptLoaded=false | 🟢 PASSED |
| 216 | **PseudocodeStore** | fallback language if missing | javascript → cpp (first available) | 🟢 PASSED |
| 217 | **ScriptLoader** | loads bubble-sort | algorithmId='bubble-sort' | 🟢 PASSED |
| 218 | **ScriptLoader** | 4 languages for bubble-sort | cpp, java, python, javascript | 🟢 PASSED |
| 219 | **ScriptLoader** | lines have logicalId | All lines have lineNumber, text, logicalId | 🟢 PASSED |
| 220 | **ScriptLoader** | cross-language logicalId consistency | Same executable logicalIds across 4 languages | 🟢 PASSED |
| 221 | **ScriptLoader** | unknown algorithm returns null | null for 'unknown-algo' | 🟢 PASSED |
| 222 | **ScriptLoader** | hasPseudocodeScript true | true for 'bubble-sort' | 🟢 PASSED |
| 223 | **ScriptLoader** | hasPseudocodeScript false | false for 'unknown' | 🟢 PASSED |

### Phase 1 Quiz System — 54 Unit Tests

| STT | Phân hệ kiểm thử | Tính năng hạt nhân được xác thực | Phương thức kiểm tra (Test Spec) | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| 224 | **VerificationEngine** | MC correct answer | selectedIndex=1, correctOptionIndex=1 → true | 🟢 PASSED |
| 225 | **VerificationEngine** | MC incorrect answer | selectedIndex=0, correctOptionIndex=1 → false | 🟢 PASSED |
| 226 | **VerificationEngine** | TF correct answer | selectedIndex=0 (Đúng), correctOptionIndex=0 → true | 🟢 PASSED |
| 227 | **VerificationEngine** | TF incorrect answer | selectedIndex=1, correctOptionIndex=0 → false | 🟢 PASSED |
| 228 | **VerificationEngine** | Out-of-range index | selectedIndex=99 → false | 🟢 PASSED |
| 229 | **VerificationEngine** | Canvas correct node click | (202,198) hits node_C (200,200,r=20) → true | 🟢 PASSED |
| 230 | **VerificationEngine** | Canvas wrong node click | (102,98) hits node_A, target=node_C → false | 🟢 PASSED |
| 231 | **VerificationEngine** | Canvas empty space click | (500,500) no node hit → false, 'chưa trúng' | 🟢 PASSED |
| 232 | **VerificationEngine** | Non-CANVAS_TARGET type | MC question + canvas click → 'không tương thích' | 🟢 PASSED |
| 233 | **VerificationEngine** | Boundary click (exact radius) | (220,200) distance=20=radius → true | 🟢 PASSED |
| 234 | **VerificationEngine** | Just outside radius | (221,200) distance=21>20 → false | 🟢 PASSED |
| 235 | **VerificationEngine** | Empty nodes array | No nodes → false, 'chưa trúng' | 🟢 PASSED |
| 236 | **StatsManager** | Default stats empty localStorage | totalAttempts=0, streak=0, completedQuizzes=[] | 🟢 PASSED |
| 237 | **StatsManager** | Save correct attempt + streak | totalAttempts=1, correctAnswers=1, streak=1 | 🟢 PASSED |
| 238 | **StatsManager** | Incorrect resets streak | 2 correct → 1 incorrect → streak=0 | 🟢 PASSED |
| 239 | **StatsManager** | Accumulate streak | 3 consecutive correct → streak=3 | 🟢 PASSED |
| 240 | **StatsManager** | No duplicate quiz IDs | saveAttempt(true,'q1')×2 → only 1 'q1' | 🟢 PASSED |
| 241 | **StatsManager** | Incorrect not in completedQuizzes | saveAttempt(false,'q1') → 'q1' not in list | 🟢 PASSED |
| 242 | **StatsManager** | Clear stats | All values reset to 0/[] | 🟢 PASSED |
| 243 | **StatsManager** | Corrupted localStorage | 'not-valid-json' → defaults returned | 🟢 PASSED |
| 244 | **StatsManager** | Persistence across getStats | Multiple reads return same values | 🟢 PASSED |
| 245 | **SchemaValidator** | Valid MC checkpoint | frameIndex+id+type+options+correctOptionIndex → valid | 🟢 PASSED |
| 246 | **SchemaValidator** | Missing checkpoints array | {questions:[]} → invalid | 🟢 PASSED |
| 247 | **SchemaValidator** | Null input | null → invalid | 🟢 PASSED |
| 248 | **SchemaValidator** | Missing frameIndex | No frameIndex → error 'frameIndex' | 🟢 PASSED |
| 249 | **SchemaValidator** | MC missing options | No options array → error 'options' | 🟢 PASSED |
| 250 | **SchemaValidator** | CANVAS_TARGET missing targetNodeId | No targetNodeId → error 'targetNodeId' | 🟢 PASSED |
| 251 | **SchemaValidator** | Missing question id | No id field → error 'id' | 🟢 PASSED |
| 252 | **SchemaValidator** | Missing explanation | No explanation → error 'explanation' | 🟢 PASSED |
| 253 | **SchemaValidator** | Valid CANVAS_TARGET | targetNodeId present → valid | 🟢 PASSED |
| 254 | **SchemaValidator** | Multiple checkpoints | 2 checkpoints (MC+TF) → valid | 🟢 PASSED |
| 255 | **SchemaValidator** | Missing question object | {frameIndex:3} → error 'question' | 🟢 PASSED |
| 256 | **QuizStore** | Initialize empty state | activeQuestion=null, isQuizActive=false | 🟢 PASSED |
| 257 | **QuizStore** | Load checkpoints | 3 checkpoints loaded, session counts=0 | 🟢 PASSED |
| 258 | **QuizStore** | Trigger at matching frameIndex | frameIndex=1 → activeQuestion.id='q1', locked | 🟢 PASSED |
| 259 | **QuizStore** | No trigger at non-matching frame | frameIndex=3 → activeQuestion=null | 🟢 PASSED |
| 260 | **QuizStore** | No re-trigger completed checkpoint | After dismiss, same frame → no trigger | 🟢 PASSED |
| 261 | **QuizStore** | Submit correct MC answer | selectedIndex=1 → isCorrect=true, session 1/1 | 🟢 PASSED |
| 262 | **QuizStore** | Submit incorrect MC answer | selectedIndex=0 → isCorrect=false, session 0/1 | 🟢 PASSED |
| 263 | **QuizStore** | Double submit prevention | Second submit ignored, sessionTotal=1 | 🟢 PASSED |
| 264 | **QuizStore** | Dismiss resets active state | activeQuestion=null, isSubmitted=false | 🟢 PASSED |
| 265 | **QuizStore** | Session accuracy calculation | 1 correct + 1 incorrect → 50% | 🟢 PASSED |
| 266 | **QuizStore** | Canvas correct node click | (202,198) → node_C matched, isCorrect=true | 🟢 PASSED |
| 267 | **QuizStore** | Canvas wrong node click | (102,98) → node_A matched, isCorrect=false | 🟢 PASSED |
| 268 | **QuizStore** | Canvas empty space ignored | (500,500) → isSubmitted=false (no submit) | 🟢 PASSED |
| 269 | **QuizStore** | allCheckpointsCompleted | After 3/3 checkpoints → true | 🟢 PASSED |
| 270 | **QuizStore** | Reset quiz store | All state cleared to initial | 🟢 PASSED |
| 271 | **QuizStore** | No trigger when quiz active | Active q1, frame 5 → still q1 | 🟢 PASSED |
| 272 | **QuizStore** | isCanvasTargetMode for CANVAS_TARGET | CANVAS_TARGET → true | 🟢 PASSED |
| 273 | **QuizStore** | isCanvasTargetMode for MC | MULTIPLE_CHOICE → false | 🟢 PASSED |
| 274 | **QuizLoader** | Load bubble-sort script | algorithmId='bubble-sort', checkpoints>0 | 🟢 PASSED |
| 275 | **QuizLoader** | Unknown algorithm returns null | 'unknown-algo' → null | 🟢 PASSED |
| 276 | **QuizLoader** | hasQuizScript detection | 'bubble-sort'→true, 'unknown'→false | 🟢 PASSED |
| 277 | **QuizLoader** | Valid question structures | All checkpoints have id, prompt, explanation, valid type | 🟢 PASSED |

### Phase 2 Code-to-Visualization Compiler — 32 Unit Tests

| STT | Phân hệ kiểm thử | Tính năng hạt nhân được xác thực | Phương thức kiểm tra (Test Spec) | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| 278 | **ASTInstrumentation** | BinaryExpression traceCompare | arr[i] > arr[j] output contains traceCompare | PASSED |
| 279 | **ASTInstrumentation** | AssignmentExpression traceAssign | arr[i] = temp output contains traceAssign | PASSED |
| 280 | **ASTInstrumentation** | While loop guard injection | while(i<n) loopCounter injected | PASSED |
| 281 | **ASTInstrumentation** | For loop guard injection | for loop loopCounter injected | PASSED |
| 282 | **ASTInstrumentation** | Syntax error handling | Invalid JS success=false, error defined | PASSED |
| 283 | **ASTInstrumentation** | Full Bubble Sort code | Multiple compare+assign both traceCompare+traceAssign | PASSED |
| 284 | **ASTInstrumentation** | Empty function body | No errors for empty function | PASSED |
| 285 | **ASTInstrumentation** | Non-array comparisons preserved | x > y no traceCompare (not array access) | PASSED |
| 286 | **ASTInstrumentation** | <= comparison operator | arr[i] <= arr[j] traceCompare injected | PASSED |
| 287 | **ASTInstrumentation** | < comparison operator | arr[i] < arr[j] traceCompare injected | PASSED |
| 288 | **ASTInstrumentation** | loopCounter prepended at top | Output starts with let loopCounter = 0 | PASSED |
| 289 | **ASTInstrumentation** | Selection Sort pattern | Multiple assignments traceAssign injected | PASSED |
| 290 | **ASTInstrumentation** | Syntax error info | Malformed code error message defined | PASSED |
| 291 | **ASTInstrumentation** | Do-while loop guard | do-while loopCounter injected | PASSED |
| 292 | **WorkerCoordinator** | Create Worker + postMessage | Worker created, postMessage called with code+array | PASSED |
| 293 | **WorkerCoordinator** | Worker error response rejection | success:false promise rejects with error | PASSED |
| 294 | **WorkerCoordinator** | Worker onerror event rejection | onerror rejects with Worker error message | PASSED |
| 295 | **WorkerCoordinator** | Timeout rejection | 100ms timeout rejects with Timeout message | PASSED |
| 296 | **WorkerCoordinator** | Terminate previous worker | New execution terminates old worker | PASSED |
| 297 | **WorkerCoordinator** | URL.revokeObjectURL cleanup | After completion revokeObjectURL called | PASSED |
| 298 | **WorkerCoordinator** | terminateActiveSession | Explicit terminate worker.terminate() called | PASSED |
| 299 | **CompilerStore** | Default state initialization | sourceCode contains bubbleSort, isCompiling=false | PASSED |
| 300 | **CompilerStore** | setSourceCode | Updates sourceCode ref | PASSED |
| 301 | **CompilerStore** | setInputArray | Updates inputArray ref | PASSED |
| 302 | **CompilerStore** | addConsoleLog with timestamp | Log entry added with text, type, timestamp | PASSED |
| 303 | **CompilerStore** | clearLogs | All logs cleared | PASSED |
| 304 | **CompilerStore** | AST compile failure hasCompileError | success=false hasCompileError=true, error log | PASSED |
| 305 | **CompilerStore** | Successful compile+execute | Full pipeline success log, hasCompileError=false | PASSED |
| 306 | **CompilerStore** | Sandbox execution failure | executeInSandbox rejects hasCompileError=true | PASSED |
| 307 | **CompilerStore** | Double compilation prevention | Second call ignored while compiling | PASSED |
| 308 | **CompilerStore** | cancelExecution | terminateActiveSession called, isCompiling=false | PASSED |
| 309 | **CompilerStore** | Error line info in log | errorLine=3 log contains Dong so 3 | PASSED |

### Phase 2 Code-to-Visualization Compiler — 5 UI End-to-End Tests

| STT | Phân hệ kiểm thử | Tính năng hạt nhân được xác thực | Phương thức kiểm tra | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| UI-1 | **CodeWorkspace** | Empty state (Monaco + Console + Canvas) | Code IDE tab loads: dark theme, Bubble Sort code, Console 0 dòng, UNINITIALIZED green dot | PASSED |
| UI-2 | **Full Pipeline** | AST compile → Worker execute → Canvas animate | RUN → Console INFO→SUCCESS→SUCCESS, 71 frames generated, 9 bars animate with compare/swap highlights | PASSED |
| UI-3 | **ASTInstrumentation** | Syntax error detection + error glow | Broken JS → rose dot, red glow border, [LỖI] Unexpected token error | PASSED |
| UI-4 | **WorkerCoordinator** | Infinite loop protection (__loopCounter guard) | while(true) → loop guard at 5000, [LỖI] error, UI responsive | PASSED |
| UI-5 | **CodeWorkspace** | Invalid input array rejection | "abc, def" → red border, RUN blocked, no new console logs | PASSED |

### Phase 2 Compare Algorithms — 33 Unit Tests

| STT | Phân hệ kiểm thử | Tính năng hạt nhân được xác thực | Phương thức kiểm tra | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| 310 | **Coordinator** | Sync 50% progress for different frame counts | leftStore(100) goToFrame(50), rightStore(20) goToFrame(10) | PASSED |
| 311 | **Coordinator** | Sync 0% — both snap to frame 0 | goToFrame(0) called on both stores | PASSED |
| 312 | **Coordinator** | Sync 100% — both snap to last frame | leftStore goToFrame(99), rightStore goToFrame(19) | PASSED |
| 313 | **Coordinator** | Reject negative percent | goToFrame not called | PASSED |
| 314 | **Coordinator** | Reject percent > 100 | goToFrame not called | PASSED |
| 315 | **Coordinator** | Aligned speeds — left longer, right slowed | leftSpeed=1.0, rightSpeed=0.2 | PASSED |
| 316 | **Coordinator** | Aligned speeds — right longer, left slowed | leftSpeed=0.67, rightSpeed=2.0 | PASSED |
| 317 | **Coordinator** | Aligned speeds — equal frames, same speed | leftSpeed=rightSpeed=1.5 | PASSED |
| 318 | **Coordinator** | Zero frames returns base speed | Both sides get globalSpeed | PASSED |
| 319 | **Coordinator** | Global progress from max of both sides | max(leftPct, rightPct) | PASSED |
| 320 | **CompareStore** | Default algorithm IDs and UNINITIALIZED state | bubble-sort, selection-sort, UNINITIALIZED | PASSED |
| 321 | **CompareStore** | Load compare session with dummy generators | Frames loaded, LOADED state | PASSED |
| 322 | **CompareStore** | Generate random input array (size 15) | 15 values in [1,99] range | PASSED |
| 323 | **CompareStore** | Fair comparison — same input for both sides | leftFrames[0].dataState === rightFrames[0].dataState | PASSED |
| 324 | **CompareStore** | Step forward both sides | leftCurrentIndex=rightCurrentIndex=1 | PASSED |
| 325 | **CompareStore** | Step backward both sides | Both decrement by 1 | PASSED |
| 326 | **CompareStore** | Cannot step backward below 0 | Both stay at 0 | PASSED |
| 327 | **CompareStore** | Scrub to percent — sync proportionally | Correct frame indices for 50% | PASSED |
| 328 | **CompareStore** | Clamp scrub percent 0-100 | -10 → frame 0, 200 → last frame | PASSED |
| 329 | **CompareStore** | Stop and reset to frame 0 | isPlaying=false, both at 0 | PASSED |
| 330 | **CompareStore** | Left stats computation (comparisons/swaps) | Values ≥ 0, totalFrames correct | PASSED |
| 331 | **CompareStore** | Efficiency ratio computation | efficiencyRatio > 0 at 100% | PASSED |
| 332 | **CompareStore** | Algorithm name resolution from catalog | Contains Bubble Sort / Selection Sort | PASSED |
| 333 | **CompareStore** | Change playback speed | globalPlaySpeed = 2.0 | PASSED |
| 334 | **CompareStore** | Toggle playback mode | independent ↔ normalized | PASSED |
| 335 | **CompareStore** | Cleanup all state | Frames empty, UNINITIALIZED | PASSED |
| 336 | **CompareStore** | Progress percentages 0% and 100% | 0→0%, 100→100% both sides | PASSED |
| 337 | **CompareStore** | FINISHED state detection | bothFinished=true, FINISHED state | PASSED |
| 338 | **CompareStore** | Time complexity from catalog | O(N²) for both | PASSED |
| 339 | **RenderScheduler** | Register callbacks and invoke on tick | leftCb and rightCb called once | PASSED |
| 340 | **RenderScheduler** | No duplicate loop start | Second startSchedulerLoop ignored | PASSED |
| 341 | **RenderScheduler** | Stop scheduler and cancel animation frame | cancelAnimationFrame called | PASSED |
| 342 | **RenderScheduler** | Cleanup nullifies callbacks | Stop + nullify after cleanup | PASSED |

---

## Phase 2 Concurrency Visualizer — 35 Unit Tests (ConcurrencySimulationEngine + DeadlockDetector + useConcurrencyStore)

| STT | Phân hệ kiểm thử | Tính năng hạt nhân được xác thực | Phương thức kiểm tra | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| 343 | **SimEngine** | Initialize threads and locks | 2 threads, L1 lock, heldByThreadId=null, counter=0 | PASSED |
| 344 | **SimEngine** | Acquire lock successfully when free | acquireLock(T1,L1)=true, heldByThreadId=T1, state=RUNNING | PASSED |
| 345 | **SimEngine** | Block thread when lock held by another | acquireLock(T2,L1)=false, state=BLOCKED, waitingForLock=L1 | PASSED |
| 346 | **SimEngine** | Release lock and wake waiting thread | releaseLock(T1,L1) → T2 acquires, state=RUNNING | PASSED |
| 347 | **SimEngine** | Move thread progress | moveThread(T1,50) → progress=50, state=RUNNING | PASSED |
| 348 | **SimEngine** | Finish thread at 100% progress | moveThread(T1,100) → state=FINISHED | PASSED |
| 349 | **SimEngine** | Not move blocked thread | BLOCKED thread stays at progress=0 | PASSED |
| 350 | **SimEngine** | Increment and read shared counter | incrementCounter×2 → readCounter=2 | PASSED |
| 351 | **SimEngine** | Clamp progress at 100 | moveThread(60)+moveThread(60) → progress=100 | PASSED |
| 352 | **SimEngine** | Not release lock held by different thread | releaseLock(T2,L1) ignored, T1 still holds | PASSED |
| 353 | **Deadlock** | No deadlock when no waiting threads | isDeadlocked=false, cycleThreadIds=[] | PASSED |
| 354 | **Deadlock** | Circular deadlock between two threads | T1→L2→T2→L1→T1 cycle detected | PASSED |
| 355 | **Deadlock** | No deadlock when thread waits but no cycle | T2 waits T1 (no reverse), isDeadlocked=false | PASSED |
| 356 | **Deadlock** | Dining philosophers 5-thread deadlock | P0→P1→P2→P3→P4→P0 circular WFG detected | PASSED |
| 357 | **Deadlock** | Empty threads list | isDeadlocked=false | PASSED |
| 358 | **Deadlock** | Waiting for non-existent lock | isDeadlocked=false | PASSED |
| 359 | **ConcStore** | Default state (IDLE, no threads) | threads=[], isPlaying=false, playbackMode=IDLE | PASSED |
| 360 | **ConcStore** | Initialize race-condition scenario | 2 threads (T1,T2), READY state, totalSteps>0 | PASSED |
| 361 | **ConcStore** | Initialize deadlock-demo scenario | 2 threads, locks L1+L2 | PASSED |
| 362 | **ConcStore** | Initialize dining-philosophers scenario | 5 threads, 5 locks (F0-F4) | PASSED |
| 363 | **ConcStore** | Step forward correctly | currentStepIndex increments by 1 | PASSED |
| 364 | **ConcStore** | Step backward correctly | currentStepIndex decrements by 1 via history | PASSED |
| 365 | **ConcStore** | Not step backward past zero | currentStepIndex stays 0 | PASSED |
| 366 | **ConcStore** | Detect deadlock in deadlock-demo | isDeadlocked=true, playbackMode=DEADLOCKED | PASSED |
| 367 | **ConcStore** | Not step forward when deadlocked | currentStepIndex unchanged after deadlock | PASSED |
| 368 | **ConcStore** | Toggle play/pause | PLAYING↔PAUSED transitions | PASSED |
| 369 | **ConcStore** | Stop and reset simulation | currentStepIndex=0, playbackMode=IDLE | PASSED |
| 370 | **ConcStore** | Set speed within bounds | 0.1→0.25, 10→4, 2→2 | PASSED |
| 371 | **ConcStore** | Scrub to specific step | scrubToStep(5) → currentStepIndex=5 | PASSED |
| 372 | **ConcStore** | Scrub backward via history | scrubToStep(8)→scrubToStep(3) → currentStepIndex=3 | PASSED |
| 373 | **ConcStore** | Toggle mutex and reinitialize | mutexEnabled=false, currentStepIndex=0 | PASSED |
| 374 | **ConcStore** | Compute progress percent | 0% at start, >0% at half | PASSED |
| 375 | **ConcStore** | List all scenario options | 4 scenarios (race-condition, deadlock-demo, producer-consumer, dining-philosophers) | PASSED |
| 376 | **ConcStore** | Finish race-condition without deadlock | isDeadlocked=false, sharedCounter>0 | PASSED |
| 377 | **ConcStore** | Cleanup resources | threads=[], playbackMode=IDLE | PASSED |

---

## Phase 2 Debug Mode — 49 Unit Tests (DebuggerYieldEngine + LiveCompilerDebugger + useLiveDebuggerStore)

| STT | Phân hệ kiểm thử | Tính năng hạt nhân được xác thực | Phương thức kiểm tra | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| 378 | **YieldEngine** | Compile valid Bubble Sort code | success=true, generatorCode defined | PASSED |
| 379 | **YieldEngine** | Convert function to generator (function*) | generatorCode contains 'function*' | PASSED |
| 380 | **YieldEngine** | Inject yield statements | generatorCode contains 'yield' | PASSED |
| 381 | **YieldEngine** | Inject __loopCounter guard | generatorCode contains '__loopCounter' | PASSED |
| 382 | **YieldEngine** | Inject __recursionDepth guard | generatorCode contains '__recursionDepth' | PASSED |
| 383 | **YieldEngine** | Inject __callStack management | generatorCode contains '__callStack' | PASSED |
| 384 | **YieldEngine** | Create __debugMain wrapper function | generatorCode contains '__debugMain' | PASSED |
| 385 | **YieldEngine** | Return error for invalid syntax | success=false, error defined | PASSED |
| 386 | **YieldEngine** | Extract error line number from syntax error | errorLine defined | PASSED |
| 387 | **YieldEngine** | Handle empty function body | success=true | PASSED |
| 388 | **YieldEngine** | Handle while loops | __loopCounter injected | PASSED |
| 389 | **YieldEngine** | Include lineNumber in yield payload | 'lineNumber' in generatorCode | PASSED |
| 390 | **YieldEngine** | Include arrayState in yield payload | 'arrayState' in generatorCode | PASSED |
| 391 | **YieldEngine** | Include callStack in yield payload | 'callStack' in generatorCode | PASSED |
| 392 | **YieldEngine** | Include __captureVars in yield payload | '__captureVars' in generatorCode | PASSED |
| 393 | **Debugger** | Step forward through generator yields | lineNumber=2 then 3, variables tracked | PASSED |
| 394 | **Debugger** | Return null when generator exhausted | null after 6 steps, isFinished=true | PASSED |
| 395 | **Debugger** | Track step count | getStepCount increments correctly | PASSED |
| 396 | **Debugger** | Halt exactly on registered breakpoint | continueToNextBreakpoint stops at line 5 | PASSED |
| 397 | **Debugger** | Skip non-breakpoint lines | continueToNextBreakpoint at line 7, arrayState=[3,5] | PASSED |
| 398 | **Debugger** | Return null if no breakpoint hit | generator exhausted without hitting line 99 | PASSED |
| 399 | **Debugger** | Restore previous step from history | stepBackward returns lineNumber=3 | PASSED |
| 400 | **Debugger** | Return null at first step | stepBackward=null at step 1 | PASSED |
| 401 | **Debugger** | Advance until callStack depth decreases (stepOut) | callStack.length=1, lineNumber=10 | PASSED |
| 402 | **Debugger** | Track recursive call stack correctly | ['quickSort(0,1)'] then ['quickSort(0,1)','partition(0,1)'] | PASSED |
| 403 | **Debugger** | Set and get breakpoints | getActiveBreakpoints=[3,5,7] | PASSED |
| 404 | **Debugger** | Record all steps in history | history.length=3, correct lineNumbers | PASSED |
| 405 | **Debugger** | Reset clears all state | null step, 0 count, empty history, isFinished=true | PASSED |
| 406 | **DebugStore** | IDLE status on init | status='IDLE' | PASSED |
| 407 | **DebugStore** | Default source code contains bubbleSort | sourceCode includes 'bubbleSort' | PASSED |
| 408 | **DebugStore** | Default input array [5,3,8,1,9,2,7] | inputArray matches | PASSED |
| 409 | **DebugStore** | Empty breakpoints on init | activeBreakpoints=[] | PASSED |
| 410 | **DebugStore** | Not debugging on init | isDebugging=false | PASSED |
| 411 | **DebugStore** | Toggle breakpoint add | activeBreakpoints contains 5 | PASSED |
| 412 | **DebugStore** | Toggle breakpoint remove | activeBreakpoints does not contain 5 | PASSED |
| 413 | **DebugStore** | Support multiple breakpoints | activeBreakpoints.length=3 | PASSED |
| 414 | **DebugStore** | Update source code | sourceCode='function test() {}' | PASSED |
| 415 | **DebugStore** | Update input array | inputArray=[10,20,30] | PASSED |
| 416 | **DebugStore** | Start session → PAUSED status | status='PAUSED' on valid code | PASSED |
| 417 | **DebugStore** | Set current line after starting | currentLineNumber not null | PASSED |
| 418 | **DebugStore** | Populate array state | arrayState.length > 0 | PASSED |
| 419 | **DebugStore** | ERROR status on invalid code | status='ERROR', errorMessage defined | PASSED |
| 420 | **DebugStore** | Step forward advances | stepCount > 1 after stepForward | PASSED |
| 421 | **DebugStore** | Stop resets all state | IDLE, null line, empty callStack/vars, 0 steps | PASSED |
| 422 | **DebugStore** | isDebugging true when PAUSED | isDebugging=true | PASSED |
| 423 | **DebugStore** | isPaused true when PAUSED | isPaused=true | PASSED |
| 424 | **DebugStore** | canStepForward true when PAUSED | canStepForward=true | PASSED |
| 425 | **DebugStore** | hasError true on ERROR status | hasError=true | PASSED |
| 426 | **DebugStore** | Detect mutated variables on step | watchedVariables defined after step | PASSED |
| 427 | **DesignPatterns Engine** | Cubic Bezier path calculation | path contains M startX,startY C cp1,cp2 endX,endY | PASSED |
| 428 | **DesignPatterns Engine** | Empty path for non-existent link | calculateBezierPath('FAKE') returns '' | PASSED |
| 429 | **DesignPatterns Engine** | Control offset based on deltaY | controlOffset = min(100, deltaY*0.5) | PASSED |
| 430 | **DesignPatterns Engine** | Clamp minimum control offset 30 | Close nodes get controlOffset=30 minimum | PASSED |
| 431 | **DesignPatterns Engine** | Cap controlOffset at 100 | Large deltaY caps at 100 | PASSED |
| 432 | **DesignPatterns Engine** | calculateAllPaths Map | Returns Map with all link paths | PASSED |
| 433 | **DesignPatterns Engine** | updateNodePosition coordinates | Node x/y updated correctly | PASSED |
| 434 | **DesignPatterns Engine** | Clamp position within canvas | Negative coords clamped to padding=10 | PASSED |
| 435 | **DesignPatterns Engine** | Clamp maximum position | Exceeding coords clamped to canvasWidth-nodeWidth-padding | PASSED |
| 436 | **DesignPatterns Engine** | Ignore non-existent node drag | No error, nodes unchanged | PASSED |
| 437 | **DesignPatterns Engine** | swapStrategyTarget success | Link targetId changed to new node | PASSED |
| 438 | **DesignPatterns Engine** | swapStrategyTarget non-existent link | Returns false | PASSED |
| 439 | **DesignPatterns Engine** | swapStrategyTarget non-existent target | Returns false | PASSED |
| 440 | **DesignPatterns Engine** | getLinksToTarget | Finds all links to target node | PASSED |
| 441 | **DesignPatterns Engine** | getLinksFromSource | Finds all links from source node | PASSED |
| 442 | **DesignPatterns Engine** | getLinksToTarget empty | Returns empty for non-existent node | PASSED |
| 443 | **DesignPatterns Engine** | replaceState | Replaces all nodes and links | PASSED |
| 444 | **DesignPatterns Engine** | getNodeById found | Returns correct node by id | PASSED |
| 445 | **DesignPatterns Store** | Load Strategy Pattern scenario | 4 nodes, 3 links, title='Strategy Pattern' | PASSED |
| 446 | **DesignPatterns Store** | Load Observer Pattern scenario | 5 nodes, 4 links | PASSED |
| 447 | **DesignPatterns Store** | Load DIP Sandbox scenario | 2 nodes, 1 link, isDIPEnabled=false | PASSED |
| 448 | **DesignPatterns Store** | Reset observer on scenario switch | isObserverNotifying=false after switch | PASSED |
| 449 | **DesignPatterns Store** | Path cache calculated | pathCache.size=3 for strategy | PASSED |
| 450 | **DesignPatterns Store** | switchStrategy Bubble→Quick | activeStrategyTargetId='Quick', link updated | PASSED |
| 451 | **DesignPatterns Store** | Paths recalculated after swap | pathCache changes after switchStrategy | PASSED |
| 452 | **DesignPatterns Store** | No swap in non-strategy mode | activeStrategyTargetId unchanged | PASSED |
| 453 | **DesignPatterns Store** | Observer notify 2s timeout | isObserverNotifying true→false after 2000ms | PASSED |
| 454 | **DesignPatterns Store** | No notify in non-observer mode | isObserverNotifying stays false | PASSED |
| 455 | **DesignPatterns Store** | DIP toggle adds IDatabase | nodes.length 2→3, IDatabase node exists | PASSED |
| 456 | **DesignPatterns Store** | DIP decoupled links | 2 links: HighToInterface + LowToInterface | PASSED |
| 457 | **DesignPatterns Store** | DIP toggle off removes IDatabase | nodes.length back to 2 | PASSED |
| 458 | **DesignPatterns Store** | DIP restore direct coupling | 1 link: DirectCoupling | PASSED |
| 459 | **DesignPatterns Store** | No DIP toggle in non-DIP mode | isDIPEnabled stays false | PASSED |
| 460 | **DesignPatterns Store** | Coupling 85% when DIP off | couplingIndexMetric=85, label='RẤT CHẶT' | PASSED |
| 461 | **DesignPatterns Store** | Coupling 20% when DIP on | couplingIndexMetric=20, label='LỎNG LẺO' | PASSED |
| 462 | **DesignPatterns Store** | Coupling 35% for non-DIP | couplingIndexMetric=35 for strategy | PASSED |
| 463 | **DesignPatterns Store** | handleNodeDrag updates position | Node x/y changed, pathCache updated | PASSED |
| 464 | **DesignPatterns Store** | cleanup resets state | nodes=[], links=[], pathCache empty | PASSED |
| 465 | **DesignPatterns Store** | nodeCount/linkCount computed | nodeCount=4, linkCount=3 for strategy | PASSED |
| 466 | **Scenario Data** | Strategy Pattern 4 nodes 3 links | patternId, nodes.length, links.length correct | PASSED |
| 467 | **Scenario Data** | Observer Pattern 5 nodes 4 links | Correct node/link counts | PASSED |
| 468 | **Scenario Data** | DIP Sandbox 2 nodes 1 link | Correct counts | PASSED |
| 469 | **Scenario Data** | Non-existent scenario returns null | getScenario('fake') → null | PASSED |
| 470 | **Scenario Data** | Strategy nodes have attributes/methods | Client has attributes and methods | PASSED |
| 471 | **Scenario Data** | ISortStrategy interface type | type='interface' | PASSED |
| 472 | **Scenario Data** | Dependency link Client→Strategy | type='dependency', correct sourceId/targetId | PASSED |
| 473 | **Scenario Data** | Realization links concrete→interface | BubbleToStrategy + QuickToStrategy type='realization' | PASSED |
| 474 | **Scenario Data** | getAllScenarioIds returns 3 | strategy-pattern, observer-pattern, solid-dip | PASSED |
| 475 | **Scenario Data** | SCENARIO_LABELS correct | All 3 labels defined | PASSED |
| 476 | **Scenario Data** | getNodeById undefined for non-existent | Returns undefined | PASSED |
| 477 | **EmbedBridge** | Create bridge with default wildcard origin | listenerCount=0 | PASSED |
| 478 | **EmbedBridge** | Create bridge with custom allowed origins | listenerCount=0 | PASSED |
| 479 | **EmbedBridge** | Register listener and return unsubscribe | listenerCount 0→1→0 | PASSED |
| 480 | **EmbedBridge** | Support multiple listeners simultaneously | listenerCount=3 | PASSED |
| 481 | **EmbedBridge** | Deliver messages from whitelisted origins | callback called with STEP_FORWARD | PASSED |
| 482 | **EmbedBridge** | Deliver messages with wildcard origin | callback called for any origin | PASSED |
| 483 | **EmbedBridge** | Deliver WIDGET source messages | HEIGHT_CHANGED payload received | PASSED |
| 484 | **EmbedBridge** | Block messages from non-whitelisted origins (XSS) | callback NOT called, console.warn XSS_PREVENTION_BLOCKED | PASSED |
| 485 | **EmbedBridge** | Block messages from empty origin strict whitelist | callback NOT called | PASSED |
| 486 | **EmbedBridge** | Ignore messages without valid source field | callback NOT called | PASSED |
| 487 | **EmbedBridge** | Ignore null message data | callback NOT called | PASSED |
| 488 | **EmbedBridge** | Ignore messages from unknown sources | callback NOT called | PASSED |
| 489 | **EmbedBridge** | Call postMessage on target window | postMessage called with correct args | PASSED |
| 490 | **EmbedBridge** | Default to wildcard target origin | postMessage called with '*' | PASSED |
| 491 | **EmbedBridge** | Clear all listeners on destroy | listenerCount=0 | PASSED |
| 492 | **EmbedBridge** | Stop receiving messages after destroy | callback NOT called post-destroy | PASSED |
| 493 | **EmbedBridge** | Handle double destroy gracefully | No throw | PASSED |
| 494 | **SecureOrigin** | Accept default whitelisted visualization-dsa.edu.vn | isValidOrigin=true | PASSED |
| 495 | **SecureOrigin** | Accept default whitelisted moodle.hust.edu.vn | isValidOrigin=true | PASSED |
| 496 | **SecureOrigin** | Accept default whitelisted canvas.usth.edu.vn | isValidOrigin=true | PASSED |
| 497 | **SecureOrigin** | Reject domains not in whitelist | isValidOrigin=false | PASSED |
| 498 | **SecureOrigin** | Reject empty origin string | isValidOrigin=false | PASSED |
| 499 | **SecureOrigin** | Have 3 default domains | domainCount=3 | PASSED |
| 500 | **SecureOrigin** | Accept any origin with wildcard | isValidOrigin=true for all | PASSED |
| 501 | **SecureOrigin** | Dynamically add a trusted domain | domainCount 3→4, isValidOrigin=true | PASSED |
| 502 | **SecureOrigin** | Not duplicate existing domains | domainCount stays 3 | PASSED |
| 503 | **SecureOrigin** | Remove domain from whitelist | domainCount 3→2, isValidOrigin=false | PASSED |
| 504 | **SecureOrigin** | Handle removing non-existent domain | domainCount stays 3 | PASSED |
| 505 | **SecureOrigin** | Clear all domains from whitelist | domainCount=0 | PASSED |
| 506 | **SecureOrigin** | Return copy of whitelist as array | 3 domains in array | PASSED |
| 507 | **SecureOrigin** | Initialize with custom domains | custom domainCount=2 | PASSED |
| 508 | **SecureOrigin** | Initialize with empty array | domainCount=0 | PASSED |
| 509 | **AutoHeight** | Return value within default bounds | clampHeight(500)=500 | PASSED |
| 510 | **AutoHeight** | Clamp to minimum height 300px | clampHeight(100)=300 | PASSED |
| 511 | **AutoHeight** | Clamp to maximum height 1200px | clampHeight(2000)=1200 | PASSED |
| 512 | **AutoHeight** | Accept exact boundary values | 300→300, 1200→1200 | PASSED |
| 513 | **AutoHeight** | Respect custom min/max bounds | custom 400/800 clamping | PASSED |
| 514 | **AutoHeight** | Start with lastReportedHeight of 0 | getLastReportedHeight()=0 | PASSED |
| 515 | **AutoHeight** | Reset lastReportedHeight on destroy | 0 after destroy | PASSED |
| 516 | **AutoHeight** | Handle double destroy gracefully | No throw | PASSED |
| 517 | **AutoHeight** | Not throw when starting observation | start() no throw | PASSED |
| 518 | **AutoHeight** | Be idempotent when called multiple times | double start() no throw | PASSED |
| 519 | **EmbedStore** | Default theme glass | selectedTheme='glass' | PASSED |
| 520 | **EmbedStore** | VCR controls enabled by default | showVcrControls=true | PASSED |
| 521 | **EmbedStore** | Watch variables enabled by default | showWatchVariables=true | PASSED |
| 522 | **EmbedStore** | Interactive mode enabled by default | isInteractive=true | PASSED |
| 523 | **EmbedStore** | Default dimensions 800x500 | widgetWidth=800, widgetHeight=500 | PASSED |
| 524 | **EmbedStore** | Default algorithm quicksort-recursion | selectedAlgorithm correct | PASSED |
| 525 | **EmbedStore** | isCopied false initially | isCopied=false | PASSED |
| 526 | **EmbedStore** | Generated code contains iframe tag | <iframe...></iframe> present | PASSED |
| 527 | **EmbedStore** | Sandbox attribute with secure flags | sandbox="allow-scripts allow-same-origin" | PASSED |
| 528 | **EmbedStore** | Include default dimensions | width="800" height="500" | PASSED |
| 529 | **EmbedStore** | Include selected algorithm | algo=quicksort-recursion | PASSED |
| 530 | **EmbedStore** | Include selected theme | theme=glass | PASSED |
| 531 | **EmbedStore** | Include base URL | visualization-dsa.edu.vn/embed | PASSED |
| 532 | **EmbedStore** | Include border-radius styling | border-radius: 16px | PASSED |
| 533 | **EmbedStore** | Update dynamically when theme changes | theme=dark after setTheme | PASSED |
| 534 | **EmbedStore** | Update dynamically when algorithm changes | algo=heap-sort | PASSED |
| 535 | **EmbedStore** | Update dynamically when dimensions change | width="1000" height="700" | PASSED |
| 536 | **EmbedStore** | Reflect VCR controls toggle | vcr=false | PASSED |
| 537 | **EmbedStore** | iframeSrcUrl properly formatted | URL with params | PASSED |
| 538 | **EmbedStore** | setTheme dark | selectedTheme='dark' | PASSED |
| 539 | **EmbedStore** | setTheme light | selectedTheme='light' | PASSED |
| 540 | **EmbedStore** | setAlgorithm | selectedAlgorithm='merge-sort' | PASSED |
| 541 | **EmbedStore** | setDimensions valid | 600x400 set correctly | PASSED |
| 542 | **EmbedStore** | Clamp width minimum 300 | widgetWidth=300 from 100 | PASSED |
| 543 | **EmbedStore** | Clamp width maximum 1400 | widgetWidth=1400 from 2000 | PASSED |
| 544 | **EmbedStore** | Clamp height minimum 200 | widgetHeight=200 from 50 | PASSED |
| 545 | **EmbedStore** | Clamp height maximum 900 | widgetHeight=900 from 1500 | PASSED |
| 546 | **EmbedStore** | Toggle VCR controls | true→false→true | PASSED |
| 547 | **EmbedStore** | Toggle watch variables | true→false | PASSED |
| 548 | **EmbedStore** | Toggle interactive mode | true→false | PASSED |
| 549 | **EmbedStore** | Reset all values to defaults | all fields reset | PASSED |
| 550 | **EmbedStore** | isCopied true on successful copy | Clipboard writeText mock | PASSED |
| 551 | **EmbedStore** | Return false on clipboard error | error handled gracefully | PASSED |
| 552 | **EmbedStore** | Reset isCopied after 2 seconds | fake timer advance 2000ms | PASSED |
| 553 | **State Compressor** | Nén trạng thái thành chuỗi không rỗng | serializeState trả chuỗi non-empty | 🟢 PASSED |
| 554 | **State Compressor** | Nén hiệu quả với dữ liệu lớn | compressed.length < rawJson.length (30 nodes) | 🟢 PASSED |
| 555 | **State Compressor** | Chuỗi URL-safe (không +, /) | Không chứa ký tự đặc biệt URL-unsafe | 🟢 PASSED |
| 556 | **State Compressor** | Đầu ra khác nhau cho state khác nhau | bubble-sort ≠ merge-sort compressed | 🟢 PASSED |
| 557 | **State Compressor** | Xử lý layoutNodes rỗng | Nén thành công state với mảng rỗng | 🟢 PASSED |
| 558 | **State Compressor** | Xử lý nhiều nodes (100) | Nén thành công mảng 100 phần tử | 🟢 PASSED |
| 559 | **State Compressor** | Phục hồi 100% tất cả trường | algorithmId, currentStepIndex, layoutNodes | 🟢 PASSED |
| 560 | **State Compressor** | Bảo toàn tọa độ chính xác | x=150, y=80 khôi phục hoàn hảo | 🟢 PASSED |
| 561 | **State Compressor** | Trả null cho chuỗi rỗng | deserializeState('') → null | 🟢 PASSED |
| 562 | **State Compressor** | Trả null cho dữ liệu bất hợp lệ | deserializeState('invalid') → null | 🟢 PASSED |
| 563 | **State Compressor** | Round-trip 50 nodes zero data loss | 50 nodes phục hồi chính xác | 🟢 PASSED |
| 564 | **State Compressor** | Log lỗi cho dữ liệu hỏng | console.error gọi đúng cách | 🟢 PASSED |
| 565 | **State Compressor** | isWithinSizeLimit true cho ngắn | Chuỗi nén ngắn nằm trong giới hạn | 🟢 PASSED |
| 566 | **State Compressor** | isWithinSizeLimit true ở đúng giới hạn | 20000 ký tự = true | 🟢 PASSED |
| 567 | **State Compressor** | isWithinSizeLimit false vượt giới hạn | 20001 ký tự = false | 🟢 PASSED |
| 568 | **State Compressor** | isWithinSizeLimit true cho rỗng | Chuỗi rỗng = true | 🟢 PASSED |
| 569 | **State Compressor** | Validation trả chuỗi hợp lệ | serializeStateWithValidation trả non-null | 🟢 PASSED |
| 570 | **State Compressor** | Validation trả null cho state quá lớn | 5000 nodes → null + console.warn | 🟢 PASSED |
| 571 | **State Compressor** | Validation round-trip integrity | Kết quả giải nén khớp 100% | 🟢 PASSED |
| 572 | **SVG Exporter** | clampScale giữ nguyên giá trị hợp lệ | clampScale(2)=2, clampScale(3)=3 | 🟢 PASSED |
| 573 | **SVG Exporter** | clampScale kẹp dưới MIN_SCALE | clampScale(0)=1, clampScale(-5)=1 | 🟢 PASSED |
| 574 | **SVG Exporter** | clampScale kẹp trên MAX_SCALE | clampScale(10)=4, clampScale(100)=4 | 🟢 PASSED |
| 575 | **SVG Exporter** | clampScale biên MIN chính xác | clampScale(1)=1 | 🟢 PASSED |
| 576 | **SVG Exporter** | clampScale biên MAX chính xác | clampScale(4)=4 | 🟢 PASSED |
| 577 | **SVG Exporter** | clampScale phân số | clampScale(2.5)=2.5 | 🟢 PASSED |
| 578 | **SVG Exporter** | clampScale phân số dưới MIN | clampScale(0.5)=1 | 🟢 PASSED |
| 579 | **SVG Exporter** | extractSVGDataURI trả Base64 hợp lệ | Khớp pattern data:image/svg+xml;base64, | 🟢 PASSED |
| 580 | **SVG Exporter** | extractSVGDataURI inject <style> | Decoded chứa thẻ <style> | 🟢 PASSED |
| 581 | **SVG Exporter** | extractSVGDataURI không sửa gốc | childNodes.length giữ nguyên | 🟢 PASSED |
| 582 | **SVG Exporter** | extractSVGDataURI Base64 giải mã được | atob() không throw | 🟢 PASSED |
| 583 | **SVG Exporter** | extractSVGDataURI giữ nội dung gốc | Decoded chứa 'Test SVG Content' | 🟢 PASSED |
| 584 | **SVG Exporter** | extractSVGDataURI SVG rỗng | Xử lý SVG không có children | 🟢 PASSED |
| 585 | **SVG Exporter** | exportToSVGString XML hợp lệ | Chứa <svg> và </svg> | 🟢 PASSED |
| 586 | **SVG Exporter** | exportToSVGString inject styles | Chứa thẻ <style> | 🟢 PASSED |
| 587 | **SVG Exporter** | exportToSVGString giữ nội dung | Chứa 'Test SVG Content' | 🟢 PASSED |
| 588 | **SVG Exporter** | exportToSVGString không sửa gốc | childNodes.length giữ nguyên | 🟢 PASSED |
| 589 | **SVG Exporter** | exportToSVGString giữ viewBox | Chứa viewBox="0 0 1024 768" | 🟢 PASSED |
| 590 | **SVG Exporter** | exportToPNG reject khi Image lỗi | Throw 'Lỗi tải cấu trúc ảnh SVG ảo.' | 🟢 PASSED |
| 591 | **SVG Exporter** | DEFAULT_SCALE = 3 | Hằng số đúng giá trị | 🟢 PASSED |
| 592 | **CSS Injector** | extractActiveCSSRules trả string | typeof result === 'string' | 🟢 PASSED |
| 593 | **CSS Injector** | extractActiveCSSRules không stylesheet | Trả string (có thể rỗng) | 🟢 PASSED |
| 594 | **CSS Injector** | extractActiveCSSRules trích xuất rules | Chứa 'color' từ injected style | 🟢 PASSED |
| 595 | **CSS Injector** | extractActiveCSSRules nhiều sheets | Chứa cả 'background' và 'font-size' | 🟢 PASSED |
| 596 | **CSS Injector** | extractActiveCSSRules CORS an toàn | Không throw exception | 🟢 PASSED |
| 597 | **CSS Injector** | extractActiveCSSRules newline giữa rules | Chứa ký tự \n | 🟢 PASSED |
| 598 | **CSS Injector** | injectCSSIntoSVG thêm style đầu tiên | firstChild.nodeName === 'style' | 🟢 PASSED |
| 599 | **CSS Injector** | injectCSSIntoSVG type=text/css | getAttribute('type') === 'text/css' | 🟢 PASSED |
| 600 | **CSS Injector** | injectCSSIntoSVG nội dung CSS | textContent chứa 'opacity' | 🟢 PASSED |
| 601 | **CSS Injector** | injectCSSIntoSVG giữ children cũ | 3 children (style + circle + text) | 🟢 PASSED |
| 602 | **CSS Injector** | injectCSSIntoSVG chèn trước child đầu | style trước, rect id=original-first sau | 🟢 PASSED |
| 603 | **CSS Injector** | injectCSSIntoSVG SVG rỗng | Không throw, 1 child | 🟢 PASSED |
| 604 | **Export Store** | Initial isSharingModalOpen false | Mặc định false | 🟢 PASSED |
| 605 | **Export Store** | Initial isExporting false | Mặc định false | 🟢 PASSED |
| 606 | **Export Store** | Initial exportProgress 0 | Mặc định 0 | 🟢 PASSED |
| 607 | **Export Store** | Initial selectedFormat png-3x | Mặc định 'png-3x' | 🟢 PASSED |
| 608 | **Export Store** | Initial generatedShareLink rỗng | Mặc định '' | 🟢 PASSED |
| 609 | **Export Store** | Initial isLinkCopied false | Mặc định false | 🟢 PASSED |
| 610 | **Export Store** | Initial isGeneratingLink false | Mặc định false | 🟢 PASSED |
| 611 | **Export Store** | Initial overflowError rỗng | Mặc định '' | 🟢 PASSED |
| 612 | **Export Store** | hasShareLink false khi chưa có | computed false | 🟢 PASSED |
| 613 | **Export Store** | hasShareLink true khi có link | computed true | 🟢 PASSED |
| 614 | **Export Store** | qrCodeValue rỗng khi chưa có | computed '' | 🟢 PASSED |
| 615 | **Export Store** | qrCodeValue = link khi có | computed khớp link | 🟢 PASSED |
| 616 | **Export Store** | openModal bật modal | isSharingModalOpen = true | 🟢 PASSED |
| 617 | **Export Store** | openModal reset isLinkCopied | false sau khi mở | 🟢 PASSED |
| 618 | **Export Store** | openModal xóa link cũ | generatedShareLink = '' | 🟢 PASSED |
| 619 | **Export Store** | openModal xóa lỗi | overflowError = '' | 🟢 PASSED |
| 620 | **Export Store** | openModal reset progress | exportProgress = 0 | 🟢 PASSED |
| 621 | **Export Store** | openModal reset isExporting | isExporting = false | 🟢 PASSED |
| 622 | **Export Store** | closeModal tắt modal | isSharingModalOpen = false | 🟢 PASSED |
| 623 | **Export Store** | setFormat svg-vector | selectedFormat = 'svg-vector' | 🟢 PASSED |
| 624 | **Export Store** | setFormat png-3x | selectedFormat = 'png-3x' | 🟢 PASSED |
| 625 | **Export Store** | generateShareLink tạo link | generatedShareLink chứa /s/?state= | 🟢 PASSED |
| 626 | **Export Store** | generateShareLink hoàn tất | isGeneratingLink = false | 🟢 PASSED |
| 627 | **Export Store** | generateShareLink xóa lỗi cũ | overflowError = '' | 🟢 PASSED |
| 628 | **Export Store** | generateShareLink overflow | overflowError chứa WORKSPACE_OVERFLOW | 🟢 PASSED |
| 629 | **Export Store** | generateShareLink chứa base URL | Chứa visualization-dsa.edu.vn | 🟢 PASSED |
| 630 | **Export Store** | copyShareLink thành công | isLinkCopied = true, return true | 🟢 PASSED |
| 631 | **Export Store** | copyShareLink thất bại | return false khi clipboard denied | 🟢 PASSED |
| 632 | **Export Store** | copyShareLink auto-reset 2s | isLinkCopied false sau 2000ms | 🟢 PASSED |
| 633 | **Export Store** | resetState mọi giá trị | Tất cả state về defaults | 🟢 PASSED |
| 634 | **Export Store** | downloadSVG tạo anchor click | createElement + click gọi đúng | 🟢 PASSED |
| 635 | **Constants** | EXPORT_MIN_SCALE = 1 | Hằng số đúng | 🟢 PASSED |
| 636 | **Constants** | EXPORT_MAX_SCALE = 4 | Hằng số đúng | 🟢 PASSED |
| 637 | **Constants** | EXPORT_DEFAULT_SCALE = 3 | Hằng số đúng | 🟢 PASSED |

### Phase 2 Gamification Engine — StreakCalculator, GamificationEngine, CanvasConfettiEngine, useGamificationStore (88 tests)

| STT | Phân hệ kiểm thử | Tính năng hạt nhân được xác thực | Phương thức kiểm tra (Test Spec) | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| 638 | **StreakCalculator** | Grace Period 2h adjustment | Nộp bài 3:00 AM → ngày hiện tại | 🟢 PASSED |
| 639 | **StreakCalculator** | Late-night 1:45 AM keeps streak | Nộp lúc 1:45 AM 18/05 → tính ngày 17/05 | 🟢 PASSED |
| 640 | **StreakCalculator** | Past Grace Period 2:05 AM breaks | Nộp lúc 2:05 AM → tính ngày mới | 🟢 PASSED |
| 641 | **StreakCalculator** | Midnight submission (00:00 AM) | 00:00 AM 18/05 → tính ngày 17/05 | 🟢 PASSED |
| 642 | **StreakCalculator** | Exactly 2:00 AM boundary | 2:00 AM → tính ngày mới (không bù) | 🟢 PASSED |
| 643 | **StreakCalculator** | Noon no date change | 12:00 PM → giữ nguyên ngày | 🟢 PASSED |
| 644 | **StreakCalculator** | Year boundary Jan 1 1:00 AM | 01/01/2027 1:00 AM → 31/12/2026 | 🟢 PASSED |
| 645 | **StreakCalculator** | Month boundary March 1 0:30 AM | 01/03 0:30 AM → 28/02 | 🟢 PASSED |
| 646 | **StreakCalculator** | YYYY-MM-DD format | Kiểm tra regex format đầu ra | 🟢 PASSED |
| 647 | **StreakCalculator** | Zero-padding month/day | 01/05 → '2026-01-05' | 🟢 PASSED |
| 648 | **StreakCalculator** | Same day no update | lastActive = today → shouldUpdate: false | 🟢 PASSED |
| 649 | **StreakCalculator** | Consecutive day increment | yesterday → nextStreak + 1 | 🟢 PASSED |
| 650 | **StreakCalculator** | Gap > 1 day reset | 3-day gap → nextStreak: 1 | 🟢 PASSED |
| 651 | **StreakCalculator** | Exactly 2-day gap reset | 2-day gap → nextStreak: 1 | 🟢 PASSED |
| 652 | **StreakCalculator** | First ever activity | empty lastActive → nextStreak: 1 | 🟢 PASSED |
| 653 | **StreakCalculator** | Cross-month streak | May 31 → Jun 1 → streak + 1 | 🟢 PASSED |
| 654 | **StreakCalculator** | Cross-year streak | Dec 31 → Jan 1 → streak + 1 | 🟢 PASSED |
| 655 | **StreakCalculator** | Same day maintains value | streak 1, same day → 1, no update | 🟢 PASSED |
| 656 | **StreakCalculator** | shouldUpdate true on increment | Liên tục → shouldUpdate: true | 🟢 PASSED |
| 657 | **StreakCalculator** | shouldUpdate true on reset | Gap → shouldUpdate: true | 🟢 PASSED |
| 658 | **GamificationEngine** | Unlock Recursion Master | 600 XP + 4 streak → recursion-master | 🟢 PASSED |
| 659 | **GamificationEngine** | Insufficient XP blocks unlock | 100 XP → không mở khóa | 🟢 PASSED |
| 660 | **GamificationEngine** | Insufficient streak blocks unlock | 1500 XP, 1 streak → không mở khóa | 🟢 PASSED |
| 661 | **GamificationEngine** | No re-unlock already unlocked | Đã có recursion-master → bỏ qua | 🟢 PASSED |
| 662 | **GamificationEngine** | Unlock SOLID Architect | 1200 XP + 6 streak → solid-architect | 🟢 PASSED |
| 663 | **GamificationEngine** | Multiple badges at once | 1200 XP + 8 streak → ≥2 badges | 🟢 PASSED |
| 664 | **GamificationEngine** | Empty when no badges qualify | 10 XP, 1 streak → [] | 🟢 PASSED |
| 665 | **GamificationEngine** | Empty when all already unlocked | Tất cả badges đã mở → [] | 🟢 PASSED |
| 666 | **GamificationEngine** | Unlock Streak Warrior | 250 XP + 7 streak → streak-warrior | 🟢 PASSED |
| 667 | **GamificationEngine** | getBadgeTemplates returns all | ≥5 badge definitions | 🟢 PASSED |
| 668 | **GamificationEngine** | Unique badge IDs | Không trùng ID | 🟢 PASSED |
| 669 | **GamificationEngine** | Positive XP thresholds | Tất cả > 0 | 🟢 PASSED |
| 670 | **GamificationEngine** | Positive streak thresholds | Tất cả > 0 | 🟢 PASSED |
| 671 | **GamificationEngine** | Valid XP range (100) | 100 → true | 🟢 PASSED |
| 672 | **GamificationEngine** | Reject XP > 200 | 201 → false | 🟢 PASSED |
| 673 | **GamificationEngine** | Reject zero XP | 0 → false | 🟢 PASSED |
| 674 | **GamificationEngine** | Reject negative XP | -50 → false | 🟢 PASSED |
| 675 | **GamificationEngine** | Accept exactly MAX (200) | 200 → true | 🟢 PASSED |
| 676 | **GamificationEngine** | Accept minimum valid (1) | 1 → true | 🟢 PASSED |
| 677 | **CanvasConfettiEngine** | Construct with valid canvas | engine khởi tạo thành công | 🟢 PASSED |
| 678 | **CanvasConfettiEngine** | Throw on null 2D context | Ném lỗi khi canvas 2D null | 🟢 PASSED |
| 679 | **CanvasConfettiEngine** | Default 150 particles | burst() → 150 particles | 🟢 PASSED |
| 680 | **CanvasConfettiEngine** | Custom particle count | burst(50) → 50 particles | 🟢 PASSED |
| 681 | **CanvasConfettiEngine** | Start rAF after burst | requestAnimationFrame called | 🟢 PASSED |
| 682 | **CanvasConfettiEngine** | Accumulate particles | 50 + 30 → 80 particles | 🟢 PASSED |
| 683 | **CanvasConfettiEngine** | Clear on destroy | destroy → 0 particles | 🟢 PASSED |
| 684 | **CanvasConfettiEngine** | Cancel rAF on destroy | cancelAnimationFrame called | 🟢 PASSED |
| 685 | **CanvasConfettiEngine** | Safe destroy without animation | Không crash | 🟢 PASSED |
| 686 | **CanvasConfettiEngine** | Resize to window dimensions | canvas width/height = window | 🟢 PASSED |
| 687 | **CanvasConfettiEngine** | Neon color palette | Màu thuộc CONFETTI_COLORS | 🟢 PASSED |
| 688 | **CanvasConfettiEngine** | Center position on burst | Particles tại canvas center | 🟢 PASSED |
| 689 | **CanvasConfettiEngine** | clearRect in tick | ctx.clearRect gọi đúng | 🟢 PASSED |
| 690 | **CanvasConfettiEngine** | Gravity moves particles | Vị trí thay đổi sau tick | 🟢 PASSED |
| 691 | **CanvasConfettiEngine** | Remove off-screen particles | 500 ticks → 0 particles | 🟢 PASSED |
| 692 | **CanvasConfettiEngine** | Active status reporting | false → burst → true | 🟢 PASSED |
| 693 | **CanvasConfettiEngine** | No duplicate animation | Không gọi rAF lần 2 | 🟢 PASSED |
| 694 | **GamificationStore** | Default XP = 0 | currentXP = 0 | 🟢 PASSED |
| 695 | **GamificationStore** | Default streak = 0 | activeStreak = 0 | 🟢 PASSED |
| 696 | **GamificationStore** | Empty unlocked badges | unlockedBadges = [] | 🟢 PASSED |
| 697 | **GamificationStore** | Confetti disabled initially | showConfetti = false | 🟢 PASSED |
| 698 | **GamificationStore** | Default leaderboard rank | leaderboardRank = 0 | 🟢 PASSED |
| 699 | **GamificationStore** | Default streak freezes | streakFreezesCount = 2 | 🟢 PASSED |
| 700 | **GamificationStore** | Empty leaderboard data | leaderboardData = [] | 🟢 PASSED |
| 701 | **GamificationStore** | Empty lastActiveDate | lastActiveDate = '' | 🟢 PASSED |
| 702 | **GamificationStore** | earnXPLocal adds XP | +100 → currentXP = 100 | 🟢 PASSED |
| 703 | **GamificationStore** | Accumulate XP | +100 +50 → 150 | 🟢 PASSED |
| 704 | **GamificationStore** | Reject XP > MAX | +300 → currentXP = 0 | 🟢 PASSED |
| 705 | **GamificationStore** | Reject zero XP | +0 → currentXP = 0 | 🟢 PASSED |
| 706 | **GamificationStore** | Reject negative XP | -50 → currentXP = 0 | 🟢 PASSED |
| 707 | **GamificationStore** | Update streak on first activity | +50 → streak ≥ 1 | 🟢 PASSED |
| 708 | **GamificationStore** | Confetti trigger | triggerConfettiRain → true | 🟢 PASSED |
| 709 | **GamificationStore** | Confetti auto-clear 4s | 4000ms → false | 🟢 PASSED |
| 710 | **GamificationStore** | Confetti active before 4s | 3999ms → true | 🟢 PASSED |
| 711 | **GamificationStore** | Streak freeze decrement | useStreakFreeze → count - 1 | 🟢 PASSED |
| 712 | **GamificationStore** | Streak freeze floor 0 | 3x calls → 0 | 🟢 PASSED |
| 713 | **GamificationStore** | Freeze returns true if available | return true | 🟢 PASSED |
| 714 | **GamificationStore** | Freeze returns false if empty | return false | 🟢 PASSED |
| 715 | **GamificationStore** | Badge unlock on threshold | 400 XP + 3 streak → unlock | 🟢 PASSED |
| 716 | **GamificationStore** | Confetti on badge unlock | Unlock → confetti = true | 🟢 PASSED |
| 717 | **GamificationStore** | No re-unlock | 2x check → same count | 🟢 PASSED |
| 718 | **GamificationStore** | Set leaderboard data | setLeaderboardData → stored | 🟢 PASSED |
| 719 | **GamificationStore** | Sort leaderboard by rank | Unsorted → sorted by rank | 🟢 PASSED |
| 720 | **GamificationStore** | Limit leaderboard to top 10 | 15 entries → 10 stored | 🟢 PASSED |
| 721 | **GamificationStore** | allBadges computed | ≥5 badge templates | 🟢 PASSED |
| 722 | **GamificationStore** | xpProgressPercent computed | >0 after earning XP | 🟢 PASSED |
| 723 | **GamificationStore** | nextBadgeXPThreshold computed | >0 | 🟢 PASSED |
| 724 | **GamificationStore** | lockedBadges computed | All badges locked initially | 🟢 PASSED |
| 725 | **GamificationStore** | streakStatus computed | inactive → active after XP | 🟢 PASSED |

### Phase 2 Learning Path Skill Tree — PrerequisiteDAGEngine, PersonalizedPathEvaluator, LaserBatchRenderer, OfflineProgressSynchronizer, useLearningPathStore (98 tests)

| STT | Phân hệ kiểm thử | Tính năng hạt nhân được xác thực | Phương thức kiểm tra (Test Spec) | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| 726 | **DAGEngine** | Unlock QuickSort when BubbleSort COMPLETED | Giải DAG → quicksort UNLOCKED | 🟢 PASSED |
| 727 | **DAGEngine** | Keep nodes LOCKED without prerequisites | Empty completed → all LOCKED | 🟢 PASSED |
| 728 | **DAGEngine** | Auto-unlock nodes with no prerequisites | No prereqs + LOCKED → UNLOCKED | 🟢 PASSED |
| 729 | **DAGEngine** | Preserve IN_PROGRESS status | IN_PROGRESS giữ nguyên | 🟢 PASSED |
| 730 | **DAGEngine** | Mark all COMPLETED | All in Set → all COMPLETED | 🟢 PASSED |
| 731 | **DAGEngine** | Chain unlock bubble→quick→tree | 2 completed → tree UNLOCKED | 🟢 PASSED |
| 732 | **DAGEngine** | Multiple prereqs require ALL | Partial → LOCKED, Full → UNLOCKED | 🟢 PASSED |
| 733 | **DAGEngine** | Empty nodes array | [] → [] | 🟢 PASSED |
| 734 | **DAGEngine** | Immutability (no mutation) | Original array unchanged | 🟢 PASSED |
| 735 | **DAGEngine** | Preserve IN_PROGRESS with met prereqs | IN_PROGRESS + prereqs met → IN_PROGRESS | 🟢 PASSED |
| 736 | **DAGEngine** | No cycle in valid DAG | Linear chain → false | 🟢 PASSED |
| 737 | **DAGEngine** | Detect cycle A→B→C→A | Circular → true | 🟢 PASSED |
| 738 | **DAGEngine** | No cycle single node | 1 node → false | 🟢 PASSED |
| 739 | **DAGEngine** | No cycle empty graph | [] → false | 🟢 PASSED |
| 740 | **DAGEngine** | No cycle disconnected nodes | 3 isolated → false | 🟢 PASSED |
| 741 | **DAGEngine** | Topological order linear | bubble < quick < tree < solid | 🟢 PASSED |
| 742 | **DAGEngine** | Topo roots first | No prereqs before dependents | 🟢 PASSED |
| 743 | **DAGEngine** | Topo empty input | [] → [] | 🟢 PASSED |
| 744 | **DAGEngine** | Topo no edges | All nodes present | 🟢 PASSED |
| 745 | **Evaluator** | Recommend review when <70% | 65% → recommend bubble-sort | 🟢 PASSED |
| 746 | **Evaluator** | Recommend next UNLOCKED | All pass → recommend quicksort | 🟢 PASSED |
| 747 | **Evaluator** | Congratulate all completed | No UNLOCKED → Chúc mừng | 🟢 PASSED |
| 748 | **Evaluator** | Prioritize weak over advance | 50% → review over next | 🟢 PASSED |
| 749 | **Evaluator** | Handle empty scores | No scores → first UNLOCKED | 🟢 PASSED |
| 750 | **Evaluator** | Handle empty nodes | [] → empty + Chúc mừng | 🟢 PASSED |
| 751 | **Evaluator** | 70% is passing | 70% → advance | 🟢 PASSED |
| 752 | **Evaluator** | 69% is failing | 69% → review | 🟢 PASSED |
| 753 | **Evaluator** | Find first weak score | Multiple scores → first weak | 🟢 PASSED |
| 754 | **Evaluator** | Completion % empty | [] → 0% | 🟢 PASSED |
| 755 | **Evaluator** | Completion % 100% | All COMPLETED → 100% | 🟢 PASSED |
| 756 | **Evaluator** | Completion % 50% | Half → 50% | 🟢 PASSED |
| 757 | **Evaluator** | Completion % 25% | 1/4 → 25% | 🟢 PASSED |
| 758 | **Evaluator** | Average score empty | [] → 0 | 🟢 PASSED |
| 759 | **Evaluator** | Average score single | 85 → 85 | 🟢 PASSED |
| 760 | **Evaluator** | Average score multiple | 80+60 → 70 | 🟢 PASSED |
| 761 | **Evaluator** | isPassingScore true | ≥70 → true | 🟢 PASSED |
| 762 | **Evaluator** | isPassingScore false | <70 → false | 🟢 PASSED |
| 763 | **LaserRenderer** | Valid SVG bezier path | (100,200)→(300,400) → correct path | 🟢 PASSED |
| 764 | **LaserRenderer** | Same start/end point | (50,50) → same coords | 🟢 PASSED |
| 765 | **LaserRenderer** | Negative coordinates | (-100,-50)→(100,50) → valid | 🟢 PASSED |
| 766 | **LaserRenderer** | Control point midpoint | (0,0)→(200,100) → controlX=100 | 🟢 PASSED |
| 767 | **LaserRenderer** | Zero coordinates | (0,0)→(0,0) → valid | 🟢 PASSED |
| 768 | **LaserRenderer** | rAF callback execution | requestAnimationFrame called | 🟢 PASSED |
| 769 | **LaserRenderer** | Coalesce multiple requests | 2 calls → 1 rAF | 🟢 PASSED |
| 770 | **LaserRenderer** | New render after frame | After complete → re-schedule | 🟢 PASSED |
| 771 | **LaserRenderer** | Element center calculation | rect + scroll → center point | 🟢 PASSED |
| 772 | **LaserRenderer** | Zero scroll offset center | No scroll → center | 🟢 PASSED |
| 773 | **LaserRenderer** | Bridge distance threshold | >20px → true | 🟢 PASSED |
| 774 | **LaserRenderer** | Bridge too close | <20px → false | 🟢 PASSED |
| 775 | **LaserRenderer** | Bridge exact minimum | =20px → true | 🟢 PASSED |
| 776 | **LaserRenderer** | Custom min distance | Custom threshold | 🟢 PASSED |
| 777 | **LaserRenderer** | Same point no render | 0 distance → false | 🟢 PASSED |
| 778 | **LaserRenderer** | Reset allows re-schedule | Reset → new rAF | 🟢 PASSED |
| 779 | **OfflineSync** | Save completed to localStorage | setItem called | 🟢 PASSED |
| 780 | **OfflineSync** | Save scores to localStorage | JSON serialization | 🟢 PASSED |
| 781 | **OfflineSync** | Save timestamp | Date.now stored | 🟢 PASSED |
| 782 | **OfflineSync** | Handle quota exceeded | Graceful warn | 🟢 PASSED |
| 783 | **OfflineSync** | Load saved data | Parse JSON → data | 🟢 PASSED |
| 784 | **OfflineSync** | Return null when no data | null | 🟢 PASSED |
| 785 | **OfflineSync** | Null without scores | Partial → null | 🟢 PASSED |
| 786 | **OfflineSync** | Missing timestamp default 0 | No timestamp → 0 | 🟢 PASSED |
| 787 | **OfflineSync** | Handle corrupted JSON | Parse error → null | 🟢 PASSED |
| 788 | **OfflineSync** | Clear all keys | 3 removeItem calls | 🟢 PASSED |
| 789 | **OfflineSync** | Has saved progress true | Data exists → true | 🟢 PASSED |
| 790 | **OfflineSync** | Has saved progress false | No data → false | 🟢 PASSED |
| 791 | **OfflineSync** | Debounced sync success | syncing → synced | 🟢 PASSED |
| 792 | **OfflineSync** | Debounced sync error | syncing → error | 🟢 PASSED |
| 793 | **OfflineSync** | Debounce coalescing | Multiple → 1 fetch | 🟢 PASSED |
| 794 | **OfflineSync** | Cancel pending sync | No fetch after cancel | 🟢 PASSED |
| 795 | **LearningPathStore** | 4 default nodes | rawNodes.length = 4 | 🟢 PASSED |
| 796 | **LearningPathStore** | Bubble-sort pre-completed | completedNodeIds has bubble | 🟢 PASSED |
| 797 | **LearningPathStore** | Active node quicksort | activeNodeId = 'quicksort' | 🟢 PASSED |
| 798 | **LearningPathStore** | Initial score history | 1 score entry | 🟢 PASSED |
| 799 | **LearningPathStore** | Resolved bubble = COMPLETED | DAG computed | 🟢 PASSED |
| 800 | **LearningPathStore** | Resolved quicksort = UNLOCKED | Prereq met | 🟢 PASSED |
| 801 | **LearningPathStore** | Resolved tree = LOCKED | Prereq not met | 🟢 PASSED |
| 802 | **LearningPathStore** | Resolved solid = LOCKED | Chain blocked | 🟢 PASSED |
| 803 | **LearningPathStore** | AI recommends quicksort | Next UNLOCKED | 🟢 PASSED |
| 804 | **LearningPathStore** | AI review on low score | <70% → review | 🟢 PASSED |
| 805 | **LearningPathStore** | 25% completion | 1/4 nodes | 🟢 PASSED |
| 806 | **LearningPathStore** | 50% after 2nd complete | 2/4 nodes | 🟢 PASSED |
| 807 | **LearningPathStore** | Average score 85 | Initial score | 🟢 PASSED |
| 808 | **LearningPathStore** | completeNode adds to set | quicksort in set | 🟢 PASSED |
| 809 | **LearningPathStore** | completeNode adds score | Score entry created | 🟢 PASSED |
| 810 | **LearningPathStore** | Chain unlock tree | Complete quick → tree UNLOCKED | 🟢 PASSED |
| 811 | **LearningPathStore** | Save to localStorage | setItem called | 🟢 PASSED |
| 812 | **LearningPathStore** | Server sync attempt | fetch called | 🟢 PASSED |
| 813 | **LearningPathStore** | Graceful sync failure | No throw on error | 🟢 PASSED |
| 814 | **LearningPathStore** | setActiveNode | Update activeNodeId | 🟢 PASSED |
| 815 | **LearningPathStore** | Load from localStorage | Restore completed + scores | 🟢 PASSED |
| 816 | **LearningPathStore** | No crash on empty load | No throw | 🟢 PASSED |
| 817 | **LearningPathStore** | Reset progress | Empty state + clear storage | 🟢 PASSED |
| 818 | **LearningPathStore** | Reset clears localStorage | removeItem called | 🟢 PASSED |
| 819 | **LearningPathStore** | Node positions generated | 4 positions | 🟢 PASSED |
| 820 | **LearningPathStore** | Positions have x/y | Valid coordinates | 🟢 PASSED |
| 821 | **LearningPathStore** | Laser bridges from prereqs | >0 bridges | 🟢 PASSED |
| 822 | **LearningPathStore** | Active bridge completed source | bubble→quick isActive | 🟢 PASSED |
| 823 | **LearningPathStore** | Inactive bridge incomplete | quick→tree !isActive | 🟢 PASSED |

### Phase 2 Multi-View Synchronization — MultiViewEventBus, SynchronizedTimelineManager, ThrottledDragCoordinator, useMultiViewStore (102 tests)

| STT | Phân hệ kiểm thử | Tính năng hạt nhân được xác thực | Phương thức kiểm tra (Test Spec) | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| 824 | **EventBus** | Register listener for viewId | getListenerCount() === 1 | 🟢 PASSED |
| 825 | **EventBus** | Multiple listeners same viewId | getListenerCount() === 2 | 🟢 PASSED |
| 826 | **EventBus** | Listeners for different viewIds | getListenerCount() === 3 | 🟢 PASSED |
| 827 | **EventBus** | Track registered view IDs | getRegisteredViewIds contains IDs | 🟢 PASSED |
| 828 | **EventBus** | Dispatch to all callbacks | Both callbacks called with step | 🟢 PASSED |
| 829 | **EventBus** | Dispatch to multiple on same view | Both callbacks invoked once | 🟢 PASSED |
| 830 | **EventBus** | Dispatch <1ms to 3 panels | elapsed < 1.0, 3 received | 🟢 PASSED |
| 831 | **EventBus** | Elapsed returns number | typeof elapsed === 'number' | 🟢 PASSED |
| 832 | **EventBus** | No listeners returns ~0ms | elapsed < 1.0 | 🟢 PASSED |
| 833 | **EventBus** | Correct memoryStateSnapshot | snapshot matches dispatch | 🟢 PASSED |
| 834 | **EventBus** | Correct activeFlowchartNodeId | nodeId matches dispatch | 🟢 PASSED |
| 835 | **EventBus** | Unsubscribe specific viewId | Count decrements, ID removed | 🟢 PASSED |
| 836 | **EventBus** | Unsubscribe non-existent safe | No throw | 🟢 PASSED |
| 837 | **EventBus** | UnsubscribeAll clears all | Count === 0, no IDs | 🟢 PASSED |
| 838 | **EventBus** | Subscribe after clear works | Count === 1 after re-subscribe | 🟢 PASSED |
| 839 | **EventBus** | getListenerCount 0 when empty | Returns 0 | 🟢 PASSED |
| 840 | **EventBus** | Count across multiple viewIds | Correct aggregate count | 🟢 PASSED |
| 841 | **EventBus** | 100 rapid dispatches <1ms each | All elapsed < 1.0 | 🟢 PASSED |
| 842 | **EventBus** | Dispatch with correct step | Callback receives exact step | 🟢 PASSED |
| 843 | **EventBus** | Dispatch returns elapsed time | Non-negative number | 🟢 PASSED |
| 844 | **TimelineManager** | Init at step index 0 | getCurrentStepIndex() === 0 | 🟢 PASSED |
| 845 | **TimelineManager** | Store total steps | getTotalSteps() === 10 | 🟢 PASSED |
| 846 | **TimelineManager** | Empty steps returns null | getCurrentStep() === null | 🟢 PASSED |
| 847 | **TimelineManager** | Seek valid index success | result.success === true, index updated | 🟢 PASSED |
| 848 | **TimelineManager** | Dispatch correct step on seek | Callback receives steps[2] | 🟢 PASSED |
| 849 | **TimelineManager** | Seek <1ms to 2+ panels | result.elapsedMs < 1.0 | 🟢 PASSED |
| 850 | **TimelineManager** | Prevent negative index | success false, position unchanged | 🟢 PASSED |
| 851 | **TimelineManager** | Prevent beyond total | success false, position unchanged | 🟢 PASSED |
| 852 | **TimelineManager** | Prevent large out-of-bounds | success false, index stays 0 | 🟢 PASSED |
| 853 | **TimelineManager** | Seek to index 0 | success true, index 0 | 🟢 PASSED |
| 854 | **TimelineManager** | Seek to last valid index | success true, index N-1 | 🟢 PASSED |
| 855 | **TimelineManager** | Position unchanged on failed seek | Index preserved after invalid seek | 🟢 PASSED |
| 856 | **TimelineManager** | stepNext advances by 1 | Index increments | 🟢 PASSED |
| 857 | **TimelineManager** | stepNext fails at end | success false, index stays | 🟢 PASSED |
| 858 | **TimelineManager** | Sequential stepNext through all | All succeed until end | 🟢 PASSED |
| 859 | **TimelineManager** | stepPrev goes back by 1 | Index decrements | 🟢 PASSED |
| 860 | **TimelineManager** | stepPrev fails at start | success false, index stays 0 | 🟢 PASSED |
| 861 | **TimelineManager** | getCurrentStep data correct | Returns steps[index] | 🟢 PASSED |
| 862 | **TimelineManager** | isAtStart true at 0 | Returns true | 🟢 PASSED |
| 863 | **TimelineManager** | isAtStart false after step | Returns false | 🟢 PASSED |
| 864 | **TimelineManager** | isAtEnd true at last | Returns true | 🟢 PASSED |
| 865 | **TimelineManager** | isAtEnd false at start | Returns false | 🟢 PASSED |
| 866 | **DragCoordinator** | Clamp 50% within bounds | Returns 50 | 🟢 PASSED |
| 867 | **DragCoordinator** | Clamp to min 15% | Values 10, 0, -5 → 15 | 🟢 PASSED |
| 868 | **DragCoordinator** | Clamp to max 85% | Values 90, 100, 150 → 85 | 🟢 PASSED |
| 869 | **DragCoordinator** | Exact boundary 15% | Returns 15 | 🟢 PASSED |
| 870 | **DragCoordinator** | Exact boundary 85% | Returns 85 | 🟢 PASSED |
| 871 | **DragCoordinator** | Fractional within range | 33.33 → 33.33 | 🟢 PASSED |
| 872 | **DragCoordinator** | Fractional below min | 14.99 → 15 | 🟢 PASSED |
| 873 | **DragCoordinator** | Fractional above max | 85.01 → 85 | 🟢 PASSED |
| 874 | **DragCoordinator** | Custom bounds 20-80 | Clamp correctly | 🟢 PASSED |
| 875 | **DragCoordinator** | Not dragging initially | isDragging false | 🟢 PASSED |
| 876 | **DragCoordinator** | Not dragging after destroy | isDragging false | 🟢 PASSED |
| 877 | **DragCoordinator** | Formula center 50% | 500/1000 * 100 = 50 | 🟢 PASSED |
| 878 | **DragCoordinator** | Formula quarter 25% | 200/800 * 100 = 25 | 🟢 PASSED |
| 879 | **DragCoordinator** | Formula clamp low 5%→15% | 50/1000 * 100 → 15 | 🟢 PASSED |
| 880 | **DragCoordinator** | Formula clamp high 95%→85% | 950/1000 * 100 → 85 | 🟢 PASSED |
| 881 | **MultiViewStore** | Default panels code+svg | ['code-editor', 'svg-visualizer'] | 🟢 PASSED |
| 882 | **MultiViewStore** | Default two-panel layout | paneLayout === 'two-panel' | 🟢 PASSED |
| 883 | **MultiViewStore** | Default 50% left pane | leftPanePercent === 50 | 🟢 PASSED |
| 884 | **MultiViewStore** | Default speed 1x | playbackSpeed === 1 | 🟢 PASSED |
| 885 | **MultiViewStore** | Not playing initially | isPlaying === false | 🟢 PASSED |
| 886 | **MultiViewStore** | Zero steps initially | totalStepsCount === 0 | 🟢 PASSED |
| 887 | **MultiViewStore** | 0% progress initially | progressPercent === 0 | 🟢 PASSED |
| 888 | **MultiViewStore** | Null currentStep initially | currentStep === null | 🟢 PASSED |
| 889 | **MultiViewStore** | Not dragging initially | isDraggingSplitter === false | 🟢 PASSED |
| 890 | **MultiViewStore** | initializeTimeline loads steps | totalStepsCount updated | 🟢 PASSED |
| 891 | **MultiViewStore** | initializeTimeline resets index | currentStepIndex === 0 | 🟢 PASSED |
| 892 | **MultiViewStore** | initializeTimeline sets currentStep | currentStep matches step[0] | 🟢 PASSED |
| 893 | **MultiViewStore** | initializeDemoTimeline loads | totalStepsCount > 0 | 🟢 PASSED |
| 894 | **MultiViewStore** | Demo starts at step 0 | currentStepIndex === 0 | 🟢 PASSED |
| 895 | **MultiViewStore** | seekToStep valid index | currentStepIndex updated | 🟢 PASSED |
| 896 | **MultiViewStore** | seekToStep negative blocked | Index unchanged | 🟢 PASSED |
| 897 | **MultiViewStore** | seekToStep beyond total blocked | Index unchanged | 🟢 PASSED |
| 898 | **MultiViewStore** | seekToStep updates currentStep | currentStep matches step[index] | 🟢 PASSED |
| 899 | **MultiViewStore** | seekToStep no-op without init | Index stays 0 | 🟢 PASSED |
| 900 | **MultiViewStore** | stepNext advances | Index increments by 1 | 🟢 PASSED |
| 901 | **MultiViewStore** | stepPrev decrements | Index decrements by 1 | 🟢 PASSED |
| 902 | **MultiViewStore** | stepPrev blocked at 0 | Index stays 0 | 🟢 PASSED |
| 903 | **MultiViewStore** | stepNext blocked at end | Index stays at last | 🟢 PASSED |
| 904 | **MultiViewStore** | progressPercent 0% at start | 0 | 🟢 PASSED |
| 905 | **MultiViewStore** | progressPercent 100% at end | 100 | 🟢 PASSED |
| 906 | **MultiViewStore** | progressPercent 50% at middle | 50 | 🟢 PASSED |
| 907 | **MultiViewStore** | isAtStart true at 0 | true | 🟢 PASSED |
| 908 | **MultiViewStore** | isAtStart false after step | false | 🟢 PASSED |
| 909 | **MultiViewStore** | isAtEnd true at last | true | 🟢 PASSED |
| 910 | **MultiViewStore** | isAtEnd false at start | false | 🟢 PASSED |
| 911 | **MultiViewStore** | togglePlayback toggles | false → true → false | 🟢 PASSED |
| 912 | **MultiViewStore** | Playback 1x advances at 1000ms | Index increments per interval | 🟢 PASSED |
| 913 | **MultiViewStore** | Auto-stop at last step | isPlaying → false at end | 🟢 PASSED |
| 914 | **MultiViewStore** | Playback 2x at 500ms intervals | Faster advancement | 🟢 PASSED |
| 915 | **MultiViewStore** | Playback 0.5x at 2000ms | Slower advancement | 🟢 PASSED |
| 916 | **MultiViewStore** | setPlaybackSpeed updates | playbackSpeed === 4 | 🟢 PASSED |
| 917 | **MultiViewStore** | Speed change restarts loop | Continues at new rate | 🟢 PASSED |
| 918 | **MultiViewStore** | setLeftPanePercent + right | left 30, right 70 | 🟢 PASSED |
| 919 | **MultiViewStore** | rightPanePercent computed | 100 - left | 🟢 PASSED |
| 920 | **MultiViewStore** | toggleLayout 2↔3 panel | Switches + updates panels | 🟢 PASSED |
| 921 | **MultiViewStore** | toggleLayout resets pane to 50% | leftPanePercent → 50 | 🟢 PASSED |
| 922 | **MultiViewStore** | setDraggingSplitter | true ↔ false | 🟢 PASSED |
| 923 | **MultiViewStore** | resetToDefaults all values | All state → initial | 🟢 PASSED |
| 924 | **MultiViewStore** | resetToDefaults stops playback | isPlaying → false | 🟢 PASSED |
| 925 | **MultiViewStore** | destroyStore clears bus | Listeners cleared, stopped | 🟢 PASSED |

### Phase 2 OOP Concepts Visualizer — OOPReflectionEngine, SVGLaserBatchRenderer, useOOPVisualizerStore (59 tests)

| STT | Phân hệ kiểm thử | Tính năng hạt nhân được xác thực | Phương thức kiểm tra (Test Spec) | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| 926 | **ReflectionEngine** | Register class and retrieve | getClass('Shape') equals classDef | 🟢 PASSED |
| 927 | **ReflectionEngine** | Register multiple classes | getAllClasses().length === 2 | 🟢 PASSED |
| 928 | **ReflectionEngine** | Reject inheritance depth > 5 | Throws KẾ THỪA QUÁ SÂU | 🟢 PASSED |
| 929 | **ReflectionEngine** | Throw for unregistered class | Throws chưa được đăng ký | 🟢 PASSED |
| 930 | **ReflectionEngine** | Heap object has hex address | address matches /^0x[0-9A-F]{6}$/ | 🟢 PASSED |
| 931 | **ReflectionEngine** | Address increment by 16 | addr2 - addr1 === 16 | 🟢 PASSED |
| 932 | **ReflectionEngine** | MAX_HEAP_OBJECTS (10) limit | Throws HEAP OVERFLOW | 🟢 PASSED |
| 933 | **ReflectionEngine** | Fields from inheritance chain | fieldsData has baseField + childField | 🟢 PASSED |
| 934 | **ReflectionEngine** | VTable override Circle.draw | vTable.get('draw') === 'Circle' | 🟢 PASSED |
| 935 | **ReflectionEngine** | Inherited method resolves parent | vTable.get('toString') === 'Shape' | 🟢 PASSED |
| 936 | **ReflectionEngine** | Dispatch returns dispatch path | resolvedClass 'Circle', isOverridden true | 🟢 PASSED |
| 937 | **ReflectionEngine** | Dispatch non-existent returns null | null | 🟢 PASSED |
| 938 | **ReflectionEngine** | 3-level VTable (Puppy) | speak → Puppy, move → Animal | 🟢 PASSED |
| 939 | **ReflectionEngine** | PUBLIC access from any class | hasAccess true, modifier PUBLIC | 🟢 PASSED |
| 940 | **ReflectionEngine** | PRIVATE rejected externally | hasAccess false, ENCAPSULATION_ERROR | 🟢 PASSED |
| 941 | **ReflectionEngine** | PRIVATE allowed same class | hasAccess true | 🟢 PASSED |
| 942 | **ReflectionEngine** | PROTECTED allowed subclass | hasAccess true | 🟢 PASSED |
| 943 | **ReflectionEngine** | PROTECTED rejected unrelated | hasAccess false, ENCAPSULATION_ERROR | 🟢 PASSED |
| 944 | **ReflectionEngine** | Reject non-existent class access | hasAccess false | 🟢 PASSED |
| 945 | **ReflectionEngine** | Reject non-existent member access | hasAccess false | 🟢 PASSED |
| 946 | **ReflectionEngine** | 3-level inheritance chain | ['A', 'B', 'C'] | 🟢 PASSED |
| 947 | **ReflectionEngine** | Single class chain | ['Root'] | 🟢 PASSED |
| 948 | **ReflectionEngine** | Unknown class empty chain | [] | 🟢 PASSED |
| 949 | **ReflectionEngine** | Remove instance by address | heapInstanceCount 1 → 0 | 🟢 PASSED |
| 950 | **ReflectionEngine** | Remove non-existent returns false | false | 🟢 PASSED |
| 951 | **ReflectionEngine** | Clear registry resets all | 0 classes, 0 instances | 🟢 PASSED |
| 952 | **ReflectionEngine** | Clear resets address offset | addr === 0x310000 | 🟢 PASSED |
| 953 | **LaserRenderer** | Valid SVG cubic bezier path | Contains M, C, coords | 🟢 PASSED |
| 954 | **LaserRenderer** | Control point at midpoint X | Contains C 100 0 | 🟢 PASSED |
| 955 | **LaserRenderer** | Dispatch path source→pivot→target | Contains all 3 coords | 🟢 PASSED |
| 956 | **LaserRenderer** | Linear path straight line | 'M 5 10 L 50 60' | 🟢 PASSED |
| 957 | **LaserRenderer** | SSR-safe getDOMElementCenter | {x:0, y:0} | 🟢 PASSED |
| 958 | **LaserRenderer** | Batch render on rAF | fn1, fn2 called once each | 🟢 PASSED |
| 959 | **LaserRenderer** | Destroy cleans pending rAF | fn not called | 🟢 PASSED |
| 960 | **OOPStore** | Init 2 demo classes | registeredClasses.length === 2 | 🟢 PASSED |
| 961 | **OOPStore** | Allocate heap object address | matches /^0x[0-9A-F]+$/ | 🟢 PASSED |
| 962 | **OOPStore** | Unregistered class returns '' | '' | 🟢 PASSED |
| 963 | **OOPStore** | Address increment 16 | diff === 16 | 🟢 PASSED |
| 964 | **OOPStore** | canAllocate false at max | false | 🟢 PASSED |
| 965 | **OOPStore** | Remove heap object | heapObjectCount 1 → 0 | 🟢 PASSED |
| 966 | **OOPStore** | Dispatch SEEKING_VTABLE immediately | dispatchStatus === 'SEEKING_VTABLE' | 🟢 PASSED |
| 967 | **OOPStore** | Dispatch DISPATCHED after 800ms | resolvedClass === 'Circle' | 🟢 PASSED |
| 968 | **OOPStore** | Updates selectedMethodCall | 'Circle.area' | 🟢 PASSED |
| 969 | **OOPStore** | Inherited method resolves parent | resolvedClass === 'Shape' | 🟢 PASSED |
| 970 | **OOPStore** | PRIVATE violation sets error | lastEncapsulationViolation not null | 🟢 PASSED |
| 971 | **OOPStore** | Violation auto-clears 2000ms | lastEncapsulationViolation null | 🟢 PASSED |
| 972 | **OOPStore** | PUBLIC access returns true | true, no violation | 🟢 PASSED |
| 973 | **OOPStore** | PROTECTED from subclass true | true | 🟢 PASSED |
| 974 | **OOPStore** | PROTECTED from unrelated false | false, isViolated true | 🟢 PASSED |
| 975 | **OOPStore** | selectClass updates name | 'Shape' | 🟢 PASSED |
| 976 | **OOPStore** | VTable entries for selected class | draw → Circle, isOverridden true | 🟢 PASSED |
| 977 | **OOPStore** | VTable empty no matching heap | [] | 🟢 PASSED |
| 978 | **OOPStore** | resetAll clears everything | 0 classes, 0 objects, null violation | 🟢 PASSED |
| 979 | **OOPStore** | resetDispatchState keeps data | IDLE, classes=2, heap=1 | 🟢 PASSED |


### Phase 2 Smart Interactive Quiz Widget — VCRPlaybackInterceptor, SVGTargetResolver, QuizEvaluationEngine, useSmartQuizStore (90 tests)

| STT | Phân hệ kiểm thử | Tính năng hạt nhân được xác thực | Kết quả kỳ vọng | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| 980 | **VCRInterceptor** | Not intercept non-quiz steps | false, callback not called | 🟢 PASSED |
| 981 | **VCRInterceptor** | Intercept step 8 trigger quiz | true, callback with quiz | 🟢 PASSED |
| 982 | **VCRInterceptor** | Intercept step 15 trigger quiz | true, callback with quizAtStep15 | 🟢 PASSED |
| 983 | **VCRInterceptor** | Remove quiz after trigger | false on second intercept | 🟢 PASSED |
| 984 | **VCRInterceptor** | Other quizzes still work after one consumed | true for step 15 | 🟢 PASSED |
| 985 | **VCRInterceptor** | Register new quiz at step 20 | true, callback with newQuiz | 🟢 PASSED |
| 986 | **VCRInterceptor** | Remove specific quiz by step | true, then false on intercept | 🟢 PASSED |
| 987 | **VCRInterceptor** | Return false removing non-existent | false | 🟢 PASSED |
| 988 | **VCRInterceptor** | Clear all quizzes | count=0, all intercepts false | 🟢 PASSED |
| 989 | **VCRInterceptor** | Check quiz exists at step | true for 8,15; false for 999 | 🟢 PASSED |
| 990 | **VCRInterceptor** | Active quiz count tracks | 2→1→0 | 🟢 PASSED |
| 991 | **VCRInterceptor** | Sorted registered step indices | [8, 15] | 🟢 PASSED |
| 992 | **VCRInterceptor** | Empty constructor | count=0, intercept false | 🟢 PASSED |
| 993 | **VCRInterceptor** | Step index 0 | true, callback called | 🟢 PASSED |
| 994 | **VCRInterceptor** | Negative step indices | false | 🟢 PASSED |
| 995 | **VCRInterceptor** | Override quiz at same step | callback with override quiz | 🟢 PASSED |
| 996 | **SVGResolver** | Resolve data-node-id from element | 'node-bar-3' | 🟢 PASSED |
| 997 | **SVGResolver** | Walk up DOM tree closest | 'node-bar-5' | 🟢 PASSED |
| 998 | **SVGResolver** | Return null no interactive parent | null | 🟢 PASSED |
| 999 | **SVGResolver** | Return null when target null | null | 🟢 PASSED |
| 1000 | **SVGResolver** | Exact match correct answers | isCorrect=true, missing=[], extra=[] | 🟢 PASSED |
| 1001 | **SVGResolver** | Correct regardless of order | isCorrect=true | 🟢 PASSED |
| 1002 | **SVGResolver** | Identify missing answers | missing=['node-bar-5'] | 🟢 PASSED |
| 1003 | **SVGResolver** | Identify extra wrong answers | extra=['node-bar-8'] | 🟢 PASSED |
| 1004 | **SVGResolver** | Completely wrong answers | missing=2, extra=2 | 🟢 PASSED |
| 1005 | **SVGResolver** | Empty selected answers | missing=2 | 🟢 PASSED |
| 1006 | **SVGResolver** | Empty correct answers | extra=1 | 🟢 PASSED |
| 1007 | **SVGResolver** | Single answer match | isCorrect=true | 🟢 PASSED |
| 1008 | **QuizEngine** | 100% all correct | isCorrect=true, score=100, match=2 | 🟢 PASSED |
| 1009 | **QuizEngine** | 50% half correct | isCorrect=false, score=50, match=1 | 🟢 PASSED |
| 1010 | **QuizEngine** | 0% no correct | isCorrect=false, score=0, match=0 | 🟢 PASSED |
| 1011 | **QuizEngine** | 0% empty selected | score=0 | 🟢 PASSED |
| 1012 | **QuizEngine** | 0% empty correct | score=0 | 🟢 PASSED |
| 1013 | **QuizEngine** | 0% both empty | score=0 | 🟢 PASSED |
| 1014 | **QuizEngine** | Single correct answer | isCorrect=true, score=100 | 🟢 PASSED |
| 1015 | **QuizEngine** | Extra answers not correct | isCorrect=false, score=100, match=2 | 🟢 PASSED |
| 1016 | **QuizEngine** | Duplicates via Set | match=1 | 🟢 PASSED |
| 1017 | **QuizEngine** | 1/3 correct → 33% | score=33, match=1 | 🟢 PASSED |
| 1018 | **QuizEngine** | 2/3 correct → 67% | score=67, match=2 | 🟢 PASSED |
| 1019 | **QuizEngine** | Validate XP 1-200 | true | 🟢 PASSED |
| 1020 | **QuizEngine** | Reject XP 0 | false | 🟢 PASSED |
| 1021 | **QuizEngine** | Reject negative XP | false | 🟢 PASSED |
| 1022 | **QuizEngine** | Reject XP > 200 | false | 🟢 PASSED |
| 1023 | **QuizEngine** | Reject non-integer XP | false | 🟢 PASSED |
| 1024 | **QuizEngine** | Full XP first attempt | 30 | 🟢 PASSED |
| 1025 | **QuizEngine** | 0 XP second attempt | 0 | 🟢 PASSED |
| 1026 | **QuizEngine** | 0 XP third attempt | 0 | 🟢 PASSED |
| 1027 | **QuizEngine** | 0 XP invalid attempt | 0 | 🟢 PASSED |
| 1028 | **QuizEngine** | 0 XP invalid base | 0 | 🟢 PASSED |
| 1029 | **QuizStore** | Initial null active quiz | null | 🟢 PASSED |
| 1030 | **QuizStore** | Initial HIDDEN overlay | 'HIDDEN' | 🟢 PASSED |
| 1031 | **QuizStore** | Initial empty answers | [] | 🟢 PASSED |
| 1032 | **QuizStore** | Initial not visible | false | 🟢 PASSED |
| 1033 | **QuizStore** | Initial zero stats | 0/0/0 | 🟢 PASSED |
| 1034 | **QuizStore** | Initial VCR not locked | false | 🟢 PASSED |
| 1035 | **QuizStore** | TriggerQuiz sets active + SLIDE_IN | quiz set, visible=true | 🟢 PASSED |
| 1036 | **QuizStore** | TriggerQuiz locks VCR | isVCRLocked=true | 🟢 PASSED |
| 1037 | **QuizStore** | TriggerQuiz resets selections | answers=[], hasSubmitted=false | 🟢 PASSED |
| 1038 | **QuizStore** | TriggerQuiz increments total | totalQuestions=1 | 🟢 PASSED |
| 1039 | **QuizStore** | Toggle adds answer | contains 'node-bar-2' | 🟢 PASSED |
| 1040 | **QuizStore** | Toggle removes selected | not contains | 🟢 PASSED |
| 1041 | **QuizStore** | Max selection clamp | length=2, no 3rd | 🟢 PASSED |
| 1042 | **QuizStore** | No toggle after submit | not contains new | 🟢 PASSED |
| 1043 | **QuizStore** | SelectionCount updates | 0→1→2 | 🟢 PASSED |
| 1044 | **QuizStore** | Submit false no quiz | false | 🟢 PASSED |
| 1045 | **QuizStore** | Submit false no answers | false | 🟢 PASSED |
| 1046 | **QuizStore** | Submit true correct | true | 🟢 PASSED |
| 1047 | **QuizStore** | Submit false incorrect | false | 🟢 PASSED |
| 1048 | **QuizStore** | Correct evaluation result | hasSubmitted=true, isCorrect=true, 100% | 🟢 PASSED |
| 1049 | **QuizStore** | Incorrect evaluation result | hasSubmitted=true, isCorrect=false, 50% | 🟢 PASSED |
| 1050 | **QuizStore** | XP awarded first try | xpAwarded=30, totalXP=30, firstTry=1 | 🟢 PASSED |
| 1051 | **QuizStore** | No XP on retry | xpAwarded=0 | 🟢 PASSED |
| 1052 | **QuizStore** | Submit changes to SUBMITTED | overlayStatus='SUBMITTED' | 🟢 PASSED |
| 1053 | **QuizStore** | Submit debounce lock | locked=true, after 2s false | 🟢 PASSED |
| 1054 | **QuizStore** | MC quiz correct | true, xp=20 | 🟢 PASSED |
| 1055 | **QuizStore** | RetryQuiz resets but keeps active | quiz active, answers=[], not submitted | 🟢 PASSED |
| 1056 | **QuizStore** | CloseQuiz SLIDE_OUT then HIDDEN | SLIDE_OUT→HIDDEN, unlocks VCR | 🟢 PASSED |
| 1057 | **QuizStore** | CheckTimelineStep triggers demo | intercepted=true, visible=true | 🟢 PASSED |
| 1058 | **QuizStore** | Non-quiz step not intercepted | false, not visible | 🟢 PASSED |
| 1059 | **QuizStore** | ResetSession clears stats | 0/0/0 | 🟢 PASSED |
| 1060 | **QuizStore** | TriggerDemoQuiz SVG | SVG_NODE_CLICK, visible | 🟢 PASSED |
| 1061 | **QuizStore** | TriggerDemoQuiz Monaco | MONACO_LINE_CLICK | 🟢 PASSED |
| 1062 | **QuizStore** | TriggerDemoQuiz MC | MULTIPLE_CHOICE, options defined | 🟢 PASSED |
| 1063 | **QuizStore** | TriggerDemoQuiz invalid index | null quiz | 🟢 PASSED |
| 1064 | **QuizStore** | TriggerDemoQuiz negative index | null quiz | 🟢 PASSED |
| 1065 | **QuizStore** | canSubmit false without selections | false | 🟢 PASSED |
| 1066 | **QuizStore** | canSubmit true with selections | true | 🟢 PASSED |
| 1067 | **QuizStore** | canSubmit false after submission | false | 🟢 PASSED |
| 1068 | **QuizStore** | maxSelections reflects correct answers | 2 for SVG, 1 for MC | 🟢 PASSED |
| 1069 | **QuizStore** | currentQuestionType reflects active | null → SVG_NODE_CLICK | 🟢 PASSED |

### Phase 2 SOLID Principles Visualizer — LCOMCalculator, SOLIDEvaluatorEngine, ThermalSparkParticleEngine, LaserFractureCalculator, useSOLIDVisualizerStore (105 tests)

| STT | Phân hệ kiểm thử | Tính năng hạt nhân được xác thực | Phương thức kiểm tra (Test Spec) | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| 980 | **LCOMCalculator** | Empty members array returns 0 | calculateLCOM4([]) === 0 | 🟢 PASSED |
| 981 | **LCOMCalculator** | No methods returns 0 | Only FIELD members, no METHOD → 0 | 🟢 PASSED |
| 982 | **LCOMCalculator** | Cohesive class LCOM4 = 1 | All methods share dbConn field → 1 | 🟢 PASSED |
| 983 | **LCOMCalculator** | Two disconnected groups = 2 | db + smtp isolated groups → 2 (SRP violation) | 🟢 PASSED |
| 984 | **LCOMCalculator** | Three disconnected groups = 3 | God Class db+hash+smtp → 3 | 🟢 PASSED |
| 985 | **LCOMCalculator** | Single method = 1 | Trivially connected → 1 | 🟢 PASSED |
| 986 | **LCOMCalculator** | Transitive connection = 1 | Methods connected via shared fields → 1 | 🟢 PASSED |
| 987 | **LCOMCalculator** | No accessed fields = isolated | 2 methods no fields → 2 | 🟢 PASSED |
| 988 | **LCOMCalculator** | Large class all connected = 1 | 5 methods sharing sharedField → 1 | 🟢 PASSED |
| 989 | **LCOMCalculator** | Four disconnected groups = 4 | 4 methods each isolated → 4 | 🟢 PASSED |
| 990 | **LCOMCalculator** | Multiple shared fields = 1 | 3 methods sharing fa/fb/fc → 1 | 🟢 PASSED |
| 991 | **LCOMCalculator** | Only FIELDs no METHODs = 0 | Fields only, no graph → 0 | 🟢 PASSED |
| 992 | **SOLIDEvaluator** | SRP PASS cohesive class | LCOM4=1, isViolating=false | 🟢 PASSED |
| 993 | **SOLIDEvaluator** | SRP VIOLATION LCOM4=2 | God Class 2 groups, isViolating=true | 🟢 PASSED |
| 994 | **SOLIDEvaluator** | SRP VIOLATION LCOM4=3 | Mega Class 3 groups | 🟢 PASSED |
| 995 | **SOLIDEvaluator** | SRP no methods = not violating | Empty class LCOM4=0 | 🟢 PASSED |
| 996 | **SOLIDEvaluator** | SRP single method = pass | 1 method LCOM4=1 | 🟢 PASSED |
| 997 | **SOLIDEvaluator** | LSP VIOLATION throws exception | fly() throws NotImplementedException | 🟢 PASSED |
| 998 | **SOLIDEvaluator** | LSP method name in error | error contains 'fly' | 🟢 PASSED |
| 999 | **SOLIDEvaluator** | LSP NotImplementedException | error reason text | 🟢 PASSED |
| 1000 | **SOLIDEvaluator** | LSP PASS no exception | isViolating=false, no errorReason | 🟢 PASSED |
| 1001 | **SOLIDEvaluator** | LSP different method names | 'swim' violation works | 🟢 PASSED |
| 1002 | **SOLIDEvaluator** | LSP valid any method | draw() non-violating | 🟢 PASSED |
| 1003 | **ThermalEngine** | Create without canvas | isRunning=false, particles=[] | 🟢 PASSED |
| 1004 | **ThermalEngine** | Create with canvas | isRunning=false | 🟢 PASSED |
| 1005 | **ThermalEngine** | Attach canvas after construction | isRunning=false | 🟢 PASSED |
| 1006 | **ThermalEngine** | Start animation loop | isRunning=true, RAF queued | 🟢 PASSED |
| 1007 | **ThermalEngine** | No double start | RAF callback count unchanged | 🟢 PASSED |
| 1008 | **ThermalEngine** | No start without canvas | isRunning=false | 🟢 PASSED |
| 1009 | **ThermalEngine** | Stop clears particles | isRunning=false, particles=[], canvas cleared | 🟢 PASSED |
| 1010 | **ThermalEngine** | Destroy nullifies canvas | isRunning=false, particles=[] | 🟢 PASSED |
| 1011 | **ThermalEngine** | MAX_PARTICLES = 80 | Constant check | 🟢 PASSED |
| 1012 | **ThermalEngine** | Generates particles after frame | particles.length > 0 | 🟢 PASSED |
| 1013 | **ThermalEngine** | Hue range 0-30 red-orange | All particles hue ∈ [0, 30] | 🟢 PASSED |
| 1014 | **ThermalEngine** | Negative vy (fly upward) | All particles vy < 0 | 🟢 PASSED |
| 1015 | **ThermalEngine** | Size 1-4 | All particles size ∈ [1, 4] | 🟢 PASSED |
| 1016 | **ThermalEngine** | Clear canvas per draw cycle | clearRect called | 🟢 PASSED |
| 1017 | **ThermalEngine** | Lighter composite operation | globalCompositeOperation='lighter' | 🟢 PASSED |
| 1018 | **LaserFracture** | Segment count min-max range | segments ∈ [10, 15] | 🟢 PASSED |
| 1019 | **LaserFracture** | Exact segment count | generateFractureSegments(A, B, 12) = 12 | 🟢 PASSED |
| 1020 | **LaserFracture** | Starts near point A | first segment ≈ pointA | 🟢 PASSED |
| 1021 | **LaserFracture** | Ends near point B | last segment ≈ pointB | 🟢 PASSED |
| 1022 | **LaserFracture** | Zigzag within offset range | offsets ≤ FRACTURE_OFFSET_RANGE | 🟢 PASSED |
| 1023 | **LaserFracture** | Vertical path | 5 segments generated | 🟢 PASSED |
| 1024 | **LaserFracture** | Diagonal path | 8 segments generated | 🟢 PASSED |
| 1025 | **LaserFracture** | Connected segments | segment[i].end ≈ segment[i+1].start | 🟢 PASSED |
| 1026 | **LaserFracture** | Zero-length path | 3 segments for same point | 🟢 PASSED |
| 1027 | **LaserFracture** | Angle horizontal right = 0 | atan2(0, 100) ≈ 0 | 🟢 PASSED |
| 1028 | **LaserFracture** | Angle downward = PI/2 | atan2(100, 0) ≈ PI/2 | 🟢 PASSED |
| 1029 | **LaserFracture** | Angle left = PI | atan2(0, -100) ≈ PI | 🟢 PASSED |
| 1030 | **LaserFracture** | Angle upward = -PI/2 | atan2(-100, 0) ≈ -PI/2 | 🟢 PASSED |
| 1031 | **LaserFracture** | Angle 45 degrees | atan2(100, 100) ≈ PI/4 | 🟢 PASSED |
| 1032 | **LaserFracture** | Distance same point = 0 | sqrt(0) = 0 | 🟢 PASSED |
| 1033 | **LaserFracture** | Distance horizontal = 300 | 300 | 🟢 PASSED |
| 1034 | **LaserFracture** | Distance vertical = 400 | 400 | 🟢 PASSED |
| 1035 | **LaserFracture** | Distance 3-4-5 triangle = 500 | sqrt(300²+400²) = 500 | 🟢 PASSED |
| 1036 | **LaserFracture** | Constants min=10 max=15 | FRACTURE_SEGMENT_COUNT_MIN/MAX | 🟢 PASSED |
| 1037 | **LaserFracture** | Offset range = 12 | FRACTURE_OFFSET_RANGE | 🟢 PASSED |
| 1038 | **SOLIDStore** | Initial activeLesson SRP | 'SRP' | 🟢 PASSED |
| 1039 | **SOLIDStore** | Initial empty classNodes | [] | 🟢 PASSED |
| 1040 | **SOLIDStore** | Initial LSP phase IDLE | 'IDLE' | 🟢 PASSED |
| 1041 | **SOLIDStore** | Initial DIP violating | isViolatingDIP=true, hasInterface=false | 🟢 PASSED |
| 1042 | **SOLIDStore** | Initial no diagnostic | null | 🟢 PASSED |
| 1043 | **SOLIDStore** | Initial isSRPSplit false | false | 🟢 PASSED |
| 1044 | **SOLIDStore** | Demo UserManager God Class | className='UserManager' | 🟢 PASSED |
| 1045 | **SOLIDStore** | Demo LCOM4 = 3 | cohesionScore=3 | 🟢 PASSED |
| 1046 | **SOLIDStore** | Demo marks SRP violating | isViolatingSRP=true | 🟢 PASSED |
| 1047 | **SOLIDStore** | Computed hasOverheatedNodes | true after initDemo | 🟢 PASSED |
| 1048 | **SOLIDStore** | Computed overheatedNodeIds | contains 'user-manager-node' | 🟢 PASSED |
| 1049 | **SOLIDStore** | Computed totalNodes | 1 | 🟢 PASSED |
| 1050 | **SOLIDStore** | Computed srpViolationCount | 1 | 🟢 PASSED |
| 1051 | **SOLIDStore** | LSP not transmitting initially | false | 🟢 PASSED |
| 1052 | **SOLIDStore** | DIP not correct initially | false | 🟢 PASSED |
| 1053 | **SOLIDStore** | Lesson label SRP | 'Single Responsibility' | 🟢 PASSED |
| 1054 | **SOLIDStore** | Lesson label LSP | 'Liskov Substitution' | 🟢 PASSED |
| 1055 | **SOLIDStore** | Lesson label DIP | 'Dependency Inversion' | 🟢 PASSED |
| 1056 | **SOLIDStore** | setLesson switches | activeLesson='LSP' | 🟢 PASSED |
| 1057 | **SOLIDStore** | setLesson resets state | lspPhase='IDLE' | 🟢 PASSED |
| 1058 | **SOLIDStore** | setLesson inits demo data | classNodes.length=1, 'UserManager' | 🟢 PASSED |
| 1059 | **SOLIDStore** | initializeClassNodes evaluates | cohesionScore=1, not violating | 🟢 PASSED |
| 1060 | **SOLIDStore** | SRP split into 3 classes | classNodes.length=3 | 🟢 PASSED |
| 1061 | **SOLIDStore** | Split creates UserRepository | className found | 🟢 PASSED |
| 1062 | **SOLIDStore** | Split creates PasswordHasher | className found | 🟢 PASSED |
| 1063 | **SOLIDStore** | Split creates EmailNotifier | className found | 🟢 PASSED |
| 1064 | **SOLIDStore** | Split all cohesionScore=1 | All nodes LCOM4=1, not violating | 🟢 PASSED |
| 1065 | **SOLIDStore** | isSRPSplit = true | true after split | 🟢 PASSED |
| 1066 | **SOLIDStore** | Split diagnostic 'SRP ĐẠT' | Contains success message | 🟢 PASSED |
| 1067 | **SOLIDStore** | Split dispatches confetti | COOL_DOWN_CONFETTI_EVENT | 🟢 PASSED |
| 1068 | **SOLIDStore** | No overheated after split | hasOverheatedNodes=false | 🟢 PASSED |
| 1069 | **SOLIDStore** | Split unknown nodeId no-op | classNodes unchanged | 🟢 PASSED |
| 1070 | **SOLIDStore** | LSP TRANSMITTING immediately | lspPhase='TRANSMITTING' | 🟢 PASSED |
| 1071 | **SOLIDStore** | LSP shatter after 800ms | isLspShattered=true, phase='SHATTERED' | 🟢 PASSED |
| 1072 | **SOLIDStore** | LSP error diagnostic | Contains 'LISKOV_VIOLATION' | 🟢 PASSED |
| 1073 | **SOLIDStore** | LSP dispatches glass break | GLASS_BREAK_SOUND_EVENT | 🟢 PASSED |
| 1074 | **SOLIDStore** | LSP valid PASSED phase | lspPhase='PASSED', not shattered | 🟢 PASSED |
| 1075 | **SOLIDStore** | LSP valid diagnostic 'LSP ĐẠT' | Contains success message | 🟢 PASSED |
| 1076 | **SOLIDStore** | LSP valid not transmitting | false | 🟢 PASSED |
| 1077 | **SOLIDStore** | DIP insert interface fixes | isViolatingDIP=false, hasInterface=true | 🟢 PASSED |
| 1078 | **SOLIDStore** | DIP success diagnostic | Contains 'DIP ĐẠT' | 🟢 PASSED |
| 1079 | **SOLIDStore** | isDIPCorrect after fix | true | 🟢 PASSED |
| 1080 | **SOLIDStore** | resetDIP to violating | isViolatingDIP=true, diagnostic=null | 🟢 PASSED |
| 1081 | **SOLIDStore** | resetState clears all | classNodes=[], lspPhase='IDLE' | 🟢 PASSED |
| 1082 | **SOLIDStore** | resetState clears LSP timer | No shatter after 800ms | 🟢 PASSED |
| 1083 | **SOLIDStore** | resetAll re-initializes SRP | activeLesson='SRP', UserManager | 🟢 PASSED |
| 1084 | **SOLIDStore** | destroyStore cleans up | classNodes=[], diagnostic=null | 🟢 PASSED |


### Phase 2 State Inspector & Stack Frames — StateInspectorEngine, RecursionTreeGenerator, PointerArrowBatchRenderer, useStateInspectorStore (90 tests)

| STT | Phân hệ kiểm thử | Tính năng hạt nhân được xác thực | Kết quả kỳ vọng | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| 1085 | **StackEngine** | Start with empty stack | stack=[], activeFrameIndex=-1 | 🟢 PASSED |
| 1086 | **StackEngine** | Push frame sets active | depth=1, isActive=true | 🟢 PASSED |
| 1087 | **StackEngine** | Deactivate previous on push | frame[0].isActive=false, frame[1].isActive=true | 🟢 PASSED |
| 1088 | **StackEngine** | Pop frame reactivates previous | popped=f2, frame[0].isActive=true | 🟢 PASSED |
| 1089 | **StackEngine** | Pop empty returns null | null, activeFrameIndex=-1 | 🟢 PASSED |
| 1090 | **StackEngine** | Pop last sets index -1 | depth=0, activeFrameIndex=-1 | 🟢 PASSED |
| 1091 | **StackEngine** | Switch active frame by index | frame[0].isActive=true, others false | 🟢 PASSED |
| 1092 | **StackEngine** | Switch negative index returns null | null | 🟢 PASSED |
| 1093 | **StackEngine** | Switch out of bounds returns null | null | 🟢 PASSED |
| 1094 | **StackEngine** | Switch to middle frame | activeFrameIndex=1 | 🟢 PASSED |
| 1095 | **StackEngine** | Clear all frames | stack=[], depth=0 | 🟢 PASSED |
| 1096 | **StackEngine** | MAX_STACK_FRAMES limit | depth=MAX_STACK_FRAMES | 🟢 PASSED |
| 1097 | **StackEngine** | Push-pop-push sequence | depth=2, f3 active | 🟢 PASSED |
| 1098 | **StackEngine** | Shallow copy from getStack | stack1 !== stack2, equal values | 🟢 PASSED |
| 1099 | **StackEngine** | Multiple pops until empty | 3→2→1→0→0 | 🟢 PASSED |
| 1100 | **StackEngine** | Preserve heapAddress variables | head.heapAddress='0x7ffd00' | 🟢 PASSED |
| 1101 | **StackEngine** | Switch on single-element stack | isActive=true | 🟢 PASSED |
| 1102 | **StackEngine** | getDepth and getActiveFrameIndex | depth matches length | 🟢 PASSED |
| 1103 | **TreeGenerator** | Single root coordinates | x=center, y=40, parentId=null | 🟢 PASSED |
| 1104 | **TreeGenerator** | Binary tree Y = depth*80+40 | children y=120, left<400, right>400 | 🟢 PASSED |
| 1105 | **TreeGenerator** | ParentId set correctly | c1→r, c1a→c1, c2→r | 🟢 PASSED |
| 1106 | **TreeGenerator** | Preserve status | ACTIVE, RESOLVED, PENDING | 🟢 PASSED |
| 1107 | **TreeGenerator** | Preserve returnValue | 1, 1, 0 | 🟢 PASSED |
| 1108 | **TreeGenerator** | Single-child node | 3 coords, correct parentIds | 🟢 PASSED |
| 1109 | **TreeGenerator** | Ternary tree 3 children | 4 coords, x ordered left→right | 🟢 PASSED |
| 1110 | **TreeGenerator** | CanvasWidth 0 | x=0 | 🟢 PASSED |
| 1111 | **TreeGenerator** | Deep tree depth 4 | y = 4*80+40 | 🟢 PASSED |
| 1112 | **TreeGenerator** | Preserve label text | 'fibonacci(10)' | 🟢 PASSED |
| 1113 | **TreeGenerator** | countNodes leaf = 1 | 1 | 🟢 PASSED |
| 1114 | **TreeGenerator** | countNodes binary tree | 3 | 🟢 PASSED |
| 1115 | **TreeGenerator** | countNodes deeper tree | 5 | 🟢 PASSED |
| 1116 | **TreeGenerator** | getMaxDepth single = 0 | 0 | 🟢 PASSED |
| 1117 | **TreeGenerator** | getMaxDepth binary = 1 | 1 | 🟢 PASSED |
| 1118 | **TreeGenerator** | getMaxDepth unbalanced = 2 | 2 | 🟢 PASSED |
| 1119 | **BezierRenderer** | Start with no links, not running | links=[], isRunning=false | 🟢 PASSED |
| 1120 | **BezierRenderer** | Register a link | links.length=1 | 🟢 PASSED |
| 1121 | **BezierRenderer** | No duplicate link | links.length=1 | 🟢 PASSED |
| 1122 | **BezierRenderer** | Multiple distinct links | links.length=2 | 🟢 PASSED |
| 1123 | **BezierRenderer** | Remove link by sourceId | links.length=1, src-2 remains | 🟢 PASSED |
| 1124 | **BezierRenderer** | Remove non-existent link | links.length=1 unchanged | 🟢 PASSED |
| 1125 | **BezierRenderer** | Clear all links | links=[] | 🟢 PASSED |
| 1126 | **BezierRenderer** | Shallow copy from getLinks | links1 !== links2 | 🟢 PASSED |
| 1127 | **BezierRenderer** | Start render loop | isRunning=true | 🟢 PASSED |
| 1128 | **BezierRenderer** | No double-start | isRunning=true once | 🟢 PASSED |
| 1129 | **BezierRenderer** | Stop render loop | isRunning=false | 🟢 PASSED |
| 1130 | **BezierRenderer** | CancelAnimationFrame on stop | called | 🟢 PASSED |
| 1131 | **BezierRenderer** | Stop when not running | isRunning=false | 🟢 PASSED |
| 1132 | **BezierRenderer** | Destroy stops + clears | isRunning=false, links=[] | 🟢 PASSED |
| 1133 | **BezierRenderer** | Calculate Bezier standard rects | p0x=100, p0y=65, p3x=400, p3y=95 | 🟢 PASSED |
| 1134 | **BezierRenderer** | BEZIER_MIN_DX when close | dx=40, control points clamped | 🟢 PASSED |
| 1135 | **BezierRenderer** | Include scroll offsets | +scrollX, +scrollY | 🟢 PASSED |
| 1136 | **BezierRenderer** | Valid SVG path string | M...C... format | 🟢 PASSED |
| 1137 | **BezierRenderer** | Negative scroll values | p0x=190 | 🟢 PASSED |
| 1138 | **BezierRenderer** | Zero-height rects | p0y=50, p3y=50 | 🟢 PASSED |
| 1139 | **InspectorStore** | Empty initial state | all empty/null/-1 | 🟢 PASSED |
| 1140 | **InspectorStore** | Zero initial computed | depth=0, full=false | 🟢 PASSED |
| 1141 | **InspectorStore** | Push frame updates state | depth=1, active | 🟢 PASSED |
| 1142 | **InspectorStore** | MONACO event on push | lineNumber=5 | 🟢 PASSED |
| 1143 | **InspectorStore** | Multiple push, only top active | frame[1].isActive=true | 🟢 PASSED |
| 1144 | **InspectorStore** | Pop frame reactivates | depth=1, popped=f2 | 🟢 PASSED |
| 1145 | **InspectorStore** | MONACO event on pop | lineNumber=5 (previous) | 🟢 PASSED |
| 1146 | **InspectorStore** | Pop empty returns null | null | 🟢 PASSED |
| 1147 | **InspectorStore** | Select frame updates index | activeFrameIndex=0 | 🟢 PASSED |
| 1148 | **InspectorStore** | MONACO event on select | lineNumber=5 | 🟢 PASSED |
| 1149 | **InspectorStore** | Ignore invalid select | unchanged | 🟢 PASSED |
| 1150 | **InspectorStore** | Compute activeFrame | frameId=f1, variables.x=42 | 🟢 PASSED |
| 1151 | **InspectorStore** | Null activeFrame empty | null, {} | 🟢 PASSED |
| 1152 | **InspectorStore** | Set hoveredHeapAddress | '0x7ffd00' | 🟢 PASSED |
| 1153 | **InspectorStore** | Clear hoveredHeapAddress | null | 🟢 PASSED |
| 1154 | **InspectorStore** | Update recursion tree | nodeCount=3, depth=1 | 🟢 PASSED |
| 1155 | **InspectorStore** | Clear recursion tree | null, coords=[] | 🟢 PASSED |
| 1156 | **InspectorStore** | Add heap object | length=1, address=0x7ffd00 | 🟢 PASSED |
| 1157 | **InspectorStore** | No duplicate heap object | length=1 | 🟢 PASSED |
| 1158 | **InspectorStore** | Remove heap object | length=0 | 🟢 PASSED |
| 1159 | **InspectorStore** | Add pointer link | length=1 | 🟢 PASSED |
| 1160 | **InspectorStore** | No duplicate pointer link | length=1 | 🟢 PASSED |
| 1161 | **InspectorStore** | Clear pointer links | [] | 🟢 PASSED |
| 1162 | **InspectorStore** | Clear all state | all reset | 🟢 PASSED |
| 1163 | **InspectorStore** | isStackFull at capacity | true | 🟢 PASSED |
| 1164 | **InspectorStore** | Fibonacci demo 4 frames | main, fib(3), fib(2), fib(1) | 🟢 PASSED |
| 1165 | **InspectorStore** | Fibonacci demo heap objects | 2 objects, 0x7ffd00, 0x7ffd10 | 🟢 PASSED |
| 1166 | **InspectorStore** | Fibonacci demo pointer links | 2 links | 🟢 PASSED |
| 1167 | **InspectorStore** | Fibonacci demo recursion tree | 5 nodes | 🟢 PASSED |
| 1168 | **InspectorStore** | Fibonacci demo tree coordinates | 5 coords, maxDepth=2 | 🟢 PASSED |
| 1169 | **InspectorStore** | demoStepForward pops frame | depth-1 | 🟢 PASSED |
| 1170 | **InspectorStore** | demoStepForward resolves tree | tree not null | 🟢 PASSED |
| 1171 | **InspectorStore** | demoStepForward empty no crash | depth=0 | 🟢 PASSED |
| 1172 | **InspectorStore** | demoStepForward single no pop | depth=1 | 🟢 PASSED |
| 1173 | **InspectorStore** | demoPushCall adds frame | depth+1 | 🟢 PASSED |
| 1174 | **InspectorStore** | clearInspector after demo | all reset | 🟢 PASSED |
| 1175 | **InspectorStore** | Re-initialize demo cleanly | depth=4, heap=2, tree=5 | 🟢 PASSED |

---

## 🌐 Phase 2 System Design Visualizer (64 tests mới)

### SystemDesignEngine.spec.ts (20 tests)

| STT | Phân hệ | Kịch bản kiểm thử | Assertion | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| 1176 | **Engine** | Register and retrieve nodes | getNode returns registered node | 🟢 PASSED |
| 1177 | **Engine** | Overwrite existing node on re-register | status updated, length=1 | 🟢 PASSED |
| 1178 | **Engine** | Return undefined for non-existent node | undefined | 🟢 PASSED |
| 1179 | **Engine** | Set node status | status=FAILED | 🟢 PASSED |
| 1180 | **Engine** | Ignore setNodeStatus for non-existent | no error, undefined | 🟢 PASSED |
| 1181 | **Engine** | Register links | length=1 | 🟢 PASSED |
| 1182 | **Engine** | Not register duplicate links | length=1 | 🟢 PASSED |
| 1183 | **Engine** | Distribute packets 50/50 Round-Robin | toA=2, toB=2 | 🟢 PASSED |
| 1184 | **Engine** | Increment requestCount on target | srvA=1, srvB=1 | 🟢 PASSED |
| 1185 | **Engine** | Return null for non-existent LB | null | 🟢 PASSED |
| 1186 | **Engine** | Create packet with correct initial state | progress=0, IN_TRANSIT | 🟢 PASSED |
| 1187 | **Engine** | Redirect 100% to B when A FAILED | toA=0, toB=2 | 🟢 PASSED |
| 1188 | **Engine** | Return null when ALL servers FAILED | null, packets=0 | 🟢 PASSED |
| 1189 | **Engine** | Advance packet progress | progress=0.5 | 🟢 PASSED |
| 1190 | **Engine** | Remove arrived packets GC | packets=0 | 🟢 PASSED |
| 1191 | **Engine** | Drop packets targeting FAILED nodes | packets=0 | 🟢 PASSED |
| 1192 | **Engine** | Create direct packet between nodes | sourceId, targetId correct | 🟢 PASSED |
| 1193 | **Engine** | Return null if source/target missing | null | 🟢 PASSED |
| 1194 | **Engine** | MAX_ACTIVE_PACKETS cap (200) | packetCount=200 | 🟢 PASSED |
| 1195 | **Engine** | Clear all state | nodes=0, links=0, packets=0 | 🟢 PASSED |

### FailureSmokeEmitterEngine.spec.ts (10 tests)

| STT | Phân hệ | Kịch bản kiểm thử | Assertion | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| 1196 | **Smoke** | Start with zero particles | count=0, active=false | 🟢 PASSED |
| 1197 | **Smoke** | Generate default 20 particles | count=20 | 🟢 PASSED |
| 1198 | **Smoke** | Generate custom count | count=5 | 🟢 PASSED |
| 1199 | **Smoke** | Create particles at canvas center | x=100, y=100 | 🟢 PASSED |
| 1200 | **Smoke** | Valid initial particle properties | alpha=0.9, life=0, size 4-12 | 🟢 PASSED |
| 1201 | **Smoke** | Accumulate particles on bursts | count=15 | 🟢 PASSED |
| 1202 | **Smoke** | Start emission loop | isActive=true | 🟢 PASSED |
| 1203 | **Smoke** | Not double-start emission | isActive=true, no error | 🟢 PASSED |
| 1204 | **Smoke** | Stop emission loop | isActive=false | 🟢 PASSED |
| 1205 | **Smoke** | Draw callback invoked | cb called | 🟢 PASSED |

### ReplicationLagScheduler.spec.ts (10 tests)

| STT | Phân hệ | Kịch bản kiểm thử | Assertion | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| 1206 | **Repl** | Schedule a replication job | primaryId, replicaId, lag correct | 🟢 PASSED |
| 1207 | **Repl** | Add job to pending queue | pendingCount=1 | 🟢 PASSED |
| 1208 | **Repl** | Complete job after lag duration | cb called, pending=0, completed=1 | 🟢 PASSED |
| 1209 | **Repl** | Pass job object to callback | cb(job) | 🟢 PASSED |
| 1210 | **Repl** | Clamp lag below minimum (100ms) | lagDuration=100 | 🟢 PASSED |
| 1211 | **Repl** | Clamp lag above maximum (5000ms) | lagDuration=5000 | 🟢 PASSED |
| 1212 | **Repl** | Accept lag within valid range | lagDuration=2500 | 🟢 PASSED |
| 1213 | **Repl** | Multiple concurrent jobs | staggered completion | 🟢 PASSED |
| 1214 | **Repl** | Check if job is pending | true→false after timer | 🟢 PASSED |
| 1215 | **Repl** | Cancel all pending timers on clear | cb not called, counts=0 | 🟢 PASSED |

### useSystemDesignStore.spec.ts (24 tests)

| STT | Phân hệ | Kịch bản kiểm thử | Assertion | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| 1216 | **Store** | Initialize demo with 6 nodes | nodes length=6, all types | 🟢 PASSED |
| 1217 | **Store** | Initialize demo with 6 links | links length=6 | 🟢 PASSED |
| 1218 | **Store** | Start with zero active packets | packets=0, totalInFlight=0 | 🟢 PASSED |
| 1219 | **Store** | Default replication lag 1000ms | replicationLagMs=1000 | 🟢 PASSED |
| 1220 | **Store** | Report 6 healthy nodes initially | healthyCount=6, failedCount=0 | 🟢 PASSED |
| 1221 | **Store** | Create packet on injectHttpRequest | packets=1, color=#10B981 | 🟢 PASSED |
| 1222 | **Store** | Distribute Round-Robin A and B | targets contain both | 🟢 PASSED |
| 1223 | **Store** | Inject traffic burst N packets | packets=10, spikeActive=true | 🟢 PASSED |
| 1224 | **Store** | Toggle server HEALTHY→FAILED | status=FAILED, failedCount=1 | 🟢 PASSED |
| 1225 | **Store** | Toggle server FAILED→HEALTHY | status=HEALTHY, failedIds empty | 🟢 PASSED |
| 1226 | **Store** | NOT toggle non-WEB_SERVER nodes | all remain HEALTHY | 🟢 PASSED |
| 1227 | **Store** | Redirect all to B after A fails | toA=0, toB=2 | 🟢 PASSED |
| 1228 | **Store** | Dispatch SMOKE_BURST event on fail | event dispatched with nodeId | 🟢 PASSED |
| 1229 | **Store** | Add pending replication on dbWrite | pendingCount >= 1 | 🟢 PASSED |
| 1230 | **Store** | Complete replication after lag | completedReplications=1 | 🟢 PASSED |
| 1231 | **Store** | Respect configured replication lag | delay matches setReplicationLag | 🟢 PASSED |
| 1232 | **Store** | Set replication lag valid range | lagMs=2500 | 🟢 PASSED |
| 1233 | **Store** | Clamp lag below minimum | lagMs=100 | 🟢 PASSED |
| 1234 | **Store** | Clamp lag above maximum | lagMs=5000 | 🟢 PASSED |
| 1235 | **Store** | Advance packets on tickEngine | progress > 0 | 🟢 PASSED |
| 1236 | **Store** | Remove arrived packets GC | packets=0 | 🟢 PASSED |
| 1237 | **Store** | Reset all state on clearTopology | all zeroed/empty | 🟢 PASSED |
| 1238 | **Store** | Destroy also clears GC | no leaks | 🟢 PASSED |
| 1239 | **Store** | Re-init after clear works | nodes=6 after init | 🟢 PASSED |

---

## Phase 2 VCR Timeline Playback (94 tests)

### VCRPlaybackEngine.spec.ts (27 tests)

| STT | Phân hệ | Kịch bản kiểm thử | Assertion | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| 1240 | **Engine** | Set frames and reset step to 0 | frameCount=4, step=0 | 🟢 PASSED |
| 1241 | **Engine** | Reset step index on new frames | step=0 after re-set | 🟢 PASSED |
| 1242 | **Engine** | Seek to valid step triggers callback | step=2, line=4 | 🟢 PASSED |
| 1243 | **Engine** | Return null for negative seek index | null, step unchanged | 🟢 PASSED |
| 1244 | **Engine** | Return null for out-of-range seek | null | 🟢 PASSED |
| 1245 | **Engine** | Return null seeking empty frames | null | 🟢 PASSED |
| 1246 | **Engine** | Step forward triggers callback | step=1 | 🟢 PASSED |
| 1247 | **Engine** | Step forward multiple times | step=3 | 🟢 PASSED |
| 1248 | **Engine** | Return null at last frame forward | null, step=3 | 🟢 PASSED |
| 1249 | **Engine** | Step back triggers callback | step=1 from 2 | 🟢 PASSED |
| 1250 | **Engine** | Return null at first frame back | null, step=0 | 🟢 PASSED |
| 1251 | **Engine** | Rewind to first frame | step=0 | 🟢 PASSED |
| 1252 | **Engine** | Fast forward to last frame | step=3 | 🟢 PASSED |
| 1253 | **Engine** | Fast forward empty frames null | null | 🟢 PASSED |
| 1254 | **Engine** | Set playback speed | speed=2.0 | 🟢 PASSED |
| 1255 | **Engine** | Clamp speed to min 0.1 | speed=0.1 | 🟢 PASSED |
| 1256 | **Engine** | Clamp speed to max 5.0 | speed=5.0 | 🟢 PASSED |
| 1257 | **Engine** | Play sets PLAYING status | PLAYING | 🟢 PASSED |
| 1258 | **Engine** | No double-play | PLAYING once | 🟢 PASSED |
| 1259 | **Engine** | No play with empty frames | PAUSED | 🟢 PASSED |
| 1260 | **Engine** | Pause sets PAUSED status | PAUSED | 🟢 PASSED |
| 1261 | **Engine** | Cancel rAF on pause | cancelAnimationFrame called | 🟢 PASSED |
| 1262 | **Engine** | Start with PAUSED status | PAUSED | 🟢 PASSED |
| 1263 | **Engine** | Advance step on elapsed >= interval | step=1, callback fired | 🟢 PASSED |
| 1264 | **Engine** | Auto-pause at last frame | step=3, PAUSED | 🟢 PASSED |
| 1265 | **Engine** | Destroy clears all state | step=0, frames=0 | 🟢 PASSED |
| 1266 | **Engine** | Forward-backward boundary transitions | full cycle 0→3→0 | 🟢 PASSED |

### MonacoLineSyncerCoordinator.spec.ts (14 tests)

| STT | Phân hệ | Kịch bản kiểm thử | Assertion | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| 1267 | **Monaco** | Call revealLineInCenter | line=10, scrollType=0 | 🟢 PASSED |
| 1268 | **Monaco** | DeltaDecorations correct config | className, marginClassName | 🟢 PASSED |
| 1269 | **Monaco** | Update decoration IDs after sync | count=1 | 🟢 PASSED |
| 1270 | **Monaco** | Pass previous IDs on second call | oldIds=['decoration-1'] | 🟢 PASSED |
| 1271 | **Monaco** | No call when editor null | not called | 🟢 PASSED |
| 1272 | **Monaco** | No call for line < 1 | not called | 🟢 PASSED |
| 1273 | **Monaco** | No call for negative line | not called | 🟢 PASSED |
| 1274 | **Monaco** | Clear decorations with active | deltaDecorations([old],[]) | 🟢 PASSED |
| 1275 | **Monaco** | No clear when no decorations | not called | 🟢 PASSED |
| 1276 | **Monaco** | No clear when editor null | not called | 🟢 PASSED |
| 1277 | **Monaco** | Start with 0 decorations | count=0 | 🟢 PASSED |
| 1278 | **Monaco** | Track multi-decoration count | count=2 | 🟢 PASSED |
| 1279 | **Monaco** | Replace old decorations sequentially | new replaces old | 🟢 PASSED |

### ScrubberMathCalculator.spec.ts (19 tests)

| STT | Phân hệ | Kịch bản kiểm thử | Assertion | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| 1280 | **Scrubber** | Step 0 at left edge | step=0, percent=0 | 🟢 PASSED |
| 1281 | **Scrubber** | Last step at right edge | step=9, percent=1 | 🟢 PASSED |
| 1282 | **Scrubber** | Middle step at center | step=5, percent=0.5 | 🟢 PASSED |
| 1283 | **Scrubber** | Clamp left of track | step=0, percent=0 | 🟢 PASSED |
| 1284 | **Scrubber** | Clamp right of track | step=9, percent=1 | 🟢 PASSED |
| 1285 | **Scrubber** | Return 0 for totalSteps<=0 | step=0, percent=0 | 🟢 PASSED |
| 1286 | **Scrubber** | Single step totalSteps=1 | step=0 | 🟢 PASSED |
| 1287 | **Scrubber** | Correct step for 3 frames | step=1 at 25% | 🟢 PASSED |
| 1288 | **Scrubber** | Correct step at 75% for 5 frames | step=3 | 🟢 PASSED |
| 1289 | **Scrubber** | Percent 0 for step 0 | 0 | 🟢 PASSED |
| 1290 | **Scrubber** | Percent 1 for last step | 1 | 🟢 PASSED |
| 1291 | **Scrubber** | Percent 0.5 for middle | ~0.5 | 🟢 PASSED |
| 1292 | **Scrubber** | Percent 0 for totalSteps<=1 | 0 | 🟢 PASSED |
| 1293 | **Scrubber** | Clamp percent to [0,1] | 0 and 1 | 🟢 PASSED |
| 1294 | **Clamp** | Value within range | 5 | 🟢 PASSED |
| 1295 | **Clamp** | Clamp to min | 0 | 🟢 PASSED |
| 1296 | **Clamp** | Clamp to max | 10 | 🟢 PASSED |
| 1297 | **Clamp** | Equal min and max | 3 | 🟢 PASSED |
| 1298 | **Clamp** | Floating point values | correct clamping | 🟢 PASSED |

### useVCRTimelineStore.spec.ts (34 tests)

| STT | Phân hệ | Kịch bản kiểm thử | Assertion | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| 1299 | **Store** | Correct initial state | step=0, total=0, PAUSED | 🟢 PASSED |
| 1300 | **Store** | isAtEnd when not initialized | true | 🟢 PASSED |
| 1301 | **Store** | isAtStart initially | true | 🟢 PASSED |
| 1302 | **Store** | 0/0 step label initially | "0 / 0" | 🟢 PASSED |
| 1303 | **Store** | Initialize frames correctly | total=4, step=0 | 🟢 PASSED |
| 1304 | **Store** | Description after initialize | "Khởi tạo mảng" | 🟢 PASSED |
| 1305 | **Store** | LineNumber after initialize | 1 | 🟢 PASSED |
| 1306 | **Store** | Snapshot after initialize | array=[64,34,25] | 🟢 PASSED |
| 1307 | **Store** | Dispatch CustomEvent on init | called | 🟢 PASSED |
| 1308 | **Store** | Step label after initialize | "1 / 4" | 🟢 PASSED |
| 1309 | **Store** | Re-initialize destroys previous | total=1 | 🟢 PASSED |
| 1310 | **Store** | Play sets PLAYING | PLAYING, isPlaying=true | 🟢 PASSED |
| 1311 | **Store** | Pause sets PAUSED | PAUSED, isPlaying=false | 🟢 PASSED |
| 1312 | **Store** | Toggle PAUSED to PLAYING | PLAYING | 🟢 PASSED |
| 1313 | **Store** | Toggle PLAYING to PAUSED | PAUSED | 🟢 PASSED |
| 1314 | **Store** | Step forward updates step | step=1 | 🟢 PASSED |
| 1315 | **Store** | Update lineNumber on forward | lineNumber=3 | 🟢 PASSED |
| 1316 | **Store** | Update snapshot on forward | array=[34,64,25] | 🟢 PASSED |
| 1317 | **Store** | Step back updates step | step=1 from 2 | 🟢 PASSED |
| 1318 | **Store** | Rewind to step 0 | step=0, isAtStart=true | 🟢 PASSED |
| 1319 | **Store** | Fast forward to last step | step=3, isAtEnd=true | 🟢 PASSED |
| 1320 | **Store** | Seek to specific step | step=2 | 🟢 PASSED |
| 1321 | **Store** | Change playback speed | speed=2.0 | 🟢 PASSED |
| 1322 | **Store** | Change speed without engine | speed=0.5 | 🟢 PASSED |
| 1323 | **Store** | Progress 0% at step 0 | 0 | 🟢 PASSED |
| 1324 | **Store** | Progress 100% at last step | 100 | 🟢 PASSED |
| 1325 | **Store** | Progress ~33% at step 1/4 | ~33.33 | 🟢 PASSED |
| 1326 | **Store** | Clear all state | step=0, total=0, PAUSED | 🟢 PASSED |
| 1327 | **Store** | Load demo Bubble Sort 12 frames | total=12, initialized | 🟢 PASSED |
| 1328 | **Store** | Valid demo data after load | description, array | 🟢 PASSED |
| 1329 | **Store** | Step through demo frames | step=1, "So sánh" | 🟢 PASSED |
| 1330 | **Store** | isAtStart/isAtEnd at boundaries | correct | 🟢 PASSED |
| 1331 | **Store** | Dispatch MONACO event on step | event found | 🟢 PASSED |
| 1332 | **Store** | Dispatch CANVAS event on step | event found | 🟢 PASSED |

---

## Phase B2: Backend C# Unit Tests (xUnit + FluentAssertions + Moq)

### Domain.Tests (88 tests)

| STT | Phân hệ kiểm thử | Tính năng kiểm thử | Phương thức | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| 1333 | **Entity** | User constructor | email/username/passwordHash init | 🟢 PASSED |
| 1334 | **Entity** | User AwardXP level calc | XP→Level (50→1, 100→2, 400→3, 900→4) | 🟢 PASSED |
| 1335 | **Entity** | User refresh token lifecycle | Set/Revoke RefreshToken | 🟢 PASSED |
| 1336 | **Entity** | User module completion | LearningProgresses.Add | 🟢 PASSED |
| 1337 | **Entity** | Badge/UserBadge/Quiz construction | Entity property init | 🟢 PASSED |
| 1338 | **Entity** | QuizAttempt 70% pass threshold | 7/10=pass, 6/10=fail | 🟢 PASSED |
| 1339 | **Exception** | NotFoundException error type | "NOT_FOUND" + entity/id format | 🟢 PASSED |
| 1340 | **Exception** | DomainValidationException | "VALIDATION_ERROR" | 🟢 PASSED |
| 1341 | **Exception** | AuthenticationException | "AUTHENTICATION_ERROR" | 🟢 PASSED |
| 1342 | **Exception** | ConflictException | "CONFLICT" | 🟢 PASSED |
| 1343 | **Exception** | Inheritance chain | All inherit DomainException | 🟢 PASSED |
| 1344 | **Strategy** | BubbleSort ascending output | BeInAscendingOrder | 🟢 PASSED |
| 1345 | **Strategy** | SelectionSort ascending output | BeInAscendingOrder | 🟢 PASSED |
| 1346 | **Strategy** | InsertionSort ascending output | BeInAscendingOrder | 🟢 PASSED |
| 1347 | **Strategy** | QuickSort ascending output | BeInAscendingOrder | 🟢 PASSED |
| 1348 | **Strategy** | MergeSort ascending output | BeInAscendingOrder | 🟢 PASSED |
| 1349 | **Strategy** | LinearSearch find target | "Tìm thấy" in frames | 🟢 PASSED |
| 1350 | **Strategy** | BinarySearch sorted array | "Tìm thấy" in frames | 🟢 PASSED |
| 1351 | **Strategy** | BinarySearch unsorted throws | ArgumentException | 🟢 PASSED |
| 1352 | **Strategy** | Stack LIFO push/pop all | EndEmpty + "rỗng" | 🟢 PASSED |
| 1353 | **Strategy** | Queue FIFO enqueue/dequeue all | EndEmpty + "rỗng" | 🟢 PASSED |
| 1354 | **Strategy** | BST inorder traversal | "LNR" in explanation | 🟢 PASSED |
| 1355 | **Strategy** | Algorithm metadata complexity | O(N²)/O(N log N)/O(1) | 🟢 PASSED |
| 1356 | **Input** | InputParser valid array | "1,2,3" → [1,2,3] | 🟢 PASSED |
| 1357 | **Input** | InputParser empty/null | ArgumentException | 🟢 PASSED |
| 1358 | **Input** | InputParser invalid format | FormatException | 🟢 PASSED |
| 1359 | **Input** | ConstraintResolver limits | Max elements/value per algo | 🟢 PASSED |

### Application.Tests (25 tests)

| STT | Phân hệ kiểm thử | Tính năng kiểm thử | Phương thức | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| 1360 | **Validator** | RegisterRequest valid pass | ShouldNotHaveAnyValidationErrors | 🟢 PASSED |
| 1361 | **Validator** | Email format invalid | ShouldHaveValidationErrorFor | 🟢 PASSED |
| 1362 | **Validator** | Password no uppercase | ShouldHaveValidationErrorFor | 🟢 PASSED |
| 1363 | **Validator** | Password no lowercase | ShouldHaveValidationErrorFor | 🟢 PASSED |
| 1364 | **Validator** | Password no digit | ShouldHaveValidationErrorFor | 🟢 PASSED |
| 1365 | **Validator** | Password too short (<8) | ShouldHaveValidationErrorFor | 🟢 PASSED |
| 1366 | **Validator** | Username too short (<3) | ShouldHaveValidationErrorFor | 🟢 PASSED |
| 1367 | **Validator** | Username special chars | ShouldHaveValidationErrorFor | 🟢 PASSED |
| 1368 | **Validator** | LoginRequest valid | ShouldNotHaveAnyValidationErrors | 🟢 PASSED |
| 1369 | **Validator** | RefreshTokenRequest empty | ShouldHaveValidationErrorFor | 🟢 PASSED |
| 1370 | **Validator** | QuizAttemptRequest valid | ShouldNotHaveAnyValidationErrors | 🟢 PASSED |
| 1371 | **Validator** | XPAwardRequest range 1-200 | ShouldHaveValidationErrorFor | 🟢 PASSED |

### Infrastructure.Tests (26 tests)

| STT | Phân hệ kiểm thử | Tính năng kiểm thử | Phương thức | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| 1372 | **AuthService** | Register new user | Moq IUnitOfWork + BCrypt hash | 🟢 PASSED |
| 1373 | **AuthService** | Register duplicate email | ThrowAsync ConflictException | 🟢 PASSED |
| 1374 | **AuthService** | Login valid credentials | BCrypt.Verify + JWT token | 🟢 PASSED |
| 1375 | **AuthService** | Login wrong password | ThrowAsync AuthenticationException | 🟢 PASSED |
| 1376 | **AuthService** | Login nonexistent user | ThrowAsync AuthenticationException | 🟢 PASSED |
| 1377 | **AuthService** | RefreshToken valid | New tokens issued | 🟢 PASSED |
| 1378 | **AuthService** | RefreshToken expired | ThrowAsync AuthenticationException | 🟢 PASSED |
| 1379 | **AuthService** | GetCurrentUser | MapToUserDto | 🟢 PASSED |
| 1380 | **GamificationService** | AwardXP valid user | TotalXP increased + CommitAsync | 🟢 PASSED |
| 1381 | **GamificationService** | AwardXP nonexistent | ThrowAsync NotFoundException | 🟢 PASSED |
| 1382 | **GamificationService** | CompleteModule | LearningProgresses.Add | 🟢 PASSED |
| 1383 | **GamificationService** | GetUserProgress | Stats mapping | 🟢 PASSED |
| 1384 | **GamificationService** | CheckAndAwardBadges | Empty when not eligible | 🟢 PASSED |
| 1385 | **QuizService** | GetAllQuizzes | Mapped to QuizDto | 🟢 PASSED |
| 1386 | **QuizService** | GetQuizById existing | Title/Difficulty correct | 🟢 PASSED |
| 1387 | **QuizService** | GetQuizById nonexistent | ThrowAsync NotFoundException | 🟢 PASSED |
| 1388 | **QuizService** | GetQuizzesByTopic | Filter by topic | 🟢 PASSED |
| 1389 | **QuizService** | Submit all correct | Passed=true, XP=50 awarded | 🟢 PASSED |
| 1390 | **QuizService** | Submit all wrong | Passed=false, XP=0 | 🟢 PASSED |
| 1391 | **QuizService** | Submit wrong answer count | ThrowAsync DomainValidationException | 🟢 PASSED |
| 1392 | **QuizService** | Submit nonexistent quiz | ThrowAsync NotFoundException | 🟢 PASSED |
| 1393 | **QuizService** | GetUserQuizHistory | Return attempts | 🟢 PASSED |

## Phase B3: Frontend-Backend Integration Tests (39 tests)

### apiClient.spec.ts (15 tests)

| STT | Phân hệ kiểm thử | Tính năng kiểm thử | Phương thức | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| 1394 | **Token Storage** | Store and retrieve access token | setStoredTokens/getStoredToken | 🟢 PASSED |
| 1395 | **Token Storage** | Return null when no token | getStoredToken() initial state | 🟢 PASSED |
| 1396 | **Token Storage** | Clear tokens | clearStoredTokens() | 🟢 PASSED |
| 1397 | **apiRequest** | GET request with correct URL | fetch mock verify | 🟢 PASSED |
| 1398 | **apiRequest** | Attach Authorization header | Bearer token injection | 🟢 PASSED |
| 1399 | **apiRequest** | No Authorization when no token | Header absence check | 🟢 PASSED |
| 1400 | **apiRequest** | Throw ApiError on non-ok | RFC 7807 error mapping | 🟢 PASSED |
| 1401 | **apiRequest** | Return undefined for 204 | No Content handling | 🟢 PASSED |
| 1402 | **apiRequest** | Token refresh on 401 | Auto-refresh + retry flow | 🟢 PASSED |
| 1403 | **api helpers** | api.get uses GET method | Method verification | 🟢 PASSED |
| 1404 | **api helpers** | api.post uses POST with body | Method + body verify | 🟢 PASSED |
| 1405 | **api helpers** | api.put uses PUT method | Method verification | 🟢 PASSED |
| 1406 | **api helpers** | api.delete uses DELETE method | Method verification | 🟢 PASSED |

### useAuthStore.spec.ts (8 tests)

| STT | Phân hệ kiểm thử | Tính năng kiểm thử | Phương thức | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| 1407 | **Auth** | Initial unauthenticated state | Store init check | 🟢 PASSED |
| 1408 | **Auth** | Successful registration | Token + user stored | 🟢 PASSED |
| 1409 | **Auth** | Failed registration (conflict) | Error message set | 🟢 PASSED |
| 1410 | **Auth** | Successful login | JWT + user authenticated | 🟢 PASSED |
| 1411 | **Auth** | Wrong credentials login | Error state set | 🟢 PASSED |
| 1412 | **Auth** | Logout clears session | Tokens + user cleared | 🟢 PASSED |
| 1413 | **Auth** | fetchCurrentUser with token | User loaded from API | 🟢 PASSED |
| 1414 | **Auth** | fetchCurrentUser no token | Skip fetch | 🟢 PASSED |

### gamificationApi.spec.ts (8 tests)

| STT | Phân hệ kiểm thử | Tính năng kiểm thử | Phương thức | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| 1415 | **Gamification Sync** | Offline mode detection | No token → isOnlineMode false | 🟢 PASSED |
| 1416 | **Gamification Sync** | Online mode detection | Token exists → true | 🟢 PASSED |
| 1417 | **Gamification Sync** | earnXPWithSync offline | Local XP only, no fetch | 🟢 PASSED |
| 1418 | **Gamification Sync** | earnXPWithSync online | Server totalXP override | 🟢 PASSED |
| 1419 | **Gamification Sync** | earnXPWithSync error | syncError set | 🟢 PASSED |
| 1420 | **Gamification Sync** | syncProgressFromServer | XP/streak/badges synced | 🟢 PASSED |
| 1421 | **Leaderboard** | fetchLeaderboardFromServer | Mapped to LeaderboardEntry | 🟢 PASSED |
| 1422 | **Leaderboard** | Leaderboard server error | syncError set | 🟢 PASSED |

### quizApi.spec.ts (8 tests)

| STT | Phân hệ kiểm thử | Tính năng kiểm thử | Phương thức | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| 1423 | **Quiz Sync** | Offline mode detection | No token → false | 🟢 PASSED |
| 1424 | **Quiz Sync** | Online mode detection | Token exists → true | 🟢 PASSED |
| 1425 | **Quiz Sync** | fetchQuizzesFromServer offline | Skip, empty array | 🟢 PASSED |
| 1426 | **Quiz Sync** | fetchQuizzesFromServer online | serverQuizzes populated | 🟢 PASSED |
| 1427 | **Quiz Sync** | fetchQuizzesFromServer error | quizSyncError set | 🟢 PASSED |
| 1428 | **Quiz Sync** | fetchQuizHistory online | quizHistory populated | 🟢 PASSED |
| 1429 | **Quiz Sync** | isLoadingQuizzes tracking | true during fetch, false after | 🟢 PASSED |
| 1430 | **Quiz Sync** | Loading state management | isLoadingQuizzes lifecycle | 🟢 PASSED |

---

## Phase B4: Performance & Caching — Backend Unit Tests

### MemoryCacheServiceTests.cs (12 tests)

| STT | Phân hệ kiểm thử | Tính năng kiểm thử | Phương thức | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| 1431 | **MemoryCache** | Get returns null for missing key | Get<string>("missing") → null | 🟢 PASSED |
| 1432 | **MemoryCache** | Set and Get value | Set + Get returns value | 🟢 PASSED |
| 1433 | **MemoryCache** | Set with absolute expiration | Set(key, value, 1h) | 🟢 PASSED |
| 1434 | **MemoryCache** | Set with sliding expiration | Set(key, value, null, 30m) | 🟢 PASSED |
| 1435 | **MemoryCache** | Remove key | Remove(key) → Get returns null | 🟢 PASSED |
| 1436 | **MemoryCache** | RemoveByPrefix | RemoveByPrefix("test:") clears matched | 🟢 PASSED |
| 1437 | **MemoryCache** | RemoveByPrefix no match | No keys removed | 🟢 PASSED |
| 1438 | **MemoryCache** | TryGet existing | TryGet returns true + value | 🟢 PASSED |
| 1439 | **MemoryCache** | TryGet missing | TryGet returns false | 🟢 PASSED |
| 1440 | **MemoryCache** | Complex object caching | List<string> round-trip | 🟢 PASSED |
| 1441 | **MemoryCache** | Multiple key tracking | Set 3 keys, track all | 🟢 PASSED |
| 1442 | **MemoryCache** | Overwrite existing key | Set same key twice | 🟢 PASSED |

### PagedResultTests.cs (12 tests)

| STT | Phân hệ kiểm thử | Tính năng kiểm thử | Phương thức | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| 1443 | **Pagination** | Constructor sets properties | Items/Page/Size/Count | 🟢 PASSED |
| 1444 | **Pagination** | TotalPages calculation | 25 items / 10 → 3 pages | 🟢 PASSED |
| 1445 | **Pagination** | TotalPages exact division | 20 items / 10 → 2 pages | 🟢 PASSED |
| 1446 | **Pagination** | TotalPages single item | 1 item / 10 → 1 page | 🟢 PASSED |
| 1447 | **Pagination** | HasPreviousPage false | Page 1 → false | 🟢 PASSED |
| 1448 | **Pagination** | HasPreviousPage true | Page 2 → true | 🟢 PASSED |
| 1449 | **Pagination** | HasNextPage true | Page 1 of 3 → true | 🟢 PASSED |
| 1450 | **Pagination** | HasNextPage false | Page 3 of 3 → false | 🟢 PASSED |
| 1451 | **Pagination** | Empty items | 0 total → 0 pages | 🟢 PASSED |
| 1452 | **Pagination** | Large dataset | 1000 items / 50 → 20 pages | 🟢 PASSED |
| 1453 | **Pagination** | Items readonly | IReadOnlyList immutable | 🟢 PASSED |
| 1454 | **Pagination** | First and last page | Boundary navigation | 🟢 PASSED |

### CacheKeysTests.cs (9 tests)

| STT | Phân hệ kiểm thử | Tính năng kiểm thử | Phương thức | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| 1455 | **CacheKeys** | AlgorithmList constant | "algorithms:list" | 🟢 PASSED |
| 1456 | **CacheKeys** | AlgorithmMetadataPrefix | "algorithms:metadata:" | 🟢 PASSED |
| 1457 | **CacheKeys** | QuizList constant | "quizzes:list" | 🟢 PASSED |
| 1458 | **CacheKeys** | BadgeList constant | "badges:list" | 🟢 PASSED |
| 1459 | **CacheKeys** | LeaderboardPrefix | "leaderboard:top:" | 🟢 PASSED |
| 1460 | **CacheDurations** | AlgorithmMetadata 24h | TimeSpan.FromHours(24) | 🟢 PASSED |
| 1461 | **CacheDurations** | QuizList 30m | TimeSpan.FromMinutes(30) | 🟢 PASSED |
| 1462 | **CacheDurations** | BadgeList 1h | TimeSpan.FromHours(1) | 🟢 PASSED |
| 1463 | **CacheDurations** | Leaderboard 5m | TimeSpan.FromMinutes(5) | 🟢 PASSED |

---

## Phase B5: Real-time SignalR — Backend Unit Tests

### QuizRoomServiceTests.cs (27 tests)

| STT | Phân hệ kiểm thử | Tính năng kiểm thử | Phương thức | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| 1464 | **QuizRoom** | CreateRoom returns room with code | 6-char code, Waiting status | 🟢 PASSED |
| 1465 | **QuizRoom** | GetRoom existing room | Returns room DTO | 🟢 PASSED |
| 1466 | **QuizRoom** | GetRoom non-existent | Returns null | 🟢 PASSED |
| 1467 | **QuizRoom** | JoinRoom valid | Adds participant | 🟢 PASSED |
| 1468 | **QuizRoom** | JoinRoom non-existent room | Returns false | 🟢 PASSED |
| 1469 | **QuizRoom** | JoinRoom in-progress room | Returns false | 🟢 PASSED |
| 1470 | **QuizRoom** | JoinRoom duplicate user | Returns false | 🟢 PASSED |
| 1471 | **QuizRoom** | LeaveRoom removes participant | Count decreases | 🟢 PASSED |
| 1472 | **QuizRoom** | LeaveRoom last participant | Room deleted | 🟢 PASSED |
| 1473 | **QuizRoom** | StartQuiz by host | Status InProgress | 🟢 PASSED |
| 1474 | **QuizRoom** | StartQuiz by non-host | Returns false | 🟢 PASSED |
| 1475 | **QuizRoom** | StartQuiz already started | Returns false | 🟢 PASSED |
| 1476 | **QuizRoom** | SubmitAnswer correct | 100 points earned | 🟢 PASSED |
| 1477 | **QuizRoom** | SubmitAnswer wrong | 0 points earned | 🟢 PASSED |
| 1478 | **QuizRoom** | SubmitAnswer already answered | Returns null | 🟢 PASSED |
| 1479 | **QuizRoom** | SubmitAnswer wrong question index | Returns null | 🟢 PASSED |
| 1480 | **QuizRoom** | AdvanceQuestion increments | CurrentQuestionIndex + 1 | 🟢 PASSED |
| 1481 | **QuizRoom** | AdvanceQuestion last question | ShowingResults status | 🟢 PASSED |
| 1482 | **QuizRoom** | CompleteQuiz ranked results | Sorted by score desc | 🟢 PASSED |
| 1483 | **QuizRoom** | GetActiveRooms waiting only | Filters out InProgress | 🟢 PASSED |
| 1484 | **QuizRoom** | RemoveRoom success | Room deleted | 🟢 PASSED |
| 1485 | **QuizRoom** | RemoveRoom non-existent | Returns false | 🟢 PASSED |
| 1486 | **QuizRoom** | SubmitAnswer non-existent room | Returns null | 🟢 PASSED |
| 1487 | **QuizRoom** | SubmitAnswer waiting room | Returns null | 🟢 PASSED |
| 1488 | **QuizRoom** | SubmitAnswer non-participant | Returns null | 🟢 PASSED |
| 1489 | **QuizRoom** | RoomCode format | 6-char [A-Z2-9] | 🟢 PASSED |
| 1490 | **QuizRoom** | Multiple rooms unique codes | Different codes | 🟢 PASSED |

### SignalRDtosTests.cs (12 tests)

| STT | Phân hệ kiểm thử | Tính năng kiểm thử | Phương thức | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| 1491 | **SignalR DTOs** | LeaderboardUpdate defaults | Empty/zero values | 🟢 PASSED |
| 1492 | **SignalR DTOs** | LeaderboardUpdate properties | All fields set correctly | 🟢 PASSED |
| 1493 | **SignalR DTOs** | BadgeNotification properties | UserId/Name/Description | 🟢 PASSED |
| 1494 | **SignalR DTOs** | LevelUpNotification properties | OldLevel/NewLevel/TotalXP | 🟢 PASSED |
| 1495 | **SignalR DTOs** | QuizRoomDto defaults | Empty status Waiting | 🟢 PASSED |
| 1496 | **SignalR DTOs** | QuizRoomParticipant properties | Score/HasAnswered/IsHost | 🟢 PASSED |
| 1497 | **SignalR DTOs** | QuizQuestionBroadcast properties | 4 options, 30s limit | 🟢 PASSED |
| 1498 | **SignalR DTOs** | QuizAnswerResult properties | Correct/Points/Explanation | 🟢 PASSED |
| 1499 | **SignalR DTOs** | QuizRoomResults properties | Ranked by score | 🟢 PASSED |
| 1500 | **SignalR DTOs** | QuizRoomStatus expected values | 4 enum values | 🟢 PASSED |
| 1501 | **SignalR DTOs** | QuizRoomStatus count | Exactly 4 | 🟢 PASSED |
| 1502 | **SignalR DTOs** | AdvanceQuestion resets HasAnswered | All false after advance | 🟢 PASSED |

---

## Phase B5: Real-time SignalR — Frontend Unit Tests

### useSignalRStore.spec.ts (35 tests)

| STT | Phân hệ kiểm thử | Tính năng kiểm thử | Phương thức | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| 1503 | **SignalR Store** | Initial disconnected states | All 3 hubs disconnected | 🟢 PASSED |
| 1504 | **SignalR Store** | Initial empty data arrays | All arrays empty | 🟢 PASSED |
| 1505 | **SignalR Store** | Initial null room state | room/question/results null | 🟢 PASSED |
| 1506 | **SignalR Store** | Initial zero unread count | unreadNotificationCount = 0 | 🟢 PASSED |
| 1507 | **SignalR Store** | Initial false computed states | isConnected = false × 3 | 🟢 PASSED |
| 1508 | **SignalR Store** | Connect leaderboard | state → connected | 🟢 PASSED |
| 1509 | **SignalR Store** | Register LeaderboardUpdated handler | on() called with event | 🟢 PASSED |
| 1510 | **SignalR Store** | Handle leaderboard update | Array populated | 🟢 PASSED |
| 1511 | **SignalR Store** | Limit leaderboard to 50 | Truncate oldest | 🟢 PASSED |
| 1512 | **SignalR Store** | Disconnect leaderboard | state → disconnected | 🟢 PASSED |
| 1513 | **SignalR Store** | Handle connection error | state → error | 🟢 PASSED |
| 1514 | **SignalR Store** | Connect notifications with token | state → connected | 🟢 PASSED |
| 1515 | **SignalR Store** | Handle badge notification | Badge + unread++ | 🟢 PASSED |
| 1516 | **SignalR Store** | Handle level up notification | LevelUp + unread++ | 🟢 PASSED |
| 1517 | **SignalR Store** | Mark notifications read | unread → 0 | 🟢 PASSED |
| 1518 | **SignalR Store** | Disconnect notifications | state → disconnected | 🟢 PASSED |
| 1519 | **SignalR Store** | Connect quiz room | state → connected | 🟢 PASSED |
| 1520 | **SignalR Store** | Handle RoomCreated | currentRoom set | 🟢 PASSED |
| 1521 | **SignalR Store** | Handle ParticipantJoined | participants updated | 🟢 PASSED |
| 1522 | **SignalR Store** | Handle JoinFailed | errorMessage set | 🟢 PASSED |
| 1523 | **SignalR Store** | Handle NewQuestion | currentQuestion set | 🟢 PASSED |
| 1524 | **SignalR Store** | Handle AnswerResult | answerResults pushed | 🟢 PASSED |
| 1525 | **SignalR Store** | Handle ScoreUpdate | participants scores updated | 🟢 PASSED |
| 1526 | **SignalR Store** | Handle QuizCompleted | quizResults set, question null | 🟢 PASSED |
| 1527 | **SignalR Store** | Handle ActiveRooms | activeRooms populated | 🟢 PASSED |
| 1528 | **SignalR Store** | Invoke CreateRoom | hub.invoke('CreateRoom') | 🟢 PASSED |
| 1529 | **SignalR Store** | Invoke JoinRoom | hub.invoke('JoinRoom') | 🟢 PASSED |
| 1530 | **SignalR Store** | Invoke LeaveRoom + clear | hub.invoke + null room | 🟢 PASSED |
| 1531 | **SignalR Store** | Invoke StartQuiz | hub.invoke('StartQuiz') | 🟢 PASSED |
| 1532 | **SignalR Store** | Invoke SubmitAnswer | hub.invoke('SubmitAnswer') | 🟢 PASSED |
| 1533 | **SignalR Store** | Invoke NextQuestion | hub.invoke('NextQuestion') | 🟢 PASSED |
| 1534 | **SignalR Store** | Invoke GetActiveRooms | hub.invoke('GetActiveRooms') | 🟢 PASSED |
| 1535 | **SignalR Store** | Disconnect quiz room clears state | All null/empty | 🟢 PASSED |
| 1536 | **SignalR Store** | Disconnect all connections | All 3 disconnected | 🟢 PASSED |
| 1537 | **SignalR Store** | No-op when not connected | invoke not called | 🟢 PASSED |

### signalr.types.spec.ts (9 tests)

| STT | Phân hệ kiểm thử | Tính năng kiểm thử | Phương thức | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| 1538 | **SignalR Types** | LeaderboardUpdate creation | Type conformance | 🟢 PASSED |
| 1539 | **SignalR Types** | BadgeNotification creation | Type conformance | 🟢 PASSED |
| 1540 | **SignalR Types** | LevelUpNotification creation | newLevel > oldLevel | 🟢 PASSED |
| 1541 | **SignalR Types** | QuizRoomDto with participants | roomCode length 6 | 🟢 PASSED |
| 1542 | **SignalR Types** | QuizQuestionBroadcast creation | 4 options, 30s limit | 🟢 PASSED |
| 1543 | **SignalR Types** | QuizAnswerResult creation | isCorrect + points | 🟢 PASSED |
| 1544 | **SignalR Types** | QuizRoomResults creation | Rankings sorted by score | 🟢 PASSED |
| 1545 | **SignalR Types** | QuizRoomStatus values | 4 status values | 🟢 PASSED |
| 1546 | **SignalR Types** | SignalRConnectionState values | 5 state values | 🟢 PASSED |


### sorting.spec.ts (Bucket Sort tests)

| STT | Phân hệ kiểm thử | Tính năng kiểm thử | Phương thức | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| 1547 | **Bucket Sort** | Sắp xếp mảng kết quả hoàn chỉnh | Trả về mảng đã sắp xếp ở frame cuối cùng | 🟢 PASSED |
| 1548 | **Bucket Sort** | Sinh stable ID duy nhất | Mỗi frame có arrayStateWithIds chứa ID ổn định | 🟢 PASSED |
| 1549 | **Bucket Sort** | Phân phối đúng dải giá trị | Phần tử phân loại đúng khay [0-25), [25-50), [50-75), [75-100] | 🟢 PASSED |


### dummyGenerators.spec.ts (Binary & Linear Search tests)

| STT | Phân hệ kiểm thử | Tính năng kiểm thử | Phương thức | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| 1550 | **Search Generators** | Linear Search target matching | Xác nhận highlights.target lưu trữ giá trị target chính xác | 🟢 PASSED |
| 1551 | **Search Generators** | Linear Search not found | Xác nhận không tìm thấy trả về highlights.found === null | 🟢 PASSED |
| 1552 | **Search Generators** | Binary Search target matching | Xác nhận highlights.target khớp chính xác với target tìm kiếm | 🟢 PASSED |
| 1553 | **Search Generators** | Binary Search pointers | Kiểm tra Low/Mid/High pointers được tính toán đầy đủ | 🟢 PASSED |


### interactivePlayground.spec.ts (1 test mới)

| STT | Phân hệ kiểm thử | Tính năng kiểm thử | Phương thức | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| 1554 | **Interactive Playground** | Manages hovered states for nodes and edges | Kiểm tra hoveredNodeId và hoveredEdgeId được set đúng và reset khi node/edge bị xóa | 🟢 PASSED |



### Phase 4 VCR UI Integration — End-to-End Browser Tests

| STT | Phân hệ kiểm thử | Tính năng kiểm thử | Phương thức | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| 1555 | **SOLID VCR** | SRP Scenario VCR Playback | Click SRP → SHOW_VIOLATION badge + Vietnamese "VI PHẠM SRP", Frame 1/4, Prev disabled | 🟢 PASSED |
| 1556 | **SOLID VCR** | Frame Navigation (Next/Prev/Reset) | Next×2 → Frame 3/4 SPLIT_CLASS, Reset → Frame 1/4 SHOW_VIOLATION | 🟢 PASSED |
| 1557 | **SOLID VCR** | Exit VCR Sandbox Restore | Exit → lesson tabs (SRP/OCP/LSP/ISP/DIP) + God Class card reappear | 🟢 PASSED |
| 1558 | **Patterns VCR** | Observer Scenario VCR Playback | Click Observer → SETUP badge + Vietnamese "IObserver/notify()", Frame 1/4, canvas hidden | 🟢 PASSED |
| 1559 | **Patterns VCR** | Frame End Boundary | Navigate to Frame 4/4 CONCLUSION, Next button disabled | 🟢 PASSED |
| 1560 | **Patterns VCR** | Exit VCR Sandbox Restore | Exit → canvas + UML nodes + scenario tabs restored | 🟢 PASSED |
| 1561 | **DI VCR** | Lifetime Scenario VCR Playback | Click Lifetime Demo → REGISTER_SERVICES + Vietnamese "DI Container", Frame 1/5 (5 frames) | 🟢 PASSED |
| 1562 | **DI VCR** | Frame Badge Change | Next → Frame 2/5 RESOLVE_SINGLETON_NEW, badge changed from REGISTER_SERVICES | 🟢 PASSED |
| 1563 | **DI VCR** | Exit VCR Sandbox Restore | Exit → IoC concept box + service panels + dependency graph + Resolution Demo restored | 🟢 PASSED |
| 1564 | **Quiz API** | GET /concepts/quiz/all | Returns 6 quizzes with Vietnamese titles (sorting, graph, OOP, SOLID, patterns, DI) | 🟢PASSED |
| 1565 | **Quiz API** | GET /concepts/quiz/{id} | Returns quiz detail with questions, options, correctIndex, Vietnamese explanations | 🟢PASSED |
| 1566 | **Quiz API** | POST /concepts/quiz/submit (correct) | score=5, maxScore=5, passed=true, xpAwarded=50, all isCorrect=true | 🟢PASSED |
| 1567 | **Quiz API** | POST /concepts/quiz/submit (wrong) | score<70%, passed=false, xpAwarded=0, incorrect items marked | 🟢PASSED |
| 1568 | **Quiz API** | GET /concepts/quiz/invalid-id | HTTP 404 with QUIZ_NOT_FOUND error | 🟢PASSED |
| 1569 | **Gamification API** | GET /concepts/gamification/profile | demo-user profile with 150 XP, Level 2 Explorer, 3 streak, 1 badge | 🟢PASSED |
| 1570 | **Gamification API** | POST /concepts/gamification/award-xp | XP increments, level updates, new badges auto-awarded at thresholds | 🟢PASSED |
| 1571 | **Gamification API** | GET /concepts/gamification/badges | 8 badges with Vietnamese descriptions, earned/locked status | 🟢PASSED |
| 1572 | **Gamification API** | GET /concepts/gamification/leaderboard | 10 mock entries ranked by XP with level names | 🟢PASSED |
| 1573 | **Gamification API** | GET /concepts/gamification/config | Levels (8) + badges (8) + xpEvents (4) config | 🟢PASSED |
| 1574 | **Quiz Frontend** | Quiz catalog loads from backend | 6 quiz cards displayed with difficulty badges and XP rewards | 🟢PASSED |
| 1575 | **Quiz Frontend** | Quiz flow (select→navigate→submit) | A/B/C/D options, prev/next, submit, result with explanations | 🟢PASSED |
| 1576 | **Gamification Frontend** | Profile loads from backend | XP + Level + LevelName from server displayed in header | 🟢PASSED |
| 1577 | **Gamification Frontend** | Leaderboard from backend | 10 entries with rank/username/XP/level, current user highlighted | 🟢PASSED |
| 1578 | **Gamification Frontend** | +50 XP via backend API | Button calls award-xp endpoint, XP updates reactively | 🟢PASSED |
| 1579 | **Compilation** | dotnet build + vue-tsc | Backend 0 errors, Frontend vue-tsc --noEmit 0 errors | 🟢PASSED |
| 1580 | **Auth API** | POST /concepts/auth/login (correct) | Returns accessToken + refreshToken + user with 150 XP | 🟢PASSED |
| 1581 | **Auth API** | POST /concepts/auth/login (wrong password) | HTTP 401 LOGIN_FAILED | 🟢PASSED |
| 1582 | **Auth API** | POST /concepts/auth/register (new) | Returns accessToken + new user with 0 XP | 🟢PASSED |
| 1583 | **Auth API** | POST /concepts/auth/register (duplicate email) | HTTP 400 REGISTRATION_FAILED | 🟢PASSED |
| 1584 | **Auth API** | POST /concepts/auth/register (weak password) | HTTP 400 password < 8 chars | 🟢PASSED |
| 1585 | **Auth API** | POST /concepts/auth/refresh | New token pair, old token revoked (rotation) | 🟢PASSED |
| 1586 | **Auth API** | POST /concepts/auth/logout | HTTP 204 No Content | 🟢PASSED |
| 1587 | **Auth API** | GET /concepts/auth/me | Demo user profile (150 XP, Level 2) | 🟢PASSED |
| 1588 | **Auth API** | GET /concepts/auth/progress | Level progress with XP thresholds | 🟢PASSED |
| 1589 | **Auth API** | POST /concepts/auth/award-xp | XP increases, level-up triggers | 🟢PASSED |
| 1590 | **Auth API** | PUT /concepts/auth/profile | Username updated | 🟢PASSED |
| 1591 | **Auth Frontend** | LoginModal component | Modal opens/closes, form validation, demo credentials shown | 🟢PASSED |
| 1592 | **Auth Frontend** | Session persistence (F5 reload) | Refresh token in localStorage auto-restores session | 🟢PASSED |
| 1593 | **Auth Frontend** | User badge in header | Avatar initial + name + XP + level conditionally rendered | 🟢PASSED |
| 1594 | **Auth Frontend** | Logout flow | Session cleared, header reverts to guest mode | 🟢PASSED |
| 1595 | **Compilation** | dotnet build + vue-tsc | Backend 0 errors, Frontend vue-tsc --noEmit 0 errors | 🟢PASSED |
| 1600 | **Payment API** | GET /concepts/payment/config | Returns price, bank, features | 🟢PASSED |
| 1601 | **Payment API** | POST /concepts/payment/checkout | Creates order + QR URL + paymentCode | 🟢PASSED |
| 1602 | **Payment API** | GET /concepts/payment/orders/{id}/status | Pending → Completed tracking | 🟢PASSED |
| 1603 | **Payment API** | POST /concepts/payment/simulate-webhook | Status flips Completed + Premium | 🟢PASSED |
| 1604 | **Payment API** | POST /concepts/payment/verify | Status → Completed, user Premium | 🟢PASSED |
| 1605 | **Payment API** | GET /concepts/payment/premium-status | isPremium + plan + features | 🟢PASSED |
| 1606 | **Payment API** | POST checkout when already Premium | 409 ALREADY_PREMIUM | 🟢PASSED |
| 1607 | **Payment API** | GET /concepts/payment/check-access | Gating by premium/free feature | 🟢PASSED |
| 1608 | **Payment API** | GET /concepts/payment/transactions | Transaction log entries | 🟢PASSED |
| 1609 | **Payment API** | GET order not found | 404 ORDER_NOT_FOUND | 🟢PASSED |
| 1610 | **Payment Frontend** | PremiumCheckoutView refactored | Uses Pinia store, no any types | 🟢PASSED |
| 1611 | **Payment Frontend** | Premium crown badge + PRO tag | Crown glow + gold avatar + PRO | 🟢PASSED |
| 1612 | **Payment Frontend** | PremiumGate component | Blur + overlay for free users | 🟢PASSED |
| 1613 | **Payment Frontend** | Sidebar Premium tab | Account group with Premium nav | 🟢PASSED |
| 1614 | **Compilation** | dotnet build + vue-tsc | Backend 0 errors, Frontend 0 errors | 🟢PASSED |
| 1700 | **Error Middleware** | GET /diagnostics/health | Returns success:true + timestamp | 🟢PASSED |
| 1701 | **Error Middleware** | simulate-error?type=500 | INTERNAL_SERVER_ERROR + JSON | 🟢PASSED |
| 1702 | **Error Middleware** | simulate-error?type=400 | VALIDATION_ERROR | 🟢PASSED |
| 1703 | **Error Middleware** | simulate-error?type=401 | AUTHENTICATION_REQUIRED | 🟢PASSED |
| 1704 | **Error Middleware** | simulate-error?type=404 | RESOURCE_NOT_FOUND | 🟢PASSED |
| 1705 | **Error Middleware** | simulate-error?type=409 | OPERATION_CONFLICT | 🟢PASSED |
| 1706 | **Error Middleware** | simulate-error?type=501 | NOT_IMPLEMENTED | 🟢PASSED |
| 1707 | **Error Middleware** | JSON format consistency | 7 common fields + 3 debug | 🟢PASSED |
| 1708 | **Toast System** | useToastStore Pinia store | success/error/warning/info methods | 🟢PASSED |
| 1709 | **Toast System** | ToastContainer.vue | Teleport + slide animation | 🟢PASSED |
| 1710 | **Skeleton Loaders** | SkeletonLoader.vue | 4 variants + shimmer wave | 🟢PASSED |
| 1711 | **Skeleton Loaders** | AlgorithmDashboard skeleton | 6 shimmer cards on loading | 🟢PASSED |
| 1712 | **Skeleton Loaders** | BackendQuizWorkspace skeleton | 6 shimmer cards on loading | 🟢PASSED |
| 1713 | **Page Transitions** | slide-up + fade enhanced | translateY 8px enter, -4px leave | 🟢PASSED |
| 1714 | **Compilation** | dotnet build + vue-tsc | Backend 0 errors, Frontend 0 errors | 🟢PASSED |
| 1720 | **Confetti** | useConfetti composable | firePremium/fireQuizPass/fireSuccess functions | 🟢PASSED |
| 1721 | **Confetti** | PremiumCheckoutView integration | firePremium on payment success state | 🟢PASSED |
| 1722 | **Confetti** | BackendQuizWorkspace integration | fireQuizPass on backendResult.passed watch | 🟢PASSED |
| 1723 | **VCR Physics** | BoxArrayRenderer easing | easeOutQuart + 420ms duration | 🟢PASSED |
| 1724 | **VCR Transitions** | DesignPatternsWorkspace | vcr-banner-fade Transition wrapper | 🟢PASSED |
| 1725 | **VCR Transitions** | SOLIDVisualizerWorkspace | vcr-banner-fade Transition wrapper | 🟢PASSED |
| 1726 | **VCR Transitions** | DISandbox | vcr-banner-fade Transition wrapper | 🟢PASSED |
| 1727 | **Glassmorphism** | App sidebar | blur(20px) saturate(1.4) glassmorphic | 🟢PASSED |
| 1728 | **Glassmorphism** | App header | blur(16px) saturate(1.3) glassmorphic | 🟢PASSED |
| 1729 | **Glassmorphism** | Login Modal | blur(24px) saturate(1.5) + spring scale transition | 🟢PASSED |
| 1730 | **Glassmorphism** | Dashboard Cards | blur(12px) + spring hover animation | 🟢PASSED |
| 1731 | **Motion CSS** | cinematic.css | spring-hover, glass-panel, vcr-frame-enter, stagger-enter | 🟢PASSED |
| 1732 | **Dependencies** | canvas-confetti + @vueuse/motion | Installed + MotionPlugin registered | 🟢PASSED |
| 1733 | **Compilation** | dotnet build + vue-tsc | Backend 0 errors, Frontend 0 errors | 🟢PASSED |
| 1740 | **Design Tokens** | design-tokens.css | 65+ CSS variables centralized | 🟢PASSED |
| 1741 | **Component** | VcrControls.vue | Shared VCR playback panel | 🟢PASSED |
| 1742 | **Component** | ConceptScenarioPicker.vue | Shared scenario picker | 🟢PASSED |
| 1743 | **Component** | VcrExplanationBanner.vue | Shared VCR banner with transition | 🟢PASSED |
| 1744 | **Refactor** | DesignPatternsWorkspace | Uses shared VCR components | 🟢PASSED |
| 1745 | **Refactor** | SOLIDVisualizerWorkspace | Uses shared VCR components | 🟢PASSED |
| 1746 | **Refactor** | DISandbox | Uses shared VCR components | 🟢PASSED |
| 1747 | **Backend OCP** | AlgorithmDIConfiguration | RegisterByInterface<T> reflection | 🟢PASSED |
| 1748 | **Architecture** | Domain.csproj | 0 outward dependencies verified | 🟢PASSED |
| 1749 | **Compilation** | dotnet build + vue-tsc | Backend 0 errors, Frontend 0 errors | 🟢PASSED |
| 1750 | **BugFix** | CustomInputPanel sidebar | overflow-hidden + scrollable build tab | 🟢PASSED |
| 1751 | **BugFix** | PlaygroundCanvas resize | Zero-dimension guard prevents NaN scaling | 🟢PASSED |
| 1752 | **BugFix** | InteractivePlayground | min-h-[200px] prevents canvas collapse | 🟢PASSED |
| 1753 | **BugFix** | DI select dropdown | option dark mode bg/text styling | 🟢PASSED |
| 1754 | **BugFix** | EdgeBuilderForm select | option dark mode bg/text styling | 🟢PASSED |
| 1755 | **BugFix** | CustomInputPanel select | option dark mode bg/text styling | 🟢PASSED |
| 1756 | **BugFix** | PatternsView layout | w-full p-4 removes centering constraint | 🟢PASSED |
| 1757 | **BugFix** | DesignPatternsCanvas | Responsive height + ResizeObserver | 🟢PASSED |
| 1758 | **BugFix** | DesignPatternsWorkspace | width: 100% fills parent | 🟢PASSED |
| 1759 | **Config** | vite.config.ts | port: 5173 + strictPort: true | 🟢PASSED |
| 1760 | **Compilation** | dotnet build + vue-tsc | Backend 0 errors, Frontend 0 errors | 🟢PASSED |
| 1761 | **Automation** | run-project.bat | Windows startup script (backend+frontend) | 🟢PASSED |
| 1762 | **Automation** | run-project.sh | macOS/Linux startup script with cleanup trap | 🟢PASSED |
| 1763 | **Port Migration** | 21 frontend service files | localhost:5050 → localhost:5055 | 🟢PASSED |
| 1764 | **Port Migration** | 4 Vietnamese test guides | curl commands updated to 5055 | 🟢PASSED |
| 1765 | **Compilation** | dotnet build + vue-tsc | Backend 0 errors, Frontend 0 errors | 🟢PASSED |
| 1766 | **Security** | Syntax Error Toast | useToastStore.error() on AST compile failure | 🟢PASSED |
| 1767 | **Security** | Infinite Loop Toast | useToastStore.warning() on __loopCounter > 5000 | 🟢PASSED |
| 1768 | **Security** | Runtime Eval Guard | try/catch on new Function() eval | 🟢PASSED |
| 1769 | **Docs** | walkthrough.md | Code Debugger resilience documentation | 🟢PASSED |
| 1770 | **Compilation** | dotnet build + vue-tsc | Backend 0 errors, Frontend 0 errors | 🟢PASSED |
| 1771 | **DB** | Auth Register → PostgreSQL | POST /register persists User to Users table | 🟢PASSED |
| 1772 | **DB** | Auth Login → PostgreSQL | POST /login updates LastLoginAt in DB | 🟢PASSED |
| 1773 | **DB** | AwardXP → PostgreSQL | POST /award-xp persists XP changes | 🟢PASSED |
| 1774 | **DB** | Leaderboard → PostgreSQL | GET /leaderboard reads live from Users table | 🟢PASSED |
| 1775 | **DB** | Seed Users | 10 Vietnamese users seeded with correct XP/levels | 🟢PASSED |
| 1776 | **DB** | EF Migrations | 5 migrations applied, 9 tables created | 🟢PASSED |
| 1777 | **UI** | Landing Page | `/#/` neon gradient hero, 8-card feature grid, stats bar | 🟢PASSED |
| 1778 | **UI** | Dashboard Hub | `/#/dashboard` greeting, XP progress wheel, top 3 badges | 🟢PASSED |
| 1779 | **Auth** | User.Role Backend | Student/Teacher role in User entity + StatelessAuthStrategy | 🟢PASSED |
| 1780 | **Auth** | Role Router Guards | beforeEach: requiresAuth, requiresRole navigation guards | 🟢PASSED |
| 1781 | **Auth** | Sidebar Role Filter | Teacher Panel tab hidden for Student users | 🟢PASSED |
| 1782 | **Admin** | Teacher Panel | `/#/teacher` analytics grid + quiz management form | 🟢PASSED |
| 1783 | **API** | POST quiz/manage | Adds new quiz to in-memory bank via Teacher Panel | 🟢PASSED |
| 1784 | **API** | GET quiz/analytics | Quiz stats: total, attempts, pass rate | 🟢PASSED |
| 1785 | **DB** | AddUserRole Migration | Role column (varchar 20, default Student) added to Users table | 🟢PASSED |
| 1786 | **Compilation** | dotnet build + vue-tsc | Backend 0 errors, Frontend 0 errors | 🟢PASSED |
| 1787 | **DB** | Auth Login → DB sync | Login response overrides Role/IsPremium/TotalXP from PostgreSQL | 🟢PASSED |
| 1788 | **DB** | Quiz manage → DB | POST /quiz/manage persists Quiz + QuizQuestions to PostgreSQL | 🟢PASSED |
| 1789 | **DB** | Payment verify → DB | POST /payment/verify persists isPremium=true in Users table | 🟢PASSED |
| 1790 | **DB** | Payment webhook → DB | POST /simulate-webhook persists isPremium=true in Users table | 🟢PASSED |
| 1791 | **Port** | SKILL.md port sweep | 18 references localhost:5050 → localhost:5055 | 🟢PASSED |
| 1792 | **Compilation** | dotnet build + vue-tsc | Backend 0 errors, Frontend 0 errors | 🟢PASSED |
| 1793 | **Docker** | docker-compose.yml | 3 services: postgres:15 + .NET 9 backend + nginx:alpine frontend | 🟢PASSED |
| 1794 | **Docker** | Backend Dockerfile | Multi-stage sdk:9.0 → aspnet:9.0 Release build | 🟢PASSED |
| 1795 | **Docker** | Frontend Dockerfile | Multi-stage node:20 → nginx:alpine with VITE_API_BASE_URL | 🟢PASSED |
| 1796 | **Docker** | nginx.conf | SPA routing + gzip + static caching | 🟢PASSED |
| 1797 | **Docker** | DB health check | pg_isready with service_healthy condition | 🟢PASSED |
| 1798 | **Compilation** | dotnet build + vue-tsc | Backend 0 errors, Frontend 0 errors | 🟢PASSED |
| 1799 | **WebGPU** | WebGpuPipeline.ts | probeWebGpu() + initCanvasContext() + createComputePipeline() | 🟢PASSED |
| 1800 | **WebGPU** | WGSL Compute Shader | GRAPH_FORCE_COMPUTE_WGSL Coulomb repulsion kernel | 🟢PASSED |
| 1801 | **WebGPU** | Dashboard Badge | Glowing "WebGPU Engine: READY" with gpuGlow animation | 🟢PASSED |
| 1802 | **WebGPU** | @webgpu/types | TypeScript type definitions registered in tsconfig.app.json | 🟢PASSED |
| 1803 | **Compilation** | dotnet build + vue-tsc | Backend 0 errors, Frontend 0 errors | 🟢PASSED |
| 1804 | **WASM** | Vite WASM config | worker format 'es', assetsInclude '*.wasm', optimizeDeps exclude | 🟢PASSED |
| 1805 | **WASM** | WasmComputeWorker | Web Worker init/compute/abort protocol + WASM instantiation | 🟢PASSED |
| 1806 | **WASM** | Transferable bridge | createWasmBridge() zero-copy ArrayBuffer transfer API | 🟢PASSED |
| 1807 | **WASM** | JS fallback compute | sort + graph-force algorithms with iteration guard | 🟢PASSED |
| 1808 | **Compilation** | dotnet build + vue-tsc | Backend 0 errors, Frontend 0 errors | 🟢PASSED |
| 1809 | **CRDT** | yjs dependency | CRDT library installed for decentralized state sync | 🟢PASSED |
| 1810 | **CRDT** | CollaborativeGraphStore | Y.Doc binding with conflict-free graph operations | 🟢PASSED |
| 1811 | **CRDT** | Node locking | moveNode acquires lock, releaseNodeLock clears it | 🟢PASSED |
| 1812 | **CRDT** | Awareness layer | Peer cursors + presence tracking | 🟢PASSED |
| 1813 | **Network** | WebTransportClient | HTTP/3 stub + WebSocket fallback + local mode | 🟢PASSED |
| 1814 | **Network** | createCollabTransport | Factory wiring CRDT ↔ transport bridge | 🟢PASSED |
| 1815 | **Compilation** | dotnet build + vue-tsc | Backend 0 errors, Frontend 0 errors | 🟢PASSED |
| 1816 | **i18n** | Sidebar tabs | 15 tabs translated to Vietnamese | 🟢PASSED |
| 1817 | **i18n** | Route meta titles | 13 active route titles translated | 🟢PASSED |
| 1818 | **i18n** | Landing Page | Feature cards + stats + CTA Vietnamese | 🟢PASSED |
| 1819 | **i18n** | Dashboard quick links | 4 quick link labels Vietnamese | 🟢PASSED |
| 1820 | **i18n** | Teacher Panel | Title + badge Vietnamese | 🟢PASSED |
| 1821 | **i18n** | Graph View tabs | 2 tab names Vietnamese | 🟢PASSED |
| 1822 | **Responsive** | Global breakpoints | 768px tablet + 480px phone styles | 🟢PASSED |
| 1823 | **Responsive** | App shell | Header compact + sidebar mobile horizontal | 🟢PASSED |
| 1824 | **Responsive** | Landing | Hero scaling + CTA stacking + grid 1-col | 🟢PASSED |
| 1825 | **Responsive** | Dashboard | Grid 1-col + XP wheel + quicklinks grid | 🟢PASSED |
| 1826 | **Responsive** | Teacher Panel | Analytics stack + form stack + options 1-col | 🟢PASSED |
| 1827 | **Compilation** | dotnet build + vue-tsc | Backend 0 errors, Frontend 0 errors | 🟢PASSED |
| 1828 | **Graph RAG** | SemanticGraphService all nodes/edges/stats | Trả về 3 nodes, 2 edges, density 0.3333, categoryCount 3 | 🟢 PASSED |
| 1829 | **Graph RAG** | Order by importance desc | Nodes sắp xếp giảm dần theo Importance | 🟢 PASSED |
| 1830 | **Graph RAG** | Degree computation | Degree = incoming + outgoing edges đúng cho từng node | 🟢 PASSED |
| 1831 | **Graph RAG** | Induced subgraph filter | category=OOP → 1 node, 0 cross-category edges | 🟢 PASSED |
| 1832 | **Graph RAG** | Empty graph | 0 nodes/edges, density 0 | 🟢 PASSED |
| 1833 | **Event Sourcing** | AppendAsync persist frame | Frame ghi đúng EventType/Method/Status/Payload, Sequence>0, OccurredAt UTC | 🟢 PASSED |
| 1834 | **Event Sourcing** | Default empty payload | Payload null → "{}" | 🟢 PASSED |
| 1835 | **Event Sourcing** | Monotonic sequence | 3 frames có Sequence tăng dần | 🟢 PASSED |
| 1836 | **Event Sourcing** | Immutable interceptor blocks UPDATE | SaveChanges ném InvalidOperationException khi Modified | 🟢 PASSED |
| 1837 | **Event Sourcing** | Immutable interceptor blocks DELETE | SaveChanges ném InvalidOperationException khi Deleted | 🟢 PASSED |
| 1838 | **Event Sourcing** | Immutable interceptor allows APPEND | Append (Added) không bị chặn | 🟢 PASSED |
| 1839 | **Compilation** | dotnet test full suite | Backend 19/19 tests PASS | 🟢 PASSED |
| 1840 | **UI/UX Layout** | PseudocodeViewer scrollbar & wrap | Cuộn dọc độc lập, không tràn panel, thụt lề dòng lệnh chính xác | 🟢 PASSED |
| 1841 | **UI/UX Layout** | Glassmorphic HUD Step Card | Nền mờ kính tương phản cao, tự động mờ 90% khi di chuột vào | 🟢 PASSED |
| 1842 | **Localization** | Spellcheck Vietnamese UI labels | Nhãn "Mô phỏng" và "Lý thuyết" hiển thị đúng ký tự có dấu | 🟢 PASSED |
| 1843 | **Compilation** | vue-tsc production build | Biên dịch frontend không có lỗi kiểu dữ liệu nghiêm ngặt | 🟢 PASSED |
| 1844 | **Excel Parser** | Parse multiple quizzes | Phân tích mảng hàng Excel thành DTO cấu trúc Quiz hoàn chỉnh | 🟢 PASSED |
| 1845 | **Excel Parser** | Skip empty titles | Bỏ qua các hàng có tiêu đề trống | 🟢 PASSED |
| 1846 | **Excel Parser** | Validation warnings | Trả lỗi khi thiếu câu hỏi, thiếu đáp án A/B, hoặc chỉ mục đáp án đúng sai | 🟢 PASSED |
| 1847 | **Compilation** | npm run test | Frontend 1531/1531 tests PASS (bao gồm 3 test mới) | 🟢 PASSED |
| 1848 | **Guided Tour** | should initialize with default inactive state | `isActive=false`, `currentStepIndex=0`, `steps.length > 0` | 🟢 PASSED |
| 1849 | **Guided Tour** | should start the tour and reset step index to 0 | `isActive=true`, `currentStepIndex=0` | 🟢 PASSED |
| 1850 | **Guided Tour** | should advance to next step | Increments `currentStepIndex` to 1 | 🟢 PASSED |
| 1851 | **Guided Tour** | should complete tour when calling nextStep on the last step | Sets `isActive=false`, writes `guided_tour_seen=true` to localStorage | 🟢 PASSED |
| 1852 | **Guided Tour** | should go to previous step and prevent going below 0 | Clamps `currentStepIndex` to 0 | 🟢 PASSED |
| 1853 | **Guided Tour** | should skip tour and write to localStorage | Sets `isActive=false`, writes `guided_tour_seen=true` to localStorage | 🟢 PASSED |
| 1854 | **Guided Tour** | should automatically init and start tour if guided_tour_seen is not set | Sets `isActive=true` | 🟢 PASSED |
| 1855 | **Guided Tour** | should not start tour during init if guided_tour_seen is set to true | `isActive` remains `false` | 🟢 PASSED |
| 1856 | **Compilation** | npm run test | Frontend 1539/1539 tests PASS (bao gồm 8 test mới) | 🟢 PASSED |



| 1857 | **Auth Strategy** | Update InMemoryUser fields | Nickname, Bio, University persisted | 🟢 PASSED |
| 1858 | **Auth API** | PUT /concepts/auth/profile DTO mapping | Correct mapping of optional properties | 🟢 PASSED |
| 1859 | **Auth Store** | updateProfile Pinia action | updates state.user reactively | 🟢 PASSED |
| 1860 | **Profile E2E** | Edit user profile flow | Nickname, Bio, University edited + saved successfully, Toast shown | 🟢 PASSED |
| 1861 | **Profile Navigation** | Navigation via header avatar click | Clicking avatar badge correctly routes to /profile | 🟢 PASSED |
| 1862 | **Profile UI** | Level progression & badges render | Correctly displays level XP progress & cabinet badges | 🟢 PASSED |
| 1863 | **Admin Security** | RequireToken() on AdminController | Unauthenticated requests return 401 | ✅ PASSED |
| 1864 | **Teacher Security** | RequireToken() on StatelessQuizController | Unauthenticated write requests return 401 | ✅ PASSED |
| 1865 | **Excel Import Compatibility** | Title parsing with fallback | Supports "Tiêu đề trắc nghiệm" and "Tiêu đề Quiz" | ✅ PASSED |
| 1866 | **Diagnostics Scanner** | Local UI/UX Diagnostics | 15 routes diagnostic sweep successfully passed | ✅ PASSED |
| 1867 | **Guided Tour** | HelpButton trigger on /compare | Renders HelpButton and manually triggers /compare tour | ✅ PASSED |
| 1868 | **Guided Tour** | HelpButton trigger on /graph | Renders HelpButton and manually triggers /graph tour | ✅ PASSED |
| 1869 | **Guided Tour** | should correctly load tour steps for newly added academic routes | Validates steps for /compare, /graph, /system, etc. | ✅ PASSED |
| 1870 | **Compilation** | npm run test | Frontend 1548/1548 tests PASS (including page-specific tour tests) | ✅ PASSED |

| 1871 | **Guided Tour** | handleResize event listener safety | Resizing window does not crash app, handles skipScroll correctly | ✅ PASSED |
| 1872 | **Compilation** | npm run build | Production compilation passes with zero TypeScript warnings | ✅ PASSED || 1873 | **Compare UI** | Custom glassmorphic dropdowns | Replaced native HTML select elements with custom glassmorphic dropdown components | 🟢 PASSED |
| 1874 | **Compare UI** | Click outside dropdown logic | Click outside closes the open left/right dropdowns correctly | 🟢 PASSED |
| 1875 | **Compare UI** | Help button integration | Help button successfully embedded inside CompareAlgorithmSelector | 🟢 PASSED |
| 1876 | **Concurrency UI** | Absolute positioned status badges | Fixed-width state badges do not collide with rail track paths | 🟢 PASSED |
| 1877 | **Concurrency UI** | High-contrast state badges | Opacity increased to 15% (bg/15) for improved text readability | 🟢 PASSED |
| 1878 | **Concurrency UI** | Mutex toggle layout | Neon cyan glow and subpixel transforms applied to Mutex toggle | 🟢 PASSED |
| 1879 | **Navigation Cleanup** | Remove redundant State Inspector links | Centralized /state workspace access, removed duplicate link in IDE view | 🟢 PASSED |
| 1880 | **Compilation** | dotnet test + npm run test | Both suites run fully green with zero warnings/errors | 🟢 PASSED || 1881 | **Authentication** | Token refresh atomic lock | Prevent concurrent refresh token calls | âœ… PASSED |
| 1882 | **Authentication** | Progress load retry | Retry fetch on 401 transparently | âœ… PASSED |
| 1883 | **Guided Tour** | should support action scripts and run simulation successfully | Verifies DOM script playback using virtual cursor coordinates | âœ… PASSED |
| 1884 | **Compilation** | npm run test | Frontend 1555/1555 tests PASS (including simulation test cases) | âœ… PASSED |
| 1885 | **Guided Tour** | should correctly load tour steps for newly added academic routes | Expand testCases array to verify all 12 academic modules (including /sorting) | 🟢 PASSED |
| 1886 | **Compilation** | npm run test | Frontend 1549/1549 tests PASS with all 12-step guided tour validations | 🟢 PASSED |
