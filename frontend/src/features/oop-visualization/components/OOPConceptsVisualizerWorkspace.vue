<template>
  <div class="oop-visualizer-container" :class="{ 'theory-expanded-layout': isTheoryOpen && isDesktopWide }">
    <div
      class="oop-workspace"
      ref="workspaceRef"
    >
    <!-- Completion Popup Celebrations Modal -->
    <div v-if="showCompletionModal" class="completion-overlay animate-fade-in">
      <div class="completion-modal-card">
        <div class="completion-emoji flex items-center justify-center mb-2">
          <SvgIcon name="party-popper" :size="36" color="var(--color-accent-yellow)" />
        </div>
        <h3 class="completion-title">Hoàn thành bài học!</h3>
        <p class="completion-desc">Bạn đã hoàn thành xuất sắc bài học trực quan về trụ cột <strong>{{ pillarLabel }}</strong>.</p>
        <div class="completion-btn-group">
          <button class="completion-action-btn" @click="advanceToNextPillar">Đọc tiếp Trụ Cột Mới ➔</button>
          <button class="completion-close-btn" @click="showCompletionModal = false">Ở lại xem lại mô phỏng</button>
        </div>
      </div>
    </div>

    <div class="simulation-container">

    <!-- ==================== TOP HEADER (TIGHTENED FOR LAPTOPS) ==================== -->
    <div class="oop-header">
      <div class="header-left">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="header-icon">
          <polygon points="12 2 2 7 12 12 22 7 12 2"/>
          <polyline points="2 17 12 22 22 17"/>
          <polyline points="2 12 12 17 22 12"/>
        </svg>
        <span class="header-title">HỌC OOP TRỰC QUAN</span>
      </div>

      <!-- Pillar Selector -->
      <div class="pillar-tabs">
        <button
          v-for="p in pillars"
          :key="p.id"
          class="pillar-tab"
          :class="{ active: store.activePillar === p.id }"
          @click="store.setPillar(p.id as any)"
        >
          <SvgIcon :name="p.icon" :size="12" class="pillar-svg-icon" />
          <span class="pillar-name">{{ p.label }}</span>
        </button>

        <button
          class="theory-toggle-header-btn"
          :class="{ active: isTheoryOpen }"
          @click="isTheoryOpen = !isTheoryOpen"
          title="Đóng/Mở Bảng Lý thuyết & Tài liệu"
        >
          <div class="flex items-center gap-1">
            <SvgIcon name="book" :size="12" color="currentColor" />
            <span>Lý thuyết</span>
          </div>
        </button>
      </div>
    </div>

    <!-- ==================== LESSON BANNER & VCR CONTROLS (SINGLE ROW) ==================== -->
    <div class="lesson-vcr-row" v-if="store.currentLessonQuestion">
      <div class="lesson-banner-compact" :class="{ 'goal-box-glow': showLessonGoals && store.scenarioStepIndex === 0 }">
        <div class="lesson-icon flex items-center justify-center">
          <SvgIcon name="target" :size="14" color="var(--color-accent-yellow)" />
        </div>
        <div class="lesson-text-wrapper">
          <span class="goal-tag">MỤC TIÊU BÀI HỌC:</span>
          <p class="lesson-text" v-html="store.currentLessonQuestion"></p>
        </div>
        <button
          v-if="store.scenarioStepIndex === 0"
          class="start-lesson-btn"
          @click="startLessonNow"
        >
          <div class="flex items-center gap-1.5">
            <SvgIcon name="rocket" :size="12" color="white" />
            <span>Bắt đầu</span>
          </div>
        </button>
      </div>

      <!-- Compact VCR Controls Panel -->
      <div class="vcr-panel-compact" v-if="store.isPlayingScenario">
        <!-- Action state label -->
        <div class="vcr-action-info mr-2">
          <span class="status-dot" :class="statusColorClass"></span>
          <span class="vcr-action-title text-text-primary font-bold text-[10px] uppercase truncate block max-w-[150px] flex items-center gap-1" :title="currentStepActionTitle" v-html="parseEmojiToSvg(currentStepActionTitle)">
          </span>
        </div>

        <div class="vcr-btn-group">
          <button class="vcr-btn-sm" :disabled="store.scenarioStepIndex === 0" @click="store.prevScenarioStep()" title="Bước trước">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
          </button>
          <button class="vcr-btn-sm vcr-play-sm" v-if="!store.isAutoplayRunning" @click="store.startAutoplay()" title="Tự động chạy">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          </button>
          <button class="vcr-btn-sm vcr-pause-sm" v-else @click="store.pauseAutoplay()" title="Tạm dừng">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
          </button>
          <button class="vcr-btn-sm" @click="store.resetScenario()" title="Bắt đầu lại">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
          </button>
          <button class="vcr-btn-sm" :disabled="store.scenarioStepIndex >= store.totalSteps - 1" @click="store.nextScenarioStep()" title="Bước tiếp">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
          </button>
        </div>

        <div class="vcr-progress-compact">
          <div class="progress-bar-sm">
            <div class="progress-fill-sm" :style="{ width: progressPercent + '%' }"></div>
          </div>
          <span class="step-counter-sm">{{ store.scenarioStepIndex + 1 }} / {{ store.totalSteps }}</span>
        </div>

        <div class="speed-control-compact">
          <button
            v-for="s in [0.5, 1, 1.5, 2]"
            :key="s"
            class="speed-btn-sm"
            :class="{ active: store.playbackSpeed === s }"
            @click="store.changePlaybackSpeed(s)"
          >{{ s }}x</button>
        </div>
      </div>
    </div>

    <!-- ==================== MAIN CONTENT: 3-COLUMN LAYOUT ==================== -->
    <div class="oop-content">

      <!-- LEFT COLUMN: Code + Embedded Console Output Footer -->
      <div class="left-column">
        <!-- Code Panel with Debugger Chevron -->
        <div class="code-panel" v-if="store.currentScenario" :class="{ 'code-panel-focus': store.scenarioStepIndex === 0 }">
          <div class="code-header">
            <div class="terminal-dots">
              <span class="dot dot-red"></span>
              <span class="dot dot-yellow"></span>
              <span class="dot dot-green"></span>
            </div>
            <span class="code-filename" v-html="parseEmojiToSvg(store.currentScenario.title)"></span>
          </div>
          <div class="code-body">
            <div
              v-for="(line, idx) in store.currentScenario.codeLines"
              :key="idx"
              class="code-line"
              :class="{
                'code-line-active': store.activeCodeLines.includes(idx),
                'code-line-keyword-highlighted': keywordHighlightedLines.includes(idx),
                'code-line-error': store.activeCodeLines.includes(idx) && (store.currentAnimation === 'access-denied' || store.currentAnimation === 'abstract-error' || store.currentAnimation === 'compile-error'),
                'code-line-warning': store.activeCodeLines.includes(idx) && store.currentAnimation === 'warning'
              }"
            >
              <div class="debugger-gutter">
                <!-- Glowing Executing Debugger tag instead of static arrow -->
                <span v-if="store.activeCodeLines[0] === idx" class="debugger-chevron flex items-center gap-1">
                  <span class="chevron-arrow">▶</span>
                  <span class="executing-tag">Running</span>
                </span>
              </div>
              <span class="line-number">{{ idx + 1 }}</span>
              <span class="line-content" v-html="highlightSyntax(line)"></span>
            </div>
          </div>

          <!-- Consolidated Console Footer (Execution Log + Violations + Tips) -->
          <div class="code-console-footer" :class="{ 'console-error-mode': store.lastViolation }">
            <div class="console-tab-header">
              <span class="console-dot" :class="statusColorClass"></span>
              <span class="console-tab-title">{{ consoleStatusLabel }}</span>
            </div>

            <div class="console-content">
              <!-- Timeline active frame steps -->
              <div v-if="explanationSteps.length > 0" class="console-steps-list">
                <div v-for="(step, sIdx) in explanationSteps" :key="sIdx" class="console-step-row animate-fade-in" :class="`console-step-${step.type}`">
                  <span class="console-bullet">•</span>
                  <span v-html="step.text"></span>
                </div>
              </div>
              <div v-else class="console-empty">
                Console output ready. Waiting for program run...
              </div>

              <!-- Embedded Violation Alerts -->
              <div v-if="store.lastViolation" class="console-violation-row animate-shake">
                <span class="console-alert-icon">❌ Access Violation:</span>
                <span class="console-alert-text">{{ store.lastViolation.message }}</span>
              </div>

              <!-- Lesson Tip and Common Mistakes -->
              <div v-if="currentLessonTip" class="console-tip-row animate-fade-in">
                <span class="console-tip-icon">💡 Mẹo OOP:</span>
                <span class="console-tip-text">{{ currentLessonTip }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- MIDDLE COLUMN: Sơ đồ UML (Phase 1 Focus) -->
      <div class="diagram-panel">
        <div class="panel-header">
          <SvgIcon name="drafting-compass" :size="14" color="var(--color-accent-primary)" />
          <span class="panel-title">Sơ đồ UML & Trạng thái Đối tượng</span>
        </div>
        <div class="diagram-area" ref="diagramRef">

          <!-- SVG Connections Layer -->
          <svg class="connections-svg" ref="svgRef">
            <g v-for="arrow in inheritanceArrows" :key="arrow.id">
              <line
                :x1="arrow.x1" :y1="arrow.y1"
                :x2="arrow.x2" :y2="arrow.y2"
                :class="[
                  arrow.type === 'realization' ? 'realization-line' : 'inheritance-line',
                  {
                    'inheritance-line-active': arrow.type !== 'realization' && store.currentAnimation === 'inheritance-flow'
                      && store.currentAnimationTarget.fromClass === arrow.parentClass
                      && store.currentAnimationTarget.toClass === arrow.childClass,
                    'realization-line-active': arrow.type === 'realization' && (store.currentAnimation === 'interface-contract' || store.currentAnimation === 'multi-interface')
                      && (store.currentAnimationTarget.fromClass === arrow.parentClass || store.currentAnimationTarget.toClass === arrow.parentClass || store.currentAnimationTarget.className === arrow.parentClass)
                      && store.currentAnimationTarget.toClass === arrow.childClass
                  }
                ]"
              />
              <polygon
                :points="arrowheadPoints(arrow)"
                :class="arrow.type === 'realization' ? 'realization-arrowhead' : 'inheritance-arrowhead'"
              />
            </g>

            <g v-if="store.currentAnimation === 'inheritance-flow' || store.currentAnimation === 'multi-interface' || store.currentAnimation === 'interface-contract'">
              <circle
                v-for="(dot, idx) in flowDotsPos"
                :key="idx"
                class="flow-dot"
                r="5"
                :cx="dot.x"
                :cy="dot.y"
              />
            </g>

            <g v-if="store.currentAnimation === 'polymorphic-dispatch' || store.currentAnimation === 'arrow-flow'">
              <line
                v-if="dispatchArrow"
                :x1="dispatchArrow.x1" :y1="dispatchArrow.y1"
                :x2="dispatchArrow.x2" :y2="dispatchArrow.y2"
                class="dispatch-line"
              />
              <circle
                v-if="dispatchArrow"
                class="dispatch-dot"
                r="6"
                :cx="dispatchDotPos.x"
                :cy="dispatchDotPos.y"
              />
            </g>
          </svg>

          <!-- Class Cards -->
          <div class="class-cards-container" :class="layoutClass">
            <div
              v-for="classDef in store.registeredClasses"
              :key="classDef.className"
              :ref="el => setClassCardRef(classDef.className, el as HTMLElement)"
              class="animated-class-card"
              :class="getCardAnimationClass(classDef)"
            >
              <UMLClassCard
                :class-def="classDef"
                :header-color="getClassColor(classDef.className)"
                :is-active="isClassHighlighted(classDef.className)"
                :is-wiggling="isClassShaking(classDef.className)"
                :violated-field="getViolatedField(classDef.className)"
                :selected-method="getHighlightedMethod(classDef.className)"
                :animation-phase="animationPhase"
                :hovered-member="hoveredMember"
                @hoverMember="onCardMemberHover"
                @clickMethod="onCardMethodClick"
              />
            </div>
          </div>

          <!-- Object State Display (Fills diagram whitespace) -->
          <div class="object-states-container animate-fade-in" :class="{ 'phase-hidden': animationPhase < 2 }" v-if="store.activeMemoryState.heap && store.activeMemoryState.heap.length > 0">
            <div class="object-state-title">
              <SvgIcon name="package" :size="12" color="var(--color-accent-green)" />
              <span>Trạng thái Đối tượng động (Object State)</span>
            </div>
            <div class="object-state-list">
              <div
                v-for="obj in store.activeMemoryState.heap"
                :key="obj.id"
                class="object-state-card"
                :style="{ borderLeftColor: getClassColor(obj.className) }"
                @click="onHeapObjectClick(obj.className)"
                title="Nhấp để nháy sơ đồ UML liên quan"
              >
                <div class="object-card-header">
                  <span class="object-class" :style="{ color: getClassColor(obj.className) }">{{ obj.className }}</span>
                  <span class="object-address">@{{ obj.className }}{{ obj.id }}</span>
                </div>
                <div class="object-card-fields">
                  <div
                    v-for="f in obj.fields"
                    :key="f.name"
                    class="object-field-row"
                    :class="{
                      'field-changed-flash': f.value.includes('Thay đổi') || (store.currentAnimationTarget.memberName === f.name && store.currentAnimation === 'access-granted'),
                      'field-hover-glow': hoveredMember?.className === obj.className && hoveredMember?.memberName === f.name
                    }"
                    @mouseenter="hoveredMember = { className: obj.className, memberName: f.name }"
                    @mouseleave="hoveredMember = null"
                  >
                    <span class="object-field-name">{{ f.name }}</span>
                    <span class="object-field-separator">:</span>
                    <span class="object-field-val">{{ f.value }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- RIGHT COLUMN: Phân bổ Vùng nhớ (Phase 2 Focus) -->
      <div class="memory-panel" v-if="store.isPlayingScenario">
        <div class="panel-header">
          <SvgIcon name="package" :size="14" color="var(--color-accent-purple)" />
          <span class="panel-title">Phân Bổ Vùng Nhớ (Stack & Heap)</span>
        </div>

        <div class="memory-workspace">
          <!-- Stack Grid (Call Stack + Local Variables side-by-side) -->
          <div class="stack-grid">
            
            <!-- Call Stack Dynamic -->
            <div class="call-stack-area">
              <div class="memory-label">Ngăn xếp gọi (Call Stack)</div>
              <div class="call-stack-list">
                <!-- Dotted placeholder for empty Call Stack -->
                <div v-if="!store.activeMemoryState.callStack || store.activeMemoryState.callStack.length === 0" class="memory-placeholder-dashed">
                  <div class="placeholder-icon flex items-center justify-center">
                    <SvgIcon name="hourglass" :size="16" color="var(--color-text-muted)" />
                  </div>
                  <div class="placeholder-text">Chờ khởi chạy...</div>
                  <div class="placeholder-desc">Nhấn Play/Next để đẩy Call Frame vào Stack.</div>
                </div>
                <div
                  v-else
                  v-for="(frame, fIdx) in store.activeMemoryState.callStack"
                  :key="fIdx"
                  class="call-stack-frame"
                  :class="{ 'call-stack-active': fIdx === store.activeMemoryState.callStack.length - 1 }"
                >
                  <span class="call-stack-chevron">▶</span>
                  <span class="call-stack-name">{{ frame }}</span>
                </div>
              </div>
            </div>

            <!-- Local Variables (Stack Frame) -->
            <div class="variables-area">
              <div class="memory-label">Biến Cục Bộ (Stack Frame)</div>
              <div class="stack-frame">
                <!-- Dotted placeholder for empty variables -->
                <div v-if="!store.activeMemoryState.stack || store.activeMemoryState.stack.length === 0" class="memory-placeholder-dashed">
                  <div class="placeholder-icon flex items-center justify-center">
                    <SvgIcon name="hourglass" :size="16" color="var(--color-text-muted)" />
                  </div>
                  <div class="placeholder-text">Biến cục bộ trống</div>
                  <div class="placeholder-desc">Các tham chiếu đối tượng của hàm hiện tại sẽ nằm ở đây.</div>
                </div>
                <div
                  v-else
                  v-for="v in store.activeMemoryState.stack"
                  :key="v.name"
                  :id="`stack-var-${v.name}`"
                  class="stack-var-card animate-fade-in"
                >
                  <span class="var-type">{{ v.type }}</span>
                  <span class="var-name">{{ v.name }}</span>
                  <span class="var-connector-value">{{ v.value }}</span>
                </div>
              </div>
            </div>

          </div>

          <!-- Memory Links SVG Layer -->
          <svg class="memory-links-svg" ref="memorySvgRef" :class="{ 'phase-hidden': animationPhase < 2 }">
            <g v-for="link in memoryLinks" :key="link.id">
              <path
                :d="link.path"
                class="memory-reference-path"
                fill="none"
                stroke="var(--color-accent-green, #10b981)"
                stroke-width="2.5"
                stroke-dasharray="4 4"
              />
              <circle :cx="link.x2" :cy="link.y2" r="4" fill="var(--color-accent-green, #10b981)" />
            </g>
          </svg>

          <!-- Heap area -->
          <div class="heap-area">
            <div class="memory-label">Vùng nhớ Heap (Object Heap Allocation)</div>
            <div class="heap-space">
              <!-- Dotted placeholder for empty Heap -->
              <div v-if="!store.activeMemoryState.heap || store.activeMemoryState.heap.length === 0" class="memory-placeholder-dashed w-full py-6">
                <div class="placeholder-icon flex items-center justify-center gap-1.5">
                  <SvgIcon name="package" :size="16" color="var(--color-text-muted)" />
                  <span>Heap Trống</span>
                </div>
                <div class="placeholder-text">Chưa cấp phát vùng nhớ</div>
                <div class="placeholder-desc">Khi lệnh <code class="text-accent-cyan bg-bg-secondary px-1 rounded">new</code> được chạy, bộ nhớ đối tượng sẽ được phân bổ.</div>
              </div>
              <div
                v-else
                v-for="obj in store.activeMemoryState.heap"
                :key="obj.id"
                :id="`heap-obj-${obj.id}`"
                class="heap-obj-card"
                :style="{ borderColor: getClassColor(obj.className) }"
              >
                <!-- Object Header -->
                <div class="heap-obj-header" :style="{ backgroundColor: getClassColor(obj.className) + '15' }">
                  <span class="heap-obj-type">{{ obj.className }}</span>
                  <span class="heap-obj-id">addr: @{{ obj.className }}{{ obj.id }}</span>
                </div>

                <!-- Object Fields -->
                <div class="heap-obj-fields" v-if="obj.fields && obj.fields.length > 0">
                  <div
                    v-for="f in obj.fields"
                    :key="f.name"
                    class="heap-field-row"
                    :class="{ 
                      'field-violated': f.isViolated,
                      'field-changed': f.value.includes('Thay đổi') || (store.currentAnimationTarget.memberName === f.name && store.currentAnimation === 'access-granted'),
                      'field-hover-glow': hoveredMember?.className === obj.className && hoveredMember?.memberName === f.name
                    }"
                    @mouseenter="hoveredMember = { className: obj.className, memberName: f.name }"
                    @mouseleave="hoveredMember = null"
                  >
                    <span class="heap-field-icon" :class="getAccessClass(f.accessModifier)">
                      <SvgIcon :name="getAccessIcon(f.accessModifier)" :size="10" />
                    </span>
                    <span class="heap-field-name">{{ f.name }}</span>
                    <span class="heap-field-separator">:</span>
                    <span class="heap-field-value">{{ f.value }}</span>

                    <!-- Access Shield overlay -->
                    <div class="field-access-shield" v-if="f.isViolated && (store.currentAnimation === 'access-denied' || store.currentAnimation === 'compile-error')">
                      <SvgIcon name="lock" :size="10" color="#ef4444" />
                      <span>Truy cập bị Chặn</span>
                    </div>
                  </div>
                </div>

                <!-- VTable section -->
                <div class="heap-obj-vtable" v-if="obj.vTable && obj.vTable.length > 0">
                  <div class="vtable-label">VTable (Virtual Method Map)</div>
                  <div v-for="vt in obj.vTable" :key="vt.method" class="vtable-row">
                    <span class="vtable-method">{{ vt.method }}</span>
                    <span class="vtable-arrow">➔</span>
                    <span class="vtable-resolve">{{ vt.resolvesTo }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  </div>

  <!-- Collapsible synchronized theory panel -->
  <TheoryCollapsiblePanel
    v-model:isOpen="isTheoryOpen"
    :document="currentTheoryDoc"
    :activeSectionId="activeTheorySectionId"
    @tagClick="handleTagClick"
  />
</div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, computed, ref, watch, nextTick } from 'vue';
import { useOOPVisualizerStore } from '../store/useOOPVisualizerStore';
import type { ClassDefinition } from '../types/oop-visualization.types';
import UMLClassCard from './UMLClassCard.vue';
import SvgIcon from '../../../components/icons/SvgIcon.vue';
import { parseEmojiToSvg } from '../../../utils/emojiParser';
import TheoryCollapsiblePanel from '../../../shared/components/TheoryCollapsiblePanel.vue';
import { oopTheoryDocs } from '../scenarios/oopTheoryDocs';
import { useConfetti } from '../../../composables/useConfetti';

