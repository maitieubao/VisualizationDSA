<template>
  <!-- KHÔNG dùng allow-same-origin: kết hợp allow-scripts nó cho phép code người dùng
       đọc localStorage/cookie/parent.document ngang quyền trang chủ (XSS qua link chia sẻ).
       HT-023: bỏ allow-modals + allow-popups — chặn alert() vô hạn / window.open thoát tab ngoài. -->
  <iframe
    ref="iframeElement"
    class="w-full h-full border-0 bg-white"
    sandbox="allow-scripts allow-forms"
    referrerpolicy="no-referrer"
    :srcDoc="documentHtml"
    title="HTML Playground Preview"
    @load="emit('loaded')"
  ></iframe>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import type { PlaygroundRuntimeError } from '../types/playground.types';

defineProps<{
  documentHtml: string;
}>();

const emit = defineEmits<{
  (e: 'runtime-error', payload: PlaygroundRuntimeError): void;
  (e: 'loaded'): void;
}>();

const iframeElement = ref<HTMLIFrameElement | null>(null);

/** HT-003: nhận playground-error từ error bridge trong iframe rồi emit lên parent. */
function onWindowMessage(event: MessageEvent): void {
  const data = event.data;
  if (!data || typeof data !== 'object' || data.type !== 'playground-error') return;
  if (iframeElement.value && event.source !== iframeElement.value.contentWindow) return;
  emit('runtime-error', {
    message:
      typeof data.message === 'string' ? data.message : String(data.message ?? 'Lỗi không xác định'),
    source: typeof data.source === 'string' ? data.source : '',
    line: typeof data.line === 'number' ? data.line : 0,
    col: typeof data.col === 'number' ? data.col : 0,
  });
}

onMounted(() => {
  window.addEventListener('message', onWindowMessage);
});

onBeforeUnmount(() => {
  window.removeEventListener('message', onWindowMessage);
});
</script>
