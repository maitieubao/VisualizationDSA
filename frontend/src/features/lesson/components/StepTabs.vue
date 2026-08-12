<template>
  <div class="step-tabs flex items-center gap-1 p-1 rounded-xl bg-bg-surface border border-border-subtle" role="tablist" aria-label="Các bước bài học">
    <button
      v-for="step in steps"
      :key="step.number"
      :id="tabId(step.number)"
      role="tab"
      :aria-selected="activeStep === step.number"
      :aria-controls="panelId(step.number)"
      :aria-disabled="isLocked(step.number)"
      :tabindex="activeStep === step.number ? 0 : -1"
      :disabled="isLocked(step.number)"
      @click="$emit('navigate', step.number)"
      @keydown.left.prevent="moveFocus(-1)"
      @keydown.right.prevent="moveFocus(1)"
      @keydown.home.prevent="moveFocusToStart()"
      @keydown.end.prevent="moveFocusToEnd()"
      class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap"
      :class="[
        activeStep === step.number
          ? 'bg-accent text-white shadow-md shadow-accent/20 cursor-pointer'
          : isLocked(step.number)
            ? 'text-text-disabled opacity-60 cursor-not-allowed'
            : step.number < activeStep
              ? 'bg-accent-green/15 text-accent-green hover:bg-accent-green/25 cursor-pointer'
              : 'text-text-muted hover:text-text-primary hover:bg-bg-hover cursor-pointer'
      ]"
    >
      <!-- Tab khóa hiển thị ổ khóa + mờ thay vì click im lặng (LM-040). -->
      <BaseIcon v-if="isLocked(step.number)" name="lock" class="w-3 h-3" />
      <BaseIcon
        v-else-if="step.number < activeStep"
        name="check"
        class="w-3 h-3"
      />
      <span v-else class="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black"
        :class="activeStep === step.number ? 'bg-white/20' : 'bg-bg-hover text-text-muted'"
      >
        {{ step.number }}
      </span>
      <span class="hidden sm:inline">{{ step.label }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
// LS-038: roving tabindex + aria-controls + phím mũi tên/Home/End (ARIA tabs pattern).
// Panel nội dung tương ứng (id "step-panel-{n}") nằm ở view cha — nơi render
// role="tabpanel" + aria-labelledby khớp với tabId ở đây.

const props = withDefaults(defineProps<{
  steps: Array<{ number: number; label: string }>;
  activeStep: number;
  /** Các bước đang khóa (mờ + ổ khóa, click vô hiệu). */
  lockedSteps?: number[];
}>(), {
  lockedSteps: () => [],
});

defineEmits<{
  (e: 'navigate', stepNumber: number): void;
}>();

function isLocked(stepNumber: number): boolean {
  return props.lockedSteps.includes(stepNumber);
}

function tabId(stepNumber: number): string {
  return `step-tab-${stepNumber}`;
}

function panelId(stepNumber: number): string {
  return `step-panel-${stepNumber}`;
}

function focusTab(stepNumber: number) {
  document.getElementById(tabId(stepNumber))?.focus();
}

function moveFocus(delta: -1 | 1) {
  const idx = props.steps.findIndex(s => s.number === props.activeStep);
  if (idx === -1) return;
  let next = idx + delta;
  // Nhảy qua các bước đang khóa (disabled không nhận focus).
  while (next >= 0 && next < props.steps.length && isLocked(props.steps[next].number)) {
    next += delta;
  }
  if (next >= 0 && next < props.steps.length) {
    focusTab(props.steps[next].number);
  }
}

function moveFocusToStart() {
  const target = props.steps.find(s => !isLocked(s.number));
  if (target) focusTab(target.number);
}

function moveFocusToEnd() {
  const target = [...props.steps].reverse().find(s => !isLocked(s.number));
  if (target) focusTab(target.number);
}
</script>
