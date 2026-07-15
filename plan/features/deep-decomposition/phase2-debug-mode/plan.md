# 📅 Implementation Plan - Algorithmic Debugger Workspace (Phase 2)

Kế hoạch phát triển phân hệ Chế độ Debug Thuật toán (Algorithmic Step Debugger Workspace) được phân bổ làm 2 Sprint chính để cam kết độ chính xác của Monaco Breakpoint và sự mượt mà của bộ dịch Generator yield.

---

## 📌 BẢN ĐỒ LỘ TRÌNH PHÁT TRIỂN

```
+-------------------------------------------------------------+
| Sprint A: Điểm dừng Monaco & Call Stack UI (Ngày 1-3)       |
| - Nhấp chuột lề Monaco bật chấm đỏ Breakpoint Neon.         |
| - Thiết kế Watch Panel hiển thị biến chuyển màu Cyan.       |
| - Dựng cây đệ quy Call Stack Frame xếp chồng 3D sành điệu.   |
| - Dựng panel phím bấm điều khiển Step Over/Into/Out.        |
+-------------------------------------------------------------+
                               |
                               v
+-------------------------------------------------------------+
| Sprint B: Bộ dịch Coroutine Generator & Step Engine (Ngày 4-6) |
| - Lập trình bộ duyệt AST tiêm mã yield qua acorn/estraverse.|
| - Hiện thực hóa lớp TypeScript LiveCompilerDebugger.        |
| - Đồng bộ hóa bước chạy dòng lệnh Monaco và hoạt ảnh Canvas. |
| - Cài đặt bộ đếm bảo vệ đệ quy sâu chống tràn Stack.        |
+-------------------------------------------------------------+
```

---

## 🛠 CHI TIẾT CÁC BƯỚC THỰC HIỆN

### Sprint A: Điểm dừng Monaco & Call Stack UI (Ngày 1-3)
*   **Mục tiêu:** Đồng bộ chấm tròn đỏ Breakpoint lề Monaco Editor, hoàn thiện Watch Panel giám sát biến động và cây xếp chồng Call Stack đệ quy Glassmorphism 3D.
*   **Danh sách công việc:**
    1.  [ ] Lập trình bộ quản lý `MonacoBreakpointManager` lắng nghe sự kiện nhấp lề gutter và deltaDecorations vẽ chấm đỏ Neon.
    2.  [ ] Thiết kế Watch Panel hiển thị danh sách biến chạy tự động đổi sang màu Cyan rực rỡ khi phát sinh thay đổi giá trị.
    3.  [ ] Dựng cây đệ quy Call Stack `CallStackVisualizer.vue` dạng các khối thẻ kính mờ Glassmorphism xếp chồng tinh tế 3D.
    4.  [ ] Dựng thanh công cụ phím bấm VCR Debugger (Step Over, Step Into, Step Out, Continue).

### Sprint B: Bộ dịch Coroutine Generator & Step Engine (Ngày 4-6)
*   **Mục tiêu:** Cài đặt bộ duyệt AST dịch thuật toán thô sang generator yield, điều tiết bước chạy Iterator `.next()` và đồng bộ Canvas.
*   **Danh sách công việc:**
    1.  [ ] Viết giải thuật AST Parser chèn `yield` kèm trạng thái mảng và tên hàm gọi tại các nút dòng thực thi lệnh.
    2.  [ ] Hiện thực hóa lớp TypeScript hạt nhân `LiveCompilerDebugger` điều khiển vòng lặp bước chạy Iterator.
    3.  [ ] Kết nối đồng bộ bước nhảy dòng lệnh Monaco (giao diện sáng dòng Cyan) khớp với nhịp chuyển cột hoạt ảnh Canvas.
    4.  [ ] Thiết lập bộ đếm kiểm duyệt độ sâu đệ quy tối đa (Stack Overflow Guard) giới hạn không quá 500 cấp đệ quy để bảo vệ RAM.

---

## 🎯 TIÊU CHÍ HOÀN THÀNH (DEFINITION OF DONE - DoD)
1.  Nhấp chuột lề Monaco Editor bật chấm tròn đỏ Breakpoint phát sáng Neon cực nhạy.
2.  Bấm nút Debug dừng chính xác tại dòng chứa Breakpoint đầu tiên của thuật toán.
3.  Nút Step Over/Step Into dịch chuyển dòng code sáng Cyan sương mờ khớp chuẩn xác với chuyển động Canvas vẽ.
4.  Ngăn xếp đệ quy Call Stack vẽ xếp chồng phân cấp 3D lộng lẫy khi chạy thuật toán đệ quy Quick Sort.
5.  Watch Panel cập nhật đúng đắn giá trị các biến chạy tại dòng dừng.
