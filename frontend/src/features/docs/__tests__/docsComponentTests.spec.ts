// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils';
import { reactive, nextTick } from 'vue';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import DocsSidebar from '../components/DocsSidebar.vue';
import DocsSidebarItem from '../components/DocsSidebarItem.vue';
import DocsLayout from '../components/DocsLayout.vue';
import DocsTableOfContents from '../components/DocsTableOfContents.vue';
import DocsMarkdownRenderer from '../components/DocsMarkdownRenderer.vue';
import DocsView from '../../../views/docs/DocsView.vue';
import { docsNavigation } from '../data/docsNavigation';
import type { NavItem } from '../types/docs.types';

const { mockRoute, mockPush, mockReplace, mermaidRender } = vi.hoisted(() => {
  const mockRoute = vi.fn();
  const mockPush = vi.fn();
  const mockReplace = vi.fn();
  const mermaidRender = vi.fn(async (_id: string, _code: string): Promise<{ svg: string }> => ({
    svg: '<svg class="mock-mermaid-svg"></svg>',
  }));
  return { mockRoute, mockPush, mockReplace, mermaidRender };
});

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute(),
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
}));

vi.mock('shiki', () => ({
  createHighlighter: vi.fn(async () => ({
    codeToHtml: (code: string): string => `<pre class="shiki"><code>${code}</code></pre>`,
  })),
}));

vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn(),
    render: (id: string, code: string) => mermaidRender(id, code),
  },
}));

const iconStub = { template: '<span class="icon-stub" />' };
const routerLinkStub = { name: 'RouterLink', template: '<a class="stub-router-link"><slot /></a>' };

const mountedWrappers: VueWrapper[] = [];
function track<T extends VueWrapper>(wrapper: T): T {
  mountedWrappers.push(wrapper);
  return wrapper;
}

const LEAF_COUNT = 68;

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  Object.defineProperty(Element.prototype, 'scrollIntoView', {
    configurable: true,
    writable: true,
    value: vi.fn(),
  });
  mockRoute.mockReturnValue({ path: '/docs/intro/intro', params: { pathMatch: ['intro', 'intro'] } });
});

afterEach(() => {
  for (const wrapper of mountedWrappers.splice(0)) wrapper.unmount();
  document.body.innerHTML = '';
});

describe('DocsSidebar.vue', () => {
  function mountSidebar(routePath: string): VueWrapper {
    mockRoute.mockReturnValue({ path: routePath, params: { pathMatch: ['intro', 'intro'] } });
    return track(mount(DocsSidebar, {
      props: { isOpen: false },
      global: { stubs: { BaseIcon: iconStub, RouterLink: routerLinkStub } },
    }));
  }

  it('render đủ 14 nhóm và 68 link bài học từ docsNavigation', () => {
    const wrapper = mountSidebar('/docs/intro/intro');
    expect(wrapper.findAll('a.stub-router-link')).toHaveLength(LEAF_COUNT);
    expect(wrapper.text()).toContain('NHÓM SẮP XẾP');
    expect(wrapper.text()).toContain('THỰC HÀNH & TỔNG KẾT');
    expect(wrapper.text()).toContain('Giới thiệu & Hướng dẫn');
  });

  it('highlight đúng item active khi route khớp chính xác', () => {
    const wrapper = mountSidebar('/docs/sorting/bubble-sort');
    const active = wrapper.findAll('a.sidebar-item-active');
    expect(active).toHaveLength(1);
    expect(active[0].text()).toContain('Sắp xếp Nổi bọt');
  });

  it('highlight đúng item active khi route có trailing slash (DC-012)', () => {
    const wrapper = mountSidebar('/docs/sorting/bubble-sort/');
    const active = wrapper.findAll('a.sidebar-item-active');
    expect(active).toHaveLength(1);
    expect(active[0].text()).toContain('Sắp xếp Nổi bọt');
  });

  it('không highlight khi route thuộc bài khác', () => {
    const wrapper = mountSidebar('/docs/intro/khong-ton-tai');
    expect(wrapper.findAll('a.sidebar-item-active')).toHaveLength(0);
  });
});

