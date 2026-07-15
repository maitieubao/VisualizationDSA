# 🗄️ State Management - usePseudocodeStore (Pinia Vue 3)

Tài liệu này đặc tả chi tiết mã nguồn TypeScript của Pinia Setup Store **usePseudocodeStore** chịu trách nhiệm lưu trữ cấu trúc mã nguồn giải thuật đa ngôn ngữ, theo dõi ngôn ngữ đang chọn, tính toán dòng vật lý cần highlight và nạp danh sách biến Watch Panel tương tác.

---

## 1. Cấu trúc Mã nguồn Store (`usePseudocodeStore.ts`)

Mã nguồn được tổ chức theo cấu trúc setup store, bảo đảm sự tương tác mượt mà và an toàn về mặt dữ liệu khi người học chuyển đổi ngôn ngữ hoặc tua ngược thời gian.

```typescript
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAnimationStore } from './useAnimationStore';

// ==========================================
// ĐỊNH NGHĨA KIỂU DỮ LIỆU MÃ GIẢ
// ==========================================

export interface CodeLine {
  lineNumber: number;  // Số dòng vật lý cụ thể (1, 2, 3...)
  text: string;        // Nội dung dòng lệnh
  logicalId: string;   // Mã dòng logic (ví dụ: "COMPARE_STEP")
}

export interface LanguageCode {
  language: 'cpp' | 'java' | 'python' | 'javascript';
  lines: CodeLine[];
}

export const usePseudocodeStore = defineStore('pseudocode', () => {
  const animStore = useAnimationStore();

  // ==========================================
  // STATE (Trạng thái)
  // ==========================================
  const selectedLanguage = ref<'cpp' | 'java' | 'python' | 'javascript'>('cpp');
  const codeLanguages = ref<LanguageCode[]>([]);

  // ==========================================
  // GETTERS (Bộ lọc tính toán dữ liệu)
  // ==========================================

  /**
   * Trích xuất danh sách dòng mã của ngôn ngữ lập trình hiện hành
   */
  const activeCodeLines = computed<CodeLine[]>(() => {
    const matched = codeLanguages.value.find(l => l.language === selectedLanguage.value);
    return matched ? matched.lines : [];
  });

  /**
   * Tính toán số dòng vật lý cụ thể (lineNumber) cần highlight phát sáng
   */
  const activePhysicalLineNumber = computed<number | null>(() => {
    const currentFrame = animStore.activeFrame; // Lấy khung hình hiện tại từ Animation Engine
    if (!currentFrame) return null;

    // Khớp mã logic logicalId nhận từ frame hoạt ảnh với mảng dòng code của ngôn ngữ hiện tại
    const matchedLine = activeCodeLines.value.find(
      l => l.logicalId === currentFrame.activeLogicalLineId
    );
    
    return matchedLine ? matchedLine.lineNumber : null;
  });

  /**
   * Tính toán danh sách các biến động cần hiển thị lên Watch Panel
   */
  const watchVariablesList = computed<Array<{ name: string; value: string | number }>>(() => {
    const currentFrame = animStore.activeFrame;
    if (!currentFrame || !currentFrame.variables) return [];

    // Chuyển đổi bản ghi Record sang định dạng mảng để v-for hiển thị
    return Object.entries(currentFrame.variables).map(([name, value]) => ({
      name,
      value: typeof value === 'number' && !Number.isInteger(value)
        ? Number(value.toFixed(2)) // Định dạng làm tròn số thập phân
        : value
    }));
  });

  // ==========================================
  // ACTIONS (Hành động điều khiển)
  // ==========================================

  /**
   * Thay đổi ngôn ngữ lập trình hiển thị (Ví dụ từ C++ chuyển sang Python)
   */
  function changeLanguage(newLang: 'cpp' | 'java' | 'python' | 'javascript') {
    selectedLanguage.value = newLang;
  }

  /**
   * Thiết lập nạp kịch bản mã nguồn mới từ tệp JSON giải thuật
   */
  function loadPseudocodeScript(languages: LanguageCode[]) {
    codeLanguages.value = languages;
  }

  /**
   * Tương tác ngược (Click-to-Snap): Nhảy nhanh Canvas tới dòng lệnh được chọn
   */
  function snapToLogicalLine(logicalId: string) {
    const targetIdx = animStore.frames.findIndex(
      f => f.activeLogicalLineId === logicalId
    );

    if (targetIdx !== -1) {
      animStore.goToFrame(targetIdx);
      animStore.pause(); // Tạm dừng phát tự động để học sinh dễ dàng phân tích dữ liệu tĩnh
    }
  }

  /**
   * Giải phóng bộ nhớ khi chuyển bài học
   */
  function resetStore() {
    selectedLanguage.value = 'cpp';
    codeLanguages.value = [];
  }

  return {
    // States
    selectedLanguage,
    codeLanguages,
    
    // Getters
    activeCodeLines,
    activePhysicalLineNumber,
    watchVariablesList,
    
    // Actions
    changeLanguage,
    loadPseudocodeScript,
    snapToLogicalLine,
    resetStore
  };
});
```

---

## 2. Ưu điểm nổi bật của cấu trúc Getters Phản ứng Động

Bằng cách sử dụng thuộc tính `computed` liên kết trực tiếp với `animStore.activeFrame`:
*   **Zero Delay (Không độ trễ):** Bất cứ khi nào thanh tua Slider di động hay Canvas thay đổi khung hình, highlight dòng và bảng biến Watch Panel cập nhật tức khắc trong cùng một chu kỳ vẽ của Vue 3.
*   **Tránh bất đồng bộ dữ liệu (Single Source of Truth):** Tránh được lỗi hiển thị lệch pha giữa hoạt ảnh vẽ đồ họa và dòng chữ mã giả chạy kèm.
