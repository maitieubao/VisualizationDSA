# 🌊 UX Flow & Interactive Smart Quiz Walkthroughs

Tài liệu này đặc tả chi tiết các kịch bản trải nghiệm người dùng (User Journeys) khi sinh viên đối mặt với câu hỏi trắc nghiệm dừng timeline VCR, click chọn mảng SVG hoặc Monaco Code lines, nộp bài nhận confetti ăn mừng hoặc rung lắc chao đảo trên **Smart Interactive Quiz Widget**.

---

## 📌 KỊCH BẢN 1: DỰ ĐOÁN PHẦN TỬ HOÁN ĐỔI TRÊN CANVAS SVG (HEAP SORT)

### Tình huống: Học sinh đang phát tự động Heap Sort, đến bước mốc 8 hệ thống tự động dừng đố vui

```
[Học sinh bấm PLAY phát tự động hoạt ảnh Heap Sort]
[Giải thuật trôi mượt mà đến bước số 8 (Chuẩn bị hoán đổi node cha và con)]
        |
        v Timeline VCR tự động PAUSE, khóa chặt thanh trượt tua thời gian
[Thẻ trắc nghiệm Slide-in Glassmorphic Quiz Overlay từ mép phải trượt nhẹ ra êm ái]
[Prompt hỏi: "Quy luật Heapify tiếp theo yêu cầu hoán đổi hai phần tử nào?"]
        |
[Học viên di chuột lên các cột mảng SVG trên Canvas, thấy các bar bừng sáng Neon Cyan báo hiệu tương tác]
[Sinh viên nhấp chọn Bar số 2 -> Bar bừng sáng viền vàng cam Neon hổ phách]
[Sinh viên nhấp chọn Bar số 5 -> Bar bừng sáng viền vàng cam Neon hổ phách]
        |
        v Bấm nút [ SUBMIT ]
        |
[Màn hình bùng nổ hoạt ảnh Emerald Checkmark & Confetti ăn mừng rực rỡ:]
  - Hạt giấy pháo Confetti rơi tưng bừng ngập tràn màn hình.
  - Thẻ trắc nghiệm hiện viền Emerald phát sáng mát mắt.
  - Hộp giải thích chi tiết Markdown hiện ra cặn kẽ vì sao hoán đổi.
  - Cộng điểm thưởng: +30 XP rực rỡ và nổ ngọn lửa Streak.
        |
[Bấm [ TIẾP TỤC ] -> Slide-in panel thu gọn ẩn đi, VCR timeline mở khóa, giải thuật tiếp tục phát]
```

---

## 📌 KỊCH BẢN 2: DỰ ĐOÁN DÒNG CODE THỰC THI TRONG MONACO (QUICKSORT)

### Tình huống: Học sinh dự đoán dòng code phân chia pivot đệ quy tiếp theo

```
[Học sinh đang tua đệ quy QuickSort dừng tại bước 12]
[Hiện Slide-in panel hỏi: "Dòng code nào trong Monaco Editor sẽ thực thi tiếp theo?"]
[Monaco Editor tạm chuyển sang clickable lines, vô hiệu hóa gõ chữ]
        |
[Sinh viên di chuột lên code Monaco, thấy các dòng code sáng Cyan mờ theo vị trí con trỏ chuột]
[Học viên nhấp click chọn DÒNG SỐ 8 (Đáp án đúng là dòng 9)]
        |
        v Bấm nút [ SUBMIT ]
        |
[Hệ thống kích hoạt phản hồi chấn động cảnh báo lỗi tư duy:]
  - Thẻ trắc nghiệm viền đỏ Neon nhấp nháy liên tục.
  - Thẻ trắc nghiệm rung lắc mạnh (Wiggle vibration) trong 0.4 giây.
  - Loa phát tiếng bíp báo lỗi, Monaco editor viền đỏ rực.
  - Hộp gợi ý hiện ra: "Dòng 8 vừa thực thi gán pivot. Ở bước kế, biến i sẽ tăng lên để so khớp. Hãy thử lại!"
        |
[Học viên nhấp click chọn DÒNG SỐ 9 -> Bấm SUBMIT]
[Màn hình bừng sáng lá cây Emerald lá phong xanh tươi, báo đáp án đúng, hiện nút TIẾP TỤC]
```
 Trải nghiệm trắc nghiệm tương tác bám ngữ cảnh kết hợp click trực tiếp trên mảng/cây SVG và Monaco line selector mang lại cho sinh viên một không gian rèn luyện tư duy lập trình tối tân, cuốn hút thực nghiệm và xóa nhòa ranh giới giữa lý thuyết và hoạt ảnh.
