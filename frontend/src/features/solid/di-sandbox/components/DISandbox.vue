<template>
  <div class="di-sandbox backdrop-blur-md border border-border-subtle/80 rounded-2xl p-6 shadow-xl flex flex-col gap-5">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-border-subtle pb-4">
      <div class="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="text-accent">
          <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
          <path d="m12 15-3-3a22 22 0 0 1 2-3.93A9.88 9.88 0 0 1 12 11c.96 0 2.68.37 4.12-1.91a22 22 0 0 1 2 3.93l-3 3"/>
          <path d="M9 12H4.5a2.5 2.5 0 0 1 0-5H9M15 12h4.5a2.5 2.5 0 0 0 0-5H15"/>
        </svg>
        <span class="text-xs font-bold uppercase tracking-wider text-text-secondary">DI Container & IoC Visualizer</span>
      </div>
      <span class="text-[10px] font-bold uppercase tracking-wider bg-accent-cyan/40 text-accent border border-accent-cyan/40 px-2 py-1 rounded-lg">Sprint 8</span>
    </div>

    <!-- Backend Scenario Picker -->
    <ConceptScenarioPicker
      :scenarios="diScenarios"
      :loading="vcrStore.isVcrLoading"
      label="Backend Scenarios (VCR)"
      @select="vcrStore.loadVcrScenario($event)"
    />

    <!-- VCR Explanation Banner -->
    <VcrExplanationBanner
      v-if="vcrStore.isVcrMode && vcrStore.vcrCurrentFrame"
      :action-type="vcrStore.vcrCurrentFrame.actionType"
      :explanation="vcrStore.vcrCurrentFrame.explanation"
      :frame-key="vcrCurrentIndex"
    />

    <!-- VCR Loading / Error -->
    <div v-if="vcrStore.isVcrLoading" class="vcr-api-status vcr-loading">Loading from backend...</div>
    <div v-if="vcrStore.vcrError" class="vcr-api-status vcr-error">{{ vcrStore.vcrError }}</div>

    <!-- VCR Playback Controls -->
    <VcrControls
      v-if="vcrStore.isVcrMode"
      :current-index="vcrCurrentIndex"
      :total-frames="vcrStore.vcrTotalFrames"
      @prev="vcrStore.vcrPrev()"
      @next="vcrStore.vcrNext()"
      @reset="vcrStore.vcrReset()"
      @exit="vcrStore.exitVcrMode()"
    />

    <!-- ─── VCR MODE: Frame State Visualizer ─── -->
    <div v-if="vcrStore.isVcrMode && vcrStore.vcrCurrentFrame" class="vcr-frame-grid">

      <!-- Registered Services -->
      <div class="vcr-panel">
        <div class="vcr-panel-title">
          <span class="dot dot-cyan"></span> Registered Services
          <span class="count-badge">{{ vcrStore.vcrCurrentFrame.registrations.length }}</span>
        </div>
        <div class="vcr-service-list">
          <div
            v-for="reg in vcrStore.vcrCurrentFrame.registrations"
            :key="reg.interfaceName"
            class="vcr-service-item"
            :class="reg.lifetime === 'SINGLETON' ? 'item-singleton' : 'item-transient'"
          >
            <div class="service-name">{{ reg.interfaceName }}</div>
            <div class="service-impl">→ {{ reg.implementationName }}</div>
            <div class="service-meta">
              <span class="lifetime-badge" :class="reg.lifetime === 'SINGLETON' ? 'badge-singleton' : 'badge-transient'">
                {{ reg.lifetime }}
              </span>
              <span v-if="reg.dependencies.length" class="dep-list">
                Deps: {{ reg.dependencies.join(', ') }}
              </span>
            </div>
          </div>
          <div v-if="!vcrStore.vcrCurrentFrame.registrations.length" class="vcr-empty">No services registered yet</div>
        </div>
      </div>

      <!-- Resolved Instances & Cycle Status -->
      <div class="vcr-panel">
        <div class="vcr-panel-title">
          <span class="dot" :class="vcrStore.vcrCurrentFrame.hasCycle ? 'dot-red' : 'dot-green'"></span>
          Resolved Instances
          <span v-if="vcrStore.vcrCurrentFrame.hasCycle" class="cycle-badge">⚠ CYCLE DETECTED</span>
        </div>

        <!-- Active instances -->
        <div v-if="vcrStore.vcrCurrentFrame.instances.length" class="vcr-service-list">
          <div
            v-for="inst in vcrStore.vcrCurrentFrame.instances"
            :key="inst.instanceId"
            class="vcr-instance-item"
            :class="inst.isNew ? 'item-new' : ''"
          >
            <div class="flex items-center gap-2">
              <span class="instance-new-dot" v-if="inst.isNew">NEW</span>
              <span class="service-name">{{ inst.serviceName }}</span>
            </div>
            <div class="service-meta">
              <span class="lifetime-badge" :class="inst.lifetime === 'SINGLETON' ? 'badge-singleton' : 'badge-transient'">
                {{ inst.lifetime }}
              </span>
              <span class="text-[10px] text-text-muted">resolves: {{ inst.resolveCount }}</span>
              <span class="text-[10px] text-text-disabled font-mono">{{ inst.instanceId.slice(0,8) }}…</span>
            </div>
          </div>
        </div>

        <!-- Dependency graph visualization (mini) -->
        <div v-if="vcrStore.vcrCurrentFrame.dependencyGraph" class="dep-graph-mini">
          <div class="vcr-panel-subtitle">Dependency Graph</div>
          <svg class="dep-graph-svg" :viewBox="`0 0 ${depGraphWidth} ${depGraphHeight}`" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <marker id="vcr-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="#06B6D4" fill-opacity="0.85" />
              </marker>
            </defs>
            <!-- Edges -->
            <line
              v-for="(edge, i) in vcrStore.vcrCurrentFrame.dependencyGraph.edges"
              :key="i"
              :x1="nodePositions[edge.from]?.x ?? 0"
              :y1="nodePositions[edge.from]?.y ?? 0"
              :x2="nodePositions[edge.to]?.x ?? 0"
              :y2="nodePositions[edge.to]?.y ?? 0"
              stroke="#06B6D4"
              stroke-width="1.5"
              opacity="0.6"
              marker-end="url(#vcr-arrow)"
            />
            <!-- Nodes -->
            <g
              v-for="(nodeName, idx) in vcrStore.vcrCurrentFrame.dependencyGraph.nodes"
              :key="nodeName"
              :transform="`translate(${nodePositions[nodeName]?.x ?? 0}, ${nodePositions[nodeName]?.y ?? 0})`"
            >
              <circle r="22" fill="rgba(6,182,212,0.1)" stroke="#06B6D4" stroke-width="1.5" />
              <text
                text-anchor="middle"
                dominant-baseline="middle"
                fill="#e2e8f0"
                font-size="8"
                font-family="JetBrains Mono, monospace"
              >{{ shortLabel(nodeName) }}</text>
            </g>
          </svg>
        </div>

        <div v-if="!vcrStore.vcrCurrentFrame.instances.length && !vcrStore.vcrCurrentFrame.dependencyGraph" class="vcr-empty">No instances resolved yet</div>
      </div>
    </div>

    <!-- ─── SANDBOX MODE ─── -->

    <!-- IoC Concept Explanation (hidden in VCR mode) -->
    <div v-if="!vcrStore.isVcrMode" class="ioc-concept-box p-4 border border-border-subtle rounded-xl flex items-center gap-3">
      <div class="w-10 h-10 rounded-lg bg-accent-cyan/50 border border-accent-cyan/30 flex items-center justify-center shrink-0">
        <svg class="w-5 h-5 text-accent" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5 5 4 4 0 0 1-5-5 10 10 0 0 0 10-10z"/>
        </svg>
      </div>
      <div>
        <div class="text-sm font-bold text-text-secondary">Inversion of Control (IoC)</div>
        <div class="text-xs text-text-secondary mt-1">Thay vì class tự tạo dependencies, Container sẽ tiêm chúng vào. Visualize cách dependencies được resolve và quản lý vòng đời.</div>
      </div>
    </div>

    <!-- Service Panels Grid (hidden in VCR mode) -->
    <div v-if="!vcrStore.isVcrMode" class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <DIServiceList :registrations="registrations" :selected-service="selectedService" @select="selectService" @load-sample="registerSampleServices" />
      <DIDependencyGraph :registrations="registrations" :selected-service="selectedService" :cycle-result="cycleResult" @select="selectService" @check-cycles="checkCycles" />
    </div>

    <!-- Resolve Demo Panel (hidden in VCR mode) -->
    <DIResolutionDemo v-if="!vcrStore.isVcrMode" :registrations="registrations" :singletons="singletons" :resolution-result="resolutionResult" v-model:service-to-resolve="serviceToResolve" @resolve="resolveService" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  DIContainerEngine,
  type ServiceRegistration,
  type ServiceInstance,
  type CycleDetectionResult,
  type ResolutionResult,
} from '../DIContainerEngine';
import { useDIContainerStore } from '../store/useDIContainerStore';
import DIServiceList from './DIServiceList.vue';
import DIDependencyGraph from './DIDependencyGraph.vue';
import DIResolutionDemo from './DIResolutionDemo.vue';
import VcrControls from '@/components/VcrControls.vue';
import VcrExplanationBanner from '@/components/VcrExplanationBanner.vue';
import ConceptScenarioPicker from '@/components/ConceptScenarioPicker.vue';

