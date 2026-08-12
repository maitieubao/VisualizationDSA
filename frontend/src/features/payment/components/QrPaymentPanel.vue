<template>
  <div class="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">

    <!-- Cột QR + đếm ngược -->
    <div class="sm:col-span-5 flex flex-col items-center">
      <div class="qr-wrapper p-2 bg-white rounded-lg shadow-lg relative border border-border-strong">
        <!-- PM-044: alt tiếng Việt + fallback icon khi qrUrl rỗng -->
        <img
          v-if="order?.qrUrl"
          :src="order.qrUrl"
          alt="Mã thanh toán VietQR"
          class="w-40 h-40 object-contain"
        />
        <div
          v-else
          class="w-40 h-40 flex flex-col items-center justify-center gap-2 bg-bg-primary/40 rounded"
          aria-label="Mã QR chưa khả dụng"
        >
          <BaseIcon name="diamond" class="w-8 h-8 text-text-muted" />
          <span class="text-[11px] text-text-muted">Không có mã QR</span>
        </div>

        <!-- PM-028: khi hết hạn chỉ giữ overlay + nút tạo lại -->
        <div
          v-if="isExpired"
          class="absolute inset-0 bg-bg-primary/90 rounded-lg flex flex-col items-center justify-center p-2 text-center"
          role="alert"
        >
          <BaseIcon name="clock" class="w-6 h-6 text-accent-red mb-2" />
          <span class="text-xs font-semibold text-accent-red">Mã hết hạn</span>
          <button @click="$emit('retry')" class="mt-2 text-[11px] px-2 py-1 bg-accent text-white rounded hover:bg-accent-light transition">Thử lại</button>
        </div>
      </div>

      <!-- PM-046: khu đếm ngược có aria-live để thông báo cho screen reader -->
      <div class="mt-3 text-center" aria-live="polite">
        <div class="text-[11px] text-text-muted uppercase font-semibold">Thời gian còn lại</div>
        <div class="text-sm font-bold font-mono" :class="isWarningTime ? 'text-accent-red animate-pulse' : 'text-accent'">
          {{ formattedTime }}
        </div>
      </div>
    </div>

    <!-- PM-028: khi mã hết hạn ẩn toàn bộ số tài khoản + nút Copy + box tự kiểm tra -->
    <div v-if="!isExpired" class="sm:col-span-7 space-y-4">
      <div class="text-xs font-semibold uppercase tracking-wider text-accent">Hướng dẫn chuyển khoản</div>

      <div class="space-y-2 text-xs bg-bg-secondary/50 p-4 rounded-[var(--radius-lg)] border border-border-default">
        <div class="flex justify-between">
          <span class="text-text-muted">Ngân hàng:</span>
          <span class="font-bold text-text-primary">{{ order?.bankId }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-text-muted">Số tài khoản:</span>
          <span class="font-bold text-text-primary font-mono">{{ order?.bankAccount }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-text-muted">Chủ tài khoản:</span>
          <span class="font-bold text-text-primary">{{ order?.accountName }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-text-muted">Số tiền:</span>
          <!-- PM-047: order null hiển thị "—" thay vì "0 ₫" -->
          <span class="font-bold text-accent-yellow font-mono">{{ amountText }}</span>
        </div>

        <div class="border-t border-border-default pt-3 mt-3">
          <div class="text-[11px] text-text-muted uppercase mb-1 font-semibold">Nội dung chuyển khoản chính xác:</div>
          <div class="flex items-center justify-between gap-2 bg-bg-primary p-2 rounded border border-accent-yellow/30">
            <span class="font-mono text-sm font-extrabold text-accent-yellow tracking-wider">{{ order?.paymentCode }}</span>
            <!-- PM-046: aria-live tách sang span riêng, không đặt trên nút -->
            <span aria-live="polite" class="sr-only">{{ isCopied ? 'Đã copy mã thanh toán' : '' }}</span>
            <button @click="copyCode" class="text-[11px] px-2 py-1 bg-bg-surface hover:bg-bg-active rounded text-accent active:scale-95 transition">
              {{ isCopied ? 'Đã copy' : 'Copy' }}
            </button>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-3 bg-accent-green/10 border border-accent-green/20 p-3 rounded-[var(--radius-md)]">
        <BaseIcon name="refresh" class="animate-spin w-4 h-4 text-accent-green" />
        <p class="text-[11px] text-text-secondary leading-relaxed">
          Hệ thống đang kiểm tra tự động giao dịch. Tài khoản của bạn sẽ tự mở khóa ngay khi ngân hàng nhận tiền.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { formatVND } from '../../../utils/format';
import { useToastStore } from '../../../composables/useToast';

interface OrderInfo {
  qrUrl: string;
  bankId: string;
  bankAccount: string;
  accountName: string;
  amount: number;
  paymentCode: string;
}

const props = defineProps<{
  order: OrderInfo | null;
  formattedTime: string;
  isExpired: boolean;
  isWarningTime: boolean;
}>();

defineEmits<{
  (e: 'retry'): void;
}>();

const toast = useToastStore();
const isCopied = ref(false);
let copyResetTimer: ReturnType<typeof setTimeout> | null = null;

// PM-047: order null → "—" thay vì "0 ₫"
const amountText = computed(() => (props.order ? formatVND(props.order.amount) : '—'));

async function copyCode(): Promise<void> {
  if (!props.order) return;

  try {
    // Ưu tiên Clipboard API (cần context secure)
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(props.order.paymentCode);
    } else {
      throw new Error('CLIPBOARD_UNAVAILABLE');
    }
  } catch {
    // PM-045: fallback execCommand khi clipboard API không khả dụng
    if (!execCommandCopy(props.order.paymentCode)) {
      toast.error('Không thể sao chép. Vui lòng copy mã thanh toán thủ công.');
      return;
    }
  }

  isCopied.value = true;
  if (copyResetTimer !== null) clearTimeout(copyResetTimer);
  copyResetTimer = setTimeout(() => {
    isCopied.value = false;
  }, 2000);
}

/** Fallback copy qua document.execCommand cho context không secure. */
function execCommandCopy(text: string): boolean {
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    textarea.style.top = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}
</script>

<style scoped>
.qr-wrapper {
  background: white;
  padding: 8px;
  border-radius: var(--radius-lg);
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.05);
}
</style>
