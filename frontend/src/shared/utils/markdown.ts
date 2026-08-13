import { parseEmojiToSvg } from '../../utils/emojiParser';

// CU-001: whitelist scheme cho link — CHỈ http/https/mailto được render thành <a>.
// Các scheme khác (javascript:, data:...) không khớp regex → giữ nguyên dạng text đã
// escape → không bao giờ trở thành href/chạy được trong v-html preview.
const SAFE_LINK_PATTERN = /\[([^\]]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+)\)/g;

export function renderMarkdown(md: string): string {
  if (!md) return '';

  // CU-001: escape-first TOÀN BỘ (& < > " ') TRƯỚC khi bất kỳ regex markup nào chạy —
  // nội dung/URL user nhập không bao giờ chui thẳng vào HTML. Chuỗi đã escape sau đó
  // được nội suy vào <strong>/<em>/<code>/<a href> nên không thể phá markup.
  let html = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code class="syn-inline-code">$1</code>');

  // CU-001: link chạy SAU cùng — URL đã qua escape (không còn " ' < > &) và chỉ khớp
  // scheme whitelist → thuộc tính href an toàn, không thể injection thuộc tính.
  html = html.replace(
    SAFE_LINK_PATTERN,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  // CU-001/A1.4: triệt tiêu triệt để scheme KHÔNG an toàn còn sót dạng [text](scheme:...)
  // (javascript:, data:...) — không tạo href, giữ nguyên text thuần. Chuỗi "javascript:"
  // không bao giờ tồn tại trong output (bài học lý thuyết an toàn cả khi preview).
  html = html.replace(/\[([^\]]+)\]\(([a-z][a-z0-9+.\-]*):[^)\s]*\)/gi, '$1');

  const blocks = html.split(/\n\n+/);
  
  const renderedBlocks = blocks.map(block => {
    block = block.trim();
    if (!block) return '';
    
    if (block.startsWith('### ')) {
      return `<h5 class="text-xs font-bold text-text-primary mt-3 mb-1.5">${block.replace(/^### /, '')}</h5>`;
    }
    if (block.startsWith('## ')) {
      return `<h4 class="text-sm font-bold text-text-primary mt-4 mb-2">${block.replace(/^## /, '')}</h4>`;
    }
    if (block.startsWith('# ')) {
      return `<h3 class="text-base font-bold text-text-primary mt-5 mb-2.5">${block.replace(/^# /, '')}</h3>`;
    }
    
    if (block.startsWith('- ')) {
      const items = block.split(/\n\s*-\s+/).map(item => {
        const cleanItem = item.replace(/^-\s+/, '').trim();
        return `<li class="ml-4 list-disc text-text-secondary py-0.5">${cleanItem}</li>`;
      });
      return `<ul class="mb-3">${items.join('')}</ul>`;
    }
    
    const paragraphLines = block.split(/\n/).join('<br/>');
    return `<p class="text-text-secondary leading-relaxed mb-3 text-xs lg:text-sm">${paragraphLines}</p>`;
  });
  
  return parseEmojiToSvg(renderedBlocks.join(''));
}
