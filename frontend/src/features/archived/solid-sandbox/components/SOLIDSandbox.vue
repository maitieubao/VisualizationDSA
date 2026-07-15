<template>
  <div class="solid-sandbox-panel">
    
    <!-- Header -->
    <div class="sandbox-header">
      <div class="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="icon-warning">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
        <span class="text-xs font-bold uppercase tracking-wider text-text-secondary">SOLID Inspector & LCOM4 Linter</span>
      </div>
      <div class="flex gap-1.5">
        <span class="sprint-badge">Sprint 7</span>
      </div>
    </div>

    <!-- SOLID Principles Summary -->
    <div class="grid grid-cols-5 gap-2">
      <div 
        v-for="(principle, idx) in solidPrinciples" 
        :key="idx"
        class="principle-card"
        :class="activePrinciple === idx ? 'active' : 'inactive'"
        @click="activePrinciple = idx"
      >
        <div class="text-lg font-bold" :class="principle.color">{{ principle.letter }}</div>
        <div class="text-[10px] font-bold uppercase text-text-secondary mt-1">{{ principle.name }}</div>
      </div>
    </div>

    <!-- Active Principle Details -->
    <div class="active-principle-details">
      <div class="flex items-start gap-3">
        <div class="badge-icon" :class="solidPrinciples[activePrinciple].color">
          {{ solidPrinciples[activePrinciple].letter }}
        </div>
        <div>
          <div class="text-sm font-bold text-text-secondary">{{ solidPrinciples[activePrinciple].fullName }}</div>
          <div class="text-xs text-text-secondary mt-1">{{ solidPrinciples[activePrinciple].description }}</div>
        </div>
      </div>
    </div>

    <!-- LCOM4 Cohesion Analyzer -->
    <div class="lcom4-panel border border-border-subtle rounded-xl p-4">
      <div class="flex items-center justify-between mb-4">
        <div class="text-[11px] font-bold uppercase tracking-wider text-text-secondary flex items-center gap-2">
          <svg class="w-4 h-4 text-accent-green" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
          LCOM4 Cohesion Analyzer (SRP Check)
        </div>
        <button 
          @click="analyzeCohesion"
          class="btn-cohesion"
        >
          Phân tích Cohesion
        </button>
      </div>

      <!-- Class Selection -->
      <div class="flex gap-2 mb-4">
        <button 
          v-for="cls in sampleClasses" 
          :key="cls.className"
          @click="selectedClass = cls"
          class="class-select-btn"
          :class="selectedClass.className === cls.className ? 'active' : 'inactive'"
        >
          {{ cls.className }}
        </button>
      </div>

      <!-- LCOM4 Result -->
      <div v-if="lcom4Result" class="space-y-3">
        <div class="flex items-center justify-between p-3 rounded-lg result-summary" :class="lcom4Result.violatesSRP ? 'violates' : 'cohesive'">
          <div>
            <div class="text-[10px] text-text-secondary uppercase">LCOM4 Value</div>
            <div class="text-2xl font-bold" :class="lcom4Result.violatesSRP ? 'text-accent-red' : 'text-accent-green'">
              {{ lcom4Result.lcom4Value }}
            </div>
          </div>
          <div class="text-right">
            <div class="text-[10px] text-text-secondary uppercase">Cohesion Score</div>
            <div class="text-lg font-bold" :class="lcom4Result.violatesSRP ? 'text-accent-red' : 'text-accent-green'">
              {{ (lcom4Result.cohesionScore * 100).toFixed(0) }}%
            </div>
          </div>
        </div>

        <div class="text-xs" :class="lcom4Result.violatesSRP ? 'text-accent-red' : 'text-accent-green'">
          {{ lcom4Result.analysis }}
        </div>

        <!-- Connected Components Visualization -->
        <div class="space-y-2">
          <div class="text-[10px] font-bold uppercase text-text-muted">Connected Components</div>
          <div class="flex flex-wrap gap-2">
            <div 
              v-for="(component, idx) in lcom4Result.connectedComponents" 
              :key="idx"
              class="component-badge"
              :class="lcom4Result.connectedComponents.length > 1 ? 'violates' : 'cohesive'"
            >
              Group {{ idx + 1 }}: {{ component.join(', ') }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- LSP Violation Demo with Cracked Glass -->
    <div class="lsp-panel border border-border-subtle rounded-xl p-4 relative overflow-hidden">
      <div class="flex items-center justify-between mb-4">
        <div class="text-[11px] font-bold uppercase tracking-wider text-text-secondary flex items-center gap-2">
          <svg class="w-4 h-4 text-accent-red" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
          </svg>
          LSP Substitution Demo
        </div>
        <button 
          @click="triggerLSPViolation"
          class="btn-lsp-violation"
        >
          Vi phạm LSP
        </button>
      </div>

      <!-- Class Hierarchy -->
      <div class="grid grid-cols-3 gap-3 mb-4">
        <div class="class-hierarchy-node bird">
          <div class="text-xs font-bold text-accent-green">Bird</div>
          <div class="text-[10px] text-text-secondary mt-1">fly()</div>
        </div>
        <div class="class-hierarchy-node sparrow">
          <div class="text-xs font-bold text-accent-primary">Sparrow</div>
          <div class="text-[10px] text-text-secondary mt-1">@Override fly()</div>
        </div>
        <div 
          class="class-hierarchy-node ostrich"
          :class="{ 'violated': showCrackedGlass }"
          @click="triggerLSPViolation"
        >
          <div class="text-xs font-bold text-accent-red">Ostrich</div>
          <div class="text-[10px] text-text-secondary mt-1">throws Error</div>
          <div v-if="showCrackedGlass" class="text-[9px] text-accent-red mt-1 font-bold">VI PHẠM LSP!</div>
        </div>
      </div>

      <!-- Cracked Glass Canvas Overlay -->
      <div v-if="showCrackedGlass" class="absolute inset-0 pointer-events-none">
        <canvas 
          ref="crackCanvas"
          class="w-full h-full"
        />
      </div>

      <div class="text-xs text-text-secondary">
        <span class="font-bold text-accent-red">LSP Violation:</span> Ostrich kế thừa Bird nhưng không thể fly() - 
        đây là vi phạm nguyên lý thay thế Liskov. Click "Vi phạm LSP" để xem hiệu ứng kính vỡ.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import {
  SOLIDLCOM4Calculator,
  type ClassCohesionData,
  type LCOM4Result,
} from '../SOLIDLCOM4Calculator';
import { LspGlassCracker } from '../LspGlassCracker';

// SOLID Principles Data
const solidPrinciples = [
  {
    letter: 'S',
    name: 'SRP',
    fullName: 'Single Responsibility Principle',
    description: 'Một class chỉ nên có một lý do để thay đổi. Phân tích bằng LCOM4 cohesion score.',
    color: 'text-accent-green',
  },
  {
    letter: 'O',
    name: 'OCP',
    fullName: 'Open/Closed Principle',
    description: 'Mở rộng behavior mà không cần sửa đổi source code hiện có.',
    color: 'text-accent-blue',
  },
  {
    letter: 'L',
    name: 'LSP',
    fullName: 'Liskov Substitution Principle',
    description: 'Lớp con phải có thể thay thế lớp cha mà không làm hỏng chương trình.',
    color: 'text-accent-red',
  },
  {
    letter: 'I',
    name: 'ISP',
    fullName: 'Interface Segregation Principle',
    description: 'Client không nên phụ thuộc vào interfaces họ không sử dụng.',
    color: 'text-accent-purple',
  },
  {
    letter: 'D',
    name: 'DIP',
    fullName: 'Dependency Inversion Principle',
    description: 'Phụ thuộc vào abstraction, không phụ thuộc vào concrete implementation.',
    color: 'text-accent-yellow',
  },
];

const activePrinciple = ref(2); // LSP active by default

// LCOM4 Analysis
const lcom4Result = ref<LCOM4Result | null>(null);

const sampleClasses: ClassCohesionData[] = [
  {
    className: 'GoodEmployee',
    fields: [
      { name: 'name', type: 'string' },
      { name: 'salary', type: 'number' },
    ],
    methods: [
      { name: 'getName', accessedFields: ['name'] },
      { name: 'setName', accessedFields: ['name'] },
      { name: 'getSalary', accessedFields: ['salary'] },
      { name: 'setSalary', accessedFields: ['salary'] },
      { name: 'calculateBonus', accessedFields: ['salary'] },
    ],
  },
  {
    className: 'BadEmployee',
    fields: [
      { name: 'name', type: 'string' },
      { name: 'salary', type: 'number' },
      { name: 'printerName', type: 'string' },
      { name: 'reportFormat', type: 'string' },
    ],
    methods: [
      { name: 'getName', accessedFields: ['name'] },
      { name: 'getSalary', accessedFields: ['salary'] },
      { name: 'printReport', accessedFields: ['printerName', 'reportFormat'] },
      { name: 'formatReport', accessedFields: ['reportFormat'] },
      { name: 'sendToPrinter', accessedFields: ['printerName'] },
    ],
  },
];

const selectedClass = ref<ClassCohesionData>(sampleClasses[0]);

function analyzeCohesion() {
  const result = SOLIDLCOM4Calculator.calculateLCOM4(selectedClass.value);
  lcom4Result.value = result;
}

// LSP Cracked Glass Effect
const showCrackedGlass = ref(false);
const crackCanvas = ref<HTMLCanvasElement | null>(null);

async function triggerLSPViolation() {
  showCrackedGlass.value = true;
  
  await nextTick();
  
  const canvas = crackCanvas.value;
  if (!canvas) return;
  
  // Set canvas size to match parent
  const parent = canvas.parentElement;
  if (parent) {
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;
  }
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  // Trigger cracked glass animation at center
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(canvas.width, canvas.height) * 0.4;
  
  LspGlassCracker.animateCracks(ctx, centerX, centerY, radius, 600);
  
  // Auto-hide after 3 seconds
  setTimeout(() => {
    showCrackedGlass.value = false;
  }, 3000);
}

// Initial analysis
onMounted(() => {
  analyzeCohesion();
});
</script>

<style scoped>
.solid-sandbox-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px;
  background-color: color-mix(in srgb, var(--vis-panel-bg) 70%, transparent);
  backdrop-filter: blur(var(--glass-blur));
  border: 1px solid color-mix(in srgb, var(--color-border-subtle) 80%, transparent);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-xl);
  transition: var(--transition-smooth);
}

