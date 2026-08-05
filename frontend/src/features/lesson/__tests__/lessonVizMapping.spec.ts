import { describe, it, expect } from 'vitest';
import { resolveLessonViz, parseSandboxDemoValidated } from '../utils/visualizerMap';
import { parseSandboxDemo } from '../utils/sandboxConfig';
import { visualizerMap } from '../utils/visualizerMap';

describe('resolveLessonViz — chọn trực quan hóa theo sandbox', () => {
  it('TC-A2.1: sorting + {"demo":"bubble-sort"} → demoId bubble-sort', () => {
    const r = resolveLessonViz('sorting', '{"demo":"bubble-sort"}');
    expect(r.demoId).toBe('bubble-sort');
    expect(r.component).toBeNull();
  });

  it('TC-A2.2: searching + {"demo":"binary-search"} → demoId binary-search', () => {
    const r = resolveLessonViz('searching', '{"demo":"binary-search"}');
    expect(r.demoId).toBe('binary-search');
  });

  it('TC-A2.3: dsa + {"demo":"stack"} → demoId stack', () => {
    const r = resolveLessonViz('dsa', '{"demo":"stack"}');
    expect(r.demoId).toBe('stack');
  });

  it('TC-A2.4: sandboxConfig rỗng → fallback demo theo sandboxType (sorting/searching), còn dsa → empty state', () => {
    expect(resolveLessonViz('sorting', '').demoId).toBe('bubble-sort');
    expect(resolveLessonViz('searching', '{}').demoId).toBe('binary-search');
    // dsa chung chung không có demo → empty state (tránh mở demo sai chủ đề)
    const dsa = resolveLessonViz('dsa', 'not-json');
    expect(dsa.demoId).toBeNull();
    expect(dsa.component).toBeNull();
    const empty = resolveLessonViz('', '');
    expect(empty.demoId).toBeNull();
    expect(empty.component).toBeNull();
  });

  it('TC-A2.4b: demo không hợp lệ trong config → empty state (không fallback sai chủ đề)', () => {
    const r = resolveLessonViz('dsa', '{"demo":"khong-ton-tai"}');
    expect(r.demoId).toBeNull();
    expect(r.component).toBeNull();
  });

  it('TC-A2.6: sandboxType graph/oop/solid → component tĩnh, demoId null', () => {
    const graph = resolveLessonViz('graph', '');
    expect(graph.demoId).toBeNull();
    expect(graph.component).not.toBeNull();
    expect(visualizerMap['graph']).toBeDefined();

    const oop = resolveLessonViz('oop', '');
    expect(oop.component).not.toBeNull();
  });

  it('parseSandboxDemo: chỉ chấp nhận demo tồn tại trong playgroundAlgoDemos', () => {
    expect(parseSandboxDemoValidated('{"demo":"binary-search"}')).toBe('binary-search');
    expect(parseSandboxDemoValidated('{"demo":"nope"}')).toBeNull();
    expect(parseSandboxDemoValidated('')).toBeNull();
    expect(parseSandboxDemoValidated('{broken')).toBeNull();
  });

  it('parseSandboxDemo (util chung): parse thuần không validate', () => {
    expect(parseSandboxDemo('{"demo":"stack"}')).toBe('stack');
    expect(parseSandboxDemo('{"demo":"nope"}')).toBe('nope');
    expect(parseSandboxDemo('')).toBeNull();
    expect(parseSandboxDemo('{broken')).toBeNull();
  });
});
