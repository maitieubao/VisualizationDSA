// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import AnimControlPanel from '../components/AnimControlPanel.vue';
import { useAnimationStore } from '../store/useAnimationStore';
import { generateDummyBubbleSortResult } from '../services/algorithmApi';
import type { AlgorithmResult } from '../types/animation.types';

function createResult(): AlgorithmResult {
  return generateDummyBubbleSortResult([5, 3, 8, 1, 9]);
}

function mountPanel() {
  return mount(AnimControlPanel, {
    global: {
      stubs: {
        VcrButtonsRow: {
          props: ['isFirstFrame', 'isLastFrame', 'isUninitialized', 'isPlaying', 'isFinished'],
          template:
            '<div class="stub-buttons"><button class="stub-play-btn" @click="$emit(\'togglePlay\')"></button></div>',
        },
        AnimTimelineSlider: {
          props: [
            'currentIndex',
            'totalSteps',
            'disabled',
            'progressStyle',
            'tooltipVisible',
            'tooltipX',
            'tooltipStep',
            'tooltipText',
          ],
          template: '<div class="stub-slider"><input type="range" class="stub-range" :disabled="disabled" /></div>',
        },
      },
    },
  });
}

describe('EC-041 — AnimControlPanel (mount)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    vi.useFakeTimers();
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      return setTimeout(() => cb(performance.now()), 16) as unknown as number;
    });
    vi.stubGlobal('cancelAnimationFrame', (id: number) => clearTimeout(id));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('E-Lecture lock: class .disabled-panel + slider/speed input bị vô hiệu', async () => {
    const store = useAnimationStore();
    store.loadResult(createResult());
    const wrapper = mountPanel();

    expect(wrapper.find('.control-panel-container').classes()).not.toContain('disabled-panel');

    store.setInteractionLocked(true);
    await wrapper.vm.$nextTick();

    const panel = wrapper.find('.control-panel-container');
    expect(panel.classes()).toContain('disabled-panel');
    expect(wrapper.find('.speed-number-input').attributes('disabled')).toBeDefined();
    expect(wrapper.find('.stub-range').attributes('disabled')).toBeDefined();
  });

  it('Replay khi FINISHED: click play → goToFrame(0) + play()', async () => {
    const store = useAnimationStore();
    const result = createResult();
    store.loadResult(result);
    store.scrubTo(result.frames.length - 1);
    expect(store.isFinished).toBe(true);

    const wrapper = mountPanel();
    await wrapper.find('.stub-play-btn').trigger('click');

    expect(store.currentIndex).toBe(0);
    expect(store.isPlaying).toBe(true);
  });

  it('clamp tốc độ nhập tay theo biên min/max của input', async () => {
    const store = useAnimationStore();
    store.loadResult(createResult());
    const wrapper = mountPanel();
    const input = wrapper.find('.speed-number-input');
    const min = Number(input.attributes('min'));
    const max = Number(input.attributes('max'));

    await input.setValue('9999');
    await input.trigger('change');
    expect(store.playbackSpeed).toBe(max);

    await input.setValue('0.0001');
    await input.trigger('change');
    expect(store.playbackSpeed).toBe(min);
  });

  it('giá trị tốc độ không hợp lệ (0/NaN) bị revert, store không đổi', async () => {
    const store = useAnimationStore();
    store.loadResult(createResult());
    const wrapper = mountPanel();
    store.setSpeed(1.5);
    const input = wrapper.find('.speed-number-input');

    await input.setValue('0');
    await input.trigger('change');
    expect(store.playbackSpeed).toBe(1.5);

    await input.setValue('abc');
    await input.trigger('change');
    expect(store.playbackSpeed).toBe(1.5);
  });

  it('gỡ listener keydown toàn cục khi unmount (cleanup hotkey)', () => {
    const store = useAnimationStore();
    store.loadResult(createResult());
    const removeSpy = vi.spyOn(window, 'removeEventListener');

    const wrapper = mountPanel();
    wrapper.unmount();

    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    removeSpy.mockRestore();
  });
});
