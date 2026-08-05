// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import LessonStepTheory from '../../../views/lesson/components/LessonStepTheory.vue';
import BaseIcon from '../../../shared/components/BaseIcon.vue';

function mountTheory(content: string, title = 'Bài học'): VueWrapper {
  return mount(LessonStepTheory, {
    props: { title, content },
    global: { components: { BaseIcon } },
  });
}

describe('LessonStepTheory — render markdown với code fence', () => {
  it('render code fence thành <pre><code> (không bị biến đổi bởi bold/heading)', () => {
    const content = `# Tiêu đề

**In đậm ngoài code**

\`\`\`csharp
int Factorial(int n) {
    if (n <= 1) return 1;   // **KHÔNG được bold** (dùng trong lý thuyết khóa mới)
    return n * Factorial(n - 1);
}
\`\`\``;
    const wrapper = mountTheory(content);
    const html = wrapper.html();

    expect(html).toContain('<pre');
    expect(html).toContain('int Factorial(int n)');
    // Nội dung trong code block không bị biến đổi thành <strong>
    expect(html).not.toContain('<strong>KHÔNG được bold</strong>');
    // Phần ngoài code vẫn render bold bình thường
    expect(html).toContain('<strong class="font-bold text-white">In đậm ngoài code</strong>');
    // Code block giữ nguyên ký tự gốc (đã escape)
    expect(html).toContain('if (n &lt;= 1) return 1;');
  });

  it('escape HTML trong code block (chống XSS qua nội dung bài giảng)', () => {
    const content = '```js\nconst el = "<script>alert(1)</script>";\n```';
    const wrapper = mountTheory(content);
    expect(wrapper.html()).toContain('&lt;script&gt;');
    expect(wrapper.html()).not.toContain('<script>alert(1)</script>');
  });

  it('inline code vẫn render đúng', () => {
    const wrapper = mountTheory('Dùng `O(N)` cho mảng.');
    expect(wrapper.html()).toContain('<code class="bg-bg-surface');
    expect(wrapper.text()).toContain('O(N)');
  });

  it('nội dung rỗng → thông báo mặc định', () => {
    const wrapper = mountTheory('');
    expect(wrapper.text()).toContain('Không có nội dung lý thuyết');
  });

  it('nhiều code fence liên tiếp vẫn tách đúng', () => {
    const content = 'Đoạn 1\n```js\nconst a = 1;\n```\nĐoạn giữa\n```py\nprint(1)\n```\nĐoạn cuối';
    const wrapper = mountTheory(content);
    const html = wrapper.html();
    expect(html).toContain('const a = 1;');
    expect(html).toContain('print(1)');
    expect(html).toContain('Đoạn 1');
    expect(html).toContain('Đoạn giữa');
    expect(html).toContain('Đoạn cuối');
    expect(html.split('<pre').length - 1).toBe(2);
  });

  it('render bảng markdown thành <table> (bảng độ phức tạp)', () => {
    const content = '## Độ phức tạp\n\n| Trường hợp | Thời gian | Ghi chú |\n| :--- | :--- | :--- |\n| Tốt nhất | O(1) | Phần tử giữa |\n| Xấu nhất | O(N) | Duyệt hết |';
    const wrapper = mountTheory(content);
    const html = wrapper.html();

    expect(html).toContain('<table');
    expect(html).toContain('<th');
    expect(html).toContain('<td');
    expect(html).toContain('Trường hợp');
    expect(html).toContain('O(1)');
    expect(html).toContain('O(N)');
    // Không còn dấu | markdown lộ ra
    expect(html).not.toContain('| :--- |');
  });

  it('bảng không có separator row vẫn render an toàn (không crash)', () => {
    const content = '| A | B |\n| 1 | 2 |';
    const wrapper = mountTheory(content);
    expect(wrapper.html()).toContain('<table');
  });
});
