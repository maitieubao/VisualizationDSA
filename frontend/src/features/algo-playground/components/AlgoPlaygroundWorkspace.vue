<template>
  <div class="flex flex-col w-full h-full overflow-hidden" data-tour-id="algo-playground">
    <!-- Toolbar (gộp: select + chips + input + Chạy + menu ⋯) -->
    <div class="relative flex items-center gap-2 px-3 py-1.5 border-b border-surface/70 bg-surface/40 shrink-0 flex-wrap">
      <div class="flex items-center gap-1.5 min-w-0">
        <select
          class="algo-demo-select"
          aria-label="Chọn thuật toán mẫu"
          :title="currentDemo?.description"
          :value="store.demoId ?? ''"
          @change="onSelectDemo"
        >
          <optgroup v-for="group in demoGroups" :key="group.value" :label="group.label">
            <option v-for="demo in group.items" :key="demo.id" :value="demo.id">
              {{ demo.title }}
            </option>
          </optgroup>
        </select>
        <span v-if="currentDemo?.complexity" class="demo-chip" title="Độ phức tạp thời gian"><BaseIcon name="timer" class="w-3 h-3 inline mr-1 align-middle" />{{ currentDemo.complexity }}</span>
        <span v-if="currentDemo?.space" class="demo-chip" title="Độ phức tạp bộ nhớ"><BaseIcon name="database" class="w-3 h-3 inline mr-1 align-middle" />{{ currentDemo.space }}</span>
      </div>

      <div class="flex items-center gap-1.5 bg-surface/60 border border-surface rounded-lg px-2 py-1 min-w-[200px] flex-1 md:flex-none">
        <span class="text-[10px] font-semibold text-text-secondary uppercase shrink-0">Input</span>
        <input
          class="algo-input"
          :value="store.inputRaw"
          placeholder="Nhập dữ liệu (phân cách bằng dấu phẩy)"
          @change="onInputChange"
          @keydown.enter="onInputChange"
        />
        <button class="algo-icon-btn" title="Sinh dữ liệu ngẫu nhiên" aria-label="Sinh dữ liệu ngẫu nhiên" @click="onRandomInput">
          <BaseIcon name="dice" class="w-3.5 h-3.5" />
        </button>
        <span
          v-if="inputHintVisible"
          class="text-[10px] font-mono shrink-0"
          :class="store.inputValidation.valid ? 'text-emerald-400' : 'text-red-400'"
          :title="store.inputValidation.valid ? '' : store.inputValidation.message"
        >
          <BaseIcon :name="store.inputValidation.valid ? 'check' : 'x'" class="w-3 h-3 inline mr-0.5 align-middle" />{{ store.inputValidation.message }}
        </span>
      </div>

      <button
        class="algo-btn algo-btn-primary"
        :disabled="store.isCompiling || !store.inputValidation.valid"
        :class="{ 'algo-btn-disabled': store.isCompiling || !store.inputValidation.valid }"
        @click="store.run()"
      >
        <BaseIcon v-if="store.isCompiling" name="spinner" class="w-3.5 h-3.5 inline mr-1 animate-spin" /><BaseIcon v-else name="play" class="w-3.5 h-3.5 inline mr-1" />{{ store.isCompiling ? 'Đang chạy…' : 'Chạy' }}
      </button>

      <!-- Menu ⋯: hành động phụ -->
      <button ref="moreMenuBtn" class="algo-btn algo-btn-icon" title="Thêm" aria-label="Menu thêm" @click="toggleMoreMenu">
        <BaseIcon name="list" class="w-4 h-4" />
      </button>
      <div v-if="showMoreMenu" class="fixed inset-0 z-20" @click="showMoreMenu = false"></div>
      <div v-if="showMoreMenu" class="fixed z-30 w-44 rounded-lg bg-surface/95 border border-surface/70 shadow-xl py-1" :style="moreMenuStyle">
        <button class="algo-menu-item" @click="menuAction('hooks')"><BaseIcon name="info" class="w-3.5 h-3.5 inline mr-2 align-middle" />Hooks</button>
        <button class="algo-menu-item" @click="menuAction('restore')"><BaseIcon name="refresh-cw" class="w-3.5 h-3.5 inline mr-2 align-middle" />Code mẫu</button>
        <button class="algo-menu-item" @click="menuAction('export')">
          <BaseIcon :name="exportCopied ? 'check' : 'download'" class="w-3.5 h-3.5 inline mr-2 align-middle" />{{ exportCopied ? 'Đã chép' : 'Xuất code' }}
        </button>
        <button class="algo-menu-item" @click="menuAction('share')">
          <BaseIcon :name="shareCopied ? 'check' : 'link'" class="w-3.5 h-3.5 inline mr-2 align-middle" />{{ shareCopied ? 'Đã chép' : 'Chia sẻ' }}
        </button>
        <button class="algo-menu-item" @click="menuAction('breakpoints')"><BaseIcon name="x-circle" class="w-3.5 h-3.5 inline mr-2 align-middle" />Xóa breakpoint</button>
      </div>

      <!-- Hooks popover (đặt trong toolbar → định vị theo toolbar, không lệch khi wrap — AL-043) -->
      <div v-if="showHooks" class="absolute left-2 right-2 top-[calc(100%+4px)] z-30 max-h-48 overflow-auto rounded-lg bg-surface/95 border border-surface/70 shadow-xl px-3 py-2">
        <pre class="text-[10px] font-mono text-text-secondary whitespace-pre-wrap leading-relaxed">{{ HOOKS_HINT }}</pre>
      </div>
    </div>

    <!-- Thanh header gộp: Code | Visual -->
    <div class="shrink-0 px-3 py-1 border-b border-surface/70 bg-surface/30 flex items-center justify-between text-[10px] font-semibold text-text-secondary uppercase tracking-wide">
      <span class="flex items-center gap-2 min-w-0">
        <span>Trình chạy từng bước (JavaScript)</span>
        <span class="demo-chip" title="Pseudocode + biến theo từng dòng">pseudocode</span>
        <button class="algo-mini-btn" :title="editorCollapsed ? 'Hiện editor' : 'Ẩn editor để mở rộng canvas'" @click="editorCollapsed = !editorCollapsed">
          <BaseIcon :name="editorCollapsed ? 'eye' : 'x'" class="w-3 h-3" />
        </button>
        <button class="algo-mini-btn" title="Định dạng lại code" @click="onFormat"><BaseIcon name="refresh-cw" class="w-3 h-3 inline mr-1 align-middle" />Format</button>
      </span>
      <span class="flex items-center gap-2 shrink-0">
        <span>Visualization — {{ renderModeLabel }}</span>
        <span v-if="store.totalFrames > 0" class="text-accent">Bước {{ store.currentIndex + 1 }}/{{ store.totalFrames }}</span>
        <button class="algo-mini-btn" title="Toàn màn hình" aria-label="Toàn màn hình" @click="toggleFullscreen"><BaseIcon :name="isFullscreen ? 'minimize-2' : 'maximize-2'" class="w-3 h-3" /></button>
      </span>
    </div>

    <!-- Main: Editor + Canvas (splitpanes, responsive) -->
    <Splitpanes
      class="custom-splitpanes flex-1 min-h-0"
      :class="{ 'hide-splitter': editorCollapsed }"
      :horizontal="isStacked"
      :dbl-click-splitter="false"
    >
      <Pane :size="editorCollapsed ? 0 : 42" :min-size="editorCollapsed ? 0 : 25">
        <div v-show="!editorCollapsed" class="flex flex-col w-full h-full min-w-0">
          <div v-if="editorLoadError" class="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center">
            <BaseIcon name="warning" class="w-8 h-8 text-accent-yellow" />
            <p class="text-xs font-semibold text-text-primary">Không thể tải Monaco Editor</p>
            <p class="text-[10px] text-text-secondary">Hãy reload lại trang.</p>
            <button class="algo-btn algo-btn-primary" @click="reloadPage">Tải lại trang (F5)</button>
          </div>
          <div v-else ref="editorContainer" class="flex-1 min-h-0 min-w-0"></div>
        </div>
      </Pane>

      <Pane :size="editorCollapsed ? 100 : 58" :min-size="25">
        <div class="flex flex-col w-full h-full min-w-0">
          <div ref="canvasWrap" class="custom-fullscreen relative flex-1 min-h-0">
            <canvas ref="canvasEl" class="w-full h-full block" role="img" :aria-label="`Trực quan hóa thuật toán — ${renderModeLabel}`"></canvas>

            <!-- Empty state -->
            <div
              v-if="store.totalFrames === 0 && !store.isCompiling && !store.compileError"
              class="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none"
            >
              <BaseIcon name="puzzle" class="w-10 h-10 opacity-40" />
              <p class="text-sm text-text-secondary">Chọn demo và bấm <span class="text-accent font-semibold">Chạy</span> để xem từng bước.</p>
            </div>

            <!-- Compile overlay -->
            <div
              v-if="store.isCompiling"
              class="absolute inset-0 flex items-center justify-center bg-surface/50 backdrop-blur-[1px] pointer-events-none"
            >
              <div class="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface/80 border border-surface text-xs text-text-primary">
                <BaseIcon name="spinner" class="w-3.5 h-3.5 animate-spin" /> Đang biên dịch…
              </div>
            </div>
          </div>
        </div>
      </Pane>
    </Splitpanes>

    <!-- VCR + Trace -->
    <div class="shrink-0 border-t border-surface/70 bg-surface/40 px-3 py-2">
      <div v-if="store.compileError" class="mb-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400">
        LỖI: {{ store.compileError }}
      </div>

      <div class="flex items-center gap-3">
        <div class="flex items-center gap-1" role="group" aria-label="Điều khiển phát lại">
          <button class="algo-btn algo-btn-icon" title="Bước lùi (Left)" aria-label="Bước lùi" :disabled="store.totalFrames === 0" @click="anim.onStepPrev()"><BaseIcon name="step-backward" class="w-4 h-4" /></button>
          <button class="algo-btn algo-btn-icon algo-btn-play" title="Phát / Tạm dừng (Space)" aria-label="Phát hoặc tạm dừng" @click="store.togglePlay()">
            <BaseIcon :name="store.isPlaying ? 'pause' : 'play'" class="w-4 h-4" />
          </button>
          <button class="algo-btn algo-btn-icon" title="Bước tới (Right)" aria-label="Bước tới" :disabled="store.totalFrames === 0" @click="anim.onStepNext()"><BaseIcon name="step-forward" class="w-4 h-4" /></button>
          <button class="algo-btn algo-btn-icon" title="Đến cuối (Shift+Right hoặc End)" aria-label="Đến cuối" :disabled="store.totalFrames === 0" @click="onJumpToEnd"><BaseIcon name="skip-forward" class="w-4 h-4" /></button>
          <button class="algo-btn algo-btn-icon" title="Về đầu (Home)" aria-label="Về đầu" :disabled="store.totalFrames === 0" @click="anim.onReset()"><BaseIcon name="skip-backward" class="w-4 h-4" /></button>
        </div>

        <div class="relative flex-1" @mousemove="onScrubberHover" @mouseleave="hoverFrame = null">
          <input
            class="w-full accent-amber-400"
            type="range"
            min="0"
            :max="Math.max(0, store.totalFrames - 1)"
            :value="store.currentIndex"
            :disabled="store.totalFrames === 0"
            :title="store.totalFrames > 0 ? `Bước ${store.currentIndex + 1}/${store.totalFrames}` : 'Chưa có dữ liệu'"
            aria-label="Thanh tiến trình các bước"
            @input="onScrub"
          />
          <!-- Marker các bước quan trọng (swap / tìm thấy) -->
          <div v-if="store.notableSteps.length > 0" class="absolute inset-x-1 -bottom-1.5 h-1.5 pointer-events-none">
            <span
              v-for="m in markerPositions"
              :key="m.index"
              class="scrubber-marker absolute w-1 h-1 rounded-full bg-amber-400/80"
              :style="{ left: m.pct + '%' }"
            ></span>
          </div>
          <!-- Tooltip preview khi hover -->
          <div
            v-if="hoverFrame"
            class="absolute -top-9 -translate-x-1/2 pointer-events-none z-20 px-2 py-1 rounded-md bg-surface/95 border border-surface/70 text-[10px] text-text-primary whitespace-nowrap max-w-[70%] overflow-hidden text-ellipsis"
            :style="{ left: hoverPct + '%' }"
          >
            Bước {{ hoverFrame.index + 1 }}: {{ hoverFrame.description }}
          </div>
        </div>

        <select class="algo-speed" :value="store.playbackSpeed" @change="onSpeedChange" aria-label="Tốc độ phát lại">
          <option v-for="speed in PLAYBACK_SPEEDS" :key="speed" :value="speed">{{ speed }}x</option>
        </select>
      </div>

      <div class="mt-2 flex items-start gap-3">
        <div class="flex-1 text-xs text-text-secondary leading-relaxed min-h-[20px]">
          <span v-if="store.currentFrame" class="text-text-primary font-medium">
            {{ store.currentFrame.lineNumber > 0 ? `Dòng ${store.currentFrame.lineNumber}: ` : '' }}
          </span>
          <span class="text-cyan-300/90" v-html="parseEmojiToSvg(escapeHtmlText(store.currentDescription))"></span>
        </div>
        <div v-if="store.currentFrame && hasLoopVariables" class="shrink-0 flex flex-wrap gap-1 justify-end max-w-[40%]">
          <span
            v-for="(value, name) in store.currentFrame.canvasStateSnapshot.loopVariables"
            :key="name"
            class="px-2 py-0.5 rounded-md bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[10px] font-mono"
          >
            {{ name }} = {{ value }}
          </span>
        </div>
        <button class="algo-mini-btn shrink-0" :class="{ 'algo-btn-active': showWatch }" title="Theo dõi biến (Watch)" @click="showWatch = !showWatch">
          <BaseIcon name="eye" class="w-3 h-3 inline mr-1 align-middle" />Watch
        </button>
        <button class="algo-mini-btn shrink-0" :class="{ 'algo-btn-active': showTrace }" @click="showTrace = !showTrace">
          <BaseIcon name="clipboard-list" class="w-3 h-3 inline mr-1 align-middle" />Lịch sử ({{ store.traceLogs.length }})
        </button>
      </div>

      <!-- B2: Watch panel — biến primitive theo dõi, highlight biến thay đổi -->
      <div v-if="showWatch" class="mt-2 max-h-40 overflow-auto rounded-lg bg-surface/60 border border-surface/70 px-3 py-2">
        <div class="flex items-center justify-between gap-2 mb-1.5">
          <p class="text-[10px] font-semibold text-text-secondary uppercase tracking-wide">Watch — biến primitive (click biến để ghim/ẩn)</p>
          <button class="algo-mini-btn" @click="store.clearWatchList()" title="Xóa danh sách theo dõi">Xóa</button>
        </div>
        <div class="flex flex-wrap gap-1.5 mb-2">
          <button
            v-for="name in availableVariableNames"
            :key="name"
            class="algo-watch-chip"
            :class="{ 'algo-watch-chip--active': store.watchList.includes(name) }"
            @click="store.toggleWatchVariable(name)"
          >
            {{ name }}
          </button>
        </div>
        <p v-if="store.watchedValues.length === 0" class="text-[10px] text-text-secondary italic">
          Chưa có biến được ghim — chọn biến phía trên để theo dõi.
        </p>
        <table v-else class="w-full text-[11px] font-mono">
          <tbody>
            <tr v-for="item in store.watchedValues" :key="item.name">
              <td class="py-0.5 pr-3 text-text-secondary">{{ item.name }}</td>
              <td class="py-0.5">
                <span class="px-2 py-0.5 rounded-md font-semibold" :class="item.changed ? 'bg-cyan-400/15 border border-cyan-400/40 text-cyan-300' : 'bg-bg-secondary border border-border-subtle text-text-primary'">
                  {{ formatValue(item.value) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Trace history -->
      <div ref="traceScrollEl" v-if="showTrace" class="mt-2 max-h-40 overflow-auto rounded-lg bg-surface/60 border border-surface/70 px-3 py-2">
        <p v-if="store.traceLogs.length === 0" class="text-[10px] text-text-secondary">
          Chưa có sự kiện — bấm Chạy để bắt đầu theo dõi.
        </p>
        <p
          v-for="(log, i) in store.traceLogs"
          :key="i"
          class="text-[10px] font-mono text-text-secondary leading-relaxed"
          :class="{ 'text-text-primary': i === store.traceLogs.length - 1 }"
        >
          {{ log }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount, onActivated, onDeactivated } from 'vue';
import { useRoute } from 'vue-router';
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import * as monaco from 'monaco-editor';
import 'monaco-editor/esm/vs/language/typescript/monaco.contribution';
import 'monaco-editor/min/vs/editor/editor.main.css';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import { Splitpanes, Pane } from 'splitpanes';
import 'splitpanes/dist/splitpanes.css';
import { useAlgoPlaygroundStore, type AlgoRenderMode } from '../store/useAlgoPlaygroundStore';
import { useAlgoAnimation } from '../composables/useAlgoAnimation';
import { parseEmojiToSvg, escapeHtmlText } from '../../../utils/emojiParser';
import { disposeCompileWorker } from '../../../core/compileWorker';
import { playgroundAlgoDemos, getAlgoDemo, generateDemoInput, HOOKS_HINT } from '../engine/playgroundAlgoDemos';
import { PseudocodeSyncer } from '../../algorithm-sandbox/engine/PseudocodeSyncer';
import { useThemeStore } from '../../../shared/store/useThemeStore';

const props = defineProps<{ demoId?: string }>();

const PLAYBACK_SPEEDS: readonly number[] = [0.25, 0.5, 1, 1.5, 2, 3, 4];

interface MonacoWorkerEnvironment {
  MonacoEnvironment: {
    getWorker(moduleId: string, label: string): Worker;
  };
}

(globalThis as unknown as MonacoWorkerEnvironment).MonacoEnvironment = {
  getWorker: (_moduleId: string, label: string): Worker => {
    if (label === 'typescript' || label === 'javascript') return new tsWorker();
    return new editorWorker();
  },
};

const store = useAlgoPlaygroundStore();
const themeStore = useThemeStore();
const route = useRoute();
const monacoTheme = computed(() => (themeStore.currentTheme === 'light' ? 'vs' : 'vs-dark'));

const editorContainer = ref<HTMLDivElement | null>(null);
const canvasEl = ref<HTMLCanvasElement | null>(null);
const canvasWrap = ref<HTMLDivElement | null>(null);
const traceScrollEl = ref<HTMLDivElement | null>(null);
const editorLoadError = ref(false);
const showHooks = ref(false);
const showTrace = ref(false);
const showWatch = ref(false);
const showMoreMenu = ref(false);
const editorCollapsed = ref(false);
const shareCopied = ref(false);
const exportCopied = ref(false);
const hoverFrame = ref<{ index: number; description: string } | null>(null);
const hoverPct = ref(0);
const moreMenuBtn = ref<HTMLButtonElement | null>(null);
const moreMenuStyle = ref<{ top: string; left: string }>({ top: '0px', left: '0px' });
// AL-001: cờ component visible — KeepAlive deactivate → phím tắt window không còn hiệu lực
const componentVisible = ref(true);

const isStacked = ref(false);

/** Hint validation hiển thị inline trong ô input (ẩn khi input trống). */
const inputHintVisible = computed(() => {
  if (store.inputRaw.trim().length === 0) return false;
  return store.inputValidation.message !== 'Input trống';
});

/** AL-043: menu ⋯ định vị động theo vị trí nút trigger — không lệch khi toolbar wrap. */
function toggleMoreMenu(): void {
  showMoreMenu.value = !showMoreMenu.value;
  if (showMoreMenu.value && moreMenuBtn.value) {
    const rect = moreMenuBtn.value.getBoundingClientRect();
    const width = 176;
    const left = Math.min(Math.max(8, rect.right - width), window.innerWidth - width - 8);
    moreMenuStyle.value = { top: `${rect.bottom + 4}px`, left: `${Math.max(8, left)}px` };
  }
}

/** Hành động trong menu ⋯. */
function menuAction(action: 'hooks' | 'restore' | 'share' | 'export' | 'breakpoints'): void {
  showMoreMenu.value = false;
  if (action === 'hooks') showHooks.value = !showHooks.value;
  else if (action === 'restore') onRestoreCode();
  else if (action === 'export') onExportCode();
  else if (action === 'breakpoints') {
    store.clearBreakpoints();
    syncBreakpointDecorations();
  }
  else onShare();
}

/** B4: xuất code hiện tại ra clipboard (nối luồng Export/Share). */
function onExportCode(): void {
  const copy = () => {
    exportCopied.value = true;
    window.setTimeout(() => { exportCopied.value = false; }, 2000);
  };
  if (navigator.clipboard?.writeText) {
    void navigator.clipboard.writeText(store.code).then(copy).catch(() => {
      window.prompt('Sao chép code:', store.code);
      copy();
    });
  } else {
    window.prompt('Sao chép code:', store.code);
    copy();
  }
}

const anim = useAlgoAnimation(canvasEl, store);

function reloadPage(): void {
  window.location.reload();
}

const currentDemo = computed(() => (store.demoId ? getAlgoDemo(store.demoId) : undefined));

/** Vị trí phần trăm của các marker trên scrubber. */
const markerPositions = computed(() => {
  const total = store.totalFrames;
  if (total <= 1) return [];
  return store.notableSteps.map(m => ({
    index: m.index,
    pct: Math.round((m.index / (total - 1)) * 1000) / 10,
  }));
});

const demoGroups = computed(() => {
  const groups: { label: string; value: string; items: typeof playgroundAlgoDemos[string][] }[] = [
    { label: 'Sắp xếp', value: 'sorting', items: [] },
    { label: 'Tìm kiếm', value: 'searching', items: [] },
    { label: 'Ngăn xếp & Hàng đợi', value: 'stack-queue', items: [] },
    { label: 'Cây & Đồ thị', value: 'tree-graph', items: [] },
  ];
  for (const demo of Object.values(playgroundAlgoDemos)) {
    const group = groups.find(g => g.value === demo.category);
    if (group) group.items.push(demo);
  }
  return groups;
});

const renderModeLabel = computed(() => {
  const labels: Record<AlgoRenderMode, string> = {
    array: 'Mảng',
    tree: 'Cây nhị phân',
    graph: 'Đồ thị',
  };
  return labels[store.renderMode];
});

const hasLoopVariables = computed(() => {
  const loopVars = store.currentFrame?.canvasStateSnapshot.loopVariables;
  return !!loopVars && Object.keys(loopVars).length > 0;
});

/** B2: danh sách biến primitive xuất hiện ở frame hiện tại (chip chọn watch). */
const availableVariableNames = computed<string[]>(() => Object.keys(store.currentVariables).sort());

/** B2: format giá trị biến hiển thị trên Watch Panel. */
function formatValue(value: number | string | boolean): string {
  if (typeof value === 'string') return `"${value}"`;
  if (typeof value === 'boolean') return String(value);
  return String(value);
}

function onSelectDemo(event: Event): void {
  const value = (event.target as HTMLSelectElement).value;
  if (!value) return;
  store.loadDemo(value);
  store.run();
}

function onInputChange(event: Event): void {
  store.setInput((event.target as HTMLInputElement).value);
}

function onRandomInput(): void {
  store.setInput(generateDemoInput(store.demoId ?? 'bubble-sort'));
  store.run();
}

function onRestoreCode(): void {
  const demo = currentDemo.value;
  if (!demo) return;
  store.setCode(demo.code);
  store.invalidate();
  store.run();
}

function onScrub(event: Event): void {
  anim.onJumpToFrame(Number((event.target as HTMLInputElement).value));
}

function onSpeedChange(event: Event): void {
  // AL-040: dùng action của store thay mutation trực tiếp
  store.setPlaybackSpeed(Number((event.target as HTMLSelectElement).value));
}

function onJumpToEnd(): void {
  if (store.totalFrames > 0) anim.onJumpToFrame(store.totalFrames - 1);
}

/** Preview description của frame khi hover trên scrubber. */
function onScrubberHover(event: MouseEvent): void {
  const total = store.totalFrames;
  if (total <= 0) return;
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  if (rect.width <= 0) return;
  const pct = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
  const index = Math.min(total - 1, Math.max(0, Math.round(pct * (total - 1))));
  hoverPct.value = Math.round(pct * 1000) / 10;
  const frame = store.frames[index];
  if (frame) {
    hoverFrame.value = { index, description: frame.description };
  }
}

/** Chia sẻ trạng thái (demo + code + input) qua URL nén lz-string. */
function onShare(): void {
  const payload = JSON.stringify({ demo: store.demoId, code: store.code, input: store.inputRaw });
  const encoded = compressToEncodedURIComponent(payload);
  const url = new URL(window.location.href);
  url.searchParams.set('demo', store.demoId ?? 'bubble-sort');
  url.searchParams.set('src', encoded);
  const shareUrl = url.toString();
  const copy = () => {
    shareCopied.value = true;
    window.setTimeout(() => { shareCopied.value = false; }, 2000);
  };
  if (navigator.clipboard?.writeText) {
    void navigator.clipboard.writeText(shareUrl).then(copy).catch(() => {
      window.prompt('Sao chép link chia sẻ:', shareUrl);
      copy();
    });
  } else {
    window.prompt('Sao chép link chia sẻ:', shareUrl);
    copy();
  }
}

/** Khôi phục trạng thái từ URL ?src= (nén lz-string). */
function restoreSharedState(): void {
  const src = route.query.src;
  if (typeof src !== 'string' || src.length === 0) return;
  try {
    const json = decompressFromEncodedURIComponent(src);
    if (!json) return;
    const parsed = JSON.parse(json) as { demo?: string; code?: string; input?: string };
    if (typeof parsed.code === 'string' && parsed.code.length > 0) {
      store.setCode(parsed.code);
      if (typeof parsed.input === 'string') store.setInput(parsed.input);
      if (parsed.demo) store.applyExternalDemo(parsed.demo);
    }
  } catch {
    // payload hỏng — bỏ qua, dùng trạng thái mặc định
  }
}

function toggleFullscreen(): void {
  if (document.fullscreenElement) {
    void document.exitFullscreen?.();
  } else {
    void canvasWrap.value?.requestFullscreen?.();
  }
}

const isFullscreen = ref(false);
function onFullscreenChange(): void {
  isFullscreen.value = !!document.fullscreenElement;
}

// ---------------- Monaco Editor ----------------
let editorInstance: monaco.editor.IStandaloneCodeEditor | null = null;
let previousDecorations: string[] = [];
let breakpointDecorations: string[] = [];

function syncLineToEditor(lineNumber: number): void {
  if (!editorInstance) return;
  if (lineNumber > 0) {
    previousDecorations = PseudocodeSyncer.highlightMonacoLine(editorInstance, lineNumber, previousDecorations);
  } else if (previousDecorations.length > 0) {
    previousDecorations = editorInstance.deltaDecorations(previousDecorations, []);
  }
}

/** B1: vẽ/vô hiệu chấm đỏ breakpoint trên gutter. */
function syncBreakpointDecorations(): void {
  if (!editorInstance) return;
  const decorations = [...store.breakpoints].map((line) => ({
    range: new monaco.Range(line, 1, line, 1),
    options: {
      isWholeLine: true,
      glyphMarginClassName: 'algo-breakpoint-glyph',
      glyphMarginHoverMessage: { value: 'Breakpoint — play sẽ dừng tại dòng này' },
    },
  }));
  breakpointDecorations = editorInstance.deltaDecorations(breakpointDecorations, decorations);
}

function onFormat(): void {
  editorInstance?.getAction('editor.action.formatDocument')?.run();
}

// ---------------- Keyboard shortcuts ----------------
function onKeydown(event: KeyboardEvent): void {
  // AL-001: KeepAlive deactivate → component không visible → phím tắt bị vô hiệu
  if (!componentVisible.value) return;
  // AL-043: Esc đóng menu ⋯ / popover Hooks bất kể focus ở đâu
  if (event.code === 'Escape') {
    showMoreMenu.value = false;
    showHooks.value = false;
    return;
  }
  const el = document.activeElement;
  // Nút button tự xử lý Space/Enter/Arrow — tránh kích hoạt kép (click + phím tắt).
  if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.tagName === 'BUTTON')) return;
  if (editorInstance?.hasTextFocus()) return;
  if (store.totalFrames === 0) return;
  switch (event.code) {
    case 'Space':
      event.preventDefault();
      store.togglePlay();
      break;
    case 'ArrowRight':
      event.preventDefault();
      if (event.shiftKey) onJumpToEnd();
      else anim.onStepNext();
      break;
    case 'ArrowLeft':
      event.preventDefault();
      if (event.shiftKey) anim.onReset();
      else anim.onStepPrev();
      break;
    case 'Home':
      event.preventDefault();
      anim.onReset();
      break;
    case 'End':
      event.preventDefault();
      onJumpToEnd();
      break;
    default:
      break;
  }
}

