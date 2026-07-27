<template>
  <div class="docs-markdown-renderer pb-20">
    <div v-if="loading" class="flex items-center justify-center py-20 text-text-muted">
      <div class="animate-spin mr-3">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-accent-primary">
          <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
          <path d="M12 2a10 10 0 0 1 10 10" stroke-opacity="1"></path>
        </svg>
      </div>
      Đang tải tài liệu...
    </div>
    
    <div v-else class="docs-content max-w-3xl w-full mx-auto">
      <div class="docs-header mb-10">
        <h1 class="text-3xl font-bold text-text-primary mb-4">{{ title }}</h1>
        <p v-if="description" class="text-lg text-text-secondary leading-relaxed">{{ description }}</p>
      </div>

      <div class="vue-docs-theme" v-html="htmlContent" ref="markdownContainer"></div>
      
      <!-- Prev/Next Navigation -->
      <div class="docs-footer mt-16 pt-8 border-t border-border-color flex justify-between">
        <router-link v-if="prevDoc" :to="prevDoc.path" class="nav-link prev group flex flex-col items-start">
          <span class="text-xs text-text-muted mb-1 flex items-center group-hover:text-accent-primary transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-1"><polyline points="15 18 9 12 15 6"></polyline></svg>
            Bài trước
          </span>
          <span class="text-accent-primary font-medium">{{ prevDoc.title }}</span>
        </router-link>
        <div v-else></div>

        <router-link v-if="nextDoc" :to="nextDoc.path" class="nav-link next group flex flex-col items-end text-right">
          <span class="text-xs text-text-muted mb-1 flex items-center group-hover:text-accent-primary transition-colors">
            Bài tiếp theo
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="ml-1"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </span>
          <span class="text-accent-primary font-medium">{{ nextDoc.title }}</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue';
import { marked } from 'marked';
import { createHighlighter } from 'shiki';
import '../styles/vue-docs-theme.css';

const props = defineProps<{
  rawMarkdown: string;
  prevDoc?: { title: string; path: string } | null;
  nextDoc?: { title: string; path: string } | null;
}>();

const emit = defineEmits<{
  (e: 'headings-parsed', headings: { id: string; title: string; level: number }[]): void;
}>();

const title = ref('');
const description = ref('');
const htmlContent = ref('');
const loading = ref(true);
const markdownContainer = ref<HTMLElement | null>(null);

let highlighter: any = null;

const parseFrontmatter = (raw: string) => {
  const fmRegex = /^---\n([\s\S]*?)\n---\n/;
  const match = raw.match(fmRegex);
  
  if (match) {
    const yaml = match[1];
    const titleMatch = yaml.match(/title:\s*"?([^"\n]+)"?/);
    const descMatch = yaml.match(/description:\s*"?([^"\n]+)"?/);
    
    title.value = titleMatch ? titleMatch[1].trim() : 'Tài liệu';
    description.value = descMatch ? descMatch[1].trim() : '';
    
    return raw.replace(fmRegex, ''); // Trả về content đã bỏ frontmatter
  }
  
  title.value = 'Tài liệu';
  description.value = '';
  return raw;
};

const extractHeadings = (html: string) => {
  const headings: { id: string; title: string; level: number }[] = [];
  
  // Parse H2 and H3 for Table of Contents
  const regex = /<h([23])[^>]*id="([^"]+)"[^>]*>(.*?)<\/h\1>/g;
  let match;
  
  while ((match = regex.exec(html)) !== null) {
    // Remove potential inner HTML tags from title
    const cleanTitle = match[3].replace(/<[^>]*>?/gm, '').trim();
    headings.push({
      level: parseInt(match[1]),
      id: match[2],
      title: cleanTitle
    });
  }
  
  emit('headings-parsed', headings);
};

