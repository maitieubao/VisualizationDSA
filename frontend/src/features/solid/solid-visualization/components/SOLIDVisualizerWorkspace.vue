<template>
  <div class="solid-workspace">
    <!-- Header -->
    <div class="solid-header">
      <div class="header-left">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="header-icon">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
        <span class="header-title">Trực quan hóa SOLID — 5 Nguyên tắc Thiết kế Hướng Đối Tượng</span>
      </div>

      <!-- Lesson Tabs (hidden in VCR mode) -->
      <div v-if="!store.isVcrMode" class="lesson-tabs">
        <button
          v-for="lesson in lessons"
          :key="lesson.id"
          class="lesson-tab-btn"
          :class="{ 'active': store.activeLesson === lesson.id }"
          @click="store.setLesson(lesson.id)"
        >
          <SvgIcon :name="lesson.icon" :size="14" class="lesson-svg-icon" />
          <span class="lesson-label">{{ lesson.label }}</span>
        </button>
      </div>
    </div>

    <!-- Backend VCR Scenario Picker -->
    <ConceptScenarioPicker
      v-if="store.isVcrMode || showVcrPicker"
      :scenarios="solidScenarios"
      :loading="store.isVcrLoading"
      label="Backend Scenarios (VCR)"
      @select="store.loadVcrScenario($event)"
    />

    <!-- VCR Explanation Banner -->
    <VcrExplanationBanner
      v-if="store.isVcrMode && store.vcrCurrentFrame"
      :action-type="store.vcrCurrentFrame.actionType"
      :explanation="store.vcrCurrentFrame.explanation"
      :frame-key="vcrCurrentIndex"
    />

    <!-- VCR Status Indicators -->
    <div v-if="store.isVcrLoading" class="api-status loading">Loading from backend...</div>
    <div v-if="store.vcrError" class="api-status error">{{ store.vcrError }}</div>

    <!-- VCR Playback Controls -->
    <VcrControls
      v-if="store.isVcrMode"
      :current-index="vcrCurrentIndex"
      :total-frames="store.vcrTotalFrames"
      @prev="store.vcrPrev()"
      @next="store.vcrNext()"
      @reset="store.vcrReset()"
      @exit="store.exitVcrMode()"
    />

    <!-- ==================== LESSON BANNER ==================== -->
    <div class="lesson-banner" v-if="!store.isVcrMode && store.currentScenario">
      <div class="lesson-icon"><SvgIcon name="lightbulb" :size="20" color="var(--accent-yellow, #eab308)" /></div>
      <p class="lesson-text" v-html="parseEmojiToSvg(store.currentScenario.lessonQuestion)"></p>
    </div>

    <!-- ==================== MAIN CONTENT: 2-COLUMN LAYOUT ==================== -->
    <div class="solid-content">
      <!-- VCR Mode Visualizer (Full width or main container if in VCR mode) -->
      <SOLIDVcrFrameVisualizer
        v-if="store.isVcrMode && store.vcrCurrentFrame"
        :frame="store.vcrCurrentFrame"
        class="col-span-2"
      />

      <!-- Sandbox Sandbox Mode (2-Columns) -->
      <template v-else>
        <!-- LEFT COLUMN: Code & Explanation -->
        <div class="left-column">
          <!-- VCR Controls -->
          <div class="vcr-panel" v-if="store.isPlayingScenario">
            <div class="vcr-controls">
              <button class="vcr-btn" :disabled="store.scenarioStepIndex === 0" @click="store.prevScenarioStep()" title="Bước trước">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
              </button>
              <button class="vcr-btn vcr-play" v-if="!store.isAutoplayRunning" @click="store.startAutoplay()" title="Tự động chạy">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              </button>
              <button class="vcr-btn vcr-pause" v-else @click="store.pauseAutoplay()" title="Tạm dừng">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
              </button>
              <button class="vcr-btn" @click="store.resetScenario()" title="Bắt đầu lại">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
              </button>
              <button class="vcr-btn" :disabled="store.scenarioStepIndex >= store.totalSteps - 1" @click="store.nextScenarioStep()" title="Bước tiếp">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
              </button>
            </div>

            <div class="vcr-progress">
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  :style="{ width: progressPercent + '%' }"
                ></div>
              </div>
              <span class="step-counter">{{ store.scenarioStepIndex + 1 }} / {{ store.totalSteps }}</span>
            </div>

            <!-- Speed Control -->
            <div class="speed-control">
              <span class="speed-label">Tốc độ</span>
              <div class="speed-buttons">
                <button
                  v-for="s in [0.5, 1, 1.5, 2]"
                  :key="s"
                  class="speed-btn"
                  :class="{ active: store.playbackSpeed === s }"
                  @click="store.changePlaybackSpeed(s)"
                >{{ s }}x</button>
              </div>
            </div>
          </div>

          <!-- Code Panel -->
          <div class="code-panel" v-if="store.currentScenario">
            <div class="code-header">
              <div class="terminal-dots">
                <span class="dot dot-red"></span>
                <span class="dot dot-yellow"></span>
                <span class="dot dot-green"></span>
              </div>
              <span class="code-filename" v-html="parseEmojiToSvg(store.currentScenario.title)"></span>
              <div class="code-toggle flex items-center gap-1 ml-auto">
                <button
                  class="toggle-code-btn"
                  :class="{ active: !store.showGoodCode }"
                  @click="store.toggleGoodCode(false)"
                >
                  Mã vi phạm
                </button>
                <button
                  class="toggle-code-btn"
                  :class="{ active: store.showGoodCode }"
                  @click="store.toggleGoodCode(true)"
                >
                  Mã sạch
                </button>
              </div>
            </div>
            <div class="code-body">
              <div
                v-for="(line, idx) in (store.showGoodCode ? store.currentScenario.goodCodeLines : store.currentScenario.badCodeLines)"
                :key="idx"
                class="code-line"
                :class="{
                  'code-line-active': store.activeCodeLines.includes(idx)
                }"
              >
                <span class="line-number">{{ idx + 1 }}</span>
                <span class="line-content" v-html="highlightSyntax(line)"></span>
              </div>
            </div>
          </div>

          <!-- Explanation Panel -->
          <div class="explanation-panel" v-if="store.currentExplanation" :key="store.scenarioStepIndex">
            <div class="explanation-content">
              <p v-html="store.currentExplanation"></p>
            </div>
          </div>
        </div>

        <!-- RIGHT COLUMN: Visual Diagram -->
        <div class="right-column">
          <!-- Active Lesson Panel -->
          <div class="diagram-area">
            <!-- SRP Lesson -->
            <SRPLessonPanel
              v-if="store.activeLesson === 'SRP'"
              :class-nodes="store.classNodes"
              :has-overheated="store.hasOverheatedNodes"
              :is-split="store.isSRPSplit"
              :diagnostic-result="store.lastDiagnosticResult"
              @split="onSRPSplit"
            />

            <!-- OCP Lesson -->
            <OCPLessonPanel
              v-else-if="store.activeLesson === 'OCP'"
              :is-extended="store.showGoodCode || store.scenarioStepIndex >= 4"
            />

            <!-- LSP Lesson -->
            <LSPLessonPanel
              v-else-if="store.activeLesson === 'LSP'"
              :lsp-phase="store.lspPhase"
              :diagnostic-result="store.lastDiagnosticResult"
              @run-violation="store.executeLSPSubstitution(true)"
              @run-valid="store.executeLSPSubstitution(false)"
            />

            <!-- ISP Lesson -->
            <ISPLessonPanel
              v-else-if="store.activeLesson === 'ISP'"
              :is-ok="store.showGoodCode || store.scenarioStepIndex >= 3"
            />

            <!-- DIP Lesson -->
            <DIPLessonPanel
              v-else-if="store.activeLesson === 'DIP'"
              :is-violating="store.dipState.isViolatingDIP"
              :has-interface="store.dipState.hasInterfaceInserted"
              :diagnostic-result="store.lastDiagnosticResult"
              @insert-interface="store.insertDIPInterface()"
              @reset-d-i-p="store.resetDIP()"
            />
          </div>
        </div>
      </template>
    </div>

    <!-- Footer Controls -->
    <div class="footer-controls">
      <div class="flex items-center gap-2">
        <span class="status-dot" />
        <span class="text-[10px] text-text-muted font-medium">
          Bài học: {{ store.activeLessonLabel }}
        </span>
        <span class="text-[10px] text-text-disabled" v-if="!store.isVcrMode">|</span>
        <span class="text-[10px] text-text-muted font-medium" v-if="!store.isVcrMode">
          Bước: {{ store.scenarioStepIndex + 1 }} / {{ store.totalSteps }}
        </span>
        <span class="text-[10px] text-text-disabled">|</span>
        <button class="text-[10px] text-accent-cyan hover:underline bg-transparent border-none p-0 cursor-pointer font-medium" @click="showVcrPicker = !showVcrPicker">
          {{ showVcrPicker ? 'Ẩn VCR' : 'Hiện VCR (Backend API)' }}
        </button>
      </div>
      <button
        class="reset-btn"
        @click="store.resetAll()"
      >
        Reset All
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, computed, ref } from 'vue';
import { useSOLIDVisualizerStore } from '../store/useSOLIDVisualizerStore';
import type { SOLIDPrinciple } from '@/features/solid/solid-visualization/types/solid-visualization.types';
import SRPLessonPanel from './SRPLessonPanel.vue';
import LSPLessonPanel from './LSPLessonPanel.vue';
import DIPLessonPanel from './DIPLessonPanel.vue';
import OCPLessonPanel from './OCPLessonPanel.vue';
import ISPLessonPanel from './ISPLessonPanel.vue';
import SOLIDVcrFrameVisualizer from './SOLIDVcrFrameVisualizer.vue';
import VcrControls from '@/components/VcrControls.vue';
import SvgIcon from '@/components/icons/SvgIcon.vue';
import VcrExplanationBanner from '@/components/VcrExplanationBanner.vue';
import ConceptScenarioPicker from '@/components/ConceptScenarioPicker.vue';
import { parseEmojiToSvg } from '@/utils/emojiParser';