const vcrStore = useDIContainerStore();
const vcrCurrentIndex = computed(() => vcrStore.vcrCurrentIndex);

const diScenarios = [
  { id: 'lifetime-demo', label: 'Lifetime Demo' },
  { id: 'cycle-detection', label: 'Cycle Detection' },
];

const registrations = ref<ServiceRegistration[]>([]);
const selectedService = ref<string>('');
const cycleResult = ref<CycleDetectionResult | null>(null);
const serviceToResolve = ref<string>('');
const resolutionResult = ref<ResolutionResult | null>(null);
const singletons = ref<ServiceInstance[]>([]);

// ── VCR Frame Graph Helpers ──
const depGraphWidth = 320;
const depGraphHeight = 200;

const nodePositions = computed(() => {
  const frame = vcrStore.vcrCurrentFrame;
  const nodes = frame?.dependencyGraph?.nodes ?? [];
  const n = nodes.length;
  const cx = depGraphWidth / 2;
  const cy = depGraphHeight / 2;
  const r = Math.min(cx, cy) - 35;
  const positions: Record<string, { x: number; y: number }> = {};
  nodes.forEach((name, i) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    positions[name] = {
      x: n === 1 ? cx : cx + r * Math.cos(angle),
      y: n === 1 ? cy : cy + r * Math.sin(angle),
    };
  });
  return positions;
});

