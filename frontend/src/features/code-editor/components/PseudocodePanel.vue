<template>
  <div class="h-full flex flex-col bg-bg-secondary/50">
    
    <VariablesHud :activeLoopVars="activeLoopVars" />

    
    <div class="flex-1 overflow-y-auto p-2" ref="viewport">
      <div
        v-if="!vcrStore.code.trim()"
        class="h-full flex flex-col items-center justify-center gap-2 text-center px-4"
      >
        <BaseIcon name="file-text" class="w-6 h-6 text-text-muted" />
        <p class="text-xs text-text-muted font-sans max-w-[220px] leading-relaxed">
          Chưa có mã nguồn. Chọn một preset hoặc nhập code để bắt đầu.
        </p>
      </div>
      <div v-else class="font-mono text-sm leading-7">
        <div
          v-for="(line, idx) in codeLines"
          :key="idx"
          :ref="
            (el) => {
              if (el) lineRefs[idx + 1] = el as HTMLElement;
            }
          "
          @click="onLineClick(idx + 1)"
          @keydown.enter.prevent="onLineClick(idx + 1)"
          :role="isLineExecutable(idx + 1) ? 'button' : undefined"
          :tabindex="isLineExecutable(idx + 1) ? 0 : -1"
          :aria-current="isLineActive(idx + 1) ? 'true' : undefined"
          class="group flex items-center rounded-md px-2 py-0.5 cursor-pointer select-none transition-all focus:outline-none focus-visible:ring-1 focus-visible:ring-accent-cyan"
          :class="getLineClasses(idx + 1)"
        >
          
          <span
            class="w-8 text-right pr-3 text-xs select-none"
            :class="isLineActive(idx + 1) ? 'text-accent' : 'text-text-disabled'"
          >
            {{ idx + 1 }}
          </span>

          
          <span class="whitespace-pre" v-html="highlightSyntax(line)"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useVcrStore } from "../../vcr-player/store/useVcrStore";
import { isPlaybackFrame } from "../../../core/CompilerStepExecutor";
import { highlightSyntax } from "../helpers/highlightHelper";
import { usePseudocodeScroller } from "../composables/usePseudocodeScroller";
import VariablesHud from "./VariablesHud.vue";

const vcrStore = useVcrStore();
const { viewport, lineRefs } = usePseudocodeScroller();

const codeLines = computed(() => vcrStore.code.split("\n"));

const activeLoopVars = computed(() => {
  const frame = vcrStore.currentFrame;
  if (!isPlaybackFrame(frame)) return [];
  const vars = frame.canvasStateSnapshot.loopVariables;
  if (!vars) return [];
  return Object.entries(vars);
});

const isLineActive = (lineNum: number) => {
  if (!vcrStore.currentFrame) return false;
  return vcrStore.currentLineNumber === lineNum;
};

const isLineExecutable = (lineNum: number) => {
  return vcrStore.playbackFrames.some((f) => f.lineNumber === lineNum);
};

const getLineClasses = (lineNum: number): string => {
  if (isLineActive(lineNum)) {
    return "bg-accent-cyan/10 text-accent-cyan border-l-2 border-accent-cyan";
  }
  if (isLineExecutable(lineNum)) {
    return "text-text-secondary hover:bg-bg-surface/50 hover:text-text-primary";
  }
  return "text-text-muted/60";
};

const onLineClick = (lineNum: number) => {
  const targetFrameIndex = vcrStore.playbackFrames.findIndex(
    (f) => f.lineNumber === lineNum
  );
  if (targetFrameIndex !== -1) {
    vcrStore.jumpToFrame(targetFrameIndex);
  }
};
</script>
