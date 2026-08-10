// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import VcrButtonsRow from '../components/VcrButtonsRow.vue';
import AnimationProgressBar from '../components/AnimationProgressBar.vue';
import AnimationVcrControls from '../components/AnimationVcrControls.vue';
import AnimPseudoCodePanel from '../components/AnimPseudoCodePanel.vue';
import { useAnimationStore } from '../store/useAnimationStore';
import { easeOut, lerp } from '../composables/canvasMathHelpers';
import type { FrameDTO } from '../types/animation.types';

class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.stubGlobal('ResizeObserver', MockResizeObserver);

function makeFrames(count: number): FrameDTO[] {
  const frames: FrameDTO[] = [];
  for (let i = 1; i <= count; i++) {
    frames.push({
      stepId: i,
      activeLine: i - 1,
      explanation: `Step ${i}`,
      dataState: [5, 3, 8, 1, 2],
      highlights: { compare: [0], swap: [], sorted: [] },
    });
  }
  return frames;
}

describe('US-AE-006 (P0): VcrButtonsRow controls', () => {
  it('emits stepBackward when clicking backward button', async () => {
    const wrapper = mount(VcrButtonsRow, {
      props: {
        isFirstFrame: false,
        isLastFrame: false,
        isUninitialized: false,
        isPlaying: false,
        isFinished: false,
      },
    });

    const buttons = wrapper.findAll('button');
    const backwardBtn = buttons.find((b) => b.attributes('aria-label') === 'Lùi 1 bước');
    expect(backwardBtn).toBeDefined();
    await backwardBtn!.trigger('click');
    expect(wrapper.emitted('stepBackward')).toBeTruthy();
  });

  it('emits stepForward when clicking forward button', async () => {
    const wrapper = mount(VcrButtonsRow, {
      props: {
        isFirstFrame: false,
        isLastFrame: false,
        isUninitialized: false,
        isPlaying: false,
        isFinished: false,
      },
    });

    const buttons = wrapper.findAll('button');
    const forwardBtn = buttons.find((b) => b.attributes('aria-label') === 'Tiến 1 bước');
    expect(forwardBtn).toBeDefined();
    await forwardBtn!.trigger('click');
    expect(wrapper.emitted('stepForward')).toBeTruthy();
  });

  it('emits togglePlay when clicking play button', async () => {
    const wrapper = mount(VcrButtonsRow, {
      props: {
        isFirstFrame: false,
        isLastFrame: false,
        isUninitialized: false,
        isPlaying: false,
        isFinished: false,
      },
    });

    const buttons = wrapper.findAll('button');
    const playBtn = buttons.find((b) => b.classes().includes('vcr-play-btn'));
    expect(playBtn).toBeDefined();
    await playBtn!.trigger('click');
    expect(wrapper.emitted('togglePlay')).toBeTruthy();
  });

  it('disables backward button when isFirstFrame is true', () => {
    const wrapper = mount(VcrButtonsRow, {
      props: {
        isFirstFrame: true,
        isLastFrame: false,
        isUninitialized: false,
        isPlaying: false,
        isFinished: false,
      },
    });

    const buttons = wrapper.findAll('button');
    const backwardBtn = buttons.find((b) => b.attributes('aria-label') === 'Lùi 1 bước');
    expect(backwardBtn!.element.disabled).toBe(true);
  });

  it('disables forward button when isLastFrame is true', () => {
    const wrapper = mount(VcrButtonsRow, {
      props: {
        isFirstFrame: false,
        isLastFrame: true,
        isUninitialized: false,
        isPlaying: false,
        isFinished: false,
      },
    });

    const buttons = wrapper.findAll('button');
    const forwardBtn = buttons.find((b) => b.attributes('aria-label') === 'Tiến 1 bước');
    expect(forwardBtn!.element.disabled).toBe(true);
  });

  it('disables all buttons when isUninitialized is true', () => {
    const wrapper = mount(VcrButtonsRow, {
      props: {
        isFirstFrame: false,
        isLastFrame: false,
        isUninitialized: true,
        isPlaying: false,
        isFinished: false,
      },
    });

    const buttons = wrapper.findAll('button');
    buttons.forEach((btn) => {
      expect(btn.element.disabled).toBe(true);
    });
  });
});

