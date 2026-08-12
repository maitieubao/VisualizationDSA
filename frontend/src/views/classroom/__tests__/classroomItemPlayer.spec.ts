// @vitest-environment jsdom
// CR-010 (P1): CONTRACT SPEC — ClassroomItemPlayer.
//  - nạp item Lesson/Quiz/Codelab → render sub-component tương ứng
//  - CustomLesson → branch riêng (không dead-end "không được hỗ trợ")
//  - emit complete/next/back
//  - hasNext tính từ curriculum prop (CR-004 — không hardcode false)
//  - footer status theo item.status (CR-023) + ẩn nút hoàn thành khi Completed
import { describe, it, expect, vi, afterEach } from 'vitest';
import { nextTick } from 'vue';
import { mount, type VueWrapper } from '@vue/test-utils';
import ClassroomItemPlayer from '../components/ClassroomItemPlayer.vue';

const BaseIconStub = {
  name: 'BaseIcon',
  props: ['name', 'class'],
  template: '<svg class="base-icon-stub"><title>{{ name }}</title></svg>',
};

const TheoryStub = {
  name: 'LessonStepTheory',
  props: ['title', 'content', 'sandboxType', 'sandboxConfig'],
  template: '<div class="theory-stub">{{ title }} | {{ content }}</div>',
};

const QuizStub = {
  name: 'LessonStepQuiz',
  props: ['quizId', 'maxAttempts'],
  template: '<div class="quiz-stub">{{ quizId }} ({{ maxAttempts }})</div>',
};

const CodelabStub = {
  name: 'LessonStepCodeLab',
  props: ['codelabId', 'maxAttempts'],
  template: '<div class="codelab-stub">{{ codelabId }} ({{ maxAttempts }})</div>',
};

interface TestItem {
  id: string;
  itemType: string;
  status?: string;
  isRequired?: boolean;
  overrideTitle?: string;
  lessonTitle?: string;
  quizTitle?: string;
  codelabTitle?: string;
  customLessonTitle?: string;
  contentMd?: string;
  sandboxType?: string;
  quizId?: string;
  codelabId?: string;
  maxAttempts?: number;
  xpReward?: number;
}

interface TestCurriculum {
  modules: Array<{ items: Array<{ id: string }> }>;
}

function makeItem(overrides: Partial<TestItem>): TestItem {
  return {
    id: 'i1',
    itemType: 'Lesson',
    status: 'NotStarted',
    isRequired: true,
    overrideTitle: 'Bài 1',
    ...overrides,
  };
}

function makeCurriculum(itemIds: string[]): TestCurriculum {
  return { modules: [{ items: itemIds.map((id) => ({ id })) }] };
}

let wrapper: VueWrapper | null = null;

async function mountPlayer(item: TestItem, curriculum: TestCurriculum | null): Promise<VueWrapper> {
  wrapper = mount(ClassroomItemPlayer, {
    attachTo: document.body,
    global: {
      components: { BaseIcon: BaseIconStub },
      stubs: {
        LessonStepTheory: TheoryStub,
        LessonStepQuiz: QuizStub,
        LessonStepCodeLab: CodelabStub,
      },
    },
    props: {
      item,
      classroomId: 'c1',
      curriculum,
    },
  });
  await nextTick();
  return wrapper;
}

