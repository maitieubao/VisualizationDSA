/**
 * MonacoLineSyncerCoordinator — Synchronizes Monaco Editor line highlighting
 * with VCR playback steps. Uses deltaDecorations for GC-safe decoration management.
 */

export interface MonacoDecorationRange {
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
}

export interface MonacoDecorationOptions {
  isWholeLine: boolean;
  className: string;
  marginClassName: string;
}

export interface MonacoDecoration {
  range: MonacoDecorationRange;
  options: MonacoDecorationOptions;
}

export interface MonacoEditorInstance {
  revealLineInCenter(lineNumber: number, scrollType: number): void;
  deltaDecorations(oldDecorations: string[], newDecorations: MonacoDecoration[]): string[];
}

export class MonacoLineSyncerCoordinator {
  private activeDecorationIds: string[] = [];

  public syncCodeLine(editor: MonacoEditorInstance | null, lineNumber: number): void {
    if (!editor) return;
    if (lineNumber < 1) return;

    editor.revealLineInCenter(lineNumber, 0);

    const newDecorations: MonacoDecoration[] = [
      {
        range: {
          startLineNumber: lineNumber,
          startColumn: 1,
          endLineNumber: lineNumber,
          endColumn: 1,
        },
        options: {
          isWholeLine: true,
          className: 'monaco-vcr-active-line-glow',
          marginClassName: 'monaco-vcr-active-line-margin',
        },
      },
    ];

    this.activeDecorationIds = editor.deltaDecorations(
      this.activeDecorationIds,
      newDecorations,
    );
  }

  public clearDecorations(editor: MonacoEditorInstance | null): void {
    if (editor && this.activeDecorationIds.length > 0) {
      editor.deltaDecorations(this.activeDecorationIds, []);
      this.activeDecorationIds = [];
    }
  }

  public getActiveDecorationCount(): number {
    return this.activeDecorationIds.length;
  }
}