const store = useOOPVisualizerStore();
const { fireQuizPass } = useConfetti();

const workspaceRef = ref<HTMLElement | null>(null);
const diagramRef = ref<HTMLElement | null>(null);
const svgRef = ref<SVGSVGElement | null>(null);
const memorySvgRef = ref<SVGSVGElement | null>(null);

const animationPhase = ref(0); // 0: Code, 1: UML, 2: Memory, 3: Timeline/Theory
let phaseTimers: any[] = [];

// Inter-panel linking states
const hoveredMember = ref<{ className: string; memberName: string } | null>(null);
const keywordHighlightedLines = ref<number[]>([]);
const showLessonGoals = ref(true);
const showCompletionModal = ref(false);

// Theory Panel state
const isTheoryOpen = ref(false);
const isDesktopWide = ref(false);
const currentTheoryDoc = computed(() => {
  return oopTheoryDocs[store.activePillar] || null;
});
const activeTheorySectionId = ref<string | null>(null);

const pillarLabel = computed(() => {
  switch (store.activePillar) {
    case 'encapsulation': return 'Tính Đóng Gói';
    case 'inheritance': return 'Tính Kế Thừa';
    case 'polymorphism': return 'Tính Đa Hình';
    case 'abstraction': return 'Tính Trừu Tượng';
    case 'interface': return 'Interface';
    default: return 'OOP';
  }
});

