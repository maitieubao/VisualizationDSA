import { describe, it, expect } from 'vitest';
import { SOLIDEvaluatorEngine } from '../engine/SOLIDEvaluatorEngine';
import type { SOLIDClassNode } from '../types/solid-visualization.types';

describe('SOLIDEvaluatorEngine', () => {
  describe('evaluateSRP', () => {
    it('should report SRP PASS for a perfectly cohesive class (LCOM4 = 1)', () => {
      const node: SOLIDClassNode = {
        nodeId: 'user-repo',
        className: 'UserRepository',
        members: [
          { name: 'dbConn', type: 'FIELD', accessedFields: [] },
          { name: 'saveUser', type: 'METHOD', accessedFields: ['dbConn'] },
          { name: 'findUser', type: 'METHOD', accessedFields: ['dbConn'] },
        ],
        cohesionScore: 0,
        isViolatingSRP: false,
      };

      const result = SOLIDEvaluatorEngine.evaluateSRP(node);
      expect(result.isViolating).toBe(false);
      expect(result.lcom4).toBe(1);
    });

    it('should report SRP VIOLATION for a God Class (LCOM4 = 2)', () => {
      const node: SOLIDClassNode = {
        nodeId: 'user-manager',
        className: 'UserManager',
        members: [
          { name: 'dbConn', type: 'FIELD', accessedFields: [] },
          { name: 'smtpServer', type: 'FIELD', accessedFields: [] },
          { name: 'saveUser', type: 'METHOD', accessedFields: ['dbConn'] },
          { name: 'sendWelcomeEmail', type: 'METHOD', accessedFields: ['smtpServer'] },
        ],
        cohesionScore: 0,
        isViolatingSRP: false,
      };

      const result = SOLIDEvaluatorEngine.evaluateSRP(node);
      expect(result.isViolating).toBe(true);
      expect(result.lcom4).toBe(2);
    });

    it('should report SRP VIOLATION for a class with LCOM4 = 3', () => {
      const node: SOLIDClassNode = {
        nodeId: 'mega-class',
        className: 'MegaClass',
        members: [
          { name: 'db', type: 'FIELD', accessedFields: [] },
          { name: 'hash', type: 'FIELD', accessedFields: [] },
          { name: 'smtp', type: 'FIELD', accessedFields: [] },
          { name: 'saveUser', type: 'METHOD', accessedFields: ['db'] },
          { name: 'hashPassword', type: 'METHOD', accessedFields: ['hash'] },
          { name: 'sendEmail', type: 'METHOD', accessedFields: ['smtp'] },
        ],
        cohesionScore: 0,
        isViolatingSRP: false,
      };

      const result = SOLIDEvaluatorEngine.evaluateSRP(node);
      expect(result.isViolating).toBe(true);
      expect(result.lcom4).toBe(3);
    });

    it('should handle class with no methods (LCOM4 = 0, not violating)', () => {
      const node: SOLIDClassNode = {
        nodeId: 'empty',
        className: 'EmptyClass',
        members: [
          { name: 'field1', type: 'FIELD', accessedFields: [] },
        ],
        cohesionScore: 0,
        isViolatingSRP: false,
      };

      const result = SOLIDEvaluatorEngine.evaluateSRP(node);
      expect(result.isViolating).toBe(false);
      expect(result.lcom4).toBe(0);
    });

    it('should handle class with a single method', () => {
      const node: SOLIDClassNode = {
        nodeId: 'single',
        className: 'SingleMethod',
        members: [
          { name: 'f', type: 'FIELD', accessedFields: [] },
          { name: 'doWork', type: 'METHOD', accessedFields: ['f'] },
        ],
        cohesionScore: 0,
        isViolatingSRP: false,
      };

      const result = SOLIDEvaluatorEngine.evaluateSRP(node);
      expect(result.isViolating).toBe(false);
      expect(result.lcom4).toBe(1);
    });
  });

  describe('evaluateLSP', () => {
    it('should report LSP VIOLATION when child throws NotImplementedException', () => {
      const result = SOLIDEvaluatorEngine.evaluateLSP('fly', true);
      expect(result.isViolating).toBe(true);
      expect(result.errorReason).toContain('LISKOV_VIOLATION');
    });

    it('should include method name in error reason', () => {
      const result = SOLIDEvaluatorEngine.evaluateLSP('fly', true);
      expect(result.errorReason).toContain("'fly'");
    });

    it('should include NotImplementedException in error reason', () => {
      const result = SOLIDEvaluatorEngine.evaluateLSP('fly', true);
      expect(result.errorReason).toContain('NotImplementedException');
    });

    it('should report LSP PASS when child does not throw exception', () => {
      const result = SOLIDEvaluatorEngine.evaluateLSP('fly', false);
      expect(result.isViolating).toBe(false);
      expect(result.errorReason).toBeUndefined();
    });

    it('should work with different method names', () => {
      const result = SOLIDEvaluatorEngine.evaluateLSP('swim', true);
      expect(result.isViolating).toBe(true);
      expect(result.errorReason).toContain("'swim'");
    });

    it('should return non-violating for valid substitution with any method', () => {
      const result = SOLIDEvaluatorEngine.evaluateLSP('draw', false);
      expect(result.isViolating).toBe(false);
    });
  });
});
