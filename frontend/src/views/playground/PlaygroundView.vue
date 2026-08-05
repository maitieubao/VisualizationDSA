<template>
  <section class="flex flex-col flex-1 min-h-0 h-full">
    <div class="flex items-center gap-2 px-3 py-2 border-b border-surface/70 bg-surface/30 shrink-0">
      <div class="flex items-center gap-1 bg-surface/60 border border-surface rounded-lg p-1">
        <button
          class="mode-toggle-btn"
          :class="{ active: mode === 'free' }"
          @click="switchMode('free')"
        >
          <BaseIcon name="edit-2" class="w-3.5 h-3.5 inline mr-1 align-middle" />Editor tự do
        </button>
        <button
          class="mode-toggle-btn"
          :class="{ active: mode === 'algo' }"
          @click="switchMode('algo')"
        >
          <BaseIcon name="puzzle" class="w-3.5 h-3.5 inline mr-1 align-middle" />Thuật toán tương tác
        </button>
      </div>
      <span v-if="mode === 'algo'" class="text-[10px] text-text-secondary hidden md:block">
        Chọn mẫu, sửa code JS, bấm Chạy để xem từng bước trên canvas.
      </span>
    </div>

    <AlgoPlaygroundWorkspace v-if="mode === 'algo'" class="flex-1 min-h-0" :demo-id="algoDemoId" />
    <PlaygroundWorkspace v-else class="flex-1 min-h-0 w-full" />
  </section>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { PlaygroundWorkspace, useHtmlPlaygroundStore } from '../../features/html-playground';
import AlgoPlaygroundWorkspace from '../../features/algo-playground/components/AlgoPlaygroundWorkspace.vue';
import { playgroundAlgoDemos } from '../../features/algo-playground/engine/playgroundAlgoDemos';

type PlaygroundMode = 'free' | 'algo';

const route = useRoute();
const router = useRouter();
const store = useHtmlPlaygroundStore();

const algoDemoId = computed<string | undefined>(() => {
  const demo = route.query.demo;
  return typeof demo === 'string' && demo.length > 0 ? demo : undefined;
});

const mode = ref<PlaygroundMode>(algoDemoId.value ? 'algo' : 'free');

// Validate: ?demo= không hợp lệ → fallback bubble-sort (giữ mode algo)
function sanitizeDemoQuery(): void {
  const demo = route.query.demo;
  if (typeof demo === 'string' && demo.length > 0 && !playgroundAlgoDemos[demo]) {
    router.replace({ query: { ...route.query, demo: 'bubble-sort' } });
  }
}
sanitizeDemoQuery();

function switchMode(next: PlaygroundMode): void {
  mode.value = next;
  router.replace({
    query:
      next === 'algo'
        ? { demo: algoDemoId.value ?? 'bubble-sort' }
        : algoDemoId.value
          ? {}
          : undefined,
  });
}

const applyPayloadFromRoute = () => {
  const payload = typeof route.query.code === 'string' ? route.query.code : '';
  if (payload) {
    const ok = store.loadFromSharePayload(payload);
    if (!ok) console.warn('Playground URL code không hợp lệ, dùng code mặc định.');
  }
};

applyPayloadFromRoute();

watch(() => route.query.code, applyPayloadFromRoute);
watch(
  () => route.query.demo,
  (demo) => {
    if (typeof demo === 'string' && demo.length > 0) {
      sanitizeDemoQuery();
      mode.value = 'algo';
    }
  },
);
</script>

<style scoped>
.mode-toggle-btn {
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary, #94a3b8);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.15s ease;
}
.mode-toggle-btn:hover {
  color: var(--color-text-primary, #f1f5f9);
  background: rgba(255, 255, 255, 0.06);
}
.mode-toggle-btn.active {
  color: #fbbf24;
  background: rgba(251, 191, 36, 0.14);
}
</style>
