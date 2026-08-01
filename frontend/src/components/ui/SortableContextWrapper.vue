<template>
  <slot />
</template>

<script setup lang="ts">
defineProps<{
  items: Array<string | number>;
}>();
</script>
