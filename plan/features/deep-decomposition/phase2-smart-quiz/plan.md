# 📅 Implementation Plan - Smart Interactive Quiz Widget (Phase 2)

Kế hoạch phát triển phân hệ Trắc nghiệm Tương tác Thông minh được phân chia làm 2 Sprint chính nhằm tối ưu hóa giao diện trượt kính mờ sang trọng và độ tin cậy của bộ đánh chặn Playback Interceptor.

---

## 📌 BẢN ĐỒ LỘ TRÌNH PHÁT TRIỂN

```
+-------------------------------------------------------------+
| Sprint A: Thiết kế Thẻ Trượt Quiz & Highlights (Ngày 1-3)    |
| - Dựng thẻ Quiz Slide-in Glassmorphic Overlay mượt mà.      |
| - Thiết kế viền phát sáng Hover Highlights cho SVG Node.    |
| - Lập trình clickable gutters chế độ chọn dòng Monaco.      |
| - Thiết lập biểu ngữ phản hồi HSL Emerald/Crimson rực rỡ.   |
+-------------------------------------------------------------+
                               |
                               v
+-------------------------------------------------------------+
| Sprint B: Lập trình Engine Chấm điểm & VCR Intercept (Ngày 4-6)|
| - Cài đặt logic VCRPlaybackInterceptor khóa tua dừng VCR.    |
| - Lập trình bộ máy chấm điểm RAM QuizEvaluationEngine TS.   |
| - Tích hợp confetti pháo hoa ăn mừng và cộng điểm XP.       |
| - Viết cơ chế dọn dẹp giải phóng chuột khi hoàn tất câu hỏi.|
+-------------------------------------------------------------+
```

---

## 🛠 CHI TIẾT CÁC BƯỚC THỰC HIỆN

### Sprint A: Thiết kế Thẻ Trượt Quiz & Highlights (Ngày 1-3)
*   **Mục tiêu:** Xây dựng thẻ trắc nghiệm Slide-in kính mờ, CSS hover highlights array bars SVG, chế độ clickable lines Monaco và banner giải thích HSL.
*   **Danh sách công việc:**
    1.  [ ] Thiết kế component trượt nhẹ `InteractiveQuizOverlay.vue` phong cách mờ ảo trong suốt.
    2.  [ ] Viết CSS Hover Highlights phát sáng viền mờ Cyan cho các bar mảng cấu trúc dữ liệu SVG.
    3.  [ ] Tích hợp chế độ `MonacoClickableGutter.ts` đánh dấu sáng các dòng code di chuột qua.
    4.  [ ] Dựng hộp thư phản hồi giải thích `ExplanationHSLCard.vue` màu Emerald (Đúng) và Crimson (Sai) kèm hiệu ứng rung.

### Sprint B: Lập trình Engine Chấm điểm & VCR Intercept (Ngày 4-6)
*   **Mục tiêu:** Hiện thực hóa logic `VCRPlaybackInterceptor` đánh chặn bước thời gian, engine chấm điểm RAM, confetti bắn ăn mừng, kết nối thăng điểm XP.
*   **Danh sách công việc:**
    1.  [ ] Lập trình logic hạt nhân TypeScript `VCRPlaybackInterceptor` tiêm vào timeline scrubber.
    2.  [ ] Cài đặt bộ máy `QuizEvaluationEngine` bằng TypeScript so khớp mảng đáp án RAM.
    3.  [ ] Kết nối canvas pháo Confetti tưng bừng ăn mừng và gửi API cộng điểm thưởng XP Gamification.
    4.  [ ] Viết quy trình tháo dỡ giải phóng 100% chuột canvas và Monaco line click listener khi hoàn tất nộp bài.

---

## 🎯 TIÊU CHÍ HOÀN THÀNH (DEFINITION OF DONE - DoD)
1.  VCR Playback tự động dừng hoàn hảo khi chạy đến đúng bước mốc chỉ định, khóa chặt timeline slider.
2.  Sinh viên click chọn trực tiếp vào bar mảng SVG hoặc line Monaco được tô sáng highlight chính xác 100%.
3.  Bấm Submit hiện đúng pháo hạt Confetti ăn mừng (đúng) hoặc rung lắc chấn động đỏ rực kèm gợi ý bài (sai).
4.  Cộng điểm thưởng XP tích hợp thăng hạng Streak ngay khi nộp bài đúng lần đầu tiên ở Client-side.
5.  Giải phóng hoàn toàn các listener click, trả lại tính năng chạy bình thường của canvas và Monaco ngay khi đóng quiz.
6.  Đầy đủ unit tests bao phủ 100% logic chấm điểm VCR playback interception và SVG target resolution.
