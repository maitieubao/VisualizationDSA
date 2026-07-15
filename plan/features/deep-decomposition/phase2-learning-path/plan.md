# 📅 Implementation Plan - Learning Path Skill Tree (Phase 2)

Kế hoạch phát triển phân hệ Lộ trình Học tập Cá nhân hóa được phân chia làm 2 Sprint chính nhằm tối ưu hóa tính lung linh sinh động của bản đồ RPG Map Grid và tính chính xác của bộ máy giải đồ thị DAG tiên quyết chạy Client-side.

---

## 📌 BẢN ĐỒ LỘ TRÌNH PHÁT TRIỂN

```
+-------------------------------------------------------------+
| Sprint A: Thiết kế Bản đồ RPG Map Grid & Laser (Ngày 1-3)    |
| - Thiết kế khung bản đồ RPG Map Grid kính mờ tối tân.       |
| - Lập trình các node ải phát sáng Neon (Emerald, Cyan).      |
| - Thiết lập cầu nối laser uốn lượn SVG cuộn chảy năng lượng. |
| - Thiết kế thẻ thông điệp đề xuất cá nhân hóa AI.           |
+-------------------------------------------------------------+
                               |
                               v
+-------------------------------------------------------------+
| Sprint B: Hiện thực bộ DAG Engine & Cá nhân hóa AI (Ngày 4-6) |
| - Cài đặt logic PrerequisiteDAGEngine duyệt đồ thị DFS.     |
| - Viết bộ máy AI phân tích học lực PersonalizedPathEvaluator. |
| - Đồng bộ tiến trình Offline LocalStorage sang Supabase.     |
| - Tối ưu hóa render cầu nối rAF Batch Renderer khi resize.   |
+-------------------------------------------------------------+
```

---

## 🛠 CHI TIẾT CÁC BƯỚC THỰC HIỆN

### Sprint A: Thiết kế Bản đồ RPG Map Grid & Laser (Ngày 1-3)
*   **Mục tiêu:** Xây dựng lưới bản đồ RPG Map kính mờ sành điệu, các node ải tròn phát sáng, đường cầu nối laser SVG cuộn năng lượng và thẻ đề xuất AI.
*   **Danh sách công việc:**
    1.  [ ] Thiết kế giao diện lưới bản đồ `LearningPathMap.vue` mờ Glassmorphism sang trọng.
    2.  [ ] Lập trình các node tròn ải giải thuật `PathNodeCircle.vue` phát sáng 3 màu sắc Neon.
    3.  [ ] Hiện thực hóa cầu nối laser SVG uốn lượn `LaserFlowBridge.vue` chạy mượt mà hoạt ảnh cuộn nét đứt.
    4.  [ ] Thiết kế thẻ popup thông minh đề xuất AI `AIEvaluatorCard.vue` viền Neon phát sáng.

### Sprint B: Hiện thực bộ DAG Engine & Cá nhân hóa AI (Ngày 4-6)
*   **Mục tiêu:** Lập trình bộ giải quyết cây tiên quyết DAG DFS, bộ máy phân tích học lực AI, cơ chế lưu trữ offline LocalStorage và đồng bộ Supabase.
*   **Danh sách công việc:**
    1.  [ ] Lập trình logic lõi TypeScript `PrerequisiteDAGEngine` duyệt mở khóa ải tiên quyết DFS.
    2.  [ ] Viết mã thuật toán AI `PersonalizedPathEvaluator` chấm điểm và đưa đề xuất ôn tập hay thăng cấp.
    3.  [ ] Hiện thực trình đồng bộ tiến độ offline `OfflineProgressSynchronizer` lưu LocalStorage an toàn.
    4.  [ ] Thiết lập rAF Batch Renderer gom các tác vụ tính tọa độ vẽ laser khi người dùng kéo giãn Responsive màn hình.

---

## 🎯 TIÊU CHÍ HOÀN THÀNH (DEFINITION OF DONE - DoD)
1.  Cây tiên quyết DAG hoạt động chính xác 100%, ải tiếp theo chỉ UNLOCKED khi toàn bộ ải trước đã COMPLETED.
2.  Cầu nối Laser SVG uốn lượn co giãn Responsive hoàn hảo theo tọa độ node tròn, không bị lệch đường line.
3.  Bộ phân tích AI gợi ý đúng chương cần ôn tập khi học sinh có điểm quiz dưới 70%.
4.  Hoạt ảnh dòng năng lượng chạy cuộn trào trên laser bridge mượt mà 60 FPS.
5.  Trạng thái bản đồ đồng bộ an toàn và tải nhanh dưới 150ms từ LocalStorage/Supabase.
6.  Các node ải hoàn thành bừng sáng hào quang Emerald lấp lánh sành điệu.
