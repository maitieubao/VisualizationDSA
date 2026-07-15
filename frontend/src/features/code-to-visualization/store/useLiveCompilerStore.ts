/**
 * useLiveCompilerStore — Pinia Setup Store điều phối biên dịch AST → Worker → Canvas.
 *
 * Quản lý: sourceCode, trạng thái biên dịch, console logs,
 * tích hợp ASTInstrumentationEngine + WorkerLifecycleCoordinator,
 * nạp Frame kết quả vào useAnimationStore để Canvas vẽ hoạt ảnh.
 */

import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useAnimationStore } from '../../animation-engine/store/useAnimationStore';
import { compileAndInstrument } from '../engine/ASTInstrumentationEngine';
import { executeInSandbox, terminateActiveSession } from '../engine/WorkerLifecycleCoordinator';
import type { ConsoleLogEntry } from '../types/compiler.types';
import type { AlgorithmResult } from '../../animation-engine/types/animation.types';
import { DEFAULT_SOURCE_CODE, DEFAULT_INPUT_ARRAY, convertToAnimationFrames } from './liveCompilerDefaults';

export const useLiveCompilerStore = defineStore('liveCompiler', () => {
  const animStore = useAnimationStore();

  // State
  const sourceCode          = ref<string>(DEFAULT_SOURCE_CODE);
  const isCompiling         = ref<boolean>(false);
  const compilerConsoleLogs = ref<ConsoleLogEntry[]>([]);
  const hasCompileError     = ref<boolean>(false);
  const inputArray          = ref<number[]>([...DEFAULT_INPUT_ARRAY]);

  // Actions
  function addConsoleLog(text: string, type: 'info' | 'success' | 'error' | 'warn' = 'info'): void {
    const timestamp = new Date().toTimeString().split(' ')[0];
    compilerConsoleLogs.value.push({ text, type, timestamp });
  }

  function clearLogs():              void { compilerConsoleLogs.value = []; }
  function setSourceCode(code: string): void { sourceCode.value = code; }
  function setInputArray(arr: number[]): void { inputArray.value = [...arr]; }

  /** Biên dịch AST + chạy Sandbox + nạp Frame vào Canvas. */
  async function compileAndExecuteCode(): Promise<void> {
    if (isCompiling.value) return;
    isCompiling.value    = true;
    hasCompileError.value = false;
    compilerConsoleLogs.value = [];
    addConsoleLog('Bắt đầu phân tích cú pháp AST...', 'info');

    // 1. Parse & instrument AST
    const compileResult = compileAndInstrument(sourceCode.value);
    if (!compileResult.success || !compileResult.instrumentedCode) {
      isCompiling.value    = false;
      hasCompileError.value = true;
      const lineInfo = compileResult.errorLine ? ` (Dòng số ${compileResult.errorLine})` : '';
      addConsoleLog(`Biên dịch AST thất bại: ${compileResult.error ?? 'Lỗi không xác định.'}${lineInfo}`, 'error');
      return;
    }
    addConsoleLog('Phân tích AST thành công. Khởi chạy luồng Web Worker Sandbox...', 'success');

    // 2. Execute in Web Worker Sandbox
    try {
      const liveFrames = await executeInSandbox(compileResult.instrumentedCode, [...inputArray.value]);
      addConsoleLog(`Tạo vết thực thi thành công! Sinh ra ${liveFrames.length} bước hoạt ảnh.`, 'success');

      // 3. Convert LiveFrameDTO[] → FrameDTO[] for AnimationStore
      const result: AlgorithmResult = { algorithmId: 'custom-code', pseudoCode: [], frames: convertToAnimationFrames(liveFrames) };
      animStore.loadResult(result);
      animStore.play();
    } catch (err: unknown) {
      hasCompileError.value = true;
      addConsoleLog(`Lỗi thực thi Sandbox: ${err instanceof Error ? err.message : 'Lỗi thực thi Sandbox.'}`, 'error');
    } finally {
      isCompiling.value = false;
    }
  }

  function cancelExecution(): void {
    terminateActiveSession();
    isCompiling.value = false;
    addConsoleLog('Đã hủy bỏ biên dịch.', 'warn');
  }

  return { sourceCode, isCompiling, compilerConsoleLogs, hasCompileError, inputArray, addConsoleLog, clearLogs, setSourceCode, setInputArray, compileAndExecuteCode, cancelExecution };
});