function shortLabel(name: string): string {
  // Strip leading 'I' from interface names and truncate
  const s = name.startsWith('I') ? name.slice(1) : name;
  return s.length > 10 ? s.slice(0, 9) + '…' : s;
}

function selectService(name: string) {
  selectedService.value = name;
  serviceToResolve.value = name;
}

function checkCycles() {
  cycleResult.value = DIContainerEngine.detectCycles();
}

function resolveService() {
  if (!serviceToResolve.value) return;
  resolutionResult.value = DIContainerEngine.resolve(serviceToResolve.value);
  singletons.value = DIContainerEngine.getSingletonInstances();
}

function registerSampleServices() {
  DIContainerEngine.reset();
  [
    { interfaceName: 'ILogger', implementationName: 'ConsoleLogger', lifetime: 'SINGLETON', dependencies: [] },
    { interfaceName: 'IDatabase', implementationName: 'PostgreSQLDatabase', lifetime: 'SINGLETON', dependencies: ['ILogger'] },
    { interfaceName: 'IUserRepository', implementationName: 'UserRepository', lifetime: 'TRANSIENT', dependencies: ['IDatabase'] },
    { interfaceName: 'IAuthService', implementationName: 'JwtAuthService', lifetime: 'TRANSIENT', dependencies: ['IUserRepository', 'ILogger'] },
    { interfaceName: 'IUserController', implementationName: 'UserController', lifetime: 'TRANSIENT', dependencies: ['IAuthService', 'IUserRepository'] },
  ].forEach(s => DIContainerEngine.register(s as ServiceRegistration));
  registrations.value = DIContainerEngine.getAllRegistrations();
  cycleResult.value = null;
  resolutionResult.value = null;
  singletons.value = [];
}