describe('DocsSidebarItem.vue', () => {
  const leafItem: NavItem = { id: 'leaf', title: 'Bài lá', path: '/docs/a/b' };

  function mountLeaf(currentRoute: string): VueWrapper {
    return track(mount(DocsSidebarItem, {
      props: { item: leafItem, currentRoute },
      global: { stubs: { BaseIcon: iconStub, RouterLink: routerLinkStub } },
    }));
  }

  it('isCurrentRoute = true khi path khớp chính xác', () => {
    const wrapper = mountLeaf('/docs/a/b');
    expect(wrapper.find('a.sidebar-item-active').exists()).toBe(true);
  });

  it('isCurrentRoute = true khi route có trailing slash (path + "/")', () => {
    const wrapper = mountLeaf('/docs/a/b/');
    expect(wrapper.find('a.sidebar-item-active').exists()).toBe(true);
  });

  it('isCurrentRoute = false khi path khác', () => {
    const wrapper = mountLeaf('/docs/a/c');
    expect(wrapper.find('a.sidebar-item-active').exists()).toBe(false);
  });

  it('click link lá emit link-clicked', async () => {
    const wrapper = mountLeaf('/docs/intro/intro');
    await wrapper.find('a.stub-router-link').trigger('click');
    expect(wrapper.emitted('link-clicked')).toBeTruthy();
  });

  const groupItem: NavItem = {
    id: 'grp',
    title: 'Nhóm A',
    children: [
      { id: 'c1', title: 'Con 1', path: '/docs/a/c1' },
      { id: 'c2', title: 'Con 2', path: '/docs/a/c2' },
    ],
  };

  function mountGroup(currentRoute: string): VueWrapper {
    return track(mount(DocsSidebarItem, {
      props: { item: groupItem, currentRoute },
      global: { stubs: { BaseIcon: iconStub, RouterLink: routerLinkStub } },
    }));
  }

  it('render children khi group đang mở', () => {
    const wrapper = mountGroup('/docs/intro/intro');
    expect(wrapper.text()).toContain('Con 1');
    expect(wrapper.text()).toContain('Con 2');
  });

  it('click group header → collapse (children ẩn) và lưu localStorage', async () => {
    const wrapper = mountGroup('/docs/intro/intro');
    const header = wrapper.find('[role="button"]');
    expect(header.attributes('aria-expanded')).toBe('true');
    await header.trigger('click');
    expect(header.attributes('aria-expanded')).toBe('false');
    expect(wrapper.find('ul').attributes('style')).toContain('display: none');
    expect(localStorage.getItem('docs-sidebar-collapsed')).toBe(JSON.stringify(['grp']));
  });

  it('click lần nữa → expand lại và gỡ khỏi localStorage', async () => {
    const wrapper = mountGroup('/docs/intro/intro');
    const header = wrapper.find('[role="button"]');
    await header.trigger('click');
    await header.trigger('click');
    expect(header.attributes('aria-expanded')).toBe('true');
    expect(wrapper.find('ul').attributes('style') ?? '').not.toContain('display: none');
    expect(localStorage.getItem('docs-sidebar-collapsed')).toBe('[]');
  });

  it('remount với localStorage đã collapse → group đóng (DC-021 giữ state)', () => {
    localStorage.setItem('docs-sidebar-collapsed', JSON.stringify(['grp']));
    const wrapper = mountGroup('/docs/intro/intro');
    expect(wrapper.find('[role="button"]').attributes('aria-expanded')).toBe('false');
    expect(wrapper.find('ul').attributes('style')).toContain('display: none');
  });

  it('group chứa route active luôn mở dù localStorage đánh dấu collapse (auto-open)', () => {
    localStorage.setItem('docs-sidebar-collapsed', JSON.stringify(['grp']));
    const wrapper = mountGroup('/docs/a/c1');
    expect(wrapper.find('[role="button"]').attributes('aria-expanded')).toBe('true');
    expect(wrapper.find('ul').attributes('style') ?? '').not.toContain('display: none');
  });

  it('không thể collapse group đang chứa route active (auto-open thắng)', async () => {
    const wrapper = mountGroup('/docs/a/c1');
    const header = wrapper.find('[role="button"]');
    await header.trigger('click');
    expect(header.attributes('aria-expanded')).toBe('true');
    expect(wrapper.find('ul').attributes('style') ?? '').not.toContain('display: none');
  });
});