// Step tips and common mistakes mapping
const STEP_TIPS: Record<string, Record<number, string>> = {
  encapsulation: {
    0: 'Trường dữ liệu "_balance" được che giấu bằng Access Modifier "private" để chặn truy cập bừa bãi.',
    1: 'Sử dụng "private" bảo vệ dữ liệu, tránh việc đối tượng bên ngoài gán giá trị làm hỏng trạng thái.',
    2: 'Thuộc tính (Properties) đóng vai trò là "cổng gác" kiểm soát đọc/ghi trường private an toàn.',
    3: 'Khối "set" kiểm tra điều kiện "value >= 0" trước khi gán. Đây là logic bảo vệ toàn vẹn dữ liệu.',
    4: 'Lỗi thường gặp: Cố gắng thay đổi trường balance bằng lệnh acc.balance = 9999 trực tiếp sẽ báo lỗi biên dịch!',
    5: 'Tổng kết: Nhờ đóng gói, thay đổi nội bộ lớp BankAccount không làm ảnh hưởng đến mã nguồn bên ngoài.'
  },
  inheritance: {
    0: 'Các lớp con (Dog, Cat) chia sẻ chung mã nguồn bằng cách kế thừa lớp cha Animal.',
    1: 'Trường "Name" là "protected" cho phép lớp Dog truy cập trực tiếp, nhưng bên ngoài vẫn bị chặn.',
    2: 'Cơ chế khởi tạo: Khi gọi new Dog(), C# sẽ tự động gọi constructor lớp cha Animal() trước để tạo khung.',
    3: 'Luồng gọi phương thức: C# tra cứu Eat() trong Dog. Không thấy? Nó chạy lên lớp cha Animal để gọi.',
    4: 'Tổng kết: Kế thừa giúp tái sử dụng mã nguồn hiệu quả và thiết lập mối liên hệ IS-A.'
  },
  polymorphism: {
    0: 'Đa hình: Cùng gửi thông điệp Speak(), nhưng đối tượng Dog sủa, Cat kêu meo meo khác biệt.',
    1: 'Từ khóa "virtual" khai báo ở lớp cha cho phép các lớp con "override" (ghi đè) hành vi.',
    2: 'Bảng phương thức ảo (VTable) được tạo trong Heap để lưu địa chỉ thực tế của Speak() cho từng đối tượng.',
    3: 'Khi chạy: runtime tra cứu VTable của Dog, ánh xạ trực tiếp đến Speak() của lớp Dog. Đó là Dynamic Dispatch.',
    4: 'Mặc dù gọi qua tham chiếu Animal, C# vẫn gọi đúng Speak() của Cat nhờ VTable tra cứu động.',
    5: 'Tổng kết: Đa hình giúp mã nguồn linh hoạt, xử lý được nhiều lớp con mà không cần viết lại mã.'
  },
  abstraction: {
    0: 'Tính trừu tượng tập trung định nghĩa hành vi chung qua lớp "abstract class".',
    1: 'Phương thức Start() là abstract, không chứa code triển khai, ép lớp con bắt buộc phải viết đè.',
    2: 'Lỗi thường gặp: Cố gắng new Vehicle() trực tiếp sẽ lập tức gây lỗi biên dịch vì lớp abstract chỉ là bản thiết kế mẫu.',
    3: 'Lớp con Car bắt buộc phải thực thi Start() cụ thể, nếu không bản thân Car cũng phải khai báo abstract.',
    4: 'Tổng kết: Trừu tượng giúp thiết kế khung kiến trúc hệ thống bền vững, che giấu chi tiết phức tạp.'
  },
  interface: {
    0: 'Interface như một cam kết giao ước. Nó không chứa dữ liệu mà chỉ khai báo các hợp đồng phương thức.',
    1: 'OrderService giao tiếp qua giao diện IPayment, không phụ thuộc CreditCard, giúp giảm ràng buộc (Loose Coupling).',
    2: 'Một lớp (CreditCard) có thể thực hiện đồng thời nhiều giao diện, bổ sung khả năng đa dạng.',
    3: 'Dễ dàng mở rộng: Cắm thêm MoMo vào thay thế CreditCard mà không cần thay đổi một dòng code nào của OrderService.',
    4: 'Tổng kết: Giao diện là nền tảng tối thượng cho cấu trúc hệ thống mô-đun, dễ bảo trì và cắm ghép.'
  }
};

