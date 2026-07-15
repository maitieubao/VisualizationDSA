# 🛠 Technical Specification - Algorithmic Debugger (Phase 2)

Tài liệu này đặc tả chi tiết kiến trúc hạt nhân của bộ biến dịch cô-ru-tin JavaScript (Coroutine Generator Compiler), kỹ thuật tiêm từ khóa `yield` dừng dòng cú pháp AST và cơ chế đồng bộ hóa điểm dừng Breakpoint lề Monaco Editor.

---

## 1. Cơ chế Tiêm mã Generator yield qua Cây Cú pháp AST

Để hỗ trợ việc tạm ngắt luồng JavaScript đơn luồng của trình duyệt khi sinh viên gõ lệnh chạy, bộ dịch AST biến đổi toàn bộ mã nguồn thô sang dạng hàm Generator đặc biệt (`function*`):

```typescript
// 1. Mã nguồn thô của sinh viên gõ vào Monaco:
function bubbleSort(arr) {
  let temp = arr[0];
  arr[0] = arr[1];
}

// 2. Mã nguồn sau khi đi qua AST Instrumentation Engine được tiêm generator yield:
function* bubbleSort(arr) {
  yield { line: 2, arrayState: [...arr], variables: { temp: undefined }, callStack: ['bubbleSort'] };
  let temp = arr[0];
  yield { line: 3, arrayState: [...arr], variables: { temp }, callStack: ['bubbleSort'] };
  arr[0] = arr[1];
}
```

Bộ duyệt AST (`estraverse`) thực hiện các bước:
1.  Định vị tất cả các nút khai báo hàm `FunctionDeclaration` và chuyển đổi cờ `generator: true`.
2.  Duyệt qua tất cả các cấu trúc dòng thực thi `ExpressionStatement`, `VariableDeclaration` và tiêm thêm một nút `YieldExpression` kề sau để ghi nhận dòng code hiện tại và trạng thái biến ảo.

---

## 2. Đồng bộ Điểm dừng lề Monaco Editor (Gutter Breakpoint Sync)

Chấm đỏ Breakpoint trên lề Monaco Editor được quản lý thông qua API trang trí dòng chuyên nghiệp (Monaco Editor Glyphs/Decorations):

```typescript
import * as monaco from 'monaco-editor';

export class MonacoBreakpointManager {
  private editor: monaco.editor.ICodeEditor;
  private breakpointDecorations = new Map<number, string[]>(); // lineNumber -> decorationIds

  constructor(editor: monaco.editor.ICodeEditor) {
    this.editor = editor;
  }

  /**
   * Thiết lập hoặc gỡ bỏ một điểm dừng Breakpoint tại dòng cụ thể
   */
  public toggleBreakpoint(lineNumber: number): void {
    const existing = this.breakpointDecorations.get(lineNumber);

    if (existing) {
      // Gỡ bỏ trang trí cũ
      this.editor.deltaDecorations(existing, []);
      this.breakpointDecorations.delete(lineNumber);
    } else {
      // Thêm trang trí chấm tròn đỏ Neon mới phát sáng bên lề dòng code
      const newDecorationIds = this.editor.deltaDecorations([], [
        {
          range: new monaco.Range(lineNumber, 1, lineNumber, 1),
          options: {
            isWholeLine: false,
            glyphMarginClassName: 'monaco-breakpoint-margin-icon', // CSS chấm đỏ Neon
            glyphMarginHoverMessage: { value: 'Nhấp để gỡ bỏ điểm dừng (Breakpoint)' }
          }
        }
      ]);
      this.breakpointDecorations.set(lineNumber, newDecorationIds);
    }
  }

  public getActiveBreakpoints(): number[] {
    return Array.from(this.breakpointDecorations.keys());
  }
}
```
 Động cơ biên dịch Coroutine yield kết hợp với bộ quản lý điểm dừng Monaco Breakpoints bảo đảm trải nghiệm gỡ lỗi chuyên nghiệp, mượt mà chuẩn xác từng dòng lệnh đồng hành cùng Canvas vẽ.
