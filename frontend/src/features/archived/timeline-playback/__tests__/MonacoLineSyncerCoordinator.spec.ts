import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MonacoLineSyncerCoordinator } from '../engine/MonacoLineSyncerCoordinator';
import type { MonacoEditorInstance } from '../engine/MonacoLineSyncerCoordinator';

describe('MonacoLineSyncerCoordinator', () => {
  let coordinator: MonacoLineSyncerCoordinator;
  let mockEditor: MonacoEditorInstance;

  beforeEach(() => {
    coordinator = new MonacoLineSyncerCoordinator();
    mockEditor = {
      revealLineInCenter: vi.fn(),
      deltaDecorations: vi.fn().mockReturnValue(['decoration-1']),
    };
  });

  // === syncCodeLine ===
  it('should call revealLineInCenter with correct line number', () => {
    coordinator.syncCodeLine(mockEditor, 10);
    expect(mockEditor.revealLineInCenter).toHaveBeenCalledWith(10, 0);
  });

  it('should call deltaDecorations with correct decoration config', () => {
    coordinator.syncCodeLine(mockEditor, 5);
    expect(mockEditor.deltaDecorations).toHaveBeenCalledWith(
      [],
      [
        {
          range: {
            startLineNumber: 5,
            startColumn: 1,
            endLineNumber: 5,
            endColumn: 1,
          },
          options: {
            isWholeLine: true,
            className: 'monaco-vcr-active-line-glow',
            marginClassName: 'monaco-vcr-active-line-margin',
          },
        },
      ],
    );
  });

  it('should update decoration IDs after sync', () => {
    coordinator.syncCodeLine(mockEditor, 1);
    expect(coordinator.getActiveDecorationCount()).toBe(1);
  });

  it('should pass previous decoration IDs to deltaDecorations on second call', () => {
    coordinator.syncCodeLine(mockEditor, 1);
    (mockEditor.deltaDecorations as ReturnType<typeof vi.fn>).mockReturnValue(['decoration-2']);
    coordinator.syncCodeLine(mockEditor, 5);

    expect(mockEditor.deltaDecorations).toHaveBeenLastCalledWith(
      ['decoration-1'],
      expect.any(Array),
    );
  });

  it('should not call editor methods when editor is null', () => {
    coordinator.syncCodeLine(null, 10);
    expect(mockEditor.revealLineInCenter).not.toHaveBeenCalled();
  });

  it('should not call editor methods for line number < 1', () => {
    coordinator.syncCodeLine(mockEditor, 0);
    expect(mockEditor.revealLineInCenter).not.toHaveBeenCalled();
  });

  it('should not call editor for negative line number', () => {
    coordinator.syncCodeLine(mockEditor, -5);
    expect(mockEditor.revealLineInCenter).not.toHaveBeenCalled();
  });

  // === clearDecorations ===
  it('should clear decorations when editor has active decorations', () => {
    coordinator.syncCodeLine(mockEditor, 1);
    coordinator.clearDecorations(mockEditor);
    expect(mockEditor.deltaDecorations).toHaveBeenLastCalledWith(['decoration-1'], []);
    expect(coordinator.getActiveDecorationCount()).toBe(0);
  });

  it('should not call deltaDecorations when no active decorations', () => {
    (mockEditor.deltaDecorations as ReturnType<typeof vi.fn>).mockClear();
    coordinator.clearDecorations(mockEditor);
    expect(mockEditor.deltaDecorations).not.toHaveBeenCalled();
  });

  it('should not call deltaDecorations when editor is null', () => {
    coordinator.syncCodeLine(mockEditor, 1);
    (mockEditor.deltaDecorations as ReturnType<typeof vi.fn>).mockClear();
    coordinator.clearDecorations(null);
    expect(mockEditor.deltaDecorations).not.toHaveBeenCalled();
  });

  // === getActiveDecorationCount ===
  it('should start with 0 active decorations', () => {
    expect(coordinator.getActiveDecorationCount()).toBe(0);
  });

  it('should track decoration count across multiple syncs', () => {
    (mockEditor.deltaDecorations as ReturnType<typeof vi.fn>).mockReturnValue(['d1', 'd2']);
    coordinator.syncCodeLine(mockEditor, 1);
    expect(coordinator.getActiveDecorationCount()).toBe(2);
  });

  // === Multiple sequential syncs ===
  it('should replace old decorations on sequential syncs', () => {
    (mockEditor.deltaDecorations as ReturnType<typeof vi.fn>).mockReturnValueOnce(['old-d1']);
    coordinator.syncCodeLine(mockEditor, 1);

    (mockEditor.deltaDecorations as ReturnType<typeof vi.fn>).mockReturnValueOnce(['new-d1']);
    coordinator.syncCodeLine(mockEditor, 10);

    expect(mockEditor.deltaDecorations).toHaveBeenLastCalledWith(
      ['old-d1'],
      expect.any(Array),
    );
    expect(coordinator.getActiveDecorationCount()).toBe(1);
  });
});
