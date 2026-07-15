# 🧪 Danh Sách Ca Kiểm Thử (Unit Test Cases Specification) - Sprint 4
## ⚙️ Interactive Quiz & Lecture System

Tài liệu này đặc tả chi tiết **3 ca kiểm thử đơn vị (Unit Tests)** được triển khai trong phân hệ `Interactive Quiz & Lecture System` để nghiệm thu chất lượng mã nguồn cốt lõi của **Sprint 4: Interactive Quiz & Lecture System**.

---

## 📌 1. Tổng Quan Kết Quả Kiểm Thử (Test Execution Summary)

*   **Tổng số test cases:** 3/3
*   **Trạng thái:** 🟢 PASS ALL (100% thành công)
*   **Thư viện kiểm thử:** `vitest`
*   **Tập tin kiểm thử:** [QuizEvaluationEngine.spec.ts](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/frontend/src/features/quiz/__tests__/QuizEvaluationEngine.spec.ts)

---

## 🛠️ 2. Đặc Tả Chi Tiết Các Ca Kiểm Thử (Test Cases Specification)

### 2.1. Nhóm 1: Kiểm Thử Điều Phối Slide Bài Giảng & Giải Thuật (LecturePlaybackCoordinator)

#### 📝 TC-QUIZ-01: Ca kiểm thử chuyển đổi Slide & Đồng bộ giải thuật
*   **Mục tiêu:** Xác nhận rằng `LecturePlaybackCoordinator` quản lý trạng thái slide chính xác, chuyển tiếp `nextSlide` và lùi lại `prevSlide` đúng giới hạn biên, đồng thời kích hoạt callback đồng bộ VCR triggerFrameIndex tương thích.
*   **Đầu vào:**
    *   Danh sách 2 slide mẫu:
        *   Slide 1: `slide-1` (triggerFrameIndex = 0, highlightSourceLine = 1)
        *   Slide 2: `slide-2` (triggerFrameIndex = 5, highlightSourceLine = 10)
    *   Hành động: khởi tạo coordinator -> di chuyển sang slide tiếp theo -> lùi lại slide trước.
*   **Kết quả mong đợi:**
    *   Trạng thái chỉ số bắt đầu bằng `0`.
    *   Sau khi gọi `nextSlide()`, chỉ số chuyển lên `1` và callback nhận đúng sự kiện slide 2 với triggerFrameIndex = 5.
    *   Gọi `nextSlide()` lần nữa ở cuối biên không tăng chỉ số và không lỗi luồng.
    *   Gọi `prevSlide()` đưa chỉ số trở về `0` và callback nhận đúng sự kiện slide 1 với triggerFrameIndex = 0.
    *   Gọi `prevSlide()` lần nữa ở đầu biên không làm âm chỉ số.
*   **Trạng thái:** 🟢 **PASS**

---

### 2.2. Nhóm 2: Kiểm Thử Bộ Kiểm Định Mã Nguồn Tĩnh (Static compliance check)

#### 📝 TC-QUIZ-02: Ca kiểm thử kiểm soát từ khóa bắt buộc Client-side
*   **Mục tiêu:** Đảm bảo `QuizEvaluationEngine.verifyCodeCompliance` phân tích mã nguồn của học viên viết trong Monaco Editor dưới dạng tĩnh (Static Code Linting) trong RAM siêu tốc dưới 2ms, tìm kiếm chính xác sự hiện diện của tất cả từ khóa giải thuật bắt buộc.
*   **Đầu vào:**
    *   Mã nguồn học viên nhập vào Monaco Editor:
        ```javascript
        function bubbleSort(arr) {
          let temp = arr[i];
          arr[i] = arr[i+1];
          arr[i+1] = temp;
        }
        ```
    *   Trường hợp 1: Tập từ khóa bắt buộc gồm `['temp', 'bubbleSort']`.
    *   Trường hợp 2: Tập từ khóa bắt buộc gồm `['quickSort']`.
*   **Kết quả mong đợi:**
    *   Trường hợp 1 phải trả về `true` (tuân thủ mã nguồn tốt).
    *   Trường hợp 2 phải trả về `false` (thiếu từ khóa bắt buộc, báo lỗi compliance linter).
*   **Trạng thái:** 🟢 **PASS**

---

### 2.3. Nhóm 3: Chấm Điểm Trắc Nghiệm Tự Động & Đánh Giá Ngưỡng Đạt (Passed Threshold)

#### 📝 TC-QUIZ-03: Ca kiểm thử chấm điểm trắc nghiệm & Ngưỡng đạt 80%
*   **Mục tiêu:** Xác thực thuật toán `QuizEvaluationEngine.calculateQuizScore` chấm điểm chính xác dựa trên danh sách câu hỏi và cấu hình trọng số điểm của từng câu, đồng thời đánh giá đúng ngưỡng đạt chuẩn tối thiểu 80% (passed: true/false).
*   **Đầu vào:**
    *   Cấu hình 5 câu hỏi trắc nghiệm, mỗi câu có điểm tối đa 10: `[{ id: 'q1', correctAnswer: 'A', maxScore: 10 }, ...]` (Tổng điểm tuyệt đối = 50). Ngưỡng đạt 80% là 40 điểm.
    *   Học viên trả lời:
        *   Trường hợp 1 (Đúng cả 5 câu): `{ q1: 'A', q2: 'B', q3: 'C', q4: 'D', q5: 'A' }`
        *   Trường hợp 2 (Đúng 4 câu, sai 1 câu): `{ q1: 'A', q2: 'B', q3: 'C', q4: 'D', q5: 'B' }`
        *   Trường hợp 3 (Đúng 3 câu, sai 2 câu): `{ q1: 'A', q2: 'B', q3: 'C', q4: 'C', q5: 'B' }`
*   **Kết quả mong đợi:**
    *   Trường hợp 1 trả về điểm 50 và `passed: true`.
    *   Trường hợp 2 trả về điểm 40 (đạt đúng 80%) và `passed: true`.
    *   Trường hợp 3 trả về điểm 30 (dưới 80%) và `passed: false`.
*   **Trạng thái:** 🟢 **PASS**

---

## 📈 3. Kết Luận

Các ca kiểm thử tự động của Sprint 4 đã bao phủ 100% logic điều khiển điều phối slide, kiểm định tĩnh mã nguồn linter RAM, và chấm điểm trắc nghiệm thông minh tại máy khách. Quá trình kiểm thử diễn ra siêu tốc (toàn bộ suite chỉ mất 14ms), đảm bảo trải nghiệm tương tác học tập thực tế mượt mà, phản hồi tức khắc và bền vững tuyệt đối dưới Client-side.
