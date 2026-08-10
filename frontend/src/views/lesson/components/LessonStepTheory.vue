<template>
  <div class="lesson-step-theory flex flex-col h-full overflow-y-auto p-6 text-text-primary font-sans leading-relaxed max-w-4xl mx-auto w-full">
    
    <div class="pb-4 mb-4">
      <h1 class="text-xl font-black text-text-primary tracking-tight">{{ title }}</h1>
    </div>

    
    <div class="prose prose-invert prose-indigo max-w-none text-sm space-y-4">
      <div v-html="formattedContent"></div>
    </div>

    
    <div class="mt-8 pt-6 border-t border-border-subtle flex items-center justify-between">
      <span class="text-xs text-text-muted">Đọc hết bài học để mở khóa phần Trực quan hóa.</span>
      <button
        @click="$emit('completeStep')"
        class="px-5 py-2.5 bg-accent hover:bg-accent text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-accent/30 flex items-center gap-2 cursor-pointer"
      >
        <span>Chuyển sang Trực Quan Hóa</span>
        <BaseIcon name="arrow-right" class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  title: string;
  content: string;
}>();

defineEmits<{
  (e: 'completeStep'): void;
}>();

/** Escape HTML để hiển thị an toàn — áp dụng cho TOÀN BỘ nội dung inline (chống stored XSS). */
function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Tách các ô trong một dòng bảng markdown: | a | b | → ['a', 'b'] */
function splitTableRow(row: string): string[] {
  return row
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map(cell => cell.trim());
}

/** Render bảng markdown (| a | b |) thành <table> dark theme. */
function renderTable(rows: string[]): string {
  const header = splitTableRow(rows[0] ?? '');
  const body = rows.slice(2); // bỏ dòng separator | :--- |
  const thead = header.map(h => `<th class="border border-border-subtle px-3 py-2 bg-bg-surface text-left font-bold text-accent">${h}</th>`).join('');
  const tbody = body.map(row => {
    const cells = splitTableRow(row).map(c =>
      `<td class="border border-border-subtle px-3 py-2 text-text-secondary">${c}</td>`).join('');
    return `<tr>${cells}</tr>`;
  }).join('');
  return `<div class="overflow-x-auto my-4"><table class="w-full text-xs border-collapse"><thead><tr>${thead}</tr></thead><tbody>${tbody}</tbody></table></div>`;
}

/**
 * Render markdown đơn giản. Code fence (```lang ... ```) và bảng (| a | b |)
 * được tách ra TRƯỚC để không bị biến đổi bởi các regex inline (bold/heading/code).
 */
const formattedContent = computed(() => {
  if (!props.content) return '<p class="text-text-muted italic">Không có nội dung lý thuyết.</p>';

  // Tách code blocks: [text, lang, code, text, lang, code, ...]
  const parts = props.content.split(/```([\w-]*)\n?([\s\S]*?)```/g);

  const transformInline = (text: string): string => {
    // ESCAPE TOÀN BỘ HTML trước (chống stored XSS qua contentMd từ backend/giảng viên).
    text = escapeHtml(text);

    // Nhóm các dòng bảng liên tiếp (bắt đầu bằng |) thành <table>
    const lines = text.split('\n');
    let html = '';
    let tableRows: string[] = [];
    const flushTable = (): void => {
      if (tableRows.length >= 2) html += renderTable(tableRows);
      else html += tableRows.join('\n');
      tableRows = [];
    };
    for (const line of lines) {
      if (line.trim().startsWith('|')) {
        tableRows.push(line);
      } else {
        flushTable();
        html += line + '\n';
      }
    }
    flushTable();

    return html
      .replace(/^### (.*$)/gim, '<h3 class="text-base font-bold text-accent mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold text-text-primary mt-6 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-xl font-extrabold text-text-primary mt-6 mb-3">$1</h1>')
      .replace(/\*\*(.*)\*\*/gim, '<strong class="font-bold text-text-primary">$1</strong>')
      .replace(/`([^`]+)`/g, '<code class="bg-bg-surface text-accent px-1.5 py-0.5 rounded text-xs font-mono">$1</code>')
      .replace(/\n\n/g, '</p><p class="my-3 text-text-primary">');
  };

  let html = '';
  for (let i = 0; i < parts.length; i++) {
    if (i % 3 === 0) {
      html += transformInline(parts[i] ?? '');
    } else if (i % 3 === 2) {
      const code = escapeHtml(parts[i] ?? '');
      html += '<pre class="rounded-xl bg-bg-surface border border-border-subtle p-3 overflow-x-auto my-3"><code class="text-xs font-mono text-accent leading-relaxed">'
        + code
        + '</code></pre>';
    }
  }
  return html;
});
</script>
