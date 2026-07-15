import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useLiveCompilerStore } from '../store/useLiveCompilerStore';

vi.mock('../engine/ASTInstrumentationEngine', () => ({
  compileAndInstrument: vi.fn(),
}));

vi.mock('../engine/WorkerLifecycleCoordinator', () => ({
  executeInSandbox: vi.fn(),
  terminateActiveSession: vi.fn(),
}));

import { compileAndInstrument } from '../engine/ASTInstrumentationEngine';
import { executeInSandbox, terminateActiveSession } from '../engine/WorkerLifecycleCoordinator';

const mockCompile = vi.mocked(compileAndInstrument);
const mockExecute = vi.mocked(executeInSandbox);
const mockTerminate = vi.mocked(terminateActiveSession);

describe('useLiveCompilerStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('should initialize with default source code and input array', () => {
    const store = useLiveCompilerStore();

    expect(store.sourceCode).toContain('function bubbleSort');
    expect(store.inputArray.length).toBeGreaterThan(0);
    expect(store.isCompiling).toBe(false);
    expect(store.hasCompileError).toBe(false);
    expect(store.compilerConsoleLogs).toEqual([]);
  });

  it('should update source code via setSourceCode', () => {
    const store = useLiveCompilerStore();
    store.setSourceCode('function test() {}');

    expect(store.sourceCode).toBe('function test() {}');
  });

  it('should update input array via setInputArray', () => {
    const store = useLiveCompilerStore();
    store.setInputArray([10, 20, 30]);

    expect(store.inputArray).toEqual([10, 20, 30]);
  });

  it('should add console log entries with timestamp', () => {
    const store = useLiveCompilerStore();
    store.addConsoleLog('Test message', 'info');

    expect(store.compilerConsoleLogs.length).toBe(1);
    expect(store.compilerConsoleLogs[0].text).toBe('Test message');
    expect(store.compilerConsoleLogs[0].type).toBe('info');
    expect(store.compilerConsoleLogs[0].timestamp).toBeDefined();
  });

  it('should clear logs via clearLogs', () => {
    const store = useLiveCompilerStore();
    store.addConsoleLog('Message 1', 'info');
    store.addConsoleLog('Message 2', 'error');

    expect(store.compilerConsoleLogs.length).toBe(2);

    store.clearLogs();
    expect(store.compilerConsoleLogs.length).toBe(0);
  });

  it('should set hasCompileError when AST compilation fails', async () => {
    const store = useLiveCompilerStore();
    mockCompile.mockReturnValue({
      success: false,
      error: 'Unexpected token',
      errorLine: 5,
    });

    await store.compileAndExecuteCode();

    expect(store.hasCompileError).toBe(true);
    expect(store.isCompiling).toBe(false);
    expect(store.compilerConsoleLogs.some((l) => l.type === 'error')).toBe(true);
    expect(store.compilerConsoleLogs.some((l) => l.text.includes('Unexpected token'))).toBe(true);
  });

  it('should compile and execute successfully with correct frame conversion', async () => {
    const store = useLiveCompilerStore();
    mockCompile.mockReturnValue({
      success: true,
      instrumentedCode: 'instrumented_code',
    });

    const mockFrames = [
      { frameIndex: 0, type: 'COMPARE' as const, indices: [0, 1], arrayState: [5, 3], variables: {} },
      { frameIndex: 1, type: 'SWAP' as const, indices: [0], arrayState: [3, 5], variables: {} },
      { frameIndex: 2, type: 'ACCESS' as const, indices: [], arrayState: [3, 5], variables: {} },
    ];
    mockExecute.mockResolvedValue(mockFrames);

    await store.compileAndExecuteCode();

    expect(store.hasCompileError).toBe(false);
    expect(store.isCompiling).toBe(false);
    expect(store.compilerConsoleLogs.some((l) => l.type === 'success')).toBe(true);
    expect(mockExecute).toHaveBeenCalledWith('instrumented_code', store.inputArray);
  });

  it('should set hasCompileError when sandbox execution fails', async () => {
    const store = useLiveCompilerStore();
    mockCompile.mockReturnValue({
      success: true,
      instrumentedCode: 'code',
    });
    mockExecute.mockRejectedValue(new Error('Infinite loop detected'));

    await store.compileAndExecuteCode();

    expect(store.hasCompileError).toBe(true);
    expect(store.compilerConsoleLogs.some((l) => l.text.includes('Infinite loop'))).toBe(true);
  });

  it('should prevent double compilation when already compiling', async () => {
    const store = useLiveCompilerStore();
    mockCompile.mockReturnValue({
      success: true,
      instrumentedCode: 'code',
    });
    mockExecute.mockResolvedValue([]);

    const p1 = store.compileAndExecuteCode();
    const p2 = store.compileAndExecuteCode();

    await Promise.all([p1, p2]);

    expect(mockCompile).toHaveBeenCalledTimes(1);
  });

  it('should call terminateActiveSession on cancelExecution', () => {
    const store = useLiveCompilerStore();
    store.cancelExecution();

    expect(mockTerminate).toHaveBeenCalled();
    expect(store.isCompiling).toBe(false);
  });

  it('should include line info in error log when errorLine is present', async () => {
    const store = useLiveCompilerStore();
    mockCompile.mockReturnValue({
      success: false,
      error: 'Missing semicolon',
      errorLine: 3,
    });

    await store.compileAndExecuteCode();

    expect(store.compilerConsoleLogs.some((l) => l.text.includes('Dòng số 3'))).toBe(true);
  });
});
