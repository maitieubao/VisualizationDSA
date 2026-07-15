import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MonacoLineSyncerCoordinator } from '../engine/MonacoLineSyncerCoordinator';

describe('MonacoLineSyncerCoordinator Unit Tests', () => {
  let mockEditor: any;
  let mockVcrStore: any;

  beforeEach(() => {
    mockEditor = {
      onMouseDown: vi.fn(() => ({
        dispose: vi.fn()
      })),
      deltaDecorations: vi.fn(() => []),
      revealLineInCenter: vi.fn()
    };

    mockVcrStore = {
      playbackFrames: [
        { stepIndex: 0, lineNumber: 5 },
        { stepIndex: 1, lineNumber: 10 }
      ],
      currentLineNumber: 0,
      jumpToFrame: vi.fn()
    };
  });

  it('Should initialize gutter click listener correctly', () => {
    const coordinator = new MonacoLineSyncerCoordinator(mockEditor, mockVcrStore);
    expect(mockEditor.onMouseDown).toHaveBeenCalled();
    coordinator.destroy();
  });

  it('Should jump to correct step index when gutter is clicked', () => {
    let clickCallback: any = null;
    mockEditor.onMouseDown.mockImplementation((cb: any) => {
      clickCallback = cb;
      return { dispose: vi.fn() };
    });

    const coordinator = new MonacoLineSyncerCoordinator(mockEditor, mockVcrStore);
    
    // Simulate gutter click
    clickCallback({
      target: {
        type: 3, // Gutter
        position: { lineNumber: 10 }
      }
    });

    expect(mockVcrStore.jumpToFrame).toHaveBeenCalledWith(1); // line 10 corresponds to stepIndex 1

    coordinator.destroy();
  });

  it('Should destroy click listener on destroy', () => {
    const disposeSpy = vi.fn();
    mockEditor.onMouseDown.mockReturnValue({ dispose: disposeSpy });

    const coordinator = new MonacoLineSyncerCoordinator(mockEditor, mockVcrStore);
    coordinator.destroy();

    expect(disposeSpy).toHaveBeenCalled();
  });
});
