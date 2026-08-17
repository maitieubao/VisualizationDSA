// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { useAuthStore } from '../../../features/auth/store/useAuthStore';

// ─── DASHBOARD ───
import DashboardView from '../DashboardView.vue';

// ─── LANDING ───
import LandingView from '../../landing/LandingView.vue';

// ─── PROFILE ───
import ProfileView from '../../profile/ProfileView.vue';

// ─── Profile Tabs ───
import ProfileGeneralTab from '../../profile/ProfileGeneralTab.vue';
import ProfileHistoryTab from '../../profile/ProfileHistoryTab.vue';
import ProfileSecurityTab from '../../profile/ProfileSecurityTab.vue';

// Mock router
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), currentRoute: { value: { query: {} } } }),
  useRoute: () => ({ params: {}, query: {} }),
  RouterLink: { name: 'RouterLink', template: '<a class="router-link-stub"><slot /></a>' },
}));

// Mock authApi
vi.mock('../../../features/auth/services/authApi', () => ({
  updateProfile: vi.fn(async () => true),
  changePassword: vi.fn(async () => true),
  getAccessToken: vi.fn(() => 'fake-token'),
}));

// Mock courseApi
vi.mock('../../../features/courses/services/courseApi', () => ({
  fetchCourses: vi.fn(async () => []),
}));

function mountWithAuth(component: any, options: any = {}) {
  const pinia = createPinia();
  setActivePinia(pinia);
  const authStore = useAuthStore();
  // Set logged-in user
  (authStore as any).currentUser = { id: '1', username: 'testuser', email: 'test@example.com', role: 'Student', level: 3, xp: 450, nickname: 'Test', bio: '', university: '' };
  (authStore as any).isAuthenticated = true;
  (authStore as any)._token = 'fake';
  return mount(component, {
    global: {
      plugins: [pinia],
      stubs: { BaseIcon: { name: 'BaseIcon', template: '<svg class="base-icon-stub"><slot /></svg>' } },
    },
    ...options,
  });
}

describe('DashboardView', () => {
  it('renders personalized greeting with username', async () => {
    const wrapper = mountWithAuth(DashboardView);
    await flushPromises();
    expect(wrapper.text()).toContain('testuser');
  });

  it('shows user level and XP', async () => {
    const wrapper = mountWithAuth(DashboardView);
    await flushPromises();
    expect(wrapper.text()).toContain('Level');
    expect(wrapper.text()).toContain('XP');
  });

  it('renders 4 stats cards', async () => {
    const wrapper = mountWithAuth(DashboardView);
    await flushPromises();
    const cards = wrapper.findAll('.stat-card');
    // F9: card thứ 5 là Tim học tập (hearts) — test tên giữ nguyên vì lịch sử, assert 5.
    expect(cards.length).toBe(5);
  });

  it('shows 4 quickstart steps', async () => {
    const wrapper = mountWithAuth(DashboardView);
    await flushPromises();
    const steps = wrapper.findAll('.quickstart-item');
    expect(steps.length).toBe(4);
  });

  it('shows quickstart step numbers 1-4', async () => {
    const wrapper = mountWithAuth(DashboardView);
    await flushPromises();
    expect(wrapper.text()).toContain('1');
    expect(wrapper.text()).toContain('Bubble Sort');
  });

  it('shows role tag (Sinh viên)', async () => {
    const wrapper = mountWithAuth(DashboardView);
    await flushPromises();
    expect(wrapper.text()).toContain('Sinh viên');
  });
});

