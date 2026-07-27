<template>
  <div class="docs-toc hidden xl:block w-56 flex-shrink-0 pt-10 sticky top-16 max-h-[calc(100vh-4rem)] overflow-y-auto">
    <div class="toc-container pl-4 border-l border-border-color">
      <h4 class="text-sm font-bold text-text-primary mb-4 uppercase tracking-wider">Trên trang này</h4>
      <ul class="space-y-2 text-sm">
        <li v-for="heading in headings" :key="heading.id" :class="heading.level === 3 ? 'ml-3' : ''">
          <a 
            :href="'#' + heading.id"
            class="block py-1 transition-colors"
            :class="activeId === heading.id ? 'text-accent-primary font-medium' : 'text-text-muted hover:text-text-primary'"
            @click.prevent="scrollTo(heading.id)"
          >
            {{ heading.title }}
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';

const props = defineProps<{
  headings: {id: string; title: string; level: number}[];
}>();

const activeId = ref<string>('');

const scrollTo = (id: string) => {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
    activeId.value = id;
    history.pushState(null, '', `#${id}`);
  }
};

const onScroll = () => {
  if (!props.headings || props.headings.length === 0) return;
  
  const sections = props.headings.map(h => document.getElementById(h.id)).filter(Boolean) as HTMLElement[];
  if (sections.length === 0) return;

  
  let currentActive = sections[0].id;
  const scrollPosition = window.scrollY + 100; // offset for header

  for (const section of sections) {
    if (section.offsetTop <= scrollPosition) {
      currentActive = section.id;
    }
  }
  
  activeId.value = currentActive;
};

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true });
  // Set initial active
  setTimeout(onScroll, 100);
});

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll);
});
</script>
