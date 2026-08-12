import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

import { PlaygroundDocumentBuilder } from '../engine/PlaygroundDocumentBuilder';
import { PlaygroundUrlCodec } from '../engine/PlaygroundUrlCodec';
import {
  DEFAULT_PLAYGROUND_SOURCE,
  PLAYGROUND_TABS,
  type PlaygroundLanguage,
  type PlaygroundSource,
} from '../types/playground.types';

export const useHtmlPlaygroundStore = defineStore('html-playground', () => {
  const html = ref<string>(DEFAULT_PLAYGROUND_SOURCE.html);
  const css = ref<string>(DEFAULT_PLAYGROUND_SOURCE.css);
  const js = ref<string>(DEFAULT_PLAYGROUND_SOURCE.js);
  const activeTab = ref<PlaygroundLanguage>('html');
  const isPreviewVisible = ref(true);
  const revision = ref(0);

  const source = computed<PlaygroundSource>(() => ({ html: html.value, css: css.value, js: js.value }));

  const documentHtml = computed(() => PlaygroundDocumentBuilder.buildDocument(source.value));

  const activeCode = computed(() => {
    if (activeTab.value === 'html') return html.value;
    if (activeTab.value === 'css') return css.value;
    return js.value;
  });

  const setSourceFile = (language: PlaygroundLanguage, value: string): void => {
    if (language === 'html') html.value = value;
    else if (language === 'css') css.value = value;
    else js.value = value;
  };

  const setActiveTab = (language: PlaygroundLanguage): void => {
    activeTab.value = language;
  };

  const togglePreview = (): void => {
    isPreviewVisible.value = !isPreviewVisible.value;
  };

  const resetToDefault = (): void => {
    html.value = DEFAULT_PLAYGROUND_SOURCE.html;
    css.value = DEFAULT_PLAYGROUND_SOURCE.css;
    js.value = DEFAULT_PLAYGROUND_SOURCE.js;
    activeTab.value = 'html';
    revision.value += 1;
  };

  const loadFromSource = (next: PlaygroundSource): void => {
    html.value = next.html;
    css.value = next.css;
    js.value = next.js;
    // HT-021: nhất quán với resetToDefault — nạp source mới luôn quay về tab HTML
    activeTab.value = 'html';
    revision.value += 1;
  };

  const buildSharePayload = (): string | null => PlaygroundUrlCodec.encode(source.value);

  const loadFromSharePayload = (payload: string): boolean => {
    const decoded = PlaygroundUrlCodec.decode(payload);
    if (!decoded) return false;
    loadFromSource(decoded);
    return true;
  };

  return {
    html,
    css,
    js,
    activeTab,
    isPreviewVisible,
    revision,
    source,
    documentHtml,
    activeCode,
    tabs: PLAYGROUND_TABS,
    setSourceFile,
    setActiveTab,
    togglePreview,
    resetToDefault,
    loadFromSource,
    buildSharePayload,
    loadFromSharePayload,
  };
});