describe('DocsLayout.vue', () => {
  const sidebarStub = {
    name: 'DocsSidebar',
    props: ['isOpen'],
    template: '<aside class="stub-sidebar" :data-is-open="String(isOpen)"></aside>',
  };

  function mountLayout(): { wrapper: VueWrapper; routeState: { path: string; params: { pathMatch: string[] } } } {
    const routeState = reactive({ path: '/docs/intro/intro', params: { pathMatch: [] as string[] } });
    mockRoute.mockReturnValue(routeState);
    const wrapper = track(mount(DocsLayout, {
      global: { stubs: { BaseIcon: iconStub, DocsSidebar: sidebarStub } },
      slots: { default: '<p class="layout-content">Nội dung test</p>' },
    }));
    return { wrapper, routeState };
  }

  it('render hamburger mở menu mobile + nội dung slot', () => {
    const { wrapper } = mountLayout();
    const hamburger = wrapper.find('button[aria-label="Mở menu tài liệu"]');
    expect(hamburger.exists()).toBe(true);
    expect(hamburger.attributes('aria-expanded')).toBe('false');
    expect(wrapper.text()).toContain('Nội dung test');
  });

  it('click hamburger → drawer mở (isMobileSidebarOpen true) + overlay xuất hiện (DC-001)', async () => {
    const { wrapper } = mountLayout();
    await wrapper.find('button[aria-label="Mở menu tài liệu"]').trigger('click');
    expect(wrapper.find('aside.stub-sidebar').attributes('data-is-open')).toBe('true');
    expect(wrapper.find('button[aria-label="Mở menu tài liệu"]').attributes('aria-expanded')).toBe('true');
    expect(wrapper.find('div.fixed').exists()).toBe(true);
  });

  it('click overlay → drawer đóng', async () => {
    const { wrapper } = mountLayout();
    await wrapper.find('button[aria-label="Mở menu tài liệu"]').trigger('click');
    await wrapper.find('div.fixed').trigger('click');
    expect(wrapper.find('aside.stub-sidebar').attributes('data-is-open')).toBe('false');
    expect(wrapper.find('div.fixed').exists()).toBe(false);
  });

  it('đổi route → drawer tự đóng', async () => {
    const { wrapper, routeState } = mountLayout();
    await wrapper.find('button[aria-label="Mở menu tài liệu"]').trigger('click');
    expect(wrapper.find('aside.stub-sidebar').attributes('data-is-open')).toBe('true');
    routeState.path = '/docs/intro/big-o';
    await nextTick();
    expect(wrapper.find('aside.stub-sidebar').attributes('data-is-open')).toBe('false');
  });
});

describe('DocsTableOfContents.vue', () => {
  const headings = [
    { id: 'gioi-thieu', title: 'Giới thiệu', level: 2 },
    { id: 'cach-dung', title: 'Cách dùng', level: 3 },
    { id: 'ket-luan', title: 'Kết luận', level: 2 },
  ];

  function mountToc(): VueWrapper {
    document.body.innerHTML = '<h2 id="gioi-thieu"></h2><h3 id="cach-dung"></h3><h2 id="ket-luan"></h2>';
    return track(mount(DocsTableOfContents, {
      props: { headings },
      attachTo: document.body,
    }));
  }

  it('render danh sách heading từ props', () => {
    const wrapper = mountToc();
    const links = wrapper.findAll('a');
    expect(links.map(l => l.text())).toEqual(['Giới thiệu', 'Cách dùng', 'Kết luận']);
    expect(links[0].attributes('href')).toBe('#gioi-thieu');
  });

  it('heading level 3 được thụt lề pl-4', () => {
    const wrapper = mountToc();
    const items = wrapper.findAll('li');
    expect(items[1].classes()).toContain('pl-4');
    expect(items[0].classes()).not.toContain('pl-4');
  });

  it('click item → scrollIntoView được gọi, KHÔNG history.pushState (DC-002)', async () => {
    const scrollSpy = vi.fn();
    Object.defineProperty(Element.prototype, 'scrollIntoView', {
      configurable: true,
      writable: true,
      value: scrollSpy,
    });
    const pushStateSpy = vi.spyOn(history, 'pushState');
    const wrapper = mountToc();
    await wrapper.find('a[href="#gioi-thieu"]').trigger('click');
    expect(scrollSpy).toHaveBeenCalledWith({ behavior: 'smooth' });
    expect(pushStateSpy).not.toHaveBeenCalled();
    expect(wrapper.find('a[aria-current="true"]').attributes('href')).toBe('#gioi-thieu');
  });
});

