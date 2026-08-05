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
      
      
      <div class="docs-footer mt-16 pt-8 border-t border-border-color flex justify-between">
        <router-link v-if="prevDoc" :to="prevDoc.path" class="nav-link prev group flex flex-col items-start">
          <span class="text-xs text-text-muted mb-1 flex items-center group-hover:text-accent-primary transition-colors">
            <BaseIcon name="chevron-left" class="w-3.5 h-3.5 mr-1" />
            Bài trước
          </span>
          <span class="text-accent-primary font-medium">{{ prevDoc.title }}</span>
        </router-link>
        <div v-else></div>

        <router-link v-if="nextDoc" :to="nextDoc.path" class="nav-link next group flex flex-col items-end text-right">
          <span class="text-xs text-text-muted mb-1 flex items-center group-hover:text-accent-primary transition-colors">
            Bài tiếp theo
            <BaseIcon name="chevron-right" class="w-3.5 h-3.5 ml-1" />
          </span>
          <span class="text-accent-primary font-medium">{{ nextDoc.title }}</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { marked, type Tokens } from 'marked';
import { createHighlighter, type Highlighter } from 'shiki';
import BaseIcon from '@/shared/components/BaseIcon.vue';
import { parseEmojiToSvg } from '../../../utils/emojiParser';
import { buildMermaidInitConfig } from '../../../utils/mermaidTheme';
import { getPlaygroundDemo } from '../../html-playground/demos/playgroundDemos';
import '../styles/vue-docs-theme.css';

const props = defineProps<{
  rawMarkdown: string;
  prevDoc?: { title: string; path: string } | null;
  nextDoc?: { title: string; path: string } | null;
}>();

const emit = defineEmits<{
  (e: 'headings-parsed', headings: { id: string; title: string; level: number }[]): void;
}>();

const router = useRouter();

const title = ref('');
const description = ref('');
const htmlContent = ref('');
const loading = ref(true);
const markdownContainer = ref<HTMLElement | null>(null);

let highlighter: Highlighter | null = null;
let containerListenersAttached = false;

const errorMessage = (error: unknown): string => error instanceof Error ? error.message : String(error);

const ensureContainerListeners = () => {
  if (containerListenersAttached || !markdownContainer.value) return;
  containerListenersAttached = true;
  markdownContainer.value.addEventListener('click', handleContainerClick);
  markdownContainer.value.addEventListener('change', handleContainerChange);
};

const handleContainerClick = (event: Event) => {
  const target = (event.target as HTMLElement).closest('a.playground-demo-link');
  if (target) {
    event.preventDefault();
    const url = target.getAttribute('data-playground-url') || target.getAttribute('href');
    if (url) {
      const [, query] = url.split('?');
      const params = new URLSearchParams(query || '');
      const demo = params.get('demo');
      router.push({ path: '/playground', query: demo ? { demo } : {} });
    }
    return;
  }

  // Copy code: đọc từ data-attribute (an toàn với mọi ký tự, kể cả dấu nháy đơn trong C#).
  const copyBtn = (event.target as HTMLElement).closest('button.copy-code-btn') as HTMLElement | null;
  if (copyBtn) {
    const encoded = copyBtn.getAttribute('data-copy-code');
    if (encoded) {
      navigator.clipboard.writeText(decodeURIComponent(encoded)).catch(() => {});
    }
  }
};

const handleContainerChange = (event: Event) => {
  const select = event.target as HTMLSelectElement;
  if (!select.classList.contains('dual-code-select')) return;
  const block = select.closest('.dual-code-block');
  if (!block) return;
  const jsPane = block.querySelector('.dual-code-pane-js') as HTMLElement | null;
  const csPane = block.querySelector('.dual-code-pane-cs') as HTMLElement | null;
  const isCs = select.value === 'cs';
  if (jsPane) jsPane.style.display = isCs ? 'none' : '';
  if (csPane) csPane.style.display = isCs ? '' : 'none';
};


