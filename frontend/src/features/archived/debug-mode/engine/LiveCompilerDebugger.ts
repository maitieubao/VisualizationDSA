/**
 * LiveCompilerDebugger — Bộ máy gỡ lỗi Coroutine Generator.
 *
 * Điều khiển vòng lặp Iterator .next() cho Step Over, Step Into, Continue.
 * Quản lý breakpoints, callStack tracking, và max step protection.
 */

import type { DebugStepPayload } from '../types/debug.types';

const MAX_CONTINUE_STEPS = 5000;

/**
 * 🆕 Deep clone payload để đảm bảo step backward không bị drift.
 * shallow copy { ...res.value } không đủ vì variables là object lồng nhau.
 */
function deepClonePayload(payload: DebugStepPayload): DebugStepPayload {
  return {
    lineNumber: payload.lineNumber,
    arrayState: [...payload.arrayState],
    variables: { ...payload.variables },
    callStack: [...payload.callStack],
  };
}

export class LiveCompilerDebugger {
  private generatorInstance: Generator<DebugStepPayload, void, unknown> | null = null;
  private breakpoints: Set<number> = new Set();
  private currentStep: DebugStepPayload | null = null;
  private stepCount = 0;
  private history: DebugStepPayload[] = [];

  constructor(generatorFunc: () => Generator<DebugStepPayload, void, unknown>) {
    this.generatorInstance = generatorFunc();
  }

  /**
   * Cập nhật danh sách breakpoints.
   */
  setBreakpoints(lines: number[]): void {
    this.breakpoints = new Set(lines);
  }

  getActiveBreakpoints(): number[] {
    return Array.from(this.breakpoints);
  }

  /**
   * Step Forward — Tiến một nhịp yield kế tiếp.
   */
  stepForward(): DebugStepPayload | null {
    if (!this.generatorInstance) return null;

    const res = this.generatorInstance.next();

    if (res.done) {
      this.generatorInstance = null;
      this.currentStep = null;
      return null;
    }

    this.stepCount++;
    this.currentStep = res.value;
    this.history.push(deepClonePayload(res.value)); // 🆕 deep clone tránh drift
    return this.currentStep;
  }

  /**
   * Step Backward — Quay lại bước trước đó từ history.
   */
  stepBackward(): DebugStepPayload | null {
    if (this.history.length <= 1) return null;

    this.history.pop();
    const prevStep = this.history[this.history.length - 1];
    this.currentStep = prevStep;
    this.stepCount = this.history.length;
    return this.currentStep;
  }

  /**
   * Continue — Phát liên tục cho tới khi chạm breakpoint kế tiếp.
   */
  continueToNextBreakpoint(): DebugStepPayload | null {
    if (!this.generatorInstance) return null;

    let stepsCount = 0;

    while (stepsCount < MAX_CONTINUE_STEPS) {
      const res = this.generatorInstance.next();

      if (res.done) {
        this.generatorInstance = null;
        this.currentStep = null;
        return null;
      }

      const payload = res.value;
      stepsCount++;
      this.stepCount++;
      this.history.push(deepClonePayload(payload)); // 🆕 deep clone

      if (this.breakpoints.has(payload.lineNumber)) {
        this.currentStep = payload;
        return this.currentStep;
      }
    }

    throw new Error(
      `Continue vuot qua gioi han an toan ${MAX_CONTINUE_STEPS} buoc thuc thi! De quy qua sau hoac lap vo tan.`,
    );
  }

  /**
   * Step Out — Chạy cho tới khi callStack giảm depth (thoát hàm hiện tại).
   */
  stepOut(): DebugStepPayload | null {
    if (!this.generatorInstance || !this.currentStep) return null;

    const currentDepth = this.currentStep.callStack.length;
    let stepsCount = 0;

    while (stepsCount < MAX_CONTINUE_STEPS) {
      const res = this.generatorInstance.next();

      if (res.done) {
        this.generatorInstance = null;
        this.currentStep = null;
        return null;
      }

      const payload = res.value;
      stepsCount++;
      this.stepCount++;
      this.history.push(deepClonePayload(payload)); // 🆕 deep clone

      if (payload.callStack.length < currentDepth) {
        this.currentStep = payload;
        return this.currentStep;
      }
    }

    this.currentStep = this.history[this.history.length - 1] ?? null;
    return this.currentStep;
  }

  getCurrentStep(): DebugStepPayload | null {
    return this.currentStep;
  }

  getStepCount(): number {
    return this.stepCount;
  }

  getHistory(): DebugStepPayload[] {
    return [...this.history];
  }

  isFinished(): boolean {
    return this.generatorInstance === null;
  }

  reset(): void {
    this.generatorInstance = null;
    this.currentStep = null;
    this.stepCount = 0;
    this.history = [];
    this.breakpoints.clear();
  }
}