const currentLessonTip = computed(() => {
  return STEP_TIPS[store.activePillar]?.[store.scenarioStepIndex] || '';
});

const currentStepActionTitle = computed(() => {
  if (!store.currentScenario) return 'Khởi tạo';
  const step = store.currentScenario.steps[store.scenarioStepIndex];
  if (!step) return '';
  const clean = step.explanation.replace(/<\/?[^>]+(>|$)/g, "").split(/[.!?]/)[0];
  return clean ? clean.trim() : 'Mô phỏng chạy';
});

const statusColorClass = computed(() => {
  if (store.lastViolation) return 'status-error';
  if (store.isAutoplayRunning) return 'status-running';
  return 'status-waiting';
});

const consoleStatusLabel = computed(() => {
  if (store.lastViolation) return 'Access Denied / Compiler Block';
  if (store.isAutoplayRunning) return 'Mô phỏng đang chạy...';
  return 'Chờ lệnh kế tiếp';
});

function startLessonNow() {
  showLessonGoals.value = false;
  store.nextScenarioStep();
}

function startLessonNowFirst() {
  showLessonGoals.value = false;
}

// Map scenario pillar and step index to Theory Section IDs for active sync
const STEP_THEORY_MAPPING: Record<string, Record<number, string>> = {
  encapsulation: {
    0: 'encap-concept',
    1: 'access-modifiers',
    2: 'encap-properties',
    3: 'encap-properties',
    4: 'memory-protection',
    5: 'memory-protection'
  },
  inheritance: {
    0: 'inherit-concept',
    1: 'code-reuse',
    2: 'code-reuse',
    3: 'memory-inheritance',
    4: 'memory-inheritance'
  },
  polymorphism: {
    0: 'poly-concept',
    1: 'virtual-override',
    2: 'virtual-override',
    3: 'dynamic-dispatch',
    4: 'dynamic-dispatch',
    5: 'dynamic-dispatch'
  },
  abstraction: {
    0: 'abstract-concept',
    1: 'abstract-class',
    2: 'abstract-class',
    3: 'abstract-purpose',
    4: 'abstract-purpose'
  },
  interface: {
    0: 'interface-concept',
    1: 'interface-syntax',
    2: 'interface-syntax',
    3: 'interface-loose-coupling',
    4: 'interface-loose-coupling'
  }
};

function resetAndStartPhasing() {
  phaseTimers.forEach(clearTimeout);
  phaseTimers = [];

  animationPhase.value = 0;

  phaseTimers.push(
    setTimeout(() => {
      animationPhase.value = 1;
      updateArrows();
    }, 250)
  );

  phaseTimers.push(
    setTimeout(() => {
      animationPhase.value = 2;
      updateMemoryLinks();
    }, 500)
  );

  phaseTimers.push(
    setTimeout(() => {
      animationPhase.value = 3;
    }, 750)
  );
}

interface MemoryLinkData {
  id: string;
  path: string;
  x2: number;
  y2: number;
}
const memoryLinks = ref<MemoryLinkData[]>([]);

function getAccessIcon(mod: string): string {
  switch (mod) {
    case 'PRIVATE': return 'lock';
    case 'PROTECTED': return 'shield';
    case 'PUBLIC': return 'globe';
    default: return 'lock';
  }
}

function getAccessClass(mod: string): string {
  switch (mod) {
    case 'PRIVATE': return 'access-private';
    case 'PROTECTED': return 'access-protected';
    case 'PUBLIC': return 'access-public';
    default: return 'access-private';
  }
}

function updateMemoryLinks() {
  nextTick(() => {
    const svg = memorySvgRef.value;
    if (!svg) {
      memoryLinks.value = [];
      return;
    }
    const svgRect = svg.getBoundingClientRect();

    const links: MemoryLinkData[] = [];
    const stack = store.activeMemoryState?.stack;

    if (!stack) return;

    for (const v of stack) {
      if (v.pointsToId !== undefined) {
        const varEl = document.getElementById(`stack-var-${v.name}`);
        const objEl = document.getElementById(`heap-obj-${v.pointsToId}`);

        if (varEl && objEl) {
          const varRect = varEl.getBoundingClientRect();
          const objRect = objEl.getBoundingClientRect();

          // Connect from bottom center of Stack variable card
          const x1 = varRect.left - svgRect.left + varRect.width / 2;
          const y1 = varRect.bottom - svgRect.top;

          // Connect to top center of Heap object card
          const x2 = objRect.left - svgRect.left + objRect.width / 2;
          const y2 = objRect.top - svgRect.top;

          // Vertical S-curve Bezier control points
          const dy = Math.abs(y2 - y1) * 0.4;
          const path = `M ${x1} ${y1} C ${x1} ${y1 + dy}, ${x2} ${y2 - dy}, ${x2} ${y2}`;

          links.push({
            id: `${v.name}-${v.pointsToId}`,
            path,
            x2,
            y2,
          });
        }
      }
    }

    memoryLinks.value = links;
  });
}

// Pillar config
const pillars = [
  { id: 'encapsulation', icon: 'lock', label: 'Đóng Gói' },
  { id: 'inheritance', icon: 'dna', label: 'Kế Thừa' },
  { id: 'polymorphism', icon: 'masks', label: 'Đa Hình' },
  { id: 'abstraction', icon: 'drafting-compass', label: 'Trừu Tượng' },
  { id: 'interface', icon: 'link', label: 'Interface' },
];

// Class card DOM refs for arrow computation
const classCardRefs = ref<Map<string, HTMLElement>>(new Map());

function setClassCardRef(className: string, el: HTMLElement | null) {
  if (el) {
    classCardRefs.value.set(className, el);
  }
}

// Progress bar
const progressPercent = computed(() => {
  if (store.totalSteps <= 1) return 100;
  return ((store.scenarioStepIndex) / (store.totalSteps - 1)) * 100;
});

// Layout class based on number of classes
const layoutClass = computed(() => {
  const count = store.registeredClasses.length;
  if (count === 1) return 'layout-single';
  if (count === 2) return 'layout-pair';
  return 'layout-tree';
});

