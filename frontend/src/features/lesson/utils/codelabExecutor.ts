import type { TestCase } from '../types/lesson.types';
import * as acorn from 'acorn';
import * as escodegen from 'escodegen';
import type { Node } from 'estree';

export interface CodelabCaseResult {
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  passed: boolean;
  isHidden: boolean;
  error?: string;
  note?: string;
}

export interface CodelabRunResult {
  ok: boolean;
  timedOut?: boolean;
  error?: string;
  results: CodelabCaseResult[];
}

export interface CodelabWorkerRequest {
  requestId: number;
  code: string;
  testCases: TestCase[];
  entryFunction: string;
}

export interface CodelabWorkerResponse {
  requestId: number;
  ok: boolean;
  error?: string;
  results?: CodelabCaseResult[];
}

/** Ngưỡng tối đa lượt lặp trong code sinh viên — sentinel chặn `while(true)` (LM-004). */
export const CODELAB_LOOP_LIMIT = 20000;
const LOOP_LIMIT_SENTINEL = '[LOOP_LIMIT_EXCEEDED]';

/**
 * LM-024: chuẩn hóa output THEO KIỂU dữ liệu — string chỉ trim 2 đầu, array/object được
 * chuẩn hóa đệ quy (string phần tử trim). KHÔNG strip toàn bộ whitespace như cũ
 * (trước đây '"a b"' ≡ '"ab"' → pass giả).
 */
export function normalizeOutput(raw: string): string {
  if (raw == null) return '';
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return raw.trim();
  }
  return JSON.stringify(normalizeValue(parsed));
}

function normalizeValue(value: unknown): unknown {
  if (typeof value === 'string') return value.trim();
  if (Array.isArray(value)) return value.map(normalizeValue);
  if (value !== null && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) out[key] = normalizeValue(val);
    return out;
  }
  return value;
}

/**
 * LM-004: chèn sentinel đếm vòng lặp vào code sinh viên (cùng mẫu LOOP_LIMIT/sentinel
 * của CompilerStepExecutor/ASTInstrumentationEngine). Vượt ngưỡng → ném lỗi rõ ràng
 * thay vì treo tới khi worker bị terminate. Lỗi cú pháp → trả nguyên code (new Function báo sau).
 */
export function injectLoopLimit(code: string, limit: number = CODELAB_LOOP_LIMIT): string {
  let ast: Node;
  try {
    ast = acorn.parse(code, { ecmaVersion: 2022 }) as unknown as Node;
  } catch {
    return code;
  }

  const guardName = '__codelabLoopGuard';
  const counterName = '__codelabLoopCount';
  const loopBodies: Array<{ node: Node }> = [];

  collectLoopBodies(ast, loopBodies);

  if (loopBodies.length === 0) return code;

  const guardCall: Node = {
    type: 'ExpressionStatement',
    expression: {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: guardName },
      arguments: [],
      optional: false,
    },
  } as unknown as Node;

  for (const { node } of loopBodies) {
    const body = (node as { body: Node }).body;
    if (body.type === 'BlockStatement') {
      (body.body as Node[]).unshift({ ...guardCall });
    } else {
      (node as { body: Node }).body = {
        type: 'BlockStatement',
        body: [{ ...guardCall }, body],
      } as Node;
    }
  }

  const program = ast as unknown as { body: Node[] };
  const counterDecl: Node = {
    type: 'VariableDeclaration',
    kind: 'var',
    declarations: [
      {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: counterName } as Node,
        init: { type: 'Literal', value: 0 },
      },
    ],
  } as unknown as Node;
  const guardFn: Node = {
    type: 'FunctionDeclaration',
    id: { type: 'Identifier', name: guardName } as Node,
    params: [],
    body: {
      type: 'BlockStatement',
      body: [
        {
          type: 'IfStatement',
          test: {
            type: 'BinaryExpression',
            operator: '>',
            left: {
              type: 'UpdateExpression',
              operator: '++',
              prefix: true,
              argument: { type: 'Identifier', name: counterName } as Node,
            },
            right: { type: 'Literal', value: limit },
          },
          consequent: {
            type: 'ThrowStatement',
            argument: {
              type: 'NewExpression',
              callee: { type: 'Identifier', name: 'Error' },
              arguments: [
                {
                  type: 'Literal',
                  value: `${LOOP_LIMIT_SENTINEL} Phát hiện vượt ngưỡng lặp: code đã chạy quá ${limit} lượt lặp — có thể có vòng lặp vô hạn!`,
                },
              ],
            },
          },
          alternate: null,
        },
      ],
    },
    generator: false,
    async: false,
    expression: false,
  } as unknown as Node;

  // Chèn sau directive đầu tiên (vd "use strict") để không demote strict mode.
  let insertAt = 0;
  while (
    insertAt < program.body.length &&
    program.body[insertAt].type === 'ExpressionStatement' &&
    (program.body[insertAt] as { expression: Node }).expression.type === 'Literal' &&
    typeof ((program.body[insertAt] as { expression: { value?: unknown } }).expression.value) === 'string'
  ) {
    insertAt++;
  }
  program.body.splice(insertAt, 0, counterDecl, guardFn);

  return escodegen.generate(ast as unknown as Node);
}

