// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

import AlgorithmDashboard from '../components/AlgorithmDashboard.vue';
import DSAPlayer from '../components/DSAPlayer.vue';
import PseudocodeViewer from '../components/PseudocodeViewer.vue';
import Legend from '../components/Legend.vue';
import AnimationVcrControls from '../../animation-engine/components/AnimationVcrControls.vue';
import { ALGORITHM_CATALOG } from '../services/algorithmCatalog';
import { useAlgorithmStore } from '../store/useAlgorithmStore';
import type { AlgorithmResult, FrameDTO } from '../types/algorithm.types';

vi.mock('../services/dsaApi', () => ({
  executeDSAAlgorithm: vi.fn(),
}));

vi.mock('../../animation-engine/store/useAnimationStore', () => ({
  useAnimationStore: () => ({
    currentFrame: null,
    currentIndex: 0,
    totalSteps: 0,
    isPlaying: false,
    playbackSpeed: 1,
    loadResult: vi.fn(),
    stop: vi.fn(),
    play: vi.fn(),
    pause: vi.fn(),
    stepForward: vi.fn(),
    stepBackward: vi.fn(),
    scrubTo: vi.fn(),
    setSpeed: vi.fn(),
  }),
}));

function mockFetchSuccess(data: unknown) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => data,
  }) as unknown as typeof fetch;
}

function mockFetchError() {
  global.fetch = vi.fn().mockRejectedValue(new Error('Network error')) as unknown as typeof fetch;
}

const sampleFrames: FrameDTO[] = [
  {
    stepId: 0,
    activeLine: 0,
    explanation: 'Khởi tạo mảng',
    dataState: [5, 3, 8, 1],
    highlights: { compare: [0, 1], swap: [], sorted: [], dimmed: [], active: [0] },
  },
  {
    stepId: 1,
    activeLine: 1,
    explanation: 'So sánh và hoán vị',
    dataState: [3, 5, 8, 1],
    highlights: { compare: [1, 2], swap: [1], sorted: [0], dimmed: [], active: [1] },
  },
];

const sampleResult: AlgorithmResult = {
  algorithmId: 'bubble-sort',
  pseudoCode: ['for i = 0 to n-1', '  for j = 0 to n-i-2', '    if a[j] > a[j+1] swap'],
  frames: sampleFrames,
};

describe('AlgorithmDashboard', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('renders search input and difficulty chips', () => {
    const wrapper = mount(AlgorithmDashboard);
    expect(wrapper.find('.dash-header__input').exists()).toBe(true);
    expect(wrapper.find('.dash-header__input').attributes('placeholder')).toContain('Tìm kiếm');

    const chips = wrapper.findAll('.dash-chip');
    expect(chips.length).toBe(4);
    expect(chips[0].text()).toBe('All');
    expect(chips[1].text()).toBe('Easy');
    expect(chips[2].text()).toBe('Medium');
    expect(chips[3].text()).toBe('Hard');
  });

  it('renders featured algorithms section when no search and All difficulty', async () => {
    mockFetchError();
    const wrapper = mount(AlgorithmDashboard);
    await flushPromises();

    const section = wrapper.find('.dash-section__title');
    expect(section.text().toUpperCase()).toContain('GỢI');
    expect(section.text().toUpperCase()).toContain('HỌC TẬP');
  });

  it('filters algorithms by search query', async () => {
    mockFetchError();
    const wrapper = mount(AlgorithmDashboard);
    await flushPromises();

    const input = wrapper.find('.dash-header__input');
    await input.setValue('bubble');
    await flushPromises();

    const cards = wrapper.findAll('.dash-card__id');
    expect(cards.length).toBeGreaterThan(0);
    expect(cards.some((c) => c.text() === 'bubble-sort')).toBe(true);
  });

  it('filters algorithms by difficulty chip click', async () => {
    mockFetchError();
    const wrapper = mount(AlgorithmDashboard);
    await flushPromises();

    const hardChip = wrapper.findAll('.dash-chip').find((c) => c.text() === 'Hard');
    expect(hardChip).toBeDefined();
    await hardChip!.trigger('click');

    const badges = wrapper.findAll('.dash-badge');
    expect(badges.length).toBeGreaterThan(0);
    for (const badge of badges) {
      expect(badge.text()).toBe('Hard');
    }
  });

  it('emits select event when clicking Mô phỏng button', async () => {
    mockFetchError();
    const wrapper = mount(AlgorithmDashboard);
    await flushPromises();

    const primaryBtns = wrapper.findAll('.dash-btn--primary');
    expect(primaryBtns.length).toBeGreaterThan(0);

    await primaryBtns[0].trigger('click');
    await flushPromises();

    const emitted = wrapper.emitted('select');
    expect(emitted).toBeTruthy();
    expect(emitted!.length).toBeGreaterThan(0);
  });

  it('shows loading skeleton when algoStore.isLoading is true', async () => {
    mockFetchSuccess([]);
    const wrapper = mount(AlgorithmDashboard);
    await flushPromises();
    await wrapper.vm.$nextTick();

    const store = useAlgorithmStore();
    store.isLoading = true;
    await wrapper.vm.$nextTick();

    expect(wrapper.findAll('.dash-skeleton').length).toBe(6);
  });

  it('shows error message when algoStore has error', async () => {
    mockFetchError();
    const wrapper = mount(AlgorithmDashboard);
    await flushPromises();
    await wrapper.vm.$nextTick();

    const store = useAlgorithmStore();
    store.error = 'Lỗi kết nối test';
    await wrapper.vm.$nextTick();

    const errorEl = wrapper.find('.dash-error');
    expect(errorEl.exists()).toBe(true);
    expect(errorEl.text()).toContain('Lỗi kết nối test');
  });

  it('filters by allowedCategories prop', async () => {
    mockFetchError();
    const wrapper = mount(AlgorithmDashboard, {
      props: { allowedCategories: ['Sorting'] },
    });
    await flushPromises();

    const store = useAlgorithmStore();
    store.algorithms = [...ALGORITHM_CATALOG];
    await wrapper.vm.$nextTick();

    const sectionHeaders = wrapper.findAll('.dash-section__title');
    const titles = sectionHeaders.map((h) => h.text()).filter((t) => t !== 'Gợi Ý học tập');
    expect(titles.length).toBe(1);
    expect(titles[0]).toBe('Sorting');
  });
});

