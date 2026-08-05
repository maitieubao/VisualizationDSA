






import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { EmbedTheme } from '../types/embed-widget.types';
import { EMBED_ALGORITHM_OPTIONS, EMBED_BASE_URL } from '../types/embed-widget.types';

export const useEmbedConfiguratorStore = defineStore('embedConfigurator', () => {
  
  
  
  const selectedTheme = ref<EmbedTheme>('glass');
  const showVcrControls = ref(true);
  const showWatchVariables = ref(true);
  const isInteractive = ref(true);

  const widgetWidth = ref(800);
  const widgetHeight = ref(500);
  const selectedAlgorithm = ref('quicksort-recursion');
  const isCopied = ref(false);

  let copyResetTimer: ReturnType<typeof setTimeout> | null = null;

  
  
  
  

  const widgetQueryParams = computed(() =>
    new URLSearchParams({
      algo: selectedAlgorithm.value,
      theme: selectedTheme.value,
      vcr: showVcrControls.value.toString(),
      watch: showWatchVariables.value.toString(),
      interactive: isInteractive.value.toString(),
    })
  );

  const generatedIframeCode = computed(() => {
    const iframeUrl = `${EMBED_BASE_URL}?${widgetQueryParams.value.toString()}`;
    return [
      `<iframe`,
      `  src="${iframeUrl}"`,
      `  width="${widgetWidth.value}"`,
      `  height="${widgetHeight.value}"`,
      `  style="border: none; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.15);"`,
      `  sandbox="allow-scripts allow-same-origin"`,
      `></iframe>`,
    ].join('\n');
  });

  const iframeSrcUrl = computed(() => {
    return `${EMBED_BASE_URL}?${widgetQueryParams.value.toString()}`;
  });

  const algorithmLabel = computed(() => {
    const found = EMBED_ALGORITHM_OPTIONS.find(
      (a) => a.id === selectedAlgorithm.value,
    );
    return found ? found.label : selectedAlgorithm.value;
  });

  const themeLabel = computed(() => {
    const labels: Record<EmbedTheme, string> = {
      dark: 'Dark',
      light: 'Light',
      glass: 'Glass',
    };
    return labels[selectedTheme.value];
  });

  
  
  

  async function copyEmbedCodeToClipboard(): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(generatedIframeCode.value);
      isCopied.value = true;

      if (copyResetTimer !== null) {
        clearTimeout(copyResetTimer);
      }
      copyResetTimer = setTimeout(() => {
        isCopied.value = false;
        copyResetTimer = null;
      }, 2000);

      return true;
    } catch (err) {
      console.error('Lỗi hạ tầng sao chép mã nhúng:', err);
      return false;
    }
  }

  function setTheme(theme: EmbedTheme): void {
    selectedTheme.value = theme;
  }

  function setAlgorithm(algoId: string): void {
    selectedAlgorithm.value = algoId;
  }

  function setDimensions(width: number, height: number): void {
    widgetWidth.value = Math.max(300, Math.min(1400, width));
    widgetHeight.value = Math.max(200, Math.min(900, height));
  }

  function toggleVcrControls(): void {
    showVcrControls.value = !showVcrControls.value;
  }

  function toggleWatchVariables(): void {
    showWatchVariables.value = !showWatchVariables.value;
  }

  function toggleInteractive(): void {
    isInteractive.value = !isInteractive.value;
  }

  function resetConfigurator(): void {
    selectedTheme.value = 'glass';
    showVcrControls.value = true;
    showWatchVariables.value = true;
    isInteractive.value = true;
    widgetWidth.value = 800;
    widgetHeight.value = 500;
    selectedAlgorithm.value = 'quicksort-recursion';
    isCopied.value = false;
  }

  return {
    selectedTheme,
    showVcrControls,
    showWatchVariables,
    isInteractive,
    widgetWidth,
    widgetHeight,
    selectedAlgorithm,
    isCopied,
    generatedIframeCode,
    iframeSrcUrl,
    themeLabel,
    algorithmLabel,
    copyEmbedCodeToClipboard,
    setTheme,
    setAlgorithm,
    setDimensions,
    toggleVcrControls,
    toggleWatchVariables,
    toggleInteractive,
    resetConfigurator,
  };
});
