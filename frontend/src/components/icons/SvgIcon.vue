<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    :stroke="color"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="svg-icon"
    :class="iconClass"
    v-html="pathData"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  name: string;
  size?: number | string;
  color?: string;
  filled?: boolean;
}>(), {
  size: 16,
  color: 'currentColor',
  filled: false,
});

const iconClass = computed(() => `icon-${props.name}`);

import { SVG_PATHS } from '../../utils/emojiParser';

const icons: Record<string, string> = SVG_PATHS;

const pathData = computed(() => icons[props.name] ?? icons['x-circle']);
</script>

<style scoped>
.svg-icon {
  display: inline-block;
  vertical-align: middle;
  flex-shrink: 0;
}
</style>
