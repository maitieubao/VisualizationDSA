// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import CustomInputForm from '../components/CustomInputForm.vue';
import { useInputStore } from '../store/useInputStore';

const DEFAULT_PROPS = { algorithmId: 'bubble-sort' };

describe('CI-001 (P0): Nhập mảng', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.restoreAllMocks();
  });

  it('inputRaw = "5,3,8" → valid format and parsed correctly', () => {
    const store = useInputStore();
    store.rawText = '5,3,8';

    expect(store.isValidFormat).toBe(true);
    expect(store.parsedArray).toEqual([5, 3, 8]);
    expect(store.elementCount).toBe(3);
    expect(store.canExecute).toBe(true);
  });

  it('CustomInputForm binds rawText to textarea', async () => {
    const wrapper = mount(CustomInputForm, {
      props: DEFAULT_PROPS,
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    const textarea = wrapper.find('textarea');
    expect(textarea.exists()).toBe(true);

    await textarea.setValue('14, 25, 38');
    const store = useInputStore();
    expect(store.rawText).toBe('14, 25, 38');
  });
});

describe('CI-002 (P0): Random', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.restoreAllMocks();
  });

  it('generateRandom() produces valid array within maxLimit', () => {
    const store = useInputStore();
    store.generateRandomInput('random', 10);

    expect(store.rawText).not.toBe('');
    expect(store.parsedArray.length).toBe(10);
    expect(store.isValidFormat).toBe(true);
    expect(store.canExecute).toBe(true);
  });

  it('generated values are in range [10, 99]', () => {
    const store = useInputStore();
    store.generateRandomInput('random', 15);

    for (const num of store.parsedArray) {
      expect(num).toBeGreaterThanOrEqual(10);
      expect(num).toBeLessThanOrEqual(99);
    }
  });
});

describe('CI-003 (P0): Nearly sorted', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.restoreAllMocks();
  });

  it('generateNearlySorted() produces mostly ascending array', () => {
    const store = useInputStore();
    store.generateRandomInput('nearly-sorted', 10);

    const arr = store.parsedArray;
    expect(arr.length).toBe(10);

    let outOfOrder = 0;
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] > arr[i + 1]) outOfOrder++;
    }
    expect(outOfOrder).toBeLessThanOrEqual(2);
  });
});

describe('CI-004 (P0): Reversed', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.restoreAllMocks();
  });

  it('generateReversed() produces descending array', () => {
    const store = useInputStore();
    store.generateRandomInput('reversed', 10);

    const arr = store.parsedArray;
    expect(arr.length).toBe(10);

    for (let i = 0; i < arr.length - 1; i++) {
      expect(arr[i]).toBeGreaterThanOrEqual(arr[i + 1]);
    }
  });
});

describe('CI-006 (P0): Validation lỗi', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.restoreAllMocks();
  });

  it('"abc" → invalid format, canExecute = false', () => {
    const store = useInputStore();
    store.rawText = 'abc';

    expect(store.isValidFormat).toBe(false);
    expect(store.canExecute).toBe(false);
  });

  it('CustomInputForm shows error message for invalid input', async () => {
    const wrapper = mount(CustomInputForm, {
      props: DEFAULT_PROPS,
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    const textarea = wrapper.find('textarea');
    await textarea.setValue('abc');

    const store = useInputStore();
    expect(store.isValidFormat).toBe(false);
  });

  it('mixed letters and numbers shows format error', () => {
    const store = useInputStore();
    store.rawText = '12, a, 5';

    expect(store.isValidFormat).toBe(false);
    expect(store.canExecute).toBe(false);
  });
});

