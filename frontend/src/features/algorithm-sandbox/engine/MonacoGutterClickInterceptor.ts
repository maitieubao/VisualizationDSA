import type * as monaco from 'monaco-editor';

interface MonacoEditorInstance {
  onMouseDown(cb: (e: monaco.editor.IEditorMouseEvent) => void): { dispose(): void };
}

export class MonacoGutterClickInterceptor {
  private editorInstance: MonacoEditorInstance | null = null;
  private onLineClickCallback: (lineNumber: number) => void;
  private mouseDownListener: { dispose(): void } | null = null;

  constructor(editor: MonacoEditorInstance, onLineClick: (lineNumber: number) => void) {
    this.editorInstance = editor;
    this.onLineClickCallback = onLineClick;
    this.setupListeners();
  }

  private setupListeners(): void {
    if (!this.editorInstance) return;

    this.mouseDownListener = this.editorInstance.onMouseDown((e: monaco.editor.IEditorMouseEvent) => {
      // SV-023: chỉ phản hồi chuột TRÁI — chuột phải/giữa không nhảy frame.
      // Real monaco IMouseEvent không có .button (dùng cờ leftButton); mock test
      // dùng DOM-style button (0 = trái, 2 = phải) → hỗ trợ cả hai, event vắng
      // mặt (mock cũ) vẫn coi là click trái.
      const mouseEvent = e.event as { leftButton?: boolean; button?: number } | undefined;
      if (mouseEvent) {
        const isLeftButton = mouseEvent.leftButton ?? (mouseEvent.button === 0);
        if (!isLeftButton) return;
      }

      if (e.target.type === 3 || e.target.type === 4) {
        const lineNumber = e.target.position?.lineNumber;
        if (lineNumber !== undefined) {
          this.onLineClickCallback(lineNumber);
        }
      }
    });
  }

  public destroy(): void {
    if (this.mouseDownListener) {
      this.mouseDownListener.dispose();
      this.mouseDownListener = null;
    }
    this.editorInstance = null;
  }
}