.sandbox-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--color-border-subtle);
  padding-bottom: 16px;
}

.icon-warning {
  color: var(--color-accent-yellow);
}

.sprint-badge {
  font-size: 10px;
  font-weight: var(--font-bold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background-color: var(--color-accent-yellow-dim);
  color: var(--color-accent-yellow);
  border: 1px solid color-mix(in srgb, var(--color-accent-yellow) 40%, transparent);
  padding: 4px 8px;
  border-radius: var(--radius-sm);
}

.principle-card {
  padding: 12px;
  border-radius: var(--radius-lg);
  border: 1px solid transparent;
  text-align: center;
  cursor: pointer;
  transition: var(--transition-fast);
}

.principle-card.active {
  background-color: var(--color-accent-yellow-dim);
  border-color: color-mix(in srgb, var(--color-accent-yellow) 40%, transparent);
}

.principle-card.inactive {
  background-color: color-mix(in srgb, var(--color-bg-secondary) 50%, transparent);
  border-color: var(--color-border-subtle);
}

.principle-card.inactive:hover {
  background-color: color-mix(in srgb, var(--color-bg-surface) 50%, transparent);
}

.active-principle-details {
  padding: 16px;
  background-color: color-mix(in srgb, var(--color-bg-secondary) 50%, transparent);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-xl);
}