let mediaQuery: MediaQueryList | null = null;
let onMediaChange: ((e: MediaQueryListEvent) => void) | null = null;
let resizeObserver: ResizeObserver | null = null;

/**
 * AL-045: auto-run chỉ khi code/input/demoId THỰC SỰ đổi so với lần chạy trước
 * (so với store.autoRunSignature) — remount cùng trạng thái không re-compile.
 */
function runIfChanged(): void {
  const sig = `${store.demoId ?? ''}|${store.code}|${store.inputRaw}`;
  if (sig !== store.autoRunSignature) {
    store.run();
  }
}

/**
 * AL-002: đồng bộ snapshot engine theo frame hiện tại (dùng khi onActivated —
 * composable không expose syncSnapshots nên tái lập tại đây).
 */
function syncEngineSnapshots(): void {
  const idx = store.currentIndex;
  const frames = store.frames;
  if (frames.length === 0) return;
  const currentFrame = frames[idx];
  if (!currentFrame) return;
  const prevFrame = frames[Math.max(0, idx - 1)];
  anim.engine.setSnapshots(
    prevFrame?.canvasStateSnapshot ?? null,
    currentFrame.canvasStateSnapshot,
  );
}

onMounted(() => {
  if (!store.code) {
    store.loadDemo(props.demoId && playgroundAlgoDemos[props.demoId] ? props.demoId : 'bubble-sort');
  }
  restoreSharedState(); // ưu tiên trạng thái chia sẻ từ URL (?src=)
  runIfChanged();

  // Responsive: xếp dọc editor/canvas trên màn hình hẹp
  if (typeof window.matchMedia === 'function') {
    mediaQuery = window.matchMedia('(max-width: 768px)');
    isStacked.value = mediaQuery.matches;
    onMediaChange = (e: MediaQueryListEvent): void => { isStacked.value = e.matches; };
    mediaQuery.addEventListener('change', onMediaChange);
  }

  // Vẽ lại canvas khi container đổi kích thước (phải tạo trong onMounted — canvas chưa bind ở setup)
  if (typeof ResizeObserver !== 'undefined' && canvasEl.value?.parentElement) {
    resizeObserver = new ResizeObserver(() => anim.onResize());
    resizeObserver.observe(canvasEl.value.parentElement);
  }

  window.addEventListener('keydown', onKeydown);
  document.addEventListener('fullscreenchange', onFullscreenChange);

  if (editorContainer.value) {
    try {
      editorInstance = monaco.editor.create(editorContainer.value, {
        value: store.code,
        language: 'javascript',
        theme: monacoTheme.value,
        automaticLayout: true,
        fontSize: 13,
        lineNumbers: 'on',
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        cursorBlinking: 'smooth',
        padding: { top: 10, bottom: 10 },
        fontFamily: 'JetBrains Mono, Fira Code, monospace',
        scrollbar: { vertical: 'visible', horizontal: 'visible', verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
      });
      editorInstance.onDidChangeModelContent(() => {
        store.setCode(editorInstance?.getValue() ?? '');
        store.invalidate();
      });
      editorInstance.onMouseDown((e) => {
        // B1: click gutter line number → toggle breakpoint (chuẩn debugger).
        if (e.target && e.target.type === monaco.editor.MouseTargetType.GUTTER_LINE_NUMBERS) {
          const line = e.target.position?.lineNumber ?? 0;
          if (line > 0) {
            store.toggleBreakpoint(line);
            syncBreakpointDecorations();
          }
        }
      });
    } catch (err) {
      console.error('Monaco create failed in algo playground:', err);
      editorLoadError.value = true;
    }
  }
});

watch(() => monacoTheme.value, (theme) => {
  if (editorInstance) monaco.editor.setTheme(theme);
});
watch(() => store.currentLineNumber, syncLineToEditor, { immediate: true });
watch(() => store.breakpoints, syncBreakpointDecorations, { immediate: true });
watch(
  () => store.code,
  (newCode) => {
    // Đồng bộ store → editor khi đổi demo (tránh desync Monaco)
    if (editorInstance && newCode !== editorInstance.getValue()) {
      editorInstance.setValue(newCode);
    }
  },
);
watch(
  () => props.demoId,
  (id) => {
    // AL-014: URL ?demo= ưu tiên hơn localStorage — immediate ngay khi mount
    if (id && id !== store.demoId) {
      store.loadDemo(id);
      store.run();
    }
  },
  { immediate: true },
);

// Tự cuộn trace history xuống cuối khi có log mới
watch(() => store.traceLogs.length, () => {
  void nextTick(() => {
    if (traceScrollEl.value) traceScrollEl.value.scrollTop = traceScrollEl.value.scrollHeight;
  });
});

// AL-001 + AL-002: KeepAlive deactivate → gỡ phím tắt window + dừng engine rAF;
// activate → đăng ký lại phím tắt + đồng bộ snapshot + phát lại theo store.isPlaying.
onDeactivated(() => {
  componentVisible.value = false;
  window.removeEventListener('keydown', onKeydown);
  anim.engine.pause();
});

onActivated(() => {
  componentVisible.value = true;
  window.addEventListener('keydown', onKeydown);
  syncEngineSnapshots();
  if (store.isPlaying) {
    anim.engine.play();
  } else {
    anim.engine.pause();
  }
});

onBeforeUnmount(() => {
  if (mediaQuery && onMediaChange) mediaQuery.removeEventListener('change', onMediaChange);
  mediaQuery = null;
  onMediaChange = null;
  window.removeEventListener('keydown', onKeydown);
  document.removeEventListener('fullscreenchange', onFullscreenChange);
  resizeObserver?.disconnect();
  disposeCompileWorker();
  if (editorInstance && previousDecorations.length > 0) {
    editorInstance.deltaDecorations(previousDecorations, []);
    previousDecorations = [];
  }
  if (editorInstance && breakpointDecorations.length > 0) {
    editorInstance.deltaDecorations(breakpointDecorations, []);
    breakpointDecorations = [];
  }
  editorInstance?.dispose();
  editorInstance = null;
});
</script>

<style scoped>
.algo-demo-select {
  max-width: 240px;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-primary);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border-strong);
  outline: none;
  cursor: pointer;
  accent-color: var(--color-accent-yellow);
  color-scheme: dark;
}