describe('ClassroomItemPlayer — Contract Spec (CR-010)', () => {
  afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
  });

  it('Lesson → render LessonStepTheory với title + contentMd + sandboxType', async () => {
    const w = await mountPlayer(
      makeItem({ itemType: 'Lesson', contentMd: '# Lý thuyết', sandboxType: 'Array' }),
      makeCurriculum(['i1'])
    );

    const theory = w.findComponent({ name: 'LessonStepTheory' });
    expect(theory.exists()).toBe(true);
    expect(theory.props('title')).toBe('Bài 1');
    expect(theory.props('content')).toBe('# Lý thuyết');
    expect(theory.props('sandboxType')).toBe('Array');
  });

  it('Quiz → render LessonStepQuiz với quizId + maxAttempts', async () => {
    const w = await mountPlayer(
      makeItem({ itemType: 'Quiz', quizId: 'q1', maxAttempts: 2 }),
      makeCurriculum(['i1'])
    );

    const quiz = w.findComponent({ name: 'LessonStepQuiz' });
    expect(quiz.exists()).toBe(true);
    expect(quiz.props('quizId')).toBe('q1');
    expect(quiz.props('maxAttempts')).toBe(2);
  });

  it('Codelab → render LessonStepCodeLab với codelabId + maxAttempts', async () => {
    const w = await mountPlayer(
      makeItem({ itemType: 'Codelab', codelabId: 'cl1', maxAttempts: 3 }),
      makeCurriculum(['i1'])
    );

    const codelab = w.findComponent({ name: 'LessonStepCodeLab' });
    expect(codelab.exists()).toBe(true);
    expect(codelab.props('codelabId')).toBe('cl1');
    expect(codelab.props('maxAttempts')).toBe(3);
  });

  it('CustomLesson → branch riêng hiển thị title + customContent (không dead-end CR-006)', async () => {
    const w = await mountPlayer(
      makeItem({ itemType: 'CustomLesson', overrideTitle: '', customLessonTitle: 'Bài tự soạn', contentMd: 'Nội dung tự soạn' }),
      makeCurriculum(['i1'])
    );

    expect(w.text()).toContain('Bài tự soạn');
    expect(w.text()).toContain('Nội dung tự soạn');
    expect(w.text()).not.toContain('không được hỗ trợ');
  });

  it('itemType lạ → thông báo "Loại bài học không được hỗ trợ"', async () => {
    const w = await mountPlayer(
      makeItem({ itemType: 'Viz' }),
      makeCurriculum(['i1'])
    );

    expect(w.text()).toContain('Loại bài học không được hỗ trợ: Viz');
  });

  it('nút back → emit "back"', async () => {
    const w = await mountPlayer(makeItem({}), makeCurriculum(['i1']));
    await w.findAll('button')[0].trigger('click');
    expect(w.emitted('back')).toBeTruthy();
  });

  it('nút "Đánh dấu hoàn thành" → emit "complete"', async () => {
    const w = await mountPlayer(makeItem({}), makeCurriculum(['i1']));
    const completeBtn = w.findAll('button').find((b) => b.text().includes('Đánh dấu hoàn thành'));
    expect(completeBtn).toBeTruthy();
    await completeBtn!.trigger('click');
    expect(w.emitted('complete')).toBeTruthy();
  });

  it('hasNext=true (còn bài sau trong curriculum) → hiện "Bài tiếp theo", click → emit "next" (CR-004)', async () => {
    const w = await mountPlayer(
      makeItem({ id: 'i1' }),
      makeCurriculum(['i1', 'i2'])
    );

    const nextBtn = w.findAll('button').find((b) => b.text().includes('Bài tiếp theo'));
    expect(nextBtn).toBeTruthy();
    await nextBtn!.trigger('click');
    expect(w.emitted('next')).toBeTruthy();
  });

  it('hasNext=false (item cuối curriculum) → không "Bài tiếp theo", hiện "Đã hoàn thành module!" (CR-004)', async () => {
    const w = await mountPlayer(
      makeItem({ id: 'i2' }),
      makeCurriculum(['i1', 'i2'])
    );

    expect(w.text()).toContain('Đã hoàn thành module!');
    const nextBtn = w.findAll('button').find((b) => b.text().includes('Bài tiếp theo'));
    expect(nextBtn).toBeUndefined();
  });

  it('curriculum rỗng/thiếu → hasNext=false, hiện "Đã hoàn thành module!"', async () => {
    const w = await mountPlayer(makeItem({ id: 'i1' }), makeCurriculum([]));
    expect(w.text()).toContain('Đã hoàn thành module!');
  });

  it('status=Completed → footer "Tiến độ: Đã hoàn thành" + ẨN nút hoàn thành (CR-023)', async () => {
    const w = await mountPlayer(
      makeItem({ id: 'i1', status: 'Completed' }),
      makeCurriculum(['i1'])
    );

    expect(w.text()).toContain('Tiến độ: Đã hoàn thành');
    expect(w.text()).not.toContain('Tiến độ: Đang học');
    const completeBtn = w.findAll('button').find((b) => b.text().includes('Đánh dấu hoàn thành'));
    expect(completeBtn).toBeUndefined();
  });

  it('status=InProgress → footer "Tiến độ: Đang học"', async () => {
    const w = await mountPlayer(
      makeItem({ id: 'i1', status: 'InProgress' }),
      makeCurriculum(['i1'])
    );
    expect(w.text()).toContain('Tiến độ: Đang học');
  });

  it('status=NotStarted → footer "Tiến độ: Chưa bắt đầu"', async () => {
    const w = await mountPlayer(
      makeItem({ id: 'i1', status: 'NotStarted' }),
      makeCurriculum(['i1'])
    );
    expect(w.text()).toContain('Tiến độ: Chưa bắt đầu');
  });
});
