import { ref, watch, onBeforeUnmount, type Ref } from 'vue';

// TC-028: composable a11y dùng chung cho mọi modal Teacher —
// focus trap (Tab), đóng bằng Esc, khóa scroll body, hoàn trả focus sau khi đóng.
// Cách dùng:
//   const { overlayEl } = useModalA11y(toRef(props, 'show'));
//   <div ref="overlayEl" role="dialog" aria-modal="true" aria-label="...">

// CU-003: stack modal toàn cục — chỉ modal TRÊN CÙNG nhận keydown (Esc đóng 1 modal,
// không đóng tất cả); scroll-lock đếm tham chiếu (đóng 1 modal không unlock khi còn modal khác).
const openStack: symbol[] = [];
// CU-003: registry overlay theo instance — trả focus về modal còn mở khi đóng modal dưới.
const overlayRegistry = new Map<symbol, HTMLElement | null>();
let scrollLockCount = 0;

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function acquireScrollLock(): void {
  scrollLockCount += 1;
  if (scrollLockCount === 1) {
    document.body.style.overflow = 'hidden';
  }
}

function releaseScrollLock(): void {
  scrollLockCount = Math.max(0, scrollLockCount - 1);
  if (scrollLockCount === 0) {
    document.body.style.overflow = '';
  }
}

export function useModalA11y(show: Ref<boolean>, focusTarget?: Ref<HTMLElement | null>) {
  const overlayEl = ref<HTMLElement | null>(null);
  const instanceKey = Symbol('modal-a11y');
  let lastFocused: HTMLElement | null = null;

  function isTopModal(): boolean {
    return openStack.length > 0 && openStack[openStack.length - 1] === instanceKey;
  }

  function onKeydown(e: KeyboardEvent): void {
    // CU-003: chỉ modal trên cùng xử lý phím — modal nằm dưới bỏ qua.
    if (!isTopModal()) return;
    if (e.key === 'Escape') {
      e.stopPropagation();
      show.value = false;
      return;
    }
    if (e.key === 'Tab') {
      const el = overlayEl.value;
      if (!el) return;
      // Focus trap: vòng Tab giữ trong modal, không lọt ra trang sau.
      const focusables = el.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  function cleanup(): void {
    document.removeEventListener('keydown', onKeydown);
    overlayRegistry.delete(instanceKey);
    const idx = openStack.indexOf(instanceKey);
    if (idx >= 0) {
      openStack.splice(idx, 1);
      releaseScrollLock();
    }
    if (openStack.length === 0) {
      // CU-031: không còn modal nào → hoàn trả focus về phần tử trước khi mở.
      lastFocused?.focus?.();
      lastFocused = null;
    } else {
      // Vẫn còn modal mở → trả focus về overlay của modal trên cùng.
      const topKey = openStack[openStack.length - 1];
      const topEl = overlayRegistry.get(topKey) ?? null;
      const target = topEl?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      target?.focus();
    }
  }

  watch(show, (open) => {
    if (open) {
      lastFocused = document.activeElement as HTMLElement | null;
      if (openStack.indexOf(instanceKey) === -1) {
        openStack.push(instanceKey);
        acquireScrollLock();
      }
      overlayRegistry.set(instanceKey, overlayEl.value);
      document.addEventListener('keydown', onKeydown);
      // Chuyển focus vào phần tử tương tác đầu tiên của modal.
      requestAnimationFrame(() => {
        const target = focusTarget?.value ?? overlayEl.value?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
        target?.focus();
      });
    } else {
      cleanup();
    }
  }, { immediate: true });

  onBeforeUnmount(() => {
    // CU-031: unmount khi modal vẫn mở → dọn listener + scroll-lock + hoàn trả focus.
    if (openStack.indexOf(instanceKey) !== -1) {
      cleanup();
    }
  });

  return { overlayEl };
}
