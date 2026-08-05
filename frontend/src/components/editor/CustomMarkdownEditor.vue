<template>
  <div class="markdown-editor">
    
    <div class="editor-toolbar" role="toolbar" aria-label="Markdown formatting">
      <div class="toolbar-group">
        <button 
          type="button" 
          class="toolbar-btn" 
          @click="wrapSelection('## ', '')"
          title="Heading 2 (Ctrl+2)"
        >
          <BaseIcon name="type" class="w-4 h-4" />
        </button>
        <button 
          type="button" 
          class="toolbar-btn" 
          @click="wrapSelection('### ', '')"
          title="Heading 3 (Ctrl+3)"
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
        >
          <BaseIcon name="bold" class="w-4 h-4" />
        </button>
        <button 
          type="button" 
          class="toolbar-btn" 
          @click="wrapSelection('*', '*')"
          title="Italic (Ctrl+I)"
        >
          <BaseIcon name="italic" class="w-4 h-4" />
        </button>
        <button 
          type="button" 
          class="toolbar-btn" 
          @click="wrapSelection('~~', '~~')"
          title="Strikethrough"
        >
          <BaseIcon name="strikethrough" class="w-4 h-4" />
        </button>
        <button 
          type="button" 
          class="toolbar-btn" 
          @click="wrapSelection('`', '`')"
          title="Inline Code"
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
        >
          <BaseIcon name="list" class="w-4 h-4" />
        </button>
        <button 
          type="button" 
          class="toolbar-btn" 
          @click="wrapSelection('1. ', '')"
          title="Numbered List"
        >
          <BaseIcon name="list-ordered" class="w-4 h-4" />
        </button>
        <button 
          type="button" 
          class="toolbar-btn" 
          @click="wrapSelection('> ', '')"
          title="Quote"
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
        >
          <BaseIcon name="terminal" class="w-4 h-4" />
        </button>
        <button 
          type="button" 
          class="toolbar-btn" 
          @click="wrapSelection('[', '](url)')"
          title="Link"
        >
          <BaseIcon name="link" class="w-4 h-4" />
        </button>
        <button 
          type="button" 
          class="toolbar-btn" 
          @click="wrapSelection('![', '](image-url)')"
          title="Image"
        >
          <BaseIcon name="image" class="w-4 h-4" />
        </button>
        <button 
          type="button" 
          class="toolbar-btn" 
          @click="wrapSelection('\n---\n', '')"
          title="Horizontal Rule"
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
        >
          <BaseIcon :name="isFullscreen ? 'minimize-2' : 'maximize-2'" class="w-4 h-4" />
        </button>
        <button 
          type="button" 
          class="toolbar-btn" 
          @click="togglePreview"
          :title="showPreview ? 'Edit' : 'Preview'"
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
          @keydown="handleKeydown"
          @input="onInput"
          @scroll="syncScroll"
          spellcheck="false"
        ></textarea>
      </div>
      
      
      <div v-show="showPreview" class="preview-pane" @scroll="syncScroll">
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
import { ref, computed, watch, nextTick, onMounted } from 'vue';
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


function renderMarkdown(md: string): string {
  if (!md) return '<p class="text-text-muted italic">Nội dung trống...</p>';
  
  const result = md
    
    .replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      const language = lang || 'text';
      return `<pre class="language-${language}"><code>${escapeHtml(code)}</code></pre>`;
    })
    
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
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    // Images
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="md-image" />')
    // Horizontal rule
    .replace(/^---$/gm, '<hr />')
    // Blockquotes
    .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
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

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#039;');
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

function onInput() {
  // Trigger watcher
}

function syncScroll(e: Event) {
  const target = e.target as HTMLElement;
  const other = showPreview.value ? textarea.value : document.querySelector('.preview-pane');
  if (other && target.scrollHeight > target.clientHeight) {
    const ratio = target.scrollTop / (target.scrollHeight - target.clientHeight);
    (other as HTMLElement).scrollTop = ratio * ((other as HTMLElement).scrollHeight - (other as HTMLElement).clientHeight);
  }
}

function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value;
  if (isFullscreen.value) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
}

function togglePreview() {
  showPreview.value = !showPreview.value;
}

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
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
  font-family: inherit;
}

.editor-toolbar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  background: rgba(15, 23, 42, 0.8);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
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
  background: rgba(255, 255, 255, 0.1);
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
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.15s;
}

.toolbar-btn:hover {
  background: rgba(99, 102, 241, 0.15);
  color: #a5b4fc;
}

.toolbar-btn.active {
  background: rgba(99, 102, 241, 0.2);
  color: #a5b4fc;
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
  color: #e2e8f0;
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.6;
  resize: none;
  outline: none;
  tab-size: 2;
}

.editor-textarea::placeholder {
  color: rgba(148, 163, 184, 0.4);
}

.editor-textarea:focus {
  outline: none;
}

.preview-content {
  padding: 16px;
  color: #e2e8f0;
  font-size: 14px;
  line-height: 1.7;
  max-width: 800px;
  margin: 0 auto;
}

.preview-content h1,
.preview-content h2,
.preview-content h3 {
  color: white;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  font-weight: 700;
}

.preview-content h1 { font-size: 1.75em; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.3em; }
.preview-content h2 { font-size: 1.5em; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.3em; }
.preview-content h3 { font-size: 1.25em; }

.preview-content p { margin: 0.75em 0; }
.preview-content ul, .preview-content ol { margin: 0.75em 0; padding-left: 1.5em; }
.preview-content li { margin: 0.25em 0; }
.preview-content code.inline-code { 
  background: rgba(99, 102, 241, 0.15); 
  color: #a5b4fc; 
  padding: 0.15em 0.4em; 
  border-radius: 4px; 
  font-family: inherit;
  font-size: 0.9em;
}
.preview-content pre { 
  background: #020617; 
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 8px; 
  padding: 16px; 
  overflow-x: auto; 
  margin: 1em 0; 
}
.preview-content pre code { 
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace; 
  font-size: 12px; 
  line-height: 1.6; 
  color: #e2e8f0; 
  display: block; 
}
.preview-content blockquote { 
  border-left: 3px solid #6366f1; 
  padding-left: 16px; 
  margin: 1em 0; 
  color: #94a3b8; 
  font-style: italic; 
}
.preview-content a { color: #a5b4fc; text-decoration: none; }
.preview-content a:hover { text-decoration: underline; }
.preview-content hr { border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 2em 0; }
.preview-content .md-image { max-width: 100%; height: auto; border-radius: 8px; margin: 1em 0; }
.preview-content del { color: #64748b; text-decoration: line-through; }
.preview-content strong { color: white; }
.preview-content em { color: #cbd5e1; }

.editor-statusbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: rgba(15, 23, 42, 0.8);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
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