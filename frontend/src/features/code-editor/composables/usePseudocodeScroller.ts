import { ref, watch, nextTick } from "vue";
import { useVcrStore } from "../../vcr-player/store/useVcrStore";

export function usePseudocodeScroller() {
  const vcrStore = useVcrStore();
  const viewport = ref<HTMLDivElement | null>(null);
  const lineRefs = ref<Record<number, HTMLElement>>({});

  watch(
    () => vcrStore.currentLineNumber,
    async (newLineNum) => {
      if (newLineNum <= 0) return;
      await nextTick();
      const activeEl = lineRefs.value[newLineNum];
      const viewportEl = viewport.value;
      if (activeEl && viewportEl) {
        const elTop = activeEl.offsetTop;
        const elHeight = activeEl.offsetHeight;
        const viewTop = viewportEl.scrollTop;
        const viewHeight = viewportEl.clientHeight;
        if (elTop < viewTop || elTop + elHeight > viewTop + viewHeight) {
          viewportEl.scrollTo({
            top: elTop - viewHeight / 2 + elHeight / 2,
            behavior: "smooth",
          });
        }
      }
    },
    { immediate: true }
  );

  return {
    viewport,
    lineRefs,
  };
}
