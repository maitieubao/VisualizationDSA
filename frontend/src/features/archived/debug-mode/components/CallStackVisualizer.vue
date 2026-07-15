<template>
  <div class="call-stack-container">
    <!-- Header -->
    <div class="flex items-center gap-2 px-4 py-2 border-b"
      style="border-color: rgba(255, 255, 255, 0.05); background: rgba(30, 41, 59, 0.6);"
    >
      <div class="w-2 h-2 rounded-full bg-accent-purple"></div>
      <span class="text-xs font-medium text-text-secondary uppercase tracking-wider">
        Call Stack
      </span>
      <span class="ml-auto text-[10px] text-text-muted font-mono">
        {{ frames.length }} frame{{ frames.length !== 1 ? 's' : '' }}
      </span>
    </div>

    <!-- Stack Frames -->
    <div class="call-stack-3d-container">
      <template v-if="frames.length === 0">
        <div class="text-center text-text-muted text-xs py-6">
          Chua co ngăn xep de quy
        </div>
      </template>

      <TransitionGroup name="stack-frame" tag="div" class="flex flex-col-reverse gap-2">
        <div
          v-for="(frame, index) in frames"
          :key="`${frame}-${index}`"
          class="stack-frame-card"
          :class="{
            'active-top-frame': index === frames.length - 1,
            'opacity-60': index < frames.length - 1,
          }"
        >
          <div class="flex items-center gap-3">
            <!-- Depth indicator -->
            <span class="text-[10px] font-mono text-text-muted w-5 text-center">
              #{{ index }}
            </span>

            <!-- Frame icon -->
            <div
              class="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold"
              :style="{
                background: index === frames.length - 1
                  ? 'rgba(6, 182, 212, 0.15)'
                  : 'rgba(100, 116, 139, 0.1)',
                color: index === frames.length - 1 ? '#06B6D4' : '#94A3B8',
              }"
            >
              f
            </div>

            <!-- Function name -->
            <span
              class="text-xs font-mono flex-1 truncate"
              :style="{ color: index === frames.length - 1 ? '#E2E8F0' : '#94A3B8' }"
            >
              {{ frame }}
            </span>

            <!-- Active badge -->
            <span
              v-if="index === frames.length - 1"
              class="text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded"
              style="background: rgba(6, 182, 212, 0.1); color: #06B6D4;"
            >
              Active
            </span>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  frames: string[];
}>();
</script>

<style scoped>
.call-stack-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: rgba(15, 23, 42, 0.4);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.04);
  overflow: hidden;
}

.call-stack-3d-container {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
}

.stack-frame-card {
  position: relative;
  background: rgba(30, 41, 59, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 10px 14px;
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 15px -3px rgba(0, 0, 0, 0.3);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.stack-frame-card.active-top-frame {
  border-color: rgba(6, 182, 212, 0.4);
  box-shadow: 0 0 15px rgba(6, 182, 212, 0.15), 0 8px 25px -5px rgba(0, 0, 0, 0.4);
  transform: translateY(-2px) scale(1.01);
  opacity: 1 !important;
}

/* TransitionGroup animations */
.stack-frame-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.stack-frame-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.stack-frame-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}
.stack-frame-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}
</style>