describe('LandingView', () => {
  it('renders hero title', () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const wrapper = mount(LandingView, {
      global: { plugins: [pinia], stubs: { BaseIcon: { name: 'BaseIcon', template: '<svg class="base-icon-stub"><slot /></svg>' } } },
    });
    expect(wrapper.text()).toContain('VisualizationDSA');
  });

  it('renders 8 feature modules', () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const wrapper = mount(LandingView, {
      global: { plugins: [pinia], stubs: { BaseIcon: { name: 'BaseIcon', template: '<svg class="base-icon-stub"><slot /></svg>' } } },
    });
    const features = wrapper.findAll('.feature-card');
    expect(features.length).toBe(8);
  });

  it('renders stats bar', () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const wrapper = mount(LandingView, {
      global: { plugins: [pinia], stubs: { BaseIcon: { name: 'BaseIcon', template: '<svg class="base-icon-stub"><slot /></svg>' } } },
    });
    const stats = wrapper.findAll('.stat-item');
    expect(stats.length).toBeGreaterThanOrEqual(3);
  });

  it('shows "Bắt đầu ngay" when not authenticated', () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const wrapper = mount(LandingView, {
      global: { plugins: [pinia], stubs: { BaseIcon: { name: 'BaseIcon', template: '<svg class="base-icon-stub"><slot /></svg>' } } },
    });
    expect(wrapper.text()).toContain('Bắt đầu ngay');
  });

  it('shows CTA button when authenticated', () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const authStore = useAuthStore();
    (authStore as any).isAuthenticated = true;
    const wrapper = mount(LandingView, {
      global: { plugins: [pinia], stubs: { BaseIcon: { name: 'BaseIcon', template: '<svg class="base-icon-stub"><slot /></svg>' } } },
    });
    expect(wrapper.find('.hero__cta--primary').exists()).toBe(true);
  });

  it('shows GitHub link', () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const wrapper = mount(LandingView, {
      global: { plugins: [pinia], stubs: { BaseIcon: { name: 'BaseIcon', template: '<svg class="base-icon-stub"><slot /></svg>' } } },
    });
    const link = wrapper.find('a[href*="github.com"]');
    expect(link.exists()).toBe(true);
  });
});

describe('ProfileView + Tabs', () => {
  it('renders settings modal with title', async () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const authStore = useAuthStore();
    (authStore as any).currentUser = { id: '1', username: 'testuser', email: 'test@example.com', role: 'Student', level: 3, xp: 450, nickname: 'Test', bio: '', university: '' };
    (authStore as any).isAuthenticated = true;
    const wrapper = mount(ProfileView, {
      global: { plugins: [pinia], stubs: { BaseIcon: { name: 'BaseIcon', template: '<svg class="base-icon-stub"><slot /></svg>' } } },
    });
    await flushPromises();
    expect(wrapper.text()).toContain('Cài đặt');
  });

  it('renders all 6 tab nav items', async () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const authStore = useAuthStore();
    (authStore as any).currentUser = { id: '1', username: 'testuser', email: 'test@example.com', role: 'Student', level: 3, xp: 450, nickname: 'Test', bio: '', university: '' };
    (authStore as any).isAuthenticated = true;
    const wrapper = mount(ProfileView, {
      global: { plugins: [pinia], stubs: { BaseIcon: { name: 'BaseIcon', template: '<svg class="base-icon-stub"><slot /></svg>' } } },
    });
    await flushPromises();
    const navItems = wrapper.findAll('[role="tab"]');
    expect(navItems.length).toBeGreaterThanOrEqual(5);
  });

  it('shows user PRO badge when premium', async () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const authStore = useAuthStore();
    (authStore as any).currentUser = { id: '1', username: 'testuser', email: 'test@example.com', role: 'Student', level: 3, xp: 450, isPremium: true, nickname: '', bio: '', university: '' };
    (authStore as any).isAuthenticated = true;
    (authStore as any).isPremium = true;
    const wrapper = mount(ProfileView, {
      global: { plugins: [pinia], stubs: { BaseIcon: { name: 'BaseIcon', template: '<svg class="base-icon-stub"><slot /></svg>' } } },
    });
    await flushPromises();
    expect(wrapper.text()).toContain('PRO');
  });

  it('shows General tab content', () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const authStore = useAuthStore();
    (authStore as any).currentUser = { id: '1', username: 'testuser', email: 'test@example.com', role: 'Student', level: 3, xp: 450, nickname: 'Test', bio: 'Hello', university: 'UIT' };
    (authStore as any).isAuthenticated = true;
    const wrapper = mount(ProfileGeneralTab, {
      global: { plugins: [pinia], stubs: { BaseIcon: { name: 'BaseIcon', template: '<svg class="base-icon-stub"><slot /></svg>' } } },
    });
    expect(wrapper.text()).toContain('test@example.com');
  });

  it('shows History tab with quiz attempts', () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const wrapper = mount(ProfileHistoryTab, {
      global: { plugins: [pinia], stubs: { BaseIcon: { name: 'BaseIcon', template: '<svg class="base-icon-stub"><slot /></svg>' } } },
    });
    expect(wrapper.text()).toContain('Quiz History');
  });

  it('shows Security tab with password form', () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const wrapper = mount(ProfileSecurityTab, {
      global: { plugins: [pinia], stubs: { BaseIcon: { name: 'BaseIcon', template: '<svg class="base-icon-stub"><slot /></svg>' } } },
    });
    expect(wrapper.text()).toContain('Security');
  });
});
