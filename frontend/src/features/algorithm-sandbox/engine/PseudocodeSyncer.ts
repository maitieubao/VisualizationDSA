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
}

export class PseudocodeSyncer {
  private mappings: LineMapping[] = [];

  constructor(mappings: LineMapping[]) {
    this.mappings = mappings;
  }

  // SV-022: getLineForStep/getFirstStepForLine/codeSnippet đã bị xóa — dead API chỉ
  // được test dùng, production (AlgoPlaygroundWorkspace, MonacoLineSyncerCoordinator)
  // chỉ gọi static highlightMonacoLine.

  public static highlightMonacoLine(
    editorInstance: MonacoEditorForHighlight,
    lineNumber: number,
    previousDecorations: string[]
  ): string[] {
    if (!editorInstance) return previousDecorations;

    editorInstance.revealLineInCenter(lineNumber, 0); // cuộn dòng active vào giữa editor

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
          className: 'monaco-pseudocode-active-line-glow', // CSS glow toàn dòng
          marginClassName: 'monaco-pseudocode-gutter-decorator'
        }
      }
    ];

    return editorInstance.deltaDecorations(previousDecorations, newDecorations);
  }
}