onMounted(() => registerSampleServices());
</script>

<style scoped>
.di-sandbox {
  background-color: color-mix(in srgb, var(--vis-panel-bg) 70%, transparent);
}
.ioc-concept-box {
  background-color: color-mix(in srgb, var(--color-bg-primary) 60%, transparent);
}

/* === API Status (local) === */
.vcr-api-status { text-align: center; padding: 8px; border-radius: 8px; font-size: 12px; font-weight: 600; }
.vcr-loading { color: #06b6d4; background: rgba(6, 182, 212, 0.1); border: 1px solid rgba(6, 182, 212, 0.2); }
.vcr-error { color: #ef4444; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); }

/* === VCR Frame Visualizer === */
.vcr-frame-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
@media (max-width: 768px) {
  .vcr-frame-grid { grid-template-columns: 1fr; }
}
.vcr-panel {
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(6, 182, 212, 0.2);
  border-radius: 12px;
  padding: 14px;
  backdrop-filter: blur(8px);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.vcr-panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #06b6d4;
}
.vcr-panel-subtitle {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #94a3b8;
  margin-top: 8px;
}
.dot {
  width: 7px;
  height: 7px;
  border-radius: 9999px;
  flex-shrink: 0;
}
.dot-cyan { background: #06b6d4; box-shadow: 0 0 6px #06b6d4; }
.dot-green { background: #10b981; box-shadow: 0 0 6px #10b981; }
.dot-red { background: #ef4444; box-shadow: 0 0 6px #ef4444; animation: pulse 1s infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
.count-badge {
  margin-left: auto;
  font-size: 10px;
  background: rgba(6,182,212,0.15);
  border: 1px solid rgba(6,182,212,0.3);
  color: #06b6d4;
  border-radius: 9999px;
  padding: 1px 7px;
}
.cycle-badge {
  margin-left: auto;
  font-size: 10px;
  background: rgba(239,68,68,0.15);
  border: 1px solid rgba(239,68,68,0.4);
  color: #ef4444;
  border-radius: 6px;
  padding: 2px 8px;
  animation: pulse 1s infinite;
}
.vcr-service-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 260px;
  overflow-y: auto;
}
.vcr-service-item, .vcr-instance-item {
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.item-singleton {
  background: rgba(139,92,246,0.08);
  border-color: rgba(139,92,246,0.25);
}
.item-transient {
  background: rgba(6,182,212,0.06);
  border-color: rgba(6,182,212,0.2);
}
.item-new {
  background: rgba(16,185,129,0.08);
  border-color: rgba(16,185,129,0.3);
  animation: item-flash 0.6s ease;
}
@keyframes item-flash { 0% { opacity: 0; transform: translateY(-4px); } 100% { opacity: 1; transform: none; } }
.service-name {
  font-size: 12px;
  font-weight: 600;
  color: #e2e8f0;
  font-family: var(--font-mono);
}
.service-impl {
  font-size: 11px;
  color: #94a3b8;
  font-family: var(--font-mono);
}
.service-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.lifetime-badge {
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  padding: 1px 6px;
  border-radius: 9999px;
  border: 1px solid;
}
.badge-singleton {
  background: rgba(139,92,246,0.2);
  color: #a78bfa;
  border-color: rgba(139,92,246,0.4);
}
.badge-transient {
  background: rgba(6,182,212,0.15);
  color: #06b6d4;
  border-color: rgba(6,182,212,0.3);
}
.dep-list {
  font-size: 9px;
  color: #64748b;
  font-family: var(--font-mono);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 160px;
}
.instance-new-dot {
  font-size: 8px;
  font-weight: 800;
  background: rgba(16,185,129,0.2);
  color: #10b981;
  border: 1px solid rgba(16,185,129,0.4);
  border-radius: 4px;
  padding: 1px 5px;
}
.dep-graph-mini {
  margin-top: 4px;
}
.dep-graph-svg {
  width: 100%;
  height: 180px;
  background: rgba(15,23,42,0.3);
  border-radius: 10px;
  border: 1px solid rgba(6,182,212,0.1);
}
.vcr-empty {
  text-align: center;
  font-size: 11px;
  color: #475569;
  padding: 20px 0;
  font-style: italic;
}
</style>