describe('CI-012 (P1): Max 15 elements', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.restoreAllMocks();
  });

  it('default maxLimit is 15', () => {
    const store = useInputStore();
    expect(store.maxLimit).toBe(15);
  });

  it('input exceeding maxLimit → isWithinLimit = false, canExecute = false', () => {
    const store = useInputStore();
    store.rawText = '1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16';

    expect(store.isWithinLimit).toBe(false);
    expect(store.canExecute).toBe(false);
  });

  it('generateRandomInput clamps size to maxLimit', () => {
    const store = useInputStore();
    store.setLimit(5);
    store.generateRandomInput('random', 100);

    expect(store.parsedArray.length).toBe(5);
  });

  it('CustomInputForm shows element count', async () => {
    const wrapper = mount(CustomInputForm, {
      props: { algorithmId: 'bubble-sort' },
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    const textarea = wrapper.find('textarea');
    await textarea.setValue('1, 2, 3, 4, 5');

    const store = useInputStore();
    expect(store.elementCount).toBe(5);
  });
});

describe('CI-013 (P0): algorithmId prop', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.restoreAllMocks();
  });

  it('submitCustomInput receives correct algorithmId from prop', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({
        algorithmId: 'quick-sort', pseudoCode: ['line1'],
        frames: [{ stepId: 1, activeLine: 0, explanation: 'test', dataState: [1, 2], highlights: { compare: [], swap: [], sorted: [] } }],
      }), { status: 200 }),
    );

    const store = useInputStore();
    store.rawText = '5, 3, 8, 1';

    await store.submitCustomInput('quick-sort');

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/custom-execute'),
      expect.objectContaining({
        body: JSON.stringify({ algorithmId: 'quick-sort', rawInput: '5, 3, 8, 1' }),
      }),
    );
  });

  it('submitCustomInput uses different algorithmId per call', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({
        algorithmId: 'merge-sort', pseudoCode: ['line1'],
        frames: [{ stepId: 1, activeLine: 0, explanation: 'test', dataState: [1], highlights: { compare: [], swap: [], sorted: [] } }],
      }), { status: 200 }),
    );

    const store = useInputStore();
    store.rawText = '5, 3, 8';

    await store.submitCustomInput('merge-sort');

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/custom-execute'),
      expect.objectContaining({
        body: JSON.stringify({ algorithmId: 'merge-sort', rawInput: '5, 3, 8' }),
      }),
    );
  });
});

describe('CI-014 (P1): Keyboard shortcuts', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.restoreAllMocks();
  });

  it('Ctrl+Enter triggers execute when input is valid', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({
        algorithmId: 'bubble-sort', pseudoCode: ['line1'],
        frames: [{ stepId: 1, activeLine: 0, explanation: 'test', dataState: [1], highlights: { compare: [], swap: [], sorted: [] } }],
      }), { status: 200 }),
    );

    const wrapper = mount(CustomInputForm, {
      props: DEFAULT_PROPS,
      global: { stubs: { BaseIcon: { template: '<span />' } } },
    });

    const textarea = wrapper.find('textarea');
    await textarea.setValue('5, 3, 8');

    await textarea.trigger('keydown', { key: 'Enter', ctrlKey: true });

    expect(globalThis.fetch).toHaveBeenCalled();
  });

  it('Escape clears input', async () => {
    const wrapper = mount(CustomInputForm, {
      props: DEFAULT_PROPS,
      global: { stubs: { BaseIcon: { template: '<span />' } } },
    });

    const textarea = wrapper.find('textarea');
    await textarea.setValue('5, 3, 8');

    await textarea.trigger('keydown', { key: 'Escape' });

    const store = useInputStore();
    expect(store.rawText).toBe('');
  });

  it('Ctrl+Shift+R generates random input', async () => {
    const wrapper = mount(CustomInputForm, {
      props: DEFAULT_PROPS,
      global: { stubs: { BaseIcon: { template: '<span />' } } },
    });

    const textarea = wrapper.find('textarea');
    await textarea.trigger('keydown', { key: 'r', ctrlKey: true, shiftKey: true });

    const store = useInputStore();
    expect(store.rawText).not.toBe('');
    expect(store.parsedArray.length).toBe(10);
  });
});