const preprocessMarkdown = (raw: string) => {
  let content = raw;
  
  
  const fmRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/;
  const match = content.match(fmRegex);
  
  if (match) {
    const yaml = match[1];
    const titleMatch = yaml.match(/title:\s*"?([^"\n\r]+)"?/);
    const descMatch = yaml.match(/description:\s*"?([^"\n\r]+)"?/);
    
    title.value = titleMatch ? titleMatch[1].trim() : 'Tài liệu';
    description.value = descMatch ? descMatch[1].trim() : '';
    
    content = content.replace(fmRegex, ''); 
  } else {
    title.value = 'Tài liệu';
    description.value = '';
  }

  
  content = content.replace(/^:::(\w+)(.*?)\r?\n([\s\S]*?)\r?\n:::/gm, (fullMatch, type, titleRaw, innerContent) => {
    let ghType = 'NOTE';
    const t = type.toLowerCase();
    if (t === 'warning') ghType = 'WARNING';
    else if (t === 'danger' || t === 'error') ghType = 'CAUTION';
    else if (t === 'tip' || t === 'success') ghType = 'TIP';
    else if (t === 'important') ghType = 'IMPORTANT';
    
    const blockquoted = innerContent.split(/\r?\n/).map((line: string) => `> ${line}`).join('\n');
    const titleStr = titleRaw.trim();
    if (titleStr) {
      return `> [!${ghType}] ${titleStr}\n${blockquoted}`;
    }
    return `> [!${ghType}]\n${blockquoted}`;
  });

  return content;
};

