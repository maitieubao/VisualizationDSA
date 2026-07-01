/**
 * useLiveDebuggerStore — Pinia Setup Store cho Algorithmic Step Debugger.
 *
 * Quản lý: breakpoints, currentLine, callStack, watchedVars, mutatedKeys,
 * tích hợp DebuggerYieldEngine + LiveCompilerDebugger,
 * đồng bộ Canvas animation với debug stepping.
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { compileToDebugGenerator } from '../engine/DebuggerYieldEngine';
import { LiveCompilerDebugger } from '../engine/LiveCompilerDebugger';
import { useToastStore } from '../../../composables/useToast';
import type {
  DebugStepPayload,
  DebuggerStatus,
} from '../types/debug.types';

const DEFAULT_SOURCE_CODE = `function bubbleSort(arr) {
  let n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        let temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }
}`;

const DEFAULT_INPUT_ARRAY = [5, 3, 8, 1, 9, 2, 7];

export const useLiveDebuggerStore = defineStore('liveDebugger', () => {
  // ==========================================
  // STATE
  // ==========================================
  const status = ref<DebuggerStatus>('IDLE');
  const sourceCode = ref<string>(DEFAULT_SOURCE_CODE);
  const inputArray = ref<number[]>([...DEFAULT_INPUT_ARRAY]);
  const activeBreakpoints = ref<number[]>([]);
  const currentLineNumber = ref<number | null>(null);
  const callStackFrames = ref<string[]>([]);
  const watchedVariables = ref<Record<string, string | number | undefined>>({});
  const mutatedVariableKeys = ref<string[]>([]);
  const stepCount = ref<number>(0);
  const errorMessage = ref<string | null>(null);
  const errorLine = ref<number | null>(null); // 🆕 dòng lỗi từ AST compile để highlight trong Monaco
  const arrayState = ref<number[]>([]);
  const historyLength = ref<number>(0);
  const previousVariables = ref<Record<string, string | number | undefined>>({}); // 🆕 snapshot bước trước cho delta display

  let debuggerInstance: LiveCompilerDebugger | null = null;
  const LOOP_GUARD_PATTERN = /gioi han an toan.*buoc lap/;
  const SYNTAX_TOAST_MSG = 'Mã nguồn có lỗi cú pháp hoặc không hợp lệ, vui lòng kiểm tra lại!';
  const LOOP_TOAST_MSG = 'Phát hiện vòng lặp vô hạn! Hệ thống đã tự động dừng để bảo vệ bộ nhớ.';

  // ==========================================
  // COMPUTED
  // ==========================================
  const isDebugging = computed(() => status.value === 'DEBUGGING' || status.value === 'PAUSED');
  const isPaused = computed(() => status.value === 'PAUSED');
  const isFinished = computed(() => status.value === 'FINISHED');
  const hasError = computed(() => status.value === 'ERROR');
  const canStepForward = computed(() => status.value === 'PAUSED' && debuggerInstance !== null && !debuggerInstance.isFinished());
  const canStepBackward = computed(() => status.value === 'PAUSED' && historyLength.value > 1);
  const canContinue = computed(() => status.value === 'PAUSED' && activeBreakpoints.value.length > 0 && debuggerInstance !== null && !debuggerInstance.isFinished());

  // ==========================================
  // ACTIONS
  // ==========================================

  function setSourceCode(code: string): void {
    sourceCode.value = code;
  }

  function setInputArray(arr: number[]): void {
    inputArray.value = [...arr];
  }

  /**
   * Toggle breakpoint at line number.
   */
  function toggleBreakpoint(lineNumber: number): void {
    const index = activeBreakpoints.value.indexOf(lineNumber);
    if (index > -1) {
      activeBreakpoints.value.splice(index, 1);
    } else {
      activeBreakpoints.value.push(lineNumber);
    }

    if (debuggerInstance) {
      debuggerInstance.setBreakpoints(activeBreakpoints.value);
    }
  }

  /**
   * Start debugging session — compile AST to generator, create debugger instance.
   */
  function startDebuggingSession(): void {
    errorMessage.value = null;
    errorLine.value = null; // 🆕 reset error line khi bắt đầu session mới
    currentLineNumber.value = null;
    callStackFrames.value = [];
    watchedVariables.value = {};
    mutatedVariableKeys.value = [];
    stepCount.value = 0;
    arrayState.value = [...inputArray.value];

    const compileResult = compileToDebugGenerator(sourceCode.value);

    if (!compileResult.success || !compileResult.generatorCode) {
      status.value = 'ERROR';
      errorMessage.value = compileResult.error ?? 'Loi bien dich AST khong xac dinh.';
      errorLine.value = compileResult.errorLine ?? null;
      useToastStore().error(SYNTAX_TOAST_MSG);
      return;
    }

    try {
      const generatorCode = compileResult.generatorCode;
      const inputArr = [...inputArray.value];

      const generatorFunc = (): Generator<DebugStepPayload, void, unknown> => {
        const createGenerator = new Function('arr', `
          ${generatorCode}
          return __debugMain();
        `);
        return createGenerator(inputArr) as Generator<DebugStepPayload, void, unknown>;
      };

      debuggerInstance = new LiveCompilerDebugger(generatorFunc);
      debuggerInstance.setBreakpoints(activeBreakpoints.value);
      status.value = 'PAUSED';
      historyLength.value = 0;

      stepForward();
    } catch (err: unknown) {
      status.value = 'ERROR';
      const msg = err instanceof Error ? err.message : 'Loi khoi tao debugger.';
      errorMessage.value = msg;
      useToastStore().error(SYNTAX_TOAST_MSG);
    }
  }

  /**
   * Step Forward — Tiến một dòng lệnh.
   */
  function stepForward(): void {
    if (!debuggerInstance) return;

    try {
      const payload = debuggerInstance.stepForward();
      if (payload) {
        syncDebuggerPayload(payload);
        historyLength.value = debuggerInstance.getHistory().length;
      } else {
        status.value = 'FINISHED';
        currentLineNumber.value = null;
      }
    } catch (err: unknown) {
      status.value = 'ERROR';
      const msg = err instanceof Error ? err.message : 'Loi step forward.';
      errorMessage.value = msg;
      if (LOOP_GUARD_PATTERN.test(msg)) {
        useToastStore().warning(LOOP_TOAST_MSG);
      } else {
        useToastStore().error(SYNTAX_TOAST_MSG);
      }
    }
  }

  /**
   * Step Backward — Quay lại bước trước.
   */
  function stepBackward(): void {
    if (!debuggerInstance) return;

    const payload = debuggerInstance.stepBackward();
    if (payload) {
      syncDebuggerPayload(payload);
      historyLength.value = debuggerInstance.getHistory().length;
    }
  }

  /**
   * Continue — Phát tới breakpoint kế tiếp.
   */
  function continueToNextBreakpoint(): void {
    if (!debuggerInstance) return;

    try {
      const payload = debuggerInstance.continueToNextBreakpoint();
      if (payload) {
        syncDebuggerPayload(payload);
        historyLength.value = debuggerInstance.getHistory().length;
      } else {
        status.value = 'FINISHED';
        currentLineNumber.value = null;
      }
    } catch (err: unknown) {
      status.value = 'ERROR';
      const msg = err instanceof Error ? err.message : 'Loi continue.';
      errorMessage.value = msg;
      if (LOOP_GUARD_PATTERN.test(msg)) {
        useToastStore().warning(LOOP_TOAST_MSG);
      } else {
        useToastStore().error(SYNTAX_TOAST_MSG);
      }
    }
  }

  /**
   * Step Out — Thoát hàm hiện tại.
   */
  function stepOut(): void {
    if (!debuggerInstance) return;

    try {
      const payload = debuggerInstance.stepOut();
      if (payload) {
        syncDebuggerPayload(payload);
        historyLength.value = debuggerInstance.getHistory().length;
      } else {
        status.value = 'FINISHED';
        currentLineNumber.value = null;
      }
    } catch (err: unknown) {
      status.value = 'ERROR';
      const msg = err instanceof Error ? err.message : 'Loi step out.';
      errorMessage.value = msg;
      if (LOOP_GUARD_PATTERN.test(msg)) {
        useToastStore().warning(LOOP_TOAST_MSG);
      } else {
        useToastStore().error(SYNTAX_TOAST_MSG);
      }
    }
  }

  /**
   * Stop debugging session.
   */
  function stopDebuggingSession(): void {
    status.value = 'IDLE';
    currentLineNumber.value = null;
    callStackFrames.value = [];
    watchedVariables.value = {};
    mutatedVariableKeys.value = [];
    stepCount.value = 0;
    errorMessage.value = null;
    arrayState.value = [...inputArray.value];

    historyLength.value = 0;

    if (debuggerInstance) {
      debuggerInstance.reset();
      debuggerInstance = null;
    }
  }

  /**
   * Sync debug payload from engine to reactive state.
   */
  function syncDebuggerPayload(payload: DebugStepPayload): void {
    currentLineNumber.value = payload.lineNumber;
    callStackFrames.value = [...payload.callStack];
    arrayState.value = [...payload.arrayState];
    stepCount.value = debuggerInstance?.getStepCount() ?? 0;

    const nextMutatedKeys: string[] = [];
    for (const key of Object.keys(payload.variables)) {
      if (watchedVariables.value[key] !== payload.variables[key]) {
        nextMutatedKeys.push(key);
      }
    }
    mutatedVariableKeys.value = nextMutatedKeys;
    previousVariables.value = { ...watchedVariables.value }; // 🆕 lưu snapshot trước khi ghi đè
    watchedVariables.value = { ...payload.variables };
  }

  return {
    // State
    status,
    sourceCode,
    inputArray,
    activeBreakpoints,
    currentLineNumber,
    callStackFrames,
    watchedVariables,
    mutatedVariableKeys,
    stepCount,
    errorMessage,
    errorLine,           // 🆕
    previousVariables,   // 🆕
    arrayState,
    // Computed
    isDebugging,
    isPaused,
    isFinished,
    hasError,
    canStepForward,
    canStepBackward,
    canContinue,
    // Actions
    setSourceCode,
    setInputArray,
    toggleBreakpoint,
    startDebuggingSession,
    stepForward,
    stepBackward,
    continueToNextBreakpoint,
    stepOut,
    stopDebuggingSession,
  };
});
