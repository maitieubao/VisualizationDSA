import { parseEmojiToSvg } from '../../utils/emojiParser';

export function renderMarkdown(md: string): string {
  if (!md) return '';
  
  let html = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code class="syn-inline-code">$1</code>');

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