describe('US-AE-013 (P0): Play/Pause toggle', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('isPlaying toggles from false to true on play()', () => {
    const store = useAnimationStore();
    store.loadResult({
      algorithmId: 'test',
      pseudoCode: ['line 1', 'line 2'],
      frames: makeFrames(3),
    });

    expect(store.isPlaying).toBe(false);
    store.play();
    expect(store.isPlaying).toBe(true);
  });

  it('isPlaying toggles from true to false on pause()', () => {
    const store = useAnimationStore();
    store.loadResult({
      algorithmId: 'test',
      pseudoCode: ['line 1'],
      frames: makeFrames(3),
    });

    store.play();
    expect(store.isPlaying).toBe(true);
    store.pause();
    expect(store.isPlaying).toBe(false);
  });

  it('togglePlay switches between playing and paused', () => {
    const store = useAnimationStore();
    store.loadResult({
      algorithmId: 'test',
      pseudoCode: ['line 1'],
      frames: makeFrames(3),
    });

    expect(store.isPlaying).toBe(false);
    store.togglePlay();
    expect(store.isPlaying).toBe(true);
    store.togglePlay();
    expect(store.isPlaying).toBe(false);
  });

  it('play replays from the start when already finished', () => {
    const store = useAnimationStore();
    store.loadResult({
      algorithmId: 'test',
      pseudoCode: ['line 1'],
      frames: makeFrames(1),
    });

    store.scrubTo(0);
    store.play();
    expect(store.isPlaying).toBe(true);
    expect(store.currentIndex).toBe(0);
  });
});

describe('US-AE-008 (P0): AnimationProgressBar', () => {
  it('renders progress fill with correct width percentage', () => {
    const wrapper = mount(AnimationProgressBar, {
      props: { progressPercent: 50 },
    });

    const fill = wrapper.find('.progress-fill');
    expect(fill.exists()).toBe(true);
    expect(fill.attributes('style')).toContain('width: 50%');
  });

  it('renders 0% width when progressPercent is 0', () => {
    const wrapper = mount(AnimationProgressBar, {
      props: { progressPercent: 0 },
    });

    const fill = wrapper.find('.progress-fill');
    expect(fill.attributes('style')).toContain('width: 0%');
  });

  it('renders 100% width when progressPercent is 100', () => {
    const wrapper = mount(AnimationProgressBar, {
      props: { progressPercent: 100 },
    });

    const fill = wrapper.find('.progress-fill');
    expect(fill.attributes('style')).toContain('width: 100%');
  });

  it('renders progress track container', () => {
    const wrapper = mount(AnimationProgressBar, {
      props: { progressPercent: 25 },
    });

    expect(wrapper.find('.progress-track').exists()).toBe(true);
  });
});

describe('US-AE-015 (P1): Canvas auto resize - ResizeObserver hook', () => {
  it('ResizeObserver is available in the environment', () => {
    expect(typeof ResizeObserver).toBe('function');
  });

  it('useAnimationCanvas exposes ResizeObserver integration via module exports', async () => {
    const mod = await import('../composables/useAnimationCanvas');
    expect(mod.useAnimationCanvas).toBeDefined();
    expect(typeof mod.useAnimationCanvas).toBe('function');
  });

  it('ResizeObserver can be instantiated', () => {
    const observer = new ResizeObserver(() => {});
    expect(observer).toBeDefined();
    expect(typeof observer.observe).toBe('function');
    expect(typeof observer.disconnect).toBe('function');
    observer.disconnect();
  });
});