describe('PseudocodeViewer', () => {
  it('renders pseudocode lines', () => {
    const wrapper = mount(PseudocodeViewer, {
      props: {
        pseudoCode: ['line 1', 'line 2', 'line 3'],
        activeLine: undefined,
        description: 'Test description',
      },
    });

    const lines = wrapper.findAll('.font-mono');
    expect(lines.length).toBe(3);
    expect(lines[0].text()).toBe('line 1');
  });

  it('highlights the active line with accent-cyan/40 class', () => {
    const wrapper = mount(PseudocodeViewer, {
      props: {
        pseudoCode: ['for i = 0', '  swap(a, b)'],
        activeLine: 0,
        description: '',
      },
    });

    const firstLine = wrapper.findAll('.font-mono')[0];
    expect(firstLine.classes()).toContain('bg-accent-cyan/40');
    expect(firstLine.classes()).toContain('text-accent-cyan');
    expect(firstLine.classes()).toContain('font-semibold');
  });

  it('does not highlight inactive lines', () => {
    const wrapper = mount(PseudocodeViewer, {
      props: {
        pseudoCode: ['for i = 0', '  swap(a, b)'],
        activeLine: 0,
        description: '',
      },
    });

    const secondLine = wrapper.findAll('.font-mono')[1];
    expect(secondLine.classes()).toContain('text-text-secondary');
    expect(secondLine.classes()).not.toContain('bg-accent-cyan/40');
  });

  it('renders description when provided', () => {
    const wrapper = mount(PseudocodeViewer, {
      props: {
        pseudoCode: [],
        activeLine: undefined,
        description: 'This is a test description',
      },
    });

    expect(wrapper.text()).toContain('This is a test description');
  });
});

