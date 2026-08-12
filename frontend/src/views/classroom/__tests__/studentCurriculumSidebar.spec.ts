// @vitest-environment jsdom
// LS-018 (P1): CONTRACT SPEC — StudentCurriculumSidebar.
//  - unlockAt thật (vi.setSystemTime) → item/module locked
//  - prerequisite chưa completed → locked (LS-012)
//  - item ẩn (isHidden) bị lọc khỏi danh sách + progress (LS-007)
//  - module không có item required → không bị khóa (LS-010)
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { nextTick } from 'vue';
import { mount, type VueWrapper } from '@vue/test-utils';
import StudentCurriculumSidebar from '../components/StudentCurriculumSidebar.vue';

const BaseIconStub = {
  name: 'BaseIcon',
  props: ['name', 'class'],
  template: '<svg class="base-icon-stub"><title>{{ name }}</title></svg>',
};

interface TestItem {
  id: string;
  itemType: string;
  status: string;
  isRequired: boolean;
  isHidden: boolean;
  overrideTitle?: string;
  lessonTitle?: string;
  quizTitle?: string;
  codelabTitle?: string;
  unlockAt?: string | null;
  dueAt?: string | null;
  maxAttempts?: number | null;
  isSequential?: boolean;
  prerequisiteItemId?: string | null;
  isUnlocked?: boolean;
  customLessonTitle?: string;
}

interface TestModule {
  id: string;
  title: string;
  isHidden?: boolean;
  unlockAt?: string | null;
  items: TestItem[];
}

interface TestCurriculum {
  classroomId: string;
  classroomName: string;
  modules: TestModule[];
}

function makeItem(overrides: Partial<TestItem> = {}): TestItem {
  return {
    id: 'i1',
    itemType: 'Lesson',
    status: 'NotStarted',
    isRequired: true,
    isHidden: false,
    overrideTitle: 'Bài học 1',
    isSequential: false,
    prerequisiteItemId: null,
    isUnlocked: undefined,
    unlockAt: null,
    dueAt: null,
    maxAttempts: null,
    ...overrides,
  };
}

function makeModule(overrides: Partial<TestModule> = {}): TestModule {
  return {
    id: 'm1',
    title: 'Module 1',
    items: [makeItem()],
    ...overrides,
  };
}

function makeCurriculum(modules: TestModule[]): TestCurriculum {
  return { classroomId: 'c1', classroomName: 'Lớp 12A1', modules };
}

let wrapper: VueWrapper | null = null;

async function mountSidebar(curriculum: TestCurriculum, currentItemId: string | null = null): Promise<VueWrapper> {
  wrapper = mount(StudentCurriculumSidebar, {
    attachTo: document.body,
    global: { components: { BaseIcon: BaseIconStub } },
    props: {
      classroomId: 'c1',
      curriculum,
      currentItemId,
    },
  });
  await nextTick();
  return wrapper;
}

