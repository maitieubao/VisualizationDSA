// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { mount, flushPromises } from '@vue/test-utils';
import { useBenchmarkStore } from '../store/useBenchmarkStore';
import { compareAlgorithms } from '../services/benchmarkApi';
import BenchmarkLabView from '@/views/benchmark/BenchmarkLabView.vue';
import type { CompareResultDto } from '../types';

vi.mock('../services/benchmarkApi', () => ({
  compareAlgorithms: vi.fn(),
}));

const mockCompare = vi.mocked(compareAlgorithms);

const sampleResults: CompareResultDto[] = [
  {
    algorithmId: 'bubble-sort',
    name: 'Bubble Sort (Sắp xếp nổi bọt)',
    elapsedMs: 12.5,
    frameCount: 28,
    timeComplexity: 'O(N²)',
    spaceComplexity: 'O(1)',
    error: null,
  },
  {
    algorithmId: 'quick-sort',
    name: 'Quick Sort (Sắp xếp nhanh)',
    elapsedMs: 3.25,
    frameCount: 19,
    timeComplexity: 'O(N log N)',
    spaceComplexity: 'O(log N)',
    error: null,
  },
];

describe('Benchmark Lab P0', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mockCompare.mockReset();
  });

  it('store nhận kết quả từ API compare', async () => {
    mockCompare.mockResolvedValue(sampleResults);

    const store = useBenchmarkStore();
    store.selectedIds = ['bubble-sort', 'quick-sort'];
    store.inputText = '5, 3, 8, 1';

    await store.runComparison();

    expect(mockCompare).toHaveBeenCalledWith({
      algorithmIds: ['bubble-sort', 'quick-sort'],
      inputData: [5, 3, 8, 1],
    });
    expect(store.results).toEqual(sampleResults);
    expect(store.isLoading).toBe(false);
  });

  it('báo lỗi khi chọn ít hơn 2 thuật toán', async () => {
    const store = useBenchmarkStore();
    store.selectedIds = ['bubble-sort'];
    store.inputText = '5, 3, 8';

    await store.runComparison();

    expect(store.error).toContain('2');
    expect(mockCompare).not.toHaveBeenCalled();
  });

  it('view render bảng kết quả sau khi chạy so sánh', async () => {
    mockCompare.mockResolvedValue(sampleResults);

    const wrapper = mount(BenchmarkLabView, {
      global: {
        stubs: { BaseIcon: true },
      },
    });

    const store = useBenchmarkStore();
    store.selectedIds = ['bubble-sort', 'quick-sort'];
    store.inputText = '5, 3, 8, 1';
    await wrapper.vm.$nextTick();

    await wrapper.find('.benchmark-run-btn').trigger('click');
    await flushPromises();

    expect(wrapper.find('.benchmark-table').exists()).toBe(true);

    const rows = wrapper.findAll('.benchmark-row');
    expect(rows.length).toBe(2);
    expect(rows[0].text()).toContain('Bubble Sort');
    expect(rows[0].text()).toContain('12.500');
    expect(rows[0].text()).toContain('28');
    expect(rows[1].text()).toContain('Quick Sort');
  });
});
