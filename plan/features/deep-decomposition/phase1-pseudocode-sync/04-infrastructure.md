# ⚙️ Infrastructure & Automated Code Compiler Script (Phase 1)

Tài liệu này đặc tả chi tiết các giải pháp kỹ thuật hạ tầng tại Client/Server-side giúp tự động hóa khâu xử lý mã nguồn thô chứa nhãn định vị sang cấu trúc JSON kịch bản chuẩn mực.

---

## 1. Công cụ biên dịch mã nguồn tự động (Assets Pre-compiler Script)

Khi giáo viên soạn thảo các bài giảng thuật toán, việc gõ thủ công từng dòng mã kèm chỉ số `lineNumber` và `logicalId` vào file JSON rất dễ gầm lẫn và khó bảo trì. 

Chúng ta xây dựng một script hạ tầng (Node.js/TypeScript) giúp tự động phân tích tệp mã nguồn thô chứa thẻ ghi chú (comments) để biên dịch tự động ra JSON chuẩn.

### 1.1. Tệp mã nguồn C++ thô được soạn thảo (`bubble_sort.cpp`):
```cpp
void bubbleSort(int arr[], int n) { //#[FUNC_DECL]
  for (int i = 0; i < n-1; i++) { //#[OUTER_LOOP]
    for (int j = 0; j < n-i-1; j++) { // //#[INNER_LOOP]
      if (arr[j] > arr[j+1]) { //#[COMPARE_STEP]
        swap(arr[j], arr[j+1]); //#[SWAP_STEP]
      }
    }
  }
}
```

### 1.2. Kịch bản Script Trích xuất tự động (Pre-compiler Compiler):
```typescript
import * as fs from 'fs';
import * as path from 'path';

export interface CompiledLine {
  lineNumber: number;
  text: string;
  logicalId: string;
}

export class PseudocodeCompiler {
  /**
   * Biên dịch tệp mã nguồn thô chứa comment sang mảng JSON CompiledLine
   */
  public static compileRawFile(filePath: string): CompiledLine[] {
    const rawContent = fs.readFileSync(filePath, 'utf-8');
    const lines = rawContent.split(/\r?\n/);
    const compiledLines: CompiledLine[] = [];

    lines.forEach((lineText, index) => {
      const lineNumber = index + 1;
      
      // Biểu thức chính quy tìm thẻ ghi chú neo dòng //#[LOGICAL_ID]
      const markerRegex = /\/\/#\[([A-Z_]+)\]/;
      const match = lineText.match(markerRegex);

      if (match) {
        const logicalId = match[1];
        // Loại bỏ phần comment neo dòng để giữ lại mã nguồn sạch hiển thị cho học sinh
        const cleanText = lineText.replace(markerRegex, '').trimEnd();

        compiledLines.push({
          lineNumber,
          text: cleanText,
          logicalId
        });
      } else {
        // Dòng bình thường không chứa neo (không highlight)
        compiledLines.push({
          lineNumber,
          text: lineText.trimEnd(),
          logicalId: 'NO_ACTION'
        });
      }
    });

    return compiledLines;
  }
}
```

---

## 2. Lợi ích vượt trội của Thiết kế Biên dịch Hạ tầng

Bằng cách tích hợp bộ Compiler tự động vào quy trình đóng gói bài giảng (Build Pipeline):
*   **Tiết kiệm 90% thời gian:** Giáo viên chỉ cần viết code chuẩn như bình thường và đặt thêm thẻ comment `//#` ở cuối dòng, hệ thống tự động sinh tệp cấu hình JSON kề cực kỳ nhanh chóng.
*   **Bảo trì dễ dàng:** Khi cần sửa một lỗi chính tả trong mã nguồn C++ hay Python, giảng viên chỉ cần sửa trực tiếp trên file code thật của ngôn ngữ đó rồi chạy lại lệnh build compile, không phải lội vào hàng ngàn dòng file JSON để chỉnh tay thủ công.
*   **Tránh lệch dòng:** Compiler tự động gán nhãn `lineNumber` tăng dần, cam kết tuyệt đối không bao giờ xảy ra tình trạng lệch dòng hiển thị vật lý trên giao diện học viên.
