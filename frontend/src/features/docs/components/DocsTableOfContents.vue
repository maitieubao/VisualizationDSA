<template>
  <div ref="tocRoot" class="docs-toc hidden lg:block w-56 xl:w-64 flex-shrink-0 pt-2 sticky top-[88px] max-h-[calc(100vh-6rem)] overflow-y-auto pb-10">
    <div class="toc-container">
      <h4 class="text-[14px] font-bold text-text-primary mb-3">Nội dung bài viết</h4>
      <ul class="space-y-1">
        <li v-for="heading in headings" :key="heading.id" :class="heading.level === 3 ? 'pl-4' : ''">
          <a 
            :href="'#' + heading.id"
            class="block py-[4px] px-3 text-[13px] border-l-2 transition-colors leading-snug"
            :class="activeId === heading.id ? 'border-accent-primary text-text-primary font-medium bg-accent-primary/5' : 'border-transparent text-text-muted hover:text-text-primary hover:border-border-default'"
            :aria-current="activeId === heading.id ? 'true' : undefined"
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
const tocRoot = ref<HTMLElement | null>(null);

// Chỉ cuộn mượt, KHÔNG history.pushState — pushState phá vỡ hash router (DC-002).
const scrollTo = (id: string) => {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
    activeId.value = id;
  }
};

// Scroll container thật là `.app-view` (window không bao giờ scroll) (DC-003).
let scrollTarget: HTMLElement | Window | null = null;

const findScrollTarget = (): HTMLElement | Window | null => {
  let node = tocRoot.value;
  while (node && node !== document.body && node !== document.documentElement) {
    if (node.classList.contains('app-view')) return node;
    node = node.parentElement;
  }
  return window;
};

const onScroll = () => {
  if (!props.headings || props.headings.length === 0) return;
  
  let currentActive = '';
  
  // Đo trực tiếp qua getBoundingClientRect trên container thật — không phụ thuộc offsetTop ancestor.
  for (const heading of props.headings) {
    const section = document.getElementById(heading.id);
    if (!section) continue;
    if (section.getBoundingClientRect().top <= 100) {
      currentActive = heading.id;
    }
  }
  
  activeId.value = currentActive || (props.headings[0]?.id ?? '');
};

const attachScrollListener = () => {
  detachScrollListener();
  scrollTarget = findScrollTarget();
  if (scrollTarget) {
    scrollTarget.addEventListener('scroll', onScroll, { passive: true });
  }
};

const detachScrollListener = () => {
  if (scrollTarget) {
    scrollTarget.removeEventListener('scroll', onScroll);
    scrollTarget = null;
  }
};

// Headings đổi khi chuyển bài — tính lại highlight ngay (DC-003).
watch(() => props.headings, () => {
  onScroll();
});

onMounted(() => {
  attachScrollListener();
  // Đợi DOM heading render xong rồi mới đánh dấu mục đang xem.
  setTimeout(onScroll, 100);
});

onUnmounted(() => {
  detachScrollListener();
});
</script>