describe('DocsMarkdownRenderer.vue', () => {
  beforeEach(() => {
    mermaidRender.mockImplementation(async () => ({ svg: '<svg class="mock-mermaid-svg"></svg>' }));
  });

  function mountRenderer(rawMarkdown: string): VueWrapper {
    return track(mount(DocsMarkdownRenderer, {
      props: { rawMarkdown, prevDoc: null, nextDoc: null },
      global: { stubs: { BaseIcon: iconStub, RouterLink: routerLinkStub } },
    }));
  }

  it('render markdown đơn giản + title/description từ frontmatter', async () => {
    const md = [
      '---',
      'title: Bài kiểm tra render',
      'description: Mô tả ngắn gọn',
      '---',
      '',
      '## Mở đầu',
      '',
      'Nội dung chính của bài.',
    ].join('\n');
    const wrapper = mountRenderer(md);
    await flushPromises();
    expect(wrapper.text()).toContain('Bài kiểm tra render');
    expect(wrapper.text()).toContain('Mô tả ngắn gọn');
    expect(wrapper.text()).toContain('Nội dung chính của bài.');
    expect(wrapper.find('h2').attributes('id')).toBe('mo-au');
  });

  it('heading id trùng → dedup suffix -1/-2 (DC-010)', async () => {
    const md = ['## Giới thiệu', '## Giới thiệu', '## Giới thiệu'].join('\n');
    const wrapper = mountRenderer(md);
    await flushPromises();
    const ids = wrapper.findAll('h2').map(h => h.attributes('id'));
    expect(ids).toEqual(['gioi-thieu', 'gioi-thieu-1', 'gioi-thieu-2']);
    const firstEmit = wrapper.emitted('headings-parsed')?.[0]?.[0] as { id: string }[] | undefined;
    expect(firstEmit?.map(h => h.id)).toEqual(ids);
  });

  it('link .md → href #/docs/<slug>, link tuyệt đối → # + path (DC-019)', async () => {
    const md = [
      '[Xem thêm](other.md)',
      '[Xem từ đầu](./intro.md)',
      '[Trang chủ](/docs/intro/intro)',
      '[Extern](https://example.com)',
      '[Mail](mailto:a@b.c)',
    ].join('\n\n');
    const wrapper = mountRenderer(md);
    await flushPromises();
    const hrefs = wrapper.findAll('a.docs-link').map(a => a.attributes('href'));
    expect(hrefs).toEqual([
      '#/docs/other',
      '#/docs/intro',
      '#/docs/intro/intro',
      'https://example.com',
      'mailto:a@b.c',
    ]);
  });

  it('click link nội bộ #/docs/... → KHÔNG preventDefault (router điều hướng); anchor #section → preventDefault + scroll (DC-027)', async () => {
    const md = [
      '[Trang chủ](/docs/intro/intro)',
      '',
      '## Mở đầu',
      '',
      'Nội dung.',
    ].join('\n');
    const scrollSpy = vi.fn();
    Object.defineProperty(Element.prototype, 'scrollIntoView', {
      configurable: true,
      writable: true,
      value: scrollSpy,
    });
    const wrapper = track(mount(DocsMarkdownRenderer, {
      props: { rawMarkdown: md, prevDoc: null, nextDoc: null },
      global: { stubs: { BaseIcon: iconStub, RouterLink: routerLinkStub } },
      attachTo: document.body,
    }));
    await flushPromises();

    const docLink = wrapper.find('a.docs-link');
    const docEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    docLink.element.dispatchEvent(docEvent);
    expect(docEvent.defaultPrevented).toBe(false);

    const anchor = wrapper.find('a[href="#mo-au"]');
    const anchorEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    anchor.element.dispatchEvent(anchorEvent);
    expect(anchorEvent.defaultPrevented).toBe(true);
    expect(scrollSpy).toHaveBeenCalledWith({ behavior: 'smooth' });
  });

  it('mermaid render thành công → SVG từ mermaid được chèn (mock, jsdom-safe)', async () => {
    const wrapper = mountRenderer('```mermaid\nflowchart TD\n  A --> B\n```');
    await flushPromises();
    const diagram = wrapper.find('.mermaid-diagram');
    expect(diagram.exists()).toBe(true);
    expect(diagram.element.innerHTML).toContain('mock-mermaid-svg');
    expect(mermaidRender).toHaveBeenCalled();
  });

  it('data-mermaid-code round-trip: decode(encode(code)) === code gốc (DC-T2)', async () => {
    const code = 'flowchart TD\n  A["A & B"] --> B["<x>"]';
    const wrapper = mountRenderer('```mermaid\n' + code + '\n```');
    await flushPromises();
    const encoded = wrapper.find('.mermaid-diagram').attributes('data-mermaid-code');
    expect(encoded).toBeTruthy();
    expect(decodeURIComponent(encoded as string)).toBe(code);
  });

  it('encodeURIComponent round-trip thuần cho chuỗi có ký tự đặc biệt (DC-T2)', () => {
    const samples = [
      'flowchart TD\n  A --> B',
      'graph LR\n  A["Nút & <html> \\"nháy\\""] --> B',
      'sequenceDiagram\n  participant A as Máy chủ #1',
      'classDiagram\n  class BankAccount {\n    -balance: decimal\n    +Deposit(amount): void\n  }',
    ];
    for (const sample of samples) {
      expect(decodeURIComponent(encodeURIComponent(sample))).toBe(sample);
    }
  });

  it('message lỗi mermaid được escape — <img onerror> không xuất hiện raw (DC-009)', async () => {
    mermaidRender.mockRejectedValueOnce(new Error('Lỗi cú pháp gần <img src=x onerror="alert(1)">'));
    const wrapper = mountRenderer('```mermaid\nflowchart TD\n  A --> B\n```');
    await flushPromises();
    const html = wrapper.find('.mermaid-diagram').element.innerHTML;
    expect(html).toContain('&lt;img');
    expect(html).not.toContain('<img');
    const pre = wrapper.find('.mermaid-diagram pre');
    expect(pre.element.querySelector('img')).toBeNull();
    expect(pre.text()).toContain('<img src=x onerror="alert(1)">');
    expect(html).toContain('Lỗi cú pháp Mermaid');
  });
});

