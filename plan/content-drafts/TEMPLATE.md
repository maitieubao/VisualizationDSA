# TEMPLATE BÀI GIẢNG CHUẨN — VisualizationDSA

> Mọi subagent VIẾT BÀI GIẢNG phải tuân theo template này. Output gồm 3 file cho mỗi bài:
> - `plan/content-drafts/kX/bai-N.md` — nội dung markdown (contentMd)
> - `plan/content-drafts/kX/bai-N.quiz.json` — bài tập quiz
> - `plan/content-drafts/kX/bai-N.codelab.json` — bài tập codelab (CHỈ khi được yêu cầu)

---

## 1. CẤU TRÚC MARKDOWN (contentMd) — BẮT BUỘC ĐÚNG THỨ TỰ

```markdown
# 🎯 <Tên bài học>

## 1. Động cơ học (Why this matters)
2-4 câu: bài toán thực tế/ứng dụng thực tế mở đầu, ngôn ngữ dễ hiểu.

## 2. Lý thuyết cốt lõi
- Định nghĩa chuẩn xác khoa học (tham chiếu CLRS/Dasgupta/Coursera-UCSD/Udemy-Colt-Steele).
- Tính chất quan trọng (bullet list).
- 1-2 đoạn giải thích sâu bằng lời văn RIÊNG (không sao chép nguyên văn nguồn).

## 3. Thuật toán từng bước (hoặc ý tưởng chính)
- Liệt kê các bước rõ ràng (1., 2., 3. ...).
- Kèm **ví dụ minh họa có số liệu cụ thể** (mảng mẫu, bước trung gian).

### Ví dụ
```javascript
// Code JavaScript minh họa — NGẮN GỌN, có comment tiếng Việt
```

## 4. Độ phức tạp & so sánh
| Trường hợp | Thời gian | Ghi chú |
| :--- | :--- | :--- |
| Tốt nhất | O(...) | ... |
| Trung bình | O(...) | ... |
| Xấu nhất | O(...) | ... |

- Bộ nhớ: O(...)
- Ổn định (stable)? In-place? (nếu là thuật toán sắp xếp)

## 5. Liên kết trực quan hóa
👉 Bấm **Trực Quan Hóa** để xem <demo tên> — <1 câu mô tả xem được gì>.

## 6. Tổng kết
- 3-5 bullet tóm tắt điểm chính.
- Lưu ý bẫy thường gặp / sai lầm phổ biến.

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)
```

