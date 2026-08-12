import { describe, it, expect, vi, beforeEach } from 'vitest';
import { reactive, nextTick } from 'vue';
import { MonacoLineSyncerCoordinator } from '../engine/MonacoLineSyncerCoordinator';
import type { VcrBaseFrame } from '../../vcr-player';

// SV-042: không dùng `any` — mock editor/store được mô tả bằng interface địa phương
// tương thích cấu trúc (structural typing) với MonacoEditorFull / VcrStoreForSync.
interface EditorLike {
  onMouseDown: ReturnType<typeof vi.fn>;
  deltaDecorations: ReturnType<typeof vi.fn>;
  revealLineInCenter: ReturnType<typeof vi.fn>;
}

interface VcrStoreLike {
  playbackFrames: VcrBaseFrame[];
  currentLineNumber: number;
  jumpToFrame: ReturnType<typeof vi.fn>;
}

interface GutterClickEvent {
  event: { button: number };
  target: { type: number; position?: { lineNumber?: number } };
}

type CoordinatorEditor = ConstructorParameters<typeof MonacoLineSyncerCoordinator>[0];
type CoordinatorStore = ConstructorParameters<typeof MonacoLineSyncerCoordinator>[1];

describe('MonacoLineSyncerCoordinator Unit Tests', () => {
  let editor: EditorLike;
  let store: VcrStoreLike;
  let clickCb: (e: GutterClickEvent) => void;

  beforeEach(() => {
    editor = {
      onMouseDown: vi.fn((cb: (e: GutterClickEvent) => void) => {
        clickCb = cb;
        return { dispose: vi.fn() };
      }),
      deltaDecorations: vi.fn(() => ['dec-1']),
      revealLineInCenter: vi.fn(),
    };
    store = reactive<VcrStoreLike>({
      playbackFrames: [
        { stepIndex: 0, lineNumber: 5 },
        { stepIndex: 1, lineNumber: 10 },
        { stepIndex: 2, lineNumber: 5 },
      ],
      currentLineNumber: 0,
      jumpToFrame: vi.fn(),
    });
    clickCb = () => {
      /* no-op mặc định */
    };
  });

  function createCoordinator(): MonacoLineSyncerCoordinator {
    return new MonacoLineSyncerCoordinator(
      editor as unknown as CoordinatorEditor,
      store as unknown as CoordinatorStore
    );
  }

  it('Should initialize gutter click listener correctly', () => {
    const coordinator = createCoordinator();
    expect(editor.onMouseDown).toHaveBeenCalled();
    coordinator.destroy();
  });

  it('SV-011: gutter click line khớp frame → jumpToFrame đúng', () => {
    const coordinator = createCoordinator();
    clickCb({ event: { button: 0 }, target: { type: 3, position: { lineNumber: 10 } } });
    expect(store.jumpToFrame).toHaveBeenCalledWith(1);
    coordinator.destroy();
  });

  it('SV-011: gutter click line KHÔNG có frame → không jump', () => {
    const coordinator = createCoordinator();
    clickCb({ event: { button: 0 }, target: { type: 3, position: { lineNumber: 99 } } });
    expect(store.jumpToFrame).not.toHaveBeenCalled();
    coordinator.destroy();
  });

  it('SV-011: multi-line logicalId → click line trung gian jump frame gần nhất (không first-match)', () => {
    // frames: line 5 (idx 0), line 10 (idx 1), line 5 (idx 2).
    // Click line 8 → frame gần nhất là idx 1 (line 10); first-match findIndex(===8) = -1 = dead.
    const coordinator = createCoordinator();
    clickCb({ event: { button: 0 }, target: { type: 3, position: { lineNumber: 8 } } });
    expect(store.jumpToFrame).toHaveBeenCalledWith(1);
    coordinator.destroy();
  });

  it('SV-023: click chuột phải (button 2) ở gutter → không jump', () => {
    const coordinator = createCoordinator();
    clickCb({ event: { button: 2 }, target: { type: 3, position: { lineNumber: 10 } } });
    expect(store.jumpToFrame).not.toHaveBeenCalled();
    coordinator.destroy();
  });

  it('SV-011: watch currentLineNumber → deltaDecorations + revealLineInCenter được gọi', async () => {
    const coordinator = createCoordinator();
    expect(editor.revealLineInCenter).not.toHaveBeenCalled();

    store.currentLineNumber = 5;
    await nextTick();

    expect(editor.revealLineInCenter).toHaveBeenCalledWith(5, 0);
    expect(editor.deltaDecorations).toHaveBeenCalledTimes(1);
    const [oldDecorations] = editor.deltaDecorations.mock.calls[0] as [string[], unknown];
    expect(oldDecorations).toEqual([]);
    coordinator.destroy();
  });

  it('SV-011: currentLineNumber về 0 → clear decorations cũ', async () => {
    const coordinator = createCoordinator();
    store.currentLineNumber = 5;
    await nextTick();
    expect(editor.deltaDecorations).toHaveBeenCalledTimes(1);

    store.currentLineNumber = 0;
    await nextTick();

    expect(editor.deltaDecorations).toHaveBeenCalledTimes(2);
    const secondCall = editor.deltaDecorations.mock.calls[1] as [string[], unknown];
    expect(secondCall[0]).toEqual(['dec-1']);
    expect(secondCall[1]).toEqual([]);
    coordinator.destroy();
  });

  it('Should destroy click listener on destroy', () => {
    const disposeSpy = vi.fn();
    editor.onMouseDown.mockReturnValue({ dispose: disposeSpy });
    const coordinator = createCoordinator();
    coordinator.destroy();
    expect(disposeSpy).toHaveBeenCalled();
  });

  it('SV-011: destroy → clear decorations còn lại', async () => {
    const coordinator = createCoordinator();
    store.currentLineNumber = 5;
    await nextTick();
    const callsBeforeDestroy = editor.deltaDecorations.mock.calls.length;

    coordinator.destroy();

    expect(editor.deltaDecorations.mock.calls.length).toBe(callsBeforeDestroy + 1);
    const clearCall = editor.deltaDecorations.mock.calls[callsBeforeDestroy] as [string[], unknown];
    expect(clearCall[1]).toEqual([]);
  });
});
