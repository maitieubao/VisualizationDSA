<template>
  <div class="isp-panel flex flex-col gap-4">
    <!-- ISP Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full" :class="activeTab === 'violation' ? 'bg-accent-red animate-pulse' : 'bg-accent-green'" />
        <span class="text-xs font-bold uppercase tracking-wider text-text-secondary">
          ISP — Interface Segregation Principle
        </span>
      </div>
      <span
        class="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg"
        :class="activeTab === 'violation'
          ? 'bg-accent-red/50 text-accent-red border border-accent-red/40'
          : 'bg-accent-green/50 text-accent-green border border-accent-green/40'"
      >
        {{ activeTab === 'violation' ? 'FAT INTERFACE ✗' : 'SEGREGATED ✓' }}
      </span>
    </div>

    <!-- Concept Summary -->
    <div class="isp-quote">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;margin-right:4px"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg><em>"Clients should not be forced to depend on methods they do not use."</em>
    </div>

    <!-- Toggle Tabs -->
    <div class="flex gap-2">
      <button
        class="flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border"
        :class="activeTab === 'violation'
          ? 'bg-accent-red/30 text-accent-red border-accent-red/40'
          : 'bg-bg-secondary/30 text-text-muted border-border-subtle/40 hover:bg-bg-secondary/50'"
        @click="activeTab = 'violation'"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;margin-right:3px"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>Vi phạm ISP
      </button>
      <button
        class="flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border"
        :class="activeTab === 'ok'
          ? 'bg-accent-green/30 text-accent-green border-accent-green/40'
          : 'bg-bg-secondary/30 text-text-muted border-border-subtle/40 hover:bg-bg-secondary/50'"
        @click="activeTab = 'ok'"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;margin-right:3px"><path d="M20 6L9 17l-5-5"/></svg>Tuân thủ ISP
      </button>
    </div>

    <!-- Violation View -->
    <div v-if="activeTab === 'violation'" class="isp-diagram">
      <div class="isp-section-label red">Fat Interface (Bloated)</div>
      <div class="fat-interface">
        <div class="interface-header fat">
          <span class="class-type-badge">«interface»</span>
          <span class="class-name">IWorker</span>
        </div>
        <div class="interface-method required">+ work(): void</div>
        <div class="interface-method required">+ eat(): void</div>
        <div class="interface-method forced">+ sleep(): void <span class="unused-tag">↓ Robot không cần!</span></div>
        <div class="interface-method forced">+ takeBreak(): void <span class="unused-tag">↓ Robot không cần!</span></div>
      </div>

      <div class="isp-arrows">
        <svg width="100%" height="32" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <marker id="isp-arrow-red" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="#ef4444" fill-opacity="0.7" />
            </marker>
          </defs>
          <line x1="80" y1="4" x2="80" y2="28" stroke="#ef4444" stroke-width="1.5" opacity="0.5" marker-end="url(#isp-arrow-red)" />
          <line x1="220" y1="4" x2="220" y2="28" stroke="#ef4444" stroke-width="1.5" opacity="0.5" marker-end="url(#isp-arrow-red)" />
        </svg>
      </div>

      <div class="isp-impls-row">
        <div class="impl-box impl-human">
          <div class="impl-header">HumanWorker</div>
          <div class="impl-method ok">work() <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle"><path d="M20 6L9 17l-5-5"/></svg></div>
          <div class="impl-method ok">eat() <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle"><path d="M20 6L9 17l-5-5"/></svg></div>
          <div class="impl-method ok">sleep() <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle"><path d="M20 6L9 17l-5-5"/></svg></div>
          <div class="impl-method ok">takeBreak() <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle"><path d="M20 6L9 17l-5-5"/></svg></div>
        </div>
        <div class="impl-box impl-robot">
          <div class="impl-header">RobotWorker</div>
          <div class="impl-method ok">work() <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle"><path d="M20 6L9 17l-5-5"/></svg></div>
          <div class="impl-method bad">eat() <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> throws!</div>
          <div class="impl-method bad">sleep() <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> throws!</div>
          <div class="impl-method bad">takeBreak() <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> throws!</div>
        </div>
      </div>
    </div>

    <!-- OK View (Segregated) -->
    <div v-else class="isp-diagram">
      <div class="isp-section-label green">Segregated Interfaces</div>
      <div class="segregated-interfaces">
        <div class="small-interface">
          <div class="interface-header ok-if">
            <span class="class-type-badge">«interface»</span>
            <span class="class-name">IWorkable</span>
          </div>
          <div class="interface-method required">+ work(): void</div>
        </div>
        <div class="small-interface">
          <div class="interface-header ok-if">
            <span class="class-type-badge">«interface»</span>
            <span class="class-name">IEatable</span>
          </div>
          <div class="interface-method required">+ eat(): void</div>
        </div>
        <div class="small-interface">
          <div class="interface-header ok-if">
            <span class="class-type-badge">«interface»</span>
            <span class="class-name">ISleepable</span>
          </div>
          <div class="interface-method required">+ sleep(): void</div>
        </div>
      </div>

      <div class="isp-arrows">
        <svg width="100%" height="32" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <marker id="isp-arrow-green" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="#10b981" fill-opacity="0.85" />
            </marker>
          </defs>
          <line x1="80" y1="4" x2="80" y2="28" stroke="#10b981" stroke-width="1.5" opacity="0.6" marker-end="url(#isp-arrow-green)" />
          <line x1="220" y1="4" x2="220" y2="28" stroke="#10b981" stroke-width="1.5" opacity="0.6" marker-end="url(#isp-arrow-green)" />
        </svg>
      </div>

      <div class="isp-impls-row">
        <div class="impl-box impl-human-ok">
          <div class="impl-header">HumanWorker</div>
          <div class="impl-badge-list">
            <span class="isp-badge">IWorkable</span>
            <span class="isp-badge">IEatable</span>
            <span class="isp-badge">ISleepable</span>
          </div>
          <div class="impl-method ok">All methods used <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle"><path d="M20 6L9 17l-5-5"/></svg></div>
        </div>
        <div class="impl-box impl-robot-ok">
          <div class="impl-header">RobotWorker</div>
          <div class="impl-badge-list">
            <span class="isp-badge">IWorkable only</span>
          </div>
          <div class="impl-method ok">work() <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle"><path d="M20 6L9 17l-5-5"/></svg> — no bloat!</div>
        </div>
      </div>
    </div>

    <!-- Diagnostic -->
    <div
      class="text-xs font-medium px-4 py-2.5 rounded-xl backdrop-blur-md border"
      :class="activeTab === 'violation'
        ? 'bg-accent-red/10 text-accent-red border-accent-red/30'
        : 'bg-accent-green/10 text-accent-green border-accent-green/30'"
    >
      {{ activeTab === 'violation'
        ? 'Vi phạm ISP: RobotWorker buộc phải implement eat()/sleep() dù không cần, dẫn đến UnsupportedOperationException.'
        : 'ISP đạt: Mỗi class chỉ implement interfaces phù hợp. Robot không bị ép nhận các hành vi không dùng đến.' }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  isOk: boolean;
}>();

