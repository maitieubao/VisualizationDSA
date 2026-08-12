<template>
  <div class="markdown-editor">
    
    <div class="editor-toolbar" role="toolbar" aria-label="Markdown formatting">
      <div class="toolbar-group">
        <button 
          type="button" 
          class="toolbar-btn" 
          @click="wrapSelection('## ', '')"
          title="Heading 2 (Ctrl+2)"
          aria-label="Chèn tiêu đề cấp 2"
        >
          <BaseIcon name="type" class="w-4 h-4" />
        </button>
        <button 
          type="button" 
          class="toolbar-btn" 
          @click="wrapSelection('### ', '')"
          title="Heading 3 (Ctrl+3)"
          aria-label="Chèn tiêu đề cấp 3"
        >
          <BaseIcon name="type" class="w-4 h-4" />
          <span class="text-xs">H3</span>
        </button>
      </div>
      
      <div class="toolbar-divider"></div>
      
      <div class="toolbar-group">
        <button 
          type="button" 
          class="toolbar-btn" 
          @click="wrapSelection('**', '**')"
          title="Bold (Ctrl+B)"
          aria-label="In đậm"
        >
          <BaseIcon name="bold" class="w-4 h-4" />
        </button>
        <button 
          type="button" 
          class="toolbar-btn" 
          @click="wrapSelection('*', '*')"
          title="Italic (Ctrl+I)"
          aria-label="In nghiêng"
        >
          <BaseIcon name="italic" class="w-4 h-4" />
        </button>
        <button 
          type="button" 
          class="toolbar-btn" 
          @click="wrapSelection('~~', '~~')"
          title="Strikethrough"
          aria-label="Gạch ngang"
        >
          <BaseIcon name="strikethrough" class="w-4 h-4" />
        </button>
        <button 
          type="button" 
          class="toolbar-btn" 
          @click="wrapSelection('`', '`')"
          title="Inline Code"
          aria-label="Mã nội tuyến"
        >
          <BaseIcon name="code" class="w-4 h-4" />
        </button>
      </div>
      
      <div class="toolbar-divider"></div>
      
      <div class="toolbar-group">
        <button 
          type="button" 
          class="toolbar-btn" 
          @click="wrapSelection('- ', '')"
          title="Bullet List"
          aria-label="Danh sách gạch đầu dòng"
        >
          <BaseIcon name="list" class="w-4 h-4" />
        </button>
        <button 
          type="button" 
          class="toolbar-btn" 
          @click="wrapSelection('1. ', '')"
          title="Numbered List"
          aria-label="Danh sách đánh số"
        >
          <BaseIcon name="list-ordered" class="w-4 h-4" />
        </button>
        <button 
          type="button" 
          class="toolbar-btn" 
          @click="wrapSelection('> ', '')"
          title="Quote"
          aria-label="Chèn trích dẫn"
        >
          <BaseIcon name="quote" class="w-4 h-4" />
        </button>
      </div>
      
      <div class="toolbar-divider"></div>
      
      <div class="toolbar-group">
        <button 
          type="button" 
          class="toolbar-btn" 
          @click="wrapSelection('\n```\n', '\n```\n')"
          title="Code Block"
          aria-label="Chèn khối mã"
        >
          <BaseIcon name="terminal" class="w-4 h-4" />
        </button>
        <button 
          type="button" 
          class="toolbar-btn" 
          @click="wrapSelection('[', '](url)')"
          title="Link"
          aria-label="Chèn liên kết"
        >
          <BaseIcon name="link" class="w-4 h-4" />
        </button>
        <button 
          type="button" 
          class="toolbar-btn" 
          @click="wrapSelection('![', '](image-url)')"
          title="Image"
          aria-label="Chèn hình ảnh"
        >
          <BaseIcon name="image" class="w-4 h-4" />
        </button>
        <button 
          type="button" 
          class="toolbar-btn" 
          @click="wrapSelection('\n---\n', '')"
          title="Horizontal Rule"
          aria-label="Chèn đường phân cách"
        >
          <BaseIcon name="minus" class="w-4 h-4" />
        </button>
      </div>
      
      <div class="toolbar-spacer"></div>
      
      <div class="toolbar-group">
        <button 
          type="button" 
          class="toolbar-btn" 
          @click="toggleFullscreen"
          :title="isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'"
          :aria-label="isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'"
        >
          <BaseIcon :name="isFullscreen ? 'minimize-2' : 'maximize-2'" class="w-4 h-4" />
        </button>
        <button 
          type="button" 
          class="toolbar-btn" 
          @click="togglePreview"
          :title="showPreview ? 'Edit' : 'Preview'"
          :aria-label="showPreview ? 'Chuyển sang chỉnh sửa' : 'Xem trước bản xem'"
          :aria-pressed="showPreview"
          :class="{ active: showPreview }"
        >
          <BaseIcon :name="showPreview ? 'edit-2' : 'eye'" class="w-4 h-4" />
        </button>
      </div>
    </div>
    
    
    <div class="editor-area" :class="{ 'fullscreen': isFullscreen }">
      
      <div v-show="!showPreview" class="editor-pane">
        <textarea
          ref="textarea"
          v-model="content"
          class="editor-textarea"
          :placeholder="placeholder"
          aria-label="Trình soạn thảo Markdown"
          @keydown="handleKeydown"
          @scroll="syncScroll"
          spellcheck="false"
        ></textarea>
      </div>
      
      
      <div v-show="showPreview" ref="previewPane" class="preview-pane" @scroll="syncScroll">
        <div class="preview-content" v-html="renderedHtml"></div>
      </div>
    </div>
    
    
    <div class="editor-statusbar">
      <div class="status-left">
        <span class="status-item">
          <BaseIcon name="file-text" class="w-3 h-3" />
          Markdown
        </span>
        <span class="status-item">
          {{ charCount }} ký tự
        </span>
        <span class="status-item">
          {{ lineCount }} dòng
        </span>
        <span class="status-item" v-if="wordCount > 0">
          {{ wordCount }} từ
        </span>
      </div>
      <div class="status-right">
        <span class="status-item" v-if="showPreview">
          <BaseIcon name="eye" class="w-3 h-3" />
          Preview
        </span>
        <span class="status-item" v-else>
          <BaseIcon name="edit-2" class="w-3 h-3" />
          Edit
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue';
import BaseIcon from '@/shared/components/BaseIcon.vue';
import { parseEmojiToSvg } from '@/utils/emojiParser';

