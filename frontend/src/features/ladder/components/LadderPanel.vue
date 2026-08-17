<template>
  <div class="ladder-panel p-4 bg-bg-secondary border border-border-subtle rounded-xl space-y-4 text-text-primary">
    <div v-if="isLoading" class="text-xs text-text-muted">Đang tải Practice Ladder...</div>
    <div v-else-if="error && stages.length === 0" class="text-xs text-accent-red">{{ error }}</div>

    <template v-else>
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-bold flex items-center gap-2">
          <BaseIcon name="puzzle" class="w-4 h-4 text-accent" />
          Practice Ladder
        </h3>
        <button
          @click="reload"
          class="text-[11px] text-text-muted hover:text-text-primary cursor-pointer flex items-center gap-1"
        >
          <BaseIcon name="refresh" class="w-3 h-3" />
          Tải lại
        </button>
      </div>

      <!-- 3 bậc -->
      <ol class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <li
          v-for="stage in stages"
          :key="stage.stage"
          class="rounded-lg border p-3 flex flex-col gap-2"
          :class="stageCardClass(stage)"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold">Bậc {{ stage.stage }}</span>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full" :class="badgeClass(stage)">
              {{ badgeLabel(stage) }}
            </span>
          </div>
          <p class="text-[11px] text-text-secondary">{{ stageTitle(stage.stage) }}</p>
          <p v-if="stage.bestScore != null" class="text-[10px] text-text-muted">
            Điểm tốt nhất: {{ stage.bestScore }}
          </p>

          <!-- Bậc 1: điều hướng quiz hiện có -->
          <button
            v-if="stage.stage === 1 && !stage.passed && stage.quizId"
            @click="goToQuiz(stage.quizId)"
            class="mt-auto px-3 py-1.5 rounded-lg bg-accent hover:bg-accent-dark text-white text-[11px] font-bold cursor-pointer"
          >
            Làm quiz
          </button>
          <span v-else-if="stage.stage === 1 && !stage.passed && !stage.quizId" class="text-[11px] text-text-muted">
            Bài học chưa gắn quiz.
          </span>

          <!-- Bậc 3: chuyển sang bước CodeLab của bài học -->
          <button
            v-if="stage.stage === 3 && !stage.passed && stage.codelabId"
            @click="goToCodelab"
            class="mt-auto px-3 py-1.5 rounded-lg bg-accent hover:bg-accent-dark text-white text-[11px] font-bold cursor-pointer"
          >
            Làm CodeLab
          </button>
          <span v-else-if="stage.stage === 3 && !stage.passed && !stage.codelabId" class="text-[11px] text-text-muted">
            Bài học chưa gắn CodeLab.
          </span>
        </li>
      </ol>

      <!-- Bậc 2: Interactive Lab -->
      <div v-if="stage2 && stage2.lab" class="rounded-lg border border-border-subtle p-3 space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold">Bậc 2 — Sắp xếp mảng thủ công</span>
          <span class="text-[10px] text-text-muted">Còn {{ labSwapsLeft }} bước swap</span>
        </div>
        <p class="text-[11px] text-text-secondary">
          Bấm hai ô để hoán đổi vị trí cho tới khi mảng sắp xếp tăng dần, rồi nộp.
        </p>

        <div class="flex flex-wrap gap-2">
          <button
            v-for="(value, index) in labArray"
            :key="index"
            @click="toggleCell(index)"
            :disabled="isLabComplete || isSubmitting || labSwapsLeft <= 0"
            class="min-w-12 h-12 px-3 rounded-lg border font-mono font-bold text-sm transition-colors"
            :class="cellClass(index)"
          >
            {{ value }}
          </button>
        </div>

        <div class="flex items-center gap-2">
          <button
            @click="submitLab"
            :disabled="isLabComplete || isSubmitting || labOperations.length === 0"
            class="px-4 py-2 rounded-lg bg-accent-green text-white text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {{ isSubmitting ? 'Đang nộp...' : 'Nộp bài' }}
          </button>
          <button
            @click="resetLab"
            :disabled="isSubmitting"
            class="px-3 py-2 rounded-lg bg-bg-surface hover:bg-bg-hover text-text-secondary text-xs font-semibold border border-border-subtle cursor-pointer"
          >
            Làm lại
          </button>
        </div>

        <p v-if="labResult" :class="isLabComplete ? 'text-accent-green' : 'text-accent-red'" class="text-[11px]">
          {{ labResult }}
        </p>
      </div>

      <p v-if="error" class="text-[11px] text-accent-red">{{ error }}</p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { useLadderStore } from '../store/useLadderStore';
import type { LadderStageDto } from '../../../services/ladderApi';

const props = withDefaults(defineProps<{
  lessonId: string;
}>(), {});

const emit = defineEmits<{
  (e: 'go-codelab'): void;
}>();

const router = useRouter();
const ladder = useLadderStore();

const {
  stages,
  isLoading,
  error,
  stage2,
  labArray,
  labSwapsLeft,
  isLabComplete,
  isSubmitting,
  labOperations,
  labResult,
} = storeToRefs(ladder);

onMounted(() => {
  void ladder.loadLadder(props.lessonId);
});

function reload(): void {
  void ladder.loadLadder(props.lessonId);
}

function stageTitle(stage: number): string {
  if (stage === 1) return 'Trắc nghiệm — đạt 60%';
  if (stage === 2) return 'Thao tác tay trên mảng';
  return 'CodeLab — đạt 70%';
}

function stageCardClass(stage: LadderStageDto): string {
  if (stage.passed) return 'border-accent-green/40 bg-accent-green/5';
  if (stage.status === 0) return 'border-border-subtle bg-bg-surface opacity-60';
  return 'border-accent/30 bg-bg-surface';
}

function badgeClass(stage: LadderStageDto): string {
  if (stage.passed) return 'bg-accent-green/20 text-accent-green';
  if (stage.status === 0) return 'bg-bg-hover text-text-muted';
  return 'bg-accent/20 text-accent';
}

function badgeLabel(stage: LadderStageDto): string {
  if (stage.passed) return 'Đã pass';
  if (stage.status === 0) return 'Khóa';
  return 'Mở';
}

function cellClass(index: number): string {
  if (isLabComplete.value) return 'bg-accent-green/10 border-accent-green/40 text-accent-green cursor-not-allowed';
  if (ladder.isSelected(index)) return 'bg-accent/20 border-accent text-accent';
  return 'bg-bg-surface border-border-subtle text-text-primary hover:border-accent cursor-pointer';
}

function toggleCell(index: number): void {
  ladder.toggleCell(index);
}

function submitLab(): void {
  void ladder.submitLab();
}

function resetLab(): void {
  ladder.resetLab();
}

function goToQuiz(quizId: string): void {
  void router.push({ name: 'quiz', query: { quizId } });
}

function goToCodelab(): void {
  emit('go-codelab');
}
</script>
