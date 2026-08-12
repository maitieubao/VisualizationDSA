// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { mount, flushPromises } from '@vue/test-utils';

import BaseIcon from '../../shared/components/BaseIcon.vue';

import AlgorithmDashboard from '../../features/dsa-modules/components/AlgorithmDashboard.vue';
import PseudocodeViewer from '../../features/dsa-modules/components/PseudocodeViewer.vue';
import { useAlgorithmStore } from '../../features/dsa-modules/store/useAlgorithmStore';

import LoginModal from '../../features/auth/components/LoginModal.vue';
import { useAuthStore } from '../../features/auth/store/useAuthStore';

import HelpButton from '../../features/guided-tour/components/HelpButton.vue';
import GuidedTourOverlay from '../../features/guided-tour/components/GuidedTourOverlay.vue';
import VirtualMascot from '../../features/guided-tour/components/VirtualMascot.vue';
import { useGuidedTourStore } from '../../features/guided-tour/store/useGuidedTourStore';

vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => ({ path: '/sorting' })),
}));

vi.mock('../../../utils/emojiParser', () => ({
  parseEmojiToSvg: vi.fn((text: string) => text),
}));

vi.mock('../../features/auth/services/statelessAuthApi', () => ({
  statelessAuthApi: {
    login: vi.fn(async () => ({
      accessToken: 'fake-token',
      refreshToken: 'fake-refresh',
      expiresIn: 3600,
      user: {
        id: '1',
        email: 'demo@visualizationdsa.dev',
        username: 'demo_user',
        totalXP: 100,
        currentLevel: 2,
        streakDays: 5,
        createdAt: '2024-01-01',
        badges: [],
        isPremium: false,
        role: 'Student',
        nickname: 'Demo',
        bio: 'Hello',
        university: 'FPT',
      },
    })),
    register: vi.fn(async () => ({
      accessToken: 'fake-token',
      refreshToken: 'fake-refresh',
      expiresIn: 3600,
      user: {
        id: '2',
        email: 'new@visualizationdsa.dev',
        username: 'new_user',
        totalXP: 0,
        currentLevel: 1,
        streakDays: 0,
        createdAt: '2024-01-01',
        badges: [],
        isPremium: false,
        role: 'Student',
      },
    })),
    refresh: vi.fn(async () => ({
      accessToken: 'new-fake-token',
      refreshToken: 'new-fake-refresh',
      expiresIn: 3600,
      user: {
        id: '1',
        email: 'demo@visualizationdsa.dev',
        username: 'demo_user',
        totalXP: 100,
        currentLevel: 2,
        streakDays: 5,
        createdAt: '2024-01-01',
        badges: [],
        isPremium: false,
        role: 'Student',
      },
    })),
    logout: vi.fn(async () => undefined),
    getMe: vi.fn(async () => ({
      id: '1',
      email: 'demo@visualizationdsa.dev',
      username: 'demo_user',
      totalXP: 100,
      currentLevel: 2,
      streakDays: 5,
      createdAt: '2024-01-01',
      badges: [],
      isPremium: false,
      role: 'Student',
    })),
    updateProfile: vi.fn(async () => ({
      id: '1',
      email: 'demo@visualizationdsa.dev',
      username: 'demo_user',
      totalXP: 100,
      currentLevel: 2,
      streakDays: 5,
      createdAt: '2024-01-01',
      badges: [],
      isPremium: false,
      role: 'Student',
    })),
    impersonateUser: vi.fn(async () => ({
      accessToken: 'impersonated-token',
      refreshToken: 'impersonated-refresh',
      expiresIn: 3600,
      user: {
        id: 'student-456',
        email: 'student@dsa.com',
        username: 'student_user',
        totalXP: 200,
        currentLevel: 3,
        streakDays: 1,
        createdAt: '2024-02-02',
        badges: [],
        isPremium: false,
        role: 'Student',
        nickname: 'StudentNick',
        bio: 'Hi',
        university: 'FPT',
      },
    })),
    changePassword: vi.fn(async () => ({ message: 'Password changed successfully' })),
  },
}));

