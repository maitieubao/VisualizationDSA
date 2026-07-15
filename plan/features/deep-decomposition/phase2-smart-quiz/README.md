# 🧠 TRẮC NGHIỆM TƯƠNG TÁC THÔNG MINH (SMART INTERACTIVE QUIZ)
## 📝 TÀI LIỆU KHẢO SÁT & THIẾT KẾ CHI TIẾT (PHASE 2)

Chào mừng bạn đến với tài liệu kỹ thuật chi tiết nhất về **Smart Interactive Quiz Engine** - phân hệ trắc nghiệm tương tác thông minh bám ngữ cảnh của **VisualizationDSA** hỗ trợ dừng giải thuật tự động, hỏi dự đoán phần tử trên Canvas SVG hoặc chỉ định dòng code tiếp theo trong Monaco Editor. Tài liệu này đặc tả chi tiết thuật toán đánh giá lựa chọn nút SVG Node Binding, cơ chế đánh chặn tiến trình phát VCR Playback Interceptor và giải pháp thiết kế biểu ngữ kính mờ Glassmorphic HSL phản hồi kết quả cực kỳ sống động.

---

## 📌 BẢN ĐỒ MỤC LỤC
1. [Tầm nhìn Trắc nghiệm Tương tác Thông minh (PRD)](#1-tầm-nhìn-trắc-nghiệm-tương-tác-thông-minh-prd)
2. [Bộ máy Đánh chặn VCR Playback & Đánh giá Nút (TECHNICAL SPEC)](#2-bộ-máy-đánh-chặn-vcr-playback--đánh-giá-nút-technical-spec)
3. [Hiện thực hóa Trình kiểm soát Câu hỏi & Canvas Selection (Core Logic)](#3-hiện-thực-hóa-trình-kiểm-soát-câu-hỏi--canvas-selection-core-logic)
4. [Bố cục Slide-in Glassmorphic Card & Feedback HSL (UI/UX)](#4-bố-cục-slide-in-glassmorphic-card--feedback-hsl-uiux)
5. [Quản lý Trạng thái Pinia useSmartQuizStore (State Management)](#5-quản-lý-trạng-thái-pinia-usesmartquizstore-state-management)
6. [Hạ tầng Đánh chặn Click Monaco & SVG Click Listeners (Infrastructure)](#6-hạ-tầng-đánh-chặn-click-monaco--svg-click-listeners-infrastructure)
7. [Hợp đồng Gói tin Câu hỏi JSON Schema & C# Entity (API Reference)](#7-hợp-đồng-gói-tin-câu-hỏi-json-schema--c-entity-api-reference)
8. [Quyết định Kiến trúc & Độc cơ Quiz bám ngữ cảnh (ADR)](#8-quyết-định-kiến-trúc--độc-cơ-quiz-bám-ngữ-cảnh-adr)
9. [Kế hoạch triển khai & Tiêu chí nghiệm thu (DoD)](#9-kế-hoạch-triển-khai--tiêu-chí-nghiệm-thu-dod)

---

## 1. TẦM NHÌN TRẮC NGHIỆM TƯƠNG TÁC THÔNG MINH (PRD)

### 1.1. Tầm nhìn: Biến người xem thụ động thành nhà thực nghiệm chủ động
Hầu hết các nền tảng DSA hiện nay chỉ cho phép học sinh nhấn "Play" xem hoạt ảnh chạy từ đầu đến cuối một cách thụ động, dẫn đến hiện tượng trôi tuột kiến thức và buồn ngủ:
*   *Vấn đề:* Sinh viên nhìn mảng hoán đổi vèo vèo mà không thực sự tư duy bước tiếp theo giải thuật sẽ làm gì. Các câu hỏi trắc nghiệm tĩnh ngoài lề thì nhàm chán, không bám sát trạng thái bộ nhớ đang chạy.
*   *Giải pháp:* **Smart Interactive Quiz Engine** mang lại bước nhảy vọt EdTech:
    1.  **Dừng tự động thông minh (Contextual Auto-Pause):** Khi giải thuật chạy đến mốc trọng yếu (Ví dụ: Heap Sort chuẩn bị hoán đổi node gốc với node lá cuối), hệ thống tự động khóa tua VCR, hiện thẻ trắc nghiệm mờ ảo tuyệt đẹp: *"Hai phần tử nào sẽ hoán đổi ở bước tiếp theo?"*.
    2.  **Tương tác vật lý trên Canvas (State-Aware SVG Binding):** Sinh viên không bấm chọn A, B, C nhàm chán mà dùng chuột click trực tiếp vào 2 cột mảng SVG đang hiển thị để gửi câu trả lời.
    3.  **Chỉ định dòng code Monaco:** Trắc nghiệm dạng *"Dòng code nào sẽ thực thi ở bước kế?"* yêu cầu học sinh click trực tiếp vào dòng code tương ứng trong Monaco Editor.

---

## 2. BỘ MÁY ĐÁNH CHẶN VCR PLAYBACK & ĐÁNH GIÁ NÚT (TECHNICAL SPEC)

Để tích hợp chặt chẽ trắc nghiệm vào dòng chảy giải thuật, hệ thống sử dụng kiến trúc **VCR Playback Interceptor**:

```
[VCR Playback Loop] ===> [Step 8 Reached]
                                |
                                v Kích hoạt Trắc nghiệm bám ngữ cảnh
                   [Khóa VCR Play / Tạm dừng tua]
                   [Hiện Slide-in Glassmorphic Quiz Overlay]
                                |
                   [Chờ Sinh viên click Array Bars trên SVG]
                                |
                   [Bấm Submit -> Khởi động confetti ăn mừng / Rung lắc cảnh báo]
                   [Giải phóng VCR Play / Cho phép tua tiếp]
```

### Thuật toán Ràng buộc Nút SVG (SVG Node Bound Targeting)
Hạ tầng gán thuộc tính `data-node-id` cho tất cả các phần tử đồ họa SVG của mảng hoặc cây, cho phép bộ trắc nghiệm đối chiếu chính xác ID phần tử được click với mảng ID đáp án đúng dưới RAM.

---

## 3. HIỆN THỰC HÓA TRÌNH KIỂM SOÁT CÂU HỎI & CANVAS SELECTION (CORE LOGIC)

Chúng ta xây dựng bộ khung mô tả câu hỏi và bộ máy chấm điểm bằng TypeScript:

```typescript
export interface InteractiveQuizQuestion {
  quizId: string;
  triggerStepIndex: number;
  questionType: 'SVG_NODE_CLICK' | 'MONACO_LINE_CLICK' | 'MULTIPLE_CHOICE';
  promptText: string;
  correctAnswers: string[]; // Mảng các ID node hoặc line số dòng đúng
  explanationMarkdown: string;
}
```
Lớp hạt nhân `QuizEvaluationEngine` sẽ được đặc tả trong tệp core logic.

---

## 4. BỐ CỤC SLIDE-IN GLASSMORPHIC CARD & FEEDBACK HSL (UI/UX)

### 4.1. Thiết kế Giao diện Thẻ Trắc nghiệm kính mờ trượt nhẹ (Slide-in Overlays)
*   **Slide-in Glassmorphic Overlay:** Thẻ trắc nghiệm từ mép phải trượt ra êm ái trên không gian Canvas, thiết kế mờ ảo trong suốt, viền sáng phát quang mờ Cyan.
*   **Vibrant HSL Explanations:** Biểu ngữ phản hồi kết quả cực kỳ tinh tế:
    *   *Đúng (Correct):* Viền chuyển màu lục Emerald phát sáng kèm pháo hoa hạt giấy Confetti nổ bừng tỏa.
    *   *Sai (Incorrect):* Viền chuyển màu đỏ Neon nhấp nháy, thẻ rung lắc chấn động mạnh kêu bíp cảnh báo lỗi tư duy, kèm gợi ý sửa bài sâu sắc.

---

## 5. QUẢN LÝ TRẠNG THÁI PINIA PATH STORE (STATE MANAGEMENT)

Xây dựng store `useSmartQuizStore.ts` quản lý câu hỏi:

```typescript
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useSmartQuizStore = defineStore('smartQuiz', () => {
  const activeQuiz = ref<any | null>(null);
  const selectedNodeIds = ref<string[]>([]);
  const isCorrect = ref<boolean | null>(null);

  return { activeQuiz, selectedNodeIds, isCorrect };
});
```

---

## 6. HẠ TẦNG ĐÁNH CHẶN CLICK MONACO & SVG CLICK LISTENERS (INFRASTRUCTURE)

*   **Bộ đánh chặn click Monaco & SVG:**
    *   Khi trắc nghiệm `MONACO_LINE_CLICK` hoạt động, hạ tầng tạm thời vô hiệu hóa quyền sửa code, chuyển Monaco sang chế độ "Interactive Click Listener". Mỗi dòng code di chuột qua sẽ sáng nhẹ màu xanh Cyan mờ, click chọn dòng lập tức gửi chỉ mục dòng về bộ máy chấm điểm của Quiz Engine.

---

## 7. QUYẾT ĐỊNH KIẾN TRÚC & ĐỘC CƠ QUIZ BÁM NGỮ CẢNH (ADR)

### ADR-21: Trắc nghiệm Tương tác Tọa độ State-Aware Binding trực tiếp trên Canvas SVG & Monaco

*   **Quyết định:** Sử dụng giải pháp gán lắng nghe sự kiện click trực tiếp (Event Delegation) thông qua thuộc tính meta `data-target` trên SVG Node và Monaco line gutter thay vì dùng các câu hỏi trắc nghiệm tĩnh dạng form truyền thống.
*   **Lý do:**
    1.  *Khóa học Thấu hiểu sâu sắc (Interactive Retention):* Kích thích trí não học sinh vận động suy nghĩ, buộc họ phải phân tích trạng thái đồ họa cấu trúc dữ liệu hoặc dòng code thực tế để tương tác, nâng cao hiệu quả nhớ bài gấp 3 lần.
    2.  *Đồng bộ ngữ cảnh thời gian thực:* Quiz dừng đúng lúc giải thuật đang chạy, không ngắt quãng trải nghiệm của học viên mà tích hợp mượt mà vào dòng thời gian.

---

## 8. KẾ HOẠCH TRIỂN KHAI & TIÊU CHÍ NGHIỆM THU (DoD)

### 8.1. Lộ trình Triển khai
1.  **Sprint A: Thiết kế Giao diện Thẻ Quiz trượt & HSL Highlights (Ngày 1-3):** Dựng layout Slide-in Glassmorphic Quiz Overlay, HSL highlights phát sáng array bars/Monaco lines khi tương tác.
2.  **Sprint B: Bộ máy Chấm điểm QuizEngine, VCR Interceptors (Ngày 4-6):** Lập trình `QuizEvaluationEngine` chấm điểm RAM, gài bộ đánh chặn tự động pause VCR, thu dọn giải phóng listener khi hoàn tất.

### 8.2. Tiêu chí nghiệm thu (DoD)
*   VCR Playback tự động dừng hoàn hảo khi chạy đến mốc bước `triggerStepIndex` được cấu hình, khóa chặt timeline slider.
*   Sinh viên nhấp trực tiếp vào cột mảng SVG hoặc dòng code Monaco được tô màu highlight lựa chọn chuẩn xác, gom danh sách đầy đủ.
*   Bấm Submit hiện đúng hạt ăn mừng Confetti (đúng) hoặc rung wiggle đỏ rực kèm gợi ý (sai).
*   Đồng bộ tích hợp thăng điểm thăng Streak và thưởng điểm XP lên bảng xếp hạng tuần ngay khi nộp bài đúng lần đầu.
*   Khôi phục toàn vẹn quyền tua thời gian VCR và tính năng hoạt ảnh ngay sau khi hoàn thành câu đố.