// Parse the current explanation string into a structured list of checklist steps
const explanationSteps = computed(() => {
  if (!store.currentExplanation) return [];
  return store.currentExplanation
    .split(/<br\s*\/?>|\n/)
    .map(line => line.replace(/<\/?[^>]+(>|$)/g, "").trim()) // strip HTML for analysis
    .filter(line => line.length > 0)
    .map(line => {
      let type = 'info';
      if (line.includes('✓') || line.includes('✅') || line.toLowerCase().includes('hợp lệ') || line.toLowerCase().includes('thành công')) {
        type = 'success';
      } else if (line.includes('❌') || line.toLowerCase().includes('lỗi') || line.toLowerCase().includes('từ chối')) {
        type = 'error';
      } else if (line.includes('⚠️') || line.toLowerCase().includes('cảnh báo')) {
        type = 'warning';
      } else if (line.includes('🆕') || line.includes('📦') || line.toLowerCase().includes('khởi tạo') || line.toLowerCase().includes('tạo đối tượng')) {
        type = 'new';
      }
      return { type, text: line };
    });
});

// Class colors
const CLASS_COLORS: Record<string, string> = {
  BankAccount: 'var(--color-accent-green)',
  Animal: 'var(--color-accent-primary)',
  Dog: 'var(--color-accent-yellow)',
  Cat: 'var(--color-accent-purple)',
  Vehicle: 'var(--color-accent-primary)',
  Car: 'var(--color-accent-green)',
  Bike: 'var(--color-accent-yellow)',
};

function getClassColor(className: string): string {
  return CLASS_COLORS[className] ?? 'var(--color-accent-cyan)';
}

// Animation highlights
function isClassHighlighted(className: string): boolean {
  const anim = store.currentAnimation;
  const target = store.currentAnimationTarget;

  if (anim === 'highlight-class' && target.className === className) return true;
  if (anim === 'create-object' && target.className === className) return true;
  if (anim === 'access-granted' && target.className === className) return true;
  if (anim === 'override-flash' && target.className === className) return true;
  return false;
}

function isClassShaking(className: string): boolean {
  const anim = store.currentAnimation;
  const target = store.currentAnimationTarget;

  if (anim === 'access-denied' && target.className === className) return true;
  if (anim === 'abstract-error' && target.className === className) return true;
  return false;
}

function getViolatedField(className: string): string | null {
  if (store.lastViolation?.className === className) {
    return store.lastViolation.memberName;
  }
  return null;
}

function getHighlightedMethod(className: string): string | null {
  const anim = store.currentAnimation;
  const target = store.currentAnimationTarget;

  if (
    (anim === 'highlight-member' || anim === 'access-granted' || anim === 'override-flash')
    && target.className === className
    && target.memberName
  ) {
    return `${className}.${target.memberName}`;
  }
  return null;
}

function getCardAnimationClass(classDef: ClassDefinition): Record<string, boolean> {
  const anim = store.currentAnimation;
  const target = store.currentAnimationTarget;
  const cn = classDef.className;

  return {
    'card-glow': isClassHighlighted(cn),
    'card-shake': isClassShaking(cn) && anim !== 'warning',
    'card-warning-pulse': anim === 'warning' && target.className === cn,
    'card-create-pulse': anim === 'create-object' && target.className === cn,
    'card-inheritance-receiver': anim === 'inheritance-flow' && target.toClass === cn,
    'card-dispatch-source': anim === 'polymorphic-dispatch' && target.fromClass === cn,
    'card-dispatch-target': anim === 'polymorphic-dispatch' && (target.toClass === cn || target.secondToClass === cn),
  };
}

// Inheritance connection arrows
interface ArrowData {
  id: string;
  parentClass: string;
  childClass: string;
  x1: number; y1: number;
  x2: number; y2: number;
  type?: 'inheritance' | 'realization';
}

const inheritanceArrows = ref<ArrowData[]>([]);
const flowDotsPos = ref<Array<{ x: number, y: number }>>([]);
const dispatchArrow = ref<ArrowData | null>(null);
const dispatchDotPos = ref({ x: 0, y: 0 });

let flowAnimFrame: number | null = null;
let dispatchAnimFrame: number | null = null;

function updateArrows() {
  nextTick(() => {
    const diagram = diagramRef.value;
    if (!diagram) return;
    const dRect = diagram.getBoundingClientRect();

    const arrows: ArrowData[] = [];

    for (const cls of store.registeredClasses) {
      if (cls.parentClass) {
        const parentEl = classCardRefs.value.get(cls.parentClass);
        const childEl = classCardRefs.value.get(cls.className);

        if (parentEl && childEl) {
          const pRect = parentEl.getBoundingClientRect();
          const cRect = childEl.getBoundingClientRect();

          arrows.push({
            id: `${cls.parentClass}-${cls.className}`,
            parentClass: cls.parentClass,
            childClass: cls.className,
            x1: pRect.left - dRect.left + pRect.width / 2,
            y1: pRect.top - dRect.top + pRect.height,
            x2: cRect.left - dRect.left + cRect.width / 2,
            y2: cRect.top - dRect.top,
            type: 'inheritance',
          });
        }
      }

      if (cls.interfaces) {
        for (const itf of cls.interfaces) {
          const parentEl = classCardRefs.value.get(itf);
          const childEl = classCardRefs.value.get(cls.className);

          if (parentEl && childEl) {
            const pRect = parentEl.getBoundingClientRect();
            const cRect = childEl.getBoundingClientRect();

            arrows.push({
              id: `${itf}-${cls.className}`,
              parentClass: itf,
              childClass: cls.className,
              x1: pRect.left - dRect.left + pRect.width / 2,
              y1: pRect.top - dRect.top + pRect.height,
              x2: cRect.left - dRect.left + cRect.width / 2,
              y2: cRect.top - dRect.top,
              type: 'realization',
            });
          }
        }
      }
    }

    inheritanceArrows.value = arrows;
    updateMemoryLinks();
  });
}

function arrowheadPoints(arrow: ArrowData): string {
  const { x1, y1 } = arrow;
  const size = 8;
  return `${x1},${y1} ${x1 - size},${y1 + size + 2} ${x1 + size},${y1 + size + 2}`;
}

// Flow dots animation
function startFlowDotAnimation() {
  if (flowAnimFrame) cancelAnimationFrame(flowAnimFrame);

  const target = store.currentAnimationTarget;
  let arrows: ArrowData[] = [];

  if (store.currentAnimation === 'multi-interface' && target.className) {
    arrows = inheritanceArrows.value.filter((a) => a.childClass === target.className);
  } else {
    const arrow = inheritanceArrows.value.find(
      (a) => (a.parentClass === target.fromClass && a.childClass === target.toClass)
        || (a.parentClass === target.className && a.childClass === target.toClass)
        || (a.parentClass === target.fromClass && a.childClass === target.className)
    );
    if (arrow) arrows.push(arrow);
  }

  if (arrows.length === 0) return;

  const startTime = performance.now();
  const duration = 1500;

  function animate(time: number) {
    const elapsed = time - startTime;
    const t = Math.min((elapsed % duration) / duration, 1);

    flowDotsPos.value = arrows.map((arrow) => ({
      x: arrow.x1 + (arrow.x2 - arrow.x1) * t,
      y: arrow.y1 + (arrow.y2 - arrow.y1) * t,
    }));

    flowAnimFrame = requestAnimationFrame(animate);
  }

  flowAnimFrame = requestAnimationFrame(animate);
}

function startDispatchDotAnimation() {
  if (dispatchAnimFrame) cancelAnimationFrame(dispatchAnimFrame);

  const target = store.currentAnimationTarget;
  if (!target.fromClass || !target.toClass) return;

  const startTime = performance.now();
  const duration = 1200;

  function animate(time: number) {
    const elapsed = time - startTime;
    const t = Math.min((elapsed % duration) / duration, 1);
    const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    const currentDest = (target.secondToClass && (elapsed % (duration * 2) >= duration))
      ? target.secondToClass
      : target.toClass;

    const arrow = inheritanceArrows.value.find(
      (a) => (a.parentClass === target.fromClass && a.childClass === currentDest)
        || (a.parentClass === currentDest && a.childClass === target.fromClass)
    );

    if (arrow) {
      const isReversed = arrow.parentClass === currentDest;
      const startX = isReversed ? arrow.x2 : arrow.x1;
      const startY = isReversed ? arrow.y2 : arrow.y1;
      const endX = isReversed ? arrow.x1 : arrow.x2;
      const endY = isReversed ? arrow.y1 : arrow.y2;

      dispatchArrow.value = {
        ...arrow,
        x1: startX, y1: startY,
        x2: endX, y2: endY,
      };

      dispatchDotPos.value = {
        x: startX + (endX - startX) * eased,
        y: startY + (endY - startY) * eased,
      };
    } else {
      dispatchArrow.value = null;
    }

    dispatchAnimFrame = requestAnimationFrame(animate);
  }

  dispatchAnimFrame = requestAnimationFrame(animate);
}

