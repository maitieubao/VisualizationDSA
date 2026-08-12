// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import {
  playgroundDemos,
  getPlaygroundDemo,
  playgroundDemoIds,
} from '../demos/playgroundDemos';

describe('playgroundDemos', () => {
  it('should register all core algorithm demos', () => {
    expect(playgroundDemoIds).toContain('bubble-sort');
    expect(playgroundDemoIds).toContain('quick-sort');
    expect(playgroundDemoIds).toContain('merge-sort');
    expect(playgroundDemoIds).toContain('binary-search');
    expect(playgroundDemoIds).toContain('bfs');
    expect(playgroundDemoIds).toContain('dfs');
    expect(playgroundDemoIds).toContain('dijkstra');
  });

  it('should return undefined for unknown demo id', () => {
    expect(getPlaygroundDemo('not-a-real-demo')).toBeUndefined();
  });

  it.each(playgroundDemoIds)('demo %s should have valid source', (id) => {
    const demo = playgroundDemos[id];
    expect(demo).toBeDefined();
    expect(demo.title.length).toBeGreaterThan(0);
    expect(demo.description.length).toBeGreaterThan(0);
    expect(demo.source.html).toContain('<h1');
    expect(demo.source.js).toContain('function run()');
    expect(demo.source.css).toContain('body');
  });
});

describe('HT-032 (P3): Demo JS thực thi được (bắt syntax error)', () => {
  beforeEach(() => {
    document.body.innerHTML = '<pre id="output"></pre>';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it.each(playgroundDemoIds)(
    'demo %s: new Function(js) chạy không văng lỗi syntax/runtime và output có nội dung',
    (id) => {
      const demo = playgroundDemos[id];
      const execute = new Function(demo.source.js);
      expect(() => execute()).not.toThrow();
      const output = document.getElementById('output');
      expect(output).not.toBeNull();
      expect((output!.textContent ?? '').length).toBeGreaterThan(0);
    },
  );

  it('bubble-sort chạy ra đúng kết quả sắp xếp', () => {
    const demo = playgroundDemos['bubble-sort'];
    new Function(demo.source.js)();
    expect(document.getElementById('output')!.textContent).toContain('Kết quả: [2, 3, 4, 5, 8]');
  });

  it('binary-search chạy ra đúng chỉ số tìm thấy', () => {
    const demo = playgroundDemos['binary-search'];
    new Function(demo.source.js)();
    expect(document.getElementById('output')!.textContent).toContain('Tìm 9 → chỉ số 4');
  });

  it('dijkstra chạy ra đúng khoảng cách từ đỉnh nguồn', () => {
    const demo = playgroundDemos['dijkstra'];
    new Function(demo.source.js)();
    const text = document.getElementById('output')!.textContent ?? '';
    expect(text).toContain('A → 0');
    expect(text).toContain('B → 4');
    expect(text).toContain('D → 9');
  });

  it('mọi demo đều khai báo hàm run() trước runner tự động', () => {
    for (const id of playgroundDemoIds) {
      const js = playgroundDemos[id].source.js;
      expect(js).toMatch(/function\s+run\s*\(/);
      expect(js).toContain('output.textContent = run();');
    }
  });
});
