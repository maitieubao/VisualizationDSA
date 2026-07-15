# 📅 Implementation Plan - Pseudocode Sync & Watch Panel (Phase 1)

Kế hoạch phát triển phân hệ Đồng bộ Mã giả & Theo dõi Biến (Pseudocode Sync) được thực hiện trong 2 Sprint để đảm bảo tính thẩm mỹ giao diện lập trình và sự đồng bộ hai chiều mượt mà.

---

## 📌 BẢN ĐỒ LỘ TRÌNH PHÁT TRIỂN

```
+-------------------------------------------------------------+
| Sprint A: Giao diện Code Panel & Đa Ngôn ngữ (Ngày 1-2)    |
| - Thiết kế layout phân cực Split-Screen bằng CSS Grid.     |
| - Xây dựng component danh sách dòng mã & Tab ngôn ngữ.      |
| - Cài đặt font chữ JetBrains Mono & CSS kính mờ.            |
| - Hoàn thành cơ cấu nạp kịch bản code tĩnh đa ngôn ngữ.     |
+-------------------------------------------------------------+
                               |
                               v
+-------------------------------------------------------------+
| Sprint B: Đồng bộ Dòng Highlight & Variable Watch (Ngày 3-5) |
| - Lập trình ánh xạ logicalId chéo từ Frame sang dòng code.  |
| - Xây dựng component Variable Watch Panel cập nhật động.    |
| - Hiện thực hóa tương tác ngược Click-to-Snap nhảy Canvas.  |
| - Viết test-case tự động kiểm thử đồng bộ khi tua nhanh.    |
+-------------------------------------------------------------+
```

---

## 🛠 CHI TIẾT CÁC BƯỚC THỰC HIỆN

### Sprint A: Giao diện Code Panel & Đa Ngôn ngữ (Ngày 1-2)
*   **Mục tiêu:** Định hình giao diện Split-Screen chuẩn EdTech, dựng khung bảng hiển thị dòng mã có số thứ tự dòng và bộ chuyển đổi tab ngôn ngữ lập trình mượt mà.
*   **Danh sách công việc:**
    1.  [ ] Xây dựng khung giao diện chính với tỉ lệ Canvas (70%) và Code Workspace (30%) sử dụng CSS Grid/Flexbox tương thích mọi độ phân giải.
    2.  [ ] Tích hợp Font chữ chuyên dụng lập trình **JetBrains Mono** hoặc **Fira Code** để nâng cao trải nghiệm đọc mã của sinh viên.
    3.  [ ] Viết mã nguồn Component `MultilingualCodePanel.vue` hỗ trợ chuyển đổi tab C++, Java, Python, JavaScript tức thì.
    4.  [ ] Cài đặt kiểu dáng thụt dòng thụt lề, màu sắc từ khóa lập trình cơ bản (syntax color scheme: Slate, Emerald, Cyan) tạo phong cách IDE cao cấp.

### Sprint B: Đồng bộ Dòng Highlight & Variable Watch (Ngày 3-5)
*   **Mục tiêu:** Đồng bộ hóa dòng highlight sáng xanh Emerald, lập trình bảng theo dõi giá trị biến chạy động và viết giải thuật Click-to-Snap.
*   **Danh sách công việc:**
    1.  [ ] Lập trình cơ chế phản ứng lắng nghe `useAnimationStore.currentFrameIndex` để lọc tìm dòng mã đang chạy chéo ngôn ngữ qua `logicalId`.
    2.  [ ] Cài đặt hiệu ứng CSS Transition chuyển đổi dòng highlight mượt mà, không bị chớp giật nhấp nháy liên tục khi chạy giải thuật tốc độ cao.
    3.  [ ] Xây dựng Component `VariableWatchPanel.vue` hiển thị danh sách biến chỉ số và biến tạm thời tương ứng với từng khung hình.
    4.  [ ] Cài đặt Event Listener lên các dòng mã cho phép click để kích hoạt tính năng **Reverse Click-to-Snap** nhảy Canvas tới frame thực thi đầu tiên.

---

## 🎯 TIÊU CHÍ HOÀN THÀNH (DEFINITION OF DONE - DoD)
1.  Bảng Code Panel và Watch Panel hiển thị sắc nét bằng phong cách Glassmorphism, phong chữ JetBrains Mono hiển thị hoàn hảo không lỗi chính tả hay thụt dòng sai lệch.
2.  Chuyển đổi các tab ngôn ngữ (C++, Java, Python, JavaScript) cập nhật mã nguồn tức thời, dòng highlight hiện hành nhảy chuẩn xác đến dòng tương ứng ở ngôn ngữ mới.
3.  Click vào dòng lệnh đang thực thi bất kỳ trong bảng mã lập tức điều hướng thanh Slider và Canvas của Animation Engine tới đúng khung hình khởi chạy.
4.  Bảng theo dõi biến hiển thị đầy đủ các giá trị chính xác tuyệt đối theo từng bước chạy hoạt ảnh.
