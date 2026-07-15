# ⚙️ Technical Specification - Pseudocode Synchronization & Monaco Hooks (Sprint 3)

Tài liệu này đặc tả chi tiết mã nguồn TypeScript và cơ chế tích hợp đồng bộ hai chiều giữa bước giải thuật Canvas và số dòng code hiển thị trên Monaco Editor trong Sprint 3.

---

## 1. Trình Đồng Bộ Hai Chiều Code & Giải Thuật (PseudocodeSyncer TypeScript)

Lớp hạt nhân chịu trách nhiệm ánh xạ hai chiều giữa chỉ số bước hoạt ảnh giải thuật và số dòng code dòng lệnh đang thực thi:

```typescript
export interface LineMapping {
  stepIndex: number;
  lineNumber: number;
  codeSnippet: string;
}

export class PseudocodeSyncer {
  private mappings: LineMapping[] = [];

  constructor(mappings: LineMapping[]) {
    this.mappings = mappings;
  }

  /**
   * Truy vấn số dòng code ứng với chỉ số bước giải thuật K (Forward Lookup)
   */
  public getLineForStep(stepIndex: number): number | null {
    const found = this.mappings.find(m => m.stepIndex === stepIndex);
    return found ? found.lineNumber : null;
  }

  /**
   * Truy vấn bước giải thuật đầu tiên thực thi số dòng code L (Reverse Lookup - Seek Step)
   */
  public getFirstStepForLine(lineNumber: number): number | null {
    const found = this.mappings.find(m => m.lineNumber === lineNumber);
    return found ? found.stepIndex : null;
  }

  /**
   * Cập nhật lớp CSS bôi sáng dòng đang chạy trên Monaco Editor dưới 10ms
   */
  public static highlightMonacoLine(
    editorInstance: any,
    lineNumber: number,
    previousDecorations: string[]
  ): string[] {
    if (!editorInstance) return previousDecorations;

    // Cuộn dòng code về trung tâm mượt mà 60 FPS
    editorInstance.revealLineInCenter(lineNumber, 0); // 0 = ScrollType.Smooth

    const newDecorations = [
      {
        range: {
          startLineNumber: lineNumber,
          startColumn: 1,
          endLineNumber: lineNumber,
          endColumn: 1
        },
        options: {
          isWholeLine: true,
          className: 'monaco-pseudocode-active-line-glow', // Tên lớp CSS bọc Neon Amber viền trái
          marginClassName: 'monaco-pseudocode-gutter-decorator'
        }
      }
    ];

    // Cập nhật đè trang trí cũ
    return editorInstance.deltaDecorations(previousDecorations, newDecorations);
  }
}
```

---

## 2. Tương tác Nhấp chọn Dòng lệnh Nhảy Bước (Gutter Click Interceptor)

Để cho phép học viên tương tác nhấp dòng nhảy bước giải thuật, Monaco Editor được cài đặt sự kiện chặn click:

```typescript
export class MonacoGutterClickInterceptor {
  private editorInstance: any = null;
  private onLineClickCallback: (lineNumber: number) => void;

  constructor(editor: any, onLineClick: (lineNumber: number) => void) {
    this.editorInstance = editor;
    this.onLineClickCallback = onLineClick;
    this.setupListeners();
  }

  private setupListeners(): void {
    if (!this.editorInstance) return;

    // Lắng nghe sự kiện click chuột trên Monaco Editor
    this.editorInstance.onMouseDown((e: any) => {
      // e.target.type: 3 = Gutter (Lề trái số dòng)
      if (e.target.type === 3 || e.target.type === 4) {
        const lineNumber = e.target.position.lineNumber;
        this.onLineClickCallback(lineNumber);
      }
    });
  }

  public destroy(): void {
    this.editorInstance = null;
  }
}
```

---

## 3. Ca Kiểm Thử Tự Động Đồng Bộ Hai Chiều (Unit Test Specs)

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PseudocodeSyncer, LineMapping } from './PseudocodeSyncer';

describe('Sprint 3 Pseudocode Synchronization Unit Tests', () => {
  let syncer: PseudocodeSyncer;
  let mockMappings: LineMapping[];

  beforeEach(() => {
    mockMappings = [
      { stepIndex: 0, lineNumber: 5, codeSnippet: 'let pivot = arr[high]' },
      { stepIndex: 1, lineNumber: 8, codeSnippet: 'swap(arr, i, j)' },
      { stepIndex: 2, lineNumber: 12, codeSnippet: 'return i + 1' }
    ];
    syncer = new PseudocodeSyncer(mockMappings);
  });

  it('Should correctly find matching line number for current playback step index', () => {
    const line = syncer.getLineForStep(1);

    expect(line).toBe(8); // Bước 1 ứng với dòng 8 hoán vị
  });

  it('Should successfully seek to first algorithm step when clicking line number', () => {
    const step = syncer.getFirstStepForLine(12);

    expect(step).toBe(2); // Dòng 12 ứng với bước kết thúc 2
  });

  it('Should return null for non-existent step indices or line bounds', () => {
    const line = syncer.getLineForStep(99);
    expect(line).toBeNull();

    const step = syncer.getFirstStepForLine(99);
    expect(step).toBeNull();
  });
});
```
 Thiết kế bộ giải mã ánh xạ hai chiều bước giải thuật sang dòng code Monaco Editor và bộ đánh chặn nhấp chọn gutter lề dòng mang lại sự kiểm soát gỡ lỗi nhạy bén, khoa học hàng đầu cho sinh viên tự tin thực hành giải thuật.
