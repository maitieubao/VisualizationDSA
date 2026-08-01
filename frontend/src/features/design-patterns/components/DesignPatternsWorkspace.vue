<template>
  <div class="design-patterns-workspace" data-tour-id="design-patterns-workspace">
    
    <!-- ==================== WORKSPACE HEADER ==================== -->
    <div class="workspace-header">
      <div class="flex items-center gap-3">
        <!-- Main Icon -->
        <div class="header-icon-wrapper">
          <SvgIcon name="drafting-compass" :size="18" color="var(--accent-purple, #a855f7)" />
        </div>
        <div class="header-titles">
          <h2 class="main-title">Design Patterns</h2>
          <span class="sub-title">Interactive Architectural Visualization</span>
        </div>
      </div>

      <!-- Pattern Tabs -->
      <div class="pattern-tabs">
        <button
          v-for="pattern in patternScenarios"
          :key="pattern.id"
          class="pattern-tab"
          :class="{ active: store.activePatternId === pattern.id }"
          @click="store.initializeScenario(pattern.id)"
        >
          <SvgIcon :name="getPatternIcon(pattern.id)" :size="14" class="pattern-svg-icon" />
          <span class="pattern-name" v-html="parseEmojiToSvg(pattern.label)"></span>
        </button>
      </div>
    </div>

    <!-- ==================== LESSON QUESTION BANNER ==================== -->
    <div class="lesson-banner" v-if="store.currentLessonQuestion">
      <div class="lesson-icon"><SvgIcon name="lightbulb" :size="20" color="var(--accent-yellow, #eab308)" /></div>
      <p class="lesson-text" v-html="store.currentLessonQuestion"></p>
    </div>

    <!-- ==================== MAIN CONTENT: 2-COLUMN LAYOUT ==================== -->
    <div class="dp-content">

      <!-- LEFT COLUMN: Code + Explanation -->
      <div class="left-column">
        
        <!-- Code Display -->
        <div class="code-panel">
          <div class="panel-header">
            <div class="header-left">
              <SvgIcon name="puzzle" :size="14" color="var(--accent-cyan, #06b6d4)" />
              <span class="panel-title" v-html="parseEmojiToSvg(store.activeScenarioTitle) + ' Code'"></span>
            </div>
          </div>
          <div class="code-scroll-area">
            <div class="code-content" v-if="store.currentScenario?.code">
              <div 
                v-for="(line, idx) in store.currentScenario.code.split('\n')" 
                :key="idx"
                class="code-line"
                :class="{ 'code-line-active': highlightLines.includes(idx + 1) }"
              >
                <span class="line-number">{{ idx + 1 }}</span>
                <span class="line-content" v-html="highlightSyntax(line)"></span>
              </div>
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
        <div class="diagram-area">
          <DesignPatternsCanvas />
        </div>
        
        <!-- Player Controls -->
        <div class="controls-area">
          <VcrControls
            :current-index="store.scenarioStepIndex"
            :total-frames="store.totalSteps"
            :is-autoplay="store.isAutoplay"
            :playback-speed="store.playbackSpeed"
            @prev="store.vcrPrev"
            @next="store.vcrNext"
            @reset="store.vcrReset"
            @toggle-autoplay="store.toggleAutoplay"
            @speed-change="store.setSpeed"
          />
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, computed } from 'vue';
import { useDesignPatternsStore } from '../store/useDesignPatternsStore';
import { DESIGN_PATTERN_SCENARIOS } from '../scenarios/designPatternsScenarios';
import VcrControls from '@/components/VcrControls.vue';
import SvgIcon from '@/components/icons/SvgIcon.vue';
import DesignPatternsCanvas from './DesignPatternsCanvas.vue';
import { parseEmojiToSvg } from '@/utils/emojiParser';

const store = useDesignPatternsStore();

const patternScenarios = DESIGN_PATTERN_SCENARIOS.map(s => ({
  id: s.id,
  label: s.title
}));

// Highlight line computed
const highlightLines = computed(() => {
  const step = store.currentScenario?.steps[store.scenarioStepIndex];
  return step ? [step.codeLineIndex] : [];
});

