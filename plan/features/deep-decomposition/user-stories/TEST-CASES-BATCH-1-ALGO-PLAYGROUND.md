# 🧪 TEST CASES — VisualizationDSA User Stories

> Test cases được sinh từ file USER-STORIES.md.  
> Mỗi test case map 1–1 với 1 user story.  
> Chia thành 8 batch chạy song song (mỗi batch ~85–100 test).  
> Ngày cập nhật: 2026-08-04

---

## 📋 CẤU TRÚC TEST CASE

Mỗi test case có dạng:

```
TC-XXX-NNN: [Tên test]
Story: US-XXX-NNN
Priority: P0 (critical) | P1 (high) | P2 (medium)
Type: unit | component | integration | e2e
Steps:
  1. ...
  2. ...
Expected: ...
Evidence: file:line
```

---

## 🔴 BATCH 1: Algo Playground (US-AP-001 → US-AP-037)

### TC-AP-001: Chọn thuật toán mẫu từ dropdown
- **Story:** US-AP-001
- **Priority:** P1
- **Type:** component
- **Setup:** Mount AlgoPlaygroundWorkspace, mock Monaco + compileWorker
- **Steps:**
  1. Mở dropdown select.algo-demo-select
  2. Chọn option "binary-search"
  3. Kiểm tra code mẫu được nạp vào editor
- **Expected:** Editor chứa code binary-search, demo description hiển thị "Tìm kiếm nhị phân"
- **Evidence:** `AlgoPlaygroundWorkspace.vue:6-18`

### TC-AP-002: Xem chip độ phức tạp
- **Story:** US-AP-002
- **Priority:** P2
- **Type:** component
- **Steps:**
  1. Chọn demo "quick-sort"
  2. Kiểm tra chip ⏱ hiển thị
- **Expected:** Chip hiển thị complexity O(n log n) và space O(log n)
- **Evidence:** `AlgoPlaygroundWorkspace.vue:19-20`

### TC-AP-003: Nhập dữ liệu đầu vào
- **Story:** US-AP-003
- **Priority:** P1
- **Type:** component
- **Steps:**
  1. Nhập "5,3,8,1,9" vào ô input
  2. Kiểm tra validation hint
- **Expected:** Hiển thị "5 phần tử" màu xanh
- **Evidence:** `AlgoPlaygroundWorkspace.vue:25-31`

### TC-AP-004: Validation input realtime
- **Story:** US-AP-004
- **Priority:** P1
- **Type:** component
- **Steps:**
  1. Nhập "abc" vào ô input
  2. Kiểm tra hint
- **Expected:** Hiển thị lỗi màu đỏ
- **Evidence:** `AlgoPlaygroundWorkspace.vue:35-42`

### TC-AP-005: Sinh dữ liệu ngẫu nhiên
- **Story:** US-AP-005
- **Priority:** P1
- **Type:** component
- **Steps:**
  1. Bấm nút icon xúc xắc
  2. Kiểm tra input được sinh
- **Expected:** Input chứa mảng số hợp lệ, hint xanh
- **Evidence:** `AlgoPlaygroundWorkspace.vue:32-34`

### TC-AP-006: Bấm Chạy sinh frame
- **Story:** US-AP-006
- **Priority:** P0
- **Type:** component
- **Steps:**
  1. Chọn bubble-sort, bấm Chạy
  2. Chờ compile
- **Expected:** Frame được sinh, step counter "1/N" hiển thị
- **Evidence:** `AlgoPlaygroundWorkspace.vue:45-52`

### TC-AP-007: Trạng thái Đang biên dịch
- **Story:** US-AP-007
- **Priority:** P2
- **Type:** component
- **Steps:**
  1. Bấm Chạy code lớn
  2. Quan sát overlay
- **Expected:** Overlay spinner + text "Đang biên dịch…" hiện lên
- **Evidence:** `AlgoPlaygroundWorkspace.vue:122-130`

### TC-AP-008: Lỗi biên dịch tiếng Việt
- **Story:** US-AP-008
- **Priority:** P1
- **Type:** component
- **Steps:**
  1. Nhập code lỗi cú pháp, bấm Chạy
  2. Quan sát error message
- **Expected:** Message lỗi hiển thị tiếng Việt (VD: "Lỗi cú pháp JavaScript")
- **Evidence:** `AlgoPlaygroundWorkspace.vue:138-140`

### TC-AP-009: Toggle ẩn/hiện editor
- **Story:** US-AP-010
- **Priority:** P2
- **Type:** component
- **Steps:**
  1. Bấm toggle icon
  2. Kiểm tra editor ẩn/hiện
- **Expected:** Editor toggle visibility, canvas mở rộng
- **Evidence:** `AlgoPlaygroundWorkspace.vue:77-79`

