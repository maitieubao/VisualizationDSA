<template>
  <div class="text-center">
    <div class="w-16 h-16 mx-auto mb-6 bg-accent-cyan/10 border border-accent-cyan/30 rounded-full flex items-center justify-center shadow-[0_0_15px_var(--color-cyan-glow)] animate-pulse">
      <BaseIcon name="zap" class="w-7 h-7 text-accent" />
    </div>
    <h3 class="text-xl font-bold mb-3">Sẵn sàng nâng cấp Premium?</h3>
    <p class="text-sm text-[var(--text-secondary)] max-w-md mx-auto mb-8">
      Hệ thống thanh toán tự động qua cổng ngân hàng SE Pay sẽ quét và kích hoạt tài khoản VIP của bạn ngay lập tức khi tiền về tài khoản.
    </p>
    <button
      @click="$emit('start')"
      :disabled="isLoading"
      class="px-8 py-3 rounded-[var(--radius-lg)] bg-gradient-to-r from-accent-cyan to-accent-purple hover:from-accent-cyan hover:to-accent-purple text-white font-semibold transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]"
    >
      <span v-if="isLoading" class="flex items-center justify-center gap-2">
        <BaseIcon name="spinner" class="w-4 h-4 animate-spin" /> Đang tạo hóa đơn...
      </span>
      <span v-else>Bắt đầu Thanh toán (VietQR)</span>
    </button>
    <!-- PM-027: map lỗi raw (HTTP 500...) → tiếng Việt thân thiện -->
    <div v-if="friendlyError" class="mt-4 text-xs text-accent-red font-medium flex items-center justify-center gap-1" role="alert">
      <BaseIcon name="warning" class="w-3.5 h-3.5" />
      {{ friendlyError }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getErrorMessage } from '../../../utils/format';

const props = defineProps<{ isLoading: boolean; error: string | null }>();
defineEmits<{ start: [] }>();

const friendlyError = computed(() => getErrorMessage(props.error));
</script>
