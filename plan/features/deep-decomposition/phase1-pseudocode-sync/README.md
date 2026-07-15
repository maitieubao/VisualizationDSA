# 💻 ĐỒNG BỘ MÃ GIẢ & THEO DÕI BIẾN (PSEUDOCODE SYNC & WATCH PANEL)
## 📝 TÀI LIỆU KHẢO SÁT & THIẾT KẾ CHI TIẾT (PHASE 1)

Chào mừng bạn đến với tài liệu kỹ thuật chi tiết nhất về **Pseudocode Sync & Variable Watch Panel** - phân hệ cầu nối sư phạm kết nối trực tiếp các hoạt ảnh hình khối trên Canvas với các dòng mã nguồn chương trình trong **VisualizationDSA**. Tài liệu này đặc tả chi tiết kiến trúc ánh xạ dòng lệnh thời gian thực, bảng theo dõi biến số động (Watch Panel), cơ chế chuyển đổi đa ngôn ngữ (C++, Java, Python, JavaScript), và giải pháp tương tác ngược (Click-to-Snap): Nhấp chuột vào một dòng mã giả để Canvas tự động tua nhanh tới khung hình thực thi dòng lệnh đó.

---

## 📌 BẢN ĐỒ MỤC LỤC
1. [Mục tiêu Nghiệp vụ & Sự đồng bộ Sư phạm (PRD)](#1-mục-tiêu-nghiệp-vụ--sự-đồng-bộ-sư-phạm-prd)
2. [Kiến trúc Ánh xạ Hai chiều & Đa Ngôn ngữ (TECHNICAL SPEC)](#2-kiến-trúc-ánh-xạ-hai-chiều--đa-ngôn-ngữ-technical-spec)
3. [Hiện thực hóa Bộ phân giải Dòng lệnh & Biến động (Core Logic)](#3-hiện-thực-hóa-bộ-phân-giải-dòng-lệnh--biến-động-core-logic)
4. [Thiết kế Bảng Mã nguồn Glassmorphism & Watch Panel (UI/UX)](#4-thiết-kế-bảng-mã-nguồn-glassmorphism--watch-panel-uiux)
5. [Quản lý Pinia Store Đồng bộ Dòng lệnh (State Management)](#5-quản-lý-pinia-store-đồng-bộ-dòng-lệnh-state-management)
6. [Hợp đồng JSON Schema Giáo trình Mã nguồn (API Reference)](#6-hợp-đồng-json-schema-giáo-trình-mã-nguồn-api-reference)
7. [Quyết định Kiến trúc & Bản đồ Ánh xạ Tương tác (ADR)](#7-quyết-định-kiến-trúc--bản-đồ-ánh-xạ-tương-tác-adr)
8. [Kế hoạch triển khai & Tiêu chí nghiệm thu (DoD)](#8-kế-hoạch-triển-khai--tiêu-chí-nghiệm-thu-dod)

---

## 1. MỤC TIÊU NGHIỆP VỤ & SỰ ĐỒNG BỘ SƯ PHẠM (PRD)

### 1.1. Tầm nhìn EdTech: Xóa nhòa khoảng cách giữa hoạt ảnh và lập trình
Nhiều sinh viên khi xem các công cụ trực quan hóa giải thuật thường chỉ thấy các cột màu sắc nhảy múa một cách vô nghĩa và gặp rất nhiều khó khăn để liên tưởng những chuyển động đó khớp với dòng lệnh thực tế nào trong giáo trình.

**Pseudocode Sync & Watch Panel** thiết lập cầu nối thời gian thực:
*   **Highlight dòng lệnh song hành:** Khi giải thuật chạy trên Canvas, dòng lệnh chịu trách nhiệm biến đổi dữ liệu đó tại Code Panel sẽ phát sáng lập tức (Ví dụ: khi hoán vị 2 cột thì dòng `swap(arr[j], arr[j+1])` sẽ sáng rực).
*   **Đồng bộ Đa ngôn ngữ (Multilingual Syntax Support):** Cho phép học sinh lựa chọn hiển thị mã nguồn theo ngôn ngữ lập trình yêu thích của mình: **C++**, **Java**, **Python**, hoặc **JavaScript**. Quá trình highlight dòng lệnh vẫn đồng bộ hoàn hảo không thay đổi.
*   **Hộp theo dõi biến động (Variable Watch Panel):** Một bảng nhỏ hiển thị trực tiếp giá trị của các biến chỉ số chạy thời gian thực (Ví dụ: `i = 4`, `j = 2`, `temp = 20`, `pivot = 12`) ở từng khung hình cụ thể.
*   **Tương tác Ngược (Click-to-Snap):** Nhấp chuột trực tiếp vào dòng lệnh số 5 trong code, Canvas tự động nhảy nhanh (Snap) tới khung hình đầu tiên của bước giải thuật thực thi dòng lệnh số 5 đó.

---

## 2. KIẾN TRÚC ÁNH XẠ HAI CHIỀU & ĐA NGÔN NGỮ (TECHNICAL SPEC)

Động cơ hoạt ảnh `AnimationEngine` phát ra một sự kiện cập nhật chỉ số khung hình `currentFrameIndex` khi tiến trình thay đổi. Hệ thống điều phối mã giả sẽ nhận thông tin này, ánh xạ chéo sang chỉ số dòng lệnh và trạng thái các biến chỉ số chạy tương ứng.

### Sơ đồ luồng hoạt động
```
                    [useAnimationStore] (currentFrameIndex = 12)
                             |
                             v
               Đọc FrameDTO tại index 12 trong danh sách
        +--------------------+--------------------+
        |                                         |
        v Đọc chỉ số dòng lệnh                    v Đọc trạng thái biến
  [frame.lineIndex = 4]                     [frame.variables = {i:2, j:3}]
        |                                         |
        v Gọi usePseudocodeStore                  v Gọi useWatchStore
[Highlight dòng 4 trên Code Panel]        [Cập nhật bảng giá trị i, j trực quan]
```

---

## 3. HIỆN THỰC HÓA BỘ PHÂN GIẢI DÒNG LỆNH & BIẾN ĐỘNG (CORE LOGIC)

### 3.1. Phân giải Dòng lệnh theo cấu trúc Đa Ngôn ngữ
Mỗi thuật toán lưu trữ tài liệu mã nguồn cho nhiều ngôn ngữ lập trình khác nhau dưới dạng danh sách các dòng lệnh. Mỗi dòng lệnh có một ID logic chuẩn (`logicalId`) độc lập với số dòng vật lý cụ thể để đồng bộ highlight chéo ngôn ngữ:

```typescript
export interface CodeLine {
  lineNumber: number;  // Số dòng vật lý của ngôn ngữ cụ thể (1-indexed)
  text: string;        // Nội dung dòng mã nguồn
  logicalId: string;   // Định danh dòng logic toàn cục (ví dụ: "COMPARE_STEP", "SWAP_STEP")
}

export interface LanguageCode {
  language: 'cpp' | 'java' | 'python' | 'javascript';
  lines: CodeLine[];
}
```

Khi Frame hiện tại báo dòng logic đang thực thi là `"SWAP_STEP"`:
*   Nếu người học chọn tab **C++**: Hệ thống tìm dòng có `logicalId === "SWAP_STEP"` trong mảng C++ (Dòng 8: `swap(arr[j], arr[j+1]);`) và sáng lên.
*   Nếu người học chọn tab **Python**: Hệ thống tìm dòng tương ứng trong mảng Python (Dòng 6: `arr[j], arr[j+1] = arr[j+1], arr[j]`) và sáng lên.

---

## 4. THIẾT KẾ BẢNG MÃ NGUỒN GLASSMORPHISM & WATCH PANEL (UI/UX)

### 4.1. Thiết kế Giao diện Phân cực (Split Screen Layout)
Màn hình được phân bổ làm 2 khu vực chính:
*   **Bên trái (70%):** Màn hình Canvas vẽ hoạt ảnh trực quan và thanh điều khiển tiến trình.
*   **Bên phải (30%):** Bảng Code Panel Slate đậm tích hợp kính mờ bao bọc cụm tab chọn ngôn ngữ và bảng danh sách dòng lệnh. Phía chân Code Panel đặt bảng **Watch Panel** màu Slate thẫm bo góc tròn mượt mà.

### 4.2. CSS Highlight & Hiệu ứng Chuyển dịch Mượt mà
Dòng lệnh đang thực thi được khoác lên một hiệu ứng phát sáng mờ ảo bằng CSS Transitions để tránh giật mắt khi dòng sáng nhảy liên tục:
```css
.code-line-item {
  display: flex;
  padding: 4px 12px;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 13px;
  color: #94A3B8; /* Slate 400 */
  border-left: 3px solid transparent;
  transition: all 0.2s ease-in-out;
}

/* Hiệu ứng Phát sáng dòng active */
.code-line-item.active-execution-line {
  background: rgba(16, 185, 129, 0.12); /* Xanh lá nhạt */
  color: #10B981; /* Emerald Neon */
  border-left-color: #10B981; /* Vạch định vị Emerald */
  text-shadow: 0 0 8px rgba(16, 185, 129, 0.4);
}
```

---

## 5. QUẢN LÝ PINIA STORE ĐỒNG BỘ DÒNG LỆNH (STATE MANAGEMENT)

Xây dựng bộ quản lý Pinia Setup Store `usePseudocodeStore.ts` đồng bộ hai chiều dòng mã lệnh:

```typescript
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAnimationStore } from './useAnimationStore';

export const usePseudocodeStore = defineStore('pseudocode', () => {
  const animStore = useAnimationStore();

  // State
  const selectedLanguage = ref<'cpp' | 'java' | 'python' | 'javascript'>('cpp');
  const codeLanguages = ref<LanguageCode[]>([]);

  // Getter: Lấy danh sách dòng mã thuộc ngôn ngữ đang chọn
  const activeCodeLines = computed(() => {
    const matched = codeLanguages.value.find(l => l.language === selectedLanguage.value);
    return matched ? matched.lines : [];
  });

  // Getter: Lấy dòng vật lý hiện tại cần highlight sáng lên
  const activePhysicalLineNumber = computed(() => {
    const currentFrame = animStore.activeFrame;
    if (!currentFrame) return null;
    
    // Tìm dòng vật lý khớp với logicalId nhận từ Animation Frame
    const matchedLine = activeCodeLines.value.find(
      l => l.logicalId === currentFrame.activeLogicalLineId
    );
    return matchedLine ? matchedLine.lineNumber : null;
  });

  return { selectedLanguage, codeLanguages, activeCodeLines, activePhysicalLineNumber };
});
```

---

## 6. HỢP ĐỒNG JSON SCHEMA GIÁO TRÌNH MÃ NGUỒN (API REFERENCE)

Khi nạp bài học, kịch bản bài học chứa cấu trúc mã nguồn đa ngôn ngữ tương ứng được nạp kèm qua API.

### Cấu trúc JSON API Response kịch bản mã nguồn:
```json
{
  "algorithmId": "bubble-sort",
  "languages": [
    {
      "language": "cpp",
      "lines": [
        { "lineNumber": 1, "text": "void bubbleSort(int arr[], int n) {", "logicalId": "FUNC_DECL" },
        { "lineNumber": 2, "text": "  for (int i = 0; i < n-1; i++) {", "logicalId": "OUTER_LOOP" },
        { "lineNumber": 3, "text": "    for (int j = 0; j < n-i-1; j++) {", "logicalId": "INNER_LOOP" },
        { "lineNumber": 4, "text": "      if (arr[j] > arr[j+1]) {", "logicalId": "COMPARE_STEP" },
        { "lineNumber": 5, "text": "        swap(arr[j], arr[j+1]);", "logicalId": "SWAP_STEP" }
      ]
    }
  ]
}
```

---

## 7. QUYẾT ĐỊNH KIẾN TRÚC & BẢN ĐỒ ÁNH XẠ TƯƠNG TÁC (ADR)

### ADR-07: Bidirectional Code-to-Canvas Mapping

*   **Bối cảnh:** Các ứng dụng trực quan hóa thông thường chỉ chạy một chiều (Canvas di chuyển kéo dòng code sáng theo). Người học ôn thi muốn nhảy nhanh tới dòng lệnh Swap để xem Canvas hoán vị như thế nào thì buộc phải kéo thanh Slider mò mẫm rất mất thời gian.
*   **Quyết định:** Áp dụng cơ chế **Ánh xạ Tương tác Hai chiều (Bidirectional Mapping)**. 
    *   Mỗi dòng mã hiển thị trên giao diện có thể click chuột được (`cursor: pointer`).
    *   Khi người dùng click vào dòng lệnh có `logicalId === "SWAP_STEP"`, hệ thống tự động quét tìm trong mảng Animation Frames và nhảy nhanh (Snap) tới khung hình đầu tiên có chứa lệnh thực thi tương ứng.
*   **Kết quả:** Học sinh cực kỳ thích thú, có thể học ngược hoặc học xuôi, nắm bắt bản chất dòng code tức thì.

---

## 8. KẾ HOẠCH TRIỂN KHAI & TIÊU CHÍ NGHIỆM THU (DoD)

### 8.1. Lộ trình Triển khai
1.  **Sprint A: Thiết kế UI Code Panel & Tab Chọn (Ngày 1-2):** Xây dựng component Split Screen bên phải chứa danh sách dòng mã, thiết lập tab chọn đa ngôn ngữ mượt mà.
2.  **Sprint B: Highlight Đồng bộ & Watch Panel (Ngày 3-5):** Hiện thực hóa ánh xạ chéo `logicalId`, viết bảng danh sách theo dõi biến số động và lập trình cơ chế nhấp dòng code nhảy Canvas.

### 8.2. Tiêu chí nghiệm thu (DoD)
*   Chuyển đổi các tab ngôn ngữ C++/Java/Python lập tức cập nhật cú pháp tương ứng, dòng highlight vẫn sáng chuẩn xác không lệch bước.
*   Watch Panel cập nhật chính xác các số chỉ số biến chạy theo từng frame, không bị gián đoạn hay trễ bước.
*   Nhấp chuột vào dòng lệnh đang highlight bất kỳ thực thi tua Canvas tới khung hình đích chuẩn xác.
