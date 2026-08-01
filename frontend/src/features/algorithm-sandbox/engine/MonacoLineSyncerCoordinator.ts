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
        const targetFrameIndex = this.vcrStore!.playbackFrames.findIndex(
          (f: VcrBaseFrame) => f.lineNumber === lineNum
        );
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