const store = useSOLIDVisualizerStore();
const vcrCurrentIndex = computed(() => store.vcrCurrentIndex);
const showVcrPicker = ref(false);

const solidScenarios = [
  { id: 'srp', label: 'SRP — God Class' },
  { id: 'ocp', label: 'OCP — Open/Closed' },
  { id: 'lsp', label: 'LSP — Substitution' },
];

interface LessonTab {
  id: SOLIDPrinciple;
  label: string;
  icon: string;
}

const lessons: LessonTab[] = [
  { id: 'SRP', label: 'SRP', icon: 'target' },
  { id: 'OCP', label: 'OCP', icon: 'plug' },
  { id: 'LSP', label: 'LSP', icon: 'puzzle' },
  { id: 'ISP', label: 'ISP', icon: 'scissors' },
  { id: 'DIP', label: 'DIP', icon: 'shuffle' },
];

const progressPercent = computed(() => {
  if (store.totalSteps <= 1) return 100;
  return (store.scenarioStepIndex / (store.totalSteps - 1)) * 100;
});

onMounted(() => {
  store.initializeDemoData();
  store.loadScenario(store.activeLesson);
});

onUnmounted(() => {
  store.destroyStore();
});

function onSRPSplit(nodeId: string): void {
  store.triggerSRPSplit(nodeId);
}

