<template>
  <div class="lesson-step-viz flex flex-col h-full w-full bg-bg-secondary relative overflow-hidden">
    <div class="flex-1 min-h-0 relative w-full h-full">
      <AlgoPlaygroundWorkspace
        v-if="resolved.demoId"
        :key="resolved.demoId"
        :demo-id="resolved.demoId"
        class="w-full h-full"
      />
      <component :is="resolved.component" v-else-if="resolved.component" />
      <div v-else class="flex flex-col items-center justify-center h-full text-text-muted p-8 text-center">
        <div class="w-12 h-12 rounded-full bg-bg-surface flex items-center justify-center text-accent mb-3">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <p class="text-sm font-semibold text-text-secondary">Bài học này chưa có mô phỏng tương tác chuyên biệt</p>
        <p class="text-xs text-text-muted mt-1 max-w-md">Hãy đọc kỹ lý thuyết, tự chạy code mẫu để quan sát kết quả, rồi bấm Tiếp Tục để làm Quiz.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import AlgoPlaygroundWorkspace from '../../../features/algo-playground/components/AlgoPlaygroundWorkspace.vue';
import { useAlgoPlaygroundStore } from '../../../features/algo-playground/store/useAlgoPlaygroundStore';
import { resolveLessonViz } from '../../../features/lesson/utils/visualizerMap';

const props = withDefaults(defineProps<{
  vizTitle?: string;
  sandboxType?: string;
  sandboxConfig?: string;
}>(), {
  sandboxType: '',
  sandboxConfig: '',
});

const emit = defineEmits<{
  (e: 'completeStep'): void;
  (e: 'watched'): void;
}>();

const resolved = computed(() => resolveLessonViz(props.sandboxType, props.sandboxConfig));

// Quan trọng: AlgoPlaygroundWorkspace chỉ tự loadDemo khi store.code rỗng, nhưng store
// playground PERSIST code + demoId qua localStorage — sang bài học khác, demo cũ bị giữ lại.
// Buộc tải đúng demo của bài học để đảm bảo user story "hiển thị đúng trực quan hóa theo bài".
const algoStore = useAlgoPlaygroundStore();
watch(
  () => resolved.value.demoId,
  (demoId) => {
    if (demoId && algoStore.demoId !== demoId) {
      algoStore.loadDemo(demoId);
    }
  },
  { immediate: true },
);

onMounted(() => {
  // Đánh dấu đã xem trực quan hóa (parent lưu progress qua store).
  emit('watched');
});
</script>