const renderMarkdown = async () => {
  loading.value = true;
  try {
    if (!highlighter) {
      highlighter = await createHighlighter({
        themes: ['vitesse-dark'],
        langs: ['csharp', 'json', 'typescript', 'bash', 'javascript', 'html', 'css']
      });
    }

    const contentWithoutFm = parseFrontmatter(props.rawMarkdown);
    
    const renderer = new marked.Renderer();
    const originalParagraph = renderer.paragraph.bind(renderer);
    
    // Custom Heading with Anchor
    renderer.heading = function(token: any) {
      let text = token.text;
      const level = token.depth;
      
      // Bỏ qua thẻ H1 vì template đã render title từ frontmatter
      if (level === 1) return '';
      
      let id = '';
      const customIdMatch = text.match(/\{#([^}]+)\}/);
      if (customIdMatch) {
        id = customIdMatch[1];
        text = text.replace(/\{#([^}]+)\}/, '').trim();
      } else {
        const raw = token.raw || text;
        id = raw
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '');
      }
        
      return `<h${level} id="${id}" class="group relative">
        <a href="#${id}" class="header-anchor float-left -ml-8 pr-3 opacity-0 group-hover:opacity-100 transition-opacity text-accent-primary select-none font-normal">#</a>
        ${text}
      </h${level}>\n`;
    };

    // Code Highlighting
    renderer.code = function(token: any) {
      const code = token.text;
      const validLang = token.lang || 'text';
      
      if (validLang === 'mermaid') {
        // Encode mermaid code vào data attribute để tránh bị trình duyệt parse ký tự < thành HTML tag
        const encoded = encodeURIComponent(code);
        return `<div class="mermaid-diagram flex justify-center my-6" data-mermaid-code="${encoded}"><div style="color:#888;font-size:14px;">⏳ Đang vẽ biểu đồ...</div></div>`;
      }
      
      try {
        const highlighted = highlighter.codeToHtml(code, {
          lang: validLang,
          theme: 'vitesse-dark'
        });
        
        return `<div class="language-${validLang} relative group">
          <span class="lang text-xs text-gray-500 absolute top-2 right-4 uppercase font-mono z-10">${validLang}</span>
          <button class="copy-code-btn absolute top-2 right-12 z-10 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-white" onclick="navigator.clipboard.writeText(decodeURIComponent('${encodeURIComponent(code)}'))">Copy</button>
          ${highlighted}
        </div>`;
      } catch (e) {
        return `<pre><code>${code}</code></pre>`;
      }
    };

    // Alert blocks
    renderer.blockquote = function(token: any) {
      const text = token.text;
      const typeMatch = text.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i);
      
      if (!typeMatch) {
        return `<blockquote>\n${text}\n</blockquote>\n`;
      }
      
      const type = typeMatch[1].toLowerCase();
      const content = text.replace(/^\[!.*?\]\n?/, '');
      
      const titleMap: Record<string, string> = {
        'note': 'Ghi chú',
        'tip': 'Mẹo',
        'important': 'Quan trọng',
        'warning': 'Cảnh báo',
        'caution': 'Chú ý'
      };
      
      const titleMatch = text.match(/^\[!.*?\] (.*?)\n/);
      const title = titleMatch ? titleMatch[1] : titleMap[type];
      const displayTitle = title?.trim() || titleMap[type];
      const innerHtml = marked.parse(content);
      
      return `<div class="custom-block ${type}">\n<p class="custom-block-title">${displayTitle}</p>\n${innerHtml}\n</div>`;
    };

    marked.use({ renderer, gfm: true, breaks: true });

    const parsedHtml = marked.parse(contentWithoutFm);
    htmlContent.value = typeof parsedHtml === 'string' ? parsedHtml : await parsedHtml;
    loading.value = false; // PHẢI đặt trước nextTick để markdownContainer xuất hiện trong DOM
    
    await nextTick(); // Đợi DOM cập nhật xong (markdownContainer giờ đã tồn tại)
    
    extractHeadings(htmlContent.value);
    
    if (!markdownContainer.value) return;
    const diagrams = markdownContainer.value.querySelectorAll('.mermaid-diagram');
    if (diagrams.length === 0) return;
    
    try {
      const { default: mermaid } = await import(/* @vite-ignore */ '/node_modules/mermaid/dist/mermaid.esm.min.mjs');
      mermaid.initialize({
        startOnLoad: false,
        theme: 'base',
        themeVariables: {
          // Nền tối sâu
          darkMode: true,
          background: 'transparent',
          primaryColor: '#0c1929',
          primaryTextColor: '#c8d6e5',
          primaryBorderColor: '#2563eb',
          
          // Node phụ
          secondaryColor: '#0a1628',
          secondaryTextColor: '#a0b4c8',
          secondaryBorderColor: '#3b82f6',
          tertiaryColor: '#081422',
          tertiaryTextColor: '#8899aa',
          tertiaryBorderColor: '#6366f1',

          // Đường nối & nhãn
          lineColor: '#4a90d9',
          textColor: '#c8d6e5',

          // Class Diagram
          classText: '#c8d6e5',
          
          // Flowchart
          nodeBorder: '#2563eb',
          clusterBkg: '#060d18',
          clusterBorder: '#1e3a5f',
          
          // Font
          fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
          fontSize: '13px',
          
          // Note
          noteBkgColor: '#0d1b2a',
          noteTextColor: '#8899aa',
          noteBorderColor: '#1e3a5f',
        },
      });
      
      for (let i = 0; i < diagrams.length; i++) {
        const el = diagrams[i] as HTMLElement;
        const encoded = el.getAttribute('data-mermaid-code');
        if (!encoded) continue;
        
        const code = decodeURIComponent(encoded);
        try {
          const { svg } = await mermaid.render(`mermaid-svg-${Date.now()}-${i}`, code);
          el.innerHTML = svg;
        } catch (renderErr: any) {
          el.innerHTML = `<div style="background:rgba(200,50,50,0.15);border:1px solid #c53030;padding:16px;border-radius:8px;color:#fc8181;font-size:13px;text-align:left;width:100%;">
            <strong>⚠️ Lỗi cú pháp Mermaid:</strong><br/>
            <pre style="margin-top:8px;font-size:11px;overflow-x:auto;">${renderErr?.message || renderErr}</pre>
          </div>`;
        }
      }
    } catch (err: any) {
      console.error("Lỗi tải Mermaid:", err);
      diagrams.forEach(el => {
        el.innerHTML = `<div style="color:#fc8181;">❌ Không thể tải thư viện Mermaid: ${err?.message || err}</div>`;
      });
    }
  } catch (error) {
    console.error("Lỗi khi render markdown:", error);
    htmlContent.value = `<div class="text-red-500">Lỗi khi phân giải tài liệu: ${error}</div>`;
    loading.value = false;
  }
};

watch(() => props.rawMarkdown, () => {
  renderMarkdown();
});

onMounted(() => {
  renderMarkdown();
});
</script>
