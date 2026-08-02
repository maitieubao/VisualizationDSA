<template>
  <div class="lesson-step-viz flex flex-col h-full w-full bg-bg-secondary relative overflow-hidden">
    
    <button
      v-if="hasWatched"
      @click="$emit('completeStep')"
      class="absolute top-3 right-4 z-30 px-3.5 py-1.5 bg-accent/90 hover:bg-accent text-white rounded-xl text-xs font-bold transition-all shadow-lg backdrop-blur-md cursor-pointer border border-accent/30 flex items-center gap-1.5 animate-pulse"
    >
      <span>Làm Quiz Ngay</span>
      <span>→</span>
    </button>
    <div
      v-else
      class="absolute top-3 right-4 z-30 px-3.5 py-1.5 bg-bg-surface/90 text-text-muted rounded-xl text-xs font-bold shadow-lg backdrop-blur-md border border-border-subtle flex items-center gap-1.5"
    >
      <svg class="w-4 h-4 animate-spin text-text-muted" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span>Đang xem ({{ Math.floor(animStore.progressPercent) }}%)...</span>
    </div>

    
    <div class="flex-1 min-h-0 relative w-full h-full">
      <template v-if="visualizerComponent">
        <component 
          :is="visualizerComponent" 
        />
        
        
        <button
          @click="startLecture"
          :disabled="isLoadingLecture"
          class="absolute bottom-4 left-4 z-40 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg backdrop-blur-md cursor-pointer border flex items-center gap-2"
          :class="isLoadingLecture ? 'bg-bg-surface/80 text-text-muted border-border-subtle' : 'bg-accent-cyan/90 hover:bg-accent-cyan text-white border-accent-cyan/30'"
        >
          <svg v-if="isLoadingLecture" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <svg v-else class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" /><path d="M6 6h10M6 10h10" />
          </svg>
          <span>{{ isLoadingLecture ? 'Đang tải kịch bản...' : 'Khởi chạy E-Lecture' }}</span>
        </button>

        
        <LectureOverlay />
      </template>
      <div v-else class="flex flex-col items-center justify-center h-full text-text-muted p-8 text-center">
        <div class="w-12 h-12 rounded-full bg-bg-surface flex items-center justify-center text-accent mb-3">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <p class="text-sm font-semibold text-text-secondary">Chưa có Trực Quan Hóa</p>
        <p class="text-xs text-text-muted mt-1">Module mô phỏng cho thuật toán này đang được phát triển hoặc không tồn tại.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useAnimationStore } from '../../animation-engine/store/useAnimationStore';
import { visualizerMap } from '../utils/visualizerMap';
import { useLectureStore, loadLecture, LectureOverlay } from '../../e-lecture';

const props = defineProps<{
  vizTitle?: string;
  algorithmId: string;
}>();

const emit = defineEmits<{
  (e: 'watched'): void;
  (e: 'completeStep'): void;
}>();

const animStore = useAnimationStore();
const lectureStore = useLectureStore();
const hasWatched = ref(false);
const isLoadingLecture = ref(false);

const visualizerComponent = computed(() => {
  return visualizerMap[props.algorithmId];
});

async function startLecture() {
  isLoadingLecture.value = true;
  try {
    const lectureData = await loadLecture(props.algorithmId);
    if (lectureData) {
      lectureStore.startLecture(lectureData);
    } else {
      alert('Không tìm thấy kịch bản E-Lecture cho thuật toán này trên hệ thống.');
    }
  } catch (e) {
    alert('Có lỗi xảy ra khi tải kịch bản E-Lecture.');
  } finally {
    isLoadingLecture.value = false;
  }
}

watch(() => animStore.progressPercent, (newVal) => {
  if (newVal >= 90 && !hasWatched.value) {
    hasWatched.value = true;
    emit('watched');
  }
});
</script>
