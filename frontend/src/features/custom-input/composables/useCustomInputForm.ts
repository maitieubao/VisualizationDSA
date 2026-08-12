import { ref, computed, watch, onMounted, onBeforeUnmount, type Ref } from 'vue';
import { useInputStore } from '../store/useInputStore';
import type { GenerationType } from '../store/useInputStore';

export function useCustomInputForm(algorithmId: Ref<string>) {
  const inputStore = useInputStore();
  const showDropdown = ref(false);
  const dropdownRef = ref<HTMLElement | null>(null);

  // AL-031: nối limit theo algorithmId ngay khi mount + mỗi lần đổi thuật toán
  watch(algorithmId, (id) => inputStore.setAlgorithmLimit(id), { immediate: true });

  const generationOptions: { type: GenerationType; label: string }[] = [
    { type: 'random',        label: 'Ngẫu nhiên hoàn toàn (Random 100%)' },
    { type: 'nearly-sorted', label: 'Gần như đã sắp xếp (Nearly Sorted)' },
    { type: 'reversed',      label: 'Đảo ngược hoàn toàn (Reversed 100%)' },
  ];

  const formState = computed<'empty' | 'valid' | 'format-error' | 'limit-error'>(() => {
    if (inputStore.rawText.trim() === '') return 'empty';
    if (!inputStore.isValidFormat) return 'format-error';
    if (!inputStore.isWithinLimit) return 'limit-error';
    return 'valid';
  });

  const textareaClasses = computed(() => {
    const base = 'bg-bg-terminal border';
    switch (formState.value) {
      case 'valid':         return `${base} border-accent-green shadow-[0_0_10px_rgba(16,185,129,0.2)]`;
      case 'format-error':  return `${base} border-accent-red shadow-[0_0_10px_rgba(239,68,68,0.3)]`;
      case 'limit-error':   return `${base} border-accent-yellow shadow-[0_0_10px_rgba(245,158,11,0.3)]`;
      default: return `${base} border-border-default`;
    }
  });

  const counterClasses = computed(() =>
    !inputStore.isWithinLimit ? 'text-accent-yellow font-bold' : 'text-text-muted'
  );

  const statusText = computed<string>(() => {
    const map: Record<string, string> = { valid: 'Hợp lệ', 'format-error': 'Lỗi cú pháp', 'limit-error': 'Vượt giới hạn' };
    return map[formState.value] ?? '';
  });

  const statusClasses = computed(() => {
    const map: Record<string, string> = { valid: 'text-accent-green', 'format-error': 'text-accent-red', 'limit-error': 'text-accent-yellow' };
    return map[formState.value] ?? 'text-text-muted';
  });

  const errorText = computed<string>(() => {
    if (formState.value === 'format-error') return 'Lỗi: Chỉ cho phép số nguyên cách nhau bằng dấu phẩy.';
    if (formState.value === 'limit-error') return `Cảnh báo: Kích thước mảng vượt quá giới hạn an toàn (Tối đa ${inputStore.maxLimit} phần tử).`;
    return '';
  });

  const executeButtonClasses = computed(() =>
    !inputStore.canExecute
      ? 'bg-bg-active text-text-muted cursor-not-allowed'
      : 'bg-accent text-text-primary hover:bg-accent-light active:scale-95 cursor-pointer'
  );

  // AL-041: cập nhật text qua action của store (thay v-model mutation trực tiếp)
  function onRawInput(event: Event): void {
    inputStore.setRawText((event.target as HTMLTextAreaElement).value);
  }

  function onGenerate(type: GenerationType): void {
    inputStore.generateRandomInput(type, 10);
    showDropdown.value = false;
  }

  function onExecute(): void {
    inputStore.submitCustomInput(algorithmId.value);
  }

  function onKeydown(e: KeyboardEvent): void {
    if (e.ctrlKey && e.key === 'Enter') { e.preventDefault(); if (inputStore.canExecute) onExecute(); }
    // AL-016: Ctrl+Shift+R là tổ hợp trình duyệt (không chặn được) → Ctrl+Alt+R
    if (e.ctrlKey && e.altKey && (e.key === 'R' || e.key === 'r')) { e.preventDefault(); inputStore.generateRandomInput('random', 10); }
    // AL-015: Esc khi dropdown mở → chỉ đóng dropdown, không clear textarea mất dữ liệu
    if (e.key === 'Escape') {
      e.preventDefault();
      if (showDropdown.value) {
        showDropdown.value = false;
      } else {
        inputStore.clear();
      }
    }
  }

  function onClickOutside(e: MouseEvent): void {
    if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) showDropdown.value = false;
  }

  onMounted(() => document.addEventListener('click', onClickOutside));
  onBeforeUnmount(() => document.removeEventListener('click', onClickOutside));

  return {
    inputStore, showDropdown, dropdownRef, generationOptions,
    formState, textareaClasses, counterClasses, statusText, statusClasses, errorText, executeButtonClasses,
    onRawInput, onGenerate, onExecute, onKeydown,
  };
}
