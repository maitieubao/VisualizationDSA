// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { nextTick } from 'vue';
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils';
import LessonStepCodeLab from '../../../views/lesson/components/LessonStepCodeLab.vue';
import type { CodeLabTask } from '../types/lesson.types';
import type { CodelabCaseResult, CodelabRunResult } from '../utils/codelabExecutor';

const { editorMock } = vi.hoisted(() => {
  let codeValue = '';
  return {
    editorMock: {
      getValue: vi.fn(() => codeValue),
      setValue: vi.fn((v: string) => { codeValue = v; }),
      dispose: vi.fn(),
    },
  };
});

vi.mock('@monaco-editor/loader', () => ({
  default: { init: vi.fn(async () => ({ editor: { create: vi.fn(() => editorMock) } })) },
}));

vi.mock('../utils/codelabExecutor', () => ({
  runCodelabTask: vi.fn(),
}));

import { runCodelabTask } from '../utils/codelabExecutor';

const mockedRun = vi.mocked(runCodelabTask);

const TASK: CodeLabTask = {
  description: 'Hoàn thiện hàm bubbleSort để sắp xếp mảng tăng dần.',
  initialCode: 'function bubbleSort(arr) { return arr; }',
  solution: 'function bubbleSort(arr) { for (let i = 0; i < arr.length; i++) { for (let j = 0; j < arr.length - i - 1; j++) { if (arr[j] > arr[j + 1]) { [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]; } } } return arr; }',
  testCases: [
    { input: '[[5, 2, 9, 1]]', expectedOutput: '[1, 2, 5, 9]' },
    { input: '[[]]', expectedOutput: '[]', isHidden: true },
  ],
  entryFunction: 'bubbleSort',
  hints: ['Gợi ý 1: so sánh từng cặp liền kề', 'Gợi ý 2: lặp lại n-1 lần'],
};

const PASSED_RESULTS: CodelabCaseResult[] = [
  { input: '[[5, 2, 9, 1]]', expectedOutput: '[1, 2, 5, 9]', actualOutput: '[1, 2, 5, 9]', passed: true, isHidden: false },
  { input: '[[]]', expectedOutput: '[]', actualOutput: '[]', passed: true, isHidden: true },
];

let wrapper: VueWrapper | null = null;

function mountComponent(): VueWrapper {
  return mount(LessonStepCodeLab, {
    props: { problemTitle: 'Bubble Sort', codelabTask: TASK },
    global: {
      components: { BaseIcon: { name: 'BaseIcon', props: ['name'], template: '<svg></svg>' } },
    },
  });
}