vi.mock('../../features/auth/services/authApi', () => ({
  login: vi.fn(async () => ({
    accessToken: 'fake-token',
    refreshToken: 'fake-refresh',
    expiresIn: 3600,
    user: {
      id: '1',
      email: 'demo@visualizationdsa.dev',
      username: 'demo_user',
      totalXP: 0,
      currentLevel: 1,
      streakDays: 0,
      createdAt: '2024-01-01',
      badges: [],
      isPremium: false,
      role: 'Student',
    },
  })),
  logout: vi.fn(async () => undefined),
  register: vi.fn(async () => ({
    accessToken: 'fake-token',
    refreshToken: 'fake-refresh',
    expiresIn: 3600,
    user: {
      id: '1',
      email: 'demo@visualizationdsa.dev',
      username: 'demo_user',
      totalXP: 0,
      currentLevel: 1,
      streakDays: 0,
      createdAt: '2024-01-01',
      badges: [],
      isPremium: false,
      role: 'Student',
    },
  })),
  refreshAccessToken: vi.fn(async () => ({
    accessToken: 'new-fake-token',
    refreshToken: 'new-fake-refresh',
    expiresIn: 3600,
    user: {
      id: '1',
      email: 'demo@visualizationdsa.dev',
      username: 'demo_user',
      totalXP: 0,
      currentLevel: 1,
      streakDays: 0,
      createdAt: '2024-01-01',
      badges: [],
      isPremium: false,
      role: 'Student',
    },
  })),
  getMe: vi.fn(async () => ({
    id: '1',
    email: 'demo@visualizationdsa.dev',
    username: 'demo_user',
    totalXP: 0,
    currentLevel: 1,
    streakDays: 0,
    createdAt: '2024-01-01',
    badges: [],
    isPremium: false,
    role: 'Student',
  })),
}));

function mockFetchError() {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));
}

function mockFetchSuccess(data: unknown) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: async () => data,
  }));
}

// CU-028 (P2): restore fetch/localStorage — vi.stubGlobal + unstubAllGlobals + clear() sau mỗi test.
afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
});

// =============================================================================
// DSA MODULES TESTS (P2)
// =============================================================================
describe('AlgorithmDashboard + PseudocodeViewer — P2 Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('DSA-001 (P2): Dashboard render đầy đủ', async () => {
    mockFetchError();
    const wrapper = mount(AlgorithmDashboard);
    await flushPromises();

    expect(wrapper.find('.dash-root').exists()).toBe(true);
    expect(wrapper.find('.dash-header__input').exists()).toBe(true);
    expect(wrapper.find('.dash-header__search').exists()).toBe(true);
  });

  it('DSA-002 (P2): Search lọc thuật toán', async () => {
    mockFetchError();
    const wrapper = mount(AlgorithmDashboard);
    await flushPromises();

    const input = wrapper.find('.dash-header__input');
    await input.setValue('binary');
    await flushPromises();

    const cards = wrapper.findAll('.dash-card__id');
    expect(cards.length).toBeGreaterThan(0);
    expect(cards.some((c) => c.text() === 'binary-search')).toBe(true);
  });

  it('DSA-003 (P2): Phím "/" focus vào search input', async () => {
    mockFetchError();
    const wrapper = mount(AlgorithmDashboard, {
      attachTo: document.body,
    });
    await flushPromises();

    const searchInput = wrapper.find('.dash-header__input').element as HTMLInputElement;
    expect(document.activeElement).not.toBe(searchInput);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: '/' }));
    await flushPromises();

    expect(document.activeElement).toBe(searchInput);
  });

  it('DSA-005 (P2): Difficulty filter All/Easy/Medium/Hard', async () => {
    mockFetchError();
    const wrapper = mount(AlgorithmDashboard);
    await flushPromises();

    const chips = wrapper.findAll('.dash-chip');
    expect(chips.length).toBe(4);
    expect(chips[0].text()).toBe('All');
    expect(chips[1].text()).toBe('Easy');
    expect(chips[2].text()).toBe('Medium');
    expect(chips[3].text()).toBe('Hard');

    await chips[3].trigger('click');
    await flushPromises();

    const badges = wrapper.findAll('.dash-badge');
    for (const badge of badges) {
      expect(badge.text()).toBe('Hard');
    }
  });

  it('DSA-006 (P2): Featured algorithms "Gợi ý học tập"', async () => {
    mockFetchError();
    const wrapper = mount(AlgorithmDashboard);
    await flushPromises();

    const title = wrapper.find('.dash-section__title');
    expect(title.text()).toContain('Gợi ý học tập');
  });

  it('DSA-011 (P2): PseudocodeViewer render mã giả', () => {
    const wrapper = mount(PseudocodeViewer, {
      props: {
        pseudoCode: ['procedure BINARY_SEARCH(A, n, x)', '  left = 0', '  right = n - 1', '  while left <= right:'],
        activeLine: 1,
        description: 'Tìm kiếm nhị phân',
      },
    });

    expect(wrapper.find('.font-mono').exists()).toBe(true);
    const lines = wrapper.findAll('.font-mono');
    expect(lines.length).toBe(4);
    expect(lines[1].classes()).toContain('bg-accent-cyan/40');
    expect(wrapper.text()).toContain('Tìm kiếm nhị phân');
  });
});