.algo-input {
  flex: 1 1 160px;
  min-width: 120px;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-family: 'JetBrains Mono', Consolas, monospace;
  color: var(--color-text-primary);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border-strong);
  outline: none;
}

.algo-icon-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  font-size: 14px;
  background: transparent;
  border: 1px solid var(--color-border-strong);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s ease;
}
.algo-icon-btn:hover {
  background: var(--color-bg-hover);
}

.algo-btn {
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-primary);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border-strong);
  cursor: pointer;
  transition: background 0.15s ease;
}
.algo-btn:hover {
  background: var(--color-bg-hover);
}

.algo-btn-active {
  background: color-mix(in srgb, var(--color-accent-yellow) 14%, transparent);
  border-color: color-mix(in srgb, var(--color-accent-yellow) 40%, transparent);
  color: var(--color-accent-yellow);
}

.algo-btn-primary {
  background: color-mix(in srgb, var(--color-accent-yellow) 15%, transparent);
  border-color: color-mix(in srgb, var(--color-accent-yellow) 40%, transparent);
  color: var(--color-accent-yellow);
}
.algo-btn-primary:hover {
  background: color-mix(in srgb, var(--color-accent-yellow) 28%, transparent);
}

.algo-btn-disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

.algo-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
}

.demo-chip {
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 600;
  font-family: 'JetBrains Mono', Consolas, monospace;
  color: var(--color-accent-cyan-light);
  background: color-mix(in srgb, var(--color-accent-cyan-light) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-accent-cyan-light) 25%, transparent);
  white-space: nowrap;
}

