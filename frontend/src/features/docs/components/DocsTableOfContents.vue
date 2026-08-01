<template>
  <div class="docs-toc hidden lg:block w-56 xl:w-64 flex-shrink-0 pt-2 sticky top-[88px] max-h-[calc(100vh-6rem)] overflow-y-auto pb-10">
    <div class="toc-container">
      <h4 class="text-[14px] font-bold text-text-primary mb-3">Nội dung bài viết</h4>
      <ul class="space-y-1">
        <li v-for="heading in headings" :key="heading.id" :class="heading.level === 3 ? 'pl-4' : ''">
          <a 
            :href="'#' + heading.id"
            class="block py-[4px] px-3 text-[13px] border-l-2 transition-colors leading-snug"
            :class="activeId === heading.id ? 'border-accent-primary text-text-primary font-medium bg-accent-primary/5' : 'border-transparent text-text-muted hover:text-text-primary hover:border-border-default'"
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
  const scrollPosition = window.scrollY + 100; 

  for (const section of sections) {
    if (section.offsetTop <= scrollPosition) {
      currentActive = section.id;
    }
  }
  
  activeId.value = currentActive;
};

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true });
  
  setTimeout(onScroll, 100);
});

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll);
});
</script>