// =============================================================================
// AUTH TESTS (P2)
// =============================================================================
describe('LoginModal + useAuthStore — P2 Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    document.body.innerHTML = '';
  });

  it('AU-001 (P2): LoginModal render khi visible=true', async () => {
    const wrapper = mount(LoginModal, {
      props: { visible: true },
      global: { components: { BaseIcon } },
      attachTo: document.body,
    });
    await flushPromises();

    expect(document.querySelector('.modal-backdrop')).not.toBeNull();
    expect(document.querySelector('.modal-card')).not.toBeNull();
    expect(document.querySelector('#auth-email')).not.toBeNull();
    expect(document.querySelector('#auth-password')).not.toBeNull();
  });

  it('AU-003 (P2): Toggle register mode', async () => {
    const wrapper = mount(LoginModal, {
      props: { visible: true },
      global: { components: { BaseIcon } },
      attachTo: document.body,
    });
    await flushPromises();

    expect(document.querySelector('#auth-username')).toBeNull();

    const toggleBtn = document.querySelector('.toggle-link');
    expect(toggleBtn).not.toBeNull();
    toggleBtn!.dispatchEvent(new Event('click'));
    await flushPromises();

    expect(document.querySelector('#auth-username')).not.toBeNull();
  });

  it('AU-004 (P2): Hiển thị error message khi authError', async () => {
    const authStore = useAuthStore();
    authStore.authError = 'Sai email hoặc mật khẩu';

    mount(LoginModal, {
      props: { visible: true },
      global: { components: { BaseIcon } },
      attachTo: document.body,
    });
    await flushPromises();

    const errorEl = document.querySelector('.modal-error');
    expect(errorEl).not.toBeNull();
    expect(errorEl!.textContent).toContain('Sai email hoặc mật khẩu');
  });

  it('AU-006 (P2): Hiển thị demo account credentials', async () => {
    mount(LoginModal, {
      props: { visible: true },
      global: { components: { BaseIcon } },
      attachTo: document.body,
    });
    await flushPromises();

    const demoInfo = document.querySelector('.demo-info');
    expect(demoInfo).not.toBeNull();
    expect(demoInfo!.textContent).toContain('demo@visualizationdsa.dev');
    expect(demoInfo!.textContent).toContain('Demo@2024');
  });
});

