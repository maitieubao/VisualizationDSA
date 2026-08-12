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
        
        <!-- Hiện spinner ngay khi chuyển bài — tránh blank flash giữa các bài (DC-020). -->
        <div v-else-if="loading" class="flex items-center justify-center py-20 text-text-muted">
          <div class="animate-spin mr-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-accent-primary">
              <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
              <path d="M12 2a10 10 0 0 1 10 10" stroke-opacity="1"></path>
            </svg>
          </div>
          Đang tải tài liệu...
        </div>
        
        <div v-else class="flex flex-col items-center justify-center py-20 text-center">
          <div class="w-24 h-24 mb-6 text-text-disabled">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-text-primary mb-2">Không tìm thấy nội dung</h2>
          <p class="text-text-secondary max-w-md">
            Tài liệu bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
          </p>
          <router-link to="/docs/intro/intro" class="mt-6 px-4 py-2 bg-accent-primary text-white rounded-md hover:bg-accent-secondary transition-colors">
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
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import DocsLayout from '../../features/docs/components/DocsLayout.vue';
import DocsMarkdownRenderer from '../../features/docs/components/DocsMarkdownRenderer.vue';
import DocsTableOfContents from '../../features/docs/components/DocsTableOfContents.vue';
import { docsNavigation, getNextPrevDocs } from '../../features/docs/data/docsNavigation';
import type { NavItem } from '../../features/docs/types/docs.types';

const route = useRoute();
const router = useRouter();
const currentDocRaw = ref('');
const loading = ref(true);
const headings = ref<{id: string; title: string; level: number}[]>([]);

// Generation counter chống race: chỉ áp dụng kết quả của lần load mới nhất (DC-015).
let loadSeq = 0;



const markdownFiles = import.meta.glob('../../features/docs/content/**/*.md', { query: '?raw', import: 'default' });

// Resolve topic-level (`/docs/<topic>`) về bài đầu TIÊN của đúng topic đó (DC-007).
// Trả về '' khi topic không tồn tại trong docsNavigation → caller redirect (DC-029).
const getFirstSectionOfTopic = (pathSegments: string[]): string => {
  const topic = pathSegments[0] ?? '';
  
  if (topic) {
    const group = docsNavigation.find((g: NavItem) =>
      (g.children ?? []).some(child => child.path?.startsWith(`/docs/${topic}/`))
    );
    const firstChild = group?.children?.find((c: NavItem) => c.path);
    if (firstChild?.path) return firstChild.path.replace('/docs/', '');
  }
  
  return '';
};


const loadMarkdown = async () => {
  const seq = ++loadSeq;
  loading.value = true;
  headings.value = []; 
  
  // Lọc segment rỗng: xử lý trailing slash `/docs/intro/intro/` (DC-012).
  let pathSegments = ((route.params.pathMatch as string[] | undefined) ?? []).filter(segment => segment !== '');
  
  
  if (pathSegments.length === 0) {
    // `/docs` (rỗng) → bài đầu toàn nav (intro/intro); route-level đã redirect nhưng giữ fallback an toàn.
    pathSegments = ['intro', 'intro'];
  } else if (pathSegments.length === 1) {
    const resolved = getFirstSectionOfTopic(pathSegments);
    if (!resolved) {
      // Slug topic không tồn tại (`/docs/search`, `/docs/doesnotexist`) → redirect thật về intro
      // thay vì hiện intro lặng lẽ với URL sai, sidebar không highlight (DC-029).
      router.replace('/docs/intro/intro');
      return;
    }
    pathSegments = resolved.split('/');
  }
  
  const subPath = pathSegments.join('/');
  const targetPath = `../../features/docs/content/${subPath}.md`;
  let raw = '';
  
  if (markdownFiles[targetPath]) {
    try {
      raw = await markdownFiles[targetPath]() as string;
    } catch (e) {
      console.error("Failed to load markdown file", e);
    }
  } else {
    console.warn(`[Docs] Không tìm thấy file nội dung: ${targetPath}`);
  }
  
  if (seq !== loadSeq) return;
  currentDocRaw.value = raw;
  loading.value = false;
};


const prevDoc = computed(() => getNextPrevDocs(route.path).prev);
const nextDoc = computed(() => getNextPrevDocs(route.path).next);

const onHeadingsParsed = (newHeadings: {id: string; title: string; level: number}[]) => {
  headings.value = newHeadings;
};

// DC-030: không phụ thuộc remount qua `:key="$route.fullPath"` ở App.vue — nếu gỡ key,
// điều hướng vẫn chạy nhờ watch route.path. Không dùng immediate để tránh double-load
// với onMounted (chỉ load khi path THAY ĐỔI).
watch(() => route.path, () => {
  loadMarkdown();
});

onMounted(() => {
  loadMarkdown();
});
</script>