.badge-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-lg);
  background-color: color-mix(in srgb, var(--color-accent-yellow) 50%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-accent-yellow) 30%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: var(--font-bold);
}

.lcom4-panel, .lsp-panel {
  background-color: color-mix(in srgb, var(--vis-panel-bg-deep) 60%, transparent);
  border: 1px solid var(--color-border-subtle);
  transition: var(--transition-smooth);
}

.btn-cohesion {
  padding: 6px 12px;
  background-color: var(--color-accent-green-dim);
  border: 1px solid color-mix(in srgb, var(--color-accent-green) 40%, transparent);
  color: var(--color-accent-green);
  font-size: 10px;
  font-weight: var(--font-bold);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: var(--transition-fast);
}

.btn-cohesion:hover {
  background-color: color-mix(in srgb, var(--color-accent-green) 40%, transparent);
}

.class-select-btn {
  padding: 6px 12px;
  border-radius: var(--radius-md);
  font-size: 10px;
  font-weight: var(--font-bold);
  cursor: pointer;
  transition: var(--transition-fast);
}

.class-select-btn.active {
  background-color: var(--color-accent-cyan-dim);
  color: var(--color-accent-primary);
  border: 1px solid color-mix(in srgb, var(--color-accent-cyan) 40%, transparent);
}

