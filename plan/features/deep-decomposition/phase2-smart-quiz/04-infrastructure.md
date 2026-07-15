# ⚙️ Infrastructure & Monaco Click Interceptor bindings (Phase 2)

Tài liệu này đặc tả chi tiết giải pháp kỹ thuật kết nối lắng nghe sự kiện click trực tiếp của Monaco Editor Line Click Interceptor và cơ chế Garbage Collection tháo dỡ các listener bảo vệ an toàn rò rỉ bộ nhớ RAM.

---

## 1. Monaco Editor Line Click Interceptor & Event Redirection

Khi câu hỏi dạng dự đoán dòng code thực thi tiếp theo (`MONACO_LINE_CLICK`) được kích hoạt, hệ thống cần tạm khóa tính năng soạn thảo thông thường của Monaco Editor, đồng thời biến toàn bộ các dòng code thành các nút bấm tương tác:

```typescript
import * as monaco from 'monaco-editor';

export class MonacoLineClickInterceptor {
  private editor: monaco.editor.IStandaloneCodeEditor;
  private clickCallback: (lineNumber: number) => void;
  private mouseMoveListener: monaco.IDisposable | null = null;
  private mouseUpListener: monaco.IDisposable | null = null;

  constructor(
    editor: monaco.editor.IStandaloneCodeEditor,
    onLineClick: (lineNumber: number) => void
  ) {
    this.editor = editor;
    this.clickCallback = onLineClick;
  }

  /**
   * Khởi động chế độ Click chọn dòng trắc nghiệm
   */
  public activateLineSelecting(): void {
    // 1. Chuyển con trỏ chuột sang Pointer chỉ hướng báo tương tác
    this.editor.updateOptions({
      readOnly: true,
      domReadOnly: true
    });

    // 2. Lắng nghe sự kiện click chuột trên editor
    this.mouseUpListener = this.editor.onMouseUp((e: monaco.editor.IEditorMouseEvent) => {
      const target = e.target;
      if (target && target.position) {
        const clickedLine = target.position.lineNumber;
        
        // Kích hoạt callback báo chỉ số dòng được chọn
        this.clickCallback(clickedLine);
      }
    });

    // 3. Hiệu ứng Hover tô nhẹ dòng code (Line highlighting decoration)
    this.mouseMoveListener = this.editor.onMouseMove((e: monaco.editor.IEditorMouseEvent) => {
      const target = e.target;
      if (target && target.position) {
        const hoveredLine = target.position.lineNumber;
        
        // Cập nhật decorations dòng hover mượt mà
        this.applyHoverDecoration(hoveredLine);
      }
    });
  }

  private currentDecorations: string[] = [];

  private applyHoverDecoration(lineNumber: number): void {
    this.currentDecorations = this.editor.deltaDecorations(this.currentDecorations, [
      {
        range: new monaco.Range(lineNumber, 1, lineNumber, 1),
        options: {
          isWholeLine: true,
          className: 'monaco-clickable-line-hover' // Lớp CSS phát sáng Cyan mờ
        }
      }
    ]);
  }

  /**
   * Hủy kích hoạt, trả lại tính năng chạy bình thường của Monaco
   */
  public deactivateLineSelecting(): void {
    if (this.mouseUpListener) {
      this.mouseUpListener.dispose();
      this.mouseUpListener = null;
    }
    if (this.mouseMoveListener) {
      this.mouseMoveListener.dispose();
      this.mouseMoveListener = null;
    }

    this.editor.deltaDecorations(this.currentDecorations, []);
    this.editor.updateOptions({
      readOnly: false,
      domReadOnly: false
    });
  }
}
```

---

## 2. Giải pháp tháo dỡ Event Listeners & GC Memory Leak Prevent

*   **Chống rò rỉ bộ nhớ Canvas SVG Click:**
    *   Tương tự như Monaco, các sự kiện click mảng/cây SVG sử dụng kỹ thuật Event Delegation lắng nghe duy nhất từ thẻ cha `<svg id="dsa-canvas-svg">` thông qua bộ máy `SVGTargetResolver`.
    *   Khi trắc nghiệm hoàn tất nộp bài hoặc bị đóng lại, trình dọn dẹp hạ tầng lập tức gỡ bỏ `removeEventListener` đăng ký click trên Canvas, trả lại 100% tài nguyên RAM cho trình duyệt và phục hồi tính năng kéo thả xoay của đồ thị.