### Quy tắc contentMd
- Tiếng Việt, độ dài **450–750 từ** (không tính code).
- Code JavaScript, có comment tiếng Việt ngắn, chạy được.
- KHÔNG sao chép nguyên văn bất kỳ nguồn nào — biên soạn lại hoàn toàn.
- Không dùng ký tự `"` (double quote) trong nội dung (để an toàn khi nhúng vào C# verbatim string). Dùng `'` hoặc viết lại câu.

---

## 2. SCHEMA QUIZ (`bai-N.quiz.json`)

```json
{
  "quizTitle": "Trắc nghiệm <chủ đề>",
  "topic": "dsa | sorting | searching | graph | oop | solid | patterns | system",
  "difficulty": 1,
  "xpReward": 40,
  "questions": [
    {
      "questionText": "...",
      "options": ["...", "...", "...", "..."],
      "correctIndex": 1,
      "explanation": "Giải thích 1-2 câu, chính xác khoa học."
    }
  ]
}
```

### Quy tắc quiz
- **Đúng 10 câu hỏi mỗi bài**: câu 1-4 kiến thức nền tảng, câu 5-7 mức trung bình (hiểu + áp dụng), câu 8-10 mức khó (tình huống cụ thể, tính toán số liệu, mô phỏng thao tác, edge case).
- `correctIndex` hợp lệ (0 ≤ idx < options.length), options 2–4 đáp án.
- Mỗi câu bắt buộc có `explanation` không rỗng.
- Nội dung tiếng Việt, kiểm tra được kiến thức CỐT LÕI của bài; KHÔNG trùng ý hoặc wording giữa các câu trong cùng quiz.

---

## 3. SCHEMA CODELAB (`bai-N.codelab.json`) — CHỈ KHI ĐƯỢC YÊU CẦU

```json
{
  "description": "Mô tả nhiệm vụ, 2-3 câu.",
  "initialCode": "function tenHam(...) {\n  // TODO: Viết code tại đây\n\n  return ...;\n}",
  "solution": "Hàm hoàn chỉnh chạy được.",
  "entryFunction": "tenHam",
  "testCases": [
    { "input": "[[...tham so...]]", "expectedOutput": "..." },
    { "input": "[[...]]", "expectedOutput": "...", "isHidden": true }
  ],
  "hints": ["Gợi ý 1", "Gợi ý 2", "Gợi ý 3"]
}
```

### Quy tắc codelab
- `input` = JSON **mảng các tham số** của entry function (vd `"[[1,3,5,7,9],7]"` → fn([1,3,5,7,9], 7)).
- `expectedOutput` = `JSON.stringify` của kết quả (khoảng trắng bị bỏ qua khi so sánh).
- Đúng 2-3 testcase hiển thị + 1 hidden (empty/edge case).
- Entry function đơn giản, mức cơ bản.

---

## 4. VÍ DỤ MẪU HOÀN CHỈNH (bài "Độ phức tạp thuật toán (Big O)")

```markdown
# 🎯 Độ phức tạp thuật toán (Big O) & Phân tích thời gian

## 1. Động cơ học
Khi mảng có 1 triệu phần tử, một thuật toán O(N²) cần tới ~500 tỷ phép toán — máy tính cũng phải chờ. Big O giúp ta dự đoán thuật toán chạy nhanh hay chậm TRƯỚC khi viết code, là ngôn ngữ chung mà mọi kỹ sư phần mềm dùng để so sánh giải pháp.

## 2. Lý thuyết cốt lõi
- Big O mô tả **xu hướng tăng** thời gian chạy khi kích thước đầu vào N tăng, không phải thời gian tuyệt đối.
- Ta bỏ hằng số và số hạng bậc thấp: `3N² + 5N + 10` → `O(N²)`.
- Phân loại phổ biến: O(1) < O(log N) < O(N) < O(N log N) < O(N²) < O(2^N).

### Quy tắc rút gọn
- Bỏ hằng số: O(2N) → O(N).
- Giữ bậc cao nhất: O(N² + N) → O(N²).
- Vòng lặp lồng nhau: nhân số lần lặp (N × N → O(N²)).

## 3. Các mức độ phổ biến
1. O(1): truy cập arr[i], phép toán số học.
2. O(log N): tìm kiếm nhị phân — mỗi bước chia đôi dữ liệu.
3. O(N): duyệt mảng một lần.
4. O(N log N): các thuật toán sắp xếp tốt (Merge/Quick/Heap).
5. O(N²): hai vòng lặp lồng nhau.

### Ví dụ
```javascript
// O(1) — thời gian không đổi
function getFirst(arr) { return arr[0]; }

// O(N) — thời gian tỷ lệ với N
function sumAll(arr) {
  let total = 0;
  for (const v of arr) total += v; // N phép cộng
  return total;
}

// O(N²) — hai vòng lặp lồng nhau
function printPairs(arr) {
  for (let i = 0; i < arr.length; i++) {      // N lần
    for (let j = 0; j < arr.length; j++) {    // N lần mỗi i
      console.log(arr[i], arr[j]);            // N² phép in
    }
  }
}
```

## 4. Độ phức tạp & so sánh
| Trường hợp | Thời gian | Ghi chú |
| :--- | :--- | :--- |
| Tốt nhất | O(1) | Dữ liệu đặc biệt thuận lợi |
| Trung bình | O(N) | Phụ thuộc thuật toán cụ thể |
| Xấu nhất | O(N²) | Hai vòng lặp lồng nhau |

- Bộ nhớ: O(1) nếu không cấp phát thêm cấu trúc phụ thuộc N.

## 5. Liên kết trực quan hóa
👉 Bấm **Trực Quan Hóa** để xem Tìm kiếm nhị phân — minh họa trực quan cho thuật toán O(log N).

## 6. Tổng kết
- Big O đo xu hướng tăng trưởng, không phải thời gian đo bằng đồng hồ.
- Luôn bỏ hằng số và giữ bậc cao nhất.
- O(log N) và O(N log N) là mục tiêu thiết kế của các thuật toán tốt.
- Bẫy thường gặp: nhầm O(N) với thời gian chạy thực tế — hai thuật toán cùng O(N) có thể khác nhau nhiều lần về tốc độ.

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)
```

```json
{
  "quizTitle": "Trắc nghiệm Big O & Phân tích thời gian",
  "topic": "dsa",
  "difficulty": 1,
  "xpReward": 40,
  "questions": [
    {
      "questionText": "Độ phức tạp O(1) nghĩa là gì?",
      "options": ["Thời gian chạy tăng tuyến tính theo N", "Thời gian chạy không đổi, không phụ thuộc N", "Thời gian chạy tỷ lệ bình phương", "Thời gian chạy theo logarit"],
      "correctIndex": 1,
      "explanation": "O(1) — thời gian thực thi không đổi bất kể kích thước đầu vào."
    },
    {
      "questionText": "Biểu thức 3N² + 5N + 10 có Big O là gì?",
      "options": ["O(N)", "O(N²)", "O(N³)", "O(N log N)"],
      "correctIndex": 1,
      "explanation": "Ta bỏ hằng số và giữ bậc cao nhất: N²."
    },
    {
      "questionText": "Tìm kiếm nhị phân có độ phức tạp thời gian là bao nhiêu?",
      "options": ["O(1)", "O(N)", "O(log N)", "O(N²)"],
      "correctIndex": 2,
      "explanation": "Mỗi bước chia đôi không gian tìm kiếm nên chỉ cần log2(N) bước."
    },
    {
      "questionText": "Hai vòng lặp lồng nhau, mỗi vòng lặp N lần, có độ phức tạp là gì?",
      "options": ["O(N)", "O(N log N)", "O(N²)", "O(2N)"],
      "correctIndex": 2,
      "explanation": "Số phép lặp là N × N = N²."
    }
  ]
}
```

```json
{
  "description": "Hoàn thiện hàm binarySearch(arr, target) trả về chỉ số của target trong mảng đã sắp xếp tăng dần, hoặc -1 nếu không tồn tại. Yêu cầu O(log N).",
  "initialCode": "function binarySearch(arr, target) {\n  // TODO: Viết code tại đây\n\n  return -1;\n}",
  "solution": "function binarySearch(arr, target) {\n  let lo = 0, hi = arr.length - 1;\n  while (lo <= hi) {\n    const mid = Math.floor((lo + hi) / 2);\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) lo = mid + 1;\n    else hi = mid - 1;\n  }\n  return -1;\n}",
  "entryFunction": "binarySearch",
  "testCases": [
    { "input": "[[1, 3, 5, 7, 9], 7]", "expectedOutput": "3" },
    { "input": "[[1, 3, 5, 7, 9], 4]", "expectedOutput": "-1" },
    { "input": "[[] , 5]", "expectedOutput": "-1", "isHidden": true }
  ],
  "hints": ["Khởi tạo lo = 0, hi = arr.length - 1.", "Tính mid = Math.floor((lo + hi) / 2) mỗi vòng lặp.", "Khi lo vượt hi, trả về -1."]
}
```

---

## 5. CHECKLIST CHẤT LƯỢNG (agent tự kiểm trước khi bàn giao)
- [ ] ContentMd đủ 6 mục theo thứ tự, độ dài 450–750 từ, tiếng Việt
- [ ] Không chứa ký tự `"` (double quote) trong contentMd
- [ ] Code JS chạy được, đúng thuật toán, đúng độ phức tạp khai báo
- [ ] Quiz đúng 4 câu, correctIndex hợp lệ, explanation đầy đủ, không trùng câu hỏi cũ
- [ ] Codelab (nếu có): entryFunction khớp solution, testcase đúng convention
- [ ] Kiến thức chính xác khoa học, không sao chép nguyên văn nguồn
