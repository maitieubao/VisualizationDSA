<template>
  <div class="h-full bg-bg-base overflow-hidden">
    <DocsLayout>
      <template #default>
        <DocsMarkdownRenderer 
          v-if="currentDocRaw" 
          :raw-markdown="currentDocRaw" 
          :prev-doc="prevDoc"
          :next-doc="nextDoc"
          @headings-parsed="onHeadingsParsed"
        />
        
        
        <div v-else-if="!loading" class="flex flex-col items-center justify-center py-20 text-center">
          <div class="w-24 h-24 mb-6 text-gray-600">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-text-primary mb-2">Không tìm thấy nội dung</h2>
          <p class="text-text-secondary max-w-md">
            Tài liệu bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
          </p>
          <router-link to="/docs/intro" class="mt-6 px-4 py-2 bg-accent-primary text-white rounded-md hover:bg-accent-secondary transition-colors">
            Quay lại trang chính
          </router-link>
        </div>
      </template>

      
      <template #toc v-if="currentDocRaw && headings.length > 0">
        <DocsTableOfContents :headings="headings" />
      </template>
    </DocsLayout>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import DocsLayout from '../../features/docs/components/DocsLayout.vue';
import DocsMarkdownRenderer from '../../features/docs/components/DocsMarkdownRenderer.vue';
import DocsTableOfContents from '../../features/docs/components/DocsTableOfContents.vue';
import { docsNavigation, getNextPrevDocs } from '../../features/docs/data/docsNavigation';

const route = useRoute();
const currentDocRaw = ref('');
const loading = ref(true);
const headings = ref<{id: string; title: string; level: number}[]>([]);



const markdownFiles = import.meta.glob('../../features/docs/content/**/*.md', { query: '?raw', import: 'default' });

const getFirstSectionOfTopic = (pathSegments: string[]) => {
  
  let firstValidPath = '/docs/intro/intro'; 
  
  
  const findFirstPath = (items: any[]): string | null => {
    for (const item of items) {
      if (item.path) return item.path;
      if (item.children) {
        const childPath = findFirstPath(item.children);
        if (childPath) return childPath;
      }
    }
    return null;
  };

  const foundPath = findFirstPath(docsNavigation);
  if (foundPath) {
    firstValidPath = foundPath;
  }
  
  
  return firstValidPath.replace('/docs/', ''); 
};


const loadMarkdown = async () => {
  loading.value = true;
  headings.value = []; 
  
  let pathSegments = route.params.pathMatch as string[];
  
  
  if (!pathSegments || pathSegments.length === 0 || pathSegments[0] === '') {
    const defaultPath = getFirstSectionOfTopic([]);
    pathSegments = defaultPath.split('/');
  }
  
  const subPath = pathSegments.join('/');
  const targetPath = `../../features/docs/content/${subPath}.md`;
  
  if (markdownFiles[targetPath]) {
    try {
      const raw = await markdownFiles[targetPath]();
      currentDocRaw.value = typeof raw === 'object' && raw !== null && 'default' in raw ? (raw as any).default : raw as string;
    } catch (e) {
      console.error("Failed to load markdown file", e);
      currentDocRaw.value = '';
    }
  } else {
    
    console.warn(`[Docs] Not found in markdownFiles. targetPath: ${targetPath}`);
    console.warn("[Docs] Available keys:", Object.keys(markdownFiles));
    currentDocRaw.value = '';
  }
  loading.value = false;
};


const prevDoc = computed(() => getNextPrevDocs(route.path).prev);
const nextDoc = computed(() => getNextPrevDocs(route.path).next);

const onHeadingsParsed = (newHeadings: {id: string; title: string; level: number}[]) => {
  headings.value = newHeadings;
};

watch(() => route.path, () => {
  if (route.name === 'docs') {
    loadMarkdown();
  }
});

onMounted(() => {
  loadMarkdown();
});
</script>
