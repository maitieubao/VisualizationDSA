<template>
  <!-- KHÔNG dùng allow-same-origin: kết hợp allow-scripts nó cho phép code người dùng
       đọc localStorage/cookie/parent.document ngang quyền trang chủ (XSS qua link chia sẻ). -->
  <iframe
    class="w-full h-full border-0 bg-white"
    sandbox="allow-scripts allow-modals allow-forms allow-popups"
    :srcDoc="documentHtml"
    title="HTML Playground Preview"
  ></iframe>
</template>

<script setup lang="ts">
defineProps<{
  documentHtml: string;
}>();
</script>
