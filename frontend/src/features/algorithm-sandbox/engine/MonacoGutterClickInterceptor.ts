interface MonacoMouseEvent {
  target: {
    type: number;
    position?: { lineNumber: number };
  };
}

interface MonacoEditorInstance {
  onMouseDown(cb: (e: MonacoMouseEvent) => void): { dispose(): void };
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

    this.mouseDownListener = this.editorInstance.onMouseDown((e: MonacoMouseEvent) => {
      // e.target.type: 3 = Gutter (Lề trái số dòng), 4 = Gutter Margin
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
