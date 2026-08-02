import { describe, it, expect } from 'vitest';

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
