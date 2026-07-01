<template>
  <div class="class-card" :class="[variant]">
    <div v-if="variant !== 'shape'" class="header-line"></div>
    <div class="class-header">
      <div class="flex items-center justify-between">
        <span class="title-text">{{ className }}</span>
        <span class="text-[10px] font-mono text-text-muted">{{ subtitle }}</span>
      </div>
    </div>
    <div class="p-4 space-y-3">
      <div class="space-y-1">
        <div class="text-[10px] font-bold uppercase text-text-muted">Fields</div>
        <div v-for="f in fields" :key="f.name">
          <button 
            v-if="f.accessModifier === 'PRIVATE' && isInteractive"
            class="interactive-field-btn"
            :class="{ 'violated animate-pulse': store.accessViolation?.memberName === f.name }"
            @click="store.tryAccessPrivate(f.name)"
          >
            <span class="modifier-badge private">private</span>
            <span class="text-text-secondary">{{ f.name }}: {{ f.typeSig }}</span>
            <svg v-if="store.accessViolation?.memberName === f.name" class="w-4 h-4 text-accent-red ml-auto" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </button>
          <div v-else class="field-row">
            <span class="modifier-badge" :class="[f.accessModifier.toLowerCase()]">{{ f.accessModifier.toLowerCase() }}</span>
            <span class="text-text-secondary">{{ f.name }}: {{ f.typeSig }}</span>
          </div>
        </div>
      </div>
      <div class="separator-line"></div>
      <div class="space-y-1">
        <div class="text-[10px] font-bold uppercase text-text-muted">Methods</div>
        <button 
          v-for="m in methods"
          :key="m.name"
          class="interactive-method-btn"
          :class="{ 'active': isMethodSelected(className, m.name) }"
          @click="store.selectMethod(className, m.name)"
        >
          <span class="modifier-badge public">public</span>
          <span class="text-text-secondary">{{ m.name }}(): {{ m.returnType }}</span>
          <span class="text-[10px] text-text-muted ml-auto font-mono">{{ m.badge }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useOOPStore } from '../store/useOOPStore';

const store = useOOPStore();

defineProps<{
  className: string;
  subtitle: string;
  variant: 'shape' | 'circle' | 'rectangle';
  isInteractive?: boolean;
  fields: Array<{ name: string; typeSig: string; accessModifier: 'PUBLIC' | 'PROTECTED' | 'PRIVATE' }>;
  methods: Array<{ name: string; returnType: string; badge: string }>;
}>();

function isMethodSelected(cls: string, mName: string) {
  return store.selectedMethod === `${cls}.${mName}`;
}
</script>

<style scoped>
.class-card {
  background-color: color-mix(in srgb, var(--vis-panel-bg-deep) 80%, transparent);
  border: 1px solid transparent;
  border-radius: var(--radius-xl);
  overflow: hidden;
  position: relative;
}

/* Variants border colors */
.class-card.shape {
  border-color: color-mix(in srgb, var(--color-border-default) 50%, transparent);
}
.class-card.circle {
  border-color: color-mix(in srgb, var(--color-accent-purple) 30%, transparent);
}
.class-card.rectangle {
  border-color: color-mix(in srgb, var(--color-accent-cyan) 30%, transparent);
}

/* Header line styles */
.header-line {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
}
.circle .header-line {
  background: linear-gradient(to right, var(--color-accent-purple), var(--color-accent-cyan));
}
.rectangle .header-line {
  background: linear-gradient(to right, var(--color-accent-cyan), var(--color-accent-blue));
}

/* Class headers */
.class-header {
  padding: 8px 16px;
  border-bottom: 1px solid transparent;
}
.shape .class-header {
  background: linear-gradient(to right, color-mix(in srgb, var(--color-accent-green) 50%, transparent), color-mix(in srgb, var(--color-accent-green) 30%, transparent));
  border-bottom-color: color-mix(in srgb, var(--color-accent-green) 30%, transparent);
}
.circle .class-header {
  background: linear-gradient(to right, color-mix(in srgb, var(--color-accent-purple) 50%, transparent), color-mix(in srgb, var(--color-accent-purple) 30%, transparent));
  border-bottom-color: color-mix(in srgb, var(--color-accent-purple) 30%, transparent);
}
.rectangle .class-header {
  background: linear-gradient(to right, color-mix(in srgb, var(--color-accent-cyan) 50%, transparent), color-mix(in srgb, var(--color-accent-cyan) 30%, transparent));
  border-bottom-color: color-mix(in srgb, var(--color-accent-cyan) 30%, transparent);
}

/* Title text colors */
.shape .title-text { color: var(--color-accent-green); font-weight: var(--font-bold); }
.circle .title-text { color: var(--color-accent-purple); font-weight: var(--font-bold); }
.rectangle .title-text { color: var(--color-accent-primary); font-weight: var(--font-bold); }

/* Fields row styles */
.field-row, .interactive-field-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--text-xs);
  padding: 4px;
  border-radius: var(--radius-sm);
}

.interactive-field-btn {
  width: 100%;
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  text-align: left;
  transition: var(--transition-fast);
}

.interactive-field-btn:hover {
  background-color: rgba(255, 255, 255, 0.03);
}

.interactive-field-btn.violated {
  background-color: var(--color-accent-red-dim);
  border-color: color-mix(in srgb, var(--color-accent-red) 50%, transparent);
}

/* Badges modifier */
.modifier-badge {
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  font-size: 9px;
  font-weight: var(--font-bold);
  border: 1px solid transparent;
}

.modifier-badge.public {
  background-color: var(--color-accent-green-dim);
  color: var(--color-accent-green);
  border-color: color-mix(in srgb, var(--color-accent-green) 30%, transparent);
}

.modifier-badge.protected {
  background-color: var(--color-accent-yellow-dim);
  color: var(--color-accent-yellow);
  border-color: color-mix(in srgb, var(--color-accent-yellow) 30%, transparent);
}

.modifier-badge.private {
  background-color: var(--color-accent-red-dim);
  color: var(--color-accent-red);
  border-color: color-mix(in srgb, var(--color-accent-red) 30%, transparent);
}

.separator-line {
  height: 1px;
  background-color: var(--color-border-subtle);
  margin: 12px 0;
}

/* Methods styles */
.interactive-method-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--text-xs);
  padding: 6px;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  text-align: left;
  transition: var(--transition-fast);
}

.interactive-method-btn:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

/* Active method classes */
.shape .interactive-method-btn.active {
  background-color: var(--color-accent-green-dim);
  border-color: color-mix(in srgb, var(--color-accent-green) 40%, transparent);
}

.circle .interactive-method-btn.active {
  background-color: var(--color-accent-purple-dim);
  border-color: color-mix(in srgb, var(--color-accent-purple) 40%, transparent);
}

.rectangle .interactive-method-btn.active {
  background-color: var(--color-accent-cyan-dim);
  border-color: color-mix(in srgb, var(--color-accent-cyan) 40%, transparent);
}

.text-accent-red { color: var(--color-accent-red); }
</style>
