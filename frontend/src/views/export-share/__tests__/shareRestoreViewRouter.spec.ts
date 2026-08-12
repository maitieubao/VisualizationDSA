// @vitest-environment jsdom

// EX-002/EX-007: Kiểm tra watcher route của ShareRestoreView với ROUTER THẬT
// (vue-router không bị mock) — đổi query ?state= tại chỗ phải khôi phục lại.

import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import ShareRestoreView from '../ShareRestoreView.vue';
import { WorkspaceStateCompressor } from '../../../features/export-share';
import type { WorkspaceState } from '../../../features/export-share/types/export-share.types';

const sampleState: WorkspaceState = {
  algorithmId: 'dijkstra-shortest-path',
  layoutNodes: [
    { id: 'A', x: 50, y: 100 },
    { id: 'B', x: 250, y: 100 },
    { id: 'C', x: 150, y: 250 },
  ],
  currentStepIndex: 2,
};

function buildPayload(state: WorkspaceState): string {
  return WorkspaceStateCompressor.serializeState(state);
}

async function mountWithRouter(queryState?: string) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/s',
        name: 'share-restore',
        component: ShareRestoreView,
      },
    ],
  });

  if (queryState !== undefined) {
    await router.push({ path: '/s', query: { state: queryState } });
  } else {
    await router.push('/s');
  }
  await router.isReady();

  const wrapper = mount(ShareRestoreView, {
    global: { plugins: [router] },
  });

  return { wrapper, router };
}

describe('ShareRestoreView — real router watcher (EX-002/EX-007)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('should restore when ?state= query changes in place', async () => {
    const { wrapper, router } = await mountWithRouter();
    expect(wrapper.find('.share-restore-error').exists()).toBe(true);

    const payload = buildPayload(sampleState);
    await router.replace({ path: '/s', query: { state: payload } });
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(wrapper.find('.share-restore-error').exists()).toBe(false);
    expect(wrapper.text()).toContain('PHÒNG LAB ĐƯỢC CHIA SẺ');
    expect(wrapper.text()).toContain('dijkstra-shortest-path');

    await router.replace({ path: '/s', query: {} });
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(wrapper.find('.share-restore-error').exists()).toBe(true);
    expect(wrapper.text()).toContain('thiếu tham số ?state=');

    wrapper.unmount();
  });

  it('should restore a valid payload immediately at initial load', async () => {
    const { wrapper } = await mountWithRouter(buildPayload(sampleState));

    expect(wrapper.find('.share-restore-error').exists()).toBe(false);
    expect(wrapper.text()).toContain('3 node');

    wrapper.unmount();
  });
});