// Robust syntax highlighting using placeholder tokens.
// Order: extract strings/symbols → replace keywords → restore strings/symbols.
// This prevents keyword/string regexes from corrupting each other's HTML tags.
function highlightSyntax(line: string): string {
  if (!line) return '&nbsp;';

  // 1. Separate comment
  let codePart = line;
  let commentPart = '';
  const commentIndex = line.indexOf('//');
  if (commentIndex !== -1) {
    codePart = line.substring(0, commentIndex);
    commentPart = line.substring(commentIndex);
  }

  // 2. HTML-escape code part (comment is wrapped raw later)
  let code = codePart
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // 3. Extract quoted strings into placeholders BEFORE inserting any HTML
  const extracted: string[] = [];
  code = code.replace(/(&quot;[^&]*&quot;|"[^"]*")/g, (_m, s) => {
    extracted.push(s);
    return `\x00STR${extracted.length - 1}\x00`;
  });

  // 4. Extract symbols ❌ ✅ into placeholders
  code = code.replace(/(❌)/g, (_m, s) => { extracted.push(s); return `\x00SYM${extracted.length - 1}\x00`; });
  code = code.replace(/(✅)/g, (_m, s) => { extracted.push(s); return `\x00SYM${extracted.length - 1}\x00`; });

  // 5. Now safely highlight keywords — the text contains NO HTML tags yet
  code = code.replace(
    /\b(class|interface|implements|extends|abstract|public|private|protected|new|let|const|return|if|else|void|number|string|throw|override|function|struct|using|namespace|virtual|double|int|bool|var|Console|WriteLine|NotImplementedException)\b/g,
    '<span class="syn-keyword">$1</span>'
  );

  // 6. Restore string placeholders with their HTML wrappers
  code = code.replace(/\x00STR(\d+)\x00/g, (_m, i) => `<span class="syn-string">${extracted[+i]}</span>`);
  code = code.replace(/\x00SYM(\d+)\x00/g, (_m, i) => {
    const sym = extracted[+i];
    return sym === '❌' ? `<span class="syn-error">${sym}</span>` : `<span class="syn-success">${sym}</span>`;
  });

  // 7. Build comment span
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
</script>

