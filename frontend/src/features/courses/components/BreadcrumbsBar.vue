<template>
  <nav class="breadcrumbs-bar flex items-center gap-1.5 text-xs text-text-muted overflow-x-auto whitespace-nowrap" aria-label="Breadcrumb">
    <template v-for="(crumb, idx) in items" :key="idx">
      <!-- Crumb cuối là vị trí hiện tại: <span> + aria-current thay router-link (LM-062). -->
      <span
        v-if="idx === items.length - 1"
        class="flex items-center gap-1.5 shrink-0 text-text-primary font-semibold"
        aria-current="page"
      >
        <BaseIcon v-if="idx === 0" name="home" class="w-3 h-3" />
        <span>{{ crumb.label }}</span>
      </span>
      <router-link
        v-else
        :to="crumb.path"
        class="flex items-center gap-1.5 shrink-0 transition-colors text-text-muted hover:text-text-secondary"
      >
        <BaseIcon v-if="idx === 0" name="home" class="w-3 h-3" />
        <span>{{ crumb.label }}</span>
      </router-link>
      <BaseIcon
        v-if="idx < items.length - 1"
        name="chevron-right"
        class="w-3 h-3 text-text-disabled shrink-0"
      />
    </template>
  </nav>
</template>

<script setup lang="ts">
defineProps<{
  items: Array<{ label: string; path: string }>;
}>();
</script>

<style scoped>
.breadcrumbs-bar::-webkit-scrollbar { display: none; }
</style>