describe('StudentCurriculumSidebar — Contract Spec (LS-018)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
    vi.useRealTimers();
  });

  it('hiển thị overall progress theo items hiển thị (completed/total)', async () => {
    const curriculum = makeCurriculum([
      makeModule({
        items: [
          makeItem({ id: 'i1', status: 'Completed' }),
          makeItem({ id: 'i2', status: 'NotStarted', overrideTitle: 'Bài 2' }),
        ],
      }),
    ]);
    const w = await mountSidebar(curriculum);

    expect(w.text()).toContain('1/2 bài học đã hoàn thành');
    expect(w.text()).toContain('50%');
  });

  it('module không có item required → KHÔNG bị khóa (LS-010)', async () => {
    const curriculum = makeCurriculum([
      makeModule({
        id: 'm1',
        items: [makeItem({ id: 'i1', status: 'NotStarted', isRequired: false })],
      }),
      makeModule({
        id: 'm2',
        title: 'Module Tự Do',
        items: [makeItem({ id: 'i2', isRequired: false, overrideTitle: 'Bài mở' })],
      }),
    ]);
    const w = await mountSidebar(curriculum);

    const m2Header = w.findAll('.module-header')[1];
    expect(m2Header.attributes('disabled')).toBeUndefined();
    expect(m2Header.attributes('aria-disabled')).toBeUndefined();

    await m2Header.trigger('click');
    await nextTick();
    expect(w.text()).toContain('Bài mở');
  });

  it('item có unlockAt tương lai → locked, click không navigate (vi.setSystemTime)', async () => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date('2026-08-01T00:00:00Z'));
      const curriculum = makeCurriculum([
        makeModule({
          items: [
            makeItem({ id: 'i1', status: 'Completed' }),
            makeItem({
              id: 'i2',
              status: 'NotStarted',
              overrideTitle: 'Bài mở khóa sau',
              unlockAt: '2026-08-10T00:00:00Z',
            }),
          ],
        }),
      ]);
      const w = await mountSidebar(curriculum);
      await w.findAll('.module-header')[0].trigger('click');
      await nextTick();

      const items = w.findAll('.curriculum-item');
      expect(items.length).toBe(2);
      expect(items[1].text()).toContain('Đã khóa');

      await items[1].trigger('click');
      await nextTick();
      expect(w.emitted('navigate')).toBeUndefined();
    } finally {
      vi.useRealTimers();
    }
  });

  it('item có unlockAt quá khứ → mở, click navigate emit item id', async () => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date('2026-08-12T00:00:00Z'));
      const curriculum = makeCurriculum([
        makeModule({
          items: [
            makeItem({ id: 'i1', status: 'NotStarted', unlockAt: '2026-08-01T00:00:00Z' }),
          ],
        }),
      ]);
      const w = await mountSidebar(curriculum);
      await w.findAll('.module-header')[0].trigger('click');
      await nextTick();

      const items = w.findAll('.curriculum-item');
      expect(items[0].text()).toContain('Chưa làm');
      await items[0].trigger('click');
      expect(w.emitted('navigate')?.[0]).toEqual(['i1']);
    } finally {
      vi.useRealTimers();
    }
  });

  it('item isHidden → bị lọc khỏi danh sách + không tính vào progress (LS-007)', async () => {
    const curriculum = makeCurriculum([
      makeModule({
        items: [
          makeItem({ id: 'i1', status: 'Completed' }),
          makeItem({ id: 'i2', status: 'NotStarted', overrideTitle: 'Bài ẩn', isHidden: true }),
          makeItem({ id: 'i3', status: 'NotStarted', overrideTitle: 'Bài 3' }),
        ],
      }),
    ]);
    const w = await mountSidebar(curriculum);
    await w.findAll('.module-header')[0].trigger('click');
    await nextTick();

    const items = w.findAll('.curriculum-item');
    expect(items.map(i => i.text()).join(' ')).not.toContain('Bài ẩn');
    expect(items.length).toBe(2);
    // Hidden không tính: 2 visible, 1 completed → 50%
    expect(w.text()).toContain('1/2 bài học đã hoàn thành');
    expect(w.text()).toContain('50%');
  });

  it('module hidden → items của module bị lọc khỏi overall progress (LS-007 module)', async () => {
    const curriculum = makeCurriculum([
      makeModule({
        id: 'm1',
        items: [makeItem({ id: 'i1', status: 'Completed' })],
      }),
      makeModule({
        id: 'm2',
        title: 'Module ẩn',
        isHidden: true,
        items: [makeItem({ id: 'i2', status: 'Completed' })],
      }),
    ]);
    const w = await mountSidebar(curriculum);

    expect(w.text()).toContain('1/1 bài học đã hoàn thành');
    expect(w.text()).toContain('100%');
  });

  it('prerequisite chưa completed → item locked dù sequential (LS-012)', async () => {
    const curriculum = makeCurriculum([
      makeModule({
        items: [
          makeItem({ id: 'i1', status: 'Completed', overrideTitle: 'Bài trước' }),
          makeItem({
            id: 'i2',
            status: 'NotStarted',
            overrideTitle: 'Bài phụ thuộc',
            isSequential: true,
            prerequisiteItemId: 'i9',
          }),
        ],
      }),
    ]);
    const w = await mountSidebar(curriculum);
    await w.findAll('.module-header')[0].trigger('click');
    await nextTick();

    const items = w.findAll('.curriculum-item');
    expect(items[1].text()).toContain('Đã khóa');
    await items[1].trigger('click');
    await nextTick();
    expect(w.emitted('navigate')).toBeUndefined();
  });

  it('prerequisite đã completed → item mở (isSequential + prerequisiteItemId hợp lệ)', async () => {
    const curriculum = makeCurriculum([
      makeModule({
        items: [
          makeItem({ id: 'i1', status: 'Completed', overrideTitle: 'Bài trước' }),
          makeItem({
            id: 'i2',
            status: 'NotStarted',
            overrideTitle: 'Bài tiếp',
            isSequential: true,
            prerequisiteItemId: 'i1',
          }),
        ],
      }),
    ]);
    const w = await mountSidebar(curriculum);
    await w.findAll('.module-header')[0].trigger('click');
    await nextTick();

    const items = w.findAll('.curriculum-item');
    expect(items[1].text()).toContain('Chưa làm');
    await items[1].trigger('click');
    expect(w.emitted('navigate')?.[0]).toEqual(['i2']);
  });

  it('isUnlocked=false từ backend → item khóa dù prerequisite completed (ưu tiên backend)', async () => {
    const curriculum = makeCurriculum([
      makeModule({
        items: [
          makeItem({ id: 'i1', status: 'Completed', overrideTitle: 'Bài trước' }),
          makeItem({
            id: 'i2',
            status: 'NotStarted',
            overrideTitle: 'Bài backend khóa',
            isSequential: true,
            prerequisiteItemId: 'i1',
            isUnlocked: false,
          }),
        ],
      }),
    ]);
    const w = await mountSidebar(curriculum);
    await w.findAll('.module-header')[0].trigger('click');
    await nextTick();

    const items = w.findAll('.curriculum-item');
    expect(items[1].text()).toContain('Đã khóa');
    await items[1].trigger('click');
    await nextTick();
    expect(w.emitted('navigate')).toBeUndefined();
  });

  it('isUnlocked=true từ backend → item mở dù prerequisite chưa completed', async () => {
    const curriculum = makeCurriculum([
      makeModule({
        items: [
          makeItem({ id: 'i1', status: 'NotStarted', overrideTitle: 'Bài trước chưa xong' }),
          makeItem({
            id: 'i2',
            status: 'NotStarted',
            overrideTitle: 'Bài backend mở',
            isSequential: true,
            prerequisiteItemId: 'i1',
            isUnlocked: true,
          }),
        ],
      }),
    ]);
    const w = await mountSidebar(curriculum);
    await w.findAll('.module-header')[0].trigger('click');
    await nextTick();

    const items = w.findAll('.curriculum-item');
    expect(items[1].text()).toContain('Chưa làm');
    await items[1].trigger('click');
    expect(w.emitted('navigate')?.[0]).toEqual(['i2']);
  });

  it('CustomLesson → hiển thị badge "Tự soạn" + fallback title customLessonTitle', async () => {
    const curriculum = makeCurriculum([
      makeModule({
        items: [
          makeItem({
            id: 'i1',
            itemType: 'CustomLesson',
            status: 'NotStarted',
            overrideTitle: '',
            customLessonTitle: 'Bài tự soạn 1',
          }),
        ],
      }),
    ]);
    const w = await mountSidebar(curriculum);
    await w.findAll('.module-header')[0].trigger('click');
    await nextTick();

    expect(w.text()).toContain('Bài tự soạn 1');
    expect(w.text()).toContain('Tự soạn');
    const items = w.findAll('.curriculum-item');
    await items[0].trigger('click');
    expect(w.emitted('navigate')?.[0]).toEqual(['i1']);
  });
});
