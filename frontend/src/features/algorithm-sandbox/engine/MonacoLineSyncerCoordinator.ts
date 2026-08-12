import { watch, type WatchStopHandle } from 'vue';
import type * as monaco from 'monaco-editor';
import { MonacoGutterClickInterceptor } from './MonacoGutterClickInterceptor';
import { PseudocodeSyncer, type MonacoEditorForHighlight } from './PseudocodeSyncer';
import type { VcrBaseFrame } from '../../vcr-player';

interface MonacoEditorFull extends MonacoEditorForHighlight {
  onMouseDown(cb: (e: monaco.editor.IEditorMouseEvent) => void): { dispose(): void };
}

interface VcrStoreForSync {
  playbackFrames: VcrBaseFrame[];
  currentLineNumber: number;
  currentFrameIndex: number;
  jumpToFrame(index: number): void;
}

export class MonacoLineSyncerCoordinator {
  private editorInstance: MonacoEditorFull | null = null;
  private vcrStore: VcrStoreForSync | null = null;
  private clickInterceptor: MonacoGutterClickInterceptor | null = null;
  private previousDecorations: string[] = [];
  private stopWatch: WatchStopHandle | null = null;

  constructor(editor: MonacoEditorFull, vcrStore: VcrStoreForSync) {
    this.editorInstance = editor;
    this.vcrStore = vcrStore;
    this.setupSyncing();
  }

  private setupSyncing(): void {
    if (!this.editorInstance || !this.vcrStore) return;

    
    this.clickInterceptor = new MonacoGutterClickInterceptor(
      this.editorInstance,
      (lineNum) => {
        const frames = this.vcrStore!.playbackFrames;
        const current = this.vcrStore!.currentFrameIndex ?? 0;
        let targetFrameIndex = -1;

        // SV-007: ưu tiên frame khớp line GẦN currentFrameIndex nhất —
        // lần xuất hiện KẾ TIẾP trước, lùi lại sau (không first-match)
        for (let i = current; i < frames.length; i++) {
          if (frames[i].lineNumber === lineNum) {
            targetFrameIndex = i;
            break;
          }
        }
        if (targetFrameIndex === -1) {
          for (let i = current - 1; i >= 0; i--) {
            if (frames[i].lineNumber === lineNum) {
              targetFrameIndex = i;
              break;
            }
          }
        }

        // SV-007 (multi-line logicalId PS-011): click vào dòng TRUNG GIAN không có
        // frame → snap sang frame có lineNumber gần nhất, NHƯNG chỉ khi dòng click
        // nằm trong khoảng line của frames (dòng ngoài phạm vi code → không jump)
        if (targetFrameIndex === -1 && frames.length > 0) {
          let minLine = Infinity;
          let maxLine = -Infinity;
          for (const f of frames) {
            if (f.lineNumber !== undefined) {
              if (f.lineNumber < minLine) minLine = f.lineNumber;
              if (f.lineNumber > maxLine) maxLine = f.lineNumber;
            }
          }
          if (lineNum >= minLine && lineNum <= maxLine) {
            let bestDist = Infinity;
            for (let i = 0; i < frames.length; i++) {
              const ln = frames[i].lineNumber;
              if (ln === undefined) continue;
              const dist = Math.abs(ln - lineNum);
              if (dist < bestDist) {
                bestDist = dist;
                targetFrameIndex = i;
              } else if (dist === bestDist) {
                // Bằng khoảng cách → chọn frame gần current (ưu tiên kế tiếp)
                const curDist = Math.abs(i - current);
                const bestDistToCurrent = Math.abs(targetFrameIndex - current);
                if (curDist < bestDistToCurrent) targetFrameIndex = i;
              }
            }
          }
        }

        if (targetFrameIndex !== -1) {
          this.vcrStore!.jumpToFrame(targetFrameIndex);
        }
      }
    );

    
    this.stopWatch = watch(
      () => this.vcrStore!.currentLineNumber,
      (newLineNum) => {
        this.syncLineToEditor(newLineNum);
      },
      { immediate: true }
    );
  }

  public syncLineToEditor(lineNumber: number): void {
    if (!this.editorInstance) return;

    if (lineNumber > 0) {
      this.previousDecorations = PseudocodeSyncer.highlightMonacoLine(
        this.editorInstance,
        lineNumber,
        this.previousDecorations
      );
    } else if (this.previousDecorations.length > 0) {
      this.previousDecorations = this.editorInstance.deltaDecorations(
        this.previousDecorations,
        []
      );
    }
  }

  public destroy(): void {
    if (this.stopWatch) {
      this.stopWatch();
      this.stopWatch = null;
    }
    if (this.clickInterceptor) {
      this.clickInterceptor.destroy();
      this.clickInterceptor = null;
    }
    if (this.editorInstance && this.previousDecorations.length > 0) {
      this.editorInstance.deltaDecorations(this.previousDecorations, []);
      this.previousDecorations = [];
    }
    this.editorInstance = null;
    this.vcrStore = null;
  }
}
