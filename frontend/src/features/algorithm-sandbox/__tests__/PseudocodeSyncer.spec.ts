import { describe, it, expect, vi } from 'vitest';
import { PseudocodeSyncer, type MonacoEditorForHighlight } from '../engine/PseudocodeSyncer';
import { CompilerStepExecutor } from '../../../core/CompilerStepExecutor';

// SV-022: getLineForStep/getFirstStepForLine/codeSnippet là dead API chỉ test dùng —
// đã bị xóa khỏi PseudocodeSyncer. Contract còn lại: static highlightMonacoLine.

describe('SV-016 (P2): PseudocodeSyncer.highlightMonacoLine', () => {
  it('highlightMonacoLine trả về decoration id từ deltaDecorations', () => {
    const editor: MonacoEditorForHighlight = {
      revealLineInCenter: vi.fn(),
      deltaDecorations: vi.fn(() => ['monaco-dec-7']),
    };

    const result = PseudocodeSyncer.highlightMonacoLine(editor, 7, ['dec-old']);

    expect(result).toEqual(['monaco-dec-7']);
    expect(editor.revealLineInCenter).toHaveBeenCalledWith(7, 0);
    expect(editor.deltaDecorations).toHaveBeenCalledWith(
      ['dec-old'],
      [
        expect.objectContaining({
          range: expect.objectContaining({ startLineNumber: 7, endLineNumber: 7 }),
          options: expect.objectContaining({ isWholeLine: true, className: 'monaco-pseudocode-active-line-glow' }),
        }),
      ],
    );
  });

  it('highlightMonacoLine với editor null → trả về decorations cũ (không crash)', () => {
    const result = PseudocodeSyncer.highlightMonacoLine(
      null as unknown as MonacoEditorForHighlight,
      3,
      ['dec-old']
    );
    expect(result).toEqual(['dec-old']);
  });

  it('highlightMonacoLine: line mới thay thế decoration cũ (previousDecorations truyền nguyên vẹn)', () => {
    const editor: MonacoEditorForHighlight = {
      revealLineInCenter: vi.fn(),
      deltaDecorations: vi.fn((old: string[]) => [...old, 'monaco-dec-9']),
    };
    const result = PseudocodeSyncer.highlightMonacoLine(editor, 9, ['dec-a', 'dec-b']);
    expect(editor.deltaDecorations).toHaveBeenCalledWith(['dec-a', 'dec-b'], expect.any(Array));
    expect(result).toEqual(['dec-a', 'dec-b', 'monaco-dec-9']);
  });
});

describe('CompilerStepExecutor.generateStepToLineMapping Unit Tests', () => {
  it('Should generate clean StepToLineMapping from frames and sourceCode', () => {
    const sourceCode = `let a = 1;\nlet b = 2;\nreturn a + b;`;
    const frames = [
      { stepIndex: 0, lineNumber: 1, canvasStateSnapshot: { array: [] }, description: '' },
      { stepIndex: 1, lineNumber: 3, canvasStateSnapshot: { array: [] }, description: '' }
    ];
    const mappings = CompilerStepExecutor.generateStepToLineMapping(sourceCode, frames);
    expect(mappings.length).toBe(2);
    expect(mappings[0]).toEqual({
      stepIndex: 0,
      lineNumber: 1,
      codeSnippet: 'let a = 1;'
    });
    expect(mappings[1]).toEqual({
      stepIndex: 1,
      lineNumber: 3,
      codeSnippet: 'return a + b;'
    });
  });
});