interface Props {
  modelValue: string;
  placeholder?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const textarea = ref<HTMLTextAreaElement | null>(null);
const previewPane = ref<HTMLElement | null>(null);
const showPreview = ref(false);
const isFullscreen = ref(false);
const renderedHtml = ref('');

const content = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const charCount = computed(() => content.value.length);
const lineCount = computed(() => content.value.split('\n').length);
const wordCount = computed(() => content.value.trim() ? content.value.trim().split(/\s+/).length : 0);

const placeholder = props.placeholder || 'Viết nội dung bằng Markdown...';


// CU-001: renderer escape-first — toàn bộ nội dung được escape HTML TRƯỚC khi
// xử lý Markdown, kèm whitelist scheme http/https/mailto cho href/src để chặn XSS
// (javascript:, data:...) trong v-html preview.
function renderMarkdown(md: string): string {
  if (!md) return '<p class="text-text-muted italic">Nội dung trống...</p>';
  
  const result = md
    // Escape toàn bộ ký tự HTML trước — nội dung user nhập không bao giờ thành thẻ thật.
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    // Code blocks
    .replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      const language = lang || 'text';
      return `<pre class="language-${language}"><code>${code}</code></pre>`;
    })
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
    // Headers
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    // Bold & Italic
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Strikethrough
    .replace(/~~(.+?)~~/g, '<del>$1</del>')
    // Images — xử lý TRƯỚC link để toolbar Image tạo đúng <img> (CU-015)
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
      const safeSrc = sanitizeUrl(src);
      if (!safeSrc) return alt || '';
      return `<img src="${safeSrc}" alt="${alt}" class="md-image" loading="lazy" />`;
    })
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, label, href) => {
      const safeHref = sanitizeUrl(href);
      if (!safeHref) return label;
      return `<a href="${safeHref}" target="_blank" rel="noopener noreferrer">${label}</a>`;
    })
    // Horizontal rule
    .replace(/^---$/gm, '<hr />')
    // Blockquotes (> đã escape thành &gt;)
    .replace(/^&gt; (.*$)/gm, '<blockquote>$1</blockquote>')
    // Lists - ordered
    .replace(/^(\d+)\. (.*$)/gm, '<li>$2</li>')
    // Lists - unordered
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    // Wrap consecutive list items
    .replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`)
    // Paragraphs (last)
    .replace(/\n\n+/g, '</p><p>')
    .replace(/^(?!<[hulpbq])(.+)$/gm, '<p>$1</p>')
    // Fix nested tags
    .replace(/<p>\s*<\/p>/g, '')
    .replace(/<p>\s*(<[hulpbq])/g, '$1')
    .replace(/(<\/[hulpbq]>)\s*<\/p>/g, '$1')
    .replace(/<p>\s*(<pre>)/g, '$1')
    .replace(/(<\/pre>)\s*<\/p>/g, '$1');
  
  return parseEmojiToSvg(result);
}

// CU-001: chỉ cho phép http/https/mailto (và đường dẫn tương đối cùng origin).
// Bỏ dấu " (đã escape thành &quot;) trong href/src để không phá vỡ attribute.
function sanitizeUrl(raw: string): string {
  const url = raw.replace(/&quot;/g, '').replace(/"/g, '').trim();
  try {
    const parsed = new URL(url, window.location.origin);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:' || parsed.protocol === 'mailto:') {
      return url;
    }
  } catch {
    // URL không hợp lệ → chặn.
  }
  return '';
}

watch(content, (newVal) => {
  renderedHtml.value = renderMarkdown(newVal);
}, { immediate: true });

// Toolbar actions
function wrapSelection(prefix: string, suffix: string) {
  const ta = textarea.value;
  if (!ta) return;
  
  const start = ta.selectionStart;
  const end = ta.selectionEnd;
  const selected = content.value.substring(start, end);
  
  const newContent = content.value.substring(0, start) + prefix + selected + suffix + content.value.substring(end);
  content.value = newContent;
  
  nextTick(() => {
    ta.focus();
    if (selected) {
      ta.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    } else {
      ta.setSelectionRange(start + prefix.length, start + prefix.length);
    }
  });
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Tab') {
    e.preventDefault();
    const ta = textarea.value;
    if (!ta) return;
    
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    
    if (e.shiftKey) {
      // Unindent
      const lineStart = content.value.lastIndexOf('\n', start - 1) + 1;
      const lineEnd = content.value.indexOf('\n', end);
      const line = content.value.substring(lineStart, lineEnd === -1 ? undefined : lineEnd);
      
      if (line.startsWith('  ') || line.startsWith('\t')) {
        const newLine = line.startsWith('\t') ? line.slice(1) : line.slice(2);
        content.value = content.value.substring(0, lineStart) + newLine + content.value.substring(lineEnd);
        nextTick(() => {
          ta.setSelectionRange(start - (line.length - newLine.length), end - (line.length - newLine.length));
        });
      }
    } else {
      // Indent
      content.value = content.value.substring(0, start) + '  ' + content.value.substring(start);
      nextTick(() => {
        ta.setSelectionRange(start + 2, end + 2);
      });
    }
  }
  
  // Shortcuts
  if ((e.ctrlKey || e.metaKey) && !e.altKey) {
    switch (e.key.toLowerCase()) {
      case 'b':
        e.preventDefault(); wrapSelection('**', '**'); break;
      case 'i':
        e.preventDefault(); wrapSelection('*', '*'); break;
      case '1':
        e.preventDefault(); wrapSelection('# ', ''); break;
      case '2':
        e.preventDefault(); wrapSelection('## ', ''); break;
      case '3':
        e.preventDefault(); wrapSelection('### ', ''); break;
    }
  }
}

// CU-030: bỏ onInput rỗng (watcher content đã lo việc re-render).
function syncScroll(e: Event) {
  const target = e.target as HTMLElement;
  // CU-030: dùng ref nội bộ previewPane — không querySelector global (2 editor cùng tồn tại vẫn đúng pane).
  const other = showPreview.value ? textarea.value : previewPane.value;
  if (other && target.scrollHeight > target.clientHeight) {
    const ratio = target.scrollTop / (target.scrollHeight - target.clientHeight);
    other.scrollTop = ratio * (other.scrollHeight - other.clientHeight);
  }
}

// CU-030: fullscreen hỗ trợ phím Esc để thoát + reset body.overflow khi unmount.
function onFullscreenKeydown(e: KeyboardEvent): void {
  if (e.key === 'Escape' && isFullscreen.value) {
    e.preventDefault();
    setFullscreen(false);
  }
}

function setFullscreen(open: boolean): void {
  isFullscreen.value = open;
  if (open) {
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onFullscreenKeydown);
  } else {
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onFullscreenKeydown);
  }
}

function toggleFullscreen() {
  setFullscreen(!isFullscreen.value);
}

function togglePreview() {
  showPreview.value = !showPreview.value;
}

onBeforeUnmount(() => {
  // CU-030: dọn listener fullscreen + trả lại scroll body nếu đang khóa.
  document.removeEventListener('keydown', onFullscreenKeydown);
  document.body.style.overflow = '';
});

onMounted(() => {
  // Auto-resize textarea
  const ta = textarea.value;
  if (ta) {
    ta.style.height = 'auto';
    ta.style.height = ta.scrollHeight + 'px';
  }
});

watch(content, () => {
  nextTick(() => {
    const ta = textarea.value;
    if (ta && !showPreview.value) {
      ta.style.height = 'auto';
      ta.style.height = ta.scrollHeight + 'px';
    }
  });
});
</script>

<style scoped>
.markdown-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 400px;
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-default);
  border-radius: 12px;
  overflow: hidden;
  font-family: inherit;
}

.editor-toolbar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  background: color-mix(in srgb, var(--color-bg-surface) 80%, transparent);
  border-bottom: 1px solid var(--color-border-subtle);
  flex-wrap: wrap;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 4px;
}

.toolbar-divider {
  width: 1px;
  height: 24px;
  background: var(--color-border-default);
  margin: 0 8px;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.15s;
}

.toolbar-btn:hover {
  background: color-mix(in srgb, var(--color-accent-purple) 15%, transparent);
  color: var(--color-accent-purple-light);
}

.toolbar-btn.active {
  background: color-mix(in srgb, var(--color-accent-purple) 20%, transparent);
  color: var(--color-accent-purple-light);
}

.toolbar-spacer {
  flex: 1;
}

.editor-area {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.editor-area.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  border-radius: 0;
}

.editor-pane,
.preview-pane {
  position: absolute;
  inset: 0;
  overflow: auto;
}

.editor-textarea {
  width: 100%;
  height: 100%;
  padding: 16px;
  background: transparent;
  border: none;
  color: var(--color-text-primary);
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.6;
  resize: none;
  outline: none;
  tab-size: 2;
}

.editor-textarea::placeholder {
  color: var(--color-text-muted);
}

.editor-textarea:focus {
  outline: none;
  /* CU-023: focus-visible ring rõ ràng cho bàn phím */
  box-shadow: inset 0 0 0 2px color-mix(in srgb, var(--color-accent-purple) 55%, transparent);
  border-radius: 4px;
}

.preview-content {
  padding: 16px;
  color: var(--color-text-primary);
  font-size: 14px;
  line-height: 1.7;
  max-width: 800px;
  margin: 0 auto;
}

.preview-content h1,
.preview-content h2,
.preview-content h3 {
  color: var(--color-text-heading);
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  font-weight: 700;
}

.preview-content h1 { font-size: 1.75em; border-bottom: 1px solid var(--color-border-default); padding-bottom: 0.3em; }
.preview-content h2 { font-size: 1.5em; border-bottom: 1px solid var(--color-border-default); padding-bottom: 0.3em; }
.preview-content h3 { font-size: 1.25em; }

.preview-content p { margin: 0.75em 0; }
.preview-content ul, .preview-content ol { margin: 0.75em 0; padding-left: 1.5em; }
.preview-content li { margin: 0.25em 0; }
.preview-content code.inline-code { 
  background: color-mix(in srgb, var(--color-accent-purple) 15%, transparent); 
  color: var(--color-accent-purple-light); 
  padding: 0.15em 0.4em; 
  border-radius: 4px; 
  font-family: inherit;
  font-size: 0.9em;
}
.preview-content pre { 
  background: var(--color-bg-primary); 
  border: 1px solid var(--color-border-subtle);
  border-radius: 8px; 
  padding: 16px; 
  overflow-x: auto; 
  margin: 1em 0; 
}
.preview-content pre code { 
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace; 
  font-size: 12px; 
  line-height: 1.6; 
  color: var(--color-text-primary); 
  display: block; 
}
.preview-content blockquote { 
  border-left: 3px solid #6366f1; 
  padding-left: 16px; 
  margin: 1em 0; 
  color: var(--color-text-secondary); 
  font-style: italic; 
}
.preview-content a { color: var(--color-accent-purple-light); text-decoration: none; }
.preview-content a:hover { text-decoration: underline; }
.preview-content hr { border: none; border-top: 1px solid var(--color-border-default); margin: 2em 0; }
.preview-content .md-image { max-width: 100%; height: auto; border-radius: 8px; margin: 1em 0; }
.preview-content del { color: var(--color-text-secondary); text-decoration: line-through; }
.preview-content strong { color: var(--color-text-heading); }
.preview-content em { color: var(--color-text-secondary); }

.editor-statusbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: color-mix(in srgb, var(--color-bg-surface) 80%, transparent);
  border-top: 1px solid var(--color-border-subtle);
  font-size: 11px;
  color: var(--color-text-secondary);
}

.status-left,
.status-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Responsive */
@media (max-width: 640px) {
  .editor-toolbar {
    padding: 6px 8px;
    gap: 2px;
  }
  
  .toolbar-btn {
    width: 28px;
    height: 28px;
  }
  
  .toolbar-divider {
    height: 20px;
    margin: 0 4px;
  }
  
  .editor-textarea {
    padding: 12px;
    font-size: 12px;
  }
  
  .editor-statusbar {
    flex-wrap: wrap;
    gap: 8px;
    padding: 6px 10px;
  }
  
  .status-left,
  .status-right {
    gap: 12px;
  }
}
</style>