describe('LessonStepCodeLab.vue — run/submit/reset/hint (LM-017)', () => {
  beforeEach(() => {
    mockedRun.mockReset();
    vi.clearAllMocks();
    wrapper = null;
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
  });

  it('LM-017: run success → allPassed → Submit mở khóa → emit completeLesson', async () => {
    mockedRun.mockResolvedValueOnce({ ok: true, results: PASSED_RESULTS });
    mockedRun.mockResolvedValueOnce({ ok: true, results: PASSED_RESULTS });
    wrapper = mountComponent();
    await flushPromises();

    await wrapper.findAll('button').find(b => b.text().includes('Run Testcases'))!.trigger('click');
    await flushPromises();

    expect(wrapper.text()).toContain('PASSED');
    const submitBtn = wrapper.findAll('button').find(b => b.text().includes('Submit Solution'));
    expect(submitBtn).toBeTruthy();
    expect(submitBtn!.attributes('disabled')).toBeUndefined();

    await submitBtn!.trigger('click');
    await flushPromises();

    expect(wrapper.emitted('completeLesson')).toBeTruthy();
    expect(mockedRun).toHaveBeenCalledTimes(2);
  });

  it('LM-017: timedOut → runError hiển thị + Submit bị khóa', async () => {
    mockedRun.mockResolvedValueOnce({ ok: false, timedOut: true, error: 'Hết thời gian chạy (1500ms). Code có thể bị vòng lặp vô hạn!', results: [] });
    wrapper = mountComponent();
    await flushPromises();

    await wrapper.findAll('button').find(b => b.text().includes('Run Testcases'))!.trigger('click');
    await flushPromises();

    expect(wrapper.text()).toContain('Hết thời gian chạy');
    expect(wrapper.text()).toContain('Chạy testcases để mở khóa');
    const submitBtn = wrapper.findAll('button').find(b => b.text().includes('Chạy testcases để mở khóa'));
    expect(submitBtn!.attributes('disabled')).toBeDefined();
  });

  it('LM-017: compile-error (ok:false) → runError hiển thị + Submit bị khóa', async () => {
    mockedRun.mockResolvedValueOnce({ ok: false, error: 'Lỗi biên dịch code: unexpected token', results: [] });
    wrapper = mountComponent();
    await flushPromises();

    await wrapper.findAll('button').find(b => b.text().includes('Run Testcases'))!.trigger('click');
    await flushPromises();

    expect(wrapper.text()).toContain('Lỗi biên dịch code');
    expect(wrapper.findAll('button').some(b => b.text().includes('Submit Solution'))).toBe(false);
  });

  it('LM-017: resetCode khôi phục initialCode + xóa caseResults/runError', async () => {
    mockedRun.mockResolvedValueOnce({ ok: true, results: PASSED_RESULTS });
    wrapper = mountComponent();
    await flushPromises();

    editorMock.setValue('function bubbleSort(arr) { return arr.slice().sort(); }');
    await wrapper.findAll('button').find(b => b.text().includes('Run Testcases'))!.trigger('click');
    await flushPromises();
    expect(wrapper.text()).toContain('PASSED');

    editorMock.setValue.mockClear();
    await wrapper.findAll('button').find(b => b.text().includes('Reset to Starter Code'))!.trigger('click');

    expect(editorMock.setValue).toHaveBeenCalledWith(TASK.initialCode);
    expect(wrapper.text()).toContain('Bấm Run để chạy testcases.');
    expect(wrapper.text()).not.toContain('PASSED');
  });

  it('LM-017: hint toggle — Xem hiển thị gợi ý, Ẩn giấu lại', async () => {
    wrapper = mountComponent();
    await flushPromises();

    await wrapper.findAll('button').find(b => b.text() === 'Hints')!.trigger('click');
    expect(wrapper.text()).not.toContain('Gợi ý 1: so sánh từng cặp liền kề');

    await wrapper.findAll('button').find(b => b.text() === 'Xem')!.trigger('click');
    expect(wrapper.text()).toContain('Gợi ý 1: so sánh từng cặp liền kề');
    expect(wrapper.text()).not.toContain('Gợi ý 2: lặp lại n-1 lần');

    await wrapper.findAll('button').find(b => b.text() === 'Ẩn')!.trigger('click');
    expect(wrapper.text()).not.toContain('Gợi ý 1: so sánh từng cặp liền kề');
  });

  it('LM-068: nút Reset bị disabled khi đang chạy (isRunning)', async () => {
    let resolveRun!: (r: CodelabRunResult) => void;
    mockedRun.mockReturnValueOnce(new Promise<CodelabRunResult>((res) => { resolveRun = res; }));
    wrapper = mountComponent();
    await flushPromises();

    await wrapper.findAll('button').find(b => b.text().includes('Run Testcases'))!.trigger('click');
    await nextTick();

    const resetBtn = wrapper.findAll('button').find(b => b.text().includes('Reset to Starter Code'));
    expect(resetBtn!.attributes('disabled')).toBeDefined();

    resolveRun({ ok: true, results: PASSED_RESULTS });
    await flushPromises();
    expect(wrapper.text()).toContain('PASSED');
  });
});
