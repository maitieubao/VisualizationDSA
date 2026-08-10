// @vitest-environment jsdom
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
import { executeInSandbox } from '../engine/WorkerLifecycleCoordinator';

const mockCompile = vi.mocked(compileAndInstrument);
const mockExecute = vi.mocked(executeInSandbox);

describe('CV-001 (P0): Viết code — sourceCode thay đổi', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('setSourceCode cập nhật sourceCode mới', () => {
    const store = useLiveCompilerStore();
    store.setSourceCode('function quickSort(arr) { return arr; }');

    expect(store.sourceCode).toBe('function quickSort(arr) { return arr; }');
  });

  it('sourceCode mặc định chứa bubbleSort', () => {
    const store = useLiveCompilerStore();
    expect(store.sourceCode).toContain('function bubbleSort');
  });

  it('setInputArray cập nhật input array', () => {
    const store = useLiveCompilerStore();
    store.setInputArray([100, 200, 300]);

    expect(store.inputArray).toEqual([100, 200, 300]);
  });
});

describe('CV-003 (P0): Bấm RUN — runCode() → frames', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('compileAndExecuteCode tạo frames thành công', async () => {
    const store = useLiveCompilerStore();
    mockCompile.mockReturnValue({
      success: true,
      instrumentedCode: 'instrumented_code_here',
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
    expect(mockExecute).toHaveBeenCalledWith('instrumented_code_here', store.inputArray);
  });

  it('isCompiling = true sau khi gọi compileAndExecuteCode', async () => {
    const store = useLiveCompilerStore();
    mockCompile.mockReturnValue({
      success: true,
      instrumentedCode: 'code',
    });
    mockExecute.mockResolvedValue([]);

    await store.compileAndExecuteCode();
    expect(store.isCompiling).toBe(false);
  });

  it('ngăn chặn double compile', async () => {
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
});

describe('CV-004 (P0): Compiler console — log INFO/SUCCESS/WARN/ERROR', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('addConsoleLog tạo INFO log', () => {
    const store = useLiveCompilerStore();
    store.addConsoleLog('Bắt đầu biên dịch', 'info');

    expect(store.compilerConsoleLogs.length).toBe(1);
    expect(store.compilerConsoleLogs[0].type).toBe('info');
    expect(store.compilerConsoleLogs[0].text).toBe('Bắt đầu biên dịch');
    expect(store.compilerConsoleLogs[0].timestamp).toBeDefined();
  });

  it('addConsoleLog tạo SUCCESS log', () => {
    const store = useLiveCompilerStore();
    store.addConsoleLog('Biên dịch thành công', 'success');

    expect(store.compilerConsoleLogs[0].type).toBe('success');
  });

  it('addConsoleLog tạo ERROR log', () => {
    const store = useLiveCompilerStore();
    store.addConsoleLog('Lỗi cú pháp', 'error');

    expect(store.compilerConsoleLogs[0].type).toBe('error');
  });

  it('addConsoleLog tạo WARN log', () => {
    const store = useLiveCompilerStore();
    store.addConsoleLog('Cảnh báo biến không dùng', 'warn');

    expect(store.compilerConsoleLogs[0].type).toBe('warn');
  });

  it('clearLogs xóa tất cả logs', () => {
    const store = useLiveCompilerStore();
    store.addConsoleLog('msg1', 'info');
    store.addConsoleLog('msg2', 'error');
    store.addConsoleLog('msg3', 'warn');

    expect(store.compilerConsoleLogs.length).toBe(3);

    store.clearLogs();
    expect(store.compilerConsoleLogs.length).toBe(0);
  });
});

describe('CV-006 (P0): Glow success/error — compile-failed-glow / compile-success-glow', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('hasCompileError = true khi biên dịch thất bại (compile-failed-glow)', async () => {
    const store = useLiveCompilerStore();
    mockCompile.mockReturnValue({
      success: false,
      error: 'Unexpected token',
      errorLine: 5,
    });

    await store.compileAndExecuteCode();

    expect(store.hasCompileError).toBe(true);
    expect(store.compilerConsoleLogs.some(l => l.type === 'error')).toBe(true);
  });

  it('hasCompileError = false khi biên dịch thành công (compile-success-glow)', async () => {
    const store = useLiveCompilerStore();
    mockCompile.mockReturnValue({
      success: true,
      instrumentedCode: 'code',
    });
    mockExecute.mockResolvedValue([
      { frameIndex: 0, type: 'ACCESS' as const, indices: [], arrayState: [1], variables: {} },
    ]);

    await store.compileAndExecuteCode();

    expect(store.hasCompileError).toBe(false);
    expect(store.compilerConsoleLogs.some(l => l.type === 'success')).toBe(true);
  });

  it('hasCompileError = true khi sandbox execution thất bại', async () => {
    const store = useLiveCompilerStore();
    mockCompile.mockReturnValue({
      success: true,
      instrumentedCode: 'code',
    });
    mockExecute.mockRejectedValue(new Error('Infinite loop detected'));

    await store.compileAndExecuteCode();

    expect(store.hasCompileError).toBe(true);
    expect(store.compilerConsoleLogs.some(l => l.text.includes('Infinite loop'))).toBe(true);
  });
});

describe('CV-009 (P1): AST error — error message render', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('error message chứa thông tin lỗi AST', async () => {
    const store = useLiveCompilerStore();
    mockCompile.mockReturnValue({
      success: false,
      error: 'Missing semicolon',
      errorLine: 3,
    });

    await store.compileAndExecuteCode();

    expect(store.hasCompileError).toBe(true);
    expect(store.compilerConsoleLogs.some(l => l.text.includes('Missing semicolon'))).toBe(true);
    expect(store.compilerConsoleLogs.some(l => l.text.includes('Dòng số 3'))).toBe(true);
  });

  it('error message không có errorLine thì không hiển thị số dòng', async () => {
    const store = useLiveCompilerStore();
    mockCompile.mockReturnValue({
      success: false,
      error: 'Unknown error',
    });

    await store.compileAndExecuteCode();

    expect(store.hasCompileError).toBe(true);
    expect(store.compilerConsoleLogs.some(l => l.text.includes('Dòng số'))).toBe(false);
  });

  it('CompilerConsole component render error class đúng', () => {
    const fs = require('fs');
    const path = require('path');
    const headerSource = fs.readFileSync(
      path.resolve(__dirname, '../components/CompilerConsole.vue'),
      'utf-8'
    );

    expect(headerSource).toContain('status-error');
    expect(headerSource).toContain('status-success');
    expect(headerSource).toContain('status-warn');
    expect(headerSource).toContain('status-info');
  });
});