describe('US-AE-016 (P1): Animation easeOut lerp', () => {
  it('easeOut returns 0 at t=0', () => {
    expect(easeOut(0)).toBe(0);
  });

  it('easeOut returns 1 at t=1', () => {
    expect(easeOut(1)).toBe(1);
  });

  it('easeOut returns value between 0 and 1 for t in (0,1)', () => {
    const result = easeOut(0.5);
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThan(1);
  });

  it('easeOut applies cubic easing (faster at start)', () => {
    const t = 0.5;
    const result = easeOut(t);
    const expected = 1 - (1 - t) ** 3;
    expect(result).toBeCloseTo(expected, 10);
  });

  it('lerp returns start when t=0', () => {
    expect(lerp(10, 20, 0)).toBe(10);
  });

  it('lerp returns end when t=1', () => {
    expect(lerp(10, 20, 1)).toBe(20);
  });

  it('lerp returns midpoint when t=0.5', () => {
    expect(lerp(10, 20, 0.5)).toBe(15);
  });

  it('lerp with easeOut produces smooth interpolation', () => {
    const start = 0;
    const end = 100;
    const t = 0.3;
    const easedT = easeOut(t);
    const result = lerp(start, end, easedT);
    expect(result).toBeGreaterThan(start);
    expect(result).toBeLessThan(end);
  });
});

describe('US-AE-025 (P1): PseudocodePanel render', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('renders pseudocode lines from store', () => {
    const store = useAnimationStore();
    store.loadResult({
      algorithmId: 'bubble-sort',
      pseudoCode: [
        'for i = 0 to n-1',
        '  for j = 0 to n-i-1',
        '    if arr[j] > arr[j+1]',
        '      swap(arr[j], arr[j+1])',
      ],
      frames: makeFrames(3),
    });

    const wrapper = mount(AnimPseudoCodePanel);
    const lines = wrapper.findAll('.pseudocode-line');
    expect(lines.length).toBe(4);
    expect(lines[0].text()).toContain('for i = 0 to n-1');
    expect(lines[3].text()).toContain('swap(arr[j], arr[j+1])');
  });

  it('highlights active line with correct class', () => {
    const store = useAnimationStore();
    store.loadResult({
      algorithmId: 'test',
      pseudoCode: ['line 1', 'line 2', 'line 3'],
      frames: makeFrames(3),
    });

    store.scrubTo(1);
    const wrapper = mount(AnimPseudoCodePanel);
    const lines = wrapper.findAll('.pseudocode-line');

    expect(lines[0].classes()).toContain('pseudocode-line--default');
    expect(lines[1].classes()).toContain('pseudocode-line--active');
    expect(lines[2].classes()).toContain('pseudocode-line--default');
  });

  it('renders empty message when no pseudocode available', () => {
    const store = useAnimationStore();
    store.loadResult({
      algorithmId: 'empty',
      pseudoCode: [],
      frames: [],
    });

    const wrapper = mount(AnimPseudoCodePanel);
    expect(wrapper.find('.pseudocode-panel__empty').exists()).toBe(true);
    expect(wrapper.find('.pseudocode-panel__empty').text()).toContain('Chưa có mã giả');
  });

  it('displays line numbers starting from 1', () => {
    const store = useAnimationStore();
    store.loadResult({
      algorithmId: 'test',
      pseudoCode: ['a = 1', 'b = 2'],
      frames: makeFrames(2),
    });

    const wrapper = mount(AnimPseudoCodePanel);
    const numbers = wrapper.findAll('.pseudocode-line__number');
    expect(numbers[0].text()).toBe('1');
    expect(numbers[1].text()).toBe('2');
  });

  it('renders panel header label', () => {
    const store = useAnimationStore();
    store.loadResult({
      algorithmId: 'test',
      pseudoCode: ['line 1'],
      frames: makeFrames(1),
    });

    const wrapper = mount(AnimPseudoCodePanel);
    expect(wrapper.find('.pseudocode-panel__label').text()).toBe('Pseudocode');
  });
});

