<template>
  <div class="dsa-player-wrapper flex h-full w-full gap-4 relative" :class="{ 'theory-expanded-layout': isTheoryOpen && isDesktopWide }">
    <div class="flex-1 flex flex-col h-full w-full gap-2 min-w-0">
      <!-- Mode: Dashboard (no algorithm selected) -->
      <template v-if="!algoStore.currentAlgorithm">
        <AlgorithmDashboard :allowedCategories="allowedCategories" @select="onAlgorithmSelected" />
      </template>

      <!-- Mode: Visualization (algorithm selected) -->
      <template v-else>
        <DSAHeader
          :algorithm="algoStore.currentAlgorithm"
          :metadata="algoStore.metadata"
          :isExecuting="isExecuting"
          :isTheoryOpen="isTheoryOpen"
          @back="goBack"
          @execute="executeVisualization"
          @toggleTheory="isTheoryOpen = !isTheoryOpen"
        />

        <div class="flex-1 flex gap-2 min-h-0">
          <!-- Canvas Visualizer (65%) -->
          <div class="flex-[65] rounded-xl overflow-hidden border border-border-subtle shadow-lg relative">
            <AlgorithmVisualizer />
          </div>

          <!-- Sidebar: Pseudocode + Input (35%) -->
          <div class="flex-[35] flex flex-col gap-2 min-h-0">
            <PseudocodeViewer
              v-if="algoStore.metadata"
              :pseudoCode="algoStore.metadata.pseudoCode"
              :activeLine="animStore.currentFrame?.activeLine"
              :description="algoStore.metadata.description"
            />
            <DSAInputForm
              v-model="inputText"
              :algorithmCategory="algoStore.currentAlgorithm.category"
              @submit="executeVisualization"
            />
          </div>
        </div>

        <!-- Explanation Row -->
        <div v-if="animStore.currentFrame"
          class="h-10 rounded-xl overflow-hidden border border-border-subtle shadow-lg bg-bg-secondary flex items-center px-4">
          <span class="text-xs text-text-secondary">{{ animStore.currentFrame.explanation }}</span>
        </div>

        <!-- Control Panel -->
        <AnimationVcrControls
          :isPlaying="animStore.isPlaying"
          :currentIndex="animStore.currentIndex"
          :totalSteps="animStore.totalSteps"
          :playbackSpeed="animStore.playbackSpeed"
          @stop="animStore.stop()"
          @stepBackward="animStore.stepBackward()"
          @stepForward="animStore.stepForward()"
          @togglePlay="animStore.isPlaying ? animStore.pause() : animStore.play()"
          @scrub="animStore.scrubTo"
          @speedChange="animStore.setSpeed"
        />
      </template>
    </div>

    <!-- Collapsible theory panel -->
    <TheoryCollapsiblePanel
      v-model:isOpen="isTheoryOpen"
      :document="dsaTheoryDoc"
      :activeSectionId="activeTheorySectionId"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { useAlgorithmStore } from '../store/useAlgorithmStore';
import { useAnimationStore } from '@/features/core-learning/animation-engine/store/useAnimationStore';
import { executeDSAAlgorithm } from '@/features/dsa/dsa-modules/services/dsaApi';
import type { Algorithm } from '@/features/dsa/dsa-modules/types/algorithm.types';
import AlgorithmDashboard from './AlgorithmDashboard.vue';
import AlgorithmVisualizer from './AlgorithmVisualizer.vue';
import DSAHeader from './DSAHeader.vue';
import DSAInputForm from './DSAInputForm.vue';
import PseudocodeViewer from './PseudocodeViewer.vue';
import AnimationVcrControls from '@/features/core-learning/animation-engine/components/AnimationVcrControls.vue';
import { useDSAKeyboard } from '@/features/dsa/dsa-modules/composables/useDSAKeyboard';
import TheoryCollapsiblePanel from '@/shared/components/TheoryCollapsiblePanel.vue';
import type { TheoryDocument } from '@/shared/types/theory.types';

const props = defineProps<{
  allowedCategories?: string[];
}>();

const algoStore   = useAlgorithmStore();
const animStore   = useAnimationStore();
const inputText   = ref('5, 3, 8, 1, 9, 2, 7');
const isExecuting = ref(false);