### TC-AP-010: VCR Step Forward/Backward
- **Story:** US-AP-015
- **Priority:** P0
- **Type:** component
- **Steps:**
  1. Chạy thuật toán có frame
  2. Bấm Step Forward, Step Backward
- **Expected:** Step counter thay đổi đúng
- **Evidence:** `AlgoPlaygroundWorkspace.vue:143-151`

### TC-AP-011: Kéo scrubber tua timeline
- **Story:** US-AP-016
- **Priority:** P1
- **Type:** component
- **Steps:**
  1. Chạy thuật toán
  2. Kéo scrubber đến giữa
- **Expected:** Frame thay đổi theo vị trí scrubber
- **Evidence:** `AlgoPlaygroundWorkspace.vue:153-164`

### TC-AP-012: Chọn tốc độ phát
- **Story:** US-AP-019
- **Priority:** P2
- **Type:** component
- **Steps:**
  1. Mở speed select
  2. Chọn 2x
- **Expected:** Speed value = 2, animation nhanh hơn
- **Evidence:** `AlgoPlaygroundWorkspace.vue:184-186`

### TC-AP-013: Chia sẻ URL
- **Story:** US-AP-026
- **Priority:** P2
- **Type:** component
- **Steps:**
  1. Bấm Chia sẻ
  2. Kiểm tra clipboard
- **Expected:** URL được copy, text đổi thành "Đã chép"
- **Evidence:** `AlgoPlaygroundWorkspace.vue:62-64`

### TC-AP-014: Keyboard shortcuts
- **Story:** US-AP-029
- **Priority:** P1
- **Type:** integration
- **Steps:**
  1. Dispatch KeyboardEvent Space
  2. Kiểm tra play/pause
- **Expected:** Space toggle play/pause
- **Evidence:** `AlgoPlaygroundWorkspace.vue:467-498`

### TC-AP-015: Restore từ URL
- **Story:** US-AP-027
- **Priority:** P2
- **Type:** integration
- **Steps:**
  1. Set URL ?src=...
  2. Mount component
- **Expected:** Code + input được restore
- **Evidence:** `AlgoPlaygroundWorkspace.vue:419-434`

### TC-AP-016: Validate max 100 phần tử
- **Story:** US-AP-034
- **Priority:** P1
- **Type:** unit
- **Steps:**
  1. Nhập mảng 101 số
  2. Kiểm tra lỗi
- **Expected:** Báo lỗi vượt quá 100 phần tử
- **Evidence:** `AlgoInputParser.ts:15`

### TC-AP-017: Nhập cây dạng mảng
- **Story:** US-AP-035
- **Priority:** P1
- **Type:** unit
- **Steps:**
  1. Nhập "5,3,7,1,4,6,8"
  2. Kiểm tra parse cây
- **Expected:** Cây BST được build đúng
- **Evidence:** `AlgoInputParser.ts:53-103`

### TC-AP-018: Nhập đồ thị dạng text
- **Story:** US-AP-036
- **Priority:** P1
- **Type:** unit
- **Steps:**
  1. Nhập "A-B:10\nB-C:5"
  2. Kiểm tra parse graph
- **Expected:** Graph có node A, B, C với edge weight tương ứng
- **Evidence:** `AlgoInputParser.ts:105-147`

### TC-AP-019: Chạy 21 thuật toán mẫu
- **Story:** US-AP-037
- **Priority:** P1
- **Type:** integration
- **Steps:**
  1. Lặp qua 21 demo
  2. Bấm Chạy từng demo
- **Expected:** Mỗi demo sinh frame thành công
- **Evidence:** `playgroundAlgoDemos.ts:84-846`

### TC-AP-020: Persist state
- **Story:** US-AP-033
- **Priority:** P2
- **Type:** integration
- **Steps:**
  1. Nhập code + input
  2. Reload trang
- **Expected:** Code + input được khôi phục
- **Evidence:** `useAlgoPlaygroundStore.ts:104-136`

### TC-AP-021: Responsive < 768px
- **Story:** US-AP-032
- **Priority:** P2
- **Type:** component
- **Steps:**
  1. Resize window < 768px
  2. Kiểm tra layout
- **Expected:** Editor + canvas xếp dọc
- **Evidence:** `AlgoPlaygroundWorkspace.vue:511-517`

### TC-AP-022: Empty state
- **Story:** US-AP-013
- **Priority:** P2
- **Type:** component
- **Steps:**
  1. Mount mà không chạy
- **Expected:** Hiển thị "Chọn demo và bấm Chạy..."
- **Evidence:** `AlgoPlaygroundWorkspace.vue:114-120`

### TC-AP-023: Marker bước quan trọng
- **Story:** US-AP-017
- **Priority:** P2
- **Type:** component
- **Steps:**
  1. Chạy bubble-sort
  2. Kiểm tra markers
