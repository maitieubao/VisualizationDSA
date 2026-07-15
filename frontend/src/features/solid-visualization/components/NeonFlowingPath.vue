<template>
  <div class="neon-flowing-container relative">
    <svg
      class="w-full h-full"
      :viewBox="`0 0 ${width} ${height}`"
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- High-level class box -->
      <rect
        x="30" y="20" width="140" height="50" rx="12"
        class="fill-slate-900/60 stroke-slate-600"
        stroke-width="1"
      />
      <text x="100" y="50" text-anchor="middle" class="fill-slate-200 text-[11px] font-bold">
        {{ highLevelClass }}
      </text>

      <!-- Interface box (visible when DIP correct) -->
      <rect
        v-if="hasInterface"
        x="180" :y="height / 2 - 25" width="140" height="50" rx="12"
        class="fill-emerald-950/40 stroke-emerald-500"
        stroke-width="2"
      />
      <text
        v-if="hasInterface"
        :x="250" :y="height / 2 + 5" text-anchor="middle"
        class="fill-emerald-400 text-[11px] font-bold"
      >
        {{ interfaceName }}
      </text>

      <!-- Low-level class box -->
      <rect
        :x="hasInterface ? 330 : 180" :y="height - 70" width="140" height="50" rx="12"
        class="fill-slate-900/60 stroke-slate-600"
        stroke-width="1"
      />
      <text
        :x="hasInterface ? 400 : 250" :y="height - 40" text-anchor="middle"
        class="fill-slate-200 text-[11px] font-bold"
      >
        {{ lowLevelClass }}
      </text>

      <!-- Flowing path: violating (red, top-down) -->
      <path
        v-if="isViolating && !hasInterface"
        :d="violatingPathD"
        class="dip-flowing-path is-violating"
      />

      <!-- Flowing paths: correct DIP (green, converging to interface) -->
      <template v-if="hasInterface && !isViolating">
        <path :d="correctPathHighToInterface" class="dip-flowing-path" />
        <path :d="correctPathLowToInterface" class="dip-flowing-path" />
      </template>
    </svg>

    <!-- Status badge -->
    <div
      class="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg"
      :class="isViolating
        ? 'bg-accent-red/50 text-accent-red border border-accent-red/40'
        : 'bg-accent-green/50 text-accent-green border border-accent-green/40'"
    >
      {{ isViolating ? 'DIP Vi phạm' : 'DIP Đạt' }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    isViolating: boolean;
    hasInterface: boolean;
    highLevelClass?: string;
    lowLevelClass?: string;
    interfaceName?: string;
    width?: number;
    height?: number;
  }>(),
  {
    highLevelClass: 'OrderService',
    lowLevelClass: 'MySQLDatabase',
    interfaceName: 'IRepository',
    width: 500,
    height: 200,
  }
);

const violatingPathD = computed(() => {
  return `M 100 70 C 100 120, 250 100, 250 ${props.height - 70}`;
});

const correctPathHighToInterface = computed(() => {
  const midY = props.height / 2;
  return `M 100 70 C 100 ${midY - 20}, 180 ${midY}, 180 ${midY}`;
});

const correctPathLowToInterface = computed(() => {
  const midY = props.height / 2;
  return `M 400 ${props.height - 70} C 400 ${midY + 20}, 320 ${midY}, 320 ${midY}`;
});
</script>

<style scoped>
.neon-flowing-container {
  width: 100%;
  min-height: 180px;
  background: rgba(15, 23, 42, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  backdrop-filter: blur(8px);
  overflow: hidden;
}

.dip-flowing-path {
  fill: none;
  stroke: #10B981;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-dasharray: 10, 15;
  animation: dip-flow-run 1s infinite linear;
}

.dip-flowing-path.is-violating {
  stroke: #EF4444;
}

@keyframes dip-flow-run {
  to {
    stroke-dashoffset: -25;
  }
}
</style>
