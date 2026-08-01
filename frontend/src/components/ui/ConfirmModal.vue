<template>
  <Transition name="modal-fade">
    <div v-if="show" class="modal-overlay" @click.self="$emit('update:show', false)">
      <div class="modal-container" :class="variantClass">
        <div class="modal-header" :class="variantClass">
          <h3 class="modal-title">
            <BaseIcon :name="icon" class="w-5 h-5 inline mr-2" />
            {{ title }}
          </h3>
          <button type="button" class="modal-close" @click="$emit('update:show', false)">
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
              Äang xá»­ lÃ½...
            </span>
            <span v-else>{{ confirmText }}</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import BaseIcon from '@/shared/components/BaseIcon.vue';

interface Props {
  show: boolean;
  title: string;
  message: string;
  details?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary' | 'warning';
  icon?: string;
}

interface Emits {
  (e: 'update:show', value: boolean): void;
  (e: 'confirm'): void;
}

const props = withDefaults(defineProps<Props>(), {
  confirmText: 'XÃ¡c nháº­n',
  cancelText: 'Há»§y',
  variant: 'primary',
  icon: 'alert-circle'
});

const emit = defineEmits<Emits>();
const loading = ref(false);

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
    emit('confirm');
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
@import "./ConfirmModal.css";
</style>