function highlightSyntax(line: string): string {
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

  code = code.replace(
    /\b(class|interface|abstract|public|private|protected|new|let|const|return|if|else|void|number|string|override|virtual|double|int|bool|var|get|set|static|List|Console|WriteLine|foreach)\b/g,
    '<span class="syn-keyword">$1</span>'
  );

  code = code.replace(/\x00STR(\d+)\x00/g, (_m, i) => `<span class="syn-string">${extracted[+i]}</span>`);

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

function getPatternIcon(id: string): string {
  switch(id) {
    case 'strategy-pattern': return 'shuffle';
    case 'observer-pattern': return 'message-circle';
    case 'singleton-pattern': return 'lock';
    default: return 'package';
  }
}

onMounted(() => {
  store.initializeScenario('strategy-pattern');
});

onUnmounted(() => {
  store.cleanup();
});
</script>

<style scoped>
.design-patterns-workspace {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  width: 100%;
  background: var(--glass-bg, rgba(15, 23, 42, 0.4));
  backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.1));
  border-radius: 16px;
  padding: 20px;
  box-sizing: border-box;
  overflow: hidden;
}

/* --- Header --- */
.workspace-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--glass-border, rgba(255,255,255,0.1));
}
.header-icon-wrapper {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(168, 85, 247, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(168, 85, 247, 0.3);
  box-shadow: 0 0 10px rgba(168, 85, 247, 0.2);
}
.header-titles {
  display: flex;
  flex-direction: column;
}
.main-title {
  font-size: 16px;
  font-weight: 800;
  margin: 0;
  background: linear-gradient(135deg, #e2e8f0, #94a3b8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 0.5px;
}
.sub-title {
  font-size: 11px;
  color: #94a3b8;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* --- Tabs --- */
.pattern-tabs {
  display: flex;
  gap: 8px;
  background: rgba(15, 23, 42, 0.4);
  padding: 6px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}
.pattern-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  background: transparent;
  border: 1px solid transparent;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.3s ease;
}
.pattern-tab:hover {
  color: #e2e8f0;
  background: rgba(255, 255, 255, 0.05);
}
.pattern-tab.active {
  background: rgba(168, 85, 247, 0.15);
  color: #c084fc;
  border-color: rgba(168, 85, 247, 0.3);
  box-shadow: 0 0 15px rgba(168, 85, 247, 0.2);
}
.pattern-name {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* --- Lesson Banner --- */
.lesson-banner {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  background: linear-gradient(145deg, rgba(234, 179, 8, 0.1), rgba(202, 138, 4, 0.05));
  border: 1px solid rgba(234, 179, 8, 0.2);
  border-radius: 12px;
  padding: 16px;
}
.lesson-icon {
  background: rgba(234, 179, 8, 0.15);
  padding: 8px;
  border-radius: 10px;
  border: 1px solid rgba(234, 179, 8, 0.3);
  box-shadow: 0 0 15px rgba(234, 179, 8, 0.2);
}
.lesson-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #f8fafc;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
}

/* --- Layout --- */
.dp-content {
  display: flex;
  gap: 20px;
  flex: 1;
  min-height: 0;
}
.left-column {
  flex: 0 0 450px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.right-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

/* --- Code Panel --- */
.code-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  overflow: hidden;
}
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid var(--glass-border);
}
.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.panel-title {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #e2e8f0;
}
.code-scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

/* --- Explanation Panel --- */
.explanation-panel {
  background: rgba(6, 182, 212, 0.1);
  border: 1px solid rgba(6, 182, 212, 0.2);
  border-radius: 12px;
  padding: 16px;
  animation: slideInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}
.explanation-content p {
  margin: 0;
  font-size: 13.5px;
  line-height: 1.6;
  color: #e2e8f0;
}

@keyframes slideInUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* --- Diagram Area --- */
.diagram-area {
  flex: 1;
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  position: relative;
  overflow: hidden;
}

/* --- Controls Area --- */
.controls-area {
  flex-shrink: 0;
}

/* --- Code Editor Styles --- */
.code-content {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  line-height: 1.5;
  color: #e2e8f0;
}
.code-line {
  display: flex;
  padding: 0 4px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}
.code-line-active {
  background-color: rgba(6, 182, 212, 0.2);
  border-left: 2px solid #06b6d4;
}
.line-number {
  min-width: 24px;
  color: #64748b;
  text-align: right;
  margin-right: 12px;
  user-select: none;
}
.line-content {
  white-space: pre;
}

/* Syntax Highlighting */
:deep(.syn-keyword) { color: #c678dd; font-weight: bold; }
:deep(.syn-string) { color: #98c379; }
:deep(.syn-comment) { color: #5c6370; font-style: italic; }
:deep(.syn-error) { color: #ef4444; font-weight: bold; }
:deep(.syn-success) { color: #22c55e; font-weight: bold; }
</style>
