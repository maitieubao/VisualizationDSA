<template>
  <svg
    class="w-6 h-6"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
  >
    <template v-if="type === 'LB'">
      <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
      <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
      <line x1="6" y1="6" x2="6.01" y2="6" />
      <line x1="6" y1="18" x2="6.01" y2="18" />
    </template>
    <template v-else-if="type === 'WEB'">
      <path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4" />
      <polyline points="14 2 14 8 20 8" />
    </template>
    <template v-else-if="type.includes('DB')">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5V19A9 3 0 0 0 12 22A9 3 0 0 0 21 19V5" />
    </template>
  </svg>
</template>

<script setup lang="ts">
defineProps<{
  type: string;
}>();
</script>
