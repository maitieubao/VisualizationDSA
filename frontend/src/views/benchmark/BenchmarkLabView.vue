<template>
  <div class="benchmark-lab h-full bg-bg-base overflow-y-auto">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <header class="mb-6">
        <h1 class="text-2xl font-bold text-text-primary flex items-center gap-2">
          <BaseIcon name="compare" class="w-6 h-6 text-accent-cyan" />
          Benchmark Lab — Đo điểm chuẩn
        </h1>
        <p class="text-text-secondary mt-1 text-sm">
          Chọn từ 2 đến 4 thuật toán, nhập mảng số nguyên rồi so sánh thời gian và số bước thực thi trên cùng một dữ liệu.
        </p>
      </header>

      <section class="rounded-xl border border-border-subtle shadow-lg bg-bg-secondary p-4 mb-6">
        <h2 class="text-xs font-bold uppercase tracking-wider text-text-secondary mb-3">
          1. Chọn thuật toán
        </h2>
        <p class="text-xs text-text-muted mb-3">
          Đã chọn <span class="font-semibold text-accent-cyan">{{ store.selectedCount }}</span>/4 thuật toán.
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <label
            v-for="algo in ALGORITHM_CATALOG"
            :key="algo.id"
            class="benchmark-algo-item flex items-center gap-2 rounded-lg border border-border-default bg-bg-surface px-3 py-2 cursor-pointer hover:border-accent transition-colors"
            :class="{ 'border-accent-cyan bg-accent-cyan/10': isSelected(algo.id) }"
          >
            <input
              type="checkbox"
              class="benchmark-algo-checkbox"
              :checked="isSelected(algo.id)"
              :disabled="store.isLoading || (!isSelected(algo.id) && store.selectedCount >= 4)"
              @change="store.toggleAlgorithm(algo.id)"
            />
            <span class="flex-1 text-sm text-text-primary">{{ algo.name }}</span>
            <span class="text-[10px] text-text-muted font-mono">{{ algo.timeComplexity }}</span>
          </label>
        </div>
      </section>

      <section class="rounded-xl border border-border-subtle shadow-lg bg-bg-secondary p-4 mb-6">
        <h2 class="text-xs font-bold uppercase tracking-wider text-text-secondary mb-3">
          2. Dữ liệu đầu vào
        </h2>
        <textarea
          v-model="store.inputText"
          class="benchmark-input w-full bg-bg-surface border border-border-default rounded-lg px-3 py-2 text-sm text-text-secondary font-mono resize-none focus:outline-none focus:border-accent transition-colors"
          rows="2"
          placeholder="Ví dụ: 5, 3, 8, 1, 9"
        ></textarea>
        <p class="text-[10px] text-text-muted mt-1">
          Mảng số nguyên, các phần tử cách nhau bởi dấu phẩy.
        </p>
      </section>

      <button
        class="benchmark-run-btn px-5 py-2.5 rounded-md font-bold text-white transition-colors"
        :class="store.canRun ? 'bg-accent-primary hover:bg-accent-secondary' : 'bg-bg-active text-text-muted cursor-not-allowed'"
        :disabled="!store.canRun"
        @click="runBenchmark"
      >
        <span v-if="store.isLoading">Đang so sánh...</span>
        <span v-else>Chạy so sánh</span>
      </button>

      <p v-if="store.error" class="benchmark-error mt-3 text-sm text-red-400">
        {{ store.error }}
      </p>

      <section class="mt-6">
        <div
          v-if="store.results.length > 0"
          class="benchmark-table overflow-x-auto rounded-xl border border-border-subtle shadow-lg bg-bg-secondary"
        >
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-border-subtle text-left text-xs uppercase tracking-wider text-text-muted">
                <th class="px-4 py-3">Thuật toán</th>
                <th class="px-4 py-3">Thời gian (ms)</th>
                <th class="px-4 py-3">Số bước</th>
                <th class="px-4 py-3">Độ phức tạp thời gian (lý thuyết)</th>
                <th class="px-4 py-3">Độ phức tạp không gian (lý thuyết)</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="result in store.results"
                :key="result.algorithmId"
                class="benchmark-row border-b border-border-subtle last:border-0"
              >
                <td class="px-4 py-3 text-text-primary font-medium">
                  {{ algorithmName(result.algorithmId) }}
                </td>
                <td class="px-4 py-3 text-text-secondary">
                  <span v-if="result.error" class="text-red-400">{{ result.error }}</span>
                  <span v-else>{{ formatNumber(result.elapsedMs) }}</span>
                </td>
                <td class="px-4 py-3 text-text-secondary">
                  {{ result.error ? '—' : result.frameCount }}
                </td>
                <td class="px-4 py-3 text-accent-cyan font-mono">
                  {{ theoreticalTime(result.algorithmId) }}
                </td>
                <td class="px-4 py-3 text-accent-cyan font-mono">
                  {{ theoreticalSpace(result.algorithmId) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          v-else-if="!store.isLoading"
          class="benchmark-empty rounded-xl border border-dashed border-border-subtle bg-bg-secondary px-4 py-10 text-center text-text-muted text-sm"
        >
          Chưa có kết quả. Hãy chọn thuật toán và nhấn "Chạy so sánh".
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseIcon from '@/shared/components/BaseIcon.vue';
import { ALGORITHM_CATALOG } from '@/features/dsa-modules/services/algorithmCatalog';
import { LOCAL_METADATA } from '@/features/dsa-modules/store/algorithmLocalMetadata';
import { useBenchmarkStore } from '@/features/benchmark-lab/store/useBenchmarkStore';

const store = useBenchmarkStore();

const isSelected = (id: string): boolean => store.selectedIds.includes(id);

function algorithmName(id: string): string {
  const algo = ALGORITHM_CATALOG.find((item) => item.id === id);
  return algo?.name ?? id;
}

function theoreticalTime(id: string): string {
  return LOCAL_METADATA[id]?.timeComplexity ?? '—';
}

function theoreticalSpace(id: string): string {
  return LOCAL_METADATA[id]?.spaceComplexity ?? '—';
}

function formatNumber(value: number): string {
  return value.toFixed(3);
}

async function runBenchmark(): Promise<void> {
  await store.runComparison();
}
</script>

<style scoped>
.benchmark-algo-checkbox {
  accent-color: var(--color-accent-cyan);
}
</style>
