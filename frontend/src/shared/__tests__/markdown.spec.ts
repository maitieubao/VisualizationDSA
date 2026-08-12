// CU-009 (P1): markdown renderer — escape &<>/script/img onerror (XSS regression) +
// heading/list/code/emoji + link whitelist scheme (javascript: bị chặn, http/https/mailto được phép).
import { describe, it, expect } from 'vitest';
import { renderMarkdown } from '../utils/markdown';

describe('renderMarkdown — CU-009', () => {
  it('escape & < > — không lọt thẻ HTML thật', () => {
    const html = renderMarkdown('Hello <script>alert(1)</script> & friends');

    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('&amp;');
  });

  it('XSS regression: <img src=x onerror=...> không lọt thành thẻ HTML', () => {
    const html = renderMarkdown('<img src=x onerror=alert(1)>');

    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
    expect(html).not.toContain('<img ');
  });

  it('escape cả dấu nháy trong thuộc tính', () => {
    const html = renderMarkdown('<b onclick="alert(1)">');

    expect(html).toContain('&lt;b');
    expect(html).toContain('&quot;');
  });

  it('heading #/##/### → h3/h4/h5', () => {
    const html = renderMarkdown('# Tiêu đề lớn\n\n## Tiêu đề hai\n\n### Tiêu đề ba');

    expect(html).toContain('<h3 class="text-base');
    expect(html).toContain('<h4 class="text-sm');
    expect(html).toContain('<h5 class="text-xs');
    expect(html).toContain('>Tiêu đề lớn</h3>');
    expect(html).toContain('>Tiêu đề hai</h4>');
    expect(html).toContain('>Tiêu đề ba</h5>');
  });

  it('danh sách - item → <li>', () => {
    const html = renderMarkdown('- Một\n- Hai');

    expect(html).toContain('<li class="ml-4');
    expect(html).toContain('Một');
    expect(html).toContain('Hai');
  });

  it('code inline → <code class="syn-inline-code">', () => {
    const html = renderMarkdown('Dùng `push()` để thêm');

    expect(html).toContain('<code class="syn-inline-code">push()</code>');
  });

  it('emoji 🎯 → svg inline icon-target', () => {
    const html = renderMarkdown('Mục tiêu 🎯 của bạn');

    expect(html).toContain('class="svg-inline-icon icon-target"');
  });

  it('link whitelist: javascript: bị chặn — không sinh thẻ <a> với href javascript', () => {
    const html = renderMarkdown('[Click](javascript:alert(1))');

    expect(html).not.toContain('href="javascript:');
  });

  it('link whitelist: http/https/mailto được phép', () => {
    const html = renderMarkdown('[Docs](https://example.com/a) và [Mail](mailto:a@b.com)');

    expect(html).toContain('href="https://example.com/a"');
    expect(html).toContain('href="mailto:a@b.com"');
  });

  it('link whitelist: scheme khác (data:) bị chặn', () => {
    const html = renderMarkdown('[Bad](data:text/html;base64,PHNjcmlwdD4=)');

    expect(html).not.toContain('href="data:');
  });
});
