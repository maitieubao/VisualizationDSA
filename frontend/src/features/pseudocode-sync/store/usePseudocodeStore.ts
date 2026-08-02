import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAnimationStore } from '../../animation-engine/store/useAnimationStore';
import { PseudocodeSyncEngine } from '../engine/PseudocodeSyncEngine';
import { snapToLogicalLine, snapToNextOccurrence, getOccurrenceInfo } from './pseudocodeStoreHelpers';
import type {
  SupportedLanguage,
  CodeLine,
  LanguageCode,
  VariableState,
} from '../types/pseudocode.types';

export const usePseudocodeStore = defineStore('pseudocode', () => {
  const animStore = useAnimationStore();
  const selectedLanguage = ref<SupportedLanguage>('cpp');
  const codeLanguages = ref<LanguageCode[]>([]);

  const activeCodeLines = computed<CodeLine[]>(() => {
    const matched = codeLanguages.value.find((l) => l.language === selectedLanguage.value);
    return matched ? matched.lines : [];
  });

  const availableLanguages = computed<SupportedLanguage[]>(() => codeLanguages.value.map((l) => l.language));

  const activePhysicalLineNumber = computed<number | null>(() => {
    const frame = animStore.activeFrame;
    if (!frame || !frame.activeLogicalLineId) return null;
    const matchedLine = activeCodeLines.value.find((l) => l.logicalId === frame.activeLogicalLineId);
    return matchedLine ? matchedLine.lineNumber : null;
  });

  const activeLogicalLineId = computed<string | null>(() => animStore.activeFrame?.activeLogicalLineId ?? null);

  const watchVariablesList = computed<VariableState[]>(() => {
    const frame = animStore.activeFrame;
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
    selectedLanguage.value = 'cpp';
    codeLanguages.value = [];
  };

  return {
    selectedLanguage,
    codeLanguages,
    activeCodeLines,
    availableLanguages,
    activePhysicalLineNumber,
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
