# 📊 Sorting Visualizer — Hồ Sơ Thực Trạng & Định Hướng

## 🎯 Mục đích

- **Vấn đề người dùng:** Người học giải thuật sắp xếp khó hình dung sự khác biệt giữa Bubble/Selection/Insertion/Quick/Merge/Heap/Counting chỉ bằng code — cần thấy từng bước hoán đổi, dòng pseudocode tương ứng và bảng trace để hiểu bản chất từng thuật toán.
- **Tuyên bố giá trị:** Sorting Visualizer là **tính năng flagship** — cửa ngõ đầu tiên user chạm vào, minh chứng sức mạnh của bộ đệm trạng thái (Frame) + VCR Playback + pseudocode sync; một trải nghiệm học tốt ở đây kéo user quay lại các module còn lại.

## 📌 Thực trạng hiện tại

- Trạng thái kỹ thuật: ✅ DoD — Review Round 12 (SV-001→044; **44/44 lỗi đã fix**), frontend 3058/3058 pass (sorting 99→215 test), `vue-tsc -b` 0 lỗi, backend 507/507 (không đụng).
- Đang hoạt động thật:
  - 7 engine thuật toán chạy đúng với contract CC-009: mọi frame đều có `lineNumber`/`activeLogicalLineId`/`highlights` → pseudocode highlight + gutter click sống ở cả 7 engine (SV-002).
  - VCR Playback đầy đủ: Play/Pause/Step/Scrub/Replay, speed clamp 0.1x–5.0x, race đổi input giữa playback được invalidate (SV-014).
  - Merge Sort FLIP animation theo identity — mảng trùng giá trị không hoán đổi lung tung (SV-003); bubble early-exit (SV-018).
  - Gutter click Monaco nhảy đúng frame gần nhất, guard click phải (SV-007/023); trace table điều hướng bàn phím + a11y (SV-031/038).
  - Edge case: mảng rỗng ("–/0"), mảng 1 phần tử (`sortedIndices=[0]`), trùng giá trị, đã sorted/reversed — đều có test (matrix 42 cell + perf 100 × 7 engine).
- Giới hạn hiện tại:
  - Chưa có chế độ **so sánh 2 thuật toán** side-by-side — user phải chạy lần lượt, tự nhớ để so sánh số frame/bước.
  - Chưa chứng minh hiệu quả học tập (không đo được user hiểu hơn sau khi dùng).
  - Chưa có phản hồi âm thanh, chưa có quiz tích hợp từng bước trong luồng xem.

## ⭐ Đánh giá giá trị thực tế: 9/10 (🟢 Thực dụng)

- **Điểm thật:** User dùng thật được ngay: chọn thuật toán → nhập mảng → Play/Step/Scrub với pseudocode + trace đồng bộ, 7 engine đều chạy đúng kể cả edge case; đây là tính năng trải nghiệm mượt nhất và đã được ép vào khuôn khổ học tập (CC-009 phủ toàn bộ engine).
- **Điểm "ảo" (code xanh nhưng chưa thực dụng):**
  - Không có so sánh trực tiếp giữa các thuật toán — sức mạnh sư phạm của "Bubble vs Merge: ai ít bước hơn?" chưa được khai thác.
  - Chưa có bằng chứng học tập (metric/quiz trong luồng) — "hoạt động tốt" mới dừng ở mức kỹ thuật, chưa chứng minh "học hiệu quả".

## 🚧 Điều cần làm để có giá trị thực tế (checklist ưu tiên)

- [ ] Chế độ so sánh side-by-side 2 thuật toán — acceptance: chạy song song 2 engine cùng mảng, hiển thị số bước/so sánh/hoán đổi từng bên, VCR kép đồng bộ khung.
- [ ] Speed curve (biểu đồ số frame theo thời gian chạy) — acceptance: sau mỗi lần chạy hiển thị số frame của thuật toán hiện tại để so với ngưỡng lý thuyết.
- [ ] Audio feedback — acceptance: tăng/giảm cao độ theo giá trị phần tử khi so sánh/hoán đổi, có nút tắt, tôn trọng reduced-motion/prefers-reduced-audio.
- [ ] Quiz tích hợp từng bước (dừng ở frame chọn lọc và hỏi "bước tiếp theo là gì") — acceptance: ít nhất 3 câu hỏi nhúng trong luồng xem, câu trả lời đúng/sai có giải thích, cộng XP như quiz thường.
- [ ] Bài tập "dự đoán bước tiếp theo" — acceptance: ẩn 1 frame, user chọn mảng sau bước đó, đối chiếu kết quả thật từ engine.

## 🧭 Hướng phát triển tiếp theo

- **So sánh 2 thuật toán** — lý do nghiệp vụ: câu hỏi kinh điển "tại sao Quick nhanh hơn Bubble" chỉ trả lời được khi nhìn song song; kỹ thuật: tái dùng 2 instance `useSortingAnimation` độc lập + 1 VCR đồng bộ theo frame max.
- **Speed curve / thống kê độ phức tạp thực nghiệm** — lý do nghiệp vụ: gắn lý thuyết Big-O với hành vi thật; kỹ thuật: đếm compare/swap trong enricher, vẽ chart sau khi chạy.
- **Audio feedback** — lý do nghiệp vụ: kênh học đa giác quan cho người học khó đọc màn hình; kỹ thuật: Web Audio API tone theo giá trị, debounce theo speed.
- **Quiz nhúng + dự đoán bước kế** — lý do nghiệp vụ: chuyển từ "xem thụ động" sang "suy nghĩ chủ động", cung cấp dữ liệu hiệu quả học tập; kỹ thuật: tái dùng frame store sẵn có + cơ chế checkpoint kiểu lesson.

## 🧪 User Stories & Test Cases (tham chiếu)

- File manual: `plan/testing/manual/SortingVisualizer.md`
- US then chốt: **US-SV-001** (chọn thuật toán + nhập mảng), **US-SV-002** (chạy animation với VCR Playback), **US-SV-003** (đồng bộ pseudocode + gutter click)
- TC then chốt: **TC-SV-001** (7 thuật toán chạy đúng + pseudocode highlight — regression SV-002/CC-009), **TC-SV-002** (gutter click jump frame gần nhất — regression SV-007/023), **TC-SV-003** (Merge FLIP animation theo identity — regression SV-003/017), **TC-SV-004** (Replay ở frame cuối — regression EC-003), **TC-SV-005** (đổi input giữa playback → reset đúng — regression SV-014/034)
