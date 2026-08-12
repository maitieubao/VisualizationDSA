<template>
  <Transition name="modal-fade">
    <!-- CU-002: TC-028 pattern — role=dialog + aria-modal + focus trap + Esc + scroll-lock + restore focus (useModalA11y) -->
    <div v-if="show" ref="overlayEl" class="modal-overlay" role="dialog" aria-modal="true" :aria-labelledby="titleId" @click.self="$emit('update:show', false)">
      <div class="modal-container" :class="variantClass">
        <div class="modal-header" :class="variantClass">
          <h3 class="modal-title" :id="titleId">
            <BaseIcon :name="icon" class="w-5 h-5 inline mr-2" />
            {{ title }}
          </h3>
          <button type="button" class="modal-close" aria-label="Đóng hộp thoại" @click="$emit('update:show', false)">
            <BaseIcon name="x" class="w-5 h-5" />
          </button>
        </div>
        
        <div class="modal-body">
          <p class="modal-message">{{ message }}</p>
          
          <div v-if="details" class="modal-details">
            {{ details }}
          </div>
        </div>
        
        <div class="modal-footer">
          <button 
            type="button" 
            class="btn-secondary" 
            @click="$emit('update:show', false)"
            :disabled="loading"
          >
            {{ cancelText }}
          </button>
          <button 
            type="button" 
            :class="['btn-primary', variantClass]"
            @click="handleConfirm"
            :disabled="loading"
          >
            <span v-if="loading" class="flex items-center gap-2">
              <span class="spinner-sm"></span>
              Đang xử lý...
            </span>
            <span v-else>{{ confirmText }}</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, toRef, getCurrentInstance } from 'vue';
import BaseIcon from '@/shared/components/BaseIcon.vue';
import { useModalA11y } from '@/composables/useModalA11y';

interface Props {
  show: boolean;
  title: string;
  message: string;
  details?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary' | 'warning';
  icon?: string;
  // CU-018: handler trả promise — modal chờ await xong mới tắt loading (spinner hiển thị thật).
  confirmHandler?: () => Promise<void> | void;
}

interface Emits {
  (e: 'update:show', value: boolean): void;
  (e: 'confirm'): void;
}

const props = withDefaults(defineProps<Props>(), {
  confirmText: 'Xác nhận',
  cancelText: 'Hủy',
  variant: 'primary',
  icon: 'alert-circle'
});

const emit = defineEmits<Emits>();
const loading = ref(false);
const instance = getCurrentInstance();

// CU-002: Esc + focus trap + khóa scroll + hoàn trả focus (pattern TC-028 chung).
const { overlayEl } = useModalA11y(toRef(props, 'show'));

// aria-labelledby trỏ tới tiêu đề — id duy nhất theo instance.
let confirmModalTitleId = 0;
const titleId = `confirm-modal-title-${++confirmModalTitleId}`;

const variantClass = computed(() => {
  switch (props.variant) {
    case 'danger': return 'btn-danger';
    case 'warning': return 'btn-warning';
    default: return '';
  }
});

async function handleConfirm() {
  loading.value = true;
  try {
    // CU-018: handler trả promise → chờ await xong mới reset loading (spinner hiển thị thật).
    // Vue 3 không expose listener của emit declared trong $attrs — đọc trực tiếp từ vnode.props.
    // Thứ tự: prop confirmHandler → listener @confirm (vnode.props.onConfirm) → emit('confirm').
    const vnodeProps = instance?.vnode.props as Record<string, unknown> | undefined;
    const handler = props.confirmHandler ?? vnodeProps?.onConfirm;
    if (typeof handler === 'function') {
      const result = handler();
      if (result instanceof Promise) {
        await result;
      }
    } else {
      emit('confirm');
    }
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
@import "./ConfirmModal.css";
</style>