const extractHeadings = (html: string) => {
  const headings: { id: string; title: string; level: number }[] = [];
  
  
  const regex = /<h([23])[^>]*id="([^"]+)"[^>]*data-title="([^"]+)"/g;
  let match;
  
  while ((match = regex.exec(html)) !== null) {
    const rawTitle = decodeURIComponent(match[3]).trim();
    const cleanTitle = rawTitle.replace(/<[^>]*>?/gm, '');
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
        themes: ['one-dark-pro'],
        langs: ['csharp', 'json', 'typescript', 'bash', 'javascript', 'html', 'css', 'vue']
      });
    }

    const contentWithoutFm = preprocessMarkdown(props.rawMarkdown);
    
    const renderer = new marked.Renderer();
    
    
    renderer.heading = function({ depth, text: rawText, raw }: Tokens.Heading) {
      let text = rawText;
      const level = depth;
      
      
      if (level === 1) return '';
      
      let id = '';
      const customIdMatch = text.match(/\{#([^}]+)\}/);
      if (customIdMatch) {
        id = customIdMatch[1];
        text = text.replace(/\{#([^}]+)\}/, '').trim();
      } else {
        const rawTextForId = raw || text;
        id = rawTextForId
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '');
      }

      // Render inline markdown trong heading (bold/backtick) — trước đây hiển thị thô **...**.
      const renderedText = text
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
        .replace(/`([^`]+)`/g, '<code class="bg-bg-surface text-accent px-1.5 py-0.5 rounded text-xs font-mono">$1</code>');
        
      return `<h${level} id="${id}" class="group relative" data-title="${encodeURIComponent(renderedText)}">
        <a href="#${id}" class="absolute -left-6 opacity-0 group-hover:opacity-100 transition-opacity text-accent-primary no-underline hidden md:block">#</a>
        ${renderedText}
      </h${level}>\n`;
    };

    // Link nội bộ /docs/... phải đi qua hash router — tránh reload toàn trang về trang chủ.
    renderer.link = function({ href: rawHref, title: tokenTitle, tokens }: Tokens.Link) {
      let href = rawHref ?? '';
      if (href.startsWith('/')) {
        href = '#' + href;
      }
      const title = tokenTitle ? ` title="${tokenTitle.replace(/"/g, '&quot;')}"` : '';
      const text = this.parser.parseInline(tokens ?? []);
      return `<a href="${href}"${title} class="docs-link">${text}</a>\n`;
    };

    
    renderer.code = function({ text: codeText, lang: codeLang }: Tokens.Code) {
      const code = codeText;
      const validLang = codeLang || 'text';
      
      if (validLang === 'mermaid') {
        
        const encoded = encodeURIComponent(code);
        return parseEmojiToSvg(`<div class="mermaid-diagram flex justify-center my-6" data-mermaid-code="${encoded}"><div style="color:#888;font-size:14px;">Đang vẽ biểu đồ...</div></div>`);
      }
      
      
      const playgroundMatch = validLang.match(/^playground:([a-zA-Z0-9-]+)$/);
      if (playgroundMatch) {
          const demo = getPlaygroundDemo(playgroundMatch[1]);
        if (demo) {
          const shareUrl = `#/playground?demo=${demo.id}`;
          return `<div class="playground-demo-card" data-demo-id="${demo.id}">
            <div class="playground-demo-info">
              <span class="playground-demo-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              </span>
              <div class="playground-demo-text">
                <strong>${demo.title}</strong>
                <span>${demo.description}</span>
              </div>
            </div>
            <a class="playground-demo-link" href="${shareUrl}" data-playground-url="${shareUrl}" title="Mở Playground chạy từng bước với thuật toán ${demo.title}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>
              Chạy thử từng bước
            </a>
          </div>`;
        }
      }
      
      
      const dualMatch = validLang.match(/^dual:([a-zA-Z0-9-]+)$/);
      if (dualMatch) {
        const demo = getPlaygroundDemo(dualMatch[1]);
        if (demo) {
          let jsHtml = '';
          let csHtml = '';
          try {
            jsHtml = highlighter!.codeToHtml(demo.source.js, { lang: 'javascript', theme: 'one-dark-pro' });
          } catch (e) {
            jsHtml = `<pre><code>${demo.source.js}</code></pre>`;
          }
          try {
            csHtml = highlighter!.codeToHtml(code, { lang: 'csharp', theme: 'one-dark-pro' });
          } catch (e) {
            csHtml = `<pre><code>${code}</code></pre>`;
          }
          
          return `<div class="dual-code-block" data-demo-id="${demo.id}">
            <div class="dual-code-header">
              <span class="dual-code-label">Code mẫu — ${demo.title}</span>
              <select class="dual-code-select" aria-label="Chọn ngôn ngữ">
                <option value="js" selected>JavaScript</option>
                <option value="cs">C#</option>
              </select>
            </div>
            <div class="dual-code-pane dual-code-pane-js">${jsHtml}</div>
            <div class="dual-code-pane dual-code-pane-cs" style="display:none;">${csHtml}</div>
          </div>`;
        }
      }
      
      try {
        const highlighted = highlighter!.codeToHtml(code, {
          lang: validLang,
          theme: 'one-dark-pro'
        });
        
        const svgIcon = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
        
        return `<div class="language-${validLang} relative group">
          <div class="absolute top-3 right-3 z-10 flex items-center">
            <button class="copy-code-btn opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center w-8 h-8 rounded-md bg-transparent hover:bg-bg-hover text-text-muted hover:text-white" data-copy-code="${encodeURIComponent(code)}" title="Copy code">
              ${svgIcon}
            </button>
          </div>
          ${highlighted}
        </div>`;
      } catch (e) {
        return `<pre><code>${code}</code></pre>`;
      }
    };

    
    renderer.blockquote = function({ text: quoteText }: Tokens.Blockquote) {
      const text = quoteText;
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
      
      const svgMap: Record<string, string> = {
        'note': '<svg class="mr-2" width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM6.5 7.75A.75.75 0 0 1 7.25 7h1a.75.75 0 0 1 .75.75v2.75h.25a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5h.25v-2h-.25a.75.75 0 0 1-.75-.75ZM8 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"/></svg>',
        'info': '<svg class="mr-2" width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM6.5 7.75A.75.75 0 0 1 7.25 7h1a.75.75 0 0 1 .75.75v2.75h.25a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5h.25v-2h-.25a.75.75 0 0 1-.75-.75ZM8 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"/></svg>',
        'tip': '<svg class="mr-2" width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1.5c-2.363 0-4 1.69-4 3.75 0 .984.424 1.625.984 2.304l.214.253c.223.264.47.556.673.848.284.411.537.896.621 1.49a.75.75 0 0 1-1.484.211c-.04-.282-.163-.547-.37-.847a8.456 8.456 0 0 0-.542-.68c-.084-.1-.173-.205-.268-.32C3.201 7.75 2.5 6.766 2.5 5.25 2.5 2.31 4.863 0 8 0s5.5 2.31 5.5 5.25c0 1.516-.701 2.5-1.328 3.259-.095.115-.184.22-.268.319-.207.245-.383.453-.541.681-.208.3-.33.565-.37.847a.751.751 0 0 1-1.485-.212c.084-.593.337-1.078.621-1.489.203-.292.45-.584.673-.848.075-.088.147-.173.213-.253.561-.679.985-1.32.985-2.304 0-2.06-1.637-3.75-4-3.75ZM5.75 12h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1 0-1.5ZM6 15.25a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75Z"/></svg>',
        'important': '<svg class="mr-2" width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M0 1.75C0 .784.784 0 1.75 0h12.5C15.216 0 16 .784 16 1.75v9.5A1.75 1.75 0 0 1 14.25 13H8.06l-2.573 2.573A1.458 1.458 0 0 1 3 14.543V13H1.75A1.75 1.75 0 0 1 0 11.25Zm1.75-.25a.25.25 0 0 0-.25.25v9.5c0 .138.112.25.25.25h2a.75.75 0 0 1 .75.75v2.19l2.72-2.72a.749.749 0 0 1 .53-.22h6.5a.25.25 0 0 0 .25-.25v-9.5a.25.25 0 0 0-.25-.25Zm7 2.25v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 9a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"/></svg>',
        'warning': '<svg class="mr-2" width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"/></svg>',
        'caution': '<svg class="mr-2" width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M4.47.22A.749.749 0 0 1 5 0h6c.199 0 .389.079.53.22l4.25 4.25c.141.14.22.331.22.53v6a.749.749 0 0 1-.22.53l-4.25 4.25A.749.749 0 0 1 11 16H5a.749.749 0 0 1-.53-.22L.22 11.53A.749.749 0 0 1 0 11V5c0-.199.079-.389.22-.53Zm.84 1.28L1.5 5.31v5.38l3.81 3.81h5.38l3.81-3.81V5.31L10.69 1.5ZM8 4a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"/></svg>'
      };
      
      const titleMatch = text.match(/^\[!.*?\] (.*?)\n/);
      const title = titleMatch ? titleMatch[1] : titleMap[type];
      const displayTitle = title?.trim() || titleMap[type] || 'Lưu ý';
      const icon = svgMap[type] || svgMap['note'];
      const innerHtml = marked.parse(content);
      
      return `<div class="custom-block ${type}">\n<p class="custom-block-title">${icon}<span>${displayTitle}</span></p>\n${innerHtml}\n</div>`;
    };

    marked.use({ renderer, gfm: true, breaks: true });

    const parsedHtml = marked.parse(contentWithoutFm);
    htmlContent.value = parseEmojiToSvg(typeof parsedHtml === 'string' ? parsedHtml : await parsedHtml);
    loading.value = false; 
    
    await nextTick(); 
    
    ensureContainerListeners();
    
    extractHeadings(htmlContent.value);
    
    if (!markdownContainer.value) return;
    const diagrams = markdownContainer.value.querySelectorAll('.mermaid-diagram');
    if (diagrams.length === 0) return;
    
    try {
      const { default: mermaid } = await import('mermaid');
      mermaid.initialize(buildMermaidInitConfig());
      
      for (let i = 0; i < diagrams.length; i++) {
        const el = diagrams[i] as HTMLElement;
        const encoded = el.getAttribute('data-mermaid-code');
        if (!encoded) continue;
        
        const code = decodeURIComponent(encoded);
        try {
          const { svg } = await mermaid.render(`mermaid-svg-${Date.now()}-${i}`, code);
          el.innerHTML = svg;
        } catch (renderErr: unknown) {
          el.innerHTML = parseEmojiToSvg(`<div style="background:rgba(200,50,50,0.15);border:1px solid #c53030;padding:16px;border-radius:8px;color:#fc8181;font-size:13px;text-align:left;width:100%;">
            <strong>Lỗi cú pháp Mermaid:</strong><br/>
            <pre style="margin-top:8px;font-size:11px;overflow-x:auto;">${errorMessage(renderErr)}</pre>
          </div>`);
        }
      }
    } catch (err: unknown) {
      console.error("Lỗi tải Mermaid:", err);
      diagrams.forEach(el => {
        el.innerHTML = parseEmojiToSvg(`<div style="color:#fc8181;">Không thể tải thư viện Mermaid: ${errorMessage(err)}</div>`);
      });
    }
  } catch (error: unknown) {
    console.error("Lỗi khi render markdown:", error);
    htmlContent.value = `<div class="text-accent-red">Lỗi khi phân giải tài liệu: ${errorMessage(error)}</div>`;
    loading.value = false;
  }
};

watch(() => props.rawMarkdown, () => {
  renderMarkdown();
});

onMounted(() => {
  renderMarkdown();
});

onBeforeUnmount(() => {
  if (markdownContainer.value && containerListenersAttached) {
    markdownContainer.value.removeEventListener('click', handleContainerClick);
    markdownContainer.value.removeEventListener('change', handleContainerChange);
    containerListenersAttached = false;
  }
});
</script>