// =============================================================================
// GUIDED TOUR TESTS (P2)
// =============================================================================
describe('GuidedTour + HelpButton — P2 Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    vi.restoreAllMocks();
    vi.useFakeTimers();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('GT-001 (P2): HelpButton click bắt đầu tour', async () => {
    const store = useGuidedTourStore();
    expect(store.isActive).toBe(false);

    const wrapper = mount(HelpButton, {
      props: { tourKey: '/sorting' },
    });

    await wrapper.find('button').trigger('click');

    expect(store.isActive).toBe(true);
    expect(store.activePageKey).toBe('/sorting');
  });

  it('GT-003 (P2): Typewriter effect hiển thị description', async () => {
    const store = useGuidedTourStore();
    store.startPageTour('/sorting', true);

    const wrapper = mount(GuidedTourOverlay, {
      global: { components: { BaseIcon } },
      attachTo: document.body,
    });
    await flushPromises();

    expect(wrapper.find('.guided-tour-overlay-root').exists()).toBe(true);

    vi.advanceTimersByTime(2000);
    await flushPromises();

    const descEl = wrapper.find('.text-xs.text-text-secondary');
    expect(descEl.exists()).toBe(true);
    expect(descEl.text().length).toBeGreaterThan(0);
  });

  it('GT-005 (P2): Progress dots theo steps', async () => {
    const store = useGuidedTourStore();
    store.startPageTour('/sorting', true);

    const wrapper = mount(GuidedTourOverlay, {
      global: { components: { BaseIcon } },
      attachTo: document.body,
    });
    await flushPromises();

    const dots = wrapper.findAll('.w-1\\.5.h-1\\.5.rounded-full');
    expect(dots.length).toBe(store.currentSteps.length);
    expect(dots[0].classes()).toContain('bg-accent-cyan');
  });

  it('GT-007 (P2): Voice wave animation khi đang nói', async () => {
    const store = useGuidedTourStore();
    store.startPageTour('/sorting', true);

    const wrapper = mount(GuidedTourOverlay, {
      global: { components: { BaseIcon } },
      attachTo: document.body,
    });
    await flushPromises();

    const voiceWave = wrapper.find('.voice-wave');
    expect(voiceWave.exists()).toBe(true);

    const bars = voiceWave.findAll('span');
    expect(bars.length).toBe(4);
  });

  it('GT-012 (CU-037): Responsive card tự định vị — assert giá trị cụ thể (không style truthy)', async () => {
    // Dựng phần tử spotlight thật cho step đầu tour /sorting ([data-tour-id="algo-tab-switch"]).
    const target = document.createElement('div');
    target.setAttribute('data-tour-id', 'algo-tab-switch');
    target.scrollIntoView = vi.fn();
    Object.defineProperty(target, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({
        top: 100, left: 50, width: 120, height: 40, right: 170, bottom: 140, x: 50, y: 100,
        toJSON: () => ({}),
      }),
    });
    document.body.appendChild(target);

    const store = useGuidedTourStore();
    store.startPageTour('/sorting', true);

    const wrapper = mount(GuidedTourOverlay, {
      global: { components: { BaseIcon } },
      attachTo: document.body,
    });
    await flushPromises();

    vi.advanceTimersByTime(150); // updateSpotlight(false) lần đầu
    vi.advanceTimersByTime(350); // updateSpotlight(true) sau scrollIntoView
    await flushPromises();

    const dialogCard = wrapper.find('.dialog-card');
    expect(dialogCard.exists()).toBe(true);

    const style = dialogCard.attributes('style') ?? '';
    // jsdom viewport 1024x768 + rect(top 100,left 50,w 120,h 40):
    // placement bottom → top = 140+8+12 = 160px; left = 50+60-225 → clamp về 16px; cardWidth = 450px.
    expect(style).toContain('position: absolute');
    expect(style).toContain('width: 450px');
    expect(style).toContain('top: 160px');
    expect(style).toContain('left: 16px');

    wrapper.unmount();
    target.remove();
  });
});
