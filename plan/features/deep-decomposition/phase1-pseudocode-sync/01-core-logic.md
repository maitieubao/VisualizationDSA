# 🧠 Pseudocode Sync & Click-to-Snap Reverse Lookup Engine (TypeScript)

Tài liệu này đặc tả chi tiết mã nguồn TypeScript của bộ máy tính toán đồng bộ dòng mã giả đa ngôn ngữ, trích xuất biến số chạy động và giải thuật tương tác ngược Click-to-Snap định vị khung hình hoạt ảnh.

---

## 1. Bộ máy Đồng bộ dòng Mã giả & Định vị ngược (TypeScript Class)

Lớp `PseudocodeSyncEngine` đóng vai trò là hạt nhân điều phối việc tìm dòng highlight vật lý chéo ngôn ngữ và định vị khung hình tương thích khi click dòng mã:

```typescript
export interface CodeLine {
  lineNumber: number;  // Số dòng vật lý của ngôn ngữ cụ thể (1-indexed)
  text: string;        // Nội dung dòng mã nguồn
  logicalId: string;   // Định danh dòng logic toàn cục (ví dụ: "SWAP_STEP")
}

export interface LanguageCode {
  language: 'cpp' | 'java' | 'python' | 'javascript';
  lines: CodeLine[];
}

export interface AnimationFrameDTO {
  frameIndex: number;
  activeLogicalLineId: string; // Tương đương logicalId của dòng code
  variables: Record<string, string | number>; // Trạng thái các biến chỉ số chạy
  [key: string]: any;
}

export class PseudocodeSyncEngine {
  /**
   * 1. Ánh xạ dòng Logic sang dòng Vật lý cụ thể của ngôn ngữ hiện tại
   */
  public static getPhysicalLineNumber(
    logicalLineId: string,
    language: string,
    codeLanguages: LanguageCode[]
  ): number | null {
    const matchedLanguage = codeLanguages.find(lang => lang.language === language);
    if (!matchedLanguage) return null;

    const matchedLine = matchedLanguage.lines.find(line => line.logicalId === logicalLineId);
    return matchedLine ? matchedLine.lineNumber : null;
  }

  /**
   * 2. Giải thuật Tương tác Ngược Click-to-Snap:
   * Tìm khung hình (Frame Index) đầu tiên thực thi dòng mã logic được click chọn.
   */
  public static findFirstFrameIndexForLogicalLine(
    logicalLineId: string,
    frames: AnimationFrameDTO[]
  ): number {
    return frames.findIndex(frame => frame.activeLogicalLineId === logicalLineId);
  }

  /**
   * 3. Bộ chuyển đổi cấu trúc biến của Frame sang danh sách hiển thị Watch Panel
   */
  public static transformVariablesForWatch(
    variables: Record<string, string | number>
  ): Array<{ name: string; value: string | number }> {
    return Object.entries(variables).map(([name, value]) => ({
      name,
      value: typeof value === 'number' && !Number.isInteger(value) 
        ? Number(value.toFixed(2)) // Làm tròn số thập phân cho đẹp
        : value
    }));
  }
}
```

---

## 2. Kiểm thử Tích hợp Đơn vị (Unit Test Concept)

Để đảm bảo bộ máy đồng bộ vận hành chính xác tuyệt đối mà không bị lệch dòng khi nạp giáo trình mã nguồn mới, chúng ta xây dựng mã nguồn kiểm thử đơn vị cơ bản:

```typescript
import { describe, it, expect } from 'vitest';
import { PseudocodeSyncEngine, LanguageCode, AnimationFrameDTO } from './PseudocodeSyncEngine';

const mockCodeLanguages: LanguageCode[] = [
  {
    language: 'cpp',
    lines: [
      { lineNumber: 1, text: 'for(int i=0; i<n; i++)', logicalId: 'OUTER_LOOP' },
      { lineNumber: 2, text: '  swap(arr[j], arr[j+1]);', logicalId: 'SWAP_STEP' }
    ]
  },
  {
    language: 'python',
    lines: [
      { lineNumber: 1, text: 'for i in range(n):', logicalId: 'OUTER_LOOP' },
      { lineNumber: 2, text: '  arr[j], arr[j+1] = arr[j+1], arr[j]', logicalId: 'SWAP_STEP' }
    ]
  }
];

const mockFrames: AnimationFrameDTO[] = [
  { frameIndex: 0, activeLogicalLineId: 'OUTER_LOOP', variables: { i: 0 } },
  { frameIndex: 1, activeLogicalLineId: 'SWAP_STEP', variables: { i: 0, j: 0 } },
  { frameIndex: 2, activeLogicalLineId: 'SWAP_STEP', variables: { i: 0, j: 1 } }
];

describe('PseudocodeSyncEngine Unit Tests', () => {
  it('Should correctly map logicalId to physical lines in C++', () => {
    const cppLine = PseudocodeSyncEngine.getPhysicalLineNumber('SWAP_STEP', 'cpp', mockCodeLanguages);
    expect(cppLine).toBe(2);
  });

  it('Should correctly map logicalId to physical lines in Python', () => {
    const pythonLine = PseudocodeSyncEngine.getPhysicalLineNumber('SWAP_STEP', 'python', mockCodeLanguages);
    expect(pythonLine).toBe(2);
  });

  it('Should find the first frame index (Click-to-Snap) for SWAP_STEP', () => {
    const targetFrame = PseudocodeSyncEngine.findFirstFrameIndexForLogicalLine('SWAP_STEP', mockFrames);
    expect(targetFrame).toBe(1); // Frame index 1 là dòng swap đầu tiên
  });
});
```
Mã nguồn kiểm thử tự động này giúp quy trình phát hành bài học mới (Algorithms JSON scripts) luôn ổn định và an toàn trước mọi lỗi cú pháp nhập liệu.