<style scoped>
/* ==================== WORKSPACE CONTAINER ==================== */
.solid-workspace {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  background: color-mix(in srgb, var(--vis-panel-bg) 70%, transparent);
  backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-xl);
  height: calc(100vh - 130px);
  min-height: 520px;
  max-height: 800px;
  overflow: hidden;
}

/* ==================== HEADER ==================== */
.solid-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--color-border-subtle);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-icon {
  color: var(--color-accent-primary);
}

.header-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-secondary);
}

.lesson-tabs {
  display: flex;
  gap: 4px;
  background: var(--color-bg-secondary);
  padding: 3px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-subtle);
}

.lesson-tab-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text-muted);
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s ease;
}

.lesson-tab-btn:hover {
  color: var(--color-text-secondary);
  background: var(--color-bg-hover);
}

.lesson-tab-btn.active {
  background: var(--color-accent-primary-dim);
  border-color: color-mix(in srgb, var(--color-accent-primary) 35%, transparent);
  color: var(--color-accent-primary-text);
  box-shadow: 0 0 12px var(--color-accent-primary-glow);
}

.lesson-emoji {
  font-size: 13px;
}

/* ==================== LESSON BANNER ==================== */
.lesson-banner {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 16px;
  background: linear-gradient(135deg, var(--color-accent-yellow-dim) 0%, var(--color-accent-primary-dim) 100%);
  border: 1px solid color-mix(in srgb, var(--color-accent-yellow) 20%, transparent);
  border-radius: var(--radius-xl);
  animation: bannerSlideIn 0.4s ease-out;
}

@keyframes bannerSlideIn {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

.lesson-icon {
  font-size: 18px;
  flex-shrink: 0;
  margin-top: 1px;
}

.lesson-text {
  font-size: 13px;
  color: var(--color-text-primary);
  line-height: 1.5;
  margin: 0;
  font-weight: 500;
}

/* ==================== MAIN 2-COLUMN LAYOUT ==================== */
.solid-content {
  display: grid;
  grid-template-columns: 1fr 1.35fr;
  gap: 20px;
  flex: 1;
  min-height: 0;
}

@media (max-width: 900px) {
  .solid-content {
    grid-template-columns: 1fr;
    height: auto;
    max-height: none;
    flex: none;
  }
}

.col-span-2 {
  grid-column: span 2 / span 2;
}

/* ==================== LEFT COLUMN ==================== */
.left-column {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  overflow: hidden;
}

/* ==================== VCR CONTROLS ==================== */
.vcr-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: color-mix(in srgb, var(--color-bg-secondary) 60%, transparent);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-xl);
}

.vcr-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.vcr-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
  background: var(--color-bg-surface);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.vcr-btn:hover:not(:disabled) {
  background: var(--color-bg-hover);
  color: var(--color-text-primary);
  border-color: var(--color-border-default);
}

.vcr-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.vcr-play {
  width: 42px;
  height: 42px;
  background: var(--color-accent-primary);
  border-color: var(--color-accent-primary);
  color: white;
  border-radius: var(--radius-full);
}

.vcr-play:hover:not(:disabled) {
  background: var(--color-accent-primary-light);
  box-shadow: 0 0 16px var(--color-accent-primary-glow);
}

.vcr-pause {
  width: 42px;
  height: 42px;
  background: var(--color-accent-yellow);
  border-color: var(--color-accent-yellow);
  color: #1a1d2e;
  border-radius: var(--radius-full);
}

