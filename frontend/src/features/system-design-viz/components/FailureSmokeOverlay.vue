<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { FailureSmokeEmitterEngine } from '../engine/FailureSmokeEmitterEngine';
import { useSystemDesignStore } from '../store/useSystemDesignStore';

/**
 * Hard cap on total rendered particles across all emitters.
 * Prevents unbounded memory growth when multiple servers fail simultaneously.
 */
const MAX_PARTICLES = 200;

/**
 * Virtual canvas size for each per-node emitter.
 * The engine emits particles from (size/2, size/2); we offset
 * them to the node's absolute position when rendering.
 */
const EMITTER_VIRTUAL_SIZE = 200;

const store = useSystemDesignStore();
const canvasRef = ref<HTMLCanvasElement | null>(null);

/** One emitter per failed node, keyed by nodeId. */
const emitters = new Map<string, FailureSmokeEmitterEngine>();
/** Cached node positions for each active emitter. */
const emitterOrigins = new Map<string, { x: number; y: number }>();

let rafId: number | null = null;

function onSmokeBurst(event: Event): void {
  const detail = (event as CustomEvent<{ nodeId: string }>).detail;
  if (!detail?.nodeId) return;

  const node = store.nodes.find((n) => n.nodeId === detail.nodeId);
  if (!node) return;

  const halfSize = EMITTER_VIRTUAL_SIZE / 2;
  const offsetX = node.posX + 70 - halfSize;
  const offsetY = node.posY + 40 - halfSize;

  if (!emitters.has(detail.nodeId)) {
    const engine = new FailureSmokeEmitterEngine(EMITTER_VIRTUAL_SIZE, EMITTER_VIRTUAL_SIZE);
    emitters.set(detail.nodeId, engine);
    emitterOrigins.set(detail.nodeId, { x: offsetX, y: offsetY });
    engine.startEmission();
  }

  const engine = emitters.get(detail.nodeId)!;
  engine.triggerBurst();
}

function renderLoop(): void {
  const canvas = canvasRef.value;
  if (!canvas) {
    rafId = requestAnimationFrame(renderLoop);
    return;
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    rafId = requestAnimationFrame(renderLoop);
    return;
  }

  const parent = canvas.parentElement;
  if (parent) {
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Prune emitters for recovered nodes
  for (const [nodeId, engine] of emitters) {
    if (!store.failedNodeIds.has(nodeId)) {
      engine.destroy();
      emitters.delete(nodeId);
      emitterOrigins.delete(nodeId);
    }
  }

  // Collect and render particles with MAX_PARTICLES cap
  let totalRendered = 0;

  for (const [nodeId, engine] of emitters) {
    if (totalRendered >= MAX_PARTICLES) break;

    const origin = emitterOrigins.get(nodeId);
    if (!origin) continue;

    const particles = engine.getParticles();
    const remaining = MAX_PARTICLES - totalRendered;
    const count = Math.min(particles.length, remaining);

    for (let i = 0; i < count; i++) {
      const p = particles[i];
      const drawX = origin.x + p.x;
      const drawY = origin.y + p.y;

      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = `rgba(120, 120, 120, ${Math.max(0, p.alpha)})`;
      ctx.beginPath();
      ctx.arc(drawX, drawY, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    totalRendered += count;
  }

  ctx.globalAlpha = 1;
  rafId = requestAnimationFrame(renderLoop);
}

onMounted(() => {
  window.addEventListener('SERVER_FAILED_SMOKE_BURST', onSmokeBurst);
  rafId = requestAnimationFrame(renderLoop);
});

onUnmounted(() => {
  window.removeEventListener('SERVER_FAILED_SMOKE_BURST', onSmokeBurst);
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  for (const engine of emitters.values()) {
    engine.destroy();
  }
  emitters.clear();
  emitterOrigins.clear();
});
</script>

<template>
  <canvas
    ref="canvasRef"
    class="smoke-overlay-canvas"
  />
</template>

<style scoped>
.smoke-overlay-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
}
</style>