.algo-btn-icon {
  width: 34px;
  height: 34px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
}
.algo-btn-play {
  background: color-mix(in srgb, var(--color-accent-emerald) 15%, transparent);
  border-color: color-mix(in srgb, var(--color-accent-emerald) 40%, transparent);
  color: var(--color-accent-emerald-light);
}

.algo-mini-btn {
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 600;
  color: var(--color-text-secondary);
  background: transparent;
  border: 1px solid var(--color-border-strong);
  cursor: pointer;
  transition: all 0.15s ease;
}
.algo-mini-btn:hover {
  color: var(--color-text-primary);
  background: var(--color-bg-hover);
}

.algo-speed {
  padding: 6px 8px;
  border-radius: 8px;
  font-size: 11px;
  color: var(--color-text-primary);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border-strong);
  outline: none;
  color-scheme: dark;
}

/* B1: chấm đỏ breakpoint trên gutter Monaco */
.algo-breakpoint-glyph::before {
  content: '';
  position: absolute;
  left: 6px;
  top: 50%;
  transform: translateY(-50%);
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--color-accent-red, #ef4444);
  box-shadow: 0 0 6px color-mix(in srgb, var(--color-accent-red, #ef4444) 60%, transparent);
}

/* B2: chip chọn biến theo dõi */
.algo-watch-chip {
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 600;
  font-family: 'JetBrains Mono', Consolas, monospace;
  color: var(--color-text-secondary);
  background: transparent;
  border: 1px solid var(--color-border-strong);
  cursor: pointer;
  transition: all 0.15s ease;
}
.algo-watch-chip:hover {
  color: var(--color-text-primary);
  background: var(--color-bg-hover);
}
.algo-watch-chip--active {
  color: var(--color-accent-cyan-light);
  background: color-mix(in srgb, var(--color-accent-cyan-light) 10%, transparent);
  border-color: color-mix(in srgb, var(--color-accent-cyan-light) 35%, transparent);
}

/* Splitpanes dark theme */
.custom-splitpanes :deep(.splitpanes__pane) {
  background: transparent;
}
.custom-splitpanes :deep(.splitpanes__splitter) {
  background: color-mix(in srgb, var(--color-text-secondary) 15%, transparent);
  transition: background 0.15s ease;
}
.custom-splitpanes :deep(.splitpanes__splitter:hover) {
  background: color-mix(in srgb, var(--color-accent-yellow) 40%, transparent);
}
/* Ẩn splitter khi editor bị thu gọn */
.custom-splitpanes.hide-splitter :deep(.splitpanes__splitter) {
  display: none;
}

/* Menu ⋯ */
.algo-menu-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 7px 12px;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-primary);
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background 0.12s ease;
}
.algo-menu-item:hover {
  background: var(--color-bg-hover);
}

/* Fullscreen canvas */
.custom-fullscreen:fullscreen {
  background: var(--color-bg-surface);
  padding: 12px;
  display: flex;
  flex-direction: column;
}
</style>
