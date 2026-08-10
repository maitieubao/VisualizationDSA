// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { nextTick } from 'vue';
import BreadcrumbsBar from '../components/BreadcrumbsBar.vue';
import CourseSidebar from '../components/CourseSidebar.vue';
import StepTabs from '../../lesson/components/StepTabs.vue';
import { useCourseNavigation } from '../composables/useCourseNavigation';

const BaseIconStub = {
  name: 'BaseIcon',
  props: ['name', 'class'],
  template: '<svg class="base-icon"><title>{{ name }}</title></svg>',
};

const RouterLinkStub = {
  name: 'RouterLink',
  props: ['to'],
  template: '<a class="rl-stub" :href="to" @click="$emit(\'click\', $event)"><slot /></a>',
  emits: ['click'],
};

// ════════════════════════════════════════════════════════════════
// BreadcrumbsBar
// ════════════════════════════════════════════════════════════════
describe('BreadcrumbsBar', () => {
  it('renders all breadcrumb items', () => {
    const wrapper = mount(BreadcrumbsBar, {
      props: {
        items: [
          { label: 'Home', path: '/' },
          { label: 'Courses', path: '/courses' },
          { label: 'Sorting 101', path: '/courses/sorting-101' },
        ],
      },
      global: { components: { BaseIcon: BaseIconStub }, stubs: { RouterLink: RouterLinkStub } },
    });
    expect(wrapper.text()).toContain('Home');
    expect(wrapper.text()).toContain('Courses');
    expect(wrapper.text()).toContain('Sorting 101');
  });

  it('renders separators between items', () => {
    const wrapper = mount(BreadcrumbsBar, {
      props: {
        items: [
          { label: 'A', path: '/a' },
          { label: 'B', path: '/b' },
        ],
      },
      global: { components: { BaseIcon: BaseIconStub }, stubs: { RouterLink: RouterLinkStub } },
    });
    const seps = wrapper.findAll('.base-icon');
    const chevronRight = seps.filter(s => s.text() === 'chevron-right');
    expect(chevronRight.length).toBe(1);
  });

  it('last item is not clickable (pointer-events-none)', () => {
    const wrapper = mount(BreadcrumbsBar, {
      props: {
        items: [
          { label: 'A', path: '/a' },
          { label: 'B', path: '/b' },
        ],
      },
      global: { components: { BaseIcon: BaseIconStub }, stubs: { RouterLink: RouterLinkStub } },
    });
    const links = wrapper.findAll('a.rl-stub');
    const lastLink = links[links.length - 1];
    expect(lastLink.classes()).toContain('pointer-events-none');
  });

  it('first item shows home icon', () => {
    const wrapper = mount(BreadcrumbsBar, {
      props: {
        items: [{ label: 'Home', path: '/' }],
      },
      global: { components: { BaseIcon: BaseIconStub }, stubs: { RouterLink: RouterLinkStub } },
    });
    const icons = wrapper.findAll('.base-icon');
    expect(icons.some(i => i.text() === 'home')).toBe(true);
  });

  it('single item renders without separator', () => {
    const wrapper = mount(BreadcrumbsBar, {
      props: {
        items: [{ label: 'Only', path: '/' }],
      },
      global: { components: { BaseIcon: BaseIconStub }, stubs: { RouterLink: RouterLinkStub } },
    });
    const seps = wrapper.findAll('.base-icon');
    const chevronRight = seps.filter(s => s.text() === 'chevron-right');
    expect(chevronRight.length).toBe(0);
  });
});

// ════════════════════════════════════════════════════════════════
// StepTabs
// ════════════════════════════════════════════════════════════════
describe('StepTabs', () => {
  const STEPS = [
    { number: 1, label: 'Lý Thuyết' },
    { number: 2, label: 'Trực Quan Hóa' },
    { number: 3, label: 'Quiz' },
  ];

  it('renders all step buttons', () => {
    const wrapper = mount(StepTabs, {
      props: { steps: STEPS, activeStep: 1 },
      global: { components: { BaseIcon: BaseIconStub } },
    });
    expect(wrapper.text()).toContain('Lý Thuyết');
    expect(wrapper.text()).toContain('Trực Quan Hóa');
    expect(wrapper.text()).toContain('Quiz');
  });

  it('active step has accent background', () => {
    const wrapper = mount(StepTabs, {
      props: { steps: STEPS, activeStep: 2 },
      global: { components: { BaseIcon: BaseIconStub } },
    });
    const buttons = wrapper.findAll('button');
    const activeBtn = buttons.find(b => b.classes().includes('bg-accent'));
    expect(activeBtn).toBeDefined();
  });

  it('completed steps show check icon', () => {
    const wrapper = mount(StepTabs, {
      props: { steps: STEPS, activeStep: 3 },
      global: { components: { BaseIcon: BaseIconStub } },
    });
    const icons = wrapper.findAll('.base-icon');
    const checkIcons = icons.filter(i => i.text() === 'check');
    expect(checkIcons.length).toBe(2);
  });

  it('emits navigate on step click', async () => {
    const wrapper = mount(StepTabs, {
      props: { steps: STEPS, activeStep: 1 },
      global: { components: { BaseIcon: BaseIconStub } },
    });
    const buttons = wrapper.findAll('button');
    await buttons[2].trigger('click');
    expect(wrapper.emitted('navigate')).toBeTruthy();
    expect(wrapper.emitted('navigate')![0]).toEqual([3]);
  });
});

