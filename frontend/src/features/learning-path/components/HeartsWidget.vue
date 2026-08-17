<template>
  <div
    class="hearts-widget flex items-center gap-1.5 px-2 py-1 rounded-full bg-bg-surface border border-border-subtle"
    :title="titleText"
  >
    <BaseIcon :name="hearts > 0 ? 'heart' : 'heart'" class="w-4 h-4 text-accent-red" />
    <span class="text-xs font-bold text-text-primary tabular-nums">{{ hearts }}/{{ heartsMax }}</span>
    <span v-if="hearts < heartsMax && nextHeartAt" class="text-[10px] text-text-muted">
      +1 lúc {{ formatTime(nextHeartAt) }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount } from 'vue';
import { storeToRefs } from 'pinia';
import { useLearningPathStore } from '../store/useLearningPathStore';

const store = useLearningPathStore();
const { hearts, heartsMax, nextHeartAt } = storeToRefs(store);

const titleText = computed(() =>
  hearts.value > 0
    ? `Còn ${hearts.value}/${heartsMax.value} Tim`
    : 'Đã hết Tim — chờ hồi phục',
);

// Đồng bộ trạng thái Tim: nếu chưa có path nào được tải (widget mount trước LearningPathMap),
// tự load danh sách lộ trình rồi load bản đồ path đầu tiên — GET map trả hearts hiện tại.
// Widget cũng tự refresh nhẹ mỗi 30 giây để thời gian hồi luôn tươi.
let timer: ReturnType<typeof setInterval> | null = null;

onMounted(async () => {
  if (!store.currentPath) {
    if (store.paths.length === 0) await store.loadPaths();
    const first = store.paths[0];
    if (first) await store.loadMap(first.id);
  }
  timer = setInterval(() => {
    if (store.currentPath) void store.loadMap(store.currentPath.id);
  }, 30_000);
});

onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
});

function formatTime(value: string): string {
  return new Date(value).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
</script>
