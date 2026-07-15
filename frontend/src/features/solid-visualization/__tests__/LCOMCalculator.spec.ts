import { describe, it, expect } from 'vitest';
import { LCOMCalculator } from '../engine/LCOMCalculator';
import type { UMLClassMember } from '../types/solid-visualization.types';

describe('LCOMCalculator', () => {
  describe('calculateLCOM4', () => {
    it('should return 0 when there are no methods', () => {
      const members: UMLClassMember[] = [
        { name: 'field1', type: 'FIELD', accessedFields: [] },
      ];
      expect(LCOMCalculator.calculateLCOM4(members)).toBe(0);
    });

    it('should return 1 for a perfectly cohesive class (all methods share fields)', () => {
      const members: UMLClassMember[] = [
        { name: 'dbConn', type: 'FIELD', accessedFields: [] },
        { name: 'saveUser', type: 'METHOD', accessedFields: ['dbConn'] },
        { name: 'findUser', type: 'METHOD', accessedFields: ['dbConn'] },
      ];
      expect(LCOMCalculator.calculateLCOM4(members)).toBe(1);
    });

    it('should return 2 for a class with two disconnected method groups (SRP violation)', () => {
      const members: UMLClassMember[] = [
        { name: 'dbConn', type: 'FIELD', accessedFields: [] },
        { name: 'smtpServer', type: 'FIELD', accessedFields: [] },
        { name: 'saveUser', type: 'METHOD', accessedFields: ['dbConn'] },
        { name: 'sendWelcomeEmail', type: 'METHOD', accessedFields: ['smtpServer'] },
      ];
      expect(LCOMCalculator.calculateLCOM4(members)).toBe(2);
    });

    it('should return 3 for a God Class with three disconnected groups', () => {
      const members: UMLClassMember[] = [
        { name: 'dbConn', type: 'FIELD', accessedFields: [] },
        { name: 'hasher', type: 'FIELD', accessedFields: [] },
        { name: 'smtpServer', type: 'FIELD', accessedFields: [] },
        { name: 'saveUser', type: 'METHOD', accessedFields: ['dbConn'] },
        { name: 'findUser', type: 'METHOD', accessedFields: ['dbConn'] },
        { name: 'hashPassword', type: 'METHOD', accessedFields: ['hasher'] },
        { name: 'sendWelcomeEmail', type: 'METHOD', accessedFields: ['smtpServer'] },
      ];
      expect(LCOMCalculator.calculateLCOM4(members)).toBe(3);
    });

    it('should return 1 when a single method exists (trivially connected)', () => {
      const members: UMLClassMember[] = [
        { name: 'field1', type: 'FIELD', accessedFields: [] },
        { name: 'doSomething', type: 'METHOD', accessedFields: ['field1'] },
      ];
      expect(LCOMCalculator.calculateLCOM4(members)).toBe(1);
    });

    it('should return 1 when methods are transitively connected through shared fields', () => {
      const members: UMLClassMember[] = [
        { name: 'fieldA', type: 'FIELD', accessedFields: [] },
        { name: 'fieldB', type: 'FIELD', accessedFields: [] },
        { name: 'method1', type: 'METHOD', accessedFields: ['fieldA'] },
        { name: 'method2', type: 'METHOD', accessedFields: ['fieldA', 'fieldB'] },
        { name: 'method3', type: 'METHOD', accessedFields: ['fieldB'] },
      ];
      expect(LCOMCalculator.calculateLCOM4(members)).toBe(1);
    });

    it('should handle methods with no accessed fields as isolated components', () => {
      const members: UMLClassMember[] = [
        { name: 'method1', type: 'METHOD', accessedFields: [] },
        { name: 'method2', type: 'METHOD', accessedFields: [] },
      ];
      expect(LCOMCalculator.calculateLCOM4(members)).toBe(2);
    });

    it('should handle empty members array', () => {
      expect(LCOMCalculator.calculateLCOM4([])).toBe(0);
    });

    it('should only count METHOD members for graph construction (ignore FIELDs)', () => {
      const members: UMLClassMember[] = [
        { name: 'field1', type: 'FIELD', accessedFields: [] },
        { name: 'field2', type: 'FIELD', accessedFields: [] },
        { name: 'field3', type: 'FIELD', accessedFields: [] },
      ];
      expect(LCOMCalculator.calculateLCOM4(members)).toBe(0);
    });

    it('should handle a large class with many connected methods', () => {
      const members: UMLClassMember[] = [
        { name: 'sharedField', type: 'FIELD', accessedFields: [] },
        { name: 'method1', type: 'METHOD', accessedFields: ['sharedField'] },
        { name: 'method2', type: 'METHOD', accessedFields: ['sharedField'] },
        { name: 'method3', type: 'METHOD', accessedFields: ['sharedField'] },
        { name: 'method4', type: 'METHOD', accessedFields: ['sharedField'] },
        { name: 'method5', type: 'METHOD', accessedFields: ['sharedField'] },
      ];
      expect(LCOMCalculator.calculateLCOM4(members)).toBe(1);
    });

    it('should correctly identify 4 disconnected groups', () => {
      const members: UMLClassMember[] = [
        { name: 'f1', type: 'FIELD', accessedFields: [] },
        { name: 'f2', type: 'FIELD', accessedFields: [] },
        { name: 'f3', type: 'FIELD', accessedFields: [] },
        { name: 'f4', type: 'FIELD', accessedFields: [] },
        { name: 'm1', type: 'METHOD', accessedFields: ['f1'] },
        { name: 'm2', type: 'METHOD', accessedFields: ['f2'] },
        { name: 'm3', type: 'METHOD', accessedFields: ['f3'] },
        { name: 'm4', type: 'METHOD', accessedFields: ['f4'] },
      ];
      expect(LCOMCalculator.calculateLCOM4(members)).toBe(4);
    });

    it('should handle methods sharing multiple fields', () => {
      const members: UMLClassMember[] = [
        { name: 'fa', type: 'FIELD', accessedFields: [] },
        { name: 'fb', type: 'FIELD', accessedFields: [] },
        { name: 'fc', type: 'FIELD', accessedFields: [] },
        { name: 'm1', type: 'METHOD', accessedFields: ['fa', 'fb'] },
        { name: 'm2', type: 'METHOD', accessedFields: ['fb', 'fc'] },
        { name: 'm3', type: 'METHOD', accessedFields: ['fa', 'fc'] },
      ];
      expect(LCOMCalculator.calculateLCOM4(members)).toBe(1);
    });
  });
});
