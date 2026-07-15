<template>
  <div class="json-panel">
    <div class="panel-header">
      <span class="panel-title">Adjacency List Payload</span>
      <button class="close-btn" @click="$emit('close')">&times;</button>
    </div>
    <pre class="json-content">{{ json }}</pre>
  </div>
</template>

<script setup lang="ts">
defineProps<{ json: string }>();
defineEmits(['close']);
</script>

<style scoped>
.json-panel {
  position: absolute;
  bottom: 16px;
  right: 16px;
  width: 360px;
  max-height: 280px;
  background-color: color-mix(in srgb, var(--color-bg-primary) 95%, transparent);
  backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-xl);
  overflow: hidden;
  z-index: 1020;
  box-shadow: var(--shadow-xl);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background-color: color-mix(in srgb, var(--color-bg-hover) 60%, transparent);
  border-bottom: 1px solid var(--color-border-subtle);
}

.panel-title {
  font-size: 11px;
  font-weight: var(--font-semibold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.close-btn {
  background-color: transparent;
  border: none;
  color: var(--color-text-muted);
  font-size: 18px;
  cursor: pointer;
  padding: 0 4px;
  transition: var(--transition-fast);
}

.close-btn:hover {
  color: var(--color-text-primary);
}

.json-content {
  padding: 12px;
  margin: 0;
  font-size: 11px;
  color: var(--color-accent-green);
  font-family: var(--font-mono);
  overflow: auto;
  max-height: 230px;
  line-height: 1.625;
}
</style>