const activeTab = ref<'violation' | 'ok'>('violation');

watch(() => props.isOk, (val) => {
  activeTab.value = val ? 'ok' : 'violation';
}, { immediate: true });
</script>

<style scoped>
.isp-quote {
  font-size: 11px;
  color: #64748b;
  font-style: italic;
  padding: 8px 12px;
  background: rgba(255,255,255,0.03);
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.05);
}
.isp-section-label {
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  text-align: center;
  padding: 4px;
}
.isp-section-label.red { color: #ef4444; }
.isp-section-label.green { color: #10b981; }

.isp-diagram {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  padding: 12px;
  background: rgba(15,23,42,0.4);
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.05);
}
.fat-interface, .small-interface {
  border-radius: 8px;
  overflow: hidden;
}
.fat-interface {
  width: 260px;
  border: 1px solid rgba(239,68,68,0.4);
  background: rgba(239,68,68,0.05);
}
.segregated-interfaces {
  display: flex;
  gap: 8px;
}
.small-interface {
  flex: 1;
  border: 1px solid rgba(16,185,129,0.3);
  background: rgba(16,185,129,0.05);
}
.interface-header {
  padding: 5px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}
.interface-header.fat { background: rgba(239,68,68,0.15); }
.interface-header.ok-if { background: rgba(16,185,129,0.1); }
.class-type-badge { font-size: 8px; color: #94a3b8; font-style: italic; }
.class-name { font-size: 12px; font-weight: 700; color: #e2e8f0; font-family: var(--font-mono); }
.interface-method {
  padding: 3px 10px;
  font-size: 10px;
  font-family: var(--font-mono);
  border-top: 1px solid rgba(255,255,255,0.04);
}
.interface-method.required { color: #06b6d4; }
.interface-method.forced { color: #ef4444; display: flex; align-items: center; justify-content: space-between; }
.unused-tag { font-size: 9px; color: #f97316; background: rgba(249,115,22,0.15); padding: 1px 5px; border-radius: 4px; white-space: nowrap; }

.isp-arrows { width: 100%; max-width: 300px; }
.isp-impls-row { display: flex; gap: 16px; width: 100%; max-width: 300px; }
.impl-box {
  flex: 1;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid;
}
.impl-human, .impl-human-ok { border-color: rgba(6,182,212,0.3); background: rgba(6,182,212,0.05); }
.impl-robot { border-color: rgba(239,68,68,0.4); background: rgba(239,68,68,0.06); }
.impl-robot-ok { border-color: rgba(16,185,129,0.3); background: rgba(16,185,129,0.05); }
.impl-header {
  padding: 5px 8px;
  font-size: 11px;
  font-weight: 700;
  color: #e2e8f0;
  font-family: var(--font-mono);
  background: rgba(255,255,255,0.05);
  text-align: center;
}
.impl-method {
  padding: 3px 8px;
  font-size: 10px;
  font-family: var(--font-mono);
  border-top: 1px solid rgba(255,255,255,0.04);
}
.impl-method.ok { color: #10b981; }
.impl-method.bad { color: #ef4444; }
.impl-badge-list {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  padding: 5px 8px;
}
.isp-badge {
  font-size: 9px;
  color: #06b6d4;
  background: rgba(6,182,212,0.1);
  border: 1px solid rgba(6,182,212,0.3);
  border-radius: 4px;
  padding: 1px 5px;
}
</style>