function collectLoopBodies(node: Node, acc: Array<{ node: Node }>): void {
  if (!node || typeof node !== 'object') return;
  const n = node as unknown as Record<string, unknown>;
  if (n.type === 'ForStatement' || n.type === 'ForInStatement' || n.type === 'ForOfStatement' || n.type === 'WhileStatement' || n.type === 'DoWhileStatement') {
    acc.push({ node });
  }
  for (const key of Object.keys(n)) {
    if (key === 'type' || key === 'loc' || key === 'start' || key === 'end' || key === 'range') continue;
    const value = n[key];
    if (Array.isArray(value)) {
      for (const child of value) {
        if (child && typeof child === 'object' && typeof (child as { type?: unknown }).type === 'string') {
          collectLoopBodies(child as Node, acc);
        }
      }
    } else if (value && typeof value === 'object' && typeof (value as { type?: unknown }).type === 'string') {
      collectLoopBodies(value as Node, acc);
    }
  }
}

/** Chạy code user qua từng testcase (thuần — dùng chung cho worker và test). */
export function executeCodelab(
  code: string,
  testCases: TestCase[],
  entryFunction: string,
): CodelabRunResult {
  const entry = entryFunction.trim() || 'solution';
  const results: CodelabCaseResult[] = [];

  let fn: ((...args: unknown[]) => unknown) | null = null;
  try {
    // LM-004: chèn sentinel LOOP_LIMIT trước khi biên dịch — while(true) bị chặn ngay trong worker.
    const instrumented = injectLoopLimit(code);
    // eslint-disable-next-line no-new-func
    fn = new Function('...__args__', `${instrumented}\n;return ${entry}(...__args__);`) as (...args: unknown[]) => unknown;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      error: `Lỗi biên dịch code: ${message}`,
      results: testCases.map(tc => ({
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        passed: false,
        isHidden: !!tc.isHidden,
        error: message,
      })),
    };
  }

  for (const tc of testCases) {
    // A2.3 (review fix): testcase ẨN mà backend che ExpectedOutput (trả "") — client KHÔNG
    // verify được (đúng thiết kế: test ẩn thuộc server judge). Đánh pass để không chặn
    // hoàn thành codelab; test ẩn CÓ expectedOutput (registry demo) vẫn chạy như cũ.
    if (tc.isHidden && tc.expectedOutput.trim().length === 0) {
      results.push({
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        passed: true,
        isHidden: true,
        note: 'Test ẩn — verify phía máy chủ',
      });
      continue;
    }
    try {
      const args = JSON.parse(tc.input) as unknown[];
      const actual = fn(...(Array.isArray(args) ? args : [args]));
      const actualOutput = JSON.stringify(actual);
      const passed = normalizeOutput(actualOutput ?? '') === normalizeOutput(tc.expectedOutput);
      results.push({
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput,
        passed,
        isHidden: !!tc.isHidden,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      results.push({
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        passed: false,
        isHidden: !!tc.isHidden,
        error: message,
      });
    }
  }

  return { ok: true, results };
}

/** Thời gian tối đa chạy một lần Run/Submit (ms) — chặn vòng lặp vô hạn treo UI. */
export const CODELAB_TIMEOUT_MS = 1500;

type WorkerFactory = () => Worker;

function defaultWorkerFactory(): Worker {
  return new Worker(new URL('./codelab.worker.ts', import.meta.url), { type: 'module' });
}

/**
 * Chạy code user trong Web Worker với kill-switch timeout.
 * Nếu code treo (vòng lặp vô hạn), worker bị terminate sau timeoutMs → timedOut=true.
 */
export function runCodelabTask(
  code: string,
  testCases: TestCase[],
  entryFunction: string,
  timeoutMs: number = CODELAB_TIMEOUT_MS,
  workerFactory: WorkerFactory = defaultWorkerFactory,
): Promise<CodelabRunResult> {
  return new Promise<CodelabRunResult>((resolve) => {
    let worker: Worker;
    try {
      worker = workerFactory();
    } catch {
      // KHÔNG fallback chạy trên main thread: new Function không có kill-switch,
      // vòng lặp vô hạn sẽ đứng băng toàn bộ trang. Báo lỗi rõ ràng.
      resolve({
        ok: false,
        error: 'Không thể khởi tạo môi trường chạy code an toàn. Vui lòng thử lại.',
        results: testCases.map(tc => ({
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          passed: false,
          isHidden: !!tc.isHidden,
          error: 'Worker unavailable',
        })),
      });
      return;
    }

    const requestId = Date.now() + Math.floor(Math.random() * 1e6);
    const timer = setTimeout(() => {
      worker.terminate();
      resolve({
        ok: false,
        timedOut: true,
        error: `Hết thời gian chạy (${timeoutMs}ms). Code có thể bị vòng lặp vô hạn!`,
        results: [],
      });
    }, timeoutMs);

    worker.onmessage = (event: MessageEvent<CodelabWorkerResponse>) => {
      if (event.data.requestId !== requestId) return;
      clearTimeout(timer);
      worker.terminate();
      resolve({
        ok: event.data.ok,
        error: event.data.error,
        results: event.data.results ?? [],
      });
    };

    worker.onerror = (event: ErrorEvent) => {
      clearTimeout(timer);
      worker.terminate();
      resolve({ ok: false, error: event.message || 'Lỗi không xác định khi chạy code.', results: [] });
    };

    // LM-055: worker nhận payload không hiểu được (shape sai) → không treo promise tới timeout.
    worker.onmessageerror = () => {
      clearTimeout(timer);
      worker.terminate();
      resolve({ ok: false, error: 'Phản hồi từ môi trường chạy code không hợp lệ.', results: [] });
    };

    const payload: CodelabWorkerRequest = { requestId, code, testCases, entryFunction };
    // LM-023: postMessage hỏng (worker chết giữa chừng) → resolve lỗi ngay + dọn timer,
    // tránh unhandled rejection và timer treo rò rỉ.
    try {
      worker.postMessage(payload);
    } catch (err: unknown) {
      clearTimeout(timer);
      worker.terminate();
      const message = err instanceof Error ? err.message : String(err);
      resolve({ ok: false, error: `Không gửi được code tới môi trường chạy: ${message}`, results: [] });
    }
    // TODO (LM-058): hiện mỗi run tạo worker mới + timeout toàn cục — 1 testcase treo giết cả
    // lượt. Tối ưu sau: pool worker tái sử dụng + timeout theo testcase.
  });
}
