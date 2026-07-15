# 📝 HỆ THỐNG TRẮC NGHIỆM TƯƠNG TÁC (INTERACTIVE QUIZ SYSTEM)
## 📝 TÀI LIỆU KHẢO SÁT & THIẾT KẾ CHI TIẾT (PHASE 1)

Chào mừng bạn đến với tài liệu kỹ thuật chi tiết nhất về **Interactive Quiz System** - phân hệ đánh giá năng lực tích hợp trực tiếp vào bài giảng trong **VisualizationDSA**. Tài liệu này đặc tả chi tiết kiến trúc điểm dừng trắc nghiệm xen kẽ bài học (Interactive Checkpoints), trắc nghiệm tương tác nhấp chọn trực tiếp lên Canvas (Canvas-targeted Questions), cơ chế hiển thị lời giải thích động bằng Markdown, và hệ thống lưu trữ điểm số cục bộ (Local Storage Stats).

---

## 📌 BẢN ĐỒ MỤC LỤC
1. [Mục tiêu Nghiệp vụ & Trắc nghiệm Sư phạm (PRD)](#1-mục-tiêu-nghiệp-vụ--trắc-nghiệm-sư-phạm-prd)
2. [Kiến trúc Điểm dừng & Nhận diện Đáp án Canvas (TECHNICAL SPEC)](#2-kiến-trúc-điểm-dừng--nhận-diện-đáp-án-canvas-technical-spec)
3. [Hiện thực hóa Bộ máy Đối chiếu & Chấm điểm (Core Logic)](#3-hiện-thực-hóa-bộ-máy-đối-chiếu--chấm-điểm-core-logic)
4. [Thiết kế Thẻ Trắc nghiệm nổi Glassmorphism & Glow (UI/UX)](#4-thiết-kế-thẻ-trắc-nghiệm-nổi-glassmorphism--glow-uiux)
5. [Quản lý Trạng thái Khóa Bài giảng & Pinia Store (State Management)](#5-quản-lý-trạng-thái-khóa-bài-giảng--pinia-store-state-management)
6. [Hợp đồng JSON Schema Câu hỏi Giáo trình (API Reference)](#6-hợp-đồng-json-schema-câu-hỏi-giáo-trình-api-reference)
7. [Quyết định Kiến trúc & Đánh giá Va chạm Canvas (ADR)](#7-quyết-định-kiến-trúc--đánh-giá-va-chạm-canvas-adr)
8. [Kế hoạch triển khai & Tiêu chí nghiệm thu (DoD)](#8-kế-hoạch-triển-khai--tiêu-chí-nghiệm-thu-dod)

---

## 1. MỤC TIÊU NGHIỆP VỤ & TRẮC NGHIỆM SƯ PHẠM (PRD)

### 1.1. Tầm nhìn EdTech: Chống thụ động, kích thích tư duy chủ động
Hầu hết các nền tảng trực quan hóa giải thuật khác chỉ cho học sinh ngồi nhìn hoạt ảnh chạy một cách thụ động từ đầu đến cuối như xem phim, dẫn đến hiện tượng "hiểu ảo" - học sinh nghĩ mình hiểu nhưng khi bắt tay vào làm bài thi thì lúng túng.

**Interactive Quiz System** phá vỡ sự thụ động này bằng 2 chế độ trắc nghiệm đỉnh cao:
*   **Điểm dừng Trắc nghiệm đột xuất (Interactive Checkpoints):** Trong lúc bài giảng điện tử tự động phát (E-Lecture), khi hệ thống chạy đến khung hình số $N$ quan trọng (Ví dụ: trước bước phân tách trục Pivot của Quick Sort), bài giảng sẽ **tự động tạm dừng (Pause)** và hiện lên một thẻ câu hỏi nổi: *"Phần tử nào sẽ được chọn làm chốt (Pivot) tiếp theo?"*. Học sinh bắt buộc phải trả lời để mở khóa phát tiếp bài giảng.
*   **Trắc nghiệm nhấp Canvas (Canvas-targeted Questions):** Thay vì chọn các nút đáp án A, B, C nhàm chán, câu hỏi yêu cầu người học tương tác trực tiếp lên đồ họa: *"Hãy click vào Node đại diện cho đỉnh kề có khoảng cách ngắn nhất đến A tại bước này"*. Người học nhấp trực tiếp vào vòng tròn Node trên thẻ Canvas để nộp đáp án.
*   **Giải thích Markdown trực quan:** Sau khi nộp bài, hệ thống hiển thị tức thời lời giải thích kỹ thuật sắc sảo dưới dạng Markdown bo tròn Glassmorphism, chỉ ra lỗi sai nhận thức của người học ngay tại chỗ.

---

## 2. KIẾN TRÚC ĐIỂM DỰNG & NHẬN DIỆN ĐÁP ÁN CANVAS (TECHNICAL SPEC)

Khi bài giảng chạy, `useLectureStore` so khớp khung hình hiện tại với danh sách các mốc điểm dừng trắc nghiệm đã được cấu hình trong JSON bài học.

### Sơ đồ Quy trình Điểm dừng Trắc nghiệm (Interactive Checkpoints)
```
          [useLectureStore] (currentFrameIndex tăng lên)
                                 |
                                 v
               Kiểm tra xem currentFrameIndex có trùng với
                 checkpoint.frameIndex trong JSON hay không
                                 |
         +-----------------------+-----------------------+
         |                                               |
     [Trùng khớp]                                    [Không trùng]
         |                                               |
         v                                               v
  1. Tự động Pause bài giảng.                     Tiếp tục phát hoạt ảnh
  2. Kích hoạt cờ interactionLocked = true           bình thường.
  3. Hiện hộp thoại trắc nghiệm đè lên Canvas.
```

### Nhận diện đáp án nhấp chọn Canvas (Canvas Hit-Target Verification)
Đối với câu hỏi trắc nghiệm yêu cầu tương tác click đỉnh đồ thị:
1.  Câu hỏi lưu trữ ID của đỉnh đáp án đúng là `targetNodeId: "node_C"`.
2.  Khi người học click chuột vào tọa độ ($X, Y$) trên Canvas, bộ phát hiện va chạm hình học (Euclidean Distance) xác định xem người học đang click trúng node nào.
3.  Nếu node bị click có `node.id === targetNodeId`: Ghi nhận câu trả lời ĐÚNG. Ngược lại: Ghi nhận câu trả lời SAI.

---

## 3. HIỆN THỰC HÓA BỘ MÁY ĐỐI CHIẾU & CHẤM ĐIỂM (CORE LOGIC)

Chúng ta xây dựng bộ máy chấm điểm TypeScript xử lý cả 3 định dạng câu hỏi: Nhiều lựa chọn (Multiple Choice), Đúng/Sai (True/False) và Nhấp chọn đỉnh Canvas (Canvas Target):

```typescript
export type QuestionType = 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'CANVAS_TARGET';

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  prompt: string; // Nội dung câu hỏi
  options?: string[]; // Các phương án chọn (nếu có)
  correctOptionIndex?: number; // Chỉ số đáp án đúng (0-indexed)
  targetNodeId?: string; // ID đỉnh đáp án đúng trên Canvas (cho CANVAS_TARGET)
  explanation: string; // Lời giải thích chi tiết dạng Markdown
}
```

Hệ thống tiến hành đối chiếu đáp án gửi lên và trả về kết quả tức thì kèm lời giải thích Markdown cao cấp.

---

## 4. THIẾT KẾ THẺ TRẮC NGHIỆM NỔI GLASSMORPHISM & GLOW (UI/UX)

### 4.1. Thẻ Trắc nghiệm Nổi đè lên Canvas (Floating Quiz Card Overlay)
Hộp thoại câu hỏi xuất hiện nổi lơ lửng ngay chính giữa Canvas bằng hiệu ứng Zoom-in mượt mà:
*   **Styling:** Bo góc tròn lớn (`border-radius: 28px`), nền tối mờ kính sương phủ (`backdrop-filter: blur(20px)`), viền phát sáng nhẹ màu Slate.
*   **Trạng thái trả lời:**
    *   **Trả lời ĐÚNG:** Viền hộp thoại lóe sáng xanh lá cây (Neon Emerald), xuất hiện huy hiệu chính xác kèm nút *"Tiếp tục bài giảng"*.
    *   **Trả lời SAI:** Viền hộp thoại chuyển màu đỏ Neon nhạt (Rose Red), rung nhẹ (CSS Shake) và hiển thị hộp thoại lý thuyết giải thích chi tiết lý do sai.

---

## 5. QUẢN LÝ TRẠNG THÁI KHÓA BÀI GIẢNG & PINIA STORE (STATE MANAGEMENT)

Xây dựng bộ quản lý trạng thái Pinia Setup Store `useQuizStore.ts`:

```typescript
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useLectureStore } from './useLectureStore';

export const useQuizStore = defineStore('quiz', () => {
  const lectureStore = useLectureStore();

  // State
  const activeQuestion = ref<QuizQuestion | null>(null);
  const selectedAnswerIndex = ref<number | null>(null);
  const isSubmitted = ref(false);
  const isCorrect = ref(false);
  const correctAnswersCount = ref(0);

  // Getter: Kiểm tra xem bài giảng có đang bị khóa bởi câu hỏi trắc nghiệm hay không
  const isLectureBlocked = computed(() => activeQuestion.value !== null);

  // Actions
  function presentQuestion(question: QuizQuestion) {
    activeQuestion.value = question;
    selectedAnswerIndex.value = null;
    isSubmitted.value = false;
    isCorrect.value = false;
    
    // Khóa cứng tương tác bài giảng
    lectureStore.lockLectureInteraction();
  }

  function submitOptionAnswer(index: number) {
    if (!activeQuestion.value || isSubmitted.value) return;
    selectedAnswerIndex.value = index;
    isSubmitted.value = true;
    
    isCorrect.value = (index === activeQuestion.value.correctOptionIndex);
    if (isCorrect.value) correctAnswersCount.value++;
  }

  return { activeQuestion, selectedAnswerIndex, isSubmitted, isCorrect, isLectureBlocked, presentQuestion, submitOptionAnswer };
});
```

---

## 6. HỢP ĐỒNG JSON SCHEMA CÂU HỎI GIÁO TRÌNH (API REFERENCE)

Hệ thống trắc nghiệm tải kịch bản câu hỏi tích hợp thông qua cấu trúc JSON chuẩn dưới đây.

### JSON Schema Kịch bản Câu hỏi Trắc nghiệm:
```json
{
  "questions": [
    {
      "id": "q_bubble_01",
      "type": "MULTIPLE_CHOICE",
      "prompt": "Tại sao vòng lặp ngoài Bubble Sort có thể dừng sớm?",
      "options": [
        "Vì mảng đã được đảo ngược hoàn toàn.",
        "Vì trong một vòng lặp trong không phát sinh bất kỳ phép hoán vị (Swap) nào.",
        "Vì thuật toán luôn chạy hết cỡ n^2 lần."
      ],
      "correctOptionIndex": 1,
      "explanation": "Đúng vậy! Nếu trong một lượt quét không phát sinh bất kỳ phép hoán vị nào, điều đó chứng tỏ tất cả các phần tử đã đứng đúng thứ tự."
    }
  ]
}
```

---

## 7. QUYẾT ĐỊNH KIẾN TRÚC & ĐÁNH GIÁ VA CHẠM CANVAS (ADR)

### ADR-08: In-Canvas Hit-Target Question Verification

*   **Bối cảnh:** Hầu hết các câu hỏi trắc nghiệm thông thường chỉ dừng lại ở dạng chữ (Multiple choice). Tuy nhiên, học thuật thuật toán đồ thị và cây đòi hỏi người học phải có khả năng nhận diện hình thái cấu trúc trực quan (ví dụ: chỉ ra node cha, con trỏ Pivot, hoặc đỉnh kề có khoảng cách ngắn nhất).
*   **Quyết định:** Thiết lập cơ chế **Nhấp chọn Canvas để trả lời (In-Canvas Hit-Target)**. 
    *   Hệ thống cho phép câu hỏi định nghĩa một thuộc tính `targetNodeId`.
    *   Khi câu hỏi thuộc loại `CANVAS_TARGET` hoạt động, toàn bộ thanh công cụ Toolbar bị khóa, thẻ Canvas lắng nghe sự kiện click. Hệ thống sử dụng thuật toán khoảng cách Euclide để so khớp xem đỉnh bị click trúng có khớp với đáp án đúng hay không.
*   **Kết quả:** Trải nghiệm kiểm tra năng lực cực kỳ lôi cuốn, giống như một trò chơi đố vui (Gamified quiz) trực quan sinh động hơn gấp nhiều lần trắc nghiệm truyền thống.

---

## 8. KẾ HOẠCH TRIỂN KHAI & TIÊU CHÍ NGHIỆM THU (DoD)

### 8.1. Lộ trình Triển khai
1.  **Sprint A: Thiết kế Overlay Card Glassmorphism (Ngày 1-2):** Xây dựng component khung chứa thẻ câu hỏi nổi, CSS hiệu ứng chuyển đổi trạng thái Đúng/Sai phát sáng Neon.
2.  **Sprint B: Chấm điểm Canvas-targeted & Lưu trữ điểm số (Ngày 3-5):** Hiện thực hóa nhận diện click đỉnh Canvas trả lời câu hỏi hình học, tích hợp lưu trữ điểm số cục bộ (localStorage Stats) và mở khóa bài giảng E-Lecture.

### 8.2. Tiêu chí nghiệm thu (DoD)
*   Thẻ câu hỏi hiện lên nổi lơ lửng chính giữa Canvas mượt mà, khóa cứng tuyệt đối thanh Slider điều tốc và VCR control khi chưa trả lời.
*   Hỏi đáp tương tác click đỉnh Canvas xác định chính xác đỉnh trúng đáp án, nhấp sai báo đỏ ngay tức khắc.
*   Nhấp nút tiếp tục sau khi trả lời xong tự động tháo dỡ khóa tương tác, mở phát tiếp bài giảng mượt mà.
