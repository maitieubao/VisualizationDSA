// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { WorkspaceStateCompressor } from '../engine/WorkspaceStateCompressor';
import type { WorkspaceState } from '../types/export-share.types';
import { MAX_COMPRESSED_STATE_LENGTH } from '../types/export-share.types';

describe('WorkspaceStateCompressor', () => {
  const sampleState: WorkspaceState = {
    algorithmId: 'quicksort-recursion',
    layoutNodes: [
      { id: 'Client', x: 150, y: 80 },
      { id: 'Strategy', x: 300, y: 220 },
    ],
    currentStepIndex: 12,
  };

  describe('serializeState', () => {
    it('should compress state to a non-empty string', () => {
      const compressed = WorkspaceStateCompressor.serializeState(sampleState);
      expect(compressed).toBeTruthy();
      expect(compressed.length).toBeGreaterThan(0);
    });

    it('should produce a compressed string shorter than raw JSON for large states', () => {
      const largeState: WorkspaceState = {
        algorithmId: 'quicksort-recursion-large-test',
        layoutNodes: Array.from({ length: 30 }, (_, i) => ({
          id: `node-${i}`,
          x: i * 10,
          y: i * 5,
        })),
        currentStepIndex: 12,
      };
      const compressed = WorkspaceStateCompressor.serializeState(largeState);
      const rawJson = JSON.stringify(largeState);
      expect(compressed.length).toBeLessThan(rawJson.length);
    });

    it('should produce URL-safe encoded string (no +, /, = chars)', () => {
      const compressed = WorkspaceStateCompressor.serializeState(sampleState);
      expect(compressed).not.toContain('+');
      expect(compressed).not.toContain('/');
    });

    it('should produce different outputs for different states', () => {
      const stateA: WorkspaceState = {
        algorithmId: 'bubble-sort',
        layoutNodes: [{ id: 'A', x: 0, y: 0 }],
        currentStepIndex: 0,
      };
      const stateB: WorkspaceState = {
        algorithmId: 'merge-sort',
        layoutNodes: [{ id: 'B', x: 100, y: 100 }],
        currentStepIndex: 5,
      };
      const compA = WorkspaceStateCompressor.serializeState(stateA);
      const compB = WorkspaceStateCompressor.serializeState(stateB);
      expect(compA).not.toBe(compB);
    });

    it('should handle state with empty layoutNodes', () => {
      const emptyState: WorkspaceState = {
        algorithmId: 'empty-test',
        layoutNodes: [],
        currentStepIndex: 0,
      };
      const compressed = WorkspaceStateCompressor.serializeState(emptyState);
      expect(compressed).toBeTruthy();
    });

    it('should handle state with many nodes', () => {
      const bigState: WorkspaceState = {
        algorithmId: 'large-graph',
        layoutNodes: Array.from({ length: 100 }, (_, i) => ({
          id: `node-${i}`,
          x: i * 10,
          y: i * 5,
        })),
        currentStepIndex: 50,
      };
      const compressed = WorkspaceStateCompressor.serializeState(bigState);
      expect(compressed).toBeTruthy();
      expect(compressed.length).toBeGreaterThan(0);
    });
  });

  describe('deserializeState', () => {
    it('should perfectly restore all fields from compressed string', () => {
      const compressed = WorkspaceStateCompressor.serializeState(sampleState);
      const restored = WorkspaceStateCompressor.deserializeState(compressed);

      expect(restored).not.toBeNull();
      expect(restored!.algorithmId).toBe('quicksort-recursion');
      expect(restored!.currentStepIndex).toBe(12);
      expect(restored!.layoutNodes).toHaveLength(2);
    });

    it('should preserve exact node coordinates (zero data loss)', () => {
      const compressed = WorkspaceStateCompressor.serializeState(sampleState);
      const restored = WorkspaceStateCompressor.deserializeState(compressed);

      expect(restored!.layoutNodes[0].id).toBe('Client');
      expect(restored!.layoutNodes[0].x).toBe(150);
      expect(restored!.layoutNodes[0].y).toBe(80);
      expect(restored!.layoutNodes[1].id).toBe('Strategy');
      expect(restored!.layoutNodes[1].x).toBe(300);
      expect(restored!.layoutNodes[1].y).toBe(220);
    });

    it('should return null for empty string', () => {
      const result = WorkspaceStateCompressor.deserializeState('');
      expect(result).toBeNull();
    });

    it('should return null for invalid compressed string', () => {
      const result = WorkspaceStateCompressor.deserializeState('not-valid-compressed-data-xyz');
      expect(result).toBeNull();
    });

    it('should handle round-trip with large state correctly', () => {
      const bigState: WorkspaceState = {
        algorithmId: 'dip-sandbox-complex',
        layoutNodes: Array.from({ length: 50 }, (_, i) => ({
          id: `Class-${i}`,
          x: Math.round(Math.random() * 1000),
          y: Math.round(Math.random() * 800),
        })),
        currentStepIndex: 42,
      };
      const compressed = WorkspaceStateCompressor.serializeState(bigState);
      const restored = WorkspaceStateCompressor.deserializeState(compressed);

      expect(restored).not.toBeNull();
      expect(restored!.algorithmId).toBe('dip-sandbox-complex');
      expect(restored!.layoutNodes).toHaveLength(50);
      expect(restored!.currentStepIndex).toBe(42);
    });

    it('should log error for corrupted data and return null', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const result = WorkspaceStateCompressor.deserializeState('{{corrupted}}');
      expect(result).toBeNull();
      consoleSpy.mockRestore();
    });
  });

  describe('isWithinSizeLimit', () => {
    it('should return true for short compressed strings', () => {
      const compressed = WorkspaceStateCompressor.serializeState(sampleState);
      expect(WorkspaceStateCompressor.isWithinSizeLimit(compressed)).toBe(true);
    });

    it('should return true for string at exactly the limit', () => {
      const exactLimitString = 'a'.repeat(MAX_COMPRESSED_STATE_LENGTH);
      expect(WorkspaceStateCompressor.isWithinSizeLimit(exactLimitString)).toBe(true);
    });

    it('should return false for string exceeding the limit', () => {
      const overLimitString = 'a'.repeat(MAX_COMPRESSED_STATE_LENGTH + 1);
      expect(WorkspaceStateCompressor.isWithinSizeLimit(overLimitString)).toBe(false);
    });

    it('should return true for empty string', () => {
      expect(WorkspaceStateCompressor.isWithinSizeLimit('')).toBe(true);
    });
  });

  describe('serializeStateWithValidation', () => {
    it('should return compressed string for normal-sized state', () => {
      const result = WorkspaceStateCompressor.serializeStateWithValidation(sampleState);
      expect(result).not.toBeNull();
      expect(result!.length).toBeGreaterThan(0);
    });

    it('should return null and warn for oversized state', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const hugeState: WorkspaceState = {
        algorithmId: 'overflow-test',
        layoutNodes: Array.from({ length: 5000 }, (_, i) => ({
          id: `massive-node-with-a-really-long-identifier-${i}-extra-padding-data`,
          x: i * 100,
          y: i * 100,
        })),
        currentStepIndex: 999,
      };
      const result = WorkspaceStateCompressor.serializeStateWithValidation(hugeState);
      expect(result).toBeNull();
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it('should validate round-trip integrity of returned string', () => {
      const result = WorkspaceStateCompressor.serializeStateWithValidation(sampleState);
      expect(result).not.toBeNull();
      const restored = WorkspaceStateCompressor.deserializeState(result!);
      expect(restored).not.toBeNull();
      expect(restored!.algorithmId).toBe(sampleState.algorithmId);
    });
  });
});