.class-select-btn.inactive {
  background-color: color-mix(in srgb, var(--color-bg-secondary) 50%, transparent);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border-subtle);
}

.result-summary {
  border: 1px solid transparent;
}

.result-summary.violates {
  background-color: var(--color-accent-red-dim);
  border-color: color-mix(in srgb, var(--color-accent-red) 40%, transparent);
}

.result-summary.cohesive {
  background-color: var(--color-accent-green-dim);
  border-color: color-mix(in srgb, var(--color-accent-green) 40%, transparent);
}

.component-badge {
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  font-size: 10px;
  font-family: var(--font-mono);
  border: 1px solid transparent;
}

.component-badge.violates {
  background-color: var(--color-accent-red-dim);
  color: var(--color-accent-red);
  border-color: color-mix(in srgb, var(--color-accent-red) 30%, transparent);
}

.component-badge.cohesive {
  background-color: var(--color-accent-green-dim);
  color: var(--color-accent-green);
  border-color: color-mix(in srgb, var(--color-accent-green) 30%, transparent);
}

.btn-lsp-violation {
  padding: 6px 12px;
  background-color: var(--color-accent-red-dim);
  border: 1px solid color-mix(in srgb, var(--color-accent-red) 40%, transparent);
  color: var(--color-accent-red);
  font-size: 10px;
  font-weight: var(--font-bold);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: var(--transition-fast);
}

.btn-lsp-violation:hover {
  background-color: color-mix(in srgb, var(--color-accent-red) 40%, transparent);
}

.class-hierarchy-node {
  padding: 12px;
  border-radius: var(--radius-lg);
  text-align: center;
  border: 1px solid transparent;
}

.class-hierarchy-node.bird {
  background-color: var(--color-accent-green-dim);
  border-color: color-mix(in srgb, var(--color-accent-green) 30%, transparent);
}

.class-hierarchy-node.sparrow {
  background-color: var(--color-accent-cyan-dim);
  border-color: color-mix(in srgb, var(--color-accent-cyan) 30%, transparent);
}

.class-hierarchy-node.ostrich {
  background-color: var(--color-accent-red-dim);
  border-color: color-mix(in srgb, var(--color-accent-red) 30%, transparent);
  cursor: pointer;
  transition: var(--transition-fast);
}

.class-hierarchy-node.ostrich.violated {
  background-color: color-mix(in srgb, var(--color-accent-red) 50%, transparent);
  border-color: color-mix(in srgb, var(--color-accent-red) 50%, transparent);
}

.text-accent-green { color: var(--color-accent-green); }
.text-accent-blue { color: var(--color-accent-blue); }
.text-accent-red { color: var(--color-accent-red); }
.text-accent-purple { color: var(--color-accent-purple); }
.text-accent-yellow { color: var(--color-accent-yellow); }
</style>