- **Expected:** Chấm vàng trên scrubber tại frame swap/found
- **Evidence:** `AlgoPlaygroundWorkspace.vue:166-173`

### TC-AP-024: Tooltip preview scrubber
- **Story:** US-AP-018
- **Priority:** P2
- **Type:** component
- **Steps:**
  1. Hover scrubber
- **Expected:** Tooltip "Bước N: mô tả" hiển thị
- **Evidence:** `AlgoPlaygroundWorkspace.vue:175-181`

### TC-AP-025: Loop variables
- **Story:** US-AP-021
- **Priority:** P2
- **Type:** component
- **Steps:**
  1. Chạy bubble-sort
  2. Kiểm tra chip biến
- **Expected:** Chip "i = X", "j = Y" màu amber
- **Evidence:** `AlgoPlaygroundWorkspace.vue:196-204`

### TC-AP-026: Bảng Lịch sử trace
- **Story:** US-AP-022
- **Priority:** P2
- **Type:** component
- **Steps:**
  1. Bật toggle Lịch sử
  2. Chạy thuật toán
- **Expected:** Danh sách log events hiển thị
- **Evidence:** `AlgoPlaygroundWorkspace.vue:205-223`

### TC-AP-027: Format code
- **Story:** US-AP-011
- **Priority:** P2
- **Type:** component
- **Steps:**
  1. Bấm nút Format
- **Expected:** Code được định dạng lại
- **Evidence:** `AlgoPlaygroundWorkspace.vue:80`

### TC-AP-028: Toàn màn hình
- **Story:** US-AP-012
- **Priority:** P2
- **Type:** component
- **Steps:**
  1. Bấm fullscreen
- **Expected:** Canvas vào fullscreen, exit khi bấm lại
- **Evidence:** `AlgoPlaygroundWorkspace.vue:85`

### TC-AP-029: Popsver Hooks
- **Story:** US-AP-024
- **Priority:** P2
- **Type:** component
- **Steps:**
  1. Bấm Hooks
- **Expected:** Popover liệt kê compare, swap, highlight...
- **Evidence:** `AlgoPlaygroundWorkspace.vue:68-71`

### TC-AP-030: Code mẫu
- **Story:** US-AP-025
- **Priority:** P2
- **Type:** component
- **Steps:**
  1. Chỉnh sửa code, bấm Code mẫu
- **Expected:** Code restore về demo gốc
- **Evidence:** `AlgoPlaygroundWorkspace.vue:61`

### TC-AP-031: Render mode tự động
- **Story:** US-AP-031
- **Priority:** P1
- **Type:** component
- **Steps:**
  1. Chọn demo cây (tree-traversal)
- **Expected:** Render mode = tree, canvas vẽ cây
- **Evidence:** `useAlgoPlaygroundStore.ts:45-52`

### TC-AP-032: Lỗi Monaco + reload
- **Story:** US-AP-014
- **Priority:** P2
- **Type:** component
- **Steps:**
  1. Mock Monaco fail
- **Expected:** Hiển thị lỗi + nút reload
- **Evidence:** `AlgoPlaygroundWorkspace.vue:98-103`

### TC-AP-033: Highlight dòng code
- **Story:** US-AP-030
- **Priority:** P1
- **Type:** component
- **Steps:**
  1. Chạy thuật toán
  2. Kiểm tra Monaco decoration
- **Expected:** Dòng active có glow decoration
- **Evidence:** `AlgoPlaygroundWorkspace.vue:453-459`

### TC-AP-034: Click gutter
- **Story:** US-AP-028
- **Priority:** P2
- **Type:** component
- **Steps:**
  1. Click gutter line 5
- **Expected:** Nhảy đến frame tương ứng dòng 5
- **Evidence:** `AlgoPlaygroundWorkspace.vue:548-554`

### TC-AP-035: Chip độ phức tạp
- **Story:** US-AP-002
- **Priority:** P2
- **Type:** component
- **Steps:**
  1. Chọn demo bất kỳ
- **Expected:** Chip ⏱ và 💾 hiển thị đúng
- **Evidence:** `AlgoPlaygroundWorkspace.vue:19-20`

### TC-AP-036: Mô tả frame + số dòng
- **Story:** US-AP-020
- **Priority:** P2
- **Type:** component
- **Steps:**
  1. Chạy thuật toán
- **Expected:** "Dòng 5: So sánh arr[0] với arr[1]" hiển thị
- **Evidence:** `AlgoPlaygroundWorkspace.vue:190-195`

### TC-AP-037: Demo description
- **Story:** US-AP-001
- **Priority:** P2
- **Type:** component
- **Steps:**
  1. Chọn demo
- **Expected:** Mô tả demo hiển thị dưới toolbar
- **Evidence:** `AlgoPlaygroundWorkspace.vue:6-18`
