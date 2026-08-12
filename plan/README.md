# 📚 Bản Đồ Tài Liệu Dự Án — VisualizationDSA

Tài liệu được tổ chức theo **4 nhóm mục đích rõ ràng** — mỗi nhóm trả lời 1 câu hỏi khác nhau. Khi cần thông tin, hãy vào đúng nhóm, đừng lẫn lộn.

```text
plan/
├── README.md        ← BẠN ĐANG Ở ĐÂY (bản đồ tổng)
│
├── tracking/        ← 📜 NHÓM "ĐÃ XẢY RA" — nhật ký, không phán xét giá trị
│   │                  (progress.md, errors.md, features-tested.md,
│   │                   decisions.md, dependencies.md, REVIEW.md,
│   │                   UNREVIEW.md, review-progress.md, IntegrityCourseReport.md)
│   │
├── features/
│   └── deep-decomposition/  ← 🏗️ NHÓM "THIẾT KẾ" — đặc tả kỹ thuật/PRD từng phase
│
├── testing/         ← 🧪 NHÓM "CÁCH KIỂM THỬ" — hướng dẫn vận hành kiểm thử
│   │                  (MANUAL_TEST.md tổng hợp + manual/*.md 16 tính năng)
│   │
└── review/          ← 🔍 NHÓM "THỰC TRẠNG & ĐỊNH HƯỚNG" — TRẢ LỜI: tính năng
                      │  đang ở đâu, có thật sự hữu ích không, làm gì tiếp theo
                       (README.md + features/*.md 16 hồ sơ tính năng)
```

---

## 🎯 Cách dùng đúng theo mục đích

| Bạn cần biết... | Vào nhóm | Ví dụ file |
|---|---|---|
| "Đã sửa những lỗi nào? Round nào?" | **tracking/** | `errors.md`, `REVIEW.md`, `review-progress.md` |
| "Tính năng này đang chạy được đến đâu, có thật sự giải quyết vấn đề không?" | **review/** | `review/features/payment.md` |
| "Nên phát triển gì tiếp theo cho tính năng này?" | **review/** | mục "Hướng phát triển" trong từng hồ sơ |
| "Cách test tính năng trên trình duyệt?" | **testing/** | `MANUAL_TEST.md`, `manual/Auth.md` |
| "Thiết kế kỹ thuật/API của feature này ra sao?" | **features/** | `deep-decomposition/phase1-.../*.md` |

## ⚠️ Nguyên Tắc Chống Ảo Tưởng (Bắt buộc mọi Agent đọc trước khi code)

1. **Test xanh ≠ hoàn chỉnh.** Chiến dịch review 22 round đã chứng minh: hàng chục tính năng "test xanh" nhưng **chết ở tích hợp** (URL sai, route thiếu, engine không wire...).
2. **Trước khi đánh dấu "✅ CODE DONE" hoặc "hoàn chỉnh"**, hãy đọc hồ sơ tính năng tương ứng trong `review/features/` — mục **"Đánh giá giá trị thực tế"** và **"Điều cần làm"** cho biết tính năng thật sự đang ở đâu.
3. **Phân biệt 3 mức thực tế:**
   - 🟢 **Thực dụng** — người dùng thật có thể dùng ngay (vd: Sorting Visualizer).
   - 🟡 **Demo-grade** — chạy đúng kỹ thuật nhưng phụ thuộc tích hợp chưa có (vd: thanh toán mô phỏng, embed chưa có LMS thật).
   - 🔴 **Hạ tầng chờ** — đúng thiết kế nhưng chưa có nguồn dữ liệu/kích hoạt thật (vd: notification ít trigger).
4. **Mọi tính năng mới khi đánh giá phải gắn:** User Story (ai, làm gì, lợi ích gì) + Test Case thực tế (bước test trên trình duyệt) — tham chiếu `plan/testing/manual/`.