function stopFlowAnimations() {
  if (flowAnimFrame) {
    cancelAnimationFrame(flowAnimFrame);
    flowAnimFrame = null;
  }
  if (dispatchAnimFrame) {
    cancelAnimationFrame(dispatchAnimFrame);
    dispatchAnimFrame = null;
  }
  dispatchArrow.value = null;
}

// Syntax highlighting parser
function highlightSyntax(line: string): string {
  if (!line) return '&nbsp;';

  let codePart = line;
  let commentPart = '';
  const commentIndex = line.indexOf('//');
  if (commentIndex !== -1) {
    codePart = line.substring(0, commentIndex);
    commentPart = line.substring(commentIndex);
  }

  let code = codePart
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const extracted: string[] = [];
  code = code.replace(/(&quot;[^&]*&quot;|"[^"]*")/g, (_m, s) => {
    extracted.push(s);
    return `\x00STR${extracted.length - 1}\x00`;
  });

  code = code.replace(/(❌)/g, (_m, s) => { extracted.push(s); return `\x00SYM${extracted.length - 1}\x00`; });
  code = code.replace(/(✅)/g, (_m, s) => { extracted.push(s); return `\x00SYM${extracted.length - 1}\x00`; });

  code = code.replace(
    /\b(class|extends|abstract|public|private|protected|new|let|const|return|if|else|void|number|string|override|virtual|double|int|bool|var|get|set|Console|WriteLine|NotImplementedException|interface|decimal|foreach)\b/g,
    '<span class="syn-keyword">$1</span>'
  );

  code = code.replace(/\x00STR(\d+)\x00/g, (_m, i) => `<span class="syn-string">${extracted[+i]}</span>`);
  code = code.replace(/\x00SYM(\d+)\x00/g, (_m, i) => {
    const sym = extracted[+i];
    return sym === '❌' ? `<span class="syn-error">${sym}</span>` : `<span class="syn-success">${sym}</span>`;
  });

  let result = code;
  if (commentPart) {
    const escapedComment = commentPart
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    result += `<span class="syn-comment">${escapedComment}</span>`;
  }

  return result;
}

// Click quick jump from UML methods
function onCardMethodClick(payload: { className: string; methodName: string }) {
  if (!store.currentScenario) return;
  // Look for a step that executes this method
  const targetStep = store.currentScenario.steps.findIndex(s => 
    s.animationTarget?.className === payload.className && s.animationTarget?.memberName === payload.methodName
  );
  if (targetStep !== -1) {
    store.jumpToStep(targetStep);
  }
}

// Hover event handler for linking UML and Heap fields
function onCardMemberHover(payload: { className: string; memberName: string; isHovered: boolean }) {
  if (payload.isHovered) {
    hoveredMember.value = { className: payload.className, memberName: payload.memberName };
  } else {
    hoveredMember.value = null;
  }
}

// Hovering Heap object addresses highlight corresponding UML class
function onHeapObjectClick(className: string) {
  // Briefly flash the UML class active state
  const classEl = classCardRefs.value.get(className);
  if (classEl) {
    classEl.classList.add('card-glow');
    setTimeout(() => {
      classEl.classList.remove('card-glow');
    }, 1500);
  }
}

// Click keyword tags in Theory Summary: Highlight corresponding C# lines containing it
function handleTagClick(tag: string) {
  keywordHighlightedLines.value = [];
  if (!store.currentScenario) return;

  store.currentScenario.codeLines.forEach((line, idx) => {
    const regex = new RegExp(`\\b${tag}\\b`, 'i');
    if (regex.test(line)) {
      keywordHighlightedLines.value.push(idx);
    }
  });

  // Clear after 3 seconds
  setTimeout(() => {
    keywordHighlightedLines.value = [];
  }, 3000);
}

// Completion celebration modal transition
function advanceToNextPillar() {
  showCompletionModal.value = false;
  showLessonGoals.value = true;
  // Cycle to next active pillar
  const currentIndex = pillars.findIndex(p => p.id === store.activePillar);
  const nextIndex = (currentIndex + 1) % pillars.length;
  store.setPillar(pillars[nextIndex].id as any);
}

// ==========================================
// LIFECYCLE
// ==========================================
const checkWidth = () => {
  isDesktopWide.value = window.innerWidth >= 1700;
};

const handleResize = () => {
  checkWidth();
  updateArrows();
  updateMemoryLinks();
};

onMounted(() => {
  checkWidth();
  store.initializeDemoClasses();
  store.loadScenario(store.activePillar);

  setTimeout(() => {
    updateArrows();
    updateMemoryLinks();
    resetAndStartPhasing();
  }, 200);
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  store.destroyStore();
  stopFlowAnimations();
  phaseTimers.forEach(clearTimeout);
  window.removeEventListener('resize', handleResize);
});

// Watch for animation changes
watch(() => store.currentAnimation, (anim) => {
  stopFlowAnimations();

  nextTick(() => {
    updateArrows();

    if (anim === 'inheritance-flow' || anim === 'multi-interface' || anim === 'interface-contract') {
      startFlowDotAnimation();
    } else if (anim === 'polymorphic-dispatch' || anim === 'arrow-flow') {
      startDispatchDotAnimation();
    }
  });
});

watch(() => store.activePillar, (pillar) => {
  showCompletionModal.value = false;
  nextTick(() => {
    setTimeout(() => {
      updateArrows();
      updateMemoryLinks();
      resetAndStartPhasing();
      
      const sections = oopTheoryDocs[pillar]?.sections;
      if (sections && sections.length > 0) {
        activeTheorySectionId.value = sections[0].id;
      } else {
        activeTheorySectionId.value = null;
      }
    }, 150);
  });
});

watch(() => store.scenarioStepIndex, (newIdx) => {
  resetAndStartPhasing();
  
  const pillar = store.activePillar;
  const sectionId = STEP_THEORY_MAPPING[pillar]?.[newIdx] || null;
  if (sectionId) {
    activeTheorySectionId.value = sectionId;
  }

  // Last step completed: Trigger confetti & reward popup
  if (newIdx === store.totalSteps - 1 && store.totalSteps > 1) {
    setTimeout(() => {
      fireQuizPass();
      showCompletionModal.value = true;
    }, 600);
  }
});

watch(isTheoryOpen, () => {
  nextTick(() => {
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 320); // wait for panel slide transition
  });
});

watch(() => store.registeredClasses, () => {
  nextTick(() => {
    setTimeout(updateArrows, 150);
  });
}, { deep: true });
</script>

<style scoped>
/* ==================== VISUALIZER CONTAINER ==================== */
.oop-visualizer-container {
  width: 100%;
  height: 100%;
}

@media (min-width: 1700px) {
  .oop-visualizer-container.theory-expanded-layout {
    display: flex;
    flex-direction: row;
    gap: 16px;
    width: 100%;
    height: 100%;
  }
}

/* ==================== WORKSPACE CONTAINER ==================== */
.oop-workspace {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px;
  background: color-mix(in srgb, var(--vis-panel-bg) 70%, transparent);
  backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-xl);
  height: calc(100vh - 110px);
  min-height: 520px;
  max-height: 800px;
  overflow: hidden;
  transition: all 0.3s ease;
}

/* ==================== HEADER (COMPACT) ==================== */
.oop-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--color-border-subtle);
  height: 38px;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 6px;
}

.header-icon {
  color: var(--color-accent-primary);
}

.header-title {
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-secondary);
}

.pillar-tabs {
  display: flex;
  gap: 3px;
  background: var(--color-bg-secondary);
  padding: 2px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-subtle);
}

.pillar-tab {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 4px 10px;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-muted);
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pillar-tab:hover {
  color: var(--color-text-secondary);
  background: var(--color-bg-hover);
}

.pillar-tab.active {
  background: var(--color-accent-primary-dim);
  border-color: color-mix(in srgb, var(--color-accent-primary) 35%, transparent);
  color: var(--color-accent-primary-text);
  box-shadow: 0 0 10px var(--color-accent-primary-glow);
}

/* ==================== LESSON BANNER & VCR ROW ==================== */
.lesson-vcr-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  background: color-mix(in srgb, var(--color-bg-secondary) 40%, transparent);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-xl);
  padding: 6px 12px;
  margin-bottom: 6px;
  height: 48px;
  flex-shrink: 0;
}