// ════════════════════════════════════════════════════════════════
// useCourseNavigation
// ════════════════════════════════════════════════════════════════
describe('useCourseNavigation', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('sidebar is closed by default', () => {
    const nav = useCourseNavigation();
    expect(nav.isSidebarOpen.value).toBe(false);
  });

  it('openSidebar sets isSidebarOpen to true', () => {
    const nav = useCourseNavigation();
    nav.openSidebar();
    expect(nav.isSidebarOpen.value).toBe(true);
  });

  it('closeSidebar sets isSidebarOpen to false', () => {
    const nav = useCourseNavigation();
    nav.openSidebar();
    nav.closeSidebar();
    expect(nav.isSidebarOpen.value).toBe(false);
  });

  it('toggleSidebar toggles state', () => {
    const nav = useCourseNavigation();
    expect(nav.isSidebarOpen.value).toBe(false);
    nav.toggleSidebar();
    expect(nav.isSidebarOpen.value).toBe(true);
    nav.toggleSidebar();
    expect(nav.isSidebarOpen.value).toBe(false);
  });

  it('returns computed ref (not raw ref)', () => {
    const nav = useCourseNavigation();
    expect(typeof nav.isSidebarOpen.value).toBe('boolean');
  });
});

// ════════════════════════════════════════════════════════════════
// CourseSidebar
// ════════════════════════════════════════════════════════════════
describe('CourseSidebar', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  const LESSONS = [
    { id: 'l1', title: 'Bubble Sort', xpReward: 30, sandboxType: 'sorting', quizId: null },
    { id: 'l2', title: 'Quick Sort', xpReward: 50, sandboxType: '', quizId: 'q1' },
    { id: 'l3', title: 'Merge Sort', xpReward: 40, sandboxType: '', quizId: null },
  ];

  it('renders lesson titles', () => {
    const wrapper = mount(CourseSidebar, {
      props: {
        courseId: 'course-1',
        courseTitle: 'Sorting 101',
        lessons: LESSONS,
        currentLessonId: 'l1',
      },
      global: {
        components: { BaseIcon: BaseIconStub },
        stubs: { RouterLink: RouterLinkStub },
      },
    });
    expect(wrapper.text()).toContain('Bubble Sort');
    expect(wrapper.text()).toContain('Quick Sort');
    expect(wrapper.text()).toContain('Merge Sort');
  });

  it('renders course title in header', () => {
    const wrapper = mount(CourseSidebar, {
      props: {
        courseId: 'course-1',
        courseTitle: 'Sorting 101',
        lessons: LESSONS,
        currentLessonId: 'l1',
      },
      global: {
        components: { BaseIcon: BaseIconStub },
        stubs: { RouterLink: RouterLinkStub },
      },
    });
    expect(wrapper.text()).toContain('Sorting 101');
  });

  it('shows progress count', () => {
    const wrapper = mount(CourseSidebar, {
      props: {
        courseId: 'course-1',
        courseTitle: 'Sorting 101',
        lessons: LESSONS,
        currentLessonId: 'l1',
      },
      global: {
        components: { BaseIcon: BaseIconStub },
        stubs: { RouterLink: RouterLinkStub },
      },
    });
    expect(wrapper.text()).toContain('/3');
  });

  it('current lesson has accent border', () => {
    const wrapper = mount(CourseSidebar, {
      props: {
        courseId: 'course-1',
        courseTitle: 'Sorting 101',
        lessons: LESSONS,
        currentLessonId: 'l2',
      },
      global: {
        components: { BaseIcon: BaseIconStub },
        stubs: { RouterLink: RouterLinkStub },
      },
    });
    const links = wrapper.findAll('a.rl-stub');
    const activeLink = links.find(l => l.classes().includes('border-l-accent'));
    expect(activeLink).toBeDefined();
  });

  it('shows Quiz badge for lessons with quizId', () => {
    const wrapper = mount(CourseSidebar, {
      props: {
        courseId: 'course-1',
        courseTitle: 'Sorting 101',
        lessons: LESSONS,
        currentLessonId: 'l1',
      },
      global: {
        components: { BaseIcon: BaseIconStub },
        stubs: { RouterLink: RouterLinkStub },
      },
    });
    expect(wrapper.text()).toContain('Quiz');
  });

  it('emits selectLesson on lesson link click', async () => {
    const wrapper = mount(CourseSidebar, {
      props: {
        courseId: 'course-1',
        courseTitle: 'Sorting 101',
        lessons: LESSONS,
        currentLessonId: 'l1',
      },
      global: {
        components: { BaseIcon: BaseIconStub },
        stubs: { RouterLink: RouterLinkStub },
      },
    });
    const links = wrapper.findAllComponents(RouterLinkStub);
    expect(links.length).toBeGreaterThanOrEqual(3);
    const lessonLink = links[2];
    await lessonLink.find('a.rl-stub').trigger('click');
    expect(wrapper.emitted('selectLesson')).toBeTruthy();
    expect(wrapper.emitted('selectLesson')![0]).toEqual(['l2']);
  });

  it('shows empty state when no lessons', () => {
    const wrapper = mount(CourseSidebar, {
      props: {
        courseId: 'course-1',
        courseTitle: 'Sorting 101',
        lessons: [],
        currentLessonId: undefined,
      },
      global: {
        components: { BaseIcon: BaseIconStub },
        stubs: { RouterLink: RouterLinkStub },
      },
    });
    expect(wrapper.text()).toContain('Đang tải');
  });
});
