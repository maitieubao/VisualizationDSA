import { describe, it, expect, vi, beforeEach } from 'vitest';
import { executeDSAAlgorithm } from '../services/dsaApi';

describe('dsaApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('falls back to dummy result when API is unavailable', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'));

    const result = await executeDSAAlgorithm('bubble-sort', [5, 3, 1]);

    expect(result.algorithmId).toBe('bubble-sort');
    expect(result.frames.length).toBeGreaterThan(0);
    expect(result.pseudoCode.length).toBeGreaterThan(0);
  });

  it('returns API result when available', async () => {
    const mockResult = {
      algorithmId: 'bubble-sort',
      pseudoCode: ['line 1'],
      frames: [{ stepId: 1, activeLine: 0, explanation: 'test', dataState: [1], highlights: { compare: [], swap: [], sorted: [], dimmed: [], active: [] } }],
    };

    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResult),
    } as Response);

    const result = await executeDSAAlgorithm('bubble-sort', [5, 3, 1]);
    expect(result.algorithmId).toBe('bubble-sort');
    expect(result.frames.length).toBe(1);
  });

  it('falls back on HTTP error status', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
    } as Response);

    const result = await executeDSAAlgorithm('bubble-sort', [5, 3, 1]);

    expect(result.algorithmId).toBe('bubble-sort');
    expect(result.frames.length).toBeGreaterThan(0);
  });
});