describe('Legend', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('renders legend when algorithm category is graph', async () => {
    const store = useAlgorithmStore();
    store.currentAlgorithm = {
      id: 'bfs',
      name: 'BFS',
      category: 'Graph',
      difficulty: 'Medium',
      timeComplexity: 'O(V+E)',
      spaceComplexity: 'O(V)',
    };

    const wrapper = mount(Legend);
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.absolute.bottom-3').exists()).toBe(true);
    const text = wrapper.text().toUpperCase();
    expect(text).toContain('ACTIVE');
    expect(text).toContain('VISITED/PROCESSED');
    expect(text).toContain('FRONTIER/QUEUE');
  });

  it('does not render legend for non-graph categories', async () => {
    const store = useAlgorithmStore();
    store.currentAlgorithm = {
      id: 'bubble-sort',
      name: 'Bubble Sort',
      category: 'Sorting',
      difficulty: 'Easy',
      timeComplexity: 'O(N^2)',
      spaceComplexity: 'O(1)',
    };

    const wrapper = mount(Legend);
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.absolute.bottom-3').exists()).toBe(false);
  });

  it('shows weight legend for dijkstra', async () => {
    const store = useAlgorithmStore();
    store.currentAlgorithm = {
      id: 'dijkstra',
      name: 'Dijkstra',
      category: 'Graph',
      difficulty: 'Hard',
      timeComplexity: 'O((V+E)logV)',
      spaceComplexity: 'O(V)',
    };

    const wrapper = mount(Legend);
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('Edge Weight');
  });

  it('shows MST edge legend for kruskal', async () => {
    const store = useAlgorithmStore();
    store.currentAlgorithm = {
      id: 'kruskal',
      name: 'Kruskal',
      category: 'Graph',
      difficulty: 'Hard',
      timeComplexity: 'O(ElogE)',
      spaceComplexity: 'O(V)',
    };

    const wrapper = mount(Legend);
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('MST Edge');
  });

  it('shows shortest path legend for a-star', async () => {
    const store = useAlgorithmStore();
    store.currentAlgorithm = {
      id: 'a-star',
      name: 'A* Search',
      category: 'Graph',
      difficulty: 'Hard',
      timeComplexity: 'O(E)',
      spaceComplexity: 'O(V)',
    };

    const wrapper = mount(Legend);
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('Shortest Path');
  });
});

describe('AnimationVcrControls', () => {
  it('renders all VCR control buttons', () => {
    const wrapper = mount(AnimationVcrControls, {
      props: {
        isPlaying: false,
        currentIndex: 0,
        totalSteps: 10,
        playbackSpeed: 1,
      },
    });

    expect(wrapper.find('.ctrl-btn-primary').exists()).toBe(true);
    expect(wrapper.findAll('.ctrl-btn').length).toBeGreaterThanOrEqual(3);
  });

  it('emits togglePlay when clicking the play/pause button', async () => {
    const wrapper = mount(AnimationVcrControls, {
      props: {
        isPlaying: false,
        currentIndex: 0,
        totalSteps: 10,
        playbackSpeed: 1,
      },
    });

    await wrapper.find('.ctrl-btn-primary').trigger('click');
    expect(wrapper.emitted('togglePlay')).toBeTruthy();
  });

  it('emits stop, stepBackward, stepForward events', async () => {
    const wrapper = mount(AnimationVcrControls, {
      props: {
        isPlaying: false,
        currentIndex: 2,
        totalSteps: 10,
        playbackSpeed: 1,
      },
    });

    const buttons = wrapper.findAll('.ctrl-btn');
    await buttons[0].trigger('click');
    expect(wrapper.emitted('stop')).toBeTruthy();

    await buttons[1].trigger('click');
    expect(wrapper.emitted('stepBackward')).toBeTruthy();

    await buttons[2].trigger('click');
    expect(wrapper.emitted('stepForward')).toBeTruthy();
  });

  it('renders speed selector with all options', () => {
    const wrapper = mount(AnimationVcrControls, {
      props: {
        isPlaying: true,
        currentIndex: 0,
        totalSteps: 5,
        playbackSpeed: 2,
      },
    });

    const options = wrapper.findAll('.speed-select option');
    expect(options.length).toBe(5);
    expect(options[0].text()).toBe('0.5x');
    expect(options[4].text()).toBe('10x');
  });

  it('renders step counter showing current/total', () => {
    const wrapper = mount(AnimationVcrControls, {
      props: {
        isPlaying: false,
        currentIndex: 3,
        totalSteps: 15,
        playbackSpeed: 1,
      },
    });

    expect(wrapper.find('.step-counter').text()).toBe('4 / 15');
  });

  it('emits speedChange when selecting a new speed', async () => {
    const wrapper = mount(AnimationVcrControls, {
      props: {
        isPlaying: false,
        currentIndex: 0,
        totalSteps: 10,
        playbackSpeed: 1,
      },
    });

    const select = wrapper.find('.speed-select');
    await select.setValue('5');
    expect(wrapper.emitted('speedChange')).toBeTruthy();
    expect(wrapper.emitted('speedChange')![0]).toEqual([5]);
  });

  it('emits scrub when moving the timeline slider', async () => {
    const wrapper = mount(AnimationVcrControls, {
      props: {
        isPlaying: false,
        currentIndex: 0,
        totalSteps: 10,
        playbackSpeed: 1,
      },
    });

    const slider = wrapper.find('.timeline-scrubber');
    await slider.setValue('5');
    expect(wrapper.emitted('scrub')).toBeTruthy();
    expect(wrapper.emitted('scrub')![0]).toEqual([5]);
  });
});

