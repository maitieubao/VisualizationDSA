import { defineStore } from 'pinia';
import { ref, computed, watch, onScopeDispose } from 'vue';
import { useAnimationStore } from '../../animation-engine/store/useAnimationStore';
import { PseudocodeSyncEngine } from '../engine/PseudocodeSyncEngine';
import { snapToLogicalLine, snapToNextOccurrence, getOccurrenceInfo, type AnimationStoreSync } from './pseudocodeStoreHelpers';
import type {
  SupportedLanguage,
  CodeLine,
  LanguageCode,
  VariableState,
} from '../types/pseudocode.types';

// ─── PS-006 (BEHAVIOR_SPEC §1): Debounced Highlight Updates ───
// Khi phát ở tốc độ >= 2.0x, frame đổi nhanh hơn 50ms/frame → highlight nhấp
// nháy + smooth-scroll xếp hàng jank. Coalesce bằng trailing debounce 50ms:
// các dòng trung gian bị BỎ QUA, chỉ dòng đích cuối cùng được highlight.
// Ở tốc độ < 2.0 highlight cập nhật ĐỒNG BỘ (không debounce).
const HIGHLIGHT_DEBOUNCE_MS = 50;
const HIGH_SPEED_THRESHOLD = 2.0;

// ─── PS-021: tham số hoá store nguồn ───
// LƯU Ý: không thể nhận store nguồn làm tham số setup store — pinia 2.3+ gọi
// `setup({ action })` (pinia.mjs) nên tham số đầu tiên luôn bị context nội bộ
// chiếm chỗ. Thay vào đó dùng binder module-level: playground/module khác gọi
// `bindAnimationStore(customStore)` TRƯỚC khi dùng store; mặc định giữ nguyên
// `useAnimationStore()` để không phá call-site hiện tại.
let boundAnimationStore: AnimationStoreSync | null = null;

export function bindAnimationStore(store: AnimationStoreSync): void {
  boundAnimationStore = store;
}

export function unbindAnimationStore(): void {
  boundAnimationStore = null;
}

export const usePseudocodeStore = defineStore('pseudocode', () => {
  const animStore = boundAnimationStore ?? useAnimationStore();

  const selectedLanguage = ref<SupportedLanguage>('cpp');
  const codeLanguages = ref<LanguageCode[]>([]);

  const activeCodeLines = computed<CodeLine[]>(() => {
    const matched = codeLanguages.value.find((l) => l.language === selectedLanguage.value);
    return matched ? matched.lines : [];
  });

  const availableLanguages = computed<SupportedLanguage[]>(() => codeLanguages.value.map((l) => l.language));

  const activeLogicalLineId = computed<string | null>(() => animStore.currentFrame?.activeLogicalLineId ?? null);

  // ─── PS-006 + PS-016 + PS-011: vị trí dòng vật lý active ───
  // `activePhysicalLineNumbers` là ref được watcher flush:'sync' cập nhật
  // (test phụ thuộc tính đồng bộ khi tốc độ < 2.0). lookup duy nhất qua
  // PseudocodeSyncEngine (PS-016); hỗ trợ nhiều dòng cùng logicalId (PS-011).
  const activePhysicalLineNumbers = ref<number[]>([]);

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  function clearDebounceTimer(): void {
    if (debounceTimer !== null) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
  }

  function updateActivePhysicalLines(): void {
    const frame = animStore.currentFrame;
    if (!frame || !frame.activeLogicalLineId) {
      activePhysicalLineNumbers.value = [];
      return;
    }
    activePhysicalLineNumbers.value = PseudocodeSyncEngine.getPhysicalLineNumbers(
      frame.activeLogicalLineId,
      selectedLanguage.value,
      codeLanguages.value,
    );
  }

  watch(
    [() => animStore.currentFrame, selectedLanguage, codeLanguages],
    () => {
      const frame = animStore.currentFrame;
      if (!frame || !frame.activeLogicalLineId) {
        // Frame rỗng (reset/unmount) → xoá highlight NGAY, không trễ.
        clearDebounceTimer();
        activePhysicalLineNumbers.value = [];
        return;
      }
      if ((animStore.playbackSpeed ?? 1.0) >= HIGH_SPEED_THRESHOLD) {
        // Tốc độ cao: BỎ QUA các dòng trung gian (BEHAVIOR_SPEC §1) — xoá
        // highlight ngay khi vào cửa sổ debounce, chỉ dòng đích cuối cùng được
        // hiển thị sau 50ms tĩnh.
        clearDebounceTimer();
        activePhysicalLineNumbers.value = [];
        debounceTimer = setTimeout(updateActivePhysicalLines, HIGHLIGHT_DEBOUNCE_MS);
      } else {
        // Tốc độ thấp → giảm tốc/debounce còn treo: hủy và cập nhật tức thì.
        clearDebounceTimer();
        updateActivePhysicalLines();
      }
    },
    { immediate: true, flush: 'sync' },
  );

  // Không leak timer khi store bị thải hồi (PS-006).
  onScopeDispose(clearDebounceTimer);

  // Tương thích ngược với API cũ (component + test): dòng đầu tiên trong danh sách.
  const activePhysicalLineNumber = computed<number | null>(() => activePhysicalLineNumbers.value[0] ?? null);

  const watchVariablesList = computed<VariableState[]>(() => {
    const frame = animStore.currentFrame;
    if (!frame || !frame.variables) return [];
    return PseudocodeSyncEngine.transformVariablesForWatch(frame.variables);
  });

  const isScriptLoaded = computed<boolean>(() => codeLanguages.value.length > 0);

  const changeLanguage = (newLang: SupportedLanguage): void => { selectedLanguage.value = newLang; };

  function cycleLanguage(): void {
    const langs = availableLanguages.value;
    if (langs.length === 0) return;
    const currentIdx = langs.indexOf(selectedLanguage.value);
    selectedLanguage.value = langs[(currentIdx + 1) % langs.length];
  }

  function loadPseudocodeScript(languages: LanguageCode[]): void {
    codeLanguages.value = languages;
    if (languages.length > 0 && !languages.find((l) => l.language === selectedLanguage.value)) {
      selectedLanguage.value = languages[0].language;
    }
  }

  const resetStore = (): void => {
    clearDebounceTimer();
    selectedLanguage.value = 'cpp';
    codeLanguages.value = [];
    activePhysicalLineNumbers.value = [];
  };

  return {
    selectedLanguage,
    codeLanguages,
    activeCodeLines,
    availableLanguages,
    activePhysicalLineNumber,
    activePhysicalLineNumbers,
    activeLogicalLineId,
    watchVariablesList,
    isScriptLoaded,
    changeLanguage,
    cycleLanguage,
    loadPseudocodeScript,
    snapToLogicalLine: (logicalId: string) => snapToLogicalLine(animStore, logicalId),
    snapToNextOccurrence: (logicalId: string) => snapToNextOccurrence(animStore, logicalId),
    getOccurrenceInfo: (logicalId: string) => getOccurrenceInfo(animStore, logicalId),
    resetStore,
  };
});