describe('DocsView.vue', () => {
  function mountDocsView(path: string, pathMatch: string[]): VueWrapper {
    mockRoute.mockReturnValue({ path, params: { pathMatch } });
    return track(mount(DocsView, {
      global: { stubs: { BaseIcon: iconStub, RouterLink: routerLinkStub } },
    }));
  }

  // import.meta.glob(?raw) transform trong vitest là async thật (vượt microtask)
  // → chờ cho tới khi view vào 1 trong 2 trạng thái cuối: renderer hoặc not-found.
  async function settleDocs(wrapper: VueWrapper): Promise<void> {
    await vi.waitFor(() => {
      const hasRenderer = wrapper.findComponent(DocsMarkdownRenderer).exists();
      const hasNotFound = wrapper.text().includes('Không tìm thấy nội dung');
      expect(hasRenderer || hasNotFound).toBe(true);
    });
  }

  function realContent(relPath: string): string {
    return readFileSync(join(__dirname, '..', 'content', relPath), 'utf8');
  }

  it('slug không tồn tại → màn hình "Không tìm thấy nội dung"', async () => {
    const wrapper = mountDocsView('/docs/khong-ton-tai/xyz', ['khong-ton-tai', 'xyz']);
    await settleDocs(wrapper);
    expect(wrapper.text()).toContain('Không tìm thấy nội dung');
  });

  it('/docs/intro (topic-level) → resolve nội dung bài ĐẦU của topic intro (DC-007)', async () => {
    const wrapper = mountDocsView('/docs/intro', ['intro']);
    await settleDocs(wrapper);
    const renderer = wrapper.findComponent(DocsMarkdownRenderer);
    expect(renderer.exists()).toBe(true);
    expect(renderer.props('rawMarkdown')).toBe(realContent('intro/intro.md'));
  });

  it('/docs (pathMatch rỗng) → fallback bài đầu toàn nav (intro/intro)', async () => {
    const wrapper = mountDocsView('/docs', []);
    await settleDocs(wrapper);
    expect(wrapper.findComponent(DocsMarkdownRenderer).props('rawMarkdown')).toBe(realContent('intro/intro.md'));
  });

  it('/docs/intro/ (trailing slash) → lọc segment rỗng rồi resolve topic (DC-012)', async () => {
    const wrapper = mountDocsView('/docs/intro/', ['intro', '']);
    await settleDocs(wrapper);
    expect(wrapper.findComponent(DocsMarkdownRenderer).props('rawMarkdown')).toBe(realContent('intro/intro.md'));
  });

  it('/docs/trees → resolve bài đầu của nhóm trees (heap-priority-queue)', async () => {
    const wrapper = mountDocsView('/docs/trees', ['trees']);
    await settleDocs(wrapper);
    expect(wrapper.findComponent(DocsMarkdownRenderer).props('rawMarkdown')).toBe(realContent('trees/heap-priority-queue.md'));
  });

  it('prevDoc/nextDoc đúng theo thứ tự nav (intro/intro → next = big-o)', async () => {
    const wrapper = mountDocsView('/docs/intro/intro', ['intro', 'intro']);
    await settleDocs(wrapper);
    const renderer = wrapper.findComponent(DocsMarkdownRenderer);
    expect(renderer.props('prevDoc')).toBeNull();
    expect(renderer.props('nextDoc')).toEqual({ title: 'Độ phức tạp & Ký hiệu O lớn', path: '/docs/intro/big-o' });
  });

  it('slug topic không tồn tại (/docs/search) → redirect về /docs/intro/intro (DC-029)', async () => {
    const wrapper = mountDocsView('/docs/search', ['search']);
    await vi.waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/docs/intro/intro'));
    wrapper.unmount();
  });

  it('đổi route.path → load lại markdown mà không cần remount (DC-030)', async () => {
    const routeState = reactive({ path: '/docs/intro/intro', params: { pathMatch: ['intro', 'intro'] } });
    mockRoute.mockReturnValue(routeState);
    const wrapper = track(mount(DocsView, {
      global: { stubs: { BaseIcon: iconStub, RouterLink: routerLinkStub } },
    }));
    await settleDocs(wrapper);
    expect(wrapper.findComponent(DocsMarkdownRenderer).props('rawMarkdown')).toBe(realContent('intro/intro.md'));

    routeState.path = '/docs/intro/big-o';
    routeState.params = { pathMatch: ['intro', 'big-o'] };
    await vi.waitFor(() => {
      expect(wrapper.findComponent(DocsMarkdownRenderer).props('rawMarkdown')).toBe(realContent('intro/big-o.md'));
    });
  });

  it('nav chứa đúng nhóm Cây nâng cao (Advanced Trees) (DC-023)', () => {
    const advanced = docsNavigation
      .flatMap(g => g.children ?? [])
      .find(c => c.path === '/docs/tree-graph/advanced-trees');
    expect(advanced?.title).toBe('Cây nâng cao (Advanced Trees)');
  });
});