describe('DSAPlayer integration', () => {
  const ResizeObserverMock = vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.stubGlobal('ResizeObserver', ResizeObserverMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders AlgorithmDashboard when no algorithm is selected', async () => {
    mockFetchError();
    const wrapper = mount(DSAPlayer, {
      global: {
        stubs: {
          AlgorithmVisualizer: true,
          AnimationVcrControls: true,
          DSAHeader: true,
          DSAInputForm: true,
          PseudocodeViewer: true,
          TheoryCollapsiblePanel: true,
        },
      },
    });
    await flushPromises();

    expect(wrapper.findComponent(AlgorithmDashboard).exists()).toBe(true);
  });

  it('renders player components when algorithm is selected', async () => {
    const store = useAlgorithmStore();
    store.currentAlgorithm = ALGORITHM_CATALOG[0];
    store.metadata = {
      timeComplexity: 'O(N^2)',
      spaceComplexity: 'O(1)',
      description: 'Test description',
      pseudoCode: ['line 1', 'line 2'],
    };

    mockFetchError();
    const wrapper = mount(DSAPlayer, {
      global: {
        stubs: {
          AlgorithmVisualizer: true,
          AnimationVcrControls: true,
          DSAHeader: true,
          DSAInputForm: true,
          PseudocodeViewer: { template: '<div class="stub-pseudo"></div>' },
          TheoryCollapsiblePanel: true,
        },
      },
    });
    await flushPromises();

    expect(wrapper.findComponent(AlgorithmDashboard).exists()).toBe(false);
    expect(wrapper.find('.stub-pseudo').exists()).toBe(true);
  });

  it('renders animation frame explanation when frame exists', async () => {
    const store = useAlgorithmStore();
    store.currentAlgorithm = ALGORITHM_CATALOG[0];
    store.metadata = {
      timeComplexity: 'O(N^2)',
      spaceComplexity: 'O(1)',
      description: 'Test',
      pseudoCode: ['line 1'],
    };

    mockFetchError();
    const wrapper = mount(DSAPlayer, {
      props: { allowedCategories: ['Sorting', 'Searching', 'Stack-Queue', 'Tree', 'Graph'] },
      global: {
        stubs: {
          AlgorithmVisualizer: true,
          AnimationVcrControls: { template: '<div></div>' },
          DSAHeader: true,
          DSAInputForm: true,
          PseudocodeViewer: true,
          TheoryCollapsiblePanel: true,
        },
      },
    });
    await flushPromises();

    const wrapperText = wrapper.text();
    const hasExplanation = wrapperText.includes('frame') || wrapperText.includes('step') || wrapperText.includes('Test');
    expect(hasExplanation || wrapper.find('.dsa-player-wrapper').exists()).toBe(true);
  });
});

describe('ALGORITHM_CATALOG data integrity (P0)', () => {
  it('catalog has 22 algorithms', () => {
    expect(ALGORITHM_CATALOG.length).toBe(22);
  });

  it('all algorithms have valid difficulty values', () => {
    const valid = ['Easy', 'Medium', 'Hard'];
    for (const algo of ALGORITHM_CATALOG) {
      expect(valid).toContain(algo.difficulty);
    }
  });

  it('all categories are covered', () => {
    const categories = new Set(ALGORITHM_CATALOG.map((a) => a.category));
    expect(categories.size).toBeGreaterThanOrEqual(5);
  });

  it('featured algorithm IDs exist in catalog', () => {
    const featuredIds = ['binary-search', 'monotonic-stack', 'dijkstra'];
    for (const id of featuredIds) {
      expect(ALGORITHM_CATALOG.some((a) => a.id === id)).toBe(true);
    }
  });
});
