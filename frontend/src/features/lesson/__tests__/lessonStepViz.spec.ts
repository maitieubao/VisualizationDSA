// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { useAlgoPlaygroundStore } from '../../algo-playground/store/useAlgoPlaygroundStore';
import BaseIcon from '../../../shared/components/BaseIcon.vue';

// AlgoPlaygroundWorkspace là component nặng (Monaco/splitpanes) — stub lại cho test
// nhưng vẫn giữ prop demoId để kiểm tra giá trị truyền vào.
vi.mock('../../algo-playground/components/AlgoPlaygroundWorkspace.vue', () => ({
  default: {
    name: 'AlgoPlaygroundWorkspaceStub',
    props: ['demoId'],
    template: '<div class="algo-stub" />',
  },
}));

import LessonStepViz from '../../../views/lesson/components/LessonStepViz.vue';

let wrapper: VueWrapper | null = null;

function mountViz(sandboxType: string, sandboxConfig: string): VueWrapper {
  return mount(LessonStepViz, {
    props: { sandboxType, sandboxConfig },
    global: { components: { BaseIcon } },
  });
}

describe('LessonStepViz.vue — demo đúng theo bài học', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  it('TC-A2.7: buộc tải đúng demo dù store playground còn demo cũ (persist localStorage)', () => {
    const algoStore = useAlgoPlaygroundStore();
    algoStore.loadDemo('bubble-sort'); // mô phỏng trạng thái persist từ bài học trước

    wrapper = mountViz('dsa', '{"demo":"stack"}');

    expect(algoStore.demoId).toBe('stack');
    expect(algoStore.code).toContain('Stack'); // code đã được load theo demo mới
  });

  it('TC-A2.8: emit watched khi mount (đánh dấu đã xem trực quan hóa)', () => {
    wrapper = mountViz('searching', '{"demo":"binary-search"}');
    expect(wrapper.emitted('watched')).toBeTruthy();
  });

  it('TC-A2.9: demo trùng với store thì không reset code (2 bài cùng demo liên tiếp)', () => {
    const algoStore = useAlgoPlaygroundStore();
    algoStore.loadDemo('binary-search');
    const codeBefore = algoStore.code;

    wrapper = mountViz('dsa', '{"demo":"binary-search"}');

    expect(algoStore.demoId).toBe('binary-search');
    expect(algoStore.code).toBe(codeBefore);
  });

  it('TC-A2.10: không có demo trong config → fallback theo sandboxType, không crash', () => {
    wrapper = mountViz('sorting', '');
    expect(wrapper.find('.algo-stub').exists()).toBe(true);
  });
});
