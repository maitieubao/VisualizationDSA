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

  


  public getLineForStep(stepIndex: number): number | null {
    const found = this.mappings.find(m => m.stepIndex === stepIndex);
    return found ? found.lineNumber : null;
  }

  


  public getFirstStepForLine(lineNumber: number): number | null {
    const found = this.mappings.find(m => m.lineNumber === lineNumber);
    return found ? found.stepIndex : null;
  }

  


  public static highlightMonacoLine(
    editorInstance: MonacoEditorForHighlight,
    lineNumber: number,
    previousDecorations: string[]
  ): string[] {
    if (!editorInstance) return previousDecorations;

    
    editorInstance.revealLineInCenter(lineNumber, 0); 

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
          className: 'monaco-pseudocode-active-line-glow', 
          marginClassName: 'monaco-pseudocode-gutter-decorator'
        }
      }
    ];

    
    return editorInstance.deltaDecorations(previousDecorations, newDecorations);
  }
}
