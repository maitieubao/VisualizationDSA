import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useAnimationStore } from '../../animation-engine/store/useAnimationStore';
import { compileAndInstrument } from '../engine/ASTInstrumentationEngine';
import { executeInSandbox, terminateActiveSession } from '../engine/WorkerLifecycleCoordinator';
import type { ConsoleLogEntry } from '../types/compiler.types';
import type { AlgorithmResult } from '../../animation-engine/types/animation.types';
import { DEFAULT_SOURCE_CODE, DEFAULT_INPUT_ARRAY, convertToAnimationFrames } from './liveCompilerDefaults';

function isEffectivelyEmptyCode(code: string): boolean {
  const stripped = code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '').trim();
  return stripped === '';
}

export const useLiveCompilerStore = defineStore('liveCompiler', () => {
  const animStore = useAnimationStore();

  const sourceCode          = ref<string>(DEFAULT_SOURCE_CODE);
  const isCompiling         = ref<boolean>(false);
  const compilerConsoleLogs = ref<ConsoleLogEntry[]>([]);
  const hasCompileError     = ref<boolean>(false);
  const inputArray          = ref<number[]>([...DEFAULT_INPUT_ARRAY]);
  const lastCompileSucceeded = ref<boolean>(false);
  const compileErrorLine    = ref<number | null>(null);
  const compileGeneration   = ref<number>(0);

  function addConsoleLog(text: string, type: 'info' | 'success' | 'error' | 'warn' = 'info'): void {
    const timestamp = new Date().toTimeString().split(' ')[0];
    compilerConsoleLogs.value.push({ text, type, timestamp });
  }

  function clearLogs():              void { compilerConsoleLogs.value = []; }
  function setSourceCode(code: string): void {
    sourceCode.value = code;
    if (hasCompileError.value) {
      hasCompileError.value = false;
      compileErrorLine.value = null;
    }
  }
  function setInputArray(arr: number[]): void { inputArray.value = [...arr]; }

  async function compileAndExecuteCode(): Promise<void> {
    if (isCompiling.value) return;

    if (isEffectivelyEmptyCode(sourceCode.value)) {
      addConsoleLog('Vui lòng nhập code trước khi chạy.', 'warn');
      lastCompileSucceeded.value = false;
      return;
    }

    compileGeneration.value += 1;
    const generation = compileGeneration.value;
    isCompiling.value      = true;
    hasCompileError.value  = false;
    compileErrorLine.value = null;
    lastCompileSucceeded.value = false;
    animStore.clear();
    compilerConsoleLogs.value = [];
    addConsoleLog('Bắt đầu phân tích cú pháp AST...', 'info');

    let succeeded = false;
    try {
      const compileResult = compileAndInstrument(sourceCode.value);
      if (!compileResult.success || !compileResult.instrumentedCode) {
        hasCompileError.value = true;
        compileErrorLine.value = compileResult.errorLine ?? null;
        const lineInfo = compileResult.errorLine ? ` (Dòng số ${compileResult.errorLine})` : '';
        addConsoleLog(`Biên dịch AST thất bại: ${compileResult.error ?? 'Lỗi không xác định.'}${lineInfo}`, 'error');
        return;
      }
      addConsoleLog('Phân tích AST thành công. Khởi chạy luồng Web Worker Sandbox...', 'success');

      const liveFrames = await executeInSandbox(compileResult.instrumentedCode, [...inputArray.value]);
      if (generation !== compileGeneration.value) return;

      addConsoleLog(`Tạo vết thực thi thành công! Sinh ra ${liveFrames.length} bước hoạt ảnh.`, 'success');

      const result: AlgorithmResult = { algorithmId: 'custom-code', pseudoCode: [], frames: convertToAnimationFrames(liveFrames) };
      animStore.loadResult(result);
      animStore.play();
      succeeded = true;
    } catch (err: unknown) {
      if (generation !== compileGeneration.value) return;
      hasCompileError.value = true;
      addConsoleLog(`Lỗi thực thi Sandbox: ${err instanceof Error ? err.message : 'Lỗi thực thi Sandbox.'}`, 'error');
    } finally {
      if (generation === compileGeneration.value) {
        isCompiling.value = false;
        lastCompileSucceeded.value = succeeded;
      }
    }
  }

  function cancelExecution(): void {
    compileGeneration.value += 1;
    terminateActiveSession();
    if (isCompiling.value) {
      isCompiling.value = false;
      addConsoleLog('Đã hủy bỏ biên dịch.', 'warn');
    }
  }

  return { sourceCode, isCompiling, compilerConsoleLogs, hasCompileError, inputArray, lastCompileSucceeded, compileErrorLine, addConsoleLog, clearLogs, setSourceCode, setInputArray, compileAndExecuteCode, cancelExecution };
});