.lesson-banner-compact {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid transparent;
  border-radius: var(--radius-lg);
  padding: 4px 10px;
  transition: all 0.3s ease;
}

.goal-box-glow {
  border-color: var(--color-accent-yellow) !important;
  background: rgba(234, 179, 8, 0.04) !important;
  box-shadow: 0 0 12px rgba(234, 179, 8, 0.1);
}

.lesson-text-wrapper {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.goal-tag {
  font-size: 8px;
  font-weight: 800;
  color: var(--color-accent-yellow);
  letter-spacing: 0.05em;
}

.lesson-text {
  font-size: 11.5px;
  color: var(--color-text-secondary);
  line-height: 1.35;
  margin: 0;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.start-lesson-btn {
  background: linear-gradient(135deg, var(--color-accent-yellow), var(--color-accent-orange));
  color: #1a1d2e;
  border: none;
  padding: 4px 12px;
  border-radius: var(--radius-md);
  font-size: 10px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(234, 179, 8, 0.3);
  transition: all 0.2s ease;
  white-space: nowrap;
  margin-left: auto;
}

.start-lesson-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(234, 179, 8, 0.5);
}

/* ==================== VCR CONTROLS ==================== */
.vcr-panel-compact {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px;
  background: color-mix(in srgb, var(--color-bg-secondary) 60%, transparent);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  flex-shrink: 0;
  height: 36px;
}

.vcr-action-info {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: var(--radius-full);
}

.status-running {
  background: var(--color-accent-green);
  box-shadow: 0 0 8px var(--color-accent-green-glow);
}

.status-waiting {
  background: var(--color-accent-yellow);
}

.status-error {
  background: var(--color-accent-red);
  box-shadow: 0 0 8px var(--color-accent-red-glow);
}

.vcr-btn-group {
  display: flex;
  align-items: center;
  gap: 3px;
}

.vcr-btn-sm {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-sm);
  background: var(--color-bg-surface);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.vcr-btn-sm:hover:not(:disabled) {
  background: var(--color-bg-hover);
  color: var(--color-text-primary);
  border-color: var(--color-border-default);
}

.vcr-btn-sm:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.vcr-play-sm {
  background: var(--color-accent-primary);
  border-color: var(--color-accent-primary);
  color: white;
}

.vcr-play-sm:hover:not(:disabled) {
  background: var(--color-accent-primary-light);
  box-shadow: 0 0 8px var(--color-accent-primary-glow);
}

.vcr-pause-sm {
  background: var(--color-accent-yellow);
  border-color: var(--color-accent-yellow);
  color: #1a1d2e;
}

.vcr-progress-compact {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 90px;
}

.progress-bar-sm {
  flex: 1;
  height: 3px;
  background: var(--color-border-subtle);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-fill-sm {
  height: 100%;
  background: linear-gradient(90deg, var(--color-accent-primary), var(--color-accent-purple));
  border-radius: var(--radius-full);
  transition: width 0.3s ease;
}

.step-counter-sm {
  font-size: 9px;
  font-family: var(--font-mono);
  color: var(--color-text-muted);
  white-space: nowrap;
}

.speed-control-compact {
  display: flex;
  gap: 2px;
}

.speed-btn-sm {
  padding: 1px 4px;
  font-size: 8.5px;
  font-weight: 700;
  font-family: var(--font-mono);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
}

.speed-btn-sm.active {
  background: rgba(234, 179, 8, 0.15);
  border-color: var(--color-accent-yellow);
  color: var(--color-accent-yellow);
}

/* ==================== MAIN 3-COLUMN LAYOUT ==================== */
.oop-content {
  display: grid;
  grid-template-columns: 1.15fr 1fr 1.15fr;
  gap: 12px;
  flex: 1;
  min-height: 0;
}

/* Left column styling */
.left-column {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

/* ==================== CODE PANEL ==================== */
.code-panel {
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.code-panel-focus {
  border-color: var(--color-accent-primary) !important;
  box-shadow: 0 0 16px var(--color-accent-primary-glow) !important;
}

.code-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px;
  background: var(--code-header-bg);
  border-bottom: 1px solid var(--color-border-subtle);
}

.terminal-dots {
  display: flex;
  gap: 5px;
}

.dot {
  width: 7px;
  height: 7px;
  border-radius: var(--radius-full);
}

.dot-red { background: var(--color-dot-close); }
.dot-yellow { background: var(--color-dot-min); }
.dot-green { background: var(--color-dot-max); }

.code-filename {
  font-size: 10px;
  font-weight: 600;
  color: var(--color-text-muted);
}

.code-body {
  background: var(--code-bg);
  padding: 8px 0;
  flex: 1;
  overflow-y: auto;
}

.code-line {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 2px 12px;
  font-family: var(--font-mono);
  font-size: 11.5px;
  line-height: 1.65;
  transition: all 0.25s ease;
  border-left: 3px solid transparent;
}

.code-line-active {
  background: rgba(234, 179, 8, 0.12) !important;
  border-left-color: var(--color-accent-yellow) !important;
}

.code-line-keyword-highlighted {
  background: rgba(6, 182, 212, 0.15) !important;
  border-left-color: var(--color-accent-cyan) !important;
}

.debugger-gutter {
  width: 60px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-shrink: 0;
}

.debugger-chevron {
  color: var(--color-accent-yellow);
  font-weight: 800;
  font-size: 10px;
}

.chevron-arrow {
  display: inline-block;
}

.executing-tag {
  background: rgba(234, 179, 8, 0.2);
  border: 1px solid var(--color-accent-yellow);
  padding: 0 4px;
  border-radius: var(--radius-sm);
  font-size: 8px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 700;
}

.code-line-error {
  background: var(--color-accent-red-dim) !important;
  border-left-color: var(--color-accent-red) !important;
}

.code-line-warning {
  background: var(--color-accent-yellow-dim) !important;
  border-left-color: var(--color-accent-yellow) !important;
}

.line-number {
  color: var(--color-text-disabled);
  font-size: 10px;
  width: 14px;
  text-align: right;
  user-select: none;
  flex-shrink: 0;
}

.line-content {
  color: var(--color-text-primary);
  white-space: pre;
}

/* Syntax colors */
:deep(.syn-keyword) { color: var(--color-syntax-keyword); font-weight: 600; }
:deep(.syn-comment) { color: var(--color-syntax-comment); font-style: italic; }
:deep(.syn-string) { color: var(--color-syntax-string); }
:deep(.syn-error) { color: var(--color-accent-red); }
:deep(.syn-success) { color: var(--color-accent-green); }

/* ==================== CONSOLIDATED CONSOLE FOOTER ==================== */
.code-console-footer {
  border-top: 1px solid var(--color-border-subtle);
  background: #141724;
  height: 155px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: var(--font-sans);
}

.console-error-mode {
  border-top-color: rgba(239, 68, 68, 0.4) !important;
  background: #1e1117 !important;
}

.console-tab-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #181b2a;
  border-bottom: 1px solid var(--color-border-subtle);
}

.console-dot {
  width: 6px;
  height: 6px;
  border-radius: var(--radius-full);
}

.console-tab-title {
  font-size: 9.5px;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--color-text-muted);
  letter-spacing: 0.05em;
}

.console-content {
  padding: 8px 12px;
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.console-steps-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.console-step-row {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 11px;
  line-height: 1.45;
  color: var(--color-text-secondary);
}

.console-bullet {
  color: var(--color-text-disabled);
  font-weight: bold;
}

.console-step-success { color: var(--color-accent-green-text, #10b981) !important; }
.console-step-error { color: var(--color-accent-red-light, #ef4444) !important; }
.console-step-warning { color: var(--color-accent-yellow, #f59e0b) !important; }
.console-step-new { color: var(--color-accent-cyan-text, #06b6d4) !important; }

.console-empty {
  font-size: 10.5px;
  font-style: italic;
  color: var(--color-text-disabled);
}

/* Violation embedded block */
.console-violation-row {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  padding: 6px 8px;
  border-radius: var(--radius-md);
  color: #ef4444;
  font-size: 11px;
  font-weight: 600;
}

/* Tip block */
.console-tip-row {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  background: rgba(6, 182, 212, 0.08);
  border: 1px solid rgba(6, 182, 212, 0.15);
  padding: 6px 8px;
  border-radius: var(--radius-md);
  color: var(--color-accent-cyan-text);
  font-size: 10.5px;
  line-height: 1.4;
  margin-top: auto; /* Push tip to the bottom of console */
}

/* ==================== MEMORY PLACEHOLDER DASHED CARDS ==================== */
.memory-placeholder-dashed {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1.5px dashed var(--color-border-subtle);
  border-radius: var(--radius-xl);
  padding: 12px 10px;
  text-align: center;
  background: rgba(255, 255, 255, 0.01);
  color: var(--color-text-muted);
  height: 100%;
}

.placeholder-icon {
  font-size: 14px;
  margin-bottom: 4px;
  opacity: 0.8;
}

.placeholder-text {
  font-size: 10.5px;
  font-weight: 700;
  color: var(--color-text-secondary);
  margin-bottom: 2px;
}

.placeholder-desc {
  font-size: 9px;
  line-height: 1.3;
  color: var(--color-text-disabled);
  max-width: 140px;
}

/* ==================== DIAGRAM AREA ==================== */
.diagram-panel {
  display: flex;
  flex-direction: column;
  background: color-mix(in srgb, var(--canvas-bg) 40%, transparent);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-2xl);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  height: 100%;
  min-height: 0;
  transition: all 0.3s ease;
}

.diagram-area {
  position: relative;
  flex: 1;
  padding: 14px;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
}

.connections-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: visible;
  z-index: 1;
}

/* UML cards container */
.class-cards-container {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.layout-pair {
  justify-content: center;
  gap: 32px;
}

.layout-tree {
  justify-content: space-around;
  gap: 12px;
}

.animated-class-card {
  width: 100%;
  max-width: 230px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-glow {
  transform: scale(1.02);
}

/* ==================== MEMORY WORKSPACE ==================== */
.memory-panel {
  display: flex;
  flex-direction: column;
  background: color-mix(in srgb, var(--canvas-bg) 40%, transparent);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-2xl);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  height: 100%;
  min-height: 0;
  transition: all 0.3s ease;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: var(--code-header-bg);
  border-bottom: 1px solid var(--color-border-subtle);
  height: 38px;
  flex-shrink: 0;
}

.memory-workspace {
  display: flex;
  flex-direction: column;
  position: relative;
  flex: 1;
  min-height: 0;
  background: color-mix(in srgb, var(--canvas-bg) 60%, transparent);
  overflow-y: auto;
  overflow-x: hidden;
  gap: 12px;
  padding: 12px;
}

.stack-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  border-bottom: 1px dashed var(--color-border-subtle);
  padding-bottom: 10px;
  flex-shrink: 0;
}

/* ==================== MEMORY WORKSPACE REFERENCES SVG ==================== */
.memory-links-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: visible;
  z-index: 5;
}

.memory-reference-path {
  fill: none;
  stroke: var(--color-accent-green, #10b981);
  stroke-width: 2.5;
  stroke-dasharray: 4 4;
  animation: dashPlay 30s linear infinite;
  opacity: 0.85;
  transition: stroke-dashoffset 0.1s linear;
}

@keyframes dashPlay {
  to {
    stroke-dashoffset: -1000;
  }
}

.call-stack-area, .variables-area {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.call-stack-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: color-mix(in srgb, var(--color-bg-surface) 30%, transparent);
  border: 1.5px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  padding: 6px;
  height: 110px;
  overflow-y: auto;
}

.call-stack-frame {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 6px;
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-text-muted);
  border-left: 2px solid transparent;
  transition: all 0.25s ease;
  animation: frameSlideIn 0.3s ease-out;
}

.call-stack-active {
  background: rgba(234, 179, 8, 0.1) !important;
  border-left-color: var(--color-accent-yellow) !important;
  color: var(--color-accent-yellow) !important;
  font-weight: 700;
}

.stack-frame {
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow-y: auto;
  height: 110px;
}

.heap-area {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-height: 0;
}

.memory-label {
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--color-text-muted);
  letter-spacing: 0.04em;
  padding-bottom: 4px;
  border-bottom: 1px solid var(--color-border-subtle);
}

.heap-space {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 10px;
  align-items: flex-start;
  overflow-y: auto;
  flex: 1;
  max-height: 160px;
  padding-bottom: 6px;
}

/* Object heap cards */
.heap-obj-card {
  display: flex;
  flex-direction: column;
  min-width: 195px;
  background: color-mix(in srgb, var(--color-bg-surface) 40%, transparent);
  border: 1.5px solid;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow-md);
  font-family: var(--font-sans);
  backdrop-filter: blur(10px);
  cursor: pointer;
  transition: all 0.25s ease;
}

.heap-obj-card:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-lg);
  filter: brightness(1.05);
}

.heap-obj-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 10px;
  border-bottom: 1px solid var(--color-border-subtle);
}

.heap-obj-type {
  font-size: 10.5px;
  font-weight: 700;
  font-family: var(--font-mono);
}

.heap-obj-fields {
  display: flex;
  flex-direction: column;
  padding: 6px 10px;
  gap: 4px;
  border-bottom: 1px solid var(--color-border-subtle);
  background: rgba(255, 255, 255, 0.01);
}

.heap-field-row {
  display: flex;
  align-items: center;
  font-family: var(--font-mono);
  font-size: 10px;
  position: relative;
  padding: 2px 4px;
  border-radius: var(--radius-sm);
  transition: all 0.25s ease;
}

.field-hover-glow {
  background: rgba(6, 182, 212, 0.15) !important;
}

/* Object States list */
.object-states-container {
  margin-top: 16px;
  border-top: 1px dashed var(--color-border-subtle);
  padding-top: 10px;
}

.object-state-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.object-state-card {
  flex: 1;
  min-width: 180px;
  background: color-mix(in srgb, var(--color-bg-surface) 50%, transparent);
  border-left: 4px solid var(--color-accent-green);
  border-radius: var(--radius-md);
  padding: 6px 10px;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: all 0.25s ease;
}

.object-state-card:hover {
  background: var(--color-bg-hover);
  transform: translateY(-1px);
}

.field-hover-glow-card {
  box-shadow: 0 0 10px var(--color-accent-cyan-glow);
}

/* ==================== ACTIVE HIGHLIGHT / FOCUS MODE FADES ==================== */
.fade-inactive-panel {
  opacity: 0.45 !important;
  filter: grayscale(30%) blur(0.5px);
  transition: all 0.40s ease;
}

.fade-inactive-panel:hover {
  opacity: 0.9 !important;
  filter: none;
}

/* Completion Modal overlays */
.completion-overlay {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.completion-modal-card {
  background: #1e2235;
  border: 2px solid var(--color-accent-yellow);
  box-shadow: 0 12px 40px rgba(234, 179, 8, 0.25);
  border-radius: 20px;
  padding: 32px;
  text-align: center;
  max-width: 420px;
  width: 90%;
  animation: modalPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes modalPop {
  from { transform: scale(0.85); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.completion-emoji {
  font-size: 48px;
  margin-bottom: 12px;
}

.completion-title {
  font-size: 20px;
  font-weight: 800;
  color: var(--color-accent-yellow);
  margin-bottom: 8px;
}

.completion-desc {
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.5;
  margin-bottom: 24px;
}

.completion-btn-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.completion-action-btn {
  background: linear-gradient(135deg, var(--color-accent-yellow), var(--color-accent-orange));
  color: #1a1d2e;
  border: none;
  padding: 10px 20px;
  border-radius: var(--radius-lg);
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 14px rgba(234, 179, 8, 0.3);
}

.completion-action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(234, 179, 8, 0.5);
}

.completion-close-btn {
  background: transparent;
  border: 1px solid var(--color-border-subtle);
  color: var(--color-text-muted);
  padding: 8px 16px;
  border-radius: var(--radius-lg);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.completion-close-btn:hover {
  color: var(--color-text-primary);
  background: var(--color-bg-hover);
}

/* Responsive viewports adjustments for 14 inch */
@media (max-width: 1400px) {
  .oop-workspace {
    padding: 10px;
    gap: 8px;
    height: calc(100vh - 100px);
  }
  .oop-content {
    grid-template-columns: 1.1fr 1fr 1.1fr;
    gap: 8px;
  }
  .animated-class-card {
    max-width: 200px;
  }
  .heap-obj-card {
    min-width: 170px;
  }
  .stack-grid {
    gap: 8px;
  }
  .call-stack-list, .stack-frame {
    height: 95px;
  }
  .code-console-footer {
    height: 140px;
  }
}
</style>