const isTheoryOpen = ref(false);
const isDesktopWide = ref(false);
const activeTheorySectionId = ref<string | null>(null);

const checkWidth = () => {
  isDesktopWide.value = window.innerWidth >= 1700;
};

onMounted(() => {
  checkWidth();
  window.addEventListener('resize', checkWidth);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkWidth);
});

useDSAKeyboard(() => !!algoStore.currentAlgorithm, animStore as any);

const dsaTheoryDoc = computed<TheoryDocument | null>(() => {
  const algo = algoStore.currentAlgorithm;
  const meta = algoStore.metadata;
  if (!algo || !meta) return null;
  return {
    id: `dsa-${algo.id}`,
    title: `Lý thuyết: ${algo.name}`,
    sections: [
      {
        id: 'algo-concept',
        title: '1. Khái niệm & Nguyên lý',
        content: meta.description,
        keywordTags: [algo.name, algo.category, 'khai niem', 'nguyen ly']
      },
      {
        id: 'algo-complexity',
        title: '2. Phân tích Độ phức tạp',
        content: `**Độ phức tạp thời gian (Time Complexity)**: \`${meta.timeComplexity}\`
\n\n**Độ phức tạp bộ nhớ (Space Complexity)**: \`${meta.spaceComplexity}\`
\n\nĐây là các thông số đánh giá hiệu năng tối ưu của thuật toán khi dữ liệu đầu vào quy mô lớn (Big-O notation).`,
        keywordTags: ['do phuc tap', 'time complexity', 'space complexity', 'big-o']
      },
      {
        id: 'algo-pseudocode',
        title: '3. Mã giả & Mã mẫu C#',
        content: `Dưới đây là mã giả tham khảo của thuật toán. Bạn có thể sao chép để biên dịch thử nghiệm trong môi trường của mình.`,
        codeSample: meta.pseudoCode.join('\n'),
        keywordTags: ['ma gia', 'pseudocode', 'c#', 'code']
      }
    ]
  };
});

// Watch current frame to sync active section in Theory Panel
watch(() => animStore.currentIndex, (newIdx) => {
  if (newIdx === 0) {
    activeTheorySectionId.value = 'algo-concept';
  } else if (animStore.currentFrame?.activeLine !== undefined) {
    activeTheorySectionId.value = 'algo-pseudocode';
  }
});

// Watch viewMode of store. If selected as theory from dashboard, auto open panel
watch(() => algoStore.viewMode, (newMode) => {
  if (newMode === 'theory') {
    isTheoryOpen.value = true;
    algoStore.setViewMode('simulation'); // reset to simulation mode so layout render stays active
  }
});

function onAlgorithmSelected(algo: Algorithm): void {
  generateDefaultInput(algo);
  executeVisualization();
}

function generateDefaultInput(algo: Algorithm): void {
  const category = algo.category.toLowerCase();
  if (category === 'searching')       inputText.value = '2, 5, 8, 12, 16, 23, 38, 56, 72, 91, 23';
  else if (category === 'tree')       inputText.value = '50, 30, 70, 20, 40, 60, 80';
  else if (category === 'stack-queue') inputText.value = '10, 20, 30, 40, 50';
  else                                inputText.value = '5, 3, 8, 1, 9, 2, 7';
}

async function executeVisualization(): Promise<void> {
  if (!algoStore.currentAlgorithm || isExecuting.value) return;
  isExecuting.value = true;
  try {
    const data = inputText.value.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
    if (data.length === 0) return;
    const result = await executeDSAAlgorithm(algoStore.currentAlgorithm.id, data);
    animStore.loadResult({ algorithmId: result.algorithmId, pseudoCode: result.pseudoCode, frames: result.frames });
  } catch (error) { console.error('Lỗi thực thi trực quan hóa:', error); }
  finally { isExecuting.value = false; }
}

function goBack(): void { animStore.stop(); algoStore.clearActive(); }
</script>

<style scoped>
@media (min-width: 1700px) {
  .dsa-player-wrapper.theory-expanded-layout {
    display: flex;
    flex-direction: row;
    gap: 20px;
    max-width: 100%;
  }
}
</style>