.vcr-progress {
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-bar {
  flex: 1;
  height: 4px;
  background: var(--color-border-subtle);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-accent-primary), var(--color-accent-purple));
  border-radius: var(--radius-full);
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.step-counter {
  font-size: 11px;
  font-family: var(--font-mono);
  color: var(--color-text-muted);
  white-space: nowrap;
}

.speed-control {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.speed-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.speed-buttons {
  display: flex;
  gap: 3px;
}

.speed-btn {
  padding: 3px 8px;
  font-size: 10px;
  font-weight: 700;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
}

.speed-btn.active, .speed-btn:hover {
  background: var(--color-accent-primary-dim);
  color: var(--color-accent-primary-text);
  border-color: var(--color-accent-primary);
}

/* ==================== CODE PANEL ==================== */
.code-panel {
  display: flex;
  flex-direction: column;
  background: #0f111a;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  flex: 1;
  min-height: 0;
}

.code-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: #090a0f;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.terminal-dots {
  display: flex;
  gap: 5px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
}

.dot-red { background: #ff5f56; }
.dot-yellow { background: #ffbd2e; }
.dot-green { background: #27c93f; }

.code-filename {
  font-size: 10px;
  font-family: var(--font-mono);
  color: var(--color-text-muted);
}

.code-toggle {
  display: flex;
  background: rgba(255, 255, 255, 0.03);
  padding: 2px;
  border-radius: var(--radius-md);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.toggle-code-btn {
  padding: 3px 8px;
  font-size: 9px;
  font-weight: 700;
  border: none;
  background: transparent;
  color: var(--color-text-disabled);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
}

.toggle-code-btn.active {
  background: var(--color-bg-active);
  color: var(--color-text-primary);
}

.code-body {
  padding: 12px;
  flex: 1;
  overflow-y: auto;
  font-family: var(--font-mono);
  font-size: 11px;
  line-height: 1.5;
}

.code-line {
  display: flex;
  padding: 1px 4px;
  border-radius: var(--radius-sm);
  transition: all 0.25s ease;
}

.code-line-active {
  background: rgba(139, 92, 246, 0.15);
  border-left: 2px solid var(--color-accent-primary);
}

.line-number {
  width: 24px;
  color: #3b4261;
  text-align: right;
  margin-right: 12px;
  user-select: none;
}

.line-content {
  color: #a9b1d6;
  white-space: pre;
}

/* ==================== EXPLANATION PANEL ==================== */
.explanation-panel {
  padding: 12px 16px;
  background: color-mix(in srgb, var(--color-accent-primary-dim) 30%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-accent-primary) 20%, transparent);
  border-radius: var(--radius-xl);
  box-shadow: inset 0 0 12px rgba(139, 92, 246, 0.05);
  animation: explanationSlide 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  max-height: 125px;
  overflow-y: auto;
  flex-shrink: 0;
}

@keyframes explanationSlide {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

.explanation-content p {
  margin: 0;
  font-size: 12.5px;
  color: var(--color-text-secondary);
  line-height: 1.6;
}

/* ==================== RIGHT COLUMN (Diagram) ==================== */
.right-column {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.diagram-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: rgba(15, 23, 42, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.03);
  border-radius: var(--radius-2xl);
  padding: 16px;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
}

/* ==================== FOOTER CONTROLS ==================== */
.footer-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid var(--color-border-subtle);
  padding-top: 14px;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: var(--radius-full);
  background-color: var(--color-accent-primary);
}

.reset-btn {
  padding: 6px 12px;
  border-radius: var(--radius-lg);
  font-size: var(--text-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: var(--color-bg-surface);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border-default);
  cursor: pointer;
  transition: all 0.25s ease;
}

.reset-btn:hover {
  background: var(--color-bg-hover);
  color: var(--color-text-primary);
}

/* === API Status === */
.api-status { text-align: center; padding: 8px; border-radius: 8px; font-size: 11px; font-weight: 600; }
.api-status.loading { color: #06b6d4; background: rgba(6, 182, 212, 0.1); border: 1px solid rgba(6, 182, 212, 0.2); }
.api-status.error { color: #ef4444; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); }

/* Syntax colors */
:deep(.syn-comment) { color: #565f89; font-style: italic; }
:deep(.syn-keyword) { color: #bb9af7; font-weight: bold; }
:deep(.syn-string) { color: #9ece6a; }
:deep(.syn-error) { color: #f7768e; font-weight: bold; }
:deep(.syn-success) { color: #73daca; font-weight: bold; }
</style>
