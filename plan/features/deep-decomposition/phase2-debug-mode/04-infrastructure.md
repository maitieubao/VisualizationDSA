# ⚙️ Infrastructure & Monaco Breakpoint Listener (Phase 2)

Tài liệu này đặc tả chi tiết các giải pháp hạ tầng cài đặt sự kiện click lề Monaco Editor gán Breakpoint, dọn dẹp giải phóng bộ nhớ (Resource Cleanup) và cơ chế đóng gói cấu trúc Call Stack truyền tải an toàn.

---

## 1. Cơ chế Lắng nghe Nhấp lề Gutter Monaco Editor (Monaco Gutter Listener)

Để sinh viên có thể bật điểm dừng Breakpoint cực kỳ nhạy bén bằng nhấp chuột trái bên lề trái của trình soạn thảo Monaco, hệ thống liên kết sự kiện click của editor:

```typescript
import * as monaco from 'monaco-editor';
import { useLiveDebuggerStore } from '../stores/useLiveDebuggerStore';

export class MonacoDebuggerInfrastructure {
  private static activeEditor: monaco.editor.ICodeEditor | null = null;
  private static mouseDispose: monaco.IDisposable | null = null;

  /**
   * Đăng ký lắng nghe sự kiện chuột click lề Monaco
   */
  public static bindMonacoDebugger(editor: monaco.editor.ICodeEditor): void {
    this.activeEditor = editor;
    const debuggerStore = useLiveDebuggerStore();

    // Lắng nghe sự kiện click chuột trên khung lề (Gutter/Glyph margin)
    this.mouseDispose = editor.onMouseDown((e: monaco.editor.IEditorMouseEvent) => {
      const target = e.target;
      
      // Kiểm tra xem vị trí click chuột có phải là lề dòng code hay không
      if (target.type === monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN) {
        const lineNumber = target.position?.lineNumber;
        if (lineNumber) {
          // Bật tắt điểm dừng trong Pinia store
          debuggerStore.toggleBreakpoint(lineNumber);
          
          // Vẽ/Gỡ chấm tròn đỏ Neon tương ứng trên Monaco Gutter
          this.syncGutterDecoration(editor, lineNumber, debuggerStore.activeBreakpoints);
        }
      }
    });
  }

  /**
   * Giải phóng lắng nghe sự kiện tránh rò rỉ RAM (Resource Cleanup)
   */
  public static unbindMonacoDebugger(): void {
    if (this.mouseDispose) {
      this.mouseDispose.dispose();
      this.mouseDispose = null;
    }
    this.activeEditor = null;
  }

  private static syncGutterDecoration(
    editor: monaco.editor.ICodeEditor,
    lineNumber: number,
    activeBreakpoints: number[]
  ): void {
    // Gọi phương thức vẽ hoặc gỡ chấm tròn đỏ Neon qua deltaDecorations
  }
}
```

---

## 2. Giải pháp Hạn chế Độ sâu Đệ quy Tránh tràn Ngăn xếp (Stack Overflow Protection)

*   **Vấn đề:** Khi sinh viên viết các thuật toán đệ quy bị lỗi điều kiện dừng (ví dụ: `quickSort` đệ quy vô tận), bộ nhớ của trình duyệt sẽ bị quá tải tràn ngăn xếp (Stack Overflow) làm đứng hình trang web.
*   **Hạ tầng bảo vệ (Stack Overflow Guard):** 
    *   Trong quá trình giả lập đập nhịp gỡ lỗi, bộ máy `LiveCompilerDebugger` đo lường kích cỡ mảng `callStack` tại mỗi nhịp `yield`.
    *   Nếu độ sâu đệ quy vượt quá **500 cấp đệ quy lồng nhau**, hệ thống tự động ngắt cưỡng bức phiên chạy, báo lỗi `"STACK_OVERFLOW_EXCEEDED"` lên bảng Console để sinh viên sửa lại điều kiện dừng thuật toán, bảo vệ tab duyệt web an toàn tuyệt đối.