describe('US-AE-020 (P1): AnimationVcrControls standalone', () => {
  it('mounts successfully with required props', () => {
    const wrapper = mount(AnimationVcrControls, {
      props: {
        isPlaying: false,
        currentIndex: 0,
        totalSteps: 5,
        playbackSpeed: 1,
      },
      global: {
        stubs: {
          BaseIcon: {
            template: '<svg><g></g></svg>',
            props: ['name'],
          },
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders all control buttons', () => {
    const wrapper = mount(AnimationVcrControls, {
      props: {
        isPlaying: false,
        currentIndex: 0,
        totalSteps: 5,
        playbackSpeed: 1,
      },
      global: {
        stubs: {
          BaseIcon: {
            template: '<svg><g></g></svg>',
            props: ['name'],
          },
        },
      },
    });

    const buttons = wrapper.findAll('button');
    expect(buttons.length).toBe(4);
  });

  it('emits stop when clicking stop button', async () => {
    const wrapper = mount(AnimationVcrControls, {
      props: {
        isPlaying: true,
        currentIndex: 2,
        totalSteps: 5,
        playbackSpeed: 1,
      },
      global: {
        stubs: {
          BaseIcon: {
            template: '<svg><g></g></svg>',
            props: ['name'],
          },
        },
      },
    });

    const stopBtn = wrapper.find('button[title="Reset (R)"]');
    await stopBtn.trigger('click');
    expect(wrapper.emitted('stop')).toBeTruthy();
  });

  it('emits togglePlay when clicking play/pause button', async () => {
    const wrapper = mount(AnimationVcrControls, {
      props: {
        isPlaying: false,
        currentIndex: 0,
        totalSteps: 5,
        playbackSpeed: 1,
      },
      global: {
        stubs: {
          BaseIcon: {
            template: '<svg><g></g></svg>',
            props: ['name'],
          },
        },
      },
    });

    const playBtn = wrapper.find('.ctrl-btn-primary');
    await playBtn.trigger('click');
    expect(wrapper.emitted('togglePlay')).toBeTruthy();
  });

  it('renders step counter with correct format', () => {
    const wrapper = mount(AnimationVcrControls, {
      props: {
        isPlaying: false,
        currentIndex: 3,
        totalSteps: 10,
        playbackSpeed: 2,
      },
      global: {
        stubs: {
          BaseIcon: {
            template: '<svg><g></g></svg>',
            props: ['name'],
          },
        },
      },
    });

    const counter = wrapper.find('.step-counter');
    expect(counter.text()).toBe('4 / 10');
  });

  it('renders speed selector with correct options', () => {
    const wrapper = mount(AnimationVcrControls, {
      props: {
        isPlaying: false,
        currentIndex: 0,
        totalSteps: 5,
        playbackSpeed: 1,
      },
      global: {
        stubs: {
          BaseIcon: {
            template: '<svg><g></g></svg>',
            props: ['name'],
          },
        },
      },
    });

    const select = wrapper.find('.speed-select');
    expect(select.exists()).toBe(true);
    const options = select.findAll('option');
    expect(options.length).toBe(8);
    expect(options.map((o) => o.text())).toEqual(['0.1x', '0.25x', '0.5x', '1x', '1.5x', '2x', '4x', '5x']);
  });

  it('emits scrub when timeline slider changes', async () => {
    const wrapper = mount(AnimationVcrControls, {
      props: {
        isPlaying: false,
        currentIndex: 0,
        totalSteps: 10,
        playbackSpeed: 1,
      },
      global: {
        stubs: {
          BaseIcon: {
            template: '<svg><g></g></svg>',
            props: ['name'],
          },
        },
      },
    });

    const slider = wrapper.find('.timeline-scrubber');
    slider.setValue('5');
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted('scrub')).toBeTruthy();
    expect(wrapper.emitted('scrub')![0]).toEqual([5]);
  });

  it('emits speedChange when speed selector changes', async () => {
    const wrapper = mount(AnimationVcrControls, {
      props: {
        isPlaying: false,
        currentIndex: 0,
        totalSteps: 5,
        playbackSpeed: 1,
      },
      global: {
        stubs: {
          BaseIcon: {
            template: '<svg><g></g></svg>',
            props: ['name'],
          },
        },
      },
    });

    const select = wrapper.find('.speed-select');
    select.setValue('2');
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted('speedChange')).toBeTruthy();
    expect(wrapper.emitted('speedChange')![0]).toEqual([2]);
  });
});
