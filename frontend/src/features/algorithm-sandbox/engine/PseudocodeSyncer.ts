export interface MonacoEditorForHighlight {
  revealLineInCenter(lineNumber: number, scrollType: number): void;
  deltaDecorations(
    oldDecorations: string[],
    newDecorations: Array<{
      range: { startLineNumber: number; startColumn: number; endLineNumber: number; endColumn: number };
      options: { isWholeLine: boolean; className: string; marginClassName: string };
    }>
  ): string[];
}

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
    editorInstance: MonacoEditorForHighlight,
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
