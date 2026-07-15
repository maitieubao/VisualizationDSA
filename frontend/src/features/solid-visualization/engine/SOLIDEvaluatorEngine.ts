// ============================================================
// SOLIDEvaluatorEngine — SOLID Design Principle Evaluator
// Evaluates SRP (via LCOM4), LSP (substitution violation check)
// ============================================================

import type {
  SOLIDClassNode,
  SRPEvaluationResult,
  LSPEvaluationResult,
} from '../types/solid-visualization.types';
import { SRP_VIOLATION_THRESHOLD } from '../types/solid-visualization.types';
import { LCOMCalculator } from './LCOMCalculator';

export class SOLIDEvaluatorEngine {
  /**
   * Evaluates Single Responsibility Principle via LCOM4 metric.
   * LCOM4 >= 2 means the class has disconnected method groups (SRP violation).
   */
  public static evaluateSRP(node: SOLIDClassNode): SRPEvaluationResult {
    const lcom4 = LCOMCalculator.calculateLCOM4(node.members);
    return {
      isViolating: lcom4 >= SRP_VIOLATION_THRESHOLD,
      lcom4,
    };
  }

  /**
   * Evaluates Liskov Substitution Principle.
   * If a child class overrides a method but throws NotImplementedException,
   * substitution violates LSP.
   */
  public static evaluateLSP(
    baseMethodName: string,
    childMethodThrowsException: boolean
  ): LSPEvaluationResult {
    if (childMethodThrowsException) {
      return {
        isViolating: true,
        errorReason: `LISKOV_VIOLATION: Lớp con ghi đè phương thức '${baseMethodName}' nhưng ném lỗi 'NotImplementedException'. Không thể dùng thay thế lớp cha!`,
      };
    }
    return { isViolating: false };
  }
}
